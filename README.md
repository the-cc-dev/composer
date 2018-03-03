# composer [![NPM version](https://img.shields.io/npm/v/composer.svg?style=flat)](https://www.npmjs.com/package/composer) [![NPM monthly downloads](https://img.shields.io/npm/dm/composer.svg?style=flat)](https://npmjs.org/package/composer) [![NPM total downloads](https://img.shields.io/npm/dt/composer.svg?style=flat)](https://npmjs.org/package/composer) [![Linux Build Status](https://img.shields.io/travis/doowb/composer.svg?style=flat&label=Travis)](https://travis-ci.org/doowb/composer) [![Windows Build Status](https://img.shields.io/appveyor/ci/doowb/composer.svg?style=flat&label=AppVeyor)](https://ci.appveyor.com/project/doowb/composer)

> API-first task runner with three methods: task, run and watch.

Please consider following this project's author, [Brian Woodward](https://github.com/doowb), and consider starring the project to show your :heart: and support.

- [Install](#install)
- [Usage](#usage)
- [API](#api)
- [Task execution](#task-execution)
- [Events](#events)
- [History](#history)
- [About](#about)

_(TOC generated by [verb](https://github.com/verbose/verb) using [markdown-toc](https://github.com/jonschlinkert/markdown-toc))_

## Install

Install with [npm](https://www.npmjs.com/):

```sh
$ npm install --save composer
```

**Heads up** the `.watch` method was removed in version `0.11.0`. If you need _watch_ functionality, use [base-tasks](https://github.com/jonschlinkert/base-tasks) and [base-watch](https://github.com/node-base/base-watch).

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

**Example**

```js
const composer = new Composer();
```

Dependencies may also be specified as a glob pattern. Be aware that
the order cannot be guarenteed when using a glob pattern.

**Params**

* `name` **{String}**: Name of the task to register
* `options` **{Object}**: Options to set dependencies or control flow.
* `options.deps` **{Object}**: array of dependencies
* `options.flow` **{Object}**: How this task will be executed with it's dependencies (`series`, `parallel`, `settleSeries`, `settleParallel`)
* `deps` **{String|Array|Function}**: Additional dependencies for this task.
* `fn` **{Function}**: Final function is the task to register.
* `returns` **{Object}**: Return the instance for chaining

**Example**

```js
// register task "site" with composer
app.task('site', ['styles'], function() {
  return app.src('templates/pages/*.hbs')
    .pipe(app.dest('_gh_pages'));
});
```

**Params**

* `tasks` **{String|Array}**: Array of task names to build. (Defaults to `[default]`).
* `options` **{Object}**: Optional options object to merge onto each task's options when building.
* `cb` **{Function}**: Optional callback function to be called when all tasks are finished building. If omitted, a Promise is returned.
* `returns` **{Promise}**: When `cb` is omitted, a Promise is returned that will resolve when the tasks are finished building.

**Example**

```js
app.build('default', function(err, results) {
  if (err) return console.error(err);
  console.log(results);
});
```

**Params**

* `tasks` **{String|Array|Function}**: List of tasks by name, function, or array of names/functions.
* `returns` **{Function}**: Composed function that may take a callback function.

**Example**

```js
app.task('foo', function(done) {
  console.log('this is foo');
  done();
});

const fn = app.series('foo', function bar(done) {
  console.log('this is bar');
  done();
});

fn(function(err) {
  if (err) return console.error(err);
  console.log('done');
});
//=> this is foo
//=> this is bar
//=> done
```

**Params**

* `tasks` **{String|Array|Function}**: List of tasks by name, function, or array of names/functions.
* `returns` **{Function}**: Composed function that may take a callback function.

**Example**

```js
app.task('foo', function(done) {
  setTimeout(function() {
    console.log('this is foo');
    done();
  }, 500);
});

const fn = app.parallel('foo', function bar(done) {
  console.log('this is bar');
  done();
});

fn(function(err) {
  if (err) return console.error(err);
  console.log('done');
});
//=> this is bar
//=> this is foo
//=> done
```

## Task execution

When an individual task is run, a new [Run](lib/run.js) instance is created with start, end, and duration information. This `run` object is emitted with [some events](#taskstarting) and also exposed on the `task` instance as the `.runInfo` property.

### properties

The `run` instance has the the following properties

**.date**

The `.date` property is an object containing the `.start` and `.end` date timestamps created with `new Date()`.

**.hr**

The `.hr` property is an object containing the `.start`, `.end` and `.duration` properties that are created by using `process.hrtime()`. These properties are the actual arrays returned from `process.hrtime()`.
There is also `.diff` and `.offset` computed properties that use the other properties to calculate the difference between `.start` and `.end` times (`.diff`) and the offset (error for time calculations) between the `.duration` and the `.diff` (this is usually very small).

**.duration**

The `.duration` property is a computed property that uses [pretty-time](https://github.com/jonschlinkert/pretty-time) to format the `.hr.duration` value into a human readable format.

## Events

[composer](https://github.com/doowb/composer) is an event emitter that may emit the following events:

### build

This event is emitted when the build is starting and when it's finished. The event emits an object containing the build runtime information.

```js
app.on('build', build => {});
```

#### `build` properties

* `.app` (object) - instance of Composer
* `.status` (string) - current build status<sup class="footnote-ref"><a href="#fn1" id="fnref1">[1]</a></sup>, either `register`, `starting` or `finished`.
* `.date` (object) - with a `.start` property indicating start time as a `Date` object.
* `.hr` (object) - with a `.start` property indicating the start time as an `hrtime` array.
* `.duration` (string) - that will provide the duration in a human readable format.
* `.diff` (string) - diff between the start and end times.
* `.offset` (string) offset between the start date and the start `hr` time

### task

This event is emitted when the task is registered, starting, and when it's finished. The event emits 2 arguments, the current instance of the task object and an object containing the task runtime information.

```js
app.on('task', (task, run) => {});
```

#### `task` properties

* `.status` (string) - current status<sup class="footnote-ref"><a href="#fn2" id="fnref2">[2]</a></sup> of the task. May be `register`, `starting`, or `finished`.

#### `run` properties

* `.date` (object) - has a `.start` property indicating the start time as a `Date` object.
* `.hr` (object) - has a `.start` property indicating the start time as an `hrtime` array.
* `.duration` (string) that will provide the duration in a human readable format.
* `.diff` (string) that will provide the diff between the start and end times.
* `.offset` (string) offset between the start date and the start hr time

### error

This event is emitted when an error occurrs during a `build`. The event emits an `Error` object with extra properties for debugging the _build and task_ that were running when the error occurred.

```js
app.on('error', err => {});
```

#### err properties

* `app`: current composer instance running the build
* `build`: current build runtime information
* `task`: current task instance running when the error occurred
* `run`: current task runtime information

## History

### v2.0.0

* Now requires Node.js v8.0 or higher

### v1.0.0

* Updates the events that are emitted and adds statuses to the objects emitted on the events. see issues [#20](../../issues/20) and [#21](../../issues/21)
* Updates the event objects to expose human readable durations. [see issue #23](../../issues/23)
* Removes unused properties. [see issue #24](../../issues/24)
* Updates `.build` to return a promise when the callback is not passed in. [see issue #28](../../issues/28)

### v0.14.0

* Updates [bach](https://github.com/gulpjs/bach) to `1.0.0`.
* Errors emitted from inside a task now have the `'in task "foo":'` prefixed to the error message. [see issue #22](../../issues/22)
* Expose `.runInfo` on the task object for use in event listeners and task functions.
* Add `.duration` to the `.run/.runInfo` object that shows the duration in a human friendly format. This will also show the current duration from the time the task started to the time it's called if used inside a task function. [see issue #23](../../issues/23)

```js
app.task('foo', function(cb) {
  console.log(this.runInfo.duration);
});
```

### v0.13.0

* Skip tasks by setting the `options.skip` option to the name of the task or an array of task names.
* Making additional `err` properties non-enumerable to cut down on error output.

### v0.12.0

* You can no longer get a task from the `.task()` method by passing only the name. Instead do `var task = app.tasks[name];`
* Passing only a name and no dependencies to `.task()` will result in a `noop` task being created.
* `options` may be passed to `.build()`, `.series()` and `.parallel()`
* `options` passed to `.build()` will be merged onto task options before running the task.
* Skip tasks by setting their `options.run` option to `false`.

### v0.11.3

* Allow passing es2015 javascript generator functions to `.task()`.

### v0.11.2

* Allow using glob patterns for task dependencies.

### v0.11.0

* **BREAKING CHANGE**: Removed `.watch()`. Watch functionality can be added to [base](https://github.com/node-base/base) applications using [base-watch](https://github.com/node-base/base-watch).

### v0.10.0

* Removes `session`.

### v0.9.0

* Use `default` when no tasks are passed to `.build()`.

### v0.8.4

* Ensure task dependencies are unique.

### v0.8.2

* Emitting `task` when adding a task through `.task()`
* Returning task when calling `.task(name)` with only a name.

### v0.8.0

* Emitting `task:*` events instead of generic `*` events. See [event docs](#events) for more information.

### v0.7.0

* No longer returning the current task when `.task()` is called without a name.
* Throwing an error when `.task()` is called without a name.

### v0.6.0

* Adding properties to `err` instances and emitting instead of emitting multiple parameters.
* Adding series and parallel flows/methods.

### v0.5.0

* **BREAKING CHANGE** Renamed `.run()` to `.build()`

### v0.4.2

* `.watch` returns an instance of `FSWatcher`

### v0.4.1

* Currently running task returned when calling `.task()` without a name.

### v0.4.0

* Add session-cache to enable per-task data contexts.

### v0.3.0

* Event bubbling/emitting changed.

### v0.1.0

* Initial release.

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
* [base-tasks](https://www.npmjs.com/package/base-tasks): base-methods plugin that provides a very thin wrapper around [https://github.com/jonschlinkert/composer](https://github.com/jonschlinkert/composer) for adding task methods to… [more](https://github.com/jonschlinkert/base-tasks) | [homepage](https://github.com/jonschlinkert/base-tasks "base-methods plugin that provides a very thin wrapper around <https://github.com/jonschlinkert/composer> for adding task methods to your application.")
* [generate](https://www.npmjs.com/package/generate): Command line tool and developer framework for scaffolding out new GitHub projects. Generate offers the… [more](https://github.com/generate/generate) | [homepage](https://github.com/generate/generate "Command line tool and developer framework for scaffolding out new GitHub projects. Generate offers the robustness and configurability of Yeoman, the expressiveness and simplicity of Slush, and more powerful flow control and composability than either.")
* [update](https://www.npmjs.com/package/update): Be scalable! Update is a new, open source developer framework and CLI for automating updates… [more](https://github.com/update/update) | [homepage](https://github.com/update/update "Be scalable! Update is a new, open source developer framework and CLI for automating updates of any kind in code projects.")
* [verb](https://www.npmjs.com/package/verb): Documentation generator for GitHub projects. Verb is extremely powerful, easy to use, and is used… [more](https://github.com/verbose/verb) | [homepage](https://github.com/verbose/verb "Documentation generator for GitHub projects. Verb is extremely powerful, easy to use, and is used on hundreds of projects of all sizes to generate everything from API docs to readmes.")

### Contributors

| **Commits** | **Contributor** | 
| --- | --- |
| 222 | [doowb](https://github.com/doowb) |
| 39 | [jonschlinkert](https://github.com/jonschlinkert) |

### Author

**Brian Woodward**

* [LinkedIn Profile](https://linkedin.com/in/woodwardbrian)
* [GitHub Profile](https://github.com/doowb)
* [Twitter Profile](https://twitter.com/doowb)

### License

Copyright © 2018, [Brian Woodward](https://github.com/doowb).
Released under the [MIT License](LICENSE).

***

_This file was generated by [verb-generate-readme](https://github.com/verbose/verb-generate-readme), v0.6.0, on March 02, 2018._

<hr class="footnotes-sep">
<section class="footnotes">
<ol class="footnotes-list">
<li id="fn1"  class="footnote-item">When `build.status` is `finished`, the `.hr` object also has `.duration` and `.diff` properties containing timing information calculated using `process.hrtime`. <a href="#fnref1" class="footnote-backref">↩</a>

</li>
<li id="fn2"  class="footnote-item">When `task.status` is `finished`, the `.hr` object also has `.duration` and `.diff` properties containing timing information calculated using `process.hrtime`. <a href="#fnref2" class="footnote-backref">↩</a>

</li>
</ol>
</section>