/**
 * Notion 模式扩展
 * 提供类 Notion 的编辑体验：左侧浮动菜单、拖拽排序、块操作菜单
 */
import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { ElementUtils, StyleUtils } from '@/core/dom/utils'
import { EventManager } from '@/utils/EventManager'
import { NotionContextMenu } from './NotionContextMenu'
import type { Editor } from '@tiptap/core'
import type { EditorView } from '@tiptap/pm/view'
import type { Node as PMNode } from '@tiptap/pm/model'
import type { AIOptions } from '@/core/extensions/ai'

export interface NotionModeOptions {
  /**
   * AI 配置（可选）。
   * 如果提供，则在每个块的上下文菜单底部追加"AI 助手"入口，
   * 点击后选中该块并打开 AI 面板。
   * 同时请确保已注册 createAIExtension(aiOptions)。
   */
  aiOptions?: AIOptions
}

const NOTION_MODE_KEY = new PluginKey('notionMode')

/** 菜单宽度（px）– 用于计算左侧定位偏移 */
const FLOATING_MENU_WIDTH = 60

/** 鼠标离开后隐藏菜单的延迟（ms） */
const HIDE_DELAY_MS = 400

/**
 * Notion 浮动菜单视图
 * 管理左侧浮动菜单的创建、定位和交互，以及块的拖拽排序
 */
class NotionFloatingMenuView {
  private editor: Editor
  private view: EditorView
  private eventManager: EventManager = new EventManager()

  // 浮动菜单 DOM 元素
  private menuEl!: HTMLElement
  private addBtnEl!: HTMLElement
  private dragHandleEl!: HTMLElement

  // 当前悬停块位置
  private currentBlockPos: number | null = null

  // 菜单悬停状态（防止移到菜单时菜单消失）
  private menuHovered = false
  private hideTimer: ReturnType<typeof setTimeout> | null = null

  // 上下文菜单（独立模块）
  private contextMenu: NotionContextMenu

  // 拖拽状态
  private dragActive = false
  private dragSourcePos: number | null = null
  private dragNode: PMNode | null = null
  private dropIndicatorEl: HTMLElement | null = null
  private dropTargetPos: number | null = null
  private dropBefore = true

  constructor(view: EditorView, editor: Editor, options: NotionModeOptions) {
    this.view = view
    this.editor = editor
    this.contextMenu = new NotionContextMenu(editor, this.eventManager, () =>
      this.hideMenu(), options.aiOptions
    )
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
      innerHTML: '&#x283F;', // ⠿ six-dot braille pattern
      attributes: { title: '拖拽移动 / 点击查看操作' },
    })

    ElementUtils.appendChild(this.menuEl, this.addBtnEl)
    ElementUtils.appendChild(this.menuEl, this.dragHandleEl)

    document.body.appendChild(this.menuEl)
  }

  // ─── Event Binding ────────────────────────────────────────────────────────

  private bindEvents(): void {
    const editorDom = this.view.dom as HTMLElement

    // 追踪编辑器内鼠标移动以定位菜单
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

    // 拖拽手柄 mousedown（启动拖拽排序）
    this.eventManager.addEventListener(this.dragHandleEl, 'mousedown', (e) =>
      this.onDragMouseDown(e as MouseEvent)
    )

    // 点击文档其他区域关闭上下文菜单
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

    // 只处理顶层块（depth=1）
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
      if (!this.menuHovered) this.hideMenu()
    }, HIDE_DELAY_MS)
  }

  // ─── Menu Positioning ─────────────────────────────────────────────────────

  private positionMenu(blockDOM: HTMLElement): void {
    if (this.hideTimer) {
      clearTimeout(this.hideTimer)
      this.hideTimer = null
    }

    const rect = blockDOM.getBoundingClientRect()

    // 优先放到块左侧；若超出视口则贴块内部左边
    let left = rect.left - FLOATING_MENU_WIDTH - 4
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

    if (this.contextMenu.isOpen()) {
      this.contextMenu.close()
    } else if (this.currentBlockPos !== null) {
      this.contextMenu.open(e.clientX, e.clientY, this.currentBlockPos)
    }
  }

  private onDocumentClick(e: MouseEvent): void {
    if (this.contextMenu.isOpen() && !this.contextMenu.contains(e.target as Node)) {
      this.contextMenu.close()
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

    // 创建拖拽放置指示线
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

    if (
      this.dropTargetPos !== null &&
      this.dragSourcePos !== null &&
      this.dragNode !== null
    ) {
      this.executeBlockMove()
    }

    this.dragActive = false
    this.dragSourcePos = null
    this.dragNode = null
    this.dropTargetPos = null

    StyleUtils.removeClass(this.dragHandleEl, 'notion-drag-handle--dragging')

    if (this.dropIndicatorEl) {
      this.dropIndicatorEl.parentNode?.removeChild(this.dropIndicatorEl)
      this.dropIndicatorEl = null
    }
  }

  private executeBlockMove(): void {
    const { state, dispatch } = this.view
    const sourcePos = this.dragSourcePos!
    const targetPos = this.dropTargetPos!
    const node = this.dragNode!

    if (targetPos === sourcePos) return

    const sourceEnd = sourcePos + node.nodeSize

    // 计算插入位置（目标在源之后时需减去源节点大小）
    let insertPos = this.dropBefore
      ? targetPos
      : targetPos + (state.doc.nodeAt(targetPos)?.nodeSize ?? 0)

    const adjustedInsertPos =
      insertPos > sourceEnd ? insertPos - node.nodeSize : insertPos

    if (adjustedInsertPos === sourcePos) return

    const tr = state.tr
    tr.delete(sourcePos, sourceEnd)
    tr.insert(adjustedInsertPos, node)
    dispatch(tr)
  }

  // ─── Lifecycle ────────────────────────────────────────────────────────────

  update(_view: EditorView): void {
    // No-op: positioning is driven by mousemove events
  }

  destroy(): void {
    if (this.hideTimer) clearTimeout(this.hideTimer)
    this.contextMenu.close()
    this.menuEl.parentNode?.removeChild(this.menuEl)
    this.dropIndicatorEl?.parentNode?.removeChild(this.dropIndicatorEl)
    this.eventManager.cleanup()
  }
}

/**
 * 创建 Notion 模式扩展
 * 启用后在编辑器左侧显示浮动操作菜单，支持块拖拽排序
 */
export function createNotionModeExtension(options: NotionModeOptions = {}) {
  return Extension.create({
    name: 'notionMode',

    addProseMirrorPlugins() {
      const editor = this.editor

      return [
        new Plugin({
          key: NOTION_MODE_KEY,
          view(editorView) {
            const menuView = new NotionFloatingMenuView(editorView, editor, options)
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
