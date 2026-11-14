import { Routes } from '@angular/router';

export const routes: Routes = [
    { 
        path: 'tracks', 
        loadComponent: () => import('./tracks/tracks').then(m => m.Tracks) 
    }
];
