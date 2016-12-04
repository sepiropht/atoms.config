(function() {
  var CompositeDisposable, CurrentFileBreadcrumb, CurrentFileBreadcrumbView;

  CurrentFileBreadcrumbView = require('./current-file-breadcrumb-view');

  CompositeDisposable = require('atom').CompositeDisposable;

  module.exports = CurrentFileBreadcrumb = {
    activate: function(state) {
      var paneSubscription;
      this.subscriptions = new CompositeDisposable;
      this.breadcrumbViews = [];
      paneSubscription = atom.workspace.observePanes((function(_this) {
        return function(pane) {
          var breadcrumbView, paneElement;
          breadcrumbView = new CurrentFileBreadcrumbView;
          _this.breadcrumbViews.push(breadcrumbView);
          paneElement = atom.views.getView(pane);
          paneElement.insertBefore(breadcrumbView.getElement(), paneElement.firstChild);
          return pane.onDidDestroy(function() {
            return _this.unsubscribe();
          });
        };
      })(this));
      this.subscriptions.add(paneSubscription);
      return this.subscriptions.add(atom.commands.add('atom-workspace', {
        'current-file-breadcrumb:toggle': (function(_this) {
          return function() {
            return _this.toggle();
          };
        })(this)
      }));
    },
    unsubscribe: function() {
      var i, len, ref, results, view;
      this.subscriptions.dispose();
      ref = this.breadcrumbViews;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        view = ref[i];
        results.push(view.destroy());
      }
      return results;
    },
    deactivate: function() {
      this.unsubscribe();
      return console.log('deactivate');
    },
    toggle: function() {
      return console.log('CurrentFileBreadcrumb was toggled!');
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvc2VwaXJvcGh0Ly5hdG9tL3BhY2thZ2VzL2N1cnJlbnQtZmlsZS1icmVhZGNydW1iL2xpYi9jdXJyZW50LWZpbGUtYnJlYWRjcnVtYi5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLHlCQUFBLEdBQTRCLE9BQUEsQ0FBUSxnQ0FBUjs7RUFDM0Isc0JBQXVCLE9BQUEsQ0FBUSxNQUFSOztFQUV4QixNQUFNLENBQUMsT0FBUCxHQUFpQixxQkFBQSxHQUNmO0lBQUEsUUFBQSxFQUFVLFNBQUMsS0FBRDtBQUVSLFVBQUE7TUFBQSxJQUFDLENBQUEsYUFBRCxHQUFpQixJQUFJO01BQ3JCLElBQUMsQ0FBQSxlQUFELEdBQW1CO01BRW5CLGdCQUFBLEdBQW1CLElBQUksQ0FBQyxTQUFTLENBQUMsWUFBZixDQUE0QixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsSUFBRDtBQUM3QyxjQUFBO1VBQUEsY0FBQSxHQUFpQixJQUFJO1VBQ3JCLEtBQUMsQ0FBQSxlQUFlLENBQUMsSUFBakIsQ0FBc0IsY0FBdEI7VUFFQSxXQUFBLEdBQWMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFYLENBQW1CLElBQW5CO1VBQ2QsV0FBVyxDQUFDLFlBQVosQ0FBeUIsY0FBYyxDQUFDLFVBQWYsQ0FBQSxDQUF6QixFQUFzRCxXQUFXLENBQUMsVUFBbEU7aUJBRUEsSUFBSSxDQUFDLFlBQUwsQ0FBa0IsU0FBQTttQkFBRyxLQUFDLENBQUEsV0FBRCxDQUFBO1VBQUgsQ0FBbEI7UUFQNkM7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTVCO01BU25CLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixnQkFBbkI7YUFDQSxJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFkLENBQWtCLGdCQUFsQixFQUFvQztRQUFBLGdDQUFBLEVBQWtDLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7bUJBQUcsS0FBQyxDQUFBLE1BQUQsQ0FBQTtVQUFIO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFsQztPQUFwQyxDQUFuQjtJQWZRLENBQVY7SUFpQkEsV0FBQSxFQUFhLFNBQUE7QUFDWCxVQUFBO01BQUEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxPQUFmLENBQUE7QUFDQTtBQUFBO1dBQUEscUNBQUE7O3FCQUFBLElBQUksQ0FBQyxPQUFMLENBQUE7QUFBQTs7SUFGVyxDQWpCYjtJQXFCQSxVQUFBLEVBQVksU0FBQTtNQUNWLElBQUMsQ0FBQSxXQUFELENBQUE7YUFDQSxPQUFPLENBQUMsR0FBUixDQUFZLFlBQVo7SUFGVSxDQXJCWjtJQXlCQSxNQUFBLEVBQVEsU0FBQTthQUNOLE9BQU8sQ0FBQyxHQUFSLENBQVksb0NBQVo7SUFETSxDQXpCUjs7QUFKRiIsInNvdXJjZXNDb250ZW50IjpbIkN1cnJlbnRGaWxlQnJlYWRjcnVtYlZpZXcgPSByZXF1aXJlICcuL2N1cnJlbnQtZmlsZS1icmVhZGNydW1iLXZpZXcnXG57Q29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlICdhdG9tJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IEN1cnJlbnRGaWxlQnJlYWRjcnVtYiA9XG4gIGFjdGl2YXRlOiAoc3RhdGUpIC0+XG4gICAgIyBFdmVudHMgc3Vic2NyaWJlZCB0byBpbiBhdG9tJ3Mgc3lzdGVtIGNhbiBiZSBlYXNpbHkgY2xlYW5lZCB1cCB3aXRoIGEgQ29tcG9zaXRlRGlzcG9zYWJsZVxuICAgIEBzdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcbiAgICBAYnJlYWRjcnVtYlZpZXdzID0gW11cblxuICAgIHBhbmVTdWJzY3JpcHRpb24gPSBhdG9tLndvcmtzcGFjZS5vYnNlcnZlUGFuZXMgKHBhbmUpID0+XG4gICAgICBicmVhZGNydW1iVmlldyA9IG5ldyBDdXJyZW50RmlsZUJyZWFkY3J1bWJWaWV3XG4gICAgICBAYnJlYWRjcnVtYlZpZXdzLnB1c2goYnJlYWRjcnVtYlZpZXcpXG5cbiAgICAgIHBhbmVFbGVtZW50ID0gYXRvbS52aWV3cy5nZXRWaWV3KHBhbmUpXG4gICAgICBwYW5lRWxlbWVudC5pbnNlcnRCZWZvcmUoYnJlYWRjcnVtYlZpZXcuZ2V0RWxlbWVudCgpLCBwYW5lRWxlbWVudC5maXJzdENoaWxkKVxuXG4gICAgICBwYW5lLm9uRGlkRGVzdHJveSA9PiBAdW5zdWJzY3JpYmUoKVxuXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIHBhbmVTdWJzY3JpcHRpb25cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb21tYW5kcy5hZGQgJ2F0b20td29ya3NwYWNlJywgJ2N1cnJlbnQtZmlsZS1icmVhZGNydW1iOnRvZ2dsZSc6ID0+IEB0b2dnbGUoKVxuXG4gIHVuc3Vic2NyaWJlOiAtPlxuICAgIEBzdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICAgIHZpZXcuZGVzdHJveSgpIGZvciB2aWV3IGluIEBicmVhZGNydW1iVmlld3NcblxuICBkZWFjdGl2YXRlOiAtPlxuICAgIEB1bnN1YnNjcmliZSgpXG4gICAgY29uc29sZS5sb2cgJ2RlYWN0aXZhdGUnXG5cbiAgdG9nZ2xlOiAtPlxuICAgIGNvbnNvbGUubG9nICdDdXJyZW50RmlsZUJyZWFkY3J1bWIgd2FzIHRvZ2dsZWQhJ1xuIl19
