"use client";

import Link from "next/link";
import { useState } from "react";
import { libraryCategories } from "@/lib/library-categories.js";

import { useExperiencePreview } from "@/components/use-experience-preview";

const filterLabels = { school: "院校", year: "备考年份", track: "方向" };

export default function ExperienceReading({ articles: published }) {
  const preview = useExperiencePreview();
  const articles = [...published, ...preview.articles];
  const [filters, setFilters] = useState({ school: "", year: "", track: "", query: "" });
  const fields = Object.keys(filterLabels).filter(key => articles.some(item => item.reading[key]));
  const terms = filters.query.trim().normalize("NFKC").toLocaleLowerCase().split(/\s+/).filter(Boolean);
  const matches = articles.filter(({ title, category, reading }) =>
    fields.every(key => !filters[key] || filters[key] === String(reading[key])) &&
    terms.every(term => [title, libraryCategories[category], reading.school, reading.year, reading.track]
      .join(" ").normalize("NFKC").toLocaleLowerCase().includes(term)));

  function update(field, value) {
    setFilters(previous => ({ ...previous, [field]: value }));
  }

  return (
    <section className="editorial-panel" aria-labelledby="exam-notes">
      <h2 id="exam-notes">往届备考经验</h2>
      {articles.length ? <>
        <div className="experience-filters full-experience-filters">
          <label>搜索经验帖<input className="input" type="search" value={filters.query}
            onChange={event => update("query", event.target.value)} placeholder="院校、方向或关键词" /></label>
          {fields.map(key => {
            const values = [...new Set(articles.map(item => item.reading[key]).filter(Boolean).map(String))];
            values.sort((a, b) => key === "year" ? Number(b) - Number(a) : a.localeCompare(b, "zh-CN"));
            return <div className="experience-filter" key={key}>
              <label htmlFor={`experience-filter-${key}`}>{filterLabels[key]}</label>
              <select id={`experience-filter-${key}`} className="input" value={filters[key]} onChange={event => update(key, event.target.value)}>
                <option value="">不限</option>
                {values.map(value => <option key={value}>{value}</option>)}
              </select>
            </div>;
          })}
        </div>
        <p role="status">{matches.length ? `共 ${matches.length} 份备考经验资料` : "没有符合当前条件的经验帖。"}</p>
        <div className="library-reading-grid">
          {matches.map(({ id, title, category, reading, localPreview }) => (
            <article className="experience-article-card" key={id}>
              <p className="editorial-muted">{localPreview ? "本地全文校样" : [libraryCategories[category], reading.year, reading.school, reading.track].filter(Boolean).join(" · ")}</p>
              <h3><Link href={`/resources/library/experience/?article=${id}`}>{title}</Link></h3>
              <p>{reading.pages} 页</p>
            </article>
          ))}
        </div>
      </> : <p>{preview.loading ? "正在载入备考经验。" : "暂时没有可在线阅读的经验帖全文。"}</p>}
    </section>
  );
}
