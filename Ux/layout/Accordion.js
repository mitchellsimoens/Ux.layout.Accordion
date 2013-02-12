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

    constructor: function(container) {
        this.callParent(arguments);

        if (this.getMode() === 'SINGLE') {
            container.on('show', 'checkMode', this, { single : true });
        }
    },

    checkMode: function(container) {
        var items = container.getInnerItems(),
            i     = 0,
            iNum  = items.length,
            item, lastItem;

        for (; i < iNum; i++) {
            item = items[i];

            if (!item.collapsed) {
                if (lastItem) {
                    this.collapse(lastItem);
                }

                lastItem = item;
            }
        }
    },

    insertInnerItem: function(item, index) {
        var me = this;

        me.callParent([item, index]);

        if (item.isInnerItem()) {
            var titleDock = item.titleDock = item.insert(0, {
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
                        fn: function(event, el) {
                          if (me.getToggleOnTitlebar()) {
                            me.toggleCollapse(titleDock.up('component'));
                          }
                        },
                        element: 'element'
                      }
                    }
                }),
                arrowBtn  = item.arrowButton = titleDock.down('button[cls=' + me.itemArrowCls + ']');

            item.addCls(me.itemCls);
            arrowBtn.addCls(me.itemArrowExpandedCls);

            item.on('painted', function() {
                item.addCls(me.itemAnimCls);
            }, me, { single : true });

            if (item.collapsed) {
                item.on('painted', 'collapse', me, { single : true });
            } else if (me.getMode() === 'SINGLE') {
                me.setExpandedItem(item);
            }
        }
    },

    handleToggleButton: function(btn) {
        var component = btn.up('titlebar').up('component');

        this.toggleCollapse(component);
    },

    toggleCollapse: function(component) {
        this[component.collapsed ? 'expand' : 'collapse'](component);
    },

    collapse: function(component) {
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

    expand: function(component) {
        if (component.isInnerItem()) {
            if (this.getMode() === 'SINGLE') {
                var expanded = this.getExpandedItem();

                this.setExpandedItem(component);
                this.collapse(expanded);
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
