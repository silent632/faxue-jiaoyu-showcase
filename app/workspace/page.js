import NotificationsPanel from '@/components/community/notifications-panel';
import PrivateShell from '@/components/auth/private-shell';
import WorkspacePanel from '@/components/teaching/workspace-panel';
export const metadata={title:'我的任务 · 法理学学习'};
export default function Page(){return <PrivateShell title="我的任务" description="带着问题阅读，在提交与反馈中完善自己的判断。"><WorkspacePanel/><NotificationsPanel/></PrivateShell>;}
