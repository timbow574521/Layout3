﻿using System;
using System.Reflection;
using System.Runtime.Caching;
using Microsoft.ApplicationServer.Caching;
using SimpleInjector;
using SimpleInjector.Extensions;

namespace UCosmic.Cqrs
{
    public static class SimpleInjectorCqrsRegistration
    {
        public static void RegisterQueryProcessor(this Container container, params Assembly[] assemblies)
        {
            container.RegisterSingle<SimpleInjectorQueryProcessor>();
            container.Register<IProcessQueries>(container.GetInstance<SimpleInjectorQueryProcessor>);
            container.RegisterManyForOpenGeneric(typeof(IHandleQueries<,>), assemblies);
        }

        public static void RegisterEventProcessor(this Container container, params Assembly[] assemblies)
        {
            //container.RegisterSingle<SimpleInjectorSynchronousEventProcessor>();
            //container.Register<IProcessEvents>(container.GetInstance<SimpleInjectorSynchronousEventProcessor>);
            container.RegisterSingle<SimpleInjectorAsynchronousEventProcessor>();
            container.Register<IProcessEvents>(container.GetInstance<SimpleInjectorAsynchronousEventProcessor>);
            container.RegisterManyForOpenGeneric(typeof(IHandleEvents<>),
                (type, implementations) =>
                {
                    if (implementations.Length == 1)
                        container.Register(type, implementations[0]);
                    else if (implementations.Length > 1)
                        container.RegisterAll(type, implementations);
                },
                assemblies);
        }

        public static void RegisterCommandHandlers(this Container container, params Assembly[] assemblies)
        {
            container.RegisterManyForOpenGeneric(typeof(IHandleCommands<>), assemblies);
        }

        public static void RegisterMemoryViewManager(this Container container)
        {
            container.RegisterSingle(() => new MemoryViewManager(MemoryCache.Default));
            container.RegisterSingle<IManageViews>(container.GetInstance<MemoryViewManager>);
        }

        public static void RegisterAzureCacheViewManager(this Container container)
        {
            container.RegisterSingle(() => new DataCacheFactory());
            container.RegisterSingle(() => container.GetInstance<DataCacheFactory>().GetDefaultCache());
            container.Register<IManageViews>(() => new AzureCacheViewManager(
                container.GetInstance<DataCache>(), new TimeSpan(24, 1, 0)));
        }

        public static void RegisterHybridMemoryAzureViewManager(this Container container)
        {
            container.RegisterSingle(() => new MemoryViewManager(MemoryCache.Default));
            container.RegisterSingle(() => new DataCacheFactory());
            container.RegisterSingle(() => container.GetInstance<DataCacheFactory>().GetDefaultCache());
            container.Register<IManageViews>(() =>
                new HybridMemoryAzureViewManager(container.GetInstance<MemoryViewManager>(),
                    new AzureCacheViewManager(container.GetInstance<DataCache>(), new TimeSpan(24, 1, 0))));
        }
    }
}
