'use client';
import Link from 'next/link';
import { useSession } from './session-provider';
export default function AccountLinks() {
  const {user,ready} = useSession();
  if(!ready) return null;
  if(!user) return <div className="account-links"><Link href="/experiments/scenes/">场景研习</Link><Link href="/login/">账号登录</Link></div>;
  return <div className="account-links"><span>{user.displayName}</span><Link href="/experiments/scenes/">场景研习</Link><Link href="/workspace/">我的任务</Link>{user.roles.includes('teacher')&&<Link href="/teacher/">教师工作台</Link>}{user.roles.includes('admin')&&<Link href="/admin/">管理后台</Link>}<Link href="/community/">交流专区</Link><Link href="/login/">账号与退出</Link></div>;
}
