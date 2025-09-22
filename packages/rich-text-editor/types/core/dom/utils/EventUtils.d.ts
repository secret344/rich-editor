export type EventCallback<T extends Event = Event> = (event: T) => void;
export interface EventListenerOptions {
    once?: boolean;
    passive?: boolean;
    capture?: boolean;
    signal?: AbortSignal;
}
export declare class EventUtils {
    static addEventListener<K extends keyof HTMLElementEventMap>(element: HTMLElement, type: K, listener: EventCallback<HTMLElementEventMap[K]>, options?: EventListenerOptions): void;
    static addEventListener(element: HTMLElement, type: string, listener: EventCallback, options?: EventListenerOptions): void;
    static removeEventListener<K extends keyof HTMLElementEventMap>(element: HTMLElement, type: K, listener: EventCallback<HTMLElementEventMap[K]>, options?: boolean | EventListenerOptions): void;
    static removeEventListener(element: HTMLElement, type: string, listener: EventCallback, options?: boolean | EventListenerOptions): void;
    static dispatchEvent(element: HTMLElement, event: Event): boolean;
    static triggerEvent(element: HTMLElement, type: string, detail?: unknown): boolean;
    static onClick(element: HTMLElement, listener: EventCallback<MouseEvent>, options?: EventListenerOptions): void;
    static onMouseEnter(element: HTMLElement, listener: EventCallback<MouseEvent>, options?: EventListenerOptions): void;
    static onMouseLeave(element: HTMLElement, listener: EventCallback<MouseEvent>, options?: EventListenerOptions): void;
    static onHover(element: HTMLElement, enterListener: EventCallback<MouseEvent>, leaveListener: EventCallback<MouseEvent>, options?: EventListenerOptions): void;
    static onFocus(element: HTMLElement, listener: EventCallback<FocusEvent>, options?: EventListenerOptions): void;
    static onBlur(element: HTMLElement, listener: EventCallback<FocusEvent>, options?: EventListenerOptions): void;
    static onInput(element: HTMLElement, listener: EventCallback<Event>, options?: EventListenerOptions): void;
    static onChange(element: HTMLElement, listener: EventCallback<Event>, options?: EventListenerOptions): void;
    static onKeyDown(element: HTMLElement, listener: EventCallback<KeyboardEvent>, options?: EventListenerOptions): void;
    static onKeyUp(element: HTMLElement, listener: EventCallback<KeyboardEvent>, options?: EventListenerOptions): void;
    static onKey(element: HTMLElement, key: string, listener: EventCallback<KeyboardEvent>, options?: EventListenerOptions): void;
    static onEnter(element: HTMLElement, listener: EventCallback<KeyboardEvent>, options?: EventListenerOptions): void;
    static onEscape(element: HTMLElement, listener: EventCallback<KeyboardEvent>, options?: EventListenerOptions): void;
    static onSubmit(element: HTMLFormElement, listener: EventCallback<SubmitEvent>, options?: EventListenerOptions): void;
    static onLoad(element: HTMLElement, listener: EventCallback<Event>, options?: EventListenerOptions): void;
    static onScroll(element: HTMLElement, listener: EventCallback<Event>, options?: EventListenerOptions): void;
    static onResize(element: HTMLElement, listener: EventCallback<Event>, options?: EventListenerOptions): void;
    static preventDefault(event: Event): void;
    static stopPropagation(event: Event): void;
    static stopEvent(event: Event): void;
    static delegate<K extends keyof HTMLElementEventMap>(container: HTMLElement, selector: string, type: K, listener: EventCallback<HTMLElementEventMap[K]>, options?: EventListenerOptions): void;
    static once<K extends keyof HTMLElementEventMap>(element: HTMLElement, type: K, listener: EventCallback<HTMLElementEventMap[K]>): void;
    static waitForEvent<K extends keyof HTMLElementEventMap>(element: HTMLElement, type: K, timeout?: number): Promise<HTMLElementEventMap[K]>;
}
