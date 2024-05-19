export class Tarea{
    constructor(
        public id:string|null,
        public nombre:string|null,
        public fechaLimite:Date|null,
        public dificultad:string|null,
        public recurrente:boolean|null,
        public usuario:string|null,
        public frecuencia?:number|null,
        public frecuenciaSemanal?:boolean[]|null,
        public descripcion?:string|null,
        public rotacion?: string[]|null,
        public color?:string,
        public completada?: boolean,
        public elegida?:string,
    ){}
}