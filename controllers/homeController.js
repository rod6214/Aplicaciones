
var core = require('../server/mvcjs/mvcjs.js');
var mvc = core.mvc;

var homeController =  function(){}

homeController.prototype = new mvc.controllerBase;

homeController.prototype.init = function(){
    this.get('/views/home', GetAll);
}

function GetAll(view){
    view.render = 'home/index.ejs';
}

module.exports = function(){
    return new homeController();
}