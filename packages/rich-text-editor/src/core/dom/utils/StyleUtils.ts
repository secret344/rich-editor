/**
 * 样式操作工具类
 * 统一管理DOM元素的样式、CSS类和内联样式操作
 */

export class StyleUtils {
  /**
   * 添加CSS类
   */
  static addClass(element: HTMLElement, className: string): void {
    element.classList.add(className)
  }

  /**
   * 批量添加CSS类
   */
  static addClasses(element: HTMLElement, classNames: string[]): void {
    element.classList.add(...classNames)
  }

  /**
   * 移除CSS类
   */
  static removeClass(element: HTMLElement, className: string): void {
    element.classList.remove(className)
  }

  /**
   * 批量移除CSS类
   */
  static removeClasses(element: HTMLElement, classNames: string[]): void {
    element.classList.remove(...classNames)
  }

  /**
   * 切换CSS类
   */
  static toggleClass(element: HTMLElement, className: string): boolean {
    return element.classList.toggle(className)
  }

  /**
   * 检查是否包含CSS类
   */
  static hasClass(element: HTMLElement, className: string): boolean {
    return element.classList.contains(className)
  }

  /**
   * 替换CSS类
   */
  static replaceClass(element: HTMLElement, oldClass: string, newClass: string): void {
    element.classList.replace(oldClass, newClass)
  }

  /**
   * 设置完整的className
   */
  static setClassName(element: HTMLElement, className: string): void {
    element.className = className
  }

  /**
   * 获取className
   */
  static getClassName(element: HTMLElement): string {
    return element.className
  }

  /**
   * 清空所有CSS类
   */
  static clearClasses(element: HTMLElement): void {
    element.className = ''
  }

  /**
   * 设置内联样式
   */
  static setStyle(element: HTMLElement, property: string, value: string): void {
    ;(element.style as unknown as Record<string, string>)[property] = value
  }

  /**
   * 批量设置内联样式
   */
  static setStyles(element: HTMLElement, styles: Record<string, string>): void {
    Object.entries(styles).forEach(([property, value]) => {
      ;(element.style as unknown as Record<string, string>)[property] = value
    })
  }

  /**
   * 获取内联样式
   */
  static getStyle(element: HTMLElement, property: string): string {
    return (element.style as unknown as Record<string, string>)[property] || ''
  }

  /**
   * 获取计算后的样式
   */
  static getComputedStyle(element: HTMLElement, property?: string): string | CSSStyleDeclaration {
    const computed = window.getComputedStyle(element)
    return property ? computed.getPropertyValue(property) : computed
  }

  /**
   * 移除内联样式
   */
  static removeStyle(element: HTMLElement, property: string): void {
    ;(element.style as unknown as Record<string, string>)[property] = ''
  }

  /**
   * 清空所有内联样式
   */
  static clearStyles(element: HTMLElement): void {
    element.removeAttribute('style')
  }

  /**
   * 设置CSS变量
   */
  static setCSSVariable(element: HTMLElement, name: string, value: string): void {
    element.style.setProperty(`--${name}`, value)
  }

  /**
   * 获取CSS变量
   */
  static getCSSVariable(element: HTMLElement, name: string): string {
    return element.style.getPropertyValue(`--${name}`)
  }

  /**
   * 设置显示状态
   */
  static show(element: HTMLElement, display: string = 'block'): void {
    element.style.display = display
  }

  /**
   * 隐藏元素
   */
  static hide(element: HTMLElement): void {
    element.style.display = 'none'
  }

  /**
   * 切换显示状态
   */
  static toggleDisplay(element: HTMLElement, display: string = 'block'): boolean {
    const isHidden = element.style.display === 'none'
    element.style.display = isHidden ? display : 'none'
    return !isHidden
  }

  /**
   * 检查元素是否可见
   */
  static isVisible(element: HTMLElement): boolean {
    const style = window.getComputedStyle(element)
    return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0'
  }

  /**
   * 设置透明度
   */
  static setOpacity(element: HTMLElement, opacity: number): void {
    element.style.opacity = opacity.toString()
  }

  /**
   * 设置位置
   */
  static setPosition(element: HTMLElement, position: {
    top?: string | number
    left?: string | number
    right?: string | number
    bottom?: string | number
    position?: 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky'
  }): void {
    if (position.position) {
      element.style.position = position.position
    }
    
    if (position.top !== undefined) {
      element.style.top = typeof position.top === 'number' ? `${position.top}px` : position.top
    }
    
    if (position.left !== undefined) {
      element.style.left = typeof position.left === 'number' ? `${position.left}px` : position.left
    }
    
    if (position.right !== undefined) {
      element.style.right = typeof position.right === 'number' ? `${position.right}px` : position.right
    }
    
    if (position.bottom !== undefined) {
      element.style.bottom = typeof position.bottom === 'number' ? `${position.bottom}px` : position.bottom
    }
  }

  /**
   * 设置尺寸
   */
  static setSize(element: HTMLElement, size: {
    width?: string | number
    height?: string | number
    maxWidth?: string | number
    maxHeight?: string | number
    minWidth?: string | number
    minHeight?: string | number
  }): void {
    if (size.width !== undefined) {
      element.style.width = typeof size.width === 'number' ? `${size.width}px` : size.width
    }
    
    if (size.height !== undefined) {
      element.style.height = typeof size.height === 'number' ? `${size.height}px` : size.height
    }
    
    if (size.maxWidth !== undefined) {
      element.style.maxWidth = typeof size.maxWidth === 'number' ? `${size.maxWidth}px` : size.maxWidth
    }
    
    if (size.maxHeight !== undefined) {
      element.style.maxHeight = typeof size.maxHeight === 'number' ? `${size.maxHeight}px` : size.maxHeight
    }
    
    if (size.minWidth !== undefined) {
      element.style.minWidth = typeof size.minWidth === 'number' ? `${size.minWidth}px` : size.minWidth
    }
    
    if (size.minHeight !== undefined) {
      element.style.minHeight = typeof size.minHeight === 'number' ? `${size.minHeight}px` : size.minHeight
    }
  }
}
