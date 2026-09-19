"""只提取账号所需字段，冲突隔离；输出须保存到名单的私有目录。"""
import argparse,json,os,re
from pathlib import Path
from collections import defaultdict
from openpyxl import load_workbook
parser=argparse.ArgumentParser();parser.add_argument('source');parser.add_argument('output');args=parser.parse_args()
records=defaultdict(list);issues=[]
for file in sorted(Path(args.source).glob('*.xlsx')):
 book=load_workbook(file,read_only=True,data_only=True)
 for sheet in book:
  columns=None
  for row in sheet.iter_rows():
   if columns is None:
    labels={re.sub(r'\s+','',str(cell.value)):index for index,cell in enumerate(row) if cell.value is not None}
    if '学号' in labels and '姓名' in labels:columns=labels
    continue
   sid=row[columns['学号']].value;name=row[columns['姓名']].value
   if sid is None and name is None:continue
   if isinstance(sid,float) and sid.is_integer():sid=int(sid)
   sid=str(sid).strip() if sid is not None else ''
   group=row[columns['班级']].value if '班级' in columns else sheet.title
   item={'loginId':sid,'displayName':str(name).strip() if name else '', 'groupName':re.sub(r'\s+','',str(group)) if group else '', 'source':{'file':file.name,'sheet':sheet.title,'row':row[0].row}}
   if not re.fullmatch(r'\d{6,20}',sid) or not item['displayName'] or not item['groupName']:issues.append(item);continue
   records[sid].append(item)
 book.close()
accepted=[];conflicts=[];duplicates=0
for sid,items in records.items():
 if len({(item['displayName'],item['groupName']) for item in items})>1:conflicts.append({'loginId':sid,'records':items})
 else:accepted.append({key:items[0][key] for key in ['loginId','displayName','groupName']});duplicates+=len(items)-1
out=Path(args.output).resolve();repo=Path(__file__).resolve().parent.parent
if out.is_relative_to(repo):raise SystemExit('账号名单输出请放在代码仓库之外。')
out.mkdir(parents=True,exist_ok=True);os.chmod(out,0o700)
for filename,data in [('students.json',{'students':accepted}),('roster-review.json',{'accepted':len(accepted),'deduplicatedRows':duplicates,'conflicts':conflicts,'invalid':issues})]:
 target=out/filename;target.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n');os.chmod(target,0o600)
print(json.dumps({'accepted':len(accepted),'conflictingIds':len(conflicts),'invalidRows':len(issues),'deduplicatedRows':duplicates},ensure_ascii=False))
