import {
  Badge,
  Bleed,
  Button,
  Card,
  EmptyState,
  IndexFilters,
  IndexTable,
  InlineStack,
  Spinner,
  Text,
  Tooltip,
  useBreakpoints,
  useSetIndexFiltersMode
} from '@shopify/polaris'
import { useCallback, useState, useMemo } from 'react'
import { DeleteIcon, EditIcon, ToggleOffIcon, ViewIcon } from '@shopify/polaris-icons'
import { useNavigate } from 'react-router-dom'
import useBundles from '@rq-api/bundles/useBundles'
import { BUNDLE_TYPE_LABELS, STATUS_TYPES } from '@shared/utils/bundles/bundles-constants'
import { DeleteBundleModal } from './DeleteBundleModal'
import useDeleteBundle from '@rq-api/bundles/useDeleteBundle'
import useChangeBundleStatus from '@rq-api/bundles/useChangeBundleStatus'
import ChangeBundleStatusModal from './ChangeBundleStatusModal'
import EmptyState2Img from '@assets/empty-state-2.svg'

const getStatus = (selected) => {
  switch (selected) {
    case 1:
      return 'active'
    case 2:
      return 'draft'
    default:
      return 'all'
  }
}

const createTabs = (itemStrings) =>
  itemStrings.map((item, index) => ({
    content: item,
    index,
    onAction: () => {},
    id: `${item}-${index}`,
    key: `${item}-${index}`,
    isLocked: index === 0
  }))

const sortOptions = [
  { label: 'Bundle name', value: 'bundle name asc', directionLabel: 'A-Z' },
  { label: 'Bundle name', value: 'bundle name desc', directionLabel: 'Z-A' },
  { label: 'Type', value: 'type asc', directionLabel: 'A-Z' },
  { label: 'Type', value: 'type desc', directionLabel: 'Z-A' }
]

const resourceName = {
  singular: 'bundle',
  plural: 'bundles'
}

export default function BundlesTable() {
  const navigate = useNavigate()
  const { smDown } = useBreakpoints()

  const [itemStrings] = useState(['All', 'Active', 'Draft'])
  const { mode, setMode } = useSetIndexFiltersMode()
  const [selected, setSelected] = useState(0)
  const [sortSelected, setSortSelected] = useState(['bundle name asc'])
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [bundleToDelete, setBundleToDelete] = useState(null)

  const [bundleToChangeStatus, setBundleToChangeStatus] = useState(null)

  const { mutate: deleteBundle } = useDeleteBundle()
  const { mutate: changeBundleStatus, isPending: isPendingBundleStatusChange } = useChangeBundleStatus()

  const status = getStatus(selected)
  const tabs = useMemo(() => createTabs(itemStrings), [itemStrings])

  const {
    data: bundles,
    isLoading: isLoadingBundles,
    isFetching: isFetchingBundles,
    isSuccess: isSuccessBundles,
    error: bundlesError
  } = useBundles(status)

  const bundleDeleteCancel = () => {
    setBundleToDelete(null)
    setIsDeleteModalOpen(false)
  }

  const onDeleteClick = (bundle) => {
    setBundleToDelete(bundle)
    setIsDeleteModalOpen(true)
  }

  const rowMarkup = useMemo(
    () =>
      isSuccessBundles &&
      bundles.map(({ _id, txtBundleName, status, bundleType }, index) => (
        <IndexTable.Row id={_id} key={_id} position={index}>
          <IndexTable.Cell>
            <Text variant="bodyMd" fontWeight="bold" as="span">
              {txtBundleName}
            </Text>
          </IndexTable.Cell>
          <IndexTable.Cell>
            <Badge
              tone={status === 'active' ? 'success' : 'info'}
              progress={status === 'active' ? 'complete' : 'incomplete'}>
              {status}
            </Badge>
          </IndexTable.Cell>
          <IndexTable.Cell>{BUNDLE_TYPE_LABELS[bundleType]}</IndexTable.Cell>
          <IndexTable.Cell>
            <InlineStack gap="100">
              <Tooltip content="Edit">
                <Button icon={EditIcon} variant="tertiary" onClick={() => navigate(`bundles/${_id}`)} />
              </Tooltip>
              <Tooltip content="Delete">
                <Button icon={DeleteIcon} variant="tertiary" onClick={() => onDeleteClick({ _id, txtBundleName })} />
              </Tooltip>
              <Tooltip content="View">
                <Button icon={ViewIcon} variant="tertiary" />
              </Tooltip>
              <Tooltip content="Activate">
                <Button
                  icon={ToggleOffIcon}
                  variant="tertiary"
                  onClick={() =>
                    setBundleToChangeStatus({
                      bundleId: _id,
                      newStatus: status === STATUS_TYPES.ACTIVE ? STATUS_TYPES.DRAFT : STATUS_TYPES.ACTIVE,
                      onSuccess: () => setBundleToChangeStatus(null)
                    })
                  }
                />
              </Tooltip>
            </InlineStack>
          </IndexTable.Cell>
        </IndexTable.Row>
      )),
    [bundles, isDeleteModalOpen, bundleDeleteCancel]
  )

  const isLoading = isLoadingBundles || isFetchingBundles

  const pageContent = useMemo(() => {
    if (isLoading) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
          <Spinner accessibilityLabel="Loading bundles" size="large" />
        </div>
      )
    }

    if (bundlesError) {
      return <div>Error: {bundlesError.message}</div>
    }

    if (bundles.length === 0) {
      return (
        <EmptyState heading={`No ${status} bundles`} image={EmptyState2Img}>
          <p>There are no bundles with the {status} status. Try selecting a different status or create a new bundle.</p>
        </EmptyState>
      )
    }

    return (
      <IndexTable
        condensed={smDown}
        resourceName={resourceName}
        itemCount={bundles.length}
        headings={[{ title: 'Bundle name' }, { title: 'Status' }, { title: 'Type' }, { title: 'Actions' }]}
        selectable={false}>
        {rowMarkup}
      </IndexTable>
    )
  }, [isLoading, bundlesError, bundles, status, smDown, resourceName, rowMarkup, navigate])

  return (
    <>
      <Card>
        <Bleed marginInline="400" marginBlock="400">
          <IndexFilters
            tabs={tabs}
            selected={selected}
            onSelect={setSelected}
            sortOptions={sortOptions}
            sortSelected={sortSelected}
            onSort={setSortSelected}
            canCreateNewView={false}
            mode={mode}
            setMode={setMode}
            hideQueryField
            hideFilters
          />
          {pageContent}
        </Bleed>
      </Card>

      <ChangeBundleStatusModal
        isOpen={!!bundleToChangeStatus}
        onClose={() => setBundleToChangeStatus(null)}
        onConfirm={() => changeBundleStatus(bundleToChangeStatus)}
        bundleName={bundleToChangeStatus?.txtBundleName}
        isLoading={isPendingBundleStatusChange}
        newStatus={bundleToChangeStatus?.newStatus}
      />

      <DeleteBundleModal
        isOpen={isDeleteModalOpen}
        onClose={bundleDeleteCancel}
        onDeleteConfirm={() => deleteBundle({ bundleId: bundleToDelete._id })}
        bundleName={bundleToDelete?.txtBundleName}
      />
    </>
  )
}
