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

    // 为编辑器根节点添加标识
    StyleUtils.addClass(this.container, "rich-text-editor");
    TextUtils.setAttribute(this.container, "data-editor-root", "true");

    this.options = {
      content: "<p>开始编写你的内容...</p>",
      placeholder: "开始编写你的内容...",
      editable: true,
      showToolbar: true,
      toolbarOptions: {},
      ...options,
    };
    this.eventManager = new EventManager();

    this.editor = new Editor({
      element: this.container,
      content: this.options.content,
      editable: this.options.editable,
      extensions: [
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
        Heading.configure({
          levels: [1, 2, 3, 4, 5, 6],
        }),
        Blockquote,
        ListItem,
        BulletList.configure({
          HTMLAttributes: {
            class: "rich:list-disc",
          },
        }),
        OrderedList.configure({
          HTMLAttributes: {
            class: "rich:list-decimal",
          },
        }),
        TextStyle,
        FontSize.configure({
          types: ["textStyle"],
        }),
        LineHeight.configure({
          types: ["textStyle"],
        }),
        Color.configure({
          types: ["textStyle"],
        }),
        BackgroundColor.configure({
          types: ["textStyle"],
        }),
        Highlight.configure({
          multicolor: true,
        }),
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
            class:
              "rich:h-auto rich:rounded-lg rich:cursor-pointer rich:relative",
            style: "max-width: 100%; min-width: 50px; min-height: 50px;",
          },
        }),
        Table.configure({
          resizable: true,
          HTMLAttributes: {
            class: "rich:border-collapse rich:border rich:border-gray-300",
          },
        }),
        TableRow,
        TableHeader,
        TableCell,
        Underline,
        Superscript,
        Subscript,
        TextAlign.configure({
          types: ["heading", "paragraph"],
        }),
        NodeAlign,
        CodeBlockLowlight.configure({
          lowlight: createLowlight(all),
          enableTabIndentation: true,
          HTMLAttributes: {
            class:
              "rich:bg-gray-100 rich:rounded-lg rich:p-4 rich:font-mono rich:text-sm rich:overflow-x-auto",
          },
        }),
        UndoRedo,
        FileHandler.configure({
          allowedMimeTypes: [
            "image/png",
            "image/jpeg",
            "image/gif",
            "image/webp",
          ],
          onDrop: (_currentEditor, files, pos) => {
            // 处理文件上传
            files.forEach((file) => {
              if (file.type.startsWith("image/")) {
                this.handleImageFile(file, pos);
              }
            });
          },
          onPaste: (currentEditor, files, htmlContent) => {
            files.forEach((file) => {
              if (htmlContent) {
                return false;
              }
              if (file.type.startsWith("image/")) {
                this.handleImageFile(
                  file,
                  currentEditor.state.selection.anchor
                );
              }
            });
          },
        }),
      ],
      editorProps: {
        attributes: {
          class: "focus:rich:outline-none rich:min-h-96 rich:p-4",
        },
      },
      onUpdate: ({ editor }) => {
        this.options.onUpdate?.(editor.getHTML());
      },
      onSelectionUpdate: ({ editor }) => {
        // 更新所有按钮状态
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

    // 创建工具栏
    if (this.options.showToolbar) {
      this.createToolbar();
    }

    // 添加点击空白区域的事件监听
    // this.setupClickToAddLine();
  }

  private createToolbar(): void {
    // 先完全清理现有的工具栏
    this.destroyToolbar();

    // 创建新的工具栏容器
    this.toolbarContainer = ElementUtils.createDiv({
      className: "rich:toolbar-container",
    });

    // 将工具栏容器插入到编辑器容器的开头
    const firstChild = this.container.firstElementChild as HTMLElement | null;
    if (firstChild) {
      ElementUtils.insertBefore(
        this.container,
        this.toolbarContainer,
        firstChild
      );
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

  // 公共 API - 内容操作
  getHTML(): string {
    return this.editor.getHTML();
  }

  setHTML(content: string): void {
    this.editor.commands.setContent(content);
  }

  getText(): string {
    return this.editor.getText();
  }

  setText(text: string): void {
    this.editor.commands.setContent(text);
  }
  getJSON() {
    return this.editor.getJSON();
  }
  clear(): void {
    this.editor.commands.clearContent();
  }

  // 公共 API - 状态控制
  focus(): void {
    this.editor.commands.focus();
  }

  blur(): void {
    this.editor.commands.blur();
  }

  isEmpty(): boolean {
    return this.editor.isEmpty;
  }

  isFocused(): boolean {
    return this.editor.isFocused;
  }

  isEditable(): boolean {
    return this.editor.isEditable;
  }

  setEditable(editable: boolean): void {
    this.editor.setEditable(editable);
  }

  // 公共 API - 历史操作
  undo(): void {
    this.editor.chain().focus().undo().run();
  }

  redo(): void {
    this.editor.chain().focus().redo().run();
  }

  canUndo(): boolean {
    return this.editor.can().undo();
  }

  canRedo(): boolean {
    return this.editor.can().redo();
  }

  // 公共 API - 工具栏控制
  showToolbar(): void {
    if (!this.toolbar) {
      this.options.showToolbar = true;
      this.createToolbar();
    }
  }

  hideToolbar(): void {
    this.destroyToolbar();
    this.options.showToolbar = false;
  }

  updateToolbar(options: ToolbarOptions): void {
    this.options.toolbarOptions = {
      ...this.options.toolbarOptions,
      ...options,
    };

    if (this.toolbar) {
      // 如果工具栏存在，重新创建以应用新配置
      this.createToolbar();
    } else if (this.options.showToolbar) {
      // 如果工具栏不存在但应该显示，创建工具栏
      this.createToolbar();
    }
  }

  // 销毁编辑器
  destroy(): void {
    // 清理所有事件监听器
    this.eventManager.cleanup();

    // 销毁工具栏
    this.destroyToolbar();

    // 清理状态管理器
    StateManager.getInstance().cleanup();

    // 清理编辑器容器
    this.cleanupEditorContainer();

    // 销毁编辑器
    this.editor.destroy();
  }

  // private setupClickToAddLine(): void {
  //   // 监听编辑器容器的点击事件
  //   this.eventManager.addEventListener(
  //     this.container,
  //     "click",
  //     (event: Event) => {
  //       const target = event.target as HTMLElement;
  //       const editorElement = this.editor.view.dom;

  //       // 检查点击是否在编辑器内容区域之外的空白处
  //       if (target === this.container || target === editorElement) {
  //         const rect = editorElement.getBoundingClientRect();
  //         const clickY = (event as MouseEvent).clientY;

  //         // 如果点击位置在编辑器内容的下方空白区域
  //         if (clickY > rect.top && clickY < rect.bottom - 20) {
  //           // 给一些容错空间
  //           // 将光标移动到文档末尾并插入新段落
  //           const endPos = this.editor.state.doc.content.size;
  //           const lastNode = this.editor.state.doc.lastChild;
  //           if (lastNode && lastNode.type.name === "paragraph") {
  //             this.editor.commands.setTextSelection(endPos);
  //           } else {
  //             this.editor.commands.setTextSelection(endPos);
  //             this.editor.commands.insertContent("<p></p>");
  //           }
  //           this.editor.commands.focus();
  //         }
  //       }
  //     }
  //   );
  // }

  private cleanupEditorContainer(): void {
    // 清理编辑器容器内的所有DOM元素
    if (this.container) {
      TextUtils.setHTML(this.container, "");
      StyleUtils.clearClasses(this.container);
      TextUtils.setAttribute(this.container, "id", "");
    }
  }

  private async handleImageFile(file: File, pos?: number): Promise<void> {
    try {
      let imageUrl: string;

      // 如果有自定义上传方法，使用它
      if (this.options.toolbarOptions?.onImageUpload) {
        imageUrl = await this.options.toolbarOptions.onImageUpload(file);
      } else {
        // 否则转换为base64
        imageUrl = await this.fileToBase64(file);
      }

      // 插入图片到编辑器
      if (pos !== undefined) {
        this.editor
          .chain()
          .focus()
          .insertContentAt(pos, {
            type: "image",
            attrs: {
              src: imageUrl,
              alt: file.name,
              title: file.name,
            },
          })
          .run();
      } else {
        this.editor
          .chain()
          .focus()
          .setImage({
            src: imageUrl,
            alt: file.name,
            title: file.name,
          })
          .run();
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
