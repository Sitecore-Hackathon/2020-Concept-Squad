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

  var canvasCtx = $('#level')[0].getContext('2d');
  canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);

  function draw() {
    var drawVisual = requestAnimationFrame(draw);

    analyser.getByteTimeDomainData(dataArray);

    canvasCtx.fillStyle = 'rgb(200, 200, 200)';
    canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);
    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = 'rgb(0, 0, 0)';

    canvasCtx.beginPath();

    var sliceWidth = (WIDTH * 1.0) / bufferLength;
    var x = 0;
    for (var i = 0; i < bufferLength; i++) {
      var v = dataArray[i] / 128.0;
      var y = (v * HEIGHT) / 2;
      if (i === 0) {
        canvasCtx.moveTo(x, y);
      } else {
        canvasCtx.lineTo(x, y);
      }

      x += sliceWidth;
    }
    canvasCtx.lineTo(WIDTH, HEIGHT / 2);
    canvasCtx.stroke();
  }
  draw();
}

$(document).ready(function() {
  function loadPopup(name) {
    window.name = name;
    var dialog = `  <div class="modal fade" id="myModal" role="dialog">
    <div class="modal-dialog">
    
      <!-- Modal content-->
      <div class="modal-content">
        <div class="modal-header">
          <h4 class="modal-title">Speak to search modules</h4>
        </div>
        <div class="modal-body">
          <canvas id="level" height="200" width="565"></canvas>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
        </div>
        </div>
      </div>
      
    </div>
  </div>
  
`;

    $('body').append(dialog);
    $('#myModal').on('shown.bs.modal', function() {
      $('#content_1_SearchTextBox').val('');

      window.isStopped = false;
      Fr.voice.record(false, function() {
        makeWaveform();
      });
    });
    $('#myModal').on('hidden.bs.modal', function() {
      window.isStopped = true;
      $('#' + window.name).val($('#content_1_SearchTextBox').val());
      $('#myModal').remove();
      $('.modal-backdrop').remove();
    });
    $('#myModal').modal('toggle');
  }

  window.loadPopup = loadPopup;
});
