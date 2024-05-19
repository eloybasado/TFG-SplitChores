const { Router } = require('express');
const { check } = require('express-validator');
const { validarJWT } = require('../middleware/validar-jwt');
const { validarCampos } = require('../middleware/validar-campos');
const { validarDificultad } = require('../middleware/validar-dificultad');
const {  crearGrupo,
     consultarGrupo,
     activarCodigo,
     unirseGrupo,
     eliminarGrupo,
     recuperarUsuarios,
     cambiarAdmin,
     salirGrupo,
     desactivarCodigo,
     resetearPuntos
} = require('../controllers/grupos.controller');

const router= Router();


// router.get('/',[
//    // validarJWT,
//    // check('id','El id de usuario debe ser valido').optional().isMongoId(),
//   //  check('desde','El argumento desde debe ser numérico').optional().isNumeric(),
//    // check('texto', 'La busqueda debe contener texto').optional().trim(),
//  //   validarCampos,
//     ], obtenerTareas);



router.post('/',[
     validarJWT,
     check('nombre','El argumento nombre es obligatorio').not().isEmpty().trim(),
     check('admin','El argumento admin es obligatorio').not().isEmpty(),
     validarCampos
], crearGrupo)

router.post('/unirse-grupo',[
     validarJWT,
     check('codigo','El argumento nombre es obligatorio').not().isEmpty().trim(),
     check('usuario','El argumento admin es obligatorio').isMongoId(),
     validarCampos
], unirseGrupo)

router.post('/activar-grupo',[
     validarJWT,
     check('grupo','El argumento nombre es obligatorio').isMongoId(),
     check('codigo','El argumento nombre es obligatorio').not().isEmpty(),
     validarCampos
], activarCodigo)

router.post('/desactivar-grupo',[
     validarJWT,
     check('grupo','El argumento nombre es obligatorio').isMongoId(),
     check('codigo','El argumento nombre es obligatorio').not().isEmpty(),
     validarCampos
], desactivarCodigo)

router.post('/salir-grupo',[
     check('grupo','El argumento grupo es obligatorio').isMongoId(),
     validarCampos
], salirGrupo)

router.get('/consultar-grupo',[
     validarJWT,
     validarCampos
], consultarGrupo)

router.get('/usuarios-grupo',[
     validarJWT,
     check('id','el identificador no es válido').isMongoId(),
     validarCampos
], recuperarUsuarios)

router.post('/cambiar-admin',[
     validarJWT,
     check('grupo','El id de grupo debe ser valido').isMongoId(),
     check('usuario','El id de usuario debe ser valido').isMongoId(),
     validarCampos
   ],cambiarAdmin)

   router.post('/reset-puntos',[
     validarJWT,
     check('grupo','El id de grupo debe ser valido').isMongoId(),
     validarCampos
   ],resetearPuntos)

// router.put('/:id',[
//     validarJWT,
//     check('id','El identificador no es válido').isMongoId(),
//     check('nombre','El argumento nombre es obligatorio').not().isEmpty().trim(),
//     validarDificultad,
//     validarCampos
// ], actualizarTarea);

router.delete('/',[
    validarJWT,
    check('id','el identificador no es válido').isMongoId(),
    validarCampos
],eliminarGrupo);




module.exports = router;