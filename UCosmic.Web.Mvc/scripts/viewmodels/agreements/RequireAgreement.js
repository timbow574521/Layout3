require([
    "viewmodels/agreements/AgreementVM", 
    'jquery/jquery-1.8.2'
], function (Agreement) {
    var agreementViewModel = new Agreement.InstitutionalAgreementEditModel();
    ko.applyBindings(agreementViewModel, $('#allParticipants')[0]);
});
