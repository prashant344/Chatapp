var express = require("express");
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
const { Pool, Client } = require('pg');
var bodyParser = require("body-parser");
var Promise = require('promise');
var path    = require("path");
var fs = require('fs');
var config = require('./config.js');

var port = process.env.PORT || 3002;

app.set('views',__dirname + '/public');


const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());  
app.use(express.static('public'));

app.get('/',function(req,res,next){
  res.sendFile(__dirname + '/public/login.html');
});

app.get('/chatapp',function(req,res,next){
  console.log('uid',req.query.uid);
  res.sendFile(__dirname + '/public/chatapp.html');
});

app.get('/getUser',(request,response)=>{
  pool.query('SELECT * from public.user', (err, res) => {
    response.send(res.rows);
  });
});

app.get('/getMessages',(request,response)=>{
  pool.query('SELECT * from public.messages', (err, res) => {
    response.send(res.rows);
  });
});

app.post('/login',function(req,res){
  const username=req.body.username;
  const text = 'INSERT INTO public.user(name) VALUES($1) RETURNING *'
  const values = [username];
  pool.query(text, values)
  .then(result => {
    var uid = result.rows[0].id; 
    res.json({uid:uid,name:result.rows[0].name})
  })
  .catch(e => console.error(e.stack))
})

app.post('/updateMessage',function(req,res){
  const values=[req.body.text,req.body.msgid];
  const query = 'UPDATE public.Messages SET text=($1) WHERE id=($2)';
  pool.query(query,values).then(
    res=>{console.log(res.rows[0])})
    .catch(e=>console.error(e.stack))
})

io.on('connection',function(client){
  console.log('client connected..');
  client.on('join',function(data){
    console.log(data);
  });
  
  client.on('message', function(msg){
    io.sockets.emit('message', msg);
  });

  client.on('sendMessage',function(data){
    const text = 'INSERT INTO public.Messages(text, status, userid, created, validity) VALUES($1,$2,$3,$4,$5) RETURNING *'
    const values = [data.message,'active',data.userid,new Date(),parseInt(config.messageValidityInSeconds)];
    var username="";
    pool.query(text, values)
    .then(res => {
      pool.query('SELECT * from public.user WHERE id=($1)',[data.userid]).then((val)=>{
        username = val.rows[0].name
        client.emit('thread',{data:res.rows[0],name:username});
        client.broadcast.emit('thread',{data:res.rows[0],name:username});
        setTimeout(function(){
          const value=[res.rows[0].id];
          const query = 'DELETE from public.Messages WHERE id=($1)';
           pool.query(query,value).then(
            result=>{
              client.emit('showMessages',{msgid:value});
              client.broadcast.emit('showMessages',{msgid:res.rows[0].id});
            })
            .catch(e=>console.error(e.stack))
        },parseInt(config.messageValidityInSeconds)); 
      })
    })
    .catch(e => console.error(e.stack))
  })

  client.on('deleteMessage',(data)=>{
    const values=[data.msgid];
    const query = 'DELETE from public.Messages WHERE id=($1)';
    pool.query(query,values).then(
      result=>{
        client.emit('showMessages',{msgid:data.msgid});
        client.broadcast.emit('showMessages',{msgid:data.msgid});
      })
  })

  client.on('typing',function(data){
    client.emit('typingInfo',data);
    client.broadcast.emit('typingInfo',data);
  })
});

server.listen(port);
