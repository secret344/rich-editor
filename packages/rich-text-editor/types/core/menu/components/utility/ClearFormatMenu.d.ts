import { Editor } from '@tiptap/core';
import { EventManager } from '../../../../utils/EventManager';
export declare class ClearFormatMenu {
    private editor;
    private eventManager;
    private container;
    private editorEventCleanup;
    constructor(container: HTMLElement, editor: Editor, eventManager: EventManager);
    private render;
    private createButton;
    destroy(): void;
}
