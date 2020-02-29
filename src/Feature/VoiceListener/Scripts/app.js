function restore() {
    Fr.voice.stop();
}

function makeWaveform() {
    var analyser = Fr.voice.recorder.analyser;

    var bufferLength = analyser.frequencyBinCount;
    var dataArray = new Uint8Array(bufferLength);

    /**
     * The Waveform canvas
     */
    var WIDTH = 565,
        HEIGHT = 200;

    var canvasCtx = $("#level")[0].getContext("2d");
    canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);

    function draw() {
        var drawVisual = requestAnimationFrame(draw);

        analyser.getByteTimeDomainData(dataArray);

        canvasCtx.fillStyle = 'rgb(200, 200, 200)';
        canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);
        canvasCtx.lineWidth = 2;
        canvasCtx.strokeStyle = 'rgb(0, 0, 0)';

        canvasCtx.beginPath();

        var sliceWidth = WIDTH * 1.0 / bufferLength;
        var x = 0;
        for (var i = 0; i < bufferLength; i++) {
            var v = dataArray[i] / 128.0;
            var y = v * HEIGHT / 2;
            if (i === 0) {

                canvasCtx.moveTo(x, y);
            } else {

                canvasCtx.lineTo(x, y);
            }

            x += sliceWidth;
        }
        canvasCtx.lineTo(WIDTH, HEIGHT / 2);
        canvasCtx.stroke();
    };
    draw();
}

$(document).ready(function () {

    function loadPopup(name) {
        window.name = name;
        var dialog = `  <div class="modal fade" id="myModal" role="dialog">
    <div class="modal-dialog">
    
      <!-- Modal content-->
      <div class="modal-content">
        <div class="modal-header">
          <button type="button" class="close" data-dismiss="modal">&times;</button>
          <h4 class="modal-title">Speak Something</h4>
        </div>
        <div class="modal-body">
          <div class="form-group">
  <label for="comment">Text:</label>
  <textarea class="form-control" rows="5" id="text"></textarea>
  <canvas id="level" height="200" width="565"></canvas>
</div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-default" data-dismiss="modal">Ok Sitecore</button>
        </div>
      </div>
      
    </div>
  </div>
  
`;

        $(`#${name}`).parent().append(dialog);
        $("#myModal").on('shown.bs.modal', function () {
			$("#text").val('');
			
            window.isStopped=false;
  //          Fr.voice.recorder.stop();
            Fr.voice.record(false, function () {
                makeWaveform();
            });

        });
        $("#myModal").on('hidden.bs.modal', function () {
            //Fr.voice.export(upload, "blob");
            window.isStopped=true;
            $("#" + window.name).val($("#text").val());
//            restore();
        });
        $('#myModal').modal('toggle');
    }

    window.loadPopup = loadPopup;

});
