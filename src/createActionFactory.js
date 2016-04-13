var actionHero = require("action-hero");
var util = require("util");

function parsePayload(details, expectedArgs) {
  var payload = {};
  var missingArgs = [];

  expectedArgs.forEach(function(argName) {
    if (argName.indexOf("?") === -1) {              // args ending with ? are optional
      // so if the arg name is not optional, make sure it exists in your details object.
      if (!details.hasOwnProperty(argName)) {
        missingArgs.push(argName);
      }

      payload[argName] = details[argName];
    } else {
      argName = argName.substr(0, argName.length - 1); // remove the question mark.
      payload[argName] = details[argName];
    }


  });

  if (missingArgs.length > 0) {
    throw new TypeError("You must provide all required arguments. You have no values provided for: " + missingArgs.join("|"))
  }

  payload.$timestamp = new Date().toISOString();

  return payload;
}

function validateType(type) {
  return util.isString(type) && type.split(" ").length === 1;
}

function validateArgumentNames(argNames) {
  return argNames.every(function(argName) {
    return util.isString(argName) &&
      argName.indexOf(" ") === -1 &&
      argName.indexOf("$") !== 0 &&
      (argName.indexOf("?") === -1 || argName.indexOf("?") === argName.length - 1)
  });
}

function validateInstantConf(conf) {
  return validateArgumentNames(conf.args);
}

function validateTemporalConf(conf) {
  return validateArgumentNames(conf.startArgs.concat(conf.stopArgs).push(conf.key));
}

module.exports = {
  instant: function(type, conf) {
    if (!validateType(type)) {
      throw new TypeError("Type must be a string with no spaces");
    }

    if (!conf) {
      conf = {};
    } else {
      if (!util.isObject(conf)) {
        throw new TypeError("Config must be an object.");
      }
    }

    if (!conf.args) {
       conf.args = [];
    }

    if (!util.isArray(conf.args)) {
      throw new TypeError("Argument names must be specified as an array of strings.");
    }

    if (!validateInstantConf(conf)) {
      throw new TypeError("Your argument names contain illegal characters. Never start with $, do not include spaces and if you include '?' it must be as the final character, used to denote an optional argument.");
    };

    var action_creator = actionHero.createActionCreator(type);

    return function(details) {
      var payload = parsePayload(details, conf.args);
      return action_creator(payload);
    }
  },
  temporal: function(type, conf) {
    if (!validateType(type)) {
      throw new TypeError("Type must be a string with no spaces");
    }

    if (!validateTemporalConf(conf)) {
      throw new TypeError("Your argument names contain illegal characters. Never start with $, do not include spaces and if you include '?' it must be as the final character, used to denote an optional argument.");
    };

    var action_creator = actionHero.createActionCreator(type);

    return {
      start: function(key, details) {
        var payload = parsePayload(details, conf.startArgs);
        payload.$key = key;
        return action_creator(payload);
      },
      stop: function(key, details) {
        var payload = parsePayload(details, conf.startArgs);
        payload.$key = key;
        return action_creator(payload);
      }
    }
  }
}