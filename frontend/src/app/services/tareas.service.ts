import { Injectable } from '@angular/core';
import { Tarea } from '../models/tarea.model';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { UsuariosService } from './usuarios.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TareasService {

  private tareas: Tarea[] = [];
  private offset=0;

  constructor(private http:HttpClient, private router:Router, private usuarioService:UsuariosService) { }




  crearTarea(tarea: Tarea){
    const datos:FormData= new FormData();
    //@ts-ignore
    datos.append('nombre', tarea.nombre);
    //@ts-ignore
    datos.append('fechaLimite',tarea.fechaLimite);
    //@ts-ignore
    datos.append('dificultad',tarea.dificultad);
    //@ts-ignore
    datos.append('descripcion',tarea.descripcion);
    //@ts-ignore
    datos.append('recurrente', tarea.recurrente);
    //@ts-ignore
    datos.append('frecuencia', tarea.frecuencia);
    //@ts-ignore
    datos.append('frecuenciaSemanal', tarea.frecuenciaSemanal);
    //@ts-ignore
    datos.append('rotacion', tarea.rotacion);
    //@ts-ignore
    datos.append('color', tarea.color);
  
    if(this.usuarioService.rol !== 'ADMIN') {
      datos.append('usuario',  this.usuarioService.uid);
    }

    return this.http.post(`${environment.base_url}/tareas/`, datos, this.cabeceras );
  }

  actualizarTarea(tarea: Tarea){
    const datos:FormData= new FormData();
    //@ts-ignore
    datos.append('id', tarea.id);
    //@ts-ignore
    datos.append('nombre', tarea.nombre);
    //@ts-ignore
    datos.append('fechaLimite',tarea.fechaLimite);
    //@ts-ignore
    datos.append('descripcion',tarea.descripcion);
    //@ts-ignore
    datos.append('dificultad',tarea.dificultad);
    //@ts-ignore
    datos.append('recurrente', tarea.recurrente);
    //@ts-ignore
    datos.append('frecuencia', tarea.frecuencia);
    //@ts-ignore
    datos.append('frecuenciaSemanal', tarea.frecuenciaSemanal);
    //@ts-ignore
    datos.append('color', tarea.color);

 
  
    if(this.usuarioService.rol !== 'ADMIN') {
      //para saber el ultimo editor
      datos.append('usuario',  this.usuarioService.uid);
    }

    return this.http.put(`${environment.base_url}/tareas/${tarea.id}`, datos, this.cabeceras );
  }

  elegirTarea(idTarea:string, idUsuario: string):Observable<any>{
    const datos:FormData= new FormData();
    //@ts-ignore
    datos.append('tarea', idTarea);
    //@ts-ignore
    datos.append('usuario',idUsuario);
    return this.http.post(`${environment.base_url}/tareas/elegir-tarea`,datos, this.cabeceras);
  }

  liberarTarea(idTarea:string, idUsuario: string):Observable<any>{
    const datos:FormData= new FormData();
    //@ts-ignore
    datos.append('tarea', idTarea);
    //@ts-ignore
    datos.append('usuario',idUsuario);
    return this.http.post(`${environment.base_url}/tareas/liberar-tarea`,datos, this.cabeceras);
  }

  eliminarTarea(idTarea:string){
  

    return this.http.delete(`${environment.base_url}/tareas?id=${idTarea}`, this.cabeceras);
  }


  completarTarea(idTarea:string, idUsuario: string):Observable<any>{
    const datos:FormData= new FormData();
    //@ts-ignore
    datos.append('tarea', idTarea);
    //@ts-ignore
    datos.append('usuario',idUsuario);
    return this.http.post(`${environment.base_url}/tareas/completar-tarea`,datos, this.cabeceras);
  }



  obtenerTareasFinalizadas(grupo: string,status:string, texto?: string): Observable<Tarea[]> {
    let url = `${environment.base_url}/tareas/finalizadas?desde=0&grupo=${grupo}&status=${status}`;
    
    if (texto) {
      url += `&texto=${texto}`;
     this.offset=0;
    }

    return this.http.get<Tarea[]>(url, this.cabeceras);
  }

  cargarMasTareasFinalizadas(grupo:string,status:string): Observable<Tarea[]> {
    this.offset+=10;
    return this.http.get<Tarea[]>(`${environment.base_url}/tareas/finalizadas?desde=${this.offset}&grupo=${grupo}&status=${status}`, this.cabeceras);


  }

//para las tareas de un grupo 
obtenerTareasUsuario(grupo:string, modo:string, usuario?: string): Observable<Tarea[]> {
  // const datos:FormData= new FormData();
  // //@ts-ignore
  // datos.append('grupo', grupo);
  let url = `${environment.base_url}/tareas/sin-elegir?desde=0&grupo=${grupo}&modo=${modo}`;

  if (usuario) {
    url += `&usuario=${usuario}`;
  }

  return this.http.get<Tarea[]>(url, this.cabeceras);

}

cargarMasTareasUsuario(grupo:string, modo:string): Observable<Tarea[]> {
  this.offset+=10;
  return this.http.get<Tarea[]>(`${environment.base_url}/tareas/sin-elegir?desde=${this.offset}&grupo=${grupo}&modo=${modo}`, this.cabeceras);


}



//para las tareas terminadas de un grupo
obtenerTareasInicio(): Observable<Tarea[]> {

  return this.http.get<Tarea[]>(`${environment.base_url}/tareas-inicio?desde=0`, this.cabeceras);

}

cargarMasTareasInicio(): Observable<Tarea[]> {
  this.offset+=10;
  return this.http.get<Tarea[]>(`${environment.base_url}/tareas-inicio?desde=${this.offset}`, this.cabeceras);


}

  buscarTareas(termino: string): Tarea[] {
    return this.tareas;

  }

  cargarTarea(id: string) {
    if (!id) { id = ''; }

    return this.http.get<Tarea>(`${environment.base_url}/tareas/por-id?id=${id}`, this.cabeceras);
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

  setOffset(value:number):void{
    this.offset=value;
  }
}
