Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _TreeNode = require('./TreeNode');

var _TreeNode2 = _interopRequireDefault(_TreeNode);

'use babel';

function Tree(props) {
  return _react2['default'].createElement(
    'ul',
    { className: 'list-tree has-collapsable-children' },
    props.data.nodes.map(function (node, i) {
      return _react2['default'].createElement(_TreeNode2['default'], _extends({}, node, {
        key: i,
        onClick: props.onNodeClick
      }));
    })
  );
}

Tree.propTypes = {
  data: _react.PropTypes.shape({
    nodes: _react.PropTypes.arrayOf(_react.PropTypes.shape({
      text: _react.PropTypes.string.isRequired
    })).isRequired
  }),
  onNodeClick: _react.PropTypes.func
};

exports['default'] = Tree;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3NlcGlyb3BodC8uYXRvbS9wYWNrYWdlcy90b2RvL2xpYi9jb21wb25lbnRzL1RyZWUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7cUJBRStCLE9BQU87Ozs7d0JBQ2pCLFlBQVk7Ozs7QUFIakMsV0FBVyxDQUFDOztBQUtaLFNBQVMsSUFBSSxDQUFDLEtBQUssRUFBRTtBQUNuQixTQUNFOztNQUFJLFNBQVMsRUFBQyxvQ0FBb0M7SUFFOUMsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFVBQUMsSUFBSSxFQUFFLENBQUM7YUFDM0IscUVBQ00sSUFBSTtBQUNSLFdBQUcsRUFBRSxDQUFDLEFBQUM7QUFDUCxlQUFPLEVBQUUsS0FBSyxDQUFDLFdBQVcsQUFBQztTQUMzQjtLQUFBLENBQ0g7R0FFQSxDQUNMO0NBQ0g7O0FBRUQsSUFBSSxDQUFDLFNBQVMsR0FBRztBQUNmLE1BQUksRUFBRSxpQkFBVSxLQUFLLENBQUM7QUFDcEIsU0FBSyxFQUFFLGlCQUFVLE9BQU8sQ0FBQyxpQkFBVSxLQUFLLENBQUM7QUFDdkMsVUFBSSxFQUFFLGlCQUFVLE1BQU0sQ0FBQyxVQUFVO0tBQ2xDLENBQUMsQ0FBQyxDQUFDLFVBQVU7R0FDZixDQUFDO0FBQ0YsYUFBVyxFQUFFLGlCQUFVLElBQUk7Q0FDNUIsQ0FBQzs7cUJBRWEsSUFBSSIsImZpbGUiOiIvaG9tZS9zZXBpcm9waHQvLmF0b20vcGFja2FnZXMvdG9kby9saWIvY29tcG9uZW50cy9UcmVlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbmltcG9ydCBSZWFjdCwge1Byb3BUeXBlc30gZnJvbSAncmVhY3QnO1xuaW1wb3J0IFRyZWVOb2RlIGZyb20gJy4vVHJlZU5vZGUnO1xuXG5mdW5jdGlvbiBUcmVlKHByb3BzKSB7XG4gIHJldHVybiAoXG4gICAgPHVsIGNsYXNzTmFtZT0nbGlzdC10cmVlIGhhcy1jb2xsYXBzYWJsZS1jaGlsZHJlbic+XG4gICAgICB7XG4gICAgICAgIHByb3BzLmRhdGEubm9kZXMubWFwKChub2RlLCBpKSA9PlxuICAgICAgICAgIDxUcmVlTm9kZVxuICAgICAgICAgICAgey4uLm5vZGV9XG4gICAgICAgICAgICBrZXk9e2l9XG4gICAgICAgICAgICBvbkNsaWNrPXtwcm9wcy5vbk5vZGVDbGlja31cbiAgICAgICAgICAvPlxuICAgICAgICApXG4gICAgICB9XG4gICAgPC91bD5cbiAgKTtcbn1cblxuVHJlZS5wcm9wVHlwZXMgPSB7XG4gIGRhdGE6IFByb3BUeXBlcy5zaGFwZSh7XG4gICAgbm9kZXM6IFByb3BUeXBlcy5hcnJheU9mKFByb3BUeXBlcy5zaGFwZSh7XG4gICAgICB0ZXh0OiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG4gICAgfSkpLmlzUmVxdWlyZWQsXG4gIH0pLFxuICBvbk5vZGVDbGljazogUHJvcFR5cGVzLmZ1bmMsXG59O1xuXG5leHBvcnQgZGVmYXVsdCBUcmVlO1xuIl19