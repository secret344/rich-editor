/**
 * 通用 AI 服务
 * 基于 LangChain 封装，支持 Ollama 及任意 LangChain 兼容模型。
 * 为 AI 扩展（AIOptions.onAIAction）提供即插即用的实现。
 *
 * 设计原则：
 * - provider 可扩展：OllamaProviderConfig | CustomProviderConfig，未来可追加更多
 * - action → prompt 映射集中在 buildUserPrompt() 中管理，便于定制或覆盖
 * - history 设计已预留：AIServiceConfig 中保留注释字段，链构建处留有 TODO 说明
 *
 * 使用示例（Ollama）：
 * ```ts
 * import { createAIService } from '@my-editor/rich-text-editor'
 *
 * const aiService = createAIService({
 *   providerConfig: { provider: 'ollama', model: 'llama3.2' }
 * })
 *
 * // 直接赋值给 AI 扩展选项
 * const aiOptions = { onAIAction: aiService.execute }
 * ```
 *
 * 使用示例（自定义 LangChain 模型，如 ChatOpenAI）：
 * ```ts
 * import { ChatOpenAI } from '@langchain/openai'
 *
 * const aiService = createAIService({
 *   providerConfig: {
 *     provider: 'custom',
 *     chatModel: new ChatOpenAI({ model: 'gpt-4o-mini', apiKey: 'sk-...' }),
 *   }
 * })
 * ```
 */
import { ChatOllama } from '@langchain/ollama'
import { ChatPromptTemplate } from '@langchain/core/prompts'
import { StringOutputParser } from '@langchain/core/output_parsers'
import type { BaseChatModel } from '@langchain/core/language_models/chat_models'
import type { Runnable } from '@langchain/core/runnables'
import type { AIContext } from '@/core/extensions/ai'

// ─── Provider Configs ─────────────────────────────────────────────────────────

/** Ollama 本地推理服务配置 */
export interface OllamaProviderConfig {
  provider: 'ollama'
  /** 模型名称，例如 'llama3.2'、'qwen2.5'、'mistral' */
  model: string
  /** Ollama 服务地址，默认 'http://localhost:11434' */
  baseUrl?: string
  /** 采样温度 0–1，值越高输出越随机，默认 0.7 */
  temperature?: number
}

/** 自定义 LangChain 模型配置（接受任意 LangChain BaseChatModel 实例） */
export interface CustomProviderConfig {
  provider: 'custom'
  /**
   * 任意兼容 LangChain BaseChatModel 的实例。
   * 常见例子：
   * - `new ChatOpenAI({ model: 'gpt-4o-mini', apiKey: '...' })`
   * - `new ChatAnthropic({ model: 'claude-3-haiku-20240307', apiKey: '...' })`
   * - `new ChatGoogleGenerativeAI({ model: 'gemini-pro', apiKey: '...' })`
   */
  chatModel: BaseChatModel
}

/**
 * AI 提供商配置（可扩展联合类型）。
 * 未来可追加：OpenAIProviderConfig、AnthropicProviderConfig 等命名提供商。
 */
export type AIProviderConfig = OllamaProviderConfig | CustomProviderConfig

// ─── Service Config ────────────────────────────────────────────────────────────

/** AI 服务配置选项 */
export interface AIServiceConfig {
  /** 提供商配置 */
  providerConfig: AIProviderConfig

  /**
   * 全局系统提示词（可选）。
   * 覆盖默认系统提示词，适用于自定义角色或限定输出语言。
   * @default '你是一个专业的文本编辑助手……'
   */
  systemPrompt?: string

  /**
   * 对话历史配置（预留，当前版本不实现）。
   *
   * 未来版本将通过 LangChain 的 RunnableWithMessageHistory 实现多轮对话：
   * ```ts
   * // 示例（future）：
   * // import { RunnableWithMessageHistory } from '@langchain/core/runnables'
   * // import { InMemoryChatMessageHistory } from '@langchain/core/chat_history'
   * //
   * // const chainWithHistory = new RunnableWithMessageHistory({
   * //   runnable: chain,
   * //   getMessageHistory: (sessionId) => getOrCreateHistory(sessionId),
   * //   inputMessagesKey: 'userPrompt',
   * //   historyMessagesKey: 'history',
   * // })
   * ```
   *
   * @future
   */
  // history?: {
  //   enabled: boolean
  //   /** 历史存储实现，默认内存（未来支持 Redis / IndexedDB 等） */
  //   store?: 'memory' | BaseChatMessageHistory
  //   /** 保留的最大历史消息条数（对话轮数 × 2），默认 20 */
  //   maxMessages?: number
  // }
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

const DEFAULT_SYSTEM_PROMPT =
  '你是一个专业的文本编辑助手，帮助用户改善和处理文本内容。' +
  '请直接返回处理后的文本，不要添加额外的解释、前缀或引号。'

/** 根据 providerConfig 构建 LangChain 聊天模型实例 */
function buildChatModel(config: AIProviderConfig): BaseChatModel {
  switch (config.provider) {
    case 'ollama':
      return new ChatOllama({
        model: config.model,
        baseUrl: config.baseUrl ?? 'http://localhost:11434',
        temperature: config.temperature ?? 0.7,
      })
    case 'custom':
      return config.chatModel
    default: {
      const _exhaustive: never = config
      void _exhaustive
      throw new Error('[AIService] Unknown provider')
    }
  }
}

/**
 * 根据 actionId 和编辑器上下文构建用户提示词。
 * 支持内置操作 ID 和 `custom:<instruction>` 格式的自定义指令。
 */
function buildUserPrompt(actionId: string, context: AIContext): string {
  const text = context.selectedText || context.blockText

  if (actionId === 'improve') {
    return `请优化以下文本的写作质量，改善流畅度和表达，保持原有意思不变：\n\n${text}`
  }
  if (actionId === 'fix-grammar') {
    return `请修正以下文本中的语法、拼写和标点错误，不改变文本的意思：\n\n${text}`
  }
  if (actionId === 'summarize') {
    return `请对以下内容进行简洁的摘要，提炼核心观点：\n\n${text}`
  }
  if (actionId === 'expand') {
    return `请扩展并丰富以下文本，添加相关细节、例子或背景信息：\n\n${text}`
  }
  if (actionId === 'translate') {
    return (
      '请将以下文本进行翻译：若为中文则译为英文，若为英文则译为中文，其他语言译为中文。\n\n' + text
    )
  }
  if (actionId === 'continue') {
    const content = context.blockText || context.documentText
    return `请根据以下文本的风格、语气和主题继续写作，自然地延续内容：\n\n${content}`
  }
  if (actionId.startsWith('custom:')) {
    const instruction = actionId.slice(7).trim()
    return text ? `${instruction}\n\n文本内容：\n${text}` : instruction
  }
  // 未识别的操作 ID — 原样透传
  return text
    ? `请对以下文本执行操作「${actionId}」：\n\n${text}`
    : `请执行操作：${actionId}`
}

// ─── Public API ────────────────────────────────────────────────────────────────

/** AI 服务实例，由 createAIService() 返回 */
export interface AIService {
  /**
   * 执行 AI 操作。
   * 与 `AIOptions.onAIAction` 签名完全一致，可直接赋值：
   * ```ts
   * const aiOptions = { onAIAction: aiService.execute }
   * ```
   */
  execute: (actionId: string, context: AIContext) => Promise<string>
}

/**
 * createAIService
 * 创建基于 LangChain 的通用 AI 服务实例。
 *
 * 返回的 `execute` 函数可直接作为 `AIOptions.onAIAction` 使用。
 *
 * @example 使用 Ollama（本地）
 * ```ts
 * const aiService = createAIService({
 *   providerConfig: {
 *     provider: 'ollama',
 *     model: 'llama3.2',          // Ollama 中已拉取的模型
 *     baseUrl: 'http://localhost:11434',
 *   },
 * })
 * const editor = new RichTextEditor(container, {
 *   aiOptions: { onAIAction: aiService.execute },
 * })
 * ```
 *
 * @example 使用 OpenAI（通过自定义模型）
 * ```ts
 * import { ChatOpenAI } from '@langchain/openai'
 *
 * const aiService = createAIService({
 *   providerConfig: {
 *     provider: 'custom',
 *     chatModel: new ChatOpenAI({ model: 'gpt-4o-mini', apiKey: process.env.OPENAI_API_KEY }),
 *   },
 * })
 * ```
 */
export function createAIService(config: AIServiceConfig): AIService {
  const chatModel = buildChatModel(config.providerConfig)
  const systemPrompt = config.systemPrompt ?? DEFAULT_SYSTEM_PROMPT

  // LangChain LCEL chain：prompt → model → output parser
  // 模板变量 {systemPrompt} 和 {userPrompt} 在每次调用时注入。
  //
  // TODO（history）：替换为 RunnableWithMessageHistory 以支持多轮对话：
  // const chainWithHistory = new RunnableWithMessageHistory({
  //   runnable: promptTemplate.pipe(chatModel).pipe(outputParser),
  //   getMessageHistory: (sessionId) => getOrCreateHistory(sessionId),
  //   inputMessagesKey: 'userPrompt',
  //   historyMessagesKey: 'history',
  // })
  const promptTemplate = ChatPromptTemplate.fromMessages([
    ['system', '{systemPrompt}'],
    ['human', '{userPrompt}'],
  ])
  const outputParser = new StringOutputParser()
  // The BaseChatModel is pipe-compatible with ChatPromptTemplate and StringOutputParser.
  // We use Runnable<{ systemPrompt: string; userPrompt: string }, string> to capture
  // the full chain type without resorting to `any`.
  const chain: Runnable<{ systemPrompt: string; userPrompt: string }, string> =
    promptTemplate.pipe(chatModel).pipe(outputParser)

  const execute = async (actionId: string, context: AIContext): Promise<string> => {
    const userPrompt = buildUserPrompt(actionId, context)
    // TODO（history）: 传入 sessionId 给 chainWithHistory.invoke()
    const result = await chain.invoke({ systemPrompt, userPrompt })
    return result.trim()
  }

  return { execute }
}
