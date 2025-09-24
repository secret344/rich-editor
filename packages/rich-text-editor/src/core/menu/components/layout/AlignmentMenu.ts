import { Editor } from '@tiptap/core'
import { EventManager } from '@/utils/EventManager'
import { ContainerUtils, ElementUtils } from '@/core/dom'
import { EnhancedDropdownMenu, type DropdownMenuItem } from '@/core/dom/dropdown'

export class AlignmentMenu {
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
    
    // 创建对齐下拉菜单
    const items: DropdownMenuItem[] = [
      { 
        id: 'align-left', 
        label: '左对齐', 
        icon: '≡',
        onClick: () => {
          this.editor.chain().focus().setTextAlign('left').run()
          this.editor.chain().focus().setNodeAlign('flex-start').run()
        },
        active: () => this.editor.isActive({ textAlign: 'left' }) || this.editor.isActive({ nodeAlign: 'flex-start' }),
        disabled: () => !this.editor.can().setTextAlign('left') && !this.editor.can().setNodeAlign('flex-start')
      },
      { 
        id: 'align-center', 
        label: '居中对齐', 
        icon: '≡',
        onClick: () => {
          this.editor.chain().focus().setTextAlign('center').run()
          this.editor.chain().focus().setNodeAlign('center').run()
        },
        active: () => this.editor.isActive({ textAlign: 'center' }) || this.editor.isActive({ nodeAlign: 'center' }),
        disabled: () => !this.editor.can().setTextAlign('center') && !this.editor.can().setNodeAlign('center')
      },
      { 
        id: 'align-right', 
        label: '右对齐', 
        icon: '≡',
        onClick: () => {
          this.editor.chain().focus().setTextAlign('right').run()
          this.editor.chain().focus().setNodeAlign('flex-end').run()
        },
        active: () => this.editor.isActive({ textAlign: 'right' }) || this.editor.isActive({ nodeAlign: 'flex-end' }),
        disabled: () => !this.editor.can().setTextAlign('right') && !this.editor.can().setNodeAlign('flex-end')
      },
      { 
        id: 'align-justify', 
        label: '两端对齐', 
        icon: '≡',
        onClick: () => this.editor.chain().focus().setTextAlign('justify').run(),
        active: () => this.editor.isActive({ textAlign: 'justify' }),
        disabled: () => !this.editor.can().setTextAlign('justify')
      }
    ]

    this.dropdown = new EnhancedDropdownMenu(menuContainer, {
      label: '',
      icon: '≡',
      title: '文本对齐',
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
