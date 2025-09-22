import { Editor } from '@tiptap/core';
import { EventManager } from '../../../../utils/EventManager';
export interface ImageMenuOptions {
    onImageUpload?: (file: File) => Promise<string>;
}
export declare class ImageMenu {
    private editor;
    private eventManager;
    private container;
    private editorRoot;
    private options;
    private imageButton;
    private imageDropdown;
    private imageButtonInstance;
    private editorEventCleanup;
    constructor(container: HTMLElement, editor: Editor, eventManager: EventManager, editorRoot: HTMLElement, options?: ImageMenuOptions);
    private render;
    private initializeImageDropdown;
    private insertImage;
    private toggleImageDropdown;
    destroy(): void;
}
