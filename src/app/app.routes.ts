import { Routes } from '@angular/router';
import { DevicesComponent } from './devices/devices.component';
import { ClientsComponent } from './clients/clients.component';
import { PhoneNumbersComponent } from './phone-numbers/phone-numbers.component';
import { PhoneNumberReservationsComponent } from './phone-number-reservations/phone-number-reservations.component';

export const routes: Routes = [
  { path: '', redirectTo: 'devices', pathMatch: 'full' },
  { path: 'devices', component: DevicesComponent },
  { path: 'clients', component: ClientsComponent },
  { path: 'phone-numbers', component: PhoneNumbersComponent },
  { path: 'phone-number-reservations', component: PhoneNumberReservationsComponent },
  { path: 'reservations', redirectTo: 'phone-number-reservations' },
  { path: '**', redirectTo: 'devices' }
];

