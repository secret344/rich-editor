import { Node, mergeAttributes, type CommandProps } from '@tiptap/core'
import { ElementUtils, StyleUtils } from '@/core/dom/utils'
import type { NodeView } from 'prosemirror-view'
import type { NodeViewRenderer } from '@tiptap/core'
import { EventManager } from '@/utils/EventManager'

export interface VideoOptions {
  HTMLAttributes: Record<string, any>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    video: {
      setVideo: (options: { src: string; title?: string; controls?: boolean; width?: number; height?: number }) => ReturnType
    }
  }
}

function VideoNodeView(): NodeViewRenderer {
  return (props): NodeView => {
    const { node } = props
    const eventManager = new EventManager()

    const nodeWrapper = ElementUtils.createDiv({
      className: 'rich:relative rich:flex rich:justify-center rich:max-h-full rich:mx-auto',
      attributes: { 'data-node-view-wrapper': 'true' },
    })

    const wrapper = ElementUtils.createDiv({
      className: 'rich:relative rich:inline-block rich:max-w-full',
      attributes: { 'data-video-wrapper': 'true' },
    })

    ElementUtils.appendChild(nodeWrapper, wrapper)

    const video = ElementUtils.createElement({
      tagName: 'video',
      className: 'rich:w-full rich:h-full rich:rounded-lg',
      attributes: {
        src: node.attrs.src,
        title: node.attrs.title || '',
        controls: node.attrs.controls ? 'true' : '',
      },
    }) as HTMLVideoElement

    if (node.attrs.width) {
      StyleUtils.setStyle(wrapper, 'width', `${node.attrs.width}px`)
    }
    if (node.attrs.height) {
      StyleUtils.setStyle(wrapper, 'height', `${node.attrs.height}px`)
    }

    ElementUtils.appendChild(wrapper, video)

    return {
      dom: nodeWrapper,

      update(newNode) {
        if (newNode.type !== node.type) return false
        StyleUtils.setStyle(nodeWrapper, 'justifyContent', newNode.attrs.nodeAlign)
        if (newNode.attrs.src !== video.src) {
          video.src = newNode.attrs.src
        }
        if (newNode.attrs.width) {
          StyleUtils.setStyle(wrapper, 'width', `${newNode.attrs.width}px`)
        }
        if (newNode.attrs.height) {
          StyleUtils.setStyle(wrapper, 'height', `${newNode.attrs.height}px`)
        }
        return true
      },

      selectNode() {
        StyleUtils.addClass(nodeWrapper, 'ProseMirror-selectednode')
        StyleUtils.setStyle(wrapper, 'outline', '2px solid #3b82f6')
      },

      deselectNode() {
        StyleUtils.removeClass(nodeWrapper, 'ProseMirror-selectednode')
        StyleUtils.setStyle(wrapper, 'outline', '')
      },

      destroy() {
        eventManager.cleanup()
      },
    }
  }
}

export default Node.create<VideoOptions>({
  name: 'video',

  group: 'block',

  atom: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  addAttributes() {
    return {
      src: { default: null },
      title: { default: null },
      controls: { default: true },
      width: { default: null },
      height: { default: null },
      nodeAlign: { default: 'center' },
    }
  },

  parseHTML() {
    return [{ tag: 'video' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['video', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)]
  },

  addNodeView() {
    return VideoNodeView()
  },

  addCommands() {
    return {
      setVideo:
        (options: { src: string; title?: string; controls?: boolean; width?: number; height?: number }) =>
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
