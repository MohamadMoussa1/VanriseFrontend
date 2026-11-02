import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { DevicesComponent } from './devices/devices.component';
import { ClientsComponent } from './clients/clients.component';
import { PhoneNumbersComponent } from './phone-numbers/phone-numbers.component';
import { PhoneNumberReservationsComponent } from './phone-number-reservations/phone-number-reservations.component';
import { ClientsPerTypeReportComponent } from './reports/clients-per-type-report/clients-per-type-report.component';
import { PhoneNumbersPerDeviceReportComponent } from './reports/phone-numbers-per-device-report/phone-numbers-per-device-report.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'devices', component: DevicesComponent, canActivate: [authGuard] },
  { path: 'clients', component: ClientsComponent, canActivate: [authGuard] },
  { path: 'phone-numbers', component: PhoneNumbersComponent, canActivate: [authGuard] },
  { path: 'phone-number-reservations', component: PhoneNumberReservationsComponent, canActivate: [authGuard] },
  { path: 'reservations', redirectTo: 'phone-number-reservations' },
  { path: 'reports/clients-per-type', component: ClientsPerTypeReportComponent, canActivate: [authGuard] },
  { path: 'reports/phone-numbers-per-device', component: PhoneNumbersPerDeviceReportComponent, canActivate: [authGuard] },
  { path: 'clients-per-type-report', redirectTo: 'reports/clients-per-type' },
  { path: 'phone-numbers-per-device-report', redirectTo: 'reports/phone-numbers-per-device' },
  { path: '**', redirectTo: 'login' }
];

