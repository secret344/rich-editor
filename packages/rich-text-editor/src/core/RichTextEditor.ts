/**
 * 现代化富文本编辑器
 * 基于 Tiptap 构建，提供完整的富文本编辑功能和工具栏
 */
import { Editor } from "@tiptap/core";
import { UndoRedo } from "@tiptap/extensions";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import Strike from "@tiptap/extension-strike";
import Code from "@tiptap/extension-code";

import Dropcursor from "@tiptap/extension-dropcursor";
import Gapcursor from "@tiptap/extension-gapcursor";
import HardBreak from "@tiptap/extension-hard-break";
import Heading from "@tiptap/extension-heading";
import Blockquote from "@tiptap/extension-blockquote";
import { TextStyle } from "@tiptap/extension-text-style";
import { FontSize } from "@tiptap/extension-text-style/font-size";
import { LineHeight } from "@tiptap/extension-text-style/line-height";
import Color from "@tiptap/extension-color";
import { BackgroundColor } from "@tiptap/extension-text-style/background-color";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import Image from "./extensions/image";
import FileHandler from "@tiptap/extension-file-handler";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import Underline from "@tiptap/extension-underline";
import Superscript from "@tiptap/extension-superscript";
import Subscript from "@tiptap/extension-subscript";
import TextAlign from "@tiptap/extension-text-align";
import ListItem from "@tiptap/extension-list-item";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { all, createLowlight } from "lowlight";
import { MenuManager } from "@/core/menu/MenuManager";
import { EventManager } from "@/utils/EventManager";
import { StateManager } from "@/utils/StateManager";
import { ElementUtils, StyleUtils, TextUtils } from "@/core/dom";
import NodeAlign from "@/core/extensions/node-align";
import AudioExtension from "@/core/extensions/audio";
import VideoExtension from "@/core/extensions/video";
import { createMentionExtension, type MentionItem, type MentionOptions } from "@/core/extensions/mention";
import { createSlashCommandExtension, type SlashCommandItem, type SlashCommandOptions } from "@/core/extensions/slash-command";
import { createNotionModeExtension, type NotionModeOptions } from "@/core/extensions/notion-mode";


/** 富文本编辑器配置选项 */
export interface RichTextEditorOptions {
  /** 初始内容 HTML */
  content?: string;
  /** 占位符文本 */
  placeholder?: string;
  /** 是否可编辑 */
  editable?: boolean;
  /** 是否显示工具栏 */
  showToolbar?: boolean;
  /** 工具栏配置选项 */
  toolbarOptions?: ToolbarOptions;
  /** 内容更新回调 */
  onUpdate?: (content: string) => void;
  /** 选择区域更新回调 */
  onSelectionUpdate?: (selection: {
    from: number;
    to: number;
    empty: boolean;
  }) => void;
  /** 获得焦点回调 */
  onFocus?: () => void;
  /** 失去焦点回调 */
  onBlur?: () => void;
  /** Mention（@提及）配置，传入则启用 mention 功能 */
  mentionOptions?: MentionOptions;
  /** Slash 命令配置，传入则启用 Notion-like 斜杠命令 */
  slashCommandOptions?: SlashCommandOptions;
  /** 是否启用 Notion 模式（左侧浮动菜单 + 拖拽排序） */
  notionMode?: boolean;
  /** Notion 模式扩展配置 */
  notionModeOptions?: NotionModeOptions;
}

/** 工具栏配置选项 */
export interface ToolbarOptions {
  /** 显示文本格式按钮 */
  showTextFormat?: boolean;
  /** 显示标题选择器 */
  showHeadings?: boolean;
  /** 显示列表按钮 */
  showLists?: boolean;
  /** 显示块级元素按钮 */
  showBlocks?: boolean;
  /** 显示媒体按钮（图片、链接） */
  showMedia?: boolean;
  /** 显示视频按钮 */
  showVideo?: boolean;
  /** 显示音频按钮 */
  showAudio?: boolean;
  /** 显示颜色选择器 */
  showColors?: boolean;
  /** 显示表格按钮 */
  showTables?: boolean;
  /** 显示历史操作按钮 */
  showHistory?: boolean;
  /** 显示对齐按钮 */
  showAlignment?: boolean;
  /** 显示上标下标按钮 */
  showSuperscriptSubscript?: boolean;
  /** 显示清除格式按钮 */
  showClearFormat?: boolean;
  /** 显示代码块按钮 */
  showCodeBlock?: boolean;
  /** 显示引用块按钮 */
  showBlockquote?: boolean;
  /** 显示字体大小选择器 */
  showFontSize?: boolean;
  /** 显示行高选择器 */
  showLineHeight?: boolean;
  /** 显示 emoji 选择器 */
  showEmoji?: boolean;
  /** 显示全屏按钮 */
  showFullscreen?: boolean;
  /** 代码块支持的语言配置 */
  codeBlockLanguages?: Array<{ value: string; label: string }>;
  /** 自定义按钮 */
  customButtons?: ToolbarButton[];
  /** 图片上传处理函数 */
  onImageUpload?: (file: File) => Promise<string>;
}

/** 自定义工具栏按钮配置 */
export interface ToolbarButton {
  /** 按钮唯一标识 */
  id: string;
  /** 按钮显示文本 */
  label: string;
  /** 按钮图标 */
  icon?: string;
  /** 按钮提示文本 */
  title?: string;
  /** 点击事件处理函数 */
  onClick: () => void;
  /** 是否处于激活状态 */
  isActive?: () => boolean;
  /** 是否禁用 */
  isDisabled?: () => boolean;
}

// Re-export extension types for consumers
export type { MentionItem, MentionOptions, SlashCommandItem, SlashCommandOptions, NotionModeOptions };

/**
 * 富文本编辑器主类
 * 基于 Tiptap 构建，提供完整的富文本编辑功能
 */
export class RichTextEditor {
  private editor: Editor;
  private container: HTMLElement;
  private options: RichTextEditorOptions;
  private toolbar: MenuManager | null = null;
  private toolbarContainer: HTMLElement | null = null;
  private eventManager: EventManager;

  constructor(container: HTMLElement, options: RichTextEditorOptions = {}) {
    this.container = container;

    StyleUtils.addClass(this.container, "rich-text-editor");
    TextUtils.setAttribute(this.container, "data-editor-root", "true");

    this.options = {
      content: "<p></p>",
      placeholder: "开始编写你的内容...",
      editable: true,
      showToolbar: true,
      toolbarOptions: {},
      ...options,
    };
    this.eventManager = new EventManager();

    const extensions: any[] = [
      Document,
      Paragraph,
      Text,
      Bold,
      Italic,
      Strike,
      Code,
      Dropcursor,
      Gapcursor,
      HardBreak,
      Heading.configure({ levels: [1, 2, 3, 4, 5, 6] }),
      Blockquote,
      ListItem,
      BulletList.configure({ HTMLAttributes: { class: "rich:list-disc" } }),
      OrderedList.configure({ HTMLAttributes: { class: "rich:list-decimal" } }),
      TextStyle,
      FontSize.configure({ types: ["textStyle"] }),
      LineHeight.configure({ types: ["textStyle"] }),
      Color.configure({ types: ["textStyle"] }),
      BackgroundColor.configure({ types: ["textStyle"] }),
      Highlight.configure({ multicolor: true }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "rich:text-blue-600 rich:underline hover:rich:text-blue-800",
        },
        protocols: ["ftp", "mailto"],
      }),
      Image.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: {
          class: "rich:h-auto rich:rounded-lg rich:cursor-pointer rich:relative",
          style: "max-width: 100%; min-width: 50px; min-height: 50px;",
        },
      }),
      AudioExtension.configure({
        HTMLAttributes: { class: "rich:w-full rich:rounded-lg rich:my-2", controls: "true" },
      }),
      VideoExtension.configure({
        HTMLAttributes: { class: "rich:rounded-lg" },
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: { class: "rich:border-collapse rich:border rich:border-gray-300" },
      }),
      TableRow,
      TableHeader,
      TableCell,
      Underline,
      Superscript,
      Subscript,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      NodeAlign,
      CodeBlockLowlight.configure({
        lowlight: createLowlight(all),
        enableTabIndentation: true,
        HTMLAttributes: {
          class: "rich:bg-gray-100 rich:rounded-lg rich:p-4 rich:font-mono rich:text-sm rich:overflow-x-auto",
        },
      }),
      UndoRedo,
      FileHandler.configure({
        allowedMimeTypes: ["image/png", "image/jpeg", "image/gif", "image/webp"],
        onDrop: (_currentEditor, files, pos) => {
          files.forEach((file) => {
            if (file.type.startsWith("image/")) {
              this.handleImageFile(file, pos);
            }
          });
        },
        onPaste: (currentEditor, files, htmlContent) => {
          files.forEach((file) => {
            if (htmlContent) return false;
            if (file.type.startsWith("image/")) {
              this.handleImageFile(file, currentEditor.state.selection.anchor);
            }
          });
        },
      }),
    ];

    if (this.options.mentionOptions) {
      extensions.push(createMentionExtension(this.options.mentionOptions));
    }

    if (this.options.slashCommandOptions !== undefined) {
      extensions.push(createSlashCommandExtension(this.options.slashCommandOptions));
    }

    if (this.options.notionMode) {
      extensions.push(createNotionModeExtension(this.options.notionModeOptions || {}));
      StyleUtils.addClass(this.container, "notion-mode-active");
    }

    this.editor = new Editor({
      element: this.container,
      content: this.options.content,
      editable: this.options.editable,
      extensions,
      editorProps: {
        attributes: { class: "focus:rich:outline-none rich:min-h-96 rich:p-4" },
      },
      onUpdate: ({ editor }) => {
        this.options.onUpdate?.(editor.getHTML());
      },
      onSelectionUpdate: ({ editor }) => {
        this.options.onSelectionUpdate?.(editor.state.selection);
      },
      onFocus: () => {
        this.options.onFocus?.();
      },
      onBlur: () => {
        this.options.onBlur?.();
      },
      onTransaction() {
        StateManager.getInstance().updateAll();
      },
    });

    if (this.options.showToolbar) {
      this.createToolbar();
    }
  }

  private createToolbar(): void {
    this.destroyToolbar();

    this.toolbarContainer = ElementUtils.createDiv({ className: "rich:toolbar-container" });

    const firstChild = this.container.firstElementChild as HTMLElement | null;
    if (firstChild) {
      ElementUtils.insertBefore(this.container, this.toolbarContainer, firstChild);
    } else {
      ElementUtils.appendChild(this.container, this.toolbarContainer);
    }

    this.toolbar = new MenuManager(
      this.toolbarContainer,
      this.editor,
      this.container,
      this.options.toolbarOptions || {}
    );
  }

  private destroyToolbar(): void {
    if (this.toolbar) {
      this.toolbar.destroy();
      this.toolbar = null;
    }
    if (this.toolbarContainer) {
      ElementUtils.remove(this.toolbarContainer);
      this.toolbarContainer = null;
    }
  }

  /** 获取 HTML 内容 */
  getHTML(): string {
    return this.editor.getHTML();
  }

  /** 设置 HTML 内容 */
  setHTML(content: string): void {
    this.editor.commands.setContent(content);
  }

  /** 获取纯文本内容 */
  getText(): string {
    return this.editor.getText();
  }

  /** 设置纯文本内容 */
  setText(text: string): void {
    this.editor.commands.setContent(text);
  }

  /** 获取 JSON 文档结构 */
  getJSON() {
    return this.editor.getJSON();
  }

  /** 清空内容 */
  clear(): void {
    this.editor.commands.clearContent();
  }

  /** 聚焦编辑器 */
  focus(): void {
    this.editor.commands.focus();
  }

  /** 使编辑器失焦 */
  blur(): void {
    this.editor.commands.blur();
  }

  /** 是否为空 */
  isEmpty(): boolean {
    return this.editor.isEmpty;
  }

  /** 是否处于焦点 */
  isFocused(): boolean {
    return this.editor.isFocused;
  }

  /** 是否可编辑 */
  isEditable(): boolean {
    return this.editor.isEditable;
  }

  /** 设置编辑器可编辑状态 */
  setEditable(editable: boolean): void {
    this.editor.setEditable(editable);
  }

  /** 撤销 */
  undo(): void {
    this.editor.chain().focus().undo().run();
  }

  /** 重做 */
  redo(): void {
    this.editor.chain().focus().redo().run();
  }

  /** 是否可撤销 */
  canUndo(): boolean {
    return this.editor.can().undo();
  }

  /** 是否可重做 */
  canRedo(): boolean {
    return this.editor.can().redo();
  }

  /** 显示工具栏 */
  showToolbar(): void {
    if (!this.toolbar) {
      this.options.showToolbar = true;
      this.createToolbar();
    }
  }

  /** 隐藏工具栏 */
  hideToolbar(): void {
    this.destroyToolbar();
    this.options.showToolbar = false;
  }

  /** 动态更新工具栏配置 */
  updateToolbar(options: ToolbarOptions): void {
    this.options.toolbarOptions = { ...this.options.toolbarOptions, ...options };
    if (this.toolbar) {
      this.createToolbar();
    } else if (this.options.showToolbar) {
      this.createToolbar();
    }
  }

  /** 获取底层 Tiptap Editor 实例（高级用法） */
  getEditor(): Editor {
    return this.editor;
  }

  /** 销毁编辑器，清理所有资源 */
  destroy(): void {
    this.eventManager.cleanup();
    this.destroyToolbar();
    StateManager.getInstance().cleanup();
    this.cleanupEditorContainer();
    this.editor.destroy();
  }

  private cleanupEditorContainer(): void {
    if (this.container) {
      TextUtils.setHTML(this.container, "");
      StyleUtils.clearClasses(this.container);
      TextUtils.setAttribute(this.container, "id", "");
    }
  }

  private async handleImageFile(file: File, pos?: number): Promise<void> {
    try {
      let imageUrl: string;
      if (this.options.toolbarOptions?.onImageUpload) {
        imageUrl = await this.options.toolbarOptions.onImageUpload(file);
      } else {
        imageUrl = await this.fileToBase64(file);
      }

      if (pos !== undefined) {
        this.editor.chain().focus().insertContentAt(pos, {
          type: "image",
          attrs: { src: imageUrl, alt: file.name, title: file.name },
        }).run();
      } else {
        this.editor.chain().focus().setImage({
          src: imageUrl,
          alt: file.name,
          title: file.name,
        }).run();
      }
    } catch (error) {
      console.error("图片上传失败:", error);
    }
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}
