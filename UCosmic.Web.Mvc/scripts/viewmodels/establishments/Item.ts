﻿/// <reference path="../../jquery/jquery-1.8.d.ts" />
/// <reference path="../../ko/knockout-2.2.d.ts" />
/// <reference path="../../ko/knockout.mapping-2.0.d.ts" />
/// <reference path="../../ko/knockout.extensions.d.ts" />
/// <reference path="../../google/google.maps.d.ts" />
/// <reference path="../../google/ToolsOverlay.ts" />
/// <reference path="../../app/App.ts" />
/// <reference path="../../app/Routes.ts" />
/// <reference path="../Spinner.ts" />
/// <reference path="../places/ServerApiModel.ts" />
/// <reference path="../languages/ServerApiModel.ts" />
/// <reference path="ServerApiModel.d.ts" />
/// <reference path="Name.ts" />
/// <reference path="Url.ts" />


module ViewModels.Establishments {

    import gm = google.maps

    export class Item {

        // spinners
        namesSpinner: Spinner = new Spinner(new SpinnerOptions(0, true));
        urlsSpinner: Spinner = new Spinner(new SpinnerOptions(0, true));

        // fields
        id: number = 0;
        $genericAlertDialog: JQuery = undefined;

        constructor(id?: number) {

            // initialize the aggregate id
            this.id = id || 0;

            //#region Names

            // languages dropdowns
            ko.computed((): void => { // get languages from the server
                $.getJSON(App.Routes.WebApi.Languages.get())
                    .done((response: Languages.IServerApiModel[]): void => {
                        var emptyValue = new Languages.ServerApiModel(undefined,
                            '[Language Neutral]');
                        response.splice(0, 0, emptyValue); // add null option
                        this.languages(response); // set the options dropdown
                    });
            }).extend({ throttle: 1 });

            // set up names mapping
            this.namesMapping = {
                create: (options: any): Name => {
                    return new Name(options.data, this);
                }
            };

            this.canAddName = ko.computed((): bool => {
                return !this.namesSpinner.isVisible() && this.editingName() === 0 && this.id !== 0;
            });

            // request names
            ko.computed((): void => {
                if (this.id)
                    this.requestNames();

                else setTimeout(() => {
                    this.namesSpinner.stop();
                    this.addName();
                }, 0);
            }).extend({ throttle: 1 });

            //#endregion
            //#region URLs

            // set up URLs mapping
            this.urlsMapping = {
                create: (options: any): Url => {
                    return new Url(options.data, this);
                }
            };

            this.canAddUrl = ko.computed((): bool => {
                return !this.urlsSpinner.isVisible() && this.editingUrl() === 0 && this.id !== 0;
            });

            // request URLs
            ko.computed((): void => {
                if (this.id)
                    this.requestUrls();

                else setTimeout(() => {
                    this.urlsSpinner.stop();
                    this.addUrl();
                }, 0);
            }).extend({ throttle: 1 });

            //#endregion
            //#region Location

            this.toolsMarkerLat = ko.computed((): number => {
                return this.mapTools() && this.mapTools().markerLatLng()
                    ? this.mapTools().markerLatLng().lat() : null;
            });
            this.toolsMarkerLng = ko.computed((): number => {
                return this.mapTools() && this.mapTools().markerLatLng()
                    ? this.mapTools().markerLatLng().lng() : null;
            });
            this.$mapCanvas.subscribe((newValue: JQuery): void => {
                if (!this.map) this.initMap();
            });

            // continents section
            ko.computed((): void => {
                $.get(App.Routes.WebApi.Places.get({ isContinent: true }))
                .done((response: Places.IServerApiModel[]): void => {
                    this.continents(response);
                });
            })
            .extend({ throttle: 1 });
            this.continentName = ko.computed((): string => {
                var continentId = this.continentId();
                if (!continentId) return '[Unspecified]';
                var continent = Places.Utils.getPlaceById(this.continents(), continentId);
                return continent ? continent.officialName : '[Unknown]';
            });

            // countries dropdown
            this.countryOptionsCaption = ko.computed((): string => {
                return this.countries().length > 0 ? '[Unspecified]' : '[Loading...]';
            });
            ko.computed((): void => {
                $.get(App.Routes.WebApi.Places.get({ isCountry: true }))
                .done((response: Places.IServerApiModel[]): void => {
                    this.countries(response);
                    if (this._countryId) {
                        var countryId = this._countryId;
                        this._countryId = undefined;
                        this.countryId(countryId);
                    }
                });
            })
            .extend({ throttle: 1 });
            this.countryId.subscribe((newValue: number): void => {
                // when this value is set before the countries menu is loaded,
                // it will be reset to undefined.
                if (newValue && this.countries().length == 0)
                    this._countryId = newValue; // stash the value to set it after menu loads

                // scope the menu to the selected country
                if (newValue && this.countries().length > 0) {
                    var country: Places.IServerApiModel = Places.Utils
                        .getPlaceById(this.countries(), newValue);
                    if (country) {
                        this.map.fitBounds(Places.Utils.convertToLatLngBounds(country.box));

                        // cascade the continent
                        this.continentId(country.parentId);

                        // load admin1 options
                        this.admin1s([]);
                        var admin1Url = App.Routes.WebApi.Places.get({ isAdmin1: true, parentId: country.id });
                        this.admin1sLoading(true);
                        $.get(admin1Url)
                            .done((results: Places.IServerApiModel[]) => {
                                this.admin1s(results);
                                if (this._admin1Id) {
                                    var admin1Id = this._admin1Id;
                                    this._admin1Id = undefined;
                                    this.admin1Id(admin1Id);
                                }
                                this.admin1sLoading(false);
                            });
                    }

                }
                else if (!newValue && this.countries().length > 0) {
                    // when changing to unspecified, zoom out menu
                    this.map.setCenter(new gm.LatLng(0, 0));
                    this.map.setZoom(1);
                    this.continentId(null);
                }
            });

            // admin1 dropdown
            this.admin1OptionsCaption = ko.computed((): string => {
                return !this.admin1sLoading() ? '[Unspecified]' : '[Loading...]';
            }).extend({ throttle: 400 });
            this.showAdmin1Input = ko.computed((): bool => {
                return this.countryId() && (this.admin1s().length > 0 || this.admin1sLoading());
            });
            this.admin1Id.subscribe((newValue: number): void => {
                // when this value is set before the admin1 menu is loaded,
                // it will be reset to undefined.
                if (newValue && this.admin1s().length == 0)
                    this._admin1Id = newValue; // stash the value to set it after menu loads

                if (newValue && this.admin1s().length > 0) {
                    var admin1: Places.IServerApiModel = Places.Utils
                        .getPlaceById(this.admin1s(), newValue);
                    if (admin1) {
                        // load admin2 options
                        this.admin2s([]);
                        var admin2Url = App.Routes.WebApi.Places.get({ isAdmin2: true, parentId: admin1.id });
                        this.admin2sLoading(true);
                        $.get(admin2Url)
                            .done((results: Places.IServerApiModel[]) => {
                                this.admin2s(results);
                                if (this._admin2Id) {
                                    var admin2Id = this._admin2Id;
                                    this._admin2Id = undefined;
                                    this.admin2Id(admin2Id);
                                }
                                this.admin2sLoading(false);
                            });
                    }
                }
            });

            // admin2 dropdown
            this.admin2OptionsCaption = ko.computed((): string => {
                return !this.admin2sLoading() ? '[Unspecified]' : '[Loading...]';
            }).extend({ throttle: 400 });
            this.showAdmin2Input = ko.computed((): bool => {
                return this.admin1Id() && (this.admin2s().length > 0 || this.admin2sLoading());
            });
            this.admin2Id.subscribe((newValue: number): void => {
                // when this value is set before the admin2 menu is loaded,
                // it will be reset to undefined.
                if (newValue && this.admin2s().length == 0)
                    this._admin2Id = newValue; // stash the value to set it after menu loads

                if (newValue && this.admin2s().length > 0) {
                    var admin2: Places.IServerApiModel = Places.Utils
                        .getPlaceById(this.admin2s(), newValue);
                    if (admin2) {
                        // load admin3 options
                        this.admin3s([]);
                        var admin3Url = App.Routes.WebApi.Places.get({ isAdmin3: true, parentId: admin2.id });
                        this.admin3sLoading(true);
                        $.get(admin3Url)
                            .done((results: Places.IServerApiModel[]) => {
                                this.admin3s(results);
                                if (this._admin3Id) {
                                    var admin3Id = this._admin3Id;
                                    this._admin3Id = undefined;
                                    this.admin3Id(admin3Id);
                                }
                                this.admin3sLoading(false);
                            });
                    }
                }
            });

            // admin3 dropdown
            this.admin3OptionsCaption = ko.computed((): string => {
                return !this.admin3sLoading() ? '[Unspecified]' : '[Loading...]';
            }).extend({ throttle: 400 });
            this.showAdmin3Input = ko.computed((): bool => {
                return this.admin2Id() && (this.admin3s().length > 0 || this.admin3sLoading());
            });
            this.admin3Id.subscribe((newValue: number): void => {
                // when this value is set before the admin3 menu is loaded,
                // it will be reset to undefined.
                if (newValue && this.admin3s().length == 0)
                    this._admin3Id = newValue; // stash the value to set it after menu loads
            });

            //#endregion
        }

        //#region Names

        // observables, computeds, & variables
        languages: KnockoutObservableLanguageModelArray = ko.observableArray(); // select options
        names: KnockoutObservableEstablishmentNameModelArray = ko.observableArray();
        editingName: KnockoutObservableNumber = ko.observable(0);
        canAddName: KnockoutComputed;
        namesMapping: any;

        // methods
        requestNames(callback?: (response?: IServerNameApiModel[]) => void ): void {
            this.namesSpinner.start();
            $.get(App.Routes.WebApi.Establishments.Names.get(this.id))
                .done((response: IServerNameApiModel[]): void => {
                    this.receiveNames(response);
                    if (callback) callback(response);
                });
        }

        receiveNames(js: IServerNameApiModel[]): void {
            ko.mapping.fromJS(js || [], this.namesMapping, this.names);
            this.namesSpinner.stop();
            App.Obtruder.obtrude(document);
        }

        addName(): void {
            var apiModel = new ServerNameApiModel(this.id);
            if (this.names().length === 0)
                apiModel.isOfficialName = true;
            var newName = new Name(apiModel, this);
            this.names.unshift(newName);
            newName.showEditor();
            App.Obtruder.obtrude(document);
        }

        //#endregion
        //#region URLs

        // observables, computeds, & variables
        urls: KnockoutObservableEstablishmentUrlModelArray = ko.observableArray();
        editingUrl: KnockoutObservableNumber = ko.observable(0);
        canAddUrl: KnockoutComputed;
        urlsMapping: any;

        // methods
        requestUrls(callback?: (response?: IServerUrlApiModel[]) => void ): void {
            this.urlsSpinner.start();
            $.get(App.Routes.WebApi.Establishments.Urls.get(this.id))
                .done((response: IServerUrlApiModel[]): void => {
                    this.receiveUrls(response);
                    if (callback) callback(response);
                });
        }

        receiveUrls(js: IServerUrlApiModel[]): void {
            ko.mapping.fromJS(js || [], this.urlsMapping, this.urls);
            this.urlsSpinner.stop();
            App.Obtruder.obtrude(document);
        }

        addUrl(): void {
            var apiModel = new ServerUrlApiModel(this.id);
            if (this.urls().length === 0)
                apiModel.isOfficialUrl = true;
            var newUrl = new Url(apiModel, this);
            this.urls.unshift(newUrl);
            newUrl.showEditor();
            App.Obtruder.obtrude(document);
        }

        //#endregion
        //#region Location

        map: google.maps.Map;
        mapTools: KnockoutObservableGoogleMapsToolsOverlay = ko.observable();
        toolsMarkerLat: KnockoutComputed;
        toolsMarkerLng: KnockoutComputed;
        $mapCanvas: KnockoutObservableJQuery = ko.observable();
        continents: KnockoutObservablePlaceModelArray = ko.observableArray();
        continentId: KnockoutObservableNumber = ko.observable();
        continentName: KnockoutComputed;
        countries: KnockoutObservablePlaceModelArray = ko.observableArray();
        countryId: KnockoutObservableNumber = ko.observable();
        countryOptionsCaption: KnockoutComputed;
        private _countryId: number;
        admin1s: KnockoutObservablePlaceModelArray = ko.observableArray();
        admin1Id: KnockoutObservableNumber = ko.observable();
        admin1OptionsCaption: KnockoutComputed;
        admin1sLoading: KnockoutObservableBool = ko.observable(false);
        private _admin1Id: number;
        showAdmin1Input: KnockoutComputed;
        admin2s: KnockoutObservablePlaceModelArray = ko.observableArray();
        admin2Id: KnockoutObservableNumber = ko.observable();
        admin2OptionsCaption: KnockoutComputed;
        admin2sLoading: KnockoutObservableBool = ko.observable(false);
        private _admin2Id: number;
        showAdmin2Input: KnockoutComputed;
        admin3s: KnockoutObservablePlaceModelArray = ko.observableArray();
        admin3Id: KnockoutObservableNumber = ko.observable();
        admin3OptionsCaption: KnockoutComputed;
        admin3sLoading: KnockoutObservableBool = ko.observable(false);
        private _admin3Id: number;
        showAdmin3Input: KnockoutComputed;
        places: KnockoutObservablePlaceModelArray = ko.observableArray();

        initMap(): void {
            var mapOptions: gm.MapOptions = {
                mapTypeId: gm.MapTypeId.ROADMAP,
                center: new gm.LatLng(0, 0),
                zoom: 1,
                draggable: true,
                scrollwheel: false
            };
            this.map = new gm.Map(this.$mapCanvas()[0], mapOptions);
            gm.event.addListenerOnce(this.map, 'idle', (): void => {
                this.mapTools(new App.GoogleMaps.ToolsOverlay(this.map));
            });

            if (this.id)
                $.get(App.Routes.WebApi.Establishments.Locations.get(this.id))
                .done((response: IServerLocationApiModel): void => {
                    gm.event.addListenerOnce(this.map, 'idle', (): void => {

                        // zoom map to reveal location
                        if (response.googleMapZoomLevel)
                            this.map.setZoom(response.googleMapZoomLevel);
                        else if (response.box.hasValue)
                            this.map.fitBounds(Places.Utils.convertToLatLngBounds(response.box));

                        // place marker and set map center
                        if (response.center.hasValue) {
                            var latLng = Places.Utils.convertToLatLng(response.center);
                            this.mapTools().placeMarker(latLng);
                            this.map.setCenter(latLng);
                        }
                    });

                    // make places array observable
                    this.places(response.places);

                    // populate continent menu
                    var continent: Places.IServerApiModel = Places.Utils.getContinent(response.places);
                    if (continent) this.continentId(continent.id);

                    // populate country menu
                    var country: Places.IServerApiModel = Places.Utils.getCountry(response.places);
                    if (country) this.countryId(country.id);

                    // populate admin1 menu
                    var admin1: Places.IServerApiModel = Places.Utils.getAdmin1(response.places);
                    if (admin1) this.admin1Id(admin1.id);

                    // populate admin2 menu
                    var admin2: Places.IServerApiModel = Places.Utils.getAdmin2(response.places);
                    if (admin2) this.admin2Id(admin2.id);

                    // populate admin3 menu
                    var admin3: Places.IServerApiModel = Places.Utils.getAdmin3(response.places);
                    if (admin3) this.admin3Id(admin3.id);
                })
        }

        //#endregion
    }
}
