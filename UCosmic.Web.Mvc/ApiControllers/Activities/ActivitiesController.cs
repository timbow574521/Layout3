﻿using System;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using AttributeRouting;
using AttributeRouting.Web.Http;
using AutoMapper;
using UCosmic.Domain.Activities;
using UCosmic.Web.Mvc.Models;

namespace UCosmic.Web.Mvc.ApiControllers
{
    [RoutePrefix("api/activities")]
    public class ActivitiesController : ApiController
    {
        private readonly IProcessQueries _queryProcessor;
        private readonly IHandleCommands<CopyDeepActivity> _copyDeepActivity;
        private readonly IHandleCommands<CreateDeepActivity> _createDeepActivity;
        private readonly IHandleCommands<DeleteActivity> _deleteActivity;
        private readonly IHandleCommands<UpdateActivity> _updateActivity;

        public ActivitiesController(IProcessQueries queryProcessor
                                  , IHandleCommands<CopyDeepActivity> copyDeepActivity
                                  , IHandleCommands<CreateDeepActivity> createDeepActivity
                                  , IHandleCommands<DeleteActivity> deleteActivity
                                  , IHandleCommands<UpdateActivity> updateActivity
                            )
        {
            _queryProcessor = queryProcessor;
            _copyDeepActivity = copyDeepActivity;
            _createDeepActivity = createDeepActivity;
            _deleteActivity = deleteActivity;
            _updateActivity = updateActivity;
        }

        // --------------------------------------------------------------------------------
        /*
         * Get a page of activities
        */
        // --------------------------------------------------------------------------------
        [GET("")]
        public PageOfActivityApiModel Get([FromUri] ActivitySearchInputModel input)
        {
            if (input.PageSize < 1) { throw new HttpResponseException(HttpStatusCode.BadRequest); }

            var query = Mapper.Map<ActivitySearchInputModel, ActivitiesByPersonId>(input);
            var activities = _queryProcessor.Execute(query);
            if (activities == null)
            {
                throw new HttpResponseException(HttpStatusCode.NotFound);
            }

            var model = Mapper.Map<PageOfActivityApiModel>(activities);
            return model;
        }

        // --------------------------------------------------------------------------------
        /*
         * Get an activity
        */
        // --------------------------------------------------------------------------------
        [GET("{activityId}")]
        public ActivityApiModel Get(int activityId)
        {
            var activity = _queryProcessor.Execute(new ActivityByEntityId(activityId));
            if (activity == null)
            {
                throw new HttpResponseException(HttpStatusCode.NotFound);
            }

            var model = Mapper.Map<ActivityApiModel>(activity);
            return model;
        }

        // --------------------------------------------------------------------------------
        /*
         * Get an activity copy for editing (or recover edit copy)
        */
        // --------------------------------------------------------------------------------
        [TryAuthorize]
        [GET("{activityId}/edit")]
        public ActivityApiModel GetEdit(int activityId)
        {
            /* Get the activity we want to edit */
            var activity = _queryProcessor.Execute(new ActivityById(activityId));
            if (activity == null)
            {
                throw new HttpResponseException(HttpStatusCode.NotFound);
            }

            /* Search for an "in progress edit" activity.  This can happen if the user
             * navigates away from Activity Edit page before saving. */
            var editActivity = _queryProcessor.Execute(new ActivityByEditSourceId(activity.RevisionId));
            if (editActivity == null)
            {
                //try
                //{
                /* There's no "in progress edit" record, so we make a copy of the
                     * activity and set it to edit mode. */
                var copyDeepActivityCommand = new CopyDeepActivity(User,
                                                                   activity.RevisionId,
                                                                   activity.Mode,
                                                                   activity.RevisionId);

                _copyDeepActivity.Handle(copyDeepActivityCommand);

                editActivity = copyDeepActivityCommand.CreatedActivity;
                //}
                //catch (Exception ex)
                //{
                //    var responseMessage = new HttpResponseMessage
                //    {
                //        StatusCode = HttpStatusCode.InternalServerError,
                //        Content = new StringContent(ex.Message),
                //        ReasonPhrase = "Error preparing activity for edit"
                //    };
                //    throw new HttpResponseException(responseMessage);
                //}
            }

            var model = Mapper.Map<ActivityApiModel>(editActivity);
            return model;
        }

        // --------------------------------------------------------------------------------
        /*
         * Get an activity's edit state.
        */
        // --------------------------------------------------------------------------------
        [TryAuthorize]
        [GET("{activityId}/edit-state")]
        public ActivityEditState GetEditState(int activityId)
        {
            /* Get the activity we want to edit */
            var activity = _queryProcessor.Execute(new ActivityById(activityId));
            if (activity == null)
            {
                throw new HttpResponseException(HttpStatusCode.NotFound);
            }

            var editState = new ActivityEditState
            {
                IsInEdit = activity.EditSourceId.HasValue,
                EditingUserName = "",
                EditingUserEmail = ""
            };

            // TBD

            return editState;
        }


        // --------------------------------------------------------------------------------
        /*
         * Create an activity
        */
        // --------------------------------------------------------------------------------
        [TryAuthorize]
        [POST("")]
        public HttpResponseMessage Post()
        {
            var createDeepActivityCommand = new CreateDeepActivity(User, ActivityMode.Draft.AsSentenceFragment());
            _createDeepActivity.Handle(createDeepActivityCommand);

            var model = createDeepActivityCommand.CreatedActivity.RevisionId;
            return Request.CreateResponse(HttpStatusCode.OK, model);
        }

        // --------------------------------------------------------------------------------
        /*
         * Update an activity
        */
        // --------------------------------------------------------------------------------
        [PUT("{activityId}")]
        [TryAuthorize]
        public HttpResponseMessage Put(int activityId, ActivityApiModel model)
        {
            if ((activityId == 0) || (model == null))
            {
                return Request.CreateResponse(HttpStatusCode.BadRequest);
            }

            var activity = Mapper.Map<Activity>(model);

            //try
            //{
            var updateActivityCommand = new UpdateActivity(User, activity.RevisionId, activity.ModeText)
            {
                Values = activity.Values.SingleOrDefault(x => x.ModeText == activity.ModeText),
            };
            _updateActivity.Handle(updateActivityCommand);
            //}
            //catch (Exception ex)
            //{
            //    var responseMessage = new HttpResponseMessage
            //    {
            //        StatusCode = HttpStatusCode.NotModified,
            //        Content = new StringContent(ex.Message),
            //        ReasonPhrase = "Activity update error"
            //    };
            //    throw new HttpResponseException(responseMessage);
            //}

            return Request.CreateResponse(HttpStatusCode.OK);
        }

        // --------------------------------------------------------------------------------
        /*
         * Update an activity, copying the Edit mode Activity to corresponding non-Edit
         * mode Activity.  The activityId must be of that of an Activity in "edit mode".
        */
        // --------------------------------------------------------------------------------
        [TryAuthorize]
        [PUT("{activityId}/edit")]
        public HttpResponseMessage PutEdit(int activityId, [FromBody] ActivityPutEditApiModel model)
        {
            //try
            //{
            var editActivity = _queryProcessor.Execute(new ActivityById(activityId));
            if (editActivity == null)
                throw new HttpResponseException(HttpStatusCode.NotFound);

            if (!editActivity.EditSourceId.HasValue)
                throw new HttpResponseException(HttpStatusCode.BadRequest);

            var updateActivityCommand = new UpdateActivity(User, editActivity.EditSourceId.Value, model.Mode)
            {
                Values = editActivity.Values.SingleOrDefault(x => x.ModeText == editActivity.ModeText)
            };
            _updateActivity.Handle(updateActivityCommand);

            var deleteActivityCommand = new DeleteActivity(User, editActivity.RevisionId);
            _deleteActivity.Handle(deleteActivityCommand);
            //}
            //catch (Exception ex)
            //{
            //    var responseMessage = new HttpResponseMessage
            //    {
            //        StatusCode = HttpStatusCode.NotModified,
            //        Content = new StringContent(ex.Message),
            //        ReasonPhrase = "Activity update error"
            //    };
            //    throw new HttpResponseException(responseMessage);
            //}

            return Request.CreateResponse(HttpStatusCode.OK);
        }

        // --------------------------------------------------------------------------------
        /*
         * Delete an activity
        */
        // --------------------------------------------------------------------------------
        [TryAuthorize]
        [DELETE("{activityId}")]
        public HttpResponseMessage Delete(int activityId)
        {
            //try
            //{
            var editActivity = _queryProcessor.Execute(new ActivityById(activityId));
            if (editActivity == null)
            {
                var message = string.Format("Activity Id {0} not found.", activityId);
                throw new Exception(message);
            }

            if (editActivity.EditSourceId.HasValue)
            {
                var activity = _queryProcessor.Execute(new ActivityById(editActivity.EditSourceId.Value));
                if (activity != null)
                {
                    if (activity.IsEmpty())
                    {
                        var deleteActivityCommand = new DeleteActivity(User, activity.RevisionId);
                        _deleteActivity.Handle(deleteActivityCommand);
                    }
                }
            }

            var deleteEditActivityCommand = new DeleteActivity(User, editActivity.RevisionId);
            _deleteActivity.Handle(deleteEditActivityCommand);
            //}
            //catch (Exception ex)
            //{
            //    var responseMessage = new HttpResponseMessage
            //    {
            //        StatusCode = HttpStatusCode.NotModified,
            //        Content = new StringContent(ex.Message),
            //        ReasonPhrase = "Activity delete error"
            //    };
            //    throw new HttpResponseException(responseMessage);
            //}

            return Request.CreateResponse(HttpStatusCode.OK);
        }
    }
}
