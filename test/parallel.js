'use strict';

require('mocha');
const assert = require('assert');
const Composer = require('..');
let app;

describe('parallel', () => {
  beforeEach(() => {
    app = new Composer();
  });

  describe('callback', () => {
    it('should compose tasks into a function that runs in parallel', cb => {
      const actual = [];

      app.task('foo', function(next) {
        setTimeout(() => {
          actual.push('foo');
          next();
        }, 6);
      });

      app.task('bar', function(next) {
        setTimeout(() => {
          actual.push('bar');
          next();
        }, 1);
      });

      app.task('baz', function(next) {
        actual.push('baz');
        next();
      });

      const build = app.parallel(['foo', 'bar', 'baz']);

      build(err => {
        if (err) return cb(err);
        assert.deepEqual(actual, ['baz', 'bar', 'foo']);
        cb();
      });
    });

    it('should return an error when no functions are passed to parallel', cb => {
      const build = app.parallel();

      build(err => {
        assert(/actual/, err.message);
        assert(/tasks/, err.message);
        cb();
      });
    });

    it('should compose tasks with options into a function that runs in parallel', () => {
      const actual = [];
      const task = t => {
        return next => {
          setTimeout(() => {
            actual.push(t);
            next();
          }, t);
        };
      };

      const build = app.parallel([task(20), task(15), task(10), task(5), task(0)]);

      return build()
        .then(() => {
          assert.deepEqual(actual, [0, 5, 10, 15, 20]);
        });
    });

    it('should compose tasks with additional options into a function that runs in parallel', () => {
      const actual = [];

      app.task('foo', { silent: false }, function(next) {
        assert.equal(this.options.silent, true);
        assert.equal(this.options.foo, 'bar');

        setTimeout(() => {
          actual.push('foo');
          next();
        }, 2);
      });

      const options = { silent: true, foo: 'bar' };

      const build = app.parallel('foo', options, next => {
        actual.push('bar');
        next();
      });

      return build()
        .then(() => {
          assert.deepEqual(actual, ['bar', 'foo']);
        });
    });

    it('should run task dependencies in parallel', () => {
      const actual = [];

      app.task('foo', ['baz'], next => {
        setTimeout(() => {
          actual.push('foo');
          next();
        }, 15);
      });

      app.task('bar', ['qux'], next => {
        setTimeout(() => {
          actual.push('bar');
          next();
        }, 10);
      });

      app.task('baz', next => {
        setTimeout(() => {
          actual.push('baz');
          next();
        }, 5);
      });

      app.task('qux', next => {
        setTimeout(() => {
          actual.push('qux');
          next();
        }, 0);
      });

      const build = app.parallel(['foo', 'bar']);

      return build()
        .then(() => {
          assert.deepEqual(actual, ['qux', 'baz', 'bar', 'foo']);
        });
    });
  });

  describe('promise', () => {
    it('should run registered tasks in parallel', () => {
      const actual = [];

      app.task('foo', next => {
        setTimeout(() => {
          actual.push('foo');
          next();
        }, 8);
      });

      app.task('bar', next => {
        setTimeout(() => {
          actual.push('bar');
          next();
        }, 1);
      });

      app.task('baz', next => {
        actual.push('baz');
        next();
      });

      const build = app.parallel(['foo', 'bar', 'baz']);

      return build()
        .then(() => {
          assert.deepEqual(actual, ['baz', 'bar', 'foo']);
        });
    });

    it('should return an error when no functions are passed to parallel', cb => {
      const build = app.parallel();

      build(err => {
        assert(/actual/, err.message);
        assert(/tasks/, err.message);
        cb();
      });
    });

    it('should compose tasks with options into a function that runs in parallel', () => {
      const res = [];
      const task = function(t) {
        return function(next) {
          setTimeout(() => {
            res.push(t);
            next();
          }, t);
        };
      };

      const build = app.parallel([task(20), task(15), task(10), task(5), task(0)]);

      return build()
        .then(() => {
          assert.deepEqual(res, [0, 5, 10, 15, 20]);
        });
    });

    it('should compose tasks with additional options into a function that runs in parallel', () => {
      const actual = [];

      app.task('foo', { silent: false }, function(next) {
        assert.equal(this.options.silent, true);
        assert.equal(this.options.foo, 'bar');

        setTimeout(() => {
          actual.push('foo');
          next();
        }, 2);
      });

      const options = { silent: true, foo: 'bar' };

      const build = app.parallel('foo', options, function(next) {
        actual.push('bar');
        next();
      });

      return build()
        .then(() => {
          assert.deepEqual(actual, ['bar', 'foo']);
        });
    });

    it('should return a promise when called without a callback function', () => {
      const actual = [];
      let count = 0;

      app.on('error', err => {
        actual.push('error');
        assert.equal(err.message, 'bar error');
        count++;
      });

      app.task('foo', next => {
        setTimeout(() => {
          actual.push('foo');
          count++;
          next();
        }, 2);
      });

      const build = app.parallel('foo', next => {
        next(new Error('bar error'));
      });

      return build()
        .then(() => {
          throw new Error('expected an error');
        })
        .catch(err => {
          assert(err);
          assert.equal(count, 1);
          assert.deepEqual(actual, ['error']);
        });
    });
  });
});
