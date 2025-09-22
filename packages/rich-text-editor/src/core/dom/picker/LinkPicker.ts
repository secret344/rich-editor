import { BaseDropdownPanel, type BaseDropdownOptions } from '@/core/dom/dropdown/BaseDropdownPanel'
import { ElementUtils, EventUtils, FormUtils } from '@/core/dom/utils'

export interface LinkPickerOptions extends BaseDropdownOptions {
  onLinkInsert?: (url: string, text?: string) => void
  onLinkUpdate?: (url: string, text?: string) => void
  onLinkRemove?: () => void
  isEditing?: boolean
  currentLink?: { href: string; text?: string }
}

export class LinkPicker extends BaseDropdownPanel {
  private pickerOptions: LinkPickerOptions

  constructor(container: HTMLElement, options: LinkPickerOptions) {
    super(container, options)
    this.pickerOptions = options
  }

  protected createContent(): void {
    const panel = this.panel
    if (!panel) return

    // 清空面板内容
    ElementUtils.empty(panel)

    const isEditing = this.pickerOptions.isEditing || false
    const currentLink = this.pickerOptions.currentLink

    // 标题
    ElementUtils.createDiv({
      className: 'rich:text-sm rich:font-medium rich:text-gray-700 rich:mb-3',
      textContent: isEditing ? '编辑链接' : '插入链接',
      parent: panel
    })

    // URL输入框
    const urlContainer = ElementUtils.createDiv({
      className: 'rich:mb-3',
      parent: panel
    })
    
    ElementUtils.createLabel({
      className: 'rich:block rich:text-xs rich:text-gray-600 rich:mb-1',
      textContent: '链接地址',
      parent: urlContainer
    })
    
    const urlInput = FormUtils.createInput({
      type: 'url',
      placeholder: 'https://example.com',
      className: 'rich:w-full rich:px-3 rich:py-2 rich:text-sm rich:border rich:border-gray-300 rich:rounded focus:rich:outline-none focus:rich:ring-2 focus:rich:ring-blue-500',
      value: isEditing && currentLink?.href ? currentLink.href : '',
      parent: urlContainer
    })

    // 链接文案输入框
    const textContainer = ElementUtils.createDiv({
      className: 'rich:mb-4',
      parent: panel
    })
    
    ElementUtils.createLabel({
      className: 'rich:block rich:text-xs rich:text-gray-600 rich:mb-1',
      textContent: '链接文案（可选）',
      parent: textContainer
    })
    
    const textInput = FormUtils.createInput({
      type: 'text',
      placeholder: '显示文本',
      className: 'rich:w-full rich:px-3 rich:py-2 rich:text-sm rich:border rich:border-gray-300 rich:rounded focus:rich:outline-none focus:rich:ring-2 focus:rich:ring-blue-500',
      value: currentLink?.text || '',
      parent: textContainer
    })

    // 按钮组
    const buttonContainer = ElementUtils.createDiv({
      className: 'rich:flex rich:gap-2',
      parent: panel
    })
    
    // 插入/更新按钮
    const insertBtn = FormUtils.createButton({
      className: 'rich:flex-1 rich:px-3 rich:py-2 rich:bg-blue-500 rich:text-white rich:text-sm rich:rounded hover:rich:bg-blue-600 focus:rich:outline-none focus:rich:ring-2 focus:rich:ring-blue-500',
      textContent: isEditing ? '更新链接' : '插入链接',
      parent: buttonContainer
    })
    
    EventUtils.addEventListener(insertBtn, 'click', () => {
      const url = FormUtils.getValue(urlInput) as string
      const text = FormUtils.getValue(textInput) as string
      const trimmedUrl = url.trim()
      if (trimmedUrl) {
        if (isEditing && this.pickerOptions.onLinkUpdate) {
          this.pickerOptions.onLinkUpdate(trimmedUrl, text.trim())
        } else if (this.pickerOptions.onLinkInsert) {
          this.pickerOptions.onLinkInsert(trimmedUrl, text.trim())
        }
        this.hide()
      }
    })

    // 删除链接按钮（仅在编辑模式下显示）
    if (isEditing && this.pickerOptions.onLinkRemove) {
      const deleteBtn = FormUtils.createButton({
        className: 'rich:px-3 rich:py-2 rich:bg-red-500 rich:text-white rich:text-sm rich:rounded hover:rich:bg-red-600 focus:rich:outline-none focus:rich:ring-2 focus:rich:ring-red-500',
        textContent: '删除链接',
        parent: buttonContainer
      })
      
      EventUtils.addEventListener(deleteBtn, 'click', () => {
        if (this.pickerOptions.onLinkRemove) {
          this.pickerOptions.onLinkRemove()
        }
        this.hide()
      })
    }

    // 取消按钮
    const cancelBtn = FormUtils.createButton({
      className: 'rich:px-3 rich:py-2 rich:bg-gray-300 rich:text-gray-700 rich:text-sm rich:rounded hover:rich:bg-gray-400 focus:rich:outline-none focus:rich:ring-2 focus:rich:ring-gray-500',
      textContent: '取消',
      parent: buttonContainer
    })
    
    EventUtils.addEventListener(cancelBtn, 'click', () => {
      this.hide()
    })
  }

  public updateOptions(options: Partial<LinkPickerOptions>): void {
    this.pickerOptions = { ...this.pickerOptions, ...options }
    // 重新创建内容以反映新的选项
    this.createContent()
  }
}