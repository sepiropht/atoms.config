Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

// TODO: in /lib/todo.js

var _service = require('./service');

var _service2 = _interopRequireDefault(_service);

var _todoView = require('./todo-view');

var _todoView2 = _interopRequireDefault(_todoView);

var _atom = require('atom');

'use babel';

var Todo = {
  todoView: null,
  panel: null,
  subscriptions: null,

  config: {
    a_pattern: {
      title: 'RegExp Pattern',
      description: 'used in conjunction with RegExp Flags to find todo items in your code',
      type: 'string',
      'default': 'TODO\\:.+'
    },
    b_flags: {
      title: 'RegExp Flags',
      type: 'string',
      'default': 'g'
    },
    c_ignorePaths: {
      title: 'Ignored Paths',
      description: 'comma-separated [globs](https://github.com/isaacs/node-glob#glob-primer) that should not be searched (ex: \\*\\*/ignore-me/\\*\\*, \\*\\*/and-me/\\*\\*)',
      type: 'array',
      'default': [],
      items: {
        type: 'string'
      }
    }
  },

  activate: function activate(state) {
    this.todoView = new _todoView2['default'](state.todoViewState);

    this.panel = atom.workspace.addRightPanel({
      item: this.todoView.getElement(),
      visible: false
    });

    this.subscriptions = new _atom.CompositeDisposable();

    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'todo:toggle': this.toggle.bind(this)
    }), this.panel.onDidChangeVisible(this.onDidChangeVisible.bind(this)));

    atom.emitter.on('todo:refresh', this.loadItems.bind(this));
    atom.emitter.on('todo:close', this.close.bind(this));
  },

  deactivate: function deactivate() {
    this.panel.destroy();
    this.subscriptions.dispose();
    return this.todoView.destroy();
  },

  serialize: function serialize() {
    return {
      todoViewState: this.todoView.serialize()
    };
  },

  close: function close() {
    return this.panel.hide();
  },

  toggle: function toggle() {
    if (this.panel.isVisible()) {
      this.close();
    } else {
      this.panel.show();
      atom.emitter.emit('todo:show');
      return this.loadItems();
    }
  },

  loadItems: function loadItems() {
    return this.getItems().then(this.todoView.renderItems);
  },

  getItems: function getItems() {
    return _service2['default'].findTodoItems();
  },

  onDidChangeVisible: function onDidChangeVisible(visible) {
    this.todoView.toggle(visible);
  }
};

exports['default'] = Todo;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3NlcGlyb3BodC8uYXRvbS9wYWNrYWdlcy90b2RvL2xpYi90b2RvLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O3VCQUlvQixXQUFXOzs7O3dCQUNWLGFBQWE7Ozs7b0JBQ0EsTUFBTTs7QUFOeEMsV0FBVyxDQUFDOztBQVFaLElBQU0sSUFBSSxHQUFHO0FBQ1gsVUFBUSxFQUFFLElBQUk7QUFDZCxPQUFLLEVBQUUsSUFBSTtBQUNYLGVBQWEsRUFBRSxJQUFJOztBQUVuQixRQUFNLEVBQUU7QUFDTixhQUFTLEVBQUU7QUFDVCxXQUFLLEVBQUUsZ0JBQWdCO0FBQ3ZCLGlCQUFXLEVBQUUsdUVBQXVFO0FBQ3BGLFVBQUksRUFBRSxRQUFRO0FBQ2QsaUJBQVMsV0FBVztLQUNyQjtBQUNELFdBQU8sRUFBRTtBQUNQLFdBQUssRUFBRSxjQUFjO0FBQ3JCLFVBQUksRUFBRSxRQUFRO0FBQ2QsaUJBQVMsR0FBRztLQUNiO0FBQ0QsaUJBQWEsRUFBRTtBQUNiLFdBQUssRUFBRSxlQUFlO0FBQ3RCLGlCQUFXLEVBQUUsMEpBQTBKO0FBQ3ZLLFVBQUksRUFBRSxPQUFPO0FBQ2IsaUJBQVMsRUFBRTtBQUNYLFdBQUssRUFBRTtBQUNMLFlBQUksRUFBRSxRQUFRO09BQ2Y7S0FDRjtHQUNGOztBQUVELFVBQVEsRUFBQSxrQkFBQyxLQUFLLEVBQUU7QUFDZCxRQUFJLENBQUMsUUFBUSxHQUFHLDBCQUFhLEtBQUssQ0FBQyxhQUFhLENBQUMsQ0FBQzs7QUFFbEQsUUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQztBQUN4QyxVQUFJLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUU7QUFDaEMsYUFBTyxFQUFFLEtBQUs7S0FDZixDQUFDLENBQUM7O0FBRUgsUUFBSSxDQUFDLGFBQWEsR0FBRywrQkFBdUIsQ0FBQzs7QUFFN0MsUUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQ3BCLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLGdCQUFnQixFQUFFO0FBQ2xDLG1CQUFhLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO0tBQ3RDLENBQUMsRUFFRCxJQUFJLENBQUMsS0FBSyxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FDbkUsQ0FBQzs7QUFFRixRQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztBQUMzRCxRQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztHQUN0RDs7QUFFRCxZQUFVLEVBQUEsc0JBQUc7QUFDWCxRQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ3JCLFFBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDN0IsV0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxDQUFDO0dBQ2hDOztBQUVELFdBQVMsRUFBQSxxQkFBRztBQUNWLFdBQU87QUFDTCxtQkFBYSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxFQUFFO0tBQ3pDLENBQUM7R0FDSDs7QUFFRCxPQUFLLEVBQUEsaUJBQUc7QUFDTixXQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUM7R0FDMUI7O0FBRUQsUUFBTSxFQUFBLGtCQUFHO0FBQ1AsUUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFBRSxFQUFFO0FBQzFCLFVBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztLQUNkLE1BQU07QUFDTCxVQUFJLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDO0FBQ2xCLFVBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQy9CLGFBQU8sSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO0tBQ3pCO0dBQ0Y7O0FBRUQsV0FBUyxFQUFBLHFCQUFHO0FBQ1YsV0FBTyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLENBQUM7R0FDeEQ7O0FBRUQsVUFBUSxFQUFBLG9CQUFHO0FBQ1QsV0FBTyxxQkFBUSxhQUFhLEVBQUUsQ0FBQztHQUNoQzs7QUFFRCxvQkFBa0IsRUFBQSw0QkFBQyxPQUFPLEVBQUU7QUFDMUIsUUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7R0FDL0I7Q0FDRixDQUFDOztxQkFFYSxJQUFJIiwiZmlsZSI6Ii9ob21lL3NlcGlyb3BodC8uYXRvbS9wYWNrYWdlcy90b2RvL2xpYi90b2RvLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbi8vIFRPRE86IGluIC9saWIvdG9kby5qc1xuXG5pbXBvcnQgc2VydmljZSBmcm9tICcuL3NlcnZpY2UnO1xuaW1wb3J0IFRvZG9WaWV3IGZyb20gJy4vdG9kby12aWV3JztcbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZX0gZnJvbSAnYXRvbSc7XG5cbmNvbnN0IFRvZG8gPSB7XG4gIHRvZG9WaWV3OiBudWxsLFxuICBwYW5lbDogbnVsbCxcbiAgc3Vic2NyaXB0aW9uczogbnVsbCxcblxuICBjb25maWc6IHtcbiAgICBhX3BhdHRlcm46IHtcbiAgICAgIHRpdGxlOiAnUmVnRXhwIFBhdHRlcm4nLFxuICAgICAgZGVzY3JpcHRpb246ICd1c2VkIGluIGNvbmp1bmN0aW9uIHdpdGggUmVnRXhwIEZsYWdzIHRvIGZpbmQgdG9kbyBpdGVtcyBpbiB5b3VyIGNvZGUnLFxuICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICBkZWZhdWx0OiAnVE9ET1xcXFw6LisnLFxuICAgIH0sXG4gICAgYl9mbGFnczoge1xuICAgICAgdGl0bGU6ICdSZWdFeHAgRmxhZ3MnLFxuICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICBkZWZhdWx0OiAnZycsXG4gICAgfSxcbiAgICBjX2lnbm9yZVBhdGhzOiB7XG4gICAgICB0aXRsZTogJ0lnbm9yZWQgUGF0aHMnLFxuICAgICAgZGVzY3JpcHRpb246ICdjb21tYS1zZXBhcmF0ZWQgW2dsb2JzXShodHRwczovL2dpdGh1Yi5jb20vaXNhYWNzL25vZGUtZ2xvYiNnbG9iLXByaW1lcikgdGhhdCBzaG91bGQgbm90IGJlIHNlYXJjaGVkIChleDogXFxcXCpcXFxcKi9pZ25vcmUtbWUvXFxcXCpcXFxcKiwgXFxcXCpcXFxcKi9hbmQtbWUvXFxcXCpcXFxcKiknLFxuICAgICAgdHlwZTogJ2FycmF5JyxcbiAgICAgIGRlZmF1bHQ6IFtdLFxuICAgICAgaXRlbXM6IHtcbiAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG5cbiAgYWN0aXZhdGUoc3RhdGUpIHtcbiAgICB0aGlzLnRvZG9WaWV3ID0gbmV3IFRvZG9WaWV3KHN0YXRlLnRvZG9WaWV3U3RhdGUpO1xuXG4gICAgdGhpcy5wYW5lbCA9IGF0b20ud29ya3NwYWNlLmFkZFJpZ2h0UGFuZWwoe1xuICAgICAgaXRlbTogdGhpcy50b2RvVmlldy5nZXRFbGVtZW50KCksXG4gICAgICB2aXNpYmxlOiBmYWxzZSxcbiAgICB9KTtcblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlO1xuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChcbiAgICAgIGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXdvcmtzcGFjZScsIHtcbiAgICAgICAgJ3RvZG86dG9nZ2xlJzogdGhpcy50b2dnbGUuYmluZCh0aGlzKSxcbiAgICAgIH0pLFxuXG4gICAgICAgdGhpcy5wYW5lbC5vbkRpZENoYW5nZVZpc2libGUodGhpcy5vbkRpZENoYW5nZVZpc2libGUuYmluZCh0aGlzKSlcbiAgICApO1xuXG4gICAgYXRvbS5lbWl0dGVyLm9uKCd0b2RvOnJlZnJlc2gnLCB0aGlzLmxvYWRJdGVtcy5iaW5kKHRoaXMpKTtcbiAgICBhdG9tLmVtaXR0ZXIub24oJ3RvZG86Y2xvc2UnLCB0aGlzLmNsb3NlLmJpbmQodGhpcykpO1xuICB9LFxuXG4gIGRlYWN0aXZhdGUoKSB7XG4gICAgdGhpcy5wYW5lbC5kZXN0cm95KCk7XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgICByZXR1cm4gdGhpcy50b2RvVmlldy5kZXN0cm95KCk7XG4gIH0sXG5cbiAgc2VyaWFsaXplKCkge1xuICAgIHJldHVybiB7XG4gICAgICB0b2RvVmlld1N0YXRlOiB0aGlzLnRvZG9WaWV3LnNlcmlhbGl6ZSgpLFxuICAgIH07XG4gIH0sXG5cbiAgY2xvc2UoKSB7XG4gICAgcmV0dXJuIHRoaXMucGFuZWwuaGlkZSgpO1xuICB9LFxuXG4gIHRvZ2dsZSgpIHtcbiAgICBpZiAodGhpcy5wYW5lbC5pc1Zpc2libGUoKSkge1xuICAgICAgdGhpcy5jbG9zZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnBhbmVsLnNob3coKTtcbiAgICAgIGF0b20uZW1pdHRlci5lbWl0KCd0b2RvOnNob3cnKTtcbiAgICAgIHJldHVybiB0aGlzLmxvYWRJdGVtcygpO1xuICAgIH1cbiAgfSxcblxuICBsb2FkSXRlbXMoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0SXRlbXMoKS50aGVuKHRoaXMudG9kb1ZpZXcucmVuZGVySXRlbXMpO1xuICB9LFxuXG4gIGdldEl0ZW1zKCkge1xuICAgIHJldHVybiBzZXJ2aWNlLmZpbmRUb2RvSXRlbXMoKTtcbiAgfSxcblxuICBvbkRpZENoYW5nZVZpc2libGUodmlzaWJsZSkge1xuICAgIHRoaXMudG9kb1ZpZXcudG9nZ2xlKHZpc2libGUpO1xuICB9LFxufTtcblxuZXhwb3J0IGRlZmF1bHQgVG9kbztcbiJdfQ==