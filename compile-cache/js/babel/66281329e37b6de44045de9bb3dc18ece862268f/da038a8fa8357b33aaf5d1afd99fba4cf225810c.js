'use babel';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _require = require('atom');

var Range = _require.Range;

var _require2 = require('./build-lines-helper');

var buildLineRangesWithOffsets = _require2.buildLineRangesWithOffsets;

module.exports = (function () {
  function DiffViewEditor(editor) {
    var _this = this;

    _classCallCheck(this, DiffViewEditor);

    this._editor = editor;
    this._markers = [];
    this._currentSelection = [];
    this._lineOffsets = {};

    // Ugly Hack to the display buffer to allow fake soft wrapped lines,
    // to create the non-numbered empty space needed between real text buffer lines.
    this._originalBuildScreenLines = this._editor.displayBuffer.buildScreenLines;
    this._originalCheckScreenLinesInvariant = this._editor.displayBuffer.checkScreenLinesInvariant;
    this._editor.displayBuffer.checkScreenLinesInvariant = function () {};
    this._editor.displayBuffer.buildScreenLines = function () {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return _this._buildScreenLinesWithOffsets.apply(_this, args);
    };
  }

  _createClass(DiffViewEditor, [{
    key: '_buildScreenLinesWithOffsets',
    value: function _buildScreenLinesWithOffsets(startBufferRow, endBufferRow) {
      var _originalBuildScreenLines$apply = this._originalBuildScreenLines.apply(this._editor.displayBuffer, arguments);

      var regions = _originalBuildScreenLines$apply.regions;
      var screenLines = _originalBuildScreenLines$apply.screenLines;

      if (!Object.keys(this._lineOffsets).length) {
        return { regions: regions, screenLines: screenLines };
      }

      return buildLineRangesWithOffsets(screenLines, this._lineOffsets, startBufferRow, endBufferRow, function () {
        var copy = screenLines[0].copy();
        copy.token = [];
        copy.text = '';
        copy.tags = [];
        return copy;
      });
    }
  }, {
    key: 'setLineOffsets',
    value: function setLineOffsets(lineOffsets) {
      this._lineOffsets = lineOffsets;
      // When the diff view is editable: upon edits in the new editor, the old editor needs to update its
      // rendering state to show the offset wrapped lines.
      // This isn't a public API, but came from a discussion on the Atom public channel.
      // Needed Atom API: Request a full re-render from an editor.
      this._editor.displayBuffer.updateAllScreenLines();
    }
  }, {
    key: 'removeLineOffsets',
    value: function removeLineOffsets() {
      this._editor.displayBuffer.checkScreenLinesInvariant = this._originalCheckScreenLinesInvariant;
      this._editor.displayBuffer.buildScreenLines = this._originalBuildScreenLines;
      this._editor.displayBuffer.updateAllScreenLines();
    }

    /**
     * @param addedLines An array of buffer line numbers that should be highlighted as added.
     * @param removedLines An array of buffer line numbers that should be highlighted as removed.
     */
  }, {
    key: 'setLineHighlights',
    value: function setLineHighlights() {
      var _this2 = this;

      var addedLines = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];
      var removedLines = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

      this._markers = addedLines.map(function (lineNumber) {
        return _this2._createLineMarker(lineNumber, 'added');
      }).concat(removedLines.map(function (lineNumber) {
        return _this2._createLineMarker(lineNumber, 'removed');
      }));
    }

    /**
     * @param lineNumber A buffer line number to be highlighted.
     * @param type The type of highlight to be applied to the line.
     *    Could be a value of: ['insert', 'delete'].
     */
  }, {
    key: '_createLineMarker',
    value: function _createLineMarker(lineNumber, type) {
      var klass = 'split-diff-' + type;
      var screenPosition = this._editor.screenPositionForBufferPosition({ row: lineNumber, column: 0 });
      var marker = this._editor.markScreenPosition(screenPosition, { invalidate: 'never', persistent: false, 'class': klass });

      this._editor.decorateMarker(marker, { type: 'line', 'class': klass });
      return marker;
    }
  }, {
    key: 'removeLineHighlights',
    value: function removeLineHighlights() {
      this._markers.map(function (marker) {
        return marker.destroy();
      });
    }
  }, {
    key: 'scrollToTop',
    value: function scrollToTop() {
      this._editor.scrollToTop();
    }
  }, {
    key: 'scrollToLine',
    value: function scrollToLine(lineNumber) {
      this._editor.scrollToBufferPosition([lineNumber, 0]);
    }
  }, {
    key: 'destroyMarkers',
    value: function destroyMarkers() {
      for (var i = 0; i < this._markers.length; i++) {
        this._markers[i].destroy();
      }
      this._markers = [];

      this.deselectAllLines();
    }

    /**
     * @param startLine The line number that the selection starts at.
     * @param endLine The line number that the selection ends at (non-inclusive).
     */
  }, {
    key: 'selectLines',
    value: function selectLines(startLine, endLine) {
      for (var i = startLine; i < endLine; i++) {
        this._currentSelection.push(this._createLineMarker(i, 'selected'));
      }
    }
  }, {
    key: 'deselectAllLines',
    value: function deselectAllLines() {
      for (var i = 0; i < this._currentSelection.length; i++) {
        this._currentSelection[i].destroy();
      }
      this._currentSelection = [];
    }
  }, {
    key: 'enableSoftWrap',
    value: function enableSoftWrap() {
      this._editor.setSoftWrapped(true);
    }
  }]);

  return DiffViewEditor;
})();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3dpbGxpYW0vLmF0b20vcGFja2FnZXMvZ2l0LXRpbWUtbWFjaGluZS9ub2RlX21vZHVsZXMvc3BsaXQtZGlmZi9saWIvYnVpbGQtbGluZXMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsV0FBVyxDQUFBOzs7Ozs7ZUFFSSxPQUFPLENBQUMsTUFBTSxDQUFDOztJQUF6QixLQUFLLFlBQUwsS0FBSzs7Z0JBQ3lCLE9BQU8sQ0FBQyxzQkFBc0IsQ0FBQzs7SUFBN0QsMEJBQTBCLGFBQTFCLDBCQUEwQjs7QUFFL0IsTUFBTSxDQUFDLE9BQU87QUFRRCxXQVJVLGNBQWMsQ0FRdkIsTUFBTSxFQUFFOzs7MEJBUkMsY0FBYzs7QUFTakMsUUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7QUFDdEIsUUFBSSxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUM7QUFDbkIsUUFBSSxDQUFDLGlCQUFpQixHQUFHLEVBQUUsQ0FBQztBQUM1QixRQUFJLENBQUMsWUFBWSxHQUFHLEVBQUUsQ0FBQzs7OztBQUl2QixRQUFJLENBQUMseUJBQXlCLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsZ0JBQWdCLENBQUM7QUFDN0UsUUFBSSxDQUFDLGtDQUFrQyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLHlCQUF5QixDQUFDO0FBQy9GLFFBQUksQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLHlCQUF5QixHQUFHLFlBQU0sRUFBRSxDQUFDO0FBQ2hFLFFBQUksQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLGdCQUFnQixHQUFHO3dDQUFJLElBQUk7QUFBSixZQUFJOzs7YUFBSyxNQUFLLDRCQUE0QixDQUFDLEtBQUssUUFBTyxJQUFJLENBQUM7S0FBQSxDQUFDO0dBQ2hIOztlQXBCb0IsY0FBYzs7V0FzQlAsc0NBQUMsY0FBc0IsRUFBRSxZQUFvQixFQUF5Qjs0Q0FDbkUsSUFBSSxDQUFDLHlCQUF5QixDQUFDLEtBQUssQ0FBQyxJ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c0IsQ0FBQyxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ3REOzs7V0FFYSwwQkFBUztBQUNyQixXQUFJLElBQUksQ0FBQyxHQUFDLENBQUMsRUFBRSxDQUFDLEdBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDeEMsWUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztPQUM1QjtBQUNELFVBQUksQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFDOztBQUVuQixVQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztLQUN6Qjs7Ozs7Ozs7V0FNVSxxQkFBQyxTQUFpQixFQUFFLE9BQWUsRUFBUTtBQUNwRCxXQUFJLElBQUksQ0FBQyxHQUFDLFNBQVMsRUFBRSxDQUFDLEdBQUMsT0FBTyxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQ25DLFlBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUMsRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDO09BQ3BFO0tBQ0Y7OztXQUVlLDRCQUFTO0FBQ3ZCLFdBQUksSUFBSSxDQUFDLEdBQUMsQ0FBQyxFQUFFLENBQUMsR0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQ2pELFlBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztPQUNyQztBQUNELFVBQUksQ0FBQyxpQkFBaUIsR0FBRyxFQUFFLENBQUM7S0FDN0I7OztXQUVhLDBCQUFTO0FBQ3JCLFVBQUksQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDO0tBQ25DOzs7U0FySG9CLGNBQWM7SUFzSHBDLENBQUMiLCJmaWxlIjoiL2hvbWUvd2lsbGlhbS8uYXRvbS9wYWNrYWdlcy9naXQtdGltZS1tYWNoaW5lL25vZGVfbW9kdWxlcy9zcGxpdC1kaWZmL2xpYi9idWlsZC1saW5lcy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnXG5cbnZhciB7UmFuZ2V9ICA9IHJlcXVpcmUoJ2F0b20nKTtcbnZhciB7YnVpbGRMaW5lUmFuZ2VzV2l0aE9mZnNldHN9ID0gcmVxdWlyZSgnLi9idWlsZC1saW5lcy1oZWxwZXInKTtcblxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBEaWZmVmlld0VkaXRvciB7XG4gIF9lZGl0b3I6IE9iamVjdDtcbiAgX21hcmtlcnM6IEFycmF5PGF0b20kTWFya2VyPjtcbiAgX2N1cnJlbnRTZWxlY3Rpb246IEFycmF5PGF0b20kTWFya2VyPjtcbiAgX2xpbmVPZmZzZXRzOiBPYmplY3Q7XG4gIF9vcmlnaW5hbEJ1aWxkU2NyZWVuTGluZXM6ICgpID0+IE9iamVjdDtcbiAgX29yaWdpbmFsQ2hlY2tTY3JlZW5MaW5lc0ludmFyaWFudDogKCkgPT4gT2JqZWN0O1xuXG4gIGNvbnN0cnVjdG9yKGVkaXRvcikge1xuICAgIHRoaXMuX2VkaXRvciA9IGVkaXRvcjtcbiAgICB0aGlzLl9tYXJrZXJzID0gW107XG4gICAgdGhpcy5fY3VycmVudFNlbGVjdGlvbiA9IFtdO1xuICAgIHRoaXMuX2xpbmVPZmZzZXRzID0ge307XG5cbiAgICAvLyBVZ2x5IEhhY2sgdG8gdGhlIGRpc3BsYXkgYnVmZmVyIHRvIGFsbG93IGZha2Ugc29mdCB3cmFwcGVkIGxpbmVzLFxuICAgIC8vIHRvIGNyZWF0ZSB0aGUgbm9uLW51bWJlcmVkIGVtcHR5IHNwYWNlIG5lZWRlZCBiZXR3ZWVuIHJlYWwgdGV4dCBidWZmZXIgbGluZXMuXG4gICAgdGhpcy5fb3JpZ2luYWxCdWlsZFNjcmVlbkxpbmVzID0gdGhpcy5fZWRpdG9yLmRpc3BsYXlCdWZmZXIuYnVpbGRTY3JlZW5MaW5lcztcbiAgICB0aGlzLl9vcmlnaW5hbENoZWNrU2NyZWVuTGluZXNJbnZhcmlhbnQgPSB0aGlzLl9lZGl0b3IuZGlzcGxheUJ1ZmZlci5jaGVja1NjcmVlbkxpbmVzSW52YXJpYW50O1xuICAgIHRoaXMuX2VkaXRvci5kaXNwbGF5QnVmZmVyLmNoZWNrU2NyZWVuTGluZXNJbnZhcmlhbnQgPSAoKSA9PiB7fTtcbiAgICB0aGlzLl9lZGl0b3IuZGlzcGxheUJ1ZmZlci5idWlsZFNjcmVlbkxpbmVzID0gKC4uLmFyZ3MpID0+IHRoaXMuX2J1aWxkU2NyZWVuTGluZXNXaXRoT2Zmc2V0cy5hcHBseSh0aGlzLCBhcmdzKTtcbiAgfVxuXG4gIF9idWlsZFNjcmVlbkxpbmVzV2l0aE9mZnNldHMoc3RhcnRCdWZmZXJSb3c6IG51bWJlciwgZW5kQnVmZmVyUm93OiBudW1iZXIpOiBMaW5lUmFuZ2VzV2l0aE9mZnNldHMge1xuICAgIHZhciB7cmVnaW9ucywgc2NyZWVuTGluZXN9ID0gdGhpcy5fb3JpZ2luYWxCdWlsZFNjcmVlbkxpbmVzLmFwcGx5KHRoaXMuX2VkaXRvci5kaXNwbGF5QnVmZmVyLCBhcmd1bWVudHMpO1xuICAgIGlmICghT2JqZWN0LmtleXModGhpcy5fbGluZU9mZnNldHMpLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIHtyZWdpb25zLCBzY3JlZW5MaW5lc307XG4gICAgfVxuXG4gICAgcmV0dXJuIGJ1aWxkTGluZVJhbmdlc1dpdGhPZmZzZXRzKHNjcmVlbkxpbmVzLCB0aGlzLl9saW5lT2Zmc2V0cywgc3RhcnRCdWZmZXJSb3csIGVuZEJ1ZmZlclJvdyxcbiAgICAgICgpID0+IHtcbiAgICAgICAgdmFyIGNvcHkgPSBzY3JlZW5MaW5lc1swXS5jb3B5KCk7XG4gICAgICAgIGNvcHkudG9rZW4gPSBbXTtcbiAgICAgICAgY29weS50ZXh0ID0gJyc7XG4gICAgICAgIGNvcHkudGFncyA9IFtdO1xuICAgICAgICByZXR1cm4gY29weTtcbiAgICAgIH1cbiAgICApO1xuICB9XG5cbiAgc2V0TGluZU9mZnNldHMobGluZU9mZnNldHM6IGFueSk6IHZvaWQge1xuICAgIHRoaXMuX2xpbmVPZmZzZXRzID0gbGluZU9mZnNldHM7XG4gICAgLy8gV2hlbiB0aGUgZGlmZiB2aWV3IGlzIGVkaXRhYmxlOiB1cG9uIGVkaXRzIGluIHRoZSBuZXcgZWRpdG9yLCB0aGUgb2xkIGVkaXRvciBuZWVkcyB0byB1cGRhdGUgaXRzXG4gICAgLy8gcmVuZGVyaW5nIHN0YXRlIHRvIHNob3cgdGhlIG9mZnNldCB3cmFwcGVkIGxpbmVzLlxuICAgIC8vIFRoaXMgaXNuJ3QgYSBwdWJsaWMgQVBJLCBidXQgY2FtZSBmcm9tIGEgZGlzY3Vzc2lvbiBvbiB0aGUgQXRvbSBwdWJsaWMgY2hhbm5lbC5cbiAgICAvLyBOZWVkZWQgQXRvbSBBUEk6IFJlcXVlc3QgYSBmdWxsIHJlLXJlbmRlciBmcm9tIGFuIGVkaXRvci5cbiAgICB0aGlzLl9lZGl0b3IuZGlzcGxheUJ1ZmZlci51cGRhdGVBbGxTY3JlZW5MaW5lcygpO1xuICB9XG5cbiAgcmVtb3ZlTGluZU9mZnNldHMoKTogdm9pZCB7XG4gICAgdGhpcy5fZWRpdG9yLmRpc3BsYXlCdWZmZXIuY2hlY2tTY3JlZW5MaW5lc0ludmFyaWFudCA9IHRoaXMuX29yaWdpbmFsQ2hlY2tTY3JlZW5MaW5lc0ludmFyaWFudDtcbiAgICB0aGlzLl9lZGl0b3IuZGlzcGxheUJ1ZmZlci5idWlsZFNjcmVlbkxpbmVzID0gdGhpcy5fb3JpZ2luYWxCdWlsZFNjcmVlbkxpbmVzO1xuICAgIHRoaXMuX2VkaXRvci5kaXNwbGF5QnVmZmVyLnVwZGF0ZUFsbFNjcmVlbkxpbmVzKCk7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIGFkZGVkTGluZXMgQW4gYXJyYXkgb2YgYnVmZmVyIGxpbmUgbnVtYmVycyB0aGF0IHNob3VsZCBiZSBoaWdobGlnaHRlZCBhcyBhZGRlZC5cbiAgICogQHBhcmFtIHJlbW92ZWRMaW5lcyBBbiBhcnJheSBvZiBidWZmZXIgbGluZSBudW1iZXJzIHRoYXQgc2hvdWxkIGJlIGhpZ2hsaWdodGVkIGFzIHJlbW92ZWQuXG4gICAqL1xuICBzZXRMaW5lSGlnaGxpZ2h0cyhhZGRlZExpbmVzOiBBcnJheTxudW1iZXI+ID0gW10sIHJlbW92ZWRMaW5lczogQXJyYXk8bnVtYmVyPiA9IFtdKSB7XG4gICAgdGhpcy5fbWFya2VycyA9IGFkZGVkTGluZXMubWFwKGxpbmVOdW1iZXIgPT4gdGhpcy5fY3JlYXRlTGluZU1hcmtlcihsaW5lTnVtYmVyLCAnYWRkZWQnKSlcbiAgICAgICAgLmNvbmNhdChyZW1vdmVkTGluZXMubWFwKGxpbmVOdW1iZXIgPT4gdGhpcy5fY3JlYXRlTGluZU1hcmtlcihsaW5lTnVtYmVyLCAncmVtb3ZlZCcpKSk7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIGxpbmVOdW1iZXIgQSBidWZmZXIgbGluZSBudW1iZXIgdG8gYmUgaGlnaGxpZ2h0ZWQuXG4gICAqIEBwYXJhbSB0eXBlIFRoZSB0eXBlIG9mIGhpZ2hsaWdodCB0byBiZSBhcHBsaWVkIHRvIHRoZSBsaW5lLlxuICAgKiAgICBDb3VsZCBiZSBhIHZhbHVlIG9mOiBbJ2luc2VydCcsICdkZWxldGUnXS5cbiAgICovXG4gIF9jcmVhdGVMaW5lTWFya2VyKGxpbmVOdW1iZXI6IG51bWJlciwgdHlwZTogc3RyaW5nKTogYXRvbSRNYXJrZXIge1xuICAgIHZhciBrbGFzcyA9ICdzcGxpdC1kaWZmLScgKyB0eXBlO1xuICAgIHZhciBzY3JlZW5Qb3NpdGlvbiA9IHRoaXMuX2VkaXRvci5zY3JlZW5Qb3NpdGlvbkZvckJ1ZmZlclBvc2l0aW9uKHtyb3c6IGxpbmVOdW1iZXIsIGNvbHVtbjogMH0pO1xuICAgIHZhciBtYXJrZXIgPSB0aGlzLl9lZGl0b3IubWFya1NjcmVlblBvc2l0aW9uKHNjcmVlblBvc2l0aW9uLCB7aW52YWxpZGF0ZTogJ25ldmVyJywgcGVyc2lzdGVudDogZmFsc2UsIGNsYXNzOiBrbGFzc30pO1xuXG4gICAgdGhpcy5fZWRpdG9yLmRlY29yYXRlTWFya2VyKG1hcmtlciwge3R5cGU6ICdsaW5lJywgY2xhc3M6IGtsYXNzfSk7XG4gICAgcmV0dXJuIG1hcmtlcjtcbiAgfVxuXG4gIHJlbW92ZUxpbmVIaWdobGlnaHRzKCk6IHZvaWQge1xuICAgIHRoaXMuX21hcmtlcnMubWFwKG1hcmtlciA9PiBtYXJrZXIuZGVzdHJveSgpKTtcbiAgfVxuXG4gIHNjcm9sbFRvVG9wKCk6IHZvaWQge1xuICAgIHRoaXMuX2VkaXRvci5zY3JvbGxUb1RvcCgpO1xuICB9XG5cbiAgc2Nyb2xsVG9MaW5lKGxpbmVOdW1iZXI6IG51bWJlcik6IHZvaWQge1xuICAgIHRoaXMuX2VkaXRvci5zY3JvbGxUb0J1ZmZlclBvc2l0aW9uKFtsaW5lTnVtYmVyLCAwXSk7XG4gIH1cblxuICBkZXN0cm95TWFya2VycygpOiB2b2lkIHtcbiAgICBmb3IodmFyIGk9MDsgaTx0aGlzLl9tYXJrZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB0aGlzLl9tYXJrZXJzW2ldLmRlc3Ryb3koKTtcbiAgICB9XG4gICAgdGhpcy5fbWFya2VycyA9IFtdO1xuXG4gICAgdGhpcy5kZXNlbGVjdEFsbExpbmVzKCk7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHN0YXJ0TGluZSBUaGUgbGluZSBudW1iZXIgdGhhdCB0aGUgc2VsZWN0aW9uIHN0YXJ0cyBhdC5cbiAgICogQHBhcmFtIGVuZExpbmUgVGhlIGxpbmUgbnVtYmVyIHRoYXQgdGhlIHNlbGVjdGlvbiBlbmRzIGF0IChub24taW5jbHVzaXZlKS5cbiAgICovXG4gIHNlbGVjdExpbmVzKHN0YXJ0TGluZTogbnVtYmVyLCBlbmRMaW5lOiBudW1iZXIpOiB2b2lkIHtcbiAgICBmb3IodmFyIGk9c3RhcnRMaW5lOyBpPGVuZExpbmU7IGkrKykge1xuICAgICAgdGhpcy5fY3VycmVudFNlbGVjdGlvbi5wdXNoKHRoaXMuX2NyZWF0ZUxpbmVNYXJrZXIoaSwgJ3NlbGVjdGVkJykpO1xuICAgIH1cbiAgfVxuXG4gIGRlc2VsZWN0QWxsTGluZXMoKTogdm9pZCB7XG4gICAgZm9yKHZhciBpPTA7IGk8dGhpcy5fY3VycmVudFNlbGVjdGlvbi5sZW5ndGg7IGkrKykge1xuICAgICAgdGhpcy5fY3VycmVudFNlbGVjdGlvbltpXS5kZXN0cm95KCk7XG4gICAgfVxuICAgIHRoaXMuX2N1cnJlbnRTZWxlY3Rpb24gPSBbXTtcbiAgfVxuXG4gIGVuYWJsZVNvZnRXcmFwKCk6IHZvaWQge1xuICAgIHRoaXMuX2VkaXRvci5zZXRTb2Z0V3JhcHBlZCh0cnVlKTtcbiAgfVxufTtcbiJdfQ==
//# sourceURL=/home/william/.atom/packages/git-time-machine/node_modules/split-diff/lib/build-lines.js
