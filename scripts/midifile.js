var midiUpload = new Dropzone('#midi-upload', {url:'/', autoProcessQueue:false});
var song = {};
Blob = (function() {
  var nativeBlob = Blob;

  // Add unprefixed slice() method.
  if (Blob.prototype.webkitSlice) {
    Blob.prototype.slice = Blob.prototype.webkitSlice;
  }
  else if (Blob.prototype.mozSlice) {
    Blob.prototype.slice = Blob.prototype.mozSlice;
  }

  // Temporarily replace Blob() constructor with one that checks support.
  return function(parts, properties) {
    try {
      // Restore native Blob() constructor, so this check is only evaluated once.
      Blob = nativeBlob;
      return new Blob(parts || [], properties || {});
    }
    catch (e) {
      // If construction fails provide one that uses BlobBuilder.
      Blob = function (parts, properties) {
        var bb = new (WebKitBlobBuilder || MozBlobBuilder), i;
        for (i in parts) {
          bb.append(parts[i]);
        }
        return bb.getBlob(properties && properties.type ? properties.type : undefined);
      };
    }
  };
}());

midiUpload.on('addedfile', function(file) {
  uploadMidiFile(file);
});

function uploadMidiFile(file) {
  if (file) {
    var reader = new FileReader();
    reader.onload = function(e) {
      var buffer = e.target.result;
      song = midiConverter.midiToJson(buffer);
      drawSong(song);
      updateDownloadLink();
    };
    reader.readAsBinaryString(file);
  }
}

function updateDownloadLink() {
  var midi = midiConverter.jsonToMidi(song);
  var blob = new Blob([stringToArrayBuffer(midi)], {type:'audio/midi'});
  if(window.webkitURL) window.URL = window.webkitURL;
  url = window.URL.createObjectURL(blob);
  $('#midi-download').attr('href', url);
}

function stringToArrayBuffer(string) {
  return stringToUint8Array(string).buffer;
}
function stringToBinary(string) {
  var chars, code, i, isUCS2, len, _i;

  len = string.length;
  chars = [];
  isUCS2 = false;
  for (i = _i = 0; 0 <= len ? _i < len : _i > len; i = 0 <= len ? ++_i : --_i) {
      code = String.prototype.charCodeAt.call(string, i);
      if (code > 255) {
          isUCS2 = true;
          chars = null;
          break;
      } else {
          chars.push(code);
      }
  }
  if (isUCS2 === true) {
      return unescape(encodeURIComponent(string));
  } else {
      return String.fromCharCode.apply(null, Array.prototype.slice.apply(chars));
  }
}
function stringToUint8Array(string) {
  var binary, binLen, buffer, chars, i, _i;
  binary = stringToBinary(string);
  binLen = binary.length;
  buffer = new ArrayBuffer(binLen);
  chars  = new Uint8Array(buffer);
  for (i = _i = 0; 0 <= binLen ? _i < binLen : _i > binLen; i = 0 <= binLen ? ++_i : --_i) {
      chars[i] = String.prototype.charCodeAt.call(binary, i);
  }
  return chars;
}
