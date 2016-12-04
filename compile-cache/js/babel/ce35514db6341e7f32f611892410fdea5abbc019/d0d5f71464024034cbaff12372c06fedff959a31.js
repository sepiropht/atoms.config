Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = initCommands;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _atom = require('atom');

var _mainJs = require('./main.js');

var _autohideTreeViewJs = require('./autohide-tree-view.js');

'use babel';

function initCommands() {
  var _atom$commands$add;

  var disposables = new _atom.CompositeDisposable(
  // resize the tree view when project.paths changes
  atom.project.onDidChangePaths(function () {
    return (0, _autohideTreeViewJs.resizeTreeView)();
  }),

  // add command listeners
  atom.commands.add('atom-workspace', (_atom$commands$add = {}, _defineProperty(_atom$commands$add, 'tree-view:show', function treeViewShow(event) {
    event.stopImmediatePropagation();
    (0, _autohideTreeViewJs.showTreeView)();
  }), _defineProperty(_atom$commands$add, 'tree-view:hide', function treeViewHide(event) {
    event.stopImmediatePropagation();
    (0, _autohideTreeViewJs.hideTreeView)();
  }), _defineProperty(_atom$commands$add, 'tree-view:toggle', function treeViewToggle(event) {
    event.stopImmediatePropagation();
    (0, _autohideTreeViewJs.toggleTreeView)();
  }), _defineProperty(_atom$commands$add, 'tree-view:reveal-active-file', function treeViewRevealActiveFile() {
    (0, _autohideTreeViewJs.showTreeView)(0).then(function () {
      return _mainJs.treeView.scrollToEntry(_mainJs.treeView.getSelectedEntries()[0]);
    });
  }), _defineProperty(_atom$commands$add, 'tree-view:toggle-focus', function treeViewToggleFocus() {
    (0, _autohideTreeViewJs.toggleTreeView)();
  }), _defineProperty(_atom$commands$add, 'tree-view:remove', function treeViewRemove() {
    (0, _autohideTreeViewJs.resizeTreeView)();
  }), _defineProperty(_atom$commands$add, 'tree-view:paste', function treeViewPaste() {
    (0, _autohideTreeViewJs.resizeTreeView)();
  }), _atom$commands$add)),

  // hide the tree view when `esc` key is pressed
  atom.commands.add(_mainJs.treeViewEl, 'tool-panel:unfocus', function () {
    return (0, _autohideTreeViewJs.hideTreeView)();
  }));

  for (var action of ['expand', 'collapse']) {
    var _atom$commands$add2;

    disposables.add(atom.commands.add('atom-workspace', (_atom$commands$add2 = {}, _defineProperty(_atom$commands$add2, 'tree-view:' + action + '-directory', _autohideTreeViewJs.resizeTreeView), _defineProperty(_atom$commands$add2, 'tree-view:recursive-' + action + '-directory', _autohideTreeViewJs.resizeTreeView), _atom$commands$add2)));
  }

  // hide the tree view when a file is opened by a command
  for (var direction of ['', '-right', '-left', '-up', '-down']) {
    disposables.add(atom.commands.add('atom-workspace', 'tree-view:open-selected-entry' + direction, didOpenFile));
  }

  for (var i of [1, 2, 3, 4, 5, 6, 7, 8, 9]) {
    disposables.add(atom.commands.add('atom-workspace', 'tree-view:open-selected-entry-in-pane-' + i, didOpenFile));
  }

  return disposables;
}

function didOpenFile() {
  process.nextTick(function () {
    (0, _autohideTreeViewJs.storeFocusedElement)(atom.views.getView(atom.workspace.getActiveTextEditor()));
    (0, _autohideTreeViewJs.hideTreeView)();
  });
}
module.exports = exports['default'];

// tree-view commands

// this one isn't actually in the tree-view package
// but have it here for the sake of symmetry :)

// patch reveal-active-file because it doesn't work
// when the tree view isn't visible
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3NlcGlyb3BodC8uYXRvbS9wYWNrYWdlcy9hdXRvaGlkZS10cmVlLXZpZXcvbGliL2NvbW1hbmRzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztxQkFNd0IsWUFBWTs7OztvQkFMRixNQUFNOztzQkFDTCxXQUFXOztrQ0FFRix5QkFBeUI7O0FBSnJFLFdBQVcsQ0FBQzs7QUFNRyxTQUFTLFlBQVksR0FBRzs7O0FBQ3JDLE1BQUksV0FBVyxHQUFHOztBQUVoQixNQUFJLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDO1dBQzVCLHlDQUFnQjtHQUFBLENBQ2pCOzs7QUFHRCxNQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsZ0VBRS9CLGdCQUFnQixFQUFDLHNCQUFDLEtBQUssRUFBRTtBQUN4QixTQUFLLENBQUMsd0JBQXdCLEVBQUUsQ0FBQztBQUNqQywyQ0FBYyxDQUFDO0dBQ2hCLHVDQUdBLGdCQUFnQixFQUFDLHNCQUFDLEtBQUssRUFBRTtBQUN4QixTQUFLLENBQUMsd0JBQXdCLEVBQUUsQ0FBQztBQUNqQywyQ0FBYyxDQUFDO0dBQ2hCLHVDQUNBLGtCQUFrQixFQUFDLHdCQUFDLEtBQUssRUFBRTtBQUMxQixTQUFLLENBQUMsd0JBQXdCLEVBQUUsQ0FBQztBQUNqQyw2Q0FBZ0IsQ0FBQztHQUNsQix1Q0FHQSw4QkFBOEIsRUFBQyxvQ0FBRztBQUNqQywwQ0FBYSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7YUFDbkIsaUJBQVMsYUFBYSxDQUFDLGlCQUFTLGtCQUFrQixFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FBQSxDQUN6RCxDQUFDO0dBQ0gsdUNBQ0Esd0JBQXdCLEVBQUMsK0JBQUc7QUFDM0IsNkNBQWdCLENBQUM7R0FDbEIsdUNBQ0Esa0JBQWtCLEVBQUMsMEJBQUc7QUFDckIsNkNBQWdCLENBQUM7R0FDbEIsdUNBQ0EsaUJBQWlCLEVBQUMseUJBQUc7QUFDcEIsNkNBQWdCLENBQUM7R0FDbEIsdUJBQ0Q7OztBQUdGLE1BQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxxQkFBYSxvQkFBb0IsRUFBRTtXQUNsRCx1Q0FBYztHQUFBLENBQ2YsQ0FDRixDQUFDOztBQUVGLE9BQUksSUFBSSxNQUFNLElBQUksQ0FBQyxRQUFRLEVBQUUsVUFBVSxDQUFDLEVBQUU7OztBQUN4QyxlQUFXLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLGdCQUFnQixpRkFDbEMsTUFBTSxvSEFDSSxNQUFNLDJFQUM5QixDQUFDLENBQUM7R0FDTDs7O0FBR0QsT0FBSSxJQUFJLFNBQVMsSUFBSSxDQUFDLEVBQUUsRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxPQUFPLENBQUMsRUFBRTtBQUM1RCxlQUFXLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLGdCQUFnQixvQ0FBa0MsU0FBUyxFQUFJLFdBQVcsQ0FBQyxDQUFDLENBQUM7R0FDaEg7O0FBRUQsT0FBSSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUU7QUFDeEMsZUFBVyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsNkNBQTJDLENBQUMsRUFBSSxXQUFXLENBQUMsQ0FBQyxDQUFDO0dBQ2pIOztBQUVELFNBQU8sV0FBVyxDQUFDO0NBQ3BCOztBQUVELFNBQVMsV0FBVyxHQUFHO0FBQ3JCLFNBQU8sQ0FBQyxRQUFRLENBQUMsWUFBTTtBQUNyQixpREFBb0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUM5RSwyQ0FBYyxDQUFDO0dBQ2hCLENBQUMsQ0FBQztDQUNKIiwiZmlsZSI6Ii9ob21lL3NlcGlyb3BodC8uYXRvbS9wYWNrYWdlcy9hdXRvaGlkZS10cmVlLXZpZXcvbGliL2NvbW1hbmRzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGV9IGZyb20gJ2F0b20nO1xuaW1wb3J0IHt0cmVlVmlldywgdHJlZVZpZXdFbH0gZnJvbSAnLi9tYWluLmpzJztcbmltcG9ydCB7c2hvd1RyZWVWaWV3LCBoaWRlVHJlZVZpZXcsIHRvZ2dsZVRyZWVWaWV3LFxuICBzdG9yZUZvY3VzZWRFbGVtZW50LCByZXNpemVUcmVlVmlld30gZnJvbSAnLi9hdXRvaGlkZS10cmVlLXZpZXcuanMnO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBpbml0Q29tbWFuZHMoKSB7XG4gIHZhciBkaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKFxuICAgIC8vIHJlc2l6ZSB0aGUgdHJlZSB2aWV3IHdoZW4gcHJvamVjdC5wYXRocyBjaGFuZ2VzXG4gICAgYXRvbS5wcm9qZWN0Lm9uRGlkQ2hhbmdlUGF0aHMoKCkgPT5cbiAgICAgIHJlc2l6ZVRyZWVWaWV3KClcbiAgICApLFxuXG4gICAgLy8gYWRkIGNvbW1hbmQgbGlzdGVuZXJzXG4gICAgYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20td29ya3NwYWNlJywge1xuICAgICAgLy8gdHJlZS12aWV3IGNvbW1hbmRzXG4gICAgICBbJ3RyZWUtdmlldzpzaG93J10oZXZlbnQpIHtcbiAgICAgICAgZXZlbnQuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XG4gICAgICAgIHNob3dUcmVlVmlldygpO1xuICAgICAgfSxcbiAgICAgIC8vIHRoaXMgb25lIGlzbid0IGFjdHVhbGx5IGluIHRoZSB0cmVlLXZpZXcgcGFja2FnZVxuICAgICAgLy8gYnV0IGhhdmUgaXQgaGVyZSBmb3IgdGhlIHNha2Ugb2Ygc3ltbWV0cnkgOilcbiAgICAgIFsndHJlZS12aWV3OmhpZGUnXShldmVudCkge1xuICAgICAgICBldmVudC5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcbiAgICAgICAgaGlkZVRyZWVWaWV3KCk7XG4gICAgICB9LFxuICAgICAgWyd0cmVlLXZpZXc6dG9nZ2xlJ10oZXZlbnQpIHtcbiAgICAgICAgZXZlbnQuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XG4gICAgICAgIHRvZ2dsZVRyZWVWaWV3KCk7XG4gICAgICB9LFxuICAgICAgLy8gcGF0Y2ggcmV2ZWFsLWFjdGl2ZS1maWxlIGJlY2F1c2UgaXQgZG9lc24ndCB3b3JrXG4gICAgICAvLyB3aGVuIHRoZSB0cmVlIHZpZXcgaXNuJ3QgdmlzaWJsZVxuICAgICAgWyd0cmVlLXZpZXc6cmV2ZWFsLWFjdGl2ZS1maWxlJ10oKSB7XG4gICAgICAgIHNob3dUcmVlVmlldygwKS50aGVuKCgpID0+XG4gICAgICAgICAgdHJlZVZpZXcuc2Nyb2xsVG9FbnRyeSh0cmVlVmlldy5nZXRTZWxlY3RlZEVudHJpZXMoKVswXSlcbiAgICAgICAgKTtcbiAgICAgIH0sXG4gICAgICBbJ3RyZWUtdmlldzp0b2dnbGUtZm9jdXMnXSgpIHtcbiAgICAgICAgdG9nZ2xlVHJlZVZpZXcoKTtcbiAgICAgIH0sXG4gICAgICBbJ3RyZWUtdmlldzpyZW1vdmUnXSgpIHtcbiAgICAgICAgcmVzaXplVHJlZVZpZXcoKTtcbiAgICAgIH0sXG4gICAgICBbJ3RyZWUtdmlldzpwYXN0ZSddKCkge1xuICAgICAgICByZXNpemVUcmVlVmlldygpO1xuICAgICAgfSxcbiAgICB9KSxcblxuICAgIC8vIGhpZGUgdGhlIHRyZWUgdmlldyB3aGVuIGBlc2NgIGtleSBpcyBwcmVzc2VkXG4gICAgYXRvbS5jb21tYW5kcy5hZGQodHJlZVZpZXdFbCwgJ3Rvb2wtcGFuZWw6dW5mb2N1cycsICgpID0+XG4gICAgICBoaWRlVHJlZVZpZXcoKVxuICAgICksXG4gICk7XG5cbiAgZm9yKGxldCBhY3Rpb24gb2YgWydleHBhbmQnLCAnY29sbGFwc2UnXSkge1xuICAgIGRpc3Bvc2FibGVzLmFkZChhdG9tLmNvbW1hbmRzLmFkZCgnYXRvbS13b3Jrc3BhY2UnLCB7XG4gICAgICBbYHRyZWUtdmlldzoke2FjdGlvbn0tZGlyZWN0b3J5YF06IHJlc2l6ZVRyZWVWaWV3LFxuICAgICAgW2B0cmVlLXZpZXc6cmVjdXJzaXZlLSR7YWN0aW9ufS1kaXJlY3RvcnlgXTogcmVzaXplVHJlZVZpZXcsXG4gICAgfSkpO1xuICB9XG5cbiAgLy8gaGlkZSB0aGUgdHJlZSB2aWV3IHdoZW4gYSBmaWxlIGlzIG9wZW5lZCBieSBhIGNvbW1hbmRcbiAgZm9yKGxldCBkaXJlY3Rpb24gb2YgWycnLCAnLXJpZ2h0JywgJy1sZWZ0JywgJy11cCcsICctZG93biddKSB7XG4gICAgZGlzcG9zYWJsZXMuYWRkKGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXdvcmtzcGFjZScsIGB0cmVlLXZpZXc6b3Blbi1zZWxlY3RlZC1lbnRyeSR7ZGlyZWN0aW9ufWAsIGRpZE9wZW5GaWxlKSk7XG4gIH1cblxuICBmb3IobGV0IGkgb2YgWzEsIDIsIDMsIDQsIDUsIDYsIDcsIDgsIDldKSB7XG4gICAgZGlzcG9zYWJsZXMuYWRkKGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXdvcmtzcGFjZScsIGB0cmVlLXZpZXc6b3Blbi1zZWxlY3RlZC1lbnRyeS1pbi1wYW5lLSR7aX1gLCBkaWRPcGVuRmlsZSkpO1xuICB9XG5cbiAgcmV0dXJuIGRpc3Bvc2FibGVzO1xufVxuXG5mdW5jdGlvbiBkaWRPcGVuRmlsZSgpIHtcbiAgcHJvY2Vzcy5uZXh0VGljaygoKSA9PiB7XG4gICAgc3RvcmVGb2N1c2VkRWxlbWVudChhdG9tLnZpZXdzLmdldFZpZXcoYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpKSk7XG4gICAgaGlkZVRyZWVWaWV3KCk7XG4gIH0pO1xufVxuIl19