(function() {
  atom.packages.activatePackage('tree-view').then(function(tree) {
    var IS_ANCHORED_CLASSNAME, projectRoots, treeView, updateTreeViewHeaderPosition;
    IS_ANCHORED_CLASSNAME = 'is--anchored';
    treeView = tree.mainModule.treeView;
    projectRoots = treeView.roots;
    updateTreeViewHeaderPosition = function() {
      var i, len, project, projectClassList, projectHeaderHeight, projectHeight, projectOffsetY, results, yScrollPosition;
      yScrollPosition = treeView.scroller[0].scrollTop;
      results = [];
      for (i = 0, len = projectRoots.length; i < len; i++) {
        project = projectRoots[i];
        projectHeaderHeight = project.header.offsetHeight;
        projectClassList = project.classList;
        projectOffsetY = project.offsetTop;
        projectHeight = project.offsetHeight;
        if (yScrollPosition > projectOffsetY) {
          if (yScrollPosition > projectOffsetY + projectHeight - projectHeaderHeight) {
            project.header.style.top = 'auto';
            results.push(projectClassList.add(IS_ANCHORED_CLASSNAME));
          } else {
            project.header.style.top = (yScrollPosition - projectOffsetY) + 'px';
            results.push(projectClassList.remove(IS_ANCHORED_CLASSNAME));
          }
        } else {
          project.header.style.top = '0';
          results.push(projectClassList.remove(IS_ANCHORED_CLASSNAME));
        }
      }
      return results;
    };
    atom.project.onDidChangePaths(function() {
      projectRoots = treeView.roots;
      return updateTreeViewHeaderPosition();
    });
    atom.config.onDidChange('seti-ui', function() {
      return setTimeout(function() {
        return updateTreeViewHeaderPosition();
      });
    });
    treeView.scroller.on('scroll', updateTreeViewHeaderPosition);
    return setTimeout(function() {
      return updateTreeViewHeaderPosition();
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvc2VwaXJvcGh0Ly5hdG9tL3BhY2thZ2VzL3NldGktdWkvbGliL2hlYWRlcnMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQUEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFkLENBQThCLFdBQTlCLENBQTBDLENBQUMsSUFBM0MsQ0FBZ0QsU0FBQyxJQUFEO0FBQzlDLFFBQUE7SUFBQSxxQkFBQSxHQUF3QjtJQUV4QixRQUFBLEdBQVcsSUFBSSxDQUFDLFVBQVUsQ0FBQztJQUMzQixZQUFBLEdBQWUsUUFBUSxDQUFDO0lBRXhCLDRCQUFBLEdBQStCLFNBQUE7QUFDN0IsVUFBQTtNQUFBLGVBQUEsR0FBa0IsUUFBUSxDQUFDLFFBQVMsQ0FBQSxDQUFBLENBQUUsQ0FBQztBQUV2QztXQUFBLDhDQUFBOztRQUNFLG1CQUFBLEdBQXNCLE9BQU8sQ0FBQyxNQUFNLENBQUM7UUFDckMsZ0JBQUEsR0FBbUIsT0FBTyxDQUFDO1FBQzNCLGNBQUEsR0FBaUIsT0FBTyxDQUFDO1FBQ3pCLGFBQUEsR0FBZ0IsT0FBTyxDQUFDO1FBRXhCLElBQUcsZUFBQSxHQUFrQixjQUFyQjtVQUNFLElBQUcsZUFBQSxHQUFrQixjQUFBLEdBQWlCLGFBQWpCLEdBQWlDLG1CQUF0RDtZQUNFLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQXJCLEdBQTJCO3lCQUMzQixnQkFBZ0IsQ0FBQyxHQUFqQixDQUFxQixxQkFBckIsR0FGRjtXQUFBLE1BQUE7WUFJRSxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFyQixHQUEyQixDQUFDLGVBQUEsR0FBa0IsY0FBbkIsQ0FBQSxHQUFxQzt5QkFDaEUsZ0JBQWdCLENBQUMsTUFBakIsQ0FBd0IscUJBQXhCLEdBTEY7V0FERjtTQUFBLE1BQUE7VUFRRSxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFyQixHQUEyQjt1QkFDM0IsZ0JBQWdCLENBQUMsTUFBakIsQ0FBd0IscUJBQXhCLEdBVEY7O0FBTkY7O0lBSDZCO0lBb0IvQixJQUFJLENBQUMsT0FBTyxDQUFDLGdCQUFiLENBQThCLFNBQUE7TUFDNUIsWUFBQSxHQUFlLFFBQVEsQ0FBQzthQUN4Qiw0QkFBQSxDQUFBO0lBRjRCLENBQTlCO0lBSUEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFaLENBQXdCLFNBQXhCLEVBQW1DLFNBQUE7YUFHakMsVUFBQSxDQUFXLFNBQUE7ZUFBRyw0QkFBQSxDQUFBO01BQUgsQ0FBWDtJQUhpQyxDQUFuQztJQUlBLFFBQVEsQ0FBQyxRQUFRLENBQUMsRUFBbEIsQ0FBcUIsUUFBckIsRUFBK0IsNEJBQS9CO1dBRUEsVUFBQSxDQUFXLFNBQUE7YUFDVCw0QkFBQSxDQUFBO0lBRFMsQ0FBWDtFQXBDOEMsQ0FBaEQ7QUFBQSIsInNvdXJjZXNDb250ZW50IjpbImF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKCd0cmVlLXZpZXcnKS50aGVuICh0cmVlKSAtPlxuICBJU19BTkNIT1JFRF9DTEFTU05BTUUgPSAnaXMtLWFuY2hvcmVkJ1xuXG4gIHRyZWVWaWV3ID0gdHJlZS5tYWluTW9kdWxlLnRyZWVWaWV3XG4gIHByb2plY3RSb290cyA9IHRyZWVWaWV3LnJvb3RzXG5cbiAgdXBkYXRlVHJlZVZpZXdIZWFkZXJQb3NpdGlvbiA9IC0+XG4gICAgeVNjcm9sbFBvc2l0aW9uID0gdHJlZVZpZXcuc2Nyb2xsZXJbMF0uc2Nyb2xsVG9wXG5cbiAgICBmb3IgcHJvamVjdCBpbiBwcm9qZWN0Um9vdHNcbiAgICAgIHByb2plY3RIZWFkZXJIZWlnaHQgPSBwcm9qZWN0LmhlYWRlci5vZmZzZXRIZWlnaHRcbiAgICAgIHByb2plY3RDbGFzc0xpc3QgPSBwcm9qZWN0LmNsYXNzTGlzdFxuICAgICAgcHJvamVjdE9mZnNldFkgPSBwcm9qZWN0Lm9mZnNldFRvcFxuICAgICAgcHJvamVjdEhlaWdodCA9IHByb2plY3Qub2Zmc2V0SGVpZ2h0XG5cbiAgICAgIGlmIHlTY3JvbGxQb3NpdGlvbiA+IHByb2plY3RPZmZzZXRZXG4gICAgICAgIGlmIHlTY3JvbGxQb3NpdGlvbiA+IHByb2plY3RPZmZzZXRZICsgcHJvamVjdEhlaWdodCAtIHByb2plY3RIZWFkZXJIZWlnaHRcbiAgICAgICAgICBwcm9qZWN0LmhlYWRlci5zdHlsZS50b3AgPSAnYXV0bydcbiAgICAgICAgICBwcm9qZWN0Q2xhc3NMaXN0LmFkZCBJU19BTkNIT1JFRF9DTEFTU05BTUVcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHByb2plY3QuaGVhZGVyLnN0eWxlLnRvcCA9ICh5U2Nyb2xsUG9zaXRpb24gLSBwcm9qZWN0T2Zmc2V0WSkgKyAncHgnXG4gICAgICAgICAgcHJvamVjdENsYXNzTGlzdC5yZW1vdmUgSVNfQU5DSE9SRURfQ0xBU1NOQU1FXG4gICAgICBlbHNlXG4gICAgICAgIHByb2plY3QuaGVhZGVyLnN0eWxlLnRvcCA9ICcwJ1xuICAgICAgICBwcm9qZWN0Q2xhc3NMaXN0LnJlbW92ZSBJU19BTkNIT1JFRF9DTEFTU05BTUVcblxuICBhdG9tLnByb2plY3Qub25EaWRDaGFuZ2VQYXRocyAtPlxuICAgIHByb2plY3RSb290cyA9IHRyZWVWaWV3LnJvb3RzXG4gICAgdXBkYXRlVHJlZVZpZXdIZWFkZXJQb3NpdGlvbigpXG5cbiAgYXRvbS5jb25maWcub25EaWRDaGFuZ2UgJ3NldGktdWknLCAtPlxuICAgICMgVE9ETyBzb21ldGhpbmcgb3RoZXIgdGhhbiBzZXRUaW1lb3V0PyBpdCdzIGEgaGFjayB0byB0cmlnZ2VyIHRoZSB1cGRhdGVcbiAgICAjIGFmdGVyIHRoZSBDU1MgY2hhbmdlcyBoYXZlIG9jY3VycmVkLiBhIGdhbWJsZSwgcHJvYmFibHkgaW5hY2N1cmF0ZVxuICAgIHNldFRpbWVvdXQgLT4gdXBkYXRlVHJlZVZpZXdIZWFkZXJQb3NpdGlvbigpXG4gIHRyZWVWaWV3LnNjcm9sbGVyLm9uICdzY3JvbGwnLCB1cGRhdGVUcmVlVmlld0hlYWRlclBvc2l0aW9uXG5cbiAgc2V0VGltZW91dCAtPiAjIFRPRE8gc29tZXRoaW5nIG90aGVyIHRoYW4gc2V0VGltZW91dD9cbiAgICB1cGRhdGVUcmVlVmlld0hlYWRlclBvc2l0aW9uKClcbiJdfQ==
