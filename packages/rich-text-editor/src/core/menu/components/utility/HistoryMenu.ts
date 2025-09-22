import { Editor } from '@tiptap/core'
import { EventManager } from '@/utils/EventManager'
import { ContainerUtils, ButtonUtils, ElementUtils, TextUtils } from '@/core/dom'

export class HistoryMenu {
  private editor: Editor
  private eventManager: EventManager
  private container: HTMLElement
  private editorEventCleanup: Array<() => void> = []

  constructor(container: HTMLElement, editor: Editor, eventManager: EventManager) {
    this.container = container
    this.editor = editor
    this.eventManager = eventManager
    this.render()
  }

  private render(): void {
    const menuContainer = ContainerUtils.createContainer({ className: 'rich:flex rich:items-center rich:gap-1' })
    
    // 撤销按钮
    this.createButton({
      id: 'undo',
      icon: '↶',
      title: '撤销',
      onClick: () => {
        this.editor.chain().focus().undo().run()
      },
      isActive: () => false,
      isDisabled: () => !this.editor.can().undo()
    }, menuContainer)

    // 重做按钮
    this.createButton({
      id: 'redo',
      icon: '↷',
      title: '重做',
      onClick: () => {
        this.editor.chain().focus().redo().run()
      },
      isActive: () => false,
      isDisabled: () => !this.editor.can().redo()
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
    const button = ButtonUtils.createIconButton({
      id: options.id,
      icon: options.icon,
      title: options.title,
      className: options.className
    })
    
    // 设置初始禁用状态
    button.disabled = options.isDisabled()
    
    // 使用EventManager绑定点击事件
    this.eventManager.addEventListener(button, 'click', () => {
      if (!button.disabled) {
        options.onClick()
      }
    })
    
    // 监听编辑器状态变化，更新按钮状态
    const updateButtonState = () => {
      const disabled = options.isDisabled()
      button.disabled = disabled
      if (disabled) {
        button.classList.add('rich:opacity-50', 'rich:cursor-not-allowed')
      } else {
        button.classList.remove('rich:opacity-50', 'rich:cursor-not-allowed')
      }
    }
    
    this.editor.on('transaction', updateButtonState)
    this.editor.on('selectionUpdate', updateButtonState)
    
    // 保存清理函数
    this.editorEventCleanup.push(
      () => this.editor.off('transaction', updateButtonState),
      () => this.editor.off('selectionUpdate', updateButtonState)
    )
    
    ElementUtils.appendChild(container, button)
  }

  public destroy(): void {
    // 清理编辑器事件监听器
    this.editorEventCleanup.forEach(cleanup => cleanup())
    this.editorEventCleanup = []
    
    // 清理所有事件监听器
    this.eventManager.cleanupForElement(this.container)
    
    // 清理容器内容
    if (this.container) {
      TextUtils.setHTML(this.container, '')
    }
  }
}
