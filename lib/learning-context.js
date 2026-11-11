export function learningContextHref(href, search, allowedTopics) {
  const query = new URLSearchParams(search);
  const prior = query.get('returnTo') || '';
  const safePrior = prior.startsWith('/cases/?') && prior.length <= 2000 && !/[\u0000-\u001f\\]/.test(prior);
  const fromSearch = safePrior ? new URLSearchParams(prior.slice('/cases/?'.length)).get('topic') : null;
  const topic = query.get('topic') || fromSearch;
  if (!topic || !allowedTopics.includes(topic)) return href;
  const url = new URL(href, 'https://learning.invalid');
  if (url.origin !== 'https://learning.invalid') return href;
  url.searchParams.set('topic', topic);
  if (safePrior) url.searchParams.set('returnTo', prior);
  return url.pathname + url.search + url.hash;
}
