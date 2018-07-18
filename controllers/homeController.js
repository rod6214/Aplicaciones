
var core = require('../server/mvcjs/mvcjs.js');
var mvc = core.mvc;

var homeController =  function(){}

homeController.prototype = new mvc.controllerBase;

homeController.prototype.init = function(){
    this.get('/views/home', 'home/index.ejs', GetAll);
}

function GetAll(view){
    console.log(view.__proto__);
}

module.exports = function(){
    return new homeController();
}