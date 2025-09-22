import { Editor } from '@tiptap/core';
import { ToolbarOptions } from '../RichTextEditor';
export declare class MenuManager {
    private editor;
    private container;
    private options;
    private eventManager;
    private scrollContainer;
    private menuComponents;
    private editorRoot;
    private menuContainers;
    private editorEventCleanup;
    constructor(container: HTMLElement, editor: Editor, editorRoot: HTMLElement, options?: ToolbarOptions);
    private render;
    private renderMenuComponents;
    private renderDivider;
    private setupEditorStateListener;
    private updateMenuVisibility;
    destroy(): void;
}
