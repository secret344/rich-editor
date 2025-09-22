import { Editor } from '@tiptap/core';
import { EventManager } from '../../../../utils/EventManager';
export declare class TableMenu {
    private editor;
    private eventManager;
    private container;
    private tableSelector;
    private editorRoot;
    private tableButton;
    private tableButtonInstance;
    private editorEventCleanup;
    constructor(container: HTMLElement, editor: Editor, eventManager: EventManager, editorRoot: HTMLElement);
    private render;
    private initializeTableSelector;
    private showTableDialog;
    destroy(): void;
}
