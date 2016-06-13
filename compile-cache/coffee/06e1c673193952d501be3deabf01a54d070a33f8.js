(function() {
  var $, BufferedProcess, CompositeDisposable, GitRevisionView, SplitDiff, fs, path, _, _ref;

  _ = require('underscore-plus');

  path = require('path');

  fs = require('fs');

  _ref = require("atom"), CompositeDisposable = _ref.CompositeDisposable, BufferedProcess = _ref.BufferedProcess;

  $ = require("atom-space-pen-views").$;

  SplitDiff = require('split-diff');

  module.exports = GitRevisionView = (function() {
    function GitRevisionView() {}

    GitRevisionView.FILE_PREFIX = "TimeMachine - ";


    /*
      This code and technique was originally from git-history package,
      see https://github.com/jakesankey/git-history/blob/master/lib/git-history-view.coffee
    
      Changes to permit click and drag in the time plot to travel in time:
      - don't write revision to disk for faster access and to give the user feedback when git'ing
        a rev to show is slow
      - reuse tabs more - don't open a new tab for every rev of the same file
    
      Changes to permit scrolling to same lines in view in the editor the history is for
    
      thank you, @jakesankey!
     */

    GitRevisionView.showRevision = function(editor, revHash, options) {
      var exit, file, fileContents, stdout;
      if (options == null) {
        options = {};
      }
      options = _.defaults(options, {
        diff: false
      });
      SplitDiff.disable(false);
      file = editor.getPath();
      fileContents = "";
      stdout = (function(_this) {
        return function(output) {
          return fileContents += output;
        };
      })(this);
      exit = (function(_this) {
        return function(code) {
          if (code === 0) {
            return _this._showRevision(file, editor, revHash, fileContents, options);
          } else {
            return atom.notifications.addError("Could not retrieve revision for " + (path.basename(file)) + " (" + code + ")");
          }
        };
      })(this);
      return this._loadRevision(file, revHash, stdout, exit);
    };

    GitRevisionView._loadRevision = function(file, hash, stdout, exit) {
      var showArgs;
      showArgs = ["show", "" + hash + ":./" + (path.basename(file))];
      return new BufferedProcess({
        command: "git",
        args: showArgs,
        options: {
          cwd: path.dirname(file)
        },
        stdout: stdout,
        exit: exit
      });
    };

    GitRevisionView._getInitialLineNumber = function(editor) {
      var editorEle, lineNumber;
      editorEle = atom.views.getView(editor);
      lineNumber = 0;
      if ((editor != null) && editor !== '') {
        lineNumber = editorEle.getLastVisibleScreenRow();
      }
      return lineNumber - 5;
    };

    GitRevisionView._showRevision = function(file, editor, revHash, fileContents, options) {
      var outputDir, outputFilePath, tempContent, _ref1;
      if (options == null) {
        options = {};
      }
      outputDir = "" + (atom.getConfigDirPath()) + "/git-time-machine";
      if (!fs.existsSync(outputDir)) {
        fs.mkdir(outputDir);
      }
      outputFilePath = "" + outputDir + "/" + this.FILE_PREFIX + (path.basename(file));
      if (options.diff) {
        outputFilePath += ".diff";
      }
      tempContent = "Loading..." + ((_ref1 = editor.buffer) != null ? _ref1.lineEndingForRow(0) : void 0);
      return fs.writeFile(outputFilePath, tempContent, (function(_this) {
        return function(error) {
          var promise;
          if (!error) {
            promise = atom.workspace.open(outputFilePath, {
              split: "right",
              activatePane: false,
              activateItem: true,
              searchAllPanes: true
            });
            return promise.then(function(newTextEditor) {
              return _this._updateNewTextEditor(newTextEditor, editor, revHash, fileContents);
            });
          }
        };
      })(this));
    };

    GitRevisionView._updateNewTextEditor = function(newTextEditor, editor, revHash, fileContents) {
      return _.delay((function(_this) {
        return function() {
          var lineEnding, _ref1;
          lineEnding = ((_ref1 = editor.buffer) != null ? _ref1.lineEndingForRow(0) : void 0) || "\n";
          fileContents = fileContents.replace(/(\r\n|\n)/g, lineEnding);
          newTextEditor.buffer.setPreferredLineEnding(lineEnding);
          newTextEditor.setText(fileContents);
          newTextEditor.buffer.cachedDiskContents = fileContents;
          _this._splitDiff(editor, newTextEditor);
          _this._syncScroll(editor, newTextEditor);
          return _this._affixTabTitle(newTextEditor, revHash);
        };
      })(this), 300);
    };

    GitRevisionView._affixTabTitle = function(newTextEditor, revHash) {
      var $el, $tabTitle, titleText;
      $el = $(atom.views.getView(newTextEditor));
      $tabTitle = $el.parents('atom-pane').find('li.tab.active .title');
      titleText = $tabTitle.text();
      if (titleText.indexOf('@') >= 0) {
        titleText = titleText.replace(/\@.*/, "@" + revHash);
      } else {
        titleText += " @" + revHash;
      }
      return $tabTitle.text(titleText);
    };

    GitRevisionView._splitDiff = function(editor, newTextEditor) {
      var editors;
      editors = {
        editor1: newTextEditor,
        editor2: editor
      };
      SplitDiff.editorSubscriptions = new CompositeDisposable();
      SplitDiff.editorSubscriptions.add(editors.editor1.onDidStopChanging((function(_this) {
        return function() {
          if (editors != null) {
            return SplitDiff.updateDiff(editors);
          }
        };
      })(this)));
      SplitDiff.editorSubscriptions.add(editors.editor2.onDidStopChanging((function(_this) {
        return function() {
          if (editors != null) {
            return SplitDiff.updateDiff(editors);
          }
        };
      })(this)));
      SplitDiff.editorSubscriptions.add(editors.editor1.onDidDestroy((function(_this) {
        return function() {
          editors = null;
          return SplitDiff.disable(false);
        };
      })(this)));
      SplitDiff.editorSubscriptions.add(editors.editor2.onDidDestroy((function(_this) {
        return function() {
          editors = null;
          return SplitDiff.disable(false);
        };
      })(this)));
      SplitDiff.editorSubscriptions.add(atom.config.onDidChange('split-diff.ignoreWhitespace', (function(_this) {
        return function(_arg) {
          var newValue, oldValue;
          newValue = _arg.newValue, oldValue = _arg.oldValue;
          return SplitDiff.updateDiff(editors);
        };
      })(this)));
      return SplitDiff.updateDiff(editors);
    };

    GitRevisionView._syncScroll = function(editor, newTextEditor) {
      return _.delay((function(_this) {
        return function() {
          return newTextEditor.scrollToBufferPosition({
            row: _this._getInitialLineNumber(editor),
            column: 0
          });
        };
      })(this), 50);
    };

    return GitRevisionView;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvd2lsbGlhbS8uYXRvbS9wYWNrYWdlcy9naXQtdGltZS1tYWNoaW5lL2xpYi9naXQtcmV2aXNpb24tdmlldy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFDQTtBQUFBLE1BQUEsc0ZBQUE7O0FBQUEsRUFBQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSLENBQUosQ0FBQTs7QUFBQSxFQUNBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQURQLENBQUE7O0FBQUEsRUFFQSxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVIsQ0FGTCxDQUFBOztBQUFBLEVBSUEsT0FBeUMsT0FBQSxDQUFRLE1BQVIsQ0FBekMsRUFBQywyQkFBQSxtQkFBRCxFQUFzQix1QkFBQSxlQUp0QixDQUFBOztBQUFBLEVBS0MsSUFBSyxPQUFBLENBQVEsc0JBQVIsRUFBTCxDQUxELENBQUE7O0FBQUEsRUFPQSxTQUFBLEdBQVksT0FBQSxDQUFRLFlBQVIsQ0FQWixDQUFBOztBQUFBLEVBVUEsTUFBTSxDQUFDLE9BQVAsR0FDTTtpQ0FFSjs7QUFBQSxJQUFBLGVBQUMsQ0FBQSxXQUFELEdBQWUsZ0JBQWYsQ0FBQTs7QUFDQTtBQUFBOzs7Ozs7Ozs7Ozs7T0FEQTs7QUFBQSxJQWVBLGVBQUMsQ0FBQSxZQUFELEdBQWUsU0FBQyxNQUFELEVBQVMsT0FBVCxFQUFrQixPQUFsQixHQUFBO0FBQ2IsVUFBQSxnQ0FBQTs7UUFEK0IsVUFBUTtPQUN2QztBQUFBLE1BQUEsT0FBQSxHQUFVLENBQUMsQ0FBQyxRQUFGLENBQVcsT0FBWCxFQUNSO0FBQUEsUUFBQSxJQUFBLEVBQU0sS0FBTjtPQURRLENBQVYsQ0FBQTtBQUFBLE1BR0EsU0FBUyxDQUFDLE9BQVYsQ0FBa0IsS0FBbEIsQ0FIQSxDQUFBO0FBQUEsTUFLQSxJQUFBLEdBQU8sTUFBTSxDQUFDLE9BQVAsQ0FBQSxD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

//# sourceURL=/home/william/.atom/packages/git-time-machine/lib/git-revision-view.coffee
