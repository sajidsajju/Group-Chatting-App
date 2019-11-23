const express = require('express');
const app = express();
port = 3000;
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const http = require('http').Server(app);
const io = require('socket.io')(http);
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
//
app.use(cookieParser());
app.use(session({
    secret: 'secret123',
    saveUninitialized: true,
    resave: true,
    cookie: {maxAge: 60000}
}));
app.use(flash());


app.use((req,res,next) =>{
    res.locals.message = req.session.message
    delete req.session.messages
    next();
});

const authRoute = require('./routes/auth');
const postRoute = require('./routes/posts');
app.use('/css',express.static('css'));

app.use(bodyParser.urlencoded({extended:false}))

dotenv.config();
app.set('view engine', 'ejs');
mongoose.connect(
 process.env.DB_CONNECT,{ useNewUrlParser: true, useUnifiedTopology: true }, () =>{console.log('connected to DB')}
);

app.get('/',(req,res)=>{
    res.render('signup');
})

app.get('/login',(req,res)=>{
    res.render('login');
})

app.get('/user-login',(req,res)=>{
      res.render('index');
    
});

app.get('/logout',(req,res)=>{
    req.session.destroy((err)=>{
        if(err) 
        res.send('Error while logging out') 
        
        else
        res.redirect('/login');
        
    })
});


io.sockets.on('connection', function(socket) {
    socket.on('username', function(username) {
        socket.username = username;
        io.emit('is_online', '🔵 <i>' + socket.username + ' joined the chat..</i>');
    });

    socket.on('disconnect', function(username) {
        io.emit('is_online', '🔴 <i>' + socket.username + ' left the chat..</i>');
    })

    socket.on('chat_message', function(message) {
        io.emit('chat_message', '<strong>' + socket.username + '</strong>: ' + message);
    });

});


 app.use(authRoute);
app.use(postRoute);

// app.listen(port, ()=>{console.log(`server is running on ${port}`)});


const server = http.listen(port, function() {
    console.log('listening on *:3000');
});