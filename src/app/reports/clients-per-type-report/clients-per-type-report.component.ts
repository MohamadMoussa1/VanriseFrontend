import { Component, OnInit, ViewChild, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ReportService } from '../../services/report.service';
import { ClientsPerTypeReportItem } from '../../models/report.model';
import { ClientTypeSelectorComponent } from '../../shared/client-type-selector/client-type-selector.component';

@Component({
  selector: 'app-clients-per-type-report',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    RouterLinkActive,
    ClientTypeSelectorComponent
  ],
  templateUrl: './clients-per-type-report.component.html',
  styleUrl: './clients-per-type-report.component.css'
})
export class ClientsPerTypeReportComponent implements OnInit {
  private readonly reportService = inject(ReportService);
  private readonly cdr = inject(ChangeDetectorRef);

  @ViewChild('clientTypeSelector') clientTypeSelector?: ClientTypeSelectorComponent;

  reportData: ClientsPerTypeReportItem[] = [];
  isLoading: boolean = false;
  errorMessage: string | null = null;

  // Filter state (null = all types, 0 = Individual, 1 = Organization)
  filterType: number | null = null;

  ngOnInit(): void {
    this.loadReport();
  }

  loadReport(type?: number | null): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.cdr.markForCheck();

    this.reportService.getClientsPerTypeReport(type).subscribe({
      next: (data) => {
        this.reportData = data || [];
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error fetching clients per type report:', err);
        this.errorMessage = 'Failed to load report data from the server. Ensure the backend is running.';
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  onFilter(): void {
    const typeValue = this.clientTypeSelector ? this.clientTypeSelector.getData() : this.filterType;
    this.loadReport(typeValue);
  }

  resetFilter(): void {
    this.filterType = null;
    this.loadReport();
  }
}
