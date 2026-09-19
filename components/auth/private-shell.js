import ShowcaseNav from '@/components/showcase-nav';
import PrivateGate from './private-gate';
export default function PrivateShell({title,description,roles,children}) {
 return <main className="showcase-page"><ShowcaseNav/><div className="console-page"><header><p className="section-eyebrow">法理学 · 阅读与追问</p><h1>{title}</h1>{description&&<p>{description}</p>}</header><PrivateGate roles={roles}>{children}</PrivateGate></div></main>;
}
