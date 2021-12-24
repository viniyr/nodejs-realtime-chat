const express = require('express');
const path = require('path');
const http = require('http');

const LocalStorage = require('node-localstorage').LocalStorage;
let localStorage = new LocalStorage('./storage');
const iplocate = require('node-iplocate');
const publicIp = require('public-ip');
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
        io.emit('userlist', users)
    })

    socket.on('nick', (nickname) => { 
        console.log("nick => nickname : ", nickname)
        socket.nickname = nickname
        users.push(nickname)

        console.log("server : users :", users)
        io.emit('userlist', users);

    });

    socket.on('chat', (data)=> { 
        console.log("chat => nickname : ", socket.nickname) 
        const d = new Date()
        const ts = d.toLocaleString()
        console.log("ts : ", ts)
        console.log("rs : ", response)
        var response = `${ts} : ${socket.nickname} : ${data.message}`

        publicIp.v4().then((ip) => { 
            console.log('ip ', ip);
            iplocate(ip).then((results)=> { 
                console.log('iplocate ', results)
                const respo = JSON.stringify(results.city);
                localStorage.setItem('userLocal', respo);
                const response = `${ts} [${respo}] : ${socket.nickname} : ${data.message}`
                io.emit('chat', response)
            }).catch(()=> { 
                console.log('ip doenst worked')
                io.emit('chat', response)
            })
        }).catch(()=> { 
            console.log('ip doenst worked')
            io.emit('chat', response)
        })
    });
});


    

