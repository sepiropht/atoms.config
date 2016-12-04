'use babel';

// TODO: in /lib/service.js

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = {
  count: 0,

  findTodoItems: function findTodoItems() {
    var flags, notIgnoredPaths, options, pattern, regex, results;
    results = [];

    function iterator(result) {
      result.relativePath = atom.project.relativizePath(result.filePath)[1];
      return results.push(result);
    }

    // TODO: find multiline comments
    // like this one.

    /*
    * TODO: find comments like
    * these too
    */

    // TODO: update results as the documents change, debounce for performance
    pattern = atom.config.get('todo.a_pattern');
    flags = atom.config.get('todo.b_flags');
    regex = new RegExp(pattern, flags);
    notIgnoredPaths = atom.config.get('todo.c_ignorePaths').map(function (path) {
      return '!' + path;
    });

    options = {
      // TODO: make this clearer
      paths: notIgnoredPaths.length ? notIgnoredPaths : ['*'],
      // TODO: restore this after working with slow searches
      // paths: [
      //   '*',
      //   'node_modules/',
      // ],
      onPathsSearched: function onPathsSearched(count) {
        return atom.emitter.emit('todo:pathSearched', count);
      }
    };

    return new Promise(function (resolve) {
      return atom.workspace.scan(regex, options, iterator).then(function () {
        return results.sort(function (a, b) {
          return a.filePath.localeCompare(b.filePath);
        });
      }).then(resolve);
    });
  },

  getTreeFormat: function getTreeFormat(results) {
    var tree = {
      path: '/',
      nodes: []
    };

    results.map(function (result) {
      // figure out which node this goes in based off relativePath
      var relativePath = result.relativePath;

      var parts = relativePath.split('/');
      var currentNode = tree;

      var _loop = function () {
        var part = parts.shift();

        var nextNode = currentNode.nodes.find(function (node) {
          return node.path === part;
        });
        if (!nextNode) {
          nextNode = {
            path: part,
            text: part,
            icon: parts.length ? 'icon-file-directory' : 'icon-file-text',
            nodes: []
          };

          currentNode.nodes.push(nextNode);
        }

        if (!parts.length) {
          // This is the end.  Add matches as nodes.
          // console.log(nextNode);
          nextNode.nodes = nextNode.nodes.concat(result.matches.map(function (match, i) {
            return {
              path: i + '',
              text: match.matchText,
              nodes: [],
              data: {
                filePath: result.filePath,
                range: match.range
              }
            };
          }));
        }

        currentNode = nextNode;
      };

      while (parts.length) {
        _loop();
      }
    });

    return tree;
  }
};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3NlcGlyb3BodC8uYXRvbS9wYWNrYWdlcy90b2RvL2xpYi9zZXJ2aWNlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFdBQVcsQ0FBQzs7Ozs7OztxQkFJRztBQUNiLE9BQUssRUFBRSxDQUFDOztBQUVSLGVBQWEsRUFBQSx5QkFBRztBQUNkLFFBQUksS0FBSyxFQUFFLGVBQWUsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxPQUFPLENBQUM7QUFDN0QsV0FBTyxHQUFHLEVBQUUsQ0FBQzs7QUFFYixhQUFTLFFBQVEsQ0FBQyxNQUFNLEVBQUU7QUFDeEIsWUFBTSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDdEUsYUFBTyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0tBQzdCOzs7Ozs7Ozs7OztBQVdELFdBQU8sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0FBQzVDLFNBQUssR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUN4QyxTQUFLLEdBQUcsSUFBSSxNQUFNLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBQ25DLG1CQUFlLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxHQUFHLENBQUMsVUFBUyxJQUFJLEVBQUU7QUFDekUsYUFBTyxHQUFHLEdBQUcsSUFBSSxDQUFDO0tBQ25CLENBQUMsQ0FBQzs7QUFFSCxXQUFPLEdBQUc7O0FBRVIsV0FBSyxFQUFFLGVBQWUsQ0FBQyxNQUFNLEdBQUcsZUFBZSxHQUFHLENBQUMsR0FBRyxDQUFDOzs7Ozs7QUFNdkQscUJBQWUsRUFBRSx5QkFBVSxLQUFLLEVBQUU7QUFDaEMsZUFBTyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxLQUFLLENBQUMsQ0FBQztPQUN0RDtLQUNGLENBQUM7O0FBRUYsV0FBTyxJQUFJLE9BQU8sQ0FBQyxVQUFBLE9BQU8sRUFBSTtBQUM1QixhQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQ25ELElBQUksQ0FBQyxZQUFNO0FBQ1YsZUFBTyxPQUFPLENBQUMsSUFBSSxDQUFDLFVBQVMsQ0FBQyxFQUFFLENBQUMsRUFBRTtBQUNqQyxpQkFBTyxDQUFDLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUM7U0FDN0MsQ0FBQyxDQUFDO09BQ0osQ0FBQyxDQUNELElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztLQUNoQixDQUFDLENBQUM7R0FDSjs7QUFFRCxlQUFhLEVBQUEsdUJBQUMsT0FBTyxFQUFFO0FBQ3JCLFFBQU0sSUFBSSxHQUFHO0FBQ1gsVUFBSSxFQUFFLEdBQUc7QUFDVCxXQUFLLEVBQUUsRUFBRTtLQUNWLENBQUM7O0FBRUYsV0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFBLE1BQU0sRUFBSTs7VUFFYixZQUFZLEdBQUksTUFBTSxDQUF0QixZQUFZOztBQUNuQixVQUFNLEtBQUssR0FBRyxZQUFZLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3RDLFVBQUksV0FBVyxHQUFHLElBQUksQ0FBQzs7O0FBR3JCLFlBQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQzs7QUFFM0IsWUFBSSxRQUFRLEdBQUcsV0FBVyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsVUFBQSxJQUFJO2lCQUFJLElBQUksQ0FBQyxJQUFJLEtBQUssSUFBSTtTQUFBLENBQUMsQ0FBQztBQUNsRSxZQUFJLENBQUMsUUFBUSxFQUFFO0FBQ2Isa0JBQVEsR0FBRztBQUNULGdCQUFJLEVBQUUsSUFBSTtBQUNWLGdCQUFJLEVBQUUsSUFBSTtBQUNWLGdCQUFJLEVBQUUsS0FBSyxDQUFDLE1BQU0sR0FDZCxxQkFBcUIsR0FDckIsZ0JBQWdCO0FBQ3BCLGlCQUFLLEVBQUUsRUFBRTtXQUNWLENBQUM7O0FBRUYscUJBQVcsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1NBQ2xDOztBQUVELFlBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFOzs7QUFHakIsa0JBQVEsQ0FBQyxLQUFLLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQ3BDLE1BQU0sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQUMsS0FBSyxFQUFFLENBQUMsRUFBSztBQUMvQixtQkFBTztBQUNMLGtCQUFJLEVBQUUsQ0FBQyxHQUFHLEVBQUU7QUFDWixrQkFBSSxFQUFFLEtBQUssQ0FBQyxTQUFTO0FBQ3JCLG1CQUFLLEVBQUUsRUFBRTtBQUNULGtCQUFJLEVBQUU7QUFDSix3QkFBUSxFQUFFLE1BQU0sQ0FBQyxRQUFRO0FBQ3pCLHFCQUFLLEVBQUUsS0FBSyxDQUFDLEtBQUs7ZUFDbkI7YUFDRixDQUFDO1dBQ0gsQ0FBQyxDQUNILENBQUM7U0FDSDs7QUFFRCxtQkFBVyxHQUFHLFFBQVEsQ0FBQzs7O0FBbkN6QixhQUFPLEtBQUssQ0FBQyxNQUFNLEVBQUU7O09Bb0NwQjtLQUNGLENBQUMsQ0FBQzs7QUFFSCxXQUFPLElBQUksQ0FBQztHQUNiO0NBQ0YiLCJmaWxlIjoiL2hvbWUvc2VwaXJvcGh0Ly5hdG9tL3BhY2thZ2VzL3RvZG8vbGliL3NlcnZpY2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuLy8gVE9ETzogaW4gL2xpYi9zZXJ2aWNlLmpzXG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgY291bnQ6IDAsXG5cbiAgZmluZFRvZG9JdGVtcygpIHtcbiAgICB2YXIgZmxhZ3MsIG5vdElnbm9yZWRQYXRocywgb3B0aW9ucywgcGF0dGVybiwgcmVnZXgsIHJlc3VsdHM7XG4gICAgcmVzdWx0cyA9IFtdO1xuXG4gICAgZnVuY3Rpb24gaXRlcmF0b3IocmVzdWx0KSB7XG4gICAgICByZXN1bHQucmVsYXRpdmVQYXRoID0gYXRvbS5wcm9qZWN0LnJlbGF0aXZpemVQYXRoKHJlc3VsdC5maWxlUGF0aClbMV07XG4gICAgICByZXR1cm4gcmVzdWx0cy5wdXNoKHJlc3VsdCk7XG4gICAgfVxuXG4gICAgLy8gVE9ETzogZmluZCBtdWx0aWxpbmUgY29tbWVudHNcbiAgICAvLyBsaWtlIHRoaXMgb25lLlxuXG4gICAgLypcbiAgICAqIFRPRE86IGZpbmQgY29tbWVudHMgbGlrZVxuICAgICogdGhlc2UgdG9vXG4gICAgKi9cblxuICAgIC8vIFRPRE86IHVwZGF0ZSByZXN1bHRzIGFzIHRoZSBkb2N1bWVudHMgY2hhbmdlLCBkZWJvdW5jZSBmb3IgcGVyZm9ybWFuY2VcbiAgICBwYXR0ZXJuID0gYXRvbS5jb25maWcuZ2V0KCd0b2RvLmFfcGF0dGVybicpO1xuICAgIGZsYWdzID0gYXRvbS5jb25maWcuZ2V0KCd0b2RvLmJfZmxhZ3MnKTtcbiAgICByZWdleCA9IG5ldyBSZWdFeHAocGF0dGVybiwgZmxhZ3MpO1xuICAgIG5vdElnbm9yZWRQYXRocyA9IGF0b20uY29uZmlnLmdldCgndG9kby5jX2lnbm9yZVBhdGhzJykubWFwKGZ1bmN0aW9uKHBhdGgpIHtcbiAgICAgIHJldHVybiAnIScgKyBwYXRoO1xuICAgIH0pO1xuXG4gICAgb3B0aW9ucyA9IHtcbiAgICAgIC8vIFRPRE86IG1ha2UgdGhpcyBjbGVhcmVyXG4gICAgICBwYXRoczogbm90SWdub3JlZFBhdGhzLmxlbmd0aCA/IG5vdElnbm9yZWRQYXRocyA6IFsnKiddLFxuICAgICAgLy8gVE9ETzogcmVzdG9yZSB0aGlzIGFmdGVyIHdvcmtpbmcgd2l0aCBzbG93IHNlYXJjaGVzXG4gICAgICAvLyBwYXRoczogW1xuICAgICAgLy8gICAnKicsXG4gICAgICAvLyAgICdub2RlX21vZHVsZXMvJyxcbiAgICAgIC8vIF0sXG4gICAgICBvblBhdGhzU2VhcmNoZWQ6IGZ1bmN0aW9uIChjb3VudCkge1xuICAgICAgICByZXR1cm4gYXRvbS5lbWl0dGVyLmVtaXQoJ3RvZG86cGF0aFNlYXJjaGVkJywgY291bnQpO1xuICAgICAgfSxcbiAgICB9O1xuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgICAgcmV0dXJuIGF0b20ud29ya3NwYWNlLnNjYW4ocmVnZXgsIG9wdGlvbnMsIGl0ZXJhdG9yKVxuICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICByZXR1cm4gcmVzdWx0cy5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgICAgICByZXR1cm4gYS5maWxlUGF0aC5sb2NhbGVDb21wYXJlKGIuZmlsZVBhdGgpO1xuICAgICAgICB9KTtcbiAgICAgIH0pXG4gICAgICAudGhlbihyZXNvbHZlKTtcbiAgICB9KTtcbiAgfSxcblxuICBnZXRUcmVlRm9ybWF0KHJlc3VsdHMpIHtcbiAgICBjb25zdCB0cmVlID0ge1xuICAgICAgcGF0aDogJy8nLFxuICAgICAgbm9kZXM6IFtdLFxuICAgIH07XG5cbiAgICByZXN1bHRzLm1hcChyZXN1bHQgPT4ge1xuICAgICAgLy8gZmlndXJlIG91dCB3aGljaCBub2RlIHRoaXMgZ29lcyBpbiBiYXNlZCBvZmYgcmVsYXRpdmVQYXRoXG4gICAgICBjb25zdCB7cmVsYXRpdmVQYXRofSA9IHJlc3VsdDtcbiAgICAgIGNvbnN0IHBhcnRzID0gcmVsYXRpdmVQYXRoLnNwbGl0KCcvJyk7XG4gICAgICBsZXQgY3VycmVudE5vZGUgPSB0cmVlO1xuXG4gICAgICB3aGlsZSAocGFydHMubGVuZ3RoKSB7XG4gICAgICAgIGNvbnN0IHBhcnQgPSBwYXJ0cy5zaGlmdCgpO1xuXG4gICAgICAgIGxldCBuZXh0Tm9kZSA9IGN1cnJlbnROb2RlLm5vZGVzLmZpbmQobm9kZSA9PiBub2RlLnBhdGggPT09IHBhcnQpO1xuICAgICAgICBpZiAoIW5leHROb2RlKSB7XG4gICAgICAgICAgbmV4dE5vZGUgPSB7XG4gICAgICAgICAgICBwYXRoOiBwYXJ0LFxuICAgICAgICAgICAgdGV4dDogcGFydCxcbiAgICAgICAgICAgIGljb246IHBhcnRzLmxlbmd0aFxuICAgICAgICAgICAgICA/ICdpY29uLWZpbGUtZGlyZWN0b3J5J1xuICAgICAgICAgICAgICA6ICdpY29uLWZpbGUtdGV4dCcsXG4gICAgICAgICAgICBub2RlczogW10sXG4gICAgICAgICAgfTtcblxuICAgICAgICAgIGN1cnJlbnROb2RlLm5vZGVzLnB1c2gobmV4dE5vZGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFwYXJ0cy5sZW5ndGgpIHtcbiAgICAgICAgICAvLyBUaGlzIGlzIHRoZSBlbmQuICBBZGQgbWF0Y2hlcyBhcyBub2Rlcy5cbiAgICAgICAgICAvLyBjb25zb2xlLmxvZyhuZXh0Tm9kZSk7XG4gICAgICAgICAgbmV4dE5vZGUubm9kZXMgPSBuZXh0Tm9kZS5ub2Rlcy5jb25jYXQoXG4gICAgICAgICAgICByZXN1bHQubWF0Y2hlcy5tYXAoKG1hdGNoLCBpKSA9PiB7XG4gICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgcGF0aDogaSArICcnLFxuICAgICAgICAgICAgICAgIHRleHQ6IG1hdGNoLm1hdGNoVGV4dCxcbiAgICAgICAgICAgICAgICBub2RlczogW10sXG4gICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgZmlsZVBhdGg6IHJlc3VsdC5maWxlUGF0aCxcbiAgICAgICAgICAgICAgICAgIHJhbmdlOiBtYXRjaC5yYW5nZSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgY3VycmVudE5vZGUgPSBuZXh0Tm9kZTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiB0cmVlO1xuICB9LFxufTtcbiJdfQ==