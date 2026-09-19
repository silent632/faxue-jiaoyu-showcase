import ShowcaseNav from '@/components/showcase-nav';
import LoginPanel from '@/components/auth/login-panel';
export const metadata={title:'账号登录 · 法理学学习'};
export default function Page(){return <LoginPanel navigation={<ShowcaseNav/>}/>;}
