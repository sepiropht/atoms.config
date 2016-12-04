(function() {
  var $, CompositeDisposable, Emitter, InputDialog, PlatformIOTerminalView, Pty, Task, Terminal, View, lastActiveElement, lastOpenedView, os, path, ref, ref1,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ref = require('atom'), Task = ref.Task, CompositeDisposable = ref.CompositeDisposable, Emitter = ref.Emitter;

  ref1 = require('atom-space-pen-views'), $ = ref1.$, View = ref1.View;

  Pty = require.resolve('./process');

  Terminal = require('term.js');

  InputDialog = null;

  path = require('path');

  os = require('os');

  lastOpenedView = null;

  lastActiveElement = null;

  module.exports = PlatformIOTerminalView = (function(superClass) {
    extend(PlatformIOTerminalView, superClass);

    function PlatformIOTerminalView() {
      this.blurTerminal = bind(this.blurTerminal, this);
      this.focusTerminal = bind(this.focusTerminal, this);
      this.blur = bind(this.blur, this);
      this.focus = bind(this.focus, this);
      this.resizePanel = bind(this.resizePanel, this);
      this.resizeStopped = bind(this.resizeStopped, this);
      this.resizeStarted = bind(this.resizeStarted, this);
      this.onWindowResize = bind(this.onWindowResize, this);
      this.hide = bind(this.hide, this);
      this.open = bind(this.open, this);
      this.recieveItemOrFile = bind(this.recieveItemOrFile, this);
      this.setAnimationSpeed = bind(this.setAnimationSpeed, this);
      return PlatformIOTerminalView.__super__.constructor.apply(this, arguments);
    }

    PlatformIOTerminalView.prototype.animating = false;

    PlatformIOTerminalView.prototype.id = '';

    PlatformIOTerminalView.prototype.maximized = false;

    PlatformIOTerminalView.prototype.opened = false;

    PlatformIOTerminalView.prototype.pwd = '';

    PlatformIOTerminalView.prototype.windowHeight = $(window).height();

    PlatformIOTerminalView.prototype.rowHeight = 20;

    PlatformIOTerminalView.prototype.shell = '';

    PlatformIOTerminalView.prototype.tabView = false;

    PlatformIOTerminalView.content = function() {
      return this.div({
        "class": 'platformio-ide-terminal terminal-view',
        outlet: 'platformIOTerminalView'
      }, (function(_this) {
        return function() {
          _this.div({
            "class": 'panel-divider',
            outlet: 'panelDivider'
          });
          _this.div({
            "class": 'btn-toolbar',
            outlet: 'toolbar'
          }, function() {
            _this.button({
              outlet: 'closeBtn',
              "class": 'btn inline-block-tight right',
              click: 'destroy'
            }, function() {
              return _this.span({
                "class": 'icon icon-x'
              });
            });
            _this.button({
              outlet: 'hideBtn',
              "class": 'btn inline-block-tight right',
              click: 'hide'
            }, function() {
              return _this.span({
                "class": 'icon icon-chevron-down'
              });
            });
            _this.button({
              outlet: 'maximizeBtn',
              "class": 'btn inline-block-tight right',
              click: 'maximize'
            }, function() {
              return _this.span({
                "class": 'icon icon-screen-full'
              });
            });
            return _this.button({
              outlet: 'inputBtn',
              "class": 'btn inline-block-tight left',
              click: 'inputDialog'
            }, function() {
              return _this.span({
                "class": 'icon icon-keyboard'
              });
            });
          });
          return _this.div({
            "class": 'xterm',
            outlet: 'xterm'
          });
        };
      })(this));
    };

    PlatformIOTerminalView.getFocusedTerminal = function() {
      return Terminal.Terminal.focus;
    };

    PlatformIOTerminalView.prototype.initialize = function(id, pwd, statusIcon, statusBar, shell, args, autoRun) {
      var bottomHeight, override, percent;
      this.id = id;
      this.pwd = pwd;
      this.statusIcon = statusIcon;
      this.statusBar = statusBar;
      this.shell = shell;
      this.args = args != null ? args : [];
      this.autoRun = autoRun != null ? autoRun : [];
      this.subscriptions = new CompositeDisposable;
      this.emitter = new Emitter;
      this.subscriptions.add(atom.tooltips.add(this.closeBtn, {
        title: 'Close'
      }));
      this.subscriptions.add(atom.tooltips.add(this.hideBtn, {
        title: 'Hide'
      }));
      this.subscriptions.add(this.maximizeBtn.tooltip = atom.tooltips.add(this.maximizeBtn, {
        title: 'Fullscreen'
      }));
      this.inputBtn.tooltip = atom.tooltips.add(this.inputBtn, {
        title: 'Insert Text'
      });
      this.prevHeight = atom.config.get('platformio-ide-terminal.style.defaultPanelHeight');
      if (this.prevHeight.indexOf('%') > 0) {
        percent = Math.abs(Math.min(parseFloat(this.prevHeight) / 100.0, 1));
        bottomHeight = $('atom-panel.bottom').children(".terminal-view").height() || 0;
        this.prevHeight = percent * ($('.item-views').height() + bottomHeight);
      }
      this.xterm.height(0);
      this.setAnimationSpeed();
      this.subscriptions.add(atom.config.onDidChange('platformio-ide-terminal.style.animationSpeed', this.setAnimationSpeed));
      override = function(event) {
        if (event.originalEvent.dataTransfer.getData('platformio-ide-terminal') === 'true') {
          return;
        }
        event.preventDefault();
        return event.stopPropagation();
      };
      this.xterm.on('mouseup', (function(_this) {
        return function(event) {
          var text;
          if (event.which !== 3) {
            text = window.getSelection().toString();
            if (!text) {
              return _this.focus();
            }
          }
        };
      })(this));
      this.xterm.on('dragenter', override);
      this.xterm.on('dragover', override);
      this.xterm.on('drop', this.recieveItemOrFile);
      this.on('focus', this.focus);
      return this.subscriptions.add({
        dispose: (function(_this) {
          return function() {
            return _this.off('focus', _this.focus);
          };
        })(this)
      });
    };

    PlatformIOTerminalView.prototype.attach = function() {
      if (this.panel != null) {
        return;
      }
      return this.panel = atom.workspace.addBottomPanel({
        item: this,
        visible: false
      });
    };

    PlatformIOTerminalView.prototype.setAnimationSpeed = function() {
      this.animationSpeed = atom.config.get('platformio-ide-terminal.style.animationSpeed');
      if (this.animationSpeed === 0) {
        this.animationSpeed = 100;
      }
      return this.xterm.css('transition', "height " + (0.25 / this.animationSpeed) + "s linear");
    };

    PlatformIOTerminalView.prototype.recieveItemOrFile = function(event) {
      var dataTransfer, file, filePath, i, len, ref2, results;
      event.preventDefault();
      event.stopPropagation();
      dataTransfer = event.originalEvent.dataTransfer;
      if (dataTransfer.getData('atom-event') === 'true') {
        filePath = dataTransfer.getData('text/plain');
        if (filePath) {
          return this.input(filePath + " ");
        }
      } else if (filePath = dataTransfer.getData('initialPath')) {
        return this.input(filePath + " ");
      } else if (dataTransfer.files.length > 0) {
        ref2 = dataTransfer.files;
        results = [];
        for (i = 0, len = ref2.length; i < len; i++) {
          file = ref2[i];
          results.push(this.input(file.path + " "));
        }
        return results;
      }
    };

    PlatformIOTerminalView.prototype.forkPtyProcess = function() {
      return Task.once(Pty, path.resolve(this.pwd), this.shell, this.args, (function(_this) {
        return function() {
          _this.input = function() {};
          return _this.resize = function() {};
        };
      })(this));
    };

    PlatformIOTerminalView.prototype.getId = function() {
      return this.id;
    };

    PlatformIOTerminalView.prototype.displayTerminal = function() {
      var cols, ref2, rows;
      ref2 = this.getDimensions(), cols = ref2.cols, rows = ref2.rows;
      this.ptyProcess = this.forkPtyProcess();
      this.terminal = new Terminal({
        cursorBlink: false,
        scrollback: atom.config.get('platformio-ide-terminal.core.scrollback'),
        cols: cols,
        rows: rows
      });
      this.attachListeners();
      this.attachResizeEvents();
      this.attachWindowEvents();
      return this.terminal.open(this.xterm.get(0));
    };

    PlatformIOTerminalView.prototype.attachListeners = function() {
      this.ptyProcess.on("platformio-ide-terminal:data", (function(_this) {
        return function(data) {
          return _this.terminal.write(data);
        };
      })(this));
      this.ptyProcess.on("platformio-ide-terminal:exit", (function(_this) {
        return function() {
          if (atom.config.get('platformio-ide-terminal.toggles.autoClose')) {
            return _this.destroy();
          }
        };
      })(this));
      this.terminal.end = (function(_this) {
        return function() {
          return _this.destroy();
        };
      })(this);
      this.terminal.on("data", (function(_this) {
        return function(data) {
          return _this.input(data);
        };
      })(this));
      this.ptyProcess.on("platformio-ide-terminal:title", (function(_this) {
        return function(title) {
          return _this.process = title;
        };
      })(this));
      this.terminal.on("title", (function(_this) {
        return function(title) {
          return _this.title = title;
        };
      })(this));
      return this.terminal.once("open", (function(_this) {
        return function() {
          var autoRunCommand, command, i, len, ref2, results;
          _this.applyStyle();
          _this.resizeTerminalToView();
          if (_this.ptyProcess.childProcess == null) {
            return;
          }
          autoRunCommand = atom.config.get('platformio-ide-terminal.core.autoRunCommand');
          if (autoRunCommand) {
            _this.input("" + autoRunCommand + os.EOL);
          }
          ref2 = _this.autoRun;
          results = [];
          for (i = 0, len = ref2.length; i < len; i++) {
            command = ref2[i];
            results.push(_this.input("" + command + os.EOL));
          }
          return results;
        };
      })(this));
    };

    PlatformIOTerminalView.prototype.destroy = function() {
      var ref2, ref3;
      this.subscriptions.dispose();
      this.statusIcon.destroy();
      this.statusBar.removeTerminalView(this);
      this.detachResizeEvents();
      this.detachWindowEvents();
      if (this.panel.isVisible()) {
        this.hide();
        this.onTransitionEnd((function(_this) {
          return function() {
            return _this.panel.destroy();
          };
        })(this));
      } else {
        this.panel.destroy();
      }
      if (this.statusIcon && this.statusIcon.parentNode) {
        this.statusIcon.parentNode.removeChild(this.statusIcon);
      }
      if ((ref2 = this.ptyProcess) != null) {
        ref2.terminate();
      }
      return (ref3 = this.terminal) != null ? ref3.destroy() : void 0;
    };

    PlatformIOTerminalView.prototype.maximize = function() {
      var btn;
      this.subscriptions.remove(this.maximizeBtn.tooltip);
      this.maximizeBtn.tooltip.dispose();
      this.maxHeight = this.prevHeight + $('.item-views').height();
      btn = this.maximizeBtn.children('span');
      this.onTransitionEnd((function(_this) {
        return function() {
          return _this.focus();
        };
      })(this));
      if (this.maximized) {
        this.maximizeBtn.tooltip = atom.tooltips.add(this.maximizeBtn, {
          title: 'Fullscreen'
        });
        this.subscriptions.add(this.maximizeBtn.tooltip);
        this.adjustHeight(this.prevHeight);
        btn.removeClass('icon-screen-normal').addClass('icon-screen-full');
        return this.maximized = false;
      } else {
        this.maximizeBtn.tooltip = atom.tooltips.add(this.maximizeBtn, {
          title: 'Normal'
        });
        this.subscriptions.add(this.maximizeBtn.tooltip);
        this.adjustHeight(this.maxHeight);
        btn.removeClass('icon-screen-full').addClass('icon-screen-normal');
        return this.maximized = true;
      }
    };

    PlatformIOTerminalView.prototype.open = function() {
      var icon;
      if (lastActiveElement == null) {
        lastActiveElement = $(document.activeElement);
      }
      if (lastOpenedView && lastOpenedView !== this) {
        if (lastOpenedView.maximized) {
          this.subscriptions.remove(this.maximizeBtn.tooltip);
          this.maximizeBtn.tooltip.dispose();
          icon = this.maximizeBtn.children('span');
          this.maxHeight = lastOpenedView.maxHeight;
          this.maximizeBtn.tooltip = atom.tooltips.add(this.maximizeBtn, {
            title: 'Normal'
          });
          this.subscriptions.add(this.maximizeBtn.tooltip);
          icon.removeClass('icon-screen-full').addClass('icon-screen-normal');
          this.maximized = true;
        }
        lastOpenedView.hide();
      }
      lastOpenedView = this;
      this.statusBar.setActiveTerminalView(this);
      this.statusIcon.activate();
      this.onTransitionEnd((function(_this) {
        return function() {
          if (!_this.opened) {
            _this.opened = true;
            _this.displayTerminal();
            _this.prevHeight = _this.nearestRow(_this.xterm.height());
            return _this.xterm.height(_this.prevHeight);
          } else {
            return _this.focus();
          }
        };
      })(this));
      this.panel.show();
      this.xterm.height(0);
      this.animating = true;
      return this.xterm.height(this.maximized ? this.maxHeight : this.prevHeight);
    };

    PlatformIOTerminalView.prototype.hide = function() {
      var ref2;
      if ((ref2 = this.terminal) != null) {
        ref2.blur();
      }
      lastOpenedView = null;
      this.statusIcon.deactivate();
      this.onTransitionEnd((function(_this) {
        return function() {
          _this.panel.hide();
          if (lastOpenedView == null) {
            if (lastActiveElement != null) {
              lastActiveElement.focus();
              return lastActiveElement = null;
            }
          }
        };
      })(this));
      this.xterm.height(this.maximized ? this.maxHeight : this.prevHeight);
      this.animating = true;
      return this.xterm.height(0);
    };

    PlatformIOTerminalView.prototype.toggle = function() {
      if (this.animating) {
        return;
      }
      if (this.panel.isVisible()) {
        return this.hide();
      } else {
        return this.open();
      }
    };

    PlatformIOTerminalView.prototype.input = function(data) {
      if (this.ptyProcess.childProcess == null) {
        return;
      }
      this.terminal.stopScrolling();
      return this.ptyProcess.send({
        event: 'input',
        text: data
      });
    };

    PlatformIOTerminalView.prototype.resize = function(cols, rows) {
      if (this.ptyProcess.childProcess == null) {
        return;
      }
      return this.ptyProcess.send({
        event: 'resize',
        rows: rows,
        cols: cols
      });
    };

    PlatformIOTerminalView.prototype.applyStyle = function() {
      var config, defaultFont, editorFont, editorFontSize, overrideFont, overrideFontSize, ref2, ref3;
      config = atom.config.get('platformio-ide-terminal');
      this.xterm.addClass(config.style.theme);
      if (config.toggles.cursorBlink) {
        this.xterm.addClass('cursor-blink');
      }
      editorFont = atom.config.get('editor.fontFamily');
      defaultFont = "Menlo, Consolas, 'DejaVu Sans Mono', monospace";
      overrideFont = config.style.fontFamily;
      this.terminal.element.style.fontFamily = overrideFont || editorFont || defaultFont;
      this.subscriptions.add(atom.config.onDidChange('editor.fontFamily', (function(_this) {
        return function(event) {
          editorFont = event.newValue;
          return _this.terminal.element.style.fontFamily = overrideFont || editorFont || defaultFont;
        };
      })(this)));
      this.subscriptions.add(atom.config.onDidChange('platformio-ide-terminal.style.fontFamily', (function(_this) {
        return function(event) {
          overrideFont = event.newValue;
          return _this.terminal.element.style.fontFamily = overrideFont || editorFont || defaultFont;
        };
      })(this)));
      editorFontSize = atom.config.get('editor.fontSize');
      overrideFontSize = config.style.fontSize;
      this.terminal.element.style.fontSize = (overrideFontSize || editorFontSize) + "px";
      this.subscriptions.add(atom.config.onDidChange('editor.fontSize', (function(_this) {
        return function(event) {
          editorFontSize = event.newValue;
          _this.terminal.element.style.fontSize = (overrideFontSize || editorFontSize) + "px";
          return _this.resizeTerminalToView();
        };
      })(this)));
      this.subscriptions.add(atom.config.onDidChange('platformio-ide-terminal.style.fontSize', (function(_this) {
        return function(event) {
          overrideFontSize = event.newValue;
          _this.terminal.element.style.fontSize = (overrideFontSize || editorFontSize) + "px";
          return _this.resizeTerminalToView();
        };
      })(this)));
      [].splice.apply(this.terminal.colors, [0, 8].concat(ref2 = [config.ansiColors.normal.black.toHexString(), config.ansiColors.normal.red.toHexString(), config.ansiColors.normal.green.toHexString(), config.ansiColors.normal.yellow.toHexString(), config.ansiColors.normal.blue.toHexString(), config.ansiColors.normal.magenta.toHexString(), config.ansiColors.normal.cyan.toHexString(), config.ansiColors.normal.white.toHexString()])), ref2;
      return ([].splice.apply(this.terminal.colors, [8, 8].concat(ref3 = [config.ansiColors.zBright.brightBlack.toHexString(), config.ansiColors.zBright.brightRed.toHexString(), config.ansiColors.zBright.brightGreen.toHexString(), config.ansiColors.zBright.brightYellow.toHexString(), config.ansiColors.zBright.brightBlue.toHexString(), config.ansiColors.zBright.brightMagenta.toHexString(), config.ansiColors.zBright.brightCyan.toHexString(), config.ansiColors.zBright.brightWhite.toHexString()])), ref3);
    };

    PlatformIOTerminalView.prototype.attachWindowEvents = function() {
      return $(window).on('resize', this.onWindowResize);
    };

    PlatformIOTerminalView.prototype.detachWindowEvents = function() {
      return $(window).off('resize', this.onWindowResize);
    };

    PlatformIOTerminalView.prototype.attachResizeEvents = function() {
      return this.panelDivider.on('mousedown', this.resizeStarted);
    };

    PlatformIOTerminalView.prototype.detachResizeEvents = function() {
      return this.panelDivider.off('mousedown');
    };

    PlatformIOTerminalView.prototype.onWindowResize = function() {
      var bottomPanel, clamped, delta, newHeight, overflow;
      if (!this.tabView) {
        this.xterm.css('transition', '');
        newHeight = $(window).height();
        bottomPanel = $('atom-panel-container.bottom').first().get(0);
        overflow = bottomPanel.scrollHeight - bottomPanel.offsetHeight;
        delta = newHeight - this.windowHeight;
        this.windowHeight = newHeight;
        if (this.maximized) {
          clamped = Math.max(this.maxHeight + delta, this.rowHeight);
          if (this.panel.isVisible()) {
            this.adjustHeight(clamped);
          }
          this.maxHeight = clamped;
          this.prevHeight = Math.min(this.prevHeight, this.maxHeight);
        } else if (overflow > 0) {
          clamped = Math.max(this.nearestRow(this.prevHeight + delta), this.rowHeight);
          if (this.panel.isVisible()) {
            this.adjustHeight(clamped);
          }
          this.prevHeight = clamped;
        }
        this.xterm.css('transition', "height " + (0.25 / this.animationSpeed) + "s linear");
      }
      return this.resizeTerminalToView();
    };

    PlatformIOTerminalView.prototype.resizeStarted = function() {
      if (this.maximized) {
        return;
      }
      this.maxHeight = this.prevHeight + $('.item-views').height();
      $(document).on('mousemove', this.resizePanel);
      $(document).on('mouseup', this.resizeStopped);
      return this.xterm.css('transition', '');
    };

    PlatformIOTerminalView.prototype.resizeStopped = function() {
      $(document).off('mousemove', this.resizePanel);
      $(document).off('mouseup', this.resizeStopped);
      return this.xterm.css('transition', "height " + (0.25 / this.animationSpeed) + "s linear");
    };

    PlatformIOTerminalView.prototype.nearestRow = function(value) {
      var rows;
      rows = Math.floor(value / this.rowHeight);
      return rows * this.rowHeight;
    };

    PlatformIOTerminalView.prototype.resizePanel = function(event) {
      var clamped, delta, mouseY;
      if (event.which !== 1) {
        return this.resizeStopped();
      }
      mouseY = $(window).height() - event.pageY;
      delta = mouseY - $('atom-panel-container.bottom').height();
      if (!(Math.abs(delta) > (this.rowHeight * 5 / 6))) {
        return;
      }
      clamped = Math.max(this.nearestRow(this.prevHeight + delta), this.rowHeight);
      if (clamped > this.maxHeight) {
        return;
      }
      this.xterm.height(clamped);
      $(this.terminal.element).height(clamped);
      this.prevHeight = clamped;
      return this.resizeTerminalToView();
    };

    PlatformIOTerminalView.prototype.adjustHeight = function(height) {
      this.xterm.height(height);
      return $(this.terminal.element).height(height);
    };

    PlatformIOTerminalView.prototype.copy = function() {
      var lines, rawLines, rawText, text, textarea;
      if (this.terminal._selected) {
        textarea = this.terminal.getCopyTextarea();
        text = this.terminal.grabText(this.terminal._selected.x1, this.terminal._selected.x2, this.terminal._selected.y1, this.terminal._selected.y2);
      } else {
        rawText = this.terminal.context.getSelection().toString();
        rawLines = rawText.split(/\r?\n/g);
        lines = rawLines.map(function(line) {
          return line.replace(/\s/g, " ").trimRight();
        });
        text = lines.join("\n");
      }
      return atom.clipboard.write(text);
    };

    PlatformIOTerminalView.prototype.paste = function() {
      return this.input(atom.clipboard.read());
    };

    PlatformIOTerminalView.prototype.insertSelection = function(customText) {
      var cursor, editor, line, ref2, ref3, ref4, ref5, runCommand, selection, selectionText;
      if (!(editor = atom.workspace.getActiveTextEditor())) {
        return;
      }
      runCommand = atom.config.get('platformio-ide-terminal.toggles.runInsertedText');
      selectionText = '';
      if (selection = editor.getSelectedText()) {
        this.terminal.stopScrolling();
        selectionText = selection;
      } else if (cursor = editor.getCursorBufferPosition()) {
        line = editor.lineTextForBufferRow(cursor.row);
        this.terminal.stopScrolling();
        selectionText = line;
        editor.moveDown(1);
      }
      return this.input("" + (customText.replace(/\$L/, "" + (editor.getCursorBufferPosition().row + 1)).replace(/\$F/, path.basename(editor != null ? (ref4 = editor.buffer) != null ? (ref5 = ref4.file) != null ? ref5.path : void 0 : void 0 : void 0)).replace(/\$D/, path.dirname(editor != null ? (ref2 = editor.buffer) != null ? (ref3 = ref2.file) != null ? ref3.path : void 0 : void 0 : void 0)).replace(/\$S/, selectionText).replace(/\$\$/, '$')) + (runCommand ? os.EOL : ''));
    };

    PlatformIOTerminalView.prototype.focus = function() {
      this.resizeTerminalToView();
      this.focusTerminal();
      this.statusBar.setActiveTerminalView(this);
      return PlatformIOTerminalView.__super__.focus.call(this);
    };

    PlatformIOTerminalView.prototype.blur = function() {
      this.blurTerminal();
      return PlatformIOTerminalView.__super__.blur.call(this);
    };

    PlatformIOTerminalView.prototype.focusTerminal = function() {
      if (!this.terminal) {
        return;
      }
      this.terminal.focus();
      if (this.terminal._textarea) {
        return this.terminal._textarea.focus();
      } else {
        return this.terminal.element.focus();
      }
    };

    PlatformIOTerminalView.prototype.blurTerminal = function() {
      if (!this.terminal) {
        return;
      }
      this.terminal.blur();
      return this.terminal.element.blur();
    };

    PlatformIOTerminalView.prototype.resizeTerminalToView = function() {
      var cols, ref2, rows;
      if (!(this.panel.isVisible() || this.tabView)) {
        return;
      }
      ref2 = this.getDimensions(), cols = ref2.cols, rows = ref2.rows;
      if (!(cols > 0 && rows > 0)) {
        return;
      }
      if (!this.terminal) {
        return;
      }
      if (this.terminal.rows === rows && this.terminal.cols === cols) {
        return;
      }
      this.resize(cols, rows);
      return this.terminal.resize(cols, rows);
    };

    PlatformIOTerminalView.prototype.getDimensions = function() {
      var cols, fakeCol, fakeRow, rows;
      fakeRow = $("<div><span>&nbsp;</span></div>");
      if (this.terminal) {
        this.find('.terminal').append(fakeRow);
        fakeCol = fakeRow.children().first()[0].getBoundingClientRect();
        cols = Math.floor(this.xterm.width() / (fakeCol.width || 9));
        rows = Math.floor(this.xterm.height() / (fakeCol.height || 20));
        this.rowHeight = fakeCol.height;
        fakeRow.remove();
      } else {
        cols = Math.floor(this.xterm.width() / 9);
        rows = Math.floor(this.xterm.height() / 20);
      }
      return {
        cols: cols,
        rows: rows
      };
    };

    PlatformIOTerminalView.prototype.onTransitionEnd = function(callback) {
      return this.xterm.one('webkitTransitionEnd', (function(_this) {
        return function() {
          callback();
          return _this.animating = false;
        };
      })(this));
    };

    PlatformIOTerminalView.prototype.inputDialog = function() {
      var dialog;
      if (InputDialog == null) {
        InputDialog = require('./input-dialog');
      }
      dialog = new InputDialog(this);
      return dialog.attach();
    };

    PlatformIOTerminalView.prototype.rename = function() {
      return this.statusIcon.rename();
    };

    PlatformIOTerminalView.prototype.toggleTabView = function() {
      if (this.tabView) {
        this.panel = atom.workspace.addBottomPanel({
          item: this,
          visible: false
        });
        this.attachResizeEvents();
        this.closeBtn.show();
        this.hideBtn.show();
        this.maximizeBtn.show();
        return this.tabView = false;
      } else {
        this.panel.destroy();
        this.detachResizeEvents();
        this.closeBtn.hide();
        this.hideBtn.hide();
        this.maximizeBtn.hide();
        this.xterm.css("height", "");
        this.tabView = true;
        if (lastOpenedView === this) {
          return lastOpenedView = null;
        }
      }
    };

    PlatformIOTerminalView.prototype.getTitle = function() {
      return this.statusIcon.getName() || "platformio-ide-terminal";
    };

    PlatformIOTerminalView.prototype.getIconName = function() {
      return "terminal";
    };

    PlatformIOTerminalView.prototype.getShell = function() {
      return path.basename(this.shell);
    };

    PlatformIOTerminalView.prototype.getShellPath = function() {
      return this.shell;
    };

    PlatformIOTerminalView.prototype.emit = function(event, data) {
      return this.emitter.emit(event, data);
    };

    PlatformIOTerminalView.prototype.onDidChangeTitle = function(callback) {
      return this.emitter.on('did-change-title', callback);
    };

    PlatformIOTerminalView.prototype.getPath = function() {
      return this.getTerminalTitle();
    };

    PlatformIOTerminalView.prototype.getTerminalTitle = function() {
      return this.title || this.process;
    };

    PlatformIOTerminalView.prototype.getTerminal = function() {
      return this.terminal;
    };

    PlatformIOTerminalView.prototype.isAnimating = function() {
      return this.animating;
    };

    return PlatformIOTerminalView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvc2VwaXJvcGh0Ly5hdG9tL3BhY2thZ2VzL3BsYXRmb3JtaW8taWRlLXRlcm1pbmFsL2xpYi92aWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsdUpBQUE7SUFBQTs7OztFQUFBLE1BQXVDLE9BQUEsQ0FBUSxNQUFSLENBQXZDLEVBQUMsZUFBRCxFQUFPLDZDQUFQLEVBQTRCOztFQUM1QixPQUFZLE9BQUEsQ0FBUSxzQkFBUixDQUFaLEVBQUMsVUFBRCxFQUFJOztFQUVKLEdBQUEsR0FBTSxPQUFPLENBQUMsT0FBUixDQUFnQixXQUFoQjs7RUFDTixRQUFBLEdBQVcsT0FBQSxDQUFRLFNBQVI7O0VBQ1gsV0FBQSxHQUFjOztFQUVkLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFDUCxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVI7O0VBRUwsY0FBQSxHQUFpQjs7RUFDakIsaUJBQUEsR0FBb0I7O0VBRXBCLE1BQU0sQ0FBQyxPQUFQLEdBQ007Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7cUNBQ0osU0FBQSxHQUFXOztxQ0FDWCxFQUFBLEdBQUk7O3FDQUNKLFNBQUEsR0FBVzs7cUNBQ1gsTUFBQSxHQUFROztxQ0FDUixHQUFBLEdBQUs7O3FDQUNMLFlBQUEsR0FBYyxDQUFBLENBQUUsTUFBRixDQUFTLENBQUMsTUFBVixDQUFBOztxQ0FDZCxTQUFBLEdBQVc7O3FDQUNYLEtBQUEsR0FBTzs7cUNBQ1AsT0FBQSxHQUFTOztJQUVULHNCQUFDLENBQUEsT0FBRCxHQUFVLFNBQUE7YUFDUixJQUFDLENBQUEsR0FBRCxDQUFLO1FBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyx1Q0FBUDtRQUFnRCxNQUFBLEVBQVEsd0JBQXhEO09BQUwsRUFBdUYsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO1VBQ3JGLEtBQUMsQ0FBQSxHQUFELENBQUs7WUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFP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QmYsUUFBQSxHQUFVLFNBQUE7YUFDUixJQUFDLENBQUEsVUFBVSxDQUFDLE9BQVosQ0FBQSxDQUFBLElBQXlCO0lBRGpCOztxQ0FHVixXQUFBLEdBQWEsU0FBQTthQUNYO0lBRFc7O3FDQUdiLFFBQUEsR0FBVSxTQUFBO0FBQ1IsYUFBTyxJQUFJLENBQUMsUUFBTCxDQUFjLElBQUMsQ0FBQSxLQUFmO0lBREM7O3FDQUdWLFlBQUEsR0FBYyxTQUFBO0FBQ1osYUFBTyxJQUFDLENBQUE7SUFESTs7cUNBR2QsSUFBQSxHQUFNLFNBQUMsS0FBRCxFQUFRLElBQVI7YUFDSixJQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FBYyxLQUFkLEVBQXFCLElBQXJCO0lBREk7O3FDQUdOLGdCQUFBLEdBQWtCLFNBQUMsUUFBRDthQUNoQixJQUFDLENBQUEsT0FBTyxDQUFDLEVBQVQsQ0FBWSxrQkFBWixFQUFnQyxRQUFoQztJQURnQjs7cUNBR2xCLE9BQUEsR0FBUyxTQUFBO0FBQ1AsYUFBTyxJQUFDLENBQUEsZ0JBQUQsQ0FBQTtJQURBOztxQ0FHVCxnQkFBQSxHQUFrQixTQUFBO0FBQ2hCLGFBQU8sSUFBQyxDQUFBLEtBQUQsSUFBVSxJQUFDLENBQUE7SUFERjs7cUNBR2xCLFdBQUEsR0FBYSxTQUFBO0FBQ1gsYUFBTyxJQUFDLENBQUE7SUFERzs7cUNBR2IsV0FBQSxHQUFhLFNBQUE7QUFDWCxhQUFPLElBQUMsQ0FBQTtJQURHOzs7O0tBaGhCc0I7QUFkckMiLCJzb3VyY2VzQ29udGVudCI6WyJ7VGFzaywgQ29tcG9zaXRlRGlzcG9zYWJsZSwgRW1pdHRlcn0gPSByZXF1aXJlICdhdG9tJ1xueyQsIFZpZXd9ID0gcmVxdWlyZSAnYXRvbS1zcGFjZS1wZW4tdmlld3MnXG5cblB0eSA9IHJlcXVpcmUucmVzb2x2ZSAnLi9wcm9jZXNzJ1xuVGVybWluYWwgPSByZXF1aXJlICd0ZXJtLmpzJ1xuSW5wdXREaWFsb2cgPSBudWxsXG5cbnBhdGggPSByZXF1aXJlICdwYXRoJ1xub3MgPSByZXF1aXJlICdvcydcblxubGFzdE9wZW5lZFZpZXcgPSBudWxsXG5sYXN0QWN0aXZlRWxlbWVudCA9IG51bGxcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgUGxhdGZvcm1JT1Rlcm1pbmFsVmlldyBleHRlbmRzIFZpZXdcbiAgYW5pbWF0aW5nOiBmYWxzZVxuICBpZDogJydcbiAgbWF4aW1pemVkOiBmYWxzZVxuICBvcGVuZWQ6IGZhbHNlXG4gIHB3ZDogJydcbiAgd2luZG93SGVpZ2h0OiAkKHdpbmRvdykuaGVpZ2h0KClcbiAgcm93SGVpZ2h0OiAyMFxuICBzaGVsbDogJydcbiAgdGFiVmlldzogZmFsc2VcblxuICBAY29udGVudDogLT5cbiAgICBAZGl2IGNsYXNzOiAncGxhdGZvcm1pby1pZGUtdGVybWluYWwgdGVybWluYWwtdmlldycsIG91dGxldDogJ3BsYXRmb3JtSU9UZXJtaW5hbFZpZXcnLCA9PlxuICAgICAgQGRpdiBjbGFzczogJ3BhbmVsLWRpdmlkZXInLCBvdXRsZXQ6ICdwYW5lbERpdmlkZXInXG4gICAgICBAZGl2IGNsYXNzOiAnYnRuLXRvb2xiYXInLCBvdXRsZXQ6J3Rvb2xiYXInLCA9PlxuICAgICAgICBAYnV0dG9uIG91dGxldDogJ2Nsb3NlQnRuJywgY2xhc3M6ICdidG4gaW5saW5lLWJsb2NrLXRpZ2h0IHJpZ2h0JywgY2xpY2s6ICdkZXN0cm95JywgPT5cbiAgICAgICAgICBAc3BhbiBjbGFzczogJ2ljb24gaWNvbi14J1xuICAgICAgICBAYnV0dG9uIG91dGxldDogJ2hpZGVCdG4nLCBjbGFzczogJ2J0biBpbmxpbmUtYmxvY2stdGlnaHQgcmlnaHQnLCBjbGljazogJ2hpZGUnLCA9PlxuICAgICAgICAgIEBzcGFuIGNsYXNzOiAnaWNvbiBpY29uLWNoZXZyb24tZG93bidcbiAgICAgICAgQGJ1dHRvbiBvdXRsZXQ6ICdtYXhpbWl6ZUJ0bicsIGNsYXNzOiAnYnRuIGlubGluZS1ibG9jay10aWdodCByaWdodCcsIGNsaWNrOiAnbWF4aW1pemUnLCA9PlxuICAgICAgICAgIEBzcGFuIGNsYXNzOiAnaWNvbiBpY29uLXNjcmVlbi1mdWxsJ1xuICAgICAgICBAYnV0dG9uIG91dGxldDogJ2lucHV0QnRuJywgY2xhc3M6ICdidG4gaW5saW5lLWJsb2NrLXRpZ2h0IGxlZnQnLCBjbGljazogJ2lucHV0RGlhbG9nJywgPT5cbiAgICAgICAgICBAc3BhbiBjbGFzczogJ2ljb24gaWNvbi1rZXlib2FyZCdcbiAgICAgIEBkaXYgY2xhc3M6ICd4dGVybScsIG91dGxldDogJ3h0ZXJtJ1xuXG4gIEBnZXRGb2N1c2VkVGVybWluYWw6IC0+XG4gICAgcmV0dXJuIFRlcm1pbmFsLlRlcm1pbmFsLmZvY3VzXG5cbiAgaW5pdGlhbGl6ZTogKEBpZCwgQHB3ZCwgQHN0YXR1c0ljb24sIEBzdGF0dXNCYXIsIEBzaGVsbCwgQGFyZ3M9W10sIEBhdXRvUnVuPVtdKSAtPlxuICAgIEBzdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcbiAgICBAZW1pdHRlciA9IG5ldyBFbWl0dGVyXG5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS50b29sdGlwcy5hZGQgQGNsb3NlQnRuLFxuICAgICAgdGl0bGU6ICdDbG9zZSdcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS50b29sdGlwcy5hZGQgQGhpZGVCdG4sXG4gICAgICB0aXRsZTogJ0hpZGUnXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIEBtYXhpbWl6ZUJ0bi50b29sdGlwID0gYXRvbS50b29sdGlwcy5hZGQgQG1heGltaXplQnRuLFxuICAgICAgdGl0bGU6ICdGdWxsc2NyZWVuJ1xuICAgIEBpbnB1dEJ0bi50b29sdGlwID0gYXRvbS50b29sdGlwcy5hZGQgQGlucHV0QnRuLFxuICAgICAgdGl0bGU6ICdJbnNlcnQgVGV4dCdcblxuICAgIEBwcmV2SGVpZ2h0ID0gYXRvbS5jb25maWcuZ2V0KCdwbGF0Zm9ybWlvLWlkZS10ZXJtaW5hbC5zdHlsZS5kZWZhdWx0UGFuZWxIZWlnaHQnKVxuICAgIGlmIEBwcmV2SGVpZ2h0LmluZGV4T2YoJyUnKSA+IDBcbiAgICAgIHBlcmNlbnQgPSBNYXRoLmFicyhNYXRoLm1pbihwYXJzZUZsb2F0KEBwcmV2SGVpZ2h0KSAvIDEwMC4wLCAxKSlcbiAgICAgIGJvdHRvbUhlaWdodCA9ICQoJ2F0b20tcGFuZWwuYm90dG9tJykuY2hpbGRyZW4oXCIudGVybWluYWwtdmlld1wiKS5oZWlnaHQoKSBvciAwXG4gICAgICBAcHJldkhlaWdodCA9IHBlcmNlbnQgKiAoJCgnLml0ZW0tdmlld3MnKS5oZWlnaHQoKSArIGJvdHRvbUhlaWdodClcbiAgICBAeHRlcm0uaGVpZ2h0IDBcblxuICAgIEBzZXRBbmltYXRpb25TcGVlZCgpXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlICdwbGF0Zm9ybWlvLWlkZS10ZXJtaW5hbC5zdHlsZS5hbmltYXRpb25TcGVlZCcsIEBzZXRBbmltYXRpb25TcGVlZFxuXG4gICAgb3ZlcnJpZGUgPSAoZXZlbnQpIC0+XG4gICAgICByZXR1cm4gaWYgZXZlbnQub3JpZ2luYWxFdmVudC5kYXRhVHJhbnNmZXIuZ2V0RGF0YSgncGxhdGZvcm1pby1pZGUtdGVybWluYWwnKSBpcyAndHJ1ZSdcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXG5cbiAgICBAeHRlcm0ub24gJ21vdXNldXAnLCAoZXZlbnQpID0+XG4gICAgICBpZiBldmVudC53aGljaCAhPSAzXG4gICAgICAgIHRleHQgPSB3aW5kb3cuZ2V0U2VsZWN0aW9uKCkudG9TdHJpbmcoKVxuICAgICAgICB1bmxlc3MgdGV4dFxuICAgICAgICAgIEBmb2N1cygpXG4gICAgQHh0ZXJtLm9uICdkcmFnZW50ZXInLCBvdmVycmlkZVxuICAgIEB4dGVybS5vbiAnZHJhZ292ZXInLCBvdmVycmlkZVxuICAgIEB4dGVybS5vbiAnZHJvcCcsIEByZWNpZXZlSXRlbU9yRmlsZVxuXG4gICAgQG9uICdmb2N1cycsIEBmb2N1c1xuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBkaXNwb3NlOiA9PlxuICAgICAgQG9mZiAnZm9jdXMnLCBAZm9jdXNcblxuICBhdHRhY2g6IC0+XG4gICAgcmV0dXJuIGlmIEBwYW5lbD9cbiAgICBAcGFuZWwgPSBhdG9tLndvcmtzcGFjZS5hZGRCb3R0b21QYW5lbChpdGVtOiB0aGlzLCB2aXNpYmxlOiBmYWxzZSlcblxuICBzZXRBbmltYXRpb25TcGVlZDogPT5cbiAgICBAYW5pbWF0aW9uU3BlZWQgPSBhdG9tLmNvbmZpZy5nZXQoJ3BsYXRmb3JtaW8taWRlLXRlcm1pbmFsLnN0eWxlLmFuaW1hdGlvblNwZWVkJylcbiAgICBAYW5pbWF0aW9uU3BlZWQgPSAxMDAgaWYgQGFuaW1hdGlvblNwZWVkIGlzIDBcblxuICAgIEB4dGVybS5jc3MgJ3RyYW5zaXRpb24nLCBcImhlaWdodCAjezAuMjUgLyBAYW5pbWF0aW9uU3BlZWR9cyBsaW5lYXJcIlxuXG4gIHJlY2lldmVJdGVtT3JGaWxlOiAoZXZlbnQpID0+XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXG4gICAge2RhdGFUcmFuc2Zlcn0gPSBldmVudC5vcmlnaW5hbEV2ZW50XG5cbiAgICBpZiBkYXRhVHJhbnNmZXIuZ2V0RGF0YSgnYXRvbS1ldmVudCcpIGlzICd0cnVlJ1xuICAgICAgZmlsZVBhdGggPSBkYXRhVHJhbnNmZXIuZ2V0RGF0YSgndGV4dC9wbGFpbicpXG4gICAgICBAaW5wdXQgXCIje2ZpbGVQYXRofSBcIiBpZiBmaWxlUGF0aFxuICAgIGVsc2UgaWYgZmlsZVBhdGggPSBkYXRhVHJhbnNmZXIuZ2V0RGF0YSgnaW5pdGlhbFBhdGgnKVxuICAgICAgQGlucHV0IFwiI3tmaWxlUGF0aH0gXCJcbiAgICBlbHNlIGlmIGRhdGFUcmFuc2Zlci5maWxlcy5sZW5ndGggPiAwXG4gICAgICBmb3IgZmlsZSBpbiBkYXRhVHJhbnNmZXIuZmlsZXNcbiAgICAgICAgQGlucHV0IFwiI3tmaWxlLnBhdGh9IFwiXG5cbiAgZm9ya1B0eVByb2Nlc3M6IC0+XG4gICAgVGFzay5vbmNlIFB0eSwgcGF0aC5yZXNvbHZlKEBwd2QpLCBAc2hlbGwsIEBhcmdzLCA9PlxuICAgICAgQGlucHV0ID0gLT5cbiAgICAgIEByZXNpemUgPSAtPlxuXG4gIGdldElkOiAtPlxuICAgIHJldHVybiBAaWRcblxuICBkaXNwbGF5VGVybWluYWw6IC0+XG4gICAge2NvbHMsIHJvd3N9ID0gQGdldERpbWVuc2lvbnMoKVxuICAgIEBwdHlQcm9jZXNzID0gQGZvcmtQdHlQcm9jZXNzKClcblxuICAgIEB0ZXJtaW5hbCA9IG5ldyBUZXJtaW5hbCB7XG4gICAgICBjdXJzb3JCbGluayAgICAgOiBmYWxzZVxuICAgICAgc2Nyb2xsYmFjayAgICAgIDogYXRvbS5jb25maWcuZ2V0ICdwbGF0Zm9ybWlvLWlkZS10ZXJtaW5hbC5jb3JlLnNjcm9sbGJhY2snXG4gICAgICBjb2xzLCByb3dzXG4gICAgfVxuXG4gICAgQGF0dGFjaExpc3RlbmVycygpXG4gICAgQGF0dGFjaFJlc2l6ZUV2ZW50cygpXG4gICAgQGF0dGFjaFdpbmRvd0V2ZW50cygpXG4gICAgQHRlcm1pbmFsLm9wZW4gQHh0ZXJtLmdldCgwKVxuXG4gIGF0dGFjaExpc3RlbmVyczogLT5cbiAgICBAcHR5UHJvY2Vzcy5vbiBcInBsYXRmb3JtaW8taWRlLXRlcm1pbmFsOmRhdGFcIiwgKGRhdGEpID0+XG4gICAgICBAdGVybWluYWwud3JpdGUgZGF0YVxuXG4gICAgQHB0eVByb2Nlc3Mub24gXCJwbGF0Zm9ybWlvLWlkZS10ZXJtaW5hbDpleGl0XCIsID0+XG4gICAgICBAZGVzdHJveSgpIGlmIGF0b20uY29uZmlnLmdldCgncGxhdGZvcm1pby1pZGUtdGVybWluYWwudG9nZ2xlcy5hdXRvQ2xvc2UnKVxuXG4gICAgQHRlcm1pbmFsLmVuZCA9ID0+IEBkZXN0cm95KClcblxuICAgIEB0ZXJtaW5hbC5vbiBcImRhdGFcIiwgKGRhdGEpID0+XG4gICAgICBAaW5wdXQgZGF0YVxuXG4gICAgQHB0eVByb2Nlc3Mub24gXCJwbGF0Zm9ybWlvLWlkZS10ZXJtaW5hbDp0aXRsZVwiLCAodGl0bGUpID0+XG4gICAgICBAcHJvY2VzcyA9IHRpdGxlXG4gICAgQHRlcm1pbmFsLm9uIFwidGl0bGVcIiwgKHRpdGxlKSA9PlxuICAgICAgQHRpdGxlID0gdGl0bGVcblxuICAgIEB0ZXJtaW5hbC5vbmNlIFwib3BlblwiLCA9PlxuICAgICAgQGFwcGx5U3R5bGUoKVxuICAgICAgQHJlc2l6ZVRlcm1pbmFsVG9WaWV3KClcblxuICAgICAgcmV0dXJuIHVubGVzcyBAcHR5UHJvY2Vzcy5jaGlsZFByb2Nlc3M/XG4gICAgICBhdXRvUnVuQ29tbWFuZCA9IGF0b20uY29uZmlnLmdldCgncGxhdGZvcm1pby1pZGUtdGVybWluYWwuY29yZS5hdXRvUnVuQ29tbWFuZCcpXG4gICAgICBAaW5wdXQgXCIje2F1dG9SdW5Db21tYW5kfSN7b3MuRU9MfVwiIGlmIGF1dG9SdW5Db21tYW5kXG4gICAgICBAaW5wdXQgXCIje2NvbW1hbmR9I3tvcy5FT0x9XCIgZm9yIGNvbW1hbmQgaW4gQGF1dG9SdW5cblxuICBkZXN0cm95OiAtPlxuICAgIEBzdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICAgIEBzdGF0dXNJY29uLmRlc3Ryb3koKVxuICAgIEBzdGF0dXNCYXIucmVtb3ZlVGVybWluYWxWaWV3IHRoaXNcbiAgICBAZGV0YWNoUmVzaXplRXZlbnRzKClcbiAgICBAZGV0YWNoV2luZG93RXZlbnRzKClcblxuICAgIGlmIEBwYW5lbC5pc1Zpc2libGUoKVxuICAgICAgQGhpZGUoKVxuICAgICAgQG9uVHJhbnNpdGlvbkVuZCA9PiBAcGFuZWwuZGVzdHJveSgpXG4gICAgZWxzZVxuICAgICAgQHBhbmVsLmRlc3Ryb3koKVxuXG4gICAgaWYgQHN0YXR1c0ljb24gYW5kIEBzdGF0dXNJY29uLnBhcmVudE5vZGVcbiAgICAgIEBzdGF0dXNJY29uLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoQHN0YXR1c0ljb24pXG5cbiAgICBAcHR5UHJvY2Vzcz8udGVybWluYXRlKClcbiAgICBAdGVybWluYWw/LmRlc3Ryb3koKVxuXG4gIG1heGltaXplOiAtPlxuICAgIEBzdWJzY3JpcHRpb25zLnJlbW92ZSBAbWF4aW1pemVCdG4udG9vbHRpcFxuICAgIEBtYXhpbWl6ZUJ0bi50b29sdGlwLmRpc3Bvc2UoKVxuXG4gICAgQG1heEhlaWdodCA9IEBwcmV2SGVpZ2h0ICsgJCgnLml0ZW0tdmlld3MnKS5oZWlnaHQoKVxuICAgIGJ0biA9IEBtYXhpbWl6ZUJ0bi5jaGlsZHJlbignc3BhbicpXG4gICAgQG9uVHJhbnNpdGlvbkVuZCA9PiBAZm9jdXMoKVxuXG4gICAgaWYgQG1heGltaXplZFxuICAgICAgQG1heGltaXplQnRuLnRvb2x0aXAgPSBhdG9tLnRvb2x0aXBzLmFkZCBAbWF4aW1pemVCdG4sXG4gICAgICAgIHRpdGxlOiAnRnVsbHNjcmVlbidcbiAgICAgIEBzdWJzY3JpcHRpb25zLmFkZCBAbWF4aW1pemVCdG4udG9vbHRpcFxuICAgICAgQGFkanVzdEhlaWdodCBAcHJldkhlaWdodFxuICAgICAgYnRuLnJlbW92ZUNsYXNzKCdpY29uLXNjcmVlbi1ub3JtYWwnKS5hZGRDbGFzcygnaWNvbi1zY3JlZW4tZnVsbCcpXG4gICAgICBAbWF4aW1pemVkID0gZmFsc2VcbiAgICBlbHNlXG4gICAgICBAbWF4aW1pemVCdG4udG9vbHRpcCA9IGF0b20udG9vbHRpcHMuYWRkIEBtYXhpbWl6ZUJ0bixcbiAgICAgICAgdGl0bGU6ICdOb3JtYWwnXG4gICAgICBAc3Vic2NyaXB0aW9ucy5hZGQgQG1heGltaXplQnRuLnRvb2x0aXBcbiAgICAgIEBhZGp1c3RIZWlnaHQgQG1heEhlaWdodFxuICAgICAgYnRuLnJlbW92ZUNsYXNzKCdpY29uLXNjcmVlbi1mdWxsJykuYWRkQ2xhc3MoJ2ljb24tc2NyZWVuLW5vcm1hbCcpXG4gICAgICBAbWF4aW1pemVkID0gdHJ1ZVxuXG4gIG9wZW46ID0+XG4gICAgbGFzdEFjdGl2ZUVsZW1lbnQgPz0gJChkb2N1bWVudC5hY3RpdmVFbGVtZW50KVxuXG4gICAgaWYgbGFzdE9wZW5lZFZpZXcgYW5kIGxhc3RPcGVuZWRWaWV3ICE9IHRoaXNcbiAgICAgIGlmIGxhc3RPcGVuZWRWaWV3Lm1heGltaXplZFxuICAgICAgICBAc3Vic2NyaXB0aW9ucy5yZW1vdmUgQG1heGltaXplQnRuLnRvb2x0aXBcbiAgICAgICAgQG1heGltaXplQnRuLnRvb2x0aXAuZGlzcG9zZSgpXG4gICAgICAgIGljb24gPSBAbWF4aW1pemVCdG4uY2hpbGRyZW4oJ3NwYW4nKVxuXG4gICAgICAgIEBtYXhIZWlnaHQgPSBsYXN0T3BlbmVkVmlldy5tYXhIZWlnaHRcbiAgICAgICAgQG1heGltaXplQnRuLnRvb2x0aXAgPSBhdG9tLnRvb2x0aXBzLmFkZCBAbWF4aW1pemVCdG4sXG4gICAgICAgICAgdGl0bGU6ICdOb3JtYWwnXG4gICAgICAgIEBzdWJzY3JpcHRpb25zLmFkZCBAbWF4aW1pemVCdG4udG9vbHRpcFxuICAgICAgICBpY29uLnJlbW92ZUNsYXNzKCdpY29uLXNjcmVlbi1mdWxsJykuYWRkQ2xhc3MoJ2ljb24tc2NyZWVuLW5vcm1hbCcpXG4gICAgICAgIEBtYXhpbWl6ZWQgPSB0cnVlXG4gICAgICBsYXN0T3BlbmVkVmlldy5oaWRlKClcblxuICAgIGxhc3RPcGVuZWRWaWV3ID0gdGhpc1xuICAgIEBzdGF0dXNCYXIuc2V0QWN0aXZlVGVybWluYWxWaWV3IHRoaXNcbiAgICBAc3RhdHVzSWNvbi5hY3RpdmF0ZSgpXG5cbiAgICBAb25UcmFuc2l0aW9uRW5kID0+XG4gICAgICBpZiBub3QgQG9wZW5lZFxuICAgICAgICBAb3BlbmVkID0gdHJ1ZVxuICAgICAgICBAZGlzcGxheVRlcm1pbmFsKClcbiAgICAgICAgQHByZXZIZWlnaHQgPSBAbmVhcmVzdFJvdyhAeHRlcm0uaGVpZ2h0KCkpXG4gICAgICAgIEB4dGVybS5oZWlnaHQoQHByZXZIZWlnaHQpXG4gICAgICBlbHNlXG4gICAgICAgIEBmb2N1cygpXG5cbiAgICBAcGFuZWwuc2hvdygpXG4gICAgQHh0ZXJtLmhlaWdodCAwXG4gICAgQGFuaW1hdGluZyA9IHRydWVcbiAgICBAeHRlcm0uaGVpZ2h0IGlmIEBtYXhpbWl6ZWQgdGhlbiBAbWF4SGVpZ2h0IGVsc2UgQHByZXZIZWlnaHRcblxuICBoaWRlOiA9PlxuICAgIEB0ZXJtaW5hbD8uYmx1cigpXG4gICAgbGFzdE9wZW5lZFZpZXcgPSBudWxsXG4gICAgQHN0YXR1c0ljb24uZGVhY3RpdmF0ZSgpXG5cbiAgICBAb25UcmFuc2l0aW9uRW5kID0+XG4gICAgICBAcGFuZWwuaGlkZSgpXG4gICAgICB1bmxlc3MgbGFzdE9wZW5lZFZpZXc/XG4gICAgICAgIGlmIGxhc3RBY3RpdmVFbGVtZW50P1xuICAgICAgICAgIGxhc3RBY3RpdmVFbGVtZW50LmZvY3VzKClcbiAgICAgICAgICBsYXN0QWN0aXZlRWxlbWVudCA9IG51bGxcblxuICAgIEB4dGVybS5oZWlnaHQgaWYgQG1heGltaXplZCB0aGVuIEBtYXhIZWlnaHQgZWxzZSBAcHJldkhlaWdodFxuICAgIEBhbmltYXRpbmcgPSB0cnVlXG4gICAgQHh0ZXJtLmhlaWdodCAwXG5cbiAgdG9nZ2xlOiAtPlxuICAgIHJldHVybiBpZiBAYW5pbWF0aW5nXG5cbiAgICBpZiBAcGFuZWwuaXNWaXNpYmxlKClcbiAgICAgIEBoaWRlKClcbiAgICBlbHNlXG4gICAgICBAb3BlbigpXG5cbiAgaW5wdXQ6IChkYXRhKSAtPlxuICAgIHJldHVybiB1bmxlc3MgQHB0eVByb2Nlc3MuY2hpbGRQcm9jZXNzP1xuXG4gICAgQHRlcm1pbmFsLnN0b3BTY3JvbGxpbmcoKVxuICAgIEBwdHlQcm9jZXNzLnNlbmQgZXZlbnQ6ICdpbnB1dCcsIHRleHQ6IGRhdGFcblxuICByZXNpemU6IChjb2xzLCByb3dzKSAtPlxuICAgIHJldHVybiB1bmxlc3MgQHB0eVByb2Nlc3MuY2hpbGRQcm9jZXNzP1xuXG4gICAgQHB0eVByb2Nlc3Muc2VuZCB7ZXZlbnQ6ICdyZXNpemUnLCByb3dzLCBjb2xzfVxuXG4gIGFwcGx5U3R5bGU6IC0+XG4gICAgY29uZmlnID0gYXRvbS5jb25maWcuZ2V0ICdwbGF0Zm9ybWlvLWlkZS10ZXJtaW5hbCdcblxuICAgIEB4dGVybS5hZGRDbGFzcyBjb25maWcuc3R5bGUudGhlbWVcbiAgICBAeHRlcm0uYWRkQ2xhc3MgJ2N1cnNvci1ibGluaycgaWYgY29uZmlnLnRvZ2dsZXMuY3Vyc29yQmxpbmtcblxuICAgIGVkaXRvckZvbnQgPSBhdG9tLmNvbmZpZy5nZXQoJ2VkaXRvci5mb250RmFtaWx5JylcbiAgICBkZWZhdWx0Rm9udCA9IFwiTWVubG8sIENvbnNvbGFzLCAnRGVqYVZ1IFNhbnMgTW9ubycsIG1vbm9zcGFjZVwiXG4gICAgb3ZlcnJpZGVGb250ID0gY29uZmlnLnN0eWxlLmZvbnRGYW1pbHlcbiAgICBAdGVybWluYWwuZWxlbWVudC5zdHlsZS5mb250RmFtaWx5ID0gb3ZlcnJpZGVGb250IG9yIGVkaXRvckZvbnQgb3IgZGVmYXVsdEZvbnRcblxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbmZpZy5vbkRpZENoYW5nZSAnZWRpdG9yLmZvbnRGYW1pbHknLCAoZXZlbnQpID0+XG4gICAgICBlZGl0b3JGb250ID0gZXZlbnQubmV3VmFsdWVcbiAgICAgIEB0ZXJtaW5hbC5lbGVtZW50LnN0eWxlLmZvbnRGYW1pbHkgPSBvdmVycmlkZUZvbnQgb3IgZWRpdG9yRm9udCBvciBkZWZhdWx0Rm9udFxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbmZpZy5vbkRpZENoYW5nZSAncGxhdGZvcm1pby1pZGUtdGVybWluYWwuc3R5bGUuZm9udEZhbWlseScsIChldmVudCkgPT5cbiAgICAgIG92ZXJyaWRlRm9udCA9IGV2ZW50Lm5ld1ZhbHVlXG4gICAgICBAdGVybWluYWwuZWxlbWVudC5zdHlsZS5mb250RmFtaWx5ID0gb3ZlcnJpZGVGb250IG9yIGVkaXRvckZvbnQgb3IgZGVmYXVsdEZvbnRcblxuICAgIGVkaXRvckZvbnRTaXplID0gYXRvbS5jb25maWcuZ2V0KCdlZGl0b3IuZm9udFNpemUnKVxuICAgIG92ZXJyaWRlRm9udFNpemUgPSBjb25maWcuc3R5bGUuZm9udFNpemVcbiAgICBAdGVybWluYWwuZWxlbWVudC5zdHlsZS5mb250U2l6ZSA9IFwiI3tvdmVycmlkZUZvbnRTaXplIG9yIGVkaXRvckZvbnRTaXplfXB4XCJcblxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbmZpZy5vbkRpZENoYW5nZSAnZWRpdG9yLmZvbnRTaXplJywgKGV2ZW50KSA9PlxuICAgICAgZWRpdG9yRm9udFNpemUgPSBldmVudC5uZXdWYWx1ZVxuICAgICAgQHRlcm1pbmFsLmVsZW1lbnQuc3R5bGUuZm9udFNpemUgPSBcIiN7b3ZlcnJpZGVGb250U2l6ZSBvciBlZGl0b3JGb250U2l6ZX1weFwiXG4gICAgICBAcmVzaXplVGVybWluYWxUb1ZpZXcoKVxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbmZpZy5vbkRpZENoYW5nZSAncGxhdGZvcm1pby1pZGUtdGVybWluYWwuc3R5bGUuZm9udFNpemUnLCAoZXZlbnQpID0+XG4gICAgICBvdmVycmlkZUZvbnRTaXplID0gZXZlbnQubmV3VmFsdWVcbiAgICAgIEB0ZXJtaW5hbC5lbGVtZW50LnN0eWxlLmZvbnRTaXplID0gXCIje292ZXJyaWRlRm9udFNpemUgb3IgZWRpdG9yRm9udFNpemV9cHhcIlxuICAgICAgQHJlc2l6ZVRlcm1pbmFsVG9WaWV3KClcblxuICAgICMgZmlyc3QgOCBjb2xvcnMgaS5lLiAnZGFyaycgY29sb3JzXG4gICAgQHRlcm1pbmFsLmNvbG9yc1swLi43XSA9IFtcbiAgICAgIGNvbmZpZy5hbnNpQ29sb3JzLm5vcm1hbC5ibGFjay50b0hleFN0cmluZygpXG4gICAgICBjb25maWcuYW5zaUNvbG9ycy5ub3JtYWwucmVkLnRvSGV4U3RyaW5nKClcbiAgICAgIGNvbmZpZy5hbnNpQ29sb3JzLm5vcm1hbC5ncmVlbi50b0hleFN0cmluZygpXG4gICAgICBjb25maWcuYW5zaUNvbG9ycy5ub3JtYWwueWVsbG93LnRvSGV4U3RyaW5nKClcbiAgICAgIGNvbmZpZy5hbnNpQ29sb3JzLm5vcm1hbC5ibHVlLnRvSGV4U3RyaW5nKClcbiAgICAgIGNvbmZpZy5hbnNpQ29sb3JzLm5vcm1hbC5tYWdlbnRhLnRvSGV4U3RyaW5nKClcbiAgICAgIGNvbmZpZy5hbnNpQ29sb3JzLm5vcm1hbC5jeWFuLnRvSGV4U3RyaW5nKClcbiAgICAgIGNvbmZpZy5hbnNpQ29sb3JzLm5vcm1hbC53aGl0ZS50b0hleFN0cmluZygpXG4gICAgXVxuICAgICMgJ2JyaWdodCcgY29sb3JzXG4gICAgQHRlcm1pbmFsLmNvbG9yc1s4Li4xNV0gPSBbXG4gICAgICBjb25maWcuYW5zaUNvbG9ycy56QnJpZ2h0LmJyaWdodEJsYWNrLnRvSGV4U3RyaW5nKClcbiAgICAgIGNvbmZpZy5hbnNpQ29sb3JzLnpCcmlnaHQuYnJpZ2h0UmVkLnRvSGV4U3RyaW5nKClcbiAgICAgIGNvbmZpZy5hbnNpQ29sb3JzLnpCcmlnaHQuYnJpZ2h0R3JlZW4udG9IZXhTdHJpbmcoKVxuICAgICAgY29uZmlnLmFuc2lDb2xvcnMuekJyaWdodC5icmlnaHRZZWxsb3cudG9IZXhTdHJpbmcoKVxuICAgICAgY29uZmlnLmFuc2lDb2xvcnMuekJyaWdodC5icmlnaHRCbHVlLnRvSGV4U3RyaW5nKClcbiAgICAgIGNvbmZpZy5hbnNpQ29sb3JzLnpCcmlnaHQuYnJpZ2h0TWFnZW50YS50b0hleFN0cmluZygpXG4gICAgICBjb25maWcuYW5zaUNvbG9ycy56QnJpZ2h0LmJyaWdodEN5YW4udG9IZXhTdHJpbmcoKVxuICAgICAgY29uZmlnLmFuc2lDb2xvcnMuekJyaWdodC5icmlnaHRXaGl0ZS50b0hleFN0cmluZygpXG4gICAgXVxuXG4gIGF0dGFjaFdpbmRvd0V2ZW50czogLT5cbiAgICAkKHdpbmRvdykub24gJ3Jlc2l6ZScsIEBvbldpbmRvd1Jlc2l6ZVxuXG4gIGRldGFjaFdpbmRvd0V2ZW50czogLT5cbiAgICAkKHdpbmRvdykub2ZmICdyZXNpemUnLCBAb25XaW5kb3dSZXNpemVcblxuICBhdHRhY2hSZXNpemVFdmVudHM6IC0+XG4gICAgQHBhbmVsRGl2aWRlci5vbiAnbW91c2Vkb3duJywgQHJlc2l6ZVN0YXJ0ZWRcblxuICBkZXRhY2hSZXNpemVFdmVudHM6IC0+XG4gICAgQHBhbmVsRGl2aWRlci5vZmYgJ21vdXNlZG93bidcblxuICBvbldpbmRvd1Jlc2l6ZTogPT5cbiAgICBpZiBub3QgQHRhYlZpZXdcbiAgICAgIEB4dGVybS5jc3MgJ3RyYW5zaXRpb24nLCAnJ1xuICAgICAgbmV3SGVpZ2h0ID0gJCh3aW5kb3cpLmhlaWdodCgpXG4gICAgICBib3R0b21QYW5lbCA9ICQoJ2F0b20tcGFuZWwtY29udGFpbmVyLmJvdHRvbScpLmZpcnN0KCkuZ2V0KDApXG4gICAgICBvdmVyZmxvdyA9IGJvdHRvbVBhbmVsLnNjcm9sbEhlaWdodCAtIGJvdHRvbVBhbmVsLm9mZnNldEhlaWdodFxuXG4gICAgICBkZWx0YSA9IG5ld0hlaWdodCAtIEB3aW5kb3dIZWlnaHRcbiAgICAgIEB3aW5kb3dIZWlnaHQgPSBuZXdIZWlnaHRcblxuICAgICAgaWYgQG1heGltaXplZFxuICAgICAgICBjbGFtcGVkID0gTWF0aC5tYXgoQG1heEhlaWdodCArIGRlbHRhLCBAcm93SGVpZ2h0KVxuXG4gICAgICAgIEBhZGp1c3RIZWlnaHQgY2xhbXBlZCBpZiBAcGFuZWwuaXNWaXNpYmxlKClcbiAgICAgICAgQG1heEhlaWdodCA9IGNsYW1wZWRcblxuICAgICAgICBAcHJldkhlaWdodCA9IE1hdGgubWluKEBwcmV2SGVpZ2h0LCBAbWF4SGVpZ2h0KVxuICAgICAgZWxzZSBpZiBvdmVyZmxvdyA+IDBcbiAgICAgICAgY2xhbXBlZCA9IE1hdGgubWF4KEBuZWFyZXN0Um93KEBwcmV2SGVpZ2h0ICsgZGVsdGEpLCBAcm93SGVpZ2h0KVxuXG4gICAgICAgIEBhZGp1c3RIZWlnaHQgY2xhbXBlZCBpZiBAcGFuZWwuaXNWaXNpYmxlKClcbiAgICAgICAgQHByZXZIZWlnaHQgPSBjbGFtcGVkXG5cbiAgICAgIEB4dGVybS5jc3MgJ3RyYW5zaXRpb24nLCBcImhlaWdodCAjezAuMjUgLyBAYW5pbWF0aW9uU3BlZWR9cyBsaW5lYXJcIlxuICAgIEByZXNpemVUZXJtaW5hbFRvVmlldygpXG5cbiAgcmVzaXplU3RhcnRlZDogPT5cbiAgICByZXR1cm4gaWYgQG1heGltaXplZFxuICAgIEBtYXhIZWlnaHQgPSBAcHJldkhlaWdodCArICQoJy5pdGVtLXZpZXdzJykuaGVpZ2h0KClcbiAgICAkKGRvY3VtZW50KS5vbignbW91c2Vtb3ZlJywgQHJlc2l6ZVBhbmVsKVxuICAgICQoZG9jdW1lbnQpLm9uKCdtb3VzZXVwJywgQHJlc2l6ZVN0b3BwZWQpXG4gICAgQHh0ZXJtLmNzcyAndHJhbnNpdGlvbicsICcnXG5cbiAgcmVzaXplU3RvcHBlZDogPT5cbiAgICAkKGRvY3VtZW50KS5vZmYoJ21vdXNlbW92ZScsIEByZXNpemVQYW5lbClcbiAgICAkKGRvY3VtZW50KS5vZmYoJ21vdXNldXAnLCBAcmVzaXplU3RvcHBlZClcbiAgICBAeHRlcm0uY3NzICd0cmFuc2l0aW9uJywgXCJoZWlnaHQgI3swLjI1IC8gQGFuaW1hdGlvblNwZWVkfXMgbGluZWFyXCJcblxuICBuZWFyZXN0Um93OiAodmFsdWUpIC0+XG4gICAgcm93cyA9IHZhbHVlIC8vIEByb3dIZWlnaHRcbiAgICByZXR1cm4gcm93cyAqIEByb3dIZWlnaHRcblxuICByZXNpemVQYW5lbDogKGV2ZW50KSA9PlxuICAgIHJldHVybiBAcmVzaXplU3RvcHBlZCgpIHVubGVzcyBldmVudC53aGljaCBpcyAxXG5cbiAgICBtb3VzZVkgPSAkKHdpbmRvdykuaGVpZ2h0KCkgLSBldmVudC5wYWdlWVxuICAgIGRlbHRhID0gbW91c2VZIC0gJCgnYXRvbS1wYW5lbC1jb250YWluZXIuYm90dG9tJykuaGVpZ2h0KClcbiAgICByZXR1cm4gdW5sZXNzIE1hdGguYWJzKGRlbHRhKSA+IChAcm93SGVpZ2h0ICogNSAvIDYpXG5cbiAgICBjbGFtcGVkID0gTWF0aC5tYXgoQG5lYXJlc3RSb3coQHByZXZIZWlnaHQgKyBkZWx0YSksIEByb3dIZWlnaHQpXG4gICAgcmV0dXJuIGlmIGNsYW1wZWQgPiBAbWF4SGVpZ2h0XG5cbiAgICBAeHRlcm0uaGVpZ2h0IGNsYW1wZWRcbiAgICAkKEB0ZXJtaW5hbC5lbGVtZW50KS5oZWlnaHQgY2xhbXBlZFxuICAgIEBwcmV2SGVpZ2h0ID0gY2xhbXBlZFxuXG4gICAgQHJlc2l6ZVRlcm1pbmFsVG9WaWV3KClcblxuICBhZGp1c3RIZWlnaHQ6IChoZWlnaHQpIC0+XG4gICAgQHh0ZXJtLmhlaWdodCBoZWlnaHRcbiAgICAkKEB0ZXJtaW5hbC5lbGVtZW50KS5oZWlnaHQgaGVpZ2h0XG5cbiAgY29weTogLT5cbiAgICBpZiBAdGVybWluYWwuX3NlbGVjdGVkXG4gICAgICB0ZXh0YXJlYSA9IEB0ZXJtaW5hbC5nZXRDb3B5VGV4dGFyZWEoKVxuICAgICAgdGV4dCA9IEB0ZXJtaW5hbC5ncmFiVGV4dChcbiAgICAgICAgQHRlcm1pbmFsLl9zZWxlY3RlZC54MSwgQHRlcm1pbmFsLl9zZWxlY3RlZC54MixcbiAgICAgICAgQHRlcm1pbmFsLl9zZWxlY3RlZC55MSwgQHRlcm1pbmFsLl9zZWxlY3RlZC55MilcbiAgICBlbHNlXG4gICAgICByYXdUZXh0ID0gQHRlcm1pbmFsLmNvbnRleHQuZ2V0U2VsZWN0aW9uKCkudG9TdHJpbmcoKVxuICAgICAgcmF3TGluZXMgPSByYXdUZXh0LnNwbGl0KC9cXHI/XFxuL2cpXG4gICAgICBsaW5lcyA9IHJhd0xpbmVzLm1hcCAobGluZSkgLT5cbiAgICAgICAgbGluZS5yZXBsYWNlKC9cXHMvZywgXCIgXCIpLnRyaW1SaWdodCgpXG4gICAgICB0ZXh0ID0gbGluZXMuam9pbihcIlxcblwiKVxuICAgIGF0b20uY2xpcGJvYXJkLndyaXRlIHRleHRcblxuICBwYXN0ZTogLT5cbiAgICBAaW5wdXQgYXRvbS5jbGlwYm9hcmQucmVhZCgpXG5cbiAgaW5zZXJ0U2VsZWN0aW9uOiAoY3VzdG9tVGV4dCkgLT5cbiAgICByZXR1cm4gdW5sZXNzIGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgIHJ1bkNvbW1hbmQgPSBhdG9tLmNvbmZpZy5nZXQoJ3BsYXRmb3JtaW8taWRlLXRlcm1pbmFsLnRvZ2dsZXMucnVuSW5zZXJ0ZWRUZXh0JylcbiAgICBzZWxlY3Rpb25UZXh0ID0gJydcbiAgICBpZiBzZWxlY3Rpb24gPSBlZGl0b3IuZ2V0U2VsZWN0ZWRUZXh0KClcbiAgICAgIEB0ZXJtaW5hbC5zdG9wU2Nyb2xsaW5nKClcbiAgICAgIHNlbGVjdGlvblRleHQgPSBzZWxlY3Rpb25cbiAgICBlbHNlIGlmIGN1cnNvciA9IGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpXG4gICAgICBsaW5lID0gZWRpdG9yLmxpbmVUZXh0Rm9yQnVmZmVyUm93KGN1cnNvci5yb3cpXG4gICAgICBAdGVybWluYWwuc3RvcFNjcm9sbGluZygpXG4gICAgICBzZWxlY3Rpb25UZXh0ID0gbGluZVxuICAgICAgZWRpdG9yLm1vdmVEb3duKDEpO1xuICAgIEBpbnB1dCBcIiN7Y3VzdG9tVGV4dC5cbiAgICAgIHJlcGxhY2UoL1xcJEwvLCBcIiN7ZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCkucm93ICsgMX1cIikuXG4gICAgICByZXBsYWNlKC9cXCRGLywgcGF0aC5iYXNlbmFtZShlZGl0b3I/LmJ1ZmZlcj8uZmlsZT8ucGF0aCkpLlxuICAgICAgcmVwbGFjZSgvXFwkRC8sIHBhdGguZGlybmFtZShlZGl0b3I/LmJ1ZmZlcj8uZmlsZT8ucGF0aCkpLlxuICAgICAgcmVwbGFjZSgvXFwkUy8sIHNlbGVjdGlvblRleHQpLlxuICAgICAgcmVwbGFjZSgvXFwkXFwkLywgJyQnKX0je2lmIHJ1bkNvbW1hbmQgdGhlbiBvcy5FT0wgZWxzZSAnJ31cIlxuXG4gIGZvY3VzOiA9PlxuICAgIEByZXNpemVUZXJtaW5hbFRvVmlldygpXG4gICAgQGZvY3VzVGVybWluYWwoKVxuICAgIEBzdGF0dXNCYXIuc2V0QWN0aXZlVGVybWluYWxWaWV3KHRoaXMpXG4gICAgc3VwZXIoKVxuXG4gIGJsdXI6ID0+XG4gICAgQGJsdXJUZXJtaW5hbCgpXG4gICAgc3VwZXIoKVxuXG4gIGZvY3VzVGVybWluYWw6ID0+XG4gICAgcmV0dXJuIHVubGVzcyBAdGVybWluYWxcblxuICAgIEB0ZXJtaW5hbC5mb2N1cygpXG4gICAgaWYgQHRlcm1pbmFsLl90ZXh0YXJlYVxuICAgICAgQHRlcm1pbmFsLl90ZXh0YXJlYS5mb2N1cygpXG4gICAgZWxzZVxuICAgICAgQHRlcm1pbmFsLmVsZW1lbnQuZm9jdXMoKVxuXG4gIGJsdXJUZXJtaW5hbDogPT5cbiAgICByZXR1cm4gdW5sZXNzIEB0ZXJtaW5hbFxuXG4gICAgQHRlcm1pbmFsLmJsdXIoKVxuICAgIEB0ZXJtaW5hbC5lbGVtZW50LmJsdXIoKVxuXG4gIHJlc2l6ZVRlcm1pbmFsVG9WaWV3OiAtPlxuICAgIHJldHVybiB1bmxlc3MgQHBhbmVsLmlzVmlzaWJsZSgpIG9yIEB0YWJWaWV3XG5cbiAgICB7Y29scywgcm93c30gPSBAZ2V0RGltZW5zaW9ucygpXG4gICAgcmV0dXJuIHVubGVzcyBjb2xzID4gMCBhbmQgcm93cyA+IDBcbiAgICByZXR1cm4gdW5sZXNzIEB0ZXJtaW5hbFxuICAgIHJldHVybiBpZiBAdGVybWluYWwucm93cyBpcyByb3dzIGFuZCBAdGVybWluYWwuY29scyBpcyBjb2xzXG5cbiAgICBAcmVzaXplIGNvbHMsIHJvd3NcbiAgICBAdGVybWluYWwucmVzaXplIGNvbHMsIHJvd3NcblxuICBnZXREaW1lbnNpb25zOiAtPlxuICAgIGZha2VSb3cgPSAkKFwiPGRpdj48c3Bhbj4mbmJzcDs8L3NwYW4+PC9kaXY+XCIpXG5cbiAgICBpZiBAdGVybWluYWxcbiAgICAgIEBmaW5kKCcudGVybWluYWwnKS5hcHBlbmQgZmFrZVJvd1xuICAgICAgZmFrZUNvbCA9IGZha2VSb3cuY2hpbGRyZW4oKS5maXJzdCgpWzBdLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgICBjb2xzID0gTWF0aC5mbG9vciBAeHRlcm0ud2lkdGgoKSAvIChmYWtlQ29sLndpZHRoIG9yIDkpXG4gICAgICByb3dzID0gTWF0aC5mbG9vciBAeHRlcm0uaGVpZ2h0KCkgLyAoZmFrZUNvbC5oZWlnaHQgb3IgMjApXG4gICAgICBAcm93SGVpZ2h0ID0gZmFrZUNvbC5oZWlnaHRcbiAgICAgIGZha2VSb3cucmVtb3ZlKClcbiAgICBlbHNlXG4gICAgICBjb2xzID0gTWF0aC5mbG9vciBAeHRlcm0ud2lkdGgoKSAvIDlcbiAgICAgIHJvd3MgPSBNYXRoLmZsb29yIEB4dGVybS5oZWlnaHQoKSAvIDIwXG5cbiAgICB7Y29scywgcm93c31cblxuICBvblRyYW5zaXRpb25FbmQ6IChjYWxsYmFjaykgLT5cbiAgICBAeHRlcm0ub25lICd3ZWJraXRUcmFuc2l0aW9uRW5kJywgPT5cbiAgICAgIGNhbGxiYWNrKClcbiAgICAgIEBhbmltYXRpbmcgPSBmYWxzZVxuXG4gIGlucHV0RGlhbG9nOiAtPlxuICAgIElucHV0RGlhbG9nID89IHJlcXVpcmUoJy4vaW5wdXQtZGlhbG9nJylcbiAgICBkaWFsb2cgPSBuZXcgSW5wdXREaWFsb2cgdGhpc1xuICAgIGRpYWxvZy5hdHRhY2goKVxuXG4gIHJlbmFtZTogLT5cbiAgICBAc3RhdHVzSWNvbi5yZW5hbWUoKVxuXG4gIHRvZ2dsZVRhYlZpZXc6IC0+XG4gICAgaWYgQHRhYlZpZXdcbiAgICAgIEBwYW5lbCA9IGF0b20ud29ya3NwYWNlLmFkZEJvdHRvbVBhbmVsKGl0ZW06IHRoaXMsIHZpc2libGU6IGZhbHNlKVxuICAgICAgQGF0dGFjaFJlc2l6ZUV2ZW50cygpXG4gICAgICBAY2xvc2VCdG4uc2hvdygpXG4gICAgICBAaGlkZUJ0bi5zaG93KClcbiAgICAgIEBtYXhpbWl6ZUJ0bi5zaG93KClcbiAgICAgIEB0YWJWaWV3ID0gZmFsc2VcbiAgICBlbHNlXG4gICAgICBAcGFuZWwuZGVzdHJveSgpXG4gICAgICBAZGV0YWNoUmVzaXplRXZlbnRzKClcbiAgICAgIEBjbG9zZUJ0bi5oaWRlKClcbiAgICAgIEBoaWRlQnRuLmhpZGUoKVxuICAgICAgQG1heGltaXplQnRuLmhpZGUoKVxuICAgICAgQHh0ZXJtLmNzcyBcImhlaWdodFwiLCBcIlwiXG4gICAgICBAdGFiVmlldyA9IHRydWVcbiAgICAgIGxhc3RPcGVuZWRWaWV3ID0gbnVsbCBpZiBsYXN0T3BlbmVkVmlldyA9PSB0aGlzXG5cbiAgZ2V0VGl0bGU6IC0+XG4gICAgQHN0YXR1c0ljb24uZ2V0TmFtZSgpIG9yIFwicGxhdGZvcm1pby1pZGUtdGVybWluYWxcIlxuXG4gIGdldEljb25OYW1lOiAtPlxuICAgIFwidGVybWluYWxcIlxuXG4gIGdldFNoZWxsOiAtPlxuICAgIHJldHVybiBwYXRoLmJhc2VuYW1lIEBzaGVsbFxuXG4gIGdldFNoZWxsUGF0aDogLT5cbiAgICByZXR1cm4gQHNoZWxsXG5cbiAgZW1pdDogKGV2ZW50LCBkYXRhKSAtPlxuICAgIEBlbWl0dGVyLmVtaXQgZXZlbnQsIGRhdGFcblxuICBvbkRpZENoYW5nZVRpdGxlOiAoY2FsbGJhY2spIC0+XG4gICAgQGVtaXR0ZXIub24gJ2RpZC1jaGFuZ2UtdGl0bGUnLCBjYWxsYmFja1xuXG4gIGdldFBhdGg6IC0+XG4gICAgcmV0dXJuIEBnZXRUZXJtaW5hbFRpdGxlKClcblxuICBnZXRUZXJtaW5hbFRpdGxlOiAtPlxuICAgIHJldHVybiBAdGl0bGUgb3IgQHByb2Nlc3NcblxuICBnZXRUZXJtaW5hbDogLT5cbiAgICByZXR1cm4gQHRlcm1pbmFsXG5cbiAgaXNBbmltYXRpbmc6IC0+XG4gICAgcmV0dXJuIEBhbmltYXRpbmdcbiJdfQ==
