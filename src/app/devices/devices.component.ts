import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { DeviceService } from '../services/device.service';
import { Device } from '../models/device.model';

@Component({
  selector: 'app-devices',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './devices.component.html',
  styleUrl: './devices.component.css'
})
export class DevicesComponent implements OnInit {
  private readonly deviceService = inject(DeviceService);
  private readonly cdr = inject(ChangeDetectorRef);

  devices: Device[] = [];
  searchText: string = '';
  isLoading: boolean = false;
  isSaving: boolean = false;
  errorMessage: string | null = null;
  formError: string | null = null;

  // Modal State
  isModalOpen: boolean = false;
  isEditMode: boolean = false;
  selectedDeviceId: number | null = null;
  currentDeviceName: string = '';

  ngOnInit(): void {
    this.loadDevices();
  }

  loadDevices(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.cdr.markForCheck();

    this.deviceService.getAllDevices().subscribe({
      next: (data) => {
        this.devices = data || [];
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error fetching all devices:', err);
        this.errorMessage = 'Failed to load devices from the server. Ensure the backend is running and CORS is enabled.';
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  onSearch(): void {
    const trimmed = this.searchText.trim();
    if (!trimmed) {
      this.loadDevices();
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.cdr.markForCheck();

    this.deviceService.getFilteredDevices(trimmed).subscribe({
      next: (data) => {
        this.devices = data || [];
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error filtering devices:', err);
        this.errorMessage = `Failed to filter devices for "${trimmed}".`;
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  openAddModal(): void {
    this.isEditMode = false;
    this.selectedDeviceId = null;
    this.currentDeviceName = '';
    this.formError = null;
    this.isModalOpen = true;
    this.cdr.markForCheck();
  }

  openEditModal(device: Device): void {
    this.isEditMode = true;
    this.selectedDeviceId = device.id;
    this.currentDeviceName = device.name;
    this.formError = null;
    this.isModalOpen = true;
    this.cdr.markForCheck();
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.currentDeviceName = '';
    this.selectedDeviceId = null;
    this.formError = null;
    this.isSaving = false;
    this.cdr.markForCheck();
  }

  saveDevice(): void {
    const trimmedName = this.currentDeviceName.trim();
    if (!trimmedName) {
      this.formError = 'Device name is required.';
      this.cdr.markForCheck();
      return;
    }

    this.isSaving = true;
    this.formError = null;
    this.cdr.markForCheck();

    if (this.isEditMode && this.selectedDeviceId !== null) {
      const updatedDevice: Device = {
        id: this.selectedDeviceId,
        name: trimmedName
      };

      this.deviceService.updateDevice(updatedDevice).subscribe({
        next: () => {
          this.isSaving = false;
          this.closeModal();
          this.loadDevices();
        },
        error: (err) => {
          console.error('Error updating device:', err);
          if (err.error?.errors) {
            console.error('Validation errors detail:', JSON.stringify(err.error.errors));
            const errorList = Object.entries(err.error.errors).map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`);
            this.formError = errorList.join(' | ') || err.error.title || 'Validation error.';
          } else if (err.error?.title) {
            this.formError = err.error.title;
          } else if (err.error?.message) {
            this.formError = err.error.message;
          } else {
            this.formError = 'Failed to update device. Please try again.';
          }
          this.isSaving = false;
          this.cdr.markForCheck();
        }
      });
    } else {
      const newDevice = {
        name: trimmedName
      };

      this.deviceService.addDevice(newDevice).subscribe({
        next: () => {
          this.isSaving = false;
          this.closeModal();
          this.loadDevices();
        },
        error: (err) => {
          console.error('Error adding device:', err);
          if (err.error?.errors) {
            console.error('Validation errors detail:', JSON.stringify(err.error.errors));
            const errorList = Object.entries(err.error.errors).map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`);
            this.formError = errorList.join(' | ') || err.error.title || 'Validation error.';
          } else if (err.error?.title) {
            this.formError = err.error.title;
          } else if (err.error?.message) {
            this.formError = err.error.message;
          } else {
            this.formError = 'Failed to add device. Please try again.';
          }
          this.isSaving = false;
          this.cdr.markForCheck();
        }
      });
    }
  }
}
