import StudyGuideBriefing from "@/components/study-guide-briefing";
import StudyWorkspace from "@/components/study-workspace";

export default function StudyGuideShell({ caseItem, userSid }) {
  return (
    <div className="study-guide-shell fade-in">
      <StudyGuideBriefing caseItem={caseItem} />
      <div className="study-guide-workspace">
        <StudyWorkspace caseItem={caseItem} userSid={userSid} hasPdf={false} mode="guide" />
      </div>
    </div>
  );
}
