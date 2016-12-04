(function() {
  var $$$, TextEditorView, View, ref;

  ref = require('atom-space-pen-views'), $$$ = ref.$$$, View = ref.View, TextEditorView = ref.TextEditorView;

  module.exports = function() {
    return this.div({
      tabIndex: -1,
      "class": 'atomts-rename-view'
    }, (function(_this) {
      return function() {
        _this.div({
          "class": 'block'
        }, function() {
          return _this.div(function() {
            _this.span({
              outlet: 'title'
            }, function() {
              return 'Rename Variable';
            });
            return _this.span({
              "class": 'subtle-info-message'
            }, function() {
              _this.span('Close this panel with ');
              _this.span({
                "class": 'highlight'
              }, 'esc');
              _this.span(' key. And commit with the ');
              _this.span({
                "class": 'highlight'
              }, 'enter');
              return _this.span('key.');
            });
          });
        });
        _this.div({
          "class": 'find-container block'
        }, function() {
          return _this.div({
            "class": 'editor-container'
          }, function() {
            return _this.subview('newNameEditor', new TextEditorView({
              mini: true,
              placeholderText: 'new name'
            }));
          });
        });
        _this.div({
          outlet: 'fileCount'
        }, function() {});
        _this.br({});
        return _this.div({
          "class": 'highlight-error',
          style: 'display:none',
          outlet: 'validationMessage'
        });
      };
    })(this));
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvc2VwaXJvcGh0Ly5hdG9tL3BhY2thZ2VzL2F0b20tdHlwZXNjcmlwdC92aWV3cy9yZW5hbWVWaWV3Lmh0bWwuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxNQUE4QixPQUFBLENBQVEsc0JBQVIsQ0FBOUIsRUFBQyxhQUFELEVBQU0sZUFBTixFQUFZOztFQUVaLE1BQU0sQ0FBQyxPQUFQLEdBQ0ksU0FBQTtXQUNJLElBQUMsQ0FBQSxHQUFELENBQUs7TUFBQSxRQUFBLEVBQVUsQ0FBQyxDQUFYO01BQWMsQ0FBQSxLQUFBLENBQUEsRUFBTyxvQkFBckI7S0FBTCxFQUFnRCxDQUFBLFNBQUEsS0FBQTthQUFBLFNBQUE7UUFDNUMsS0FBQyxDQUFBLEdBQUQsQ0FBSztVQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sT0FBUDtTQUFMLEVBQXFCLFNBQUE7aUJBQ2pCLEtBQUMsQ0FBQSxHQUFELENBQUssU0FBQTtZQUNELEtBQUMsQ0FBQSxJQUFELENBQU07Y0FBQyxNQUFBLEVBQVEsT0FBVDthQUFOLEVBQXlCLFNBQUE7cUJBQUc7WUFBSCxDQUF6QjttQkFDQSxLQUFDLENBQUEsSUFBRCxDQUFNO2NBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxxQkFBUDthQUFOLEVBQW9DLFNBQUE7Y0FDaEMsS0FBQyxDQUFBLElBQUQsQ0FBTSx3QkFBTjtjQUNBLEtBQUMsQ0FBQSxJQUFELENBQU07Z0JBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTSxXQUFOO2VBQU4sRUFBeUIsS0FBekI7Y0FDQSxLQUFDLENBQUEsSUFBRCxDQUFNLDRCQUFOO2NBQ0EsS0FBQyxDQUFBLElBQUQsQ0FBTTtnQkFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFNLFdBQU47ZUFBTixFQUF5QixPQUF6QjtxQkFDQSxLQUFDLENBQUEsSUFBRCxDQUFNLE1BQU47WUFMZ0MsQ0FBcEM7VUFGQyxDQUFMO1FBRGlCLENBQXJCO1FBVUEsS0FBQyxDQUFBLEdBQUQsQ0FBSztVQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sc0JBQVA7U0FBTCxFQUFvQyxTQUFBO2lCQUNoQyxLQUFDLENBQUEsR0FBRCxDQUFLO1lBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxrQkFBUDtXQUFMLEVBQWdDLFNBQUE7bUJBQzVCLEtBQUMsQ0FBQSxPQUFELENBQVMsZUFBVCxFQUE4QixJQUFBLGNBQUEsQ0FBZTtjQUFBLElBQUEsRUFBTSxJQUFOO2NBQVksZUFBQSxFQUFpQixVQUE3QjthQUFmLENBQTlCO1VBRDRCLENBQWhDO1FBRGdDLENBQXBDO1FBSUEsS0FBQyxDQUFBLEdBQUQsQ0FBSztVQUFDLE1BQUEsRUFBTyxXQUFSO1NBQUwsRUFBMkIsU0FBQSxHQUFBLENBQTNCO1FBQ0EsS0FBQyxDQUFBLEVBQUQsQ0FBSSxFQUFKO2VBQ0EsS0FBQyxDQUFBLEdBQUQsQ0FBSztVQUFDLENBQUEsS0FBQSxDQUFBLEVBQU8saUJBQVI7VUFBMkIsS0FBQSxFQUFNLGNBQWpDO1VBQWlELE1BQUEsRUFBTyxtQkFBeEQ7U0FBTDtNQWpCNEM7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWhEO0VBREo7QUFISiIsInNvdXJjZXNDb250ZW50IjpbInskJCQsIFZpZXcsIFRleHRFZGl0b3JWaWV3fSA9IHJlcXVpcmUgJ2F0b20tc3BhY2UtcGVuLXZpZXdzJ1xuXG5tb2R1bGUuZXhwb3J0cyA9XG4gICAgLT5cbiAgICAgICAgQGRpdiB0YWJJbmRleDogLTEsIGNsYXNzOiAnYXRvbXRzLXJlbmFtZS12aWV3JywgPT5cbiAgICAgICAgICAgIEBkaXYgY2xhc3M6ICdibG9jaycsID0+XG4gICAgICAgICAgICAgICAgQGRpdiA9PlxuICAgICAgICAgICAgICAgICAgICBAc3BhbiB7b3V0bGV0OiAndGl0bGUnfSwgPT4gJ1JlbmFtZSBWYXJpYWJsZSdcbiAgICAgICAgICAgICAgICAgICAgQHNwYW4gY2xhc3M6ICdzdWJ0bGUtaW5mby1tZXNzYWdlJywgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgIEBzcGFuICdDbG9zZSB0aGlzIHBhbmVsIHdpdGggJ1xuICAgICAgICAgICAgICAgICAgICAgICAgQHNwYW4gY2xhc3M6J2hpZ2hsaWdodCcsICdlc2MnXG4gICAgICAgICAgICAgICAgICAgICAgICBAc3BhbiAnIGtleS4gQW5kIGNvbW1pdCB3aXRoIHRoZSAnXG4gICAgICAgICAgICAgICAgICAgICAgICBAc3BhbiBjbGFzczonaGlnaGxpZ2h0JywgJ2VudGVyJ1xuICAgICAgICAgICAgICAgICAgICAgICAgQHNwYW4gJ2tleS4nXG5cbiAgICAgICAgICAgIEBkaXYgY2xhc3M6ICdmaW5kLWNvbnRhaW5lciBibG9jaycsID0+XG4gICAgICAgICAgICAgICAgQGRpdiBjbGFzczogJ2VkaXRvci1jb250YWluZXInLCA9PlxuICAgICAgICAgICAgICAgICAgICBAc3VidmlldyAnbmV3TmFtZUVkaXRvcicsIG5ldyBUZXh0RWRpdG9yVmlldyhtaW5pOiB0cnVlLCBwbGFjZWhvbGRlclRleHQ6ICduZXcgbmFtZScpXG5cbiAgICAgICAgICAgIEBkaXYge291dGxldDonZmlsZUNvdW50J30sID0+IHJldHVyblxuICAgICAgICAgICAgQGJyIHt9XG4gICAgICAgICAgICBAZGl2IHtjbGFzczogJ2hpZ2hsaWdodC1lcnJvcicsIHN0eWxlOidkaXNwbGF5Om5vbmUnLCBvdXRsZXQ6J3ZhbGlkYXRpb25NZXNzYWdlJ30sXG4iXX0=
