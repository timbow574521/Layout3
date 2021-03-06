/// <reference path="../../jquery/jquery-1.8.d.ts" />
/// <reference path="../../jquery/jqueryui-1.9.d.ts" />
/// <reference path="../../ko/knockout-2.2.d.ts" />
/// <reference path="../../ko/knockout.mapping-2.0.d.ts" />
/// <reference path="../../ko/knockout.extensions.d.ts" />
/// <reference path="../../ko/knockout.validation.d.ts" />
/// <reference path="../../kendo/kendouiweb.d.ts" />
/// <reference path="../../tinymce/tinymce.d.ts" />
/// <reference path="../../oss/moment.d.ts" />
/// <reference path="../../app/Routes.ts" />


module ViewModels.LanguageExpertises {
    // ================================================================================
    /* 
    */
    // ================================================================================
    export class LanguageExpertise {
        /* Initialization errors. */
        inititializationErrors: string = "";

        /* In the process of saving. */
        saving: bool = false;

        /* True if any field changes. */
        dirtyFlag: KnockoutObservableBool = ko.observable( false );

        /* Languages */
        languageList: any;

        /* Proficiencies */
        proficiencyInfo: any;

        /* Api Model */
        id: KnockoutObservableNumber;           // if 0, new expertise
        version: KnockoutObservableString;      // byte[] converted to base64
        personId: KnockoutObservableNumber;
        whenLastUpdated: KnockoutObservableString;
        whoLastUpdated: KnockoutObservableString;
        languageId: KnockoutObservableAny;
        dialect: KnockoutObservableString;
        other: KnockoutObservableString;
        speakingProficiency: KnockoutObservableNumber;
        listeningProficiency: KnockoutObservableNumber;
        readingProficiency: KnockoutObservableNumber;
        writingProficiency: KnockoutObservableNumber;

        /* Validation */
        errors: KnockoutValidationErrors;
        isValid: () => bool;
        isAnyMessageShown: () => bool;

        // --------------------------------------------------------------------------------
        /*
        */
        // --------------------------------------------------------------------------------
        _initialize( expertiseId: string ): void {
            if (expertiseId === "new") {
                this.id = ko.observable( 0 );
            } else {
                this.id = ko.observable( Number(expertiseId) );
            }
        }

        // --------------------------------------------------------------------------------
        /*
        */
        // --------------------------------------------------------------------------------   
        setupWidgets( languageInputId: string,
                      speakingInputId: string,
                      listeningInputId: string,
                      readingInputId: string,
                      writingInputId: string
             ): void {

            $("#" + languageInputId).kendoDropDownList({
                dataTextField: "name",
                dataValueField: "id",
                dataSource: this.languageList,
                value: this.languageId() != null ? this.languageId() : 0,
                change: (e: any) => {
                    var item = this.languageList[e.sender.selectedIndex];
                    if ( item.name == "Other" ) {
                        this.languageId(null);
                    } else {
                        this.languageId(item.id);
                    }
                }
            }); 

            /* For some reason, setting the value in the droplist creation above to 0,
                does not set the item to "Other" */
            if (this.languageId() == null) {
                var dropdownlist = $("#" + languageInputId).data("kendoDropDownList");
                dropdownlist.select(function(dataItem) { return dataItem.name === "Other"} );
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
        }

        // --------------------------------------------------------------------------------
        /*
        */
        // --------------------------------------------------------------------------------
        setupValidation(): void {
            ko.validation.rules['atLeast'] = {
                validator: ( val: any, otherVal: any ): bool => {
                    return val.length >= otherVal;
                },
                message: 'At least {0} must be selected.'
            };

            ko.validation.registerExtenders();
            
            //this.locations.extend( { atLeast: 1 } );
            //this.description.extend( { maxLength: 400 } );

            ko.validation.group( this );
        }

        // --------------------------------------------------------------------------------
        /*
        */
        // --------------------------------------------------------------------------------  
        constructor( expertiseId: string ) {
            this._initialize( expertiseId );
        }

        // --------------------------------------------------------------------------------
        /* 
        */
        // --------------------------------------------------------------------------------
        load(): JQueryPromise {
            var deferred: JQueryDeferred = $.Deferred();

            var proficienciesPact = $.Deferred();
            $.get( App.Routes.WebApi.LanguageProficiency.get() )
                            .done( ( data: any, textStatus: string, jqXHR: JQueryXHR ): void => {
                                proficienciesPact.resolve( data );
                            } )
                            .fail( ( jqXHR: JQueryXHR, textStatus: string, errorThrown: string ): void => {
                                proficienciesPact.reject( jqXHR, textStatus, errorThrown );
                            } );

            var languagesPact = $.Deferred();
            $.get( App.Routes.WebApi.Languages.get() )
                            .done( ( data: any, textStatus: string, jqXHR: JQueryXHR ): void => {
                                languagesPact.resolve( data );
                            } )
                            .fail( ( jqXHR: JQueryXHR, textStatus: string, errorThrown: string ): void => {
                                languagesPact.reject( jqXHR, textStatus, errorThrown );
                            } );

            if ( this.id() == 0 ) {
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

                $.when( languagesPact, proficienciesPact )
                                .done( ( languages: any, proficiencyInfo: any, data: any ): void => {

                                    this.languageList = languages;
                                    this.languageList.push( {name: "Other", code: "", id: 0 } );

                                    this.proficiencyInfo = proficiencyInfo;

                                    deferred.resolve();
                                } )
                                .fail( ( xhr: JQueryXHR, textStatus: string, errorThrown: string ): void => {
                                    deferred.reject( xhr, textStatus, errorThrown );
                                } );
            }
            else {
                var dataPact = $.Deferred();
                $.ajax( {
                    type: "GET",
                    url: App.Routes.WebApi.LanguageExpertises.get( this.id() ),
                    success: function ( data: any, textStatus: string, jqXhr: JQueryXHR ): void
                        { dataPact.resolve( data ); },
                    error: function ( jqXhr: JQueryXHR, textStatus: string, errorThrown: string ): void
                        { dataPact.reject( jqXhr, textStatus, errorThrown ); },
                } );

                $.when( languagesPact, proficienciesPact, dataPact )
                              .done( ( languages: any, proficiencyInfo: any, data: any ): void => {

                                  this.languageList = languages;
                                  this.languageList.push( {name: "Other", code: "", id: 0 } );

                                  this.proficiencyInfo = proficiencyInfo;

                                  ko.mapping.fromJS( data, {}, this );

                                  this.languageId.subscribe( ( newValue: any ): void => { this.dirtyFlag( true ); } );
                                  this.other.subscribe( ( newValue: any ): void => { this.dirtyFlag( true ); } );
                                  this.dialect.subscribe( ( newValue: any ): void => { this.dirtyFlag( true ); } );
                                  this.speakingProficiency.subscribe( ( newValue: any ): void => { this.dirtyFlag( true ); } );
                                  this.listeningProficiency.subscribe( ( newValue: any ): void => { this.dirtyFlag( true ); } );
                                  this.readingProficiency.subscribe( ( newValue: any ): void => { this.dirtyFlag( true ); } );
                                  this.writingProficiency.subscribe( ( newValue: any ): void => { this.dirtyFlag( true ); } );

                                  deferred.resolve();
                              } )
                              .fail( ( xhr: JQueryXHR, textStatus: string, errorThrown: string ): void => {
                                  deferred.reject( xhr, textStatus, errorThrown );
                              } );
            }

            return deferred;
        }

        // --------------------------------------------------------------------------------
        /*
        */
        // --------------------------------------------------------------------------------
        save( viewModel: any, event: any ): void {

            if (!this.isValid()) {
                // TBD - need dialog here.
                return;
            }

            while ( this.saving ) {
                alert( "Please wait while expertise is saved." ); // TBD: dialog
            }

            var mapSource = {
                id : this.id,
                version : this.version,
                personId : this.personId,
                whenLastUpdated : this.whenLastUpdated,
                whoLastUpdated : this.whoLastUpdated,
                languageId: this.languageId,
                dialect: this.dialect,
                other: this.other,
                speakingProficiency: this.speakingProficiency,
                listeningProficiency: this.listeningProficiency,
                readingProficiency: this.readingProficiency,
                writingProficiency: this.writingProficiency,
            };
               
            var model = ko.mapping.toJS(mapSource);

            var url = (viewModel.id() == 0) ?
                        App.Routes.WebApi.LanguageExpertises.post() :
                        App.Routes.WebApi.LanguageExpertises.put( viewModel.id() );
            var type = (viewModel.id() == 0) ?  "POST" : "PUT";

            this.saving = true;
            $.ajax( {
                type: type,
                url: url,
                data: model,
                dataType: 'json',
                success: ( data: any, textStatus: string, jqXhr: JQueryXHR ): void => {
                    this.saving = false;
                    location.href = App.Routes.Mvc.My.Profile.get("language-expertise");
                },
                error: ( jqXhr: JQueryXHR, textStatus: string, errorThrown: string ): void => {
                    this.saving = false;
                    alert( textStatus + " | " + errorThrown );
                    location.href = App.Routes.Mvc.My.Profile.get("language-expertise");
                }
            } );
        }

        // --------------------------------------------------------------------------------
        /*  
        */
        // --------------------------------------------------------------------------------
        cancel( item: any, event: any, mode: string ): void {
            if ( this.dirtyFlag() == true ) {
                $( "#cancelConfirmDialog" ).dialog( {
                    modal: true,
                    resizable: false,
                    width: 450,
                    buttons: {
                        "Do not cancel": function () {
                            $( this ).dialog( "close" );
                        },
                        "Cancel and lose changes": function () {
                            $( this ).dialog( "close" );
                            location.href = App.Routes.Mvc.My.Profile.get("language-expertise");
                        }
                    }
                } );
            }
            else {
                location.href = App.Routes.Mvc.My.Profile.get("language-expertise");
            }
        }
    }
}
