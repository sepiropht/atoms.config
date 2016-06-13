(function() {
  var Dom, Utility;

  Dom = require('./dom');

  Utility = require('./utility');

  module.exports = {
    init: function(state) {
      var self;
      self = this;
      self.tabSize(atom.config.get('seti-ui.compactView'));
      self.ignoredFiles(atom.config.get('seti-ui.displayIgnored'));
      self.fileIcons(atom.config.get('seti-ui.fileIcons'));
      self.hideTabs(atom.config.get('seti-ui.hideTabs'));
      self.setTheme(atom.config.get('seti-ui.themeColor'), false, false);
      return atom.config.onDidChange('seti-ui.themeColor', function(value) {
        return self.setTheme(value.newValue, value.oldValue, true);
      });
    },
    "package": atom.packages.getLoadedPackage('seti-ui'),
    refresh: function() {
      var self;
      self = this;
      self["package"].deactivate();
      return setImmediate(function() {
        return self["package"].activate();
      });
    },
    setTheme: function(theme, previous, reload) {
      var el, fs, path, pkg, self, themeData;
      self = this;
      el = Dom.query('atom-workspace');
      fs = require('fs');
      path = require('path');
      pkg = atom.packages.getLoadedPackage('seti-ui');
      themeData = '@seti-primary: @' + theme.toLowerCase() + ';';
      themeData = themeData + '@seti-primary-text: @' + theme.toLowerCase() + '-text;';
      themeData = themeData + '@seti-primary-highlight: @' + theme.toLowerCase() + '-highlight;';
      atom.config.set('seti-ui.themeColor', theme);
      return fs.writeFile(pkg.path + '/styles/user-theme.less', themeData, function(err) {
        if (!err) {
          if (previous) {
            el.classList.remove('seti-theme-' + previous.toLowerCase());
          }
          el.classList.add('seti-theme-' + theme.toLowerCase());
          if (reload) {
            return self.refresh();
          }
        }
      });
    },
    tabSize: function(val) {
      return Utility.applySetting({
        action: 'addWhenTrue',
        config: 'seti-ui.compactView',
        el: ['atom-workspace-axis.vertical .tab-bar', 'atom-workspace-axis.vertical .tabs-bar', 'atom-panel-container.left', 'atom-panel-container.left .project-root > .header', '.entries.list-tree'],
        className: 'seti-compact',
        val: val,
        cb: this.tabSize
      });
    },
    hideTabs: function(val) {
      Utility.applySetting({
        action: 'addWhenTrue',
        config: 'seti-ui.hideTabs',
        el: ['.tab-bar', '.tabs-bar'],
        className: 'seti-hide-tabs',
        val: val,
        cb: this.hideTabs
      });
    },
    fileIcons: function(val) {
      Utility.applySetting({
        action: 'addWhenTrue',
        config: 'seti-ui.fileIcons',
        el: ['atom-workspace'],
        className: 'seti-icons',
        val: val,
        cb: this.fileIcons
      });
    },
    ignoredFiles: function(val) {
      return Utility.applySetting({
        action: 'addWhenFalse',
        config: 'seti-ui.displayIgnored',
        el: ['.file.entry.list-item.status-ignored', '.directory.entry.list-nested-item.status-ignored'],
        className: 'seti-hide',
        val: val,
        cb: this.ignoredFiles
      });
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvd2lsbGlhbS8uYXRvbS9wYWNrYWdlcy9zZXRpLXVpL2xpYi9zZXR0aW5ncy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsWUFBQTs7QUFBQSxFQUFBLEdBQUEsR0FBTSxPQUFBLENBQVEsT0FBUixDQUFOLENBQUE7O0FBQUEsRUFDQSxPQUFBLEdBQVUsT0FBQSxDQUFRLFdBQVIsQ0FEVixDQUFBOztBQUFBLEVBR0EsTUFBTSxDQUFDLE9BQVAsR0FDRTtBQUFBLElBQUEsSUFBQSxFQUFNLFNBQUMsS0FBRCxHQUFBO0FBRUosVUFBQSxJQUFBO0FBQUEsTUFBQSxJQUFBLEdBQU8sSUFBUCxDQUFBO0FBQUEsTUFHQSxJQUFJLENBQUMsT0FBTCxDQUFhLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixxQkFBaEIsQ0FBYixDQUhBLENBQUE7QUFBQSxNQUtBLElBQUksQ0FBQyxZQUFMLENBQWtCLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQix3QkFBaEIsQ0FBbEIsQ0FMQSxDQUFBO0FBQUEsTUFPQSxJQUFJLENBQUMsU0FBTCxDQUFlLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixtQkFBaEIsQ0FBZixDQVBBLENBQUE7QUFBQSxNQVNBLElBQUksQ0FBQyxRQUFMLENBQWMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLGtCQUFoQixDQUFkLENBVEEsQ0FBQTtBQUFBLE1BV0EsSUFBSSxDQUFDLFFBQUwsQ0FBYyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0Isb0JBQWhCLENBQWQsRUFBcUQsS0FBckQsRUFBNEQsS0FBNUQsQ0FYQSxDQUFBO2FBWUEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFaLENBQXdCLG9CQUF4QixFQUE4QyxTQUFDLEtBQUQsR0FBQTtlQUM1QyxJ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

//# sourceURL=/home/william/.atom/packages/seti-ui/lib/settings.coffee
