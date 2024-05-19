const { response } = require("express");
const rolesPermitidos=['USUARIO','SUBORDINADO','ADMIN'];


const validarRol = (req, res = response, next) => {
    const rol = req.body.rol;
    
    if(rol && !rolesPermitidos.includes(rol)){
        return res.status(400).json({
            ok:false,
            errores:'Rol no permitido'
        });
    }
    next();
}

module.exports = { validarRol };