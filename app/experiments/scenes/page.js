import Link from 'next/link';
import ShowcaseNav from '@/components/showcase-nav';
import script from '@/content/scenes/versions/campus-hearing-v1.json';
export const metadata={title:'场景研习 · 法理学学习'};
export default function Page(){return <main className="showcase-page"><ShowcaseNav/><div className="console-page"><header><p className="section-eyebrow">进入情境 · 形成理由</p><h1>场景研习</h1><p>在不同立场之间，练习提出方案、回应异议与修订判断。</p></header><section className="console-card"><h2>{script.title}</h2><p>{script.introduction}</p><p className="console-muted">{script.reviewStatus}</p><Link className="btn btn-accent" href="/experiments/scenes/campus-hearing/">进入听证室</Link></section></div></main>;}
