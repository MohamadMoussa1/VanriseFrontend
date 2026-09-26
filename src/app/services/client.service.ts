import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Client, CreateClientDto, UpdateClientDto } from '../models/client.model';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'https://localhost:7178/api/Clients';

  getAllClients(): Observable<Client[]> {
    return this.http.get<Client[]>(this.apiUrl);
  }

  getFilteredClients(name?: string, type?: number | null): Observable<Client[]> {
    let params = new HttpParams();

    if (name !== undefined && name !== null && name.trim() !== '') {
      params = params.set('name', name.trim());
    }

    if (type !== undefined && type !== null) {
      params = params.set('type', type.toString());
    }

    return this.http.get<Client[]>(`${this.apiUrl}/filter`, { params });
  }

  addClient(client: CreateClientDto): Observable<Client> {
    return this.http.post<Client>(this.apiUrl, client);
  }

  updateClient(client: UpdateClientDto): Observable<Client> {
    return this.http.put<Client>(this.apiUrl, client);
  }
}
