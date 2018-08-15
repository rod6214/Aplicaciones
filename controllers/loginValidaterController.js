var core = require('../server/mvcjs/mvcjs.js');
var http = require('http');
var mvc = core.mvc;
var verbs = mvc.util.const.verbs;

var loginValidaterController =  function(){}

loginValidaterController.prototype = new mvc.controllerBase;

loginValidaterController.prototype.init = function(){
    this.post('/views/valid', ValidPage);
}

function ValidPage(view){
    mvc.util.sendToApi(view, 'localhost', '/api/login', 54376, verbs.POST, (body)=>{
        view.res.end(body.toString());
    });
}

module.exports = function(){
    return new loginValidaterController();
}