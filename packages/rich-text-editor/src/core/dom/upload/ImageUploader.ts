import { EventManager } from '@/utils/EventManager'
import { ElementUtils } from '@/core/dom/utils/ElementUtils'
import { FormUtils } from '@/core/dom/utils/FormUtils'

export interface ImageUploaderOptions {
  onImageSelect?: (file: File) => void
  onImageUpload?: (file: File) => Promise<string>
  accept?: string
  multiple?: boolean
  maxSize?: number // MB
  className?: string
}

export class ImageUploader {
  private container: HTMLElement
  private options: ImageUploaderOptions
  private eventManager: EventManager
  private fileInput: HTMLInputElement | null = null

  constructor(container: HTMLElement, options: ImageUploaderOptions = {}) {
    this.container = container
    this.options = {
      accept: 'image/*',
      multiple: false,
      maxSize: 5, // 5MB
      ...options
    }
    this.eventManager = new EventManager()
    this.createFileInput()
  }

  private createFileInput(): void {
    this.fileInput = FormUtils.createInput({
      type: 'file',
      className: 'rich:hidden',
      attributes: {
        accept: this.options.accept || 'image/*',
        ...(this.options.multiple && { multiple: 'true' })
      }
    })

    
    this.eventManager.addEventListener(this.fileInput, 'change', (e) => {
      this.handleFileSelect(e as Event)
    })

    ElementUtils.appendChild(this.container, this.fileInput)
  }

  private async handleFileSelect(event: Event): Promise<void> {
    const target = event.target as HTMLInputElement
    const files = target.files

    if (!files || files.length === 0) return

    const file = files[0]

    // 检查文件大小
    if (this.options.maxSize && file.size > this.options.maxSize * 1024 * 1024) {
      alert(`文件大小不能超过 ${this.options.maxSize}MB`)
      return
    }

    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件')
      return
    }

    try {
      if (this.options.onImageUpload) {
        // 使用自定义上传方法
        const uploadedUrl = await this.options.onImageUpload(file)
        // 将上传后的URL传递给onImageSelect，而不是原始文件
        if (this.options.onImageSelect) {
          // 创建一个包含URL信息的伪文件对象
          const urlFile = Object.assign(file, { uploadedUrl })
          this.options.onImageSelect(urlFile)
        }
      } else {
        // 默认处理：直接传递文件给onImageSelect处理
        this.options.onImageSelect?.(file)
      }
    } catch (error) {
      console.error('图片上传失败:', error)
      alert('图片上传失败，请重试')
    }

    // 清空input值，允许重复选择同一文件
    target.value = ''
  }

  public triggerSelect(): void {
    this.fileInput?.click()
  }

  public destroy(): void {
    this.eventManager.cleanup()
    this.fileInput?.remove()
  }
}
