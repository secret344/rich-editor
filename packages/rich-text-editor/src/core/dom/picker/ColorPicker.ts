import { BaseDropdownPanel, type BaseDropdownOptions } from '@/core/dom/dropdown/BaseDropdownPanel'
import { ElementUtils } from '@/core/dom/utils/ElementUtils'
import { EventUtils } from '@/core/dom/utils/EventUtils'
import { FormUtils } from '@/core/dom/utils/FormUtils'

export interface ColorPickerOptions extends BaseDropdownOptions {
  type: 'text' | 'highlight' | 'background'
  onColorSelect: (color: string) => void
  onClose?: () => void
  currentColor?: string
}

export class ColorPicker extends BaseDropdownPanel {
  private colorGrid!: HTMLElement
  private customColorInput!: HTMLInputElement

  private readonly colors = [
    '#000000', '#333333', '#666666', '#999999', '#CCCCCC', '#FFFFFF',
    '#FF0000', '#FF6600', '#FFCC00', '#00FF00', '#0066FF', '#6600FF',
    '#FF0066', '#FF3366', '#FF6699', '#FF99CC', '#FFCCFF', '#CC99FF',
    '#9966FF', '#6633FF', '#3300FF', '#0066FF', '#00CCFF', '#00FFFF',
    '#00FFCC', '#00FF99', '#66FF00', '#CCFF00', '#FFFF00', '#FFCC00'
  ]

  constructor(container: HTMLElement, options: ColorPickerOptions) {
    // 设置默认样式选项
    const defaultOptions: ColorPickerOptions = {
      ...options,
      position: 'center',
      width: options.width || 280,
      minWidth: options.minWidth || 280,
      className: `rich:p-3 ${options.className || ''}`,
      closeOnClickOutside: options.closeOnClickOutside !== false, // 默认启用
      closeOnEscape: options.closeOnEscape !== false // 默认启用
    }
    
    super(container, defaultOptions)
  }

  protected createContent(): void {
    // 清空面板内容
    ElementUtils.empty(this.panel)

    // 创建标题
    const title = ElementUtils.createElement({
      tagName: 'div',
      className: 'rich:px-3 rich:py-2 rich:text-sm rich:font-medium rich:text-gray-900 rich:border-b rich:border-gray-200',
      textContent: (this.options as ColorPickerOptions).type === 'text' ? '文字颜色' : 
                   (this.options as ColorPickerOptions).type === 'highlight' ? '高亮颜色' : '背景颜色',
    })
    ElementUtils.appendChild(this.panel, title)

    // 颜色网格
    this.colorGrid = ElementUtils.createDiv({
      className: 'rich:grid rich:grid-cols-6 rich:gap-1 rich:mb-3',
      parent: this.panel
    })

    // 渲染颜色块
    this.colors.forEach(color => {
      const colorBlock = FormUtils.createButton({
        className: 'rich:w-6 rich:h-6 rich:rounded rich:border rich:border-gray-300 hover:rich:scale-110 rich:transition-transform',
        parent: this.colorGrid
      })
      
      colorBlock.title = color
      
      colorBlock.style.backgroundColor = color
      
      if (color === (this.options as ColorPickerOptions).currentColor) {
        colorBlock.classList.add('ring-2', 'ring-blue-500')
      }
      
      EventUtils.onClick(colorBlock, () => {
        this.selectColor(color)
      })
    })

    // 自定义颜色输入
    const customColorContainer = ElementUtils.createDiv({
      className: 'rich:flex rich:items-center rich:gap-2',
      parent: this.panel
    })
    
    ElementUtils.createSpan({
      className: 'rich:text-xs rich:text-gray-600',
      textContent: '自定义:',
      parent: customColorContainer
    })
    
    this.customColorInput = ElementUtils.createElement({
      tagName: 'input',
      className: 'rich:w-8 rich:h-6 rich:border rich:border-gray-300 rich:rounded',
      attributes: {
        type: 'color',
        value: (this.options as ColorPickerOptions).currentColor || '#000000'
      },
      parent: customColorContainer
    }) as HTMLInputElement
    
    EventUtils.addEventListener(this.customColorInput, 'input', (e) => {
      const target = e.target as HTMLInputElement
      // 只更新颜色，不关闭面板
      this.applyColor(target.value)
    })
    
    // 移除change事件，让自定义颜色输入只通过input事件更新颜色
    // 用户需要点击其他颜色块或关闭按钮来关闭面板

    // 清除颜色按钮
    const clearButton = FormUtils.createButton({
      className: 'rich:mt-2 rich:w-full rich:px-2 rich:py-1 rich:text-xs rich:text-gray-600 hover:rich:text-gray-800 hover:rich:bg-gray-100 rich:rounded',
      textContent: '清除颜色',
      parent: this.panel
    })
    
    EventUtils.onClick(clearButton, () => {
      this.selectColor('')
    })

    // 关闭按钮
    const closeButton = FormUtils.createButton({
      className: 'rich:mt-2 rich:w-full rich:px-2 rich:py-1 rich:text-xs rich:text-gray-600 hover:rich:text-gray-800 hover:rich:bg-gray-100 rich:rounded rich:border-t rich:border-gray-200',
      textContent: '关闭',
      parent: this.panel
    })
    
    EventUtils.onClick(closeButton, () => {
      this.hide()
      if ((this.options as ColorPickerOptions).onClose) {
        (this.options as ColorPickerOptions).onClose!()
      }
    })
  }

  private applyColor(color: string): void {
    // 只应用颜色，不关闭面板
    (this.options as ColorPickerOptions).onColorSelect(color)
    
    // 更新选中状态
    if (this.colorGrid) {
      ElementUtils.querySelectorAll<HTMLButtonElement>('button', this.colorGrid).forEach(btn => {
        btn.classList.remove('ring-2', 'ring-blue-500')
        if (btn.style.backgroundColor === color) {
          btn.classList.add('ring-2', 'ring-blue-500')
        }
      })
    }
  }

  private selectColor(color: string): void {
    // 应用颜色
    this.applyColor(color)
    
    // 选择颜色后自动关闭弹框
    this.hide()
  }

  public updateCurrentColor(color: string): void {
    (this.options as ColorPickerOptions).currentColor = color
    if (this.customColorInput) {
      this.customColorInput.value = color || '#000000'
    }
    
    // 更新颜色块选中状态
    if (this.colorGrid) {
      ElementUtils.querySelectorAll<HTMLButtonElement>('button', this.colorGrid).forEach(btn => {
        btn.classList.remove('ring-2', 'ring-blue-500')
        if (btn.style.backgroundColor === color) {
          btn.classList.add('ring-2', 'ring-blue-500')
        }
      })
    }
  }

  // 继承基类的show、hide、toggle、destroy方法
}
