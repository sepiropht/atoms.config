Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _atomSpacePenViews = require('atom-space-pen-views');

var _underscorePlus = require('underscore-plus');

var _underscorePlus2 = _interopRequireDefault(_underscorePlus);

var _projects = require('./projects');

var _projects2 = _interopRequireDefault(_projects);

'use babel';

var ProjectsListView = (function (_SelectListView) {
  _inherits(ProjectsListView, _SelectListView);

  function ProjectsListView() {
    _classCallCheck(this, ProjectsListView);

    _get(Object.getPrototypeOf(ProjectsListView.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(ProjectsListView, [{
    key: 'initialize',
    value: function initialize() {
      _get(Object.getPrototypeOf(ProjectsListView.prototype), 'initialize', this).call(this);
      this.addClass('project-manager');
    }
  }, {
    key: 'activate',
    value: function activate() {}
  }, {
    key: 'getFilterKey',
    value: function getFilterKey() {
      var input = this.filterEditorView.getText();
      var inputArr = input.split(':');
      var isFilterKey = _underscorePlus2['default'].contains(this.possibleFilterKeys, inputArr[0]);
      var filter = this.defaultFilterKey;

      if (inputArr.length > 1 && isFilterKey) {
        filter = inputArr[0];
      }

      return filter;
    }
  }, {
    key: 'getFilterQuery',
    value: function getFilterQuery() {
      var input = this.filterEditorView.getText();
      var inputArr = input.split(':');
      var filter = input;

      if (inputArr.length > 1) {
        filter = inputArr[1];
      }

      return filter;
    }
  }, {
    key: 'getEmptyMessage',
    value: function getEmptyMessage(itemCount, filteredItemCount) {
      if (itemCount === 0) {
        return 'No projects saved yet';
      } else {
        _get(Object.getPrototypeOf(ProjectsListView.prototype), 'getEmptyMessage', this).call(this, itemCount, filteredItemCount);
      }
    }
  }, {
    key: 'toggle',
    value: function toggle() {
      var _this = this;

      if (this.panel && this.panel.isVisible()) {
        this.close();
      } else {
        _projects2['default'].getAll(function (projects) {
          return _this.show(projects);
        });
      }
    }
  }, {
    key: 'show',
    value: function show(projects) {
      if (this.panel == null) {
        this.panel = atom.workspace.addModalPanel({ item: this });
      }

      var items = [];
      for (var project of projects) {
        var item = _underscorePlus2['default'].clone(project.props);
        item.project = project;
        items.push(item);
      }

      this.panel.show();
      items = this.sortItems(items);
      this.setItems(items);
      this.focusFilterEditor();
    }
  }, {
    key: 'confirmed',
    value: function confirmed(item) {
      if (item && item.project.stats) {
        item.project.open();
        this.close();
      }
    }
  }, {
    key: 'close',
    value: function close() {
      if (this.panel) {
        this.panel.destroy();
        this.panel = null;
      }

      atom.workspace.getActivePane().activate();
    }
  }, {
    key: 'cancelled',
    value: function cancelled() {
      this.close();
    }
  }, {
    key: 'viewForItem',
    value: function viewForItem(_ref) {
      var _id = _ref._id;
      var title = _ref.title;
      var group = _ref.group;
      var icon = _ref.icon;
      var devMode = _ref.devMode;
      var paths = _ref.paths;
      var project = _ref.project;

      var showPath = this.showPath;
      var projectMissing = project.stats ? false : true;

      return (0, _atomSpacePenViews.$$)(function () {
        var _this2 = this;

        this.li({ 'class': 'two-lines' }, { 'data-project-id': _id, 'data-path-missing': projectMissing }, function () {
          _this2.div({ 'class': 'primary-line' }, function () {
            if (devMode) {
              _this2.span({ 'class': 'project-manager-devmode' });
            }

            _this2.div({ 'class': 'icon ' + icon }, function () {
              _this2.span(title);
              if (group != null) {
                _this2.span({ 'class': 'project-manager-list-group' }, group);
              }
            });
          });
          _this2.div({ 'class': 'secondary-line' }, function () {
            if (projectMissing) {
              _this2.div({ 'class': 'icon icon-alert' }, 'Path is not available');
            } else if (showPath) {
              var path = undefined;
              for (path of paths) {
                _this2.div({ 'class': 'no-icon' }, path);
              }
            }
          });
        });
      });
    }
  }, {
    key: 'sortItems',
    value: function sortItems(items) {
      var key = this.sortBy;
      if (key === 'default') {
        return items;
      } else if (key === 'last modified') {
        items.sort(function (a, b) {
          a = a.project.lastModified.getTime();
          b = b.project.lastModified.getTime();

          return a > b ? -1 : 1;
        });
      } else {
        items.sort(function (a, b) {
          a = (a[key] || '￿').toUpperCase();
          b = (b[key] || '￿').toUpperCase();

          return a > b ? 1 : -1;
        });
      }

      return items;
    }
  }, {
    key: 'possibleFilterKeys',
    get: function get() {
      return ['title', 'group', 'template'];
    }
  }, {
    key: 'defaultFilterKey',
    get: function get() {
      return 'title';
    }
  }, {
    key: 'sortBy',
    get: function get() {
      return atom.config.get('project-manager.sortBy');
    }
  }, {
    key: 'showPath',
    get: function get() {
      return atom.config.get('project-manager.showPath');
    }
  }]);

  return ProjectsListView;
})(_atomSpacePenViews.SelectListView);

exports['default'] = ProjectsListView;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3dpbGxpYW0vLmF0b20vcGFja2FnZXMvcHJvamVjdC1tYW5hZ2VyL2xpYi9wcm9qZWN0cy1saXN0LXZpZXcuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7aUNBRWlDLHNCQUFzQjs7OEJBQ3pDLGlCQUFpQjs7Ozt3QkFDVixZQUFZOzs7O0FBSmpDLFdBQVcsQ0FBQzs7SUFNUyxnQkFBZ0I7WUFBaEIsZ0JBQWdCOztXQUFoQixnQkFBZ0I7MEJBQWhCLGdCQUFnQjs7K0JBQWhCLGdCQUFnQjs7O2VBQWhCLGdCQUFnQjs7V0FDekIsc0JBQUc7QUFDWCxpQ0FGaUIsZ0JBQWdCLDRDQUVkO0FBQ25CLFVBQUksQ0FBQyxRQUFRLENBQUMsaUJBQWlCLENBQUMsQ0FBQztLQUNsQzs7O1dBRU8sb0JBQUcsRUFDVjs7O1dBa0JXLHdCQUFHO0FBQ2IsVUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQzlDLFVBQU0sUUFBUSxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDbEMsVUFBTSxXQUFXLEdBQUcsNEJBQUUsUUFBUSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNyRSxVQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUM7O0FBRW5DLFVBQUksUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksV0FBVyxFQUFFO0FBQ3RDLGNBQU0sR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7T0FDdEI7O0FBRUQsYUFBTyxNQUFNLENBQUM7S0FDZjs7O1dBRWEsMEJBQUc7QUFDZixVQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDOUMsVUFBTSxRQUFRLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNs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Q0FBQyxDQUFDO0tBQ3BEOzs7U0F2QmtCLGdCQUFnQjs7O3FCQUFoQixnQkFBZ0IiLCJmaWxlIjoiL2hvbWUvd2lsbGlhbS8uYXRvbS9wYWNrYWdlcy9wcm9qZWN0LW1hbmFnZXIvbGliL3Byb2plY3RzLWxpc3Qtdmlldy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5pbXBvcnQge1NlbGVjdExpc3RWaWV3LCAkJH0gZnJvbSAnYXRvbS1zcGFjZS1wZW4tdmlld3MnO1xuaW1wb3J0IF8gZnJvbSAndW5kZXJzY29yZS1wbHVzJztcbmltcG9ydCBwcm9qZWN0cyBmcm9tICcuL3Byb2plY3RzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUHJvamVjdHNMaXN0VmlldyBleHRlbmRzIFNlbGVjdExpc3RWaWV3IHtcbiAgaW5pdGlhbGl6ZSgpIHtcbiAgICBzdXBlci5pbml0aWFsaXplKCk7XG4gICAgdGhpcy5hZGRDbGFzcygncHJvamVjdC1tYW5hZ2VyJyk7XG4gIH1cblxuICBhY3RpdmF0ZSgpIHtcbiAgfVxuXG4gIGdldCBwb3NzaWJsZUZpbHRlcktleXMoKSB7XG4gICAgcmV0dXJuIFsndGl0bGUnLCAnZ3JvdXAnLCAndGVtcGxhdGUnXTtcbiAgfVxuXG4gIGdldCBkZWZhdWx0RmlsdGVyS2V5KCkge1xuICAgIHJldHVybiAndGl0bGUnO1xuICB9XG5cbiAgZ2V0IHNvcnRCeSgpIHtcbiAgICByZXR1cm4gYXRvbS5jb25maWcuZ2V0KCdwcm9qZWN0LW1hbmFnZXIuc29ydEJ5Jyk7XG4gIH1cblxuICBnZXQgc2hvd1BhdGgoKSB7XG4gICAgcmV0dXJuIGF0b20uY29uZmlnLmdldCgncHJvamVjdC1tYW5hZ2VyLnNob3dQYXRoJyk7XG4gIH1cblxuICBnZXRGaWx0ZXJLZXkoKSB7XG4gICAgY29uc3QgaW5wdXQgPSB0aGlzLmZpbHRlckVkaXRvclZpZXcuZ2V0VGV4dCgpO1xuICAgIGNvbnN0IGlucHV0QXJyID0gaW5wdXQuc3BsaXQoJzonKTtcbiAgICBjb25zdCBpc0ZpbHRlcktleSA9IF8uY29udGFpbnModGhpcy5wb3NzaWJsZUZpbHRlcktleXMsIGlucHV0QXJyWzBdKTtcbiAgICBsZXQgZmlsdGVyID0gdGhpcy5kZWZhdWx0RmlsdGVyS2V5O1xuXG4gICAgaWYgKGlucHV0QXJyLmxlbmd0aCA+IDEgJiYgaXNGaWx0ZXJLZXkpIHtcbiAgICAgIGZpbHRlciA9IGlucHV0QXJyWzBdO1xuICAgIH1cblxuICAgIHJldHVybiBmaWx0ZXI7XG4gIH1cblxuICBnZXRGaWx0ZXJRdWVyeSgpIHtcbiAgICBjb25zdCBpbnB1dCA9IHRoaXMuZmlsdGVyRWRpdG9yVmlldy5nZXRUZXh0KCk7XG4gICAgY29uc3QgaW5wdXRBcnIgPSBpbnB1dC5zcGxpdCgnOicpO1xuICAgIGxldCBmaWx0ZXIgPSBpbnB1dDtcblxuICAgIGlmIChpbnB1dEFyci5sZW5ndGggPiAxKSB7XG4gICAgICBmaWx0ZXIgPSBpbnB1dEFyclsxXTtcbiAgICB9XG5cbiAgICByZXR1cm4gZmlsdGVyO1xuICB9XG5cbiAgZ2V0RW1wdHlNZXNzYWdlKGl0ZW1Db3VudCwgZmlsdGVyZWRJdGVtQ291bnQpIHtcbiAgICBpZiAoaXRlbUNvdW50ID09PSAwKSB7XG4gICAgICByZXR1cm4gJ05vIHByb2plY3RzIHNhdmVkIHlldCc7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN1cGVyLmdldEVtcHR5TWVzc2FnZShpdGVtQ291bnQsIGZpbHRlcmVkSXRlbUNvdW50KTtcbiAgICB9XG4gIH1cblxuICB0b2dnbGUoKSB7XG4gICAgaWYgKHRoaXMucGFuZWwgJiYgdGhpcy5wYW5lbC5pc1Zpc2libGUoKSkge1xuICAgICAgdGhpcy5jbG9zZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBwcm9qZWN0cy5nZXRBbGwoKHByb2plY3RzKSA9PiB0aGlzLnNob3cocHJvamVjdHMpKTtcbiAgICB9XG4gIH1cblxuICBzaG93KHByb2plY3RzKSB7XG4gICAgaWYgKHRoaXMucGFuZWwgPT0gbnVsbCkge1xuICAgICAgdGhpcy5wYW5lbCA9IGF0b20ud29ya3NwYWNlLmFkZE1vZGFsUGFuZWwoe2l0ZW06IHRoaXN9KTtcbiAgICB9XG5cbiAgICBsZXQgaXRlbXMgPSBbXTtcbiAgICBmb3IgKGxldCBwcm9qZWN0IG9mIHByb2plY3RzKSB7XG4gICAgICBjb25zdCBpdGVtID0gXy5jbG9uZShwcm9qZWN0LnByb3BzKTtcbiAgICAgIGl0ZW0ucHJvamVjdCA9IHByb2plY3Q7XG4gICAgICBpdGVtcy5wdXNoKGl0ZW0pO1xuICAgIH1cblxuICAgIHRoaXMucGFuZWwuc2hvdygpO1xuICAgIGl0ZW1zID0gdGhpcy5zb3J0SXRlbXMoaXRlbXMpO1xuICAgIHRoaXMuc2V0SXRlbXMoaXRlbXMpO1xuICAgIHRoaXMuZm9jdXNGaWx0ZXJFZGl0b3IoKTtcbiAgfVxuXG4gIGNvbmZpcm1lZChpdGVtKSB7XG4gICAgaWYgKGl0ZW0gJiYgaXRlbS5wcm9qZWN0LnN0YXRzKSB7XG4gICAgICBpdGVtLnByb2plY3Qub3BlbigpO1xuICAgICAgdGhpcy5jbG9zZSgpO1xuICAgIH1cbiAgfVxuXG4gIGNsb3NlKCkge1xuICAgIGlmICh0aGlzLnBhbmVsKSB7XG4gICAgICB0aGlzLnBhbmVsLmRlc3Ryb3koKTtcbiAgICAgIHRoaXMucGFuZWwgPSBudWxsO1xuICAgIH1cblxuICAgIGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmUoKS5hY3RpdmF0ZSgpO1xuICB9XG5cbiAgY2FuY2VsbGVkKCkge1xuICAgIHRoaXMuY2xvc2UoKTtcbiAgfVxuXG4gIHZpZXdGb3JJdGVtKHtfaWQsIHRpdGxlLCBncm91cCwgaWNvbiwgZGV2TW9kZSwgcGF0aHMsIHByb2plY3R9KSB7XG4gICAgY29uc3Qgc2hvd1BhdGggPSB0aGlzLnNob3dQYXRoO1xuICAgIGNvbnN0IHByb2plY3RNaXNzaW5nID0gcHJvamVjdC5zdGF0cyA/IGZhbHNlIDogdHJ1ZTtcblxuICAgIHJldHVybiAkJChmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLmxpKHtjbGFzczogJ3R3by1saW5lcyd9LFxuICAgICAgeydkYXRhLXByb2plY3QtaWQnOiBfaWQsICdkYXRhLXBhdGgtbWlzc2luZyc6IHByb2plY3RNaXNzaW5nfSwgKCkgPT4ge1xuICAgICAgICB0aGlzLmRpdih7Y2xhc3M6ICdwcmltYXJ5LWxpbmUnfSwgKCkgPT4ge1xuICAgICAgICAgIGlmIChkZXZNb2RlKSB7XG4gICAgICAgICAgICB0aGlzLnNwYW4oe2NsYXNzOiAncHJvamVjdC1tYW5hZ2VyLWRldm1vZGUnfSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdGhpcy5kaXYoe2NsYXNzOiBgaWNvbiAke2ljb259YH0sICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuc3Bhbih0aXRsZSk7XG4gICAgICAgICAgICBpZiAoZ3JvdXAgIT0gbnVsbCkge1xuICAgICAgICAgICAgICB0aGlzLnNwYW4oe2NsYXNzOiAncHJvamVjdC1tYW5hZ2VyLWxpc3QtZ3JvdXAnfSwgZ3JvdXApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5kaXYoe2NsYXNzOiAnc2Vjb25kYXJ5LWxpbmUnfSwgKCkgPT4ge1xuICAgICAgICAgIGlmIChwcm9qZWN0TWlzc2luZykge1xuICAgICAgICAgICAgdGhpcy5kaXYoe2NsYXNzOiAnaWNvbiBpY29uLWFsZXJ0J30sICdQYXRoIGlzIG5vdCBhdmFpbGFibGUnKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKHNob3dQYXRoKSB7XG4gICAgICAgICAgICBsZXQgcGF0aDtcbiAgICAgICAgICAgIGZvciAocGF0aCBvZiBwYXRocykge1xuICAgICAgICAgICAgICB0aGlzLmRpdih7Y2xhc3M6ICduby1pY29uJ30sIHBhdGgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIHNvcnRJdGVtcyhpdGVtcykge1xuICAgIGNvbnN0IGtleSA9IHRoaXMuc29ydEJ5O1xuICAgIGlmIChrZXkgPT09ICdkZWZhdWx0Jykge1xuICAgICAgcmV0dXJuIGl0ZW1zO1xuICAgIH0gZWxzZSBpZiAoa2V5ID09PSAnbGFzdCBtb2RpZmllZCcpIHtcbiAgICAgIGl0ZW1zLnNvcnQoKGEsIGIpID0+IHtcbiAgICAgICAgYSA9IGEucHJvamVjdC5sYXN0TW9kaWZpZWQuZ2V0VGltZSgpO1xuICAgICAgICBiID0gYi5wcm9qZWN0Lmxhc3RNb2RpZmllZC5nZXRUaW1lKCk7XG5cbiAgICAgICAgcmV0dXJuIGEgPiBiID8gLTEgOiAxO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGl0ZW1zLnNvcnQoKGEsIGIpID0+IHtcbiAgICAgICAgYSA9IChhW2tleV0gfHwgJ1xcdWZmZmYnKS50b1VwcGVyQ2FzZSgpO1xuICAgICAgICBiID0gKGJba2V5XSB8fCAnXFx1ZmZmZicpLnRvVXBwZXJDYXNlKCk7XG5cbiAgICAgICAgcmV0dXJuIGEgPiBiID8gMSA6IC0xO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGl0ZW1zO1xuICB9XG59XG4iXX0=
//# sourceURL=/home/william/.atom/packages/project-manager/lib/projects-list-view.js
