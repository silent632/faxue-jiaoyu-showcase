
'use client';
import Link from 'next/link';
import { useSession } from './session-provider';
export default function AccountLinks(){
 const {user,ready}=useSession();
 if(!ready)return <div className="account-links"><Link href="/login/">账号登录</Link></div>;
 if(!user)return <div className="account-links"><Link href="/login/">账号登录</Link></div>;
 if(user.mustChangePassword)return <div className="account-links"><Link href="/login/">设置登录密码</Link></div>;
 return <div className="account-links">{user.roles.some(role=>['teacher','admin'].includes(role))&&<Link href="/teacher/">教师工作台</Link>}{user.roles.includes('admin')&&<Link href="/admin/">管理员后台</Link>}<Link href="/login/">账号与退出</Link></div>;
}
