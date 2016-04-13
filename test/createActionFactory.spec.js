var expect = require("chai").expect;
var subject = require("../src/createActionFactory");
var util = require("util");

describe('createActionFactory', function() {

  describe(".instant", () => {
    it("is a function", () => {
      expect(util.isFunction(subject.instant)).to.be.true;
    });

    describe("arguments", () => {
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
              expect(subject.instant.bind(null, "MY_TYPE", {args: [123]})).to.throw("Your argument names contain illegal characters. Never start with $, do not include spaces and if you include \'?\' it must be as the final character, used to denote an optional argument.");
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

    describe("which returns a function", () => {
      var instantLogger = subject.instant("MY_TYPE", {args: ["foo", "bar?"]});

      it("is a function", () => {
        expect(util.isFunction(instantLogger)).to.be.true;
      });

      describe("requires a `details` argument", () => {
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
  });

  describe(".temporal", () => {
    it("is a function", () => {
      expect(util.isFunction(subject.temporal)).to.be.true;
    });
  });

})