# composer [![NPM version](https://badge.fury.io/js/composer.svg)](http://badge.fury.io/js/composer)  [![Build Status](https://travis-ci.org/jonschlinkert/composer.svg)](https://travis-ci.org/jonschlinkert/composer)

> API-first task runner with three methods: task, run and watch.

## Install

Install with [npm](https://www.npmjs.com/)

```sh
$ npm i composer --save
```

## Usage

```js
var Composer = require('composer');
```

## API

### [Composer](index.js#L23)

Composer constructor. Create a new Composer

**Example**

```js
var composer = new Composer();
```

### [.task](index.js#L54)

Register a new task with it's options and dependencies.

Options:

* `deps`: array of dependencies
* `flow`: How this task will be executed with it's dependencies (`series`, `parallel`, `settleSeries`, `settleParallel`)

**Params**

* `name` **{String}**: Name of the task to register
* `options` **{Object}**: Options to set dependencies or control flow.
* `deps` **{String|Array|Function}**: Additional dependencies for this task.
* `fn` **{Function}**: Final function is the task to register.
* `returns` **{Object}**: Return `this` for chaining

**Example**

```js
composer.task('site', ['styles'], function () {
  return app.src('templates/pages/*.hbs')
    .pipe(app.dest('_gh_pages'));
});
```

### [.build](index.js#L108)

Build a task or list of tasks.

**Params**

* `tasks` **{String|Array|Function}**: List of tasks by name, function, or array of names/functions.
* `cb` **{Function}**: Callback function to be called when all tasks are finished building.

**Example**

```js
composer.build('default', function (err, results) {
  if (err) return console.error(err);
  console.log(results);
});
```

### [.series](index.js#L146)

Compose task or list of tasks into a single function that runs the tasks in series.

**Params**

* `tasks` **{String|Array|Function}**: List of tasks by name, function, or array of names/functions.
* `returns` **{Function}**: Composed function that may take a callback function.

**Example**

```js
composer.task('foo', function (done) {
  console.log('this is foo');
  done();
});

var fn = composer.series('foo', function bar(done) {
  console.log('this is bar');
  done();
});

fn(function (err) {
  if (err) return console.error(err);
  console.log('done');
});
//=> this is foo
//=> this is bar
//=> done
```

### [.parallel](index.js#L178)

Compose task or list of tasks into a single function that runs the tasks in parallel.

**Params**

* `tasks` **{String|Array|Function}**: List of tasks by name, function, or array of names/functions.
* `returns` **{Function}**: Composed function that may take a callback function.

**Example**

```js
composer.task('foo', function (done) {
  setTimeout(function () {
    console.log('this is foo');
    done();
  }, 500);
});

var fn = composer.parallel('foo', function bar(done) {
  console.log('this is bar');
  done();
});

fn(function (err) {
  if (err) return console.error(err);
  console.log('done');
});
//=> this is bar
//=> this is foo
//=> done
```

### [.watch](index.js#L197)

Watch a file, directory, or glob pattern for changes and build a task or list of tasks when changes are made. Watch is powered by [chokidar](https://github.com/paulmillr/chokidar) so the glob pattern may be anything that [chokidar.watch](https://github.com/paulmillr/chokidar#api) accepts.

**Params**

* `glob` **{String|Array}**: Filename, Directory name, or glob pattern to watch
* `options` **{Object}**: Additional options to be passed to [chokidar](https://github.com/paulmillr/chokidar)
* `tasks` **{String|Array|Function}**: Tasks that are passed to `.build` when files in the glob are changed.
* `returns` **{Object}**: Returns an instance of `FSWatcher` from [chokidar](https://github.com/paulmillr/chokidar)

**Example**

```js
var watcher = composer.watch('templates/pages/*.hbs', ['site']);
```

## Related projects

* [assemble](https://www.npmjs.com/package/assemble): Static site generator for Grunt.js, Yeoman and Node.js. Used by Zurb Foundation, Zurb Ink, H5BP/Effeckt,… [more](https://www.npmjs.com/package/assemble) | [homepage](http://assemble.io)
* [generate](https://www.npmjs.com/package/generate): Project generator, for node.js. | [homepage](https://github.com/generate/generate)
* [templates](https://www.npmjs.com/package/templates): System for creating and managing template collections, and rendering templates with any node.js template engine.… [more](https://www.npmjs.com/package/templates) | [homepage](https://github.com/jonschlinkert/templates)
* [update](https://www.npmjs.com/package/update): Update the year in all files in a project using glob patterns. | [homepage](https://github.com/jonschlinkert/update)
* [verb](https://www.npmjs.com/package/verb): Documentation generator for GitHub projects. Verb is extremely powerful, easy to use, and is used… [more](https://www.npmjs.com/package/verb) | [homepage](https://github.com/verbose/verb)

## Running tests

Install dev dependencies:

```sh
$ npm i -d && npm test
```

## Contributing

Pull requests and stars are always welcome. For bugs and feature requests, [please create an issue](https://github.com/jonschlinkert/composer/issues/new).

## Author

**Jon Schlinkert**

+ [github/jonschlinkert](https://github.com/jonschlinkert)
+ [twitter/jonschlinkert](http://twitter.com/jonschlinkert)

## License

Copyright © 2015 Jon Schlinkert
Released under the MIT license.

***

_This file was generated by [verb-cli](https://github.com/assemble/verb-cli) on October 12, 2015._