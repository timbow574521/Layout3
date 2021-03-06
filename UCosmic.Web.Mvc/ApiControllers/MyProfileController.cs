﻿using System;
using System.Linq.Expressions;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using AttributeRouting;
using AttributeRouting.Web.Http;
using AutoMapper;
using FluentValidation;
using Newtonsoft.Json;
using UCosmic.Domain.People;
using UCosmic.Web.Mvc.Models;

namespace UCosmic.Web.Mvc.ApiControllers
{
    [Authorize]
    [RoutePrefix("api/my/profile")]
    public class MyProfileController : ApiController
    {
        private readonly IProcessQueries _queryProcessor;
        private readonly IStoreBinaryData _binaryData;
        private readonly IHandleCommands<UpdateMyProfile> _profileUpdateHandler;
        private readonly IHandleCommands<UpdateMyPhoto> _photoUpdateHandler;
        private readonly IHandleCommands<DeleteMyPhoto> _photoDeleteHandler;

        public MyProfileController(IProcessQueries queryProcessor
            , IStoreBinaryData binaryData
            , IHandleCommands<UpdateMyProfile> profileUpdateHandler
            , IHandleCommands<UpdateMyPhoto> photoUpdateHandler
            , IHandleCommands<DeleteMyPhoto> photoDeleteHandler
        )
        {
            _queryProcessor = queryProcessor;
            _binaryData = binaryData;
            _profileUpdateHandler = profileUpdateHandler;
            _photoUpdateHandler = photoUpdateHandler;
            _photoDeleteHandler = photoDeleteHandler;
        }

        [GET("")]
        public MyProfileApiModel Get()
        {
            //throw new HttpResponseException(HttpStatusCode.BadRequest); // test API failure

            var person = _queryProcessor.Execute(new MyPerson(User)
            {
                EagerLoad = new Expression<Func<Person, object>>[]
                {
                    x => x.Employee,
                    x => x.Photo,
                }
            });

            // throw 404 if route does not match existing record
            if (person == null) throw new HttpResponseException(HttpStatusCode.NotFound);

            // only need the destination type int he Map generic argument.
            // the source type is implicit based on the method argument.
            var model = Mapper.Map<MyProfileApiModel>(person);

            return model;
        }

        [PUT("")]
        public HttpResponseMessage Put(MyProfileApiModel model)
        {
            //System.Threading.Thread.Sleep(2000); // test api latency

            var command = new UpdateMyProfile(User);
            Mapper.Map(model, command);

            try
            {
                _profileUpdateHandler.Handle(command);
            }
            catch (ValidationException ex)
            {
                var badRequest = Request.CreateResponse(HttpStatusCode.BadRequest, ex.Message, "text/plain");
                return badRequest;
            }

            return Request.CreateResponse(HttpStatusCode.OK, "Your profile was saved successfully.");
        }

        [GET("photo")]
        public HttpResponseMessage GetPhoto([FromUri] ImageResizeRequestModel model)
        {
            var tenancy = Request.Tenancy();
            int? personId;
            if (tenancy != null && tenancy.PersonId.HasValue)
            {
                personId = tenancy.PersonId.Value;
            }
            else
            {
                var person = _queryProcessor.Execute(new MyPerson(User));
                personId = person.RevisionId;
            }
            var peopleController = new PeopleController(_queryProcessor, _binaryData)
            {
                Request = Request,
            };
            var response = peopleController.GetPhoto(personId.Value, model);
            return response;
        }

        [POST("photo")]
        public HttpResponseMessage PostPhoto(FileMedia photo)
        {
            //System.Threading.Thread.Sleep(2000); // test api latency
            //throw new Exception("Oops"); // test unexpected server error

            // when the photo us null, it's because the user tried to upload an invalid file type (415)
            if (photo == null)
                throw new HttpResponseException(HttpStatusCode.UnsupportedMediaType);

            // do not allow photo uploads exceeding 1MB (413)
            if (photo.Content.Length > (1024 * 1024))
                throw new HttpResponseException(HttpStatusCode.RequestEntityTooLarge);

            _photoUpdateHandler.Handle(new UpdateMyPhoto(User)
            {
                Name = photo.FileName,
                MimeType = photo.ContentType,
                Content = photo.Content,
            });

            // for some reason, KendoUIWeb's upload widget will only think the upload succeeded
            // when the response is either empty, or contains a JSON payload with text/plain encoding.
            // so if we want to send a message back to the client, we have to serialize it in a JSON wrapper.
            const string successMessage = "Your photo was changed successfully.";
            var successPayload = new { message = successMessage };
            var successJson = JsonConvert.SerializeObject(successPayload);
            return Request.CreateResponse(HttpStatusCode.OK, successJson, "text/plain");
        }

        [DELETE("photo")]
        public HttpResponseMessage DeletePhoto()
        {
            //System.Threading.Thread.Sleep(2000); // test api latency
            //throw new Exception("Oops"); // test unexpected server error

            /*
             * Do not use this endpoint for KendoUIWeb's Upload widget. See the
             * KendoRemovePhoto action comment below. This action is for deleting
             * a photo when a new one is not being simultaneously uploaded.
             */

            _photoDeleteHandler.Handle(new DeleteMyPhoto(User));

            return Request.CreateResponse(HttpStatusCode.OK, "Your photo was deleted successfully.");
        }

        [POST("photo/kendo-remove")]
        public HttpResponseMessage KendoRemovePhoto()
        {
            /*
             * KendoUIWeb's Upload widget requires a remove URL endpoint.
             * When it is aware of a previous photo, and when it disallows
             * multiple file uploads, uploading will issue a request to this
             * URL in order to delete them. However it is possible for both
             * the saveUrl and removeUrl to be issued in parallel, which can
             * lead to concurrency issues. Because the PostPhoto action &
             * command take care of deleting any previously-existing photo,
             * this action is left empty and simply returns a result to tell
             * Kendo Upload that the removal operation was successful.
             */

            return Request.CreateResponse(HttpStatusCode.OK);
        }
    }
}
