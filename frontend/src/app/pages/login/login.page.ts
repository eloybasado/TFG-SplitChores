import { Component, OnInit } from '@angular/core';
import { Validators, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AlertController } from '@ionic/angular';
import { UsuariosService } from 'src/app/services/usuarios.service';
import { environment } from '../../../environments/environment';



@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  public email: string = '';
  public  password: string = '';
  public remember: boolean = false;
  public mensaje:string='';

  public formSubmit = false;
  public waiting = false;

  public loginForm = this.formBuilder.group({
    email: [localStorage.getItem('email') || '', [Validators.required, Validators.email] ],
    password: ['', Validators.required ],
    remember: [ false || localStorage.getItem('email') ]
  });

  constructor(private formBuilder: FormBuilder,
              private usuarioService: UsuariosService,
              private alertController: AlertController,
              private router: Router ) { }

             async login() {
                this.formSubmit = true;

                if (!this.loginForm.valid) {
                  console.warn('Errores en el formulario');
                  this.mensaje='email o contraseña incorrectos';
                  return;
                }
                this.waiting = true;
                this.usuarioService.login( this.loginForm.value)
                  .subscribe( (res) => {
                    if (this.loginForm.get('remember')!.value) {
                      localStorage.setItem('email', this.loginForm.get('email')!.value as string);
                    } else {
                      localStorage.removeItem('email');
                    }
                    this.waiting = false;
                    switch (this.usuarioService.rol) {
                       case 'ADMIN':
                         this.router.navigateByUrl('/admin/dashboard-admin');
                         break;
                       case 'USUARIO':
                         this.router.navigateByUrl('/usuario/inicio');
                         break;
                         case 'SUBORDINADO':
                          this.router.navigateByUrl('/usuario/inicio');
                          break;
                    }
                  }, async (err) => {
                    console.warn('Error respueta api:',err);
                    Swal.fire({
                      title: '¡Ha ocurrido un error!',
                      text: err.error.msg || 'No pudo completarse la acción, vuelva a intentarlo más tarde',
                      icon: 'error',
                      confirmButtonColor: '#b0569c',
                      confirmButtonText: 'Aceptar',
                      allowOutsideClick: false,
                      heightAuto: false
                    });

                    // const alert = await this.alertController.create({
                    //   header: 'Error al iniciar sesión',
                    //   subHeader: `Email o contraseña incorrecto`,
                    //   buttons: [
                    //     {
                    //       text: 'Entendido',
                    //       role: 'confirm',
                    //       cssClass: 'alert-button-danger',
                    //     }
                    //   ]
                    // })
                
                    // await alert.present();
                    this.waiting = false;
            
                  });
            
              }
            
              campoValido( campo: string) {
                return this.loginForm.get(campo)!.valid || !this.formSubmit;
              }
            
            }
