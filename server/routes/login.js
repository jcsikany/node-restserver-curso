const express = require('express');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


const Usuario = require('../models/usuario');
 

const app = express();


app.post('/login', (req, res) => {

    let body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {

        if( err ) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if( !usuarioDB ) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario o contraseña incorrectos'
                }
            });
        } 

        //Para comprobar si la contraseña existe tenemos q comparar la contraseña del body con la de 
        // la base de datos, y esa esta encriptada por lo tanto usamos una funcion de bcrypt q se llama compareSync.
        //Aca le decimos q si no son igual entonces disparamos el error.
       if ( !bcrypt.compareSync( body.password, usuarioDB.password )) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario o contraseña incorrectos'
                }
            });
       }

       // process.env.SEED es el string de de verificacion q lo guardamos en config.js
       let token = jwt.sign({
           usuario: usuarioDB
       }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN })// esto "expiresIn: 60 * 60" es equivalente a q expire en una hora (60segundos x 60minutos)// nosotros vamos a poner 30 dias

       res.json({
           ok: true,
           usuario: usuarioDB,
           token
       });

    })


})


module.exports = app;
