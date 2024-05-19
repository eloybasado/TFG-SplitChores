import { Token } from '@angular/compiler';
import { Component, OnInit, ViewChild } from '@angular/core';
import { register } from 'swiper/element/bundle';
import { PushNotifications } from '@capacitor/push-notifications';
import { UsuariosService } from 'src/app/services/usuarios.service';
import { NotificationsService } from 'src/app/services/notifications.service';
import Swal from 'sweetalert2';
import { GruposService } from 'src/app/services/grupos.service';
import { ActionSheetController } from '@ionic/angular';


@Component({
  selector: 'app-ajustes',
  templateUrl: './ajustes.page.html',
  styleUrls: ['./ajustes.page.scss'],
})
export class AjustesPage implements OnInit {
  public token:string='';
  public isToastOpen: boolean=false;
  public mensaje:string='';
  public tipoGrupo:any=-1;
  public color:string='';
  public icon:string='';
  public notificaciones: { isOpen: boolean, mensaje: string, icon:string, color:string }[] = [];
  @ViewChild('deleteActionSheet') deleteActionSheet: HTMLIonActionSheetElement | undefined;
  public exitDialog = [
    {
      text: 'Cerrar sesión',
      role: 'destructive',
      handler: () => {
        this.cerrarSesion();
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

  public deleteDialog = [
    {
      text: 'Eliminar cuenta',
      role: 'destructive',
      handler: () => {
        this.eliminarCuenta();
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
  constructor(
    private usuarioService:UsuariosService,
    private notificationsService: NotificationsService,
    private gruposService: GruposService,
    private actionSheetController: ActionSheetController,
  ) {
    
   }


ngOnInit(): void {
  this.gruposService
  .recuperarTipoGrupo(this.usuarioService.uid)
  .subscribe((res) => {
    if (res) {
      //@ts-ignore
      this.tipoGrupo = res['tipogrupo'];

    }
  });

}

async  ionViewWillEnter() {
  this.notificationsService.setSetOpenFunction(this.setNotificationOpen.bind(this));
}



cerrarSesion(){
  this.usuarioService.limpiarLocalStore();
  window.location.reload()
}

eliminarCuenta(){
  if(this.deleteActionSheet!==undefined){
  this.deleteActionSheet.dismiss();
  }
  if( this.usuarioService.rol==='SUBORDINADO'){
    Swal.fire({
      text: "Para eliminar tu cuenta debes dejar de ser un usuario gestionado",
      icon: "info",
      confirmButtonColor: '#01839d',
      confirmButtonText: 'Entendido',
      heightAuto: false
    });
  }else if(this.usuarioService.rol==='SUBORDINADO'){
    Swal.fire({
      text: "Para eliminar tu cuenta debes convertir en independientes a todos los usuarios que gestionas",
      icon: "info",
      confirmButtonColor: '#01839d',
      confirmButtonText: 'Entendido',
      heightAuto: false
    });
  }
  else if(this.tipoGrupo!==1){
    Swal.fire({
      text: "Para eliminar tu cuenta debes salir de tu grupo",
      icon: "info",
      confirmButtonColor: '#01839d',
      confirmButtonText: 'Entendido',
      heightAuto: false
    });

  }
  else {
    this.usuarioService.eliminarCuenta(this.usuarioService.uid).subscribe((res)=>{
      this.notificationsService.lanzarNotificacion('cuentaEliminada');
  
  
      setTimeout(() => {
        this.cerrarSesion();
      }, 5000);
  
    },(err)=>{
      this.notificationsService.lanzarNotificacion('error');
      console.log(err)
        
    });
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


handleRefresh(event:any) {
  setTimeout(() => {
    this.gruposService
    .recuperarTipoGrupo(this.usuarioService.uid)
    .subscribe((res) => {
      if (res) {

        //@ts-ignore
        this.tipoGrupo = res['tipogrupo']; 
      }
    });
    event.target.complete();
  }, 1000);
}

async triggerActionSheet(selector:string) {

  switch (selector) {
    case "borrar":
      var actionSheet = await this.actionSheetController.create({
        header: '¿Deseas elimiar tu cuenta?',
        mode: 'ios',
        buttons: this.deleteDialog
      });
      await actionSheet.present();
      break;
  
    case "salir":
      var actionSheet = await this.actionSheetController.create({
        header: '¿Deseas cerrar la sesión?',
        mode: 'ios',
        buttons: this.exitDialog
      });
      await actionSheet.present();

      break;

    default:
      console.log("Opción no reconocida");
      break;
  }

}

}
