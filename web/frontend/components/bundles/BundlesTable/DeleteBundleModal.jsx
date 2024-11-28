import { useAppBridge } from '@shopify/app-bridge-react'
import { Modal, Text } from '@shopify/polaris'
import { useState } from 'react'

export function DeleteBundleModal({ isOpen, onClose, onDeleteConfirm, bundleName }) {
  const { toast } = useAppBridge()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDeleteConfirm = async () => {
    setIsDeleting(true)
    try {
      onDeleteConfirm()
      toast.show('Bundle deleted')
      onClose()
    } catch (error) {
      toast.show('Error deleting bundle', true)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Delete a bundle"
      primaryAction={{
        content: 'Delete bundle',
        onAction: handleDeleteConfirm,
        destructive: true,
        loading: isDeleting
      }}
      secondaryActions={[
        {
          content: 'Cancel',
          onAction: onClose
        }
      ]}>
      <Modal.Section>
        <Text>
          Are you sure you would like to delete the bundle <b>{bundleName}</b> ?
        </Text>
      </Modal.Section>
    </Modal>
  )
}
