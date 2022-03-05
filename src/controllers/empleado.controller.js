const Empleados = require('../models/empleado.model');
const bcrypt = require('bcrypt-nodejs')
const jwt = require('../services/jwt');


/* CREAR EMPLEADO */
function AgregarEmpleado(req, res){
    var parametros = req.body;
    var empleadoModel = new Empleados();

    if (parametros._id != null){
        return res.status(500).send({ mensaje: 'No se puede elegir el id'});
    }

    if ( req.user.rol == 'ROL_ADMINISTRADOR' ) 
        return res.status(500).send({ mensaje: 'El administrador no puede agregar un empleado'});

    if(parametros.nombre && parametros.puesto && parametros.departamento){
        empleadoModel.nombre = parametros.nombre;
        empleadoModel.puesto = parametros.puesto;
        empleadoModel.departamento = parametros.departamento;
        empleadoModel.idEmpresa = req.user.sub;

        empleadoModel.save((err, empleadoGuardado) =>{
            if(err) return res.status(500).send({mensaje: "Error en la peticion"});
            if(!empleadoGuardado) return res.status(500).send({mensaje: "Error al guardar el empleado"});

            return res.status(200).send({empleado: empleadoGuardado});
        });
    }else{
        return res.status(500).send({mensaje: "Debe rellenar los campos necesarios"});
    }
}


/* EDITAR EMPLEADO */
function EditarEmpleado(req, res){
    var idEmple = req.params.idEmpleado;
    var parametros = req.body;

    if (parametros.idEmpresa != null){
        return res.status(500).send({ mensaje: 'No se puede el id de la empresa'});
    }

    if (parametros._id != null){
        return res.status(500).send({ mensaje: 'No se puede editar el id'});
    }
 
    if(req.user.rol == 'ROL_ADMINISTRADOR')
    return res.status(404).send ({mensaje: 'El administrador no puede editar a los empleados de las empresas'});

    Empleados.findOneAndUpdate({_id:idEmple, idEmpresa: req.user.sub}, parametros, {new: true} ,(err, empleadoActualizado) => {
        if (err) return res.status(500).send({mensaje: 'Error en la peticion'});
        if(!empleadoActualizado) return res.status(404).send({mensaje: "Ocurrio un error o no tiene permitido modificar a los empleados de esta empresa."});

        return res.status(200).send({empleado: empleadoActualizado});
    })
}


/* ELIMINAR EMPLEADO */
function EliminarEmpleado (req, res){
    var idEmple = req.params.idEmpleado;

    if(req.user.rol == 'ROL_ADMINISTRADOR')
    return res.status(404).send ({mensaje: 'El administrador no puede eliminar a los empleados de las empresas'});

    Empleados.findOneAndDelete({_id:idEmple, idEmpresa: req.user.sub},(err, empleadoEliminado) => {
        if(err) return res.status(500).send ({mensaje: 'Error en la peticion'});
        if (!empleadoEliminado) return res.status(404).send ({mensaje: 'Ocurrio un error o intento eliminar a un empleado que no le pertenece'});

        return res.status(200).send({empleado: empleadoEliminado});
    })
}


/* CONTROL DE PERSONAL (CANTIDAD DE EMPLEADOS POR EMPRESA) */
function ControlPersonal(req, res){

    if(req.user.rol == 'ROL_ADMINISTRADOR')
    return res.status(404).send ({mensaje: 'El administrador no puede buscar empleados de las empresas'});

    Empleados.find({ idEmpresa : req.user.sub }, (err, empleadosEncontrados) => {
        if(err) return res.status(500).send({ mensaje: "Error en la peticion" });
        if(!empleadosEncontrados) return res.status(500).send({ mensaje: "Error al obtener los empleados"});

        return res.status(200).send({ mensaje: 'La empresa tiene: '+ empleadosEncontrados.length +' empleado(s)'});
    })
}

/* BUSCAR EMPLEADO POR ID */
function ObtenerEmpleadoId(req, res){
    var idEmple = req.params.idEmpleado;
    
    if(req.user.rol == 'ROL_ADMINISTRADOR')
    return res.status(404).send ({mensaje: 'El administrador no puede buscar empleados de las empresas'});


    Empleados.find({_id:idEmple, idEmpresa: req.user.sub},(err, empleadoEncontrado) => {
        if(err) return res.status(500).send({mensaje: 'Error en la peticion'});

        if(empleadoEncontrado==0)
        return res.status(404).send({mensaje: 'No se encontraron empleados'});

        if(!empleadoEncontrado) return res.status(404).send({mensaje: 'Error al obtener los datos'});
        return res.status(200).send({empleado: empleadoEncontrado});
    })
}


/* BUSCAR EMPLEADO POR NOMBRE */
function ObtenerEmpleadoPorNombre(req, res){
    var nomEmple = req.params.nombreEmpleado;

    if(req.user.rol == 'ROL_ADMINISTRADOR')
    return res.status(404).send ({mensaje: 'El administrador no puede buscar empleados de las empresas'});

    Empleados.find({nombre: { $regex: nomEmple, $options: 'i'}, idEmpresa: req.user.sub} ,(err, empleadoEncontrado) => {

        if(err) return res.status(500).send({mensaje: 'Error en la peticion'});

        if(empleadoEncontrado==0)
        return res.status(404).send({mensaje: 'No se encontraron empleados'});

        if(!empleadoEncontrado) return res.status(404).send({mensaje: 'Error, no se encontraron empleados con ese nombre.'});
        return res.status(200).send({empleado: empleadoEncontrado});
    })
}


/* BUSCAR EMPLEADO POR PUESTO */
function ObtenerEmpleadoPorPuesto(req, res){
    var puesEmple = req.params.puestoEmpleado;

    if(req.user.rol == 'ROL_ADMINISTRADOR')
    return res.status(404).send ({mensaje: 'El administrador no puede buscar empleados de las empresas'});

    Empleados.find({puesto: { $regex: puesEmple, $options: 'i'}, idEmpresa: req.user.sub} ,(err, empleadoEncontrado) => {

        if(err) return res.status(500).send({mensaje: 'Error en la peticion'});

        if(empleadoEncontrado==0)
        return res.status(404).send({mensaje: 'No se encontraron empleados'});

        if(!empleadoEncontrado) return res.status(404).send({mensaje: 'Error, no se encontraron empleados con ese puesto'});
        return res.status(200).send({empleado: empleadoEncontrado});
    })
}


/* BUSCAR EMPLEADO POR DEPARTAMENTO */
function ObtenerEmpleadoPorDepartamento(req, res){
    var depEmple = req.params.departamentoEmpleado;

    if(req.user.rol == 'ROL_ADMINISTRADOR')
    return res.status(404).send ({mensaje: 'El administrador no puede buscar empleados de las empresas'});

    Empleados.find({departamento: { $regex: depEmple, $options: 'i'}, idEmpresa: req.user.sub}, (err, empleadoEncontrado) => {

        if(err) return res.status(500).send({mensaje: 'Error en la peticion'});

        if(empleadoEncontrado==0)
        return res.status(404).send({mensaje: 'No se encontraron empleados'});

        if(!empleadoEncontrado) return res.status(404).send({mensaje: 'Error, no se encontraron empleados con ese departamento'});
        return res.status(200).send({empleado: empleadoEncontrado});
    })
}


/* MOSTRAR TODOS LOS EMPLEADOS DE LA EMPRESA*/
function ObtenerEmpleadosPorEmpresa(req, res){

    if(req.user.rol == 'ROL_ADMINISTRADOR')
    return res.status(404).send ({mensaje: 'El administrador no puede buscar empleados de las empresas'});

    Empleados.find({ idEmpresa : req.user.sub }, (err, empleadosEncontrados) => {
        if(err) return res.status(500).send({ mensaje: "Error en la peticion" });
        if(!empleadosEncontrados) return res.status(500).send({ mensaje: "Error al obtener los empleados"});

        if(empleadosEncontrados==0)
        return res.status(404).send({mensaje: 'No se encontraron empleados'});

        return res.status(200).send({ empleados: empleadosEncontrados });
    })
}


/* CREAR PDF CON LOS EMPLEADOS DE LA EMPRESA*/
function CrearPDF(req, res) { 
    const fs = require('fs');

    const Pdfmake = require('pdfmake');

    var fonts = {
        Roboto: {
            normal: './fonts/roboto/Roboto-Regular.ttf',
            bold: './fonts/roboto/Roboto-Medium.ttf',
            italics: './fonts/roboto/Roboto-Italic.ttf',
            bolditalics: './fonts/roboto/Roboto-MediumItalic.ttf'
        }
    };

    let pdfmake = new Pdfmake(fonts);

    if(req.user.rol == 'ROL_ADMINISTRADOR')
    return res.status(404).send ({mensaje: 'El administrador no puede generar un pdf con los empleados de las empresas'});

    Empleados.find({ idEmpresa : req.user.sub }, (err, empladosObtenidos) => {
        if(err) return res.status(500).send({ mensaje: "Error en la peticion" });
        if(!empladosObtenidos) return res.status(500).send({ mensaje: "Error al obtener los empleados"});

        var nombreEmpresa = req.user.nombre;

        let content = [{
            text: "Empleados de la Empresa"+ "\n",
            alignment: 'center',
            fontSize: 28,
            color: '#1A5276',
            bold: true,
            italics: true
        }]

        content.push({
            text: nombreEmpresa +"\n",
            fontSize: 28,
            alignment: 'center',
            color: '#F39C12',
            bold: true,
            italics: true
        })
        
        content.push({
            text: '====================================================================' +"\n" +"\n",
            color: '#1A5276',
        })

        content.push({
            text: '---------------------------------------------------------------------------------------------------------------------------------------',
            color: '#F39C12',
        })

        for(let i = 0; i < empladosObtenidos.length; i++){
            var info = 'ID: '+empladosObtenidos[i]._id +'\n'+'Nombre: '+empladosObtenidos[i].nombre +'\n'+'Puesto: '+empladosObtenidos[i].puesto +'\n'+'Departamento: '+ empladosObtenidos[i].departamento + '\n'

            content.push({
                text: info
            })

            content.push({
                text: '---------------------------------------------------------------------------------------------------------------------------------------',
                color: '#F39C12',
            })
        }

        let footerPdf = {
            footer: {
                margin: [72, 0, 72, 0],
                fontSize: 10,
                color: '#1A5276',
                columns: [{
                        with: 'auto',
                        alignment: 'left',
                        text: '____________________________________________________________________________________________________' +"\n" +
                        'Información perteneciente a ©' + nombreEmpresa
                    }
    
                ],
            },

            content: content,
            pageMargins: [72, 70, 72, 70],
        }
    
        pdfDoc = pdfmake.createPdfKitDocument(footerPdf, {});
        pdfDoc.pipe(fs.createWriteStream('pdfs/empleados'+nombreEmpresa+'.pdf'));
        pdfDoc.end();
        return res.status(200).send({ mensaje: 'Archivo pdf generado correctamente' });
    })
}


/* CREAR EXCEL CON LOS EMPLEADOS DE LA EMPRESA */
function CrearExcel (req, res){
    var xl = require('excel4node');
    var wb = new xl.Workbook();
    var ws = wb.addWorksheet('Empleados');

    var estiloTitulo = wb.createStyle({
        font: {
            color: '#283747',
            size: 18,
            bold: true,
        },
        alignment: {
            horizontal: ['center'],
            wrapText: true,
        },
        fill: {
            type: 'pattern',
            patternType: 'solid',
            fgColor: 'FFE699',
        },
        border: {
            left: {
                style: 'thin',
                color: '#283747'
            },
            right: {
                style: 'thin',
                color: '#283747'
            },
            top: {
                style: 'thin',
                color: '#283747'
            },
            bottom: {
                style: 'thin',
                color: '#283747'
            }
        }
    });

    var estiloSubtitulo = wb.createStyle({
        font: {
            color: '#283747',
            size: 14,
            bold: true,
        },
        alignment: {
            horizontal: ['center'],
            wrapText: true,
        },
        fill: {
            type: 'pattern',
            patternType: 'solid',
            fgColor: '#FFE699',
        },
        border: {
            left: {
                style: 'thin',
                color: '#283747'
            },
            right: {
                style: 'thin',
                color: '#283747'
            },
            top: {
                style: 'thin',
                color: '#283747'
            },
            bottom: {
                style: 'thin',
                color: '#283747'
            }
        }
    });

    var estiloContenido = wb.createStyle({
        font: {
            color: '#040404',
            size: 12,
        },
        alignment: {
            horizontal: ['center'],
            wrapText: true,
        },
        border: {
            left: {
                style: 'thin',
                color: '#283747'
            },
            right: {
                style: 'thin',
                color: '#283747'
            },
            top: {
                style: 'thin',
                color: '#283747'
            },
            bottom: {
                style: 'thin',
                color: '#283747'
            }
        }
    });

    if(req.user.rol == 'ROL_ADMINISTRADOR')
    return res.status(404).send ({mensaje: 'El administrador no puede generar un excel con los empleados de las empresas'});

    Empleados.find({ idEmpresa : req.user.sub }, (err, empleadosEncontrados) => {
        if(err) return res.status(500).send({ mensaje: "Error en la peticion" });
        if(!empleadosEncontrados) return res.status(500).send({ mensaje: "Error al obtener los empleados"});

        var nombreEmpresa = req.user.nombre;

        ws.cell(1,3).string("Empleados de "+nombreEmpresa).style(estiloTitulo);
        ws.cell(2,2).string("Nombre").style(estiloSubtitulo);
        ws.cell(2,3).string("Puesto").style(estiloSubtitulo);
        ws.cell(2,4).string("Departamento").style(estiloSubtitulo);

        for(let i = 0; i < empleadosEncontrados.length; i++){
            ws.cell(i+3, 2).string(empleadosEncontrados[i].nombre).style(estiloContenido);
            ws.cell(i+3, 3).string(empleadosEncontrados[i].puesto).style(estiloContenido);
            ws.cell(i+3, 4).string(empleadosEncontrados[i].departamento).style(estiloContenido);
        }

        ws.column(2).setWidth(35);
        ws.column(3).setWidth(35);
        ws.column(4).setWidth(35);

        wb.write('./excels'+'/empleados'+nombreEmpresa+'.xlsx');

        return res.status(200).send({ mensaje: 'Archivo excel generado correctamente' });
    })
}


module.exports = {
    AgregarEmpleado,
    EditarEmpleado,
    EliminarEmpleado,
    ControlPersonal,
    ObtenerEmpleadoId,
    ObtenerEmpleadoPorNombre,
    ObtenerEmpleadoPorPuesto,
    ObtenerEmpleadoPorDepartamento,
    ObtenerEmpleadosPorEmpresa,
    CrearPDF,
    CrearExcel
}