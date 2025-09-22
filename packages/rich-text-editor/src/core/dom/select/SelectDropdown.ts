import { BaseDropdownPanel, type BaseDropdownOptions } from '@/core/dom/dropdown/BaseDropdownPanel'
import { ElementUtils } from '@/core/dom/utils/ElementUtils'
import { EventManager } from '@/utils/EventManager'

export interface SelectOption {
  value: string
  label: string
  text?: string  // 向后兼容
  disabled?: boolean
}

export interface SelectDropdownOptions extends Omit<BaseDropdownOptions, 'triggerButton'> {
  options: SelectOption[]
  value?: string
  placeholder?: string
  onChange?: (value: string) => void
  className?: string
  disabled?: boolean
  triggerButton: HTMLElement
}

export class SelectDropdown extends BaseDropdownPanel {
  protected selectOptions: SelectDropdownOptions
  private selectedValue: string | undefined
  private triggerButton: HTMLElement
  private buttonText: HTMLElement
  private triggerEventManager: EventManager = new EventManager()

  constructor(container: HTMLElement, options: SelectDropdownOptions) {
    super(container, {
      ...options,
      triggerButton: options.triggerButton,
      minWidth: 120,
      maxHeight: 200,
      closeOnClickOutside: true,
      closeOnEscape: true,
      position: 'bottom-left'
    })
    
    this.selectOptions = options
    this.selectedValue = options.value
    this.triggerButton = options.triggerButton
    
    // 创建按钮文本元素
    this.buttonText = ElementUtils.createElement({
      tagName: 'span',
      className: 'rich:flex-1 rich:text-left rich:truncate'
    })
    
    this.setupTriggerButton()
    this.updateButtonText()
  }

  private setupTriggerButton(): void {
    // 清空按钮内容并重新构建
    this.triggerButton.innerHTML = ''
    
    // 添加文本
    ElementUtils.appendChild(this.triggerButton, this.buttonText)
    
    // 添加下拉箭头
    const arrow = ElementUtils.createElement({
      tagName: 'span',
      className: 'rich:ml-2 rich:text-gray-400',
      textContent: '▼'
    })
    ElementUtils.appendChild(this.triggerButton, arrow)
    
    // 绑定点击事件
    this.triggerEventManager.addEventListener(this.triggerButton, 'click', (e) => {
      e.preventDefault()
      e.stopPropagation()
      
      if (!this.selectOptions.disabled) {
        this.toggle()
      }
    })
  }

  private updateButtonText(): void {
    const selectedOption = this.selectOptions.options.find((opt: SelectOption) => opt.value === this.selectedValue)
    const text = selectedOption ? selectedOption.label : (this.selectOptions.placeholder || '请选择')
    this.buttonText.textContent = text
  }

  protected createContent(): void {
    // 创建选项列表
    this.selectOptions.options.forEach((option: SelectOption) => {
      const item = ElementUtils.createElement({
        tagName: 'div',
        className: `rich:px-3 rich:py-2 rich:text-sm rich:cursor-pointer rich:transition-colors ${
          option.disabled 
            ? 'rich:opacity-50 rich:cursor-not-allowed rich:text-gray-400' 
            : 'hover:rich:bg-gray-100'
        } ${
          option.value === this.selectedValue 
            ? 'rich:bg-blue-100 rich:text-blue-700' 
            : 'rich:text-gray-900'
        }`,
        textContent: option.label
      })
      
      if (!option.disabled) {
        this.triggerEventManager.addEventListener(item, 'click', () => {
          this.selectOption(option.value)
        })
      }
      
      ElementUtils.appendChild(this.panel, item)
    })
  }

  private selectOption(value: string): void {
    this.selectedValue = value
    this.updateButtonText()
    
    if (this.selectOptions.onChange) {
      this.selectOptions.onChange(value)
    }
    
    this.hide()
  }

  public getValue(): string | undefined {
    return this.selectedValue
  }

  public setValue(value: string): void {
    this.selectedValue = value
    this.updateButtonText()
    
    // 如果面板已创建，需要重新创建内容以更新选中状态
    if (this.isCreated) {
      this.panel.innerHTML = ''
      this.createContent()
    }
  }

  public setOptions(options: SelectOption[]): void {
    this.selectOptions.options = options
    
    // 如果当前选中的值不在新选项中，清空选择
    if (this.selectedValue && !options.find((opt: SelectOption) => opt.value === this.selectedValue)) {
      this.selectedValue = undefined
      this.updateButtonText()
    }
    
    // 重新创建内容
    if (this.isCreated) {
      this.panel.innerHTML = ''
      this.createContent()
    }
  }

  public setDisabled(disabled: boolean): void {
    this.selectOptions.disabled = disabled
    
    if (disabled) {
      this.triggerButton.classList.add('rich:opacity-50', 'rich:cursor-not-allowed')
      this.hide()
    } else {
      this.triggerButton.classList.remove('rich:opacity-50', 'rich:cursor-not-allowed')
    }
  }

  public show(): void {
    if (this.selectOptions.disabled) return
    
    // 确保面板已创建
    if (!this.isCreated) {
      this.createPanel()
    }
    
    // 挂载到编辑器根节点
    if (this.editorRoot && !this.editorRoot.contains(this.panel)) {
      ElementUtils.appendChild(this.editorRoot, this.panel)
    }
    
    super.show()
  }

  public destroy(): void {
    // 清理触发按钮的事件监听器
    this.triggerEventManager.cleanup()
    
    // 调用父类的destroy方法，它会清理面板中的事件监听器
    super.destroy()
  }
}