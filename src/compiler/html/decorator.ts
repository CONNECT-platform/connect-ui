export default function(renderFunc: () => void) {
  return function<_Comp extends {new(...args:any[]): any}>
    (_Class: _Comp) {

    class _NewComp extends _Class {
      render() {
        renderFunc.apply(this);
        return super.render();
      }
    }

    return _NewComp;
  }
}
