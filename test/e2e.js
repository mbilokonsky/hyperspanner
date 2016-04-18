var expect = require('chai').expect;

describe("hyperspanner", () => {
  var hs = require("../src/");
  var store = hs.createEphemeralStore();

  var weightLogger = hs.createActionFactory.instant("WEIGHT", {args: ["weight"]});
  var weightAction = weightLogger({weight:220});
  store.put(weightAction);

  var readerActionFactory = hs.createActionFactory.temporal("READING", {key: "title", startArgs: ["author"], stopArgs: ["completed", "rating?", "thoughts?"]});
  var startReading = readerActionFactory.start("Moby Dick", {author: "Herman Melville"});
  store.put(startReading);

  /// time passes
  var finishedReading = readerActionFactory.stop("Moby Dick", {completed: true, rating: 5, thoughts: "It made me sad for the whale, but ultimately hopeful that humanity will one day destroy itself."});
  store.put(finishedReading);

  var output = store.getAll();

  it('output has three entries', () => {
    expect(output.length).to.equal(3);
  });
  /*
  [
    {
      type: "WEIGHT",
      payload: {
        weight: 220,
        startTime: SOME_DATE,
        endTime: SAME_DATE_AS_START
      }
    },
    {
      type: "START_READING",
      payload: {
        key: "title",
        title: "Moby Dick",
        startTime: SOME_DATE
      }
    },
    {
      type: "STOP_READING",
      payload: {
        key: "title",
        title: "Moby Dick",
        startTime: SOME_DATE,
        endTime: SOME_OTHER_DATE,
        completed: true,
        rating: 5,
        thoughts: "It made me sad for the whale, but ultimately hopeful that humanity will one day destroy itself."
      }
    }
  ]
  */
})
