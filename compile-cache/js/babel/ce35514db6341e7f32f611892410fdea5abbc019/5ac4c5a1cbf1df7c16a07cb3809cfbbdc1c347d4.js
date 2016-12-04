'use babel';

// These only match prefixes
Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.capturedDependency = capturedDependency;
exports.startsWith = startsWith;
exports.endsWith = endsWith;
exports.not = not;
exports.matchesNPMNaming = matchesNPMNaming;
exports.dropExtensions = dropExtensions;
exports.getDirAndFilePrefix = getDirAndFilePrefix;
exports.getParentDir = getParentDir;
exports.isHiddenFile = isHiddenFile;
var REQUIRE_REGEX = /require\(["']([^"']+)$/;
var ES6_REGEX = /(?:^import .*?|^}) from ["']([^"']+)$/;

function capturedDependency(prefix, importTypes) {
    var results = null;

    if (importTypes.es6) {
        results = ES6_REGEX.exec(prefix);
    }

    if (!results && importTypes.require) {
        results = REQUIRE_REGEX.exec(prefix);
    }

    if (results && results.length) {
        return results[1];
    }

    return null;
}

// Taken from MDN
function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}

function startsWith(base, keyword) {
    var keywordRegex = new RegExp('^' + escapeRegex(keyword));

    return keywordRegex.test(base);
}

function endsWith(base, keyword) {
    var keywordRegex = new RegExp(escapeRegex(keyword) + '$');

    return keywordRegex.test(base);
}

/**
 * Returns a function that returns the logical negation of the given function's output
 */

function not(func) {
    return function () {
        return !func.apply(undefined, arguments);
    };
}

// Used to check if a given string matches the constraints of NPM naming
// Algo basically taken from https://docs.npmjs.com/files/package.json

function matchesNPMNaming(prefix) {
    if (encodeURIComponent(prefix) !== prefix) {
        return false;
    }

    // I don't check for capital letters so that I can still match even if user puts caps for some reason
    return (/^[^._]/.test(prefix)
    );
}

function dropExtensions(fileName, extensions) {
    for (var i = 0; i < extensions.length; i++) {
        var ext = extensions[i];

        if (endsWith(fileName, ext)) {
            fileName = fileName.substring(0, fileName.length - ext.length);

            break;
        }
    }

    return fileName;
}

function getDirAndFilePrefix(filePath) {
    var pathParts = filePath.split('/');
    var toComplete = pathParts.pop();

    return [pathParts.join('/'), toComplete];
}

function getParentDir(filePath) {
    return getDirAndFilePrefix(filePath)[0];
}

function isHiddenFile(fileName) {
    return startsWith(fileName, '.');
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3NlcGlyb3BodC8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtanMtaW1wb3J0L2xpYi91dGlscy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxXQUFXLENBQUM7Ozs7Ozs7Ozs7Ozs7OztBQUdaLElBQU0sYUFBYSxHQUFHLHdCQUF3QixDQUFDO0FBQy9DLElBQU0sU0FBUyxHQUFHLHVDQUF1QyxDQUFDOztBQUVuRCxTQUFTLGtCQUFrQixDQUFDLE1BQU0sRUFBRSxXQUFXLEVBQUU7QUFDcEQsUUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDOztBQUVuQixRQUFJLFdBQVcsQ0FBQyxHQUFHLEVBQUU7QUFDakIsZUFBTyxHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7S0FDcEM7O0FBRUQsUUFBSSxDQUFDLE9BQU8sSUFBSSxXQUFXLENBQUMsT0FBTyxFQUFFO0FBQ2pDLGVBQU8sR0FBRyxhQUFhLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0tBQ3hDOztBQUVELFFBQUksT0FBTyxJQUFJLE9BQU8sQ0FBQyxNQUFNLEVBQUU7QUFDM0IsZUFBTyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDckI7O0FBRUQsV0FBTyxJQUFJLENBQUM7Q0FDZjs7O0FBR0QsU0FBUyxXQUFXLENBQUMsR0FBRyxFQUFFO0FBQ3RCLFdBQU8sR0FBRyxDQUFDLE9BQU8sQ0FBQyxxQkFBcUIsRUFBRSxNQUFNLENBQUMsQ0FBQztDQUNyRDs7QUFFTSxTQUFTLFVBQVUsQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFO0FBQ3RDLFFBQU0sWUFBWSxHQUFHLElBQUksTUFBTSxPQUFLLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBRyxDQUFDOztBQUU1RCxXQUFPLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7Q0FDbEM7O0FBRU0sU0FBUyxRQUFRLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRTtBQUNwQyxRQUFNLFlBQVksR0FBRyxJQUFJLE1BQU0sQ0FBSSxXQUFXLENBQUMsT0FBTyxDQUFDLE9BQUksQ0FBQzs7QUFFNUQsV0FBTyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0NBQ2xDOzs7Ozs7QUFLTSxTQUFTLEdBQUcsQ0FBQyxJQUFJLEVBQUU7QUFDdEIsV0FBTyxZQUFXO0FBQ2QsZUFBTyxDQUFDLElBQUksa0JBQUksU0FBUyxDQUFDLENBQUM7S0FDOUIsQ0FBQztDQUNMOzs7OztBQUlNLFNBQVMsZ0JBQWdCLENBQUMsTUFBTSxFQUFFO0FBQ3JDLFFBQUksa0JBQWtCLENBQUMsTUFBTSxDQUFDLEtBQUssTUFBTSxFQUFFO0FBQ3ZDLGVBQU8sS0FBSyxDQUFDO0tBQ2hCOzs7QUFHRCxXQUFPLFNBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDO01BQUM7Q0FDaEM7O0FBRU0sU0FBUyxjQUFjLENBQUMsUUFBUSxFQUFFLFVBQVUsRUFBRTtBQUNqRCxTQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsVUFBVSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUN4QyxZQUFJLEdBQUcsR0FBRyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7O0FBRXhCLFlBQUksUUFBUSxDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUMsRUFBRTtBQUN6QixvQkFBUSxHQUFHLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxNQUFNLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDOztBQUUvRCxrQkFBTTtTQUNUO0tBQ0o7O0FBRUQsV0FBTyxRQUFRLENBQUM7Q0FDbkI7O0FBRU0sU0FBUyxtQkFBbUIsQ0FBQyxRQUFRLEVBQUU7QUFDMUMsUUFBTSxTQUFTLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUN0QyxRQUFNLFVBQVUsR0FBRyxTQUFTLENBQUMsR0FBRyxFQUFFLENBQUM7O0FBRW5DLFdBQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLFVBQVUsQ0FBQyxDQUFDO0NBQzVDOztBQUVNLFNBQVMsWUFBWSxDQUFDLFFBQVEsRUFBRTtBQUNuQyxXQUFPLG1CQUFtQixDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0NBQzNDOztBQUVNLFNBQVMsWUFBWSxDQUFDLFFBQVEsRUFBRTtBQUNuQyxXQUFPLFVBQVUsQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLENBQUM7Q0FDcEMiLCJmaWxlIjoiL2hvbWUvc2VwaXJvcGh0Ly5hdG9tL3BhY2thZ2VzL2F1dG9jb21wbGV0ZS1qcy1pbXBvcnQvbGliL3V0aWxzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbi8vIFRoZXNlIG9ubHkgbWF0Y2ggcHJlZml4ZXNcbmNvbnN0IFJFUVVJUkVfUkVHRVggPSAvcmVxdWlyZVxcKFtcIiddKFteXCInXSspJC87XG5jb25zdCBFUzZfUkVHRVggPSAvKD86XmltcG9ydCAuKj98Xn0pIGZyb20gW1wiJ10oW15cIiddKykkLztcblxuZXhwb3J0IGZ1bmN0aW9uIGNhcHR1cmVkRGVwZW5kZW5jeShwcmVmaXgsIGltcG9ydFR5cGVzKSB7XG4gICAgbGV0IHJlc3VsdHMgPSBudWxsO1xuXG4gICAgaWYgKGltcG9ydFR5cGVzLmVzNikge1xuICAgICAgICByZXN1bHRzID0gRVM2X1JFR0VYLmV4ZWMocHJlZml4KTtcbiAgICB9XG5cbiAgICBpZiAoIXJlc3VsdHMgJiYgaW1wb3J0VHlwZXMucmVxdWlyZSkge1xuICAgICAgICByZXN1bHRzID0gUkVRVUlSRV9SRUdFWC5leGVjKHByZWZpeCk7XG4gICAgfVxuXG4gICAgaWYgKHJlc3VsdHMgJiYgcmVzdWx0cy5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIHJlc3VsdHNbMV07XG4gICAgfVxuXG4gICAgcmV0dXJuIG51bGw7XG59XG5cbi8vIFRha2VuIGZyb20gTUROXG5mdW5jdGlvbiBlc2NhcGVSZWdleChzdHIpIHtcbiAgICByZXR1cm4gc3RyLnJlcGxhY2UoL1suKis/XiR7fSgpfFtcXF1cXFxcXS9nLCBcIlxcXFwkJlwiKTsgLy8gJCYgbWVhbnMgdGhlIHdob2xlIG1hdGNoZWQgc3RyaW5nXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzdGFydHNXaXRoKGJhc2UsIGtleXdvcmQpIHtcbiAgICBjb25zdCBrZXl3b3JkUmVnZXggPSBuZXcgUmVnRXhwKGBeJHtlc2NhcGVSZWdleChrZXl3b3JkKX1gKTtcblxuICAgIHJldHVybiBrZXl3b3JkUmVnZXgudGVzdChiYXNlKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGVuZHNXaXRoKGJhc2UsIGtleXdvcmQpIHtcbiAgICBjb25zdCBrZXl3b3JkUmVnZXggPSBuZXcgUmVnRXhwKGAke2VzY2FwZVJlZ2V4KGtleXdvcmQpfSRgKTtcblxuICAgIHJldHVybiBrZXl3b3JkUmVnZXgudGVzdChiYXNlKTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIGEgZnVuY3Rpb24gdGhhdCByZXR1cm5zIHRoZSBsb2dpY2FsIG5lZ2F0aW9uIG9mIHRoZSBnaXZlbiBmdW5jdGlvbidzIG91dHB1dFxuICovXG5leHBvcnQgZnVuY3Rpb24gbm90KGZ1bmMpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiAhZnVuYyguLi5hcmd1bWVudHMpO1xuICAgIH07XG59XG5cbi8vIFVzZWQgdG8gY2hlY2sgaWYgYSBnaXZlbiBzdHJpbmcgbWF0Y2hlcyB0aGUgY29uc3RyYWludHMgb2YgTlBNIG5hbWluZ1xuLy8gQWxnbyBiYXNpY2FsbHkgdGFrZW4gZnJvbSBodHRwczovL2RvY3MubnBtanMuY29tL2ZpbGVzL3BhY2thZ2UuanNvblxuZXhwb3J0IGZ1bmN0aW9uIG1hdGNoZXNOUE1OYW1pbmcocHJlZml4KSB7XG4gICAgaWYgKGVuY29kZVVSSUNvbXBvbmVudChwcmVmaXgpICE9PSBwcmVmaXgpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8vIEkgZG9uJ3QgY2hlY2sgZm9yIGNhcGl0YWwgbGV0dGVycyBzbyB0aGF0IEkgY2FuIHN0aWxsIG1hdGNoIGV2ZW4gaWYgdXNlciBwdXRzIGNhcHMgZm9yIHNvbWUgcmVhc29uXG4gICAgcmV0dXJuIC9eW14uX10vLnRlc3QocHJlZml4KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRyb3BFeHRlbnNpb25zKGZpbGVOYW1lLCBleHRlbnNpb25zKSB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBleHRlbnNpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGxldCBleHQgPSBleHRlbnNpb25zW2ldO1xuXG4gICAgICAgIGlmIChlbmRzV2l0aChmaWxlTmFtZSwgZXh0KSkge1xuICAgICAgICAgICAgZmlsZU5hbWUgPSBmaWxlTmFtZS5zdWJzdHJpbmcoMCwgZmlsZU5hbWUubGVuZ3RoIC0gZXh0Lmxlbmd0aCk7XG5cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGZpbGVOYW1lO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0RGlyQW5kRmlsZVByZWZpeChmaWxlUGF0aCkge1xuICAgIGNvbnN0IHBhdGhQYXJ0cyA9IGZpbGVQYXRoLnNwbGl0KCcvJyk7XG4gICAgY29uc3QgdG9Db21wbGV0ZSA9IHBhdGhQYXJ0cy5wb3AoKTtcblxuICAgIHJldHVybiBbcGF0aFBhcnRzLmpvaW4oJy8nKSwgdG9Db21wbGV0ZV07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRQYXJlbnREaXIoZmlsZVBhdGgpIHtcbiAgICByZXR1cm4gZ2V0RGlyQW5kRmlsZVByZWZpeChmaWxlUGF0aClbMF07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0hpZGRlbkZpbGUoZmlsZU5hbWUpIHtcbiAgICByZXR1cm4gc3RhcnRzV2l0aChmaWxlTmFtZSwgJy4nKTtcbn1cbiJdfQ==