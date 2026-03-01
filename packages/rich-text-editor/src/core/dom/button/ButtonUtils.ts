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

// ─── MD3 state class constants ────────────────────────────────────────────────
// Centralised here so all button variants stay in sync.
// Active state  → MD3 primary-container fill + on-primary-container text
const ACTIVE_CLASSES   = ["rich:bg-blue-100", "rich:text-blue-700"] as const;
const INACTIVE_CLASSES = ["rich:text-gray-700"] as const;

export class ButtonUtils {
  /**
   * 创建图标按钮（简单版本，无状态管理）
   * MD3 Icon Button: 36×36px, rounded-full, tonal hover
   */
  static createIconButton(options: ButtonOptions): HTMLButtonElement {
    const button = ElementUtils.createElement({
      tagName: "button",
      // MD3 icon button: 36px target, rounded, tonal hover, primary focus ring
      className: `rich:inline-flex rich:items-center rich:justify-center rich:w-9 rich:h-9 rich:rounded-lg rich:text-gray-700 hover:rich:bg-blue-50 focus:rich:outline-none focus:rich:ring-2 focus:rich:ring-blue-500 focus:rich:ring-offset-1 ${
        options.className || ""
      }`,
      id: options.id,
      attributes: {
        type: options.type || "button",
        ...(options.title && { title: options.title }),
      },
    }) as HTMLButtonElement;

    if (options.icon) {
      const iconSpan = ElementUtils.createElement({
        tagName: "span",
        className: "rich:text-sm rich:font-medium",
        textContent: options.icon,
      });
      ElementUtils.appendChild(button, iconSpan);
    }

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
   * MD3 Icon Button: 36×36px, rounded-lg, tonal hover, primary-container active
   */
  static createIconButtonWithState(
    options: ButtonStateOptions
  ): ButtonInstance {
    const eventManager = new EventManager();
    const button = ElementUtils.createElement({
      tagName: "button",
      className: `rich:inline-flex rich:items-center rich:justify-center rich:w-9 rich:h-9 rich:rounded-lg hover:rich:bg-blue-50 focus:rich:outline-none focus:rich:ring-2 focus:rich:ring-blue-500 focus:rich:ring-offset-1 ${
        options.className || ""
      }`,
      id: options.id,
      attributes: {
        type: options.type || "button",
        ...(options.title && { title: options.title }),
      },
    }) as HTMLButtonElement;

    if (options.icon) {
      const iconSpan = ElementUtils.createElement({
        tagName: "span",
        className: "rich:text-sm rich:font-medium",
        textContent: options.icon,
      });
      ElementUtils.appendChild(button, iconSpan);
    }

    if (options.label) {
      const labelSpan = ElementUtils.createElement({
        tagName: "span",
        className: "rich:ml-1 rich:text-xs",
        textContent: options.label,
      });
      ElementUtils.appendChild(button, labelSpan);
    }

    if (options.onClick) {
      eventManager.addEventListener(button, "click", (event) => {
        options.onClick!(event);
      });
    }

    const updateState = () => {
      if (options.isActive && options.isActive()) {
        button.classList.add(...ACTIVE_CLASSES);
        button.classList.remove(...INACTIVE_CLASSES);
      } else {
        button.classList.remove(...ACTIVE_CLASSES);
        button.classList.add(...INACTIVE_CLASSES);
      }

      button.disabled = !!(options.isDisabled && options.isDisabled());
    };

    updateState();

    return {
      button,
      updateState,
      eventManager,
      destroy: () => {
        eventManager.cleanup();
      },
    };
  }

  /**
   * 创建文本按钮（简单版本，无状态管理）
   * MD3 Text Button: px-3 py-1.5, rounded
   */
  static createTextButton(options: ButtonOptions): HTMLButtonElement {
    const button = ElementUtils.createElement({
      tagName: "button",
      className: `rich:px-3 rich:py-1.5 rich:text-sm rich:rounded-lg rich:text-gray-700 hover:rich:bg-blue-50 focus:rich:outline-none focus:rich:ring-2 focus:rich:ring-blue-500 focus:rich:ring-offset-1 ${
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
      className: `rich:px-3 rich:py-1.5 rich:text-sm rich:rounded-lg hover:rich:bg-blue-50 focus:rich:outline-none focus:rich:ring-2 focus:rich:ring-blue-500 focus:rich:ring-offset-1 ${
        options.className || ""
      }`,
      id: options.id,
      textContent: options.label,
      attributes: {
        type: options.type || "button",
        ...(options.title && { title: options.title }),
      },
    }) as HTMLButtonElement;

    if (options.onClick) {
      eventManager.addEventListener(button, "click", (event) => {
        options.onClick!(event);
      });
    }

    const updateState = () => {
      if (options.isActive && options.isActive()) {
        button.classList.add(...ACTIVE_CLASSES);
        button.classList.remove(...INACTIVE_CLASSES);
      } else {
        button.classList.remove(...ACTIVE_CLASSES);
        button.classList.add(...INACTIVE_CLASSES);
      }

      button.disabled = !!(options.isDisabled && options.isDisabled());
    };

    updateState();

    return {
      button,
      updateState,
      eventManager,
      destroy: () => {
        eventManager.cleanup();
      },
    };
  }

  /**
   * 创建紧凑按钮（简单版本，无状态管理）
   * MD3 Compact Icon Button: 28px, rounded
   */
  static createCompactButton(options: ButtonOptions): HTMLButtonElement {
    const button = ElementUtils.createElement({
      tagName: "button",
      className: `rich:inline-flex rich:items-center rich:justify-center rich:w-7 rich:h-7 rich:rounded-lg rich:text-gray-600 hover:rich:bg-blue-50 focus:rich:outline-none focus:rich:ring-1 focus:rich:ring-blue-500 rich:text-xs ${
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
      className: `rich:inline-flex rich:items-center rich:justify-center rich:w-7 rich:h-7 rich:rounded-lg hover:rich:bg-blue-50 focus:rich:outline-none focus:rich:ring-1 focus:rich:ring-blue-500 rich:text-xs ${
        options.className || ""
      }`,
      id: options.id,
      textContent: options.icon,
      attributes: {
        type: options.type || "button",
        ...(options.title && { title: options.title }),
      },
    }) as HTMLButtonElement;

    if (options.onClick) {
      eventManager.addEventListener(button, "click", (event) => {
        options.onClick!(event);
      });
    }

    const updateState = () => {
      if (options.isActive && options.isActive()) {
        button.classList.add(...ACTIVE_CLASSES);
        button.classList.remove(...INACTIVE_CLASSES);
      } else {
        button.classList.remove(...ACTIVE_CLASSES);
        button.classList.add(...INACTIVE_CLASSES);
      }

      button.disabled = !!(options.isDisabled && options.isDisabled());
    };

    updateState();

    return {
      button,
      updateState,
      eventManager,
      destroy: () => {
        eventManager.cleanup();
      },
    };
  }
}
