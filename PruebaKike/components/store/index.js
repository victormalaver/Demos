'use strict';

app.store = kendo.observable({
    onShow: function() {},
    afterShow: function() {}
});

// START_CUSTOM_CODE_store
// Add custom code here. For more information about custom code, see http://docs.telerik.com/platform/screenbuilder/troubleshooting/how-to-keep-custom-code-changes

// END_CUSTOM_CODE_store
(function(parent) {
    var dataProvider = app.data.pruebaKike,
        fetchFilteredData = function(paramFilter, searchFilter) {
            var model = parent.get('storeModel'),
                dataSource = model.get('dataSource');

            if (paramFilter) {
                model.set('paramFilter', paramFilter);
            } else {
                model.set('paramFilter', undefined);
            }

            if (paramFilter && searchFilter) {
                dataSource.filter({
                    logic: 'and',
                    filters: [paramFilter, searchFilter]
                });
            } else if (paramFilter || searchFilter) {
                dataSource.filter(paramFilter || searchFilter);
            } else {
                dataSource.filter({});
            }
        },
        processImage = function(img) {
            if (!img) {
                var empty1x1png = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQI12NgYAAAAAMAASDVlMcAAAAASUVORK5CYII=';
                img = 'data:image/png;base64,' + empty1x1png;
            } else if (img.slice(0, 4) !== 'http' &&
                img.slice(0, 2) !== '//' && img.slice(0, 5) !== 'data:') {
                var setup = dataProvider.setup || {};
                img = setup.scheme + ':' + setup.url + setup.appId + '/Files/' + img + '/Download';
            }

            return img;
        },
        flattenLocationProperties = function(dataItem) {
            var propName, propValue,
                isLocation = function(value) {
                    return propValue && typeof propValue === 'object' &&
                        propValue.longitude && propValue.latitude;
                };

            for (propName in dataItem) {
                if (dataItem.hasOwnProperty(propName)) {
                    propValue = dataItem[propName];
                    if (isLocation(propValue)) {
                        dataItem[propName] =
                            kendo.format('Latitude: {0}, Longitude: {1}',
                                propValue.latitude, propValue.longitude);
                    }
                }
            }
        },
        dataSourceOptions = {
            type: 'everlive',
            transport: {
                typeName: 'Activities',
                dataProvider: dataProvider
            },
            change: function(e) {
                var data = this.data();
                for (var i = 0; i < data.length; i++) {
                    var dataItem = data[i];

                    dataItem['PictureUrl'] =
                        processImage(dataItem['Picture']);

                    flattenLocationProperties(dataItem);
                }
            },
            error: function(e) {
                if (e.xhr) {
                    alert(JSON.stringify(e.xhr));
                }
            },
            schema: {
                model: {
                    fields: {
                        'Text': {
                            field: 'Text',
                            defaultValue: ''
                        },
                        'Likes': {
                            field: 'Likes',
                            defaultValue: ''
                        },
                        'Picture': {
                            field: 'Picture',
                            defaultValue: ''
                        },
                    },
                    icon: function() {
                        var i = 'globe';
                        return kendo.format('km-icon km-{0}', i);
                    }
                }
            },
            serverFiltering: true,
            serverSorting: true,
            serverPaging: true,
            pageSize: 50
        },
        dataSource = new kendo.data.DataSource(dataSourceOptions),
        storeModel = kendo.observable({
            dataSource: dataSource,
            searchChange: function(e) {
                var searchVal = e.target.value,
                    searchFilter;

                if (searchVal) {
                    searchFilter = {
                        field: 'Text',
                        operator: 'contains',
                        value: searchVal
                    };
                }
                fetchFilteredData(storeModel.get('paramFilter'), searchFilter);
            },
            itemClick: function(e) {

                app.mobileApp.navigate('#components/store/details.html?uid=' + e.dataItem.uid);

            },
            addClick: function() {
                app.mobileApp.navigate('#components/store/add.html');
            },
            editClick: function() {
                var uid = this.currentItem.uid;
                app.mobileApp.navigate('#components/store/edit.html?uid=' + uid);
            },
            deleteClick: function() {
                var dataSource = storeModel.get('dataSource'),
                    that = this;

                navigator.notification.confirm(
                    "Are you sure you want to delete this item?",
                    function(index) {
                        //'OK' is index 1
                        //'Cancel' - index 2
                        if (index === 1) {
                            dataSource.remove(that.currentItem);

                            dataSource.one('sync', function() {
                                app.mobileApp.navigate('#:back');
                            });

                            dataSource.one('error', function() {
                                dataSource.cancelChanges();
                            });

                            dataSource.sync();
                        }
                    },
                    '', ["OK", "Cancel"]
                );
            },
            detailsShow: function(e) {
                var item = e.view.params.uid,
                    dataSource = storeModel.get('dataSource'),
                    itemModel = dataSource.getByUid(item);
                itemModel.PictureUrl = processImage(itemModel.Picture);

                if (!itemModel.Text) {
                    itemModel.Text = String.fromCharCode(160);
                }

                storeModel.set('currentItem', null);
                storeModel.set('currentItem', itemModel);
            },
            currentItem: null
        });

    parent.set('addItemViewModel', kendo.observable({
        onShow: function(e) {
            // Reset the form data.
            this.set('addFormData', {
                addLongText: '',
                addSortText: '',
                addLike: '',
                addApunte: '',
            });
        },
        onSaveClick: function(e) {
            var addFormData = this.get('addFormData'),
                dataSource = storeModel.get('dataSource');

            dataSource.add({
                LongText: addFormData.addLongText,
                SortText: addFormData.addSortText,
                Likes: addFormData.addLike,
                Text: addFormData.addApunte,
            });

            dataSource.one('change', function(e) {
                app.mobileApp.navigate('#:back');
            });

            dataSource.sync();
        }
    }));

    parent.set('editItemViewModel', kendo.observable({
        onShow: function(e) {
            var itemUid = e.view.params.uid,
                dataSource = storeModel.get('dataSource'),
                itemData = dataSource.getByUid(itemUid);

            this.set('itemData', itemData);
            this.set('editFormData', {
                editLongText: itemData.LongText,
                editSortText: itemData.SortText,
                editLike: itemData.Likes,
                editText: itemData.Text,
            });
        },
        onSaveClick: function(e) {
            var editFormData = this.get('editFormData'),
                itemData = this.get('itemData'),
                dataSource = storeModel.get('dataSource');

            // prepare edit
            itemData.set('LongText', editFormData.editLongText);
            itemData.set('SortText', editFormData.editSortText);
            itemData.set('Likes', editFormData.editLike);
            itemData.set('Text', editFormData.editText);

            dataSource.one('sync', function(e) {
                app.mobileApp.navigate('#:back');
            });

            dataSource.one('error', function() {
                dataSource.cancelChanges(itemData);
            });

            dataSource.sync();
        }
    }));

    if (typeof dataProvider.sbProviderReady === 'function') {
        dataProvider.sbProviderReady(function dl_sbProviderReady() {
            parent.set('storeModel', storeModel);
        });
    } else {
        parent.set('storeModel', storeModel);
    }

    parent.set('onShow', function(e) {
        var param = e.view.params.filter ? JSON.parse(e.view.params.filter) : null;

        fetchFilteredData(param);
    });
})(app.store);

// START_CUSTOM_CODE_storeModel
// Add custom code here. For more information about custom code, see http://docs.telerik.com/platform/screenbuilder/troubleshooting/how-to-keep-custom-code-changes

// END_CUSTOM_CODE_storeModel