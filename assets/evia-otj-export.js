(()=>{
"use strict";
const VERSION=156,OTJ_KEY="evia-otj-entries",GLH_KEY="evia-glh-entries",NAME_KEY="evia-full-name";
const OriginalBlob=window.Blob,enc=new TextEncoder();
let pending=null;
function read(key){try{const x=JSON.parse(localStorage.getItem(key)||"[]");return Array.isArray(x)?x:[]}catch{return[]}}
function write(key,x){try{localStorage.setItem(key,JSON.stringify(x))}catch{}}
function clean(s){return String(s??"").replace(/[’‘]/g,"'").replace(/[“”]/g,'"').replace(/[–—]/g,"-").replace(/[^\x20-\x7E]/g," ").replace(/\\/g,"\\\\").replace(/\(/g,"\\(").replace(/\)/g,"\\)")}
function wrap(s,max=82){const words=clean(s).split(/\s+/).filter(Boolean),out=[];let line="";for(const w of words){if(!line)line=w;else if((line+" "+w).length<=max)line+=" "+w;else{out.push(line);line=w}}if(line)out.push(line);return out.length?out:[""]}
function fmtDate(v){if(!v)return"";const d=new Date(`${v}T12:00:00`);return Number.isNaN(d.getTime())?String(v):d.toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"})}
function mins(e){if(Number.isFinite(Number(e?.durationMinutes)))return Math.max(0,Math.round(Number(e.durationMinutes)));return Math.max(0,Math.round((Number(e?.hours)||0)*60))}
function fmtMins(n){n=Math.max(0,Math.round(n||0));const h=Math.floor(n/60),m=n%60;return m?`${h}h ${m}m`:`${h}h`}
function concat(parts){const xs=parts.map(p=>p instanceof Uint8Array?p:new Uint8Array(p)),total=xs.reduce((n,p)=>n+p.length,0),out=new Uint8Array(total);let at=0;xs.forEach(p=>{out.set(p,at);at+=p.length});return out}
function text(lines,x,y,size=9,leading=12,bold=false){let s=`BT /${bold?"F2":"F1"} ${size} Tf ${x} ${y} Td `;lines.forEach((line,i)=>{if(i)s+=`0 -${leading} Td `;s+=`(${clean(line)}) Tj `});return s+"ET\n"}
function profile(kind){return kind==="glh"?{kind:"glh",key:GLH_KEY,short:"GLH",title:"Evia guided learning hours",filename:"Evia-GLH.pdf",codeLabel:"ACs"}:{kind:"otj",key:OTJ_KEY,short:"OTJ",title:"Evia off-the-job learning",filename:"Evia-Off-the-Job.pdf",codeLabel:"KSBs"}}
function makePdf(entries,p){
  const learner=(localStorage.getItem(NAME_KEY)||"Learner").trim()||"Learner",total=entries.reduce((n,e)=>n+mins(e),0),lines=[];
  lines.push({t:p.title,b:true,s:16,g:20},{t:`Learner: ${learner}`,s:9,g:14},{t:`Overall ${p.short} since last download`,b:true,s:10,g:14},{t:fmtMins(total),b:true,s:20,g:25},{t:`${entries.length} new learning record${entries.length===1?"":"s"}`,s:9,g:18},{t:"",g:8});
  entries.slice().sort((a,b)=>String(a.date||"").localeCompare(String(b.date||""))).forEach((e,i)=>{
    lines.push({t:`${i+1}. ${fmtDate(e.date)} · ${fmtMins(mins(e))}`,b:true,s:10,g:13});
    lines.push({t:`Type: ${e.type||"Learning"}`,s:8.5,g:11});
    const subject=String(e.subject||e.topic||e.area||"").trim();if(subject)lines.push({t:`Subject: ${subject}`,s:8.5,g:11});
    const area=String(e.area||"").trim(),topic=String(e.topic||"").trim();if(area&&topic&&topic!==subject)lines.push({t:`Area: ${area} - ${topic}`,s:8.5,g:11});
    const codes=Array.isArray(e.codes)?e.codes.join(" · "):"";if(codes)lines.push({t:`${p.codeLabel}: ${codes}`,s:8.5,g:11});
    wrap(`What I learned: ${e.learning||e.learned||e.description||e.whatLearned||""}`,86).forEach(t=>lines.push({t,s:8.5,g:11}));
    lines.push({t:"",g:8});
  });
  const pages=[];let current=[],used=0;const max=690;
  for(const l of lines){const gap=l.g||12;if(current.length&&used+gap>max){pages.push(current);current=[];used=0}current.push(l);used+=gap}if(current.length)pages.push(current);
  const objs=[null,null,null,null,null];objs[3]=enc.encode("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");objs[4]=enc.encode("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>");let next=5;const pageIds=[];
  pages.forEach((page,pi)=>{let y=800,content="";page.forEach(l=>{content+=text([l.t],40,y,l.s||9,l.g||12,!!l.b);y-=l.g||12});content+=text([`Page ${pi+1} of ${pages.length}`],40,24,7,9,false);const bytes=enc.encode(content),cid=next++;objs[cid]=enc.encode(`<< /Length ${bytes.length} >>\nstream\n${content}\nendstream`);const pid=next++;objs[pid]=enc.encode(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${cid} 0 R >>`);pageIds.push(pid)});
  objs[1]=enc.encode("<< /Type /Catalog /Pages 2 0 R >>");objs[2]=enc.encode(`<< /Type /Pages /Kids [${pageIds.map(id=>`${id} 0 R`).join(" ")}] /Count ${pageIds.length} >>`);
  const parts=[enc.encode("%PDF-1.4\n")],offsets=[0];let offset=parts[0].length;
  for(let i=1;i<objs.length;i++){if(!objs[i])continue;offsets[i]=offset;const obj=concat([enc.encode(`${i} 0 obj\n`),objs[i],enc.encode("\nendobj\n")]);parts.push(obj);offset+=obj.length}
  const xrefAt=offset;let xref=`xref\n0 ${objs.length}\n0000000000 65535 f \n`;for(let i=1;i<objs.length;i++)xref+=objs[i]?`${String(offsets[i]).padStart(10,"0")} 00000 n \n`:`0000000000 65535 f \n`;xref+=`trailer\n<< /Size ${objs.length} /Root 1 0 R >>\nstartxref\n${xrefAt}\n%%EOF`;parts.push(enc.encode(xref));return concat(parts)
}
function le16(v){return new Uint8Array([v&255,(v>>>8)&255])}
function le32(v){return new Uint8Array([v&255,(v>>>8)&255,(v>>>16)&255,(v>>>24)&255])}
function u16(a,o){return a[o]|(a[o+1]<<8)}
function u32(a,o){return(a[o]|(a[o+1]<<8)|(a[o+2]<<16)|(a[o+3]<<24))>>>0}
function crc32(d){let c=0xffffffff;for(const b of d){c^=b;for(let j=0;j<8;j++)c=(c>>>1)^(0xedb88320&-(c&1))}return(c^0xffffffff)>>>0}
function appendStored(parts,name,data){
  if(!Array.isArray(parts)||parts.length<3)return parts;const local=parts[0] instanceof Uint8Array?parts[0]:new Uint8Array(parts[0]),central=parts[1] instanceof Uint8Array?parts[1]:new Uint8Array(parts[1]),eocd=parts[2] instanceof Uint8Array?parts[2]:new Uint8Array(parts[2]);
  if(eocd.length<22||u32(eocd,0)!==0x06054b50)return parts;
  const count=u16(eocd,10),centralOffset=u32(eocd,16);if(centralOffset!==local.length)return parts;
  const n=enc.encode(name),cr=crc32(data),l=concat([le32(0x04034b50),le16(20),le16(0),le16(0),le16(0),le16(0),le32(cr),le32(data.length),le32(data.length),le16(n.length),le16(0),n,data]);
  const c=concat([le32(0x02014b50),le16(20),le16(20),le16(0),le16(0),le16(0),le16(0),le32(cr),le32(data.length),le32(data.length),le16(n.length),le16(0),le16(0),le16(0),le16(0),le32(0),le32(local.length),n]);
  const newLocalLength=local.length+l.length,newCentralLength=central.length+c.length,newCount=count+1,newEnd=concat([le32(0x06054b50),le16(0),le16(0),le16(newCount),le16(newCount),le32(newCentralLength),le32(newLocalLength),le16(0)]);
  return[local,l,central,c,newEnd];
}
function EviaBlob(parts,options){
  let next=parts;const type=String(options?.type||"").toLowerCase();
  if(type==="application/zip"&&pending?.pdf?.length&&!pending.injected){try{next=appendStored(parts,pending.filename,pending.pdf);pending.injected=next!==parts}catch{}}
  return new OriginalBlob(next,options);
}
EviaBlob.prototype=OriginalBlob.prototype;try{Object.setPrototypeOf(EviaBlob,OriginalBlob)}catch{};window.Blob=EviaBlob;
function prepare(kind){const p=profile(kind),entries=read(p.key).filter(e=>!e.downloadedAt);pending=entries.length?{key:p.key,ids:entries.map(e=>e.id),filename:p.filename,pdf:makePdf(entries,p),injected:false}:null}
function mark(){if(!pending?.injected)return;const ids=new Set(pending.ids),stamp=Date.now();write(pending.key,read(pending.key).map(e=>ids.has(e.id)?{...e,downloadedAt:stamp}:e));pending=null}
function courseKind(){const c=window.EviaCourseContext?.current?.()||{};return c.courseType==="nvq"?"glh":"otj"}
document.addEventListener("click",e=>{const b=e.target.closest?.("[data-sign-download],[data-nvq-pack-download]");if(!b||b.disabled)return;prepare(b.matches("[data-nvq-pack-download]")?"glh":courseKind())},true);
document.addEventListener("click",e=>{const a=e.target.closest?.("a[download]");if(!a||!pending?.injected)return;const name=String(a.getAttribute("download")||"");if(name.startsWith("Evia-New-Evidence-")||name.startsWith("Evia-NVQ-Evidence-Packs-"))mark()},true);
window.EviaLearningPackExport=Object.freeze({version:VERSION});
})();
