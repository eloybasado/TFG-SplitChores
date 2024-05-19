import { Component,NgZone, Input, OnInit, Output, EventEmitter } from "@angular/core";
import { FormBuilder, Validators,FormArray, FormControl } from "@angular/forms";
import { TareasService } from "src/app/services/tareas.service";
import { ActivatedRoute, Router } from "@angular/router";
import { Tarea } from "src/app/models/tarea.model";
import { ItemReorderEventDetail } from '@ionic/angular';
import { UsuariosService } from "src/app/services/usuarios.service";
import { Location } from '@angular/common';
import { GruposService } from "src/app/services/grupos.service";
import { NotificationsService } from "src/app/services/notifications.service";
import { TareasPage } from "../tareas/tareas.page";
@Component({
  selector: 'app-crear-tarea',
  templateUrl: './crear-tarea.page.html',
  styleUrls: ['./crear-tarea.page.scss'],
})
export class CrearTareaPage implements OnInit {

  tareaForm = this.formBuilder.group({
    nombre: ['', Validators.required],
    descripcion: ['', Validators.required],
    fechaLimite:[null, Validators.required],
    dificultad:['', Validators.required],
     recurrente: [false,Validators.required],
    frecuencia:[1,Validators.required],
    frecuenciaSelect:[null,Validators.required],
    rotacion:[[]]
  })

  public selectedFrecuencia: string='';

  public frecuenciaSemanal:boolean[] = Array.from({ length: 7 }, () => false);
  public idTarea:string|null;
  public fechaMinima:string;
  public editando:boolean=false;
  public toggleActivado:boolean = false;
  public isToastOpen:boolean = false;
  public grupo:string='';
  public rotacionArray: FormArray<any> = this.formBuilder.array([]);
  public usuariosNoRotacion: FormArray<any> = this.formBuilder.array([]);
  public  presetColors: string[] = ['verdepastel', 'moradopastel', 'rojopastel', 'amarillopastel', 'azulpastel', 'rosapastel'];
  public  codeColors: string[] = ['#86cc96', '#9395cd', '#F68f9c', '#e4d98a', '#82b7d3', '#de8ecc'];
  public selectedColor: string = 'verdepastel';
  public codeColor:string='#86cc96';

  constructor(private formBuilder: FormBuilder,
    private tareasService: TareasService,
    private location: Location,
    private ngZone: NgZone,
    private usuariosService: UsuariosService,
    private gruposService: GruposService,
    private notificationsService: NotificationsService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private route: ActivatedRoute) { 
    this.idTarea = null;
    const hoy = new Date();
    this.fechaMinima = hoy.toISOString();

    this.grupo = this.activatedRoute.snapshot.params['grupo'];

if(this.grupo!=='sin grupo' && this.grupo!==undefined){
  this.gruposService.cargarUsuariosGrupo(this.grupo).subscribe((res) =>{
    //@ts-ignore

  const rotacionControl = this.convertirDatosAFormArray(res['usuarios'])
  if (rotacionControl instanceof FormArray) {
    this.rotacionArray = rotacionControl;
     this.tareaForm.patchValue({ rotacion: this.rotacionArray.value });
    

  } else {
    
    console.error('Error: "rotacion" no es un FormArray');
    this.rotacionArray = this.formBuilder.array([]);
  }
});
}else{
  this.usuariosService.recuperarSubordinados(this.usuariosService.uid).subscribe((res) =>{

const usuarioGestor = {

  uid: this.usuariosService.uid,
  nombre: this.usuariosService.nombre,
  avatar: this.usuariosService.avatar,
};

    //@ts-ignore
  res['subordinados'].push(usuarioGestor);
    //@ts-ignore

  const rotacionControl = this.convertirDatosAFormArray(res['subordinados'])
  if (rotacionControl instanceof FormArray) {
    this.rotacionArray = rotacionControl;
     this.tareaForm.patchValue({ rotacion: this.rotacionArray.value });
    

  } else {
    
    console.error('Error: "rotacion" no es un FormArray');
    this.rotacionArray = this.formBuilder.array([]);
  }
});
}
//@ts-ignore
this.tareaForm.get('recurrente').setValue(false);

    }

  ngOnInit() {
    this.idTarea = null;
    this.toggleActivado=false;

        // verificar si hay un ID de tarea para saber si estamos editando o creando
        const tareaRuta = this.activatedRoute.snapshot.params['id'];




        if (tareaRuta) {
          const diasDeLaSemana: string[] = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
          this.idTarea = tareaRuta;
          this.tareasService.cargarTarea(tareaRuta).subscribe((res) =>{
            //@ts-ignore
             if(res['tarea']['recurrente']===true){
              this.toggleActivado=true
             }
             //@ts-ignore
             this.selectColorByCode(res['tarea']['color'])
             //@ts-ignore
             this.frecuenciaSemanal= res['tarea']['frecuenciaSemanal'];
             //@ts-ignore
             if(!this.frecuenciaSemanal.includes(true)){
                this.selectedFrecuencia='frecuencia'
             } else if(this.frecuenciaSemanal.filter(valor => valor === true).length > 0){
              this.selectedFrecuencia='semanal-variado'

              for (let i=0;i<diasDeLaSemana.length;i++) {
                  if(this.frecuenciaSemanal[i]===true){
                      this.selectedDays.push(diasDeLaSemana[i])
                  }
              }
             }
            
            this.editando=true;
            this.tareaForm.patchValue({
              //@ts-ignore
              nombre: res['tarea']['nombre'],
              //@ts-ignore
              descripcion: res['tarea']['descripcion'],
              //@ts-ignore
               fechaLimite: res['tarea']['fechaLimite'],
              //@ts-ignore
               dificultad:  res['tarea']['dificultad'],
              //@ts-ignore
               recurrente:  res['tarea']['recurrente'],
              //@ts-ignore
               frecuencia:  res['tarea']['frecuencia'],
              //@ts-ignore
               frecuenciaSelect: this.selectedFrecuencia
            });

          });
        }

        
  }

  crearTarea(){

        if(!this.validarFormulario()) {
      return;
    }

   

    var idsFormateados
    if(this.rotacionArray!==null){
      //@ts-ignore
     idsFormateados = this.rotacionArray.value.map(item => item.id);
  }


    const tarea: Tarea = new Tarea(this.idTarea,this.tareaForm.get('nombre')!.value,this.tareaForm.get('fechaLimite')!.value,
    this.tareaForm.get('dificultad')!.value,this.tareaForm.get('recurrente')!.value,this.usuariosService.uid, this.tareaForm.get('frecuencia')!.value,this.frecuenciaSemanal,this.tareaForm.get('descripcion')!.value, idsFormateados, this.codeColor);

    if(this.editando===false){
      this.nuevaTarea(tarea);
    } else{
      this.updateTarea(tarea);
    }
  }



  nuevaTarea(tarea: Tarea) {
    this.tareasService.crearTarea(tarea)
      .subscribe((res) => {

        this.router.navigateByUrl('/usuario/tareas').then(() => {;
          this.notificationsService.lanzarNotificacion('crearTarea');

        
        });
      }, (err) => {
        const errorMssg = err.error.msg || 'No se pudo completar la acción, vuelva a intentarlo más adelante';
        // this.notificacionesService.mostrarNotificacion(errorMssg, 'danger');
        return;
      });
  }

  updateTarea(tarea: Tarea) {

    this.tareasService.actualizarTarea(tarea)
      .subscribe((res) => {
        

        this.router.navigateByUrl('/usuario/tareas').then(() => {

          this.notificationsService.lanzarNotificacion('editarTarea');
         
          
        });

      }, (err) => {
        const errorMssg = err.error.msg || 'No se pudo completar la acción, vuelva a intentarlo más adelante';
        // this.notificacionesService.mostrarNotificacion(errorMssg, 'danger');
        return;
      });
  }

  setOpen(isOpen: boolean,mensaje:string) {
    this.isToastOpen = isOpen;
  }


  validarFormulario() {
    const campos = ['nombre', 'fechaLimite', 'dificultad','frecuenciaSelect']; // Lista de campos a validar
    let valid = true;
    campos.forEach(campo => {
      const elemento = document.getElementById(campo);
      if (elemento && this.tareaForm.get(campo)!.invalid) {
        elemento.classList.add('is-invalid');
        valid = false;
        
      } else if (elemento) {
        elemento.classList.remove('is-invalid');
      }

      if(this.toggleActivado===true && this.rotacionArray.length<1 && this.editando===false){
        document.getElementById('error-rotacion')?.classList.add('is-invalid');
          valid=false;
      }
    });
  
    return valid;
  }

  onToggleChange() {
    this.ngZone.run(() => {
      this.toggleActivado = !this.toggleActivado;
      //@ts-ignore
      this.tareaForm.get('recurrente').patchValue(this.toggleActivado);
      //@ts-ignore
      this.tareaForm.get('frecuenciaSelect').patchValue(null);
      this.selectedFrecuencia='';
    });
  }

  handleReorder(ev: CustomEvent<ItemReorderEventDetail>) {


    const elementoReordenado = this.rotacionArray.at(ev.detail.from);
    this.rotacionArray.removeAt(ev.detail.from);
    this.rotacionArray.insert(ev.detail.to, elementoReordenado);
    this.tareaForm.patchValue({ rotacion: this.rotacionArray.value });

    ev.detail.complete();
  }

  private convertirDatosAFormArray(datos: any[]): FormArray {
    const formControls = datos.map(dato => this.formBuilder.group({
      id: dato.uid,
      nombre: dato.nombre,
      avatar: dato.avatar
      // Agrega más campos según sea necesario
    }));
    return this.formBuilder.array(formControls);
  }

  sacarUsuario(uid:string){
    let indice=this.rotacionArray.value.findIndex((objeto: { id: string; }) => objeto.id === uid);

    if (indice !== -1) {
      const usuarioEliminado = this.rotacionArray.at(indice).value;
      this.rotacionArray.removeAt(indice);
      this.usuariosNoRotacion.push(this.formBuilder.group(usuarioEliminado));
    }
  }

  meterUsuario(uid:string){
    let indice=this.usuariosNoRotacion.value.findIndex((objeto: { id: string; }) => objeto.id === uid);

    if (indice !== -1) {
      const usuarioEliminado = this.usuariosNoRotacion.at(indice).value;
      this.usuariosNoRotacion.removeAt(indice);
      this.rotacionArray.push(this.formBuilder.group(usuarioEliminado));
    }
  }

  onFrecuenciaChange(event: CustomEvent) {
    this.selectedFrecuencia = event.detail.value;
    this.frecuenciaSemanal.fill(false);

    if(this.selectedFrecuencia==='laboral'){
      this.frecuenciaSemanal.fill(true, 0, 5);
    }
  
    
  }

  selectedDays: string[] = [];


  onDaySelected(event: CustomEvent) {
    const selectedDay = event.detail.value;

    this.frecuenciaSemanal.fill(false);
    
    this.setWeekDayTrue(selectedDay,true);


  }

  toggleDay(day: string) {
    const index = this.selectedDays.indexOf(day);
    if (index !== -1) {
      this.selectedDays.splice(index, 1); // Deseleccionar el dia
    this.setWeekDayTrue(day,false);


    } else {
      this.selectedDays.push(day); // Seleccionar el dia
    this.setWeekDayTrue(day,true);


    }
  }
  
  isDaySelected(day: string) {
    return this.selectedDays.includes(day);
  }


  setWeekDayTrue(selectedDay:string, value:boolean){
    switch (selectedDay) {
      case 'lunes':
        this.frecuenciaSemanal[0] = value; 
          break;
      case 'martes':
        this.frecuenciaSemanal[1] = value; 
          break;
      case 'miércoles':
        this.frecuenciaSemanal[2] = value; 
          break;
      case 'jueves':
        this.frecuenciaSemanal[3] = value;
          break;
      case 'viernes':
        this.frecuenciaSemanal[4] = value;
          break;
      case 'sábado':
        this.frecuenciaSemanal[5] = value;
          break;
      case 'domingo':
        this.frecuenciaSemanal[6] = value;
          break;
      default:
          console.log('Día no válido.');
  }
  }

  selectColor(color: string) {
    this.selectedColor = color;
    this.codeColor=this.codeColors[this.presetColors.indexOf(color)]
  }

  selectColorByCode(code: string) {
    this.codeColor = code;
    this.selectedColor=this.presetColors[this.codeColors.indexOf(code)]
  }
}
