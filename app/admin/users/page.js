import PrivateShell from '@/components/auth/private-shell';
import UsersPanel from '@/components/admin/users-panel';
export const metadata={title:'账号管理 · 法理学学习'};
export default function Page(){return <PrivateShell title="账号管理" roles={['admin']}><UsersPanel/></PrivateShell>;}
