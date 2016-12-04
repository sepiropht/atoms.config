Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _Controls = require('./Controls');

var _Controls2 = _interopRequireDefault(_Controls);

'use babel';

function Header(props) {
  return _react2['default'].createElement(
    'div',
    { className: 'header' },
    _react2['default'].createElement(
      'h1',
      null,
      'todo ',
      !!props.count && _react2['default'].createElement(
        'span',
        { className: 'badge badge' },
        props.count
      )
    ),
    _react2['default'].createElement(_Controls2['default'], {
      onRefresh: props.onRefresh,
      onClose: props.onClose
    })
  );
}

Header.propTypes = {
  onRefresh: _react.PropTypes.func.isRequired,
  onClose: _react.PropTypes.func.isRequired,
  count: _react.PropTypes.number
};

exports['default'] = Header;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3NlcGlyb3BodC8uYXRvbS9wYWNrYWdlcy90b2RvL2xpYi9jb21wb25lbnRzL0hlYWRlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7cUJBRStCLE9BQU87Ozs7d0JBQ2pCLFlBQVk7Ozs7QUFIakMsV0FBVyxDQUFDOztBQUtaLFNBQVMsTUFBTSxDQUFDLEtBQUssRUFBQztBQUNwQixTQUNFOztNQUFLLFNBQVMsRUFBQyxRQUFRO0lBQ3JCOzs7O01BQ0UsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLElBQUk7O1VBQU0sU0FBUyxFQUFDLGFBQWE7UUFBRSxLQUFLLENBQUMsS0FBSztPQUFRO0tBRWhFO0lBRUw7QUFDRSxlQUFTLEVBQUUsS0FBSyxDQUFDLFNBQVMsQUFBQztBQUMzQixhQUFPLEVBQUUsS0FBSyxDQUFDLE9BQU8sQUFBQztNQUN2QjtHQUNFLENBQ047Q0FDSDs7QUFFRCxNQUFNLENBQUMsU0FBUyxHQUFHO0FBQ2pCLFdBQVMsRUFBRSxpQkFBVSxJQUFJLENBQUMsVUFBVTtBQUNwQyxTQUFPLEVBQUUsaUJBQVUsSUFBSSxDQUFDLFVBQVU7QUFDbEMsT0FBSyxFQUFFLGlCQUFVLE1BQU07Q0FDeEIsQ0FBQzs7cUJBRWEsTUFBTSIsImZpbGUiOiIvaG9tZS9zZXBpcm9waHQvLmF0b20vcGFja2FnZXMvdG9kby9saWIvY29tcG9uZW50cy9IZWFkZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuaW1wb3J0IFJlYWN0LCB7UHJvcFR5cGVzfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgQ29udHJvbHMgZnJvbSAnLi9Db250cm9scyc7XG5cbmZ1bmN0aW9uIEhlYWRlcihwcm9wcyl7XG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9J2hlYWRlcic+XG4gICAgICA8aDE+dG9kbyB7XG4gICAgICAgICEhcHJvcHMuY291bnQgJiYgPHNwYW4gY2xhc3NOYW1lPSdiYWRnZSBiYWRnZSc+e3Byb3BzLmNvdW50fTwvc3Bhbj5cbiAgICAgIH1cbiAgICAgIDwvaDE+XG5cbiAgICAgIDxDb250cm9sc1xuICAgICAgICBvblJlZnJlc2g9e3Byb3BzLm9uUmVmcmVzaH1cbiAgICAgICAgb25DbG9zZT17cHJvcHMub25DbG9zZX1cbiAgICAgIC8+XG4gICAgPC9kaXY+XG4gICk7XG59XG5cbkhlYWRlci5wcm9wVHlwZXMgPSB7XG4gIG9uUmVmcmVzaDogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgb25DbG9zZTogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgY291bnQ6IFByb3BUeXBlcy5udW1iZXIsXG59O1xuXG5leHBvcnQgZGVmYXVsdCBIZWFkZXI7XG4iXX0=