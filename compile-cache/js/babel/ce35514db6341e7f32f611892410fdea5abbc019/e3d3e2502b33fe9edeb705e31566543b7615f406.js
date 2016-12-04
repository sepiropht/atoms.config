Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _componentsContainer = require('./components/Container');

var _componentsContainer2 = _interopRequireDefault(_componentsContainer);

'use babel';

var TodoView = (function () {
  function TodoView() /*serializedState*/{
    _classCallCheck(this, TodoView);

    this.renderItems = this.renderItems.bind(this);
    this.openFile = this.openFile.bind(this);
    this.onRefresh = this.onRefresh.bind(this);
    this.onClose = this.onClose.bind(this);

    this.element = document.createElement('todo');
    this.state = {
      items: [],
      loading: true,
      pathsSearched: 0
    };
    this._render();

    atom.emitter.on('todo:pathSearched', this.onPathsSearched.bind(this));
  }

  _createClass(TodoView, [{
    key: 'setState',
    value: function setState(state) {
      Object.assign(this.state, state);
      this._render();
    }
  }, {
    key: '_render',
    value: function _render() {
      var state = this.state;

      _reactDom2['default'].render(_react2['default'].createElement(_componentsContainer2['default'], {
        onRefresh: this.onRefresh,
        onClose: this.onClose,
        onItemClick: this.openFile,
        items: state.items,
        loading: state.loading,
        pathsSearched: state.pathsSearched
      }), this.element);
    }
  }, {
    key: 'onPathsSearched',
    value: function onPathsSearched(pathsSearched) {
      this.setState({ pathsSearched: pathsSearched });
    }
  }, {
    key: 'onRefresh',
    value: function onRefresh() {
      this.setState({
        items: [],
        loading: true
      });
      return atom.emitter.emit('todo:refresh');
    }
  }, {
    key: 'onClose',
    value: function onClose() {
      return atom.emitter.emit('todo:close');
    }
  }, {
    key: 'renderItems',
    value: function renderItems(items) {
      this.setState({
        items: items,
        loading: false
      });
    }
  }, {
    key: 'openFile',
    value: function openFile(filePath) {
      var range = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

      var rangeStart = range[0];

      if (filePath && rangeStart) {
        var initialLine = rangeStart[0];
        var initialColumn = rangeStart[1];

        return atom.workspace.open(filePath, {
          initialLine: initialLine,
          initialColumn: initialColumn
        });
      }
    }
  }, {
    key: 'serialize',
    value: function serialize() {}
  }, {
    key: 'destroy',
    value: function destroy() {
      _reactDom2['default'].unmountComponentAtNode(this.element);
      return this.element.remove();
    }
  }, {
    key: 'getElement',
    value: function getElement() {
      return this.element;
    }
  }, {
    key: 'getOutOfHereReact',
    value: function getOutOfHereReact() {
      this.state = {
        items: [],
        loading: true,
        pathsSearched: 0
      };
      _reactDom2['default'].unmountComponentAtNode(this.element);
    }
  }, {
    key: 'toggle',
    value: function toggle(visible) {
      return visible ? this._render() : this.getOutOfHereReact();
    }
  }]);

  return TodoView;
})();

exports['default'] = TodoView;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3NlcGlyb3BodC8uYXRvbS9wYWNrYWdlcy90b2RvL2xpYi90b2RvLXZpZXcuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztxQkFFa0IsT0FBTzs7Ozt3QkFDSixXQUFXOzs7O21DQUNWLHdCQUF3Qjs7OztBQUo5QyxXQUFXLENBQUM7O0lBTU4sUUFBUTtBQUNELFdBRFAsUUFBUSxzQkFDcUI7MEJBRDdCLFFBQVE7O0FBRVYsUUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUMvQyxRQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3pDLFFBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDM0MsUUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQzs7QUFFdkMsUUFBSSxDQUFDLE9BQU8sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQzlDLFFBQUksQ0FBQyxLQUFLLEdBQUc7QUFDWCxXQUFLLEVBQUUsRUFBRTtBQUNULGFBQU8sRUFBRSxJQUFJO0FBQ2IsbUJBQWEsRUFBRSxDQUFDO0tBQ2pCLENBQUM7QUFDRixRQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7O0FBRWYsUUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsbUJBQW1CLEVBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztHQUN2RTs7ZUFoQkcsUUFBUTs7V0FrQkosa0JBQUMsS0FBSyxFQUFFO0FBQ2QsWUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBQ2pDLFVBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUNoQjs7O1dBRU0sbUJBQUc7VUFDRCxLQUFLLEdBQUksSUFBSSxDQUFiLEtBQUs7O0FBRVosNEJBQVMsTUFBTSxDQUNiO0FBQ0UsaUJBQVMsRUFBRSxJQUFJLENBQUMsU0FBUyxBQUFDO0FBQzFCLGVBQU8sRUFBRSxJQUFJLENBQUMsT0FBTyxBQUFDO0FBQ3RCLG1CQUFXLEVBQUUsSUFBSSxDQUFDLFFBQVEsQUFBQztBQUMzQixhQUFLLEVBQUUsS0FBSyxDQUFDLEtBQUssQUFBQztBQUNuQixlQUFPLEVBQUUsS0FBSyxDQUFDLE9BQU8sQUFBQztBQUN2QixxQkFBYSxFQUFFLEtBQUssQ0FBQyxhQUFhLEFBQUM7UUFDbkMsRUFDRixJQUFJLENBQUMsT0FBTyxDQUNiLENBQUM7S0FDSDs7O1dBRWMseUJBQUMsYUFBYSxFQUFFO0FBQzdCLFVBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxhQUFhLEVBQWIsYUFBYSxFQUFFLENBQUMsQ0FBQztLQUNsQzs7O1dBRVEscUJBQUc7QUFDVixVQUFJLENBQUMsUUFBUSxDQUFDO0FBQ1osYUFBSyxFQUFFLEVBQUU7QUFDVCxlQUFPLEVBQUUsSUFBSTtPQUNkLENBQUMsQ0FBQztBQUNILGFBQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7S0FDMUM7OztXQUVNLG1CQUFHO0FBQ1IsYUFBTyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztLQUN4Qzs7O1dBRVUscUJBQUMsS0FBSyxFQUFFO0FBQ2pCLFVBQUksQ0FBQyxRQUFRLENBQUM7QUFDWixhQUFLLEVBQUwsS0FBSztBQUNMLGVBQU8sRUFBRSxLQUFLO09BQ2YsQ0FBQyxDQUFDO0tBQ0o7OztXQUVPLGtCQUFDLFFBQVEsRUFBYztVQUFaLEtBQUsseURBQUcsRUFBRTs7QUFDM0IsVUFBTSxVQUFVLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDOztBQUU1QixVQUFJLFFBQVEsSUFBSSxVQUFVLEVBQUU7QUFDMUIsWUFBTSxXQUFXLEdBQUcsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2xDLFlBQU0sYUFBYSxHQUFHLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7QUFFcEMsZUFBTyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUU7QUFDbkMscUJBQVcsRUFBWCxXQUFXO0FBQ1gsdUJBQWEsRUFBYixhQUFhO1NBQ2QsQ0FBQyxDQUFDO09BQ0o7S0FDRjs7O1dBRVEscUJBQUcsRUFBRTs7O1dBRVAsbUJBQUc7QUFDUiw0QkFBUyxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDOUMsYUFBTyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDO0tBQzlCOzs7V0FFUyxzQkFBRztBQUNYLGFBQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQztLQUNyQjs7O1dBRWdCLDZCQUFHO0FBQ2xCLFVBQUksQ0FBQyxLQUFLLEdBQUc7QUFDWCxhQUFLLEVBQUUsRUFBRTtBQUNULGVBQU8sRUFBRSxJQUFJO0FBQ2IscUJBQWEsRUFBRSxDQUFDO09BQ2pCLENBQUM7QUFDRiw0QkFBUyxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7S0FDL0M7OztXQUVLLGdCQUFDLE9BQU8sRUFBRTtBQUNkLGFBQU8sT0FBTyxHQUNaLElBQUksQ0FBQyxPQUFPLEVBQUUsR0FDZCxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztLQUM1Qjs7O1NBcEdHLFFBQVE7OztxQkF1R0MsUUFBUSIsImZpbGUiOiIvaG9tZS9zZXBpcm9waHQvLmF0b20vcGFja2FnZXMvdG9kby9saWIvdG9kby12aWV3LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgUmVhY3RET00gZnJvbSAncmVhY3QtZG9tJztcbmltcG9ydCBDb250YWluZXIgZnJvbSAnLi9jb21wb25lbnRzL0NvbnRhaW5lcic7XG5cbmNsYXNzIFRvZG9WaWV3IHtcbiAgY29uc3RydWN0b3IoLypzZXJpYWxpemVkU3RhdGUqLykge1xuICAgIHRoaXMucmVuZGVySXRlbXMgPSB0aGlzLnJlbmRlckl0ZW1zLmJpbmQodGhpcyk7XG4gICAgdGhpcy5vcGVuRmlsZSA9IHRoaXMub3BlbkZpbGUuYmluZCh0aGlzKTtcbiAgICB0aGlzLm9uUmVmcmVzaCA9IHRoaXMub25SZWZyZXNoLmJpbmQodGhpcyk7XG4gICAgdGhpcy5vbkNsb3NlID0gdGhpcy5vbkNsb3NlLmJpbmQodGhpcyk7XG5cbiAgICB0aGlzLmVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0b2RvJyk7XG4gICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgIGl0ZW1zOiBbXSxcbiAgICAgIGxvYWRpbmc6IHRydWUsXG4gICAgICBwYXRoc1NlYXJjaGVkOiAwLFxuICAgIH07XG4gICAgdGhpcy5fcmVuZGVyKCk7XG5cbiAgICBhdG9tLmVtaXR0ZXIub24oJ3RvZG86cGF0aFNlYXJjaGVkJywgdGhpcy5vblBhdGhzU2VhcmNoZWQuYmluZCh0aGlzKSk7XG4gIH1cblxuICBzZXRTdGF0ZShzdGF0ZSkge1xuICAgIE9iamVjdC5hc3NpZ24odGhpcy5zdGF0ZSwgc3RhdGUpO1xuICAgIHRoaXMuX3JlbmRlcigpO1xuICB9XG5cbiAgX3JlbmRlcigpIHtcbiAgICBjb25zdCB7c3RhdGV9ID0gdGhpcztcblxuICAgIFJlYWN0RE9NLnJlbmRlcihcbiAgICAgIDxDb250YWluZXJcbiAgICAgICAgb25SZWZyZXNoPXt0aGlzLm9uUmVmcmVzaH1cbiAgICAgICAgb25DbG9zZT17dGhpcy5vbkNsb3NlfVxuICAgICAgICBvbkl0ZW1DbGljaz17dGhpcy5vcGVuRmlsZX1cbiAgICAgICAgaXRlbXM9e3N0YXRlLml0ZW1zfVxuICAgICAgICBsb2FkaW5nPXtzdGF0ZS5sb2FkaW5nfVxuICAgICAgICBwYXRoc1NlYXJjaGVkPXtzdGF0ZS5wYXRoc1NlYXJjaGVkfVxuICAgICAgLz4sXG4gICAgICB0aGlzLmVsZW1lbnRcbiAgICApO1xuICB9XG5cbiAgb25QYXRoc1NlYXJjaGVkKHBhdGhzU2VhcmNoZWQpIHtcbiAgICB0aGlzLnNldFN0YXRlKHsgcGF0aHNTZWFyY2hlZCB9KTtcbiAgfVxuXG4gIG9uUmVmcmVzaCgpIHtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGl0ZW1zOiBbXSxcbiAgICAgIGxvYWRpbmc6IHRydWUsXG4gICAgfSk7XG4gICAgcmV0dXJuIGF0b20uZW1pdHRlci5lbWl0KCd0b2RvOnJlZnJlc2gnKTtcbiAgfVxuXG4gIG9uQ2xvc2UoKSB7XG4gICAgcmV0dXJuIGF0b20uZW1pdHRlci5lbWl0KCd0b2RvOmNsb3NlJyk7XG4gIH1cblxuICByZW5kZXJJdGVtcyhpdGVtcykge1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgaXRlbXMsXG4gICAgICBsb2FkaW5nOiBmYWxzZSxcbiAgICB9KTtcbiAgfVxuXG4gIG9wZW5GaWxlKGZpbGVQYXRoLCByYW5nZSA9IFtdKSB7XG4gICAgY29uc3QgcmFuZ2VTdGFydCA9IHJhbmdlWzBdO1xuXG4gICAgaWYgKGZpbGVQYXRoICYmIHJhbmdlU3RhcnQpIHtcbiAgICAgIGNvbnN0IGluaXRpYWxMaW5lID0gcmFuZ2VTdGFydFswXTtcbiAgICAgIGNvbnN0IGluaXRpYWxDb2x1bW4gPSByYW5nZVN0YXJ0WzFdO1xuXG4gICAgICByZXR1cm4gYXRvbS53b3Jrc3BhY2Uub3BlbihmaWxlUGF0aCwge1xuICAgICAgICBpbml0aWFsTGluZSxcbiAgICAgICAgaW5pdGlhbENvbHVtbixcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIHNlcmlhbGl6ZSgpIHt9XG5cbiAgZGVzdHJveSgpIHtcbiAgICBSZWFjdERPTS51bm1vdW50Q29tcG9uZW50QXROb2RlKHRoaXMuZWxlbWVudCk7XG4gICAgcmV0dXJuIHRoaXMuZWxlbWVudC5yZW1vdmUoKTtcbiAgfVxuXG4gIGdldEVsZW1lbnQoKSB7XG4gICAgcmV0dXJuIHRoaXMuZWxlbWVudDtcbiAgfVxuXG4gIGdldE91dE9mSGVyZVJlYWN0KCkge1xuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICBpdGVtczogW10sXG4gICAgICBsb2FkaW5nOiB0cnVlLFxuICAgICAgcGF0aHNTZWFyY2hlZDogMCxcbiAgICB9O1xuICAgIFJlYWN0RE9NLnVubW91bnRDb21wb25lbnRBdE5vZGUodGhpcy5lbGVtZW50KTtcbiAgfVxuXG4gIHRvZ2dsZSh2aXNpYmxlKSB7XG4gICAgcmV0dXJuIHZpc2libGVcbiAgICA/IHRoaXMuX3JlbmRlcigpXG4gICAgOiB0aGlzLmdldE91dE9mSGVyZVJlYWN0KCk7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgVG9kb1ZpZXc7XG4iXX0=