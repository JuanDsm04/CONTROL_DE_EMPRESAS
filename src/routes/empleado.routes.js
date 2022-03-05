const express = require('express');
const empleadoControlador = require('../controllers/empleado.controller');
const md_autenticacion = require('../middlewares/autenticacion');

const api = express.Router();

api.post('/registrarEmpleado', md_autenticacion.Auth, empleadoControlador.AgregarEmpleado);
api.put('/editarEmpleado/:idEmpleado', md_autenticacion.Auth, empleadoControlador.EditarEmpleado);
api.delete('/eliminarEmpleado/:idEmpleado', md_autenticacion.Auth, empleadoControlador.EliminarEmpleado);

api.get('/controlPersonal/', md_autenticacion.Auth, empleadoControlador.ControlPersonal);
api.get('/buscarporidEmpleados/:idEmpleado', md_autenticacion.Auth, empleadoControlador.ObtenerEmpleadoId);
api.get('/buscarpornombreEmpleados/:nombreEmpleado', md_autenticacion.Auth, empleadoControlador.ObtenerEmpleadoPorNombre);
api.get('/buscarporpuestoEmpleados/:puestoEmpleado', md_autenticacion.Auth, empleadoControlador.ObtenerEmpleadoPorPuesto);
api.get('/buscarpordepartamentoEmpleados/:departamentoEmpleado', md_autenticacion.Auth, empleadoControlador.ObtenerEmpleadoPorDepartamento);
api.get('/obtenerEmpleadosEmpresas', md_autenticacion.Auth, empleadoControlador.ObtenerEmpleadosPorEmpresa);

api.get('/crearPDF', md_autenticacion.Auth, empleadoControlador.CrearPDF);
api.get('/crearExcel', md_autenticacion.Auth, empleadoControlador.CrearExcel);

module.exports = api;