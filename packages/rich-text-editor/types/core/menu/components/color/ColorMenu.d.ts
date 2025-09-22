import { Editor } from '@tiptap/core';
import { EventManager } from '../../../../utils/EventManager';
export declare class ColorMenu {
    private editor;
    private eventManager;
    private container;
    private textColorPicker;
    private highlightColorPicker;
    private editorRoot;
    private textColorButton;
    private highlightColorButton;
    private textColorButtonInstance;
    private highlightColorButtonInstance;
    private textColorDisplay;
    private highlightColorDisplay;
    private editorEventCleanup;
    constructor(container: HTMLElement, editor: Editor, eventManager: EventManager, editorRoot: HTMLElement);
    private render;
    private initializePickers;
    private showTextColorPicker;
    private showHighlightColorPicker;
    private getCurrentTextColor;
    private getCurrentHighlightColor;
    private updateTextColorDisplay;
    private updateHighlightColorDisplay;
    destroy(): void;
}
