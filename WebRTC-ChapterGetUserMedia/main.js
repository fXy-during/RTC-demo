

function hasUserMedia(){
    return !!(navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
}



window.onload = function(){
    if (hasUserMedia()) {
        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
        navigator.getUserMedia({
            video: { 
                width: 1280, 
                height: 720 ,
                // mandatory: {
                //     minAspectRatio: 1.777,
                //     maxAspectRatio: 1.778
                // }
            },
            // video: true,
            // video:{
            //     mandatory:{
            //         minAspectRatio: 1.777,
            //         maxAspectRatio: 1.778
            //     },
            //     optional: {
            //         maxWidth: 640 ,
            //         maxHeight: 480
            //     }
            // },
            audio: false
        },function(stream){
            var video = document.querySelector('video');
            video.src = window.URL.createObjectURL(stream);
        },function(err){
            console.log(err);
            new Error("err");
        });
    }else{
        alert("sorry , your browser is not support getUserMedia!");
    }
}