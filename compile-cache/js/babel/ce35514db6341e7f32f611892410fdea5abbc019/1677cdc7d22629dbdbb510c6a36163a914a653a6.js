Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _utils = require('./utils');

/**
 * @class Handles the mapping between projects and their package.json deps
 */
'use babel';

var ProjectDeps = (function () {
    function ProjectDeps() {
        _classCallCheck(this, ProjectDeps);

        this._deps = Object.create(null);
    }

    _createClass(ProjectDeps, [{
        key: 'clear',
        value: function clear() {
            this._deps = Object.create(null);
        }
    }, {
        key: 'set',
        value: function set(rootPath, deps) {
            this._deps[rootPath] = deps;
        }
    }, {
        key: 'hasDeps',
        value: function hasDeps(rootPath) {
            return rootPath in this._deps;
        }
    }, {
        key: 'search',
        value: function search(currPath, keyword) {
            var rootPaths = Object.keys(this._deps);
            var pathDeps = [];

            for (var i = 0; i < rootPaths.length; i++) {
                // for the current path to be a child of root, it must start with rootpath
                if ((0, _utils.startsWith)(currPath, rootPaths[i])) {
                    pathDeps = this._deps[rootPaths[i]];
                    break;
                }
            }

            return pathDeps.filter(function (d) {
                return (0, _utils.startsWith)(d, keyword);
            });
        }
    }]);

    return ProjectDeps;
})();

exports['default'] = ProjectDeps;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3NlcGlyb3BodC8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtanMtaW1wb3J0L2xpYi9wcm9qZWN0LWRlcHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7cUJBQ3lCLFNBQVM7Ozs7O0FBRGxDLFdBQVcsQ0FBQzs7SUFNUyxXQUFXO0FBQ2pCLGFBRE0sV0FBVyxHQUNkOzhCQURHLFdBQVc7O0FBRXhCLFlBQUksQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztLQUNwQzs7aUJBSGdCLFdBQVc7O2VBS3ZCLGlCQUFHO0FBQ0osZ0JBQUksQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUNwQzs7O2VBRUUsYUFBQyxRQUFRLEVBQUUsSUFBSSxFQUFFO0FBQ2hCLGdCQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxHQUFHLElBQUksQ0FBQztTQUMvQjs7O2VBRU0saUJBQUMsUUFBUSxFQUFFO0FBQ2QsbUJBQU8sUUFBUSxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUM7U0FDakM7OztlQUVLLGdCQUFDLFFBQVEsRUFBRSxPQUFPLEVBQUU7QUFDdEIsZ0JBQU0sU0FBUyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQzFDLGdCQUFJLFFBQVEsR0FBRyxFQUFFLENBQUM7O0FBRWxCLGlCQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsU0FBUyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTs7QUFFdkMsb0JBQUksdUJBQVcsUUFBUSxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFO0FBQ3BDLDRCQUFRLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNwQywwQkFBTTtpQkFDVDthQUNKOztBQUVELG1CQUFPLFFBQVEsQ0FBQyxNQUFNLENBQUMsVUFBQSxDQUFDO3VCQUFJLHVCQUFXLENBQUMsRUFBRSxPQUFPLENBQUM7YUFBQSxDQUFDLENBQUM7U0FDdkQ7OztXQTlCZ0IsV0FBVzs7O3FCQUFYLFdBQVciLCJmaWxlIjoiL2hvbWUvc2VwaXJvcGh0Ly5hdG9tL3BhY2thZ2VzL2F1dG9jb21wbGV0ZS1qcy1pbXBvcnQvbGliL3Byb2plY3QtZGVwcy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuaW1wb3J0IHtzdGFydHNXaXRofSBmcm9tICcuL3V0aWxzJztcblxuLyoqXG4gKiBAY2xhc3MgSGFuZGxlcyB0aGUgbWFwcGluZyBiZXR3ZWVuIHByb2plY3RzIGFuZCB0aGVpciBwYWNrYWdlLmpzb24gZGVwc1xuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQcm9qZWN0RGVwcyB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMuX2RlcHMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICAgIH1cblxuICAgIGNsZWFyKCkge1xuICAgICAgICB0aGlzLl9kZXBzID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgICB9XG5cbiAgICBzZXQocm9vdFBhdGgsIGRlcHMpIHtcbiAgICAgICAgdGhpcy5fZGVwc1tyb290UGF0aF0gPSBkZXBzO1xuICAgIH1cblxuICAgIGhhc0RlcHMocm9vdFBhdGgpIHtcbiAgICAgICAgcmV0dXJuIHJvb3RQYXRoIGluIHRoaXMuX2RlcHM7XG4gICAgfVxuXG4gICAgc2VhcmNoKGN1cnJQYXRoLCBrZXl3b3JkKSB7XG4gICAgICAgIGNvbnN0IHJvb3RQYXRocyA9IE9iamVjdC5rZXlzKHRoaXMuX2RlcHMpO1xuICAgICAgICBsZXQgcGF0aERlcHMgPSBbXTtcblxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHJvb3RQYXRocy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgLy8gZm9yIHRoZSBjdXJyZW50IHBhdGggdG8gYmUgYSBjaGlsZCBvZiByb290LCBpdCBtdXN0IHN0YXJ0IHdpdGggcm9vdHBhdGhcbiAgICAgICAgICAgIGlmIChzdGFydHNXaXRoKGN1cnJQYXRoLCByb290UGF0aHNbaV0pKSB7XG4gICAgICAgICAgICAgICAgcGF0aERlcHMgPSB0aGlzLl9kZXBzW3Jvb3RQYXRoc1tpXV07XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcGF0aERlcHMuZmlsdGVyKGQgPT4gc3RhcnRzV2l0aChkLCBrZXl3b3JkKSk7XG4gICAgfVxufVxuIl19