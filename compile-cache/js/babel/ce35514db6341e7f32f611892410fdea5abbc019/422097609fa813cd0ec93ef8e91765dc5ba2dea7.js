Object.defineProperty(exports, '__esModule', {
    value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _utils = require('./utils');

var _fuzzy = require('fuzzy');

var Fuzzy = _interopRequireWildcard(_fuzzy);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

'use babel';

var ImportCompletionProvider = (function () {
    function ImportCompletionProvider(projectDeps, filesMap) {
        _classCallCheck(this, ImportCompletionProvider);

        this.selector = '.source.js, .source.ts';
        this.disableForSelector = '.source.js .comment, .source.ts .comment';
        // Include as higher priority than default auto complete suggestions
        this.inclusionPriority = 1;

        // Get search structures via Dependency injection
        this.projectDeps = projectDeps;
        this.filesMap = filesMap;
    }

    _createClass(ImportCompletionProvider, [{
        key: 'getSuggestions',
        value: function getSuggestions(_ref) {
            var _this = this;

            var editor = _ref.editor;
            var bufferPosition = _ref.bufferPosition;

            return Promise.resolve().then(function () {
                // TODO: this strategy won't work when the cursor is in the middle
                var prefix = _this._getPrefix(editor, bufferPosition);
                var settings = atom.config.get('autocomplete-js-import');
                var packageName = (0, _utils.capturedDependency)(prefix, settings.importTypes);
                var results = [];

                if (!packageName) {
                    return results;
                }

                // checks for packages starting with name ../ or ./
                if (/^\.{1,2}\//.test(packageName)) {
                    var _ret = (function () {
                        var _getDirAndFilePrefix = (0, _utils.getDirAndFilePrefix)(packageName);

                        var _getDirAndFilePrefix2 = _slicedToArray(_getDirAndFilePrefix, 2);

                        var inputtedRelativePath = _getDirAndFilePrefix2[0];
                        var toComplete = _getDirAndFilePrefix2[1];

                        var currentDirPath = (0, _utils.getParentDir)(editor.getPath());
                        var absolutePath = _path2['default'].resolve(currentDirPath, inputtedRelativePath);

                        return {
                            v: new Promise(function (resolve) {
                                _fs2['default'].readdir(absolutePath, function (err, files) {
                                    if (!files) {
                                        return resolve([]);
                                    }

                                    var matchingFiles = files.filter(function (f) {
                                        return (0, _utils.startsWith)(f, toComplete);
                                    });

                                    if (!settings.hiddenFiles) {
                                        matchingFiles = matchingFiles.filter((0, _utils.not)(_utils.isHiddenFile));
                                    }

                                    resolve(matchingFiles.map(function (d) {
                                        return (0, _utils.dropExtensions)(d, settings.removeExtensions);
                                    }));
                                });
                            })['catch'](function () {/* shit happens */})
                        };
                    })();

                    if (typeof _ret === 'object') return _ret.v;
                } else if ((0, _utils.matchesNPMNaming)(packageName)) {
                        results.push.apply(results, _toConsumableArray(_this.projectDeps.search(editor.getPath(), packageName)));
                    }

                // This is last to give more precedence to package and local file name matches
                if (settings.fuzzy.enabled) {
                    results.push.apply(results, _toConsumableArray(_this._findInFiles(editor.getPath(), packageName, 6, settings.removeExtensions)));
                }

                return results;
            }).then(function (completions) {
                // TODO: if part of the text is already present then replace the text or align it
                // ^ e.g in<cursor><enter>dex will result in index.jsdex instead of index.js
                if (completions && completions.length) {
                    return completions.map(function (c) {
                        var fullCompletion = {
                            type: 'import'
                        };

                        if (typeof c === 'string') {
                            fullCompletion.text = c;
                        } else {
                            Object.assign(fullCompletion, c);
                        }

                        return fullCompletion;
                    });
                }

                return [];
            })['catch'](function () {
                // because shit happens and I need to get work done
            });
        }
    }, {
        key: '_getPrefix',
        value: function _getPrefix(editor, _ref2) {
            var row = _ref2.row;
            var column = _ref2.column;

            var prefixRange = new _atom.Range(new _atom.Point(row, 0), new _atom.Point(row, column));

            return editor.getTextInBufferRange(prefixRange);
        }

        /**
         * @private
         * @param  {String} editorPath
         * @param  {String} stringPattern
         * @param  {Number} max
         * @param  {Array<String>} removeExtensionsSetting - array of extensions to remove from results
         * @return {Array<Object<text: String, displayText: String>>}
         */
    }, {
        key: '_findInFiles',
        value: function _findInFiles(editorPath, stringPattern, max, removeExtensionsSetting) {
            var rootDirs = atom.project.getDirectories();
            var containingRoot = rootDirs.find(function (dir) {
                return dir.contains(editorPath);
            });
            var results = [];

            if (!containingRoot) {
                return results;
            }

            var targetFileList = this.filesMap.get(containingRoot.path);

            for (var i = 0; i < targetFileList.length && results.length < max; i++) {
                if (Fuzzy.test(stringPattern, targetFileList[i])) {
                    var rootRelativePath = targetFileList[i];
                    var currFileRelativePath = _path2['default'].relative((0, _utils.getParentDir)(editorPath), containingRoot.path + '/' + rootRelativePath);

                    // TODO: I have no idea how buggy this is
                    // path.relative doesn't add a './' for files in same directory
                    if (/^[^.]/.test(currFileRelativePath)) {
                        currFileRelativePath = './' + currFileRelativePath;
                    }

                    currFileRelativePath = (0, _utils.dropExtensions)(currFileRelativePath, removeExtensionsSetting);

                    // Show the full path because it lines up with what the user is typing,
                    // but just insert the path relative to the user's current file
                    results.push({ text: currFileRelativePath, displayText: rootRelativePath });
                }
            }

            return results;
        }
    }]);

    return ImportCompletionProvider;
})();

exports['default'] = ImportCompletionProvider;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3NlcGlyb3BodC8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtanMtaW1wb3J0L2xpYi9wcm92aWRlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O29CQUMyQixNQUFNOztxQkFVekIsU0FBUzs7cUJBQ00sT0FBTzs7SUFBbEIsS0FBSzs7b0JBQ0EsTUFBTTs7OztrQkFDUixJQUFJOzs7O0FBZG5CLFdBQVcsQ0FBQTs7SUFnQlUsd0JBQXdCO0FBQzlCLGFBRE0sd0JBQXdCLENBQzdCLFdBQVcsRUFBRSxRQUFRLEVBQUU7OEJBRGxCLHdCQUF3Qjs7QUFFckMsWUFBSSxDQUFDLFFBQVEsR0FBSSx3QkFBd0IsQ0FBQztBQUMxQyxZQUFJLENBQUMsa0JBQWtCLEdBQUcsMENBQTBDLENBQUM7O0FBRXJFLFlBQUksQ0FBQyxpQkFBaUIsR0FBRyxDQUFDLENBQUM7OztBQUczQixZQUFJLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQztBQUMvQixZQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztLQUM1Qjs7aUJBVmdCLHdCQUF3Qjs7ZUFZM0Isd0JBQUMsSUFBd0IsRUFBRTs7O2dCQUF6QixNQUFNLEdBQVAsSUFBd0IsQ0FBdkIsTUFBTTtnQkFBRSxjQUFjLEdBQXZCLElBQXdCLENBQWYsY0FBYzs7QUFDbEMsbUJBQU8sT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUNuQixJQUFJLENBQUMsWUFBTTs7QUFFUixvQkFBTSxNQUFNLEdBQUcsTUFBSyxVQUFVLENBQUMsTUFBTSxFQUFFLGNBQWMsQ0FBQyxDQUFDO0FBQ3ZELG9CQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO0FBQzNELG9CQUFNLFdBQVcsR0FBRywrQkFBbUIsTUFBTSxFQUFFLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUNyRSxvQkFBTSxPQUFPLEdBQUcsRUFBRSxDQUFDOztBQUVuQixvQkFB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Q3REOztBQUVELHdDQUFvQixHQUFHLDJCQUFlLG9CQUFvQixFQUFFLHVCQUF1QixDQUFDLENBQUM7Ozs7QUFJckYsMkJBQU8sQ0FBQyxJQUFJLENBQUMsRUFBQyxJQUFJLEVBQUUsb0JBQW9CLEVBQUUsV0FBVyxFQUFFLGdCQUFnQixFQUFDLENBQUMsQ0FBQztpQkFDN0U7YUFDSjs7QUFFRCxtQkFBTyxPQUFPLENBQUM7U0FDbEI7OztXQW5JZ0Isd0JBQXdCOzs7cUJBQXhCLHdCQUF3QiIsImZpbGUiOiIvaG9tZS9zZXBpcm9waHQvLmF0b20vcGFja2FnZXMvYXV0b2NvbXBsZXRlLWpzLWltcG9ydC9saWIvcHJvdmlkZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJ1xuaW1wb3J0IHtSYW5nZSwgUG9pbnR9IGZyb20gJ2F0b20nO1xuaW1wb3J0IHtcbiAgICBzdGFydHNXaXRoLFxuICAgIGNhcHR1cmVkRGVwZW5kZW5jeSxcbiAgICBub3QsXG4gICAgaXNIaWRkZW5GaWxlLFxuICAgIG1hdGNoZXNOUE1OYW1pbmcsXG4gICAgZHJvcEV4dGVuc2lvbnMsXG4gICAgZ2V0UGFyZW50RGlyLFxuICAgIGdldERpckFuZEZpbGVQcmVmaXhcbiB9IGZyb20gJy4vdXRpbHMnO1xuaW1wb3J0ICogYXMgRnV6enkgZnJvbSAnZnV6enknO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgZnMgZnJvbSAnZnMnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBJbXBvcnRDb21wbGV0aW9uUHJvdmlkZXIge1xuICAgIGNvbnN0cnVjdG9yKHByb2plY3REZXBzLCBmaWxlc01hcCkge1xuICAgICAgICB0aGlzLnNlbGVjdG9yID0gICcuc291cmNlLmpzLCAuc291cmNlLnRzJztcbiAgICAgICAgdGhpcy5kaXNhYmxlRm9yU2VsZWN0b3IgPSAnLnNvdXJjZS5qcyAuY29tbWVudCwgLnNvdXJjZS50cyAuY29tbWVudCc7XG4gICAgICAgIC8vIEluY2x1ZGUgYXMgaGlnaGVyIHByaW9yaXR5IHRoYW4gZGVmYXVsdCBhdXRvIGNvbXBsZXRlIHN1Z2dlc3Rpb25zXG4gICAgICAgIHRoaXMuaW5jbHVzaW9uUHJpb3JpdHkgPSAxO1xuXG4gICAgICAgIC8vIEdldCBzZWFyY2ggc3RydWN0dXJlcyB2aWEgRGVwZW5kZW5jeSBpbmplY3Rpb25cbiAgICAgICAgdGhpcy5wcm9qZWN0RGVwcyA9IHByb2plY3REZXBzO1xuICAgICAgICB0aGlzLmZpbGVzTWFwID0gZmlsZXNNYXA7XG4gICAgfVxuXG4gICAgZ2V0U3VnZ2VzdGlvbnMoe2VkaXRvciwgYnVmZmVyUG9zaXRpb259KSB7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKVxuICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIC8vIFRPRE86IHRoaXMgc3RyYXRlZ3kgd29uJ3Qgd29yayB3aGVuIHRoZSBjdXJzb3IgaXMgaW4gdGhlIG1pZGRsZVxuICAgICAgICAgICAgICAgIGNvbnN0IHByZWZpeCA9IHRoaXMuX2dldFByZWZpeChlZGl0b3IsIGJ1ZmZlclBvc2l0aW9uKTtcbiAgICAgICAgICAgICAgICBjb25zdCBzZXR0aW5ncyA9IGF0b20uY29uZmlnLmdldCgnYXV0b2NvbXBsZXRlLWpzLWltcG9ydCcpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHBhY2thZ2VOYW1lID0gY2FwdHVyZWREZXBlbmRlbmN5KHByZWZpeCwgc2V0dGluZ3MuaW1wb3J0VHlwZXMpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdHMgPSBbXTtcblxuICAgICAgICAgICAgICAgIGlmICghcGFja2FnZU5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gY2hlY2tzIGZvciBwYWNrYWdlcyBzdGFydGluZyB3aXRoIG5hbWUgLi4vIG9yIC4vXG4gICAgICAgICAgICAgICAgaWYgKC9eXFwuezEsMn1cXC8vLnRlc3QocGFja2FnZU5hbWUpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IFtpbnB1dHRlZFJlbGF0aXZlUGF0aCwgdG9Db21wbGV0ZV0gPSBnZXREaXJBbmRGaWxlUHJlZml4KHBhY2thZ2VOYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY3VycmVudERpclBhdGggPSBnZXRQYXJlbnREaXIoZWRpdG9yLmdldFBhdGgoKSk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGFic29sdXRlUGF0aCA9IHBhdGgucmVzb2x2ZShjdXJyZW50RGlyUGF0aCwgaW5wdXR0ZWRSZWxhdGl2ZVBhdGgpO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZzLnJlYWRkaXIoYWJzb2x1dGVQYXRoLCAoZXJyLCBmaWxlcykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghZmlsZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc29sdmUoW10pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBtYXRjaGluZ0ZpbGVzID0gZmlsZXMuZmlsdGVyKGYgPT4gc3RhcnRzV2l0aChmLCB0b0NvbXBsZXRlKSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXNldHRpbmdzLmhpZGRlbkZpbGVzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hdGNoaW5nRmlsZXMgPSBtYXRjaGluZ0ZpbGVzLmZpbHRlcihub3QoaXNIaWRkZW5GaWxlKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShtYXRjaGluZ0ZpbGVzLm1hcChkID0+IGRyb3BFeHRlbnNpb25zKGQsIHNldHRpbmdzLnJlbW92ZUV4dGVuc2lvbnMpKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9KS5jYXRjaCgoKSA9PiB7Lyogc2hpdCBoYXBwZW5zICovfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChtYXRjaGVzTlBNTmFtaW5nKHBhY2thZ2VOYW1lKSkge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHRzLnB1c2goLi4udGhpcy5wcm9qZWN0RGVwcy5zZWFyY2goZWRpdG9yLmdldFBhdGgoKSwgcGFja2FnZU5hbWUpKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBUaGlzIGlzIGxhc3QgdG8gZ2l2ZSBtb3JlIHByZWNlZGVuY2UgdG8gcGFja2FnZSBhbmQgbG9jYWwgZmlsZSBuYW1lIG1hdGNoZXNcbiAgICAgICAgICAgICAgICBpZiAoc2V0dGluZ3MuZnV6enkuZW5hYmxlZCkge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHRzLnB1c2goLi4udGhpcy5fZmluZEluRmlsZXMoZWRpdG9yLmdldFBhdGgoKSwgcGFja2FnZU5hbWUsIDYsIHNldHRpbmdzLnJlbW92ZUV4dGVuc2lvbnMpKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0cztcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAudGhlbihjb21wbGV0aW9ucyA9PiB7XG4gICAgICAgICAgICAgICAgLy8gVE9ETzogaWYgcGFydCBvZiB0aGUgdGV4dCBpcyBhbHJlYWR5IHByZXNlbnQgdGhlbiByZXBsYWNlIHRoZSB0ZXh0IG9yIGFsaWduIGl0XG4gICAgICAgICAgICAgICAgLy8gXiBlLmcgaW48Y3Vyc29yPjxlbnRlcj5kZXggd2lsbCByZXN1bHQgaW4gaW5kZXguanNkZXggaW5zdGVhZCBvZiBpbmRleC5qc1xuICAgICAgICAgICAgICAgIGlmIChjb21wbGV0aW9ucyAmJiBjb21wbGV0aW9ucy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNvbXBsZXRpb25zLm1hcChjID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGZ1bGxDb21wbGV0aW9uID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdpbXBvcnQnXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGMgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZnVsbENvbXBsZXRpb24udGV4dCA9IGM7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIE9iamVjdC5hc3NpZ24oZnVsbENvbXBsZXRpb24sIGMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZnVsbENvbXBsZXRpb247XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuY2F0Y2goKCkgPT4ge1xuICAgICAgICAgICAgICAgIC8vIGJlY2F1c2Ugc2hpdCBoYXBwZW5zIGFuZCBJIG5lZWQgdG8gZ2V0IHdvcmsgZG9uZVxuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgX2dldFByZWZpeChlZGl0b3IsIHtyb3csIGNvbHVtbn0pIHtcbiAgICAgICAgY29uc3QgcHJlZml4UmFuZ2UgPSBuZXcgUmFuZ2UobmV3IFBvaW50KHJvdywgMCksIG5ldyBQb2ludChyb3csIGNvbHVtbikpO1xuXG4gICAgICAgIHJldHVybiBlZGl0b3IuZ2V0VGV4dEluQnVmZmVyUmFuZ2UocHJlZml4UmFuZ2UpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHBhcmFtICB7U3RyaW5nfSBlZGl0b3JQYXRoXG4gICAgICogQHBhcmFtICB7U3RyaW5nfSBzdHJpbmdQYXR0ZXJuXG4gICAgICogQHBhcmFtICB7TnVtYmVyfSBtYXhcbiAgICAgKiBAcGFyYW0gIHtBcnJheTxTdHJpbmc+fSByZW1vdmVFeHRlbnNpb25zU2V0dGluZyAtIGFycmF5IG9mIGV4dGVuc2lvbnMgdG8gcmVtb3ZlIGZyb20gcmVzdWx0c1xuICAgICAqIEByZXR1cm4ge0FycmF5PE9iamVjdDx0ZXh0OiBTdHJpbmcsIGRpc3BsYXlUZXh0OiBTdHJpbmc+Pn1cbiAgICAgKi9cbiAgICBfZmluZEluRmlsZXMoZWRpdG9yUGF0aCwgc3RyaW5nUGF0dGVybiwgbWF4LCByZW1vdmVFeHRlbnNpb25zU2V0dGluZykge1xuICAgICAgICBjb25zdCByb290RGlycyA9IGF0b20ucHJvamVjdC5nZXREaXJlY3RvcmllcygpO1xuICAgICAgICBjb25zdCBjb250YWluaW5nUm9vdCA9IHJvb3REaXJzLmZpbmQoZGlyID0+IGRpci5jb250YWlucyhlZGl0b3JQYXRoKSk7XG4gICAgICAgIGNvbnN0IHJlc3VsdHMgPSBbXTtcblxuICAgICAgICBpZiAoIWNvbnRhaW5pbmdSb290KSB7XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0cztcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHRhcmdldEZpbGVMaXN0ID0gdGhpcy5maWxlc01hcC5nZXQoY29udGFpbmluZ1Jvb3QucGF0aCk7XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0YXJnZXRGaWxlTGlzdC5sZW5ndGggJiYgcmVzdWx0cy5sZW5ndGggPCBtYXg7IGkrKykge1xuICAgICAgICAgICAgaWYgKEZ1enp5LnRlc3Qoc3RyaW5nUGF0dGVybiwgdGFyZ2V0RmlsZUxpc3RbaV0pKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgcm9vdFJlbGF0aXZlUGF0aCA9IHRhcmdldEZpbGVMaXN0W2ldO1xuICAgICAgICAgICAgICAgIGxldCBjdXJyRmlsZVJlbGF0aXZlUGF0aCA9IHBhdGgucmVsYXRpdmUoXG4gICAgICAgICAgICAgICAgICAgIGdldFBhcmVudERpcihlZGl0b3JQYXRoKSxcbiAgICAgICAgICAgICAgICAgICAgY29udGFpbmluZ1Jvb3QucGF0aCArICcvJyArIHJvb3RSZWxhdGl2ZVBhdGhcbiAgICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAgICAgLy8gVE9ETzogSSBoYXZlIG5vIGlkZWEgaG93IGJ1Z2d5IHRoaXMgaXNcbiAgICAgICAgICAgICAgICAvLyBwYXRoLnJlbGF0aXZlIGRvZXNuJ3QgYWRkIGEgJy4vJyBmb3IgZmlsZXMgaW4gc2FtZSBkaXJlY3RvcnlcbiAgICAgICAgICAgICAgICBpZiAoL15bXi5dLy50ZXN0KGN1cnJGaWxlUmVsYXRpdmVQYXRoKSkge1xuICAgICAgICAgICAgICAgICAgICBjdXJyRmlsZVJlbGF0aXZlUGF0aCA9ICcuLycgKyBjdXJyRmlsZVJlbGF0aXZlUGF0aDtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBjdXJyRmlsZVJlbGF0aXZlUGF0aCA9IGRyb3BFeHRlbnNpb25zKGN1cnJGaWxlUmVsYXRpdmVQYXRoLCByZW1vdmVFeHRlbnNpb25zU2V0dGluZyk7XG5cbiAgICAgICAgICAgICAgICAvLyBTaG93IHRoZSBmdWxsIHBhdGggYmVjYXVzZSBpdCBsaW5lcyB1cCB3aXRoIHdoYXQgdGhlIHVzZXIgaXMgdHlwaW5nLFxuICAgICAgICAgICAgICAgIC8vIGJ1dCBqdXN0IGluc2VydCB0aGUgcGF0aCByZWxhdGl2ZSB0byB0aGUgdXNlcidzIGN1cnJlbnQgZmlsZVxuICAgICAgICAgICAgICAgIHJlc3VsdHMucHVzaCh7dGV4dDogY3VyckZpbGVSZWxhdGl2ZVBhdGgsIGRpc3BsYXlUZXh0OiByb290UmVsYXRpdmVQYXRofSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmVzdWx0cztcbiAgICB9XG59XG4iXX0=