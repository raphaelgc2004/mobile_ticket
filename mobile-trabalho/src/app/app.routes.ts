import { Routes } from '@angular/router';
import { TabsPage } from './tabs/tabs.page';

export const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage, 
    children: [
      {
        path: 'totem',
        loadComponent: () => import('./pages/totem/totem.page').then(m => m.TotemPage)
      },
      {
        path: 'guiche',
        loadComponent: () => import('./pages/guiche/guiche.page').then(m => m.GuichePage)
      },
      {
        path: 'painel',
        loadComponent: () => import('./pages/painel/painel.page').then(m => m.PainelPage)
      },
      {
        path: '',
        redirectTo: '/tabs/totem',
        pathMatch: 'full',
      },
    ],
  },
  
  {
    path: '',
    redirectTo: '/tabs/totem',
    pathMatch: 'full',
  },
];