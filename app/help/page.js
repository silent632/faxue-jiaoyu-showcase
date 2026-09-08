import Link from 'next/link';
import ShowcaseNav from '@/components/showcase-nav';
import WelcomeTrigger from '@/components/welcome-trigger';
import help from '@/content/help.json';
export const metadata={title:'帮助与反馈 · 法理学学习',description:'使用指南、常见问题与使用意见反馈。',alternates:{canonical:'/help/'}};
export default function HelpPage(){return <main className="showcase-page"><ShowcaseNav/><div className="help-page">
 <header><p className="section-eyebrow">在这里，从容开始</p><h1>帮助与反馈</h1><p className="help-lead">从第一次阅读到形成自己的判断，让每一步法理学探索都有清楚的方向。</p></header>
 <div className="help-grid"><section className="showcase-card help-card"><span className="section-eyebrow">01 · 开始学习</span><h2>平台使用指南</h2><p>用一份案例串起课程、研习与实验，完成第一次有依据的思考。</p><Link className="btn btn-accent" href="/help/guide/">阅读图文指南</Link></section><section className="showcase-card help-card"><span className="section-eyebrow">02 · 一起改进</span><h2>告诉我们你的使用体验</h2><p>哪里不清楚、哪里不顺手，或希望增加什么内容？具体的经历会帮助平台持续改进。</p><Link className="btn btn-outline" href="/help/feedback/">进入意见反馈</Link></section></div>
 <section className="showcase-card help-card"><h2>给每一位使用者的欢迎信</h2><p>无论初次接触还是深入学习，愿你带着好奇，在阅读与追问中走近法理。</p><WelcomeTrigger/></section>
 <section id="faq" className="help-faq"><h2>你可能想问</h2>{help.faq.map(item=><details key={item.question}><summary>{item.question}</summary><p>{item.answer}</p></details>)}</section>
 </div></main>;}
