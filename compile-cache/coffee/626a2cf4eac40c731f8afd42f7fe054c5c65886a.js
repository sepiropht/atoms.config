(function() {
  var AutoIndent, CompositeDisposable, INTERFILESAVETIME, LB, autoCompleteJSX, ttlGrammar;

  CompositeDisposable = require('atom').CompositeDisposable;

  autoCompleteJSX = require('./auto-complete-jsx');

  AutoIndent = require('./auto-indent');

  ttlGrammar = require('./create-ttl-grammar');

  INTERFILESAVETIME = 1000;

  LB = 'language-babel';

  module.exports = {
    config: require('./config'),
    activate: function(state) {
      if (this.transpiler == null) {
        this.transpiler = new (require('./transpiler'));
      }
      this.ttlGrammar = new ttlGrammar(true);
      this.disposable = new CompositeDisposable;
      this.textEditors = {};
      this.fileSaveTimes = {};
      this.disposable.add(atom.packages.onDidActivatePackage(this.isPackageCompatible));
      this.disposable.add(atom.project.onDidChangePaths((function(_this) {
        return function() {
          return _this.transpiler.stopUnusedTasks();
        };
      })(this)));
      return this.disposable.add(atom.workspace.observeTextEditors((function(_this) {
        return function(textEditor) {
          _this.textEditors[textEditor.id] = new CompositeDisposable;
          _this.textEditors[textEditor.id].add(textEditor.observeGrammar(function(grammar) {
            var ref, ref1, ref2;
            if (textEditor.getGrammar().packageName === LB) {
              return _this.textEditors[textEditor.id].autoIndent = new AutoIndent(textEditor);
            } else {
              if ((ref = _this.textEditors[textEditor.id]) != null) {
                if ((ref1 = ref.autoIndent) != null) {
                  ref1.destroy();
                }
              }
              return delete (((ref2 = _this.textEditors[textEditor.id]) != null ? ref2.autoIndent : void 0) != null);
            }
          }));
          _this.textEditors[textEditor.id].add(textEditor.onDidSave(function(event) {
            var filePath, lastSaveTime, ref;
            if (textEditor.getGrammar().packageName === LB) {
              filePath = textEditor.getPath();
              lastSaveTime = (ref = _this.fileSaveTimes[filePath]) != null ? ref : 0;
              _this.fileSaveTimes[filePath] = Date.now();
              if (lastSaveTime < (_this.fileSaveTimes[filePath] - INTERFILESAVETIME)) {
                return _this.transpiler.transpile(filePath, textEditor);
              }
            }
          }));
          return _this.textEditors[textEditor.id].add(textEditor.onDidDestroy(function() {
            var filePath, ref, ref1, ref2;
            if ((ref = _this.textEditors[textEditor.id]) != null) {
              if ((ref1 = ref.autoIndent) != null) {
                ref1.destroy();
              }
            }
            delete (((ref2 = _this.textEditors[textEditor.id]) != null ? ref2.autoIndent : void 0) != null);
            filePath = textEditor.getPath();
            if (_this.fileSaveTimes[filePath] != null) {
              delete _this.fileSaveTimes[filePath];
            }
            _this.textEditors[textEditor.id].dispose();
            return delete _this.textEditors[textEditor.id];
          }));
        };
      })(this)));
    },
    deactivate: function() {
      var disposeable, id, ref;
      this.disposable.dispose();
      ref = this.textEditors;
      for (id in ref) {
        disposeable = ref[id];
        if (this.textEditors[id].autoIndent != null) {
          this.textEditors[id].autoIndent.destroy();
          delete this.textEditors[id].autoIndent;
        }
        disposeable.dispose();
      }
      this.transpiler.stopAllTranspilerTask();
      this.transpiler.disposables.dispose();
      return this.ttlGrammar.destroy();
    },
    isPackageCompatible: function(activatedPackage) {
      var incompatiblePackage, incompatiblePackages, reason, results;
      incompatiblePackages = {
        'source-preview-babel': "Both vie to preview the same file.",
        'source-preview-react': "Both vie to preview the same file.",
        'react': "The Atom community package 'react' (not to be confused \nwith Facebook React) monkey patches the atom methods \nthat provide autoindent features for JSX. \nAs it detects JSX scopes without regard to the grammar being used, \nit tries to auto indent JSX that is highlighted by language-babel. \nAs language-babel also attempts to do auto indentation using \nstandard atom API's, this creates a potential conflict."
      };
      results = [];
      for (incompatiblePackage in incompatiblePackages) {
        reason = incompatiblePackages[incompatiblePackage];
        if (activatedPackage.name === incompatiblePackage) {
          results.push(atom.notifications.addInfo('Incompatible Package Detected', {
            dismissable: true,
            detail: "language-babel has detected the presence of an incompatible Atom package named '" + activatedPackage.name + "'. \n \nIt is recommended that you disable either '" + activatedPackage.name + "' or language-babel \n \nReason:\n \n" + reason
          }));
        } else {
          results.push(void 0);
        }
      }
      return results;
    },
    JSXCompleteProvider: function() {
      return autoCompleteJSX;
    },
    provide: function() {
      return this.transpiler;
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvc2VwaXJvcGh0Ly5hdG9tL3BhY2thZ2VzL2xhbmd1YWdlLWJhYmVsL2xpYi9tYWluLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUMsc0JBQXVCLE9BQUEsQ0FBUSxNQUFSOztFQUN4QixlQUFBLEdBQWtCLE9BQUEsQ0FBUSxxQkFBUjs7RUFDbEIsVUFBQSxHQUFhLE9BQUEsQ0FBUSxlQUFSOztFQUNiLFVBQUEsR0FBYSxPQUFBLENBQVEsc0JBQVI7O0VBRWIsaUJBQUEsR0FBb0I7O0VBQ3BCLEVBQUEsR0FBSzs7RUFFTCxNQUFNLENBQUMsT0FBUCxHQUNFO0lBQUEsTUFBQSxFQUFRLE9BQUEsQ0FBUSxVQUFSLENBQVI7SUFFQSxRQUFBLEVBQVUsU0FBQyxLQUFEOztRQUNSLElBQUMsQ0FBQSxhQUFjLElBQUksQ0FBQyxPQUFBLENBQVEsY0FBUixDQUFEOztNQUNuQixJQUFDLENBQUEsVUFBRCxHQUFrQixJQUFBLFVBQUEsQ0FBVyxJQUFYO01BRWxCLElBQUMsQ0FBQSxVQUFELEdBQWMsSUFBSTtNQUNsQixJQUFDLENBQUEsV0FBRCxHQUFlO01BQ2YsSUFBQyxDQUFBLGFBQUQsR0FBaUI7TUFFakIsSUFBQyxDQUFBLFVBQVUsQ0FBQyxHQUFaLENBQWdCLElBQUksQ0FBQyxRQUFRLENBQUMsb0JBQWQsQ0FBbUMsSUFBQyxDQUFBLG1CQUFwQyxDQUFoQjtNQUVBLElBQUMsQ0FBQSxVQUFVLENBQUMsR0FBWixDQUFnQixJQUFJLENBQUMsT0FBTyxDQUFDLGdCQUFiLENBQThCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtpQkFDNUMsS0FBQyxDQUFBLFVBQVUsQ0FBQyxlQUFaLENBQUE7UUFENEM7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTlCLENBQWhCO2FBR0EsSUFBQyxDQUFBLFVBQVUsQ0FBQyxHQUFaLENBQWdCLElBQUksQ0FBQyxTQUFTLENB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Q0UsSUFBRyxnQkFBZ0IsQ0FBQyxJQUFqQixLQUF5QixtQkFBNUI7dUJBQ0UsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFuQixDQUEyQiwrQkFBM0IsRUFDRTtZQUFBLFdBQUEsRUFBYSxJQUFiO1lBQ0EsTUFBQSxFQUFRLGtGQUFBLEdBQ21DLGdCQUFnQixDQUFDLElBRHBELEdBQ3lELHFEQUR6RCxHQUVrRCxnQkFBZ0IsQ0FBQyxJQUZuRSxHQUV3RSx1Q0FGeEUsR0FHbUIsTUFKM0I7V0FERixHQURGO1NBQUEsTUFBQTsrQkFBQTs7QUFERjs7SUFoQm1CLENBdERyQjtJQStFQSxtQkFBQSxFQUFxQixTQUFBO2FBQ25CO0lBRG1CLENBL0VyQjtJQWtGQSxPQUFBLEVBQVEsU0FBQTthQUNOLElBQUMsQ0FBQTtJQURLLENBbEZSOztBQVRGIiwic291cmNlc0NvbnRlbnQiOlsie0NvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSAnYXRvbSdcbmF1dG9Db21wbGV0ZUpTWCA9IHJlcXVpcmUgJy4vYXV0by1jb21wbGV0ZS1qc3gnXG5BdXRvSW5kZW50ID0gcmVxdWlyZSAnLi9hdXRvLWluZGVudCdcbnR0bEdyYW1tYXIgPSByZXF1aXJlICcuL2NyZWF0ZS10dGwtZ3JhbW1hcidcblxuSU5URVJGSUxFU0FWRVRJTUUgPSAxMDAwXG5MQiA9ICdsYW5ndWFnZS1iYWJlbCdcblxubW9kdWxlLmV4cG9ydHMgPVxuICBjb25maWc6IHJlcXVpcmUgJy4vY29uZmlnJ1xuXG4gIGFjdGl2YXRlOiAoc3RhdGUpIC0+XG4gICAgQHRyYW5zcGlsZXIgPz0gbmV3IChyZXF1aXJlICcuL3RyYW5zcGlsZXInKVxuICAgIEB0dGxHcmFtbWFyID0gbmV3IHR0bEdyYW1tYXIodHJ1ZSlcbiAgICAjIHRyYWNrIGFueSBmaWxlIHNhdmUgZXZlbnRzIGFuZCB0cmFuc3BpbGUgaWYgYmFiZWxcbiAgICBAZGlzcG9zYWJsZSA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG4gICAgQHRleHRFZGl0b3JzID0ge31cbiAgICBAZmlsZVNhdmVUaW1lcyA9IHt9XG5cbiAgICBAZGlzcG9zYWJsZS5hZGQgYXRvbS5wYWNrYWdlcy5vbkRpZEFjdGl2YXRlUGFja2FnZSBAaXNQYWNrYWdlQ29tcGF0aWJsZVxuXG4gICAgQGRpc3Bvc2FibGUuYWRkIGF0b20ucHJvamVjdC5vbkRpZENoYW5nZVBhdGhzID0+XG4gICAgICBAdHJhbnNwaWxlci5zdG9wVW51c2VkVGFza3MoKVxuXG4gICAgQGRpc3Bvc2FibGUuYWRkIGF0b20ud29ya3NwYWNlLm9ic2VydmVUZXh0RWRpdG9ycyAodGV4dEVkaXRvcikgPT5cbiAgICAgIEB0ZXh0RWRpdG9yc1t0ZXh0RWRpdG9yLmlkXSA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG5cbiAgICAgIEB0ZXh0RWRpdG9yc1t0ZXh0RWRpdG9yLmlkXS5hZGQgdGV4dEVkaXRvci5vYnNlcnZlR3JhbW1hciAoZ3JhbW1hcikgPT5cbiAgICAgICAgIyBJbnN0YW50aWF0ZSBpbmRlbnRvciBmb3IgbGFuZ3VhZ2UtYmFiZWwgZmlsZXNcbiAgICAgICAgaWYgdGV4dEVkaXRvci5nZXRHcmFtbWFyKCkucGFja2FnZU5hbWUgaXMgTEJcbiAgICAgICAgICBAdGV4dEVkaXRvcnNbdGV4dEVkaXRvci5pZF0uYXV0b0luZGVudCA9IG5ldyBBdXRvSW5kZW50KHRleHRFZGl0b3IpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBAdGV4dEVkaXRvcnNbdGV4dEVkaXRvci5pZF0/LmF1dG9JbmRlbnQ/LmRlc3Ryb3koKVxuICAgICAgICAgIGRlbGV0ZSBAdGV4dEVkaXRvcnNbdGV4dEVkaXRvci5pZF0/LmF1dG9JbmRlbnQ/XG5cbiAgICAgIEB0ZXh0RWRpdG9yc1t0ZXh0RWRpdG9yLmlkXS5hZGQgdGV4dEVkaXRvci5vbkRpZFNhdmUgKGV2ZW50KSA9PlxuICAgICAgICBpZiB0ZXh0RWRpdG9yLmdldEdyYW1tYXIoKS5wYWNrYWdlTmFtZSBpcyBMQlxuICAgICAgICAgIGZpbGVQYXRoID0gdGV4dEVkaXRvci5nZXRQYXRoKClcbiAgICAgICAgICBsYXN0U2F2ZVRpbWUgPSBAZmlsZVNhdmVUaW1lc1tmaWxlUGF0aF0gPyAwXG4gICAgICAgICAgQGZpbGVTYXZlVGltZXNbZmlsZVBhdGhdID0gRGF0ZS5ub3coKVxuICAgICAgICAgIGlmICAobGFzdFNhdmVUaW1lIDwgKEBmaWxlU2F2ZVRpbWVzW2ZpbGVQYXRoXSAtIElOVEVSRklMRVNBVkVUSU1FKSlcbiAgICAgICAgICAgIEB0cmFuc3BpbGVyLnRyYW5zcGlsZShmaWxlUGF0aCwgdGV4dEVkaXRvcilcblxuICAgICAgQHRleHRFZGl0b3JzW3RleHRFZGl0b3IuaWRdLmFkZCB0ZXh0RWRpdG9yLm9uRGlkRGVzdHJveSAoKSA9PlxuICAgICAgICBAdGV4dEVkaXRvcnNbdGV4dEVkaXRvci5pZF0/LmF1dG9JbmRlbnQ/LmRlc3Ryb3koKVxuICAgICAgICBkZWxldGUgQHRleHRFZGl0b3JzW3RleHRFZGl0b3IuaWRdPy5hdXRvSW5kZW50P1xuICAgICAgICBmaWxlUGF0aCA9IHRleHRFZGl0b3IuZ2V0UGF0aCgpXG4gICAgICAgIGlmIEBmaWxlU2F2ZVRpbWVzW2ZpbGVQYXRoXT8gdGhlbiBkZWxldGUgQGZpbGVTYXZlVGltZXNbZmlsZVBhdGhdXG4gICAgICAgIEB0ZXh0RWRpdG9yc1t0ZXh0RWRpdG9yLmlkXS5kaXNwb3NlKClcbiAgICAgICAgZGVsZXRlIEB0ZXh0RWRpdG9yc1t0ZXh0RWRpdG9yLmlkXVxuXG4gIGRlYWN0aXZhdGU6IC0+XG4gICAgQGRpc3Bvc2FibGUuZGlzcG9zZSgpXG4gICAgZm9yIGlkLCBkaXNwb3NlYWJsZSBvZiBAdGV4dEVkaXRvcnNcbiAgICAgIGlmIEB0ZXh0RWRpdG9yc1tpZF0uYXV0b0luZGVudD9cbiAgICAgICAgQHRleHRFZGl0b3JzW2lkXS5hdXRvSW5kZW50LmRlc3Ryb3koKVxuICAgICAgICBkZWxldGUgQHRleHRFZGl0b3JzW2lkXS5hdXRvSW5kZW50XG4gICAgICBkaXNwb3NlYWJsZS5kaXNwb3NlKClcbiAgICBAdHJhbnNwaWxlci5zdG9wQWxsVHJhbnNwaWxlclRhc2soKVxuICAgIEB0cmFuc3BpbGVyLmRpc3Bvc2FibGVzLmRpc3Bvc2UoKVxuICAgIEB0dGxHcmFtbWFyLmRlc3Ryb3koKVxuXG4gICMgd2FybnMgaWYgYW4gYWN0aXZhdGVkIHBhY2thZ2UgaXMgb24gdGhlIGluY29tcGF0aWJsZSBsaXN0XG4gIGlzUGFja2FnZUNvbXBhdGlibGU6IChhY3RpdmF0ZWRQYWNrYWdlKSAtPlxuICAgIGluY29tcGF0aWJsZVBhY2thZ2VzID0ge1xuICAgICAgJ3NvdXJjZS1wcmV2aWV3LWJhYmVsJzpcbiAgICAgICAgXCJCb3RoIHZpZSB0byBwcmV2aWV3IHRoZSBzYW1lIGZpbGUuXCJcbiAgICAgICdzb3VyY2UtcHJldmlldy1yZWFjdCc6XG4gICAgICAgIFwiQm90aCB2aWUgdG8gcHJldmlldyB0aGUgc2FtZSBmaWxlLlwiXG4gICAgICAncmVhY3QnOlxuICAgICAgICBcIlRoZSBBdG9tIGNvbW11bml0eSBwYWNrYWdlICdyZWFjdCcgKG5vdCB0byBiZSBjb25mdXNlZFxuICAgICAgICBcXG53aXRoIEZhY2Vib29rIFJlYWN0KSBtb25rZXkgcGF0Y2hlcyB0aGUgYXRvbSBtZXRob2RzXG4gICAgICAgIFxcbnRoYXQgcHJvdmlkZSBhdXRvaW5kZW50IGZlYXR1cmVzIGZvciBKU1guXG4gICAgICAgIFxcbkFzIGl0IGRldGVjdHMgSlNYIHNjb3BlcyB3aXRob3V0IHJlZ2FyZCB0byB0aGUgZ3JhbW1hciBiZWluZyB1c2VkLFxuICAgICAgICBcXG5pdCB0cmllcyB0byBhdXRvIGluZGVudCBKU1ggdGhhdCBpcyBoaWdobGlnaHRlZCBieSBsYW5ndWFnZS1iYWJlbC5cbiAgICAgICAgXFxuQXMgbGFuZ3VhZ2UtYmFiZWwgYWxzbyBhdHRlbXB0cyB0byBkbyBhdXRvIGluZGVudGF0aW9uIHVzaW5nXG4gICAgICAgIFxcbnN0YW5kYXJkIGF0b20gQVBJJ3MsIHRoaXMgY3JlYXRlcyBhIHBvdGVudGlhbCBjb25mbGljdC5cIlxuICAgIH1cblxuICAgIGZvciBpbmNvbXBhdGlibGVQYWNrYWdlLCByZWFzb24gb2YgaW5jb21wYXRpYmxlUGFja2FnZXNcbiAgICAgIGlmIGFjdGl2YXRlZFBhY2thZ2UubmFtZSBpcyBpbmNvbXBhdGlibGVQYWNrYWdlXG4gICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRJbmZvICdJbmNvbXBhdGlibGUgUGFja2FnZSBEZXRlY3RlZCcsXG4gICAgICAgICAgZGlzbWlzc2FibGU6IHRydWVcbiAgICAgICAgICBkZXRhaWw6IFwibGFuZ3VhZ2UtYmFiZWwgaGFzIGRldGVjdGVkIHRoZSBwcmVzZW5jZSBvZiBhblxuICAgICAgICAgICAgICAgICAgaW5jb21wYXRpYmxlIEF0b20gcGFja2FnZSBuYW1lZCAnI3thY3RpdmF0ZWRQYWNrYWdlLm5hbWV9Jy5cbiAgICAgICAgICAgICAgICAgIFxcbiBcXG5JdCBpcyByZWNvbW1lbmRlZCB0aGF0IHlvdSBkaXNhYmxlIGVpdGhlciAnI3thY3RpdmF0ZWRQYWNrYWdlLm5hbWV9JyBvciBsYW5ndWFnZS1iYWJlbFxuICAgICAgICAgICAgICAgICAgXFxuIFxcblJlYXNvbjpcXG4gXFxuI3tyZWFzb259XCJcblxuICBKU1hDb21wbGV0ZVByb3ZpZGVyOiAtPlxuICAgIGF1dG9Db21wbGV0ZUpTWFxuXG4gIHByb3ZpZGU6LT5cbiAgICBAdHJhbnNwaWxlclxuIl19
