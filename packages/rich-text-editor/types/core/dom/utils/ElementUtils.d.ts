export interface ElementOptions {
    tagName: string;
    className?: string;
    id?: string;
    textContent?: string;
    innerHTML?: string;
    attributes?: Record<string, string>;
    children?: HTMLElement[];
    parent?: HTMLElement;
}
export declare class ElementUtils {
    static createElement(options: ElementOptions): HTMLElement;
    static createDiv(options?: Omit<ElementOptions, 'tagName'>): HTMLDivElement;
    static createSpan(options?: Omit<ElementOptions, 'tagName'>): HTMLSpanElement;
    static createLabel(options?: Omit<ElementOptions, 'tagName'>): HTMLLabelElement;
    static appendChild(parent: HTMLElement, child: HTMLElement): void;
    static appendChildren(parent: HTMLElement, children: HTMLElement[]): void;
    static removeChild(parent: HTMLElement, child: HTMLElement): void;
    static insertBefore(parent: HTMLElement, newElement: HTMLElement, referenceElement: HTMLElement): void;
    static remove(element: HTMLElement): void;
    static empty(element: HTMLElement): void;
    static querySelector<T extends HTMLElement = HTMLElement>(selector: string, parent?: HTMLElement | Document): T | null;
    static querySelectorAll<T extends HTMLElement = HTMLElement>(selector: string, parent?: HTMLElement | Document): NodeListOf<T>;
    static getElementById<T extends HTMLElement = HTMLElement>(id: string): T | null;
    static clone(element: HTMLElement, deep?: boolean): HTMLElement;
    static getParent(element: HTMLElement): HTMLElement | null;
    static getChildren(element: HTMLElement): HTMLElement[];
    static getSiblings(element: HTMLElement): HTMLElement[];
    static contains(parent: HTMLElement, child: HTMLElement): boolean;
    static getPosition(element: HTMLElement): {
        x: number;
        y: number;
    };
    static getSize(element: HTMLElement): {
        width: number;
        height: number;
    };
}
