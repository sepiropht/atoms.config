Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.spawnWorker = spawnWorker;
exports.showError = showError;
exports.ruleURI = ruleURI;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _child_process = require('child_process');

var _child_process2 = _interopRequireDefault(_child_process);

var _atom = require('atom');

var _processCommunication = require('process-communication');

var _path = require('path');

'use babel';

function spawnWorker() {
  var env = Object.create(process.env);

  delete env.NODE_PATH;
  delete env.NODE_ENV;
  delete env.OS;

  var child = _child_process2['default'].fork((0, _path.join)(__dirname, 'worker.js'), [], { env: env, silent: true });
  var worker = (0, _processCommunication.createFromProcess)(child);

  child.stdout.on('data', function (chunk) {
    console.log('[Linter-ESLint] STDOUT', chunk.toString());
  });
  child.stderr.on('data', function (chunk) {
    console.log('[Linter-ESLint] STDERR', chunk.toString());
  });

  return { worker: worker, subscription: new _atom.Disposable(function () {
      worker.kill();
    }) };
}

function showError(givenMessage) {
  var givenDetail = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

  var detail = undefined;
  var message = undefined;
  if (message instanceof Error) {
    detail = message.stack;
    message = message.message;
  } else {
    detail = givenDetail;
    message = givenMessage;
  }
  atom.notifications.addError('[Linter-ESLint] ' + message, {
    detail: detail,
    dismissable: true
  });
}

function ruleURI(ruleId) {
  return 'http://eslint.org/docs/rules/' + ruleId;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3dpbGxpYW0vLmF0b20vcGFja2FnZXMvbGludGVyLWVzbGludC9zcmMvaGVscGVycy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7NkJBRXlCLGVBQWU7Ozs7b0JBQ2IsTUFBTTs7b0NBQ0MsdUJBQXVCOztvQkFDcEMsTUFBTTs7QUFMM0IsV0FBVyxDQUFBOztBQU9KLFNBQVMsV0FBVyxHQUFHO0FBQzVCLE1BQU0sR0FBRyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFBOztBQUV0QyxTQUFPLEdBQUcsQ0FBQyxTQUFTLENBQUE7QUFDcEIsU0FBTyxHQUFHLENBQUMsUUFBUSxDQUFBO0FBQ25CLFNBQU8sR0FBRyxDQUFDLEVBQUUsQ0FBQTs7QUFFYixNQUFNLEtBQUssR0FBRywyQkFBYSxJQUFJLENBQUMsZ0JBQUssU0FBUyxFQUFFLFdBQVcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBSCxHQUFHLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUE7QUFDeEYsTUFBTSxNQUFNLEdBQUcsNkNBQWtCLEtBQUssQ0FBQyxDQUFBOztBQUV2QyxPQUFLLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUUsVUFBQyxLQUFLLEVBQUs7QUFDakMsV0FBTyxDQUFDLEdBQUcsQ0FBQyx3QkFBd0IsRUFBRSxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQTtHQUN4RCxDQUFDLENBQUE7QUFDRixPQUFLLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUUsVUFBQyxLQUFLLEVBQUs7QUFDakMsV0FBTyxDQUFDLEdBQUcsQ0FBQyx3QkFBd0IsRUFBRSxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQTtHQUN4RCxDQUFDLENBQUE7O0FBRUYsU0FBTyxFQUFFLE1BQU0sRUFBTixNQUFNLEVBQUUsWUFBWSxFQUFFLHFCQUFlLFlBQU07QUFDbEQsWUFBTSxDQUFDLElBQUksRUFBRSxDQUFBO0tBQ2QsQ0FBQyxFQUFFLENBQUE7Q0FDTDs7QUFFTSxTQUFTLFNBQVMsQ0FBQyxZQUFZLEVBQXNCO01BQXBCLFdBQVcseURBQUcsSUFBSTs7QUFDeEQsTUFBSSxNQUFNLFlBQUEsQ0FBQTtBQUNWLE1BQUksT0FBTyxZQUFBLENBQUE7QUFDWCxNQUFJLE9BQU8sWUFBWSxLQUFLLEVBQUU7QUFDNUIsVUFBTSxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUE7QUFDdEIsV0FBTyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUE7R0FDMUIsTUFBTTtBQUNMLFVBQU0sR0FBRyxXQUFXLENBQUE7QUFDcEIsV0FBTyxHQUFHLFlBQVksQ0FBQTtHQUN2QjtBQUNELE1BQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxzQkFBb0IsT0FBTyxFQUFJO0FBQ3hELFVBQU0sRUFBTixNQUFNO0FBQ04sZUFBVyxFQUFFLElBQUk7R0FDbEIsQ0FBQyxDQUFBO0NBQ0g7O0FBRU0sU0FBUyxPQUFPLENBQUMsTUFBTSxFQUFFO0FBQzlCLDJDQUF1QyxNQUFNLENBQUU7Q0FDaEQiLCJmaWxlIjoiL2hvbWUvd2lsbGlhbS8uYXRvbS9wYWNrYWdlcy9saW50ZXItZXNsaW50L3NyYy9oZWxwZXJzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCdcblxuaW1wb3J0IENoaWxkUHJvY2VzcyBmcm9tICdjaGlsZF9wcm9jZXNzJ1xuaW1wb3J0IHsgRGlzcG9zYWJsZSB9IGZyb20gJ2F0b20nXG5pbXBvcnQgeyBjcmVhdGVGcm9tUHJvY2VzcyB9IGZyb20gJ3Byb2Nlc3MtY29tbXVuaWNhdGlvbidcbmltcG9ydCB7IGpvaW4gfSBmcm9tICdwYXRoJ1xuXG5leHBvcnQgZnVuY3Rpb24gc3Bhd25Xb3JrZXIoKSB7XG4gIGNvbnN0IGVudiA9IE9iamVjdC5jcmVhdGUocHJvY2Vzcy5lbnYpXG5cbiAgZGVsZXRlIGVudi5OT0RFX1BBVEhcbiAgZGVsZXRlIGVudi5OT0RFX0VOVlxuICBkZWxldGUgZW52Lk9TXG5cbiAgY29uc3QgY2hpbGQgPSBDaGlsZFByb2Nlc3MuZm9yayhqb2luKF9fZGlybmFtZSwgJ3dvcmtlci5qcycpLCBbXSwgeyBlbnYsIHNpbGVudDogdHJ1ZSB9KVxuICBjb25zdCB3b3JrZXIgPSBjcmVhdGVGcm9tUHJvY2VzcyhjaGlsZClcblxuICBjaGlsZC5zdGRvdXQub24oJ2RhdGEnLCAoY2h1bmspID0+IHtcbiAgICBjb25zb2xlLmxvZygnW0xpbnRlci1FU0xpbnRdIFNURE9VVCcsIGNodW5rLnRvU3RyaW5nKCkpXG4gIH0pXG4gIGNoaWxkLnN0ZGVyci5vbignZGF0YScsIChjaHVuaykgPT4ge1xuICAgIGNvbnNvbGUubG9nKCdbTGludGVyLUVTTGludF0gU1RERVJSJywgY2h1bmsudG9TdHJpbmcoKSlcbiAgfSlcblxuICByZXR1cm4geyB3b3JrZXIsIHN1YnNjcmlwdGlvbjogbmV3IERpc3Bvc2FibGUoKCkgPT4ge1xuICAgIHdvcmtlci5raWxsKClcbiAgfSkgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc2hvd0Vycm9yKGdpdmVuTWVzc2FnZSwgZ2l2ZW5EZXRhaWwgPSBudWxsKSB7XG4gIGxldCBkZXRhaWxcbiAgbGV0IG1lc3NhZ2VcbiAgaWYgKG1lc3NhZ2UgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgIGRldGFpbCA9IG1lc3NhZ2Uuc3RhY2tcbiAgICBtZXNzYWdlID0gbWVzc2FnZS5tZXNzYWdlXG4gIH0gZWxzZSB7XG4gICAgZGV0YWlsID0gZ2l2ZW5EZXRhaWxcbiAgICBtZXNzYWdlID0gZ2l2ZW5NZXNzYWdlXG4gIH1cbiAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKGBbTGludGVyLUVTTGludF0gJHttZXNzYWdlfWAsIHtcbiAgICBkZXRhaWwsXG4gICAgZGlzbWlzc2FibGU6IHRydWVcbiAgfSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJ1bGVVUkkocnVsZUlkKSB7XG4gIHJldHVybiBgaHR0cDovL2VzbGludC5vcmcvZG9jcy9ydWxlcy8ke3J1bGVJZH1gXG59XG4iXX0=
//# sourceURL=/home/william/.atom/packages/linter-eslint/src/helpers.js
