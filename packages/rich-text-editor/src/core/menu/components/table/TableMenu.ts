import { Editor } from '@tiptap/core'
import { EventManager } from '@/utils/EventManager'
import { ButtonUtils, type ButtonInstance, TableSelector, ElementUtils, TextUtils } from '@/core/dom'

export class TableMenu {
  private editor: Editor
  private eventManager: EventManager
  private container: HTMLElement
  private tableSelector: TableSelector | null = null
  private editorRoot: HTMLElement
  private tableButton: HTMLElement | null = null
  private tableButtonInstance: ButtonInstance | null = null
  private editorEventCleanup: Array<() => void> = []

  constructor(container: HTMLElement, editor: Editor, eventManager: EventManager, editorRoot: HTMLElement) {
    this.container = container
    this.editor = editor
    this.eventManager = eventManager
    this.editorRoot = editorRoot
    this.render()
    this.initializeTableSelector()
  }

  private render(): void {
    // 插入表格按钮（使用带状态管理的版本）
    this.tableButtonInstance = ButtonUtils.createIconButtonWithState({
      id: 'insert-table',
      icon: '▦',
      title: '插入表格',
      onClick: (event) => this.showTableDialog(event),
      isActive: () => false,
      isDisabled: () => !this.editor.can().insertTable({ rows: 1, cols: 1, withHeaderRow: true })
    })
    
    this.tableButton = this.tableButtonInstance.button
    if (this.tableButton) {
      ElementUtils.appendChild(this.container, this.tableButton)
    }
    
    // 监听编辑器状态变化，更新按钮状态
    const selectionUpdateHandler = () => {
      this.tableButtonInstance?.updateState()
    }
    
    const transactionHandler = () => {
      this.tableButtonInstance?.updateState()
    }
    
    this.editor.on('selectionUpdate', selectionUpdateHandler)
    this.editor.on('transaction', transactionHandler)
    
    // 保存清理函数
    this.editorEventCleanup.push(
      () => this.editor.off('selectionUpdate', selectionUpdateHandler),
      () => this.editor.off('transaction', transactionHandler)
    )
  }

  private initializeTableSelector(): void {
    // 创建临时容器
    const tempContainer = ElementUtils.createDiv()
    
    // 初始化表格选择器（不设置triggerButton，在show时动态设置）
    this.tableSelector = new TableSelector(tempContainer, {
      onTableInsert: (rows: number, cols: number, hasHeader: boolean) => {
        this.editor.chain().focus().insertTable({ 
          rows, 
          cols, 
          withHeaderRow: hasHeader 
        }).run()
        this.tableSelector?.hide()
      },
      onClose: () => {
        this.tableSelector?.hide()
      },
      editorRoot: this.editorRoot
    })
    this.tableSelector.setEditorRoot(this.editorRoot)
    // 确保panel被创建
    this.tableSelector['createPanel']()
  }



  private showTableDialog(event?: Event): void {
    // 阻止事件冒泡，防止触发外部点击关闭
    if (event) {
      event.stopPropagation()
    }
    
    // 如果当前selector已经显示，则隐藏；否则显示
    if (this.tableSelector) {
      if (this.tableSelector.isPanelVisible) {
        this.tableSelector.hide()
      } else {
        // 使用实例引用设置triggerButton
        this.tableSelector['options'].triggerButton = this.tableButton || undefined
        
        this.tableSelector.show()
      }
    }
  }


  public destroy(): void {
    // 清理编辑器事件监听器
    this.editorEventCleanup.forEach(cleanup => cleanup())
    this.editorEventCleanup = []
    
    // 销毁表格选择器
    if (this.tableSelector) {
      this.tableSelector.destroy()
      this.tableSelector = null
    }
    
    // 销毁表格按钮实例
    this.tableButtonInstance?.destroy()
    
    // 清理所有事件监听器
    this.eventManager.cleanupForElement(this.container)
    
    // 清理容器内容
    if (this.container) {
      TextUtils.setHTML(this.container, '')
    }
  }
}
