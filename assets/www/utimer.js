var StackTimeout = function () {
  "use strict";
  this.counter = 0;
  this.list = [];

  this.startTimeout = function (f, t) {
    this.list.push(setTimeout(f, t));
    this.counter += 1;
  };

  this.stopTimeout = function () {
    var i = 0;
    //console.log("stopTimeout: " + this.counter);
    for (i = 0; i < this.counter; i += 1) {
      //console.log("--> " + this.list[i]);
      clearTimeout(this.list[i]);
      delete this.list[i];
    }

    this.counter = 0;
    this.list = [];
  };
};
