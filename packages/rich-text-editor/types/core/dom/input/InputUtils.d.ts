export interface InputOptions {
    id?: string;
    type?: string;
    placeholder?: string;
    value?: string;
    className?: string;
    disabled?: boolean;
    required?: boolean;
    onChange?: (value: string) => void;
    onFocus?: () => void;
    onBlur?: () => void;
}
export declare class InputUtils {
    static createTextInput(options: InputOptions): HTMLInputElement;
    static createTextarea(options: InputOptions): HTMLTextAreaElement;
    static createColorInput(options: InputOptions): HTMLInputElement;
}
