export interface ContainerOptions {
    className?: string;
    id?: string;
    tag?: keyof HTMLElementTagNameMap;
    innerHTML?: string;
    textContent?: string;
    style?: string;
}
export declare class ContainerUtils {
    static createContainer(options?: ContainerOptions): HTMLElement;
    static createScrollContainer(options?: ContainerOptions): HTMLElement;
    static createDivider(): HTMLElement;
    static createGroup(options?: ContainerOptions): HTMLElement;
    static createToolbar(options?: ContainerOptions): HTMLElement;
}
