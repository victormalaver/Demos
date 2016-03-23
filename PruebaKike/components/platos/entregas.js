'use strict';

app.entrega = kendo.observable({
    onShow: function () {},
    afterShow: function () {},
});


(function (parent) {
    var dataProvider = app.data.pruebaKike,
        // cargaPosAlmacenesDespachador: function () {
        cargaPosAlmacenesDespachador = function (dataSource) {
            $("#mapEntrega").remove();
            var alto = 500;
            var div = $("<div id='mapEntrega' style='width:100%;height:" + alto + "px;' ></div>").text("");
            $("#divMapEntrega").after(div);

            //<![CDATA[

            var iconAlmacen = L.icon({
                iconUrl: 'images/almacen.png',
                // iconRetinaUrl: 'my-icon@2x.png',
                // iconSize: [38, 95], 
                iconAnchor: [15, 38], //X,Y
                popupAnchor: [0, -35],
                // // shadowUrl: 'my-icon-shadow.png',
                // shadowRetinaUrl: 'my-icon-shadow@2x.png',
                // shadowSize: [68, 95],
                // shadowAnchor: [22, 94]
            });

            var iconCliente = L.icon({
                iconUrl: 'Mapa/images/marker-icon.png',
                // iconRetinaUrl: 'my-icon@2x.png',
                // iconSize: [38, 95],
                iconAnchor: [15, 38], //X,Y
                popupAnchor: [0, -35],
                // // shadowUrl: 'my-icon-shadow.png',
                // shadowRetinaUrl: 'my-icon-shadow@2x.png',
                // shadowSize: [68, 95],
                // shadowAnchor: [22, 94]
            });

            var iconMiUbicacion = L.icon({
                iconUrl: 'Mapa/images/mapPinOver2.gif',
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
                center: [-12.11391, -77.03933],
                zoom: 10,
            });

            L.tileLayer('http://{s}.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.png', {
                //attribution: "Map: Tiles Courtesy of MapQuest (OpenStreetMap, CC-BY-SA)",
                subdomains: ["otile1", "otile2", "otile3", "otile4"],
                // maxZoom: 12,
                // minZoom: 2
            }).addTo(map);


            var markerClientes = new L.MarkerClusterGroup();
            var markerAlmacenes = new L.MarkerClusterGroup();
            //markers.addLayer(new L.Marker([1, 1]));




            // Mi ubicacion
            var miUbicacion = new L.MarkerClusterGroup();

            var options = {
                frequency: 1000, //1000 = 1 s
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

            navigator.geolocation.clearWatch(watchID); //para detener
            watchID = null; //para detener

            //end mi ubicacion 

            // console.log(miUbicacion);


            markerClientes.addTo(map);
            markerAlmacenes.addTo(map);

            var ubicOrdenes = "";
            dataSource.fetch(function () {
                for (var i = 0; i < dataSource.total(); i++) {
                    if (dataSource.at(i).Localizacion) {
                        ubicOrdenes = dataSource.at(i).Localizacion.replace(/Latitude:|Longitude:|&nbsp/gi, ""); //[43.465187, -80.52237200000002];
                        var ordenLatLong = [parseFloat(ubicOrdenes.substring(0, ubicOrdenes.indexOf(","))), parseFloat(ubicOrdenes.substring(ubicOrdenes.indexOf(",") + 1, ubicOrdenes.length))];
                        markerClientes.addLayer(new L.Marker(ordenLatLong, {
                            icon: iconCliente
                        }).bindPopup("Hola mundo"));
                    }
                }
            });
            // if (ubicDespachador.length > 0) {
            //     for (var i = 0; i < ubicDespachador.length; i++) {
            //         // console.log(ubicDespachador[i].Info);
            //         // console.log(ubicDespachador[i].Fecha);
            //         // console.log(ubicDespachador[i].LatLong);
            //         // console.log(ubicDespachador[i].Operacion);
            //         markerDespachadores.addLayer(new L.Marker(ubicDespachador[i].LatLong, {
            //             icon: iconDespachador
            //         }).bindPopup(ubicDespachador[i].Info));
            //     }
            // } else {

            // }

            var ubicAlmacen = [];


            if (ubicAlmacen.length > 0) {
                for (var i = 0; i < ubicAlmacen.length; i++) {
                    markerAlmacenes.addLayer(new L.Marker(ubicAlmacen[i].LatLong, {
                        icon: iconAlmacen
                    }).bindPopup(ubicAlmacen[i].InfoAlmacen));
                }

            } else {}

            //control
            //control
            // var osmUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            //     osmAttrib = '&copy; <a href="http://openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            //     osm = L.tileLayer(osmUrl, {
            //         maxZoom: 18,
            //         // attribution: osmAttrib

            //         icon: iconAlmacen

            //     }),
            //     osm2 = new L.TileLayer(osmUrl, {
            //         attribution: 'Hello world',
            //         icon: iconAlmacen
            //     });

            // var marker = new L.Marker(new L.LatLng(43.465187,-80.52237200000002), {
            //     color: 'red'
            // });
            // map.addLayer(marker);
            // marker.bindPopup("Aquí estoy").openPopup();

            // var marker2 = new L.Marker(new L.LatLng(43.465187,-80.52237200000002));
            // map.addLayer(marker2);

            var layersControl = new L.Control.Layers(
                // {
                // 'OSM': osm,
                // 'OSM2': osm2
                // }, 
                {}, //dejar esto así
                {
                    'Restaurantes': markerAlmacenes,
                    'Clientes': markerClientes,
                    'Mi Ubicación': miUbicacion,
                });

            map.addControl(layersControl);
            // map.addControl(new L.Control.Scale());
            //control
            //control
            // L.DomEvent.on(L.DomUtil.get('verMarcadores'), 'click', function () {
            //     map.addLayer(markers);
            // });
        },
        fetchFilteredData = function (paramFilter, searchFilter) {
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
            cargaPosAlmacenesDespachador(dataSource);
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
                typeName: 'Orden',
                dataProvider: dataProvider
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
                    alert(JSON.stringify(e.xhr));
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
                field: "Id",
                dir: "asc"
            },
            pageSize: 50
        },
        dataSource = new kendo.data.DataSource(dataSourceOptions),
        entregaModel = kendo.observable({
            dataSource: dataSource,
            searchChange: function (e) {

                var searchVal = e.target.value,
                    searchFilter;

                if (searchVal) {
                    searchFilter = {
                        field: 'Id',
                        operator: 'contains',
                        value: searchVal
                    };
                }
                fetchFilteredData(entregaModel.get('paramFilter'), searchFilter);
                //Send my datasource filtering my function: cargaPosAlmacenesDespachador(dataSource)
                // cargaPosAlmacenesDespachador(dataSource); //error
            },
            currentItem: null,
            // entrega.cargaPosAlmacenesDespachador(dataSource)


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