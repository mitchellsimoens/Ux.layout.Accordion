Ext.define('Ux.layout.Accordion', {
    extend : 'Ext.layout.Default',
    alias  : 'layout.accordion',

    requires : [
        'Ext.TitleBar'
    ],

    itemCls              : Ext.baseCSSPrefix + 'layout-accordion-item',
    itemAnimCls          : Ext.baseCSSPrefix + 'layout-accordion-item-anim',
    itemArrowCls         : Ext.baseCSSPrefix + 'accordion-arrow',
    itemArrowExpandedCls : Ext.baseCSSPrefix + 'accordion-arrow-expanded',

    config : {
        expandedItem     : null,
        mode             : 'SINGLE',
        toggleOnTitlebar : false,
        defaultCollapsed : false,
        header           : null
    },

    setContainer: function (container) {
        this.callParent(arguments);

        if (this.getMode() === 'SINGLE') {
            container.on('show', 'checkMode', this, { single : true });
        }

        // Fixed a problem when the first item has 0 height initially causing a "bounce"
        container.on('show', 'finalStage', this, { single : true});
    },

    // @private
    finalStage: function (container) {
        var items = container.getInnerItems();

        // Fix item height
        if (items.length > 0) {
            items[0].setHeight(items[0].element.getHeight());
        }

        Ext.defer(this.postProcess, 1000, this, [container]);
    },

    // @private
    postProcess: function (container) {
        var me = this,
            items = container.getInnerItems(),
            containerHeight = container.element.getHeight();

        items.forEach(function (item) {
            // Tricky: defer the animation so that animation does not apply to initial
            // layout which has caused slow down in screen refresh initially when the
            // number of inner items is more than 3
            item.addCls(me.itemAnimCls);

            // Limit the height of the inner item to the height of the container to avoid
            // problems of losing the header when on a phone
            if (item.fullHeight > containerHeight) {
                item.innerElement.setHeight(containerHeight);
                item.fullHeight = containerHeight;
            }
        });
    },

    // @private
    checkMode: function (container) {
        var items = container.getInnerItems();

        // Make sure at least one item is expanded
        if (items.length > 0 && !this.getExpandedItem()) {
            this.expand(items[0]);
        }
    },

    insertInnerItem: function (item, index) {
        var me = this,
            titleDock,
            arrowBtn,
            header,
            expandedItem;

        me.callParent([item, index]);

        if (!item.isInnerItem()) {
            return;
        }

        if (this.config.header) {
            header = this.config.header;
        } else {
            header = {
                xtype  : 'titlebar',
                docked : 'top',
                title  : me.container.items.items[index].config.title,
                items  : [
                    {
                        cls     : me.itemArrowCls,
                        ui      : 'plain',
                        align   : 'right',
                        scope   : me,
                        handler : 'handleToggleButton'
                    }
                ],
                listeners: {
                    tap: {
                        fn: function () {
                            if (me.getToggleOnTitlebar()) {
                                me.toggleCollapse(titleDock.up('component'));
                            }
                        },
                        element: 'element'
                    }
                }
            };
        }

        titleDock = item.titleDock = item.insert(0, header);

        arrowBtn  = item.arrowButton = titleDock.down('button[cls=' + me.itemArrowCls + ']');

        item.addCls(me.itemCls);
        arrowBtn.addCls(me.itemArrowExpandedCls);

        // Set the collapsed attribute from config, false by default if not set
        item.collapsed = me.container.items.items[index].config.collapsed;

        if (item.collapsed === undefined) {
            item.collapsed = this.getDefaultCollapsed();
        }

        if (item.collapsed) {
            item.on('painted', 'collapse', me, { single : true });
        } else if (me.getMode() === 'SINGLE') {
            expandedItem = me.getExpandedItem();
            me.setExpandedItem(item);
            if (expandedItem) {
                // In case the newly added item is done dynamically,
                // the expanded item would have been painted so we can
                // call the collapse method directly since the elements
                // would have sized correctly.
                if (expandedItem.isPainted()) {
                    me.collapse(expandedItem);
                } else {
                    expandedItem.on('painted', 'collapse', me, { single : true });
                }
            }
        }
    },

    handleToggleButton: function (btn) {
        if (!this.getToggleOnTitlebar()) {
            var component = btn.up('titlebar').up('component');

            this.toggleCollapse(component);
        }
    },

    toggleCollapse: function (component) {
        this[component.collapsed ? 'expand' : 'collapse'](component);
    },

    collapse: function (component) {
        if (!component.isComponent) {
            component = Ext.getCmp(component.getId());
        }
        if (component.isInnerItem() && !(this.getMode() === 'SINGLE' && this.getExpandedItem() === component)) {
            var titleDock   = component.titleDock,
                titleHeight = titleDock.element.getHeight();

            component.fullHeight = component.element.getHeight();
            component.setHeight(titleHeight);
            component.collapsed = true;
            component.arrowButton.removeCls(this.itemArrowExpandedCls);
            if (component.innerItems[0]) {
                component.innerItems[0].element.removeCls('x-unsized');
            }
        }
    },

    expand: function (component) {
        if (component.isInnerItem()) {
            var me = this,
                container = component.up(),
                expanded = this.getExpandedItem(),
                rmAnim = false;

            if (this.getMode() === 'SINGLE') {
                this.setExpandedItem(component);
                if (expanded) {
                    this.collapse(expanded);
                }
            }

            // Temporary remove animation of expanding item if scrolling is required as the two
            // animations will compete and cause awkward transitions
            if (container.element.getHeight() < component.element.getY() + component.fullHeight) {
                component.removeCls(me.itemAnimCls);
                rmAnim = true;
            }

            component.setHeight(component.fullHeight);
            component.collapsed = false;

            if (rmAnim) {
                component.addCls(me.itemAnimCls);
            }

            component.arrowButton.addCls(this.itemArrowExpandedCls);
            if (component.innerItems[0]) {
                component.innerItems[0].element.addCls('x-unsized');
            }

            // There was collapsing so it needs to wait until the collapsing animation is done before calculating heights
            // The delay must be > 300 (animation timing in CSS for collapsing)
            if (me.getMode() === 'SINGLE') {
                Ext.defer(function () {
                    if (container.element.getHeight() < component.element.getY() + component.fullHeight) {
                        container.getScrollable().getScroller().scrollBy(0, component.element.getY() + component.fullHeight - container.element.getHeight(), {duration: 300});
                    }
                }, 310);
            } else {
                if (container.element.getHeight() < component.element.getY() + component.fullHeight) {
                    // The scroller in the multiple mode requires some delay or it does not scroll due to animation
                    Ext.defer(function () {
                        container.getScrollable().getScroller().scrollBy(0, component.element.getY() + component.fullHeight - container.element.getHeight(), {duration: 300});
                    }, 380);
                }
            }
        }
    }
});
