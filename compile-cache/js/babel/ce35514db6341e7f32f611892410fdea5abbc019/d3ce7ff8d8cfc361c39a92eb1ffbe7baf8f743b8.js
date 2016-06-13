'use babel';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var ProjectManager = (function () {
  function ProjectManager() {
    _classCallCheck(this, ProjectManager);
  }

  _createClass(ProjectManager, null, [{
    key: 'activate',
    value: function activate() {
      var _this = this;

      var CompositeDisposable = require('atom').CompositeDisposable;
      this.disposables = new CompositeDisposable();
      this.projects = require('./projects');

      this.disposables.add(atom.commands.add('atom-workspace', {
        'project-manager:list-projects': function projectManagerListProjects() {
          if (!_this.projectsListView) {
            var ProjectsListView = require('./projects-list-view');
            _this.projectsListView = new ProjectsListView();
          }

          _this.projectsListView.toggle();
        },

        'project-manager:save-project': function projectManagerSaveProject() {
          if (!_this.saveDialog) {
            var SaveDialog = require('./save-dialog');
            _this.saveDialog = new SaveDialog();
          }

          _this.saveDialog.attach();
        },

        'project-manager:edit-projects': function projectManagerEditProjects() {
          if (!_this.db) {
            _this.db = require('./db');
          }

          atom.workspace.open(_this.db.file());
        }
      }));

      atom.project.onDidChangePaths(function () {
        return _this.updatePaths();
      });
      this.loadProject();
    }
  }, {
    key: 'loadProject',
    value: function loadProject() {
      var _this2 = this;

      this.projects.getCurrent(function (project) {
        if (project) {
          _this2.project = project;
          _this2.project.load();
        }
      });
    }
  }, {
    key: 'updatePaths',
    value: function updatePaths() {
      this.projects.getCurrent(function (project) {
        var newPaths = atom.project.getPaths();
        var currentRoot = newPaths.length ? newPaths[0] : null;

        if (project.rootPath === currentRoot) {
          project.set('paths', newPaths);
        }
      });
    }
  }, {
    key: 'provideProjects',
    value: function provideProjects() {
      return {
        projects: this.projects
      };
    }
  }, {
    key: 'deactivate',
    value: function deactivate() {
      this.disposables.dispose();
    }
  }]);

  return ProjectManager;
})();

exports['default'] = ProjectManager;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3dpbGxpYW0vLmF0b20vcGFja2FnZXMvcHJvamVjdC1tYW5hZ2VyL2xpYi9wcm9qZWN0LW1hbmFnZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsV0FBVyxDQUFDOzs7Ozs7Ozs7O0lBRVMsY0FBYztXQUFkLGNBQWM7MEJBQWQsY0FBYzs7O2VBQWQsY0FBYzs7V0FDbEIsb0JBQUc7OztBQUNoQixVQUFNLG1CQUFtQixHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxtQkFBbUIsQ0FBQztBQUNoRSxVQUFJLENBQUMsV0FBVyxHQUFHLElBQUksbUJBQW1CLEVBQUUsQ0FBQztBQUM3QyxVQUFJLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQzs7QUFFdEMsVUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLEVBQUU7QUFDdkQsdUNBQStCLEVBQUUsc0NBQU07QUFDckMsY0FBSSxDQUFDLE1BQUssZ0JBQWdCLEVBQUU7QUFDMUIsZ0JBQU0sZ0JBQWdCLEdBQUcsT0FBTyxDQUFDLHNCQUFzQixDQUFDLENBQUM7QUFDekQsa0JBQUssZ0JBQWdCLEdBQUcsSUFBSSxnQkFBZ0IsRUFBRSxDQUFDO1dBQ2hEOztBQUVELGdCQUFLLGdCQUFnQixDQUFDLE1BQU0sRUFBRSxDQUFDO1NBQ2hDOztBQUVELHNDQUE4QixFQUFFLHFDQUFNO0FBQ3BDLGNBQUksQ0FBQyxNQUFLLFVBQVUsRUFBRTtBQUNwQixnQkFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0FBQzVDLGtCQUFLLFVBQVUsR0FBRyxJQUFJLFVBQVUsRUFBRSxDQUFDO1dBQ3BDOztBQUVELGdCQUFLLFVBQVUsQ0FBQyxNQUFNLEVBQUUsQ0FBQztTQUMxQjs7QUFFRCx1Q0FBK0IsRUFBRSxzQ0FBTTtBQUNyQyxjQUFJLENBQUMsTUFBSyxFQUFFLEVBQUU7QUFDWixrQkFBSyxFQUFFLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1dBQzNCOztBQUVELGNBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLE1BQUssRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7U0FDckM7T0FDRixDQUFDLENBQUMsQ0FBQzs7QUFFSixVQUFJLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDO2VBQU0sTUFBSyxXQUFXLEVBQUU7T0FBQSxDQUFDLENBQUM7QUFDeEQsVUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO0tBQ3BCOzs7V0FFaUIsdUJBQUc7OztBQUNuQixVQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxVQUFBLE9BQU8sRUFBSTtBQUNsQyxZQUFJLE9BQU8sRUFBRTtBQUNYLGlCQUFLLE9BQU8sR0FBRyxPQUFPLENBQUM7QUFDdkIsaUJBQUssT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO1NBQ3JCO09BQ0YsQ0FBQyxDQUFDO0tBQ0o7OztXQUVpQix1QkFBRztBQUNuQixVQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxVQUFBLE9BQU8sRUFBSTtBQUNsQyxZQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDO0FBQ3pDLFlBQU0sV0FBVyxHQUFHLFFBQVEsQ0FBQyxNQUFNLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQzs7QUFFekQsWUFBSSxPQUFPLENBQUMsUUFBUSxLQUFLLFdBQVcsRUFBRTtBQUNwQyxpQkFBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUM7U0FDaEM7T0FDRixDQUFDLENBQUM7S0FDSjs7O1dBRXFCLDJCQUFHO0FBQ3ZCLGFBQU87QUFDTCxnQkFBUSxFQUFFLElBQUksQ0FBQyxRQUFRO09BQ3hCLENBQUM7S0FDSDs7O1dBRWdCLHNCQUFHO0FBQ2xCLFVBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLENBQUM7S0FDNUI7OztTQWxFa0IsY0FBYzs7O3FCQUFkLGNBQWMiLCJmaWxlIjoiL2hvbWUvd2lsbGlhbS8uYXRvbS9wYWNrYWdlcy9wcm9qZWN0LW1hbmFnZXIvbGliL3Byb2plY3QtbWFuYWdlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQcm9qZWN0TWFuYWdlciB7XG4gIHN0YXRpYyBhY3RpdmF0ZSgpIHtcbiAgICBjb25zdCBDb21wb3NpdGVEaXNwb3NhYmxlID0gcmVxdWlyZSgnYXRvbScpLkNvbXBvc2l0ZURpc3Bvc2FibGU7XG4gICAgdGhpcy5kaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgdGhpcy5wcm9qZWN0cyA9IHJlcXVpcmUoJy4vcHJvamVjdHMnKTtcblxuICAgIHRoaXMuZGlzcG9zYWJsZXMuYWRkKGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXdvcmtzcGFjZScsIHtcbiAgICAgICdwcm9qZWN0LW1hbmFnZXI6bGlzdC1wcm9qZWN0cyc6ICgpID0+IHtcbiAgICAgICAgaWYgKCF0aGlzLnByb2plY3RzTGlzdFZpZXcpIHtcbiAgICAgICAgICBjb25zdCBQcm9qZWN0c0xpc3RWaWV3ID0gcmVxdWlyZSgnLi9wcm9qZWN0cy1saXN0LXZpZXcnKTtcbiAgICAgICAgICB0aGlzLnByb2plY3RzTGlzdFZpZXcgPSBuZXcgUHJvamVjdHNMaXN0VmlldygpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5wcm9qZWN0c0xpc3RWaWV3LnRvZ2dsZSgpO1xuICAgICAgfSxcblxuICAgICAgJ3Byb2plY3QtbWFuYWdlcjpzYXZlLXByb2plY3QnOiAoKSA9PiB7XG4gICAgICAgIGlmICghdGhpcy5zYXZlRGlhbG9nKSB7XG4gICAgICAgICAgY29uc3QgU2F2ZURpYWxvZyA9IHJlcXVpcmUoJy4vc2F2ZS1kaWFsb2cnKTtcbiAgICAgICAgICB0aGlzLnNhdmVEaWFsb2cgPSBuZXcgU2F2ZURpYWxvZygpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zYXZlRGlhbG9nLmF0dGFjaCgpO1xuICAgICAgfSxcblxuICAgICAgJ3Byb2plY3QtbWFuYWdlcjplZGl0LXByb2plY3RzJzogKCkgPT4ge1xuICAgICAgICBpZiAoIXRoaXMuZGIpIHtcbiAgICAgICAgICB0aGlzLmRiID0gcmVxdWlyZSgnLi9kYicpO1xuICAgICAgICB9XG5cbiAgICAgICAgYXRvbS53b3Jrc3BhY2Uub3Blbih0aGlzLmRiLmZpbGUoKSk7XG4gICAgICB9XG4gICAgfSkpO1xuXG4gICAgYXRvbS5wcm9qZWN0Lm9uRGlkQ2hhbmdlUGF0aHMoKCkgPT4gdGhpcy51cGRhdGVQYXRocygpKTtcbiAgICB0aGlzLmxvYWRQcm9qZWN0KCk7XG4gIH1cblxuICBzdGF0aWMgbG9hZFByb2plY3QoKSB7XG4gICAgdGhpcy5wcm9qZWN0cy5nZXRDdXJyZW50KHByb2plY3QgPT4ge1xuICAgICAgaWYgKHByb2plY3QpIHtcbiAgICAgICAgdGhpcy5wcm9qZWN0ID0gcHJvamVjdDtcbiAgICAgICAgdGhpcy5wcm9qZWN0LmxvYWQoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHN0YXRpYyB1cGRhdGVQYXRocygpIHtcbiAgICB0aGlzLnByb2plY3RzLmdldEN1cnJlbnQocHJvamVjdCA9PiB7XG4gICAgICBjb25zdCBuZXdQYXRocyA9IGF0b20ucHJvamVjdC5nZXRQYXRocygpO1xuICAgICAgY29uc3QgY3VycmVudFJvb3QgPSBuZXdQYXRocy5sZW5ndGggPyBuZXdQYXRoc1swXSA6IG51bGw7XG5cbiAgICAgIGlmIChwcm9qZWN0LnJvb3RQYXRoID09PSBjdXJyZW50Um9vdCkge1xuICAgICAgICBwcm9qZWN0LnNldCgncGF0aHMnLCBuZXdQYXRocyk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBzdGF0aWMgcHJvdmlkZVByb2plY3RzKCkge1xuICAgIHJldHVybiB7XG4gICAgICBwcm9qZWN0czogdGhpcy5wcm9qZWN0c1xuICAgIH07XG4gIH1cblxuICBzdGF0aWMgZGVhY3RpdmF0ZSgpIHtcbiAgICB0aGlzLmRpc3Bvc2FibGVzLmRpc3Bvc2UoKTtcbiAgfVxufVxuIl19
//# sourceURL=/home/william/.atom/packages/project-manager/lib/project-manager.js
