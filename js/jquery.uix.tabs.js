/*
 * jQuery UIx Tabs
 *
 * Authors:
 *  Yanick Rochon (yanick.rochon[at]gmail[dot]com)
 *
 * Licensed under the MIT (MIT-LICENSE.txt) license.
 *
 * http://mind2soft.com/labs/jquery/tabs/
 *
 *
 * Depends:
 * jQuery UI 1.9+
 *
 */

(function( $, undefined ) {

var EVENT_NAMESPACE = ".uix-tabs";
var NAV_TAB_ACTIVATE = "navTabActivate" + EVENT_NAMESPACE;


$.widget("uix.tabs", $.ui.tabs, {
    options: {
        showMore: false,           // enable or not the "show more" feature (default is false for ui.tabs behaviour)
        showMoreText: "Show more", // the text in the "show more" button
        showMoreIcons: {           // the icons to display when opening the "show more" popup
            opened: "ui-icon-triangle-1-s",
            closed: "ui-icon-triangle-1-e"
        },
        showMoreMaxHeight: null    // define the max height of the "show more" popup container (default null for "inherit"))
    },

    _create: function() {
        this._super();

        if (this.options.showMore) {
            this.tablist.addClass("uix-tabs-nav");
            this._createTabsMore();
            this._processTabs();
        }
    },

    _createTabsMore: function() {
        this.tabsMore = $("<button></button>").text(this.options.showMoreText)
            .addClass("uix-tabs-more")
            .button({
                icons: {
                    primary: this.options.showMoreIcons.closed
                },
                text: false
            })
            .hide()
            .appendTo(this.tablist);

        this.tabsMorePopup = $("<ul></ul>")
            .addClass("uix-tabs-more-popup")
            .appendTo(this.element)
            .menu({
                select: function(evt, ui) {
                    ui.item.trigger(NAV_TAB_ACTIVATE);
                }
            })
            .popup({
                trigger: this.tabsMore,
		        position: {
			        my: "right top",
			        at: "left bottom"
		        },
                open: $.proxy(function() {
                    this.tabsMore.addClass("ui-state-focus")
                        .button("option", "icons", {
                            primary: this.options.showMoreIcons.opened
                        });
                    this.tabsMorePopup.scrollTop(1);  // make sure scroll is set
                }, this),
                close: $.proxy(function() {
                    this.tabsMore.removeClass("ui-state-focus")
                        .button("option", "icons", {
                            primary: this.options.showMoreIcons.closed
                        });
                }, this)
            });
    },
	
	_setupTabOptions: function( tab, panel ) {
		$.each((tab.data("tab-options") || "").split(","), $.proxy(function(i, option) {
			if ( $.uix.tabs.SetupOptions[option] ) {
				$.uix.tabs.SetupOptions[option].call(this, tab, panel);
			}
		}, this));
	},

    _getPopupItem: function( tab ) {
        if (!tab.data("tab-more-item")) {
            tab.data("tab-more-item", $("<li></li>").append( $("<a></a>").prop("href", "#").text( tab.text() ) )
                .bind(NAV_TAB_ACTIVATE, $.proxy(function() {
					var index = $(tab).index();
					this._ensureVisible(index, this.active.index() > index);
					//console.log(this.active.index() + " = " + (this.active.index() < index));
                    this._activate(index);
                    if (this.tabsMorePopup.data("ui-popup").isOpen) {
                        this.tabsMorePopup.popup("close");
                    }
                    tab.focus();
                }, this))
			);
        }
		return tab.data("tab-more-item")
    },

    _processTabs: function() {
        this._super();

        if (this.tabsMore) {
			//this.tabsMorePopup.children().detach();  // TODO: add _refresh method to check for removed tabs
			
            this.tabs.each($.proxy(function(i, tab) {
				var $tab = $(tab);
				
                this.tabsMorePopup.append( this._getPopupItem($tab) );
				
				this._setupTabOptions($tab, this._getPanelForTab($tab));
            }, this));

	        this.tablist.height(this.tabs.first().outerHeight());

			if ( this.active.length ) {
				this._ensureVisible( this.active.index(), true );
			}
        }
    },
	
	_refresh: function() {
		this._super();
		
		if (this.tabsMore && this.active.length)
			this._ensureVisible( this.active.index() );
	},

    _ensureVisible: function( index, goingForward ) {
		this.tabsOverflow = false;

        var maxWidth = this.tablist.width() - (this.tabsMore ? this.tabsMore.outerWidth() : 0) - 8;
	
		var curWidth = 0;
		this.tabs.each(function(i, tab) { curWidth += $(tab).outerWidth(); })
		
		this.tabs.attr("aria-visible", true).show();  // all visible by default
		this.tabsMorePopup.children("li").attr("aria-visible", false).hide();
		
		var _checkTab = $.proxy(function(i, tab) {
			var tabWidth = $(tab).outerWidth();
			curWidth -= tabWidth;
			$(tab).attr("aria-visible", false).hide();
			this._getPopupItem($(tab)).attr("aria-visible", true).show();

			return curWidth > maxWidth;
		}, this);
		
		// if going forward, start by removing after index
		var tabsBefore = this.tabs.filter(":lt(" + index + ")").get();
		var tabsAfter = this.tabs.filter(":gt(" + index + ")").get().reverse();
		var tabsToCheck = tabsBefore.concat(tabsAfter);
		
		if ((curWidth > maxWidth) && goingForward) {
			this.tabsOverflow = true;
			$.each(tabsAfter, _checkTab);
		}
		if (curWidth > maxWidth) {
			this.tabsOverflow = true;
			$.each(tabsToCheck, _checkTab);
		}

		if (this.tabsOverflow) {
			
            this.tabsMorePopup.menu("refresh");
            this.tabsMore.show();

            if (this.options.showMoreMaxHeight) {
                if (this.tabsMorePopup.outerHeight() > this.options.showMoreMaxHeight) {
                    this.tabsMorePopup.height(this.options.showMoreMaxHeight).css("overflowY", "scroll");
                } else {
                    this.tabsMorePopup.height("auto").css("overflowY", "");
                }
            }
        }
    },

    _focusNextTab: function( index, goingForward ) {
        index = this._findNextTab( index, goingForward );

        var tab = this.tabs.eq( index );

        if (!tab.is(":visible") && this.tabsOverflow) {
            this._ensureVisible( index, goingForward );
        }
        tab.focus();

		return index;
	},

    _setupDisabled: function( disabled ) {
        this._super(disabled);

        if (this.tabsMore) {
            this.tabsMore.button( this.options.disabled ? "disable" : "enable" );
            if (this.tabsMorePopup.data("ui-popup").isOpen) {
                this.tabsMorePopup.popup("close");
            }
        }
    },

    _destroy: function() {
        if (this.options.showMore) {
            this.tabsMore.button("destroy").remove();
            this.tabsMorePopup.popup("destroy").menu("destroy").remove();
         }

        this._super();
    }


});


$.uix.tabs.SetupOptions = {
	closeable: function( tab, panel ) {
		if (tab.find(".ui-icon-close[role=\"presentation\"]").length) return;
		tab.append( $("<span class='ui-icon ui-icon-close' role='presentation'>Remove Tab</span>") 
			.css({ 'float': "left", 'margin': "0.4em 0.2em 0 0", 'cursor': "pointer" })
			.bind("click", $.proxy(function() {
				this._getPopupItem(tab).remove();
				tab.remove();
				panel.remove();
				this.refresh();
			}, this))
		);
	}
};


})(jQuery);