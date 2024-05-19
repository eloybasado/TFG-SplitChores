import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http'
import { IonicModule } from '@ionic/angular';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder } from '@angular/forms';


import { RegisterPageRoutingModule } from './register-routing.module';

import { RegisterPage } from './register.page';

import { UsuariosService } from 'src/app/services/usuarios.service';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    RouterModule,
    HttpClientModule,
    RegisterPageRoutingModule
  ],
  declarations: [RegisterPage],
  providers:[
    UsuariosService
  ],
})
export class RegisterPageModule {}
