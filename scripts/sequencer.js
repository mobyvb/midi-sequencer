var midiUpload = new Dropzone('#midi-upload', {url:'/', autoProcessQueue:false});
var jsonFile = {};

midiUpload.on('addedfile', function(file) {
  uploadMidiFile(file);
});

function uploadMidiFile(file) {
  if (file) {
    var reader = new FileReader();
    reader.onload = function(e) {
      var buffer = e.target.result;
      var toJson = midiConverter.midiToJson(buffer);
      jsonFile = toJson;
      updateDownloadLink();
    };
    reader.readAsBinaryString(file);
  }
}

function updateDownloadLink() {
  var midi = midiConverter.jsonToMidi(jsonFile);
  var blob = new Blob([stringToArrayBuffer(midi)], {type:'audio/midi'});
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
