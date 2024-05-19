import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { TabsPageRoutingModule } from './tabs/tabs-routing.module';
import { AuthGuard } from './guards/auth.guard';
import { NoauthGuard } from './guards/noauth.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/usuario/inicio',pathMatch:'full'
  },
  {
    path: 'login',
    canActivate: [ NoauthGuard ],
    loadChildren: () => import('./pages/login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'register',
    canActivate: [ NoauthGuard ],
    loadChildren: () => import('./pages/register/register.module').then( m => m.RegisterPageModule)
  },
  {
    path: 'usuario/tareas/crear-tarea',
    canActivate: [ AuthGuard ],
    data: {
      rol: 'USUARIO'},
    loadChildren: () => import('./pages/crear-tarea/crear-tarea.module').then( m => m.CrearTareaPageModule)
  },
  {
    path: 'usuario/comunidad/gestionar-grupo',
    canActivate: [ AuthGuard ],
    data: {
      rol: 'USUARIO'},
      loadChildren: () => import('./pages/gestionar-grupo/gestionar-grupo.module').then( m => m.GestionarGrupoPageModule)

  },
  {
    path: '**',
    redirectTo: '/usuario/inicio',
    pathMatch: 'full'
  }


];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
     TabsPageRoutingModule
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
