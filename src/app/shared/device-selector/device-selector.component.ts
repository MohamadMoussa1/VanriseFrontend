import { Component, OnInit, Input, Output, EventEmitter, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DeviceService } from '../../services/device.service';
import { Device } from '../../models/device.model';

@Component({
  selector: 'app-device-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './device-selector.component.html',
  styleUrl: './device-selector.component.css'
})
export class DeviceSelectorComponent implements OnInit {
  private readonly deviceService = inject(DeviceService);
  private readonly cdr = inject(ChangeDetectorRef);

  @Input() selectedValue: number | null = null;
  @Input() showAllOption: boolean = false;
  @Input() allOptionLabel: string = 'All Devices';
  @Input() placeholder: string = 'Select a device';
  @Input() id: string = '';
  @Input() name: string = 'deviceId';
  @Input() required: boolean = false;
  @Input() disabled: boolean = false;
  @Input() selectClass: string = 'form-select';

  @Output() selectedValueChange = new EventEmitter<number | null>();
  @Output() selectionChange = new EventEmitter<number | null>();
  @Output() devicesLoaded = new EventEmitter<Device[]>();

  devices: Device[] = [];
  isLoading: boolean = false;
  errorMessage: string | null = null;

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
        this.devicesLoaded.emit(this.devices);
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error loading devices in DeviceSelectorComponent:', err);
        this.errorMessage = 'Failed to load devices.';
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
   * Returns the currently selected Device ID (number),
   * or null if "All Devices" / nothing is selected.
   */
  getData(): number | null {
    if (this.selectedValue === null || this.selectedValue === undefined || (this.selectedValue as any) === '') {
      return null;
    }
    return Number(this.selectedValue);
  }

  /**
   * Returns the currently selected Device object or null.
   */
  getSelectedDevice(): Device | null {
    const id = this.getData();
    if (id === null) return null;
    return this.devices.find((d) => d.id === id) || null;
  }
}
