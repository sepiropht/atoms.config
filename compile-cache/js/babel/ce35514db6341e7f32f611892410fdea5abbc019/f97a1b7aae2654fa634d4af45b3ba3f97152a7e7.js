Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.enableClickEvents = enableClickEvents;
exports.disableClickEvents = disableClickEvents;
exports.isClickEventsEnabled = isClickEventsEnabled;

var _atom = require('atom');

var _mainJs = require('./main.js');

var _autohideTreeViewJs = require('./autohide-tree-view.js');

var _utilsJs = require('./utils.js');

'use babel';

var disposables;

function enableClickEvents() {
  if (disposables) return;
  disposables = new _atom.CompositeDisposable(
  // clicks on the tree view toggle the tree view
  (0, _utilsJs.domListener)(_mainJs.treeViewEl, 'click', function (event) {
    if (nextClickInvalidated || event.button != 0) return;
    event.stopPropagation();
    (0, _autohideTreeViewJs.toggleTreeView)();
    uninvalidateNextClick();
  }),

  // ignore the next click on the tree view if
  // the event target is a child of tree view
  // but not .tree-view-scroller, on which it
  // should just toggle the tree view
  (0, _utilsJs.domListener)(_mainJs.treeViewEl, 'click', function (event) {
    if (!(0, _autohideTreeViewJs.isTreeViewVisible)() || event.button != 0) return;
    invalidateNextClick();
  }, { delegationTarget: ':not(.tree-view-scroller)' }),

  // hide and unfocus the tree view when the
  // user clicks anything other than the tree
  // view
  // addDelegatedEventListener(document.body, 'click', ':not(.tree-view-resizer), :not(.tree-view-resizer) *', event => {
  (0, _utilsJs.domListener)(document.body, 'click', function (event) {
    if (event.button != 0 || (0, _utilsJs.isChildOf)(event.target, _mainJs.treeViewEl.parentNode)) return;
    (0, _autohideTreeViewJs.clearFocusedElement)();
    (0, _autohideTreeViewJs.hideTreeView)();
    uninvalidateNextClick();
  }));
}

function disableClickEvents() {
  if (!disposables) return;
  disposables.dispose();
  disposables = null;
}

function isClickEventsEnabled() {
  return !!disposables;
}

// keep track if the next click event
// should trigger a toggleTreeView
var nextClickInvalidated = false;

function invalidateNextClick() {
  nextClickInvalidated = true;
}

function uninvalidateNextClick() {
  nextClickInvalidated = false;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3NlcGlyb3BodC8uYXRvbS9wYWNrYWdlcy9hdXRvaGlkZS10cmVlLXZpZXcvbGliL2NsaWNrLWV2ZW50cy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7O29CQUNrQyxNQUFNOztzQkFDZixXQUFXOztrQ0FFUix5QkFBeUI7O3VCQUNoQixZQUFZOztBQUxqRCxXQUFXLENBQUM7O0FBT1osSUFBSSxXQUFXLENBQUM7O0FBRVQsU0FBUyxpQkFBaUIsR0FBRztBQUNsQyxNQUFHLFdBQVcsRUFBRSxPQUFPO0FBQ3ZCLGFBQVcsR0FBRzs7QUFFWixnREFBd0IsT0FBTyxFQUFFLFVBQUEsS0FBSyxFQUFJO0FBQ3hDLFFBQUcsb0JBQW9CLElBQUksS0FBSyxDQUFDLE1BQU0sSUFBSSxDQUFDLEVBQUUsT0FBTztBQUNyRCxTQUFLLENBQUMsZUFBZSxFQUFFLENBQUM7QUFDeEIsNkNBQWdCLENBQUM7QUFDakIseUJBQXFCLEVBQUUsQ0FBQztHQUN6QixDQUFDOzs7Ozs7QUFNRixnREFBd0IsT0FBTyxFQUFFLFVBQUEsS0FBSyxFQUFJO0FBQ3hDLFFBQUcsQ0FBQyw0Q0FBbUIsSUFBSSxLQUFLLENBQUMsTUFBTSxJQUFJLENBQUMsRUFBRSxPQUFPO0FBQ3JELHVCQUFtQixFQUFFLENBQUM7R0FDdkIsRUFBRSxFQUFDLGdCQUFnQixFQUFFLDJCQUEyQixFQUFDLENBQUM7Ozs7OztBQU1uRCw0QkFBWSxRQUFRLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxVQUFBLEtBQUssRUFBSTtBQUMzQyxRQUFHLEtBQUssQ0FBQyxNQUFNLElBQUksQ0FBQyxJQUFJLHdCQUFVLEtBQUssQ0FBQyxNQUFNLEVBQUUsbUJBQVcsVUFBVSxDQUFDLEVBQUUsT0FBTztBQUMvRSxrREFBcUIsQ0FBQztBQUN0QiwyQ0FBYyxDQUFDO0FBQ2YseUJBQXFCLEVBQUUsQ0FBQztHQUN6QixDQUFDLENBQ0gsQ0FBQztDQUNIOztBQUVNLFNBQVMsa0JBQWtCLEdBQUc7QUFDbkMsTUFBRyxDQUFDLFdBQVcsRUFBRSxPQUFPO0FBQ3hCLGFBQVcsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUN0QixhQUFXLEdBQUcsSUFBSSxDQUFDO0NBQ3BCOztBQUVNLFNBQVMsb0JBQW9CLEdBQUc7QUFDckMsU0FBTyxDQUFDLENBQUMsV0FBVyxDQUFDO0NBQ3RCOzs7O0FBSUQsSUFBSSxvQkFBb0IsR0FBRyxLQUFLLENBQUM7O0FBRWpDLFNBQVMsbUJBQW1CLEdBQUc7QUFDN0Isc0JBQW9CLEdBQUcsSUFBSSxDQUFDO0NBQzdCOztBQUVELFNBQVMscUJBQXFCLEdBQUc7QUFDL0Isc0JBQW9CLEdBQUcsS0FBSyxDQUFDO0NBQzlCIiwiZmlsZSI6Ii9ob21lL3NlcGlyb3BodC8uYXRvbS9wYWNrYWdlcy9hdXRvaGlkZS10cmVlLXZpZXcvbGliL2NsaWNrLWV2ZW50cy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlfSBmcm9tICdhdG9tJztcbmltcG9ydCB7dHJlZVZpZXdFbH0gZnJvbSAnLi9tYWluLmpzJztcbmltcG9ydCB7aGlkZVRyZWVWaWV3LCB0b2dnbGVUcmVlVmlldywgaXNUcmVlVmlld1Zpc2libGUsXG4gIGNsZWFyRm9jdXNlZEVsZW1lbnR9IGZyb20gJy4vYXV0b2hpZGUtdHJlZS12aWV3LmpzJztcbmltcG9ydCB7aXNDaGlsZE9mLCBkb21MaXN0ZW5lcn0gZnJvbSAnLi91dGlscy5qcyc7XG5cbnZhciBkaXNwb3NhYmxlcztcblxuZXhwb3J0IGZ1bmN0aW9uIGVuYWJsZUNsaWNrRXZlbnRzKCkge1xuICBpZihkaXNwb3NhYmxlcykgcmV0dXJuO1xuICBkaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKFxuICAgIC8vIGNsaWNrcyBvbiB0aGUgdHJlZSB2aWV3IHRvZ2dsZSB0aGUgdHJlZSB2aWV3XG4gICAgZG9tTGlzdGVuZXIodHJlZVZpZXdFbCwgJ2NsaWNrJywgZXZlbnQgPT4ge1xuICAgICAgaWYobmV4dENsaWNrSW52YWxpZGF0ZWQgfHwgZXZlbnQuYnV0dG9uICE9IDApIHJldHVybjtcbiAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgdG9nZ2xlVHJlZVZpZXcoKTtcbiAgICAgIHVuaW52YWxpZGF0ZU5leHRDbGljaygpO1xuICAgIH0pLFxuXG4gICAgLy8gaWdub3JlIHRoZSBuZXh0IGNsaWNrIG9uIHRoZSB0cmVlIHZpZXcgaWZcbiAgICAvLyB0aGUgZXZlbnQgdGFyZ2V0IGlzIGEgY2hpbGQgb2YgdHJlZSB2aWV3XG4gICAgLy8gYnV0IG5vdCAudHJlZS12aWV3LXNjcm9sbGVyLCBvbiB3aGljaCBpdFxuICAgIC8vIHNob3VsZCBqdXN0IHRvZ2dsZSB0aGUgdHJlZSB2aWV3XG4gICAgZG9tTGlzdGVuZXIodHJlZVZpZXdFbCwgJ2NsaWNrJywgZXZlbnQgPT4ge1xuICAgICAgaWYoIWlzVHJlZVZpZXdWaXNpYmxlKCkgfHwgZXZlbnQuYnV0dG9uICE9IDApIHJldHVybjtcbiAgICAgIGludmFsaWRhdGVOZXh0Q2xpY2soKTtcbiAgICB9LCB7ZGVsZWdhdGlvblRhcmdldDogJzpub3QoLnRyZWUtdmlldy1zY3JvbGxlciknfSksXG5cbiAgICAvLyBoaWRlIGFuZCB1bmZvY3VzIHRoZSB0cmVlIHZpZXcgd2hlbiB0aGVcbiAgICAvLyB1c2VyIGNsaWNrcyBhbnl0aGluZyBvdGhlciB0aGFuIHRoZSB0cmVlXG4gICAgLy8gdmlld1xuICAgIC8vIGFkZERlbGVnYXRlZEV2ZW50TGlzdGVuZXIoZG9jdW1lbnQuYm9keSwgJ2NsaWNrJywgJzpub3QoLnRyZWUtdmlldy1yZXNpemVyKSwgOm5vdCgudHJlZS12aWV3LXJlc2l6ZXIpIConLCBldmVudCA9PiB7XG4gICAgZG9tTGlzdGVuZXIoZG9jdW1lbnQuYm9keSwgJ2NsaWNrJywgZXZlbnQgPT4ge1xuICAgICAgaWYoZXZlbnQuYnV0dG9uICE9IDAgfHwgaXNDaGlsZE9mKGV2ZW50LnRhcmdldCwgdHJlZVZpZXdFbC5wYXJlbnROb2RlKSkgcmV0dXJuO1xuICAgICAgY2xlYXJGb2N1c2VkRWxlbWVudCgpO1xuICAgICAgaGlkZVRyZWVWaWV3KCk7XG4gICAgICB1bmludmFsaWRhdGVOZXh0Q2xpY2soKTtcbiAgICB9KSxcbiAgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRpc2FibGVDbGlja0V2ZW50cygpIHtcbiAgaWYoIWRpc3Bvc2FibGVzKSByZXR1cm47XG4gIGRpc3Bvc2FibGVzLmRpc3Bvc2UoKTtcbiAgZGlzcG9zYWJsZXMgPSBudWxsO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNDbGlja0V2ZW50c0VuYWJsZWQoKSB7XG4gIHJldHVybiAhIWRpc3Bvc2FibGVzO1xufVxuXG4vLyBrZWVwIHRyYWNrIGlmIHRoZSBuZXh0IGNsaWNrIGV2ZW50XG4vLyBzaG91bGQgdHJpZ2dlciBhIHRvZ2dsZVRyZWVWaWV3XG52YXIgbmV4dENsaWNrSW52YWxpZGF0ZWQgPSBmYWxzZTtcblxuZnVuY3Rpb24gaW52YWxpZGF0ZU5leHRDbGljaygpIHtcbiAgbmV4dENsaWNrSW52YWxpZGF0ZWQgPSB0cnVlO1xufVxuXG5mdW5jdGlvbiB1bmludmFsaWRhdGVOZXh0Q2xpY2soKSB7XG4gIG5leHRDbGlja0ludmFsaWRhdGVkID0gZmFsc2U7XG59XG4iXX0=