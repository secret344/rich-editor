import { BaseDropdownPanel, type BaseDropdownOptions } from '@/core/dom/dropdown/BaseDropdownPanel'
import { ElementUtils } from '@/core/dom/utils/ElementUtils'
import { TextUtils } from '@/core/dom/utils/TextUtils'

export interface TableSelectorOptions extends BaseDropdownOptions {
  onTableInsert: (rows: number, cols: number, hasHeader: boolean) => void
  onClose?: () => void
}

export class TableSelector extends BaseDropdownPanel {
  private gridContainer!: HTMLElement
  private selectedRows: number = 3
  private selectedCols: number = 3
  private maxRows: number = 10
  private maxCols: number = 10
  private currentHighlightRows: number = 0
  private currentHighlightCols: number = 0
  private cellCache: HTMLElement[][] = []
  private headerCheckbox!: HTMLInputElement
  private gridHint!: HTMLElement

  constructor(container: HTMLElement, options: TableSelectorOptions) {
    // 设置默认样式选项
    const defaultOptions: TableSelectorOptions = {
      ...options,
      position: 'center',
      width: options.width || 300,
      minWidth: options.minWidth || 300,
      className: `rich:p-4 ${options.className || ''}`,
      closeOnClickOutside: options.closeOnClickOutside !== false, // 默认启用
      closeOnEscape: options.closeOnEscape !== false // 默认启用
    }
    
    super(container, defaultOptions)
  }

  protected createContent(): void {
    ElementUtils.empty(this.panel)

    // 标题
    ElementUtils.createDiv({
      className: 'rich:text-sm rich:font-medium rich:text-gray-700 rich:mb-3',
      textContent: '插入表格',
      parent: this.panel
    })

    // 网格选择器
    this.createGridSelector()

    // 分隔线
    ElementUtils.createDiv({
      className: 'rich:border-t rich:border-gray-200 rich:my-4',
      parent: this.panel
    })

    // 表格属性
    this.createTableProperties()

    // 创建按钮
    this.createInsertButton()
  }

  private createGridSelector(): void {
    const gridTitle = ElementUtils.createElement({
      tagName: 'div',
      className: 'rich:text-xs rich:text-gray-600 rich:mb-2',
      textContent: '选择表格大小:'
    })
    ElementUtils.appendChild(this.panel, gridTitle)

    this.gridContainer = ElementUtils.createElement({
      tagName: 'div',
      className: 'grid-selector rich:grid rich:grid-cols-10 rich:gap-1 rich:mb-2'
    })
    ElementUtils.appendChild(this.panel, this.gridContainer)

    // 添加提示信息
    this.gridHint = ElementUtils.createElement({
      tagName: 'div',
      className: 'rich:text-xs rich:text-gray-500 rich:mb-3',
      textContent: '悬停查看大小，点击快速插入'
    })
    ElementUtils.appendChild(this.panel, this.gridHint)

    // 创建网格并建立缓存
    for (let row = 0; row < this.maxRows; row++) {
      this.cellCache[row] = []
      for (let col = 0; col < this.maxCols; col++) {
        const cell = ElementUtils.createElement({
          tagName: 'div',
          className: 'rich:w-4 rich:h-4 rich:border rich:border-gray-300 rich:bg-white hover:rich:bg-blue-100 rich:cursor-pointer rich:transition-colors rich:duration-150',
          attributes: {
            'data-row': row.toString(),
            'data-col': col.toString()
          }
        })
        
        cell.addEventListener('mouseenter', () => {
          this.highlightGrid(row + 1, col + 1)
        })
        
        cell.addEventListener('click', () => {
          this.selectGrid(row + 1, col + 1)
        })
        
        // 缓存单元格引用
        this.cellCache[row][col] = cell
        ElementUtils.appendChild(this.gridContainer, cell)
      }
    }

    // 重置网格选择
    this.gridContainer.addEventListener('mouseleave', () => {
      this.clearGridHighlight()
    })
  }

  private createTableProperties(): void {
    const propsTitle = ElementUtils.createElement({
      tagName: 'div',
      className: 'rich:text-xs rich:text-gray-600 rich:mb-2',
      textContent: '表格属性:'
    })
    ElementUtils.appendChild(this.panel, propsTitle)

    // 行数输入
    const rowsContainer = ElementUtils.createElement({
      tagName: 'div',
      className: 'rich:flex rich:items-center rich:gap-2 rich:mb-2'
    })
    
    const rowsLabel = ElementUtils.createElement({
      tagName: 'label',
      className: 'rich:text-xs rich:text-gray-600 rich:w-12',
      textContent: '行数:'
    })
    ElementUtils.appendChild(rowsContainer, rowsLabel)
    
    const rowsInput = ElementUtils.createElement({
      tagName: 'input',
      className: 'rich:flex-1 rich:px-2 rich:py-1 rich:text-xs rich:border rich:border-gray-300 rich:rounded focus:rich:outline-none focus:rich:ring-1 focus:rich:ring-blue-500',
      attributes: {
        type: 'number',
        min: '1',
        max: '20',
        value: '3'
      }
    }) as HTMLInputElement
    rowsInput.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement
      this.selectedRows = parseInt(target.value) || 0
      // 联动网格显示
      this.highlightGridFromInputs()
    })
    ElementUtils.appendChild(rowsContainer, rowsInput)
    ElementUtils.appendChild(this.panel, rowsContainer)

    // 列数输入
    const colsContainer = ElementUtils.createElement({
      tagName: 'div',
      className: 'rich:flex rich:items-center rich:gap-2 rich:mb-2'
    })
    
    const colsLabel = ElementUtils.createElement({
      tagName: 'label',
      className: 'rich:text-xs rich:text-gray-600 rich:w-12',
      textContent: '列数:'
    })
    ElementUtils.appendChild(colsContainer, colsLabel)
    
    const colsInput = ElementUtils.createElement({
      tagName: 'input',
      className: 'rich:flex-1 rich:px-2 rich:py-1 rich:text-xs rich:border rich:border-gray-300 rich:rounded focus:rich:outline-none focus:rich:ring-1 focus:rich:ring-blue-500',
      attributes: {
        type: 'number',
        min: '1',
        max: '20',
        value: '3'
      }
    }) as HTMLInputElement
    colsInput.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement
      this.selectedCols = parseInt(target.value) || 0
      // 联动网格显示
      this.highlightGridFromInputs()
    })
    ElementUtils.appendChild(colsContainer, colsInput)
    ElementUtils.appendChild(this.panel, colsContainer)

    // 包含表头复选框
    const headerContainer = ElementUtils.createElement({
      tagName: 'div',
      className: 'rich:flex rich:items-center rich:gap-2'
    })
    
    this.headerCheckbox = ElementUtils.createElement({
      tagName: 'input',
      className: 'rich:rounded',
      attributes: {
        type: 'checkbox',
        checked: 'true'
      }
    }) as HTMLInputElement
    ElementUtils.appendChild(headerContainer, this.headerCheckbox)
    
    const headerLabel = ElementUtils.createElement({
      tagName: 'label',
      className: 'rich:text-xs rich:text-gray-600 rich:cursor-pointer',
      textContent: '包含表头'
    })
    headerLabel.addEventListener('click', () => {
      this.headerCheckbox.checked = !this.headerCheckbox.checked
    })
    ElementUtils.appendChild(headerContainer, headerLabel)
    ElementUtils.appendChild(this.panel, headerContainer)
  }

  private createInsertButton(): void {
    const buttonContainer = ElementUtils.createElement({
      tagName: 'div',
      className: 'rich:mt-4'
    })
    
    const insertButton = ElementUtils.createElement({
      tagName: 'button',
      className: 'rich:w-full rich:px-3 rich:py-2 rich:text-sm rich:font-medium rich:text-white rich:bg-blue-600 rich:rounded-md hover:rich:bg-blue-700 focus:rich:outline-none focus:rich:ring-2 focus:rich:ring-blue-500',
      textContent: '创建表格'
    }) as HTMLButtonElement
    insertButton.addEventListener('click', () => {
      const hasHeader = this.getHeaderState();
      const rows = this.selectedRows || 3;
      const cols = this.selectedCols || 3;
      (this.options as TableSelectorOptions).onTableInsert(rows, cols, hasHeader);
      this.hide();
      if ((this.options as TableSelectorOptions).onClose) {
        (this.options as TableSelectorOptions).onClose!();
      }
    });
    
    ElementUtils.appendChild(buttonContainer, insertButton)
    ElementUtils.appendChild(this.panel, buttonContainer)
  }

  private highlightGrid(rows: number, cols: number): void {
    // 确保行列数在有效范围内
    const validRows = Math.min(Math.max(rows, 0), this.maxRows)
    const validCols = Math.min(Math.max(cols, 0), this.maxCols)
    
    // 如果高亮区域没有变化，直接返回
    if (validRows === this.currentHighlightRows && validCols === this.currentHighlightCols) {
      return
    }
    
    // 先清除超出新范围的高亮
    this.clearExcessHighlight(validRows, validCols)
    
    // 高亮新的区域，使用缓存避免 DOM 查询
    for (let row = 0; row < validRows; row++) {
      for (let col = 0; col < validCols; col++) {
        const cell = this.cellCache[row]?.[col]
        if (cell && !cell.classList.contains('rich:bg-blue-300')) {
          cell.classList.remove('rich:bg-white', 'hover:rich:bg-blue-100')
          cell.classList.add('rich:bg-blue-300', 'rich:border-blue-400')
        }
      }
    }
    
    // 更新当前高亮状态
    this.currentHighlightRows = validRows
    this.currentHighlightCols = validCols

    // 更新提示信息
    if (this.gridHint) {
      TextUtils.setText(this.gridHint, `${validRows} × ${validCols} 表格，点击快速插入`)
    }

    // 更新输入框
    this.updateInputValues(validRows, validCols)
  }

  private selectGrid(rows: number, cols: number): void {
    this.selectedRows = rows
    this.selectedCols = cols
    
    // 更新输入框
    this.updateInputValues(rows, cols)
    
    // 立即插入表格（快速选择）
    const hasHeader = this.getHeaderState();
    (this.options as TableSelectorOptions).onTableInsert(rows, cols, hasHeader);
    this.hide();
  }

  private updateInputValues(rows: number, cols: number): void {
    const inputs = ElementUtils.querySelectorAll<HTMLInputElement>('input[type="number"]', this.panel)
    const rowsInput = inputs[0]
    const colsInput = inputs[1]
    
    if (rowsInput) rowsInput.value = rows.toString()
    if (colsInput) colsInput.value = cols.toString()
  }

  private getHeaderState(): boolean {
    return this.headerCheckbox?.checked || false
  }

  private clearExcessHighlight(newRows: number, newCols: number): void {
    // 清除超出新范围的行，使用缓存避免 DOM 查询
    for (let row = newRows; row < this.currentHighlightRows; row++) {
      for (let col = 0; col < this.currentHighlightCols; col++) {
        const cell = this.cellCache[row]?.[col]
        if (cell) {
          cell.classList.remove('rich:bg-blue-300', 'rich:border-blue-400')
          cell.classList.add('rich:bg-white', 'hover:rich:bg-blue-100')
        }
      }
    }
    
    // 清除超出新范围的列，使用缓存避免 DOM 查询
    for (let row = 0; row < Math.min(newRows, this.currentHighlightRows); row++) {
      for (let col = newCols; col < this.currentHighlightCols; col++) {
        const cell = this.cellCache[row]?.[col]
        if (cell) {
          cell.classList.remove('rich:bg-blue-300', 'rich:border-blue-400')
          cell.classList.add('rich:bg-white', 'hover:rich:bg-blue-100')
        }
      }
    }
  }

  private highlightGridFromInputs(): void {
    // 限制在网格范围内
    const rows = Math.min(Math.max(this.selectedRows, 1), this.maxRows)
    const cols = Math.min(Math.max(this.selectedCols, 1), this.maxCols)
    
    if (rows > 0 && cols > 0) {
      this.highlightGrid(rows, cols)
    } else {
      this.clearGridHighlight()
    }
  }

  private clearGridHighlight(): void {
    // 只清除当前高亮的区域，避免操作所有单元格
    if (this.currentHighlightRows > 0 || this.currentHighlightCols > 0) {
      this.clearExcessHighlight(0, 0)
      this.currentHighlightRows = 0
      this.currentHighlightCols = 0
    }

    // 恢复默认提示信息
    if (this.gridHint) {
      TextUtils.setText(this.gridHint, '悬停查看大小，点击快速插入')
    }

    // 恢复默认输入框值
    this.updateInputValues(this.selectedRows, this.selectedCols)
  }

  // 继承基类的show、hide、toggle、destroy方法
}

