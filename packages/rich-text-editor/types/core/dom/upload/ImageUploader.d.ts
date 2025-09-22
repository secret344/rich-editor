export interface ImageUploaderOptions {
    onImageSelect?: (file: File) => void;
    onImageUpload?: (file: File) => Promise<string>;
    accept?: string;
    multiple?: boolean;
    maxSize?: number;
    className?: string;
}
export declare class ImageUploader {
    private container;
    private options;
    private eventManager;
    private fileInput;
    constructor(container: HTMLElement, options?: ImageUploaderOptions);
    private createFileInput;
    private handleFileSelect;
    triggerSelect(): void;
    destroy(): void;
}
