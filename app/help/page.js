import Link from 'next/link';
import ShowcaseNav from '@/components/showcase-nav';
import WelcomeTrigger from '@/components/welcome-trigger';
import help from '@/content/help.json';
export const metadata={title:'帮助与反馈 · 法理学学习',description:'使用指南、常见问题与使用意见反馈。',alternates:{canonical:'/help/'}};
export default function HelpPage(){return <main className="showcase-page"><ShowcaseNav/><div className="editorial-width help-index">
 <header className="editorial-heading"><div><h1>帮助与反馈</h1><p>查看操作指南、解决常见问题，或反馈网站使用体验。</p></div></header>
 <div className="help-grid"><section className="showcase-card help-card"><h2>平台使用指南</h2><p>用一份案例串起课程、研习与实验，完成第一次有依据的思考。</p><Link className="btn btn-accent" href="/help/guide/">阅读图文指南</Link></section><section className="showcase-card help-card"><h2>意见反馈</h2><p>遇到功能问题或有改进建议，可以告诉我们具体页面和操作情况。</p><Link className="btn btn-outline" href="/help/feedback/">进入意见反馈</Link></section></div>
 <div className="help-welcome"><WelcomeTrigger/></div>
 <section id="faq" className="help-faq"><h2>你可能想问</h2>{help.faq.map(item=><details key={item.question}><summary>{item.question}</summary><p>{item.answer}</p></details>)}</section>
 </div></main>;}
