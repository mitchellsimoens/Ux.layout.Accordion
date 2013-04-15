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
        toggleOnTitlebar : false
    },

    setContainer: function (container) {
        this.callParent(arguments);

        if (this.getMode() === 'SINGLE') {
            container.on('show', 'checkMode', this, { single : true });
        }

        // Fixed a problem when the first item has 0 height initially causing a "bounce"
        container.on('show', 'fixItemHeight', this, { single : true});
    },

    // @private
    fixItemHeight: function (container) {
        var items = container.getInnerItems();

        if (items.length > 0) {
            items[0].setHeight(items[0].element.getHeight());
        }
    },

    // @private
    checkMode: function (container) {
        var me = this,
            items = container.getInnerItems(),
            lastItem = null;

        items.forEach(function (item) {
            if (!item.collapsed) {
                if (lastItem) {
                    me.collapse(lastItem);
                }

                lastItem = item;
            }
        });

        // Make sure at least one item is expanded
        if (items.length > 0 && !lastItem) {
            me.expand(items[0]);
        }
    },

    insertInnerItem: function (item, index) {
        var me = this,
            titleDock,
            arrowBtn;

        me.callParent([item, index]);

        if (!item.isInnerItem()) {
            return;
        }

        titleDock = item.titleDock = item.insert(0, {
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
        });

        arrowBtn  = item.arrowButton = titleDock.down('button[cls=' + me.itemArrowCls + ']');

        item.addCls(me.itemCls);
        arrowBtn.addCls(me.itemArrowExpandedCls);

        item.on('painted', function () {
            item.addCls(me.itemAnimCls);
        }, me, { single : true });

        // Set the collapsed attribute from config, false by default if not set
        item.collapsed = me.container.items.items[index].config.collapsed;

        if (item.collapsed === undefined) {
            item.collapsed = false;
        }

        if (item.collapsed) {
            item.on('painted', 'collapse', me, { single : true });
        } else if (me.getMode() === 'SINGLE') {
            if (!me.getExpandedItem()) {
                me.setExpandedItem(item);
            } else {
                // Collapse the rest of panes
                item.on('painted', 'collapse', me, { single : true });
            }
        }
    },

    handleToggleButton: function (btn) {
        var component = btn.up('titlebar').up('component');

        this.toggleCollapse(component);
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
            if (this.getMode() === 'SINGLE') {
                var expanded = this.getExpandedItem();

                this.setExpandedItem(component);
                if (expanded) {
                    this.collapse(expanded);
                }
            }

            component.setHeight(component.fullHeight);
            component.collapsed = false;
            component.arrowButton.addCls(this.itemArrowExpandedCls);
            if (component.innerItems[0]) {
                component.innerItems[0].element.addCls('x-unsized');
            }
        }
    }
});
