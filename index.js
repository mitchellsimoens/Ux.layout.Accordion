Ext.Loader.setConfig({
    enabled : true,
    paths   : {
        Ux : 'ux'
    }
});

Ext.require([
    'Ext.dataview.List',
    'Ext.field.Text',
    'Ext.Toolbar',

    'Ux.layout.Accordion'
]);

Ext.define('Contact', {
    extend : 'Ext.data.Model',

    config : {
        fields : ['firstName', 'lastName']
    },

    fields : ['firstName', 'lastName']
});

Ext.setup({
    onReady : function() {
        Ext.create('Ext.Container', {
            fullscreen : true,
            layout     : {
                type : 'accordion',
                mode : 'MULTI'
            },
            scrollable : 'vertical',
            items      : [
                {
                    title : 'Form',
                    items : [
                        {
                            xtype : 'textfield',
                            label : 'Test'
                        },
                        {
                            xtype  : 'toolbar',
                            docked : 'bottom',
                            items  : [
                                {
                                    text : 'Cancel',
                                    ui   : 'decline'
                                },
                                {
                                    xtype : 'spacer'
                                },
                                {
                                    text : 'Save',
                                    ui   : 'confirm'
                                }
                            ]
                        }
                    ]
                },
                {
                    title  : 'List',
                    height : 400,
                    layout : 'fit',
                    items  : [
                        {
                            xtype   : 'list',
                            itemTpl : '<div class="contact">{firstName} <strong>{lastName}</strong></div>',
                            store   : Ext.create('Ext.data.Store', {
                                model   : 'Contact',
                                sorters : 'lastName',

                                grouper : {
                                    groupFn : function(record) {
                                        return record.get('lastName')[0];
                                    }
                                },

                                getGroupString: function(record) {
                                    return record.get('lastName')[0];
                                },

                                data   : [
                                    { firstName : 'Mitchell', lastName : 'Simoens'  },
                                    { firstName : 'Rob',      lastName : 'Dougan'   },
                                    { firstName : 'Ed',       lastName : 'Spencer'  },
                                    { firstName : 'Jamie',    lastName : 'Avins'    },
                                    { firstName : 'Aaron',    lastName : 'Conran'   },
                                    { firstName : 'Dave',     lastName : 'Kaneda'   },
                                    { firstName : 'Jacky',    lastName : 'Nguyen'   },
                                    { firstName : 'Abraham',  lastName : 'Elias'    },
                                    { firstName : 'Jay',      lastName : 'Robinson' },
                                    { firstName : 'Nigel',    lastName : 'White'    },
                                    { firstName : 'Don',      lastName : 'Griffin'  },
                                    { firstName : 'Nico',     lastName : 'Ferrero'  },
                                    { firstName : 'Nicolas',  lastName : 'Belmonte' },
                                    { firstName : 'Jason',    lastName : 'Johnston' }
                                ]
                            })
                        }
                    ]
                }
            ]
        });
    }
});