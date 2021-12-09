const express = require('express');
const http = require('http')
const app = express();
app.set('port', process.env.PORT || 2222);

const server = http.createServer(app).listen(app.get('port'), () => { 
    console.log('server listening port ' + app.get('port'));
});


