/*

پرس و جوی نمایش کاربرهای هر نقش
۱۳۹۶/۰۷/۱۰ توسط مرتضی عاشوری

*/

select r.RoleName as [نقش]
    ,t.name  as [نوع]
    , case when a.name is null then func.name else a.name end  as [دسترسی]
    , case 
	   when chart.Name is not null then chart.Name 
	   when menu.Name is not null then menu.Name 
	   when menuCat.Name is not null then menuCat.Name 
	   when datasource.Name is not null then datasource.Name 
    	   else N'---' 
      end  as [نام]

from security_PermissionsInRoles p left join security_Roles r on p.RoleId = r.Id left join (
    select 'Chart' as name, 1 as id union all
    select 'Menu', 2 union all
    select 'MenuCategory',3 union all
    select 'MainMenu', 4 union all
    select 'Functional', 5 union all
    select 'DataSource', 6 union all
    select 'Package', 7 union all
    select 'Form ', 8 

) t on t.id = p.ObjectType left join (
    select 'View' as name        , 1 as id union all
    select 'Edit'               , 2 union all
    select 'Delete'             , 4 union all
    select 'From_AddRecord'     , 5 union all
    select 'From_EditRecord'    , 6 union all
    select 'From_DeleteRecord'  , 7

)a on p.Action = a.id left join (
    select 'ChartAdd' as name, 1 as id union all
    select 'ChartView' as name, 2 as id union all
    select 'ChartEdit' as name, 3 as id union all
    select 'ChartDelete' as name, 4 as id union all
    select 'MenuAdd' as name, 5 as id union all
    select 'MenuView' as name, 6 as id union all
    select 'MenuEdit' as name, 7 as id union all
    select 'MenuDelete' as name, 8 as id union all
    select 'DataSourceAdd' as name, 9 as id union all
    select 'DataSourceView' as name, 10 as id union all
    select 'DataSourceEdit' as name, 11 as id union all
    select 'DataSourceDelete' as name, 12 as id union all
    select 'FormAdd' as name, 22 as id union all
    select 'FormView' as name, 23 as id union all
    select 'FormEdit' as name, 24 as id union all
    select 'FormDelete' as name, 25 as id union all
    select 'AdminAccessOnCharts' as name, 13 as id union all
    select 'AdminAccessOnMenus' as name, 14 as id union all
    select 'AdminAccessOnDataSources' as name, 15 as id union all
    select 'AdminAccessOnForms' as name, 21 as id union all
    select 'DashboardAddDeleteArragneCharts' as name, 16 as id union all
    select 'ManageAllUsersAndRoles' as name, 17 as id union all
    select 'ViewManageMainMenu' as name, 18 as id union all
    select 'ArrangeMenus' as name, 19 as id 

)func on func.id = p.Action and p.ObjectType=5

left join tbl_Charts as chart on chart.Id = p.ObjectId and p.ObjectType =1
left join tbl_Menus as menu on menu.Id = p.ObjectId and p.ObjectType =2
left join tbl_MenuCategories as menuCat on menuCat.Id = p.ObjectId and p.ObjectType = 3 and menuCat.Type = 3
left join tbl_DataSources as datasource on datasource.Id = p.ObjectId and p.ObjectType = 6