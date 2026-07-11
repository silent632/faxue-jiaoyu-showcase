import Link from "next/link";

export default function LegacyCourseMaterialRedirect({ href, label }) {
  return (
    <section className="showcase-card course-legacy-redirect-card">
      <span className="showcase-card-eyebrow">页面地址已更新</span>
      <h2>正在跳转到最新材料页</h2>
      <p className="course-detail-card-intro">
        当前旧链接已经并入统一材料条目。若浏览器没有自动跳转，请直接进入最新页面继续查看。
      </p>
      <div className="course-detail-action-row">
        <Link href={href} className="showcase-home-panel-link">
          继续访问{label}
        </Link>
        <Link href="/courses" className="btn btn-ghost">
          返回课程体系
        </Link>
      </div>
      <script
        dangerouslySetInnerHTML={{
          __html: `window.location.replace(${JSON.stringify(href)});`,
        }}
      />
    </section>
  );
}
