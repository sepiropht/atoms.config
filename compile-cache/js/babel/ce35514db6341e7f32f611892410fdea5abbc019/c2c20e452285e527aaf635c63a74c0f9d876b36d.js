Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

// TODO: in /lib/components/Controls.js

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

'use babel';

function Controls(props) {
  return _react2['default'].createElement(
    'div',
    { className: 'btn-toolbar' },
    _react2['default'].createElement(
      'div',
      { className: 'controls btn-group' },
      _react2['default'].createElement('button', {
        className: 'btn icon icon-sync',
        onClick: props.onRefresh
      }),
      _react2['default'].createElement('button', {
        className: 'btn icon icon-x',
        onClick: props.onClose
      })
    )
  );
}

Controls.propTypes = {
  onRefresh: _react.PropTypes.func.isRequired,
  onClose: _react.PropTypes.func.isRequired
};

exports['default'] = Controls;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3NlcGlyb3BodC8uYXRvbS9wYWNrYWdlcy90b2RvL2xpYi9jb21wb25lbnRzL0NvbnRyb2xzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O3FCQUkrQixPQUFPOzs7O0FBSnRDLFdBQVcsQ0FBQzs7QUFNWixTQUFTLFFBQVEsQ0FBQyxLQUFLLEVBQUM7QUFDdEIsU0FDRTs7TUFBSyxTQUFTLEVBQUMsYUFBYTtJQUMxQjs7UUFBSyxTQUFTLEVBQUMsb0JBQW9CO01BQ2pDO0FBQ0EsaUJBQVMsRUFBQyxvQkFBb0I7QUFDOUIsZUFBTyxFQUFHLEtBQUssQ0FBQyxTQUFTLEFBQUU7UUFDekI7TUFDRjtBQUNBLGlCQUFTLEVBQUMsaUJBQWlCO0FBQzNCLGVBQU8sRUFBRyxLQUFLLENBQUMsT0FBTyxBQUFFO1FBQ3ZCO0tBQ0U7R0FDRixDQUNOO0NBQ0g7O0FBRUQsUUFBUSxDQUFDLFNBQVMsR0FBRztBQUNuQixXQUFTLEVBQUUsaUJBQVUsSUFBSSxDQUFDLFVBQVU7QUFDcEMsU0FBTyxFQUFFLGlCQUFVLElBQUksQ0FBQyxVQUFVO0NBQ25DLENBQUM7O3FCQUVhLFFBQVEiLCJmaWxlIjoiL2hvbWUvc2VwaXJvcGh0Ly5hdG9tL3BhY2thZ2VzL3RvZG8vbGliL2NvbXBvbmVudHMvQ29udHJvbHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuLy8gVE9ETzogaW4gL2xpYi9jb21wb25lbnRzL0NvbnRyb2xzLmpzXG5cbmltcG9ydCBSZWFjdCwge1Byb3BUeXBlc30gZnJvbSAncmVhY3QnO1xuXG5mdW5jdGlvbiBDb250cm9scyhwcm9wcyl7XG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9J2J0bi10b29sYmFyJz5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPSdjb250cm9scyBidG4tZ3JvdXAnPlxuICAgICAgICA8YnV0dG9uXG4gICAgICAgIGNsYXNzTmFtZT0nYnRuIGljb24gaWNvbi1zeW5jJ1xuICAgICAgICBvbkNsaWNrPXsgcHJvcHMub25SZWZyZXNoIH1cbiAgICAgICAgLz5cbiAgICAgICAgPGJ1dHRvblxuICAgICAgICBjbGFzc05hbWU9J2J0biBpY29uIGljb24teCdcbiAgICAgICAgb25DbGljaz17IHByb3BzLm9uQ2xvc2UgfVxuICAgICAgICAvPlxuICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG4gICk7XG59XG5cbkNvbnRyb2xzLnByb3BUeXBlcyA9IHtcbiAgb25SZWZyZXNoOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICBvbkNsb3NlOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxufTtcblxuZXhwb3J0IGRlZmF1bHQgQ29udHJvbHM7XG4iXX0=