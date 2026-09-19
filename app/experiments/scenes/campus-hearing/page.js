import ShowcaseNav from '@/components/showcase-nav';
import PublicSceneGate from '@/components/scenes/public-scene-gate';
import script from '@/content/scenes/versions/campus-hearing-v1.json';
export const metadata={title:'校园门禁听证 · 场景研习'};
export default function Page(){return <main className="showcase-page"><ShowcaseNav/><div className="console-page"><h1>{script.title}</h1><PublicSceneGate sceneId={script.id}/></div></main>;}
