(function() {
  var TableHeaderView, TodoEmptyView, TodoView, View,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  View = require('atom-space-pen-views').View;

  TableHeaderView = (function(superClass) {
    extend(TableHeaderView, superClass);

    function TableHeaderView() {
      return TableHeaderView.__super__.constructor.apply(this, arguments);
    }

    TableHeaderView.content = function(showInTable, arg) {
      var sortAsc, sortBy;
      if (showInTable == null) {
        showInTable = [];
      }
      sortBy = arg.sortBy, sortAsc = arg.sortAsc;
      return this.tr((function(_this) {
        return function() {
          var i, item, len, results;
          results = [];
          for (i = 0, len = showInTable.length; i < len; i++) {
            item = showInTable[i];
            results.push(_this.th(item, function() {
              if (item === sortBy && sortAsc) {
                _this.div({
                  "class": 'sort-asc icon-triangle-down active'
                });
              } else {
                _this.div({
                  "class": 'sort-asc icon-triangle-down'
                });
              }
              if (item === sortBy && !sortAsc) {
                return _this.div({
                  "class": 'sort-desc icon-triangle-up active'
                });
              } else {
                return _this.div({
                  "class": 'sort-desc icon-triangle-up'
                });
              }
            }));
          }
          return results;
        };
      })(this));
    };

    return TableHeaderView;

  })(View);

  TodoView = (function(superClass) {
    extend(TodoView, superClass);

    function TodoView() {
      this.openPath = bind(this.openPath, this);
      return TodoView.__super__.constructor.apply(this, arguments);
    }

    TodoView.content = function(showInTable, todo) {
      if (showInTable == null) {
        showInTable = [];
      }
      return this.tr((function(_this) {
        return function() {
          var i, item, len, results;
          results = [];
          for (i = 0, len = showInTable.length; i < len; i++) {
            item = showInTable[i];
            results.push(_this.td(function() {
              switch (item) {
                case 'All':
                  return _this.span(todo.all);
                case 'Text':
                  return _this.span(todo.text);
                case 'Type':
                  return _this.i(todo.type);
                case 'Range':
                  return _this.i(todo.range);
                case 'Line':
                  return _this.i(todo.line);
                case 'Regex':
                  return _this.code(todo.regex);
                case 'Path':
                  return _this.a(todo.path);
                case 'File':
                  return _this.a(todo.file);
                case 'Tags':
                  return _this.i(todo.tags);
                case 'Id':
                  return _this.i(todo.id);
                case 'Project':
                  return _this.a(todo.project);
              }
            }));
          }
          return results;
        };
      })(this));
    };

    TodoView.prototype.initialize = function(showInTable, todo1) {
      this.todo = todo1;
      return this.handleEvents();
    };

    TodoView.prototype.destroy = function() {
      return this.detach();
    };

    TodoView.prototype.handleEvents = function() {
      return this.on('click', 'td', this.openPath);
    };

    TodoView.prototype.openPath = function() {
      var pending, position;
      if (!(this.todo && this.todo.loc)) {
        return;
      }
      position = [this.todo.position[0][0], this.todo.position[0][1]];
      pending = atom.config.get('core.allowPendingPaneItems') || false;
      return atom.workspace.open(this.todo.loc, {
        split: 'left',
        pending: pending
      }).then(function() {
        var textEditor;
        if (textEditor = atom.workspace.getActiveTextEditor()) {
          textEditor.setCursorBufferPosition(position, {
            autoscroll: false
          });
          return textEditor.scrollToCursorPosition({
            center: true
          });
        }
      });
    };

    return TodoView;

  })(View);

  TodoEmptyView = (function(superClass) {
    extend(TodoEmptyView, superClass);

    function TodoEmptyView() {
      return TodoEmptyView.__super__.constructor.apply(this, arguments);
    }

    TodoEmptyView.content = function(showInTable) {
      if (showInTable == null) {
        showInTable = [];
      }
      return this.tr((function(_this) {
        return function() {
          return _this.td({
            colspan: showInTable.length
          }, function() {
            return _this.p("No results...");
          });
        };
      })(this));
    };

    return TodoEmptyView;

  })(View);

  module.exports = {
    TableHeaderView: TableHeaderView,
    TodoView: TodoView,
    TodoEmptyView: TodoEmptyView
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvc2VwaXJvcGh0Ly5hdG9tL3BhY2thZ2VzL3RvZG8tc2hvdy9saWIvdG9kby1pdGVtLXZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSw4Q0FBQTtJQUFBOzs7O0VBQUMsT0FBUSxPQUFBLENBQVEsc0JBQVI7O0VBRUg7Ozs7Ozs7SUFDSixlQUFDLENBQUEsT0FBRCxHQUFVLFNBQUMsV0FBRCxFQUFtQixHQUFuQjtBQUNSLFVBQUE7O1FBRFMsY0FBYzs7TUFBSyxxQkFBUTthQUNwQyxJQUFDLENBQUEsRUFBRCxDQUFJLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtBQUNGLGNBQUE7QUFBQTtlQUFBLDZDQUFBOzt5QkFDRSxLQUFDLENBQUEsRUFBRCxDQUFJLElBQUosRUFBVSxTQUFBO2NBQ1IsSUFBRyxJQUFBLEtBQVEsTUFBUixJQUFtQixPQUF0QjtnQkFDRSxLQUFDLENBQUEsR0FBRCxDQUFLO2tCQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sb0NBQVA7aUJBQUwsRUFERjtlQUFBLE1BQUE7Z0JBR0UsS0FBQyxDQUFBLEdBQUQsQ0FBSztrQkFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLDZCQUFQO2lCQUFMLEVBSEY7O2NBSUEsSUFBRyxJQUFBLEtBQVEsTUFBUixJQUFtQixDQUFJLE9BQTFCO3VCQUNFLEtBQUMsQ0FBQSxHQUFELENBQUs7a0JBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxtQ0FBUDtpQkFBTCxFQURGO2VBQUEsTUFBQTt1QkFHRSxLQUFDLENBQUEsR0FBRCxDQUFLO2tCQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sNEJBQVA7aUJBQUwsRUFIRjs7WUFMUSxDQUFWO0FBREY7O1FBREU7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUo7SUFEUTs7OztLQURrQjs7RUFjeEI7Ozs7Ozs7O0lBQ0osUUFBQyxDQUFBLE9BQUQsR0FBVSxTQUFDLFdBQUQs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QVUsU0FBQyxXQUFEOztRQUFDLGNBQWM7O2FBQ3ZCLElBQUMsQ0FBQSxFQUFELENBQUksQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO2lCQUNGLEtBQUMsQ0FBQSxFQUFELENBQUk7WUFBQSxPQUFBLEVBQVMsV0FBVyxDQUFDLE1BQXJCO1dBQUosRUFBaUMsU0FBQTttQkFDL0IsS0FBQyxDQUFBLENBQUQsQ0FBRyxlQUFIO1VBRCtCLENBQWpDO1FBREU7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUo7SUFEUTs7OztLQURnQjs7RUFNNUIsTUFBTSxDQUFDLE9BQVAsR0FBaUI7SUFBQyxpQkFBQSxlQUFEO0lBQWtCLFVBQUEsUUFBbEI7SUFBNEIsZUFBQSxhQUE1Qjs7QUEzRGpCIiwic291cmNlc0NvbnRlbnQiOlsie1ZpZXd9ID0gcmVxdWlyZSAnYXRvbS1zcGFjZS1wZW4tdmlld3MnXG5cbmNsYXNzIFRhYmxlSGVhZGVyVmlldyBleHRlbmRzIFZpZXdcbiAgQGNvbnRlbnQ6IChzaG93SW5UYWJsZSA9IFtdLCB7c29ydEJ5LCBzb3J0QXNjfSkgLT5cbiAgICBAdHIgPT5cbiAgICAgIGZvciBpdGVtIGluIHNob3dJblRhYmxlXG4gICAgICAgIEB0aCBpdGVtLCA9PlxuICAgICAgICAgIGlmIGl0ZW0gaXMgc29ydEJ5IGFuZCBzb3J0QXNjXG4gICAgICAgICAgICBAZGl2IGNsYXNzOiAnc29ydC1hc2MgaWNvbi10cmlhbmdsZS1kb3duIGFjdGl2ZSdcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBAZGl2IGNsYXNzOiAnc29ydC1hc2MgaWNvbi10cmlhbmdsZS1kb3duJ1xuICAgICAgICAgIGlmIGl0ZW0gaXMgc29ydEJ5IGFuZCBub3Qgc29ydEFzY1xuICAgICAgICAgICAgQGRpdiBjbGFzczogJ3NvcnQtZGVzYyBpY29uLXRyaWFuZ2xlLXVwIGFjdGl2ZSdcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBAZGl2IGNsYXNzOiAnc29ydC1kZXNjIGljb24tdHJpYW5nbGUtdXAnXG5cbmNsYXNzIFRvZG9WaWV3IGV4dGVuZHMgVmlld1xuICBAY29udGVudDogKHNob3dJblRhYmxlID0gW10sIHRvZG8pIC0+XG4gICAgQHRyID0+XG4gICAgICBmb3IgaXRlbSBpbiBzaG93SW5UYWJsZVxuICAgICAgICBAdGQgPT5cbiAgICAgICAgICBzd2l0Y2ggaXRlbVxuICAgICAgICAgICAgd2hlbiAnQWxsJyAgIHRoZW4gQHNwYW4gdG9kby5hbGxcbiAgICAgICAgICAgIHdoZW4gJ1RleHQnICB0aGVuIEBzcGFuIHRvZG8udGV4dFxuICAgICAgICAgICAgd2hlbiAnVHlwZScgIHRoZW4gQGkgdG9kby50eXBlXG4gICAgICAgICAgICB3aGVuICdSYW5nZScgdGhlbiBAaSB0b2RvLnJhbmdlXG4gICAgICAgICAgICB3aGVuICdMaW5lJyAgdGhlbiBAaSB0b2RvLmxpbmVcbiAgICAgICAgICAgIHdoZW4gJ1JlZ2V4JyB0aGVuIEBjb2RlIHRvZG8ucmVnZXhcbiAgICAgICAgICAgIHdoZW4gJ1BhdGgnICB0aGVuIEBhIHRvZG8ucGF0aFxuICAgICAgICAgICAgd2hlbiAnRmlsZScgIHRoZW4gQGEgdG9kby5maWxlXG4gICAgICAgICAgICB3aGVuICdUYWdzJyAgdGhlbiBAaSB0b2RvLnRhZ3NcbiAgICAgICAgICAgIHdoZW4gJ0lkJyAgICB0aGVuIEBpIHRvZG8uaWRcbiAgICAgICAgICAgIHdoZW4gJ1Byb2plY3QnIHRoZW4gQGEgdG9kby5wcm9qZWN0XG5cbiAgaW5pdGlhbGl6ZTogKHNob3dJblRhYmxlLCBAdG9kbykgLT5cbiAgICBAaGFuZGxlRXZlbnRzKClcblxuICBkZXN0cm95OiAtPlxuICAgIEBkZXRhY2goKVxuXG4gIGhhbmRsZUV2ZW50czogLT5cbiAgICBAb24gJ2NsaWNrJywgJ3RkJywgQG9wZW5QYXRoXG5cbiAgb3BlblBhdGg6ID0+XG4gICAgcmV0dXJuIHVubGVzcyBAdG9kbyBhbmQgQHRvZG8ubG9jXG4gICAgcG9zaXRpb24gPSBbQHRvZG8ucG9zaXRpb25bMF1bMF0sIEB0b2RvLnBvc2l0aW9uWzBdWzFdXVxuICAgIHBlbmRpbmcgPSBhdG9tLmNvbmZpZy5nZXQoJ2NvcmUuYWxsb3dQZW5kaW5nUGFuZUl0ZW1zJykgb3IgZmFsc2VcblxuICAgIGF0b20ud29ya3NwYWNlLm9wZW4oQHRvZG8ubG9jLCB7c3BsaXQ6ICdsZWZ0JywgcGVuZGluZ30pLnRoZW4gLT5cbiAgICAgIGlmIHRleHRFZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICAgICAgdGV4dEVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihwb3NpdGlvbiwgYXV0b3Njcm9sbDogZmFsc2UpXG4gICAgICAgIHRleHRFZGl0b3Iuc2Nyb2xsVG9DdXJzb3JQb3NpdGlvbihjZW50ZXI6IHRydWUpXG5cbmNsYXNzIFRvZG9FbXB0eVZpZXcgZXh0ZW5kcyBWaWV3XG4gIEBjb250ZW50OiAoc2hvd0luVGFibGUgPSBbXSkgLT5cbiAgICBAdHIgPT5cbiAgICAgIEB0ZCBjb2xzcGFuOiBzaG93SW5UYWJsZS5sZW5ndGgsID0+XG4gICAgICAgIEBwIFwiTm8gcmVzdWx0cy4uLlwiXG5cbm1vZHVsZS5leHBvcnRzID0ge1RhYmxlSGVhZGVyVmlldywgVG9kb1ZpZXcsIFRvZG9FbXB0eVZpZXd9XG4iXX0=
