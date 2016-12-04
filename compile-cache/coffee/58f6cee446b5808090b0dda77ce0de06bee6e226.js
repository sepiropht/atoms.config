(function() {
  var AFTERPROPS, AutoIndent, BRACE_CLOSE, BRACE_OPEN, CompositeDisposable, File, InsertNl, JSXBRACE_CLOSE, JSXBRACE_OPEN, JSXTAG_CLOSE, JSXTAG_CLOSE_ATTRS, JSXTAG_OPEN, JSXTAG_SELFCLOSE_END, JSXTAG_SELFCLOSE_START, JS_ELSE, JS_IF, JS_RETURN, LINEALIGNED, NO_TOKEN, PAREN_CLOSE, PAREN_OPEN, PROPSALIGNED, Point, Range, SWITCH_BRACE_CLOSE, SWITCH_BRACE_OPEN, SWITCH_CASE, SWITCH_DEFAULT, TAGALIGNED, TERNARY_ELSE, TERNARY_IF, YAML, autoCompleteJSX, fs, path, ref, stripJsonComments,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  ref = require('atom'), CompositeDisposable = ref.CompositeDisposable, File = ref.File, Range = ref.Range, Point = ref.Point;

  fs = require('fs-plus');

  path = require('path');

  autoCompleteJSX = require('./auto-complete-jsx');

  InsertNl = require('./insert-nl');

  stripJsonComments = require('strip-json-comments');

  YAML = require('js-yaml');

  NO_TOKEN = 0;

  JSXTAG_SELFCLOSE_START = 1;

  JSXTAG_SELFCLOSE_END = 2;

  JSXTAG_OPEN = 3;

  JSXTAG_CLOSE_ATTRS = 4;

  JSXTAG_CLOSE = 5;

  JSXBRACE_OPEN = 6;

  JSXBRACE_CLOSE = 7;

  BRACE_OPEN = 8;

  BRACE_CLOSE = 9;

  TERNARY_IF = 10;

  TERNARY_ELSE = 11;

  JS_IF = 12;

  JS_ELSE = 13;

  SWITCH_BRACE_OPEN = 14;

  SWITCH_BRACE_CLOSE = 15;

  SWITCH_CASE = 16;

  SWITCH_DEFAULT = 17;

  JS_RETURN = 18;

  PAREN_OPEN = 19;

  PAREN_CLOSE = 20;

  TAGALIGNED = 'tag-aligned';

  LINEALIGNED = 'line-aligned';

  AFTERPROPS = 'after-props';

  PROPSALIGNED = 'props-aligned';

  module.exports = AutoIndent = (function() {
    function AutoIndent(editor) {
      this.editor = editor;
      this.onMouseUp = bind(this.onMouseUp, this);
      this.onMouseDown = bind(this.onMouseDown, this);
      this.handleOnDidStopChanging = bind(this.handleOnDidStopChanging, this);
      this.changedCursorPosition = bind(this.changedCursorPosition, this);
      this.InsertNl = new InsertNl(this.editor);
      this.autoJsx = atom.config.get('language-babel').autoIndentJSX;
      this.JSXREGEXP = /(<)([$_A-Za-z](?:[$_.:\-A-Za-z0-9])*)|(\/>)|(<\/)([$_A-Za-z](?:[$._:\-A-Za-z0-9])*)(>)|(>)|({)|(})|(\?)|(:)|(if)|(else)|(case)|(default)|(return)|(\()|(\))/g;
      this.mouseUp = true;
      this.multipleCursorTrigger = 1;
      this.disposables = new CompositeDisposable();
      this.eslintIndentOptions = this.getIndentOptions();
      this.disposables.add(atom.commands.add('atom-text-editor', {
        'language-babel:auto-indent-jsx-on': (function(_this) {
          return function(event) {
            _this.autoJsx = true;
            return _this.eslintIndentOptions = _this.getIndentOptions();
          };
        })(this)
      }));
      this.disposables.add(atom.commands.add('atom-text-editor', {
        'language-babel:auto-indent-jsx-off': (function(_this) {
          return function(event) {
            return _this.autoJsx = false;
          };
        })(this)
      }));
      this.disposables.add(atom.commands.add('atom-text-editor', {
        'language-babel:toggle-auto-indent-jsx': (function(_this) {
          return function(event) {
            _this.autoJsx = !_this.autoJsx;
            if (_this.autoJsx) {
              return _this.eslintIndentOptions = _this.getIndentOptions();
            }
          };
        })(this)
      }));
      document.addEventListener('mousedown', this.onMouseDown);
      document.addEventListener('mouseup', this.onMouseUp);
      this.disposables.add(this.editor.onDidChangeCursorPosition((function(_this) {
        return function(event) {
          return _this.changedCursorPosition(event);
        };
      })(this)));
      this.handleOnDidStopChanging();
    }

    AutoIndent.prototype.destroy = function() {
      this.disposables.dispose();
      this.onDidStopChangingHandler.dispose();
      document.removeEventListener('mousedown', this.onMouseDown);
      return document.removeEventListener('mouseup', this.onMouseUp);
    };

    AutoIndent.prototype.changedCursorPosition = function(event) {
      var blankLineEndPos, bufferRow, columnToMoveTo, cursorPosition, cursorPositions, endPointOfJsx, j, len, previousRow, ref1, ref2, startPointOfJsx;
      if (!this.autoJsx) {
        return;
      }
      if (!this.mouseUp) {
        return;
      }
      if (event.oldBufferPosition.row === event.newBufferPosition.row) {
        return;
      }
      bufferRow = event.newBufferPosition.row;
      if (this.editor.hasMultipleCursors()) {
        cursorPositions = this.editor.getCursorBufferPositions();
        if (cursorPositions.length === this.multipleCursorTrigger) {
          this.multipleCursorTrigger = 1;
          bufferRow = 0;
          for (j = 0, len = cursorPositions.length; j < len; j++) {
            cursorPosition = cursorPositions[j];
            if (cursorPosition.row > bufferRow) {
              bufferRow = cursorPosition.row;
            }
          }
        } else {
          this.multipleCursorTrigger++;
          return;
        }
      } else {
        cursorPosition = event.newBufferPosition;
      }
      previousRow = event.oldBufferPosition.row;
      if (this.jsxInScope(previousRow)) {
        blankLineEndPos = (ref1 = /^\s*$/.exec(this.editor.lineTextForBufferRow(previousRow))) != null ? ref1[0].length : void 0;
        if (blankLineEndPos != null) {
          this.indentRow({
            row: previousRow,
            blockIndent: 0
          });
        }
      }
      if (!this.jsxInScope(bufferRow)) {
        return;
      }
      endPointOfJsx = new Point(bufferRow, 0);
      startPointOfJsx = autoCompleteJSX.getStartOfJSX(this.editor, cursorPosition);
      this.indentJSX(new Range(startPointOfJsx, endPointOfJsx));
      columnToMoveTo = (ref2 = /^\s*$/.exec(this.editor.lineTextForBufferRow(bufferRow))) != null ? ref2[0].length : void 0;
      if (columnToMoveTo != null) {
        return this.editor.setCursorBufferPosition([bufferRow, columnToMoveTo]);
      }
    };

    AutoIndent.prototype.didStopChanging = function() {
      var endPointOfJsx, highestRow, lowestRow, selectedRange, startPointOfJsx;
      if (!this.autoJsx) {
        return;
      }
      if (!this.mouseUp) {
        return;
      }
      selectedRange = this.editor.getSelectedBufferRange();
      if (selectedRange.start.row === selectedRange.end.row && selectedRange.start.column === selectedRange.end.column && indexOf.call(this.editor.scopeDescriptorForBufferPosition([selectedRange.start.row, selectedRange.start.column]).getScopesArray(), 'JSXStartTagEnd') >= 0) {
        return;
      }
      highestRow = Math.max(selectedRange.start.row, selectedRange.end.row);
      lowestRow = Math.min(selectedRange.start.row, selectedRange.end.row);
      this.onDidStopChangingHandler.dispose();
      while (highestRow >= lowestRow) {
        if (this.jsxInScope(highestRow)) {
          endPointOfJsx = new Point(highestRow, 0);
          startPointOfJsx = autoCompleteJSX.getStartOfJSX(this.editor, endPointOfJsx);
          this.indentJSX(new Range(startPointOfJsx, endPointOfJsx));
          highestRow = startPointOfJsx.row - 1;
        } else {
          highestRow = highestRow - 1;
        }
      }
      setTimeout(this.handleOnDidStopChanging, 300);
    };

    AutoIndent.prototype.handleOnDidStopChanging = function() {
      return this.onDidStopChangingHandler = this.editor.onDidStopChanging((function(_this) {
        return function() {
          return _this.didStopChanging();
        };
      })(this));
    };

    AutoIndent.prototype.jsxInScope = function(bufferRow) {
      var scopes;
      scopes = this.editor.scopeDescriptorForBufferPosition([bufferRow, 0]).getScopesArray();
      return indexOf.call(scopes, 'meta.tag.jsx') >= 0;
    };

    AutoIndent.prototype.indentJSX = function(range) {
      var blankLineEndPos, firstCharIndentation, firstTagInLineIndentation, idxOfToken, indent, indentRecalc, isFirstTagOfBlock, isFirstTokenOfLine, j, line, match, matchColumn, matchPointEnd, matchPointStart, matchRange, parentTokenIdx, ref1, ref2, ref3, results, row, stackOfTokensStillOpen, token, tokenIndentation, tokenOnThisLine, tokenStack;
      tokenStack = [];
      idxOfToken = 0;
      stackOfTokensStillOpen = [];
      indent = 0;
      isFirstTagOfBlock = true;
      this.JSXREGEXP.lastIndex = 0;
      results = [];
      for (row = j = ref1 = range.start.row, ref2 = range.end.row; ref1 <= ref2 ? j <= ref2 : j >= ref2; row = ref1 <= ref2 ? ++j : --j) {
        isFirstTokenOfLine = true;
        tokenOnThisLine = false;
        indentRecalc = false;
        line = this.editor.lineTextForBufferRow(row);
        while ((match = this.JSXREGEXP.exec(line)) !== null) {
          matchColumn = match.index;
          matchPointStart = new Point(row, matchColumn);
          matchPointEnd = new Point(row, matchColumn + match[0].length - 1);
          matchRange = new Range(matchPointStart, matchPointEnd);
          if (!(token = this.getToken(row, match))) {
            continue;
          }
          firstCharIndentation = this.editor.indentationForBufferRow(row);
          if (this.editor.getSoftTabs()) {
            tokenIndentation = matchColumn / this.editor.getTabLength();
          } else {
            tokenIndentation = (function(editor) {
              var charsFound, hardTabsFound, i, k, ref3;
              this.editor = editor;
              hardTabsFound = charsFound = 0;
              for (i = k = 0, ref3 = matchColumn; 0 <= ref3 ? k < ref3 : k > ref3; i = 0 <= ref3 ? ++k : --k) {
                if ((line.substr(i, 1)) === '\t') {
                  hardTabsFound++;
                } else {
                  charsFound++;
                }
              }
              return hardTabsFound + (charsFound / this.editor.getTabLength());
            })(this.editor);
          }
          if (isFirstTokenOfLine) {
            firstTagInLineIndentation = tokenIndentation;
          }
          switch (token) {
            case JSXTAG_OPEN:
              tokenOnThisLine = true;
              if (isFirstTokenOfLine) {
                stackOfTokensStillOpen.push(parentTokenIdx = stackOfTokensStillOpen.pop());
                if (isFirstTagOfBlock && (parentTokenIdx != null) && tokenStack[parentTokenIdx].type === BRACE_OPEN && tokenStack[parentTokenIdx].row === (row - 1)) {
                  tokenIndentation = firstCharIndentation = firstTagInLineIndentation = this.eslintIndentOptions.jsxIndent[1] + this.getIndentOfPreviousRow(row);
                  indentRecalc = this.indentRow({
                    row: row,
                    blockIndent: firstCharIndentation
                  });
                } else if (isFirstTagOfBlock && (parentTokenIdx != null)) {
                  indentRecalc = this.indentRow({
                    row: row,
                    blockIndent: this.getIndentOfPreviousRow(row),
                    jsxIndent: 1
                  });
                } else if (parentTokenIdx != null) {
                  indentRecalc = this.indentRow({
                    row: row,
                    blockIndent: tokenStack[parentTokenIdx].firstCharIndentation,
                    jsxIndent: 1
                  });
                }
              }
              if (indentRecalc) {
                line = this.editor.lineTextForBufferRow(row);
                this.JSXREGEXP.lastIndex = 0;
                continue;
              }
              isFirstTokenOfLine = false;
              isFirstTagOfBlock = false;
              stackOfTokensStillOpen.push(parentTokenIdx = stackOfTokensStillOpen.pop());
              tokenStack.push({
                type: JSXTAG_OPEN,
                name: match[2],
                row: row,
                firstTagInLineIndentation: firstTagInLineIndentation,
                tokenIndentation: tokenIndentation,
                firstCharIndentation: firstCharIndentation,
                parentTokenIdx: parentTokenIdx,
                termsThisTagsAttributesIdx: null,
                termsThisTagIdx: null
              });
              stackOfTokensStillOpen.push(idxOfToken);
              idxOfToken++;
              break;
            case JSXTAG_CLOSE:
              tokenOnThisLine = true;
              if (isFirstTokenOfLine) {
                stackOfTokensStillOpen.push(parentTokenIdx = stackOfTokensStillOpen.pop());
                indentRecalc = this.indentRow({
                  row: row,
                  blockIndent: tokenStack[parentTokenIdx].firstCharIndentation
                });
              }
              if (indentRecalc) {
                line = this.editor.lineTextForBufferRow(row);
                this.JSXREGEXP.lastIndex = 0;
                continue;
              }
              isFirstTokenOfLine = false;
              isFirstTagOfBlock = false;
              parentTokenIdx = stackOfTokensStillOpen.pop();
              tokenStack.push({
                type: JSXTAG_CLOSE,
                name: match[5],
                row: row,
                parentTokenIdx: parentTokenIdx
              });
              if (parentTokenIdx >= 0) {
                tokenStack[parentTokenIdx].termsThisTagIdx = idxOfToken;
              }
              idxOfToken++;
              break;
            case JSXTAG_SELFCLOSE_END:
              tokenOnThisLine = true;
              if (isFirstTokenOfLine) {
                stackOfTokensStillOpen.push(parentTokenIdx = stackOfTokensStillOpen.pop());
                if (firstTagInLineIndentation === firstCharIndentation) {
                  indentRecalc = this.indentForClosingBracket(row, tokenStack[parentTokenIdx], this.eslintIndentOptions.jsxClosingBracketLocation[1].selfClosing);
                } else {
                  indentRecalc = this.indentRow({
                    row: row,
                    blockIndent: tokenStack[parentTokenIdx].firstTagInLineIndentation,
                    jsxIndentProps: 1
                  });
                }
              }
              if (indentRecalc) {
                line = this.editor.lineTextForBufferRow(row);
                this.JSXREGEXP.lastIndex = 0;
                continue;
              }
              isFirstTagOfBlock = false;
              isFirstTokenOfLine = false;
              parentTokenIdx = stackOfTokensStillOpen.pop();
              tokenStack.push({
                type: JSXTAG_SELFCLOSE_END,
                name: tokenStack[parentTokenIdx].name,
                row: row,
                parentTokenIdx: parentTokenIdx
              });
              if (parentTokenIdx >= 0) {
                tokenStack[parentTokenIdx].termsThisTagsAttributesIdx = idxOfToken;
                tokenStack[parentTokenIdx].type = JSXTAG_SELFCLOSE_START;
                tokenStack[parentTokenIdx].termsThisTagIdx = idxOfToken;
              }
              idxOfToken++;
              break;
            case JSXTAG_CLOSE_ATTRS:
              tokenOnThisLine = true;
              if (isFirstTokenOfLine) {
                stackOfTokensStillOpen.push(parentTokenIdx = stackOfTokensStillOpen.pop());
                if (firstTagInLineIndentation === firstCharIndentation) {
                  indentRecalc = this.indentForClosingBracket(row, tokenStack[parentTokenIdx], this.eslintIndentOptions.jsxClosingBracketLocation[1].nonEmpty);
                } else {
                  indentRecalc = this.indentRow({
                    row: row,
                    blockIndent: tokenStack[parentTokenIdx].firstTagInLineIndentation,
                    jsxIndentProps: 1
                  });
                }
              }
              if (indentRecalc) {
                line = this.editor.lineTextForBufferRow(row);
                this.JSXREGEXP.lastIndex = 0;
                continue;
              }
              isFirstTagOfBlock = false;
              isFirstTokenOfLine = false;
              stackOfTokensStillOpen.push(parentTokenIdx = stackOfTokensStillOpen.pop());
              tokenStack.push({
                type: JSXTAG_CLOSE_ATTRS,
                name: tokenStack[parentTokenIdx].name,
                row: row,
                parentTokenIdx: parentTokenIdx
              });
              if (parentTokenIdx >= 0) {
                tokenStack[parentTokenIdx].termsThisTagsAttributesIdx = idxOfToken;
              }
              idxOfToken++;
              break;
            case JSXBRACE_OPEN:
              tokenOnThisLine = true;
              if (isFirstTokenOfLine) {
                stackOfTokensStillOpen.push(parentTokenIdx = stackOfTokensStillOpen.pop());
                if (parentTokenIdx != null) {
                  if (tokenStack[parentTokenIdx].type === JSXTAG_OPEN && tokenStack[parentTokenIdx].termsThisTagsAttributesIdx === null) {
                    indentRecalc = this.indentRow({
                      row: row,
                      blockIndent: tokenStack[parentTokenIdx].firstCharIndentation,
                      jsxIndentProps: 1
                    });
                  } else {
                    indentRecalc = this.indentRow({
                      row: row,
                      blockIndent: tokenStack[parentTokenIdx].firstCharIndentation,
                      jsxIndent: 1
                    });
                  }
                }
              }
              if (indentRecalc) {
                line = this.editor.lineTextForBufferRow(row);
                this.JSXREGEXP.lastIndex = 0;
                continue;
              }
              isFirstTagOfBlock = true;
              isFirstTokenOfLine = false;
              stackOfTokensStillOpen.push(parentTokenIdx = stackOfTokensStillOpen.pop());
              tokenStack.push({
                type: JSXBRACE_OPEN,
                name: '',
                row: row,
                firstTagInLineIndentation: firstTagInLineIndentation,
                tokenIndentation: tokenIndentation,
                firstCharIndentation: firstCharIndentation,
                parentTokenIdx: parentTokenIdx,
                termsThisTagsAttributesIdx: null,
                termsThisTagIdx: null
              });
              stackOfTokensStillOpen.push(idxOfToken);
              idxOfToken++;
              break;
            case JSXBRACE_CLOSE:
              tokenOnThisLine = true;
              if (isFirstTokenOfLine) {
                stackOfTokensStillOpen.push(parentTokenIdx = stackOfTokensStillOpen.pop());
                indentRecalc = this.indentRow({
                  row: row,
                  blockIndent: tokenStack[parentTokenIdx].firstCharIndentation
                });
              }
              if (indentRecalc) {
                line = this.editor.lineTextForBufferRow(row);
                this.JSXREGEXP.lastIndex = 0;
                continue;
              }
              isFirstTagOfBlock = false;
              isFirstTokenOfLine = false;
              parentTokenIdx = stackOfTokensStillOpen.pop();
              tokenStack.push({
                type: JSXBRACE_CLOSE,
                name: '',
                row: row,
                parentTokenIdx: parentTokenIdx
              });
              if (parentTokenIdx >= 0) {
                tokenStack[parentTokenIdx].termsThisTagIdx = idxOfToken;
              }
              idxOfToken++;
              break;
            case BRACE_OPEN:
            case SWITCH_BRACE_OPEN:
            case PAREN_OPEN:
              tokenOnThisLine = true;
              if (isFirstTokenOfLine) {
                stackOfTokensStillOpen.push(parentTokenIdx = stackOfTokensStillOpen.pop());
                if (isFirstTagOfBlock && (parentTokenIdx != null) && tokenStack[parentTokenIdx].type === token && tokenStack[parentTokenIdx].row === (row - 1)) {
                  tokenIndentation = firstCharIndentation = this.eslintIndentOptions.jsxIndent[1] + this.getIndentOfPreviousRow(row);
                  indentRecalc = this.indentRow({
                    row: row,
                    blockIndent: firstCharIndentation
                  });
                } else if (parentTokenIdx != null) {
                  indentRecalc = this.indentRow({
                    row: row,
                    blockIndent: tokenStack[parentTokenIdx].firstCharIndentation,
                    jsxIndent: 1
                  });
                }
              }
              if (indentRecalc) {
                line = this.editor.lineTextForBufferRow(row);
                this.JSXREGEXP.lastIndex = 0;
                continue;
              }
              isFirstTokenOfLine = false;
              stackOfTokensStillOpen.push(parentTokenIdx = stackOfTokensStillOpen.pop());
              tokenStack.push({
                type: token,
                name: '',
                row: row,
                firstTagInLineIndentation: firstTagInLineIndentation,
                tokenIndentation: tokenIndentation,
                firstCharIndentation: firstCharIndentation,
                parentTokenIdx: parentTokenIdx,
                termsThisTagsAttributesIdx: null,
                termsThisTagIdx: null
              });
              stackOfTokensStillOpen.push(idxOfToken);
              idxOfToken++;
              break;
            case BRACE_CLOSE:
            case SWITCH_BRACE_CLOSE:
            case PAREN_CLOSE:
              if (token === SWITCH_BRACE_CLOSE) {
                stackOfTokensStillOpen.push(parentTokenIdx = stackOfTokensStillOpen.pop());
                if (tokenStack[parentTokenIdx].type === SWITCH_CASE || tokenStack[parentTokenIdx].type === SWITCH_DEFAULT) {
                  stackOfTokensStillOpen.pop();
                }
              }
              tokenOnThisLine = true;
              if (isFirstTokenOfLine) {
                stackOfTokensStillOpen.push(parentTokenIdx = stackOfTokensStillOpen.pop());
                if (parentTokenIdx != null) {
                  indentRecalc = this.indentRow({
                    row: row,
                    blockIndent: tokenStack[parentTokenIdx].firstCharIndentation
                  });
                }
              }
              if (indentRecalc) {
                line = this.editor.lineTextForBufferRow(row);
                this.JSXREGEXP.lastIndex = 0;
                continue;
              }
              isFirstTokenOfLine = false;
              parentTokenIdx = stackOfTokensStillOpen.pop();
              if (parentTokenIdx != null) {
                tokenStack.push({
                  type: token,
                  name: '',
                  row: row,
                  parentTokenIdx: parentTokenIdx
                });
                if (parentTokenIdx >= 0) {
                  tokenStack[parentTokenIdx].termsThisTagIdx = idxOfToken;
                }
                idxOfToken++;
              }
              break;
            case SWITCH_CASE:
            case SWITCH_DEFAULT:
              tokenOnThisLine = true;
              isFirstTagOfBlock = true;
              if (isFirstTokenOfLine) {
                stackOfTokensStillOpen.push(parentTokenIdx = stackOfTokensStillOpen.pop());
                if (parentTokenIdx != null) {
                  if (tokenStack[parentTokenIdx].type === SWITCH_CASE || tokenStack[parentTokenIdx].type === SWITCH_DEFAULT) {
                    indentRecalc = this.indentRow({
                      row: row,
                      blockIndent: tokenStack[parentTokenIdx].firstCharIndentation
                    });
                    stackOfTokensStillOpen.pop();
                  } else if (tokenStack[parentTokenIdx].type === SWITCH_BRACE_OPEN) {
                    indentRecalc = this.indentRow({
                      row: row,
                      blockIndent: tokenStack[parentTokenIdx].firstCharIndentation,
                      jsxIndent: 1
                    });
                  }
                }
              }
              if (indentRecalc) {
                line = this.editor.lineTextForBufferRow(row);
                this.JSXREGEXP.lastIndex = 0;
                continue;
              }
              isFirstTokenOfLine = false;
              stackOfTokensStillOpen.push(parentTokenIdx = stackOfTokensStillOpen.pop());
              tokenStack.push({
                type: token,
                name: '',
                row: row,
                firstTagInLineIndentation: firstTagInLineIndentation,
                tokenIndentation: tokenIndentation,
                firstCharIndentation: firstCharIndentation,
                parentTokenIdx: parentTokenIdx,
                termsThisTagsAttributesIdx: null,
                termsThisTagIdx: null
              });
              stackOfTokensStillOpen.push(idxOfToken);
              idxOfToken++;
              break;
            case TERNARY_IF:
            case JS_IF:
            case JS_ELSE:
            case JS_RETURN:
              isFirstTagOfBlock = true;
          }
        }
        if (idxOfToken && !tokenOnThisLine) {
          if (row !== range.end.row) {
            blankLineEndPos = (ref3 = /^\s*$/.exec(this.editor.lineTextForBufferRow(row))) != null ? ref3[0].length : void 0;
            if (blankLineEndPos != null) {
              results.push(this.indentRow({
                row: row,
                blockIndent: 0
              }));
            } else {
              results.push(this.indentUntokenisedLine(row, tokenStack, stackOfTokensStillOpen));
            }
          } else {
            results.push(this.indentUntokenisedLine(row, tokenStack, stackOfTokensStillOpen));
          }
        } else {
          results.push(void 0);
        }
      }
      return results;
    };

    AutoIndent.prototype.indentUntokenisedLine = function(row, tokenStack, stackOfTokensStillOpen) {
      var parentTokenIdx, token;
      stackOfTokensStillOpen.push(parentTokenIdx = stackOfTokensStillOpen.pop());
      token = tokenStack[parentTokenIdx];
      switch (token.type) {
        case JSXTAG_OPEN:
        case JSXTAG_SELFCLOSE_START:
          if (token.termsThisTagsAttributesIdx === null) {
            return this.indentRow({
              row: row,
              blockIndent: token.firstCharIndentation,
              jsxIndentProps: 1
            });
          } else {
            return this.indentRow({
              row: row,
              blockIndent: token.firstCharIndentation,
              jsxIndent: 1
            });
          }
          break;
        case JSXBRACE_OPEN:
          return this.indentRow({
            row: row,
            blockIndent: token.firstCharIndentation,
            jsxIndent: 1
          });
        case BRACE_OPEN:
        case SWITCH_BRACE_OPEN:
        case PAREN_OPEN:
          return this.indentRow({
            row: row,
            blockIndent: token.firstCharIndentation,
            jsxIndent: 1,
            allowAdditionalIndents: true
          });
        case JSXTAG_SELFCLOSE_END:
        case JSXBRACE_CLOSE:
        case JSXTAG_CLOSE_ATTRS:
          return this.indentRow({
            row: row,
            blockIndent: tokenStack[token.parentTokenIdx].firstCharIndentation,
            jsxIndentProps: 1
          });
        case BRACE_CLOSE:
        case SWITCH_BRACE_CLOSE:
        case PAREN_CLOSE:
          return this.indentRow({
            row: row,
            blockIndent: tokenStack[token.parentTokenIdx].firstCharIndentation,
            jsxIndent: 1,
            allowAdditionalIndents: true
          });
        case SWITCH_CASE:
        case SWITCH_DEFAULT:
          return this.indentRow({
            row: row,
            blockIndent: token.firstCharIndentation,
            jsxIndent: 1
          });
      }
    };

    AutoIndent.prototype.getToken = function(bufferRow, match) {
      var scope;
      scope = this.editor.scopeDescriptorForBufferPosition([bufferRow, match.index]).getScopesArray().pop();
      if ('punctuation.definition.tag.jsx' === scope) {
        if (match[1] != null) {
          return JSXTAG_OPEN;
        } else if (match[3] != null) {
          return JSXTAG_SELFCLOSE_END;
        }
      } else if ('JSXEndTagStart' === scope) {
        if (match[4] != null) {
          return JSXTAG_CLOSE;
        }
      } else if ('JSXStartTagEnd' === scope) {
        if (match[7] != null) {
          return JSXTAG_CLOSE_ATTRS;
        }
      } else if (match[8] != null) {
        if ('punctuation.section.embedded.begin.jsx' === scope) {
          return JSXBRACE_OPEN;
        } else if ('meta.brace.curly.switchStart.js' === scope) {
          return SWITCH_BRACE_OPEN;
        } else if ('meta.brace.curly.js' === scope) {
          return BRACE_OPEN;
        }
      } else if (match[9] != null) {
        if ('punctuation.section.embedded.end.jsx' === scope) {
          return JSXBRACE_CLOSE;
        } else if ('meta.brace.curly.switchEnd.js' === scope) {
          return SWITCH_BRACE_CLOSE;
        } else if ('meta.brace.curly.js' === scope) {
          return BRACE_CLOSE;
        }
      } else if (match[10] != null) {
        if ('keyword.operator.ternary.js' === scope) {
          return TERNARY_IF;
        }
      } else if (match[11] != null) {
        if ('keyword.operator.ternary.js' === scope) {
          return TERNARY_ELSE;
        }
      } else if (match[12] != null) {
        if ('keyword.control.conditional.js' === scope) {
          return JS_IF;
        }
      } else if (match[13] != null) {
        if ('keyword.control.conditional.js' === scope) {
          return JS_ELSE;
        }
      } else if (match[14] != null) {
        if ('keyword.control.switch.js' === scope) {
          return SWITCH_CASE;
        }
      } else if (match[15] != null) {
        if ('keyword.control.switch.js' === scope) {
          return SWITCH_DEFAULT;
        }
      } else if (match[16] != null) {
        if ('keyword.control.flow.js' === scope) {
          return JS_RETURN;
        }
      } else if (match[17] != null) {
        if ('meta.brace.round.js' === scope || 'meta.brace.round.graphql' === scope || 'meta.brace.round.directive.graphql' === scope) {
          return PAREN_OPEN;
        }
      } else if (match[18] != null) {
        if ('meta.brace.round.js' === scope || 'meta.brace.round.graphql' === scope || 'meta.brace.round.directive.graphql' === scope) {
          return PAREN_CLOSE;
        }
      }
      return NO_TOKEN;
    };

    AutoIndent.prototype.getIndentOfPreviousRow = function(row) {
      var j, line, ref1;
      if (!row) {
        return 0;
      }
      for (row = j = ref1 = row - 1; ref1 <= 0 ? j < 0 : j > 0; row = ref1 <= 0 ? ++j : --j) {
        line = this.editor.lineTextForBufferRow(row);
        if (/.*\S/.test(line)) {
          return this.editor.indentationForBufferRow(row);
        }
      }
      return 0;
    };

    AutoIndent.prototype.getIndentOptions = function() {
      var eslintrcFilename;
      if (!this.autoJsx) {
        return this.translateIndentOptions();
      }
      if (eslintrcFilename = this.getEslintrcFilename()) {
        eslintrcFilename = new File(eslintrcFilename);
        return this.translateIndentOptions(this.readEslintrcOptions(eslintrcFilename.getPath()));
      } else {
        return this.translateIndentOptions({});
      }
    };

    AutoIndent.prototype.getEslintrcFilename = function() {
      var projectContainingSource;
      projectContainingSource = atom.project.relativizePath(this.editor.getPath());
      if (projectContainingSource[0] != null) {
        return path.join(projectContainingSource[0], '.eslintrc');
      }
    };

    AutoIndent.prototype.onMouseDown = function() {
      return this.mouseUp = false;
    };

    AutoIndent.prototype.onMouseUp = function() {
      return this.mouseUp = true;
    };

    AutoIndent.prototype.readEslintrcOptions = function(eslintrcFile) {
      var err, eslintRules, fileContent;
      if (fs.existsSync(eslintrcFile)) {
        fileContent = stripJsonComments(fs.readFileSync(eslintrcFile, 'utf8'));
        try {
          eslintRules = (YAML.safeLoad(fileContent)).rules;
          if (eslintRules) {
            return eslintRules;
          }
        } catch (error) {
          err = error;
          atom.notifications.addError("LB: Error reading .eslintrc at " + eslintrcFile, {
            dismissable: true,
            detail: "" + err.message
          });
        }
      }
      return {};
    };

    AutoIndent.prototype.translateIndentOptions = function(eslintRules) {
      var ES_DEFAULT_INDENT, defaultIndent, eslintIndentOptions, rule;
      eslintIndentOptions = {
        jsxIndent: [1, 1],
        jsxIndentProps: [1, 1],
        jsxClosingBracketLocation: [
          1, {
            selfClosing: TAGALIGNED,
            nonEmpty: TAGALIGNED
          }
        ]
      };
      if (typeof eslintRules !== "object") {
        return eslintIndentOptions;
      }
      ES_DEFAULT_INDENT = 4;
      rule = eslintRules['indent'];
      if (typeof rule === 'number' || typeof rule === 'string') {
        defaultIndent = ES_DEFAULT_INDENT / this.editor.getTabLength();
      } else if (typeof rule === 'object') {
        if (typeof rule[1] === 'number') {
          defaultIndent = rule[1] / this.editor.getTabLength();
        } else {
          defaultIndent = 1;
        }
      } else {
        defaultIndent = 1;
      }
      rule = eslintRules['react/jsx-indent'];
      if (typeof rule === 'number' || typeof rule === 'string') {
        eslintIndentOptions.jsxIndent[0] = rule;
        eslintIndentOptions.jsxIndent[1] = ES_DEFAULT_INDENT / this.editor.getTabLength();
      } else if (typeof rule === 'object') {
        eslintIndentOptions.jsxIndent[0] = rule[0];
        if (typeof rule[1] === 'number') {
          eslintIndentOptions.jsxIndent[1] = rule[1] / this.editor.getTabLength();
        } else {
          eslintIndentOptions.jsxIndent[1] = 1;
        }
      } else {
        eslintIndentOptions.jsxIndent[1] = defaultIndent;
      }
      rule = eslintRules['react/jsx-indent-props'];
      if (typeof rule === 'number' || typeof rule === 'string') {
        eslintIndentOptions.jsxIndentProps[0] = rule;
        eslintIndentOptions.jsxIndentProps[1] = ES_DEFAULT_INDENT / this.editor.getTabLength();
      } else if (typeof rule === 'object') {
        eslintIndentOptions.jsxIndentProps[0] = rule[0];
        if (typeof rule[1] === 'number') {
          eslintIndentOptions.jsxIndentProps[1] = rule[1] / this.editor.getTabLength();
        } else {
          eslintIndentOptions.jsxIndentProps[1] = 1;
        }
      } else {
        eslintIndentOptions.jsxIndentProps[1] = defaultIndent;
      }
      rule = eslintRules['react/jsx-closing-bracket-location'];
      eslintIndentOptions.jsxClosingBracketLocation[1].selfClosing = TAGALIGNED;
      eslintIndentOptions.jsxClosingBracketLocation[1].nonEmpty = TAGALIGNED;
      if (typeof rule === 'number' || typeof rule === 'string') {
        eslintIndentOptions.jsxClosingBracketLocation[0] = rule;
      } else if (typeof rule === 'object') {
        eslintIndentOptions.jsxClosingBracketLocation[0] = rule[0];
        if (typeof rule[1] === 'string') {
          eslintIndentOptions.jsxClosingBracketLocation[1].selfClosing = eslintIndentOptions.jsxClosingBracketLocation[1].nonEmpty = rule[1];
        } else {
          if (rule[1].selfClosing != null) {
            eslintIndentOptions.jsxClosingBracketLocation[1].selfClosing = rule[1].selfClosing;
          }
          if (rule[1].nonEmpty != null) {
            eslintIndentOptions.jsxClosingBracketLocation[1].nonEmpty = rule[1].nonEmpty;
          }
        }
      }
      return eslintIndentOptions;
    };

    AutoIndent.prototype.indentForClosingBracket = function(row, parentTag, closingBracketRule) {
      if (this.eslintIndentOptions.jsxClosingBracketLocation[0]) {
        if (closingBracketRule === TAGALIGNED) {
          return this.indentRow({
            row: row,
            blockIndent: parentTag.tokenIndentation
          });
        } else if (closingBracketRule === LINEALIGNED) {
          return this.indentRow({
            row: row,
            blockIndent: parentTag.firstCharIndentation
          });
        } else if (closingBracketRule === AFTERPROPS) {
          if (this.eslintIndentOptions.jsxIndentProps[0]) {
            return this.indentRow({
              row: row,
              blockIndent: parentTag.firstCharIndentation,
              jsxIndentProps: 1
            });
          } else {
            return this.indentRow({
              row: row,
              blockIndent: parentTag.firstCharIndentation
            });
          }
        } else if (closingBracketRule === PROPSALIGNED) {
          if (this.eslintIndentOptions.jsxIndentProps[0]) {
            return this.indentRow({
              row: row,
              blockIndent: parentTag.firstCharIndentation,
              jsxIndentProps: 1
            });
          } else {
            return this.indentRow({
              row: row,
              blockIndent: parentTag.firstCharIndentation
            });
          }
        }
      }
    };

    AutoIndent.prototype.indentRow = function(options) {
      var allowAdditionalIndents, blockIndent, jsxIndent, jsxIndentProps, row;
      row = options.row, allowAdditionalIndents = options.allowAdditionalIndents, blockIndent = options.blockIndent, jsxIndent = options.jsxIndent, jsxIndentProps = options.jsxIndentProps;
      if (jsxIndent) {
        if (this.eslintIndentOptions.jsxIndent[0]) {
          if (this.eslintIndentOptions.jsxIndent[1]) {
            blockIndent += jsxIndent * this.eslintIndentOptions.jsxIndent[1];
          }
        }
      }
      if (jsxIndentProps) {
        if (this.eslintIndentOptions.jsxIndentProps[0]) {
          if (this.eslintIndentOptions.jsxIndentProps[1]) {
            blockIndent += jsxIndentProps * this.eslintIndentOptions.jsxIndentProps[1];
          }
        }
      }
      if (allowAdditionalIndents) {
        if (this.editor.indentationForBufferRow(row) < blockIndent) {
          this.editor.setIndentationForBufferRow(row, blockIndent, {
            preserveLeadingWhitespace: false
          });
          return true;
        }
      } else {
        if (this.editor.indentationForBufferRow(row) !== blockIndent) {
          this.editor.setIndentationForBufferRow(row, blockIndent, {
            preserveLeadingWhitespace: false
          });
          return true;
        }
      }
      return false;
    };

    return AutoIndent;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvc2VwaXJvcGh0Ly5hdG9tL3BhY2thZ2VzL2xhbmd1YWdlLWJhYmVsL2xpYi9hdXRvLWluZGVudC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLDBkQUFBO0lBQUE7OztFQUFBLE1BQTRDLE9BQUEsQ0FBUSxNQUFSLENBQTVDLEVBQUMsNkNBQUQsRUFBc0IsZUFBdEIsRUFBNEIsaUJBQTVCLEVBQW1DOztFQUNuQyxFQUFBLEdBQUssT0FBQSxDQUFRLFNBQVI7O0VBQ0wsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUNQLGVBQUEsR0FBa0IsT0FBQSxDQUFRLHFCQUFSOztFQUNsQixRQUFBLEdBQVcsT0FBQSxDQUFRLGFBQVI7O0VBQ1gsaUJBQUEsR0FBb0IsT0FBQSxDQUFRLHFCQUFSOztFQUNwQixJQUFBLEdBQU8sT0FBQSxDQUFRLFNBQVI7O0VBR1AsUUFBQSxHQUEwQjs7RUFDMUIsc0JBQUEsR0FBMEI7O0VBQzFCLG9CQUFBLEdBQTBCOztFQUMxQixXQUFBLEdBQTBCOztFQUMxQixrQkFBQSxHQUEwQjs7RUFDMUIsWUFBQSxHQUEwQjs7RUFDMUIsYUFBQSxHQUEwQjs7RUFDMUIsY0FBQSxHQUEwQjs7RUFDMUIsVUFBQSxHQUEwQjs7RUFDMUIsV0FBQSxHQUEwQjs7RUFDMUIsVUFBQSxHQUEwQjs7RUFDMUIsWUFBQSxHQUEwQjs7RUFDMUIsS0FBQSxHQUEwQjs7RUFDMUIsT0FBQSxHQUEwQjs7RUFDMUIsaUJBQUEsR0FBMEI7O0VBQzFCLGtCQUFBLEdBQTBCOztFQUMxQixXQUFBLEdBQTBCOztFQUMxQixjQUFBLEdBQTBCOztFQUMxQixTQUFBLEdBQTBCOztFQUMxQixVQUFBLEdBQTBCOztFQUMxQixXQUFBLEdBQTBCOztFQUcxQixVQUFBLEdBQWdCOztFQUNoQixXQUFBLEdBQWdCOztFQUNoQixVQUFBLEdBQWdCOztFQUNoQixZQUFBLEdBQWdCOztFQUVo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S0FBMEMsV0FBN0M7VUFDRSxJQUFDLENBQUEsTUFBTSxDQUFDLDBCQUFSLENBQW1DLEdBQW5DLEVBQXdDLFdBQXhDLEVBQXFEO1lBQUUseUJBQUEsRUFBMkIsS0FBN0I7V0FBckQ7QUFDQSxpQkFBTyxLQUZUO1NBTEY7O0FBUUEsYUFBTztJQXRCRTs7Ozs7QUF4dkJiIiwic291cmNlc0NvbnRlbnQiOlsie0NvbXBvc2l0ZURpc3Bvc2FibGUsIEZpbGUsIFJhbmdlLCBQb2ludH0gPSByZXF1aXJlICdhdG9tJ1xuZnMgPSByZXF1aXJlICdmcy1wbHVzJ1xucGF0aCA9IHJlcXVpcmUgJ3BhdGgnXG5hdXRvQ29tcGxldGVKU1ggPSByZXF1aXJlICcuL2F1dG8tY29tcGxldGUtanN4J1xuSW5zZXJ0TmwgPSByZXF1aXJlICcuL2luc2VydC1ubCdcbnN0cmlwSnNvbkNvbW1lbnRzID0gcmVxdWlyZSAnc3RyaXAtanNvbi1jb21tZW50cydcbllBTUwgPSByZXF1aXJlICdqcy15YW1sJ1xuXG5cbk5PX1RPS0VOICAgICAgICAgICAgICAgID0gMFxuSlNYVEFHX1NFTEZDTE9TRV9TVEFSVCAgPSAxICAgICAgICMgdGhlIDx0YWcgaW4gPHRhZyAvPlxuSlNYVEFHX1NFTEZDTE9TRV9FTkQgICAgPSAyICAgICAgICMgdGhlIC8+IGluIDx0YWcgLz5cbkpTWFRBR19PUEVOICAgICAgICAgICAgID0gMyAgICAgICAjIHRoZSA8dGFnIGluIDx0YWc+PC90YWc+XG5KU1hUQUdfQ0xPU0VfQVRUUlMgICAgICA9IDQgICAgICAgIyB0aGUgMXN0ID4gaW4gPHRhZz48L3RhZz5cbkpTWFRBR19DTE9TRSAgICAgICAgICAgID0gNSAgICAgICAjIGEgPC90YWc+XG5KU1hCUkFDRV9PUEVOICAgICAgICAgICA9IDYgICAgICAgIyBlbWJlZGRlZCBleHByZXNzaW9uIGJyYWNlIHN0YXJ0IHtcbkpTWEJSQUNFX0NMT1NFICAgICAgICAgID0gNyAgICAgICAjIGVtYmVkZGVkIGV4cHJlc3Npb24gYnJhY2UgZW5kIH1cbkJSQUNFX09QRU4gICAgICAgICAgICAgID0gOCAgICAgICAjIEphdmFzY3JpcHQgYnJhY2VcbkJSQUNFX0NMT1NFICAgICAgICAgICAgID0gOSAgICAgICAjIEphdmFzY3JpcHQgYnJhY2VcblRFUk5BUllfSUYgICAgICAgICAgICAgID0gMTAgICAgICAjIFRlcm5hcnkgP1xuVEVSTkFSWV9FTFNFICAgICAgICAgICAgPSAxMSAgICAgICMgVGVybmFyeSA6XG5KU19JRiAgICAgICAgICAgICAgICAgICA9IDEyICAgICAgIyBKUyBJRlxuSlNfRUxTRSAgICAgICAgICAgICAgICAgPSAxMyAgICAgICMgSlMgRUxTRVxuU1dJVENIX0JSQUNFX09QRU4gICAgICAgPSAxNCAgICAgICMgb3BlbmluZyBicmFjZSBpbiBzd2l0Y2ggeyB9XG5TV0lUQ0hfQlJBQ0VfQ0xPU0UgICAgICA9IDE1ICAgICAgIyBjbG9zaW5nIGJyYWNlIGluIHN3aXRjaCB7IH1cblNXSVRDSF9DQVNFICAgICAgICAgICAgID0gMTYgICAgICAjIHN3aXRjaCBjYXNlIHN0YXRlbWVudFxuU1dJVENIX0RFRkFVTFQgICAgICAgICAgPSAxNyAgICAgICMgc3dpdGNoIGRlZmF1bHQgc3RhdGVtZW50XG5KU19SRVRVUk4gICAgICAgICAgICAgICA9IDE4ICAgICAgIyBKUyByZXR1cm5cblBBUkVOX09QRU4gICAgICAgICAgICAgID0gMTkgICAgICAjIHBhcmVuIG9wZW4gKFxuUEFSRU5fQ0xPU0UgICAgICAgICAgICAgPSAyMCAgICAgICMgcGFyZW4gY2xvc2UgKVxuXG4jIGVzbGludCBwcm9wZXJ0eSB2YWx1ZXNcblRBR0FMSUdORUQgICAgPSAndGFnLWFsaWduZWQnXG5MSU5FQUxJR05FRCAgID0gJ2xpbmUtYWxpZ25lZCdcbkFGVEVSUFJPUFMgICAgPSAnYWZ0ZXItcHJvcHMnXG5QUk9QU0FMSUdORUQgID0gJ3Byb3BzLWFsaWduZWQnXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIEF1dG9JbmRlbnRcbiAgY29uc3RydWN0b3I6IChAZWRpdG9yKSAtPlxuICAgIEBJbnNlcnRObCA9IG5ldyBJbnNlcnRObChAZWRpdG9yKVxuICAgIEBhdXRvSnN4ID0gYXRvbS5jb25maWcuZ2V0KCdsYW5ndWFnZS1iYWJlbCcpLmF1dG9JbmRlbnRKU1hcbiAgICAjIHJlZ2V4IHRvIHNlYXJjaCBmb3IgdGFnIG9wZW4vY2xvc2UgdGFnIGFuZCBjbG9zZSB0YWdcbiAgICBASlNYUkVHRVhQID0gLyg8KShbJF9BLVphLXpdKD86WyRfLjpcXC1BLVphLXowLTldKSopfChcXC8+KXwoPFxcLykoWyRfQS1aYS16XSg/OlskLl86XFwtQS1aYS16MC05XSkqKSg+KXwoPil8KHspfCh9KXwoXFw/KXwoOil8KGlmKXwoZWxzZSl8KGNhc2UpfChkZWZhdWx0KXwocmV0dXJuKXwoXFwoKXwoXFwpKS9nXG4gICAgQG1vdXNlVXAgPSB0cnVlXG4gICAgQG11bHRpcGxlQ3Vyc29yVHJpZ2dlciA9IDFcbiAgICBAZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG4gICAgQGVzbGludEluZGVudE9wdGlvbnMgPSBAZ2V0SW5kZW50T3B0aW9ucygpXG5cbiAgICBAZGlzcG9zYWJsZXMuYWRkIGF0b20uY29tbWFuZHMuYWRkICdhdG9tLXRleHQtZWRpdG9yJyxcbiAgICAgICdsYW5ndWFnZS1iYWJlbDphdXRvLWluZGVudC1qc3gtb24nOiAoZXZlbnQpID0+XG4gICAgICAgIEBhdXRvSnN4ID0gdHJ1ZVxuICAgICAgICBAZXNsaW50SW5kZW50T3B0aW9ucyA9IEBnZXRJbmRlbnRPcHRpb25zKClcblxuICAgIEBkaXNwb3NhYmxlcy5hZGQgYXRvbS5jb21tYW5kcy5hZGQgJ2F0b20tdGV4dC1lZGl0b3InLFxuICAgICAgJ2xhbmd1YWdlLWJhYmVsOmF1dG8taW5kZW50LWpzeC1vZmYnOiAoZXZlbnQpID0+ICBAYXV0b0pzeCA9IGZhbHNlXG5cbiAgICBAZGlzcG9zYWJsZXMuYWRkIGF0b20uY29tbWFuZHMuYWRkICdhdG9tLXRleHQtZWRpdG9yJyxcbiAgICAgICdsYW5ndWFnZS1iYWJlbDp0b2dnbGUtYXV0by1pbmRlbnQtanN4JzogKGV2ZW50KSA9PlxuICAgICAgICBAYXV0b0pzeCA9IG5vdCBAYXV0b0pzeFxuICAgICAgICBpZiBAYXV0b0pzeCB0aGVuIEBlc2xpbnRJbmRlbnRPcHRpb25zID0gQGdldEluZGVudE9wdGlvbnMoKVxuXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciAnbW91c2Vkb3duJywgQG9uTW91c2VEb3duXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciAnbW91c2V1cCcsIEBvbk1vdXNlVXBcblxuICAgIEBkaXNwb3NhYmxlcy5hZGQgQGVkaXRvci5vbkRpZENoYW5nZUN1cnNvclBvc2l0aW9uIChldmVudCkgPT4gQGNoYW5nZWRDdXJzb3JQb3NpdGlvbihldmVudClcbiAgICBAaGFuZGxlT25EaWRTdG9wQ2hhbmdpbmcoKVxuXG4gIGRlc3Ryb3k6ICgpIC0+XG4gICAgQGRpc3Bvc2FibGVzLmRpc3Bvc2UoKVxuICAgIEBvbkRpZFN0b3BDaGFuZ2luZ0hhbmRsZXIuZGlzcG9zZSgpXG4gICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lciAnbW91c2Vkb3duJywgQG9uTW91c2VEb3duXG4gICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lciAnbW91c2V1cCcsIEBvbk1vdXNlVXBcblxuICAjIGNoYW5nZWQgY3Vyc29yIHBvc2l0aW9uXG4gIGNoYW5nZWRDdXJzb3JQb3NpdGlvbjogKGV2ZW50KSA9PlxuICAgIHJldHVybiB1bmxlc3MgQGF1dG9Kc3hcbiAgICByZXR1cm4gdW5sZXNzIEBtb3VzZVVwXG4gICAgcmV0dXJuIHVubGVzcyBldmVudC5vbGRCdWZmZXJQb3NpdGlvbi5yb3cgaXNudCBldmVudC5uZXdCdWZmZXJQb3NpdGlvbi5yb3dcbiAgICBidWZmZXJSb3cgPSBldmVudC5uZXdCdWZmZXJQb3NpdGlvbi5yb3dcbiAgICAjIGhhbmRsZSBtdWx0aXBsZSBjdXJzb3JzLiBvbmx5IHRyaWdnZXIgaW5kZW50IG9uIG9uZSBjaGFuZ2UgZXZlbnRcbiAgICAjIGFuZCB0aGVuIG9ubHkgYXQgdGhlIGhpZ2hlc3Qgcm93XG4gICAgaWYgQGVkaXRvci5oYXNNdWx0aXBsZUN1cnNvcnMoKVxuICAgICAgY3Vyc29yUG9zaXRpb25zID0gQGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbnMoKVxuICAgICAgaWYgY3Vyc29yUG9zaXRpb25zLmxlbmd0aCBpcyBAbXVsdGlwbGVDdXJzb3JUcmlnZ2VyXG4gICAgICAgIEBtdWx0aXBsZUN1cnNvclRyaWdnZXIgPSAxXG4gICAgICAgIGJ1ZmZlclJvdyA9IDBcbiAgICAgICAgZm9yIGN1cnNvclBvc2l0aW9uIGluIGN1cnNvclBvc2l0aW9uc1xuICAgICAgICAgIGlmIGN1cnNvclBvc2l0aW9uLnJvdyA+IGJ1ZmZlclJvdyB0aGVuIGJ1ZmZlclJvdyA9IGN1cnNvclBvc2l0aW9uLnJvd1xuICAgICAgZWxzZVxuICAgICAgICBAbXVsdGlwbGVDdXJzb3JUcmlnZ2VyKytcbiAgICAgICAgcmV0dXJuXG4gICAgZWxzZSBjdXJzb3JQb3NpdGlvbiA9IGV2ZW50Lm5ld0J1ZmZlclBvc2l0aW9uXG5cbiAgICAjIHJlbW92ZSBhbnkgYmxhbmsgbGluZXMgZnJvbSB3aGVyZSBjdXJzb3Igd2FzIHByZXZpb3VzbHlcbiAgICBwcmV2aW91c1JvdyA9IGV2ZW50Lm9sZEJ1ZmZlclBvc2l0aW9uLnJvd1xuICAgIGlmIEBqc3hJblNjb3BlKHByZXZpb3VzUm93KVxuICAgICAgYmxhbmtMaW5lRW5kUG9zID0gL15cXHMqJC8uZXhlYyhAZWRpdG9yLmxpbmVUZXh0Rm9yQnVmZmVyUm93KHByZXZpb3VzUm93KSk/WzBdLmxlbmd0aFxuICAgICAgaWYgYmxhbmtMaW5lRW5kUG9zP1xuICAgICAgICBAaW5kZW50Um93KHtyb3c6IHByZXZpb3VzUm93ICwgYmxvY2tJbmRlbnQ6IDAgfSlcblxuICAgIHJldHVybiBpZiBub3QgQGpzeEluU2NvcGUgYnVmZmVyUm93XG5cbiAgICBlbmRQb2ludE9mSnN4ID0gbmV3IFBvaW50IGJ1ZmZlclJvdywwICMgbmV4dCByb3cgc3RhcnRcbiAgICBzdGFydFBvaW50T2ZKc3ggPSAgYXV0b0NvbXBsZXRlSlNYLmdldFN0YXJ0T2ZKU1ggQGVkaXRvciwgY3Vyc29yUG9zaXRpb25cbiAgICBAaW5kZW50SlNYIG5ldyBSYW5nZShzdGFydFBvaW50T2ZKc3gsIGVuZFBvaW50T2ZKc3gpXG4gICAgY29sdW1uVG9Nb3ZlVG8gPSAvXlxccyokLy5leGVjKEBlZGl0b3IubGluZVRleHRGb3JCdWZmZXJSb3coYnVmZmVyUm93KSk/WzBdLmxlbmd0aFxuICAgIGlmIGNvbHVtblRvTW92ZVRvPyB0aGVuIEBlZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24gW2J1ZmZlclJvdywgY29sdW1uVG9Nb3ZlVG9dXG5cblxuICAjIEJ1ZmZlciBoYXMgc3RvcHBlZCBjaGFuZ2luZy4gSW5kZW50IGFzIHJlcXVpcmVkXG4gIGRpZFN0b3BDaGFuZ2luZzogKCkgLT5cbiAgICByZXR1cm4gdW5sZXNzIEBhdXRvSnN4XG4gICAgcmV0dXJuIHVubGVzcyBAbW91c2VVcFxuICAgIHNlbGVjdGVkUmFuZ2UgPSBAZWRpdG9yLmdldFNlbGVjdGVkQnVmZmVyUmFuZ2UoKVxuICAgICMgaWYgdGhpcyBpcyBhIHRhZyBzdGFydCdzIGVuZCA+IHRoZW4gZG9uJ3QgYXV0byBpbmRlbnRcbiAgICAjIHRoaXMgaWEgZml4IHRvIGFsbG93IGZvciB0aGUgYXV0byBjb21wbGV0ZSB0YWcgdGltZSB0byBwb3AgdXBcbiAgICBpZiBzZWxlY3RlZFJhbmdlLnN0YXJ0LnJvdyBpcyBzZWxlY3RlZFJhbmdlLmVuZC5yb3cgYW5kXG4gICAgICBzZWxlY3RlZFJhbmdlLnN0YXJ0LmNvbHVtbiBpcyAgc2VsZWN0ZWRSYW5nZS5lbmQuY29sdW1uIGFuZFxuICAgICAgJ0pTWFN0YXJ0VGFnRW5kJyBpbiBAZWRpdG9yLnNjb3BlRGVzY3JpcHRvckZvckJ1ZmZlclBvc2l0aW9uKFtzZWxlY3RlZFJhbmdlLnN0YXJ0LnJvdywgc2VsZWN0ZWRSYW5nZS5zdGFydC5jb2x1bW5dKS5nZXRTY29wZXNBcnJheSgpXG4gICAgICAgIHJldHVyblxuXG4gICAgaGlnaGVzdFJvdyA9IE1hdGgubWF4IHNlbGVjdGVkUmFuZ2Uuc3RhcnQucm93LCBzZWxlY3RlZFJhbmdlLmVuZC5yb3dcbiAgICBsb3dlc3RSb3cgPSBNYXRoLm1pbiBzZWxlY3RlZFJhbmdlLnN0YXJ0LnJvdywgc2VsZWN0ZWRSYW5nZS5lbmQucm93XG5cbiAgICAjIHJlbW92ZSB0aGUgaGFuZGxlciBmb3IgZGlkU3RvcENoYW5naW5nIHRvIGF2b2lkIHRoaXMgY2hhbmdlIGNhdXNpbmcgYSBuZXcgZXZlbnRcbiAgICBAb25EaWRTdG9wQ2hhbmdpbmdIYW5kbGVyLmRpc3Bvc2UoKVxuXG4gICAgIyB3b3JrIGJhY2t3YXJkcyB0aHJvdWdoIGJ1ZmZlciByb3dzIGluZGVudGluZyBKU1ggYXMgbmVlZGVkXG4gICAgd2hpbGUgKCBoaWdoZXN0Um93ID49IGxvd2VzdFJvdyApXG4gICAgICBpZiBAanN4SW5TY29wZShoaWdoZXN0Um93KVxuICAgICAgICBlbmRQb2ludE9mSnN4ID0gbmV3IFBvaW50IGhpZ2hlc3RSb3csMFxuICAgICAgICBzdGFydFBvaW50T2ZKc3ggPSAgYXV0b0NvbXBsZXRlSlNYLmdldFN0YXJ0T2ZKU1ggQGVkaXRvciwgZW5kUG9pbnRPZkpzeFxuICAgICAgICBAaW5kZW50SlNYIG5ldyBSYW5nZShzdGFydFBvaW50T2ZKc3gsIGVuZFBvaW50T2ZKc3gpXG4gICAgICAgIGhpZ2hlc3RSb3cgPSBzdGFydFBvaW50T2ZKc3gucm93IC0gMVxuICAgICAgZWxzZSBoaWdoZXN0Um93ID0gaGlnaGVzdFJvdyAtIDFcblxuICAgICMgcmVuYWJsZSB0aGlzIGV2ZW50IGhhbmRsZXIgYWZ0ZXIgMzAwbXMgYXMgcGVyIHRoZSBkZWZhdWx0IHRpbWVvdXQgZm9yIGNoYW5nZSBldmVudHNcbiAgICAjIHRvIGF2b2lkIHRoaXMgbWV0aG9kIGJlaW5nIHJlY2FsbGVkIVxuICAgIHNldFRpbWVvdXQoQGhhbmRsZU9uRGlkU3RvcENoYW5naW5nLCAzMDApXG4gICAgcmV0dXJuXG5cbiAgaGFuZGxlT25EaWRTdG9wQ2hhbmdpbmc6ID0+XG4gICAgQG9uRGlkU3RvcENoYW5naW5nSGFuZGxlciA9IEBlZGl0b3Iub25EaWRTdG9wQ2hhbmdpbmcgKCkgPT4gQGRpZFN0b3BDaGFuZ2luZygpXG5cbiAgIyBpcyB0aGUganN4IG9uIHRoaXMgbGluZSBpbiBzY29wZVxuICBqc3hJblNjb3BlOiAoYnVmZmVyUm93KSAtPlxuICAgIHNjb3BlcyA9IEBlZGl0b3Iuc2NvcGVEZXNjcmlwdG9yRm9yQnVmZmVyUG9zaXRpb24oW2J1ZmZlclJvdywgMF0pLmdldFNjb3Blc0FycmF5KClcbiAgICByZXR1cm4gJ21ldGEudGFnLmpzeCcgaW4gc2NvcGVzXG5cbiAgIyBpbmRlbnQgdGhlIEpTWCBpbiB0aGUgJ3JhbmdlJyBvZiByb3dzXG4gICMgVGhpcyBpcyBkZXNpZ25lZCB0byBiZSBhIHNpbmdsZSBwYXJzZSBpbmRlbnRlciB0byByZWR1Y2UgdGhlIGltcGFjdCBvbiB0aGUgZWRpdG9yLlxuICAjIEl0IGFzc3VtZXMgdGhlIGdyYW1tYXIgaGFzIGRvbmUgaXRzIGpvYiBhZGRpbmcgc2NvcGVzIHRvIGludGVyZXN0aW5nIHRva2Vucy5cbiAgIyBUaG9zZSBhcmUgSlNYIDx0YWcsID4sIDwvdGFnLCAvPiwgZW1lZGRlZCBleHByZXNzaW9uc1xuICAjIG91dHNpZGUgdGhlIHRhZyBzdGFydGluZyB7IGFuZCBlbmRpbmcgfSBhbmQgamF2YXNjcmlwdCBicmFjZXMgb3V0c2lkZSBhIHRhZyB7ICYgfVxuICAjIGl0IHVzZXMgYW4gYXJyYXkgdG8gaG9sZCB0b2tlbnMgYW5kIGEgcHVzaC9wb3Agc3RhY2sgdG8gaG9sZCB0b2tlbnMgbm90IGNsb3NlZFxuICAjIHRoZSB2ZXJ5IGZpcnN0IGpzeCB0YWcgbXVzdCBiZSBjb3JyZXRseSBpbmRldGVkIGJ5IHRoZSB1c2VyIGFzIHdlIGRvbid0IGhhdmVcbiAgIyBrbm93bGVkZ2Ugb2YgcHJlY2VlZGluZyBKYXZhc2NyaXB0LlxuICBpbmRlbnRKU1g6IChyYW5nZSkgLT5cbiAgICB0b2tlblN0YWNrID0gW11cbiAgICBpZHhPZlRva2VuID0gMFxuICAgIHN0YWNrT2ZUb2tlbnNTdGlsbE9wZW4gPSBbXSAjIGxlbmd0aCBlcXVpdmFsZW50IHRvIHRva2VuIGRlcHRoXG4gICAgaW5kZW50ID0gIDBcbiAgICBpc0ZpcnN0VGFnT2ZCbG9jayA9IHRydWVcbiAgICBASlNYUkVHRVhQLmxhc3RJbmRleCA9IDBcblxuICAgIGZvciByb3cgaW4gW3JhbmdlLnN0YXJ0LnJvdy4ucmFuZ2UuZW5kLnJvd11cbiAgICAgIGlzRmlyc3RUb2tlbk9mTGluZSA9IHRydWVcbiAgICAgIHRva2VuT25UaGlzTGluZSA9IGZhbHNlXG4gICAgICBpbmRlbnRSZWNhbGMgPSBmYWxzZVxuICAgICAgbGluZSA9IEBlZGl0b3IubGluZVRleHRGb3JCdWZmZXJSb3cgcm93XG5cbiAgICAgICMgbG9vayBmb3IgdG9rZW5zIGluIGEgYnVmZmVyIGxpbmVcbiAgICAgIHdoaWxlICgoIG1hdGNoID0gQEpTWFJFR0VYUC5leGVjKGxpbmUpKSBpc250IG51bGwgKVxuICAgICAgICBtYXRjaENvbHVtbiA9IG1hdGNoLmluZGV4XG4gICAgICAgIG1hdGNoUG9pbnRTdGFydCA9IG5ldyBQb2ludChyb3csIG1hdGNoQ29sdW1uKVxuICAgICAgICBtYXRjaFBvaW50RW5kID0gbmV3IFBvaW50KHJvdywgbWF0Y2hDb2x1bW4gKyBtYXRjaFswXS5sZW5ndGggLSAxKVxuICAgICAgICBtYXRjaFJhbmdlID0gbmV3IFJhbmdlKG1hdGNoUG9pbnRTdGFydCwgbWF0Y2hQb2ludEVuZClcblxuICAgICAgICBpZiBub3QgdG9rZW4gPSAgQGdldFRva2VuKHJvdywgbWF0Y2gpIHRoZW4gY29udGludWVcblxuICAgICAgICBmaXJzdENoYXJJbmRlbnRhdGlvbiA9IChAZWRpdG9yLmluZGVudGF0aW9uRm9yQnVmZmVyUm93IHJvdylcbiAgICAgICAgIyBjb252ZXJ0IHRoZSBtYXRjaGVkIGNvbHVtbiBwb3NpdGlvbiBpbnRvIHRhYiBpbmRlbnRzXG4gICAgICAgIGlmIEBlZGl0b3IuZ2V0U29mdFRhYnMoKVxuICAgICAgICAgIHRva2VuSW5kZW50YXRpb24gPSAobWF0Y2hDb2x1bW4gLyBAZWRpdG9yLmdldFRhYkxlbmd0aCgpKVxuICAgICAgICBlbHNlIHRva2VuSW5kZW50YXRpb24gPVxuICAgICAgICAgIGRvIChAZWRpdG9yKSAtPlxuICAgICAgICAgICAgaGFyZFRhYnNGb3VuZCA9IGNoYXJzRm91bmQgPSAwXG4gICAgICAgICAgICBmb3IgaSBpbiBbMC4uLm1hdGNoQ29sdW1uXVxuICAgICAgICAgICAgICBpZiAoKGxpbmUuc3Vic3RyIGksIDEpIGlzICdcXHQnKVxuICAgICAgICAgICAgICAgIGhhcmRUYWJzRm91bmQrK1xuICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgY2hhcnNGb3VuZCsrXG4gICAgICAgICAgICByZXR1cm4gaGFyZFRhYnNGb3VuZCArICggY2hhcnNGb3VuZCAvIEBlZGl0b3IuZ2V0VGFiTGVuZ3RoKCkgKVxuXG4gICAgICAgIGlmIGlzRmlyc3RUb2tlbk9mTGluZVxuICAgICAgICAgIGZpcnN0VGFnSW5MaW5lSW5kZW50YXRpb24gPSAgdG9rZW5JbmRlbnRhdGlvblxuXG4gICAgICAgICMgYmlnIHN3aXRjaCBzdGF0ZW1lbnQgZm9sbG93cyBmb3IgZWFjaCB0b2tlbi4gSWYgdGhlIGxpbmUgaXMgcmVmb3JtYXRlZFxuICAgICAgICAjIHRoZW4gd2UgcmVjYWxjdWxhdGUgdGhlIG5ldyBwb3NpdGlvbi5cbiAgICAgICAgIyBiaXQgaG9ycmlkIGJ1dCBob3BlZnVsbHkgZmFzdC5cbiAgICAgICAgc3dpdGNoICh0b2tlbilcbiAgICAgICAgICAjIHRhZ3Mgc3RhcnRpbmcgPHRhZ1xuICAgICAgICAgIHdoZW4gSlNYVEFHX09QRU5cbiAgICAgICAgICAgIHRva2VuT25UaGlzTGluZSA9IHRydWVcbiAgICAgICAgICAgICMgaW5kZW50IG9ubHkgb24gZmlyc3QgdG9rZW4gb2YgYSBsaW5lXG4gICAgICAgICAgICBpZiBpc0ZpcnN0VG9rZW5PZkxpbmVcbiAgICAgICAgICAgICAgc3RhY2tPZlRva2Vuc1N0aWxsT3Blbi5wdXNoIHBhcmVudFRva2VuSWR4ID0gc3RhY2tPZlRva2Vuc1N0aWxsT3Blbi5wb3AoKVxuICAgICAgICAgICAgICAjIGlzRmlyc3RUYWdPZkJsb2NrIGlzIHVzZWQgdG8gbWFyayB0aGUgdGFnIHRoYXQgc3RhcnRzIHRoZSBKU1ggYnV0XG4gICAgICAgICAgICAgICMgYWxzbyB0aGUgZmlyc3QgdGFnIG9mIGJsb2NrcyBpbnNpZGUgIGVtYmVkZGVkIGV4cHJlc3Npb25zLiBlLmcuXG4gICAgICAgICAgICAgICMgPHRib2R5PiwgPHBDb21wPiBhbmQgPG9iamVjdFJvdz4gYXJlIGZpcnN0IHRhZ3NcbiAgICAgICAgICAgICAgIyByZXR1cm4gKFxuICAgICAgICAgICAgICAjICAgICAgIDx0Ym9keSBjb21wPXs8cENvbXAgcHJvcGVydHkgLz59PlxuICAgICAgICAgICAgICAjICAgICAgICAge29iamVjdHMubWFwKGZ1bmN0aW9uKG9iamVjdCwgaSl7XG4gICAgICAgICAgICAgICMgICAgICAgICAgIHJldHVybiA8T2JqZWN0Um93IG9iaj17b2JqZWN0fSBrZXk9e2l9IC8+O1xuICAgICAgICAgICAgICAjICAgICAgICAgfSl9XG4gICAgICAgICAgICAgICMgICAgICAgPC90Ym9keT5cbiAgICAgICAgICAgICAgIyAgICAgKVxuICAgICAgICAgICAgICAjIGJ1dCB3ZSBkb24ndCBwb3NpdGlvbiB0aGUgPHRib2R5PiBhcyB3ZSBoYXZlIG5vIGtub3dsZWRnZSBvZiB0aGUgcHJlY2VlZGluZ1xuICAgICAgICAgICAgICAjIGpzIHN5bnRheFxuICAgICAgICAgICAgICBpZiBpc0ZpcnN0VGFnT2ZCbG9jayBhbmRcbiAgICAgICAgICAgICAgICAgIHBhcmVudFRva2VuSWR4PyBhbmRcbiAgICAgICAgICAgICAgICAgIHRva2VuU3RhY2tbcGFyZW50VG9rZW5JZHhdLnR5cGUgaXMgQlJBQ0VfT1BFTiBhbmRcbiAgICAgICAgICAgICAgICAgIHRva2VuU3RhY2tbcGFyZW50VG9rZW5JZHhdLnJvdyBpcyAoIHJvdyAtIDEpXG4gICAgICAgICAgICAgICAgICAgIHRva2VuSW5kZW50YXRpb24gPSBmaXJzdENoYXJJbmRlbnRhdGlvbiA9IGZpcnN0VGFnSW5MaW5lSW5kZW50YXRpb24gPVxuICAgICAgICAgICAgICAgICAgICAgIEBlc2xpbnRJbmRlbnRPcHRpb25zLmpzeEluZGVudFsxXSArIEBnZXRJbmRlbnRPZlByZXZpb3VzUm93IHJvd1xuICAgICAgICAgICAgICAgICAgICBpbmRlbnRSZWNhbGMgPSBAaW5kZW50Um93KHtyb3c6IHJvdyAsIGJsb2NrSW5kZW50OiBmaXJzdENoYXJJbmRlbnRhdGlvbiB9KVxuICAgICAgICAgICAgICBlbHNlIGlmIGlzRmlyc3RUYWdPZkJsb2NrIGFuZCBwYXJlbnRUb2tlbklkeD9cbiAgICAgICAgICAgICAgICBpbmRlbnRSZWNhbGMgPSBAaW5kZW50Um93KHtyb3c6IHJvdyAsIGJsb2NrSW5kZW50OiBAZ2V0SW5kZW50T2ZQcmV2aW91c1Jvdyhyb3cpLCBqc3hJbmRlbnQ6IDF9KVxuICAgICAgICAgICAgICBlbHNlIGlmIHBhcmVudFRva2VuSWR4P1xuICAgICAgICAgICAgICAgIGluZGVudFJlY2FsYyA9IEBpbmRlbnRSb3coe3Jvdzogcm93ICwgYmxvY2tJbmRlbnQ6IHRva2VuU3RhY2tbcGFyZW50VG9rZW5JZHhdLmZpcnN0Q2hhckluZGVudGF0aW9uLCBqc3hJbmRlbnQ6IDF9KVxuXG4gICAgICAgICAgICAjIHJlLXBhcnNlIGxpbmUgaWYgaW5kZW50IGRpZCBzb21ldGhpbmcgdG8gaXRcbiAgICAgICAgICAgIGlmIGluZGVudFJlY2FsY1xuICAgICAgICAgICAgICBsaW5lID0gQGVkaXRvci5saW5lVGV4dEZvckJ1ZmZlclJvdyByb3dcbiAgICAgICAgICAgICAgQEpTWFJFR0VYUC5sYXN0SW5kZXggPSAwICNmb3JjZSByZWdleCB0byBzdGFydCBhZ2FpblxuICAgICAgICAgICAgICBjb250aW51ZVxuXG4gICAgICAgICAgICBpc0ZpcnN0VG9rZW5PZkxpbmUgPSBmYWxzZVxuICAgICAgICAgICAgaXNGaXJzdFRhZ09mQmxvY2sgPSBmYWxzZVxuXG4gICAgICAgICAgICBzdGFja09mVG9rZW5zU3RpbGxPcGVuLnB1c2ggcGFyZW50VG9rZW5JZHggPSBzdGFja09mVG9rZW5zU3RpbGxPcGVuLnBvcCgpXG4gICAgICAgICAgICB0b2tlblN0YWNrLnB1c2hcbiAgICAgICAgICAgICAgdHlwZTogSlNYVEFHX09QRU5cbiAgICAgICAgICAgICAgbmFtZTogbWF0Y2hbMl1cbiAgICAgICAgICAgICAgcm93OiByb3dcbiAgICAgICAgICAgICAgZmlyc3RUYWdJbkxpbmVJbmRlbnRhdGlvbjogZmlyc3RUYWdJbkxpbmVJbmRlbnRhdGlvblxuICAgICAgICAgICAgICB0b2tlbkluZGVudGF0aW9uOiB0b2tlbkluZGVudGF0aW9uXG4gICAgICAgICAgICAgIGZpcnN0Q2hhckluZGVudGF0aW9uOiBmaXJzdENoYXJJbmRlbnRhdGlvblxuICAgICAgICAgICAgICBwYXJlbnRUb2tlbklkeDogcGFyZW50VG9rZW5JZHhcbiAgICAgICAgICAgICAgdGVybXNUaGlzVGFnc0F0dHJpYnV0ZXNJZHg6IG51bGwgICMgcHRyIHRvID4gdGFnXG4gICAgICAgICAgICAgIHRlcm1zVGhpc1RhZ0lkeDogbnVsbCAgICAgICAgICAgICAjIHB0ciB0byA8L3RhZz5cblxuICAgICAgICAgICAgc3RhY2tPZlRva2Vuc1N0aWxsT3Blbi5wdXNoIGlkeE9mVG9rZW5cbiAgICAgICAgICAgIGlkeE9mVG9rZW4rK1xuXG4gICAgICAgICAgIyB0YWdzIGVuZGluZyA8L3RhZz5cbiAgICAgICAgICB3aGVuIEpTWFRBR19DTE9TRVxuICAgICAgICAgICAgdG9rZW5PblRoaXNMaW5lID0gdHJ1ZVxuICAgICAgICAgICAgaWYgaXNGaXJzdFRva2VuT2ZMaW5lXG4gICAgICAgICAgICAgIHN0YWNrT2ZUb2tlbnNTdGlsbE9wZW4ucHVzaCBwYXJlbnRUb2tlbklkeCA9IHN0YWNrT2ZUb2tlbnNTdGlsbE9wZW4ucG9wKClcbiAgICAgICAgICAgICAgaW5kZW50UmVjYWxjID0gQGluZGVudFJvdyh7cm93OiByb3csIGJsb2NrSW5kZW50OiB0b2tlblN0YWNrW3BhcmVudFRva2VuSWR4XS5maXJzdENoYXJJbmRlbnRhdGlvbiB9IClcblxuICAgICAgICAgICAgIyByZS1wYXJzZSBsaW5lIGlmIGluZGVudCBkaWQgc29tZXRoaW5nIHRvIGl0XG4gICAgICAgICAgICBpZiBpbmRlbnRSZWNhbGNcbiAgICAgICAgICAgICAgbGluZSA9IEBlZGl0b3IubGluZVRleHRGb3JCdWZmZXJSb3cgcm93XG4gICAgICAgICAgICAgIEBKU1hSRUdFWFAubGFzdEluZGV4ID0gMCAjZm9yY2UgcmVnZXggdG8gc3RhcnQgYWdhaW5cbiAgICAgICAgICAgICAgY29udGludWVcblxuICAgICAgICAgICAgaXNGaXJzdFRva2VuT2ZMaW5lID0gZmFsc2VcbiAgICAgICAgICAgIGlzRmlyc3RUYWdPZkJsb2NrID0gZmFsc2VcblxuICAgICAgICAgICAgcGFyZW50VG9rZW5JZHggPSBzdGFja09mVG9rZW5zU3RpbGxPcGVuLnBvcCgpXG4gICAgICAgICAgICB0b2tlblN0YWNrLnB1c2hcbiAgICAgICAgICAgICAgdHlwZTogSlNYVEFHX0NMT1NFXG4gICAgICAgICAgICAgIG5hbWU6IG1hdGNoWzVdXG4gICAgICAgICAgICAgIHJvdzogcm93XG4gICAgICAgICAgICAgIHBhcmVudFRva2VuSWR4OiBwYXJlbnRUb2tlbklkeCAgICAgICAgICMgcHRyIHRvIDx0YWdcbiAgICAgICAgICAgIGlmIHBhcmVudFRva2VuSWR4ID49MCB0aGVuIHRva2VuU3RhY2tbcGFyZW50VG9rZW5JZHhdLnRlcm1zVGhpc1RhZ0lkeCA9IGlkeE9mVG9rZW5cbiAgICAgICAgICAgIGlkeE9mVG9rZW4rK1xuXG4gICAgICAgICAgIyB0YWdzIGVuZGluZyAvPlxuICAgICAgICAgIHdoZW4gSlNYVEFHX1NFTEZDTE9TRV9FTkRcbiAgICAgICAgICAgIHRva2VuT25UaGlzTGluZSA9IHRydWVcbiAgICAgICAgICAgIGlmIGlzRmlyc3RUb2tlbk9mTGluZVxuICAgICAgICAgICAgICBzdGFja09mVG9rZW5zU3RpbGxPcGVuLnB1c2ggcGFyZW50VG9rZW5JZHggPSBzdGFja09mVG9rZW5zU3RpbGxPcGVuLnBvcCgpXG4gICAgICAgICAgICAgIGlmIGZpcnN0VGFnSW5MaW5lSW5kZW50YXRpb24gaXMgZmlyc3RDaGFySW5kZW50YXRpb25cbiAgICAgICAgICAgICAgICBpbmRlbnRSZWNhbGMgPSBAaW5kZW50Rm9yQ2xvc2luZ0JyYWNrZXQgIHJvdyxcbiAgICAgICAgICAgICAgICAgIHRva2VuU3RhY2tbcGFyZW50VG9rZW5JZHhdLFxuICAgICAgICAgICAgICAgICAgQGVzbGludEluZGVudE9wdGlvbnMuanN4Q2xvc2luZ0JyYWNrZXRMb2NhdGlvblsxXS5zZWxmQ2xvc2luZ1xuICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgaW5kZW50UmVjYWxjID0gQGluZGVudFJvdyh7cm93OiByb3dcbiAgICAgICAgICAgICAgICAgICxibG9ja0luZGVudDogdG9rZW5TdGFja1twYXJlbnRUb2tlbklkeF0uZmlyc3RUYWdJbkxpbmVJbmRlbnRhdGlvbiwganN4SW5kZW50UHJvcHM6IDEgfSApXG5cbiAgICAgICAgICAgICMgcmUtcGFyc2UgbGluZSBpZiBpbmRlbnQgZGlkIHNvbWV0aGluZyB0byBpdFxuICAgICAgICAgICAgaWYgaW5kZW50UmVjYWxjXG4gICAgICAgICAgICAgIGxpbmUgPSBAZWRpdG9yLmxpbmVUZXh0Rm9yQnVmZmVyUm93IHJvd1xuICAgICAgICAgICAgICBASlNYUkVHRVhQLmxhc3RJbmRleCA9IDAgI2ZvcmNlIHJlZ2V4IHRvIHN0YXJ0IGFnYWluXG4gICAgICAgICAgICAgIGNvbnRpbnVlXG5cbiAgICAgICAgICAgIGlzRmlyc3RUYWdPZkJsb2NrID0gZmFsc2VcbiAgICAgICAgICAgIGlzRmlyc3RUb2tlbk9mTGluZSA9IGZhbHNlXG5cbiAgICAgICAgICAgIHBhcmVudFRva2VuSWR4ID0gc3RhY2tPZlRva2Vuc1N0aWxsT3Blbi5wb3AoKVxuICAgICAgICAgICAgdG9rZW5TdGFjay5wdXNoXG4gICAgICAgICAgICAgIHR5cGU6IEpTWFRBR19TRUxGQ0xPU0VfRU5EXG4gICAgICAgICAgICAgIG5hbWU6IHRva2VuU3RhY2tbcGFyZW50VG9rZW5JZHhdLm5hbWVcbiAgICAgICAgICAgICAgcm93OiByb3dcbiAgICAgICAgICAgICAgcGFyZW50VG9rZW5JZHg6IHBhcmVudFRva2VuSWR4ICAgICAgICMgcHRyIHRvIDx0YWdcbiAgICAgICAgICAgIGlmIHBhcmVudFRva2VuSWR4ID49IDBcbiAgICAgICAgICAgICAgdG9rZW5TdGFja1twYXJlbnRUb2tlbklkeF0udGVybXNUaGlzVGFnc0F0dHJpYnV0ZXNJZHggPSBpZHhPZlRva2VuXG4gICAgICAgICAgICAgIHRva2VuU3RhY2tbcGFyZW50VG9rZW5JZHhdLnR5cGUgPSBKU1hUQUdfU0VMRkNMT1NFX1NUQVJUXG4gICAgICAgICAgICAgIHRva2VuU3RhY2tbcGFyZW50VG9rZW5JZHhdLnRlcm1zVGhpc1RhZ0lkeCA9IGlkeE9mVG9rZW5cbiAgICAgICAgICAgIGlkeE9mVG9rZW4rK1xuXG4gICAgICAgICAgIyB0YWdzIGVuZGluZyA+XG4gICAgICAgICAgd2hlbiBKU1hUQUdfQ0xPU0VfQVRUUlNcbiAgICAgICAgICAgIHRva2VuT25UaGlzTGluZSA9IHRydWVcbiAgICAgICAgICAgIGlmIGlzRmlyc3RUb2tlbk9mTGluZVxuICAgICAgICAgICAgICBzdGFja09mVG9rZW5zU3RpbGxPcGVuLnB1c2ggcGFyZW50VG9rZW5JZHggPSBzdGFja09mVG9rZW5zU3RpbGxPcGVuLnBvcCgpXG4gICAgICAgICAgICAgIGlmIGZpcnN0VGFnSW5MaW5lSW5kZW50YXRpb24gaXMgZmlyc3RDaGFySW5kZW50YXRpb25cbiAgICAgICAgICAgICAgICBpbmRlbnRSZWNhbGMgPSBAaW5kZW50Rm9yQ2xvc2luZ0JyYWNrZXQgIHJvdyxcbiAgICAgICAgICAgICAgICAgIHRva2VuU3RhY2tbcGFyZW50VG9rZW5JZHhdLFxuICAgICAgICAgICAgICAgICAgQGVzbGludEluZGVudE9wdGlvbnMuanN4Q2xvc2luZ0JyYWNrZXRMb2NhdGlvblsxXS5ub25FbXB0eVxuICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgaW5kZW50UmVjYWxjID0gQGluZGVudFJvdyh7cm93OiByb3csIGJsb2NrSW5kZW50OiB0b2tlblN0YWNrW3BhcmVudFRva2VuSWR4XS5maXJzdFRhZ0luTGluZUluZGVudGF0aW9uLCBqc3hJbmRlbnRQcm9wczogMSB9KVxuXG4gICAgICAgICAgICAjIHJlLXBhcnNlIGxpbmUgaWYgaW5kZW50IGRpZCBzb21ldGhpbmcgdG8gaXRcbiAgICAgICAgICAgIGlmIGluZGVudFJlY2FsY1xuICAgICAgICAgICAgICBsaW5lID0gQGVkaXRvci5saW5lVGV4dEZvckJ1ZmZlclJvdyByb3dcbiAgICAgICAgICAgICAgQEpTWFJFR0VYUC5sYXN0SW5kZXggPSAwICNmb3JjZSByZWdleCB0byBzdGFydCBhZ2FpblxuICAgICAgICAgICAgICBjb250aW51ZVxuXG4gICAgICAgICAgICBpc0ZpcnN0VGFnT2ZCbG9jayA9IGZhbHNlXG4gICAgICAgICAgICBpc0ZpcnN0VG9rZW5PZkxpbmUgPSBmYWxzZVxuXG4gICAgICAgICAgICBzdGFja09mVG9rZW5zU3RpbGxPcGVuLnB1c2ggcGFyZW50VG9rZW5JZHggPSBzdGFja09mVG9rZW5zU3RpbGxPcGVuLnBvcCgpXG4gICAgICAgICAgICB0b2tlblN0YWNrLnB1c2hcbiAgICAgICAgICAgICAgdHlwZTogSlNYVEFHX0NMT1NFX0FUVFJTXG4gICAgICAgICAgICAgIG5hbWU6IHRva2VuU3RhY2tbcGFyZW50VG9rZW5JZHhdLm5hbWVcbiAgICAgICAgICAgICAgcm93OiByb3dcbiAgICAgICAgICAgICAgcGFyZW50VG9rZW5JZHg6IHBhcmVudFRva2VuSWR4ICAgICAgICAgICAgIyBwdHIgdG8gPHRhZ1xuICAgICAgICAgICAgaWYgcGFyZW50VG9rZW5JZHggPj0gMCB0aGVuIHRva2VuU3RhY2tbcGFyZW50VG9rZW5JZHhdLnRlcm1zVGhpc1RhZ3NBdHRyaWJ1dGVzSWR4ID0gaWR4T2ZUb2tlblxuICAgICAgICAgICAgaWR4T2ZUb2tlbisrXG5cbiAgICAgICAgICAjIGVtYmVkZWQgZXhwcmVzc2lvbiBzdGFydCB7XG4gICAgICAgICAgd2hlbiBKU1hCUkFDRV9PUEVOXG4gICAgICAgICAgICB0b2tlbk9uVGhpc0xpbmUgPSB0cnVlXG4gICAgICAgICAgICBpZiBpc0ZpcnN0VG9rZW5PZkxpbmVcbiAgICAgICAgICAgICAgc3RhY2tPZlRva2Vuc1N0aWxsT3Blbi5wdXNoIHBhcmVudFRva2VuSWR4ID0gc3RhY2tPZlRva2Vuc1N0aWxsT3Blbi5wb3AoKVxuICAgICAgICAgICAgICBpZiBwYXJlbnRUb2tlbklkeD9cbiAgICAgICAgICAgICAgICBpZiB0b2tlblN0YWNrW3BhcmVudFRva2VuSWR4XS50eXBlIGlzIEpTWFRBR19PUEVOIGFuZCB0b2tlblN0YWNrW3BhcmVudFRva2VuSWR4XS50ZXJtc1RoaXNUYWdzQXR0cmlidXRlc0lkeCBpcyBudWxsXG4gICAgICAgICAgICAgICAgICBpbmRlbnRSZWNhbGMgPSBAaW5kZW50Um93KHtyb3c6IHJvdywgYmxvY2tJbmRlbnQ6IHRva2VuU3RhY2tbcGFyZW50VG9rZW5JZHhdLmZpcnN0Q2hhckluZGVudGF0aW9uLCBqc3hJbmRlbnRQcm9wczogMSB9KVxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgIGluZGVudFJlY2FsYyA9IEBpbmRlbnRSb3coe3Jvdzogcm93LCBibG9ja0luZGVudDogdG9rZW5TdGFja1twYXJlbnRUb2tlbklkeF0uZmlyc3RDaGFySW5kZW50YXRpb24sIGpzeEluZGVudDogMSB9IClcblxuICAgICAgICAgICAgIyByZS1wYXJzZSBsaW5lIGlmIGluZGVudCBkaWQgc29tZXRoaW5nIHRvIGl0XG4gICAgICAgICAgICBpZiBpbmRlbnRSZWNhbGNcbiAgICAgICAgICAgICAgbGluZSA9IEBlZGl0b3IubGluZVRleHRGb3JCdWZmZXJSb3cgcm93XG4gICAgICAgICAgICAgIEBKU1hSRUdFWFAubGFzdEluZGV4ID0gMCAjZm9yY2UgcmVnZXggdG8gc3RhcnQgYWdhaW5cbiAgICAgICAgICAgICAgY29udGludWVcblxuICAgICAgICAgICAgaXNGaXJzdFRhZ09mQmxvY2sgPSB0cnVlICAjIHRoaXMgbWF5IGJlIHRoZSBzdGFydCBvZiBhIG5ldyBKU1ggYmxvY2tcbiAgICAgICAgICAgIGlzRmlyc3RUb2tlbk9mTGluZSA9IGZhbHNlXG5cbiAgICAgICAgICAgIHN0YWNrT2ZUb2tlbnNTdGlsbE9wZW4ucHVzaCBwYXJlbnRUb2tlbklkeCA9IHN0YWNrT2ZUb2tlbnNTdGlsbE9wZW4ucG9wKClcbiAgICAgICAgICAgIHRva2VuU3RhY2sucHVzaFxuICAgICAgICAgICAgICB0eXBlOiBKU1hCUkFDRV9PUEVOXG4gICAgICAgICAgICAgIG5hbWU6ICcnXG4gICAgICAgICAgICAgIHJvdzogcm93XG4gICAgICAgICAgICAgIGZpcnN0VGFnSW5MaW5lSW5kZW50YXRpb246IGZpcnN0VGFnSW5MaW5lSW5kZW50YXRpb25cbiAgICAgICAgICAgICAgdG9rZW5JbmRlbnRhdGlvbjogdG9rZW5JbmRlbnRhdGlvblxuICAgICAgICAgICAgICBmaXJzdENoYXJJbmRlbnRhdGlvbjogZmlyc3RDaGFySW5kZW50YXRpb25cbiAgICAgICAgICAgICAgcGFyZW50VG9rZW5JZHg6IHBhcmVudFRva2VuSWR4XG4gICAgICAgICAgICAgIHRlcm1zVGhpc1RhZ3NBdHRyaWJ1dGVzSWR4OiBudWxsICAjIHB0ciB0byA+IHRhZ1xuICAgICAgICAgICAgICB0ZXJtc1RoaXNUYWdJZHg6IG51bGwgICAgICAgICAgICAgIyBwdHIgdG8gPC90YWc+XG5cbiAgICAgICAgICAgIHN0YWNrT2ZUb2tlbnNTdGlsbE9wZW4ucHVzaCBpZHhPZlRva2VuXG4gICAgICAgICAgICBpZHhPZlRva2VuKytcblxuICAgICAgICAgICMgZW1iZWRlZCBleHByZXNzaW9uIGVuZCB9XG4gICAgICAgICAgd2hlbiBKU1hCUkFDRV9DTE9TRVxuICAgICAgICAgICAgdG9rZW5PblRoaXNMaW5lID0gdHJ1ZVxuICAgICAgICAgICAgaWYgaXNGaXJzdFRva2VuT2ZMaW5lXG4gICAgICAgICAgICAgIHN0YWNrT2ZUb2tlbnNTdGlsbE9wZW4ucHVzaCBwYXJlbnRUb2tlbklkeCA9IHN0YWNrT2ZUb2tlbnNTdGlsbE9wZW4ucG9wKClcbiAgICAgICAgICAgICAgaW5kZW50UmVjYWxjID0gQGluZGVudFJvdyh7cm93OiByb3csIGJsb2NrSW5kZW50OiB0b2tlblN0YWNrW3BhcmVudFRva2VuSWR4XS5maXJzdENoYXJJbmRlbnRhdGlvbiB9KVxuXG4gICAgICAgICAgICAjIHJlLXBhcnNlIGxpbmUgaWYgaW5kZW50IGRpZCBzb21ldGhpbmcgdG8gaXRcbiAgICAgICAgICAgIGlmIGluZGVudFJlY2FsY1xuICAgICAgICAgICAgICBsaW5lID0gQGVkaXRvci5saW5lVGV4dEZvckJ1ZmZlclJvdyByb3dcbiAgICAgICAgICAgICAgQEpTWFJFR0VYUC5sYXN0SW5kZXggPSAwICNmb3JjZSByZWdleCB0byBzdGFydCBhZ2FpblxuICAgICAgICAgICAgICBjb250aW51ZVxuXG4gICAgICAgICAgICBpc0ZpcnN0VGFnT2ZCbG9jayA9IGZhbHNlXG4gICAgICAgICAgICBpc0ZpcnN0VG9rZW5PZkxpbmUgPSBmYWxzZVxuXG4gICAgICAgICAgICBwYXJlbnRUb2tlbklkeCA9IHN0YWNrT2ZUb2tlbnNTdGlsbE9wZW4ucG9wKClcbiAgICAgICAgICAgIHRva2VuU3RhY2sucHVzaFxuICAgICAgICAgICAgICB0eXBlOiBKU1hCUkFDRV9DTE9TRVxuICAgICAgICAgICAgICBuYW1lOiAnJ1xuICAgICAgICAgICAgICByb3c6IHJvd1xuICAgICAgICAgICAgICBwYXJlbnRUb2tlbklkeDogcGFyZW50VG9rZW5JZHggICAgICAgICAjIHB0ciB0byA8dGFnXG4gICAgICAgICAgICBpZiBwYXJlbnRUb2tlbklkeCA+PTAgdGhlbiB0b2tlblN0YWNrW3BhcmVudFRva2VuSWR4XS50ZXJtc1RoaXNUYWdJZHggPSBpZHhPZlRva2VuXG4gICAgICAgICAgICBpZHhPZlRva2VuKytcblxuICAgICAgICAgICMgSmF2YXNjcmlwdCBicmFjZSBTdGFydCB7IG9yIHN3aXRjaCBicmFjZSBzdGFydCB7IG9yIHBhcmVuIChcbiAgICAgICAgICB3aGVuIEJSQUNFX09QRU4sIFNXSVRDSF9CUkFDRV9PUEVOLCBQQVJFTl9PUEVOXG4gICAgICAgICAgICB0b2tlbk9uVGhpc0xpbmUgPSB0cnVlXG4gICAgICAgICAgICBpZiBpc0ZpcnN0VG9rZW5PZkxpbmVcbiAgICAgICAgICAgICAgc3RhY2tPZlRva2Vuc1N0aWxsT3Blbi5wdXNoIHBhcmVudFRva2VuSWR4ID0gc3RhY2tPZlRva2Vuc1N0aWxsT3Blbi5wb3AoKVxuICAgICAgICAgICAgICBpZiBpc0ZpcnN0VGFnT2ZCbG9jayBhbmRcbiAgICAgICAgICAgICAgICAgIHBhcmVudFRva2VuSWR4PyBhbmRcbiAgICAgICAgICAgICAgICAgIHRva2VuU3RhY2tbcGFyZW50VG9rZW5JZHhdLnR5cGUgaXMgdG9rZW4gYW5kXG4gICAgICAgICAgICAgICAgICB0b2tlblN0YWNrW3BhcmVudFRva2VuSWR4XS5yb3cgaXMgKCByb3cgLSAxKVxuICAgICAgICAgICAgICAgICAgICB0b2tlbkluZGVudGF0aW9uID0gZmlyc3RDaGFySW5kZW50YXRpb24gPVxuICAgICAgICAgICAgICAgICAgICAgIEBlc2xpbnRJbmRlbnRPcHRpb25zLmpzeEluZGVudFsxXSArIEBnZXRJbmRlbnRPZlByZXZpb3VzUm93IHJvd1xuICAgICAgICAgICAgICAgICAgICBpbmRlbnRSZWNhbGMgPSBAaW5kZW50Um93KHtyb3c6IHJvdywgYmxvY2tJbmRlbnQ6IGZpcnN0Q2hhckluZGVudGF0aW9ufSlcbiAgICAgICAgICAgICAgZWxzZSBpZiBwYXJlbnRUb2tlbklkeD9cbiAgICAgICAgICAgICAgICBpbmRlbnRSZWNhbGMgPSBAaW5kZW50Um93KHtyb3c6IHJvdywgYmxvY2tJbmRlbnQ6IHRva2VuU3RhY2tbcGFyZW50VG9rZW5JZHhdLmZpcnN0Q2hhckluZGVudGF0aW9uLCBqc3hJbmRlbnQ6IDEgfSApXG5cbiAgICAgICAgICAgICMgcmUtcGFyc2UgbGluZSBpZiBpbmRlbnQgZGlkIHNvbWV0aGluZyB0byBpdFxuICAgICAgICAgICAgaWYgaW5kZW50UmVjYWxjXG4gICAgICAgICAgICAgIGxpbmUgPSBAZWRpdG9yLmxpbmVUZXh0Rm9yQnVmZmVyUm93IHJvd1xuICAgICAgICAgICAgICBASlNYUkVHRVhQLmxhc3RJbmRleCA9IDAgI2ZvcmNlIHJlZ2V4IHRvIHN0YXJ0IGFnYWluXG4gICAgICAgICAgICAgIGNvbnRpbnVlXG5cbiAgICAgICAgICAgIGlzRmlyc3RUb2tlbk9mTGluZSA9IGZhbHNlXG5cbiAgICAgICAgICAgIHN0YWNrT2ZUb2tlbnNTdGlsbE9wZW4ucHVzaCBwYXJlbnRUb2tlbklkeCA9IHN0YWNrT2ZUb2tlbnNTdGlsbE9wZW4ucG9wKClcbiAgICAgICAgICAgIHRva2VuU3RhY2sucHVzaFxuICAgICAgICAgICAgICB0eXBlOiB0b2tlblxuICAgICAgICAgICAgICBuYW1lOiAnJ1xuICAgICAgICAgICAgICByb3c6IHJvd1xuICAgICAgICAgICAgICBmaXJzdFRhZ0luTGluZUluZGVudGF0aW9uOiBmaXJzdFRhZ0luTGluZUluZGVudGF0aW9uXG4gICAgICAgICAgICAgIHRva2VuSW5kZW50YXRpb246IHRva2VuSW5kZW50YXRpb25cbiAgICAgICAgICAgICAgZmlyc3RDaGFySW5kZW50YXRpb246IGZpcnN0Q2hhckluZGVudGF0aW9uXG4gICAgICAgICAgICAgIHBhcmVudFRva2VuSWR4OiBwYXJlbnRUb2tlbklkeFxuICAgICAgICAgICAgICB0ZXJtc1RoaXNUYWdzQXR0cmlidXRlc0lkeDogbnVsbCAgIyBwdHIgdG8gPiB0YWdcbiAgICAgICAgICAgICAgdGVybXNUaGlzVGFnSWR4OiBudWxsICAgICAgICAgICAgICMgcHRyIHRvIDwvdGFnPlxuXG4gICAgICAgICAgICBzdGFja09mVG9rZW5zU3RpbGxPcGVuLnB1c2ggaWR4T2ZUb2tlblxuICAgICAgICAgICAgaWR4T2ZUb2tlbisrXG5cbiAgICAgICAgICAjIEphdmFzY3JpcHQgYnJhY2UgRW5kIH0gb3Igc3dpdGNoIGJyYWNlIGVuZCB9IG9yIHBhcmVuIGNsb3NlIClcbiAgICAgICAgICB3aGVuIEJSQUNFX0NMT1NFLCBTV0lUQ0hfQlJBQ0VfQ0xPU0UsIFBBUkVOX0NMT1NFXG5cbiAgICAgICAgICAgIGlmIHRva2VuIGlzIFNXSVRDSF9CUkFDRV9DTE9TRVxuICAgICAgICAgICAgICBzdGFja09mVG9rZW5zU3RpbGxPcGVuLnB1c2ggcGFyZW50VG9rZW5JZHggPSBzdGFja09mVG9rZW5zU3RpbGxPcGVuLnBvcCgpXG4gICAgICAgICAgICAgIGlmIHRva2VuU3RhY2tbcGFyZW50VG9rZW5JZHhdLnR5cGUgaXMgU1dJVENIX0NBU0Ugb3IgdG9rZW5TdGFja1twYXJlbnRUb2tlbklkeF0udHlwZSBpcyBTV0lUQ0hfREVGQVVMVFxuICAgICAgICAgICAgICAgICMgd2Ugb25seSBhbGxvdyBhIHNpbmdsZSBjYXNlL2RlZmF1bHQgc3RhY2sgZWxlbWVudCBwZXIgc3dpdGNoIGluc3RhbmNlXG4gICAgICAgICAgICAgICAgIyBzbyBub3cgd2UgYXJlIGF0IHRoZSBzd2l0Y2gncyBjbG9zZSBicmFjZSB3ZSBwb3Agb2ZmIGFueSBjYXNlL2RlZmF1bHQgdG9rZW5zXG4gICAgICAgICAgICAgICAgc3RhY2tPZlRva2Vuc1N0aWxsT3Blbi5wb3AoKVxuXG4gICAgICAgICAgICB0b2tlbk9uVGhpc0xpbmUgPSB0cnVlXG4gICAgICAgICAgICBpZiBpc0ZpcnN0VG9rZW5PZkxpbmVcbiAgICAgICAgICAgICAgc3RhY2tPZlRva2Vuc1N0aWxsT3Blbi5wdXNoIHBhcmVudFRva2VuSWR4ID0gc3RhY2tPZlRva2Vuc1N0aWxsT3Blbi5wb3AoKVxuICAgICAgICAgICAgICBpZiBwYXJlbnRUb2tlbklkeD9cbiAgICAgICAgICAgICAgICBpbmRlbnRSZWNhbGMgPSBAaW5kZW50Um93KHtyb3c6IHJvdywgYmxvY2tJbmRlbnQ6IHRva2VuU3RhY2tbcGFyZW50VG9rZW5JZHhdLmZpcnN0Q2hhckluZGVudGF0aW9uIH0pXG5cbiAgICAgICAgICAgICMgcmUtcGFyc2UgbGluZSBpZiBpbmRlbnQgZGlkIHNvbWV0aGluZyB0byBpdFxuICAgICAgICAgICAgaWYgaW5kZW50UmVjYWxjXG4gICAgICAgICAgICAgIGxpbmUgPSBAZWRpdG9yLmxpbmVUZXh0Rm9yQnVmZmVyUm93IHJvd1xuICAgICAgICAgICAgICBASlNYUkVHRVhQLmxhc3RJbmRleCA9IDAgI2ZvcmNlIHJlZ2V4IHRvIHN0YXJ0IGFnYWluXG4gICAgICAgICAgICAgIGNvbnRpbnVlXG5cbiAgICAgICAgICAgIGlzRmlyc3RUb2tlbk9mTGluZSA9IGZhbHNlXG5cbiAgICAgICAgICAgIHBhcmVudFRva2VuSWR4ID0gc3RhY2tPZlRva2Vuc1N0aWxsT3Blbi5wb3AoKVxuICAgICAgICAgICAgaWYgcGFyZW50VG9rZW5JZHg/XG4gICAgICAgICAgICAgIHRva2VuU3RhY2sucHVzaFxuICAgICAgICAgICAgICAgIHR5cGU6IHRva2VuXG4gICAgICAgICAgICAgICAgbmFtZTogJydcbiAgICAgICAgICAgICAgICByb3c6IHJvd1xuICAgICAgICAgICAgICAgIHBhcmVudFRva2VuSWR4OiBwYXJlbnRUb2tlbklkeCAgICAgICAgICMgcHRyIHRvIDx0YWdcbiAgICAgICAgICAgICAgaWYgcGFyZW50VG9rZW5JZHggPj0wIHRoZW4gdG9rZW5TdGFja1twYXJlbnRUb2tlbklkeF0udGVybXNUaGlzVGFnSWR4ID0gaWR4T2ZUb2tlblxuICAgICAgICAgICAgICBpZHhPZlRva2VuKytcblxuICAgICAgICAgICMgY2FzZSwgZGVmYXVsdCBzdGF0ZW1lbnQgb2Ygc3dpdGNoXG4gICAgICAgICAgd2hlbiBTV0lUQ0hfQ0FTRSwgU1dJVENIX0RFRkFVTFRcbiAgICAgICAgICAgIHRva2VuT25UaGlzTGluZSA9IHRydWVcbiAgICAgICAgICAgIGlzRmlyc3RUYWdPZkJsb2NrID0gdHJ1ZVxuICAgICAgICAgICAgaWYgaXNGaXJzdFRva2VuT2ZMaW5lXG4gICAgICAgICAgICAgIHN0YWNrT2ZUb2tlbnNTdGlsbE9wZW4ucHVzaCBwYXJlbnRUb2tlbklkeCA9IHN0YWNrT2ZUb2tlbnNTdGlsbE9wZW4ucG9wKClcbiAgICAgICAgICAgICAgaWYgcGFyZW50VG9rZW5JZHg/XG4gICAgICAgICAgICAgICAgaWYgdG9rZW5TdGFja1twYXJlbnRUb2tlbklkeF0udHlwZSBpcyBTV0lUQ0hfQ0FTRSBvciB0b2tlblN0YWNrW3BhcmVudFRva2VuSWR4XS50eXBlIGlzIFNXSVRDSF9ERUZBVUxUXG4gICAgICAgICAgICAgICAgICAjIHdlIG9ubHkgYWxsb3cgYSBzaW5nbGUgY2FzZS9kZWZhdWx0IHN0YWNrIGVsZW1lbnQgcGVyIHN3aXRjaCBpbnN0YW5jZVxuICAgICAgICAgICAgICAgICAgIyBzbyBwb3NpdGlvbiBuZXcgY2FzZS9kZWZhdWx0IHRvIHRoZSBsYXN0IG9uZXMgcG9zaXRpb24gYW5kIHRoZW4gcG9wIHRoZSBsYXN0J3NcbiAgICAgICAgICAgICAgICAgICMgb2ZmIHRoZSBzdGFjay5cbiAgICAgICAgICAgICAgICAgIGluZGVudFJlY2FsYyA9IEBpbmRlbnRSb3coe3Jvdzogcm93LCBibG9ja0luZGVudDogdG9rZW5TdGFja1twYXJlbnRUb2tlbklkeF0uZmlyc3RDaGFySW5kZW50YXRpb24gfSlcbiAgICAgICAgICAgICAgICAgIHN0YWNrT2ZUb2tlbnNTdGlsbE9wZW4ucG9wKClcbiAgICAgICAgICAgICAgICBlbHNlIGlmIHRva2VuU3RhY2tbcGFyZW50VG9rZW5JZHhdLnR5cGUgaXMgU1dJVENIX0JSQUNFX09QRU5cbiAgICAgICAgICAgICAgICAgIGluZGVudFJlY2FsYyA9IEBpbmRlbnRSb3coe3Jvdzogcm93LCBibG9ja0luZGVudDogdG9rZW5TdGFja1twYXJlbnRUb2tlbklkeF0uZmlyc3RDaGFySW5kZW50YXRpb24sIGpzeEluZGVudDogMSB9KVxuXG4gICAgICAgICAgICAjIHJlLXBhcnNlIGxpbmUgaWYgaW5kZW50IGRpZCBzb21ldGhpbmcgdG8gaXRcbiAgICAgICAgICAgIGlmIGluZGVudFJlY2FsY1xuICAgICAgICAgICAgICBsaW5lID0gQGVkaXRvci5saW5lVGV4dEZvckJ1ZmZlclJvdyByb3dcbiAgICAgICAgICAgICAgQEpTWFJFR0VYUC5sYXN0SW5kZXggPSAwICNmb3JjZSByZWdleCB0byBzdGFydCBhZ2FpblxuICAgICAgICAgICAgICBjb250aW51ZVxuXG4gICAgICAgICAgICBpc0ZpcnN0VG9rZW5PZkxpbmUgPSBmYWxzZVxuXG4gICAgICAgICAgICBzdGFja09mVG9rZW5zU3RpbGxPcGVuLnB1c2ggcGFyZW50VG9rZW5JZHggPSBzdGFja09mVG9rZW5zU3RpbGxPcGVuLnBvcCgpXG5cbiAgICAgICAgICAgIHRva2VuU3RhY2sucHVzaFxuICAgICAgICAgICAgICB0eXBlOiB0b2tlblxuICAgICAgICAgICAgICBuYW1lOiAnJ1xuICAgICAgICAgICAgICByb3c6IHJvd1xuICAgICAgICAgICAgICBmaXJzdFRhZ0luTGluZUluZGVudGF0aW9uOiBmaXJzdFRhZ0luTGluZUluZGVudGF0aW9uXG4gICAgICAgICAgICAgIHRva2VuSW5kZW50YXRpb246IHRva2VuSW5kZW50YXRpb25cbiAgICAgICAgICAgICAgZmlyc3RDaGFySW5kZW50YXRpb246IGZpcnN0Q2hhckluZGVudGF0aW9uXG4gICAgICAgICAgICAgIHBhcmVudFRva2VuSWR4OiBwYXJlbnRUb2tlbklkeFxuICAgICAgICAgICAgICB0ZXJtc1RoaXNUYWdzQXR0cmlidXRlc0lkeDogbnVsbCAgIyBwdHIgdG8gPiB0YWdcbiAgICAgICAgICAgICAgdGVybXNUaGlzVGFnSWR4OiBudWxsICAgICAgICAgICAgICMgcHRyIHRvIDwvdGFnPlxuXG4gICAgICAgICAgICBzdGFja09mVG9rZW5zU3RpbGxPcGVuLnB1c2ggaWR4T2ZUb2tlblxuICAgICAgICAgICAgaWR4T2ZUb2tlbisrXG5cbiAgICAgICAgICAjIFRlcm5hcnkgYW5kIGNvbmRpdGlvbmFsIGlmL2Vsc2Ugb3BlcmF0b3JzXG4gICAgICAgICAgd2hlbiBURVJOQVJZX0lGLCBKU19JRiwgSlNfRUxTRSwgSlNfUkVUVVJOXG4gICAgICAgICAgICBpc0ZpcnN0VGFnT2ZCbG9jayA9IHRydWVcblxuICAgICAgIyBoYW5kbGUgbGluZXMgd2l0aCBubyB0b2tlbiBvbiB0aGVtXG4gICAgICBpZiBpZHhPZlRva2VuIGFuZCBub3QgdG9rZW5PblRoaXNMaW5lXG4gICAgICAgICMgaW5kZW50IGxpbmVzIGJ1dCByZW1vdmUgYW55IGJsYW5rIGxpbmVzIHdpdGggd2hpdGUgc3BhY2UgZXhjZXB0IHRoZSBsYXN0IHJvd1xuICAgICAgICBpZiByb3cgaXNudCByYW5nZS5lbmQucm93XG4gICAgICAgICAgYmxhbmtMaW5lRW5kUG9zID0gL15cXHMqJC8uZXhlYyhAZWRpdG9yLmxpbmVUZXh0Rm9yQnVmZmVyUm93KHJvdykpP1swXS5sZW5ndGhcbiAgICAgICAgICBpZiBibGFua0xpbmVFbmRQb3M/XG4gICAgICAgICAgICBAaW5kZW50Um93KHtyb3c6IHJvdyAsIGJsb2NrSW5kZW50OiAwIH0pXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgQGluZGVudFVudG9rZW5pc2VkTGluZSByb3csIHRva2VuU3RhY2ssIHN0YWNrT2ZUb2tlbnNTdGlsbE9wZW5cbiAgICAgICAgZWxzZVxuICAgICAgICAgIEBpbmRlbnRVbnRva2VuaXNlZExpbmUgcm93LCB0b2tlblN0YWNrLCBzdGFja09mVG9rZW5zU3RpbGxPcGVuXG5cblxuICAjIGluZGVudCBhbnkgbGluZXMgdGhhdCBoYXZlbid0IGFueSBpbnRlcmVzdGluZyB0b2tlbnNcbiAgaW5kZW50VW50b2tlbmlzZWRMaW5lOiAocm93LCB0b2tlblN0YWNrLCBzdGFja09mVG9rZW5zU3RpbGxPcGVuICkgLT5cbiAgICBzdGFja09mVG9rZW5zU3RpbGxPcGVuLnB1c2ggcGFyZW50VG9rZW5JZHggPSBzdGFja09mVG9rZW5zU3RpbGxPcGVuLnBvcCgpXG4gICAgdG9rZW4gPSB0b2tlblN0YWNrW3BhcmVudFRva2VuSWR4XVxuICAgIHN3aXRjaCB0b2tlbi50eXBlXG4gICAgICB3aGVuIEpTWFRBR19PUEVOLCBKU1hUQUdfU0VMRkNMT1NFX1NUQVJUXG4gICAgICAgIGlmICB0b2tlbi50ZXJtc1RoaXNUYWdzQXR0cmlidXRlc0lkeCBpcyBudWxsXG4gICAgICAgICAgQGluZGVudFJvdyh7cm93OiByb3csIGJsb2NrSW5kZW50OiB0b2tlbi5maXJzdENoYXJJbmRlbnRhdGlvbiwganN4SW5kZW50UHJvcHM6IDEgfSlcbiAgICAgICAgZWxzZSBAaW5kZW50Um93KHtyb3c6IHJvdywgYmxvY2tJbmRlbnQ6IHRva2VuLmZpcnN0Q2hhckluZGVudGF0aW9uLCBqc3hJbmRlbnQ6IDEgfSlcbiAgICAgIHdoZW4gSlNYQlJBQ0VfT1BFTlxuICAgICAgICBAaW5kZW50Um93KHtyb3c6IHJvdywgYmxvY2tJbmRlbnQ6IHRva2VuLmZpcnN0Q2hhckluZGVudGF0aW9uLCBqc3hJbmRlbnQ6IDEgfSlcbiAgICAgIHdoZW4gQlJBQ0VfT1BFTiwgU1dJVENIX0JSQUNFX09QRU4sIFBBUkVOX09QRU5cbiAgICAgICAgQGluZGVudFJvdyh7cm93OiByb3csIGJsb2NrSW5kZW50OiB0b2tlbi5maXJzdENoYXJJbmRlbnRhdGlvbiwganN4SW5kZW50OiAxLCBhbGxvd0FkZGl0aW9uYWxJbmRlbnRzOiB0cnVlIH0pXG4gICAgICB3aGVuIEpTWFRBR19TRUxGQ0xPU0VfRU5ELCBKU1hCUkFDRV9DTE9TRSwgSlNYVEFHX0NMT1NFX0FUVFJTXG4gICAgICAgIEBpbmRlbnRSb3coe3Jvdzogcm93LCBibG9ja0luZGVudDogdG9rZW5TdGFja1t0b2tlbi5wYXJlbnRUb2tlbklkeF0uZmlyc3RDaGFySW5kZW50YXRpb24sIGpzeEluZGVudFByb3BzOiAxfSlcbiAgICAgIHdoZW4gQlJBQ0VfQ0xPU0UsIFNXSVRDSF9CUkFDRV9DTE9TRSwgUEFSRU5fQ0xPU0VcbiAgICAgICAgQGluZGVudFJvdyh7cm93OiByb3csIGJsb2NrSW5kZW50OiB0b2tlblN0YWNrW3Rva2VuLnBhcmVudFRva2VuSWR4XS5maXJzdENoYXJJbmRlbnRhdGlvbiwganN4SW5kZW50OiAxLCBhbGxvd0FkZGl0aW9uYWxJbmRlbnRzOiB0cnVlIH0pXG4gICAgICB3aGVuIFNXSVRDSF9DQVNFLCBTV0lUQ0hfREVGQVVMVFxuICAgICAgICBAaW5kZW50Um93KHtyb3c6IHJvdywgYmxvY2tJbmRlbnQ6IHRva2VuLmZpcnN0Q2hhckluZGVudGF0aW9uLCBqc3hJbmRlbnQ6IDEgfSlcblxuICAjIGdldCB0aGUgdG9rZW4gYXQgdGhlIGdpdmVuIG1hdGNoIHBvc2l0aW9uIG9yIHJldHVybiB0cnV0aHkgZmFsc2VcbiAgZ2V0VG9rZW46IChidWZmZXJSb3csIG1hdGNoKSAtPlxuICAgIHNjb3BlID0gQGVkaXRvci5zY29wZURlc2NyaXB0b3JGb3JCdWZmZXJQb3NpdGlvbihbYnVmZmVyUm93LCBtYXRjaC5pbmRleF0pLmdldFNjb3Blc0FycmF5KCkucG9wKClcbiAgICBpZiAncHVuY3R1YXRpb24uZGVmaW5pdGlvbi50YWcuanN4JyBpcyBzY29wZVxuICAgICAgaWYgICAgICBtYXRjaFsxXT8gdGhlbiByZXR1cm4gSlNYVEFHX09QRU5cbiAgICAgIGVsc2UgaWYgbWF0Y2hbM10/IHRoZW4gcmV0dXJuIEpTWFRBR19TRUxGQ0xPU0VfRU5EXG4gICAgZWxzZSBpZiAnSlNYRW5kVGFnU3RhcnQnIGlzIHNjb3BlXG4gICAgICBpZiBtYXRjaFs0XT8gdGhlbiByZXR1cm4gSlNYVEFHX0NMT1NFXG4gICAgZWxzZSBpZiAnSlNYU3RhcnRUYWdFbmQnIGlzIHNjb3BlXG4gICAgICBpZiBtYXRjaFs3XT8gdGhlbiByZXR1cm4gSlNYVEFHX0NMT1NFX0FUVFJTXG4gICAgZWxzZSBpZiBtYXRjaFs4XT9cbiAgICAgIGlmICdwdW5jdHVhdGlvbi5zZWN0aW9uLmVtYmVkZGVkLmJlZ2luLmpzeCcgaXMgc2NvcGVcbiAgICAgICAgcmV0dXJuIEpTWEJSQUNFX09QRU5cbiAgICAgIGVsc2UgaWYgJ21ldGEuYnJhY2UuY3VybHkuc3dpdGNoU3RhcnQuanMnIGlzIHNjb3BlXG4gICAgICAgIHJldHVybiBTV0lUQ0hfQlJBQ0VfT1BFTlxuICAgICAgZWxzZSBpZiAnbWV0YS5icmFjZS5jdXJseS5qcycgaXMgc2NvcGVcbiAgICAgICAgcmV0dXJuIEJSQUNFX09QRU5cbiAgICBlbHNlIGlmIG1hdGNoWzldP1xuICAgICAgaWYgJ3B1bmN0dWF0aW9uLnNlY3Rpb24uZW1iZWRkZWQuZW5kLmpzeCcgaXMgc2NvcGVcbiAgICAgICAgcmV0dXJuIEpTWEJSQUNFX0NMT1NFXG4gICAgICBlbHNlIGlmICdtZXRhLmJyYWNlLmN1cmx5LnN3aXRjaEVuZC5qcycgaXMgc2NvcGVcbiAgICAgICAgcmV0dXJuIFNXSVRDSF9CUkFDRV9DTE9TRVxuICAgICAgZWxzZSBpZiAnbWV0YS5icmFjZS5jdXJseS5qcycgaXMgc2NvcGVcbiAgICAgICAgcmV0dXJuIEJSQUNFX0NMT1NFXG4gICAgZWxzZSBpZiBtYXRjaFsxMF0/XG4gICAgICBpZiAna2V5d29yZC5vcGVyYXRvci50ZXJuYXJ5LmpzJyBpcyBzY29wZVxuICAgICAgICByZXR1cm4gVEVSTkFSWV9JRlxuICAgIGVsc2UgaWYgbWF0Y2hbMTFdP1xuICAgICAgaWYgJ2tleXdvcmQub3BlcmF0b3IudGVybmFyeS5qcycgaXMgc2NvcGVcbiAgICAgICAgcmV0dXJuIFRFUk5BUllfRUxTRVxuICAgIGVsc2UgaWYgbWF0Y2hbMTJdP1xuICAgICAgaWYgJ2tleXdvcmQuY29udHJvbC5jb25kaXRpb25hbC5qcycgaXMgc2NvcGVcbiAgICAgICAgcmV0dXJuIEpTX0lGXG4gICAgZWxzZSBpZiBtYXRjaFsxM10/XG4gICAgICBpZiAna2V5d29yZC5jb250cm9sLmNvbmRpdGlvbmFsLmpzJyBpcyBzY29wZVxuICAgICAgICByZXR1cm4gSlNfRUxTRVxuICAgIGVsc2UgaWYgbWF0Y2hbMTRdP1xuICAgICAgaWYgJ2tleXdvcmQuY29udHJvbC5zd2l0Y2guanMnIGlzIHNjb3BlXG4gICAgICAgIHJldHVybiBTV0lUQ0hfQ0FTRVxuICAgIGVsc2UgaWYgbWF0Y2hbMTVdP1xuICAgICAgaWYgJ2tleXdvcmQuY29udHJvbC5zd2l0Y2guanMnIGlzIHNjb3BlXG4gICAgICAgIHJldHVybiBTV0lUQ0hfREVGQVVMVFxuICAgIGVsc2UgaWYgbWF0Y2hbMTZdP1xuICAgICAgaWYgJ2tleXdvcmQuY29udHJvbC5mbG93LmpzJyBpcyBzY29wZVxuICAgICAgICByZXR1cm4gSlNfUkVUVVJOXG4gICAgZWxzZSBpZiBtYXRjaFsxN10/XG4gICAgICBpZiAnbWV0YS5icmFjZS5yb3VuZC5qcycgaXMgc2NvcGUgb3JcbiAgICAgICAnbWV0YS5icmFjZS5yb3VuZC5ncmFwaHFsJyBpcyBzY29wZSBvclxuICAgICAgICdtZXRhLmJyYWNlLnJvdW5kLmRpcmVjdGl2ZS5ncmFwaHFsJyBpcyBzY29wZVxuICAgICAgICAgIHJldHVybiBQQVJFTl9PUEVOXG4gICAgZWxzZSBpZiBtYXRjaFsxOF0/XG4gICAgICBpZiAnbWV0YS5icmFjZS5yb3VuZC5qcycgaXMgc2NvcGUgb3JcbiAgICAgICAnbWV0YS5icmFjZS5yb3VuZC5ncmFwaHFsJyBpcyBzY29wZSBvclxuICAgICAgICdtZXRhLmJyYWNlLnJvdW5kLmRpcmVjdGl2ZS5ncmFwaHFsJyBpcyBzY29wZVxuICAgICAgICAgIHJldHVybiBQQVJFTl9DTE9TRVxuICAgIHJldHVybiBOT19UT0tFTlxuXG5cbiAgIyBnZXQgaW5kZW50IG9mIHRoZSBwcmV2aW91cyByb3cgd2l0aCBjaGFycyBpbiBpdFxuICBnZXRJbmRlbnRPZlByZXZpb3VzUm93OiAocm93KSAtPlxuICAgIHJldHVybiAwIHVubGVzcyByb3dcbiAgICBmb3Igcm93IGluIFtyb3ctMS4uLjBdXG4gICAgICBsaW5lID0gQGVkaXRvci5saW5lVGV4dEZvckJ1ZmZlclJvdyByb3dcbiAgICAgIHJldHVybiBAZWRpdG9yLmluZGVudGF0aW9uRm9yQnVmZmVyUm93IHJvdyBpZiAgLy4qXFxTLy50ZXN0IGxpbmVcbiAgICByZXR1cm4gMFxuXG4gICMgZ2V0IGVzbGludCB0cmFuc2xhdGVkIGluZGVudCBvcHRpb25zXG4gIGdldEluZGVudE9wdGlvbnM6ICgpIC0+XG4gICAgaWYgbm90IEBhdXRvSnN4IHRoZW4gcmV0dXJuIEB0cmFuc2xhdGVJbmRlbnRPcHRpb25zKClcbiAgICBpZiBlc2xpbnRyY0ZpbGVuYW1lID0gQGdldEVzbGludHJjRmlsZW5hbWUoKVxuICAgICAgZXNsaW50cmNGaWxlbmFtZSA9IG5ldyBGaWxlKGVzbGludHJjRmlsZW5hbWUpXG4gICAgICBAdHJhbnNsYXRlSW5kZW50T3B0aW9ucyhAcmVhZEVzbGludHJjT3B0aW9ucyhlc2xpbnRyY0ZpbGVuYW1lLmdldFBhdGgoKSkpXG4gICAgZWxzZVxuICAgICAgQHRyYW5zbGF0ZUluZGVudE9wdGlvbnMoe30pICMgZ2V0IGRlZmF1bHRzXG5cbiAgIyByZXR1cm4gdGV4dCBzdHJpbmcgb2YgYSBwcm9qZWN0IGJhc2VkIC5lc2xpbnRyYyBmaWxlIGlmIG9uZSBleGlzdHNcbiAgZ2V0RXNsaW50cmNGaWxlbmFtZTogKCkgLT5cbiAgICBwcm9qZWN0Q29udGFpbmluZ1NvdXJjZSA9IGF0b20ucHJvamVjdC5yZWxhdGl2aXplUGF0aCBAZWRpdG9yLmdldFBhdGgoKVxuICAgICMgSXMgdGhlIHNvdXJjZUZpbGUgbG9jYXRlZCBpbnNpZGUgYW4gQXRvbSBwcm9qZWN0IGZvbGRlcj9cbiAgICBpZiBwcm9qZWN0Q29udGFpbmluZ1NvdXJjZVswXT9cbiAgICAgIHBhdGguam9pbiBwcm9qZWN0Q29udGFpbmluZ1NvdXJjZVswXSwgJy5lc2xpbnRyYydcblxuICAjIG1vdXNlIHN0YXRlXG4gIG9uTW91c2VEb3duOiAoKSA9PlxuICAgIEBtb3VzZVVwID0gZmFsc2VcblxuICAjIG1vdXNlIHN0YXRlXG4gIG9uTW91c2VVcDogKCkgPT5cbiAgICBAbW91c2VVcCA9IHRydWVcblxuICAjIHRvIGNyZWF0ZSBpbmRlbnRzLiBXZSBjYW4gcmVhZCBhbmQgcmV0dXJuIHRoZSBydWxlcyBwcm9wZXJ0aWVzIG9yIHVuZGVmaW5lZFxuICByZWFkRXNsaW50cmNPcHRpb25zOiAoZXNsaW50cmNGaWxlKSAtPlxuICAgICMgZ2V0IGxvY2FsIHBhdGggb3ZlcmlkZXNcbiAgICBpZiBmcy5leGlzdHNTeW5jIGVzbGludHJjRmlsZVxuICAgICAgZmlsZUNvbnRlbnQgPSBzdHJpcEpzb25Db21tZW50cyhmcy5yZWFkRmlsZVN5bmMoZXNsaW50cmNGaWxlLCAndXRmOCcpKVxuICAgICAgdHJ5XG4gICAgICAgIGVzbGludFJ1bGVzID0gKFlBTUwuc2FmZUxvYWQgZmlsZUNvbnRlbnQpLnJ1bGVzXG4gICAgICAgIGlmIGVzbGludFJ1bGVzIHRoZW4gcmV0dXJuIGVzbGludFJ1bGVzXG4gICAgICBjYXRjaCBlcnJcbiAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yIFwiTEI6IEVycm9yIHJlYWRpbmcgLmVzbGludHJjIGF0ICN7ZXNsaW50cmNGaWxlfVwiLFxuICAgICAgICAgIGRpc21pc3NhYmxlOiB0cnVlXG4gICAgICAgICAgZGV0YWlsOiBcIiN7ZXJyLm1lc3NhZ2V9XCJcbiAgICByZXR1cm4ge31cblxuICAjIHVzZSBlc2xpbnQgcmVhY3QgZm9ybWF0IGRlc2NyaWJlZCBhdCBodHRwOi8vdGlueXVybC5jb20vcDRtdGF0dlxuICAjIHR1cm4gc3BhY2VzIGludG8gdGFiIGRpbWVuc2lvbnMgd2hpY2ggY2FuIGJlIGRlY2ltYWxcbiAgIyBhIGVtcHR5IG9iamVjdCBhcmd1bWVudCBwYXJzZXMgYmFjayB0aGUgZGVmYXVsdCBzZXR0aW5nc1xuICB0cmFuc2xhdGVJbmRlbnRPcHRpb25zOiAoZXNsaW50UnVsZXMpIC0+XG4gICAgIyBFc2xpbnQgcnVsZXMgdG8gdXNlIGFzIGRlZmF1bHQgb3ZlcmlkZGVuIGJ5IC5lc2xpbnRyY1xuICAgICMgTi5CLiB0aGF0IHRoaXMgaXMgbm90IHRoZSBzYW1lIGFzIHRoZSBlc2xpbnQgcnVsZXMgaW4gdGhhdFxuICAgICMgdGhlIHRhYi1zcGFjZXMgYW5kICd0YWIncyBpbiBlc2xpbnRyYyBhcmUgY29udmVydGVkIHRvIHRhYnMgYmFzZWQgdXBvblxuICAgICMgdGhlIEF0b20gZWRpdG9yIHRhYiBzcGFjaW5nLlxuICAgICMgZS5nLiBlc2xpbnQgaW5kZW50IFsxLDRdIHdpdGggYW4gQXRvbSB0YWIgc3BhY2luZyBvZiAyIGJlY29tZXMgaW5kZW50IFsxLDJdXG4gICAgZXNsaW50SW5kZW50T3B0aW9ucyAgPVxuICAgICAganN4SW5kZW50OiBbMSwxXSAgICAgICAgICAgICMgMSA9IGVuYWJsZWQsIDE9I3RhYnNcbiAgICAgIGpzeEluZGVudFByb3BzOiBbMSwxXSAgICAgICAjIDEgPSBlbmFibGVkLCAxPSN0YWJzXG4gICAgICBqc3hDbG9zaW5nQnJhY2tldExvY2F0aW9uOiBbXG4gICAgICAgIDEsXG4gICAgICAgIHNlbGZDbG9zaW5nOiBUQUdBTElHTkVEXG4gICAgICAgIG5vbkVtcHR5OiBUQUdBTElHTkVEXG4gICAgICBdXG5cbiAgICByZXR1cm4gZXNsaW50SW5kZW50T3B0aW9ucyB1bmxlc3MgdHlwZW9mIGVzbGludFJ1bGVzIGlzIFwib2JqZWN0XCJcblxuICAgIEVTX0RFRkFVTFRfSU5ERU5UID0gNCAjIGRlZmF1bHQgZXNsaW50IGluZGVudCBhcyBzcGFjZXNcblxuICAgICMgcmVhZCBpbmRlbnQgaWYgaXQgZXhpc3RzIGFuZCB1c2UgaXQgYXMgdGhlIGRlZmF1bHQgaW5kZW50IGZvciBKU1hcbiAgICBydWxlID0gZXNsaW50UnVsZXNbJ2luZGVudCddXG4gICAgaWYgdHlwZW9mIHJ1bGUgaXMgJ251bWJlcicgb3IgdHlwZW9mIHJ1bGUgaXMgJ3N0cmluZydcbiAgICAgIGRlZmF1bHRJbmRlbnQgID0gRVNfREVGQVVMVF9JTkRFTlQgLyBAZWRpdG9yLmdldFRhYkxlbmd0aCgpXG4gICAgZWxzZSBpZiB0eXBlb2YgcnVsZSBpcyAnb2JqZWN0J1xuICAgICAgaWYgdHlwZW9mIHJ1bGVbMV0gaXMgJ251bWJlcidcbiAgICAgICAgZGVmYXVsdEluZGVudCAgPSBydWxlWzFdIC8gQGVkaXRvci5nZXRUYWJMZW5ndGgoKVxuICAgICAgZWxzZSBkZWZhdWx0SW5kZW50ICA9IDFcbiAgICBlbHNlIGRlZmF1bHRJbmRlbnQgID0gMVxuXG4gICAgcnVsZSA9IGVzbGludFJ1bGVzWydyZWFjdC9qc3gtaW5kZW50J11cbiAgICBpZiB0eXBlb2YgcnVsZSBpcyAnbnVtYmVyJyBvciB0eXBlb2YgcnVsZSBpcyAnc3RyaW5nJ1xuICAgICAgZXNsaW50SW5kZW50T3B0aW9ucy5qc3hJbmRlbnRbMF0gPSBydWxlXG4gICAgICBlc2xpbnRJbmRlbnRPcHRpb25zLmpzeEluZGVudFsxXSA9IEVTX0RFRkFVTFRfSU5ERU5UIC8gQGVkaXRvci5nZXRUYWJMZW5ndGgoKVxuICAgIGVsc2UgaWYgdHlwZW9mIHJ1bGUgaXMgJ29iamVjdCdcbiAgICAgIGVzbGludEluZGVudE9wdGlvbnMuanN4SW5kZW50WzBdID0gcnVsZVswXVxuICAgICAgaWYgdHlwZW9mIHJ1bGVbMV0gaXMgJ251bWJlcidcbiAgICAgICAgZXNsaW50SW5kZW50T3B0aW9ucy5qc3hJbmRlbnRbMV0gPSBydWxlWzFdIC8gQGVkaXRvci5nZXRUYWJMZW5ndGgoKVxuICAgICAgZWxzZSBlc2xpbnRJbmRlbnRPcHRpb25zLmpzeEluZGVudFsxXSA9IDFcbiAgICBlbHNlIGVzbGludEluZGVudE9wdGlvbnMuanN4SW5kZW50WzFdID0gZGVmYXVsdEluZGVudFxuXG4gICAgcnVsZSA9IGVzbGludFJ1bGVzWydyZWFjdC9qc3gtaW5kZW50LXByb3BzJ11cbiAgICBpZiB0eXBlb2YgcnVsZSBpcyAnbnVtYmVyJyBvciB0eXBlb2YgcnVsZSBpcyAnc3RyaW5nJ1xuICAgICAgZXNsaW50SW5kZW50T3B0aW9ucy5qc3hJbmRlbnRQcm9wc1swXSA9IHJ1bGVcbiAgICAgIGVzbGludEluZGVudE9wdGlvbnMuanN4SW5kZW50UHJvcHNbMV0gPSBFU19ERUZBVUxUX0lOREVOVCAvIEBlZGl0b3IuZ2V0VGFiTGVuZ3RoKClcbiAgICBlbHNlIGlmIHR5cGVvZiBydWxlIGlzICdvYmplY3QnXG4gICAgICBlc2xpbnRJbmRlbnRPcHRpb25zLmpzeEluZGVudFByb3BzWzBdID0gcnVsZVswXVxuICAgICAgaWYgdHlwZW9mIHJ1bGVbMV0gaXMgJ251bWJlcidcbiAgICAgICAgZXNsaW50SW5kZW50T3B0aW9ucy5qc3hJbmRlbnRQcm9wc1sxXSA9IHJ1bGVbMV0gLyBAZWRpdG9yLmdldFRhYkxlbmd0aCgpXG4gICAgICBlbHNlIGVzbGludEluZGVudE9wdGlvbnMuanN4SW5kZW50UHJvcHNbMV0gPSAxXG4gICAgZWxzZSBlc2xpbnRJbmRlbnRPcHRpb25zLmpzeEluZGVudFByb3BzWzFdID0gZGVmYXVsdEluZGVudFxuXG4gICAgcnVsZSA9IGVzbGludFJ1bGVzWydyZWFjdC9qc3gtY2xvc2luZy1icmFja2V0LWxvY2F0aW9uJ11cbiAgICBlc2xpbnRJbmRlbnRPcHRpb25zLmpzeENsb3NpbmdCcmFja2V0TG9jYXRpb25bMV0uc2VsZkNsb3NpbmcgPSBUQUdBTElHTkVEXG4gICAgZXNsaW50SW5kZW50T3B0aW9ucy5qc3hDbG9zaW5nQnJhY2tldExvY2F0aW9uWzFdLm5vbkVtcHR5ID0gVEFHQUxJR05FRFxuICAgIGlmIHR5cGVvZiBydWxlIGlzICdudW1iZXInIG9yIHR5cGVvZiBydWxlIGlzICdzdHJpbmcnXG4gICAgICBlc2xpbnRJbmRlbnRPcHRpb25zLmpzeENsb3NpbmdCcmFja2V0TG9jYXRpb25bMF0gPSBydWxlXG4gICAgZWxzZSBpZiB0eXBlb2YgcnVsZSBpcyAnb2JqZWN0JyAjIGFycmF5XG4gICAgICBlc2xpbnRJbmRlbnRPcHRpb25zLmpzeENsb3NpbmdCcmFja2V0TG9jYXRpb25bMF0gPSBydWxlWzBdXG4gICAgICBpZiB0eXBlb2YgcnVsZVsxXSBpcyAnc3RyaW5nJ1xuICAgICAgICBlc2xpbnRJbmRlbnRPcHRpb25zLmpzeENsb3NpbmdCcmFja2V0TG9jYXRpb25bMV0uc2VsZkNsb3NpbmcgPVxuICAgICAgICAgIGVzbGludEluZGVudE9wdGlvbnMuanN4Q2xvc2luZ0JyYWNrZXRMb2NhdGlvblsxXS5ub25FbXB0eSA9XG4gICAgICAgICAgICBydWxlWzFdXG4gICAgICBlbHNlXG4gICAgICAgIGlmIHJ1bGVbMV0uc2VsZkNsb3Npbmc/XG4gICAgICAgICAgZXNsaW50SW5kZW50T3B0aW9ucy5qc3hDbG9zaW5nQnJhY2tldExvY2F0aW9uWzFdLnNlbGZDbG9zaW5nID0gcnVsZVsxXS5zZWxmQ2xvc2luZ1xuICAgICAgICBpZiBydWxlWzFdLm5vbkVtcHR5P1xuICAgICAgICAgIGVzbGludEluZGVudE9wdGlvbnMuanN4Q2xvc2luZ0JyYWNrZXRMb2NhdGlvblsxXS5ub25FbXB0eSA9IHJ1bGVbMV0ubm9uRW1wdHlcblxuICAgIHJldHVybiBlc2xpbnRJbmRlbnRPcHRpb25zXG5cbiAgIyBhbGxpZ24gbm9uRW1wdHkgYW5kIHNlbGZDbG9zaW5nIHRhZ3MgYmFzZWQgb24gZXNsaW50IHJ1bGVzXG4gICMgcm93IHRvIGJlIGluZGVudGVkIGJhc2VkIHVwb24gYSBwYXJlbnRUYWdzIHByb3BlcnRpZXMgYW5kIGEgcnVsZSB0eXBlXG4gICMgcmV0dXJucyBpbmRlbnRSb3cncyByZXR1cm4gdmFsdWVcbiAgaW5kZW50Rm9yQ2xvc2luZ0JyYWNrZXQ6ICggcm93LCBwYXJlbnRUYWcsIGNsb3NpbmdCcmFja2V0UnVsZSApIC0+XG4gICAgaWYgQGVzbGludEluZGVudE9wdGlvbnMuanN4Q2xvc2luZ0JyYWNrZXRMb2NhdGlvblswXVxuICAgICAgaWYgY2xvc2luZ0JyYWNrZXRSdWxlIGlzIFRBR0FMSUdORURcbiAgICAgICAgQGluZGVudFJvdyh7cm93OiByb3csIGJsb2NrSW5kZW50OiBwYXJlbnRUYWcudG9rZW5JbmRlbnRhdGlvbn0pXG4gICAgICBlbHNlIGlmIGNsb3NpbmdCcmFja2V0UnVsZSBpcyBMSU5FQUxJR05FRFxuICAgICAgICBAaW5kZW50Um93KHtyb3c6IHJvdywgYmxvY2tJbmRlbnQ6IHBhcmVudFRhZy5maXJzdENoYXJJbmRlbnRhdGlvbiB9KVxuICAgICAgZWxzZSBpZiBjbG9zaW5nQnJhY2tldFJ1bGUgaXMgQUZURVJQUk9QU1xuICAgICAgICAjIHRoaXMgcmVhbGx5IGlzbid0IHZhbGlkIGFzIHRoaXMgdGFnIHNob3VsZG4ndCBiZSBvbiBhIGxpbmUgYnkgaXRzZWxmXG4gICAgICAgICMgYnV0IEkgZG9uJ3QgcmVmb3JtYXQgbGluZXMganVzdCBpbmRlbnQhXG4gICAgICAgICMgaW5kZW50IHRvIG1ha2UgaXQgbG9vayBPSyBhbHRob3VnaCBpdCB3aWxsIGZhaWwgZXNsaW50XG4gICAgICAgIGlmIEBlc2xpbnRJbmRlbnRPcHRpb25zLmpzeEluZGVudFByb3BzWzBdXG4gICAgICAgICAgQGluZGVudFJvdyh7cm93OiByb3csICBibG9ja0luZGVudDogcGFyZW50VGFnLmZpcnN0Q2hhckluZGVudGF0aW9uLCBqc3hJbmRlbnRQcm9wczogMSB9KVxuICAgICAgICBlbHNlXG4gICAgICAgICAgQGluZGVudFJvdyh7cm93OiByb3csICBibG9ja0luZGVudDogcGFyZW50VGFnLmZpcnN0Q2hhckluZGVudGF0aW9ufSlcbiAgICAgIGVsc2UgaWYgY2xvc2luZ0JyYWNrZXRSdWxlIGlzIFBST1BTQUxJR05FRFxuICAgICAgICBpZiBAZXNsaW50SW5kZW50T3B0aW9ucy5qc3hJbmRlbnRQcm9wc1swXVxuICAgICAgICAgIEBpbmRlbnRSb3coe3Jvdzogcm93LCAgYmxvY2tJbmRlbnQ6IHBhcmVudFRhZy5maXJzdENoYXJJbmRlbnRhdGlvbixqc3hJbmRlbnRQcm9wczogMX0pXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBAaW5kZW50Um93KHtyb3c6IHJvdywgIGJsb2NrSW5kZW50OiBwYXJlbnRUYWcuZmlyc3RDaGFySW5kZW50YXRpb259KVxuXG4gICMgaW5kZW50IGEgcm93IGJ5IHRoZSBhZGRpdGlvbiBvZiBvbmUgb3IgbW9yZSBpbmRlbnRzLlxuICAjIHJldHVybnMgZmFsc2UgaWYgbm8gaW5kZW50IHJlcXVpcmVkIGFzIGl0IGlzIGFscmVhZHkgY29ycmVjdFxuICAjIHJldHVybiB0cnVlIGlmIGluZGVudCB3YXMgcmVxdWlyZWRcbiAgIyBibG9ja0luZGVudCBpcyB0aGUgaW5kZW50IHRvIHRoZSBzdGFydCBvZiB0aGlzIGxvZ2ljYWwganN4IGJsb2NrXG4gICMgb3RoZXIgaW5kZW50cyBhcmUgdGhlIHJlcXVpcmVkIGluZGVudCBiYXNlZCBvbiBlc2xpbnQgY29uZGl0aW9ucyBmb3IgUmVhY3RcbiAgIyBvcHRpb24gY29udGFpbnMgcm93IHRvIGluZGVudCBhbmQgYWxsb3dBZGRpdGlvbmFsSW5kZW50cyBmbGFnXG4gIGluZGVudFJvdzogKG9wdGlvbnMpIC0+XG4gICAgeyByb3csIGFsbG93QWRkaXRpb25hbEluZGVudHMsIGJsb2NrSW5kZW50LCBqc3hJbmRlbnQsIGpzeEluZGVudFByb3BzIH0gPSBvcHRpb25zXG4gICAgIyBjYWxjIG92ZXJhbGwgaW5kZW50XG4gICAgaWYganN4SW5kZW50XG4gICAgICBpZiBAZXNsaW50SW5kZW50T3B0aW9ucy5qc3hJbmRlbnRbMF1cbiAgICAgICAgaWYgQGVzbGludEluZGVudE9wdGlvbnMuanN4SW5kZW50WzFdXG4gICAgICAgICAgYmxvY2tJbmRlbnQgKz0ganN4SW5kZW50ICogQGVzbGludEluZGVudE9wdGlvbnMuanN4SW5kZW50WzFdXG4gICAgaWYganN4SW5kZW50UHJvcHNcbiAgICAgIGlmIEBlc2xpbnRJbmRlbnRPcHRpb25zLmpzeEluZGVudFByb3BzWzBdXG4gICAgICAgIGlmIEBlc2xpbnRJbmRlbnRPcHRpb25zLmpzeEluZGVudFByb3BzWzFdXG4gICAgICAgICAgYmxvY2tJbmRlbnQgKz0ganN4SW5kZW50UHJvcHMgKiBAZXNsaW50SW5kZW50T3B0aW9ucy5qc3hJbmRlbnRQcm9wc1sxXVxuICAgICMgYWxsb3dBZGRpdGlvbmFsSW5kZW50cyBhbGxvd3MgaW5kZW50cyB0byBiZSBncmVhdGVyIHRoYW4gdGhlIG1pbmltdW1cbiAgICAjIHVzZWQgd2hlcmUgaXRlbXMgYXJlIGFsaWduZWQgYnV0IG5vIGVzbGludCBydWxlcyBhcmUgYXBwbGljYWJsZVxuICAgICMgc28gdXNlciBoYXMgc29tZSBkaXNjcmV0aW9uIGluIGFkZGluZyBtb3JlIGluZGVudHNcbiAgICBpZiBhbGxvd0FkZGl0aW9uYWxJbmRlbnRzXG4gICAgICBpZiBAZWRpdG9yLmluZGVudGF0aW9uRm9yQnVmZmVyUm93KHJvdykgPCBibG9ja0luZGVudFxuICAgICAgICBAZWRpdG9yLnNldEluZGVudGF0aW9uRm9yQnVmZmVyUm93IHJvdywgYmxvY2tJbmRlbnQsIHsgcHJlc2VydmVMZWFkaW5nV2hpdGVzcGFjZTogZmFsc2UgfVxuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgIGVsc2VcbiAgICAgIGlmIEBlZGl0b3IuaW5kZW50YXRpb25Gb3JCdWZmZXJSb3cocm93KSBpc250IGJsb2NrSW5kZW50XG4gICAgICAgIEBlZGl0b3Iuc2V0SW5kZW50YXRpb25Gb3JCdWZmZXJSb3cgcm93LCBibG9ja0luZGVudCwgeyBwcmVzZXJ2ZUxlYWRpbmdXaGl0ZXNwYWNlOiBmYWxzZSB9XG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgcmV0dXJuIGZhbHNlXG4iXX0=
