'use babel';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

module.exports = (function () {
  function DiffViewEditor(editor) {
    _classCallCheck(this, DiffViewEditor);

    this._editor = editor;
    this._markers = [];
    this._currentSelection = null;
    this._oldPlaceholderText = editor.getPlaceholderText();
    editor.setPlaceholderText('Paste what you want to diff here!');
  }

  /**
   * Creates a decoration for an offset. Adds the marker to this._markers.
   *
   * @param lineNumber The line number to add the block decoration to.
   * @param numberOfLines The number of lines that the block decoration's height will be.
   * @param blockPosition Specifies whether to put the decoration before the line or after.
   */

  _createClass(DiffViewEditor, [{
    key: '_addOffsetDecoration',
    value: function _addOffsetDecoration(lineNumber, numberOfLines, blockPosition) {
      var element = document.createElement('div');
      element.className += 'split-diff-offset';
      // if no text, set height for blank lines
      element.style.minHeight = numberOfLines * this._editor.getLineHeightInPixels() + 'px';

      var marker = this._editor.markScreenPosition([lineNumber, 0], { invalidate: 'never', persistent: false });
      this._editor.decorateMarker(marker, { type: 'block', position: blockPosition, item: element });
      this._markers.push(marker);
    }

    /**
     * Adds offsets (blank lines) into the editor.
     *
     * @param lineOffsets An array of offsets (blank lines) to insert into this editor.
     */
  }, {
    key: 'setLineOffsets',
    value: function setLineOffsets(lineOffsets) {
      var offsetLineNumbers = Object.keys(lineOffsets).map(function (lineNumber) {
        return parseInt(lineNumber, 10);
      }).sort(function (x, y) {
        return x - y;
      });

      for (var offsetLineNumber of offsetLineNumbers) {
        if (offsetLineNumber == 0) {
          // add block decoration before if adding to line 0
          this._addOffsetDecoration(offsetLineNumber - 1, lineOffsets[offsetLineNumber], 'before');
        } else {
          // add block decoration after if adding to lines > 0
          this._addOffsetDecoration(offsetLineNumber - 1, lineOffsets[offsetLineNumber], 'after');
        }
      }
    }

    /**
     * Creates markers for line highlights. Adds them to this._markers. Should be
     * called before setLineOffsets since this initializes this._markers.
     *
     * @param changedLines An array of buffer line numbers that should be highlighted.
     * @param type The type of highlight to be applied to the line.
     */
  }, {
    key: 'setLineHighlights',
    value: function setLineHighlights(changedLines, highlightType) {
      if (changedLines === undefined) changedLines = [];

      var highlightClass = 'split-diff-' + highlightType;
      for (var i = 0; i < changedLines.length; i++) {
        this._markers.push(this._createLineMarker(changedLines[i][0], changedLines[i][1], highlightClass));
      }
    }

    /**
     * Creates a marker and decorates its line and line number.
     *
     * @param startLineNumber A buffer line number to start highlighting at.
     * @param endLineNumber A buffer line number to end highlighting at.
     * @param highlightClass The type of highlight to be applied to the line.
     *    Could be a value of: ['split-diff-insert', 'split-diff-delete',
     *    'split-diff-select'].
     * @return The created line marker.
     */
  }, {
    key: '_createLineMarker',
    value: function _createLineMarker(startLineNumber, endLineNumber, highlightClass) {
      var marker = this._editor.markBufferRange([[startLineNumber, 0], [endLineNumber, 0]], { invalidate: 'never', persistent: false, 'class': highlightClass });

      this._editor.decorateMarker(marker, { type: 'line-number', 'class': highlightClass });
      this._editor.decorateMarker(marker, { type: 'line', 'class': highlightClass });

      return marker;
    }

    /**
     * Highlights words in a given line.
     *
     * @param lineNumber The line number to highlight words on.
     * @param wordDiff An array of objects which look like...
     *    added: boolean (not used)
     *    count: number (not used)
     *    removed: boolean (not used)
     *    value: string
     *    changed: boolean
     * @param type The type of highlight to be applied to the words.
     */
  }, {
    key: 'setWordHighlights',
    value: function setWordHighlights(lineNumber, wordDiff, type, isWhitespaceIgnored) {
      if (wordDiff === undefined) wordDiff = [];

      var klass = 'split-diff-word-' + type;
      var count = 0;

      for (var i = 0; i < wordDiff.length; i++) {
        // if there was a change
        // AND one of these is true:
        // if the string is not spaces, highlight
        // OR
        // if the string is spaces and whitespace not ignored, highlight
        if (wordDiff[i].changed && (/\S/.test(wordDiff[i].value) || !/\S/.test(wordDiff[i].value) && !isWhitespaceIgnored)) {
          var marker = this._editor.markBufferRange([[lineNumber, count], [lineNumber, count + wordDiff[i].value.length]], { invalidate: 'never', persistent: false, 'class': klass });

          this._editor.decorateMarker(marker, { type: 'highlight', 'class': klass });
          this._markers.push(marker);
        }
        count += wordDiff[i].value.length;
      }
    }

    /**
     * Scrolls the editor to a line.
     *
     * @param lineNumber The line number to scroll to.
     */
  }, {
    key: 'scrollToLine',
    value: function scrollToLine(lineNumber) {
      this._editor.scrollToBufferPosition([lineNumber, 0]);
    }

    /**
     * Destroys all markers added to this editor by split-diff.
     */
  }, {
    key: 'destroyMarkers',
    value: function destroyMarkers() {
      for (var i = 0; i < this._markers.length; i++) {
        this._markers[i].destroy();
      }
      this._markers = [];

      this.deselectAllLines();
      this._editor.setPlaceholderText(this._oldPlaceholderText);
    }

    /**
     * Not added to this._markers because we want it to persist between updates.
     *
     * @param startLine The line number that the selection starts at.
     * @param endLine The line number that the selection ends at (non-inclusive).
     */
  }, {
    key: 'selectLines',
    value: function selectLines(startLine, endLine) {
      this._currentSelection = this._createLineMarker(startLine, endLine, 'split-diff-selected');
    }

    /**
     * Destroy the selection markers.
     */
  }, {
    key: 'deselectAllLines',
    value: function deselectAllLines() {
      if (this._currentSelection) {
        this._currentSelection.destroy();
        this._currentSelection = null;
      }
    }

    /**
     * Enable soft wrap for this editor.
     */
  }, {
    key: 'enableSoftWrap',
    value: function enableSoftWrap() {
      try {
        this._editor.setSoftWrapped(true);
      } catch (e) {
        //console.log('Soft wrap was enabled on a text editor that does not exist.');
      }
    }

    /**
     * Get the text for the line.
     *
     * @param lineNumber The line number to get the text from.
     * @return The text from the specified line.
     */
  }, {
    key: 'getLineText',
    value: function getLineText(lineNumber) {
      return this._editor.lineTextForBufferRow(lineNumber);
    }

    /**
     *
     */
  }, {
    key: 'cleanUp',
    value: function cleanUp() {
      this._editor.setText('');
      this._editor.destroy();
    }
  }]);

  return DiffViewEditor;
})();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3dpbGxpYW0vLmF0b20vcGFja2FnZXMvZ2l0LXRpbWUtbWFjaGluZS9ub2RlX21vZHVsZXMvc3BsaXQtZGlmZi9saWIvYnVpbGQtbGluZXMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsV0FBVyxDQUFBOzs7Ozs7QUFFWCxNQUFNLENBQUMsT0FBTztBQUtELFdBTFUsY0FBYyxDQUt2QixNQUFNLEVBQUU7MEJBTEMsY0FBYzs7QUFNakMsUUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7QUFDdEIsUUFBSSxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUM7QUFDbkIsUUFBSSxDQUFDLGlCQUFpQixHQUFHLElBQUksQ0FBQztBQUM5QixRQUFJLENBQUMsbUJBQW1CLEdBQUcsTUFBTSxDQUFDLGtCQUFrQixFQUFFLENBQUM7QUFDdkQsVUFBTSxDQUFDLGtCQUFrQixDQUFDLG1DQUFtQyxDQUFDLENBQUM7R0FDaEU7Ozs7Ozs7Ozs7ZUFYb0IsY0FBYzs7V0FvQmYsOEJBQUMsVUFBVSxFQUFFLGFBQWEsRUFBRSxhQUFhLEVBQVE7QUFDbkUsVUFBSSxPQUFPLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUM1QyxhQUFPLENBQUMsU0FBUyxJQUFJLG1CQUFtQixDQUFDOztBQUV6QyxhQUFPLENBQUMsS0FBSyxDQUFDLFNBQVMsR0FBRyxBQUFDLGFBQWEsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLHFCQUFxQixFQUFFLEdBQUksSUFBSSxDQUFDOztBQUV4RixVQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLGtCQUFrQixDQUFDLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUMsVUFBVSxFQUFFLE9BQU8sRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFDLENBQUMsQ0FBQztBQUN4RyxVQUFJLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUUsRUFBQyxJQUFJLEVBQUUsT0FBTyxF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Qzs7QUFFbkIsVUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7QUFDeEIsVUFBSSxDQUFDLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQztLQUMzRDs7Ozs7Ozs7OztXQVFVLHFCQUFDLFNBQWlCLEVBQUUsT0FBZSxFQUFRO0FBQ3BELFVBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsU0FBUyxFQUFFLE9BQU8sRUFBRSxxQkFBcUIsQ0FBQyxDQUFDO0tBQzVGOzs7Ozs7O1dBS2UsNEJBQVM7QUFDdkIsVUFBSSxJQUFJLENBQUMsaUJBQWlCLEVBQUU7QUFDMUIsWUFBSSxDQUFDLGlCQUFpQixDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ2pDLFlBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLENBQUM7T0FDL0I7S0FDRjs7Ozs7OztXQUthLDBCQUFTO0FBQ3JCLFVBQUk7QUFDRixZQUFJLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQztPQUNuQyxDQUFDLE9BQU8sQ0FBQyxFQUFFOztPQUVYO0tBQ0Y7Ozs7Ozs7Ozs7V0FRVSxxQkFBQyxVQUFtQixFQUFVO0FBQ3ZDLGFBQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxvQkFBb0IsQ0FBQyxVQUFVLENBQUMsQ0FBQztLQUN0RDs7Ozs7OztXQUtNLG1CQUFTO0FBQ2QsVUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDekIsVUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUN4Qjs7O1NBMUxvQixjQUFjO0lBMkxwQyxDQUFDIiwiZmlsZSI6Ii9ob21lL3dpbGxpYW0vLmF0b20vcGFja2FnZXMvZ2l0LXRpbWUtbWFjaGluZS9ub2RlX21vZHVsZXMvc3BsaXQtZGlmZi9saWIvYnVpbGQtbGluZXMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIERpZmZWaWV3RWRpdG9yIHtcbiAgX2VkaXRvcjogT2JqZWN0O1xuICBfbWFya2VyczogQXJyYXk8YXRvbSRNYXJrZXI+O1xuICBfY3VycmVudFNlbGVjdGlvbjogQXJyYXk8YXRvbSRNYXJrZXI+O1xuXG4gIGNvbnN0cnVjdG9yKGVkaXRvcikge1xuICAgIHRoaXMuX2VkaXRvciA9IGVkaXRvcjtcbiAgICB0aGlzLl9tYXJrZXJzID0gW107XG4gICAgdGhpcy5fY3VycmVudFNlbGVjdGlvbiA9IG51bGw7XG4gICAgdGhpcy5fb2xkUGxhY2Vob2xkZXJUZXh0ID0gZWRpdG9yLmdldFBsYWNlaG9sZGVyVGV4dCgpO1xuICAgIGVkaXRvci5zZXRQbGFjZWhvbGRlclRleHQoJ1Bhc3RlIHdoYXQgeW91IHdhbnQgdG8gZGlmZiBoZXJlIScpO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBkZWNvcmF0aW9uIGZvciBhbiBvZmZzZXQuIEFkZHMgdGhlIG1hcmtlciB0byB0aGlzLl9tYXJrZXJzLlxuICAgKlxuICAgKiBAcGFyYW0gbGluZU51bWJlciBUaGUgbGluZSBudW1iZXIgdG8gYWRkIHRoZSBibG9jayBkZWNvcmF0aW9uIHRvLlxuICAgKiBAcGFyYW0gbnVtYmVyT2ZMaW5lcyBUaGUgbnVtYmVyIG9mIGxpbmVzIHRoYXQgdGhlIGJsb2NrIGRlY29yYXRpb24ncyBoZWlnaHQgd2lsbCBiZS5cbiAgICogQHBhcmFtIGJsb2NrUG9zaXRpb24gU3BlY2lmaWVzIHdoZXRoZXIgdG8gcHV0IHRoZSBkZWNvcmF0aW9uIGJlZm9yZSB0aGUgbGluZSBvciBhZnRlci5cbiAgICovXG4gIF9hZGRPZmZzZXREZWNvcmF0aW9uKGxpbmVOdW1iZXIsIG51bWJlck9mTGluZXMsIGJsb2NrUG9zaXRpb24pOiB2b2lkIHtcbiAgICB2YXIgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGVsZW1lbnQuY2xhc3NOYW1lICs9ICdzcGxpdC1kaWZmLW9mZnNldCc7XG4gICAgLy8gaWYgbm8gdGV4dCwgc2V0IGhlaWdodCBmb3IgYmxhbmsgbGluZXNcbiAgICBlbGVtZW50LnN0eWxlLm1pbkhlaWdodCA9IChudW1iZXJPZkxpbmVzICogdGhpcy5fZWRpdG9yLmdldExpbmVIZWlnaHRJblBpeGVscygpKSArICdweCc7XG5cbiAgICB2YXIgbWFya2VyID0gdGhpcy5fZWRpdG9yLm1hcmtTY3JlZW5Qb3NpdGlvbihbbGluZU51bWJlciwgMF0sIHtpbnZhbGlkYXRlOiAnbmV2ZXInLCBwZXJzaXN0ZW50OiBmYWxzZX0pO1xuICAgIHRoaXMuX2VkaXRvci5kZWNvcmF0ZU1hcmtlcihtYXJrZXIsIHt0eXBlOiAnYmxvY2snLCBwb3NpdGlvbjogYmxvY2tQb3NpdGlvbiwgaXRlbTogZWxlbWVudH0pO1xuICAgIHRoaXMuX21hcmtlcnMucHVzaChtYXJrZXIpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgb2Zmc2V0cyAoYmxhbmsgbGluZXMpIGludG8gdGhlIGVkaXRvci5cbiAgICpcbiAgICogQHBhcmFtIGxpbmVPZmZzZXRzIEFuIGFycmF5IG9mIG9mZnNldHMgKGJsYW5rIGxpbmVzKSB0byBpbnNlcnQgaW50byB0aGlzIGVkaXRvci5cbiAgICovXG4gIHNldExpbmVPZmZzZXRzKGxpbmVPZmZzZXRzOiBhbnkpOiB2b2lkIHtcbiAgICB2YXIgb2Zmc2V0TGluZU51bWJlcnMgPSBPYmplY3Qua2V5cyhsaW5lT2Zmc2V0cykubWFwKGxpbmVOdW1iZXIgPT4gcGFyc2VJbnQobGluZU51bWJlciwgMTApKS5zb3J0KCh4LCB5KSA9PiB4IC0geSk7XG5cbiAgICBmb3IgKHZhciBvZmZzZXRMaW5lTnVtYmVyIG9mIG9mZnNldExpbmVOdW1iZXJzKSB7XG4gICAgICBpZiAob2Zmc2V0TGluZU51bWJlciA9PSAwKSB7XG4gICAgICAgIC8vIGFkZCBibG9jayBkZWNvcmF0aW9uIGJlZm9yZSBpZiBhZGRpbmcgdG8gbGluZSAwXG4gICAgICAgIHRoaXMuX2FkZE9mZnNldERlY29yYXRpb24ob2Zmc2V0TGluZU51bWJlci0xLCBsaW5lT2Zmc2V0c1tvZmZzZXRMaW5lTnVtYmVyXSwgJ2JlZm9yZScpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gYWRkIGJsb2NrIGRlY29yYXRpb24gYWZ0ZXIgaWYgYWRkaW5nIHRvIGxpbmVzID4gMFxuICAgICAgICB0aGlzLl9hZGRPZmZzZXREZWNvcmF0aW9uKG9mZnNldExpbmVOdW1iZXItMSwgbGluZU9mZnNldHNbb2Zmc2V0TGluZU51bWJlcl0sICdhZnRlcicpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIG1hcmtlcnMgZm9yIGxpbmUgaGlnaGxpZ2h0cy4gQWRkcyB0aGVtIHRvIHRoaXMuX21hcmtlcnMuIFNob3VsZCBiZVxuICAgKiBjYWxsZWQgYmVmb3JlIHNldExpbmVPZmZzZXRzIHNpbmNlIHRoaXMgaW5pdGlhbGl6ZXMgdGhpcy5fbWFya2Vycy5cbiAgICpcbiAgICogQHBhcmFtIGNoYW5nZWRMaW5lcyBBbiBhcnJheSBvZiBidWZmZXIgbGluZSBudW1iZXJzIHRoYXQgc2hvdWxkIGJlIGhpZ2hsaWdodGVkLlxuICAgKiBAcGFyYW0gdHlwZSBUaGUgdHlwZSBvZiBoaWdobGlnaHQgdG8gYmUgYXBwbGllZCB0byB0aGUgbGluZS5cbiAgICovXG4gIHNldExpbmVIaWdobGlnaHRzKGNoYW5nZWRMaW5lczogQXJyYXk8bnVtYmVyPiA9IFtdLCBoaWdobGlnaHRUeXBlOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB2YXIgaGlnaGxpZ2h0Q2xhc3MgPSAnc3BsaXQtZGlmZi0nICsgaGlnaGxpZ2h0VHlwZTtcbiAgICBmb3IgKHZhciBpPTA7IGk8Y2hhbmdlZExpbmVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB0aGlzLl9tYXJrZXJzLnB1c2godGhpcy5fY3JlYXRlTGluZU1hcmtlcihjaGFuZ2VkTGluZXNbaV1bMF0sIGNoYW5nZWRMaW5lc1tpXVsxXSwgaGlnaGxpZ2h0Q2xhc3MpKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhIG1hcmtlciBhbmQgZGVjb3JhdGVzIGl0cyBsaW5lIGFuZCBsaW5lIG51bWJlci5cbiAgICpcbiAgICogQHBhcmFtIHN0YXJ0TGluZU51bWJlciBBIGJ1ZmZlciBsaW5lIG51bWJlciB0byBzdGFydCBoaWdobGlnaHRpbmcgYXQuXG4gICAqIEBwYXJhbSBlbmRMaW5lTnVtYmVyIEEgYnVmZmVyIGxpbmUgbnVtYmVyIHRvIGVuZCBoaWdobGlnaHRpbmcgYXQuXG4gICAqIEBwYXJhbSBoaWdobGlnaHRDbGFzcyBUaGUgdHlwZSBvZiBoaWdobGlnaHQgdG8gYmUgYXBwbGllZCB0byB0aGUgbGluZS5cbiAgICogICAgQ291bGQgYmUgYSB2YWx1ZSBvZjogWydzcGxpdC1kaWZmLWluc2VydCcsICdzcGxpdC1kaWZmLWRlbGV0ZScsXG4gICAqICAgICdzcGxpdC1kaWZmLXNlbGVjdCddLlxuICAgKiBAcmV0dXJuIFRoZSBjcmVhdGVkIGxpbmUgbWFya2VyLlxuICAgKi9cbiAgX2NyZWF0ZUxpbmVNYXJrZXIoc3RhcnRMaW5lTnVtYmVyOiBudW1iZXIsIGVuZExpbmVOdW1iZXI6IG51bWJlciwgaGlnaGxpZ2h0Q2xhc3M6IHN0cmluZyk6IGF0b20kTWFya2VyIHtcbiAgICB2YXIgbWFya2VyID0gdGhpcy5fZWRpdG9yLm1hcmtCdWZmZXJSYW5nZShbW3N0YXJ0TGluZU51bWJlciwgMF0sIFtlbmRMaW5lTnVtYmVyLCAwXV0sIHtpbnZhbGlkYXRlOiAnbmV2ZXInLCBwZXJzaXN0ZW50OiBmYWxzZSwgY2xhc3M6IGhpZ2hsaWdodENsYXNzfSlcblxuICAgIHRoaXMuX2VkaXRvci5kZWNvcmF0ZU1hcmtlcihtYXJrZXIsIHt0eXBlOiAnbGluZS1udW1iZXInLCBjbGFzczogaGlnaGxpZ2h0Q2xhc3N9KTtcbiAgICB0aGlzLl9lZGl0b3IuZGVjb3JhdGVNYXJrZXIobWFya2VyLCB7dHlwZTogJ2xpbmUnLCBjbGFzczogaGlnaGxpZ2h0Q2xhc3N9KTtcblxuICAgIHJldHVybiBtYXJrZXI7XG4gIH1cblxuICAvKipcbiAgICogSGlnaGxpZ2h0cyB3b3JkcyBpbiBhIGdpdmVuIGxpbmUuXG4gICAqXG4gICAqIEBwYXJhbSBsaW5lTnVtYmVyIFRoZSBsaW5lIG51bWJlciB0byBoaWdobGlnaHQgd29yZHMgb24uXG4gICAqIEBwYXJhbSB3b3JkRGlmZiBBbiBhcnJheSBvZiBvYmplY3RzIHdoaWNoIGxvb2sgbGlrZS4uLlxuICAgKiAgICBhZGRlZDogYm9vbGVhbiAobm90IHVzZWQpXG4gICAqICAgIGNvdW50OiBudW1iZXIgKG5vdCB1c2VkKVxuICAgKiAgICByZW1vdmVkOiBib29sZWFuIChub3QgdXNlZClcbiAgICogICAgdmFsdWU6IHN0cmluZ1xuICAgKiAgICBjaGFuZ2VkOiBib29sZWFuXG4gICAqIEBwYXJhbSB0eXBlIFRoZSB0eXBlIG9mIGhpZ2hsaWdodCB0byBiZSBhcHBsaWVkIHRvIHRoZSB3b3Jkcy5cbiAgICovXG4gIHNldFdvcmRIaWdobGlnaHRzKGxpbmVOdW1iZXI6IG51bWJlciwgd29yZERpZmY6IEFycmF5PGFueT4gPSBbXSwgdHlwZTogc3RyaW5nLCBpc1doaXRlc3BhY2VJZ25vcmVkOiBib29sZWFuKTogdm9pZCB7XG4gICAgdmFyIGtsYXNzID0gJ3NwbGl0LWRpZmYtd29yZC0nICsgdHlwZTtcbiAgICB2YXIgY291bnQgPSAwO1xuXG4gICAgZm9yICh2YXIgaT0wOyBpPHdvcmREaWZmLmxlbmd0aDsgaSsrKSB7XG4gICAgICAvLyBpZiB0aGVyZSB3YXMgYSBjaGFuZ2VcbiAgICAgIC8vIEFORCBvbmUgb2YgdGhlc2UgaXMgdHJ1ZTpcbiAgICAgIC8vIGlmIHRoZSBzdHJpbmcgaXMgbm90IHNwYWNlcywgaGlnaGxpZ2h0XG4gICAgICAvLyBPUlxuICAgICAgLy8gaWYgdGhlIHN0cmluZyBpcyBzcGFjZXMgYW5kIHdoaXRlc3BhY2Ugbm90IGlnbm9yZWQsIGhpZ2hsaWdodFxuICAgICAgaWYgKHdvcmREaWZmW2ldLmNoYW5nZWRcbiAgICAgICAgJiYgKC9cXFMvLnRlc3Qod29yZERpZmZbaV0udmFsdWUpXG4gICAgICAgIHx8ICghL1xcUy8udGVzdCh3b3JkRGlmZltpXS52YWx1ZSkgJiYgIWlzV2hpdGVzcGFjZUlnbm9yZWQpKSkge1xuICAgICAgICB2YXIgbWFya2VyID0gdGhpcy5fZWRpdG9yLm1hcmtCdWZmZXJSYW5nZShbW2xpbmVOdW1iZXIsIGNvdW50XSwgW2xpbmVOdW1iZXIsIChjb3VudCArIHdvcmREaWZmW2ldLnZhbHVlLmxlbmd0aCldXSwge2ludmFsaWRhdGU6ICduZXZlcicsIHBlcnNpc3RlbnQ6IGZhbHNlLCBjbGFzczoga2xhc3N9KVxuXG4gICAgICAgIHRoaXMuX2VkaXRvci5kZWNvcmF0ZU1hcmtlcihtYXJrZXIsIHt0eXBlOiAnaGlnaGxpZ2h0JywgY2xhc3M6IGtsYXNzfSk7XG4gICAgICAgIHRoaXMuX21hcmtlcnMucHVzaChtYXJrZXIpO1xuICAgICAgfVxuICAgICAgY291bnQgKz0gd29yZERpZmZbaV0udmFsdWUubGVuZ3RoO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTY3JvbGxzIHRoZSBlZGl0b3IgdG8gYSBsaW5lLlxuICAgKlxuICAgKiBAcGFyYW0gbGluZU51bWJlciBUaGUgbGluZSBudW1iZXIgdG8gc2Nyb2xsIHRvLlxuICAgKi9cbiAgc2Nyb2xsVG9MaW5lKGxpbmVOdW1iZXI6IG51bWJlcik6IHZvaWQge1xuICAgIHRoaXMuX2VkaXRvci5zY3JvbGxUb0J1ZmZlclBvc2l0aW9uKFtsaW5lTnVtYmVyLCAwXSk7XG4gIH1cblxuICAvKipcbiAgICogRGVzdHJveXMgYWxsIG1hcmtlcnMgYWRkZWQgdG8gdGhpcyBlZGl0b3IgYnkgc3BsaXQtZGlmZi5cbiAgICovXG4gIGRlc3Ryb3lNYXJrZXJzKCk6IHZvaWQge1xuICAgIGZvciAodmFyIGk9MDsgaTx0aGlzLl9tYXJrZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB0aGlzLl9tYXJrZXJzW2ldLmRlc3Ryb3koKTtcbiAgICB9XG4gICAgdGhpcy5fbWFya2VycyA9IFtdO1xuXG4gICAgdGhpcy5kZXNlbGVjdEFsbExpbmVzKCk7XG4gICAgdGhpcy5fZWRpdG9yLnNldFBsYWNlaG9sZGVyVGV4dCh0aGlzLl9vbGRQbGFjZWhvbGRlclRleHQpO1xuICB9XG5cbiAgLyoqXG4gICAqIE5vdCBhZGRlZCB0byB0aGlzLl9tYXJrZXJzIGJlY2F1c2Ugd2Ugd2FudCBpdCB0byBwZXJzaXN0IGJldHdlZW4gdXBkYXRlcy5cbiAgICpcbiAgICogQHBhcmFtIHN0YXJ0TGluZSBUaGUgbGluZSBudW1iZXIgdGhhdCB0aGUgc2VsZWN0aW9uIHN0YXJ0cyBhdC5cbiAgICogQHBhcmFtIGVuZExpbmUgVGhlIGxpbmUgbnVtYmVyIHRoYXQgdGhlIHNlbGVjdGlvbiBlbmRzIGF0IChub24taW5jbHVzaXZlKS5cbiAgICovXG4gIHNlbGVjdExpbmVzKHN0YXJ0TGluZTogbnVtYmVyLCBlbmRMaW5lOiBudW1iZXIpOiB2b2lkIHtcbiAgICB0aGlzLl9jdXJyZW50U2VsZWN0aW9uID0gdGhpcy5fY3JlYXRlTGluZU1hcmtlcihzdGFydExpbmUsIGVuZExpbmUsICdzcGxpdC1kaWZmLXNlbGVjdGVkJyk7XG4gIH1cblxuICAvKipcbiAgICogRGVzdHJveSB0aGUgc2VsZWN0aW9uIG1hcmtlcnMuXG4gICAqL1xuICBkZXNlbGVjdEFsbExpbmVzKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9jdXJyZW50U2VsZWN0aW9uKSB7XG4gICAgICB0aGlzLl9jdXJyZW50U2VsZWN0aW9uLmRlc3Ryb3koKTtcbiAgICAgIHRoaXMuX2N1cnJlbnRTZWxlY3Rpb24gPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBFbmFibGUgc29mdCB3cmFwIGZvciB0aGlzIGVkaXRvci5cbiAgICovXG4gIGVuYWJsZVNvZnRXcmFwKCk6IHZvaWQge1xuICAgIHRyeSB7XG4gICAgICB0aGlzLl9lZGl0b3Iuc2V0U29mdFdyYXBwZWQodHJ1ZSk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgLy9jb25zb2xlLmxvZygnU29mdCB3cmFwIHdhcyBlbmFibGVkIG9uIGEgdGV4dCBlZGl0b3IgdGhhdCBkb2VzIG5vdCBleGlzdC4nKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSB0ZXh0IGZvciB0aGUgbGluZS5cbiAgICpcbiAgICogQHBhcmFtIGxpbmVOdW1iZXIgVGhlIGxpbmUgbnVtYmVyIHRvIGdldCB0aGUgdGV4dCBmcm9tLlxuICAgKiBAcmV0dXJuIFRoZSB0ZXh0IGZyb20gdGhlIHNwZWNpZmllZCBsaW5lLlxuICAgKi9cbiAgZ2V0TGluZVRleHQobGluZU51bWJlciA6IG51bWJlcik6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX2VkaXRvci5saW5lVGV4dEZvckJ1ZmZlclJvdyhsaW5lTnVtYmVyKTtcbiAgfVxuXG4gIC8qKlxuICAgKlxuICAgKi9cbiAgY2xlYW5VcCgpOiB2b2lkIHtcbiAgICB0aGlzLl9lZGl0b3Iuc2V0VGV4dCgnJyk7XG4gICAgdGhpcy5fZWRpdG9yLmRlc3Ryb3koKTtcbiAgfVxufTtcbiJdfQ==
//# sourceURL=/home/william/.atom/packages/git-time-machine/node_modules/split-diff/lib/build-lines.js
