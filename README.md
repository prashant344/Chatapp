# chatapp
This is a chat application developed on Node js with the help of web sockets.
This has a feature of self destructing message. 
Once the user clicks on start chatting button after entering his name on the start page then chat page will appear.
The user can start chatting after entering the user name.
The user can see the typing information if someone is typing.
The message will be saved to the DB.
The application is built with the self desructing capability which is explained below:

#Self Descructing Messages:
The chat messages sent by the user will get self deleted from DB and same will get reflected on the UI.
Currently the time limit set for the self destruction of message is 30 seconds, which is configurable and can be configured to more or less number of seconds if required.

#Tech stack used:
1) Node js 
2) Postgresql for DB storage
3) Web socket
4) Mocha,Chai, Nock and socket.io-client js for testing 

#Access the application using the below URL:
https://agent-chatapp.herokuapp.com/
