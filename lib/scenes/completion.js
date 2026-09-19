export function sceneMissing(script,scene={},through=6){
 const materials=script.materials.filter(item=>!item.roles||item.roles.includes(scene.role));
 const missing=[];const has=value=>typeof value==='string'&&value.trim().length>0;
 if(!script.roles.some(role=>role.id===scene.role))missing.push('选择角色');
 if(through>=2){if(!Array.isArray(scene.materialIds)||!scene.materialIds.length||scene.materialIds.some(id=>!materials.some(item=>item.id===id)))missing.push('选择有效材料');if(!has(scene.informationGap))missing.push('待确认的信息');}
 if(through>=3){if(!has(scene.issue))missing.push('争点');if(!has(scene.considerationA)||!has(scene.considerationB)||scene.considerationA.trim()===scene.considerationB.trim())missing.push('两项不同的冲突考虑');}
 if(through>=4){if(!has(scene.initialProposal))missing.push('初稿方案');if(!has(scene.initialReason))missing.push('初稿理由');if(!materials.some(item=>item.id===scene.materialCitation))missing.push('材料关联');}
 if(through>=5){if(!has(scene.response))missing.push('回应实质异议');if(!has(scene.alternative))missing.push('替代方案');}
 if(through>=6){for(const [key,label] of [['finalProposal','最终方案'],['revisionReason','修改或保留理由'],['reflection','反思']])if(!has(scene[key]))missing.push(label);}
 return missing;
}
