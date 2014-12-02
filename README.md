# A Simple Inheritance Model
##Based on John Resig's Model (http://ejohn.org/blog/simple-javascript-inheritance/)

The `Base` class provides an `extend` method to allow one class to pass its behavior on to another and even call parent methods from within child classes via calls to `_super`. Since every class extends from a common base, all classes have the `extend` method, and therefore you can modify or override any part of a `SuperJS` application.

The syntax for extension is essentially identical to that of Ember.JS. This was done on purpose; partly because its just a clean way of doing it, but also partly because of the preference of using Ember on the client side and further reducing the affects of context-switching. You simply pass in an object containing your methods and variables as the first variable of the extend method.

**Defining and Extending Classes**

```javascript
var SuperJS = require('superjs');

var Person = SuperJS.Class.extend({
  init: function() {
	console.log('I am a person');
  },

  jump: function() {
	this.emit('jumping');
  }
});

var Female = Person.extend({
  init: function() {
	this._super();
	console.log('I am a female.');
  }
});

var Ninja = Female.extend({
  init: function() {
	this._super();
	console.log('I am a ninja.');

	this.on('jumping', function() {
	  console.log("I'm jumping like a sexy ninja.");
	});
  }
});

```

A `Person` class is created from the `SuperJS` `Base` class by passing in an object to the `extend` method containing defintions for the `init` method and `jump` methods. `init` is the constructor for the class, and is called automatically when the class is instantiated.

Two other classes are created, `Female` and `Ninja`, each calling the `extend` method of the former, each passing in an object with its own constructor, each calling its parent constructor via `this._super`.

When the final class `Ninja` is then instantiated, each of the constructors are executed:

**Instantiating the Ninja class**
```javascript
var ninja = new Ninja();

"I am a person"
"I am a female."
"I am a ninja."
```

Since the `super` methods were called first in the constructor before any other instructions, the eldest parent executes first. This is a pretty useful pattern for layering on functionality and can be seen throughout SuperJS.

**Emitting and Responding to Events**

There is one other thing to note about the above example. The eldest class, `Parent` contains a method called `jump` which emits a `jumping` event. Calling the `jump` method on a `Person` or `Female` class will in fact emit an event, and one could subscribe to it, but the `Ninja` class is the only one that does so in its constructor.

```javascript
ninja.jump();

"I'm jumping like a sexy ninja"
```

This functionality is possible because the `Base` class in SuperJS is itself extended from Node's [EventEmitter class](http://nodejs.org/api/events.html).