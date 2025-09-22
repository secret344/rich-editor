import { EventManager } from '../../../utils/EventManager';
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
export declare class ButtonUtils {
    static createIconButton(options: ButtonOptions): HTMLButtonElement;
    static createIconButtonWithState(options: ButtonStateOptions): ButtonInstance;
    static createTextButton(options: ButtonOptions): HTMLButtonElement;
    static createTextButtonWithState(options: ButtonStateOptions): ButtonInstance;
    static createCompactButton(options: ButtonOptions): HTMLButtonElement;
    static createCompactButtonWithState(options: ButtonStateOptions): ButtonInstance;
}
