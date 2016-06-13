Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _underscorePlus = require('underscore-plus');

var _underscorePlus2 = _interopRequireDefault(_underscorePlus);

'use babel';

var Settings = (function () {
  function Settings() {
    _classCallCheck(this, Settings);
  }

  _createClass(Settings, [{
    key: 'update',
    value: function update() {
      var settings = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      this.load(settings);
    }
  }, {
    key: 'load',
    value: function load() {
      var settings = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      if ('global' in settings) {
        settings['*'] = settings.global;
        delete settings.global;
      }

      if ('*' in settings) {
        var scopedSettings = settings;
        settings = settings['*'];
        delete scopedSettings['*'];

        var setting = undefined;
        var scope = undefined;
        for (scope in scopedSettings) {
          setting = scopedSettings[scope];
          this.set(setting, scope);
        }
      }

      this.set(settings);
    }
  }, {
    key: 'set',
    value: function set(settings, scope) {
      var flatSettings = {};
      var setting = undefined;
      var value = undefined;
      var valueOptions = undefined;
      var currentValue = undefined;
      var options = scope ? { scopeSelector: scope } : {};
      options.save = false;
      this.flatten(flatSettings, settings);

      for (setting in flatSettings) {
        value = flatSettings[setting];

        atom.config.set(setting, value, options);
      }
    }
  }, {
    key: 'flatten',
    value: function flatten(root, dict, path) {
      var key = undefined;
      var value = undefined;
      var dotPath = undefined;
      var isObject = undefined;
      for (key in dict) {
        value = dict[key];
        dotPath = path ? path + '.' + key : key;
        isObject = !_underscorePlus2['default'].isArray(value) && _underscorePlus2['default'].isObject(value);

        if (isObject) {
          this.flatten(root, dict[key], dotPath);
        } else {
          root[dotPath] = value;
        }
      }
    }
  }]);

  return Settings;
})();

exports['default'] = Settings;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3dpbGxpYW0vLmF0b20vcGFja2FnZXMvcHJvamVjdC1tYW5hZ2VyL2xpYi9zZXR0aW5ncy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OzhCQUVjLGlCQUFpQjs7OztBQUYvQixXQUFXLENBQUM7O0lBSVMsUUFBUTtXQUFSLFFBQVE7MEJBQVIsUUFBUTs7O2VBQVIsUUFBUTs7V0FDckIsa0JBQWM7VUFBYixRQUFRLHlEQUFDLEVBQUU7O0FBQ2hCLFVBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7S0FDckI7OztXQUVHLGdCQUFjO1VBQWIsUUFBUSx5REFBQyxFQUFFOztBQUNkLFVBQUksUUFBUSxJQUFJLFFBQVEsRUFBRTtBQUN4QixnQkFBUSxDQUFDLEdBQUcsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUM7QUFDaEMsZUFBTyxRQUFRLENBQUMsTUFBTSxDQUFDO09BQ3hCOztBQUVELFVBQUksR0FBRyxJQUFJLFFBQVEsRUFBRTtBQUNuQixZQUFJLGNBQWMsR0FBRyxRQUFRLENBQUM7QUFDOUIsZ0JBQVEsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDekIsZUFBTyxjQUFjLENBQUMsR0FBRyxDQUFDLENBQUM7O0FBRTNCLFlBQUksT0FBTyxZQUFBLENBQUM7QUFDWixZQUFJLEtBQUssWUFBQSxDQUFDO0FBQ1YsYUFBSyxLQUFLLElBQUksY0FBYyxFQUFFO0FBQzVCLGlCQUFPLEdBQUcsY0FBYyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ2hDLGNBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO1NBQzFCO09BQ0Y7O0FBRUQsVUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztLQUNwQjs7O1dBRUUsYUFBQyxRQUFRLEVBQUUsS0FBSyxFQUFFO0FBQ25CLFVBQUksWUFBWSxHQUFHLEVBQUUsQ0FBQztBQUN0QixVQUFJLE9BQU8sWUFBQSxDQUFDO0FBQ1osVUFBSSxLQUFLLFlBQUEsQ0FBQztBQUNWLFVBQUksWUFBWSxZQUFBLENBQUM7QUFDakIsVUFBSSxZQUFZLFlBQUEsQ0FBQztBQUNqQixVQUFJLE9BQU8sR0FBRyxLQUFLLEdBQUcsRUFBQyxhQUFhLEVBQUUsS0FBSyxFQUFDLEdBQUcsRUFBRSxDQUFDO0FBQ2xELGFBQU8sQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFDO0FBQ3JCLFVBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxFQUFFLFFBQVEsQ0FBQyxDQUFDOztBQUVyQyxXQUFLLE9BQU8sSUFBSSxZQUFZLEVBQUU7QUFDNUIsYUFBSyxHQUFHLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQzs7QUFFOUIsWUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQztPQUMxQztLQUNGOzs7V0FFTSxpQkFBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRTtBQUN4QixVQUFJLEdBQUcsWUFBQSxDQUFDO0FBQ1IsVUFBSSxLQUFLLFlBQUEsQ0FBQztBQUNWLFVBQUksT0FBTyxZQUFBLENBQUM7QUFDWixVQUFJLFFBQVEsWUFBQSxDQUFDO0FBQ2IsV0FBSyxHQUFHLElBQUksSUFBSSxFQUFFO0FBQ2hCLGFBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDbEIsZUFBTyxHQUFHLElBQUksR0FBTSxJQUFJLFNBQUksR0FBRyxHQUFLLEdBQUcsQ0FBQztBQUN4QyxnQkFBUSxHQUFHLENBQUMsNEJBQUUsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLDRCQUFFLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQzs7QUFFbEQsWUFBSSxRQUFRLEVBQUU7QUFDWixjQUFJLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUM7U0FDeEMsTUFBTTtBQUNMLGNBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxLQUFLLENBQUM7U0FDdkI7T0FDRjtLQUNGOzs7U0E1RGtCLFFBQVE7OztxQkFBUixRQUFRIiwiZmlsZSI6Ii9ob21lL3dpbGxpYW0vLmF0b20vcGFja2FnZXMvcHJvamVjdC1tYW5hZ2VyL2xpYi9zZXR0aW5ncy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5pbXBvcnQgXyBmcm9tICd1bmRlcnNjb3JlLXBsdXMnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTZXR0aW5ncyB7XG4gIHVwZGF0ZShzZXR0aW5ncz17fSkge1xuICAgIHRoaXMubG9hZChzZXR0aW5ncyk7XG4gIH1cblxuICBsb2FkKHNldHRpbmdzPXt9KSB7XG4gICAgaWYgKCdnbG9iYWwnIGluIHNldHRpbmdzKSB7XG4gICAgICBzZXR0aW5nc1snKiddID0gc2V0dGluZ3MuZ2xvYmFsO1xuICAgICAgZGVsZXRlIHNldHRpbmdzLmdsb2JhbDtcbiAgICB9XG5cbiAgICBpZiAoJyonIGluIHNldHRpbmdzKSB7XG4gICAgICBsZXQgc2NvcGVkU2V0dGluZ3MgPSBzZXR0aW5ncztcbiAgICAgIHNldHRpbmdzID0gc2V0dGluZ3NbJyonXTtcbiAgICAgIGRlbGV0ZSBzY29wZWRTZXR0aW5nc1snKiddO1xuXG4gICAgICBsZXQgc2V0dGluZztcbiAgICAgIGxldCBzY29wZTtcbiAgICAgIGZvciAoc2NvcGUgaW4gc2NvcGVkU2V0dGluZ3MpIHtcbiAgICAgICAgc2V0dGluZyA9IHNjb3BlZFNldHRpbmdzW3Njb3BlXTtcbiAgICAgICAgdGhpcy5zZXQoc2V0dGluZywgc2NvcGUpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuc2V0KHNldHRpbmdzKTtcbiAgfVxuXG4gIHNldChzZXR0aW5ncywgc2NvcGUpIHtcbiAgICBsZXQgZmxhdFNldHRpbmdzID0ge307XG4gICAgbGV0IHNldHRpbmc7XG4gICAgbGV0IHZhbHVlO1xuICAgIGxldCB2YWx1ZU9wdGlvbnM7XG4gICAgbGV0IGN1cnJlbnRWYWx1ZTtcbiAgICBsZXQgb3B0aW9ucyA9IHNjb3BlID8ge3Njb3BlU2VsZWN0b3I6IHNjb3BlfSA6IHt9O1xuICAgIG9wdGlvbnMuc2F2ZSA9IGZhbHNlO1xuICAgIHRoaXMuZmxhdHRlbihmbGF0U2V0dGluZ3MsIHNldHRpbmdzKTtcblxuICAgIGZvciAoc2V0dGluZyBpbiBmbGF0U2V0dGluZ3MpIHtcbiAgICAgIHZhbHVlID0gZmxhdFNldHRpbmdzW3NldHRpbmddO1xuXG4gICAgICBhdG9tLmNvbmZpZy5zZXQoc2V0dGluZywgdmFsdWUsIG9wdGlvbnMpO1xuICAgIH1cbiAgfVxuXG4gIGZsYXR0ZW4ocm9vdCwgZGljdCwgcGF0aCkge1xuICAgIGxldCBrZXk7XG4gICAgbGV0IHZhbHVlO1xuICAgIGxldCBkb3RQYXRoO1xuICAgIGxldCBpc09iamVjdDtcbiAgICBmb3IgKGtleSBpbiBkaWN0KSB7XG4gICAgICB2YWx1ZSA9IGRpY3Rba2V5XTtcbiAgICAgIGRvdFBhdGggPSBwYXRoID8gYCR7cGF0aH0uJHtrZXl9YCA6IGtleTtcbiAgICAgIGlzT2JqZWN0ID0gIV8uaXNBcnJheSh2YWx1ZSkgJiYgXy5pc09iamVjdCh2YWx1ZSk7XG5cbiAgICAgIGlmIChpc09iamVjdCkge1xuICAgICAgICB0aGlzLmZsYXR0ZW4ocm9vdCwgZGljdFtrZXldLCBkb3RQYXRoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJvb3RbZG90UGF0aF0gPSB2YWx1ZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cbiJdfQ==
//# sourceURL=/home/william/.atom/packages/project-manager/lib/settings.js
