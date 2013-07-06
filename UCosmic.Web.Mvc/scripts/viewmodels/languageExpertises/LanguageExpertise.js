var ViewModels;
(function (ViewModels) {
    (function (LanguageExpertises) {
        var LanguageExpertise = (function () {
            function LanguageExpertise(expertiseId) {
                this.inititializationErrors = "";
                this.dirtyFlag = ko.observable(false);
                this._initialize(expertiseId);
            }
            LanguageExpertise.prototype._initialize = function (expertiseId) {
                if(expertiseId === "new") {
                    this.id = ko.observable(0);
                } else {
                    this.id = ko.observable(Number(expertiseId));
                }
            };
            LanguageExpertise.prototype.setupWidgets = function (languageInputId, speakingInputId, listeningInputId, readingInputId, writingInputId) {
                var _this = this;
                $("#" + languageInputId).kendoDropDownList({
                    dataTextField: "name",
                    dataValueField: "id",
                    dataSource: this.languageList,
                    value: this.languageId() != null ? this.languageId() : 0,
                    change: function (e) {
                        var item = _this.languageList[e.sender.selectedIndex];
                        if(item.name == "Other") {
                            _this.languageId(null);
                        } else {
                            _this.languageId(item.id);
                        }
                    }
                });
                if(this.languageId() == null) {
                    var dropdownlist = $("#" + languageInputId).data("kendoDropDownList");
                    dropdownlist.select(function (dataItem) {
                        return dataItem.name === "Other";
                    });
                }
                $("#" + speakingInputId).kendoDropDownList({
                    dataTextField: "title",
                    dataValueField: "weight",
                    dataSource: this.proficiencyInfo.speakingMeanings,
                    value: this.speakingProficiency(),
                    template: kendo.template($("#proficiency-template").html())
                });
                $("#" + listeningInputId).kendoDropDownList({
                    dataTextField: "title",
                    dataValueField: "weight",
                    dataSource: this.proficiencyInfo.listeningMeanings,
                    value: this.listeningProficiency(),
                    template: kendo.template($("#proficiency-template").html())
                });
                $("#" + readingInputId).kendoDropDownList({
                    dataTextField: "title",
                    dataValueField: "weight",
                    dataSource: this.proficiencyInfo.readingMeanings,
                    value: this.readingProficiency(),
                    template: kendo.template($("#proficiency-template").html())
                });
                $("#" + writingInputId).kendoDropDownList({
                    dataTextField: "title",
                    dataValueField: "weight",
                    dataSource: this.proficiencyInfo.writingMeanings,
                    value: this.writingProficiency(),
                    template: kendo.template($("#proficiency-template").html())
                });
            };
            LanguageExpertise.prototype.setupValidation = function () {
                ko.validation.rules['atLeast'] = {
                    validator: function (val, otherVal) {
                        return val.length >= otherVal;
                    },
                    message: 'At least {0} must be selected.'
                };
                ko.validation.registerExtenders();
                ko.validation.group(this);
            };
            LanguageExpertise.prototype.setupSubscriptions = function () {
                var _this = this;
                this.languageId.subscribe(function (newValue) {
                    _this.dirtyFlag(true);
                });
                this.other.subscribe(function (newValue) {
                    _this.dirtyFlag(true);
                });
                this.dialect.subscribe(function (newValue) {
                    _this.dirtyFlag(true);
                });
                this.speakingProficiency.subscribe(function (newValue) {
                    _this.dirtyFlag(true);
                });
                this.listeningProficiency.subscribe(function (newValue) {
                    _this.dirtyFlag(true);
                });
                this.readingProficiency.subscribe(function (newValue) {
                    _this.dirtyFlag(true);
                });
                this.writingProficiency.subscribe(function (newValue) {
                    _this.dirtyFlag(true);
                });
            };
            LanguageExpertise.prototype.load = function () {
                var _this = this;
                var deferred = $.Deferred();
                var proficienciesPact = $.Deferred();
                $.get(App.Routes.WebApi.LanguageProficiency.get()).done(function (data, textStatus, jqXHR) {
                    proficienciesPact.resolve(data);
                }).fail(function (jqXHR, textStatus, errorThrown) {
                    proficienciesPact.reject(jqXHR, textStatus, errorThrown);
                });
                var languagesPact = $.Deferred();
                $.get(App.Routes.WebApi.Languages.get()).done(function (data, textStatus, jqXHR) {
                    languagesPact.resolve(data);
                }).fail(function (jqXHR, textStatus, errorThrown) {
                    languagesPact.reject(jqXHR, textStatus, errorThrown);
                });
                if(this.id() == 0) {
                    this.version = ko.observable(null);
                    this.personId = ko.observable(0);
                    this.whenLastUpdated = ko.observable(null);
                    this.whoLastUpdated = ko.observable(null);
                    this.languageId = ko.observable(0);
                    this.dialect = ko.observable(null);
                    this.other = ko.observable(null);
                    this.speakingProficiency = ko.observable(0);
                    this.listeningProficiency = ko.observable(0);
                    this.readingProficiency = ko.observable(0);
                    this.writingProficiency = ko.observable(0);
                    $.when(languagesPact, proficienciesPact).done(function (languages, proficiencyInfo, data) {
                        _this.languageList = languages;
                        _this.languageList.push({
                            name: "Other",
                            code: "",
                            id: 0
                        });
                        _this.proficiencyInfo = proficiencyInfo;
                        deferred.resolve();
                    }).fail(function (xhr, textStatus, errorThrown) {
                        deferred.reject(xhr, textStatus, errorThrown);
                    });
                } else {
                    var dataPact = $.Deferred();
                    $.ajax({
                        type: "GET",
                        url: App.Routes.WebApi.LanguageExpertises.get(this.id()),
                        success: function (data, textStatus, jqXhr) {
                            dataPact.resolve(data);
                        },
                        error: function (jqXhr, textStatus, errorThrown) {
                            dataPact.reject(jqXhr, textStatus, errorThrown);
                        }
                    });
                    $.when(languagesPact, proficienciesPact, dataPact).done(function (languages, proficiencyInfo, data) {
                        _this.languageList = languages;
                        _this.languageList.push({
                            name: "Other",
                            code: "",
                            id: 0
                        });
                        _this.proficiencyInfo = proficiencyInfo;
                        ko.mapping.fromJS(data, {
                        }, _this);
                        deferred.resolve();
                    }).fail(function (xhr, textStatus, errorThrown) {
                        deferred.reject(xhr, textStatus, errorThrown);
                    });
                }
                return deferred;
            };
            LanguageExpertise.prototype.save = function (viewModel, event) {
                if(!this.isValid()) {
                    return;
                }
                var mapSource = {
                    id: this.id,
                    version: this.version,
                    personId: this.personId,
                    whenLastUpdated: this.whenLastUpdated,
                    whoLastUpdated: this.whoLastUpdated,
                    languageId: this.languageId,
                    dialect: this.dialect,
                    other: this.other,
                    speakingProficiency: this.speakingProficiency,
                    listeningProficiency: this.listeningProficiency,
                    readingProficiency: this.readingProficiency,
                    writingProficiency: this.writingProficiency
                };
                var model = ko.mapping.toJS(mapSource);
                var url = (viewModel.id() == 0) ? App.Routes.WebApi.LanguageExpertises.post() : App.Routes.WebApi.LanguageExpertises.put(viewModel.id());
                var type = (viewModel.id() == 0) ? "POST" : "PUT";
                $.ajax({
                    type: type,
                    async: false,
                    url: url,
                    data: ko.toJSON(model),
                    dataType: 'json',
                    contentType: 'application/json',
                    success: function (data, textStatus, jqXhr) {
                    },
                    error: function (jqXhr, textStatus, errorThrown) {
                        alert(textStatus + " | " + errorThrown);
                    },
                    complete: function (jqXhr, textStatus) {
                        location.href = App.Routes.Mvc.My.Profile.get("language-expertise");
                    }
                });
            };
            LanguageExpertise.prototype.cancel = function (item, event, mode) {
                if(this.dirtyFlag() == true) {
                    $("#cancelConfirmDialog").dialog({
                        modal: true,
                        resizable: false,
                        width: 450,
                        buttons: {
                            "Do not cancel": function () {
                                $(this).dialog("close");
                            },
                            "Cancel and lose changes": function () {
                                $(this).dialog("close");
                                location.href = App.Routes.Mvc.My.Profile.get("language-expertise");
                            }
                        }
                    });
                } else {
                    location.href = App.Routes.Mvc.My.Profile.get("language-expertise");
                }
            };
            return LanguageExpertise;
        })();
        LanguageExpertises.LanguageExpertise = LanguageExpertise;        
    })(ViewModels.LanguageExpertises || (ViewModels.LanguageExpertises = {}));
    var LanguageExpertises = ViewModels.LanguageExpertises;
})(ViewModels || (ViewModels = {}));
