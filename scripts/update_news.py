#!/usr/bin/env python3
import json, re, urllib.parse, urllib.request, xml.etree.ElementTree as ET
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]; OUT=ROOT/"data/news.json"
UA={"User-Agent":"Mozilla/5.0 SemiAIRadar/1.0"}
queries=[
 ("Semiconductor manufacturing","semiconductor manufacturing equipment OR fab when:7d"),
 ("AI & chips","AI chips NVIDIA AMD accelerator semiconductor when:7d"),
 ("Packaging","advanced packaging HBM hybrid bonding semiconductor when:14d"),
 ("Equipment","Lam Research Applied Materials ASML KLA Tokyo Electron semiconductor when:14d"),
 ("Foundries","TSMC Intel Samsung foundry process node semiconductor when:14d"),
 ("Research","imec semiconductor research transistor lithography packaging when:14d"),
]
companies=["Lam Research","Applied Materials","ASML","KLA","Tokyo Electron","TSMC","Samsung","Intel","NVIDIA","AMD","Micron","SK hynix","imec","Kioxia"]
def clean(s): return re.sub(r"\s+"," ",re.sub(r"<[^>]+>","",s or "")).strip()
def tags_for(t):
 x=t.lower(); tags=[]
 rules=[("Advanced Packaging",["packag","hybrid bond","chiplet","interposer","2.5d","3d ic"]),("Memory",["hbm","dram","nand","memory","sk hynix","micron"]),("Equipment",["lam research","applied materials","asml","kla","tokyo electron","equipment","euv"]),("AI & Compute",["ai ","nvidia","amd","accelerator","gpu","compute"]),("Foundries",["tsmc","foundry","intel","samsung"]),("Materials",["material","photoresist","substrate","wafer"]),("Manufacturing",["fab","manufactur","process","etch","deposition","lithograph","metrology"]),("Research",["research","imec","paper","study"]),("Business",["revenue","earnings","market","investment","sales","export"])]
 for tag,keys in rules:
  if any(k in x for k in keys): tags.append(tag)
 return tags or ["Semiconductor"]
def why_for(tags,title):
 if "Advanced Packaging" in tags:return "Advanced packaging is becoming a primary scaling lever for AI, connecting logic and high-bandwidth memory while attacking bandwidth, latency and power bottlenecks."
 if "Memory" in tags:return "AI accelerators are increasingly memory-bound, so HBM/DRAM/NAND capacity, architecture and process advances can materially affect system performance and the semiconductor equipment cycle."
 if "Equipment" in tags:return "Equipment changes often reveal where chipmakers are encountering new process limits. They can signal upcoming inflections in etch, deposition, lithography, metrology or packaging."
 if "Foundries" in tags:return "Foundry capacity and process-node progress determine when new chip architectures can move from design into high-volume manufacturing."
 if "AI & Compute" in tags:return "AI compute demand is reshaping semiconductor roadmaps across logic, memory, packaging, networking and fab investment."
 if "Research" in tags:return "Research developments can indicate the technologies that may move into future process nodes, equipment requirements and commercial roadmaps."
 return "This development may affect semiconductor technology roadmaps, capacity, supply chains or the economics of building next-generation chips."
def fetch(q):
 url="https://news.google.com/rss/search?"+urllib.parse.urlencode({"q":q,"hl":"en-US","gl":"US","ceid":"US:en"})
 req=urllib.request.Request(url,headers=UA)
 with urllib.request.urlopen(req,timeout=20) as r: root=ET.fromstring(r.read())
 out=[]
 for item in root.findall(".//item")[:18]:
  title=clean(item.findtext("title")); link=clean(item.findtext("link")); pub=clean(item.findtext("pubDate"))
  src=item.find("source"); source=clean(src.text if src is not None else "")
  try: dt=parsedate_to_datetime(pub).astimezone(timezone.utc).isoformat()
  except: dt=datetime.now(timezone.utc).isoformat()
  # Google News titles often end in " - Publisher"
  if source and title.endswith(" - "+source): title=title[:-(len(source)+3)]
  tags=tags_for(title+" "+source)
  cos=[c for c in companies if c.lower() in title.lower()]
  out.append({"title":title,"source":source or "News","date":dt,"url":link,"tags":tags,"companies":cos,"summary":"","why":why_for(tags,title)})
 return out
data=json.loads(OUT.read_text(encoding="utf-8"))
existing=data.get("stories",[])
fresh=[]
for _,q in queries:
 try:fresh.extend(fetch(q))
 except Exception as e: print("feed failed",q,e)
# De-dupe by normalized title; prefer curated existing record when same title.
seen=set(); merged=[]
for s in existing+fresh:
 key=re.sub(r"\W+","",s["title"].lower())[:100]
 if key in seen: continue
 seen.add(key); merged.append(s)
merged.sort(key=lambda s:s.get("date",""),reverse=True)
data["stories"]=merged[:120]
data["updated_at"]=datetime.now(timezone.utc).isoformat()
OUT.write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding="utf-8")
print("Wrote",len(data["stories"]),"stories")
