import BoardManager from '@/components/community/board-manager';
import PrivateShell from '@/components/auth/private-shell';
import GroupsPanel from '@/components/teaching/groups-panel';
export const metadata={title:'教学小组 · 法理学学习'};
export default function Page(){return <PrivateShell title="教学小组" roles={['teacher','admin']}><GroupsPanel/><BoardManager/></PrivateShell>;}
