// ==UserScript==
// @name         Wegstatus polyline-selector
// @namespace    https://wegstatus.nl
// @version      0.2.0
// @description  Adds a link in the segment-panel to grab the polyline.
// @author       Xander "Xanland" Hoogland
// @include      /^https:\/\/(www|beta)\.waze\.com\/(?!user\/)(.{2,6}\/)?editor([^\/]?.*)?$/
// @supportURL   https://github.com/xhoogland/wegstatus-polyline-selector/issues
// ==/UserScript==

(function() {
    const copyText = 'Click to copy';
    $('head').append('<style type="text/css">#grab-polyline { background-image: url(https://www.wegstatus.nl/favicon-16x16.png); background-repeat: no-repeat; background-size: 20px 20px; background-position-x: 32%; background-position-y: 40%; }</style>');

    function getLatLonOfComponent (component) {
        const x = component.clone().transform(W.map.getProjection(),'EPSG:4326').toLonLat().lat;
        const y = component.clone().transform(W.map.getProjection(),'EPSG:4326').toLonLat().lon;

        return x + ' ' + y;
    }

    const segmentPanelObserver = new MutationObserver(function (segmentPanel) {
        const selectedItemsCount = W.selectionManager.getSelectedFeatures().length;
        if (selectedItemsCount == 1) {
            $('#segment-edit-general > div.form-group.more-actions').append('<div class="edit-house-numbers-btn-wrapper"><button class="action-button waze-btn waze-btn-white" id="grab-polyline" title="' + copyText + '">Grab polyline</button><textarea id="grab-polyline-textarea" style="display:none"></textarea></div>');
            $('#grab-polyline').tooltip({ trigger: 'hover' });
            addClickHanderForGrabPolylineButton();
        }
        else {
            $('#grab-polyline').parent().remove();
        }
    });

    setTimeout(function () {
        segmentPanelObserver.observe(document.querySelector('#edit-panel > div'), { childList: true });
    }, 440);

    function addClickHanderForGrabPolylineButton () {
        $('#grab-polyline').click(function () {
            const feature = W.selectionManager.getSelectedFeatures()[0];
            const attributes = feature.model.attributes;
            let components = feature.geometry.components;
            let polyline = '';
            if(attributes.fwdDirection === false && attributes.revDirection === true)
                components.reverse();
            components.forEach(function (component) {
                polyline = polyline + getLatLonOfComponent(component) + ' ';
            });
            $('#grab-polyline-textarea').val(polyline.trim());
            var copyText = document.querySelector("#grab-polyline-textarea");
            $('#grab-polyline-textarea').show();
            copyText.select();
            document.execCommand("copy");
            $('#grab-polyline-textarea').hide();
            $('#grab-polyline').next(".tooltip").find(".tooltip-inner").text('Polyline copied!');
            setTimeout(function () {
                $('#grab-polyline').next(".tooltip").find(".tooltip-inner").text('Click to copy');
            }, 3000);
        });
    }
})();
