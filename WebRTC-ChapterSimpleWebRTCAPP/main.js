/* 
* @Author: anchen
* @Date:   2017-08-08 14:35:39
* @Last Modified by:   anchen
* @Last Modified time: 2017-08-08 16:17:13
*/

function hasUserMedia(){
    navigator.getUserMedia = navigator.getUserMedia || 
    navigator.webkitGetUserMedia || 
    navigator.mozGetUserMedia || 
    navigator.msGetUserMedia;
    return !!navigator.getUserMedia;
}

function hasRTCPeerConnection(){
    window.RTCPeerConnection = window.RTCPeerConnection || 
    window.webkitRTCPeerConnection || 
    window.mozRTCPeerConnection || 
    window.msRTCPeerConnection;
    return !!window.RTCPeerConnection;
}

function startPeerConnection(stream){
    var configuration = {
        //自定义增强iceServers
        "iceServers": [{
            "url": "stun:stun.l.google.com:19302"
        }]
    };
    myConnection = new webkitRTCPeerConnection(configuration);
    theirConnection = new webkitRTCPeerConnection(configuration);
    // console.log(myConnection);
    //create ice connection
    myConnection.onicecandidate = function(e){
        if (e.candidate) {
            theirConnection.addIceCandidate(new RTCPeerConnection(e.candidate));
        }
    }
    theirConnection.onicecandidate = function(e){
        if (e.candidate) {
            myConnection.addIceCandidate(new RTCPeerConnection(e.candidate));
        }
    }
    //start offer
    myConnection.createOffer(function(offer){//SDP会话描述
        myConnection.setLocalDescription(offer); //保存本地会话描述
        theirConnection.setRemoteDescription(offer); //接收offer

        theirConnection.createAnswer(function(offer){ //保存their的本地会话描述, 成功回调
            theirConnection.setLocalDescription(offer); //设置自己的本地局部描述
            myConnection.setRemoteDescription(offer); // 保存会话描述
        })
    })
    //监听流的创建
    myConnection.addStream(stream);
    theirConnection.onaddstream = function(e){
        console.log(e);
        theirVideo.src = window.URL.createObjectURL(e.stream);
    }
}

var myVideo = document.querySelector("#my"),
 theirVideo = document.querySelector("#their"),
 myConnection,
 theirConnection;

if (hasUserMedia()) {
    navigator.getUserMedia({
        video: true,
        audio: false
    },function(stream){

        myVideo.src = window.URL.createObjectURL(stream);
        if (hasRTCPeerConnection()) {
            startPeerConnection(stream);
            // theirVideo.src = window.URL.createObjectURL(stream);

        }else{
            alert("你的瀏覽器不支持WebRTC");
        }
    },function(err){
        alert("视频捕捉失败，请重试！");
        throw err;
        // console.error(err) || console.log(err);
    }) 
}else{
    alert("你的電腦不支持RTC！");
}


