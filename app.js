var express = require('express');
//Initialize app to be a function handler that you can supply to an HTTP Server
var app = express(); 
var http = require('http').Server(app);
var io = require('socket.io')(http);

//Http server listen to port 8080

http.listen(8080, function(){
  console.log('listening on *:8080');
});


app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

var usernames = {};

io.sockets.on('connection', function(socket) { 

	//when the client emits 'sendchat', this listens and executes
	socket.on('sendchat', function(data) { 
		io.sockets.emit('updatechat', socket.username, data);
	});

	//when the client emits 'adduser', this listens and execute

	socket.on('adduser', function(username){ 
		//we store the username in the socket session for this client
		socket.username = username;
		
		//add client's username to global list
		usernames[username] = username;

		//echo to client they have connected
		socket.emit('updatechat', 'SERVER', ' You are connected');

		//echo globally that a person has connected
		io.emit('updatechat', 'SERVER', username + ' has connected.')

		//update the list of users in chat, client-side
		io.sockets.emit('updateusers', usernames);
	});

	//when the user disconnects..perform this
	socket.on('disconnects', function(){ 
		//remove the username from global usernames list
		delete usernames[socket.username];
		//update the list of users in chat, client-side
		io.sockets.emit('updateusers', usernames);		
		//echo globally that this person left
		io.emit('updatechat', 'SERVER', socket.username + ' has disconnected.')
	});
});