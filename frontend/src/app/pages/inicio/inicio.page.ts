import { Component, OnInit, ViewChild } from '@angular/core';
import { InfiniteScrollCustomEvent, IonContent, IonSearchbar, LoadingController } from '@ionic/angular';
import { TareasService } from '../../services/tareas.service';
import { Tarea } from 'src/app/models/tarea.model';
import { register } from 'swiper/element/bundle';
import { GruposService } from 'src/app/services/grupos.service';
import { UsuariosService } from 'src/app/services/usuarios.service';
import { Observable, map, of } from 'rxjs';
register();
@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
})
export class InicioPage implements OnInit {

  

  tareas: Tarea[] = [];
  prevent: boolean = false;
  public tipoGrupo: Number;
  public grupo: string;
  public grupoAux: string;
  public status: string;
  public cargando:boolean=false;
  public nombres:string[]=[];
  public avatares:string[]=[];
  public usuarios:string[]=[];
  @ViewChild(IonContent, { static: true }) content: IonContent|undefined;
  public scrollDirection: string = '';
  @ViewChild('searchBar', { static: false })
  searchBar!: IonSearchbar; 



  constructor(private tareasService:TareasService,
    private gruposService: GruposService,
    private loadingController: LoadingController,
    private usuarioService: UsuariosService,

    ) { 
    this.tipoGrupo=0;
    this.grupo='';
    this.grupoAux='';
    this.status='';

  }

  async ngOnInit() {
    // Muestra el indicador de carga
    const loading = await this.loadingController.create({
      message: 'Cargando tareas...',
    });
    await loading.present();
    this.gruposService
    .recuperarTipoGrupo(this.usuarioService.uid)
    .subscribe((res) => {
      if (res) {
        //@ts-ignore
        this.tipoGrupo = res['tipogrupo'];
        //@ts-ignore
        this.grupo = res['grupo'];
        this.grupoAux=this.grupo;

        this.cargarTareasFinalizadas(this.grupoAux,this.status);

        
      }
    },(err)=>{
      
    });
    
    await loading.dismiss();

  }

  //problema con asincronia, se necesita un observable para que no haya problemas a la hora de cargar los nombres y uids
  //gracias a esto a pesar de que la base de datos tarde en contestarnos llegará el uid correctamente y podremos dar el nombre
//   obtenerNombreUsuario(uid: string|undefined): Observable<string | undefined> {

// //@ts-ignore
//     return of(this.usuarios.indexOf(uid)).pipe(
//       map(indice => {
//         return indice !== -1 ? this.nombres[indice] : 'nadie';
//       })
//     );
//   }

  //realmente esta forma aunque peor tambien servia xd
  // obtenerNombreUsuario(uid:string|undefined){
  //   var posicion = -1;
  //   console.log('id'+uid)
  //   if(uid!==undefined){
  //     posicion = this.usuarios.indexOf(uid);

  //   }

  //     if(posicion !== -1){
  //       return this.nombres[posicion];
  //     }else{return 'Nadie'}
  // }

  
  obtenerNombreUsuario(uid: string|undefined): Observable<{ nombre: string | undefined, avatar: string | undefined }> {   
    //@ts-ignore

    return of(this.usuarios.indexOf(uid)).pipe(
      map(indice => {
        if (indice !== -1) {
          return {
            nombre: this.nombres[indice],
            avatar: this.avatares[indice] 
          };
        } else {
          return {
            nombre: 'nadie',
            avatar: 'https://ionicframework.com/docs/img/demos/avatar.svg' 
          };
        }
      })
    );
  }

  scrollToTop() {
    if(this.content!==undefined)
    this.content.scrollToPoint(0, 0, 500);
  }


  cargarTareasFinalizadas(grupo:string,status:string,texto?:string) {
    this.tareasService.obtenerTareasFinalizadas(grupo,status,texto).subscribe(tareas => {

      
      if ('tareas' in tareas) {

        this.tareas = tareas['tareas'] as Tarea[];
      }

              //@ts-ignore
              this.nombres = tareas['usuarios']['nombres'];
              //@ts-ignore
               this.avatares = tareas['usuarios']['avatares'];
              //@ts-ignore
              this.usuarios = tareas['usuarios']['uid'];

              // this.usuarios.sort(function(a, b) {
              //   return a.localeCompare(b);
              // });


              
              

    });
  }

  cargarMas(event?: any) {

    if(this.prevent===false && this.cargando===false){

  this.cargando=true;
 
    this.tareasService.cargarMasTareasFinalizadas(this.grupo,this.status).subscribe(nuevasTareas => {

      var aux: Tarea[] =[];
      if ('tareas' in nuevasTareas) {
 
      aux= nuevasTareas['tareas'] as Tarea[];

      if(aux.length<10 && this.searchBar.value===''){
        this.prevent = true;
      }
      }
     
      for(let i=0;i<aux.length;i++){

        this.tareas.push(aux[i]);
      }
    this.cargando=false;
      event.target.complete();
      
    });

  }

  event.target.complete();
  
  }



  searchItems(ev: any) {
      if(ev!==''){
        this.prevent=false;
        this.cargarTareasFinalizadas(this.grupoAux,this.status,ev.target.value.toLowerCase());
      }else{
        this.searchBar.value = '';
        this.prevent=false;
      this.tareas=[];
      this.tareasService.setOffset(0);
        this.cargarTareasFinalizadas(this.grupoAux,this.status)
      }
  }

  limpiarTexto(){
    this.prevent=false;
    this.tareas=[];
    this.tareasService.setOffset(0);
    this.cargarTareasFinalizadas(this.grupoAux,this.status)
  }

  handleRefresh(event:any) {
    setTimeout(() => {
      if(this.searchBar){
      this.searchBar.value = '';
      }
      this.prevent=false;
      this.tareas=[];
      this.tareasService.setOffset(0);

      this.cargarTareasFinalizadas(this.grupoAux,this.status)
      event.target.complete();
    }, 1000);
  }


  onScroll(event:any) {
    if (event.detail.deltaY > 160) {
      this.scrollDirection = 'down';
    } else if(event.detail.deltaY < -90) {
      this.scrollDirection = 'up';
    }
  }


 async onFilterSelected(event: CustomEvent) {
    const filtro = event.detail.value;
    this.prevent=false;
    //personal, completada, fallida y todas
      switch (filtro) {
        case "grupo":
          this.grupoAux = this.grupo;
          this.cargarTareasFinalizadas(this.grupoAux,this.status)

          break;
        case "personal":
            this.grupoAux = 'sin grupo';
            this.cargarTareasFinalizadas(this.grupoAux,this.status)

          break;
        case "completada":
          this.status='completada'
          this.cargarTareasFinalizadas(this.grupoAux,this.status)
           
          break;
        case "fallida":
          this.status='fallida'
          this.cargarTareasFinalizadas(this.grupoAux,this.status)
        
          break;
        case "todas":
          this.status=''
          this.cargarTareasFinalizadas(this.grupoAux,this.status)
         
          break;
        default:
          console.log("Opción no reconocida");
          break;
      }
    
    

  }
}
