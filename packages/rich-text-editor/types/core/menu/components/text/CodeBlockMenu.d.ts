import { Editor } from '@tiptap/core';
import { EventManager } from '../../../../utils/EventManager';
export interface CodeBlockLanguage {
    value: string;
    label: string;
}
export interface CodeBlockMenuOptions {
    languages?: CodeBlockLanguage[];
}
export declare class CodeBlockMenu {
    private container;
    private editor;
    private codeBlockButtonInstance;
    private languageSelect;
    private editorEventCleanup;
    private languages;
    private editorRoot;
    private static readonly DEFAULT_LANGUAGES;
    constructor(container: HTMLElement, editor: Editor, _eventManager: EventManager, editorRoot: HTMLElement, options?: CodeBlockMenuOptions);
    private render;
    private toggleCodeBlock;
    private changeLanguage;
    private updateLanguageSelector;
    destroy(): void;
}
