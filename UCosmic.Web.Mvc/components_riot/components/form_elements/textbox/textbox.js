riot.tag('textbox', '<div> <label id="label" for="input" class="pre_scale_bottom_center {fade_in: is_shown} {fade_out: !is_shown} {slide_top_bottom: !is_shown}">{opts.place_holder}</label> <br> <input type="{opts.type}" pattern="{opts.pattern}" placeholder="{opts.place_holder}" name="{opts.name}" onkeyup="{show_label}" id="input" autocomplete="on" maxlength="{opts.max_length}" value="{opts.input_value}" riot-style="width: {opts.width}; height: {opts.height}"> <br> <span class="validation_message" show="{validation_message}" riot-style="width: {opts.width}; height: {opts.height}"><span>{validation_message}</span></span> </div>', 'textbox label{ padding: 4px; } textbox input{ border-width: 0 0 1px 0; border-color: #948174; padding: 4px; margin-bottom:10px; } textbox input:hover { background: #FFFFC1; border-width: 0 0 1px 0; border-color: #948174; } textbox input:focus { background: #FFFF88; border-width: 0 0 1px 0; border-color: #948174; outline: 0; } textbox input:focus:hover { background: #FFFF88; border-width: 0 0 1px 0; border-color: #948174; outline: 0; } textbox .validation_message{ position: absolute; height: 0; overflow-y:visible; color: red; } textbox .validation_message span{ position: relative; top: -10px; }', function(opts) {
        var self = this;
        self.is_shown = false;
        self.validation_message = '';
        self.on('mount', function(){
            if(!self.opts.pattern){
                self.input.removeAttribute("pattern");
            }
            if(self.opts.required){
                self.input.setAttribute("required", '');
            }
            if(self.opts.input_value){
                self.show_label();
            }
        })
        self.show_label = function(){
            if(self.input.value){
                self.is_shown = true;
            }else{
                self.is_shown = false;
            }
            self.update();
            return true;
        }

        self.check_pwd = function (value) {
            if (value.length == 0) {
                return  "Password required";
            } else if (value.length < 6) {
                return  "Too short";
            } else if (value.length > 20) {

                return "Too long";






            } else if (value.search(/[^a-zA-Z0-9\!\@\#\$\%\^\&\*\(\)\_\+\.\,\;\:]/) != -1) {
                return ("Character not allowed");
            }
            return ("");
        }
        self.validate = function(){
            if(self.input.validationMessage){
                self.validation_message = 'Please correct ' + self.opts.place_holder + '.';
                var validation_message = self.input.validationMessage;
                self.update();
                return validation_message;
            }else if(self.opts.type == 'password' && self.check_pwd(self.input.value)){
                self.validation_message = 'Please correct ' + self.opts.place_holder + '.';
                var validation_message = self.check_pwd(self.input.value);
                self.update();
                return validation_message;
            }else {
                self.validation_message = '';
                self.update();
                return '';
            }
        }
    
});