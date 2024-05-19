import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GestionarGrupoPage } from './gestionar-grupo.page';

const routes: Routes = [
  {
    path: '',
    component: GestionarGrupoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GestionarGrupoPageRoutingModule {}
