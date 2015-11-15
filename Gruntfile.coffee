module.exports = (grunt)->
# URI for concat & minify
  grunt.uri = './'
  grunt.uriStatic = grunt.uri + 'build/'
  grunt.uriDist = grunt.uriStatic + 'dist/'

  grunt.initConfig

    watch:
      lib:
        files: ['lib/**/*.coffee', 'lib/**/*.jade']
        tasks: ['libBuild']
      app:
        files: ['./index.coffee']
        tasks: ['appBuild']
    clean:
      lib: ['build', 'apidoc']
      po: ['po']
      compile: ['build/translation']
      test: ['report']
      app: ['index.js']

    coffee:
      lib:
        files: [
          {
            expand: true,
            cwd: 'lib'
            src: ['**/*.coffee'],
            dest: './build',
            ext: '.js'
          }
        ]
      app:
        files:
          'index.js': 'index.coffee'

    ngTemplateCache:
      templates:
        files: [
          'build/views.js': 'lib/**/*.html'
        ]
        options:
          module: 'OODLib'
    jade:
      lib:
        options:
          pretty: true
        files:
          "lib/table/table.html": ["lib/table/table.jade"]
          "lib/footer/footer.html": ["lib/footer/footer.jade"]
          "lib/aside/aside.html": ["lib/aside/aside.jade"]
    copy:
      lib:
        expand: true
        cwd: 'lib/'
        src: ['**/*','!**/*.coffee', '!**/*.jade']
        dest:'build/'

    mochaTest:
      dev:
        options:
          reporter: 'spec',
          require: 'coffee-script/register'
        src: ['test/**/*.coffee']


    shell:
      apidoc:
        command: './node_modules/.bin/codo'
      karma:
        command: './karmarun.sh'
      coverage:
        command: 'python karmaReport.py'

    concat:
      dist:
        src: [
          grunt.uriStatic + 'common/' + 'base.js'
          grunt.uriStatic + 'table/' + '*.js'
          grunt.uriStatic + 'footer/' + '*.js'
          grunt.uriStatic + 'aside/' + '*.js'
          grunt.uriStatic + 'common/' + 'lib.js'
          grunt.uriStatic + 'translation.js'
          grunt.uriStatic + 'views.js'
          '!' + grunt.uriStatic + '*.min.js'
        ]
        dest:
          grunt.uriDist + 'ood-omega.js'

    uglify:
      dist:
        cwd: grunt.uriStatic
        dest: grunt.uriDist
        expand: true
        ext: '.min.js'
        flatten: true
        src: [
          'dist/ood-omega.js'
          '*.js'
          '!*.min.js'
        ]

    nggettext_extract:
      lib:
        files:
          'po/lib.pot': ['build/**/*.html']

    nggettext_compile:
      lib:
        files:
          'build/translation.js': ['po/*.pot']

  grunt.loadNpmTasks 'grunt-contrib-clean'
  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-contrib-watch'
  grunt.loadNpmTasks 'grunt-contrib-copy'
  grunt.loadNpmTasks 'grunt-contrib-jade'
  grunt.loadNpmTasks 'grunt-mocha-test'
  grunt.loadNpmTasks 'grunt-shell'
  grunt.loadNpmTasks 'grunt-contrib-uglify'
  grunt.loadNpmTasks 'grunt-contrib-concat'
  grunt.loadNpmTasks 'grunt-hustler'
  grunt.loadNpmTasks 'grunt-angular-gettext'

  grunt.registerTask "libBuild", ["clean:lib", "jade:lib", "coffee:lib", "copy:lib", 'ngTemplateCache', 'shell:apidoc']
  grunt.registerTask "package", ['concat', 'uglify']
  grunt.registerTask "appBuild", ["clean:app", "coffee:app"]
  grunt.registerTask "default", ['libBuild', 'appBuild']
  grunt.registerTask "cleanBuild", ["clean:dev"]
  grunt.registerTask "test", ["clean:test", "shell:karma"]
  grunt.registerTask "transExtract", ['clean:po', 'nggettext_extract']
  grunt.registerTask "transCompile", ['clean:compile', 'nggettext_compile']



