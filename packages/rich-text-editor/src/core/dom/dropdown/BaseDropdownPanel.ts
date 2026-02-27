import { EventManager } from "@/utils/EventManager";
import { ShortcutManager } from "@/utils/ShortcutManager";
import { debounce } from "lodash";
import { ElementUtils } from "@/core/dom/utils/ElementUtils";
import {
  computePosition,
  flip,
  shift,
  offset,
  limitShift,
} from "@floating-ui/dom";

export interface BaseDropdownOptions {
  width?: string | number;
  height?: string | number;
  minWidth?: string | number;
  maxWidth?: string | number;
  maxHeight?: string | number;
  zIndex?: number;
  className?: string;
  position?:
    | "bottom-left"
    | "bottom-right"
    | "top-left"
    | "top-right"
    | "center";
  offset?: { x: number; y: number };
  closeOnClickOutside?: boolean;
  closeOnEscape?: boolean;
  show?: boolean;
  triggerButton?: HTMLElement;
  editorRoot: HTMLElement;
  forceWithinEditor?: boolean; // 是否强制弹框在编辑器内部
}

export abstract class BaseDropdownPanel {
  protected container: HTMLElement;
  protected options: BaseDropdownOptions;
  protected panel!: HTMLElement;
  protected isVisible: boolean = false;
  protected isCreated: boolean = false;
  protected eventManager: EventManager;
  protected editorRoot: HTMLElement | null = null;
  protected resizeObserver: ResizeObserver | null = null;
  protected debouncedUpdatePosition: () => void;

  // 全局菜单管理
  private static openMenus: Set<BaseDropdownPanel> = new Set();

  // 每个实例的唯一快捷键 ID
  private static instanceCounter = 0;
  private readonly shortcutId: string;

  constructor(container: HTMLElement, options: BaseDropdownOptions) {
    this.container = container;
    this.options = {
      position: "center",
      offset: { x: 0, y: 0 },
      closeOnClickOutside: true,
      closeOnEscape: true,
      ...options,
    };
    this.eventManager = new EventManager();
    this.shortcutId = `dropdown-escape-${BaseDropdownPanel.instanceCounter++}`;
    this.debouncedUpdatePosition = debounce(
      async () => await this.updatePosition(),
      16
    ); // 60fps

    // 直接使用传入的editorRoot，不再进行查找
    this.editorRoot = options.editorRoot;

    // 只有在明确要求显示时才创建和显示
    if (options.show === true) {
      this.createPanel();
      this.show();
    }
  }

  // 公共方法：设置编辑器根节点
  public setEditorRoot(editorRoot: HTMLElement): void {
    this.editorRoot = editorRoot;
  }

  protected createPanel(): void {
    if (this.isCreated) return;

    this.panel = ElementUtils.createElement({
      tagName: "div",
      className: `rich:bg-white rich:border rich:border-gray-200 rich:rounded-md rich:shadow-lg ${
        this.options.className || ""
      }`,
    });

    // 设置基础样式
    let styleText = "display: none !important; position: fixed !important;";

    // 设置宽度
    if (this.options.width) {
      if (typeof this.options.width === "number") {
        styleText += ` width: ${this.options.width}px;`;
      } else {
        styleText += ` width: ${this.options.width};`;
      }
    }

    // 设置高度
    if (this.options.height) {
      if (typeof this.options.height === "number") {
        styleText += ` height: ${this.options.height}px;`;
      } else {
        styleText += ` height: ${this.options.height};`;
      }
    }

    // 设置最小宽度
    if (this.options.minWidth) {
      if (typeof this.options.minWidth === "number") {
        styleText += ` min-width: ${this.options.minWidth}px;`;
      } else {
        styleText += ` min-width: ${this.options.minWidth};`;
      }
    }

    // 设置最大宽度
    if (this.options.maxWidth) {
      if (typeof this.options.maxWidth === "number") {
        styleText += ` max-width: ${this.options.maxWidth}px;`;
      } else {
        styleText += ` max-width: ${this.options.maxWidth};`;
      }
    }

    // 设置最大高度
    if (this.options.maxHeight) {
      if (typeof this.options.maxHeight === "number") {
        styleText += ` max-height: ${this.options.maxHeight}px;`;
      } else {
        styleText += ` max-height: ${this.options.maxHeight};`;
      }
      styleText += " overflow-y: auto;";
    }

    // 设置z-index
    if (this.options.zIndex) {
      styleText += ` z-index: ${this.options.zIndex};`;
    } else {
      styleText += " z-index: 50;";
    }

    this.panel.style.cssText = styleText;

    // 调用子类实现的内容创建方法
    this.createContent();

    this.isCreated = true;
  }

  protected abstract createContent(): void;

  protected setupResizeObserver(): void {
    // 清理之前的观察器
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }

    // 创建新的ResizeObserver
    this.resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === this.panel) {
          this.debouncedUpdatePosition();
        }
      }
    });

    // 开始观察面板
    this.resizeObserver.observe(this.panel);
  }

  protected async updatePosition(): Promise<void> {
    if (!this.isVisible || !this.isCreated) return;

    // 严格使用floating-ui进行定位
    if (this.options.triggerButton) {
      await this.updatePositionWithFloatingUI();
    } else {
      throw new Error(
        "BaseDropdownPanel requires triggerButton for positioning with @floating-ui/dom"
      );
    }
  }

  private async updatePositionWithFloatingUI(): Promise<void> {
    if (!this.options.triggerButton) return;

    const middleware = [
      offset(this.options.offset?.y || 4),
      flip(),
      shift({ padding: 8 }),
    ];

    // 如果强制在编辑器内部，添加边界限制
    if (this.options.forceWithinEditor && this.editorRoot) {
      middleware.push(
        shift({
          boundary: this.editorRoot,
          padding: 8,
          limiter: limitShift(),
        })
      );
    } else if (this.editorRoot) {
      // 尽量保持在编辑器内部，但不强制
      middleware.push(
        shift({
          boundary: this.editorRoot,
          padding: 8,
        })
      );
    }

    const { x, y } = await computePosition(
      this.options.triggerButton,
      this.panel,
      {
        placement: "bottom-start",
        middleware,
      }
    );

    this.panel.style.left = `${x}px`;
    this.panel.style.top = `${y}px`;
  }

  protected bindEvents(): void {
    // 先清理旧的事件监听器，避免重复绑定
    this.eventManager.cleanup();

    // 点击外部关闭面板
    if (this.options.closeOnClickOutside) {
      this.eventManager.addClickOutsideListener(this.panel, () => {
        this.hide();
      });
    }

    // 窗口大小改变时重新定位
    this.eventManager.addResizeListener(async () => {
      if (this.isVisible) {
        await this.updatePosition();
      }
    });
  }

  public show(): void {
    // 关闭其他已打开的菜单（排除当前菜单）
    BaseDropdownPanel.openMenus.forEach((menu) => {
      if (menu !== this && menu.isVisible) {
        menu.hide();
      }
    });

    // 如果还没有创建，先创建
    if (!this.isCreated) {
      this.createPanel();
    }

    // 每次显示时都重新绑定事件，确保事件监听器正常工作
    this.bindEvents();

    // 注册 ESC 快捷键（高优先级，优先于全屏等其他 Escape 处理器）
    if (this.options.closeOnEscape) {
      ShortcutManager.getInstance().register(this.shortcutId, {
        key: 'Escape',
        priority: 10,
        description: '关闭下拉面板',
        handler: () => {
          if (this.isVisible) {
            this.hide();
            return true;
          }
          return false;
        }
      });
    }

    this.isVisible = true;
    this.panel.style.setProperty("display", "block", "important");

    // 添加到编辑器根节点
    if (this.editorRoot && this.panel.parentNode !== this.editorRoot) {
      ElementUtils.appendChild(this.editorRoot, this.panel);
    }

    // 添加到全局菜单集合
    BaseDropdownPanel.openMenus.add(this);

    // 设置ResizeObserver监听面板尺寸变化
    this.setupResizeObserver();

    // 延迟更新位置，确保面板已渲染
    requestAnimationFrame(async () => {
      await this.updatePosition();
    });
  }

  public hide(): void {
    this.isVisible = false;
    if (this.panel) {
      this.panel.style.display = "none";
    }

    // 取消注册 ESC 快捷键
    if (this.options.closeOnEscape) {
      ShortcutManager.getInstance().unregister(this.shortcutId);
    }

    // 清理ResizeObserver
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    // 从全局菜单集合中移除
    BaseDropdownPanel.openMenus.delete(this);
  }

  public toggle(): void {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  public destroy(): void {
    this.hide();

    // 清理ResizeObserver
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    if (this.isCreated && this.panel && this.panel.parentNode) {
      ElementUtils.remove(this.panel);
    }

    // 清理所有事件监听器
    this.eventManager.cleanup();

    this.isCreated = false;
    this.editorRoot = null;
  }

  public get isPanelVisible(): boolean {
    return this.isVisible;
  }

  public get panelElement(): HTMLElement {
    return this.panel;
  }

  // 静态方法：关闭所有已打开的菜单
  public static closeAllMenus(): void {
    BaseDropdownPanel.openMenus.forEach((menu) => {
      if (menu.isVisible) {
        menu.hide();
      }
    });
    BaseDropdownPanel.openMenus.clear();
  }
}
