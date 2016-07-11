riot.tag2('toast', '<div id="toast_container" class="layout horizontal end-justified"> <div class="flex"></div> <div id="message" class=" layout horizontal start start-justified pre_scale_bottom_right {fade_in: is_shown} {fade_out: !is_shown} {scale: !is_shown}" riot-style="background-color:{color}; color:{forecolor}; margin: 20px;"> <div class="layout vertical center center-justified self-stretch" style="padding: 5px 45px 5px 5px;"><div>{message}</div></div> <fab_close onclick="{close}" style=" width: inherit; position: relative; left: 20px; height: 35px;"></fab_close> </div> </div>', 'toast #toast_container,[riot-tag="toast"] #toast_container,[data-is="toast"] #toast_container{ position: fixed; width: 100%; overflow: visible; bottom: 0px; right: 10px; z-index: 2500; } toast #toast_container #message,[riot-tag="toast"] #toast_container #message,[data-is="toast"] #toast_container #message{ padding: 5px 0 5px 5px; list-style-type: none; background-color: rgba(255,255,255,.9); -webkit-border-radius:10px; -moz-border-radius:10px; border-radius:10px; box-shadow: 0 4px 5px 0 rgba(0, 0, 0, 0.14), 0 1px 10px 0 rgba(0, 0, 0, 0.12), 0 2px 4px -1px rgba(0, 0, 0, 0.4); margin: 10px 0; } toast fab_close #fab_close_button,[riot-tag="toast"] fab_close #fab_close_button,[data-is="toast"] fab_close #fab_close_button{ border: solid 2px white; }', '', function(opts) {
"use strict";
var self = this;
self.is_shown = false;
UCosmic.load_tag('/components_riot/fab_close/fab_close.js', document.head);
var my_interval = undefined;
self.toggle = function (message, color, forecolor, timeout) {
    "use strict";
    self.is_shown = self.is_shown ? false : true;
    self.toast_container.style.height = self.is_shown ? '' : '0';
    self.toast_container.style.zIndex = self.is_shown ? '2500' : '-1';
    self.color = color;
    self.forecolor = forecolor;
    self.message = message;
    self.update();
    clearInterval(my_interval);
    my_interval = setInterval(function () {
        self.is_shown = self.is_shown ? false : true;
        self.toast_container.style.height = self.is_shown ? '' : '0';
        self.toast_container.style.zIndex = self.is_shown ? '2500' : '-1';
        self.update();
        clearInterval(my_interval);
    }, timeout);
};
self.close = function () {
    clearInterval(my_interval);
    self.is_shown = false;
    self.toast_container.style.height = self.is_shown ? '' : '0';
    self.toast_container.style.zIndex = self.is_shown ? '2500' : '-1';
};
self.on('mount', function () {
    self.toast_container.style.height = '0';
});
});