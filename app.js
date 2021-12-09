const express = require('express');
const path = require('path');
const http = require('http');

const app = express();
app.set('port', process.env.PORT || 2222);
app.use(express.static(path.join(__dirname, 'public')))

const server = http.createServer(app).listen(app.get('port'), () => { 
    console.log('server listening port ' + app.get('port'));
});

const io = require('socket.io')(server);
io.listen(server);

let users = []

io.on('connection', (socket) => { 

    socket.on('connect', () => { 
        console.log('new connection - socket.id: ' + socket.id);
    })

    socket.on('disconnect', ()=> { 
        console.log(socket.nickname + "has disconnected")
        const updateUsers = users.filter(user => user != socket.nickname)
        console.log("updatedUsers: ", updateUsers)
        users = updateUsers
        io.emit('userList', users)
    })

    socket.on('nick', (nickname) => { 
        console.log("nick => nickname : ", nickname)
        socket.nickname = nickname
        users.push(nickname)

        console.log("server : users :", users)
        io.emit('userList', users);

    });

    socket.on('chat', (data)=> { 
        console.log("chat => nickname : ", socket.nickname)
        const d = new Date()
        const ts = d.toLocaleString
        console.log("ts : ", ts)
        const response = `${ts} : ${socket.nickname} : ${data.message}`
        console.log("ts : ", response)
        io.emit('chat', response)
    });

})
    

