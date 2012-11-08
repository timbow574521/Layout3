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
namespace UCosmic.Www.Mvc.Controllers {
    public partial class ErrorsController {
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public ErrorsController() { }

        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        protected ErrorsController(Dummy d) { }

        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        protected RedirectToRouteResult RedirectToAction(ActionResult result) {
            var callInfo = result.GetT4MVCResult();
            return RedirectToRoute(callInfo.RouteValueDictionary);
        }

        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        protected RedirectToRouteResult RedirectToActionPermanent(ActionResult result) {
            var callInfo = result.GetT4MVCResult();
            return RedirectToRoutePermanent(callInfo.RouteValueDictionary);
        }


        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public ErrorsController Actions { get { return MVC.Errors; } }
        [GeneratedCode("T4MVC", "2.0")]
        public readonly string Area = "";
        [GeneratedCode("T4MVC", "2.0")]
        public readonly string Name = "Errors";
        [GeneratedCode("T4MVC", "2.0")]
        public const string NameConst = "Errors";

        static readonly ActionNamesClass s_actions = new ActionNamesClass();
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public ActionNamesClass ActionNames { get { return s_actions; } }
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public class ActionNamesClass {
            public readonly string Unexpected = "Unexpected";
            public readonly string Unauthorized = "Unauthorized";
            public readonly string Forbidden = "Forbidden";
            public readonly string NotFound = "NotFound";
        }

        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public class ActionNameConstants {
            public const string Unexpected = "Unexpected";
            public const string Unauthorized = "Unauthorized";
            public const string Forbidden = "Forbidden";
            public const string NotFound = "NotFound";
        }


        static readonly ViewNames s_views = new ViewNames();
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public ViewNames Views { get { return s_views; } }
        [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
        public class ViewNames {
            public readonly string _Bib = "~/Views/Errors/_Bib.cshtml";
            public readonly string Forbidden = "~/Views/Errors/Forbidden.cshtml";
            public readonly string NotFound = "~/Views/Errors/NotFound.cshtml";
            public readonly string Unauthorized = "~/Views/Errors/Unauthorized.cshtml";
        }
    }

    [GeneratedCode("T4MVC", "2.0"), DebuggerNonUserCode]
    public class T4MVC_ErrorsController: UCosmic.Www.Mvc.Controllers.ErrorsController {
        public T4MVC_ErrorsController() : base(Dummy.Instance) { }

        public override System.Web.Mvc.ActionResult Unexpected() {
            var callInfo = new T4MVC_ActionResult(Area, Name, ActionNames.Unexpected);
            return callInfo;
        }

        public override System.Web.Mvc.ActionResult Unauthorized() {
            var callInfo = new T4MVC_ActionResult(Area, Name, ActionNames.Unauthorized);
            return callInfo;
        }

        public override System.Web.Mvc.ActionResult Forbidden() {
            var callInfo = new T4MVC_ActionResult(Area, Name, ActionNames.Forbidden);
            return callInfo;
        }

        public override System.Web.Mvc.ActionResult NotFound() {
            var callInfo = new T4MVC_ActionResult(Area, Name, ActionNames.NotFound);
            return callInfo;
        }

    }
}

#endregion T4MVC
#pragma warning restore 1591
