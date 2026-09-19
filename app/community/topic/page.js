import PrivateShell from '@/components/auth/private-shell';
import TopicPanel from '@/components/community/topic-panel';
export const metadata={title:'问题与讨论 · 法理学学习'};
export default function Page(){return <PrivateShell title="问题与讨论"><TopicPanel/></PrivateShell>;}
