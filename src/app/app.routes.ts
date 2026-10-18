import { Routes } from '@angular/router';
import { DevicesComponent } from './devices/devices.component';
import { ClientsComponent } from './clients/clients.component';
import { PhoneNumbersComponent } from './phone-numbers/phone-numbers.component';
import { PhoneNumberReservationsComponent } from './phone-number-reservations/phone-number-reservations.component';
import { ClientsPerTypeReportComponent } from './reports/clients-per-type-report/clients-per-type-report.component';
import { PhoneNumbersPerDeviceReportComponent } from './reports/phone-numbers-per-device-report/phone-numbers-per-device-report.component';

export const routes: Routes = [
  { path: '', redirectTo: 'devices', pathMatch: 'full' },
  { path: 'devices', component: DevicesComponent },
  { path: 'clients', component: ClientsComponent },
  { path: 'phone-numbers', component: PhoneNumbersComponent },
  { path: 'phone-number-reservations', component: PhoneNumberReservationsComponent },
  { path: 'reservations', redirectTo: 'phone-number-reservations' },
  { path: 'reports/clients-per-type', component: ClientsPerTypeReportComponent },
  { path: 'reports/phone-numbers-per-device', component: PhoneNumbersPerDeviceReportComponent },
  { path: 'clients-per-type-report', redirectTo: 'reports/clients-per-type' },
  { path: 'phone-numbers-per-device-report', redirectTo: 'reports/phone-numbers-per-device' },
  { path: '**', redirectTo: 'devices' }
];

