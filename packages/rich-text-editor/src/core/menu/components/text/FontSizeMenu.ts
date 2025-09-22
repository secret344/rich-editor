import { Editor } from '@tiptap/core'
import { EventManager } from '@/utils/EventManager'
import { ContainerUtils, ElementUtils } from '@/core/dom'
import { EnhancedDropdownMenu, type DropdownMenuItem } from '@/core/dom/dropdown'
import { StateManager, type StateUpdatable } from '@/utils/StateManager'

export class FontSizeMenu implements StateUpdatable {
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
      textContent: this.getCurrentFontSizeDisplay(),
      attributes: {
        title: '字体大小'
      }
    })
    
    // 创建字体大小下拉菜单
    const fontSizes = [
      { size: '12px', label: '12px' },
      { size: '14px', label: '14px' },
      { size: '16px', label: '16px' },
      { size: '18px', label: '18px' },
      { size: '20px', label: '20px' },
      { size: '24px', label: '24px' },
      { size: '28px', label: '28px' },
      { size: '32px', label: '32px' },
      { size: '36px', label: '36px' },
      { size: '48px', label: '48px' },
      { size: '72px', label: '72px' }
    ]

    const items: DropdownMenuItem[] = [
      {
        id: 'default',
        label: '默认',
        onClick: () => {
          this.editor.chain().focus().unsetFontSize().run()
          this.updateState()
        },
        active: () => false
      },
      ...fontSizes.map(fontSize => ({
        id: `font-size-${fontSize.size}`,
        label: fontSize.label,
        onClick: () => {
          this.editor.chain().focus().setFontSize(fontSize.size).run()
          this.updateState()
        },
        active: () => this.editor.getAttributes('textStyle').fontSize === fontSize.size
      }))
    ]

    this.dropdown = new EnhancedDropdownMenu(menuContainer, {
      label: '',
      icon: '',
      title: '字体大小',
      items: items,
      className: 'rich:border-0 rich:bg-transparent rich:rounded',
      editorRoot: this.editorRoot,
      triggerButton: this.triggerButton
    })

    ElementUtils.appendChild(this.container, menuContainer)
  }

  private getCurrentFontSizeDisplay(): string {
    const fontSize = this.editor.getAttributes('textStyle').fontSize
    return fontSize || '默认'
  }

  public updateState(): void {
    if (this.triggerButton) {
      this.triggerButton.textContent = this.getCurrentFontSizeDisplay()
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