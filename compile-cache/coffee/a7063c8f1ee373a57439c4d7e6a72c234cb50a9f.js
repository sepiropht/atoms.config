(function() {
  var CompositeDisposable, CurrentFileBreadcrumbView, Disposable, ref;

  ref = require('atom'), Disposable = ref.Disposable, CompositeDisposable = ref.CompositeDisposable;

  module.exports = CurrentFileBreadcrumbView = (function() {
    function CurrentFileBreadcrumbView() {
      this.subscriptions = new CompositeDisposable();
      this.rootPath = atom.project.getPaths();
      this.element = document.createElement('div');
      this.element.classList.add('current-file-breadcrumb');
      this.setActiveFilePath();
      this.handleEvents();
    }

    CurrentFileBreadcrumbView.prototype.handleEvents = function() {
      var subscription, updatePath;
      updatePath = (function(_this) {
        return function() {
          _this.setActiveFilePath();
          return console.log('update');
        };
      })(this);
      subscription = atom.workspace.onDidChangeActivePaneItem(updatePath);
      if (Disposable.isDisposable(subscription)) {
        return this.subscriptions.add(subscription);
      } else {
        return console.warn('error');
      }
    };

    CurrentFileBreadcrumbView.prototype.setActiveFilePath = function() {
      var breadcrumb, expandItem, i, item, j, len, name, paths;
      this.element.textContent = null;
      breadcrumb = document.createElement('div');
      breadcrumb.classList.add('breadcrumb');
      paths = this.activeFilePath().split('/');
      paths[0] = '/';
      i = 1;
      expandItem = (function(_this) {
        return function(e) {
          var depth, j, ref1, treeView;
          depth = e.target.getAttribute('data-depth');
          atom.commands.dispatch(atom.views.getView(atom.workspace), 'tree-view:reveal-active-file');
          treeView = atom.views.getView(atom.workspace.getLeftPanels()[0].getItem());
          for (i = j = 1, ref1 = depth; 1 <= ref1 ? j <= ref1 : j >= ref1; i = 1 <= ref1 ? ++j : --j) {
            atom.commands.dispatch(treeView, 'tree-view:collapse-directory');
          }
          return atom.commands.dispatch(treeView, 'tree-view:expand-item');
        };
      })(this);
      for (j = 0, len = paths.length; j < len; j++) {
        name = paths[j];
        item = document.createElement('a');
        item.setAttribute('data-depth', paths.length - i);
        item.addEventListener('click', expandItem);
        item.textContent = name;
        breadcrumb.appendChild(item);
        i++;
      }
      return this.element.appendChild(breadcrumb);
    };

    CurrentFileBreadcrumbView.prototype.activeFilePath = function() {
      var editor;
      editor = atom.workspace.getActivePaneItem();
      if (typeof editor.getPath === 'function') {
        return editor != null ? editor.getPath().replace(this.rootPath, '') : void 0;
      } else {
        return '';
      }
    };

    CurrentFileBreadcrumbView.prototype.destroy = function() {
      console.log('destroy');
      this.element.remove();
      return this.subscriptions.dispose();
    };

    CurrentFileBreadcrumbView.prototype.getElement = function() {
      return this.element;
    };

    return CurrentFileBreadcrumbView;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvc2VwaXJvcGh0Ly5hdG9tL3BhY2thZ2VzL2N1cnJlbnQtZmlsZS1icmVhZGNydW1iL2xpYi9jdXJyZW50LWZpbGUtYnJlYWRjcnVtYi12aWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsTUFBb0MsT0FBQSxDQUFRLE1BQVIsQ0FBcEMsRUFBQywyQkFBRCxFQUFhOztFQUViLE1BQU0sQ0FBQyxPQUFQLEdBQ007SUFDUyxtQ0FBQTtNQUNYLElBQUMsQ0FBQSxhQUFELEdBQXFCLElBQUEsbUJBQUEsQ0FBQTtNQUVyQixJQUFDLENBQUEsUUFBRCxHQUFZLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBYixDQUFBO01BR1osSUFBQyxDQUFBLE9BQUQsR0FBVyxRQUFRLENBQUMsYUFBVCxDQUF1QixLQUF2QjtNQUNYLElBQUMsQ0FBQSxPQUFPLENBQUMsU0FBUyxDQUFDLEdBQW5CLENBQXVCLHlCQUF2QjtNQUVBLElBQUMsQ0FBQSxpQkFBRCxDQUFBO01BQ0EsSUFBQyxDQUFBLFlBQUQsQ0FBQTtJQVZXOzt3Q0FhYixZQUFBLEdBQWMsU0FBQTtBQUNaLFVBQUE7TUFBQSxVQUFBLEdBQWEsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO1VBQ1gsS0FBQyxDQUFBLGlCQUFELENBQUE7aUJBQ0EsT0FBTyxDQUFDLEdBQVIsQ0FBWSxRQUFaO1FBRlc7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBO01BS2IsWUFBQSxHQUFlLElBQUksQ0FBQyxTQUFTLENBQUMseUJBQWYsQ0FBeUMsVUFBekM7TUFFZixJQUFHLFVBQVUsQ0FBQyxZQUFYLENBQXdCLFlBQXhCLENBQUg7ZUFDSSxJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsWUFBbkIsRUFESjtPQUFBLE1BQUE7ZUFHRSxPQUFPLENBQUMsSUFBUixDQUFhLE9BQWIsRUFIRjs7SUFSWTs7d0NBYWQsaUJBQUEsR0FBbUIsU0FBQTtBQUNqQixVQUFBO01BQUEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxXQUFULEdBQXVCO01BQ3ZCLFVBQUEsR0FBYSxRQUFRLENBQUMsYUFBVCxDQUF1QixLQUF2QjtNQUNiLFVBQVUsQ0FBQyxTQUFTLENBQUMsR0FBckIsQ0FBeUIsWUFBekI7TUFFQSxLQUFBLEdBQVEsSUFBQyxDQUFBLGNBQUQsQ0FBQSxDQUFpQixDQUFDLEtBQWxCLENBQXdCLEdBQXhCO01BQ1IsS0FBTSxDQUFBLENBQUEsQ0FBTixHQUFXO01BQ1gsQ0FBQSxHQUFJO01BRUosVUFBQSxHQUFhLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxDQUFEO0FBQ1gsY0FBQTtVQUFBLEtBQUEsR0FBUSxDQUFDLENBQUMsTUFBTSxDQUFDLFlBQVQsQ0FBc0IsWUFBdEI7VUFDUixJQUFJLENBQUMsUUFBUSxDQUFDLFFBQWQsQ0FBdUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFYLENBQW1CLElBQUksQ0FBQyxTQUF4QixDQUF2QixFQUEyRCw4QkFBM0Q7VUFFQSxRQUFBLEdBQVcsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFYLENBQW1CLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBZixDQUFBLENBQStCLENBQUEsQ0FBQSxDQUFFLENBQUMsT0FBbEMsQ0FBQSxDQUFuQjtBQUNYLGVBQVMscUZBQVQ7WUFDRSxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQWQsQ0FBdUIsUUFBdkIsRUFBaUMsOEJBQWpDO0FBREY7aUJBRUEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFkLENBQXVCLFFBQXZCLEVBQWlDLHVCQUFqQztRQVBXO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQTtBQVNiLFdBQUEsdUNBQUE7O1FBQ0UsSUFBQSxHQUFPLFFBQVEsQ0FBQyxhQUFULENBQXVCLEdBQXZCO1FBQ1AsSUFBSSxDQUFDLFlBQUwsQ0FBa0IsWUFBbEIsRUFBZ0MsS0FBSyxDQUFDLE1BQU4sR0FBZSxDQUEvQztRQUNBLElBQUksQ0FBQyxnQkFBTCxDQUFzQixPQUF0QixFQUErQixVQUEvQjtRQUNBLElBQUksQ0FBQyxXQUFMLEdBQW1CO1FBRW5CLFVBQVUsQ0FBQyxXQUFYLENBQXVCLElBQXZCO1FBQ0EsQ0FBQTtBQVBGO2FBU0EsSUFBQyxDQUFBLE9BQU8sQ0FBQyxXQUFULENBQXFCLFVBQXJCO0lBM0JpQjs7d0NBNkJuQixjQUFBLEdBQWdCLFNBQUE7QUFDZCxVQUFBO01BQUEsTUFBQSxHQUFTLElBQUksQ0FBQyxTQUFTLENBQUMsaUJBQWYsQ0FBQTtNQUNULElBQUcsT0FBTyxNQUFNLENBQUMsT0FBZCxLQUF5QixVQUE1QjtnQ0FDRSxNQUFNLENBQUUsT0FBUixDQUFBLENBQWlCLENBQUMsT0FBbEIsQ0FBMEIsSUFBQyxDQUFBLFFBQTNCLEVBQXFDLEVBQXJDLFdBREY7T0FBQSxNQUFBO2VBR0UsR0FIRjs7SUFGYzs7d0NBUWhCLE9BQUEsR0FBUyxTQUFBO01BQ1AsT0FBTyxDQUFDLEdBQVIsQ0FBWSxTQUFaO01BQ0EsSUFBQyxDQUFBLE9BQU8sQ0FBQyxNQUFULENBQUE7YUFDQSxJQUFDLENBQUEsYUFBYSxDQUFDLE9BQWYsQ0FBQTtJQUhPOzt3Q0FLVCxVQUFBLEdBQVksU0FBQTthQUNWLElBQUMsQ0FBQTtJQURTOzs7OztBQXhFZCIsInNvdXJjZXNDb250ZW50IjpbIntEaXNwb3NhYmxlLCBDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2F0b20nXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIEN1cnJlbnRGaWxlQnJlYWRjcnVtYlZpZXdcbiAgY29uc3RydWN0b3I6IC0+XG4gICAgQHN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG5cbiAgICBAcm9vdFBhdGggPSBhdG9tLnByb2plY3QuZ2V0UGF0aHMoKVxuXG4gICAgIyBDcmVhdGUgcm9vdCBlbGVtZW50XG4gICAgQGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgIEBlbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2N1cnJlbnQtZmlsZS1icmVhZGNydW1iJylcblxuICAgIEBzZXRBY3RpdmVGaWxlUGF0aCgpXG4gICAgQGhhbmRsZUV2ZW50cygpXG5cbiAgIyBSZXR1cm5zIGFuIG9iamVjdCB0aGF0IGNhbiBiZSByZXRyaWV2ZWQgd2hlbiBwYWNrYWdlIGlzIGFjdGl2YXRlZFxuICBoYW5kbGVFdmVudHM6IC0+XG4gICAgdXBkYXRlUGF0aCA9ID0+XG4gICAgICBAc2V0QWN0aXZlRmlsZVBhdGgoKVxuICAgICAgY29uc29sZS5sb2cgJ3VwZGF0ZSdcbiAgICAgICNAbWVzc2FnZS50ZXh0Q29udGVudCA9IEBhY3RpdmVGaWxlUGF0aCgpXG5cbiAgICBzdWJzY3JpcHRpb24gPSBhdG9tLndvcmtzcGFjZS5vbkRpZENoYW5nZUFjdGl2ZVBhbmVJdGVtKHVwZGF0ZVBhdGgpXG5cbiAgICBpZiBEaXNwb3NhYmxlLmlzRGlzcG9zYWJsZShzdWJzY3JpcHRpb24pXG4gICAgICAgIEBzdWJzY3JpcHRpb25zLmFkZChzdWJzY3JpcHRpb24pXG4gICAgZWxzZVxuICAgICAgY29uc29sZS53YXJuICdlcnJvcidcblxuICBzZXRBY3RpdmVGaWxlUGF0aDogLT5cbiAgICBAZWxlbWVudC50ZXh0Q29udGVudCA9IG51bGw7XG4gICAgYnJlYWRjcnVtYiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgYnJlYWRjcnVtYi5jbGFzc0xpc3QuYWRkKCdicmVhZGNydW1iJylcblxuICAgIHBhdGhzID0gQGFjdGl2ZUZpbGVQYXRoKCkuc3BsaXQoJy8nKVxuICAgIHBhdGhzWzBdID0gJy8nXG4gICAgaSA9IDFcblxuICAgIGV4cGFuZEl0ZW0gPSAoZSkgPT5cbiAgICAgIGRlcHRoID0gZS50YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLWRlcHRoJylcbiAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goYXRvbS52aWV3cy5nZXRWaWV3KGF0b20ud29ya3NwYWNlKSwgJ3RyZWUtdmlldzpyZXZlYWwtYWN0aXZlLWZpbGUnKVxuXG4gICAgICB0cmVlVmlldyA9IGF0b20udmlld3MuZ2V0VmlldyhhdG9tLndvcmtzcGFjZS5nZXRMZWZ0UGFuZWxzKClbMF0uZ2V0SXRlbSgpKVxuICAgICAgZm9yIGkgaW4gWzEuLmRlcHRoXVxuICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKHRyZWVWaWV3LCAndHJlZS12aWV3OmNvbGxhcHNlLWRpcmVjdG9yeScpXG4gICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKHRyZWVWaWV3LCAndHJlZS12aWV3OmV4cGFuZC1pdGVtJylcblxuICAgIGZvciBuYW1lIGluIHBhdGhzXG4gICAgICBpdGVtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpXG4gICAgICBpdGVtLnNldEF0dHJpYnV0ZSgnZGF0YS1kZXB0aCcsIHBhdGhzLmxlbmd0aCAtIGkpXG4gICAgICBpdGVtLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZXhwYW5kSXRlbSlcbiAgICAgIGl0ZW0udGV4dENvbnRlbnQgPSBuYW1lXG5cbiAgICAgIGJyZWFkY3J1bWIuYXBwZW5kQ2hpbGQoaXRlbSlcbiAgICAgIGkrK1xuXG4gICAgQGVsZW1lbnQuYXBwZW5kQ2hpbGQoYnJlYWRjcnVtYilcblxuICBhY3RpdmVGaWxlUGF0aDogLT5cbiAgICBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lSXRlbSgpXG4gICAgaWYgdHlwZW9mIGVkaXRvci5nZXRQYXRoIGlzICdmdW5jdGlvbidcbiAgICAgIGVkaXRvcj8uZ2V0UGF0aCgpLnJlcGxhY2UoQHJvb3RQYXRoLCAnJylcbiAgICBlbHNlXG4gICAgICAnJ1xuXG4gICMgVGVhciBkb3duIGFueSBzdGF0ZSBhbmQgZGV0YWNoXG4gIGRlc3Ryb3k6IC0+XG4gICAgY29uc29sZS5sb2cgJ2Rlc3Ryb3knXG4gICAgQGVsZW1lbnQucmVtb3ZlKClcbiAgICBAc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcblxuICBnZXRFbGVtZW50OiAtPlxuICAgIEBlbGVtZW50XG4iXX0=
