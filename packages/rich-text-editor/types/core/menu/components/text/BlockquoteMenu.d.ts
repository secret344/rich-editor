import { Editor } from '@tiptap/core';
import { EventManager } from '../../../../utils/EventManager';
export declare class BlockquoteMenu {
    private container;
    private editor;
    private eventManager;
    private blockquoteButtonInstance;
    private editorEventCleanup;
    constructor(container: HTMLElement, editor: Editor, eventManager: EventManager);
    private render;
    private toggleBlockquote;
    destroy(): void;
}
