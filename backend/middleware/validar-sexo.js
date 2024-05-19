const { response } = require("express");
const sexosPermitidos = ['HOMBRE', 'MUJER'];


const validarSexo = (req, res = response, next) => {
    const sexo = req.body.sexo;
    
    if(sexo && !sexosPermitidos.includes(sexo)){
        return res.status(400).json({
            ok:false,
            errores:'Sexo no permitido'
        });
    }
    next();
}

module.exports = { validarSexo };