import { Routes } from '@angular/router';
import { DevicesComponent } from './devices/devices.component';
import { ClientsComponent } from './clients/clients.component';
import { PhoneNumbersComponent } from './phone-numbers/phone-numbers.component';

export const routes: Routes = [
  { path: '', redirectTo: 'devices', pathMatch: 'full' },
  { path: 'devices', component: DevicesComponent },
  { path: 'clients', component: ClientsComponent },
  { path: 'phone-numbers', component: PhoneNumbersComponent },
  { path: '**', redirectTo: 'devices' }
];
