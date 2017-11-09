/* 
* @Author: fxy
* @Date:   2017-08-08 19:53:42
* @Last Modified by:   anchen
* @Last Modified time: 2017-11-09 14:14:39
* 
* 11/09  API Update: videoNode.src = URL.createURL(blob)  => videoNode.srcObject = blob;
*/
/*
*
*   Gloabal veriable
* 
 */
var name,
    connectedUser;

//与服务器建立连接，传递服务器地址，再加上ws：//为前缀来实现
//"ws://"+window.location.host+'/FTF/u/websocket'
// var connection = new WebSocket('ws://39.108.174.208:8080/FTF/u/websocket'); 
var connection = new WebSocket('ws://localhost:8888'); 


var loginPage = document.querySelector('#login-page'),
    usernameInput = document.querySelector('#username'),
    loginBtn = document.querySelector('#login'),
    callPage = document.querySelector('#call-page'),
    theirUsernameInput = document.querySelector('#their-username'),
    callBtn = document.querySelector('#call'),
    hangUpBtn = document.querySelector('#hang-up');

    callPage.style.display = 'none';

var myVideo = document.querySelector('#my'),
    theirVideo = document.querySelector('#their'),
    myConnection,
    theirConnection,
    stream;




//单击登录
loginBtn.addEventListener('click', function(e){
    name = usernameInput.value;

    if (name.length > 0) {
        send({
            type: 'login',
            name: name
        })
    }
})
//挂断
hangUpBtn.addEventListener('click', function(e){
    send({
        type: 'leave',
    });

    onLeave();
})
//远程连接
callBtn.addEventListener('click', function(e){
    var theirUserName = theirUsernameInput.value;

    if (theirUserName.length > 0) {
        startPeerConnection(theirUserName);
    }
})
//登录
function onLogin(success){
    if (success == false) {
        alert("Login unsuccessful, please try a different name.");
    }else{
        loginPage.style.display = 'none';
        callPage.style.display = 'block';

        startConnection();
    }
}
//offer接收
function onOffer(offer, name){
    connectedUser = name;
    //接收远程SDP
    console.log('接收到的offer', offer);
    myConnection.setRemoteDescription(new RTCSessionDescription(offer));
    //
    myConnection.createAnswer(function(answer){
        myConnection.setLocalDescription(answer);
        send({
            type: 'answer',
            answer: answer
        })
    }, function(error){
        alert("An error has occurred at Offer")
    })
}

//应答
function onAnswer(answer){
    myConnection.setRemoteDescription(new RTCSessionDescription(answer));
}
// ice 候选通道
function onCandidate(candidate){
     console.log('接收到的candidate', candidate);
    myConnection.addIceCandidate(new RTCIceCandidate(candidate));
}
// 挂断
function onLeave(){
    connectedUser = null;
    theirVideo.src = null;
    myConnection.close();
    myConnection.onicecandidate = null;
    myConnection.onaddstream = null;
    setupPeerConnection(stream);
}
connection.onopen = function(){  //服务器连接成功
    console.log("Connected");
}

//通过onmessage方法获取所有基于WebRTC的消息
connection.onmessage = function(msg){
    console.log("Got message", msg.data);
    var data = JSON.parse(msg.data);
    switch(data.type){
        case 'login':
            onLogin(data.success);
            break;
        case 'offer':
            onOffer(data.offer, data.name);
            break;
        case 'answer':
            onAnswer(data.answer);
            break;
        case 'candidate':
            onCandidate(data.candidate);
            break;
        case 'leave':
            onLeave();
            break;
        default:
            break;
    }
}
connection.onerror = function(err){
    console.log("Got error", err);
}

function send(msg){
    if (connectedUser) {
        msg.name = connectedUser;  //将连接对象带入
    }
    connection.send(JSON.stringify(msg));
}


function startConnection(){
    if (hasUserMedia()) { //获取视频流
        var opts = {
            video: true,
            audio: false,
        }
        navigator.mediaDevices.
            getUserMedia(opts).
            then(function(myStream){
                stream = myStream;
                // myVideo.src = window.URL.createObjectURL(stream);
                myVideo.srcObject = stream;
                if (hasRTCPeerConnection()){ 
                    setupPeerConnection(stream);
                }else{
                    alert("sorry, your browser does not support WebRTC");
                }
            }).catch(function(err){
                console.log(err);
            })
        // navigator.getUserMedia({
        //     video: true,
        //     audio: false
        // },function(myStream){
        //     stream = myStream;
        //     myVideo.src = window.URL.createObjectURL(stream);
        //     myVideo.srcObject = stream;
        //     if (hasRTCPeerConnection()){ 
        //         setupPeerConnection(stream);
        //     }else{
        //         alert("sorry, your browser does not support WebRTC");
        //     }
        // },function(err){
        //     console.log(err);
        // })
    }else{
        alert("sorry, your browser does not support WebRTC");
    }
}

function setupPeerConnection(stream){
    var configuration = {
        "iceServers": [{
            "urls": "stun:stun.l.google.com:19302"  //google stun
        }]
    }
    myConnection = new RTCPeerConnection(configuration);
    console.log('myConnection', myConnection);
    //设置流的监听
    myConnection.addStream(stream);
    myConnection.onaddstream = function(e){
        // theirVideo.src = window.URL.createObjectURL(e.stream);
        theirVideo.srcObject = e.stream;
    }
    //设置ice处理事件
    myConnection.onicecandidate = function(e){
        if (e.candidate) {
            send({
                type: 'candidate',
                candidate: e.candidate
            })
        }
    }
}
function startPeerConnection(user){
    connectedUser = user;  //保存connTarget

    //创建offer
    //
    //myPeerConnection.createOffer(successCallback, failureCallback, [options]) 
    //  MDN 对createOffer的注解
    //The createOffer() method of the RTCPeerConnection interface initiates the creation of an SDP offer which includes information about any MediaStreamTracks already attached to the WebRTC session, codec and options supported by the browser, and any candidates already gathered by the ICE agent, for the purpose of being sent over the signaling channel to a potential peer to request a connection or to update the configuration of an existing connection.
    //
    //创建SDP(包括自己浏览器的会话,编译器和设备支持信息)
    myConnection.createOffer(function(offer){ 
        send({
            type: 'offer',
            offer: offer  //SDP 信息
        })
        //将SDP放入connection
        myConnection.setLocalDescription(offer); //asyn 
    }, function(error){
        alert("An error has occurred");
    })
}




function hasUserMedia(){
    navigator.getUserMedia = navigator.getUserMedia || 
        navigator.webkitGetUserMedia || 
        navigator.mozGetUserMedia || 
        navigator.msGetUserMedia;
    return !!navigator.getUserMedia;
}
function getUserMedia(opts, successCB, errorCB) {
    if (navigator.getUserMedia) {
        navigator.getUserMedia(opts, successCB, errorCB)
    } else if (MediaDevices.getUserMedia) {
        MediaDevices.getUserMedia(opts, successCB, errorCB)
    }
}
function hasRTCPeerConnection(){
    window.RTCPeerConnection = window.RTCPeerConnection || 
        window.webkitRTCPeerConnection || 
        window.mozRTCPeerConnection || 
        window.msRTCPeerConnection;

    window.RTCSessionDescription = window.RTCSessionDescription || 
        window.webkitRTCSessionDescription || 
        window.mozRTCSessionDescription || 
        window.msRTCSessionDescription;

    window.RTCIceCandidate = window.RTCIceCandidate ||
        window.webkitIceCandidate || 
        window.mozIceCandidate;
        // window.msIceCandidate;
    
    return !!window.RTCPeerConnection;
}