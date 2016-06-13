(function() {
  var CompositeDisposable, DiffViewEditor, Emitter, SplitDiff, SyncScroll, TextBuffer, TextEditor, configSchema, _ref;

  _ref = require('atom'), CompositeDisposable = _ref.CompositeDisposable, Emitter = _ref.Emitter, TextEditor = _ref.TextEditor, TextBuffer = _ref.TextBuffer;

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
    isWordDiffEnabled: true,
    linkedDiffChunks: null,
    diffChunkPointer: 0,
    isFirstChunkSelect: true,
    wasEditor1SoftWrapped: false,
    wasEditor2SoftWrapped: false,
    isEnabled: false,
    activate: function(state) {
      this.subscriptions = new CompositeDisposable();
      return this.subscriptions.add(atom.commands.add('atom-workspace', {
        'split-diff:enable': (function(_this) {
          return function() {
            return _this.diffPanes();
          };
        })(this),
        'split-diff:next-diff': (function(_this) {
          return function() {
            return _this.nextDiff();
          };
        })(this),
        'split-diff:prev-diff': (function(_this) {
          return function() {
            return _this.prevDiff();
          };
        })(this),
        'split-diff:disable': (function(_this) {
          return function() {
            return _this.disable();
          };
        })(this),
        'split-diff:ignore-whitespace': (function(_this) {
          return function() {
            return _this.toggleIgnoreWhitespace();
          };
        })(this),
        'split-diff:toggle': (function(_this) {
          return function() {
            return _this.toggle();
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
      var activeItem, editor1, editor2, editors, leftPane, p, panes, rightPane, _i, _len;
      editor1 = null;
      editor2 = null;
      panes = atom.workspace.getPanes();
      for (_i = 0, _len = panes.length; _i < _len; _i++) {
        p = panes[_i];
        activeItem = p.getActiveItem();
        if (activeItem instanceof TextEditor) {
          if (editor1 === null) {
            editor1 = activeItem;
          } else if (editor2 === null) {
            editor2 = activeItem;
            break;
          }
        }
      }
      if (editor1 === null) {
        editor1 = new TextEditor();
        leftPane = atom.workspace.getActivePane();
        leftPane.addItem(editor1);
      }
      if (editor2 === null) {
        editor2 = new TextEditor();
        editor2.setGrammar(editor1.getGrammar());
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
      this.editorSubscriptions.add(atom.config.onDidChange('split-diff.diffWords', (function(_this) {
        return function(_arg) {
          var newValue, oldValue;
          newValue = _arg.newValue, oldValue = _arg.oldValue;
          return _this.updateDiff(editors);
        };
      })(this)));
      this.editorSubscriptions.add(atom.config.onDidChange('split-diff.leftEditorColor', (function(_this) {
        return function(_arg) {
          var newValue, oldValue;
          newValue = _arg.newValue, oldValue = _arg.oldValue;
          return _this.updateDiff(editors);
        };
      })(this)));
      this.editorSubscriptions.add(atom.config.onDidChange('split-diff.rightEditorColor', (function(_this) {
        return function(_arg) {
          var newValue, oldValue;
          newValue = _arg.newValue, oldValue = _arg.oldValue;
          return _this.updateDiff(editors);
        };
      })(this)));
      this.updateDiff(editors);
      this.editorSubscriptions.add(atom.menu.add([
        {
          'label': 'Packages',
          'submenu': [
            {
              'label': 'Split Diff',
              'submenu': [
                {
                  'label': 'Ignore Whitespace',
                  'command': 'split-diff:ignore-whitespace'
                }, {
                  'label': 'Move to Next Diff',
                  'command': 'split-diff:next-diff'
                }, {
                  'label': 'Move to Previous Diff',
                  'command': 'split-diff:prev-diff'
                }
              ]
            }
          ]
        }
      ]));
      this.editorSubscriptions.add(atom.contextMenu.add({
        'atom-text-editor': [
          {
            'label': 'Split Diff',
            'submenu': [
              {
                'label': 'Ignore Whitespace',
                'command': 'split-diff:ignore-whitespace'
              }, {
                'label': 'Move to Next Diff',
                'command': 'split-diff:next-diff'
              }, {
                'label': 'Move to Previous Diff',
                'command': 'split-diff:prev-diff'
              }
            ]
          }
        ]
      }));
      detailMsg = 'Ignore Whitespace: ' + this.isWhitespaceIgnored;
      detailMsg += '\nShow Word Diff: ' + this.isWordDiffEnabled;
      return atom.notifications.addInfo('Split Diff Enabled', {
        detail: detailMsg,
        dismissable: false
      });
    },
    updateDiff: function(editors) {
      var SplitDiffCompute, computedDiff;
      this.isEnabled = true;
      this.clearDiff();
      this.isWhitespaceIgnored = this.getConfig('ignoreWhitespace');
      this.isWordDiffEnabled = this.getConfig('diffWords');
      SplitDiffCompute = require('./split-diff-compute');
      computedDiff = SplitDiffCompute.computeDiff(editors.editor1.getText(), editors.editor2.getText(), this.isWhitespaceIgnored);
      this.linkedDiffChunks = this.evaluateDiffOrder(computedDiff.chunks);
      this.displayDiff(editors, computedDiff);
      if (this.isWordDiffEnabled) {
        this.highlightWordDiff(SplitDiffCompute, this.linkedDiffChunks);
      }
      this.syncScroll = new SyncScroll(editors.editor1, editors.editor2);
      return this.syncScroll.syncPositions();
    },
    disable: function(displayMsg) {
      this.isEnabled = false;
      if (this.wasEditor1SoftWrapped) {
        this.diffViewEditor1.enableSoftWrap();
        this.wasEditor1SoftWrapped = false;
      }
      if (this.wasEditor2SoftWrapped) {
        this.diffViewEditor2.enableSoftWrap();
        this.wasEditor2SoftWrapped = false;
      }
      this.clearDiff();
      if (this.editorSubscriptions != null) {
        this.editorSubscriptions.dispose();
        this.editorSubscriptions = null;
      }
      if (displayMsg) {
        return atom.notifications.addInfo('Split Diff Disabled', {
          dismissable: false
        });
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
      if ((diffChunk != null) && (this.diffViewEditor1 != null) && (this.diffViewEditor2 != null)) {
        this.diffViewEditor1.deselectAllLines();
        this.diffViewEditor2.deselectAllLines();
        if (diffChunk.oldLineStart != null) {
          this.diffViewEditor1.selectLines(diffChunk.oldLineStart, diffChunk.oldLineEnd);
          this.diffViewEditor2.scrollToLine(diffChunk.oldLineStart);
        }
        if (diffChunk.newLineStart != null) {
          this.diffViewEditor2.selectLines(diffChunk.newLineStart, diffChunk.newLineEnd);
          return this.diffViewEditor2.scrollToLine(diffChunk.newLineStart);
        }
      }
    },
    clearDiff: function() {
      this.diffChunkPointer = 0;
      this.isFirstChunkSelect = true;
      if (this.diffViewEditor1 != null) {
        this.diffViewEditor1.destroyMarkers();
        this.diffViewEditor1 = null;
      }
      if (this.diffViewEditor2 != null) {
        this.diffViewEditor2.destroyMarkers();
        this.diffViewEditor2 = null;
      }
      if (this.syncScroll != null) {
        this.syncScroll.dispose();
        return this.syncScroll = null;
      }
    },
    displayDiff: function(editors, computedDiff) {
      var leftColor, rightColor;
      this.diffViewEditor1 = new DiffViewEditor(editors.editor1);
      this.diffViewEditor2 = new DiffViewEditor(editors.editor2);
      leftColor = this.getConfig('leftEditorColor');
      rightColor = this.getConfig('rightEditorColor');
      if (leftColor === 'green') {
        this.diffViewEditor1.setLineHighlights(computedDiff.removedLines, 'added');
      } else {
        this.diffViewEditor1.setLineHighlights(computedDiff.removedLines, 'removed');
      }
      if (rightColor === 'green') {
        this.diffViewEditor2.setLineHighlights(computedDiff.addedLines, 'added');
      } else {
        this.diffViewEditor2.setLineHighlights(computedDiff.addedLines, 'removed');
      }
      this.diffViewEditor1.setLineOffsets(computedDiff.oldLineOffsets);
      return this.diffViewEditor2.setLineOffsets(computedDiff.newLineOffsets);
    },
    evaluateDiffOrder: function(chunks) {
      var c, diffChunk, diffChunks, newLineNumber, oldLineNumber, prevChunk, _i, _len;
      oldLineNumber = 0;
      newLineNumber = 0;
      prevChunk = null;
      diffChunks = [];
      for (_i = 0, _len = chunks.length; _i < _len; _i++) {
        c = chunks[_i];
        if (c.added != null) {
          if ((prevChunk != null) && (prevChunk.removed != null)) {
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
        } else if (c.removed != null) {
          if ((prevChunk != null) && (prevChunk.added != null)) {
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
          if ((prevChunk != null) && (prevChunk.added != null)) {
            diffChunk = {
              newLineStart: newLineNumber - prevChunk.count,
              newLineEnd: newLineNumber
            };
            diffChunks.push(diffChunk);
          } else if ((prevChunk != null) && (prevChunk.removed != null)) {
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
    highlightWordDiff: function(SplitDiffCompute, chunks) {
      var c, excessLines, i, j, leftColor, lineRange, rightColor, wordDiff, _i, _j, _len, _results;
      leftColor = this.getConfig('leftEditorColor');
      rightColor = this.getConfig('rightEditorColor');
      _results = [];
      for (_i = 0, _len = chunks.length; _i < _len; _i++) {
        c = chunks[_i];
        if ((c.newLineStart != null) && (c.oldLineStart != null)) {
          lineRange = 0;
          excessLines = 0;
          if ((c.newLineEnd - c.newLineStart) < (c.oldLineEnd - c.oldLineStart)) {
            lineRange = c.newLineEnd - c.newLineStart;
            excessLines = (c.oldLineEnd - c.oldLineStart) - lineRange;
          } else {
            lineRange = c.oldLineEnd - c.oldLineStart;
            excessLines = (c.newLineEnd - c.newLineStart) - lineRange;
          }
          for (i = _j = 0; _j < lineRange; i = _j += 1) {
            wordDiff = SplitDiffCompute.computeWordDiff(this.diffViewEditor1.getLineText(c.oldLineStart + i), this.diffViewEditor2.getLineText(c.newLineStart + i), this.isWhitespaceIgnored);
            if (leftColor === 'green') {
              this.diffViewEditor1.setWordHighlights(c.oldLineStart + i, wordDiff.removedWords, 'added', this.isWhitespaceIgnored);
            } else {
              this.diffViewEditor1.setWordHighlights(c.oldLineStart + i, wordDiff.removedWords, 'removed', this.isWhitespaceIgnored);
            }
            if (rightColor === 'green') {
              this.diffViewEditor2.setWordHighlights(c.newLineStart + i, wordDiff.addedWords, 'added', this.isWhitespaceIgnored);
            } else {
              this.diffViewEditor2.setWordHighlights(c.newLineStart + i, wordDiff.addedWords, 'removed', this.isWhitespaceIgnored);
            }
          }
          _results.push((function() {
            var _k, _results1;
            _results1 = [];
            for (j = _k = 0; _k < excessLines; j = _k += 1) {
              if ((c.newLineEnd - c.newLineStart) < (c.oldLineEnd - c.oldLineStart)) {
                if (leftColor === 'green') {
                  _results1.push(this.diffViewEditor1.setWordHighlights(c.oldLineStart + lineRange + j, [
                    {
                      changed: true,
                      value: this.diffViewEditor1.getLineText(c.oldLineStart + lineRange + j)
                    }
                  ], 'added', this.isWhitespaceIgnored));
                } else {
                  _results1.push(this.diffViewEditor1.setWordHighlights(c.oldLineStart + lineRange + j, [
                    {
                      changed: true,
                      value: this.diffViewEditor1.getLineText(c.oldLineStart + lineRange + j)
                    }
                  ], 'removed', this.isWhitespaceIgnored));
                }
              } else if ((c.newLineEnd - c.newLineStart) > (c.oldLineEnd - c.oldLineStart)) {
                if (rightColor === 'green') {
                  _results1.push(this.diffViewEditor2.setWordHighlights(c.newLineStart + lineRange + j, [
                    {
                      changed: true,
                      value: this.diffViewEditor2.getLineText(c.newLineStart + lineRange + j)
                    }
                  ], 'added', this.isWhitespaceIgnored));
                } else {
                  _results1.push(this.diffViewEditor2.setWordHighlights(c.newLineStart + lineRange + j, [
                    {
                      changed: true,
                      value: this.diffViewEditor2.getLineText(c.newLineStart + lineRange + j)
                    }
                  ], 'removed', this.isWhitespaceIgnored));
                }
              } else {
                _results1.push(void 0);
              }
            }
            return _results1;
          }).call(this));
        } else if (c.newLineStart != null) {
          lineRange = c.newLineEnd - c.newLineStart;
          _results.push((function() {
            var _k, _results1;
            _results1 = [];
            for (i = _k = 0; _k < lineRange; i = _k += 1) {
              if (rightColor === 'green') {
                _results1.push(this.diffViewEditor2.setWordHighlights(c.newLineStart + i, [
                  {
                    changed: true,
                    value: this.diffViewEditor2.getLineText(c.newLineStart + i)
                  }
                ], 'added', this.isWhitespaceIgnored));
              } else {
                _results1.push(this.diffViewEditor2.setWordHighlights(c.newLineStart + i, [
                  {
                    changed: true,
                    value: this.diffViewEditor2.getLineText(c.newLineStart + i)
                  }
                ], 'removed', this.isWhitespaceIgnored));
              }
            }
            return _results1;
          }).call(this));
        } else if (c.oldLineStart != null) {
          lineRange = c.oldLineEnd - c.oldLineStart;
          _results.push((function() {
            var _k, _results1;
            _results1 = [];
            for (i = _k = 0; _k < lineRange; i = _k += 1) {
              if (leftColor === 'green') {
                _results1.push(this.diffViewEditor1.setWordHighlights(c.oldLineStart + i, [
                  {
                    changed: true,
                    value: this.diffViewEditor1.getLineText(c.oldLineStart + i)
                  }
                ], 'added', this.isWhitespaceIgnored));
              } else {
                _results1.push(this.diffViewEditor1.setWordHighlights(c.oldLineStart + i, [
                  {
                    changed: true,
                    value: this.diffViewEditor1.getLineText(c.oldLineStart + i)
                  }
                ], 'removed', this.isWhitespaceIgnored));
              }
            }
            return _results1;
          }).call(this));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    },
    toggleIgnoreWhitespace: function() {
      this.setConfig('ignoreWhitespace', !this.isWhitespaceIgnored);
      return this.isWhitespaceIgnored = this.getConfig('ignoreWhitespace');
    },
    toggle: function() {
      if (this.isEnabled) {
        return this.disable(true);
      } else {
        return this.diffPanes();
      }
    },
    getConfig: function(config) {
      return atom.config.get("split-diff." + config);
    },
    setConfig: function(config, value) {
      return atom.config.set("split-diff." + config, value);
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvd2lsbGlhbS8uYXRvbS9wYWNrYWdlcy9naXQtdGltZS1tYWNoaW5lL25vZGVfbW9kdWxlcy9zcGxpdC1kaWZmL2xpYi9zcGxpdC1kaWZmLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSwrR0FBQTs7QUFBQSxFQUFBLE9BQXlELE9BQUEsQ0FBUSxNQUFSLENBQXpELEVBQUMsMkJBQUEsbUJBQUQsRUFBc0IsZUFBQSxPQUF0QixFQUErQixrQkFBQSxVQUEvQixFQUEyQyxrQkFBQSxVQUEzQyxDQUFBOztBQUFBLEVBQ0EsY0FBQSxHQUFpQixPQUFBLENBQVEsZUFBUixDQURqQixDQUFBOztBQUFBLEVBRUEsVUFBQSxHQUFhLE9BQUEsQ0FBUSxlQUFSLENBRmIsQ0FBQTs7QUFBQSxFQUdBLFlBQUEsR0FBZSxPQUFBLENBQVEsaUJBQVIsQ0FIZixDQUFBOztBQUFBLEVBS0EsTUFBTSxDQUFDLE9BQVAsR0FBaUIsU0FBQSxHQUNmO0FBQUEsSUFBQSxNQUFBLEVBQVEsWUFBUjtBQUFBLElBQ0EsYUFBQSxFQUFlLElBRGY7QUFBQSxJQUVBLGVBQUEsRUFBaUIsSUFGakI7QUFBQSxJQUdBLGVBQUEsRUFBaUIsSUFIakI7QUFBQSxJQUlBLG1CQUFBLEVBQXFCLElBSnJCO0FBQUEsSUFLQSxtQkFBQSxFQUFxQixLQUxyQjtBQUFBLElBTUEsaUJBQUEsRUFBbUIsSUFObkI7QUFBQSxJQU9BLGdCQUFBLEVBQWtCLElBUGxCO0FBQUEsSUFRQSxnQkFBQSxFQUFrQixDQVJsQjtBQUFBLElBU0Esa0JBQUEsRUFBb0IsSUFUcEI7QUFBQSxJQVVBLHFCQUFBLEVBQXVCLEtBVnZCO0FBQUEsSUFXQSxxQkFBQSxFQUF1QixLQVh2QjtBQUFBLElBWUEsU0FBQSxFQUFXLEtBWlg7QUFBQSxJQWNBLFFBQUEsRUFBVSxTQUFDLEtBQUQs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

//# sourceURL=/home/william/.atom/packages/git-time-machine/node_modules/split-diff/lib/split-diff.coffee
