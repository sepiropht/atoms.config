Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _project = require('./project');

var _project2 = _interopRequireDefault(_project);

var _db = require('./db');

var _db2 = _interopRequireDefault(_db);

'use babel';

var Projects = (function () {
  function Projects() {
    var _this = this;

    _classCallCheck(this, Projects);

    this.emitter = new _atom.Emitter();
    this.projects = [];

    _db2['default'].addUpdater('iwantitall', {}, function (project) {
      _this.addProject(project);
    });
  }

  _createClass(Projects, [{
    key: 'onUpdate',
    value: function onUpdate(callback) {
      this.emitter.on('projects-updated', callback);
    }
  }, {
    key: 'getAll',
    value: function getAll(callback) {
      var _this2 = this;

      _db2['default'].find(function (projectSettings) {
        for (var setting of projectSettings) {
          _this2.addProject(setting);
        }

        callback(_this2.projects);
      });
    }
  }, {
    key: 'getCurrent',
    value: function getCurrent(callback) {
      this.getAll(function (projects) {
        projects.forEach(function (project) {
          if (project.isCurrent()) {
            callback(project);
          }
        });
      });
    }
  }, {
    key: 'addProject',
    value: function addProject(settings) {
      var found = null;

      for (var project of this.projects) {
        if (project.props._id === settings._id) {
          found = project;
        } else if (project.rootPath === settings.paths[0]) {
          found = project;
        }
      }

      if (found === null) {
        var newProject = new _project2['default'](settings);
        this.projects.push(newProject);

        if (!newProject.props._id) {
          newProject.save();
        }

        this.emitter.emit('projects-updated');
        found = newProject;
      }

      return found;
    }
  }]);

  return Projects;
})();

exports['default'] = new Projects();
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3dpbGxpYW0vLmF0b20vcGFja2FnZXMvcHJvamVjdC1tYW5hZ2VyL2xpYi9wcm9qZWN0cy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O29CQUVzQixNQUFNOzt1QkFDUixXQUFXOzs7O2tCQUNoQixNQUFNOzs7O0FBSnJCLFdBQVcsQ0FBQzs7SUFNTixRQUFRO0FBQ0QsV0FEUCxRQUFRLEdBQ0U7OzswQkFEVixRQUFROztBQUVWLFFBQUksQ0FBQyxPQUFPLEdBQUcsbUJBQWEsQ0FBQztBQUM3QixRQUFJLENBQUMsUUFBUSxHQUFHLEVBQUUsQ0FBQzs7QUFFbkIsb0JBQUcsVUFBVSxDQUFDLFlBQVksRUFBRSxFQUFFLEVBQUUsVUFBQyxPQUFPLEVBQUs7QUFDM0MsWUFBSyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUM7S0FDMUIsQ0FBQyxDQUFDO0dBQ0o7O2VBUkcsUUFBUTs7V0FVSixrQkFBQyxRQUFRLEVBQUU7QUFDakIsVUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsa0JBQWtCLEVBQUUsUUFBUSxDQUFDLENBQUM7S0FDL0M7OztXQUVLLGdCQUFDLFFBQVEsRUFBRTs7O0FBQ2Ysc0JBQUcsSUFBSSxDQUFDLFVBQUEsZUFBZSxFQUFJO0FBQ3pCLGFBQUssSUFBTSxPQUFPLElBQUksZUFBZSxFQUFFO0FBQ3JDLGlCQUFLLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQztTQUMxQjs7QUFFRCxnQkFBUSxDQUFDLE9BQUssUUFBUSxDQUFDLENBQUM7T0FDekIsQ0FBQyxDQUFDO0tBQ0o7OztXQUVTLG9CQUFDLFFBQVEsRUFBRTtBQUNuQixVQUFJLENBQUMsTUFBTSxDQUFDLFVBQUEsUUFBUSxFQUFJO0FBQ3RCLGdCQUFRLENBQUMsT0FBTyxDQUFDLFVBQUEsT0FBTyxFQUFJO0FBQzFCLGNBQUksT0FBTyxDQUFDLFNBQVMsRUFBRSxFQUFFO0FBQ3ZCLG9CQUFRLENBQUMsT0FBTyxDQUFDLENBQUM7V0FDbkI7U0FDRixDQUFDLENBQUM7T0FDSixDQUFDLENBQUM7S0FDSjs7O1dBRVMsb0JBQUMsUUFBUSxFQUFFO0FBQ25CLFVBQUksS0FBSyxHQUFHLElBQUksQ0FBQzs7QUFFakIsV0FBSyxJQUFNLE9BQU8sSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFO0FBQ25DLFlBQUksT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLEtBQUssUUFBUSxDQUFDLEdBQUcsRUFBRTtBQUN0QyxlQUFLLEdBQUcsT0FBTyxDQUFDO1NBQ2pCLE1BQU0sSUFBSSxPQUFPLENBQUMsUUFBUSxLQUFLLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUU7QUFDakQsZUFBSyxHQUFHLE9BQU8sQ0FBQztTQUNqQjtPQUNGOztBQUVELFVBQUksS0FBSyxLQUFLLElBQUksRUFBRTtBQUNsQixZQUFNLFVBQVUsR0FBRyx5QkFBWSxRQUFRLENBQUMsQ0FBQztBQUN6QyxZQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQzs7QUFFL0IsWUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFO0FBQ3pCLG9CQUFVLENBQUMsSUFBSSxFQUFFLENBQUM7U0FDbkI7O0FBRUQsWUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQztBQUN0QyxhQUFLLEdBQUcsVUFBVSxDQUFDO09BRXBCOztBQUVELGFBQU8sS0FBSyxDQUFDO0tBQ2Q7OztTQTNERyxRQUFROzs7cUJBOERDLElBQUksUUFBUSxFQUFFIiwiZmlsZSI6Ii9ob21lL3dpbGxpYW0vLmF0b20vcGFja2FnZXMvcHJvamVjdC1tYW5hZ2VyL2xpYi9wcm9qZWN0cy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5pbXBvcnQge0VtaXR0ZXJ9IGZyb20gJ2F0b20nO1xuaW1wb3J0IFByb2plY3QgZnJvbSAnLi9wcm9qZWN0JztcbmltcG9ydCBkYiBmcm9tICcuL2RiJztcblxuY2xhc3MgUHJvamVjdHMge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLmVtaXR0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgIHRoaXMucHJvamVjdHMgPSBbXTtcblxuICAgIGRiLmFkZFVwZGF0ZXIoJ2l3YW50aXRhbGwnLCB7fSwgKHByb2plY3QpID0+IHtcbiAgICAgIHRoaXMuYWRkUHJvamVjdChwcm9qZWN0KTtcbiAgICB9KTtcbiAgfVxuXG4gIG9uVXBkYXRlKGNhbGxiYWNrKSB7XG4gICAgdGhpcy5lbWl0dGVyLm9uKCdwcm9qZWN0cy11cGRhdGVkJywgY2FsbGJhY2spO1xuICB9XG5cbiAgZ2V0QWxsKGNhbGxiYWNrKSB7XG4gICAgZGIuZmluZChwcm9qZWN0U2V0dGluZ3MgPT4ge1xuICAgICAgZm9yIChjb25zdCBzZXR0aW5nIG9mIHByb2plY3RTZXR0aW5ncykge1xuICAgICAgICB0aGlzLmFkZFByb2plY3Qoc2V0dGluZyk7XG4gICAgICB9XG5cbiAgICAgIGNhbGxiYWNrKHRoaXMucHJvamVjdHMpO1xuICAgIH0pO1xuICB9XG5cbiAgZ2V0Q3VycmVudChjYWxsYmFjaykge1xuICAgIHRoaXMuZ2V0QWxsKHByb2plY3RzID0+IHtcbiAgICAgIHByb2plY3RzLmZvckVhY2gocHJvamVjdCA9PiB7XG4gICAgICAgIGlmIChwcm9qZWN0LmlzQ3VycmVudCgpKSB7XG4gICAgICAgICAgY2FsbGJhY2socHJvamVjdCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgYWRkUHJvamVjdChzZXR0aW5ncykge1xuICAgIGxldCBmb3VuZCA9IG51bGw7XG5cbiAgICBmb3IgKGNvbnN0IHByb2plY3Qgb2YgdGhpcy5wcm9qZWN0cykge1xuICAgICAgaWYgKHByb2plY3QucHJvcHMuX2lkID09PSBzZXR0aW5ncy5faWQpIHtcbiAgICAgICAgZm91bmQgPSBwcm9qZWN0O1xuICAgICAgfSBlbHNlIGlmIChwcm9qZWN0LnJvb3RQYXRoID09PSBzZXR0aW5ncy5wYXRoc1swXSkge1xuICAgICAgICBmb3VuZCA9IHByb2plY3Q7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGZvdW5kID09PSBudWxsKSB7XG4gICAgICBjb25zdCBuZXdQcm9qZWN0ID0gbmV3IFByb2plY3Qoc2V0dGluZ3MpO1xuICAgICAgdGhpcy5wcm9qZWN0cy5wdXNoKG5ld1Byb2plY3QpO1xuXG4gICAgICBpZiAoIW5ld1Byb2plY3QucHJvcHMuX2lkKSB7XG4gICAgICAgIG5ld1Byb2plY3Quc2F2ZSgpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmVtaXR0ZXIuZW1pdCgncHJvamVjdHMtdXBkYXRlZCcpO1xuICAgICAgZm91bmQgPSBuZXdQcm9qZWN0O1xuXG4gICAgfVxuXG4gICAgcmV0dXJuIGZvdW5kO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IG5ldyBQcm9qZWN0cygpO1xuIl19
//# sourceURL=/home/william/.atom/packages/project-manager/lib/projects.js
