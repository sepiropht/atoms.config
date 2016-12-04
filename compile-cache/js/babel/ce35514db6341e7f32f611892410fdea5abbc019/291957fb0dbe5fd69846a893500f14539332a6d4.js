Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _Tree = require('./Tree');

var _Tree2 = _interopRequireDefault(_Tree);

'use babel';

var TreeNode = (function (_React$Component) {
  _inherits(TreeNode, _React$Component);

  function TreeNode() {
    _classCallCheck(this, TreeNode);

    _get(Object.getPrototypeOf(TreeNode.prototype), 'constructor', this).call(this);
    this.onClick = this.onClick.bind(this);
    this.state = {
      collapsed: false
    };
  }

  _createClass(TreeNode, [{
    key: 'render',
    value: function render() {
      var isLeaf = this.props.nodes.length === 0;
      var containerClassName = isLeaf ? 'list-item' : 'list-nested-item';

      if (this.state.collapsed) {
        containerClassName += ' collapsed';
      }

      var thisItemClassName = this.props.icon ? 'icon ' + this.props.icon : '';

      // TODO: add classes to subdue directories and highlight text nodes

      return _react2['default'].createElement(
        'li',
        {
          className: containerClassName,
          onClick: this.onClick
        },
        _react2['default'].createElement(
          'div',
          { className: 'list-item' },
          _react2['default'].createElement(
            'span',
            { className: thisItemClassName },
            this.props.text
          )
        ),
        !isLeaf && _react2['default'].createElement(_Tree2['default'], {
          data: {
            nodes: this.props.nodes
          },
          onNodeClick: this.props.onClick
        })
      );
    }
  }, {
    key: 'onClick',
    value: function onClick(event) {
      event.stopPropagation();

      if (this.props.nodes.length) {
        this.setState({
          collapsed: !this.state.collapsed
        });
      } else if (this.props.onClick) {
        this.props.onClick(this.props.data);
      }
    }
  }]);

  return TreeNode;
})(_react2['default'].Component);

TreeNode.propTypes = {
  text: _react.PropTypes.string.isRequired,
  nodes: _react.PropTypes.array.isRequired,
  icon: _react.PropTypes.string,
  onClick: _react.PropTypes.func,
  data: _react.PropTypes.object
};

exports['default'] = TreeNode;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3NlcGlyb3BodC8uYXRvbS9wYWNrYWdlcy90b2RvL2xpYi9jb21wb25lbnRzL1RyZWVOb2RlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O3FCQUUrQixPQUFPOzs7O29CQUNyQixRQUFROzs7O0FBSHpCLFdBQVcsQ0FBQzs7SUFLTixRQUFRO1lBQVIsUUFBUTs7QUFDRCxXQURQLFFBQVEsR0FDRTswQkFEVixRQUFROztBQUVWLCtCQUZFLFFBQVEsNkNBRUY7QUFDUixRQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3ZDLFFBQUksQ0FBQyxLQUFLLEdBQUc7QUFDWCxlQUFTLEVBQUUsS0FBSztLQUNqQixDQUFDO0dBQ0g7O2VBUEcsUUFBUTs7V0FTTixrQkFBRztBQUNQLFVBQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUM7QUFDN0MsVUFBSSxrQkFBa0IsR0FBRyxNQUFNLEdBQzNCLFdBQVcsR0FDWCxrQkFBa0IsQ0FBQzs7QUFFdkIsVUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFBRTtBQUN4QiwwQkFBa0IsSUFBSSxZQUFZLENBQUM7T0FDcEM7O0FBRUQsVUFBTSxpQkFBaUIsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksYUFDN0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEdBQ3ZCLEVBQUUsQ0FBQzs7OztBQUlQLGFBQ0U7OztBQUNFLG1CQUFTLEVBQUUsa0JBQWtCLEFBQUM7QUFDOUIsaUJBQU8sRUFBRSxJQUFJLENBQUMsT0FBTyxBQUFDOztRQUV0Qjs7WUFBSyxTQUFTLEVBQUMsV0FBVztVQUN4Qjs7Y0FBTSxTQUFTLEVBQUUsaUJBQWlCLEFBQUM7WUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUk7V0FBUTtTQUN4RDtRQUdKLENBQUMsTUFBTSxJQUNQO0FBQ0UsY0FBSSxFQUFFO0FBQ0osaUJBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUs7V0FDeEIsQUFBQztBQUNGLHFCQUFXLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEFBQUM7VUFDaEM7T0FFRCxDQUNMO0tBQ0g7OztXQUVNLGlCQUFDLEtBQUssRUFBRTtBQUNiLFdBQUssQ0FBQyxlQUFlLEVBQUUsQ0FBQzs7QUFFeEIsVUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUU7QUFDM0IsWUFBSSxDQUFDLFFBQVEsQ0FBQztBQUNaLG1CQUFTLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVM7U0FDakMsQ0FBQyxDQUFDO09BQ0osTUFBTSxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFO0FBQzdCLFlBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7T0FDckM7S0FDRjs7O1NBekRHLFFBQVE7R0FBUyxtQkFBTSxTQUFTOztBQTREdEMsUUFBUSxDQUFDLFNBQVMsR0FBRztBQUNuQixNQUFJLEVBQUUsaUJBQVUsTUFBTSxDQUFDLFVBQVU7QUFDakMsT0FBSyxFQUFFLGlCQUFVLEtBQUssQ0FBQyxVQUFVO0FBQ2pDLE1BQUksRUFBRSxpQkFBVSxNQUFNO0FBQ3RCLFNBQU8sRUFBRSxpQkFBVSxJQUFJO0FBQ3ZCLE1BQUksRUFBRSxpQkFBVSxNQUFNO0NBQ3ZCLENBQUM7O3FCQUVhLFFBQVEiLCJmaWxlIjoiL2hvbWUvc2VwaXJvcGh0Ly5hdG9tL3BhY2thZ2VzL3RvZG8vbGliL2NvbXBvbmVudHMvVHJlZU5vZGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuaW1wb3J0IFJlYWN0LCB7UHJvcFR5cGVzfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgVHJlZSBmcm9tICcuL1RyZWUnO1xuXG5jbGFzcyBUcmVlTm9kZSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5vbkNsaWNrID0gdGhpcy5vbkNsaWNrLmJpbmQodGhpcyk7XG4gICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgIGNvbGxhcHNlZDogZmFsc2UsXG4gICAgfTtcbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCBpc0xlYWYgPSB0aGlzLnByb3BzLm5vZGVzLmxlbmd0aCA9PT0gMDtcbiAgICBsZXQgY29udGFpbmVyQ2xhc3NOYW1lID0gaXNMZWFmXG4gICAgICA/ICdsaXN0LWl0ZW0nXG4gICAgICA6ICdsaXN0LW5lc3RlZC1pdGVtJztcblxuICAgIGlmICh0aGlzLnN0YXRlLmNvbGxhcHNlZCkge1xuICAgICAgY29udGFpbmVyQ2xhc3NOYW1lICs9ICcgY29sbGFwc2VkJztcbiAgICB9XG5cbiAgICBjb25zdCB0aGlzSXRlbUNsYXNzTmFtZSA9IHRoaXMucHJvcHMuaWNvblxuICAgICAgPyBgaWNvbiAke3RoaXMucHJvcHMuaWNvbn1gXG4gICAgICA6ICcnO1xuXG4gICAgLy8gVE9ETzogYWRkIGNsYXNzZXMgdG8gc3ViZHVlIGRpcmVjdG9yaWVzIGFuZCBoaWdobGlnaHQgdGV4dCBub2Rlc1xuXG4gICAgcmV0dXJuIChcbiAgICAgIDxsaVxuICAgICAgICBjbGFzc05hbWU9e2NvbnRhaW5lckNsYXNzTmFtZX1cbiAgICAgICAgb25DbGljaz17dGhpcy5vbkNsaWNrfVxuICAgICAgICA+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPSdsaXN0LWl0ZW0nPlxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT17dGhpc0l0ZW1DbGFzc05hbWV9Pnt0aGlzLnByb3BzLnRleHR9PC9zcGFuPlxuICAgICAgICA8L2Rpdj5cblxuICAgICAgICB7XG4gICAgICAgICAgIWlzTGVhZiAmJlxuICAgICAgICAgIDxUcmVlXG4gICAgICAgICAgICBkYXRhPXt7XG4gICAgICAgICAgICAgIG5vZGVzOiB0aGlzLnByb3BzLm5vZGVzLFxuICAgICAgICAgICAgfX1cbiAgICAgICAgICAgIG9uTm9kZUNsaWNrPXt0aGlzLnByb3BzLm9uQ2xpY2t9XG4gICAgICAgICAgLz5cbiAgICAgICAgfVxuICAgICAgPC9saT5cbiAgICApO1xuICB9XG5cbiAgb25DbGljayhldmVudCkge1xuICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgaWYgKHRoaXMucHJvcHMubm9kZXMubGVuZ3RoKSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgY29sbGFwc2VkOiAhdGhpcy5zdGF0ZS5jb2xsYXBzZWQsXG4gICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKHRoaXMucHJvcHMub25DbGljaykge1xuICAgICAgdGhpcy5wcm9wcy5vbkNsaWNrKHRoaXMucHJvcHMuZGF0YSk7XG4gICAgfVxuICB9XG59XG5cblRyZWVOb2RlLnByb3BUeXBlcyA9IHtcbiAgdGV4dDogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuICBub2RlczogUHJvcFR5cGVzLmFycmF5LmlzUmVxdWlyZWQsXG4gIGljb246IFByb3BUeXBlcy5zdHJpbmcsXG4gIG9uQ2xpY2s6IFByb3BUeXBlcy5mdW5jLFxuICBkYXRhOiBQcm9wVHlwZXMub2JqZWN0LFxufTtcblxuZXhwb3J0IGRlZmF1bHQgVHJlZU5vZGU7XG4iXX0=