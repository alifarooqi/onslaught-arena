let User = require('./user');
const {serv} = require('../app');
require('./Database');
require('./Entity');
require('./client/Inventory');


let SOCKET_LIST = {};


var DEBUG = true;


var io = require('socket.io')(serv,{});


io.sockets.on('connection', function(socket){
    console.log("Client connection");
    socket.id = Math.random();
    SOCKET_LIST[socket.id] = socket;

    socket.on('signIn',function(data){ //{username,password}
        User.login(data, function(res){
            if(!res)
                return socket.emit('signInResponse',{success:false});
            socket.emit('signInResponse',res);
            // Database.getPlayerProgress(data.username,function(progress){
            // 	Player.onConnect(socket,data.username,progress);
            // 	socket.emit('signInResponse',{success:true});
            // })
        });
    });

    socket.on('verify',function(data){ //{email}
        User.verify(data, function(res){
            if(!res)
                return socket.emit('verifyResponse',{success:false, data: 'Response error!'});
            socket.emit('verifyResponse',res);

            // Database.getPlayerProgress(data.username,function(progress){
            // 	Player.onConnect(socket,data.username,progress);
            // 	socket.emit('signInResponse',{success:true});
            // })
        });
    });

    socket.on('signUp',function(data){

        User.signup(data, function(res){
            if(!res)
                return socket.emit('signInResponse',{success:false});
            socket.emit('signUpResponse',res);
        });


    });


    socket.on('disconnect',function(){
        delete SOCKET_LIST[socket.id];
        Player.onDisconnect(socket);
    });

    socket.on('evalServer',function(data){
        if(!DEBUG)
            return;
        var res = eval(data);
        socket.emit('evalAnswer',res);
    });



});


// setInterval(function(){
// 	var packs = Entity.getFrameUpdateData();
// 	for(var i in SOCKET_LIST){
// 		var socket = SOCKET_LIST[i];
// 		socket.emit('init',packs.initPack);
// 		socket.emit('update',packs.updatePack);
// 		socket.emit('remove',packs.removePack);
// 	}
//
// },1000/25);
