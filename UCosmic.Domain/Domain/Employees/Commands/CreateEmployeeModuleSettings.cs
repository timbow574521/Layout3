﻿using System;
using System.Collections.Generic;
using System.Linq;
using FluentValidation;
using UCosmic.Domain.Establishments;
using UCosmic.Domain.People;

namespace UCosmic.Domain.Employees
{
    public class CreateEmployeeModuleSettings
    {
        public CreateEmployeeModuleSettings()
        {
            NotifyAdminOnUpdate = false;
            OfferCountry = false;
            OfferActivityTypes = false;
            OfferFundingQuestions = false;
        }

        public ICollection<EmployeeFacultyRank> EmployeeFacultyRanks { get; set; } // TODO: eliminate entity property from command
        public bool NotifyAdminOnUpdate { get; set; }
        public int NotifyAdminPersonId { get; set; }
        public string PersonalInfoAnchorText { get; set; }
        public int EstablishmentId { get; set; }
        public ICollection<EmployeeActivityType> EmployeeActivityTypes { get; set; }
        public bool OfferCountry { get; set; }
        public bool OfferActivityTypes { get; set; }
        public bool OfferFundingQuestions { get; set; }
        public string InternationalPedigreeTitle { get; set; }
        public DateTime? EstablishmentsExternalSyncDate { get; set; }
        public DateTime? EstablishmentsLastUpdateAttempt { get; set; }
        public int? EstablishmentsUpdateFailCount { get; set; }
        public string EstablishmentsLastUpdateResult { get; set; } /* success, inprogress, failed */

        public EmployeeModuleSettings CreatedEmployeeModuleSettings { get; internal set; }
    }

    public class ValidateCreateEmployeeModuleSettingsCommand : AbstractValidator<CreateEmployeeModuleSettings>
    {
        public ValidateCreateEmployeeModuleSettingsCommand(IQueryEntities entities)
        {
            CascadeMode = CascadeMode.StopOnFirstFailure;

            RuleFor(x => x.EstablishmentId)
                .MustFindEstablishmentById(entities)
                    .WithMessage(MustFindEstablishmentById.FailMessageFormat, x => x.EstablishmentId)
            ;
        }
    }

    public class HandleCreateEmployeeModuleSettingsCommand : IHandleCommands<CreateEmployeeModuleSettings>
    {
        private readonly ICommandEntities _entities;

        public HandleCreateEmployeeModuleSettingsCommand(ICommandEntities entities)
        {
            _entities = entities;
        }

        public void Handle(CreateEmployeeModuleSettings command)
        {
            if (command == null) throw new ArgumentNullException("command");

            var employeeModuleSettings = new EmployeeModuleSettings
            {
                FacultyRanks = command.EmployeeFacultyRanks,
                NotifyAdminOnUpdate = command.NotifyAdminOnUpdate,
                NotifyAdmins = new[] { _entities.Get<Person>().SingleOrDefault(x => x.RevisionId == command.NotifyAdminPersonId) },
                PersonalInfoAnchorText = command.PersonalInfoAnchorText,
                Establishment = _entities.Get<Establishment>().SingleOrDefault(x => x.RevisionId == command.EstablishmentId),
                ActivityTypes = command.EmployeeActivityTypes,
                OfferCountry = command.OfferCountry,
                OfferActivityType = command.OfferActivityTypes,
                OfferFundingQuestions = command.OfferFundingQuestions,
                InternationalPedigreeTitle = command.InternationalPedigreeTitle,
                EstablishmentsExternalSyncDate = command.EstablishmentsExternalSyncDate
            };

            _entities.Create(employeeModuleSettings);

            command.CreatedEmployeeModuleSettings = employeeModuleSettings;
        }
    }
}
