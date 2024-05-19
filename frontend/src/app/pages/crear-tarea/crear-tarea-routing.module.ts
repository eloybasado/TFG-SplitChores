import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CrearTareaPage } from './crear-tarea.page';

const routes: Routes = [
  {
    path: '',
    component: CrearTareaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CrearTareaPageRoutingModule {}
