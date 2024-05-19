import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';
import { AuthGuard } from '../guards/auth.guard';
import { AjustesPage } from '../pages/ajustes/ajustes.page';

const routes: Routes = [
  {
    path: 'usuario',
    canActivate: [ AuthGuard ],
    data: {rol: ['USUARIO','SUBORDINADO']},
    component: TabsPage,
    
    children: [
      {
        path: 'inicio',
          canActivate: [ AuthGuard ],
          data: {
            rol: ['USUARIO','SUBORDINADO']},
        loadChildren: () => import('../pages/tareas/tareas.module').then(m => m.TareasPageModule)
      },
      {
        path: 'historial',
         canActivate: [ AuthGuard ],
         data: {
          rol: ['USUARIO','SUBORDINADO']},

        loadChildren: () => import('../pages/inicio/inicio.module').then(m => m.InicioPageModule)
      },
      {
        path: 'perfil',
         canActivate: [ AuthGuard ],
         data: {
          rol: ['USUARIO','SUBORDINADO']},

        loadChildren: () => import('../pages/perfil/perfil.module').then(m => m.PerfilPageModule)
      },
      {
        path: 'ajustes',
         canActivate: [ AuthGuard ],
         data: {
          rol: ['USUARIO','SUBORDINADO']},

        loadChildren: () => import('../pages/ajustes/ajustes.module').then(m => m.AjustesPageModule)
      },
      {
        path: 'comunidad',
         canActivate: [ AuthGuard ],
         data: {
          rol: ['USUARIO','SUBORDINADO']},

        loadChildren: () => import('../pages/comunidad/comunidad.module').then(m => m.ComunidadPageModule)
      },

      {
        path: '',
        redirectTo: '/usuario/inicio',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/usuario/inicio',
    pathMatch: 'full'
  }
];

@NgModule({
   imports: [RouterModule.forChild(routes)],
   exports: [RouterModule]
   //imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],

})
export class TabsPageRoutingModule {}
