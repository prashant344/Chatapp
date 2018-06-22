var url = window.location.href;
var arr = url.split("/");
var domain = arr[0] + "//" + arr[2];
var socket= io.connect(domain+':'+process.env.PORT);

socket.on('connect',function(data){
    socket.emit('join','hello from client');
});

$("#send").click(function(){
    var message = {
        userid:(window.location.href.split('uid=')[1]).split('&')[0],
        name:(window.location.href.split('name=')[1]),
        message:$("#txtMessage").val()
    }
    postMessage(message);
});

function postMessage(msg){
    socket.emit('sendMessage',msg);
}

function showMessage(data){
    document.getElementById('textMessage').innerHTML+='<p id='+data.data.id+'>'+data.name+': '+data.data.text+'   '+
        '<button id="deleteMessage" msgid='+data.data.id+' onClick="'+"deleteMessage(event)"+';" class="btn btn-secondary">delete</button></p>';
    document.getElementById('typingInfo').innerHTML='';
}

$('#txtMessage').bind('focus',function(){
    var username = (window.location.href.split('name=')[1]);
    socket.emit('typing',username);
});

function deleteMessage(e){
    var msgid=$(e.target).attr('msgid');
    socket.emit('deleteMessage',{msgid:msgid});
}
socket.on('thread',function(data){
    showMessage(data);
});

socket.on('showMessages',function(data){
    document.getElementById(data.msgid).remove();
})

socket.on('typingInfo',function(data){
    document.getElementById('typingInfo').innerHTML='';
    document.getElementById('typingInfo').innerHTML+=JSON.stringify(data).replace('"',"").replace('"',"")+' is typing...<br/> ';
})
