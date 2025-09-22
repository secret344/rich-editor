export declare class StyleUtils {
    static addClass(element: HTMLElement, className: string): void;
    static addClasses(element: HTMLElement, classNames: string[]): void;
    static removeClass(element: HTMLElement, className: string): void;
    static removeClasses(element: HTMLElement, classNames: string[]): void;
    static toggleClass(element: HTMLElement, className: string): boolean;
    static hasClass(element: HTMLElement, className: string): boolean;
    static replaceClass(element: HTMLElement, oldClass: string, newClass: string): void;
    static setClassName(element: HTMLElement, className: string): void;
    static getClassName(element: HTMLElement): string;
    static clearClasses(element: HTMLElement): void;
    static setStyle(element: HTMLElement, property: string, value: string): void;
    static setStyles(element: HTMLElement, styles: Record<string, string>): void;
    static getStyle(element: HTMLElement, property: string): string;
    static getComputedStyle(element: HTMLElement, property?: string): string | CSSStyleDeclaration;
    static removeStyle(element: HTMLElement, property: string): void;
    static clearStyles(element: HTMLElement): void;
    static setCSSVariable(element: HTMLElement, name: string, value: string): void;
    static getCSSVariable(element: HTMLElement, name: string): string;
    static show(element: HTMLElement, display?: string): void;
    static hide(element: HTMLElement): void;
    static toggleDisplay(element: HTMLElement, display?: string): boolean;
    static isVisible(element: HTMLElement): boolean;
    static setOpacity(element: HTMLElement, opacity: number): void;
    static setPosition(element: HTMLElement, position: {
        top?: string | number;
        left?: string | number;
        right?: string | number;
        bottom?: string | number;
        position?: 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky';
    }): void;
    static setSize(element: HTMLElement, size: {
        width?: string | number;
        height?: string | number;
        maxWidth?: string | number;
        maxHeight?: string | number;
        minWidth?: string | number;
        minHeight?: string | number;
    }): void;
}
