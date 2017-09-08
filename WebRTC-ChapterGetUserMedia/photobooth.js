

function hasUserMedia(){
    return !!(navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
}


window.onload = function(){
    var filters = ['','grayscale', 'sepia', 'invert'], //滤镜效果
        currentFilter = 0;
    if (hasUserMedia()) {
        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
        var streaming = false,
            canvas = document.querySelector('canvas'),
            video = document.querySelector('video');
        navigator.getUserMedia({
            video: true,
            audio: false
        },function(stream){
            video.src = window.URL.createObjectURL(stream);
            streaming = true;
        },function(err){
            console.log(err);
            new Error("err");
        });
    }else{
        alert("sorry , your browser is not support getUserMedia!");
    }

    document.querySelector('#capture').addEventListener('click', function(){
        if (streaming) {
            canvas.width = video.clientWidth;
            canvas.height = video.clientHeight;
            var context = canvas.getContext("2d");
            context.drawImage(video, 0, 0);
            currentFilter++;
            if (currentFilter > filters.length-1 ) currentFilter = 0;
            canvas.className = filters[currentFilter];  // h5 DOM操作拓展
        }
    })
}