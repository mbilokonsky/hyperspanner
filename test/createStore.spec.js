var util = require("util");
var subject = require("../src/createEphemeralStore.js");
var expect = require('chai').expect;

describe('createEphemeralStore', function() {
  it("returns a function", () => {
    expect(util.isFunction(subject)).to.be.true;
  });

  describe('which returns an object', () => {
    describe('.put', () => {
      var store = subject();
      it('is a function', () => util.isFunction(store.put));

      it('adds a record to the underlying store', () => {
        var action = "pretend this is an action";
        store.put(action);
        expect(store.getAll()[0]).to.equal(action);
      });

      it('each store instance is isolated', () => {
        var store1 = subject();
        var store2 = subject();
        store1.put('testing');
        expect(store1.getAll().length).to.equal(1);
        expect(store2.getAll().length).to.equal(0);
      })
    });

    describe('.getAll', () => {
      var store = subject();
      it('is a function', () => expect(util.isFunction(store.getAll)));
      it('returns an array', () => expect(util.isArray(store.getAll())));

      it('containing all actions put into that store, in order.', () => {
        var source = ["a1", "a2", "a3", "a4"];
        for (var i = 0; i < source.length; i++) {
          store.put(source[i]);
        }

        expect(store.getAll()).to.deep.equal(source);
      });

      it('returns a copy of the internal structure, so mutations to that copy don\'t go into the store.', () => {
        var store2 = subject();
        store2.put('hello');
        store2.put('world');
        var data = store2.getAll();
        expect(data).to.deep.equal(['hello', 'world']);

        expect(store2.getAll()).to.deep.equal(data);
        data.push('!!!!!!'); // change our data
        expect(store2.getAll()).not.to.deep.equal(data); // our store no longer fits it.
      })
    });
  })
});
