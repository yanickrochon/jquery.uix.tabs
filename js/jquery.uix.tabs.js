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

(function ($, undefined) {

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

        _create: function () {
            this._super();

            // Take closeable/pinnable tabs via class attribute from HTML
            // into account and update option properly.
            if ($.isArray(this.options.closeable))
                this.options.closeable = $.unique(options.closeable).sort();
            if ($.isArray(this.options.pinnable))
                this.options.pinnable = $.unique(options.pinnable).sort();
        },

        _processTabs: function () {
            this._super();

            this._setupTabOptions();

            if (this.options.showMore) {
                this.tablist.addClass("uix-tabs-nav");

                if (!this.tabsMore)
                    this._createTabsMore();

                this.tabs.each($.proxy(function (i, tab) {
                    var $tab = $(tab),
                        icon = $tab.data("tab-icon");

                    if (icon) {
                        var prev = $tab.children().length < 2 ? $tab.children(":first") : $tab.children(":eq(-1)");
                        $tab.children("a.ui-tabs-anchor")
                            .children("span.ui-icon[role='presentation']").remove().end()
                            .addClass("uix-anchor-icon")
                            .prepend($("<span role='presentation'></span>")
                                .addClass("ui-icon ui-icon-" + icon)
                            );
                    }
                }, this));
            }
        },

        _refresh: function () {
            this._super();

            this._setupTabOptions();

            if (this.options.showMore)
                this._updateVisibleTabs();
        },


        closeable: function( tab, flag ) {
            this._setupTabOption("closeable", tab, flag);
        },

        pinnable: function( tab, flag ) {
            this._setupTabOption("pinnable", tab, flag);
        },

        _setupTabOption: function (tabOption, tab, flag) {
            if (!(tab instanceof jQuery)) {
                if (typeof index === "string")
                    tab = this.tabs.filter("a#{0}".format(tab));
                else
                    tab = $(this.tabs.get(tab));
            }

            tabOption = tabOption.toLowerCase();
            var setupMethod = "_setup" + tabOption.substr(0, 1).toUpperCase() + tabOption.substr(1);

            if (tab.length) {
                this[setupMethod](tab, this._getPanelForTab(tab[0]), flag);
                var optIndex = $.inArray(tab.uniqueId().prop("id"), this.options[tabOption]);
                if (optIndex == -1 && flag) {
                    this.options[tabOption] = $.unique((this.options[tabOption] || []).concat(tab.prop("id")));
                } else if (optIndex != -1 && !flag) {
                    this.options[tabOption].splice(optIndex, 1);
                }
            }
        },
        
        _setupTabOptions: function () {
            $.each(["Closeable", "Pinnable"], $.proxy(function (i, method) {
                var option = method.toLowerCase();
                if (this.options[option]) {
                    $.each(this.options[option], $.proxy(function (i, id) {
                        var tab = typeof id == "string" ?
                            this.tabs.filter("#" + id) :
                            this.tabs.eq(id);
                        if (tab.length) {
                            this["_setup" + method](tab, this._getPanelForTab(tab[0]), true);
                        }
                    }, this));
                }
            }, this));
        },

        _createTabsMore: function () {
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
                    select: function (evt, ui) {
                        ui.item.trigger(NAV_TAB_ACTIVATE);
                    }
                })
                .popup({
                    trigger: this.tabsMore,
                    position: {
                        my: "right top",
                        at: "right bottom"
                    },
                    open: $.proxy(function () {
                        this.tabsMore.addClass("ui-state-focus")
                            .button("option", "icons", {
                                primary: this.options.showMoreIcons.opened
                            });
                        this.tabsMorePopup.scrollTop(1);  // make sure scroll is set
                    }, this),
                    close: $.proxy(function () {
                        this.tabsMore.removeClass("ui-state-focus")
                            .button("option", "icons", {
                                primary: this.options.showMoreIcons.closed
                            });
                    }, this)
                });

            this._on(this.tabsMorePopup, { keydown: "_popupKeydown" });
        },

        _popupKeydown: function (event) {
            if (this._handlePageNav(event)) {
                return;
            }

            switch (event.keyCode) {
                case $.ui.keyCode.RIGHT:
                    var tab = this.tabs.filter(":visible:first");
                    this._activate(tab.index());
                    tab.focus();
                    return false;
                case $.ui.keyCode.LEFT:
                    var tab = this.tabs.filter(":visible:last");
                    this._activate(tab.index());
                    tab.focus();
                    return false;
                default:
                    return;
            }
        },

        _setupCloseable: function (tab, panel, flag) {
            var _controls = tab.children("span.ui-icon-close[role='presentation']");
            if (flag) {
                if (!_controls.length) {
                    tab.append($("<span class='ui-icon ui-icon-close' role='presentation'></span>")
                        .text("Remove tab")  /* TODO : i18n */
                        .css({ 'float': "left", 'margin': "0.4em 0.2em 0 0", 'cursor': "pointer" })
                        .bind("click", $.proxy(function (evt) {
                            this._getPopupItem(tab).remove();
                            tab.remove();
                            panel.remove();
                            this.refresh();

                            evt.stopPropagation();
                            return false;
                        }, this))
                    );
                }
            } else {
                _controls.remove();

                var index = $.inArray(tab.uniqueId().prop("id"), this.options.closeable);
                if (index != -1)
                    this.options.closeable.splice(index, 1);
            }
        },

        _setupPinnable: function (tab, panel, flag) {
            var _controls = tab.children("span.ui-icon-pin-w[role='presentation'], span.ui-icon-pin-s[role='presentation']");
            if (flag) {
                if (!_controls.length) {
                    tab.data("tab-pinned", !!tab.data("tab-pinned"));
                    $("<span role='presentation'></span>")
                        .text("Pin")   /* TODO : i18n */
                        .addClass("ui-icon ui-icon-pin-" + (tab.data("tab-pinned") ? "s" : "w"))
                        .attr('unselectable', "on")
                        .css({ 'user-select': "none", 'float': "left", 'margin': "0.4em 0.2em 0 0", 'cursor': "pointer" })
                        .on('selectstart', false)
                        .bind("click", $.proxy(function (evt) {
                            var pin = $(evt.target)
                            var pinned = !tab.data("tab-pinned");
                            if (pinned)
                                pin.removeClass("ui-icon-pin-w").addClass("ui-icon-pin-s");
                            else
                                pin.removeClass("ui-icon-pin-s").addClass("ui-icon-pin-w");

                            tab.data("tab-pinned", pinned);
                            evt.stopPropagation();
                            return false;
                        }, this))
                        .insertAfter(tab.children("a.ui-tabs-anchor"));
                }
            } else {
                _controls.remove();
                var index = $.inArray(tab.uniqueId().prop("id"), this.options.pinnable);
                if (index != -1)
                    this.options.pinnable.splice(index, 1);
            }
        },

        _getPopupItem: function (tab) {
            if (!tab.data("tab-more-item")) {
                tab.data("tab-more-item", $("<li></li>").append($("<a></a>").prop("href", "#").text(tab.find("a.ui-tabs-anchor").text()))
                    .bind(NAV_TAB_ACTIVATE, $.proxy(function () {
                        var index = $(tab).index();
                        this._activate(index, true);
                        this._updateVisibleTabs();
                        if (this.tabsMorePopup.data("ui-popup").isOpen) {
                            this.tabsMorePopup.popup("close");
                        }
                        tab.focus();
                    }, this))
                );
            }
            return tab.data("tab-more-item")
        },

        // TODO : pinned tabs don't have the intended priority.... must know why
        _updateVisibleTabs: function () {
            this.tabsOverflow = false;

            var maxWidth = this.tablist.width() - (this.tabsMore ? this.tabsMore.outerWidth() : 0) - 16;
            var curWidth = 0;

            this.tabs.attr("aria-visible", true).show();  // all visible by default
            this.tabsMorePopup.children("li").detach();
            this.tabs.each(function (i, tab) { curWidth += $(tab).outerWidth(); });

            var selectors = [
                ":visible:not(.ui-state-active,[data-tab-pinned='true']):last",  // primary
                ":visible:not(.ui-state-active):last"                            // secondary
            ];
            $.each(selectors, $.proxy(function (i, selector) {
                var tab = this.tabs.filter(selector);
                while (curWidth > maxWidth) {
                    if (!tab.length || (tab[0] == this.tabs[0])) break;

                    this.tabsOverflow = true;
                    curWidth -= tab.outerWidth();
                    this.tabsMorePopup.prepend(this._getPopupItem(tab.hide()));
                    tab = tab.siblings(selector);
                }
            }, this));

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

        _findNextTab: function (index, goingForward) {
            if (!this.tabsOverflow)
                return this._super(index, goingForward);

            for (var found = false, count = this.tabs.length; !found && count > 0; --count) {
                index = this._super(index, goingForward);
                if (count-- < 1) {
                    index = -1;
                    found = true;
                }
                if (this._findActive(index).is(":visible")) {
                    found = true;
                } else {
                    index = goingForward ? index + 1 : index - 1;
                }
            }

            return index;
        },

        _activate: function (index, ensureVisible) {
            var anchor,
                active = this._findActive(index);

            if ((active.length && active.is(":visible")) || ensureVisible) {
                this._super(index);
            } else {
                this.tabsMorePopup.popup("open").popup("focusPopup");
            }
        },

        _setupDisabled: function (disabled) {
            this._super(disabled);

            if (this.tabsMore) {
                this.tabsMore.button(this.options.disabled ? "disable" : "enable");
                if (this.tabsMorePopup.data("ui-popup").isOpen) {
                    this.tabsMorePopup.popup("close");
                }
            }
        },

        _destroy: function () {
            if (this.options.showMore) {
                this.tabsMore.button("destroy").remove();
                this.tabsMorePopup.popup("destroy").menu("destroy").remove();
            }

            this._super();
        }

    });


})(jQuery);
