﻿//function SideSwiper(options) {
//    var self = this;
//    options = options || {};
//    var defaults = {
//        speed: '',
//        frameWidth: 710,
//        root: document
//    };
//    var settings = $.extend(defaults, options);

//    //var $root = $(settings.el || document);
//    //if (settings.$root.attr('data-side-swiper') !== 'root')
//    //    settings.$root = settings.$root.find('[data-side-swiper=root]:first');
//    //var $deck = $root.find('[data-side-swiper=deck]:first');

//    var currentFrameSelector = '[data-side-swiper=on]';
//    var otherFrameSelector = '[data-side-swiper=off]';

//    self.$root = function() {
//        var root = $(settings.root);
//        if (root.attr('data-side-swiper') !== 'root')
//            root = root.find('[data-side-swiper=root]:first');
//        return root;
//    };

//    self.next = function (distance, callback) {
//        var $deck = self.$root().find('[data-side-swiper=deck]:first'),
//            $currentFrame = $deck.children(currentFrameSelector),
//            $nextFrame = $currentFrame.next(otherFrameSelector);
//        distance = distance || 1;
//        for (var i = distance; i > 1; i--) {
//            $nextFrame.hide();
//            $nextFrame = $nextFrame.next(otherFrameSelector);
//        }

//        // display the next/right frame since its parent's overflow will obscure it
//        $nextFrame.css({ left: 0 });
//        $nextFrame.show();
//        $nextFrame.animate({ left: (settings.frameWidth * -1) }, settings.speed, function () {
//            $nextFrame.css({ left: 0 });
//        });

//        // reduce the left margin of the left frame to slide the right frame into view
//        $currentFrame.animate({ left: (settings.frameWidth * -1) }, settings.speed, function () {

//            // after the left frame has slid out of view, hide it
//            $currentFrame.hide()

//                // now that it's hidden, go ahead and put its margin back to zero
//                .css({ left: 0 })

//                // remove the css class since this is no longer the current frame
//                .attr('data-side-swiper', 'off')
//                .data('side-swiper', 'off');

//            // the left frame is now current
//            $nextFrame.attr('data-side-swiper', 'on')
//                .data('side-swiper', 'on');

//            // invoke callback if one was passed
//            if (typeof callback === 'function') callback();
//        });
//    };

//    self.prev = function (distance, callback) {
//        var $deck = self.$root().find('[data-side-swiper=deck]:first'),
//            $currentFrame = $deck.children(currentFrameSelector),
//            $prevFrame = $currentFrame.prev(otherFrameSelector);
//        distance = distance || 1;
//        for (var i = distance; i > 1; i--) {
//            $prevFrame.hide();
//            $prevFrame = $prevFrame.prev(otherFrameSelector);
//        }

//        $currentFrame.css({ position: 'absolute', left: 0 });
//        $currentFrame.animate({ left: settings.frameWidth }, settings.speed, function () {
//            $currentFrame.css({ position: 'relative' });
//        });

//        // reset the left frame to a negative left margin
//        $prevFrame.css({ left: (settings.frameWidth * -1) })

//            // show the left frame, since its parent's overflow will obscure it
//            .show()

//                // increase the left margin of the left frame to slide it into view (pushing right)
//                .animate({ left: 0 }, settings.speed, function () {

//                    // after the right frame  is slid out of view, hide it
//                    $currentFrame.hide()

//                        // remove the css class since this is no longer the current frame
//                        .attr('data-side-swiper', 'off')
//                        .data('side-swiper', 'off');

//                    // the right frame is now current
//                    $prevFrame.attr('data-side-swiper', 'on')
//                        .data('side-swiper', 'on');

//                    // invoke callback if one was passed
//                    if (typeof callback === 'function') callback();
//                });
//    };
//}
