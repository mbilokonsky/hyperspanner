module.exports = {
  createActionFactory: require("./createActionFactory"),
  createStore: require("./createStore")
};

var store = createStore();

var weightLogger = createActionFactory.instant("WEIGHT", {args: ["weight"]});
var weightAction = weightLogger({weight:220});
store.dispatch(weightAction);

var readerActionFactory = createActionFactory.temporal("READING", {key: "title", startArgs: ["title"], stopArgs: ["title", "completed", "rating?", "thoughts?"]});
var startReading = readerActionFactory.start("Moby Dick");
store.dispatch(startReading);

/// time passes
var finishedReading = readerActionFactory.stop("Moby Dick", {completed: true, rating: 5, thoughts: "It made me sad for the whale, but ultimately hopeful that humanity will one day destroy itself."});
store.dispatch(finishedReading);

store.getLog();
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
