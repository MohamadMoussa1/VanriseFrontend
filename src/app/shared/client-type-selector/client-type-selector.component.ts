import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClientType } from '../../models/client.model';

export interface ClientTypeOption {
  value: number;
  label: string;
}

@Component({
  selector: 'app-client-type-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './client-type-selector.component.html',
  styleUrl: './client-type-selector.component.css'
})
export class ClientTypeSelectorComponent {
  @Input() selectedValue: number | null = null;
  @Input() showAllOption: boolean = false;
  @Input() allOptionLabel: string = 'All Types';
  @Input() id: string = '';
  @Input() name: string = 'clientType';
  @Input() required: boolean = false;
  @Input() disabled: boolean = false;
  @Input() selectClass: string = 'form-select';

  @Output() selectedValueChange = new EventEmitter<number | null>();
  @Output() selectionChange = new EventEmitter<number | null>();

  readonly clientTypeOptions: ClientTypeOption[] = [
    { value: ClientType.Individual, label: 'Individual' },
    { value: ClientType.Organization, label: 'Organization' }
  ];

  onValueChange(val: any): void {
    if (val === '' || val === null || val === undefined) {
      this.selectedValue = null;
    } else {
      this.selectedValue = Number(val);
    }
    this.selectedValueChange.emit(this.selectedValue);
    this.selectionChange.emit(this.selectedValue);
  }

  /**
   * Returns the currently selected Client Type value (0 for Individual, 1 for Organization),
   * or null if "All Types" / nothing is selected.
   */
  getData(): number | null {
    if (this.selectedValue === null || this.selectedValue === undefined || (this.selectedValue as any) === '') {
      return null;
    }
    return Number(this.selectedValue);
  }
}
