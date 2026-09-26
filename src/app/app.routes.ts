import { Routes } from '@angular/router';
import { DevicesComponent } from './devices/devices.component';

export const routes: Routes = [
  { path: '', redirectTo: 'devices', pathMatch: 'full' },
  { path: 'devices', component: DevicesComponent }
];
