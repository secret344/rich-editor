export interface SelectOption {
    value: string;
    label: string;
    text?: string;
    disabled?: boolean;
}
export interface SelectOptions {
    id?: string;
    placeholder?: string;
    options: SelectOption[];
    value?: string;
    onChange?: (value: string) => void;
    className?: string;
    disabled?: boolean;
    editorRoot?: HTMLElement;
}
export declare class SelectUtils {
    static createCustomSelect(options: SelectOptions): HTMLElement;
    static getValue(container: HTMLElement): string | undefined;
    static setValue(container: HTMLElement, value: string): void;
    static setOptions(container: HTMLElement, options: SelectOption[]): void;
    static setDisabled(container: HTMLElement, disabled: boolean): void;
    static destroy(container: HTMLElement): void;
}
