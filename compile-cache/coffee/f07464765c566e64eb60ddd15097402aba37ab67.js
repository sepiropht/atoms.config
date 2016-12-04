(function() {
  module.exports = {
    run: function() {
      var applyFont, body, fixer, fixerProto, triggerMeasurements;
      body = document.querySelector('body');
      triggerMeasurements = function(force) {
        atom.workspace.increaseFontSize();
        return atom.workspace.decreaseFontSize();
      };
      applyFont = function(font) {
        body.setAttribute('fonts-editor-font', font);
        return triggerMeasurements();
      };
      applyFont(atom.config.get('fonts.fontFamily'));
      atom.config.observe('fonts.fontFamily', function() {
        return applyFont(atom.config.get('fonts.fontFamily'));
      });
      setTimeout((function() {
        return triggerMeasurements();
      }), 500);
      fixerProto = Object.create(HTMLElement.prototype);
      fixerProto.createdCallback = function() {
        this.innerHTML = "regular<b>bold<i>italic</i></b><i>italic</i>";
      };
      fixer = document.registerElement("fonts-fixer", {
        prototype: fixerProto
      });
      return atom.views.getView(atom.workspace).appendChild(new fixer());
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvc2VwaXJvcGh0Ly5hdG9tL3BhY2thZ2VzL2ZvbnRzL2xpYi9ydW5uZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQUEsTUFBTSxDQUFDLE9BQVAsR0FDRTtJQUFBLEdBQUEsRUFBSyxTQUFBO0FBRUgsVUFBQTtNQUFBLElBQUEsR0FBTyxRQUFRLENBQUMsYUFBVCxDQUF1QixNQUF2QjtNQUVQLG1CQUFBLEdBQXNCLFNBQUMsS0FBRDtRQUNwQixJQUFJLENBQUMsU0FBUyxDQUFDLGdCQUFmLENBQUE7ZUFDQSxJQUFJLENBQUMsU0FBUyxDQUFDLGdCQUFmLENBQUE7TUFGb0I7TUFJdEIsU0FBQSxHQUFZLFNBQUMsSUFBRDtRQUNWLElBQUksQ0FBQyxZQUFMLENBQWtCLG1CQUFsQixFQUF1QyxJQUF2QztlQUNBLG1CQUFBLENBQUE7TUFGVTtNQUtaLFNBQUEsQ0FDRSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0Isa0JBQWhCLENBREY7TUFNQSxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQVosQ0FBb0Isa0JBQXBCLEVBQXdDLFNBQUE7ZUFDdEMsU0FBQSxDQUFVLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixrQkFBaEIsQ0FBVjtNQURzQyxDQUF4QztNQUtBLFVBQUEsQ0FBVyxDQUFDLFNBQUE7ZUFDVixtQkFBQSxDQUFBO01BRFUsQ0FBRCxDQUFYLEVBRUcsR0FGSDtNQU1BLFVBQUEsR0FBYSxNQUFNLENBQUMsTUFBUCxDQUFjLFdBQVcsQ0FBQSxTQUF6QjtNQUNiLFVBQVUsQ0FBQyxlQUFYLEdBQTZCLFNBQUE7UUFDM0IsSUFBQyxDQUFBLFNBQUQsR0FBYTtNQURjO01BSTdCLEtBQUEsR0FBUSxRQUFRLENBQUMsZUFBVCxDQUF5QixhQUF6QixFQUNOO1FBQUEsU0FBQSxFQUFXLFVBQVg7T0FETTthQUlSLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBWCxDQUFtQixJQUFJLENBQUMsU0FBeEIsQ0FBa0MsQ0FBQyxXQUFuQyxDQUFtRCxJQUFBLEtBQUEsQ0FBQSxDQUFuRDtJQXZDRyxDQUFMOztBQURGIiwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPVxuICBydW46ICgpIC0+XG5cbiAgICBib2R5ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYm9keScpXG5cbiAgICB0cmlnZ2VyTWVhc3VyZW1lbnRzID0gKGZvcmNlKSAtPlxuICAgICAgYXRvbS53b3Jrc3BhY2UuaW5jcmVhc2VGb250U2l6ZSgpXG4gICAgICBhdG9tLndvcmtzcGFjZS5kZWNyZWFzZUZvbnRTaXplKClcblxuICAgIGFwcGx5Rm9udCA9IChmb250KSAtPlxuICAgICAgYm9keS5zZXRBdHRyaWJ1dGUoJ2ZvbnRzLWVkaXRvci1mb250JywgZm9udClcbiAgICAgIHRyaWdnZXJNZWFzdXJlbWVudHMoKVxuXG4gICAgIyBhcHBseSBmb250cyB3aGVuIGF0b20gaXMgcmVhZHlcbiAgICBhcHBseUZvbnQoXG4gICAgICBhdG9tLmNvbmZpZy5nZXQoJ2ZvbnRzLmZvbnRGYW1pbHknKVxuICAgIClcblxuICAgICMgYXBwbHkgZm9udHMgd2hlbiBjb25maWcgY2hhbmdlc1xuICAgICMgYWZ0ZXIgY29uZmlnIGNoYW5nZXMgbWVhc3VyZW1lbnRzIGFyZSBhbHJlYWR5IHRyaWdnZXJlZCBieSBhdG9tXG4gICAgYXRvbS5jb25maWcub2JzZXJ2ZSAnZm9udHMuZm9udEZhbWlseScsIC0+XG4gICAgICBhcHBseUZvbnQoYXRvbS5jb25maWcuZ2V0KCdmb250cy5mb250RmFtaWx5JykpXG5cbiAgICAjIGdpdmUgY2hyb21pdW0gc29tZSB0aW1lIHRvIGxvYWQgdGhlIGZvbnRzXG4gICAgIyB0aGVuIHRyaWdnZXIgbWVhc3VyZW1lbnRzXG4gICAgc2V0VGltZW91dCAoLT5cbiAgICAgIHRyaWdnZXJNZWFzdXJlbWVudHMoKVxuICAgICksIDUwMFxuXG4gICAgIyBjcmVhdGUgYSBmaXhlciBlbGVtZW50IHRoYXQgZm9yY2VzIGNocm9tZSB0byBsb2FkIGZvbnQgc3R5bGVzXG4gICAgIyBjb250YWlucyAqciplZ3VsYXIsICpiKm9sZCwgKmkqdGFsaWMgYW5kIGkgaW4gYlxuICAgIGZpeGVyUHJvdG8gPSBPYmplY3QuY3JlYXRlKEhUTUxFbGVtZW50OjopXG4gICAgZml4ZXJQcm90by5jcmVhdGVkQ2FsbGJhY2sgPSAtPlxuICAgICAgQGlubmVySFRNTCA9IFwicmVndWxhcjxiPmJvbGQ8aT5pdGFsaWM8L2k+PC9iPjxpPml0YWxpYzwvaT5cIlxuICAgICAgcmV0dXJuXG5cbiAgICBmaXhlciA9IGRvY3VtZW50LnJlZ2lzdGVyRWxlbWVudChcImZvbnRzLWZpeGVyXCIsXG4gICAgICBwcm90b3R5cGU6IGZpeGVyUHJvdG9cbiAgICApXG5cbiAgICBhdG9tLnZpZXdzLmdldFZpZXcoYXRvbS53b3Jrc3BhY2UpLmFwcGVuZENoaWxkKG5ldyBmaXhlcigpKVxuIl19
