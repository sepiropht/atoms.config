Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _underscorePlus = require('underscore-plus');

var _underscorePlus2 = _interopRequireDefault(_underscorePlus);

var _settings = require('./settings');

var _settings2 = _interopRequireDefault(_settings);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _db = require('./db');

var _db2 = _interopRequireDefault(_db);

var _season = require('season');

var _season2 = _interopRequireDefault(_season);

'use babel';

var Project = (function () {
  function Project() {
    var props = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, Project);

    this.props = this.defaultProps;
    this.emitter = new _atom.Emitter();
    this.settings = new _settings2['default']();
    this.updateProps(props);
    this.lookForUpdates();
  }

  _createClass(Project, [{
    key: 'updateProps',
    value: function updateProps(props) {
      var activePaths = atom.project.getPaths();
      var newProps = _underscorePlus2['default'].clone(this.props);
      _underscorePlus2['default'].deepExtend(newProps, props);
      this.props = newProps;

      if (this.isCurrent()) {
        // Add any new paths.
        for (var path of this.props.paths) {
          if (activePaths.indexOf(path) < 0) {
            atom.project.addPath(path);
          }
        }

        // Remove paths that have been removed.
        for (var activePath of activePaths) {
          if (this.props.paths.indexOf(activePath) < 0) {
            atom.project.removePath(activePath);
          }
        }
      }

      try {
        var stats = _fs2['default'].statSync(this.rootPath);
        this.stats = stats;
      } catch (e) {
        this.stats = false;
      }
    }
  }, {
    key: 'getPropsToSave',
    value: function getPropsToSave() {
      var saveProps = {};
      var value = undefined;
      var key = undefined;
      for (key in this.props) {
        value = this.props[key];
        if (!this.isDefaultProp(key, value)) {
          saveProps[key] = value;
        }
      }

      return saveProps;
    }
  }, {
    key: 'isDefaultProp',
    value: function isDefaultProp(key, value) {
      if (!this.defaultProps.hasOwnProperty(key)) {
        return false;
      }

      var defaultProp = this.defaultProps[key];
      if (typeof defaultProp === 'object' && _underscorePlus2['default'].isEqual(defaultProp, value)) {
        return true;
      }

      if (defaultProp === value) {
        return true;
      }

      return false;
    }
  }, {
    key: 'set',
    value: function set(key, value) {
      if (typeof key === 'object') {
        for (var i in key) {
          value = key[i];
          this.props[i] = value;
        }

        this.save();
      } else {
        this.props[key] = value;
        this.save();
      }
    }
  }, {
    key: 'unset',
    value: function unset(key) {
      if (_underscorePlus2['default'].has(this.defaultProps, key)) {
        this.props[key] = this.defaultProps[key];
      } else {
        this.props[key] = null;
      }

      this.save();
    }
  }, {
    key: 'lookForUpdates',
    value: function lookForUpdates() {
      var _this = this;

      if (this.props._id) {
        var id = this.props._id;
        var query = {
          key: 'paths',
          value: this.props.paths
        };
        _db2['default'].addUpdater(id, query, function (props) {
          if (props) {
            var updatedProps = _this.defaultProps;
            _underscorePlus2['default'].deepExtend(updatedProps, props);
            if (!_underscorePlus2['default'].isEqual(_this.props, updatedProps)) {
              _this.updateProps(props);
              _this.emitter.emit('updated');

              if (_this.isCurrent()) {
                _this.load();
              }
            }
          }
        });
      }
    }
  }, {
    key: 'isCurrent',
    value: function isCurrent() {
      var activePath = atom.project.getPaths()[0];
      if (activePath === this.rootPath) {
        return true;
      }

      return false;
    }
  }, {
    key: 'isValid',
    value: function isValid() {
      var _this2 = this;

      var valid = true;
      this.requiredProperties.forEach(function (key) {
        if (!_this2.props[key] || !_this2.props[key].length) {
          valid = false;
        }
      });

      return valid;
    }
  }, {
    key: 'load',
    value: function load() {
      if (this.isCurrent()) {
        this.checkForLocalSettings();
        this.settings.load(this.props.settings);
      }
    }
  }, {
    key: 'checkForLocalSettings',
    value: function checkForLocalSettings() {
      var _this3 = this;

      if (this.localSettingsWatcher) {
        this.localSettingsWatcher.close();
      }

      if (!this.localSettingsChecked) {
        this.localSettingsChecked = true;
        try {
          var localSettingsFile = this.rootPath + '/project.cson';
          var settings = _season2['default'].readFileSync(localSettingsFile);

          if (settings) {
            this.localSettingsWatcher = _fs2['default'].watch(localSettingsFile, function () {
              _this3.localSettingsChecked = false;

              if (_this3.isCurrent()) {
                _this3.load();
              } else {
                _this3.checkForLocalSettings();
              }
            });

            this.updateProps(settings);
          }
        } catch (e) {}
      }
    }
  }, {
    key: 'save',
    value: function save() {
      var _this4 = this;

      if (this.isValid()) {
        if (this.props._id) {
          _db2['default'].update(this.getPropsToSave());
        } else {
          _db2['default'].add(this.getPropsToSave(), function (id) {
            _this4.props._id = id;
            _this4.lookForUpdates();
          });
        }

        return true;
      }

      return false;
    }
  }, {
    key: 'remove',
    value: function remove() {
      _db2['default']['delete'](this.props._id);
    }
  }, {
    key: 'open',
    value: function open() {
      var win = atom.getCurrentWindow();
      var closeCurrent = atom.config.get('project-manager.closeCurrent');

      atom.open({
        pathsToOpen: this.props.paths,
        devMode: this.props.devMode,
        newWindow: closeCurrent
      });

      if (closeCurrent) {
        setTimeout(function () {
          win.close();
        }, 0);
      }
    }
  }, {
    key: 'onUpdate',
    value: function onUpdate(callback) {
      this.emitter.on('updated', function () {
        return callback();
      });
    }
  }, {
    key: 'requiredProperties',
    get: function get() {
      return ['title', 'paths'];
    }
  }, {
    key: 'defaultProps',
    get: function get() {
      return {
        title: '',
        paths: [],
        icon: 'icon-chevron-right',
        settings: {},
        group: null,
        devMode: false,
        template: null
      };
    }
  }, {
    key: 'rootPath',
    get: function get() {
      if (this.props.paths[0]) {
        return this.props.paths[0];
      }

      return '';
    }
  }, {
    key: 'lastModified',
    get: function get() {
      var mtime = 0;
      try {
        var stats = _fs2['default'].statSync(this.rootPath);
        mtime = stats.mtime;
      } catch (e) {
        mtime = new Date(0);
      }

      return mtime;
    }
  }]);

  return Project;
})();

exports['default'] = Project;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3dpbGxpYW0vLmF0b20vcGFja2FnZXMvcHJvamVjdC1tYW5hZ2VyL2xpYi9wcm9qZWN0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7b0JBRXNCLE1BQU07OzhCQUNkLGlCQUFpQjs7Ozt3QkFDVixZQUFZOzs7O2tCQUNsQixJQUFJOzs7O2tCQUNKLE1BQU07Ozs7c0JBQ0osUUFBUTs7OztBQVB6QixXQUFXLENBQUM7O0lBU1MsT0FBTztBQUVmLFdBRlEsT0FBTyxHQUVKO1FBQVYsS0FBSyx5REFBQyxFQUFFOzswQkFGRCxPQUFPOztBQUd4QixRQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUM7QUFDL0IsUUFBSSxDQUFDLE9BQU8sR0FBRyxtQkFBYSxDQUFDO0FBQzdCLFFBQUksQ0FBQyxRQUFRLEdBQUcsMkJBQWMsQ0FBQztBQUMvQixRQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ3hCLFFBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztHQUN2Qjs7ZUFSa0IsT0FBTzs7V0E4Q2YscUJBQUMsS0FBSyxFQUFFO0FBQ2pCLFVBQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUM7QUFDNUMsVUFBTSxRQUFRLEdBQUcsNEJBQUUsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUNyQyxrQ0FBRSxVQUFVLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBQzlCLFVBQUksQ0FBQyxLQUFLLEdBQUcsUUFBUSxDQUFDOztBQUV0QixVQUFJLElBQUksQ0FBQyxTQUFTLEVBQUUsRUFBRTs7QUFFcEIsYUFBSyxJQUFNLElBQUksSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRTtBQUNuQyxjQUFJLFdBQVcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFO0FBQ2pDLGdCQUFJLENBQUMsT0FBTyxDQUFDLE9B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QUssRUFBRSxFQUFFO0FBQ1QsYUFBSyxFQUFFLEVBQUU7QUFDVCxZQUFJLEVBQUUsb0JBQW9CO0FBQzFCLGdCQUFRLEVBQUUsRUFBRTtBQUNaLGFBQUssRUFBRSxJQUFJO0FBQ1gsZUFBTyxFQUFFLEtBQUs7QUFDZCxnQkFBUSxFQUFFLElBQUk7T0FDZixDQUFDO0tBQ0g7OztTQUVXLGVBQUc7QUFDYixVQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFO0FBQ3ZCLGVBQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7T0FDNUI7O0FBRUQsYUFBTyxFQUFFLENBQUM7S0FDWDs7O1NBRWUsZUFBRztBQUNqQixVQUFJLEtBQUssR0FBRyxDQUFDLENBQUM7QUFDZCxVQUFJO0FBQ0YsWUFBTSxLQUFLLEdBQUcsZ0JBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUN6QyxhQUFLLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQztPQUNyQixDQUFDLE9BQU8sQ0FBQyxFQUFFO0FBQ1YsYUFBSyxHQUFHLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO09BQ3JCOztBQUVELGFBQU8sS0FBSyxDQUFDO0tBQ2Q7OztTQTVDa0IsT0FBTzs7O3FCQUFQLE9BQU8iLCJmaWxlIjoiL2hvbWUvd2lsbGlhbS8uYXRvbS9wYWNrYWdlcy9wcm9qZWN0LW1hbmFnZXIvbGliL3Byb2plY3QuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuaW1wb3J0IHtFbWl0dGVyfSBmcm9tICdhdG9tJztcbmltcG9ydCBfIGZyb20gJ3VuZGVyc2NvcmUtcGx1cyc7XG5pbXBvcnQgU2V0dGluZ3MgZnJvbSAnLi9zZXR0aW5ncyc7XG5pbXBvcnQgZnMgZnJvbSAnZnMnO1xuaW1wb3J0IGRiIGZyb20gJy4vZGInO1xuaW1wb3J0IENTT04gZnJvbSAnc2Vhc29uJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUHJvamVjdCB7XG5cbiAgY29uc3RydWN0b3IocHJvcHM9e30pIHtcbiAgICB0aGlzLnByb3BzID0gdGhpcy5kZWZhdWx0UHJvcHM7XG4gICAgdGhpcy5lbWl0dGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICB0aGlzLnNldHRpbmdzID0gbmV3IFNldHRpbmdzKCk7XG4gICAgdGhpcy51cGRhdGVQcm9wcyhwcm9wcyk7XG4gICAgdGhpcy5sb29rRm9yVXBkYXRlcygpO1xuICB9XG5cbiAgZ2V0IHJlcXVpcmVkUHJvcGVydGllcygpIHtcbiAgICByZXR1cm4gWyd0aXRsZScsICdwYXRocyddO1xuICB9XG5cbiAgZ2V0IGRlZmF1bHRQcm9wcygpIHtcbiAgICByZXR1cm4ge1xuICAgICAgdGl0bGU6ICcnLFxuICAgICAgcGF0aHM6IFtdLFxuICAgICAgaWNvbjogJ2ljb24tY2hldnJvbi1yaWdodCcsXG4gICAgICBzZXR0aW5nczoge30sXG4gICAgICBncm91cDogbnVsbCxcbiAgICAgIGRldk1vZGU6IGZhbHNlLFxuICAgICAgdGVtcGxhdGU6IG51bGxcbiAgICB9O1xuICB9XG5cbiAgZ2V0IHJvb3RQYXRoKCkge1xuICAgIGlmICh0aGlzLnByb3BzLnBhdGhzWzBdKSB7XG4gICAgICByZXR1cm4gdGhpcy5wcm9wcy5wYXRoc1swXTtcbiAgICB9XG5cbiAgICByZXR1cm4gJyc7XG4gIH1cblxuICBnZXQgbGFzdE1vZGlmaWVkKCkge1xuICAgIGxldCBtdGltZSA9IDA7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHN0YXRzID0gZnMuc3RhdFN5bmModGhpcy5yb290UGF0aCk7XG4gICAgICBtdGltZSA9IHN0YXRzLm10aW1lO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIG10aW1lID0gbmV3IERhdGUoMCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG10aW1lO1xuICB9XG5cbiAgdXBkYXRlUHJvcHMocHJvcHMpIHtcbiAgICBjb25zdCBhY3RpdmVQYXRocyA9IGF0b20ucHJvamVjdC5nZXRQYXRocygpO1xuICAgIGNvbnN0IG5ld1Byb3BzID0gXy5jbG9uZSh0aGlzLnByb3BzKTtcbiAgICBfLmRlZXBFeHRlbmQobmV3UHJvcHMsIHByb3BzKTtcbiAgICB0aGlzLnByb3BzID0gbmV3UHJvcHM7XG5cbiAgICBpZiAodGhpcy5pc0N1cnJlbnQoKSkge1xuICAgICAgLy8gQWRkIGFueSBuZXcgcGF0aHMuXG4gICAgICBmb3IgKGNvbnN0IHBhdGggb2YgdGhpcy5wcm9wcy5wYXRocykge1xuICAgICAgICBpZiAoYWN0aXZlUGF0aHMuaW5kZXhPZihwYXRoKSA8IDApIHtcbiAgICAgICAgICBhdG9tLnByb2plY3QuYWRkUGF0aChwYXRoKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBSZW1vdmUgcGF0aHMgdGhhdCBoYXZlIGJlZW4gcmVtb3ZlZC5cbiAgICAgIGZvciAoY29uc3QgYWN0aXZlUGF0aCBvZiBhY3RpdmVQYXRocykge1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5wYXRocy5pbmRleE9mKGFjdGl2ZVBhdGgpIDwgMCkge1xuICAgICAgICAgIGF0b20ucHJvamVjdC5yZW1vdmVQYXRoKGFjdGl2ZVBhdGgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHN0YXRzID0gZnMuc3RhdFN5bmModGhpcy5yb290UGF0aCk7XG4gICAgICB0aGlzLnN0YXRzID0gc3RhdHM7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgdGhpcy5zdGF0cyA9IGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIGdldFByb3BzVG9TYXZlKCkge1xuICAgIGxldCBzYXZlUHJvcHMgPSB7fTtcbiAgICBsZXQgdmFsdWU7XG4gICAgbGV0IGtleTtcbiAgICBmb3IgKGtleSBpbiB0aGlzLnByb3BzKSB7XG4gICAgICB2YWx1ZSA9IHRoaXMucHJvcHNba2V5XTtcbiAgICAgIGlmICghdGhpcy5pc0RlZmF1bHRQcm9wKGtleSwgdmFsdWUpKSB7XG4gICAgICAgIHNhdmVQcm9wc1trZXldID0gdmFsdWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHNhdmVQcm9wcztcbiAgfVxuXG4gIGlzRGVmYXVsdFByb3Aoa2V5LCB2YWx1ZSkge1xuICAgIGlmICghdGhpcy5kZWZhdWx0UHJvcHMuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGNvbnN0IGRlZmF1bHRQcm9wID0gdGhpcy5kZWZhdWx0UHJvcHNba2V5XTtcbiAgICBpZiAodHlwZW9mIGRlZmF1bHRQcm9wID09PSAnb2JqZWN0JyAmJiBfLmlzRXF1YWwoZGVmYXVsdFByb3AsIHZhbHVlKSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgaWYgKGRlZmF1bHRQcm9wID09PSB2YWx1ZSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgc2V0KGtleSwgdmFsdWUpIHtcbiAgICBpZiAodHlwZW9mIGtleSA9PT0gJ29iamVjdCcpIHtcbiAgICAgIGZvciAobGV0IGkgaW4ga2V5KSB7XG4gICAgICAgIHZhbHVlID0ga2V5W2ldO1xuICAgICAgICB0aGlzLnByb3BzW2ldID0gdmFsdWU7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuc2F2ZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnByb3BzW2tleV0gPSB2YWx1ZTtcbiAgICAgIHRoaXMuc2F2ZSgpO1xuICAgIH1cbiAgfVxuXG4gIHVuc2V0KGtleSkge1xuICAgIGlmIChfLmhhcyh0aGlzLmRlZmF1bHRQcm9wcywga2V5KSkge1xuICAgICAgdGhpcy5wcm9wc1trZXldID0gdGhpcy5kZWZhdWx0UHJvcHNba2V5XTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5wcm9wc1trZXldID0gbnVsbDtcbiAgICB9XG5cbiAgICB0aGlzLnNhdmUoKTtcbiAgfVxuXG4gIGxvb2tGb3JVcGRhdGVzKCkge1xuICAgIGlmICh0aGlzLnByb3BzLl9pZCkge1xuICAgICAgY29uc3QgaWQgPSB0aGlzLnByb3BzLl9pZDtcbiAgICAgIGNvbnN0IHF1ZXJ5ID0ge1xuICAgICAgICBrZXk6ICdwYXRocycsXG4gICAgICAgIHZhbHVlOiB0aGlzLnByb3BzLnBhdGhzXG4gICAgICB9O1xuICAgICAgZGIuYWRkVXBkYXRlcihpZCwgcXVlcnksIChwcm9wcykgPT4ge1xuICAgICAgICBpZiAocHJvcHMpIHtcbiAgICAgICAgICBjb25zdCB1cGRhdGVkUHJvcHMgPSB0aGlzLmRlZmF1bHRQcm9wcztcbiAgICAgICAgICBfLmRlZXBFeHRlbmQodXBkYXRlZFByb3BzLCBwcm9wcyk7XG4gICAgICAgICAgaWYgKCFfLmlzRXF1YWwodGhpcy5wcm9wcywgdXBkYXRlZFByb3BzKSkge1xuICAgICAgICAgICAgdGhpcy51cGRhdGVQcm9wcyhwcm9wcyk7XG4gICAgICAgICAgICB0aGlzLmVtaXR0ZXIuZW1pdCgndXBkYXRlZCcpO1xuXG4gICAgICAgICAgICBpZiAodGhpcy5pc0N1cnJlbnQoKSkge1xuICAgICAgICAgICAgICB0aGlzLmxvYWQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIGlzQ3VycmVudCgpIHtcbiAgICBjb25zdCBhY3RpdmVQYXRoID0gYXRvbS5wcm9qZWN0LmdldFBhdGhzKClbMF07XG4gICAgaWYgKGFjdGl2ZVBhdGggPT09IHRoaXMucm9vdFBhdGgpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlzVmFsaWQoKSB7XG4gICAgbGV0IHZhbGlkID0gdHJ1ZTtcbiAgICB0aGlzLnJlcXVpcmVkUHJvcGVydGllcy5mb3JFYWNoKGtleSA9PiB7XG4gICAgICBpZiAoIXRoaXMucHJvcHNba2V5XSB8fCAhdGhpcy5wcm9wc1trZXldLmxlbmd0aCkge1xuICAgICAgICB2YWxpZCA9IGZhbHNlO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHZhbGlkO1xuICB9XG5cbiAgbG9hZCgpIHtcbiAgICBpZiAodGhpcy5pc0N1cnJlbnQoKSkge1xuICAgICAgdGhpcy5jaGVja0ZvckxvY2FsU2V0dGluZ3MoKTtcbiAgICAgIHRoaXMuc2V0dGluZ3MubG9hZCh0aGlzLnByb3BzLnNldHRpbmdzKTtcbiAgICB9XG4gIH1cblxuICBjaGVja0ZvckxvY2FsU2V0dGluZ3MoKSB7XG4gICAgaWYgKHRoaXMubG9jYWxTZXR0aW5nc1dhdGNoZXIpIHtcbiAgICAgIHRoaXMubG9jYWxTZXR0aW5nc1dhdGNoZXIuY2xvc2UoKTtcbiAgICB9XG5cbiAgICBpZiAoIXRoaXMubG9jYWxTZXR0aW5nc0NoZWNrZWQpIHtcbiAgICAgIHRoaXMubG9jYWxTZXR0aW5nc0NoZWNrZWQgPSB0cnVlO1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgbG9jYWxTZXR0aW5nc0ZpbGUgPSBgJHt0aGlzLnJvb3RQYXRofS9wcm9qZWN0LmNzb25gO1xuICAgICAgICBjb25zdCBzZXR0aW5ncyA9IENTT04ucmVhZEZpbGVTeW5jKGxvY2FsU2V0dGluZ3NGaWxlKTtcblxuICAgICAgICBpZiAoc2V0dGluZ3MpIHtcbiAgICAgICAgICB0aGlzLmxvY2FsU2V0dGluZ3NXYXRjaGVyID0gZnMud2F0Y2gobG9jYWxTZXR0aW5nc0ZpbGUsICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMubG9jYWxTZXR0aW5nc0NoZWNrZWQgPSBmYWxzZTtcblxuICAgICAgICAgICAgaWYgKHRoaXMuaXNDdXJyZW50KCkpIHtcbiAgICAgICAgICAgICAgdGhpcy5sb2FkKCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICB0aGlzLmNoZWNrRm9yTG9jYWxTZXR0aW5ncygpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgdGhpcy51cGRhdGVQcm9wcyhzZXR0aW5ncyk7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGUpIHt9XG4gICAgfVxuICB9XG5cbiAgc2F2ZSgpIHtcbiAgICBpZiAodGhpcy5pc1ZhbGlkKCkpIHtcbiAgICAgIGlmICh0aGlzLnByb3BzLl9pZCkge1xuICAgICAgICBkYi51cGRhdGUodGhpcy5nZXRQcm9wc1RvU2F2ZSgpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGRiLmFkZCh0aGlzLmdldFByb3BzVG9TYXZlKCksIGlkID0+IHtcbiAgICAgICAgICB0aGlzLnByb3BzLl9pZCA9IGlkO1xuICAgICAgICAgIHRoaXMubG9va0ZvclVwZGF0ZXMoKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHJlbW92ZSgpIHtcbiAgICBkYi5kZWxldGUodGhpcy5wcm9wcy5faWQpO1xuICB9XG5cbiAgb3BlbigpIHtcbiAgICBjb25zdCB3aW4gPSBhdG9tLmdldEN1cnJlbnRXaW5kb3coKTtcbiAgICBjb25zdCBjbG9zZUN1cnJlbnQgPSBhdG9tLmNvbmZpZy5nZXQoJ3Byb2plY3QtbWFuYWdlci5jbG9zZUN1cnJlbnQnKTtcblxuICAgIGF0b20ub3Blbih7XG4gICAgICBwYXRoc1RvT3BlbjogdGhpcy5wcm9wcy5wYXRocyxcbiAgICAgIGRldk1vZGU6IHRoaXMucHJvcHMuZGV2TW9kZSxcbiAgICAgIG5ld1dpbmRvdzogY2xvc2VDdXJyZW50XG4gICAgfSk7XG5cbiAgICBpZiAoY2xvc2VDdXJyZW50KSB7XG4gICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgd2luLmNsb3NlKCk7XG4gICAgICB9LCAwKTtcbiAgICB9XG4gIH1cblxuICBvblVwZGF0ZShjYWxsYmFjaykge1xuICAgIHRoaXMuZW1pdHRlci5vbigndXBkYXRlZCcsICgpID0+IGNhbGxiYWNrKCkpO1xuICB9XG59XG4iXX0=
//# sourceURL=/home/william/.atom/packages/project-manager/lib/project.js
