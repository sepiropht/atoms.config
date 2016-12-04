Object.defineProperty(exports, '__esModule', {
  value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

exports.consumeTouchEvents = consumeTouchEvents;
exports.enableTouchEvents = enableTouchEvents;
exports.disableTouchEvents = disableTouchEvents;
exports.isTouchEventsEnabled = isTouchEventsEnabled;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

require('array.from');

var _atom = require('atom');

var _mainJs = require('./main.js');

var _autohideTreeViewJs = require('./autohide-tree-view.js');

var _configJs = require('./config.js');

var _configJs2 = _interopRequireDefault(_configJs);

var _utilsJs = require('./utils.js');

'use babel';

var touchEvents;

function consumeTouchEvents(touchEventsService) {
  touchEvents = touchEventsService;
  if (_configJs2['default'].showOn.match('touch')) enableTouchEvents();
}

var disposables;

function enableTouchEvents() {
  if (!touchEvents) return atom.notifications.addWarning('autohide-tree-view: atom-touch-events is not loaded, but it is required for touch events to work');

  if (disposables) return;
  disposables = new _atom.CompositeDisposable(touchEvents.onDidTouchSwipeLeft(swipeChange, function () {
    return swipeEnd(false);
  }), touchEvents.onDidTouchSwipeRight(swipeChange, function () {
    return swipeEnd(true);
  }));
}

function disableTouchEvents() {
  if (!disposables) return;
  disposables.dispose();
  disposables = null;
}

function isTouchEventsEnabled() {
  return !!disposables;
}

var isSwiping = false;

function shouldInitSwipe(touches, source) {
  // no swipe if either autohide or touch events is disabled
  if (!isTouchEventsEnabled()) return false;

  var _Array$from = Array.from(touches);

  var _Array$from2 = _slicedToArray(_Array$from, 1);

  var pageX = _Array$from2[0].pageX;

  // if swipe target isn't the tree view, check if
  // swipe is in touchArea
  if (!(0, _utilsJs.isChildOf)(source, _mainJs.treeViewEl.parentNode)) {
    // no swipe if not in touch area
    var showOnRightSide = atom.config.get('tree-view.showOnRightSide');
    if (showOnRightSide && pageX < window.innerWidth - _configJs2['default'].touchAreaSize || !showOnRightSide && pageX > _configJs2['default'].touchAreaSize) return false;
  }
  return isSwiping = true;
}

// triggered while swiping the tree view
function swipeChange(_ref) {
  var touches = _ref.args.touches;
  var source = _ref.source;
  var deltaX = _ref.deltaX;

  // check if swipe should show the tree view
  if (!isSwiping && !shouldInitSwipe(touches, source)) return;
  if (atom.config.get('tree-view.showOnRightSide')) deltaX *= -1;
  requestAnimationFrame(function frame() {
    var newWidth = _mainJs.treeViewEl.clientWidth + deltaX;
    newWidth = Math.min((0, _utilsJs.getContentWidth)(), Math.max(_configJs2['default'].minWidth, newWidth));
    _mainJs.treeViewEl.style.width = newWidth + 'px';
  });
}

// triggered after swipe, completely opens/closes the tree view
// depending on the side of the tree view and swipe direction
function swipeEnd(toRight) {
  if (!isSwiping) return;
  isSwiping = false;
  atom.config.get('tree-view.showOnRightSide') != toRight ? (0, _autohideTreeViewJs.showTreeView)() : (0, _autohideTreeViewJs.hideTreeView)();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3NlcGlyb3BodC8uYXRvbS9wYWNrYWdlcy9hdXRvaGlkZS10cmVlLXZpZXcvbGliL3RvdWNoLWV2ZW50cy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O1FBQ08sWUFBWTs7b0JBQ2UsTUFBTTs7c0JBQ2YsV0FBVzs7a0NBQ0sseUJBQXlCOzt3QkFDL0MsYUFBYTs7Ozt1QkFDUyxZQUFZOztBQU5yRCxXQUFXLENBQUM7O0FBUVosSUFBSSxXQUFXLENBQUM7O0FBRVQsU0FBUyxrQkFBa0IsQ0FBQyxrQkFBa0IsRUFBRTtBQUNyRCxhQUFXLEdBQUcsa0JBQWtCLENBQUM7QUFDakMsTUFBRyxzQkFBTyxNQUFNLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxFQUFFLGlCQUFpQixFQUFFLENBQUM7Q0FDdEQ7O0FBRUQsSUFBSSxXQUFXLENBQUM7O0FBRVQsU0FBUyxpQkFBaUIsR0FBRztBQUNsQyxNQUFHLENBQUMsV0FBVyxFQUNiLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMsa0dBQWtHLENBQUMsQ0FBQzs7QUFFM0ksTUFBRyxXQUFXLEVBQUUsT0FBTztBQUN2QixhQUFXLEdBQUcsOEJBQ1osV0FBVyxDQUFDLG1CQUFtQixDQUFDLFdBQVcsRUFBRTtXQUFNLFFBQVEsQ0FBQyxLQUFLLENBQUM7R0FBQSxDQUFDLEVBQ25FLFdBQVcsQ0FBQyxvQkFBb0IsQ0FBQyxXQUFXLEVBQUU7V0FBTSxRQUFRLENBQUMsSUFBSSxDQUFDO0dBQUEsQ0FBQyxDQUNwRSxDQUFDO0NBQ0g7O0FBRU0sU0FBUyxrQkFBa0IsR0FBRztBQUNuQyxNQUFHLENBQUMsV0FBVyxFQUFFLE9BQU87QUFDeEIsYUFBVyxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ3RCLGFBQVcsR0FBRyxJQUFJLENBQUM7Q0FDcEI7O0FBRU0sU0FBUyxvQkFBb0IsR0FBRztBQUNyQyxTQUFPLENBQUMsQ0FBQyxXQUFXLENBQUM7Q0FDdEI7O0FBRUQsSUFBSSxTQUFTLEdBQUcsS0FBSyxDQUFDOztBQUV0QixTQUFTLGVBQWUsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFOztBQUV4QyxNQUFHLENBQUMsb0JBQW9CLEVBQUUsRUFBRSxPQUFPLEtBQUssQ0FBQzs7b0JBQ3pCLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDOzs7O01BQTdCLEtBQUssbUJBQUwsS0FBSzs7OztBQUdYLE1BQUcsQ0FBQyx3QkFBVSxNQUFNLEVBQUUsbUJBQVcsVUFBVSxDQUFDLEVBQUU7O0FBRTVDLFFBQUksZUFBZSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLDJCQUEyQixDQUFDLENBQUM7QUFDbkUsUUFBRyxlQUFlLElBQUksS0FBSyxHQUFHLE1BQU0sQ0FBQyxVQUFVLEdBQUcsc0JBQU8sYUFBYSxJQUNwRSxDQUFDLGVBQWUsSUFBSSxLQUFLLEdBQUcsc0JBQU8sYUFBYSxFQUNoRCxPQUFPLEtBQUssQ0FBQztHQUNoQjtBQUNELFNBQU8sU0FBUyxHQUFHLElBQUksQ0FBQztDQUN6Qjs7O0FBR0QsU0FBUyxXQUFXLENBQUMsSUFBaUMsRUFBRTtNQUEzQixPQUFPLEdBQWYsSUFBaUMsQ0FBaEMsSUFBSSxDQUFHLE9BQU87TUFBRyxNQUFNLEdBQXhCLElBQWlDLENBQWYsTUFBTTtNQUFFLE1BQU0sR0FBaEMsSUFBaUMsQ0FBUCxNQUFNOzs7QUFFbkQsTUFBRyxDQUFDLFNBQVMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLEVBQUUsT0FBTztBQUMzRCxNQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLDJCQUEyQixDQUFDLEVBQUUsTUFBTSxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQzlELHVCQUFxQixDQUFDLFNBQVMsS0FBSyxHQUFHO0FBQ3JDLFFBQUksUUFBUSxHQUFHLG1CQUFXLFdBQVcsR0FBRyxNQUFNLENBQUM7QUFDL0MsWUFBUSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsK0JBQWlCLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxzQkFBTyxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQztBQUM1RSx1QkFBVyxLQUFLLENBQUMsS0FBSyxHQUFNLFFBQVEsT0FBSSxDQUFDO0dBQzFDLENBQUMsQ0FBQztDQUNKOzs7O0FBSUQsU0FBUyxRQUFRLENBQUMsT0FBTyxFQUFFO0FBQ3pCLE1BQUcsQ0FBQyxTQUFTLEVBQUUsT0FBTztBQUN0QixXQUFTLEdBQUcsS0FBSyxDQUFDO0FBQ2xCLE1BQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLDJCQUEyQixDQUFDLElBQUksT0FBTyxHQUFHLHVDQUFjLEdBQUcsdUNBQWMsQ0FBQztDQUMzRiIsImZpbGUiOiIvaG9tZS9zZXBpcm9waHQvLmF0b20vcGFja2FnZXMvYXV0b2hpZGUtdHJlZS12aWV3L2xpYi90b3VjaC1ldmVudHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbmltcG9ydCAnYXJyYXkuZnJvbSc7XG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGV9IGZyb20gJ2F0b20nO1xuaW1wb3J0IHt0cmVlVmlld0VsfSBmcm9tICcuL21haW4uanMnO1xuaW1wb3J0IHtzaG93VHJlZVZpZXcsIGhpZGVUcmVlVmlld30gZnJvbSAnLi9hdXRvaGlkZS10cmVlLXZpZXcuanMnO1xuaW1wb3J0IGNvbmZpZyBmcm9tICcuL2NvbmZpZy5qcyc7XG5pbXBvcnQge2dldENvbnRlbnRXaWR0aCwgaXNDaGlsZE9mfSBmcm9tICcuL3V0aWxzLmpzJztcblxudmFyIHRvdWNoRXZlbnRzO1xuXG5leHBvcnQgZnVuY3Rpb24gY29uc3VtZVRvdWNoRXZlbnRzKHRvdWNoRXZlbnRzU2VydmljZSkge1xuICB0b3VjaEV2ZW50cyA9IHRvdWNoRXZlbnRzU2VydmljZTtcbiAgaWYoY29uZmlnLnNob3dPbi5tYXRjaCgndG91Y2gnKSkgZW5hYmxlVG91Y2hFdmVudHMoKTtcbn1cblxudmFyIGRpc3Bvc2FibGVzO1xuXG5leHBvcnQgZnVuY3Rpb24gZW5hYmxlVG91Y2hFdmVudHMoKSB7XG4gIGlmKCF0b3VjaEV2ZW50cylcbiAgICByZXR1cm4gYXRvbS5ub3RpZmljYXRpb25zLmFkZFdhcm5pbmcoJ2F1dG9oaWRlLXRyZWUtdmlldzogYXRvbS10b3VjaC1ldmVudHMgaXMgbm90IGxvYWRlZCwgYnV0IGl0IGlzIHJlcXVpcmVkIGZvciB0b3VjaCBldmVudHMgdG8gd29yaycpO1xuXG4gIGlmKGRpc3Bvc2FibGVzKSByZXR1cm47XG4gIGRpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoXG4gICAgdG91Y2hFdmVudHMub25EaWRUb3VjaFN3aXBlTGVmdChzd2lwZUNoYW5nZSwgKCkgPT4gc3dpcGVFbmQoZmFsc2UpKSxcbiAgICB0b3VjaEV2ZW50cy5vbkRpZFRvdWNoU3dpcGVSaWdodChzd2lwZUNoYW5nZSwgKCkgPT4gc3dpcGVFbmQodHJ1ZSkpLFxuICApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZGlzYWJsZVRvdWNoRXZlbnRzKCkge1xuICBpZighZGlzcG9zYWJsZXMpIHJldHVybjtcbiAgZGlzcG9zYWJsZXMuZGlzcG9zZSgpO1xuICBkaXNwb3NhYmxlcyA9IG51bGw7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1RvdWNoRXZlbnRzRW5hYmxlZCgpIHtcbiAgcmV0dXJuICEhZGlzcG9zYWJsZXM7XG59XG5cbnZhciBpc1N3aXBpbmcgPSBmYWxzZTtcblxuZnVuY3Rpb24gc2hvdWxkSW5pdFN3aXBlKHRvdWNoZXMsIHNvdXJjZSkge1xuICAvLyBubyBzd2lwZSBpZiBlaXRoZXIgYXV0b2hpZGUgb3IgdG91Y2ggZXZlbnRzIGlzIGRpc2FibGVkXG4gIGlmKCFpc1RvdWNoRXZlbnRzRW5hYmxlZCgpKSByZXR1cm4gZmFsc2U7XG4gIHZhciBbe3BhZ2VYfV0gPSBBcnJheS5mcm9tKHRvdWNoZXMpO1xuICAvLyBpZiBzd2lwZSB0YXJnZXQgaXNuJ3QgdGhlIHRyZWUgdmlldywgY2hlY2sgaWZcbiAgLy8gc3dpcGUgaXMgaW4gdG91Y2hBcmVhXG4gIGlmKCFpc0NoaWxkT2Yoc291cmNlLCB0cmVlVmlld0VsLnBhcmVudE5vZGUpKSB7XG4gICAgLy8gbm8gc3dpcGUgaWYgbm90IGluIHRvdWNoIGFyZWFcbiAgICB2YXIgc2hvd09uUmlnaHRTaWRlID0gYXRvbS5jb25maWcuZ2V0KCd0cmVlLXZpZXcuc2hvd09uUmlnaHRTaWRlJyk7XG4gICAgaWYoc2hvd09uUmlnaHRTaWRlICYmIHBhZ2VYIDwgd2luZG93LmlubmVyV2lkdGggLSBjb25maWcudG91Y2hBcmVhU2l6ZSB8fFxuICAgICAgIXNob3dPblJpZ2h0U2lkZSAmJiBwYWdlWCA+IGNvbmZpZy50b3VjaEFyZWFTaXplKVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJldHVybiBpc1N3aXBpbmcgPSB0cnVlO1xufVxuXG4vLyB0cmlnZ2VyZWQgd2hpbGUgc3dpcGluZyB0aGUgdHJlZSB2aWV3XG5mdW5jdGlvbiBzd2lwZUNoYW5nZSh7YXJnczoge3RvdWNoZXN9LCBzb3VyY2UsIGRlbHRhWH0pIHtcbiAgLy8gY2hlY2sgaWYgc3dpcGUgc2hvdWxkIHNob3cgdGhlIHRyZWUgdmlld1xuICBpZighaXNTd2lwaW5nICYmICFzaG91bGRJbml0U3dpcGUodG91Y2hlcywgc291cmNlKSkgcmV0dXJuO1xuICBpZihhdG9tLmNvbmZpZy5nZXQoJ3RyZWUtdmlldy5zaG93T25SaWdodFNpZGUnKSkgZGVsdGFYICo9IC0xO1xuICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24gZnJhbWUoKSB7XG4gICAgdmFyIG5ld1dpZHRoID0gdHJlZVZpZXdFbC5jbGllbnRXaWR0aCArIGRlbHRhWDtcbiAgICBuZXdXaWR0aCA9IE1hdGgubWluKGdldENvbnRlbnRXaWR0aCgpLCBNYXRoLm1heChjb25maWcubWluV2lkdGgsIG5ld1dpZHRoKSk7XG4gICAgdHJlZVZpZXdFbC5zdHlsZS53aWR0aCA9IGAke25ld1dpZHRofXB4YDtcbiAgfSk7XG59XG5cbi8vIHRyaWdnZXJlZCBhZnRlciBzd2lwZSwgY29tcGxldGVseSBvcGVucy9jbG9zZXMgdGhlIHRyZWUgdmlld1xuLy8gZGVwZW5kaW5nIG9uIHRoZSBzaWRlIG9mIHRoZSB0cmVlIHZpZXcgYW5kIHN3aXBlIGRpcmVjdGlvblxuZnVuY3Rpb24gc3dpcGVFbmQodG9SaWdodCkge1xuICBpZighaXNTd2lwaW5nKSByZXR1cm47XG4gIGlzU3dpcGluZyA9IGZhbHNlO1xuICBhdG9tLmNvbmZpZy5nZXQoJ3RyZWUtdmlldy5zaG93T25SaWdodFNpZGUnKSAhPSB0b1JpZ2h0ID8gc2hvd1RyZWVWaWV3KCkgOiBoaWRlVHJlZVZpZXcoKTtcbn1cbiJdfQ==