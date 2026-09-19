import PrivateShell from '@/components/auth/private-shell';
import SubmissionsPanel from '@/components/teaching/submissions-panel';
export const metadata={title:'提交与点评 · 法理学学习'};
export default function Page(){return <PrivateShell title="提交与点评" roles={['teacher','mentor','admin']}><SubmissionsPanel/></PrivateShell>;}
