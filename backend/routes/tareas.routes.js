const { Router } = require('express');
const { check } = require('express-validator');
const { validarJWT } = require('../middleware/validar-jwt');
const { validarCampos } = require('../middleware/validar-campos');
const { validarDificultad } = require('../middleware/validar-dificultad');
const { obtenerTareas, 
    crearTarea, 
    actualizarTarea, 
    eliminarTarea,
    obtenerTarea,
    obtenerTareasFinalizadas,
    escogerTarea,
    completarTarea,
    liberarTarea,
    obtenerTareasUsuario
} = require('../controllers/tareas.controller');

const router= Router();


router.get('/',[
    validarJWT,
    validarCampos,
    ], obtenerTareas);

 router.get('/por-id',[
       validarJWT,
       check('id','El id de usuario debe ser valido').optional().isMongoId(),
       validarCampos,
       ], obtenerTarea);

router.get('/sin-elegir',[
     validarJWT,
     check('id','El id de usuario debe ser valido').optional().isMongoId(),
     validarCampos,
      ], obtenerTareasUsuario);

router.get('/finalizadas',[
     validarJWT,
     validarCampos,
      ], obtenerTareasFinalizadas);



router.post('/',[
     check('nombre','El argumento nombre es obligatorio').not().isEmpty().trim(),
     check('recurrente','El argumento recurrente es obligatorio').not().isEmpty(),
     validarDificultad,
     validarCampos
], crearTarea)

router.post('/elegir-tarea',[
  check('tarea','El argumento tarea es obligatorio').isMongoId(),
  check('usuario','El argumento usuario es obligatorio').isMongoId(),
  validarCampos
], escogerTarea)

router.post('/liberar-tarea',[
  check('tarea','El argumento tarea es obligatorio').isMongoId(),
  check('usuario','El argumento usuario es obligatorio').isMongoId(),
  validarCampos
], liberarTarea)

router.post('/completar-tarea',[
  check('tarea','El argumento tarea es obligatorio').isMongoId(),
  check('usuario','El argumento usuario es obligatorio').isMongoId(),
  validarCampos
], completarTarea)

router.put('/:id',[
  validarJWT,
  check('id','El id de tarea debe ser valido').isMongoId(),
   validarDificultad,
  validarCampos
],actualizarTarea)




router.delete('/',[
    validarJWT,
    check('id','el identificador no es válido').isMongoId(),
    validarCampos
],eliminarTarea);




module.exports = router;