(function() {
  var $, GitLog, GitRevisionView, GitTimeMachineView, GitTimeplot, View, moment, path, str, _, _ref;

  _ref = require("atom-space-pen-views"), $ = _ref.$, View = _ref.View;

  path = require('path');

  _ = require('underscore-plus');

  str = require('bumble-strings');

  moment = require('moment');

  GitLog = require('git-log-utils');

  GitTimeplot = require('./git-timeplot');

  GitRevisionView = require('./git-revision-view');

  module.exports = GitTimeMachineView = (function() {
    function GitTimeMachineView(serializedState, options) {
      if (options == null) {
        options = {};
      }
      if (!this.$element) {
        this.$element = $("<div class='git-time-machine'>");
      }
      if (options.editor != null) {
        this.setEditor(options.editor);
        this.render();
      }
    }

    GitTimeMachineView.prototype.setEditor = function(editor) {
      var file, _ref1;
      file = editor != null ? editor.getPath() : void 0;
      if (!((file != null) && !str.startsWith(path.basename(file), GitRevisionView.FILE_PREFIX))) {
        return;
      }
      _ref1 = [editor, file], this.editor = _ref1[0], this.file = _ref1[1];
      return this.render();
    };

    GitTimeMachineView.prototype.render = function() {
      var commits;
      commits = this.gitCommitHistory();
      if (!((this.file != null) && (commits != null))) {
        this._renderPlaceholder();
      } else {
        this.$element.text("");
        this._renderCloseHandle();
        this._renderStats(commits);
        this._renderTimeline(commits);
      }
      return this.$element;
    };

    GitTimeMachineView.prototype.serialize = function() {
      return null;
    };

    GitTimeMachineView.prototype.destroy = function() {
      return this.$element.remove();
    };

    GitTimeMachineView.prototype.hide = function() {
      var _ref1;
      return (_ref1 = this.timeplot) != null ? _ref1.hide() : void 0;
    };

    GitTimeMachineView.prototype.show = function() {
      var _ref1;
      return (_ref1 = this.timeplot) != null ? _ref1.show() : void 0;
    };

    GitTimeMachineView.prototype.getElement = function() {
      return this.$element.get(0);
    };

    GitTimeMachineView.prototype.gitCommitHistory = function(file) {
      var commits, e;
      if (file == null) {
        file = this.file;
      }
      if (file == null) {
        return null;
      }
      try {
        commits = GitLog.getCommitHistory(file);
      } catch (_error) {
        e = _error;
        if (e.message != null) {
          if (e.message.match('File not a git repository') || str.weaklyHas(e.message, "is outside repository")) {
            atom.notifications.addError("Error: Not in a git repository");
            return null;
          }
        }
        atom.notifications.addError(String(e));
        return null;
      }
      return commits;
    };

    GitTimeMachineView.prototype._renderPlaceholder = function() {
      this.$element.html("<div class='placeholder'>Select a file in the git repo to see timeline</div>");
    };

    GitTimeMachineView.prototype._renderCloseHandle = function() {
      var $closeHandle;
      $closeHandle = $("<div class='close-handle'>X</div>");
      this.$element.append($closeHandle);
      return $closeHandle.on('mousedown', function(e) {
        e.preventDefault();
        e.stopImmediatePropagation();
        e.stopPropagation();
        return atom.commands.dispatch(atom.views.getView(atom.workspace), "git-time-machine:toggle");
      });
    };

    GitTimeMachineView.prototype._renderTimeline = function(commits) {
      this.timeplot || (this.timeplot = new GitTimeplot(this.$element));
      this.timeplot.render(this.editor, commits);
    };

    GitTimeMachineView.prototype._renderStats = function(commits) {
      var authorCount, byAuthor, content, durationInMs, timeSpan;
      content = "";
      if (commits.length > 0) {
        byAuthor = _.indexBy(commits, 'authorName');
        authorCount = _.keys(byAuthor).length;
        durationInMs = moment.unix(commits[commits.length - 1].authorDate).diff(moment.unix(commits[0].authorDate));
        timeSpan = moment.duration(durationInMs).humanize();
        content = "<span class='total-commits'>" + commits.length + "</span> commits by " + authorCount + " authors spanning " + timeSpan;
      }
      this.$element.append("<div class='stats'>\n  " + content + "\n</div>");
    };

    return GitTimeMachineView;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvd2lsbGlhbS8uYXRvbS9wYWNrYWdlcy9naXQtdGltZS1tYWNoaW5lL2xpYi9naXQtdGltZS1tYWNoaW5lLXZpZXcuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDZGQUFBOztBQUFBLEVBQUEsT0FBWSxPQUFBLENBQVEsc0JBQVIsQ0FBWixFQUFDLFNBQUEsQ0FBRCxFQUFJLFlBQUEsSUFBSixDQUFBOztBQUFBLEVBQ0EsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSLENBRFAsQ0FBQTs7QUFBQSxFQUVBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVIsQ0FGSixDQUFBOztBQUFBLEVBR0EsR0FBQSxHQUFNLE9BQUEsQ0FBUSxnQkFBUixDQUhOLENBQUE7O0FBQUEsRUFJQSxNQUFBLEdBQVMsT0FBQSxDQUFRLFFBQVIsQ0FKVCxDQUFBOztBQUFBLEVBTUEsTUFBQSxHQUFTLE9BQUEsQ0FBUSxlQUFSLENBTlQsQ0FBQTs7QUFBQSxFQU9BLFdBQUEsR0FBYyxPQUFBLENBQVEsZ0JBQVIsQ0FQZCxDQUFBOztBQUFBLEVBUUEsZUFBQSxHQUFrQixPQUFBLENBQVEscUJBQVIsQ0FSbEIsQ0FBQTs7QUFBQSxFQVVBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDUyxJQUFBLDRCQUFDLGVBQUQsRUFBa0IsT0FBbEIsR0FBQTs7UUFBa0IsVUFBUTtPQUNyQztBQUFBLE1BQUEsSUFBQSxDQUFBLElBQXdELENBQUEsUUFBeEQ7QUFBQSxRQUFBLElBQUMsQ0FBQSxRQUFELEdBQVksQ0FBQSxDQUFFLGdDQUFGLENBQVosQ0FBQTtPQUFBO0FBQ0EsTUFBQSxJQUFHLHNCQUFIO0FBQ0UsUUFBQSxJQUFDLENBQUEsU0FBRCxDQUFXLE9BQU8sQ0FBQyxNQUFuQixDQUFBLENBQUE7QUFBQSxRQUNBLElBQUMsQ0FBQSxNQUFELENBQUEs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

//# sourceURL=/home/william/.atom/packages/git-time-machine/lib/git-time-machine-view.coffee
