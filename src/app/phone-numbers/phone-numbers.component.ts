import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { PhoneNumberService } from '../services/phone-number.service';
import { DeviceService } from '../services/device.service';
import { PhoneNumber, CreatePhoneNumberDto, UpdatePhoneNumberDto } from '../models/phone-number.model';
import { Device } from '../models/device.model';

@Component({
  selector: 'app-phone-numbers',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './phone-numbers.component.html',
  styleUrl: './phone-numbers.component.css'
})
export class PhoneNumbersComponent implements OnInit {
  private readonly phoneNumberService = inject(PhoneNumberService);
  private readonly deviceService = inject(DeviceService);
  private readonly cdr = inject(ChangeDetectorRef);

  phoneNumbers: PhoneNumber[] = [];
  devices: Device[] = [];

  isLoading: boolean = false;
  isSaving: boolean = false;
  errorMessage: string | null = null;
  formError: string | null = null;

  // Filter State
  filterNumber: string = '';
  filterDeviceId: string = ''; // '' for all devices

  // Modal State
  isModalOpen: boolean = false;
  isEditMode: boolean = false;
  selectedPhoneNumberId: number | null = null;
  currentNumber: string = '';
  selectedDeviceId: number | null = null;

  ngOnInit(): void {
    this.loadDevices();
    this.loadPhoneNumbers();
  }

  loadDevices(): void {
    this.deviceService.getAllDevices().subscribe({
      next: (data) => {
        this.devices = data || [];
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error fetching devices for phone numbers page:', err);
      }
    });
  }

  loadPhoneNumbers(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.cdr.markForCheck();

    this.phoneNumberService.getAllPhoneNumbers().subscribe({
      next: (data) => {
        this.phoneNumbers = data || [];
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error fetching phone numbers:', err);
        this.errorMessage = 'Failed to load phone numbers from the server. Ensure the backend is running.';
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  onFilter(): void {
    const trimmedNumber = this.filterNumber.trim();
    const deviceIdVal = this.filterDeviceId !== '' ? parseInt(this.filterDeviceId, 10) : null;

    if (!trimmedNumber && deviceIdVal === null) {
      this.loadPhoneNumbers();
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.cdr.markForCheck();

    this.phoneNumberService.getFilteredPhoneNumbers(trimmedNumber || undefined, deviceIdVal).subscribe({
      next: (data) => {
        this.phoneNumbers = data || [];
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error filtering phone numbers:', err);
        this.errorMessage = 'Failed to filter phone numbers.';
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  resetFilter(): void {
    this.filterNumber = '';
    this.filterDeviceId = '';
    this.loadPhoneNumbers();
  }

  openAddModal(): void {
    this.isEditMode = false;
    this.selectedPhoneNumberId = null;
    this.currentNumber = '';
    this.selectedDeviceId = this.devices.length > 0 ? this.devices[0].id : null;
    this.formError = null;
    this.isModalOpen = true;
    this.cdr.markForCheck();
  }

  openEditModal(phone: PhoneNumber): void {
    this.isEditMode = true;
    this.selectedPhoneNumberId = phone.id;
    this.currentNumber = phone.number;

    // Find matching device by device name
    const match = this.devices.find(
      (d) => d.name.trim().toLowerCase() === (phone.device || '').trim().toLowerCase()
    );
    this.selectedDeviceId = match ? match.id : (this.devices.length > 0 ? this.devices[0].id : null);

    this.formError = null;
    this.isModalOpen = true;
    this.cdr.markForCheck();
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.currentNumber = '';
    this.selectedPhoneNumberId = null;
    this.selectedDeviceId = null;
    this.formError = null;
    this.isSaving = false;
    this.cdr.markForCheck();
  }

  savePhoneNumber(): void {
    const trimmedNumber = this.currentNumber.trim();
    if (!trimmedNumber) {
      this.formError = 'Phone number is required.';
      this.cdr.markForCheck();
      return;
    }

    if (this.selectedDeviceId === null || this.selectedDeviceId === undefined) {
      this.formError = 'Please select a device.';
      this.cdr.markForCheck();
      return;
    }

    this.isSaving = true;
    this.formError = null;
    this.cdr.markForCheck();

    const deviceIdNum = Number(this.selectedDeviceId);

    if (this.isEditMode && this.selectedPhoneNumberId !== null) {
      const updatedPhone: UpdatePhoneNumberDto = {
        id: this.selectedPhoneNumberId,
        number: trimmedNumber,
        deviceId: deviceIdNum
      };

      this.phoneNumberService.updatePhoneNumber(updatedPhone).subscribe({
        next: () => {
          this.isSaving = false;
          this.closeModal();
          this.loadPhoneNumbers();
        },
        error: (err) => {
          console.error('Error updating phone number:', err);
          if (err.error?.errors) {
            console.error('Validation errors detail:', JSON.stringify(err.error.errors));
            const errorList = Object.entries(err.error.errors).map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`);
            this.formError = errorList.join(' | ') || err.error.title || 'Validation error.';
          } else if (err.error?.title) {
            this.formError = err.error.title;
          } else if (err.error?.message) {
            this.formError = err.error.message;
          } else {
            this.formError = 'Failed to update phone number. Please try again.';
          }
          this.isSaving = false;
          this.cdr.markForCheck();
        }
      });
    } else {
      const newPhone: CreatePhoneNumberDto = {
        number: trimmedNumber,
        deviceId: deviceIdNum
      };

      this.phoneNumberService.addPhoneNumber(newPhone).subscribe({
        next: () => {
          this.isSaving = false;
          this.closeModal();
          this.loadPhoneNumbers();
        },
        error: (err) => {
          console.error('Error adding phone number:', err);
          if (err.error?.errors) {
            console.error('Validation errors detail:', JSON.stringify(err.error.errors));
            const errorList = Object.entries(err.error.errors).map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`);
            this.formError = errorList.join(' | ') || err.error.title || 'Validation error.';
          } else if (err.error?.title) {
            this.formError = err.error.title;
          } else if (err.error?.message) {
            this.formError = err.error.message;
          } else {
            this.formError = 'Failed to add phone number. Please try again.';
          }
          this.isSaving = false;
          this.cdr.markForCheck();
        }
      });
    }
  }
}
