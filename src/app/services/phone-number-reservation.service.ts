import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PhoneNumberReservation } from '../models/phone-number-reservation.model';

@Injectable({
  providedIn: 'root'
})
export class PhoneNumberReservationService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'https://localhost:7178/api/PhoneNumberReservations';

  getAllReservations(): Observable<PhoneNumberReservation[]> {
    return this.http.get<PhoneNumberReservation[]>(this.apiUrl);
  }

  getFilteredReservations(clientId?: number | null, phoneNumberId?: number | null): Observable<PhoneNumberReservation[]> {
    let params = new HttpParams();

    if (clientId !== undefined && clientId !== null) {
      params = params.set('clientId', clientId.toString());
    }

    if (phoneNumberId !== undefined && phoneNumberId !== null) {
      params = params.set('phoneNumberId', phoneNumberId.toString());
    }

    return this.http.get<PhoneNumberReservation[]>(`${this.apiUrl}/filter`, { params });
  }
}
