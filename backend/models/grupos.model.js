const{Schema, model}= require('mongoose');

const GrupoSchema= Schema(
    {
        nombre:{
            type: String,
            require:true
        },
        admin:{
            type: Schema.Types.ObjectId,
            ref:'Usuario'
        },
        usuarios:{
            type: [Schema.Types.ObjectId],
            ref:'Usuario'
        },
        codigo:{
            type: String
        }

    }, {collection: 'grupos'}
);

GrupoSchema.method('toJSON',function(){
    const {__v,_id, ...object} = this.toObject();
    
    object.uid = _id;
    return object;
})

module.exports= model('Grupo', GrupoSchema);