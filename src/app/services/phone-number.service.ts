import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PhoneNumber, CreatePhoneNumberDto, UpdatePhoneNumberDto } from '../models/phone-number.model';

@Injectable({
  providedIn: 'root'
})
export class PhoneNumberService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'https://localhost:7178/api/PhoneNumbers';

  getAllPhoneNumbers(): Observable<PhoneNumber[]> {
    return this.http.get<PhoneNumber[]>(this.apiUrl);
  }

  getFilteredPhoneNumbers(number?: string, deviceId?: number | null): Observable<PhoneNumber[]> {
    let params = new HttpParams();

    if (number !== undefined && number !== null && number.trim() !== '') {
      params = params.set('number', number.trim());
    }

    if (deviceId !== undefined && deviceId !== null) {
      params = params.set('deviceId', deviceId.toString());
    }

    return this.http.get<PhoneNumber[]>(`${this.apiUrl}/filter`, { params });
  }

  addPhoneNumber(phoneNumber: CreatePhoneNumberDto): Observable<PhoneNumber> {
    return this.http.post<PhoneNumber>(this.apiUrl, phoneNumber);
  }

  updatePhoneNumber(phoneNumber: UpdatePhoneNumberDto): Observable<PhoneNumber> {
    return this.http.put<PhoneNumber>(this.apiUrl, phoneNumber);
  }
}
