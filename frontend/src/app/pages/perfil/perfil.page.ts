import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators,FormArray, FormControl } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { Usuario } from 'src/app/models/usuario.models';
import { UsuariosService } from 'src/app/services/usuarios.service';
import { register } from 'swiper/element/bundle';
import Swiper from 'swiper';
import { NotificationsService } from 'src/app/services/notifications.service';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
})
export class PerfilPage  {
  usuarioForm = this.formBuilder.group({
    nombre: ['', Validators.required],
    apellidos: ['', Validators.required]

  })

  codigoForm = this.formBuilder.group({
    codigo: ['', Validators.required]
  })

  passwordForm = this.formBuilder.group({
    password: ['', Validators.required],
    newpassword: ['', Validators.required],
    newpassword2: ['', Validators.required]
  })

  public freeDialog = [
    {
      text: 'Convertir en independiente',
      role: 'destructive',
    },
    {
      text: 'Cancelar',
      role: 'cancel',
      data: {
        action: 'cancel',
      },
    },
  ];


  public isModalOpen = false;
  public isModalPasswordOpen = false;
  public isModalPhotoOpen = false;
  public isModalTypeOpen = false;
  public subordinados:Usuario[]=[];
  public codigo:string='';
  public isToastOpen: boolean=false;
  public mensaje:string='';
  public color:string='';
  public icon:string='';
  public uid:string='';
  public rol='';
  public avatar = '';
  public formSubmit = false;
  public waiting = false;
  public passEquals = true;
  public notificaciones: { isOpen: boolean, mensaje: string, icon:string, color:string }[] = [];

  constructor(private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private usuariosService: UsuariosService,
    private router: Router,
    private notificationsService: NotificationsService,


    ) { 

      this.uid = this.usuariosService.uid;
      this.rol = this.usuariosService.rol;
      this.avatar = this.usuariosService.avatar;
      
      this.usuarioForm.patchValue({
        //@ts-ignore
        nombre: this.usuariosService.nombre,
        //@ts-ignore
         apellidos: this.usuariosService.apellidos,

      });


      this.usuariosService.recuperarSubordinados(this.uid).subscribe((res)=>{
        //@ts-ignore
        this.subordinados=res['subordinados'];


      }, (err) => {
        console.warn('no se pudo recuperar los usuarios gestionados',err)

        return;
      });

      this.notificationsService.setSetOpenFunction(this.setNotificationOpen.bind(this));


    }
  

  async  ionViewWillEnter() {
      this.notificationsService.setSetOpenFunction(this.setNotificationOpen.bind(this));
    }

  actualizarNombre(){

      this.usuariosService.actualizarUsuario(this.uid,this.usuarioForm.get('nombre')!.value, this.usuarioForm.get('apellidos')!.value)
        .subscribe((res) => {
          
  
          this.router.navigateByUrl('/usuario/perfil').then(() => {
            this.notificationsService.lanzarNotificacion('editarNombre');
           
            
          });
  
        }, (err) => {
          this.notificationsService.lanzarNotificacion('error');
          return;
        });
    
  }


  //de momento lo dejo preparado pero ionic ya incopora esto nativamente
  validarFormulario() {
    let valid = true;

    if(this.usuarioForm.get('nombre')!.invalid) {
      document.getElementById('nombre')!.classList.add('is-invalid');
      valid = false;
    }
    return valid;
  }


  handleRefresh(event:any) {

    setTimeout(() => {

        this.usuariosService.validarToken().subscribe((res)=>{
          this.rol=this.usuariosService.rol;
        },(err)=>{
        this.notificationsService.lanzarNotificacion('error');

        });

      this.usuariosService.recuperarSubordinados(this.uid).subscribe((res)=>{
        //@ts-ignore
        this.subordinados=res['subordinados'];


      }, (err) => {
          console.log(err)

        return;
      });
      event.target.complete();
    }, 1000);
  }

  setOpen(isOpen: boolean, type:number) {
if(type===1){
  this.isModalOpen = isOpen;
    if(isOpen===true){
      this.codigo=this.generarCodigo();
      this.usuariosService.activarCodigo(this.uid,this.codigo).subscribe((res) =>{
        if(res){
          console.log('codigo activado para el usuario')
        }
      })
    }
    else{
      //borramos codigo de la bbdd
      this.usuariosService.desactivarCodigo(this.uid,this.codigo).subscribe((res) =>{
        if(res){
          console.log('codigo desactivado para el usuario')

          this.usuariosService.recuperarSubordinados(this.uid).subscribe((res)=>{
          //@ts-ignore
          if(res['subordinados'].length !== this.subordinados.length)
            this.notificationsService.lanzarNotificacion('addUsuarioGestionado');
            //@ts-ignore
            this.subordinados=res['subordinados'];

    
    
          }, (err) => {
            this.notificationsService.lanzarNotificacion('error');

            return;
          });
        }
      })
    }
  }
  else if(type===2){
    this.isModalTypeOpen = isOpen;

  }
  else if(type===3){
    this.isModalPhotoOpen = isOpen;

  }
  else if(type===4){
    this.isModalPasswordOpen = isOpen;

  }


  }



  generarCodigoAleatorio(longitud: number): string {
    const valoresCriptograficos = new Uint32Array(longitud / 2);
    crypto.getRandomValues(valoresCriptograficos);
  
    return Array.from(valoresCriptograficos, dec => dec.toString(16).padStart(8, '0')).join('').slice(0, longitud);
  }
  
  generarCodigo(): string {
    const longitudCodigo = 6; 
    return this.generarCodigoAleatorio(longitudCodigo);
  }


  convertirUsuario(){
    if(!this.validarFormulario()) {
  return;
}

let codigo = this.codigoForm.get('codigo')!.value
let usuario = this.uid;

//@ts-ignore
  this.enviarDatosConversion(codigo,usuario);

}

enviarDatosConversion(codigo:string, usuario:string) {
  this.usuariosService.convertirseDependiente(codigo,usuario)
    .subscribe((res) => {
      
      this.router.navigateByUrl('/usuario/perfil').then(() => {
        this.usuariosService.validarToken().subscribe((res)=>{
          this.rol=this.usuariosService.rol;
          this.setOpen(false,2)
        },(err)=>{
          console.log('ha ocurrido un error al actualizar tu usuario')
        });


      });
      this.notificationsService.lanzarNotificacion('convertirseGestionado');

    }, (err) => {
      this.notificationsService.lanzarNotificacion('error');

      return;
    });
  }

  liberarUsuario(subordinado:string){
     this.usuariosService.liberarUsuario(subordinado).subscribe((res)=>{
      this.router.navigateByUrl('/usuario/perfil').then(() => {
        this.usuariosService.recuperarSubordinados(this.uid).subscribe((res)=>{
          //@ts-ignore
          this.subordinados=res['subordinados'];
  
          this.notificationsService.lanzarNotificacion('liberarGestionado');
  
        }, (err) => {
          this.notificationsService.lanzarNotificacion('error');

          return;
        });

        this.setOpen(false,2);
      });
     }, (err) => {
      this.notificationsService.lanzarNotificacion('error');

      return;
    });

  }


  seleccionarAvatar(swiper: any){
    if (swiper) {
      // Obtener todos los elementos con la clase swiper-slide
var slides = document.querySelectorAll('.sj');

// Iterar sobre los slides para encontrar el que tiene la clase visible
var slideVisible;
slides.forEach(function(slide) {
    if (slide.classList.contains('swiper-slide-active')) {
        slideVisible = slide;
        return; // Detener la iteracion una vez que se encuentre el slide visible
    }
});

// Ahora slidevisible contiene el slide elegido
if (slideVisible) {
        // Obtener el primer hijo div del slideVisible
        //@ts-ignore
        var divChild = slideVisible.querySelector('div');

        if (divChild) {
            // Obtener el primer hijo img 
            var imgChild = divChild.querySelector('img');
    
            if (imgChild) {
                // Obtener el atributo src 
                var src = imgChild.getAttribute('src');

                this.usuariosService.cambiarAvatar(src).subscribe((res)=>{
                  this.router.navigateByUrl('/usuario/perfil').then(() => {
                    this.usuariosService.validarToken().subscribe((res)=>{
                      this.avatar=this.usuariosService.avatar;
                      this.setOpen(false,3);
                  this.notificationsService.lanzarNotificacion('cambiarAvatar');

                    },(err)=>{
                      console.log(err,'no se pudo cargar el nuevo avatar')
                  this.notificationsService.lanzarNotificacion('error');

                    })
                  });

                },(err)=>{
                  const errorMssg = err.error.msg || 'No se pudo completar la acción, vuelva a intentarlo más adelante';
                  // this.notificacionesService.mostrarNotificacion(errorMssg, 'danger');
                  return;
                });
            } else {
                console.log('No se encontro ninguna imagen dentro del div.');
            }
        } else {
            console.log('No se encontru ningun div dentro del slide visible.');
        }
} else {
    console.log('No se encontro ningun slide visible.');
}
    }
  }


  setNotificationOpen(isOpen: boolean, mensaje: string, icon:string, color:string) {
    this.isToastOpen = isOpen;
    this.mensaje=mensaje
    this.icon=icon;
    this.color=color;
   this.notificaciones.push({ isOpen, mensaje,icon,color });
 }

 cerrarNotificacion(index: number) {
   this.isToastOpen = false;
   this.notificaciones.splice(index, 1);
 }

 onActionSheetDismiss(data:any,usuario:string){
  if (data && data.detail.role === 'destructive') {
    console.log('Se seleccionó la opción echar');

      this.liberarUsuario(usuario);
  }  }

  enviarNotificacion(usuario:string){
    this.usuariosService.enviarNotificacion(usuario).subscribe((res)=>{
      this.notificationsService.lanzarNotificacion('notificacionEnviada');

    },(err)=>{
      console.log(err)
      this.notificationsService.lanzarNotificacion('error');
    });
  }


  cambiarPassword(){
    this.formSubmit = true;
    if(!this.passwordForm.valid) {
      console.warn('Errores en el formulario');
      this.mensaje='Rellena todos los campos con datos válidos'
      return;
    }else if(!this.passwordEquals()){
    this.mensaje='Las contraseñas no coinciden'
      return
    }

    this.waiting = true;
    this.usuariosService.cambiarPassword(this.passwordForm.value)
      .subscribe(res => {
        this.waiting = false;
        this.isModalPasswordOpen=false;
        this.notificationsService.lanzarNotificacion('password-cambiada');
        this.passwordForm.patchValue({
          //@ts-ignore
          password: null,
          //@ts-ignore
          newpassword: null,
          //@ts-ignore
           newpassword2: null

        });
        this.mensaje='';
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
    this.passEquals = this.passwordForm.get('newpassword')!.value === this.passwordForm.get('newpassword2')!.value;
    if(this.passEquals===false){
    this.mensaje='Las contraseñas no coinciden'
    }

    return this.passEquals;
  }

  togglePasswordVisibility(input:string) {
    var passwordInput = document.getElementById(input);
      if(passwordInput!==null){
        passwordInput.setAttribute("type", passwordInput.getAttribute("type") === "password" ? "text" : "password");

  }
}

}
