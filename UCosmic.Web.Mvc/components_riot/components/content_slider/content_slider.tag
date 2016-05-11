<content_slider>
    <style scoped>
        img{
            margin: 0;
        }
        .content_list_icon{
            cursor: pointer;
            position: relative;
            width: 3em; height: 8em;
        }
        /*.content_list_icon.left{*/
            /*!*right: .8em;*!*/
            /*!*width:1.5em;*!*/
            /*overflow: visible;*/
        /*}*/
        /*.content_list_icon.right{*/
            /*!*right: .8em;*!*/
            /*!*width:1.5em;*!*/
            /*overflow: visible;*/
        /*}*/
        #slider_content_container{
            overflow: hidden;
            /*white-space: nowrap;*/
            margin: 0;
            padding:0;
        }
        #slider_content_container_inner{
            display: inline-flex;
            position: relative;
            margin: 0;
            padding:0;
            /*overflow: hidden;*/
        }
        .slider_content{
            display: inline-block;
            margin: 0;
            /*padding:10px;*/
        }
        
        #content_div{
            display: inline-block;
            width: 100%;
            max-width: 800px;
        }

        @media (max-width: 500px) {
            img{
                width: 100%;
            }
        }
    </style>

    <div id="content_slider_main_container" class="layout horizontal center center-justified " show="{content_list && content_list.length > 0}"
         riot-style="max-width: {opts.max_width}; width: {opts.width}; height: {opts.height}; max-height: {opts.height};">
        <div onclick="{left}" class="content_list_icon left" show="{content_list.length > 1}">
            <svg viewBox="0 0 24 24" preserveAspectRatio="none" style="pointer-events: none; display: inline-block; width: 3em; height: 8em; ">
                <g>
                    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z">
                    </path>
                </g>
            </svg>
        </div>
        <div id="slider_content_container" class="flex">
            <div id="slider_content_container_inner" class="layout horizontal">
                <div  each="{ content, i in content_list }" class="slider_content " id="content{i}">
                    <echo_html class=" " content="{content}"></echo_html>
                </div>
            </div>
        </div>
        <div onclick="{right}" class="content_list_icon right" show="{content_list.length > 1}" >
            <svg viewBox="0 0 24 24" preserveAspectRatio="none" style="pointer-events: none; display: inline-block; width: 3em; height: 8em; ">
                <g>
                    <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z">
                    </path>
                </g>
            </svg>
        </div>
    </div>
    <script type="es6">
        "use strict";
        let self = this
        self.content_index = 0;
        let last_scroll_position = 1
                , is_scrolling = false;
        self.on('mount', function() {
        })
        self.start_left = 0;
        //I need to get the page width or the widht I am going to use here, and pass it back into the function
        const animate = (time, start_time, element, start_left, is_right, width) => {
            const start_left2 = start_left;
            const width2 = width;
            if(is_right){
                snabbt(element, {
                    position: [start_left - width, 0, 0],
                    easing: 'easeOut'
                    , duration: 250
                })
                // setTimeout(() => {
                //     alert(start_left2 - width2)
                //     alert(element.style.transform)
                //     element.style.left = start_left2 - width2 + 'px';
                //     is_scrolling = false;
                // }, 1400);
                // const new_left = start_left + (-1 * (((time/start_time) < 1) ? (time/start_time) * width : width));
                // element.style.left = new_left  + 'px'
                // if((time/start_time) < 1){
                //     setTimeout(() => {
                //         animate(time+10, start_time, element, start_left, is_right, width);
                //     }, 2)
                // }
                // else{
                //     is_scrolling = false;
                // }
            }else{
                snabbt(element, {
                    position: [start_left + width, 0, 0],
                    easing: 'easeOut'
                    , duration: 250
                })
                // setTimeout(() => {
                //     alert(element.style.transform)
                //     alert(start_left2 + width2)
                //     element.style.left = start_left2 + width2 + 'px';
                //     is_scrolling = false;
                // }, 1400);
                // const new_left = start_left + (((time/start_time) < 1) ? (time/start_time) * width : width);
                // element.style.left = new_left  + 'px'
                // if((time/start_time) < 1){
                //     setTimeout(() => {
                //         animate(time+10, start_time, element, start_left, is_right, width);
                //     }, 2)
                // }
                // else{
                //     is_scrolling = false;
                // }
            }
            setTimeout(() => {
                element.style.webkitTransform = element.style.transform;
                is_scrolling = false;
                self.update();
            }, 300)
        }

        self.left = () => {

            const prev_content_index = self.content_index;
            self.content_index != 0 ? self.content_index -= 1 : self.content_index = self.list_length - 1;
            self.start_left = -1 * (self.content_index+1) * self.slider_content_container.clientWidth;
            animate(0, self.opts.time_out, self.slider_content_container_inner, self.start_left, false, self.slider_content_container.clientWidth)
        }
        self.right = () => {
            const prev_content_index = self.content_index;
            self.content_index != self.list_length - 1 ? self.content_index += 1 : self.content_index = 0;
            self.start_left = -1 * (self.content_index-1) * self.slider_content_container.clientWidth;
            animate(0, self.opts.time_out, self.slider_content_container_inner, self.start_left, true, self.slider_content_container.clientWidth)
        }
        var touch_start_scroll_handler = function (event) {
            last_scroll_position = event.targetTouches[0].clientX;
        }
        var touch_end_scroll_handler = function (event) {
            if ((last_scroll_position - event.changedTouches[0].clientX > 30 || last_scroll_position - event.changedTouches[0].clientX < -30) && !is_scrolling) {
                last_scroll_position = event.changedTouches[0].clientX < last_scroll_position ? -1 : 100000;
                is_scrolling = true;
                if (event.changedTouches[0].clientX < last_scroll_position) {
                    self.left();
                } else {
                    self.right();
                }
            }
        }
        var add_event_listeners = function(){
            setTimeout(function () {
                self.content_slider_main_container.addEventListener('touchstart', touch_start_scroll_handler, false)
                self.content_slider_main_container.addEventListener('touchend', touch_end_scroll_handler, false)
            }, 100);

        }

        var remove_event_listeners = function(){
            self.content_slider_main_container.removeEventListener('touchstart', touch_start_scroll_handler, false)
            self.content_slider_main_container.removeEventListener('touchend', touch_end_scroll_handler, false)
            self.content_slider_main_container.removeEventListener('touchstart', touch_start_scroll_handler, true)
            self.content_slider_main_container.removeEventListener('touchend', touch_end_scroll_handler, true)
        }
        self.update_me = (list) => {
            self.content_list = list;
            self.list_length = self.content_list ? self.content_list.length : 0;
            self.update()
            setTimeout(() => {
                list.forEach((item, index) => {
                    self['content'+index].style.minWidth = self.slider_content_container.clientWidth + 'px';
                    // self['content'+index].style.maxWidth = self.opts.max_width;
                })
                self.content_index = 0
                self.start_left = 0;
                self.slider_content_container_inner.style.left = 0;
            }, 0)
        }
        self.on('mount', () => {
            add_event_listeners();
        })
    </script>
</content_slider>