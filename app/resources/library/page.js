import Link from 'next/link';
import ShowcaseNav from '@/components/showcase-nav';
export const metadata={title:'资料专区 · 法理学学习'};
export default function Page(){return <main className="showcase-page"><ShowcaseNav/><div className="console-page"><header><p className="section-eyebrow">学习资料</p><h1>资料专区</h1><p>考研与法考经验、学习方法及相关资料将在这里集中整理。</p></header><section className="console-card"><h2>资料正在整理</h2><p>目前尚未上传可下载资料。你可以先浏览课程材料，或前往交流专区分享学习中的问题。</p><div className="console-actions"><Link href="/courses/" className="btn btn-outline">浏览课程材料</Link><Link href="/community/" className="btn btn-outline">进入交流专区</Link></div></section></div></main>;}
