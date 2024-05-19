import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  private setOpenFunction!: (isOpen: boolean, mensaje:string, icon:string, color:string) => void;

  constructor() { }

    //funcion de enlace 
    setSetOpenFunction(func: (isOpen: boolean, mensaje:string, icon:string, color:string) => void) {
      this.setOpenFunction = func;
    }
  
    //funcion que llamara a la funcion de enlace
    llamarSetOpen(isOpen: boolean, mensaje:string, icon:string, color:string) {
      if (this.setOpenFunction) {
        this.setOpenFunction(isOpen, mensaje,icon,color);
      } else {
        console.error('La función setOpen en la página no está definida en el servicio.');
      }
    }


      //handler de los diferentes tipos de notificacion
  lanzarNotificacion(notificacion:string){
    switch (notificacion) {
      case "eliminarTarea":
      //llama a la funcion que llamara a la funcion de la pagina
        this.llamarSetOpen(true,'Tarea eliminada correctamente','happy-outline','light');
        break;
    
      case "crearTarea":
        this.llamarSetOpen(true,'Tarea creada correctamente','happy-outline','light');

        break;
      case "password-cambiada":
          this.llamarSetOpen(true,'Contraseña cambiada correctamente','happy-outline','light');
  
       break;
    
      case "editarNombre":
        this.llamarSetOpen(true,'Datos actualizados correctamente','happy-outline','light');

        break;
    
      case "editarTarea":
        this.llamarSetOpen(true,'Tarea actualizada correctamente','happy-outline','light');

        break;

      case "completarTarea":
        this.llamarSetOpen(true,'Tarea completada correctamente','happy-outline','light');

        break;
      case "cambiarAvatar":
        this.llamarSetOpen(true,'Avatar cambiado correctamente','happy-outline','light');

        break;
      case "addUsuarioGestionado":
        this.llamarSetOpen(true,'Usuario convertido correctamente','happy-outline','light');
  
         break;
      case "convertirseGestionado":
        this.llamarSetOpen(true,'Has sido convertido correctamente','happy-outline','light');
    
          break;
      case "liberarGestionado":
        this.llamarSetOpen(true,'Usuario convertido correctamente','happy-outline','light');
        
          break;
      case "notificacionEnviada":
         this.llamarSetOpen(true,'Notificación enviada','happy-outline','light');
            
           break;
      case "cuentaEliminada":
        this.llamarSetOpen(true,'Cuenta eliminada correctamente','sad-outline','light');
          
          break;
      case "error":
        this.llamarSetOpen(true,'No se pudo realizar la acción','sad-outline','danger');

        break;
    
      default:
        console.log("Opción no reconocida");
        break;
    }
  }
}
