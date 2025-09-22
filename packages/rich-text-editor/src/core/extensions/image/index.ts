import { nodeInputRule, nodePasteRule } from "@tiptap/core";
import Image from "@tiptap/extension-image";
import NodeView from "./node-view";

export interface ResizableImageOptions {
  inline: boolean;
  allowBase64: boolean;
  HTMLAttributes: Record<string, any>;
}

export default Image.extend<ResizableImageOptions>({
  atom: true,

  addOptions() {
    return {
      ...this.parent?.(),
      inline: false,
      allowBase64: false,
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
      },
      height: {
        default: null,
      },
    };
  },
  parseHTML() {
    return [{ tag: "img" }];
  },
  addNodeView() {
    return NodeView();
  },
  addPasteRules() {
    return [
      ...(this.parent?.() ?? []),
      nodePasteRule({
        find: /!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]+)"?)?\)/g,
        type: this.type,
        getAttributes: (match) => {
          const [, alt, src, title] = match;
          return { src, alt, title };
        },
      }),
    ];
  },
  addInputRules() {
    return [
      ...(this.parent?.() ?? []),
      nodeInputRule({
        find: /!\[([\S]+)\]\(([^)\s]+)(?:\s+"([\S]+)"?)?\)/g,
        type: this.type,
        getAttributes: (match) => {
          const [, alt, src, title] = match;
          return { src, alt, title };
        },
      }),
    ];
  },
});
