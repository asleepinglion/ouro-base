/*


  sSSs_sSSs     .S       S.    .S_sSSs      sSSs_sSSs
 d%%SP~YS%%b   .SS       SS.  .SS~YS%%b    d%%SP~YS%%b
d%S'     `S%b  S%S       S%S  S%S   `S%b  d%S'     `S%b
S%S       S%S  S%S       S%S  S%S    S%S  S%S       S%S
S&S       S&S  S&S       S&S  S%S    d*S  S&S       S&S
S&S       S&S  S&S       S&S  S&S   .S*S  S&S       S&S
S&S       S&S  S&S       S&S  S&S_sdSSS   S&S       S&S
S&S       S&S  S&S       S&S  S&S~YSY%b   S&S       S&S
S*b       d*S  S*b       d*S  S*S   `S%b  S*b       d*S
S*S.     .S*S  S*S.     .S*S  S*S    S%S  S*S.     .S*S
 SSSbs_sdSSS    SSSbs_sdSSS   S*S    S&S   SSSbs_sdSSS
  YSSP~YSSY      YSSP~YSSY    S*S    SSS    YSSP~YSSY
                              SP
                              Y


              -= Ouro Base Class =-

*/

module.exports.extend = function() {

  //track the state of baking new classes in the factory
  var baking = false;

  //create a base class
  var BaseClass = function() {};

  BaseClass.prototype._executeIgnore = ['init', '_execute'];

  //add our extend method
  BaseClass.extend = function(definition) {

    //maintain a reference to the parent prototype
    var _super = this.prototype;

    //instantiate a base class, but don't execute init
    baking = true;
    var prototype = new this();
    baking = false;

    //loop through the properties of the new class
    for (var name in definition) {

      //if the new property is a function
      if (typeof definition[name] === 'function') {

        //wrap all class methods to provide _super and other functionality
        prototype[name] = (function(name, fn) {

          return function() {

            //maintain our scope to the instance
            var self = this;

            //setup return value
            var returnValue = undefined;

            //if we are overloading a parent function,
            //provide access to the _super method
            if (typeof _super[name] === 'function') {
              var tmp = this._super;
              this._super = _super[name];
            }

            //provide the ability for the extended class to wrap method execution
            if( typeof this._execute === 'function' && this._executeIgnore.indexOf(name) === -1 ) {

              returnValue = this._execute.call(self,name,fn,arguments);

              if (typeof _super[name] === 'function') {
                this._super = tmp;
              }

              return returnValue;

            } else {

              returnValue = fn.apply(self, arguments);

              if (typeof _super[name] === 'function') {
                this._super = tmp;
              }

              return returnValue;
            }

          };

        })(name, definition[name]);

      } else {

        //set the property on the new class' prototype
        prototype[name] = definition[name];

      }

    }

    //create our class constructor
    function Class() {

      //class construction is actually done in the init method
      if ( !baking ) {

        //execute the initialization hook if one exists
        if( typeof this.init === 'function' ) {
          this.init.apply(this, arguments);
        }
      }

    }

    //set our new prototype object
    Class.prototype = prototype;

    //use our custom class constructor
    Class.constructor = Class;

    //add the extend method to the new class
    Class.extend = arguments.callee;

    //return our new super class
    return Class;

  };

  //instantiate variables
  var i = 0;
  var definition = {};
  var mixins = [];

  //transform our input
  if( arguments.length > 1 ) {

    definition = arguments[arguments.length-1];

    for( i = 0; i < arguments.length-1; i++ ) {
      mixins.push(arguments[i]);
    }

  } else {

    definition = arguments[0];
  }

  //set up our new class using the extended definition
  var NewClass = BaseClass.extend(definition);

  //loop through our mixins and extend
  for( i = 0; i < mixins.length; i++ ) {
    NewClass = NewClass.extend(mixins[i].prototype);
  }

  //return our new class
  return NewClass;

};
