
/*
Requires https://github.com/FriendsOfPHP/PHP-CS-Fixer
 */

(function() {
  "use strict";
  var Beautifier, PHPCSFixer, path,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  path = require('path');

  module.exports = PHPCSFixer = (function(superClass) {
    extend(PHPCSFixer, superClass);

    function PHPCSFixer() {
      return PHPCSFixer.__super__.constructor.apply(this, arguments);
    }

    PHPCSFixer.prototype.name = 'PHP-CS-Fixer';

    PHPCSFixer.prototype.link = "http://php.net/manual/en/install.php";

    PHPCSFixer.prototype.options = {
      PHP: true
    };

    PHPCSFixer.prototype.beautify = function(text, language, options, context) {
      var configFile, tempFile;
      this.debug('php-cs-fixer', options);
      configFile = (context != null) && (context.filePath != null) ? this.findFile(path.dirname(context.filePath), '.php_cs') : void 0;
      if (this.isWindows) {
        return this.Promise.all([options.cs_fixer_path ? this.which(options.cs_fixer_path) : void 0, this.which('php-cs-fixer')]).then((function(_this) {
          return function(paths) {
            var _, phpCSFixerPath, tempFile;
            _this.debug('php-cs-fixer paths', paths);
            _ = require('lodash');
            phpCSFixerPath = _.find(paths, function(p) {
              return p && path.isAbsolute(p);
            });
            _this.verbose('phpCSFixerPath', phpCSFixerPath);
            _this.debug('phpCSFixerPath', phpCSFixerPath, paths);
            if (phpCSFixerPath != null) {
              return _this.run("php", [phpCSFixerPath, "fix", options.level ? "--level=" + options.level : void 0, options.fixers ? "--fixers=" + options.fixers : void 0, configFile ? "--config-file=" + configFile : void 0, tempFile = _this.tempFile("temp", text)], {
                ignoreReturnCode: true,
                help: {
                  link: "http://php.net/manual/en/install.php"
                }
              }).then(function() {
                return _this.readFile(tempFile);
              });
            } else {
              _this.verbose('php-cs-fixer not found!');
              return _this.Promise.reject(_this.commandNotFoundError('php-cs-fixer', {
                link: "https://github.com/FriendsOfPHP/PHP-CS-Fixer",
                program: "php-cs-fixer.phar",
                pathOption: "PHP - CS Fixer Path"
              }));
            }
          };
        })(this));
      } else {
        return this.run("php-cs-fixer", ["fix", options.level ? "--level=" + options.level : void 0, options.fixers ? "--fixers=" + options.fixers : void 0, configFile ? "--config-file=" + configFile : void 0, tempFile = this.tempFile("temp", text)], {
          ignoreReturnCode: true,
          help: {
            link: "https://github.com/FriendsOfPHP/PHP-CS-Fixer"
          }
        }).then((function(_this) {
          return function() {
            return _this.readFile(tempFile);
          };
        })(this));
      }
    };

    return PHPCSFixer;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvc2VwaXJvcGh0Ly5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2JlYXV0aWZpZXJzL3BocC1jcy1maXhlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7O0FBQUE7RUFJQTtBQUpBLE1BQUEsNEJBQUE7SUFBQTs7O0VBS0EsVUFBQSxHQUFhLE9BQUEsQ0FBUSxjQUFSOztFQUNiLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFFUCxNQUFNLENBQUMsT0FBUCxHQUF1Qjs7Ozs7Ozt5QkFFckIsSUFBQSxHQUFNOzt5QkFDTixJQUFBLEdBQU07O3lCQUVOLE9BQUEsR0FDRTtNQUFBLEdBQUEsRUFBSyxJQUFMOzs7eUJBRUYsUUFBQSxHQUFVLFNBQUMsSUFBRCxFQUFPLFFBQVAsRUFBaUIsT0FBakIsRUFBMEIsT0FBMUI7QUFDUixVQUFBO01BQUEsSUFBQyxDQUFBLEtBQUQsQ0FBTyxjQUFQLEVBQXVCLE9BQXZCO01BRUEsVUFBQSxHQUFnQixpQkFBQSxJQUFhLDBCQUFoQixHQUF1QyxJQUFDLENBQUEsUUFBRCxDQUFVLElBQUksQ0FBQyxPQUFMLENBQWEsT0FBTyxDQUFDLFFBQXJCLENBQVYsRUFBMEMsU0FBMUMsQ0FBdkMsR0FBQTtNQUViLElBQUcsSUFBQyxDQUFBLFNBQUo7ZUFFRSxJQUFDLENBQUEsT0FBTyxDQUFDLEdBQVQsQ0FBYSxDQUNzQixPQUFPLENBQUMsYUFBekMsR0FBQSxJQUFDLENBQUEsS0FBRCxDQUFPLE9BQU8sQ0FBQyxhQUFmLENBQUEsR0FBQSxNQURXLEVBRVgsSUFBQyxDQUFBLEtBQUQsQ0FBTyxjQUFQLENBRlcsQ0FBYixDQUdFLENBQUMsSUFISCxDQUdRLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUMsS0FBRDtBQUNOLGdCQUFBO1lBQUEsS0FBQyxDQUFBLEtBQUQsQ0FBTyxvQkFBUCxFQUE2QixLQUE3QjtZQUNBLENBQUEsR0FBSSxPQUFBLENBQVEsUUFBUjtZQUVKLGNBQUEsR0FBaUIsQ0FBQyxDQUFDLElBQUYsQ0FBTyxLQUFQLEVBQWMsU0FBQyxDQUFEO3FCQUFPLENBQUEsSUFBTSxJQUFJLENBQUMsVUFBTCxDQUFnQixDQUFoQjtZQUFiLENBQWQ7WUFDakIsS0FBQyxDQUFBLE9BQUQsQ0FBUyxnQkFBVCxFQUEyQixjQUEzQjtZQUNBLEtBQUMsQ0FBQSxLQUFELENBQU8sZ0JBQVAsRUFBeUIsY0FBekIsRUFBeUMsS0FBekM7WUFFQSxJQUFHLHNCQUFIO3FCQUVFLEtBQUMsQ0FBQSxHQUFELENBQUssS0FBTCxFQUFZLENBQ1YsY0FEVSxFQUVWLEtBRlUsRUFHb0IsT0FBTyxDQUFDLEtBQXRDLEdBQUEsVUFBQSxHQUFXLE9BQU8sQ0FBQyxLQUFuQixHQUFBLE1BSFUsRUFJc0IsT0FBTyxDQUFDLE1BQXhDLEdBQUEsV0FBQSxHQUFZLE9BQU8sQ0FBQyxNQUFwQixHQUFBLE1BSlUsRUFLdUIsVUFBakMsR0FBQSxnQkFBQSxHQUFpQixVQUFqQixHQUFBLE1BTFUsRUFNVixRQUFBLEdBQVcsS0FBQyxDQUFBLFFBQUQsQ0FBVSxNQUFWLEVBQWtCLElBQWxCLENBTkQsQ0FBWixFQU9LO2dCQUNELGdCQUFBLEVBQWtCLElBRGpCO2dCQUVELElBQUEsRUFBTTtrQkFDSixJQUFBLEVBQU0sc0NBREY7aUJBRkw7ZUFQTCxDQWFFLENBQUMsSUFiSCxDQWFRLFNBQUE7dUJBQ0osS0FBQyxDQUFBLFFBQUQsQ0FBVSxRQUFWO2NBREksQ0FiUixFQUZGO2FBQUEsTUFBQTtjQW1CRSxLQUFDLENBQUEsT0FBRCxDQUFTLHlCQUFUO3FCQUVBLEtBQUMsQ0FBQSxPQUFPLENBQUMsTUFBVCxDQUFnQixLQUFDLENBQUEsb0JBQUQsQ0FDZCxjQURjLEVBRWQ7Z0JBQ0EsSUFBQSxFQUFNLDhDQUROO2dCQUVBLE9BQUEsRUFBUyxtQkFGVDtnQkFHQSxVQUFBLEVBQVkscUJBSFo7ZUFGYyxDQUFoQixFQXJCRjs7VUFSTTtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FIUixFQUZGO09BQUEsTUFBQTtlQTRDRSxJQUFDLENBQUEsR0FBRCxDQUFLLGNBQUwsRUFBcUIsQ0FDbkIsS0FEbUIsRUFFVyxPQUFPLENBQUMsS0FBdEMsR0FBQSxVQUFBLEdBQVcsT0FBTyxDQUFDLEtBQW5CLEdBQUEsTUFGbUIsRUFHYSxPQUFPLENBQUMsTUFBeEMsR0FBQSxXQUFBLEdBQVksT0FBTyxDQUFDLE1BQXBCLEdBQUEsTUFIbUIsRUFJYyxVQUFqQyxHQUFBLGdCQUFBLEdBQWlCLFVBQWpCLEdBQUEsTUFKbUIsRUFLbkIsUUFBQSxHQUFXLElBQUMsQ0FBQSxRQUFELENBQVUsTUFBVixFQUFrQixJQUFsQixDQUxRLENBQXJCLEVBTUs7VUFDRCxnQkFBQSxFQUFrQixJQURqQjtVQUVELElBQUEsRUFBTTtZQUNKLElBQUEsRUFBTSw4Q0FERjtXQUZMO1NBTkwsQ0FZRSxDQUFDLElBWkgsQ0FZUSxDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFBO21CQUNKLEtBQUMsQ0FBQSxRQUFELENBQVUsUUFBVjtVQURJO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQVpSLEVBNUNGOztJQUxROzs7O0tBUjhCO0FBUjFDIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG5SZXF1aXJlcyBodHRwczovL2dpdGh1Yi5jb20vRnJpZW5kc09mUEhQL1BIUC1DUy1GaXhlclxuIyMjXG5cblwidXNlIHN0cmljdFwiXG5CZWF1dGlmaWVyID0gcmVxdWlyZSgnLi9iZWF1dGlmaWVyJylcbnBhdGggPSByZXF1aXJlKCdwYXRoJylcblxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBQSFBDU0ZpeGVyIGV4dGVuZHMgQmVhdXRpZmllclxuXG4gIG5hbWU6ICdQSFAtQ1MtRml4ZXInXG4gIGxpbms6IFwiaHR0cDovL3BocC5uZXQvbWFudWFsL2VuL2luc3RhbGwucGhwXCJcblxuICBvcHRpb25zOlxuICAgIFBIUDogdHJ1ZVxuXG4gIGJlYXV0aWZ5OiAodGV4dCwgbGFuZ3VhZ2UsIG9wdGlvbnMsIGNvbnRleHQpIC0+XG4gICAgQGRlYnVnKCdwaHAtY3MtZml4ZXInLCBvcHRpb25zKVxuXG4gICAgY29uZmlnRmlsZSA9IGlmIGNvbnRleHQ/IGFuZCBjb250ZXh0LmZpbGVQYXRoPyB0aGVuIEBmaW5kRmlsZShwYXRoLmRpcm5hbWUoY29udGV4dC5maWxlUGF0aCksICcucGhwX2NzJylcblxuICAgIGlmIEBpc1dpbmRvd3NcbiAgICAgICMgRmluZCBwaHAtY3MtZml4ZXIucGhhciBzY3JpcHRcbiAgICAgIEBQcm9taXNlLmFsbChbXG4gICAgICAgIEB3aGljaChvcHRpb25zLmNzX2ZpeGVyX3BhdGgpIGlmIG9wdGlvbnMuY3NfZml4ZXJfcGF0aFxuICAgICAgICBAd2hpY2goJ3BocC1jcy1maXhlcicpXG4gICAgICBdKS50aGVuKChwYXRocykgPT5cbiAgICAgICAgQGRlYnVnKCdwaHAtY3MtZml4ZXIgcGF0aHMnLCBwYXRocylcbiAgICAgICAgXyA9IHJlcXVpcmUgJ2xvZGFzaCdcbiAgICAgICAgIyBHZXQgZmlyc3QgdmFsaWQsIGFic29sdXRlIHBhdGhcbiAgICAgICAgcGhwQ1NGaXhlclBhdGggPSBfLmZpbmQocGF0aHMsIChwKSAtPiBwIGFuZCBwYXRoLmlzQWJzb2x1dGUocCkgKVxuICAgICAgICBAdmVyYm9zZSgncGhwQ1NGaXhlclBhdGgnLCBwaHBDU0ZpeGVyUGF0aClcbiAgICAgICAgQGRlYnVnKCdwaHBDU0ZpeGVyUGF0aCcsIHBocENTRml4ZXJQYXRoLCBwYXRocylcbiAgICAgICAgIyBDaGVjayBpZiBQSFAtQ1MtRml4ZXIgcGF0aCB3YXMgZm91bmRcbiAgICAgICAgaWYgcGhwQ1NGaXhlclBhdGg/XG4gICAgICAgICAgIyBGb3VuZCBQSFAtQ1MtRml4ZXIgcGF0aFxuICAgICAgICAgIEBydW4oXCJwaHBcIiwgW1xuICAgICAgICAgICAgcGhwQ1NGaXhlclBhdGhcbiAgICAgICAgICAgIFwiZml4XCJcbiAgICAgICAgICAgIFwiLS1sZXZlbD0je29wdGlvbnMubGV2ZWx9XCIgaWYgb3B0aW9ucy5sZXZlbFxuICAgICAgICAgICAgXCItLWZpeGVycz0je29wdGlvbnMuZml4ZXJzfVwiIGlmIG9wdGlvbnMuZml4ZXJzXG4gICAgICAgICAgICBcIi0tY29uZmlnLWZpbGU9I3tjb25maWdGaWxlfVwiIGlmIGNvbmZpZ0ZpbGVcbiAgICAgICAgICAgIHRlbXBGaWxlID0gQHRlbXBGaWxlKFwidGVtcFwiLCB0ZXh0KVxuICAgICAgICAgICAgXSwge1xuICAgICAgICAgICAgICBpZ25vcmVSZXR1cm5Db2RlOiB0cnVlXG4gICAgICAgICAgICAgIGhlbHA6IHtcbiAgICAgICAgICAgICAgICBsaW5rOiBcImh0dHA6Ly9waHAubmV0L21hbnVhbC9lbi9pbnN0YWxsLnBocFwiXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAudGhlbig9PlxuICAgICAgICAgICAgICBAcmVhZEZpbGUodGVtcEZpbGUpXG4gICAgICAgICAgICApXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBAdmVyYm9zZSgncGhwLWNzLWZpeGVyIG5vdCBmb3VuZCEnKVxuICAgICAgICAgICMgQ291bGQgbm90IGZpbmQgUEhQLUNTLUZpeGVyIHBhdGhcbiAgICAgICAgICBAUHJvbWlzZS5yZWplY3QoQGNvbW1hbmROb3RGb3VuZEVycm9yKFxuICAgICAgICAgICAgJ3BocC1jcy1maXhlcidcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgIGxpbms6IFwiaHR0cHM6Ly9naXRodWIuY29tL0ZyaWVuZHNPZlBIUC9QSFAtQ1MtRml4ZXJcIlxuICAgICAgICAgICAgcHJvZ3JhbTogXCJwaHAtY3MtZml4ZXIucGhhclwiXG4gICAgICAgICAgICBwYXRoT3B0aW9uOiBcIlBIUCAtIENTIEZpeGVyIFBhdGhcIlxuICAgICAgICAgICAgfSlcbiAgICAgICAgICApXG4gICAgICApXG4gICAgZWxzZVxuICAgICAgQHJ1bihcInBocC1jcy1maXhlclwiLCBbXG4gICAgICAgIFwiZml4XCJcbiAgICAgICAgXCItLWxldmVsPSN7b3B0aW9ucy5sZXZlbH1cIiBpZiBvcHRpb25zLmxldmVsXG4gICAgICAgIFwiLS1maXhlcnM9I3tvcHRpb25zLmZpeGVyc31cIiBpZiBvcHRpb25zLmZpeGVyc1xuICAgICAgICBcIi0tY29uZmlnLWZpbGU9I3tjb25maWdGaWxlfVwiIGlmIGNvbmZpZ0ZpbGVcbiAgICAgICAgdGVtcEZpbGUgPSBAdGVtcEZpbGUoXCJ0ZW1wXCIsIHRleHQpXG4gICAgICAgIF0sIHtcbiAgICAgICAgICBpZ25vcmVSZXR1cm5Db2RlOiB0cnVlXG4gICAgICAgICAgaGVscDoge1xuICAgICAgICAgICAgbGluazogXCJodHRwczovL2dpdGh1Yi5jb20vRnJpZW5kc09mUEhQL1BIUC1DUy1GaXhlclwiXG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgICAudGhlbig9PlxuICAgICAgICAgIEByZWFkRmlsZSh0ZW1wRmlsZSlcbiAgICAgICAgKVxuIl19
