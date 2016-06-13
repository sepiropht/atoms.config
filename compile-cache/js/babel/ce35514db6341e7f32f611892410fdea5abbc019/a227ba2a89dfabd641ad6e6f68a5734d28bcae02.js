'use babel';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _require = require('atom');

var CompositeDisposable = _require.CompositeDisposable;

var SyncScroll = (function () {
  function SyncScroll(editor1, editor2) {
    var _this = this;

    _classCallCheck(this, SyncScroll);

    this._subscriptions = new CompositeDisposable();
    this._syncInfo = [{
      editor: editor1,
      scrolling: false
    }, {
      editor: editor2,
      scrolling: false
    }];

    this._syncInfo.forEach(function (editorInfo, i) {
      // Note that 'onDidChangeScrollTop' isn't technically in the public API.
      _this._subscriptions.add(editorInfo.editor.onDidChangeScrollTop(function () {
        return _this._scrollPositionChanged(i);
      }));
    });
  }

  _createClass(SyncScroll, [{
    key: '_scrollPositionChanged',
    value: function _scrollPositionChanged(changeScrollIndex) {
      var thisInfo = this._syncInfo[changeScrollIndex];
      var otherInfo = this._syncInfo[1 - changeScrollIndex];
      if (thisInfo.scrolling) {
        return;
      }
      var thisEditor = thisInfo.editor;
      var otherEditor = otherInfo.editor;

      otherInfo.scrolling = true;
      try {
        otherEditor.setScrollTop(thisEditor.getScrollTop());
      } catch (e) {
        //console.log(e);
      }
      otherInfo.scrolling = false;
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      if (this._subscriptions) {
        this._subscriptions.dispose();
        this._subscriptions = null;
      }
    }
  }, {
    key: 'syncPositions',
    value: function syncPositions() {
      var activeTextEditor = atom.workspace.getActiveTextEditor();
      this._syncInfo.forEach(function (editorInfo, i) {
        if (editorInfo.editor == activeTextEditor) {
          editorInfo.editor.emitter.emit('did-change-scroll-top', editorInfo.editor.getScrollTop());
        }
      });
    }
  }]);

  return SyncScroll;
})();

module.exports = SyncScroll;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3dpbGxpYW0vLmF0b20vcGFja2FnZXMvZ2l0LXRpbWUtbWFjaGluZS9ub2RlX21vZHVsZXMvc3BsaXQtZGlmZi9saWIvc3luYy1zY3JvbGwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsV0FBVyxDQUFDOzs7Ozs7ZUFFZ0IsT0FBTyxDQUFDLE1BQU0sQ0FBQzs7SUFBdEMsbUJBQW1CLFlBQW5CLG1CQUFtQjs7SUFFbEIsVUFBVTtBQUVILFdBRlAsVUFBVSxDQUVGLE9BQW1CLEVBQUUsT0FBbUIsRUFBRTs7OzBCQUZsRCxVQUFVOztBQUdaLFFBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxtQkFBbUIsRUFBRSxDQUFDO0FBQ2hELFFBQUksQ0FBQyxTQUFTLEdBQUcsQ0FBQztBQUNoQixZQUFNLEVBQUUsT0FBTztBQUNmLGVBQVMsRUFBRSxLQUFLO0tBQ2pCLEVBQUU7QUFDRCxZQUFNLEVBQUUsT0FBTztBQUNmLGVBQVMsRUFBRSxLQUFLO0tBQ2pCLENBQUMsQ0FBQzs7QUFFSCxRQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxVQUFDLFVBQVUsRUFBRSxDQUFDLEVBQUs7O0FBRXhDLFlBQUssY0FBYyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLG9CQUFvQixDQUFDO2VBQU0sTUFBSyxzQkFBc0IsQ0FBQyxDQUFDLENBQUM7T0FBQSxDQUFDLENBQUMsQ0FBQztLQUN2RyxDQUFDLENBQUM7R0FDSjs7ZUFoQkcsVUFBVTs7V0FrQlEsZ0NBQUMsaUJBQXlCLEVBQVE7QUFDdEQsVUFBSSxRQUFRLEdBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0FBQ2xELFVBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxHQUFHLGlCQUFpQixDQUFDLENBQUM7QUFDdEQsVUFBSSxRQUFRLENBQUMsU0FBUyxFQUFFO0FBQ3RCLGVBQU87T0FDUjtVQUNZLFVBQVUsR0FBSSxRQUFRLENBQTlCLE1BQU07VUFDRSxXQUFXLEdBQUksU0FBUyxDQUFoQyxNQUFNOztBQUNYLGVBQVMsQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO0FBQzNCLFVBQUk7QUFDRixtQkFBVyxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQztPQUNyRCxDQUFDLE9BQU8sQ0FBQyxFQUFFOztPQUVYO0FBQ0QsZUFBUyxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUM7S0FDN0I7OztXQUVNLG1CQUFTO0FBQ2QsVUFBSSxJQUFJLENBQUMsY0FBYyxFQUFFO0FBQ3ZCLFlBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDOUIsWUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUM7T0FDNUI7S0FDRjs7O1dBRVkseUJBQVM7QUFDcEIsVUFBSSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLG1CQUFtQixFQUFFLENBQUM7QUFDNUQsVUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsVUFBQyxVQUFVLEVBQUUsQ0FBQyxFQUFLO0FBQ3hDLFlBQUcsVUFBVSxDQUFDLE1BQU0sSUFBSSxnQkFBZ0IsRUFBRTtBQUN4QyxvQkFBVSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLHVCQUF1QixFQUFFLFVBQVUsQ0FBQyxNQUFNLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQztTQUMzRjtPQUNGLENBQUMsQ0FBQztLQUNKOzs7U0FqREcsVUFBVTs7O0FBb0RoQixNQUFNLENBQUMsT0FBTyxHQUFHLFVBQVUsQ0FBQyIsImZpbGUiOiIvaG9tZS93aWxsaWFtLy5hdG9tL3BhY2thZ2VzL2dpdC10aW1lLW1hY2hpbmUvbm9kZV9tb2R1bGVzL3NwbGl0LWRpZmYvbGliL3N5bmMtc2Nyb2xsLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbnZhciB7Q29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlKCdhdG9tJyk7XG5cbmNsYXNzIFN5bmNTY3JvbGwge1xuXG4gIGNvbnN0cnVjdG9yKGVkaXRvcjE6IFRleHRFZGl0b3IsIGVkaXRvcjI6IFRleHRFZGl0b3IpIHtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICB0aGlzLl9zeW5jSW5mbyA9IFt7XG4gICAgICBlZGl0b3I6IGVkaXRvcjEsXG4gICAgICBzY3JvbGxpbmc6IGZhbHNlLFxuICAgIH0sIHtcbiAgICAgIGVkaXRvcjogZWRpdG9yMixcbiAgICAgIHNjcm9sbGluZzogZmFsc2UsXG4gICAgfV07XG5cbiAgICB0aGlzLl9zeW5jSW5mby5mb3JFYWNoKChlZGl0b3JJbmZvLCBpKSA9PiB7XG4gICAgICAvLyBOb3RlIHRoYXQgJ29uRGlkQ2hhbmdlU2Nyb2xsVG9wJyBpc24ndCB0ZWNobmljYWxseSBpbiB0aGUgcHVibGljIEFQSS5cbiAgICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKGVkaXRvckluZm8uZWRpdG9yLm9uRGlkQ2hhbmdlU2Nyb2xsVG9wKCgpID0+IHRoaXMuX3Njcm9sbFBvc2l0aW9uQ2hhbmdlZChpKSkpO1xuICAgIH0pO1xuICB9XG5cbiAgX3Njcm9sbFBvc2l0aW9uQ2hhbmdlZChjaGFuZ2VTY3JvbGxJbmRleDogbnVtYmVyKTogdm9pZCB7XG4gICAgdmFyIHRoaXNJbmZvICA9IHRoaXMuX3N5bmNJbmZvW2NoYW5nZVNjcm9sbEluZGV4XTtcbiAgICB2YXIgb3RoZXJJbmZvID0gdGhpcy5fc3luY0luZm9bMSAtIGNoYW5nZVNjcm9sbEluZGV4XTtcbiAgICBpZiAodGhpc0luZm8uc2Nyb2xsaW5nKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciB7ZWRpdG9yOiB0aGlzRWRpdG9yfSA9IHRoaXNJbmZvO1xuICAgIHZhciB7ZWRpdG9yOiBvdGhlckVkaXRvcn0gPSBvdGhlckluZm87XG4gICAgb3RoZXJJbmZvLnNjcm9sbGluZyA9IHRydWU7XG4gICAgdHJ5IHtcbiAgICAgIG90aGVyRWRpdG9yLnNldFNjcm9sbFRvcCh0aGlzRWRpdG9yLmdldFNjcm9sbFRvcCgpKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAvL2NvbnNvbGUubG9nKGUpO1xuICAgIH1cbiAgICBvdGhlckluZm8uc2Nyb2xsaW5nID0gZmFsc2U7XG4gIH1cblxuICBkaXNwb3NlKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9zdWJzY3JpcHRpb25zKSB7XG4gICAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIHN5bmNQb3NpdGlvbnMoKTogdm9pZCB7XG4gICAgdmFyIGFjdGl2ZVRleHRFZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCk7XG4gICAgdGhpcy5fc3luY0luZm8uZm9yRWFjaCgoZWRpdG9ySW5mbywgaSkgPT4ge1xuICAgICAgaWYoZWRpdG9ySW5mby5lZGl0b3IgPT0gYWN0aXZlVGV4dEVkaXRvcikge1xuICAgICAgICBlZGl0b3JJbmZvLmVkaXRvci5lbWl0dGVyLmVtaXQoJ2RpZC1jaGFuZ2Utc2Nyb2xsLXRvcCcsIGVkaXRvckluZm8uZWRpdG9yLmdldFNjcm9sbFRvcCgpKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFN5bmNTY3JvbGw7XG4iXX0=
//# sourceURL=/home/william/.atom/packages/git-time-machine/node_modules/split-diff/lib/sync-scroll.js
