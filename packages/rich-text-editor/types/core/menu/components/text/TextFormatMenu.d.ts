import { Editor } from '@tiptap/core';
import { EventManager } from '../../../../utils/EventManager';
export declare class TextFormatMenu {
    private editor;
    private eventManager;
    private container;
    private buttonInstances;
    constructor(container: HTMLElement, editor: Editor, eventManager: EventManager);
    private render;
    private createButton;
    destroy(): void;
}
