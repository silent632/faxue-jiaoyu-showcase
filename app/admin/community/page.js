import PrivateShell from '@/components/auth/private-shell';
import ModerationPanel from '@/components/admin/moderation-panel';
export const metadata={title:'讨论管理 · 法理学学习'};
export default function Page(){return <PrivateShell title="讨论管理" roles={['admin']}><ModerationPanel/></PrivateShell>;}
