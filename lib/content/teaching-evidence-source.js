import annotationData from '../../content/annotation-evidence.json' with { type: 'json' };
import rubricData from '../../content/case-rubric.json' with { type: 'json' };
import normData from '../../content/norm-evidence.json' with { type: 'json' };

export const annotationTasks = annotationData;
export const caseRubrics = rubricData;
export const { normRegistry, normTasks } = normData;
