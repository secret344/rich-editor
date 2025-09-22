/**
 * 表单元素操作工具类
 * 统一管理表单元素的创建、操作和验证
 */

export interface FormElementOptions {
  id?: string
  className?: string
  name?: string
  value?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  readonly?: boolean
  attributes?: Record<string, string>
  parent?: HTMLElement
}

export interface InputOptions extends FormElementOptions {
  type?: 'text' | 'password' | 'email' | 'url' | 'number' | 'tel' | 'search' | 'hidden' | 'file' | 'checkbox' | 'radio'
  min?: string | number
  max?: string | number
  step?: string | number
  pattern?: string
  autocomplete?: 'on' | 'off' | string
  checked?: boolean
}

export interface TextareaOptions extends FormElementOptions {
  rows?: number
  cols?: number
  wrap?: 'soft' | 'hard'
  resize?: 'none' | 'both' | 'horizontal' | 'vertical'
}

export interface SelectOptions extends FormElementOptions {
  multiple?: boolean
  size?: number
  options?: Array<{ value: string, text: string, selected?: boolean }>
}

export interface ButtonOptions extends FormElementOptions {
  type?: 'button' | 'submit' | 'reset'
  textContent?: string
}

export class FormUtils {
  /**
   * 创建输入框
   */
  static createInput(options: InputOptions = {}): HTMLInputElement {
    const input = document.createElement('input')
    
    input.type = options.type || 'text'
    
    if (options.id) input.id = options.id
    if (options.className) input.className = options.className
    if (options.name) input.name = options.name
    if (options.value !== undefined) input.value = options.value
    if (options.placeholder) input.placeholder = options.placeholder
    if (options.required) input.required = options.required
    if (options.disabled) input.disabled = options.disabled
    if (options.readonly) input.readOnly = options.readonly
    if (options.min !== undefined) input.min = options.min.toString()
    if (options.max !== undefined) input.max = options.max.toString()
    if (options.step !== undefined) input.step = options.step.toString()
    if (options.pattern) input.pattern = options.pattern
    if (options.autocomplete) input.autocomplete = options.autocomplete as any
    if (options.checked !== undefined) input.checked = options.checked
    
    if (options.attributes) {
      Object.entries(options.attributes).forEach(([key, value]) => {
        input.setAttribute(key, value)
      })
    }
    
    if (options.parent) {
      options.parent.appendChild(input)
    }
    
    return input
  }

  /**
   * 创建文本区域
   */
  static createTextarea(options: TextareaOptions = {}): HTMLTextAreaElement {
    const textarea = document.createElement('textarea')
    
    if (options.id) textarea.id = options.id
    if (options.className) textarea.className = options.className
    if (options.name) textarea.name = options.name
    if (options.value !== undefined) textarea.value = options.value
    if (options.placeholder) textarea.placeholder = options.placeholder
    if (options.required) textarea.required = options.required
    if (options.disabled) textarea.disabled = options.disabled
    if (options.readonly) textarea.readOnly = options.readonly
    if (options.rows) textarea.rows = options.rows
    if (options.cols) textarea.cols = options.cols
    if (options.wrap) textarea.wrap = options.wrap
    
    if (options.resize) {
      textarea.style.resize = options.resize
    }
    
    if (options.attributes) {
      Object.entries(options.attributes).forEach(([key, value]) => {
        textarea.setAttribute(key, value)
      })
    }
    
    if (options.parent) {
      options.parent.appendChild(textarea)
    }
    
    return textarea
  }



  /**
   * 创建按钮
   */
  static createButton(options: ButtonOptions = {}): HTMLButtonElement {
    const button = document.createElement('button')
    
    button.type = options.type || 'button'
    
    if (options.id) button.id = options.id
    if (options.className) button.className = options.className
    if (options.name) button.name = options.name
    if (options.value !== undefined) button.value = options.value
    if (options.disabled) button.disabled = options.disabled
    if (options.textContent) button.textContent = options.textContent
    
    if (options.attributes) {
      Object.entries(options.attributes).forEach(([key, value]) => {
        button.setAttribute(key, value)
      })
    }
    
    if (options.parent) {
      options.parent.appendChild(button)
    }
    
    return button
  }

  /**
   * 创建标签
   */
  static createLabel(options: {
    id?: string
    className?: string
    textContent?: string
    htmlFor?: string
    parent?: HTMLElement
  } = {}): HTMLLabelElement {
    const label = document.createElement('label')
    
    if (options.id) label.id = options.id
    if (options.className) label.className = options.className
    if (options.textContent) label.textContent = options.textContent
    if (options.htmlFor) label.htmlFor = options.htmlFor
    
    if (options.parent) {
      options.parent.appendChild(label)
    }
    
    return label
  }

  /**
   * 获取表单元素的值
   */
  static getValue(element: HTMLInputElement | HTMLTextAreaElement): string {
    return element.value
  }

  /**
   * 设置表单元素的值
   */
  static setValue(
    element: HTMLInputElement | HTMLTextAreaElement, 
    value: string
  ): void {
    element.value = value
  }

  /**
   * 清空表单元素的值
   */
  static clearValue(element: HTMLInputElement | HTMLTextAreaElement): void {
    if (element instanceof HTMLInputElement && (element.type === 'checkbox' || element.type === 'radio')) {
      element.checked = false
    } else {
      element.value = ''
    }
  }

  /**
   * 设置表单元素的禁用状态
   */
  static setDisabled(element: HTMLInputElement | HTMLTextAreaElement | HTMLButtonElement, disabled: boolean): void {
    element.disabled = disabled
  }

  /**
   * 设置表单元素的只读状态
   */
  static setReadonly(element: HTMLInputElement | HTMLTextAreaElement, readonly: boolean): void {
    element.readOnly = readonly
  }

  /**
   * 设置复选框或单选框的选中状态
   */
  static setChecked(element: HTMLInputElement, checked: boolean): void {
    if (element.type === 'checkbox' || element.type === 'radio') {
      element.checked = checked
    }
  }

  /**
   * 获取复选框或单选框的选中状态
   */
  static isChecked(element: HTMLInputElement): boolean {
    return element.checked
  }

  /**
   * 验证表单元素
   */
  static validate(element: HTMLInputElement | HTMLTextAreaElement): boolean {
    return element.checkValidity()
  }

  /**
   * 获取表单元素的验证信息
   */
  static getValidationMessage(element: HTMLInputElement | HTMLTextAreaElement): string {
    return element.validationMessage
  }

  /**
   * 设置自定义验证信息
   */
  static setCustomValidity(element: HTMLInputElement | HTMLTextAreaElement, message: string): void {
    element.setCustomValidity(message)
  }

  /**
   * 聚焦到表单元素
   */
  static focus(element: HTMLInputElement | HTMLTextAreaElement | HTMLButtonElement): void {
    element.focus()
  }

  /**
   * 失焦表单元素
   */
  static blur(element: HTMLInputElement | HTMLTextAreaElement | HTMLButtonElement): void {
    element.blur()
  }

  /**
   * 选中输入框中的文本
   */
  static select(element: HTMLInputElement | HTMLTextAreaElement): void {
    element.select()
  }

  /**
   * 设置文本选择范围
   */
  static setSelectionRange(element: HTMLInputElement | HTMLTextAreaElement, start: number, end: number): void {
    element.setSelectionRange(start, end)
  }
}
