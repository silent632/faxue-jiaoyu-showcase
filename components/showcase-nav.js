import TopNav from "@/components/top-nav";
import { buildShowcaseNavItems } from "@/lib/showcase-content";

const SHOWCASE_USER = Object.freeze({
  sid: "public-showcase",
  name: "开放浏览",
  roleLabel: "案例研习平台",
});

export default function ShowcaseNav({ items }) {
  return <TopNav user={SHOWCASE_USER} items={items ?? buildShowcaseNavItems()} />;
}
