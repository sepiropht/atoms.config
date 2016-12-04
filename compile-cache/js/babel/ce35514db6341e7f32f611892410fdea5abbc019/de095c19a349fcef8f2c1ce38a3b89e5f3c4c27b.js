'use babel';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports['default'] = {
    projectDependencies: {
        type: 'object',
        title: 'Load project dependencies from package.json. Note: This can adversely affect load performance',
        properties: {
            suggestDev: {
                title: 'Suggest dev dependencies',
                type: 'boolean',
                'default': false
            },
            suggestProd: {
                title: 'Suggest regular dependencies',
                type: 'boolean',
                'default': false
            }
        }
    },
    fuzzy: {
        type: 'object',
        title: '(Experimental) Fuzzy file matching',
        properties: {
            enabled: {
                title: 'Enabled',
                type: 'boolean',
                'default': false
            },
            excludedDirs: {
                title: 'Directories to omit from matching',
                type: 'array',
                'default': ['node_modules', '.git']
            },
            fileTypes: {
                title: 'Allowable file types (* for anything)',
                type: 'array',
                'default': ['ts', 'js', 'jsx', 'json']
            }
        }
    },
    importTypes: {
        type: 'object',
        title: 'Import types for autocompletion',
        properties: {
            es6: {
                type: 'boolean',
                'default': true,
                title: 'ES6 style "Import"'
            },
            require: {
                type: 'boolean',
                'default': true,
                title: 'Commonjs "require"'
            }
        }
    },
    hiddenFiles: {
        type: 'boolean',
        'default': false,
        title: 'Show hidden files (files starting with ".") in suggestions'
    },
    removeExtensions: {
        type: 'array',
        'default': ['.js'],
        title: 'Removes extension from suggestion',
        description: 'Import statements can usually autoresolve certain filetypes without providing an extension; ' + 'this provides the option to drop the extension'
    }
};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3NlcGlyb3BodC8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtanMtaW1wb3J0L2xpYi9zZXR0aW5ncy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxXQUFXLENBQUE7Ozs7O3FCQUVJO0FBQ1gsdUJBQW1CLEVBQUU7QUFDakIsWUFBSSxFQUFFLFFBQVE7QUFDZCxhQUFLLEVBQUUsK0ZBQStGO0FBQ3RHLGtCQUFVLEVBQUU7QUFDUixzQkFBVSxFQUFFO0FBQ1IscUJBQUssRUFBRSwwQkFBMEI7QUFDakMsb0JBQUksRUFBRSxTQUFTO0FBQ2YsMkJBQVMsS0FBSzthQUNqQjtBQUNELHVCQUFXLEVBQUU7QUFDVCxxQkFBSyxFQUFFLDhCQUE4QjtBQUNyQyxvQkFBSSxFQUFFLFNBQVM7QUFDZiwyQkFBUyxLQUFLO2FBQ2pCO1NBQ0o7S0FDSjtBQUNELFNBQUssRUFBRTtBQUNILFlBQUksRUFBRSxRQUFRO0FBQ2QsYUFBSyxFQUFFLG9DQUFvQztBQUMzQyxrQkFBVSxFQUFFO0FBQ1IsbUJBQU8sRUFBRTtBQUNMLHFCQUFLLEVBQUUsU0FBUztBQUNoQixvQkFBSSxFQUFFLFNBQVM7QUFDZiwyQkFBUyxLQUFLO2FBQ2pCO0FBQ0Qsd0JBQVksRUFBRTtBQUNWLHFCQUFLLEVBQUUsbUNBQW1DO0FBQzFDLG9CQUFJLEVBQUUsT0FBTztBQUNiLDJCQUFTLENBQUMsY0FBYyxFQUFFLE1BQU0sQ0FBQzthQUNwQztBQUNELHFCQUFTLEVBQUU7QUFDUCxxQkFBSyxFQUFFLHVDQUF1QztBQUM5QyxvQkFBSSxFQUFFLE9BQU87QUFDYiwyQkFBUyxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLE1BQU0sQ0FBQzthQUN2QztTQUNKO0tBQ0o7QUFDRCxlQUFXLEVBQUU7QUFDVCxZQUFJLEVBQUUsUUFBUTtBQUNkLGFBQUssRUFBRSxpQ0FBaUM7QUFDeEMsa0JBQVUsRUFBRTtBQUNSLGVBQUcsRUFBRTtBQUNELG9CQUFJLEVBQUUsU0FBUztBQUNmLDJCQUFTLElBQUk7QUFDYixxQkFBSyxFQUFFLG9CQUFvQjthQUM5QjtBQUNELG1CQUFPLEVBQUU7QUFDTCxvQkFBSSxFQUFFLFNBQVM7QUFDZiwyQkFBUyxJQUFJO0FBQ2IscUJBQUssRUFBRSxvQkFBb0I7YUFDOUI7U0FDSjtLQUNKO0FBQ0QsZUFBVyxFQUFFO0FBQ1QsWUFBSSxFQUFFLFNBQVM7QUFDZixtQkFBUyxLQUFLO0FBQ2QsYUFBSyxFQUFFLDREQUE0RDtLQUN0RTtBQUNELG9CQUFnQixFQUFFO0FBQ2QsWUFBSSxFQUFFLE9BQU87QUFDYixtQkFBUyxDQUFDLEtBQUssQ0FBQztBQUNoQixhQUFLLEVBQUUsbUNBQW1DO0FBQzFDLG1CQUFXLEVBQUUsOEZBQThGLEdBQ3JHLGdEQUFnRDtLQUN6RDtDQUNKIiwiZmlsZSI6Ii9ob21lL3NlcGlyb3BodC8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtanMtaW1wb3J0L2xpYi9zZXR0aW5ncy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnXG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgICBwcm9qZWN0RGVwZW5kZW5jaWVzOiB7XG4gICAgICAgIHR5cGU6ICdvYmplY3QnLFxuICAgICAgICB0aXRsZTogJ0xvYWQgcHJvamVjdCBkZXBlbmRlbmNpZXMgZnJvbSBwYWNrYWdlLmpzb24uIE5vdGU6IFRoaXMgY2FuIGFkdmVyc2VseSBhZmZlY3QgbG9hZCBwZXJmb3JtYW5jZScsXG4gICAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgICAgIHN1Z2dlc3REZXY6IHtcbiAgICAgICAgICAgICAgICB0aXRsZTogJ1N1Z2dlc3QgZGV2IGRlcGVuZGVuY2llcycsXG4gICAgICAgICAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc3VnZ2VzdFByb2Q6IHtcbiAgICAgICAgICAgICAgICB0aXRsZTogJ1N1Z2dlc3QgcmVndWxhciBkZXBlbmRlbmNpZXMnLFxuICAgICAgICAgICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgICAgICAgICBkZWZhdWx0OiBmYWxzZVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcbiAgICBmdXp6eToge1xuICAgICAgICB0eXBlOiAnb2JqZWN0JyxcbiAgICAgICAgdGl0bGU6ICcoRXhwZXJpbWVudGFsKSBGdXp6eSBmaWxlIG1hdGNoaW5nJyxcbiAgICAgICAgcHJvcGVydGllczoge1xuICAgICAgICAgICAgZW5hYmxlZDoge1xuICAgICAgICAgICAgICAgIHRpdGxlOiAnRW5hYmxlZCcsXG4gICAgICAgICAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZXhjbHVkZWREaXJzOiB7XG4gICAgICAgICAgICAgICAgdGl0bGU6ICdEaXJlY3RvcmllcyB0byBvbWl0IGZyb20gbWF0Y2hpbmcnLFxuICAgICAgICAgICAgICAgIHR5cGU6ICdhcnJheScsXG4gICAgICAgICAgICAgICAgZGVmYXVsdDogWydub2RlX21vZHVsZXMnLCAnLmdpdCddXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZmlsZVR5cGVzOiB7XG4gICAgICAgICAgICAgICAgdGl0bGU6ICdBbGxvd2FibGUgZmlsZSB0eXBlcyAoKiBmb3IgYW55dGhpbmcpJyxcbiAgICAgICAgICAgICAgICB0eXBlOiAnYXJyYXknLFxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6IFsndHMnLCAnanMnLCAnanN4JywgJ2pzb24nXVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcbiAgICBpbXBvcnRUeXBlczoge1xuICAgICAgICB0eXBlOiAnb2JqZWN0JyxcbiAgICAgICAgdGl0bGU6ICdJbXBvcnQgdHlwZXMgZm9yIGF1dG9jb21wbGV0aW9uJyxcbiAgICAgICAgcHJvcGVydGllczoge1xuICAgICAgICAgICAgZXM2OiB7XG4gICAgICAgICAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgICAgICAgICAgICAgdGl0bGU6ICdFUzYgc3R5bGUgXCJJbXBvcnRcIidcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICByZXF1aXJlOiB7XG4gICAgICAgICAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgICAgICAgICAgICAgdGl0bGU6ICdDb21tb25qcyBcInJlcXVpcmVcIidcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sXG4gICAgaGlkZGVuRmlsZXM6IHtcbiAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgICAgdGl0bGU6ICdTaG93IGhpZGRlbiBmaWxlcyAoZmlsZXMgc3RhcnRpbmcgd2l0aCBcIi5cIikgaW4gc3VnZ2VzdGlvbnMnXG4gICAgfSxcbiAgICByZW1vdmVFeHRlbnNpb25zOiB7XG4gICAgICAgIHR5cGU6ICdhcnJheScsXG4gICAgICAgIGRlZmF1bHQ6IFsnLmpzJ10sXG4gICAgICAgIHRpdGxlOiAnUmVtb3ZlcyBleHRlbnNpb24gZnJvbSBzdWdnZXN0aW9uJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdJbXBvcnQgc3RhdGVtZW50cyBjYW4gdXN1YWxseSBhdXRvcmVzb2x2ZSBjZXJ0YWluIGZpbGV0eXBlcyB3aXRob3V0IHByb3ZpZGluZyBhbiBleHRlbnNpb247ICdcbiAgICAgICAgICAgICsgJ3RoaXMgcHJvdmlkZXMgdGhlIG9wdGlvbiB0byBkcm9wIHRoZSBleHRlbnNpb24nXG4gICAgfVxufVxuIl19