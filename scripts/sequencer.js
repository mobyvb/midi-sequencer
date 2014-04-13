var midiUpload = new Dropzone('#midi-upload', { url: "/file/post"});
var jsonFile = {};

midiUpload.on('addedfile', function(file) {
  console.log('file added');
  upload(file);
});
var buffer = '';
function upload(file) {
  if (file) {
    var reader = new FileReader();
    reader.onload = function(e) {
      buffer = e.target.result;
      var toJson = midiConverter.midiToJson(buffer);
      jsonFile = toJson;
    };
    reader.readAsBinaryString(file);
  }
}

function onDownload() {
  var midi = midiConverter.jsonToMidi(jsonFile);
  var blob = new Blob([stringToArrayBuffer(midi)], {type:'audio/midi'});
  url = window.URL.createObjectURL(blob);
  var a = document.createElement('a');
  document.body.appendChild(a);
  a.style = 'display: none';
  a.href = url;
  a.download = 'somethingnew.mid';
  a.click();
  window.URL.revokeObjectURL(url);
  debugger;
  document.location = 'data:Application/octet-stream,' + encodeURIComponent(midi);
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
