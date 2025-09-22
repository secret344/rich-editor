import { ElementUtils } from '@/core/dom/utils/ElementUtils'
import { FormUtils } from '@/core/dom/utils/FormUtils'
import { ButtonUtils } from '@/core/dom/button/ButtonUtils'
import { EventManager } from '@/utils/EventManager'

export interface DialogOptions {
  title?: string
  message?: string
  placeholder?: string
  defaultValue?: string
  confirmText?: string
  cancelText?: string
  onConfirm?: (value?: string) => void
  onCancel?: () => void
}

export class DialogUtils {
  /**
   * 创建提示对话框
   */
  static createPrompt(options: DialogOptions = {}): Promise<string | null> {
    return new Promise((resolve) => {
      const value = prompt(options.message || '请输入:', options.defaultValue || '')
      resolve(value)
    })
  }

  /**
   * 创建确认对话框
   */
  static createConfirm(options: DialogOptions = {}): Promise<boolean> {
    return new Promise((resolve) => {
      const result = confirm(options.message || '确定要执行此操作吗？')
      resolve(result)
    })
  }

  /**
   * 创建文件选择对话框
   */
  static createFileDialog(options: {
    accept?: string
    multiple?: boolean
    onFileSelect?: (files: FileList | null) => void
  } = {}): { destroy: () => void } {
    const eventManager = new EventManager()
    const input = ElementUtils.createElement({
      tagName: 'input',
      attributes: {
        type: 'file',
        accept: options.accept || '*',
        ...(options.multiple && { multiple: 'true' })
      }
    }) as HTMLInputElement
    
    eventManager.addEventListener(input, 'change', (e) => {
      const target = e.target as HTMLInputElement
      if (options.onFileSelect) {
        options.onFileSelect(target.files)
      }
    })
    
    input.click()
    
    return {
      destroy: () => {
        eventManager.cleanup()
      }
    }
  }

  /**
   * 创建自定义模态对话框
   */
  static createModal(options: DialogOptions = {}): { element: HTMLElement; destroy: () => void } {
    const overlay = ElementUtils.createElement({
      tagName: 'div',
      className: 'rich:fixed rich:inset-0 rich:bg-black rich:bg-opacity-50 rich:flex rich:items-center rich:justify-center rich:z-50'
    })
    
    const modal = ElementUtils.createElement({
      tagName: 'div',
      className: 'rich:bg-white rich:rounded-lg rich:shadow-xl rich:max-w-md rich:w-full rich:mx-4'
    })
    
    // 标题
    if (options.title) {
      const title = ElementUtils.createElement({
        tagName: 'div',
        className: 'rich:px-6 rich:py-4 rich:border-b rich:border-gray-200',
        textContent: options.title
      })
      ElementUtils.appendChild(modal, title)
    }
    
    // 内容
    const content = ElementUtils.createElement({
      tagName: 'div',
      className: 'rich:px-6 rich:py-4'
    })
    
    if (options.message) {
      const message = ElementUtils.createElement({
        tagName: 'p',
        className: 'rich:text-gray-700 rich:mb-4',
        textContent: options.message
      })
      ElementUtils.appendChild(content, message)
    }
    
    // 输入框
    const input = FormUtils.createInput({
      type: 'text',
      className: 'rich:w-full rich:px-3 rich:py-2 rich:border rich:border-gray-300 rich:rounded focus:rich:outline-none focus:rich:ring-2 focus:rich:ring-blue-500',
      placeholder: options.placeholder || '',
      value: options.defaultValue || ''
    })
    ElementUtils.appendChild(content, input)
    
    ElementUtils.appendChild(modal, content)
    
    // 按钮
    const buttons = ElementUtils.createElement({
      tagName: 'div',
      className: 'rich:px-6 rich:py-4 rich:border-t rich:border-gray-200 rich:flex rich:justify-end rich:gap-3'
    })
    
    const eventManager = new EventManager()
    
    const cancelBtn = ButtonUtils.createTextButton({
       label: options.cancelText || '取消',
       className: 'rich:px-4 rich:py-2 rich:text-gray-700 rich:border rich:border-gray-300 rich:rounded hover:rich:bg-gray-50'
     })
     
     const confirmBtn = ButtonUtils.createTextButton({
       label: options.confirmText || '确定',
       className: 'rich:px-4 rich:py-2 rich:bg-blue-600 rich:text-white rich:rounded hover:rich:bg-blue-700'
     })
     
     // 使用EventManager管理事件监听器
     eventManager.addEventListener(cancelBtn, 'click', () => {
       if (options.onCancel) options.onCancel()
       ElementUtils.remove(overlay)
     })
     
     eventManager.addEventListener(confirmBtn, 'click', () => {
       if (options.onConfirm) options.onConfirm(input.value)
       ElementUtils.remove(overlay)
     })
    
    ElementUtils.appendChild(buttons, cancelBtn)
    ElementUtils.appendChild(buttons, confirmBtn)
    ElementUtils.appendChild(modal, buttons)
    
    ElementUtils.appendChild(overlay, modal)
    ElementUtils.appendChild(document.body, overlay)
    
    // 点击遮罩关闭
    eventManager.addEventListener(overlay, 'click', (e) => {
      if (e.target === overlay) {
        if (options.onCancel) options.onCancel()
        ElementUtils.remove(overlay)
      }
    })
    
    // 聚焦输入框
    input.focus()
    
    return {
      element: overlay,
      destroy: () => {
        eventManager.cleanup()
        ElementUtils.remove(overlay)
      }
    }
  }
}
