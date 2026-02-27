import { EventManager } from '@/utils/EventManager'
import { ShortcutManager } from '@/utils/ShortcutManager'
import { ButtonUtils, ElementUtils, StyleUtils } from '@/core/dom'

export class FullscreenMenu {
  private static instanceCounter = 0
  private container: HTMLElement
  private editorRoot: HTMLElement
  private eventManager: EventManager
  private isFullscreen: boolean = false
  private button: HTMLButtonElement | null = null
  private originalStyles: { width: string; height: string; position: string; zIndex: string; top: string; left: string; background: string } | null = null
  private shortcutId: string

  constructor(container: HTMLElement, eventManager: EventManager, editorRoot: HTMLElement) {
    this.container = container
    this.eventManager = eventManager
    this.editorRoot = editorRoot
    this.shortcutId = `fullscreen-escape-${FullscreenMenu.instanceCounter++}`
    this.render()
    this.setupEscListener()
  }

  private render(): void {
    this.button = ButtonUtils.createIconButton({
      id: 'fullscreen',
      icon: '⛶',
      title: '全屏',
    })

    this.eventManager.addEventListener(this.button, 'click', () => {
      this.toggleFullscreen()
    })

    ElementUtils.appendChild(this.container, this.button)
  }

  private setupEscListener(): void {
    ShortcutManager.getInstance().register(this.shortcutId, {
      key: 'Escape',
      priority: 1,
      description: '退出全屏',
      handler: () => {
        if (this.isFullscreen) {
          this.exitFullscreen()
          return true
        }
        return false
      }
    })
  }

  private toggleFullscreen(): void {
    if (this.isFullscreen) {
      this.exitFullscreen()
    } else {
      this.enterFullscreen()
    }
  }

  private enterFullscreen(): void {
    this.originalStyles = {
      width: this.editorRoot.style.width,
      height: this.editorRoot.style.height,
      position: this.editorRoot.style.position,
      zIndex: this.editorRoot.style.zIndex,
      top: this.editorRoot.style.top,
      left: this.editorRoot.style.left,
      background: this.editorRoot.style.background,
    }

    StyleUtils.setStyle(this.editorRoot, 'position', 'fixed')
    StyleUtils.setStyle(this.editorRoot, 'top', '0')
    StyleUtils.setStyle(this.editorRoot, 'left', '0')
    StyleUtils.setStyle(this.editorRoot, 'width', '100vw')
    StyleUtils.setStyle(this.editorRoot, 'height', '100vh')
    StyleUtils.setStyle(this.editorRoot, 'zIndex', '9998')
    StyleUtils.setStyle(this.editorRoot, 'background', '#fff')
    StyleUtils.addClass(this.editorRoot, 'rich:overflow-auto')

    this.isFullscreen = true
    this.updateButtonIcon()
  }

  private exitFullscreen(): void {
    if (!this.originalStyles) return

    StyleUtils.setStyle(this.editorRoot, 'position', this.originalStyles.position)
    StyleUtils.setStyle(this.editorRoot, 'top', this.originalStyles.top)
    StyleUtils.setStyle(this.editorRoot, 'left', this.originalStyles.left)
    StyleUtils.setStyle(this.editorRoot, 'width', this.originalStyles.width)
    StyleUtils.setStyle(this.editorRoot, 'height', this.originalStyles.height)
    StyleUtils.setStyle(this.editorRoot, 'zIndex', this.originalStyles.zIndex)
    StyleUtils.setStyle(this.editorRoot, 'background', this.originalStyles.background)
    StyleUtils.removeClass(this.editorRoot, 'rich:overflow-auto')

    this.isFullscreen = false
    this.originalStyles = null
    this.updateButtonIcon()
  }

  private updateButtonIcon(): void {
    if (!this.button) return
    const iconSpan = this.button.querySelector('span')
    if (iconSpan) {
      iconSpan.textContent = this.isFullscreen ? '✕' : '⛶'
    }
    this.button.title = this.isFullscreen ? '退出全屏' : '全屏'
  }

  public destroy(): void {
    if (this.isFullscreen) {
      this.exitFullscreen()
    }
    ShortcutManager.getInstance().unregister(this.shortcutId)
    this.eventManager.cleanupForElement(this.container)
    if (this.container) {
      this.container.innerHTML = ''
    }
    this.button = null
  }
}
