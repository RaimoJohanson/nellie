module.exports = function(grunt) {

    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        concat: {
            components: {
                src: [
                    'app/**/*.js'
                ],
                dest: 'app.js'
            }
        },

        ngAnnotate: {
            options: {
                singleQuotes: true
            },
            app: {
                files: {
                    'app.js': ['app.js']
                }
            }
        },

        uglify: {
            js: { //target
                option: {
                    mangle: false,
                },
                src: ['app.js'],
                dest: 'app.js'
            }
        },

        watch: {
            js: {
                files: ['app/**/*.js'],
                tasks: ['concat']
            }
        }

    });
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-ng-annotate');

    // the default task (running "grunt" in console) is "watch"
    grunt.registerTask('default', ['concat', 'watch']);

};
