import TopNav from "@/components/top-nav";
import { buildShowcaseNavItems } from "@/lib/showcase-content";
import { getPublicShowcaseUser } from "@/lib/public-showcase-user";

export default function ShowcaseNav({ items }) {
  return <TopNav user={getPublicShowcaseUser()} items={items ?? buildShowcaseNavItems()} />;
}
