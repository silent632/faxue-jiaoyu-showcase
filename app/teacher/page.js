import OverviewPanel from '@/components/teaching/overview-panel';
import Link from 'next/link';
import PrivateShell from '@/components/auth/private-shell';
export const metadata={title:'教师工作台 · 法理学学习'};
export default function Page(){return <PrivateShell title="教师工作台" description="组织学习任务，阅读学生的理由与修订，为下一步学习留下具体反馈。" roles={['teacher','admin']}><OverviewPanel/><div className="console-grid"><section className="console-card"><h2>教学小组</h2><p>管理负责的小组与学生，安排课程学习。</p><Link className="btn btn-accent" href="/teacher/groups/">管理小组</Link></section><section className="console-card"><h2>任务与点评</h2><p>发布学习任务，查看学生提交和修订。</p><Link className="btn btn-accent" href="/teacher/tasks/">进入任务</Link></section></div></PrivateShell>;}
