/**
 * 代码块菜单组件
 * 提供代码块插入和语言选择功能
 */
import { Editor } from '@tiptap/core'
import { EventManager } from '@/utils/EventManager'
import { ButtonUtils, SelectUtils, ContainerUtils, ElementUtils } from '@/core/dom'
import type { ButtonInstance } from '@/core/dom/button/ButtonUtils'

export interface CodeBlockLanguage {
  value: string
  label: string
}

export interface CodeBlockMenuOptions {
  languages?: CodeBlockLanguage[]
}

export class CodeBlockMenu {
  private container: HTMLElement
  private editor: Editor
  private codeBlockButtonInstance: ButtonInstance | null = null
  private languageSelect: HTMLElement | null = null
  private editorEventCleanup: Array<() => void> = []
  private languages: CodeBlockLanguage[]
  private editorRoot: HTMLElement

  // 默认支持的语言配置
  private static readonly DEFAULT_LANGUAGES: CodeBlockLanguage[] = [
    { value: '', label: '纯文本' },
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'html', label: 'HTML' },
    { value: 'css', label: 'CSS' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'cpp', label: 'C++' },
    { value: 'json', label: 'JSON' },
    { value: 'xml', label: 'XML' },
    { value: 'sql', label: 'SQL' },
    { value: 'bash', label: 'Bash' },
    { value: 'markdown', label: 'Markdown' }
  ]

  constructor(container: HTMLElement, editor: Editor, _eventManager: EventManager, editorRoot: HTMLElement, options: CodeBlockMenuOptions = {}) {
    this.container = container
    this.editor = editor
    this.editorRoot = editorRoot
    this.languages = options.languages || CodeBlockMenu.DEFAULT_LANGUAGES
    this.render()
  }

  private render(): void {
    // 创建容器
    const codeBlockContainer = ContainerUtils.createContainer({ className: 'rich:flex rich:items-center rich:gap-1' })
    
    // 代码块按钮
    this.codeBlockButtonInstance = ButtonUtils.createIconButtonWithState({
      id: 'codeBlock',
      icon: '</>', 
      title: '代码块',
      onClick: () => this.toggleCodeBlock(),
      isActive: () => this.editor.isActive('codeBlock'),
      isDisabled: () => this.editor.isDestroyed || !this.editor.isEditable
    })
    
    if (this.codeBlockButtonInstance.button) {
      ElementUtils.appendChild(codeBlockContainer, this.codeBlockButtonInstance.button)
    }

    // 语言选择器（仅在代码块激活时显示）
    this.languageSelect = SelectUtils.createCustomSelect({
      options: this.languages,
      className: 'rich:ml-1 rich:text-xs',
      editorRoot: this.editorRoot,
      onChange: (value: string) => this.changeLanguage(value)
    })
    
    // 初始隐藏语言选择器
    if (this.languageSelect) {
      this.languageSelect.style.display = 'none'
      ElementUtils.appendChild(codeBlockContainer, this.languageSelect)
    }
    
    ElementUtils.appendChild(this.container, codeBlockContainer)
    
    // 监听编辑器状态变化
    const updateHandler = () => {
      this.codeBlockButtonInstance?.updateState()
      this.updateLanguageSelector()
    }
    
    this.editor.on('selectionUpdate', updateHandler)
    this.editor.on('transaction', updateHandler)
    
    // 保存清理函数
    this.editorEventCleanup.push(
      () => this.editor.off('selectionUpdate', updateHandler),
      () => this.editor.off('transaction', updateHandler)
    )
  }

  private toggleCodeBlock(): void {
    if (this.editor.isActive('codeBlock')) {
      // 如果当前在代码块中，退出代码块
      this.editor.chain().focus().toggleCodeBlock().run()
    } else {
      // 插入新的代码块
      this.editor.chain().focus().toggleCodeBlock().run()
    }
  }

  private changeLanguage(language: string): void {
    if (this.editor.isActive('codeBlock')) {
      this.editor.chain().focus().updateAttributes('codeBlock', { language }).run()
    }
  }

  private updateLanguageSelector(): void {
    if (!this.languageSelect) return
    
    const isCodeBlockActive = this.editor.isActive('codeBlock')
    
    if (isCodeBlockActive) {
      this.languageSelect.style.display = 'inline-block'
      
      // 使用setValue方法更新选中状态，避免重新创建
      const attrs = this.editor.getAttributes('codeBlock')
      SelectUtils.setValue(this.languageSelect, attrs.language || '')
    } else {
      this.languageSelect.style.display = 'none'
    }
  }

  public destroy(): void {
    // 清理编辑器事件监听器
    this.editorEventCleanup.forEach(cleanup => cleanup())
    this.editorEventCleanup = []
    
    // 销毁按钮实例
    this.codeBlockButtonInstance?.destroy()
    this.codeBlockButtonInstance = null
    
    // 清理DOM引用
    this.languageSelect = null
  }
}