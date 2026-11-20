#!/usr/bin/env python3
"""对照 PDF 首页显式元数据及已记录的正文更正证据。"""
import hashlib,json,re,subprocess,unicodedata
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def normalize(s):return re.sub(r'\s+','',unicodedata.normalize('NFKC',str(s)))
def run():
 rows=json.loads((ROOT/'data/generated/cases-extracted.json').read_text());result={};counts={}
 by={row['case_id']:row for row in rows}
 body_corrections={}
 for item in json.loads((ROOT/'content/case-field-corrections.json').read_text())['changes']:
  row=by[item['caseId']];pdf=ROOT/'public/pdfs'/item['sourceFile']
  assert row[item['field']]==item['value'] and row['pdf_file']==item['sourceFile'],item['caseId']
  assert hashlib.sha256(pdf.read_bytes()).hexdigest()==item['sourceSha256'],item['caseId']
  page=subprocess.check_output(['pdftotext','-f',str(item['page']),'-l',str(item['page']),'-layout',str(pdf),'-']).decode()
  assert normalize(item['quote']) in normalize(page),item['caseId']
  if item['page']>1:
   body_corrections[item['caseId'], item['field']]=item

 for row in rows:
  pdf=ROOT/'public/pdfs'/row['pdf_file'];text=subprocess.check_output(['pdftotext','-f','1','-l','1','-layout',str(pdf),'-']).decode();fields={}
  for key,label in [('case_number',r'案\s*号'),('court_name','审理法院'),('doc_type','文书类型'),('procedure','审理程序')]:
   match=re.search(label+r'\s*[:：]\s*([^\n]+)',text)
   actual=match.group(1).strip() if match else ''
   status='matched' if actual and normalize(actual)==normalize(row[key]) else 'conflict' if actual else 'not-located'
   note=''
   if status=='conflict':
    alias=actual.replace('地区（市）','市').replace('区（县）','区').removesuffix(' 注')
    if key=='court_name' and normalize(alias)==normalize(row[key]):status='equivalent';note='数据库历史区划别名或脚注，与正文名称一致。'
    elif key=='case_number' and normalize(actual.removesuffix('经济判决'))==normalize(row[key]):status='equivalent';note='来源字段带文书类型后缀，案号一致。'
    elif key=='procedure' and ((row[key]=='一审' and actual=='简易程序') or (row['case_id']=='case-0146' and actual=='国家赔偿')):status='different-axis';note='审级与程序类型为不同维度；按本案一审/二审保留，不直接互换。'
   body_correction=body_corrections.get((row['case_id'], key))
   if body_correction and status=='not-located':
    fields[key]={'note':body_correction['reason'],'status':'matched','currentValue':row[key],'sourceValue':body_correction['value'],'page':body_correction['page']}
    status='matched'
   else:
    fields[key]={'note':note,'status':status,'currentValue':row[key],'sourceValue':actual,'page':1 if actual else None}
   counts[f'{key}:{status}']=counts.get(f'{key}:{status}',0)+1
  laws=json.loads(row['laws_json']) if isinstance(row.get('laws_json'),str) and row['laws_json'] else row.get('laws_json',[])
  result[row['case_id']]={'sourceFile':row['pdf_file'],'sourceSha256':hashlib.sha256(pdf.read_bytes()).hexdigest(),'fields':fields,'teachingContentStatus':'教学提炼，未经逐段教师审阅；不作为裁判原话','originalNormCount':len(laws)}
 target=ROOT/'content/case-field-audit.json';target.write_text(json.dumps({'scope':'核对首页显式案号、法院、文书类型、程序，以及已登记并核对的正文更正。未定位不表示错误；原文未标明时不推定。','cases':result},ensure_ascii=False,indent=2)+'\n')
 print(json.dumps(counts,ensure_ascii=False));
 for id,item in result.items():
  for key,f in item['fields'].items():
   if f['status']=='conflict':print(id,key,f['currentValue'],'->',f['sourceValue'])
if __name__=='__main__':run()
