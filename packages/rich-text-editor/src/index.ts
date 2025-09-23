import './styles.css'

// 核心编辑器
export { RichTextEditor } from '@/core/RichTextEditor'
export type { 
  RichTextEditorOptions, 
  ToolbarOptions, 
  ToolbarButton 
} from '@/core/RichTextEditor'

// 菜单系统
export { MenuManager } from '@/core/menu/MenuManager'
export * from '@/core/menu/components'

// 工具类
export { EventManager } from '@/utils/EventManager'

// DOM 操作工具
export * from '@/core/dom'

// 默认导出
export { RichTextEditor as default } from '@/core/RichTextEditor'
