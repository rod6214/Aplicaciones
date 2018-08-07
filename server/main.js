
var homeController = require('../controllers/homeController')();
var usuarioController = require('../controllers/usuarioController')();
var loginController = require('../controllers/loginController')();
var core = require('../server/mvcjs/mvcjs');
core.mvc.setConfig('./server/mvcjs/config/config.json');
core.mvc.setRootPath(__dirname);
core.mvc.setControllers(homeController, usuarioController, loginController);
core.mvc.init(()=>{
    console.log('Servidor conectado...');
});