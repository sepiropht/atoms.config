'use babel';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var Promise = require('bluebird');
var readdir = Promise.promisify(require('fs').readdir);
var path = require('path');
var fuzzaldrin = require('fuzzaldrin');
var escapeRegExp = require('lodash.escaperegexp');
var get = require('lodash.get');
var findBabelConfig = require('find-babel-config');
var internalModules = require('./utils/internal-modules');

var LINE_REGEXP = /require|import|export\s+(?:\*|{[a-zA-Z0-9_$,\s]+})+\s+from|}\s*from\s*['"]/;
var SELECTOR = ['.source.js .string.quoted',

// for babel-language plugin
'.source.js .punctuation.definition.string.end', '.source.js .punctuation.definition.string.begin', '.source.ts .string.quoted', '.source.coffee .string.quoted'];
var SELECTOR_DISABLE = ['.source.js .comment', '.source.js .keyword', '.source.ts .comment', '.source.ts .keyword'];

var CompletionProvider = (function () {
  function CompletionProvider() {
    _classCallCheck(this, CompletionProvider);

    this.selector = SELECTOR.join(', ');
    this.disableForSelector = SELECTOR_DISABLE.join(', ');
    this.inclusionPriority = 1;
  }

  _createClass(CompletionProvider, [{
    key: 'getSuggestions',
    value: function getSuggestions(_ref) {
      var _this = this;

      var editor = _ref.editor;
      var bufferPosition = _ref.bufferPosition;
      var prefix = _ref.prefix;

      var line = editor.getTextInRange([[bufferPosition.row, 0], bufferPosition]);
      if (!LINE_REGEXP.test(line)) {
        return [];
      }

      var realPrefix = this.getRealPrefix(prefix, line);
      if (!realPrefix) {
        return [];
      }

      if (realPrefix[0] === '.') {
        return this.lookupLocal(realPrefix, path.dirname(editor.getPath()));
      }

      var vendors = atom.config.get('autocomplete-modules.vendors');

      var promises = vendors.map(function (vendor) {
        return _this.lookupGlobal(realPrefix, vendor);
      });

      var webpack = atom.config.get('autocomplete-modules.webpack');
      if (webpack) {
        promises.push(this.lookupWebpack(realPrefix));
      }

      var babelPluginModuleResolver = atom.config.get('autocomplete-modules.babelPluginModuleResolver');
      if (babelPluginModuleResolver) {
        promises.push(this.lookupbabelPluginModuleResolver(realPrefix));
      }

      return Promise.all(promises).then(function (suggestions) {
        var _ref2;

        return (_ref2 = []).concat.apply(_ref2, _toConsumableArray(suggestions));
      });
    }
  }, {
    key: 'getRealPrefix',
    value: function getRealPrefix(prefix, line) {
      try {
        var realPrefixRegExp = new RegExp('[\'"]((?:.+?)*' + escapeRegExp(prefix) + ')');
        var realPrefixMathes = realPrefixRegExp.exec(line);
        if (!realPrefixMathes) {
          return false;
        }

        return realPrefixMathes[1];
      } catch (e) {
        return false;
      }
    }
  }, {
    key: 'filterSuggestions',
    value: function filterSuggestions(prefix, suggestions) {
      return fuzzaldrin.filter(suggestions, prefix, {
        key: 'text'
      });
    }
  }, {
    key: 'lookupLocal',
    value: function lookupLocal(prefix, dirname) {
      var _this2 = this;

      var filterPrefix = prefix.replace(path.dirname(prefix), '').replace('/', '');
      if (filterPrefix[filterPrefix.length - 1] === '/') {
        filterPrefix = '';
      }

      var includeExtension = atom.config.get('autocomplete-modules.includeExtension');
      var lookupDirname = path.resolve(dirname, prefix);
      if (filterPrefix) {
        lookupDirname = lookupDirname.replace(new RegExp(escapeRegExp(filterPrefix) + '$'), '');
      }

      return readdir(lookupDirname)['catch'](function (e) {
        if (e.code !== 'ENOENT') {
          throw e;
        }

        return [];
      }).filter(function (filename) {
        return filename[0] !== '.';
      }).map(function (pathname) {
        return {
          text: includeExtension ? pathname : _this2.normalizeLocal(pathname),
          displayText: pathname,
          type: 'import'
        };
      }).then(function (suggestions) {
        return _this2.filterSuggestions(filterPrefix, suggestions);
      });
    }
  }, {
    key: 'normalizeLocal',
    value: function normalizeLocal(filename) {
      return filename.replace(/\.(js|es6|jsx|coffee|ts|tsx)$/, '');
    }
  }, {
    key: 'lookupGlobal',
    value: function lookupGlobal(prefix) {
      var _this3 = this;

      var vendor = arguments.length <= 1 || arguments[1] === undefined ? 'node_modules' : arguments[1];

      var projectPath = atom.project.getPaths()[0];
      if (!projectPath) {
        return Promise.resolve([]);
      }

      var vendorPath = path.join(projectPath, vendor);
      if (prefix.indexOf('/') !== -1) {
        return this.lookupLocal('./' + prefix, vendorPath);
      }

      return readdir(vendorPath)['catch'](function (e) {
        if (e.code !== 'ENOENT') {
          throw e;
        }

        return [];
      }).then(function (libs) {
        return [].concat(_toConsumableArray(internalModules), _toConsumableArray(libs));
      }).map(function (lib) {
        return {
          text: lib,
          replacementPrefix: prefix,
          type: 'import'
        };
      }).then(function (suggestions) {
        return _this3.filterSuggestions(prefix, suggestions);
      });
    }
  }, {
    key: 'lookupWebpack',
    value: function lookupWebpack(prefix) {
      var _this4 = this;

      var projectPath = atom.project.getPaths()[0];
      if (!projectPath) {
        return Promise.resolve([]);
      }

      var vendors = atom.config.get('autocomplete-modules.vendors');
      var webpackConfig = this.fetchWebpackConfig(projectPath);

      var webpackRoot = get(webpackConfig, 'resolve.root', '');
      var moduleSearchPaths = get(webpackConfig, 'resolve.modulesDirectories', []);
      moduleSearchPaths = moduleSearchPaths.filter(function (item) {
        return vendors.indexOf(item) === -1;
      });

      return Promise.all(moduleSearchPaths.map(function (searchPath) {
        return _this4.lookupLocal(prefix, path.join(webpackRoot, searchPath));
      })).then(function (suggestions) {
        var _ref3;

        return (_ref3 = []).concat.apply(_ref3, _toConsumableArray(suggestions));
      });
    }
  }, {
    key: 'fetchWebpackConfig',
    value: function fetchWebpackConfig(rootPath) {
      var webpackConfigFilename = atom.config.get('autocomplete-modules.webpackConfigFilename');
      var webpackConfigPath = path.join(rootPath, webpackConfigFilename);

      try {
        return require(webpackConfigPath); // eslint-disable-line
      } catch (error) {
        return {};
      }
    }
  }, {
    key: 'lookupbabelPluginModuleResolver',
    value: function lookupbabelPluginModuleResolver(prefix) {
      var _this5 = this;

      var projectPath = atom.project.getPaths()[0];
      if (projectPath) {
        return findBabelConfig(projectPath).then(function (_ref4) {
          var config = _ref4.config;

          if (config && Array.isArray(config.plugins)) {
            var _ret = (function () {
              // Grab the v1 (module-alias) or v2 (module-resolver) plugin configuration
              var pluginConfig = config.plugins.find(function (p) {
                return p[0] === 'module-alias' || p[0] === 'babel-plugin-module-alias';
              }) || config.plugins.find(function (p) {
                return p[0] === 'module-resolver' || p[0] === 'babel-plugin-module-resolver';
              });
              if (!pluginConfig) {
                return {
                  v: []
                };
              }

              // Only v2 of the plugin supports custom root directories
              var rootPromises = [];
              if (!Array.isArray(pluginConfig[1])) {
                var rootDirs = pluginConfig[1].root || [];
                rootPromises = rootPromises.concat(rootDirs.map(function (r) {
                  var rootDirPath = path.join(projectPath, r);
                  return _this5.lookupLocal('./' + prefix, rootDirPath);
                }));
              }

              // determine the right prefix for the alias config
              // `realPrefix` is the prefix we want to use to find the right file/suggestions
              // when the prefix is a sub module (eg. module/subfile),
              // `modulePrefix` will be "module", and `realPrefix` will be "subfile"
              var prefixSplit = prefix.split('/');
              var modulePrefix = prefixSplit[0];
              var realPrefix = prefixSplit.pop();
              var moduleSearchPath = prefixSplit.join('/');

              // get the alias configs for the specific module
              var aliasConfig = Array.isArray(pluginConfig[1])
              // v1 of the plugin is an array
              ? pluginConfig[1].filter(function (alias) {
                return alias.expose.startsWith(modulePrefix);
              })
              // otherwise it's v2 (an object)
              : Object.keys(pluginConfig[1].alias || {}).filter(function (expose) {
                return expose.startsWith(modulePrefix);
              }).map(function (exp) {
                return {
                  expose: exp,
                  src: pluginConfig[1].alias[exp]
                };
              });

              return {
                v: Promise.all(rootPromises.concat(aliasConfig.map(function (alias) {
                  // The search path is the parent directory of the source directory specified in .babelrc
                  // then we append the `moduleSearchPath` to get the real search path
                  var searchPath = path.join(path.dirname(path.resolve(projectPath, alias.src)), moduleSearchPath);

                  return _this5.lookupLocal(realPrefix, searchPath);
                }))).then(function (suggestions) {
                  var _ref5;

                  return (_ref5 = []).concat.apply(_ref5, _toConsumableArray(suggestions));
                }).then(function (suggestions) {
                  // make sure the suggestions are from the compatible alias
                  if (prefix === realPrefix && aliasConfig.length) {
                    return suggestions.filter(function (sugg) {
                      return aliasConfig.find(function (a) {
                        return a.expose === sugg.text;
                      });
                    });
                  }
                  return suggestions;
                })
              };
            })();

            if (typeof _ret === 'object') return _ret.v;
          }

          return [];
        });
      }
    }
  }]);

  return CompletionProvider;
})();

module.exports = CompletionProvider;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3NlcGlyb3BodC8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtbW9kdWxlcy9zcmMvY29tcGxldGlvbi1wcm92aWRlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxXQUFXLENBQUM7Ozs7Ozs7O0FBRVosSUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ3BDLElBQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ3pELElBQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUM3QixJQUFNLFVBQVUsR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDekMsSUFBTSxZQUFZLEdBQUcsT0FBTyxDQUFDLHFCQUFxQixDQUFDLENBQUM7QUFDcEQsSUFBTSxHQUFHLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQ2xDLElBQU0sZUFBZSxHQUFHLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO0FBQ3JELElBQU0sZUFBZSxHQUFHLE9BQU8sQ0FBQywwQkFBMEIsQ0FBQyxDQUFDOztBQUU1RCxJQUFNLFdBQVcsR0FBRyw0RUFBNEUsQ0FBQztBQUNqRyxJQUFNLFFBQVEsR0FBRyxDQUNmLDJCQUEyQjs7O0FBRzNCLCtDQUErQyxFQUMvQyxpREFBaUQsRUFFakQsMkJBQTJCLEVBQzNCLCtCQUErQixDQUNoQyxDQUFDO0FBQ0YsSUFBTSxnQkFBZ0IsR0FBRyxDQUN2QixxQkFBcUIsRUFDckIscUJBQXFCLEVBQ3JCLHFCQUFxQixFQUNyQixxQkFBcUIsQ0FDdEIsQ0FBQzs7SUFFSSxrQkFBa0I7QUFDWCxXQURQLGtCQUFrQixHQUNSOzBCQURWLGtCQUFrQjs7QUFFcEIsUUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3BDLFFBQUksQ0FBQyxrQkFBa0IsR0FBRyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDdEQsUUFBSSxDQUFDLGlCQUFpQixHQUFHLENBQUMsQ0FBQztHQUM1Qjs7ZUFMRyxrQkFBa0I7O1dBT1Isd0JBQUMsSUFBZ0MsRUFBRTs7O1VBQWpDLE1BQU0sR0FBUCxJQUFnQyxDQUEvQixNQUFNO1VBQUUsY0FBYyxHQUF2QixJQUFnQyxDQUF2QixjQUFjO1VBQUUsTUFBTSxHQUEvQixJQUFnQyxDQUFQLE1BQU07O0FBQzVDLFVBQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEVBQUUsY0FBYyxDQUFDLENBQUMsQ0FBQztBQUM5RSxVQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRTtBQUMzQixlQUFPLEVBQUUsQ0FBQztPQUNYOztBQUVELFVBQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ3BELFVBQUksQ0FBQyxVQUFVLEVBQUU7QUFDZixlQUFPLEVBQUUsQ0FBQztPQUNYOztBQUVELFVBQUksVUFBVSxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsRUFBRTtBQUN6QixlQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQztPQUNyRTs7QUFFRCxVQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDOztBQUVoRSxVQUFNLFFBQVEsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUMxQixVQUFDLE1BQU07ZUFBSyxNQUFLLFlBQVksQ0FBQyxVQUFVLEVBQUUsTUFBTSxDQUFDO09BQUEsQ0FDbEQsQ0FBQzs7QUFFRixVQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDO0FBQ2hFLFVBQUksT0FBTyxFQUFFO0FBQ1gsZ0JBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO09BQy9DOztBQUVELFVBQU0seUJBQXlCLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsZ0RBQWdELENBQUMsQ0FBQztBQUNwRyxVQUFJLHlCQUF5QixFQUFFO0FBQzdCLGdCQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQywrQkFBK0IsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO09BQ2pFOztBQUVELGFBQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQy9CLFVBQUMsV0FBVzs7O2VBQUssU0FBQSxFQUFFLEVBQUMsTUFBTSxNQUFBLDJCQUFJLFdBQVcsRUFBQztPQUFBLENBQzNDLENBQUM7S0FDSDs7O1dBRVksdUJBQUMsTUFBTSxFQUFFLElBQUksRUFBRTtBQUMxQixVQUFJO0FBQ0YsWUFBTSxnQkFBZ0IsR0FBRyxJQUFJLE1BQU0sb0JBQWlCLFlBQVksQ0FBQyxNQUFNLENBQUMsT0FBSSxDQUFDO0FBQzdFLFlBQU0sZ0JBQWdCLEdBQUcsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3JELFlBQUksQ0FBQyxnQkFBZ0IsRUFBRTtBQUNyQixpQkFBTyxLQUFLLENBQUM7U0FDZDs7QUFFRCxlQUFPLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDO09BQzVCLENBQUMsT0FBTyxDQUFDLEVBQUU7QUFDVixlQUFPLEtBQUssQ0FBQztPQUNkO0tBQ0Y7OztXQUVnQiwyQkFBQyxNQUFNLEVBQUUsV0FBVyxFQUFFO0FBQ3JDLGFBQU8sVUFBVSxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsTUFBTSxFQUFFO0FBQzVDLFdBQUcsRUFBRSxNQUFNO09BQ1osQ0FBQyxDQUFDO0tBQ0o7OztXQUVVLHFCQUFDLE1BQU0sRUFBRSxPQUFPLEVBQUU7OztBQUMzQixVQUFJLFlBQVksR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQztBQUM3RSxVQUFJLFlBQVksQ0FBQyxZQUFZLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxLQUFLLEdBQUcsRUFBRTtBQUNqRCxvQkFBWSxHQUFHLEVBQUUsQ0FBQztPQUNuQjs7QUFFRCxVQUFNLGdCQUFnQixHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLHVDQUF1QyxDQUFDLENBQUM7QUFDbEYsVUFBSSxhQUFhLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDbEQsVUFBSSxZQUFZLEVBQUU7QUFDaEIscUJBQWEsR0FBRyxhQUFhLENBQUMsT0FBTyxDQUFDLElBQUksTUFBTSxDQUFJLFlBQVksQ0FBQyxZQUFZLENBQUMsT0FBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO09BQ3pGOztBQUVELGFBQU8sT0FBTyxDQUFDLGFBQWEsQ0FBQyxTQUFNLENBQUMsVUFBQyxDQUFDLEVBQUs7QUFDekMsWUFBSSxDQUFDLENBQUMsSUFBSSxLQUFLLFFBQVEsRUFBRTtBQUN2QixnQkFBTSxDQUFDLENBQUM7U0FDVDs7QUFFRCxlQUFPLEVBQUUsQ0FBQztPQUNYLENBQUMsQ0FBQyxNQUFNLENBQ1AsVUFBQyxRQUFRO2VBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUc7T0FBQSxDQUNsQyxDQUFDLEdBQUcsQ0FBQyxVQUFDLFFBQVE7ZUFBTTtBQUNuQixjQUFJLEVBQUUsZ0JBQWdCLEdBQUcsUUFBUSxHQUFHLE9BQUssY0FBYyxDQUFDLFFBQVEsQ0FBQztBQUNqRSxxQkFBVyxFQUFFLFFBQVE7QUFDckIsY0FBSSxFQUFFLFFBQVE7U0FDZjtPQUFDLENBQUMsQ0FBQyxJQUFJLENBQ04sVUFBQyxXQUFXO2VBQUssT0FBSyxpQkFBaUIsQ0FBQyxZQUFZLEVBQUUsV0FBVyxDQUFDO09BQUEsQ0FDbkUsQ0FBQztLQUNIOzs7V0FFYSx3QkFBQyxRQUFRLEVBQUU7QUFDdkIsYUFBTyxRQUFRLENBQUMsT0FBTyxDQUFDLCtCQUErQixFQUFFLEVBQUUsQ0FBQyxDQUFDO0tBQzlEOzs7V0FFVyxzQkFBQyxNQUFNLEVBQTJCOzs7VUFBekIsTUFBTSx5REFBRyxjQUFjOztBQUMxQyxVQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQy9DLFVBQUksQ0FBQyxXQUFXLEVBQUU7QUFDaEIsZUFBTyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO09BQzVCOztBQUVELFVBQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQ2xELFVBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTtBQUM5QixlQUFPLElBQUksQ0FBQyxXQUFXLFFBQU0sTUFBTSxFQUFJLFVBQVUsQ0FBQyxDQUFDO09BQ3BEOztBQUVELGFBQU8sT0FBTyxDQUFDLFVBQVUsQ0FBQyxTQUFNLENBQUMsVUFBQyxDQUFDLEVBQUs7QUFDdEMsWUFBSSxDQUFDLENBQUMsSUFBSSxLQUFLLFFBQVEsRUFBRTtBQUN2QixnQkFBTSxDQUFDLENBQUM7U0FDVDs7QUFFRCxlQUFPLEVBQUUsQ0FBQztPQUNYLENBQUMsQ0FBQyxJQUFJLENBQ0wsVUFBQyxJQUFJOzRDQUFTLGVBQWUsc0JBQUssSUFBSTtPQUFDLENBQ3hDLENBQUMsR0FBRyxDQUFDLFVBQUMsR0FBRztlQUFNO0FBQ2QsY0FBSSxFQUFFLEdBQUc7QUFDVCwyQkFBaUIsRUFBRSxNQUFNO0FBQ3pCLGNBQUksRUFBRSxRQUFRO1NBQ2Y7T0FBQyxDQUFDLENBQUMsSUFBSSxDQUNOLFVBQUMsV0FBVztlQUFLLE9BQUssaUJBQWlCLENBQUMsTUFBTSxFQUFFLFdBQVcsQ0FBQztPQUFBLENBQzdELENBQUM7S0FDSDs7O1dBRVksdUJBQUMsTUFBTSxFQUFFOzs7QUFDcEIsVUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMvQyxVQUFJLENBQUMsV0FBVyxFQUFFO0FBQ2hCLGVBQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztPQUM1Qjs7QUFFRCxVQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDO0FBQ2hFLFVBQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxXQUFXLENBQUMsQ0FBQzs7QUFFM0QsVUFBTSxXQUFXLEdBQUcsR0FBRyxDQUFDLGFBQWEsRUFBRSxjQUFjLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDM0QsVUFBSSxpQkFBaUIsR0FBRyxHQUFHLENBQUMsYUFBYSxFQUFFLDRCQUE0QixFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQzdFLHVCQUFpQixHQUFHLGlCQUFpQixDQUFDLE1BQU0sQ0FDMUMsVUFBQyxJQUFJO2VBQUssT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7T0FBQSxDQUN2QyxDQUFDOztBQUVGLGFBQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLENBQ3RDLFVBQUMsVUFBVTtlQUFLLE9BQUssV0FBVyxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxVQUFVLENBQUMsQ0FBQztPQUFBLENBQzdFLENBQUMsQ0FBQyxJQUFJLENBQ0wsVUFBQyxXQUFXOzs7ZUFBSyxTQUFBLEVBQUUsRUFBQyxNQUFNLE1BQUEsMkJBQUksV0FBVyxFQUFDO09BQUEsQ0FDM0MsQ0FBQztLQUNIOzs7V0FFaUIsNEJBQUMsUUFBUSxFQUFFO0FBQzNCLFVBQU0scUJBQXFCLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsNENBQTRDLENBQUMsQ0FBQztBQUM1RixVQUFNLGlCQUFpQixHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLHFCQUFxQixDQUFDLENBQUM7O0FBRXJFLFVBQUk7QUFDRixlQUFPLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO09BQ25DLENBQUMsT0FBTyxLQUFLLEVBQUU7QUFDZCxlQUFPLEVBQUUsQ0FBQztPQUNYO0tBQ0Y7OztXQUU4Qix5Q0FBQyxNQUFNLEVBQUU7OztBQUN0QyxVQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQy9DLFVBQUksV0FBVyxFQUFFO0FBQ2YsZUFBTyxlQUFlLENBQUMsV0FBVyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQUMsS0FBUSxFQUFLO2NBQVosTUFBTSxHQUFQLEtBQVEsQ0FBUCxNQUFNOztBQUMvQyxjQUFJLE1BQU0sSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsRUFBRTs7O0FBRTNDLGtCQUFNLFlBQVksR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxVQUFBLENBQUM7dUJBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLGNBQWMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssMkJBQTJCO2VBQUEsQ0FBQyxJQUM1RyxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxVQUFBLENBQUM7dUJBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLGlCQUFpQixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyw4QkFBOEI7ZUFBQSxDQUFDLENBQUM7QUFDbEcsa0JBQUksQ0FBQyxZQUFZLEVBQUU7QUFDakI7cUJBQU8sRUFBRTtrQkFBQztlQUNYOzs7QUFHRCxrQkFBSSxZQUFZLEdBQUcsRUFBRSxDQUFDO0FBQ3RCLGtCQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtBQUNuQyxvQkFBTSxRQUFRLEdBQUcsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxFQUFFLENBQUM7QUFDNUMsNEJBQVksR0FBRyxZQUFZLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsVUFBQSxDQUFDLEVBQUk7QUFDbkQsc0JBQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQzlDLHlCQUFPLE9BQUssV0FBVyxRQUFNLE1BQU0sRUFBSSxXQUFXLENBQUMsQ0FBQztpQkFDckQsQ0FBQyxDQUFDLENBQUM7ZUFDTDs7Ozs7O0FBTUQsa0JBQU0sV0FBVyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDdEMsa0JBQU0sWUFBWSxHQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNwQyxrQkFBTSxVQUFVLEdBQUcsV0FBVyxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBQ3JDLGtCQUFNLGdCQUFnQixHQUFHLFdBQVcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7OztBQUcvQyxrQkFBTSxXQUFXLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUM7O2dCQUU5QyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLFVBQUEsS0FBSzt1QkFBSSxLQUFLLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUM7ZUFBQSxDQUFDOztnQkFFdEUsTUFBTSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxJQUFJLEVBQUUsQ0FBQyxDQUN2QyxNQUFNLENBQUMsVUFBQSxNQUFNO3VCQUFJLE1BQU0sQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDO2VBQUEsQ0FBQyxDQUNqRCxHQUFHLENBQUMsVUFBQSxHQUFHO3VCQUFLO0FBQ1gsd0JBQU0sRUFBRSxHQUFHO0FBQ1gscUJBQUcsRUFBRSxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQztpQkFDaEM7ZUFBQyxDQUFDLENBQUM7O0FBRVI7bUJBQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQ3BELFVBQUMsS0FBSyxFQUFLOzs7QUFHVCxzQkFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FDMUIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBRSxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsRUFDbEQsZ0JBQWdCLENBQ2pCLENBQUM7O0FBRUYseUJBQU8sT0FBSyxXQUFXLENBQUMsVUFBVSxFQUFFLFVBQVUsQ0FBQyxDQUFDO2lCQUNqRCxDQUNGLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FDTixVQUFDLFdBQVc7Ozt5QkFBSyxTQUFBLEVBQUUsRUFBQyxNQUFNLE1BQUEsMkJBQUksV0FBVyxFQUFDO2lCQUFBLENBQzNDLENBQUMsSUFBSSxDQUFDLFVBQUEsV0FBVyxFQUFJOztBQUVwQixzQkFBSSxNQUFNLEtBQUssVUFBVSxJQUFJLFdBQVcsQ0FBQyxNQUFNLEVBQUU7QUFDL0MsMkJBQU8sV0FBVyxDQUFDLE1BQU0sQ0FBQyxVQUFBLElBQUk7NkJBQzVCLFdBQVcsQ0FBQyxJQUFJLENBQUMsVUFBQSxDQUFDOytCQUFJLENBQUMsQ0FBQyxNQUFNLEtBQUssSUFBSSxDQUFDLElBQUk7dUJBQUEsQ0FBQztxQkFBQSxDQUM5QyxDQUFDO21CQUNIO0FBQ0QseUJBQU8sV0FBVyxDQUFDO2lCQUNwQixDQUFDO2dCQUFDOzs7O1dBQ0o7O0FBRUQsaUJBQU8sRUFBRSxDQUFDO1NBQ1gsQ0FBQyxDQUFDO09BQ0o7S0FDRjs7O1NBbk9HLGtCQUFrQjs7O0FBc094QixNQUFNLENBQUMsT0FBTyxHQUFHLGtCQUFrQixDQUFDIiwiZmlsZSI6Ii9ob21lL3NlcGlyb3BodC8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtbW9kdWxlcy9zcmMvY29tcGxldGlvbi1wcm92aWRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5jb25zdCBQcm9taXNlID0gcmVxdWlyZSgnYmx1ZWJpcmQnKTtcbmNvbnN0IHJlYWRkaXIgPSBQcm9taXNlLnByb21pc2lmeShyZXF1aXJlKCdmcycpLnJlYWRkaXIpO1xuY29uc3QgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcbmNvbnN0IGZ1enphbGRyaW4gPSByZXF1aXJlKCdmdXp6YWxkcmluJyk7XG5jb25zdCBlc2NhcGVSZWdFeHAgPSByZXF1aXJlKCdsb2Rhc2guZXNjYXBlcmVnZXhwJyk7XG5jb25zdCBnZXQgPSByZXF1aXJlKCdsb2Rhc2guZ2V0Jyk7XG5jb25zdCBmaW5kQmFiZWxDb25maWcgPSByZXF1aXJlKCdmaW5kLWJhYmVsLWNvbmZpZycpO1xuY29uc3QgaW50ZXJuYWxNb2R1bGVzID0gcmVxdWlyZSgnLi91dGlscy9pbnRlcm5hbC1tb2R1bGVzJyk7XG5cbmNvbnN0IExJTkVfUkVHRVhQID0gL3JlcXVpcmV8aW1wb3J0fGV4cG9ydFxccysoPzpcXCp8e1thLXpBLVowLTlfJCxcXHNdK30pK1xccytmcm9tfH1cXHMqZnJvbVxccypbJ1wiXS87XG5jb25zdCBTRUxFQ1RPUiA9IFtcbiAgJy5zb3VyY2UuanMgLnN0cmluZy5xdW90ZWQnLFxuXG4gIC8vIGZvciBiYWJlbC1sYW5ndWFnZSBwbHVnaW5cbiAgJy5zb3VyY2UuanMgLnB1bmN0dWF0aW9uLmRlZmluaXRpb24uc3RyaW5nLmVuZCcsXG4gICcuc291cmNlLmpzIC5wdW5jdHVhdGlvbi5kZWZpbml0aW9uLnN0cmluZy5iZWdpbicsXG5cbiAgJy5zb3VyY2UudHMgLnN0cmluZy5xdW90ZWQnLFxuICAnLnNvdXJjZS5jb2ZmZWUgLnN0cmluZy5xdW90ZWQnXG5dO1xuY29uc3QgU0VMRUNUT1JfRElTQUJMRSA9IFtcbiAgJy5zb3VyY2UuanMgLmNvbW1lbnQnLFxuICAnLnNvdXJjZS5qcyAua2V5d29yZCcsXG4gICcuc291cmNlLnRzIC5jb21tZW50JyxcbiAgJy5zb3VyY2UudHMgLmtleXdvcmQnXG5dO1xuXG5jbGFzcyBDb21wbGV0aW9uUHJvdmlkZXIge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLnNlbGVjdG9yID0gU0VMRUNUT1Iuam9pbignLCAnKTtcbiAgICB0aGlzLmRpc2FibGVGb3JTZWxlY3RvciA9IFNFTEVDVE9SX0RJU0FCTEUuam9pbignLCAnKTtcbiAgICB0aGlzLmluY2x1c2lvblByaW9yaXR5ID0gMTtcbiAgfVxuXG4gIGdldFN1Z2dlc3Rpb25zKHtlZGl0b3IsIGJ1ZmZlclBvc2l0aW9uLCBwcmVmaXh9KSB7XG4gICAgY29uc3QgbGluZSA9IGVkaXRvci5nZXRUZXh0SW5SYW5nZShbW2J1ZmZlclBvc2l0aW9uLnJvdywgMF0sIGJ1ZmZlclBvc2l0aW9uXSk7XG4gICAgaWYgKCFMSU5FX1JFR0VYUC50ZXN0KGxpbmUpKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuXG4gICAgY29uc3QgcmVhbFByZWZpeCA9IHRoaXMuZ2V0UmVhbFByZWZpeChwcmVmaXgsIGxpbmUpO1xuICAgIGlmICghcmVhbFByZWZpeCkge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cblxuICAgIGlmIChyZWFsUHJlZml4WzBdID09PSAnLicpIHtcbiAgICAgIHJldHVybiB0aGlzLmxvb2t1cExvY2FsKHJlYWxQcmVmaXgsIHBhdGguZGlybmFtZShlZGl0b3IuZ2V0UGF0aCgpKSk7XG4gICAgfVxuXG4gICAgY29uc3QgdmVuZG9ycyA9IGF0b20uY29uZmlnLmdldCgnYXV0b2NvbXBsZXRlLW1vZHVsZXMudmVuZG9ycycpO1xuXG4gICAgY29uc3QgcHJvbWlzZXMgPSB2ZW5kb3JzLm1hcChcbiAgICAgICh2ZW5kb3IpID0+IHRoaXMubG9va3VwR2xvYmFsKHJlYWxQcmVmaXgsIHZlbmRvcilcbiAgICApO1xuXG4gICAgY29uc3Qgd2VicGFjayA9IGF0b20uY29uZmlnLmdldCgnYXV0b2NvbXBsZXRlLW1vZHVsZXMud2VicGFjaycpO1xuICAgIGlmICh3ZWJwYWNrKSB7XG4gICAgICBwcm9taXNlcy5wdXNoKHRoaXMubG9va3VwV2VicGFjayhyZWFsUHJlZml4KSk7XG4gICAgfVxuXG4gICAgY29uc3QgYmFiZWxQbHVnaW5Nb2R1bGVSZXNvbHZlciA9IGF0b20uY29uZmlnLmdldCgnYXV0b2NvbXBsZXRlLW1vZHVsZXMuYmFiZWxQbHVnaW5Nb2R1bGVSZXNvbHZlcicpO1xuICAgIGlmIChiYWJlbFBsdWdpbk1vZHVsZVJlc29sdmVyKSB7XG4gICAgICBwcm9taXNlcy5wdXNoKHRoaXMubG9va3VwYmFiZWxQbHVnaW5Nb2R1bGVSZXNvbHZlcihyZWFsUHJlZml4KSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIFByb21pc2UuYWxsKHByb21pc2VzKS50aGVuKFxuICAgICAgKHN1Z2dlc3Rpb25zKSA9PiBbXS5jb25jYXQoLi4uc3VnZ2VzdGlvbnMpXG4gICAgKTtcbiAgfVxuXG4gIGdldFJlYWxQcmVmaXgocHJlZml4LCBsaW5lKSB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJlYWxQcmVmaXhSZWdFeHAgPSBuZXcgUmVnRXhwKGBbJ1wiXSgoPzouKz8pKiR7ZXNjYXBlUmVnRXhwKHByZWZpeCl9KWApO1xuICAgICAgY29uc3QgcmVhbFByZWZpeE1hdGhlcyA9IHJlYWxQcmVmaXhSZWdFeHAuZXhlYyhsaW5lKTtcbiAgICAgIGlmICghcmVhbFByZWZpeE1hdGhlcykge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiByZWFsUHJlZml4TWF0aGVzWzFdO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuICBmaWx0ZXJTdWdnZXN0aW9ucyhwcmVmaXgsIHN1Z2dlc3Rpb25zKSB7XG4gICAgcmV0dXJuIGZ1enphbGRyaW4uZmlsdGVyKHN1Z2dlc3Rpb25zLCBwcmVmaXgsIHtcbiAgICAgIGtleTogJ3RleHQnXG4gICAgfSk7XG4gIH1cblxuICBsb29rdXBMb2NhbChwcmVmaXgsIGRpcm5hbWUpIHtcbiAgICBsZXQgZmlsdGVyUHJlZml4ID0gcHJlZml4LnJlcGxhY2UocGF0aC5kaXJuYW1lKHByZWZpeCksICcnKS5yZXBsYWNlKCcvJywgJycpO1xuICAgIGlmIChmaWx0ZXJQcmVmaXhbZmlsdGVyUHJlZml4Lmxlbmd0aCAtIDFdID09PSAnLycpIHtcbiAgICAgIGZpbHRlclByZWZpeCA9ICcnO1xuICAgIH1cblxuICAgIGNvbnN0IGluY2x1ZGVFeHRlbnNpb24gPSBhdG9tLmNvbmZpZy5nZXQoJ2F1dG9jb21wbGV0ZS1tb2R1bGVzLmluY2x1ZGVFeHRlbnNpb24nKTtcbiAgICBsZXQgbG9va3VwRGlybmFtZSA9IHBhdGgucmVzb2x2ZShkaXJuYW1lLCBwcmVmaXgpO1xuICAgIGlmIChmaWx0ZXJQcmVmaXgpIHtcbiAgICAgIGxvb2t1cERpcm5hbWUgPSBsb29rdXBEaXJuYW1lLnJlcGxhY2UobmV3IFJlZ0V4cChgJHtlc2NhcGVSZWdFeHAoZmlsdGVyUHJlZml4KX0kYCksICcnKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVhZGRpcihsb29rdXBEaXJuYW1lKS5jYXRjaCgoZSkgPT4ge1xuICAgICAgaWYgKGUuY29kZSAhPT0gJ0VOT0VOVCcpIHtcbiAgICAgICAgdGhyb3cgZTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIFtdO1xuICAgIH0pLmZpbHRlcihcbiAgICAgIChmaWxlbmFtZSkgPT4gZmlsZW5hbWVbMF0gIT09ICcuJ1xuICAgICkubWFwKChwYXRobmFtZSkgPT4gKHtcbiAgICAgIHRleHQ6IGluY2x1ZGVFeHRlbnNpb24gPyBwYXRobmFtZSA6IHRoaXMubm9ybWFsaXplTG9jYWwocGF0aG5hbWUpLFxuICAgICAgZGlzcGxheVRleHQ6IHBhdGhuYW1lLFxuICAgICAgdHlwZTogJ2ltcG9ydCdcbiAgICB9KSkudGhlbihcbiAgICAgIChzdWdnZXN0aW9ucykgPT4gdGhpcy5maWx0ZXJTdWdnZXN0aW9ucyhmaWx0ZXJQcmVmaXgsIHN1Z2dlc3Rpb25zKVxuICAgICk7XG4gIH1cblxuICBub3JtYWxpemVMb2NhbChmaWxlbmFtZSkge1xuICAgIHJldHVybiBmaWxlbmFtZS5yZXBsYWNlKC9cXC4oanN8ZXM2fGpzeHxjb2ZmZWV8dHN8dHN4KSQvLCAnJyk7XG4gIH1cblxuICBsb29rdXBHbG9iYWwocHJlZml4LCB2ZW5kb3IgPSAnbm9kZV9tb2R1bGVzJykge1xuICAgIGNvbnN0IHByb2plY3RQYXRoID0gYXRvbS5wcm9qZWN0LmdldFBhdGhzKClbMF07XG4gICAgaWYgKCFwcm9qZWN0UGF0aCkge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShbXSk7XG4gICAgfVxuXG4gICAgY29uc3QgdmVuZG9yUGF0aCA9IHBhdGguam9pbihwcm9qZWN0UGF0aCwgdmVuZG9yKTtcbiAgICBpZiAocHJlZml4LmluZGV4T2YoJy8nKSAhPT0gLTEpIHtcbiAgICAgIHJldHVybiB0aGlzLmxvb2t1cExvY2FsKGAuLyR7cHJlZml4fWAsIHZlbmRvclBhdGgpO1xuICAgIH1cblxuICAgIHJldHVybiByZWFkZGlyKHZlbmRvclBhdGgpLmNhdGNoKChlKSA9PiB7XG4gICAgICBpZiAoZS5jb2RlICE9PSAnRU5PRU5UJykge1xuICAgICAgICB0aHJvdyBlO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gW107XG4gICAgfSkudGhlbihcbiAgICAgIChsaWJzKSA9PiBbLi4uaW50ZXJuYWxNb2R1bGVzLCAuLi5saWJzXVxuICAgICkubWFwKChsaWIpID0+ICh7XG4gICAgICB0ZXh0OiBsaWIsXG4gICAgICByZXBsYWNlbWVudFByZWZpeDogcHJlZml4LFxuICAgICAgdHlwZTogJ2ltcG9ydCdcbiAgICB9KSkudGhlbihcbiAgICAgIChzdWdnZXN0aW9ucykgPT4gdGhpcy5maWx0ZXJTdWdnZXN0aW9ucyhwcmVmaXgsIHN1Z2dlc3Rpb25zKVxuICAgICk7XG4gIH1cblxuICBsb29rdXBXZWJwYWNrKHByZWZpeCkge1xuICAgIGNvbnN0IHByb2plY3RQYXRoID0gYXRvbS5wcm9qZWN0LmdldFBhdGhzKClbMF07XG4gICAgaWYgKCFwcm9qZWN0UGF0aCkge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShbXSk7XG4gICAgfVxuXG4gICAgY29uc3QgdmVuZG9ycyA9IGF0b20uY29uZmlnLmdldCgnYXV0b2NvbXBsZXRlLW1vZHVsZXMudmVuZG9ycycpO1xuICAgIGNvbnN0IHdlYnBhY2tDb25maWcgPSB0aGlzLmZldGNoV2VicGFja0NvbmZpZyhwcm9qZWN0UGF0aCk7XG5cbiAgICBjb25zdCB3ZWJwYWNrUm9vdCA9IGdldCh3ZWJwYWNrQ29uZmlnLCAncmVzb2x2ZS5yb290JywgJycpO1xuICAgIGxldCBtb2R1bGVTZWFyY2hQYXRocyA9IGdldCh3ZWJwYWNrQ29uZmlnLCAncmVzb2x2ZS5tb2R1bGVzRGlyZWN0b3JpZXMnLCBbXSk7XG4gICAgbW9kdWxlU2VhcmNoUGF0aHMgPSBtb2R1bGVTZWFyY2hQYXRocy5maWx0ZXIoXG4gICAgICAoaXRlbSkgPT4gdmVuZG9ycy5pbmRleE9mKGl0ZW0pID09PSAtMVxuICAgICk7XG5cbiAgICByZXR1cm4gUHJvbWlzZS5hbGwobW9kdWxlU2VhcmNoUGF0aHMubWFwKFxuICAgICAgKHNlYXJjaFBhdGgpID0+IHRoaXMubG9va3VwTG9jYWwocHJlZml4LCBwYXRoLmpvaW4od2VicGFja1Jvb3QsIHNlYXJjaFBhdGgpKVxuICAgICkpLnRoZW4oXG4gICAgICAoc3VnZ2VzdGlvbnMpID0+IFtdLmNvbmNhdCguLi5zdWdnZXN0aW9ucylcbiAgICApO1xuICB9XG5cbiAgZmV0Y2hXZWJwYWNrQ29uZmlnKHJvb3RQYXRoKSB7XG4gICAgY29uc3Qgd2VicGFja0NvbmZpZ0ZpbGVuYW1lID0gYXRvbS5jb25maWcuZ2V0KCdhdXRvY29tcGxldGUtbW9kdWxlcy53ZWJwYWNrQ29uZmlnRmlsZW5hbWUnKTtcbiAgICBjb25zdCB3ZWJwYWNrQ29uZmlnUGF0aCA9IHBhdGguam9pbihyb290UGF0aCwgd2VicGFja0NvbmZpZ0ZpbGVuYW1lKTtcblxuICAgIHRyeSB7XG4gICAgICByZXR1cm4gcmVxdWlyZSh3ZWJwYWNrQ29uZmlnUGF0aCk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmVcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgcmV0dXJuIHt9O1xuICAgIH1cbiAgfVxuXG4gIGxvb2t1cGJhYmVsUGx1Z2luTW9kdWxlUmVzb2x2ZXIocHJlZml4KSB7XG4gICAgY29uc3QgcHJvamVjdFBhdGggPSBhdG9tLnByb2plY3QuZ2V0UGF0aHMoKVswXTtcbiAgICBpZiAocHJvamVjdFBhdGgpIHtcbiAgICAgIHJldHVybiBmaW5kQmFiZWxDb25maWcocHJvamVjdFBhdGgpLnRoZW4oKHtjb25maWd9KSA9PiB7XG4gICAgICAgIGlmIChjb25maWcgJiYgQXJyYXkuaXNBcnJheShjb25maWcucGx1Z2lucykpIHtcbiAgICAgICAgICAvLyBHcmFiIHRoZSB2MSAobW9kdWxlLWFsaWFzKSBvciB2MiAobW9kdWxlLXJlc29sdmVyKSBwbHVnaW4gY29uZmlndXJhdGlvblxuICAgICAgICAgIGNvbnN0IHBsdWdpbkNvbmZpZyA9IGNvbmZpZy5wbHVnaW5zLmZpbmQocCA9PiBwWzBdID09PSAnbW9kdWxlLWFsaWFzJyB8fCBwWzBdID09PSAnYmFiZWwtcGx1Z2luLW1vZHVsZS1hbGlhcycpIHx8XG4gICAgICAgICAgICBjb25maWcucGx1Z2lucy5maW5kKHAgPT4gcFswXSA9PT0gJ21vZHVsZS1yZXNvbHZlcicgfHwgcFswXSA9PT0gJ2JhYmVsLXBsdWdpbi1tb2R1bGUtcmVzb2x2ZXInKTtcbiAgICAgICAgICBpZiAoIXBsdWdpbkNvbmZpZykge1xuICAgICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIE9ubHkgdjIgb2YgdGhlIHBsdWdpbiBzdXBwb3J0cyBjdXN0b20gcm9vdCBkaXJlY3Rvcmllc1xuICAgICAgICAgIGxldCByb290UHJvbWlzZXMgPSBbXTtcbiAgICAgICAgICBpZiAoIUFycmF5LmlzQXJyYXkocGx1Z2luQ29uZmlnWzFdKSkge1xuICAgICAgICAgICAgY29uc3Qgcm9vdERpcnMgPSBwbHVnaW5Db25maWdbMV0ucm9vdCB8fCBbXTtcbiAgICAgICAgICAgIHJvb3RQcm9taXNlcyA9IHJvb3RQcm9taXNlcy5jb25jYXQocm9vdERpcnMubWFwKHIgPT4ge1xuICAgICAgICAgICAgICBjb25zdCByb290RGlyUGF0aCA9IHBhdGguam9pbihwcm9qZWN0UGF0aCwgcik7XG4gICAgICAgICAgICAgIHJldHVybiB0aGlzLmxvb2t1cExvY2FsKGAuLyR7cHJlZml4fWAsIHJvb3REaXJQYXRoKTtcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBkZXRlcm1pbmUgdGhlIHJpZ2h0IHByZWZpeCBmb3IgdGhlIGFsaWFzIGNvbmZpZ1xuICAgICAgICAgIC8vIGByZWFsUHJlZml4YCBpcyB0aGUgcHJlZml4IHdlIHdhbnQgdG8gdXNlIHRvIGZpbmQgdGhlIHJpZ2h0IGZpbGUvc3VnZ2VzdGlvbnNcbiAgICAgICAgICAvLyB3aGVuIHRoZSBwcmVmaXggaXMgYSBzdWIgbW9kdWxlIChlZy4gbW9kdWxlL3N1YmZpbGUpLFxuICAgICAgICAgIC8vIGBtb2R1bGVQcmVmaXhgIHdpbGwgYmUgXCJtb2R1bGVcIiwgYW5kIGByZWFsUHJlZml4YCB3aWxsIGJlIFwic3ViZmlsZVwiXG4gICAgICAgICAgY29uc3QgcHJlZml4U3BsaXQgPSBwcmVmaXguc3BsaXQoJy8nKTtcbiAgICAgICAgICBjb25zdCBtb2R1bGVQcmVmaXggPSBwcmVmaXhTcGxpdFswXTtcbiAgICAgICAgICBjb25zdCByZWFsUHJlZml4ID0gcHJlZml4U3BsaXQucG9wKCk7XG4gICAgICAgICAgY29uc3QgbW9kdWxlU2VhcmNoUGF0aCA9IHByZWZpeFNwbGl0LmpvaW4oJy8nKTtcblxuICAgICAgICAgIC8vIGdldCB0aGUgYWxpYXMgY29uZmlncyBmb3IgdGhlIHNwZWNpZmljIG1vZHVsZVxuICAgICAgICAgIGNvbnN0IGFsaWFzQ29uZmlnID0gQXJyYXkuaXNBcnJheShwbHVnaW5Db25maWdbMV0pXG4gICAgICAgICAgICAvLyB2MSBvZiB0aGUgcGx1Z2luIGlzIGFuIGFycmF5XG4gICAgICAgICAgICA/IHBsdWdpbkNvbmZpZ1sxXS5maWx0ZXIoYWxpYXMgPT4gYWxpYXMuZXhwb3NlLnN0YXJ0c1dpdGgobW9kdWxlUHJlZml4KSlcbiAgICAgICAgICAgIC8vIG90aGVyd2lzZSBpdCdzIHYyIChhbiBvYmplY3QpXG4gICAgICAgICAgICA6IE9iamVjdC5rZXlzKHBsdWdpbkNvbmZpZ1sxXS5hbGlhcyB8fCB7fSlcbiAgICAgICAgICAgICAgLmZpbHRlcihleHBvc2UgPT4gZXhwb3NlLnN0YXJ0c1dpdGgobW9kdWxlUHJlZml4KSlcbiAgICAgICAgICAgICAgLm1hcChleHAgPT4gKHtcbiAgICAgICAgICAgICAgICBleHBvc2U6IGV4cCxcbiAgICAgICAgICAgICAgICBzcmM6IHBsdWdpbkNvbmZpZ1sxXS5hbGlhc1tleHBdXG4gICAgICAgICAgICAgIH0pKTtcblxuICAgICAgICAgIHJldHVybiBQcm9taXNlLmFsbChyb290UHJvbWlzZXMuY29uY2F0KGFsaWFzQ29uZmlnLm1hcChcbiAgICAgICAgICAgIChhbGlhcykgPT4ge1xuICAgICAgICAgICAgICAvLyBUaGUgc2VhcmNoIHBhdGggaXMgdGhlIHBhcmVudCBkaXJlY3Rvcnkgb2YgdGhlIHNvdXJjZSBkaXJlY3Rvcnkgc3BlY2lmaWVkIGluIC5iYWJlbHJjXG4gICAgICAgICAgICAgIC8vIHRoZW4gd2UgYXBwZW5kIHRoZSBgbW9kdWxlU2VhcmNoUGF0aGAgdG8gZ2V0IHRoZSByZWFsIHNlYXJjaCBwYXRoXG4gICAgICAgICAgICAgIGNvbnN0IHNlYXJjaFBhdGggPSBwYXRoLmpvaW4oXG4gICAgICAgICAgICAgICAgcGF0aC5kaXJuYW1lKHBhdGgucmVzb2x2ZShwcm9qZWN0UGF0aCwgYWxpYXMuc3JjKSksXG4gICAgICAgICAgICAgICAgbW9kdWxlU2VhcmNoUGF0aFxuICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAgIHJldHVybiB0aGlzLmxvb2t1cExvY2FsKHJlYWxQcmVmaXgsIHNlYXJjaFBhdGgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICkpKS50aGVuKFxuICAgICAgICAgICAgKHN1Z2dlc3Rpb25zKSA9PiBbXS5jb25jYXQoLi4uc3VnZ2VzdGlvbnMpXG4gICAgICAgICAgKS50aGVuKHN1Z2dlc3Rpb25zID0+IHtcbiAgICAgICAgICAgIC8vIG1ha2Ugc3VyZSB0aGUgc3VnZ2VzdGlvbnMgYXJlIGZyb20gdGhlIGNvbXBhdGlibGUgYWxpYXNcbiAgICAgICAgICAgIGlmIChwcmVmaXggPT09IHJlYWxQcmVmaXggJiYgYWxpYXNDb25maWcubGVuZ3RoKSB7XG4gICAgICAgICAgICAgIHJldHVybiBzdWdnZXN0aW9ucy5maWx0ZXIoc3VnZyA9PlxuICAgICAgICAgICAgICAgIGFsaWFzQ29uZmlnLmZpbmQoYSA9PiBhLmV4cG9zZSA9PT0gc3VnZy50ZXh0KVxuICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHN1Z2dlc3Rpb25zO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQ29tcGxldGlvblByb3ZpZGVyO1xuIl19