const { Router } = require('express');
const { check } = require('express-validator');
const { validarJWT } = require('../middleware/validar-jwt');
const { validarCampos } = require('../middleware/validar-campos');
const { validarRol } = require('../middleware/validar-rol');
const { enviarNotificacion, 
} = require('../controllers/notifications.controller');

const router= Router();


router.post('/enviar-notificacion',[
    check('usuario','El argumento usuario es obligatorio').isMongoId(),
    validarRol,
    validarCampos
], enviarNotificacion)

module.exports = router;