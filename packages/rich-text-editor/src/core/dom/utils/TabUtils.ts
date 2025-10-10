import { ElementUtils } from './ElementUtils'
import { StyleUtils } from './StyleUtils'
import { TextUtils } from './TextUtils'
import { EventManager } from '@/utils/EventManager'

// Tab 项接口
export interface TabItem {
  id: string
  label: string
  content?: HTMLElement
  disabled?: boolean
}

// Tab 选项接口
export interface TabOptions {
  className?: string
  activeClassName?: string
  inactiveClassName?: string
  tabClassName?: string
  contentClassName?: string
  orientation?: 'horizontal' | 'vertical'
  defaultActiveId?: string
  onChange?: (activeId: string, activeItem: TabItem) => void
}

// Tab 组件类
export class TabComponent {
  private container: HTMLElement
  private tabsContainer!: HTMLElement
  private contentContainer: HTMLElement | null = null
  private eventManager: EventManager
  private options: Required<TabOptions>
  private tabs: Map<string, TabItem> = new Map()
  private tabElements: Map<string, HTMLElement> = new Map()
  private activeTabId: string | null = null

  constructor(
    container: HTMLElement,
    eventManager: EventManager,
    options: TabOptions = {}
  ) {
    this.container = container
    this.eventManager = eventManager

    // 设置默认选项
    this.options = {
      className: 'rich:tab-component',
      activeClassName: 'rich:border-blue-500 rich:text-blue-600 rich:bg-blue-50',
      inactiveClassName: 'rich:border-transparent rich:text-gray-600 hover:rich:text-gray-800 hover:rich:bg-gray-50',
      tabClassName: 'rich:px-3 rich:py-2 rich:text-sm rich:whitespace-nowrap rich:border-b-2 rich:transition-colors rich:cursor-pointer',
      contentClassName: 'rich:tab-content',
      orientation: 'horizontal',
      defaultActiveId: '',
      onChange: () => {},
      ...options
    }

    this.init()
  }

  private init(): void {
    // 添加容器类名
    if (this.options.className) {
      StyleUtils.addClass(this.container, this.options.className)
    }

    // 创建标签页容器
    this.createTabsContainer()
  }

  private createTabsContainer(): void {
    const containerClass = this.options.orientation === 'horizontal' 
      ? 'rich:flex rich:border-b rich:border-gray-200 rich:overflow-x-auto'
      : 'rich:flex rich:flex-col rich:border-r rich:border-gray-200 rich:overflow-y-auto'

    this.tabsContainer = ElementUtils.createElement({
      tagName: 'div',
      className: containerClass
    })

    ElementUtils.appendChild(this.container, this.tabsContainer)
  }

  private createContentContainer(): void {
    if (this.contentContainer) return

    this.contentContainer = ElementUtils.createElement({
      tagName: 'div',
      className: this.options.contentClassName
    })

    ElementUtils.appendChild(this.container, this.contentContainer)
  }

  public addTab(item: TabItem): void {
    if (this.tabs.has(item.id)) {
      console.warn(`Tab with id "${item.id}" already exists`)
      return
    }

    this.tabs.set(item.id, item)
    this.createTabElement(item)

    // 如果是第一个标签页或者是默认激活的标签页，则激活它
    if (!this.activeTabId || item.id === this.options.defaultActiveId) {
      this.setActiveTab(item.id)
    }
  }

  public addTabs(items: TabItem[]): void {
    items.forEach(item => this.addTab(item))
  }

  private createTabElement(item: TabItem): void {
    const tabElement = ElementUtils.createElement({
      tagName: 'button',
      className: this.options.tabClassName,
      textContent: item.label
    })

    // 设置禁用状态
    if (item.disabled) {
      tabElement.setAttribute('disabled', 'true')
      const disabledClasses = 'rich:opacity-50 rich:cursor-not-allowed'.split(' ').filter(cls => cls.trim())
      StyleUtils.addClasses(tabElement, disabledClasses)
    }

    // 绑定点击事件
    this.eventManager.addEventListener(tabElement, 'click', (e) => {
      e.preventDefault()
      e.stopPropagation()
      
      if (!item.disabled) {
        this.setActiveTab(item.id)
      }
    })

    this.tabElements.set(item.id, tabElement)
    ElementUtils.appendChild(this.tabsContainer, tabElement)
  }

  public setActiveTab(tabId: string): void {
    if (!this.tabs.has(tabId)) {
      console.warn(`Tab with id "${tabId}" does not exist`)
      return
    }

    const previousActiveId = this.activeTabId
    this.activeTabId = tabId

    // 更新标签页样式
    this.updateTabStyles()

    // 更新内容
    this.updateContent()

    // 触发变更回调
    const activeItem = this.tabs.get(tabId)!
    if (previousActiveId !== tabId) {
      this.options.onChange(tabId, activeItem)
    }
  }

  private updateTabStyles(): void {
    this.tabElements.forEach((element, tabId) => {
      const isActive = tabId === this.activeTabId
      
      // 移除所有状态类 - 分割多个类名
      const activeClasses = this.options.activeClassName.split(' ').filter(cls => cls.trim())
      const inactiveClasses = this.options.inactiveClassName.split(' ').filter(cls => cls.trim())
      
      StyleUtils.removeClasses(element, activeClasses)
      StyleUtils.removeClasses(element, inactiveClasses)
      
      // 添加对应状态类
      const targetClasses = isActive ? activeClasses : inactiveClasses
      StyleUtils.addClasses(element, targetClasses)
    })
  }

  private updateContent(): void {
    if (!this.contentContainer || !this.activeTabId) return

    // 清空内容容器
    ElementUtils.empty(this.contentContainer)

    // 获取当前激活标签页的内容
    const activeTab = this.tabs.get(this.activeTabId)
    if (activeTab?.content) {
      ElementUtils.appendChild(this.contentContainer, activeTab.content)
    }
  }

  public removeTab(tabId: string): void {
    if (!this.tabs.has(tabId)) return

    // 移除标签页元素
    const tabElement = this.tabElements.get(tabId)
    if (tabElement) {
      ElementUtils.remove(tabElement)
      this.tabElements.delete(tabId)
    }

    // 移除标签页数据
    this.tabs.delete(tabId)

    // 如果移除的是当前激活的标签页，激活第一个可用的标签页
    if (this.activeTabId === tabId) {
      const firstTabId = Array.from(this.tabs.keys())[0]
      if (firstTabId) {
        this.setActiveTab(firstTabId)
      } else {
        this.activeTabId = null
      }
    }
  }

  public getActiveTabId(): string | null {
    return this.activeTabId
  }

  public getTab(tabId: string): TabItem | undefined {
    return this.tabs.get(tabId)
  }

  public getAllTabs(): TabItem[] {
    return Array.from(this.tabs.values())
  }

  public updateTabLabel(tabId: string, newLabel: string): void {
    const tab = this.tabs.get(tabId)
    const tabElement = this.tabElements.get(tabId)
    
    if (tab && tabElement) {
      tab.label = newLabel
      TextUtils.setText(tabElement, newLabel)
    }
  }

  public setTabDisabled(tabId: string, disabled: boolean): void {
    const tabElement = this.tabElements.get(tabId)
    const tabItem = this.tabs.get(tabId)
    
    if (!tabElement || !tabItem) {
      console.warn(`Tab with id "${tabId}" does not exist`)
      return
    }

    tabItem.disabled = disabled
    const disabledClasses = 'rich:opacity-50 rich:cursor-not-allowed'.split(' ').filter(cls => cls.trim())

    if (disabled) {
      tabElement.setAttribute('disabled', 'true')
      StyleUtils.addClasses(tabElement, disabledClasses)
    } else {
      tabElement.removeAttribute('disabled')
      StyleUtils.removeClasses(tabElement, disabledClasses)
    }
  }

  public enableContentContainer(): void {
    if (!this.contentContainer) {
      this.createContentContainer()
      this.updateContent()
    }
  }

  public destroy(): void {
    // 清理事件监听器会由 EventManager 统一处理
    
    // 清理引用
    this.tabs.clear()
    this.tabElements.clear()
    this.activeTabId = null
    
    // 清空容器
    ElementUtils.empty(this.container)
  }
}

// Tab 工具类
export class TabUtils {
  /**
   * 创建简单的标签页组件（仅标签页，不包含内容区域）
   */
  static createSimpleTabs(
    container: HTMLElement,
    eventManager: EventManager,
    items: TabItem[],
    options: TabOptions = {}
  ): TabComponent {
    const tabComponent = new TabComponent(container, eventManager, options)
    tabComponent.addTabs(items)
    return tabComponent
  }

  /**
   * 创建完整的标签页组件（包含内容区域）
   */
  static createFullTabs(
    container: HTMLElement,
    eventManager: EventManager,
    items: TabItem[],
    options: TabOptions = {}
  ): TabComponent {
    const tabComponent = new TabComponent(container, eventManager, options)
    tabComponent.enableContentContainer()
    tabComponent.addTabs(items)
    return tabComponent
  }
}