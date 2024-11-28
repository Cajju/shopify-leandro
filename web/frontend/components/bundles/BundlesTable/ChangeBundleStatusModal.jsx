import React from 'react'
import { Modal } from '@shopify/polaris'

export default function ChangeBundleStatusModal({
  isOpen,
  onClose,
  onConfirm,
  bundleName,
  isLoading,
  newStatus = '___'
}) {
  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={`Set bundle as ${newStatus}`}
      primaryAction={{
        content: `Set as ${newStatus}`,
        onAction: onConfirm,
        loading: isLoading
      }}
      secondaryActions={[
        {
          content: 'Cancel',
          onAction: onClose
        }
      ]}>
      <Modal.Section>
        <p>
          Are you sure you would like to set the bundle <b>{bundleName}</b> as {newStatus}?
        </p>
      </Modal.Section>
    </Modal>
  )
}
