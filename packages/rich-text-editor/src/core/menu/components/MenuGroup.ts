import { EnhancedDropdownMenu, type DropdownMenuItem, ElementUtils } from '@/core/dom'

export interface MenuGroupOptions {
  label: string
  icon?: string
  items: MenuItem[]
  className?: string
}

export interface MenuItem {
  id: string
  label: string
  icon?: string
  title?: string
  className?: string
  onClick: () => void
  isActive?: () => boolean
  isDisabled?: () => boolean
  type?: 'button' | 'separator'
}

export class MenuGroup {
  private container: HTMLElement
  private options: MenuGroupOptions
  private editorRoot: HTMLElement
  private dropdown: EnhancedDropdownMenu | null = null

  constructor(container: HTMLElement, options: MenuGroupOptions, editorRoot: HTMLElement) {
    this.container = container
    this.options = options
    this.editorRoot = editorRoot
    this.createMenuGroup()
  }

  private createMenuGroup(): void {
    // 创建相对定位的容器
    const groupContainer = ElementUtils.createDiv({
      className: `rich:relative ${this.options.className || ''}`,
      parent: this.container
    })

    // 转换菜单项为 DropdownMenuItem 格式
    const dropdownItems: DropdownMenuItem[] = this.options.items.map((item) => {
      if (item.type === 'separator') {
        return { separator: true, label: '' }
      } else {
        return {
          id: item.id,
          label: item.label,
          icon: item.icon,
          disabled: item.isDisabled?.(),
          onClick: item.onClick,
          className: item.className
        }
      }
    })

    // 创建下拉菜单
    this.dropdown = new EnhancedDropdownMenu(groupContainer, {
      label: this.options.label,
      icon: this.options.icon,
      title: this.options.label,
      editorRoot: this.editorRoot
    })

    // 设置菜单项
    this.dropdown.setItems(dropdownItems)
  }

  public updateItemStates(): void {
    // 重新渲染菜单项以更新状态
    if (this.dropdown) {
      const dropdownItems: DropdownMenuItem[] = this.options.items.map((item) => {
        if (item.type === 'separator') {
          return { separator: true, label: '' }
        } else {
          return {
            id: item.id,
            label: item.label,
            icon: item.icon,
            disabled: item.isDisabled?.(),
            onClick: item.onClick,
            className: item.className,
            active: item.isActive
          }
        }
      })
      this.dropdown.setItems(dropdownItems)
    }
  }

  public update(): void {
    this.updateItemStates()
  }

  public destroy(): void {
    if (this.dropdown) {
      this.dropdown.destroy()
    }
  }
}
