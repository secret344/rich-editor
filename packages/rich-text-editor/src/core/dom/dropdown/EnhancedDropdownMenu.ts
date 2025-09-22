import { BaseDropdownPanel, type BaseDropdownOptions } from '@/core/dom/dropdown/BaseDropdownPanel'
import { StateManager, type StateUpdatable } from '@/utils/StateManager'
import { ButtonUtils } from '@/core/dom/button/ButtonUtils'
import { ElementUtils } from '@/core/dom/utils/ElementUtils'

export interface DropdownMenuOptions extends BaseDropdownOptions {
  label: string
  icon?: string
  title?: string
  disabled?: boolean
  items?: DropdownMenuItem[]
  showLabel?: boolean // 是否显示文字标签，默认为true
  triggerButton?: HTMLElement // 外部提供的触发按钮
}

export interface DropdownMenuItem {
  id?: string
  label?: string
  icon?: string
  disabled?: boolean | (() => boolean)
  onClick?: () => void
  className?: string
  separator?: boolean
  active?: () => boolean
}

import { EventManager } from '@/utils/EventManager'

export class EnhancedDropdownMenu extends BaseDropdownPanel implements StateUpdatable {
  private button!: HTMLElement
  private items: DropdownMenuItem[] = []
  private buttonEventManager: EventManager
  private menuItemElements: Map<string, HTMLElement> = new Map()

  constructor(container: HTMLElement, options: DropdownMenuOptions) {
    // 初始化事件管理器
    const buttonEventManager = new EventManager()
    
    // 如果没有提供外部按钮，先创建按钮
    let triggerButton: HTMLElement
    if (options.triggerButton) {
      triggerButton = options.triggerButton
      // 将外部按钮添加到容器中
      ElementUtils.appendChild(container, triggerButton)
    } else {
      triggerButton = ButtonUtils.createIconButton({
        icon: options.icon,
        title: options.title || '',
      })
      ElementUtils.appendChild(container, triggerButton)
    }
    
    // 设置默认选项，包含triggerButton
    const defaultOptions: DropdownMenuOptions = {
      ...options,
      position: 'bottom-left',
      offset: { x: 0, y: 4 },
      closeOnClickOutside: true,
      closeOnEscape: true,
      width: options.width || 200,
      className: `rich:dropdown-menu ${options.className || ''}`,
      triggerButton: triggerButton
    }
    
    super(container, defaultOptions)
    
    // 设置实例属性
    this.button = triggerButton
    this.buttonEventManager = buttonEventManager
    
    // 设置菜单项
    if ((this.options as DropdownMenuOptions).items) {
      this.items = (this.options as DropdownMenuOptions).items!
    }
    
    // 注册到状态管理器（如果是新创建的按钮）
    if (!options.triggerButton) {
      StateManager.getInstance().register(this)
    }
    
    this.bindButtonEvents()
  }

  // 继承基类的findEditorRoot方法



  public updateState(): void {
    // 检查是否有任何菜单项处于激活状态
    const hasActiveItem = this.items.some(item => item.active && item.active())
    
    if (hasActiveItem) {
      this.button.classList.add('rich:bg-blue-100', 'rich:text-blue-700')
      this.button.classList.remove('rich:text-gray-700')
    } else {
      this.button.classList.remove('rich:bg-blue-100', 'rich:text-blue-700')
      this.button.classList.add('rich:text-gray-700')
    }

    // 检查是否禁用
    const isDisabled = (this.options as DropdownMenuOptions).disabled || 
                      this.items.every(item => {
                        if (typeof item.disabled === 'function') {
                          return item.disabled()
                        }
                        return item.disabled
                      })
    if (isDisabled) {
      this.button.setAttribute('disabled', 'true')
    } else {
      this.button.removeAttribute('disabled')
    }
    
    // 更新所有菜单项状态
    this.updateAllMenuItemsState()
  }

  public updateAllMenuItemsState(): void {
    this.items.forEach(item => {
      if (item.id) {
        const itemElement = this.menuItemElements.get(item.id)
        if (itemElement) {
          this.updateMenuItemState(item, itemElement)
        }
      }
    })
  }

  protected createContent(): void {
    // 基类已经创建了panel，我们只需要渲染菜单项
    this.renderItems()
  }

  private bindButtonEvents(): void {
    // 为按钮绑定点击事件
    this.buttonEventManager.addEventListener(this.button, 'click', (e) => {
      e.stopPropagation()
      this.toggle()
    })
  }



  public addItem(item: DropdownMenuItem): void {
    this.items.push(item)
    this.renderItems()
  }

  public addItems(items: DropdownMenuItem[]): void {
    this.items.push(...items)
    this.renderItems()
  }

  public removeItem(id: string): void {
    this.items = this.items.filter(item => item.id !== id)
    this.renderItems()
  }

  public clear(): void {
    this.items = []
    ElementUtils.empty(this.panel)
  }

  private renderItems(): void {
    ElementUtils.empty(this.panel)
    
    this.items.forEach(item => {
      if (item.separator) {
        this.addSeparator()
      } else {
        this.createMenuItem(item)
      }
    })
  }

  private createMenuItem(item: DropdownMenuItem): void {
    const itemElement = ElementUtils.createElement({
      tagName: 'div',
      className: `rich:px-3 rich:py-2 rich:text-sm rich:cursor-pointer rich:flex rich:items-center rich:gap-2 rich:transition-colors hover:rich:bg-gray-100 ${item.className || ''}`
    })
    
    // 存储菜单项元素引用
    if (item.id) {
      this.menuItemElements.set(item.id, itemElement)
    }
    
    // 初始状态更新
    this.updateMenuItemState(item, itemElement)

    if (item.icon) {
      const icon = ElementUtils.createElement({
        tagName: 'span',
        className: 'rich:text-lg',
        textContent: item.icon
      })
      ElementUtils.appendChild(itemElement, icon)
    }

    if (item.label) {
      const label = ElementUtils.createElement({
        tagName: 'span',
        textContent: item.label
      })
      ElementUtils.appendChild(itemElement, label)
    }

    // 事件处理已移至updateMenuItemState方法中

    ElementUtils.appendChild(this.panel, itemElement)
  }

  private updateMenuItemState(item: DropdownMenuItem, itemElement: HTMLElement): void {
    // 处理disabled状态（可能是函数）
    const isDisabled = typeof item.disabled === 'function' ? item.disabled() : item.disabled
    if (isDisabled) {
      itemElement.classList.add('rich:opacity-50', 'rich:cursor-not-allowed')
      itemElement.classList.remove('hover:rich:bg-gray-100')
    } else {
      itemElement.classList.remove('rich:opacity-50', 'rich:cursor-not-allowed')
      itemElement.classList.add('hover:rich:bg-gray-100')
    }

    // 处理active状态 - 只改变文字颜色，不添加背景色
    const isActive = typeof item.active === 'function' ? item.active() : false
    if (isActive) {
      itemElement.classList.add('rich:text-blue-700', 'rich:font-medium')
    } else {
      itemElement.classList.remove('rich:text-blue-700', 'rich:font-medium')
    }

    // 更新点击事件
    if (!isDisabled && item.onClick) {
      // 移除旧的事件监听器（如果存在）
      this.buttonEventManager.cleanupForElement(itemElement)
      // 添加新的事件监听器
      this.buttonEventManager.addEventListener(itemElement, 'click', (e) => {
        e.stopPropagation()
        item.onClick!()
        this.hide()
      })
    } else {
      // 清理事件监听器
      this.buttonEventManager.cleanupForElement(itemElement)
    }
  }

  private addSeparator(): void {
    const separator = ElementUtils.createElement({
      tagName: 'div',
      className: 'rich:border-t rich:border-gray-200 rich:my-1'
    })
    ElementUtils.appendChild(this.panel, separator)
  }



  public toggle(): void {
    if (this.isVisible) {
      this.hide()
    } else {
      this.show()
    }
  }

  public show(): void {
    // 基类已经处理了关闭其他菜单的逻辑
    
    // 调用基类的show方法
    super.show()
    
    // 更新按钮状态，显示激活状态（类似其他按钮）
    this.button.classList.add('rich:bg-blue-100', 'rich:text-blue-700')
    this.button.classList.remove('rich:text-gray-700')
  }

  public hide(): void {
    // 调用基类的hide方法
    super.hide()
    
    // 恢复按钮状态
    this.updateState()
  }

  public destroy(): void {
    // 关闭菜单
    this.hide()
    
    // 从状态管理器注销
    StateManager.getInstance().unregister(this)
    
    // 清理按钮事件监听器
    this.buttonEventManager.cleanup()

    // 移除按钮 DOM 元素
    if (this.button && this.button.parentNode) {
      ElementUtils.remove(this.button)
    }
    
    // 调用基类的destroy方法
    super.destroy()
    
    // 清理引用
    this.button = null as any
    this.items = []
    this.menuItemElements.clear()
  }

  public get isMenuOpen(): boolean {
    return this.isVisible
  }

  public setItems(items: DropdownMenuItem[]): void {
    this.items = items
    this.renderItems()
  }



}
