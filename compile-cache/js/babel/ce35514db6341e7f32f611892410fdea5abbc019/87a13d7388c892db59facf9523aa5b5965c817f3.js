Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

'use babel';

function Status(props) {
  return _react2['default'].createElement(
    'div',
    { className: 'status' },
    _react2['default'].createElement(
      'div',
      { className: 'block' },
      'searched ',
      props.pathsSearched,
      ' files'
    ),
    props.loading && _react2['default'].createElement('div', { className: 'loading loading-spinner-large block' })
  );
}

Status.propTypes = {
  loading: _react.PropTypes.bool.isRequired,
  pathsSearched: _react.PropTypes.number
};

exports['default'] = Status;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3NlcGlyb3BodC8uYXRvbS9wYWNrYWdlcy90b2RvL2xpYi9jb21wb25lbnRzL1N0YXR1cy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7cUJBRStCLE9BQU87Ozs7QUFGdEMsV0FBVyxDQUFDOztBQUlaLFNBQVMsTUFBTSxDQUFDLEtBQUssRUFBQztBQUNwQixTQUNFOztNQUFLLFNBQVMsRUFBQyxRQUFRO0lBQ3JCOztRQUFLLFNBQVMsRUFBQyxPQUFPOztNQUFXLEtBQUssQ0FBQyxhQUFhOztLQUFhO0lBRS9ELEtBQUssQ0FBQyxPQUFPLElBQ1YsMENBQUssU0FBUyxFQUFDLHFDQUFxQyxHQUFPO0dBRTVELENBQ047Q0FDSDs7QUFFRCxNQUFNLENBQUMsU0FBUyxHQUFHO0FBQ2pCLFNBQU8sRUFBRSxpQkFBVSxJQUFJLENBQUMsVUFBVTtBQUNsQyxlQUFhLEVBQUUsaUJBQVUsTUFBTTtDQUNoQyxDQUFDOztxQkFFYSxNQUFNIiwiZmlsZSI6Ii9ob21lL3NlcGlyb3BodC8uYXRvbS9wYWNrYWdlcy90b2RvL2xpYi9jb21wb25lbnRzL1N0YXR1cy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5pbXBvcnQgUmVhY3QsIHtQcm9wVHlwZXN9IGZyb20gJ3JlYWN0JztcblxuZnVuY3Rpb24gU3RhdHVzKHByb3BzKXtcbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT0nc3RhdHVzJz5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPSdibG9jayc+c2VhcmNoZWQge3Byb3BzLnBhdGhzU2VhcmNoZWR9IGZpbGVzPC9kaXY+XG4gICAgICB7XG4gICAgICAgIHByb3BzLmxvYWRpbmdcbiAgICAgICAgJiYgPGRpdiBjbGFzc05hbWU9J2xvYWRpbmcgbG9hZGluZy1zcGlubmVyLWxhcmdlIGJsb2NrJz48L2Rpdj5cbiAgICAgIH1cbiAgICA8L2Rpdj5cbiAgKTtcbn1cblxuU3RhdHVzLnByb3BUeXBlcyA9IHtcbiAgbG9hZGluZzogUHJvcFR5cGVzLmJvb2wuaXNSZXF1aXJlZCxcbiAgcGF0aHNTZWFyY2hlZDogUHJvcFR5cGVzLm51bWJlcixcbn07XG5cbmV4cG9ydCBkZWZhdWx0IFN0YXR1cztcbiJdfQ==