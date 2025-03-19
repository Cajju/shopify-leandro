import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Modal } from '@shopify/polaris'
import { useEventTracking } from '@hooks/useEventTracking'

const LeaveConfirmationModal = ({ isOpen, onClose, onConfirm }) => (
  <Modal
    open={isOpen}
    onClose={onClose}
    title=""
    titleHidden
    primaryAction={{
      content: 'Leave page',
      destructive: true,
      onAction: onConfirm
    }}
    secondaryActions={[
      {
        content: 'Cancel',
        onAction: onClose
      }
    ]}
    small>
    <Modal.Section>
      <p style={{ margin: 0 }}>Your changes will be lost. Are you sure you want to leave?</p>
    </Modal.Section>
  </Modal>
)

export const useLeaveConfirmation = (isDirty) => {
  const navigate = useNavigate()
  const [showLeaveModal, setShowLeaveModal] = useState(false)
  const [pendingDiscard, setPendingDiscard] = useState(null)
  const { trackEvent, constants } = useEventTracking()

  const handleDiscardAttempt = useCallback(
    (discardConfirmed) => {
      if (isDirty) {
        trackEvent({
          event: constants.event.interaction.MODAL_OPENED,
          properties: {
            type: 'leave_confirmation',
            hasUnsavedChanges: true
          },
          resource: 'leave_confirmation'
        })
        setShowLeaveModal(true)
        setPendingDiscard(discardConfirmed)

        return false
      }
      if (discardConfirmed.navigateTo) {
        navigate(discardConfirmed.navigateTo)
      }

      return true
    },
    [isDirty, navigate]
  )

  const handleLeaveConfirm = useCallback(() => {
    setShowLeaveModal(false)
    if (pendingDiscard.navigateTo) {
      navigate(pendingDiscard.navigateTo)
    }

    pendingDiscard?.onDiscardConfirmed?.()
  }, [navigate, pendingDiscard])

  const handleLeaveCancel = useCallback(() => {
    setShowLeaveModal(false)
    setPendingDiscard(null)
  }, [])

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isDirty])

  const LeaveModal = useCallback(
    () => <LeaveConfirmationModal isOpen={showLeaveModal} onClose={handleLeaveCancel} onConfirm={handleLeaveConfirm} />,
    [showLeaveModal, handleLeaveCancel, handleLeaveConfirm]
  )

  return {
    handleDiscardAttempt,
    LeaveModal
  }
}
