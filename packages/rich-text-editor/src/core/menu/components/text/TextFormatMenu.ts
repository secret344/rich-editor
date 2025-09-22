import { Editor } from '@tiptap/core'
import { EventManager } from '@/utils/EventManager'
import { ContainerUtils, ButtonUtils, type ButtonInstance, ElementUtils } from '@/core/dom'
import { StateManager } from '@/utils/StateManager'

export class TextFormatMenu {
  private editor: Editor
  private eventManager: EventManager
  private container: HTMLElement
  private buttonInstances: ButtonInstance[] = []

  constructor(container: HTMLElement, editor: Editor, eventManager: EventManager) {
    this.container = container
    this.editor = editor
    this.eventManager = eventManager
    this.render()
  }

  private render(): void {
    const menuContainer = ContainerUtils.createContainer({ className: 'rich:flex rich:items-center rich:gap-1' })
    
    // 加粗按钮
    this.createButton({
      id: 'bold',
      icon: 'B',
      title: '加粗',
      onClick: () => this.editor.chain().focus().toggleBold().run(),
      isActive: () => this.editor.isActive('bold'),
      isDisabled: () => !this.editor.can().toggleBold()
    }, menuContainer)

    // 斜体按钮
    this.createButton({
      id: 'italic',
      icon: 'I',
      title: '斜体',
      onClick: () => this.editor.chain().focus().toggleItalic().run(),
      isActive: () => this.editor.isActive('italic'),
      isDisabled: () => !this.editor.can().toggleItalic()
    }, menuContainer)

    // 下划线按钮
    this.createButton({
      id: 'underline',
      icon: 'U',
      title: '下划线',
      onClick: () => this.editor.chain().focus().toggleUnderline().run(),
      isActive: () => this.editor.isActive('underline'),
      isDisabled: () => !this.editor.can().toggleUnderline()
    }, menuContainer)

    // 删除线按钮
    this.createButton({
      id: 'strike',
      icon: 'S',
      title: '删除线',
      onClick: () => this.editor.chain().focus().toggleStrike().run(),
      isActive: () => this.editor.isActive('strike'),
      isDisabled: () => !this.editor.can().toggleStrike()
    }, menuContainer)

    ElementUtils.appendChild(this.container, menuContainer)
  }

  private createButton(options: {
    id: string
    icon: string
    title: string
    onClick: () => void
    isActive: () => boolean
    isDisabled: () => boolean
    className?: string
  }, container: HTMLElement): void {
    const buttonInstance = ButtonUtils.createIconButtonWithState({
      id: options.id,
      icon: options.icon,
      title: options.title,
      onClick: options.onClick,
      isActive: options.isActive,
      isDisabled: options.isDisabled,
      className: options.className
    })
    
    // 将按钮实例注册到状态管理器
    StateManager.getInstance().register(buttonInstance)
    this.buttonInstances.push(buttonInstance)
    
    ElementUtils.appendChild(container, buttonInstance.button)
  }

  public destroy(): void {
    // 清理按钮实例并从状态管理器注销
    this.buttonInstances.forEach(buttonInstance => {
      StateManager.getInstance().unregister(buttonInstance)
      buttonInstance.destroy()
    })
    this.buttonInstances = []
    
    // 清理所有事件监听器
    this.eventManager.cleanupForElement(this.container)
    
    // 清理容器内容
    if (this.container) {
      this.container.innerHTML = ''
    }
  }
}
