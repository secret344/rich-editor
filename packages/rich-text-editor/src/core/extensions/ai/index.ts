/**
 * AI 助手扩展
 * 提供基于 AI 的文本增强功能，经典模式与 Notion 模式统一复用
 *
 * 触发方式：
 * - 选中文本后在选区旁显示浮动"✨ AI"触发按钮
 * - 快捷键 Mod+Shift+A 打开 AI 面板
 * - 在 bubble 菜单中显示 AI 按钮（需将 aiOptions 传入 bubbleMenuOptions）
 * - 在 Notion 上下文菜单中显示"AI 助手"入口（需将 aiOptions 传入 notionModeOptions）
 */
import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { ElementUtils, StyleUtils } from '@/core/dom/utils'
import { EventManager } from '@/utils/EventManager'
import type { Editor } from '@tiptap/core'
import type { EditorView } from '@tiptap/pm/view'

// ─── Public Interfaces ───────────────────────────────────────────────────────

/** AI 操作上下文，传递给 onAIAction 回调 */
export interface AIContext {
  /** 当前选中的文本（无选区时为空字符串） */
  selectedText: string
  /** 光标所在块/段落的完整纯文本 */
  blockText: string
  /** 文档全文（纯文本） */
  documentText: string
  /** 选区起始位置（ProseMirror 文档坐标） */
  from: number
  /** 选区结束位置（ProseMirror 文档坐标） */
  to: number
}

/** AI 操作定义 */
export interface AIActionDefinition {
  /** 操作唯一标识，传给 onAIAction 的第一个参数 */
  id: string
  /** 操作显示名称 */
  label: string
  /** 操作图标（emoji 或短文字） */
  icon: string
  /** 操作描述（用于 title 提示） */
  description?: string
  /**
   * 是否要求存在文本选区才显示该操作
   * 默认 true；设为 false 则在未选中文本时也会显示（如"续写"）
   */
  requiresSelection?: boolean
}

/** AI 扩展配置选项 */
export interface AIOptions {
  /**
   * AI 操作处理回调（必填）
   * @param actionId 操作 ID。内置操作 ID 见 getDefaultAIActions()；
   *                 自定义提示词时格式为 `"custom:<prompt>"`
   * @param context  操作上下文（选中文本、块文本、文档文本、选区位置）
   * @returns        Promise<string> 返回 AI 处理后的文本
   */
  onAIAction: (actionId: string, context: AIContext) => Promise<string>
  /** 追加的自定义操作（追加到默认操作之后） */
  actions?: AIActionDefinition[]
  /** 是否包含内置默认操作（默认 true） */
  includeDefaultActions?: boolean
  /** 自定义提示词输入框占位文本 */
  promptPlaceholder?: string
  /**
   * 是否在文本选区旁显示浮动 AI 触发按钮（默认 true）
   * 若已在 bubble 菜单中集成 AI 按钮，可设为 false 避免重复
   */
  floatingTrigger?: boolean
}

// ─── Default Actions ─────────────────────────────────────────────────────────

/** 获取内置默认 AI 操作列表 */
export function getDefaultAIActions(): AIActionDefinition[] {
  return [
    {
      id: 'improve',
      label: '优化写作',
      icon: '✨',
      description: '改善文章的流畅度与表达',
      requiresSelection: true,
    },
    {
      id: 'fix-grammar',
      label: '修正语法',
      icon: '✓',
      description: '修复语法和拼写错误',
      requiresSelection: true,
    },
    {
      id: 'summarize',
      label: '总结归纳',
      icon: '📝',
      description: '对选中内容进行摘要',
      requiresSelection: true,
    },
    {
      id: 'expand',
      label: '扩展内容',
      icon: '↗',
      description: '扩展并丰富选中内容',
      requiresSelection: true,
    },
    {
      id: 'translate',
      label: '翻译',
      icon: '🌐',
      description: '将选中内容翻译为中文或英文',
      requiresSelection: true,
    },
    {
      id: 'continue',
      label: '续写',
      icon: '→',
      description: '在光标位置继续写作',
      requiresSelection: false,
    },
  ]
}

// ─── WeakMap: editor → panel view ─────────────────────────────────────────────

/** 存储每个 Editor 实例对应的 AIPanelView，用于跨扩展调用 openAIPanel 命令 */
const aiPanelViews = new WeakMap<Editor, AIPanelView>()

// ─── AIPanelView ─────────────────────────────────────────────────────────────

const AI_PANEL_KEY = new PluginKey('aiPanel')

/** 与选区位置边界间距（px） */
const BOUNDARY_PADDING = 6

/**
 * AIPanelView
 * 管理 AI 触发按钮与 AI 面板的完整 DOM 生命周期
 */
class AIPanelView {
  private editor: Editor
  private options: AIOptions
  private actions: AIActionDefinition[]

  /** 持久化事件管理器：触发按钮及 mousedown 追踪 */
  private eventManager: EventManager = new EventManager()
  /** 面板级事件管理器：每次打开重建，关闭时清理 */
  private panelEventManager: EventManager = new EventManager()

  /** 浮动触发按钮 */
  private triggerEl!: HTMLElement

  /** AI 面板容器 */
  private panelEl: HTMLElement | null = null
  /** 结果区域 */
  private resultAreaEl: HTMLElement | null = null
  /** 自定义提示词输入框 */
  private promptInputEl: HTMLInputElement | null = null

  /** 当前面板是否已打开 */
  private isOpen = false
  /** 是否正在等待 AI 响应 */
  private isLoading = false
  /** 拖拽/选文期间抑制触发按钮 */
  private isMouseDown = false

  /** 打开面板时保存的选区起始位置 */
  private savedFrom = 0
  /** 打开面板时保存的选区结束位置 */
  private savedTo = 0

  constructor(_view: EditorView, editor: Editor, options: AIOptions) {
    this.editor = editor
    this.options = options
    this.actions = [
      ...(options.includeDefaultActions !== false ? getDefaultAIActions() : []),
      ...(options.actions ?? []),
    ]
    this.buildTrigger()
    this.bindPersistentEvents()
  }

  // ─── Trigger Button ────────────────────────────────────────────────────────

  private buildTrigger(): void {
    this.triggerEl = ElementUtils.createElement({
      tagName: 'button',
      className: 'rich-ai-trigger',
      textContent: '✨ AI',
      attributes: { title: '打开 AI 助手 (Mod+Shift+A)', type: 'button' },
    })
    StyleUtils.setStyles(this.triggerEl, {
      position: 'fixed',
      display: 'none',
      zIndex: '101',
    })
    document.body.appendChild(this.triggerEl)
  }

  private bindPersistentEvents(): void {
    this.eventManager.addEventListener(document, 'mousedown', () => {
      this.isMouseDown = true
    })
    this.eventManager.addEventListener(document, 'mouseup', () => {
      this.isMouseDown = false
    })
    // Prevent the trigger button click from removing the selection
    this.eventManager.addEventListener(this.triggerEl, 'mousedown', (e) => {
      e.preventDefault()
      e.stopPropagation()
    })
    this.eventManager.addEventListener(this.triggerEl, 'click', () => {
      this.openPanel()
    })
  }

  // ─── Panel Construction ────────────────────────────────────────────────────

  /** 打开 AI 面板（幂等：若已打开则关闭后重开） */
  openPanel(): void {
    if (this.isOpen) {
      this.closePanel()
      return
    }
    this.isOpen = true
    this.isLoading = false

    // Snapshot selection at panel-open time
    const { from, to } = this.editor.state.selection
    this.savedFrom = from
    this.savedTo = to

    this.buildPanel()
  }

  /** 关闭并清理 AI 面板 */
  closePanel(): void {
    this.isOpen = false
    this.isLoading = false
    this.panelEventManager.cleanup()
    if (this.panelEl) {
      this.panelEl.parentNode?.removeChild(this.panelEl)
      this.panelEl = null
      this.resultAreaEl = null
      this.promptInputEl = null
    }
  }

  private buildPanel(): void {
    this.panelEventManager.cleanup()

    const hasSelection = this.savedFrom !== this.savedTo

    // ── Container ──────────────────────────────────────────────────────────
    this.panelEl = ElementUtils.createDiv({ className: 'rich-ai-panel' })
    StyleUtils.setStyles(this.panelEl, { position: 'fixed', zIndex: '200' })

    // ── Header ─────────────────────────────────────────────────────────────
    const header = ElementUtils.createDiv({ className: 'rich-ai-panel__header' })
    const title = ElementUtils.createElement({
      tagName: 'span',
      className: 'rich-ai-panel__title',
      textContent: '✨ AI 助手',
    })
    const closeBtn = ElementUtils.createElement({
      tagName: 'button',
      className: 'rich-ai-panel__close',
      textContent: '×',
      attributes: { title: '关闭', type: 'button' },
    })
    this.panelEventManager.addEventListener(closeBtn, 'click', () => this.closePanel())
    ElementUtils.appendChild(header, title)
    ElementUtils.appendChild(header, closeBtn)
    ElementUtils.appendChild(this.panelEl, header)

    // ── Selection hint ─────────────────────────────────────────────────────
    if (hasSelection) {
      const selectedText = this.editor.state.doc.textBetween(
        this.savedFrom,
        this.savedTo,
        ' '
      )
      const hint = ElementUtils.createDiv({ className: 'rich-ai-panel__hint' })
      hint.textContent = `"${selectedText.slice(0, 80)}${selectedText.length > 80 ? '…' : ''}"`
      ElementUtils.appendChild(this.panelEl, hint)
    }

    // ── Action buttons ─────────────────────────────────────────────────────
    const actionsGrid = ElementUtils.createDiv({ className: 'rich-ai-panel__actions' })
    this.actions.forEach((action) => {
      if (action.requiresSelection !== false && !hasSelection) return
      const btn = ElementUtils.createElement({
        tagName: 'button',
        className: 'rich-ai-action-btn',
        attributes: { title: action.description ?? action.label, type: 'button' },
      })
      const iconEl = ElementUtils.createElement({
        tagName: 'span',
        className: 'rich-ai-action-btn__icon',
        textContent: action.icon,
      })
      const labelEl = ElementUtils.createElement({
        tagName: 'span',
        className: 'rich-ai-action-btn__label',
        textContent: action.label,
      })
      ElementUtils.appendChild(btn, iconEl)
      ElementUtils.appendChild(btn, labelEl)
      this.panelEventManager.addEventListener(btn, 'click', () => {
        this.executeAction(action.id)
      })
      ElementUtils.appendChild(actionsGrid, btn)
    })
    ElementUtils.appendChild(this.panelEl, actionsGrid)

    // ── Custom prompt row ──────────────────────────────────────────────────
    const promptRow = ElementUtils.createDiv({ className: 'rich-ai-panel__prompt-row' })
    this.promptInputEl = ElementUtils.createElement({
      tagName: 'input',
      className: 'rich-ai-panel__prompt-input',
      attributes: {
        type: 'text',
        placeholder: this.options.promptPlaceholder ?? '输入自定义 AI 指令…',
      },
    }) as HTMLInputElement
    const sendBtn = ElementUtils.createElement({
      tagName: 'button',
      className: 'rich-ai-panel__send-btn',
      textContent: '发送',
      attributes: { title: '发送自定义指令', type: 'button' },
    })
    const runCustomPrompt = () => {
      const prompt = this.promptInputEl?.value.trim()
      if (prompt) this.executeAction(`custom:${prompt}`)
    }
    this.panelEventManager.addEventListener(sendBtn, 'click', runCustomPrompt)
    this.panelEventManager.addEventListener(this.promptInputEl, 'keydown', (e) => {
      if ((e as KeyboardEvent).key === 'Enter') runCustomPrompt()
    })
    ElementUtils.appendChild(promptRow, this.promptInputEl)
    ElementUtils.appendChild(promptRow, sendBtn)
    ElementUtils.appendChild(this.panelEl, promptRow)

    // ── Result area (hidden until AI responds) ─────────────────────────────
    this.resultAreaEl = ElementUtils.createDiv({ className: 'rich-ai-panel__result' })
    StyleUtils.hide(this.resultAreaEl)
    ElementUtils.appendChild(this.panelEl, this.resultAreaEl)

    document.body.appendChild(this.panelEl)
    this.positionPanel()

    // Close when clicking outside (deferred to skip the current click)
    setTimeout(() => {
      this.panelEventManager.addClickOutsideListener(
        this.panelEl!,
        () => this.closePanel(),
        [this.triggerEl]
      )
    }, 0)
  }

  private positionPanel(): void {
    if (!this.panelEl) return
    const view = this.editor.view
    const coords = view.coordsAtPos(this.savedFrom)
    const panelRect = this.panelEl.getBoundingClientRect()

    let left = coords.left
    let top = coords.top - panelRect.height - 8

    // If not enough space above, place below
    if (top < BOUNDARY_PADDING) top = coords.bottom + 8

    // Clamp horizontally
    if (left + panelRect.width > window.innerWidth - BOUNDARY_PADDING) {
      left = window.innerWidth - panelRect.width - BOUNDARY_PADDING
    }
    if (left < BOUNDARY_PADDING) left = BOUNDARY_PADDING

    StyleUtils.setStyles(this.panelEl, { left: `${left}px`, top: `${top}px` })
  }

  // ─── AI Action Execution ──────────────────────────────────────────────────

  private async executeAction(actionId: string): Promise<void> {
    if (this.isLoading) return
    this.isLoading = true

    // Build context from snapshotted selection
    const selectedText =
      this.savedFrom !== this.savedTo
        ? this.editor.state.doc.textBetween(this.savedFrom, this.savedTo, ' ')
        : ''

    let blockText = ''
    try {
      const $from = this.editor.state.doc.resolve(this.savedFrom)
      blockText = this.editor.state.doc.textBetween($from.start(), $from.end(), ' ')
    } catch { /* ignore if out of bounds */ }

    const context: AIContext = {
      selectedText,
      blockText,
      documentText: this.editor.getText(),
      from: this.savedFrom,
      to: this.savedTo,
    }

    this.showLoading()

    try {
      const result = await this.options.onAIAction(actionId, context)
      this.showResult(result)
    } catch (err) {
      this.showError(err instanceof Error ? err.message : 'AI 处理失败，请重试')
    } finally {
      this.isLoading = false
    }
  }

  // ─── Result States ─────────────────────────────────────────────────────────

  private showLoading(): void {
    if (!this.resultAreaEl) return
    StyleUtils.show(this.resultAreaEl)
    this.resultAreaEl.innerHTML =
      '<div class="rich-ai-loading"><span class="rich-ai-spinner"></span><span>AI 正在处理…</span></div>'
  }

  private showResult(result: string): void {
    if (!this.resultAreaEl) return
    StyleUtils.show(this.resultAreaEl)
    ElementUtils.empty(this.resultAreaEl)

    const resultText = ElementUtils.createDiv({ className: 'rich-ai-result__text' })
    resultText.textContent = result
    ElementUtils.appendChild(this.resultAreaEl, resultText)

    const actionsRow = ElementUtils.createDiv({ className: 'rich-ai-result__actions' })

    const replaceBtn = ElementUtils.createElement({
      tagName: 'button',
      className: 'rich-ai-result__btn rich-ai-result__btn--primary',
      textContent: this.savedFrom !== this.savedTo ? '替换选中内容' : '插入内容',
      attributes: { type: 'button' },
    })
    this.panelEventManager.addEventListener(replaceBtn, 'click', () =>
      this.applyResult(result, false)
    )

    const insertAfterBtn = ElementUtils.createElement({
      tagName: 'button',
      className: 'rich-ai-result__btn rich-ai-result__btn--secondary',
      textContent: '在段落末尾插入',
      attributes: { type: 'button' },
    })
    this.panelEventManager.addEventListener(insertAfterBtn, 'click', () =>
      this.applyResult(result, true)
    )

    const cancelBtn = ElementUtils.createElement({
      tagName: 'button',
      className: 'rich-ai-result__btn rich-ai-result__btn--ghost',
      textContent: '取消',
      attributes: { type: 'button' },
    })
    this.panelEventManager.addEventListener(cancelBtn, 'click', () => this.closePanel())

    ElementUtils.appendChild(actionsRow, replaceBtn)
    ElementUtils.appendChild(actionsRow, insertAfterBtn)
    ElementUtils.appendChild(actionsRow, cancelBtn)
    ElementUtils.appendChild(this.resultAreaEl, actionsRow)
  }

  private showError(message: string): void {
    if (!this.resultAreaEl) return
    StyleUtils.show(this.resultAreaEl)
    this.resultAreaEl.innerHTML = `<div class="rich-ai-error">${message}</div>`
  }

  // ─── Apply Result ──────────────────────────────────────────────────────────

  private applyResult(result: string, insertAtBlockEnd: boolean): void {
    if (insertAtBlockEnd) {
      try {
        const $pos = this.editor.state.doc.resolve(this.savedTo)
        const blockEnd = $pos.end()
        this.editor.chain().focus().insertContentAt(blockEnd, result).run()
      } catch {
        this.editor.chain().focus().insertContentAt(this.savedTo, result).run()
      }
    } else if (this.savedFrom !== this.savedTo) {
      this.editor
        .chain()
        .focus()
        .deleteRange({ from: this.savedFrom, to: this.savedTo })
        .insertContentAt(this.savedFrom, result)
        .run()
    } else {
      this.editor.chain().focus().insertContentAt(this.savedFrom, result).run()
    }
    this.closePanel()
  }

  // ─── ProseMirror View Lifecycle ────────────────────────────────────────────

  /** 每次编辑器状态更新时调用，用于定位浮动触发按钮 */
  update(view: EditorView): void {
    // Hide trigger if floating trigger is disabled
    if (this.options.floatingTrigger === false) {
      StyleUtils.hide(this.triggerEl)
      return
    }

    const { selection } = view.state
    const { empty, from, to } = selection

    // Suppress during mouse drag or while panel is open
    if (empty || this.isMouseDown || this.isOpen) {
      StyleUtils.hide(this.triggerEl)
      return
    }

    StyleUtils.show(this.triggerEl, 'inline-flex')

    const endCoords = view.coordsAtPos(to)
    const startCoords = view.coordsAtPos(from)
    const triggerRect = this.triggerEl.getBoundingClientRect()

    // Position to the right of the selection end, vertically centred on the first line
    let left = endCoords.right + 6
    let top = startCoords.top + (startCoords.bottom - startCoords.top) / 2 - triggerRect.height / 2

    // Clamp to viewport
    if (left + triggerRect.width > window.innerWidth - BOUNDARY_PADDING) {
      left = startCoords.left - triggerRect.width - 6
    }
    if (top < BOUNDARY_PADDING) top = BOUNDARY_PADDING

    StyleUtils.setStyles(this.triggerEl, { left: `${left}px`, top: `${top}px` })
  }

  destroy(): void {
    this.closePanel()
    if (this.triggerEl.parentNode) {
      this.triggerEl.parentNode.removeChild(this.triggerEl)
    }
    this.eventManager.cleanup()
  }
}

// ─── Tiptap Command Type Augmentation ────────────────────────────────────────

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    aiPanel: {
      /** 打开 AI 助手面板 */
      openAIPanel: () => ReturnType
      /** 关闭 AI 助手面板 */
      closeAIPanel: () => ReturnType
    }
  }
}

// ─── Extension Factory ────────────────────────────────────────────────────────

/**
 * 创建 AI 助手扩展
 * 适用于经典模式（toolbar + bubble 菜单）和 Notion 模式（浮动左侧菜单 + 上下文菜单）
 *
 * @example
 * ```ts
 * createAIExtension({
 *   onAIAction: async (actionId, ctx) => {
 *     const res = await callMyAI(actionId, ctx.selectedText)
 *     return res.text
 *   }
 * })
 * ```
 */
export function createAIExtension(options: AIOptions) {
  return Extension.create({
    name: 'aiPanel',

    addKeyboardShortcuts() {
      return {
        'Mod-Shift-a': () => this.editor.commands.openAIPanel(),
      }
    },

    addCommands() {
      return {
        openAIPanel:
          () =>
          ({ editor }) => {
            aiPanelViews.get(editor)?.openPanel()
            return true
          },
        closeAIPanel:
          () =>
          ({ editor }) => {
            aiPanelViews.get(editor)?.closePanel()
            return true
          },
      }
    },

    addProseMirrorPlugins() {
      const editor = this.editor

      return [
        new Plugin({
          key: AI_PANEL_KEY,
          view(editorView) {
            const panelView = new AIPanelView(editorView, editor, options)
            aiPanelViews.set(editor, panelView)
            return {
              update(view) {
                panelView.update(view)
              },
              destroy() {
                panelView.destroy()
                aiPanelViews.delete(editor)
              },
            }
          },
        }),
      ]
    },
  })
}
