import { Editor } from '@tiptap/core';
import { EventManager } from '../../../../utils/EventManager';
import { StateUpdatable } from '../../../../utils/StateManager';
export declare class FontSizeMenu implements StateUpdatable {
    private editor;
    private eventManager;
    private container;
    private editorRoot;
    private dropdown;
    private triggerButton;
    constructor(container: HTMLElement, editor: Editor, eventManager: EventManager, editorRoot: HTMLElement);
    private render;
    private getCurrentFontSizeDisplay;
    updateState(): void;
    destroy(): void;
}
