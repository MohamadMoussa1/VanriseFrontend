import { Component, OnInit, Input, Output, EventEmitter, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClientService } from '../../services/client.service';
import { Client } from '../../models/client.model';

@Component({
  selector: 'app-client-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './client-selector.component.html',
  styleUrl: './client-selector.component.css'
})
export class ClientSelectorComponent implements OnInit {
  private readonly clientService = inject(ClientService);
  private readonly cdr = inject(ChangeDetectorRef);

  @Input() selectedValue: number | null = null;
  @Input() showAllOption: boolean = false;
  @Input() allOptionLabel: string = 'All Clients';
  @Input() placeholder: string = 'Select a client';
  @Input() id: string = '';
  @Input() name: string = 'clientId';
  @Input() required: boolean = false;
  @Input() disabled: boolean = false;
  @Input() selectClass: string = 'form-select';

  @Output() selectedValueChange = new EventEmitter<number | null>();
  @Output() selectionChange = new EventEmitter<number | null>();
  @Output() clientsLoaded = new EventEmitter<Client[]>();

  clients: Client[] = [];
  isLoading: boolean = false;
  errorMessage: string | null = null;

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
        this.clientsLoaded.emit(this.clients);
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error loading clients in ClientSelectorComponent:', err);
        this.errorMessage = 'Failed to load clients.';
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
   * Returns the currently selected Client ID (number),
   * or null if "All Clients" / nothing is selected.
   */
  getData(): number | null {
    if (this.selectedValue === null || this.selectedValue === undefined || (this.selectedValue as any) === '') {
      return null;
    }
    return Number(this.selectedValue);
  }

  /**
   * Returns the currently selected Client object or null.
   */
  getSelectedClient(): Client | null {
    const id = this.getData();
    if (id === null) return null;
    return this.clients.find((c) => c.id === id) || null;
  }
}
