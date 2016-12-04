Object.defineProperty(exports, '__esModule', {
  value: true
});

var _mainJs = require('./main.js');

var _autohideTreeViewJs = require('./autohide-tree-view.js');

var _utilsJs = require('./utils.js');

'use babel';

var pinView = document.createElement('div');
pinView.classList.add('tree-view-pin-button', 'icon', 'icon-pin');
(0, _utilsJs.domListener)(pinView, 'mousedown', function () {
  return (0, _autohideTreeViewJs.toggleAutohide)();
});

exports['default'] = {
  attach: function attach() {
    _mainJs.treeViewEl.querySelector('.tree-view-scroller').appendChild(pinView);
    this.deactivate();
  },

  detach: function detach() {
    pinView.remove();
    if (tooltip) tooltip.dispose();
  },

  show: function show() {
    pinView.style.display = '';
  },

  hide: function hide() {
    pinView.style.display = 'none';
  },

  activate: function activate() {
    pinView.classList.add('active');
    setTooltip('Pin tree-view');
  },

  deactivate: function deactivate() {
    pinView.classList.remove('active');
    setTooltip('Unpin tree-view');
  },

  isActive: function isActive() {
    return !!pinView.parentNode && pinView.classList.contains('active');
  }
};

var tooltip;

function setTooltip(title) {
  if (tooltip) tooltip.dispose();
  tooltip = atom.tooltips.add(pinView, { title: title });
}
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3NlcGlyb3BodC8uYXRvbS9wYWNrYWdlcy9hdXRvaGlkZS10cmVlLXZpZXcvbGliL3Bpbi12aWV3LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7c0JBQ3lCLFdBQVc7O2tDQUNQLHlCQUF5Qjs7dUJBQzVCLFlBQVk7O0FBSHRDLFdBQVcsQ0FBQzs7QUFLWixJQUFJLE9BQU8sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQzVDLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLHNCQUFzQixFQUFFLE1BQU0sRUFBRSxVQUFVLENBQUMsQ0FBQztBQUNsRSwwQkFBWSxPQUFPLEVBQUUsV0FBVyxFQUFFO1NBQU0seUNBQWdCO0NBQUEsQ0FBQyxDQUFDOztxQkFFM0M7QUFDYixRQUFNLEVBQUEsa0JBQUc7QUFDUCx1QkFBVyxhQUFhLENBQUMscUJBQXFCLENBQUMsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDckUsUUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO0dBQ25COztBQUVELFFBQU0sRUFBQSxrQkFBRztBQUNQLFdBQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUNqQixRQUFHLE9BQU8sRUFBRSxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7R0FDL0I7O0FBRUQsTUFBSSxFQUFBLGdCQUFHO0FBQ0wsV0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO0dBQzVCOztBQUVELE1BQUksRUFBQSxnQkFBRztBQUNMLFdBQU8sQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQztHQUNoQzs7QUFFRCxVQUFRLEVBQUEsb0JBQUc7QUFDVCxXQUFPLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUNoQyxjQUFVLENBQUMsZUFBZSxDQUFDLENBQUM7R0FDN0I7O0FBRUQsWUFBVSxFQUFBLHNCQUFHO0FBQ1gsV0FBTyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDbkMsY0FBVSxDQUFDLGlCQUFpQixDQUFDLENBQUM7R0FDL0I7O0FBRUQsVUFBUSxFQUFBLG9CQUFHO0FBQ1QsV0FBTyxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQVUsSUFBSSxPQUFPLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztHQUNyRTtDQUNGOztBQUVELElBQUksT0FBTyxDQUFDOztBQUVaLFNBQVMsVUFBVSxDQUFDLEtBQUssRUFBRTtBQUN6QixNQUFHLE9BQU8sRUFBRSxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDOUIsU0FBTyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxFQUFDLEtBQUssRUFBTCxLQUFLLEVBQUMsQ0FBQyxDQUFDO0NBQy9DIiwiZmlsZSI6Ii9ob21lL3NlcGlyb3BodC8uYXRvbS9wYWNrYWdlcy9hdXRvaGlkZS10cmVlLXZpZXcvbGliL3Bpbi12aWV3LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5pbXBvcnQge3RyZWVWaWV3RWx9IGZyb20gJy4vbWFpbi5qcyc7XG5pbXBvcnQge3RvZ2dsZUF1dG9oaWRlfSBmcm9tICcuL2F1dG9oaWRlLXRyZWUtdmlldy5qcyc7XG5pbXBvcnQge2RvbUxpc3RlbmVyfSBmcm9tICcuL3V0aWxzLmpzJztcblxudmFyIHBpblZpZXcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbnBpblZpZXcuY2xhc3NMaXN0LmFkZCgndHJlZS12aWV3LXBpbi1idXR0b24nLCAnaWNvbicsICdpY29uLXBpbicpO1xuZG9tTGlzdGVuZXIocGluVmlldywgJ21vdXNlZG93bicsICgpID0+IHRvZ2dsZUF1dG9oaWRlKCkpO1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gIGF0dGFjaCgpIHtcbiAgICB0cmVlVmlld0VsLnF1ZXJ5U2VsZWN0b3IoJy50cmVlLXZpZXctc2Nyb2xsZXInKS5hcHBlbmRDaGlsZChwaW5WaWV3KTtcbiAgICB0aGlzLmRlYWN0aXZhdGUoKTtcbiAgfSxcblxuICBkZXRhY2goKSB7XG4gICAgcGluVmlldy5yZW1vdmUoKTtcbiAgICBpZih0b29sdGlwKSB0b29sdGlwLmRpc3Bvc2UoKTtcbiAgfSxcblxuICBzaG93KCkge1xuICAgIHBpblZpZXcuc3R5bGUuZGlzcGxheSA9ICcnO1xuICB9LFxuXG4gIGhpZGUoKSB7XG4gICAgcGluVmlldy5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICB9LFxuXG4gIGFjdGl2YXRlKCkge1xuICAgIHBpblZpZXcuY2xhc3NMaXN0LmFkZCgnYWN0aXZlJyk7XG4gICAgc2V0VG9vbHRpcCgnUGluIHRyZWUtdmlldycpO1xuICB9LFxuXG4gIGRlYWN0aXZhdGUoKSB7XG4gICAgcGluVmlldy5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUnKTtcbiAgICBzZXRUb29sdGlwKCdVbnBpbiB0cmVlLXZpZXcnKTtcbiAgfSxcblxuICBpc0FjdGl2ZSgpIHtcbiAgICByZXR1cm4gISFwaW5WaWV3LnBhcmVudE5vZGUgJiYgcGluVmlldy5jbGFzc0xpc3QuY29udGFpbnMoJ2FjdGl2ZScpO1xuICB9LFxufTtcblxudmFyIHRvb2x0aXA7XG5cbmZ1bmN0aW9uIHNldFRvb2x0aXAodGl0bGUpIHtcbiAgaWYodG9vbHRpcCkgdG9vbHRpcC5kaXNwb3NlKCk7XG4gIHRvb2x0aXAgPSBhdG9tLnRvb2x0aXBzLmFkZChwaW5WaWV3LCB7dGl0bGV9KTtcbn1cbiJdfQ==