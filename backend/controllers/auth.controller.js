const { response } = require('express');
const bcrypt = require('bcryptjs');
const Usuario = require('../models/usuarios.model');
const { generarJWT } = require('../utils/jwt');
const jwt = require('jsonwebtoken');

const login = async(req, res = response) => {

    const { email, password } = req.body;

    try {

        const usuarioBD = await Usuario.findOne({ email });
        if (!usuarioBD) {
            return res.status(400).json({
                ok: false,
                msg: 'Usuario o contraseña incorrectos',
                token: ''
            });
        }

        const passwordValida = bcrypt.compareSync(password, usuarioBD.password);
        if (!passwordValida) {
            return res.status(400).json({
                ok: false,
                msg: 'Usuario o contraseña incorrectos',
                token: ''
            });
        }

        const { _id, rol } = usuarioBD;
        const token = await generarJWT(usuarioBD._id, usuarioBD.rol);

        // OK -> login correcto
        res.json({
            ok: true,
            msg: 'Login correcto',
            uid: _id,
            rol,
            token
        });

    } catch (error) {
        console.log(error);
        return res.status(400).json({
            ok: false,
            msg: 'Error en login',
            token: ''
        });
    }
}

const renovarToken = async(req, res = response) => {

    const token = req.headers['x-token'];

    try {
        const { uid, rol, ...object } = jwt.verify(token, process.env.JWTSECRET);

        const usuarioBD = await Usuario.findById(uid);

        if(!usuarioBD) {
            return res.status(400).json({
                ok: false,
                msg: 'Token no válido',
                token: ''
            });
        }

        const rolBD = usuarioBD.rol;

        const nuevoToken = await generarJWT(uid, rol);

        // OK -> token creado
        res.json({
            ok: true,
            msg: 'Token',
            uid: uid,
            nombre: usuarioBD.nombre,
            apellidos: usuarioBD.apellidos,
            email: usuarioBD.email,
            sexo: usuarioBD.sexo,
            fcmToken: usuarioBD.fcmToken,
            rol: rolBD,
            usuariosSubordinados: usuarioBD.usuariosSubordinados,
            puntos:usuarioBD.puntos,
            avatar:usuarioBD.avatar,
            token: nuevoToken
        });

    } catch {
        return res.status(400).json({
            ok: false,
            msg: 'Token no válido',
            token: ''
        });
    }
}

module.exports = { login, renovarToken };