(function() {
  var CompositeDisposable, MultirowTabs;

  CompositeDisposable = require('atom').CompositeDisposable;

  module.exports = MultirowTabs = {
    activate: function(state) {
      this.subscriptions = new CompositeDisposable;
      return this.subscriptions.add(atom.commands.add('atom-workspace', {
        'multirow-tabs:toggle': (function(_this) {
          return function() {
            return _this.toggle();
          };
        })(this)
      }));
    },
    deactivate: function() {
      return this.subscriptions.dispose();
    },
    toggle: function() {
      var pane, paneElement;
      pane = atom.workspace.getActivePane();
      paneElement = atom.views.getView(pane);
      return paneElement.getElementsByClassName('tab-bar')[0].classList.toggle('multirow-tabs');
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvd2lsbGlhbS8uYXRvbS9wYWNrYWdlcy9tdWx0aXJvdy10YWJzL2xpYi9tdWx0aXJvdy10YWJzLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxpQ0FBQTs7QUFBQSxFQUFDLHNCQUF1QixPQUFBLENBQVEsTUFBUixFQUF2QixtQkFBRCxDQUFBOztBQUFBLEVBRUEsTUFBTSxDQUFDLE9BQVAsR0FBaUIsWUFBQSxHQUVmO0FBQUEsSUFBQSxRQUFBLEVBQVUsU0FBQyxLQUFELEdBQUE7QUFFUixNQUFBLElBQUMsQ0FBQSxhQUFELEdBQWlCLEdBQUEsQ0FBQSxtQkFBakIsQ0FBQTthQUdBLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0IsZ0JBQWxCLEVBQW9DO0FBQUEsUUFBQSxzQkFBQSxFQUF3QixDQUFBLFNBQUEsS0FBQSxHQUFBO2lCQUFBLFNBQUEsR0FBQTttQkFBRyxLQUFDLENBQUEsTUFBRCxDQUFBLEVBQUg7VUFBQSxFQUFBO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF4QjtPQUFwQyxDQUFuQixFQUxRO0lBQUEsQ0FBVjtBQUFBLElBT0EsVUFBQSxFQUFZLFNBQUEsR0FBQTthQUNWLElBQUMsQ0FBQSxhQUFhLENBQUMsT0FBZixDQUFBLEVBRFU7SUFBQSxDQVBaO0FBQUEsSUFVQSxNQUFBLEVBQVEsU0FBQSxHQUFBO0FBQ04sVUFBQSxpQkFBQTtBQUFBLE1BQUEsSUFBQSxHQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBZixDQUFBLENBQVAsQ0FBQTtBQUFBLE1BQ0EsV0FBQSxHQUFjLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBWCxDQUFtQixJQUFuQixDQURkLENBQUE7YUFFQSxXQUFXLENBQUMsc0JBQVosQ0FBbUMsU0FBbkMsQ0FBOEMsQ0FBQSxDQUFBLENBQUUsQ0FBQyxTQUFTLENBQUMsTUFBM0QsQ0FBa0UsZUFBbEUsRUFITTtJQUFBLENBVlI7R0FKRixDQUFBO0FBQUEiCn0=

//# sourceURL=/home/william/.atom/packages/multirow-tabs/lib/multirow-tabs.coffee
