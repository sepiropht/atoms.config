(function() {
  var CompositeDisposable, ScrollView, ShowTodoView, TextBuffer, TextEditorView, TodoOptions, TodoTable, deprecatedTextEditor, fs, path, ref, ref1,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ref = require('atom'), CompositeDisposable = ref.CompositeDisposable, TextBuffer = ref.TextBuffer;

  ref1 = require('atom-space-pen-views'), ScrollView = ref1.ScrollView, TextEditorView = ref1.TextEditorView;

  path = require('path');

  fs = require('fs-plus');

  TodoTable = require('./todo-table-view');

  TodoOptions = require('./todo-options-view');

  deprecatedTextEditor = function(params) {
    var TextEditor;
    if (atom.workspace.buildTextEditor != null) {
      return atom.workspace.buildTextEditor(params);
    } else {
      TextEditor = require('atom').TextEditor;
      return new TextEditor(params);
    }
  };

  module.exports = ShowTodoView = (function(superClass) {
    extend(ShowTodoView, superClass);

    ShowTodoView.content = function(collection, filterBuffer) {
      var filterEditor;
      filterEditor = deprecatedTextEditor({
        mini: true,
        tabLength: 2,
        softTabs: true,
        softWrapped: false,
        buffer: filterBuffer,
        placeholderText: 'Search Todos'
      });
      return this.div({
        "class": 'show-todo-preview',
        tabindex: -1
      }, (function(_this) {
        return function() {
          _this.div({
            "class": 'input-block'
          }, function() {
            _this.div({
              "class": 'input-block-item input-block-item--flex'
            }, function() {
              return _this.subview('filterEditorView', new TextEditorView({
                editor: filterEditor
              }));
            });
            return _this.div({
              "class": 'input-block-item'
            }, function() {
              return _this.div({
                "class": 'btn-group'
              }, function() {
                _this.button({
                  outlet: 'scopeButton',
                  "class": 'btn'
                });
                _this.button({
                  outlet: 'optionsButton',
                  "class": 'btn icon-gear'
                });
                _this.button({
                  outlet: 'saveAsButton',
                  "class": 'btn icon-cloud-download'
                });
                return _this.button({
                  outlet: 'refreshButton',
                  "class": 'btn icon-sync'
                });
              });
            });
          });
          _this.div({
            "class": 'input-block todo-info-block'
          }, function() {
            return _this.div({
              "class": 'input-block-item'
            }, function() {
              return _this.span({
                outlet: 'todoInfo'
              });
            });
          });
          _this.div({
            outlet: 'optionsView'
          });
          _this.div({
            outlet: 'todoLoading',
            "class": 'todo-loading'
          }, function() {
            _this.div({
              "class": 'markdown-spinner'
            });
            return _this.h5({
              outlet: 'searchCount',
              "class": 'text-center'
            }, "Loading Todos...");
          });
          return _this.subview('todoTable', new TodoTable(collection));
        };
      })(this));
    };

    function ShowTodoView(collection1, uri) {
      this.collection = collection1;
      this.uri = uri;
      this.toggleOptions = bind(this.toggleOptions, this);
      this.setScopeButtonState = bind(this.setScopeButtonState, this);
      this.toggleSearchScope = bind(this.toggleSearchScope, this);
      this.saveAs = bind(this.saveAs, this);
      this.stopLoading = bind(this.stopLoading, this);
      this.startLoading = bind(this.startLoading, this);
      ShowTodoView.__super__.constructor.call(this, this.collection, this.filterBuffer = new TextBuffer);
    }

    ShowTodoView.prototype.initialize = function() {
      this.disposables = new CompositeDisposable;
      this.handleEvents();
      this.collection.search();
      this.setScopeButtonState(this.collection.getSearchScope());
      this.notificationOptions = {
        detail: 'Atom todo-show package',
        dismissable: true,
        icon: this.getIconName()
      };
      this.checkDeprecation();
      this.disposables.add(atom.tooltips.add(this.scopeButton, {
        title: "What to Search"
      }));
      this.disposables.add(atom.tooltips.add(this.optionsButton, {
        title: "Show Todo Options"
      }));
      this.disposables.add(atom.tooltips.add(this.saveAsButton, {
        title: "Save Todos to File"
      }));
      return this.disposables.add(atom.tooltips.add(this.refreshButton, {
        title: "Refresh Todos"
      }));
    };

    ShowTodoView.prototype.handleEvents = function() {
      var pane;
      this.disposables.add(atom.commands.add(this.element, {
        'core:save-as': (function(_this) {
          return function(event) {
            event.stopPropagation();
            return _this.saveAs();
          };
        })(this),
        'core:refresh': (function(_this) {
          return function(event) {
            event.stopPropagation();
            return _this.collection.search();
          };
        })(this)
      }));
      pane = atom.workspace.getActivePane();
      if (atom.config.get('todo-show.rememberViewSize')) {
        this.restorePaneFlex(pane);
      }
      this.disposables.add(pane.observeFlexScale((function(_this) {
        return function(flexScale) {
          return _this.savePaneFlex(flexScale);
        };
      })(this)));
      this.disposables.add(this.collection.onDidStartSearch(this.startLoading));
      this.disposables.add(this.collection.onDidFinishSearch(this.stopLoading));
      this.disposables.add(this.collection.onDidFailSearch((function(_this) {
        return function(err) {
          _this.searchCount.text("Search Failed");
          if (err) {
            console.error(err);
          }
          if (err) {
            return _this.showError(err);
          }
        };
      })(this)));
      this.disposables.add(this.collection.onDidChangeSearchScope((function(_this) {
        return function(scope) {
          _this.setScopeButtonState(scope);
          return _this.collection.search();
        };
      })(this)));
      this.disposables.add(this.collection.onDidSearchPaths((function(_this) {
        return function(nPaths) {
          return _this.searchCount.text(nPaths + " paths searched...");
        };
      })(this)));
      this.disposables.add(atom.workspace.onDidChangeActivePaneItem((function(_this) {
        return function(item) {
          if (_this.collection.setActiveProject(item != null ? typeof item.getPath === "function" ? item.getPath() : void 0 : void 0) || ((item != null ? item.constructor.name : void 0) === 'TextEditor' && _this.collection.scope === 'active')) {
            return _this.collection.search();
          }
        };
      })(this)));
      this.disposables.add(atom.workspace.onDidAddTextEditor((function(_this) {
        return function(arg) {
          var textEditor;
          textEditor = arg.textEditor;
          if (_this.collection.scope === 'open') {
            return _this.collection.search();
          }
        };
      })(this)));
      this.disposables.add(atom.workspace.onDidDestroyPaneItem((function(_this) {
        return function(arg) {
          var item;
          item = arg.item;
          if (_this.collection.scope === 'open') {
            return _this.collection.search();
          }
        };
      })(this)));
      this.disposables.add(atom.workspace.observeTextEditors((function(_this) {
        return function(editor) {
          return _this.disposables.add(editor.onDidSave(function() {
            return _this.collection.search();
          }));
        };
      })(this)));
      this.filterEditorView.getModel().onDidStopChanging((function(_this) {
        return function() {
          if (_this.firstTimeFilter) {
            _this.filter();
          }
          return _this.firstTimeFilter = true;
        };
      })(this));
      this.scopeButton.on('click', this.toggleSearchScope);
      this.optionsButton.on('click', this.toggleOptions);
      this.saveAsButton.on('click', this.saveAs);
      return this.refreshButton.on('click', (function(_this) {
        return function() {
          return _this.collection.search();
        };
      })(this));
    };

    ShowTodoView.prototype.destroy = function() {
      this.collection.cancelSearch();
      this.disposables.dispose();
      return this.detach();
    };

    ShowTodoView.prototype.savePaneFlex = function(flex) {
      return localStorage.setItem('todo-show.flex', flex);
    };

    ShowTodoView.prototype.restorePaneFlex = function(pane) {
      var flex;
      flex = localStorage.getItem('todo-show.flex');
      if (flex) {
        return pane.setFlexScale(parseFloat(flex));
      }
    };

    ShowTodoView.prototype.getTitle = function() {
      return "Todo Show";
    };

    ShowTodoView.prototype.getIconName = function() {
      return "checklist";
    };

    ShowTodoView.prototype.getURI = function() {
      return this.uri;
    };

    ShowTodoView.prototype.getProjectName = function() {
      return this.collection.getActiveProjectName();
    };

    ShowTodoView.prototype.getProjectPath = function() {
      return this.collection.getActiveProject();
    };

    ShowTodoView.prototype.getTodos = function() {
      return this.collection.getTodos();
    };

    ShowTodoView.prototype.getTodosCount = function() {
      return this.collection.getTodosCount();
    };

    ShowTodoView.prototype.isSearching = function() {
      return this.collection.getState();
    };

    ShowTodoView.prototype.startLoading = function() {
      this.todoLoading.show();
      return this.updateInfo();
    };

    ShowTodoView.prototype.stopLoading = function() {
      this.todoLoading.hide();
      return this.updateInfo();
    };

    ShowTodoView.prototype.updateInfo = function() {
      return this.todoInfo.html((this.getInfoText()) + " " + (this.getScopeText()));
    };

    ShowTodoView.prototype.getInfoText = function() {
      var count;
      if (this.isSearching()) {
        return "Found ... results";
      }
      switch (count = this.getTodosCount()) {
        case 1:
          return "Found " + count + " result";
        default:
          return "Found " + count + " results";
      }
    };

    ShowTodoView.prototype.getScopeText = function() {
      switch (this.collection.scope) {
        case 'active':
          return "in active file";
        case 'open':
          return "in open files";
        case 'project':
          return "in project <code>" + (this.getProjectName()) + "</code>";
        default:
          return "in workspace";
      }
    };

    ShowTodoView.prototype.showError = function(message) {
      if (message == null) {
        message = '';
      }
      return atom.notifications.addError(message, this.notificationOptions);
    };

    ShowTodoView.prototype.showWarning = function(message) {
      if (message == null) {
        message = '';
      }
      return atom.notifications.addWarning(message, this.notificationOptions);
    };

    ShowTodoView.prototype.saveAs = function() {
      var filePath, outputFilePath, projectPath;
      if (this.isSearching()) {
        return;
      }
      filePath = (this.getProjectName() || 'todos') + ".md";
      if (projectPath = this.getProjectPath()) {
        filePath = path.join(projectPath, filePath);
      }
      if (outputFilePath = atom.showSaveDialogSync(filePath.toLowerCase())) {
        fs.writeFileSync(outputFilePath, this.collection.getMarkdown());
        return atom.workspace.open(outputFilePath);
      }
    };

    ShowTodoView.prototype.toggleSearchScope = function() {
      var scope;
      scope = this.collection.toggleSearchScope();
      return this.setScopeButtonState(scope);
    };

    ShowTodoView.prototype.setScopeButtonState = function(state) {
      switch (state) {
        case 'workspace':
          return this.scopeButton.text('Workspace');
        case 'project':
          return this.scopeButton.text('Project');
        case 'open':
          return this.scopeButton.text('Open Files');
        case 'active':
          return this.scopeButton.text('Active File');
      }
    };

    ShowTodoView.prototype.toggleOptions = function() {
      if (!this.todoOptions) {
        this.optionsView.hide();
        this.todoOptions = new TodoOptions(this.collection);
        this.optionsView.html(this.todoOptions);
      }
      return this.optionsView.slideToggle();
    };

    ShowTodoView.prototype.filter = function() {
      return this.collection.filterTodos(this.filterBuffer.getText());
    };

    ShowTodoView.prototype.checkDeprecation = function() {
      if (atom.config.get('todo-show.findTheseRegexes')) {
        return this.showWarning('Deprecation Warning:\n\n`findTheseRegexes` config is deprecated, please use `findTheseTodos` and `findUsingRegex` for custom behaviour.\nSee https://github.com/mrodalgaard/atom-todo-show#config for more information.');
      }
    };

    return ShowTodoView;

  })(ScrollView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvc2VwaXJvcGh0Ly5hdG9tL3BhY2thZ2VzL3RvZG8tc2hvdy9saWIvdG9kby12aWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsNElBQUE7SUFBQTs7OztFQUFBLE1BQW9DLE9BQUEsQ0FBUSxNQUFSLENBQXBDLEVBQUMsNkNBQUQsRUFBc0I7O0VBQ3RCLE9BQStCLE9BQUEsQ0FBUSxzQkFBUixDQUEvQixFQUFDLDRCQUFELEVBQWE7O0VBQ2IsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUNQLEVBQUEsR0FBSyxPQUFBLENBQVEsU0FBUjs7RUFFTCxTQUFBLEdBQVksT0FBQSxDQUFRLG1CQUFSOztFQUNaLFdBQUEsR0FBYyxPQUFBLENBQVEscUJBQVI7O0VBRWQsb0JBQUEsR0FBdUIsU0FBQyxNQUFEO0FBQ3JCLFFBQUE7SUFBQSxJQUFHLHNDQUFIO2FBQ0UsSUFBSSxDQUFDLFNBQVMsQ0FBQyxlQUFmLENBQStCLE1BQS9CLEVBREY7S0FBQSxNQUFBO01BR0UsVUFBQSxHQUFhLE9BQUEsQ0FBUSxNQUFSLENBQWUsQ0FBQzthQUN6QixJQUFBLFVBQUEsQ0FBVyxNQUFYLEVBSk47O0VBRHFCOztFQU92QixNQUFNLENBQUMsT0FBUCxHQUNNOzs7SUFDSixZQUFDLENBQUEsT0FBRCxHQUFVLFNBQUMsVUFBRCxFQUFhLFlBQWI7QUFDUixVQUFBO01BQUEsWUFBQSxHQUFlLG9CQUFBLENBQ2I7UUFBQSxJQUFBLEVBQU0sSUFBTjtRQUNBLFNBQUEsRUFBVyxDQURYO1FBRUEsUUFBQSxFQUFVLElBRlY7UUFHQSxXQUFBLEVBQWEsS0FIYjtRQUlBLE1BQUEsRUFBUSxZQUpSO1FBS0EsZUFBQSxFQUFpQixjQUxqQjtPQURhO2FBU2YsSUFBQyxDQUFBLEdBQUQsQ0FBSztRQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sbUJBQVA7UUFBNEIsUUFBQSxFQUFVLENBQUMsQ0FB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QSxXQUFXLENBQUMsSUFBYixDQUFrQixTQUFsQjtBQUZ0QixhQUdPLE1BSFA7aUJBR21CLElBQUMsQ0FBQSxXQUFXLENBQUMsSUFBYixDQUFrQixZQUFsQjtBQUhuQixhQUlPLFFBSlA7aUJBSXFCLElBQUMsQ0FBQSxXQUFXLENBQUMsSUFBYixDQUFrQixhQUFsQjtBQUpyQjtJQURtQjs7MkJBT3JCLGFBQUEsR0FBZSxTQUFBO01BQ2IsSUFBQSxDQUFPLElBQUMsQ0FBQSxXQUFSO1FBQ0UsSUFBQyxDQUFBLFdBQVcsQ0FBQyxJQUFiLENBQUE7UUFDQSxJQUFDLENBQUEsV0FBRCxHQUFtQixJQUFBLFdBQUEsQ0FBWSxJQUFDLENBQUEsVUFBYjtRQUNuQixJQUFDLENBQUEsV0FBVyxDQUFDLElBQWIsQ0FBa0IsSUFBQyxDQUFBLFdBQW5CLEVBSEY7O2FBSUEsSUFBQyxDQUFBLFdBQVcsQ0FBQyxXQUFiLENBQUE7SUFMYTs7MkJBT2YsTUFBQSxHQUFRLFNBQUE7YUFDTixJQUFDLENBQUEsVUFBVSxDQUFDLFdBQVosQ0FBd0IsSUFBQyxDQUFBLFlBQVksQ0FBQyxPQUFkLENBQUEsQ0FBeEI7SUFETTs7MkJBR1IsZ0JBQUEsR0FBa0IsU0FBQTtNQUNoQixJQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQiw0QkFBaEIsQ0FBSDtlQUNFLElBQUMsQ0FBQSxXQUFELENBQWEseU5BQWIsRUFERjs7SUFEZ0I7Ozs7S0FwTU87QUFoQjNCIiwic291cmNlc0NvbnRlbnQiOlsie0NvbXBvc2l0ZURpc3Bvc2FibGUsIFRleHRCdWZmZXJ9ID0gcmVxdWlyZSAnYXRvbSdcbntTY3JvbGxWaWV3LCBUZXh0RWRpdG9yVmlld30gPSByZXF1aXJlICdhdG9tLXNwYWNlLXBlbi12aWV3cydcbnBhdGggPSByZXF1aXJlICdwYXRoJ1xuZnMgPSByZXF1aXJlICdmcy1wbHVzJ1xuXG5Ub2RvVGFibGUgPSByZXF1aXJlICcuL3RvZG8tdGFibGUtdmlldydcblRvZG9PcHRpb25zID0gcmVxdWlyZSAnLi90b2RvLW9wdGlvbnMtdmlldydcblxuZGVwcmVjYXRlZFRleHRFZGl0b3IgPSAocGFyYW1zKSAtPlxuICBpZiBhdG9tLndvcmtzcGFjZS5idWlsZFRleHRFZGl0b3I/XG4gICAgYXRvbS53b3Jrc3BhY2UuYnVpbGRUZXh0RWRpdG9yKHBhcmFtcylcbiAgZWxzZVxuICAgIFRleHRFZGl0b3IgPSByZXF1aXJlKCdhdG9tJykuVGV4dEVkaXRvclxuICAgIG5ldyBUZXh0RWRpdG9yKHBhcmFtcylcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgU2hvd1RvZG9WaWV3IGV4dGVuZHMgU2Nyb2xsVmlld1xuICBAY29udGVudDogKGNvbGxlY3Rpb24sIGZpbHRlckJ1ZmZlcikgLT5cbiAgICBmaWx0ZXJFZGl0b3IgPSBkZXByZWNhdGVkVGV4dEVkaXRvcihcbiAgICAgIG1pbmk6IHRydWVcbiAgICAgIHRhYkxlbmd0aDogMlxuICAgICAgc29mdFRhYnM6IHRydWVcbiAgICAgIHNvZnRXcmFwcGVkOiBmYWxzZVxuICAgICAgYnVmZmVyOiBmaWx0ZXJCdWZmZXJcbiAgICAgIHBsYWNlaG9sZGVyVGV4dDogJ1NlYXJjaCBUb2RvcydcbiAgICApXG5cbiAgICBAZGl2IGNsYXNzOiAnc2hvdy10b2RvLXByZXZpZXcnLCB0YWJpbmRleDogLTEsID0+XG4gICAgICBAZGl2IGNsYXNzOiAnaW5wdXQtYmxvY2snLCA9PlxuICAgICAgICBAZGl2IGNsYXNzOiAnaW5wdXQtYmxvY2staXRlbSBpbnB1dC1ibG9jay1pdGVtLS1mbGV4JywgPT5cbiAgICAgICAgICBAc3VidmlldyAnZmlsdGVyRWRpdG9yVmlldycsIG5ldyBUZXh0RWRpdG9yVmlldyhlZGl0b3I6IGZpbHRlckVkaXRvcilcbiAgICAgICAgQGRpdiBjbGFzczogJ2lucHV0LWJsb2NrLWl0ZW0nLCA9PlxuICAgICAgICAgIEBkaXYgY2xhc3M6ICdidG4tZ3JvdXAnLCA9PlxuICAgICAgICAgICAgQGJ1dHRvbiBvdXRsZXQ6ICdzY29wZUJ1dHRvbicsIGNsYXNzOiAnYnRuJ1xuICAgICAgICAgICAgQGJ1dHRvbiBvdXRsZXQ6ICdvcHRpb25zQnV0dG9uJywgY2xhc3M6ICdidG4gaWNvbi1nZWFyJ1xuICAgICAgICAgICAgQGJ1dHRvbiBvdXRsZXQ6ICdzYXZlQXNCdXR0b24nLCBjbGFzczogJ2J0biBpY29uLWNsb3VkLWRvd25sb2FkJ1xuICAgICAgICAgICAgQGJ1dHRvbiBvdXRsZXQ6ICdyZWZyZXNoQnV0dG9uJywgY2xhc3M6ICdidG4gaWNvbi1zeW5jJ1xuXG4gICAgICBAZGl2IGNsYXNzOiAnaW5wdXQtYmxvY2sgdG9kby1pbmZvLWJsb2NrJywgPT5cbiAgICAgICAgQGRpdiBjbGFzczogJ2lucHV0LWJsb2NrLWl0ZW0nLCA9PlxuICAgICAgICAgIEBzcGFuIG91dGxldDogJ3RvZG9JbmZvJ1xuXG4gICAgICBAZGl2IG91dGxldDogJ29wdGlvbnNWaWV3J1xuXG4gICAgICBAZGl2IG91dGxldDogJ3RvZG9Mb2FkaW5nJywgY2xhc3M6ICd0b2RvLWxvYWRpbmcnLCA9PlxuICAgICAgICBAZGl2IGNsYXNzOiAnbWFya2Rvd24tc3Bpbm5lcidcbiAgICAgICAgQGg1IG91dGxldDogJ3NlYXJjaENvdW50JywgY2xhc3M6ICd0ZXh0LWNlbnRlcicsIFwiTG9hZGluZyBUb2Rvcy4uLlwiXG5cbiAgICAgIEBzdWJ2aWV3ICd0b2RvVGFibGUnLCBuZXcgVG9kb1RhYmxlKGNvbGxlY3Rpb24pXG5cbiAgY29uc3RydWN0b3I6IChAY29sbGVjdGlvbiwgQHVyaSkgLT5cbiAgICBzdXBlciBAY29sbGVjdGlvbiwgQGZpbHRlckJ1ZmZlciA9IG5ldyBUZXh0QnVmZmVyXG5cbiAgaW5pdGlhbGl6ZTogLT5cbiAgICBAZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuICAgIEBoYW5kbGVFdmVudHMoKVxuICAgIEBjb2xsZWN0aW9uLnNlYXJjaCgpXG4gICAgQHNldFNjb3BlQnV0dG9uU3RhdGUoQGNvbGxlY3Rpb24uZ2V0U2VhcmNoU2NvcGUoKSlcblxuICAgIEBub3RpZmljYXRpb25PcHRpb25zID1cbiAgICAgIGRldGFpbDogJ0F0b20gdG9kby1zaG93IHBhY2thZ2UnXG4gICAgICBkaXNtaXNzYWJsZTogdHJ1ZVxuICAgICAgaWNvbjogQGdldEljb25OYW1lKClcblxuICAgIEBjaGVja0RlcHJlY2F0aW9uKClcblxuICAgIEBkaXNwb3NhYmxlcy5hZGQgYXRvbS50b29sdGlwcy5hZGQgQHNjb3BlQnV0dG9uLCB0aXRsZTogXCJXaGF0IHRvIFNlYXJjaFwiXG4gICAgQGRpc3Bvc2FibGVzLmFkZCBhdG9tLnRvb2x0aXBzLmFkZCBAb3B0aW9uc0J1dHRvbiwgdGl0bGU6IFwiU2hvdyBUb2RvIE9wdGlvbnNcIlxuICAgIEBkaXNwb3NhYmxlcy5hZGQgYXRvbS50b29sdGlwcy5hZGQgQHNhdmVBc0J1dHRvbiwgdGl0bGU6IFwiU2F2ZSBUb2RvcyB0byBGaWxlXCJcbiAgICBAZGlzcG9zYWJsZXMuYWRkIGF0b20udG9vbHRpcHMuYWRkIEByZWZyZXNoQnV0dG9uLCB0aXRsZTogXCJSZWZyZXNoIFRvZG9zXCJcblxuICBoYW5kbGVFdmVudHM6IC0+XG4gICAgQGRpc3Bvc2FibGVzLmFkZCBhdG9tLmNvbW1hbmRzLmFkZCBAZWxlbWVudCxcbiAgICAgICdjb3JlOnNhdmUtYXMnOiAoZXZlbnQpID0+XG4gICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXG4gICAgICAgIEBzYXZlQXMoKVxuICAgICAgJ2NvcmU6cmVmcmVzaCc6IChldmVudCkgPT5cbiAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgICAgQGNvbGxlY3Rpb24uc2VhcmNoKClcblxuICAgICMgUGVyc2lzdCBwYW5lIHNpemUgYnkgc2F2aW5nIHRvIGxvY2FsIHN0b3JhZ2VcbiAgICBwYW5lID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZSgpXG4gICAgQHJlc3RvcmVQYW5lRmxleChwYW5lKSBpZiBhdG9tLmNvbmZpZy5nZXQoJ3RvZG8tc2hvdy5yZW1lbWJlclZpZXdTaXplJylcbiAgICBAZGlzcG9zYWJsZXMuYWRkIHBhbmUub2JzZXJ2ZUZsZXhTY2FsZSAoZmxleFNjYWxlKSA9PlxuICAgICAgQHNhdmVQYW5lRmxleChmbGV4U2NhbGUpXG5cbiAgICBAZGlzcG9zYWJsZXMuYWRkIEBjb2xsZWN0aW9uLm9uRGlkU3RhcnRTZWFyY2ggQHN0YXJ0TG9hZGluZ1xuICAgIEBkaXNwb3NhYmxlcy5hZGQgQGNvbGxlY3Rpb24ub25EaWRGaW5pc2hTZWFyY2ggQHN0b3BMb2FkaW5nXG4gICAgQGRpc3Bvc2FibGVzLmFkZCBAY29sbGVjdGlvbi5vbkRpZEZhaWxTZWFyY2ggKGVycikgPT5cbiAgICAgIEBzZWFyY2hDb3VudC50ZXh0IFwiU2VhcmNoIEZhaWxlZFwiXG4gICAgICBjb25zb2xlLmVycm9yIGVyciBpZiBlcnJcbiAgICAgIEBzaG93RXJyb3IgZXJyIGlmIGVyclxuXG4gICAgQGRpc3Bvc2FibGVzLmFkZCBAY29sbGVjdGlvbi5vbkRpZENoYW5nZVNlYXJjaFNjb3BlIChzY29wZSkgPT5cbiAgICAgIEBzZXRTY29wZUJ1dHRvblN0YXRlKHNjb3BlKVxuICAgICAgQGNvbGxlY3Rpb24uc2VhcmNoKClcblxuICAgIEBkaXNwb3NhYmxlcy5hZGQgQGNvbGxlY3Rpb24ub25EaWRTZWFyY2hQYXRocyAoblBhdGhzKSA9PlxuICAgICAgQHNlYXJjaENvdW50LnRleHQgXCIje25QYXRoc30gcGF0aHMgc2VhcmNoZWQuLi5cIlxuXG4gICAgQGRpc3Bvc2FibGVzLmFkZCBhdG9tLndvcmtzcGFjZS5vbkRpZENoYW5nZUFjdGl2ZVBhbmVJdGVtIChpdGVtKSA9PlxuICAgICAgaWYgQGNvbGxlY3Rpb24uc2V0QWN0aXZlUHJvamVjdChpdGVtPy5nZXRQYXRoPygpKSBvclxuICAgICAgKGl0ZW0/LmNvbnN0cnVjdG9yLm5hbWUgaXMgJ1RleHRFZGl0b3InIGFuZCBAY29sbGVjdGlvbi5zY29wZSBpcyAnYWN0aXZlJylcbiAgICAgICAgQGNvbGxlY3Rpb24uc2VhcmNoKClcblxuICAgIEBkaXNwb3NhYmxlcy5hZGQgYXRvbS53b3Jrc3BhY2Uub25EaWRBZGRUZXh0RWRpdG9yICh7dGV4dEVkaXRvcn0pID0+XG4gICAgICBAY29sbGVjdGlvbi5zZWFyY2goKSBpZiBAY29sbGVjdGlvbi5zY29wZSBpcyAnb3BlbidcblxuICAgIEBkaXNwb3NhYmxlcy5hZGQgYXRvbS53b3Jrc3BhY2Uub25EaWREZXN0cm95UGFuZUl0ZW0gKHtpdGVtfSkgPT5cbiAgICAgIEBjb2xsZWN0aW9uLnNlYXJjaCgpIGlmIEBjb2xsZWN0aW9uLnNjb3BlIGlzICdvcGVuJ1xuXG4gICAgQGRpc3Bvc2FibGVzLmFkZCBhdG9tLndvcmtzcGFjZS5vYnNlcnZlVGV4dEVkaXRvcnMgKGVkaXRvcikgPT5cbiAgICAgIEBkaXNwb3NhYmxlcy5hZGQgZWRpdG9yLm9uRGlkU2F2ZSA9PiBAY29sbGVjdGlvbi5zZWFyY2goKVxuXG4gICAgQGZpbHRlckVkaXRvclZpZXcuZ2V0TW9kZWwoKS5vbkRpZFN0b3BDaGFuZ2luZyA9PlxuICAgICAgQGZpbHRlcigpIGlmIEBmaXJzdFRpbWVGaWx0ZXJcbiAgICAgIEBmaXJzdFRpbWVGaWx0ZXIgPSB0cnVlXG5cbiAgICBAc2NvcGVCdXR0b24ub24gJ2NsaWNrJywgQHRvZ2dsZVNlYXJjaFNjb3BlXG4gICAgQG9wdGlvbnNCdXR0b24ub24gJ2NsaWNrJywgQHRvZ2dsZU9wdGlvbnNcbiAgICBAc2F2ZUFzQnV0dG9uLm9uICdjbGljaycsIEBzYXZlQXNcbiAgICBAcmVmcmVzaEJ1dHRvbi5vbiAnY2xpY2snLCA9PiBAY29sbGVjdGlvbi5zZWFyY2goKVxuXG4gIGRlc3Ryb3k6IC0+XG4gICAgQGNvbGxlY3Rpb24uY2FuY2VsU2VhcmNoKClcbiAgICBAZGlzcG9zYWJsZXMuZGlzcG9zZSgpXG4gICAgQGRldGFjaCgpXG5cbiAgc2F2ZVBhbmVGbGV4OiAoZmxleCkgLT5cbiAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSAndG9kby1zaG93LmZsZXgnLCBmbGV4XG5cbiAgcmVzdG9yZVBhbmVGbGV4OiAocGFuZSkgLT5cbiAgICBmbGV4ID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0gJ3RvZG8tc2hvdy5mbGV4J1xuICAgIHBhbmUuc2V0RmxleFNjYWxlIHBhcnNlRmxvYXQoZmxleCkgaWYgZmxleFxuXG4gIGdldFRpdGxlOiAtPiBcIlRvZG8gU2hvd1wiXG4gIGdldEljb25OYW1lOiAtPiBcImNoZWNrbGlzdFwiXG4gIGdldFVSSTogLT4gQHVyaVxuICBnZXRQcm9qZWN0TmFtZTogLT4gQGNvbGxlY3Rpb24uZ2V0QWN0aXZlUHJvamVjdE5hbWUoKVxuICBnZXRQcm9qZWN0UGF0aDogLT4gQGNvbGxlY3Rpb24uZ2V0QWN0aXZlUHJvamVjdCgpXG4gIGdldFRvZG9zOiAtPiBAY29sbGVjdGlvbi5nZXRUb2RvcygpXG4gIGdldFRvZG9zQ291bnQ6IC0+IEBjb2xsZWN0aW9uLmdldFRvZG9zQ291bnQoKVxuICBpc1NlYXJjaGluZzogLT4gQGNvbGxlY3Rpb24uZ2V0U3RhdGUoKVxuXG4gIHN0YXJ0TG9hZGluZzogPT5cbiAgICBAdG9kb0xvYWRpbmcuc2hvdygpXG4gICAgQHVwZGF0ZUluZm8oKVxuXG4gIHN0b3BMb2FkaW5nOiA9PlxuICAgIEB0b2RvTG9hZGluZy5oaWRlKClcbiAgICBAdXBkYXRlSW5mbygpXG5cbiAgdXBkYXRlSW5mbzogLT5cbiAgICBAdG9kb0luZm8uaHRtbChcIiN7QGdldEluZm9UZXh0KCl9ICN7QGdldFNjb3BlVGV4dCgpfVwiKVxuXG4gIGdldEluZm9UZXh0OiAtPlxuICAgIHJldHVybiBcIkZvdW5kIC4uLiByZXN1bHRzXCIgaWYgQGlzU2VhcmNoaW5nKClcbiAgICBzd2l0Y2ggY291bnQgPSBAZ2V0VG9kb3NDb3VudCgpXG4gICAgICB3aGVuIDEgdGhlbiBcIkZvdW5kICN7Y291bnR9IHJlc3VsdFwiXG4gICAgICBlbHNlIFwiRm91bmQgI3tjb3VudH0gcmVzdWx0c1wiXG5cbiAgZ2V0U2NvcGVUZXh0OiAtPlxuICAgICMgVE9ETzogQWxzbyBzaG93IG51bWJlciBvZiBmaWxlc1xuXG4gICAgc3dpdGNoIEBjb2xsZWN0aW9uLnNjb3BlXG4gICAgICB3aGVuICdhY3RpdmUnXG4gICAgICAgIFwiaW4gYWN0aXZlIGZpbGVcIlxuICAgICAgd2hlbiAnb3BlbidcbiAgICAgICAgXCJpbiBvcGVuIGZpbGVzXCJcbiAgICAgIHdoZW4gJ3Byb2plY3QnXG4gICAgICAgIFwiaW4gcHJvamVjdCA8Y29kZT4je0BnZXRQcm9qZWN0TmFtZSgpfTwvY29kZT5cIlxuICAgICAgZWxzZVxuICAgICAgICBcImluIHdvcmtzcGFjZVwiXG5cbiAgc2hvd0Vycm9yOiAobWVzc2FnZSA9ICcnKSAtPlxuICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvciBtZXNzYWdlLCBAbm90aWZpY2F0aW9uT3B0aW9uc1xuXG4gIHNob3dXYXJuaW5nOiAobWVzc2FnZSA9ICcnKSAtPlxuICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nIG1lc3NhZ2UsIEBub3RpZmljYXRpb25PcHRpb25zXG5cbiAgc2F2ZUFzOiA9PlxuICAgIHJldHVybiBpZiBAaXNTZWFyY2hpbmcoKVxuXG4gICAgZmlsZVBhdGggPSBcIiN7QGdldFByb2plY3ROYW1lKCkgb3IgJ3RvZG9zJ30ubWRcIlxuICAgIGlmIHByb2plY3RQYXRoID0gQGdldFByb2plY3RQYXRoKClcbiAgICAgIGZpbGVQYXRoID0gcGF0aC5qb2luKHByb2plY3RQYXRoLCBmaWxlUGF0aClcblxuICAgIGlmIG91dHB1dEZpbGVQYXRoID0gYXRvbS5zaG93U2F2ZURpYWxvZ1N5bmMoZmlsZVBhdGgudG9Mb3dlckNhc2UoKSlcbiAgICAgIGZzLndyaXRlRmlsZVN5bmMob3V0cHV0RmlsZVBhdGgsIEBjb2xsZWN0aW9uLmdldE1hcmtkb3duKCkpXG4gICAgICBhdG9tLndvcmtzcGFjZS5vcGVuKG91dHB1dEZpbGVQYXRoKVxuXG4gIHRvZ2dsZVNlYXJjaFNjb3BlOiA9PlxuICAgIHNjb3BlID0gQGNvbGxlY3Rpb24udG9nZ2xlU2VhcmNoU2NvcGUoKVxuICAgIEBzZXRTY29wZUJ1dHRvblN0YXRlKHNjb3BlKVxuXG4gIHNldFNjb3BlQnV0dG9uU3RhdGU6IChzdGF0ZSkgPT5cbiAgICBzd2l0Y2ggc3RhdGVcbiAgICAgIHdoZW4gJ3dvcmtzcGFjZScgdGhlbiBAc2NvcGVCdXR0b24udGV4dCAnV29ya3NwYWNlJ1xuICAgICAgd2hlbiAncHJvamVjdCcgdGhlbiBAc2NvcGVCdXR0b24udGV4dCAnUHJvamVjdCdcbiAgICAgIHdoZW4gJ29wZW4nIHRoZW4gQHNjb3BlQnV0dG9uLnRleHQgJ09wZW4gRmlsZXMnXG4gICAgICB3aGVuICdhY3RpdmUnIHRoZW4gQHNjb3BlQnV0dG9uLnRleHQgJ0FjdGl2ZSBGaWxlJ1xuXG4gIHRvZ2dsZU9wdGlvbnM6ID0+XG4gICAgdW5sZXNzIEB0b2RvT3B0aW9uc1xuICAgICAgQG9wdGlvbnNWaWV3LmhpZGUoKVxuICAgICAgQHRvZG9PcHRpb25zID0gbmV3IFRvZG9PcHRpb25zKEBjb2xsZWN0aW9uKVxuICAgICAgQG9wdGlvbnNWaWV3Lmh0bWwgQHRvZG9PcHRpb25zXG4gICAgQG9wdGlvbnNWaWV3LnNsaWRlVG9nZ2xlKClcblxuICBmaWx0ZXI6IC0+XG4gICAgQGNvbGxlY3Rpb24uZmlsdGVyVG9kb3MgQGZpbHRlckJ1ZmZlci5nZXRUZXh0KClcblxuICBjaGVja0RlcHJlY2F0aW9uOiAtPlxuICAgIGlmIGF0b20uY29uZmlnLmdldCgndG9kby1zaG93LmZpbmRUaGVzZVJlZ2V4ZXMnKVxuICAgICAgQHNob3dXYXJuaW5nICcnJ1xuICAgICAgRGVwcmVjYXRpb24gV2FybmluZzpcXG5cbiAgICAgIGBmaW5kVGhlc2VSZWdleGVzYCBjb25maWcgaXMgZGVwcmVjYXRlZCwgcGxlYXNlIHVzZSBgZmluZFRoZXNlVG9kb3NgIGFuZCBgZmluZFVzaW5nUmVnZXhgIGZvciBjdXN0b20gYmVoYXZpb3VyLlxuICAgICAgU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9tcm9kYWxnYWFyZC9hdG9tLXRvZG8tc2hvdyNjb25maWcgZm9yIG1vcmUgaW5mb3JtYXRpb24uXG4gICAgICAnJydcbiJdfQ==
