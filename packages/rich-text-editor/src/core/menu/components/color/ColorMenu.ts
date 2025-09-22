import { Editor } from '@tiptap/core'
import { EventManager } from '@/utils/EventManager'
import { ContainerUtils, ButtonUtils, type ButtonInstance, ColorPicker, ElementUtils, StyleUtils, TextUtils } from '@/core/dom'

export class ColorMenu {
  private editor: Editor
  private eventManager: EventManager
  private container: HTMLElement
  private textColorPicker: ColorPicker | null = null
  private highlightColorPicker: ColorPicker | null = null
  private editorRoot: HTMLElement
  private textColorButton: HTMLElement | null = null
  private highlightColorButton: HTMLElement | null = null
  private textColorButtonInstance: ButtonInstance | null = null
  private highlightColorButtonInstance: ButtonInstance | null = null
  private textColorDisplay: HTMLElement | null = null
  private highlightColorDisplay: HTMLElement | null = null
  private editorEventCleanup: (() => void)[] = []

  constructor(container: HTMLElement, editor: Editor, eventManager: EventManager, editorRoot: HTMLElement) {
    this.container = container
    this.editor = editor
    this.eventManager = eventManager
    this.editorRoot = editorRoot
    this.render()
    this.initializePickers()
  }

  private render(): void {
    const menuContainer = ContainerUtils.createContainer({ className: 'rich:flex rich:items-center rich:gap-1' })
    
    // 文字颜色按钮（使用带状态管理的版本）
    this.textColorButtonInstance = ButtonUtils.createIconButtonWithState({
      id: 'text-color',
      icon: 'A',
      title: '文字颜色',
      onClick: (event) => this.showTextColorPicker(event),
      isActive: () => false, // 不显示高亮状态
      isDisabled: () => !this.editor.can().setColor('')
    })
    
    this.textColorButton = this.textColorButtonInstance.button
    if (this.textColorButton) {
      // 添加颜色显示区域
      this.textColorDisplay = ElementUtils.createDiv({
        className: 'rich:ml-1 rich:w-3 rich:h-3 rich:rounded rich:border rich:border-gray-300'
      })
      ElementUtils.appendChild(this.textColorButton, this.textColorDisplay)
      ElementUtils.appendChild(menuContainer, this.textColorButton)
    }

    // 高亮颜色按钮（使用带状态管理的版本）
    this.highlightColorButtonInstance = ButtonUtils.createIconButtonWithState({
      id: 'highlight-color',
      icon: '🖍️',
      title: '高亮颜色',
      onClick: (event) => this.showHighlightColorPicker(event),
      isActive: () => false, // 不显示高亮状态
      isDisabled: () => !this.editor.can().setHighlight({ color: '' })
    })
    
    this.highlightColorButton = this.highlightColorButtonInstance.button
    if (this.highlightColorButton) {
      // 添加颜色显示区域
      this.highlightColorDisplay = ElementUtils.createDiv({
        className: 'rich:ml-1 rich:w-3 rich:h-3 rich:rounded rich:border rich:border-gray-300'
      })
      ElementUtils.appendChild(this.highlightColorButton, this.highlightColorDisplay)
      ElementUtils.appendChild(menuContainer, this.highlightColorButton)
    }
    
    // 监听编辑器状态变化，更新按钮状态
    const selectionUpdateHandler = () => {
      this.textColorButtonInstance?.updateState()
      this.highlightColorButtonInstance?.updateState()
      this.updateTextColorDisplay()
      this.updateHighlightColorDisplay()
    }
    const transactionHandler = () => {
      this.textColorButtonInstance?.updateState()
      this.highlightColorButtonInstance?.updateState()
      this.updateTextColorDisplay()
      this.updateHighlightColorDisplay()
    }
    
    this.editor.on('selectionUpdate', selectionUpdateHandler)
    this.editor.on('transaction', transactionHandler)
    
    // 保存清理函数
    this.editorEventCleanup.push(
      () => this.editor.off('selectionUpdate', selectionUpdateHandler),
      () => this.editor.off('transaction', transactionHandler)
    )

    ElementUtils.appendChild(this.container, menuContainer)
  }

  private initializePickers(): void {
    // 创建临时容器
    const tempContainer = ElementUtils.createDiv()
    
    // 初始化文字颜色选择器（不设置triggerButton，在show时动态设置）
    this.textColorPicker = new ColorPicker(tempContainer, {
      type: 'text',
      currentColor: this.getCurrentTextColor(),
      onColorSelect: (color: string) => {
        this.editor.chain().focus().setColor(color).run()
        // 触发颜色显示区域更新
        this.updateTextColorDisplay()
      },
      onClose: () => {
        this.textColorPicker?.hide()
      },
      editorRoot: this.editorRoot
    })
    // 确保panel被创建
    this.textColorPicker['createPanel']()

    // 初始化高亮颜色选择器（不设置triggerButton，在show时动态设置）
    this.highlightColorPicker = new ColorPicker(tempContainer, {
      type: 'highlight',
      currentColor: this.getCurrentHighlightColor(),
      onColorSelect: (color: string) => {
        this.editor.chain().focus().setHighlight({ color }).run()
        // 触发颜色显示区域更新
        this.updateHighlightColorDisplay()
      },
      onClose: () => {
        this.highlightColorPicker?.hide()
      },
      editorRoot: this.editorRoot
    })
    // 确保panel被创建
    this.highlightColorPicker['createPanel']()
  }



  private showTextColorPicker(event?: Event): void {
    // 阻止事件冒泡，防止触发外部点击关闭
    if (event) {
      event.stopPropagation()
    }
    
    // 先关闭其他颜色选择器
    if (this.highlightColorPicker) {
      this.highlightColorPicker.hide()
    }
    
    // 如果当前picker已经显示，则隐藏；否则显示
    if (this.textColorPicker) {
      if (this.textColorPicker.isPanelVisible) {
        this.textColorPicker.hide()
      } else {
        // 使用实例引用设置triggerButton
        this.textColorPicker['options'].triggerButton = this.textColorButton || undefined
        
        this.textColorPicker.updateCurrentColor(this.getCurrentTextColor())
        this.textColorPicker.show()
      }
    }
  }

  private showHighlightColorPicker(event?: Event): void {
    // 阻止事件冒泡，防止触发外部点击关闭
    if (event) {
      event.stopPropagation()
    }
    
    // 先关闭其他颜色选择器
    if (this.textColorPicker) {
      this.textColorPicker.hide()
    }
    
    // 如果当前picker已经显示，则隐藏；否则显示
    if (this.highlightColorPicker) {
      if (this.highlightColorPicker.isPanelVisible) {
        this.highlightColorPicker.hide()
      } else {
        // 使用实例引用设置triggerButton
        this.highlightColorPicker['options'].triggerButton = this.highlightColorButton || undefined
        
        this.highlightColorPicker.updateCurrentColor(this.getCurrentHighlightColor())
        this.highlightColorPicker.show()
      }
    }
  }

  private getCurrentTextColor(): string {
    const attributes = this.editor.getAttributes('textStyle')
    return attributes.color || '#000000'
  }

  private getCurrentHighlightColor(): string {
    const attributes = this.editor.getAttributes('highlight')
    return attributes.color || '#000000'
  }


  /**
   * 更新文字颜色显示区域
   */
  private updateTextColorDisplay(): void {
    if (!this.textColorDisplay) return
    
    const color = this.getCurrentTextColor()
  
    if (color && color !== '#000000') {
      StyleUtils.setStyle(this.textColorDisplay, 'backgroundColor', color)
      StyleUtils.setStyle(this.textColorDisplay, 'borderColor', color)
    } else {
      StyleUtils.setStyle(this.textColorDisplay, 'backgroundColor', '#ffffff')
      StyleUtils.setStyle(this.textColorDisplay, 'borderColor', '#d1d5db')
    }
  }

  /**
   * 更新高亮颜色显示区域
   */
  private updateHighlightColorDisplay(): void {
    if (!this.highlightColorDisplay) return
    
    const color = this.getCurrentHighlightColor()
    if (color && color !== '#000000') {
      StyleUtils.setStyle(this.highlightColorDisplay, 'backgroundColor', color)
      StyleUtils.setStyle(this.highlightColorDisplay, 'borderColor', color)
    } else {
      StyleUtils.setStyle(this.highlightColorDisplay, 'backgroundColor', '#ffffff')
      StyleUtils.setStyle(this.highlightColorDisplay, 'borderColor', '#d1d5db')
    }
  }

  public destroy(): void {
    // 清理编辑器事件监听器
    this.editorEventCleanup.forEach(cleanup => cleanup())
    this.editorEventCleanup = []
    
    // 销毁颜色选择器
    if (this.textColorPicker) {
      this.textColorPicker.destroy()
      this.textColorPicker = null
    }
    
    if (this.highlightColorPicker) {
      this.highlightColorPicker.destroy()
      this.highlightColorPicker = null
    }
    
    // 销毁按钮实例
    this.textColorButtonInstance?.destroy()
    this.highlightColorButtonInstance?.destroy()
    
    // 清理所有事件监听器
    this.eventManager.cleanupForElement(this.container)
    
    // 清理容器内容
    if (this.container) {
      TextUtils.setHTML(this.container, '')
    }
    
    // 清理引用
    this.textColorButton = null
    this.highlightColorButton = null
    this.textColorButtonInstance = null
    this.highlightColorButtonInstance = null
  }
}
