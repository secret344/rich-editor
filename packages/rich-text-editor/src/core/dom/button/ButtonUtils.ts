import { ElementUtils } from "@/core/dom/utils/ElementUtils";
import { EventManager } from "@/utils/EventManager";

export interface ButtonOptions {
  id?: string;
  icon?: string;
  label?: string;
  title?: string;
  className?: string;
  type?: "button" | "submit" | "reset";
}

export interface ButtonStateOptions extends ButtonOptions {
  onClick?: (event?: Event) => void;
  isActive?: () => boolean;
  isDisabled?: () => boolean;
}

export interface ButtonInstance {
  button: HTMLButtonElement;
  updateState: () => void;
  eventManager: EventManager;
  destroy: () => void;
}

export class ButtonUtils {
  /**
   * 创建图标按钮（简单版本，无状态管理）
   */
  static createIconButton(options: ButtonOptions): HTMLButtonElement {
    const button = ElementUtils.createElement({
      tagName: "button",
      className: `rich:inline-flex rich:items-center rich:justify-center rich:w-8 rich:h-8 rich:rounded hover:rich:bg-gray-100 focus:rich:outline-none focus:rich:ring-2 focus:rich:ring-blue-500 focus:rich:ring-offset-1 ${
        options.className || ""
      }`,
      id: options.id,
      attributes: {
        type: options.type || "button",
        ...(options.title && { title: options.title }),
      },
    }) as HTMLButtonElement;

    // 创建图标
    if (options.icon) {
      const iconSpan = ElementUtils.createElement({
        tagName: "span",
        className: "rich:text-sm rich:font-medium",
        textContent: options.icon,
      });
      ElementUtils.appendChild(button, iconSpan);
    }

    // 创建标签
    if (options.label) {
      const labelSpan = ElementUtils.createElement({
        tagName: "span",
        className: "rich:ml-1 rich:text-xs",
        textContent: options.label,
      });
      ElementUtils.appendChild(button, labelSpan);
    }
    return button;
  }

  /**
   * 创建图标按钮（带状态管理）
   */
  static createIconButtonWithState(
    options: ButtonStateOptions
  ): ButtonInstance {
    const eventManager = new EventManager();
    const button = ElementUtils.createElement({
      tagName: "button",
      className: `rich:inline-flex rich:items-center rich:justify-center rich:w-8 rich:h-8 rich:rounded hover:rich:bg-gray-100 focus:rich:outline-none focus:rich:ring-2 focus:rich:ring-blue-500 focus:rich:ring-offset-1 ${
        options.className || ""
      }`,
      id: options.id,
      attributes: {
        type: options.type || "button",
        ...(options.title && { title: options.title }),
      },
    }) as HTMLButtonElement;

    // 创建图标
    if (options.icon) {
      const iconSpan = ElementUtils.createElement({
        tagName: "span",
        className: "rich:text-sm rich:font-medium",
        textContent: options.icon,
      });
      ElementUtils.appendChild(button, iconSpan);
    }

    // 创建标签
    if (options.label) {
      const labelSpan = ElementUtils.createElement({
        tagName: "span",
        className: "rich:ml-1 rich:text-xs",
        textContent: options.label,
      });
      ElementUtils.appendChild(button, labelSpan);
    }

    // 绑定事件
    if (options.onClick) {
      eventManager.addEventListener(button, "click", (event) => {
        options.onClick!(event);
      });
    }

    // 更新状态函数
    const updateState = () => {
      if (options.isActive && options.isActive()) {
        button.classList.add("rich:bg-blue-100", "rich:text-blue-700");
        button.classList.remove("rich:text-gray-700");
      } else {
        button.classList.remove("rich:bg-blue-100", "rich:text-blue-700");
        button.classList.add("rich:text-gray-700");
      }

      if (options.isDisabled && options.isDisabled()) {
        button.disabled = true;
      } else {
        button.disabled = false;
      }
    };

    // 初始状态更新
    updateState();

    return {
      button,
      updateState,
      eventManager,
      destroy: () => {
        // 清理事件监听器
        eventManager.cleanup();
      },
    };
  }

  /**
   * 创建文本按钮（简单版本，无状态管理）
   */
  static createTextButton(options: ButtonOptions): HTMLButtonElement {
    const button = ElementUtils.createElement({
      tagName: "button",
      className: `rich:px-3 rich:py-1 rich:text-sm rich:rounded hover:rich:bg-gray-100 focus:rich:outline-none focus:rich:ring-2 focus:rich:ring-blue-500 focus:rich:ring-offset-1 ${
        options.className || ""
      }`,
      id: options.id,
      textContent: options.label,
      attributes: {
        type: options.type || "button",
        ...(options.title && { title: options.title }),
      },
    }) as HTMLButtonElement;
    return button;
  }

  /**
   * 创建文本按钮（带状态管理）
   */
  static createTextButtonWithState(
    options: ButtonStateOptions
  ): ButtonInstance {
    const eventManager = new EventManager();
    const button = ElementUtils.createElement({
      tagName: "button",
      className: `rich:px-3 rich:py-1 rich:text-sm rich:rounded hover:rich:bg-gray-100 focus:rich:outline-none focus:rich:ring-2 focus:rich:ring-blue-500 focus:rich:ring-offset-1 ${
        options.className || ""
      }`,
      id: options.id,
      textContent: options.label,
      attributes: {
        type: options.type || "button",
        ...(options.title && { title: options.title }),
      },
    }) as HTMLButtonElement;

    // 绑定事件
    if (options.onClick) {
      eventManager.addEventListener(button, "click", (event) => {
        options.onClick!(event);
      });
    }

    // 更新状态函数
    const updateState = () => {
      if (options.isActive && options.isActive()) {
        button.classList.add("rich:bg-blue-100", "rich:text-blue-700");
        button.classList.remove("rich:text-gray-700");
      } else {
        button.classList.remove("rich:bg-blue-100", "rich:text-blue-700");
        button.classList.add("rich:text-gray-700");
      }

      if (options.isDisabled && options.isDisabled()) {
        button.disabled = true;
      } else {
        button.disabled = false;
      }
    };

    // 初始状态更新
    updateState();

    return {
      button,
      updateState,
      eventManager,
      destroy: () => {
        // 清理事件监听器
        eventManager.cleanup();
      },
    };
  }

  /**
   * 创建紧凑按钮（简单版本，无状态管理）
   */
  static createCompactButton(options: ButtonOptions): HTMLButtonElement {
    const button = ElementUtils.createElement({
      tagName: "button",
      className: `rich:inline-flex rich:items-center rich:justify-center rich:w-6 rich:h-6 rich:rounded hover:rich:bg-gray-100 focus:rich:outline-none focus:rich:ring-1 focus:rich:ring-blue-500 rich:text-xs ${
        options.className || ""
      }`,
      id: options.id,
      textContent: options.icon,
      attributes: {
        type: options.type || "button",
        ...(options.title && { title: options.title }),
      },
    }) as HTMLButtonElement;
    return button;
  }

  /**
   * 创建紧凑按钮（带状态管理）
   */
  static createCompactButtonWithState(
    options: ButtonStateOptions
  ): ButtonInstance {
    const eventManager = new EventManager();
    const button = ElementUtils.createElement({
      tagName: "button",
      className: `rich:inline-flex rich:items-center rich:justify-center rich:w-6 rich:h-6 rich:rounded hover:rich:bg-gray-100 focus:rich:outline-none focus:rich:ring-1 focus:rich:ring-blue-500 rich:text-xs ${
        options.className || ""
      }`,
      id: options.id,
      textContent: options.icon,
      attributes: {
        type: options.type || "button",
        ...(options.title && { title: options.title }),
      },
    }) as HTMLButtonElement;

    // 绑定事件
    if (options.onClick) {
      eventManager.addEventListener(button, "click", (event) => {
        options.onClick!(event);
      });
    }

    // 更新状态函数
    const updateState = () => {
      if (options.isActive && options.isActive()) {
        button.classList.add("rich:bg-blue-100", "rich:text-blue-700");
        button.classList.remove("rich:text-gray-700");
      } else {
        button.classList.remove("rich:bg-blue-100", "rich:text-blue-700");
        button.classList.add("rich:text-gray-700");
      }

      if (options.isDisabled && options.isDisabled()) {
        button.disabled = true;
      } else {
        button.disabled = false;
      }
    };

    // 初始状态更新
    updateState();

    return {
      button,
      updateState,
      eventManager,
      destroy: () => {
        // 清理事件监听器
        eventManager.cleanup();
      },
    };
  }
}
