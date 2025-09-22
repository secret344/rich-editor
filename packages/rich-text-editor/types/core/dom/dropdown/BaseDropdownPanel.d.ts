import { EventManager } from '../../../utils/EventManager';
export interface BaseDropdownOptions {
    width?: string | number;
    height?: string | number;
    minWidth?: string | number;
    maxWidth?: string | number;
    maxHeight?: string | number;
    zIndex?: number;
    className?: string;
    position?: "bottom-left" | "bottom-right" | "top-left" | "top-right" | "center";
    offset?: {
        x: number;
        y: number;
    };
    closeOnClickOutside?: boolean;
    closeOnEscape?: boolean;
    show?: boolean;
    triggerButton?: HTMLElement;
    editorRoot: HTMLElement;
    forceWithinEditor?: boolean;
}
export declare abstract class BaseDropdownPanel {
    protected container: HTMLElement;
    protected options: BaseDropdownOptions;
    protected panel: HTMLElement;
    protected isVisible: boolean;
    protected isCreated: boolean;
    protected eventManager: EventManager;
    protected editorRoot: HTMLElement | null;
    protected resizeObserver: ResizeObserver | null;
    protected debouncedUpdatePosition: () => void;
    private static openMenus;
    constructor(container: HTMLElement, options: BaseDropdownOptions);
    setEditorRoot(editorRoot: HTMLElement): void;
    protected createPanel(): void;
    protected abstract createContent(): void;
    protected setupResizeObserver(): void;
    protected updatePosition(): Promise<void>;
    private updatePositionWithFloatingUI;
    protected bindEvents(): void;
    show(): void;
    hide(): void;
    toggle(): void;
    destroy(): void;
    get isPanelVisible(): boolean;
    get panelElement(): HTMLElement;
    static closeAllMenus(): void;
}
