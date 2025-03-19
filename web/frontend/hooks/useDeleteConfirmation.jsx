import { useState, useCallback, useEffect } from 'react'
import { Modal, Text } from '@shopify/polaris'
import { useAppBridge } from '@shopify/app-bridge-react'

const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  nameOfItemToDelete,
  isDeleting,
  title = 'Delete item',
  message = 'Are you sure you would like to delete',
  confirmText = 'Delete',
  cancelText = 'Cancel'
}) => (
  <Modal
    open={isOpen}
    onClose={onClose}
    title={title}
    primaryAction={{
      content: confirmText,
      onAction: onConfirm,
      destructive: true,
      loading: isDeleting
    }}
    secondaryActions={[
      {
        content: cancelText,
        onAction: onClose
      }
    ]}>
    <Modal.Section>
      <Text>
        {message} <b>{nameOfItemToDelete}</b>?
      </Text>
    </Modal.Section>
  </Modal>
)

export const useDeleteConfirmation = ({
  onDeleteConfirm,
  messages = {
    title: 'Delete item',
    confirmText: 'Delete',
    cancelText: 'Cancel',
    deleteMessage: 'Are you sure you would like to delete',
    successMessage: 'Item deleted successfully',
    errorMessage: 'Error deleting item'
  },
  isPending = false,
  isSuccess = false
}) => {
  const { toast } = useAppBridge()
  const [isOpen, setIsOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)

  useEffect(() => {
    if (isSuccess) {
      toast.show(messages.successMessage)
      handleClose()
    }
  }, [isSuccess, messages.successMessage, toast])

  const handleDeleteClick = useCallback((item) => {
    setItemToDelete(item)
    setIsOpen(true)
  }, [])

  const handleClose = useCallback(() => {
    setIsOpen(false)
    setItemToDelete(null)
  }, [])

  const handleConfirm = useCallback(async () => {
    try {
      await onDeleteConfirm(itemToDelete)
    } catch (error) {
      toast.show(messages.errorMessage, true)
    }
  }, [onDeleteConfirm, itemToDelete, toast, messages])

  const DeleteModal = useCallback(
    () => (
      <DeleteConfirmationModal
        isOpen={isOpen}
        onClose={handleClose}
        onConfirm={handleConfirm}
        nameOfItemToDelete={itemToDelete?.nameOfItemToDelete || ''}
        isDeleting={isPending}
        title={messages.title}
        message={messages.deleteMessage}
        confirmText={messages.confirmText}
        cancelText={messages.cancelText}
      />
    ),
    [isOpen, handleClose, handleConfirm, itemToDelete, isPending, messages]
  )

  return {
    handleDeleteClick,
    DeleteModal,
    isDeleting: isPending,
    isOpen
  }
}
