(function() {
  var CompositeDisposable, SubAtom, TypescriptImport;

  SubAtom = require('sub-atom');

  CompositeDisposable = require('atom').CompositeDisposable;

  module.exports = TypescriptImport = {
    modalPanel: null,
    subscriptions: null,
    activate: function(state) {
      this.subscriptions = new CompositeDisposable;
      this.subscriptions.add(atom.commands.add('atom-workspace', {
        'typescript-import:insert': (function(_this) {
          return function() {
            return _this.insert();
          };
        })(this)
      }));
      this.subscriptions.add(atom.commands.add('atom-workspace', {
        'typescript-import:build-index': (function(_this) {
          return function() {
            return _this.buildIndex();
          };
        })(this)
      }));
      this.subscriptions.add(atom.commands.add('atom-workspace', {
        'typescript-import:go-to-declaration': (function(_this) {
          return function() {
            return _this.goToDeclaration();
          };
        })(this)
      }));
      this.index = state || {};
      this.sub = new SubAtom();
      return this.sub.add(atom.workspace.observeTextEditors((function(_this) {
        return function(editor) {
          return _this.bindEvent(editor);
        };
      })(this)));
    },
    bindEvent: function(editor) {
      var editorView;
      console.log('bound event');
      editorView = atom.views.getView(editor);
      return this.sub.add(editorView, 'click', (function(_this) {
        return function(e) {
          if (e.metaKey || e.ctrlKey) {
            return _this.goToDeclaration();
          }
        };
      })(this));
    },
    deactivate: function() {
      this.modalPanel.destroy();
      return this.subscriptions.dispose();
    },
    serialize: function() {
      return this.index;
    },
    goToDeclaration: function() {
      var editor, position, selection, symbol;
      editor = atom.workspace.getActiveTextEditor();
      position = editor.getCursorBufferPosition();
      editor.selectWordsContainingCursors();
      selection = editor.getSelectedText().trim();
      editor.setCursorBufferPosition(position);
      symbol = this.index[selection];
      if (symbol && selection) {
        return atom.workspace.open(symbol.path);
      } else {
        return atom.commands.dispatch(document.querySelector('atom-text-editor'), 'typescript:go-to-declaration');
      }
    },
    addImportStatement: function(importStatement) {
      var currentPosition, currentText, editor, importMatches, lastImport, lastReference, referencesMatches, useStrict, useStrictMatche;
      editor = atom.workspace.getActiveTextEditor();
      currentText = editor.getText();
      if (currentText.indexOf(importStatement) >= 0) {
        return atom.notifications.addWarning('Import already defined.');
      } else {
        currentPosition = editor.getCursorBufferPosition();
        importMatches = currentText.match(/import\s*\w*\s*from.*\n/g);
        referencesMatches = currentText.match(/\/\/\/\s*<reference\s*path.*\/>\n/g);
        useStrictMatche = currentText.match(/.*[\'\"]use strict[\'\"].*/);
        if (importMatches) {
          lastImport = importMatches.pop();
          currentText = currentText.replace(lastImport, lastImport + importStatement);
        } else if (referencesMatches) {
          lastReference = referencesMatches.pop();
          currentText = currentText.replace(lastReference, lastReference + '\n' + importStatement);
        } else if (useStrictMatche) {
          useStrict = useStrictMatche.pop();
          currentText = currentText.replace(useStrict, useStrict + '\n' + importStatement);
        } else {
          currentText = importStatement + currentText;
        }
        editor.setText(currentText);
        currentPosition.row++;
        return editor.setCursorBufferPosition(currentPosition);
      }
    },
    insert: function() {
      var defaultImport, editor, fileFolder, filePath, importClause, location, os, path, position, relative, selection, symbol;
      this.buildIndex();
      this.bindEvent();
      os = require('os');
      path = require('path');
      editor = atom.workspace.getActiveTextEditor();
      position = editor.getCursorBufferPosition();
      editor.selectWordsContainingCursors();
      selection = editor.getSelectedText().trim();
      filePath = editor.getPath();
      symbol = this.index[selection];
      if (symbol && selection) {
        location = symbol.path;
        defaultImport = symbol.defaultImport;
        fileFolder = path.resolve(filePath + '/..');
        relative = path.relative(fileFolder, location).replace(/\.(jsx?|tsx?)$/, '');
        if (os.platform() === 'win32') {
          relative = relative.split(path.sep).join('/');
        }
        if (defaultImport) {
          importClause = "import " + selection + " from './" + relative + "';\n";
        } else {
          importClause = "import {" + selection + "} from './" + relative + "';\n";
        }
        return this.addImportStatement(importClause);
      } else {
        return atom.notifications.addError('Symbol ' + selection + ' not found.');
      }
    },
    buildIndex: function() {
      var index, searchPaths, symbolPattern, symbolPatternNoDefault;
      index = this.index;
      searchPaths = ['**/*.ts', '**/*.js', '**/*.tsx', '**/*.jsx'];
      symbolPattern = /export\s*default\s*(class|interface|namespace|enum|const|function)?\s*(([a-zA-Z0-9])*)/;
      atom.workspace.scan(symbolPattern, {
        paths: searchPaths
      }, function(result) {
        var i, len, rawSymbol, ref, res, results, symbol;
        ref = result.matches;
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          res = ref[i];
          rawSymbol = res.matchText;
          symbol = rawSymbol.match(symbolPattern)[2];
          results.push(index[symbol] = {
            path: result.filePath,
            defaultImport: true
          });
        }
        return results;
      });
      symbolPatternNoDefault = /export *(class|interface|namespace|enum|const|function)?\s*(([a-zA-Z0-9])*)/;
      return atom.workspace.scan(symbolPatternNoDefault, {
        paths: searchPaths
      }, function(result) {
        var i, len, rawSymbol, ref, res, results, symbol;
        ref = result.matches;
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          res = ref[i];
          rawSymbol = res.matchText;
          symbol = rawSymbol.match(symbolPatternNoDefault)[2];
          results.push(index[symbol] = {
            path: result.filePath,
            defaultImport: false
          });
        }
        return results;
      });
    },
    getIndex: function() {
      return this.index;
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvc2VwaXJvcGh0Ly5hdG9tL3BhY2thZ2VzL3R5cGVzY3JpcHQtbW9kdWxlcy1oZWxwZXIvbGliL3R5cGVzY3JpcHQtaW1wb3J0LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsT0FBQSxHQUFVLE9BQUEsQ0FBUSxVQUFSOztFQUVULHNCQUF1QixPQUFBLENBQVEsTUFBUjs7RUFFeEIsTUFBTSxDQUFDLE9BQVAsR0FBaUIsZ0JBQUEsR0FDZjtJQUFBLFVBQUEsRUFBWSxJQUFaO0lBQ0EsYUFBQSxFQUFlLElBRGY7SUFHQSxRQUFBLEVBQVUsU0FBQyxLQUFEO01BRVIsSUFBQyxDQUFBLGFBQUQsR0FBaUIsSUFBSTtNQUdyQixJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFkLENBQWtCLGdCQUFsQixFQUFvQztRQUFBLDBCQUFBLEVBQTRCLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7bUJBQUcsS0FBQyxDQUFBLE1BQUQsQ0FBQTtVQUFIO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE1QjtPQUFwQyxDQUFuQjtNQUNBLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0IsZ0JBQWxCLEVBQW9DO1FBQUEsK0JBQUEsRUFBaUMsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQTttQkFBRyxLQUFDLENBQUEsVUFBRCxDQUFBO1VBQUg7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWpDO09BQXBDLENBQW5CO01BQ0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQixnQkFBbEIsRUFBb0M7UUFBQSxxQ0FBQSxFQUF1QyxDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFBO21CQUFHLEtBQUMs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QSxNQUFBLENBQU4sR0FBZ0I7WUFBRSxJQUFBLEVBQU0sTUFBTSxDQUFDLFFBQWY7WUFBeUIsYUFBQSxFQUFlLElBQXhDOztBQUhsQjs7TUFEdUQsQ0FBM0Q7TUFNQSxzQkFBQSxHQUF5QjthQUN6QixJQUFJLENBQUMsU0FBUyxDQUFDLElBQWYsQ0FBb0Isc0JBQXBCLEVBQTRDO1FBQUUsS0FBQSxFQUFPLFdBQVQ7T0FBNUMsRUFBb0UsU0FBQyxNQUFEO0FBQ2hFLFlBQUE7QUFBQTtBQUFBO2FBQUEscUNBQUE7O1VBQ0UsU0FBQSxHQUFZLEdBQUcsQ0FBQztVQUNoQixNQUFBLEdBQVMsU0FBUyxDQUFDLEtBQVYsQ0FBZ0Isc0JBQWhCLENBQXdDLENBQUEsQ0FBQTt1QkFDakQsS0FBTSxDQUFBLE1BQUEsQ0FBTixHQUFnQjtZQUFFLElBQUEsRUFBTSxNQUFNLENBQUMsUUFBZjtZQUF5QixhQUFBLEVBQWUsS0FBeEM7O0FBSGxCOztNQURnRSxDQUFwRTtJQVhVLENBM0daO0lBNEhBLFFBQUEsRUFBVSxTQUFBO2FBQ1IsSUFBQyxDQUFBO0lBRE8sQ0E1SFY7O0FBTEYiLCJzb3VyY2VzQ29udGVudCI6WyJTdWJBdG9tID0gcmVxdWlyZSAnc3ViLWF0b20nO1xuXG57Q29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlICdhdG9tJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IFR5cGVzY3JpcHRJbXBvcnQgPVxuICBtb2RhbFBhbmVsOiBudWxsXG4gIHN1YnNjcmlwdGlvbnM6IG51bGxcblxuICBhY3RpdmF0ZTogKHN0YXRlKSAtPlxuICAgICMgRXZlbnRzIHN1YnNjcmliZWQgdG8gaW4gYXRvbSdzIHN5c3RlbSBjYW4gYmUgZWFzaWx5IGNsZWFuZWQgdXAgd2l0aCBhIENvbXBvc2l0ZURpc3Bvc2FibGVcbiAgICBAc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG5cbiAgICAjIFJlZ2lzdGVyIGNvbW1hbmQgdGhhdCB0b2dnbGVzIHRoaXMgdmlld1xuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS13b3Jrc3BhY2UnLCAndHlwZXNjcmlwdC1pbXBvcnQ6aW5zZXJ0JzogPT4gQGluc2VydCgpXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29tbWFuZHMuYWRkICdhdG9tLXdvcmtzcGFjZScsICd0eXBlc2NyaXB0LWltcG9ydDpidWlsZC1pbmRleCc6ID0+IEBidWlsZEluZGV4KClcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb21tYW5kcy5hZGQgJ2F0b20td29ya3NwYWNlJywgJ3R5cGVzY3JpcHQtaW1wb3J0OmdvLXRvLWRlY2xhcmF0aW9uJzogPT4gQGdvVG9EZWNsYXJhdGlvbigpXG5cbiAgICBAaW5kZXggPSBzdGF0ZSB8fCB7fTtcbiAgICBAc3ViID0gbmV3IFN1YkF0b20oKVxuICAgICNiaW5kRXZlbnQgPSBAYmluZEV2ZW50XG4gICAgQHN1Yi5hZGQoYXRvbS53b3Jrc3BhY2Uub2JzZXJ2ZVRleHRFZGl0b3JzKChlZGl0b3IpID0+XG4gICAgICAgIEBiaW5kRXZlbnQoZWRpdG9yKVxuICAgICkpXG5cbiAgYmluZEV2ZW50OiAoZWRpdG9yKSAtPlxuICAgIGNvbnNvbGUubG9nKCdib3VuZCBldmVudCcpXG4gICAgZWRpdG9yVmlldyA9IGF0b20udmlld3MuZ2V0VmlldyhlZGl0b3IpXG4jICAgIGVkaXRvclZpZXcub24gJ2NsaWNrLmF0b20taGFjaycsKGUpPT5cbiMgICAgICBjb25zb2xlLmxvZyAoZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCkpXG5cbiAgICBAc3ViLmFkZChlZGl0b3JWaWV3LCAnY2xpY2snLCAoZSkgPT5cbiAgICAgIGlmIChlLm1ldGFLZXkgfHwgZS5jdHJsS2V5KVxuICAgICAgICBAZ29Ub0RlY2xhcmF0aW9uKClcbiAgICApXG5cblxuICBkZWFjdGl2YXRlOiAtPlxuICAgIEBtb2RhbFBhbmVsLmRlc3Ryb3koKVxuICAgIEBzdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuXG4gIHNlcmlhbGl6ZTogLT5cbiAgICBAaW5kZXhcblxuICBnb1RvRGVjbGFyYXRpb246IC0+XG4gICAgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgcG9zaXRpb24gPSBlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKTtcbiAgICBlZGl0b3Iuc2VsZWN0V29yZHNDb250YWluaW5nQ3Vyc29ycygpO1xuICAgIHNlbGVjdGlvbiA9IGVkaXRvci5nZXRTZWxlY3RlZFRleHQoKS50cmltKClcbiAgICBlZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24ocG9zaXRpb24pO1xuICAgIHN5bWJvbCA9IEBpbmRleFtzZWxlY3Rpb25dXG4gICAgaWYgc3ltYm9sIGFuZCBzZWxlY3Rpb25cbiAgICAgIGF0b20ud29ya3NwYWNlLm9wZW4oc3ltYm9sLnBhdGgpXG4gICAgZWxzZVxuICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdhdG9tLXRleHQtZWRpdG9yJyksICd0eXBlc2NyaXB0OmdvLXRvLWRlY2xhcmF0aW9uJylcblxuXG4gIGFkZEltcG9ydFN0YXRlbWVudDogKGltcG9ydFN0YXRlbWVudCkgLT5cbiAgICAgIGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgICAgY3VycmVudFRleHQgPSBlZGl0b3IuZ2V0VGV4dCgpXG5cbiAgICAgIGlmIGN1cnJlbnRUZXh0LmluZGV4T2YoaW1wb3J0U3RhdGVtZW50KT49MFxuICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkV2FybmluZygnSW1wb3J0IGFscmVhZHkgZGVmaW5lZC4nKTtcbiAgICAgIGVsc2VcbiAgICAgICAgY3VycmVudFBvc2l0aW9uID0gZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKClcbiAgICAgICAgaW1wb3J0TWF0Y2hlcyA9IGN1cnJlbnRUZXh0Lm1hdGNoKC9pbXBvcnRcXHMqXFx3Klxccypmcm9tLipcXG4vZylcbiAgICAgICAgcmVmZXJlbmNlc01hdGNoZXM9IGN1cnJlbnRUZXh0Lm1hdGNoKC9cXC9cXC9cXC9cXHMqPHJlZmVyZW5jZVxccypwYXRoLipcXC8+XFxuL2cpXG4gICAgICAgIHVzZVN0cmljdE1hdGNoZSA9IGN1cnJlbnRUZXh0Lm1hdGNoKC8uKltcXCdcXFwiXXVzZSBzdHJpY3RbXFwnXFxcIl0uKi8pXG4gICAgICAgIGlmIGltcG9ydE1hdGNoZXNcbiAgICAgICAgICBsYXN0SW1wb3J0ID0gaW1wb3J0TWF0Y2hlcy5wb3AoKTtcbiAgICAgICAgICBjdXJyZW50VGV4dCA9IGN1cnJlbnRUZXh0LnJlcGxhY2UobGFzdEltcG9ydCwgbGFzdEltcG9ydCArIGltcG9ydFN0YXRlbWVudCk7XG4gICAgICAgIGVsc2UgaWYgcmVmZXJlbmNlc01hdGNoZXNcbiAgICAgICAgICBsYXN0UmVmZXJlbmNlID0gcmVmZXJlbmNlc01hdGNoZXMucG9wKCk7XG4gICAgICAgICAgY3VycmVudFRleHQgPSBjdXJyZW50VGV4dC5yZXBsYWNlKGxhc3RSZWZlcmVuY2UsIGxhc3RSZWZlcmVuY2UgKyAnXFxuJyArIGltcG9ydFN0YXRlbWVudCk7XG4gICAgICAgIGVsc2UgaWYgdXNlU3RyaWN0TWF0Y2hlXG4gICAgICAgICAgdXNlU3RyaWN0ID0gdXNlU3RyaWN0TWF0Y2hlLnBvcCgpO1xuICAgICAgICAgIGN1cnJlbnRUZXh0ID0gY3VycmVudFRleHQucmVwbGFjZSh1c2VTdHJpY3QsIHVzZVN0cmljdCArICdcXG4nICsgaW1wb3J0U3RhdGVtZW50KTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGN1cnJlbnRUZXh0ID0gaW1wb3J0U3RhdGVtZW50ICsgY3VycmVudFRleHQ7XG4gICAgICAgIGVkaXRvci5zZXRUZXh0KGN1cnJlbnRUZXh0KTtcbiAgICAgICAgY3VycmVudFBvc2l0aW9uLnJvdysrO1xuICAgICAgICBlZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oY3VycmVudFBvc2l0aW9uKVxuXG4gIGluc2VydDogLT5cbiAgICAgIEBidWlsZEluZGV4KClcbiAgICAgIEBiaW5kRXZlbnQoKVxuICAgICAgb3MgPSByZXF1aXJlKCdvcycpXG4gICAgICBwYXRoID0gcmVxdWlyZSgncGF0aCcpXG4gICAgICBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICAgIHBvc2l0aW9uID0gZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKClcbiAgICAgIGVkaXRvci5zZWxlY3RXb3Jkc0NvbnRhaW5pbmdDdXJzb3JzKClcbiAgICAgIHNlbGVjdGlvbiA9IGVkaXRvci5nZXRTZWxlY3RlZFRleHQoKS50cmltKClcbiAgICAgIGZpbGVQYXRoID0gZWRpdG9yLmdldFBhdGgoKVxuICAgICAgc3ltYm9sID0gQGluZGV4W3NlbGVjdGlvbl1cblxuICAgICAgaWYgc3ltYm9sICYmIHNlbGVjdGlvblxuICAgICAgICBsb2NhdGlvbiA9IHN5bWJvbC5wYXRoO1xuICAgICAgICBkZWZhdWx0SW1wb3J0ID0gc3ltYm9sLmRlZmF1bHRJbXBvcnQ7XG4gICAgICAgIGZpbGVGb2xkZXIgPSBwYXRoLnJlc29sdmUoZmlsZVBhdGggKyAnLy4uJyk7XG4gICAgICAgIHJlbGF0aXZlID0gcGF0aC5yZWxhdGl2ZShmaWxlRm9sZGVyLCBsb2NhdGlvbikucmVwbGFjZSgvXFwuKGpzeD98dHN4PykkLywgJycpO1xuICAgICAgICAjIFJlcGxhY2UgdGhlIHdpbmRvd3MgcGF0aCBzZXBlcmF0b3Igd2l0aCAnLydcbiAgICAgICAgaWYgKG9zLnBsYXRmb3JtKCkgPT0gJ3dpbjMyJylcbiAgICAgICAgICAgIHJlbGF0aXZlID0gcmVsYXRpdmUuc3BsaXQocGF0aC5zZXApLmpvaW4oJy8nKTtcblxuICAgICAgICBpZihkZWZhdWx0SW1wb3J0KVxuICAgICAgICAgIGltcG9ydENsYXVzZSA9IFwiaW1wb3J0ICN7c2VsZWN0aW9ufSBmcm9tICcuLyN7cmVsYXRpdmV9JztcXG5cIlxuICAgICAgICBlbHNlXG4gICAgICAgICAgaW1wb3J0Q2xhdXNlID0gXCJpbXBvcnQgeyN7c2VsZWN0aW9ufX0gZnJvbSAnLi8je3JlbGF0aXZlfSc7XFxuXCJcbiAgICAgICAgQGFkZEltcG9ydFN0YXRlbWVudChpbXBvcnRDbGF1c2UpXG4jICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dChzZWxlY3Rpb24gKyBcIlxcbmltcG9ydCAje3NlbGVjdGlvbn0gZnJvbSAnLi8je3JlbGF0aXZlfSdcIilcbiAgICAgIGVsc2VcbiAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKCdTeW1ib2wgJytzZWxlY3Rpb24rJyBub3QgZm91bmQuJyk7XG5cbiAgYnVpbGRJbmRleDogLT5cbiAgICBpbmRleCA9IEBpbmRleDtcbiAgICBzZWFyY2hQYXRocyA9IFsnKiovKi50cycsICcqKi8qLmpzJywgJyoqLyoudHN4JywgJyoqLyouanN4J107XG4gICAgc3ltYm9sUGF0dGVybiA9IC9leHBvcnRcXHMqZGVmYXVsdFxccyooY2xhc3N8aW50ZXJmYWNlfG5hbWVzcGFjZXxlbnVtfGNvbnN0fGZ1bmN0aW9uKT9cXHMqKChbYS16QS1aMC05XSkqKS9cbiAgICBhdG9tLndvcmtzcGFjZS5zY2FuKHN5bWJvbFBhdHRlcm4sIHsgcGF0aHM6IHNlYXJjaFBhdGhzIH0sIChyZXN1bHQpIC0+XG4gICAgICAgIGZvciByZXMgaW4gcmVzdWx0Lm1hdGNoZXNcbiAgICAgICAgICByYXdTeW1ib2wgPSByZXMubWF0Y2hUZXh0XG4gICAgICAgICAgc3ltYm9sID0gcmF3U3ltYm9sLm1hdGNoKHN5bWJvbFBhdHRlcm4pWzJdO1xuICAgICAgICAgIGluZGV4W3N5bWJvbF0gPSB7IHBhdGg6IHJlc3VsdC5maWxlUGF0aCwgZGVmYXVsdEltcG9ydDogdHJ1ZcKgfTtcbiAgICAgICk7XG4gICAgc3ltYm9sUGF0dGVybk5vRGVmYXVsdCA9IC9leHBvcnQgKihjbGFzc3xpbnRlcmZhY2V8bmFtZXNwYWNlfGVudW18Y29uc3R8ZnVuY3Rpb24pP1xccyooKFthLXpBLVowLTldKSopL1xuICAgIGF0b20ud29ya3NwYWNlLnNjYW4oc3ltYm9sUGF0dGVybk5vRGVmYXVsdCwgeyBwYXRoczogc2VhcmNoUGF0aHMgfSwgKHJlc3VsdCkgLT5cbiAgICAgICAgZm9yIHJlcyBpbiByZXN1bHQubWF0Y2hlc1xuICAgICAgICAgIHJhd1N5bWJvbCA9IHJlcy5tYXRjaFRleHRcbiAgICAgICAgICBzeW1ib2wgPSByYXdTeW1ib2wubWF0Y2goc3ltYm9sUGF0dGVybk5vRGVmYXVsdClbMl07XG4gICAgICAgICAgaW5kZXhbc3ltYm9sXSA9IHsgcGF0aDogcmVzdWx0LmZpbGVQYXRoLCBkZWZhdWx0SW1wb3J0OiBmYWxzZSB9O1xuICAgICAgKTtcbiAgZ2V0SW5kZXg6IC0+XG4gICAgQGluZGV4XG4iXX0=
