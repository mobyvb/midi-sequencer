var keys = $('.keys');

for(var pitch=108; pitch>=21; pitch--) { // A0 to C8
  var note = noteFromMidiPitch(pitch);
  var keyClass = note.indexOf('#')>-1 ? 'key sharp':'key';
  var keyHtml = '<div class="'+keyClass+'">'+note+'</div>';
  keys.append('<li pitch='+pitch+'>'+keyHtml+'<div class="notes"></div></li>');
}

function noteFromMidiPitch(p) {
  var noteDict = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  var octave = Math.floor((p-12)/12);
  var note = noteDict[p-octave*12-12];
  return note+octave;
}

function drawSong(song) {
  var allNotes = [];
  var openNotes = [];
  var endTime = 0;
  song.tracks.forEach(function(track) {
    var time = 0;
    track.forEach(function(event) {
      time += event.deltaTime;
      if(event.subtype === 'noteOn') {
        var pitch = event.noteNumber;
        openNotes[pitch] = time;
      }
      else if(event.subtype === 'noteOff') {
        var pitch = event.noteNumber;
        var channel = event.channel;
        var startTime = openNotes[pitch];
        openNotes[pitch] = null;
        var newNote = {
          pitch: pitch,
          startTime: startTime,
          deltaTime: time-startTime,
          channel: channel
        };
        allNotes.push(newNote);
      }
    });
    if(endTime<time) endTime = time;
  });

  console.log(JSON.stringify(allNotes, null, 4));
  console.log('end time: ' + endTime);

  var pxPerMillis = 10000/endTime;
  allNotes.forEach(function(note) {
    var notePos = ~~(pxPerMillis*note.startTime);
    var noteWidth = ~~(pxPerMillis*note.deltaTime);
    var noteStyle = 'left:'+notePos+'px; width:'+noteWidth+'px;';
    var noteHtml = '<div class="note" style="'+noteStyle+'"></div>';
    $('.keys li[pitch="'+note.pitch+'"] .notes').append(noteHtml);
  });
}
