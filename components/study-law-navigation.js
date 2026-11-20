"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { caseOrigin, studyContextHref, studyLawReturn } from "@/lib/study-law-context.js";

export default function StudyLawNavigation({ document = false, caseIds, related }) {
  const params = useSearchParams();
  const back = studyLawReturn(params, caseIds);
  const query = params.get("q") || "";
  const carried = new URLSearchParams();
  if (query) carried.set('q', query.slice(0, 160));
  const scope = params.get('scope');
  if (['title', 'article', 'body'].includes(scope)) carried.set('scope', scope);
  if (back) carried.set('fromCase', params.get('fromCase'));
  const suffix = carried.size ? `?${carried}` : "";
  const index = studyContextHref(`/resources/laws/${suffix}`, params);
  const origin = caseOrigin(params);

  return (
    <div className="pilot-actions">
      {document ? <Link href={index}>← 返回法条检索</Link>
        : !back && <Link href={origin.href}>{origin.label}</Link>}
      {related && <Link href={studyContextHref(`/resources/laws/${related.slug}/${suffix}#article-${related.article}`, params)}>{related.label} →</Link>}
      {back && <Link className="btn btn-primary" href={back}>返回案例研习 →</Link>}
    </div>
  );
}
