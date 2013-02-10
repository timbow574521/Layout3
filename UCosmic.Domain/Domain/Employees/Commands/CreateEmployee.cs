﻿using System;
using System.Linq;
using FluentValidation;
using UCosmic.Domain.People;

namespace UCosmic.Domain.Employees
{
    public class CreateEmployee
    {
        public int? FacultyRankId { get; set; }
        public string AdministrativeAppointments { get; set; }
        public string JobTitles { get; set; }
        public int ForPersonId { get; set; }

        public Employee CreatedEmployee { get; internal set; }
    }

    public class ValidateCreateEmployeeCommand : AbstractValidator<CreateEmployee>
    {
        public ValidateCreateEmployeeCommand(IProcessQueries queryProcessor)
        {
            //CascadeMode = CascadeMode.StopOnFirstFailure;

            //RuleFor(x => x.DisplayName)
            //    // display name cannot be empty
            //    .NotEmpty()
            //        .WithMessage(MustNotHaveEmptyDisplayName.FailMessage)
            //;

            //RuleFor(x => x.UserName)
            //    // if username is present, validate that it is not attached to another person
            //    .Must(p => ValidateUser.NameMatchesNoEntity(p, queryProcessor))
            //        .WithMessage(ValidateUser.FailedBecauseNameMatchedEntity,
            //            p => p.UserName)
            //;
        }
    }

    public class HandleCreateEmployeeCommand : IHandleCommands<CreateEmployee>
    {
        private readonly ICommandEntities _entities;

        public HandleCreateEmployeeCommand(ICommandEntities entities)
        {
            _entities = entities;
        }

        public void Handle(CreateEmployee command)
        {
            if (command == null) throw new ArgumentNullException("command");

            // construct the entity
            var employee = new Employee
            {
                Person = _entities.Get<Person>().SingleOrDefault( p => p.RevisionId == command.ForPersonId ),
                FacultyRank = (command.FacultyRankId.HasValue) ? _entities.Get<EmployeeFacultyRank>().Single(x => x.Id == command.FacultyRankId) : null,
                AdministrativeAppointments = command.AdministrativeAppointments,
                JobTitles = command.JobTitles,
            };

            //// log audit
            //var audit = new CommandEvent
            //{
            //    RaisedBy = command.Principal.Identity.Name,
            //    Name = command.GetType().FullName,
            //    Value = JsonConvert.SerializeObject(new
            //    {
            //        command.prop1,
            //        command.propN,
            //    }),
            //    NewState = createdEntity.ToJsonAudit(),
            //};
            //_entities.Create(audit);

            // store
            _entities.Create(employee);

            command.CreatedEmployee = employee;
        }
    }
}
