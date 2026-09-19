import BoardManager from '@/components/community/board-manager';
import PrivateShell from '@/components/auth/private-shell';
import ScenesPanel from '@/components/admin/scenes-panel';
export const metadata={title:'内容状态 · 法理学学习'};
export default function Page(){return <PrivateShell title="内容状态" roles={['admin']}><ScenesPanel/><BoardManager/></PrivateShell>;}
