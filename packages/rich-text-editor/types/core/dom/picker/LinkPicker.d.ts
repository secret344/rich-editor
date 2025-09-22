import { BaseDropdownPanel, BaseDropdownOptions } from '../dropdown/BaseDropdownPanel';
export interface LinkPickerOptions extends BaseDropdownOptions {
    onLinkInsert?: (url: string, text?: string) => void;
    onLinkUpdate?: (url: string, text?: string) => void;
    onLinkRemove?: () => void;
    isEditing?: boolean;
    currentLink?: {
        href: string;
        text?: string;
    };
}
export declare class LinkPicker extends BaseDropdownPanel {
    private pickerOptions;
    constructor(container: HTMLElement, options: LinkPickerOptions);
    protected createContent(): void;
    updateOptions(options: Partial<LinkPickerOptions>): void;
}
