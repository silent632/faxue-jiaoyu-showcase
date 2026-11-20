'use client';

import Link from 'next/link';
import LawCitationButton from '@/components/law-citation-button';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { formatLawVersion, normalizeLawSearch } from '@/lib/law-library';
import { studyContextHref, studyLawReturn } from '@/lib/study-law-context.js';

function searchText(value) {
  return normalizeLawSearch(value).replace(/[\s《》〈〉]/gu, '');
}

function excerpt(paragraphs, tokens) {
  const fullText = paragraphs.join(' ');
  const token = tokens.find(value => fullText.includes(value));
  const index = token ? fullText.indexOf(token) : -1;
  const start = index < 0 ? 0 : Math.max(0, index - 42);
  const end = Math.min(fullText.length, start + 160);
  if (index < 0) return fullText.slice(0, end) + (end < fullText.length ? '…' : '');
  return <>{start > 0 && '…'}{fullText.slice(start, index)}<mark>{token}</mark>{fullText.slice(index + token.length, end)}{end < fullText.length && '…'}</>;
}

const searchScopes = {
  all: ["综合", "例如：民法典 第143条、知情 同意"],
  title: ["法规名称", "例如：民法典"],
  article: ["条号", "例如：民法典 第143条，也可以只填 143"],
  body: ["正文关键词", "例如：知情 同意"],
};

export default function LawIndex({ catalogue, caseIds }) {
  const params = useSearchParams();
  const [query, setQuery] = useState(params.get('q') || '');
  const [scope, setScope] = useState('all');
  const [limit, setLimit] = useState(24);
  const [referenceLimit, setReferenceLimit] = useState(12);
  const [index, setIndex] = useState(null);
  const [loadError, setLoadError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [mode, setMode] = useState('search');
  const results = useRef(null);
  const urlQuery = params.get('q') || '';
  const urlScope = params.get('scope');
  useEffect(() => setQuery(urlQuery), [urlQuery]);
  useEffect(() => setScope(Object.hasOwn(searchScopes, urlScope) ? urlScope : 'all'), [urlScope]);
  const fromStudy = Boolean(studyLawReturn(params, caseIds));
  function statuteHref(slug, article) {
    const next = new URLSearchParams();
    if (query.trim()) next.set('q', query.trim());
    if (scope !== 'all') next.set('scope', scope);
    if (fromStudy) next.set('fromCase', params.get('fromCase'));
    const href = `/resources/laws/${slug}/${next.size ? `?${next}` : ''}${article ? `#article-${article}` : ''}`;
    return studyContextHref(href, params);
  }
  function updateQuery(value) {
    setQuery(value);
    setLimit(24);
    setReferenceLimit(12);
    const url = new URL(window.location.href);
    if (value.trim()) url.searchParams.set('q', value.slice(0, 160));
    else url.searchParams.delete('q');
    window.history.replaceState(null, '', url.pathname + url.search);
  }
  function updateScope(value) {
    setScope(value);
    setLimit(24);
    setReferenceLimit(12);
    const url = new URL(window.location.href);
    if (value === 'all') url.searchParams.delete('scope');
    else url.searchParams.set('scope', value);
    window.history.replaceState(null, '', url.pathname + url.search);
  }
  const tokens = normalizeLawSearch(scope === 'article' ? query.trim().normalize('NFKC').replace(/(?:第\s*)?(\d+|[零〇一二三四五六七八九十百千]+)$/u, '第$1条') : query).replace(/[《》〈〉，、；：。,:;()]+/gu, ' ').replace(/(第\d+条)/g, ' $1 ').trim().split(/\s+/).filter(Boolean);
  const hasArticle = tokens.some(token => /^第\d+条$/.test(token));
  const needsIndex = mode === 'search' && tokens.length > 0 && scope !== 'title' && (scope !== 'article' || hasArticle);
  useEffect(() => {
    if (!needsIndex || index) return;
    const controller = new AbortController();
    setLoadError(false);
    fetch('/resources/laws/search-index.json', { signal: controller.signal })
      .then(response => {
        if (!response.ok) throw new Error('Search index unavailable');
        return response.json();
      })
      .then(data => { if (!controller.signal.aborted) setIndex(data); })
      .catch(() => { if (!controller.signal.aborted) setLoadError(true); });
    return () => controller.abort();
  }, [needsIndex, index, attempt]);

  const articleIndex = useMemo(() => (index?.documents || []).flatMap(document => document.articles.map(article => ({
    document, article,
    title: searchText([document.title, ...(document.aliases || [])].join(' ')),
    body: searchText(article.paragraphs.join(' ')),
  }))), [index]);
  const lawName = tokens.filter(token => !/^第\d+条$/.test(token)).join('');
  const exactName = document => [document.title, ...(document.aliases || [])].some(name => searchText(name) === lawName);
  const matches = needsIndex ? articleIndex.filter(({ title, body, article }) =>
    tokens.every(token => {
      if (scope === 'body') return body.includes(searchText(token));
      if (/^第\d+条$/.test(token)) return token === `第${article.number}条`;
      return title.includes(token) || (scope === 'all' && body.includes(token));
    }))
    .sort((a, b) => Number(exactName(b.document)) - Number(exactName(a.document))) : [];
  const titleMatches = catalogue.filter(document => tokens.every(token => [document.title, ...(document.aliases || [])].some(name => searchText(name).includes(token))));
  const referenceMatches = needsIndex && scope !== 'body' ? (index?.entries || []).filter(({ name, fullName, article }) => {
    const text = searchText(`${name} ${fullName} ${article}`);
    return tokens.every(token => /^第\d+条$/.test(token) ? searchText(article).match(/^第\d+条/u)?.[0] === token : text.includes(token));
  }) : [];

  return (
    <div className="page-stack">
      <section className="editorial-panel law-index">
        <div className="console-actions law-mode" role="group" aria-label="法规查看方式">
          <button className="btn btn-outline" type="button" aria-pressed={mode === 'search'} onClick={() => setMode('search')}>搜索条文</button>
          <button className="btn btn-outline" type="button" aria-pressed={mode === 'catalog'} onClick={() => setMode('catalog')}>浏览法规目录</button>
        </div>
        {mode === 'search' && <form onSubmit={event => {
          event.preventDefault();
          if (tokens.length) results.current?.focus();
        }}>
        <fieldset className="law-search-scope">
          <legend>检索范围</legend>
          {Object.entries(searchScopes).map(([id, [label]]) => <label key={id}>
            <input type="radio" name="law-scope" value={id} checked={scope === id} onChange={() => updateScope(id)} />{label}
          </label>)}
        </fieldset>
        <label htmlFor="law-index-search">{scope === 'all' ? '输入法规名称、条号或正文关键词' : `输入${searchScopes[scope][0]}`}</label>
        <div className="law-search-row"><input id="law-index-search" className="input" type="search" value={query} maxLength={160} onChange={event => updateQuery(event.target.value)} placeholder={searchScopes[scope][1]} />
          <button className="btn btn-primary" type="submit">搜索</button>
        </div>
        </form>}
        {mode === 'search' && tokens.length === 0 && (
          <p className="editorial-muted">已收录 {catalogue.length} 部法规的 {catalogue.reduce((sum, law) => sum + law.articleCount, 0)} 条正文。也能查找案例引用过的条文。</p>
        )}
        {mode === 'search' && scope === 'article' && tokens.length > 0 && !hasArticle && <p role="status">请输入条号。可以在条号前加法规名称，例如“民法典 第143条”。</p>}
        {mode === 'search' && scope === 'title' && tokens.length > 0 && <p role="status" ref={results} tabIndex={-1}>找到 {titleMatches.length} 部法规</p>}
        {needsIndex && !index && (loadError
          ? <p role="status">暂时无法载入检索数据。<button type="button" className="btn btn-outline" onClick={() => setAttempt(current => current + 1)}>重试</button></p>
          : <p role="status">正在载入检索数据…</p>)}
        {needsIndex && index && <>
        {tokens.length > 0 && <p role="status" ref={results} tabIndex={-1}>{matches.length} 条正文 · {referenceMatches.length} 项条文引用</p>}
        {tokens.length > 0 && (matches.length > 0 ? (
          <ul className="law-results">
            {matches.slice(0, limit).map(({ document, article }) => (
              <li key={`${document.slug}-${article.number}`}>
                <div><strong>{document.title} · {article.label}</strong>
                  <p className="editorial-muted">{formatLawVersion(document)}</p>
                  <p>{excerpt(article.paragraphs, tokens)}</p>
                  <details className="law-result-fulltext"><summary>展开本条全文</summary>{article.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}</details>
                </div>
                <div className="law-result-actions">
                  <Link href={statuteHref(document.slug, article.number)}>阅读条文 →</Link>
                  <LawCitationButton title={document.title} version={document.version} label={article.label} />
                </div>
              </li>
            ))}
          </ul>
        ) : <p>本次检索未匹配到站内全文。可在下方核对案例引用，或前往 <a href="https://flk.npc.gov.cn/" target="_blank" rel="noreferrer">国家法律法规数据库</a> 查找官方文本及历史版本。</p>)}
        {matches.length > limit && <button className="btn btn-outline" type="button" onClick={() => setLimit(limit + 24)}>显示更多条文</button>}
        </>}
      </section>
      {mode === 'search' && referenceMatches.length > 0 && <section className="editorial-panel">
        <h2>案例引用</h2>
        <p className="editorial-muted">每项按引用这条规范的案例数统计。同一案例只计一次。引用所用版本以裁判文书为准。</p>
        <ul className="law-results">
          {referenceMatches.slice(0, referenceLimit).map(({ name, fullName, article, caseCount }) => {
            const filter = new URLSearchParams({ lawName: name, ...(article ? { lawArticle: article } : {}) });
            return <li key={name + '|' + article}>
              <div><strong>{name}{article && ` · ${article}`}</strong>{fullName && fullName !== name && <p>{fullName}</p>}</div>
              <Link href={`/cases/?${filter}`}>相关案例（{caseCount}） →</Link>
            </li>;
          })}
        </ul>
        {referenceMatches.length > referenceLimit && <button type="button" className="btn btn-outline" onClick={() => setReferenceLimit(referenceLimit + 12)}>显示更多案例引用</button>}
      </section>}
      {(mode === 'catalog' || (scope === 'title' && tokens.length > 0)) && <section className="editorial-panel" aria-labelledby="laws-catalog">
        <h2 id="laws-catalog">{mode === 'catalog' ? '法规目录' : '匹配的法规'}</h2>
        <ul className="law-results">
          {(mode === 'catalog' ? catalogue : titleMatches).map(({ slug, title, version, effective, repealed, articleCount }) => <li key={slug}>
            <div><strong>{title}</strong><p>{formatLawVersion({ version, effective, repealed })} · 共 {articleCount} 条</p></div>
            <Link href={statuteHref(slug)}>阅读全文 →</Link>
          </li>)}
        </ul>
      </section>}
    </div>
  );
}
