(function() {
  var _, child, filteredEnvironment, fs, path, pty, systemLanguage;

  pty = require('pty.js');

  path = require('path');

  fs = require('fs');

  _ = require('underscore');

  child = require('child_process');

  systemLanguage = (function() {
    var command, language;
    language = "en_US.UTF-8";
    if (process.platform === 'darwin') {
      try {
        command = 'plutil -convert json -o - ~/Library/Preferences/.GlobalPreferences.plist';
        language = (JSON.parse(child.execSync(command).toString()).AppleLocale) + ".UTF-8";
      } catch (error) {}
    }
    return language;
  })();

  filteredEnvironment = (function() {
    var env;
    env = _.omit(process.env, 'ATOM_HOME', 'ATOM_SHELL_INTERNAL_RUN_AS_NODE', 'GOOGLE_API_KEY', 'NODE_ENV', 'NODE_PATH', 'userAgent', 'taskPath');
    if (env.LANG == null) {
      env.LANG = systemLanguage;
    }
    env.TERM_PROGRAM = 'platformio-ide-terminal';
    return env;
  })();

  module.exports = function(pwd, shell, args, options) {
    var callback, emitTitle, ptyProcess, title;
    if (options == null) {
      options = {};
    }
    callback = this.async();
    if (/zsh|bash/.test(shell) && args.indexOf('--login') === -1) {
      args.unshift('--login');
    }
    ptyProcess = pty.fork(shell, args, {
      cwd: pwd,
      env: filteredEnvironment,
      name: 'xterm-256color'
    });
    title = shell = path.basename(shell);
    emitTitle = _.throttle(function() {
      return emit('platformio-ide-terminal:title', ptyProcess.process);
    }, 500, true);
    ptyProcess.on('data', function(data) {
      emit('platformio-ide-terminal:data', data);
      return emitTitle();
    });
    ptyProcess.on('exit', function() {
      emit('platformio-ide-terminal:exit');
      return callback();
    });
    return process.on('message', function(arg) {
      var cols, event, ref, rows, text;
      ref = arg != null ? arg : {}, event = ref.event, cols = ref.cols, rows = ref.rows, text = ref.text;
      switch (event) {
        case 'resize':
          return ptyProcess.resize(cols, rows);
        case 'input':
          return ptyProcess.write(text);
      }
    });
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvc2VwaXJvcGh0Ly5hdG9tL3BhY2thZ2VzL3BsYXRmb3JtaW8taWRlLXRlcm1pbmFsL2xpYi9wcm9jZXNzLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsR0FBQSxHQUFNLE9BQUEsQ0FBUSxRQUFSOztFQUNOLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFDUCxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVI7O0VBQ0wsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxZQUFSOztFQUNKLEtBQUEsR0FBUSxPQUFBLENBQVEsZUFBUjs7RUFFUixjQUFBLEdBQW9CLENBQUEsU0FBQTtBQUNsQixRQUFBO0lBQUEsUUFBQSxHQUFXO0lBQ1gsSUFBRyxPQUFPLENBQUMsUUFBUixLQUFvQixRQUF2QjtBQUNFO1FBQ0UsT0FBQSxHQUFVO1FBQ1YsUUFBQSxHQUFhLENBQUMsSUFBSSxDQUFDLEtBQUwsQ0FBVyxLQUFLLENBQUMsUUFBTixDQUFlLE9BQWYsQ0FBdUIsQ0FBQyxRQUF4QixDQUFBLENBQVgsQ0FBOEMsQ0FBQyxXQUFoRCxDQUFBLEdBQTRELFNBRjNFO09BQUEsaUJBREY7O0FBSUEsV0FBTztFQU5XLENBQUEsQ0FBSCxDQUFBOztFQVFqQixtQkFBQSxHQUF5QixDQUFBLFNBQUE7QUFDdkIsUUFBQTtJQUFBLEdBQUEsR0FBTSxDQUFDLENBQUMsSUFBRixDQUFPLE9BQU8sQ0FBQyxHQUFmLEVBQW9CLFdBQXBCLEVBQWlDLGlDQUFqQyxFQUFvRSxnQkFBcEUsRUFBc0YsVUFBdEYsRUFBa0csV0FBbEcsRUFBK0csV0FBL0csRUFBNEgsVUFBNUg7O01BQ04sR0FBRyxDQUFDLE9BQVE7O0lBQ1osR0FBRyxDQUFDLFlBQUosR0FBbUI7QUFDbkIsV0FBTztFQUpnQixDQUFBLENBQUgsQ0FBQTs7RUFNdEIsTUFBTSxDQUFDLE9BQVAsR0FBaUIsU0FBQyxHQUFELEVBQU0sS0FBTixFQUFhLElBQWIsRUFBbUIsT0FBbkI7QUFDZixRQUFBOztNQURrQyxVQUFROztJQUMxQyxRQUFBLEdBQVcsSUFBQyxDQUFBLEtBQUQsQ0FBQTtJQUVYLElBQUcsVUFBVSxDQUFDLElBQVgsQ0FBZ0IsS0FBaEIsQ0FBQSxJQUEyQixJQUFJLENBQUMsT0FBTCxDQUFhLFNBQWIsQ0FBQSxLQUEyQixDQUFDLENBQTFEO01BQ0UsSUFBSSxDQUFDLE9BQUwsQ0FBYSxTQUFiLEVBREY7O0lBR0EsVUFBQSxHQUFhLEdBQUcsQ0FBQyxJQUFKLENBQVMsS0FBVCxFQUFnQixJQUFoQixFQUNYO01BQUEsR0FBQSxFQUFLLEdBQUw7TUFDQSxHQUFBLEVBQUssbUJBREw7TUFFQSxJQUFBLEVBQU0sZ0JBRk47S0FEVztJQUtiLEtBQUEsR0FBUSxLQUFBLEdBQVEsSUFBSSxDQUFDLFFBQUwsQ0FBYyxLQUFkO0lBRWhCLFNBQUEsR0FBWSxDQUFDLENBQUMsUUFBRixDQUFXLFNBQUE7YUFDckIsSUFBQSxDQUFLLCtCQUFMLEVBQXNDLFVBQVUsQ0FBQyxPQUFqRDtJQURxQixDQUFYLEVBRVYsR0FGVSxFQUVMLElBRks7SUFJWixVQUFVLENBQUMsRUFBWCxDQUFjLE1BQWQsRUFBc0IsU0FBQyxJQUFEO01BQ3BCLElBQUEsQ0FBSyw4QkFBTCxFQUFxQyxJQUFyQzthQUNBLFNBQUEsQ0FBQTtJQUZvQixDQUF0QjtJQUlBLFVBQVUsQ0FBQyxFQUFYLENBQWMsTUFBZCxFQUFzQixTQUFBO01BQ3BCLElBQUEsQ0FBSyw4QkFBTDthQUNBLFFBQUEsQ0FBQTtJQUZvQixDQUF0QjtXQUlBLE9BQU8sQ0FBQyxFQUFSLENBQVcsU0FBWCxFQUFzQixTQUFDLEdBQUQ7QUFDcEIsVUFBQTswQkFEcUIsTUFBMEIsSUFBekIsbUJBQU8saUJBQU0saUJBQU07QUFDekMsY0FBTyxLQUFQO0FBQUEsYUFDTyxRQURQO2lCQUNxQixVQUFVLENBQUMsTUFBWCxDQUFrQixJQUFsQixFQUF3QixJQUF4QjtBQURyQixhQUVPLE9BRlA7aUJBRW9CLFVBQVUsQ0FBQyxLQUFYLENBQWlCLElBQWpCO0FBRnBCO0lBRG9CLENBQXRCO0VBekJlO0FBcEJqQiIsInNvdXJjZXNDb250ZW50IjpbInB0eSA9IHJlcXVpcmUgJ3B0eS5qcydcbnBhdGggPSByZXF1aXJlICdwYXRoJ1xuZnMgPSByZXF1aXJlICdmcydcbl8gPSByZXF1aXJlICd1bmRlcnNjb3JlJ1xuY2hpbGQgPSByZXF1aXJlICdjaGlsZF9wcm9jZXNzJ1xuXG5zeXN0ZW1MYW5ndWFnZSA9IGRvIC0+XG4gIGxhbmd1YWdlID0gXCJlbl9VUy5VVEYtOFwiXG4gIGlmIHByb2Nlc3MucGxhdGZvcm0gaXMgJ2RhcndpbidcbiAgICB0cnlcbiAgICAgIGNvbW1hbmQgPSAncGx1dGlsIC1jb252ZXJ0IGpzb24gLW8gLSB+L0xpYnJhcnkvUHJlZmVyZW5jZXMvLkdsb2JhbFByZWZlcmVuY2VzLnBsaXN0J1xuICAgICAgbGFuZ3VhZ2UgPSBcIiN7SlNPTi5wYXJzZShjaGlsZC5leGVjU3luYyhjb21tYW5kKS50b1N0cmluZygpKS5BcHBsZUxvY2FsZX0uVVRGLThcIlxuICByZXR1cm4gbGFuZ3VhZ2VcblxuZmlsdGVyZWRFbnZpcm9ubWVudCA9IGRvIC0+XG4gIGVudiA9IF8ub21pdCBwcm9jZXNzLmVudiwgJ0FUT01fSE9NRScsICdBVE9NX1NIRUxMX0lOVEVSTkFMX1JVTl9BU19OT0RFJywgJ0dPT0dMRV9BUElfS0VZJywgJ05PREVfRU5WJywgJ05PREVfUEFUSCcsICd1c2VyQWdlbnQnLCAndGFza1BhdGgnXG4gIGVudi5MQU5HID89IHN5c3RlbUxhbmd1YWdlXG4gIGVudi5URVJNX1BST0dSQU0gPSAncGxhdGZvcm1pby1pZGUtdGVybWluYWwnXG4gIHJldHVybiBlbnZcblxubW9kdWxlLmV4cG9ydHMgPSAocHdkLCBzaGVsbCwgYXJncywgb3B0aW9ucz17fSkgLT5cbiAgY2FsbGJhY2sgPSBAYXN5bmMoKVxuXG4gIGlmIC96c2h8YmFzaC8udGVzdChzaGVsbCkgYW5kIGFyZ3MuaW5kZXhPZignLS1sb2dpbicpID09IC0xXG4gICAgYXJncy51bnNoaWZ0ICctLWxvZ2luJ1xuXG4gIHB0eVByb2Nlc3MgPSBwdHkuZm9yayBzaGVsbCwgYXJncyxcbiAgICBjd2Q6IHB3ZCxcbiAgICBlbnY6IGZpbHRlcmVkRW52aXJvbm1lbnQsXG4gICAgbmFtZTogJ3h0ZXJtLTI1NmNvbG9yJ1xuXG4gIHRpdGxlID0gc2hlbGwgPSBwYXRoLmJhc2VuYW1lIHNoZWxsXG5cbiAgZW1pdFRpdGxlID0gXy50aHJvdHRsZSAtPlxuICAgIGVtaXQoJ3BsYXRmb3JtaW8taWRlLXRlcm1pbmFsOnRpdGxlJywgcHR5UHJvY2Vzcy5wcm9jZXNzKVxuICAsIDUwMCwgdHJ1ZVxuXG4gIHB0eVByb2Nlc3Mub24gJ2RhdGEnLCAoZGF0YSkgLT5cbiAgICBlbWl0KCdwbGF0Zm9ybWlvLWlkZS10ZXJtaW5hbDpkYXRhJywgZGF0YSlcbiAgICBlbWl0VGl0bGUoKVxuXG4gIHB0eVByb2Nlc3Mub24gJ2V4aXQnLCAtPlxuICAgIGVtaXQoJ3BsYXRmb3JtaW8taWRlLXRlcm1pbmFsOmV4aXQnKVxuICAgIGNhbGxiYWNrKClcblxuICBwcm9jZXNzLm9uICdtZXNzYWdlJywgKHtldmVudCwgY29scywgcm93cywgdGV4dH09e30pIC0+XG4gICAgc3dpdGNoIGV2ZW50XG4gICAgICB3aGVuICdyZXNpemUnIHRoZW4gcHR5UHJvY2Vzcy5yZXNpemUoY29scywgcm93cylcbiAgICAgIHdoZW4gJ2lucHV0JyB0aGVuIHB0eVByb2Nlc3Mud3JpdGUodGV4dClcbiJdfQ==
