import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-phone-number-status-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './phone-number-status-selector.component.html',
  styleUrl: './phone-number-status-selector.component.css'
})
export class PhoneNumberStatusSelectorComponent {
  @Input() selectedValue: string | null = null;
  @Input() showAllOption: boolean = true;
  @Input() allOptionLabel: string = 'All Statuses';
  @Input() id: string = '';
  @Input() name: string = 'phoneNumbersStatus';
  @Input() disabled: boolean = false;
  @Input() selectClass: string = 'form-select';

  @Output() selectedValueChange = new EventEmitter<string | null>();
  @Output() selectionChange = new EventEmitter<string | null>();

  readonly statusOptions: string[] = ['Reserved', 'Unreserved'];

  onValueChange(val: any): void {
    if (val === '' || val === null || val === undefined) {
      this.selectedValue = null;
    } else {
      this.selectedValue = String(val);
    }
    this.selectedValueChange.emit(this.selectedValue);
    this.selectionChange.emit(this.selectedValue);
  }

  /**
   * Returns the currently selected Status ('Reserved' | 'Unreserved'),
   * or null if "All Statuses" / nothing is selected.
   */
  getData(): string | null {
    if (this.selectedValue === null || this.selectedValue === undefined || (this.selectedValue as any) === '') {
      return null;
    }
    return this.selectedValue;
  }
}
