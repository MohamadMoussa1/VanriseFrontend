import { Component, OnInit, ViewChild, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClientService } from '../services/client.service';
import { Client, ClientType, CreateClientDto, UpdateClientDto } from '../models/client.model';
import { ClientTypeSelectorComponent } from '../shared/client-type-selector/client-type-selector.component';
import { PhoneNumberSelectorComponent } from '../shared/phone-number-selector/phone-number-selector.component';
import { PhoneNumberReservationService } from '../services/phone-number-reservation.service';
import { ActivePhoneNumberReservation } from '../models/phone-number-reservation.model';
import { NavbarComponent } from '../shared/navbar/navbar.component';
import { extractErrorMessage, extractSuccessMessage } from '../utils/error-handler.util';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ClientTypeSelectorComponent,
    PhoneNumberSelectorComponent,
    NavbarComponent
  ],
  templateUrl: './clients.component.html',
  styleUrl: './clients.component.css'
})
export class ClientsComponent implements OnInit {
  private readonly clientService = inject(ClientService);
  private readonly reservationService = inject(PhoneNumberReservationService);
  private readonly cdr = inject(ChangeDetectorRef);

  @ViewChild('filterTypeSelector') filterTypeSelector?: ClientTypeSelectorComponent;
  @ViewChild('modalTypeSelector') modalTypeSelector?: ClientTypeSelectorComponent;
  @ViewChild('reservePhoneSelector') reservePhoneSelector?: PhoneNumberSelectorComponent;
  @ViewChild('unreservePhoneSelector') unreservePhoneSelector?: PhoneNumberSelectorComponent;

  clients: Client[] = [];
  isLoading: boolean = false;
  isSaving: boolean = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  formError: string | null = null;

  // Filter state
  filterName: string = '';
  filterType: number | null = null; // null for all types, 0 for Individual, 1 for Organization

  // Add/Edit Modal State
  isModalOpen: boolean = false;
  isEditMode: boolean = false;
  selectedClientId: number | null = null;
  currentClientName: string = '';
  currentClientType: number = ClientType.Individual; // 0 = Individual, 1 = Organization
  currentBirthDate: string = '';

  // Reserve Modal State
  isReserveModalOpen: boolean = false;
  selectedClientForReservation: Client | null = null;
  selectedReservePhoneNumberId: number | null = null;
  isReserving: boolean = false;
  reserveError: string | null = null;

  // Unreserve Modal State
  isUnreserveModalOpen: boolean = false;
  selectedClientForUnreservation: Client | null = null;
  clientActiveReservations: ActivePhoneNumberReservation[] = [];
  selectedUnreservePhoneNumberId: number | null = null;
  isLoadingActiveNumbers: boolean = false;
  isUnreserving: boolean = false;
  unreserveError: string | null = null;

  readonly ClientType = ClientType;

  ngOnInit(): void {
    this.loadClients();
  }

  loadClients(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.cdr.markForCheck();

    this.clientService.getAllClients().subscribe({
      next: (data) => {
        this.clients = data || [];
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error fetching all clients:', err);
        this.errorMessage = extractErrorMessage(err, 'Failed to load clients from the server.');
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  onFilter(): void {
    const trimmedName = this.filterName.trim();
    const typeValue = this.filterTypeSelector ? this.filterTypeSelector.getData() : this.filterType;

    if (!trimmedName && (typeValue === null || typeValue === undefined)) {
      this.loadClients();
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.cdr.markForCheck();

    this.clientService.getFilteredClients(trimmedName || undefined, typeValue).subscribe({
      next: (data) => {
        this.clients = data || [];
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error filtering clients:', err);
        if (err.status === 404) {
          this.clients = [];
          this.errorMessage = extractErrorMessage(err, 'No clients found matching the filter criteria.');
        } else {
          this.errorMessage = extractErrorMessage(err, 'Failed to filter clients.');
        }
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  resetFilter(): void {
    this.filterName = '';
    this.filterType = null;
    this.loadClients();
  }

  openAddModal(): void {
    this.isEditMode = false;
    this.selectedClientId = null;
    this.currentClientName = '';
    this.currentClientType = ClientType.Individual;
    this.currentBirthDate = '';
    this.formError = null;
    this.isModalOpen = true;
    this.cdr.markForCheck();
  }

  openEditModal(client: Client): void {
    this.isEditMode = true;
    this.selectedClientId = client.id;
    this.currentClientName = client.name;
    
    // Check type (string "Organization" or enum/value 1)
    const isOrg =
      typeof client.type === 'string'
        ? client.type.toLowerCase() === 'organization'
        : Number(client.type) === ClientType.Organization;

    this.currentClientType = isOrg ? ClientType.Organization : ClientType.Individual;

    if (!isOrg && client.birthDate) {
      this.currentBirthDate = client.birthDate.substring(0, 10);
    } else {
      this.currentBirthDate = '';
    }

    this.formError = null;
    this.isModalOpen = true;
    this.cdr.markForCheck();
  }

  onTypeChange(newVal?: number | null): void {
    const selected = newVal !== undefined && newVal !== null ? newVal : this.currentClientType;
    if (Number(selected) === ClientType.Organization) {
      this.currentBirthDate = '';
    }
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.currentClientName = '';
    this.currentClientType = ClientType.Individual;
    this.currentBirthDate = '';
    this.selectedClientId = null;
    this.formError = null;
    this.isSaving = false;
    this.cdr.markForCheck();
  }

  saveClient(): void {
    if (this.isSaving) {
      return;
    }

    const trimmedName = this.currentClientName.trim();
    if (!trimmedName) {
      this.formError = 'Client Name is required.';
      this.cdr.markForCheck();
      return;
    }

    if (trimmedName.length > 255) {
      this.formError = 'Client Name cannot exceed 255 characters.';
      this.cdr.markForCheck();
      return;
    }

    const selectedType = this.modalTypeSelector ? this.modalTypeSelector.getData() : this.currentClientType;
    const typeNum = selectedType !== null && selectedType !== undefined ? Number(selectedType) : ClientType.Individual;
    let birthDateVal: string | null = null;

    if (typeNum === ClientType.Individual) {
      birthDateVal = this.currentBirthDate.trim() ? this.currentBirthDate.trim() : null;

      if (birthDateVal) {
        const birthDateObj = new Date(birthDateVal);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (birthDateObj > today) {
          this.formError = 'Birth date cannot be in the future.';
          this.cdr.markForCheck();
          return;
        }

        let age = today.getFullYear() - birthDateObj.getFullYear();
        const m = today.getMonth() - birthDateObj.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDateObj.getDate())) {
          age--;
        }

        if (age <= 18) {
          this.formError = 'Individual clients must be older than 18 years.';
          this.cdr.markForCheck();
          return;
        }
      }
    } else {
      // Organization clients must have a null BirthDate
      birthDateVal = null;
    }

    this.isSaving = true;
    this.formError = null;
    this.cdr.markForCheck();

    if (this.isEditMode && this.selectedClientId !== null) {
      const updatedClient: UpdateClientDto = {
        id: this.selectedClientId,
        name: trimmedName,
        type: typeNum,
        birthDate: birthDateVal
      };

      this.clientService.updateClient(updatedClient).subscribe({
        next: (res) => {
          this.isSaving = false;
          this.successMessage = extractSuccessMessage(res, 'Client updated successfully.');
          this.errorMessage = null;
          this.closeModal();
          this.loadClients();
        },
        error: (err) => {
          console.error('Error updating client:', err);
          this.isSaving = false;
          if (err.status === 404) {
            this.formError = extractErrorMessage(err, 'Client does not exist.');
          } else {
            this.formError = extractErrorMessage(err, 'Failed to update client. Please try again.');
          }
          this.cdr.markForCheck();
        }
      });
    } else {
      const newClient: CreateClientDto = {
        name: trimmedName,
        type: typeNum,
        birthDate: birthDateVal
      };

      this.clientService.addClient(newClient).subscribe({
        next: (res) => {
          this.isSaving = false;
          this.successMessage = extractSuccessMessage(res, 'Client added successfully.');
          this.errorMessage = null;
          this.closeModal();
          this.loadClients();
        },
        error: (err) => {
          console.error('Error adding client:', err);
          this.isSaving = false;
          this.formError = extractErrorMessage(err, 'Failed to add client. Please try again.');
          this.cdr.markForCheck();
        }
      });
    }
  }

  // ================= Reserve Phone Number Modal =================

  openReserveModal(client: Client): void {
    this.selectedClientForReservation = client;
    this.selectedReservePhoneNumberId = null;
    this.reserveError = null;
    this.isReserving = false;
    this.isReserveModalOpen = true;
    this.cdr.markForCheck();
  }

  closeReserveModal(): void {
    this.isReserveModalOpen = false;
    this.selectedClientForReservation = null;
    this.selectedReservePhoneNumberId = null;
    this.reserveError = null;
    this.isReserving = false;
    this.cdr.markForCheck();
  }

  saveReservation(): void {
    if (this.isReserving) return;

    const phoneNumberId = this.reservePhoneSelector ? this.reservePhoneSelector.getData() : this.selectedReservePhoneNumberId;
    if (!phoneNumberId) {
      this.reserveError = 'Please select a phone number.';
      this.cdr.markForCheck();
      return;
    }

    if (!this.selectedClientForReservation) {
      this.reserveError = 'No client selected.';
      this.cdr.markForCheck();
      return;
    }

    const clientId = this.selectedClientForReservation.id;
    this.isReserving = true;
    this.reserveError = null;
    this.cdr.markForCheck();

    this.reservationService.reservePhoneNumber(clientId, phoneNumberId).subscribe({
      next: (res) => {
        this.isReserving = false;
        this.closeReserveModal();
        this.successMessage = extractSuccessMessage(res, 'Phone number reserved successfully.');
        this.errorMessage = null;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error reserving phone number:', err);
        this.isReserving = false;
        this.reserveError = extractErrorMessage(err, 'Failed to reserve phone number. Please try again.');
        this.cdr.markForCheck();
      }
    });
  }

  // ================= Unreserve Phone Number Modal =================

  openUnreserveModal(client: Client): void {
    this.selectedClientForUnreservation = client;
    this.selectedUnreservePhoneNumberId = null;
    this.unreserveError = null;
    this.clientActiveReservations = [];
    this.isLoadingActiveNumbers = true;
    this.isUnreserving = false;
    this.isUnreserveModalOpen = true;
    this.cdr.markForCheck();

    this.reservationService.getActiveReservations(client.id).subscribe({
      next: (data) => {
        this.clientActiveReservations = data || [];
        this.isLoadingActiveNumbers = false;
        if (this.clientActiveReservations.length === 1) {
          this.selectedUnreservePhoneNumberId = this.clientActiveReservations[0].phoneNumberId;
        }
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error(`Error loading active reservations for client ${client.id}:`, err);
        this.isLoadingActiveNumbers = false;
        this.unreserveError = extractErrorMessage(err, 'Failed to load active reservations for this client.');
        this.cdr.markForCheck();
      }
    });
  }

  closeUnreserveModal(): void {
    this.isUnreserveModalOpen = false;
    this.selectedClientForUnreservation = null;
    this.selectedUnreservePhoneNumberId = null;
    this.clientActiveReservations = [];
    this.unreserveError = null;
    this.isLoadingActiveNumbers = false;
    this.isUnreserving = false;
    this.cdr.markForCheck();
  }

  confirmUnreserve(): void {
    if (this.isUnreserving) return;

    const phoneNumberId = this.unreservePhoneSelector ? this.unreservePhoneSelector.getData() : this.selectedUnreservePhoneNumberId;
    if (!phoneNumberId) {
      this.unreserveError = 'Please select a phone number to unreserve.';
      this.cdr.markForCheck();
      return;
    }

    if (!this.selectedClientForUnreservation) {
      this.unreserveError = 'No client selected.';
      this.cdr.markForCheck();
      return;
    }

    const clientId = this.selectedClientForUnreservation.id;
    this.isUnreserving = true;
    this.unreserveError = null;
    this.cdr.markForCheck();

    this.reservationService.unreservePhoneNumber(clientId, phoneNumberId).subscribe({
      next: (res) => {
        this.isUnreserving = false;
        this.closeUnreserveModal();
        this.successMessage = extractSuccessMessage(res, 'Phone number unreserved successfully.');
        this.errorMessage = null;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error unreserving phone number:', err);
        this.isUnreserving = false;
        this.unreserveError = extractErrorMessage(err, 'Failed to unreserve phone number. Please try again.');
        this.cdr.markForCheck();
      }
    });
  }
}
