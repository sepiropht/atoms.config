(function() {
  var Dialog, SaveDialog, changeCase, path, projects,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Dialog = require('./dialog');

  projects = require('./projects');

  path = require('path');

  changeCase = require('change-case');

  module.exports = SaveDialog = (function(_super) {
    __extends(SaveDialog, _super);

    SaveDialog.prototype.filePath = null;

    function SaveDialog() {
      var firstPath, title;
      firstPath = atom.project.getPaths()[0];
      title = path.basename(firstPath);
      if (atom.config.get('project-manager.prettifyTitle')) {
        title = changeCase.titleCase(title);
      }
      SaveDialog.__super__.constructor.call(this, {
        prompt: 'Enter name of project',
        input: title,
        select: true,
        iconClass: 'icon-arrow-right'
      });
      projects.getCurrent((function(_this) {
        return function(project) {
          if (project.rootPath === firstPath) {
            return _this.showError("This project is already saved as " + project.props.title);
          }
        };
      })(this));
    }

    SaveDialog.prototype.onConfirm = function(title) {
      var properties;
      if (title) {
        properties = {
          title: title,
          paths: atom.project.getPaths()
        };
        projects.addProject(properties);
        return this.close();
      } else {
        return this.showError('You need to specify a name for the project');
      }
    };

    return SaveDialog;

  })(Dialog);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvd2lsbGlhbS8uYXRvbS9wYWNrYWdlcy9wcm9qZWN0LW1hbmFnZXIvbGliL3NhdmUtZGlhbG9nLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSw4Q0FBQTtJQUFBO21TQUFBOztBQUFBLEVBQUEsTUFBQSxHQUFTLE9BQUEsQ0FBUSxVQUFSLENBQVQsQ0FBQTs7QUFBQSxFQUNBLFFBQUEsR0FBVyxPQUFBLENBQVEsWUFBUixDQURYLENBQUE7O0FBQUEsRUFFQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FGUCxDQUFBOztBQUFBLEVBR0EsVUFBQSxHQUFhLE9BQUEsQ0FBUSxhQUFSLENBSGIsQ0FBQTs7QUFBQSxFQUtBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDSixpQ0FBQSxDQUFBOztBQUFBLHlCQUFBLFFBQUEsR0FBVSxJQUFWLENBQUE7O0FBRWEsSUFBQSxvQkFBQSxHQUFBO0FBQ1gsVUFBQSxnQkFBQTtBQUFBLE1BQUEsU0FBQSxHQUFZLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBYixDQUFBLENBQXdCLENBQUEsQ0FBQSxDQUFwQyxDQUFBO0FBQUEsTUFDQSxLQUFBLEdBQVEsSUFBSSxDQUFDLFFBQUwsQ0FBYyxTQUFkLENBRFIsQ0FBQTtBQUdBLE1BQUEsSUFBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsK0JBQWhCLENBQUg7QUFDRSxRQUFBLEtBQUEsR0FBUSxVQUFVLENBQUMsU0FBWCxDQUFxQixLQUFyQixDQUFSLENBREY7T0FIQTtBQUFBLE1BTUEsNENBQ0U7QUFBQSxRQUFBLE1BQUEsRUFBUSx1QkFBUjtBQUFBLFFBQ0EsS0FBQSxFQUFPLEtBRFA7QUFBQSxRQUVBLE1BQUEsRUFBUSxJQUZSO0FBQUEsUUFHQSxTQUFBLEVBQVcsa0JBSFg7T0FERixDQU5BLENBQUE7QUFBQSxNQVlBLFFBQVEsQ0FBQyxVQUFULENBQW9CLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFDLE9BQUQsR0FBQTtBQUNsQixVQUFBLElBQUcsT0FBTyxDQUFDLFFBQVIsS0FBb0IsU0FBdkI7bUJBQ0UsS0FBQyxDQUFBLFNBQUQsQ0FBWSxtQ0FBQSxHQUFtQyxPQUFPLENBQUMsS0FBSyxDQUFDLEtBQTdELEVBREY7V0FEa0I7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFwQixDQVpBLENBRFc7SUFBQSxDQUZiOztBQUFBLHlCQW9CQSxTQUFBLEdBQVcsU0FBQyxLQUFELEdBQUE7QUFDVCxVQUFBLFVBQUE7QUFBQSxNQUFBLElBQUcsS0FBSDtBQUNFLFFBQUEsVUFBQSxHQUNFO0FBQUEsVUFBQSxLQUFBLEVBQU8sS0FBUDtBQUFBLFVBQ0EsS0FBQSxFQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBYixDQUFBLENBRFA7U0FERixDQUFBO0FBQUEsUUFJQSxRQUFRLENBQUMsVUFBVCxDQUFvQixVQUFwQixDQUpBLENBQUE7ZUFNQSxJQUFDLENBQUEsS0FBRCxDQUFBLEVBUEY7T0FBQSxNQUFBO2VBU0UsSUFBQyxDQUFBLFNBQUQsQ0FBVyw0Q0FBWCxFQVRGO09BRFM7SUFBQSxDQXBCWCxDQUFBOztzQkFBQTs7S0FEdUIsT0FOekIsQ0FBQTtBQUFBIgp9

//# sourceURL=/home/william/.atom/packages/project-manager/lib/save-dialog.coffee
