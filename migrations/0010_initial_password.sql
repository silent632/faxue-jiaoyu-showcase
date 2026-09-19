-- 名单预设账号首次登录只能设置本人密码，不能访问学习或管理数据。
ALTER TABLE users ADD COLUMN must_change_password INTEGER NOT NULL DEFAULT 0 CHECK(must_change_password IN (0,1));
