export interface RichTextEditorOptions {
    content?: string;
    placeholder?: string;
    editable?: boolean;
    showToolbar?: boolean;
    toolbarOptions?: ToolbarOptions;
    onUpdate?: (content: string) => void;
    onSelectionUpdate?: (selection: {
        from: number;
        to: number;
        empty: boolean;
    }) => void;
    onFocus?: () => void;
    onBlur?: () => void;
}
export interface ToolbarOptions {
    showTextFormat?: boolean;
    showHeadings?: boolean;
    showLists?: boolean;
    showBlocks?: boolean;
    showMedia?: boolean;
    showColors?: boolean;
    showTables?: boolean;
    showHistory?: boolean;
    showAlignment?: boolean;
    showSuperscriptSubscript?: boolean;
    showClearFormat?: boolean;
    showCodeBlock?: boolean;
    showBlockquote?: boolean;
    showFontSize?: boolean;
    showLineHeight?: boolean;
    codeBlockLanguages?: Array<{
        value: string;
        label: string;
    }>;
    customButtons?: ToolbarButton[];
    onImageUpload?: (file: File) => Promise<string>;
}
export interface ToolbarButton {
    id: string;
    label: string;
    icon?: string;
    title?: string;
    onClick: () => void;
    isActive?: () => boolean;
    isDisabled?: () => boolean;
}
export declare class RichTextEditor {
    private editor;
    private container;
    private options;
    private toolbar;
    private toolbarContainer;
    private eventManager;
    constructor(container: HTMLElement, options?: RichTextEditorOptions);
    private createToolbar;
    private destroyToolbar;
    getHTML(): string;
    setHTML(content: string): void;
    getText(): string;
    setText(text: string): void;
    clear(): void;
    focus(): void;
    blur(): void;
    isEmpty(): boolean;
    isFocused(): boolean;
    isEditable(): boolean;
    setEditable(editable: boolean): void;
    undo(): void;
    redo(): void;
    canUndo(): boolean;
    canRedo(): boolean;
    showToolbar(): void;
    hideToolbar(): void;
    updateToolbar(options: ToolbarOptions): void;
    destroy(): void;
    private cleanupEditorContainer;
    private handleImageFile;
    private fileToBase64;
}
