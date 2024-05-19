import { Component, Input, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { UsuariosService } from "src/app/services/usuarios.service";
import { GruposService } from "src/app/services/grupos.service";
import { Location } from '@angular/common';
import { Usuario } from "src/app/models/usuario.models";
import { Grupo } from "src/app/models/grupo.model";
import { ActionSheetController } from '@ionic/angular';
import { CambiarAdminComponent } from '../../components/cambiar-admin/cambiar-admin.component';
@Component({
  selector: 'app-comunidad',
  templateUrl: './comunidad.page.html',
  styleUrls: ['./comunidad.page.scss'],
})
export class ComunidadPage implements OnInit {
  groupForm = this.formBuilder.group({
    codigo: ['', Validators.required]
  })

  createGroupForm = this.formBuilder.group({
    nombre: ['', Validators.required]
  })

  @ViewChild(CambiarAdminComponent) cambiarAdminModal: CambiarAdminComponent | undefined;

  public idGrupo:string|null=null;
  public tipoGrupo: Number;
  public nombreGrupo:string='';
  public grupo: string;
  public isModalOpen = false;
  public isModalTypeOpen = false;
  public isModalCreateOpen = false;
  
  public codigo:string='';
  public subordinado: boolean=false;

  public usuariosGrupo:Usuario[]=[];

  public deleteDialog = [
    {
      text: 'Eliminar',
      role: 'destructive',
      handler: () => {
        this.eliminarGrupo();
      }
    },
    {
      text: 'Cancelar',
      role: 'cancel',
      data: {
        action: 'cancel',
      },
    },
  ];

  public exitDialog = [
    {
      text: 'Salir',
      role: 'destructive',
      handler: () => {
        this.salirGrupo();
      }
    },
    {
      text: 'Cancelar',
      role: 'cancel',
      data: {
        action: 'cancel',
      },
    },
  ];

  public exitDialogAdmin = [
    {
      text: 'Salir',
      role: 'destructive',
      handler: () => {
        this.salirGrupo();
      }
    },
    {
      text: 'Cancelar',
      role: 'cancel',
      data: {
        action: 'cancel',
      },
    },
  ];
  
  constructor(   private usuarioService: UsuariosService,
    private location: Location,
    private formBuilder: FormBuilder,
    private gruposService: GruposService,
    private actionSheetController: ActionSheetController,
    private router: Router) {
    this.tipoGrupo=0;
    this.grupo='';
    if(this.usuarioService.rol==='SUBORDINADO'){
      this.subordinado=true;
    }
     }

  ngOnInit(): void {

      this.gruposService
        .recuperarTipoGrupo(this.usuarioService.uid)
        .subscribe((res) => {
          if (res) {
            //@ts-ignore
            this.tipoGrupo = res['tipogrupo'];
            //@ts-ignore
            this.grupo = res['grupo'];
            //@ts-ignore
            this.nombreGrupo = res['nombre'];

            this.cargarUsuariosGrupo(this.grupo);
     
          }
        });

    
  }




  setOpen(isOpen: boolean, type:number) {
    if(type===1){
      this.isModalOpen = isOpen;

      if(isOpen===true){
        this.codigo=this.generarCodigo();
        this.gruposService.activarCodigo(this.grupo,this.codigo).subscribe((res) =>{
          if(res){
            console.log('codigo activado para el grupo')
          }
        })
      }
      else{
        //borramos codigo de la bbdd
        this.gruposService.desactivarCodigo(this.grupo,this.codigo).subscribe((res) =>{
          if(res){
            console.log('codigo desactivado para el grupo')
          }
        })
      }
      }
      else if(type===2){
        this.isModalTypeOpen = isOpen;
    
      }
      else if(type===3){
        this.isModalCreateOpen = isOpen;
    
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

  salirGrupo(){
    if(this.tipoGrupo===3){
      this.cambiarAdminModal?.setOpenComponent(true);
    }
    else if(this.tipoGrupo===2){
      this.usuarioService.salirGrupo(this.grupo).subscribe((res) => {
        if(res){
          console.log('sale del grupo')
      window.location.reload();
  
        }else{
          console.log('no se pudo salir del grupo')
  
        }
      });
    }

  }

  eliminarGrupo(){
    this.gruposService.eliminarGrupo(this.grupo).subscribe((res) => {
      if(res){
        console.log('grupo eliminado')
    window.location.reload();

      }else{
        console.log('no se pudo eliminar el grupo')

      }
    });

}


cargarUsuariosGrupo(grupo: string) {

  this.gruposService.cargarUsuariosGrupo(grupo).subscribe(usuarios => {

    
    if ('usuarios' in usuarios) {

      this.usuariosGrupo = usuarios['usuarios'] as Usuario[];

      
      this.usuariosGrupo= this.usuariosGrupo.sort((a, b) => {
        const puntuacionA = a.puntos !== undefined ? a.puntos : Number.MIN_VALUE;
        const puntuacionB = b.puntos !== undefined ? b.puntos : Number.MIN_VALUE;
        return puntuacionB - puntuacionA;
      });

    }

  });
}



unirseGrupo(){
  if(!this.validarFormulario()) {
return;
}

let codigo = this.groupForm.get('codigo')!.value
let usuario = this.usuarioService.uid;

//@ts-ignore
this.enviarDatosAccesoGrupo(codigo,usuario);

}

enviarDatosAccesoGrupo(codigo:string, usuario:string) {
this.gruposService.unirseGrupo(codigo,usuario)
  .subscribe((res) => {
    
    this.router.navigateByUrl('/usuario/comunidad').then(() => {

      window.location.reload();
    });
    const successMssg = 'Te has unido al grupo correctamente';
    // this.notificacionesService.mostrarNotificacion(successMssg, 'success');
  }, (err) => {
    const errorMssg = err.error.msg || 'No se pudo completar la acción, vuelva a intentarlo más adelante';
    // this.notificacionesService.mostrarNotificacion(errorMssg, 'danger');
    return;
  });
}


validarFormulario() {
let valid = true;

if(this.groupForm.get('codigo')!.invalid) {
  document.getElementById('codigo')!.classList.add('is-invalid');
  valid = false;
}
return valid;
}




//crear grupo modal
crearGrupo(){
  if(!this.validarFormularioCrear()) {
return;
}

const grupo: Grupo = new Grupo(this.idGrupo,this.createGroupForm.get('nombre')!.value,this.usuarioService.uid);

// if(this.modoCreacion===false){
this.nuevoGrupo(grupo);
// } else{
//   this.updateTarea();
// }
}

nuevoGrupo(grupo: Grupo) {
this.gruposService.crearGrupo(grupo)
.subscribe((res) => {

  this.router.navigateByUrl('/usuario/comunidad').then(() => {
    // Recargar la página
    window.location.reload();
  });
  const successMssg = 'El grupo se ha creado correctamente';
  // this.notificacionesService.mostrarNotificacion(successMssg, 'success');

}, (err) => {
  const errorMssg = err.error.msg || 'No se pudo completar la acción, vuelva a intentarlo más adelante';
  // this.notificacionesService.mostrarNotificacion(errorMssg, 'danger');
  return;
});
}

validarFormularioCrear() {
let valid = true;

if(this.createGroupForm.get('nombre')!.invalid) {
document.getElementById('nombre')!.classList.add('is-invalid');
valid = false;
}
return valid;
}


handleRefresh(event:any) {
  if(this.usuarioService.rol==='SUBORDINADO'){
    this.subordinado=true;
  }
  setTimeout(() => {
    this.gruposService
    .recuperarTipoGrupo(this.usuarioService.uid)
    .subscribe((res) => {
      if (res) {
        //@ts-ignore
        this.tipoGrupo = res['tipogrupo'];
        //@ts-ignore
        this.grupo = res['grupo'];

        this.cargarUsuariosGrupo(this.grupo);
 
      }
    });
    event.target.complete();
  }, 1000);
}

openCambiarAdmin() {

  if(this.cambiarAdminModal){
   this.cambiarAdminModal.setOpenComponent(true);
  }
}


async triggerActionSheet(selector:string) {

  switch (selector) {
    case "salir-grupo-admin":
      var actionSheet = await this.actionSheetController.create({
        header: '¿Deseas salir del grupo?',
        mode: 'ios',
        buttons: this.exitDialogAdmin
      });
      await actionSheet.present();
      break;
  
    case "salir-grupo-usuarios":
      var actionSheet = await this.actionSheetController.create({
        header: '¿Deseas salir del grupo?',
        mode: 'ios',
        buttons: this.exitDialog
      });
      await actionSheet.present();

      break;
  
    case "eliminar-grupo":
      var actionSheet = await this.actionSheetController.create({
        header: '¿Deseas eliminar el grupo?',
        mode: 'ios',
        buttons: this.deleteDialog
      });
      await actionSheet.present();

      break;

    default:
      console.log("Opción no reconocida");
      break;
  }

}
}
