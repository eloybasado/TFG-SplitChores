const Usuario= require('../models/usuarios.model');
const Grupo = require('../models/grupos.model');
const {response}= require('express');
const bcrypt = require('bcryptjs');
const { infoToken } = require('../utils/infotoken');




const crearGrupo = async(req,res=response) =>{

    const token = req.header('x-token')
    const { uid } = infoToken(token);
 
    try{
        const usuario = await Usuario.findById(uid);


        if(!usuario){
            return res.status(400).json({
                ok: false,
                msg: 'No existe este usuario en nuestra BD',
            });
        }
    



        var object = req.body;
        var usuarios= [];
        object.usuarios=usuarios;
        object.usuarios.push(req.body.admin)

        if(usuario.usuariosSubordinados!==null){
            for( let i=0; i<usuario.usuariosSubordinados.length; i++){
                object.usuarios.push(usuario.usuariosSubordinados[i])
            }
          }


          console.log(object)
        const grupo = new Grupo(object);
        console.log('grupo'+grupo)
         await grupo.save()

        res.json({
            ok:true,
            msg:"crearGrupo",
            usuario
        })
    }
    catch(error){
        console.log(error);
        return  res.status(400).json({
            ok:false,
            msg:'Error creando grupo'
        })
    }

    
}


const unirseGrupo = async(req,res=response) =>{

    const token = req.header('x-token')
    const { uid } = infoToken(token);
 
    try{
        const usuario = await Usuario.findById(uid);


        if(!usuario){
            return res.status(400).json({
                ok: false,
                msg: 'No existe este usuario en nuestra BD',
            });
        }
    


        const codigo = req.body.codigo;

        console.log('codigo'+codigo)
        try {
            const grupoEncontrado = await Grupo.findOne({ codigo: codigo });
        
            if (grupoEncontrado) {
              console.log('Grupo encontrado:', grupoEncontrado);

              if(usuario.usuariosSubordinados!==null){
                for( let i=0; i<usuario.usuariosSubordinados.length; i++){
                    grupoEncontrado.usuarios.push(usuario.usuariosSubordinados[i])
                }
              }

              grupoEncontrado.usuarios.push(uid);
            
              await grupoEncontrado.save();
              
            } else {
              console.log('No se encontró ningún grupo con ese código.');
            }
          } catch (error) {
            console.error('Error al buscar el grupo:', error);
          }

        res.json({
            ok:true,
            msg:"unido al grupo",
            usuario
        })
    }
    catch(error){
        console.log(error);
        return  res.status(400).json({
            ok:false,
            msg:'Error uniendose al grupo'
        })
    }

    
}


const salirGrupo = async(req,res=response) =>{

    const token = req.header('x-token')
    var { uid } = infoToken(token);

    if(req.body.usuario){
        uid=req.body.usuario;
    }
    const grupoId =req.body.grupo;
 
    try{
        const usuario = await Usuario.findById(uid);


        if(!usuario){
            return res.status(400).json({
                ok: false,
                msg: 'No existe este usuario en nuestra BD',
            });
        }
    

        try {
            const grupoEncontrado = await Grupo.findById(grupoId);
        
            if (grupoEncontrado) {
              console.log('Grupo encontrado:', grupoEncontrado);
              let posicion = grupoEncontrado.usuarios.indexOf(uid);

                
                if (posicion !== -1) {
                    console.log('se borrara'+grupoEncontrado.usuarios)

                    grupoEncontrado.usuarios.splice(posicion, 1);
                    console.log('se borrara'+grupoEncontrado.usuarios)

                    console.log(`Usuario ${uid} eliminado. Quedan:`, grupoEncontrado.usuarios);

                    if (usuario.usuariosSubordinados !== null) {
                        for (let i = 0; i < usuario.usuariosSubordinados.length; i++) {
                            console.log('usuario en grupo ' + grupoEncontrado.usuarios);
                            let usuarioAEliminar = usuario.usuariosSubordinados[i];
                            let posicion = grupoEncontrado.usuarios.indexOf(usuarioAEliminar);
                            
                            // Mientras el usuario a eliminar exista en el array, sigue eliminándolo
                            while (posicion !== -1) {
                                grupoEncontrado.usuarios.splice(posicion, 1);
                                console.log('usuarios en grupo ' + grupoEncontrado.usuarios);
                                posicion = grupoEncontrado.usuarios.indexOf(usuarioAEliminar);
                            }
                        }
                    }
                    

                    await grupoEncontrado.save();
                } else {
                    console.log(`El usuario ${uid} no existe en el grupo.`);
                }

            
              
            } else {
              console.log('No se encontró ningún grupo con ese código.');
            }
          } catch (error) {
            console.error('Error al buscar el grupo:', error);
          }

        res.json({
            ok:true,
            msg:"has salido del grupo",
            usuario
        })
    }
    catch(error){
        console.log(error);
        return  res.status(400).json({
            ok:false,
            msg:'Error saliendo del grupo'
        })
    }

    
}


const activarCodigo = async(req,res=response) =>{

    const token = req.header('x-token')
    const { uid } = infoToken(token);

    console.log('uid'+uid)

    try{
        const usuario = await Usuario.findById(uid);


        if(!usuario){
            return res.status(400).json({
                ok: false,
                msg: 'No existe este usuario en nuestra BD',
            });
        }
       

         const grupo = await Grupo.findById(req.body.grupo);

        if(!grupo){
            return res.status(400).json({
                ok: false,
                msg: 'No existe este grupo en nuestra BD',
            });
        }



        grupo.codigo=req.body.codigo;
        console.log('grupo'+grupo)
         await grupo.save()

        res.json({
            ok:true,
            msg:"activarCodigo",
            usuario
        })
    }
    catch(error){
        console.log(error);
        return  res.status(400).json({
            ok:false,
            msg:'Error activando codigo'
        })
    }

    
}

const desactivarCodigo = async(req,res=response) =>{

    const token = req.header('x-token')
    const { uid } = infoToken(token);
    console.log('desactivar')

    try{
        const usuario = await Usuario.findById(uid);


        if(!usuario){
            return res.status(400).json({
                ok: false,
                msg: 'No existe este usuario en nuestra BD',
            });
        }

        const grupo = await Grupo.findById(req.body.grupo);

        if(!grupo){
            return res.status(400).json({
                ok: false,
                msg: 'No existe este grupo en nuestra BD',
            });
        }



        delete grupo.codigo;
        console.log(grupo)
        try{
        await Grupo.updateOne({_id:req.body.grupo}, {$unset: {codigo: 1}});
        }catch(error){

            console.log(error);
            return  res.status(400).json({
                ok:false,
                msg:'Error desactivando codigo'
            })
        }


        res.json({
            ok:true,
            msg:"desactivarCodigo",
            usuario
        })
    }
    catch(error){
        console.log(error);
        return  res.status(400).json({
            ok:false,
            msg:'Error desactivando codigo'
        })
    }

    
}


const eliminarGrupo = async(req,res=response) =>{

    const token = req.header('x-token');
    const grupoId = req.query.id || '';
    const {uid,rol} = infoToken(token);


    try {



        const usuario = await Usuario.findById(uid);

        if(!usuario){
            return res.status(400).json({
                ok: false,
                msg: 'No existe este usuario en nuestra BD',
            });
        } 

        const grupo = await Grupo.findById(grupoId);


        if(!grupo){
            return res.status(400).json({
                ok: false,
                msg: 'No existe este grupo en nuestra BD',
            });
        } 

        if(rol=='ADMIN'){
            console.log('todavia no se ha implementado las vistas de administradores')
        }
        else if(rol==='USUARIO'){

                try {
                    
                       await Grupo.findByIdAndDelete(grupoId);

              
                } catch (error) {
                   
                    console.error(error);
                    console.log(error);
                    res.status(400).json({
                        ok:false,
                        msg: 'Error eliminando el grupo',
                        error
                    });
                }
            
        }
        
        res.json({
            ok:true,
            msg:'Eliminar Grupo',
        })

    } catch (error) {
        console.log(error);
        res.status(400).json({
            ok:false,
            msg: 'Error eliminado el grupo',
            error
        });
    }

}


const consultarGrupo = async(req,res=response) =>{

    const token = req.header('x-token')
    const { uid } = infoToken(token);
    var grupoEncontrado;
    var tipo=1;

    try{
        const usuario = await Usuario.findById(uid);
        var grupoEncontrado = await Grupo.findOne({ admin: uid });


        if(!usuario){
            return res.status(400).json({
                ok: false,
                msg: 'No existe este usuario en nuestra BD',
            });
        }


    
        try {

           
            
            if (grupoEncontrado) {
              console.log('El usuario es administrador del grupo:', grupoEncontrado.nombre);
              tipo=3
            } else {
              console.log('El usuario no es administrador de ningún grupo.');
              try {
                 grupoEncontrado = await Grupo.findOne({ usuarios: uid });
                
                if (grupoEncontrado) {
                  console.log('El usuario está en el grupo:', grupoEncontrado.nombre);
                  tipo=2
                } else {
                  console.log('El usuario no está en ningún grupo.');
                  tipo=1;
                }
              } catch (err) {
                console.error('Error al buscar en la colección de grupos:', err);
              }
            }
          } catch (err) {
            console.error('Error al buscar en la colección de grupos:', err);
          }


        if(grupoEncontrado){
            res.json({
                ok:true,
                msg:"consultarGrupo",
                grupo: grupoEncontrado._id,
                tipogrupo: tipo,
                nombre:grupoEncontrado.nombre
            })
        }else{
            res.json({
                ok:true,
                msg:"consultarGrupo",
                grupo: 'sin grupo',
                tipogrupo: tipo,
                nombre:''
            })
        }

    }
    catch(error){
        console.log(error);
        return  res.status(400).json({
            ok:false,
            msg:'Error consultando grupo'
        })
    }

    
}

const recuperarUsuarios = async(req,res=response) =>{

    const token = req.header('x-token')
    const { uid } = infoToken(token);
    var grupoEncontrado;
    const grupoId= req.query.id;
    var tipo=1;

    try{
        const usuario = await Usuario.findById(uid);

        var grupoEncontrado = await Grupo.findById(grupoId)

        if(!usuario){
            return res.status(400).json({
                ok: false,
                msg: 'No existe este usuario en nuestra BD',
            });
        }
    
        try {

           
            
            if (grupoEncontrado) {
              console.log('El usuario esta en el grupo:', grupoEncontrado.nombre);

              var datosUsuarios = await Usuario.find({ _id: { $in: grupoEncontrado.usuarios } });
                
              res.json({
                ok:true,
                msg:"Usuarios del grupo",
                grupo: grupoEncontrado._id,
                usuarios: datosUsuarios
            })

            } else {
                return  res.status(400).json({
                    ok:false,
                    msg:'No se encontró el grupo'
                })
            }
          } catch (err) {
            console.error('Error consultando usuarios del  grupo', err);
          }



    }
    catch(error){
        console.log(error);
        return  res.status(400).json({
            ok:false,
            msg:'Error al buscar en la colección de grupos'
        })
    }

    
}


const cambiarAdmin = async(req,res=response) =>{

    const token = req.header('x-token')
    const { uid } = infoToken(token);
    const uidNuevoAdmin = req.body.usuario;

    console.log('uid'+uid)

    try{
        const usuario = await Usuario.findById(uid);
        const nuevoAdmin = await Usuario.findById(uidNuevoAdmin);



        if(!usuario){
            return res.status(400).json({
                ok: false,
                msg: 'No existe este usuario en nuestra BD',
            });
        }

        if(!nuevoAdmin){
            return res.status(400).json({
                ok: false,
                msg: 'No existe este usuario en nuestra BD',
            });
        }
       
       

         const grupo = await Grupo.findById(req.body.grupo);

        if(!grupo){
            return res.status(400).json({
                ok: false,
                msg: 'No existe este grupo en nuestra BD',
            });
        }

        

        try {
            const grupoEncontrado = await Grupo.findOne({ admin: uidNuevoAdmin });
          
            if (grupoEncontrado) {
              console.log("Se encontró un grupo con el administrador:", uidNuevoAdmin);
              return res.status(400).json({
                ok: false,
                msg: 'Este usuario ya es admin de un grupo'
              });
            }
          
          } catch (error) {
            console.error("Error al buscar grupo:", error);
            return res.status(500).json({
              ok: false,
              msg: 'Error al buscar grupo en la base de datos'
            });
          }



        grupo.admin=uidNuevoAdmin;
        console.log('grupo'+grupo)
         await grupo.save()

        res.json({
            ok:true,
            msg:"Admin cambiado",
            usuario
        })
    }
    catch(error){
        console.log(error);
        return  res.status(400).json({
            ok:false,
            msg:'Error cambiando admin'
        })
    }

    
}


const resetearPuntos = async(req,res=response) =>{

    const token = req.header('x-token')
    const { uid } = infoToken(token);
    const uidNuevoAdmin = req.body.usuario;

    console.log('uid'+uid)

    try{
        const usuario = await Usuario.findById(uid);
        const nuevoAdmin = await Usuario.findById(uidNuevoAdmin);



        if(!usuario){
            return res.status(400).json({
                ok: false,
                msg: 'No existe este usuario en nuestra BD',
            });
        }
       
       

         const grupo = await Grupo.findById(req.body.grupo);

        if(!grupo){
            return res.status(400).json({
                ok: false,
                msg: 'No existe este grupo en nuestra BD',
            });
        }
        
            console.log('usu: ',uid,'admin',grupo.admin.toString())
        if(uid!==grupo.admin.toString()){
            return res.status(400).json({
                ok: false,
                msg: 'el usuario no es admin de este grupo',
            });
        }

        for(let i=0;i<grupo.usuarios.length;i++){
        var usuarioAux =  await Usuario.findById(grupo.usuarios[i]);

        usuarioAux.puntos=0;

        await usuarioAux.save();
        }

        res.json({
            ok:true,
            msg:"Puntos reseteados",
            usuario
        })
    }
    catch(error){
        console.log(error);
        return  res.status(400).json({
            ok:false,
            msg:'Error reseteando puntos'
        })
    }

    
}

module.exports = {
 crearGrupo,
 resetearPuntos,
 consultarGrupo,
 salirGrupo,
 eliminarGrupo,
 unirseGrupo,
 cambiarAdmin,
 recuperarUsuarios,
 activarCodigo,
 desactivarCodigo
}