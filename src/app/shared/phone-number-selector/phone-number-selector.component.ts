import { Component, OnInit, Input, Output, EventEmitter, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PhoneNumberService } from '../../services/phone-number.service';
import { PhoneNumber } from '../../models/phone-number.model';

@Component({
  selector: 'app-phone-number-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './phone-number-selector.component.html',
  styleUrl: './phone-number-selector.component.css'
})
export class PhoneNumberSelectorComponent implements OnInit {
  private readonly phoneNumberService = inject(PhoneNumberService);
  private readonly cdr = inject(ChangeDetectorRef);

  @Input() selectedValue: number | null = null;
  @Input() showAllOption: boolean = false;
  @Input() allOptionLabel: string = 'All Phone Numbers';
  @Input() placeholder: string = 'Select a phone number';
  @Input() id: string = '';
  @Input() name: string = 'phoneNumberId';
  @Input() required: boolean = false;
  @Input() disabled: boolean = false;
  @Input() selectClass: string = 'form-select';

  @Input() set customPhoneNumbers(val: Array<{ id?: number; phoneNumberId?: number; number: string }> | null | undefined) {
    this._customPhoneNumbers = val
      ? val.map((item) => ({
          id: item.phoneNumberId !== undefined ? item.phoneNumberId : (item.id ?? 0),
          number: item.number,
          device: (item as any).device || ''
        }))
      : null;

    if (this._customPhoneNumbers !== null) {
      this.phoneNumbers = this._customPhoneNumbers;
      this.isLoading = false;
      this.phoneNumbersLoaded.emit(this.phoneNumbers);
      this.cdr.markForCheck();
    }
  }
  get customPhoneNumbers(): PhoneNumber[] | null {
    return this._customPhoneNumbers;
  }
  private _customPhoneNumbers: PhoneNumber[] | null = null;

  @Output() selectedValueChange = new EventEmitter<number | null>();
  @Output() selectionChange = new EventEmitter<number | null>();
  @Output() phoneNumbersLoaded = new EventEmitter<PhoneNumber[]>();

  phoneNumbers: PhoneNumber[] = [];
  isLoading: boolean = false;
  errorMessage: string | null = null;

  ngOnInit(): void {
    if (this._customPhoneNumbers !== null) {
      this.phoneNumbers = this._customPhoneNumbers;
    } else {
      this.loadPhoneNumbers();
    }
  }

  loadPhoneNumbers(): void {
    if (this._customPhoneNumbers !== null) {
      return;
    }
    this.isLoading = true;
    this.errorMessage = null;
    this.cdr.markForCheck();

    this.phoneNumberService.getAllPhoneNumbers().subscribe({
      next: (data) => {
        this.phoneNumbers = data || [];
        this.isLoading = false;
        this.phoneNumbersLoaded.emit(this.phoneNumbers);
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error loading phone numbers in PhoneNumberSelectorComponent:', err);
        this.errorMessage = 'Failed to load phone numbers.';
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

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
   * Returns the currently selected Phone Number ID (number),
   * or null if "All Phone Numbers" / nothing is selected.
   */
  getData(): number | null {
    if (this.selectedValue === null || this.selectedValue === undefined || (this.selectedValue as any) === '') {
      return null;
    }
    return Number(this.selectedValue);
  }

  /**
   * Returns the currently selected PhoneNumber object or null.
   */
  getSelectedPhoneNumber(): PhoneNumber | null {
    const id = this.getData();
    if (id === null) return null;
    return this.phoneNumbers.find((p) => p.id === id) || null;
  }
}
