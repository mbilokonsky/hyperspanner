var clone = require("clone");

module.exports = function() {
  var data = [];

  return {
    put: function(action) {
      data.push(action);
    },
    getAll: function() {
      return clone(data);
    }
  }
}
