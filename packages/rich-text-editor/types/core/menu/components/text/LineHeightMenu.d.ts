import { Editor } from '@tiptap/core';
import { EventManager } from '../../../../utils/EventManager';
import { StateUpdatable } from '../../../../utils/StateManager';
export declare class LineHeightMenu implements StateUpdatable {
    private editor;
    private eventManager;
    private container;
    private editorRoot;
    private dropdown;
    private triggerButton;
    constructor(container: HTMLElement, editor: Editor, eventManager: EventManager, editorRoot: HTMLElement);
    private render;
    private getCurrentLineHeightDisplay;
    updateState(): void;
    destroy(): void;
}
