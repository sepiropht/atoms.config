Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.domListener = domListener;
exports.isChildOf = isChildOf;
exports.getContentWidth = getContentWidth;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

require('array.from');

var _atom = require('atom');

var _mainJs = require('./main.js');

var _configJs = require('./config.js');

var _configJs2 = _interopRequireDefault(_configJs);

'use babel';

function domListener(el, type, cb) {
  var _ref = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];

  var useCapture = _ref.useCapture;
  var delegationTarget = _ref.delegationTarget;
  var once = _ref.once;

  if (!(el instanceof EventTarget)) throw new TypeError('Failed to create DOMEventListener: parameter 1 is not of type EventTarget');

  function wrapper(event) {
    for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    if (delegationTarget) {
      target = event.target.closest(delegationTarget);
      if (el.contains(target)) cb.apply(target, [event].concat(args));
    } else {
      cb.apply(el, [event].concat(args));
    }
  }

  function onceWrapper() {
    disposable.dispose();
    wrapper.apply(null, Array.from(arguments));
  }

  var actualWrapper = once ? onceWrapper : wrapper;

  el.addEventListener(type, actualWrapper, useCapture);
  var disposable = new _atom.Disposable(function () {
    return el.removeEventListener(type, actualWrapper, useCapture);
  });

  return disposable;
}

// check if parent contains child, parent can be Node or string

function isChildOf(child, parent) {
  if (parent instanceof HTMLElement) return parent.contains(child);

  while (child.parentNode != document && child.parentNode != null) {
    if (child.parentNode.matches(parent)) return true;
    child = child.parentNode;
  }
  return false;
}

// returns the width of the .list-tree

function getContentWidth() {
  var listTrees = Array.from(_mainJs.treeViewEl.querySelectorAll('.list-tree'));
  var maxListWidth = Math.max.apply(Math, _toConsumableArray(listTrees.map(function (listTree) {
    return listTree.clientWidth;
  })));
  // only apply maxWidth if it's greater than 0
  return Math.min(Math.max(maxListWidth, _configJs2['default'].minWidth), _configJs2['default'].maxWidth || Infinity);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3NlcGlyb3BodC8uYXRvbS9wYWNrYWdlcy9hdXRvaGlkZS10cmVlLXZpZXcvbGliL3V0aWxzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O1FBQ08sWUFBWTs7b0JBQ00sTUFBTTs7c0JBQ04sV0FBVzs7d0JBQ2pCLGFBQWE7Ozs7QUFKaEMsV0FBVyxDQUFDOztBQU1MLFNBQVMsV0FBVyxDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUE2QzttRUFBSixFQUFFOztNQUF4QyxVQUFVLFFBQVYsVUFBVTtNQUFFLGdCQUFnQixRQUFoQixnQkFBZ0I7TUFBRSxJQUFJLFFBQUosSUFBSTs7QUFDM0UsTUFBRyxFQUFFLEVBQUUsWUFBWSxXQUFXLENBQUEsQUFBQyxFQUM3QixNQUFNLElBQUksU0FBUyxDQUFDLDJFQUEyRSxDQUFDLENBQUM7O0FBRW5HLFdBQVMsT0FBTyxDQUFDLEtBQUssRUFBVztzQ0FBTixJQUFJO0FBQUosVUFBSTs7O0FBQzdCLFFBQUcsZ0JBQWdCLEVBQUU7QUFDbkIsWUFBTSxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLENBQUM7QUFDaEQsVUFBRyxFQUFFLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxFQUNwQixFQUFFLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0tBQzFDLE1BQU07QUFDTCxRQUFFLENBQUMsS0FBSyxDQUFDLEVBQUUsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0tBQ3BDO0dBQ0Y7O0FBRUQsV0FBUyxXQUFXLEdBQUc7QUFDckIsY0FBVSxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ3JCLFdBQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztHQUM1Qzs7QUFFRCxNQUFJLGFBQWEsR0FBRyxJQUFJLEdBQUcsV0FBVyxHQUFHLE9BQU8sQ0FBQzs7QUFFakQsSUFBRSxDQUFDLGdCQUFnQixDQUFDLElBQUksRUFBRSxhQUFhLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFDckQsTUFBSSxVQUFVLEdBQUcscUJBQWU7V0FDOUIsRUFBRSxDQUFDLG1CQUFtQixDQUFDLElBQUksRUFBRSxhQUFhLEVBQUUsVUFBVSxDQUFDO0dBQUEsQ0FDeEQsQ0FBQzs7QUFFRixTQUFPLFVBQVUsQ0FBQztDQUNuQjs7OztBQUdNLFNBQVMsU0FBUyxDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUU7QUFDdkMsTUFBRyxNQUFNLFlBQVksV0FBVyxFQUM5QixPQUFPLE1BQU0sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7O0FBRWhDLFNBQU0sS0FBSyxDQUFDLFVBQVUsSUFBSSxRQUFRLElBQUksS0FBSyxDQUFDLFVBQVUsSUFBSSxJQUFJLEVBQUU7QUFDOUQsUUFBRyxLQUFLLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFDakMsT0FBTyxJQUFJLENBQUM7QUFDZCxTQUFLLEdBQUcsS0FBSyxDQUFDLFVBQVUsQ0FBQztHQUMxQjtBQUNELFNBQU8sS0FBSyxDQUFDO0NBQ2Q7Ozs7QUFHTSxTQUFTLGVBQWUsR0FBRztBQUNoQyxNQUFJLFNBQVMsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLG1CQUFXLGdCQUFnQixDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7QUFDdEUsTUFBSSxZQUFZLEdBQUcsSUFBSSxDQUFDLEdBQUcsTUFBQSxDQUFSLElBQUkscUJBQVEsU0FBUyxDQUFDLEdBQUcsQ0FBQyxVQUFBLFFBQVE7V0FBSSxRQUFRLENBQUMsV0FBVztHQUFBLENBQUMsRUFBQyxDQUFDOztBQUVoRixTQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQUUsc0JBQU8sUUFBUSxDQUFDLEVBQUUsc0JBQU8sUUFBUSxJQUFJLFFBQVEsQ0FBQyxDQUFDO0NBQ3ZGIiwiZmlsZSI6Ii9ob21lL3NlcGlyb3BodC8uYXRvbS9wYWNrYWdlcy9hdXRvaGlkZS10cmVlLXZpZXcvbGliL3V0aWxzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5pbXBvcnQgJ2FycmF5LmZyb20nO1xuaW1wb3J0IHtEaXNwb3NhYmxlfSBmcm9tICdhdG9tJztcbmltcG9ydCB7dHJlZVZpZXdFbH0gZnJvbSAnLi9tYWluLmpzJztcbmltcG9ydCBjb25maWcgZnJvbSAnLi9jb25maWcuanMnO1xuXG5leHBvcnQgZnVuY3Rpb24gZG9tTGlzdGVuZXIoZWwsIHR5cGUsIGNiLCB7dXNlQ2FwdHVyZSwgZGVsZWdhdGlvblRhcmdldCwgb25jZX0gPSB7fSkge1xuICBpZighKGVsIGluc3RhbmNlb2YgRXZlbnRUYXJnZXQpKVxuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0ZhaWxlZCB0byBjcmVhdGUgRE9NRXZlbnRMaXN0ZW5lcjogcGFyYW1ldGVyIDEgaXMgbm90IG9mIHR5cGUgRXZlbnRUYXJnZXQnKTtcblxuICBmdW5jdGlvbiB3cmFwcGVyKGV2ZW50LCAuLi5hcmdzKSB7XG4gICAgaWYoZGVsZWdhdGlvblRhcmdldCkge1xuICAgICAgdGFyZ2V0ID0gZXZlbnQudGFyZ2V0LmNsb3Nlc3QoZGVsZWdhdGlvblRhcmdldCk7XG4gICAgICBpZihlbC5jb250YWlucyh0YXJnZXQpKVxuICAgICAgICBjYi5hcHBseSh0YXJnZXQsIFtldmVudF0uY29uY2F0KGFyZ3MpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY2IuYXBwbHkoZWwsIFtldmVudF0uY29uY2F0KGFyZ3MpKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBvbmNlV3JhcHBlcigpIHtcbiAgICBkaXNwb3NhYmxlLmRpc3Bvc2UoKTtcbiAgICB3cmFwcGVyLmFwcGx5KG51bGwsIEFycmF5LmZyb20oYXJndW1lbnRzKSk7XG4gIH1cblxuICB2YXIgYWN0dWFsV3JhcHBlciA9IG9uY2UgPyBvbmNlV3JhcHBlciA6IHdyYXBwZXI7XG5cbiAgZWwuYWRkRXZlbnRMaXN0ZW5lcih0eXBlLCBhY3R1YWxXcmFwcGVyLCB1c2VDYXB0dXJlKTtcbiAgdmFyIGRpc3Bvc2FibGUgPSBuZXcgRGlzcG9zYWJsZSgoKSA9PlxuICAgIGVsLnJlbW92ZUV2ZW50TGlzdGVuZXIodHlwZSwgYWN0dWFsV3JhcHBlciwgdXNlQ2FwdHVyZSlcbiAgKTtcblxuICByZXR1cm4gZGlzcG9zYWJsZTtcbn1cblxuLy8gY2hlY2sgaWYgcGFyZW50IGNvbnRhaW5zIGNoaWxkLCBwYXJlbnQgY2FuIGJlIE5vZGUgb3Igc3RyaW5nXG5leHBvcnQgZnVuY3Rpb24gaXNDaGlsZE9mKGNoaWxkLCBwYXJlbnQpIHtcbiAgaWYocGFyZW50IGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpXG4gICAgcmV0dXJuIHBhcmVudC5jb250YWlucyhjaGlsZCk7XG5cbiAgd2hpbGUoY2hpbGQucGFyZW50Tm9kZSAhPSBkb2N1bWVudCAmJiBjaGlsZC5wYXJlbnROb2RlICE9IG51bGwpIHtcbiAgICBpZihjaGlsZC5wYXJlbnROb2RlLm1hdGNoZXMocGFyZW50KSlcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIGNoaWxkID0gY2hpbGQucGFyZW50Tm9kZTtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cbi8vIHJldHVybnMgdGhlIHdpZHRoIG9mIHRoZSAubGlzdC10cmVlXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q29udGVudFdpZHRoKCkge1xuICB2YXIgbGlzdFRyZWVzID0gQXJyYXkuZnJvbSh0cmVlVmlld0VsLnF1ZXJ5U2VsZWN0b3JBbGwoJy5saXN0LXRyZWUnKSk7XG4gIHZhciBtYXhMaXN0V2lkdGggPSBNYXRoLm1heCguLi5saXN0VHJlZXMubWFwKGxpc3RUcmVlID0+IGxpc3RUcmVlLmNsaWVudFdpZHRoKSk7XG4gIC8vIG9ubHkgYXBwbHkgbWF4V2lkdGggaWYgaXQncyBncmVhdGVyIHRoYW4gMFxuICByZXR1cm4gTWF0aC5taW4oTWF0aC5tYXgobWF4TGlzdFdpZHRoLCBjb25maWcubWluV2lkdGgpLCBjb25maWcubWF4V2lkdGggfHwgSW5maW5pdHkpO1xufVxuIl19