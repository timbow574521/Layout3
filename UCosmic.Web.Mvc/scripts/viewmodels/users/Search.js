var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var ViewModels;
(function (ViewModels) {
    (function (Users) {
        var Search = (function (_super) {
            __extends(Search, _super);
            function Search() {
                        _super.call(this);
                this.sammy = Sammy();
                this.$historyJson = ko.observable();
                this._history = ko.observableArray([]);
                this._historyIndex = 0;
                this.impersonateUserName = ko.observable();
                this.flasherProxy = new App.FlasherProxy();
                this._init();
            }
            Search.prototype._init = function () {
                this._setupHistory();
                this._setupSammy();
                this._setupQueryComputed();
                this._setupPagingDefaults();
            };
            Search.prototype._pullResults = function () {
                var _this = this;
                var deferred = $.Deferred();
                var queryParameters = {
                    pageSize: this.pageSize(),
                    pageNumber: this.pageNumber(),
                    keyword: this.throttledKeyword(),
                    orderBy: this.orderBy()
                };
                this.spinner.start();
                this.nextForceDisabled(true);
                this.prevForceDisabled(true);
                $.get(App.Routes.WebApi.Identity.Users.get(), queryParameters).done(function (response, statusText, xhr) {
                    deferred.resolve(response, statusText, xhr);
                }).fail(function (xhr, statusText, errorThrown) {
                    deferred.reject(xhr, statusText, errorThrown);
                }).always(function () {
                    _this.spinner.stop();
                    _this.nextForceDisabled(false);
                    _this.prevForceDisabled(false);
                });
                return deferred;
            };
            Search.prototype._loadResults = function (results) {
                var _this = this;
                var resultsMapping = {
                    items: {
                        key: function (data) {
                            return ko.utils.unwrapObservable(data.id);
                        },
                        create: function (options) {
                            return new ViewModels.Users.SearchResult(options.data, _this);
                        }
                    },
                    ignore: [
                        'pageSize', 
                        'pageNumber'
                    ]
                };
                ko.mapping.fromJS(results, resultsMapping, this);
                this.transitionedPageNumber(this.pageNumber());
            };
            Search.prototype._setupQueryComputed = function () {
                var _this = this;
                ko.computed(function () {
                    if(_this.pageSize() === undefined || _this.orderBy() === undefined) {
                        return;
                    }
                    _this._pullResults().done(function (response) {
                        _this._loadResults(response);
                    }).fail(function () {
                    });
                }).extend({
                    throttle: 250
                });
            };
            Search.prototype._setupSammy = function () {
                var _this = this;
                var self = this;
                this.sammy.before(/\#\/page\/(.*)/, function () {
                    if(self.nextForceDisabled() || self.prevForceDisabled()) {
                        return false;
                    }
                    if(self._history().length > 1) {
                        var toPath = this.path;
                        for(var i = 0; i < self._history().length; i++) {
                            var existingPath = self._history()[i];
                            if(toPath === existingPath) {
                                self._historyIndex = i;
                                return true;
                            }
                        }
                    }
                    self._history.push(this.path);
                    self._historyIndex = self._history().length - 1;
                    return true;
                });
                this.sammy.get(this.getPageHash(':pageNumber'), function () {
                    var pageNumber = this.params['pageNumber'];
                    if(pageNumber && parseInt(pageNumber) !== parseInt(self.pageNumber())) {
                        self.pageNumber(parseInt(pageNumber));
                    }
                    document.title = 'Users (Page #' + self.pageNumber() + ')';
                });
                this.sammy.get('/users[\/]?', function () {
                    _this.sammy.setLocation(_this.getPageHash(1));
                });
            };
            Search.prototype._setupHistory = function () {
                var _this = this;
                this.$historyJson.subscribe(function (newValue) {
                    if(newValue && newValue.length) {
                        var json = newValue.val();
                        if(json) {
                            var js = $.parseJSON(json);
                            ko.mapping.fromJS(js, {
                            }, _this._history);
                        }
                    }
                });
                this._history.subscribe(function (newValue) {
                    if(_this.$historyJson() && _this.$historyJson().length) {
                        var currentJson = _this.$historyJson().val();
                        var newJson = ko.toJSON(newValue);
                        if(currentJson !== newJson) {
                            _this.$historyJson().val(newJson);
                        }
                    }
                });
            };
            Search.prototype._setupPagingDefaults = function () {
                this.orderBy($('input[type=hidden][data-bind*="value: orderBy"]').val());
                this.pageSize($('input[type=hidden][data-bind*="value: pageSize"]').val());
            };
            Search.prototype.nextPage = function () {
                this._gotoPage(1);
            };
            Search.prototype.prevPage = function () {
                this._gotoPage(-1);
            };
            Search.prototype._gotoPage = function (pageDelta) {
                if(pageDelta == 0) {
                    return;
                }
                var isEnabled = pageDelta < 0 ? this.prevEnabled() : this.nextEnabled();
                if(isEnabled) {
                    var pageNumber = parseInt(this.pageNumber()) + pageDelta;
                    if(pageNumber > 0 && pageNumber <= this.pageCount()) {
                        if(this._history().length > 1) {
                            var toPath = location.pathname + this.getPageHash(pageNumber);
                            var i = (pageDelta < 0) ? 0 : this._history().length - 1;
                            var iMove = function () {
                                if(pageDelta < 0) {
                                    i++;
                                } else {
                                    i--;
                                }
                            };
                            for(; i < this._history().length && i >= 0; iMove()) {
                                var existingPath = this._history()[i];
                                if(toPath === existingPath) {
                                    var historyDelta = i - this._historyIndex;
                                    history.go(historyDelta);
                                    this._historyIndex = i;
                                    return;
                                }
                            }
                        }
                        this.pageNumber(pageNumber);
                        var pagePath = this.getPageHash(pageNumber);
                        if(this.sammy.getLocation() !== pagePath) {
                            this.sammy.setLocation(pagePath);
                        }
                    }
                }
            };
            return Search;
        })(ViewModels.PagedSearch);
        Users.Search = Search;        
        var RoleGrantValidator = (function () {
            function RoleGrantValidator() {
                this._ruleName = 'validRoleGrant';
                this._isAwaitingResponse = false;
                this.async = true;
                this.message = 'error';
                ko.validation.rules[this._ruleName] = this;
                ko.validation.addExtender(this._ruleName);
            }
            RoleGrantValidator.prototype.validator = function (val, vm, callback) {
                var _this = this;
                if(!vm.selectedRoleOption()) {
                    callback(true);
                    return;
                }
                if(!this._isAwaitingResponse) {
                    var route = App.Routes.WebApi.Identity.Users.Roles.validateGrant(vm.id(), vm.selectedRoleOption());
                    this._isAwaitingResponse = true;
                    $.post(route).always(function () {
                        _this._isAwaitingResponse = false;
                    }).done(function () {
                        callback(true);
                    }).fail(function (xhr) {
                        callback({
                            isValid: false,
                            message: xhr.responseText
                        });
                    });
                }
            };
            return RoleGrantValidator;
        })();        
        new RoleGrantValidator();
        var RoleRevokeValidator = (function () {
            function RoleRevokeValidator() {
                this._ruleName = 'validRoleRevoke';
                this._isAwaitingResponse = false;
                this.async = true;
                this.message = 'error';
                ko.validation.rules[this._ruleName] = this;
                ko.validation.addExtender(this._ruleName);
            }
            RoleRevokeValidator.prototype.validator = function (val, vm, callback) {
                var _this = this;
                if(!vm.roleToRevoke()) {
                    callback(true);
                    return;
                }
                if(!this._isAwaitingResponse) {
                    var route = App.Routes.WebApi.Identity.Users.Roles.validateRevoke(vm.id(), vm.roleToRevoke());
                    this._isAwaitingResponse = true;
                    $.post(route).always(function () {
                        _this._isAwaitingResponse = false;
                    }).done(function () {
                        callback(true);
                    }).fail(function (xhr) {
                        callback({
                            isValid: false,
                            message: xhr.responseText
                        });
                    });
                }
            };
            return RoleRevokeValidator;
        })();        
        new RoleRevokeValidator();
        var SearchResult = (function () {
            function SearchResult(values, owner) {
                var _this = this;
                this.roleOptions = ko.observableArray();
                this.roleOptionsCaption = ko.observable('[Loading...]');
                this.selectedRoleOption = ko.observable();
                this.roleToRevoke = ko.observable();
                this.$roleSelect = ko.observable();
                this.roleSpinner = new ViewModels.Spinner({
                    delay: 0,
                    isVisible: true
                });
                this.isRevokeError = ko.observable();
                this.revokeErrorText = ko.observable();
                this.isGrantError = ko.observable();
                this.grantErrorText = ko.observable();
                this.$menu = ko.observable();
                this.isEditingRoles = ko.observable(false);
                this._owner = owner;
                var userMapping = {
                    roles: {
                        create: function (options) {
                            return new ViewModels.Users.RoleGrant(options.data, _this);
                        }
                    }
                };
                ko.mapping.fromJS(values, userMapping, this);
                this._setupPhotoComputeds();
                this._setupNamingComputeds();
                this._setupRoleGrantComputeds();
                this._setupMenuSubscription();
                this._setupValidation();
            }
            SearchResult.prototype._setupPhotoComputeds = function () {
                var _this = this;
                this.photoSrc = ko.computed(function () {
                    return App.Routes.WebApi.People.Photo.get(_this.personId(), 100);
                });
            };
            SearchResult.prototype._setupNamingComputeds = function () {
                var _this = this;
                this.hasUniqueDisplayName = ko.computed(function () {
                    return _this.name() !== _this.personDisplayName();
                });
            };
            SearchResult.prototype._setupRoleGrantComputeds = function () {
                var _this = this;
                this.hasGrants = ko.computed(function () {
                    return _this.roles().length > 0;
                });
                this.hasNoGrants = ko.computed(function () {
                    return !_this.hasGrants();
                });
                this.isRoleGrantDisabled = ko.computed(function () {
                    return _this.roleSpinner.isVisible() || !_this.selectedRoleOption();
                });
                this.selectedRoleOption.subscribe(function (newValue) {
                    if(newValue && typeof (newValue) === 'string') {
                        _this.selectedRoleOption(parseInt(newValue));
                    }
                });
            };
            SearchResult.prototype._setupMenuSubscription = function () {
                this.$menu.subscribe(function (newValue) {
                    if(newValue && newValue.length) {
                        newValue.kendoMenu();
                    }
                });
            };
            SearchResult.prototype._setupValidation = function () {
                var _this = this;
                this.selectedRoleOption.extend({
                    validRoleGrant: this
                });
                this.roleToRevoke.extend({
                    validRoleRevoke: this
                });
                this.isValidating = ko.computed(function () {
                    return _this.selectedRoleOption.isValidating() || _this.roleToRevoke.isValidating();
                });
                this.selectedRoleOption.subscribe(function (newValue) {
                    _this.roleToRevoke(undefined);
                });
                ko.validation.group(this);
            };
            SearchResult.prototype._pullRoleOptions = function () {
                var _this = this;
                this.selectedRoleOption(undefined);
                this.roleSpinner.start();
                var deferred = $.Deferred();
                var queryParameters = {
                    pageSize: Math.pow(2, 32) / 2 - 1,
                    orderBy: 'name-asc'
                };
                $.get(App.Routes.WebApi.Identity.Roles.get(), queryParameters).done(function (response, statusText, xhr) {
                    deferred.resolve(response, statusText, xhr);
                }).fail(function (xhr, statusText, errorThrown) {
                    deferred.reject(xhr, statusText, errorThrown);
                }).always(function () {
                    _this.roleSpinner.stop();
                });
                return deferred;
            };
            SearchResult.prototype._loadRoleOptions = function (results) {
                ko.mapping.fromJS(results.items, {
                }, this.roleOptions);
                this.roleOptionsCaption('[Select access to grant...]');
                this._syncRoleOptions();
                if(this.$roleSelect && this.$roleSelect().length) {
                    var roleOptions = this.roleOptions();
                    var roleData = [];
                    roleData.push({
                        name: this.roleOptionsCaption()
                    });
                    for(var i = 0; i < roleOptions.length; i++) {
                        roleData.push({
                            id: roleOptions[i].id(),
                            name: roleOptions[i].name(),
                            description: roleOptions[i].description()
                        });
                    }
                    this.$roleSelect().kendoDropDownList({
                        height: 300,
                        dataSource: roleData,
                        dataTextField: 'name',
                        dataValueField: 'id',
                        template: '#if (data.id) {# <div><strong>${ data.name }</strong></div>\r\n' + '#} else {#<div>${ data.name }</div>\r\n #}#' + '#if (data.description) {# <div><small>${ data.description }</small></div> #}#'
                    });
                }
            };
            SearchResult.prototype._syncRoleOptions = function () {
                for(var i = 0; i < this.roleOptions().length; i++) {
                    var option = this.roleOptions()[i];
                    for(var ii = 0; ii < this.roles().length; ii++) {
                        var grant = this.roles()[ii];
                        if(option.id() == grant.id()) {
                            if(i === 0) {
                                this.roleOptions.shift();
                            } else {
                                if(i == this.roleOptions().length) {
                                    this.roleOptions.pop();
                                } else {
                                    this.roleOptions.splice(i, 1);
                                }
                            }
                            i = -1;
                        }
                    }
                }
            };
            SearchResult.prototype.pullRoleGrants = function () {
                var _this = this;
                this.roleSpinner.start();
                var deferred = $.Deferred();
                $.get(App.Routes.WebApi.Identity.Users.Roles.get(this.id())).done(function (response, statusText, xhr) {
                    deferred.resolve(response, statusText, xhr);
                }).fail(function (xhr, statusText, errorThrown) {
                    deferred.reject(xhr, statusText, errorThrown);
                }).always(function () {
                    _this.roleSpinner.stop();
                });
                return deferred;
            };
            SearchResult.prototype.loadRoleGrants = function (results) {
                var _this = this;
                var grantMapping = {
                    create: function (options) {
                        return new ViewModels.Users.RoleGrant(options.data, _this);
                    }
                };
                ko.mapping.fromJS(results, grantMapping, this.roles);
            };
            SearchResult.prototype.impersonate = function () {
                var form = this._owner.impersonateForm;
                if(form) {
                    this._owner.impersonateUserName(this.name());
                    $(form).submit();
                }
            };
            SearchResult.prototype.showRoleEditor = function () {
                var _this = this;
                this.isEditingRoles(true);
                this._pullRoleOptions().done(function (response) {
                    _this._loadRoleOptions(response);
                });
            };
            SearchResult.prototype.hideRoleEditor = function () {
                this.roleToRevoke(undefined);
                this.isEditingRoles(false);
            };
            SearchResult.prototype.grantRole = function () {
                var _this = this;
                this.roleSpinner.start();
                this.roleToRevoke(undefined);
                if(this.isValidating()) {
                    setTimeout(function () {
                        _this.grantRole();
                    }, 50);
                    return false;
                }
                if(!this.isValid()) {
                    this.errors.showAllMessages();
                    this.roleSpinner.stop();
                    return false;
                }
                var url = App.Routes.WebApi.Identity.Users.Roles.put(this.id(), this.selectedRoleOption());
                $.ajax({
                    url: url,
                    type: 'PUT'
                }).done(function (response, textStatus, xhr) {
                    App.flasher.flash(response);
                    _this.roleOptions.remove(function (item) {
                        return item.id() == _this.selectedRoleOption();
                    });
                    _this.pullRoleGrants().done(function (response) {
                        _this.loadRoleGrants(response);
                        _this._pullRoleOptions().done(function (response) {
                            _this._loadRoleOptions(response);
                        });
                    });
                }).fail(function (xhr, textStatus, errorThrown) {
                    _this.isGrantError(true);
                    _this.grantErrorText('An unexpected error occurred while trying to grant access.');
                    _this.roleSpinner.stop();
                });
            };
            SearchResult.prototype.revokeRole = function (roleId) {
                var _this = this;
                this.roleSpinner.start();
                this.roleToRevoke(roleId);
                if(this.isValidating()) {
                    setTimeout(function () {
                        _this.revokeRole(roleId);
                    }, 50);
                    return false;
                }
                if(!this.isValid()) {
                    this.errors.showAllMessages();
                    this.roleSpinner.stop();
                    return false;
                }
                var url = App.Routes.WebApi.Identity.Users.Roles.del(this.id(), roleId);
                $.ajax({
                    url: url,
                    type: 'DELETE'
                }).done(function (response, textStatus, xhr) {
                    App.flasher.flash(response);
                    _this.roleToRevoke(undefined);
                    _this.pullRoleGrants().done(function (response) {
                        _this.loadRoleGrants(response);
                        _this._pullRoleOptions().done(function (response) {
                            _this._loadRoleOptions(response);
                        });
                    });
                }).fail(function (xhr, textStatus, errorThrown) {
                    _this.isRevokeError(true);
                    _this.grantErrorText('An unexpected error occurred while trying to revoke access.');
                    _this.roleSpinner.stop();
                });
            };
            SearchResult.prototype.dismissError = function () {
                this.isRevokeError(false);
                this.revokeErrorText(undefined);
                this.isGrantError(false);
                this.grantErrorText(undefined);
            };
            return SearchResult;
        })();
        Users.SearchResult = SearchResult;        
        var RoleGrant = (function () {
            function RoleGrant(values, owner) {
                this._owner = owner;
                ko.mapping.fromJS(values, {
                }, this);
            }
            RoleGrant.prototype.revokeRole = function () {
                var _this = this;
                this.$confirmPurgeDialog.dialog({
                    dialogClass: 'jquery-ui',
                    width: 'auto',
                    resizable: false,
                    modal: true,
                    buttons: [
                        {
                            text: 'Yes, confirm revoke',
                            click: function () {
                                _this._owner.revokeRole(_this.id());
                                _this.$confirmPurgeDialog.dialog('close');
                            }
                        }, 
                        {
                            text: 'No, cancel revoke',
                            click: function () {
                                _this.$confirmPurgeDialog.dialog('close');
                            },
                            'data-css-link': true
                        }
                    ]
                });
            };
            return RoleGrant;
        })();
        Users.RoleGrant = RoleGrant;        
    })(ViewModels.Users || (ViewModels.Users = {}));
    var Users = ViewModels.Users;
})(ViewModels || (ViewModels = {}));
