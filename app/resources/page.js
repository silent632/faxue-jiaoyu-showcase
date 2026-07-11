import { redirect } from "next/navigation";

/** 视频中心已并入课程页，此路由仅保留跳转（/resources/videos/[slug] 播放页仍独立） */
export default function ResourcesPage() {
  redirect("/courses");
}
