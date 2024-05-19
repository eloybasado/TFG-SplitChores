import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PerfilPageRoutingModule } from './perfil-routing.module';

import { PerfilPage } from './perfil.page';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { ComponentsModule } from 'src/app/components/components.module';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    RouterModule,
    ComponentsModule,
    HttpClientModule,
    PerfilPageRoutingModule
  ],
  declarations: [PerfilPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]

})
export class PerfilPageModule {}
