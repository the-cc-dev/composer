# composer [![NPM version](https://img.shields.io/npm/v/composer.svg?style=flat)](https://www.npmjs.com/package/composer) [![NPM monthly downloads](https://img.shields.io/npm/dm/composer.svg?style=flat)](https://npmjs.org/package/composer) [![NPM total downloads](https://img.shields.io/npm/dt/composer.svg?style=flat)](https://npmjs.org/package/composer) [![Linux Build Status](https://img.shields.io/travis/doowb/composer.svg?style=flat&label=Travis)](https://travis-ci.org/doowb/composer) [![Windows Build Status](https://img.shields.io/appveyor/ci/doowb/composer.svg?style=flat&label=AppVeyor)](https://ci.appveyor.com/project/doowb/composer)

> Run and compose async tasks. Easily define groups of tasks to run in series or parallel.

Please consider following this project's author, [Brian Woodward](https://github.com/doowb), and consider starring the project to show your :heart: and support.

- [Install](#install)
- [Usage](#usage)
- [API](#api)
- [Events](#events)
- [Release history](#release-history)
- [About](#about)

_(TOC generated by [verb](https://github.com/verbose/verb) using [markdown-toc](https://github.com/jonschlinkert/markdown-toc))_

## Install

Install with [npm](https://www.npmjs.com/):

```sh
$ npm install --save composer
```

## Usage

```js
const Composer = require('composer');
const composer = new Composer();

composer.task('default', cb => {
  console.log('Task: ', this.name);
  cb();
});

composer.build('default')
  .then(() => console.log('done!'))
  .catch(console.error);
```

## API

### [.create](lib/tasks.js#L23)

Static factory method for creating a custom `Composer` class that extends the given `Emitter`.

**Params**

* `Emitter` **{function}**: Event emitter.
* `returns` **{Class}**: Returns a custom `Composer` class.

**Example**

```js
const Emitter = require('events');
const Composer = require('composer').create(Emitter);
const composer = new Composer();
```

### [Composer](lib/tasks.js#L38)

Create an instance of `Composer` with the given `options`.

**Params**

* `options` **{object}**

**Example**

```js
const Composer = require('composer');
const composer = new Composer();
```

### [.task](lib/tasks.js#L77)

Define a task. Tasks run asynchronously, either in series (by default) or parallel (when `options.parallel` is true). In order for the build to determine when a task is complete, _one of the following_ things must happen: 1) the callback must be called, 2) a promise must be returned, or 3) a stream must be returned.

**Params**

* `name` **{String}**: The task name.
* `deps` **{Object|Array|String|Function}**: Any of the following: task dependencies, callback(s), or options object, defined in any order.
* `callback` **{Function}**: (optional) If the last argument is a function, it will be called after all of the task's dependencies have been run.
* `returns` **{undefined}**

**Example**

```js
// 1. callback
app.task('default', cb => {
  // do stuff
  cb();
});
// 2. promise
app.task('default', () => {
  return Promise.resolve(null);
});
// 3. stream (using vinyl-fs or the lib of your choice)
app.task('default', function() {
  return vfs.src('foo/*.js');
});
```

### [.build](lib/tasks.js#L198)

Run one or more tasks.

**Params**

* `tasks` **{object|array|string|function}**: One or more tasks to run, options, or callback function. If no tasks are defined, the default task is automatically run.
* `callback` **{function}**: (optional)
* `returns` **{undefined}**

**Example**

```js
const build = app.series(['foo', 'bar', 'baz']);
// promise
build().then(console.log).catch(console.error);
// or callback
build(function() {
  if (err) return console.error(err);
});
```

### [.series](lib/tasks.js#L240)

Compose a function to run the given tasks in series.

**Params**

* `tasks` **{object|array|string|function}**: Tasks to run, options, or callback function. If no tasks are defined, the `default` task is automatically run, if one exists.
* `callback` **{function}**: (optional)
* `returns` **{promise|undefined}**: Returns a promise if no callback is passed.

**Example**

```js
const build = app.series(['foo', 'bar', 'baz']);
// promise
build().then(console.log).catch(console.error);
// or callback
build(function() {
  if (err) return console.error(err);
});
```

### [.parallel](lib/tasks.js#L293)

Compose a function to run the given tasks in parallel.

**Params**

* `tasks` **{object|array|string|function}**: Tasks to run, options, or callback function. If no tasks are defined, the `default` task is automatically run, if one exists.
* `callback` **{function}**: (optional)
* `returns` **{promise|undefined}**: Returns a promise if no callback is passed.

**Example**

```js
// call the returned function to start the build
const build = app.parallel(['foo', 'bar', 'baz']);
// promise
build().then(console.log).catch(console.error);
// callback
build(function() {
  if (err) return console.error(err);
});
// example task usage
app.task('default', build);
```

## Events

```js
app.on('task', function(task) {
  switch (task.status) {
    case 'pending':
      // Task was registered
      break;
    case 'preparing':
      // Task is preparing to run, emitted right before "starting"
      // (hint: you can use this event to dynamically skip tasks
      // by updating "task.skip" to "true" or a function)
      break;
    case 'starting':
      // Task is running
      break;
    case 'finished':
      // Task is finished running
      break;
  }
});
```

## Release history

See the [changelog](./CHANGELOG.md).

## About

<details>
<summary><strong>Contributing</strong></summary>

Pull requests and stars are always welcome. For bugs and feature requests, [please create an issue](../../issues/new).

</details>

<details>
<summary><strong>Running Tests</strong></summary>

Running and reviewing unit tests is a great way to get familiarized with a library and its API. You can install dependencies and run tests with the following command:

```sh
$ npm install && npm test
```

</details>

<details>
<summary><strong>Building docs</strong></summary>

_(This project's readme.md is generated by [verb](https://github.com/verbose/verb-generate-readme), please don't edit the readme directly. Any changes to the readme must be made in the [.verb.md](.verb.md) readme template.)_

To generate the readme, run the following command:

```sh
$ npm install -g verbose/verb#dev verb-generate-readme && verb
```

</details>

### Related projects

You might also be interested in these projects:

* [assemble](https://www.npmjs.com/package/assemble): Get the rocks out of your socks! Assemble makes you fast at creating web projects… [more](https://github.com/assemble/assemble) | [homepage](https://github.com/assemble/assemble "Get the rocks out of your socks! Assemble makes you fast at creating web projects. Assemble is used by thousands of projects for rapid prototyping, creating themes, scaffolds, boilerplates, e-books, UI components, API documentation, blogs, building websit")
* [generate](https://www.npmjs.com/package/generate): Command line tool and developer framework for scaffolding out new GitHub projects. Generate offers the… [more](https://github.com/generate/generate) | [homepage](https://github.com/generate/generate "Command line tool and developer framework for scaffolding out new GitHub projects. Generate offers the robustness and configurability of Yeoman, the expressiveness and simplicity of Slush, and more powerful flow control and composability than either.")
* [update](https://www.npmjs.com/package/update): Be scalable! Update is a new, open source developer framework and CLI for automating updates… [more](https://github.com/update/update) | [homepage](https://github.com/update/update "Be scalable! Update is a new, open source developer framework and CLI for automating updates of any kind in code projects.")
* [verb](https://www.npmjs.com/package/verb): Documentation generator for GitHub projects. Verb is extremely powerful, easy to use, and is used… [more](https://github.com/verbose/verb) | [homepage](https://github.com/verbose/verb "Documentation generator for GitHub projects. Verb is extremely powerful, easy to use, and is used on hundreds of projects of all sizes to generate everything from API docs to readmes.")

### Contributors

| **Commits** | **Contributor** | 
| --- | --- |
| 222 | [doowb](https://github.com/doowb) |
| 44 | [jonschlinkert](https://github.com/jonschlinkert) |

### Author

**Brian Woodward**

* [LinkedIn Profile](https://linkedin.com/in/woodwardbrian)
* [GitHub Profile](https://github.com/doowb)
* [Twitter Profile](https://twitter.com/doowb)

### License

Copyright © 2018, [Brian Woodward](https://github.com/doowb).
Released under the [MIT License](LICENSE).

***

_This file was generated by [verb-generate-readme](https://github.com/verbose/verb-generate-readme), v0.6.0, on April 19, 2018._