﻿/*
Deployment script for UCosmicTest

This code was generated by a tool.
Changes to this file may cause incorrect behavior and will be lost if
the code is regenerated.
*/

GO
SET ANSI_NULLS, ANSI_PADDING, ANSI_WARNINGS, ARITHABORT, CONCAT_NULL_YIELDS_NULL, QUOTED_IDENTIFIER ON;
SET NUMERIC_ROUNDABORT OFF;
GO



PRINT N'Dropping [Employees].[EmployeeActivityType].[IX_EmployeeModuleSettingsId]...';
GO
DROP INDEX [IX_EmployeeModuleSettingsId]
    ON [Employees].[EmployeeActivityType];
GO

PRINT N'Dropping [Employees].[EmployeeFacultyRank].[IX_EmployeeModuleSettingsId]...';
GO
DROP INDEX [IX_EmployeeModuleSettingsId]
    ON [Employees].[EmployeeFacultyRank];
GO

PRINT N'Dropping FK_Employees.EmployeeActivityType_Employees.EmployeeModuleSettings_EmployeeModuleSettingsId...';
GO
ALTER TABLE [Employees].[EmployeeActivityType] DROP CONSTRAINT [FK_Employees.EmployeeActivityType_Employees.EmployeeModuleSettings_EmployeeModuleSettingsId];
GO

PRINT N'Dropping FK_ActivitiesV2.ActivityType_Employees.EmployeeActivityType_TypeId...';
GO
ALTER TABLE [ActivitiesV2].[ActivityType] DROP CONSTRAINT [FK_ActivitiesV2.ActivityType_Employees.EmployeeActivityType_TypeId];
GO

PRINT N'Dropping FK_Employees.EmployeeFacultyRank_Employees.EmployeeModuleSettings_EmployeeModuleSettingsId...';
GO
ALTER TABLE [Employees].[EmployeeFacultyRank] DROP CONSTRAINT [FK_Employees.EmployeeFacultyRank_Employees.EmployeeModuleSettings_EmployeeModuleSettingsId];
GO

PRINT N'Dropping FK_Employees.Employee_Employees.EmployeeFacultyRank_FacultyRankId...';
GO
ALTER TABLE [Employees].[Employee] DROP CONSTRAINT [FK_Employees.Employee_Employees.EmployeeFacultyRank_FacultyRankId];
GO

PRINT N'Dropping FK_Employees.EmployeeModuleSettings_Establishments.Establishment_EstablishmentId...';
GO
ALTER TABLE [Employees].[EmployeeModuleSettings] DROP CONSTRAINT [FK_Employees.EmployeeModuleSettings_Establishments.Establishment_EstablishmentId];
GO

PRINT N'Dropping FK_Employees.EmployeeModuleSettingsNotifyingAdmins_Employees.EmployeeModuleSettings_EmployeeModuleSettingsId...';
GO
ALTER TABLE [Employees].[EmployeeModuleSettingsNotifyingAdmins] DROP CONSTRAINT [FK_Employees.EmployeeModuleSettingsNotifyingAdmins_Employees.EmployeeModuleSettings_EmployeeModuleSettingsId];
GO



/*
The column [Employees].[EmployeeActivityType].[EmployeeModuleSettingsId] is being dropped, data loss could occur.
*/
--IF EXISTS (select top 1 1 from [Employees].[EmployeeActivityType])
--    RAISERROR (N'Rows were detected. The schema update is terminating because data loss might occur.', 16, 127) WITH NOWAIT
--GO
PRINT N'Starting rebuilding table [Employees].[EmployeeActivityType]...';
GO

BEGIN TRANSACTION;

SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;
SET XACT_ABORT ON;

CREATE TABLE [Employees].[tmp_ms_xx_EmployeeActivityType] (
    [Id]              INT            IDENTITY (1, 1) NOT NULL,
    [EstablishmentId] INT            NULL,
    [Type]            NVARCHAR (128) NOT NULL,
    [Rank]            INT            NOT NULL,
    [CssColor]        NVARCHAR (MAX) NULL,
    [IconLength]      INT            NULL,
    [IconMimeType]    NVARCHAR (MAX) NULL,
    [IconName]        NVARCHAR (200) NULL,
    [IconPath]        NVARCHAR (MAX) NULL,
    [IconFileName]    NVARCHAR (210) NULL,
    CONSTRAINT [tmp_ms_xx_constraint_PK_Employees.EmployeeActivityType] PRIMARY KEY CLUSTERED ([Id] ASC)
);

IF EXISTS (SELECT TOP 1 1 
           FROM   [Employees].[EmployeeActivityType])
    BEGIN
        SET IDENTITY_INSERT [Employees].[tmp_ms_xx_EmployeeActivityType] ON;
        INSERT INTO [Employees].[tmp_ms_xx_EmployeeActivityType] ([Id], [EstablishmentId], [Type], [Rank], [CssColor], [IconLength], [IconMimeType], [IconName], [IconPath], [IconFileName])
        SELECT   [Id],
				 (SELECT TOP 1 x.[EstablishmentId] FROM [Employees].[EmployeeModuleSettings] x WHERE x.[Id] = [EmployeeModuleSettingsId]),
                 [Type],
                 [Rank],
                 [CssColor],
                 [IconLength],
                 [IconMimeType],
                 [IconName],
                 [IconPath],
                 [IconFileName]
        FROM     [Employees].[EmployeeActivityType]
        ORDER BY [Id] ASC;
        SET IDENTITY_INSERT [Employees].[tmp_ms_xx_EmployeeActivityType] OFF;
    END

DROP TABLE [Employees].[EmployeeActivityType];

EXECUTE sp_rename N'[Employees].[tmp_ms_xx_EmployeeActivityType]', N'EmployeeActivityType';
EXECUTE sp_rename N'[Employees].[tmp_ms_xx_constraint_PK_Employees.EmployeeActivityType]', N'PK_Employees.EmployeeActivityType', N'OBJECT';

COMMIT TRANSACTION;

SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
GO
PRINT N'Creating [Employees].[EmployeeActivityType].[IX_EstablishmentId]...';
GO
CREATE NONCLUSTERED INDEX [IX_EstablishmentId]
    ON [Employees].[EmployeeActivityType]([EstablishmentId] ASC);
GO



/*
The column [Employees].[EmployeeFacultyRank].[EmployeeModuleSettingsId] is being dropped, data loss could occur.

The column [Employees].[EmployeeFacultyRank].[EstablishmentId] on table [Employees].[EmployeeFacultyRank] must be added, but the column has no default value and does not allow NULL values. If the table contains data, the ALTER script will not work. To avoid this issue you must either: add a default value to the column, mark it as allowing NULL values, or enable the generation of smart-defaults as a deployment option.
*/
--IF EXISTS (select top 1 1 from [Employees].[EmployeeFacultyRank])
--    RAISERROR (N'Rows were detected. The schema update is terminating because data loss might occur.', 16, 127) WITH NOWAIT
--GO
PRINT N'Starting rebuilding table [Employees].[EmployeeFacultyRank]...';
GO

BEGIN TRANSACTION;

SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;
SET XACT_ABORT ON;

CREATE TABLE [Employees].[tmp_ms_xx_EmployeeFacultyRank] (
    [Id]              INT            IDENTITY (1, 1) NOT NULL,
    [EstablishmentId] INT            NOT NULL,
    [Rank]            NVARCHAR (128) NOT NULL,
    [Number]          INT            NULL,
    CONSTRAINT [tmp_ms_xx_constraint_PK_Employees.EmployeeFacultyRank] PRIMARY KEY CLUSTERED ([Id] ASC)
);

IF EXISTS (SELECT TOP 1 1 
           FROM   [Employees].[EmployeeFacultyRank])
    BEGIN
        SET IDENTITY_INSERT [Employees].[tmp_ms_xx_EmployeeFacultyRank] ON;
        INSERT INTO [Employees].[tmp_ms_xx_EmployeeFacultyRank] ([Id], [EstablishmentId], [Rank], [Number])
        SELECT   [Id],
				 (SELECT TOP 1 x.[EstablishmentId] FROM [Employees].[EmployeeModuleSettings] x WHERE x.[Id] = [EmployeeModuleSettingsId]),
                 [Rank],
                 [Number]
        FROM     [Employees].[EmployeeFacultyRank]
        ORDER BY [Id] ASC;
        SET IDENTITY_INSERT [Employees].[tmp_ms_xx_EmployeeFacultyRank] OFF;
    END

DROP TABLE [Employees].[EmployeeFacultyRank];

EXECUTE sp_rename N'[Employees].[tmp_ms_xx_EmployeeFacultyRank]', N'EmployeeFacultyRank';
EXECUTE sp_rename N'[Employees].[tmp_ms_xx_constraint_PK_Employees.EmployeeFacultyRank]', N'PK_Employees.EmployeeFacultyRank', N'OBJECT';

COMMIT TRANSACTION;

SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
GO
PRINT N'Creating [Employees].[EmployeeFacultyRank].[IX_EstablishmentId]...';
GO
CREATE NONCLUSTERED INDEX [IX_EstablishmentId]
    ON [Employees].[EmployeeFacultyRank]([EstablishmentId] ASC);
GO



/*
The column [Employees].[EmployeeModuleSettings].[Id] is being dropped, data loss could occur.
*/
--IF EXISTS (select top 1 1 from [Employees].[EmployeeModuleSettings])
--    RAISERROR (N'Rows were detected. The schema update is terminating because data loss might occur.', 16, 127) WITH NOWAIT
--GO
PRINT N'Starting rebuilding table [Employees].[EmployeeModuleSettings]...';
GO

BEGIN TRANSACTION;

SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;
SET XACT_ABORT ON;

CREATE TABLE [Employees].[tmp_ms_xx_EmployeeModuleSettings] (
    [EstablishmentId]            INT            NOT NULL,
    [NotifyAdminOnUpdate]        BIT            NOT NULL,
    [PersonalInfoAnchorText]     NVARCHAR (64)  NULL,
    [OfferCountry]               BIT            NOT NULL,
    [OfferActivityType]          BIT            NOT NULL,
    [OfferFundingQuestions]      BIT            NOT NULL,
    [InternationalPedigreeTitle] NVARCHAR (64)  NULL,
    [ReportsDefaultYearRange]    INT            NULL,
    [GlobalViewIconLength]       INT            NULL,
    [GlobalViewIconMimeType]     NVARCHAR (MAX) NULL,
    [GlobalViewIconName]         NVARCHAR (200) NULL,
    [GlobalViewIconPath]         NVARCHAR (MAX) NULL,
    [GlobalViewIconFileName]     NVARCHAR (210) NULL,
    [FindAnExpertIconLength]     INT            NULL,
    [FindAnExpertIconMimeType]   NVARCHAR (MAX) NULL,
    [FindAnExpertIconName]       NVARCHAR (200) NULL,
    [FindAnExpertIconPath]       NVARCHAR (MAX) NULL,
    [FindAnExpertIconFileName]   NVARCHAR (210) NULL,
    CONSTRAINT [tmp_ms_xx_constraint_PK_Employees.EmployeeModuleSettings] PRIMARY KEY CLUSTERED ([EstablishmentId] ASC)
);

IF EXISTS (SELECT TOP 1 1 
           FROM   [Employees].[EmployeeModuleSettings])
    BEGIN
        
        INSERT INTO [Employees].[tmp_ms_xx_EmployeeModuleSettings] ([EstablishmentId], [NotifyAdminOnUpdate], [PersonalInfoAnchorText], [OfferCountry], [OfferActivityType], [OfferFundingQuestions], [InternationalPedigreeTitle], [ReportsDefaultYearRange], [GlobalViewIconLength], [GlobalViewIconMimeType], [GlobalViewIconName], [GlobalViewIconPath], [GlobalViewIconFileName], [FindAnExpertIconLength], [FindAnExpertIconMimeType], [FindAnExpertIconName], [FindAnExpertIconPath], [FindAnExpertIconFileName])
        SELECT   [EstablishmentId],
                 [NotifyAdminOnUpdate],
                 [PersonalInfoAnchorText],
                 [OfferCountry],
                 [OfferActivityType],
                 [OfferFundingQuestions],
                 [InternationalPedigreeTitle],
                 [ReportsDefaultYearRange],
                 [GlobalViewIconLength],
                 [GlobalViewIconMimeType],
                 [GlobalViewIconName],
                 [GlobalViewIconPath],
                 [GlobalViewIconFileName],
                 [FindAnExpertIconLength],
                 [FindAnExpertIconMimeType],
                 [FindAnExpertIconName],
                 [FindAnExpertIconPath],
                 [FindAnExpertIconFileName]
        FROM     [Employees].[EmployeeModuleSettings]
        ORDER BY [EstablishmentId] ASC;
        
    END

DROP TABLE [Employees].[EmployeeModuleSettings];

EXECUTE sp_rename N'[Employees].[tmp_ms_xx_EmployeeModuleSettings]', N'EmployeeModuleSettings';
EXECUTE sp_rename N'[Employees].[tmp_ms_xx_constraint_PK_Employees.EmployeeModuleSettings]', N'PK_Employees.EmployeeModuleSettings', N'OBJECT';

COMMIT TRANSACTION;

SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
GO
PRINT N'Creating [Employees].[EmployeeModuleSettings].[IX_EstablishmentId]...';
GO
CREATE NONCLUSTERED INDEX [IX_EstablishmentId]
    ON [Employees].[EmployeeModuleSettings]([EstablishmentId] ASC);
GO



/*
The column [People].[Affiliation].[IsPrimary] is being dropped, data loss could occur.
*/
--IF EXISTS (select top 1 1 from [People].[Affiliation])
--    RAISERROR (N'Rows were detected. The schema update is terminating because data loss might occur.', 16, 127) WITH NOWAIT
--GO
PRINT N'Altering [People].[Affiliation]...';
GO
--ALTER TABLE [People].[Affiliation] DROP COLUMN [IsPrimary];
--GO

PRINT N'Creating [People].[Affiliation].[IX_FacultyRankId]...';
GO
CREATE NONCLUSTERED INDEX [IX_FacultyRankId]
    ON [People].[Affiliation]([FacultyRankId] ASC);
GO
PRINT N'Creating FK_ActivitiesV2.ActivityType_Employees.EmployeeActivityType_TypeId...';
GO
ALTER TABLE [ActivitiesV2].[ActivityType] WITH NOCHECK
    ADD CONSTRAINT [FK_ActivitiesV2.ActivityType_Employees.EmployeeActivityType_TypeId] FOREIGN KEY ([TypeId]) REFERENCES [Employees].[EmployeeActivityType] ([Id]);
GO
PRINT N'Creating FK_Employees.EmployeeActivityType_Employees.EmployeeModuleSettings_EstablishmentId...';
GO
ALTER TABLE [Employees].[EmployeeActivityType] WITH NOCHECK
    ADD CONSTRAINT [FK_Employees.EmployeeActivityType_Employees.EmployeeModuleSettings_EstablishmentId] FOREIGN KEY ([EstablishmentId]) REFERENCES [Employees].[EmployeeModuleSettings] ([EstablishmentId]) ON DELETE CASCADE;


GO
PRINT N'Creating FK_Employees.Employee_Employees.EmployeeFacultyRank_FacultyRankId...';


GO
ALTER TABLE [Employees].[Employee] WITH NOCHECK
    ADD CONSTRAINT [FK_Employees.Employee_Employees.EmployeeFacultyRank_FacultyRankId] FOREIGN KEY ([FacultyRankId]) REFERENCES [Employees].[EmployeeFacultyRank] ([Id]);


GO
PRINT N'Creating FK_Employees.EmployeeFacultyRank_Employees.EmployeeModuleSettings_EstablishmentId...';


GO
ALTER TABLE [Employees].[EmployeeFacultyRank] WITH NOCHECK
    ADD CONSTRAINT [FK_Employees.EmployeeFacultyRank_Employees.EmployeeModuleSettings_EstablishmentId] FOREIGN KEY ([EstablishmentId]) REFERENCES [Employees].[EmployeeModuleSettings] ([EstablishmentId]);


GO
PRINT N'Creating FK_Employees.EmployeeModuleSettings_Establishments.Establishment_EstablishmentId...';


GO
ALTER TABLE [Employees].[EmployeeModuleSettings] WITH NOCHECK
    ADD CONSTRAINT [FK_Employees.EmployeeModuleSettings_Establishments.Establishment_EstablishmentId] FOREIGN KEY ([EstablishmentId]) REFERENCES [Establishments].[Establishment] ([RevisionId]);


GO
PRINT N'Creating FK_Employees.EmployeeModuleSettingsNotifyingAdmins_Employees.EmployeeModuleSettings_EmployeeModuleSettingsId...';


GO
ALTER TABLE [Employees].[EmployeeModuleSettingsNotifyingAdmins] WITH NOCHECK
    ADD CONSTRAINT [FK_Employees.EmployeeModuleSettingsNotifyingAdmins_Employees.EmployeeModuleSettings_EmployeeModuleSettingsId] FOREIGN KEY ([EmployeeModuleSettingsId]) REFERENCES [Employees].[EmployeeModuleSettings] ([EstablishmentId]) ON DELETE CASCADE;


GO
PRINT N'Creating FK_People.Affiliation_Employees.EmployeeFacultyRank_FacultyRankId...';


GO
ALTER TABLE [People].[Affiliation] WITH NOCHECK
    ADD CONSTRAINT [FK_People.Affiliation_Employees.EmployeeFacultyRank_FacultyRankId] FOREIGN KEY ([FacultyRankId]) REFERENCES [Employees].[EmployeeFacultyRank] ([Id]);


GO

PRINT N'Checking existing data against newly created constraints';
GO

ALTER TABLE [ActivitiesV2].[ActivityType] WITH CHECK CHECK CONSTRAINT [FK_ActivitiesV2.ActivityType_Employees.EmployeeActivityType_TypeId];

ALTER TABLE [Employees].[EmployeeActivityType] WITH CHECK CHECK CONSTRAINT [FK_Employees.EmployeeActivityType_Employees.EmployeeModuleSettings_EstablishmentId];

ALTER TABLE [Employees].[Employee] WITH CHECK CHECK CONSTRAINT [FK_Employees.Employee_Employees.EmployeeFacultyRank_FacultyRankId];

ALTER TABLE [Employees].[EmployeeFacultyRank] WITH CHECK CHECK CONSTRAINT [FK_Employees.EmployeeFacultyRank_Employees.EmployeeModuleSettings_EstablishmentId];

ALTER TABLE [Employees].[EmployeeModuleSettings] WITH CHECK CHECK CONSTRAINT [FK_Employees.EmployeeModuleSettings_Establishments.Establishment_EstablishmentId];

ALTER TABLE [Employees].[EmployeeModuleSettingsNotifyingAdmins] WITH CHECK CHECK CONSTRAINT [FK_Employees.EmployeeModuleSettingsNotifyingAdmins_Employees.EmployeeModuleSettings_EmployeeModuleSettingsId];

ALTER TABLE [People].[Affiliation] WITH CHECK CHECK CONSTRAINT [FK_People.Affiliation_Employees.EmployeeFacultyRank_FacultyRankId];


GO
PRINT N'Update complete.';
GO
