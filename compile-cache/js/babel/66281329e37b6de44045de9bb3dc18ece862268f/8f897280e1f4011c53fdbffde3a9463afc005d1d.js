Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _season = require('season');

var _season2 = _interopRequireDefault(_season);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _underscorePlus = require('underscore-plus');

var _underscorePlus2 = _interopRequireDefault(_underscorePlus);

'use babel';

var CSONDB = (function () {
  function CSONDB() {
    var _this = this;

    _classCallCheck(this, CSONDB);

    this.emitter = new _atom.Emitter();
    this.updaters = {};

    this.onUpdate(function (projects) {
      for (var project of projects) {
        _this.sendUpdate(project);
      }
    });

    _fs2['default'].exists(this.file(), function (exists) {
      if (exists) {
        _this.observeProjects();
      } else {
        _this.writeFile({});
      }
    });
  }

  _createClass(CSONDB, [{
    key: 'find',
    value: function find() {
      var _this2 = this;

      var callback = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

      this.readFile(function (results) {
        var projects = [];

        for (var key in results) {
          var result = results[key];
          var template = result.template || null;

          if (_this2.isProject(result) === false) {
            continue;
          }

          result._id = key;
          if (template && results[template] !== null) {
            var templateSettings = results[template];
            var projectSettings = result;
            result = _underscorePlus2['default'].deepExtend({}, templateSettings, projectSettings);
          }

          for (var i in result.paths) {
            if (typeof result.paths[i] !== 'string') {
              continue;
            }

            if (result.paths[i].charAt(0) === '~') {
              result.paths[i] = result.paths[i].replace('~', _os2['default'].homedir());
            }
          }

          projects.push(result);
        }

        if (callback) {
          callback(projects);
        }
      });
    }
  }, {
    key: 'isProject',
    value: function isProject(settings) {
      if (typeof settings.paths === 'undefined') {
        return false;
      }

      if (settings.paths.length === 0) {
        return false;
      }

      return true;
    }
  }, {
    key: 'add',
    value: function add(props, callback) {
      var _this3 = this;

      this.readFile(function (projects) {
        var id = _this3.generateID(props.title);
        projects[id] = props;

        _this3.writeFile(projects, function () {
          atom.notifications.addSuccess(props.title + ' has been added');

          if (callback) {
            callback(id);
          }
        });
      });
    }
  }, {
    key: 'update',
    value: function update(props) {
      var _this4 = this;

      if (!props._id) {
        return false;
      }

      var id = props._id;
      delete props._id;

      this.readFile(function (projects) {
        projects[id] = props;
        _this4.writeFile(projects);
      });
    }
  }, {
    key: 'delete',
    value: function _delete(id, callback) {
      var _this5 = this;

      this.readFile(function (projects) {
        for (var key in projects) {
          if (key === id) {
            delete projects[key];
          }
        }

        _this5.writeFile(projects, function () {
          if (callback) {
            callback();
          }
        });
      });
    }
  }, {
    key: 'onUpdate',
    value: function onUpdate() {
      var _this6 = this;

      var callback = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

      this.emitter.on('db-updated', function () {
        _this6.find(callback);
      });
    }
  }, {
    key: 'sendUpdate',
    value: function sendUpdate(project) {
      for (var key in this.updaters) {
        var _updaters$key = this.updaters[key];
        var id = _updaters$key.id;
        var query = _updaters$key.query;
        var callback = _updaters$key.callback;

        if (Object.keys(query).length === 0) {
          callback(project);
        } else if (id === project._id || _underscorePlus2['default'].isEqual(project[query.key], query.value)) {
          callback(project);
        }
      }
    }
  }, {
    key: 'addUpdater',
    value: function addUpdater(id, query, callback) {
      this.updaters[id] = {
        id: id,
        query: query,
        callback: callback
      };
    }
  }, {
    key: 'observeProjects',
    value: function observeProjects() {
      var _this7 = this;

      if (this.fileWatcher) {
        this.fileWatcher.close();
      }

      try {
        this.fileWatcher = _fs2['default'].watch(this.file(), function () {
          _this7.emitter.emit('db-updated');
        });
      } catch (error) {
        var url = 'https://github.com/atom/atom/blob/master/docs/';
        url += 'build-instructions/linux.md#typeerror-unable-to-watch-path';
        var filename = _path2['default'].basename(this.file());
        var errorMessage = '<b>Project Manager</b><br>Could not watch changes\n        to ' + filename + '. Make sure you have permissions to ' + this.file() + '.\n        On linux there can be problems with watch sizes.\n        See <a href=\'' + url + '\'> this document</a> for more info.>';
        this.notifyFailure(errorMessage);
      }
    }
  }, {
    key: 'updateFile',
    value: function updateFile() {
      var _this8 = this;

      _fs2['default'].exists(this.file(true), function (exists) {
        if (!exists) {
          _this8.writeFile({});
        }
      });
    }
  }, {
    key: 'generateID',
    value: function generateID(string) {
      return string.replace(/\s+/g, '').toLowerCase();
    }
  }, {
    key: 'updateFilepath',
    value: function updateFilepath(filepath) {
      this.filepath = filepath;
      this.observeProjects();
    }
  }, {
    key: 'file',
    value: function file() {
      if (this.filepath) {
        return this.filepath;
      }

      var filename = 'projects.cson';
      var filedir = atom.getConfigDirPath();

      if (this.environmentSpecificProjects) {
        var hostname = _os2['default'].hostname().split('.').shift().toLowerCase();
        filename = 'projects.' + hostname + '.cson';
      }

      return filedir + '/' + filename;
    }
  }, {
    key: 'readFile',
    value: function readFile() {
      var callback = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

      var exists = _fs2['default'].existsSync(this.file());
      var projects = null;

      if (exists) {
        try {
          projects = _season2['default'].readFileSync(this.file()) || {};
        } catch (error) {
          console.log(error);
          var message = 'Failed to load ' + _path2['default'].basename(this.file());
          var detail = error.location != null ? error.stack : error.message;
          this.notifyFailure(message, detail);
        }
      } else {
        _fs2['default'].writeFileSync(this.file(), '{}');
        projects = {};
      }

      if (callback) {
        callback(projects);
      }

      return projects;
    }
  }, {
    key: 'writeFile',
    value: function writeFile(projects, callback) {
      try {
        _season2['default'].writeFileSync(this.file(), projects);
      } catch (e) {
        console.log(e);
      }

      if (callback) {
        callback();
      }
    }
  }, {
    key: 'notifyFailure',
    value: function notifyFailure(message) {
      var detail = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

      atom.notifications.addError(message, {
        detail: detail,
        dismissable: true
      });
    }
  }, {
    key: 'environmentSpecificProjects',
    get: function get() {
      return atom.config.get('project-manager.environmentSpecificProjects');
    }
  }]);

  return CSONDB;
})();

exports['default'] = CSONDB;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3dpbGxpYW0vLmF0b20vcGFja2FnZXMvcHJvamVjdC1tYW5hZ2VyL2xpYi9jc29uLWRiLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7b0JBRXNCLE1BQU07O3NCQUNYLFFBQVE7Ozs7a0JBQ1YsSUFBSTs7OztvQkFDRixNQUFNOzs7O2tCQUNSLElBQUk7Ozs7OEJBQ0wsaUJBQWlCOzs7O0FBUC9CLFdBQVcsQ0FBQzs7SUFTUyxNQUFNO0FBQ2QsV0FEUSxNQUFNLEdBQ1g7OzswQkFESyxNQUFNOztBQUV2QixRQUFJLENBQUMsT0FBTyxHQUFHLG1CQUFhLENBQUM7QUFDN0IsUUFBSSxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUM7O0FBRW5CLFFBQUksQ0FBQyxRQUFRLENBQUMsVUFBQyxRQUFRLEVBQUs7QUFDMUIsV0FBSyxJQUFJLE9BQU8sSUFBSSxRQUFRLEVBQUU7QUFDNUIsY0FBSyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUM7T0FDMUI7S0FDRixDQUFDLENBQUM7O0FBRUgsb0JBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsRUFBRSxVQUFDLE1BQU0sRUFBSztBQUNqQyxVQUFJLE1BQU0sRUFBRTtBQUNWLGNBQUssZUFBZSxFQUFFLENBQUM7T0FDeEIsTUFBTTtBQUNMLGNBQUssU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDO09BQ3BCO0tBQ0YsQ0FBQyxDQUFDO0dBQ0o7O2VBbEJrQixNQUFNOztXQXdCckIsZ0JBQWdCOzs7VUFBZixRQUFRLHlEQUFDLElBQUk7O0FBQ2hCLFVBQUksQ0FBQyxRQUFRLENBQUMsVUFBQSxPQUFPLEVBQUk7QUFDdkIsWUFBTSxRQUFRLEdBQUcsRUFBRSxDQUFDOztBQUVwQixhQUFLLElBQU0sR0FBRyxJQUFJLE9BQU8sRUFBRTtBQUN6QixjQUFJLE1BQU0sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDMUIsY0FBTSxRQUFRLEdBQUcsTUFBTSxDQUFDLFFBQVEsSUFB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O1NBQ3JDO09BQ0YsTUFBTTtBQUNMLHdCQUFHLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDcEMsZ0JBQVEsR0FBRyxFQUFFLENBQUM7T0FDZjs7QUFFRCxVQUFJLFFBQVEsRUFBRTtBQUNaLGdCQUFRLENBQUMsUUFBUSxDQUFDLENBQUM7T0FDcEI7O0FBRUQsYUFBTyxRQUFRLENBQUM7S0FDakI7OztXQUVRLG1CQUFDLFFBQVEsRUFBRSxRQUFRLEVBQUU7QUFDNUIsVUFBSTtBQUNGLDRCQUFLLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLEVBQUUsUUFBUSxDQUFDLENBQUM7T0FDM0MsQ0FBQyxPQUFPLENBQUMsRUFBRTtBQUNWLGVBQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7T0FDaEI7O0FBRUQsVUFBSSxRQUFRLEVBQUU7QUFDWixnQkFBUSxFQUFFLENBQUM7T0FDWjtLQUNGOzs7V0FFWSx1QkFBQyxPQUFPLEVBQWU7VUFBYixNQUFNLHlEQUFDLElBQUk7O0FBQ2hDLFVBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRTtBQUNuQyxjQUFNLEVBQUUsTUFBTTtBQUNkLG1CQUFXLEVBQUUsSUFBSTtPQUNsQixDQUFDLENBQUM7S0FDSjs7O1NBOU44QixlQUFHO0FBQ2hDLGFBQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsNkNBQTZDLENBQUMsQ0FBQztLQUN2RTs7O1NBdEJrQixNQUFNOzs7cUJBQU4sTUFBTSIsImZpbGUiOiIvaG9tZS93aWxsaWFtLy5hdG9tL3BhY2thZ2VzL3Byb2plY3QtbWFuYWdlci9saWIvY3Nvbi1kYi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5pbXBvcnQge0VtaXR0ZXJ9IGZyb20gJ2F0b20nO1xuaW1wb3J0IENTT04gZnJvbSAnc2Vhc29uJztcbmltcG9ydCBmcyBmcm9tICdmcyc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCBvcyBmcm9tICdvcyc7XG5pbXBvcnQgXyBmcm9tICd1bmRlcnNjb3JlLXBsdXMnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDU09OREIge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLmVtaXR0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgIHRoaXMudXBkYXRlcnMgPSB7fTtcblxuICAgIHRoaXMub25VcGRhdGUoKHByb2plY3RzKSA9PiB7XG4gICAgICBmb3IgKGxldCBwcm9qZWN0IG9mIHByb2plY3RzKSB7XG4gICAgICAgIHRoaXMuc2VuZFVwZGF0ZShwcm9qZWN0KTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGZzLmV4aXN0cyh0aGlzLmZpbGUoKSwgKGV4aXN0cykgPT4ge1xuICAgICAgaWYgKGV4aXN0cykge1xuICAgICAgICB0aGlzLm9ic2VydmVQcm9qZWN0cygpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy53cml0ZUZpbGUoe30pO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgZ2V0IGVudmlyb25tZW50U3BlY2lmaWNQcm9qZWN0cygpIHtcbiAgICByZXR1cm4gYXRvbS5jb25maWcuZ2V0KCdwcm9qZWN0LW1hbmFnZXIuZW52aXJvbm1lbnRTcGVjaWZpY1Byb2plY3RzJyk7XG4gIH1cblxuICBmaW5kKGNhbGxiYWNrPW51bGwpIHtcbiAgICB0aGlzLnJlYWRGaWxlKHJlc3VsdHMgPT4ge1xuICAgICAgY29uc3QgcHJvamVjdHMgPSBbXTtcblxuICAgICAgZm9yIChjb25zdCBrZXkgaW4gcmVzdWx0cykge1xuICAgICAgICBsZXQgcmVzdWx0ID0gcmVzdWx0c1trZXldO1xuICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IHJlc3VsdC50ZW1wbGF0ZSB8fCBudWxsO1xuXG4gICAgICAgIGlmICh0aGlzLmlzUHJvamVjdChyZXN1bHQpID09PSBmYWxzZSkge1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgcmVzdWx0Ll9pZCA9IGtleTtcbiAgICAgICAgaWYgKHRlbXBsYXRlICYmIHJlc3VsdHNbdGVtcGxhdGVdICE9PSBudWxsKSB7XG4gICAgICAgICAgY29uc3QgdGVtcGxhdGVTZXR0aW5ncyA9IHJlc3VsdHNbdGVtcGxhdGVdO1xuICAgICAgICAgIGNvbnN0IHByb2plY3RTZXR0aW5ncyA9IHJlc3VsdDtcbiAgICAgICAgICByZXN1bHQgPSBfLmRlZXBFeHRlbmQoe30sIHRlbXBsYXRlU2V0dGluZ3MsIHByb2plY3RTZXR0aW5ncyk7XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKGxldCBpIGluIHJlc3VsdC5wYXRocykge1xuICAgICAgICAgIGlmICh0eXBlb2YgcmVzdWx0LnBhdGhzW2ldICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHJlc3VsdC5wYXRoc1tpXS5jaGFyQXQoMCkgPT09ICd+Jykge1xuICAgICAgICAgICAgcmVzdWx0LnBhdGhzW2ldID0gcmVzdWx0LnBhdGhzW2ldLnJlcGxhY2UoJ34nLCBvcy5ob21lZGlyKCkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHByb2plY3RzLnB1c2gocmVzdWx0KTtcbiAgICAgIH1cblxuICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgIGNhbGxiYWNrKHByb2plY3RzKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGlzUHJvamVjdChzZXR0aW5ncykge1xuICAgIGlmICh0eXBlb2Ygc2V0dGluZ3MucGF0aHMgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgaWYgKHNldHRpbmdzLnBhdGhzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgYWRkKHByb3BzLCBjYWxsYmFjaykge1xuICAgIHRoaXMucmVhZEZpbGUocHJvamVjdHMgPT4ge1xuICAgICAgY29uc3QgaWQgPSB0aGlzLmdlbmVyYXRlSUQocHJvcHMudGl0bGUpO1xuICAgICAgcHJvamVjdHNbaWRdID0gcHJvcHM7XG5cbiAgICAgIHRoaXMud3JpdGVGaWxlKHByb2plY3RzLCAoKSA9PiB7XG4gICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRTdWNjZXNzKGAke3Byb3BzLnRpdGxlfSBoYXMgYmVlbiBhZGRlZGApO1xuXG4gICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgIGNhbGxiYWNrKGlkKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICB1cGRhdGUocHJvcHMpIHtcbiAgICBpZiAoIXByb3BzLl9pZCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGNvbnN0IGlkID0gcHJvcHMuX2lkO1xuICAgIGRlbGV0ZSBwcm9wcy5faWQ7XG5cbiAgICB0aGlzLnJlYWRGaWxlKHByb2plY3RzID0+IHtcbiAgICAgIHByb2plY3RzW2lkXSA9IHByb3BzO1xuICAgICAgdGhpcy53cml0ZUZpbGUocHJvamVjdHMpO1xuICAgIH0pO1xuICB9XG5cbiAgZGVsZXRlKGlkLCBjYWxsYmFjaykge1xuICAgIHRoaXMucmVhZEZpbGUocHJvamVjdHMgPT4ge1xuICAgICAgZm9yIChsZXQga2V5IGluIHByb2plY3RzKSB7XG4gICAgICAgIGlmIChrZXkgPT09IGlkKSB7XG4gICAgICAgICAgZGVsZXRlKHByb2plY3RzW2tleV0pO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRoaXMud3JpdGVGaWxlKHByb2plY3RzLCAoKSA9PiB7XG4gICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgb25VcGRhdGUoY2FsbGJhY2s9bnVsbCkge1xuICAgIHRoaXMuZW1pdHRlci5vbignZGItdXBkYXRlZCcsICgpID0+IHtcbiAgICAgIHRoaXMuZmluZChjYWxsYmFjayk7XG4gICAgfSk7XG4gIH1cblxuICBzZW5kVXBkYXRlKHByb2plY3QpIHtcbiAgICBmb3IgKGxldCBrZXkgaW4gdGhpcy51cGRhdGVycykge1xuICAgICAgY29uc3Qge2lkLCBxdWVyeSwgY2FsbGJhY2t9ID0gdGhpcy51cGRhdGVyc1trZXldO1xuXG4gICAgICBpZiAoT2JqZWN0LmtleXMocXVlcnkpLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICBjYWxsYmFjayhwcm9qZWN0KTtcbiAgICAgIH0gZWxzZSBpZiAoaWQgPT09IHByb2plY3QuX2lkIHx8XG4gICAgICAgIF8uaXNFcXVhbChwcm9qZWN0W3F1ZXJ5LmtleV0sIHF1ZXJ5LnZhbHVlKSkge1xuICAgICAgICBjYWxsYmFjayhwcm9qZWN0KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBhZGRVcGRhdGVyKGlkLCBxdWVyeSwgY2FsbGJhY2spIHtcbiAgICB0aGlzLnVwZGF0ZXJzW2lkXSA9IHtcbiAgICAgIGlkLFxuICAgICAgcXVlcnksXG4gICAgICBjYWxsYmFja1xuICAgIH07XG4gIH1cblxuICBvYnNlcnZlUHJvamVjdHMoKSB7XG4gICAgaWYgKHRoaXMuZmlsZVdhdGNoZXIpIHtcbiAgICAgIHRoaXMuZmlsZVdhdGNoZXIuY2xvc2UoKTtcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgdGhpcy5maWxlV2F0Y2hlciA9IGZzLndhdGNoKHRoaXMuZmlsZSgpLCAoKSA9PiB7XG4gICAgICAgIHRoaXMuZW1pdHRlci5lbWl0KCdkYi11cGRhdGVkJyk7XG4gICAgICB9KTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgbGV0IHVybCA9ICdodHRwczovL2dpdGh1Yi5jb20vYXRvbS9hdG9tL2Jsb2IvbWFzdGVyL2RvY3MvJztcbiAgICAgIHVybCArPSAnYnVpbGQtaW5zdHJ1Y3Rpb25zL2xpbnV4Lm1kI3R5cGVlcnJvci11bmFibGUtdG8td2F0Y2gtcGF0aCc7XG4gICAgICBjb25zdCBmaWxlbmFtZSA9IHBhdGguYmFzZW5hbWUodGhpcy5maWxlKCkpO1xuICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYDxiPlByb2plY3QgTWFuYWdlcjwvYj48YnI+Q291bGQgbm90IHdhdGNoIGNoYW5nZXNcbiAgICAgICAgdG8gJHtmaWxlbmFtZX0uIE1ha2Ugc3VyZSB5b3UgaGF2ZSBwZXJtaXNzaW9ucyB0byAke3RoaXMuZmlsZSgpfS5cbiAgICAgICAgT24gbGludXggdGhlcmUgY2FuIGJlIHByb2JsZW1zIHdpdGggd2F0Y2ggc2l6ZXMuXG4gICAgICAgIFNlZSA8YSBocmVmPScke3VybH0nPiB0aGlzIGRvY3VtZW50PC9hPiBmb3IgbW9yZSBpbmZvLj5gO1xuICAgICAgdGhpcy5ub3RpZnlGYWlsdXJlKGVycm9yTWVzc2FnZSk7XG4gICAgfVxuICB9XG5cbiAgdXBkYXRlRmlsZSgpIHtcbiAgICBmcy5leGlzdHModGhpcy5maWxlKHRydWUpLCAoZXhpc3RzKSA9PiB7XG4gICAgICBpZiAoIWV4aXN0cykge1xuICAgICAgICB0aGlzLndyaXRlRmlsZSh7fSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBnZW5lcmF0ZUlEKHN0cmluZykge1xuICAgIHJldHVybiBzdHJpbmcucmVwbGFjZSgvXFxzKy9nLCAnJykudG9Mb3dlckNhc2UoKTtcbiAgfVxuXG4gIHVwZGF0ZUZpbGVwYXRoKGZpbGVwYXRoKSB7XG4gICAgdGhpcy5maWxlcGF0aCA9IGZpbGVwYXRoO1xuICAgIHRoaXMub2JzZXJ2ZVByb2plY3RzKCk7XG4gIH1cblxuICBmaWxlKCkge1xuICAgIGlmICh0aGlzLmZpbGVwYXRoKSB7XG4gICAgICByZXR1cm4gdGhpcy5maWxlcGF0aDtcbiAgICB9XG5cbiAgICBsZXQgZmlsZW5hbWUgPSAncHJvamVjdHMuY3Nvbic7XG4gICAgY29uc3QgZmlsZWRpciA9IGF0b20uZ2V0Q29uZmlnRGlyUGF0aCgpO1xuXG4gICAgaWYgKHRoaXMuZW52aXJvbm1lbnRTcGVjaWZpY1Byb2plY3RzKSB7XG4gICAgICBsZXQgaG9zdG5hbWUgPSBvcy5ob3N0bmFtZSgpLnNwbGl0KCcuJykuc2hpZnQoKS50b0xvd2VyQ2FzZSgpO1xuICAgICAgZmlsZW5hbWUgPSBgcHJvamVjdHMuJHtob3N0bmFtZX0uY3NvbmA7XG4gICAgfVxuXG4gICAgcmV0dXJuIGAke2ZpbGVkaXJ9LyR7ZmlsZW5hbWV9YDtcbiAgfVxuXG4gIHJlYWRGaWxlKGNhbGxiYWNrPW51bGwpIHtcbiAgICBjb25zdCBleGlzdHMgPSBmcy5leGlzdHNTeW5jKHRoaXMuZmlsZSgpKTtcbiAgICBsZXQgcHJvamVjdHMgPSBudWxsO1xuXG4gICAgaWYgKGV4aXN0cykge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcHJvamVjdHMgPSBDU09OLnJlYWRGaWxlU3luYyh0aGlzLmZpbGUoKSkgfHwge307XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmxvZyhlcnJvcik7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBgRmFpbGVkIHRvIGxvYWQgJHtwYXRoLmJhc2VuYW1lKHRoaXMuZmlsZSgpKX1gO1xuICAgICAgICBjb25zdCBkZXRhaWwgPSBlcnJvci5sb2NhdGlvbiAhPSBudWxsID8gZXJyb3Iuc3RhY2sgOiBlcnJvci5tZXNzYWdlO1xuICAgICAgICB0aGlzLm5vdGlmeUZhaWx1cmUobWVzc2FnZSwgZGV0YWlsKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgZnMud3JpdGVGaWxlU3luYyh0aGlzLmZpbGUoKSwgJ3t9Jyk7XG4gICAgICBwcm9qZWN0cyA9IHt9O1xuICAgIH1cblxuICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgY2FsbGJhY2socHJvamVjdHMpO1xuICAgIH1cblxuICAgIHJldHVybiBwcm9qZWN0cztcbiAgfVxuXG4gIHdyaXRlRmlsZShwcm9qZWN0cywgY2FsbGJhY2spIHtcbiAgICB0cnkge1xuICAgICAgQ1NPTi53cml0ZUZpbGVTeW5jKHRoaXMuZmlsZSgpLCBwcm9qZWN0cyk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgY29uc29sZS5sb2coZSk7XG4gICAgfVxuXG4gICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICBjYWxsYmFjaygpO1xuICAgIH1cbiAgfVxuXG4gIG5vdGlmeUZhaWx1cmUobWVzc2FnZSwgZGV0YWlsPW51bGwpIHtcbiAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IobWVzc2FnZSwge1xuICAgICAgZGV0YWlsOiBkZXRhaWwsXG4gICAgICBkaXNtaXNzYWJsZTogdHJ1ZVxuICAgIH0pO1xuICB9XG59XG4iXX0=
//# sourceURL=/home/william/.atom/packages/project-manager/lib/cson-db.js
