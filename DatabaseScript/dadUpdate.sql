IF OBJECT_ID (N'tbl_Version', N'U') IS NULL
BEGIN
	CREATE TABLE [dbo].[tbl_Version](
		[version] [int] NULL
	) ON [PRIMARY]
	INSERT INTO tbl_Version ([version]) VALUES (1);
END 

DECLARE @ver INT

DECLARE @Checker nvarchar(Max);
DECLARE @SqlCommand nvarchar(Max);
DECLARE @ParmDefinition nvarchar(Max);

SET @Checker =
	 N'IF(@oldVersion<@newVersion)
		BEGIN
					EXECUTE sp_executesql @command
					update tbl_Version set [version]=@newVersion;
		END';
SET @ParmDefinition = N'@oldVersion int, @newVersion int , @Command nvarchar(Max)';

SELECT @ver = [version] FROM tbl_Version ;
EXECUTE sp_executesql @Checker, @ParmDefinition,
						@Command = N'ALTER TABLE [dbo].[tbl_Charts] ALTER COLUMN [Description] NVARCHAR (MAX) NULL;
										ALTER TABLE [dbo].[tbl_Charts] ALTER COLUMN [Kpis] NVARCHAR (4000) NULL;
										ALTER TABLE [dbo].[tbl_Charts] ALTER COLUMN [Measurs] NVARCHAR (4000) NOT NULL;
										ALTER TABLE [dbo].[tbl_Charts] ALTER COLUMN [Provisions] NVARCHAR (MAX) NULL;
										ALTER TABLE [dbo].[tbl_Charts] ALTER COLUMN [SeriesLevel] NVARCHAR (MAX) NULL;',
						@oldVersion=@ver,
						@newVersion=2;

SELECT @ver = [version] FROM tbl_Version ;
EXECUTE sp_executesql @Checker, @ParmDefinition,
						@Command = N'ALTER TABLE [dbo].[tbl_DataSources] ALTER COLUMN [Database] NVARCHAR (1000) NULL;
										ALTER TABLE [dbo].[tbl_DataSources] ALTER COLUMN [Host] NVARCHAR (1000) NULL;
										ALTER TABLE [dbo].[tbl_DataSources] ALTER COLUMN [Name] NVARCHAR (1000) NOT NULL;
										ALTER TABLE [dbo].[tbl_DataSources] ALTER COLUMN [Password] NVARCHAR (1000) NULL;
										ALTER TABLE [dbo].[tbl_DataSources] ALTER COLUMN [Username] NVARCHAR (1000) NULL;
										ALTER TABLE [dbo].[tbl_DataSources] ALTER COLUMN [Details] NVARCHAR (Max) NULL;',
						@oldVersion=@ver,
						@newVersion=3;

SELECT @ver = [version] FROM tbl_Version ;
EXECUTE sp_executesql @Checker, @ParmDefinition,
						@Command = N'ALTER TABLE  [dbo].[security_Users] ADD Properties nvarchar(MAX);',
						@oldVersion=@ver,
						@newVersion=4;	 
				
SELECT @ver = [version] FROM tbl_Version ;
EXECUTE sp_executesql @Checker, @ParmDefinition,
						@Command = N'ALTER TABLE [dbo].[tbl_Version] ALTER COLUMN [version] INT NOT NULL;',
						@oldVersion=@ver,
						@newVersion=5;
						
SELECT @ver = [version] FROM tbl_Version ;
EXECUTE sp_executesql @Checker, @ParmDefinition,
						@Command = N'CREATE SCHEMA [log]
										AUTHORIZATION [dbo];',
						@oldVersion=@ver,
						@newVersion=6;

SELECT @ver = [version] FROM tbl_Version ;
EXECUTE sp_executesql @Checker, @ParmDefinition,
						@Command = N'ALTER TABLE [dbo].[tbl_Version]
										ADD CONSTRAINT [PK_tbl_Version] PRIMARY KEY CLUSTERED ([version] ASC);
									 CREATE TABLE [log].[Log] (
										[Id]             BIGINT         IDENTITY (1, 1) NOT NULL,
										[Time]           DATETIME       NOT NULL,
										[Username]       NVARCHAR (100) NULL,
										[UserAgent]      NVARCHAR (MAX) NULL,
										[Url]            NVARCHAR (256) NULL,
										[RequestMethod]  NVARCHAR (10)  NULL,
										[RequestType]    NVARCHAR (50)  NULL,
										[QueryString]    NVARCHAR (MAX) NULL,
										[PostParameters] NVARCHAR (MAX) NULL,
										CONSTRAINT [PK_Log] PRIMARY KEY CLUSTERED ([Id] ASC)
									 );',
						@oldVersion=@ver,
						@newVersion=7;

SELECT @ver = [version] FROM tbl_Version ;
EXECUTE sp_executesql @Checker, @ParmDefinition,
						@Command = N'CREATE TABLE [dbo].[tbl_License] (
									[Id]      BIGINT          IDENTITY (1, 1) NOT NULL,
									[License] NVARCHAR (4000) NOT NULL,
									CONSTRAINT [PK_License] PRIMARY KEY CLUSTERED ([Id] ASC)
								);',
						@oldVersion=@ver,
						@newVersion=8;

SELECT @ver = [version] FROM tbl_Version ;
EXECUTE sp_executesql @Checker, @ParmDefinition,
						@Command = N'ALTER TABLE [dbo].[security_Roles]
										ADD [Detail] NVARCHAR (4000) NULL;',
						@oldVersion=@ver,
						@newVersion=9;

SELECT @ver = [version] FROM tbl_Version ;
EXECUTE sp_executesql @Checker, @ParmDefinition,
						@Command = N'CREATE TABLE [dbo].[tbl_GlobalVariables] (
										[Id]           BIGINT         IDENTITY (1, 1) NOT NULL,
										[Name]         NVARCHAR (200) NOT NULL,
										[DefaultValue] NVARCHAR (200) NULL,
										[Scope]        INT CONSTRAINT [DF_tbl_GlobalVariables_Scope] DEFAULT ((0)) NOT NULL,
										[Value]        NVARCHAR (MAX) NULL,
										CONSTRAINT [PK_tbl_GlobalVariable] PRIMARY KEY CLUSTERED ([Id] ASC)
									);',
						@oldVersion=@ver,
						@newVersion=10;

SELECT @ver = [version] FROM tbl_Version ;
EXECUTE sp_executesql @Checker, @ParmDefinition,
						@Command = N'INSERT INTO [dbo].[tbl_MenuCategories] ( [MainMenuId], [Name], [Type]) VALUES ( 3, N''متغيرها'', 1)
									 INSERT INTO [dbo].[tbl_Menus] ( [MenuCategoryId], [Name], [Link], [Type], [Detail]) 
										VALUES ( (select Id from tbl_MenuCategories where Name=N''متغيرها'' and [Type]=1), N''مديريت متغيرها'', N''Moderation/GlobalVariable/index/'', 1, NULL)',
						@oldVersion=@ver,
						@newVersion=11;

SELECT @ver = [version] FROM tbl_Version ;
EXECUTE sp_executesql @Checker, @ParmDefinition,
						@Command = N'ALTER TABLE [dbo].[security_Users] ALTER COLUMN [Detail] NVARCHAR (MAX) NULL;
									 ALTER TABLE [dbo].[tbl_GlobalVariables] ALTER COLUMN [DefaultValue] NVARCHAR (MAX) NULL;
									 ALTER TABLE [dbo].[tbl_MainMenus] ALTER COLUMN [Name] NVARCHAR (200) NOT NULL;
									 ALTER TABLE [dbo].[tbl_MenuCategories] ALTER COLUMN [Name] NVARCHAR (200) NOT NULL;
									 ALTER TABLE [dbo].[tbl_Menus] ALTER COLUMN [Name] NVARCHAR (200) NULL;',
						@oldVersion=@ver,
						@newVersion=12;

SELECT @ver = [version] FROM tbl_Version ;
EXECUTE sp_executesql @Checker, @ParmDefinition,
						@Command = N'UPDATE tbl_Menus SET Type = 6 WHERE (Name = N''مديريت متغيرها'')
									 UPDATE tbl_Menus SET Type = 5 WHERE (Name = N''مدیریت منابع داده'')
									 UPDATE tbl_MenuCategories SET Type = 4 WHERE (Name = N''متغيرها'')	',
						@oldVersion=@ver,
						@newVersion=13;

SELECT @ver = [version] FROM tbl_Version ;
EXECUTE sp_executesql @Checker, @ParmDefinition,
						@Command = N'CREATE TABLE [dbo].[tbl_DataSourceNew_Chart] (
										[DatasourceNewId] BIGINT NOT NULL,
										[ChartId]         INT    NOT NULL,
										CONSTRAINT [PK_tbl_DataSourceNew_Chart] PRIMARY KEY CLUSTERED ([DatasourceNewId] ASC, [ChartId] ASC) ON [PRIMARY]
									);',
						@oldVersion=@ver,
						@newVersion=14;

SELECT @ver = [version] FROM tbl_Version ;
EXECUTE sp_executesql @Checker, @ParmDefinition,
						@Command = N'CREATE TABLE [dbo].[tbl_DataSourcesNew] (
										[Id]          BIGINT         IDENTITY (1, 1) NOT NULL,
										[Name]        NVARCHAR (200) NULL,
										[Type]        INT            NOT NULL,
										[AutoReresh]  INT            NOT NULL,
										[LastRefresh] DATETIME       NULL,
										[Detail]      NVARCHAR (MAX) NULL,
										[TableName]   NVARCHAR (50)  NULL,
										[Schema]      NVARCHAR (MAX) NOT NULL,
										CONSTRAINT [PK_tbl_DataSourcesNew] PRIMARY KEY CLUSTERED ([Id] ASC) ON [PRIMARY]
									) TEXTIMAGE_ON [PRIMARY];',
						@oldVersion=@ver,
						@newVersion=15;

SELECT @ver = [version] FROM tbl_Version ;
EXECUTE sp_executesql @Checker, @ParmDefinition,
						@Command = N'ALTER TABLE [dbo].[tbl_DataSourcesNew]
										ADD CONSTRAINT [DF_DataSourcesNew_AutoReresh] DEFAULT ((0)) FOR [AutoReresh];
									 ALTER TABLE [dbo].[tbl_DataSourceNew_Chart] WITH NOCHECK
										ADD CONSTRAINT [FK_tbl_DataSourceNew_Chart_tbl_DataSourcesNew] FOREIGN KEY ([DatasourceNewId]) REFERENCES [dbo].[tbl_DataSourcesNew] ([Id]) ON DELETE CASCADE;
									 ALTER TABLE [dbo].[tbl_DataSourceNew_Chart] WITH NOCHECK
										ADD CONSTRAINT [FK_tbl_DataSourceNew_Chart_tbl_Charts] FOREIGN KEY ([ChartId]) REFERENCES [dbo].[tbl_Charts] ([Id]) ON DELETE CASCADE;
										
										',
						@oldVersion=@ver,
						@newVersion=16;

SELECT @ver = [version] FROM tbl_Version ;
EXECUTE sp_executesql @Checker, @ParmDefinition,
						@Command = N'CREATE TRIGGER [dbo].[DeleteDataTable]
										ON  [dbo].[tbl_DataSourcesNew]
										   AFTER DELETE,update
										AS 
										BEGIN

										DECLARE @t NVARCHAR(50);
										DECLARE db_cursor CURSOR FOR SELECT isnull(deleted.TableName ,''null'') 
										FROM deleted left join inserted on deleted.Id =inserted.Id 
										where deleted.TableName<> isnull(inserted.TableName,deleted.TableName) or inserted.TableName is null
										OPEN db_cursor;
										FETCH NEXT FROM db_cursor INTO @t
										WHILE @@FETCH_STATUS = 0  
										BEGIN  
											SELECT @t = isnull(deleted.TableName ,''sds'') FROM deleted;
											declare @SQL nvarchar(500);

											SELECT @SQL = ''IF OBJECT_ID(''''''+QUOTENAME(@t)+'''''', ''''U'''') IS NOT NULL  DROP TABLE dbo.'' +  QUOTENAME(@t);
											EXECUTE sp_executesql @SQL

											   FETCH NEXT FROM db_cursor INTO @t
										END;
										CLOSE db_cursor;
										DEALLOCATE db_cursor;

										END',
						@oldVersion=@ver,
						@newVersion=17;

SELECT @ver = [version] FROM tbl_Version ;
EXECUTE sp_executesql @Checker, @ParmDefinition,
						@Command = N'ALTER TABLE [dbo].[tbl_DataSourceNew_Chart] WITH CHECK CHECK CONSTRAINT [FK_tbl_DataSourceNew_Chart_tbl_DataSourcesNew];
									 ALTER TABLE [dbo].[tbl_DataSourceNew_Chart] WITH CHECK CHECK CONSTRAINT [FK_tbl_DataSourceNew_Chart_tbl_Charts];',
						@oldVersion=@ver,
						@newVersion=18;

SELECT @ver = [version] FROM tbl_Version ;
EXECUTE sp_executesql @Checker, @ParmDefinition,
						@Command = N'ALTER TABLE dbo.tbl_Charts ADD
											UserId int NULL,
											LastModifiedTime datetime NULL,
											Uniquename nvarchar(400) NULL;
									 ALTER TABLE dbo.tbl_Charts ADD CONSTRAINT
											FK_tbl_Charts_security_Users FOREIGN KEY
											(UserId) REFERENCES dbo.security_Users
											(Id) ON UPDATE  NO ACTION 
											 ON DELETE  NO ACTION ;
											 ALTER TABLE tbl_MenuCategories ADD [Order] INT NOT NULL DEFAULT 0;
											 ALTER TABLE tbl_Menus ADD [Order] INT NOT NULL DEFAULT 0;',
						@oldVersion=@ver,
						@newVersion=19;

SELECT @ver = [version] FROM tbl_Version ;
EXECUTE sp_executesql @Checker, @ParmDefinition,
						@Command = N'UPDATE tbl_MenuCategories SET [Order] = s.r
									FROM tbl_MenuCategories AS a
									INNER JOIN ( SELECT *, ROW_NUMBER() OVER (ORDER BY id) AS r
										FROM tbl_MenuCategories
										WHERE type = 3) s ON s.id = a.id;
												
									UPDATE tbl_Menus SET [Order] = s.r 
									FROM tbl_Menus AS a
									INNER JOIN ( SELECT *, ROW_NUMBER() OVER (ORDER BY id) AS r
										FROM tbl_Menus
										WHERE type = 4) s ON s.id = a.id',
						@oldVersion=@ver,
						@newVersion=20;

SELECT @ver = [version] FROM tbl_Version ;
EXECUTE sp_executesql @Checker, @ParmDefinition,
						@Command = N'CREATE TRIGGER delete_charts_of_datasource ON dbo.tbl_DataSource_Chart
										AFTER DELETE
										AS
										BEGIN
											SET NOCOUNT ON;
											DELETE FROM tbl_Charts
											WHERE id IN (SELECT chartId FROM deleted)
										END;',
						@oldVersion=@ver,
						@newVersion=21;

SELECT @ver = [version] FROM tbl_Version ;
EXECUTE sp_executesql @Checker, @ParmDefinition,
						@Command = N'ALTER TABLE tbl_DataSources ADD [UniqueId] NVARCHAR(200) NULL;',
						@oldVersion=@ver,
						@newVersion=22;
						
SELECT @ver = [version] FROM tbl_Version ;
EXECUTE sp_executesql @Checker, @ParmDefinition,
						@Command = N'DECLARE db_cursor_temp CURSOR FOR SELECT id FROM tbl_DataSources;
									 DECLARE @id INT;
									 OPEN db_cursor_temp;
									 
									 FETCH NEXT FROM db_cursor_temp INTO @id;
									 
									 WHILE @@FETCH_STATUS = 0
									 BEGIN
										DECLARE @CharPool NVARCHAR(100);
										DECLARE @LoopCount INT;
										DECLARE @RandomString NVARCHAR(100);
									 
										SET @CharPool = ''abcdefghijkmnopqrstuvwxyzABCDEFGHIJKLMNPQRSTUVWXYZ0123456789'';
										SET @LoopCount = 0;
										SET @RandomString = '''';
									 
										WHILE (@LoopCount <= 32)
										BEGIN
											SET @RandomString = @RandomString + SUBSTRING(@Charpool, CONVERT(INT, RAND() * Len(@CharPool)), 1);
											SET @LoopCount = @LoopCount + 1;
										END
									 
										UPDATE tbl_DataSources SET [UniqueId] = @RandomString	WHERE id = @id;
									 
										FETCH NEXT FROM db_cursor_temp INTO @id;
									 END;

									CLOSE db_cursor_temp;
									DEALLOCATE db_cursor_temp;',
						@oldVersion=@ver,
						@newVersion=23;

SELECT @ver = [version] FROM tbl_Version ;
EXECUTE sp_executesql @Checker, @ParmDefinition,
							@Command = N'IF EXISTS (SELECT name FROM sysobjects
							WHERE name = ''delete_charts_of_datasource'' AND type = ''TR'')
							DROP TRIGGER delete_charts_of_datasource',
						@oldVersion=@ver,
						@newVersion=24;

SELECT @ver = [version] FROM tbl_Version ;
EXECUTE sp_executesql @Checker, @ParmDefinition,
						@Command = N'CREATE TRIGGER delete_charts_of_datasource ON dbo.tbl_DataSource_Chart
										AFTER DELETE
										AS
										BEGIN
											SET NOCOUNT ON;
											DELETE FROM tbl_Charts
											WHERE id IN (SELECT chartId FROM deleted)
										END;',
						@oldVersion=@ver,
						@newVersion=25;

SELECT @ver = [version] FROM tbl_Version ;
EXECUTE sp_executesql @Checker, @ParmDefinition,
						@Command = N'ALTER TABLE dbo.tbl_Charts ADD OwnerUser int NULL',
						@oldVersion=@ver,
						@newVersion=26;
		
SELECT @ver = [version] FROM tbl_Version ;
EXECUTE sp_executesql @Checker, @ParmDefinition,
						@Command = N'ALTER TABLE tbl_GlobalVariables ADD [ValuesType] int DEFAULT 0;',
						@oldVersion=@ver,
						@newVersion=27;
						
SELECT @ver = [version] FROM tbl_Version ;
EXECUTE sp_executesql @Checker, @ParmDefinition,
						@Command = N'
/******************************
* System.MIS
* Info.Second: تبديل تاريخ شمسي به ميلادي
* nm: 1388/11/25
*******************************/
CREATE FUNCTION [dbo].[Convert_Shamsi_Miladi]
	(
		@Date  NVARCHAR(10)
	)
RETURNS DATETIME
AS
	BEGIN
	 DECLARE @Year  AS INT
	 DECLARE @Month AS INT
	 DECLARE @Day   AS INT
	 DECLARE @Help  AS NVARCHAR(10)
	 DECLARE @DIF	 INT
	 DECLARE @yy	 INT
	 DECLARE @a		 DATETIME
	 
	 SET @Year  = LEFT (@Date, 4)
	 SET @Help  = LEFT (@Date, 7)
	 SET @Month = RIGHT(@Help, 2)
	 SET @Day   = RIGHT(@Date, 2)

	
	IF (@Month > 6) 
		SET @DIF = 186 + (@Month - 7) * 30 + @Day

	Else
		SET @DIF = 31 * (@Month - 1) + @Day

	SET @Year =@Year - 1301
	SET @yy = 0
	WHILE (@yy <= @Year)
		BEGIN   

		IF (@YY % 4 = 3) 
			SET @DIF = @DIF + 366
		ELSE
			SET @DIF = @DIF + 365
			SET @yy = @yy+1 
		END
	
	SET @a = CONVERT(DATETIME,''3/20/1921'')

	RETURN DATEADD(dd, @DIF, @a)
	END
	',
						@oldVersion=@ver,
						@newVersion=28;
						
				
SELECT @ver = [version] FROM tbl_Version ;
EXECUTE sp_executesql @Checker, @ParmDefinition,
						@Command = N'
/******************************
* System.MIS
* Info.Second:  تبديل تاريخ ميلادي به شمسي
* nm: 1389/11/25
*******************************/
CREATE FUNCTION [dbo].[Convert_Miladi_Shamsi]
	(
	
		@EDate DATETIME = -2
	
	)
RETURNS NVARCHAR(10)
AS
	BEGIN
--- DECLARATION -------------------------	
	DECLARE @stringdate AS NVARCHAR(50)
	DECLARE @fdate CHAR(10)  
	DECLARE @EYear int,
			@EMon SMALLINT,
			@EDay SMALLINT,
			@ELeap BIT,
			@EMonArray CHAR(12),
			@EDayOfYear INT 
	DECLARE @FYear INT, @FMon SMALLINT, @FDay SMALLINT, @FLeap BIT, @FMonArray CHAR(12) 
------------------------------------	
			
	 Select @FMonArray= Char(31)+Char(31)+Char(31)+Char(31)+Char(31)+Char(31)+Char(30)+Char(30)+Char(30)+Char(30)+Char(30)+Char(29) 
	 Select @EMonArray= Char(31)+Char(28)+Char(31)+Char(30)+Char(31)+Char(30)+Char(31)+Char(31)+Char(30)+Char(31)+Char(30)+Char(31) 


	 SELECT @EYear = YEAR (@EDate) 
	 SELECT @EMon  = MONTH(@EDate) 
	 SELECT @EDay  = DAY  (@EDate) 
	 
 IF (@EYear %4) = 0 SELECT @ELeap = 1 ELSE SELECT @ELeap = 0 
 
 --------------------- Calc Day Of Year ---------
 DECLARE @Temp INT, @Cnt INT 
 SELECT @Cnt = @EMon-1 
 SELECT @Temp = 0 
 
 WHILE @Cnt <> 0 
	 BEGIN 
	   IF (@Cnt = 2)AND (@ELeap = 1) SELECT @Temp = @Temp + 29 
	   
	   ELSE SELECT @Temp = @Temp + ASCII(SUBSTRING(@EMonArray, @Cnt, 1)) 
			SELECT @Cnt = @Cnt - 1 
	 END 
	 
 SELECT @EDayOfYear = @Temp + @EDay 
 ---------------------- Convert to Farsi 
 SELECT @Temp = @EDayOfYear - 79 
 
 IF @Temp > 0 SELECT @FYear = @EYear - 621 
 ELSE 
	 BEGIN 
	 
		  SELECT @FYear = @EYear - 622 
		  IF ((@FYear %4)=3) 
			SELECT @Temp = @Temp + 366 
		  ELSE
			SELECT @Temp = @Temp + 365 
	 END 
  IF (@FYear % 4) = 3
	SELECT @FLeap = 1 
  ELSE 
	SELECT @Fleap = 0
	 
 SELECT @Cnt = 1 
 
 WHILE (@Temp <> 0) AND (@Temp > ASCII(SUBSTRING(@FMonArray, @Cnt, 1)))
 BEGIN 
   IF @Cnt=12 
	 IF (@FLeap = 1) 
	 SELECT @Temp = @Temp - 30 
	 ELSE 
	 SELECT @Temp = @Temp - 29 
	 
   ELSE 
		SELECT @Temp = @Temp - ASCII(SUBSTRING(@FMonArray, @Cnt, 1)) 
		SELECT @Cnt = @Cnt + 1 
 END 
 
 IF @Temp <> 0 
	 BEGIN 
		  SELECT @FMon = @Cnt 
		  SELECT @FDay = @Temp 
	 END 
 ELSE 
	 BEGIN
		  SELECT @FMon = 12 
		  SELECT @FDay = 30 
	 END 
 ------------------ Create Output ------------
 DECLARE @YStr CHAR(4), @MStr CHAR(2), @DStr CHAR(2) 
 
 SELECT @YStr = CONVERT(CHAR, @FYear) 
 IF @FMon<10 
	SELECT @MStr = ''0'' + CONVERT(CHAR, @FMon) 
ELSE 
	SELECT @MStr = CONVERT(CHAR, @FMon) 
	
 IF @FDay < 10 
	SELECT @DStr = ''0'' + Convert(Char, @FDay) 
ELSE 
	SELECT @DStr = Convert(Char, @FDay) 

Select @FDate = @YStr + ''/'' + @MStr + ''/'' + @dStr
RETURN @FDate
	END',
						@oldVersion=@ver,
						@newVersion=29;


SELECT @ver = [version] FROM tbl_Version ;
EXECUTE sp_executesql @Checker, @ParmDefinition,
						@Command = N'CREATE TABLE dbo.tbl_Packages
										(
										Id int NOT NULL IDENTITY (1, 1),
										Name nvarchar(200) NOT NULL,
										Scope int NOT NULL,
										Parent int  NULL,
										Trash bit NOT NULL DEFAULT 0
										)  ON [PRIMARY];
									ALTER TABLE dbo.tbl_Packages ADD CONSTRAINT PK_Id PRIMARY KEY (Id);
									ALTER TABLE dbo.tbl_Charts ADD PackageId int NULL;
									ALTER TABLE dbo.tbl_Charts ADD Trash bit NOT NULL DEFAULT 0;
									ALTER TABLE dbo.tbl_DataSources ADD PackageId int NULL;
									ALTER TABLE dbo.tbl_DataSources ADD Trash bit NOT NULL DEFAULT 0;
									',
						@oldVersion=@ver,
						@newVersion=30;


SELECT @ver = [version] FROM tbl_Version ;
EXECUTE sp_executesql @Checker, @ParmDefinition,
						@Command = N'INSERT INTO tbl_Menus (MenuCategoryId, NAME, Link, [Type], Detail, [Order])
									 VALUES (59, N''ارتباط بین منابع داده'', ''Moderation/DatasourceInterRelation/index/'', 5, NULL, 0);
									  CREATE TABLE dbo.[tbl_DatasourceInterRelationMeta] (
											[Id]             BIGINT         IDENTITY (1, 1) NOT NULL,
											[Name]		   NVARCHAR (100) NULL,
											[Data]		   NVARCHAR (max)  NULL,
											CONSTRAINT [PK_DatasourceInterRelationMeta] PRIMARY KEY CLUSTERED ([Id] ASC)
										);
										CREATE TABLE dbo.[tbl_DatasourceInterRelation] (
											[Id]             BIGINT         IDENTITY (1, 1) NOT NULL,
											[DatasourceInterRelationMetaId]		   Int NOT NULL,
											[LeftDatasourceId]		   Int NOT NULL,
											[LeftColumnName]		   NVARCHAR (300) NOT NULL,
											[RightDatasourceId]		   Int NOT NULL,
											[RightColumnName]		   NVARCHAR (300) NOT NULL,
											CONSTRAINT [PK_DatasourceInterRelation] PRIMARY KEY CLUSTERED ([Id] ASC)
										);
										ALTER TABLE dbo.tbl_DataSources ADD Owner int NULL;
										CREATE TABLE [dbo].[tbl_MapData] (
										[Id]           INT         IDENTITY (1, 1) NOT NULL,
										[Name]         NVARCHAR (200) NOT NULL,
										[Data] NVARCHAR (max) NOT NULL,
										CONSTRAINT [PK_tbl_MapData] PRIMARY KEY CLUSTERED ([Id] ASC)
										);
										insert into tbl_MapData  (Name, Data) values
											(''ایران'',''{"type":"Topology","objects":{"map":{"type":"GeometryCollection","bbox":[44.04726400000004,25.058749000000034,63.31745900000004,39.77722300000005],"geometries":[{"type":"Polygon","properties":{"Name":"اردبیل","Code":"IR.AR","Shape_Leng":9.45464124147,"Shape_Area":1.83854585004},"arcs":[[0,1,2,3]]},{"type":"MultiPolygon","properties":{"Name":"بهشهر","Code":"IR.BS","Shape_Leng":15.9284232977,"Shape_Area":2.20134131783},"arcs":[[[4]],[[5]],[[6,7,8,9,10,11]]]},{"type":"Polygon","properties":{"Name":"چهار محال بختیاری","Code":"IR.CM","Shape_Leng":5.95476692238,"Shape_Area":1.45989991714},"arcs":[[12,13,14]]},{"type":"Polygon","properties":{"Name":"آذربایجان شرقی","Code":"IR.EA","Shape_Leng":12.3044441387,"Shape_Area":4.98630664583},"arcs":[[15,16,17,-3]]},{"type":"Polygon","properties":{"Name":"اصفهان","Code":"IR.ES","Shape_Leng":19.227125231,"Shape_Area":10.6715272876},"arcs":[[18,19,20,-15,21,22,23,24,25]]},{"type":"Polygon","properties":{"Name":"فارس","Code":"IR.FA","Shape_Leng":17.3243800634,"Shape_Area":11.6641009896},"arcs":[[26,27,28,-10,29,-20]]},{"type":"Polygon","properties":{"Name":"گیلان","Code":"IR.GI","Shape_Leng":7.09578493577,"Shape_Area":1.43837449069},"arcs":[[30,31,32,-1,33]]},{"type":"Polygon","properties":{"Name":"گلستان","Code":"IR.GO","Shape_Leng":7.68652233266,"Shape_Area":2.0818944364},"arcs":[[34,35,36,37]]},{"type":"Polygon","properties":{"Name":"همدان","Code":"IR.HD","Shape_Leng":10.8394496867,"Shape_Area":2.02099127053},"arcs":[[38,39,40,41,42,43]]},{"type":"MultiPolygon","properties":{"Name":"هرمزگان","Code":"IR.HG","Shape_Leng":40.2106571538,"Shape_Area":6.16562589544},"arcs":[[[44]],[[45]],[[46]],[[47]],[[48]],[[49]],[[50]],[[51]],[[52]],[[53]],[[54]],[[55]],[[56]],[[57]],[[58]],[[59]],[[60,-11,-29,61,62,63]]]},{"type":"Polygon","properties":{"Name":"ایلام","Code":"IR.IL","Shape_Leng":9.14502922904,"Shape_Area":1.76551845096},"arcs":[[64,65,66,67]]},{"type":"Polygon","properties":{"Name":"کرمان","Code":"IR.KE","Shape_Leng":22.0574203899,"Shape_Area":17.0549573504},"arcs":[[68,69,-62,-28,70]]},{"type":"Polygon","properties":{"Name":"خرمشهر","Code":"IR.BK","Shape_Leng":10.6959422924,"Shape_Area":2.23964646037},"arcs":[[-43,71,-68,72,73]]},{"type":"MultiPolygon","properties":{"Name":"خوزستان","Code":"IR.KZ","Shape_Leng":24.0285694584,"Shape_Area":6.0672587348},"arcs":[[[74]],[[75]],[[76]],[[77]],[[78]],[[79]],[[80]],[[81]],[[82]],[[83]],[[-22,-14,84,-8,85,-66,86]]]},{"type":"Polygon","properties":{"Name":"کهکیلویه و بویر احمد","Code":"IR.KB","Shape_Leng":6.034798001,"Shape_Area":1.25419459719},"arcs":[[-21,-30,-9,-85,-13]]},{"type":"Polygon","properties":{"Name":"کردستان","Code":"IR.KD","Shape_Leng":11.1240984112,"Shape_Area":2.93343533734},"arcs":[[-44,-74,87,88,89]]},{"type":"Polygon","properties":{"Name":"لرستان","Code":"IR.LO","Shape_Leng":9.89942086682,"Shape_Area":2.82464858915},"arcs":[[-42,90,-23,-87,-65,-72]]},{"type":"Polygon","properties":{"Name":"مرکزی","Code":"IR.MK","Shape_Leng":12.3666885352,"Shape_Area":2.76570064821},"arcs":[[91,-24,-91,-41,92,93]]},{"type":"MultiPolygon","properties":{"Name":"مازندران","Code":"IR.MN","Shape_Leng":10.3377718281,"Shape_Area":2.45227502221},"arcs":[[[-37,94,95,96,-31,97]]]},{"type":"Polygon","properties":{"Name":"خراسان شمالی","Code":"IR.KS","Shape_Leng":9.55251601821,"Shape_Area":2.54911266757},"arcs":[[98,99,-35,100]]},{"type":"Polygon","properties":{"Name":"قزوین","Code":"IR.QZ","Shape_Leng":7.92818543721,"Shape_Area":1.56927770232},"arcs":[[-97,101,-93,-40,102,-32]]},{"type":"Polygon","properties":{"Name":"قم","Code":"IR.QM","Shape_Leng":5.38218578688,"Shape_Area":1.14842028529},"arcs":[[103,-25,-92,104]]},{"type":"Polygon","properties":{"Name":"خراسان رضوی","Code":"IR.KV","Shape_Leng":24.6599374902,"Shape_Area":13.6279857717},"arcs":[[105,106,107,-99,108]]},{"type":"Polygon","properties":{"Name":"سمنان","Code":"IR.SM","Shape_Leng":15.6901991018,"Shape_Area":9.01501329755},"arcs":[[-100,-108,109,-26,-104,110,-95,-36]]},{"type":"MultiPolygon","properties":{"Name":"سیستان و بلوچستان","Code":"IR.SB","Shape_Leng":24.890056375,"Shape_Area":16.1196835729},"arcs":[[[-63,-70,111,112]]]},{"type":"Polygon","properties":{"Name":"خراسان جنوبی","Code":"IR.KJ","Shape_Leng":14.0302148332,"Shape_Area":8.03275282952},"arcs":[[113,-112,-69,114,-106]]},{"type":"Polygon","properties":{"Name":"تهران","Code":"IR.TH","Shape_Leng":9.42333463502,"Shape_Area":1.91025948003},"arcs":[[-96,-111,-105,-94,-102]]},{"type":"Polygon","properties":{"Name":"آذربایجان غربی","Code":"IR.WA","Shape_Leng":15.4570995345,"Shape_Area":3.67294451363},"arcs":[[-17,115,-89,116]]},{"type":"Polygon","properties":{"Name":"یزد","Code":"IR.YA","Shape_Leng":20.4716892414,"Shape_Area":12.2283630441},"arcs":[[-115,-71,-27,-19,-110,-107]]},{"type":"Polygon","properties":{"Name":"زنجان","Code":"IR.ZA","Shape_Leng":7.97949408509,"Shape_Area":2.23083836543},"arcs":[[-33,-103,-39,-90,-116,-16,-2]]}]}},"arcs":[[[2365,9074],[-6,-18],[34,-18],[14,-39],[21,7],[20,-13],[-59,-60],[-12,-27],[-59,-65],[-14,-39],[4,-26],[-32,-37],[0,-13],[30,-48],[4,-44],[25,-56],[2,-15],[22,-19],[12,-35],[63,-95],[62,-48],[4,-25],[-6,-47],[15,-45]],[[2509,8249],[-13,0],[-24,25],[-20,-1],[-16,-27],[-49,16],[0,-46],[-26,-2],[-14,12],[-29,43],[-38,-8]],[[2280,8261],[-10,18],[-87,45],[-39,35],[2,34],[-22,56],[-36,10],[-59,9],[-22,51],[-6,60],[6,60],[30,47],[-20,6],[-22,27],[-27,17],[-34,40],[-18,93],[4,57],[-10,20],[-39,32],[-93,-29],[-53,9],[-18,34],[-14,-3],[-34,-33],[-19,27],[11,58],[22,8],[2,27],[26,35],[22,2],[33,48],[75,-9],[26,14],[2,26],[-53,30],[-14,19],[33,15],[20,28],[-8,52],[-35,38],[10,45],[-22,45],[24,45],[-34,53],[-10,39],[4,25],[-6,58],[-37,50],[-20,15]],[[1711,9749],[21,33],[80,27],[41,33],[63,34],[34,37],[49,3],[46,28],[51,-61],[32,-29],[14,-31],[30,-34],[73,-66],[-86,-34],[-41,-38],[4,-37],[42,-35],[4,-15],[37,-18],[32,-47],[-4,-33],[-32,-20],[-63,-7],[-42,-11],[-6,-20],[-33,-2],[2,-40],[17,-25],[34,-28],[42,-12],[29,-22],[2,-38],[20,-15],[12,-27],[22,-5],[47,10],[12,-38],[59,-64],[10,-28]],[[3540,2728],[9,-5],[4,-35],[-15,-6],[2,46]],[[3241,2864],[22,-10],[-2,-30],[-16,0],[-4,40]],[[4473,1630],[-26,1],[-59,97],[-34,28],[-43,3],[-79,35],[-34,36],[-4,13],[-44,46],[-59,-6],[-65,8],[-24,-11],[-31,-2],[-18,12],[-34,4],[-26,27],[-35,8],[-18,34],[-10,-19],[-14,2],[-8,38],[-17,45],[-46,62],[12,60],[-61,94],[-26,54],[-20,73],[-6,102],[-21,51],[-2,25],[-16,25],[-28,-6],[16,-15],[-44,0],[-41,68],[10,50],[31,-30],[16,10],[2,71],[-22,26],[-13,-8],[-28,45],[-29,2],[19,-17],[-19,-12],[-38,-5],[-14,32],[8,57],[10,5],[-8,28],[-4,95],[-34,30],[-35,48],[-14,27],[-28,38],[-17,8],[-46,57],[-32,65],[-49,60],[-12,5],[2,80],[-4,25],[-26,63],[-23,17]],[[3111,3494],[29,38],[30,15],[53,-38],[24,-5],[65,2]],[[3312,3506],[24,-13],[22,1],[13,-20],[18,0],[12,-20]],[[3401,3454],[-18,-6],[8,-51],[22,-33],[24,-12],[25,-45],[1,-33],[17,-20],[42,2],[23,-13],[12,6],[52,0],[53,-26],[36,1],[24,-20],[17,-40],[-2,-67],[73,-94],[18,-14],[69,-25],[12,-15],[64,-146],[31,-79],[73,-120],[42,-117],[20,-47],[12,-46],[1,-45],[36,-105],[36,-74],[-4,-59],[29,-26],[22,6],[59,-85],[56,-157],[29,-73],[24,-32],[76,-66],[23,-27],[16,-7],[30,-33],[45,-33]],[[4629,1578],[-28,-19],[-61,10],[-52,-9],[-13,-30]],[[4475,1530],[-49,48],[13,12],[30,-5],[8,21],[-4,24]],[[3769,4148],[-30,6],[-35,-15],[-22,-40],[-36,0],[-12,13],[-29,-8],[-30,7],[-55,46],[-30,46],[-26,19],[-55,72],[-18,5],[-47,0],[-24,5],[-49,25],[-24,25],[-26,14]],[[3221,4368],[18,40],[38,49],[0,26],[-26,26],[-6,33],[-32,17],[-6,28],[-19,12],[-46,78],[-10,66],[-6,18],[-19,7],[-44,31],[-14,45],[-27,52],[-54,70],[-14,60],[-2,33]],[[2952,5059],[34,15],[53,42],[30,8],[14,-11],[36,8],[11,13],[30,2],[52,-57],[17,-6],[48,15],[13,-14],[24,9],[28,33],[29,15],[103,3],[16,27],[24,8],[26,-25],[-4,-55],[29,2],[-4,-27],[24,-33],[2,-33],[-22,-27],[6,-33],[38,-19],[37,-33],[56,-65],[37,-20],[26,-32],[10,-100],[-12,-27],[-34,-20],[1,-28],[37,-40],[-6,-20],[-30,0],[-17,-20],[5,-113],[7,-27],[37,-73],[16,-87],[0,-40],[-10,-26]],[[2280,8261],[-39,-37],[-48,4],[-57,21],[-89,-13],[-56,13],[-37,-15],[-46,2],[-65,-12],[-35,-22],[-14,-28],[-50,-22],[-43,-68],[-30,-17],[-22,-26],[-27,-55],[10,-40]],[[1632,7946],[-78,-5],[-19,-15],[-26,10],[-67,2],[-10,31],[16,34],[-2,26],[-34,40],[18,22],[-24,28],[-41,3],[-24,35],[-39,-3],[-3,-25],[-33,3],[-12,-15],[-26,-1],[-35,-35],[-2,-32],[-38,-23],[-45,46],[-56,27],[-12,30],[-43,27],[-30,43],[-63,-20],[-45,3],[-16,24],[-83,56],[-62,34],[-21,30],[-8,63],[8,57],[-4,38],[-36,30],[-24,58],[-11,97],[5,45],[-2,104],[-13,58],[-14,28],[-38,42],[0,50],[12,28],[54,68],[73,69],[10,43],[-26,64],[-2,36],[16,37],[-2,33],[73,80]],[[748,9454],[28,-12],[13,6],[26,-19],[16,7],[99,-32],[39,-23],[16,13],[28,-12],[0,-33],[10,32],[20,8],[41,-30],[24,-3],[55,43],[36,9],[33,-20],[16,8],[34,-4],[8,-13],[39,35],[48,62],[27,10],[6,22],[46,58],[37,10],[16,-15],[40,28],[17,47],[40,38],[34,9],[10,13],[51,36],[10,17]],[[5878,6306],[0,-87],[6,-20],[0,-101],[7,-40],[0,-182],[-7,-40],[-23,-60],[-32,-58],[-24,-34],[-25,7],[-67,-8],[-32,-34],[-12,-48],[-6,-62],[-46,-130],[-19,-28],[-30,-27],[-37,-20],[-32,-8],[-73,-27],[-81,-21],[-42,-7],[-57,-22],[-36,-28],[-87,-40],[-24,-8],[-43,-27],[-42,-15],[-49,0],[-42,20],[-49,7],[-73,18],[-36,-7],[-43,-20],[-34,-28],[-18,-27],[-37,-13],[-41,-7],[-11,-20],[2,-75],[6,-33],[2,-53],[6,-27],[-4,-82],[-33,-113],[2,-62],[-10,-32],[0,-54],[25,-54],[0,-27]],[[4577,4442],[-58,-20],[-23,-14],[-71,-21],[-35,-6],[-54,6],[-55,20],[-36,0],[-29,32],[4,40],[-6,40],[-12,8],[-23,-28],[-36,0],[-12,-26],[-22,-21],[-30,0],[-12,-28],[-45,-33],[-30,0],[-43,20],[-18,-7],[32,-60],[25,-20],[36,0],[24,-13],[18,-27],[1,-20],[-17,-40],[-10,-60],[0,-35],[-34,-53],[-21,-80],[1,-34],[12,-48],[-5,-25],[-54,-8]],[[3939,3881],[-12,20],[-53,27],[-73,79],[-36,74],[-2,60],[6,7]],[[2952,5059],[-2,20],[32,69],[-44,38],[-55,-3],[-43,-9],[-36,90]],[[2804,5264],[0,27],[40,30],[37,8],[24,22],[-2,25],[-12,27],[-2,26],[36,23],[6,20],[31,-6],[18,16],[36,1],[4,33],[29,63],[0,13],[36,54],[0,27],[-20,6],[-6,20],[30,34]],[[3089,5733],[30,41],[90,58],[74,10],[43,21],[49,1],[42,15],[42,23],[53,54],[44,-18],[17,34],[-6,40],[4,20],[42,34],[19,40],[-7,40]],[[3625,6146],[-32,18],[18,82],[4,82],[23,35],[85,30],[111,3],[30,-5],[61,1],[50,14],[41,36]],[[4016,6442],[20,-20],[31,-13],[24,-20],[63,-18],[54,8],[12,7],[87,2],[37,-6],[81,-26],[48,-27],[124,-37],[135,2],[38,-6],[154,3],[36,7],[171,3],[81,13],[172,2],[18,8],[295,2],[67,13],[57,0],[50,-20],[7,-13]],[[4577,4442],[54,-20],[97,-48],[37,-26],[54,-60],[17,-27],[26,-54],[18,-81],[55,-148],[24,-47],[24,-82],[22,-33],[37,-82],[18,-26],[10,-34],[49,-53],[46,-68],[18,-81],[0,-60],[5,-48],[30,-46],[40,-34],[42,-13],[88,-55]],[[5388,3216],[-2,-40],[36,-80],[23,-42],[10,-53],[18,-20],[34,-20],[106,-2],[36,-13],[16,-40],[18,-75],[22,-80],[33,-93],[12,-14]],[[5750,2644],[34,-121],[-18,-20],[-24,0],[0,-20],[40,-34],[29,-35],[76,-67],[45,-54],[6,-68],[-27,-131],[-11,-26],[0,-47],[40,-27],[29,-34],[7,-20],[-5,-51],[-17,-25],[-46,-6],[-45,7],[-45,-44],[-34,-12],[-12,-13],[-26,-96],[-14,-31],[-28,-25],[-69,0],[-41,20],[-34,0],[-24,14],[-29,1],[-40,-14],[-16,-26],[-17,0],[-30,26],[-46,-11],[-35,6],[-91,-12],[-28,-14],[-45,-39],[6,-60],[-18,-46],[18,-13],[-16,-32],[-30,-8],[-22,-26],[-69,8],[-69,26],[-30,6],[-51,-19],[-18,7],[-22,26],[-41,34],[-63,0],[-40,-7],[-22,8],[-19,20],[-12,45],[-12,14]],[[3401,3454],[28,8],[18,14],[53,-13],[18,6],[29,-5],[36,14],[28,35],[23,0],[70,49],[13,14],[-1,53],[-24,27],[16,13],[-12,28],[0,27],[-18,20],[6,47],[-18,7],[6,13],[40,1],[59,-40],[37,-13],[0,-20],[24,0],[36,-26],[35,6],[52,35],[4,34],[-6,46],[-14,47]],[[3387,8102],[0,-21],[-35,-30],[-18,-2],[-24,-35],[-4,-75],[-23,-35],[-36,-16]],[[3247,7888],[-38,11],[-31,0],[-55,-16],[-74,-39],[-35,-28],[-50,-2],[-33,12],[-6,13],[-56,-3],[-57,20],[-61,68],[-2,35],[-32,27],[-20,-2]],[[2697,7984],[-10,57],[-23,70],[-56,68],[-35,34],[-64,36]],[[2365,9074],[22,-12],[49,7],[26,25],[45,-5],[-7,-96],[5,-51],[12,-43],[-1,-45],[5,-45],[18,-43],[-4,-42],[24,-50],[0,-25],[12,-43],[38,-50],[77,-67],[51,-27],[59,-21],[56,-12],[164,-16],[43,16],[-4,-16],[30,-19],[91,-15],[25,-20],[8,-50],[34,-91],[20,-22],[59,-49],[26,-25],[39,-20]],[[6288,8848],[6,-29],[-8,-47],[12,-58],[-18,-65],[10,-33],[29,-7],[34,-23],[16,-34],[-10,-41],[-38,-19],[-85,-18],[-19,-28],[-20,0],[-26,-25],[2,-28],[-41,-40]],[[6132,8353],[-20,1],[-42,-68],[-31,-82],[-18,-28],[-32,-25],[-9,-22],[-9,-53],[-10,-102],[-23,-26],[-32,-6],[-92,22],[-46,7],[-59,1],[-68,-19],[-69,-41],[-42,-48],[-45,-60],[-26,-20],[-41,-8],[-34,-27],[-79,20],[-51,0],[-28,-7]],[[5226,7762],[-28,54],[-31,33],[-50,33],[-59,19],[-30,25],[-16,53]],[[5012,7979],[91,-13],[28,2],[51,18],[5,30],[-4,68],[-22,13],[8,22],[-58,225],[180,-22],[24,24],[36,0],[55,36],[20,22],[37,17],[40,-17],[55,40],[20,24],[10,56],[-18,18],[22,62],[20,28],[15,1],[70,66],[53,59],[71,21],[24,17],[67,33],[22,20],[77,10],[30,-1],[29,8],[38,0],[41,-22],[30,2],[10,-10],[35,0],[64,12]],[[2168,7223],[27,-49],[51,-11],[24,21],[26,2],[46,-33],[57,-25],[69,8],[-2,50]],[[2466,7186],[20,20],[49,3],[46,-26],[39,-47],[-6,-20],[-37,-2],[-6,-20],[26,-20],[43,-5],[51,4],[38,8],[24,-19],[26,7],[19,-18]],[[2798,7051],[-6,-28],[34,-45],[-32,-36],[-24,-3],[-7,22],[5,33],[-13,14],[-18,-22],[-6,-34],[14,-40],[34,-39],[-5,-49],[-13,-13],[-62,3],[-6,-21],[12,-19],[32,-5],[83,-36],[33,-52],[0,-27],[15,-60],[-12,-35],[-20,-1],[-32,38],[-18,-2],[-7,42],[23,48],[-6,14],[-45,-4],[-12,7],[-87,-5],[-26,5],[2,-35],[14,-60],[-26,0],[-11,-15],[7,-75],[14,-32],[-6,-20],[-45,38],[-44,-10],[-26,19],[-5,-27],[63,-30],[2,-21],[-12,-55],[0,-34],[20,-40],[20,-18],[13,-40],[2,-72],[14,-31],[-6,-20],[-43,-30],[-18,-27]],[[2555,6066],[-103,33],[-39,44],[-12,-14],[-44,-3],[-14,7],[-43,-49],[-26,19],[-69,3],[-6,7],[-45,-2],[-66,68],[-45,12],[-34,18],[-25,25],[-46,32],[0,13],[-33,33],[-14,0]],[[1891,6312],[19,27],[0,22],[12,13],[58,-10],[27,0],[26,-20],[18,9],[-8,61],[8,14],[-2,55],[-26,6],[-18,-21],[-27,-2],[-18,-55],[-20,13],[0,48],[-45,12],[-14,20],[-32,5],[-20,27],[0,20],[18,22],[79,3],[6,28],[-8,34],[50,50],[0,28]],[[1974,6721],[12,21],[45,-13],[12,42],[18,1],[-4,-28],[26,-26],[19,6],[24,57],[10,42],[0,26],[-14,27],[-26,33],[-33,14],[-32,33],[-30,102],[-33,68],[-20,20],[-2,27],[20,8],[24,28],[13,-13],[0,-28],[22,-26],[18,0],[31,36],[38,1],[-14,47],[-47,33],[6,22],[71,-32],[40,-26]],[[5704,570],[8,-29],[-21,4],[13,25]],[[5447,591],[6,-25],[-31,4],[25,21]],[[5845,831],[6,-25],[-16,3],[10,22]],[[5430,854],[13,-14],[-5,-29],[-10,-1],[-12,28],[14,16]],[[5143,1029],[34,-10],[13,-25],[-11,-16],[-24,-4],[-36,16],[-8,19],[32,20]],[[6146,1105],[12,-17],[-13,-30],[-25,2],[18,41],[8,4]],[[4963,1111],[30,-13],[-10,-14],[-23,5],[3,22]],[[6061,1204],[1,-29],[-12,18],[11,11]],[[6017,1213],[41,-4],[-33,-40],[-14,-3],[6,47]],[[4734,1218],[39,-14],[52,-6],[22,-19],[-64,-4],[-51,25],[2,18]],[[6021,1234],[8,-26],[-12,6],[4,20]],[[6396,1240],[21,-6],[-9,-21],[-37,-17],[-6,25],[31,19]],[[6035,1255],[4,-21],[-12,-8],[8,29]],[[6048,1274],[9,-33],[-12,-26],[-16,-9],[-2,18],[14,10],[-8,24],[15,16]],[[6284,1319],[31,-5],[28,-18],[-3,-27],[-34,-4],[-18,-10],[-12,-45],[-28,-24],[0,-11],[-47,-39],[-28,-30],[-15,2],[-16,28],[-18,2],[-46,-37],[-39,3],[-20,-20],[-54,-23],[-27,-22],[-18,4],[-28,-15],[-37,0],[-6,-19],[-22,-3],[-5,18],[1,64],[36,-12],[37,22],[44,17],[28,5],[65,48],[13,18],[23,-15],[12,13],[3,55],[-22,30],[10,16],[20,-4],[34,-30],[20,-2],[33,19],[14,16],[43,10],[15,14],[33,11]],[[6436,1388],[26,-20],[-14,-28],[-27,13],[15,35]],[[6234,1384],[-7,2],[-36,-22],[-14,-30],[-28,-1],[-47,-18],[-12,3],[-18,-19],[-11,7],[-42,2],[-42,-49],[12,-15],[-14,-13],[1,-41],[-52,-41],[-44,1],[-25,24],[-50,-8],[-10,-30],[-31,-7],[-8,-15],[-26,-8],[-14,-28],[-19,-4],[-34,-19],[-34,-31],[-25,-34],[-20,1],[-8,-16],[-32,14],[-65,-4],[-20,51],[-35,9],[-32,-10],[-27,16],[-24,53],[-32,30],[-49,-14],[-45,8],[-40,26],[-18,-3],[-22,-21],[-63,-10],[-24,9],[-27,-14],[-12,23],[-56,31],[-43,36],[-14,21],[0,53],[-12,26],[-44,9],[-77,35],[-57,32],[-22,2],[-61,30],[-26,23],[-37,18],[-24,35],[-48,26],[-13,15]],[[5750,2644],[41,-7],[58,-2],[65,-40],[28,-33],[6,-20],[35,-34],[34,-9],[31,20],[42,48],[36,32],[83,40],[17,-14],[10,-47],[-1,-114],[4,-95],[-7,-40],[-19,-40],[4,-46],[47,-63],[16,-12],[47,-55],[40,-29],[53,-14],[40,0],[42,19],[53,39],[25,40],[12,6],[12,32],[36,19],[36,-21],[29,-8],[12,-12],[-8,-48],[-2,-40],[12,-27],[10,-75],[17,-20],[46,-9],[28,-67],[51,-57],[10,-33],[-6,-20],[-36,-27],[11,-21],[17,0],[22,-27],[16,-74],[6,-8],[0,-87],[5,-20],[0,-93],[4,-60],[28,-47],[57,-9],[46,-41],[28,-1],[53,-63],[16,6],[30,33],[12,39],[57,-9],[102,-104],[12,-52],[-12,-7],[-17,28],[-24,6],[-4,-19],[16,-33],[0,-33],[-24,-31],[7,-46],[-11,-27],[0,-58],[-6,-19],[12,-20],[-12,-14],[6,-26],[-24,-38],[12,-7],[30,19],[34,-2],[57,-22],[18,20],[23,5],[23,-20],[45,-1],[6,-14],[-12,-33],[12,0],[0,-46],[6,-12],[29,5],[44,-9],[24,39],[23,-28],[16,13],[12,-8],[0,-31],[18,-9]],[[7688,645],[-12,-6],[-12,-38],[6,-13],[22,-2],[35,-47],[40,-40],[27,-20],[18,-28],[6,-52],[28,0],[6,-34],[29,-34],[10,-32],[12,5],[3,-30],[-19,-5]],[[7887,269],[-73,-35],[-39,5],[-22,14],[-32,48],[-73,49],[-43,-6],[-64,17],[-72,-7],[-4,9],[-48,-3],[-50,-16],[-51,-6],[-26,3],[-31,22],[-16,23],[-2,20],[-18,23],[-25,7],[-32,-11],[-49,-34],[13,45],[-32,34],[-41,-12],[-41,8],[-34,-2],[-39,10],[-46,19],[-20,15],[-11,81],[-21,47],[-21,10],[-8,58],[22,40],[-20,37],[-26,13],[-14,54],[-16,15],[-9,30],[1,51],[11,62],[-3,58],[-12,56],[-25,84],[-16,27],[-20,17],[-13,48],[16,-17],[11,17],[-8,28],[-23,-4],[0,20],[-15,-19],[-19,22],[6,30],[-20,3],[-22,34],[-32,13],[-17,-5],[-46,13],[-20,-7],[-21,9],[-46,0],[-26,12],[-53,-7],[-43,-28],[0,13],[-26,0],[-38,-39]],[[1732,6099],[14,-18],[10,-72],[-17,-35],[-30,-13],[-38,-48],[-59,6],[-22,-13],[-12,6],[-29,-20],[-28,-1],[-22,-28],[-22,-14],[-4,-38],[-27,-28],[27,-39],[28,-58],[12,-5],[20,-39],[37,-13],[32,-33],[65,-24],[12,0],[65,-66],[76,-72],[55,-33],[27,-47],[8,-38],[16,-33],[26,-40],[2,-20],[32,-87],[13,-12]],[[1999,5124],[-19,-46],[-8,-47],[-68,-102],[22,-58],[-4,-25],[-75,-55]],[[1847,4791],[-23,3],[-14,17],[0,23],[17,25],[-37,44],[2,16],[-30,15],[-10,20],[16,15],[-4,20],[-30,42],[-23,2],[-22,16],[-46,-25],[-21,-3],[-32,15],[-61,68],[-54,45],[-35,44],[-14,6],[-30,34],[-39,26],[-8,14],[-54,31],[-21,24],[-56,31],[-33,4],[-89,0],[-30,11],[0,27],[20,10],[14,25],[-56,18],[-4,25],[30,-10],[20,10],[30,37],[-12,10],[6,43],[-20,12],[-59,80],[-4,52],[-20,21],[-20,-10],[-43,2],[33,30],[6,23],[-24,25],[4,14],[-35,1],[-40,-23],[6,17],[-16,23]],[[882,5836],[0,57],[12,63],[32,73],[-8,20],[-26,25],[12,14],[24,-6],[63,1],[34,23],[49,-30],[28,-24],[65,10],[51,-30],[68,-63],[39,-17],[56,-16],[35,-4],[60,2],[11,14],[56,21],[29,0],[56,-23],[10,13],[-2,25],[10,27],[-3,25],[-31,33],[16,20],[43,0],[30,15],[31,-5]],[[7154,4469],[18,-1],[59,-29],[101,-65],[73,-30],[83,-50],[107,-51],[55,-22],[85,-50],[59,-23],[24,-27],[55,-88],[17,-47],[29,-34],[36,-88],[71,-95]],[[8026,3769],[-6,-6],[-22,-97],[0,-27],[-28,-131],[-4,-87],[-31,-142],[-28,-93],[0,-20],[16,-28],[36,-21],[17,-28],[-2,-48],[14,-87],[-2,-28],[10,-40],[-2,-48],[-7,-20],[-40,-67],[-34,-67],[16,-61],[6,-6],[-10,-48],[34,-62],[-8,-27],[-81,-78],[-32,-20],[-91,-44],[-43,-6],[-14,-40],[29,-22],[42,-15],[27,-55],[-15,-60],[-20,-26],[-49,-40],[-4,-68],[9,-53],[3,-62],[-7,-141],[-15,-60],[-14,-26],[-28,-128],[-2,-47],[-10,-66],[11,-48],[11,-21],[-4,-106],[4,-14],[59,-43],[16,-33],[-2,-88],[-23,-19],[-7,-20],[40,-41],[-5,-19],[-35,-25],[-6,-52],[34,-35],[12,-25],[-29,-39],[5,-20],[-17,-31],[-1,-73],[-11,-26]],[[5388,3216],[28,20],[59,0],[12,13],[-16,54],[0,148],[12,33],[6,40],[-6,34],[-40,26],[-11,109],[-18,46],[-48,69],[0,26],[24,89],[12,26],[43,48],[18,26],[36,6],[53,-6],[72,13],[12,7],[102,26],[42,-1],[83,-20],[55,0],[59,14],[56,26],[12,48],[1,81],[8,21],[2,130],[-6,34],[24,41],[38,20],[79,26],[75,40],[74,49],[76,81],[93,49],[18,26],[-5,15],[35,-1],[65,-19],[43,-28],[84,-32],[35,-21],[78,-31],[47,-29],[77,-37],[49,-29],[59,-30],[54,-16],[6,-7]],[[1891,6312],[-56,4],[-6,-14],[2,-48],[8,-45],[-12,-7],[-75,-3],[-25,-15],[1,-20],[22,-51],[-18,-14]],[[882,5836],[-45,52],[-8,35],[-16,13],[-47,92],[-42,5],[-16,20],[34,30],[0,36],[22,30],[31,23],[-8,24],[16,68],[-18,44],[-17,3],[-12,-15],[-14,32],[-12,56],[34,10],[10,30],[-8,32],[15,20],[32,-27],[48,3],[21,-10],[-6,59],[-13,40],[-20,20],[20,38],[-6,27],[33,10],[18,20],[-4,27],[10,9],[32,-8],[17,42],[-10,52],[22,5],[16,25],[28,-9],[24,-21],[7,30],[46,1],[14,17],[-18,13],[2,25],[24,19],[-4,13],[-44,13],[22,33]],[[1092,6942],[37,-33],[40,-25],[85,-103],[63,-113],[12,-14],[24,9],[6,-14],[-16,-35],[8,-33],[31,-5],[22,20],[26,-25],[16,8],[51,3],[-8,34],[12,15],[38,2],[12,13],[-14,35],[37,2],[12,13],[-8,20],[6,22],[20,1],[26,-20],[33,10],[6,20],[-8,35],[14,14],[83,-4],[14,29],[-22,33],[0,20],[20,2],[26,-34],[21,-12],[32,1],[26,-47],[41,-40],[18,-27],[26,-6],[14,8]],[[2652,3479],[20,-8],[6,-17],[-32,-8],[6,33]],[[2683,3502],[8,-24],[-14,-5],[6,29]],[[2571,3534],[38,-23],[-17,-15],[-21,16],[0,22]],[[2541,3576],[16,-27],[-20,10],[4,17]],[[2535,3599],[-2,-35],[-18,30],[20,5]],[[2549,3628],[22,-14],[21,10],[22,-31],[26,4],[-4,22],[43,-16],[0,-17],[20,-45],[-29,-37],[0,-28],[-14,5],[-34,41],[-12,-3],[-41,28],[6,35],[-32,19],[-12,26],[18,1]],[[2600,3633],[36,-11],[4,-24],[-26,-4],[0,14],[-22,18],[8,7]],[[2686,3657],[13,-15],[-20,-5],[7,20]],[[2668,3672],[15,-24],[-17,-2],[2,26]],[[2632,3694],[10,-32],[-18,9],[8,23]],[[3221,4368],[-43,-89],[-18,-15],[-46,-10],[-41,-28],[-28,-35],[2,-87],[20,-40],[8,-46],[-16,-69],[18,-18],[24,1],[23,22],[34,15],[14,-53],[31,-32],[78,-37],[17,-20],[8,-33],[-12,-41],[-29,-29],[8,-46],[29,-34],[2,-112],[8,-26]],[[3111,3494],[-24,8],[-28,-4],[-32,-17],[-37,-34],[-115,-86],[-19,-3],[-24,31],[-2,48],[-24,27],[-112,-17],[5,40],[-12,17],[14,37],[-20,43],[-3,33],[21,32],[-29,27],[-28,-8],[2,23],[-34,7],[0,-15],[18,-36],[-30,-3],[-21,-16],[-40,9],[-33,-44],[3,-20],[-17,6],[14,-28],[21,-22],[18,-46],[-4,-40],[-8,-14],[8,-25],[-26,-45],[-37,12],[-52,6],[-23,-29],[4,-44],[-14,9],[-22,-5],[-23,-19],[-34,47],[-30,26],[-2,42],[-30,45],[14,23],[-6,27],[-43,60],[-32,28],[-29,-8],[-12,55],[-18,24],[-36,10],[-18,16],[-3,137],[0,211],[-172,-1],[0,277],[85,258],[0,8],[-34,40],[2,20],[-34,34],[-2,23],[-27,45],[-14,13],[-4,24],[-20,18]],[[1999,5124],[36,40],[8,54],[22,61],[26,62],[-1,20],[16,35],[62,10],[19,-5],[75,5],[60,25],[57,-3],[26,-19],[33,-45],[38,9],[24,-12],[69,3],[47,-43],[18,-12],[48,-51],[31,-12],[91,18]],[[1092,6942],[-16,44],[-12,2],[-29,36],[-28,69],[12,15],[-18,36],[20,-3],[-8,43],[10,32],[19,12],[22,-10],[36,6],[20,19],[15,-7],[46,33],[12,20],[-2,20],[-28,9],[-38,-24],[-31,4],[-32,40],[-41,-19],[-22,7],[-16,-12],[-24,10],[-13,-18],[-38,6],[-22,-13],[-31,62],[-34,43],[-38,30],[-29,2]],[[754,7436],[31,18],[10,15],[-2,33],[28,2],[16,30],[-10,34],[24,1],[-4,35],[35,10],[69,-5],[34,20],[-10,65],[16,28],[42,22],[47,5],[63,-40],[38,17],[28,-5],[73,0],[59,3],[85,28],[22,-33],[27,-17],[14,-20],[32,2],[53,-23],[91,13],[-2,40],[18,15],[-14,19],[6,14],[32,16]],[[1705,7778],[20,-34],[71,12],[35,-25],[50,-3],[47,-12],[46,-4],[20,-13],[21,-61],[2,-42],[22,-47],[2,-35],[-12,-28],[2,-54],[-42,-43],[14,-35],[137,-85],[21,-20],[7,-26]],[[2555,6066],[-18,-27],[20,-31],[-30,-67],[-4,-53],[30,8],[8,-25],[37,2],[14,-12],[30,8],[32,-13],[25,28],[18,9],[16,80],[51,-4],[6,20],[30,14],[20,-11],[39,-71],[-18,-40],[0,-20],[20,-25],[57,-24],[14,-33],[18,7],[10,55],[18,13],[14,-5],[0,-33],[31,2],[8,-20],[-6,-34],[6,-12],[26,7],[12,-26]],[[3496,6902],[-30,-43],[1,-26],[-12,-55],[-2,-104],[-20,20],[-30,-21],[-24,-9],[-49,5],[-61,-45],[-48,-1],[-45,16],[-16,-67],[26,-46],[-44,-10],[-35,-17],[0,-26],[25,-25],[0,-22],[32,-10],[18,-20],[37,8],[14,-32],[18,-6],[-6,-34],[2,-48],[6,0],[81,-76],[44,28],[35,16],[20,-28],[38,-31],[17,8],[50,-45],[87,-10]],[[2798,7051],[38,8],[55,-10],[12,49],[24,15],[31,1],[44,15],[55,32],[50,3],[79,45],[51,-3]],[[3237,7206],[12,-13],[49,-4],[44,10],[49,-45],[6,-13],[18,15],[-32,46],[7,14],[49,2],[12,-12],[0,-34],[-10,-43],[12,-13],[6,22],[31,8],[-2,40],[18,-4],[14,-41],[25,-39],[2,-41],[-11,-42],[-40,-117]],[[5226,7762],[-67,-21],[-56,-42],[-21,-33],[-16,-42],[-16,-95],[-25,-15],[-46,-41],[-38,-75],[-49,-29],[-49,-15],[-26,0],[-24,14],[-43,-35],[-20,-7],[-54,-2],[-14,-6]],[[4662,7318],[-17,6],[-45,40],[-24,-20],[-56,-1],[-69,46],[-42,0],[-51,33],[-36,-8],[-29,-20],[-24,-28],[-22,-42],[-41,-50],[-67,0],[-44,19],[-32,53],[-19,63],[-26,25],[-43,27],[-48,5],[-18,13],[-110,-5],[-6,8],[-2,54],[-12,13],[-30,5],[-31,19],[-36,-2],[-44,18],[-25,39],[-54,4],[-55,17]],[[3504,7649],[-2,34],[-61,38],[-14,20],[-54,31],[-31,24],[-95,92]],[[3387,8102],[38,-25],[14,-18],[101,-60],[47,-35],[36,-18],[69,-23],[65,-14],[75,-10],[20,-15],[53,-20],[36,-20],[48,-10],[41,-2],[51,-10],[78,10],[201,64],[63,12],[168,38],[109,42],[93,21],[148,24],[185,19],[45,14],[4,-15],[-121,-18],[-22,-10],[-67,-4],[-8,-6],[55,-34]],[[7106,8724],[-20,-25],[-49,-15],[-24,-13],[0,-27],[12,-21],[-24,-27],[0,-20],[26,-13],[63,6],[119,-23],[22,13],[32,0],[-4,-20],[25,-15],[-16,-33],[52,-28],[28,-35],[9,-42],[-35,-33],[-2,-54],[-30,-20],[-12,-33],[1,-48],[-12,-27],[-34,-19],[18,-35],[33,-1],[2,-54],[13,0],[15,27],[12,-15],[49,-28],[-23,-20],[-28,-5],[2,-27],[-10,-20],[39,-2],[5,-13],[-28,-55],[20,0],[-30,-32],[-34,-13],[-39,2],[-123,23],[-5,15],[-125,59],[-52,44],[-33,7],[-172,110],[-202,-175],[-8,-20],[24,-15],[-2,-40]],[[6551,7869],[-42,-18],[-33,1],[-51,22],[-54,2],[-42,48],[-55,49],[-36,41],[-4,22],[30,66],[-16,22],[-6,40],[10,22],[57,12],[-5,21],[-18,7],[-35,-13],[-46,15],[-28,68],[-45,50],[0,7]],[[6288,8848],[24,-15],[65,6],[10,30],[-12,19],[2,26],[45,44],[20,6],[59,-1],[13,-19],[37,20],[29,0],[15,12],[21,-25],[30,-17],[67,-8],[8,-14],[44,1],[39,53],[22,8],[24,-8],[5,-25],[18,-15],[0,-32],[24,-18],[21,-32],[-11,-70],[79,-40],[45,5],[20,-6],[46,-1],[9,-8]],[[3504,7649],[-109,15],[-18,5],[-67,-10],[-12,-35],[32,-18],[20,-33],[61,-10],[6,-34],[-34,-56],[-17,-57],[0,-20],[-36,-15],[-41,-29],[-20,-1],[-48,-32],[-17,-40],[7,-27],[26,-46]],[[2466,7186],[-32,47],[-7,26],[-58,40],[-14,20],[-2,27],[26,-12],[20,14],[25,-12],[12,7],[6,28],[18,7],[71,3],[50,-12],[6,27],[29,43],[38,9],[51,30],[24,-6],[26,14],[25,2],[6,21],[-14,47],[4,35],[-25,20],[-14,41],[6,27],[-26,14],[-12,-7],[-2,27],[-31,-9],[-20,28],[-20,7],[-8,34],[6,28],[-59,47],[-2,35],[53,86],[75,15]],[[4066,6669],[13,-55],[-17,-48],[-4,-54],[-24,-49],[-18,-21]],[[3496,6902],[73,4],[30,-7],[43,3],[93,-38],[42,-5],[46,-46],[98,-65],[26,-20],[55,-26],[26,-6],[38,-27]],[[8539,6131],[-57,-15],[-122,-5],[-52,11],[-85,-9],[-85,3],[-33,17],[-36,56],[-47,87],[-115,-72],[-24,9],[-41,-19],[-25,8],[-46,-6],[-35,-47],[-31,22],[-83,18],[-47,-6],[-10,-34],[6,-21],[22,-36],[-10,-43],[-22,-40],[22,-43],[-8,-20],[-28,-34],[18,-36],[-15,-27],[43,-36],[-2,-27],[17,-30],[56,-15],[12,-22],[-20,-13],[-2,-27],[-34,-60],[-33,-33],[-57,-33],[-44,-11],[-52,-33],[-39,-40],[-11,-20],[-15,-95],[0,-26],[-23,-67],[-30,-37]],[[7316,5224],[-30,27],[-6,55],[-25,20],[-60,18],[-55,42],[-23,8],[-19,22],[-19,87],[-12,110],[2,89],[-6,49],[-34,55],[-12,50],[-19,-7],[-38,-40],[-30,-20],[-43,-11],[-36,1],[-49,15],[-48,44],[-12,76],[-15,77],[-16,111],[2,27],[12,42],[10,62],[35,103],[8,42],[28,54],[33,40],[40,27],[53,25],[69,52],[93,100],[-19,76],[-67,56],[-26,15],[-79,63],[-37,8],[-46,0],[-40,-11],[-158,-79],[-47,-32],[-66,-33],[-154,-43],[-44,-7]],[[6311,6689],[33,54],[27,26],[39,55],[76,65],[108,40],[54,32],[17,41],[12,47],[30,47],[43,53],[23,33],[3,34],[-41,55],[-30,21],[-87,70],[-22,34],[-12,88],[-12,35],[3,20],[-14,67],[6,73],[40,80],[15,14],[4,53],[-23,35],[-32,15],[-20,-7]],[[7106,8724],[26,-8],[22,-20],[29,2],[34,-14],[45,-31],[17,1],[31,-13],[10,5],[29,-17],[12,-30],[-4,-20],[34,-21],[24,1],[29,-30],[44,10],[42,45],[35,-30],[59,-15],[4,14],[28,-4],[8,33],[39,-28],[28,-3],[51,-22],[58,-45],[31,-30],[31,-5],[31,15],[23,-26],[12,-36],[-15,-14],[14,-69],[45,-57],[-8,-11],[41,-27],[0,-28],[52,-10],[4,12],[27,-2],[14,-14],[18,7],[35,-17],[18,-23],[33,-18],[31,8],[27,-18],[65,-117],[48,-61],[37,-70],[16,-17],[137,3],[262,24],[26,-64],[-9,-47],[3,-21],[-8,-59],[22,-83],[12,-60],[-1,-35],[-36,-88],[-18,-15],[30,-12],[28,-23],[13,-55],[-9,-88],[-11,-31],[32,-36],[-8,-27],[8,-18],[-32,-68],[3,-14],[-20,-15],[-7,-30],[8,-42],[-35,-10],[-14,-13],[10,-40],[-15,-20],[19,-63],[-10,-12],[-9,-85],[-17,-16],[5,-41],[-3,-38],[-38,-62],[1,-49],[-40,-9],[-8,-35],[-24,-15],[-59,-15],[-3,-8],[62,-57],[10,-33],[36,-49],[-121,7],[-53,-61],[-42,-66],[-8,-31]],[[6311,6689],[-45,-93],[-42,-74],[-7,-20],[-78,-128],[-23,-46],[-30,-14],[-113,4],[-19,6],[-58,-5],[-18,-13]],[[4066,6669],[5,14],[-2,55],[46,61],[12,22],[-14,41],[-26,20],[-12,27],[-39,47],[-8,55],[10,41],[12,14],[-2,68],[12,15],[13,-21],[42,1],[18,-27],[49,-19],[58,-54],[49,-13],[41,8],[76,-33],[61,-13],[73,21],[48,30],[33,42],[73,63],[4,55],[-34,102],[-2,27]],[[8026,3769],[123,45],[130,33],[112,41],[25,5],[25,19],[60,-58],[29,0],[31,-16],[5,-14],[41,-28],[28,-29],[45,-104],[32,-44],[106,8],[8,20],[-4,34],[-18,62],[-2,48],[-9,41],[7,101],[-4,26],[4,62],[14,46],[14,67],[42,99],[11,13],[0,40],[-20,58]],[[8861,4344],[301,-52],[38,-50],[-2,-64],[16,-31],[16,-54],[-2,-77],[-24,-19],[0,-25],[12,-46],[-310,-420],[-179,-249],[17,-11],[118,-180],[33,-47],[95,-105],[-8,-45],[13,-41],[24,-19],[-7,-40],[28,-15],[18,-39],[0,-32],[31,-45],[4,-19],[57,-97],[50,-63],[14,-26],[79,-63],[18,-5],[27,-22],[37,-15],[19,2],[46,-16],[29,-1],[40,-18],[36,-22],[31,-50],[19,-14],[28,-39],[93,18],[10,-3],[2,-46],[-14,-120],[10,-36],[16,-118],[17,-179],[2,-52],[-25,-85],[10,-14],[-1,-22],[-23,-24],[8,-20],[43,-4],[16,-11],[34,-4],[44,26],[65,7],[60,-44],[9,-26],[-32,-39],[0,-105],[10,-43],[-43,-15],[5,-51],[-17,-81],[-61,-6],[-26,8],[-43,-3],[-73,5],[-41,-28],[-20,3],[-27,-22],[-67,-11],[-20,1],[-23,-22],[-48,-9],[3,-32],[-15,-20],[-13,-2],[19,-40],[-6,-18],[-42,6],[-29,15],[-8,-6],[0,-35],[-35,-9],[-53,-33],[-47,-15],[-12,-12],[-7,-40],[-34,-250],[-40,-1],[0,-55],[8,-32],[-12,-12],[-7,-96],[1,-62],[-7,-85],[-24,-68],[-10,-9],[-38,1],[-14,-11],[-3,-40],[-37,-18],[3,-16],[-125,44],[-2,26],[-85,34],[-81,17],[-59,23],[-68,9],[9,8],[-17,34],[5,36],[-20,23],[-37,5],[-41,-34],[-4,-36],[25,-5],[7,-30],[-27,20],[-51,10],[-12,15],[8,12],[-15,13],[-47,-18],[3,-27],[-40,14],[-4,16],[-20,10],[-39,-3],[-54,-17],[-25,14],[3,11],[-25,10],[-105,-10],[-35,19],[-26,33],[-26,4],[-65,-12],[-25,-12],[-7,13]],[[8539,6131],[15,-72],[16,-126],[-20,-34],[4,-63],[71,-80],[45,-2],[75,7],[24,-18],[-9,-11],[-23,4],[-16,-13],[7,-44],[-21,-15],[-100,-115],[-26,-67],[5,-64],[16,-30],[42,-192],[56,-157],[23,-143],[10,-45],[-17,-90],[-12,-27],[-17,-90],[-7,-103],[8,-82],[20,-80],[8,-12],[145,-23]],[[7154,4469],[18,32],[6,45],[23,45],[48,62],[6,59],[12,12],[71,102],[0,45],[11,27],[19,11],[-19,62],[-31,48],[0,39],[-36,41],[24,20],[0,20],[18,5],[-8,34],[0,46]],[[1632,7946],[31,-43],[10,-47],[32,-78]],[[754,7436],[-30,-5],[-18,-17],[-27,7],[-8,17],[24,48],[-24,45],[2,35],[-12,32],[-22,6],[18,15],[-16,22],[0,55],[-16,27],[-18,1],[-29,-16],[-36,20],[-18,46],[-21,17],[19,32],[-4,21],[14,14],[2,31],[-16,39],[-47,31],[-47,3],[-8,17],[14,35],[25,35],[-16,35],[14,38],[-27,22],[-16,-5],[-20,23],[-12,32],[16,20],[-16,50],[28,30],[-4,27],[-34,28],[-8,17],[-27,8],[-14,29],[-32,11],[12,32],[-4,42],[12,34],[-30,30],[26,37],[-12,37],[-39,13],[-30,-7],[-6,24],[-28,16],[4,21],[-41,13],[-32,-5],[-20,13],[14,35],[-4,15],[28,48],[4,24],[22,42],[21,8],[8,48],[-6,28],[10,19],[42,27],[-2,24],[-30,22],[-24,-15],[-43,14],[0,39],[12,41],[-6,38],[2,48],[-22,10],[6,19],[-12,30],[20,80],[-28,13],[-20,28],[-15,43],[-4,37],[17,12],[-9,27],[-24,13],[16,18],[21,-11],[-4,26],[-23,24],[-26,11],[-14,47],[6,22],[-26,38],[-6,23],[14,17],[36,-3],[41,6],[40,-26],[49,23],[24,20],[-4,26],[10,16],[-8,44],[28,47],[2,44],[57,53],[14,2],[10,-26],[37,-21],[68,-70],[25,-3],[10,-49],[16,-23],[-2,-22],[12,-23],[34,-23],[25,-26],[40,-80],[2,-20],[67,-16],[34,-18],[25,-65],[22,-10],[-10,-27],[30,-22]]],"transform":{"scale":[0.0019272122212221222,0.0014719945994599473],"translate":[44.04726400000004,25.058749000000034]}}'')
											,(''تهران'',''{"type":"Topology","objects":{"map":{"type":"GeometryCollection","bbox":[50.22243400000008,34.87557900000013,53.10369899999995,36.34840000000008],"geometries":[{"type":"Polygon","properties":{"Name":"دماوند","Code":"IR.TH.DA"},"arcs":[[0,1,2,3,4,5]]},{"type":"Polygon","properties":{"Name":"اسلام شهر","Code":"IR.TH.ES"},"arcs":[[6,7,8,9]]},{"type":"Polygon","properties":{"Name":"فیروز کوه","Code":"IR.TH.FI"},"arcs":[[-1,10]]},{"type":"Polygon","properties":{"Name":"کرج","Code":"IR.TH.KA"},"arcs":[[11,12,13,14,15,16,17]]},{"type":"Polygon","properties":{"Name":"نظر آباد","Code":"IR.TH.NA"},"arcs":[[18,19,-16]]},{"type":"Polygon","properties":{"Name":"پاک دشت","Code":"IR.TH.PA"},"arcs":[[-3,20,21,22,23]]},{"type":"Polygon","properties":{"Name":"ری","Code":"IR.TH.RE"},"arcs":[[-23,24,25,26,-10,27]]},{"type":"Polygon","properties":{"Name":"رباط کریم","Code":"IR.TH.RO"},"arcs":[[-27,28,29,-7]]},{"type":"Polygon","properties":{"Name":"ساوجبلاغ","Code":"IR.TH.SA"},"arcs":[[-17,-20,30]]},{"type":"Polygon","properties":{"Name":"شهریار","Code":"IR.TH.SR"},"arcs":[[31,-8,-30,32,-14]]},{"type":"Polygon","properties":{"Name":"شمیرانات","Code":"IR.TH.ST"},"arcs":[[-5,33,-12,34]]},{"type":"Polygon","properties":{"Name":"تهران","Code":"IR.TH.TE"},"arcs":[[-34,-4,-24,-28,-9,-32,-13]]},{"type":"Polygon","properties":{"Name":"ورامین","Code":"IR.TH.VA"},"arcs":[[35,-25,-22]]}]}},"arcs":[[[6988,6611],[146,-308],[308,-445],[217,-46],[228,-159],[308,-32],[49,-269],[-66,-222],[-380,-507],[-89,-349],[-12,-855]],[[7697,3419],[-158,126],[-282,-77],[-328,127],[-381,538],[-247,128],[-211,336],[-201,-75],[-169,268],[-77,-140],[8,-305]],[[5651,4345],[-287,344],[-84,13]],[[5280,4702],[138,424],[156,318],[7,329],[-200,357]],[[5381,6130],[193,492],[162,265]],[[5736,6887],[230,-647],[288,-197],[445,14],[289,554]],[[3253,4273],[-110,217],[0,495],[-42,18]],[[3101,5003],[0,229],[257,403]],[[3358,5635],[320,-332],[259,-89]],[[3937,5214],[-66,-289],[-151,-117],[-77,-365],[-224,-48],[-166,-122]],[[6988,6611],[135,351],[277,420],[324,146],[332,-333],[287,7],[462,-468],[371,11],[244,212],[214,-406],[125,-64],[6,-275],[227,-1021],[-29,-549],[-478,-630],[-233,-419],[-199,-210],[-603,-293],[-412,126],[-341,203]],[[4197,8067],[-73,-316],[-162,-106],[-18,-281],[101,-318]],[[4045,7046],[-277,11],[-132,201],[-228,46],[-403,-589],[-96,-189],[117,-523]],[[3026,6003],[-184,-88],[-180,188],[-506,-142],[-295,0],[-403,-199],[-513,11],[-282,-188],[-301,0],[0,-341]],[[362,5244],[-59,-5],[-214,453],[-89,400],[117,417],[326,301],[119,11]],[[562,6821],[161,-330],[126,-106],[404,124]],[[1253,6509],[175,53],[348,-283],[392,84],[42,259],[-19,530],[134,176],[343,118],[199,293],[-13,484],[-48,305],[410,-11],[60,502]],[[3276,9019],[162,11],[206,-187],[204,-53],[83,-129],[13,-543],[253,-51]],[[562,6821],[286,297],[241,158],[-3,202],[110,544]],[[1196,8022],[220,-377],[-122,-577],[-41,-559]],[[5651,4345],[-29,-381],[-109,-552],[34,-353]],[[5547,3059],[-307,169],[-150,314],[-235,-21],[-308,513]],[[4547,4034],[-1,573],[77,24],[157,-259],[144,486]],[[4924,4858],[128,9],[228,-165]],[[4547,4034],[-163,-10],[-106,-146],[-129,-608],[0,-335],[172,-418],[21,-460],[171,-544],[-252,-234]],[[4261,1279],[-421,623],[-287,53],[-621,372],[-284,-19],[-206,54],[-450,-32],[110,756],[131,587]],[[2233,3673],[327,-67],[263,-164],[236,-13],[126,212],[132,449],[-64,183]],[[3937,5214],[337,-218],[343,82],[193,-12],[114,-208]],[[2233,3673],[59,244],[-8,409],[-93,276]],[[2191,4602],[145,312],[230,71],[295,-212],[131,35],[109,195]],[[1196,8022],[233,572],[-48,336],[-409,101],[-171,395],[-166,123],[72,346],[243,88],[937,-197],[201,18],[288,-180],[363,-39],[171,-393],[124,-124],[242,-49]],[[3026,6003],[75,-183],[257,-185]],[[2191,4602],[-121,251],[-44,267],[-124,59],[8,-407],[-204,-84],[-37,-208],[-83,130],[73,413],[-5,339],[-84,128],[-326,-29],[-40,-72],[213,-522],[-121,-147],[-169,392],[-209,184],[-286,-95],[-270,43]],[[5381,6130],[-210,79],[-211,-11],[-132,-118],[-199,118],[-781,-12],[-151,118],[60,258],[276,378],[12,106]],[[4197,8067],[514,29],[124,-130],[323,-51],[288,-260],[169,-266],[121,-502]],[[5547,3059],[21,-192],[255,-471],[89,-272],[168,-200],[89,-270],[-74,-344],[-273,-489],[-37,-138],[13,-546],[-38,-137],[-252,264],[-165,62],[-372,260],[-169,198],[-541,495]]],"transform":{"scale":[0.0002881553155315403,0.00014729682968296366],"translate":[50.22243400000008,34.87557900000013]}}'')
											,(''اصفهان'',''{"type":"Topology","objects":{"map":{"type":"GeometryCollection","bbox":[49.450345000000084,30.772253000000035,55.401070000000004,34.542033999999944],"geometries":[{"type":"Polygon","properties":{"Name":"اردستان","Code":"IR.ES.AR"},"arcs":[[0,1,2,3,4,5]]},{"type":"Polygon","properties":{"Name":"برخوار و میمه","Code":"IR.ES.BM"},"arcs":[[6,7,-3,8,9,10,11,12]]},{"type":"Polygon","properties":{"Name":"چادگان","Code":"IR.ES.CH"},"arcs":[[13,14,15,16,17,18]]},{"type":"Polygon","properties":{"Name":"فلاورجان","Code":"IR.ES.FL"},"arcs":[[19,20,-10,21,22]]},{"type":"Polygon","properties":{"Name":"فریدون شهر","Code":"IR.ES.FE"},"arcs":[[23,-16]]},{"type":"Polygon","properties":{"Name":"گلپایگان","Code":"IR.ES.GO"},"arcs":[[24,25,-18,26,-12]]},{"type":"Polygon","properties":{"Name":"کاشان","Code":"IR.ES.KA"},"arcs":[[-5,27,-7,28]]},{"type":"Polygon","properties":{"Name":"خوانسار","Code":"IR.ES.KN"},"arcs":[[29,-19,-26]]},{"type":"Polygon","properties":{"Name":"خمینی شهر","Code":"IR.ES.KR"},"arcs":[[-21,30,31,-14,-30,-25,-11]]},{"type":"Polygon","properties":{"Name":"لنجان","Code":"IR.ES.LA"},"arcs":[[-20,32,33,34,-31]]},{"type":"Polygon","properties":{"Name":"سمیرم - دهاقان","Code":"IR.ES.SH"},"arcs":[[35,36,37,-34,38,39]]},{"type":"Polygon","properties":{"Name":"مبارکه","Code":"IR.ES.MO"},"arcs":[[40,-39,-33,-23]]},{"type":"Polygon","properties":{"Name":"نطنز","Code":"IR.ES.NT"},"arcs":[[-8,-28,-4]]},{"type":"Polygon","properties":{"Name":"نایین","Code":"IR.ES.NY"},"arcs":[[41,-1,42]]},{"type":"Polygon","properties":{"Name":"سمیرم","Code":"IR.ES.SE"},"arcs":[[43,-37]]},{"type":"Polygon","properties":{"Name":"اصفهان","Code":"IR.ES.TK"},"arcs":[[-42,44,-40,-41,-22,-9,-2]]}]}},"arcs":[[[5696,9434],[55,-318],[20,-181],[81,-259],[1,-130],[40,-286],[3,-630],[-59,-263],[-19,-289],[20,-183],[-18,-368],[-39,-369],[-99,-159],[-275,-138],[-78,-54],[20,-53],[-59,-159],[-20,53],[-39,-133]],[[5231,5515],[-157,50],[-78,77],[-99,-27],[-137,50],[-2,290],[-216,21],[-97,-54],[-18,-79],[-119,103],[-176,-109]],[[4132,5837],[-78,76],[-44,525],[-79,233]],[[3931,6671],[77,133],[195,82],[58,186],[138,29],[54,496],[38,53],[95,316],[78,211],[-21,104],[-59,50]],[[4584,8331],[58,157],[79,3],[117,236],[74,606],[-1,213],[-21,106],[19,107]],[[4909,9759],[78,2],[262,-98],[161,-103],[260,-100],[26,-26]],[[2455,8057],[64,-204],[21,-129],[102,-204],[141,-100],[137,6],[19,79],[97,29],[178,-47]],[[3214,7487],[20,-26],[3,-182],[-38,-183],[3,-130],[40,-103],[98,-50],[61,-77],[97,-24],[137,4],[60,-51],[79,29],[157,-23]],[[4132,5837],[-18,-54],[26,-339],[21,-79],[-56,-106],[-159,180],[-155,-54],[-93,-159],[-115,-82]],[[3583,5144],[-40,52],[-157,48],[-137,76]],[[3249,5320],[-24,130],[-143,231],[-101,206],[-42,130],[-100,102],[-177,21],[-58,50],[-81,127],[-41,156],[-80,127],[-200,175]],[[2202,6775],[-20,-1],[-82,206],[-60,48],[-98,23],[-81,125],[56,82],[37,156],[-81,100],[39,80],[-25,180]],[[1887,7774],[100,29],[136,85],[174,214],[140,-71],[18,26]],[[1774,6418],[-19,-80],[5,-209],[-36,-106],[85,-204],[101,-74],[82,-127],[240,-200],[41,-77],[100,-74],[242,-253],[5,-130],[-95,-133],[-56,-29]],[[2469,4722],[-97,-3],[12,209],[-82,101],[-39,0],[-73,-109],[-76,-54],[-40,24],[-234,-9],[-57,-29]],[[1783,4852],[-64,127],[-100,47],[-82,127],[-9,235],[-82,100],[-22,103],[-302,166],[-4,104],[-42,76],[-2,105],[-104,98],[-262,115],[-19,26]],[[689,6281],[16,104],[93,241],[-1,51],[97,162],[18,132]],[[912,6971],[78,83]],[[990,7054],[345,-451],[4,-182],[121,-71],[117,58],[100,-47],[97,57]],[[3295,4353],[-40,26],[18,78],[-43,103],[-2,106]],[[3228,4666],[37,53],[33,236],[37,53],[-64,156],[-22,156]],[[3583,5144],[-55,-131],[4,-158],[41,-51],[5,-156],[101,-130]],[[3679,4518],[-192,-82],[-56,-53],[-136,-30]],[[1783,4852],[-131,-162],[-78,-30],[-39,50],[-215,-36],[-165,225],[-99,-6],[-36,-53],[-116,-33],[-42,50],[-97,-32],[-170,-166],[-116,-59],[-4,77],[106,266],[-144,147],[-178,-11],[-137,-35],[-116,332],[-6,130],[134,112],[120,35],[76,83],[-4,104],[-45,102],[-4,104],[117,85],[18,80],[100,-20],[57,55],[120,35]],[[2202,6775],[-175,-137]],[[2027,6638],[-100,74],[-121,151],[-78,21],[-198,-9],[-180,43],[-22,154],[-40,24],[21,-103],[-19,-78],[-101,72],[-180,94],[-19,-27]],[[912,6971],[-83,72],[-1,53],[194,297],[295,222],[98,32],[138,6],[137,85],[159,7],[38,29]],[[4584,8331],[-177,-136],[-197,-56],[-80,24],[-177,-32],[-37,-157],[-59,-79],[-177,21],[-116,-212],[-77,-27],[-120,49],[-17,-79],[-136,-160]],[[2455,8057],[39,106],[-24,153],[39,106],[117,107],[56,159],[-2,129],[-121,98],[53,316],[17,320],[77,137],[275,117],[357,15],[99,-23],[198,6],[100,29],[137,85],[57,81],[61,-78],[100,-50],[81,-77],[201,-76],[218,61],[278,7],[41,-26]],[[2027,6638],[-175,-191],[-78,-29]],[[3228,4666],[-136,23],[-59,-29],[-233,21],[-77,-30],[-214,47],[-39,-27]],[[2470,4671],[-1,51]],[[3295,4353],[6,-209],[85,-180]],[[3386,3964],[-310,-6],[-76,-29],[-79,24],[-150,-107]],[[2771,3846],[-43,77],[-119,127],[-120,73],[-24,130],[75,106],[-5,130],[-82,129],[17,53]],[[4509,2493],[-56,-78],[-116,-1],[-36,-105],[-75,-81],[-96,0],[-35,-106],[-152,-131],[-96,-2],[-136,77],[-37,-27]],[[3674,2039],[-59,52],[15,156],[-41,78],[-2,105],[-61,155],[-140,181],[-118,77],[-136,22],[-80,78]],[[3052,2943],[57,27],[35,104],[-6,182],[-26,207],[-81,130],[-120,74],[-140,179]],[[3386,3964],[76,27],[16,79],[76,53],[73,160],[153,80]],[[3780,4363],[100,-102],[103,-208],[141,-207],[-9,-339],[5,-182],[44,-155],[61,-131],[138,-128],[143,-338],[3,-80]],[[3679,4518],[101,-155]],[[5849,4683],[-120,209],[-100,130],[-20,77],[-81,79],[-77,-2],[-140,209],[-21,79],[-59,51]],[[5696,9434],[114,-24],[437,10],[121,-24],[497,11],[118,29],[557,9],[40,27],[218,30],[557,6],[60,29],[958,8],[218,54],[181,0],[81,-26],[102,-106],[0,-340],[20,-79],[0,-393],[21,-159],[3,-705],[-20,-156],[-79,-259],[-181,-336],[-79,26],[-220,-32],[-99,-135],[-64,-426],[-143,-507],[-61,-106],[-101,-109],[-121,-80],[-100,-27],[-239,-109],[-360,-111],[-219,-82],[-120,-107],[-360,-192],[-137,-106],[-138,-56],[-157,0],[-139,77],[-157,24],[-235,76],[-117,-27],[-136,-80],[-116,-108],[-96,-133],[-156,-27]],[[3674,2039],[2,-78],[80,-156],[80,-77],[115,0],[77,-50],[60,-105],[2,-78],[-55,-158],[-32,-235],[1,-132],[-73,-104],[-37,-105],[-69,-315],[2,-130],[41,-183],[-16,-106],[-172,-27],[-38,77],[-98,78],[-76,25],[-234,311],[-122,286],[-5,236],[55,130],[-4,158],[-49,339],[-122,284],[-22,105],[-14,442],[55,80],[97,1],[16,79],[-140,206],[73,106]],[[5849,4683],[-57,-28],[-37,-78],[6,-289],[22,-132],[5,-209],[27,-260],[-17,-159],[-106,-446],[4,-236],[-36,-133],[5,-209],[61,-185],[20,-131],[-191,-79],[-76,-53],[-268,-82],[-37,-26],[-213,25],[-173,78],[-116,-1],[-100,129],[15,211],[-41,130],[-37,-27]]],"transform":{"scale":[0.0005951320132013122,0.000377015801580149],"translate":[49.450345000000084,30.772253000000035]}}'')
											,(''مرکزی'',''{"type":"Topology","objects":{"map":{"type":"GeometryCollection","bbox":[48.940985769177814,33.397788801282466,51.08219099970668,35.57459027246628],"geometries":[{"type":"Polygon","properties":{"Name":"آشتیان","Code":"N170*"},"arcs":[[0,1,2,3,4]]},{"type":"Polygon","properties":{"Name":"اراک","Code":"N336*"},"arcs":[[5,6,-3,7,8,9,10,11,12,13]]},{"type":"Polygon","properties":{"Name":"تفرش","Code":"N213*"},"arcs":[[14,-5,15,16,17,18,19]]},{"type":"Polygon","properties":{"Name":"خمین","Code":"N221*"},"arcs":[[20]]},{"type":"Polygon","properties":{"Name":"خنداب","Code":"N181*"},"arcs":[[21,-12,22,23]]},{"type":"Polygon","properties":{"Name":"دلیجان","Code":"N263*"},"arcs":[[24,-8,-2,25]]},{"type":"Polygon","properties":{"Name":"زرندیه","Code":"N354*"},"arcs":[[26,27,28]]},{"type":"Polygon","properties":{"Name":"شازند","Code":"N248*"},"arcs":[[-11,29,-23]]},{"type":"Polygon","properties":{"Name":"فراهان","Code":"N192*"},"arcs":[[-4,-7,30,-14,31,32,-16]]},{"type":"Polygon","properties":{"Name":"کمیجان","Code":"N163*"},"arcs":[[33,-32,-13,-22,34,35,-18]]},{"type":"Polygon","properties":{"Name":"محلات","Code":"N193*"},"arcs":[[36,-9,-25]]},{"type":"Polygon","properties":{"Name":"ساوه","Code":"N232*"},"arcs":[[37,-20,38,-27]]},{"type":"Polygon","properties":{"Name":"غرق آباد","Code":"N240*"},"arcs":[[-39,-19,-36,39,-28]]}]}},"arcs":[[[5283,5385],[71,-132],[171,-19],[237,-160],[-19,-131],[157,-30],[477,145],[192,-256],[221,-67],[-144,-338],[16,-230]],[[6662,4167],[-432,-25],[-125,-55],[22,-132]],[[6127,3955],[-629,327],[-234,-52],[-376,30],[-282,164],[-628,151]],[[3978,4575],[-229,184],[44,197],[217,285]],[[4010,5241],[588,212],[67,82],[425,47],[193,-197]],[[3439,4277],[275,18]],[[3714,4295],[231,23],[125,118],[-92,139]],[[6127,3955],[132,-455]],[[6259,3500],[-146,-568],[-112,-206],[-408,-73],[-310,-228]],[[5283,2425],[-152,-196],[-356,-191],[-420,-101],[-173,-154],[-762,-27]],[[3420,1756],[-106,274],[49,65],[-236,225],[-148,225],[-304,201],[-30,203],[-166,227],[-145,71],[164,264],[-213,104],[-100,-35]],[[2185,3580],[217,175],[346,126],[-87,192],[-525,291],[-606,220],[120,606]],[[1650,5190],[192,-63],[401,-17],[274,154]],[[2517,5264],[3,-167],[283,-83],[212,-176],[-68,-247],[179,-114],[98,85],[183,-61],[32,-224]],[[5735,6647],[-158,-503],[106,-142],[-13,-204],[-387,-413]],[[4010,5241],[-21,196],[374,375],[-53,179],[-246,255],[-440,98],[-394,-60],[-74,533],[-440,126]],[[2716,6943],[16,32]],[[2732,6975],[111,130]],[[2843,7105],[101,150],[74,346],[636,13],[522,-259],[397,-234]],[[4573,7121],[531,-148],[193,-184],[438,-142]],[[6066,1931],[131,-359],[811,-297],[90,-82],[-373,-118],[-397,-61],[-319,-145],[-179,-178],[-297,-173],[-628,-38],[-131,-41],[14,-269],[-144,-170],[-460,142],[-236,118],[-49,324],[-240,269],[-272,13],[-391,239],[230,461],[186,189],[764,28],[172,154],[421,101],[356,189],[150,197],[699,-383],[92,-110]],[[793,5499],[177,-307],[478,66],[202,-68]],[[2185,3580],[-24,-108],[-335,-123],[-158,176],[-538,142],[-302,-19]],[[828,3648],[-30,255],[-316,159],[-201,253],[-65,233],[-166,112],[188,104],[68,229],[106,73],[-30,220],[65,211],[283,-77],[63,79]],[[8213,1412],[43,148],[-165,283],[-8,357],[-139,299],[-223,183],[-129,299],[-37,414],[-128,130],[-482,82],[-353,-93],[-333,-14]],[[6662,4167],[425,-74],[0,-234],[76,-170],[356,0],[498,253],[179,-55],[392,-319],[367,-32],[245,-206],[440,-93],[359,-399],[-228,-87],[6,-365],[84,-365],[-207,-250],[-263,-2],[-98,-247],[-561,-14],[-204,-180],[-315,84]],[[8473,7801],[-222,77],[-232,159],[-557,-13],[-403,90],[-309,134],[-264,-79],[-188,132],[-212,-17],[-63,124],[-305,49],[-351,-195],[-187,88]],[[5180,8350],[-13,68],[-561,239],[-670,151],[-287,156],[-423,113],[-290,-58],[-340,46],[-155,105]],[[2441,9170],[114,195],[277,-35],[256,85],[356,24],[-75,220],[2,263],[141,60],[389,-257],[458,141],[592,-213],[447,124],[331,5],[723,72],[161,95],[307,-25],[439,33],[413,-22],[234,-183],[473,-154],[371,-43],[252,49],[376,-197],[5,-215],[-335,-264],[-60,-202],[-190,-302],[76,-249],[-74,-168],[-374,47],[-53,-253]],[[3420,1756],[-188,-190],[-269,-83],[-212,-150],[-443,27],[-125,142],[-136,-2],[-83,-255],[-369,-299],[-384,33],[-127,376],[-365,84],[-114,-90],[-329,63],[-126,407],[82,383],[-146,99],[-86,179],[126,140],[245,30],[182,134],[221,66],[116,468],[-120,143],[58,187]],[[3714,4295],[-275,-18]],[[2517,5264],[-215,175],[70,368],[94,201],[-31,328],[226,507]],[[2661,6843],[55,100]],[[2732,6975],[-71,-132]],[[793,5499],[113,181],[-130,396],[261,582],[784,356],[312,-47],[284,258]],[[2417,7225],[426,-120]],[[8213,1412],[-533,-294],[-575,77],[-91,80],[-695,234],[-116,65],[-155,425],[-765,426]],[[8473,7801],[-143,-211],[-90,-338],[98,-257],[-49,-233],[-813,-66],[-400,-127],[65,-252],[-349,-126],[-317,135],[-277,178],[-295,30],[-168,113]],[[4573,7121],[30,244],[-195,148],[-19,187],[598,285],[193,365]],[[2417,7225],[-153,97],[-601,181],[-139,112],[164,137],[377,-176],[117,94],[294,408],[-226,225],[-226,124],[-24,143],[95,172],[291,277],[55,151]]],"transform":{"scale":[0.00021414193724661148,0.00021770191731011247],"translate":[48.940985769177814,33.397788801282466]}}'');
										',
						@oldVersion=@ver,
						@newVersion=31;
						
SELECT @ver = [version] FROM tbl_Version ;
EXECUTE sp_executesql @Checker, @ParmDefinition,
						@Command = N'CREATE TABLE dbo.tbl_Alerts (
										Id INT NOT NULL IDENTITY(1, 1),
										ChartId Int NOT NULL,
										Detail NVARCHAR(max) NOT NULL,
										JobId UNIQUEIDENTIFIER NOT NULL,
										CONSTRAINT [PK_tbl_Alerts] PRIMARY KEY ([Id])
										) ON [PRIMARY];
										ALTER TABLE dbo.tbl_Alerts ADD CONSTRAINT
											FK_tbl_Alerts_tbl_Charts FOREIGN KEY
											(ChartId) REFERENCES dbo.tbl_Charts
											(Id) ON UPDATE  NO ACTION 
											 ON DELETE  CASCADE',
						@oldVersion=@ver,
						@newVersion=32;

SELECT @ver = [version] FROM tbl_Version ;
EXECUTE sp_executesql @Checker, @ParmDefinition,
						@Command = N'INSERT INTO [dbo].[tbl_MenuCategories] ( [MainMenuId], [Name], [Type]) VALUES ( 3, N''تنظیمات'', 5)
									 INSERT INTO [dbo].[tbl_Menus] ( [MenuCategoryId], [Name], [Link], [Type], [Detail]) 
										VALUES ( (select Id from tbl_MenuCategories where Name=N''تنظیمات'' and [Type]=5), N''به‌روز رسانی'', N''Moderation/AutoUpdate/index/'', 7, NULL)',
						@oldVersion=@ver,
						@newVersion=33;

SELECT @ver = [version] FROM tbl_Version ;
EXECUTE sp_executesql @Checker, @ParmDefinition,
						@Command = N'INSERT INTO [dbo].[tbl_Menus] ( [MenuCategoryId], [Name], [Link], [Type], [Detail]) 
										VALUES ( (select Id from tbl_MenuCategories where Name=N''تنظیمات'' and [Type]=5), N''پست الکترونیک'', N''Moderation/Settings/Mail/'', 7, NULL);
									
									CREATE TABLE dbo.tbl_Settings(
										Id INT NOT NULL IDENTITY(1, 1),
										Mail NVARCHAR(MAX),
										Sms NVARCHAR(MAX),
										CONSTRAINT [PK_tbl_Settings] PRIMARY KEY ([Id])
									) ON [PRIMARY];',
						@oldVersion=@ver,
						@newVersion=34;

SELECT @ver = [version] FROM tbl_Version ;
EXECUTE sp_executesql @Checker, @ParmDefinition,
						@Command = N'ALTER TABLE dbo.tbl_DataSources ADD Schedule nvarchar(max) NULL;',
						@oldVersion=@ver,
						@newVersion=35;						

SELECT @ver = [version] FROM tbl_Version ;
EXECUTE sp_executesql @Checker, @ParmDefinition,
						@Command = N'Create Function SD_Devide_int(@P1 int,@P2 int)Returns int As Begin Return @P1/@P2 End',
						@oldVersion=@ver,
						@newVersion=36;	

SELECT @ver = [version] FROM tbl_Version ;
EXECUTE sp_executesql @Checker, @ParmDefinition,
						@Command = N'Create Function SD_Devide_float(@P1 float,@P2 float)Returns float As Begin Return @P1/@P2 End;',
						@oldVersion=@ver,
						@newVersion=37;	

SELECT @ver = [version] FROM tbl_Version ;
EXECUTE sp_executesql @Checker, @ParmDefinition,
						@Command = N'Create Function SD_MAX_int(@P1 int,@P2 int)Returns int As Begin Return Case When @P1 >= @P2 Then @P1 Else @P2 End End;',
						@oldVersion=@ver,
						@newVersion=38;	

SELECT @ver = [version] FROM tbl_Version ;
EXECUTE sp_executesql @Checker, @ParmDefinition,
						@Command = N'Create Function SD_MAX_float(@P1 float,@P2 float)Returns float As Begin Return Case When @P1 >= @P2 Then @P1 Else @P2 End End;',
						@oldVersion=@ver,
						@newVersion=39;	

SELECT @ver = [version] FROM tbl_Version ;
EXECUTE sp_executesql @Checker, @ParmDefinition,
						@Command = N'Create Function SD_MAX_string(@P1 nvarchar(max),@P2 nvarchar(max))Returns nvarchar(max) As Begin Return Case When @P1 >= @P2 Then @P1 Else @P2 End End;',
						@oldVersion=@ver,
						@newVersion=40;	

SELECT @ver = [version] FROM tbl_Version ;
EXECUTE sp_executesql @Checker, @ParmDefinition,
						@Command = N'Create Function SD_MIN_int(@P1 int,@P2 int)Returns int As Begin Return Case When @P1 <= @P2 Then @P1 Else @P2 End End;',
						@oldVersion=@ver,
						@newVersion=41;	

SELECT @ver = [version] FROM tbl_Version ;
EXECUTE sp_executesql @Checker, @ParmDefinition,
						@Command = N'Create Function SD_MIN_float(@P1 float,@P2 float)Returns float As Begin Return Case When @P1 <= @P2 Then @P1 Else @P2 End End;',
						@oldVersion=@ver,
						@newVersion=42;	

SELECT @ver = [version] FROM tbl_Version ;
EXECUTE sp_executesql @Checker, @ParmDefinition,
						@Command = N'Create Function SD_MIN_string(@P1 nvarchar(max),@P2 nvarchar(max))Returns nvarchar(max) As Begin Return Case When @P1 <= @P2 Then @P1 Else @P2 End End;',
						@oldVersion=@ver,
						@newVersion=43;	
					
		

SELECT @ver = [version] FROM tbl_Version ;
EXECUTE sp_executesql @Checker, @ParmDefinition,
						@Command = N'
						ALTER TABLE dbo.tbl_DatasourceInterRelation ADD Operand nvarchar(200) NOT NULL Default N''='';
						ALTER TABLE dbo.tbl_DatasourceInterRelation ADD JoinType nvarchar(200) NOT NULL Default N''INNER JOIN'';
						
						DECLARE @s NVARCHAR(MAX);
										SELECT @s = ( 
													  SELECT ''UPDATE tbl_Charts SET '' + y.a + '' = '' + (
													  SELECT ''REPLACE( ''
														FROM INFORMATION_SCHEMA.COLUMNS i
														WHERE i.TABLE_NAME = d.TableName
														FOR XML PATH( '''' )) + y.a + '', '' + LEFT((
													  SELECT ''N''''['' + i.COLUMN_NAME + '']'''', N''''[id'' + CAST(d.Id AS NVARCHAR(256)) + ''].['' + i.COLUMN_NAME + '']''''), ''
														FROM INFORMATION_SCHEMA.COLUMNS i
														WHERE i.TABLE_NAME = d.TableName
														FOR XML PATH( '''' )),LEN((
													  SELECT ''N''''['' + i.COLUMN_NAME + '']'''', N''''[id'' + CAST(d.Id AS NVARCHAR(256)) + ''].['' + i.COLUMN_NAME + '']''''), ''
														FROM INFORMATION_SCHEMA.COLUMNS i
														WHERE i.TABLE_NAME = d.TableName
														FOR XML PATH( '''' ))) - 1) + '' where id = '' + CAST(c.Id AS NVARCHAR(1000)) + '' AND '' + y.a + '' not like ''''%[[]id'' + CAST(d.Id AS NVARCHAR(256)) + '']%'''';''
														FROM tbl_Charts c
															 INNER JOIN tbl_DataSource_Chart dc ON c.Id = dc.ChartId
															 INNER JOIN tbl_DataSources d ON d.Id = dc.DatasourceNewId
															 CROSS JOIN(
													  SELECT ''SeriesLevel'' a
													  UNION
													  SELECT ''Measurs''
													  UNION
													  SELECT ''Hierarchies''
													  UNION
													  SELECT ''Detail''
													  UNION
													  SELECT ''Provisions'' ) y
														FOR XML PATH( '''' ));
										EXECUTE ( @s );
										
										DECLARE @sql NVARCHAR(MAX);
										WITH _T
													AS ( SELECT LeftDatasourceId,
																LeftColumnName,
																RightDatasourceId,
																RightColumnName,
																DatasourceInterRelationMetaId
														FROM tbl_DatasourceInterRelation ),
												_TT
													AS (
													SELECT DatasourceInterRelationMetaId Id,
														LeftDatasourceId DatasourceId,
														REPLACE(LeftColumnName,''[id'' + CAST(LeftDatasourceId AS NVARCHAR(50)) + ''].'','''') ColumnName
													FROM _T
													UNION ALL
													SELECT DatasourceInterRelationMetaId Id,
														RightDatasourceId DatasourceId,
														REPLACE(RightColumnName,''[id'' + CAST(RightDatasourceId AS NVARCHAR(50)) + ''].'','''') ColumnName
													FROM _T ),
												va
													AS ( SELECT DISTINCT DS.Id,
																		DS.TableName,
																		SUBSTRING(( 
																					SELECT '', '' + TTI.ColumnName
																					FROM _TT TTI
																					WHERE TTI.Id = TTO.Id
																						AND TTI.DatasourceId = TTO.DatasourceId
																					ORDER BY TTI.ColumnName
																					FOR XML PATH( '''' )),3,1000000000000) formula
														FROM _TT TTO
																INNER JOIN tbl_DataSources DS ON DS.Id = TTO.DatasourceId ),
												final
													AS ( SELECT c.COLUMN_NAME,
																va.Id,
																va.TableName,
																va.formula
														FROM va,
																INFORMATION_SCHEMA.COLUMNS c
														WHERE --va.Id = 10096 AND 
														c.TABLE_NAME = va.TableName
													AND PATINDEX(''%'' + CAST(c.COLUMN_NAME AS NVARCHAR(MAX)) + ''%'',CAST(va.formula AS NVARCHAR(MAX))) > 0 ),
												a
													AS ( SELECT DISTINCT t.TableName,
																		t.Id,
																		SUBSTRING(( 
																					SELECT DISTINCT '', ['' + COLUMN_NAME + '']''
																					FROM final f
																					WHERE f.formula = t.formula
																					ORDER BY 1
																					FOR XML PATH( '''' )),3,100000) AS formula
														FROM final t )
												SELECT @sql = ( 
																SELECT ''IF NOT EXISTS(SELECT * FROM sys.indexes WHERE name = ''''ID'' + CONVERT( VARCHAR(32),HASHBYTES(''MD5'',a.formula),2) + '''''' AND object_id = OBJECT_ID('''''' + a.TableName + ''''''))'' + '' BEGIN '' + ''BEGIN TRY CREATE NONCLUSTERED INDEX ID'' + CONVERT(VARCHAR(32),HASHBYTES(''MD5'',a.formula),2) + '' ON dbo.'' + a.TableName + ''('' + a.formula + '') WITH( STATISTICS_NORECOMPUTE = OFF,IGNORE_DUP_KEY = OFF,ALLOW_ROW_LOCKS = ON,ALLOW_PAGE_LOCKS = ON,FILLFACTOR = 100 ); END TRY BEGIN CATCH END CATCH;'' + '' END;''
																FROM a
																FOR XML PATH( '''' ));
										EXECUTE ( @sql );
										
										SELECT @sql = ( 
														SELECT ''DROP VIEW '' + TABLE_NAME + ''; ''
														FROM INFORMATION_SCHEMA.VIEWS
														WHERE TABLE_NAME LIKE ''dsc_%''
														FOR XML PATH( '''' ));
										EXECUTE ( @sql );
										',
						@oldVersion=@ver,
						@newVersion=45;	
						
SELECT @ver = [version] FROM tbl_Version ;
EXECUTE sp_executesql @Checker, @ParmDefinition,
						@Command = N'CREATE TABLE [dbo].[tbl_Partitions](
										[DataSourceId] [bigint] NOT NULL,
										[PartitionIndex] [int] NOT NULL,
										[LastRefresh] [datetime] NULL,
									 CONSTRAINT [PK_Partitions] PRIMARY KEY CLUSTERED 
									(
										[DataSourceId] ASC,
										[PartitionIndex] ASC
									)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
									) ON [PRIMARY];
									ALTER TABLE dbo.tbl_Partitions ADD CONSTRAINT
									FK_tbl_Partitions_tbl_DataSources FOREIGN KEY
									(
									DataSourceId
									) REFERENCES dbo.tbl_DataSources
									(
									Id
									) ON UPDATE  NO ACTION 
										ON DELETE  CASCADE; ',
						@oldVersion=@ver,
						@newVersion=46;				
			
EXECUTE sp_executesql @Checker, @ParmDefinition,
						@Command = N'INSERT INTO [dbo].[tbl_Menus] ( [MenuCategoryId], [Name], [Link], [Type], [Detail]) 
										VALUES ( (select Id from tbl_MenuCategories where Name=N''تنظیمات'' and [Type]=5), N''تنظیمات کلی'', N''Moderation/Settings/GeneralSettings/'', 7, NULL);
										
									 ALTER TABLE dbo.tbl_Settings ADD Brand nvarchar(400) NULL Default N''داشبورد مدیریتی صدف'';
									 ALTER TABLE dbo.tbl_Settings ADD Language int Default 0;',
						@oldVersion=@ver,
						@newVersion=47;

						
EXECUTE sp_executesql @Checker, @ParmDefinition,
						@Command = N'ALTER TABLE dbo.security_Users ADD ExpireTime datetime2(7) NULL;
						ALTER TABLE dbo.tbl_MenuCategories ADD [Owner] int NULL;
						ALTER TABLE [dbo].[tbl_Menus] ADD [Owner] int NULL;',
						@oldVersion=@ver,
						@newVersion=48;

EXECUTE sp_executesql @Checker, @ParmDefinition,
						@Command = N'ALTER TABLE log.[Log] ADD ClientIp nvarchar(50) NULL;',
						@oldVersion=@ver,
						@newVersion=49;


SELECT @ver = [version] FROM tbl_Version ;
EXECUTE sp_executesql @Checker, @ParmDefinition,
						@Command = N'CREATE TABLE [dbo].[tbl_OnlineUsers] (
										UserId int NOT NULL,
										LastLogin datetime NULL,
										LastActivity datetime NULL
										)  ON [PRIMARY];
										
										ALTER TABLE [dbo].[tbl_OnlineUsers] ADD CONSTRAINT
										PK_tbl_OnlineUsers PRIMARY KEY CLUSTERED (UserId) 
										WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY];

										ALTER TABLE [dbo].[tbl_OnlineUsers] ADD CONSTRAINT
										FK_tbl_OnlineUsers_security_Users FOREIGN KEY (UserId) 
										REFERENCES dbo.security_Users (Id) 
											ON UPDATE  NO ACTION 
											ON DELETE  CASCADE ;
										INSERT INTO [dbo].[tbl_Menus] ( [MenuCategoryId], [Name], [Link], [Type], [Detail]) 
										VALUES ( (select Id from tbl_MenuCategories where Name=N''تنظیمات'' and [Type]=5), N''کاربران آنلاین'', N''onlineUsers'', 7, NULL);',
						@oldVersion=@ver,
						@newVersion=50;
						
SELECT @ver = [version] FROM tbl_Version ;
EXECUTE sp_executesql @Checker, @ParmDefinition,
						@Command = N'UPDATE tbl_Menus set Type = 8 WHERE Link = ''Moderation/DatasourceInterRelation/index/'';
									 INSERT INTO [dbo].[tbl_Menus] ( [MenuCategoryId], [Name], [Link], [Type], [Detail]) 
									    VALUES ( (select Id from tbl_MenuCategories where Name=N''تنظیمات'' and [Type]=5), N''مجوز برنامه'', N''licence'', 9, NULL);',
						@oldVersion=@ver,
						@newVersion=51;


SELECT @ver = [version] FROM tbl_Version ;
EXECUTE sp_executesql @Checker, @ParmDefinition,
						@Command = N'INSERT INTO [dbo].[tbl_Menus] ( [MenuCategoryId], [Name], [Link], [Type], [Detail]) 
									    VALUES ( (select Id from tbl_MenuCategories where Name=N''کنترل دسترسی'' and [Type]=2), N''اتصال به اکتیو دایرکتوری'', N''activeDirectory'', 10, NULL);\

										ALTER TABLE dbo.security_Users ADD [Type] INT DEFAULT 0 NOT NULL;',
						@oldVersion=@ver,
						@newVersion=52;


SELECT @ver = [version] FROM tbl_Version ;
EXECUTE sp_executesql @Checker, @ParmDefinition,
						@Command = N'ALTER TABLE [dbo].[tbl_DatasourceInterRelationMeta] ALTER COLUMN [Name] NVARCHAR(1000);',
						@oldVersion=@ver,
						@newVersion=53;


SELECT @ver = [version] FROM tbl_Version ;
EXECUTE sp_executesql @Checker, @ParmDefinition,
						@Command = N'CREATE TABLE dbo.tbl_Messages
										(
										Id int NOT NULL IDENTITY (1, 1),
										ObjectType int NOT NULL,
										ObjectId int NOT NULL,
										Lang int NOT NULL,
										Message nvarchar(500) NOT NULL
										)

									ALTER TABLE dbo.tbl_Messages ADD CONSTRAINT
										PK_tbl_Messages PRIMARY KEY CLUSTERED 
										(
										Id
										) WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY];

										insert into tbl_Messages (ObjectType, ObjectId, Lang, Message)
										select 0, Id, 0, ISNULL(Name, '''') from tbl_Menus;

										insert into tbl_Messages (ObjectType, ObjectId, Lang, Message)
										select 1, Id, 0, ISNULL(Name, '''') from tbl_MenuCategories;

										insert into tbl_Messages (ObjectType, ObjectId, Lang, Message)
										select 2, Id, 0, ISNULL(Name, '''') from tbl_MainMenus;

										insert into tbl_Messages (ObjectType, ObjectId, Lang, Message)
										select 3, Id, 0, ISNULL(Name, '''') from tbl_Charts;

										insert into tbl_Messages (ObjectType, ObjectId, Lang, Message)
										select 4, Id, 0, ISNULL(Name, '''') from tbl_DataSources;										
										
										insert into tbl_Messages (ObjectType, ObjectId, Lang, Message)
										select 0, Id, 1, ISNULL(Name, '''') from tbl_Menus;

										insert into tbl_Messages (ObjectType, ObjectId, Lang, Message)
										select 1, Id, 1, ISNULL(Name, '''') from tbl_MenuCategories;

										insert into tbl_Messages (ObjectType, ObjectId, Lang, Message)
										select 2, Id, 1, ISNULL(Name, '''') from tbl_MainMenus;

										insert into tbl_Messages (ObjectType, ObjectId, Lang, Message)
										select 3, Id, 1, ISNULL(Name, '''') from tbl_Charts;

										insert into tbl_Messages (ObjectType, ObjectId, Lang, Message)
										select 4, Id, 1, ISNULL(Name, '''') from tbl_DataSources;

										insert into tbl_Messages (ObjectType, ObjectId, Lang, Message)
										select 5, Id, 0, ISNULL(RoleName, '''') from security_Roles;

										insert into tbl_Messages (ObjectType, ObjectId, Lang, Message)
										select 5, Id, 1, ISNULL(RoleName, '''') from security_Roles;

										insert into tbl_Messages (ObjectType, ObjectId, Lang, Message)
										select 6, Id, 0, ISNULL(Name, '''') from [tbl_Packages];

										insert into tbl_Messages (ObjectType, ObjectId, Lang, Message)
										select 6, Id, 1, ISNULL(Name, '''') from [tbl_Packages];

										
										delete from tbl_Messages where ObjectType = 0 and lang = 1 and ObjectId = (SELECT id FROM tbl_Menus WHERE type = 8);
										insert into tbl_Messages (lang, ObjectType, ObjectId, Message) values (1, 0,(SELECT id FROM tbl_Menus WHERE type = 8), ''Datasource Relations'');

										delete from tbl_Messages where ObjectType = 0 and lang = 1 and ObjectId = (SELECT id FROM tbl_Menus WHERE name = N''مدیریت کاربران'');
										insert into tbl_Messages (lang, ObjectType, ObjectId, Message) values (1, 0,(SELECT id FROM tbl_Menus WHERE name = N''مدیریت کاربران''), ''Users'');

										delete from tbl_Messages where ObjectType = 0 and lang = 1 and ObjectId = (SELECT id FROM tbl_Menus WHERE name = N''مدیریت نقش‌ها'');
										insert into tbl_Messages (lang, ObjectType, ObjectId, Message) values (1, 0,(SELECT id FROM tbl_Menus WHERE name = N''مدیریت نقش‌ها''), ''Roles'');

										delete from tbl_Messages where ObjectType = 0 and lang = 1 and ObjectId = (SELECT id FROM tbl_Menus WHERE name = N''مدیریت منابع داده'');
										insert into tbl_Messages (lang, ObjectType, ObjectId, Message) values (1, 0,(SELECT id FROM tbl_Menus WHERE name = N''مدیریت منابع داده''), ''Data Sources'');

										delete from tbl_Messages where ObjectType = 0 and lang = 1 and ObjectId = (SELECT id FROM tbl_Menus WHERE name = N''مدیریت نمودارها'');
										insert into tbl_Messages (lang, ObjectType, ObjectId, Message) values (1, 0,(SELECT id FROM tbl_Menus WHERE name = N''مدیریت نمودارها''), ''Charts'');

										delete from tbl_Messages where ObjectType = 0 and lang = 1 and ObjectId = (SELECT id FROM tbl_Menus WHERE name = N''مديريت متغيرها'');
										insert into tbl_Messages (lang, ObjectType, ObjectId, Message) values (1, 0,(SELECT id FROM tbl_Menus WHERE name = N''مديريت متغيرها''), ''Variables'');

										delete from tbl_Messages where ObjectType = 0 and lang = 1 and ObjectId = (SELECT id FROM tbl_Menus WHERE name = N''به‌روز رسانی'');
										insert into tbl_Messages (lang, ObjectType, ObjectId, Message) values (1, 0,(SELECT id FROM tbl_Menus WHERE name = N''به‌روز رسانی''), ''Updates'');

										delete from tbl_Messages where ObjectType = 0 and lang = 1 and ObjectId = (SELECT id FROM tbl_Menus WHERE name = N''پست الکترونیک'');
										insert into tbl_Messages (lang, ObjectType, ObjectId, Message) values (1, 0,(SELECT id FROM tbl_Menus WHERE name = N''پست الکترونیک''), ''E-Mail'');

										delete from tbl_Messages where ObjectType = 0 and lang = 1 and ObjectId = (SELECT id FROM tbl_Menus WHERE name = N''تنظیمات کلی'');
										insert into tbl_Messages (lang, ObjectType, ObjectId, Message) values (1, 0,(SELECT id FROM tbl_Menus WHERE name = N''تنظیمات کلی''), ''General Settings'');

										delete from tbl_Messages where ObjectType = 0 and lang = 1 and ObjectId = (SELECT id FROM tbl_Menus WHERE name = N''کاربران آنلاین'');
										insert into tbl_Messages (lang, ObjectType, ObjectId, Message) values (1, 0,(SELECT id FROM tbl_Menus WHERE name = N''کاربران آنلاین''), ''Online Users'');

										delete from tbl_Messages where ObjectType = 0 and lang = 1 and ObjectId = (SELECT id FROM tbl_Menus WHERE name = N''مجوز برنامه'');
										insert into tbl_Messages (lang, ObjectType, ObjectId, Message) values (1, 0,(SELECT id FROM tbl_Menus WHERE name = N''مجوز برنامه''), ''Licence'');

										delete from tbl_Messages where ObjectType = 0 and lang = 1 and ObjectId = (SELECT id FROM tbl_Menus WHERE name = N''اتصال به اکتیو دایرکتوری'');
										insert into tbl_Messages (lang, ObjectType, ObjectId, Message) values (1, 0,(SELECT id FROM tbl_Menus WHERE name = N''اتصال به اکتیو دایرکتوری''), ''Active Directory Integration'');

										--Menu Category--
										delete from tbl_Messages where ObjectType = 1 and lang = 1 and ObjectId = (SELECT id FROM tbl_MenuCategories WHERE name = N''منابع داده'');
										insert into tbl_Messages (lang, ObjectType, ObjectId, Message) values (1, 1,(SELECT id FROM tbl_MenuCategories WHERE name = N''منابع داده''), ''Resources'');

										delete from tbl_Messages where ObjectType = 1 and lang = 1 and ObjectId = (SELECT id FROM tbl_MenuCategories WHERE name = N''کنترل دسترسی'');
										insert into tbl_Messages (lang, ObjectType, ObjectId, Message) values (1, 1,(SELECT id FROM tbl_MenuCategories WHERE name = N''کنترل دسترسی''), ''Access Cotrol'');

										delete from tbl_Messages where ObjectType = 1 and lang = 1 and ObjectId = (SELECT id FROM tbl_MenuCategories WHERE name = N''متغيرها'');
										insert into tbl_Messages (lang, ObjectType, ObjectId, Message) values (1, 1,(SELECT id FROM tbl_MenuCategories WHERE name = N''متغيرها''), ''Variables'');

										delete from tbl_Messages where ObjectType = 1 and lang = 1 and ObjectId = (SELECT id FROM tbl_MenuCategories WHERE name = N''تنظیمات'');
										insert into tbl_Messages (lang, ObjectType, ObjectId, Message) values (1, 1,(SELECT id FROM tbl_MenuCategories WHERE name = N''تنظیمات''), ''Settings'');

										--main menus -- 
										delete from tbl_Messages where ObjectType = 2 and lang = 1 and ObjectId = (SELECT id FROM tbl_MainMenus WHERE name = N''داشبورد مدیریت'');
										insert into tbl_Messages (lang, ObjectType, ObjectId, Message) values (1, 2,(SELECT id FROM tbl_MainMenus WHERE name = N''داشبورد مدیریت''), ''Dashboard'');

										delete from tbl_Messages where ObjectType = 2 and lang = 1 and ObjectId = (SELECT id FROM tbl_MainMenus WHERE name = N''مدیریت'');
										insert into tbl_Messages (lang, ObjectType, ObjectId, Message) values (1, 2,(SELECT id FROM tbl_MainMenus WHERE name = N''مدیریت''), ''Management'');

										
										',
						@oldVersion=@ver,
						@newVersion=54;