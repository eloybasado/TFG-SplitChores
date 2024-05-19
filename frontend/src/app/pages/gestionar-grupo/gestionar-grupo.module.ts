import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GestionarGrupoPageRoutingModule } from './gestionar-grupo-routing.module';

import { GestionarGrupoPage } from './gestionar-grupo.page';
import { ComponentsModule } from 'src/app/components/components.module';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ComponentsModule,
    ReactiveFormsModule,
    RouterModule,
    HttpClientModule,
    GestionarGrupoPageRoutingModule
  ],
  declarations: [GestionarGrupoPage]
})
export class GestionarGrupoPageModule {}
