import { BaseDropdownPanel, BaseDropdownOptions } from '../dropdown/BaseDropdownPanel';
export interface ColorPickerOptions extends BaseDropdownOptions {
    type: 'text' | 'highlight';
    onColorSelect: (color: string) => void;
    onClose?: () => void;
    currentColor?: string;
}
export declare class ColorPicker extends BaseDropdownPanel {
    private colorGrid;
    private customColorInput;
    private readonly colors;
    constructor(container: HTMLElement, options: ColorPickerOptions);
    protected createContent(): void;
    private applyColor;
    private selectColor;
    updateCurrentColor(color: string): void;
}
