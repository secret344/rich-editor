/**
 * Notion 模式扩展
 * 提供类 Notion 的编辑体验：左侧浮动菜单、拖拽排序、块操作菜单
 */
import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { ElementUtils, StyleUtils } from '@/core/dom/utils'
import { EventManager } from '@/utils/EventManager'
import type { Editor } from '@tiptap/core'
import type { EditorView } from '@tiptap/pm/view'
import type { Node as PMNode } from '@tiptap/pm/model'

export interface NotionModeOptions {
  /** 预留扩展选项 */
  _placeholder?: never
}

const NOTION_MODE_KEY = new PluginKey('notionMode')

/** 上下文菜单项 */
interface ContextMenuItem {
  id: string
  label: string
  icon: string
  action: (editor: Editor, pos: number) => void
  separator?: boolean
}

/** 获取通用转换菜单项 */
function getTurnIntoItems(): ContextMenuItem[] {
  return [
    {
      id: 'turn-para',
      label: '文本',
      icon: 'T',
      action: (e) => e.chain().focus().setParagraph().run(),
    },
    {
      id: 'turn-h1',
      label: '标题 1',
      icon: 'H1',
      action: (e) => e.chain().focus().setHeading({ level: 1 }).run(),
    },
    {
      id: 'turn-h2',
      label: '标题 2',
      icon: 'H2',
      action: (e) => e.chain().focus().setHeading({ level: 2 }).run(),
    },
    {
      id: 'turn-h3',
      label: '标题 3',
      icon: 'H3',
      action: (e) => e.chain().focus().setHeading({ level: 3 }).run(),
    },
    {
      id: 'turn-bullet',
      label: '无序列表',
      icon: '•',
      action: (e) => e.chain().focus().toggleBulletList().run(),
    },
    {
      id: 'turn-ordered',
      label: '有序列表',
      icon: '1.',
      action: (e) => e.chain().focus().toggleOrderedList().run(),
    },
    {
      id: 'turn-quote',
      label: '引用',
      icon: '❝',
      action: (e) => e.chain().focus().toggleBlockquote().run(),
    },
    {
      id: 'turn-code',
      label: '代码块',
      icon: '</>',
      action: (e) => e.chain().focus().toggleCodeBlock().run(),
    },
  ]
}

/** 获取块操作菜单项 */
function getBlockActionItems(): ContextMenuItem[] {
  return [
    {
      id: 'sep',
      label: '',
      icon: '',
      separator: true,
      action: () => {},
    },
    {
      id: 'duplicate',
      label: '复制块',
      icon: '⎘',
      action: (editor, pos) => {
        const { state } = editor
        const $pos = state.doc.resolve(pos + 1)
        if ($pos.depth < 1) return
        const blockPos = $pos.before(1)
        const node = state.doc.nodeAt(blockPos)
        if (!node) return
        const insertPos = blockPos + node.nodeSize
        editor.chain().focus().insertContentAt(insertPos, node.toJSON()).run()
      },
    },
    {
      id: 'delete',
      label: '删除块',
      icon: '✕',
      action: (editor, pos) => {
        const { state } = editor
        const $pos = state.doc.resolve(pos + 1)
        if ($pos.depth < 1) return
        const blockPos = $pos.before(1)
        const node = state.doc.nodeAt(blockPos)
        if (!node) return
        editor
          .chain()
          .focus()
          .deleteRange({ from: blockPos, to: blockPos + node.nodeSize })
          .run()
      },
    },
  ]
}

/**
 * Notion 浮动菜单视图
 * 管理左侧浮动菜单的创建、定位和交互
 */
class NotionFloatingMenuView {
  private editor: Editor
  private view: EditorView
  private eventManager: EventManager = new EventManager()

  // 浮动菜单 DOM 元素
  private menuEl!: HTMLElement
  private addBtnEl!: HTMLElement
  private dragHandleEl!: HTMLElement

  // 当前悬停块
  private currentBlockPos: number | null = null

  // 菜单悬停状态（防止移到菜单时菜单消失）
  private menuHovered = false
  private hideTimer: ReturnType<typeof setTimeout> | null = null

  // 上下文菜单
  private contextMenuEl: HTMLElement | null = null

  // 拖拽状态
  private dragActive = false
  private dragSourcePos: number | null = null
  private dragNode: PMNode | null = null
  private dropIndicatorEl: HTMLElement | null = null
  private dropTargetPos: number | null = null
  private dropBefore = true

  constructor(view: EditorView, editor: Editor) {
    this.view = view
    this.editor = editor
    this.buildMenu()
    this.bindEvents()
  }

  // ─── Menu Construction ────────────────────────────────────────────────────

  private buildMenu(): void {
    this.menuEl = ElementUtils.createDiv({ className: 'notion-floating-menu' })
    StyleUtils.setStyles(this.menuEl, {
      position: 'fixed',
      display: 'none',
      zIndex: '50',
      alignItems: 'center',
      gap: '2px',
      userSelect: 'none',
      pointerEvents: 'auto',
    })

    // "+" 添加按钮
    this.addBtnEl = ElementUtils.createElement({
      tagName: 'button',
      className: 'notion-add-btn',
      textContent: '+',
      attributes: { title: '在下方添加块', type: 'button' },
    })

    // 拖拽手柄
    this.dragHandleEl = ElementUtils.createElement({
      tagName: 'div',
      className: 'notion-drag-handle',
      innerHTML: '&#x283F;', // ⠿ six-dot drag handle
      attributes: { title: '拖拽移动 / 点击查看操作' },
    })

    ElementUtils.appendChild(this.menuEl, this.addBtnEl)
    ElementUtils.appendChild(this.menuEl, this.dragHandleEl)

    document.body.appendChild(this.menuEl)
  }

  // ─── Event Binding ────────────────────────────────────────────────────────

  private bindEvents(): void {
    const editorDom = this.view.dom as HTMLElement

    // 追踪编辑器内鼠标移动
    this.eventManager.addEventListener(editorDom, 'mousemove', (e) =>
      this.onEditorMouseMove(e as MouseEvent)
    )
    this.eventManager.addEventListener(editorDom, 'mouseleave', () =>
      this.scheduleHide()
    )

    // 菜单悬停：保持菜单可见
    this.eventManager.addEventListener(this.menuEl, 'mouseenter', () => {
      this.menuHovered = true
      if (this.hideTimer) {
        clearTimeout(this.hideTimer)
        this.hideTimer = null
      }
    })
    this.eventManager.addEventListener(this.menuEl, 'mouseleave', () => {
      this.menuHovered = false
      this.scheduleHide()
    })

    // 添加按钮
    this.eventManager.addEventListener(this.addBtnEl, 'click', () =>
      this.onAddClick()
    )

    // 拖拽手柄点击（上下文菜单）
    this.eventManager.addEventListener(this.dragHandleEl, 'click', (e) =>
      this.onHandleClick(e as MouseEvent)
    )

    // 拖拽手柄 mousedown（开始拖拽）
    this.eventManager.addEventListener(this.dragHandleEl, 'mousedown', (e) =>
      this.onDragMouseDown(e as MouseEvent)
    )

    // 点击文档关闭上下文菜单
    this.eventManager.addEventListener(document, 'click', (e) =>
      this.onDocumentClick(e as MouseEvent)
    )
  }

  // ─── Mouse Tracking ───────────────────────────────────────────────────────

  private onEditorMouseMove(e: MouseEvent): void {
    if (this.dragActive) return

    const pos = this.view.posAtCoords({ left: e.clientX, top: e.clientY })
    if (!pos) {
      this.scheduleHide()
      return
    }

    let $pos
    try {
      $pos = this.view.state.doc.resolve(pos.pos)
    } catch {
      this.scheduleHide()
      return
    }

    // 找到顶层块（depth=1）
    if ($pos.depth === 0) {
      this.scheduleHide()
      return
    }

    const nodePos = $pos.before(1)
    const blockDOM = this.view.nodeDOM(nodePos) as HTMLElement | null
    if (!blockDOM) {
      this.scheduleHide()
      return
    }

    this.currentBlockPos = nodePos
    this.positionMenu(blockDOM)
  }

  private scheduleHide(): void {
    if (this.hideTimer) clearTimeout(this.hideTimer)
    this.hideTimer = setTimeout(() => {
      if (!this.menuHovered) {
        this.hideMenu()
      }
    }, 400)
  }

  // ─── Menu Positioning ─────────────────────────────────────────────────────

  private positionMenu(blockDOM: HTMLElement): void {
    if (this.hideTimer) {
      clearTimeout(this.hideTimer)
      this.hideTimer = null
    }

    const rect = blockDOM.getBoundingClientRect()
    const MENU_WIDTH = 60

    // 优先放到块左侧；若超出视口则放到块内部左边
    let left = rect.left - MENU_WIDTH - 4
    if (left < 0) left = rect.left + 2

    StyleUtils.setStyles(this.menuEl, {
      display: 'flex',
      top: `${rect.top + 2}px`,
      left: `${left}px`,
    })
  }

  private hideMenu(): void {
    StyleUtils.hide(this.menuEl)
    this.currentBlockPos = null
  }

  // ─── Add Block ────────────────────────────────────────────────────────────

  private onAddClick(): void {
    if (this.currentBlockPos === null) return

    const { state } = this.view
    const $pos = state.doc.resolve(this.currentBlockPos + 1)
    if ($pos.depth < 1) return

    const blockPos = $pos.before(1)
    const node = state.doc.nodeAt(blockPos)
    if (!node) return

    const insertPos = blockPos + node.nodeSize
    this.editor
      .chain()
      .focus()
      .insertContentAt(insertPos, { type: 'paragraph' })
      .setTextSelection(insertPos + 1)
      .run()

    this.hideMenu()
  }

  // ─── Context Menu ─────────────────────────────────────────────────────────

  private onHandleClick(e: MouseEvent): void {
    e.stopPropagation()
    if (this.dragActive) return
    this.toggleContextMenu(e.clientX, e.clientY)
  }

  private toggleContextMenu(x: number, y: number): void {
    this.closeContextMenu()
    if (this.currentBlockPos === null) return

    const capturedPos = this.currentBlockPos

    this.contextMenuEl = ElementUtils.createDiv({ className: 'notion-context-menu' })
    StyleUtils.setStyles(this.contextMenuEl, {
      position: 'fixed',
      zIndex: '200',
      left: `${x}px`,
      top: `${y}px`,
    })

    const items: ContextMenuItem[] = [
      ...getTurnIntoItems(),
      ...getBlockActionItems(),
    ]

    items.forEach((item) => {
      if (item.separator) {
        const sep = ElementUtils.createDiv({ className: 'notion-context-menu__sep' })
        ElementUtils.appendChild(this.contextMenuEl!, sep)
        return
      }

      const row = ElementUtils.createDiv({ className: 'notion-context-menu__item' })

      const icon = ElementUtils.createElement({
        tagName: 'span',
        className: 'notion-context-menu__icon',
        textContent: item.icon,
      })
      const label = ElementUtils.createElement({
        tagName: 'span',
        className: 'notion-context-menu__label',
        textContent: item.label,
      })

      ElementUtils.appendChild(row, icon)
      ElementUtils.appendChild(row, label)

      this.eventManager.addEventListener(row, 'mousedown', (ev) => {
        ev.preventDefault()
        ev.stopPropagation()
        this.closeContextMenu()
        this.hideMenu()
        item.action(this.editor, capturedPos)
      })

      ElementUtils.appendChild(this.contextMenuEl!, row)
    })

    document.body.appendChild(this.contextMenuEl)
    this.adjustContextMenuPosition()
  }

  /** 防止菜单超出视口 */
  private adjustContextMenuPosition(): void {
    if (!this.contextMenuEl) return
    const rect = this.contextMenuEl.getBoundingClientRect()
    if (rect.right > window.innerWidth) {
      StyleUtils.setStyle(
        this.contextMenuEl,
        'left',
        `${window.innerWidth - rect.width - 8}px`
      )
    }
    if (rect.bottom > window.innerHeight) {
      StyleUtils.setStyle(
        this.contextMenuEl,
        'top',
        `${window.innerHeight - rect.height - 8}px`
      )
    }
  }

  private closeContextMenu(): void {
    if (this.contextMenuEl) {
      if (this.contextMenuEl.parentNode) {
        this.contextMenuEl.parentNode.removeChild(this.contextMenuEl)
      }
      this.contextMenuEl = null
    }
  }

  private onDocumentClick(e: MouseEvent): void {
    if (
      this.contextMenuEl &&
      !this.contextMenuEl.contains(e.target as Node)
    ) {
      this.closeContextMenu()
    }
  }

  // ─── Drag & Drop (block reorder) ─────────────────────────────────────────

  private onDragMouseDown(e: MouseEvent): void {
    if (e.button !== 0) return
    e.preventDefault()
    e.stopPropagation()

    if (this.currentBlockPos === null) return

    const { state } = this.view
    const $pos = state.doc.resolve(this.currentBlockPos + 1)
    if ($pos.depth < 1) return

    const blockPos = $pos.before(1)
    const node = state.doc.nodeAt(blockPos)
    if (!node) return

    this.dragActive = true
    this.dragSourcePos = blockPos
    this.dragNode = node

    StyleUtils.addClass(this.dragHandleEl, 'notion-drag-handle--dragging')

    // 创建拖拽指示线
    this.dropIndicatorEl = ElementUtils.createDiv({ className: 'notion-drop-indicator' })
    StyleUtils.setStyles(this.dropIndicatorEl, {
      position: 'fixed',
      display: 'none',
      pointerEvents: 'none',
      zIndex: '300',
    })
    document.body.appendChild(this.dropIndicatorEl)

    const onMouseMove = (ev: MouseEvent) => this.onDragMouseMove(ev)
    const onMouseUp = (ev: MouseEvent) => {
      this.onDragMouseUp(ev)
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }

  private onDragMouseMove(e: MouseEvent): void {
    if (!this.dragActive || !this.dropIndicatorEl) return

    const pos = this.view.posAtCoords({ left: e.clientX, top: e.clientY })
    if (!pos) {
      StyleUtils.hide(this.dropIndicatorEl)
      return
    }

    let $pos
    try {
      $pos = this.view.state.doc.resolve(pos.pos)
    } catch {
      StyleUtils.hide(this.dropIndicatorEl)
      return
    }

    if ($pos.depth === 0) {
      StyleUtils.hide(this.dropIndicatorEl)
      return
    }

    const blockPos = $pos.before(1)
    const blockDOM = this.view.nodeDOM(blockPos) as HTMLElement | null
    if (!blockDOM) {
      StyleUtils.hide(this.dropIndicatorEl)
      return
    }

    const rect = blockDOM.getBoundingClientRect()
    const midY = rect.top + rect.height / 2
    this.dropBefore = e.clientY < midY
    this.dropTargetPos = blockPos

    const indicatorTop = this.dropBefore ? rect.top : rect.bottom
    const editorRect = (this.view.dom as HTMLElement).getBoundingClientRect()

    StyleUtils.setStyles(this.dropIndicatorEl, {
      display: 'block',
      top: `${indicatorTop - 2}px`,
      left: `${editorRect.left}px`,
      width: `${editorRect.width}px`,
    })
  }

  private onDragMouseUp(_e: MouseEvent): void {
    if (!this.dragActive) return

    // 执行移动
    if (
      this.dropTargetPos !== null &&
      this.dragSourcePos !== null &&
      this.dragNode !== null
    ) {
      this.executeBlockMove()
    }

    // 清理拖拽状态
    this.dragActive = false
    this.dragSourcePos = null
    this.dragNode = null
    this.dropTargetPos = null

    StyleUtils.removeClass(this.dragHandleEl, 'notion-drag-handle--dragging')

    if (this.dropIndicatorEl) {
      if (this.dropIndicatorEl.parentNode) {
        this.dropIndicatorEl.parentNode.removeChild(this.dropIndicatorEl)
      }
      this.dropIndicatorEl = null
    }
  }

  private executeBlockMove(): void {
    const { state, dispatch } = this.view
    const sourcePos = this.dragSourcePos!
    const targetPos = this.dropTargetPos!
    const node = this.dragNode!

    // 不允许移动到自身
    if (targetPos === sourcePos) return

    const sourceEnd = sourcePos + node.nodeSize

    // 计算插入位置
    let insertPos: number
    if (this.dropBefore) {
      insertPos = targetPos
    } else {
      const targetNode = state.doc.nodeAt(targetPos)
      insertPos = targetPos + (targetNode ? targetNode.nodeSize : 0)
    }

    // 如果目标在源的后面，删除后位置要调整
    const adjustedInsertPos =
      insertPos > sourceEnd ? insertPos - node.nodeSize : insertPos

    // 不允许移动到相同位置（调整后）
    if (adjustedInsertPos === sourcePos) return

    const tr = state.tr
    // 先删除，再插入
    tr.delete(sourcePos, sourceEnd)
    tr.insert(adjustedInsertPos, node)
    dispatch(tr)
  }

  // ─── Lifecycle ────────────────────────────────────────────────────────────

  update(_view: EditorView): void {
    // No-op: positioning happens on mouse move
  }

  destroy(): void {
    if (this.hideTimer) clearTimeout(this.hideTimer)
    this.closeContextMenu()
    if (this.menuEl.parentNode) this.menuEl.parentNode.removeChild(this.menuEl)
    if (this.dropIndicatorEl?.parentNode) {
      this.dropIndicatorEl.parentNode.removeChild(this.dropIndicatorEl)
    }
    this.eventManager.cleanup()
  }
}

/**
 * 创建 Notion 模式扩展
 * 启用后在编辑器左侧显示浮动操作菜单，支持块拖拽排序
 */
export function createNotionModeExtension(_options: NotionModeOptions = {}) {
  return Extension.create({
    name: 'notionMode',

    addProseMirrorPlugins() {
      const editor = this.editor

      return [
        new Plugin({
          key: NOTION_MODE_KEY,
          view(editorView) {
            const menuView = new NotionFloatingMenuView(editorView, editor)
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
