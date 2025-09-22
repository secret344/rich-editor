import { BaseDropdownPanel, BaseDropdownOptions } from './BaseDropdownPanel';
import { StateUpdatable } from '../../../utils/StateManager';
export interface DropdownMenuOptions extends BaseDropdownOptions {
    label: string;
    icon?: string;
    title?: string;
    disabled?: boolean;
    items?: DropdownMenuItem[];
    showLabel?: boolean;
    triggerButton?: HTMLElement;
}
export interface DropdownMenuItem {
    id?: string;
    label?: string;
    icon?: string;
    disabled?: boolean | (() => boolean);
    onClick?: () => void;
    className?: string;
    separator?: boolean;
    active?: () => boolean;
}
export declare class EnhancedDropdownMenu extends BaseDropdownPanel implements StateUpdatable {
    private button;
    private items;
    private buttonEventManager;
    private menuItemElements;
    constructor(container: HTMLElement, options: DropdownMenuOptions);
    updateState(): void;
    updateAllMenuItemsState(): void;
    protected createContent(): void;
    private bindButtonEvents;
    addItem(item: DropdownMenuItem): void;
    addItems(items: DropdownMenuItem[]): void;
    removeItem(id: string): void;
    clear(): void;
    private renderItems;
    private createMenuItem;
    private updateMenuItemState;
    private addSeparator;
    toggle(): void;
    show(): void;
    hide(): void;
    destroy(): void;
    get isMenuOpen(): boolean;
    setItems(items: DropdownMenuItem[]): void;
}
