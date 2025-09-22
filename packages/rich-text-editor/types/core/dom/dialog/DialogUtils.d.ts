export interface DialogOptions {
    title?: string;
    message?: string;
    placeholder?: string;
    defaultValue?: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm?: (value?: string) => void;
    onCancel?: () => void;
}
export declare class DialogUtils {
    static createPrompt(options?: DialogOptions): Promise<string | null>;
    static createConfirm(options?: DialogOptions): Promise<boolean>;
    static createFileDialog(options?: {
        accept?: string;
        multiple?: boolean;
        onFileSelect?: (files: FileList | null) => void;
    }): {
        destroy: () => void;
    };
    static createModal(options?: DialogOptions): {
        element: HTMLElement;
        destroy: () => void;
    };
}
