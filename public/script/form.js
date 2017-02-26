var SignatureController = SignatureController || {};

$(function() {
  var canvas = document.querySelector('canvas');
  var signaturePad = new SignaturePad(canvas);
  var callback;

  SignatureController.toDataUrl = function() {
    return signaturePad.toDataURL();
  };

  SignatureController.clearSignatures = function() {
    signaturePad.clear();
  };

  // NOTE: required a workaround for High DPI screens.
  //
  // See https://github.com/szimek/signature_pad/issues/153 for
  // more detail.
  //
  // Notice signaturePad.fromDataUrl is not being called.
  SignatureController.initWithDataURL = function(signatureDataURL) {
    var image = new Image();
    signaturePad.clear();
    image.src = signatureDataURL;
    image.onload = function () {
      canvas.getContext("2d").drawImage(image, 0, 0, image.width, image.height);
      (callback) ? callback() : null;
    };
    signaturePad._isEmpty = false;
  };

  SignatureController.submit = function() {
    $('#signature-text').val(signaturePad.toDataURL());
    $('form:first').submit();
  };

  SignatureController.registerImageLoadCallback = function(cb) {
    callback = cb;
  };

  var signatureData = $('#signature-text').val();
  if (signatureData && signatureData.length > 0) {
    SignatureController.initWithDataURL(signatureData);
  }
});
