// <auto-generated />
// This file was generated by a T4 template.
// Don't change it directly as your change would get overwritten.  Instead, make changes
// to the .tt file (i.e. the T4 template) and save it to regenerate this file.

// Make sure the compiler doesn't complain about missing Xml comments
#pragma warning disable 1591
#region T4MVC

using System;
using System.Diagnostics;
using System.CodeDom.Compiler;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Web;
using System.Web.Hosting;
using System.Web.Mvc;
using System.Web.Mvc.Ajax;
using System.Web.Mvc.Html;
using System.Web.Routing;
using T4MVC;
namespace UCosmic.Web.Mvc.Controllers
{
    public partial class PeopleController
    {
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        protected PeopleController(Dummy d) { }

        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        protected RedirectToRouteResult RedirectToAction(ActionResult result)
        {
            var callInfo = result.GetT4MVCResult();
            return RedirectToRoute(callInfo.RouteValueDictionary);
        }

        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        protected RedirectToRouteResult RedirectToActionPermanent(ActionResult result)
        {
            var callInfo = result.GetT4MVCResult();
            return RedirectToRoutePermanent(callInfo.RouteValueDictionary);
        }

        [NonAction]
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public System.Web.Mvc.ActionResult Index()
        {
            return new T4MVC_System_Web_Mvc_ActionResult(Area, Name, ActionNames.Index);
        }
        [NonAction]
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public System.Web.Mvc.ActionResult GetCard()
        {
            return new T4MVC_System_Web_Mvc_ActionResult(Area, Name, ActionNames.GetCard);
        }
        [NonAction]
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public System.Web.Mvc.ActionResult Activities()
        {
            return new T4MVC_System_Web_Mvc_ActionResult(Area, Name, ActionNames.Activities);
        }
        [NonAction]
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public System.Web.Mvc.ActionResult Degrees()
        {
            return new T4MVC_System_Web_Mvc_ActionResult(Area, Name, ActionNames.Degrees);
        }
        [NonAction]
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public System.Web.Mvc.ActionResult GetAffiliations()
        {
            return new T4MVC_System_Web_Mvc_ActionResult(Area, Name, ActionNames.GetAffiliations);
        }
        [NonAction]
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public System.Web.Mvc.ActionResult Languages()
        {
            return new T4MVC_System_Web_Mvc_ActionResult(Area, Name, ActionNames.Languages);
        }
        [NonAction]
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public System.Web.Mvc.ActionResult GlobalExpertises()
        {
            return new T4MVC_System_Web_Mvc_ActionResult(Area, Name, ActionNames.GlobalExpertises);
        }

        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public PeopleController Actions { get { return MVC.People; } }
        [GeneratedCode("T4MVC", "2.0")]
        public readonly string Area = "";
        [GeneratedCode("T4MVC", "2.0")]
        public readonly string Name = "People";
        [GeneratedCode("T4MVC", "2.0")]
        public const string NameConst = "People";

        static readonly ActionNamesClass s_actions = new ActionNamesClass();
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public ActionNamesClass ActionNames { get { return s_actions; } }
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public class ActionNamesClass
        {
            public readonly string Index = "Index";
            public readonly string GetCard = "GetCard";
            public readonly string Activities = "Activities";
            public readonly string Degrees = "Degrees";
            public readonly string GetAffiliations = "GetAffiliations";
            public readonly string Languages = "Languages";
            public readonly string GlobalExpertises = "GlobalExpertises";
        }

        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public class ActionNameConstants
        {
            public const string Index = "Index";
            public const string GetCard = "GetCard";
            public const string Activities = "Activities";
            public const string Degrees = "Degrees";
            public const string GetAffiliations = "GetAffiliations";
            public const string Languages = "Languages";
            public const string GlobalExpertises = "GlobalExpertises";
        }


        static readonly ActionParamsClass_Index s_params_Index = new ActionParamsClass_Index();
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public ActionParamsClass_Index IndexParams { get { return s_params_Index; } }
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public class ActionParamsClass_Index
        {
            public readonly string personId = "personId";
        }
        static readonly ActionParamsClass_GetCard s_params_GetCard = new ActionParamsClass_GetCard();
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public ActionParamsClass_GetCard GetCardParams { get { return s_params_GetCard; } }
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public class ActionParamsClass_GetCard
        {
            public readonly string personId = "personId";
        }
        static readonly ActionParamsClass_Activities s_params_Activities = new ActionParamsClass_Activities();
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public ActionParamsClass_Activities ActivitiesParams { get { return s_params_Activities; } }
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public class ActionParamsClass_Activities
        {
            public readonly string personId = "personId";
            public readonly string input = "input";
        }
        static readonly ActionParamsClass_Degrees s_params_Degrees = new ActionParamsClass_Degrees();
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public ActionParamsClass_Degrees DegreesParams { get { return s_params_Degrees; } }
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public class ActionParamsClass_Degrees
        {
            public readonly string personId = "personId";
            public readonly string input = "input";
        }
        static readonly ActionParamsClass_GetAffiliations s_params_GetAffiliations = new ActionParamsClass_GetAffiliations();
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public ActionParamsClass_GetAffiliations GetAffiliationsParams { get { return s_params_GetAffiliations; } }
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public class ActionParamsClass_GetAffiliations
        {
            public readonly string personId = "personId";
        }
        static readonly ActionParamsClass_Languages s_params_Languages = new ActionParamsClass_Languages();
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public ActionParamsClass_Languages LanguagesParams { get { return s_params_Languages; } }
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public class ActionParamsClass_Languages
        {
            public readonly string personId = "personId";
        }
        static readonly ActionParamsClass_GlobalExpertises s_params_GlobalExpertises = new ActionParamsClass_GlobalExpertises();
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public ActionParamsClass_GlobalExpertises GlobalExpertisesParams { get { return s_params_GlobalExpertises; } }
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public class ActionParamsClass_GlobalExpertises
        {
            public readonly string personId = "personId";
        }
        static readonly ViewsClass s_views = new ViewsClass();
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public ViewsClass Views { get { return s_views; } }
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public class ViewsClass
        {
            static readonly _ViewNamesClass s_ViewNames = new _ViewNamesClass();
            public _ViewNamesClass ViewNames { get { return s_ViewNames; } }
            public class _ViewNamesClass
            {
                public readonly string _Activities = "_Activities";
                public readonly string _Affiliations = "_Affiliations";
                public readonly string _Card = "_Card";
                public readonly string _Degrees = "_Degrees";
                public readonly string _GlobalExpertises = "_GlobalExpertises";
                public readonly string _Languages = "_Languages";
                public readonly string _LanguagesProficiency = "_LanguagesProficiency";
                public readonly string _Profile = "_Profile";
                public readonly string _SearchSidebarNav = "_SearchSidebarNav";
                public readonly string _SidebarNav = "_SidebarNav";
                public readonly string Activities = "Activities";
                public readonly string Degrees = "Degrees";
                public readonly string GlobalExpertises = "GlobalExpertises";
                public readonly string Index = "Index";
                public readonly string Languages = "Languages";
            }
            public readonly string _Activities = "~/Views/People/_Activities.cshtml";
            public readonly string _Affiliations = "~/Views/People/_Affiliations.cshtml";
            public readonly string _Card = "~/Views/People/_Card.cshtml";
            public readonly string _Degrees = "~/Views/People/_Degrees.cshtml";
            public readonly string _GlobalExpertises = "~/Views/People/_GlobalExpertises.cshtml";
            public readonly string _Languages = "~/Views/People/_Languages.cshtml";
            public readonly string _LanguagesProficiency = "~/Views/People/_LanguagesProficiency.cshtml";
            public readonly string _Profile = "~/Views/People/_Profile.cshtml";
            public readonly string _SearchSidebarNav = "~/Views/People/_SearchSidebarNav.cshtml";
            public readonly string _SidebarNav = "~/Views/People/_SidebarNav.cshtml";
            public readonly string Activities = "~/Views/People/Activities.cshtml";
            public readonly string Degrees = "~/Views/People/Degrees.cshtml";
            public readonly string GlobalExpertises = "~/Views/People/GlobalExpertises.cshtml";
            public readonly string Index = "~/Views/People/Index.cshtml";
            public readonly string Languages = "~/Views/People/Languages.cshtml";
        }
    }

    [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
    public class T4MVC_PeopleController : UCosmic.Web.Mvc.Controllers.PeopleController
    {
        public T4MVC_PeopleController() : base(Dummy.Instance) { }

        public override System.Web.Mvc.ActionResult Index(int personId)
        {
            var callInfo = new T4MVC_System_Web_Mvc_ActionResult(Area, Name, ActionNames.Index);
            ModelUnbinderHelpers.AddRouteValues(callInfo.RouteValueDictionary, "personId", personId);
            return callInfo;
        }

        public override System.Web.Mvc.ActionResult GetCard(int personId)
        {
            var callInfo = new T4MVC_System_Web_Mvc_ActionResult(Area, Name, ActionNames.GetCard);
            ModelUnbinderHelpers.AddRouteValues(callInfo.RouteValueDictionary, "personId", personId);
            return callInfo;
        }

        public override System.Web.Mvc.ActionResult Activities(int personId, UCosmic.Web.Mvc.Models.ActivityPublicInputModel input)
        {
            var callInfo = new T4MVC_System_Web_Mvc_ActionResult(Area, Name, ActionNames.Activities);
            ModelUnbinderHelpers.AddRouteValues(callInfo.RouteValueDictionary, "personId", personId);
            ModelUnbinderHelpers.AddRouteValues(callInfo.RouteValueDictionary, "input", input);
            return callInfo;
        }

        public override System.Web.Mvc.ActionResult Degrees(int personId, UCosmic.Web.Mvc.Models.DegreeSearchInputModel input)
        {
            var callInfo = new T4MVC_System_Web_Mvc_ActionResult(Area, Name, ActionNames.Degrees);
            ModelUnbinderHelpers.AddRouteValues(callInfo.RouteValueDictionary, "personId", personId);
            ModelUnbinderHelpers.AddRouteValues(callInfo.RouteValueDictionary, "input", input);
            return callInfo;
        }

        public override System.Web.Mvc.ActionResult GetAffiliations(int personId)
        {
            var callInfo = new T4MVC_System_Web_Mvc_ActionResult(Area, Name, ActionNames.GetAffiliations);
            ModelUnbinderHelpers.AddRouteValues(callInfo.RouteValueDictionary, "personId", personId);
            return callInfo;
        }

        public override System.Web.Mvc.ActionResult Languages(int personId)
        {
            var callInfo = new T4MVC_System_Web_Mvc_ActionResult(Area, Name, ActionNames.Languages);
            ModelUnbinderHelpers.AddRouteValues(callInfo.RouteValueDictionary, "personId", personId);
            return callInfo;
        }

        public override System.Web.Mvc.ActionResult GlobalExpertises(int personId)
        {
            var callInfo = new T4MVC_System_Web_Mvc_ActionResult(Area, Name, ActionNames.GlobalExpertises);
            ModelUnbinderHelpers.AddRouteValues(callInfo.RouteValueDictionary, "personId", personId);
            return callInfo;
        }

    }
}

#endregion T4MVC
#pragma warning restore 1591
