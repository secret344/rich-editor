/**
 * Notion 上下文菜单
 * 点击拖拽手柄时在块旁边显示的浮动操作面板（与 bubble 菜单风格统一）
 *
 * 注意：类名使用 `rich:` 前缀，这是本项目 Tailwind CSS 的自定义命名空间前缀，
 * 配置在 `styles.css` 的 `@import "tailwindcss" prefix(rich)` 中。
 */
import { ElementUtils, StyleUtils } from '@/core/dom/utils'
import { EventManager } from '@/utils/EventManager'
import type { Editor } from '@tiptap/core'
import { getTurnIntoItems, getBlockActionItems, type ContextMenuItem } from './menu-items'

/** 菜单面板的 Tailwind 类（深色 bubble 风格） */
const PANEL_CLASS =
  'rich:bg-gray-800 rich:rounded-lg rich:shadow-xl rich:overflow-y-auto rich:py-1'

/** 分组标题的 Tailwind 类 */
const GROUP_LABEL_CLASS =
  'rich:px-3 rich:pt-2 rich:pb-1 rich:text-xs rich:font-semibold rich:text-gray-500 rich:uppercase rich:tracking-wide'

/** 分隔线的 Tailwind 类 */
const SEPARATOR_CLASS = 'rich:border-t rich:border-gray-600 rich:my-1'

/** 菜单行的 Tailwind 类 */
const ITEM_ROW_CLASS =
  'rich:px-3 rich:py-2 rich:text-sm rich:cursor-pointer rich:flex rich:items-center rich:gap-2 rich:transition-colors rich:text-gray-200 hover:rich:bg-gray-700'

/** 菜单行图标的 Tailwind 类 */
const ITEM_ICON_CLASS = 'rich:text-base rich:text-gray-400'

/**
 * Notion 上下文菜单
 * 负责菜单 DOM 的创建、定位和销毁，与主浮动菜单解耦
 */
export class NotionContextMenu {
  private editor: Editor
  private eventManager: EventManager
  private onClose: () => void
  private menuEl: HTMLElement | null = null

  constructor(editor: Editor, eventManager: EventManager, onClose: () => void) {
    this.editor = editor
    this.eventManager = eventManager
    this.onClose = onClose
  }

  /** 在指定坐标打开菜单（与当前块绑定） */
  open(x: number, y: number, blockPos: number): void {
    this.close()

    this.menuEl = ElementUtils.createDiv({ className: PANEL_CLASS })
    StyleUtils.setStyles(this.menuEl, {
      position: 'fixed',
      zIndex: '200',
      left: `${x}px`,
      top: `${y}px`,
      minWidth: '200px',
      maxHeight: '320px',
    })

    this.appendGroupLabel('转换为')
    getTurnIntoItems().forEach((item) => this.appendItem(item, blockPos))

    this.appendSeparator()

    this.appendGroupLabel('操作')
    getBlockActionItems().forEach((item) => this.appendItem(item, blockPos))

    document.body.appendChild(this.menuEl)
    this.clampToViewport()
  }

  /** 关闭并移除菜单 DOM */
  close(): void {
    if (this.menuEl) {
      this.menuEl.parentNode?.removeChild(this.menuEl)
      this.menuEl = null
    }
  }

  /** 判断节点是否在菜单内（用于点击外部关闭） */
  contains(node: Node): boolean {
    return this.menuEl?.contains(node) ?? false
  }

  /** 当前菜单是否已打开 */
  isOpen(): boolean {
    return this.menuEl !== null
  }

  // ─── Private helpers ─────────────────────────────────────────────────────

  private appendGroupLabel(text: string): void {
    const label = ElementUtils.createElement({
      tagName: 'div',
      className: GROUP_LABEL_CLASS,
      textContent: text,
    })
    ElementUtils.appendChild(this.menuEl!, label)
  }

  private appendSeparator(): void {
    const sep = ElementUtils.createElement({
      tagName: 'div',
      className: SEPARATOR_CLASS,
    })
    ElementUtils.appendChild(this.menuEl!, sep)
  }

  private appendItem(item: ContextMenuItem, blockPos: number): void {
    const row = ElementUtils.createElement({
      tagName: 'div',
      className: ITEM_ROW_CLASS,
    })
    const icon = ElementUtils.createElement({
      tagName: 'span',
      className: ITEM_ICON_CLASS,
      textContent: item.icon,
    })
    const label = ElementUtils.createElement({
      tagName: 'span',
      textContent: item.label,
    })

    ElementUtils.appendChild(row, icon)
    ElementUtils.appendChild(row, label)

    this.eventManager.addEventListener(row, 'mousedown', (ev) => {
      ev.preventDefault()
      ev.stopPropagation()
      this.close()
      this.onClose()
      item.action(this.editor, blockPos)
    })

    ElementUtils.appendChild(this.menuEl!, row)
  }

  /** 防止菜单超出视口边缘 */
  private clampToViewport(): void {
    if (!this.menuEl) return
    const rect = this.menuEl.getBoundingClientRect()
    if (rect.right > window.innerWidth) {
      StyleUtils.setStyle(
        this.menuEl,
        'left',
        `${window.innerWidth - rect.width - 8}px`
      )
    }
    if (rect.bottom > window.innerHeight) {
      StyleUtils.setStyle(
        this.menuEl,
        'top',
        `${window.innerHeight - rect.height - 8}px`
      )
    }
  }
}
