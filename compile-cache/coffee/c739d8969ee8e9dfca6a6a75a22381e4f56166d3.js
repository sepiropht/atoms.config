(function() {
  var $, CompositeDisposable, DiffViewEditor, Emitter, SplitDiff, SyncScroll, TextBuffer, TextEditor, configSchema, _ref;

  _ref = require('atom'), CompositeDisposable = _ref.CompositeDisposable, Emitter = _ref.Emitter, TextEditor = _ref.TextEditor, TextBuffer = _ref.TextBuffer;

  $ = require('space-pen').$;

  DiffViewEditor = require('./build-lines');

  SyncScroll = require('./sync-scroll');

  configSchema = require("./config-schema");

  module.exports = SplitDiff = {
    config: configSchema,
    subscriptions: null,
    diffViewEditor1: null,
    diffViewEditor2: null,
    editorSubscriptions: null,
    isWhitespaceIgnored: false,
    linkedDiffChunks: null,
    diffChunkPointer: 0,
    isFirstChunkSelect: true,
    wasEditor1SoftWrapped: false,
    wasEditor2SoftWrapped: false,
    activate: function(state) {
      this.subscriptions = new CompositeDisposable();
      return this.subscriptions.add(atom.commands.add('atom-workspace', {
        'split-diff:diffPanes': (function(_this) {
          return function() {
            return _this.diffPanes();
          };
        })(this),
        'split-diff:nextDiff': (function(_this) {
          return function() {
            return _this.nextDiff();
          };
        })(this),
        'split-diff:prevDiff': (function(_this) {
          return function() {
            return _this.prevDiff();
          };
        })(this),
        'split-diff:disable': (function(_this) {
          return function() {
            return _this.disable();
          };
        })(this),
        'split-diff:toggleIgnoreWhitespace': (function(_this) {
          return function() {
            return _this.toggleIgnoreWhitespace();
          };
        })(this)
      }));
    },
    deactivate: function() {
      this.disable();
      return this.subscriptions.dispose();
    },
    serialize: function() {
      return this.disable();
    },
    getVisibleEditors: function() {
      var editor1, editor2, editors, leftPane, rightPane;
      editor1 = null;
      editor2 = null;
      atom.workspace.observeTextEditors((function(_this) {
        return function(editor) {
          var $editorView, editorView;
          editorView = atom.views.getView(editor);
          $editorView = $(editorView);
          if ($editorView.is(':visible')) {
            if (editor1 === null) {
              return editor1 = editor;
            } else if (editor2 === null) {
              return editor2 = editor;
            }
          }
        };
      })(this));
      if (editor1 === null) {
        editor1 = new TextEditor();
        leftPane = atom.workspace.getActivePane();
        leftPane.addItem(editor1);
      }
      if (editor2 === null) {
        editor2 = new TextEditor();
        rightPane = atom.workspace.getActivePane().splitRight();
        rightPane.addItem(editor2);
      }
      editor1.unfoldAll();
      editor2.unfoldAll();
      if (editor1.isSoftWrapped()) {
        this.wasEditor1SoftWrapped = true;
        editor1.setSoftWrapped(false);
      }
      if (editor2.isSoftWrapped()) {
        this.wasEditor2SoftWrapped = true;
        editor2.setSoftWrapped(false);
      }
      editors = {
        editor1: editor1,
        editor2: editor2
      };
      return editors;
    },
    diffPanes: function() {
      var detailMsg, editors;
      this.disable(false);
      editors = this.getVisibleEditors();
      this.editorSubscriptions = new CompositeDisposable();
      this.editorSubscriptions.add(editors.editor1.onDidStopChanging((function(_this) {
        return function() {
          return _this.updateDiff(editors);
        };
      })(this)));
      this.editorSubscriptions.add(editors.editor2.onDidStopChanging((function(_this) {
        return function() {
          return _this.updateDiff(editors);
        };
      })(this)));
      this.editorSubscriptions.add(editors.editor1.onDidDestroy((function(_this) {
        return function() {
          return _this.disable(true);
        };
      })(this)));
      this.editorSubscriptions.add(editors.editor2.onDidDestroy((function(_this) {
        return function() {
          return _this.disable(true);
        };
      })(this)));
      this.editorSubscriptions.add(atom.config.onDidChange('split-diff.ignoreWhitespace', (function(_this) {
        return function(_arg) {
          var newValue, oldValue;
          newValue = _arg.newValue, oldValue = _arg.oldValue;
          return _this.updateDiff(editors);
        };
      })(this)));
      this.updateDiff(editors);
      detailMsg = 'Ignore whitespace: ' + this.isWhitespaceIgnored;
      return atom.notifications.addInfo('Split Diff Enabled', {
        detail: detailMsg
      });
    },
    updateDiff: function(editors) {
      var SplitDiffCompute, computedDiff;
      this.clearDiff();
      this.isWhitespaceIgnored = this.getConfig('ignoreWhitespace');
      SplitDiffCompute = require('./split-diff-compute');
      computedDiff = SplitDiffCompute.computeDiff(editors.editor1.getText(), editors.editor2.getText(), this.isWhitespaceIgnored);
      this.linkedDiffChunks = this.evaluateDiffOrder(computedDiff.chunks);
      this.displayDiff(editors, computedDiff);
      this.syncScroll = new SyncScroll(editors.editor1, editors.editor2);
      return this.syncScroll.syncPositions();
    },
    disable: function(displayMsg) {
      if (this.wasEditor1SoftWrapped) {
        this.diffViewEditor1.enableSoftWrap();
        this.wasEditor1SoftWrapped = false;
      }
      if (this.wasEditor2SoftWrapped) {
        this.diffViewEditor2.enableSoftWrap();
        this.wasEditor2SoftWrapped = false;
      }
      this.clearDiff();
      if (this.editorSubscriptions) {
        this.editorSubscriptions.dispose();
        this.editorSubscriptions = null;
      }
      if (displayMsg) {
        return atom.notifications.addInfo('Split Diff Disabled');
      }
    },
    nextDiff: function() {
      if (!this.isFirstChunkSelect) {
        this.diffChunkPointer++;
        if (this.diffChunkPointer >= this.linkedDiffChunks.length) {
          this.diffChunkPointer = 0;
        }
      } else {
        this.isFirstChunkSelect = false;
      }
      return this.selectDiffs(this.linkedDiffChunks[this.diffChunkPointer]);
    },
    prevDiff: function() {
      if (!this.isFirstChunkSelect) {
        this.diffChunkPointer--;
        if (this.diffChunkPointer < 0) {
          this.diffChunkPointer = this.linkedDiffChunks.length - 1;
        }
      } else {
        this.isFirstChunkSelect = false;
      }
      return this.selectDiffs(this.linkedDiffChunks[this.diffChunkPointer]);
    },
    selectDiffs: function(diffChunk) {
      if (this.diffViewEditor1 && this.diffViewEditor2) {
        this.diffViewEditor1.deselectAllLines();
        this.diffViewEditor2.deselectAllLines();
        if (diffChunk.oldLineStart) {
          this.diffViewEditor1.selectLines(diffChunk.oldLineStart, diffChunk.oldLineEnd);
          this.diffViewEditor2.scrollToLine(diffChunk.oldLineStart);
        }
        if (diffChunk.newLineStart) {
          this.diffViewEditor2.selectLines(diffChunk.newLineStart, diffChunk.newLineEnd);
          return this.diffViewEditor2.scrollToLine(diffChunk.newLineStart);
        }
      }
    },
    clearDiff: function() {
      var diffChunkPointer, isFirstChunkSelect;
      diffChunkPointer = 0;
      isFirstChunkSelect = true;
      if (this.diffViewEditor1) {
        this.diffViewEditor1.removeLineOffsets();
        this.diffViewEditor1.removeLineHighlights();
        this.diffViewEditor1.destroyMarkers();
        this.diffViewEditor1 = null;
      }
      if (this.diffViewEditor2) {
        this.diffViewEditor2.removeLineOffsets();
        this.diffViewEditor2.removeLineHighlights();
        this.diffViewEditor2.destroyMarkers();
        this.diffViewEditor2 = null;
      }
      if (this.syncScroll) {
        this.syncScroll.dispose();
        return this.syncScroll = null;
      }
    },
    displayDiff: function(editors, computedDiff) {
      this.diffViewEditor1 = new DiffViewEditor(editors.editor1);
      this.diffViewEditor2 = new DiffViewEditor(editors.editor2);
      this.diffViewEditor1.setLineOffsets(computedDiff.oldLineOffsets);
      this.diffViewEditor2.setLineOffsets(computedDiff.newLineOffsets);
      this.diffViewEditor1.setLineHighlights(void 0, computedDiff.removedLines);
      return this.diffViewEditor2.setLineHighlights(computedDiff.addedLines, void 0);
    },
    evaluateDiffOrder: function(chunks) {
      var c, diffChunk, diffChunks, newLineNumber, oldLineNumber, prevChunk, _i, _len;
      oldLineNumber = 0;
      newLineNumber = 0;
      prevChunk = null;
      diffChunks = [];
      for (_i = 0, _len = chunks.length; _i < _len; _i++) {
        c = chunks[_i];
        if (c.added) {
          if (prevChunk && prevChunk.removed) {
            diffChunk = {
              newLineStart: newLineNumber,
              newLineEnd: newLineNumber + c.count,
              oldLineStart: oldLineNumber - prevChunk.count,
              oldLineEnd: oldLineNumber
            };
            diffChunks.push(diffChunk);
            prevChunk = null;
          } else {
            prevChunk = c;
          }
          newLineNumber += c.count;
        } else if (c.removed) {
          if (prevChunk && prevChunk.added) {
            diffChunk = {
              newLineStart: newLineNumber - prevChunk.count,
              newLineEnd: newLineNumber,
              oldLineStart: oldLineNumber,
              oldLineEnd: oldLineNumber + c.count
            };
            diffChunks.push(diffChunk);
            prevChunk = null;
          } else {
            prevChunk = c;
          }
          oldLineNumber += c.count;
        } else {
          if (prevChunk && prevChunk.added) {
            diffChunk = {
              newLineStart: newLineNumber - prevChunk.count,
              newLineEnd: newLineNumber
            };
            diffChunks.push(diffChunk);
          } else if (prevChunk && prevChunk.removed) {
            diffChunk = {
              oldLineStart: oldLineNumber - prevChunk.count,
              oldLineEnd: oldLineNumber
            };
            diffChunks.push(diffChunk);
          }
          prevChunk = null;
          oldLineNumber += c.count;
          newLineNumber += c.count;
        }
      }
      return diffChunks;
    },
    toggleIgnoreWhitespace: function() {
      this.setConfig('ignoreWhitespace', !this.isWhitespaceIgnored);
      this.isWhiteSpaceIgnored = this.getConfig('ignoreWhitespace');
      return this.diffPanes();
    },
    getConfig: function(config) {
      return atom.config.get("split-diff." + config);
    },
    setConfig: function(config, value) {
      return atom.config.set("split-diff." + config, value);
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvd2lsbGlhbS8uYXRvbS9wYWNrYWdlcy9naXQtdGltZS1tYWNoaW5lL25vZGVfbW9kdWxlcy9zcGxpdC1kaWZmL2xpYi9zcGxpdC1kaWZmLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxrSEFBQTs7QUFBQSxFQUFBLE9BQXlELE9BQUEsQ0FBUSxNQUFSLENBQXpELEVBQUMsMkJBQUEsbUJBQUQsRUFBc0IsZUFBQSxPQUF0QixFQUErQixrQkFBQSxVQUEvQixFQUEyQyxrQkFBQSxVQUEzQyxDQUFBOztBQUFBLEVBQ0MsSUFBSyxPQUFBLENBQVEsV0FBUixFQUFMLENBREQsQ0FBQTs7QUFBQSxFQUVBLGNBQUEsR0FBaUIsT0FBQSxDQUFRLGVBQVIsQ0FGakIsQ0FBQTs7QUFBQSxFQUdBLFVBQUEsR0FBYSxPQUFBLENBQVEsZUFBUixDQUhiLENBQUE7O0FBQUEsRUFJQSxZQUFBLEdBQWUsT0FBQSxDQUFRLGlCQUFSLENBSmYsQ0FBQTs7QUFBQSxFQU1BLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFNBQUEsR0FDZjtBQUFBLElBQUEsTUFBQSxFQUFRLFlBQVI7QUFBQSxJQUNBLGFBQUEsRUFBZSxJQURmO0FBQUEsSUFFQSxlQUFBLEVBQWlCLElBRmpCO0FBQUEsSUFHQSxlQUFBLEVBQWlCLElBSGpCO0FBQUEsSUFJQSxtQkFBQSxFQUFxQixJQUpyQjtBQUFBLElBS0EsbUJBQUEsRUFBcUIsS0FMckI7QUFBQSxJQU1BLGdCQUFBLEVBQWtCLElBTmxCO0FBQUEsSUFPQSxnQkFBQSxFQUFrQixDQVBsQjtBQUFBLElBUUEsa0JBQUEsRUFBb0IsSUFScEI7QUFBQSxJQVNBLHFCQUFBLEVBQXVCLEtBVHZCO0FBQUEsSUFVQSxxQkFBQSxFQUF1QixLQVZ2QjtBQUFBLElBWUEsUUFBQSxFQUFVLFNBQUMsS0FBRCxHQUFBO0FB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

//# sourceURL=/home/william/.atom/packages/git-time-machine/node_modules/split-diff/lib/split-diff.coffee
