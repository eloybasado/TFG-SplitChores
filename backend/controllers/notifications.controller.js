const  firebase  = require('firebase-admin');
const Usuario= require('../models/usuarios.model');
const {response}= require('express');
const { infoToken } = require('../utils/infotoken');


const enviarNotificacion = async(req,res=response) =>{

    const token = req.header('x-token')
    const { uid } = infoToken(token);
    const usuario = req.body.usuario;

    try{
        const emisor = await Usuario.findById(uid);


        if(!emisor){
            return res.status(400).json({
                ok: false,
                msg: 'No existe este usuario en nuestra BD',
            });
        }

        const receptor = await Usuario.findById(usuario);

        if(!receptor.fcmToken){
            return res.status(400).json({
                ok: false,
                msg: 'El usuario no permite notificaciones',
            });
        }

        let userToken = receptor.fcmToken;

        let message = {
            token: userToken,
            notification:{
                title:emisor.nombre+' te recuerda que tienes tareas pendientes.' ,
                body:'Echa un vistazo a tus tareas pendientes'
            }
        }

            try{
                const response = await firebase.messaging().send(message)
                console.log('Notificacion enviada con exito', response)

                res.json({
                    ok:true,
                    msg:'Notificacion enviada'
                })
            }catch(err){
                console.error(':(',err)
            }
        }

    catch(error){
        console.log(error);
        return  res.status(400).json({
            ok:false,
            msg:'Error enviando notificacion'
        })
    }
}


module.exports = {
    enviarNotificacion
   }