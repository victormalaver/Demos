'use strict';

app.carrito = kendo.observable({
    onShow: function () {
        if (localStorage.getItem("ordenesCarrito") != undefined) {
            var ordenesGuardas = JSON.parse(localStorage.getItem('ordenesCarrito'));
            $("#ordenesGuardadas").html('');
            var html = [];
            var precioTotal = 0;
            for (var i = 0; i < ordenesGuardas.length; i++) {
                precioTotal = precioTotal + (parseInt(ordenesGuardas[i].PrecioEntrada) + parseInt(ordenesGuardas[i].PrecioPlato));
                html.push('<h2 style="text-align: left;"> Pedido ' + (i + 1) + '</h2>');
                html.push('<h3> ' + ordenesGuardas[i].Entrada + '</h3>');
                html.push('<div class="iconMas"><span class="km-icon km-add" style="margin-left: 4px;"></span>');
                html.push('</div>');
                html.push('<h3> ' + ordenesGuardas[i].Plato + '</h3>');
                html.push('</br>');
                html.push('<div style="width: 80%;">');
                html.push('<div class="resumenOrden">');
                html.push('<b style="float: left;">' + 1 + ' Pedido(s):</b>');
                html.push('<b id="btn-delete" data-role="button" onclick="getCurrentArray(' + "'btnBorrarOrden'" + ',' + i + ')" data-rel="actionsheet"><a class="km-icon km-delete"></a></b>');
                html.push('<label>S/ ' + (parseInt(ordenesGuardas[i].PrecioEntrada) + parseInt(ordenesGuardas[i].PrecioPlato)) + '</label>');
                html.push('</div>');
                html.push('</div>');
                html.push('</br>');
                html.push('<hr style="border-top: 1px solid #c95820;">');
                html.push('</br>');
            }

            html.push('<div align="center" style="width: 80%;">');
            html.push('<div align="center" class="divContentCarrito">');
            html.push('<div align="center" style="padding: 0.5em;">');
            html.push('<h2>Precio Total</h2>');
            html.push('</div>');
            html.push('<div style="padding: 1em 2em 2em 2em;">');
            html.push('<b style="float: left;" id="numPedidos">' + ordenesGuardas.length + ' Pedido(s): </b>');
            html.push('<label style="float: right;" id="costoPedidos">S/ ' + precioTotal + '</label>');
            html.push('</br>');
            html.push('<b style="float: left;">Costo Delivery:</b>');
            html.push('<label style="float: right;">S/ 03</label>');
            html.push('</div>');
            html.push('<div class="footerDivCarrito">');
            html.push('<b style="float: left;">Precio Total: </b>');
            html.push('<label style="float: right;">S/ <tag id="precioTotalOrden">' + (precioTotal + 3) + '</tag></label>');
            html.push('</div>');
            html.push('</div>');
            html.push('</div>');
            $("#ordenesGuardadas").html(html.join(''));
        } else {
            app.mobileApp.navigate('#components/georeferencia/index.html');
        }
        countCarrito();
    },
    afterShow: function () {}
});

function closeModal(id) {
    $("#" + id).data("kendoMobileModalView").close();
}

function closeActionSheet(id) {
    $("#" + id).data("kendoMobileActionSheet").close();
}

function getCurrentArray(id, i) {
    $("#titleBorrarOrden").html("¿Desea eliminar el pedido " + (parseInt(i) + 1) + " ?");
    $("#" + id).attr("onclick", "deleteOrden(" + i + ");");
    $("#actionsheetDelete").data("kendoMobileActionSheet").open();
}

function deleteOrden(id) {
        var ordenesGuardas = JSON.parse(localStorage.getItem('ordenesCarrito'));
        ordenesGuardas.splice(id, 1);
        localStorage.setItem("ordenesCarrito", JSON.stringify(ordenesGuardas));
        app.carrito.onShow();
        $("#actionsheetDelete").data("kendoMobileActionSheet").close();
    }
    // START_CUSTOM_CODE_carrito
    // Add custom code here. For more information about custom code, see http://docs.telerik.com/platform/screenbuilder/troubleshooting/how-to-keep-custom-code-changes

// END_CUSTOM_CODE_carrito
(function (parent) {
    var dataProvider = app.data.pruebaKike,
        dataSourceOptions = {
            type: 'everlive',
            transport: {
                typeName: 'Ordenes',
                dataProvider: dataProvider,
            },
            error: function (e) {
                if (e.xhr) {
                    // alert(JSON.stringify(e.xhr));
                    alert("No se generó la orden, intente nuevamente.");
                }
            }
        },
        dataSource = new kendo.data.DataSource(dataSourceOptions),
        carritoModel = kendo.observable({
            dataSource: dataSource,
            openModalCarrito: function (e) {
                $("#numPedidosModal").html($("#numPedidos").html());
                $("#precioTotalOrdenModal").html($("#precioTotalOrden").html());
                $("#modalConfirmarPerdido").kendoMobileModalView("open");
            },
            addOrdenCarrito: function (e) {
                if (localStorage.getItem("ordenesCarrito") != undefined) {


                    dataSource.fetch(function () {
                        var entradas = [];
                        var platos = [];
                        var ordenesCarrito = JSON.parse(localStorage.getItem('ordenesCarrito'));
                        for (var i = 0; i < ordenesCarrito.length; i++) {
                            entradas.push(ordenesCarrito[i].IdEntrada);
                            platos.push(ordenesCarrito[i].IdPlato);
                        }
                        var misDatosCliente = JSON.parse(localStorage.getItem('misDatosCliente'));
                        var total = 0;
                        var direccion = misDatosCliente[misDatosCliente.length - 1].direccion;
                        var latitude = parseFloat(misDatosCliente[misDatosCliente.length - 1].latitude);
                        var longitude = parseFloat(misDatosCliente[misDatosCliente.length - 1].longitude);
                        var idsucursal = misDatosCliente[misDatosCliente.length - 1].idsucursal;
                        var codsucursal = misDatosCliente[misDatosCliente.length - 1].codsucursal;
                        var costo = parseInt($("#precioTotalOrden").text());


                        total = dataSource.total() + 1;
                        var orden = codsucursal + "-" + total;

                        dataSource.add({
                            Costo: costo,
                            Entrada: entradas,
                            Plato: platos,
                            Users: "56dccaa0-fd8b-11e5-a92e-af87711392e8", //mi usuario vemalavers
                            Orden: orden,
                            Sede: idsucursal,
                            Direccion: direccion,
                            Localizacion: {
                                longitude: longitude,
                                latitude: latitude
                            }
                        });
                        dataSource.one('change', function (e) {
                            // app.mobileApp.navigate('#:back');
                            localStorage.removeItem("ordenesCarrito");
                            $("#menuGeoreferencia").css("background-image", "url(components/georeferencia/images/fondoRestaurant.jpg);");
                            app.mobileApp.navigate('#components/georeferencia/cliente.html');
                            $("#modalSuccesOrden").kendoMobileModalView("open");
                            countCarrito();
                        });

                        dataSource.sync();
                    });


                } else {

                }
            },
            currentItem: null
        });

    if (typeof dataProvider.sbProviderReady === 'function') {
        dataProvider.sbProviderReady(function dl_sbProviderReady() {
            parent.set('carritoModel', carritoModel);
        });
    } else {
        parent.set('carritoModel', carritoModel);
    }

    //     parent.set('onShow', function (e) {
    //         var param = e.view.params.filter ? JSON.parse(e.view.params.filter) : null;

    //         fetchFilteredData(param);
    //     });
})(app.carrito);

// START_CUSTOM_CODE_carritoModel
// Add custom code here. For more information about custom code, see http://docs.telerik.com/platform/screenbuilder/troubleshooting/how-to-keep-custom-code-changes

// END_CUSTOM_CODE_carritoModel