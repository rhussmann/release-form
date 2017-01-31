var SignatureController = SignatureController || {};

$(function() {
  var canvas = document.querySelector('canvas');
  var signaturePad = new SignaturePad(canvas);

  SignatureController.toDataUrl = function() {
    console.log('toDataUrl');
    $('img').attr('src', signaturePad.toDataURL());
  };

  SignatureController.clearSignatures = function() {
    console.log('Clear signatures');
    signaturePad.clear();
  };

  SignatureController.submit = function() {
    $('#signature-text').val(signaturePad.toDataURL());
    $('form:first').submit();
  };
});
