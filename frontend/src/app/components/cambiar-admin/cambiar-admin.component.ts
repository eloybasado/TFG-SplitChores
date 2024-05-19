import { Component, OnInit, ElementRef } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Usuario } from 'src/app/models/usuario.models';
import { GruposService } from 'src/app/services/grupos.service';
import { Router } from "@angular/router";
import { NotificationsService } from 'src/app/services/notifications.service';
import { UsuariosService } from 'src/app/services/usuarios.service';
@Component({
  selector: 'app-cambiar-admin',
  templateUrl: './cambiar-admin.component.html',
  styleUrls: ['./cambiar-admin.component.scss'],
})
export class CambiarAdminComponent  implements OnInit {
public isModalOpen: boolean=false;
usuarios: Usuario[] = [];
public grupo: string;
public tipoGrupo: Number;
public userId:string;


setOpenComponent(isOpen: boolean) {

  if(isOpen===true){
    this.cargarUsuariosGrupo(this.grupo);
  }

this.isModalOpen=isOpen;

}

constructor(
  private gruposService: GruposService,
  private usuarioService: UsuariosService,
  private router: Router

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

  handleCambiarAdmin(uid: string) {

    this.gruposService.cambiarAdmin(this.grupo,uid).subscribe((res)=>{
    this.setOpenComponent(false);
    this.router.navigateByUrl('/usuario/comunidad').then(() => {

      window.location.reload();
    });


    },(err)=>{
      console.log('error'+err)
    });
  }
  

  
}
