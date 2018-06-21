var should = require('should');
var io = require('socket.io-client');
var nock = require('nock');
var request = require('supertest')("http://localhost:3002");
var expect = require('chai').expect;

var socketURL = 'http://localhost:3002';

var options ={
    transports: ['websocket'],
    'force new connection':true
};

var chatUser1 = {'name':'Prashant'}
var chatUser2 = {'name':'Gyan'};

describe('chat server',()=>{
    it('should broadcast new user to all users',()=>{
        var client1 = io.connect(socketURL,options);

        client1.on('connect',(data)=>{
            client1.emit('connection name',chatUser1);

            var client2 = io.connect(socketURL,options);

            client2.on('connect',(data)=>{
                client2.emit('connection name',chatUser2);
            });
            client2.on('new user', function(usersName){
                usersName.should.equal(chatUser2.name + " has joined.");
                client2.disconnect();
        });
    });

    var numUsers = 0;
    client1.on('new user',(userName)=>{
        numUsers += 1;

        if(numUsers === 2){
                userName.should.equal(chatUser2.name + "has joined");
                client1.disconnect();
                done();
            }
        })
    })
    it('Should be able to broadcast messages',(done)=>{
        var client1, client2, client3;
        var message = "Hello world";
        var messages = 0;

        var checkMessage = (client)=>{
            client.on('message',(msg)=>{
                message.should.equal(msg);
                client.disconnect();
                messages++;
                if(messages === 3){
                    done();
                }
            })
        };

        client1 = io.connect(socketURL, options);
        checkMessage(client1);

        client1.on('connect',(data)=>{
            client2 = io.connect(socketURL,options);
            checkMessage(client2);
            
            client2.on('connect',(data)=>{
                client3 = io.connect(socketURL,options);
                checkMessage(client3);

                client3.on('connect',(data)=>{
                    client2.send(message);
                })
            })
        })
    })
})

describe("Testing API with mocked data",()=>{
    it('returns a successful mocked response for get user',(done)=>{
        nock('http://localhost:3002/').get('/getUser/').reply(
            200,{
                'status':200,
                'userid':1,
                'name':'Prashant'
            });

            request.get('/getUser/').end((err,res)=>{
                expect(res.body.status).to.equal(200);
                expect(res.body.name).to.equal('Prashant');
                done();
            })
    })
    
    it('returns a successful mocked response for get message',(done)=>{
        nock('http://localhost:3002/').get('/getMessages/').reply(
            200,{
                'status':200,
                'messageid':1,
                'text':'Hello world'
            });

            request.get('/getMessages/').end((err,res)=>{
                expect(res.body.status).to.equal(200);
                expect(res.body.text).to.equal('Hello world');
                done();
            })
    })

    it('returns a successful mocked user response after login',(done)=>{
        nock('http://localhost:3002/').get('/login/').reply(
            200,{
                'status':200,
                'userid':1,
                'name':'Prashant'
            });

            request.get('/login/').end((err,res)=>{
                expect(res.body.status).to.equal(200);
                expect(res.body.userid).to.equal(1);
                done();
            })
    })
})