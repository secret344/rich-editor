/**
 * 引用块菜单组件
 * 提供引用块插入和切换功能
 */
import { Editor } from '@tiptap/core'
import { EventManager } from '@/utils/EventManager'
import { ButtonUtils, ContainerUtils, ElementUtils, TextUtils } from '@/core/dom'
import type { ButtonInstance } from '@/core/dom/button/ButtonUtils'

export class BlockquoteMenu {
  private container: HTMLElement
  private editor: Editor
  private eventManager: EventManager
  private blockquoteButtonInstance: ButtonInstance | null = null
  private editorEventCleanup: Array<() => void> = []

  constructor(container: HTMLElement, editor: Editor, eventManager: EventManager) {
    this.container = container
    this.editor = editor
    this.eventManager = eventManager
    this.render()
  }

  private render(): void {
    const menuContainer = ContainerUtils.createContainer({ className: 'rich:flex rich:items-center rich:gap-1' })
    
    // 引用块按钮
    this.blockquoteButtonInstance = ButtonUtils.createIconButtonWithState({
      id: 'blockquote',
      icon: '❝',
      title: '引用块',
      onClick: () => this.toggleBlockquote(),
      isActive: () => this.editor.isActive('blockquote'),
      isDisabled: () => !this.editor.can().toggleBlockquote()
    })

    if (this.blockquoteButtonInstance.button) {
      ElementUtils.appendChild(menuContainer, this.blockquoteButtonInstance.button)
    }

    // 监听编辑器状态变化
    const updateHandler = () => {
      this.blockquoteButtonInstance?.updateState()
    }
    
    this.editor.on('selectionUpdate', updateHandler)
    this.editor.on('transaction', updateHandler)
    
    // 保存清理函数
    this.editorEventCleanup.push(
      () => this.editor.off('selectionUpdate', updateHandler),
      () => this.editor.off('transaction', updateHandler)
    )

    ElementUtils.appendChild(this.container, menuContainer)
  }

  private toggleBlockquote(): void {
    this.editor.chain().focus().toggleBlockquote().run()
  }

  public destroy(): void {
    // 清理编辑器事件监听器
    this.editorEventCleanup.forEach(cleanup => cleanup())
    this.editorEventCleanup = []
    
    // 清理按钮实例
    this.blockquoteButtonInstance?.destroy()
    this.eventManager.cleanupForElement(this.container)
    
    // 清理DOM
    if (this.container) {
      TextUtils.setHTML(this.container, '')
    }
    
    // 清理引用
    this.blockquoteButtonInstance = null
  }
}