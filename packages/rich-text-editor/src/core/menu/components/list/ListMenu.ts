import { Editor } from '@tiptap/core'
import { EventManager } from '@/utils/EventManager'
import { ContainerUtils, ElementUtils } from '@/core/dom'
import { EnhancedDropdownMenu, type DropdownMenuItem } from '@/core/dom/dropdown'

export class ListMenu {
  private editor: Editor
  private eventManager: EventManager
  private container: HTMLElement
  private editorRoot: HTMLElement
  private dropdown: EnhancedDropdownMenu | null = null

  constructor(container: HTMLElement, editor: Editor, eventManager: EventManager, editorRoot: HTMLElement) {
    this.container = container
    this.editor = editor
    this.eventManager = eventManager
    this.editorRoot = editorRoot
    this.render()
  }

  private render(): void {
    const menuContainer = ContainerUtils.createContainer({ className: 'rich:flex rich:items-center rich:gap-1' })
    
    // 创建列表下拉菜单
    const items: DropdownMenuItem[] = [
      { 
        id: 'bullet-list', 
        label: '无序列表', 
        icon: '•',
        onClick: () => this.editor.chain().focus().toggleBulletList().run(),
        active: () => this.editor.isActive('bulletList'),
        disabled: () => !this.editor.can().toggleBulletList()
      },
      { 
        id: 'ordered-list', 
        label: '有序列表', 
        icon: '1.',
        onClick: () => this.editor.chain().focus().toggleOrderedList().run(),
        active: () => this.editor.isActive('orderedList'),
        disabled: () => !this.editor.can().toggleOrderedList()
      },
      { 
        id: 'separator', 
        separator: true 
      }
    ]

    this.dropdown = new EnhancedDropdownMenu(menuContainer, {
      label: '',
      icon: '≡',
      title: '列表',
      items: items,
      className: 'rich:border-0 rich:bg-transparent rich:rounded',
      editorRoot: this.editorRoot
    })

    ElementUtils.appendChild(this.container, menuContainer)
  }

  public destroy(): void {
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
  }
}
