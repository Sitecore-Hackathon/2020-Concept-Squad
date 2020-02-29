/**
 * @Developer: Sagar Mal Shankhala
 */
(function(window){
    window.Fr = window.Fr || {};
    window.isStopped=false;
    function upload(blob) {
        var formData = new FormData();
        formData.append('file', blob);
        Fr.voice.recorder.stop();
        $.ajax({
            url: "https://eastus.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=en-US",
            type: 'POST',
            data: blob,
            contentType: false,
            processData: false,
            beforeSend: function (xhr) {
                xhr.setRequestHeader('content-type', 'audio/wav; codecs=audio/pcm; samplerate=16000');
                xhr.setRequestHeader('Ocp-Apim-Subscription-Key', '73ebe70a09c041f698d958dd46f563ff');
            },
            success: function (response) {
                var displayText = response.DisplayText;
                if (displayText) {
                    if (displayText.toLowerCase().includes('ok done.') || displayText.toLowerCase().includes('ok, done.')) {
                        displayText = displayText.replace(/OK done./g, '');
                        displayText = displayText.replace(/OK, done./g, '');
                        var text = $("#text").val();
                        $("#text").val(text+displayText);
                        $("#" + window.name).val($("#text").val());
                        $('#myModal').modal('toggle');
                    }
                    var text = $("#text").val();
                    $("#text").val(text+displayText);
                }
                Fr.voice.record(false, function () {
                    makeWaveform();
                });

            }
        });
    }
    Fr.voice = {
        stream: false,
        input: false,

        init_called: false,

        stopRecordingTimeout: false,
        init: function(){
            try {
                // Fix up for prefixing
                window.AudioContext = window.AudioContext||window.webkitAudioContext;
                navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia
                    || navigator.mozGetUserMedia || navigator.msGetUserMedia;
                window.URL = window.URL || window.webkitURL;

                if(navigator.getUserMedia === false){
                    alert('getUserMedia() is not supported in your browser');
                }
                this.context = new AudioContext();
            }catch(e) {
                alert('Web Audio API is not supported in this browser');
            }
        },

        /**
         * Start recording audio
         */
        record: function(output, finishCallback, recordingCallback){
            var finishCallback = finishCallback || function(){};
            var recordingCallback = recordingCallback || function(){};

            if(this.init_called === false){
                this.init();
                this.init_called = true;
            }

            var $that = this;
            navigator.getUserMedia({audio: true}, function(stream){

                /**
                 * Live Output
                 */
                $that.input = $that.context.createMediaStreamSource(stream);
                if(output === true){
                    $that.input.connect($that.context.destination);
                }

                $that.recorder = new Recorder($that.input, {
                    'recordingCallback': recordingCallback
                });

                $that.stream = stream;
                var speechEvents = hark(stream, {});
                $that.recorder.record();
                finishCallback(stream);
                speechEvents.on('stopped_speaking', function() {
                    console.log("stopped");
                    Fr.voice.export(upload, "blob");

                });

            }, function() {
                alert('No live audio input');
            });
        },

        /**
         * Pause the recording
         */
        pause: function(){
            this.recorder.stop();
        },

        resume: function(){
            this.recorder.record();
        },

        /**
         * Stop recording audio.
         * This will reset the recorded audio and the
         * recorded audio can't be played or exported after.
         * @return {Fr.voice}
         */
        stop: function(){
            this.recorder.stop();
            this.recorder.clear();
            this.stream.getTracks().forEach(function (track) {
                track.stop();
            });
            return this;
        },

        /**
         * Export the recorded audio as WAV in different formats
         * @param {[type]} [varname] [description]
         */
        export: function(callback, type){
            if(!window.isStopped) {
                this.recorder.exportWAV(function (blob) {
                    Fr.voice.callExportCallback(blob, callback, type);
                });
            }
        },


        /**
         * Call the export callback with data it requires
         * @param  {Blob}     blob     Exported blob
         * @param  {string}   type     Type of data to export
         * @param  {Function} callback Export callback
         */
        callExportCallback: function(blob, callback, type) {
            if(typeof type === "undefined" || type == "blob"){
                callback(blob);
            }else if (type === "base64"){
                var reader = new window.FileReader();
                reader.readAsDataURL(blob);
                reader.onloadend = function() {
                    base64data = reader.result;
                    callback(base64data);
                };
            }else if(type === "URL"){
                var url = URL.createObjectURL(blob);
                callback(url);
            }
        },

        /**
         * Pause the recording after a specific time
         * @param  integer time Time in milliseconds
         * @return void
         */
        stopRecordingAfter: function(time, callback){
            var callback = callback || function(){};

            clearTimeout(this.stopRecordingTimeout);
            this.stopRecordingTimeout = setTimeout(function(){
                Fr.voice.pause();
                callback();
            }, time);
        }
    };
})(window);
