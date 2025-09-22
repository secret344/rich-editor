/**
 * 文本和内容操作工具类
 * 统一管理DOM元素的文本内容、HTML内容操作
 */

export class TextUtils {
  /**
   * 设置文本内容
   */
  static setText(element: HTMLElement, text: string): void {
    element.textContent = text
  }

  /**
   * 获取文本内容
   */
  static getText(element: HTMLElement): string {
    return element.textContent || ''
  }

  /**
   * 设置HTML内容
   */
  static setHTML(element: HTMLElement, html: string): void {
    element.innerHTML = html
  }

  /**
   * 获取HTML内容
   */
  static getHTML(element: HTMLElement): string {
    return element.innerHTML
  }

  /**
   * 追加文本内容
   */
  static appendText(element: HTMLElement, text: string): void {
    element.textContent = (element.textContent || '') + text
  }

  /**
   * 追加HTML内容
   */
  static appendHTML(element: HTMLElement, html: string): void {
    element.innerHTML += html
  }

  /**
   * 前置文本内容
   */
  static prependText(element: HTMLElement, text: string): void {
    element.textContent = text + (element.textContent || '')
  }

  /**
   * 前置HTML内容
   */
  static prependHTML(element: HTMLElement, html: string): void {
    element.innerHTML = html + element.innerHTML
  }

  /**
   * 清空文本内容
   */
  static clearText(element: HTMLElement): void {
    element.textContent = ''
  }

  /**
   * 清空HTML内容
   */
  static clearHTML(element: HTMLElement): void {
    element.innerHTML = ''
  }

  /**
   * 设置元素的值（适用于input、textarea等）
   */
  static setValue(element: HTMLInputElement | HTMLTextAreaElement, value: string): void {
    element.value = value
  }

  /**
   * 获取元素值
   */
  static getValue(element: HTMLInputElement | HTMLTextAreaElement): string {
    return element.value
  }

  /**
   * 设置元素的placeholder
   */
  static setPlaceholder(element: HTMLInputElement | HTMLTextAreaElement, placeholder: string): void {
    element.placeholder = placeholder
  }

  /**
   * 获取元素的placeholder
   */
  static getPlaceholder(element: HTMLInputElement | HTMLTextAreaElement): string {
    return element.placeholder
  }

  /**
   * 检查文本内容是否为空
   */
  static isEmpty(element: HTMLElement): boolean {
    const text = element.textContent || ''
    return text.trim().length === 0
  }

  /**
   * 检查HTML内容是否为空
   */
  static isHTMLEmpty(element: HTMLElement): boolean {
    const html = element.innerHTML
    return html.trim().length === 0
  }

  /**
   * 获取文本长度
   */
  static getTextLength(element: HTMLElement): number {
    return (element.textContent || '').length
  }

  /**
   * 截断文本内容
   */
  static truncateText(element: HTMLElement, maxLength: number, suffix: string = '...'): void {
    const text = element.textContent || ''
    if (text.length > maxLength) {
      element.textContent = text.substring(0, maxLength - suffix.length) + suffix
    }
  }

  /**
   * 设置title属性（鼠标悬停提示）
   */
  static setTitle(element: HTMLElement, title: string): void {
    element.title = title
  }

  /**
   * 获取title属性
   */
  static getTitle(element: HTMLElement): string {
    return element.title
  }

  /**
   * 设置aria-label属性（无障碍标签）
   */
  static setAriaLabel(element: HTMLElement, label: string): void {
    element.setAttribute('aria-label', label)
  }

  /**
   * 获取aria-label属性
   */
  static getAriaLabel(element: HTMLElement): string {
    return element.getAttribute('aria-label') || ''
  }

  /**
   * 设置data属性
   */
  static setData(element: HTMLElement, key: string, value: string): void {
    element.setAttribute(`data-${key}`, value)
  }

  /**
   * 获取data属性
   */
  static getData(element: HTMLElement, key: string): string {
    return element.getAttribute(`data-${key}`) || ''
  }

  /**
   * 设置自定义属性
   */
  static setAttribute(element: HTMLElement, name: string, value: string): void {
    element.setAttribute(name, value)
  }

  /**
   * 获取自定义属性
   */
  static getAttribute(element: HTMLElement, name: string): string {
    return element.getAttribute(name) || ''
  }

  /**
   * 移除属性
   */
  static removeAttribute(element: HTMLElement, name: string): void {
    element.removeAttribute(name)
  }

  /**
   * 检查是否有指定属性
   */
  static hasAttribute(element: HTMLElement, name: string): boolean {
    return element.hasAttribute(name)
  }
}
