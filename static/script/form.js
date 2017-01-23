var canvas = document.querySelector('canvas');
var signaturePad = new SignaturePad(canvas);

var SignatureController = SignatureController || {};

SignatureController.toDataUrl = function() {
  $('img').attr('src', signaturePad.toDataURL());
};

SignatureController.clearSignatures = function() {
  signaturePad.clear();
};
