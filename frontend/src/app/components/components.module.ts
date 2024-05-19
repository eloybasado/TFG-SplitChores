import { NgModule } from '@angular/core';
// import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AppRoutingModule } from '../app-routing.module';
import { IonicModule } from '@ionic/angular';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

// import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
// import {MatMenuModule} from '@angular/material/menu';
// import {MatButtonModule} from '@angular/material/button';
// import {MatExpansionModule} from '@angular/material/expansion';
// import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TareaComponent } from './tarea/tarea.component';
import { UsuarioComponent } from './usuario/usuario.component';
import { CambiarAdminComponent } from './cambiar-admin/cambiar-admin.component';


@NgModule({
  declarations: [
    TareaComponent,
    UsuarioComponent,
    CambiarAdminComponent
  ],
  exports: [
    TareaComponent,
    UsuarioComponent,
    CambiarAdminComponent


  ],
  imports: [
    IonicModule,
    CommonModule,
     NgbModule,
    // BrowserAnimationsModule,
    // ReactiveFormsModule,
    // MatMenuModule,
    // MatButtonModule,
    // MatExpansionModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ComponentsModule { }
