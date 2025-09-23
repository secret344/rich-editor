import { type NodeViewRenderer } from "@tiptap/core";
import { ElementUtils, StyleUtils } from "@/core/dom/utils";
import type { NodeView } from "prosemirror-view";
import { EventManager } from "@/utils/EventManager";

interface ResizeHandle {
  position: string;
  cursor: string;
  style: string;
}

export default function NodeView(): NodeViewRenderer {
  return (props): NodeView => {
    const { node, view, getPos } = props;

    // 创建事件管理器
    const eventManager = new EventManager();

    // 创建包裹元素
    const wrapper = ElementUtils.createDiv({
      className: "rich:relative rich:inline-block rich:max-w-full rich:mx-auto",
      attributes: {
        "data-image-wrapper": "true",
      },
    });

    // 创建图片元素
    const img = ElementUtils.createElement({
      tagName: "img",
      className: "rich:w-full rich:h-full rich:object-fill",
      attributes: {
        src: node.attrs.src,
        alt: node.attrs.alt || "",
        draggable: "false",
      },
    }) as HTMLImageElement;

    // 设置包裹元素的初始尺寸
    if (node.attrs.width) {
      StyleUtils.setStyle(wrapper, "width", `${node.attrs.width}px`);
    }
    if (node.attrs.height) {
      StyleUtils.setStyle(wrapper, "height", `${node.attrs.height}px`);
    }

    // 图片原始尺寸和宽高比
    let aspectRatio = 1;

    // 图片加载完成后获取宽高比例
    img.onload = () => {
      aspectRatio = img.naturalWidth / img.naturalHeight;
    };
    
    // 如果图片已经加载完成（缓存情况）
    if (img.complete && img.naturalWidth > 0) {
      aspectRatio = img.naturalWidth / img.naturalHeight;
    }
    
    ElementUtils.appendChild(wrapper, img);

    // 拖拽手柄相关变量
    let handles: HTMLElement[] = [];
    let isResizing = false;
    let currentHandle: string | null = null;
    let startX = 0;
    let startY = 0;
    let startWidth = 0;
    let startHeight = 0;
    
    // 保存拖拽事件处理器引用，用于正确清理
    let dragMouseMoveHandler: EventListener | null = null;
    let dragMouseUpHandler: EventListener | null = null;
    let dragTouchMoveHandler: EventListener | null = null;
    let dragTouchEndHandler: EventListener | null = null;

    // 手柄配置
    const handleConfigs: ResizeHandle[] = [
      {
        position: "nw",
        cursor: "nw-resize",
        style:
          "rich:absolute rich:top-0 rich:left-0 rich:-translate-x-1/2 rich:-translate-y-1/2",
      },
      {
        position: "n",
        cursor: "n-resize",
        style:
          "rich:absolute rich:top-0 rich:left-1/2 rich:-translate-x-1/2 rich:-translate-y-1/2",
      },
      {
        position: "ne",
        cursor: "ne-resize",
        style:
          "rich:absolute rich:top-0 rich:right-0 rich:translate-x-1/2 rich:-translate-y-1/2",
      },
      {
        position: "e",
        cursor: "e-resize",
        style:
          "rich:absolute rich:top-1/2 rich:right-0 rich:translate-x-1/2 rich:-translate-y-1/2",
      },
      {
        position: "se",
        cursor: "se-resize",
        style:
          "rich:absolute rich:bottom-0 rich:right-0 rich:translate-x-1/2 rich:translate-y-1/2",
      },
      {
        position: "s",
        cursor: "s-resize",
        style:
          "rich:absolute rich:bottom-0 rich:left-1/2 rich:-translate-x-1/2 rich:translate-y-1/2",
      },
      {
        position: "sw",
        cursor: "sw-resize",
        style:
          "rich:absolute rich:bottom-0 rich:left-0 rich:-translate-x-1/2 rich:translate-y-1/2",
      },
      {
        position: "w",
        cursor: "w-resize",
        style:
          "rich:absolute rich:top-1/2 rich:left-0 rich:-translate-x-1/2 rich:-translate-y-1/2",
      },
    ];

    // 创建拖拽手柄
    const createHandles = () => {
      handles.forEach((handle) => handle.remove());
      handles = [];

      handleConfigs.forEach((config) => {
        const handle = ElementUtils.createDiv({
          className: `rich:w-3 rich:h-3 rich:bg-blue-500 rich:border rich:border-white rich:rounded-sm rich:opacity-75 hover:rich:opacity-100 rich:pointer-events-auto rich:z-20 ${config.style}`,
          attributes: {
            "data-resize-handle": config.position,
          },
        });

        StyleUtils.setStyle(handle, "cursor", config.cursor);
        StyleUtils.setStyle(handle, "boxShadow", "0 1px 3px rgba(0,0,0,0.3)");

        eventManager.addEventListener(handle, "mousedown", (e) =>
          handleMouseDown(e as MouseEvent, config.position)
        );
        eventManager.addEventListener(handle, "touchstart", (e) =>
          handleTouchStart(e as TouchEvent, config.position)
        );

        ElementUtils.appendChild(wrapper, handle);
        handles.push(handle);
      });
    };

    // 隐藏拖拽手柄
    const hideHandles = () => {
      handles.forEach((handle) => {
        StyleUtils.setStyle(handle, "display", "none");
      });
    };

    // 显示拖拽手柄
    const showHandles = () => {
      if (handles.length === 0) {
        createHandles();
      }
      handles.forEach((handle) => {
        StyleUtils.setStyle(handle, "display", "block");
      });
    };

    // 开始拖拽处理（统一鼠标和触摸事件）
    const handleStart = (
      clientX: number,
      clientY: number,
      position: string
    ) => {
      isResizing = true;
      currentHandle = position;
      startX = clientX;
      startY = clientY;

      const rect = wrapper.getBoundingClientRect();
      startWidth = rect.width;
      startHeight = rect.height;

      // 创建并保存事件处理器引用
      dragMouseMoveHandler = (e: Event) => handleMouseMove(e as MouseEvent);
      dragMouseUpHandler = (e: Event) => handleMouseUp(e as MouseEvent);
      dragTouchMoveHandler = (e: Event) => handleTouchMove(e as TouchEvent);
      dragTouchEndHandler = (e: Event) => handleTouchEnd(e as TouchEvent);

      // 添加事件监听器
      eventManager.addEventListener(document, "mousemove", dragMouseMoveHandler);
      eventManager.addEventListener(document, "mouseup", dragMouseUpHandler);
      eventManager.addEventListener(document, "touchmove", dragTouchMoveHandler, { passive: false });
      eventManager.addEventListener(document, "touchend", dragTouchEndHandler);

      StyleUtils.setStyle(
        document.body,
        "cursor",
        handleConfigs.find((h) => h.position === position)?.cursor || "default"
      );
      StyleUtils.setStyle(document.body, "userSelect", "none");
    };

    // 鼠标按下事件处理
    const handleMouseDown = (e: MouseEvent, position: string) => {
      e.preventDefault();
      e.stopPropagation();
      handleStart(e.clientX, e.clientY, position);
    };

    // 触摸开始事件处理
    const handleTouchStart = (e: TouchEvent, position: string) => {
      e.preventDefault();
      e.stopPropagation();
      const touch = e.touches[0];
      handleStart(touch.clientX, touch.clientY, position);
    };

    // 移动处理（统一鼠标和触摸事件）
    const handleMove = (clientX: number, clientY: number) => {
      if (!isResizing || !currentHandle) return;

      const deltaX = clientX - startX;
      const deltaY = clientY - startY;

      let newWidth = startWidth;
      let newHeight = startHeight;

      // 根据拖拽方向计算新尺寸，保持图片原始宽高比
      switch (currentHandle) {
        case "nw":
          const nwDelta = Math.max(Math.abs(deltaX), Math.abs(deltaY));
          newWidth = Math.max(
            50,
            startWidth + (deltaX < 0 ? nwDelta : -nwDelta)
          );
          newHeight = newWidth / aspectRatio;
          break;
        case "n":
          newHeight = Math.max(50, startHeight - deltaY);
          newWidth = newHeight * aspectRatio;
          break;
        case "ne":
          const neDelta = Math.max(Math.abs(deltaX), Math.abs(deltaY));
          newWidth = Math.max(
            50,
            startWidth + (deltaX > 0 ? neDelta : -neDelta)
          );
          newHeight = newWidth / aspectRatio;
          break;
        case "e":
          newWidth = Math.max(50, startWidth + deltaX);
          newHeight = newWidth / aspectRatio;
          break;
        case "se":
          const seDelta = Math.max(Math.abs(deltaX), Math.abs(deltaY));
          newWidth = Math.max(
            50,
            startWidth + (deltaX > 0 || deltaY > 0 ? seDelta : -seDelta)
          );
          newHeight = newWidth / aspectRatio;
          break;
        case "s":
          newHeight = Math.max(50, startHeight + deltaY);
          newWidth = newHeight * aspectRatio;
          break;
        case "sw":
          const swDelta = Math.max(Math.abs(deltaX), Math.abs(deltaY));
          newWidth = Math.max(
            50,
            startWidth + (deltaX < 0 ? swDelta : -swDelta)
          );
          newHeight = newWidth / aspectRatio;
          break;
        case "w":
          newWidth = Math.max(50, startWidth - deltaX);
          newHeight = newWidth / aspectRatio;
          break;
      }

      // 实时更新包裹元素尺寸
      StyleUtils.setStyle(wrapper, "width", `${newWidth}px`);
      StyleUtils.setStyle(wrapper, "height", `${newHeight}px`);
    };

    // 鼠标移动事件处理
    const handleMouseMove = (e: MouseEvent) => {
      handleMove(e.clientX, e.clientY);
    };

    // 触摸移动事件处理
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      handleMove(touch.clientX, touch.clientY);
    };

    // 结束处理（统一鼠标和触摸事件）
    const handleEnd = (clientX: number, clientY: number) => {
      if (!isResizing || !currentHandle) return;

      const deltaX = clientX - startX;
      const deltaY = clientY - startY;

      let newWidth = startWidth;
      let newHeight = startHeight;

      // 计算最终尺寸，保持图片原始宽高比
      switch (currentHandle) {
        case "nw":
          const nwDelta = Math.max(Math.abs(deltaX), Math.abs(deltaY));
          newWidth = Math.max(
            50,
            startWidth + (deltaX < 0 ? nwDelta : -nwDelta)
          );
          newHeight = newWidth / aspectRatio;
          break;
        case "n":
          newHeight = Math.max(50, startHeight - deltaY);
          newWidth = newHeight * aspectRatio;
          break;
        case "ne":
          const neDelta = Math.max(Math.abs(deltaX), Math.abs(deltaY));
          newWidth = Math.max(
            50,
            startWidth + (deltaX > 0 ? neDelta : -neDelta)
          );
          newHeight = newWidth / aspectRatio;
          break;
        case "e":
          newWidth = Math.max(50, startWidth + deltaX);
          newHeight = newWidth / aspectRatio;
          break;
        case "se":
          const seDelta = Math.max(Math.abs(deltaX), Math.abs(deltaY));
          newWidth = Math.max(
            50,
            startWidth + (deltaX > 0 || deltaY > 0 ? seDelta : -seDelta)
          );
          newHeight = newWidth / aspectRatio;
          break;
        case "s":
          newHeight = Math.max(50, startHeight + deltaY);
          newWidth = newHeight * aspectRatio;
          break;
        case "sw":
          const swDelta = Math.max(Math.abs(deltaX), Math.abs(deltaY));
          newWidth = Math.max(
            50,
            startWidth + (deltaX < 0 ? swDelta : -swDelta)
          );
          newHeight = newWidth / aspectRatio;
          break;
        case "w":
          newWidth = Math.max(50, startWidth - deltaX);
          newHeight = newWidth / aspectRatio;
          break;
      }

      // 更新节点属性
      const pos = getPos();
      if (pos !== undefined) {
        const tr = view.state.tr;
        tr.setNodeMarkup(pos, null, {
          ...node.attrs,
          width: Math.round(newWidth),
          height: Math.round(newHeight),
        });
        view.dispatch(tr);
      }

      // 清理状态
      isResizing = false;
      currentHandle = null;

      // 立即清理拖拽相关的事件监听器
      if (dragMouseMoveHandler) {
        eventManager.removeEventListener(document, "mousemove", dragMouseMoveHandler);
        dragMouseMoveHandler = null;
      }
      if (dragMouseUpHandler) {
        eventManager.removeEventListener(document, "mouseup", dragMouseUpHandler);
        dragMouseUpHandler = null;
      }
      if (dragTouchMoveHandler) {
        eventManager.removeEventListener(document, "touchmove", dragTouchMoveHandler);
        dragTouchMoveHandler = null;
      }
      if (dragTouchEndHandler) {
        eventManager.removeEventListener(document, "touchend", dragTouchEndHandler);
        dragTouchEndHandler = null;
      }

      StyleUtils.setStyle(document.body, "cursor", "");
      StyleUtils.setStyle(document.body, "userSelect", "");
    };

    // 鼠标释放事件处理
    const handleMouseUp = (e: MouseEvent) => {
      handleEnd(e.clientX, e.clientY);
    };

    // 触摸结束事件处理
    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.changedTouches[0];
      handleEnd(touch.clientX, touch.clientY);
    };

    // 包裹元素点击事件
    const handleWrapperClick = (e: MouseEvent) => {
      e.stopPropagation();
      showHandles();
    };

    // 文档点击事件（隐藏手柄）
    const handleDocumentClick = (e: MouseEvent) => {
      if (!wrapper.contains(e.target as Node)) {
        hideHandles();
      }
    };

    // 添加事件监听
    eventManager.addEventListener(wrapper, "click", (e) =>
      handleWrapperClick(e as MouseEvent)
    );
    eventManager.addEventListener(document, "click", (e) =>
      handleDocumentClick(e as MouseEvent)
    );

    // 初始隐藏手柄
    hideHandles();

    return {
      dom: wrapper,

      update(newNode) {
        if (newNode.type !== node.type) return false;

        // 更新图片属性
        if (newNode.attrs.src !== node.attrs.src) {
          img.src = newNode.attrs.src;
        }
        if (newNode.attrs.alt !== node.attrs.alt) {
          img.alt = newNode.attrs.alt || "";
        }

        // 更新尺寸
        if (newNode.attrs.width) {
          StyleUtils.setStyle(wrapper, "width", `${newNode.attrs.width}px`);
        }
        if (newNode.attrs.height) {
          StyleUtils.setStyle(wrapper, "height", `${newNode.attrs.height}px`);
        }

        return true;
      },

      selectNode() {
        showHandles();
        StyleUtils.setStyle(wrapper, "outline", "2px solid #3b82f6");
      },

      deselectNode() {
        hideHandles();
        StyleUtils.setStyle(wrapper, "outline", "");
      },

      destroy() {
        // 移除所有事件监听器
        eventManager.cleanup();

        // 清理手柄
        handles.forEach((handle) => {
          handle.remove();
        });
        handles = [];

        // 重置body样式
        StyleUtils.setStyle(document.body, "cursor", "");
        StyleUtils.setStyle(document.body, "userSelect", "");
      },
    };
  };
}
