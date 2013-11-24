﻿using System;
using System.Linq;
using System.Linq.Expressions;
using System.Security.Principal;
using Newtonsoft.Json;
using UCosmic.Domain.Employees;
using UCosmic.Domain.Establishments;
using UCosmic.Domain.Identity;
using UCosmic.Domain.People;

namespace UCosmic.Domain.External
{
    public class ImportUsfPerson
    {
        internal ImportUsfPerson(IPrincipal principal, UsfFacultyProfileService service, int userId)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            if (service == null) throw new ArgumentNullException("service");
            Principal = principal;
            Service = service;
            UserId = userId;
        }

        internal IPrincipal Principal { get; private set; }
        internal UsfFacultyProfileService Service { get; private set; }
        internal int UserId { get; private set; }
        internal WorkReportBuilder ReportBuilder { get; set; }
    }

    public class HandleImportUsfPersonCommand : IHandleCommands<ImportUsfPerson>
    {
        private readonly IProcessQueries _queryProcessor;
        private readonly ICommandEntities _entities;
        private readonly IHandleCommands<ImportUsfEstablishments> _importEstablishments;
        private readonly IHandleCommands<CreateAffiliation> _createAffiliation;
        private readonly IHandleCommands<CreateEmailAddress> _createEmailAddress;
        private readonly IHandleCommands<UpdatePerson> _updatePerson;

        public HandleImportUsfPersonCommand(IProcessQueries queryProcessor
            , ICommandEntities entities
            , IHandleCommands<ImportUsfEstablishments> importEstablishments
            , IHandleCommands<CreateAffiliation> createAffiliation
            , IHandleCommands<CreateEmailAddress> createEmailAddress
            , IHandleCommands<UpdatePerson> updatePerson
        )
        {
            _queryProcessor = queryProcessor;
            _entities = entities;
            _importEstablishments = importEstablishments;
            _createAffiliation = createAffiliation;
            _createEmailAddress = createEmailAddress;
            _updatePerson = updatePerson;
        }

        public void Handle(ImportUsfPerson command)
        {
            if (command == null) throw new ArgumentNullException("command");

            var reportBuilder = command.ReportBuilder ?? new WorkReportBuilder("Import USF Person");

            // find user by id
            reportBuilder.Report("Querying database for user #{0}.", command.UserId);
            var user = _entities.Get<User>()
                .EagerLoad(_entities, new Expression<Func<User, object>>[]
                {
                    x => x.Person.Affiliations,
                })
                .Single(x => x.RevisionId == command.UserId);
            reportBuilder.Report("Found matching user with name '{0}'.", user.Name);

            // invoke USF person service
            reportBuilder.Report("Invoking USF person service with user name '{0}'.", user.Name);
            //const string testJson = "{\"Last Name\":\"Hernandez\",\"First Name\":\"Mario\",\"Middle Name\":\" \",\"Suffix\":\" \",\"Gender\":\"Male\",\"USF Email Address\":\"marioh@usf.edu\",\"lastUpdate\":\"05-28-2013\",\"profile\":[{\"DEPTID\":\"0-5830-001\",\"Faculty Rank\":\"2\",\"Position Title\":\"Professor\",\"Institutional Affiliation\":\"USF Tampa\",\"College\":\"College of Behavioral and Community Sciences\",\"Department/Program\":\"Division of Administration and Communication\"},{\"DEPTID\":\"0-6405-000\",\"Faculty Rank\":\"2\",\"Position Title\":\"Professor\",\"Institutional Affiliation\":\"USF Tampa\",\"College\":\"College of Public Health\",\"Department/Program\":\"Department of Community and Family Health\"}]}";
            //var usfPerson = JsonConvert.DeserializeObject<UsfPersonData>(testJson);
            var usfPerson = _queryProcessor.Execute(new UsfPerson(command.Service, user.Name)
            {
                ReportBuilder = reportBuilder,
            });
            if (usfPerson == null)
                throw new InvalidOperationException(string.Format(
                    "Could not obtain data for user '{2}' using '{0}_{1}'service integration.",
                        command.Service.Integration.Name, command.Service.Integration.TenantId, user.Name));
            reportBuilder.Report("Deserialized USF person response to CLR object.");
            reportBuilder.Report("JSON value of deserialized response is:");
            reportBuilder.Report(JsonConvert.SerializeObject(usfPerson));

            reportBuilder.Report("Invoking command to import USF organization data.");
            _importEstablishments.Handle(new ImportUsfEstablishments(command.Principal, command.Service, usfPerson.LastUpdate)
            {
                ReportBuilder = reportBuilder,
            });

            // check affiliations (only do this once when created)
            if (usfPerson.Affiliations != null && usfPerson.Affiliations.Any())
            {
                reportBuilder.Report("USF person has affiliations, loading offspring and module settings.");
                var usf = _entities.Query<Establishment>()
                    .EagerLoad(_entities, new Expression<Func<Establishment, object>>[]
                    {
                        x => x.Offspring,
                    })
                    .Single(x => x.RevisionId == command.Service.Integration.TenantId);
                var offspring = usf.Offspring.Select(x => x.Offspring).ToArray();
                var settings = _queryProcessor.Execute(new EmployeeSettingsByEstablishment(usf.RevisionId)
                {
                    EagerLoad = new Expression<Func<EmployeeModuleSettings, object>>[]
                    {
                        x => x.FacultyRanks,
                    },
                });
                reportBuilder.Report("Iterating over {0} affiliations.", usfPerson.Affiliations.Length);
                foreach (var usfAffiliation in usfPerson.Affiliations)
                {
                    // make sure the establishment exists
                    var establishment = offspring.SingleOrDefault(x => x.CustomIds.Any(y => y.Value == usfAffiliation.DepartmentId));
                    if (establishment == null)
                        throw new InvalidOperationException(string.Format(
                            "Could not find UCosmic establishment for USF Department '{0}'.", usfAffiliation.DepartmentId));

                    var facultyRank = settings.FacultyRanks.SingleOrDefault(x => x.Rank == usfAffiliation.PositionTitle);
                    var createAffiliationCommand = new CreateAffiliation(command.Principal, user.Person.RevisionId, establishment.RevisionId)
                    {
                        NoCommit = true,
                        FacultyRankId = facultyRank != null ? facultyRank.Id : (int?)null,
                    };
                    _createAffiliation.Handle(createAffiliationCommand);
                }
            }

            // possibly add a new email address
            if (user.Person.Emails.Any(x => x.Value.Equals(usfPerson.EmailAddress, StringComparison.OrdinalIgnoreCase)))
            {
                reportBuilder.Report("USF person has email address '{0}' different from username.", usfPerson.EmailAddress);
                _createEmailAddress.Handle(new CreateEmailAddress(usfPerson.EmailAddress, user.Person)
                {
                    NoCommit = true,
                    IsFromSaml = false,
                    IsConfirmed = true,
                });
            }

            // update person
            var updatePersonCommand = new UpdatePerson(command.Principal, user.Person.RevisionId)
            {
                NoCommit = true,
                FirstName = usfPerson.FirstName,
                MiddleName = usfPerson.MiddleName,
                LastName = usfPerson.LastName,
                Gender = string.IsNullOrWhiteSpace(usfPerson.Gender) ? "P" : usfPerson.Gender.Substring(0, 1).ToUpper(),
                Suffix = usfPerson.Suffix,
                IsDisplayNameDerived = true,
                IsActive = true,
            };
            _updatePerson.Handle(updatePersonCommand);

            reportBuilder.Report("Committing changes based on USF person response.");
            _entities.SaveChanges();
            reportBuilder.Report("Committed changes based on USF person response.");

        }
    }
}
