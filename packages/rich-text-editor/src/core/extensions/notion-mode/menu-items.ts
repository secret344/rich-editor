/**
 * Notion 模式上下文菜单项定义
 * 包含"转换为"和"块操作"两组菜单项的数据
 */
import type { Editor } from '@tiptap/core'

/** 上下文菜单项 */
export interface ContextMenuItem {
  id: string
  label: string
  icon: string
  action: (editor: Editor, pos: number) => void
}

/** 获取"转换为"菜单项列表 */
export function getTurnIntoItems(): ContextMenuItem[] {
  return [
    {
      id: 'turn-para',
      label: '文本',
      icon: 'T',
      action: (e) => e.chain().focus().setParagraph().run(),
    },
    {
      id: 'turn-h1',
      label: '标题 1',
      icon: 'H1',
      action: (e) => e.chain().focus().setHeading({ level: 1 }).run(),
    },
    {
      id: 'turn-h2',
      label: '标题 2',
      icon: 'H2',
      action: (e) => e.chain().focus().setHeading({ level: 2 }).run(),
    },
    {
      id: 'turn-h3',
      label: '标题 3',
      icon: 'H3',
      action: (e) => e.chain().focus().setHeading({ level: 3 }).run(),
    },
    {
      id: 'turn-bullet',
      label: '无序列表',
      icon: '•',
      action: (e) => e.chain().focus().toggleBulletList().run(),
    },
    {
      id: 'turn-ordered',
      label: '有序列表',
      icon: '1.',
      action: (e) => e.chain().focus().toggleOrderedList().run(),
    },
    {
      id: 'turn-quote',
      label: '引用',
      icon: '❝',
      action: (e) => e.chain().focus().toggleBlockquote().run(),
    },
    {
      id: 'turn-code',
      label: '代码块',
      icon: '</>',
      action: (e) => e.chain().focus().toggleCodeBlock().run(),
    },
  ]
}

/** 获取块操作菜单项列表 */
export function getBlockActionItems(): ContextMenuItem[] {
  return [
    {
      id: 'duplicate',
      label: '复制块',
      icon: '⎘',
      action: (editor, pos) => {
        const { state } = editor
        const $pos = state.doc.resolve(pos + 1)
        if ($pos.depth < 1) return
        const blockPos = $pos.before(1)
        const node = state.doc.nodeAt(blockPos)
        if (!node) return
        const insertPos = blockPos + node.nodeSize
        editor.chain().focus().insertContentAt(insertPos, node.toJSON()).run()
      },
    },
    {
      id: 'delete',
      label: '删除块',
      icon: '✕',
      action: (editor, pos) => {
        const { state } = editor
        const $pos = state.doc.resolve(pos + 1)
        if ($pos.depth < 1) return
        const blockPos = $pos.before(1)
        const node = state.doc.nodeAt(blockPos)
        if (!node) return
        editor
          .chain()
          .focus()
          .deleteRange({ from: blockPos, to: blockPos + node.nodeSize })
          .run()
      },
    },
  ]
}
