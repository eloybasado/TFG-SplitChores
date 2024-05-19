import { Injectable } from '@angular/core';
import { Grupo } from '../models/grupo.model';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { UsuariosService } from './usuarios.service';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { Usuario } from '../models/usuario.models';

@Injectable({
  providedIn: 'root'
})
export class GruposService {

  constructor(private http:HttpClient, private router:Router, private usuarioService:UsuariosService) { }


  crearGrupo(grupo: Grupo){
    const datos:FormData= new FormData();
    //@ts-ignore
    datos.append('nombre', grupo.nombre);
  
    if(this.usuarioService.rol !== 'ADMIN') {
      datos.append('admin',  this.usuarioService.uid);
      //usuarios es un array
      datos.append('usuarios', this.usuarioService.uid);
    }

    return this.http.post(`${environment.base_url}/grupos/`, datos, this.cabeceras );
  }

  unirseGrupo(codigo:string, usuario:string){
    const datos:FormData= new FormData();
    //@ts-ignore
    datos.append('codigo', codigo);
    datos.append('usuario', usuario);
  


    return this.http.post(`${environment.base_url}/grupos/unirse-grupo`, datos, this.cabeceras );
  }

  recuperarTipoGrupo(usuario: string){
    const datos:FormData = new FormData();


        if(this.usuarioService.rol !== 'ADMIN') {
        //@ts-ignore
        datos.append('usuario',usuario );
        }
    
        return this.http.get(`${environment.base_url}/grupos/consultar-grupo`,  this.cabeceras );
  
  }





  cargarUsuariosGrupo(grupoId: string): Observable<Usuario[]>{
    if(grupoId==='sin grupo')
      return throwError(new HttpErrorResponse({ status: 404, statusText: 'Not Found' }));
    return this.http.get<Usuario[]>(`${environment.base_url}/grupos/usuarios-grupo?id=${grupoId}`,  this.cabeceras );
  }

  activarCodigo(grupo: string,codigo: string){
    const datos:FormData = new FormData();


    if(this.usuarioService.rol !== 'ADMIN') {
    //@ts-ignore
    datos.append('grupo',grupo );
    datos.append('codigo',codigo );
    }
 
    return this.http.post(`${environment.base_url}/grupos/activar-grupo`, datos, this.cabeceras );

  }


  desactivarCodigo(grupo: string, codigo: string){
    const datos:FormData = new FormData();


    if(this.usuarioService.rol !== 'ADMIN') {
    //@ts-ignore
    datos.append('grupo',grupo );
    datos.append('codigo',codigo );
    }

    return this.http.post(`${environment.base_url}/grupos/desactivar-grupo`, datos, this.cabeceras );

  }

  eliminarGrupo(idGrupo:string){
  

    return this.http.delete(`${environment.base_url}/grupos?id=${idGrupo}`, this.cabeceras);
  }


  cambiarAdmin(grupo:string, usuario:string){
    const datos:FormData = new FormData();


    if(this.usuarioService.rol !== 'ADMIN') {
    //@ts-ignore
    datos.append('grupo',grupo );
    datos.append('usuario',usuario );
    }
    return this.http.post(`${environment.base_url}/grupos/cambiar-admin`,datos, this.cabeceras);
  }

  resetPuntos(grupo:string){
    const datos:FormData = new FormData();


    if(this.usuarioService.rol !== 'ADMIN') {
    //@ts-ignore
    datos.append('grupo',grupo );
    }

    return this.http.post(`${environment.base_url}/grupos/reset-puntos`,datos, this.cabeceras);

  }




  get cabeceras(){
    return {
      headers:{
        'x-token': this.token,
        'ngrok-skip-browser-warning':'true'
      }
    }
  }

  get token(): string {
    return localStorage.getItem('token') || '';
  }
}
