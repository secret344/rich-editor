import { Editor } from '@tiptap/core'
import { EventManager } from '@/utils/EventManager'
import { BaseDropdownPanel, type BaseDropdownOptions } from '@/core/dom/dropdown/BaseDropdownPanel'
import { ElementUtils } from '@/core/dom/utils/ElementUtils'
import { ButtonUtils } from '@/core/dom/button/ButtonUtils'
import { TabUtils, type TabItem } from '@/core/dom/utils/TabUtils'
import { defaultDicts } from '@/options/dicts'
import { I18nManager, type I18nLabel, type SupportedLocale } from '@/utils/I18nManager'

// Emoji 分类接口
export interface EmojiCategory {
  label: I18nLabel
  items: string
}

// EmojiMenu 选项接口
export interface EmojiMenuOptions extends BaseDropdownOptions {
  locale?: SupportedLocale // 当前语言
}

export class EmojiMenu extends BaseDropdownPanel {
  private editor: Editor
  protected eventManager: EventManager
  protected editorRoot: HTMLElement
  private emojiButton: HTMLElement | null = null
  private currentCategory: string = 'emotions'
  private tabComponent: any = null
  private emojiGrid: HTMLElement | null = null
  private i18nManager: I18nManager
  private emojiCategories: EmojiCategory[]
  
  // 独立的事件管理器
  private tabEventManager: EventManager
  private emojiEventManager: EventManager

  constructor(
    container: HTMLElement,
    editor: Editor,
    eventManager: EventManager,
    editorRoot: HTMLElement,
    options: Partial<EmojiMenuOptions> = {}
  ) {
    // 创建 emoji 按钮
    const emojiButton = ButtonUtils.createIconButton({
      icon: '😀',
      title: '插入表情',
      className: 'rich:text-lg'
    })

    const defaultOptions: EmojiMenuOptions = {
      width: 320,
      maxHeight: 400,
      position: 'bottom-left',
      offset: { x: 0, y: 4 },
      closeOnClickOutside: true,
      closeOnEscape: true,
      className: 'rich:emoji-menu',
      triggerButton: emojiButton,
      editorRoot,
      locale: options.locale || 'zh_CN'
    }

    super(container, { ...defaultOptions, ...options })

    this.editor = editor
    this.eventManager = eventManager
    this.editorRoot = editorRoot
    this.emojiButton = emojiButton
    this.i18nManager = I18nManager.getInstance()
    
    // 初始化独立的事件管理器
    this.tabEventManager = new EventManager()
    this.emojiEventManager = new EventManager()
    
    // 设置语言
    if (options.locale) {
      this.i18nManager.setLocale(options.locale)
    }
    
    // 从 dicts.ts 获取 emoji 数据
    this.emojiCategories = defaultDicts.emojis

    // 将按钮添加到容器
    ElementUtils.appendChild(container, emojiButton)

    // 绑定按钮事件
    this.bindButtonEvents()
  }

  private bindButtonEvents(): void {
    if (this.emojiButton) {
      this.eventManager.addEventListener(this.emojiButton, 'click', (e) => {
        e.stopPropagation()
        this.toggle()
      })
    }
  }

  protected createContent(): void {
    // 创建分类标签页
    this.createCategoryTabs()
    
    // 创建 emoji 网格
    this.createEmojiGrid()
    
    // 渲染当前分类的 emoji
    this.renderCurrentCategory()
  }

  private createCategoryTabs(): void {
    // 创建标签页容器
    const tabContainer = ElementUtils.createElement({
      tagName: 'div',
      className: 'rich:mb-2'
    })

    // 准备标签页数据
    const tabItems: TabItem[] = this.emojiCategories.map((category, index) => ({
      id: this.getCategoryKey(index),
      label: this.getLocalizedLabel(category.label),
      disabled: false
    }))

    // 创建标签页组件
    this.tabComponent = TabUtils.createSimpleTabs(
      tabContainer,
      this.tabEventManager, // 使用独立的 Tab 事件管理器
      tabItems,
      {
        defaultActiveId: this.currentCategory,
        onChange: (activeId: string) => {
          this.switchCategory(activeId)
        }
      }
    )

    ElementUtils.appendChild(this.panel, tabContainer)
  }

  private createEmojiGrid(): void {
    this.emojiGrid = ElementUtils.createElement({
      tagName: 'div',
      className: 'rich:grid rich:grid-cols-8 rich:gap-1 rich:p-2 rich:max-h-64 rich:overflow-y-auto'
    })

    ElementUtils.appendChild(this.panel, this.emojiGrid)
  }

  private renderCurrentCategory(): void {
    if (!this.emojiGrid) return

    console.log('renderCurrentCategory called for:', this.currentCategory) // 调试日志

    // 清理 emoji 按钮的事件管理器
    this.emojiEventManager.cleanup()
    
    // 清空当前内容
    ElementUtils.empty(this.emojiGrid)
    
    console.log('Cleaned up emoji event manager') // 调试日志

    // 获取当前分类数据
    const categoryIndex = this.getCategoryIndex(this.currentCategory)
    if (categoryIndex === -1) return

    const category = this.emojiCategories[categoryIndex]
    const emojis = category.items.split(' ').filter(emoji => emoji.trim())

    console.log('Rendering emojis for category:', this.currentCategory, 'count:', emojis.length) // 调试日志

    // 渲染 emoji
    emojis.forEach(emoji => {
      const emojiText = emoji.trim()
      const emojiButton = ElementUtils.createElement({
        tagName: 'button',
        className: 'rich:w-8 rich:h-8 rich:flex rich:items-center rich:justify-center rich:text-lg rich:rounded rich:transition-colors hover:rich:bg-gray-100 rich:cursor-pointer',
        textContent: emojiText
      })

      // 使用独立的 emoji 事件管理器绑定点击事件
      this.emojiEventManager.addEventListener(emojiButton, 'click', (e: Event) => {
        e.preventDefault()
        e.stopPropagation()
        console.log('Emoji clicked:', emojiText) // 调试日志
        this.insertEmoji(emojiText)
      })

      if (this.emojiGrid) {
        ElementUtils.appendChild(this.emojiGrid, emojiButton)
      }
    })
    
    console.log('Finished rendering emojis for category:', this.currentCategory) // 调试日志
  }

  private switchCategory(categoryKey: string): void {
    this.currentCategory = categoryKey
    this.renderCurrentCategory()
  }

  private insertEmoji(emoji: string): void {
    this.editor.chain().focus().insertContent(emoji).run()
    this.hide()
  }

  private getCategoryKey(index: number): string {
    // 根据索引生成分类键名
    const keys = ['emotions', 'animals', 'food', 'activities', 'travel', 'objects', 'symbols', 'flags']
    return keys[index] || `category-${index}`
  }

  private getCategoryIndex(categoryKey: string): number {
    const keys = ['emotions', 'animals', 'food', 'activities', 'travel', 'objects', 'symbols', 'flags']
    return keys.indexOf(categoryKey)
  }

  private getLocalizedLabel(label: I18nLabel): string {
    return this.i18nManager.getLocalizedText(label)
  }

  public toggle(): void {
    if (this.isVisible) {
      this.hide()
    } else {
      this.show()
    }
  }

  public show(): void {
    super.show()
    
    // 重新绑定按钮事件，因为 BaseDropdownPanel 的 bindEvents 会清理事件
    this.bindButtonEvents()
    
    // 更新按钮状态
    if (this.emojiButton) {
      this.emojiButton.classList.add('rich:bg-blue-100', 'rich:text-blue-700')
      this.emojiButton.classList.remove('rich:text-gray-700')
    }
  }

  public hide(): void {
    super.hide()
    
    // 恢复按钮状态
    if (this.emojiButton) {
      this.emojiButton.classList.remove('rich:bg-blue-100', 'rich:text-blue-700')
      this.emojiButton.classList.add('rich:text-gray-700')
    }
  }

  public setLocale(locale: SupportedLocale): void {
    this.i18nManager.setLocale(locale)
    // 重新创建标签页以更新语言
    if (this.tabComponent) {
      this.createCategoryTabs()
    }
  }

  public destroy(): void {
    console.log('EmojiMenu destroy called') // 调试日志
    
    // 清理各个独立的事件管理器
    this.tabEventManager.cleanup()
    this.emojiEventManager.cleanup()
    
    // 清理主事件管理器
    this.eventManager.cleanup()
    
    // 移除按钮
    if (this.emojiButton && this.emojiButton.parentNode) {
      ElementUtils.remove(this.emojiButton)
    }
    
    // 清理标签页组件
    if (this.tabComponent && typeof this.tabComponent.destroy === 'function') {
      this.tabComponent.destroy()
      this.tabComponent = null
    }
    
    console.log('EmojiMenu destroyed') // 调试日志
    
    // 调用基类销毁方法
    super.destroy()
    
    // 清理引用
    this.emojiButton = null
    this.emojiGrid = null
  }
}