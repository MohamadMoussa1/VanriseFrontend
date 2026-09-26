import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Device } from '../models/device.model';

@Injectable({
  providedIn: 'root'
})
export class DeviceService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'https://localhost:7178/api/Devices';

  getAllDevices(): Observable<Device[]> {
    return this.http.get<Device[]>(this.apiUrl);
  }

  getFilteredDevices(search: string): Observable<Device[]> {
    const params = new HttpParams().set('search', search.trim());
    return this.http.get<Device[]>(`${this.apiUrl}/filter`, { params });
  }

  addDevice(device: { name: string }): Observable<Device> {
    return this.http.post<Device>(this.apiUrl, device);
  }

  updateDevice(device: Device): Observable<Device> {
    return this.http.put<Device>(this.apiUrl, device);
  }
}
