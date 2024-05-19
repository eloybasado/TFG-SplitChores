const { response } = require("express");
const dificultadesPermitidas=['facil','media','dificil'];


const validarDificultad = (req, res = response, next) => {
    const dificultad = req.body.dificultad;
    
    if(dificultad && !dificultadesPermitidas.includes(dificultad)){
        return res.status(400).json({
            ok:false,
            errores:'Dificultad no permitida'
        });
    }
    next();
}

module.exports = { validarDificultad };