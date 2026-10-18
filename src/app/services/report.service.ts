import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ClientsPerTypeReportItem, PhoneNumbersPerDeviceReportItem } from '../models/report.model';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'https://localhost:7178/api/Reports';

  getClientsPerTypeReport(type?: number | null): Observable<ClientsPerTypeReportItem[]> {
    let params = new HttpParams();

    if (type !== undefined && type !== null) {
      params = params.set('type', type.toString());
    }

    return this.http.get<ClientsPerTypeReportItem[]>(`${this.apiUrl}/clients-per-type`, { params });
  }

  getPhoneNumbersPerDeviceReport(deviceId?: number | null, status?: string | null): Observable<PhoneNumbersPerDeviceReportItem[]> {
    let params = new HttpParams();

    if (deviceId !== undefined && deviceId !== null) {
      params = params.set('deviceId', deviceId.toString());
    }

    if (status !== undefined && status !== null && status.trim() !== '') {
      params = params.set('status', status.trim());
    }

    return this.http.get<PhoneNumbersPerDeviceReportItem[]>(`${this.apiUrl}/phone-numbers-per-device`, { params });
  }
}
