import { Editor } from '@tiptap/core'
import { EventManager } from '@/utils/EventManager'
import { ContainerUtils, ElementUtils } from '@/core/dom'
import { EnhancedDropdownMenu, type DropdownMenuItem } from '@/core/dom/dropdown'
import { StateManager, type StateUpdatable } from '@/utils/StateManager'

export class LineHeightMenu implements StateUpdatable {
  private editor: Editor
  private eventManager: EventManager
  private container: HTMLElement
  private editorRoot: HTMLElement
  private dropdown: EnhancedDropdownMenu | null = null
  private triggerButton: HTMLElement | null = null

  constructor(container: HTMLElement, editor: Editor, eventManager: EventManager, editorRoot: HTMLElement) {
    this.container = container
    this.editor = editor
    this.eventManager = eventManager
    this.editorRoot = editorRoot
    this.render()
    
    // 注册到状态管理器
    StateManager.getInstance().register(this)
  }

  private render(): void {
    const menuContainer = ContainerUtils.createContainer({ className: 'rich:flex rich:items-center rich:gap-1' })
    
    // 创建自定义触发按钮
    this.triggerButton = ElementUtils.createElement({
      tagName: 'button',
      className: 'rich:px-2 rich:py-1 rich:text-sm rich:border rich:border-gray-300 rich:rounded rich:bg-white hover:rich:bg-gray-50 rich:cursor-pointer rich:min-w-[60px] rich:text-center',
      textContent: this.getCurrentLineHeightDisplay(),
      attributes: {
        title: '行高'
      }
    })
    
    // 创建行高下拉菜单
    const lineHeights = [
      { height: '1', label: '1.0' },
      { height: '1.15', label: '1.15' },
      { height: '1.2', label: '1.2' },
      { height: '1.25', label: '1.25' },
      { height: '1.3', label: '1.3' },
      { height: '1.4', label: '1.4' },
      { height: '1.5', label: '1.5' },
      { height: '1.6', label: '1.6' },
      { height: '1.8', label: '1.8' },
      { height: '2', label: '2.0' },
      { height: '2.5', label: '2.5' },
      { height: '3', label: '3.0' }
    ]

    const items: DropdownMenuItem[] = [
      {
        id: 'default',
        label: '默认',
        onClick: () => {
          this.editor.chain().focus().unsetLineHeight().run()
        },
        active: () => false
      },
      ...lineHeights.map(lineHeight => ({
        id: `line-height-${lineHeight.height}`,
        label: lineHeight.label,
        onClick: () => {
          this.editor.chain().focus().setLineHeight(lineHeight.height).run()
        },
        active: () => this.editor.getAttributes('textStyle').lineHeight === lineHeight.height
      }))
    ]

    this.dropdown = new EnhancedDropdownMenu(menuContainer, {
      label: '',
      icon: '',
      title: '行高',
      items: items,
      className: 'rich:border-0 rich:bg-transparent rich:rounded',
      editorRoot: this.editorRoot,
      triggerButton: this.triggerButton
    })

    ElementUtils.appendChild(this.container, menuContainer)
  }

  private getCurrentLineHeightDisplay(): string {
    const lineHeight = this.editor.getAttributes('textStyle').lineHeight
    return lineHeight || '默认'
  }

  public updateState(): void {
    if (this.triggerButton) {
      this.triggerButton.textContent = this.getCurrentLineHeightDisplay()
    }
  }

  public destroy(): void {
    // 从状态管理器注销
    StateManager.getInstance().unregister(this)
    
    // 关闭并销毁下拉菜单
    if (this.dropdown) {
      this.dropdown.destroy()
      this.dropdown = null
    }
    
    // 清理所有事件监听器
    this.eventManager.cleanupForElement(this.container)
    
    // 清理容器内容
    if (this.container) {
      this.container.innerHTML = ''
    }
    
    // 清理引用
    this.triggerButton = null
  }
}