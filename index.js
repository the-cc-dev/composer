'use strict';

var Emitter = require('component-emitter');
var lazy = require('lazy-cache')(require);

var isObject = lazy('isobject');
var chokidar = lazy('chokidar');
var bach = lazy('bach');

var Task = require('./lib/task');
var noop = require('./lib/noop');
var map = require('./lib/map-deps');
var resolve = require('./lib/resolve');



/**
 * Composer constructor. Create a new Composer
 *
 * ```js
 * var composer = new Composer();
 * ```
 *
 * @api public
 */

function Composer () {
  Emitter.call(this);
  this.tasks = {};
}

require('util').inherits(Composer, Emitter);

/**
 * Register a new task with it's options and dependencies.
 *
 * Options:
 *
 *  - `deps`: array of dependencies
 *  - `flow`: How this task will be executed with it's dependencies (`series`, `parallel`, `settleSeries`, `settleParallel`)
 *
 * ```js
 * composer.task('site', ['styles'], function () {
 *   return app.src('templates/pages/*.hbs')
 *     .pipe(app.dest('_gh_pages'));
 * });
 * ```
 *
 * @param  {String} `name` Name of the task to register
 * @param {Object} `options` Options to set dependencies or control flow.
 * @param {String|Array|Function} `deps` Additional dependencies for this task.
 * @param {Function} `fn` Final function is the task to register.
 * @return {Object} Return `this` for chaining
 * @api public
 */

Composer.prototype.task = function(name/*, options, dependencies and task */) {
  var deps = [].concat.apply([], [].slice.call(arguments, 1));
  var options = {};
  var fn = noop;
  if (typeof deps[deps.length-1] === 'function') {
    fn = deps.pop();
  }

  if (deps.length && isObject()(deps[0])) {
    options = deps.shift();
  }

  options.deps = deps
    .concat(options.deps || [])
    .map(map.bind(this));

  var task = new Task({
    name: name,
    options: options,
    fn: fn
  });
  task.on('starting', this.handleTask.bind(this, 'starting'));
  task.on('finished', this.handleTask.bind(this, 'finished'));
  task.on('error', this.handleError.bind(this, 'error'));

  this.tasks[name] = task;
  return this;
};

/**
 * Event listener for task events.
 *
 * ```js
 * var task = this.tasks['default'];
 * task.on('starting', this.handleTask.bind(this, 'starting'));
 * ```
 *
 * @param  {String} `event` Name of the event being handled.
 * @param  {Object} `task` Task object being handled.
 * @param  {Object} `run` Current run object for the Task being handled.
 */

Composer.prototype.handleTask = function(event, task, run) {
  var info = {
    task: task,
    run: run
  };
  this.emit(['task', event].join('.'), info);
};

/**
 * Event listener for task error events.
 *
 * ```js
 * var task = this.tasks['default'];
 * task.on('error', this.handleError.bind(this, 'error'));
 * ```
 *
 * @param  {String} `event` Name of the event being handled.
 * @param  {Object} `err` Error from the Task being handled.
 * @param  {Object} `task` Task object being handled.
 * @param  {Object} `run` Current run object for the Task being handled.
 */

Composer.prototype.handleError = function (event, err, task, run) {
  var info = {
    task: task,
    run: run
  };
  this.emit(['task', event].join('.'), err, info);
}

/**
 * Run a task or list of tasks.
 *
 * ```js
 * composer.run('default', function (err, results) {
 *   if (err) return console.error(err);
 *   console.log(results);
 * });
 * ```
 *
 * @param {String|Array|Function} `tasks` List of tasks by name, function, or array of names/functions.
 * @param {Function} `cb` Callback function to be called when all tasks are finished running.
 * @api public
 */

Composer.prototype.run = function(/* list of tasks/functions to run */) {
  var args = [].concat.apply([], [].slice.call(arguments));
  var done = args.pop();
  if (typeof done !== 'function') {
    throw new Error('Expected the last argument to be a callback function, but got `' + typeof done + '`.');
  }

  var fns;
  try {
    fns = resolve.call(this, args);
  } catch (err) {
    return done(err);
  }

  if (fns.length === 1) {
    return fns[0](done);
  }

  var batch;
  try {
    batch =  bach().series.apply(bach(), fns);
  } catch (err) {
    return done(err);
  }
  return batch(done);
};

/**
 * Watch a file, directory, or glob pattern for changes and run a task or list of tasks
 * when changes are made.
 *
 * ```js
 * composer.watch('templates/pages/*.hbs', ['site']);
 * ```
 *
 * @param  {String|Array} `glob` Filename, Directory name, or glob pattern to watch
 * @param {String|Array|Function} `tasks` Tasks that are passed to `.run` when files in the glob are changed.
 * @return {Object} Returns `this` for chaining
 * @api public
 */

Composer.prototype.watch = function(glob/*, list of tasks/functions to run */) {
  var self = this;
  var len = arguments.length - 1, i = 0;
  var args = new Array(len + 1);
  while (len--) args[i] = arguments[++i];
  args[i] = done;

  var running = true;
  function done (err) {
    running = false;
    if (err) console.error(err);
  }

  chokidar().watch(glob)
    .on('ready', function () {
      running = false;
    })
    .on('all', function () {
      if (running) return;
      running = true;
      self.run.apply(self, args);
    });

  return this;
};

/**
 * Export instance of Composer
 * @type {Composer}
 */

module.exports = new Composer();

/**
 * Export Composer constructor
 * @type {Function}
 */

module.exports.Composer = Composer;
