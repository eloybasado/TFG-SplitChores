const Usuario= require('../models/usuarios.model');
const Tarea = require('../models/tareas.model');
const Grupo = require('../models/grupos.model');
const {response}= require('express');
const cron = require('node-cron');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose'); 
const { infoToken } = require('../utils/infotoken');
const { calcularFechaRecurrente } = require('../utils/calcularFechaRecurrente');
const { calcularUsuario } = require('../utils/calcularUsuario');

//generico para admins de la app y debug
const obtenerTareas=async(req, res=response)=>{

    // const token = req.header('x-token');
    // const {uid,rol} = infoToken(token);
    // const desde = Number(req.query.desde) || 0;
    // const registropp = Number(req.query.registropp) || 10;
    // const texto = req.query.texto;
    // const musculo = req.query.musculo;

    // let textoBusqueda = '';
    // if (texto) {
    //     textoBusqueda = new RegExp(texto, 'i');
    // }

    // const id = req.query.id || '';


    // try {



    //     const usuario = await Usuario.findById(uid);

    //     if(!usuario){
    //         return res.status(400).json({
    //             ok: false,
    //             msg: 'No existe este usuario en nuestra BD',
    //         });
    //     }
    //     let tareas, total;
    //     if(rol=='ADMIN'){
    //     console.log(' todavia no se ha implementado la vista de administradores')
    //     }
    //     else if(rol==='USUARIO'){
    //         res.status(400).json({
    //             ok:false,
    //             msg: 'Los usuarios no pueden ver tareas de manera global',
    //             error
    //         });
            

    //     }
        
    //     res.json({
    //         ok:true,
    //         msg:'Obtener tareas',
    //         tareas,
    //         page: {
    //             desde,
    //             registropp,
    //             total
    //         }
    //     })

    // } catch (error) {
    //     console.log(error);
    //     res.status(400).json({
    //         ok:false,
    //         msg: 'Error obteniendo tareas',
    //         error
    //     });
    // }
}

//para tareas sin elegir de un grupo
const obtenerTareasUsuario=async(req, res=response)=>{
    const modo = req.query.modo;
    
    const uidReq=req.query.usuario;
    const token = req.header('x-token');
    const {uid,rol} = infoToken(token);
    const desde = Number(req.query.desde) || 0;
    const registropp = Number(req.query.registropp) || 10;
    const texto = req.query.texto;
    const grupoId = req.query.grupo;
    let tareasEncontradas = [];

    let textoBusqueda = '';
    if (texto) {
        textoBusqueda = new RegExp(texto, 'i');
    }
    // Obtenemos el ID de tarea por si quiere buscar una sola tarea.
    const id = req.query.id || '';


    try {
        var usuario=null;
    //  console.log('req'+uidReq)
        if(uidReq===undefined){
        usuario = await Usuario.findById(uid);
        }else{
         usuario = await Usuario.findById(uidReq);
        }

        if(!usuario){
            return res.status(400).json({
                ok: false,
                msg: 'No existe este usuario en nuestra BD',
            });
        } 

        let tareas, total;
        if(rol=='ADMIN'){
            console.log('todavia no se ha implementado las vistas de administradores')
        }
        else if(rol==='USUARIO'||'SUBORDINADO'){
            var grupo;

            if(grupoId!='sin grupo'){
             grupo = await Grupo.findById(grupoId);
            }
            var usuarios=[];
            
            usuarios.push(usuario._id);
           
            // console.log('grupo',grupo)
            if(grupo){
                for(let i=0; i<grupo.usuarios.length; i++){
                    
                    if(grupo.usuarios[i].toString()!=usuarios[0]){
                    usuarios.push(grupo.usuarios[i]);
                    }
                }
            }else{
                if(usuario.rol==='SUBORDINADO'){
                    var usuarioGestor =  await Usuario.findOne({usuariosSubordinados:uidReq}).select('_id');
                    if(usuarioGestor){
                        usuarios.push(usuarioGestor)
                    }else{
                        usuarios.push(uid);
                    }
                }
            }

            


            
            if(texto){
                //para cuando haya busqueda por texto, o alomejor lo hago con el search de ionic
            } else {
                let elegida;

                if(modo==='NO-ELEGIDAS'){
                    elegida=null;
                }else if(modo==='ELEGIDAS'){
                    elegida=usuarios[0];
                }
                try {
                    for (const usuarioId of usuarios) {
                    
                        const tareasUsuario = await Tarea.find({ usuario: usuarioId, elegida: elegida, completada: false });
            
                        // Acumular las tareas encontradas en el array principal
                        tareasEncontradas = tareasEncontradas.concat(tareasUsuario);
                    }
            
             
                    // console.log(tareasEncontradas);
              
                } catch (error) {
                   
                    console.error(error);
                    res.status(400).json({
                        ok:false,
                        msg: 'Error buscando las tareas',
                        error
                    });
                }
                // [tareas, total] = await Promise.all([
                //     Tarea.find({ usuario: uid }).skip(desde).limit(registropp),
                //     // Tarea.countDocuments({ usuario: uid })
                // ])
            }
        }
        
        res.json({
            ok:true,
            msg:'Obtener tareas',
            tareas:tareasEncontradas,
            page: {
                desde,
                registropp,
                total
            }
        })

    } catch (error) {
        console.log(error);
        res.status(400).json({
            ok:false,
            msg: 'Error obteniendo tareas',
            error
        });
    }
}

//para tareas finalizadas de un grupo
//en esta funcion aprovehcamos y devolvemos los ids de usuario, nombre y en un futuro las fotos para evitar llamadas extra a bbdd
const obtenerTareasFinalizadas=async(req, res=response)=>{
    const modo = req.query.modo;
    const token = req.header('x-token');
    const {uid,rol} = infoToken(token);
    const desde = Number(req.query.desde) || 0;
    const registropp = Number(req.query.registropp) || 10;
    const texto = req.query.texto;
    const grupoId = req.query.grupo;
    let tareasEncontradas = [];
    var usuarios=[];
    var nombres=[]
    var avatares=[]
    let textoBusqueda = '';
    var status=undefined;

    if (req.query.texto) {
        textoBusqueda = texto;
        console.log(textoBusqueda)
    }

    if(req.query.status==='completada'){
        status=false;
    }else if(req.query.status==='fallida'){
        status=true;
    }

    try {



        const usuario = await Usuario.findById(uid);

        if(!usuario){
            return res.status(400).json({
                ok: false,
                msg: 'No existe este usuario en nuestra BD',
            });
        } 

        let tareas, total;
        if(rol=='ADMIN'){
            console.log('todavia no se ha implementado las vistas de administradores')
        }
        else if(rol==='USUARIO' || 'SUBORDINADO'){
            var grupo;

            if(grupoId!='sin grupo'){
             grupo = await Grupo.findById(grupoId);
            }

            

  
            if(grupo){
                for(let i=0; i<grupo.usuarios.length; i++){
                    const usuarioAux=await Usuario.findById(grupo.usuarios[i]);
                    // console.log(usuarioAux.nombre)
                    nombres.push(usuarioAux.nombre)
                    avatares.push(usuarioAux.avatar)
                    usuarios.push(grupo.usuarios[i]);
                    
                }
            }else{
                //no hay grupo pero podria haber subordinados
                 usuarios.push(usuario._id);
                nombres.push(usuario.nombre);
                avatares.push(usuario.avatar);

                if(rol==='USUARIO' && usuario.usuariosSubordinados){
                    for(let i=0; i<usuario.usuariosSubordinados.length;i++){
                        const subordinado = await Usuario.findById(usuario.usuariosSubordinados[i]);

                        if(subordinado){
                            usuarios.push(subordinado._id);
                            nombres.push(subordinado.nombre);
                            avatares.push(subordinado.avatar);
                        }
                    }
                } else if( rol==='SUBORDINADO'){
                    const usuarioGestor = await Usuario.findOne({ usuariosSubordinados:uid});

                    if(usuarioGestor){
                        usuarios.push(usuarioGestor._id);
                        nombres.push(usuarioGestor.nombre);
                        avatares.push(usuarioGestor.avatar);
                        if( usuarioGestor.usuariosSubordinados){
                            for(let i=0; i<usuarioGestor.usuariosSubordinados.length;i++){
                                const subordinado = await Usuario.findById(usuarioGestor.usuariosSubordinados[i]);
        
                                if(subordinado){
                                    usuarios.push(subordinado._id);
                                    nombres.push(subordinado.nombre);
                                    avatares.push(subordinado.avatar);
                                }
                            }
                        }

                    }
                }
            }

            


            
            if(textoBusqueda!==''){
                try {
                    
                    const consultas = usuarios.map(async (usuarioId) => {
                        let filtroCompletada = {};

                        if(status !== undefined){
                            filtroCompletada = { fallida: status}
                        }

                        return await Tarea.find({ elegida: usuarioId,...filtroCompletada, completada: true, nombre:{ $regex: '.*' + texto + '.*', $options: 'i' } })
                          .sort({ fechaLimite: -1 })
                          .skip(desde)
                          .limit(registropp);
                      });
                      
                      const resultados = await Promise.all(consultas);
                      
                      // concatenar y ordenar las tareas
                      tareasEncontradas = resultados.flat().sort((a, b) => b.fechaLimite - a.fechaLimite);
          
            } catch (error) {
               
                console.error(error);
                console.log(error);
                res.status(400).json({
                    ok:false,
                    msg: 'Error buscando las tareas',
                    error
                });
            }


            } else {
                //Para en un futuro recuperar solo las completadas o falladas de un solo usuario
                // let elegida;

                // if(modo==='usuario'){
                //     elegida=null;
                // }else if(modo==='grupo'){
                //     elegida=usuarios[0];
                // }
                try {
                  
                    
                        const consultas = usuarios.map(async (usuarioId) => {
                            let filtroCompletada = {};

                            if(status !== undefined){
                                filtroCompletada = { fallida: status}
                            }
                            return await Tarea.find({ elegida: usuarioId, ...filtroCompletada, completada: true })
                              .sort({ fechaLimite: -1 })
                              .skip(desde)
                              .limit(registropp);
                          });
                          
                          const resultados = await Promise.all(consultas);
                          
                          // concatenar y ordenar las tareas
                          tareasEncontradas = resultados.flat().sort((a, b) => b.fechaLimite - a.fechaLimite);
              
                } catch (error) {
                   
                    console.error(error);
                    console.log(error);
                    res.status(400).json({
                        ok:false,
                        msg: 'Error buscando las tareas',
                        error
                    });
                }
                // [tareas, total] = await Promise.all([
                //     Tarea.find({ usuario: uid }).skip(desde).limit(registropp),
                //     // Tarea.countDocuments({ usuario: uid })
                // ])
            }
        }
        
        res.json({
            ok:true,
            msg:'Obtener tareas',
            tareas:tareasEncontradas,
            usuarios:{
                uid:usuarios,
                nombres:nombres,
                avatares:avatares
            },
            page: {
                desde,
                registropp,
                total
            }
        })

    } catch (error) {
        console.log(error);
        res.status(400).json({
            ok:false,
            msg: 'Error obteniendo tareas',
            error
        });
    }
}

const crearTarea = async(req,res=response) =>{

    const token = req.header('x-token')
    const { uid } = infoToken(token);
    // console.log(req.body.fechaLimite)
    // console.log(req.body.descripcion)
    try{
        const usuario = await Usuario.findById(uid);


        if(!usuario){
            return res.status(400).json({
                ok: false,
                msg: 'No existe este usuario en nuestra BD',
            });
        }
    


        const object = req.body;
        object.elegida=null;
        object.completada=false;
        
        const idsArray = object.rotacion.split(',');
       
        object.rotacion = idsArray;

        object.frecuenciaSemanal = object.frecuenciaSemanal.split(',');

        object.frecuenciaSemanal = object.frecuenciaSemanal.map(valorString => valorString === "true");

        const tarea = new Tarea(object);

        if(tarea.recurrente===true){
            tarea.elegida=tarea.rotacion[0];

            tarea.fechaLimite=calcularFechaRecurrente(tarea,true);

        }else{
            tarea.rotacion=null;
            tarea.frecuencia=null;
        }
        // console.log('tarea'+tarea)
         await tarea.save()

        res.json({
            ok:true,
            msg:"crearTarea",
            usuario
        })
    }
    catch(error){
        console.log(error);
        return  res.status(400).json({
            ok:false,
            msg:'Error creando tarea'
        })
    }

    
}



const actualizarTarea = async(req,res=response) =>{

    const token = req.header('x-token')
    const { uid } = infoToken(token);
    // console.log(req.body.fechaLimite)
    try{
        const usuario = await Usuario.findById(uid);


        if(!usuario){
            return res.status(400).json({
                ok: false,
                msg: 'No existe este usuario en nuestra BD',
            });
        }

        var { id, nombre, fechaLimite,descripcion, dificultad, recurrente, frecuencia,frecuenciaSemanal, color } = req.body;
        frecuenciaSemanal = frecuenciaSemanal.split(',');

        frecuenciaSemanal = frecuenciaSemanal.map(valorString => valorString === "true");

        var camposActualizar='';
        if(recurrente==='true'){
             camposActualizar = {
                nombre,
                descripcion,
                fechaLimite,
                dificultad,
                recurrente,
                frecuencia,
                frecuenciaSemanal,
                color
              };
        }else if(recurrente==='false'){
             camposActualizar = {
                nombre,
                descripcion,
                fechaLimite,
                dificultad,
                recurrente,
                color
              };
        }



        const tareaActualizada = await Tarea.findByIdAndUpdate(
          id,
          camposActualizar,
          { new: true } // devuelve el documento actualizado
        );
    





        // console.log('tarea'+tareaActualizada)


        res.json({
            ok:true,
            msg:"Actualizar Tarea",
            usuario,
            tarea: tareaActualizada
        })
    }
    catch(error){
        console.log(error);
        return  res.status(400).json({
            ok:false,
            msg:'Error actualizando tarea'
        })
    }

    
}

const eliminarTarea = async(req,res=response) =>{

    const token = req.header('x-token');
    const tareaId = req.query.id || '';
    const {uid,rol} = infoToken(token);


    try {



        const usuario = await Usuario.findById(uid);

        if(!usuario){
            return res.status(400).json({
                ok: false,
                msg: 'No existe este usuario en nuestra BD',
            });
        } 

        if(rol=='ADMIN'){
            console.log('todavia no se ha implementado las vistas de administradores')
        }
        else if(rol==='USUARIO'){

                try {
                    
                       await Tarea.findByIdAndDelete(tareaId);

              
                } catch (error) {
                   
                    console.error(error);
                    console.log(error);
                    res.status(400).json({
                        ok:false,
                        msg: 'Error eliminando la tarea',
                        error
                    });
                }
            
        }
        
        res.json({
            ok:true,
            msg:'Eliminar Tarea',
        })

    } catch (error) {
        console.log(error);
        res.status(400).json({
            ok:false,
            msg: 'Error eliminado tarea',
            error
        });
    }

}

const obtenerTarea = async(req,res=response) =>{

    const token = req.header('x-token');
    const tareaId = req.query.id || '';
    const {uid,rol} = infoToken(token);
    var tarea;


    try {



        const usuario = await Usuario.findById(uid);

        if(!usuario){
            return res.status(400).json({
                ok: false,
                msg: 'No existe este usuario en nuestra BD',
            });
        } 

        if(rol=='ADMIN'){
            console.log('todavia no se ha implementado las vistas de administradores')
        }
        else if(rol==='USUARIO'){

                try {
                    
                  tarea=await Tarea.findById(tareaId);

              
                } catch (error) {
                   
                    console.error(error);
                    console.log(error);
                    res.status(400).json({
                        ok:false,
                        msg: 'Error recuperando la tarea',
                        error
                    });
                }
            
        }
        
        res.json({
            ok:true,
            msg:'Obtener Tarea por Id',
            tarea:tarea
        })

    } catch (error) {
        console.log(error);
        res.status(400).json({
            ok:false,
            msg: 'Error recuperando tarea',
            error
        });
    }

}


const escogerTarea = async(req,res=response) =>{
    const token = req.header('x-token')
    const { uid } = infoToken(token);
    const uidReq = req.body.usuario;

    // console.log(uidReq)

    try{
        var usuario=null;
    //  console.log('req'+uidReq)
        if(uidReq===undefined){
        usuario = await Usuario.findById(uid);
        }else{
         usuario = await Usuario.findById(uidReq);
        }
        if(!usuario){
            return res.status(400).json({
                ok: false,
                msg: 'No existe este usuario en nuestra BD',
            });
        }

        var tarea = await Tarea.findById(req.body.tarea);

        if(!tarea){
            return res.status(400).json({
                ok: false,
                msg: 'No existe esta tarea en nuestra BD',
            });
        }

        if(tarea.elegida!=null){
            return res.json({
                ok: true,
                msg: 'Lo sentimos otro usuario acaba de escoger otra tarea',
            });
        }


        tarea.elegida=usuario._id;

        await tarea.save();

        res.json({
            ok:true,
            msg:"escogerTarea",
            usuario,
            tarea
        })
    }
    catch(error){
        console.log(error);
        return  res.status(400).json({
            ok:false,
            msg:'Error escogiendo tarea'
        })
    }
}


const completarTarea = async(req,res=response) =>{
 
    const token = req.header('x-token')
    const  uid  = req.body.usuario;
    var nuevaTareaRecurrente;

    try{
        const usuario = await Usuario.findById(uid);


        if(!usuario){
            return res.status(400).json({
                ok: false,
                msg: 'No existe este usuario en nuestra BD',
            });
        }

        var tarea = await Tarea.findById(req.body.tarea);

        if(!tarea){
            return res.status(400).json({
                ok: false,
                msg: 'No existe esta tarea en nuestra BD',
            });
        }



        if(tarea.elegida!=uid){
    

            return res.json({
                ok: true,
                msg: 'Lo sentimos esta tarea no está seleccionada por ti',
            });
        }

            //tarea puntual
            tarea.completada = true;
            tarea.fallida = false;
             console.log("Dificultad previa.",usuario.puntos); 
    
            switch(tarea.dificultad.toLowerCase()) {
                case "facil":
                    usuario.puntos=usuario.puntos+50;
                    break;
                case "media":
                    usuario.puntos=usuario.puntos+100;
                    break;
                case "dificil":
                    usuario.puntos=usuario.puntos+200;
                    break;
                default:
                    console.log("Dificultad no válido."); 
                    break;
            }
    
            console.log("Dificultad post.",usuario.puntos); 
    
    
            await usuario.save();
            await tarea.save();
    
       if(tarea.recurrente===true){
            //crear nueva instancia de tarea recurrente asignada al siguiente usuario y siguiente fecha
                var nuevaTareaRecurrente = new Tarea();
                nuevaTareaRecurrente.nombre=tarea.nombre;
                nuevaTareaRecurrente.fechaLimite=tarea.fechaLimite;
                nuevaTareaRecurrente.dificultad=tarea.dificultad;
                nuevaTareaRecurrente.recurrente=tarea.recurrente;
                nuevaTareaRecurrente.frecuencia=tarea.frecuencia;
                nuevaTareaRecurrente.frecuenciaSemanal=tarea.frecuenciaSemanal;
                nuevaTareaRecurrente.descripcion=tarea.descripcion;
                nuevaTareaRecurrente.rotacion=tarea.rotacion;
                nuevaTareaRecurrente.completada=false;
                nuevaTareaRecurrente.elegida=tarea.elegida;
                nuevaTareaRecurrente.usuario=tarea.usuario;
                nuevaTareaRecurrente.fallida=false;
                nuevaTareaRecurrente.color=tarea.color;
                // nuevaTareaRecurrente = new Tarea(tareaSinId);
            
                nuevaTareaRecurrente.fechaLimite=calcularFechaRecurrente(nuevaTareaRecurrente,false);
                //asignar el nuevo usuario
                nuevaTareaRecurrente.elegida=calcularUsuario(nuevaTareaRecurrente,tarea);

                await nuevaTareaRecurrente.save();
        }

        res.json({
            ok:true,
            msg:"completarTarea",
            usuario,
            tarea
        })
    }
    catch(error){
        console.log(error);
        return  res.status(400).json({
            ok:false,
            msg:'Error completando la tarea'
        })
    }
}

const liberarTarea = async(req,res=response) =>{
    const token = req.header('x-token')
    const { uid } = infoToken(token);
    const uidReq=req.body.usuario;

 
    try{
        var usuario=null;
        console.log('req'+uidReq)
           if(uidReq===undefined){
           usuario = await Usuario.findById(uid);
           }else{
            usuario = await Usuario.findById(uidReq);
           }


        if(!usuario){
            return res.status(400).json({
                ok: false,
                msg: 'No existe este usuario en nuestra BD',
            });
        }

        var tarea = await Tarea.findById(req.body.tarea);

        if(!tarea){
            return res.status(400).json({
                ok: false,
                msg: 'No existe esta tarea en nuestra BD',
            });
        }



        try{
            await Tarea.updateOne({_id:req.body.tarea}, {$set: {elegida: null}});
            }catch(error){
    
                console.log(error);
                return  res.status(400).json({
                    ok:false,
                    msg:'Error liberando la tarea'
                })
            }

        res.json({
            ok:true,
            msg:"liberarTarea",
            usuario,
            tarea
        })
    }
    catch(error){
        console.log(error);
        return  res.status(400).json({
            ok:false,
            msg:'Error escogiendo tarea'
        })
    }
}

const comprobarTareas = async(req,res=response) =>{
    //se ejecuta a las 00:10 por tanto fecha de ayer
    const fechaAyer = new Date();
    console.log(fechaAyer)
    fechaAyer.setHours(24, 0, 0, 0);
    console.log(fechaAyer)
    fechaAyer.setDate(fechaAyer.getDate() - 1);
     // Establecer la hora a 00:00:00

    console.log(fechaAyer);
    //se recuperan solo las tareas con fecha de ayer
    try{
        var tareas = await Tarea.find({ fechaLimite: { $lt: new Date(), $gte: fechaAyer },completada: false })
        console.log('Tareas con fecha de ayer'+tareas)

                // Actualizar las tareas encontradas
                for (const tarea of tareas) {
                    if(tarea.recurrente===false){
                        tarea.completada = true;
                        tarea.fallida = true;
                    }else if(tarea.recurrente===true){
                        var nuevaTareaRecurrente = new Tarea();
                        nuevaTareaRecurrente.nombre=tarea.nombre;
                        nuevaTareaRecurrente.fechaLimite=tarea.fechaLimite;
                        nuevaTareaRecurrente.dificultad=tarea.dificultad;
                        nuevaTareaRecurrente.recurrente=tarea.recurrente;
                        nuevaTareaRecurrente.frecuencia=tarea.frecuencia;
                        nuevaTareaRecurrente.frecuenciaSemanal=tarea.frecuenciaSemanal;
                        nuevaTareaRecurrente.descripcion=tarea.descripcion;
                        nuevaTareaRecurrente.rotacion=tarea.rotacion;
                        nuevaTareaRecurrente.completada=false;
                        nuevaTareaRecurrente.elegida=tarea.elegida;
                        nuevaTareaRecurrente.usuario=tarea.usuario;
                        nuevaTareaRecurrente.fallida=false;
                        // nuevaTareaRecurrente = new Tarea(tareaSinId);
                    
                        nuevaTareaRecurrente.fechaLimite=calcularFechaRecurrente(nuevaTareaRecurrente,false);
                        //asignar el nuevo usuario
                        nuevaTareaRecurrente.elegida=calcularUsuario(nuevaTareaRecurrente,tarea);
        
                        await nuevaTareaRecurrente.save();
                    }

                    await tarea.save(); // Guardar la tarea actualizada
                }
    }catch{
        console.error('Error al obtener tareas:', error);
    }
}


    // var task = cron.schedule('*/2 * * * *', () =>  {  cada 2 min
    // var task = cron.schedule('*/10 * * * * *', () => { cada 10 segundos
    var task = cron.schedule('10 0 * * *', () => {
    console.log('cron');
    comprobarTareas();
  });

module.exports = {
 crearTarea,
 obtenerTareas,
 liberarTarea,
 escogerTarea,
 eliminarTarea,
 actualizarTarea,
 completarTarea,
 obtenerTarea,
 obtenerTareasUsuario,
 obtenerTareasFinalizadas,
}