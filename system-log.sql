/*

این پرس و جو برای مشاهده لاگ‌های داشبورد صدف آماده شده است
برای استفاده یک منبع داده ایجاد کنید که به پایگاه داده داشبورد صدف دسترسی داشته باشد

۱۳۹۶/۰۳/۲۵ توسط مرتضی عاشوری

*/


SELECT CONVERT( TIME, l.Time) AS زمان
     , CONVERT( DATE, l.Time) AS تاریخ
     , l.Username AS کاربر
     , u.FirstName+' '+u.LastName AS [نام کاربر]
     , m.Name AS [صفحه داشبورد]
     , mc.Name AS گروه
     , N'مشاهده صفحه داشبورد' AS نوع
     , l.PostParameters AS پارامترها
FROM [log].[Log] AS l
     INNER JOIN tbl_Menus AS m ON m.Id = SUBSTRING(l.Url, CHARINDEX('api/dashboards/get/', l.Url)+19, 9000)
INNER JOIN tbl_MenuCategories mc ON mc.Id = m.MenuCategoryId
INNER JOIN security_Users AS u ON u.Username = l.Username
WHERE(l.Url LIKE '%api/dashboards/get/%'
     )
     AND ISNUMERIC(SUBSTRING(l.Url, CHARINDEX('api/dashboards/get/', l.Url)+19, 9000)) = 1
--ORDER BY CONVERT( DATE, l.Time) DESC
UNION ALL
SELECT CONVERT( TIME, l.Time) AS زمان
     , CONVERT( DATE, l.Time) AS تاریخ
     , l.Username AS کاربر
     , u.FirstName+' '+u.LastName AS [نام کاربر]
     , NULL AS [صفحه داشبورد]
     , NULL AS گروه
     , N'تغییر  کاربر' AS نوع
     , l.PostParameters AS پارامترها
FROM [log].[Log] AS l
     INNER JOIN security_Users AS u ON u.Username = l.Username
WHERE l.Url LIKE '%api/users/edit%'
UNION ALL
SELECT CONVERT( TIME, l.Time) AS زمان
     , CONVERT( DATE, l.Time) AS تاریخ
     , l.Username AS کاربر
     , u.FirstName+' '+u.LastName AS [نام کاربر]
     , NULL AS [صفحه داشبورد]
     , NULL AS گروه
     , N'تغییر  نقش' AS نوع
     , l.PostParameters AS پارامترها
FROM [log].[Log] AS l
     INNER JOIN security_Users AS u ON u.Username = l.Username
WHERE l.Url LIKE '%api/roles/edit%'
UNION ALL
SELECT CONVERT( TIME, l.Time) AS زمان
     , CONVERT( DATE, l.Time) AS تاریخ
     , l.Username AS کاربر
     , u.FirstName+' '+u.LastName AS [نام کاربر]
     , NULL AS [صفحه داشبورد]
     , NULL AS گروه
     , N'تغییر  نمودار' AS نوع
     , l.PostParameters AS پارامترها
FROM [log].[Log] AS l
     INNER JOIN security_Users AS u ON u.Username = l.Username
WHERE l.Url LIKE '%moderation/olapchartdesign/SaveChart%'
UNION ALL
SELECT CONVERT( TIME, l.Time) AS زمان
     , CONVERT( DATE, l.Time) AS تاریخ
     , l.Username AS کاربر
     , u.FirstName+' '+u.LastName AS [نام کاربر]
     , NULL AS [صفحه داشبورد]
     , NULL AS گروه
     , N'مشاهده نمودار' AS نوع
     , l.PostParameters AS پارامترها
FROM [log].[Log] AS l
     INNER JOIN security_Users AS u ON u.Username = l.Username
WHERE l.Url LIKE '%api/chartdata/getdata%';