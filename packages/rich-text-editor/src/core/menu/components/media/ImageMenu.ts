import { Editor } from '@tiptap/core'
import { EventManager } from '@/utils/EventManager'
import { ButtonUtils, type ButtonInstance, ElementUtils, TextUtils } from '@/core/dom'
import { ImagePicker } from '@/core/dom/picker/ImagePicker'

export interface ImageMenuOptions {
  onImageUpload?: (file: File) => Promise<string>
}

export class ImageMenu {
  private editor: Editor
  private eventManager: EventManager
  private container: HTMLElement
  private editorRoot: HTMLElement
  private options: ImageMenuOptions
  private imageButton: HTMLElement | null = null
  private imageDropdown: ImagePicker | null = null
  private imageButtonInstance: ButtonInstance | null = null
  private editorEventCleanup: (() => void)[] = []

  constructor(container: HTMLElement, editor: Editor, eventManager: EventManager, editorRoot: HTMLElement, options: ImageMenuOptions = {}) {
    this.container = container
    this.editor = editor
    this.eventManager = eventManager
    this.editorRoot = editorRoot
    this.options = options
    this.render()
    this.initializeImageDropdown()
  }

  private render(): void {
    // 图片按钮（使用带状态管理的版本）
    this.imageButtonInstance = ButtonUtils.createIconButtonWithState({
      id: 'image',
      icon: '🖼️',
      title: '插入图片',
      onClick: (event) => this.toggleImageDropdown(event),
      isActive: () => false,
      isDisabled: () => this.editor.isDestroyed || !this.editor.isEditable
    })
    
    this.imageButton = this.imageButtonInstance.button
    if (this.imageButton) {
      ElementUtils.appendChild(this.container, this.imageButton)
    }
    
    // 监听编辑器状态变化，更新按钮状态
    const selectionUpdateHandler = () => {
      this.imageButtonInstance?.updateState()
    }
    const transactionHandler = () => {
      this.imageButtonInstance?.updateState()
    }
    
    this.editor.on('selectionUpdate', selectionUpdateHandler)
    this.editor.on('transaction', transactionHandler)
    
    // 保存清理函数
    this.editorEventCleanup.push(
      () => this.editor.off('selectionUpdate', selectionUpdateHandler),
      () => this.editor.off('transaction', transactionHandler)
    )
  }

  private initializeImageDropdown(): void {
    if (!this.imageButton) return

    // 创建图片选择器
    this.imageDropdown = new ImagePicker(this.container, {
      triggerButton: this.imageButton,
      width: 320,
      editorRoot: this.editorRoot,
      onImageSelect: (src: string) => this.insertImage(src),
      onImageUpload: this.options.onImageUpload
    })
  }

  private insertImage(src: string): void {
    this.editor.chain().focus().setImage({ src }).run()
  }

  private toggleImageDropdown(event?: Event): void {
    if (event) {
      event.stopPropagation()
    }
    this.imageDropdown?.toggle()
  }

  public destroy(): void {
    // 清理编辑器事件监听器
    this.editorEventCleanup.forEach(cleanup => cleanup())
    this.editorEventCleanup = []
    
    // 清理组件
    this.imageDropdown?.destroy()
    this.imageButtonInstance?.destroy()
    this.eventManager.cleanupForElement(this.container)
    
    // 清理DOM
    if (this.container) {
      TextUtils.setHTML(this.container, '')
    }
    
    // 清理引用
    this.imageButton = null
    this.imageDropdown = null
    this.imageButtonInstance = null
  }
}
