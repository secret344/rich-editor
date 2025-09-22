import { Editor } from '@tiptap/core';
import { EventManager } from '../../../../utils/EventManager';
export declare class AlignmentMenu {
    private editor;
    private eventManager;
    private container;
    private editorRoot;
    private dropdown;
    constructor(container: HTMLElement, editor: Editor, eventManager: EventManager, editorRoot: HTMLElement);
    private render;
    destroy(): void;
}
