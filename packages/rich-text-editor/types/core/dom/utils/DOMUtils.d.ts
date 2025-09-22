import { ButtonOptions, SelectOptions, InputOptions, ContainerOptions, DialogOptions } from '..';
export interface FileDialogOptions {
    accept?: string;
    multiple?: boolean;
    onFileSelect?: (files: FileList | null) => void;
}
export declare class DOMUtils {
    static createButton(options: ButtonOptions): HTMLButtonElement;
    static createIconButton(options: ButtonOptions): HTMLButtonElement;
    static createCompactButton(options: ButtonOptions): HTMLButtonElement;
    static createSelect(options: SelectOptions): HTMLElement;
    static createInput(options: InputOptions): HTMLInputElement;
    static createTextarea(options: InputOptions): HTMLTextAreaElement;
    static createColorInput(options: InputOptions): HTMLInputElement;
    static createContainer(options?: ContainerOptions): HTMLElement;
    static createScrollContainer(options?: ContainerOptions): HTMLElement;
    static createDivider(): HTMLElement;
    static createGroup(options?: ContainerOptions): HTMLElement;
    static createToolbar(options?: ContainerOptions): HTMLElement;
    static createPrompt(message: string, defaultValue?: string): Promise<string | null>;
    static createConfirm(message: string): Promise<boolean>;
    static createFileDialog(options?: FileDialogOptions): {
        destroy: () => void;
    };
    static createModal(options?: DialogOptions): {
        element: HTMLElement;
        destroy: () => void;
    };
}
