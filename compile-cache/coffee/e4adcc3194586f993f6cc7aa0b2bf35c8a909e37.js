(function() {
  var $, CompositeDisposable, ShowTodoView, TableHeaderView, TodoEmptyView, TodoView, View, ref, ref1,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  CompositeDisposable = require('atom').CompositeDisposable;

  ref = require('atom-space-pen-views'), View = ref.View, $ = ref.$;

  ref1 = require('./todo-item-view'), TableHeaderView = ref1.TableHeaderView, TodoView = ref1.TodoView, TodoEmptyView = ref1.TodoEmptyView;

  module.exports = ShowTodoView = (function(superClass) {
    extend(ShowTodoView, superClass);

    function ShowTodoView() {
      this.renderTable = bind(this.renderTable, this);
      this.clearTodos = bind(this.clearTodos, this);
      this.renderTodo = bind(this.renderTodo, this);
      this.tableHeaderClicked = bind(this.tableHeaderClicked, this);
      this.initTable = bind(this.initTable, this);
      return ShowTodoView.__super__.constructor.apply(this, arguments);
    }

    ShowTodoView.content = function() {
      return this.div({
        "class": 'todo-table',
        tabindex: -1
      }, (function(_this) {
        return function() {
          return _this.table({
            outlet: 'table'
          });
        };
      })(this));
    };

    ShowTodoView.prototype.initialize = function(collection) {
      this.collection = collection;
      this.disposables = new CompositeDisposable;
      this.handleConfigChanges();
      return this.handleEvents();
    };

    ShowTodoView.prototype.handleEvents = function() {
      this.disposables.add(this.collection.onDidFinishSearch(this.initTable));
      this.disposables.add(this.collection.onDidRemoveTodo(this.removeTodo));
      this.disposables.add(this.collection.onDidClear(this.clearTodos));
      this.disposables.add(this.collection.onDidSortTodos((function(_this) {
        return function(todos) {
          return _this.renderTable(todos);
        };
      })(this)));
      this.disposables.add(this.collection.onDidFilterTodos((function(_this) {
        return function(todos) {
          return _this.renderTable(todos);
        };
      })(this)));
      return this.on('click', 'th', this.tableHeaderClicked);
    };

    ShowTodoView.prototype.handleConfigChanges = function() {
      this.disposables.add(atom.config.onDidChange('todo-show.showInTable', (function(_this) {
        return function(arg) {
          var newValue, oldValue;
          newValue = arg.newValue, oldValue = arg.oldValue;
          _this.showInTable = newValue;
          return _this.renderTable(_this.collection.getTodos());
        };
      })(this)));
      this.disposables.add(atom.config.onDidChange('todo-show.sortBy', (function(_this) {
        return function(arg) {
          var newValue, oldValue;
          newValue = arg.newValue, oldValue = arg.oldValue;
          return _this.sort(_this.sortBy = newValue, _this.sortAsc);
        };
      })(this)));
      return this.disposables.add(atom.config.onDidChange('todo-show.sortAscending', (function(_this) {
        return function(arg) {
          var newValue, oldValue;
          newValue = arg.newValue, oldValue = arg.oldValue;
          return _this.sort(_this.sortBy, _this.sortAsc = newValue);
        };
      })(this)));
    };

    ShowTodoView.prototype.destroy = function() {
      this.disposables.dispose();
      return this.empty();
    };

    ShowTodoView.prototype.initTable = function() {
      this.showInTable = atom.config.get('todo-show.showInTable');
      this.sortBy = atom.config.get('todo-show.sortBy');
      this.sortAsc = atom.config.get('todo-show.sortAscending');
      return this.sort(this.sortBy, this.sortAsc);
    };

    ShowTodoView.prototype.renderTableHeader = function() {
      return this.table.append(new TableHeaderView(this.showInTable, {
        sortBy: this.sortBy,
        sortAsc: this.sortAsc
      }));
    };

    ShowTodoView.prototype.tableHeaderClicked = function(e) {
      var item, sortAsc;
      item = e.target.innerText;
      sortAsc = this.sortBy === item ? !this.sortAsc : true;
      atom.config.set('todo-show.sortBy', item);
      return atom.config.set('todo-show.sortAscending', sortAsc);
    };

    ShowTodoView.prototype.renderTodo = function(todo) {
      return this.table.append(new TodoView(this.showInTable, todo));
    };

    ShowTodoView.prototype.removeTodo = function(todo) {
      return console.log('removeTodo');
    };

    ShowTodoView.prototype.clearTodos = function() {
      return this.table.empty();
    };

    ShowTodoView.prototype.renderTable = function(todos) {
      var i, len, ref2, todo;
      this.clearTodos();
      this.renderTableHeader();
      ref2 = todos = todos;
      for (i = 0, len = ref2.length; i < len; i++) {
        todo = ref2[i];
        this.renderTodo(todo);
      }
      if (!todos.length) {
        return this.table.append(new TodoEmptyView(this.showInTable));
      }
    };

    ShowTodoView.prototype.sort = function(sortBy, sortAsc) {
      return this.collection.sortTodos({
        sortBy: sortBy,
        sortAsc: sortAsc
      });
    };

    return ShowTodoView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvc2VwaXJvcGh0Ly5hdG9tL3BhY2thZ2VzL3RvZG8tc2hvdy9saWIvdG9kby10YWJsZS12aWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsK0ZBQUE7SUFBQTs7OztFQUFDLHNCQUF1QixPQUFBLENBQVEsTUFBUjs7RUFDeEIsTUFBWSxPQUFBLENBQVEsc0JBQVIsQ0FBWixFQUFDLGVBQUQsRUFBTzs7RUFFUCxPQUE2QyxPQUFBLENBQVEsa0JBQVIsQ0FBN0MsRUFBQyxzQ0FBRCxFQUFrQix3QkFBbEIsRUFBNEI7O0VBRTVCLE1BQU0sQ0FBQyxPQUFQLEdBQ007Ozs7Ozs7Ozs7OztJQUNKLFlBQUMsQ0FBQSxPQUFELEdBQVUsU0FBQTthQUNSLElBQUMsQ0FBQSxHQUFELENBQUs7UUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLFlBQVA7UUFBcUIsUUFBQSxFQUFVLENBQUMsQ0FBaEM7T0FBTCxFQUF3QyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7aUJBQ3RDLEtBQUMsQ0FBQSxLQUFELENBQU87WUFBQSxNQUFBLEVBQVEsT0FBUjtXQUFQO1FBRHNDO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF4QztJQURROzsyQkFJVixVQUFBLEdBQVksU0FBQyxVQUFEO01BQUMsSUFBQyxDQUFBLGFBQUQ7TUFDWCxJQUFDLENBQUEsV0FBRCxHQUFlLElBQUk7TUFDbkIsSUFBQyxDQUFBLG1CQUFELENBQUE7YUFDQSxJQUFDLENBQUEsWUFBRCxDQUFBO0lBSFU7OzJCQUtaLFlBQUEsR0FBYyxTQUFBO01BRVosSUFBQyxDQUFBLFdBQVcsQ0FBQyxHQUFiLENBQWlCLElBQUMsQ0FBQSxVQUFVLENBQUMsaUJBQVosQ0FBOEIsSUFBQyxDQUFBLFNBQS9CLENBQWpCO01BQ0EsSUFBQyxDQUFBLFdBQVcsQ0FBQyxHQUFiLENBQWlCLElBQUMsQ0FBQSxVQUFVLENBQUMsZUFBWixD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QSxFQUFRLE1BQVI7UUFBZ0IsT0FBQSxFQUFTLE9BQXpCO09BQXRCO0lBREk7Ozs7S0FwRW1CO0FBTjNCIiwic291cmNlc0NvbnRlbnQiOlsie0NvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSAnYXRvbSdcbntWaWV3LCAkfSA9IHJlcXVpcmUgJ2F0b20tc3BhY2UtcGVuLXZpZXdzJ1xuXG57VGFibGVIZWFkZXJWaWV3LCBUb2RvVmlldywgVG9kb0VtcHR5Vmlld30gPSByZXF1aXJlICcuL3RvZG8taXRlbS12aWV3J1xuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBTaG93VG9kb1ZpZXcgZXh0ZW5kcyBWaWV3XG4gIEBjb250ZW50OiAtPlxuICAgIEBkaXYgY2xhc3M6ICd0b2RvLXRhYmxlJywgdGFiaW5kZXg6IC0xLCA9PlxuICAgICAgQHRhYmxlIG91dGxldDogJ3RhYmxlJ1xuXG4gIGluaXRpYWxpemU6IChAY29sbGVjdGlvbikgLT5cbiAgICBAZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuICAgIEBoYW5kbGVDb25maWdDaGFuZ2VzKClcbiAgICBAaGFuZGxlRXZlbnRzKClcblxuICBoYW5kbGVFdmVudHM6IC0+XG4gICAgIyBAZGlzcG9zYWJsZXMuYWRkIEBjb2xsZWN0aW9uLm9uRGlkQWRkVG9kbyBAcmVuZGVyVG9kb1xuICAgIEBkaXNwb3NhYmxlcy5hZGQgQGNvbGxlY3Rpb24ub25EaWRGaW5pc2hTZWFyY2ggQGluaXRUYWJsZVxuICAgIEBkaXNwb3NhYmxlcy5hZGQgQGNvbGxlY3Rpb24ub25EaWRSZW1vdmVUb2RvIEByZW1vdmVUb2RvXG4gICAgQGRpc3Bvc2FibGVzLmFkZCBAY29sbGVjdGlvbi5vbkRpZENsZWFyIEBjbGVhclRvZG9zXG4gICAgQGRpc3Bvc2FibGVzLmFkZCBAY29sbGVjdGlvbi5vbkRpZFNvcnRUb2RvcyAodG9kb3MpID0+IEByZW5kZXJUYWJsZSB0b2Rvc1xuICAgIEBkaXNwb3NhYmxlcy5hZGQgQGNvbGxlY3Rpb24ub25EaWRGaWx0ZXJUb2RvcyAodG9kb3MpID0+IEByZW5kZXJUYWJsZSB0b2Rvc1xuXG4gICAgQG9uICdjbGljaycsICd0aCcsIEB0YWJsZUhlYWRlckNsaWNrZWRcblxuICBoYW5kbGVDb25maWdDaGFuZ2VzOiAtPlxuICAgIEBkaXNwb3NhYmxlcy5hZGQgYXRvbS5jb25maWcub25EaWRDaGFuZ2UgJ3RvZG8tc2hvdy5zaG93SW5UYWJsZScsICh7bmV3VmFsdWUsIG9sZFZhbHVlfSkgPT5cbiAgICAgIEBzaG93SW5UYWJsZSA9IG5ld1ZhbHVlXG4gICAgICBAcmVuZGVyVGFibGUgQGNvbGxlY3Rpb24uZ2V0VG9kb3MoKVxuXG4gICAgQGRpc3Bvc2FibGVzLmFkZCBhdG9tLmNvbmZpZy5vbkRpZENoYW5nZSAndG9kby1zaG93LnNvcnRCeScsICh7bmV3VmFsdWUsIG9sZFZhbHVlfSkgPT5cbiAgICAgIEBzb3J0KEBzb3J0QnkgPSBuZXdWYWx1ZSwgQHNvcnRBc2MpXG5cbiAgICBAZGlzcG9zYWJsZXMuYWRkIGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlICd0b2RvLXNob3cuc29ydEFzY2VuZGluZycsICh7bmV3VmFsdWUsIG9sZFZhbHVlfSkgPT5cbiAgICAgIEBzb3J0KEBzb3J0QnksIEBzb3J0QXNjID0gbmV3VmFsdWUpXG5cbiAgZGVzdHJveTogLT5cbiAgICBAZGlzcG9zYWJsZXMuZGlzcG9zZSgpXG4gICAgQGVtcHR5KClcblxuICBpbml0VGFibGU6ID0+XG4gICAgQHNob3dJblRhYmxlID0gYXRvbS5jb25maWcuZ2V0KCd0b2RvLXNob3cuc2hvd0luVGFibGUnKVxuICAgIEBzb3J0QnkgPSBhdG9tLmNvbmZpZy5nZXQoJ3RvZG8tc2hvdy5zb3J0QnknKVxuICAgIEBzb3J0QXNjID0gYXRvbS5jb25maWcuZ2V0KCd0b2RvLXNob3cuc29ydEFzY2VuZGluZycpXG4gICAgQHNvcnQoQHNvcnRCeSwgQHNvcnRBc2MpXG5cbiAgcmVuZGVyVGFibGVIZWFkZXI6IC0+XG4gICAgQHRhYmxlLmFwcGVuZCBuZXcgVGFibGVIZWFkZXJWaWV3KEBzaG93SW5UYWJsZSwge0Bzb3J0QnksIEBzb3J0QXNjfSlcblxuICB0YWJsZUhlYWRlckNsaWNrZWQ6IChlKSA9PlxuICAgIGl0ZW0gPSBlLnRhcmdldC5pbm5lclRleHRcbiAgICBzb3J0QXNjID0gaWYgQHNvcnRCeSBpcyBpdGVtIHRoZW4gIUBzb3J0QXNjIGVsc2UgdHJ1ZVxuXG4gICAgYXRvbS5jb25maWcuc2V0KCd0b2RvLXNob3cuc29ydEJ5JywgaXRlbSlcbiAgICBhdG9tLmNvbmZpZy5zZXQoJ3RvZG8tc2hvdy5zb3J0QXNjZW5kaW5nJywgc29ydEFzYylcblxuICByZW5kZXJUb2RvOiAodG9kbykgPT5cbiAgICBAdGFibGUuYXBwZW5kIG5ldyBUb2RvVmlldyhAc2hvd0luVGFibGUsIHRvZG8pXG5cbiAgcmVtb3ZlVG9kbzogKHRvZG8pIC0+XG4gICAgY29uc29sZS5sb2cgJ3JlbW92ZVRvZG8nXG5cbiAgY2xlYXJUb2RvczogPT5cbiAgICBAdGFibGUuZW1wdHkoKVxuXG4gIHJlbmRlclRhYmxlOiAodG9kb3MpID0+XG4gICAgQGNsZWFyVG9kb3MoKVxuICAgIEByZW5kZXJUYWJsZUhlYWRlcigpXG5cbiAgICBmb3IgdG9kbyBpbiB0b2RvcyA9IHRvZG9zXG4gICAgICBAcmVuZGVyVG9kbyh0b2RvKVxuICAgIEB0YWJsZS5hcHBlbmQgbmV3IFRvZG9FbXB0eVZpZXcoQHNob3dJblRhYmxlKSB1bmxlc3MgdG9kb3MubGVuZ3RoXG5cbiAgc29ydDogKHNvcnRCeSwgc29ydEFzYykgLT5cbiAgICBAY29sbGVjdGlvbi5zb3J0VG9kb3Moc29ydEJ5OiBzb3J0QnksIHNvcnRBc2M6IHNvcnRBc2MpXG4iXX0=
