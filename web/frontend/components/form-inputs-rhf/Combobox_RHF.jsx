import { useCallback, useMemo, useState } from 'react'
import {
  LegacyStack,
  Tag,
  Listbox,
  EmptySearchResult,
  Combobox,
  Text,
  AutoSelection,
  Label,
  BlockStack
} from '@shopify/polaris'
import { useController } from 'react-hook-form'

/**
 * @type {React.FC<{
 *   control: Control,
 *   name: string,
 *   defaultValue?: array<string>,
 *   shouldUnregister?: boolean,
 *   noError?: boolean,
 *   label?: string,
 *   placeholder?: string,
 *   ...params: React.ComponentProps<typeof TextField>
 * }>}
 */
const Combobox_RHF = ({
  control,
  name,
  defaultValue = [],
  shouldUnregister = false,
  noError = false,
  label,
  placeholder,
  ...params
}) => {
  const {
    field: { value: selectedTags, onChange: onChangeSelectedTags },
    fieldState
  } = useController({ control, shouldUnregister, defaultValue, name })

  const [value, setValue] = useState('')
  const [suggestion, setSuggestion] = useState('')

  const handleActiveOptionChange = useCallback(
    (activeOption) => {
      const activeOptionIsAction = activeOption === value

      if (!activeOptionIsAction && !selectedTags.includes(activeOption)) {
        setSuggestion(activeOption)
      } else {
        setSuggestion('')
      }
    },
    [value, selectedTags]
  )

  const updateSelection = useCallback(
    (selected) => {
      const nextSelectedTags = new Set([...selectedTags])

      if (nextSelectedTags.has(selected)) {
        nextSelectedTags.delete(selected)
      } else {
        nextSelectedTags.add(selected)
      }
      onChangeSelectedTags([...nextSelectedTags])

      setValue('')
      setSuggestion('')
    },
    [selectedTags]
  )

  const removeTag = useCallback(
    (tag) => () => {
      updateSelection(tag)
    },
    [updateSelection]
  )

  const getAllTags = useCallback(() => {
    const savedTags = []
    return [...new Set([...savedTags, ...selectedTags].sort())]
  }, [selectedTags])

  const formatOptionText = useCallback(
    (option) => {
      const trimValue = value.trim().toLocaleLowerCase()
      const matchIndex = option.toLocaleLowerCase().indexOf(trimValue)

      if (!value || matchIndex === -1) return option

      const start = option.slice(0, matchIndex)
      const highlight = option.slice(matchIndex, matchIndex + trimValue.length)
      const end = option.slice(matchIndex + trimValue.length, option.length)

      return (
        <p>
          {start}
          <Text fontWeight="bold" as="span">
            {highlight}
          </Text>
          {end}
        </p>
      )
    },
    [value]
  )

  const escapeSpecialRegExCharacters = useCallback((value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), [])

  const options = useMemo(() => {
    let list
    const allTags = getAllTags()
    const filterRegex = new RegExp(escapeSpecialRegExCharacters(value), 'i')

    if (value) {
      list = allTags.filter((tag) => tag.match(filterRegex))
    } else {
      list = allTags
    }

    return [...list]
  }, [value, getAllTags, escapeSpecialRegExCharacters])

  const verticalContentMarkup =
    selectedTags.length > 0 ? (
      <LegacyStack spacing="extraTight" alignment="center">
        {selectedTags.map((tag) => (
          <Tag key={`option-${tag}`} onRemove={removeTag(tag)}>
            {tag}
          </Tag>
        ))}
      </LegacyStack>
    ) : null

  const optionMarkup =
    options.length > 0
      ? options.map((option) => {
          return (
            <Listbox.Option
              key={option}
              value={option}
              selected={selectedTags.includes(option)}
              accessibilityLabel={option}>
              <Listbox.TextOption selected={selectedTags.includes(option)}>
                {formatOptionText(option)}
              </Listbox.TextOption>
            </Listbox.Option>
          )
        })
      : null

  const noResults = value && !getAllTags().includes(value)

  const actionMarkup = noResults ? <Listbox.Action value={value}>{`Add "${value}"`}</Listbox.Action> : null

  const emptyStateMarkup = optionMarkup ? null : (
    <EmptySearchResult title="" description={`No tags found matching "${value}"`} />
  )

  const listboxMarkup =
    optionMarkup || actionMarkup || emptyStateMarkup ? (
      <Listbox
        autoSelection={AutoSelection.None}
        onSelect={updateSelection}
        onActiveOptionChange={handleActiveOptionChange}>
        {actionMarkup}
        {optionMarkup}
      </Listbox>
    ) : null

  return (
    <BlockStack gap={100}>
      <Label>{label}</Label>
      <Combobox
        allowMultiple
        activator={
          <Combobox.TextField
            autoComplete="off"
            // label={label || 'Search tags'}
            labelHidden
            value={value}
            suggestion={suggestion}
            placeholder={placeholder || 'Search tags'}
            verticalContent={verticalContentMarkup}
            onChange={setValue}
          />
        }
        {...params}>
        {listboxMarkup}
      </Combobox>
    </BlockStack>
  )
}

export default Combobox_RHF
