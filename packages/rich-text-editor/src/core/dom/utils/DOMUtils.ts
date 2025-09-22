/**
 * DOM 操作工具类
 * 提供统一的 DOM 元素创建和操作方法
 * 现在主要作为新DOM工具的代理，保持向后兼容
 */

import { 
  ButtonUtils, 
  SelectUtils, 
  InputUtils, 
  ContainerUtils, 
  DialogUtils,
  type ButtonOptions,
  type SelectOptions,
  type InputOptions,
  type ContainerOptions,
  type DialogOptions
} from '..'

export interface FileDialogOptions {
  accept?: string
  multiple?: boolean
  onFileSelect?: (files: FileList | null) => void
}

export class DOMUtils {
  /**
   * 创建按钮元素（代理到ButtonUtils）
   */
  static createButton(options: ButtonOptions): HTMLButtonElement {
    return ButtonUtils.createTextButton(options)
  }

  /**
   * 创建图标按钮（代理到ButtonUtils）
   */
  static createIconButton(options: ButtonOptions): HTMLButtonElement {
    return ButtonUtils.createIconButton(options)
  }

  /**
   * 创建紧凑按钮（代理到ButtonUtils）
   */
  static createCompactButton(options: ButtonOptions): HTMLButtonElement {
    return ButtonUtils.createCompactButton(options)
  }

  /**
   * 创建选择器（代理到SelectUtils）
   */
  static createSelect(options: SelectOptions): HTMLElement {
    const selectOptions: SelectOptions = {
      ...options,
      options: options.options || []
    }
    
    return SelectUtils.createCustomSelect(selectOptions)
  }

  /**
   * 创建输入框（代理到InputUtils）
   */
  static createInput(options: InputOptions): HTMLInputElement {
    return InputUtils.createTextInput(options)
  }

  /**
   * 创建文本域（代理到InputUtils）
   */
  static createTextarea(options: InputOptions): HTMLTextAreaElement {
    return InputUtils.createTextarea(options)
  }

  /**
   * 创建颜色输入框（代理到InputUtils）
   */
  static createColorInput(options: InputOptions): HTMLInputElement {
    return InputUtils.createColorInput(options)
  }

  /**
   * 创建容器（代理到ContainerUtils）
   */
  static createContainer(options: ContainerOptions = {}): HTMLElement {
    return ContainerUtils.createContainer(options)
  }

  /**
   * 创建滚动容器（代理到ContainerUtils）
   */
  static createScrollContainer(options: ContainerOptions = {}): HTMLElement {
    return ContainerUtils.createScrollContainer(options)
  }

  /**
   * 创建分隔线（代理到ContainerUtils）
   */
  static createDivider(): HTMLElement {
    return ContainerUtils.createDivider()
  }

  /**
   * 创建组容器（代理到ContainerUtils）
   */
  static createGroup(options: ContainerOptions = {}): HTMLElement {
    return ContainerUtils.createGroup(options)
  }

  /**
   * 创建工具栏容器（代理到ContainerUtils）
   */
  static createToolbar(options: ContainerOptions = {}): HTMLElement {
    return ContainerUtils.createToolbar(options)
  }

  /**
   * 创建提示对话框（代理到DialogUtils）
   */
  static createPrompt(message: string, defaultValue?: string): Promise<string | null> {
    return DialogUtils.createPrompt({ message, defaultValue })
  }

  /**
   * 创建确认对话框（代理到DialogUtils）
   */
  static createConfirm(message: string): Promise<boolean> {
    return DialogUtils.createConfirm({ message })
  }

  /**
   * 创建文件选择对话框（代理到DialogUtils）
   */
  static createFileDialog(options: FileDialogOptions = {}): { destroy: () => void } {
    return DialogUtils.createFileDialog(options)
  }

  /**
   * 创建模态对话框（代理到DialogUtils）
   */
  static createModal(options: DialogOptions = {}): { element: HTMLElement; destroy: () => void } {
    return DialogUtils.createModal(options)
  }

}