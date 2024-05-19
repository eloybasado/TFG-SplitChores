import { Component, OnInit, ViewChild } from '@angular/core';
import { ActionSheetController, InfiniteScrollCustomEvent, IonSelect, ItemReorderEventDetail, LoadingController } from '@ionic/angular';
import { TareasService } from '../../services/tareas.service';
import { NotificationsService } from '../../services/notifications.service';
import { Tarea } from 'src/app/models/tarea.model';
import { register } from 'swiper/element/bundle';
import { GruposService } from "src/app/services/grupos.service";
import { UsuariosService } from 'src/app/services/usuarios.service';
import { Router } from "@angular/router";
import { Usuario } from 'src/app/models/usuario.models';
import { PushNotifications } from '@capacitor/push-notifications';


@Component({
  selector: 'app-tareas',
  templateUrl: './tareas.page.html',
  styleUrls: ['./tareas.page.scss'],
})
export class TareasPage implements OnInit {
  tareasSinElegir: Tarea[] = [];
  tareasElegidas: Tarea[] = [];
  usuariosSubordinados: Usuario[]=[];
  prevent: boolean = false;
  public tipoGrupo: Number;
  public grupo: string;
  public isToastOpen: boolean=false;
  public mensaje:string='';
  public tutorial:boolean=false;
  public color:string='';
  public icon:string='';
  public  progressValue: number = 0;
  public subordinado:boolean=false;
  public selectedOption: string = 'Tus Tareas';
  public selectedOptionEscoger: string = 'Escoger Tareas';
  public usaurioActual: string=this.usuarioService.uid;
  public notificaciones: { isOpen: boolean, mensaje: string, icon:string, color:string  }[] = [];
  public tutorialDialog = [
    {
      text: 'Terminar tutorial',
      role:'destructive',
      handler: () => {
        this.terminarTutorial();
      }
    },
    {
      text: 'Continuar tutorial',
      role: 'cancel',
      data: {
        action: 'cancel',
      },
    },
  ];
  @ViewChild('mySelect') select: IonSelect;


  constructor(private tareasService:TareasService,
    private gruposService: GruposService,
    private usuarioService: UsuariosService,
    private notificationsService: NotificationsService,
    private loadingController: LoadingController,
    private actionSheetController: ActionSheetController,
    private router: Router

    ) { 
      this.select = {} as IonSelect;
      this.tipoGrupo=0;
      this.setUsuarioSelectActual(this.usuarioService.uid)

      if(this.usuarioService.rol==='SUBORDINADO'){
        this.subordinado=true;
      }
      else{
        
      }
      this.grupo='';
      this.notificationsService.setSetOpenFunction(this.setNotificationOpen.bind(this));
      
    }

    async ngOnInit() {

      if(localStorage.getItem('tutorial')!=='visto'){
        this.tutorial=true;
      }

      this.addListeners();
      this.registerNotifications();
      this.getDeliveredNotifications();

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
            this.cargarTareasUsuario(this.grupo, 'NO-ELEGIDAS');
            this.cargarTareasUsuario(this.grupo, 'ELEGIDAS');
    
            if (this.subordinado === true && this.grupo === 'sin grupo') {

                this.recargarTareasElegidasPorUsuario(this.grupo, this.usaurioActual);

            }
          }
          
          if (this.subordinado === false) {
            this.usuarioService.recuperarSubordinados(this.usuarioService.uid).subscribe((res) => {
              if (res) {
                //@ts-ignore
                this.usuariosSubordinados = res['subordinados'];
              }
            });
          }
            //si da problemas cambiarlo a dentro de una de las funciones de carga
            loading.dismiss();
          
        });
    }

   async ionViewWillEnter() {
      this.notificationsService.setSetOpenFunction(this.setNotificationOpen.bind(this));
    }
    


  handleReorder(ev: CustomEvent<ItemReorderEventDetail>) {
    // console.log('Dragged from index', ev.detail.from, 'to', ev.detail.to);

    ev.detail.complete();
  }

  


 recargarTareas($event?:any,aviso?:string){
    this.cargarTareasUsuario(this.grupo,'NO-ELEGIDAS');
    if(event!==undefined || aviso==='NO-ENTRAR'){
      this.recargarTareasElegidasPorUsuario(this.grupo,this.usaurioActual)
    }
    else{
    this.cargarTareasUsuario(this.grupo,'ELEGIDAS');

    }
  }

 recargarTareasElegidasPorUsuario(grupo: string,usuario:string){
  this.tareasService.obtenerTareasUsuario(grupo,'ELEGIDAS',usuario).subscribe(tareas => {

    
    if ('tareas' in tareas) {

    this.tareasElegidas = tareas['tareas'] as Tarea[];

    }


  });
  }

  async cargarTareasUsuario(grupo: string, modo:string) {

    this.tareasService.obtenerTareasUsuario(grupo,modo).subscribe(tareas => {

      
      if ('tareas' in tareas) {
        if(modo==='NO-ELEGIDAS')
        this.tareasSinElegir = tareas['tareas'] as Tarea[];
      else
      this.tareasElegidas = tareas['tareas'] as Tarea[];

      }

    });
  }
//no es necesario por el momento, no van a haber tantas tareas a menos que alguien quiera romper la app
  cargarMasTareasSinElegir(event: any) {

    if(this.prevent===false){
 
    this.tareasService.obtenerTareasUsuario(this.grupo,'NO-ELEGIDAS').subscribe(nuevasTareas => {
      var aux: Tarea[] =[];
      if ('tareas' in nuevasTareas) {
      aux= nuevasTareas['tareas'] as Tarea[];

      if(aux.length<10){
        this.prevent = true;
      }
      }
     
      for(let i=0;i<aux.length;i++){
        this.tareasSinElegir.push(aux[i]);
      }
      event.target.complete();
    });

  }

  event.target.complete();

  }

  buscarTareas(event: any) {
    // Lógica para buscar tareas
    const terminoBusqueda = event.target.value;
    this.tareasSinElegir = this.tareasService.buscarTareas(terminoBusqueda);
  }


  //funcion final que se llamará
  // setOpen(isOpen: boolean, mensaje:string) {
  //   this.isToastOpen = isOpen;
  //   this.mensaje=mensaje
  //   //aprovechamos el manejor de la notificacion para recargar las tareas sin que el usuario se entere
  //   this.recargarTareas(this.usaurioActual)
  // }


  setNotificationOpen(isOpen: boolean, mensaje: string, icon:string, color:string ) {
     this.isToastOpen = isOpen;
     this.mensaje=mensaje
     this.icon=icon;
     this.color=color;
    this.notificaciones.push({ isOpen, mensaje, icon, color });
    this.recargarTareas(this.usaurioActual)
  }

  cerrarNotificacion(index: number) {
    this.isToastOpen = false;
    this.notificaciones.splice(index, 1);
  }

  toCreate(){
    this.router.navigate(['/usuario/tareas/crear-tarea', { grupo: this.grupo }]);
  }

  handleRefresh(event:any) {
    setTimeout(() => {
      this.recargarTareas('NO-ENTRAR','NO-ENTRAR')
      event.target.complete();
    }, 1000);
  }



  toggleAccordion() {
      this.select.open();
    
  }




  updateSelectedOption(value: string) {
    switch (value) {
      case 'yo':
        this.selectedOption = 'Tus Tareas';
        this.selectedOptionEscoger = 'Escoger Tareas';
        this.setUsuarioSelectActual(this.usuarioService.uid);
        break;
      default:
        this.selectedOption = `Tareas de ${value}`;
        this.selectedOptionEscoger = `Escoger Tareas para ${value}`;
        var usuarioEncontrado = this.usuariosSubordinados.find(usuario => usuario.nombre === value);
      if(usuarioEncontrado!==undefined)
        this.setUsuarioSelectActual(usuarioEncontrado?.uid);
        break;
    }
  
    this.recargarTareasElegidasPorUsuario(this.grupo, this.usaurioActual);
  }


  setUsuarioSelectActual(usuario: string) {
    this.usaurioActual = usuario;
    this.usuarioService.setUsuarioSelectActual(usuario);
  }

  terminarTutorial(){
    localStorage.setItem('tutorial','visto');
    this.tutorial=false;

  }

  async triggerActionSheet(selector:string) {

    switch (selector) {
      case "tutorial":
        var actionSheet = await this.actionSheetController.create({
          header: '¿Deseas terminar el tutorial?',
          mode: 'ios',
          buttons: this.tutorialDialog
        });
        await actionSheet.present();
        break;
    
      case "salir-grupo-usuarios":
        var actionSheet = await this.actionSheetController.create({
          header: '¿Deseas echar al usuario?',
          mode: 'ios',
          buttons: this.tutorialDialog
        });
        await actionSheet.present();
  
        break;
    
      case "eliminar-grupo":
        var actionSheet = await this.actionSheetController.create({
          header: '¿Deseas eliminar el grupo?',
          mode: 'ios',
          buttons: this.tutorialDialog
        });
        await actionSheet.present();
  
        break;
  
      default:
        console.log("Opción no reconocida");
        break;
    }
  
  }



  // logica relacionada con las notificaciones
  addListeners = async () => {
    await PushNotifications.addListener('registration', async token => {
      console.info('Registration token: ', token.value);
      this.sendTokenToServer(token.value)
    });
  
    await PushNotifications.addListener('registrationError', err => {
      console.error('Registration error: ', err.error);
    });
  
    await PushNotifications.addListener('pushNotificationReceived', notification => {
      console.log('Push notification received: ', notification);
    });
  
    await PushNotifications.addListener('pushNotificationActionPerformed', notification => {
      console.log('Push notification action performed', notification.actionId, notification.inputValue);
    });
  }
  
   registerNotifications = async () => {
    let permStatus = await PushNotifications.checkPermissions();
  
    if (permStatus.receive === 'prompt') {
      permStatus = await PushNotifications.requestPermissions();
    }
  
    if (permStatus.receive !== 'granted') {
      throw new Error('User denied permissions!');
    }
  
    await PushNotifications.register();
  }
  
   getDeliveredNotifications = async () => {
    const notificationList = await PushNotifications.getDeliveredNotifications();
    // console.log('delivered notifications', notificationList);
  }
  
  
  sendTokenToServer = async (token:string) => {
  
    this.usuarioService.almacenarFCMToken(token).subscribe((res)=>{
      console.log('Token enviado al servidor:', res);
  
    },(err)=>{
      console.error('Error al enviar el token al servidor:', err);
  
    })
  }
}
