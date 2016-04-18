var expect = require("chai").expect;
var subject = require("../src/createActionFactory");
var util = require("util");

describe('createActionFactory', function() {

  describe(".instant", () => {
    it("is a function", () => {
      expect(util.isFunction(subject.instant)).to.be.true;
    });

    describe("input", () => {
      describe("type", () => {
        it("is mandatory", () => {
          expect(subject.instant).to.throw();
        });

        it("requires a string with no spaces", () => {
          expect(subject.instant.bind(null, {})).to.throw("Type must be a string with no spaces");
          expect(subject.instant.bind(null, "this is an invalid type")).to.throw("Type must be a string with no spaces");
          expect(subject.instant.bind(null, "VALID_TYPE")).not.to.throw("Type must be a string with no spaces");
        });
      });

      describe("config", () => {
        it("is optional", () => {
          expect(subject.instant.bind(null, "MY_TYPE")).not.to.throw();
        });

        it("must be an object if present", () => {
          expect(subject.instant.bind(null, "MY_TYPE", "this_will_throw")).to.throw("Config must be an object.");
        });

        describe(".args", () => {

          it('is optional', () => {
            expect(subject.instant.bind(null, "MY_TYPE", {})).not.to.throw();
          });

          it('must be an array if present', () => {
            expect(subject.instant.bind(null, "MY_TYPE", {args: "this_will_throw"})).to.throw("Argument names must be specified as an array of strings.");
          });

          describe('whose arguments must adhere to the following rules:', () => {
            it('must be a string', () => {
              expect(subject.instant.bind(null, "MY_TYPE", {args: [123]})).to.throw('argument names must be strings that adhere to proper naming rules.');
            });

            it('must have no spaces', () => {
              expect(subject.instant.bind(null, "MY_TYPE", {args: ["this is a spaced string"]})).to.throw("Your argument names contain illegal characters. Never start with $, do not include spaces and if you include \'?\' it must be as the final character, used to denote an optional argument.");
            });

            it('may not begin with a dollar sign ($)', () => {
              expect(subject.instant.bind(null, "MY_TYPE", {args: ["$foo"]})).to.throw("Your argument names contain illegal characters. Never start with $, do not include spaces and if you include \'?\' it must be as the final character, used to denote an optional argument.");
            });

            it('may contain a question mark as the final character', () => {
              expect(subject.instant.bind(null, "MY_TYPE", {args: ['foobar?']})).not.to.throw();
            });

            it('may not contain a question mark in any other location', () => {
              expect(subject.instant.bind(null, "MY_TYPE", {args: ['foo?bar']})).to.throw("Your argument names contain illegal characters. Never start with $, do not include spaces and if you include \'?\' it must be as the final character, used to denote an optional argument.");
            });
          });
        });
      })
    });

    describe("output", () => {
      var instantLogger = subject.instant("MY_TYPE", {args: ["foo", "bar?"]});

      it("is a function", () => {
        expect(util.isFunction(instantLogger)).to.be.true;
      });

      describe("input", () => {
        describe("details", () => {
          it('must be an object', () => {
            expect(instantLogger.bind(null, "not_an_object")).to.throw("You must provide all required arguments. You have no values provided for: foo");
          });

          it('must supply valid values for all required arg types (those that did not end with a "?" in the args config property)', () => {
            expect(instantLogger.bind(null, {bar: "foo was not set!"})).to.throw("You must provide all required arguments. You have no values provided for: foo")
          });

          it('may leave out optional values for all optional arg types', () => {
            expect(instantLogger.bind(null, {foo: "this was required!"})).not.to.throw();
            expect(instantLogger.bind(null, {foo: "this was required!", bar: "this was optional!"})).not.to.throw();
          });
        });
      });

      describe("output", () => {
        describe("it returns an action", () => {
          var action = instantLogger({foo: "hello", bar: "world", baz: "not in spec!"});

          it('is an object', () => {
            expect(util.isObject(action)).to.be.true;
          });

          it("with a bound type", () => {
            expect(action.type).to.equal("MY_TYPE");
          });

          describe(".payload", () => {
            it("has a value for foo", () => {
              expect(action.payload.foo).to.equal("hello");
            });

            it("has a value for bar", () => {
              expect(action.payload.bar).to.equal("world");
            });

            it('has no value for baz, which was not specified in the action creator configuration', () => {
              expect(action.payload.baz).to.equal(undefined);
            });

            it('automatically had a timestamp added', () => {
              expect(util.isString(action.payload.$timestamp));
            });
          });
        })
      });
    });
  });

  describe(".temporal", () => {
    var temporal = subject.temporal;
    it("is a function", () => {
      expect(util.isFunction(temporal)).to.be.true;
    });

    describe("input", () => {
      describe("type", () => {
        it("is mandatory", () => {
          expect(temporal).to.throw('Type must be a string with no spaces');
        });

        it("must be a string with no spaces", () => {
          expect(temporal.bind(null, "foo bar")).to.throw('Type must be a string with no spaces');
          expect(temporal.bind(null, 'foo')).not.to.throw('Type must be a string with no spaces');
        });
      });

      describe("config", () => {
        it("is mandatory", () => {
          expect(temporal.bind(null, 'foo')).to.throw('Temporal action factories require a config parameter.')
        });

        it("must be an object", () => {
          expect(temporal.bind(null, 'foo', 'not_an_object')).to.throw('Config must be an object.');
          expect(temporal.bind(null, 'foo', {})).not.to.throw('Config must be an object.');
        });

        describe(".key", () => {
          it('must be a string.', () => {
            expect(temporal.bind(null, 'foo', {key: {}})).to.throw('config.key must be a string.');
            expect(temporal.bind(null, 'foo', {key: 'foobar'})).not.to.throw('config.key must be a string.');
          })
        });

        describe(".startArgs", () => {
          it('is not optional', () => {
            expect(temporal.bind(null, 'foo', {key: 'foobar'})).to.throw("Must provide arguments for start function.");
          });

          it('must be an array', () => {
            expect(temporal.bind(null, 'foo', {key: 'foobar', startArgs: "conspicuously not an array"})).to.throw('startArgs must be an array.');
            expect(temporal.bind(null, 'foo', {key: 'foobar', startArgs: ["foo", "bar"]})).not.to.throw('startArgs must be an array.');
          });

          it('must contain valid string values', () => {
            expect(temporal.bind(null, 'foo', {key: 'foobar', startArgs: [123, {}], stopArgs: []})).to.throw('argument names must be strings that adhere to proper naming rules.')
            expect(temporal.bind(null, 'foo', {key: 'foobar', startArgs: ['barfoo'], stopArgs: []})).not.to.throw('argument names must be strings that adhere to proper naming rules.')
          });

          it('must not contain your key', () => {
            expect(temporal.bind(null, 'foo', {key: 'foobar', startArgs: ['foobar'], stopArgs: []})).to.throw("do not include your key name in your start args.");
          });
        });

        describe(".stopArgs", () => {
          it('is not optional', () => {
            expect(temporal.bind(null, 'foo', {key: 'foobar', startArgs: []})).to.throw("Must provide arguments for stop function.");
          });

          it('must be an array', () => {
            expect(temporal.bind(null, 'foo', {key: 'foobar', startArgs:[], stopArgs: "not an array"})).to.throw('stopArgs must be an array.');
            expect(temporal.bind(null, 'foo', {key: 'foobar', startArgs:[], stopArgs: ["foo", "bar"]})).not.to.throw('stopArgs must be an array.');
          });

          it('must contain valid string values', () => {
            expect(temporal.bind(null, 'foo', {key: 'foobar', startArgs: [], stopArgs: [123, {}]})).to.throw('argument names must be strings that adhere to proper naming rules.')
            expect(temporal.bind(null, 'foo', {key: 'foobar', startArgs: [], stopArgs: ['barfoo']})).not.to.throw('argument names must be strings that adhere to proper naming rules.')
          });

          it('must not contain your key', () => {
            expect(temporal.bind(null, 'foo', {key: 'foobar', startArgs: [], stopArgs: ['foobar']})).to.throw("do not include your key name in your stop args.");
          });
        });
      });
    });

    describe('output', () => {
      var temporalObject = temporal('READ_BOOK', {key: 'title', startArgs: ['author'], stopArgs: ['rating', 'thoughts']});

      it("is an object", () => {
        expect(util.isObject(temporalObject)).to.be.true;
      });

      describe('.start', () => {
        it('is a function', () => {
          expect(util.isFunction(temporalObject.start));
        });

        describe('input', () => {
          it('if startArgs are specified, a config object is required', () => {
            expect(temporalObject.start.bind(null, 'Moby Dick')).to.throw("start details must be provided.");
          });

          it('requires an author, as specified in the factory.', () => {
            expect(temporalObject.start.bind(null, 'Moby Dick', {notAuthor:'foobar'})).to.throw('You must provide all required arguments. You have no values provided for: author');
          });
        });

        describe('output', () => {
          var action = temporalObject.start("Moby Dick", {author: "Herman Melville"});

          it("preserves action type", () => {
              expect(action.type).to.equal("READ_BOOK");
          });

          it("sets a timestamp", () => {
              expect(action.payload.hasOwnProperty('$timestamp')).to.be.true;
          });

          it("sets all startArg values on the payload", () => {
              expect(action.payload.author).to.equal("Herman Melville");
          });

          it("sets the key value as the key property on the payload", () => {
              expect(action.payload.title).to.equal("Moby Dick");
          });

          it("sets the $key property on the payload to the value of the key property", () => {
            expect(action.payload.$key).to.equal("Moby Dick");
          });
        });
      });

      describe('.stop', () => {
        it('is a function', () => {
          expect(util.isFunction(temporalObject.stop));
        });

        describe('input', () => {
          it('if stopArgs are specified, a config object is required', () => {
            expect(temporalObject.stop.bind(null, 'Moby Dick')).to.throw("stop details must be provided.");
          });

          it('requires rating and thoughts, as specified in the factory.', () => {
            expect(temporalObject.stop.bind(null, 'Moby Dick', {not_rating:'foobar', not_thoughts: "whatever"})).to.throw('You must provide all required arguments. You have no values provided for: rating|thoughts');
          });
        });

        describe('output', () => {
          var action = temporalObject.stop("Moby Dick", {rating: 5, thoughts: "It was very long."});

          it("preserves action type", () => {
              expect(action.type).to.equal("READ_BOOK");
          });

          it("sets a timestamp", () => {
              expect(action.payload.hasOwnProperty('$timestamp')).to.be.true;
          });

          it("sets all stopArg values on the payload", () => {
              expect(action.payload.rating).to.equal(5);
              expect(action.payload.thoughts).to.equal("It was very long.");
          });

          it("sets the key value as the key property on the payload", () => {
              expect(action.payload.title).to.equal("Moby Dick");
          });

          it("sets the $key property on the payload to the value of the key property", () => {
            expect(action.payload.$key).to.equal("Moby Dick");
          });
        });
      });
    })
  });

})
