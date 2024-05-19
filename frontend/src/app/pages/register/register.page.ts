import { Component } from '@angular/core';
import { Validators, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { UsuariosService } from 'src/app/services/usuarios.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage {
  public formSubmit = false;
  public waiting = false;
  public passEquals = true;
  public today:Date=new Date();
  public fechaMax:string='';
  public mensaje:string='';

  public registerForm = this.formBuilder.group({
    nombre: [ '', Validators.required ],
    apellidos: '',
    sexo: [ '', Validators.required ],
    fecNacimiento: [null, Validators.required],
    email: [ '', [Validators.required, Validators.email] ],
    password: [ '', Validators.required ],
    password2: [ '', Validators.required ],
  });

  constructor(private formBuilder: FormBuilder,
    private usuarioService: UsuariosService,
    private router: Router ) {

      this.today = new Date(this.today.getFullYear()-8, this.today.getMonth(), this.today.getDate(), 23, 59, 59);
      this.fechaMax = this.today.toISOString();
     }


  register() {
    this.formSubmit = true;
    if(!this.registerForm.valid) {
      console.warn('Errores en el formulario');
      this.mensaje='Rellena todos los campos con datos válidos'
      return;
    }else if(!this.passwordEquals()){
    this.mensaje='Las contraseñas no coinciden'
      return
    }

    this.waiting = true;
    this.usuarioService.register(this.registerForm.value)
      .subscribe(res => {
        this.waiting = false;
        this.router.navigateByUrl('/tareas');
      }, (err) => {
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
        this.waiting = false;
      });
  }


  passwordEquals() {
    this.passEquals = this.registerForm.get('password')!.value === this.registerForm.get('password2')!.value;
    if(this.passEquals===false){
    this.mensaje='Las contraseñas no coinciden'
    }

    return this.passEquals;
  }

  campoValido( campo: string) {
    return this.registerForm.get(campo)!.valid || !this.formSubmit;
  }

   togglePasswordVisibility(input:string) {
    var passwordInput = document.getElementById(input);
      if(passwordInput!==null){
        passwordInput.setAttribute("type", passwordInput.getAttribute("type") === "password" ? "text" : "password");

  }
}

}
