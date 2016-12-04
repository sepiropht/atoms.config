Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// TODO: in /lib/components/Container

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _Header = require('./Header');

var _Header2 = _interopRequireDefault(_Header);

var _Empty = require('./Empty');

var _Empty2 = _interopRequireDefault(_Empty);

var _Status = require('./Status');

var _Status2 = _interopRequireDefault(_Status);

var _Search = require('./Search');

var _Search2 = _interopRequireDefault(_Search);

var _Tree = require('./Tree');

var _Tree2 = _interopRequireDefault(_Tree);

var _service = require('../service');

var _service2 = _interopRequireDefault(_service);

// TODO: do not transform here, feed it in through props

'use babel';
var Container = (function (_React$Component) {
    _inherits(Container, _React$Component);

    _createClass(Container, null, [{
        key: 'propTypes',
        get: function get() {
            return {
                onRefresh: _react.PropTypes.func.isRequired,
                onClose: _react.PropTypes.func.isRequired,
                onItemClick: _react.PropTypes.func.isRequired,
                items: _react.PropTypes.array.isRequired,
                loading: _react.PropTypes.bool.isRequired,
                pathsSearched: _react.PropTypes.number
            };
        }
    }]);

    function Container() {
        _classCallCheck(this, Container);

        _get(Object.getPrototypeOf(Container.prototype), 'constructor', this).call(this);
        this.onSearchChanged = this.onSearchChanged.bind(this);
        this.onRefresh = this.onRefresh.bind(this);
        this.onClose = this.onClose.bind(this);
        this._handleNodeClick = this._handleNodeClick.bind(this);

        this.state = {
            searchValue: null
        };
    }

    _createClass(Container, [{
        key: 'render',
        value: function render() {
            var props = this.props;

            var filteredItems = this.getFilteredItems(props.items, this.state.searchValue);
            return _react2['default'].createElement(
                'atom-panel',
                { className: 'right' },
                _react2['default'].createElement(
                    'div',
                    { className: 'padded' },
                    _react2['default'].createElement(
                        'div',
                        { className: 'inset-panel' },
                        _react2['default'].createElement(
                            'div',
                            { className: 'panel-heading' },
                            _react2['default'].createElement(_Header2['default'], {
                                onRefresh: this.onRefresh,
                                onClose: this.onClose,
                                count: props.items && props.items.length
                            }),
                            !props.loading && _react2['default'].createElement(_Search2['default'], {
                                onChange: this.onSearchChanged
                            })
                        ),
                        _react2['default'].createElement(
                            'div',
                            { className: 'panel-body padded' },
                            _react2['default'].createElement(_Status2['default'], {
                                loading: props.loading,
                                pathsSearched: props.pathsSearched
                            }),
                            !props.loading && (props.items.length ? _react2['default'].createElement(_Tree2['default'], {
                                data: _service2['default'].getTreeFormat(filteredItems),
                                onNodeClick: this._handleNodeClick
                            }) : _react2['default'].createElement(_Empty2['default'], null))
                        )
                    )
                )
            );
        }
    }, {
        key: 'getFilteredItems',
        value: function getFilteredItems(items, searchValue) {
            if (!searchValue) {
                return items;
            } else {
                var _ret = (function () {
                    var filtered = [];

                    items.map(function (item) {
                        var filteredMatches = item.matches.filter(function (match) {
                            return match.matchText.indexOf(searchValue) > -1;
                        });

                        if (filteredMatches.length) {
                            filtered.push(Object.assign({}, item, {
                                matches: filteredMatches
                            }));
                        }
                    });

                    return {
                        v: filtered
                    };
                })();

                if (typeof _ret === 'object') return _ret.v;
            }
        }
    }, {
        key: 'onSearchChanged',
        value: function onSearchChanged(event) {
            var searchValue = event.target.value;

            this.setState({ searchValue: searchValue });
        }
    }, {
        key: 'clearSearch',
        value: function clearSearch() {
            this.setState({ searchValue: null });
        }
    }, {
        key: 'onRefresh',
        value: function onRefresh() {
            this.clearSearch();
            this.props.onRefresh();
        }
    }, {
        key: 'onClose',
        value: function onClose() {
            this.clearSearch();
            this.props.onClose();
        }
    }, {
        key: '_handleNodeClick',
        value: function _handleNodeClick(data) {
            this.props.onItemClick(data.filePath, data.range);
        }
    }]);

    return Container;
})(_react2['default'].Component);

exports['default'] = Container;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3NlcGlyb3BodC8uYXRvbS9wYWNrYWdlcy90b2RvL2xpYi9jb21wb25lbnRzL0NvbnRhaW5lci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O3FCQUkrQixPQUFPOzs7O3NCQUNuQixVQUFVOzs7O3FCQUNYLFNBQVM7Ozs7c0JBQ1IsVUFBVTs7OztzQkFDVixVQUFVOzs7O29CQUNaLFFBQVE7Ozs7dUJBQ0wsWUFBWTs7Ozs7O0FBVmhDLFdBQVcsQ0FBQztJQVlOLFNBQVM7Y0FBVCxTQUFTOztpQkFBVCxTQUFTOzthQUNTLGVBQUc7QUFDbkIsbUJBQU87QUFDSCx5QkFBUyxFQUFFLGlCQUFVLElBQUksQ0FBQyxVQUFVO0FBQ3BDLHVCQUFPLEVBQUUsaUJBQVUsSUFBSSxDQUFDLFVBQVU7QUFDbEMsMkJBQVcsRUFBRSxpQkFBVSxJQUFJLENBQUMsVUFBVTtBQUN0QyxxQkFBSyxFQUFFLGlCQUFVLEtBQUssQ0FBQyxVQUFVO0FBQ2pDLHVCQUFPLEVBQUUsaUJBQVUsSUFBSSxDQUFDLFVBQVU7QUFDbEMsNkJBQWEsRUFBRSxpQkFBVSxNQUFNO2FBQ2xDLENBQUM7U0FDTDs7O0FBRVUsYUFaVCxTQUFTLEdBWUc7OEJBWlosU0FBUzs7QUFhUCxtQ0FiRixTQUFTLDZDQWFDO0FBQ1IsWUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN2RCxZQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzNDLFlBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDdkMsWUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7O0FBRXpELFlBQUksQ0FBQyxLQUFL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Qjs7O2VBRWUsMEJBQUMsSUFBSSxFQUFFO0FBQ3JCLGdCQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUNuRDs7O1dBckhDLFNBQVM7R0FBUyxtQkFBTSxTQUFTOztxQkF3SHhCLFNBQVMiLCJmaWxlIjoiL2hvbWUvc2VwaXJvcGh0Ly5hdG9tL3BhY2thZ2VzL3RvZG8vbGliL2NvbXBvbmVudHMvQ29udGFpbmVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbi8vIFRPRE86IGluIC9saWIvY29tcG9uZW50cy9Db250YWluZXJcblxuaW1wb3J0IFJlYWN0LCB7UHJvcFR5cGVzfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgSGVhZGVyIGZyb20gJy4vSGVhZGVyJztcbmltcG9ydCBFbXB0eSBmcm9tICcuL0VtcHR5JztcbmltcG9ydCBTdGF0dXMgZnJvbSAnLi9TdGF0dXMnO1xuaW1wb3J0IFNlYXJjaCBmcm9tICcuL1NlYXJjaCc7XG5pbXBvcnQgVHJlZSBmcm9tICcuL1RyZWUnO1xuaW1wb3J0IHNlcnZpY2UgZnJvbSAnLi4vc2VydmljZSc7IC8vIFRPRE86IGRvIG5vdCB0cmFuc2Zvcm0gaGVyZSwgZmVlZCBpdCBpbiB0aHJvdWdoIHByb3BzXG5cbmNsYXNzIENvbnRhaW5lciBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gICAgc3RhdGljIGdldCBwcm9wVHlwZXMoKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBvblJlZnJlc2g6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgICAgICAgICBvbkNsb3NlOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgICAgICAgICAgb25JdGVtQ2xpY2s6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgICAgICAgICBpdGVtczogUHJvcFR5cGVzLmFycmF5LmlzUmVxdWlyZWQsXG4gICAgICAgICAgICBsb2FkaW5nOiBQcm9wVHlwZXMuYm9vbC5pc1JlcXVpcmVkLFxuICAgICAgICAgICAgcGF0aHNTZWFyY2hlZDogUHJvcFR5cGVzLm51bWJlcixcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgdGhpcy5vblNlYXJjaENoYW5nZWQgPSB0aGlzLm9uU2VhcmNoQ2hhbmdlZC5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLm9uUmVmcmVzaCA9IHRoaXMub25SZWZyZXNoLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMub25DbG9zZSA9IHRoaXMub25DbG9zZS5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLl9oYW5kbGVOb2RlQ2xpY2sgPSB0aGlzLl9oYW5kbGVOb2RlQ2xpY2suYmluZCh0aGlzKTtcblxuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgc2VhcmNoVmFsdWU6IG51bGwsXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBjb25zdCB7cHJvcHN9ID0gdGhpcztcbiAgICAgICAgY29uc3QgZmlsdGVyZWRJdGVtcyA9IHRoaXMuZ2V0RmlsdGVyZWRJdGVtcyhwcm9wcy5pdGVtcywgdGhpcy5zdGF0ZS5zZWFyY2hWYWx1ZSk7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgPGF0b20tcGFuZWwgY2xhc3NOYW1lPSdyaWdodCc+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdwYWRkZWQnPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdpbnNldC1wYW5lbCc+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdwYW5lbC1oZWFkaW5nJz5cbiAgICAgICAgICAgICAgICAgICAgICA8SGVhZGVyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIG9uUmVmcmVzaD17dGhpcy5vblJlZnJlc2h9XG4gICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xvc2U9e3RoaXMub25DbG9zZX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgY291bnQ9e3Byb3BzLml0ZW1zICYmIHByb3BzLml0ZW1zLmxlbmd0aH1cbiAgICAgICAgICAgICAgICAgICAgICAvPlxuXG4gICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAhcHJvcHMubG9hZGluZ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8U2VhcmNoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5vblNlYXJjaENoYW5nZWR9XG4gICAgICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J3BhbmVsLWJvZHkgcGFkZGVkJz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxTdGF0dXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2FkaW5nPXtwcm9wcy5sb2FkaW5nfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhdGhzU2VhcmNoZWQ9e3Byb3BzLnBhdGhzU2VhcmNoZWR9XG4gICAgICAgICAgICAgICAgICAgICAgICAvPlxuXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIXByb3BzLmxvYWRpbmdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAmJiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3BzLml0ZW1zLmxlbmd0aFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8VHJlZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YT17c2VydmljZS5nZXRUcmVlRm9ybWF0KGZpbHRlcmVkSXRlbXMpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25Ob2RlQ2xpY2s9e3RoaXMuX2hhbmRsZU5vZGVDbGlja31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogPEVtcHR5IC8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvYXRvbS1wYW5lbD5cbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBnZXRGaWx0ZXJlZEl0ZW1zKGl0ZW1zLCBzZWFyY2hWYWx1ZSkge1xuICAgICAgICBpZiAoIXNlYXJjaFZhbHVlKSB7XG4gICAgICAgICAgICByZXR1cm4gaXRlbXM7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBmaWx0ZXJlZCA9IFtdO1xuXG4gICAgICAgICAgICBpdGVtcy5tYXAoaXRlbSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgZmlsdGVyZWRNYXRjaGVzID0gaXRlbS5tYXRjaGVzLmZpbHRlcihtYXRjaCA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBtYXRjaC5tYXRjaFRleHQuaW5kZXhPZihzZWFyY2hWYWx1ZSkgPiAtMTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIGlmIChmaWx0ZXJlZE1hdGNoZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIGZpbHRlcmVkLnB1c2goXG4gICAgICAgICAgICAgICAgICAgICAgICBPYmplY3QuYXNzaWduKHt9LCBpdGVtLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWF0Y2hlczogZmlsdGVyZWRNYXRjaGVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcmV0dXJuIGZpbHRlcmVkO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgb25TZWFyY2hDaGFuZ2VkKGV2ZW50KSB7XG4gICAgICAgIGNvbnN0IHt0YXJnZXQ6IHsgdmFsdWU6IHNlYXJjaFZhbHVlIH19ID0gZXZlbnQ7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBzZWFyY2hWYWx1ZSB9KTtcbiAgICB9XG5cbiAgICBjbGVhclNlYXJjaCgpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHNlYXJjaFZhbHVlOiBudWxsIH0pO1xuICAgIH1cblxuICAgIG9uUmVmcmVzaCgpIHtcbiAgICAgICAgdGhpcy5jbGVhclNlYXJjaCgpO1xuICAgICAgICB0aGlzLnByb3BzLm9uUmVmcmVzaCgpO1xuICAgIH1cblxuICAgIG9uQ2xvc2UoKSB7XG4gICAgICAgIHRoaXMuY2xlYXJTZWFyY2goKTtcbiAgICAgICAgdGhpcy5wcm9wcy5vbkNsb3NlKCk7XG4gICAgfVxuXG4gICAgX2hhbmRsZU5vZGVDbGljayhkYXRhKSB7XG4gICAgICB0aGlzLnByb3BzLm9uSXRlbUNsaWNrKGRhdGEuZmlsZVBhdGgsIGRhdGEucmFuZ2UpO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgQ29udGFpbmVyO1xuIl19