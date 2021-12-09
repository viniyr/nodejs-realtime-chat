const express = require('express');
const path = require('path')
const http = require('http');

const app = express();
app.set('port', process.env.PORT || 2222);
app.use(express.static(path.join(__dirname, 'public')))

const server = http.createServer(app).listen(app.get('port'), () => { 
    console.log('server listening port ' + app.get('port'));
});


