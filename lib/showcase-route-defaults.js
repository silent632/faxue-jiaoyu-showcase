const DEFAULT_SHOWCASE_STUDY_DEMO_HREF = "/cases/case-0208/study";

export function getDefaultShowcaseStudyDemoHref() {
  const configuredHref = String(
    process.env.NEXT_PUBLIC_SHOWCASE_STUDY_DEMO_HREF ||
      process.env.SHOWCASE_STUDY_DEMO_HREF ||
      ""
  ).trim();

  return configuredHref || DEFAULT_SHOWCASE_STUDY_DEMO_HREF;
}
