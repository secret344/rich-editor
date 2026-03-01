/**
 * 通用 AI 服务
 * 基于 LangChain 封装，支持 Ollama、OpenAI、Anthropic、Google AI 及任意 LangChain 兼容模型。
 * 为 AI 扩展（AIOptions.onAIAction）提供即插即用的实现。
 *
 * 设计原则：
 * - provider 可扩展联合类型：每个命名 provider 声明完整参数集
 * - action → prompt 映射集中在 buildUserPrompt() 中管理，可通过 promptTemplates 覆盖
 * - 链采用懒初始化，buildChatModel 为 async（支持动态导入可选 provider 包）
 * - history 设计已预留：AIServiceConfig 中保留注释字段，链构建处留有 TODO 说明
 *
 * Provider 安装说明：
 * - Ollama：         npm install @langchain/ollama       （已在 peerDeps）
 * - OpenAI：         npm install @langchain/openai
 * - Anthropic：      npm install @langchain/anthropic
 * - Google AI：      npm install @langchain/google-genai
 * - 其他模型：       provider: 'custom'，传入任意 BaseChatModel 实例
 */
import { ChatOllama } from '@langchain/ollama'
import { ChatPromptTemplate } from '@langchain/core/prompts'
import { StringOutputParser } from '@langchain/core/output_parsers'
import type { BaseChatModel } from '@langchain/core/language_models/chat_models'
import type { Runnable } from '@langchain/core/runnables'
import type { AIContext } from '@/core/extensions/ai'

// ─── Provider Configs ─────────────────────────────────────────────────────────

/** Ollama 本地推理服务配置（需安装 @langchain/ollama） */
export interface OllamaProviderConfig {
  provider: 'ollama'
  /** 模型名称，例如 'llama3.2'、'qwen2.5'、'mistral'、'deepseek-r1' */
  model: string
  /** Ollama 服务地址，默认 'http://localhost:11434' */
  baseUrl?: string
  /** 采样温度 0–2，值越高输出越随机，默认 0.7 */
  temperature?: number
  /** 最大生成 token 数（映射到 Ollama num_predict） */
  maxTokens?: number
  /** Top-P 核采样 0–1，与 temperature 配合使用 */
  topP?: number
  /** Top-K 候选词数量（Ollama 特有），值越小越保守 */
  topK?: number
  /** 重复惩罚因子（Ollama repeat_penalty），>1 降低重复，默认 1.1 */
  repeatPenalty?: number
  /** 上下文窗口大小（token 数），0 = 模型默认 */
  numCtx?: number
  /** GPU 层数（-1 = 全部 offload 到 GPU），仅本地 Ollama 有效 */
  numGpu?: number
  /** 随机种子，相同种子可复现输出，0 = 随机 */
  seed?: number
  /** 停止序列，遇到时截断输出 */
  stop?: string[]
  /**
   * 模型在内存中保留时间。
   * - '5m' 表示 5 分钟（默认）
   * - '0' 立即卸载
   * - '-1' 永久保留
   */
  keepAlive?: string
  /** 强制 JSON 格式输出（需模型支持） */
  format?: 'json'
}

/**
 * OpenAI / OpenAI 兼容 API 配置（需安装 @langchain/openai）。
 *
 * 通过设置 `baseURL` 可对接任意 OpenAI 兼容服务：
 * - Azure OpenAI：设置 `baseURL` 和 `apiKey`
 * - LM Studio：`baseURL: 'http://localhost:1234/v1'`
 * - Groq：`baseURL: 'https://api.groq.com/openai/v1'`
 * - DeepSeek：`baseURL: 'https://api.deepseek.com/v1'`
 */
export interface OpenAIProviderConfig {
  provider: 'openai'
  /** 模型名称，例如 'gpt-4o'、'gpt-4o-mini'、'o1-mini' */
  model: string
  /** API Key，默认读取 OPENAI_API_KEY 环境变量 */
  apiKey?: string
  /** 自定义 API 地址（用于代理或兼容服务） */
  baseURL?: string
  /** 采样温度 0–2，默认 0.7 */
  temperature?: number
  /** 最大输出 token 数 */
  maxTokens?: number
  /** Top-P 核采样 0–1 */
  topP?: number
  /** 频率惩罚 -2–2，降低重复词汇 */
  frequencyPenalty?: number
  /** 存在惩罚 -2–2，鼓励引入新话题 */
  presencePenalty?: number
  /** 随机种子，用于复现输出 */
  seed?: number
  /** 停止序列（最多 4 个） */
  stop?: string | string[]
  /** OpenAI 组织 ID */
  organization?: string
  /** 响应格式，'json_object' 强制 JSON 输出（需在 prompt 中说明） */
  responseFormat?: { type: 'text' | 'json_object' }
}

/**
 * Anthropic Claude 配置（需安装 @langchain/anthropic）。
 *
 * 支持模型：claude-3-5-sonnet-latest、claude-3-5-haiku-latest、
 *           claude-3-opus-latest 等。
 */
export interface AnthropicProviderConfig {
  provider: 'anthropic'
  /** 模型名称，例如 'claude-3-5-sonnet-latest'、'claude-3-haiku-20240307' */
  model: string
  /** API Key，默认读取 ANTHROPIC_API_KEY 环境变量 */
  apiKey?: string
  /** 采样温度 0–1，默认 0.7 */
  temperature?: number
  /**
   * 最大输出 token 数。
   * Anthropic API 要求此字段必填；`createAIService` 在未设置时自动填充 **1024** 作为保底值。
   * 如需更长输出请显式设置。
   */
  maxTokens?: number
  /** Top-P 核采样 0–1 */
  topP?: number
  /** Top-K 候选词数（Anthropic 特有） */
  topK?: number
  /** 停止序列 */
  stop?: string[]
}

/**
 * Google Generative AI 配置（需安装 @langchain/google-genai）。
 *
 * 支持模型：gemini-2.0-flash、gemini-1.5-pro、gemini-1.5-flash 等。
 */
export interface GoogleAIProviderConfig {
  provider: 'google'
  /** 模型名称，例如 'gemini-2.0-flash'、'gemini-1.5-pro' */
  model: string
  /** API Key，默认读取 GOOGLE_API_KEY 环境变量 */
  apiKey?: string
  /** 采样温度 0–2，默认 0.7 */
  temperature?: number
  /** 最大输出 token 数 */
  maxOutputTokens?: number
  /** Top-P 核采样 0–1 */
  topP?: number
  /** Top-K 候选词数 */
  topK?: number
  /** 停止序列 */
  stopSequences?: string[]
}

/**
 * 自定义 LangChain 模型配置（接受任意 LangChain BaseChatModel 实例）。
 *
 * 适用于上述命名 provider 不满足需求的场景（如 AWS Bedrock、Azure AI Foundry 等）。
 * @example
 * ```ts
 * import { BedrockChat } from '@langchain/community/chat_models/bedrock'
 * createAIService({ providerConfig: { provider: 'custom', chatModel: new BedrockChat({...}) } })
 * ```
 */
export interface CustomProviderConfig {
  provider: 'custom'
  /** 任意兼容 LangChain BaseChatModel 的实例 */
  chatModel: BaseChatModel
}

/**
 * AI 提供商配置（可扩展联合类型）。
 * 各 provider 需安装对应 @langchain/* 包，详见各接口文档注释。
 */
export type AIProviderConfig =
  | OllamaProviderConfig
  | OpenAIProviderConfig
  | AnthropicProviderConfig
  | GoogleAIProviderConfig
  | CustomProviderConfig

// ─── Service Config ────────────────────────────────────────────────────────────

/**
 * 内置操作 ID 枚举（供 promptTemplates 类型提示使用）。
 * 自定义操作的 ID 为任意字符串；`custom:*` 格式保留给面板输入框。
 */
export type BuiltInActionId =
  | 'improve'
  | 'fix-grammar'
  | 'summarize'
  | 'expand'
  | 'translate'
  | 'continue'

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
   * 每个操作的自定义提示词模板（可选）。
   *
   * Key 为操作 ID（内置 ID 见 BuiltInActionId，或自定义 action 的 id）。
   * Value 为提示词模板字符串，支持以下插值变量：
   * - `{{text}}`     → 选中文本或块文本
   * - `{{selected}}` → 仅选中文本（可能为空）
   * - `{{block}}`    → 光标所在块的全文
   * - `{{document}}` → 文档全文
   *
   * @example
   * ```ts
   * promptTemplates: {
   *   'translate': '请将以下文本翻译成日文：\n\n{{text}}',
   *   'improve': 'Improve the following text for a technical audience:\n\n{{text}}',
   * }
   * ```
   */
  promptTemplates?: Partial<Record<BuiltInActionId | string, string>>

  /**
   * 对话历史配置（预留，当前版本不实现）。
   *
   * 未来版本将通过 LangChain 的 RunnableWithMessageHistory 实现多轮对话：
   * ```ts
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
   * @future
   */
  // history?: {
  //   enabled: boolean
  //   store?: 'memory' | BaseChatMessageHistory
  //   maxMessages?: number
  // }
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

const DEFAULT_SYSTEM_PROMPT =
  '你是一个专业的文本编辑助手，帮助用户改善和处理文本内容。' +
  '请直接返回处理后的文本，不要添加额外的解释、前缀或引号。'

/**
 * 根据 providerConfig 异步构建 LangChain 聊天模型实例。
 * 命名 provider（openai / anthropic / google）使用动态导入，
 * 避免将未安装的可选包打包进 bundle。
 */
async function buildChatModel(config: AIProviderConfig): Promise<BaseChatModel> {
  switch (config.provider) {
    case 'ollama':
      return new ChatOllama({
        model: config.model,
        baseUrl: config.baseUrl ?? 'http://localhost:11434',
        temperature: config.temperature ?? 0.7,
        ...(config.maxTokens !== undefined && { numPredict: config.maxTokens }),
        ...(config.topP !== undefined && { topP: config.topP }),
        ...(config.topK !== undefined && { topK: config.topK }),
        ...(config.repeatPenalty !== undefined && { repeatPenalty: config.repeatPenalty }),
        ...(config.numCtx !== undefined && { numCtx: config.numCtx }),
        ...(config.numGpu !== undefined && { numGpu: config.numGpu }),
        ...(config.seed !== undefined && { seed: config.seed }),
        ...(config.stop !== undefined && { stop: config.stop }),
        ...(config.keepAlive !== undefined && { keepAlive: config.keepAlive }),
        ...(config.format !== undefined && { format: config.format }),
      })

    case 'openai': {
      // Dynamic import: requires `npm install @langchain/openai`
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore – optional peer dep; will fail clearly at runtime if not installed
      const { ChatOpenAI } = await import(/* @vite-ignore */ '@langchain/openai').catch(() => {
        throw new Error(
          '[AIService] @langchain/openai is required for the "openai" provider. ' +
          'Install it with: npm install @langchain/openai'
        )
      })
      return new ChatOpenAI({
        model: config.model,
        ...(config.apiKey && { apiKey: config.apiKey }),
        ...(config.baseURL && { configuration: { baseURL: config.baseURL } }),
        ...(config.temperature !== undefined && { temperature: config.temperature }),
        ...(config.maxTokens !== undefined && { maxTokens: config.maxTokens }),
        ...(config.topP !== undefined && { topP: config.topP }),
        ...(config.frequencyPenalty !== undefined && { frequencyPenalty: config.frequencyPenalty }),
        ...(config.presencePenalty !== undefined && { presencePenalty: config.presencePenalty }),
        ...(config.seed !== undefined && { seed: config.seed }),
        // OpenAI expects string[], coerce single string to array
        ...(config.stop !== undefined && {
          stop: Array.isArray(config.stop) ? config.stop : [config.stop],
        }),
        ...(config.organization && { organization: config.organization }),
        ...(config.responseFormat && { responseFormat: config.responseFormat }),
      // `as unknown as BaseChatModel`: the concrete LangChain provider class satisfies
      // BaseChatModel at runtime, but TypeScript cannot verify the structural match
      // after a `@ts-ignore`-d dynamic import (which returns `any`). The cast is safe
      // because all named providers extend BaseChatModel in the LangChain hierarchy.
      }) as unknown as BaseChatModel
    }

    case 'anthropic': {
      // Dynamic import: requires `npm install @langchain/anthropic`
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore – optional peer dep; will fail clearly at runtime if not installed
      const { ChatAnthropic } = await import(/* @vite-ignore */ '@langchain/anthropic').catch(() => {
        throw new Error(
          '[AIService] @langchain/anthropic is required for the "anthropic" provider. ' +
          'Install it with: npm install @langchain/anthropic'
        )
      })
      return new ChatAnthropic({
        model: config.model,
        ...(config.apiKey && { apiKey: config.apiKey }),
        ...(config.temperature !== undefined && { temperature: config.temperature }),
        maxTokens: config.maxTokens ?? 1024,
        ...(config.topP !== undefined && { topP: config.topP }),
        ...(config.topK !== undefined && { topK: config.topK }),
        ...(config.stop !== undefined && { stopSequences: config.stop }),
      }) as unknown as BaseChatModel
    }

    case 'google': {
      // Dynamic import: requires `npm install @langchain/google-genai`
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore – optional peer dep; will fail clearly at runtime if not installed
      const { ChatGoogleGenerativeAI } = await import(/* @vite-ignore */ '@langchain/google-genai').catch(() => {
        throw new Error(
          '[AIService] @langchain/google-genai is required for the "google" provider. ' +
          'Install it with: npm install @langchain/google-genai'
        )
      })
      return new ChatGoogleGenerativeAI({
        model: config.model,
        ...(config.apiKey && { apiKey: config.apiKey }),
        ...(config.temperature !== undefined && { temperature: config.temperature }),
        ...(config.maxOutputTokens !== undefined && { maxOutputTokens: config.maxOutputTokens }),
        ...(config.topP !== undefined && { topP: config.topP }),
        ...(config.topK !== undefined && { topK: config.topK }),
        ...(config.stopSequences !== undefined && { stopSequences: config.stopSequences }),
      }) as unknown as BaseChatModel
    }

    case 'custom':
      return config.chatModel

    default: {
      const _exhaustive: never = config
      void _exhaustive
      throw new Error('[AIService] Unknown provider')
    }
  }
}

/** 将模板字符串中的插值变量替换为上下文值 */
function applyTemplate(template: string, context: AIContext): string {
  const text = context.selectedText || context.blockText
  return template
    .replace(/\{\{text\}\}/g, text)
    .replace(/\{\{selected\}\}/g, context.selectedText)
    .replace(/\{\{block\}\}/g, context.blockText)
    .replace(/\{\{document\}\}/g, context.documentText)
}

/**
 * 根据 actionId 和编辑器上下文构建用户提示词。
 * 优先使用 promptTemplates 中的自定义模板；否则使用内置提示词。
 */
function buildUserPrompt(
  actionId: string,
  context: AIContext,
  promptTemplates?: AIServiceConfig['promptTemplates']
): string {
  // 自定义模板优先
  if (promptTemplates?.[actionId]) {
    return applyTemplate(promptTemplates[actionId]!, context)
  }

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
 * 链采用懒初始化：首次调用 `execute` 时异步构建模型，后续复用。
 *
 * @example Ollama（本地）
 * ```ts
 * const aiService = createAIService({
 *   providerConfig: { provider: 'ollama', model: 'llama3.2', numCtx: 4096 },
 * })
 * ```
 *
 * @example OpenAI
 * ```ts
 * // npm install @langchain/openai
 * const aiService = createAIService({
 *   providerConfig: { provider: 'openai', model: 'gpt-4o-mini', apiKey: '...' },
 * })
 * ```
 *
 * @example Anthropic
 * ```ts
 * // npm install @langchain/anthropic
 * const aiService = createAIService({
 *   providerConfig: { provider: 'anthropic', model: 'claude-3-5-haiku-latest', maxTokens: 2048 },
 * })
 * ```
 *
 * @example Google AI
 * ```ts
 * // npm install @langchain/google-genai
 * const aiService = createAIService({
 *   providerConfig: { provider: 'google', model: 'gemini-2.0-flash' },
 * })
 * ```
 *
 * @example 自定义提示词模板
 * ```ts
 * const aiService = createAIService({
 *   providerConfig: { provider: 'ollama', model: 'llama3.2' },
 *   promptTemplates: {
 *     translate: '请将以下文本翻译成日文：\n\n{{text}}',
 *   },
 * })
 * ```
 */
export function createAIService(config: AIServiceConfig): AIService {
  const systemPrompt = config.systemPrompt ?? DEFAULT_SYSTEM_PROMPT

  // 懒初始化：chain 在首次 execute() 调用时构建，避免阻塞 createAIService 返回。
  // TODO（history）：替换为 RunnableWithMessageHistory 以支持多轮对话。
  let chainPromise: Promise<Runnable<{ systemPrompt: string; userPrompt: string }, string>> | null =
    null

  const getChain = () => {
    if (!chainPromise) {
      chainPromise = buildChatModel(config.providerConfig).then((chatModel) => {
        const promptTemplate = ChatPromptTemplate.fromMessages([
          ['system', '{systemPrompt}'],
          ['human', '{userPrompt}'],
        ])
        const outputParser = new StringOutputParser()
        return promptTemplate
          .pipe(chatModel)
          .pipe(outputParser) as Runnable<{ systemPrompt: string; userPrompt: string }, string>
      })
    }
    return chainPromise
  }

  const execute = async (actionId: string, context: AIContext): Promise<string> => {
    const chain = await getChain()
    const userPrompt = buildUserPrompt(actionId, context, config.promptTemplates)
    // TODO（history）: 传入 sessionId 给 chainWithHistory.invoke()
    const result = await chain.invoke({ systemPrompt, userPrompt })
    return result.trim()
  }

  return { execute }
}
