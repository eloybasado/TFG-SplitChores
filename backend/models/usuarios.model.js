const{Schema, model}= require('mongoose');

const UsuarioSchema= Schema(
    {
        nombre:{
            type: String,
            require:true
        },
        apellidos:{
            type: String
        },
        email:{
            type: String,
            require:true,
            unique:true
        },
        rol: {
            type: String,
            // default: "USUARIO"
        },
        password:{
            type: String,
            require:true
        },
        sexo:{
            type:String,
            require:true
        },
        fcmToken:{
            type:String,
        },
        fecNacimiento:{
            type:Date,
        },
        puntos:{
            type:Number,
        },
        avatar:{
            type:String
        },
        codigo:{
            type: String
        },
        usuariosSubordinados:[{
            type: Schema.Types.ObjectId,
            ref:'Subordinado'
        }]
    }, {collection: 'usuarios'}
);

UsuarioSchema.method('toJSON',function(){
    const {__v,_id,password, ...object} = this.toObject();
    
    object.uid = _id;
    return object;
})

module.exports= model('Usuario', UsuarioSchema);