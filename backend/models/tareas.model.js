const{Schema, model}= require('mongoose');

const TareaSchema= Schema(
    {
        nombre:{
            type: String,
            require:true
        },
        fechaLimite:{
            type:Date,
        },
        dificultad:{
            type: String,
            require:true
        },
        recurrente:{
            type: Boolean,
            require:true
        },
        frecuencia:{
            type:Number
        },
        frecuenciaSemanal:[{
            type: Boolean
        }],
        descripcion:{
            type: String
        },
        rotacion:[{
            type: Schema.Types.ObjectId,
            ref:'Usuario'
        }],
        completada:{
            type: Boolean,
            require: true
        },
        elegida:{
            type: Schema.Types.ObjectId,
            ref:'Usuario'
        },
        usuario:{
            type: Schema.Types.ObjectId,
            ref:'Usuario'
        },
        fallida:{
            type: Boolean
        },
        color:{
            type: String
        },
    }, {collection: 'tareas'}
);

TareaSchema.method('toJSON',function(){
    const {__v,_id, ...object} = this.toObject();
    
    object.uid = _id;
    return object;
})

module.exports= model('Tarea', TareaSchema);