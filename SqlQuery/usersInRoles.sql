/*

پرس و جوی نمایش کاربرهای هر نقش
۱۳۹۶/۰۷/۱۰ توسط مرتضی عاشوری

*/


SELECT u.Username
     , u.FirstName
     , u.LastName
	 , u.FirstName + ' '+  u.LastName as FullName
     , r.RoleName

FROM security_UsersInRoles ur
     INNER JOIN security_Users u ON ur.UserId = u.Id
     INNER JOIN security_Roles r ON r.id = ur.RoleId;