import PrivateShell from '@/components/auth/private-shell';
import AuditPanel from '@/components/admin/audit-panel';
export const metadata={title:'操作记录 · 法理学学习'};
export default function Page(){return <PrivateShell title="操作记录" roles={['admin']}><AuditPanel/></PrivateShell>;}
