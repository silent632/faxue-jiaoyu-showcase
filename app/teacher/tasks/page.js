import PrivateShell from '@/components/auth/private-shell';
import TasksPanel from '@/components/teaching/tasks-panel';
export const metadata={title:'教学任务 · 法理学学习'};
export default function Page(){return <PrivateShell title="教学任务" roles={['teacher','admin']}><TasksPanel/></PrivateShell>;}
