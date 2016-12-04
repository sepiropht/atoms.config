Object.defineProperty(exports, '__esModule', {
  value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

exports.activate = activate;
exports.deactivate = deactivate;

function _interopExportWildcard(obj, defaults) { var newObj = defaults({}, obj); delete newObj['default']; return newObj; }

function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _justDebounce = require('just-debounce');

var _justDebounce2 = _interopRequireDefault(_justDebounce);

var _atom = require('atom');

var _autohideTreeViewJs = require('./autohide-tree-view.js');

var _pinViewJs = require('./pin-view.js');

var _pinViewJs2 = _interopRequireDefault(_pinViewJs);

var _configJs = require('./config.js');

var _configJs2 = _interopRequireDefault(_configJs);

var _utilsJs = require('./utils.js');

'use babel';
Object.defineProperty(exports, 'config', {
  enumerable: true,
  get: function get() {
    return _configJs.schema;
  }
});

var _serviceProviderJs = require('./service-provider.js');

_defaults(exports, _interopExportWildcard(_serviceProviderJs, _defaults));

var _touchEventsJs = require('./touch-events.js');

Object.defineProperty(exports, 'consumeTouchEvents', {
  enumerable: true,
  get: function get() {
    return _touchEventsJs.consumeTouchEvents;
  }
});
var treeView;
exports.treeView = treeView;
var treeViewEl;

exports.treeViewEl = treeViewEl;
var disposables;

function activate() {
  if (!atom.packages.isPackageLoaded('tree-view')) return atom.notifications.addError('autohide-tree-view: Could not activate because the tree-view package doesn\'t seem to be loaded');

  atom.packages.activatePackage('tree-view').then(function (pkg) {
    exports.treeView = treeView = pkg.mainModule.createView();
    exports.treeViewEl = treeViewEl = atom.views.getView(treeView);

    disposables = new _atom.CompositeDisposable(atom.workspace.onDidDestroyPaneItem(updateActivationState), atom.workspace.observePaneItems(updateActivationState), atom.config.observe('autohide-tree-view.maxWindowWidth', updateActivationState), (0, _utilsJs.domListener)(window, 'resize', (0, _justDebounce2['default'])(updateActivationState, 200)));
  });
}

function deactivate() {
  stop();
  disposables.dispose();
  var _ref = null;

  var _ref2 = _slicedToArray(_ref, 3);

  disposables = _ref2[0];
  exports.treeView = treeView = _ref2[1];
  exports.treeViewEl = treeViewEl = _ref2[2];
}

// determine if autohide should be enabled based on the window
// width, number of files open and whether the tree view is pinned
function updateActivationState() {
  if (_pinViewJs2['default'].isActive()) return;
  var isWindowSmall = window.innerWidth < (_configJs2['default'].maxWindowWidth || Infinity);
  var hasOpenFiles = atom.workspace.getPaneItems().length > 0;
  isWindowSmall && hasOpenFiles ? start() : stop();
}

var commandsDisposable;

function start() {
  var _atom$commands$add;

  if (commandsDisposable) return;
  _pinViewJs2['default'].attach();
  commandsDisposable = new _atom.CompositeDisposable(atom.commands.add('atom-workspace', (_atom$commands$add = {}, _defineProperty(_atom$commands$add, 'autohide-tree-view:pin', function autohideTreeViewPin() {
    (0, _autohideTreeViewJs.disableAutohide)();
  }), _defineProperty(_atom$commands$add, 'autohide-tree-view:unpin', function autohideTreeViewUnpin() {
    (0, _autohideTreeViewJs.enableAutohide)();
  }), _defineProperty(_atom$commands$add, 'autohide-tree-view:toggle-pinned', function autohideTreeViewTogglePinned() {
    (0, _autohideTreeViewJs.toggleAutohide)();
  }), _defineProperty(_atom$commands$add, 'autohide-tree-view:toggle-push-editor', function autohideTreeViewTogglePushEditor() {
    atom.config.set('autohide-tree-view.pushEditor', !_configJs2['default'].pushEditor);
  }), _atom$commands$add)));
  (0, _autohideTreeViewJs.enableAutohide)();
}

function stop() {
  if (!commandsDisposable) return;
  _pinViewJs2['default'].detach();
  (0, _autohideTreeViewJs.disableAutohide)();
  commandsDisposable.dispose();
  commandsDisposable = null;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3NlcGlyb3BodC8uYXRvbS9wYWNrYWdlcy9hdXRvaGlkZS10cmVlLXZpZXcvbGliL21haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7NEJBQ3FCLGVBQWU7Ozs7b0JBQ0YsTUFBTTs7a0NBQ3NCLHlCQUF5Qjs7eUJBQ25FLGVBQWU7Ozs7d0JBQ2hCLGFBQWE7Ozs7dUJBQ04sWUFBWTs7QUFOdEMsV0FBVyxDQUFDOzs7O3FCQVFKLE1BQU07Ozs7aUNBQ0EsdUJBQXVCOzs7OzZCQUNKLG1CQUFtQjs7Ozs7MEJBQTVDLGtCQUFrQjs7O0FBRW5CLElBQUksUUFBUSxDQUFDOztBQUNiLElBQUksVUFBVSxDQUFDOzs7QUFFdEIsSUFBSSxXQUFXLENBQUM7O0FBRVQsU0FBUyxRQUFRLEdBQUc7QUFDekIsTUFBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLFdBQVcsQ0FBQyxFQUM1QyxPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLGlHQUFpRyxDQUFDLENBQUM7O0FBRXhJLE1BQUksQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLFdBQVcsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFDLEdBQUcsRUFBSztBQUN2RCxZQVZPLFFBQVEsR0FVZixRQUFRLEdBQUcsR0FBRyxDQUFDLFVBQVUsQ0FBQyxVQUFVLEVBQUUsQ0FBQztBQUN2QyxZQVZPLFVBQVUsR0FVakIsVUFBVSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDOztBQUUxQyxlQUFXLEdBQUcsOEJBQ1osSUFBSSxDQUFDLFNBQVMsQ0FBQyxvQkFBb0IsQ0FBQyxxQkFBcUIsQ0FBQyxFQUMxRCxJQUFJLENBQUMsU0FBUyxDQUFDLGdCQUFnQixDQUFDLHFCQUFxQixDQUFDLEVBQ3RELElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLG1DQUFtQyxFQUFFLHFCQUFxQixDQUFDLEVBQy9FLDBCQUFZLE1BQU0sRUFBRSxRQUFRLEVBQUUsK0JBQVMscUJBQXFCLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FDcEUsQ0FBQztHQUNILENBQUMsQ0FBQztDQUNKOztBQUVNLFNBQVMsVUFBVSxHQUFHO0FBQzNCLE1BQUksRUFBRSxDQUFDO0FBQ1AsYUFBVyxDQUFDLE9BQU8sRUFBRSxDQUFDO2FBQ2dCLElBQUk7Ozs7QUFBekMsYUFBVztVQXpCSCxRQUFRLEdBeUJILFFBQVE7VUF4QmIsVUFBVSxHQXdCSyxVQUFVO0NBQ25DOzs7O0FBSUQsU0FBUyxxQkFBcUIsR0FBRztBQUMvQixNQUFHLHVCQUFRLFFBQVEsRUFBRSxFQUFFLE9BQU87QUFDOUIsTUFBSSxhQUFhLEdBQUcsTUFBTSxDQUFDLFVBQVUsSUFBSSxzQkFBTyxjQUFjLElBQUksUUFBUSxDQUFBLEFBQUMsQ0FBQztBQUM1RSxNQUFJLFlBQVksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFlBQVksRUFBRSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7QUFDNUQsZUFBYSxJQUFJLFlBQVksR0FBRyxLQUFLLEVBQUUsR0FBRyxJQUFJLEVBQUUsQ0FBQztDQUNsRDs7QUFFRCxJQUFJLGtCQUFrQixDQUFDOztBQUV2QixTQUFTLEtBQUssR0FBRzs7O0FBQ2YsTUFBRyxrQkFBa0IsRUFBRSxPQUFPO0FBQzlCLHlCQUFRLE1BQU0sRUFBRSxDQUFDO0FBQ2pCLG9CQUFrQixHQUFHLDhCQUNuQixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsZ0VBQy9CLHdCQUF3QixFQUFDLCtCQUFHO0FBQzNCLDhDQUFpQixDQUFDO0dBQ25CLHVDQUNBLDBCQUEwQixFQUFDLGlDQUFHO0FBQzdCLDZDQUFnQixDQUFDO0dBQ2xCLHVDQUNBLGtDQUFrQyxFQUFDLHdDQUFHO0FBQ3JDLDZDQUFnQixDQUFDO0dBQ2xCLHVDQUNBLHVDQUF1QyxFQUFDLDRDQUFHO0FBQzFDLFFBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLCtCQUErQixFQUFFLENBQUMsc0JBQU8sVUFBVSxDQUFDLENBQUM7R0FDdEUsdUJBQ0QsQ0FDSCxDQUFDO0FBQ0YsMkNBQWdCLENBQUM7Q0FDbEI7O0FBRUQsU0FBUyxJQUFJLEdBQUc7QUFDZCxNQUFHLENBQUMsa0JBQWtCLEVBQUUsT0FBTztBQUMvQix5QkFBUSxNQUFNLEVBQUUsQ0FBQztBQUNqQiw0Q0FBaUIsQ0FBQztBQUNsQixvQkFBa0IsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUM3QixvQkFBa0IsR0FBRyxJQUFJLENBQUM7Q0FDM0IiLCJmaWxlIjoiL2hvbWUvc2VwaXJvcGh0Ly5hdG9tL3BhY2thZ2VzL2F1dG9oaWRlLXRyZWUtdmlldy9saWIvbWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuaW1wb3J0IGRlYm91bmNlIGZyb20gJ2p1c3QtZGVib3VuY2UnO1xuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlfSBmcm9tICdhdG9tJztcbmltcG9ydCB7ZW5hYmxlQXV0b2hpZGUsIGRpc2FibGVBdXRvaGlkZSwgdG9nZ2xlQXV0b2hpZGV9IGZyb20gJy4vYXV0b2hpZGUtdHJlZS12aWV3LmpzJztcbmltcG9ydCBwaW5WaWV3IGZyb20gJy4vcGluLXZpZXcuanMnO1xuaW1wb3J0IGNvbmZpZyBmcm9tICcuL2NvbmZpZy5qcyc7XG5pbXBvcnQge2RvbUxpc3RlbmVyfSBmcm9tICcuL3V0aWxzLmpzJztcblxuZXhwb3J0IHtzY2hlbWEgYXMgY29uZmlnfSBmcm9tICcuL2NvbmZpZy5qcyc7XG5leHBvcnQgKiBmcm9tICcuL3NlcnZpY2UtcHJvdmlkZXIuanMnO1xuZXhwb3J0IHtjb25zdW1lVG91Y2hFdmVudHN9IGZyb20gJy4vdG91Y2gtZXZlbnRzLmpzJztcblxuZXhwb3J0IHZhciB0cmVlVmlldztcbmV4cG9ydCB2YXIgdHJlZVZpZXdFbDtcblxudmFyIGRpc3Bvc2FibGVzO1xuXG5leHBvcnQgZnVuY3Rpb24gYWN0aXZhdGUoKSB7XG4gIGlmKCFhdG9tLnBhY2thZ2VzLmlzUGFja2FnZUxvYWRlZCgndHJlZS12aWV3JykpXG4gICAgcmV0dXJuIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcignYXV0b2hpZGUtdHJlZS12aWV3OiBDb3VsZCBub3QgYWN0aXZhdGUgYmVjYXVzZSB0aGUgdHJlZS12aWV3IHBhY2thZ2UgZG9lc25cXCd0IHNlZW0gdG8gYmUgbG9hZGVkJyk7XG5cbiAgYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoJ3RyZWUtdmlldycpLnRoZW4oKHBrZykgPT4ge1xuICAgIHRyZWVWaWV3ID0gcGtnLm1haW5Nb2R1bGUuY3JlYXRlVmlldygpO1xuICAgIHRyZWVWaWV3RWwgPSBhdG9tLnZpZXdzLmdldFZpZXcodHJlZVZpZXcpO1xuXG4gICAgZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZShcbiAgICAgIGF0b20ud29ya3NwYWNlLm9uRGlkRGVzdHJveVBhbmVJdGVtKHVwZGF0ZUFjdGl2YXRpb25TdGF0ZSksXG4gICAgICBhdG9tLndvcmtzcGFjZS5vYnNlcnZlUGFuZUl0ZW1zKHVwZGF0ZUFjdGl2YXRpb25TdGF0ZSksXG4gICAgICBhdG9tLmNvbmZpZy5vYnNlcnZlKCdhdXRvaGlkZS10cmVlLXZpZXcubWF4V2luZG93V2lkdGgnLCB1cGRhdGVBY3RpdmF0aW9uU3RhdGUpLFxuICAgICAgZG9tTGlzdGVuZXIod2luZG93LCAncmVzaXplJywgZGVib3VuY2UodXBkYXRlQWN0aXZhdGlvblN0YXRlLCAyMDApKSxcbiAgICApO1xuICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRlYWN0aXZhdGUoKSB7XG4gIHN0b3AoKTtcbiAgZGlzcG9zYWJsZXMuZGlzcG9zZSgpO1xuICBbZGlzcG9zYWJsZXMsIHRyZWVWaWV3LCB0cmVlVmlld0VsXSA9IG51bGw7XG59XG5cbi8vIGRldGVybWluZSBpZiBhdXRvaGlkZSBzaG91bGQgYmUgZW5hYmxlZCBiYXNlZCBvbiB0aGUgd2luZG93XG4vLyB3aWR0aCwgbnVtYmVyIG9mIGZpbGVzIG9wZW4gYW5kIHdoZXRoZXIgdGhlIHRyZWUgdmlldyBpcyBwaW5uZWRcbmZ1bmN0aW9uIHVwZGF0ZUFjdGl2YXRpb25TdGF0ZSgpIHtcbiAgaWYocGluVmlldy5pc0FjdGl2ZSgpKSByZXR1cm47XG4gIHZhciBpc1dpbmRvd1NtYWxsID0gd2luZG93LmlubmVyV2lkdGggPCAoY29uZmlnLm1heFdpbmRvd1dpZHRoIHx8IEluZmluaXR5KTtcbiAgdmFyIGhhc09wZW5GaWxlcyA9IGF0b20ud29ya3NwYWNlLmdldFBhbmVJdGVtcygpLmxlbmd0aCA+IDA7XG4gIGlzV2luZG93U21hbGwgJiYgaGFzT3BlbkZpbGVzID8gc3RhcnQoKSA6IHN0b3AoKTtcbn1cblxudmFyIGNvbW1hbmRzRGlzcG9zYWJsZTtcblxuZnVuY3Rpb24gc3RhcnQoKSB7XG4gIGlmKGNvbW1hbmRzRGlzcG9zYWJsZSkgcmV0dXJuO1xuICBwaW5WaWV3LmF0dGFjaCgpO1xuICBjb21tYW5kc0Rpc3Bvc2FibGUgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZShcbiAgICBhdG9tLmNvbW1hbmRzLmFkZCgnYXRvbS13b3Jrc3BhY2UnLCB7XG4gICAgICBbJ2F1dG9oaWRlLXRyZWUtdmlldzpwaW4nXSgpIHtcbiAgICAgICAgZGlzYWJsZUF1dG9oaWRlKCk7XG4gICAgICB9LFxuICAgICAgWydhdXRvaGlkZS10cmVlLXZpZXc6dW5waW4nXSgpIHtcbiAgICAgICAgZW5hYmxlQXV0b2hpZGUoKTtcbiAgICAgIH0sXG4gICAgICBbJ2F1dG9oaWRlLXRyZWUtdmlldzp0b2dnbGUtcGlubmVkJ10oKSB7XG4gICAgICAgIHRvZ2dsZUF1dG9oaWRlKCk7XG4gICAgICB9LFxuICAgICAgWydhdXRvaGlkZS10cmVlLXZpZXc6dG9nZ2xlLXB1c2gtZWRpdG9yJ10oKSB7XG4gICAgICAgIGF0b20uY29uZmlnLnNldCgnYXV0b2hpZGUtdHJlZS12aWV3LnB1c2hFZGl0b3InLCAhY29uZmlnLnB1c2hFZGl0b3IpO1xuICAgICAgfSxcbiAgICB9KSxcbiAgKTtcbiAgZW5hYmxlQXV0b2hpZGUoKTtcbn1cblxuZnVuY3Rpb24gc3RvcCgpIHtcbiAgaWYoIWNvbW1hbmRzRGlzcG9zYWJsZSkgcmV0dXJuO1xuICBwaW5WaWV3LmRldGFjaCgpO1xuICBkaXNhYmxlQXV0b2hpZGUoKTtcbiAgY29tbWFuZHNEaXNwb3NhYmxlLmRpc3Bvc2UoKTtcbiAgY29tbWFuZHNEaXNwb3NhYmxlID0gbnVsbDtcbn1cbiJdfQ==