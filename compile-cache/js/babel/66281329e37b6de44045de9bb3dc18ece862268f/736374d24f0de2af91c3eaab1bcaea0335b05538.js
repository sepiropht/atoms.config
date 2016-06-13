Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

'use babel';
'use strict';

var utils = {
  getDB: function getDB() {
    // db.updateFilepath(utils.dbPath());
    // spyOn(db, 'readFile').andCallFake((callback) => {
    //   const props = {
    //     test: {
    //       _id: 'test',
    //       title: 'Test',
    //       paths: ['/Users/test'],
    //       icon: 'icon-test',
    //     }
    //   };
    //
    //   callback(props);
    // });

    // return db;
  },

  dbPath: function dbPath() {
    var specPath = _path2['default'].join(__dirname, 'db');
    var id = utils.id();

    return specPath + '/' + id + '.cson';
  },

  id: function id() {
    return '_' + Math.random().toString(36).substr(2, 9);
  }
};

exports['default'] = utils;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3dpbGxpYW0vLmF0b20vcGFja2FnZXMvcHJvamVjdC1tYW5hZ2VyL3NwZWMvdXRpbHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O29CQUdpQixNQUFNOzs7O0FBSHZCLFdBQVcsQ0FBQztBQUNaLFlBQVksQ0FBQzs7QUFJYixJQUFNLEtBQUssR0FBRztBQUNaLE9BQUssRUFBRSxpQkFBVzs7Ozs7Ozs7Ozs7Ozs7OztHQWdCakI7O0FBRUQsUUFBTSxFQUFFLGtCQUFXO0FBQ2pCLFFBQU0sUUFBUSxHQUFHLGtCQUFLLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDNUMsUUFBTSxFQUFFLEdBQUcsS0FBSyxDQUFDLEVBQUUsRUFBRSxDQUFDOztBQUV0QixXQUFVLFFBQVEsU0FBSSxFQUFFLFdBQVE7R0FDakM7O0FBRUQsSUFBRSxFQUFFLGNBQVc7QUFDYixXQUFPLEdBQUcsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7R0FDdEQ7Q0FDRixDQUFDOztxQkFFYSxLQUFLIiwiZmlsZSI6Ii9ob21lL3dpbGxpYW0vLmF0b20vcGFja2FnZXMvcHJvamVjdC1tYW5hZ2VyL3NwZWMvdXRpbHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5cbmNvbnN0IHV0aWxzID0ge1xuICBnZXREQjogZnVuY3Rpb24oKSB7XG4gICAgLy8gZGIudXBkYXRlRmlsZXBhdGgodXRpbHMuZGJQYXRoKCkpO1xuICAgIC8vIHNweU9uKGRiLCAncmVhZEZpbGUnKS5hbmRDYWxsRmFrZSgoY2FsbGJhY2spID0+IHtcbiAgICAvLyAgIGNvbnN0IHByb3BzID0ge1xuICAgIC8vICAgICB0ZXN0OiB7XG4gICAgLy8gICAgICAgX2lkOiAndGVzdCcsXG4gICAgLy8gICAgICAgdGl0bGU6ICdUZXN0JyxcbiAgICAvLyAgICAgICBwYXRoczogWycvVXNlcnMvdGVzdCddLFxuICAgIC8vICAgICAgIGljb246ICdpY29uLXRlc3QnLFxuICAgIC8vICAgICB9XG4gICAgLy8gICB9O1xuICAgIC8vXG4gICAgLy8gICBjYWxsYmFjayhwcm9wcyk7XG4gICAgLy8gfSk7XG5cbiAgICAvLyByZXR1cm4gZGI7XG4gIH0sXG5cbiAgZGJQYXRoOiBmdW5jdGlvbigpIHtcbiAgICBjb25zdCBzcGVjUGF0aCA9IHBhdGguam9pbihfX2Rpcm5hbWUsICdkYicpO1xuICAgIGNvbnN0IGlkID0gdXRpbHMuaWQoKTtcblxuICAgIHJldHVybiBgJHtzcGVjUGF0aH0vJHtpZH0uY3NvbmA7XG4gIH0sXG5cbiAgaWQ6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiAnXycgKyBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zdWJzdHIoMiwgOSk7XG4gIH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IHV0aWxzO1xuIl19
//# sourceURL=/home/william/.atom/packages/project-manager/spec/utils.js
