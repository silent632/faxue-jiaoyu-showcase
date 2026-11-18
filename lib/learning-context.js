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

export function communityReturnHref(pathname, search) {
  const query = new URLSearchParams(search);
  if (pathname === '/community/topic/') {
    const id = query.get('id') || '';
    return /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(id)
      ? `/community/topic/?id=${id}`
      : '/community/';
  }
  if (pathname !== '/community/') return '';

  const scene = query.get('scene') || '';
  const caseId = query.get('case') || '';
  const knowledge = query.get('knowledge') || '';
  if (/^[a-z0-9-]{1,80}@[a-z0-9.-]{1,32}$/i.test(scene)) {
    return `/community/?scene=${encodeURIComponent(scene)}`;
  }
  if (/^case-\d{4}$/.test(caseId)) return `/community/?case=${caseId}`;
  if (/^[a-z0-9-]{1,80}$/.test(knowledge)) return `/community/?knowledge=${knowledge}`;
  return '/community/';
}
