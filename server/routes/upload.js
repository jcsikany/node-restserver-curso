const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();

const Usuario = require('../models/usuario');
const Producto = require('../models/producto');

const fs = require('fs');//  filesystem para subir archivos, eliminarlos, etc
const path = require('path');// para construir un path dsd routes hasta uploads.
 
// default options
app.use(fileUpload());


app.put('/upload/:tipo/:id', function(req, res) {

    let tipo = req.params.tipo;
    let id = req.params.id;

    if (!req.files){

        return res.status(400).json({
            ok:false,
            err: {
                message: 'No se ha seleccionado ningun archivo'
            }
        });
    }

    //Validar tipo
    let tiposValidos = ['productos', 'usuarios'];

    if ( tiposValidos.indexOf(tipo) < 0){
        return res.status(400).json({
            ok:false,
            err: {
                message: 'Los tipos permitidas son: ' + tiposValidos.join(', ')                
            }
        })
    }



    let archivo = req.files.archivo;
    //console.log(archivo);

    // Extensiones permitidas
    let extensionesValidas =  ['png', 'jpg', 'gif', 'jpeg'];

    let nombreCortado = archivo.name.split('.');
    let extension = nombreCortado[nombreCortado.length - 1];

    //Si es menor a cero quiere decir q no encontro una extension en el arreglo de extensiones validas q coincida con nuestra extension.
    if( extensionesValidas.indexOf(extension ) < 0){
        return res.status(400).json({
            ok:false,
            err: {
                message: 'Las extensiones permitidas son ' + extensionesValidas.join(', '),
                ext: extension
            }
        })
    }

    //Cambiar nombre al archivo
    let nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${ extension }`;
    
    //Aca subimos el archivo, lo primero q le pasamos es la ruta con el nombre del archivo
    archivo.mv( `uploads/${ tipo }/${ nombreArchivo }`, (err) => { 
        if (err){
            return res.status(500).json({
                ok:false,
                err
            })
        }

        // Aqui la imagen esta cargada, necesito actualizar la imagen del usuario o producto
         if (tipo === 'usuarios'){
            imagenUsuario(id, res, nombreArchivo);
         } else {
            imagenProducto(id, res, nombreArchivo);
         }
        
      });
});


//Funcion para actualizar imagen en los usuarios
function imagenUsuario(id, res, nombreArchivo){

    Usuario.findById(id, (err, usuarioDB) => {
        
        if (err){
            borraArchivo(nombreArchivo, 'usuarios');

            return res.status(500).json({
                ok:false,
                err
            });
        }

        if (!usuarioDB){
            borraArchivo(nombreArchivo, 'usuarios');

            return res.status(400).json({
                ok:false,
                err:{
                    message: 'Usuario no existe'
                }
            });
        }

        //Verifico que la ruta exista y elimino la imagen anterior, o sea q tenga una imagen el usuario con la funcion borraArchivo()
        borraArchivo(usuarioDB.img, 'usuarios');
        

        usuarioDB.img = nombreArchivo;

        usuarioDB.save( (err, usuarioGuardado) =>{

            res.json({
                ok:true,
                usuario : usuarioGuardado,
                img: nombreArchivo
            })
        });
    })


}

function imagenProducto(id, res, nombreArchivo){

    Producto.findById(id, (err, productoDB) => {
        
        if (err){
            borraArchivo(nombreArchivo, 'productos');

            return res.status(500).json({
                ok:false,
                err
            });
        }

        if (!productoDB){
            borraArchivo(nombreArchivo, 'productos');
            
            return res.status(400).json({
                ok:false,
                err:{
                    message: 'Producto no existe'
                }
            });
        }

        //Verifico que la ruta exista y elimino la imagen anterior, o sea q tenga una imagen el usuario con la funcion borraArchivo()
        borraArchivo(productoDB.img, 'productos');
        

        productoDB.img = nombreArchivo;

        productoDB.save( (err, productoGuardado) =>{

            res.json({
                ok:true,
                producto: productoGuardado,
                img: nombreArchivo
            })
        });
    })
    
}


function borraArchivo( nombreImagen, tipo){
    //Verifico que la ruta exista, o sea q tenga una imagen el usuario
    let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${ nombreImagen }`);
    // Verifico si existe una imagen en el pathImagen.
    if( fs.existsSync(pathImagen) ){
        fs.unlinkSync(pathImagen);
    }

}

module.exports = app;