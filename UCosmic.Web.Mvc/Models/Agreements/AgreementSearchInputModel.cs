﻿using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using AutoMapper;
using UCosmic.Domain.Agreements;

namespace UCosmic.Web.Mvc.Models
{
    public class AgreementSearchInputModel : BaseSearchInputModel
    {
        public int? Id { get; set; }
        public string Keyword { get; set; }
        public string CountryCode { get; set; }
        public string OrderBy { get; set; }
        public string[] TypeEnglishNames { get; set; }
    }

    public static class AgreementSearchInputProfiler
    {
        public class ModelToQueryProfile : Profile
        {
            protected override void Configure()
            {
            //    CreateMap<AgreementSearchInputModel, AgreementViewsByKeyword>()

            //        // map the country code
            //        .ForMember(d => d.CountryCode, o => o.ResolveUsing(s =>
            //        {
            //            // a country code value of null implies finding results without a country code
            //            if (s.CountryCode == "-1") return null;

            //            // a country code value of "" implies finding all results regardless of country code
            //            if (string.IsNullOrWhiteSpace(s.CountryCode)) return string.Empty;

            //            return s.CountryCode;
            //        }))

            //        // map the order by
            //        .ForMember(d => d.OrderBy, o => o.ResolveUsing(s =>
            //            {
            //                var orderBy = new Dictionary<Expression<Func<AgreementView, object>>, OrderByDirection>();
            //                if (string.IsNullOrWhiteSpace(s.OrderBy))
            //                    orderBy.Add(e => e.Id, OrderByDirection.Ascending);

            //                else if (s.OrderBy.Equals("country-asc", StringComparison.OrdinalIgnoreCase))
            //                    orderBy.Add(e => e.CountryName, OrderByDirection.Ascending);
            //                else if (s.OrderBy.Equals("country-desc", StringComparison.OrdinalIgnoreCase))
            //                    orderBy.Add(e => e.CountryName, OrderByDirection.Descending);

            //                else if (s.OrderBy.Equals("name-asc", StringComparison.OrdinalIgnoreCase))
            //                    orderBy.Add(e => e.TranslatedName, OrderByDirection.Ascending);
            //                else if (s.OrderBy.Equals("name-desc", StringComparison.OrdinalIgnoreCase))
            //                    orderBy.Add(e => e.TranslatedName, OrderByDirection.Descending);

            //                return orderBy;
            //            }))
            //    ;
            }
        }
    }
}