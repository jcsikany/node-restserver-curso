const express = require('express');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const {
    OAuth2Client
} = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);


const Usuario = require('../models/usuario');


const app = express();


app.post('/login', (req, res) => {

    let body = req.body;

    Usuario.findOne({
        email: body.email
    }, (err, usuarioDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!usuarioDB) {
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
        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
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
        }, process.env.SEED, {
            expiresIn: process.env.CADUCIDAD_TOKEN
        }) // esto "expiresIn: 60 * 60" es equivalente a q expire en una hora (60segundos x 60minutos)// nosotros vamos a poner 30 dias

        res.json({
            ok: true,
            usuario: usuarioDB,
            token
        });

    })


})

//Configuraciones de Google ===========

async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();

    // console.log(payload.name);
    // console.log(payload.email);
    // console.log(payload.picture);    

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }

}



app.post('/google', async (req, res) => {

    let token = req.body.idtoken;

    let googleUser = await verify(token)
        .catch(e => {

            return res.status(403).json({
                ok: false,
                err: e
            });

        })

    //Hacemos validaciones, verificamos si este usarios o sea el mail no existe ya en la base de datos.
    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (usuarioDB) {
            if (usuarioDB.google === false) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Debe de usar su autenticacion normal'
                    }
                });
            } else {

                // process.env.SEED es el string de de verificacion q lo guardamos en config.js
                let token = jwt.sign({
                     usuario: usuarioDB 
                    }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN }); // esto "expiresIn: 60 * 60" es equivalente a q expire en una hora (60segundos x 60minutos)// nosotros vamos a poner 30 dias

                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token
                }) 
            }
        } else {
            // Si el usuario no existe en nuestra base de datos es un nuevo usuario
            let usuario = new Usuario();
            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = googleUser.google;
            usuario.password = ':)';

            usuario.save( (err, usuarioDB) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        err
                    });
                };

                let token = jwt.sign({
                    usuario: usuarioDB 
                   }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN }); // esto "expiresIn: 60 * 60" es equivalente a q expire en una hora (60segundos x 60minutos)// nosotros vamos a poner 30 dias

               return res.json({
                   ok: true,
                   usuario: usuarioDB,
                   token
               });

            });
        }

    })

});

module.exports = app;