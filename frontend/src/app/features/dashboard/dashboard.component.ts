import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  template: `
    <h1 class="text-2xl font-bold mb-4">Dashboard</h1>
    <p class="text-slate-500">Summary cards and charts will go here.</p>
  `,
})
export class DashboardComponent {}
