import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { register } from 'swiper/element/bundle';
import { Router } from "@angular/router";
import { UsuariosService } from "src/app/services/usuarios.service";
import Swiper from 'swiper';

import { Usuario } from '../../models/usuario.models';
import { NotificationsService } from '../../services/notifications.service';
import { ActionSheetController } from '@ionic/angular';
import { GruposService } from 'src/app/services/grupos.service';

@Component({
  selector: 'app-usuario',
  templateUrl: './usuario.component.html',
  styleUrls: ['./usuario.component.scss'],
})
export class UsuarioComponent   {
  @Input() usuario: any;
  @Input() changeAdmin: any;
  @Input() perfil: boolean=false;
  @Output() eventoHijo = new EventEmitter<any>();
  @Output() liberarUsuario: EventEmitter<string> = new EventEmitter<string>();
  @Output() convertirAdmin = new EventEmitter<string>();

  public deleteDialog = [
    {
      text: 'Echar',
      role: 'destructive',
      handler: () => {
        this.echarDelGrupo();
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
    private usuariosService: UsuariosService,
    private gruposService: GruposService,
    private notificationsService: NotificationsService,
    private actionSheetController: ActionSheetController,
    private router: Router
  ) {

   
   }


  async openActionSheet() {
    const actionSheet = await this.actionSheetController.create({
      header: '¿Deseas echar al usuario?',
      mode: 'ios',
      buttons: this.deleteDialog
    });
    await actionSheet.present();
  }

  echarDelGrupo(){

    this.eventoHijo.emit(this.usuario.uid);
  }

  liberarUsuarioComponente() {
    this.liberarUsuario.emit(this.usuario.uid);
  }


  botonHacerAdmin(uid:string){
    this.convertirAdmin.emit(uid);
  }

}
