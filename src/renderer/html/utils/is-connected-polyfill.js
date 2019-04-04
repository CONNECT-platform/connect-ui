(function (supported){
  if (supported) return;
  Object.defineProperty(window.Node.prototype, 'isConnected', {get})
  function get() {
    if (document.contains)
      return document.contains(this);
    else return document.body.contains(this);
  }
})('isConnected' in window.Node.prototype);
