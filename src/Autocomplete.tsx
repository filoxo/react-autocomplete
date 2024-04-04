import React, { useId, useMemo, useState, forwardRef, useCallback } from 'react'
import { KeyCode } from './constants'
import { ActiveDescendantContext } from './ActiveDescendantContext'
import type { ListBoxPosition } from './types'
import { useTrackActiveDescendant } from './useTrackActiveDescendant'

export type CssClassesTargets = {
  container?: string
  input?: string
  listbox?: string
  label?: string
  portal?: string
}

export interface AutocompleteProps extends React.ComponentPropsWithRef<'input'> {
  children: React.ReactNode
  autoExpand?: boolean
  listboxPosition?: ListBoxPosition
  value?: string
  onOptionSelect?: (value: unknown) => void
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>
  label?: string
  classes?: CssClassesTargets
}

/**
 * Autocomplete
 *
 * @summary Use this component to create an accessible autocomplete input with a list of options.
 *
 * @param {boolean} props.autoExpand - controls whether the listbox is expanded on focus
 * @param {boolean} props.listboxPosition - the position of the listbox relative to the input
 * @param {string} [props.value] - the value of the input, optional.
 * @param {(value: unknown) => void} props.onOptionSelect - use onOptionSelect to handle when an option is selected either with mouse or keyboard. When using onOptionSelect, consider providing the correct type for the value, eg. `const onOptionSelect = (value: ExpectedValueType) => {}`
 * @param {React.KeyboardEventHandler<HTMLInputElement>} props.onKeyDown - use onKeyDown to react to keydown events on the autocomplete input
 *
 * Props not listed are forwarded to the underlying input component.
 * This component is patterned after the [WAI ARIA Combobox autocomplete list example](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-autocomplete-list/).
 */
export const Autocomplete = forwardRef<HTMLInputElement, AutocompleteProps>(
  function AutocompleteComponent(
    {
      id,
      children,
      classes,
      label,
      autoExpand = true,
      listboxPosition = 'bottom',
      value,
      onBlur,
      onFocus,
      onKeyDown,
      onOptionSelect,
      ...remainingProps
    },
    comboboxRef
  ) {
    const autoId = useId()
    const comboboxId = id || autoId
    const listboxId = `${comboboxId}-listbox`
    const [expanded, setExpanded] = useState(false)

    const [domNode, setDomNode] = useState<HTMLUListElement>()
    const listboxRefCb = useCallback((domNode: HTMLUListElement) => {
      setDomNode(domNode)
    }, [])
    const activeDescendant = useTrackActiveDescendant({ element: domNode })

    const activeDescendantState = useMemo(() => {
      return {
        checkIfActive: activeDescendant.check,
        onOptionSelect: (id: string | undefined, newValue: unknown) => {
          activeDescendant.update(id)
          onOptionSelect?.(newValue)
        },
      }
    }, [domNode, activeDescendant.check, onOptionSelect])

    const trackActiveDescendant = (
      e: React.KeyboardEvent<HTMLInputElement>
    ) => {
      if (expanded) {
        if (e.key === KeyCode.DOWN) {
          e.preventDefault()
          activeDescendant.next()
        } else if (e.key === KeyCode.UP) {
          e.preventDefault()
          activeDescendant.prev()
        } else if (e.key === KeyCode.ESC) {
          setExpanded(false)
          activeDescendant.clear()
        } else if (e.key === KeyCode.ENTER) {
          activeDescendant.click()
        }
      } else {
        if (e.key === KeyCode.ENTER && e.altKey) {
          setExpanded(true)
        }
      }
    }

    const onKeyDownHandler = (e: React.KeyboardEvent<HTMLInputElement>) => {
      trackActiveDescendant(e)
      onKeyDown?.(e)
    }

    const onFocusHandler = (e: React.FocusEvent<HTMLInputElement, Element>) => {
      setExpanded(autoExpand)
      onFocus?.(e)
    }

    const onBlurHandler = (e: React.FocusEvent<HTMLInputElement, Element>) => {
      setExpanded(false)
      onBlur?.(e)
    }

    return (
      <div className={classes?.container}>
        {label && <label htmlFor={comboboxId} className={classes?.label}>{label}</label>}
        <input
          {...remainingProps}
          className={classes?.input}
          aria-activedescendant={activeDescendant.current ?? undefined}
          aria-autocomplete='list'
          aria-controls={listboxId}
          aria-expanded={expanded}
          autoComplete='off'
          id={comboboxId}
          ref={comboboxRef}
          role='combobox'
          value={value}
          onBlur={onBlurHandler}
          onFocus={onFocusHandler}
          onKeyDown={onKeyDownHandler}
        />
        <div className={classes?.portal}>
          <ActiveDescendantContext.Provider value={activeDescendantState}>
            {expanded && (
              <ul
                aria-labelledby={comboboxId}
                className={classes?.listbox}
                id={listboxId}
                ref={listboxRefCb}
                role='listbox'
              >
                {children}
              </ul>
            )}
          </ActiveDescendantContext.Provider>
        </div>
      </div>
    )
  }
)

Autocomplete.displayName = 'Autocomplete'