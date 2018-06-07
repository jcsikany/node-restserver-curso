const express = require('express');

const bcrypt = require('bcrypt');
const _ = require('underscore');

const Usuario = require('../models/usuario');
 

const app = express();



app.get('/usuario', (req, res) => {

    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 5;
    limite = Number(limite);

    //en el find si queresmos filtar algo podemos hacerlo asi .find({nombre:"test1"})y lo q este dsp es 
    //es lo q se va a mostrar, en este caso el nombre mail role estado google img, esos son los campos q nos interesa q devuelva.
    Usuario.find({estado: true}, 'nombre email role estado google img')
            .skip(desde)
            .limit(limite)
            .exec( (err, usuarios) => {

            if( err ) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            Usuario.count({estado:true}, (err, conteo)  => {

                res.json({
                    ok: true,
                    usuarios,
                    cuantos: conteo
                });    
            });

  });

})
  


app.post('/usuario', (req, res) => {
  
      // el body q esta en req.body es el q va a aparecer cuando el bodyparser procese cualquier payload
      // que reciban las peticiones.
      let body = req.body;

      let usuario = new Usuario({
          nombre: body.nombre,
          email:body.email,
          password: bcrypt.hashSync(body.password, 10), 
          role: body.role        
      })


      //usuarioDB es la respuesta del usuario q se grabo en mongoDB
      usuario.save( (err, usuarioDB) => {

        if( err ) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        //usuarioDB.password = null;

        res.json({
            ok: true,
            usuario: usuarioDB
         });
      })       
  
  })
  
app.put('/usuario/:id', (req, res) => {
  
      let id = req.params.id;

      //resive el objeto q tiene todas las propiedades, o sea el body y dsp ponemos un arreglo con todas las propiedades validas.
      let body = _.pick(req.body, ['nombre','email','img','role','estado'] ) 

      Usuario.findByIdAndUpdate(id, body, {new: true, runValidators: true} ,(err, usuarioDB) => {

        if( err ) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
      
          
        res.json({
              ok: true,
              usuario: usuarioDB
          });
      })  
  })
  

  // ---------------------Eliminacion fisica ----------------------------

// app.delete('/usuario/:id', (req, res) => {

//     let id = req.params.id;

//     Usuario.findByIdAndRemove(id, (err, usuarioBorrado) =>{

//         if( err ) {
//             return res.status(400).json({
//                 ok: false,
//                 err
//             });
//         };

//         if (!usuarioBorrado) {
//             return res.status(400).json({
//                 ok: false,
//                 err: {
//                     message: 'Usuario no encontrado'
//                 }
//             });
//         }


//         res.json({
//             ok:true,
//             usuario: usuarioBorrado
//         })
//     })   
    
// })


// ---------------------Eliminacion Logica ----------------------------

app.delete('/usuario/:id', (req, res) => {

    let id = req.params.id;

    let cambioEstado = {

        estado: false
    }

    Usuario.findByIdAndUpdate(id, cambioEstado, {new: true} ,(err, usuarioBorrado) => {

      if( err ) {
          return res.status(400).json({
              ok: false,
              err
          });
      }    
        
      res.json({
            ok: true,
            usuario: usuarioBorrado
        });
    })  
    
})


module.exports = app;