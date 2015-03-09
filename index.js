/*


  sSSs   .S       S.    .S_sSSs      sSSs   .S_sSSs        .S    sSSs
 d%%SP  .SS       SS.  .SS~YS%%b    d%%SP  .SS~YS%%b      .SS   d%%SP
d%S'    S%S       S%S  S%S   `S%b  d%S'    S%S   `S%b     S%S  d%S'
S%|     S%S       S%S  S%S    S%S  S%S     S%S    S%S     S%S  S%|
S&S     S&S       S&S  S%S    d*S  S&S     S%S    d*S     S&S  S&S
Y&Ss    S&S       S&S  S&S   .S*S  S&S_Ss  S&S   .S*S     S&S  Y&Ss
`S&&S   S&S       S&S  S&S_sdSSS   S&S~SP  S&S_sdSSS      S&S  `S&&S
  `S*S  S&S       S&S  S&S~YSSY    S&S     S&S~YSY%b      S&S    `S*S
   l*S  S*b       d*S  S*S         S*b     S*S   `S%b     d*S     l*S
  .S*P  S*S.     .S*S  S*S         S*S.    S*S    S%S    .S*S    .S*P
sSS*S    SSSbs_sdSSS   S*S          SSSbs  S*S    S&S  sdSSS   sSS*S
YSS'      YSSP~YSSY    S*S           YSSP  S*S    SSS  YSSY    YSS'
                       SP                  SP
                       Y                   Y

 */

var EventEmitter = require('events').EventEmitter;
var Promise = require('bluebird');

/**
 * SuperJS Base Class
 *
 * The SuperJS base class is based on John Resig's Simple Inheritance Model
 * (http://ejohn.org/blog/simple-javascript-inheritance/). It provides a convenient
 * mechanism to extend classes without directly working with the prototype chain.
 *
 * In addition, it incorporates SuperJS blueprints for intelligent management of
 * parameter transformations, validation, sanization, and integrated promises.
 *
 */

var initializing = false;

//create the actual base class from which all classes derive
var Class = function(){};

//create an extended class with the ability to call parent class methods via _super.
Class.extend = function(prop) {

  //maintain a reference to the parent prototype
  var _super = this.prototype;

  //instantiate a base class, but don't run init
  initializing = true;
  var prototype = new this();
  initializing = false;

  //loop through the properties of the new class
  for (var name in prop) {

    //if the new property is a function
    if (typeof prop[name] === 'function') {

      //wrap the new function with superjs features using a closure
      prototype[name] = (function (name, fn) {

        return function () {

          //if we are overloading a parent function, provide access to the _super method
          if (typeof _super[name] === 'function') {
            this._super = _super[name];
          }

          return new Promise(function(resolve, reject) {

            this.resolve = resolve;
            this.reject = reject;

            fn.apply(this, arguments)

          }).bind(this);

        };

      })(name, prop[name]);

    } else {

      prototype[name] = prop[name];

    }
  }

  //create our class constructor
  function Class() {

    //all construction is actually done in the init method
    if ( !initializing && this.init ) {
      this.init.apply(this, arguments);
    }

  }

  //populate our constructed prototype object
  Class.prototype = prototype;

  //enforce the constructor to be what we expect
  Class.constructor = Class;

  //and make this class extendable
  Class.extend = arguments.callee;

  return Class;

};

//add the extend method to node's event emitter
EventEmitter.extend = Class.extend;

//export our monkey patched EventEmitter with the new extend method
module.exports = EventEmitter;