var keys = $('.keys');
for(var pitch=108; pitch>=21; pitch--) { // A0 to C8
  var note = noteFromMidiPitch(pitch);
  var noteClass = note.indexOf('#')>-1 ? 'sharp':'';
  keys.append('<li class="'+noteClass+'">'+note+'</li>')
}

function noteFromMidiPitch(p) {
  var noteDict = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  var octave = Math.floor((p-12)/12);
  var note = noteDict[p-octave*12-12];
  return note+octave;
}
