(function() {
  "use strict";
  var $, Beautifiers, CompositeDisposable, LoadingView, Promise, _, async, beautifier, beautify, beautifyDirectory, beautifyFile, beautifyFilePath, debug, defaultLanguageOptions, dir, fs, getCursors, getScrollTop, getUnsupportedOptions, handleSaveEvent, loadingView, logger, path, pkg, plugin, setCursors, setScrollTop, showError, strip, yaml;

  pkg = require('../package.json');

  plugin = module.exports;

  CompositeDisposable = require('event-kit').CompositeDisposable;

  _ = require("lodash");

  Beautifiers = require("./beautifiers");

  beautifier = new Beautifiers();

  defaultLanguageOptions = beautifier.options;

  logger = require('./logger')(__filename);

  Promise = require('bluebird');

  fs = null;

  path = require("path");

  strip = null;

  yaml = null;

  async = null;

  dir = null;

  LoadingView = null;

  loadingView = null;

  $ = null;

  getScrollTop = function(editor) {
    var view;
    view = atom.views.getView(editor);
    return view != null ? view.getScrollTop() : void 0;
  };

  setScrollTop = function(editor, value) {
    var view;
    view = atom.views.getView(editor);
    return view != null ? view.setScrollTop(value) : void 0;
  };

  getCursors = function(editor) {
    var bufferPosition, cursor, cursors, j, len, posArray;
    cursors = editor.getCursors();
    posArray = [];
    for (j = 0, len = cursors.length; j < len; j++) {
      cursor = cursors[j];
      bufferPosition = cursor.getBufferPosition();
      posArray.push([bufferPosition.row, bufferPosition.column]);
    }
    return posArray;
  };

  setCursors = function(editor, posArray) {
    var bufferPosition, i, j, len;
    for (i = j = 0, len = posArray.length; j < len; i = ++j) {
      bufferPosition = posArray[i];
      if (i === 0) {
        editor.setCursorBufferPosition(bufferPosition);
        continue;
      }
      editor.addCursorAtBufferPosition(bufferPosition);
    }
  };

  beautifier.on('beautify::start', function() {
    if (LoadingView == null) {
      LoadingView = require("./views/loading-view");
    }
    if (loadingView == null) {
      loadingView = new LoadingView();
    }
    return loadingView.show();
  });

  beautifier.on('beautify::end', function() {
    return loadingView != null ? loadingView.hide() : void 0;
  });

  showError = function(error) {
    var detail, ref, stack;
    if (!atom.config.get("atom-beautify.general.muteAllErrors")) {
      stack = error.stack;
      detail = error.description || error.message;
      return (ref = atom.notifications) != null ? ref.addError(error.message, {
        stack: stack,
        detail: detail,
        dismissable: true
      }) : void 0;
    }
  };

  beautify = function(arg) {
    var editor, onSave;
    editor = arg.editor, onSave = arg.onSave;
    return new Promise(function(resolve, reject) {
      var allOptions, beautifyCompleted, e, editedFilePath, forceEntireFile, grammarName, isSelection, oldText, text;
      plugin.checkUnsupportedOptions();
      if (path == null) {
        path = require("path");
      }
      forceEntireFile = onSave && atom.config.get("atom-beautify.general.beautifyEntireFileOnSave");
      beautifyCompleted = function(text) {
        var error, origScrollTop, posArray, selectedBufferRange;
        if (text == null) {

        } else if (text instanceof Error) {
          showError(text);
          return reject(text);
        } else if (typeof text === "string") {
          if (oldText !== text) {
            posArray = getCursors(editor);
            origScrollTop = getScrollTop(editor);
            if (!forceEntireFile && isSelection) {
              selectedBufferRange = editor.getSelectedBufferRange();
              editor.setTextInBufferRange(selectedBufferRange, text);
            } else {
              editor.setText(text);
            }
            setCursors(editor, posArray);
            setTimeout((function() {
              setScrollTop(editor, origScrollTop);
              return resolve(text);
            }), 0);
          }
        } else {
          error = new Error("Unsupported beautification result '" + text + "'.");
          showError(error);
          return reject(error);
        }
      };
      editor = editor != null ? editor : atom.workspace.getActiveTextEditor();
      if (editor == null) {
        return showError(new Error("Active Editor not found. ", "Please select a Text Editor first to beautify."));
      }
      isSelection = !!editor.getSelectedText();
      editedFilePath = editor.getPath();
      allOptions = beautifier.getOptionsForPath(editedFilePath, editor);
      text = void 0;
      if (!forceEntireFile && isSelection) {
        text = editor.getSelectedText();
      } else {
        text = editor.getText();
      }
      oldText = text;
      grammarName = editor.getGrammar().name;
      try {
        beautifier.beautify(text, allOptions, grammarName, editedFilePath, {
          onSave: onSave
        }).then(beautifyCompleted)["catch"](beautifyCompleted);
      } catch (error1) {
        e = error1;
        showError(e);
      }
    });
  };

  beautifyFilePath = function(filePath, callback) {
    var $el, cb;
    logger.verbose('beautifyFilePath', filePath);
    if ($ == null) {
      $ = require("atom-space-pen-views").$;
    }
    $el = $(".icon-file-text[data-path=\"" + filePath + "\"]");
    $el.addClass('beautifying');
    cb = function(err, result) {
      logger.verbose('Cleanup beautifyFilePath', err, result);
      $el = $(".icon-file-text[data-path=\"" + filePath + "\"]");
      $el.removeClass('beautifying');
      return callback(err, result);
    };
    if (fs == null) {
      fs = require("fs");
    }
    logger.verbose('readFile', filePath);
    return fs.readFile(filePath, function(err, data) {
      var allOptions, completionFun, e, grammar, grammarName, input;
      logger.verbose('readFile completed', err, filePath);
      if (err) {
        return cb(err);
      }
      input = data != null ? data.toString() : void 0;
      grammar = atom.grammars.selectGrammar(filePath, input);
      grammarName = grammar.name;
      allOptions = beautifier.getOptionsForPath(filePath);
      logger.verbose('beautifyFilePath allOptions', allOptions);
      completionFun = function(output) {
        logger.verbose('beautifyFilePath completionFun', output);
        if (output instanceof Error) {
          return cb(output, null);
        } else if (typeof output === "string") {
          if (output.trim() === '') {
            logger.verbose('beautifyFilePath, output was empty string!');
            return cb(null, output);
          }
          return fs.writeFile(filePath, output, function(err) {
            if (err) {
              return cb(err);
            }
            return cb(null, output);
          });
        } else {
          return cb(new Error("Unknown beautification result " + output + "."), output);
        }
      };
      try {
        logger.verbose('beautify', input, allOptions, grammarName, filePath);
        return beautifier.beautify(input, allOptions, grammarName, filePath).then(completionFun)["catch"](completionFun);
      } catch (error1) {
        e = error1;
        return cb(e);
      }
    });
  };

  beautifyFile = function(arg) {
    var filePath, target;
    target = arg.target;
    filePath = target.dataset.path;
    if (!filePath) {
      return;
    }
    beautifyFilePath(filePath, function(err, result) {
      if (err) {
        return showError(err);
      }
    });
  };

  beautifyDirectory = function(arg) {
    var $el, dirPath, target;
    target = arg.target;
    dirPath = target.dataset.path;
    if (!dirPath) {
      return;
    }
    if ((typeof atom !== "undefined" && atom !== null ? atom.confirm({
      message: "This will beautify all of the files found recursively in this directory, '" + dirPath + "'. Do you want to continue?",
      buttons: ['Yes, continue!', 'No, cancel!']
    }) : void 0) !== 0) {
      return;
    }
    if ($ == null) {
      $ = require("atom-space-pen-views").$;
    }
    $el = $(".icon-file-directory[data-path=\"" + dirPath + "\"]");
    $el.addClass('beautifying');
    if (dir == null) {
      dir = require("node-dir");
    }
    if (async == null) {
      async = require("async");
    }
    dir.files(dirPath, function(err, files) {
      if (err) {
        return showError(err);
      }
      return async.each(files, function(filePath, callback) {
        return beautifyFilePath(filePath, function() {
          return callback();
        });
      }, function(err) {
        $el = $(".icon-file-directory[data-path=\"" + dirPath + "\"]");
        return $el.removeClass('beautifying');
      });
    });
  };

  debug = function() {
    var GitHubApi, addHeader, addInfo, allOptions, beautifiers, codeBlockSyntax, debugInfo, detail, editor, error, filePath, github, grammarName, headers, language, linkifyTitle, open, ref, ref1, selectedBeautifier, stack, text, tocEl;
    try {
      open = require("open");
      if (fs == null) {
        fs = require("fs");
      }
      GitHubApi = require("github");
      github = new GitHubApi();
      plugin.checkUnsupportedOptions();
      editor = atom.workspace.getActiveTextEditor();
      linkifyTitle = function(title) {
        var p, sep;
        title = title.toLowerCase();
        p = title.split(/[\s,+#;,\/?:@&=+$]+/);
        sep = "-";
        return p.join(sep);
      };
      if (editor == null) {
        return confirm("Active Editor not found.\n" + "Please select a Text Editor first to beautify.");
      }
      if (!confirm('Are you ready to debug Atom Beautify?\n\n' + 'Warning: This will create an anonymous Gist on GitHub (publically accessible and cannot be easily deleted) ' + 'containing the contents of your active Text Editor.\n' + 'Be sure to delete any private text from your active Text Editor before continuing ' + 'to ensure you are not sharing undesirable private information.')) {
        return;
      }
      debugInfo = "";
      headers = [];
      tocEl = "<TABLEOFCONTENTS/>";
      addInfo = function(key, val) {
        if (key != null) {
          return debugInfo += "**" + key + "**: " + val + "\n\n";
        } else {
          return debugInfo += val + "\n\n";
        }
      };
      addHeader = function(level, title) {
        debugInfo += (Array(level + 1).join('#')) + " " + title + "\n\n";
        return headers.push({
          level: level,
          title: title
        });
      };
      addHeader(1, "Atom Beautify - Debugging information");
      debugInfo += "The following debugging information was " + ("generated by `Atom Beautify` on `" + (new Date()) + "`.") + "\n\n---\n\n" + tocEl + "\n\n---\n\n";
      addInfo('Platform', process.platform);
      addHeader(2, "Versions");
      addInfo('Atom Version', atom.appVersion);
      addInfo('Atom Beautify Version', pkg.version);
      addHeader(2, "Original file to be beautified");
      filePath = editor.getPath();
      addInfo('Original File Path', "`" + filePath + "`");
      grammarName = editor.getGrammar().name;
      addInfo('Original File Grammar', grammarName);
      language = beautifier.getLanguage(grammarName, filePath);
      addInfo('Original File Language', language != null ? language.name : void 0);
      addInfo('Language namespace', language != null ? language.namespace : void 0);
      beautifiers = beautifier.getBeautifiers(language.name);
      addInfo('Supported Beautifiers', _.map(beautifiers, 'name').join(', '));
      selectedBeautifier = beautifier.getBeautifierForLanguage(language);
      addInfo('Selected Beautifier', selectedBeautifier.name);
      text = editor.getText() || "";
      codeBlockSyntax = ((ref = language != null ? language.name : void 0) != null ? ref : grammarName).toLowerCase().split(' ')[0];
      addHeader(3, 'Original File Contents');
      addInfo(null, "\n```" + codeBlockSyntax + "\n" + text + "\n```");
      addHeader(3, 'Package Settings');
      addInfo(null, "The raw package settings options\n" + ("```json\n" + (JSON.stringify(atom.config.get('atom-beautify'), void 0, 4)) + "\n```"));
      addHeader(2, "Beautification options");
      allOptions = beautifier.getOptionsForPath(filePath, editor);
      return Promise.all(allOptions).then(function(allOptions) {
        var cb, configOptions, e, editorConfigOptions, editorOptions, finalOptions, homeOptions, logFilePathRegex, logs, preTransformedOptions, projectOptions, subscription;
        editorOptions = allOptions[0], configOptions = allOptions[1], homeOptions = allOptions[2], editorConfigOptions = allOptions[3];
        projectOptions = allOptions.slice(4);
        preTransformedOptions = beautifier.getOptionsForLanguage(allOptions, language);
        if (selectedBeautifier) {
          finalOptions = beautifier.transformOptions(selectedBeautifier, language.name, preTransformedOptions);
        }
        addInfo('Editor Options', "\n" + "Options from Atom Editor settings\n" + ("```json\n" + (JSON.stringify(editorOptions, void 0, 4)) + "\n```"));
        addInfo('Config Options', "\n" + "Options from Atom Beautify package settings\n" + ("```json\n" + (JSON.stringify(configOptions, void 0, 4)) + "\n```"));
        addInfo('Home Options', "\n" + ("Options from `" + (path.resolve(beautifier.getUserHome(), '.jsbeautifyrc')) + "`\n") + ("```json\n" + (JSON.stringify(homeOptions, void 0, 4)) + "\n```"));
        addInfo('EditorConfig Options', "\n" + "Options from [EditorConfig](http://editorconfig.org/) file\n" + ("```json\n" + (JSON.stringify(editorConfigOptions, void 0, 4)) + "\n```"));
        addInfo('Project Options', "\n" + ("Options from `.jsbeautifyrc` files starting from directory `" + (path.dirname(filePath)) + "` and going up to root\n") + ("```json\n" + (JSON.stringify(projectOptions, void 0, 4)) + "\n```"));
        addInfo('Pre-Transformed Options', "\n" + "Combined options before transforming them given a beautifier's specifications\n" + ("```json\n" + (JSON.stringify(preTransformedOptions, void 0, 4)) + "\n```"));
        if (selectedBeautifier) {
          addHeader(3, 'Final Options');
          addInfo(null, "Final combined and transformed options that are used\n" + ("```json\n" + (JSON.stringify(finalOptions, void 0, 4)) + "\n```"));
        }
        logs = "";
        logFilePathRegex = new RegExp('\\: \\[(.*)\\]');
        subscription = logger.onLogging(function(msg) {
          var sep;
          sep = path.sep;
          return logs += msg.replace(logFilePathRegex, function(a, b) {
            var i, p, s;
            s = b.split(sep);
            i = s.indexOf('atom-beautify');
            p = s.slice(i + 2).join(sep);
            return ': [' + p + ']';
          });
        });
        cb = function(result) {
          var JsDiff, bullet, diff, header, indent, indentNum, j, len, toc;
          subscription.dispose();
          addHeader(2, "Results");
          addInfo('Beautified File Contents', "\n```" + codeBlockSyntax + "\n" + result + "\n```");
          JsDiff = require('diff');
          if (typeof result === "string") {
            diff = JsDiff.createPatch(filePath || "", text || "", result || "", "original", "beautified");
            addInfo('Original vs. Beautified Diff', "\n```" + codeBlockSyntax + "\n" + diff + "\n```");
          }
          addHeader(3, "Logs");
          addInfo(null, "```\n" + logs + "\n```");
          toc = "## Table Of Contents\n";
          for (j = 0, len = headers.length; j < len; j++) {
            header = headers[j];

            /*
            - Heading 1
              - Heading 1.1
             */
            indent = "  ";
            bullet = "-";
            indentNum = header.level - 2;
            if (indentNum >= 0) {
              toc += "" + (Array(indentNum + 1).join(indent)) + bullet + " [" + header.title + "](\#" + (linkifyTitle(header.title)) + ")\n";
            }
          }
          debugInfo = debugInfo.replace(tocEl, toc);
          return github.gists.create({
            files: {
              "debug.md": {
                "content": debugInfo
              }
            },
            "public": true,
            description: "Atom-Beautify debugging information"
          }, function(err, res) {
            var body, gistUrl, issueTemplate;
            if (err) {
              return confirm("An error occurred when creating the Gist: " + err);
            } else {
              gistUrl = res.html_url;
              open(gistUrl);
              confirm(("Your Atom Beautify debugging information can be found in the public Gist:\n" + res.html_url + "\n\n") + 'Warning: Be sure to look over the debug info before you send it ' + 'to ensure you are not sharing undesirable private information.\n\n' + 'If you want to delete this anonymous Gist read\n' + 'https://help.github.com/articles/deleting-an-anonymous-gist/');
              if (!confirm("Would you like to create a new Issue on GitHub now?")) {
                return;
              }
              issueTemplate = fs.readFileSync(path.resolve(__dirname, "../ISSUE_TEMPLATE.md")).toString();
              body = issueTemplate.replace("<INSERT GIST HERE>", gistUrl);
              return open("https://github.com/Glavin001/atom-beautify/issues/new?body=" + (encodeURIComponent(body)));
            }
          });
        };
        try {
          return beautifier.beautify(text, allOptions, grammarName, filePath).then(cb)["catch"](cb);
        } catch (error1) {
          e = error1;
          return cb(e);
        }
      })["catch"](function(error) {
        var detail, ref1, stack;
        stack = error.stack;
        detail = error.description || error.message;
        return typeof atom !== "undefined" && atom !== null ? (ref1 = atom.notifications) != null ? ref1.addError(error.message, {
          stack: stack,
          detail: detail,
          dismissable: true
        }) : void 0 : void 0;
      });
    } catch (error1) {
      error = error1;
      stack = error.stack;
      detail = error.description || error.message;
      return typeof atom !== "undefined" && atom !== null ? (ref1 = atom.notifications) != null ? ref1.addError(error.message, {
        stack: stack,
        detail: detail,
        dismissable: true
      }) : void 0 : void 0;
    }
  };

  handleSaveEvent = function() {
    return atom.workspace.observeTextEditors(function(editor) {
      var beautifyOnSaveHandler, disposable, pendingPaths;
      pendingPaths = {};
      beautifyOnSaveHandler = function(arg) {
        var beautifyOnSave, buffer, fileExtension, filePath, grammar, key, language, languages;
        filePath = arg.path;
        logger.verbose('Should beautify on this save?');
        if (pendingPaths[filePath]) {
          logger.verbose("Editor with file path " + filePath + " already beautified!");
          return;
        }
        buffer = editor.getBuffer();
        if (path == null) {
          path = require('path');
        }
        grammar = editor.getGrammar().name;
        fileExtension = path.extname(filePath);
        fileExtension = fileExtension.substr(1);
        languages = beautifier.languages.getLanguages({
          grammar: grammar,
          extension: fileExtension
        });
        if (languages.length < 1) {
          return;
        }
        language = languages[0];
        key = "atom-beautify." + language.namespace + ".beautify_on_save";
        beautifyOnSave = atom.config.get(key);
        logger.verbose('save editor positions', key, beautifyOnSave);
        if (beautifyOnSave) {
          logger.verbose('Beautifying file', filePath);
          return beautify({
            editor: editor,
            onSave: true
          }).then(function() {
            logger.verbose('Done beautifying file', filePath);
            if (editor.isAlive() === true) {
              logger.verbose('Saving TextEditor...');
              pendingPaths[filePath] = true;
              editor.save();
              delete pendingPaths[filePath];
              return logger.verbose('Saved TextEditor.');
            }
          })["catch"](function(error) {
            return showError(error);
          });
        }
      };
      disposable = editor.onDidSave(function(arg) {
        var filePath;
        filePath = arg.path;
        return beautifyOnSaveHandler({
          path: filePath
        });
      });
      return plugin.subscriptions.add(disposable);
    });
  };

  getUnsupportedOptions = function() {
    var schema, settings, unsupportedOptions;
    settings = atom.config.get('atom-beautify');
    schema = atom.config.getSchema('atom-beautify');
    unsupportedOptions = _.filter(_.keys(settings), function(key) {
      return schema.properties[key] === void 0;
    });
    return unsupportedOptions;
  };

  plugin.checkUnsupportedOptions = function() {
    var unsupportedOptions;
    unsupportedOptions = getUnsupportedOptions();
    if (unsupportedOptions.length !== 0) {
      return atom.notifications.addWarning("Please run Atom command 'Atom-Beautify: Migrate Settings'.", {
        detail: "You can open the Atom command palette with `cmd-shift-p` (OSX) or `ctrl-shift-p` (Linux/Windows) in Atom. You have unsupported options: " + (unsupportedOptions.join(', ')),
        dismissable: true
      });
    }
  };

  plugin.migrateSettings = function() {
    var namespaces, rename, rex, unsupportedOptions;
    unsupportedOptions = getUnsupportedOptions();
    namespaces = beautifier.languages.namespaces;
    if (unsupportedOptions.length === 0) {
      return atom.notifications.addSuccess("No options to migrate.");
    } else {
      rex = new RegExp("(" + (namespaces.join('|')) + ")_(.*)");
      rename = _.toPairs(_.zipObject(unsupportedOptions, _.map(unsupportedOptions, function(key) {
        var m;
        m = key.match(rex);
        if (m === null) {
          return "general." + key;
        } else {
          return m[1] + "." + m[2];
        }
      })));
      _.each(rename, function(arg) {
        var key, newKey, val;
        key = arg[0], newKey = arg[1];
        val = atom.config.get("atom-beautify." + key);
        atom.config.set("atom-beautify." + newKey, val);
        return atom.config.set("atom-beautify." + key, void 0);
      });
      return atom.notifications.addSuccess("Successfully migrated options: " + (unsupportedOptions.join(', ')));
    }
  };

  plugin.config = _.merge(require('./config.coffee'), defaultLanguageOptions);

  plugin.activate = function() {
    this.subscriptions = new CompositeDisposable;
    this.subscriptions.add(handleSaveEvent());
    this.subscriptions.add(atom.commands.add("atom-workspace", "atom-beautify:beautify-editor", beautify));
    this.subscriptions.add(atom.commands.add("atom-workspace", "atom-beautify:help-debug-editor", debug));
    this.subscriptions.add(atom.commands.add(".tree-view .file .name", "atom-beautify:beautify-file", beautifyFile));
    this.subscriptions.add(atom.commands.add(".tree-view .directory .name", "atom-beautify:beautify-directory", beautifyDirectory));
    return this.subscriptions.add(atom.commands.add("atom-workspace", "atom-beautify:migrate-settings", plugin.migrateSettings));
  };

  plugin.deactivate = function() {
    return this.subscriptions.dispose();
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvc2VwaXJvcGh0Ly5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2JlYXV0aWZ5LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQTtFQUFBO0FBQUEsTUFBQTs7RUFDQSxHQUFBLEdBQU0sT0FBQSxDQUFRLGlCQUFSOztFQUdOLE1BQUEsR0FBUyxNQUFNLENBQUM7O0VBQ2Ysc0JBQXVCLE9BQUEsQ0FBUSxXQUFSOztFQUN4QixDQUFBLEdBQUksT0FBQSxDQUFRLFFBQVI7O0VBQ0osV0FBQSxHQUFjLE9BQUEsQ0FBUSxlQUFSOztFQUNkLFVBQUEsR0FBaUIsSUFBQSxXQUFBLENBQUE7O0VBQ2pCLHNCQUFBLEdBQXlCLFVBQVUsQ0FBQzs7RUFDcEMsTUFBQSxHQUFTLE9BQUEsQ0FBUSxVQUFSLENBQUEsQ0FBb0IsVUFBcEI7O0VBQ1QsT0FBQSxHQUFVLE9BQUEsQ0FBUSxVQUFSOztFQUdWLEVBQUEsR0FBSzs7RUFDTCxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7O0VBQ1AsS0FBQSxHQUFROztFQUNSLElBQUEsR0FBTzs7RUFDUCxLQUFBLEdBQVE7O0VBQ1IsR0FBQSxHQUFNOztFQUNOLFdBQUEsR0FBYzs7RUFDZCxXQUFBLEdBQWM7O0VBQ2QsQ0FBQSxHQUFJOztFQU1KLFlBQUEsR0FBZSxTQUFDLE1BQUQ7QUFDYixRQUFBO0lBQUEsSUFBQSxHQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBWCxDQUFtQixNQUFuQjswQkFDUCxJQUFJLENBQUUsWUFBTixDQUFBO0VBRmE7O0VBR2YsWUFBQSxHQUFlLFNBQUMsTUFBRCxFQUFTLEtBQVQ7QUFDYixRQUFBO0lBQUEsSUFBQSxHQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBWCxDQUFtQixNQUFuQjswQkFDUCxJQUFJLENBQUUsWUFBTixDQUFtQixLQUFuQjtFQUZhOztFQUlmLFVBQUEsR0FBYSxTQUFDLE1BQUQ7QUFDWCxRQUFB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bEIsRUFBb0MsaUNBQXBDLEVBQXVFLEtBQXZFLENBQW5CO0lBQ0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQix3QkFBbEIsRUFBNEMsNkJBQTVDLEVBQTJFLFlBQTNFLENBQW5CO0lBQ0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQiw2QkFBbEIsRUFBaUQsa0NBQWpELEVBQXFGLGlCQUFyRixDQUFuQjtXQUNBLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0IsZ0JBQWxCLEVBQW9DLGdDQUFwQyxFQUFzRSxNQUFNLENBQUMsZUFBN0UsQ0FBbkI7RUFQZ0I7O0VBU2xCLE1BQU0sQ0FBQyxVQUFQLEdBQW9CLFNBQUE7V0FDbEIsSUFBQyxDQUFBLGFBQWEsQ0FBQyxPQUFmLENBQUE7RUFEa0I7QUFob0JwQiIsInNvdXJjZXNDb250ZW50IjpbIiMgZ2xvYmFsIGF0b21cblwidXNlIHN0cmljdFwiXG5wa2cgPSByZXF1aXJlKCcuLi9wYWNrYWdlLmpzb24nKVxuXG4jIERlcGVuZGVuY2llc1xucGx1Z2luID0gbW9kdWxlLmV4cG9ydHNcbntDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2V2ZW50LWtpdCdcbl8gPSByZXF1aXJlKFwibG9kYXNoXCIpXG5CZWF1dGlmaWVycyA9IHJlcXVpcmUoXCIuL2JlYXV0aWZpZXJzXCIpXG5iZWF1dGlmaWVyID0gbmV3IEJlYXV0aWZpZXJzKClcbmRlZmF1bHRMYW5ndWFnZU9wdGlvbnMgPSBiZWF1dGlmaWVyLm9wdGlvbnNcbmxvZ2dlciA9IHJlcXVpcmUoJy4vbG9nZ2VyJykoX19maWxlbmFtZSlcblByb21pc2UgPSByZXF1aXJlKCdibHVlYmlyZCcpXG5cbiMgTGF6eSBsb2FkZWQgZGVwZW5kZW5jaWVzXG5mcyA9IG51bGxcbnBhdGggPSByZXF1aXJlKFwicGF0aFwiKVxuc3RyaXAgPSBudWxsXG55YW1sID0gbnVsbFxuYXN5bmMgPSBudWxsXG5kaXIgPSBudWxsICMgTm9kZS1EaXJcbkxvYWRpbmdWaWV3ID0gbnVsbFxubG9hZGluZ1ZpZXcgPSBudWxsXG4kID0gbnVsbFxuXG4jIGZ1bmN0aW9uIGNsZWFuT3B0aW9ucyhkYXRhLCB0eXBlcykge1xuIyBub3B0LmNsZWFuKGRhdGEsIHR5cGVzKTtcbiMgcmV0dXJuIGRhdGE7XG4jIH1cbmdldFNjcm9sbFRvcCA9IChlZGl0b3IpIC0+XG4gIHZpZXcgPSBhdG9tLnZpZXdzLmdldFZpZXcoZWRpdG9yKVxuICB2aWV3Py5nZXRTY3JvbGxUb3AoKVxuc2V0U2Nyb2xsVG9wID0gKGVkaXRvciwgdmFsdWUpIC0+XG4gIHZpZXcgPSBhdG9tLnZpZXdzLmdldFZpZXcoZWRpdG9yKVxuICB2aWV3Py5zZXRTY3JvbGxUb3AgdmFsdWVcblxuZ2V0Q3Vyc29ycyA9IChlZGl0b3IpIC0+XG4gIGN1cnNvcnMgPSBlZGl0b3IuZ2V0Q3Vyc29ycygpXG4gIHBvc0FycmF5ID0gW11cbiAgZm9yIGN1cnNvciBpbiBjdXJzb3JzXG4gICAgYnVmZmVyUG9zaXRpb24gPSBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuICAgIHBvc0FycmF5LnB1c2ggW1xuICAgICAgYnVmZmVyUG9zaXRpb24ucm93XG4gICAgICBidWZmZXJQb3NpdGlvbi5jb2x1bW5cbiAgICBdXG4gIHBvc0FycmF5XG5zZXRDdXJzb3JzID0gKGVkaXRvciwgcG9zQXJyYXkpIC0+XG5cbiAgIyBjb25zb2xlLmxvZyBcInNldEN1cnNvcnM6XG4gIGZvciBidWZmZXJQb3NpdGlvbiwgaSBpbiBwb3NBcnJheVxuICAgIGlmIGkgaXMgMFxuICAgICAgZWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uIGJ1ZmZlclBvc2l0aW9uXG4gICAgICBjb250aW51ZVxuICAgIGVkaXRvci5hZGRDdXJzb3JBdEJ1ZmZlclBvc2l0aW9uIGJ1ZmZlclBvc2l0aW9uXG4gIHJldHVyblxuXG4jIFNob3cgYmVhdXRpZmljYXRpb24gcHJvZ3Jlc3MvbG9hZGluZyB2aWV3XG5iZWF1dGlmaWVyLm9uKCdiZWF1dGlmeTo6c3RhcnQnLCAtPlxuICBMb2FkaW5nVmlldyA/PSByZXF1aXJlIFwiLi92aWV3cy9sb2FkaW5nLXZpZXdcIlxuICBsb2FkaW5nVmlldyA/PSBuZXcgTG9hZGluZ1ZpZXcoKVxuICBsb2FkaW5nVmlldy5zaG93KClcbilcbmJlYXV0aWZpZXIub24oJ2JlYXV0aWZ5OjplbmQnLCAtPlxuICBsb2FkaW5nVmlldz8uaGlkZSgpXG4pXG4jIFNob3cgZXJyb3JcbnNob3dFcnJvciA9IChlcnJvcikgLT5cbiAgaWYgbm90IGF0b20uY29uZmlnLmdldChcImF0b20tYmVhdXRpZnkuZ2VuZXJhbC5tdXRlQWxsRXJyb3JzXCIpXG4gICAgIyBjb25zb2xlLmxvZyhlKVxuICAgIHN0YWNrID0gZXJyb3Iuc3RhY2tcbiAgICBkZXRhaWwgPSBlcnJvci5kZXNjcmlwdGlvbiBvciBlcnJvci5tZXNzYWdlXG4gICAgYXRvbS5ub3RpZmljYXRpb25zPy5hZGRFcnJvcihlcnJvci5tZXNzYWdlLCB7XG4gICAgICBzdGFjaywgZGV0YWlsLCBkaXNtaXNzYWJsZSA6IHRydWV9KVxuXG5iZWF1dGlmeSA9ICh7ZWRpdG9yLCBvblNhdmV9KSAtPlxuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgLT5cblxuICAgIHBsdWdpbi5jaGVja1Vuc3VwcG9ydGVkT3B0aW9ucygpXG5cbiAgICAjIENvbnRpbnVlIGJlYXV0aWZ5aW5nXG4gICAgcGF0aCA/PSByZXF1aXJlKFwicGF0aFwiKVxuICAgIGZvcmNlRW50aXJlRmlsZSA9IG9uU2F2ZSBhbmQgYXRvbS5jb25maWcuZ2V0KFwiYXRvbS1iZWF1dGlmeS5nZW5lcmFsLmJlYXV0aWZ5RW50aXJlRmlsZU9uU2F2ZVwiKVxuXG4gICAgIyBHZXQgdGhlIHBhdGggdG8gdGhlIGNvbmZpZyBmaWxlXG4gICAgIyBBbGwgb2YgdGhlIG9wdGlvbnNcbiAgICAjIExpc3RlZCBpbiBvcmRlciBmcm9tIGRlZmF1bHQgKGJhc2UpIHRvIHRoZSBvbmUgd2l0aCB0aGUgaGlnaGVzdCBwcmlvcml0eVxuICAgICMgTGVmdCA9IERlZmF1bHQsIFJpZ2h0ID0gV2lsbCBvdmVycmlkZSB0aGUgbGVmdC5cbiAgICAjIEF0b20gRWRpdG9yXG4gICAgI1xuICAgICMgVXNlcidzIEhvbWUgcGF0aFxuICAgICMgUHJvamVjdCBwYXRoXG4gICAgIyBBc3luY2hyb25vdXNseSBhbmQgY2FsbGJhY2stc3R5bGVcbiAgICBiZWF1dGlmeUNvbXBsZXRlZCA9ICh0ZXh0KSAtPlxuXG4gICAgICBpZiBub3QgdGV4dD9cbiAgICAgICAgIyBEbyBub3RoaW5nLCBpcyB1bmRlZmluZWRcbiAgICAgICAgIyBjb25zb2xlLmxvZyAnYmVhdXRpZnlDb21wbGV0ZWQnXG4gICAgICBlbHNlIGlmIHRleHQgaW5zdGFuY2VvZiBFcnJvclxuICAgICAgICBzaG93RXJyb3IodGV4dClcbiAgICAgICAgcmV0dXJuIHJlamVjdCh0ZXh0KVxuICAgICAgZWxzZSBpZiB0eXBlb2YgdGV4dCBpcyBcInN0cmluZ1wiXG4gICAgICAgIGlmIG9sZFRleHQgaXNudCB0ZXh0XG5cbiAgICAgICAgICAjIGNvbnNvbGUubG9nIFwiUmVwbGFjaW5nIGN1cnJlbnQgZWRpdG9yJ3MgdGV4dCB3aXRoIG5ldyB0ZXh0XCJcbiAgICAgICAgICBwb3NBcnJheSA9IGdldEN1cnNvcnMoZWRpdG9yKVxuXG4gICAgICAgICAgIyBjb25zb2xlLmxvZyBcInBvc0FycmF5OlxuICAgICAgICAgIG9yaWdTY3JvbGxUb3AgPSBnZXRTY3JvbGxUb3AoZWRpdG9yKVxuXG4gICAgICAgICAgIyBjb25zb2xlLmxvZyBcIm9yaWdTY3JvbGxUb3A6XG4gICAgICAgICAgaWYgbm90IGZvcmNlRW50aXJlRmlsZSBhbmQgaXNTZWxlY3Rpb25cbiAgICAgICAgICAgIHNlbGVjdGVkQnVmZmVyUmFuZ2UgPSBlZGl0b3IuZ2V0U2VsZWN0ZWRCdWZmZXJSYW5nZSgpXG5cbiAgICAgICAgICAgICMgY29uc29sZS5sb2cgXCJzZWxlY3RlZEJ1ZmZlclJhbmdlOlxuICAgICAgICAgICAgZWRpdG9yLnNldFRleHRJbkJ1ZmZlclJhbmdlIHNlbGVjdGVkQnVmZmVyUmFuZ2UsIHRleHRcbiAgICAgICAgICBlbHNlXG5cbiAgICAgICAgICAgICMgY29uc29sZS5sb2cgXCJzZXRUZXh0XCJcbiAgICAgICAgICAgIGVkaXRvci5zZXRUZXh0IHRleHRcblxuICAgICAgICAgICMgY29uc29sZS5sb2cgXCJzZXRDdXJzb3JzXCJcbiAgICAgICAgICBzZXRDdXJzb3JzIGVkaXRvciwgcG9zQXJyYXlcblxuICAgICAgICAgICMgY29uc29sZS5sb2cgXCJEb25lIHNldEN1cnNvcnNcIlxuICAgICAgICAgICMgTGV0IHRoZSBzY3JvbGxUb3Agc2V0dGluZyBydW4gYWZ0ZXIgYWxsIHRoZSBzYXZlIHJlbGF0ZWQgc3R1ZmYgaXMgcnVuLFxuICAgICAgICAgICMgb3RoZXJ3aXNlIHNldFNjcm9sbFRvcCBpcyBub3Qgd29ya2luZywgcHJvYmFibHkgYmVjYXVzZSB0aGUgY3Vyc29yXG4gICAgICAgICAgIyBhZGRpdGlvbiBoYXBwZW5zIGFzeW5jaHJvbm91c2x5XG4gICAgICAgICAgc2V0VGltZW91dCAoIC0+XG5cbiAgICAgICAgICAgICMgY29uc29sZS5sb2cgXCJzZXRTY3JvbGxUb3BcIlxuICAgICAgICAgICAgc2V0U2Nyb2xsVG9wIGVkaXRvciwgb3JpZ1Njcm9sbFRvcFxuICAgICAgICAgICAgcmV0dXJuIHJlc29sdmUodGV4dClcbiAgICAgICAgICApLCAwXG4gICAgICBlbHNlXG4gICAgICAgIGVycm9yID0gbmV3IEVycm9yKFwiVW5zdXBwb3J0ZWQgYmVhdXRpZmljYXRpb24gcmVzdWx0ICcje3RleHR9Jy5cIilcbiAgICAgICAgc2hvd0Vycm9yKGVycm9yKVxuICAgICAgICByZXR1cm4gcmVqZWN0KGVycm9yKVxuXG4gICAgICAjIGVsc2VcbiAgICAgICMgY29uc29sZS5sb2cgXCJBbHJlYWR5IEJlYXV0aWZ1bCFcIlxuICAgICAgcmV0dXJuXG5cbiAgICAjIGNvbnNvbGUubG9nICdCZWF1dGlmeSB0aW1lISdcbiAgICAjXG4gICAgIyBHZXQgY3VycmVudCBlZGl0b3JcbiAgICBlZGl0b3IgPSBlZGl0b3IgPyBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcblxuXG4gICAgIyBDaGVjayBpZiB0aGVyZSBpcyBhbiBhY3RpdmUgZWRpdG9yXG4gICAgaWYgbm90IGVkaXRvcj9cbiAgICAgIHJldHVybiBzaG93RXJyb3IoIG5ldyBFcnJvcihcIkFjdGl2ZSBFZGl0b3Igbm90IGZvdW5kLiBcIlxuICAgICAgICBcIlBsZWFzZSBzZWxlY3QgYSBUZXh0IEVkaXRvciBmaXJzdCB0byBiZWF1dGlmeS5cIikpXG4gICAgaXNTZWxlY3Rpb24gPSAhIWVkaXRvci5nZXRTZWxlY3RlZFRleHQoKVxuXG5cbiAgICAjIEdldCBlZGl0b3IgcGF0aCBhbmQgY29uZmlndXJhdGlvbnMgZm9yIHBhdGhzXG4gICAgZWRpdGVkRmlsZVBhdGggPSBlZGl0b3IuZ2V0UGF0aCgpXG5cblxuICAgICMgR2V0IGFsbCBvcHRpb25zXG4gICAgYWxsT3B0aW9ucyA9IGJlYXV0aWZpZXIuZ2V0T3B0aW9uc0ZvclBhdGgoZWRpdGVkRmlsZVBhdGgsIGVkaXRvcilcblxuXG4gICAgIyBHZXQgY3VycmVudCBlZGl0b3IncyB0ZXh0XG4gICAgdGV4dCA9IHVuZGVmaW5lZFxuICAgIGlmIG5vdCBmb3JjZUVudGlyZUZpbGUgYW5kIGlzU2VsZWN0aW9uXG4gICAgICB0ZXh0ID0gZWRpdG9yLmdldFNlbGVjdGVkVGV4dCgpXG4gICAgZWxzZVxuICAgICAgdGV4dCA9IGVkaXRvci5nZXRUZXh0KClcbiAgICBvbGRUZXh0ID0gdGV4dFxuXG5cbiAgICAjIEdldCBHcmFtbWFyXG4gICAgZ3JhbW1hck5hbWUgPSBlZGl0b3IuZ2V0R3JhbW1hcigpLm5hbWVcblxuXG4gICAgIyBGaW5hbGx5LCBiZWF1dGlmeSFcbiAgICB0cnlcbiAgICAgIGJlYXV0aWZpZXIuYmVhdXRpZnkodGV4dCwgYWxsT3B0aW9ucywgZ3JhbW1hck5hbWUsIGVkaXRlZEZpbGVQYXRoLCBvblNhdmUgOiBvblNhdmUpXG4gICAgICAudGhlbihiZWF1dGlmeUNvbXBsZXRlZClcbiAgICAgIC5jYXRjaChiZWF1dGlmeUNvbXBsZXRlZClcbiAgICBjYXRjaCBlXG4gICAgICBzaG93RXJyb3IoZSlcbiAgICByZXR1cm5cbiAgKVxuXG5iZWF1dGlmeUZpbGVQYXRoID0gKGZpbGVQYXRoLCBjYWxsYmFjaykgLT5cbiAgbG9nZ2VyLnZlcmJvc2UoJ2JlYXV0aWZ5RmlsZVBhdGgnLCBmaWxlUGF0aClcblxuICAjIFNob3cgaW4gcHJvZ3Jlc3MgaW5kaWNhdGUgb24gZmlsZSdzIHRyZWUtdmlldyBlbnRyeVxuICAkID89IHJlcXVpcmUoXCJhdG9tLXNwYWNlLXBlbi12aWV3c1wiKS4kXG4gICRlbCA9ICQoXCIuaWNvbi1maWxlLXRleHRbZGF0YS1wYXRoPVxcXCIje2ZpbGVQYXRofVxcXCJdXCIpXG4gICRlbC5hZGRDbGFzcygnYmVhdXRpZnlpbmcnKVxuXG4gICMgQ2xlYW51cCBhbmQgcmV0dXJuIGNhbGxiYWNrIGZ1bmN0aW9uXG4gIGNiID0gKGVyciwgcmVzdWx0KSAtPlxuICAgIGxvZ2dlci52ZXJib3NlKCdDbGVhbnVwIGJlYXV0aWZ5RmlsZVBhdGgnLCBlcnIsIHJlc3VsdClcbiAgICAkZWwgPSAkKFwiLmljb24tZmlsZS10ZXh0W2RhdGEtcGF0aD1cXFwiI3tmaWxlUGF0aH1cXFwiXVwiKVxuICAgICRlbC5yZW1vdmVDbGFzcygnYmVhdXRpZnlpbmcnKVxuICAgIHJldHVybiBjYWxsYmFjayhlcnIsIHJlc3VsdClcblxuICAjIEdldCBjb250ZW50cyBvZiBmaWxlXG4gIGZzID89IHJlcXVpcmUgXCJmc1wiXG4gIGxvZ2dlci52ZXJib3NlKCdyZWFkRmlsZScsIGZpbGVQYXRoKVxuICBmcy5yZWFkRmlsZShmaWxlUGF0aCwgKGVyciwgZGF0YSkgLT5cbiAgICBsb2dnZXIudmVyYm9zZSgncmVhZEZpbGUgY29tcGxldGVkJywgZXJyLCBmaWxlUGF0aClcbiAgICByZXR1cm4gY2IoZXJyKSBpZiBlcnJcbiAgICBpbnB1dCA9IGRhdGE/LnRvU3RyaW5nKClcbiAgICBncmFtbWFyID0gYXRvbS5ncmFtbWFycy5zZWxlY3RHcmFtbWFyKGZpbGVQYXRoLCBpbnB1dClcbiAgICBncmFtbWFyTmFtZSA9IGdyYW1tYXIubmFtZVxuXG4gICAgIyBHZXQgdGhlIG9wdGlvbnNcbiAgICBhbGxPcHRpb25zID0gYmVhdXRpZmllci5nZXRPcHRpb25zRm9yUGF0aChmaWxlUGF0aClcbiAgICBsb2dnZXIudmVyYm9zZSgnYmVhdXRpZnlGaWxlUGF0aCBhbGxPcHRpb25zJywgYWxsT3B0aW9ucylcblxuICAgICMgQmVhdXRpZnkgRmlsZVxuICAgIGNvbXBsZXRpb25GdW4gPSAob3V0cHV0KSAtPlxuICAgICAgbG9nZ2VyLnZlcmJvc2UoJ2JlYXV0aWZ5RmlsZVBhdGggY29tcGxldGlvbkZ1bicsIG91dHB1dClcbiAgICAgIGlmIG91dHB1dCBpbnN0YW5jZW9mIEVycm9yXG4gICAgICAgIHJldHVybiBjYihvdXRwdXQsIG51bGwgKSAjIG91dHB1dCA9PSBFcnJvclxuICAgICAgZWxzZSBpZiB0eXBlb2Ygb3V0cHV0IGlzIFwic3RyaW5nXCJcbiAgICAgICAgIyBkbyBub3QgYWxsb3cgZW1wdHkgc3RyaW5nXG4gICAgICAgIGlmIG91dHB1dC50cmltKCkgaXMgJydcbiAgICAgICAgICBsb2dnZXIudmVyYm9zZSgnYmVhdXRpZnlGaWxlUGF0aCwgb3V0cHV0IHdhcyBlbXB0eSBzdHJpbmchJylcbiAgICAgICAgICByZXR1cm4gY2IobnVsbCwgb3V0cHV0KVxuICAgICAgICAjIHNhdmUgdG8gZmlsZVxuICAgICAgICBmcy53cml0ZUZpbGUoZmlsZVBhdGgsIG91dHB1dCwgKGVycikgLT5cbiAgICAgICAgICByZXR1cm4gY2IoZXJyKSBpZiBlcnJcbiAgICAgICAgICByZXR1cm4gY2IoIG51bGwgLCBvdXRwdXQpXG4gICAgICAgIClcbiAgICAgIGVsc2VcbiAgICAgICAgcmV0dXJuIGNiKCBuZXcgRXJyb3IoXCJVbmtub3duIGJlYXV0aWZpY2F0aW9uIHJlc3VsdCAje291dHB1dH0uXCIpLCBvdXRwdXQpXG4gICAgdHJ5XG4gICAgICBsb2dnZXIudmVyYm9zZSgnYmVhdXRpZnknLCBpbnB1dCwgYWxsT3B0aW9ucywgZ3JhbW1hck5hbWUsIGZpbGVQYXRoKVxuICAgICAgYmVhdXRpZmllci5iZWF1dGlmeShpbnB1dCwgYWxsT3B0aW9ucywgZ3JhbW1hck5hbWUsIGZpbGVQYXRoKVxuICAgICAgLnRoZW4oY29tcGxldGlvbkZ1bilcbiAgICAgIC5jYXRjaChjb21wbGV0aW9uRnVuKVxuICAgIGNhdGNoIGVcbiAgICAgIHJldHVybiBjYihlKVxuICAgIClcblxuYmVhdXRpZnlGaWxlID0gKHt0YXJnZXR9KSAtPlxuICBmaWxlUGF0aCA9IHRhcmdldC5kYXRhc2V0LnBhdGhcbiAgcmV0dXJuIHVubGVzcyBmaWxlUGF0aFxuICBiZWF1dGlmeUZpbGVQYXRoKGZpbGVQYXRoLCAoZXJyLCByZXN1bHQpIC0+XG4gICAgcmV0dXJuIHNob3dFcnJvcihlcnIpIGlmIGVyclxuICAgICMgY29uc29sZS5sb2coXCJCZWF1dGlmeSBGaWxlXG4gIClcbiAgcmV0dXJuXG5cbmJlYXV0aWZ5RGlyZWN0b3J5ID0gKHt0YXJnZXR9KSAtPlxuICBkaXJQYXRoID0gdGFyZ2V0LmRhdGFzZXQucGF0aFxuICByZXR1cm4gdW5sZXNzIGRpclBhdGhcblxuICByZXR1cm4gaWYgYXRvbT8uY29uZmlybShcbiAgICBtZXNzYWdlOiBcIlRoaXMgd2lsbCBiZWF1dGlmeSBhbGwgb2YgdGhlIGZpbGVzIGZvdW5kIFxcXG4gICAgICAgIHJlY3Vyc2l2ZWx5IGluIHRoaXMgZGlyZWN0b3J5LCAnI3tkaXJQYXRofScuIFxcXG4gICAgICAgIERvIHlvdSB3YW50IHRvIGNvbnRpbnVlP1wiLFxuICAgIGJ1dHRvbnM6IFsnWWVzLCBjb250aW51ZSEnLCdObywgY2FuY2VsISddKSBpc250IDBcblxuICAjIFNob3cgaW4gcHJvZ3Jlc3MgaW5kaWNhdGUgb24gZGlyZWN0b3J5J3MgdHJlZS12aWV3IGVudHJ5XG4gICQgPz0gcmVxdWlyZShcImF0b20tc3BhY2UtcGVuLXZpZXdzXCIpLiRcbiAgJGVsID0gJChcIi5pY29uLWZpbGUtZGlyZWN0b3J5W2RhdGEtcGF0aD1cXFwiI3tkaXJQYXRofVxcXCJdXCIpXG4gICRlbC5hZGRDbGFzcygnYmVhdXRpZnlpbmcnKVxuXG4gICMgUHJvY2VzcyBEaXJlY3RvcnlcbiAgZGlyID89IHJlcXVpcmUgXCJub2RlLWRpclwiXG4gIGFzeW5jID89IHJlcXVpcmUgXCJhc3luY1wiXG4gIGRpci5maWxlcyhkaXJQYXRoLCAoZXJyLCBmaWxlcykgLT5cbiAgICByZXR1cm4gc2hvd0Vycm9yKGVycikgaWYgZXJyXG5cbiAgICBhc3luYy5lYWNoKGZpbGVzLCAoZmlsZVBhdGgsIGNhbGxiYWNrKSAtPlxuICAgICAgIyBJZ25vcmUgZXJyb3JzXG4gICAgICBiZWF1dGlmeUZpbGVQYXRoKGZpbGVQYXRoLCAtPiBjYWxsYmFjaygpKVxuICAgICwgKGVycikgLT5cbiAgICAgICRlbCA9ICQoXCIuaWNvbi1maWxlLWRpcmVjdG9yeVtkYXRhLXBhdGg9XFxcIiN7ZGlyUGF0aH1cXFwiXVwiKVxuICAgICAgJGVsLnJlbW92ZUNsYXNzKCdiZWF1dGlmeWluZycpXG4gICAgICAjIGNvbnNvbGUubG9nKCdDb21wbGV0ZWQgYmVhdXRpZnlpbmcgZGlyZWN0b3J5IScsIGRpclBhdGgpXG4gICAgKVxuICApXG4gIHJldHVyblxuXG5kZWJ1ZyA9ICgpIC0+XG4gIHRyeVxuICAgIG9wZW4gPSByZXF1aXJlKFwib3BlblwiKVxuICAgIGZzID89IHJlcXVpcmUgXCJmc1wiXG4gICAgR2l0SHViQXBpID0gcmVxdWlyZShcImdpdGh1YlwiKVxuICAgIGdpdGh1YiA9IG5ldyBHaXRIdWJBcGkoKVxuXG4gICAgcGx1Z2luLmNoZWNrVW5zdXBwb3J0ZWRPcHRpb25zKClcblxuICAgICMgR2V0IGN1cnJlbnQgZWRpdG9yXG4gICAgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG5cbiAgICBsaW5raWZ5VGl0bGUgPSAodGl0bGUpIC0+XG4gICAgICB0aXRsZSA9IHRpdGxlLnRvTG93ZXJDYXNlKClcbiAgICAgIHAgPSB0aXRsZS5zcGxpdCgvW1xccywrIzssXFwvPzpAJj0rJF0rLykgIyBzcGxpdCBpbnRvIHBhcnRzXG4gICAgICBzZXAgPSBcIi1cIlxuICAgICAgcC5qb2luKHNlcClcblxuICAgICMgQ2hlY2sgaWYgdGhlcmUgaXMgYW4gYWN0aXZlIGVkaXRvclxuICAgIGlmIG5vdCBlZGl0b3I/XG4gICAgICByZXR1cm4gY29uZmlybShcIkFjdGl2ZSBFZGl0b3Igbm90IGZvdW5kLlxcblwiICtcbiAgICAgIFwiUGxlYXNlIHNlbGVjdCBhIFRleHQgRWRpdG9yIGZpcnN0IHRvIGJlYXV0aWZ5LlwiKVxuICAgIHJldHVybiB1bmxlc3MgY29uZmlybSgnQXJlIHlvdSByZWFkeSB0byBkZWJ1ZyBBdG9tIEJlYXV0aWZ5P1xcblxcbicrXG4gICAgJ1dhcm5pbmc6IFRoaXMgd2lsbCBjcmVhdGUgYW4gYW5vbnltb3VzIEdpc3Qgb24gR2l0SHViIChwdWJsaWNhbGx5IGFjY2Vzc2libGUgYW5kIGNhbm5vdCBiZSBlYXNpbHkgZGVsZXRlZCkgJytcbiAgICAnY29udGFpbmluZyB0aGUgY29udGVudHMgb2YgeW91ciBhY3RpdmUgVGV4dCBFZGl0b3IuXFxuJytcbiAgICAnQmUgc3VyZSB0byBkZWxldGUgYW55IHByaXZhdGUgdGV4dCBmcm9tIHlvdXIgYWN0aXZlIFRleHQgRWRpdG9yIGJlZm9yZSBjb250aW51aW5nICcrXG4gICAgJ3RvIGVuc3VyZSB5b3UgYXJlIG5vdCBzaGFyaW5nIHVuZGVzaXJhYmxlIHByaXZhdGUgaW5mb3JtYXRpb24uJylcbiAgICBkZWJ1Z0luZm8gPSBcIlwiXG4gICAgaGVhZGVycyA9IFtdXG4gICAgdG9jRWwgPSBcIjxUQUJMRU9GQ09OVEVOVFMvPlwiXG4gICAgYWRkSW5mbyA9IChrZXksIHZhbCkgLT5cbiAgICAgIGlmIGtleT9cbiAgICAgICAgZGVidWdJbmZvICs9IFwiKioje2tleX0qKjogI3t2YWx9XFxuXFxuXCJcbiAgICAgIGVsc2VcbiAgICAgICAgZGVidWdJbmZvICs9IFwiI3t2YWx9XFxuXFxuXCJcbiAgICBhZGRIZWFkZXIgPSAobGV2ZWwsIHRpdGxlKSAtPlxuICAgICAgZGVidWdJbmZvICs9IFwiI3tBcnJheShsZXZlbCsxKS5qb2luKCcjJyl9ICN7dGl0bGV9XFxuXFxuXCJcbiAgICAgIGhlYWRlcnMucHVzaCh7XG4gICAgICAgIGxldmVsLCB0aXRsZVxuICAgICAgICB9KVxuICAgIGFkZEhlYWRlcigxLCBcIkF0b20gQmVhdXRpZnkgLSBEZWJ1Z2dpbmcgaW5mb3JtYXRpb25cIilcbiAgICBkZWJ1Z0luZm8gKz0gXCJUaGUgZm9sbG93aW5nIGRlYnVnZ2luZyBpbmZvcm1hdGlvbiB3YXMgXCIgK1xuICAgIFwiZ2VuZXJhdGVkIGJ5IGBBdG9tIEJlYXV0aWZ5YCBvbiBgI3tuZXcgRGF0ZSgpfWAuXCIgK1xuICAgIFwiXFxuXFxuLS0tXFxuXFxuXCIgK1xuICAgIHRvY0VsICtcbiAgICBcIlxcblxcbi0tLVxcblxcblwiXG5cbiAgICAjIFBsYXRmb3JtXG4gICAgYWRkSW5mbygnUGxhdGZvcm0nLCBwcm9jZXNzLnBsYXRmb3JtKVxuICAgIGFkZEhlYWRlcigyLCBcIlZlcnNpb25zXCIpXG5cblxuICAgICMgQXRvbSBWZXJzaW9uXG4gICAgYWRkSW5mbygnQXRvbSBWZXJzaW9uJywgYXRvbS5hcHBWZXJzaW9uKVxuXG5cbiAgICAjIEF0b20gQmVhdXRpZnkgVmVyc2lvblxuICAgIGFkZEluZm8oJ0F0b20gQmVhdXRpZnkgVmVyc2lvbicsIHBrZy52ZXJzaW9uKVxuICAgIGFkZEhlYWRlcigyLCBcIk9yaWdpbmFsIGZpbGUgdG8gYmUgYmVhdXRpZmllZFwiKVxuXG5cbiAgICAjIE9yaWdpbmFsIGZpbGVcbiAgICAjXG4gICAgIyBHZXQgZWRpdG9yIHBhdGggYW5kIGNvbmZpZ3VyYXRpb25zIGZvciBwYXRoc1xuICAgIGZpbGVQYXRoID0gZWRpdG9yLmdldFBhdGgoKVxuXG4gICAgIyBQYXRoXG4gICAgYWRkSW5mbygnT3JpZ2luYWwgRmlsZSBQYXRoJywgXCJgI3tmaWxlUGF0aH1gXCIpXG5cbiAgICAjIEdldCBHcmFtbWFyXG4gICAgZ3JhbW1hck5hbWUgPSBlZGl0b3IuZ2V0R3JhbW1hcigpLm5hbWVcblxuICAgICMgR3JhbW1hclxuICAgIGFkZEluZm8oJ09yaWdpbmFsIEZpbGUgR3JhbW1hcicsIGdyYW1tYXJOYW1lKVxuXG4gICAgIyBMYW5ndWFnZVxuICAgIGxhbmd1YWdlID0gYmVhdXRpZmllci5nZXRMYW5ndWFnZShncmFtbWFyTmFtZSwgZmlsZVBhdGgpXG4gICAgYWRkSW5mbygnT3JpZ2luYWwgRmlsZSBMYW5ndWFnZScsIGxhbmd1YWdlPy5uYW1lKVxuICAgIGFkZEluZm8oJ0xhbmd1YWdlIG5hbWVzcGFjZScsIGxhbmd1YWdlPy5uYW1lc3BhY2UpXG5cbiAgICAjIEJlYXV0aWZpZXJcbiAgICBiZWF1dGlmaWVycyA9IGJlYXV0aWZpZXIuZ2V0QmVhdXRpZmllcnMobGFuZ3VhZ2UubmFtZSlcbiAgICBhZGRJbmZvKCdTdXBwb3J0ZWQgQmVhdXRpZmllcnMnLCBfLm1hcChiZWF1dGlmaWVycywgJ25hbWUnKS5qb2luKCcsICcpKVxuICAgIHNlbGVjdGVkQmVhdXRpZmllciA9IGJlYXV0aWZpZXIuZ2V0QmVhdXRpZmllckZvckxhbmd1YWdlKGxhbmd1YWdlKVxuICAgIGFkZEluZm8oJ1NlbGVjdGVkIEJlYXV0aWZpZXInLCBzZWxlY3RlZEJlYXV0aWZpZXIubmFtZSlcblxuICAgICMgR2V0IGN1cnJlbnQgZWRpdG9yJ3MgdGV4dFxuICAgIHRleHQgPSBlZGl0b3IuZ2V0VGV4dCgpIG9yIFwiXCJcblxuICAgICMgQ29udGVudHNcbiAgICBjb2RlQmxvY2tTeW50YXggPSAobGFuZ3VhZ2U/Lm5hbWUgPyBncmFtbWFyTmFtZSkudG9Mb3dlckNhc2UoKS5zcGxpdCgnICcpWzBdXG4gICAgYWRkSGVhZGVyKDMsICdPcmlnaW5hbCBGaWxlIENvbnRlbnRzJylcbiAgICBhZGRJbmZvKG51bGwsIFwiXFxuYGBgI3tjb2RlQmxvY2tTeW50YXh9XFxuI3t0ZXh0fVxcbmBgYFwiKVxuXG4gICAgYWRkSGVhZGVyKDMsICdQYWNrYWdlIFNldHRpbmdzJylcbiAgICBhZGRJbmZvKG51bGwsXG4gICAgICBcIlRoZSByYXcgcGFja2FnZSBzZXR0aW5ncyBvcHRpb25zXFxuXCIgK1xuICAgICAgXCJgYGBqc29uXFxuI3tKU09OLnN0cmluZ2lmeShhdG9tLmNvbmZpZy5nZXQoJ2F0b20tYmVhdXRpZnknKSwgdW5kZWZpbmVkLCA0KX1cXG5gYGBcIilcblxuICAgICMgQmVhdXRpZmljYXRpb24gT3B0aW9uc1xuICAgIGFkZEhlYWRlcigyLCBcIkJlYXV0aWZpY2F0aW9uIG9wdGlvbnNcIilcbiAgICAjIEdldCBhbGwgb3B0aW9uc1xuICAgIGFsbE9wdGlvbnMgPSBiZWF1dGlmaWVyLmdldE9wdGlvbnNGb3JQYXRoKGZpbGVQYXRoLCBlZGl0b3IpXG4gICAgIyBSZXNvbHZlIG9wdGlvbnMgd2l0aCBwcm9taXNlc1xuICAgIFByb21pc2UuYWxsKGFsbE9wdGlvbnMpXG4gICAgLnRoZW4oKGFsbE9wdGlvbnMpIC0+XG4gICAgICAjIEV4dHJhY3Qgb3B0aW9uc1xuICAgICAgW1xuICAgICAgICAgIGVkaXRvck9wdGlvbnNcbiAgICAgICAgICBjb25maWdPcHRpb25zXG4gICAgICAgICAgaG9tZU9wdGlvbnNcbiAgICAgICAgICBlZGl0b3JDb25maWdPcHRpb25zXG4gICAgICBdID0gYWxsT3B0aW9uc1xuICAgICAgcHJvamVjdE9wdGlvbnMgPSBhbGxPcHRpb25zWzQuLl1cblxuICAgICAgcHJlVHJhbnNmb3JtZWRPcHRpb25zID0gYmVhdXRpZmllci5nZXRPcHRpb25zRm9yTGFuZ3VhZ2UoYWxsT3B0aW9ucywgbGFuZ3VhZ2UpXG5cbiAgICAgIGlmIHNlbGVjdGVkQmVhdXRpZmllclxuICAgICAgICBmaW5hbE9wdGlvbnMgPSBiZWF1dGlmaWVyLnRyYW5zZm9ybU9wdGlvbnMoc2VsZWN0ZWRCZWF1dGlmaWVyLCBsYW5ndWFnZS5uYW1lLCBwcmVUcmFuc2Zvcm1lZE9wdGlvbnMpXG5cbiAgICAgICMgU2hvdyBvcHRpb25zXG4gICAgICAjIGFkZEluZm8oJ0FsbCBPcHRpb25zJywgXCJcXG5cIiArXG4gICAgICAjIFwiQWxsIG9wdGlvbnMgZXh0cmFjdGVkIGZvciBmaWxlXFxuXCIgK1xuICAgICAgIyBcImBgYGpzb25cXG4je0pTT04uc3RyaW5naWZ5KGFsbE9wdGlvbnMsIHVuZGVmaW5lZCwgNCl9XFxuYGBgXCIpXG4gICAgICBhZGRJbmZvKCdFZGl0b3IgT3B0aW9ucycsIFwiXFxuXCIgK1xuICAgICAgXCJPcHRpb25zIGZyb20gQXRvbSBFZGl0b3Igc2V0dGluZ3NcXG5cIiArXG4gICAgICBcImBgYGpzb25cXG4je0pTT04uc3RyaW5naWZ5KGVkaXRvck9wdGlvbnMsIHVuZGVmaW5lZCwgNCl9XFxuYGBgXCIpXG4gICAgICBhZGRJbmZvKCdDb25maWcgT3B0aW9ucycsIFwiXFxuXCIgK1xuICAgICAgXCJPcHRpb25zIGZyb20gQXRvbSBCZWF1dGlmeSBwYWNrYWdlIHNldHRpbmdzXFxuXCIgK1xuICAgICAgXCJgYGBqc29uXFxuI3tKU09OLnN0cmluZ2lmeShjb25maWdPcHRpb25zLCB1bmRlZmluZWQsIDQpfVxcbmBgYFwiKVxuICAgICAgYWRkSW5mbygnSG9tZSBPcHRpb25zJywgXCJcXG5cIiArXG4gICAgICBcIk9wdGlvbnMgZnJvbSBgI3twYXRoLnJlc29sdmUoYmVhdXRpZmllci5nZXRVc2VySG9tZSgpLCAnLmpzYmVhdXRpZnlyYycpfWBcXG5cIiArXG4gICAgICBcImBgYGpzb25cXG4je0pTT04uc3RyaW5naWZ5KGhvbWVPcHRpb25zLCB1bmRlZmluZWQsIDQpfVxcbmBgYFwiKVxuICAgICAgYWRkSW5mbygnRWRpdG9yQ29uZmlnIE9wdGlvbnMnLCBcIlxcblwiICtcbiAgICAgIFwiT3B0aW9ucyBmcm9tIFtFZGl0b3JDb25maWddKGh0dHA6Ly9lZGl0b3Jjb25maWcub3JnLykgZmlsZVxcblwiICtcbiAgICAgIFwiYGBganNvblxcbiN7SlNPTi5zdHJpbmdpZnkoZWRpdG9yQ29uZmlnT3B0aW9ucywgdW5kZWZpbmVkLCA0KX1cXG5gYGBcIilcbiAgICAgIGFkZEluZm8oJ1Byb2plY3QgT3B0aW9ucycsIFwiXFxuXCIgK1xuICAgICAgXCJPcHRpb25zIGZyb20gYC5qc2JlYXV0aWZ5cmNgIGZpbGVzIHN0YXJ0aW5nIGZyb20gZGlyZWN0b3J5IGAje3BhdGguZGlybmFtZShmaWxlUGF0aCl9YCBhbmQgZ29pbmcgdXAgdG8gcm9vdFxcblwiICtcbiAgICAgIFwiYGBganNvblxcbiN7SlNPTi5zdHJpbmdpZnkocHJvamVjdE9wdGlvbnMsIHVuZGVmaW5lZCwgNCl9XFxuYGBgXCIpXG4gICAgICBhZGRJbmZvKCdQcmUtVHJhbnNmb3JtZWQgT3B0aW9ucycsIFwiXFxuXCIgK1xuICAgICAgXCJDb21iaW5lZCBvcHRpb25zIGJlZm9yZSB0cmFuc2Zvcm1pbmcgdGhlbSBnaXZlbiBhIGJlYXV0aWZpZXIncyBzcGVjaWZpY2F0aW9uc1xcblwiICtcbiAgICAgIFwiYGBganNvblxcbiN7SlNPTi5zdHJpbmdpZnkocHJlVHJhbnNmb3JtZWRPcHRpb25zLCB1bmRlZmluZWQsIDQpfVxcbmBgYFwiKVxuICAgICAgaWYgc2VsZWN0ZWRCZWF1dGlmaWVyXG4gICAgICAgIGFkZEhlYWRlcigzLCAnRmluYWwgT3B0aW9ucycpXG4gICAgICAgIGFkZEluZm8obnVsbCxcbiAgICAgICAgICBcIkZpbmFsIGNvbWJpbmVkIGFuZCB0cmFuc2Zvcm1lZCBvcHRpb25zIHRoYXQgYXJlIHVzZWRcXG5cIiArXG4gICAgICAgICAgXCJgYGBqc29uXFxuI3tKU09OLnN0cmluZ2lmeShmaW5hbE9wdGlvbnMsIHVuZGVmaW5lZCwgNCl9XFxuYGBgXCIpXG5cbiAgICAgICNcbiAgICAgIGxvZ3MgPSBcIlwiXG4gICAgICBsb2dGaWxlUGF0aFJlZ2V4ID0gbmV3IFJlZ0V4cCgnXFxcXDogXFxcXFsoLiopXFxcXF0nKVxuICAgICAgc3Vic2NyaXB0aW9uID0gbG9nZ2VyLm9uTG9nZ2luZygobXNnKSAtPlxuICAgICAgICAjIGNvbnNvbGUubG9nKCdsb2dnaW5nJywgbXNnKVxuICAgICAgICBzZXAgPSBwYXRoLnNlcFxuICAgICAgICBsb2dzICs9IG1zZy5yZXBsYWNlKGxvZ0ZpbGVQYXRoUmVnZXgsIChhLGIpIC0+XG4gICAgICAgICAgcyA9IGIuc3BsaXQoc2VwKVxuICAgICAgICAgIGkgPSBzLmluZGV4T2YoJ2F0b20tYmVhdXRpZnknKVxuICAgICAgICAgIHAgPSBzLnNsaWNlKGkrMikuam9pbihzZXApXG4gICAgICAgICAgIyBjb25zb2xlLmxvZygnbG9nZ2luZycsIGFyZ3VtZW50cywgcywgaSwgcClcbiAgICAgICAgICByZXR1cm4gJzogWycrcCsnXSdcbiAgICAgICAgKVxuICAgICAgKVxuICAgICAgY2IgPSAocmVzdWx0KSAtPlxuICAgICAgICBzdWJzY3JpcHRpb24uZGlzcG9zZSgpXG4gICAgICAgIGFkZEhlYWRlcigyLCBcIlJlc3VsdHNcIilcblxuICAgICAgICAjIExvZ3NcbiAgICAgICAgYWRkSW5mbygnQmVhdXRpZmllZCBGaWxlIENvbnRlbnRzJywgXCJcXG5gYGAje2NvZGVCbG9ja1N5bnRheH1cXG4je3Jlc3VsdH1cXG5gYGBcIilcbiAgICAgICAgIyBEaWZmXG4gICAgICAgIEpzRGlmZiA9IHJlcXVpcmUoJ2RpZmYnKVxuICAgICAgICBpZiB0eXBlb2YgcmVzdWx0IGlzIFwic3RyaW5nXCJcbiAgICAgICAgICBkaWZmID0gSnNEaWZmLmNyZWF0ZVBhdGNoKGZpbGVQYXRoIG9yIFwiXCIsIHRleHQgb3IgXCJcIiwgXFxcbiAgICAgICAgICAgIHJlc3VsdCBvciBcIlwiLCBcIm9yaWdpbmFsXCIsIFwiYmVhdXRpZmllZFwiKVxuICAgICAgICAgIGFkZEluZm8oJ09yaWdpbmFsIHZzLiBCZWF1dGlmaWVkIERpZmYnLCBcIlxcbmBgYCN7Y29kZUJsb2NrU3ludGF4fVxcbiN7ZGlmZn1cXG5gYGBcIilcblxuICAgICAgICBhZGRIZWFkZXIoMywgXCJMb2dzXCIpXG4gICAgICAgIGFkZEluZm8obnVsbCwgXCJgYGBcXG4je2xvZ3N9XFxuYGBgXCIpXG5cbiAgICAgICAgIyBCdWlsZCBUYWJsZSBvZiBDb250ZW50c1xuICAgICAgICB0b2MgPSBcIiMjIFRhYmxlIE9mIENvbnRlbnRzXFxuXCJcbiAgICAgICAgZm9yIGhlYWRlciBpbiBoZWFkZXJzXG4gICAgICAgICAgIyMjXG4gICAgICAgICAgLSBIZWFkaW5nIDFcbiAgICAgICAgICAgIC0gSGVhZGluZyAxLjFcbiAgICAgICAgICAjIyNcbiAgICAgICAgICBpbmRlbnQgPSBcIiAgXCIgIyAyIHNwYWNlc1xuICAgICAgICAgIGJ1bGxldCA9IFwiLVwiXG4gICAgICAgICAgaW5kZW50TnVtID0gaGVhZGVyLmxldmVsIC0gMlxuICAgICAgICAgIGlmIGluZGVudE51bSA+PSAwXG4gICAgICAgICAgICB0b2MgKz0gKFwiI3tBcnJheShpbmRlbnROdW0rMSkuam9pbihpbmRlbnQpfSN7YnVsbGV0fSBbI3toZWFkZXIudGl0bGV9XShcXCMje2xpbmtpZnlUaXRsZShoZWFkZXIudGl0bGUpfSlcXG5cIilcbiAgICAgICAgIyBSZXBsYWNlIFRBQkxFT0ZDT05URU5UU1xuICAgICAgICBkZWJ1Z0luZm8gPSBkZWJ1Z0luZm8ucmVwbGFjZSh0b2NFbCwgdG9jKVxuXG4gICAgICAgICMgU2F2ZSB0byBjbGlwYm9hcmRcbiAgICAgICAgIyBhdG9tLmNsaXBib2FyZC53cml0ZShkZWJ1Z0luZm8pXG4gICAgICAgIGdpdGh1Yi5naXN0cy5jcmVhdGUoe1xuICAgICAgICAgIGZpbGVzOiB7XG4gICAgICAgICAgICBcImRlYnVnLm1kXCI6IHtcbiAgICAgICAgICAgICAgXCJjb250ZW50XCI6IGRlYnVnSW5mb1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgICAgcHVibGljOiB0cnVlLFxuICAgICAgICAgIGRlc2NyaXB0aW9uOiBcIkF0b20tQmVhdXRpZnkgZGVidWdnaW5nIGluZm9ybWF0aW9uXCJcbiAgICAgICAgfSwgKGVyciwgcmVzKSAtPlxuICAgICAgICAgICMgY29uc29sZS5sb2coZXJyLCByZXMpXG4gICAgICAgICAgaWYgZXJyXG4gICAgICAgICAgICBjb25maXJtKFwiQW4gZXJyb3Igb2NjdXJyZWQgd2hlbiBjcmVhdGluZyB0aGUgR2lzdDogXCIrZXJyKVxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIGdpc3RVcmwgPSByZXMuaHRtbF91cmxcbiAgICAgICAgICAgICMgQ3JlYXRlIEdpc3RcbiAgICAgICAgICAgIG9wZW4oZ2lzdFVybClcbiAgICAgICAgICAgIGNvbmZpcm0oXCJZb3VyIEF0b20gQmVhdXRpZnkgZGVidWdnaW5nIGluZm9ybWF0aW9uIGNhbiBiZSBmb3VuZCBpbiB0aGUgcHVibGljIEdpc3Q6XFxuI3tyZXMuaHRtbF91cmx9XFxuXFxuXCIgK1xuICAgICAgICAgICAgICAjICdZb3UgY2FuIG5vdyBwYXN0ZSB0aGlzIGludG8gYW4gSXNzdWUgeW91IGFyZSByZXBvcnRpbmcgaGVyZVxcbicgK1xuICAgICAgICAgICAgICAjICdodHRwczovL2dpdGh1Yi5jb20vR2xhdmluMDAxL2F0b20tYmVhdXRpZnkvaXNzdWVzL1xcblxcbicgK1xuICAgICAgICAgICAgICAjICdQbGVhc2UgZm9sbG93IHRoZSBjb250cmlidXRpb24gZ3VpZGVsaW5lcyBmb3VuZCBhdFxcbicgK1xuICAgICAgICAgICAgICAjICdodHRwczovL2dpdGh1Yi5jb20vR2xhdmluMDAxL2F0b20tYmVhdXRpZnkvYmxvYi9tYXN0ZXIvQ09OVFJJQlVUSU5HLm1kXFxuXFxuJyArXG4gICAgICAgICAgICAgICdXYXJuaW5nOiBCZSBzdXJlIHRvIGxvb2sgb3ZlciB0aGUgZGVidWcgaW5mbyBiZWZvcmUgeW91IHNlbmQgaXQgJytcbiAgICAgICAgICAgICAgJ3RvIGVuc3VyZSB5b3UgYXJlIG5vdCBzaGFyaW5nIHVuZGVzaXJhYmxlIHByaXZhdGUgaW5mb3JtYXRpb24uXFxuXFxuJytcbiAgICAgICAgICAgICAgJ0lmIHlvdSB3YW50IHRvIGRlbGV0ZSB0aGlzIGFub255bW91cyBHaXN0IHJlYWRcXG4nK1xuICAgICAgICAgICAgICAnaHR0cHM6Ly9oZWxwLmdpdGh1Yi5jb20vYXJ0aWNsZXMvZGVsZXRpbmctYW4tYW5vbnltb3VzLWdpc3QvJ1xuICAgICAgICAgICAgKVxuICAgICAgICAgICAgIyBDcmVhdGUgR2l0SHViIElzc3VlXG4gICAgICAgICAgICByZXR1cm4gdW5sZXNzIGNvbmZpcm0oXCJXb3VsZCB5b3UgbGlrZSB0byBjcmVhdGUgYSBuZXcgSXNzdWUgb24gR2l0SHViIG5vdz9cIilcbiAgICAgICAgICAgIGlzc3VlVGVtcGxhdGUgPSBmcy5yZWFkRmlsZVN5bmMocGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuLi9JU1NVRV9URU1QTEFURS5tZFwiKSkudG9TdHJpbmcoKVxuICAgICAgICAgICAgYm9keSA9IGlzc3VlVGVtcGxhdGUucmVwbGFjZShcIjxJTlNFUlQgR0lTVCBIRVJFPlwiLCBnaXN0VXJsKSMucmVwbGFjZShcIjxJTlNFUlQgQ09ERSBIRVJFPlwiLCB0ZXh0KVxuICAgICAgICAgICAgb3BlbihcImh0dHBzOi8vZ2l0aHViLmNvbS9HbGF2aW4wMDEvYXRvbS1iZWF1dGlmeS9pc3N1ZXMvbmV3P2JvZHk9I3tlbmNvZGVVUklDb21wb25lbnQoYm9keSl9XCIpXG5cbiAgICAgICAgKVxuICAgICAgdHJ5XG4gICAgICAgIGJlYXV0aWZpZXIuYmVhdXRpZnkodGV4dCwgYWxsT3B0aW9ucywgZ3JhbW1hck5hbWUsIGZpbGVQYXRoKVxuICAgICAgICAudGhlbihjYilcbiAgICAgICAgLmNhdGNoKGNiKVxuICAgICAgY2F0Y2ggZVxuICAgICAgICByZXR1cm4gY2IoZSlcbiAgICApXG4gICAgLmNhdGNoKChlcnJvcikgLT5cbiAgICAgIHN0YWNrID0gZXJyb3Iuc3RhY2tcbiAgICAgIGRldGFpbCA9IGVycm9yLmRlc2NyaXB0aW9uIG9yIGVycm9yLm1lc3NhZ2VcbiAgICAgIGF0b20/Lm5vdGlmaWNhdGlvbnM/LmFkZEVycm9yKGVycm9yLm1lc3NhZ2UsIHtcbiAgICAgICAgc3RhY2ssIGRldGFpbCwgZGlzbWlzc2FibGUgOiB0cnVlXG4gICAgICB9KVxuICAgIClcbiAgY2F0Y2ggZXJyb3JcbiAgICBzdGFjayA9IGVycm9yLnN0YWNrXG4gICAgZGV0YWlsID0gZXJyb3IuZGVzY3JpcHRpb24gb3IgZXJyb3IubWVzc2FnZVxuICAgIGF0b20/Lm5vdGlmaWNhdGlvbnM/LmFkZEVycm9yKGVycm9yLm1lc3NhZ2UsIHtcbiAgICAgIHN0YWNrLCBkZXRhaWwsIGRpc21pc3NhYmxlIDogdHJ1ZVxuICAgIH0pXG5cbmhhbmRsZVNhdmVFdmVudCA9IC0+XG4gIGF0b20ud29ya3NwYWNlLm9ic2VydmVUZXh0RWRpdG9ycyAoZWRpdG9yKSAtPlxuICAgIHBlbmRpbmdQYXRocyA9IHt9XG4gICAgYmVhdXRpZnlPblNhdmVIYW5kbGVyID0gKHtwYXRoOiBmaWxlUGF0aH0pIC0+XG4gICAgICBsb2dnZXIudmVyYm9zZSgnU2hvdWxkIGJlYXV0aWZ5IG9uIHRoaXMgc2F2ZT8nKVxuICAgICAgaWYgcGVuZGluZ1BhdGhzW2ZpbGVQYXRoXVxuICAgICAgICBsb2dnZXIudmVyYm9zZShcIkVkaXRvciB3aXRoIGZpbGUgcGF0aCAje2ZpbGVQYXRofSBhbHJlYWR5IGJlYXV0aWZpZWQhXCIpXG4gICAgICAgIHJldHVyblxuICAgICAgYnVmZmVyID0gZWRpdG9yLmdldEJ1ZmZlcigpXG4gICAgICBwYXRoID89IHJlcXVpcmUoJ3BhdGgnKVxuICAgICAgIyBHZXQgR3JhbW1hclxuICAgICAgZ3JhbW1hciA9IGVkaXRvci5nZXRHcmFtbWFyKCkubmFtZVxuICAgICAgIyBHZXQgZmlsZSBleHRlbnNpb25cbiAgICAgIGZpbGVFeHRlbnNpb24gPSBwYXRoLmV4dG5hbWUoZmlsZVBhdGgpXG4gICAgICAjIFJlbW92ZSBwcmVmaXggXCIuXCIgKHBlcmlvZCkgaW4gZmlsZUV4dGVuc2lvblxuICAgICAgZmlsZUV4dGVuc2lvbiA9IGZpbGVFeHRlbnNpb24uc3Vic3RyKDEpXG4gICAgICAjIEdldCBsYW5ndWFnZVxuICAgICAgbGFuZ3VhZ2VzID0gYmVhdXRpZmllci5sYW5ndWFnZXMuZ2V0TGFuZ3VhZ2VzKHtncmFtbWFyLCBleHRlbnNpb246IGZpbGVFeHRlbnNpb259KVxuICAgICAgaWYgbGFuZ3VhZ2VzLmxlbmd0aCA8IDFcbiAgICAgICAgcmV0dXJuXG4gICAgICAjIFRPRE86IHNlbGVjdCBhcHByb3ByaWF0ZSBsYW5ndWFnZVxuICAgICAgbGFuZ3VhZ2UgPSBsYW5ndWFnZXNbMF1cbiAgICAgICMgR2V0IGxhbmd1YWdlIGNvbmZpZ1xuICAgICAga2V5ID0gXCJhdG9tLWJlYXV0aWZ5LiN7bGFuZ3VhZ2UubmFtZXNwYWNlfS5iZWF1dGlmeV9vbl9zYXZlXCJcbiAgICAgIGJlYXV0aWZ5T25TYXZlID0gYXRvbS5jb25maWcuZ2V0KGtleSlcbiAgICAgIGxvZ2dlci52ZXJib3NlKCdzYXZlIGVkaXRvciBwb3NpdGlvbnMnLCBrZXksIGJlYXV0aWZ5T25TYXZlKVxuICAgICAgaWYgYmVhdXRpZnlPblNhdmVcbiAgICAgICAgbG9nZ2VyLnZlcmJvc2UoJ0JlYXV0aWZ5aW5nIGZpbGUnLCBmaWxlUGF0aClcbiAgICAgICAgYmVhdXRpZnkoe2VkaXRvciwgb25TYXZlOiB0cnVlfSlcbiAgICAgICAgLnRoZW4oKCkgLT5cbiAgICAgICAgICBsb2dnZXIudmVyYm9zZSgnRG9uZSBiZWF1dGlmeWluZyBmaWxlJywgZmlsZVBhdGgpXG4gICAgICAgICAgaWYgZWRpdG9yLmlzQWxpdmUoKSBpcyB0cnVlXG4gICAgICAgICAgICBsb2dnZXIudmVyYm9zZSgnU2F2aW5nIFRleHRFZGl0b3IuLi4nKVxuICAgICAgICAgICAgIyBTdG9yZSB0aGUgZmlsZVBhdGggdG8gcHJldmVudCBpbmZpbml0ZSBsb29waW5nXG4gICAgICAgICAgICAjIFdoZW4gV2hpdGVzcGFjZSBwYWNrYWdlIGhhcyBvcHRpb24gXCJFbnN1cmUgU2luZ2xlIFRyYWlsaW5nIE5ld2xpbmVcIiBlbmFibGVkXG4gICAgICAgICAgICAjIEl0IHdpbGwgYWRkIGEgbmV3bGluZSBhbmQga2VlcCB0aGUgZmlsZSBmcm9tIGNvbnZlcmdpbmcgb24gYSBiZWF1dGlmaWVkIGZvcm1cbiAgICAgICAgICAgICMgYW5kIHNhdmluZyB3aXRob3V0IGVtaXR0aW5nIG9uRGlkU2F2ZSBldmVudCwgYmVjYXVzZSB0aGVyZSB3ZXJlIG5vIGNoYW5nZXMuXG4gICAgICAgICAgICBwZW5kaW5nUGF0aHNbZmlsZVBhdGhdID0gdHJ1ZVxuICAgICAgICAgICAgZWRpdG9yLnNhdmUoKVxuICAgICAgICAgICAgZGVsZXRlIHBlbmRpbmdQYXRoc1tmaWxlUGF0aF1cbiAgICAgICAgICAgIGxvZ2dlci52ZXJib3NlKCdTYXZlZCBUZXh0RWRpdG9yLicpXG4gICAgICAgIClcbiAgICAgICAgLmNhdGNoKChlcnJvcikgLT5cbiAgICAgICAgICByZXR1cm4gc2hvd0Vycm9yKGVycm9yKVxuICAgICAgICApXG4gICAgZGlzcG9zYWJsZSA9IGVkaXRvci5vbkRpZFNhdmUoKHtwYXRoIDogZmlsZVBhdGh9KSAtPlxuICAgICAgIyBUT0RPOiBJbXBsZW1lbnQgZGVib3VuY2luZ1xuICAgICAgYmVhdXRpZnlPblNhdmVIYW5kbGVyKHtwYXRoOiBmaWxlUGF0aH0pXG4gICAgKVxuICAgIHBsdWdpbi5zdWJzY3JpcHRpb25zLmFkZCBkaXNwb3NhYmxlXG5cbmdldFVuc3VwcG9ydGVkT3B0aW9ucyA9IC0+XG4gIHNldHRpbmdzID0gYXRvbS5jb25maWcuZ2V0KCdhdG9tLWJlYXV0aWZ5JylcbiAgc2NoZW1hID0gYXRvbS5jb25maWcuZ2V0U2NoZW1hKCdhdG9tLWJlYXV0aWZ5JylcbiAgdW5zdXBwb3J0ZWRPcHRpb25zID0gXy5maWx0ZXIoXy5rZXlzKHNldHRpbmdzKSwgKGtleSkgLT5cbiAgICAjIHJldHVybiBhdG9tLmNvbmZpZy5nZXRTY2hlbWEoXCJhdG9tLWJlYXV0aWZ5LiR7a2V5fVwiKS50eXBlXG4gICAgIyByZXR1cm4gdHlwZW9mIHNldHRpbmdzW2tleV1cbiAgICBzY2hlbWEucHJvcGVydGllc1trZXldIGlzIHVuZGVmaW5lZFxuICApXG4gIHJldHVybiB1bnN1cHBvcnRlZE9wdGlvbnNcblxucGx1Z2luLmNoZWNrVW5zdXBwb3J0ZWRPcHRpb25zID0gLT5cbiAgdW5zdXBwb3J0ZWRPcHRpb25zID0gZ2V0VW5zdXBwb3J0ZWRPcHRpb25zKClcbiAgaWYgdW5zdXBwb3J0ZWRPcHRpb25zLmxlbmd0aCBpc250IDBcbiAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkV2FybmluZyhcIlBsZWFzZSBydW4gQXRvbSBjb21tYW5kICdBdG9tLUJlYXV0aWZ5OiBNaWdyYXRlIFNldHRpbmdzJy5cIiwge1xuICAgICAgZGV0YWlsIDogXCJZb3UgY2FuIG9wZW4gdGhlIEF0b20gY29tbWFuZCBwYWxldHRlIHdpdGggYGNtZC1zaGlmdC1wYCAoT1NYKSBvciBgY3RybC1zaGlmdC1wYCAoTGludXgvV2luZG93cykgaW4gQXRvbS4gWW91IGhhdmUgdW5zdXBwb3J0ZWQgb3B0aW9uczogI3t1bnN1cHBvcnRlZE9wdGlvbnMuam9pbignLCAnKX1cIixcbiAgICAgIGRpc21pc3NhYmxlIDogdHJ1ZVxuICAgIH0pXG5cbnBsdWdpbi5taWdyYXRlU2V0dGluZ3MgPSAtPlxuICB1bnN1cHBvcnRlZE9wdGlvbnMgPSBnZXRVbnN1cHBvcnRlZE9wdGlvbnMoKVxuICBuYW1lc3BhY2VzID0gYmVhdXRpZmllci5sYW5ndWFnZXMubmFtZXNwYWNlc1xuICAjIGNvbnNvbGUubG9nKCdtaWdyYXRlLXNldHRpbmdzJywgc2NoZW1hLCBuYW1lc3BhY2VzLCB1bnN1cHBvcnRlZE9wdGlvbnMpXG4gIGlmIHVuc3VwcG9ydGVkT3B0aW9ucy5sZW5ndGggaXMgMFxuICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRTdWNjZXNzKFwiTm8gb3B0aW9ucyB0byBtaWdyYXRlLlwiKVxuICBlbHNlXG4gICAgcmV4ID0gbmV3IFJlZ0V4cChcIigje25hbWVzcGFjZXMuam9pbignfCcpfSlfKC4qKVwiKVxuICAgIHJlbmFtZSA9IF8udG9QYWlycyhfLnppcE9iamVjdCh1bnN1cHBvcnRlZE9wdGlvbnMsIF8ubWFwKHVuc3VwcG9ydGVkT3B0aW9ucywgKGtleSkgLT5cbiAgICAgIG0gPSBrZXkubWF0Y2gocmV4KVxuICAgICAgaWYgbSBpcyBudWxsXG4gICAgICAgICMgRGlkIG5vdCBtYXRjaFxuICAgICAgICAjIFB1dCBpbnRvIGdlbmVyYWxcbiAgICAgICAgcmV0dXJuIFwiZ2VuZXJhbC4je2tleX1cIlxuICAgICAgZWxzZVxuICAgICAgICByZXR1cm4gXCIje21bMV19LiN7bVsyXX1cIlxuICAgICkpKVxuICAgICMgY29uc29sZS5sb2coJ3JlbmFtZScsIHJlbmFtZSlcbiAgICAjIGxvZ2dlci52ZXJib3NlKCdyZW5hbWUnLCByZW5hbWUpXG5cbiAgICAjIE1vdmUgYWxsIG9wdGlvbiB2YWx1ZXMgdG8gcmVuYW1lZCBrZXlcbiAgICBfLmVhY2gocmVuYW1lLCAoW2tleSwgbmV3S2V5XSkgLT5cbiAgICAgICMgQ29weSB0byBuZXcga2V5XG4gICAgICB2YWwgPSBhdG9tLmNvbmZpZy5nZXQoXCJhdG9tLWJlYXV0aWZ5LiN7a2V5fVwiKVxuICAgICAgIyBjb25zb2xlLmxvZygncmVuYW1lJywga2V5LCBuZXdLZXksIHZhbClcbiAgICAgIGF0b20uY29uZmlnLnNldChcImF0b20tYmVhdXRpZnkuI3tuZXdLZXl9XCIsIHZhbClcbiAgICAgICMgRGVsZXRlIG9sZCBrZXlcbiAgICAgIGF0b20uY29uZmlnLnNldChcImF0b20tYmVhdXRpZnkuI3trZXl9XCIsIHVuZGVmaW5lZClcbiAgICApXG4gICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFN1Y2Nlc3MoXCJTdWNjZXNzZnVsbHkgbWlncmF0ZWQgb3B0aW9uczogI3t1bnN1cHBvcnRlZE9wdGlvbnMuam9pbignLCAnKX1cIilcblxucGx1Z2luLmNvbmZpZyA9IF8ubWVyZ2UocmVxdWlyZSgnLi9jb25maWcuY29mZmVlJyksIGRlZmF1bHRMYW5ndWFnZU9wdGlvbnMpXG5wbHVnaW4uYWN0aXZhdGUgPSAtPlxuICBAc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG4gIEBzdWJzY3JpcHRpb25zLmFkZCBoYW5kbGVTYXZlRXZlbnQoKVxuICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb21tYW5kcy5hZGQgXCJhdG9tLXdvcmtzcGFjZVwiLCBcImF0b20tYmVhdXRpZnk6YmVhdXRpZnktZWRpdG9yXCIsIGJlYXV0aWZ5XG4gIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbW1hbmRzLmFkZCBcImF0b20td29ya3NwYWNlXCIsIFwiYXRvbS1iZWF1dGlmeTpoZWxwLWRlYnVnLWVkaXRvclwiLCBkZWJ1Z1xuICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb21tYW5kcy5hZGQgXCIudHJlZS12aWV3IC5maWxlIC5uYW1lXCIsIFwiYXRvbS1iZWF1dGlmeTpiZWF1dGlmeS1maWxlXCIsIGJlYXV0aWZ5RmlsZVxuICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb21tYW5kcy5hZGQgXCIudHJlZS12aWV3IC5kaXJlY3RvcnkgLm5hbWVcIiwgXCJhdG9tLWJlYXV0aWZ5OmJlYXV0aWZ5LWRpcmVjdG9yeVwiLCBiZWF1dGlmeURpcmVjdG9yeVxuICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb21tYW5kcy5hZGQgXCJhdG9tLXdvcmtzcGFjZVwiLCBcImF0b20tYmVhdXRpZnk6bWlncmF0ZS1zZXR0aW5nc1wiLCBwbHVnaW4ubWlncmF0ZVNldHRpbmdzXG5cbnBsdWdpbi5kZWFjdGl2YXRlID0gLT5cbiAgQHN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG4iXX0=
