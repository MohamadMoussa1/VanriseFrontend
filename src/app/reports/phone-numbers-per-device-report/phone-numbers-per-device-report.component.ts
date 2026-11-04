import { Component, OnInit, ViewChild, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportService } from '../../services/report.service';
import { PhoneNumbersPerDeviceReportItem } from '../../models/report.model';
import { DeviceSelectorComponent } from '../../shared/device-selector/device-selector.component';
import { PhoneNumberStatusSelectorComponent } from '../../shared/phone-number-status-selector/phone-number-status-selector.component';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { extractErrorMessage } from '../../utils/error-handler.util';

@Component({
  selector: 'app-phone-numbers-per-device-report',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DeviceSelectorComponent,
    PhoneNumberStatusSelectorComponent,
    NavbarComponent
  ],
  templateUrl: './phone-numbers-per-device-report.component.html',
  styleUrl: './phone-numbers-per-device-report.component.css'
})
export class PhoneNumbersPerDeviceReportComponent implements OnInit {
  private readonly reportService = inject(ReportService);
  private readonly cdr = inject(ChangeDetectorRef);

  @ViewChild('deviceSelector') deviceSelector?: DeviceSelectorComponent;
  @ViewChild('statusSelector') statusSelector?: PhoneNumberStatusSelectorComponent;

  reportData: PhoneNumbersPerDeviceReportItem[] = [];
  isLoading: boolean = false;
  errorMessage: string | null = null;

  // Filter state
  filterDeviceId: number | null = null;
  filterStatus: string | null = null; // null for all, 'Reserved' or 'Unreserved'

  ngOnInit(): void {
    this.loadReport();
  }

  loadReport(deviceId?: number | null, status?: string | null): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.cdr.markForCheck();

    this.reportService.getPhoneNumbersPerDeviceReport(deviceId, status).subscribe({
      next: (data) => {
        this.reportData = data || [];
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error fetching phone numbers per device report:', err);
        if (err.status === 404) {
          this.reportData = [];
          this.errorMessage = extractErrorMessage(err, 'No report data found.');
        } else {
          this.errorMessage = extractErrorMessage(err, 'Failed to load report data from the server.');
        }
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  onFilter(): void {
    const selectedDeviceId = this.deviceSelector ? this.deviceSelector.getData() : this.filterDeviceId;
    const selectedStatus = this.statusSelector ? this.statusSelector.getData() : this.filterStatus;

    this.loadReport(selectedDeviceId, selectedStatus);
  }

  resetFilter(): void {
    this.filterDeviceId = null;
    this.filterStatus = null;
    this.loadReport();
  }
}
