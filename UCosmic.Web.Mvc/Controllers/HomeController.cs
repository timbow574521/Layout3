﻿using System.Web.Mvc;
using AttributeRouting.Web.Mvc;
using UCosmic.Domain.Home;
using UCosmic.Web.Mvc.Models;

namespace UCosmic.Web.Mvc.Controllers
{
    public partial class HomeController : Controller
    {
        //private readonly IQueryEntities _queryEntities;

        //public HomeController(IQueryEntities queryEntities)
        //{
        //    _queryEntities = queryEntities;
        //}

        [GET("")]
        public virtual ActionResult Index()
        {
            return View();
        }

        [GET("indexSpike")]
        public virtual ActionResult IndexSpike()
        {
            HomeSectionModel[] home = [new HomeSectionModel{
                Title:"test title",
                Description: "test desc",
                Photo: "url"
                Links: [new HomeLink{ }]
            }]
            return View("indexSpike", "_Layout2", );
        }

        [GET("employees")]
        [UserVoiceForum(UserVoiceForum.Employees)]
        public virtual ActionResult Employees()
        {
            return View();
        }

        [GET("alumni")]
        [UserVoiceForum(UserVoiceForum.Alumni)]
        public virtual ActionResult Alumni()
        {
            return View();
        }

        [GET("students")]
        [UserVoiceForum(UserVoiceForum.Students)]
        public virtual ActionResult Students()
        {
            return View();
        }

        [GET("representatives")]
        [UserVoiceForum(UserVoiceForum.Representatives)]
        public virtual ActionResult Representatives()
        {
            return View();
        }

        [GET("travel")]
        [UserVoiceForum(UserVoiceForum.Travel)]
        public virtual ActionResult Travel()
        {
            return View();
        }

        [GET("corporate-engagement")]
        [UserVoiceForum(UserVoiceForum.CorporateEngagement)]
        public virtual ActionResult CorporateEngagement()
        {
            return View();
        }

        [GET("global-press")]
        [UserVoiceForum(UserVoiceForum.GlobalPress)]
        public virtual ActionResult GlobalPress()
        {
            //TempData.Flash("This is the global press page.");
            return View();
        }
    }
}
