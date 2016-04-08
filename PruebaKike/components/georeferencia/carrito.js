'use strict';

app.carrito = kendo.observable({
    onShow: function () {
        var ordenesGuardas = JSON.parse(localStorage.getItem('ordenesCarrito'));
        // console.log(ordenesGuardas.length);
        $("#ordenesGuardadas").html('');
        var html = [];
        var precioTotal = 0;
        for (var i = 0; i < ordenesGuardas.length; i++) {
            precioTotal = precioTotal + (parseInt(ordenesGuardas[i].PrecioEntrada) + parseInt(ordenesGuardas[i].PrecioPlato));
            html.push('<h2 style="text-align: left;"> Pedido ' + (i + 1) + '</h2>');
            html.push('<h3> ' + ordenesGuardas[i].Entrada + '</h3>');
            html.push('<div class="iconMas"><span class="km-icon km-add"></span>');
            html.push('</div>');
            html.push('<h3> ' + ordenesGuardas[i].Plato + '</h3>');
            html.push('</br>');
            html.push('<div style="width: 80%;">');
            html.push('<div class="resumenOrden">');
            html.push('<b style="float: left;">' + (i + 1) + ' Pedido(s):</b>');
            html.push('<b id="btn-delete" onclick="deleteOrden(' + i + ');"><a class="km-icon km-delete"></a></b>');
            html.push('<label>S/ ' + (parseInt(ordenesGuardas[i].PrecioEntrada) + parseInt(ordenesGuardas[i].PrecioPlato)) + '</label>');
            html.push('</div>');
            html.push('</div>');
            html.push('</br>');
            html.push('<hr style="border-top: 1px solid #c95820;">');
            html.push('</br>');
        }

        if (ordenesGuardas.length > 0) {
            html.push('<div align="center" style="width: 80%;">');
            html.push('<div align="center" class="divContentCarrito">');
            html.push('<div align="center" style="padding: 0.5em;">');
            html.push('<h2>Precio Total</h2>');
            html.push('</div>');
            html.push('<div style="padding: 1em 2em 2em 2em;">');
            html.push('<b style="float: left;">' + ordenesGuardas.length + ' Pedido(s): </b>');
            html.push('<label style="float: right;">S/ ' + precioTotal + '</label>');
            html.push('</br>');
            html.push('<b style="float: left;">Costo Delibery:</b>');
            html.push('<label style="float: right;">S/ 03</label>');
            html.push('</div>');
            html.push('<div class="footerDivCarrito">');
            html.push('<b style="float: left;">Precio Total: </b>');
            html.push('<label style="float: right;">S/ <tag id="precioTotalOrden">' + (precioTotal + 3) + '</tag></label>');
            html.push('</div>');
            html.push('</div>');
            html.push('</div>');
        } else {
            app.mobileApp.navigate('#components/georeferencia/index.html');
        }
        $("#ordenesGuardadas").html(html.join(''));

        countCarrito();
    },
    afterShow: function () {}
});

function deleteOrden(id) {
        var ordenesGuardas = JSON.parse(localStorage.getItem('ordenesCarrito'));
        ordenesGuardas.splice(id, 1);
        localStorage.setItem("ordenesCarrito", JSON.stringify(ordenesGuardas));
        app.carrito.onShow();
        countCarrito();

    }
    // START_CUSTOM_CODE_carrito
    // Add custom code here. For more information about custom code, see http://docs.telerik.com/platform/screenbuilder/troubleshooting/how-to-keep-custom-code-changes

// END_CUSTOM_CODE_carrito
(function (parent) {
    var dataProvider = app.data.pruebaKike,
        dataSourceOptions = {
            type: 'everlive',
            transport: {
                typeName: 'Orden',
                dataProvider: dataProvider
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
            addOrdenCarrito: function (e) {
                dataSource.fetch(function () {
                    console.log(dataSource.total());
                    $.urlParam = function (name) {
                        var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
                        if (results == null) {
                            return null;
                        } else {
                            return results[1] || 0;
                        }
                    }
                    var total = 0;
                    var direccion = $.urlParam('direccion');
                    var latitude = parseFloat($.urlParam('latitude'));
                    var longitude = parseFloat($.urlParam('longitude'));
                    var idsucursal = $.urlParam('idsucursal');
                    var codsucursal = $.urlParam('codsucursal');
                    var costo = parseInt($("#precioTotalOrden").text());
                    console.log(direccion);
                    console.log(latitude);
                    console.log(longitude);
                    console.log(idsucursal);
                    console.log(codsucursal);
                    console.log($("#precioTotalOrden").text());

                    total = dataSource.total() + 1;
                    var orden = codsucursal + "-" + total;
                    dataSource.add({
                        Costo: costo,
                        Entrada: "9c9166e0-ea31-11e5-a783-791e4009fe86",
                        Plato: "bf419680-eaf2-11e5-8a5e-4fbfba4606ef",
                        Users: "84b4feb6-ea22-11e5-9f71-1bcae6837736",
                        Orden: orden,
                        Sucursal: idsucursal,
                        Direccion: direccion,
                        Localizacion: {
                            longitude: longitude,
                            latitude: latitude
                        }
                    });
                    dataSource.one('change', function (e) { 
                        // app.mobileApp.navigate('#:back');
                        app.mobileApp.navigate('#components/georeferencia/index.html');
                        $("#modalSuccesOrden").kendoMobileModalView("open");
                    });
                    dataSource.sync();
                });


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