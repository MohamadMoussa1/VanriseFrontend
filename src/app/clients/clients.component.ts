import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ClientService } from '../services/client.service';
import { Client, ClientType, CreateClientDto, UpdateClientDto } from '../models/client.model';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './clients.component.html',
  styleUrl: './clients.component.css'
})
export class ClientsComponent implements OnInit {
  private readonly clientService = inject(ClientService);
  private readonly cdr = inject(ChangeDetectorRef);

  clients: Client[] = [];
  isLoading: boolean = false;
  isSaving: boolean = false;
  errorMessage: string | null = null;
  formError: string | null = null;

  // Filter state
  filterName: string = '';
  filterType: string = ''; // '' for all, '0' for Individual, '1' for Organization

  // Modal State
  isModalOpen: boolean = false;
  isEditMode: boolean = false;
  selectedClientId: number | null = null;
  currentClientName: string = '';
  currentClientType: number = ClientType.Individual; // 0 = Individual, 1 = Organization
  currentBirthDate: string = '';

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
        this.errorMessage = 'Failed to load clients from the server. Ensure the backend is running.';
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  onFilter(): void {
    const trimmedName = this.filterName.trim();
    const typeValue = this.filterType !== '' ? parseInt(this.filterType, 10) : null;

    if (!trimmedName && typeValue === null) {
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
        this.errorMessage = 'Failed to filter clients.';
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  resetFilter(): void {
    this.filterName = '';
    this.filterType = '';
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

  onTypeChange(): void {
    if (Number(this.currentClientType) === ClientType.Organization) {
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
    const trimmedName = this.currentClientName.trim();
    if (!trimmedName) {
      this.formError = 'Client name is required.';
      this.cdr.markForCheck();
      return;
    }

    const typeNum = Number(this.currentClientType);
    let birthDateVal: string | null = null;

    if (typeNum === ClientType.Individual) {
      birthDateVal = this.currentBirthDate.trim() ? this.currentBirthDate.trim() : null;
    } else {
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
        next: () => {
          this.isSaving = false;
          this.closeModal();
          this.loadClients();
        },
        error: (err) => {
          console.error('Error updating client:', err);
          if (err.error?.errors) {
            console.error('Validation errors detail:', JSON.stringify(err.error.errors));
            const errorList = Object.entries(err.error.errors).map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`);
            this.formError = errorList.join(' | ') || err.error.title || 'Validation error.';
          } else if (err.error?.title) {
            this.formError = err.error.title;
          } else if (err.error?.message) {
            this.formError = err.error.message;
          } else {
            this.formError = 'Failed to update client. Please try again.';
          }
          this.isSaving = false;
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
        next: () => {
          this.isSaving = false;
          this.closeModal();
          this.loadClients();
        },
        error: (err) => {
          console.error('Error adding client:', err);
          if (err.error?.errors) {
            console.error('Validation errors detail:', JSON.stringify(err.error.errors));
            const errorList = Object.entries(err.error.errors).map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`);
            this.formError = errorList.join(' | ') || err.error.title || 'Validation error.';
          } else if (err.error?.title) {
            this.formError = err.error.title;
          } else if (err.error?.message) {
            this.formError = err.error.message;
          } else {
            this.formError = 'Failed to add client. Please try again.';
          }
          this.isSaving = false;
          this.cdr.markForCheck();
        }
      });
    }
  }
}
