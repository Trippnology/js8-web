module.exports = function (grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		browserify: {
			theme: {
				options: {
					transform: ['browserify-shim'],
				},
				files: {
					'app/public/js/app-bundle.js': 'app/public/js/app.js',
				},
			},
		},
		compass: {
			theme: {
				options: {
					sassDir: 'sass',
					cssDir: './',
					imagesDir: 'img',
					javascriptsDir: 'js',
					fontsDir: 'fonts',
					outputStyle: 'compact',
					relativeAssets: true,
					noLineComments: true,
				},
			},
		},
		copy: {
			vendor: {
				files: [
					{
						expand: false,
						src: 'node_modules/jquery/dist/jquery.min.js',
						dest: 'app/public/js/vendor/jquery.min.js',
					},
					{
						expand: false,
						src: 'node_modules/bootstrap/dist/css/bootstrap.min.css',
						dest: 'app/public/css/vendor/bootstrap.min.css',
					},
					{
						expand: false,
						src: 'node_modules/bootstrap/dist/js/bootstrap.bundle.min.js',
						dest: 'app/public/js/vendor/bootstrap.bundle.min.js',
					},
					{
						expand: false,
						src: 'node_modules/bootbox/dist/bootbox.min.js',
						dest: 'app/public/js/vendor/bootbox.min.js',
					},
					{
						expand: false,
						src: 'node_modules/htmx.org/dist/htmx.min.js',
						dest: 'app/public/js/vendor/htmx.min.js',
					},
				],
			},
		},
		cssmin: {
			options: {
				format: 'keep-breaks',
				report: 'gzip',
			},
			app: {
				files: {
					'app/public/css/style.min.css': 'app/public/css/style.css',
				},
			},
		},
		uglify: {
			options: {
				mangle: false,
			},
			app: {
				files: {
					'app/public/js/app-bundle.min.js':
						'app/public/js/app-bundle.js',
				},
			},
		},
		watch: {
			options: {
				livereload: true,
			},
			compass: {
				files: ['sass/**/*.scss'],
				tasks: ['css'],
			},
			js: {
				files: [
					'app/public/js/**/*.js',
					'!app/public/js/app-bundle.js',
					'!app/public/js/app-bundle.min.js',
				],
				tasks: ['js'],
			},
		},
	});

	grunt.loadNpmTasks('grunt-browserify');
	grunt.loadNpmTasks('grunt-contrib-compass');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');

	grunt.registerTask('default', ['compass', 'watch']);
	grunt.registerTask('css', ['compass', 'cssmin']);
	grunt.registerTask('js', ['browserify' /*'uglify'*/]);
	grunt.registerTask('build', ['css', 'js', 'copy']);
};
