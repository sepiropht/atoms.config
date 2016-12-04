(function() {
  var root, setFormFocusEffect, setTabSizing, unsetFormFocusEffect, unsetTabSizing;

  root = document.documentElement;

  module.exports = {
    activate: function(state) {
      atom.config.observe('nord-atom-ui.tabSizing', function(noFullWidth) {
        return setTabSizing(noFullWidth);
      });
      return atom.config.observe('nord-atom-ui.darkerFormFocusEffect', function(noSnowLight) {
        return setFormFocusEffect(noSnowLight);
      });
    },
    deactivate: function() {
      unsetTabSizing();
      return unsetFormFocusEffect();
    }
  };

  setFormFocusEffect = function(noSnowLight) {
    if (noSnowLight) {
      return root.setAttribute('theme-nord-atom-ui-form-focus-effect', "nosnowlight");
    } else {
      return unsetFormFocusEffect();
    }
  };

  setTabSizing = function(noFullWidth) {
    if (noFullWidth) {
      return unsetTabSizing();
    } else {
      return root.setAttribute('theme-nord-atom-ui-tabsizing', "nofullwidth");
    }
  };

  unsetFormFocusEffect = function() {
    return root.removeAttribute('theme-nord-atom-ui-form-focus-effect');
  };

  unsetTabSizing = function() {
    return root.removeAttribute('theme-nord-atom-ui-tabsizing');
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvc2VwaXJvcGh0Ly5hdG9tL3BhY2thZ2VzL25vcmQtYXRvbS11aS9saWIvbWFpbi5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLElBQUEsR0FBTyxRQUFRLENBQUM7O0VBRWhCLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7SUFBQSxRQUFBLEVBQVUsU0FBQyxLQUFEO01BQ1IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFaLENBQW9CLHdCQUFwQixFQUE4QyxTQUFDLFdBQUQ7ZUFDNUMsWUFBQSxDQUFhLFdBQWI7TUFENEMsQ0FBOUM7YUFFQSxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQVosQ0FBb0Isb0NBQXBCLEVBQTBELFNBQUMsV0FBRDtlQUN4RCxrQkFBQSxDQUFtQixXQUFuQjtNQUR3RCxDQUExRDtJQUhRLENBQVY7SUFNQSxVQUFBLEVBQVksU0FBQTtNQUNWLGNBQUEsQ0FBQTthQUNBLG9CQUFBLENBQUE7SUFGVSxDQU5aOzs7RUFVRixrQkFBQSxHQUFxQixTQUFDLFdBQUQ7SUFDbkIsSUFBSSxXQUFKO2FBQ0UsSUFBSSxDQUFDLFlBQUwsQ0FBa0Isc0NBQWxCLEVBQTBELGFBQTFELEVBREY7S0FBQSxNQUFBO2FBR0Usb0JBQUEsQ0FBQSxFQUhGOztFQURtQjs7RUFNckIsWUFBQSxHQUFlLFNBQUMsV0FBRDtJQUNiLElBQUksV0FBSjthQUNFLGNBQUEsQ0FBQSxFQURGO0tBQUEsTUFBQTthQUdFLElBQUksQ0FBQyxZQUFMLENBQWtCLDhCQUFsQixFQUFrRCxhQUFsRCxFQUhGOztFQURhOztFQU1mLG9CQUFBLEdBQXVCLFNBQUE7V0FDckIsSUFBSSxDQUFDLGVBQUwsQ0FBcUIsc0NBQXJCO0VBRHFCOztFQUd2QixjQUFBLEdBQWlCLFNBQUE7V0FDZixJQUFJLENBQUMsZUFBTCxDQUFxQiw4QkFBckI7RUFEZTtBQTVCakIiLCJzb3VyY2VzQ29udGVudCI6WyJyb290ID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50O1xuXG5tb2R1bGUuZXhwb3J0cyA9XG4gIGFjdGl2YXRlOiAoc3RhdGUpIC0+XG4gICAgYXRvbS5jb25maWcub2JzZXJ2ZSAnbm9yZC1hdG9tLXVpLnRhYlNpemluZycsIChub0Z1bGxXaWR0aCkgLT5cbiAgICAgIHNldFRhYlNpemluZyhub0Z1bGxXaWR0aClcbiAgICBhdG9tLmNvbmZpZy5vYnNlcnZlICdub3JkLWF0b20tdWkuZGFya2VyRm9ybUZvY3VzRWZmZWN0JywgKG5vU25vd0xpZ2h0KSAtPlxuICAgICAgc2V0Rm9ybUZvY3VzRWZmZWN0KG5vU25vd0xpZ2h0KVxuXG4gIGRlYWN0aXZhdGU6IC0+XG4gICAgdW5zZXRUYWJTaXppbmcoKVxuICAgIHVuc2V0Rm9ybUZvY3VzRWZmZWN0KClcblxuc2V0Rm9ybUZvY3VzRWZmZWN0ID0gKG5vU25vd0xpZ2h0KSAtPlxuICBpZiAobm9Tbm93TGlnaHQpXG4gICAgcm9vdC5zZXRBdHRyaWJ1dGUoJ3RoZW1lLW5vcmQtYXRvbS11aS1mb3JtLWZvY3VzLWVmZmVjdCcsIFwibm9zbm93bGlnaHRcIilcbiAgZWxzZVxuICAgIHVuc2V0Rm9ybUZvY3VzRWZmZWN0KClcblxuc2V0VGFiU2l6aW5nID0gKG5vRnVsbFdpZHRoKSAtPlxuICBpZiAobm9GdWxsV2lkdGgpXG4gICAgdW5zZXRUYWJTaXppbmcoKVxuICBlbHNlXG4gICAgcm9vdC5zZXRBdHRyaWJ1dGUoJ3RoZW1lLW5vcmQtYXRvbS11aS10YWJzaXppbmcnLCBcIm5vZnVsbHdpZHRoXCIpXG5cbnVuc2V0Rm9ybUZvY3VzRWZmZWN0ID0gLT5cbiAgcm9vdC5yZW1vdmVBdHRyaWJ1dGUoJ3RoZW1lLW5vcmQtYXRvbS11aS1mb3JtLWZvY3VzLWVmZmVjdCcpXG5cbnVuc2V0VGFiU2l6aW5nID0gLT5cbiAgcm9vdC5yZW1vdmVBdHRyaWJ1dGUoJ3RoZW1lLW5vcmQtYXRvbS11aS10YWJzaXppbmcnKVxuIl19
