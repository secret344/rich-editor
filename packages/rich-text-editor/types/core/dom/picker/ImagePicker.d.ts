import { BaseDropdownPanel, BaseDropdownOptions } from '../dropdown/BaseDropdownPanel';
export interface ImagePickerOptions extends BaseDropdownOptions {
    onImageSelect?: (src: string) => void;
    onImageUpload?: (file: File) => Promise<string>;
}
export declare class ImagePicker extends BaseDropdownPanel {
    private pickerOptions;
    private imageUploader;
    private activeFileReaders;
    constructor(container: HTMLElement, options: ImagePickerOptions);
    protected createContent(): void;
    private initializeImageUploader;
    private handleFileUpload;
    private insertImage;
    destroy(): void;
}
