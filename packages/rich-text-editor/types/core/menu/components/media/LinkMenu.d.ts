import { Editor } from '@tiptap/core';
import { EventManager } from '../../../../utils/EventManager';
export declare class LinkMenu {
    private editor;
    private eventManager;
    private container;
    private editorRoot;
    private linkButton;
    private linkDropdown;
    private linkButtonInstance;
    private editorEventCleanup;
    constructor(container: HTMLElement, editor: Editor, eventManager: EventManager, editorRoot: HTMLElement);
    private render;
    private initializeLinkDropdown;
    private insertLinkWithText;
    private updateLink;
    private toggleLinkDropdown;
    destroy(): void;
}
