export interface FormElementOptions {
    id?: string;
    className?: string;
    name?: string;
    value?: string;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    readonly?: boolean;
    attributes?: Record<string, string>;
    parent?: HTMLElement;
}
export interface InputOptions extends FormElementOptions {
    type?: 'text' | 'password' | 'email' | 'url' | 'number' | 'tel' | 'search' | 'hidden' | 'file' | 'checkbox' | 'radio';
    min?: string | number;
    max?: string | number;
    step?: string | number;
    pattern?: string;
    autocomplete?: 'on' | 'off' | string;
    checked?: boolean;
}
export interface TextareaOptions extends FormElementOptions {
    rows?: number;
    cols?: number;
    wrap?: 'soft' | 'hard';
    resize?: 'none' | 'both' | 'horizontal' | 'vertical';
}
export interface SelectOptions extends FormElementOptions {
    multiple?: boolean;
    size?: number;
    options?: Array<{
        value: string;
        text: string;
        selected?: boolean;
    }>;
}
export interface ButtonOptions extends FormElementOptions {
    type?: 'button' | 'submit' | 'reset';
    textContent?: string;
}
export declare class FormUtils {
    static createInput(options?: InputOptions): HTMLInputElement;
    static createTextarea(options?: TextareaOptions): HTMLTextAreaElement;
    static createButton(options?: ButtonOptions): HTMLButtonElement;
    static createLabel(options?: {
        id?: string;
        className?: string;
        textContent?: string;
        htmlFor?: string;
        parent?: HTMLElement;
    }): HTMLLabelElement;
    static getValue(element: HTMLInputElement | HTMLTextAreaElement): string;
    static setValue(element: HTMLInputElement | HTMLTextAreaElement, value: string): void;
    static clearValue(element: HTMLInputElement | HTMLTextAreaElement): void;
    static setDisabled(element: HTMLInputElement | HTMLTextAreaElement | HTMLButtonElement, disabled: boolean): void;
    static setReadonly(element: HTMLInputElement | HTMLTextAreaElement, readonly: boolean): void;
    static setChecked(element: HTMLInputElement, checked: boolean): void;
    static isChecked(element: HTMLInputElement): boolean;
    static validate(element: HTMLInputElement | HTMLTextAreaElement): boolean;
    static getValidationMessage(element: HTMLInputElement | HTMLTextAreaElement): string;
    static setCustomValidity(element: HTMLInputElement | HTMLTextAreaElement, message: string): void;
    static focus(element: HTMLInputElement | HTMLTextAreaElement | HTMLButtonElement): void;
    static blur(element: HTMLInputElement | HTMLTextAreaElement | HTMLButtonElement): void;
    static select(element: HTMLInputElement | HTMLTextAreaElement): void;
    static setSelectionRange(element: HTMLInputElement | HTMLTextAreaElement, start: number, end: number): void;
}
