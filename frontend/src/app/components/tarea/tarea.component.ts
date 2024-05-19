import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { register } from 'swiper/element/bundle';
import { TareasService } from '../../services/tareas.service';
import { Router } from "@angular/router";
import { UsuariosService } from "src/app/services/usuarios.service";
import Swiper from 'swiper';

import { Usuario } from '../../models/usuario.models';
import { TareasPage } from 'src/app/pages/tareas/tareas.page';
import { NotificationsService } from '../../services/notifications.service';

register();
@Component({
  selector: 'app-tarea',
  templateUrl: './tarea.component.html',
  styleUrls: ['./tarea.component.scss'],
})
export class TareaComponent   implements OnInit{


  @Input() tarea: any;
  @Input() usuario: any;
  @Input() sinElegir: any;
  @Input() usuarioChip: any;
  @Output() recargarTareas = new EventEmitter<string>();
  public fecha:string='2000-01-01';
  public isModalOpen = false;
  public subordinado:boolean=false;
  public usuarioActual: string = '';
  public colorVariable: string = '';
  public deleteDialog = [
    {
      text: 'Borrar',
      role: 'destructive'
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
    private tareasService: TareasService,
    private usuariosService: UsuariosService,
    private notificationsService: NotificationsService,
    private router: Router
  ) { 

    if(this.usuariosService.rol==='SUBORDINADO'){
      this.subordinado=true;
    }
    this.usuarioActual = this.usuariosService.getUsuarioSelectActual();
  }

   ngOnInit() {


    this.tarea.fechaLimite=this.tarea.fechaLimite.split('T')[0];
    this.tarea.fechaLimite = this.formatearFechaLimite();

    this.colorVariable = this.tarea.color;

   }
   setOpen(isOpen: boolean) {
    this.isModalOpen = isOpen;
  }

   formatearFechaLimite() {
    var hoy = new Date();
    const yearHoy = hoy.getFullYear();
    const mesHoy = (hoy.getMonth() + 1).toString().padStart(2, '0'); // Meses van de 0 a 11 por eso sumamos 1
    const diaHoy = hoy.getDate().toString().padStart(2, '0');
    const fechaFinalHoy = `${yearHoy}-${mesHoy}-${diaHoy}`;

    hoy.setDate(hoy.getDate()+1);
    const yearTomorrow = hoy.getFullYear();
    const mesTomorrow = (hoy.getMonth() + 1).toString().padStart(2, '0'); // Meses van de 0 a 11 por eso sumamos 1
    const diaTomorrow = hoy.getDate().toString().padStart(2, '0');
    const fechaFinalTomorrow = `${yearTomorrow}-${mesTomorrow}-${diaTomorrow}`;

    hoy.setDate(hoy.getDate()-2);
    const yearAyer= hoy.getFullYear();
    const mesAyer = (hoy.getMonth() + 1).toString().padStart(2, '0'); // Meses van de 0 a 11 por eso sumamos 1
    const diaAyer = hoy.getDate().toString().padStart(2, '0');
    const fechaFinalAyer = `${yearAyer}-${mesAyer}-${diaAyer}`;



    switch (this.tarea.fechaLimite) {
      case fechaFinalHoy:
        return 'Hoy';
      case fechaFinalAyer:
        return 'Ayer';
      case fechaFinalTomorrow:
        return 'Mañana';
      default:

      return this.tarea.fechaLimite;
    }

  }

  escogerTarea(){

   
    this.tareasService.elegirTarea(this.tarea.uid,this.usuariosService.getUsuarioSelectActual())
      .subscribe((res) => {
        this.router.navigateByUrl('/usuario/tareas');
        const successMssg = 'La tarea se ha elegido correctamente';
        // this.notificacionesService.mostrarNotificacion(successMssg, 'success');
       
        this.recargarTareas.emit(this.usuariosService.getUsuarioSelectActual());

      }, (err) => {
        const errorMssg = err.error.msg || 'No se pudo completar la acción, vuelva a intentarlo más adelante';
        // this.notificacionesService.mostrarNotificacion(errorMssg, 'danger');
        return;
      });
  }

  liberarTarea(){

   
    this.tareasService.liberarTarea(this.tarea.uid,this.usuariosService.getUsuarioSelectActual())
      .subscribe((res) => {
        this.router.navigateByUrl('/usuario/tareas');
        const successMssg = 'La tarea se ha liberado correctamente';
        // this.notificacionesService.mostrarNotificacion(successMssg, 'success');
        this.recargarTareas.emit(this.usuariosService.getUsuarioSelectActual());

      }, (err) => {
        const errorMssg = err.error.msg || 'No se pudo completar la acción, vuelva a intentarlo más adelante';
        // this.notificacionesService.mostrarNotificacion(errorMssg, 'danger');
        return;
      });
  }

  completarTarea(){

   
    this.tareasService.completarTarea(this.tarea.uid,this.usuariosService.getUsuarioSelectActual())
      .subscribe((res) => {
        
        this.notificationsService.lanzarNotificacion('completarTarea');

        this.recargarTareas.emit(this.usuariosService.getUsuarioSelectActual());
  

      }, (err) => {
        const errorMssg = err.error.msg || 'No se pudo completar la acción, vuelva a intentarlo más adelante';
        // this.notificacionesService.mostrarNotificacion(errorMssg, 'danger');
        return;
      });
  }

  aEditar(){
    //no deberia haberlo llamado uid, un descuido, tener en cuenta
    this.router.navigate(['/usuario/tareas/crear-tarea', { id: this.tarea.uid }]);

  }

  borrarTarea(){
    this.tareasService.eliminarTarea(this.tarea.uid)
    .subscribe((res) => {
      //llamamos al handler de los diferentes tipos de notificacion
      
      this.notificationsService.lanzarNotificacion('eliminarTarea');

      this.recargarTareas.emit(this.usuariosService.getUsuarioSelectActual());

 

    }, (err) => {
      const errorMssg = err.error.msg || 'No se pudo completar la acción, vuelva a intentarlo más adelante';
      // this.notificacionesService.mostrarNotificacion(errorMssg, 'danger');
      return;
    });

  }

  onActionSheetDismiss(data:any){
    if (data && data.detail.role === 'destructive') {

        this.borrarTarea();
    }  }




}
