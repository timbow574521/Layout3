﻿using System;
using System.Linq;
using System.Security.Principal;
using UCosmic.Domain.Identity;

namespace UCosmic.Domain.Activities
{
    public class CopyDeepActivityValues
    {
        public IPrincipal Principal { get; protected set; }
        public int Id { get; set; }
        public int ActivityId { get; set; } 
        public ActivityMode Mode { get; set; }
        public bool NoCommit { get; set; }
        public ActivityValues CreatedActivityValues { get; set; }

        public CopyDeepActivityValues(IPrincipal principal)
        {
            Principal = principal;
        }
    }

    public class HandleCopyDeepActivityValuesCommand : IHandleCommands<CopyDeepActivityValues>
    {
        private readonly ICommandEntities _entities;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IHandleCommands<CreateActivityValues> _createActivityValues;
        private readonly IHandleCommands<CreateActivityType> _createActivityType;
        private readonly IHandleCommands<CreateActivityTag> _createActivityTag;
        private readonly IHandleCommands<CreateActivityLocation> _createActivityLocation;
        private readonly IHandleCommands<CreateActivityDocument> _createActivityDocument;

        public HandleCopyDeepActivityValuesCommand(ICommandEntities entities,
                                                   IUnitOfWork unitOfWork,
                                                   IHandleCommands<CreateActivityValues> createActivityValues,
                                                   IHandleCommands<CreateActivityType> createActivityType,
                                                   IHandleCommands<CreateActivityTag> createActivityTag,
                                                   IHandleCommands<CreateActivityLocation> createActivityLocation,
                                                   IHandleCommands<CreateActivityDocument> createActivityDocument)
        {
            _entities = entities;
            _unitOfWork = unitOfWork;
            _createActivityValues = createActivityValues;
            _createActivityType = createActivityType;
            _createActivityTag = createActivityTag;
            _createActivityLocation = createActivityLocation;
            _createActivityDocument = createActivityDocument;
        }

        public void Handle(CopyDeepActivityValues command)
        {
            if (command == null) throw new ArgumentNullException("command");

            var sourceActivityValues = _entities.Get<ActivityValues>().Single(x => x.RevisionId == command.Id);
            if (sourceActivityValues == null)
            {
                var message = string.Format("ActivityValues Id {0} not found.", command.Id);
                throw new Exception(message);
            }

            var createActivityValuesCommand = new CreateActivityValues(command.Principal, command.ActivityId, command.Mode)
            {
                Title = sourceActivityValues.Title,
                Content = sourceActivityValues.Content,
                StartsOn = sourceActivityValues.StartsOn,
                EndsOn = sourceActivityValues.EndsOn,
                OnGoing = sourceActivityValues.OnGoing,
                DateFormat = sourceActivityValues.DateFormat,
                WasExternallyFunded = sourceActivityValues.WasExternallyFunded,
                WasInternallyFunded = sourceActivityValues.WasInternallyFunded
            };

            _createActivityValues.Handle(createActivityValuesCommand);

            ActivityValues activityValuesCopy = createActivityValuesCommand.CreatedActivityValues;

            foreach (var location in sourceActivityValues.Locations)
            {
                _createActivityLocation.Handle(new CreateActivityLocation(command.Principal)
                {
                    ActivityValuesId = activityValuesCopy.RevisionId,
                    PlaceId = location.PlaceId,
                });                
            }

            foreach (var type in sourceActivityValues.Types)
            {
                _createActivityType.Handle(new CreateActivityType(command.Principal,
                                                                  activityValuesCopy.RevisionId,
                                                                  type.TypeId));
            }

            foreach (var tag in sourceActivityValues.Tags)
            {
                _createActivityTag.Handle(new CreateActivityTag(command.Principal)
                {
                    ActivityValuesId = activityValuesCopy.RevisionId,
                    Text = tag.Text,
                    DomainType = tag.DomainType,
                    DomainKey = tag.DomainKey,
                    Mode = command.Mode
                });                
            }

            foreach (var document in sourceActivityValues.Documents)
            {
                _createActivityDocument.Handle(new CreateActivityDocument(command.Principal)
                {
                    ActivityValuesId = activityValuesCopy.RevisionId,
                    FileId = document.FileId,
                    ImageId = document.ImageId,
                    Mode = command.Mode,
                    Title = document.Title,
                    Visible = document.Visible
                });
            }

            command.CreatedActivityValues = activityValuesCopy;

            if (!command.NoCommit)
            {
                _unitOfWork.SaveChanges();
            }
        }
    }
}
