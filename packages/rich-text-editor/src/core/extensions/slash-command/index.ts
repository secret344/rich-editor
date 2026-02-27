import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { ElementUtils, StyleUtils } from '@/core/dom/utils'
import { EventManager } from '@/utils/EventManager'

export interface SlashCommandItem {
  id: string
  title: string
  description?: string
  icon?: string
  keywords?: string[]
  command: (editor: any) => void
}

export interface SlashCommandOptions {
  /** Custom list of slash command items (merged with defaults when provided) */
  items?: SlashCommandItem[]
  /** Whether to include the default built-in commands */
  includeDefaults?: boolean
}

const getDefaultItems = (): SlashCommandItem[] => [
  {
    id: 'heading1',
    title: '标题 1',
    description: '大标题',
    icon: 'H1',
    keywords: ['h1', 'heading', '标题'],
    command: (editor) => editor.chain().focus().toggleHeading({ level: 1 }).run(),
  },
  {
    id: 'heading2',
    title: '标题 2',
    description: '中等标题',
    icon: 'H2',
    keywords: ['h2', 'heading', '标题'],
    command: (editor) => editor.chain().focus().toggleHeading({ level: 2 }).run(),
  },
  {
    id: 'heading3',
    title: '标题 3',
    description: '小标题',
    icon: 'H3',
    keywords: ['h3', 'heading', '标题'],
    command: (editor) => editor.chain().focus().toggleHeading({ level: 3 }).run(),
  },
  {
    id: 'bulletList',
    title: '无序列表',
    description: '使用项目符号的列表',
    icon: '•',
    keywords: ['ul', 'list', '列表', '无序'],
    command: (editor) => editor.chain().focus().toggleBulletList().run(),
  },
  {
    id: 'orderedList',
    title: '有序列表',
    description: '使用编号的列表',
    icon: '1.',
    keywords: ['ol', 'list', '列表', '有序', '编号'],
    command: (editor) => editor.chain().focus().toggleOrderedList().run(),
  },
  {
    id: 'blockquote',
    title: '引用',
    description: '引用文字块',
    icon: '"',
    keywords: ['quote', 'blockquote', '引用'],
    command: (editor) => editor.chain().focus().toggleBlockquote().run(),
  },
  {
    id: 'codeBlock',
    title: '代码块',
    description: '插入代码块',
    icon: '</>',
    keywords: ['code', 'codeblock', '代码'],
    command: (editor) => editor.chain().focus().toggleCodeBlock().run(),
  },
  {
    id: 'divider',
    title: '分割线',
    description: '插入水平分割线',
    icon: '—',
    keywords: ['hr', 'divider', '分割线', '水平线'],
    command: (editor) => editor.chain().focus().setHorizontalRule().run(),
  },
]

const SLASH_COMMAND_KEY = new PluginKey('slashCommand')

export function createSlashCommandExtension(options: SlashCommandOptions = {}) {
  const allItems: SlashCommandItem[] = [
    ...(options.includeDefaults !== false ? getDefaultItems() : []),
    ...(options.items || []),
  ]

  return Extension.create({
    name: 'slashCommand',

    addProseMirrorPlugins() {
      const editor = this.editor
      let popup: HTMLElement | null = null
      let filteredItems: SlashCommandItem[] = []
      let selectedIndex = 0
      let isVisible = false
      let slashPos: number | null = null
      const eventManager = new EventManager()

      const filterItems = (query: string): SlashCommandItem[] => {
        if (!query) return allItems
        const lower = query.toLowerCase()
        return allItems.filter(
          (item) =>
            item.title.toLowerCase().includes(lower) ||
            item.description?.toLowerCase().includes(lower) ||
            item.keywords?.some((k) => k.toLowerCase().includes(lower))
        )
      }

      const renderList = () => {
        if (!popup) return
        popup.innerHTML = ''
        if (filteredItems.length === 0) {
          const empty = ElementUtils.createElement({
            tagName: 'div',
            className: 'rich:px-3 rich:py-2 rich:text-sm rich:text-gray-500',
            textContent: '无匹配命令',
          })
          ElementUtils.appendChild(popup, empty)
          return
        }
        filteredItems.forEach((item, index) => {
          const itemEl = ElementUtils.createElement({
            tagName: 'div',
            className: `rich:flex rich:items-center rich:gap-3 rich:px-3 rich:py-2 rich:cursor-pointer rich:rounded-sm ${
              index === selectedIndex
                ? 'rich:bg-blue-50'
                : 'hover:rich:bg-gray-50'
            }`,
          })
          const iconEl = ElementUtils.createElement({
            tagName: 'span',
            className:
              'rich:inline-flex rich:items-center rich:justify-center rich:w-7 rich:h-7 rich:rounded rich:bg-gray-100 rich:text-xs rich:font-bold rich:text-gray-700 rich:shrink-0',
            textContent: item.icon || '/',
          })
          const textWrapper = ElementUtils.createDiv({ className: 'rich:min-w-0' })
          const titleEl = ElementUtils.createElement({
            tagName: 'div',
            className: 'rich:text-sm rich:font-medium rich:text-gray-900',
            textContent: item.title,
          })
          ElementUtils.appendChild(textWrapper, titleEl)
          if (item.description) {
            const descEl = ElementUtils.createElement({
              tagName: 'div',
              className: 'rich:text-xs rich:text-gray-500 rich:truncate',
              textContent: item.description,
            })
            ElementUtils.appendChild(textWrapper, descEl)
          }
          ElementUtils.appendChild(itemEl, iconEl)
          ElementUtils.appendChild(itemEl, textWrapper)

          eventManager.addEventListener(itemEl, 'mousedown', (e) => {
            e.preventDefault()
            executeItem(item)
          })
          ElementUtils.appendChild(popup!, itemEl)
        })
      }

      const showPopup = (rect: DOMRect, query: string) => {
        hidePopup()
        filteredItems = filterItems(query)
        if (filteredItems.length === 0) return

        isVisible = true
        selectedIndex = 0

        popup = ElementUtils.createElement({
          tagName: 'div',
          className:
            'rich:bg-white rich:border rich:border-gray-200 rich:rounded-lg rich:shadow-xl rich:w-64 rich:max-h-72 rich:overflow-y-auto rich:p-1',
        })
        StyleUtils.setStyle(popup, 'position', 'fixed')
        StyleUtils.setStyle(popup, 'zIndex', '9999')
        StyleUtils.setStyle(popup, 'top', `${rect.bottom + 4}px`)
        StyleUtils.setStyle(popup, 'left', `${rect.left}px`)
        document.body.appendChild(popup)

        renderList()
      }

      const hidePopup = () => {
        isVisible = false
        slashPos = null
        eventManager.cleanup()
        if (popup && popup.parentNode) {
          popup.parentNode.removeChild(popup)
        }
        popup = null
      }

      const executeItem = (item: SlashCommandItem) => {
        if (slashPos !== null) {
          // Delete the slash and query text
          const { state } = editor
          const { from } = state.selection
          editor.chain().focus().deleteRange({ from: slashPos, to: from }).run()
        }
        item.command(editor)
        hidePopup()
      }

      return [
        new Plugin({
          key: SLASH_COMMAND_KEY,
          props: {
            handleKeyDown(_view, event) {
              if (!isVisible) return false

              if (event.key === 'ArrowDown') {
                selectedIndex = (selectedIndex + 1) % filteredItems.length
                renderList()
                return true
              }
              if (event.key === 'ArrowUp') {
                selectedIndex = (selectedIndex - 1 + filteredItems.length) % filteredItems.length
                renderList()
                return true
              }
              if (event.key === 'Enter' && filteredItems.length > 0) {
                executeItem(filteredItems[selectedIndex])
                return true
              }
              if (event.key === 'Escape') {
                hidePopup()
                return true
              }
              return false
            },
          },
          view() {
            return {
              update(view) {
                const { state } = view
                const { selection } = state
                const { $from } = selection

                // Get text from start of current line to cursor
                const lineStart = $from.start()
                const textBefore = state.doc.textBetween(lineStart, $from.pos)

                const slashIndex = textBefore.lastIndexOf('/')
                if (slashIndex === -1) {
                  if (isVisible) hidePopup()
                  return
                }

                // There must be only word characters or nothing after the slash
                const query = textBefore.slice(slashIndex + 1)
                if (/\s/.test(query)) {
                  if (isVisible) hidePopup()
                  return
                }

                slashPos = lineStart + slashIndex

                // Get caret rect for positioning
                const coords = view.coordsAtPos($from.pos)
                const rect = new DOMRect(coords.left, coords.top, 0, coords.bottom - coords.top)
                showPopup(rect, query)
              },
              destroy() {
                hidePopup()
              },
            }
          },
        }),
      ]
    },
  })
}

export { getDefaultItems as getDefaultSlashCommands }
