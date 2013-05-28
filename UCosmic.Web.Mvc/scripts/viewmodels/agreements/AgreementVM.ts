/// <reference path="../../typings/knockout.postbox/knockout-postbox.d.ts" />
/// <reference path="../../jquery/jquery-1.8.d.ts" />
/// <reference path="../../ko/knockout-2.2.d.ts" />
/// <reference path="../../ko/knockout.mapping-2.0.d.ts" />
/// <reference path="../../ko/knockout.extensions.d.ts" />
/// <reference path="../../app/App.ts" />
/// <reference path="../../app/SideSwiper.ts" />
/// <reference path="../../app/Routes.ts" />
/// <reference path="../../sammy/sammyjs-0.7.d.ts" />

import SearchResultModule = module('../amd-modules/Establishments/SearchResult');
//import app = module('../amd-modules/app/app');
import SearchModule = module('../amd-modules/Establishments/Search');
var Search = SearchModule.Search;
var SearchResult = SearchResultModule.SearchResult;
var InstitutionalAgreementParticipantModel = SearchModule.InstitutionalAgreementParticipantModel;


//function InstitutionalAgreementParticipantModel2(js) {
//    var self = this;
//    ko.mapping.fromJS(js, {}, self);

//    self.isNotOwner = ko.computed(function () {
//        return !self.isOwner();
//    });

//    self.participantEl = undefined;
//}

export class InstitutionalAgreementEditModel {
    constructor(public initDefaultPageRoute?: bool = true) {

        this.populateParticipants();
        this.setupSearchVM();
        //this._setupSammy();
        this.isBound(true);
        this.removeParticipant = <() => bool > this.removeParticipant.bind(this);
    }


    isBound = ko.observable();

    back = function () {
        history.back();
    };

    sideSwiper = new App.SideSwiper({
        speed: '',
        frameWidth: 970,
        root: '[data-current-module=agreements]'
    });

    // participants
    x = ko.observable().publishOn("test");
    participants = ko.observableArray().syncWith("participants");
    //participants = ko.observableArray();
    owner = new Search(false);
    tenantDomain = "uc.edu"; //$('#tenancy_domain').val();

    populateParticipants(): void {
        var homeParticipant = new InstitutionalAgreementParticipantModel({
            isOwner: true,
            establishment: new SearchResult({
                id: 1,
                officialName: 'University of Cincinnati',
                translatedName: 'University of Cincinnati',
                officialUrl: 'www.uc.edu',
                countryName: 'United States',
                countryCode: 'asdf',
                uCosmicCode: 'asdf',
                ceebCode: 'asdf'
            }, this.owner)
        });
        if (this.tenantDomain === 'usf.edu') {
            homeParticipant.establishment = new SearchResult({
                id: 1,
                officialName: 'University of South Florida',
                translatedName: 'University of South Florida',
                officialUrl: 'www.usf.edu',
                countryName: 'United States',
                countryCode: 'asdf',
                uCosmicCode: 'asdf',
                ceebCode: 'asdf'
            }, this.owner)
        }
        if (this.tenantDomain === 'lehigh.edu') {
            homeParticipant.establishment = new SearchResult({
                id: 1,
                officialName: 'Lehigh University',
                translatedName: 'Lehigh University',
                officialUrl: 'www.lehigh.edu',
                countryName: 'United States',
                countryCode: 'asdf',
                uCosmicCode: 'asdf',
                ceebCode: 'asdf'
            }, this.owner);
        }
        if (this.tenantDomain === 'umn.edu') {
            homeParticipant.establishment = new SearchResult({
                id: 1,
                officialName: 'University of Minnesota',
                translatedName: 'University of Minnesota',
                officialUrl: 'www.umn.edu',
                countryName: 'United States',
                countryCode: 'asdf',
                uCosmicCode: 'asdf',
                ceebCode: 'asdf'
            }, this.owner)
        }
        if (this.tenantDomain === 'uc.edu') {
            homeParticipant.establishment = new SearchResult({
                id: 1,
                officialName: 'University of Cincinnati',
                translatedName: 'University of Cincinnati',
                officialUrl: 'www.uc.edu',
                countryName: 'United States',
                countryCode: 'asdf',
                uCosmicCode: 'asdf',
                ceebCode: 'asdf'
            }, this. owner)
        }
        if (this.tenantDomain === 'suny.edu') {
            homeParticipant.establishment = new SearchResult({
                id: 1,
                officialName: 'State University of New York',
                translatedName: 'State University of New York',
                officialUrl: 'www.suny.edu',
                countryName: 'United States',
                countryCode: 'asdf',
                uCosmicCode: 'asdf',
                ceebCode: 'asdf'
            }, this.owner)
        }
        this.participants.push(homeParticipant);
    }
    


    setupSearchVM(): void {
        // nest the establishment search viewmodel
        var establishmentSearchViewModel = new Search()
        //establishmentSearchViewModel.sammy = undefined;

        // override next & prev page clicks
        establishmentSearchViewModel.nextPage = function () {
            if (establishmentSearchViewModel.nextEnabled()) {
                var pageNumber = parseInt(establishmentSearchViewModel.pageNumber()) + 1;
                location.hash = '/participants/add/page/' + pageNumber;
            }
        };
        establishmentSearchViewModel.prevPage = function () {
            if (establishmentSearchViewModel.prevEnabled()) {
                history.back();
            }
        };

       
        establishmentSearchViewModel.items.subscribe(function (newValue) {
            if (newValue && newValue.length) {
                for (var i = 0; i < newValue.length; i++) {
                    if (newValue[i].clickAction !== this.addParticipant) {
                        newValue[i].clickAction = this.addParticipant;
                    }
                }
            }
        });
    }

     
    removeParticipant(establishmentResultViewModel, e): bool {
        if (confirm('Are you sure you want to remove "' +
            establishmentResultViewModel.translatedName() +
            '" as a participant from this agreement?')) {
            var self = this;
            self.participants.remove(function (item) {
                if (item.establishment.id() === establishmentResultViewModel.id()) {
                    $(item.participantEl).slideUp('fast', function () {
                        self.participants.remove(item);
                    });
                }
                return false;
            });
        }
        e.preventDefault();
        e.stopPropagation();
        return false;
    };
        // override establishment item click to add as participant
    addParticipant(establishmentResultViewModel): void {
        $("#allParticipants").fadeOut(500, function () {
            $("#estSearch").fadeIn(500);
        });

        sessionStorage.setItem("Agreement", "1");
    };
       



    //sammy: Sammy.Application = Sammy();
    //sammyBeforeRoute: any = /\#\/page\/(.*)\//;
    //sammyGetPageRoute: any = '#/page/:pageNumber/';
    //sammyDefaultPageRoute: any = '/agreements[\/]?';

    //private _setupSammy(): void {
    //    var self = this;
    //    self.sammy.before(self.sammyBeforeRoute, function () {
    //        self.beforePage(this);
    //    });

    //    self.sammy.get(self.sammyGetPageRoute, function () {
    //        self.getPage(this);
    //    });

    //    if (self.initDefaultPageRoute) {
    //        // match /Shared or /Shared/
    //        self.sammy.get(self.sammyDefaultPageRoute, function () {
    //            self.initPageHash(this);
    //        });
    //    }
    //}
    trail: KnockoutObservableStringArray = ko.observableArray([]);
    swipeCallback(): void {
    }
    $itemsPage: JQuery = undefined;
    nextForceDisabled: KnockoutObservableBool = ko.observable(false);
    prevForceDisabled: KnockoutObservableBool = ko.observable(false);
    pageNumber: KnockoutObservableNumber = ko.observable();
    lockAnimation(): void {
        this.nextForceDisabled(true);
        this.prevForceDisabled(true);
    }
    unlockAnimation(): void {
        this.nextForceDisabled(false);
        this.prevForceDisabled(false);
    }

    //getPage(sammyContext: Sammy.EventContext): void {
    //    var trail = this.trail(),
    //        clone;
    //    if (trail.length > 0 && trail[trail.length - 1] === sammyContext.path) return;
    //    if (trail.length > 1 && trail[trail.length - 2] === sammyContext.path) {
    //        // swipe backward
    //        trail.pop();
    //        this.swipeCallback = (): void => {
    //            clone = this.$itemsPage.clone(true)
    //                .removeAttr('data-bind').data('bind', undefined).removeAttr('id');
    //            clone.appendTo(this.$itemsPage.parent());
    //            this.$itemsPage.attr('data-side-swiper', 'off').hide();
    //            this.lockAnimation();
    //            $(window).scrollTop(0);
    //            this.sideSwiper.prev(1, (): void => {
    //                this.$itemsPage.siblings().remove();
    //                this.unlockAnimation();
    //            });
    //        };
    //        return;
    //    } else if (trail.length > 0) {
    //        // swipe forward
    //        this.swipeCallback = (): void => {
    //            clone = this.$itemsPage.clone(true)
    //                .removeAttr('data-bind').data('bind', undefined).removeAttr('id');
    //            clone.insertBefore(this.$itemsPage);
    //            this.$itemsPage.attr('data-side-swiper', 'off').hide();
    //            this.lockAnimation();
    //            $(window).scrollTop(0);
    //            this.sideSwiper.next(1, (): void => {
    //                this.unlockAnimation();
    //            });
    //        };
    //    }
    //    trail.push(sammyContext.path);
    //}

    //beforePage(sammyContext: Sammy.EventContext): bool {
    //    if (this.nextForceDisabled() || this.prevForceDisabled())
    //        return false;

    //    var pageNumber = sammyContext.params['pageNumber'];

    //    // make sure the viewmodel pagenumber is in sync with the route
    //    if (pageNumber && parseInt(pageNumber) !== parseInt(this.pageNumber()))
    //        this.pageNumber(parseInt(pageNumber));
    //    return true;
    //}

    //initPageHash(sammyContext: Sammy.EventContext): void {
    //    sammyContext.app.setLocation('#/page/1/');
    //}

    //setLocation(): void {
    //    var location = '#/page/' + this.pageNumber() + '/';
    //    if (this.sammy.getLocation() !== location)
    //        this.sammy.setLocation(location);
    //}

}

//export function InstitutionalAgreementEditModel2() {
//    var self = this;

//    self.isBound = ko.observable();

//    self.back = function () {
//        history.back();
//    };

//    self.sideSwiper = new App.SideSwiper({
//        speed: '',
//        frameWidth: 970,
//        root: '[data-current-module=agreements]'
//    });

//    // participants
//    self.participants = ko.observableArray();

//    // HACK ALERT: make this work for demo purposes. Customize home participant based on cookie.
//    var owner = new Search(false);
//    var tenantDomain = "uc.edu"; //$('#tenancy_domain').val();
//    var homeParticipant = new InstitutionalAgreementParticipantModel({  
//        isOwner: true,
//        establishment: new SearchResult({
//            id: 1,
//            officialName: 'University of Cincinnati',
//            translatedName: 'University of Cincinnati',
//            officialUrl: 'www.uc.edu',
//            countryName: 'United States',
//            countryCode: 'asdf',
//            uCosmicCode: 'asdf',
//            ceebCode: 'asdf'
//        }, owner)
//    });
//    if(tenantDomain === 'usf.edu') {
//        homeParticipant.establishment = new SearchResult({
//            id: 1,
//            officialName: 'University of South Florida',
//            translatedName: 'University of South Florida',
//            officialUrl: 'www.usf.edu',
//            countryName: 'United States',
//            countryCode: 'asdf',
//            uCosmicCode: 'asdf',
//            ceebCode: 'asdf'
//        } , owner)
//    }
//        if (tenantDomain === 'lehigh.edu') {
//            homeParticipant.establishment = new SearchResult({
//                id: 1,
//                officialName: 'Lehigh University',
//                translatedName: 'Lehigh University',
//                officialUrl: 'www.lehigh.edu',
//                countryName: 'United States',
//                countryCode: 'asdf',
//                uCosmicCode: 'asdf',
//                ceebCode: 'asdf'
//            }, owner);
//        }
//        if (tenantDomain === 'umn.edu') {
//            homeParticipant.establishment = new SearchResult({
//                id: 1,
//                officialName: 'University of Minnesota',
//                translatedName: 'University of Minnesota',
//                officialUrl: 'www.umn.edu',
//                countryName: 'United States',
//                countryCode: 'asdf',
//                uCosmicCode: 'asdf',
//                ceebCode: 'asdf'
//            }, owner)
//        }
//        if (tenantDomain === 'uc.edu') {
//            homeParticipant.establishment = new SearchResult({
//                id: 1,
//                officialName: 'University of Cincinnati',
//                translatedName: 'University of Cincinnati',
//                officialUrl: 'www.uc.edu',
//                countryName: 'United States',
//                countryCode: 'asdf',
//                uCosmicCode: 'asdf',
//                ceebCode: 'asdf'
//            }, owner)
//        }
//        if (tenantDomain === 'suny.edu') {
//            homeParticipant.establishment = new SearchResult({
//                id: 1,
//                officialName: 'State University of New York',
//                translatedName: 'State University of New York',
//                officialUrl: 'www.suny.edu',
//                countryName: 'United States',
//                countryCode: 'asdf',
//                uCosmicCode: 'asdf',
//                ceebCode: 'asdf'
//            }, owner)
//        }
//        //var partnerParticipant1 = new InstitutionalAgreementParticipantModel({
//        //    isOwner: false,
//        //    establishment: new ViewModels.Establishments.SearchResult({
//        //        id: 2,
//        //        officialName: 'Universit�t zu K�ln',
//        //        translatedName: 'University of Cologne',
//        //        websiteUrl: 'www.uni-koeln.de',
//        //        countryName: 'Germany'
//        //    })
//        //});
//        self.participants.push(homeParticipant);
//        //self.participants.push(partnerParticipant1);

//        // nest the establishment search viewmodel
//        self.establishmentSearchViewModel = new Search();

//        // manage routing in this viewmodel, not the nested one
//        self.establishmentSearchViewModel.sammy = undefined;

//        // override next & prev page clicks
//        self.establishmentSearchViewModel.nextPage = function () {
//            if (self.establishmentSearchViewModel.nextEnabled()) {
//                var pageNumber = parseInt(self.establishmentSearchViewModel.pageNumber()) + 1;
//                location.hash = '/participants/add/page/' + pageNumber;
//            }
//        };
//        self.establishmentSearchViewModel.prevPage = function () {
//            if (self.establishmentSearchViewModel.prevEnabled()) {
//                history.back();
//            }
//        };

//        // override establishment item click to add as participant
//        self.addParticipant = function (establishmentResultViewModel) {
//            var participant = new InstitutionalAgreementParticipantModel({
//                isOwner: false,
//                establishment: establishmentResultViewModel
//            });
//            self.participants.push(participant);
//            location.hash = "#/";
//        };
//        self.establishmentSearchViewModel.items.subscribe(function (newValue) {
//            if (newValue && newValue.length) {
//                for (var i = 0; i < newValue.length; i++) {
//                    if (newValue[i].clickAction !== self.addParticipant) {
//                        newValue[i].clickAction = self.addParticipant;
//                    }
//                }
//            }
//        });
//        self.removeParticipant = function (establishmentResultViewModel, e) {
//            if (confirm('Are you sure you want to remove "' +
//                establishmentResultViewModel.translatedName() +
//                '" as a participant from this agreement?')) {
//                self.participants.remove(function (item) {
//                    if (item.establishment.id() === establishmentResultViewModel.id()) {
//                        $(item.participantEl).slideUp('fast', function () {
//                            self.participants.remove(item);
//                        });
//                    }
//                    return false;
//                });
//            }
//            e.preventDefault();
//            e.stopPropagation();
//            return false;
//        };
//        self.sammy = Sammy();
//        var dataSideSwiper = 'data-side-swiper';
        
//        //self.mySam.sammy() 
//        //SammyVM.SammyVM.sammy;//.SammyVM;
//    //var sam = undefined;
//        //self.sammy = function () {
//        //    if (sam) return sam;
//        //    sam = Sammy(function () {
//        //        this.get('#/', function () {
//        //            if ($('#participants_add').attr(dataSideSwiper) === 'on') {
//        //                self.sideSwiper.prev();
//        //            }
//        //        });

//        //        this.get('#/participants/add/page/:pageNumber', function () {
//        //            if ($('#all').attr(dataSideSwiper) === 'on') {
//        //                self.sideSwiper.next();
//        //                self.establishmentSearchViewModel.trail().push(this.path);
//        //            }
//        //            else if ($('#participants_add').attr(dataSideSwiper) === 'on') {
//        //                var pageNumber = this.params['pageNumber'],
//        //                    trail = self.establishmentSearchViewModel.trail(),
//        //                    clone;
//        //                self.establishmentSearchViewModel.pageNumber(pageNumber);
//        //                if (trail.length > 0 && trail[trail.length - 1] === this.path) return;
//        //                if (trail.length > 1 && trail[trail.length - 2] === this.path) {
//        //                    // swipe backward
//        //                    trail.pop();
//        //                    clone = self.establishmentSearchViewModel.$itemsPage().clone(true)
//        //                        .removeAttr('data-bind').data('bind', undefined).removeAttr('id');
//        //                    clone.appendTo(self.establishmentSearchViewModel.$itemsPage().parent());
//        //                    self.establishmentSearchViewModel.$itemsPage().attr('data-side-swiper', 'off').hide();
//        //                    self.establishmentSearchViewModel.lockAnimation();
//        //                    $(window).scrollTop(0);
//        //                    self.establishmentSearchViewModel.sideSwiper.prev(1, function () {
//        //                        self.establishmentSearchViewModel.$itemsPage().siblings().remove();
//        //                        self.establishmentSearchViewModel.unlockAnimation();
//        //                    });
//        //                    return;
//        //                } else if (trail.length > 0) {
//        //                    // swipe forward
//        //                    clone = self.establishmentSearchViewModel.$itemsPage().clone(true)
//        //                        .removeAttr('data-bind').data('bind', undefined).removeAttr('id');
//        //                    clone.insertBefore(self.establishmentSearchViewModel.$itemsPage());
//        //                    self.establishmentSearchViewModel.$itemsPage().attr('data-side-swiper', 'off').data('side-swiper', 'off').hide();
//        //                    self.establishmentSearchViewModel.lockAnimation();
//        //                    $(window).scrollTop(0);
//        //                    self.establishmentSearchViewModel.sideSwiper.next(1, function () {
//        //                        self.establishmentSearchViewModel.unlockAnimation();
//        //                        //self.establishmentSearchViewModel.nextForceDisabled(false);
//        //                    });
//        //                }
//        //                trail.push(this.path);
//        //            }
//        //        });

//        //        this.get('', function () {
//        //            this.app.runRoute('get', '#/');
//        //        });
//        //    });
//        //    return sam;
//    //};



//        self.isBound(true);
//    }