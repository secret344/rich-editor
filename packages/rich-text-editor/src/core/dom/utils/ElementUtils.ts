/**
 * 元素创建和操作工具类
 * 统一管理DOM元素的创建、查询和基本操作
 */

export interface ElementOptions {
  tagName: string
  className?: string
  id?: string
  textContent?: string
  innerHTML?: string
  attributes?: Record<string, string>
  children?: HTMLElement[]
  parent?: HTMLElement
}

export class ElementUtils {
  /**
   * 创建DOM元素
   */
  static createElement(options: ElementOptions): HTMLElement {
    const element = document.createElement(options.tagName)
    
    if (options.className) {
      element.className = options.className
    }
    
    if (options.id) {
      element.id = options.id
    }
    
    if (options.textContent) {
      element.textContent = options.textContent
    }
    
    if (options.innerHTML) {
      element.innerHTML = options.innerHTML
    }
    
    if (options.attributes) {
      Object.entries(options.attributes).forEach(([key, value]) => {
        element.setAttribute(key, value)
      })
    }
    
    if (options.children) {
      options.children.forEach(child => {
        element.appendChild(child)
      })
    }
    
    if (options.parent) {
      options.parent.appendChild(element)
    }
    
    return element
  }

  /**
   * 创建div元素
   */
  static createDiv(options: Omit<ElementOptions, 'tagName'> = {}): HTMLDivElement {
    return this.createElement({ ...options, tagName: 'div' }) as HTMLDivElement
  }

  /**
   * 创建span元素
   */
  static createSpan(options: Omit<ElementOptions, 'tagName'> = {}): HTMLSpanElement {
    return this.createElement({ ...options, tagName: 'span' }) as HTMLSpanElement
  }

  /**
   * 创建label元素
   */
  static createLabel(options: Omit<ElementOptions, 'tagName'> = {}): HTMLLabelElement {
    return this.createElement({ ...options, tagName: 'label' }) as HTMLLabelElement
  }

  /**
   * 添加子元素
   */
  static appendChild(parent: HTMLElement, child: HTMLElement): void {
    parent.appendChild(child)
  }

  /**
   * 批量添加子元素
   */
  static appendChildren(parent: HTMLElement, children: HTMLElement[]): void {
    children.forEach(child => parent.appendChild(child))
  }

  /**
   * 移除子元素
   */
  static removeChild(parent: HTMLElement, child: HTMLElement): void {
    if (child.parentNode === parent) {
      parent.removeChild(child)
    }
  }

  /**
   * 在指定元素前插入新元素
   */
  static insertBefore(parent: HTMLElement, newElement: HTMLElement, referenceElement: HTMLElement): void {
    parent.insertBefore(newElement, referenceElement)
  }

  /**
   * 移除元素
   */
  static remove(element: HTMLElement): void {
    if (element.parentNode) {
      element.parentNode.removeChild(element)
    }
  }

  /**
   * 清空元素内容
   */
  static empty(element: HTMLElement): void {
    element.innerHTML = ''
  }

  /**
   * 查询单个元素
   */
  static querySelector<T extends HTMLElement = HTMLElement>(
    selector: string, 
    parent: HTMLElement | Document = document
  ): T | null {
    return parent.querySelector<T>(selector)
  }

  /**
   * 查询所有匹配的元素
   */
  static querySelectorAll<T extends HTMLElement = HTMLElement>(
    selector: string, 
    parent: HTMLElement | Document = document
  ): NodeListOf<T> {
    return parent.querySelectorAll<T>(selector)
  }

  /**
   * 根据ID查询元素
   */
  static getElementById<T extends HTMLElement = HTMLElement>(id: string): T | null {
    return document.getElementById(id) as T | null
  }

  /**
   * 克隆元素
   */
  static clone(element: HTMLElement, deep: boolean = true): HTMLElement {
    return element.cloneNode(deep) as HTMLElement
  }

  /**
   * 获取元素的父元素
   */
  static getParent(element: HTMLElement): HTMLElement | null {
    return element.parentElement
  }

  /**
   * 获取元素的所有子元素
   */
  static getChildren(element: HTMLElement): HTMLElement[] {
    return Array.from(element.children) as HTMLElement[]
  }

  /**
   * 获取元素的兄弟元素
   */
  static getSiblings(element: HTMLElement): HTMLElement[] {
    const parent = element.parentElement
    if (!parent) return []
    
    return Array.from(parent.children).filter(child => child !== element) as HTMLElement[]
  }

  /**
   * 检查元素是否包含指定的子元素
   */
  static contains(parent: HTMLElement, child: HTMLElement): boolean {
    return parent.contains(child)
  }

  /**
   * 获取元素相对于文档的位置
   */
  static getPosition(element: HTMLElement): { x: number, y: number } {
    const rect = element.getBoundingClientRect()
    return {
      x: rect.left + window.scrollX,
      y: rect.top + window.scrollY
    }
  }

  /**
   * 获取元素的尺寸
   */
  static getSize(element: HTMLElement): { width: number, height: number } {
    const rect = element.getBoundingClientRect()
    return {
      width: rect.width,
      height: rect.height
    }
  }
}
