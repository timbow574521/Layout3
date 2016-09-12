riot.tag2('content_scroller', '<div id="content_scroller_main_container" class="layout horizontal center center-justified " show="{content_list && content_list.length > 0}" riot-style="max-width: {opts.max_width}; width: {opts.width}; height: {opts.height}; max-height: {opts.height};"> <div id="scroller_content_container" class="flex"> <div id="scroller_content_container_inner" class="layout vertical"> <div each="{content, i in content_list}" class="scroller_content layout horizontal center center-justified" id="content{i}"> <echo_html class=" " content="{content}"></echo_html> </div> </div> </div> <div class="content_list_icon right layout vertical center center-justified" show="{content_list.length > 1}"> <div each="{content, i in content_list}" class="dot {i == content_index ? \'selected\' : \'\'}" id="scroll_dot{i}" onclick="{dot_clicked}"> </div> </div> </div>', 'content_scroller img,[riot-tag="content_scroller"] img,[data-is="content_scroller"] img{ margin: 0; } content_scroller .content_list_icon,[riot-tag="content_scroller"] .content_list_icon,[data-is="content_scroller"] .content_list_icon{ cursor: pointer; position: relative; width: 3em; } content_scroller .content_list_icon.right,[riot-tag="content_scroller"] .content_list_icon.right,[data-is="content_scroller"] .content_list_icon.right{ width: 1em; position: relative; right: 1em; } content_scroller #scroller_content_container,[riot-tag="content_scroller"] #scroller_content_container,[data-is="content_scroller"] #scroller_content_container{ overflow: hidden; margin: 0 10px; padding:0; } content_scroller #scroller_content_container_inner,[riot-tag="content_scroller"] #scroller_content_container_inner,[data-is="content_scroller"] #scroller_content_container_inner{ display: inline-flex; position: relative; margin: 0; padding:0; } content_scroller .scroller_content,[riot-tag="content_scroller"] .scroller_content,[data-is="content_scroller"] .scroller_content{ display: inline-block; margin: 0; } content_scroller #content_div,[riot-tag="content_scroller"] #content_div,[data-is="content_scroller"] #content_div{ display: inline-block; width: 100%; max-width: 800px; } content_scroller .dot,[riot-tag="content_scroller"] .dot,[data-is="content_scroller"] .dot{ background-color: white; border-radius: 10px; height:20px; width: 20px; } content_scroller .dot.selected,[riot-tag="content_scroller"] .dot.selected,[data-is="content_scroller"] .dot.selected{ height:16px; width: 16px; background-color: green; border: 2px solid white; } content_scroller .dot:not(:last-child),[riot-tag="content_scroller"] .dot:not(:last-child),[data-is="content_scroller"] .dot:not(:last-child){ margin-bottom: 10px; } @media (max-width: 500px) { content_scroller img,[riot-tag="content_scroller"] img,[data-is="content_scroller"] img{ width: 100%; } }', '', function(opts) {
"use strict";
var self = this;
self.content_index = 0;
var last_scroll_position = 1,
    is_scrolling = false;
self.on('mount', function () {});
self.start_top = 0;

var animate = function animate(time, start_time, element, start_top, is_bottom, height) {
    if (is_bottom) {
        snabbt(element, {
            position: [0, start_top - height, 0],
            easing: 'easeOut',
            duration: 250
        });
    } else {
            snabbt(element, {
                position: [0, start_top + height, 0],
                easing: 'easeOut',
                duration: 250
            });
        }
    setTimeout(function () {
        element.style.webkitTransform = element.style.transform;
        self.update();
    }, 300);
};

self.dot_clicked = function (event) {
    if (self.content_index < event.item.i) {
        self.content_index = event.item.i - 1;
        self.bottom();
    } else if (self.content_index > event.item.i) {
        self.content_index = event.item.i + 1;
        self.top();
    }
};

self.top = function () {

    var prev_content_index = self.content_index;
    self.content_index != 0 ? self.content_index -= 1 : self.content_index = self.list_length - 1;
    self.start_top = -1 * (self.content_index + 1) * self.scroller_content_container.clientHeight;
    animate(0, self.opts.time_out, self.scroller_content_container_inner, self.start_top, false, self.scroller_content_container.clientHeight);
};
self.bottom = function () {
    var prev_content_index = self.content_index;
    self.content_index != self.list_length - 1 ? self.content_index += 1 : self.content_index = 0;
    self.start_top = -1 * (self.content_index - 1) * self.scroller_content_container.clientHeight;
    animate(0, self.opts.time_out, self.scroller_content_container_inner, self.start_top, true, self.scroller_content_container.clientHeight);
};

var is_scrolling_2 = false;

var scroll_handler = function scroll_handler(event) {
    if (!is_scrolling_2) {
        event.wheelDelta < 0 || event.detail > 0 ? self.bottom() : self.top();
        is_scrolling_2 = true;
        setTimeout(function () {
            is_scrolling_2 = false;
        }, 250);
    }
};

var add_event_listeners = function add_event_listeners() {
    setTimeout(function () {

        self.content_scroller_main_container.addEventListener('DOMMouseScroll', scroll_handler, false);
        self.content_scroller_main_container.addEventListener('mousewheel', scroll_handler, false);
    }, 100);
};

var remove_event_listeners = function remove_event_listeners() {
    self.content_scroller_main_container.removeEventListener('mousewheel', scroll_handler, false);
    self.content_scroller_main_container.removeEventListener('mousewheel', scroll_handler, true);
    self.content_scroller_main_container.removeEventListener('DOMMouseScroll', scroll_handler, false);
    self.content_scroller_main_container.removeEventListener('DOMMouseScroll', scroll_handler, true);
};
self.update_me = function (list) {
    self.content_list = list;
    self.list_length = self.content_list ? self.content_list.length : 0;
    self.update();
    setTimeout(function () {
        list.forEach(function (item, index) {
            self['content' + index].style.minHeight = self.scroller_content_container.clientHeight + 'px';
        });
        self.content_index = 0;
        self.start_top = 0;
        self.scroller_content_container_inner.style.top = 0;
    }, 0);
};
self.on('mount', function () {
    add_event_listeners();
});
});