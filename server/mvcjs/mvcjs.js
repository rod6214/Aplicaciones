(function(extern, express, http, fs, path, bodyParser, ejs){
    
    var app = express();
    var server = http.Server(app);
    var mvcCore = function(){}
    
    mvcCore.prototype = {
        
        controllers:[],
        configPath: '',
        rootPath:'',
        host:'',
        port:'',
        url:'',
        _configLoadedEvent:null,
        config:null,
        
        setRootPath:function(rootPath){
            this.rootPath = rootPath;
        },
        
        setConfig: function(jsonFile){
            
            this.configPath = jsonFile; 
        },
        
        setControllers: function(){

            if(arguments.length > 0)
                for(var key in arguments)
                    this.controllers.push(arguments[`${key}`]);
        },

        configLoadedEvent: function(callback){
            this._configLoadedEvent = callback;
        },
        
        init: function(callback){
            fs.readFile(this.configPath, (err, data)=>{
                if(err) throw err;
                var config = JSON.parse(data);
                if(IsObjectEmpty(config)) throw 'config.json file is empty.';
                if(config.options === undefined)
                    throw 'config.options is undefined object.';
                if(IsObjectEmpty(config.options)) throw 'config.options is empty.';
                this.config = config;
                this.host = this.config.options.host;
                this.port = this.config.options.port;
                this.url = path.join(this.host, ':', this.port);
                InitConfiguration(/* config.config, this.rootPath */ this);
                Redirections('/', config.redirection); 
                // Redirections(config.redirection);
                // if(typeof this._configLoadedEvent === 'function')
                //     this._configLoadedEvent(this);
                for(var key in this.controllers)
                {
                    var controller = this.controllers[`${key}`];
                    controller.setHost(this.host);
                    controller.setPort(this.port);
                    controller.setApp(app);
                    if(controller.init === undefined)
                        throw 'init method must be implemented.'
                    if(typeof controller.init !== 'function')
                        throw 'init must be a function.';
                    controller.init();
                }
                // Redirections(config.redirection);
                ErrorRedirection(config.errorPath); 
                Listen(config.options, callback);
            });
        }
    };
    
    var util = mvcCore.prototype.util = {}
    
    var viewBase = mvcCore.prototype.viewBase = function(mainUrl){
        this.mainUrl = mainUrl;
    }

    var controllerBase = mvcCore.prototype.controllerBase = function(){
        this.host = null;
        this.port = null;
    }
    
    util.getCurrentPath = function(){ return __dirname; }
    util.getJsonPath = function(){ return path.join(__dirname, 'config', 'config.json'); }

    viewBase.prototype = {
        __data__:null,
        getData:function(){
            return this.__data__;
        },
        setData:function(data){
            this.__data__ = data;
        }
    }
    
    controllerBase.prototype = {
        
        __app:null,
        getMainUrl:function(){
            return `${this.host}:${this.port}`;
        },
        setApp:function(tapp){
            this.__app = tapp;
        },
        setHost(host){ this.host = host;},
        setPort(port){ this.port = port;},
        //__parent__:{},

        //setParent:function(parent){ this.__parent__ = parent; console.log(parent.host);},
        
        get:function(lPath, rPath, callback){
            var view = new viewBase(this.getMainUrl());
            this.__app.get(lPath, (req, res)=>{
                callback(view);
                res.render(rPath, {data:view.getData(), url:this.getMainUrl()});
            });
        },
        post:function(lPath, rPath, callback){
            // var view = new view(this.__parent__.host, this.__parent__.port, rPath);
            // this.appParam.post(view.getRelativePath(), (res, req)=>{
            //     callback(view);
            //     res.render(lPath, {root:this.__parent__, data:view.getData(), url:view.getRootPath()});
            // });
        },
        put:function(lPath, rPath, callback){
            // var view = new view(this.__parent__.host, this.__parent__.port, rPath);
            // this.appParam.put(view.getRelativePath(), (res, req)=>{
            //     callback(view);
            //     res.render(lPath, {root:this.__parent__, data:view.getData(), url:view.getRootPath()});
            // });
        },
        delete:function(lPath, rPath, callback){
            // var view = new view(this.__parent__.host, this.__parent__.port, rPath);
            // this.appParam.delete(view.getRelativePath(), (res, req)=>{
            //     callback(view);
            //     res.render(lPath, {root:this.__parent__, data:view.getData(), url:view.getRootPath()});
            // });
        },
    }
    
    function Listen(options, callback){
        if(options === null)
            throw 'options is null';
        if(IsObjectEmpty(options))
            throw 'options is empty at least a port is required';
        if(options.port === undefined)
            throw 'options.port is undefined.';
        if(options.port === '')
            throw 'a port number is required.';
        server.listen(options, callback);
    }
    
    function IsObjectEmpty(obj){ return JSON.stringify(obj) === '{}'}
    
    function InitConfiguration(/* config, rootPath */ sender){
        if(sender === undefined)
            throw 'Param in InitConfiguration is undefined.';
        var config = sender.config.config;
        if(config === null)
            throw 'config property is null review json file';
        if(IsObjectEmpty(config))
            throw 'config property is empty review json file';
        if(config.staticPath === undefined)
            throw 'config.staticPath is not defined';
        if(config.viewsPath === undefined)
            throw 'config.viewsPath is not defined';
        if(config.viewAlias === undefined)
            throw 'config.viewAlias is not defined';
        //console.log(path.join(sender.rootPath,'./', config.staticPath));
        app.use(bodyParser.json());
        app.use(express.static(path.join(sender.rootPath,'./', config.staticPath)));
        app.use(bodyParser.urlencoded({ extended: true}));
        app.set(config.viewAlias, path.join(sender.rootPath, './', config.viewsPath));
        app.set('view engine', 'ejs');
        app.engine('html', ejs.renderFile);
    }
    
    function Redirections(root, redirection){
        app.get(root, function(req, res){
            res.redirect(redirection);
        });
    }
    
    function ErrorRedirection(errorPath){
        app.use(function(req, res, next){
            console.log('Error la pagina no se encuentra');
            res.status(404).render('error/index.ejs', {url:'http://localhost:3030'});
        });
    }
    
    extern.mvc = new mvcCore;
    
})(module.exports,
   require('express'),
   require('http'),
   require('fs'),
   require('path'),
   require('body-parser'),
   require('ejs')
  );

