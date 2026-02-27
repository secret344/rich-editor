import { Editor } from '@tiptap/core'
import { EventManager } from '@/utils/EventManager'
import { ButtonUtils, ElementUtils } from '@/core/dom'
import { BaseDropdownPanel } from '@/core/dom/dropdown/BaseDropdownPanel'
import { InputUtils } from '@/core/dom/input/InputUtils'

export class AudioMenu extends BaseDropdownPanel {
  private editor: Editor
  protected eventManager: EventManager
  protected editorRoot: HTMLElement
  private audioButton: HTMLElement | null = null
  private urlInput: HTMLInputElement | null = null

  constructor(
    container: HTMLElement,
    editor: Editor,
    eventManager: EventManager,
    editorRoot: HTMLElement
  ) {
    const audioButton = ButtonUtils.createIconButton({
      icon: '🎵',
      title: '插入音频',
    })

    super(container, {
      triggerButton: audioButton,
      width: 320,
      editorRoot,
      closeOnClickOutside: true,
      closeOnEscape: true,
      className: 'rich:audio-menu',
    })

    this.editor = editor
    this.eventManager = eventManager
    this.editorRoot = editorRoot
    this.audioButton = audioButton

    ElementUtils.appendChild(container, audioButton)
    this.eventManager.addEventListener(audioButton, 'click', (e) => {
      e.stopPropagation()
      this.toggle()
    })
  }

  protected createContent(): void {
    const form = ElementUtils.createDiv({ className: 'rich:p-3 rich:flex rich:flex-col rich:gap-3' })

    const label = ElementUtils.createElement({
      tagName: 'label',
      className: 'rich:text-sm rich:font-medium rich:text-gray-700',
      textContent: '音频地址 (URL)',
    })

    this.urlInput = InputUtils.createTextInput({
      placeholder: 'https://example.com/audio.mp3',
      className: 'rich:w-full rich:border rich:border-gray-300 rich:rounded rich:px-2 rich:py-1 rich:text-sm focus:rich:outline-none focus:rich:ring-2 focus:rich:ring-blue-500',
    })

    const insertBtn = ButtonUtils.createTextButton({
      label: '插入音频',
      className: 'rich:w-full rich:bg-blue-600 rich:text-white hover:rich:bg-blue-700 rich:py-1.5',
    })

    this.eventManager.addEventListener(insertBtn, 'click', () => {
      const src = this.urlInput?.value?.trim()
      if (src) {
        this.editor.chain().focus().setAudio({ src }).run()
        if (this.urlInput) this.urlInput.value = ''
        this.hide()
      }
    })

    ElementUtils.appendChild(form, label)
    ElementUtils.appendChild(form, this.urlInput)
    ElementUtils.appendChild(form, insertBtn)
    ElementUtils.appendChild(this.panel, form)
  }

  public destroy(): void {
    this.eventManager.cleanupForElement(this.audioButton!)
    if (this.audioButton?.parentNode) {
      ElementUtils.remove(this.audioButton)
    }
    super.destroy()
    this.audioButton = null
    this.urlInput = null
  }
}
