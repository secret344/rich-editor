export declare class EventManager {
    private listeners;
    addEventListener(element: EventTarget, event: string, handler: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    removeEventListener(element: EventTarget, event: string, handler: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    addClickOutsideListener(targetElement: HTMLElement, callback: () => void, excludeElements?: HTMLElement[]): void;
    addKeydownListener(element: EventTarget, handler: (e: KeyboardEvent) => void, options?: boolean | AddEventListenerOptions): void;
    addResizeListener(handler: () => void): void;
    addScrollListener(element: EventTarget, handler: (e: Event) => void, options?: boolean | AddEventListenerOptions): void;
    addFocusListener(element: EventTarget, handler: (e: FocusEvent) => void, options?: boolean | AddEventListenerOptions): void;
    addBlurListener(element: EventTarget, handler: (e: FocusEvent) => void, options?: boolean | AddEventListenerOptions): void;
    addMouseListener(element: EventTarget, event: 'mousedown' | 'mouseup' | 'mousemove' | 'mouseenter' | 'mouseleave', handler: (e: MouseEvent) => void, options?: boolean | AddEventListenerOptions): void;
    addTouchListener(element: EventTarget, event: 'touchstart' | 'touchend' | 'touchmove', handler: (e: TouchEvent) => void, options?: boolean | AddEventListenerOptions): void;
    cleanup(): void;
    getListenerCount(): number;
    hasListenersFor(element: EventTarget): boolean;
    cleanupForElement(element: EventTarget): void;
}
