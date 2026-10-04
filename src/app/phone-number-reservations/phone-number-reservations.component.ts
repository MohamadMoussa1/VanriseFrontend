import { Component, OnInit, ViewChild, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { PhoneNumberReservationService } from '../services/phone-number-reservation.service';
import { PhoneNumberReservation } from '../models/phone-number-reservation.model';
import { ClientSelectorComponent } from '../shared/client-selector/client-selector.component';
import { PhoneNumberSelectorComponent } from '../shared/phone-number-selector/phone-number-selector.component';

@Component({
  selector: 'app-phone-number-reservations',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    RouterLinkActive,
    ClientSelectorComponent,
    PhoneNumberSelectorComponent
  ],
  templateUrl: './phone-number-reservations.component.html',
  styleUrl: './phone-number-reservations.component.css'
})
export class PhoneNumberReservationsComponent implements OnInit {
  private readonly reservationService = inject(PhoneNumberReservationService);
  private readonly cdr = inject(ChangeDetectorRef);

  @ViewChild('clientSelector') clientSelector?: ClientSelectorComponent;
  @ViewChild('phoneNumberSelector') phoneNumberSelector?: PhoneNumberSelectorComponent;

  reservations: PhoneNumberReservation[] = [];
  isLoading: boolean = false;
  errorMessage: string | null = null;

  // Filter state
  filterClientId: number | null = null;
  filterPhoneNumberId: number | null = null;

  ngOnInit(): void {
    this.loadReservations();
  }

  loadReservations(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.cdr.markForCheck();

    this.reservationService.getAllReservations().subscribe({
      next: (data) => {
        this.reservations = data || [];
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error fetching reservations:', err);
        this.errorMessage = 'Failed to load reservations from the server. Ensure the backend is running.';
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  onFilter(): void {
    const selectedClientId = this.clientSelector ? this.clientSelector.getData() : this.filterClientId;
    const selectedPhoneNumberId = this.phoneNumberSelector ? this.phoneNumberSelector.getData() : this.filterPhoneNumberId;

    if (
      (selectedClientId === null || selectedClientId === undefined) &&
      (selectedPhoneNumberId === null || selectedPhoneNumberId === undefined)
    ) {
      this.loadReservations();
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.cdr.markForCheck();

    this.reservationService.getFilteredReservations(selectedClientId, selectedPhoneNumberId).subscribe({
      next: (data) => {
        this.reservations = data || [];
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error filtering reservations:', err);
        this.errorMessage = 'Failed to filter reservations.';
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  resetFilter(): void {
    this.filterClientId = null;
    this.filterPhoneNumberId = null;
    this.loadReservations();
  }
}
