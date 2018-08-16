var core = require('../server/mvcjs/mvcjs.js');
var http = require('http');
var mvc = core.mvc;
var verbs = mvc.util.const.verbs;
var _const = mvc.util.const; 

var loginValidaterController =  function(){}

loginValidaterController.prototype = new mvc.controllerBase;

loginValidaterController.prototype.init = function(){
    this.post('/views/valid', ValidPage);
}

function ValidPage(view){
    mvc.util.sendToApi(view, 'localhost', '/api/login', 54376, verbs.POST, (body)=>{
        var cookieOptions = {
            httpOnly:true,
            path:'/',
            domain:'localhost',
            secure:false,
            expires:new Date(Date.now() + 6000)
        };
        console.log(body);
        if(body != null)
            if(body.Key != undefined && body.Value != undefined)
                view.res.cookie(body.Key, body.Value, cookieOptions);
        view.res.redirect('http://localhost:3030/views/home');
    });
}

module.exports = function(){
    return new loginValidaterController();
}