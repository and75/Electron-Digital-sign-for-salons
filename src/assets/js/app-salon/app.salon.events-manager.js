const { fn } = require("jquery");

(function (that) {

    that.EventsManagerExec = function(name, action) {}

    that.EventsManagerTouch = {
        logEvents: false,
        tpCache: new Array(),
        offsetX: 0,
        offsetY: 0,
        panOffsetX: 0,
        panOffsetY: 0,
        params: {

        },
        exec: function (action) {

        },
        set_handler_by_class: function (name) {
            var list = document.getElementsByClassName(name);
            that.PrintDebug(list);
            for (let item of list) {
                //prevent default click
                item.onclick = this.block_event;
                //set new event for element
                var mc = new Hammer.Manager(item);
                var press = new Hammer.Press({ event: 'press', pointers: 1 });
                var pressUp = new Hammer.Press({ event: 'pressup', pointers: 1 });
                //var panmove = new Hammer.Pan({ event: 'panmove', pointers: 1 })
                press.recognizeWith(pressUp);
                press.requireFailure(pressUp);
                //mc.set({ multiUser: true })
                mc.add([press, pressUp]);
                mc.on("press", this.tap_handler);
                mc.on("pressup", this.end_handler);
            }
        },
        set_press_handlers_by_class: function set_handlers(name) {
            var list = document.getElementsByClassName(name);
            for (let item of list) {
                //prevent default click
                //set new event for element
                var mc = new Hammer.Manager(item);
                var press = new Hammer.Press({ event: 'press', pointers: 1, time: 50, threshold: 50 });
                var pressUp = new Hammer.Press({ event: 'pressup', pointers: 1, time: 0, threshold: 50 });
                //var panmove = new Hammer.Pan({ event: 'panmove', pointers: 1 })
                press.recognizeWith(pressUp);
                press.requireFailure(pressUp);
                mc.add([press, pressUp]);
                //mc.on("press", this.tap_handler);
                mc.on("pressup", this.tap_handler);
            }
        },
        set_tap_handlers_by_class: function set_handlers(name) {
            var list = document.getElementsByClassName(name);
            for (let item of list) {
                if(!$(item).hasClass('HammerSetted')){
                    item.onclick = this.block_event;
                    //set new event for element
                    new Hammer(item).off("tap");
                    var mc = new Hammer(item);
                    mc.on("tap", this.tap_handler);
                    $(item).addClass('HammerSetted');
                }
            }
        },
        block_event: function (ev) {
            ev.preventDefault();
        },
        tap_handler: function (ev) {
            ev.preventDefault();
            let fnHandler = '';
            let fnCallBack = '';
            let data = $(ev.target).data();
            if (!data.action) {
                data = $(ev.target).parent().data();
            }
            if (data.action) {
                if (data.action.indexOf(".") >= 0) {
                    let ctrlAction = data.action.split('.');
                    fnHandler = AppSalon[ctrlAction[0]][ctrlAction[1]];
                } else {
                    fnHandler = AppSalon[data.action];
                }
                if (typeof fnHandler === 'function') {
                    if (data.param) {
                        data.param = data.param.toString();
                        if (data.param.indexOf(",") >= 0) {
                            let ctrlParams = data.param.split(',');
                            if (ctrlParams.length == 2) {
                                fnHandler(ctrlParams[0], ctrlParams[1]);
                            }
                        } else {
                            fnHandler(data.param);
                        }
                    } else {
                        fnHandler();
                    }
                }
            }
            if (data.callback) {
                fnCallBack = AppSalon[data.callback];
                if (typeof fnCallBack === 'function') {
                    fnCallBack();
                }
            }
        },
        press_handler: function (ev) {
            ev.preventDefault();
            // Cache the touch points for later processing of 2-touch pinch/zoom
            //ev.target.style.background = "yellow";
            //ev.target.style.border = "3px dashed black";
        },
        press_end_handler: function (ev) {
            ev.preventDefault();
            if (ev.isFinal == true) {
                // Restore background and border to original values
                ev.target.style.background = "white";
                ev.target.style.border = "1px solid black";
            }
        },
        test: function () {
            console.log('TestMultiExt is ready');
        },
        enableLog: function (ev) {
            this.logEvents = this.logEvents ? false : true;
        },
        log: function (name, ev, printTargetIds) {
            var o = document.getElementsByTagName('output')[0];
            var s = name + ": touches = " + ev.touches.length +
                " ; targetTouches = " + ev.targetTouches.length +
                " ; changedTouches = " + ev.changedTouches.length;
            o.innerHTML += s + "";
            if (printTargetIds) {
                s = "";
                for (var i = 0; i < ev.targetTouches.length; i++) {
                    s += "... id = " + ev.targetTouches[i].identifier + "";
                }
                o.innerHTML += s;
            }
        },
        clearLog: function (event) {
            var o = document.getElementsByTagName('output')[0];
            o.innerHTML = "";
        },
        resetPinch: function () {
            var myElement = document.getElementById('body');
            var mc = new Hammer.Manager(myElement);
            // create a pinch and rotate recognizer
            // these require 2 pointers
            var pinch = new Hammer.Pinch();
            var rotate = new Hammer.Rotate();
            // we want to detect both the same time
            pinch.recognizeWith(rotate);
            // add to the Manager
            mc.add([pinch, rotate]);
            mc.on("pinch rotate", function (ev) {
                ev.preventDefault();
            });
        },
        resetSwipe: function () {
            var myElement = document.getElementById('body');
            var mc = new Hammer.Manager(myElement);
            var swipe = new Hammer.Swipe;
            swipe.recognizeWith(swipe); // we want to detect both the same time
            mc.add([swipe]); // add to the Manager
            mc.on("swipe", function (ev) {
                ev.preventDefault();
            });
        },
        oldTop: 0,
        resetPan: function () {
            var list = document.getElementsByClassName('bliwe-scrollbar');
            that.PrintDebug(list);
            for (let item of list) {
                if (item) {
                    var mc = new Hammer.Manager(item);
                    var pan = new Hammer.Pan;
                    pan.recognizeWith(pan);
                    mc.add([pan]);
                    mc.on("panup pandown", function (ev) {
                        ev.preventDefault();
                        let realPos = $(item).position().offset();
                        if (!that.EventsManagerTouch.oldTop) {
                            that.EventsManagerTouch.oldTop = realPos
                            oldTop = that.EventsManagerTouch.oldTop;
                        } else {
                            oldTop = that.EventsManagerTouch.oldTop;
                        }
                        let delta = Math.abs(ev.deltaY);
                        that.PrintDebug(realPos + ' / ' + delta + ' / ' + ev.deltaY + ' / ' + ev.center.y + ' / ' + oldTop);
                        delta = (delta > 0) ? delta / 2 : delta;
                        if (ev.type == 'pandown') {
                            newPos = oldTop - delta;
                        } else {
                            oldTop = oldTop + 50
                            newPos = oldTop + delta;
                        }
                        that.EventsManagerTouch.oldTop = newPos;
                        item.scroll($(item).position().left, newPos)
                    });
                }
            }
        },
        init: function (options) {
            $.extend(true, this.params, options);
            this.test();
            //this.set_press_handlers_by_class("bliwe-events");
            this.set_tap_handlers_by_class("bliwe-events");
            this.set_tap_handlers_by_class("bliwe-ev-scroll");
           
            this.resetPinch();
            this.resetSwipe();
            this.resetPan();
        }
    }

    that.EventsManagerInit = function () {
        that.EventsManagerTouch.init();
        $("body").bind("DOMSubtreeModified", function () {
            that.SetTimeOut('eventmanager', function () {
                console.log('EventsManagerInit Async');
                that.EventsManagerTouch.init();
            }, 200);
        });
    }

})(AppSalon);