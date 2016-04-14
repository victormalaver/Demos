'use strict';

app.entrega = kendo.observable({
    onShow: function () {},
    afterShow: function () {},

});

function onChange(e) {
    var Id = e.sender.options.name;
    var Orden = e.sender.options.prefix;
    app.mobileApp.navigate('#components/georeferencia/listado.html?Id=' + Id + "&Estado=" + e.checked);

    if (e.checked) { //si entregar
        $("#titleEstadoOrden").html("¿Entregar la orden " + Orden + " ?");
    } else {
        $("#titleEstadoOrden").html("¿Cambiar a pendiente la orden " + Orden + " ?");
    }

    $("#actionsheetEstado").data("kendoMobileActionSheet").open();


}
(function (parent) {
    var dataProvider = app.data.pruebaKike,
        cargaPosAlmacenesDespachador = function (dataSource, dataSourceSedes) {
            $("#mapEntrega").remove();
            var alto = $(window).height() - 95;
            var div = $("<div id='mapEntrega' style='width:100%;height:" + alto + "px;' ></div>").text("");
            $("#divMapEntrega").after(div);

            //<![CDATA[
            var restLatLong = [-12.105753065958925, -77.03500092029572];
            var iconMiUbicacion = L.icon({
                iconUrl: 'Mapa/images/mapPinOver2.gif', //iconUrl: 'Mapa/images/markerEntregados.png',
                // iconRetinaUrl: 'my-icon@2x.png',
                // iconSize: [38, 95], 
                iconAnchor: [15, 38], //X,Y
                popupAnchor: [0, -35],
                // // shadowUrl: 'my-icon-shadow.png',
                // shadowRetinaUrl: 'my-icon-shadow@2x.png',
                // shadowSize: [68, 95],
                // shadowAnchor: [22, 94]
            });

            var iconEntregados = L.icon({
                iconUrl: 'Mapa/images/markerEntregados3.png', //iconUrl: 'Mapa/images/markerEntregados.png',
                // iconRetinaUrl: 'my-icon@2x.png',
                // iconSize: [38, 95], 
                iconAnchor: [15, 38], //X,Y
                popupAnchor: [0, -35],
                // // shadowUrl: 'my-icon-shadow.png',
                // shadowRetinaUrl: 'my-icon-shadow@2x.png',
                // shadowSize: [68, 95],
                // shadowAnchor: [22, 94]
            });

            var iconPendientes = L.icon({
                iconUrl: 'Mapa/images/markerEspera3.png',
                // iconRetinaUrl: 'my-icon@2x.png',
                // iconSize: [38, 95],
                iconAnchor: [15, 38], //X,Y
                popupAnchor: [0, -35],
                // // shadowUrl: 'my-icon-shadow.png',
                // shadowRetinaUrl: 'my-icon-shadow@2x.png',
                // shadowSize: [68, 95],
                // shadowAnchor: [22, 94]
            });

            var iconSucursal = L.icon({
                iconUrl: 'Mapa/images/markerRestauranteO.png',
                // iconRetinaUrl: 'my-icon@2x.png',
                // iconSize: [38, 95],
                iconAnchor: [15, 38], //X,Y
                popupAnchor: [0, -35],
                // // shadowUrl: 'my-icon-shadow.png',
                // shadowRetinaUrl: 'my-icon-shadow@2x.png',
                // shadowSize: [68, 95],
                // shadowAnchor: [22, 94]
            });



            var map = new L.map('mapEntrega', {
                center: restLatLong,
                zoom: 15,
            });

            L.tileLayer('http://{s}.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.png', {
                //attribution: "Map: Tiles Courtesy of MapQuest (OpenStreetMap, CC-BY-SA)",
                subdomains: ["otile1", "otile2", "otile3", "otile4"],
                // maxZoom: 12,
                // minZoom: 2
            }).addTo(map);

            var miUbicacion = new L.MarkerClusterGroup();
            var markerSucursales = new L.MarkerClusterGroup();
            var markerPendientes = new L.MarkerClusterGroup();
            var markerEntregados = new L.MarkerClusterGroup();
            //markers.addLayer(new L.Marker([1, 1]));



            var options = {
                frequency: 1000 * 60, //1000 = 1 s
                enableHighAccuracy: true
            };
            var miLatLong = [];
            var watchID = navigator.geolocation.getCurrentPosition(function () { //watchPosition //getCurrentPosition

                    miLatLong = [parseFloat(arguments[0].coords.latitude), parseFloat(arguments[0].coords.longitude)]; //[43.465187, -80.52237200000002]; 
                    miUbicacion.addLayer(new L.Marker(miLatLong, {
                        icon: iconMiUbicacion
                    }).bindPopup("<b>Estoy aquí:</b></br>" + JSON.stringify(arguments[0].coords).replace(/,/g, "</br>")));
                    miUbicacion.addTo(map);

                },
                function () {
                    console.log("Error");
                }, options);

            // navigator.geolocation.clearWatch(watchID); //para detener
            // watchID = null; //para detener

            //end mi ubicacion 

            markerSucursales.addTo(map);
            markerPendientes.addTo(map);
            markerEntregados.addTo(map);



            // start Sedes
            var sucursales = "";
            dataSourceSedes.fetch(function () {
                for (var i = 0; i < dataSourceSedes.total(); i++) {
                    if (dataSourceSedes.at(i).Localizacion) {
                        var sucursalLatLong = [parseFloat(dataSourceSedes.at(i).Localizacion.latitude), parseFloat(dataSourceSedes.at(i).Localizacion.longitude)];
                        markerSucursales.addLayer(new L.Marker(sucursalLatLong, {
                            icon: iconSucursal
                        }).bindPopup("<b>" + dataSourceSedes.at(i).Descripcion + "</b></br>" + dataSourceSedes.at(i).Estado + "</br>" + dataSourceSedes.at(i).Detalle + "</br>"));
                        var rangoAtencion = L.circle(sucursalLatLong, dataSourceSedes.at(i).Radio, {
                            color: 'LightGreen'
                        }).addTo(map);
                    }
                }
            });
            //End Sedes

            var ubicOrdenes = "";
            var ubicSeguimientos = "";
            dataSource.fetch(function () {
                if (dataSource.total() > 0) {
                    for (var i = 0; i < 50; i++) { //total de ordenes
                        if (dataSource.at(i).Localizacion && dataSource.at(i).Estado == "Entregado") {
                            var pedido = [];
                            for (var j = 0; j < dataSource.at(i).Entrada.length; j++) {
                                pedido.push("</br>" + dataSource.at(i).EntradaExpanded[j] + " + " + dataSource.at(i).PlatoExpanded[j]);
                            }

                            ubicOrdenes = dataSource.at(i).Localizacion.replace(/Latitude:|Longitude:|&nbsp/gi, ""); //[43.465187, -80.52237200000002];
                            var ordenLatLong = [parseFloat(ubicOrdenes.substring(0, ubicOrdenes.indexOf(","))), parseFloat(ubicOrdenes.substring(ubicOrdenes.indexOf(",") + 1, ubicOrdenes.length))];
                            markerEntregados.addLayer(new L.Marker(ordenLatLong, {
                                icon: iconEntregados
                            }).bindPopup("<big>Orden: " + dataSource.at(i).Orden + "</big></br><b><em>" + pedido + "</em></b></br></br>Total: S/. " + dataSource.at(i).Costo + "</br>" + dataSource.at(i).SedeExpanded + "</br>Dirección: " + dataSource.at(i).Direccion));

                            ubicSeguimientos = dataSource.at(i).Localizacion.replace(/Latitude:|Longitude:|&nbsp/gi, ""); //[43.465187, -80.52237200000002];
                            map.panTo(new L.LatLng(parseFloat(ubicSeguimientos.substring(0, ubicSeguimientos.indexOf(","))), parseFloat(ubicSeguimientos.substring(ubicSeguimientos.indexOf(",") + 1, ubicSeguimientos.length))));

                        } else {
                            var pedido = [];
                            for (var j = 0; j < dataSource.at(i).Entrada.length; j++) {
                                pedido.push("</br>" + dataSource.at(i).EntradaExpanded[j] + " + " + dataSource.at(i).PlatoExpanded[j]);
                            }
                            ubicOrdenes = dataSource.at(i).Localizacion.replace(/Latitude:|Longitude:|&nbsp/gi, ""); //[43.465187, -80.52237200000002];
                            var ordenLatLong = [parseFloat(ubicOrdenes.substring(0, ubicOrdenes.indexOf(","))), parseFloat(ubicOrdenes.substring(ubicOrdenes.indexOf(",") + 1, ubicOrdenes.length))];
                            markerPendientes.addLayer(new L.Marker(ordenLatLong, {
                                icon: iconPendientes
                            }).bindPopup("<big>Orden: " + dataSource.at(i).Orden + "</big></br><b><em>" + pedido + "</em></b></br></br>Total: S/. " + dataSource.at(i).Costo + "</br>" + dataSource.at(i).SedeExpanded + "</br>Dirección: " + dataSource.at(i).Direccion));

                            ubicSeguimientos = dataSource.at(i).Localizacion.replace(/Latitude:|Longitude:|&nbsp/gi, ""); //[43.465187, -80.52237200000002];
                            map.panTo(new L.LatLng(parseFloat(ubicSeguimientos.substring(0, ubicSeguimientos.indexOf(","))), parseFloat(ubicSeguimientos.substring(ubicSeguimientos.indexOf(",") + 1, ubicSeguimientos.length))));
                        }
                    }
                }
            });


            var layersControl = new L.Control.Layers(
                // {
                // 'OSM': osm,
                // 'OSM2': osm2
                // }, 
                {}, //dejar esto así
                {
                    'Sucursales': markerSucursales,
                    'Pendientes': markerPendientes,
                    'Entregados': markerEntregados,
                    'Mi Ubicación': miUbicacion,
                });

            map.addControl(layersControl);
            if ($("#buscarOrden").val() !== "") {
                // map.removeLayer(markerEntregados);
            }
        },
        fetchFilteredData = function (paramFilter, searchFilter) {
            // searchFilter = parseInt(searchFilter);
            var model = parent.get('entregaModel'),
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
            var dataSourceSedes = new kendo.data.DataSource({
                type: 'everlive',
                transport: {
                    typeName: 'Sucursales',
                    dataProvider: dataProvider
                }
            });
            if ($("#mapEntrega").length) {
                cargaPosAlmacenesDespachador(dataSource, dataSourceSedes);
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
        dataSourceOptionsOrden = {
            type: 'everlive',
            transport: {
                typeName: 'Ordenes',
                dataProvider: dataProvider,
                read: {
                    headers: {
                        "X-Everlive-Expand": JSON.stringify({
                            "Entrada": {
                                "TargetTypeName": "Entrada",
                                "ReturnAs": "EntradaExpanded",
                                "SingleField": "Entrada"
                            },
                            "Plato": {
                                "TargetTypeName": "Plato",
                                "ReturnAs": "PlatoExpanded",
                                "SingleField": "Plato"
                            },
                            "Sede": {
                                "TargetTypeName": "Sucursales",
                                "ReturnAs": "SedeExpanded",
                                "SingleField": "Descripcion"
                            },
                            "Users": {
                                "TargetTypeName": "Users",
                                "ReturnAs": "UsersExpanded",
                                "SingleField": "Username"
                            },
                        })
                    }
                }
            },
            change: function (e) {
                var data = this.data();
                for (var i = 0; i < data.length; i++) {
                    var dataItem = data[i];
                    dataItem['PictureUrl'] =
                        processImage(dataItem['Picture']);
                    flattenLocationProperties(dataItem);
                }
            },
            error: function (e) {
                if (e.xhr) {
                    // alert(JSON.stringify(e.xhr)); //error anonimus consult
                    console.log(JSON.stringify(e.xhr));
                }
            },
            schema: {
                model: {
                    fields: {
                        'Id': {
                            field: 'Id',
                            defaultValue: ''
                        },
                        'Costo': {
                            field: 'Costo',
                            defaultValue: ''
                        },
                        'Orden': {
                            field: 'Orden',
                            defaultValue: ''
                        },
                        'Picture': {
                            field: 'Picture',
                            defaultValue: ''
                        },
                    },
                    icon: function () {
                        var i = 'globe';
                        return kendo.format('km-icon km-{0}', i);
                    }
                }
            },
            serverFiltering: true,
            serverSorting: true,
            serverPaging: true,
            sort: {
                field: "CreatedAt",
                dir: "desc"
            },
            pageSize: 50
        },
        dataSourceOrden = new kendo.data.DataSource(dataSourceOptionsOrden),
        entregaModel = kendo.observable({
            dataSource: dataSourceOrden,
            searchChange: function (e) {
                if ($("#buscarOrdenListado").length) {
                    var buttongroup = $("#buttonGroupHeader").data("kendoMobileButtonGroup");
                    // buttongroup.select(buttongroup.element.children().eq(0));
                    buttongroup.select(0);
                }

                var searchVal = e.target.value,
                    searchFilter;
                if (searchVal) {
                    searchFilter = {
                        field: 'Orden', // -> Id is ok , Orden dont work
                        operator: 'contains',
                        value: searchVal,
                    };
                }
                fetchFilteredData(entregaModel.get('paramFilter'), searchFilter);
            },
            verOrdenesPendientes: function () {
                var searchVal = "Entregado",
                    searchFilter;
                if (searchVal) {
                    searchFilter = {
                        field: 'Estado', // -> Id is ok , Orden dont work
                        operator: 'neq',
                        value: searchVal,
                    };
                }
                fetchFilteredData(entregaModel.get('paramFilter'), searchFilter);
            },
            verOrdenesEntregadas: function () {
                var searchVal = "Entregado",
                    searchFilter;
                if (searchVal) {
                    searchFilter = {
                        field: 'Estado', // -> Id is ok , Orden dont work
                        operator: 'eq',
                        value: searchVal,
                    };
                }
                fetchFilteredData(entregaModel.get('paramFilter'), searchFilter);
            },
            cambiarEstadoOrden: function (e) {
                $.urlParam = function (name) {
                    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
                    if (results == null) {
                        return null;
                    } else {
                        return results[1] || 0;
                    }
                }
                var item = $.urlParam('Id');
                var Estado = $.urlParam('Estado');

                var dataSource = entregaModel.get('dataSource');
                var itemData = dataSource.get(item);


                // prepare edit
                if (Estado == "true") {
                    itemData.set('Estado', 'Entregado');
                } else {
                    itemData.set('Estado', 'Pendiente');
                }


                dataSource.one('sync', function (e) {
                    app.mobileApp.navigate('#:back');
					 $("#actionsheetEstado").data("kendoMobileActionSheet").close();
                });

                dataSource.one('error', function () {
                    dataSource.cancelChanges(itemData);
                });

                dataSource.sync();
            },
            currentItem: null,
        });
    if (typeof dataProvider.sbProviderReady === 'function') {
        dataProvider.sbProviderReady(function dl_sbProviderReady() {
            parent.set('entregaModel', entregaModel);
        });
    } else {
        parent.set('entregaModel', entregaModel);
    }

    parent.set('onShow', function (e) {
        var param = e.view.params.filter ? JSON.parse(e.view.params.filter) : null;
        fetchFilteredData(param);
    });
})(app.entrega);