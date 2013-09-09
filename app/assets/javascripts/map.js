
function Map(mapId, options) {
    this.mapId = mapId;
    this.options = $.extend({}, options, this.DEFAULT_OPTIONS);
    this.markerMap = {};
    this.eventSource = null;
    this.map = this.createMap(this.mapId, this.options);
}

Map.prototype = {
    DEFAULT_OPTIONS: {
        zoom: 6,
        latitude: 34.649388888,
        longitude: 135.001472222,
        requestUrl: "/markers",
        mapTypeId: google.maps.MapTypeId.ROADMAP
    },

    createMap: function(mapId, options) {
        var map = new google.maps.Map(document.getElementById(mapId), {
            zoom: options.zoom,
            center: new google.maps.LatLng(options.latitude, options.longitude),
            mapTypeId: this.options.mapTypeId
        });

        var self = this;
        var mapChanged = function(event) { self.mapChanged(event); }
        google.maps.event.addListener(map, "dragend", mapChanged);
        google.maps.event.addListener(map, "zoom_changed", mapChanged);
        google.maps.event.addListenerOnce(map, "bounds_changed", mapChanged);

        return map;
    },

    mapChanged: function(event) {
        this.cancelRequest();
        this.removeOutsideMarkers();
        this.requestMarkers();
    },

    cancelRequest: function() {
        if(this.eventSource) {
            this.eventSource.close();
            this.eventSource = null;
        }
    },

    removeOutsideMarkers: function() {
        for(var key in this.markerMap) {
            if(!this.isInside(this.markerMap[key])) {
                this.markerMap[key].setMap(null);
                delete this.markerMap[key];
            }
        }
    },

    isInside: function(marker) {
        return this.map.getBounds().contains(marker.getPosition());
    },

    requestMarkers: function() {
        var self = this;
        this.eventSource = new EventSource(this.createRequestUrl());

        this.eventSource.addEventListener("marker", function(event) {
            self.addMarker(JSON.parse(event.data));
        });

        this.eventSource.addEventListener("done", function(event) {
            self.eventSource.close();
            self.eventSource = null;
        });
    },

    createRequestUrl: function() {
        var bounds = this.map.getBounds();
        var url = this.options.requestUrl;
        url += "?north=" + bounds.getNorthEast().lat();
        url += "&east=" + bounds.getNorthEast().lng();
        url += "&south=" + bounds.getSouthWest().lat();
        url += "&west=" + bounds.getSouthWest().lng();
        url += "&excludes=" + Object.keys(this.markerMap);
        return url;
    },

    addMarker: function(data) {
        if(this.markerMap[data.id]) {
            return;
        }

        var position = new google.maps.LatLng(data.latitude, data.longitude);
        var marker = new google.maps.Marker({map: this.map, position: position, title: data.name});
        this.markerMap[data.id] = marker;
    }
}

