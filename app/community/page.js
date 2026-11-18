import PrivateShell from '@/components/auth/private-shell';
import BoardsPanel from '@/components/community/boards-panel';
export const metadata={title:'学习问答 · 法理学学习'};
export default function Page(){return <PrivateShell title="学习问答" description="从一个问题开始，让不同的经验和理由相遇。"><BoardsPanel/></PrivateShell>;}
