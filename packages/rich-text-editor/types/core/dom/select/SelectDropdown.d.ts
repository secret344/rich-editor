import { BaseDropdownPanel, BaseDropdownOptions } from '../dropdown/BaseDropdownPanel';
export interface SelectOption {
    value: string;
    label: string;
    text?: string;
    disabled?: boolean;
}
export interface SelectDropdownOptions extends Omit<BaseDropdownOptions, 'triggerButton'> {
    options: SelectOption[];
    value?: string;
    placeholder?: string;
    onChange?: (value: string) => void;
    className?: string;
    disabled?: boolean;
    triggerButton: HTMLElement;
}
export declare class SelectDropdown extends BaseDropdownPanel {
    protected selectOptions: SelectDropdownOptions;
    private selectedValue;
    private triggerButton;
    private buttonText;
    private triggerEventManager;
    constructor(container: HTMLElement, options: SelectDropdownOptions);
    private setupTriggerButton;
    private updateButtonText;
    protected createContent(): void;
    private selectOption;
    getValue(): string | undefined;
    setValue(value: string): void;
    setOptions(options: SelectOption[]): void;
    setDisabled(disabled: boolean): void;
    show(): void;
    destroy(): void;
}
