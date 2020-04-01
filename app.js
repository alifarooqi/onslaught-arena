let user = require('./server/user');
let session = require('./server/session');
let gameroom = require('./server/gameroom');
const params = require('./params');

var express = require('express');
var app = express();
var serv = require('http').Server(app);
var cors = require('cors')

app.use(cors());


app.get('/',function(req, res) {
	res.sendFile(__dirname + '/client/index.html');
});

app.get('/login',function(req, res) {
    res.sendFile(__dirname + '/client/login/login.html');
});

app.get('/signup',function(req, res) {
    res.sendFile(__dirname + '/client/login/signup.html');
});

app.get('/favicon.ico',function(req, res) {
    res.sendFile(__dirname + '/client/img/favicon.ico');
});


app.use('/client',express.static(__dirname + '/client'));
app.use('/login',express.static(__dirname + '/client/login'));

const PORT = process.env.PORT || 2000;
serv.listen(PORT);
console.log("Server started at port", PORT);

var SOCKET_LIST = {};


var DEBUG = true;


var io = require('socket.io')(serv,{});
io.sockets.on('connection', function(socket){
	socket.id = Math.random();
	SOCKET_LIST[socket.id] = socket;
	console.log('Client connection');
	console.log(Object.keys(SOCKET_LIST));

    /***********************
	 * User Authentication *
     ***********************/
	socket.on('signIn',function(data){ //{username,password}
		user.login(data, function(res){
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
        user.verify(data, function(res){
            if(!res)
                return socket.emit('verifyResponse',{success:false, data: 'Response error!'});
            socket.emit('verifyResponse',res);
        });
    });

	socket.on('signUp',function(data){
		user.signup(data, function(res){
            if(!res)
                return socket.emit('signUpResponse',{success:false});
            socket.emit('signUpResponse',res);
        });


	});


    /***********
     * Session *
     ***********/
    socket.on('startSession',({userId}) => session.start(userId, socket.id));

    socket.on('findPartner', function findPartner (data){
    	let partner = session.getPartner(data.userId, data.username, socket.id);
    	if(partner){
    		if(SOCKET_LIST[partner.socketId]){
    			partner.multiplayerType = params.multiplayerType.guest;
    			let user = {...data, multiplayerType: params.multiplayerType.host, socketId: socket.id};
    			gameroom.create(user, socket, partner, SOCKET_LIST[partner.socketId], res => {
    				if(res.success){
    					user.gameroomId = res.gameroomId;
                        partner.gameroomId = res.gameroomId;
                        socket.emit('findPartnerResponse', partner);
                        SOCKET_LIST[partner.socketId].emit('findPartnerResponse', user);
					}
				});

    		}
    		else
    			findPartner(data);
    	}
    });

    socket.on('cancelFindPartner', session.cancelFindPartner);

    socket.on('endSession',_ => session.end(socket.id));




    /********************
     * Gameroom Updates *
     ********************/
    socket.on('hostUpdate', gameroom.updateFromHost);

    socket.on('guestUpdate', gameroom.updateFromGuest);

    socket.on('togglePause', gameroom.togglePause);

    socket.on('endGame', gameroom.endGame);



    /*****************
     * Disconnection *
     *****************/

    socket.on('disconnect',function(){
        gameroom.partnerDisconnected(socket.id);
        session.end(socket.id);
        delete SOCKET_LIST[socket.id];
        // Player.onDisconnect(socket);
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

/*
var profiler = require('v8-profiler');
var fs = require('fs');
var startProfiling = function(duration){
	profiler.startProfiling('1', true);
	setTimeout(function(){
		var profile1 = profiler.stopProfiling('1');
		
		profile1.export(function(error, result) {
			fs.writeFile('./profile.cpuprofile', result);
			profile1.delete();
			console.log("Profile saved.");
		});
	},duration);	
}
startProfiling(10000);
*/







