const user = require('./server/user');
const session = require('./server/session');
const gameroom = require('./server/gameroom');
const params = require('./params');

const express = require('express');
const app = express();
const serv = require('http').Server(app);
const cors = require('cors');
// const { ExpressPeerServer } = require('peer');


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

/*
const peerServer = ExpressPeerServer(serv, {
    debug: true,
    path: '/call'
});
app.use('/voice', peerServer);
*/

const PORT = process.env.PORT || 2000;
const HOST = process.env.HOST || 'localhost';
const ENV = process.env.ENV || 'dev';

serv.listen(PORT);
console.log(`Server started at ${HOST} using port ${PORT}`);


let SOCKET_LIST = {};
const DEBUG = true;


var io = require('socket.io')(serv,{});
io.sockets.on('connection', function(socket){
	socket.id = Math.random();
	SOCKET_LIST[socket.id] = socket;
	console.log('Client connection', Object.keys(SOCKET_LIST));
	socket.emit('initConnection', {
	    env: ENV,
	    port: PORT,
        host: HOST
    });

    /***********************
	 * User Authentication *
     ***********************/
    socket.on('signIn', (data) => user.login(data, socket));
    socket.on('verify', (data) => user.verify(data, socket));
    socket.on('signUp', (data) => user.signup(data, socket));


    /***********
     * Session *
     ***********/
    socket.on('startSession',({userId}) => session.start(userId, socket.id));
    socket.on('findPartner', data => session.findPartner(data, socket, SOCKET_LIST));
    socket.on('cancelFindPartner', session.cancelFindPartner);
    socket.on('endSession',_ => session.end(socket.id));

    /********************
     * Gameroom Updates *
     ********************/
    socket.on('hostUpdate', gameroom.updateFromHost);
    socket.on('guestUpdate', gameroom.updateFromGuest);
    socket.on('togglePause', gameroom.togglePause);
    socket.on('endGame', gameroom.endGame);
    socket.on('chatMessage', gameroom.chatMessage);
    socket.on('matchPartner', gameroom.onMatchPartner);

    /*****************
     * Disconnection *
     *****************/

    socket.on('disconnect',function(){
        gameroom.partnerDisconnected(socket.id);
        session.end(socket.id);
        delete SOCKET_LIST[socket.id];
        // Player.onDisconnect(socket);
    });

    /*************
     * Debugging *
     ************/

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







