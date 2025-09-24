/**
 * 工具栏菜单管理器
 * 负责创建、管理和销毁所有工具栏菜单组件
 */
import { Editor } from '@tiptap/core'
import { EventManager } from '@/utils/EventManager'
import { ContainerUtils, ElementUtils, StyleUtils, TextUtils } from '@/core/dom'
import type { ToolbarOptions } from '@/core/RichTextEditor'

// 导入菜单组件
import {
  HistoryMenu,
  ClearFormatMenu,
  TextFormatMenu,
  HeadingMenu,
  ColorMenu,
  AlignmentMenu,
  TableMenu,
  ListMenu,
  CodeBlockMenu,
  BlockquoteMenu,
  FontSizeMenu,
  LineHeightMenu
} from '@/core/menu/components'
import { LinkMenu } from '@/core/menu/components/media/LinkMenu'
import { ImageMenu } from '@/core/menu/components/media/ImageMenu'

/**
 * 菜单管理器
 * 统一管理工具栏中的所有菜单组件，提供创建、渲染和销毁功能
 */
export class MenuManager {
  private editor: Editor
  private container: HTMLElement
  private options: ToolbarOptions
  private eventManager: EventManager
  private scrollContainer!: HTMLElement
  private menuComponents: Array<{ destroy: () => void }> = []
  private editorRoot: HTMLElement
  private menuContainers: Map<string, HTMLElement> = new Map()
  private editorEventCleanup: Array<() => void> = []

  constructor(container: HTMLElement, editor: Editor, editorRoot: HTMLElement, options: ToolbarOptions = {}) {
    this.container = container
    this.editor = editor
    this.editorRoot = editorRoot
    this.options = {
      showTextFormat: true,
      showHeadings: true,
      showLists: true,
      showBlocks: true,
      showMedia: true,
      showColors: true,
      showTables: true,
      showHistory: true,
      showAlignment: true,
      showSuperscriptSubscript: true,
      showClearFormat: true,
      showCodeBlock: true,
      showBlockquote: true,
      showFontSize: true,
      showLineHeight: true,
      ...options
    }
    this.eventManager = new EventManager()
    this.render()
    this.setupEditorStateListener()
  }

  private render(): void {
    TextUtils.setHTML(this.container, '')
    StyleUtils.setClassName(this.container, 'rich:menu-toolbar rich:bg-white rich:border-b rich:border-gray-200')

    // 创建可滚动的工具栏容器
    this.scrollContainer = ContainerUtils.createScrollContainer()
    ElementUtils.appendChild(this.container, this.scrollContainer)

    // 渲染各个菜单组件
    this.renderMenuComponents()
  }

  private renderMenuComponents(): void {
    // 历史操作菜单
    if (this.options.showHistory) {
      const historyContainer = ContainerUtils.createContainer({ className: 'rich:flex rich:items-center rich:gap-1' })
      const historyMenu = new HistoryMenu(historyContainer, this.editor, this.eventManager)
      this.menuComponents.push(historyMenu)
      this.menuContainers.set('history', historyContainer)
      ElementUtils.appendChild(this.scrollContainer, historyContainer)
      this.renderDivider()
    }

    // 标题菜单
    if (this.options.showHeadings) {
      const headingContainer = ContainerUtils.createContainer({ className: 'rich:flex rich:items-center rich:gap-1' })
      const headingMenu = new HeadingMenu(headingContainer, this.editor, this.eventManager, this.editorRoot)
      this.menuComponents.push(headingMenu)
      this.menuContainers.set('headings', headingContainer)
      ElementUtils.appendChild(this.scrollContainer, headingContainer)
      this.renderDivider()
    }

    // 文本格式菜单
    if (this.options.showTextFormat) {
      const textFormatContainer = ContainerUtils.createContainer({ className: 'rich:flex rich:items-center rich:gap-1' })
      const textFormatMenu = new TextFormatMenu(textFormatContainer, this.editor, this.eventManager)
      this.menuComponents.push(textFormatMenu)
      this.menuContainers.set('textFormat', textFormatContainer)
      ElementUtils.appendChild(this.scrollContainer, textFormatContainer)
      this.renderDivider()
    }

    // 字体大小菜单
    if (this.options.showFontSize) {
      const fontSizeContainer = ContainerUtils.createContainer({ className: 'rich:flex rich:items-center rich:gap-1' })
      const fontSizeMenu = new FontSizeMenu(fontSizeContainer, this.editor, this.eventManager, this.editorRoot)
      this.menuComponents.push(fontSizeMenu)
      this.menuContainers.set('fontSize', fontSizeContainer)
      ElementUtils.appendChild(this.scrollContainer, fontSizeContainer)
      this.renderDivider()
    }

    // 行高菜单
    if (this.options.showLineHeight) {
      const lineHeightContainer = ContainerUtils.createContainer({ className: 'rich:flex rich:items-center rich:gap-1' })
      const lineHeightMenu = new LineHeightMenu(lineHeightContainer, this.editor, this.eventManager, this.editorRoot)
      this.menuComponents.push(lineHeightMenu)
      this.menuContainers.set('lineHeight', lineHeightContainer)
      ElementUtils.appendChild(this.scrollContainer, lineHeightContainer)
      this.renderDivider()
    }

    // 代码块菜单
    if (this.options.showCodeBlock) {
      const codeBlockContainer = ContainerUtils.createContainer({ className: 'rich:flex rich:items-center rich:gap-1' })
      const codeBlockMenu = new CodeBlockMenu(codeBlockContainer, this.editor, this.eventManager, this.editorRoot, {
        languages: this.options.codeBlockLanguages
      })
      this.menuComponents.push(codeBlockMenu)
      ElementUtils.appendChild(this.scrollContainer, codeBlockContainer)
      this.renderDivider()
    }

    // 引用块菜单
    if (this.options.showBlockquote) {
      const blockquoteContainer = ContainerUtils.createContainer({ className: 'rich:flex rich:items-center rich:gap-1' })
      const blockquoteMenu = new BlockquoteMenu(blockquoteContainer, this.editor, this.eventManager)
      this.menuComponents.push(blockquoteMenu)
      this.menuContainers.set('blockquote', blockquoteContainer)
      ElementUtils.appendChild(this.scrollContainer, blockquoteContainer)
      this.renderDivider()
    }

    // 列表菜单
    if (this.options.showLists) {
      const listContainer = ContainerUtils.createContainer({ className: 'rich:flex rich:items-center rich:gap-1' })
      const listMenu = new ListMenu(listContainer, this.editor, this.eventManager, this.editorRoot)
      this.menuComponents.push(listMenu)
      this.menuContainers.set('lists', listContainer)
      ElementUtils.appendChild(this.scrollContainer, listContainer)
      this.renderDivider()
    }

    // 对齐菜单
    if (this.options.showAlignment) {
      const alignmentContainer = ContainerUtils.createContainer({ className: 'rich:flex rich:items-center rich:gap-1' })
      const alignmentMenu = new AlignmentMenu(alignmentContainer, this.editor, this.eventManager, this.editorRoot)
      this.menuComponents.push(alignmentMenu)
      this.menuContainers.set('alignment', alignmentContainer)
      ElementUtils.appendChild(this.scrollContainer, alignmentContainer)
      this.renderDivider()
    }

    // 颜色菜单
    if (this.options.showColors) {
      const colorMenu = new ColorMenu(this.editor, this.eventManager, this.editorRoot)
      this.menuComponents.push(colorMenu)
      this.menuContainers.set('colors', colorMenu.getContainer())
      ElementUtils.appendChild(this.scrollContainer, colorMenu.getContainer())
      this.renderDivider()
    }

    // 媒体菜单
    if (this.options.showMedia) {
      // 媒体菜单容器（合并链接和图片）
      const mediaContainer = ContainerUtils.createContainer({ className: 'rich:flex rich:items-center rich:gap-1' })
      
      // 链接菜单
      const linkMenu = new LinkMenu(mediaContainer, this.editor, this.eventManager, this.editorRoot)
      this.menuComponents.push(linkMenu)
      
      // 图片菜单
      const imageMenu = new ImageMenu(mediaContainer, this.editor, this.eventManager, this.editorRoot, {
        onImageUpload: this.options.onImageUpload
      })
      this.menuComponents.push(imageMenu)
      
      this.menuContainers.set('media', mediaContainer)
      ElementUtils.appendChild(this.scrollContainer, mediaContainer)
      this.renderDivider()
    }

    // 表格菜单
    if (this.options.showTables) {
      const tableContainer = ContainerUtils.createContainer({ className: 'rich:flex rich:items-center rich:gap-1' })
      const tableMenu = new TableMenu(tableContainer, this.editor, this.eventManager, this.editorRoot)
      this.menuComponents.push(tableMenu)
      this.menuContainers.set('tables', tableContainer)
      ElementUtils.appendChild(this.scrollContainer, tableContainer)
      this.renderDivider()
    }

    // 清除格式菜单
    if (this.options.showClearFormat) {
      const clearFormatContainer = ContainerUtils.createContainer({ className: 'rich:flex rich:items-center rich:gap-1' })
      const clearFormatMenu = new ClearFormatMenu(clearFormatContainer, this.editor, this.eventManager)
      this.menuComponents.push(clearFormatMenu)
      ElementUtils.appendChild(this.scrollContainer, clearFormatContainer)
    }
  }


  private renderDivider(): void {
    const divider = ContainerUtils.createDivider()
    ElementUtils.appendChild(this.scrollContainer, divider)
  }

  private setupEditorStateListener(): void {
    // 监听编辑器状态变化
    const selectionUpdateHandler = () => {
      this.updateMenuVisibility()
    }
    
    const transactionHandler = () => {
      this.updateMenuVisibility()
    }
    
    this.editor.on('selectionUpdate', selectionUpdateHandler)
    this.editor.on('transaction', transactionHandler)
    
    // 保存清理函数
    this.editorEventCleanup.push(
      () => this.editor.off('selectionUpdate', selectionUpdateHandler),
      () => this.editor.off('transaction', transactionHandler)
    )
  }

  private updateMenuVisibility(): void {
    const isInCodeBlock = this.editor.isActive('codeBlock')
    
    // 在代码块中需要禁用的菜单
    const menusToDisableInCodeBlock = [
      'headings', 'textFormat', 'blockquote', 'lists', 
      'alignment', 'colors', 'media', 'tables'
    ]
    
    menusToDisableInCodeBlock.forEach(menuKey => {
      const container = this.menuContainers.get(menuKey)
      if (container) {
        if (isInCodeBlock) {
          StyleUtils.addClass(container, 'rich:opacity-50')
          StyleUtils.addClass(container, 'rich:pointer-events-none')
        } else {
          StyleUtils.removeClass(container, 'rich:opacity-50')
          StyleUtils.removeClass(container, 'rich:pointer-events-none')
        }
      }
    })
  }

  public destroy(): void {
    // 清理编辑器事件监听器
    this.editorEventCleanup.forEach(cleanup => cleanup())
    this.editorEventCleanup = []
    
    // 销毁所有菜单组件
    this.menuComponents.forEach(component => {
      try {
        component.destroy()
      } catch (error) {
        console.warn('菜单组件销毁失败:', error)
      }
    })
    this.menuComponents = []
    
    // 清理所有事件监听器
    this.eventManager.cleanup()
    
    // 清理容器内容
    if (this.container) {
      TextUtils.setHTML(this.container, '')
      StyleUtils.clearClasses(this.container)
    }
    
    // 清理引用
    this.scrollContainer = null as any
  }
}
