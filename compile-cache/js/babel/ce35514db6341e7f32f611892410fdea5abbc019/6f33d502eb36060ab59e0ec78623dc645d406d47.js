Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.enableHoverEvents = enableHoverEvents;
exports.disableHoverEvents = disableHoverEvents;
exports.isHoverEventsEnabled = isHoverEventsEnabled;
exports.disableHoverEventsDuringMouseDown = disableHoverEventsDuringMouseDown;
exports.disableHoverEventsUntilBlur = disableHoverEventsUntilBlur;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _atom = require('atom');

var _mainJs = require('./main.js');

var _autohideTreeViewJs = require('./autohide-tree-view.js');

var _configJs = require('./config.js');

var _configJs2 = _interopRequireDefault(_configJs);

var _utilsJs = require('./utils.js');

'use babel';

var disposables;

function enableHoverEvents() {
  if (disposables) return;
  disposables = new _atom.CompositeDisposable((0, _utilsJs.domListener)(_autohideTreeViewJs.eventTriggerArea, 'mouseenter', function () {
    return (0, _autohideTreeViewJs.showTreeView)(_configJs2['default'].showDelay, false);
  }), (0, _utilsJs.domListener)(_mainJs.treeViewEl, 'mouseleave', function () {
    return (0, _autohideTreeViewJs.hideTreeView)(_configJs2['default'].hideDelay);
  }), (0, _utilsJs.domListener)(_mainJs.treeViewEl.querySelector('.tree-view-resize-handle'), 'mousedown', function (event) {
    if (event.button == 0) disableHoverEventsDuringMouseDown();
  }), (0, _utilsJs.domListener)(document.body, 'mousedown', function (event) {
    if (event.button == 0) disableHoverEventsDuringMouseDown();
  }, { delegationTarget: 'atom-text-editor' }));
}

function disableHoverEvents() {
  if (!disposables) return;
  disposables.dispose();
  disposables = null;
}

function isHoverEventsEnabled() {
  return !!disposables;
}

function disableHoverEventsDuringMouseDown() {
  if (!disposables) return;
  disableHoverEvents();
  (0, _utilsJs.domListener)(document.body, 'mouseup', function () {
    enableHoverEvents();
  }, { once: true });
}

function disableHoverEventsUntilBlur() {
  if (!disposables) return;
  disableHoverEvents();
  (0, _utilsJs.domListener)(_mainJs.treeView.list[0], 'blur', function () {
    (0, _autohideTreeViewJs.clearFocusedElement)();
    enableHoverEvents();
    (0, _autohideTreeViewJs.hideTreeView)();
  }, { once: true });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3NlcGlyb3BodC8uYXRvbS9wYWNrYWdlcy9hdXRvaGlkZS10cmVlLXZpZXcvbGliL2hvdmVyLWV2ZW50cy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztvQkFDa0MsTUFBTTs7c0JBQ0wsV0FBVzs7a0NBRWxCLHlCQUF5Qjs7d0JBQ2xDLGFBQWE7Ozs7dUJBQ04sWUFBWTs7QUFOdEMsV0FBVyxDQUFDOztBQVFaLElBQUksV0FBVyxDQUFDOztBQUVULFNBQVMsaUJBQWlCLEdBQUc7QUFDbEMsTUFBRyxXQUFXLEVBQUUsT0FBTztBQUN2QixhQUFXLEdBQUcsOEJBQ1osZ0VBQThCLFlBQVksRUFBRTtXQUMxQyxzQ0FBYSxzQkFBTyxTQUFTLEVBQUUsS0FBSyxDQUFDO0dBQUEsQ0FDdEMsRUFFRCw4Q0FBd0IsWUFBWSxFQUFFO1dBQ3BDLHNDQUFhLHNCQUFPLFNBQVMsQ0FBQztHQUFBLENBQy9CLEVBRUQsMEJBQVksbUJBQVcsYUFBYSxDQUFDLDBCQUEwQixDQUFDLEVBQUUsV0FBVyxFQUFFLFVBQUEsS0FBSyxFQUFJO0FBQ3RGLFFBQUcsS0FBSyxDQUFDLE1BQU0sSUFBSSxDQUFDLEVBQUUsaUNBQWlDLEVBQUUsQ0FBQztHQUMzRCxDQUFDLEVBRUYsMEJBQVksUUFBUSxDQUFDLElBQUksRUFBRSxXQUFXLEVBQUUsVUFBQSxLQUFLLEVBQUk7QUFDL0MsUUFBRyxLQUFLLENBQUMsTUFBTSxJQUFJLENBQUMsRUFBRSxpQ0FBaUMsRUFBRSxDQUFDO0dBQzNELEVBQUUsRUFBQyxnQkFBZ0IsRUFBRSxrQkFBa0IsRUFBQyxDQUFDLENBQzNDLENBQUM7Q0FDSDs7QUFFTSxTQUFTLGtCQUFrQixHQUFHO0FBQ25DLE1BQUcsQ0FBQyxXQUFXLEVBQUUsT0FBTztBQUN4QixhQUFXLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDdEIsYUFBVyxHQUFHLElBQUksQ0FBQztDQUNwQjs7QUFFTSxTQUFTLG9CQUFvQixHQUFHO0FBQ3JDLFNBQU8sQ0FBQyxDQUFDLFdBQVcsQ0FBQztDQUN0Qjs7QUFFTSxTQUFTLGlDQUFpQyxHQUFHO0FBQ2xELE1BQUcsQ0FBQyxXQUFXLEVBQUUsT0FBTztBQUN4QixvQkFBa0IsRUFBRSxDQUFDO0FBQ3JCLDRCQUFZLFFBQVEsQ0FBQyxJQUFJLEVBQUUsU0FBUyxFQUFFLFlBQU07QUFDMUMscUJBQWlCLEVBQUUsQ0FBQztHQUNyQixFQUFFLEVBQUMsSUFBSSxFQUFFLElBQUksRUFBQyxDQUFDLENBQUM7Q0FDbEI7O0FBRU0sU0FBUywyQkFBMkIsR0FBRztBQUM1QyxNQUFHLENBQUMsV0FBVyxFQUFFLE9BQU87QUFDeEIsb0JBQWtCLEVBQUUsQ0FBQztBQUNyQiw0QkFBWSxpQkFBUyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsTUFBTSxFQUFFLFlBQU07QUFDMUMsa0RBQXFCLENBQUM7QUFDdEIscUJBQWlCLEVBQUUsQ0FBQztBQUNwQiwyQ0FBYyxDQUFDO0dBQ2hCLEVBQUUsRUFBQyxJQUFJLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQztDQUNsQiIsImZpbGUiOiIvaG9tZS9zZXBpcm9waHQvLmF0b20vcGFja2FnZXMvYXV0b2hpZGUtdHJlZS12aWV3L2xpYi9ob3Zlci1ldmVudHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZX0gZnJvbSAnYXRvbSc7XG5pbXBvcnQge3RyZWVWaWV3LCB0cmVlVmlld0VsfSBmcm9tICcuL21haW4uanMnO1xuaW1wb3J0IHtzaG93VHJlZVZpZXcsIGhpZGVUcmVlVmlldywgZXZlbnRUcmlnZ2VyQXJlYSxcbiAgY2xlYXJGb2N1c2VkRWxlbWVudH0gZnJvbSAnLi9hdXRvaGlkZS10cmVlLXZpZXcuanMnO1xuaW1wb3J0IGNvbmZpZyBmcm9tICcuL2NvbmZpZy5qcyc7XG5pbXBvcnQge2RvbUxpc3RlbmVyfSBmcm9tICcuL3V0aWxzLmpzJztcblxudmFyIGRpc3Bvc2FibGVzO1xuXG5leHBvcnQgZnVuY3Rpb24gZW5hYmxlSG92ZXJFdmVudHMoKSB7XG4gIGlmKGRpc3Bvc2FibGVzKSByZXR1cm47XG4gIGRpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoXG4gICAgZG9tTGlzdGVuZXIoZXZlbnRUcmlnZ2VyQXJlYSwgJ21vdXNlZW50ZXInLCAoKSA9PlxuICAgICAgc2hvd1RyZWVWaWV3KGNvbmZpZy5zaG93RGVsYXksIGZhbHNlKVxuICAgICksXG5cbiAgICBkb21MaXN0ZW5lcih0cmVlVmlld0VsLCAnbW91c2VsZWF2ZScsICgpID0+XG4gICAgICBoaWRlVHJlZVZpZXcoY29uZmlnLmhpZGVEZWxheSlcbiAgICApLFxuXG4gICAgZG9tTGlzdGVuZXIodHJlZVZpZXdFbC5xdWVyeVNlbGVjdG9yKCcudHJlZS12aWV3LXJlc2l6ZS1oYW5kbGUnKSwgJ21vdXNlZG93bicsIGV2ZW50ID0+IHtcbiAgICAgIGlmKGV2ZW50LmJ1dHRvbiA9PSAwKSBkaXNhYmxlSG92ZXJFdmVudHNEdXJpbmdNb3VzZURvd24oKTtcbiAgICB9KSxcblxuICAgIGRvbUxpc3RlbmVyKGRvY3VtZW50LmJvZHksICdtb3VzZWRvd24nLCBldmVudCA9PiB7XG4gICAgICBpZihldmVudC5idXR0b24gPT0gMCkgZGlzYWJsZUhvdmVyRXZlbnRzRHVyaW5nTW91c2VEb3duKCk7XG4gICAgfSwge2RlbGVnYXRpb25UYXJnZXQ6ICdhdG9tLXRleHQtZWRpdG9yJ30pLFxuICApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZGlzYWJsZUhvdmVyRXZlbnRzKCkge1xuICBpZighZGlzcG9zYWJsZXMpIHJldHVybjtcbiAgZGlzcG9zYWJsZXMuZGlzcG9zZSgpO1xuICBkaXNwb3NhYmxlcyA9IG51bGw7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0hvdmVyRXZlbnRzRW5hYmxlZCgpIHtcbiAgcmV0dXJuICEhZGlzcG9zYWJsZXM7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkaXNhYmxlSG92ZXJFdmVudHNEdXJpbmdNb3VzZURvd24oKSB7XG4gIGlmKCFkaXNwb3NhYmxlcykgcmV0dXJuO1xuICBkaXNhYmxlSG92ZXJFdmVudHMoKTtcbiAgZG9tTGlzdGVuZXIoZG9jdW1lbnQuYm9keSwgJ21vdXNldXAnLCAoKSA9PiB7XG4gICAgZW5hYmxlSG92ZXJFdmVudHMoKTtcbiAgfSwge29uY2U6IHRydWV9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRpc2FibGVIb3ZlckV2ZW50c1VudGlsQmx1cigpIHtcbiAgaWYoIWRpc3Bvc2FibGVzKSByZXR1cm47XG4gIGRpc2FibGVIb3ZlckV2ZW50cygpO1xuICBkb21MaXN0ZW5lcih0cmVlVmlldy5saXN0WzBdLCAnYmx1cicsICgpID0+IHtcbiAgICBjbGVhckZvY3VzZWRFbGVtZW50KCk7XG4gICAgZW5hYmxlSG92ZXJFdmVudHMoKTtcbiAgICBoaWRlVHJlZVZpZXcoKTtcbiAgfSwge29uY2U6IHRydWV9KTtcbn1cbiJdfQ==