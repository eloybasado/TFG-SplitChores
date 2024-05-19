import { Component, OnInit, ViewChild, ElementRef  } from '@angular/core';
import { Router } from "@angular/router";
import { Usuario } from 'src/app/models/usuario.models';
import { GruposService } from 'src/app/services/grupos.service';
import { NotificationsService } from 'src/app/services/notifications.service';
import { UsuariosService } from 'src/app/services/usuarios.service';
import { CambiarAdminComponent } from '../../components/cambiar-admin/cambiar-admin.component';

@Component({
  selector: 'app-gestionar-grupo',
  templateUrl: './gestionar-grupo.page.html',
  styleUrls: ['./gestionar-grupo.page.scss'],
})
export class GestionarGrupoPage implements OnInit {

  public fireDialog = [
    {
      text: 'Echar',
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

  usuarios: Usuario[] = [];
  public grupo: string;
  public tipoGrupo: Number;
  public userId:string;
  @ViewChild(CambiarAdminComponent) cambiarAdminModal: CambiarAdminComponent | undefined;

  constructor(
    private gruposService: GruposService,
    private usuarioService: UsuariosService,
    private elementRef: ElementRef,
    private notificationsService: NotificationsService,
    private router: Router,
  ) { 

    this.grupo='';
    this.tipoGrupo=0;
    this.userId=this.usuarioService.uid;

  }

  ngOnInit() {

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

  }

  cargarUsuariosGrupo(grupo: string) {

    this.gruposService.cargarUsuariosGrupo(grupo).subscribe(usuarios => {

      
      if ('usuarios' in usuarios) {
  
        this.usuarios = usuarios['usuarios'] as Usuario[];

  

      }

    });
  }

  onActionSheetDismiss(data:any,usuario:string){
    if (data && data.detail.role === 'destructive') {
        this.echarDelGrupo(usuario);
    }  }

    enviarNotificacion(usuario:string){
      this.usuarioService.enviarNotificacion(usuario).subscribe((res)=>{
        this.notificationsService.lanzarNotificacion('notificacionEnviada');
  
      },(err)=>{
        console.log(err)
        this.notificationsService.lanzarNotificacion('error');
      });
    }

  echarDelGrupo(usuario: any) {

    this.usuarioService.salirGrupo(this.grupo,usuario).subscribe((res)=>{
      if(res){
        this.cargarUsuariosGrupo(this.grupo);
      }

    });
  }


  resetearPuntos(){

    this.gruposService.resetPuntos(this.grupo).subscribe((res)=>{

    },(err)=>{
      console.log('error',err);
    });
  }


   openCambiarAdmin() {

    if(this.cambiarAdminModal){
     this.cambiarAdminModal.setOpenComponent(true);
    }
  }

}
