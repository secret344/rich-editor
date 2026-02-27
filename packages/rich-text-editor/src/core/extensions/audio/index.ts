import { Node, mergeAttributes, type CommandProps } from '@tiptap/core'

export interface AudioOptions {
  HTMLAttributes: Record<string, any>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    audio: {
      setAudio: (options: { src: string; title?: string; controls?: boolean }) => ReturnType
    }
  }
}

export default Node.create<AudioOptions>({
  name: 'audio',

  group: 'block',

  atom: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  addAttributes() {
    return {
      src: {
        default: null,
      },
      title: {
        default: null,
      },
      controls: {
        default: true,
      },
      width: {
        default: '100%',
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'audio',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['audio', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)]
  },

  addCommands() {
    return {
      setAudio:
        (options: { src: string; title?: string; controls?: boolean }) =>
        ({ commands, editor }: CommandProps) => {
          return commands.insertContentAt(editor.state.selection.anchor, {
            type: this.name,
            attrs: {
              ...options,
              controls: options.controls !== false,
            },
          })
        },
    }
  },
})
