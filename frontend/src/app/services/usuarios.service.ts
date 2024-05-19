import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { Usuario } from '../models/usuario.models';
import { Token } from '@angular/compiler';

interface LoginResponse {
  token: string;
  uid: string;
  rol: string;
}

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  private usuario!:Usuario;
  private usuarioActual: string=''; 

  // constructor(private http:HttpClient, private router:Router) { }


  constructor(
    private http: HttpClient,
    private router: Router
  ) {

  }

  login(formData:any):Observable<any> {
    return this.http.post<LoginResponse>(`${environment.base_url}/login`, formData)
            .pipe(
              tap(res=>{
                localStorage.setItem('token', res['token']);
                const { uid, rol } = res;
                this.usuario = new Usuario(uid,null,null, null, rol);
                this.usuarioActual=uid;
              })
            );
  }


  register(formData:any): Observable<any> {
    return this.http.post(`${environment.base_url}/usuarios`, formData);
  }

  eliminarCuenta(idUsuario:string): Observable<any>{
      return this.http.delete(`${environment.base_url}/usuarios?id=${idUsuario}`, this.cabeceras)
  }


  almacenarFCMToken(token:string):Observable<any> {
    const datos:FormData = new FormData();


    if(this.rol !== 'ADMIN') {
    //@ts-ignore
    datos.append('token',token );
    }
  return this.http.post(`${environment.base_url}/usuarios/activar-push`, datos,this.cabeceras);
  }
  


  activarCodigo(usuario: string,codigo: string){
    const datos:FormData = new FormData();


    if(this.rol !== 'ADMIN') {
    //@ts-ignore
    datos.append('usuario',usuario );
    datos.append('codigo',codigo );
    }
 
    return this.http.post(`${environment.base_url}/usuarios/activar-codigo`, datos, this.cabeceras );

  }


  desactivarCodigo(usuario: string, codigo: string){
    const datos:FormData = new FormData();


    if(this.rol !== 'ADMIN') {
    //@ts-ignore
    datos.append('usuario',usuario );
    datos.append('codigo',codigo );
    }

    return this.http.post(`${environment.base_url}/usuarios/desactivar-codigo`, datos, this.cabeceras );

  }

  salirGrupo(grupo:string, usuario?:string): Observable<any>{
    const datos:FormData= new FormData();
    //@ts-ignore
    datos.append('grupo', grupo);
    //@ts-ignore
    if(usuario!==undefined){
    datos.append('usuario', usuario);
    }
    return this.http.post(`${environment.base_url}/grupos/salir-grupo`,datos,this.cabeceras);
  }

  recuperarSubordinados(usuario: string){
    const datos:FormData = new FormData();


        if(this.rol !== 'ADMIN') {
        //@ts-ignore
        datos.append('usuario',usuario );
        }
    
        return this.http.get(`${environment.base_url}/usuarios/recuperar-subordinados`,  this.cabeceras );
  
  }

  convertirseDependiente(codigo:string, usuario:string){
    const datos:FormData= new FormData();
    //@ts-ignore
    datos.append('codigo', codigo);
    datos.append('usuario', usuario);
  


    return this.http.post(`${environment.base_url}/usuarios/convertir-dependiente`, datos, this.cabeceras );
  }

  liberarUsuario(subordinado:string){
    const datos:FormData= new FormData();
    //@ts-ignore
    datos.append('subordinado', subordinado);

    return this.http.post(`${environment.base_url}/usuarios/liberar-usuario`, datos, this.cabeceras );

  }


  actualizarUsuario(uid:string,nombre:string|null, apellidos:string|null){
    const datos:FormData= new FormData();

    if(this.rol !== 'ADMIN') {
      //@ts-ignore
      datos.append('id',uid );
      //@ts-ignore
      datos.append('nombre',nombre );
      //@ts-ignore
      datos.append('apellidos',apellidos );
      }
  
      return this.http.put(`${environment.base_url}/usuarios/${uid}`,datos,  this.cabeceras );



  }

  cambiarPassword(formData:any): Observable<any> {

    return this.http.post<LoginResponse>(`${environment.base_url}/usuarios/cambiar-password`, formData,this.cabeceras)
    .pipe(
      tap(res=>{
        localStorage.setItem('token', res['token']);
        const { uid, rol } = res;
        this.usuario = new Usuario(uid,null,null, null, rol);
        this.usuarioActual=uid;
      })
    );
  }

  cambiarAvatar(avatarSRC:string){
        const datos:FormData= new FormData();
    
        if(this.rol !== 'ADMIN') {
          //@ts-ignore
          datos.append('avatarSRC',avatarSRC );

          }

          return this.http.post(`${environment.base_url}/usuarios/actualizarAvatar`,datos,  this.cabeceras );
    
    
    
      }

      enviarNotificacion(usuario:string){
        const datos:FormData= new FormData();
    
        if(this.rol !== 'ADMIN') {
          //@ts-ignore
          datos.append('usuario',usuario );

          }

          return this.http.post(`${environment.base_url}/notificaciones/enviar-notificacion`,datos,  this.cabeceras );
      }


  validar(correcto: boolean, incorrecto: boolean): Observable<boolean> {

    if (this.token === '') {
       this.limpiarLocalStore();
      return of(incorrecto);
    }

    return this.http.get(`${environment.base_url}/login/token`, this.cabeceras)
      .pipe(
        tap( (res: any) => {
          // extaemos los datos que nos ha devuelto y los guardamos en el usuario y en localstorage
          const { uid, nombre,apellidos, email, rol, sexo,fcmToken, usuariosSubordinados, token,avatar, puntos} = res;
          localStorage.setItem('token', token);
          this.usuario = new Usuario(uid, nombre,apellidos,email, rol, null,avatar, sexo,fcmToken,puntos, usuariosSubordinados, );

        }),
        map ( res => {
          return correcto;
        }),
        catchError ( err => {
          console.log('error')
          // this.limpiarLocalStore();
          return of(incorrecto);
        })
      );
  }


  validarToken(): Observable<boolean> {
    return this.validar(true, false);
  }

  validarNoToken(): Observable<boolean> {
    return this.validar(false, true);
  }



  limpiarLocalStore(): void{
    localStorage.removeItem('token');
  }


  setUsuarioSelectActual(usuario: string) {
    this.usuarioActual = usuario;
  }

  getUsuarioSelectActual() {
    return this.usuarioActual;
  }

  get cabeceras() {
    return {
      headers: {
        'x-token': this.token,
        'ngrok-skip-browser-warning':'true'
      }};
  }

  get token(): string {
    return localStorage.getItem('token') || '';
  }

  get FCMToken(): string{
    return this.usuario.fcmToken!;
  }

  get rol(): string {
    return this.usuario.rol!;
  }

  get uid(): string {
    return this.usuario.uid;
  }

  get nombre(): string {
    return this.usuario.nombre!;
  }

  get apellidos(): string {
    return this.usuario.apellidos!;
  }

  get subordinados():string[]{
    return this.usuario.usuariosSubordinados!;
  }

  get avatar():string{
    if(this.usuario.avatar!==undefined)
    return this.usuario.avatar;
  else
  return 'https://ionicframework.com/docs/img/demos/avatar.svg'
  }
}
