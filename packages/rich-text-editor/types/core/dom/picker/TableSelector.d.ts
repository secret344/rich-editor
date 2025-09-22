import { BaseDropdownPanel, BaseDropdownOptions } from '../dropdown/BaseDropdownPanel';
export interface TableSelectorOptions extends BaseDropdownOptions {
    onTableInsert: (rows: number, cols: number, hasHeader: boolean) => void;
    onClose?: () => void;
}
export declare class TableSelector extends BaseDropdownPanel {
    private gridContainer;
    private selectedRows;
    private selectedCols;
    private maxRows;
    private maxCols;
    private currentHighlightRows;
    private currentHighlightCols;
    private cellCache;
    private headerCheckbox;
    private gridHint;
    constructor(container: HTMLElement, options: TableSelectorOptions);
    protected createContent(): void;
    private createGridSelector;
    private createTableProperties;
    private createInsertButton;
    private highlightGrid;
    private selectGrid;
    private updateInputValues;
    private getHeaderState;
    private clearExcessHighlight;
    private highlightGridFromInputs;
    private clearGridHighlight;
}
