import { Editor } from '@tiptap/core'
import { EventManager } from '@/utils/EventManager'
import { ContainerUtils, ElementUtils } from '@/core/dom'
import { EnhancedDropdownMenu, type DropdownMenuItem } from '@/core/dom/dropdown'

export class HeadingMenu {
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
    
    // 创建标题下拉菜单
    const items: DropdownMenuItem[] = [
      { 
        id: 'paragraph', 
        label: '正文', 
        onClick: () => this.editor.chain().focus().setParagraph().run(),
        active: () => this.editor.isActive('paragraph')
      },
      { 
        id: 'h1', 
        label: '标题 1', 
        onClick: () => this.editor.chain().focus().toggleHeading({ level: 1 }).run(),
        active: () => this.editor.isActive('heading', { level: 1 })
      },
      { 
        id: 'h2', 
        label: '标题 2', 
        onClick: () => this.editor.chain().focus().toggleHeading({ level: 2 }).run(),
        active: () => this.editor.isActive('heading', { level: 2 })
      },
      { 
        id: 'h3', 
        label: '标题 3', 
        onClick: () => this.editor.chain().focus().toggleHeading({ level: 3 }).run(),
        active: () => this.editor.isActive('heading', { level: 3 })
      },
      { 
        id: 'h4', 
        label: '标题 4', 
        onClick: () => this.editor.chain().focus().toggleHeading({ level: 4 }).run(),
        active: () => this.editor.isActive('heading', { level: 4 })
      },
      { 
        id: 'h5', 
        label: '标题 5', 
        onClick: () => this.editor.chain().focus().toggleHeading({ level: 5 }).run(),
        active: () => this.editor.isActive('heading', { level: 5 })
      },
      { 
        id: 'h6', 
        label: '标题 6', 
        onClick: () => this.editor.chain().focus().toggleHeading({ level: 6 }).run(),
        active: () => this.editor.isActive('heading', { level: 6 })
      }
    ]

    this.dropdown = new EnhancedDropdownMenu(menuContainer, {
      label: '',
      icon: 'H',
      title: '标题',
      items: items,
      className: 'rich:border-0 rich:bg-transparent hover:rich:bg-gray-100 rich:rounded',
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
