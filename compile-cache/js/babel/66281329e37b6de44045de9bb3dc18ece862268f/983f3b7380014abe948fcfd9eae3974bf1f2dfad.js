function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _atom = require('atom');

'use babel';

module.exports = {
  config: {
    executablePath: {
      type: 'string',
      'default': _path2['default'].join(__dirname, '..', 'node_modules', 'jshint', 'bin', 'jshint'),
      description: 'Path of the `jshint` node script'
    },
    lintInlineJavaScript: {
      type: 'boolean',
      'default': false,
      description: 'Lint JavaScript inside `<script>` blocks in HTML or PHP files.'
    },
    disableWhenNoJshintrcFileInPath: {
      type: 'boolean',
      'default': false,
      description: 'Disable linter when no `.jshintrc` is found in project.'
    },
    lintJSXFiles: {
      title: 'Lint JSX Files',
      type: 'boolean',
      'default': false
    }
  },

  activate: function activate() {
    var _this = this;

    require('atom-package-deps').install('linter-jshint');
    this.scopes = ['source.js', 'source.js-semantic'];
    this.subscriptions = new _atom.CompositeDisposable();
    this.subscriptions.add(atom.config.observe('linter-jshint.executablePath', function (executablePath) {
      _this.executablePath = executablePath;
    }));
    this.subscriptions.add(atom.config.observe('linter-jshint.disableWhenNoJshintrcFileInPath', function (disableWhenNoJshintrcFileInPath) {
      _this.disableWhenNoJshintrcFileInPath = disableWhenNoJshintrcFileInPath;
    }));

    var scopeJSX = 'source.js.jsx';
    this.subscriptions.add(atom.config.observe('linter-jshint.lintJSXFiles', function (lintJSXFiles) {
      _this.lintJSXFiles = lintJSXFiles;
      if (lintJSXFiles) {
        _this.scopes.push(scopeJSX);
      } else {
        if (_this.scopes.indexOf(scopeJSX) !== -1) {
          _this.scopes.splice(_this.scopes.indexOf(scopeJSX), 1);
        }
      }
    }));

    var scopeEmbedded = 'source.js.embedded.html';
    this.subscriptions.add(atom.config.observe('linter-jshint.lintInlineJavaScript', function (lintInlineJavaScript) {
      _this.lintInlineJavaScript = lintInlineJavaScript;
      if (lintInlineJavaScript) {
        _this.scopes.push(scopeEmbedded);
      } else {
        if (_this.scopes.indexOf(scopeEmbedded) !== -1) {
          _this.scopes.splice(_this.scopes.indexOf(scopeEmbedded), 1);
        }
      }
    }));
  },

  deactivate: function deactivate() {
    this.subscriptions.dispose();
  },

  provideLinter: function provideLinter() {
    var _this2 = this;

    var Helpers = require('atom-linter');
    var Reporter = require('jshint-json');

    return {
      name: 'JSHint',
      grammarScopes: this.scopes,
      scope: 'file',
      lintOnFly: true,
      lint: _asyncToGenerator(function* (textEditor) {
        var results = [];
        var filePath = textEditor.getPath();
        var fileContents = textEditor.getText();
        var parameters = ['--reporter', Reporter, '--filename', filePath];

        var configFile = null;
        if (_this2.disableWhenNoJshintrcFileInPath) {
          configFile = yield Helpers.findCachedAsync(_path2['default'].dirname(filePath), '.jshintrc');
          if (configFile) {
            parameters.push('--config', configFile);
          } else {
            return results;
          }
        }
        if (_this2.lintInlineJavaScript && textEditor.getGrammar().scopeName.indexOf('text.html') !== -1) {
          parameters.push('--extract', 'always');
        }
        parameters.push('-');

        var result = yield Helpers.execNode(_this2.executablePath, parameters, { stdin: fileContents });
        var parsed = undefined;
        try {
          parsed = JSON.parse(result);
        } catch (_) {
          console.error('[Linter-JSHint]', _, result);
          atom.notifications.addWarning('[Linter-JSHint]', { detail: 'JSHint return an invalid response, check your console for more info' });
          return results;
        }

        for (var entry of parsed.result) {
          if (!entry.error.id) {
            continue;
          }

          var error = entry.error;
          var errorType = error.code.substr(0, 1);
          var errorLine = error.line > 0 ? error.line - 1 : 0;
          var range = undefined;

          // TODO: Remove workaround of jshint/jshint#2846
          if (error.character === null) {
            range = Helpers.rangeFromLineNumber(textEditor, errorLine);
          } else {
            var character = error.character > 0 ? error.character - 1 : 0;
            var line = errorLine;
            var buffer = textEditor.getBuffer();
            var maxLine = buffer.getLineCount();
            // TODO: Remove workaround of jshint/jshint#2894
            if (errorLine >= maxLine) {
              line = maxLine;
            }
            var maxCharacter = buffer.lineLengthForRow(line);
            // TODO: Remove workaround of jquery/esprima#1457
            if (character > maxCharacter) {
              character = maxCharacter;
            }
            range = Helpers.rangeFromLineNumber(textEditor, line, character);
          }

          results.push({
            type: errorType === 'E' ? 'Error' : errorType === 'W' ? 'Warning' : 'Info',
            html: '<a href="http://jslinterrors.com/' + error.code + '">' + error.code + '</a> - ' + error.reason,
            filePath: filePath,
            range: range
          });
        }
        return results;
      })
    };
  }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3dpbGxpYW0vLmF0b20vcGFja2FnZXMvbGludGVyLWpzaGludC9saWIvbWFpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O29CQUlpQixNQUFNOzs7O29CQUNhLE1BQU07O0FBTDFDLFdBQVcsQ0FBQTs7QUFTWCxNQUFNLENBQUMsT0FBTyxHQUFHO0FBQ2YsUUFBTSxFQUFFO0FBQ04sa0JBQWMsRUFBRTtBQUNkLFVBQUksRUFBRSxRQUFRO0FBQ2QsaUJBQVMsa0JBQUssSUFBSSxDQUFDLFNBQVMsRUFBRSxJQUFJLEVBQUUsY0FBYyxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsUUFBUSxDQUFDO0FBQzlFLGlCQUFXLEVBQUUsa0NBQWtDO0tBQ2hEO0FBQ0Qsd0JBQW9CLEVBQUU7QUFDcEIsVUFBSSxFQUFFLFNBQVM7QUFDZixpQkFBUyxLQUFLO0FBQ2QsaUJBQVcsRUFBRSxnRUFBZ0U7S0FDOUU7QUFDRCxtQ0FBK0IsRUFBRTtBQUMvQixVQUFJLEVBQUUsU0FBUztBQUNmLGlCQUFTLEtBQUs7QUFDZCxpQkFBVyxFQUFFLHlEQUF5RDtLQUN2RTtBQUNELGdCQUFZLEVBQUU7QUFDWixXQUFLLEVBQUUsZ0JBQWdCO0FBQ3ZCLFVBQUksRUFBRSxTQUFTO0FBQ2YsaUJBQVMsS0FBSztLQUNmO0dBQ0Y7O0FBRUQsVUFBUSxFQUFBLG9CQUFHOzs7QUFDVCxXQUFPLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUE7QUFDckQsUUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLFdBQVcsRUFBRSxvQkFBb0IsQ0FBQyxDQUFBO0FBQ2pELFFBQUksQ0FBQyxhQUFhLEdBQUcsK0JBQXlCLENBQUE7QUFDOUMsUUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsOEJBQThCLEVBQUUsVUFBQSxjQUFjLEVBQUk7QUFDM0YsWUFBSyxjQUFjLEdBQUcsY0FBYyxDQUFBO0tB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QUFPLENBQUE7T0FDZixDQUFBO0tBQ0YsQ0FBQTtHQUNGO0NBQ0YsQ0FBQSIsImZpbGUiOiIvaG9tZS93aWxsaWFtLy5hdG9tL3BhY2thZ2VzL2xpbnRlci1qc2hpbnQvbGliL21haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJ1xuXG4vKiBAZmxvdyAqL1xuXG5pbXBvcnQgUGF0aCBmcm9tICdwYXRoJ1xuaW1wb3J0IHsgQ29tcG9zaXRlRGlzcG9zYWJsZSB9IGZyb20gJ2F0b20nXG5cbnR5cGUgTGludGVyJFByb3ZpZGVyID0gT2JqZWN0XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBjb25maWc6IHtcbiAgICBleGVjdXRhYmxlUGF0aDoge1xuICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICBkZWZhdWx0OiBQYXRoLmpvaW4oX19kaXJuYW1lLCAnLi4nLCAnbm9kZV9tb2R1bGVzJywgJ2pzaGludCcsICdiaW4nLCAnanNoaW50JyksXG4gICAgICBkZXNjcmlwdGlvbjogJ1BhdGggb2YgdGhlIGBqc2hpbnRgIG5vZGUgc2NyaXB0J1xuICAgIH0sXG4gICAgbGludElubGluZUphdmFTY3JpcHQ6IHtcbiAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgZGVzY3JpcHRpb246ICdMaW50IEphdmFTY3JpcHQgaW5zaWRlIGA8c2NyaXB0PmAgYmxvY2tzIGluIEhUTUwgb3IgUEhQIGZpbGVzLidcbiAgICB9LFxuICAgIGRpc2FibGVXaGVuTm9Kc2hpbnRyY0ZpbGVJblBhdGg6IHtcbiAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgZGVzY3JpcHRpb246ICdEaXNhYmxlIGxpbnRlciB3aGVuIG5vIGAuanNoaW50cmNgIGlzIGZvdW5kIGluIHByb2plY3QuJ1xuICAgIH0sXG4gICAgbGludEpTWEZpbGVzOiB7XG4gICAgICB0aXRsZTogJ0xpbnQgSlNYIEZpbGVzJyxcbiAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgfVxuICB9LFxuXG4gIGFjdGl2YXRlKCkge1xuICAgIHJlcXVpcmUoJ2F0b20tcGFja2FnZS1kZXBzJykuaW5zdGFsbCgnbGludGVyLWpzaGludCcpXG4gICAgdGhpcy5zY29wZXMgPSBbJ3NvdXJjZS5qcycsICdzb3VyY2UuanMtc2VtYW50aWMnXVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29uZmlnLm9ic2VydmUoJ2xpbnRlci1qc2hpbnQuZXhlY3V0YWJsZVBhdGgnLCBleGVjdXRhYmxlUGF0aCA9PiB7XG4gICAgICB0aGlzLmV4ZWN1dGFibGVQYXRoID0gZXhlY3V0YWJsZVBhdGhcbiAgICB9KSlcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgYXRvbS5jb25maWcub2JzZXJ2ZSgnbGludGVyLWpzaGludC5kaXNhYmxlV2hlbk5vSnNoaW50cmNGaWxlSW5QYXRoJyxcbiAgICAgICAgZGlzYWJsZVdoZW5Ob0pzaGludHJjRmlsZUluUGF0aCA9PiB7XG4gICAgICAgICAgdGhpcy5kaXNhYmxlV2hlbk5vSnNoaW50cmNGaWxlSW5QYXRoID0gZGlzYWJsZVdoZW5Ob0pzaGludHJjRmlsZUluUGF0aFxuICAgICAgICB9XG4gICAgICApXG4gICAgKVxuXG4gICAgY29uc3Qgc2NvcGVKU1ggPSAnc291cmNlLmpzLmpzeCdcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29uZmlnLm9ic2VydmUoJ2xpbnRlci1qc2hpbnQubGludEpTWEZpbGVzJywgbGludEpTWEZpbGVzID0+IHtcbiAgICAgIHRoaXMubGludEpTWEZpbGVzID0gbGludEpTWEZpbGVzXG4gICAgICBpZiAobGludEpTWEZpbGVzKSB7XG4gICAgICAgIHRoaXMuc2NvcGVzLnB1c2goc2NvcGVKU1gpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAodGhpcy5zY29wZXMuaW5kZXhPZihzY29wZUpTWCkgIT09IC0xKSB7XG4gICAgICAgICAgdGhpcy5zY29wZXMuc3BsaWNlKHRoaXMuc2NvcGVzLmluZGV4T2Yoc2NvcGVKU1gpLCAxKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSkpXG5cbiAgICBjb25zdCBzY29wZUVtYmVkZGVkID0gJ3NvdXJjZS5qcy5lbWJlZGRlZC5odG1sJ1xuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb25maWcub2JzZXJ2ZSgnbGludGVyLWpzaGludC5saW50SW5saW5lSmF2YVNjcmlwdCcsXG4gICAgICBsaW50SW5saW5lSmF2YVNjcmlwdCA9PiB7XG4gICAgICAgIHRoaXMubGludElubGluZUphdmFTY3JpcHQgPSBsaW50SW5saW5lSmF2YVNjcmlwdFxuICAgICAgICBpZiAobGludElubGluZUphdmFTY3JpcHQpIHtcbiAgICAgICAgICB0aGlzLnNjb3Blcy5wdXNoKHNjb3BlRW1iZWRkZWQpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKHRoaXMuc2NvcGVzLmluZGV4T2Yoc2NvcGVFbWJlZGRlZCkgIT09IC0xKSB7XG4gICAgICAgICAgICB0aGlzLnNjb3Blcy5zcGxpY2UodGhpcy5zY29wZXMuaW5kZXhPZihzY29wZUVtYmVkZGVkKSwgMSlcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICApKVxuICB9LFxuXG4gIGRlYWN0aXZhdGUoKSB7XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICB9LFxuXG4gIHByb3ZpZGVMaW50ZXIoKTogTGludGVyJFByb3ZpZGVyIHtcbiAgICBjb25zdCBIZWxwZXJzID0gcmVxdWlyZSgnYXRvbS1saW50ZXInKVxuICAgIGNvbnN0IFJlcG9ydGVyID0gcmVxdWlyZSgnanNoaW50LWpzb24nKVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIG5hbWU6ICdKU0hpbnQnLFxuICAgICAgZ3JhbW1hclNjb3BlczogdGhpcy5zY29wZXMsXG4gICAgICBzY29wZTogJ2ZpbGUnLFxuICAgICAgbGludE9uRmx5OiB0cnVlLFxuICAgICAgbGludDogYXN5bmMgKHRleHRFZGl0b3IpID0+IHtcbiAgICAgICAgY29uc3QgcmVzdWx0cyA9IFtdXG4gICAgICAgIGNvbnN0IGZpbGVQYXRoID0gdGV4dEVkaXRvci5nZXRQYXRoKClcbiAgICAgICAgY29uc3QgZmlsZUNvbnRlbnRzID0gdGV4dEVkaXRvci5nZXRUZXh0KClcbiAgICAgICAgY29uc3QgcGFyYW1ldGVycyA9IFsnLS1yZXBvcnRlcicsIFJlcG9ydGVyLCAnLS1maWxlbmFtZScsIGZpbGVQYXRoXVxuXG4gICAgICAgIGxldCBjb25maWdGaWxlID0gbnVsbFxuICAgICAgICBpZiAodGhpcy5kaXNhYmxlV2hlbk5vSnNoaW50cmNGaWxlSW5QYXRoKSB7XG4gICAgICAgICAgY29uZmlnRmlsZSA9IGF3YWl0IEhlbHBlcnMuZmluZENhY2hlZEFzeW5jKFBhdGguZGlybmFtZShmaWxlUGF0aCksICcuanNoaW50cmMnKVxuICAgICAgICAgIGlmIChjb25maWdGaWxlKSB7XG4gICAgICAgICAgICBwYXJhbWV0ZXJzLnB1c2goJy0tY29uZmlnJywgY29uZmlnRmlsZSlcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdHNcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMubGludElubGluZUphdmFTY3JpcHQgJiZcbiAgICAgICAgICB0ZXh0RWRpdG9yLmdldEdyYW1tYXIoKS5zY29wZU5hbWUuaW5kZXhPZigndGV4dC5odG1sJykgIT09IC0xXG4gICAgICAgICkge1xuICAgICAgICAgIHBhcmFtZXRlcnMucHVzaCgnLS1leHRyYWN0JywgJ2Fsd2F5cycpXG4gICAgICAgIH1cbiAgICAgICAgcGFyYW1ldGVycy5wdXNoKCctJylcblxuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBIZWxwZXJzLmV4ZWNOb2RlKFxuICAgICAgICAgIHRoaXMuZXhlY3V0YWJsZVBhdGgsIHBhcmFtZXRlcnMsIHsgc3RkaW46IGZpbGVDb250ZW50cyB9XG4gICAgICAgIClcbiAgICAgICAgbGV0IHBhcnNlZFxuICAgICAgICB0cnkge1xuICAgICAgICAgIHBhcnNlZCA9IEpTT04ucGFyc2UocmVzdWx0KVxuICAgICAgICB9IGNhdGNoIChfKSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcignW0xpbnRlci1KU0hpbnRdJywgXywgcmVzdWx0KVxuICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nKCdbTGludGVyLUpTSGludF0nLFxuICAgICAgICAgICAgeyBkZXRhaWw6ICdKU0hpbnQgcmV0dXJuIGFuIGludmFsaWQgcmVzcG9uc2UsIGNoZWNrIHlvdXIgY29uc29sZSBmb3IgbW9yZSBpbmZvJyB9XG4gICAgICAgICAgKVxuICAgICAgICAgIHJldHVybiByZXN1bHRzXG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKGNvbnN0IGVudHJ5IG9mIHBhcnNlZC5yZXN1bHQpIHtcbiAgICAgICAgICBpZiAoIWVudHJ5LmVycm9yLmlkKSB7XG4gICAgICAgICAgICBjb250aW51ZVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnN0IGVycm9yID0gZW50cnkuZXJyb3JcbiAgICAgICAgICBjb25zdCBlcnJvclR5cGUgPSBlcnJvci5jb2RlLnN1YnN0cigwLCAxKVxuICAgICAgICAgIGNvbnN0IGVycm9yTGluZSA9IGVycm9yLmxpbmUgPiAwID8gZXJyb3IubGluZSAtIDEgOiAwXG4gICAgICAgICAgbGV0IHJhbmdlXG5cbiAgICAgICAgICAvLyBUT0RPOiBSZW1vdmUgd29ya2Fyb3VuZCBvZiBqc2hpbnQvanNoaW50IzI4NDZcbiAgICAgICAgICBpZiAoZXJyb3IuY2hhcmFjdGVyID09PSBudWxsKSB7XG4gICAgICAgICAgICByYW5nZSA9IEhlbHBlcnMucmFuZ2VGcm9tTGluZU51bWJlcih0ZXh0RWRpdG9yLCBlcnJvckxpbmUpXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxldCBjaGFyYWN0ZXIgPSBlcnJvci5jaGFyYWN0ZXIgPiAwID8gZXJyb3IuY2hhcmFjdGVyIC0gMSA6IDBcbiAgICAgICAgICAgIGxldCBsaW5lID0gZXJyb3JMaW5lXG4gICAgICAgICAgICBjb25zdCBidWZmZXIgPSB0ZXh0RWRpdG9yLmdldEJ1ZmZlcigpXG4gICAgICAgICAgICBjb25zdCBtYXhMaW5lID0gYnVmZmVyLmdldExpbmVDb3VudCgpXG4gICAgICAgICAgICAvLyBUT0RPOiBSZW1vdmUgd29ya2Fyb3VuZCBvZiBqc2hpbnQvanNoaW50IzI4OTRcbiAgICAgICAgICAgIGlmIChlcnJvckxpbmUgPj0gbWF4TGluZSkge1xuICAgICAgICAgICAgICBsaW5lID0gbWF4TGluZVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgbWF4Q2hhcmFjdGVyID0gYnVmZmVyLmxpbmVMZW5ndGhGb3JSb3cobGluZSlcbiAgICAgICAgICAgIC8vIFRPRE86IFJlbW92ZSB3b3JrYXJvdW5kIG9mIGpxdWVyeS9lc3ByaW1hIzE0NTdcbiAgICAgICAgICAgIGlmIChjaGFyYWN0ZXIgPiBtYXhDaGFyYWN0ZXIpIHtcbiAgICAgICAgICAgICAgY2hhcmFjdGVyID0gbWF4Q2hhcmFjdGVyXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByYW5nZSA9IEhlbHBlcnMucmFuZ2VGcm9tTGluZU51bWJlcih0ZXh0RWRpdG9yLCBsaW5lLCBjaGFyYWN0ZXIpXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmVzdWx0cy5wdXNoKHtcbiAgICAgICAgICAgIHR5cGU6IGVycm9yVHlwZSA9PT0gJ0UnID8gJ0Vycm9yJyA6IGVycm9yVHlwZSA9PT0gJ1cnID8gJ1dhcm5pbmcnIDogJ0luZm8nLFxuICAgICAgICAgICAgaHRtbDogYDxhIGhyZWY9XCJodHRwOi8vanNsaW50ZXJyb3JzLmNvbS8ke2Vycm9yLmNvZGV9XCI+JHtlcnJvci5jb2RlfTwvYT4gLSAke2Vycm9yLnJlYXNvbn1gLFxuICAgICAgICAgICAgZmlsZVBhdGgsXG4gICAgICAgICAgICByYW5nZVxuICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdHNcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cbiJdfQ==
//# sourceURL=/home/william/.atom/packages/linter-jshint/lib/main.js
