import './styles.css'

// 核心编辑器
export { RichTextEditor } from '@/core/RichTextEditor'
export type {
  RichTextEditorOptions,
  ToolbarOptions,
  ToolbarButton,
  MentionItem,
  MentionOptions,
  SlashCommandItem,
  SlashCommandOptions,
  NotionModeOptions,
  AIOptions,
  AIContext,
  AIActionDefinition,
} from '@/core/RichTextEditor'

// 菜单系统
export { MenuManager } from '@/core/menu/MenuManager'
export * from '@/core/menu/components'

// 扩展
export { createMentionExtension } from '@/core/extensions/mention'
export { createSlashCommandExtension, getDefaultSlashCommands } from '@/core/extensions/slash-command'
export { createNotionModeExtension } from '@/core/extensions/notion-mode'
export { createAIExtension, getDefaultAIActions } from '@/core/extensions/ai'

// AI 服务（基于 LangChain，需安装对应 peer deps）
export { createAIService } from '@/utils/AIService'
export type {
  AIService,
  AIServiceConfig,
  AIProviderConfig,
  OllamaProviderConfig,
  CustomProviderConfig,
} from '@/utils/AIService'

// 工具类
export { EventManager } from '@/utils/EventManager'
export { ShortcutManager } from '@/utils/ShortcutManager'
export type { ShortcutDefinition } from '@/utils/ShortcutManager'

// DOM 操作工具
export * from '@/core/dom'

// 默认导出
export { RichTextEditor as default } from '@/core/RichTextEditor'
