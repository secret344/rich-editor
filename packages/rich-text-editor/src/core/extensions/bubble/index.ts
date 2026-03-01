/**
 * Bubble 菜单扩展
 * 选中文本后在选区附近显示浮动格式工具栏
 */
import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { ElementUtils, StyleUtils } from '@/core/dom/utils'
import { EventManager } from '@/utils/EventManager'
import type { Editor } from '@tiptap/core'
import type { EditorView } from '@tiptap/pm/view'
import type { AIOptions } from '@/core/extensions/ai'

export interface BubbleMenuOptions {
  /**
   * AI 配置（可选）。
   * 如果提供，则在 bubble 菜单末尾追加"✨ AI"按钮，
   * 点击后调用 editor.commands.openAIPanel()。
   * 同时请确保已注册 createAIExtension(aiOptions)。
   */
  aiOptions?: AIOptions
}

const BUBBLE_MENU_KEY = new PluginKey('bubbleMenu')

/** 气泡菜单按钮定义 */
interface BubbleButton {
  id: string
  label: string
  title: string
  isActive: (editor: Editor) => boolean
  action: (editor: Editor) => void
}

/** 默认格式化按钮列表 */
function getDefaultButtons(): BubbleButton[] {
  return [
    {
      id: 'bold',
      label: 'B',
      title: '加粗',
      isActive: (e) => e.isActive('bold'),
      action: (e) => e.chain().focus().toggleBold().run(),
    },
    {
      id: 'italic',
      label: 'I',
      title: '斜体',
      isActive: (e) => e.isActive('italic'),
      action: (e) => e.chain().focus().toggleItalic().run(),
    },
    {
      id: 'underline',
      label: 'U',
      title: '下划线',
      isActive: (e) => e.isActive('underline'),
      action: (e) => e.chain().focus().toggleUnderline().run(),
    },
    {
      id: 'strike',
      label: 'S',
      title: '删除线',
      isActive: (e) => e.isActive('strike'),
      action: (e) => e.chain().focus().toggleStrike().run(),
    },
    {
      id: 'code',
      label: '</>',
      title: '行内代码',
      isActive: (e) => e.isActive('code'),
      action: (e) => e.chain().focus().toggleCode().run(),
    },
  ]
}

/** 气泡菜单边界安全间距（px） */
const BOUNDARY_PADDING = 4

/** 菜单与选区之间的垂直间距（px） */
const MENU_GAP = 8

/**
 * Bubble 菜单视图
 * 在文本选区附近显示浮动格式工具栏
 */
class BubbleMenuView {
  private editor: Editor
  private options: BubbleMenuOptions
  private eventManager: EventManager = new EventManager()
  private menuEl!: HTMLElement
  private buttons: Array<{ el: HTMLElement; def: BubbleButton }> = []
  private isMouseDown = false

  constructor(_view: EditorView, editor: Editor, options: BubbleMenuOptions) {
    this.editor = editor
    this.options = options
    this.buildMenu()
    this.bindEvents()
  }

  // ─── Menu Construction ────────────────────────────────────────────────────

  private buildMenu(): void {
    this.menuEl = ElementUtils.createDiv({ className: 'rich-bubble-menu' })
    StyleUtils.setStyles(this.menuEl, {
      position: 'fixed',
      display: 'none',
      zIndex: '100',
    })

    getDefaultButtons().forEach((def) => {
      const btn = ElementUtils.createElement({
        tagName: 'button',
        className: 'rich-bubble-btn',
        textContent: def.label,
        attributes: { title: def.title, type: 'button' },
      })

      this.eventManager.addEventListener(btn, 'mousedown', (e) => {
        e.preventDefault()
        e.stopPropagation()
        def.action(this.editor)
      })

      this.buttons.push({ el: btn, def })
      ElementUtils.appendChild(this.menuEl, btn)
    })

    // AI button – shown only when aiOptions is configured
    if (this.options.aiOptions) {
      const sep = ElementUtils.createElement({
        tagName: 'div',
        className: 'rich-bubble-sep',
      })
      const aiBtn = ElementUtils.createElement({
        tagName: 'button',
        className: 'rich-bubble-btn rich-bubble-btn--ai',
        textContent: '✨ AI',
        attributes: { title: '打开 AI 助手 (Mod+Shift+A)', type: 'button' },
      })
      this.eventManager.addEventListener(aiBtn, 'mousedown', (e) => {
        e.preventDefault()
        e.stopPropagation()
        this.editor.commands.openAIPanel()
      })
      ElementUtils.appendChild(this.menuEl, sep)
      ElementUtils.appendChild(this.menuEl, aiBtn)
    }

    document.body.appendChild(this.menuEl)
  }

  // ─── Event Binding ────────────────────────────────────────────────────────

  private bindEvents(): void {
    this.eventManager.addEventListener(document, 'mousedown', () => {
      this.isMouseDown = true
    })
    this.eventManager.addEventListener(document, 'mouseup', () => {
      this.isMouseDown = false
    })
  }

  // ─── Update / Position ────────────────────────────────────────────────────

  update(view: EditorView): void {
    const { selection } = view.state
    const { empty, from, to } = selection

    // 拖拽选文时不显示，松开鼠标后才显示
    if (empty || this.isMouseDown) {
      StyleUtils.hide(this.menuEl)
      return
    }

    // 更新按钮激活状态
    this.buttons.forEach(({ el, def }) => {
      if (def.isActive(this.editor)) {
        StyleUtils.addClass(el, 'is-active')
      } else {
        StyleUtils.removeClass(el, 'is-active')
      }
    })

    // 先显示以获取菜单尺寸
    StyleUtils.show(this.menuEl, 'flex')

    const startCoords = view.coordsAtPos(from)
    const endCoords = view.coordsAtPos(to)
    const menuRect = this.menuEl.getBoundingClientRect()

    // 水平居中于选区，垂直放在选区上方
    let left = (startCoords.left + endCoords.right) / 2 - menuRect.width / 2
    let top = startCoords.top - menuRect.height - MENU_GAP

    // 边界修正
    if (left < BOUNDARY_PADDING) left = BOUNDARY_PADDING
    if (left + menuRect.width > window.innerWidth - BOUNDARY_PADDING) {
      left = window.innerWidth - menuRect.width - BOUNDARY_PADDING
    }
    if (top < BOUNDARY_PADDING) {
      // 放到选区下方
      top = endCoords.bottom + MENU_GAP
    }

    StyleUtils.setStyles(this.menuEl, {
      left: `${left}px`,
      top: `${top}px`,
    })
  }

  // ─── Lifecycle ────────────────────────────────────────────────────────────

  destroy(): void {
    if (this.menuEl.parentNode) {
      this.menuEl.parentNode.removeChild(this.menuEl)
    }
    this.eventManager.cleanup()
  }
}

/**
 * 创建 Bubble 菜单扩展
 * 选中文本后自动在选区附近显示格式化工具栏
 */
export function createBubbleMenuExtension(options: BubbleMenuOptions = {}) {
  return Extension.create({
    name: 'bubbleMenu',

    addProseMirrorPlugins() {
      const editor = this.editor

      return [
        new Plugin({
          key: BUBBLE_MENU_KEY,
          view(editorView) {
            const menuView = new BubbleMenuView(editorView, editor, options)
            return {
              update(view) {
                menuView.update(view)
              },
              destroy() {
                menuView.destroy()
              },
            }
          },
        }),
      ]
    },
  })
}
