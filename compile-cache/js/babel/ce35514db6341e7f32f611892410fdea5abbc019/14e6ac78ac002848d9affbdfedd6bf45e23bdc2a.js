Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

'use babel';

function Search(props) {
    return _react2['default'].createElement('input', {
        type: 'text',
        className: 'search block native-key-bindings',
        onChange: props.onChange,
        placeholder: 'search results here'
    });
}

Search.propTypes = {
    onChange: _react.PropTypes.func.isRequired
};

exports['default'] = Search;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3NlcGlyb3BodC8uYXRvbS9wYWNrYWdlcy90b2RvL2xpYi9jb21wb25lbnRzL1NlYXJjaC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7cUJBRStCLE9BQU87Ozs7QUFGdEMsV0FBVyxDQUFDOztBQUlaLFNBQVMsTUFBTSxDQUFDLEtBQUssRUFBRTtBQUNuQixXQUNJO0FBQ0ksWUFBSSxFQUFDLE1BQU07QUFDWCxpQkFBUyxFQUFDLGtDQUFrQztBQUM1QyxnQkFBUSxFQUFFLEtBQUssQ0FBQyxRQUFRLEFBQUM7QUFDekIsbUJBQVcsRUFBQyxxQkFBcUI7TUFDbkMsQ0FDSjtDQUNMOztBQUVELE1BQU0sQ0FBQyxTQUFTLEdBQUc7QUFDZixZQUFRLEVBQUUsaUJBQVUsSUFBSSxDQUFDLFVBQVU7Q0FDdEMsQ0FBQzs7cUJBRWEsTUFBTSIsImZpbGUiOiIvaG9tZS9zZXBpcm9waHQvLmF0b20vcGFja2FnZXMvdG9kby9saWIvY29tcG9uZW50cy9TZWFyY2guanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuaW1wb3J0IFJlYWN0LCB7UHJvcFR5cGVzfSBmcm9tICdyZWFjdCc7XG5cbmZ1bmN0aW9uIFNlYXJjaChwcm9wcykge1xuICAgIHJldHVybiAoXG4gICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgdHlwZT0ndGV4dCdcbiAgICAgICAgICAgIGNsYXNzTmFtZT0nc2VhcmNoIGJsb2NrIG5hdGl2ZS1rZXktYmluZGluZ3MnXG4gICAgICAgICAgICBvbkNoYW5nZT17cHJvcHMub25DaGFuZ2V9XG4gICAgICAgICAgICBwbGFjZWhvbGRlcj0nc2VhcmNoIHJlc3VsdHMgaGVyZSdcbiAgICAgICAgLz5cbiAgICApO1xufVxuXG5TZWFyY2gucHJvcFR5cGVzID0ge1xuICAgIG9uQ2hhbmdlOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxufTtcblxuZXhwb3J0IGRlZmF1bHQgU2VhcmNoO1xuIl19