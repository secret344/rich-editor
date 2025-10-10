/**
 * 国际化管理器
 * 为富文本编辑器提供多语言支持
 */

export type SupportedLocale = 'en_US' | 'zh_CN'

export interface I18nLabel {
  en_US: string
  zh_CN: string
}

export interface I18nConfig {
  locale: SupportedLocale
  fallbackLocale: SupportedLocale
}

export class I18nManager {
  private static instance: I18nManager | null = null
  private currentLocale: SupportedLocale = 'zh_CN'
  private fallbackLocale: SupportedLocale = 'en_US'

  private constructor() {}

  public static getInstance(): I18nManager {
    if (!I18nManager.instance) {
      I18nManager.instance = new I18nManager()
    }
    return I18nManager.instance
  }

  /**
   * 设置当前语言
   */
  public setLocale(locale: SupportedLocale): void {
    this.currentLocale = locale
  }

  /**
   * 获取当前语言
   */
  public getLocale(): SupportedLocale {
    return this.currentLocale
  }

  /**
   * 设置回退语言
   */
  public setFallbackLocale(locale: SupportedLocale): void {
    this.fallbackLocale = locale
  }

  /**
   * 获取本地化文本
   */
  public getLocalizedText(label: I18nLabel | string): string {
    // 如果是字符串，直接返回
    if (typeof label === 'string') {
      return label
    }

    // 尝试获取当前语言的文本
    if (label[this.currentLocale]) {
      return label[this.currentLocale]
    }

    // 回退到默认语言
    if (label[this.fallbackLocale]) {
      return label[this.fallbackLocale]
    }

    // 如果都没有，返回第一个可用的值
    const availableKeys = Object.keys(label) as SupportedLocale[]
    if (availableKeys.length > 0) {
      return label[availableKeys[0]]
    }

    return ''
  }

  /**
   * 检查是否支持指定语言
   */
  public isLocaleSupported(locale: string): locale is SupportedLocale {
    return locale === 'en_US' || locale === 'zh_CN'
  }

  /**
   * 获取所有支持的语言
   */
  public getSupportedLocales(): SupportedLocale[] {
    return ['en_US', 'zh_CN']
  }

  /**
   * 从浏览器语言设置中检测语言
   */
  public detectBrowserLocale(): SupportedLocale {
    if (typeof navigator === 'undefined') {
      return this.fallbackLocale
    }

    const browserLang = navigator.language || (navigator as any).userLanguage
    
    if (browserLang.startsWith('zh')) {
      return 'zh_CN'
    } else if (browserLang.startsWith('en')) {
      return 'en_US'
    }

    return this.fallbackLocale
  }

  /**
   * 初始化国际化配置
   */
  public initialize(config?: Partial<I18nConfig>): void {
    if (config?.locale) {
      this.setLocale(config.locale)
    } else {
      // 自动检测浏览器语言
      this.setLocale(this.detectBrowserLocale())
    }

    if (config?.fallbackLocale) {
      this.setFallbackLocale(config.fallbackLocale)
    }
  }
}