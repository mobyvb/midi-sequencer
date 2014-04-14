var keys = $('.keys');
var allNotes = [];
var allEvents = [];
var pxPerMillis = 0.04521122685185185;
var endTime = 0;

for(var pitch=108; pitch>=21; pitch--) { // A0 to C8
  var note = noteFromMidiPitch(pitch);
  var keyClass = note.indexOf('#')>-1 ? 'key sharp':'key';
  var keyHtml = '<div class="'+keyClass+'">'+note+'</div>';
  keys.append('<li pitch='+pitch+'>'+keyHtml+'<div class="notes"></div></li>');
}
keys.scrollTop(keys.offset().top + (keys.height() / 2));

function noteFromMidiPitch(p) {
  var noteDict = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  var octave = Math.floor((p-12)/12);
  var note = noteDict[p-octave*12-12];
  return note+octave;
}

function drawSong() {
  allEvents = [];
  allNotes = [];
  endTime = 0;
  var openNotes = [];
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
      allEvents.push({
        subtype:event.subtype,
        pitch:event.noteNumber,
        channel:event.channel,
        velocity:event.velocity,
        time:time
      });
    });
    if(endTime<time) endTime = time;
  });

  pxPerMillis = 10000/endTime;
  $('.keys li .notes').html('');
  allNotes.forEach(function(note) {
    var notePos = ~~(pxPerMillis*note.startTime);
    var noteWidth = ~~(pxPerMillis*note.deltaTime);
    var noteStyle = 'left:'+notePos+'px; width:'+noteWidth+'px;';
    var noteHtml = '<div class="note" style="'+noteStyle+'"></div>';
    $('.keys li[pitch="'+note.pitch+'"] .notes').append(noteHtml);
  });
  allEvents = allEvents.sort(function(a, b) {
    return a.time-b.time;
  });
}

function playSong() {
  var time = 0;
  var currentTransform = 0;
  MIDI.loadPlugin({
    soundfontUrl: "./soundfont/",
    instrument: 0,
    callback: function() {
      $('.notes').css('transform', 'translate(-10000px)');
      $('.notes').css('transition', 'linear all ' + endTime + 'ms');
      nextEvent(0, 0, Date.now());
    }
  });

  function nextEvent(i, prevTime, startTime) {
    var event = allEvents[i];
    var time = event.time;
    var dt = Date.now()-startTime;
    if(dt > time) {
      time -= dt-time; // adjust for time delay
    }
    setTimeout(function() {
      if(event.subtype === 'noteOn') {
        $('.keys li[pitch="'+event.pitch+'"] .key').addClass('active');
        MIDI.noteOn(event.channel, event.pitch, event.velocity, 0);
      }
      else if(event.subtype === 'noteOff') {
        $('.keys li[pitch="'+event.pitch+'"] .key').removeClass('active');
        MIDI.noteOff(event.channel, event.pitch, 0);
      }
      if(i<allEvents.length-1)
        nextEvent(i+1, event.time, startTime);
    }, time-prevTime);
  }
}
