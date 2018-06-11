const express = require('express');

let { verificaToken } = require('../middlewares/autenticacion');

let app = express();

let Producto = require('../models/producto');

// ============================
// Mostrar todas los productos
// ============================
app.get('/producto', verificaToken, (req, res) => {

    let desde = req.query.desde || 0;
    desde = Number(desde);
   

    Producto.find({ disponible: true })
        .skip(desde)
        .limit(5)
        .sort('nombre')
        .populate('usuario', 'nombre email')// si ponemos solo usuario trae todo usuario, menos password q lo estamos excluyendo, le indicamos q solo queremos ver nombre y email.
        .populate('categoria', 'descripcion')
        .exec((err, productos) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                productos
            });

        })
});

// ============================
// Mostrar un producto por ID
// ============================
app.get('/producto/:id', verificaToken, (req, res) => {    
    

    let id = req.params.id;

    Producto.findById(id)
         .populate('usuario', 'nombre email')// si ponemos solo usuario trae todo usuario, menos password q lo estamos excluyendo, le indicamos q solo queremos ver nombre y email.
         .populate('categoria', 'descripcion')
         .exec((err, productoDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El ID no es correcto'
                }
            });
        }

        res.json({
            ok: true,
            producto: productoDB
        });

    });

});

// ============================
// Buscar productos
// ============================

app.get('/producto/buscar/:termino', verificaToken, (req, res)=>{

    //Para q la busqueda sea mas flexible y no q solo encuentre si se pone exactamente el mismo nombre
    //tenemos q hacerlo con una expresion regular.
    let termino = req.params.termino;

    //En lugar de mandar el termino mandamos la expresion regular, la 'i' es para q sea insensible a mayusculas y minusculas.
    let regex = new RegExp(termino, 'i');

    Producto.find({nombre: regex})
        .populate('categoria', 'descripcion')
        .exec(( err, productos) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                productos
            });

        })

})





// ============================
// Crear un nuevo producto
// ============================
app.post('/producto', verificaToken, (req, res) => {    
   
   
    let body = req.body;

    let producto = new Producto({
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        disponible: body.disponible,
        categoria: body.categoria,
        usuario: req.usuario._id
    });


    producto.save((err, productoDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.status(201).json({
            ok: true,
            producto: productoDB
        });


    });


});

// ============================
// Actualizar un producto
// ============================
app.put('/producto/:id', verificaToken, (req, res) => {

    let id = req.params.id;
    let body = req.body;    

    Producto.findById(id, (err, productoDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El producto no existe'
                }
            });
        }

        productoDB.nombre = body.nombre;  
        productoDB.precioUni = body.precioUni; 
        productoDB.categoria = body.categoria; 
        productoDB.disponible = body.disponible; 
        productoDB.descripcion = body.descripcion; 


        productoDB.save( (err, productoGuardado)=>{

            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            
            res.json({
                ok: true,
                producto: productoGuardado
            });
        })
    })


});




// ============================
// Borrar un producto  BAJA LOGICA
// ============================
app.delete('/producto/:id', (req, res) => {

    let id = req.params.id;

    let cambioEstado = {

        disponible: false
    }

    Producto.findByIdAndUpdate(id, cambioEstado, {new: true} ,(err, productoBorrado) => {

      if( err ) {
          return res.status(500).json({
              ok: false,
              err
          });
      }   

      if( !productoBorrado ) {
        return res.status(400).json({
            ok: false,
            err
        });
    }  
        
      res.json({
            ok: true,
            producto: productoBorrado,
            mensaje: 'Producto borrado'
        });
    })  
    
})


































module.exports = app;