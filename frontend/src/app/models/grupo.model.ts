export class Grupo{
    constructor(
        public id:string|null,
        public nombre:string|null,
        public admin:string|null,
        public usuarios?:string[],

    ){}
}