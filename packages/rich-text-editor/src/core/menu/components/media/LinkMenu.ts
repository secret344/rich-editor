import { Editor } from '@tiptap/core'
import { EventManager } from '@/utils/EventManager'
import { ButtonUtils, type ButtonInstance, ElementUtils } from '@/core/dom'
import { LinkPicker } from '@/core/dom/picker/LinkPicker'

export class LinkMenu {
  private editor: Editor
  private eventManager: EventManager
  private container: HTMLElement
  private editorRoot: HTMLElement
  private linkButton: HTMLElement | null = null
  private linkDropdown: LinkPicker | null = null
  private linkButtonInstance: ButtonInstance | null = null
  private editorEventCleanup: (() => void)[] = []

  constructor(container: HTMLElement, editor: Editor, eventManager: EventManager, editorRoot: HTMLElement) {
    this.container = container
    this.editor = editor
    this.eventManager = eventManager
    this.editorRoot = editorRoot
    this.render()
    this.initializeLinkDropdown()
  }

  private render(): void {
    // 链接按钮（使用带状态管理的版本）
    this.linkButtonInstance = ButtonUtils.createIconButtonWithState({
      id: 'link',
      icon: '🔗',
      title: '插入链接',
      onClick: (event) => this.toggleLinkDropdown(event),
      isActive: () => this.editor.isActive('link'),
      isDisabled: () => this.editor.isDestroyed || !this.editor.isEditable
    })
    
    this.linkButton = this.linkButtonInstance.button
    if (this.linkButton) {
      ElementUtils.appendChild(this.container, this.linkButton)
    }
    
    // 监听编辑器状态变化，更新按钮状态
    const selectionUpdateHandler = () => {
      this.linkButtonInstance?.updateState()
    }
    const transactionHandler = () => {
      this.linkButtonInstance?.updateState()
    }
    
    this.editor.on('selectionUpdate', selectionUpdateHandler)
    this.editor.on('transaction', transactionHandler)
    
    // 保存清理函数
    this.editorEventCleanup.push(
      () => this.editor.off('selectionUpdate', selectionUpdateHandler),
      () => this.editor.off('transaction', transactionHandler)
    )
  }

  private initializeLinkDropdown(): void {
    if (!this.linkButton) return

    // 创建链接选择器
    this.linkDropdown = new LinkPicker(this.container, {
      triggerButton: this.linkButton,
      width: 300,
      editorRoot: this.editorRoot,
      onLinkInsert: (url: string, text?: string) => this.insertLinkWithText(url, text),
      onLinkUpdate: (url: string, text?: string) => this.updateLink(url, text),
      onLinkRemove: () => this.editor.chain().focus().unsetLink().run()
    })
  }



  private insertLinkWithText(url: string, text?: string): void {
    if (text) {
      // 如果有文本，先插入文本，然后选中文本，再设置链接
      this.editor.chain().focus().insertContent(text).run()
      // 选中刚插入的文本
      const { from, to } = this.editor.state.selection
      const textLength = text.length
      this.editor.commands.setTextSelection({ from: from - textLength, to })
      // 设置链接
      this.editor.chain().focus().setLink({ href: url }).run()
    } else {
      // 如果没有文本，直接设置链接（使用当前选中的文本）
      this.editor.chain().focus().setLink({ href: url }).run()
    }
  }

  private updateLink(url: string, text?: string): void {
    // 确保当前选择在链接内
    if (!this.editor.isActive('link')) {
      return
    }

    if (text) {
      // 更新链接文本和URL
      // 先扩展选择到整个链接范围，然后替换文本并重新设置链接
      this.editor.chain().focus().extendMarkRange('link').deleteSelection().insertContent(text).run()
      // 选中刚插入的文本
      const currentPos = this.editor.state.selection.from
      const textLength = text.length
      this.editor.commands.setTextSelection({ from: currentPos - textLength, to: currentPos })
      // 设置链接
      this.editor.chain().focus().setLink({ href: url }).run()
    } else {
      // 只更新链接URL，保持原有文本
      // 使用 extendMarkRange 扩展选择到整个链接范围
      this.editor.chain().focus().extendMarkRange('link').updateAttributes('link', { href: url }).run()
    }
  }

  private toggleLinkDropdown(event?: Event): void {
    if (event) {
      event.stopPropagation()
    }
    
    // 更新LinkPicker的选项以反映当前编辑状态
    const isEditing = this.editor.isActive('link')
    const currentLink = isEditing ? this.editor.getAttributes('link') : null
    const selectedText = this.editor.state.doc.textBetween(
      this.editor.state.selection.from,
      this.editor.state.selection.to
    )
    
    this.linkDropdown?.updateOptions({
      isEditing,
      currentLink: currentLink ? { href: currentLink.href, text: selectedText } : undefined
    })
    
    this.linkDropdown?.toggle()
  }



  public destroy(): void {
    // 清理编辑器事件监听器
    this.editorEventCleanup.forEach(cleanup => cleanup())
    this.editorEventCleanup = []
    
    // 清理组件
    this.linkDropdown?.destroy()
    this.linkButtonInstance?.destroy()
    this.eventManager.cleanupForElement(this.container)
    
    // 清理DOM
    if (this.container) {
      this.container.innerHTML = ''
    }
    
    // 清理引用
    this.linkButton = null
    this.linkDropdown = null
    this.linkButtonInstance = null
  }
}
