import { BaseDropdownPanel, type BaseDropdownOptions } from '@/core/dom/dropdown/BaseDropdownPanel'
import { ElementUtils, EventUtils, FormUtils, StyleUtils } from '@/core/dom/utils'
import { ImageUploader } from '@/core/dom/upload/ImageUploader'

export interface ImagePickerOptions extends BaseDropdownOptions {
  onImageSelect?: (src: string) => void
  onImageUpload?: (file: File) => Promise<string>
}

export class ImagePicker extends BaseDropdownPanel {
  private pickerOptions: ImagePickerOptions
  private imageUploader: ImageUploader | null = null
  private activeFileReaders: FileReader[] = []

  constructor(container: HTMLElement, options: ImagePickerOptions) {
    super(container, options)
    this.pickerOptions = options
    this.initializeImageUploader()
  }

  protected createContent(): void {
    const panel = this.panel
    if (!panel) return

    // 清空面板内容
    ElementUtils.empty(panel)

    // 标题
    ElementUtils.createDiv({
      className: 'rich:text-sm rich:font-medium rich:text-gray-700 rich:mb-3',
      textContent: '插入图片',
      parent: panel
    })

    // 文件上传区域
    const dropZone = ElementUtils.createDiv({
      className: 'rich:border-2 rich:border-dashed rich:border-gray-300 rich:rounded-lg rich:p-6 rich:text-center rich:mb-4 rich:cursor-pointer hover:rich:border-blue-400 hover:rich:bg-blue-50 rich:transition-colors',
      parent: panel
    })

    ElementUtils.createDiv({
      className: 'rich:text-4xl rich:mb-2',
      textContent: '📁',
      parent: dropZone
    })

    ElementUtils.createDiv({
      className: 'rich:text-sm rich:text-gray-600 rich:mb-1',
      textContent: '点击选择图片或拖拽到此处',
      parent: dropZone
    })

    ElementUtils.createDiv({
      className: 'rich:text-xs rich:text-gray-500',
      textContent: '支持 JPG、PNG、GIF 格式',
      parent: dropZone
    })

    // 拖拽事件
    EventUtils.addEventListener(dropZone, 'dragover', (e) => {
      e.preventDefault()
      StyleUtils.addClass(dropZone, 'rich:border-blue-400 rich:bg-blue-50')
    })

    EventUtils.addEventListener(dropZone, 'dragleave', (e) => {
      e.preventDefault()
      StyleUtils.removeClass(dropZone, 'rich:border-blue-400 rich:bg-blue-50')
    })

    EventUtils.addEventListener(dropZone, 'drop', (e) => {
      e.preventDefault()
      StyleUtils.removeClass(dropZone, 'rich:border-blue-400 rich:bg-blue-50')
      
      const files = (e as DragEvent).dataTransfer?.files
      if (files && files.length > 0) {
        this.handleFileUpload(files[0])
      }
    })
    
    EventUtils.addEventListener(dropZone, 'click', () => {
      this.imageUploader?.triggerSelect()
    })

    // 分隔线
    ElementUtils.createDiv({
      className: 'rich:border-t rich:border-gray-200 rich:my-4',
      parent: panel
    })

    // URL输入框
    const urlContainer = ElementUtils.createDiv({
      className: 'rich:mb-4',
      parent: panel
    })
    
    ElementUtils.createLabel({
      className: 'rich:block rich:text-xs rich:text-gray-600 rich:mb-1',
      textContent: '或输入图片链接',
      parent: urlContainer
    })
    
    const urlInput = FormUtils.createInput({
      type: 'url',
      placeholder: 'https://example.com/image.jpg',
      className: 'rich:w-full rich:px-3 rich:py-2 rich:text-sm rich:border rich:border-gray-300 rich:rounded focus:rich:outline-none focus:rich:ring-2 focus:rich:ring-blue-500',
      parent: urlContainer
    })

    // 按钮组
    const buttonContainer = ElementUtils.createDiv({
      className: 'rich:flex rich:gap-2',
      parent: panel
    })
    
    // 插入按钮
    const insertBtn = FormUtils.createButton({
      className: 'rich:flex-1 rich:px-3 rich:py-2 rich:bg-blue-500 rich:text-white rich:text-sm rich:rounded hover:rich:bg-blue-600 focus:rich:outline-none focus:rich:ring-2 focus:rich:ring-blue-500',
      textContent: '插入图片',
      parent: buttonContainer
    })
    
    EventUtils.addEventListener(insertBtn, 'click', () => {
      const url = FormUtils.getValue(urlInput) as string
      const trimmedUrl = url.trim()
      if (trimmedUrl) {
        this.insertImage(trimmedUrl)
        this.hide()
      }
    })

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

  private initializeImageUploader(): void {
    // 创建临时容器
    const tempContainer = ElementUtils.createDiv()
    
    this.imageUploader = new ImageUploader(tempContainer, {
      onImageSelect: (file) => this.handleFileUpload(file)
    })
  }

  private async handleFileUpload(file: File): Promise<void> {
    try {
      if (this.pickerOptions.onImageUpload) {
        // 使用自定义上传方法
        const url = await this.pickerOptions.onImageUpload(file)
        this.insertImage(url)
      } else {
        // 使用默认的base64转换
        const reader = new FileReader()
        this.activeFileReaders.push(reader)
        
        reader.onload = (e) => {
          const result = e.target?.result as string
          if (result) {
            this.insertImage(result)
          }
          // 从活跃列表中移除
          const index = this.activeFileReaders.indexOf(reader)
          if (index > -1) {
            this.activeFileReaders.splice(index, 1)
          }
        }
        
        reader.onerror = () => {
          // 错误时也要清理
          const index = this.activeFileReaders.indexOf(reader)
          if (index > -1) {
            this.activeFileReaders.splice(index, 1)
          }
        }
        
        reader.readAsDataURL(file)
      }
      this.hide()
    } catch (error) {
      console.error('图片上传失败:', error)
    }
  }

  private insertImage(src: string): void {
    if (this.pickerOptions.onImageSelect) {
      this.pickerOptions.onImageSelect(src)
    }
  }

  public destroy(): void {
    // 中止所有活跃的FileReader
    this.activeFileReaders.forEach(reader => {
      if (reader.readyState === FileReader.LOADING) {
        reader.abort()
      }
    })
    this.activeFileReaders = []
    
    // 清理组件
    this.imageUploader?.destroy()
    this.imageUploader = null
    
    // 调用父类销毁
    super.destroy()
  }
}