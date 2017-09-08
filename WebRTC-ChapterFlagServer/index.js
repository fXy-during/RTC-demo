

//信令服务器

var WebSocketServer = require('ws').Server,
    wss = new WebSocketServer({port: 8888}),
    users = {};

wss.on("connection", function(connection){ //建立连接
    console.log("User connected");
    connection.on('message', function(message) { //发送消息
        var data;
        try{
            data = JSON.parse(message);
        }
        catch(e){
            console.log('error parseing JSON:',message);
            data = {};
        }

        switch (data.type){
            case 'login':
                
                if (users[data.name]) {
                    sendTo(connection, {
                        type: 'login',
                        success: false
                    })
                    console.log("UserName repeat! try again", data.name);
                }else{
                    users[data.name] = connection;
                    connection.name = data.name;
                    sendTo(connection, {
                        type: 'login',
                        success: true
                    });
                    console.log("User logged in as", data.name);
                }
                break;
            case 'offer': //发起通话
                console.log("sending offer to", data.name);
                var conn = users[data.name];  // 获取连接通道信息

                if (conn != null) {
                    connection.otherName = data.name;
                    sendTo(conn, {
                        type: 'offer',
                        offer: data.offer,
                        name: connection.name
                    })
                };
                break;
            case 'answer':
                console.log("sending answer to", data.name);
                var conn = users[data.name];

                if (conn != null) {
                    connection.otherName = data.name;
                    sendTo(conn, {
                        type: 'answer',
                        answer: data.answer
                    })
                }
                break;
            case 'candidate':
                console.log("sending candidate to",data.name);
                var conn = users[data.name];

                if (conn != null) {
                    sendTo(conn, {
                        type: 'candidate',
                        candidate: data.candidate
                    })
                }
                break;
            case 'leave':
                console.log("Disconnection user from",data.name);
                var conn = users[data.name];
                connection.otherName = null;

                if (conn != null) {
                    sendTo(conn, {
                        type: 'leave',
                    })
                }
                break;
            default:
                sendTo(connection, {
                    type: 'error',
                    message: 'Unrecongnized command: '+ data.type
                });
                break;
        }
    });

    connection.send('Hello world');

    connection.on('close', function() {
        if (connection.name) {
            delete users[connection.name];
            if (connection.otherName) {
                console.log("Disconnection user from",data.name);
                var conn = users[connection.otherName];
                connection.otherName = null;

                if (conn != null) {
                    sendTo(conn, {
                        type: 'leave',
                    })
                }
            }
        }         
    });
})

wss.on('listening', function(event) {
    /* Act on the event */
    console.log("Server started...");
});
function sendTo(conn, msg){
    conn.send(JSON.stringify(msg));
}