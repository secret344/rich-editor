
import { ElementUtils } from '@/core/dom/utils/ElementUtils'
import { SelectDropdown, type SelectDropdownOptions } from './SelectDropdown'

export interface SelectOption {
  value: string
  label: string
  text?: string  // 向后兼容
  disabled?: boolean
}

export interface SelectOptions {
  id?: string
  placeholder?: string
  options: SelectOption[]
  value?: string
  onChange?: (value: string) => void
  className?: string
  disabled?: boolean
  editorRoot?: HTMLElement
}

export class SelectUtils {


  /**
   * 创建自定义下拉选择器（使用BaseDropdownPanel实现）
   */
  static createCustomSelect(options: SelectOptions): HTMLElement {
    const container = ElementUtils.createElement({
      tagName: 'div',
      className: `rich:relative rich:inline-block ${options.className || ''}`
    })
    
    // 创建触发按钮
    const button = ElementUtils.createElement({
      tagName: 'button',
      className: 'rich:inline-flex rich:items-center rich:justify-between rich:w-full rich:px-3 rich:py-2 rich:text-sm rich:border rich:border-gray-300 rich:rounded hover:rich:bg-gray-50 focus:rich:outline-none focus:rich:ring-2 focus:rich:ring-blue-500 focus:rich:border-blue-500 disabled:rich:opacity-50 disabled:rich:cursor-not-allowed',
      attributes: {
        type: 'button',
        ...(options.disabled && { disabled: 'true' })
      }
    }) as HTMLButtonElement
    
    ElementUtils.appendChild(container, button)
    
    // 创建下拉选择器实例
    const dropdownOptions: SelectDropdownOptions = {
      ...options,
      triggerButton: button,
      editorRoot: options.editorRoot || document.body
    }
    
    const dropdown = new SelectDropdown(container, dropdownOptions)
    
    // 设置编辑器根节点
    if (options.editorRoot) {
      dropdown.setEditorRoot(options.editorRoot)
    }
    
    // 将dropdown实例存储在容器上，以便后续访问
    ;(container as any).__selectDropdown = dropdown
    
    return container
  }
  
  /**
   * 获取选择器的值
   */
  static getValue(container: HTMLElement): string | undefined {
    const dropdown = (container as any).__selectDropdown as SelectDropdown
    return dropdown ? dropdown.getValue() : undefined
  }
  
  /**
   * 设置选择器的值
   */
  static setValue(container: HTMLElement, value: string): void {
    const dropdown = (container as any).__selectDropdown as SelectDropdown
    if (dropdown) {
      dropdown.setValue(value)
    }
  }
  
  /**
   * 设置选择器的选项
   */
  static setOptions(container: HTMLElement, options: SelectOption[]): void {
    const dropdown = (container as any).__selectDropdown as SelectDropdown
    if (dropdown) {
      dropdown.setOptions(options)
    }
  }
  
  /**
   * 设置选择器的禁用状态
   */
  static setDisabled(container: HTMLElement, disabled: boolean): void {
    const dropdown = (container as any).__selectDropdown as SelectDropdown
    if (dropdown) {
      dropdown.setDisabled(disabled)
    }
  }
  
  /**
   * 销毁选择器
   */
  static destroy(container: HTMLElement): void {
    const dropdown = (container as any).__selectDropdown as SelectDropdown
    if (dropdown) {
      dropdown.destroy()
      delete (container as any).__selectDropdown
    }
  }
}
