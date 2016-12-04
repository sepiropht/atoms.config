(function() {
  var ColorBufferElement, ColorMarkerElement, CompositeDisposable, Emitter, EventsDelegation, nextHighlightId, ref, ref1, registerOrUpdateElement,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  ref = require('atom-utils'), registerOrUpdateElement = ref.registerOrUpdateElement, EventsDelegation = ref.EventsDelegation;

  ref1 = [], ColorMarkerElement = ref1[0], Emitter = ref1[1], CompositeDisposable = ref1[2];

  nextHighlightId = 0;

  ColorBufferElement = (function(superClass) {
    extend(ColorBufferElement, superClass);

    function ColorBufferElement() {
      return ColorBufferElement.__super__.constructor.apply(this, arguments);
    }

    EventsDelegation.includeInto(ColorBufferElement);

    ColorBufferElement.prototype.createdCallback = function() {
      var ref2, ref3;
      if (Emitter == null) {
        ref2 = require('atom'), Emitter = ref2.Emitter, CompositeDisposable = ref2.CompositeDisposable;
      }
      ref3 = [0, 0], this.editorScrollLeft = ref3[0], this.editorScrollTop = ref3[1];
      this.emitter = new Emitter;
      this.subscriptions = new CompositeDisposable;
      this.shadowRoot = this.createShadowRoot();
      this.displayedMarkers = [];
      this.usedMarkers = [];
      this.unusedMarkers = [];
      return this.viewsByMarkers = new WeakMap;
    };

    ColorBufferElement.prototype.attachedCallback = function() {
      this.attached = true;
      return this.update();
    };

    ColorBufferElement.prototype.detachedCallback = function() {
      return this.attached = false;
    };

    ColorBufferElement.prototype.onDidUpdate = function(callback) {
      return this.emitter.on('did-update', callback);
    };

    ColorBufferElement.prototype.getModel = function() {
      return this.colorBuffer;
    };

    ColorBufferElement.prototype.setModel = function(colorBuffer) {
      var scrollLeftListener, scrollTopListener;
      this.colorBuffer = colorBuffer;
      this.editor = this.colorBuffer.editor;
      if (this.editor.isDestroyed()) {
        return;
      }
      this.editorElement = atom.views.getView(this.editor);
      this.colorBuffer.initialize().then((function(_this) {
        return function() {
          return _this.update();
        };
      })(this));
      this.subscriptions.add(this.colorBuffer.onDidUpdateColorMarkers((function(_this) {
        return function() {
          return _this.update();
        };
      })(this)));
      this.subscriptions.add(this.colorBuffer.onDidDestroy((function(_this) {
        return function() {
          return _this.destroy();
        };
      })(this)));
      scrollLeftListener = (function(_this) {
        return function(editorScrollLeft) {
          _this.editorScrollLeft = editorScrollLeft;
          return _this.updateScroll();
        };
      })(this);
      scrollTopListener = (function(_this) {
        return function(editorScrollTop) {
          _this.editorScrollTop = editorScrollTop;
          if (_this.useNativeDecorations()) {
            return;
          }
          _this.updateScroll();
          return requestAnimationFrame(function() {
            return _this.updateMarkers();
          });
        };
      })(this);
      if (this.editorElement.onDidChangeScrollLeft != null) {
        this.subscriptions.add(this.editorElement.onDidChangeScrollLeft(scrollLeftListener));
        this.subscriptions.add(this.editorElement.onDidChangeScrollTop(scrollTopListener));
      } else {
        this.subscriptions.add(this.editor.onDidChangeScrollLeft(scrollLeftListener));
        this.subscriptions.add(this.editor.onDidChangeScrollTop(scrollTopListener));
      }
      this.subscriptions.add(this.editor.onDidChange((function(_this) {
        return function() {
          return _this.usedMarkers.forEach(function(marker) {
            var ref2;
            if ((ref2 = marker.colorMarker) != null) {
              ref2.invalidateScreenRangeCache();
            }
            return marker.checkScreenRange();
          });
        };
      })(this)));
      this.subscriptions.add(this.editor.onDidAddCursor((function(_this) {
        return function() {
          return _this.requestSelectionUpdate();
        };
      })(this)));
      this.subscriptions.add(this.editor.onDidRemoveCursor((function(_this) {
        return function() {
          return _this.requestSelectionUpdate();
        };
      })(this)));
      this.subscriptions.add(this.editor.onDidChangeCursorPosition((function(_this) {
        return function() {
          return _this.requestSelectionUpdate();
        };
      })(this)));
      this.subscriptions.add(this.editor.onDidAddSelection((function(_this) {
        return function() {
          return _this.requestSelectionUpdate();
        };
      })(this)));
      this.subscriptions.add(this.editor.onDidRemoveSelection((function(_this) {
        return function() {
          return _this.requestSelectionUpdate();
        };
      })(this)));
      this.subscriptions.add(this.editor.onDidChangeSelectionRange((function(_this) {
        return function() {
          return _this.requestSelectionUpdate();
        };
      })(this)));
      if (this.editor.onDidTokenize != null) {
        this.subscriptions.add(this.editor.onDidTokenize((function(_this) {
          return function() {
            return _this.editorConfigChanged();
          };
        })(this)));
      } else {
        this.subscriptions.add(this.editor.displayBuffer.onDidTokenize((function(_this) {
          return function() {
            return _this.editorConfigChanged();
          };
        })(this)));
      }
      this.subscriptions.add(atom.config.observe('editor.fontSize', (function(_this) {
        return function() {
          return _this.editorConfigChanged();
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('editor.lineHeight', (function(_this) {
        return function() {
          return _this.editorConfigChanged();
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('pigments.markerType', (function(_this) {
        return function(type) {
          if (ColorMarkerElement == null) {
            ColorMarkerElement = require('./color-marker-element');
          }
          if (ColorMarkerElement.prototype.rendererType !== type) {
            ColorMarkerElement.setMarkerType(type);
          }
          if (_this.isNativeDecorationType(type)) {
            _this.initializeNativeDecorations(type);
          } else {
            if (type === 'background') {
              _this.classList.add('above-editor-content');
            } else {
              _this.classList.remove('above-editor-content');
            }
            _this.destroyNativeDecorations();
            _this.updateMarkers(type);
          }
          return _this.previousType = type;
        };
      })(this)));
      this.subscriptions.add(atom.styles.onDidAddStyleElement((function(_this) {
        return function() {
          return _this.editorConfigChanged();
        };
      })(this)));
      this.subscriptions.add(this.editorElement.onDidAttach((function(_this) {
        return function() {
          return _this.attach();
        };
      })(this)));
      return this.subscriptions.add(this.editorElement.onDidDetach((function(_this) {
        return function() {
          return _this.detach();
        };
      })(this)));
    };

    ColorBufferElement.prototype.attach = function() {
      var ref2;
      if (this.parentNode != null) {
        return;
      }
      if (this.editorElement == null) {
        return;
      }
      return (ref2 = this.getEditorRoot().querySelector('.lines')) != null ? ref2.appendChild(this) : void 0;
    };

    ColorBufferElement.prototype.detach = function() {
      if (this.parentNode == null) {
        return;
      }
      return this.parentNode.removeChild(this);
    };

    ColorBufferElement.prototype.destroy = function() {
      this.detach();
      this.subscriptions.dispose();
      if (this.isNativeDecorationType()) {
        this.destroyNativeDecorations();
      } else {
        this.releaseAllMarkerViews();
      }
      return this.colorBuffer = null;
    };

    ColorBufferElement.prototype.update = function() {
      if (this.useNativeDecorations()) {
        if (this.isGutterType()) {
          return this.updateGutterDecorations();
        } else {
          return this.updateHighlightDecorations(this.previousType);
        }
      } else {
        return this.updateMarkers();
      }
    };

    ColorBufferElement.prototype.updateScroll = function() {
      if (this.editorElement.hasTiledRendering && !this.useNativeDecorations()) {
        return this.style.webkitTransform = "translate3d(" + (-this.editorScrollLeft) + "px, " + (-this.editorScrollTop) + "px, 0)";
      }
    };

    ColorBufferElement.prototype.getEditorRoot = function() {
      var ref2;
      return (ref2 = this.editorElement.shadowRoot) != null ? ref2 : this.editorElement;
    };

    ColorBufferElement.prototype.editorConfigChanged = function() {
      if ((this.parentNode == null) || this.useNativeDecorations()) {
        return;
      }
      this.usedMarkers.forEach((function(_this) {
        return function(marker) {
          if (marker.colorMarker != null) {
            return marker.render();
          } else {
            console.warn("A marker view was found in the used instance pool while having a null model", marker);
            return _this.releaseMarkerElement(marker);
          }
        };
      })(this));
      return this.updateMarkers();
    };

    ColorBufferElement.prototype.isGutterType = function(type) {
      if (type == null) {
        type = this.previousType;
      }
      return type === 'gutter' || type === 'native-dot' || type === 'native-square-dot';
    };

    ColorBufferElement.prototype.isDotType = function(type) {
      if (type == null) {
        type = this.previousType;
      }
      return type === 'native-dot' || type === 'native-square-dot';
    };

    ColorBufferElement.prototype.useNativeDecorations = function() {
      return this.isNativeDecorationType(this.previousType);
    };

    ColorBufferElement.prototype.isNativeDecorationType = function(type) {
      if (ColorMarkerElement == null) {
        ColorMarkerElement = require('./color-marker-element');
      }
      return ColorMarkerElement.isNativeDecorationType(type);
    };

    ColorBufferElement.prototype.initializeNativeDecorations = function(type) {
      this.releaseAllMarkerViews();
      this.destroyNativeDecorations();
      if (this.isGutterType(type)) {
        return this.initializeGutter(type);
      } else {
        return this.updateHighlightDecorations(type);
      }
    };

    ColorBufferElement.prototype.destroyNativeDecorations = function() {
      if (this.isGutterType()) {
        return this.destroyGutter();
      } else {
        return this.destroyHighlightDecorations();
      }
    };

    ColorBufferElement.prototype.updateHighlightDecorations = function(type) {
      var className, i, j, len, len1, m, markers, markersByRows, maxRowLength, ref2, ref3, ref4, ref5, style;
      if (this.editor.isDestroyed()) {
        return;
      }
      if (this.styleByMarkerId == null) {
        this.styleByMarkerId = {};
      }
      if (this.decorationByMarkerId == null) {
        this.decorationByMarkerId = {};
      }
      markers = this.colorBuffer.getValidColorMarkers();
      ref2 = this.displayedMarkers;
      for (i = 0, len = ref2.length; i < len; i++) {
        m = ref2[i];
        if (!(indexOf.call(markers, m) < 0)) {
          continue;
        }
        if ((ref3 = this.decorationByMarkerId[m.id]) != null) {
          ref3.destroy();
        }
        this.removeChild(this.styleByMarkerId[m.id]);
        delete this.styleByMarkerId[m.id];
        delete this.decorationByMarkerId[m.id];
      }
      markersByRows = {};
      maxRowLength = 0;
      for (j = 0, len1 = markers.length; j < len1; j++) {
        m = markers[j];
        if (((ref4 = m.color) != null ? ref4.isValid() : void 0) && indexOf.call(this.displayedMarkers, m) < 0) {
          ref5 = this.getHighlighDecorationCSS(m, type), className = ref5.className, style = ref5.style;
          this.appendChild(style);
          this.styleByMarkerId[m.id] = style;
          this.decorationByMarkerId[m.id] = this.editor.decorateMarker(m.marker, {
            type: 'highlight',
            "class": "pigments-" + type + " " + className,
            includeMarkerText: type === 'highlight'
          });
        }
      }
      this.displayedMarkers = markers;
      return this.emitter.emit('did-update');
    };

    ColorBufferElement.prototype.destroyHighlightDecorations = function() {
      var deco, id, ref2;
      ref2 = this.decorationByMarkerId;
      for (id in ref2) {
        deco = ref2[id];
        if (this.styleByMarkerId[id] != null) {
          this.removeChild(this.styleByMarkerId[id]);
        }
        deco.destroy();
      }
      delete this.decorationByMarkerId;
      delete this.styleByMarkerId;
      return this.displayedMarkers = [];
    };

    ColorBufferElement.prototype.getHighlighDecorationCSS = function(marker, type) {
      var className, l, style;
      className = "pigments-highlight-" + (nextHighlightId++);
      style = document.createElement('style');
      l = marker.color.luma;
      if (type === 'native-background') {
        style.innerHTML = "." + className + " .region {\n  background-color: " + (marker.color.toCSS()) + ";\n  color: " + (l > 0.43 ? 'black' : 'white') + ";\n}";
      } else if (type === 'native-underline') {
        style.innerHTML = "." + className + " .region {\n  background-color: " + (marker.color.toCSS()) + ";\n}";
      } else if (type === 'native-outline') {
        style.innerHTML = "." + className + " .region {\n  border-color: " + (marker.color.toCSS()) + ";\n}";
      }
      return {
        className: className,
        style: style
      };
    };

    ColorBufferElement.prototype.initializeGutter = function(type) {
      var gutterContainer, options;
      options = {
        name: "pigments-" + type
      };
      if (type !== 'gutter') {
        options.priority = 1000;
      }
      this.gutter = this.editor.addGutter(options);
      this.displayedMarkers = [];
      if (this.decorationByMarkerId == null) {
        this.decorationByMarkerId = {};
      }
      gutterContainer = this.getEditorRoot().querySelector('.gutter-container');
      this.gutterSubscription = new CompositeDisposable;
      this.gutterSubscription.add(this.subscribeTo(gutterContainer, {
        mousedown: (function(_this) {
          return function(e) {
            var colorMarker, markerId, targetDecoration;
            targetDecoration = e.path[0];
            if (!targetDecoration.matches('span')) {
              targetDecoration = targetDecoration.querySelector('span');
            }
            if (targetDecoration == null) {
              return;
            }
            markerId = targetDecoration.dataset.markerId;
            colorMarker = _this.displayedMarkers.filter(function(m) {
              return m.id === Number(markerId);
            })[0];
            if (!((colorMarker != null) && (_this.colorBuffer != null))) {
              return;
            }
            return _this.colorBuffer.selectColorMarkerAndOpenPicker(colorMarker);
          };
        })(this)
      }));
      if (this.isDotType(type)) {
        this.gutterSubscription.add(this.editor.onDidChange((function(_this) {
          return function(changes) {
            if (Array.isArray(changes)) {
              return changes != null ? changes.forEach(function(change) {
                return _this.updateDotDecorationsOffsets(change.start.row, change.newExtent.row);
              }) : void 0;
            } else {
              return _this.updateDotDecorationsOffsets(changes.start.row, changes.newExtent.row);
            }
          };
        })(this)));
      }
      return this.updateGutterDecorations(type);
    };

    ColorBufferElement.prototype.destroyGutter = function() {
      var decoration, id, ref2;
      this.gutter.destroy();
      this.gutterSubscription.dispose();
      this.displayedMarkers = [];
      ref2 = this.decorationByMarkerId;
      for (id in ref2) {
        decoration = ref2[id];
        decoration.destroy();
      }
      delete this.decorationByMarkerId;
      return delete this.gutterSubscription;
    };

    ColorBufferElement.prototype.updateGutterDecorations = function(type) {
      var deco, decoWidth, i, j, len, len1, m, markers, markersByRows, maxRowLength, ref2, ref3, ref4, row, rowLength;
      if (type == null) {
        type = this.previousType;
      }
      if (this.editor.isDestroyed()) {
        return;
      }
      markers = this.colorBuffer.getValidColorMarkers();
      ref2 = this.displayedMarkers;
      for (i = 0, len = ref2.length; i < len; i++) {
        m = ref2[i];
        if (!(indexOf.call(markers, m) < 0)) {
          continue;
        }
        if ((ref3 = this.decorationByMarkerId[m.id]) != null) {
          ref3.destroy();
        }
        delete this.decorationByMarkerId[m.id];
      }
      markersByRows = {};
      maxRowLength = 0;
      for (j = 0, len1 = markers.length; j < len1; j++) {
        m = markers[j];
        if (((ref4 = m.color) != null ? ref4.isValid() : void 0) && indexOf.call(this.displayedMarkers, m) < 0) {
          this.decorationByMarkerId[m.id] = this.gutter.decorateMarker(m.marker, {
            type: 'gutter',
            "class": 'pigments-gutter-marker',
            item: this.getGutterDecorationItem(m)
          });
        }
        deco = this.decorationByMarkerId[m.id];
        row = m.marker.getStartScreenPosition().row;
        if (markersByRows[row] == null) {
          markersByRows[row] = 0;
        }
        rowLength = 0;
        if (type !== 'gutter') {
          rowLength = this.editorElement.pixelPositionForScreenPosition([row, 2e308]).left;
        }
        decoWidth = 14;
        deco.properties.item.style.left = (rowLength + markersByRows[row] * decoWidth) + "px";
        markersByRows[row]++;
        maxRowLength = Math.max(maxRowLength, markersByRows[row]);
      }
      if (type === 'gutter') {
        atom.views.getView(this.gutter).style.minWidth = (maxRowLength * decoWidth) + "px";
      } else {
        atom.views.getView(this.gutter).style.width = "0px";
      }
      this.displayedMarkers = markers;
      return this.emitter.emit('did-update');
    };

    ColorBufferElement.prototype.updateDotDecorationsOffsets = function(rowStart, rowEnd) {
      var deco, decoWidth, i, m, markerRow, markersByRows, ref2, ref3, results, row, rowLength;
      markersByRows = {};
      results = [];
      for (row = i = ref2 = rowStart, ref3 = rowEnd; ref2 <= ref3 ? i <= ref3 : i >= ref3; row = ref2 <= ref3 ? ++i : --i) {
        results.push((function() {
          var j, len, ref4, results1;
          ref4 = this.displayedMarkers;
          results1 = [];
          for (j = 0, len = ref4.length; j < len; j++) {
            m = ref4[j];
            deco = this.decorationByMarkerId[m.id];
            if (m.marker == null) {
              continue;
            }
            markerRow = m.marker.getStartScreenPosition().row;
            if (row !== markerRow) {
              continue;
            }
            if (markersByRows[row] == null) {
              markersByRows[row] = 0;
            }
            rowLength = this.editorElement.pixelPositionForScreenPosition([row, 2e308]).left;
            decoWidth = 14;
            deco.properties.item.style.left = (rowLength + markersByRows[row] * decoWidth) + "px";
            results1.push(markersByRows[row]++);
          }
          return results1;
        }).call(this));
      }
      return results;
    };

    ColorBufferElement.prototype.getGutterDecorationItem = function(marker) {
      var div;
      div = document.createElement('div');
      div.innerHTML = "<span style='background-color: " + (marker.color.toCSS()) + ";' data-marker-id='" + marker.id + "'></span>";
      return div;
    };

    ColorBufferElement.prototype.requestMarkerUpdate = function(markers) {
      if (this.frameRequested) {
        this.dirtyMarkers = this.dirtyMarkers.concat(markers);
        return;
      } else {
        this.dirtyMarkers = markers.slice();
        this.frameRequested = true;
      }
      return requestAnimationFrame((function(_this) {
        return function() {
          var dirtyMarkers, i, len, m, ref2;
          dirtyMarkers = [];
          ref2 = _this.dirtyMarkers;
          for (i = 0, len = ref2.length; i < len; i++) {
            m = ref2[i];
            if (indexOf.call(dirtyMarkers, m) < 0) {
              dirtyMarkers.push(m);
            }
          }
          delete _this.frameRequested;
          delete _this.dirtyMarkers;
          if (_this.colorBuffer == null) {
            return;
          }
          return dirtyMarkers.forEach(function(marker) {
            return marker.render();
          });
        };
      })(this));
    };

    ColorBufferElement.prototype.updateMarkers = function(type) {
      var base, base1, i, j, len, len1, m, markers, ref2, ref3, ref4;
      if (type == null) {
        type = this.previousType;
      }
      if (this.editor.isDestroyed()) {
        return;
      }
      markers = this.colorBuffer.findValidColorMarkers({
        intersectsScreenRowRange: (ref2 = typeof (base = this.editorElement).getVisibleRowRange === "function" ? base.getVisibleRowRange() : void 0) != null ? ref2 : typeof (base1 = this.editor).getVisibleRowRange === "function" ? base1.getVisibleRowRange() : void 0
      });
      ref3 = this.displayedMarkers;
      for (i = 0, len = ref3.length; i < len; i++) {
        m = ref3[i];
        if (indexOf.call(markers, m) < 0) {
          this.releaseMarkerView(m);
        }
      }
      for (j = 0, len1 = markers.length; j < len1; j++) {
        m = markers[j];
        if (((ref4 = m.color) != null ? ref4.isValid() : void 0) && indexOf.call(this.displayedMarkers, m) < 0) {
          this.requestMarkerView(m);
        }
      }
      this.displayedMarkers = markers;
      return this.emitter.emit('did-update');
    };

    ColorBufferElement.prototype.requestMarkerView = function(marker) {
      var view;
      if (this.unusedMarkers.length) {
        view = this.unusedMarkers.shift();
      } else {
        if (ColorMarkerElement == null) {
          ColorMarkerElement = require('./color-marker-element');
        }
        view = new ColorMarkerElement;
        view.setContainer(this);
        view.onDidRelease((function(_this) {
          return function(arg) {
            var marker;
            marker = arg.marker;
            _this.displayedMarkers.splice(_this.displayedMarkers.indexOf(marker), 1);
            return _this.releaseMarkerView(marker);
          };
        })(this));
        this.shadowRoot.appendChild(view);
      }
      view.setModel(marker);
      this.hideMarkerIfInSelectionOrFold(marker, view);
      this.usedMarkers.push(view);
      this.viewsByMarkers.set(marker, view);
      return view;
    };

    ColorBufferElement.prototype.releaseMarkerView = function(markerOrView) {
      var marker, view;
      marker = markerOrView;
      view = this.viewsByMarkers.get(markerOrView);
      if (view != null) {
        if (marker != null) {
          this.viewsByMarkers["delete"](marker);
        }
        return this.releaseMarkerElement(view);
      }
    };

    ColorBufferElement.prototype.releaseMarkerElement = function(view) {
      this.usedMarkers.splice(this.usedMarkers.indexOf(view), 1);
      if (!view.isReleased()) {
        view.release(false);
      }
      return this.unusedMarkers.push(view);
    };

    ColorBufferElement.prototype.releaseAllMarkerViews = function() {
      var i, j, len, len1, ref2, ref3, view;
      ref2 = this.usedMarkers;
      for (i = 0, len = ref2.length; i < len; i++) {
        view = ref2[i];
        view.destroy();
      }
      ref3 = this.unusedMarkers;
      for (j = 0, len1 = ref3.length; j < len1; j++) {
        view = ref3[j];
        view.destroy();
      }
      this.usedMarkers = [];
      this.unusedMarkers = [];
      return Array.prototype.forEach.call(this.shadowRoot.querySelectorAll('pigments-color-marker'), function(el) {
        return el.parentNode.removeChild(el);
      });
    };

    ColorBufferElement.prototype.requestSelectionUpdate = function() {
      if (this.updateRequested) {
        return;
      }
      this.updateRequested = true;
      return requestAnimationFrame((function(_this) {
        return function() {
          _this.updateRequested = false;
          if (_this.editor.getBuffer().isDestroyed()) {
            return;
          }
          return _this.updateSelections();
        };
      })(this));
    };

    ColorBufferElement.prototype.updateSelections = function() {
      var decoration, i, j, len, len1, marker, ref2, ref3, results, results1, view;
      if (this.editor.isDestroyed()) {
        return;
      }
      if (this.useNativeDecorations()) {
        ref2 = this.displayedMarkers;
        results = [];
        for (i = 0, len = ref2.length; i < len; i++) {
          marker = ref2[i];
          decoration = this.decorationByMarkerId[marker.id];
          if (decoration != null) {
            results.push(this.hideDecorationIfInSelection(marker, decoration));
          } else {
            results.push(void 0);
          }
        }
        return results;
      } else {
        ref3 = this.displayedMarkers;
        results1 = [];
        for (j = 0, len1 = ref3.length; j < len1; j++) {
          marker = ref3[j];
          view = this.viewsByMarkers.get(marker);
          if (view != null) {
            view.classList.remove('hidden');
            view.classList.remove('in-fold');
            results1.push(this.hideMarkerIfInSelectionOrFold(marker, view));
          } else {
            results1.push(console.warn("A color marker was found in the displayed markers array without an associated view", marker));
          }
        }
        return results1;
      }
    };

    ColorBufferElement.prototype.hideDecorationIfInSelection = function(marker, decoration) {
      var classes, i, len, markerRange, props, range, selection, selections;
      selections = this.editor.getSelections();
      props = decoration.getProperties();
      classes = props["class"].split(/\s+/g);
      for (i = 0, len = selections.length; i < len; i++) {
        selection = selections[i];
        range = selection.getScreenRange();
        markerRange = marker.getScreenRange();
        if (!((markerRange != null) && (range != null))) {
          continue;
        }
        if (markerRange.intersectsWith(range)) {
          if (classes[0].match(/-in-selection$/) == null) {
            classes[0] += '-in-selection';
          }
          props["class"] = classes.join(' ');
          decoration.setProperties(props);
          return;
        }
      }
      classes = classes.map(function(cls) {
        return cls.replace('-in-selection', '');
      });
      props["class"] = classes.join(' ');
      return decoration.setProperties(props);
    };

    ColorBufferElement.prototype.hideMarkerIfInSelectionOrFold = function(marker, view) {
      var i, len, markerRange, range, results, selection, selections;
      selections = this.editor.getSelections();
      results = [];
      for (i = 0, len = selections.length; i < len; i++) {
        selection = selections[i];
        range = selection.getScreenRange();
        markerRange = marker.getScreenRange();
        if (!((markerRange != null) && (range != null))) {
          continue;
        }
        if (markerRange.intersectsWith(range)) {
          view.classList.add('hidden');
        }
        if (this.editor.isFoldedAtBufferRow(marker.getBufferRange().start.row)) {
          results.push(view.classList.add('in-fold'));
        } else {
          results.push(void 0);
        }
      }
      return results;
    };

    ColorBufferElement.prototype.colorMarkerForMouseEvent = function(event) {
      var bufferPosition, position;
      position = this.screenPositionForMouseEvent(event);
      if (position == null) {
        return;
      }
      bufferPosition = this.colorBuffer.editor.bufferPositionForScreenPosition(position);
      return this.colorBuffer.getColorMarkerAtBufferPosition(bufferPosition);
    };

    ColorBufferElement.prototype.screenPositionForMouseEvent = function(event) {
      var pixelPosition;
      pixelPosition = this.pixelPositionForMouseEvent(event);
      if (pixelPosition == null) {
        return;
      }
      if (this.editorElement.screenPositionForPixelPosition != null) {
        return this.editorElement.screenPositionForPixelPosition(pixelPosition);
      } else {
        return this.editor.screenPositionForPixelPosition(pixelPosition);
      }
    };

    ColorBufferElement.prototype.pixelPositionForMouseEvent = function(event) {
      var clientX, clientY, left, ref2, rootElement, scrollTarget, top;
      clientX = event.clientX, clientY = event.clientY;
      scrollTarget = this.editorElement.getScrollTop != null ? this.editorElement : this.editor;
      rootElement = this.getEditorRoot();
      if (rootElement.querySelector('.lines') == null) {
        return;
      }
      ref2 = rootElement.querySelector('.lines').getBoundingClientRect(), top = ref2.top, left = ref2.left;
      top = clientY - top + scrollTarget.getScrollTop();
      left = clientX - left + scrollTarget.getScrollLeft();
      return {
        top: top,
        left: left
      };
    };

    return ColorBufferElement;

  })(HTMLElement);

  module.exports = ColorBufferElement = registerOrUpdateElement('pigments-markers', ColorBufferElement.prototype);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvc2VwaXJvcGh0Ly5hdG9tL3BhY2thZ2VzL3BpZ21lbnRzL2xpYi9jb2xvci1idWZmZXItZWxlbWVudC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLDJJQUFBO0lBQUE7Ozs7RUFBQSxNQUE4QyxPQUFBLENBQVEsWUFBUixDQUE5QyxFQUFDLHFEQUFELEVBQTBCOztFQUUxQixPQUFxRCxFQUFyRCxFQUFDLDRCQUFELEVBQXFCLGlCQUFyQixFQUE4Qjs7RUFFOUIsZUFBQSxHQUFrQjs7RUFFWjs7Ozs7OztJQUNKLGdCQUFnQixDQUFDLFdBQWpCLENBQTZCLGtCQUE3Qjs7aUNBRUEsZUFBQSxHQUFpQixTQUFBO0FBQ2YsVUFBQTtNQUFBLElBQU8sZUFBUDtRQUNFLE9BQWlDLE9BQUEsQ0FBUSxNQUFSLENBQWpDLEVBQUMsc0JBQUQsRUFBVSwrQ0FEWjs7TUFHQSxPQUF3QyxDQUFDLENBQUQsRUFBSSxDQUFKLENBQXhDLEVBQUMsSUFBQyxDQUFBLDBCQUFGLEVBQW9CLElBQUMsQ0FBQTtNQUNyQixJQUFDLENBQUEsT0FBRCxHQUFXLElBQUk7TUFDZixJQUFDLENBQUEsYUFBRCxHQUFpQixJQUFJO01BQ3JCLElBQUMsQ0FBQSxVQUFELEdBQWMsSUFBQyxDQUFBLGdCQUFELENBQUE7TUFDZCxJQUFDLENBQUEsZ0JBQUQsR0FBb0I7TUFDcEIsSUFBQyxDQUFBLFdBQUQsR0FBZTtNQUNmLElBQUMsQ0FBQSxhQUFELEdBQWlCO2FBQ2pCLElBQUMsQ0FBQSxjQUFELEdBQWtCLElBQUk7SUFYUDs7aUNBYWpCLGdCQUFBLEdBQWtCLFNBQUE7TUFDaEIsSUFBQyxDQUFBLFFBQUQsR0FBWTthQUNaLElBQUMsQ0FBQSxNQUFELENBQUE7SUFGZ0I7O2lDQUlsQixnQkFBQSxHQUFrQixTQUFBO2FBQ2hCLElBQUMsQ0FBQSxRQUFELEdBQVk7SUFESTs7aUNBR2xCLFdBQUEsR0FBYSxT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QSxPQUFjLFdBQVcsQ0FBQyxhQUFaLENBQTBCLFFBQTFCLENBQW1DLENBQUMscUJBQXBDLENBQUEsQ0FBZCxFQUFDLGNBQUQsRUFBTTtNQUNOLEdBQUEsR0FBTSxPQUFBLEdBQVUsR0FBVixHQUFnQixZQUFZLENBQUMsWUFBYixDQUFBO01BQ3RCLElBQUEsR0FBTyxPQUFBLEdBQVUsSUFBVixHQUFpQixZQUFZLENBQUMsYUFBYixDQUFBO2FBQ3hCO1FBQUMsS0FBQSxHQUFEO1FBQU0sTUFBQSxJQUFOOztJQWYwQjs7OztLQXZqQkc7O0VBd2tCakMsTUFBTSxDQUFDLE9BQVAsR0FDQSxrQkFBQSxHQUNBLHVCQUFBLENBQXdCLGtCQUF4QixFQUE0QyxrQkFBa0IsQ0FBQyxTQUEvRDtBQWhsQkEiLCJzb3VyY2VzQ29udGVudCI6WyJ7cmVnaXN0ZXJPclVwZGF0ZUVsZW1lbnQsIEV2ZW50c0RlbGVnYXRpb259ID0gcmVxdWlyZSAnYXRvbS11dGlscydcblxuW0NvbG9yTWFya2VyRWxlbWVudCwgRW1pdHRlciwgQ29tcG9zaXRlRGlzcG9zYWJsZV0gPSBbXVxuXG5uZXh0SGlnaGxpZ2h0SWQgPSAwXG5cbmNsYXNzIENvbG9yQnVmZmVyRWxlbWVudCBleHRlbmRzIEhUTUxFbGVtZW50XG4gIEV2ZW50c0RlbGVnYXRpb24uaW5jbHVkZUludG8odGhpcylcblxuICBjcmVhdGVkQ2FsbGJhY2s6IC0+XG4gICAgdW5sZXNzIEVtaXR0ZXI/XG4gICAgICB7RW1pdHRlciwgQ29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlICdhdG9tJ1xuXG4gICAgW0BlZGl0b3JTY3JvbGxMZWZ0LCBAZWRpdG9yU2Nyb2xsVG9wXSA9IFswLCAwXVxuICAgIEBlbWl0dGVyID0gbmV3IEVtaXR0ZXJcbiAgICBAc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG4gICAgQHNoYWRvd1Jvb3QgPSBAY3JlYXRlU2hhZG93Um9vdCgpXG4gICAgQGRpc3BsYXllZE1hcmtlcnMgPSBbXVxuICAgIEB1c2VkTWFya2VycyA9IFtdXG4gICAgQHVudXNlZE1hcmtlcnMgPSBbXVxuICAgIEB2aWV3c0J5TWFya2VycyA9IG5ldyBXZWFrTWFwXG5cbiAgYXR0YWNoZWRDYWxsYmFjazogLT5cbiAgICBAYXR0YWNoZWQgPSB0cnVlXG4gICAgQHVwZGF0ZSgpXG5cbiAgZGV0YWNoZWRDYWxsYmFjazogLT5cbiAgICBAYXR0YWNoZWQgPSBmYWxzZVxuXG4gIG9uRGlkVXBkYXRlOiAoY2FsbGJhY2spIC0+XG4gICAgQGVtaXR0ZXIub24gJ2RpZC11cGRhdGUnLCBjYWxsYmFja1xuXG4gIGdldE1vZGVsOiAtPiBAY29sb3JCdWZmZXJcblxuICBzZXRNb2RlbDogKEBjb2xvckJ1ZmZlcikgLT5cbiAgICB7QGVkaXRvcn0gPSBAY29sb3JCdWZmZXJcbiAgICByZXR1cm4gaWYgQGVkaXRvci5pc0Rlc3Ryb3llZCgpXG4gICAgQGVkaXRvckVsZW1lbnQgPSBhdG9tLnZpZXdzLmdldFZpZXcoQGVkaXRvcilcblxuICAgIEBjb2xvckJ1ZmZlci5pbml0aWFsaXplKCkudGhlbiA9PiBAdXBkYXRlKClcblxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBAY29sb3JCdWZmZXIub25EaWRVcGRhdGVDb2xvck1hcmtlcnMgPT4gQHVwZGF0ZSgpXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIEBjb2xvckJ1ZmZlci5vbkRpZERlc3Ryb3kgPT4gQGRlc3Ryb3koKVxuXG4gICAgc2Nyb2xsTGVmdExpc3RlbmVyID0gKEBlZGl0b3JTY3JvbGxMZWZ0KSA9PiBAdXBkYXRlU2Nyb2xsKClcbiAgICBzY3JvbGxUb3BMaXN0ZW5lciA9IChAZWRpdG9yU2Nyb2xsVG9wKSA9PlxuICAgICAgcmV0dXJuIGlmIEB1c2VOYXRpdmVEZWNvcmF0aW9ucygpXG4gICAgICBAdXBkYXRlU2Nyb2xsKClcbiAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSA9PiBAdXBkYXRlTWFya2VycygpXG5cbiAgICBpZiBAZWRpdG9yRWxlbWVudC5vbkRpZENoYW5nZVNjcm9sbExlZnQ/XG4gICAgICBAc3Vic2NyaXB0aW9ucy5hZGQgQGVkaXRvckVsZW1lbnQub25EaWRDaGFuZ2VTY3JvbGxMZWZ0KHNjcm9sbExlZnRMaXN0ZW5lcilcbiAgICAgIEBzdWJzY3JpcHRpb25zLmFkZCBAZWRpdG9yRWxlbWVudC5vbkRpZENoYW5nZVNjcm9sbFRvcChzY3JvbGxUb3BMaXN0ZW5lcilcbiAgICBlbHNlXG4gICAgICBAc3Vic2NyaXB0aW9ucy5hZGQgQGVkaXRvci5vbkRpZENoYW5nZVNjcm9sbExlZnQoc2Nyb2xsTGVmdExpc3RlbmVyKVxuICAgICAgQHN1YnNjcmlwdGlvbnMuYWRkIEBlZGl0b3Iub25EaWRDaGFuZ2VTY3JvbGxUb3Aoc2Nyb2xsVG9wTGlzdGVuZXIpXG5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgQGVkaXRvci5vbkRpZENoYW5nZSA9PlxuICAgICAgQHVzZWRNYXJrZXJzLmZvckVhY2ggKG1hcmtlcikgLT5cbiAgICAgICAgbWFya2VyLmNvbG9yTWFya2VyPy5pbnZhbGlkYXRlU2NyZWVuUmFuZ2VDYWNoZSgpXG4gICAgICAgIG1hcmtlci5jaGVja1NjcmVlblJhbmdlKClcblxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBAZWRpdG9yLm9uRGlkQWRkQ3Vyc29yID0+XG4gICAgICBAcmVxdWVzdFNlbGVjdGlvblVwZGF0ZSgpXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIEBlZGl0b3Iub25EaWRSZW1vdmVDdXJzb3IgPT5cbiAgICAgIEByZXF1ZXN0U2VsZWN0aW9uVXBkYXRlKClcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgQGVkaXRvci5vbkRpZENoYW5nZUN1cnNvclBvc2l0aW9uID0+XG4gICAgICBAcmVxdWVzdFNlbGVjdGlvblVwZGF0ZSgpXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIEBlZGl0b3Iub25EaWRBZGRTZWxlY3Rpb24gPT5cbiAgICAgIEByZXF1ZXN0U2VsZWN0aW9uVXBkYXRlKClcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgQGVkaXRvci5vbkRpZFJlbW92ZVNlbGVjdGlvbiA9PlxuICAgICAgQHJlcXVlc3RTZWxlY3Rpb25VcGRhdGUoKVxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBAZWRpdG9yLm9uRGlkQ2hhbmdlU2VsZWN0aW9uUmFuZ2UgPT5cbiAgICAgIEByZXF1ZXN0U2VsZWN0aW9uVXBkYXRlKClcblxuICAgIGlmIEBlZGl0b3Iub25EaWRUb2tlbml6ZT9cbiAgICAgIEBzdWJzY3JpcHRpb25zLmFkZCBAZWRpdG9yLm9uRGlkVG9rZW5pemUgPT4gQGVkaXRvckNvbmZpZ0NoYW5nZWQoKVxuICAgIGVsc2VcbiAgICAgIEBzdWJzY3JpcHRpb25zLmFkZCBAZWRpdG9yLmRpc3BsYXlCdWZmZXIub25EaWRUb2tlbml6ZSA9PlxuICAgICAgICBAZWRpdG9yQ29uZmlnQ2hhbmdlZCgpXG5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb25maWcub2JzZXJ2ZSAnZWRpdG9yLmZvbnRTaXplJywgPT5cbiAgICAgIEBlZGl0b3JDb25maWdDaGFuZ2VkKClcblxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbmZpZy5vYnNlcnZlICdlZGl0b3IubGluZUhlaWdodCcsID0+XG4gICAgICBAZWRpdG9yQ29uZmlnQ2hhbmdlZCgpXG5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb25maWcub2JzZXJ2ZSAncGlnbWVudHMubWFya2VyVHlwZScsICh0eXBlKSA9PlxuICAgICAgQ29sb3JNYXJrZXJFbGVtZW50ID89IHJlcXVpcmUgJy4vY29sb3ItbWFya2VyLWVsZW1lbnQnXG5cbiAgICAgIGlmIENvbG9yTWFya2VyRWxlbWVudDo6cmVuZGVyZXJUeXBlIGlzbnQgdHlwZVxuICAgICAgICBDb2xvck1hcmtlckVsZW1lbnQuc2V0TWFya2VyVHlwZSh0eXBlKVxuXG4gICAgICBpZiBAaXNOYXRpdmVEZWNvcmF0aW9uVHlwZSh0eXBlKVxuICAgICAgICBAaW5pdGlhbGl6ZU5hdGl2ZURlY29yYXRpb25zKHR5cGUpXG4gICAgICBlbHNlXG4gICAgICAgIGlmIHR5cGUgaXMgJ2JhY2tncm91bmQnXG4gICAgICAgICAgQGNsYXNzTGlzdC5hZGQoJ2Fib3ZlLWVkaXRvci1jb250ZW50JylcbiAgICAgICAgZWxzZVxuICAgICAgICAgIEBjbGFzc0xpc3QucmVtb3ZlKCdhYm92ZS1lZGl0b3ItY29udGVudCcpXG5cbiAgICAgICAgQGRlc3Ryb3lOYXRpdmVEZWNvcmF0aW9ucygpXG4gICAgICAgIEB1cGRhdGVNYXJrZXJzKHR5cGUpXG5cbiAgICAgIEBwcmV2aW91c1R5cGUgPSB0eXBlXG5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5zdHlsZXMub25EaWRBZGRTdHlsZUVsZW1lbnQgPT5cbiAgICAgIEBlZGl0b3JDb25maWdDaGFuZ2VkKClcblxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBAZWRpdG9yRWxlbWVudC5vbkRpZEF0dGFjaCA9PiBAYXR0YWNoKClcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgQGVkaXRvckVsZW1lbnQub25EaWREZXRhY2ggPT4gQGRldGFjaCgpXG5cbiAgYXR0YWNoOiAtPlxuICAgIHJldHVybiBpZiBAcGFyZW50Tm9kZT9cbiAgICByZXR1cm4gdW5sZXNzIEBlZGl0b3JFbGVtZW50P1xuICAgIEBnZXRFZGl0b3JSb290KCkucXVlcnlTZWxlY3RvcignLmxpbmVzJyk/LmFwcGVuZENoaWxkKHRoaXMpXG5cbiAgZGV0YWNoOiAtPlxuICAgIHJldHVybiB1bmxlc3MgQHBhcmVudE5vZGU/XG5cbiAgICBAcGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aGlzKVxuXG4gIGRlc3Ryb3k6IC0+XG4gICAgQGRldGFjaCgpXG4gICAgQHN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG5cbiAgICBpZiBAaXNOYXRpdmVEZWNvcmF0aW9uVHlwZSgpXG4gICAgICBAZGVzdHJveU5hdGl2ZURlY29yYXRpb25zKClcbiAgICBlbHNlXG4gICAgICBAcmVsZWFzZUFsbE1hcmtlclZpZXdzKClcblxuICAgIEBjb2xvckJ1ZmZlciA9IG51bGxcblxuICB1cGRhdGU6IC0+XG4gICAgaWYgQHVzZU5hdGl2ZURlY29yYXRpb25zKClcbiAgICAgIGlmIEBpc0d1dHRlclR5cGUoKVxuICAgICAgICBAdXBkYXRlR3V0dGVyRGVjb3JhdGlvbnMoKVxuICAgICAgZWxzZVxuICAgICAgICBAdXBkYXRlSGlnaGxpZ2h0RGVjb3JhdGlvbnMoQHByZXZpb3VzVHlwZSlcbiAgICBlbHNlXG4gICAgICBAdXBkYXRlTWFya2VycygpXG5cbiAgdXBkYXRlU2Nyb2xsOiAtPlxuICAgIGlmIEBlZGl0b3JFbGVtZW50Lmhhc1RpbGVkUmVuZGVyaW5nIGFuZCBub3QgQHVzZU5hdGl2ZURlY29yYXRpb25zKClcbiAgICAgIEBzdHlsZS53ZWJraXRUcmFuc2Zvcm0gPSBcInRyYW5zbGF0ZTNkKCN7LUBlZGl0b3JTY3JvbGxMZWZ0fXB4LCAjey1AZWRpdG9yU2Nyb2xsVG9wfXB4LCAwKVwiXG5cbiAgZ2V0RWRpdG9yUm9vdDogLT4gQGVkaXRvckVsZW1lbnQuc2hhZG93Um9vdCA/IEBlZGl0b3JFbGVtZW50XG5cbiAgZWRpdG9yQ29uZmlnQ2hhbmdlZDogLT5cbiAgICByZXR1cm4gaWYgbm90IEBwYXJlbnROb2RlPyBvciBAdXNlTmF0aXZlRGVjb3JhdGlvbnMoKVxuICAgIEB1c2VkTWFya2Vycy5mb3JFYWNoIChtYXJrZXIpID0+XG4gICAgICBpZiBtYXJrZXIuY29sb3JNYXJrZXI/XG4gICAgICAgIG1hcmtlci5yZW5kZXIoKVxuICAgICAgZWxzZVxuICAgICAgICBjb25zb2xlLndhcm4gXCJBIG1hcmtlciB2aWV3IHdhcyBmb3VuZCBpbiB0aGUgdXNlZCBpbnN0YW5jZSBwb29sIHdoaWxlIGhhdmluZyBhIG51bGwgbW9kZWxcIiwgbWFya2VyXG4gICAgICAgIEByZWxlYXNlTWFya2VyRWxlbWVudChtYXJrZXIpXG5cbiAgICBAdXBkYXRlTWFya2VycygpXG5cbiAgaXNHdXR0ZXJUeXBlOiAodHlwZT1AcHJldmlvdXNUeXBlKSAtPlxuICAgIHR5cGUgaW4gWydndXR0ZXInLCAnbmF0aXZlLWRvdCcsICduYXRpdmUtc3F1YXJlLWRvdCddXG5cbiAgaXNEb3RUeXBlOiAgKHR5cGU9QHByZXZpb3VzVHlwZSkgLT5cbiAgICB0eXBlIGluIFsnbmF0aXZlLWRvdCcsICduYXRpdmUtc3F1YXJlLWRvdCddXG5cbiAgdXNlTmF0aXZlRGVjb3JhdGlvbnM6IC0+XG4gICAgQGlzTmF0aXZlRGVjb3JhdGlvblR5cGUoQHByZXZpb3VzVHlwZSlcblxuICBpc05hdGl2ZURlY29yYXRpb25UeXBlOiAodHlwZSkgLT5cbiAgICBDb2xvck1hcmtlckVsZW1lbnQgPz0gcmVxdWlyZSAnLi9jb2xvci1tYXJrZXItZWxlbWVudCdcblxuICAgIENvbG9yTWFya2VyRWxlbWVudC5pc05hdGl2ZURlY29yYXRpb25UeXBlKHR5cGUpXG5cbiAgaW5pdGlhbGl6ZU5hdGl2ZURlY29yYXRpb25zOiAodHlwZSkgLT5cbiAgICAgIEByZWxlYXNlQWxsTWFya2VyVmlld3MoKVxuICAgICAgQGRlc3Ryb3lOYXRpdmVEZWNvcmF0aW9ucygpXG5cbiAgICAgIGlmIEBpc0d1dHRlclR5cGUodHlwZSlcbiAgICAgICAgQGluaXRpYWxpemVHdXR0ZXIodHlwZSlcbiAgICAgIGVsc2VcbiAgICAgICAgQHVwZGF0ZUhpZ2hsaWdodERlY29yYXRpb25zKHR5cGUpXG5cbiAgZGVzdHJveU5hdGl2ZURlY29yYXRpb25zOiAtPlxuICAgIGlmIEBpc0d1dHRlclR5cGUoKVxuICAgICAgQGRlc3Ryb3lHdXR0ZXIoKVxuICAgIGVsc2VcbiAgICAgIEBkZXN0cm95SGlnaGxpZ2h0RGVjb3JhdGlvbnMoKVxuXG4gICMjICAgIyMgICAgICMjICMjICAjIyMjIyMgICAjIyAgICAgIyMgIyMgICAgICAgIyMgICMjIyMjIyAgICMjICAgICAjIyAjIyMjIyMjI1xuICAjIyAgICMjICAgICAjIyAjIyAjIyAgICAjIyAgIyMgICAgICMjICMjICAgICAgICMjICMjICAgICMjICAjIyAgICAgIyMgICAgIyNcbiAgIyMgICAjIyAgICAgIyMgIyMgIyMgICAgICAgICMjICAgICAjIyAjIyAgICAgICAjIyAjIyAgICAgICAgIyMgICAgICMjICAgICMjXG4gICMjICAgIyMjIyMjIyMjICMjICMjICAgIyMjIyAjIyMjIyMjIyMgIyMgICAgICAgIyMgIyMgICAjIyMjICMjIyMjIyMjIyAgICAjI1xuICAjIyAgICMjICAgICAjIyAjIyAjIyAgICAjIyAgIyMgICAgICMjICMjICAgICAgICMjICMjICAgICMjICAjIyAgICAgIyMgICAgIyNcbiAgIyMgICAjIyAgICAgIyMgIyMgIyMgICAgIyMgICMjICAgICAjIyAjIyAgICAgICAjIyAjIyAgICAjIyAgIyMgICAgICMjICAgICMjXG4gICMjICAgIyMgICAgICMjICMjICAjIyMjIyMgICAjIyAgICAgIyMgIyMjIyMjIyMgIyMgICMjIyMjIyAgICMjICAgICAjIyAgICAjI1xuXG4gIHVwZGF0ZUhpZ2hsaWdodERlY29yYXRpb25zOiAodHlwZSkgLT5cbiAgICByZXR1cm4gaWYgQGVkaXRvci5pc0Rlc3Ryb3llZCgpXG5cbiAgICBAc3R5bGVCeU1hcmtlcklkID89IHt9XG4gICAgQGRlY29yYXRpb25CeU1hcmtlcklkID89IHt9XG5cbiAgICBtYXJrZXJzID0gQGNvbG9yQnVmZmVyLmdldFZhbGlkQ29sb3JNYXJrZXJzKClcblxuICAgIGZvciBtIGluIEBkaXNwbGF5ZWRNYXJrZXJzIHdoZW4gbSBub3QgaW4gbWFya2Vyc1xuICAgICAgQGRlY29yYXRpb25CeU1hcmtlcklkW20uaWRdPy5kZXN0cm95KClcbiAgICAgIEByZW1vdmVDaGlsZChAc3R5bGVCeU1hcmtlcklkW20uaWRdKVxuICAgICAgZGVsZXRlIEBzdHlsZUJ5TWFya2VySWRbbS5pZF1cbiAgICAgIGRlbGV0ZSBAZGVjb3JhdGlvbkJ5TWFya2VySWRbbS5pZF1cblxuICAgIG1hcmtlcnNCeVJvd3MgPSB7fVxuICAgIG1heFJvd0xlbmd0aCA9IDBcblxuICAgIGZvciBtIGluIG1hcmtlcnNcbiAgICAgIGlmIG0uY29sb3I/LmlzVmFsaWQoKSBhbmQgbSBub3QgaW4gQGRpc3BsYXllZE1hcmtlcnNcbiAgICAgICAge2NsYXNzTmFtZSwgc3R5bGV9ID0gQGdldEhpZ2hsaWdoRGVjb3JhdGlvbkNTUyhtLCB0eXBlKVxuICAgICAgICBAYXBwZW5kQ2hpbGQoc3R5bGUpXG4gICAgICAgIEBzdHlsZUJ5TWFya2VySWRbbS5pZF0gPSBzdHlsZVxuICAgICAgICBAZGVjb3JhdGlvbkJ5TWFya2VySWRbbS5pZF0gPSBAZWRpdG9yLmRlY29yYXRlTWFya2VyKG0ubWFya2VyLCB7XG4gICAgICAgICAgdHlwZTogJ2hpZ2hsaWdodCdcbiAgICAgICAgICBjbGFzczogXCJwaWdtZW50cy0je3R5cGV9ICN7Y2xhc3NOYW1lfVwiXG4gICAgICAgICAgaW5jbHVkZU1hcmtlclRleHQ6IHR5cGUgaXMgJ2hpZ2hsaWdodCdcbiAgICAgICAgfSlcblxuICAgIEBkaXNwbGF5ZWRNYXJrZXJzID0gbWFya2Vyc1xuICAgIEBlbWl0dGVyLmVtaXQgJ2RpZC11cGRhdGUnXG5cbiAgZGVzdHJveUhpZ2hsaWdodERlY29yYXRpb25zOiAtPlxuICAgIGZvciBpZCwgZGVjbyBvZiBAZGVjb3JhdGlvbkJ5TWFya2VySWRcbiAgICAgIEByZW1vdmVDaGlsZChAc3R5bGVCeU1hcmtlcklkW2lkXSkgaWYgQHN0eWxlQnlNYXJrZXJJZFtpZF0/XG4gICAgICBkZWNvLmRlc3Ryb3koKVxuXG4gICAgZGVsZXRlIEBkZWNvcmF0aW9uQnlNYXJrZXJJZFxuICAgIGRlbGV0ZSBAc3R5bGVCeU1hcmtlcklkXG4gICAgQGRpc3BsYXllZE1hcmtlcnMgPSBbXVxuXG4gIGdldEhpZ2hsaWdoRGVjb3JhdGlvbkNTUzogKG1hcmtlciwgdHlwZSkgLT5cbiAgICBjbGFzc05hbWUgPSBcInBpZ21lbnRzLWhpZ2hsaWdodC0je25leHRIaWdobGlnaHRJZCsrfVwiXG4gICAgc3R5bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpXG4gICAgbCA9IG1hcmtlci5jb2xvci5sdW1hXG5cbiAgICBpZiB0eXBlIGlzICduYXRpdmUtYmFja2dyb3VuZCdcbiAgICAgIHN0eWxlLmlubmVySFRNTCA9IFwiXCJcIlxuICAgICAgLiN7Y2xhc3NOYW1lfSAucmVnaW9uIHtcbiAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogI3ttYXJrZXIuY29sb3IudG9DU1MoKX07XG4gICAgICAgIGNvbG9yOiAje2lmIGwgPiAwLjQzIHRoZW4gJ2JsYWNrJyBlbHNlICd3aGl0ZSd9O1xuICAgICAgfVxuICAgICAgXCJcIlwiXG4gICAgZWxzZSBpZiB0eXBlIGlzICduYXRpdmUtdW5kZXJsaW5lJ1xuICAgICAgc3R5bGUuaW5uZXJIVE1MID0gXCJcIlwiXG4gICAgICAuI3tjbGFzc05hbWV9IC5yZWdpb24ge1xuICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAje21hcmtlci5jb2xvci50b0NTUygpfTtcbiAgICAgIH1cbiAgICAgIFwiXCJcIlxuICAgIGVsc2UgaWYgdHlwZSBpcyAnbmF0aXZlLW91dGxpbmUnXG4gICAgICBzdHlsZS5pbm5lckhUTUwgPSBcIlwiXCJcbiAgICAgIC4je2NsYXNzTmFtZX0gLnJlZ2lvbiB7XG4gICAgICAgIGJvcmRlci1jb2xvcjogI3ttYXJrZXIuY29sb3IudG9DU1MoKX07XG4gICAgICB9XG4gICAgICBcIlwiXCJcblxuICAgIHtjbGFzc05hbWUsIHN0eWxlfVxuXG4gICMjICAgICAjIyMjIyMgICAjIyAgICAgIyMgIyMjIyMjIyMgIyMjIyMjIyMgIyMjIyMjIyMgIyMjIyMjIyNcbiAgIyMgICAgIyMgICAgIyMgICMjICAgICAjIyAgICAjIyAgICAgICAjIyAgICAjIyAgICAgICAjIyAgICAgIyNcbiAgIyMgICAgIyMgICAgICAgICMjICAgICAjIyAgICAjIyAgICAgICAjIyAgICAjIyAgICAgICAjIyAgICAgIyNcbiAgIyMgICAgIyMgICAjIyMjICMjICAgICAjIyAgICAjIyAgICAgICAjIyAgICAjIyMjIyMgICAjIyMjIyMjI1xuICAjIyAgICAjIyAgICAjIyAgIyMgICAgICMjICAgICMjICAgICAgICMjICAgICMjICAgICAgICMjICAgIyNcbiAgIyMgICAgIyMgICAgIyMgICMjICAgICAjIyAgICAjIyAgICAgICAjIyAgICAjIyAgICAgICAjIyAgICAjI1xuICAjIyAgICAgIyMjIyMjICAgICMjIyMjIyMgICAgICMjICAgICAgICMjICAgICMjIyMjIyMjICMjICAgICAjI1xuXG4gIGluaXRpYWxpemVHdXR0ZXI6ICh0eXBlKSAtPlxuICAgIG9wdGlvbnMgPSBuYW1lOiBcInBpZ21lbnRzLSN7dHlwZX1cIlxuICAgIG9wdGlvbnMucHJpb3JpdHkgPSAxMDAwIGlmIHR5cGUgaXNudCAnZ3V0dGVyJ1xuXG4gICAgQGd1dHRlciA9IEBlZGl0b3IuYWRkR3V0dGVyKG9wdGlvbnMpXG4gICAgQGRpc3BsYXllZE1hcmtlcnMgPSBbXVxuICAgIEBkZWNvcmF0aW9uQnlNYXJrZXJJZCA/PSB7fVxuICAgIGd1dHRlckNvbnRhaW5lciA9IEBnZXRFZGl0b3JSb290KCkucXVlcnlTZWxlY3RvcignLmd1dHRlci1jb250YWluZXInKVxuICAgIEBndXR0ZXJTdWJzY3JpcHRpb24gPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuXG4gICAgQGd1dHRlclN1YnNjcmlwdGlvbi5hZGQgQHN1YnNjcmliZVRvIGd1dHRlckNvbnRhaW5lcixcbiAgICAgIG1vdXNlZG93bjogKGUpID0+XG4gICAgICAgIHRhcmdldERlY29yYXRpb24gPSBlLnBhdGhbMF1cblxuICAgICAgICB1bmxlc3MgdGFyZ2V0RGVjb3JhdGlvbi5tYXRjaGVzKCdzcGFuJylcbiAgICAgICAgICB0YXJnZXREZWNvcmF0aW9uID0gdGFyZ2V0RGVjb3JhdGlvbi5xdWVyeVNlbGVjdG9yKCdzcGFuJylcblxuICAgICAgICByZXR1cm4gdW5sZXNzIHRhcmdldERlY29yYXRpb24/XG5cbiAgICAgICAgbWFya2VySWQgPSB0YXJnZXREZWNvcmF0aW9uLmRhdGFzZXQubWFya2VySWRcbiAgICAgICAgY29sb3JNYXJrZXIgPSBAZGlzcGxheWVkTWFya2Vycy5maWx0ZXIoKG0pIC0+IG0uaWQgaXMgTnVtYmVyKG1hcmtlcklkKSlbMF1cblxuICAgICAgICByZXR1cm4gdW5sZXNzIGNvbG9yTWFya2VyPyBhbmQgQGNvbG9yQnVmZmVyP1xuXG4gICAgICAgIEBjb2xvckJ1ZmZlci5zZWxlY3RDb2xvck1hcmtlckFuZE9wZW5QaWNrZXIoY29sb3JNYXJrZXIpXG5cbiAgICBpZiBAaXNEb3RUeXBlKHR5cGUpXG4gICAgICBAZ3V0dGVyU3Vic2NyaXB0aW9uLmFkZCBAZWRpdG9yLm9uRGlkQ2hhbmdlIChjaGFuZ2VzKSA9PlxuICAgICAgICBpZiBBcnJheS5pc0FycmF5IGNoYW5nZXNcbiAgICAgICAgICBjaGFuZ2VzPy5mb3JFYWNoIChjaGFuZ2UpID0+XG4gICAgICAgICAgICBAdXBkYXRlRG90RGVjb3JhdGlvbnNPZmZzZXRzKGNoYW5nZS5zdGFydC5yb3csIGNoYW5nZS5uZXdFeHRlbnQucm93KVxuICAgICAgICBlbHNlXG4gICAgICAgICAgQHVwZGF0ZURvdERlY29yYXRpb25zT2Zmc2V0cyhjaGFuZ2VzLnN0YXJ0LnJvdywgY2hhbmdlcy5uZXdFeHRlbnQucm93KVxuXG4gICAgQHVwZGF0ZUd1dHRlckRlY29yYXRpb25zKHR5cGUpXG5cbiAgZGVzdHJveUd1dHRlcjogLT5cbiAgICBAZ3V0dGVyLmRlc3Ryb3koKVxuICAgIEBndXR0ZXJTdWJzY3JpcHRpb24uZGlzcG9zZSgpXG4gICAgQGRpc3BsYXllZE1hcmtlcnMgPSBbXVxuICAgIGRlY29yYXRpb24uZGVzdHJveSgpIGZvciBpZCwgZGVjb3JhdGlvbiBvZiBAZGVjb3JhdGlvbkJ5TWFya2VySWRcbiAgICBkZWxldGUgQGRlY29yYXRpb25CeU1hcmtlcklkXG4gICAgZGVsZXRlIEBndXR0ZXJTdWJzY3JpcHRpb25cblxuICB1cGRhdGVHdXR0ZXJEZWNvcmF0aW9uczogKHR5cGU9QHByZXZpb3VzVHlwZSkgLT5cbiAgICByZXR1cm4gaWYgQGVkaXRvci5pc0Rlc3Ryb3llZCgpXG5cbiAgICBtYXJrZXJzID0gQGNvbG9yQnVmZmVyLmdldFZhbGlkQ29sb3JNYXJrZXJzKClcblxuICAgIGZvciBtIGluIEBkaXNwbGF5ZWRNYXJrZXJzIHdoZW4gbSBub3QgaW4gbWFya2Vyc1xuICAgICAgQGRlY29yYXRpb25CeU1hcmtlcklkW20uaWRdPy5kZXN0cm95KClcbiAgICAgIGRlbGV0ZSBAZGVjb3JhdGlvbkJ5TWFya2VySWRbbS5pZF1cblxuICAgIG1hcmtlcnNCeVJvd3MgPSB7fVxuICAgIG1heFJvd0xlbmd0aCA9IDBcblxuICAgIGZvciBtIGluIG1hcmtlcnNcbiAgICAgIGlmIG0uY29sb3I/LmlzVmFsaWQoKSBhbmQgbSBub3QgaW4gQGRpc3BsYXllZE1hcmtlcnNcbiAgICAgICAgQGRlY29yYXRpb25CeU1hcmtlcklkW20uaWRdID0gQGd1dHRlci5kZWNvcmF0ZU1hcmtlcihtLm1hcmtlciwge1xuICAgICAgICAgIHR5cGU6ICdndXR0ZXInXG4gICAgICAgICAgY2xhc3M6ICdwaWdtZW50cy1ndXR0ZXItbWFya2VyJ1xuICAgICAgICAgIGl0ZW06IEBnZXRHdXR0ZXJEZWNvcmF0aW9uSXRlbShtKVxuICAgICAgICB9KVxuXG4gICAgICBkZWNvID0gQGRlY29yYXRpb25CeU1hcmtlcklkW20uaWRdXG4gICAgICByb3cgPSBtLm1hcmtlci5nZXRTdGFydFNjcmVlblBvc2l0aW9uKCkucm93XG4gICAgICBtYXJrZXJzQnlSb3dzW3Jvd10gPz0gMFxuXG4gICAgICByb3dMZW5ndGggPSAwXG5cbiAgICAgIGlmIHR5cGUgaXNudCAnZ3V0dGVyJ1xuICAgICAgICByb3dMZW5ndGggPSBAZWRpdG9yRWxlbWVudC5waXhlbFBvc2l0aW9uRm9yU2NyZWVuUG9zaXRpb24oW3JvdywgSW5maW5pdHldKS5sZWZ0XG5cbiAgICAgIGRlY29XaWR0aCA9IDE0XG5cbiAgICAgIGRlY28ucHJvcGVydGllcy5pdGVtLnN0eWxlLmxlZnQgPSBcIiN7cm93TGVuZ3RoICsgbWFya2Vyc0J5Um93c1tyb3ddICogZGVjb1dpZHRofXB4XCJcblxuICAgICAgbWFya2Vyc0J5Um93c1tyb3ddKytcbiAgICAgIG1heFJvd0xlbmd0aCA9IE1hdGgubWF4KG1heFJvd0xlbmd0aCwgbWFya2Vyc0J5Um93c1tyb3ddKVxuXG4gICAgaWYgdHlwZSBpcyAnZ3V0dGVyJ1xuICAgICAgYXRvbS52aWV3cy5nZXRWaWV3KEBndXR0ZXIpLnN0eWxlLm1pbldpZHRoID0gXCIje21heFJvd0xlbmd0aCAqIGRlY29XaWR0aH1weFwiXG4gICAgZWxzZVxuICAgICAgYXRvbS52aWV3cy5nZXRWaWV3KEBndXR0ZXIpLnN0eWxlLndpZHRoID0gXCIwcHhcIlxuXG4gICAgQGRpc3BsYXllZE1hcmtlcnMgPSBtYXJrZXJzXG4gICAgQGVtaXR0ZXIuZW1pdCAnZGlkLXVwZGF0ZSdcblxuICB1cGRhdGVEb3REZWNvcmF0aW9uc09mZnNldHM6IChyb3dTdGFydCwgcm93RW5kKSAtPlxuICAgIG1hcmtlcnNCeVJvd3MgPSB7fVxuXG4gICAgZm9yIHJvdyBpbiBbcm93U3RhcnQuLnJvd0VuZF1cbiAgICAgIGZvciBtIGluIEBkaXNwbGF5ZWRNYXJrZXJzXG4gICAgICAgIGRlY28gPSBAZGVjb3JhdGlvbkJ5TWFya2VySWRbbS5pZF1cbiAgICAgICAgY29udGludWUgdW5sZXNzIG0ubWFya2VyP1xuICAgICAgICBtYXJrZXJSb3cgPSBtLm1hcmtlci5nZXRTdGFydFNjcmVlblBvc2l0aW9uKCkucm93XG4gICAgICAgIGNvbnRpbnVlIHVubGVzcyByb3cgaXMgbWFya2VyUm93XG5cbiAgICAgICAgbWFya2Vyc0J5Um93c1tyb3ddID89IDBcblxuICAgICAgICByb3dMZW5ndGggPSBAZWRpdG9yRWxlbWVudC5waXhlbFBvc2l0aW9uRm9yU2NyZWVuUG9zaXRpb24oW3JvdywgSW5maW5pdHldKS5sZWZ0XG5cbiAgICAgICAgZGVjb1dpZHRoID0gMTRcblxuICAgICAgICBkZWNvLnByb3BlcnRpZXMuaXRlbS5zdHlsZS5sZWZ0ID0gXCIje3Jvd0xlbmd0aCArIG1hcmtlcnNCeVJvd3Nbcm93XSAqIGRlY29XaWR0aH1weFwiXG4gICAgICAgIG1hcmtlcnNCeVJvd3Nbcm93XSsrXG5cbiAgZ2V0R3V0dGVyRGVjb3JhdGlvbkl0ZW06IChtYXJrZXIpIC0+XG4gICAgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICBkaXYuaW5uZXJIVE1MID0gXCJcIlwiXG4gICAgPHNwYW4gc3R5bGU9J2JhY2tncm91bmQtY29sb3I6ICN7bWFya2VyLmNvbG9yLnRvQ1NTKCl9OycgZGF0YS1tYXJrZXItaWQ9JyN7bWFya2VyLmlkfSc+PC9zcGFuPlxuICAgIFwiXCJcIlxuICAgIGRpdlxuXG4gICMjICAgICMjICAgICAjIyAgICAjIyMgICAgIyMjIyMjIyMgICMjICAgICMjICMjIyMjIyMjICMjIyMjIyMjICAgIyMjIyMjXG4gICMjICAgICMjIyAgICMjIyAgICMjICMjICAgIyMgICAgICMjICMjICAgIyMgICMjICAgICAgICMjICAgICAjIyAjIyAgICAjI1xuICAjIyAgICAjIyMjICMjIyMgICMjICAgIyMgICMjICAgICAjIyAjIyAgIyMgICAjIyAgICAgICAjIyAgICAgIyMgIyNcbiAgIyMgICAgIyMgIyMjICMjICMjICAgICAjIyAjIyMjIyMjIyAgIyMjIyMgICAgIyMjIyMjICAgIyMjIyMjIyMgICAjIyMjIyNcbiAgIyMgICAgIyMgICAgICMjICMjIyMjIyMjIyAjIyAgICMjICAgIyMgICMjICAgIyMgICAgICAgIyMgICAjIyAgICAgICAgICMjXG4gICMjICAgICMjICAgICAjIyAjIyAgICAgIyMgIyMgICAgIyMgICMjICAgIyMgICMjICAgICAgICMjICAgICMjICAjIyAgICAjI1xuICAjIyAgICAjIyAgICAgIyMgIyMgICAgICMjICMjICAgICAjIyAjIyAgICAjIyAjIyMjIyMjIyAjIyAgICAgIyMgICMjIyMjI1xuXG4gIHJlcXVlc3RNYXJrZXJVcGRhdGU6IChtYXJrZXJzKSAtPlxuICAgIGlmIEBmcmFtZVJlcXVlc3RlZFxuICAgICAgQGRpcnR5TWFya2VycyA9IEBkaXJ0eU1hcmtlcnMuY29uY2F0KG1hcmtlcnMpXG4gICAgICByZXR1cm5cbiAgICBlbHNlXG4gICAgICBAZGlydHlNYXJrZXJzID0gbWFya2Vycy5zbGljZSgpXG4gICAgICBAZnJhbWVSZXF1ZXN0ZWQgPSB0cnVlXG5cbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPT5cbiAgICAgIGRpcnR5TWFya2VycyA9IFtdXG4gICAgICBkaXJ0eU1hcmtlcnMucHVzaChtKSBmb3IgbSBpbiBAZGlydHlNYXJrZXJzIHdoZW4gbSBub3QgaW4gZGlydHlNYXJrZXJzXG5cbiAgICAgIGRlbGV0ZSBAZnJhbWVSZXF1ZXN0ZWRcbiAgICAgIGRlbGV0ZSBAZGlydHlNYXJrZXJzXG5cbiAgICAgIHJldHVybiB1bmxlc3MgQGNvbG9yQnVmZmVyP1xuXG4gICAgICBkaXJ0eU1hcmtlcnMuZm9yRWFjaCAobWFya2VyKSAtPiBtYXJrZXIucmVuZGVyKClcblxuICB1cGRhdGVNYXJrZXJzOiAodHlwZT1AcHJldmlvdXNUeXBlKSAtPlxuICAgIHJldHVybiBpZiBAZWRpdG9yLmlzRGVzdHJveWVkKClcblxuICAgIG1hcmtlcnMgPSBAY29sb3JCdWZmZXIuZmluZFZhbGlkQ29sb3JNYXJrZXJzKHtcbiAgICAgIGludGVyc2VjdHNTY3JlZW5Sb3dSYW5nZTogQGVkaXRvckVsZW1lbnQuZ2V0VmlzaWJsZVJvd1JhbmdlPygpID8gQGVkaXRvci5nZXRWaXNpYmxlUm93UmFuZ2U/KClcbiAgICB9KVxuXG4gICAgZm9yIG0gaW4gQGRpc3BsYXllZE1hcmtlcnMgd2hlbiBtIG5vdCBpbiBtYXJrZXJzXG4gICAgICBAcmVsZWFzZU1hcmtlclZpZXcobSlcblxuICAgIGZvciBtIGluIG1hcmtlcnMgd2hlbiBtLmNvbG9yPy5pc1ZhbGlkKCkgYW5kIG0gbm90IGluIEBkaXNwbGF5ZWRNYXJrZXJzXG4gICAgICBAcmVxdWVzdE1hcmtlclZpZXcobSlcblxuICAgIEBkaXNwbGF5ZWRNYXJrZXJzID0gbWFya2Vyc1xuXG4gICAgQGVtaXR0ZXIuZW1pdCAnZGlkLXVwZGF0ZSdcblxuICByZXF1ZXN0TWFya2VyVmlldzogKG1hcmtlcikgLT5cbiAgICBpZiBAdW51c2VkTWFya2Vycy5sZW5ndGhcbiAgICAgIHZpZXcgPSBAdW51c2VkTWFya2Vycy5zaGlmdCgpXG4gICAgZWxzZVxuICAgICAgQ29sb3JNYXJrZXJFbGVtZW50ID89IHJlcXVpcmUgJy4vY29sb3ItbWFya2VyLWVsZW1lbnQnXG5cbiAgICAgIHZpZXcgPSBuZXcgQ29sb3JNYXJrZXJFbGVtZW50XG4gICAgICB2aWV3LnNldENvbnRhaW5lcih0aGlzKVxuICAgICAgdmlldy5vbkRpZFJlbGVhc2UgKHttYXJrZXJ9KSA9PlxuICAgICAgICBAZGlzcGxheWVkTWFya2Vycy5zcGxpY2UoQGRpc3BsYXllZE1hcmtlcnMuaW5kZXhPZihtYXJrZXIpLCAxKVxuICAgICAgICBAcmVsZWFzZU1hcmtlclZpZXcobWFya2VyKVxuICAgICAgQHNoYWRvd1Jvb3QuYXBwZW5kQ2hpbGQgdmlld1xuXG4gICAgdmlldy5zZXRNb2RlbChtYXJrZXIpXG5cbiAgICBAaGlkZU1hcmtlcklmSW5TZWxlY3Rpb25PckZvbGQobWFya2VyLCB2aWV3KVxuICAgIEB1c2VkTWFya2Vycy5wdXNoKHZpZXcpXG4gICAgQHZpZXdzQnlNYXJrZXJzLnNldChtYXJrZXIsIHZpZXcpXG4gICAgdmlld1xuXG4gIHJlbGVhc2VNYXJrZXJWaWV3OiAobWFya2VyT3JWaWV3KSAtPlxuICAgIG1hcmtlciA9IG1hcmtlck9yVmlld1xuICAgIHZpZXcgPSBAdmlld3NCeU1hcmtlcnMuZ2V0KG1hcmtlck9yVmlldylcblxuICAgIGlmIHZpZXc/XG4gICAgICBAdmlld3NCeU1hcmtlcnMuZGVsZXRlKG1hcmtlcikgaWYgbWFya2VyP1xuICAgICAgQHJlbGVhc2VNYXJrZXJFbGVtZW50KHZpZXcpXG5cbiAgcmVsZWFzZU1hcmtlckVsZW1lbnQ6ICh2aWV3KSAtPlxuICAgIEB1c2VkTWFya2Vycy5zcGxpY2UoQHVzZWRNYXJrZXJzLmluZGV4T2YodmlldyksIDEpXG4gICAgdmlldy5yZWxlYXNlKGZhbHNlKSB1bmxlc3Mgdmlldy5pc1JlbGVhc2VkKClcbiAgICBAdW51c2VkTWFya2Vycy5wdXNoKHZpZXcpXG5cbiAgcmVsZWFzZUFsbE1hcmtlclZpZXdzOiAtPlxuICAgIHZpZXcuZGVzdHJveSgpIGZvciB2aWV3IGluIEB1c2VkTWFya2Vyc1xuICAgIHZpZXcuZGVzdHJveSgpIGZvciB2aWV3IGluIEB1bnVzZWRNYXJrZXJzXG5cbiAgICBAdXNlZE1hcmtlcnMgPSBbXVxuICAgIEB1bnVzZWRNYXJrZXJzID0gW11cblxuICAgIEFycmF5Ojpmb3JFYWNoLmNhbGwgQHNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvckFsbCgncGlnbWVudHMtY29sb3ItbWFya2VyJyksIChlbCkgLT4gZWwucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChlbClcblxuICAjIyAgICAgIyMjIyMjICAjIyMjIyMjIyAjIyAgICAgICAjIyMjIyMjIyAgIyMjIyMjICAjIyMjIyMjI1xuICAjIyAgICAjIyAgICAjIyAjIyAgICAgICAjIyAgICAgICAjIyAgICAgICAjIyAgICAjIyAgICAjI1xuICAjIyAgICAjIyAgICAgICAjIyAgICAgICAjIyAgICAgICAjIyAgICAgICAjIyAgICAgICAgICAjI1xuICAjIyAgICAgIyMjIyMjICAjIyMjIyMgICAjIyAgICAgICAjIyMjIyMgICAjIyAgICAgICAgICAjI1xuICAjIyAgICAgICAgICAjIyAjIyAgICAgICAjIyAgICAgICAjIyAgICAgICAjIyAgICAgICAgICAjI1xuICAjIyAgICAjIyAgICAjIyAjIyAgICAgICAjIyAgICAgICAjIyAgICAgICAjIyAgICAjIyAgICAjI1xuICAjIyAgICAgIyMjIyMjICAjIyMjIyMjIyAjIyMjIyMjIyAjIyMjIyMjIyAgIyMjIyMjICAgICAjI1xuXG4gIHJlcXVlc3RTZWxlY3Rpb25VcGRhdGU6IC0+XG4gICAgcmV0dXJuIGlmIEB1cGRhdGVSZXF1ZXN0ZWRcblxuICAgIEB1cGRhdGVSZXF1ZXN0ZWQgPSB0cnVlXG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lID0+XG4gICAgICBAdXBkYXRlUmVxdWVzdGVkID0gZmFsc2VcbiAgICAgIHJldHVybiBpZiBAZWRpdG9yLmdldEJ1ZmZlcigpLmlzRGVzdHJveWVkKClcbiAgICAgIEB1cGRhdGVTZWxlY3Rpb25zKClcblxuICB1cGRhdGVTZWxlY3Rpb25zOiAtPlxuICAgIHJldHVybiBpZiBAZWRpdG9yLmlzRGVzdHJveWVkKClcbiAgICBpZiBAdXNlTmF0aXZlRGVjb3JhdGlvbnMoKVxuICAgICAgZm9yIG1hcmtlciBpbiBAZGlzcGxheWVkTWFya2Vyc1xuICAgICAgICBkZWNvcmF0aW9uID0gQGRlY29yYXRpb25CeU1hcmtlcklkW21hcmtlci5pZF1cblxuICAgICAgICBAaGlkZURlY29yYXRpb25JZkluU2VsZWN0aW9uKG1hcmtlciwgZGVjb3JhdGlvbikgaWYgZGVjb3JhdGlvbj9cbiAgICBlbHNlXG4gICAgICBmb3IgbWFya2VyIGluIEBkaXNwbGF5ZWRNYXJrZXJzXG4gICAgICAgIHZpZXcgPSBAdmlld3NCeU1hcmtlcnMuZ2V0KG1hcmtlcilcbiAgICAgICAgaWYgdmlldz9cbiAgICAgICAgICB2aWV3LmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpXG4gICAgICAgICAgdmlldy5jbGFzc0xpc3QucmVtb3ZlKCdpbi1mb2xkJylcbiAgICAgICAgICBAaGlkZU1hcmtlcklmSW5TZWxlY3Rpb25PckZvbGQobWFya2VyLCB2aWV3KVxuICAgICAgICBlbHNlXG4gICAgICAgICAgY29uc29sZS53YXJuIFwiQSBjb2xvciBtYXJrZXIgd2FzIGZvdW5kIGluIHRoZSBkaXNwbGF5ZWQgbWFya2VycyBhcnJheSB3aXRob3V0IGFuIGFzc29jaWF0ZWQgdmlld1wiLCBtYXJrZXJcblxuICBoaWRlRGVjb3JhdGlvbklmSW5TZWxlY3Rpb246IChtYXJrZXIsIGRlY29yYXRpb24pIC0+XG4gICAgc2VsZWN0aW9ucyA9IEBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpXG5cbiAgICBwcm9wcyA9IGRlY29yYXRpb24uZ2V0UHJvcGVydGllcygpXG4gICAgY2xhc3NlcyA9IHByb3BzLmNsYXNzLnNwbGl0KC9cXHMrL2cpXG5cbiAgICBmb3Igc2VsZWN0aW9uIGluIHNlbGVjdGlvbnNcbiAgICAgIHJhbmdlID0gc2VsZWN0aW9uLmdldFNjcmVlblJhbmdlKClcbiAgICAgIG1hcmtlclJhbmdlID0gbWFya2VyLmdldFNjcmVlblJhbmdlKClcblxuICAgICAgY29udGludWUgdW5sZXNzIG1hcmtlclJhbmdlPyBhbmQgcmFuZ2U/XG4gICAgICBpZiBtYXJrZXJSYW5nZS5pbnRlcnNlY3RzV2l0aChyYW5nZSlcbiAgICAgICAgY2xhc3Nlc1swXSArPSAnLWluLXNlbGVjdGlvbicgdW5sZXNzIGNsYXNzZXNbMF0ubWF0Y2goLy1pbi1zZWxlY3Rpb24kLyk/XG4gICAgICAgIHByb3BzLmNsYXNzID0gY2xhc3Nlcy5qb2luKCcgJylcbiAgICAgICAgZGVjb3JhdGlvbi5zZXRQcm9wZXJ0aWVzKHByb3BzKVxuICAgICAgICByZXR1cm5cblxuICAgIGNsYXNzZXMgPSBjbGFzc2VzLm1hcCAoY2xzKSAtPiBjbHMucmVwbGFjZSgnLWluLXNlbGVjdGlvbicsICcnKVxuICAgIHByb3BzLmNsYXNzID0gY2xhc3Nlcy5qb2luKCcgJylcbiAgICBkZWNvcmF0aW9uLnNldFByb3BlcnRpZXMocHJvcHMpXG5cbiAgaGlkZU1hcmtlcklmSW5TZWxlY3Rpb25PckZvbGQ6IChtYXJrZXIsIHZpZXcpIC0+XG4gICAgc2VsZWN0aW9ucyA9IEBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpXG5cbiAgICBmb3Igc2VsZWN0aW9uIGluIHNlbGVjdGlvbnNcbiAgICAgIHJhbmdlID0gc2VsZWN0aW9uLmdldFNjcmVlblJhbmdlKClcbiAgICAgIG1hcmtlclJhbmdlID0gbWFya2VyLmdldFNjcmVlblJhbmdlKClcblxuICAgICAgY29udGludWUgdW5sZXNzIG1hcmtlclJhbmdlPyBhbmQgcmFuZ2U/XG5cbiAgICAgIHZpZXcuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJykgaWYgbWFya2VyUmFuZ2UuaW50ZXJzZWN0c1dpdGgocmFuZ2UpXG4gICAgICB2aWV3LmNsYXNzTGlzdC5hZGQoJ2luLWZvbGQnKSBpZiAgQGVkaXRvci5pc0ZvbGRlZEF0QnVmZmVyUm93KG1hcmtlci5nZXRCdWZmZXJSYW5nZSgpLnN0YXJ0LnJvdylcblxuICAjIyAgICAgIyMjIyMjICAgIyMjIyMjIyAgIyMgICAgIyMgIyMjIyMjIyMgIyMjIyMjIyMgIyMgICAgICMjICMjIyMjIyMjXG4gICMjICAgICMjICAgICMjICMjICAgICAjIyAjIyMgICAjIyAgICAjIyAgICAjIyAgICAgICAgIyMgICAjIyAgICAgIyNcbiAgIyMgICAgIyMgICAgICAgIyMgICAgICMjICMjIyMgICMjICAgICMjICAgICMjICAgICAgICAgIyMgIyMgICAgICAjI1xuICAjIyAgICAjIyAgICAgICAjIyAgICAgIyMgIyMgIyMgIyMgICAgIyMgICAgIyMjIyMjICAgICAgIyMjICAgICAgICMjXG4gICMjICAgICMjICAgICAgICMjICAgICAjIyAjIyAgIyMjIyAgICAjIyAgICAjIyAgICAgICAgICMjICMjICAgICAgIyNcbiAgIyMgICAgIyMgICAgIyMgIyMgICAgICMjICMjICAgIyMjICAgICMjICAgICMjICAgICAgICAjIyAgICMjICAgICAjI1xuICAjIyAgICAgIyMjIyMjICAgIyMjIyMjIyAgIyMgICAgIyMgICAgIyMgICAgIyMjIyMjIyMgIyMgICAgICMjICAgICMjXG4gICMjXG4gICMjICAgICMjICAgICAjIyAjIyMjIyMjIyAjIyAgICAjIyAjIyAgICAgIyNcbiAgIyMgICAgIyMjICAgIyMjICMjICAgICAgICMjIyAgICMjICMjICAgICAjI1xuICAjIyAgICAjIyMjICMjIyMgIyMgICAgICAgIyMjIyAgIyMgIyMgICAgICMjXG4gICMjICAgICMjICMjIyAjIyAjIyMjIyMgICAjIyAjIyAjIyAjIyAgICAgIyNcbiAgIyMgICAgIyMgICAgICMjICMjICAgICAgICMjICAjIyMjICMjICAgICAjI1xuICAjIyAgICAjIyAgICAgIyMgIyMgICAgICAgIyMgICAjIyMgIyMgICAgICMjXG4gICMjICAgICMjICAgICAjIyAjIyMjIyMjIyAjIyAgICAjIyAgIyMjIyMjI1xuXG4gIGNvbG9yTWFya2VyRm9yTW91c2VFdmVudDogKGV2ZW50KSAtPlxuICAgIHBvc2l0aW9uID0gQHNjcmVlblBvc2l0aW9uRm9yTW91c2VFdmVudChldmVudClcblxuICAgIHJldHVybiB1bmxlc3MgcG9zaXRpb24/XG5cbiAgICBidWZmZXJQb3NpdGlvbiA9IEBjb2xvckJ1ZmZlci5lZGl0b3IuYnVmZmVyUG9zaXRpb25Gb3JTY3JlZW5Qb3NpdGlvbihwb3NpdGlvbilcblxuICAgIEBjb2xvckJ1ZmZlci5nZXRDb2xvck1hcmtlckF0QnVmZmVyUG9zaXRpb24oYnVmZmVyUG9zaXRpb24pXG5cbiAgc2NyZWVuUG9zaXRpb25Gb3JNb3VzZUV2ZW50OiAoZXZlbnQpIC0+XG4gICAgcGl4ZWxQb3NpdGlvbiA9IEBwaXhlbFBvc2l0aW9uRm9yTW91c2VFdmVudChldmVudClcblxuICAgIHJldHVybiB1bmxlc3MgcGl4ZWxQb3NpdGlvbj9cblxuICAgIGlmIEBlZGl0b3JFbGVtZW50LnNjcmVlblBvc2l0aW9uRm9yUGl4ZWxQb3NpdGlvbj9cbiAgICAgIEBlZGl0b3JFbGVtZW50LnNjcmVlblBvc2l0aW9uRm9yUGl4ZWxQb3NpdGlvbihwaXhlbFBvc2l0aW9uKVxuICAgIGVsc2VcbiAgICAgIEBlZGl0b3Iuc2NyZWVuUG9zaXRpb25Gb3JQaXhlbFBvc2l0aW9uKHBpeGVsUG9zaXRpb24pXG5cbiAgcGl4ZWxQb3NpdGlvbkZvck1vdXNlRXZlbnQ6IChldmVudCkgLT5cbiAgICB7Y2xpZW50WCwgY2xpZW50WX0gPSBldmVudFxuXG4gICAgc2Nyb2xsVGFyZ2V0ID0gaWYgQGVkaXRvckVsZW1lbnQuZ2V0U2Nyb2xsVG9wP1xuICAgICAgQGVkaXRvckVsZW1lbnRcbiAgICBlbHNlXG4gICAgICBAZWRpdG9yXG5cbiAgICByb290RWxlbWVudCA9IEBnZXRFZGl0b3JSb290KClcblxuICAgIHJldHVybiB1bmxlc3Mgcm9vdEVsZW1lbnQucXVlcnlTZWxlY3RvcignLmxpbmVzJyk/XG5cbiAgICB7dG9wLCBsZWZ0fSA9IHJvb3RFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5saW5lcycpLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgdG9wID0gY2xpZW50WSAtIHRvcCArIHNjcm9sbFRhcmdldC5nZXRTY3JvbGxUb3AoKVxuICAgIGxlZnQgPSBjbGllbnRYIC0gbGVmdCArIHNjcm9sbFRhcmdldC5nZXRTY3JvbGxMZWZ0KClcbiAgICB7dG9wLCBsZWZ0fVxuXG5tb2R1bGUuZXhwb3J0cyA9XG5Db2xvckJ1ZmZlckVsZW1lbnQgPVxucmVnaXN0ZXJPclVwZGF0ZUVsZW1lbnQgJ3BpZ21lbnRzLW1hcmtlcnMnLCBDb2xvckJ1ZmZlckVsZW1lbnQucHJvdG90eXBlXG4iXX0=
