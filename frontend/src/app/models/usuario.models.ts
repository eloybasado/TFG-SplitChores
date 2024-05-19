export class Usuario{
    constructor(public uid:string,
                public nombre?:string|null,
                public apellidos?:string|null,
                public email?:string|null,
                public rol?:string,
                public password?:string|null,
                public avatar?:string,
                public sexo?:string,
                public fcmToken?:string,
                public puntos?:number,
                public usuariosSubordinados?: string[],){}
    }
