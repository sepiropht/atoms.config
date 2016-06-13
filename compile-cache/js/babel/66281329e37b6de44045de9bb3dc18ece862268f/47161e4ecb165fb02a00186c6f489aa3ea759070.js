function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _atom = require('atom');

var _helpers = require('./helpers');

var _escapeHtml = require('escape-html');

var _escapeHtml2 = _interopRequireDefault(_escapeHtml);

'use babel';

module.exports = {
  config: {
    lintHtmlFiles: {
      title: 'Lint HTML Files',
      description: 'You should also add `eslint-plugin-html` to your .eslintrc plugins',
      type: 'boolean',
      'default': false
    },
    useGlobalEslint: {
      title: 'Use global ESLint installation',
      description: 'Make sure you have it in your $PATH',
      type: 'boolean',
      'default': false
    },
    showRuleIdInMessage: {
      title: 'Show Rule ID in Messages',
      type: 'boolean',
      'default': true
    },
    disableWhenNoEslintConfig: {
      title: 'Disable when no ESLint config is found (in package.json or .eslintrc)',
      type: 'boolean',
      'default': true
    },
    eslintrcPath: {
      title: '.eslintrc Path',
      description: "It will only be used when there's no config file in project",
      type: 'string',
      'default': ''
    },
    globalNodePath: {
      title: 'Global Node Installation Path',
      description: 'Write the value of `npm get prefix` here',
      type: 'string',
      'default': ''
    },
    eslintRulesDir: {
      title: 'ESLint Rules Dir',
      description: 'Specify a directory for ESLint to load rules from',
      type: 'string',
      'default': ''
    },
    disableEslintIgnore: {
      title: 'Disable using .eslintignore files',
      type: 'boolean',
      'default': false
    },
    disableFSCache: {
      title: 'Disable FileSystem Cache',
      description: 'Paths of node_modules, .eslintignore and others are cached',
      type: 'boolean',
      'default': false
    }
  },
  activate: function activate() {
    var _this = this;

    require('atom-package-deps').install();

    this.subscriptions = new _atom.CompositeDisposable();
    this.active = true;
    this.worker = null;
    this.scopes = ['source.js', 'source.jsx', 'source.js.jsx', 'source.babel', 'source.js-semantic'];

    var embeddedScope = 'source.js.embedded.html';
    this.subscriptions.add(atom.config.observe('linter-eslint.lintHtmlFiles', function (lintHtmlFiles) {
      if (lintHtmlFiles) {
        _this.scopes.push(embeddedScope);
      } else {
        if (_this.scopes.indexOf(embeddedScope) !== -1) {
          _this.scopes.splice(_this.scopes.indexOf(embeddedScope), 1);
        }
      }
    }));
    this.subscriptions.add(atom.commands.add('atom-text-editor', {
      'linter-eslint:fix-file': function linterEslintFixFile() {
        var textEditor = atom.workspace.getActiveTextEditor();
        var filePath = textEditor.getPath();

        if (!textEditor || textEditor.isModified()) {
          // Abort for invalid or unsaved text editors
          atom.notifications.addError('Linter-ESLint: Please save before fixing');
          return;
        }

        _this.worker.request('job', {
          type: 'fix',
          config: atom.config.get('linter-eslint'),
          filePath: filePath
        }).then(function (response) {
          return atom.notifications.addSuccess(response);
        })['catch'](function (response) {
          return atom.notifications.addWarning(response);
        });
      }
    }));

    var initializeWorker = function initializeWorker() {
      var _spawnWorker = (0, _helpers.spawnWorker)();

      var worker = _spawnWorker.worker;
      var subscription = _spawnWorker.subscription;

      _this.worker = worker;
      _this.subscriptions.add(subscription);
      worker.onDidExit(function () {
        if (_this.active) {
          (0, _helpers.showError)('Worker died unexpectedly', 'Check your console for more ' + 'info. A new worker will be spawned instantly.');
          setTimeout(initializeWorker, 1000);
        }
      });
    };
    initializeWorker();
  },
  deactivate: function deactivate() {
    this.active = false;
    this.subscriptions.dispose();
  },
  provideLinter: function provideLinter() {
    var _this2 = this;

    var Helpers = require('atom-linter');
    return {
      name: 'ESLint',
      grammarScopes: this.scopes,
      scope: 'file',
      lintOnFly: true,
      lint: function lint(textEditor) {
        var text = textEditor.getText();
        if (text.length === 0) {
          return Promise.resolve([]);
        }
        var filePath = textEditor.getPath();
        var showRule = atom.config.get('linter-eslint.showRuleIdInMessage');

        return _this2.worker.request('job', {
          contents: text,
          type: 'lint',
          config: atom.config.get('linter-eslint'),
          filePath: filePath
        }).then(function (response) {
          return response.map(function (_ref) {
            var message = _ref.message;
            var line = _ref.line;
            var severity = _ref.severity;
            var ruleId = _ref.ruleId;
            var column = _ref.column;
            var fix = _ref.fix;

            var textBuffer = textEditor.getBuffer();
            var linterFix = null;
            if (fix) {
              var fixRange = new _atom.Range(textBuffer.positionForCharacterIndex(fix.range[0]), textBuffer.positionForCharacterIndex(fix.range[1]));
              linterFix = {
                range: fixRange,
                newText: fix.text
              };
            }
            var range = Helpers.rangeFromLineNumber(textEditor, line - 1);
            if (column) {
              range[0][1] = column - 1;
            }
            if (column > range[1][1]) {
              range[1][1] = column - 1;
            }
            var ret = {
              filePath: filePath,
              type: severity === 1 ? 'Warning' : 'Error',
              range: range
            };
            if (showRule) {
              var elName = ruleId ? 'a' : 'span';
              var href = ruleId ? ' href=' + (0, _helpers.ruleURI)(ruleId) : '';
              ret.html = '<' + elName + href + ' class="badge badge-flexible eslint">' + ((ruleId || 'Fatal') + '</' + elName + '> ' + (0, _escapeHtml2['default'])(message));
            } else {
              ret.text = message;
            }
            if (linterFix) {
              ret.fix = linterFix;
            }
            return ret;
          });
        });
      }
    };
  }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3dpbGxpYW0vLmF0b20vcGFja2FnZXMvbGludGVyLWVzbGludC9zcmMvbWFpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztvQkFFMkMsTUFBTTs7dUJBQ0QsV0FBVzs7MEJBQ3BDLGFBQWE7Ozs7QUFKcEMsV0FBVyxDQUFBOztBQU1YLE1BQU0sQ0FBQyxPQUFPLEdBQUc7QUFDZixRQUFNLEVBQUU7QUFDTixpQkFBYSxFQUFFO0FBQ2IsV0FBSyxFQUFFLGlCQUFpQjtBQUN4QixpQkFBVyxFQUFFLG9FQUFvRTtBQUNqRixVQUFJLEVBQUUsU0FBUztBQUNmLGlCQUFTLEtBQUs7S0FDZjtBQUNELG1CQUFlLEVBQUU7QUFDZixXQUFLLEVBQUUsZ0NBQWdDO0FBQ3ZDLGlCQUFXLEVBQUUscUNBQXFDO0FBQ2xELFVBQUksRUFBRSxTQUFTO0FBQ2YsaUJBQVMsS0FBSztLQUNmO0FBQ0QsdUJBQW1CLEVBQUU7QUFDbkIsV0FBSyxFQUFFLDBCQUEwQjtBQUNqQyxVQUFJLEVBQUUsU0FBUztBQUNmLGlCQUFTLElBQUk7S0FDZDtBQUNELDZCQUF5QixFQUFFO0FBQ3pCLFdBQUssRUFBRSx1RUFBdUU7QUFDOUUsVUFBSSxFQUFFLFNBQVM7QUFDZixpQkFBUyxJQUFJO0tBQ2Q7QUFDRCxnQkFBWSxFQUFFO0FBQ1osV0FBSyxFQUFFLGdCQUFnQjtBQUN2QixpQkFBVyxFQUFFLDZEQUE2RDtBQUMxRSxVQUFJLEVBQUUsUUFBUTtBQUNkLGlCQUFTLEVBQUU7S0FDWjtBQUNELGtCQUFjLEVBQUU7QUFDZCxXQUFLLEVBQUUsK0JBQStCO0FBQ3RDLGlCQUFXLEVBQUUsMENBQTBDO0FBQ3ZELFVBQUksRUFBRSxRQUFRO0FBQ2QsaUJBQVMsRUFBRTtLQUNaO0FBQ0Qsa0JBQWMsRUFBRTtBQUNkLFdBQUssRUFBRSxrQkFBa0I7QUFDekIsaUJBQVcsRUFBRSxtREFBbUQ7QUFDaEUsVUFBSSxFQUFFLFFBQVE7QUFDZCxpQkFBUyxFQUFFO0tBQ1o7QUFDRCx1QkFBbUIs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LFFBQVEsS0FBSyxDQUFDLEdBQUcsU0FBUyxHQUFHLE9BQU87QUFDMUMsbUJBQUssRUFBTCxLQUFLO2FBQ04sQ0FBQTtBQUNELGdCQUFJLFFBQVEsRUFBRTtBQUNaLGtCQUFNLE1BQU0sR0FBRyxNQUFNLEdBQUcsR0FBRyxHQUFHLE1BQU0sQ0FBQTtBQUNwQyxrQkFBTSxJQUFJLEdBQUcsTUFBTSxjQUFZLHNCQUFRLE1BQU0sQ0FBQyxHQUFLLEVBQUUsQ0FBQTtBQUNyRCxpQkFBRyxDQUFDLElBQUksR0FBRyxNQUFJLE1BQU0sR0FBRyxJQUFJLCtDQUN2QixNQUFNLElBQUksT0FBTyxDQUFBLFVBQUssTUFBTSxVQUFLLDZCQUFXLE9BQU8sQ0FBQyxDQUFFLENBQUE7YUFDNUQsTUFBTTtBQUNMLGlCQUFHLENBQUMsSUFBSSxHQUFHLE9BQU8sQ0FBQTthQUNuQjtBQUNELGdCQUFJLFNBQVMsRUFBRTtBQUNiLGlCQUFHLENBQUMsR0FBRyxHQUFHLFNBQVMsQ0FBQTthQUNwQjtBQUNELG1CQUFPLEdBQUcsQ0FBQTtXQUNYLENBQUM7U0FBQSxDQUNILENBQUE7T0FDRjtLQUNGLENBQUE7R0FDRjtDQUNGLENBQUEiLCJmaWxlIjoiL2hvbWUvd2lsbGlhbS8uYXRvbS9wYWNrYWdlcy9saW50ZXItZXNsaW50L3NyYy9tYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCdcblxuaW1wb3J0IHsgQ29tcG9zaXRlRGlzcG9zYWJsZSwgUmFuZ2UgfSBmcm9tICdhdG9tJ1xuaW1wb3J0IHsgc3Bhd25Xb3JrZXIsIHNob3dFcnJvciwgcnVsZVVSSSB9IGZyb20gJy4vaGVscGVycydcbmltcG9ydCBlc2NhcGVIVE1MIGZyb20gJ2VzY2FwZS1odG1sJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgY29uZmlnOiB7XG4gICAgbGludEh0bWxGaWxlczoge1xuICAgICAgdGl0bGU6ICdMaW50IEhUTUwgRmlsZXMnLFxuICAgICAgZGVzY3JpcHRpb246ICdZb3Ugc2hvdWxkIGFsc28gYWRkIGBlc2xpbnQtcGx1Z2luLWh0bWxgIHRvIHlvdXIgLmVzbGludHJjIHBsdWdpbnMnLFxuICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICB9LFxuICAgIHVzZUdsb2JhbEVzbGludDoge1xuICAgICAgdGl0bGU6ICdVc2UgZ2xvYmFsIEVTTGludCBpbnN0YWxsYXRpb24nLFxuICAgICAgZGVzY3JpcHRpb246ICdNYWtlIHN1cmUgeW91IGhhdmUgaXQgaW4geW91ciAkUEFUSCcsXG4gICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICBkZWZhdWx0OiBmYWxzZVxuICAgIH0sXG4gICAgc2hvd1J1bGVJZEluTWVzc2FnZToge1xuICAgICAgdGl0bGU6ICdTaG93IFJ1bGUgSUQgaW4gTWVzc2FnZXMnLFxuICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgIH0sXG4gICAgZGlzYWJsZVdoZW5Ob0VzbGludENvbmZpZzoge1xuICAgICAgdGl0bGU6ICdEaXNhYmxlIHdoZW4gbm8gRVNMaW50IGNvbmZpZyBpcyBmb3VuZCAoaW4gcGFja2FnZS5qc29uIG9yIC5lc2xpbnRyYyknLFxuICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgIH0sXG4gICAgZXNsaW50cmNQYXRoOiB7XG4gICAgICB0aXRsZTogJy5lc2xpbnRyYyBQYXRoJyxcbiAgICAgIGRlc2NyaXB0aW9uOiBcIkl0IHdpbGwgb25seSBiZSB1c2VkIHdoZW4gdGhlcmUncyBubyBjb25maWcgZmlsZSBpbiBwcm9qZWN0XCIsXG4gICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgIGRlZmF1bHQ6ICcnXG4gICAgfSxcbiAgICBnbG9iYWxOb2RlUGF0aDoge1xuICAgICAgdGl0bGU6ICdHbG9iYWwgTm9kZSBJbnN0YWxsYXRpb24gUGF0aCcsXG4gICAgICBkZXNjcmlwdGlvbjogJ1dyaXRlIHRoZSB2YWx1ZSBvZiBgbnBtIGdldCBwcmVmaXhgIGhlcmUnLFxuICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICBkZWZhdWx0OiAnJ1xuICAgIH0sXG4gICAgZXNsaW50UnVsZXNEaXI6IHtcbiAgICAgIHRpdGxlOiAnRVNMaW50IFJ1bGVzIERpcicsXG4gICAgICBkZXNjcmlwdGlvbjogJ1NwZWNpZnkgYSBkaXJlY3RvcnkgZm9yIEVTTGludCB0byBsb2FkIHJ1bGVzIGZyb20nLFxuICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICBkZWZhdWx0OiAnJ1xuICAgIH0sXG4gICAgZGlzYWJsZUVzbGludElnbm9yZToge1xuICAgICAgdGl0bGU6ICdEaXNhYmxlIHVzaW5nIC5lc2xpbnRpZ25vcmUgZmlsZXMnLFxuICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICB9LFxuICAgIGRpc2FibGVGU0NhY2hlOiB7XG4gICAgICB0aXRsZTogJ0Rpc2FibGUgRmlsZVN5c3RlbSBDYWNoZScsXG4gICAgICBkZXNjcmlwdGlvbjogJ1BhdGhzIG9mIG5vZGVfbW9kdWxlcywgLmVzbGludGlnbm9yZSBhbmQgb3RoZXJzIGFyZSBjYWNoZWQnLFxuICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICB9XG4gIH0sXG4gIGFjdGl2YXRlKCkge1xuICAgIHJlcXVpcmUoJ2F0b20tcGFja2FnZS1kZXBzJykuaW5zdGFsbCgpXG5cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG4gICAgdGhpcy5hY3RpdmUgPSB0cnVlXG4gICAgdGhpcy53b3JrZXIgPSBudWxsXG4gICAgdGhpcy5zY29wZXMgPSBbJ3NvdXJjZS5qcycsICdzb3VyY2UuanN4JywgJ3NvdXJjZS5qcy5qc3gnLCAnc291cmNlLmJhYmVsJywgJ3NvdXJjZS5qcy1zZW1hbnRpYyddXG5cbiAgICBjb25zdCBlbWJlZGRlZFNjb3BlID0gJ3NvdXJjZS5qcy5lbWJlZGRlZC5odG1sJ1xuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb25maWcub2JzZXJ2ZSgnbGludGVyLWVzbGludC5saW50SHRtbEZpbGVzJywgbGludEh0bWxGaWxlcyA9PiB7XG4gICAgICBpZiAobGludEh0bWxGaWxlcykge1xuICAgICAgICB0aGlzLnNjb3Blcy5wdXNoKGVtYmVkZGVkU2NvcGUpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAodGhpcy5zY29wZXMuaW5kZXhPZihlbWJlZGRlZFNjb3BlKSAhPT0gLTEpIHtcbiAgICAgICAgICB0aGlzLnNjb3Blcy5zcGxpY2UodGhpcy5zY29wZXMuaW5kZXhPZihlbWJlZGRlZFNjb3BlKSwgMSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20tdGV4dC1lZGl0b3InLCB7XG4gICAgICAnbGludGVyLWVzbGludDpmaXgtZmlsZSc6ICgpID0+IHtcbiAgICAgICAgY29uc3QgdGV4dEVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgICAgICBjb25zdCBmaWxlUGF0aCA9IHRleHRFZGl0b3IuZ2V0UGF0aCgpXG5cbiAgICAgICAgaWYgKCF0ZXh0RWRpdG9yIHx8IHRleHRFZGl0b3IuaXNNb2RpZmllZCgpKSB7XG4gICAgICAgICAgLy8gQWJvcnQgZm9yIGludmFsaWQgb3IgdW5zYXZlZCB0ZXh0IGVkaXRvcnNcbiAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoJ0xpbnRlci1FU0xpbnQ6IFBsZWFzZSBzYXZlIGJlZm9yZSBmaXhpbmcnKVxuICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy53b3JrZXIucmVxdWVzdCgnam9iJywge1xuICAgICAgICAgIHR5cGU6ICdmaXgnLFxuICAgICAgICAgIGNvbmZpZzogYXRvbS5jb25maWcuZ2V0KCdsaW50ZXItZXNsaW50JyksXG4gICAgICAgICAgZmlsZVBhdGhcbiAgICAgICAgfSkudGhlbigocmVzcG9uc2UpID0+XG4gICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFN1Y2Nlc3MocmVzcG9uc2UpXG4gICAgICAgICkuY2F0Y2goKHJlc3BvbnNlKSA9PlxuICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nKHJlc3BvbnNlKVxuICAgICAgICApXG4gICAgICB9XG4gICAgfSkpXG5cbiAgICBjb25zdCBpbml0aWFsaXplV29ya2VyID0gKCkgPT4ge1xuICAgICAgY29uc3QgeyB3b3JrZXIsIHN1YnNjcmlwdGlvbiB9ID0gc3Bhd25Xb3JrZXIoKVxuICAgICAgdGhpcy53b3JrZXIgPSB3b3JrZXJcbiAgICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoc3Vic2NyaXB0aW9uKVxuICAgICAgd29ya2VyLm9uRGlkRXhpdCgoKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLmFjdGl2ZSkge1xuICAgICAgICAgIHNob3dFcnJvcignV29ya2VyIGRpZWQgdW5leHBlY3RlZGx5JywgJ0NoZWNrIHlvdXIgY29uc29sZSBmb3IgbW9yZSAnICtcbiAgICAgICAgICAnaW5mby4gQSBuZXcgd29ya2VyIHdpbGwgYmUgc3Bhd25lZCBpbnN0YW50bHkuJylcbiAgICAgICAgICBzZXRUaW1lb3V0KGluaXRpYWxpemVXb3JrZXIsIDEwMDApXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfVxuICAgIGluaXRpYWxpemVXb3JrZXIoKVxuICB9LFxuICBkZWFjdGl2YXRlKCkge1xuICAgIHRoaXMuYWN0aXZlID0gZmFsc2VcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG4gIH0sXG4gIHByb3ZpZGVMaW50ZXIoKSB7XG4gICAgY29uc3QgSGVscGVycyA9IHJlcXVpcmUoJ2F0b20tbGludGVyJylcbiAgICByZXR1cm4ge1xuICAgICAgbmFtZTogJ0VTTGludCcsXG4gICAgICBncmFtbWFyU2NvcGVzOiB0aGlzLnNjb3BlcyxcbiAgICAgIHNjb3BlOiAnZmlsZScsXG4gICAgICBsaW50T25GbHk6IHRydWUsXG4gICAgICBsaW50OiB0ZXh0RWRpdG9yID0+IHtcbiAgICAgICAgY29uc3QgdGV4dCA9IHRleHRFZGl0b3IuZ2V0VGV4dCgpXG4gICAgICAgIGlmICh0ZXh0Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoW10pXG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZmlsZVBhdGggPSB0ZXh0RWRpdG9yLmdldFBhdGgoKVxuICAgICAgICBjb25zdCBzaG93UnVsZSA9IGF0b20uY29uZmlnLmdldCgnbGludGVyLWVzbGludC5zaG93UnVsZUlkSW5NZXNzYWdlJylcblxuICAgICAgICByZXR1cm4gdGhpcy53b3JrZXIucmVxdWVzdCgnam9iJywge1xuICAgICAgICAgIGNvbnRlbnRzOiB0ZXh0LFxuICAgICAgICAgIHR5cGU6ICdsaW50JyxcbiAgICAgICAgICBjb25maWc6IGF0b20uY29uZmlnLmdldCgnbGludGVyLWVzbGludCcpLFxuICAgICAgICAgIGZpbGVQYXRoXG4gICAgICAgIH0pLnRoZW4oKHJlc3BvbnNlKSA9PlxuICAgICAgICAgIHJlc3BvbnNlLm1hcCgoeyBtZXNzYWdlLCBsaW5lLCBzZXZlcml0eSwgcnVsZUlkLCBjb2x1bW4sIGZpeCB9KSA9PiB7XG4gICAgICAgICAgICBjb25zdCB0ZXh0QnVmZmVyID0gdGV4dEVkaXRvci5nZXRCdWZmZXIoKVxuICAgICAgICAgICAgbGV0IGxpbnRlckZpeCA9IG51bGxcbiAgICAgICAgICAgIGlmIChmaXgpIHtcbiAgICAgICAgICAgICAgY29uc3QgZml4UmFuZ2UgPSBuZXcgUmFuZ2UoXG4gICAgICAgICAgICAgICAgdGV4dEJ1ZmZlci5wb3NpdGlvbkZvckNoYXJhY3RlckluZGV4KGZpeC5yYW5nZVswXSksXG4gICAgICAgICAgICAgICAgdGV4dEJ1ZmZlci5wb3NpdGlvbkZvckNoYXJhY3RlckluZGV4KGZpeC5yYW5nZVsxXSlcbiAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICBsaW50ZXJGaXggPSB7XG4gICAgICAgICAgICAgICAgcmFuZ2U6IGZpeFJhbmdlLFxuICAgICAgICAgICAgICAgIG5ld1RleHQ6IGZpeC50ZXh0XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHJhbmdlID0gSGVscGVycy5yYW5nZUZyb21MaW5lTnVtYmVyKHRleHRFZGl0b3IsIGxpbmUgLSAxKVxuICAgICAgICAgICAgaWYgKGNvbHVtbikge1xuICAgICAgICAgICAgICByYW5nZVswXVsxXSA9IGNvbHVtbiAtIDFcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChjb2x1bW4gPiByYW5nZVsxXVsxXSkge1xuICAgICAgICAgICAgICByYW5nZVsxXVsxXSA9IGNvbHVtbiAtIDFcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHJldCA9IHtcbiAgICAgICAgICAgICAgZmlsZVBhdGgsXG4gICAgICAgICAgICAgIHR5cGU6IHNldmVyaXR5ID09PSAxID8gJ1dhcm5pbmcnIDogJ0Vycm9yJyxcbiAgICAgICAgICAgICAgcmFuZ2VcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChzaG93UnVsZSkge1xuICAgICAgICAgICAgICBjb25zdCBlbE5hbWUgPSBydWxlSWQgPyAnYScgOiAnc3BhbidcbiAgICAgICAgICAgICAgY29uc3QgaHJlZiA9IHJ1bGVJZCA/IGAgaHJlZj0ke3J1bGVVUkkocnVsZUlkKX1gIDogJydcbiAgICAgICAgICAgICAgcmV0Lmh0bWwgPSBgPCR7ZWxOYW1lfSR7aHJlZn0gY2xhc3M9XCJiYWRnZSBiYWRnZS1mbGV4aWJsZSBlc2xpbnRcIj5gICtcbiAgICAgICAgICAgICAgICBgJHtydWxlSWQgfHwgJ0ZhdGFsJ308LyR7ZWxOYW1lfT4gJHtlc2NhcGVIVE1MKG1lc3NhZ2UpfWBcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHJldC50ZXh0ID0gbWVzc2FnZVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGxpbnRlckZpeCkge1xuICAgICAgICAgICAgICByZXQuZml4ID0gbGludGVyRml4XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmV0XG4gICAgICAgICAgfSlcbiAgICAgICAgKVxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuIl19
//# sourceURL=/home/william/.atom/packages/linter-eslint/src/main.js
