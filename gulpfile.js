var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var reload = browserSync.reload;
var markdownDocs = require('gulp-markdown-docs');
var highlight = require('highlight.js');
var marked = require('marked');
var renderer = new marked.Renderer();
var sass = require('gulp-sass');
var buildFolder = './build/';

// RENDER: Render HTML & Code
// ------------------------------------------------
function escape(html, encode) {
  return html
    .replace(!encode ? /&(?!#?\w+;)/g : /&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

renderer.code = function(code, lang, escaped) {

  var originalCode = code;
  var render = false;

  if (lang === 'render') {
    lang = 'html';
    render = true;
  }

  if (this.options.highlight) {
    var out = this.options.highlight(code, lang);
    if (out != null && out !== code) {
      escaped = true;
      code = out;
    }
  }

  if (!lang) {
    return '<pre><code>' +
      (escaped ? code : escape(code, true)) +
      '\n</code></pre>';
  }

  if (render) {
    return '<div class="codeBlock">' +
      '<div class="codeBlock-preview">' +
      originalCode +
      '</div>' +
      '<div class="codeBlock-code">' +
      '<pre><code class="' +
      this.options.langPrefix +
      escape(lang, true) +
      '">' +
      (escaped ? code : escape(code, true)) +
      '\n</code></pre></div></div>\n';
  }

  return '<pre><code class="' +
    this.options.langPrefix +
    escape(lang, true) +
    '">' +
    (escaped ? code : escape(code, true)) +
    '\n</code></pre>\n';
};

// TASK: server
// ------------------------------------------------
gulp.task('server', ['docs'], function() {
  return browserSync.init({
    server: {
      baseDir: "./build"
    }
  });
});

// TASK: docs
// ------------------------------------------------
gulp.task('docs', ['sass'], function() {
  return gulp.src('docs/**/*.md')
    .pipe(markdownDocs('index.html', {
      templatePath: __dirname + '/resources/layout.html',
      layoutStylesheetUrl: false,
      categorySort: 'rank',
      highlightTheme: 'github',
      markdown: {
        renderer: renderer,
        gfm: true,
        tables: true,
        breaks: false,
        pedantic: false,
        sanitize: false,
        smartLists: true,
        smartypants: false
      }
    }))
    .pipe(gulp.dest(buildFolder));
});

// TASK: sass
// ------------------------------------------------
gulp.task('sass', function() {
  return gulp.src("resources/scss/docs.scss")
    .pipe(sass())
    .pipe(gulp.dest(buildFolder))
    .pipe(browserSync.stream());
});


// TASK: watch
// ------------------------------------------------
gulp.task('watch', function() {
  gulp.watch("docs/**/*.md", ['docs']);
  gulp.watch("resources/scss/*.scss", ['sass']);
  gulp.watch("resources/*.html", ['docs']);
  gulp.watch("build/*.*", reload);
});

// ------------------------------------------------
// TASKS
// ------------------------------------------------
gulp.task('default', ['watch', 'sass', 'docs', 'server']);
