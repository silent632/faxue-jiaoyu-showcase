import PrivateShell from '@/components/auth/private-shell';
import GroupsPanel from '@/components/teaching/groups-panel';
export const metadata={title:'小组与授权 · 法理学学习'};
export default function Page(){return <PrivateShell title="小组与授权" roles={['admin']}><GroupsPanel/></PrivateShell>;}
