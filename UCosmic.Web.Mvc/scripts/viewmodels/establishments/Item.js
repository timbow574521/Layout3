var ViewModels;
(function (ViewModels) {
    (function (Establishments) {
        var gm = google.maps;
        var Item = (function () {
            function Item(id) {
                var _this = this;
                this.namesSpinner = new ViewModels.Spinner(new ViewModels.SpinnerOptions(0, true));
                this.urlsSpinner = new ViewModels.Spinner(new ViewModels.SpinnerOptions(0, true));
                this.id = 0;
                this.$genericAlertDialog = undefined;
                this.languages = ko.observableArray();
                this.names = ko.observableArray();
                this.editingName = ko.observable(0);
                this.urls = ko.observableArray();
                this.editingUrl = ko.observable(0);
                this.mapTools = ko.observable();
                this.$mapCanvas = ko.observable();
                this.continents = ko.observableArray();
                this.continentId = ko.observable();
                this.countries = ko.observableArray();
                this.countryId = ko.observable();
                this.admin1s = ko.observableArray();
                this.admin1Id = ko.observable();
                this.admin1sLoading = ko.observable(false);
                this.admin2s = ko.observableArray();
                this.admin2Id = ko.observable();
                this.admin2sLoading = ko.observable(false);
                this.admin3s = ko.observableArray();
                this.admin3Id = ko.observable();
                this.admin3sLoading = ko.observable(false);
                this.places = ko.observableArray();
                this.subAdmins = ko.observableArray();
                this.id = id || 0;
                ko.computed(function () {
                    $.getJSON(App.Routes.WebApi.Languages.get()).done(function (response) {
                        var emptyValue = new ViewModels.Languages.ServerApiModel(undefined, '[Language Neutral]');
                        response.splice(0, 0, emptyValue);
                        _this.languages(response);
                    });
                }).extend({
                    throttle: 1
                });
                this.namesMapping = {
                    create: function (options) {
                        return new Establishments.Name(options.data, _this);
                    }
                };
                this.canAddName = ko.computed(function () {
                    return !_this.namesSpinner.isVisible() && _this.editingName() === 0 && _this.id !== 0;
                });
                ko.computed(function () {
                    if(_this.id) {
                        _this.requestNames();
                    } else {
                        setTimeout(function () {
                            _this.namesSpinner.stop();
                            _this.addName();
                        }, 0);
                    }
                }).extend({
                    throttle: 1
                });
                this.urlsMapping = {
                    create: function (options) {
                        return new Establishments.Url(options.data, _this);
                    }
                };
                this.canAddUrl = ko.computed(function () {
                    return !_this.urlsSpinner.isVisible() && _this.editingUrl() === 0 && _this.id !== 0;
                });
                ko.computed(function () {
                    if(_this.id) {
                        _this.requestUrls();
                    } else {
                        setTimeout(function () {
                            _this.urlsSpinner.stop();
                            _this.addUrl();
                        }, 0);
                    }
                }).extend({
                    throttle: 1
                });
                this.toolsMarkerLat = ko.computed(function () {
                    return _this.mapTools() && _this.mapTools().markerLatLng() ? _this.mapTools().markerLatLng().lat() : null;
                });
                this.toolsMarkerLng = ko.computed(function () {
                    return _this.mapTools() && _this.mapTools().markerLatLng() ? _this.mapTools().markerLatLng().lng() : null;
                });
                this.$mapCanvas.subscribe(function (newValue) {
                    if(!_this.map) {
                        _this.initMap();
                    }
                });
                ko.computed(function () {
                    $.get(App.Routes.WebApi.Places.get({
                        isContinent: true
                    })).done(function (response) {
                        _this.continents(response);
                    });
                }).extend({
                    throttle: 1
                });
                this.continentName = ko.computed(function () {
                    var continentId = _this.continentId();
                    if(!continentId) {
                        return '[Unspecified]';
                    }
                    var continent = ViewModels.Places.Utils.getPlaceById(_this.continents(), continentId);
                    return continent ? continent.officialName : '[Unknown]';
                });
                this.countryOptionsCaption = ko.computed(function () {
                    return _this.countries().length > 0 ? '[Unspecified]' : '[Loading...]';
                });
                ko.computed(function () {
                    $.get(App.Routes.WebApi.Places.get({
                        isCountry: true
                    })).done(function (response) {
                        _this.countries(response);
                        if(_this._countryId) {
                            var countryId = _this._countryId;
                            _this._countryId = undefined;
                            _this.countryId(countryId);
                        }
                    });
                }).extend({
                    throttle: 1
                });
                this.countryId.subscribe(function (newValue) {
                    if(newValue && _this.countries().length == 0) {
                        _this._countryId = newValue;
                    }
                    if(newValue && _this.countries().length > 0) {
                        var country = ViewModels.Places.Utils.getPlaceById(_this.countries(), newValue);
                        if(country) {
                            _this.map.fitBounds(ViewModels.Places.Utils.convertToLatLngBounds(country.box));
                            _this.continentId(country.parentId);
                            _this.admin1s([]);
                            var admin1Url = App.Routes.WebApi.Places.get({
                                isAdmin1: true,
                                parentId: country.id
                            });
                            _this.admin1sLoading(true);
                            $.get(admin1Url).done(function (results) {
                                _this.admin1s(results);
                                if(_this._admin1Id) {
                                    var admin1Id = _this._admin1Id;
                                    _this._admin1Id = undefined;
                                    _this.admin1Id(admin1Id);
                                }
                                _this.admin1sLoading(false);
                            });
                        }
                    } else {
                        if(!newValue && _this.countries().length > 0) {
                            _this.map.setCenter(new gm.LatLng(0, 0));
                            _this.map.setZoom(1);
                            _this.continentId(null);
                        }
                    }
                });
                this.admin1OptionsCaption = ko.computed(function () {
                    return !_this.admin1sLoading() ? '[Unspecified]' : '[Loading...]';
                }).extend({
                    throttle: 400
                });
                this.showAdmin1Input = ko.computed(function () {
                    return _this.countryId() && (_this.admin1s().length > 0 || _this.admin1sLoading());
                });
                this.admin1Id.subscribe(function (newValue) {
                    if(newValue && _this.admin1s().length == 0) {
                        _this._admin1Id = newValue;
                    }
                    if(newValue && _this.admin1s().length > 0) {
                        var admin1 = ViewModels.Places.Utils.getPlaceById(_this.admin1s(), newValue);
                        if(admin1) {
                            _this.admin2s([]);
                            var admin2Url = App.Routes.WebApi.Places.get({
                                isAdmin2: true,
                                parentId: admin1.id
                            });
                            _this.admin2sLoading(true);
                            $.get(admin2Url).done(function (results) {
                                _this.admin2s(results);
                                if(_this._admin2Id) {
                                    var admin2Id = _this._admin2Id;
                                    _this._admin2Id = undefined;
                                    _this.admin2Id(admin2Id);
                                }
                                _this.admin2sLoading(false);
                            });
                        }
                    }
                });
                this.admin2OptionsCaption = ko.computed(function () {
                    return !_this.admin2sLoading() ? '[Unspecified]' : '[Loading...]';
                }).extend({
                    throttle: 400
                });
                this.showAdmin2Input = ko.computed(function () {
                    return _this.admin1Id() && (_this.admin2s().length > 0 || _this.admin2sLoading());
                });
                this.admin2Id.subscribe(function (newValue) {
                    if(newValue && _this.admin2s().length == 0) {
                        _this._admin2Id = newValue;
                    }
                    if(newValue && _this.admin2s().length > 0) {
                        var admin2 = ViewModels.Places.Utils.getPlaceById(_this.admin2s(), newValue);
                        if(admin2) {
                            _this.admin3s([]);
                            var admin3Url = App.Routes.WebApi.Places.get({
                                isAdmin3: true,
                                parentId: admin2.id
                            });
                            _this.admin3sLoading(true);
                            $.get(admin3Url).done(function (results) {
                                _this.admin3s(results);
                                if(_this._admin3Id) {
                                    var admin3Id = _this._admin3Id;
                                    _this._admin3Id = undefined;
                                    _this.admin3Id(admin3Id);
                                }
                                _this.admin3sLoading(false);
                            });
                        }
                    }
                });
                this.admin3OptionsCaption = ko.computed(function () {
                    return !_this.admin3sLoading() ? '[Unspecified]' : '[Loading...]';
                }).extend({
                    throttle: 400
                });
                this.showAdmin3Input = ko.computed(function () {
                    return _this.admin2Id() && (_this.admin3s().length > 0 || _this.admin3sLoading());
                });
                this.admin3Id.subscribe(function (newValue) {
                    if(newValue && _this.admin3s().length == 0) {
                        _this._admin3Id = newValue;
                    }
                });
            }
            Item.prototype.requestNames = function (callback) {
                var _this = this;
                this.namesSpinner.start();
                $.get(App.Routes.WebApi.Establishments.Names.get(this.id)).done(function (response) {
                    _this.receiveNames(response);
                    if(callback) {
                        callback(response);
                    }
                });
            };
            Item.prototype.receiveNames = function (js) {
                ko.mapping.fromJS(js || [], this.namesMapping, this.names);
                this.namesSpinner.stop();
                App.Obtruder.obtrude(document);
            };
            Item.prototype.addName = function () {
                var apiModel = new Establishments.ServerNameApiModel(this.id);
                if(this.names().length === 0) {
                    apiModel.isOfficialName = true;
                }
                var newName = new Establishments.Name(apiModel, this);
                this.names.unshift(newName);
                newName.showEditor();
                App.Obtruder.obtrude(document);
            };
            Item.prototype.requestUrls = function (callback) {
                var _this = this;
                this.urlsSpinner.start();
                $.get(App.Routes.WebApi.Establishments.Urls.get(this.id)).done(function (response) {
                    _this.receiveUrls(response);
                    if(callback) {
                        callback(response);
                    }
                });
            };
            Item.prototype.receiveUrls = function (js) {
                ko.mapping.fromJS(js || [], this.urlsMapping, this.urls);
                this.urlsSpinner.stop();
                App.Obtruder.obtrude(document);
            };
            Item.prototype.addUrl = function () {
                var apiModel = new Establishments.ServerUrlApiModel(this.id);
                if(this.urls().length === 0) {
                    apiModel.isOfficialUrl = true;
                }
                var newUrl = new Establishments.Url(apiModel, this);
                this.urls.unshift(newUrl);
                newUrl.showEditor();
                App.Obtruder.obtrude(document);
            };
            Item.prototype.initMap = function () {
                var _this = this;
                var mapOptions = {
                    mapTypeId: gm.MapTypeId.ROADMAP,
                    center: new gm.LatLng(0, 0),
                    zoom: 1,
                    draggable: true,
                    scrollwheel: false
                };
                this.map = new gm.Map(this.$mapCanvas()[0], mapOptions);
                gm.event.addListenerOnce(this.map, 'idle', function () {
                    _this.mapTools(new App.GoogleMaps.ToolsOverlay(_this.map));
                });
                if(this.id) {
                    $.get(App.Routes.WebApi.Establishments.Locations.get(this.id)).done(function (response) {
                        gm.event.addListenerOnce(_this.map, 'idle', function () {
                            if(response.googleMapZoomLevel) {
                                _this.map.setZoom(response.googleMapZoomLevel);
                            } else {
                                if(response.box.hasValue) {
                                    _this.map.fitBounds(ViewModels.Places.Utils.convertToLatLngBounds(response.box));
                                }
                            }
                            if(response.center.hasValue) {
                                var latLng = ViewModels.Places.Utils.convertToLatLng(response.center);
                                _this.mapTools().placeMarker(latLng);
                                _this.map.setCenter(latLng);
                            }
                        });
                        _this.places(response.places);
                        var continent = ViewModels.Places.Utils.getContinent(response.places);
                        if(continent) {
                            _this.continentId(continent.id);
                        }
                        var country = ViewModels.Places.Utils.getCountry(response.places);
                        if(country) {
                            _this.countryId(country.id);
                        }
                        var admin1 = ViewModels.Places.Utils.getAdmin1(response.places);
                        if(admin1) {
                            _this.admin1Id(admin1.id);
                        }
                        var admin2 = ViewModels.Places.Utils.getAdmin2(response.places);
                        if(admin2) {
                            _this.admin2Id(admin2.id);
                        }
                        var admin3 = ViewModels.Places.Utils.getAdmin3(response.places);
                        if(admin3) {
                            _this.admin3Id(admin3.id);
                        }
                        var subAdmins = ViewModels.Places.Utils.getSubAdmins(response.places);
                        if(subAdmins && subAdmins.length) {
                            _this.subAdmins(subAdmins);
                        }
                    });
                }
            };
            Item.prototype.changePlaceInLocation = function () {
                this.subAdmins([]);
            };
            return Item;
        })();
        Establishments.Item = Item;        
    })(ViewModels.Establishments || (ViewModels.Establishments = {}));
    var Establishments = ViewModels.Establishments;
})(ViewModels || (ViewModels = {}));
