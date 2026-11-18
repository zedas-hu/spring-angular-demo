import { Routes } from '@angular/router';

export const routes: Routes = [
    { 
        path: '', 
        redirectTo: '/tracks',
        pathMatch: 'full'
    },
    { 
        path: 'tracks', 
        loadComponent: () => import('./tracks/tracks').then(m => m.Tracks) 
    },
    { 
        path: 'albums/:albumId', 
        loadComponent: () => import('./album/album').then(m => m.Album) 
    }
];
