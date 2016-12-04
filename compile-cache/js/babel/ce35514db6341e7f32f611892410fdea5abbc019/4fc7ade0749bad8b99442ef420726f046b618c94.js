Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

var _provider = require('./provider');

var _provider2 = _interopRequireDefault(_provider);

var _projectDeps = require('./project-deps');

var _projectDeps2 = _interopRequireDefault(_projectDeps);

var _utils = require('./utils');

var _settings = require('./settings');

var _settings2 = _interopRequireDefault(_settings);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _glob = require('glob');

var _glob2 = _interopRequireDefault(_glob);

var _lodashUniq = require('lodash.uniq');

var _lodashUniq2 = _interopRequireDefault(_lodashUniq);

'use babel';

function readFilePromise(path) {
    return new Promise(function (resolve) {
        _fs2['default'].readFile(path, function (err, data) {
            return resolve({
                data: data,
                dir: (0, _utils.getParentDir)(path)
            });
        });
    });
}

function parsePackageJSON(file, projectDeps, _ref) {
    var suggestDev = _ref.suggestDev;
    var suggestProd = _ref.suggestProd;

    try {
        var conf = JSON.parse(file.data);
        var deps = [];

        if (conf.dependencies && suggestProd) {
            deps.push.apply(deps, _toConsumableArray(Object.keys(conf.dependencies)));
        }

        if (conf.devDependencies && suggestDev) {
            deps.push.apply(deps, _toConsumableArray(Object.keys(conf.devDependencies)));
        }

        projectDeps.set(file.dir, (0, _lodashUniq2['default'])(deps));
    } catch (e) {
        // this file was probably saved before it was a valid JSON
    }
}

var PACKAGE_NAME = 'autocomplete-js-import';

exports['default'] = {
    config: _settings2['default'],

    filesMap: new Map(),
    projectDeps: new _projectDeps2['default'](),

    _fileWatchers: [],
    _pathListeners: [],
    _settingsObservers: [],

    activate: function activate() {
        var _settingsObservers,
            _this = this;

        var settings = atom.config.get(PACKAGE_NAME);
        var projectPaths = atom.project.getPaths();

        (_settingsObservers = this._settingsObservers).push.apply(_settingsObservers, _toConsumableArray(['hiddenFiles', 'fuzzy', 'projectDependencies'].map(function (setting) {
            return atom.config.onDidChange(PACKAGE_NAME + '.' + setting, function () {
                // Just wipe everything and start fresh, relatively expensive but effective
                _this.deactivate();
                _this.activate();
            });
        })));

        if (settings.fuzzy.enabled) {
            (function () {
                var options = {
                    excludedDirs: settings.fuzzy.excludedDirs,
                    showHidden: settings.hiddenFiles,
                    fileTypes: settings.fuzzy.fileTypes
                };

                // TODO: listen for file additions
                _this._buildProjectFilesList(projectPaths, options);

                _this._pathListeners.push(atom.project.onDidChangePaths(function (paths) {
                    var newPaths = paths.filter(function (p) {
                        return !_this.filesMap.has(p);
                    });

                    _this._buildProjectFilesList(newPaths, options);
                }));
            })();
        }

        if (settings.projectDependencies.suggestDev || settings.projectDependencies.suggestProd) {
            this._searchForProjectDeps(projectPaths, settings.projectDependencies);

            this._pathListeners.push(atom.project.onDidChangePaths(function (paths) {
                var newProjectPaths = paths.filter(function (p) {
                    return !_this.projectDeps.hasDeps(p);
                });

                _this._searchForProjectDeps(newProjectPaths, settings.projectDependencies);
            }));
        }
    },

    deactivate: function deactivate() {
        this._pathListeners.forEach(function (listener) {
            return listener.dispose();
        });
        this._pathListeners.length = 0;

        this._fileWatchers.forEach(function (watcher) {
            return watcher.close();
        });
        this._fileWatchers.length = 0;

        this._settingsObservers.forEach(function (observer) {
            return observer.dispose();
        });
        this._settingsObservers.length = 0;

        // In case of settings change, these references must stay intact for the provide method below to work
        this.filesMap.clear();
        this.projectDeps.clear();
    },

    provide: function provide() {
        return new _provider2['default'](this.projectDeps, this.filesMap);
    },

    _buildProjectFilesList: function _buildProjectFilesList(projectPaths, _ref2) {
        var _this2 = this;

        var excludedDirs = _ref2.excludedDirs;
        var fileTypes = _ref2.fileTypes;
        var showHidden = _ref2.showHidden;

        projectPaths.forEach(function (p) {
            var fileTypeMatcher = '/*';

            // TODO: put this filematching logic into a utility
            if (fileTypes.length && fileTypes[0] !== '*') {
                fileTypeMatcher += '.{' + fileTypes.join(',') + '}';
            }

            // the double matching is done to check the top level dir :-/
            var globPattern = '{' + p + fileTypeMatcher + ',' + p;

            // TODO: make this work with non top level dirs
            if (excludedDirs.length) {
                globPattern += '/!(' + excludedDirs.join('|') + ')';
            }

            globPattern += '/**' + fileTypeMatcher + '}';

            (0, _glob2['default'])(globPattern, { dot: showHidden, nodir: true }, function (err, childPaths) {
                _this2.filesMap.set(p, childPaths.map(function (child) {
                    return _path2['default'].relative(p, child);
                }));
            });
        });
    },

    _searchForProjectDeps: function _searchForProjectDeps(projectPaths, packageSettings) {
        var _this3 = this;

        if (!projectPaths.length) {
            return;
        }

        var packageExtraction = projectPaths.map(function (p) {
            var packageConfPath = p + '/package.json';

            return new Promise(function (resolve) {
                _fs2['default'].stat(packageConfPath, function (err, stats) {
                    return resolve({ stats: stats, path: packageConfPath });
                });
            });
        });

        Promise.all(packageExtraction).then(function (resolved) {
            // Only get the files that exist
            var packageConfs = resolved.filter(function (r) {
                return r.stats && r.stats.isFile();
            });

            return Promise.all(packageConfs.map(function (conf) {
                _this3._fileWatchers.push(_fs2['default'].watch(conf.path, function (eventType) {
                    if (eventType === 'change') {
                        return readFilePromise(conf.path).then(function (file) {
                            return parsePackageJSON(file, _this3.projectDeps, packageSettings);
                        });
                    }
                }));

                return readFilePromise(conf.path);
            }));
        }).then(function (files) {
            files.forEach(function (f) {
                return parsePackageJSON(f, _this3.projectDeps, packageSettings);
            });
        })['catch'](function () {});
    }
};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3NlcGlyb3BodC8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtanMtaW1wb3J0L2xpYi9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozt3QkFDcUMsWUFBWTs7OzsyQkFDekIsZ0JBQWdCOzs7O3FCQUNiLFNBQVM7O3dCQUNmLFlBQVk7Ozs7a0JBQ2xCLElBQUk7Ozs7b0JBQ0YsTUFBTTs7OztvQkFDTixNQUFNOzs7OzBCQUNOLGFBQWE7Ozs7QUFSOUIsV0FBVyxDQUFBOztBQVVYLFNBQVMsZUFBZSxDQUFDLElBQUksRUFBRTtBQUMzQixXQUFPLElBQUksT0FBTyxDQUFDLFVBQUEsT0FBTyxFQUFJO0FBQzFCLHdCQUFHLFFBQVEsQ0FBQyxJQUFJLEVBQUUsVUFBQyxHQUFHLEVBQUUsSUFBSTttQkFBSyxPQUFPLENBQUM7QUFDckMsb0JBQUksRUFBSixJQUFJO0FBQ0osbUJBQUcsRUFBRSx5QkFBYSxJQUFJLENBQUM7YUFDMUIsQ0FBQztTQUFBLENBQUMsQ0FBQztLQUNQLENBQUMsQ0FBQztDQUNOOztBQUVELFNBQVMsZ0JBQWdCLENBQUMsSUFBSSxFQUFFLFdBQVcsRUFBRSxJQUF5QixFQUFFO1FBQTFCLFVBQVUsR0FBWCxJQUF5QixDQUF4QixVQUFVO1FBQUUsV0FBVyxHQUF4QixJQUF5QixDQUFaLFdBQVc7O0FBQ2pFLFFBQUk7QUFDQSxZQUFNLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNuQyxZQUFNLElBQUksR0FBRyxFQUFFLENBQUM7O0FBRWhCLFlBQUksSUFBSSxDQUFDLFlBQVksSUFBSSxXQUFXLEVBQUU7QUFDbEMsZ0JBQUksQ0FBQyxJQUFJLE1BQUEsQ0FBVCxJQUFJLHFCQUFTLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxFQUFDLENBQUM7U0FDaEQ7O0FBRUQsWUFBSSxJQUFJLENBQUMsZUFBZSxJQUFJLFVBQVUs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QUFFSCxlQUFPLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDLENBQ3pCLElBQUksQ0FBQyxVQUFBLFFBQVEsRUFBSTs7QUFFZCxnQkFBTSxZQUFZLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxVQUFBLENBQUM7dUJBQUksQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRTthQUFBLENBQUMsQ0FBQzs7QUFFdkUsbUJBQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLFVBQUEsSUFBSSxFQUFJO0FBQ3hDLHVCQUFLLGFBQWEsQ0FBQyxJQUFJLENBQUMsZ0JBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsVUFBQSxTQUFTLEVBQUk7QUFDckQsd0JBQUksU0FBUyxLQUFLLFFBQVEsRUFBRTtBQUN4QiwrQkFBTyxlQUFlLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUM1QixJQUFJLENBQUMsVUFBQSxJQUFJO21DQUFJLGdCQUFnQixDQUFDLElBQUksRUFBRSxPQUFLLFdBQVcsRUFBRSxlQUFlLENBQUM7eUJBQUEsQ0FBQyxDQUFDO3FCQUNoRjtpQkFDSixDQUFDLENBQUMsQ0FBQzs7QUFFSix1QkFBTyxlQUFlLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQ3JDLENBQUMsQ0FBQyxDQUFDO1NBQ1AsQ0FBQyxDQUNELElBQUksQ0FBQyxVQUFBLEtBQUssRUFBSTtBQUNYLGlCQUFLLENBQUMsT0FBTyxDQUFDLFVBQUEsQ0FBQzt1QkFBSSxnQkFBZ0IsQ0FBQyxDQUFDLEVBQUUsT0FBSyxXQUFXLEVBQUUsZUFBZSxDQUFDO2FBQUEsQ0FBQyxDQUFDO1NBQzlFLENBQUMsU0FDSSxDQUFDLFlBQU0sRUFBRSxDQUFDLENBQUM7S0FDeEI7Q0FDSiIsImZpbGUiOiIvaG9tZS9zZXBpcm9waHQvLmF0b20vcGFja2FnZXMvYXV0b2NvbXBsZXRlLWpzLWltcG9ydC9saWIvaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJ1xuaW1wb3J0IEltcG9ydENvbXBsZXRpb25Qcm92aWRlciBmcm9tICcuL3Byb3ZpZGVyJztcbmltcG9ydCBQcm9qZWN0RGVwcyBmcm9tICcuL3Byb2plY3QtZGVwcyc7XG5pbXBvcnQge2dldFBhcmVudERpcn0gZnJvbSAnLi91dGlscyc7XG5pbXBvcnQgc2V0dGluZ3MgZnJvbSAnLi9zZXR0aW5ncyc7XG5pbXBvcnQgZnMgZnJvbSAnZnMnO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgZ2xvYiBmcm9tICdnbG9iJztcbmltcG9ydCB1bmlxIGZyb20gJ2xvZGFzaC51bmlxJztcblxuZnVuY3Rpb24gcmVhZEZpbGVQcm9taXNlKHBhdGgpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgICAgIGZzLnJlYWRGaWxlKHBhdGgsIChlcnIsIGRhdGEpID0+IHJlc29sdmUoe1xuICAgICAgICAgICAgZGF0YSxcbiAgICAgICAgICAgIGRpcjogZ2V0UGFyZW50RGlyKHBhdGgpXG4gICAgICAgIH0pKTtcbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gcGFyc2VQYWNrYWdlSlNPTihmaWxlLCBwcm9qZWN0RGVwcywge3N1Z2dlc3REZXYsIHN1Z2dlc3RQcm9kfSkge1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGNvbmYgPSBKU09OLnBhcnNlKGZpbGUuZGF0YSk7XG4gICAgICAgIGNvbnN0IGRlcHMgPSBbXTtcblxuICAgICAgICBpZiAoY29uZi5kZXBlbmRlbmNpZXMgJiYgc3VnZ2VzdFByb2QpIHtcbiAgICAgICAgICAgIGRlcHMucHVzaCguLi5PYmplY3Qua2V5cyhjb25mLmRlcGVuZGVuY2llcykpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGNvbmYuZGV2RGVwZW5kZW5jaWVzICYmIHN1Z2dlc3REZXYpIHtcbiAgICAgICAgICAgIGRlcHMucHVzaCguLi5PYmplY3Qua2V5cyhjb25mLmRldkRlcGVuZGVuY2llcykpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvamVjdERlcHMuc2V0KGZpbGUuZGlyLCB1bmlxKGRlcHMpKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIC8vIHRoaXMgZmlsZSB3YXMgcHJvYmFibHkgc2F2ZWQgYmVmb3JlIGl0IHdhcyBhIHZhbGlkIEpTT05cbiAgICB9XG59XG5cbmNvbnN0IFBBQ0tBR0VfTkFNRSA9ICdhdXRvY29tcGxldGUtanMtaW1wb3J0JztcblxuZXhwb3J0IGRlZmF1bHQge1xuICAgIGNvbmZpZzogc2V0dGluZ3MsXG5cbiAgICBmaWxlc01hcDogbmV3IE1hcCgpLFxuICAgIHByb2plY3REZXBzOiBuZXcgUHJvamVjdERlcHMoKSxcblxuICAgIF9maWxlV2F0Y2hlcnM6IFtdLFxuICAgIF9wYXRoTGlzdGVuZXJzOiBbXSxcbiAgICBfc2V0dGluZ3NPYnNlcnZlcnM6IFtdLFxuXG4gICAgYWN0aXZhdGUoKSB7XG4gICAgICAgIGNvbnN0IHNldHRpbmdzID0gYXRvbS5jb25maWcuZ2V0KFBBQ0tBR0VfTkFNRSk7XG4gICAgICAgIGNvbnN0IHByb2plY3RQYXRocyA9IGF0b20ucHJvamVjdC5nZXRQYXRocygpO1xuXG4gICAgICAgIHRoaXMuX3NldHRpbmdzT2JzZXJ2ZXJzLnB1c2goLi4uWydoaWRkZW5GaWxlcycsICdmdXp6eScsICdwcm9qZWN0RGVwZW5kZW5jaWVzJ10ubWFwKHNldHRpbmcgPT5cbiAgICAgICAgICAgIGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlKGAke1BBQ0tBR0VfTkFNRX0uJHtzZXR0aW5nfWAsICgpID0+IHtcbiAgICAgICAgICAgICAgICAvLyBKdXN0IHdpcGUgZXZlcnl0aGluZyBhbmQgc3RhcnQgZnJlc2gsIHJlbGF0aXZlbHkgZXhwZW5zaXZlIGJ1dCBlZmZlY3RpdmVcbiAgICAgICAgICAgICAgICB0aGlzLmRlYWN0aXZhdGUoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmFjdGl2YXRlKCk7XG4gICAgICAgICAgICB9KVxuICAgICAgICApKTtcblxuICAgICAgICBpZiAoc2V0dGluZ3MuZnV6enkuZW5hYmxlZCkge1xuICAgICAgICAgICAgY29uc3Qgb3B0aW9ucyA9IHtcbiAgICAgICAgICAgICAgICBleGNsdWRlZERpcnM6IHNldHRpbmdzLmZ1enp5LmV4Y2x1ZGVkRGlycyxcbiAgICAgICAgICAgICAgICBzaG93SGlkZGVuOiBzZXR0aW5ncy5oaWRkZW5GaWxlcyxcbiAgICAgICAgICAgICAgICBmaWxlVHlwZXM6IHNldHRpbmdzLmZ1enp5LmZpbGVUeXBlc1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgLy8gVE9ETzogbGlzdGVuIGZvciBmaWxlIGFkZGl0aW9uc1xuICAgICAgICAgICAgdGhpcy5fYnVpbGRQcm9qZWN0RmlsZXNMaXN0KHByb2plY3RQYXRocywgb3B0aW9ucyk7XG5cbiAgICAgICAgICAgIHRoaXMuX3BhdGhMaXN0ZW5lcnMucHVzaChhdG9tLnByb2plY3Qub25EaWRDaGFuZ2VQYXRocyhwYXRocyA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgbmV3UGF0aHMgPSBwYXRocy5maWx0ZXIocCA9PiAhdGhpcy5maWxlc01hcC5oYXMocCkpO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5fYnVpbGRQcm9qZWN0RmlsZXNMaXN0KG5ld1BhdGhzLCBvcHRpb25zKTtcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChzZXR0aW5ncy5wcm9qZWN0RGVwZW5kZW5jaWVzLnN1Z2dlc3REZXYgfHwgc2V0dGluZ3MucHJvamVjdERlcGVuZGVuY2llcy5zdWdnZXN0UHJvZCkge1xuICAgICAgICAgICAgdGhpcy5fc2VhcmNoRm9yUHJvamVjdERlcHMocHJvamVjdFBhdGhzLCBzZXR0aW5ncy5wcm9qZWN0RGVwZW5kZW5jaWVzKTtcblxuICAgICAgICAgICAgdGhpcy5fcGF0aExpc3RlbmVycy5wdXNoKGF0b20ucHJvamVjdC5vbkRpZENoYW5nZVBhdGhzKHBhdGhzID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBuZXdQcm9qZWN0UGF0aHMgPSBwYXRocy5maWx0ZXIocCA9PiAhdGhpcy5wcm9qZWN0RGVwcy5oYXNEZXBzKHApKTtcblxuICAgICAgICAgICAgICAgIHRoaXMuX3NlYXJjaEZvclByb2plY3REZXBzKG5ld1Byb2plY3RQYXRocywgc2V0dGluZ3MucHJvamVjdERlcGVuZGVuY2llcyk7XG4gICAgICAgICAgICB9KSk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgZGVhY3RpdmF0ZSgpIHtcbiAgICAgICAgdGhpcy5fcGF0aExpc3RlbmVycy5mb3JFYWNoKGxpc3RlbmVyID0+IGxpc3RlbmVyLmRpc3Bvc2UoKSk7XG4gICAgICAgIHRoaXMuX3BhdGhMaXN0ZW5lcnMubGVuZ3RoID0gMDtcblxuICAgICAgICB0aGlzLl9maWxlV2F0Y2hlcnMuZm9yRWFjaCh3YXRjaGVyID0+IHdhdGNoZXIuY2xvc2UoKSk7XG4gICAgICAgIHRoaXMuX2ZpbGVXYXRjaGVycy5sZW5ndGggPSAwO1xuXG4gICAgICAgIHRoaXMuX3NldHRpbmdzT2JzZXJ2ZXJzLmZvckVhY2gob2JzZXJ2ZXIgPT4gb2JzZXJ2ZXIuZGlzcG9zZSgpKTtcbiAgICAgICAgdGhpcy5fc2V0dGluZ3NPYnNlcnZlcnMubGVuZ3RoID0gMDtcblxuICAgICAgICAvLyBJbiBjYXNlIG9mIHNldHRpbmdzIGNoYW5nZSwgdGhlc2UgcmVmZXJlbmNlcyBtdXN0IHN0YXkgaW50YWN0IGZvciB0aGUgcHJvdmlkZSBtZXRob2QgYmVsb3cgdG8gd29ya1xuICAgICAgICB0aGlzLmZpbGVzTWFwLmNsZWFyKCk7XG4gICAgICAgIHRoaXMucHJvamVjdERlcHMuY2xlYXIoKTtcbiAgICB9LFxuXG4gICAgcHJvdmlkZSgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBJbXBvcnRDb21wbGV0aW9uUHJvdmlkZXIodGhpcy5wcm9qZWN0RGVwcywgdGhpcy5maWxlc01hcCk7XG4gICAgfSxcblxuICAgIF9idWlsZFByb2plY3RGaWxlc0xpc3QocHJvamVjdFBhdGhzLCB7ZXhjbHVkZWREaXJzLCBmaWxlVHlwZXMsIHNob3dIaWRkZW59KSB7XG4gICAgICAgIHByb2plY3RQYXRocy5mb3JFYWNoKHAgPT4ge1xuICAgICAgICAgICAgbGV0IGZpbGVUeXBlTWF0Y2hlciA9ICcvKic7XG5cbiAgICAgICAgICAgIC8vIFRPRE86IHB1dCB0aGlzIGZpbGVtYXRjaGluZyBsb2dpYyBpbnRvIGEgdXRpbGl0eVxuICAgICAgICAgICAgaWYgKGZpbGVUeXBlcy5sZW5ndGggJiYgZmlsZVR5cGVzWzBdICE9PSAnKicpIHtcbiAgICAgICAgICAgICAgICBmaWxlVHlwZU1hdGNoZXIgKz0gYC57JHtmaWxlVHlwZXMuam9pbignLCcpfX1gXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIHRoZSBkb3VibGUgbWF0Y2hpbmcgaXMgZG9uZSB0byBjaGVjayB0aGUgdG9wIGxldmVsIGRpciA6LS9cbiAgICAgICAgICAgIGxldCBnbG9iUGF0dGVybiA9ICd7JyArIHAgKyBmaWxlVHlwZU1hdGNoZXIgKyAnLCcgKyBwO1xuXG4gICAgICAgICAgICAvLyBUT0RPOiBtYWtlIHRoaXMgd29yayB3aXRoIG5vbiB0b3AgbGV2ZWwgZGlyc1xuICAgICAgICAgICAgaWYgKGV4Y2x1ZGVkRGlycy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBnbG9iUGF0dGVybiArPSBgLyEoJHtleGNsdWRlZERpcnMuam9pbignfCcpfSlgO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBnbG9iUGF0dGVybiArPSAnLyoqJyArIGZpbGVUeXBlTWF0Y2hlciArICd9JztcblxuICAgICAgICAgICAgZ2xvYihnbG9iUGF0dGVybiwge2RvdDogc2hvd0hpZGRlbiwgbm9kaXI6IHRydWV9LCAoZXJyLCBjaGlsZFBhdGhzKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5maWxlc01hcC5zZXQocCwgY2hpbGRQYXRocy5tYXAoY2hpbGQgPT4gcGF0aC5yZWxhdGl2ZShwLCBjaGlsZCkpKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgX3NlYXJjaEZvclByb2plY3REZXBzKHByb2plY3RQYXRocywgcGFja2FnZVNldHRpbmdzKSB7XG4gICAgICAgIGlmICghcHJvamVjdFBhdGhzLmxlbmd0aCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgcGFja2FnZUV4dHJhY3Rpb24gPSBwcm9qZWN0UGF0aHMubWFwKHAgPT4ge1xuICAgICAgICAgICAgY29uc3QgcGFja2FnZUNvbmZQYXRoID0gcCArICcvcGFja2FnZS5qc29uJztcblxuICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgICAgICAgICAgICAgIGZzLnN0YXQocGFja2FnZUNvbmZQYXRoLCAoZXJyLCBzdGF0cykgPT4gcmVzb2x2ZSh7c3RhdHMsIHBhdGg6IHBhY2thZ2VDb25mUGF0aH0pKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICBQcm9taXNlLmFsbChwYWNrYWdlRXh0cmFjdGlvbilcbiAgICAgICAgICAgIC50aGVuKHJlc29sdmVkID0+IHtcbiAgICAgICAgICAgICAgICAvLyBPbmx5IGdldCB0aGUgZmlsZXMgdGhhdCBleGlzdFxuICAgICAgICAgICAgICAgIGNvbnN0IHBhY2thZ2VDb25mcyA9IHJlc29sdmVkLmZpbHRlcihyID0+IHIuc3RhdHMgJiYgci5zdGF0cy5pc0ZpbGUoKSk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5hbGwocGFja2FnZUNvbmZzLm1hcChjb25mID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fZmlsZVdhdGNoZXJzLnB1c2goZnMud2F0Y2goY29uZi5wYXRoLCBldmVudFR5cGUgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGV2ZW50VHlwZSA9PT0gJ2NoYW5nZScpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVhZEZpbGVQcm9taXNlKGNvbmYucGF0aClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oZmlsZSA9PiBwYXJzZVBhY2thZ2VKU09OKGZpbGUsIHRoaXMucHJvamVjdERlcHMsIHBhY2thZ2VTZXR0aW5ncykpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlYWRGaWxlUHJvbWlzZShjb25mLnBhdGgpO1xuICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAudGhlbihmaWxlcyA9PiB7XG4gICAgICAgICAgICAgICAgZmlsZXMuZm9yRWFjaChmID0+IHBhcnNlUGFja2FnZUpTT04oZiwgdGhpcy5wcm9qZWN0RGVwcywgcGFja2FnZVNldHRpbmdzKSk7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLmNhdGNoKCgpID0+IHt9KTtcbiAgICB9XG59XG4iXX0=