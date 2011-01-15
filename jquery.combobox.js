/*
*  ComboBox plugin for jQuery v0.1
*
*  Convert a text-box into a combo box by adding a drop-down selection list.
*
*  Copyright (c) 2011 Ricky Supit
*  Licensed under the MIT licence:
*    http://www.opensource.org/licenses/mit-license.php
*
*  Depends:
*    jquery.ui.core.js
*    jquery.ui.widget.js
*
*  <code>
*    $("#my-input-id").combobox({ options: ["apple","orange","banana","mangoesteen"] });
*  </code>
*/

(function($) {

$.widget("mgs.combobox", {

	options: {
		options:[],
		delay: 800,
		animation: {
			params: { opacity: 'show' },
			speed: 'normal'
		},
	},
		
	_create: function(){
        this.element.addClass("combobox ui-widget ui-state-default ui-corner-all");
		this.dropdown = $("<div class='combobox-dropdown ui-widget ui-widget-content ui-corner-all'/>")
                            .hide()
							.append(this._selectBoxHtml())
							.insertAfter(this.element);
								
		this._setDimension();
			
		this._wireEvents();
	},
		
	destroy: function() {
        this.dropdown.remove();
        this.element
                .removeClass("combobox ui-widget ui-state-default ui-corner-all")
                .unbind("focus.mgs blur.mgs");
        $(document).unbind("click.mgs");

        $.Widget.prototype.destroy.call( this );
	},

	select: function(value) {
		var inp = this.element;
		if(inp.val() != value) {
			inp.val(value);
			this._trigger("change.mgs", null, value);
		}
	},

    show: function() {
        this._setPosition();

        var self = this, 
            dd = this.dropdown;

        dd.animate( this.options.animation.params, 
                    this.options.animation.speed, 
                    function() { self._tryHighlightItem(); } );

        var inp = this.element;
        inp.addClass("ui-state-active");
        if(inp.get(0) != document.activeElement)
            inp.trigger("focus");
    },

    hide: function() {
        this.dropdown.slideUp('fast')
            .find(">ul >li")
            .removeClass("ui-state-active ui-state-hover");

        this.element.removeClass("ui-state-active").trigger('blur');
    },

    _setPosition: function() {
        var dd = this.dropdown, inp = this.element;
        var pos = inp.position();

        //make sure not outside view port
        var viewWidth = (window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth) + $(document).scrollLeft();
        var viewHeight = (window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight) + $(document).scrollTop();
        var ddh = dd.outerHeight();

        var outport = (pos.top + inp.outerHeight() + ddh > viewHeight && viewHeight > ddh);

        pos.top += outport ? -ddh : inp.outerHeight();

        dd.css({ position:'absolute', top: pos.top, left: pos.left });
    },

	_selectBoxHtml: function() {
		var html = ["<ul class='combobox-dropdown-list ui-helper-reset'>"];
		var data = this.options.options;
		var isStr = data && data.length > 0 && typeof data[0] === "string";
			
		$.each(data, function(i, item) {
            var val = isStr ? item : item.value || item;
            var text = isStr ? item : item.text || item;
            html.push( "<li class='combobox-dropdown-item ui-state-default ui-corner-all' data-value='", 
                        val, 
                        "'>", 
                        text , 
                        "</li>" );
        });
        html.push("</ul>")

        return html.join("");
	},
		
	_setDimension: function() {
			
		var css = {	width: parseInt(this.options.width || this.element.outerWidth(), 10) };
			
		this.dropdown.css(css);
	},
		
	_wireEvents: function() {
		var dd = this.dropdown;
		var self = this;
		
        this.element
            .bind("focus.mgs", function(e) {
                $(this).addClass("ui-state-focus")
                self.show();
            })
            .bind("blur.mgs", function(e) { 
                $(this).removeClass("ui-state-focus")
            });	

		dd.delegate("li.combobox-dropdown-item", "mouseenter.mgs", function(e) {
			$(this).addClass("ui-state-hover").siblings().removeClass("ui-state-hover");
		});

		dd.delegate("ul.combobox-dropdown-list", "click.mgs", function(e) {
			if($(e.target).is('li.combobox-dropdown-item')) {
				self._selectItem( $(e.target) );
                self.hide();
			}
		});
            
        $(document).bind("click.mgs", function(e) {
            var el = $(e.target);
            if(el.attr("class").search(/combobox/i) === -1) {
                self.hide();
            }
        });			
	},
		
	_selectItem: function( li ) {
		var data = { value: li.attr("data-value"), text: li.text()};

		this._trigger("itemselect", null, data);
			
		this.select(data.value);
	},

    _tryHighlightItem: function() {
        var key = this.element.val();
        var selectItem = this.dropdown.find(">ul >li[data-value='" + key + "']");

        if(selectItem.length > 0) {
            selectItem.addClass("ui-state-hover ui-state-active")
                .siblings().removeClass("ui-state-hover ui-state-active");
        }
    },
		
	_setOption: function(key, value) {
		this.options[key] = value;
			
		switch (key) {
			case "options":
				this.dropdown.html(this._selectBoxHtml());
				break;
		}			
	}
		
});

})(jQuery);
