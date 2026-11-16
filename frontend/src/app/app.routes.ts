import { Routes } from '@angular/router';

export const routes: Routes = [
    { 
        path: 'tracks', 
        loadComponent: () => import('./tracks/tracks').then(m => m.Tracks) 
    },
    {
        path: 'album',
        loadComponent: () => import('./new-album/new-album').then(m => m.AlbumSelection)
    },
    { 
        path: 'album/:albumId', 
        loadComponent: () => import('./album/album').then(m => m.Album) 
    }
];
