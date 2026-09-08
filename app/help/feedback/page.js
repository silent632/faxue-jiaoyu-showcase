import Link from 'next/link';
import ShowcaseNav from '@/components/showcase-nav';
import FeedbackForm from '@/components/feedback-form';
import help from '@/content/help.json';
export const metadata={title:'意见反馈 · 帮助我们改进',description:'反馈操作问题、内容疑问与功能建议。',alternates:{canonical:'/help/feedback/'}};
export default function FeedbackPage(){return <main className="showcase-page"><ShowcaseNav/><div className="help-page"><header><Link href="/help/">← 帮助与反馈</Link><p className="section-eyebrow">让下一次学习更顺畅</p><h1>意见反馈</h1><p className="help-lead">一个具体的疑问，一次不顺手的操作，都值得被认真看见。谢谢你帮助平台持续改进。</p></header><FeedbackForm config={help.feedback}/><p>常见的保存与学习问题，也可以先查看<Link href="/help/#faq">常见问题</Link>。</p></div></main>;}
