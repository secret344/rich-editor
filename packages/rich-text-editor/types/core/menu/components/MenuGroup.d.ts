export interface MenuGroupOptions {
    label: string;
    icon?: string;
    items: MenuItem[];
    className?: string;
}
export interface MenuItem {
    id: string;
    label: string;
    icon?: string;
    title?: string;
    className?: string;
    onClick: () => void;
    isActive?: () => boolean;
    isDisabled?: () => boolean;
    type?: 'button' | 'separator';
}
export declare class MenuGroup {
    private container;
    private options;
    private editorRoot;
    private dropdown;
    constructor(container: HTMLElement, options: MenuGroupOptions, editorRoot: HTMLElement);
    private createMenuGroup;
    updateItemStates(): void;
    update(): void;
    destroy(): void;
}
