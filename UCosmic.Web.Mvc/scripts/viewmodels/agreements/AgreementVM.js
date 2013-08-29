/// <reference path="../../app/Spinner.ts" />
/// <reference path="../establishments/Url.ts" />
/// <reference path="../establishments/SearchResult.ts" />
/// <reference path="../establishments/Search.ts" />
/// <reference path="../establishments/Name.ts" />
/// <reference path="../establishments/Item.ts" />
/// <reference path="../../typings/globalize/globalize.d.ts" />
/// <reference path="../../typings/knockout/knockout.d.ts" />
/// <reference path="../../typings/kendo/kendo.all.d.ts" />
/// <reference path="../../typings/jquery/jquery.d.ts" />
/// <reference path="../../typings/knockout.mapping/knockout.mapping.d.ts" />
/// <reference path="../../typings/requirejs/require.d.ts" />
/// <reference path="../../app/App.ts" />
/// <reference path="../../app/Routes.ts" />
/// <reference path="../../app/Spinner.ts" />
/// <reference path="../../typings/moment/moment.d.ts" />
/// <reference path="../../typings/sammyjs/sammyjs.d.ts" />
/// <reference path="../establishments/ApiModels.d.ts" />
/// <reference path="./scrollBody.ts" />
/// <reference path="./contacts.ts" />
var InstitutionalAgreementParticipantModel = (function () {
    function InstitutionalAgreementParticipantModel(isOwner, establishmentId, establishmentOfficialName, establishmentTranslatedName) {
        this.isOwner = ko.observable(isOwner);
        this.establishmentId = ko.observable(establishmentId);
        this.establishmentOfficialName = ko.observable(establishmentOfficialName);
        this.establishmentTranslatedName = ko.observable(establishmentTranslatedName);
    }
    return InstitutionalAgreementParticipantModel;
})();
;

var InstitutionalAgreementEditModel = (function () {
    function InstitutionalAgreementEditModel(initDefaultPageRoute) {
        if (typeof initDefaultPageRoute === "undefined") { initDefaultPageRoute = true; }
        var _this = this;
        this.initDefaultPageRoute = initDefaultPageRoute;
        this.selectConstructor = function (name, id) {
            this.name = name;
            this.id = id;
        };
        this.percentOffBodyHeight = .6;
        //jquery defered for setting body height.
        this.dfdUAgreements = $.Deferred();
        this.dfdPopParticipants = $.Deferred();
        this.dfdPopContacts = $.Deferred();
        this.dfdPopFiles = $.Deferred();
        this.dfdPageFadeIn = $.Deferred();
        this.agreementIsEdit = ko.observable();
        this.agreementId = 0;
        this.visibility = ko.observable();
        this.trail = ko.observableArray([]);
        this.nextForceDisabled = ko.observable(false);
        this.prevForceDisabled = ko.observable(false);
        this.pageNumber = ko.observable();
        this.$genericAlertDialog = undefined;
        //added this because kendo window after selecting a autocomplte and then clicking the window, the body would scroll to the top.
        this.kendoWindowBug = 0;
        //basic info vars
        this.$uAgreements = ko.observable();
        this.uAgreements = ko.mapping.fromJS([]);
        this.uAgreementSelected = ko.observable("");
        this.nickname = ko.observable();
        this.content = ko.observable();
        this.privateNotes = ko.observable();
        this.$typeOptions = ko.observable();
        this.typeOptions = ko.mapping.fromJS([]);
        this.typeOptionSelected = ko.observable();
        this.agreementContent = ko.observable();
        this.isCustomTypeAllowed = ko.observable();
        this.isCustomStatusAllowed = ko.observable();
        this.isCustomContactTypeAllowed = ko.observable();
        //dates vars
        this.startDate = ko.observable();
        this.expDate = ko.observable();
        this.isEstimated = ko.observable();
        this.autoRenew = ko.observable(2);
        this.$statusOptions = ko.observable();
        this.statusOptions = ko.mapping.fromJS([]);
        this.statusOptionSelected = ko.observable();
        //file vars
        this.$file = ko.observable();
        this.hasFile = ko.observable();
        this.isFileExtensionInvalid = ko.observable(false);
        this.isFileTooManyBytes = ko.observable(false);
        this.isFileFailureUnexpected = ko.observable(false);
        this.isFileInvalid = ko.observable(false);
        this.fileError = ko.observable();
        this.fileFileExtension = ko.observable();
        this.fileFileName = ko.observable();
        this.fileSrc = ko.observable();
        this.fileUploadSpinner = new App.Spinner(new App.SpinnerOptions(400));
        this.fileDeleteSpinner = new App.Spinner(new App.SpinnerOptions(400));
        this.tempFileId = 0;
        this.files = ko.mapping.fromJS([]);
        //participant vars
        this.participantsExport = ko.mapping.fromJS([]);
        this.participants = ko.mapping.fromJS([]);
        this.participantsErrorMsg = ko.observable();
        //search vars
        this.establishmentSearchViewModel = new Establishments.ViewModels.Search();
        this.hasBoundSearch = false;
        this.hasBoundItem = false;
        this.isBound = ko.observable();
        this.spinner = new App.Spinner(new App.SpinnerOptions(400, true));
        this.officialNameDoesNotMatchTranslation = ko.computed(function () {
            return !(this.participants.establishmentOfficialName === this.participants.establishmentTranslatedName);
        });
        this.contactClass = new agreements.contacts(this.isCustomContactTypeAllowed, this.spinner, this.establishmentItemViewModel, this.agreementIsEdit, this.agreementId, this.kendoWindowBug);

        ko.applyBindings(this.contactClass, $('#contacts')[0]);

        var culture = $("meta[name='accept-language']").attr("content");
        if (window.location.href.toLowerCase().indexOf("agreements/new") > 0) {
            Globalize.culture(culture);
            this.editOrNewUrl = "new/";
            this.agreementIsEdit(false);
            this.visibility("Public");
            $("#LoadingPage").hide();
            this.populateParticipants();
            $.when(this.dfdPageFadeIn, this.dfdPopParticipants).done(function () {
                _this.updateKendoDialog($(window).width());
                $("body").css("min-height", ($(window).height() + $("body").height() - ($(window).height() * _this.percentOffBodyHeight)));
            });
        } else {
            this.percentOffBodyHeight = .2;
            this.editOrNewUrl = window.location.href.toLowerCase().substring(window.location.href.toLowerCase().indexOf("agreements/") + 11);
            this.editOrNewUrl = this.editOrNewUrl.substring(0, this.editOrNewUrl.indexOf("/edit") + 5) + "/";
            this.agreementIsEdit(true);
            this.agreementId = this.editOrNewUrl.substring(0, this.editOrNewUrl.indexOf("/"));
            this.populateParticipants();
            this.populateFiles();
            this.populateContacts();
            Globalize.culture(culture);
            this.populateAgreementData();
            $("#LoadingPage").hide();
            $.when(this.dfdPopContacts, this.dfdPopFiles, this.dfdPopParticipants, this.dfdPageFadeIn).done(function () {
                _this.updateKendoDialog($(window).width());
                $("body").css("min-height", ($(window).height() + $("body").height() - ($(window).height() * _this.percentOffBodyHeight)));
            });
        }

        this.isBound(true);
        this.removeParticipant = this.removeParticipant.bind(this);
        this.updateFile = this.updateFile.bind(this);
        this.fileVisibilityClicked = this.fileVisibilityClicked.bind(this);
        this.removeFile = this.removeFile.bind(this);
        this._setupValidation = this._setupValidation.bind(this);
        this.participantsShowErrorMsg = ko.computed(function () {
            var validateParticipantsHasOwner = false;
            $.each(_this.participants(), function (i, item) {
                if (item.isOwner() == true) {
                    validateParticipantsHasOwner = true;
                }
            });
            if (validateParticipantsHasOwner == false) {
                _this.participantsErrorMsg("Home participant is required.");
                return true;
            } else {
                return false;
            }
        });

        this.populateUmbrella();
        this.hideOtherGroups();
        this.bindSearch();
        this.getSettings();
        this._setupValidation();

        $(window).resize(function () {
            _this.updateKendoDialog($(window).width());
        });
    }
    InstitutionalAgreementEditModel.prototype.receiveParticipants = function (js) {
        if (!js) {
            ko.mapping.fromJS({
                items: [],
                itemTotal: 0
            }, this.participants);
        } else {
            ko.mapping.fromJS(js, this.participants);
        }
    };

    InstitutionalAgreementEditModel.prototype.populateParticipants = function () {
        var _this = this;
        $.get(App.Routes.WebApi.Agreements.Participants.get(this.agreementId)).done(function (response) {
            _this.receiveParticipants(response);
            _this.dfdPopParticipants.resolve();
        });
    };

    InstitutionalAgreementEditModel.prototype.populateAgreementData = function () {
        var _this = this;
        $.when(this.dfdUAgreements).done(function () {
            $.get(App.Routes.WebApi.Agreements.get(_this.agreementId)).done(function (response) {
                var dropdownlist;
                var editor = $("#agreementContent").data("kendoEditor");

                editor.value(response.content);
                _this.content(response.content);
                _this.expDate(Globalize.format(new Date(response.expiresOn.substring(0, response.expiresOn.lastIndexOf("T"))), 'd'));
                _this.startDate(Globalize.format(new Date(response.startsOn.substring(0, response.startsOn.lastIndexOf("T"))), 'd'));
                if (response.isAutoRenew == null) {
                    _this.autoRenew(2);
                } else {
                    _this.autoRenew(response.isAutoRenew);
                }
                ;

                _this.nickname(response.name);
                _this.privateNotes(response.notes);
                _this.visibility(response.visibility);
                _this.isEstimated(response.isExpirationEstimated);
                ko.mapping.fromJS(response.participants, _this.participants);
                _this.dfdPopParticipants.resolve();
                _this.uAgreementSelected(response.umbrellaId);

                dropdownlist = $("#uAgreements").data("kendoDropDownList");
                dropdownlist.select(function (dataItem) {
                    return dataItem.value == _this.uAgreementSelected();
                });

                _this.statusOptionSelected(response.status);
                if (_this.isCustomStatusAllowed()) {
                    dropdownlist = $("#statusOptions").data("kendoComboBox");
                    dropdownlist.select(function (dataItem) {
                        return dataItem.name === _this.statusOptionSelected();
                    });
                } else {
                    dropdownlist = $("#statusOptions").data("kendoDropDownList");
                    dropdownlist.select(function (dataItem) {
                        return dataItem.text === _this.statusOptionSelected();
                    });
                }

                _this.typeOptionSelected(response.type);
                if (_this.isCustomTypeAllowed()) {
                    dropdownlist = $("#typeOptions").data("kendoComboBox");
                    dropdownlist.select(function (dataItem) {
                        return dataItem.name === _this.typeOptionSelected();
                    });
                } else {
                    dropdownlist = $("#typeOptions").data("kendoDropDownList");
                    dropdownlist.select(function (dataItem) {
                        return dataItem.text === _this.typeOptionSelected();
                    });
                }
            });
        });
    };

    InstitutionalAgreementEditModel.prototype.populateFiles = function () {
        var _this = this;
        $.get(App.Routes.WebApi.Agreements.Files.get(this.agreementId), { useTestData: true }).done(function (response) {
            $.each(response, function (i, item) {
                _this.files.push(ko.mapping.fromJS({
                    id: item.id,
                    originalName: item.originalName,
                    customName: item.customName,
                    visibility: item.visibility,
                    isEdit: false,
                    customNameFile: item.customName.substring(0, item.customName.lastIndexOf(".")),
                    customNameExt: item.customName.substring(item.customName.lastIndexOf("."), item.customName.length)
                }));
            });
            _this.dfdPopFiles.resolve();
        });
    };

    InstitutionalAgreementEditModel.prototype.populateContacts = function () {
        var _this = this;
        $.get(App.Routes.WebApi.Agreements.Contacts.get(this.agreementId), { useTestData: false }).done(function (response) {
            ko.mapping.fromJS(response, _this.contactClass.contacts);
            _this.dfdPopContacts.resolve();
        });
    };

    InstitutionalAgreementEditModel.prototype.populateUmbrella = function () {
        var _this = this;
        $.get(App.Routes.WebApi.Agreements.UmbrellaOptions.get(this.agreementId)).done(function (response) {
            _this.uAgreements(response);
            $("#uAgreements").kendoDropDownList({
                dataTextField: "text",
                dataValueField: "value",
                optionLabel: "[None - this is a top-level or standalone agreement]",
                dataSource: new kendo.data.DataSource({
                    data: _this.uAgreements()
                })
            });
            _this.dfdUAgreements.resolve();
        });
    };

    InstitutionalAgreementEditModel.prototype.$bindKendoFile = function () {
        var _this = this;
        var saveUrl = "";
        if (this.agreementIsEdit()) {
            saveUrl = App.Routes.WebApi.Agreements.Files.post(this.agreementId);
        } else {
            saveUrl = App.Routes.WebApi.Uploads.post();
        }
        $("#fileUpload").kendoUpload({
            multiple: true,
            showFileList: false,
            localization: {
                select: 'Choose a file to upload...'
            },
            select: function (e) {
                for (var i = 0; i < e.files.length; i++) {
                    var data = ko.mapping.toJS({
                        Name: e.files[i].name,
                        Length: e.files[i].rawFile.size
                    });
                    var url = App.Routes.WebApi.Agreements.Files.Validate.post();
                    $.ajax({
                        type: 'POST',
                        url: url,
                        async: false,
                        data: data,
                        success: function (response, statusText, xhr) {
                            _this.isFileInvalid(false);
                        },
                        error: function (xhr, statusText, errorThrown) {
                            e.preventDefault();
                            _this.isFileInvalid(true);
                            _this.fileError(xhr.responseText);
                        }
                    });
                }
            },
            async: {
                saveUrl: saveUrl
            },
            upload: function (e) {
                if (_this.agreementIsEdit()) {
                    e.data = {
                        originalName: e.files[0].name,
                        visibility: 'Private',
                        customName: e.files[0].name,
                        agreementId: _this.agreementId
                    };
                }
                if (!e.isDefaultPrevented()) {
                    _this.fileUploadSpinner.start();
                }
            },
            complete: function () {
                _this.fileUploadSpinner.stop();
            },
            success: function (e) {
                if (e.operation == 'upload') {
                    if (e.response && e.response.message) {
                        App.flasher.flash(e.response.message);
                    }
                    var myId;
                    if (_this.agreementIsEdit()) {
                        var myUrl;
                        if (e.XMLHttpRequest != undefined) {
                            myUrl = e.XMLHttpRequest.getResponseHeader('Location');
                        } else {
                            myUrl = e.response.location;
                        }
                        myId = parseInt(myUrl.substring(myUrl.lastIndexOf("/") + 1));
                    } else {
                        _this.tempFileId = _this.tempFileId + .01;
                        myId = _this.tempFileId;
                    }
                    _this.files.push(ko.mapping.fromJS({
                        id: myId,
                        originalName: e.files[0].name,
                        customName: e.files[0].name,
                        visibility: "Public",
                        guid: e.response.guid,
                        isEdit: false,
                        customNameFile: e.files[0].name.substring(0, e.files[0].name.indexOf(e.files[0].extension)),
                        customNameExt: e.files[0].extension
                    }));
                    $("body").css("min-height", ($(window).height() + $("body").height() - ($(window).height() * .85)));
                }
            },
            error: function (e) {
                // kendo response is as json string, not js object
                var fileName, fileExtension;

                if (e.files && e.files.length > 0) {
                    fileName = e.files[0].name;
                    fileExtension = e.files[0].extension;
                }
                if (fileName)
                    _this.fileFileName(fileName);
                if (fileExtension)
                    _this.fileFileExtension(fileExtension);

                if (e.XMLHttpRequest.status === 415)
                    _this.isFileExtensionInvalid(true);
else if (e.XMLHttpRequest.status === 413)
                    _this.isFileTooManyBytes(true);
else
                    _this.isFileFailureUnexpected(true);
            }
        });
    };

    InstitutionalAgreementEditModel.prototype.removeFile = function (me, e) {
        var _this = this;
        if (confirm('Are you sure you want to remove this file from this agreement?')) {
            // all files will have a guid in create, none will have a guid in edit agreement
            // so do a check for agreementId - if it is undefined(for now 0)
            var url = "";
            if (this.agreementIsEdit()) {
                url = App.Routes.WebApi.Agreements.Files.del(this.agreementId, me.id());
            } else {
                url = App.Routes.WebApi.Uploads.del(me.guid());
            }
            $.ajax({
                url: url,
                type: 'DELETE',
                success: function () {
                    _this.files.remove(me);
                    $("body").css("min-height", ($(window).height() + $("body").height() - ($(window).height() * 1.1)));
                }
            });
        }
        e.preventDefault();
        e.stopPropagation();
    };

    InstitutionalAgreementEditModel.prototype.editAFile = function (me, e) {
        me.isEdit(true);
    };

    InstitutionalAgreementEditModel.prototype.cancelEditAFile = function (me, e) {
        me.customNameFile(me.customName().substring(0, me.customName().lastIndexOf(".")));
        me.isEdit(false);
        e.stopImmediatePropagation();
        return false;
    };

    InstitutionalAgreementEditModel.prototype.updateFile = function (me, e) {
        var _this = this;
        me.customName(me.customNameFile() + me.customNameExt());
        me.isEdit(false);
        if (this.agreementIsEdit()) {
            var data = ko.mapping.toJS({
                agreementId: me.agreementId,
                uploadGuid: me.guid,
                originalName: me.guid,
                extension: me.extension,
                customName: me.customName,
                visibility: me.visibility
            });
            var url = App.Routes.WebApi.Agreements.Files.put(this.agreementId, me.id());
            $.ajax({
                type: 'PUT',
                url: url,
                data: data,
                success: function (response, statusText, xhr) {
                },
                error: function (xhr, statusText, errorThrown) {
                    _this.spinner.stop();
                    if (xhr.status === 400) {
                        _this.establishmentItemViewModel.$genericAlertDialog.find('p.content').html(xhr.responseText.replace('\n', '<br /><br />'));
                        _this.establishmentItemViewModel.$genericAlertDialog.dialog({
                            title: 'Alert Message',
                            dialogClass: 'jquery-ui',
                            width: 'auto',
                            resizable: false,
                            modal: true,
                            buttons: {
                                'Ok': function () {
                                    _this.establishmentItemViewModel.$genericAlertDialog.dialog('close');
                                }
                            }
                        });
                    }
                }
            });
        }
    };

    InstitutionalAgreementEditModel.prototype.fileVisibilityClicked = function (me, e) {
        var _this = this;
        if (this.agreementIsEdit() && e.target.textContent == "") {
            var data = ko.mapping.toJS({
                agreementId: this.agreementId,
                uploadGuid: me.guid,
                originalName: me.guid,
                extension: me.extension,
                customName: me.customName,
                visibility: me.visibility
            });
            var url = App.Routes.WebApi.Agreements.Files.put(this.agreementId, me.id());
            $.ajax({
                type: 'PUT',
                url: url,
                data: data,
                success: function (response, statusText, xhr) {
                },
                error: function (xhr, statusText, errorThrown) {
                    _this.spinner.stop();
                    if (xhr.status === 400) {
                        _this.establishmentItemViewModel.$genericAlertDialog.find('p.content').html(xhr.responseText.replace('\n', '<br /><br />'));
                        _this.establishmentItemViewModel.$genericAlertDialog.dialog({
                            title: 'Alert Message',
                            dialogClass: 'jquery-ui',
                            width: 'auto',
                            resizable: false,
                            modal: true,
                            buttons: {
                                'Ok': function () {
                                    _this.establishmentItemViewModel.$genericAlertDialog.dialog('close');
                                }
                            }
                        });
                    }
                }
            });
        }
        return true;
    };

    InstitutionalAgreementEditModel.prototype.updateKendoDialog = function (windowWidth) {
        $(".k-window").css({
            left: (windowWidth / 2 - ($(".k-window").width() / 2) + 10)
        });
    };

    InstitutionalAgreementEditModel.prototype.bindjQueryKendo = function (result) {
        var _this = this;
        var self = this;
        this.isCustomTypeAllowed(result.isCustomTypeAllowed);
        this.isCustomStatusAllowed(result.isCustomStatusAllowed);
        this.isCustomContactTypeAllowed(result.isCustomContactTypeAllowed);
        this.statusOptions.push(new this.selectConstructor("", ""));
        this.typeOptions.push(new this.selectConstructor("", ""));
        for (var i = 0; i < result.statusOptions.length; i++) {
            this.statusOptions.push(new this.selectConstructor(result.statusOptions[i], result.statusOptions[i]));
        }
        ;
        this.contactClass.contactTypeOptions.push(new this.selectConstructor("", undefined));
        for (var i = 0; i < result.contactTypeOptions.length; i++) {
            this.contactClass.contactTypeOptions.push(new this.selectConstructor(result.contactTypeOptions[i], result.contactTypeOptions[i]));
        }
        ;
        for (var i = 0; i < result.typeOptions.length; i++) {
            this.typeOptions.push(new this.selectConstructor(result.typeOptions[i], result.typeOptions[i]));
        }
        ;
        if (this.isCustomTypeAllowed) {
            $("#typeOptions").kendoComboBox({
                dataTextField: "name",
                dataValueField: "id",
                dataSource: new kendo.data.DataSource({
                    data: this.typeOptions()
                })
            });
        } else {
            $("#typeOptions").kendoDropDownList({
                dataTextField: "name",
                dataValueField: "id",
                dataSource: new kendo.data.DataSource({
                    data: this.typeOptions()
                })
            });
        }
        if (this.isCustomStatusAllowed) {
            $("#statusOptions").kendoComboBox({
                dataTextField: "name",
                dataValueField: "id",
                dataSource: new kendo.data.DataSource({
                    data: this.statusOptions()
                })
            });
        } else {
            $("#statusOptions").kendoDropDownList({
                dataTextField: "name",
                dataValueField: "id",
                dataSource: new kendo.data.DataSource({
                    data: this.statusOptions()
                })
            });
        }
        $(".hasDate").each(function (index, item) {
            $(item).kendoDatePicker({
                value: new Date($(item).val()),
                //have to use change event for ko validation-change does a double call so need to check for null
                change: function (e) {
                    if (this.value() != null) {
                        $(e.sender.element).val(Globalize.format(this.value(), 'd'));
                    }
                },
                close: function (e) {
                    if (this.value() != null) {
                        $(e.sender.element).val(Globalize.format(this.value(), 'd'));
                    }
                }
            });
        });

        this.$bindKendoFile();
        $("#helpExpDate").kendoTooltip({
            width: 520,
            position: "top",
            content: $("#templateExpToolTip").html(),
            showOn: "click",
            autoHide: false
        });

        $(".k-window").css({
            position: 'fixed',
            margin: 'auto',
            top: '20px'
        });

        //bind scroll to side nav
        $(window).scroll(function () {
            if (_this.kendoWindowBug != 0) {
                scrollBody.scrollMyBody(_this.kendoWindowBug);
            }
            var $participants = $("#participants");
            var $basicInfo = $("#basicInfo");
            var $effectiveDatesCurrentStatus = $("#effectiveDatesCurrentStatus");
            var $contacts = $("#contacts");
            var $fileAttachments = $("#fileAttachments");
            var $overallVisibility = $("#overallVisibility");

            var $navparticipants = $("#navParticipants");
            var $navbasicInfo = $("#navBasicInfo");
            var $naveffectiveDatesCurrentStatus = $("#navEffectiveDatesCurrentStatus");
            var $navcontacts = $("#navContacts");
            var $navfileAttachments = $("#navFileAttachments");
            var $navoverallVisibility = $("#navOverallVisibility");

            var $participantsTop = $participants.offset();
            var $basicInfoTop = $basicInfo.offset();
            var $effectiveDatesCurrentStatusTop = $effectiveDatesCurrentStatus.offset();
            var $contactsTop = $contacts.offset();
            var $fileAttachmentsTop = $fileAttachments.offset();
            var $overallVisibilityTop = $overallVisibility.offset();

            var $body;

            if (!$("body").scrollTop()) {
                $body = $("html, body").scrollTop() + 100;
            } else {
                $body = $("body").scrollTop() + 100;
            }
            if ($body <= $participantsTop.top + $participants.height() + 40) {
                $("aside").find("li").removeClass("current");
                $navparticipants.addClass("current");
            } else if ($body >= $basicInfoTop.top && $body <= $basicInfoTop.top + $basicInfo.height() + 40) {
                $("aside").find("li").removeClass("current");
                $navbasicInfo.addClass("current");
            } else if ($body >= $effectiveDatesCurrentStatusTop.top && $body <= $effectiveDatesCurrentStatusTop.top + $effectiveDatesCurrentStatus.height() + 40) {
                $("aside").find("li").removeClass("current");
                $naveffectiveDatesCurrentStatus.addClass("current");
            } else if ($body >= $contactsTop.top && $body <= $contactsTop.top + $contacts.height() + 40) {
                $("aside").find("li").removeClass("current");
                $navcontacts.addClass("current");
            } else if ($body >= $fileAttachmentsTop.top && $body <= $fileAttachmentsTop.top + $fileAttachments.height() + 40) {
                $("aside").find("li").removeClass("current");
                $navfileAttachments.addClass("current");
            } else if ($body >= $overallVisibilityTop.top) {
                $("aside").find("li").removeClass("current");
                $navoverallVisibility.closest("li").addClass("current");
            }
        });

        // create Editor from textarea HTML element
        $("#agreementContent").kendoEditor({
            tools: [
                "bold",
                "italic",
                "underline",
                "strikethrough",
                "fontName",
                "foreColor",
                "justifyLeft",
                "justifyCenter",
                "justifyRight",
                "justifyFull",
                "insertUnorderedList",
                "insertOrderedList",
                "indent",
                "outdent",
                "createLink",
                "unlink",
                "insertImage",
                "subscript",
                "superscript",
                "viewHtml",
                {
                    name: "formatting",
                    items: [
                        { text: "Paragraph", value: "p" },
                        { text: "Quotation", value: "blockquote" },
                        { text: "Heading 2", value: "h2" },
                        { text: "Heading 3", value: "h3" },
                        { text: "Heading 4", value: "h4" },
                        { text: "Heading 5", value: "h5" },
                        { text: "Heading 6", value: "h6" }
                    ],
                    width: "200px"
                }
            ]
        });

        this.contactClass.bindJquery();
    };

    //get settings for agreements.
    InstitutionalAgreementEditModel.prototype.getSettings = function () {
        var _this = this;
        var url = 'App.Routes.WebApi.Agreements.Settings.get()';
        var agreementSettingsGet;
        $.ajax({
            url: eval(url),
            type: 'GET'
        }).done(function (result) {
            _this.bindjQueryKendo(result);
        }).fail(function (xhr) {
            alert('fail: status = ' + xhr.status + ' ' + xhr.statusText + '; message = "' + xhr.responseText + '"');
        });
    };

    //to correctly bind with ko, I had to set visibility to hidden. this removes that and changes it to display none.
    InstitutionalAgreementEditModel.prototype.hideOtherGroups = function () {
        $("#allParticipants").css("visibility", "").hide();
        $("#estSearch").css("visibility", "").hide();
        $("#addEstablishment").css("visibility", "").hide();
    };

    InstitutionalAgreementEditModel.prototype.removeParticipant = function (establishmentResultViewModel, e) {
        if (confirm('Are you sure you want to remove "' + establishmentResultViewModel.establishmentTranslatedName() + '" as a participant from this agreement?')) {
            var self = this;
            if (this.agreementIsEdit()) {
                var url = App.Routes.WebApi.Agreements.Participants.del(this.agreementId, ko.dataFor(e.target).establishmentId());
                $.ajax({
                    url: url,
                    type: 'DELETE',
                    success: function () {
                        self.participants.remove(function (item) {
                            if (item.establishmentId() === establishmentResultViewModel.establishmentId()) {
                                $(item.participantEl).slideUp('fast', function () {
                                    self.participants.remove(item);
                                    $("body").css("min-height", ($(window).height() + $("body").height() - ($(window).height() * 1.1)));
                                });
                            }
                            return false;
                        });
                    },
                    error: function (xhr, statusText, errorThrown) {
                        alert(xhr.responseText);
                    }
                });
            } else {
                self.participants.remove(function (item) {
                    if (item.establishmentId() === establishmentResultViewModel.establishmentId()) {
                        $(item.participantEl).slideUp('fast', function () {
                            self.participants.remove(item);
                            $("body").css("min-height", ($(window).height() + $("body").height() - ($(window).height() * 1.1)));
                        });
                    }
                    return false;
                });
            }
        }
        e.preventDefault();
        e.stopPropagation();
        return false;
    };

    InstitutionalAgreementEditModel.prototype.addParticipant = function (establishmentResultViewModel) {
        this.establishmentSearchViewModel.sammy.setLocation('#/page/1/');
        this.hasBoundSearch = true;
    };

    InstitutionalAgreementEditModel.prototype.SearchPageBind = function (parentOrParticipant) {
        var _this = this;
        var $cancelAddParticipant = $("#cancelAddParticipant");
        var $searchSideBarAddNew = $("#searchSideBarAddNew");
        this.establishmentSearchViewModel.detailTooltip = function () {
            return 'Choose this establishment as a ' + parentOrParticipant;
        };
        $cancelAddParticipant.off();
        $searchSideBarAddNew.off();
        $searchSideBarAddNew.on("click", function (e) {
            _this.establishmentSearchViewModel.sammy.setLocation('#/new/');
            e.preventDefault();
            return false;
        });
        if (parentOrParticipant === "parent") {
            $cancelAddParticipant.on("click", function (e) {
                _this.establishmentSearchViewModel.sammy.setLocation('#/new/');
                e.preventDefault();
                return false;
            });
        } else {
            $cancelAddParticipant.on("click", function (e) {
                _this.establishmentSearchViewModel.sammy.setLocation('#/index');
                e.preventDefault();
                return false;
            });
        }
        var dfd = $.Deferred();
        var dfd2 = $.Deferred();
        var $obj = $("#allParticipants");
        var $obj2 = $("#addEstablishment");
        var time = 500;
        this.fadeModsOut(dfd, dfd2, $obj, $obj2, time);
        $.when(dfd, dfd2).done(function () {
            $("#estSearch").fadeIn(500);
        });
    };

    //fade non active modules out
    InstitutionalAgreementEditModel.prototype.fadeModsOut = function (dfd, dfd2, $obj, $obj2, time) {
        if ($obj.css("display") !== "none") {
            $obj.fadeOut(time, function () {
                dfd.resolve();
            });
        } else {
            dfd.resolve();
        }
        if ($obj2.css("display") !== "none") {
            $obj2.fadeOut(time, function () {
                dfd2.resolve();
            });
        } else {
            dfd2.resolve();
        }
    };

    InstitutionalAgreementEditModel.prototype.bindSearch = function () {
        var _this = this;
        if (!this.hasBoundSearch) {
            this.establishmentSearchViewModel.sammyBeforeRoute = /\#\/index\/(.*)\//;
            this.establishmentSearchViewModel.sammyGetPageRoute = '#/index';
            this.establishmentSearchViewModel.sammyDefaultPageRoute = '/agreements[\/]?';
            ko.applyBindings(this.establishmentSearchViewModel, $('#estSearch')[0]);
            var lastURL = "asdf";
            if (this.establishmentSearchViewModel.sammy.getLocation().toLowerCase().indexOf("#") === -1) {
                if (this.establishmentSearchViewModel.sammy.getLocation().toLowerCase().indexOf("" + this.editOrNewUrl + "") === -1) {
                    this.establishmentSearchViewModel.sammy.setLocation("/agreements/" + this.editOrNewUrl + "#/index");
                } else {
                    this.establishmentSearchViewModel.sammy.setLocation('#/index');
                }
            }
            if (sessionStorage.getItem("addest") == undefined) {
                sessionStorage.setItem("addest", "no");
            }

            //Check the url for changes
            this.establishmentSearchViewModel.sammy.bind("location-changed", function () {
                if (_this.establishmentSearchViewModel.sammy.getLocation().toLowerCase().indexOf(lastURL) < 0) {
                    var $asideRootSearch = $("#asideRootSearch");
                    var $asideParentSearch = $("#asideParentSearch");
                    if (_this.establishmentSearchViewModel.sammy.getLocation().toLowerCase().indexOf("" + _this.editOrNewUrl + "#/new/") > 0) {
                        var $addEstablishment = $("#addEstablishment");
                        var dfd = $.Deferred();
                        var dfd2 = $.Deferred();
                        var $obj = $("#estSearch");
                        var $obj2 = $("#allParticipants");
                        var time = 500;
                        _this.fadeModsOut(dfd, dfd2, $obj, $obj2, time);
                        $.when(dfd, dfd2).done(function () {
                            $addEstablishment.css("visibility", "").hide().fadeIn(500, function () {
                                if (!_this.hasBoundItem) {
                                    _this.establishmentItemViewModel = new Establishments.ViewModels.Item();
                                    _this.establishmentItemViewModel.goToSearch = function () {
                                        sessionStorage.setItem("addest", "yes");
                                        _this.establishmentSearchViewModel.sammy.setLocation('#/page/1/');
                                    };
                                    _this.establishmentItemViewModel.submitToCreate = function (formElement) {
                                        if (!_this.establishmentItemViewModel.id || _this.establishmentItemViewModel.id === 0) {
                                            var me = _this.establishmentItemViewModel;
                                            _this.establishmentItemViewModel.validatingSpinner.start();

                                            // reference the single name and url
                                            var officialName = _this.establishmentItemViewModel.names()[0];
                                            var officialUrl = _this.establishmentItemViewModel.urls()[0];
                                            var location = _this.establishmentItemViewModel.location;

                                            if (officialName.text.isValidating() || officialUrl.value.isValidating() || _this.establishmentItemViewModel.ceebCode.isValidating() || _this.establishmentItemViewModel.uCosmicCode.isValidating()) {
                                                setTimeout(function () {
                                                    var waitResult = _this.establishmentItemViewModel.submitToCreate(formElement);
                                                    return false;
                                                }, 50);
                                                return false;
                                            }

                                            // check validity
                                            _this.establishmentItemViewModel.isValidationSummaryVisible(true);
                                            if (!_this.establishmentItemViewModel.isValid()) {
                                                _this.establishmentItemViewModel.errors.showAllMessages();
                                            }
                                            if (!officialName.isValid()) {
                                                officialName.errors.showAllMessages();
                                            }
                                            if (!officialUrl.isValid()) {
                                                officialUrl.errors.showAllMessages();
                                            }
                                            _this.establishmentItemViewModel.validatingSpinner.stop();

                                            if (officialName.isValid() && officialUrl.isValid() && _this.establishmentItemViewModel.isValid()) {
                                                var $LoadingPage = $("#LoadingPage").find("strong");
                                                var url = App.Routes.WebApi.Establishments.post();
                                                var data = _this.establishmentItemViewModel.serializeData();
                                                $LoadingPage.text("Creating Establishment...");
                                                data.officialName = officialName.serializeData();
                                                data.officialUrl = officialUrl.serializeData();
                                                data.location = location.serializeData();
                                                _this.establishmentItemViewModel.createSpinner.start();
                                                $.post(url, data).done(function (response, statusText, xhr) {
                                                    _this.establishmentItemViewModel.createSpinner.stop();
                                                    $LoadingPage.text("Establishment created, you are being redirected to previous page...");
                                                    $("#addEstablishment").fadeOut(500, function () {
                                                        $("#LoadingPage").fadeIn(500);
                                                        setTimeout(function () {
                                                            $("#LoadingPage").fadeOut(500, function () {
                                                                $LoadingPage.text("Loading Page...");
                                                            });
                                                            _this.establishmentSearchViewModel.sammy.setLocation('#/page/1/');
                                                        }, 5000);
                                                    });
                                                }).fail(function (xhr, statusText, errorThrown) {
                                                    if (xhr.status === 400) {
                                                        _this.establishmentItemViewModel.$genericAlertDialog.find('p.content').html(xhr.responseText.replace('\n', '<br /><br />'));
                                                        _this.establishmentItemViewModel.$genericAlertDialog.dialog({
                                                            title: 'Alert Message',
                                                            dialogClass: 'jquery-ui',
                                                            width: 'auto',
                                                            resizable: false,
                                                            modal: true,
                                                            buttons: {
                                                                'Ok': function () {
                                                                    _this.establishmentItemViewModel.$genericAlertDialog.dialog('close');
                                                                }
                                                            }
                                                        });
                                                    }
                                                });
                                            }
                                        }
                                        return false;
                                    };
                                    ko.applyBindings(_this.establishmentItemViewModel, $addEstablishment[0]);
                                    var $cancelAddEstablishment = $("#cancelAddEstablishment");
                                    $cancelAddEstablishment.on("click", function (e) {
                                        sessionStorage.setItem("addest", "no");
                                        _this.establishmentSearchViewModel.sammy.setLocation('#/page/1/');
                                        e.preventDefault();
                                        return false;
                                    });
                                    _this.hasBoundItem = true;
                                }
                            });
                        });
                        scrollBody.scrollMyBody(0);
                        lastURL = "#/new/";
                    } else if (_this.establishmentSearchViewModel.sammy.getLocation().toLowerCase().indexOf("" + _this.editOrNewUrl + "#/page/") > 0) {
                        if (sessionStorage.getItem("addest") === "yes") {
                            _this.establishmentSearchViewModel.clickAction = function (context) {
                                _this.establishmentItemViewModel.parentEstablishment(context);
                                _this.establishmentItemViewModel.parentId(context.id());
                                _this.establishmentSearchViewModel.sammy.setLocation('#/new/');
                                return false;
                            };
                            _this.establishmentSearchViewModel.header("Choose a parent establishment");
                            $asideRootSearch.hide();
                            $asideParentSearch.show();
                            _this.SearchPageBind("parent");
                            _this.establishmentSearchViewModel.header("Choose a parent establishment");
                        } else {
                            $asideRootSearch.show();
                            $asideParentSearch.hide();
                            _this.SearchPageBind("participant");
                            _this.establishmentSearchViewModel.header("Choose a participant");
                            _this.establishmentSearchViewModel.clickAction = function (context) {
                                var myParticipant = new InstitutionalAgreementParticipantModel(false, context.id(), context.officialName(), context.translatedName());
                                var alreadyExist = false;
                                for (var i = 0; i < _this.participants().length; i++) {
                                    if (_this.participants()[i].establishmentId() === myParticipant.establishmentId()) {
                                        alreadyExist = true;
                                        break;
                                    }
                                }
                                if (alreadyExist !== true) {
                                    $.ajax({
                                        url: App.Routes.WebApi.Agreements.Participants.isOwner(myParticipant.establishmentId()),
                                        type: 'GET',
                                        async: false
                                    }).done(function (response) {
                                        myParticipant.isOwner(response);
                                        if (_this.agreementIsEdit()) {
                                            var url = App.Routes.WebApi.Agreements.Participants.put(_this.agreementId, myParticipant.establishmentId());
                                            $.ajax({
                                                type: 'PUT',
                                                url: url,
                                                data: myParticipant,
                                                success: function (response, statusText, xhr) {
                                                    _this.participants.push(myParticipant);
                                                },
                                                error: function (xhr, statusText, errorThrown) {
                                                    alert(xhr.responseText);
                                                }
                                            });
                                        } else {
                                            _this.participants.push(myParticipant);
                                        }
                                        _this.establishmentSearchViewModel.sammy.setLocation("agreements/" + _this.editOrNewUrl + "");
                                        $("body").css("min-height", ($(window).height() + $("body").height() - ($(window).height() * .85)));
                                    }).fail(function () {
                                        if (_this.agreementIsEdit()) {
                                            var url = App.Routes.WebApi.Agreements.Participants.put(_this.agreementId, myParticipant.establishmentId());
                                            $.ajax({
                                                type: 'PUT',
                                                url: url,
                                                data: myParticipant,
                                                success: function (response, statusText, xhr) {
                                                    _this.participants.push(myParticipant);
                                                },
                                                error: function (xhr, statusText, errorThrown) {
                                                    alert(xhr.responseText);
                                                }
                                            });
                                        } else {
                                            _this.participants.push(myParticipant);
                                        }
                                        _this.establishmentSearchViewModel.sammy.setLocation("agreements/" + _this.editOrNewUrl + "");
                                    });
                                } else {
                                    alert("This Participant has already been added.");
                                }
                                return false;
                            };
                        }
                        scrollBody.scrollMyBody(0);
                        lastURL = "#/page/";
                    } else if (_this.establishmentSearchViewModel.sammy.getLocation().toLowerCase().indexOf("agreements/" + _this.editOrNewUrl + "") > 0) {
                        sessionStorage.setItem("addest", "no");
                        lastURL = "#/index";
                        _this.establishmentSearchViewModel.sammy.setLocation('#/index');
                        var dfd = $.Deferred();
                        var dfd2 = $.Deferred();
                        var $obj = $("#estSearch");
                        var $obj2 = $("#addEstablishment");
                        var time = 500;
                        _this.fadeModsOut(dfd, dfd2, $obj, $obj2, time);
                        $.when(dfd, dfd2).done(function () {
                            $("#allParticipants").fadeIn(500).promise().done(function () {
                                $(_this).show();
                                scrollBody.scrollMyBody(0);
                                _this.dfdPageFadeIn.resolve();
                            });
                        });
                    } else {
                        window.location.replace(_this.establishmentSearchViewModel.sammy.getLocation());
                    }
                }
            });
            this.establishmentSearchViewModel.sammy.run();
        }
    };

    InstitutionalAgreementEditModel.prototype._setupValidation = function () {
        ko.validation.rules['greaterThan'] = {
            validator: function (val, otherVal) {
                if (otherVal() == undefined) {
                    return true;
                } else {
                    return Globalize.parseDate(val) > Globalize.parseDate(otherVal());
                }
            },
            message: 'The field must be greater than start date'
        };
        ko.validation.rules.date.validator = function (value, validate) {
            return !value.length || (validate && Globalize.parseDate(value) != null);
        };

        ko.validation.registerExtenders();

        this.validateEffectiveDatesCurrentStatus = ko.validatedObservable({
            startDate: this.startDate.extend({
                required: {
                    message: "Start date is required."
                },
                date: { message: "Start date must valid." },
                maxLength: 50
            }),
            expDate: this.expDate.extend({
                required: {
                    message: "Expiration date is required."
                },
                date: { message: "Expiration date must valid." },
                maxLength: 50,
                greaterThan: this.startDate
            }),
            autoRenew: this.autoRenew.extend({
                required: {
                    message: "Auto renew is required."
                }
            }),
            statusOptionSelected: this.statusOptionSelected.extend({
                required: {
                    message: "Current Status is required."
                }
            })
        });
        this.validateBasicInfo = ko.validatedObservable({
            agreementType: this.typeOptionSelected.extend({
                required: {
                    message: "Agreement type is required."
                },
                maxLength: 50
            }),
            nickname: this.nickname.extend({
                maxLength: 50
            }),
            content: this.content.extend({
                maxLength: 5000
            }),
            privateNotes: this.privateNotes.extend({
                maxLength: 250
            })
        });
    };

    //post files
    InstitutionalAgreementEditModel.prototype.postMe = function (data, url) {
        var _this = this;
        $.post(url, data).done(function (response, statusText, xhr) {
        }).fail(function (xhr, statusText, errorThrown) {
            _this.spinner.stop();
            if (xhr.status === 400) {
                _this.establishmentItemViewModel.$genericAlertDialog.find('p.content').html(xhr.responseText.replace('\n', '<br /><br />'));
                _this.establishmentItemViewModel.$genericAlertDialog.dialog({
                    title: 'Alert Message',
                    dialogClass: 'jquery-ui',
                    width: 'auto',
                    resizable: false,
                    modal: true,
                    buttons: {
                        'Ok': function () {
                            _this.establishmentItemViewModel.$genericAlertDialog.dialog('close');
                        }
                    }
                });
            }
        });
    };

    //part of save agreement
    InstitutionalAgreementEditModel.prototype.agreementPostFiles = function (response, statusText, xhr) {
        var _this = this;
        var tempUrl = App.Routes.WebApi.Agreements.Files.post(this.agreementId);

        $.each(this.files(), function (i, item) {
            var data = ko.mapping.toJS({
                agreementId: item.agreementId,
                uploadGuid: item.guid,
                originalName: item.guid,
                extension: item.extension,
                customName: item.customName,
                visibility: item.visibility
            });
            _this.postMe(data, tempUrl);
        });
        this.spinner.stop();
    };

    //part of save agreement
    InstitutionalAgreementEditModel.prototype.agreementPostContacts = function (response, statusText, xhr) {
        var _this = this;
        var tempUrl = App.Routes.WebApi.Agreements.Contacts.post(this.agreementId);

        $.each(this.contactClass.contacts(), function (i, item) {
            var data = {
                agreementId: _this.agreementId,
                title: item.title(),
                firstName: item.firstName(),
                lastName: item.lastName(),
                userId: item.id(),
                personId: item.personId(),
                phones: item.phones(),
                emailAddress: item.emailAddress(),
                type: item.type(),
                suffix: item.suffix(),
                salutation: item.salutation(),
                displayName: item.displayName(),
                middleName: item.middleName
            };
            _this.postMe(data, tempUrl);
        });
    };

    InstitutionalAgreementEditModel.prototype.saveUpdateAgreement = function () {
        var _this = this;
        var offset;

        if (!this.validateEffectiveDatesCurrentStatus.isValid()) {
            offset = $("#effectiveDatesCurrentStatus").offset();
            this.validateEffectiveDatesCurrentStatus.errors.showAllMessages(true);
            $("#navEffectiveDatesCurrentStatus").closest("ul").find("li").removeClass("current");
            $("#navEffectiveDatesCurrentStatus").addClass("current");
        }
        if (!this.validateBasicInfo.isValid()) {
            offset = $("#basicInfo").offset();
            this.validateBasicInfo.errors.showAllMessages(true);
            $("#navValidateBasicInfo").closest("ul").find("li").removeClass("current");
            $("#navValidateBasicInfo").addClass("current");
        }
        $("#participantsErrorMsg").show();
        if (this.participantsShowErrorMsg()) {
            offset = $("#participants").offset();
            $("#navParticipants").closest("ul").find("li").removeClass("current");
            $("#navParticipants").addClass("current");
        }
        if (offset != undefined) {
            if (!$("body").scrollTop()) {
                $("html, body").scrollTop(offset.top - 20);
            } else {
                $("body").scrollTop(offset.top - 20);
            }
        } else {
            var url;
            var $LoadingPage = $("#LoadingPage").find("strong");
            var editor = $("#agreementContent").data("kendoEditor");
            this.spinner.start();

            if (!$("body").scrollTop()) {
                $("html, body").scrollTop(0);
            } else {
                $("body").scrollTop(0);
            }
            var $LoadingPage = $("#LoadingPage").find("strong");
            $LoadingPage.text("Saving agreement...");
            $("#allParticipants").show().fadeOut(500, function () {
                $("#LoadingPage").hide().fadeIn(500);
            });

            $.each(this.participants(), function (i, item) {
                _this.participantsExport.push({
                    agreementId: item.agreementId,
                    establishmentId: item.establishmentId,
                    establishmentOfficialName: item.establishmentOfficialName,
                    establishmentTranslatedName: item.establishmentTranslatedName,
                    isOwner: item.isOwner,
                    center: item.center
                });
            });
            var myAutoRenew = null;
            if (this.autoRenew() == 0) {
                myAutoRenew = false;
            } else if (this.autoRenew() == 1) {
                myAutoRenew = true;
            }

            this.content(editor.value());

            var data = ko.mapping.toJS({
                content: this.content(),
                expiresOn: this.expDate(),
                startsOn: this.startDate(),
                isAutoRenew: myAutoRenew,
                name: this.nickname(),
                notes: this.privateNotes(),
                status: this.statusOptionSelected(),
                visibility: this.visibility(),
                isExpirationEstimated: this.isEstimated(),
                participants: this.participantsExport,
                umbrellaId: this.uAgreementSelected(),
                type: this.typeOptionSelected()
            });
            if (this.agreementIsEdit()) {
                url = App.Routes.WebApi.Agreements.put(this.agreementId);
                $.ajax({
                    type: 'PUT',
                    url: url,
                    data: data,
                    success: function (response, statusText, xhr) {
                        $LoadingPage.text("Agreement Saved...");
                        setTimeout(function () {
                            $("#LoadingPage").show().fadeOut(500, function () {
                                $("#allParticipants").hide().fadeIn(500);
                            });
                        }, 5000);
                    },
                    error: function (xhr, statusText, errorThrown) {
                        _this.spinner.stop();
                        if (xhr.status === 400) {
                            _this.establishmentItemViewModel.$genericAlertDialog.find('p.content').html(xhr.responseText.replace('\n', '<br /><br />'));
                            _this.establishmentItemViewModel.$genericAlertDialog.dialog({
                                title: 'Alert Message',
                                dialogClass: 'jquery-ui',
                                width: 'auto',
                                resizable: false,
                                modal: true,
                                buttons: {
                                    'Ok': function () {
                                        _this.establishmentItemViewModel.$genericAlertDialog.dialog('close');
                                    }
                                }
                            });
                        }
                    }
                });
            } else {
                url = App.Routes.WebApi.Agreements.post();
                $.post(url, data).done(function (response, statusText, xhr) {
                    var myUrl = xhr.getResponseHeader('Location');
                    _this.agreementId = parseInt(myUrl.substring(myUrl.lastIndexOf("/") + 1));
                    _this.agreementPostFiles(response, statusText, xhr);
                    _this.agreementPostContacts(response, statusText, xhr);

                    //change url to edit
                    $LoadingPage.text("Agreement Saved...");
                    setTimeout(function () {
                        if (xhr != undefined) {
                            window.location.hash = "";
                            window.location.href = "/agreements/" + xhr.getResponseHeader('Location').substring(xhr.getResponseHeader('Location').lastIndexOf("/") + 1) + "/edit/";
                        } else {
                            alert("success, but no location");
                        }
                    }, 5000);
                }).fail(function (xhr, statusText, errorThrown) {
                    _this.spinner.stop();
                    if (xhr.status === 400) {
                        _this.establishmentItemViewModel.$genericAlertDialog.find('p.content').html(xhr.responseText.replace('\n', '<br /><br />'));
                        _this.establishmentItemViewModel.$genericAlertDialog.dialog({
                            title: 'Alert Message',
                            dialogClass: 'jquery-ui',
                            width: 'auto',
                            resizable: false,
                            modal: true,
                            buttons: {
                                'Ok': function () {
                                    _this.establishmentItemViewModel.$genericAlertDialog.dialog('close');
                                }
                            }
                        });
                    }
                });
            }
        }
    };
    return InstitutionalAgreementEditModel;
})();
