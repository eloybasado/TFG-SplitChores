import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TareasPageRoutingModule } from './tareas-routing.module';

import { TareasPage } from './tareas.page';
import { ComponentsModule } from 'src/app/components/components.module';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ComponentsModule,
    TareasPageRoutingModule
  ],
  declarations: [TareasPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class TareasPageModule {}
