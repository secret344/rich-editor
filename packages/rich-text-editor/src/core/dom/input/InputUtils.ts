export interface InputOptions {
  id?: string
  type?: string
  placeholder?: string
  value?: string
  className?: string
  disabled?: boolean
  required?: boolean
  onChange?: (value: string) => void
  onFocus?: () => void
  onBlur?: () => void
}

export class InputUtils {
  /**
   * 创建文本输入框
   */
  static createTextInput(options: InputOptions): HTMLInputElement {
    const input = document.createElement('input')
    input.type = options.type || 'text'
    input.className = `rich:px-3 rich:py-2 rich:text-sm rich:border rich:border-gray-300 rich:rounded focus:rich:outline-none focus:rich:ring-2 focus:rich:ring-blue-500 focus:rich:border-blue-500 disabled:rich:opacity-50 disabled:rich:cursor-not-allowed ${options.className || ''}`
    
    if (options.id) input.id = options.id
    if (options.placeholder) input.placeholder = options.placeholder
    if (options.value) input.value = options.value
    if (options.disabled) input.disabled = true
    if (options.required) input.required = true
    
    // 绑定事件
    if (options.onChange) {
      input.addEventListener('input', () => {
        options.onChange!(input.value)
      })
    }
    
    if (options.onFocus) {
      input.addEventListener('focus', options.onFocus)
    }
    
    if (options.onBlur) {
      input.addEventListener('blur', options.onBlur)
    }
    
    return input
  }

  /**
   * 创建文本域
   */
  static createTextarea(options: InputOptions): HTMLTextAreaElement {
    const textarea = document.createElement('textarea')
    textarea.className = `rich:px-3 rich:py-2 rich:text-sm rich:border rich:border-gray-300 rich:rounded focus:rich:outline-none focus:rich:ring-2 focus:rich:ring-blue-500 focus:rich:border-blue-500 disabled:rich:opacity-50 disabled:rich:cursor-not-allowed rich:resize-none ${options.className || ''}`
    
    if (options.id) textarea.id = options.id
    if (options.placeholder) textarea.placeholder = options.placeholder
    if (options.value) textarea.value = options.value
    if (options.disabled) textarea.disabled = true
    if (options.required) textarea.required = true
    
    // 绑定事件
    if (options.onChange) {
      textarea.addEventListener('input', () => {
        options.onChange!(textarea.value)
      })
    }
    
    if (options.onFocus) {
      textarea.addEventListener('focus', options.onFocus)
    }
    
    if (options.onBlur) {
      textarea.addEventListener('blur', options.onBlur)
    }
    
    return textarea
  }

  /**
   * 创建颜色输入框
   */
  static createColorInput(options: InputOptions): HTMLInputElement {
    const input = document.createElement('input')
    input.type = 'color'
    input.className = `rich:w-8 rich:h-8 rich:border rich:border-gray-300 rich:rounded rich:cursor-pointer focus:rich:outline-none focus:rich:ring-2 focus:rich:ring-blue-500 ${options.className || ''}`
    
    if (options.id) input.id = options.id
    if (options.value) input.value = options.value
    if (options.disabled) input.disabled = true
    
    // 绑定事件
    if (options.onChange) {
      input.addEventListener('change', () => {
        options.onChange!(input.value)
      })
    }
    
    if (options.onFocus) {
      input.addEventListener('focus', options.onFocus)
    }
    
    if (options.onBlur) {
      input.addEventListener('blur', options.onBlur)
    }
    
    return input
  }
}
