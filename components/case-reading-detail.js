import Link from "next/link";
import CaseReturnLink from "@/components/case-return-link";
import LearningContextLink from "@/components/learning-context-link";

export default function CaseReadingDetail({ caseItem, source, hasPdf, learningLinks, sourceNote }) {
  const pdfUrl = `/pdfs/${encodeURIComponent(source.file)}`;
  const isSample = caseItem.id === "case-0012";
  const studyUrl = `/cases/${caseItem.id}/study/`;
  return (
    <div className="editorial-width page-stack pilot-detail">
      <div className="case-detail-back-row">
        <CaseReturnLink studyUrl={studyUrl} />
        <Link href={`/community/?case=${caseItem.id}`}>围绕本案例提问</Link>
      </div>
      <header className="editorial-panel pilot-detail-header">
        <p className="pilot-case-number">{caseItem.caseNumber} · {caseItem.courtName} · {caseItem.judgmentDate}</p>
        <h1 title={caseItem.title}>{caseItem.title}</h1>
        {isSample && <p>商铺交付后，产权登记面积比合同约定少 5.61 平方米。合同正文和附件约定了不同的结算办法。哪一条约定决定应退多少房款？</p>}
        {sourceNote && <p role="note">{sourceNote}</p>}
        <div className="pilot-actions" id="case-preview">
          <LearningContextLink carrySource className="btn btn-primary" href={studyUrl}>开始案例研习</LearningContextLink>
          {hasPdf && <a className="btn btn-outline" href={pdfUrl} target="_blank" rel="noreferrer">打开原件 PDF ↗</a>}
        </div>
      </header>
      {learningLinks.length > 0 && <section className="editorial-panel pilot-concepts" aria-labelledby="pilot-concepts">
        <h2 id="pilot-concepts">用法理读本案</h2>
        {isSample && <>
        <article>
          <h3>同一项交付义务，为何会产生两种退款主张？</h3>
          <p>买受人已经付清购房款，开发商交付的商铺登记面积为 50.68 平方米，比合同约定的 56.29 平方米少 5.61 平方米。买受人请求按照正文列出的面积误差规则，就超过 3% 的部分双倍返还。开发商则主张依附件六按实际面积结算。合同中的处理规则直接决定买受人可以主张的金额，也决定开发商返还房款的范围。</p>
          <LearningContextLink carrySource href={`${studyUrl}#page=8`}>核对面积和价款（第 8 页） →</LearningContextLink>
        </article>
        <article>
          <h3>法院如何解释正文中的“第 2 种方式”？</h3>
          <p>二审区分了合同第二十一条所写的“第 2 种方式”和条款内关于超过 3% 的子项“（2）”，并比较条文的五个自然段。前四段列出一套处理规则，第五段记载双方自行约定。法院又用另一已生效案件的合同文本核对漏印的序号，确认“第 2 种方式”指向双方自行约定的附件六。</p>
          <p>确定适用附件后，二审按少交付的 5.61 平方米乘以单价 49,407.16 元计算，判令返还 277,174 元及判项载明期间的利息。阅读时可标出法院认定条款含义的句子，以及据此计算退款金额的句子。</p>
          <LearningContextLink carrySource href={`${studyUrl}#page=7`}>阅读条款解释（第 7 至 8 页） →</LearningContextLink>
        </article>
        <article>
          <h3>从买受人一方出发，怎样质疑这一解释？</h3>
          <p>可以围绕签约时买受人拿到的文本提出质疑：正文究竟能否独立表明选中了附件六？另一份合同可以佐证通用文本的编号，但它对本案当事人的约定有多大证明力？比较双方可以分别依赖哪些合同文字和证据，再说明在约定含义仍无法确定的情况下，需要继续查什么依据。</p>
          <p>对读两处对类案的使用：第 7 页用其他合同文本核对序号，第 8 页则讨论已有生效判决如何处理面积差异。试着说明两处证据各自解决了什么问题。</p>
        </article>
        </>}
        {learningLinks.map(learningLink => (
          <article key={learningLink.topicId}>
            {!isSample && <>
              <h3>{learningLink.topic.title}</h3>
              <p>{learningLink.reason}</p>
              <p>{learningLink.question}</p>
              <p>{learningLink.evidence}</p>
            </>}
            <div className="pilot-actions">
              <LearningContextLink carrySource href={`${studyUrl}#page=${learningLink.pages[0]}`}>带着问题读第 {learningLink.pages[0]} 页 →</LearningContextLink>
              <Link href={`/knowledge/#${learningLink.topic.id}`}>复习{learningLink.topic.title} →</Link>
              <Link href={`/cases/?topic=${learningLink.topic.id}`}>查看相关案例 →</Link>
            </div>
          </article>
        ))}
      </section>}
    </div>
  );
}
