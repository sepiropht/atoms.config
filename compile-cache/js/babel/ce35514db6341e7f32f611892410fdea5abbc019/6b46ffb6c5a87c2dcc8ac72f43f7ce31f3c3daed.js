Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.observeConfig = observeConfig;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _atom = require('atom');

var _autohideTreeViewJs = require('./autohide-tree-view.js');

var _hoverEventsJs = require('./hover-events.js');

var _clickEventsJs = require('./click-events.js');

var _touchEventsJs = require('./touch-events.js');

var _pinViewJs = require('./pin-view.js');

var _pinViewJs2 = _interopRequireDefault(_pinViewJs);

'use babel';
var schema = {
  showOn: {
    description: 'The type of event that triggers the tree view to show or hide. The touch events require atom-touch-events (https://atom.io/packages/atom-touch-events) to be installed. You\'ll need to restart Atom after installing atom-touch-events for touch events to become available.',
    type: 'string',
    'default': 'hover',
    'enum': ['hover', 'click', 'touch', 'hover + click', 'hover + touch', 'click + touch', 'hover + click + touch', 'none'],
    order: 0
  },
  showDelay: {
    description: 'The delay in milliseconds before the tree view will show. Only applies to hover events.',
    type: 'integer',
    'default': 200,
    minimum: 0,
    order: 1
  },
  hideDelay: {
    description: 'The delay in milliseconds before the tree view will hide. Only applies to hover events.',
    type: 'integer',
    'default': 200,
    minimum: 0,
    order: 2
  },
  minWidth: {
    description: 'The width in pixels of the tree view when it is hidden.',
    type: 'integer',
    'default': 5,
    minimum: 0,
    order: 3
  },
  maxWidth: {
    description: 'The max width in pixels of the tree view when it is expanded. Set to 0 to always extend to the max filename width.',
    type: 'integer',
    'default': 0,
    minimum: 0,
    order: 4
  },
  animationSpeed: {
    description: 'The speed in 1000 pixels per second of the animation. Set to 0 to disable the animation.',
    type: 'number',
    'default': 1,
    minimum: 0,
    order: 5
  },
  pushEditor: {
    description: 'Push the edge of the editor around to keep the entire editor contents visible.',
    type: 'boolean',
    'default': false,
    order: 6
  },
  triggerAreaSize: {
    description: 'Size of the area at the edge of the screen where hover/click events will trigger the tree view to show/hide',
    type: 'integer',
    'default': 0,
    minimum: 0,
    order: 7
  },
  touchAreaSize: {
    description: 'Width of an invisible area at the edge of the screen where touch events will be triggered.',
    type: 'integer',
    'default': 50,
    minimum: 0,
    order: 8
  },
  maxWindowWidth: {
    description: 'Autohide will be disabled when the window is wider than this. Set to 0 to always enable autohide.',
    type: 'integer',
    'default': 0,
    minimum: 0,
    order: 9
  },
  showPinButton: {
    description: 'Shows a pin button at the top of the tree view that enables/disables autohide.',
    type: 'boolean',
    'default': true,
    order: 10
  }
};

exports.schema = schema;
var config = Object.create(null);
exports['default'] = config;

var _loop = function (key) {
  Object.defineProperty(config, key, {
    get: function get() {
      // eslint-disable-line no-loop-func
      return atom.config.get('autohide-tree-view.' + key);
    }
  });
};

for (var key of Object.keys(schema)) {
  _loop(key);
}

function observeConfig() {
  return new _atom.CompositeDisposable(
  // changes to these settings should trigger an update
  atom.config.onDidChange('autohide-tree-view.pushEditor', function () {
    return (0, _autohideTreeViewJs.updateTreeView)();
  }), atom.config.onDidChange('autohide-tree-view.minWidth', function () {
    (0, _autohideTreeViewJs.updateTreeView)();
    (0, _autohideTreeViewJs.updateTriggerArea)();
  }), atom.config.onDidChange('tree-view.showOnRightSide', function () {
    return (0, _autohideTreeViewJs.updateTreeView)();
  }), atom.config.onDidChange('tree-view.hideIgnoredNames', function () {
    return (0, _autohideTreeViewJs.updateTreeView)();
  }), atom.config.onDidChange('tree-view.hideVcsIgnoredFiles', function () {
    return (0, _autohideTreeViewJs.updateTreeView)();
  }), atom.config.onDidChange('core.ignoredNames', function () {
    return (0, _autohideTreeViewJs.updateTreeView)();
  }), atom.config.observe('autohide-tree-view.triggerAreaSize', function () {
    return (0, _autohideTreeViewJs.updateTriggerArea)();
  }),

  // enable or disable the event types
  atom.config.observe('autohide-tree-view.showOn', function (showOn) {
    showOn.match('hover') ? (0, _hoverEventsJs.enableHoverEvents)() : (0, _hoverEventsJs.disableHoverEvents)();
    showOn.match('click') ? (0, _clickEventsJs.enableClickEvents)() : (0, _clickEventsJs.disableClickEvents)();
    showOn.match('touch') ? (0, _touchEventsJs.enableTouchEvents)() : (0, _touchEventsJs.disableTouchEvents)();
  }), atom.config.observe('autohide-tree-view.showPinButton', function (showPinButton) {
    return showPinButton ? _pinViewJs2['default'].show() : _pinViewJs2['default'].hide();
  }));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3NlcGlyb3BodC8uYXRvbS9wYWNrYWdlcy9hdXRvaGlkZS10cmVlLXZpZXcvbGliL2NvbmZpZy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7O29CQUNrQyxNQUFNOztrQ0FDUSx5QkFBeUI7OzZCQUNyQixtQkFBbUI7OzZCQUNuQixtQkFBbUI7OzZCQUNuQixtQkFBbUI7O3lCQUNuRCxlQUFlOzs7O0FBTm5DLFdBQVcsQ0FBQztBQVFMLElBQU0sTUFBTSxHQUFHO0FBQ3BCLFFBQU0sRUFBRTtBQUNOLGVBQVcsRUFBRSwrUUFBK1E7QUFDNVIsUUFBSSxFQUFFLFFBQVE7QUFDZCxlQUFTLE9BQU87QUFDaEIsWUFBTSxDQUNKLE9BQU8sRUFDUCxPQUFPLEVBQ1AsT0FBTyxFQUNQLGVBQWUsRUFDZixlQUFlLEVBQ2YsZUFBZSxFQUNmLHVCQUF1QixFQUN2QixNQUFNLENBQ1A7QUFDRCxTQUFLLEVBQUUsQ0FBQztHQUNUO0FBQ0QsV0FBUyxFQUFFO0FBQ1QsZUFBVyxFQUFFLHlGQUF5RjtBQUN0RyxRQUFJLEVBQUUsU0FBUztBQUNmLGVBQVMsR0FBRztBQUNaLFdBQU8sRUFBRSxDQUFDO0FBQ1YsU0FBSyxFQUFFLENBQUM7R0FDVDtBQUNELFdBQVMsRUFBRTtBQUNULGVBQVcsRUFBRSx5RkFBeUY7QUFDdEcsUUFBSSxFQUFFLFNBQVM7QUFDZixlQUFTLEdBQUc7QUFDWixXQUFPLEVBQUUsQ0FBQztBQUNWLFNBQUssRUFBRSxDQUFDO0dBQ1Q7QUFDRCxVQUFRLEVBQUU7QUFDUixlQUFXLEVBQUUseURBQXlEO0FBQ3RFLFFBQUksRUFBRSxTQUFTO0FBQ2YsZUFBUyxDQUFDO0FBQ1YsV0FBTyxFQUFFLENBQUM7QUFDVixTQUFLLEVBQUUsQ0FBQztHQUNUO0FBQ0QsVUFBUSxFQUFFO0FBQ1IsZUFBVyxFQUFFLG9IQUFvSDtBQUNqSSxRQUFJLEVBQUUsU0FBUztBQUNmLGVBQVMsQ0FBQztBQUNWLFdBQU8sRUFBRSxDQUFDO0FBQ1YsU0FBSyxFQUFFLENBQUM7R0FDVDtBQUNELGdCQUFjLEVBQUU7QUFDZCxlQUFXLEVBQUUsMEZBQTBGO0FBQ3ZHLFFBQUksRUFBRSxRQUFRO0FBQ2QsZUFBUyxDQUFDO0FBQ1YsV0FBTyxFQUFFLENBQUM7QUFDVixTQUFLLEVBQUUsQ0FBQztHQUNUO0FBQ0QsWUFBVSxFQUFFO0FBQ1YsZUFBVyxFQUFFLGdGQUFnRjtBQUM3RixRQUFJLEVBQUUsU0FBUztBQUNmLGVBQVMsS0FBSztBQUNkLFNBQUssRUFBRSxDQUFDO0dBQ1Q7QUFDRCxpQkFBZSxFQUFFO0FBQ2YsZUFBVyxFQUFFLDZHQUE2RztBQUMxSCxRQUFJLEVBQUUsU0FBUztBQUNmLGVBQVMsQ0FBQztBQUNWLFdBQU8sRUFBRSxDQUFDO0FBQ1YsU0FBSyxFQUFFLENBQUM7R0FDVDtBQUNELGVBQWEsRUFBRTtBQUNiLGVBQVcsRUFBRSw0RkFBNEY7QUFDekcsUUFBSSxFQUFFLFNBQVM7QUFDZixlQUFTLEVBQUU7QUFDWCxXQUFPLEVBQUUsQ0FBQztBQUNWLFNBQUssRUFBRSxDQUFDO0dBQ1Q7QUFDRCxnQkFBYyxFQUFFO0FBQ2QsZUFBVyxFQUFFLG1HQUFtRztBQUNoSCxRQUFJLEVBQUUsU0FBUztBQUNmLGVBQVMsQ0FBQztBQUNWLFdBQU8sRUFBRSxDQUFDO0FBQ1YsU0FBSyxFQUFFLENBQUM7R0FDVDtBQUNELGVBQWEsRUFBRTtBQUNiLGVBQVcsRUFBRSxnRkFBZ0Y7QUFDN0YsUUFBSSxFQUFFLFNBQVM7QUFDZixlQUFTLElBQUk7QUFDYixTQUFLLEVBQUUsRUFBRTtHQUNWO0NBQ0YsQ0FBQzs7O0FBRUYsSUFBSSxNQUFNLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDbEIsTUFBTTs7c0JBRWIsR0FBRztBQUNULFFBQU0sQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRTtBQUNqQyxPQUFHLEVBQUEsZUFBRzs7QUFDSixhQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyx5QkFBdUIsR0FBRyxDQUFHLENBQUM7S0FDckQ7R0FDRixDQUFDLENBQUM7OztBQUxMLEtBQUksSUFBSSxHQUFHLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRTtRQUE1QixHQUFHO0NBTVY7O0FBRU0sU0FBUyxhQUFhLEdBQUc7QUFDOUIsU0FBTzs7QUFFTCxNQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQywrQkFBK0IsRUFBRTtXQUN2RCx5Q0FBZ0I7R0FBQSxDQUNqQixFQUNELElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLDZCQUE2QixFQUFFLFlBQU07QUFDM0QsNkNBQWdCLENBQUM7QUFDakIsZ0RBQW1CLENBQUM7R0FDckIsQ0FBQyxFQUNGLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLDJCQUEyQixFQUFFO1dBQ25ELHlDQUFnQjtHQUFBLENBQ2pCLEVBQ0QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsNEJBQTRCLEVBQUU7V0FDcEQseUNBQWdCO0dBQUEsQ0FDakIsRUFDRCxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQywrQkFBK0IsRUFBRTtXQUN2RCx5Q0FBZ0I7R0FBQSxDQUNqQixFQUNELElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLG1CQUFtQixFQUFFO1dBQzNDLHlDQUFnQjtHQUFBLENBQ2pCLEVBQ0QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsb0NBQW9DLEVBQUU7V0FDeEQsNENBQW1CO0dBQUEsQ0FDcEI7OztBQUdELE1BQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLDJCQUEyQixFQUFFLFVBQUEsTUFBTSxFQUFJO0FBQ3pELFVBQU0sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsdUNBQW1CLEdBQUcsd0NBQW9CLENBQUM7QUFDbkUsVUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsR0FBRyx1Q0FBbUIsR0FBRyx3Q0FBb0IsQ0FBQztBQUNuRSxVQUFNLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHLHVDQUFtQixHQUFHLHdDQUFvQixDQUFDO0dBQ3BFLENBQUMsRUFFRixJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxrQ0FBa0MsRUFBRSxVQUFBLGFBQWE7V0FDbkUsYUFBYSxHQUFHLHVCQUFRLElBQUksRUFBRSxHQUFHLHVCQUFRLElBQUksRUFBRTtHQUFBLENBQ2hELENBQ0YsQ0FBQztDQUNIIiwiZmlsZSI6Ii9ob21lL3NlcGlyb3BodC8uYXRvbS9wYWNrYWdlcy9hdXRvaGlkZS10cmVlLXZpZXcvbGliL2NvbmZpZy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlfSBmcm9tICdhdG9tJztcbmltcG9ydCB7dXBkYXRlVHJlZVZpZXcsIHVwZGF0ZVRyaWdnZXJBcmVhfSBmcm9tICcuL2F1dG9oaWRlLXRyZWUtdmlldy5qcyc7XG5pbXBvcnQge2VuYWJsZUhvdmVyRXZlbnRzLCBkaXNhYmxlSG92ZXJFdmVudHN9IGZyb20gJy4vaG92ZXItZXZlbnRzLmpzJztcbmltcG9ydCB7ZW5hYmxlQ2xpY2tFdmVudHMsIGRpc2FibGVDbGlja0V2ZW50c30gZnJvbSAnLi9jbGljay1ldmVudHMuanMnO1xuaW1wb3J0IHtlbmFibGVUb3VjaEV2ZW50cywgZGlzYWJsZVRvdWNoRXZlbnRzfSBmcm9tICcuL3RvdWNoLWV2ZW50cy5qcyc7XG5pbXBvcnQgcGluVmlldyBmcm9tICcuL3Bpbi12aWV3LmpzJztcblxuZXhwb3J0IGNvbnN0IHNjaGVtYSA9IHtcbiAgc2hvd09uOiB7XG4gICAgZGVzY3JpcHRpb246ICdUaGUgdHlwZSBvZiBldmVudCB0aGF0IHRyaWdnZXJzIHRoZSB0cmVlIHZpZXcgdG8gc2hvdyBvciBoaWRlLiBUaGUgdG91Y2ggZXZlbnRzIHJlcXVpcmUgYXRvbS10b3VjaC1ldmVudHMgKGh0dHBzOi8vYXRvbS5pby9wYWNrYWdlcy9hdG9tLXRvdWNoLWV2ZW50cykgdG8gYmUgaW5zdGFsbGVkLiBZb3VcXCdsbCBuZWVkIHRvIHJlc3RhcnQgQXRvbSBhZnRlciBpbnN0YWxsaW5nIGF0b20tdG91Y2gtZXZlbnRzIGZvciB0b3VjaCBldmVudHMgdG8gYmVjb21lIGF2YWlsYWJsZS4nLFxuICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgIGRlZmF1bHQ6ICdob3ZlcicsXG4gICAgZW51bTogW1xuICAgICAgJ2hvdmVyJyxcbiAgICAgICdjbGljaycsXG4gICAgICAndG91Y2gnLFxuICAgICAgJ2hvdmVyICsgY2xpY2snLFxuICAgICAgJ2hvdmVyICsgdG91Y2gnLFxuICAgICAgJ2NsaWNrICsgdG91Y2gnLFxuICAgICAgJ2hvdmVyICsgY2xpY2sgKyB0b3VjaCcsXG4gICAgICAnbm9uZScsXG4gICAgXSxcbiAgICBvcmRlcjogMCxcbiAgfSxcbiAgc2hvd0RlbGF5OiB7XG4gICAgZGVzY3JpcHRpb246ICdUaGUgZGVsYXkgaW4gbWlsbGlzZWNvbmRzIGJlZm9yZSB0aGUgdHJlZSB2aWV3IHdpbGwgc2hvdy4gT25seSBhcHBsaWVzIHRvIGhvdmVyIGV2ZW50cy4nLFxuICAgIHR5cGU6ICdpbnRlZ2VyJyxcbiAgICBkZWZhdWx0OiAyMDAsXG4gICAgbWluaW11bTogMCxcbiAgICBvcmRlcjogMSxcbiAgfSxcbiAgaGlkZURlbGF5OiB7XG4gICAgZGVzY3JpcHRpb246ICdUaGUgZGVsYXkgaW4gbWlsbGlzZWNvbmRzIGJlZm9yZSB0aGUgdHJlZSB2aWV3IHdpbGwgaGlkZS4gT25seSBhcHBsaWVzIHRvIGhvdmVyIGV2ZW50cy4nLFxuICAgIHR5cGU6ICdpbnRlZ2VyJyxcbiAgICBkZWZhdWx0OiAyMDAsXG4gICAgbWluaW11bTogMCxcbiAgICBvcmRlcjogMixcbiAgfSxcbiAgbWluV2lkdGg6IHtcbiAgICBkZXNjcmlwdGlvbjogJ1RoZSB3aWR0aCBpbiBwaXhlbHMgb2YgdGhlIHRyZWUgdmlldyB3aGVuIGl0IGlzIGhpZGRlbi4nLFxuICAgIHR5cGU6ICdpbnRlZ2VyJyxcbiAgICBkZWZhdWx0OiA1LFxuICAgIG1pbmltdW06IDAsXG4gICAgb3JkZXI6IDMsXG4gIH0sXG4gIG1heFdpZHRoOiB7XG4gICAgZGVzY3JpcHRpb246ICdUaGUgbWF4IHdpZHRoIGluIHBpeGVscyBvZiB0aGUgdHJlZSB2aWV3IHdoZW4gaXQgaXMgZXhwYW5kZWQuIFNldCB0byAwIHRvIGFsd2F5cyBleHRlbmQgdG8gdGhlIG1heCBmaWxlbmFtZSB3aWR0aC4nLFxuICAgIHR5cGU6ICdpbnRlZ2VyJyxcbiAgICBkZWZhdWx0OiAwLFxuICAgIG1pbmltdW06IDAsXG4gICAgb3JkZXI6IDQsXG4gIH0sXG4gIGFuaW1hdGlvblNwZWVkOiB7XG4gICAgZGVzY3JpcHRpb246ICdUaGUgc3BlZWQgaW4gMTAwMCBwaXhlbHMgcGVyIHNlY29uZCBvZiB0aGUgYW5pbWF0aW9uLiBTZXQgdG8gMCB0byBkaXNhYmxlIHRoZSBhbmltYXRpb24uJyxcbiAgICB0eXBlOiAnbnVtYmVyJyxcbiAgICBkZWZhdWx0OiAxLFxuICAgIG1pbmltdW06IDAsXG4gICAgb3JkZXI6IDUsXG4gIH0sXG4gIHB1c2hFZGl0b3I6IHtcbiAgICBkZXNjcmlwdGlvbjogJ1B1c2ggdGhlIGVkZ2Ugb2YgdGhlIGVkaXRvciBhcm91bmQgdG8ga2VlcCB0aGUgZW50aXJlIGVkaXRvciBjb250ZW50cyB2aXNpYmxlLicsXG4gICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIG9yZGVyOiA2LFxuICB9LFxuICB0cmlnZ2VyQXJlYVNpemU6IHtcbiAgICBkZXNjcmlwdGlvbjogJ1NpemUgb2YgdGhlIGFyZWEgYXQgdGhlIGVkZ2Ugb2YgdGhlIHNjcmVlbiB3aGVyZSBob3Zlci9jbGljayBldmVudHMgd2lsbCB0cmlnZ2VyIHRoZSB0cmVlIHZpZXcgdG8gc2hvdy9oaWRlJyxcbiAgICB0eXBlOiAnaW50ZWdlcicsXG4gICAgZGVmYXVsdDogMCxcbiAgICBtaW5pbXVtOiAwLFxuICAgIG9yZGVyOiA3LFxuICB9LFxuICB0b3VjaEFyZWFTaXplOiB7XG4gICAgZGVzY3JpcHRpb246ICdXaWR0aCBvZiBhbiBpbnZpc2libGUgYXJlYSBhdCB0aGUgZWRnZSBvZiB0aGUgc2NyZWVuIHdoZXJlIHRvdWNoIGV2ZW50cyB3aWxsIGJlIHRyaWdnZXJlZC4nLFxuICAgIHR5cGU6ICdpbnRlZ2VyJyxcbiAgICBkZWZhdWx0OiA1MCxcbiAgICBtaW5pbXVtOiAwLFxuICAgIG9yZGVyOiA4LFxuICB9LFxuICBtYXhXaW5kb3dXaWR0aDoge1xuICAgIGRlc2NyaXB0aW9uOiAnQXV0b2hpZGUgd2lsbCBiZSBkaXNhYmxlZCB3aGVuIHRoZSB3aW5kb3cgaXMgd2lkZXIgdGhhbiB0aGlzLiBTZXQgdG8gMCB0byBhbHdheXMgZW5hYmxlIGF1dG9oaWRlLicsXG4gICAgdHlwZTogJ2ludGVnZXInLFxuICAgIGRlZmF1bHQ6IDAsXG4gICAgbWluaW11bTogMCxcbiAgICBvcmRlcjogOSxcbiAgfSxcbiAgc2hvd1BpbkJ1dHRvbjoge1xuICAgIGRlc2NyaXB0aW9uOiAnU2hvd3MgYSBwaW4gYnV0dG9uIGF0IHRoZSB0b3Agb2YgdGhlIHRyZWUgdmlldyB0aGF0IGVuYWJsZXMvZGlzYWJsZXMgYXV0b2hpZGUuJyxcbiAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgZGVmYXVsdDogdHJ1ZSxcbiAgICBvcmRlcjogMTAsXG4gIH0sXG59O1xuXG52YXIgY29uZmlnID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbmV4cG9ydCBkZWZhdWx0IGNvbmZpZztcblxuZm9yKGxldCBrZXkgb2YgT2JqZWN0LmtleXMoc2NoZW1hKSkge1xuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoY29uZmlnLCBrZXksIHtcbiAgICBnZXQoKSB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tbG9vcC1mdW5jXG4gICAgICByZXR1cm4gYXRvbS5jb25maWcuZ2V0KGBhdXRvaGlkZS10cmVlLXZpZXcuJHtrZXl9YCk7XG4gICAgfSxcbiAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBvYnNlcnZlQ29uZmlnKCkge1xuICByZXR1cm4gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoXG4gICAgLy8gY2hhbmdlcyB0byB0aGVzZSBzZXR0aW5ncyBzaG91bGQgdHJpZ2dlciBhbiB1cGRhdGVcbiAgICBhdG9tLmNvbmZpZy5vbkRpZENoYW5nZSgnYXV0b2hpZGUtdHJlZS12aWV3LnB1c2hFZGl0b3InLCAoKSA9PlxuICAgICAgdXBkYXRlVHJlZVZpZXcoKVxuICAgICksXG4gICAgYXRvbS5jb25maWcub25EaWRDaGFuZ2UoJ2F1dG9oaWRlLXRyZWUtdmlldy5taW5XaWR0aCcsICgpID0+IHtcbiAgICAgIHVwZGF0ZVRyZWVWaWV3KCk7XG4gICAgICB1cGRhdGVUcmlnZ2VyQXJlYSgpO1xuICAgIH0pLFxuICAgIGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlKCd0cmVlLXZpZXcuc2hvd09uUmlnaHRTaWRlJywgKCkgPT5cbiAgICAgIHVwZGF0ZVRyZWVWaWV3KClcbiAgICApLFxuICAgIGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlKCd0cmVlLXZpZXcuaGlkZUlnbm9yZWROYW1lcycsICgpID0+XG4gICAgICB1cGRhdGVUcmVlVmlldygpXG4gICAgKSxcbiAgICBhdG9tLmNvbmZpZy5vbkRpZENoYW5nZSgndHJlZS12aWV3LmhpZGVWY3NJZ25vcmVkRmlsZXMnLCAoKSA9PlxuICAgICAgdXBkYXRlVHJlZVZpZXcoKVxuICAgICksXG4gICAgYXRvbS5jb25maWcub25EaWRDaGFuZ2UoJ2NvcmUuaWdub3JlZE5hbWVzJywgKCkgPT5cbiAgICAgIHVwZGF0ZVRyZWVWaWV3KClcbiAgICApLFxuICAgIGF0b20uY29uZmlnLm9ic2VydmUoJ2F1dG9oaWRlLXRyZWUtdmlldy50cmlnZ2VyQXJlYVNpemUnLCAoKSA9PlxuICAgICAgdXBkYXRlVHJpZ2dlckFyZWEoKVxuICAgICksXG5cbiAgICAvLyBlbmFibGUgb3IgZGlzYWJsZSB0aGUgZXZlbnQgdHlwZXNcbiAgICBhdG9tLmNvbmZpZy5vYnNlcnZlKCdhdXRvaGlkZS10cmVlLXZpZXcuc2hvd09uJywgc2hvd09uID0+IHtcbiAgICAgIHNob3dPbi5tYXRjaCgnaG92ZXInKSA/IGVuYWJsZUhvdmVyRXZlbnRzKCkgOiBkaXNhYmxlSG92ZXJFdmVudHMoKTtcbiAgICAgIHNob3dPbi5tYXRjaCgnY2xpY2snKSA/IGVuYWJsZUNsaWNrRXZlbnRzKCkgOiBkaXNhYmxlQ2xpY2tFdmVudHMoKTtcbiAgICAgIHNob3dPbi5tYXRjaCgndG91Y2gnKSA/IGVuYWJsZVRvdWNoRXZlbnRzKCkgOiBkaXNhYmxlVG91Y2hFdmVudHMoKTtcbiAgICB9KSxcblxuICAgIGF0b20uY29uZmlnLm9ic2VydmUoJ2F1dG9oaWRlLXRyZWUtdmlldy5zaG93UGluQnV0dG9uJywgc2hvd1BpbkJ1dHRvbiA9PlxuICAgICAgc2hvd1BpbkJ1dHRvbiA/IHBpblZpZXcuc2hvdygpIDogcGluVmlldy5oaWRlKClcbiAgICApLFxuICApO1xufVxuIl19