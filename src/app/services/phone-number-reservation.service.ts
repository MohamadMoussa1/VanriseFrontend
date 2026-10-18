import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PhoneNumberReservation, ActivePhoneNumberReservation } from '../models/phone-number-reservation.model';

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

  getActiveReservations(clientId: number): Observable<ActivePhoneNumberReservation[]> {
    return this.http.get<ActivePhoneNumberReservation[]>(`${this.apiUrl}/active/${clientId}`);
  }

  reservePhoneNumber(clientId: number, phoneNumberId: number): Observable<any> {
    const params = new HttpParams()
      .set('clientId', clientId.toString())
      .set('phoneNumberId', phoneNumberId.toString());

    return this.http.post(`${this.apiUrl}/reserve`, null, { params });
  }

  unreservePhoneNumber(clientId: number, phoneNumberId: number): Observable<any> {
    const params = new HttpParams()
      .set('clientId', clientId.toString())
      .set('phoneNumberId', phoneNumberId.toString());

    return this.http.put(`${this.apiUrl}/unreserve`, null, { params });
  }
}
