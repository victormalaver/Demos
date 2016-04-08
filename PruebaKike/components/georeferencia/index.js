'use strict';

app.entradas = kendo.observable({
    onShow: function () {},
    afterShow: function () {}
});

// START_CUSTOM_CODE_entradas
// Add custom code here. For more information about custom code, see http://docs.telerik.com/platform/screenbuilder/troubleshooting/how-to-keep-custom-code-changes

// END_CUSTOM_CODE_entradas
(function (parent) {
    var dataProvider = app.data.pruebaKike,
        fetchFilteredData = function (paramFilter, searchFilter) {
            var model = parent.get('entradasModel'),
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
        processImage = function (img) {
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
        flattenLocationProperties = function (dataItem) {
            var propName, propValue,
                isLocation = function (value) {
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
                typeName: 'Entrada',
                dataProvider: dataProvider
            },
            change: function (e) {
                var data = this.data();
                for (var i = 0; i < data.length; i++) {
                    var dataItem = data[i];

                    dataItem['FotoUrl'] =
                        processImage(dataItem['Foto']);

                    flattenLocationProperties(dataItem);
                }
            },
            error: function (e) {
                if (e.xhr) {
                    alert(JSON.stringify(e.xhr));
                }
            },
            schema: {
                model: {
                    fields: {
                        'Entrada': {
                            field: 'Entrada',
                            defaultValue: ''
                        },
                        'Precio': {
                            field: 'Precio',
                            defaultValue: ''
                        },
                        'Foto': {
                            field: 'Foto',
                            defaultValue: ''
                        },
                    }
                }
            },
            serverFiltering: true,
        },
        dataSource = new kendo.data.DataSource(dataSourceOptions),
        entradasModel = kendo.observable({
            dataSource: dataSource,
            entradasTipo: function (e) {
                app.mobileApp.navigate('#components/georeferencia/entrada.html');
            },
            itemClick: function (e) {
                // app.mobileApp.navigate('#components/platos/details.html?uid=' + e.data.uid);
                app.mobileApp.navigate('#components/georeferencia/platos.html');
            },
            detailsShow: function (e) {
                var item = e.view.params.uid,
                    dataSource = entradasModel.get('dataSource'),
                    itemModel = dataSource.getByUid(item);
                itemModel.FotoUrl = processImage(itemModel.Foto);

                if (!itemModel.Entrada) {
                    itemModel.Entrada = String.fromCharCode(160);
                }

                entradasModel.set('currentItem', null);
                entradasModel.set('currentItem', itemModel);
            },
            openModalInfoGeoref: function (e) {
                $("#modalInfoGeoref").kendoMobileModalView("open");
                // $("#modalInfoGeoref").parent().parent().parent().css("background", "rgba(0, 0, 0, 0.8)");
                $("#modalInfoGeoref").parent().parent().css({
                    "text-align": "center",
                    "position": "relative!important",
                    "top": "auto!important",
                    "left": "auto!important",
                    "display": "inline-block!important",
                    "vertical-align": "middle"
                });
            },
            currentItem: null
        });

    if (typeof dataProvider.sbProviderReady === 'function') {
        dataProvider.sbProviderReady(function dl_sbProviderReady() {
            parent.set('entradasModel', entradasModel);
        });
    } else {
        parent.set('entradasModel', entradasModel);
    }

    parent.set('onShow', function (e) {
        var param = e.view.params.filter ? JSON.parse(e.view.params.filter) : null;

        fetchFilteredData(param);
    });
})(app.entradas);

// START_CUSTOM_CODE_entradasModel
// Add custom code here. For more information about custom code, see http://docs.telerik.com/platform/screenbuilder/troubleshooting/how-to-keep-custom-code-changes

// END_CUSTOM_CODE_entradasModel