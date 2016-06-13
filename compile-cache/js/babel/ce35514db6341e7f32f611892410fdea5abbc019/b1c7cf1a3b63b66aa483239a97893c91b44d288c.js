'use babel';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

module.exports = (function () {
  function DiffViewEditor(editor) {
    _classCallCheck(this, DiffViewEditor);

    this._editor = editor;
    this._markers = [];
    this._currentSelection = [];
  }

  /**
   * Creates a decoration for an offset. Adds the marker to this._markers.
   *
   * @param lineNumber The line number to add the block decoration to.
   * @param numberOfLines The number of lines that the block decoration's height will be.
   * @param blockPosition Specifies whether to put the decoration before the line or after.
   * @param pasteText The help text to display when the editor is empty.
   */

  _createClass(DiffViewEditor, [{
    key: '_addOffsetDecoration',
    value: function _addOffsetDecoration(lineNumber, numberOfLines, blockPosition, pasteText) {
      var element = document.createElement('div');
      element.className += 'split-diff-offset';
      if (pasteText != '') {
        // if there is text, set element to height of text
        element.textContent = pasteText;
      } else {
        // if no text, set height for blank lines
        element.style.minHeight = numberOfLines * this._editor.getLineHeightInPixels() + 'px';
      }

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
      // if there is nothing in the editor, add text to decoration
      var pasteText = '';
      if (this.isEditorEmpty()) {
        pasteText = 'Paste what you want to diff here!';

        // if the editor was empty and no offsets then just add paste text
        // this is true when both editors are empty
        // if only one editor is empty, then the paste text will be added in the for loop
        if (offsetLineNumbers.length == 0) {
          this._addOffsetDecoration(0, 1, 'before', pasteText);
          return;
        }
      }

      for (var offsetLineNumber of offsetLineNumbers) {
        if (offsetLineNumber == 0) {
          // add block decoration before if adding to line 0
          this._addOffsetDecoration(offsetLineNumber, lineOffsets[offsetLineNumber], 'before', pasteText);
        } else {
          // add block decoration after if adding to lines > 0
          this._addOffsetDecoration(offsetLineNumber - 1, lineOffsets[offsetLineNumber], 'after', pasteText);
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
    value: function setLineHighlights(changedLines, type) {
      var _this = this;

      if (changedLines === undefined) changedLines = [];

      this._markers = changedLines.map(function (lineNumber) {
        return _this._createLineMarker(lineNumber, type);
      });
    }

    /**
     * Creates a marker and decorates its line and line number.
     *
     * @param lineNumber A buffer line number to be highlighted.
     * @param type The type of highlight to be applied to the line.
     *    Could be a value of: ['insert', 'delete'].
     * @return The newly created marker.
     */
  }, {
    key: '_createLineMarker',
    value: function _createLineMarker(lineNumber, type) {
      var klass = 'split-diff-' + type;
      var marker = this._editor.markBufferRange([[lineNumber, 0], [lineNumber, 0]], { invalidate: 'never', persistent: false, 'class': klass });

      this._editor.decorateMarker(marker, { type: 'line-number', 'class': klass });
      this._editor.decorateMarker(marker, { type: 'line', 'class': klass });

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
      for (var i = startLine; i < endLine; i++) {
        this._currentSelection.push(this._createLineMarker(i, 'selected'));
      }
    }

    /**
     * Destroy the selection markers.
     */
  }, {
    key: 'deselectAllLines',
    value: function deselectAllLines() {
      for (var i = 0; i < this._currentSelection.length; i++) {
        this._currentSelection[i].destroy();
      }
      this._currentSelection = [];
    }

    /**
     * Enable soft wrap for this editor.
     */
  }, {
    key: 'enableSoftWrap',
    value: function enableSoftWrap() {
      this._editor.setSoftWrapped(true);
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
     * Checks if the editor contains no text.
     *
     * @return True if the editor is empty.
     */
  }, {
    key: 'isEditorEmpty',
    value: function isEditorEmpty() {
      return this._editor.getLineCount() == 1 && this._editor.lineTextForBufferRow(0) == '';
    }
  }]);

  return DiffViewEditor;
})();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3dpbGxpYW0vLmF0b20vcGFja2FnZXMvZ2l0LXRpbWUtbWFjaGluZS9ub2RlX21vZHVsZXMvc3BsaXQtZGlmZi9saWIvYnVpbGQtbGluZXMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsV0FBVyxDQUFBOzs7Ozs7QUFFWCxNQUFNLENBQUMsT0FBTztBQUtELFdBTFUsY0FBYyxDQUt2QixNQUFNLEVBQUU7MEJBTEMsY0FBYzs7QUFNakMsUUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7QUFDdEIsUUFBSSxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUM7QUFDbkIsUUFBSSxDQUFDLGlCQUFpQixHQUFHLEVBQUUsQ0FBQztHQUM3Qjs7Ozs7Ozs7Ozs7ZUFUb0IsY0FBYzs7V0FtQmYsOEJBQUMsVUFBVSxFQUFFLGFBQWEsRUFBRSxhQUFhLEVBQUUsU0FBUyxFQUFRO0FBQzlFLFVBQUksT0FBTyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDNUMsYUFBTyxDQUFDLFNBQVMsSUFBSSxtQkFBbUIsQ0FBQztBQUN6QyxVQUFHLFNBQVMsSUFBSSxFQUFFLEVBQUU7O0FBRWxCLGVBQU8sQ0FBQyxXQUFXLEdBQUcsU0FBUyxDQUFDO09BQ2pDLE1BQU07O0FBRUwsZUFBTyxDQUFDLEtBQUssQ0FBQyxTQUFTLEdBQUcsQUFBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxxQkFBcUIsRUFBRSxHQUFJLElBQUksQ0FBQztPQUN6Rjs7QUFFRCxVQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLGtCQUFrQixDQUFDLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUMsVUFBVSxFQUFFLE9BQU8sRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFDLENBQUMsQ0FBQztBQUN4RyxVQUFJLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUUsRUFBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLFFB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QUMiLCJmaWxlIjoiL2hvbWUvd2lsbGlhbS8uYXRvbS9wYWNrYWdlcy9naXQtdGltZS1tYWNoaW5lL25vZGVfbW9kdWxlcy9zcGxpdC1kaWZmL2xpYi9idWlsZC1saW5lcy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnXG5cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgRGlmZlZpZXdFZGl0b3Ige1xuICBfZWRpdG9yOiBPYmplY3Q7XG4gIF9tYXJrZXJzOiBBcnJheTxhdG9tJE1hcmtlcj47XG4gIF9jdXJyZW50U2VsZWN0aW9uOiBBcnJheTxhdG9tJE1hcmtlcj47XG5cbiAgY29uc3RydWN0b3IoZWRpdG9yKSB7XG4gICAgdGhpcy5fZWRpdG9yID0gZWRpdG9yO1xuICAgIHRoaXMuX21hcmtlcnMgPSBbXTtcbiAgICB0aGlzLl9jdXJyZW50U2VsZWN0aW9uID0gW107XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhIGRlY29yYXRpb24gZm9yIGFuIG9mZnNldC4gQWRkcyB0aGUgbWFya2VyIHRvIHRoaXMuX21hcmtlcnMuXG4gICAqXG4gICAqIEBwYXJhbSBsaW5lTnVtYmVyIFRoZSBsaW5lIG51bWJlciB0byBhZGQgdGhlIGJsb2NrIGRlY29yYXRpb24gdG8uXG4gICAqIEBwYXJhbSBudW1iZXJPZkxpbmVzIFRoZSBudW1iZXIgb2YgbGluZXMgdGhhdCB0aGUgYmxvY2sgZGVjb3JhdGlvbidzIGhlaWdodCB3aWxsIGJlLlxuICAgKiBAcGFyYW0gYmxvY2tQb3NpdGlvbiBTcGVjaWZpZXMgd2hldGhlciB0byBwdXQgdGhlIGRlY29yYXRpb24gYmVmb3JlIHRoZSBsaW5lIG9yIGFmdGVyLlxuICAgKiBAcGFyYW0gcGFzdGVUZXh0IFRoZSBoZWxwIHRleHQgdG8gZGlzcGxheSB3aGVuIHRoZSBlZGl0b3IgaXMgZW1wdHkuXG4gICAqL1xuICBfYWRkT2Zmc2V0RGVjb3JhdGlvbihsaW5lTnVtYmVyLCBudW1iZXJPZkxpbmVzLCBibG9ja1Bvc2l0aW9uLCBwYXN0ZVRleHQpOiB2b2lkIHtcbiAgICB2YXIgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGVsZW1lbnQuY2xhc3NOYW1lICs9ICdzcGxpdC1kaWZmLW9mZnNldCc7XG4gICAgaWYocGFzdGVUZXh0ICE9ICcnKSB7XG4gICAgICAvLyBpZiB0aGVyZSBpcyB0ZXh0LCBzZXQgZWxlbWVudCB0byBoZWlnaHQgb2YgdGV4dFxuICAgICAgZWxlbWVudC50ZXh0Q29udGVudCA9IHBhc3RlVGV4dDtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gaWYgbm8gdGV4dCwgc2V0IGhlaWdodCBmb3IgYmxhbmsgbGluZXNcbiAgICAgIGVsZW1lbnQuc3R5bGUubWluSGVpZ2h0ID0gKG51bWJlck9mTGluZXMgKiB0aGlzLl9lZGl0b3IuZ2V0TGluZUhlaWdodEluUGl4ZWxzKCkpICsgJ3B4JztcbiAgICB9XG5cbiAgICB2YXIgbWFya2VyID0gdGhpcy5fZWRpdG9yLm1hcmtTY3JlZW5Qb3NpdGlvbihbbGluZU51bWJlciwgMF0sIHtpbnZhbGlkYXRlOiAnbmV2ZXInLCBwZXJzaXN0ZW50OiBmYWxzZX0pO1xuICAgIHRoaXMuX2VkaXRvci5kZWNvcmF0ZU1hcmtlcihtYXJrZXIsIHt0eXBlOiAnYmxvY2snLCBwb3NpdGlvbjogYmxvY2tQb3NpdGlvbiwgaXRlbTogZWxlbWVudH0pO1xuICAgIHRoaXMuX21hcmtlcnMucHVzaChtYXJrZXIpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgb2Zmc2V0cyAoYmxhbmsgbGluZXMpIGludG8gdGhlIGVkaXRvci5cbiAgICpcbiAgICogQHBhcmFtIGxpbmVPZmZzZXRzIEFuIGFycmF5IG9mIG9mZnNldHMgKGJsYW5rIGxpbmVzKSB0byBpbnNlcnQgaW50byB0aGlzIGVkaXRvci5cbiAgICovXG4gIHNldExpbmVPZmZzZXRzKGxpbmVPZmZzZXRzOiBhbnkpOiB2b2lkIHtcbiAgICB2YXIgb2Zmc2V0TGluZU51bWJlcnMgPSBPYmplY3Qua2V5cyhsaW5lT2Zmc2V0cykubWFwKGxpbmVOdW1iZXIgPT4gcGFyc2VJbnQobGluZU51bWJlciwgMTApKS5zb3J0KCh4LCB5KSA9PiB4IC0geSk7XG4gICAgLy8gaWYgdGhlcmUgaXMgbm90aGluZyBpbiB0aGUgZWRpdG9yLCBhZGQgdGV4dCB0byBkZWNvcmF0aW9uXG4gICAgdmFyIHBhc3RlVGV4dCA9ICcnO1xuICAgIGlmKHRoaXMuaXNFZGl0b3JFbXB0eSgpKSB7XG4gICAgICBwYXN0ZVRleHQgPSAnUGFzdGUgd2hhdCB5b3Ugd2FudCB0byBkaWZmIGhlcmUhJztcblxuICAgICAgLy8gaWYgdGhlIGVkaXRvciB3YXMgZW1wdHkgYW5kIG5vIG9mZnNldHMgdGhlbiBqdXN0IGFkZCBwYXN0ZSB0ZXh0XG4gICAgICAvLyB0aGlzIGlzIHRydWUgd2hlbiBib3RoIGVkaXRvcnMgYXJlIGVtcHR5XG4gICAgICAvLyBpZiBvbmx5IG9uZSBlZGl0b3IgaXMgZW1wdHksIHRoZW4gdGhlIHBhc3RlIHRleHQgd2lsbCBiZSBhZGRlZCBpbiB0aGUgZm9yIGxvb3BcbiAgICAgIGlmKG9mZnNldExpbmVOdW1iZXJzLmxlbmd0aCA9PSAwKSB7XG4gICAgICAgIHRoaXMuX2FkZE9mZnNldERlY29yYXRpb24oMCwgMSwgJ2JlZm9yZScsIHBhc3RlVGV4dCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmb3IodmFyIG9mZnNldExpbmVOdW1iZXIgb2Ygb2Zmc2V0TGluZU51bWJlcnMpIHtcbiAgICAgIGlmKG9mZnNldExpbmVOdW1iZXIgPT0gMCkge1xuICAgICAgICAvLyBhZGQgYmxvY2sgZGVjb3JhdGlvbiBiZWZvcmUgaWYgYWRkaW5nIHRvIGxpbmUgMFxuICAgICAgICB0aGlzLl9hZGRPZmZzZXREZWNvcmF0aW9uKG9mZnNldExpbmVOdW1iZXIsIGxpbmVPZmZzZXRzW29mZnNldExpbmVOdW1iZXJdLCAnYmVmb3JlJywgcGFzdGVUZXh0KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIGFkZCBibG9jayBkZWNvcmF0aW9uIGFmdGVyIGlmIGFkZGluZyB0byBsaW5lcyA+IDBcbiAgICAgICAgdGhpcy5fYWRkT2Zmc2V0RGVjb3JhdGlvbihvZmZzZXRMaW5lTnVtYmVyLTEsIGxpbmVPZmZzZXRzW29mZnNldExpbmVOdW1iZXJdLCAnYWZ0ZXInLCBwYXN0ZVRleHQpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIG1hcmtlcnMgZm9yIGxpbmUgaGlnaGxpZ2h0cy4gQWRkcyB0aGVtIHRvIHRoaXMuX21hcmtlcnMuIFNob3VsZCBiZVxuICAgKiBjYWxsZWQgYmVmb3JlIHNldExpbmVPZmZzZXRzIHNpbmNlIHRoaXMgaW5pdGlhbGl6ZXMgdGhpcy5fbWFya2Vycy5cbiAgICpcbiAgICogQHBhcmFtIGNoYW5nZWRMaW5lcyBBbiBhcnJheSBvZiBidWZmZXIgbGluZSBudW1iZXJzIHRoYXQgc2hvdWxkIGJlIGhpZ2hsaWdodGVkLlxuICAgKiBAcGFyYW0gdHlwZSBUaGUgdHlwZSBvZiBoaWdobGlnaHQgdG8gYmUgYXBwbGllZCB0byB0aGUgbGluZS5cbiAgICovXG4gIHNldExpbmVIaWdobGlnaHRzKGNoYW5nZWRMaW5lczogQXJyYXk8bnVtYmVyPiA9IFtdLCB0eXBlOiBzdHJpbmcpIHtcbiAgICB0aGlzLl9tYXJrZXJzID0gY2hhbmdlZExpbmVzLm1hcChsaW5lTnVtYmVyID0+IHRoaXMuX2NyZWF0ZUxpbmVNYXJrZXIobGluZU51bWJlciwgdHlwZSkpO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBtYXJrZXIgYW5kIGRlY29yYXRlcyBpdHMgbGluZSBhbmQgbGluZSBudW1iZXIuXG4gICAqXG4gICAqIEBwYXJhbSBsaW5lTnVtYmVyIEEgYnVmZmVyIGxpbmUgbnVtYmVyIHRvIGJlIGhpZ2hsaWdodGVkLlxuICAgKiBAcGFyYW0gdHlwZSBUaGUgdHlwZSBvZiBoaWdobGlnaHQgdG8gYmUgYXBwbGllZCB0byB0aGUgbGluZS5cbiAgICogICAgQ291bGQgYmUgYSB2YWx1ZSBvZjogWydpbnNlcnQnLCAnZGVsZXRlJ10uXG4gICAqIEByZXR1cm4gVGhlIG5ld2x5IGNyZWF0ZWQgbWFya2VyLlxuICAgKi9cbiAgX2NyZWF0ZUxpbmVNYXJrZXIobGluZU51bWJlcjogbnVtYmVyLCB0eXBlOiBzdHJpbmcpOiBhdG9tJE1hcmtlciB7XG4gICAgdmFyIGtsYXNzID0gJ3NwbGl0LWRpZmYtJyArIHR5cGU7XG4gICAgdmFyIG1hcmtlciA9IHRoaXMuX2VkaXRvci5tYXJrQnVmZmVyUmFuZ2UoW1tsaW5lTnVtYmVyLCAwXSwgW2xpbmVOdW1iZXIsIDBdXSwge2ludmFsaWRhdGU6ICduZXZlcicsIHBlcnNpc3RlbnQ6IGZhbHNlLCBjbGFzczoga2xhc3N9KVxuXG4gICAgdGhpcy5fZWRpdG9yLmRlY29yYXRlTWFya2VyKG1hcmtlciwge3R5cGU6ICdsaW5lLW51bWJlcicsIGNsYXNzOiBrbGFzc30pO1xuICAgIHRoaXMuX2VkaXRvci5kZWNvcmF0ZU1hcmtlcihtYXJrZXIsIHt0eXBlOiAnbGluZScsIGNsYXNzOiBrbGFzc30pO1xuXG4gICAgcmV0dXJuIG1hcmtlcjtcbiAgfVxuXG4gIC8qKlxuICAgKiBIaWdobGlnaHRzIHdvcmRzIGluIGEgZ2l2ZW4gbGluZS5cbiAgICpcbiAgICogQHBhcmFtIGxpbmVOdW1iZXIgVGhlIGxpbmUgbnVtYmVyIHRvIGhpZ2hsaWdodCB3b3JkcyBvbi5cbiAgICogQHBhcmFtIHdvcmREaWZmIEFuIGFycmF5IG9mIG9iamVjdHMgd2hpY2ggbG9vayBsaWtlLi4uXG4gICAqICAgIGFkZGVkOiBib29sZWFuIChub3QgdXNlZClcbiAgICogICAgY291bnQ6IG51bWJlciAobm90IHVzZWQpXG4gICAqICAgIHJlbW92ZWQ6IGJvb2xlYW4gKG5vdCB1c2VkKVxuICAgKiAgICB2YWx1ZTogc3RyaW5nXG4gICAqICAgIGNoYW5nZWQ6IGJvb2xlYW5cbiAgICogQHBhcmFtIHR5cGUgVGhlIHR5cGUgb2YgaGlnaGxpZ2h0IHRvIGJlIGFwcGxpZWQgdG8gdGhlIHdvcmRzLlxuICAgKi9cbiAgc2V0V29yZEhpZ2hsaWdodHMobGluZU51bWJlcjogbnVtYmVyLCB3b3JkRGlmZjogQXJyYXk8YW55PiA9IFtdLCB0eXBlOiBzdHJpbmcsIGlzV2hpdGVzcGFjZUlnbm9yZWQ6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICB2YXIga2xhc3MgPSAnc3BsaXQtZGlmZi13b3JkLScgKyB0eXBlO1xuICAgIHZhciBjb3VudCA9IDA7XG5cbiAgICBmb3IodmFyIGk9MDsgaTx3b3JkRGlmZi5sZW5ndGg7IGkrKykge1xuICAgICAgLy8gaWYgdGhlcmUgd2FzIGEgY2hhbmdlXG4gICAgICAvLyBBTkQgb25lIG9mIHRoZXNlIGlzIHRydWU6XG4gICAgICAvLyBpZiB0aGUgc3RyaW5nIGlzIG5vdCBzcGFjZXMsIGhpZ2hsaWdodFxuICAgICAgLy8gT1JcbiAgICAgIC8vIGlmIHRoZSBzdHJpbmcgaXMgc3BhY2VzIGFuZCB3aGl0ZXNwYWNlIG5vdCBpZ25vcmVkLCBoaWdobGlnaHRcbiAgICAgIGlmKHdvcmREaWZmW2ldLmNoYW5nZWRcbiAgICAgICAgJiYgKC9cXFMvLnRlc3Qod29yZERpZmZbaV0udmFsdWUpXG4gICAgICAgIHx8ICghL1xcUy8udGVzdCh3b3JkRGlmZltpXS52YWx1ZSkgJiYgIWlzV2hpdGVzcGFjZUlnbm9yZWQpKSl7XG4gICAgICAgIHZhciBtYXJrZXIgPSB0aGlzLl9lZGl0b3IubWFya0J1ZmZlclJhbmdlKFtbbGluZU51bWJlciwgY291bnRdLCBbbGluZU51bWJlciwgKGNvdW50ICsgd29yZERpZmZbaV0udmFsdWUubGVuZ3RoKV1dLCB7aW52YWxpZGF0ZTogJ25ldmVyJywgcGVyc2lzdGVudDogZmFsc2UsIGNsYXNzOiBrbGFzc30pXG5cbiAgICAgICAgdGhpcy5fZWRpdG9yLmRlY29yYXRlTWFya2VyKG1hcmtlciwge3R5cGU6ICdoaWdobGlnaHQnLCBjbGFzczoga2xhc3N9KTtcbiAgICAgICAgdGhpcy5fbWFya2Vycy5wdXNoKG1hcmtlcik7XG4gICAgICB9XG4gICAgICBjb3VudCArPSB3b3JkRGlmZltpXS52YWx1ZS5sZW5ndGg7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNjcm9sbHMgdGhlIGVkaXRvciB0byBhIGxpbmUuXG4gICAqXG4gICAqIEBwYXJhbSBsaW5lTnVtYmVyIFRoZSBsaW5lIG51bWJlciB0byBzY3JvbGwgdG8uXG4gICAqL1xuICBzY3JvbGxUb0xpbmUobGluZU51bWJlcjogbnVtYmVyKTogdm9pZCB7XG4gICAgdGhpcy5fZWRpdG9yLnNjcm9sbFRvQnVmZmVyUG9zaXRpb24oW2xpbmVOdW1iZXIsIDBdKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZXN0cm95cyBhbGwgbWFya2VycyBhZGRlZCB0byB0aGlzIGVkaXRvciBieSBzcGxpdC1kaWZmLlxuICAgKi9cbiAgZGVzdHJveU1hcmtlcnMoKTogdm9pZCB7XG4gICAgZm9yKHZhciBpPTA7IGk8dGhpcy5fbWFya2Vycy5sZW5ndGg7IGkrKykge1xuICAgICAgdGhpcy5fbWFya2Vyc1tpXS5kZXN0cm95KCk7XG4gICAgfVxuICAgIHRoaXMuX21hcmtlcnMgPSBbXTtcblxuICAgIHRoaXMuZGVzZWxlY3RBbGxMaW5lcygpO1xuICB9XG5cbiAgLyoqXG4gICAqIE5vdCBhZGRlZCB0byB0aGlzLl9tYXJrZXJzIGJlY2F1c2Ugd2Ugd2FudCBpdCB0byBwZXJzaXN0IGJldHdlZW4gdXBkYXRlcy5cbiAgICpcbiAgICogQHBhcmFtIHN0YXJ0TGluZSBUaGUgbGluZSBudW1iZXIgdGhhdCB0aGUgc2VsZWN0aW9uIHN0YXJ0cyBhdC5cbiAgICogQHBhcmFtIGVuZExpbmUgVGhlIGxpbmUgbnVtYmVyIHRoYXQgdGhlIHNlbGVjdGlvbiBlbmRzIGF0IChub24taW5jbHVzaXZlKS5cbiAgICovXG4gIHNlbGVjdExpbmVzKHN0YXJ0TGluZTogbnVtYmVyLCBlbmRMaW5lOiBudW1iZXIpOiB2b2lkIHtcbiAgICBmb3IodmFyIGk9c3RhcnRMaW5lOyBpPGVuZExpbmU7IGkrKykge1xuICAgICAgdGhpcy5fY3VycmVudFNlbGVjdGlvbi5wdXNoKHRoaXMuX2NyZWF0ZUxpbmVNYXJrZXIoaSwgJ3NlbGVjdGVkJykpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBEZXN0cm95IHRoZSBzZWxlY3Rpb24gbWFya2Vycy5cbiAgICovXG4gIGRlc2VsZWN0QWxsTGluZXMoKTogdm9pZCB7XG4gICAgZm9yKHZhciBpPTA7IGk8dGhpcy5fY3VycmVudFNlbGVjdGlvbi5sZW5ndGg7IGkrKykge1xuICAgICAgdGhpcy5fY3VycmVudFNlbGVjdGlvbltpXS5kZXN0cm95KCk7XG4gICAgfVxuICAgIHRoaXMuX2N1cnJlbnRTZWxlY3Rpb24gPSBbXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBFbmFibGUgc29mdCB3cmFwIGZvciB0aGlzIGVkaXRvci5cbiAgICovXG4gIGVuYWJsZVNvZnRXcmFwKCk6IHZvaWQge1xuICAgIHRoaXMuX2VkaXRvci5zZXRTb2Z0V3JhcHBlZCh0cnVlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIHRleHQgZm9yIHRoZSBsaW5lLlxuICAgKlxuICAgKiBAcGFyYW0gbGluZU51bWJlciBUaGUgbGluZSBudW1iZXIgdG8gZ2V0IHRoZSB0ZXh0IGZyb20uXG4gICAqIEByZXR1cm4gVGhlIHRleHQgZnJvbSB0aGUgc3BlY2lmaWVkIGxpbmUuXG4gICAqL1xuICBnZXRMaW5lVGV4dChsaW5lTnVtYmVyIDogbnVtYmVyKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5fZWRpdG9yLmxpbmVUZXh0Rm9yQnVmZmVyUm93KGxpbmVOdW1iZXIpO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrcyBpZiB0aGUgZWRpdG9yIGNvbnRhaW5zIG5vIHRleHQuXG4gICAqXG4gICAqIEByZXR1cm4gVHJ1ZSBpZiB0aGUgZWRpdG9yIGlzIGVtcHR5LlxuICAgKi9cbiAgaXNFZGl0b3JFbXB0eSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fZWRpdG9yLmdldExpbmVDb3VudCgpID09IDEgJiYgdGhpcy5fZWRpdG9yLmxpbmVUZXh0Rm9yQnVmZmVyUm93KDApID09ICcnO1xuICB9XG59O1xuIl19
//# sourceURL=/home/william/.atom/packages/git-time-machine/node_modules/split-diff/lib/build-lines.js
