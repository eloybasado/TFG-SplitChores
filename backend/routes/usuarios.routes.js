const { Router } = require('express');
const { check } = require('express-validator');
const { validarJWT } = require('../middleware/validar-jwt');
const { validarCampos } = require('../middleware/validar-campos');
const { validarRol } = require('../middleware/validar-rol');
const { validarSexo } = require('../middleware/validar-sexo');
const { obtenerUsuarios, 
    crearUsuario, 
    obtenerSubordinados,
    actualizarUsuario, 
    activarCodigo,
    liberarUsuario,
    cambiarAvatar,
    convertirDependiente,
    desactivarCodigo,
    almacenarFCMToken,
    cambiarPassword,
    eliminarUsuario
} = require('../controllers/usuarios.controller');

const router= Router();


router.get('/',[
    validarJWT,
    check('id','El id de usuario debe ser valido').optional().isMongoId(),
    check('desde','El argumento desde debe ser numérico').optional().isNumeric(),
    check('texto', 'La busqueda debe contener texto').optional().trim(),
    validarCampos,
    ], obtenerUsuarios);

    router.get('/recuperar-subordinados',[
        validarJWT,
        validarCampos,
        ], obtenerSubordinados);


router.post('/',[
    check('nombre','El argumento nombre es obligatorio').not().isEmpty().trim(),
    check('email','El argumento email es obligatorio').not().isEmpty(),
    check('email','El argumento email debe ser un email').isEmail(),
    check('password','El argumento password es obligatorio').not().isEmpty(),
    check('sexo','El argumento sexo es obligatorio').not().isEmpty(),
    validarRol,
    validarSexo,
    validarCampos
], crearUsuario)

router.put('/:id',[
    validarJWT,
    check('id','El identificador no es válido').isMongoId(),
    check('nombre','El argumento nombre es obligatorio').not().isEmpty().trim(),
    check('apellidos','El argumento apellidos es obligatorio').not().isEmpty().trim(),
    validarCampos
], actualizarUsuario);


router.post('/actualizarAvatar',[
    validarJWT,
    check('avatarSRC','El argumento avatarSRC es obligatorio').not().isEmpty().trim(),
     validarRol,
    validarCampos
], cambiarAvatar);

router.delete('/',[
    validarJWT,
    check('id','el identificador no es válido').isMongoId(),
    validarCampos
],eliminarUsuario);

router.post('/activar-codigo',[
    validarJWT,
    check('usuario','El argumento usuario es obligatorio').isMongoId(),
    check('codigo','El argumento codigo es obligatorio').not().isEmpty(),
    validarCampos
], activarCodigo)


router.post('/cambiar-password',[
    validarJWT,
    check('password','El argumento password es obligatorio').not().isEmpty(),
    check('newpassword','El argumento newpassword es obligatorio').not().isEmpty(),
    check('newpassword2','El argumento newpassword2 es obligatorio').not().isEmpty(),
    validarCampos
], cambiarPassword)

router.post('/desactivar-codigo',[
    validarJWT,
    check('usuario','El argumento usuario es obligatorio').isMongoId(),
    check('codigo','El argumento codigo es obligatorio').not().isEmpty(),
    validarCampos
], desactivarCodigo)



router.post('/convertir-dependiente',[
    validarJWT,
    check('usuario','El argumento usuario es obligatorio').isMongoId(),
    check('codigo','El argumento codigo es obligatorio').not().isEmpty(),
    validarCampos
], convertirDependiente)

router.post('/liberar-usuario',[
    validarJWT,
    check('subordinado','El argumento subordinado es obligatorio').isMongoId(),
    validarCampos
], liberarUsuario)

router.post('/activar-push',[
    validarJWT,
    check('token','El argumento token es obligatorio').not().isEmpty(),
    validarCampos
], almacenarFCMToken)

module.exports = router;