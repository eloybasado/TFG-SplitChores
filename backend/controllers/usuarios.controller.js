const Usuario= require('../models/usuarios.model');
const Grupo= require('../models/grupos.model');
const {response}= require('express');
const bcrypt = require('bcryptjs');
const { infoToken } = require('../utils/infotoken');
const { generarJWT } = require('../utils/jwt');
const jwt = require('jsonwebtoken');

const obtenerUsuarios = async(req, res=response) => {
    const desde = Number(req.query.desde) || 0;
    const registropp = Number(process.env.DOCSPERPAGE);
    const texto = req.query.texto;
    let textoBusqueda = '';
    if (texto) {
        textoBusqueda = new RegExp(texto, 'i');
    }
    // Obtenemos el ID de usuario por si quiere buscar solo un usuario
    const id = req.query.id || '';

    try {
        let usuarios, total;
        if (id) {
            [usuarios, total] = await Promise.all([
                Usuario.findById(id),
                Usuario.countDocuments()
            ]);
        } else {
            if (texto) {
                [usuarios, total] = await Promise.all([
                    Usuario.find({ $or: [{ nombre: textoBusqueda }, { apellidos: textoBusqueda }, { email: textoBusqueda }] }).skip(desde).limit(registropp),
                    Usuario.countDocuments({ $or: [{ nombre: textoBusqueda }, { apellidos: textoBusqueda }, { email: textoBusqueda }] })
                ]);
            } else {
                [usuarios, total] = await Promise.all([
                    Usuario.find({}).skip(desde).limit(registropp),
                    Usuario.countDocuments()
                ]);
            }
        }

        res.json({
            ok: true,
            msg: 'getUsuarios',
            usuarios,
            page: {
                desde,
                registropp,
                total
            }
        });

    } catch (error) {
        console.log(error);
        res.json({
            ok: false,
            msg: 'Error obteniedo usuarios'
        });
    }

}





const crearUsuario = async(req,res=response) =>{

    const { email, password } = req.body;
    
    try{
        const existeEmail= await Usuario.findOne({email:email});

        if(existeEmail){
            return  res.status(400).json({
                ok:false,
                msg:"Este email ya está en uso"
            })
        }
    
        const salt = bcrypt.genSaltSync();
        const cpassword= bcrypt.hashSync(password,salt);

        const object = req.body;
        const usuario = new Usuario(object);
        usuario.password = cpassword;
        usuario.puntos=0;
        usuario.rol='USUARIO';
        usuario.usuariosSubordinados=[];

        await usuario.save()

        res.json({
            ok:true,
            msg:"crearUsuario",
            usuario
        })
    }
    catch(error){
        console.log(error);
        return  res.status(400).json({
            ok:false,
            msg:'Error creando usuario'
        })
    }

    
}


const cambiarPassword = async(req,res=response) =>{

    const { password, newpassword, newpassword2 } = req.body;
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
    

        //comprobamos si lac contrasenya original es buena
        console.log(bcrypt.compareSync(password, usuario.password))
        const passwordValida = bcrypt.compareSync(password, usuario.password);
        if (!passwordValida) {
            return res.status(400).json({
                ok: false,
                msg: 'contraseña incorrecta',
                token: ''
            });
        }

        if(newpassword!==newpassword2){
            return res.status(400).json({
                ok: false,
                msg: 'las contraseñas no coinciden',
                token: ''
            });
        }

        //actualizamos contrasenya 
        const salt = bcrypt.genSaltSync();
        const cpassword= bcrypt.hashSync(newpassword,salt);

        usuario.password = cpassword;

        await usuario.save()

        const { _id, rol } = usuario;
        const token = await generarJWT(usuario._id, usuario.rol);



        //enviamos el nuevo token
        res.json({
            ok: true,
            msg: 'Login correcto',
            uid: _id,
            rol,
            token
        });
    }
    catch(error){
        console.log(error);
        return  res.status(400).json({
            ok:false,
            msg:'Error actualizando la contraseña'
        })
    }

    
}


const actualizarUsuario = async(req,res=response) =>{

    const { nombre,apellidos, ...object } = req.body;
    const uid = req.params.id;
    const token = req.header('x-token');

    try{
        //Comprobamos que el usuario sea admin, puede cambiar a quien quiera
        //Si es un usuario normal comprobamos que el usuario se este actualizando a si mismo y no a otro usuario
        if (infoToken(token).rol !== 'ADMIN' && infoToken(token).uid !== uid) {
            return res.status(400).json({
                ok: false,
                msg: 'No tiene permisos para editar usuarios',
            });
        }
        //edicion de usuario por parte del administrador
        else if(infoToken(token).rol === 'ADMIN'){
            // object.rol=rol;
            // object.password= password;
            // object.email=email;
        }

        //actualizacion de email
        // const existeEmail= await Usuario.findOne({email});

        // if(existeEmail){
        //     if(existeEmail._id != uid){
        //         return  res.status(400).json({
        //             ok:false,
        //             msg:'Email ya existe para otro usuario'
        //         })
        //     }
        // }
        // object.email=email;


        const existeUsuario= await Usuario.findById(uid);

        if(!existeUsuario){
            return  res.status(400).json({
                ok:false,
                msg:'Usuario no existe'
            })
        }
        

        //actualizar todo el usuario mediante un objeto con todos los campos
        // const usuario = await Usuario.findByIdAndUpdate(uid, object, {new:true});
       
        const usuario = await Usuario.findByIdAndUpdate(
            uid,
            { nombre: nombre, apellidos: apellidos },
            { new: true }
          );
          

        res.json({
            ok:true,
            msg:"Usuario actualizado",
            usuario
        })
    }
    catch(error){
        console.log(error);
        return  res.status(400).json({
            ok:false,
            msg:'Error actualizando usuario'
        })
    }
}


const obtenerSubordinados = async(req,res=response) =>{

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
    
        try {

           
            
            if ( usuario.usuariosSubordinados!==null) {
              console.log('El usuario tiene subordinados' + usuario.usuariosSubordinados.length);

              var datosUsuarios = await Usuario.find({ _id: { $in: usuario.usuariosSubordinados } });
                
              res.json({
                ok:true,
                msg:"Usuarios subordinados",
                subordinados: datosUsuarios
            })

            } else {
                return  res.status(400).json({
                    ok:false,
                    msg:'No se encontraron usuarios subordinados'
                })
            }
          } catch (err) {
            console.error('Error consultando usuarios subordinados', err);
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


const eliminarUsuario = async(req,res=response) =>{

    const uid= req.query.id;
    const token = req.header('x-token');
    console.log(uid)
    try{
        if (infoToken(token).rol !== 'ADMIN' && infoToken(token).uid !== uid) {
            return res.status(400).json({
                ok: false,
                msg: 'No tiene permisos para borrar usuarios',
            });
        }
        const existeUsuario = await Usuario.findById(uid);

        if(!existeUsuario){
            return res.status(400).json({
                ok:false,
                msg:"El usuario no existe"
            });
        }

        const resultado= await Usuario.findByIdAndRemove(uid);

        res.json({
            ok:true,
            msg:"Usuario borrado",
            resultado
        })
    }catch(error){
        console.log(error);
        return  res.status(400).json({
            ok:false,
            msg:'Error borrando usuario'
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
       




        usuario.codigo=req.body.codigo;
        console.log('usuario code'+usuario.codigo)
         await usuario.save()

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



        delete usuario.codigo;
        console.log(usuario)
        try{
        await Usuario.updateOne({_id:req.body.usuario}, {$unset: {codigo: 1}});
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


const almacenarFCMToken = async(req,res=response) =>{

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
       
        // const message = {
        //     data: {
        //       score: '850',
        //       time: '2:45'
        //     },
        //     token: req.body.fcmToken
        //   };

        //   getMessaging().send(message)
        //   .then((response) => {
        //     // Response is a message ID string.
        //     console.log('Successfully sent message:', response);
        //   })
        //   .catch((error) => {
        //     console.log('Error sending message:', error);
        //   });

        usuario.fcmToken=req.body.token;
        console.log('usuario code'+usuario.fcmToken)
         await usuario.save()

        res.json({
            ok:true,
            msg:"token fcm activado",
            usuario
        })
    }
    catch(error){
        console.log(error);
        return  res.status(400).json({
            ok:false,
            msg:'Error activando token fcm'
        })
    }

    
}

const convertirDependiente = async(req,res=response) =>{

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
            const gestorEncontrado = await Usuario.findOne({ codigo: codigo });
        
            if (gestorEncontrado) {
              console.log('Gestor encontrado:', gestorEncontrado);
              var subordinados=[];
              console.log(gestorEncontrado.usuariosSubordinados)

              if( !Array.isArray(gestorEncontrado.usuariosSubordinados)){
                console.log('no array')
                gestorEncontrado.usuariosSubordinados=subordinados;}

              gestorEncontrado.usuariosSubordinados.push(uid);


              usuario.rol='SUBORDINADO';
              usuario.usuariosSubordinados=null;

              const grupoOld = await Grupo.findOne({usuarios: uid});

              if(grupoOld){
                    let posicion = grupoOld.usuarios.indexOf(uid);

                    if(grupoOld.admin.toString() === uid){
                        await Grupo.findByIdAndRemove(grupoOld._id);
                      
                    }else{
                      if (posicion !== -1) {
                          console.log('se borrara'+grupoOld.usuarios)
      
                          grupoOld.usuarios.splice(posicion, 1);
                          console.log('se borrara'+grupoOld.usuarios)
      
                          console.log(`Usuario ${uid} eliminado. Quedan:`, grupoOld.usuarios);
      
                          if (usuario.usuariosSubordinados !== null) {
                              for (let i = 0; i < usuario.usuariosSubordinados.length; i++) {
                                  let usuarioAEliminar = usuario.usuariosSubordinados[i];
                                  let posicion = grupoOld.usuarios.indexOf(usuarioAEliminar);
                                  
                                  while (posicion !== -1) {
                                    grupoOld.usuarios.splice(posicion, 1);
                                      console.log('usuarios en grupo ' + grupoOld.usuarios);
                                      posicion = grupoOld.usuarios.indexOf(usuarioAEliminar);
                                  }
                              }
                          }
                          
      
                          await grupoOld.save();
                      }
                    }
              }

              var grupo = await Grupo.findOne({ usuarios:gestorEncontrado._id});
              console.log('en grupo'+grupo)

              if(grupo){
                grupo.usuarios.push(uid);
                await grupo.save();
              }
            
              await usuario.save();
              await gestorEncontrado.save();
              
            } else {
              console.log('No se encontró ningún usuario gestor con ese código.');
            }
          } catch (error) {
            console.error('Error al buscar el usuario:', error);
          }

        res.json({
            ok:true,
            msg:"usuario convertido correctamente",
            usuario
        })
    }
    catch(error){
        console.log(error);
        return  res.status(400).json({
            ok:false,
            msg:'Error convirtiendo el usuario'
        })
    }

    
}


const liberarUsuario = async(req,res=response) =>{

    const token = req.header('x-token')
    const { uid } = infoToken(token);
    const subordinadId = req.body.subordinado;
 
    try{
        const usuario = await Usuario.findById(uid);


        if(!usuario){
            return res.status(400).json({
                ok: false,
                msg: 'No existe este usuario en nuestra BD',
            });
        }

        const subordinado = await Usuario.findById(subordinadId);


        if(!subordinado){
            return res.status(400).json({
                ok: false,
                msg: 'No existe este usuario en nuestra BD',
            });
        }
    
        try {
            const index = usuario.usuariosSubordinados.indexOf(subordinadId);
            if (index !== -1) {
              usuario.usuariosSubordinados.splice(index, 1);
            }

              subordinado.rol='USUARIO';
              subordinado.usuariosSubordinados=null;
            
              await usuario.save();
              await subordinado.save();
              

          } catch (error) {
            console.error('Error al buscar el usuario:', error);
          }

        res.json({
            ok:true,
            msg:"usuario convertido correctamente",
            usuario
        })
    }
    catch(error){
        console.log(error);
        return  res.status(400).json({
            ok:false,
            msg:'Error convirtiendo el usuario'
        })
    }

    
}
const cambiarAvatar = async(req,res=response) =>{

    const { avatarSRC } = req.body;
    const token = req.header('x-token');
    const uid =infoToken(token).uid;
    console.log(avatarSRC)
    try{

        if(infoToken(token).rol === 'ADMIN'){
            // object.rol=rol;
            // object.password= password;
            // object.email=email;
        }



        const existeUsuario= await Usuario.findById(uid);

        if(!existeUsuario){
            return  res.status(400).json({
                ok:false,
                msg:'Usuario no existe'
            })
        }
        

        //actualizar todo el usuario mediante un objeto con todos los campos
        // const usuario = await Usuario.findByIdAndUpdate(uid, object, {new:true});
       
        const usuario = await Usuario.findByIdAndUpdate(
            uid,
            { avatar: avatarSRC },
            { new: true }
          );
          

        res.json({
            ok:true,
            msg:"Avatar actualizado",
            usuario
        })
    }
    catch(error){
        console.log(error);
        return  res.status(400).json({
            ok:false,
            msg:'Error actualizando avatar'
        })
    }
}



module.exports = {
    obtenerUsuarios, 
    crearUsuario, 
    actualizarUsuario, 
    activarCodigo,
    desactivarCodigo,
    almacenarFCMToken,
    obtenerSubordinados,
    liberarUsuario,
    convertirDependiente,
    cambiarPassword,
    eliminarUsuario,
    cambiarAvatar
}