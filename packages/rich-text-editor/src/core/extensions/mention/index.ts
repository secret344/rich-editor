import Mention from '@tiptap/extension-mention'
import { ElementUtils, StyleUtils } from '@/core/dom/utils'
import { EventManager } from '@/utils/EventManager'

export interface MentionItem {
  id: string
  label: string
  avatar?: string
}

export interface MentionOptions {
  /** List of mentionable items or async function to fetch them */
  items?: MentionItem[] | ((query: string) => MentionItem[] | Promise<MentionItem[]>)
  /** Character that triggers mention (default: '@') */
  char?: string
  /** HTML attributes applied to rendered mention node */
  HTMLAttributes?: Record<string, any>
  /** Callback when a mention is selected */
  onMentionSelect?: (item: MentionItem) => void
  /** Text shown when no match is found (default: 'No results') */
  emptyText?: string
}

/**
 * Creates a Tiptap Mention extension configured with a vanilla JS suggestion popup.
 */
export function createMentionExtension(options: MentionOptions = {}) {
  const {
    char = '@',
    HTMLAttributes = {},
    onMentionSelect,
    emptyText = 'No results',
  } = options

  const resolveItems = async (query: string): Promise<MentionItem[]> => {
    if (!options.items) return []
    if (typeof options.items === 'function') {
      return options.items(query)
    }
    return options.items.filter(item =>
      item.label.toLowerCase().includes(query.toLowerCase())
    )
  }

  return Mention.configure({
    HTMLAttributes: {
      class: 'rich:mention rich:inline-flex rich:items-center rich:bg-blue-100 rich:text-blue-700 rich:rounded rich:px-1 rich:font-medium',
      ...HTMLAttributes,
    },
    renderHTML({ options: mentionOptions, node }) {
      return [
        'span',
        {
          class: 'rich:mention rich:inline-flex rich:items-center rich:bg-blue-100 rich:text-blue-700 rich:rounded rich:px-1 rich:font-medium',
          'data-mention': node.attrs.id,
        },
        `${mentionOptions.suggestion.char}${node.attrs.label ?? node.attrs.id}`,
      ]
    },
    suggestion: {
      char,
      items: async ({ query }) => resolveItems(query),

      render: () => {
        let popup: HTMLElement | null = null
        let selectedIndex = 0
        let currentItems: MentionItem[] = []
        let currentCommand: ((item: MentionItem) => void) | null = null
        const eventManager = new EventManager()

        const renderList = () => {
          if (!popup) return
          popup.innerHTML = ''
          if (currentItems.length === 0) {
            const empty = ElementUtils.createElement({
              tagName: 'div',
              className: 'rich:px-3 rich:py-2 rich:text-sm rich:text-gray-500',
              textContent: emptyText,
            })
            ElementUtils.appendChild(popup, empty)
            return
          }
          currentItems.forEach((item, index) => {
            const itemEl = ElementUtils.createElement({
              tagName: 'div',
              className: `rich:px-3 rich:py-2 rich:cursor-pointer rich:text-sm rich:flex rich:items-center rich:gap-2 ${
                index === selectedIndex
                  ? 'rich:bg-blue-50 rich:text-blue-700'
                  : 'hover:rich:bg-gray-50'
              }`,
            })
            const label = ElementUtils.createElement({
              tagName: 'span',
              textContent: item.label,
            })
            ElementUtils.appendChild(itemEl, label)
            eventManager.addEventListener(itemEl, 'click', () => {
              currentCommand?.(item)
              onMentionSelect?.(item)
            })
            ElementUtils.appendChild(popup!, itemEl)
          })
        }

        return {
          onStart(props) {
            currentItems = props.items as MentionItem[]
            currentCommand = (item: MentionItem) => {
              props.command({ id: item.id, label: item.label })
            }
            selectedIndex = 0

            popup = ElementUtils.createElement({
              tagName: 'div',
              className:
                'rich:bg-white rich:border rich:border-gray-200 rich:rounded-md rich:shadow-lg rich:min-w-[160px] rich:max-h-48 rich:overflow-y-auto',
            })
            StyleUtils.setStyle(popup, 'position', 'fixed')
            StyleUtils.setStyle(popup, 'zIndex', '9999')
            document.body.appendChild(popup)

            const rect = props.clientRect?.()
            if (rect) {
              StyleUtils.setStyle(popup, 'top', `${rect.bottom + 4}px`)
              StyleUtils.setStyle(popup, 'left', `${rect.left}px`)
            }

            renderList()
          },

          onUpdate(props) {
            currentItems = props.items as MentionItem[]
            currentCommand = (item: MentionItem) => {
              props.command({ id: item.id, label: item.label })
            }
            selectedIndex = 0

            const rect = props.clientRect?.()
            if (rect && popup) {
              StyleUtils.setStyle(popup, 'top', `${rect.bottom + 4}px`)
              StyleUtils.setStyle(popup, 'left', `${rect.left}px`)
            }

            renderList()
          },

          onKeyDown({ event }) {
            if (!popup || currentItems.length === 0) return false

            if (event.key === 'ArrowDown') {
              selectedIndex = (selectedIndex + 1) % currentItems.length
              renderList()
              return true
            }
            if (event.key === 'ArrowUp') {
              selectedIndex = (selectedIndex - 1 + currentItems.length) % currentItems.length
              renderList()
              return true
            }
            if (event.key === 'Enter') {
              const item = currentItems[selectedIndex]
              if (item) {
                currentCommand?.(item)
                onMentionSelect?.(item)
              }
              return true
            }
            return false
          },

          onExit() {
            eventManager.cleanup()
            if (popup && popup.parentNode) {
              popup.parentNode.removeChild(popup)
            }
            popup = null
          },
        }
      },
    },
  })
}
