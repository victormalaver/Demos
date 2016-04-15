'use strict';

app.orden = kendo.observable({
    onShow: function () {},
    afterShow: function () {},
});


(function (parent) {
    var dataProvider = app.data.pruebaKike,
        cargaPosAlmacenesDespachador = function (dataSource, miLatLong, miArgument) {
            $("#miLatLong").val(miLatLong);
            $("#mapOrden").remove();
            var alto = $(window).height() - $("#headerOrden").height();
            var div = $("<div id='mapOrden' style='width:100%;height:" + alto + "px;' ></div>").text("");
            $("#divMapOrden").after(div);

            //<![CDATA[
            // var restLatLong = [-12.105753065958925, -77.03500092029572];
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

            var iconMiUbicacion = L.icon({
                iconUrl: 'Mapa/images/markerRestaurante5.png',
                // iconRetinaUrl: 'my-icon@2x.png',
                // iconSize: [38, 95],
                iconAnchor: [15, 38], //X,Y
                popupAnchor: [0, -35],
                // // shadowUrl: 'my-icon-shadow.png',
                // shadowRetinaUrl: 'my-icon-shadow@2x.png',
                // shadowSize: [68, 95],
                // shadowAnchor: [22, 94]
            });



            var map = new L.map('mapOrden', {
                center: miLatLong,
                zoom: 15,
            });



            L.tileLayer('http://{s}.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.png', {
                //attribution: "Map: Tiles Courtesy of MapQuest (OpenStreetMap, CC-BY-SA)",
                subdomains: ["otile1", "otile2", "otile3", "otile4"],
                // maxZoom: 12,
                // minZoom: 2
            }).addTo(map);

            var miUbicacion = new L.MarkerClusterGroup();
            var markerClientes = new L.MarkerClusterGroup();
            var markerEntregados = new L.MarkerClusterGroup();
            //markers.addLayer(new L.Marker([1, 1]));


            miUbicacion.addTo(map);
            markerClientes.addTo(map);
            markerEntregados.addTo(map);

            miUbicacion.addLayer(new L.Marker(miLatLong, {
                icon: iconMiUbicacion
            }).bindPopup("<b>Estoy aquí:</b></br>" + miArgument));

            function update(Sucursal, IdSucursal, CodSucursal) {
                return function (e) {
                    if (miUbicacion) {
                        map.removeLayer(miUbicacion);
                    }
                    miUbicacion = new L.MarkerClusterGroup();
                    map.addLayer(miUbicacion);
                    miLatLong = [parseFloat(e.latlng.lat), parseFloat(e.latlng.lng)]; //[43.465187, -80.52237200000002]; 
                    // miUbicacion.removeLayer();
                    miUbicacion.addLayer(new L.Marker(miLatLong, {
                        icon: iconMiUbicacion
                    }).bindPopup("<b>Enviar mi orden aquí: </b>" + miLatLong + "</br></br><b>Estoy aquí:</b></br>" + miArgument).openPopup());
                    miUbicacion.addTo(map);

                    $("#miLatLong").val(miLatLong);
                    $("#tagSucursal").text(Sucursal);
                    $("#tagIdSucursal").text(IdSucursal);
                    $("#tagCodSucursal").text(CodSucursal);
                }
            }


            var ubicOrdenes = "";
            dataSource.fetch(function () {
                for (var i = 0; i < dataSource.total(); i++) {
                    if (dataSource.at(i).Localizacion) {
                        ubicOrdenes = dataSource.at(i).Localizacion.replace(/Latitude:|Longitude:|&nbsp/gi, ""); //[43.465187, -80.52237200000002];
                        var ordenLatLong = [parseFloat(ubicOrdenes.substring(0, ubicOrdenes.indexOf(","))), parseFloat(ubicOrdenes.substring(ubicOrdenes.indexOf(",") + 1, ubicOrdenes.length))];
                        markerClientes.addLayer(new L.Marker(ordenLatLong, {
                            icon: iconSucursal
                        }).bindPopup("<b>" + dataSource.at(i).Descripcion + "</b></br>" + dataSource.at(i).Estado + "</br>" + dataSource.at(i).Detalle + "</br>" + "<img src='" + dataSource.at(i).PictureUrl + "'" + "width='100%'" + "height='100%'>"));


                        var rangoAtencion = L.circle(ordenLatLong, dataSource.at(i).Radio, {
                            color: 'LightGreen'
                        }).addTo(map).on('click', update(dataSource.at(i).Descripcion, dataSource.at(i).Id, dataSource.at(i).Codigo));
                    }
                }
            });
            var ubicEntregados = "";
            for (var i = 0; i < ordenes.length; i++) {
                // ubicEntregados = ordenes[i].Localizacion.latitude + "," + ordenes[i].Localizacion.longitude; //[43.465187, -80.52237200000002];
                var ordenLatLong = [parseFloat(ordenes[i].Localizacion.latitude), parseFloat(ordenes[i].Localizacion.longitude)];
                // console.log(ordenLatLong);
                markerEntregados.addLayer(new L.Marker(ordenLatLong, {
                    icon: iconEntregados
                }).bindPopup("Costo: S/ " + ordenes[i].Costo));
            }

            if ($("#buscarOrden").val() !== "") {
                map.removeLayer(markerEntregados);
            }
        },
        fetchFilteredData = function (paramFilter, searchFilter) {
            var model = parent.get('ordenModel'),
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
            var miLatLong = [];
            var miArgument = [];
            navigator.geolocation.getCurrentPosition(function (position) {
                    miLatLong = [parseFloat(position.coords.latitude), parseFloat(position.coords.longitude)];
                    miArgument = 'Latitude: ' + position.coords.latitude + '<br />' +
                        'Longitude: ' + position.coords.longitude + '<br />' +
                        'Altitude: ' + position.coords.altitude + '<br />' +
                        'Accuracy: ' + position.coords.accuracy + '<br />' +
                        'Altitude Accuracy: ' + position.coords.altitudeAccuracy + '<br />' +
                        'Heading: ' + position.coords.heading + '<br />' +
                        'Speed: ' + position.coords.speed + '<br />' +
                        'Timestamp: ' + position.timestamp + '<br />';
                    
                    cargaPosAlmacenesDespachador(dataSource, miLatLong, miArgument);
                    
                },
                function (error) {
                    alert('code: ' + error.code + '\n' +
                        'message: ' + error.message + '\n');
                });


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
                typeName: 'Sucursales',
                dataProvider: dataProvider
            },
            change: function (e) {
                var data = this.data();
                for (var i = 0; i < data.length; i++) {
                    var dataItem = data[i];
                    dataItem['PictureUrl'] =
                        processImage(dataItem['Imagen']);
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
                        'Descripcion': {
                            field: 'Descripcion',
                            defaultValue: ''
                        },
                        'Detalle': {
                            field: 'Detalle',
                            defaultValue: ''
                        },
                        'Imagen': {
                            field: 'Imagen',
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
                field: "Orden",
                dir: "desc"
            },
            pageSize: 50
        },
        dataSource = new kendo.data.DataSource(dataSourceOptions),
        ordenModel = kendo.observable({
            dataSource: dataSource,
            searchChange: function (e) {
                var searchVal = e.target.value,
                    searchFilter;
                if (searchVal) {
                    searchFilter = {
                        field: 'Id', // -> Id is ok , Orden dont work
                        operator: 'contains',
                        value: searchVal,
                    };
                }
                fetchFilteredData(ordenModel.get('paramFilter'), searchFilter);
            },
            addNuevaOrden: function (e) {
                var total = 0;
                var dataSource = ordenModel.get('dataSource');
                var dataSourceOrdenes = new kendo.data.DataSource({
                    type: 'everlive',
                    transport: {
                        typeName: 'Ordenes',
                        dataProvider: dataProvider
                    }
                });
                dataSourceOrdenes.fetch(function () {

                    var latitude = parseFloat($("#miLatLong").val().substring(0, $("#miLatLong").val().indexOf(",")));
                    var longitude = parseFloat($("#miLatLong").val().substring($("#miLatLong").val().indexOf(",") + 1, $("#miLatLong").val().length));

                    if ($("#miLatLong").val() == "") {
                        alert("Marque un punto dentro del radio de cobertura");
                        return;
                    }

                    if ($("#miDireccion").val() == "") {
                        alert("Ingrese su dirección");
                        $("#miDireccion").focus();
                        return;
                    }
                    app.mobileApp.navigate('#components/georeferencia/carrito.html?');
                    $("#btnGenerarOrden").data("kendoMobileButton").enable("true");

                    if (localStorage.getItem("misDatosCliente") != undefined) {
                        var misDatosGuardados = JSON.parse(localStorage.getItem('misDatosCliente'));
                        misDatosGuardados.push({
                            "latitude": latitude,
                            "longitude": longitude,
                            "direccion": $("#miDireccion").val(),
                            "idsucursal": $("#tagIdSucursal").text(),
                            "codsucursal": $("#tagCodSucursal").text()
                        });
                        localStorage.setItem("misDatosCliente", JSON.stringify(misDatosGuardados));
                        var misDatosCliente = localStorage.getItem('misDatosCliente');
                        console.log('IF misDatosCliente: ', JSON.parse(misDatosCliente));
                    } else {
                        var misDatosCliente = [{
                            "latitude": latitude,
                            "longitude": longitude,
                            "direccion": $("#miDireccion").val(),
                            "idsucursal": $("#tagIdSucursal").text(),
                            "codsucursal": $("#tagCodSucursal").text()
                        }];
                        localStorage.setItem("misDatosCliente", JSON.stringify(misDatosCliente));
                        var misDatosCliente = localStorage.getItem('misDatosCliente');
                        console.log('ELSE misDatosCliente: ', JSON.parse(misDatosCliente));
                    }

                });

            },
            currentItem: null,
        });


    if (typeof dataProvider.sbProviderReady === 'function') {
        dataProvider.sbProviderReady(function dl_sbProviderReady() {
            parent.set('ordenModel', ordenModel);
        });
    } else {
        parent.set('ordenModel', ordenModel);
    }

    parent.set('onShow', function (e) {
        var param = e.view.params.filter ? JSON.parse(e.view.params.filter) : null;
        fetchFilteredData(param);
        $("#modalInfoOrden").kendoMobileModalView("open");
    });
})(app.orden);