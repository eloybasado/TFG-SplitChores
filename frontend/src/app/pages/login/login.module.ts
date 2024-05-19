import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http'
import { IonicModule } from '@ionic/angular';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder } from '@angular/forms';

import { LoginPageRoutingModule } from './login-routing.module';

import { LoginPage } from './login.page';
import { Usuario } from '../../models/usuario.models';
import { UsuariosService } from 'src/app/services/usuarios.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    RouterModule,
    HttpClientModule,
    LoginPageRoutingModule
  ],
  providers:[
    UsuariosService
  ],
  declarations: [LoginPage]
})
export class LoginPageModule {}
