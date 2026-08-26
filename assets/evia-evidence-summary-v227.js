(()=>{
"use strict";
const VERSION=227;
if(window.__eviaEvidenceSummaryV227)return;window.__eviaEvidenceSummaryV227=true;

function cleanPreview(root=document){
  const hosts=[];
  if(root?.matches?.("[data-preview-details]"))hosts.push(root);
  root?.querySelectorAll?.("[data-preview-details]").forEach(host=>hosts.push(host));
  hosts.forEach(host=>{
    [...host.querySelectorAll(".evia-evidence-preview-detail-v191")].forEach(detail=>{
      const label=detail.querySelector("b")?.textContent?.trim()||"";
      if(label!=="Learner explanation")detail.remove();
    });
  });
}

function simplifyPdfText(input){
  let text=String(input??"");
  if(!text.includes("Made with Evia - Apprentice Assistant"))return text;
  const lines=text.split("\n"),out=[];
  let skipPromptBody=false,skipTimestamps=false;
  for(const line of lines){
    if(line.includes("(Evidence prompt) Tj")){skipPromptBody=true;continue}
    if(skipPromptBody&&line.startsWith("BT /F1 ")){skipPromptBody=false;continue}
    skipPromptBody=false;
    if(line.includes("(Prompt timestamps) Tj")){skipTimestamps=true;continue}
    if(skipTimestamps){
      if(/^BT \/F1 .*\(\d{2}:\d{2} - /.test(line))continue;
      skipTimestamps=false;
    }
    if(/^BT \/F1 .*\(Evidence stage:/.test(line))continue;
    out.push(line.replace("(Learner text) Tj","(Learner explanation) Tj"));
  }
  return out.join("\n");
}

const previousEncode=TextEncoder.prototype.encode;
TextEncoder.prototype.encode=function(input){return previousEncode.call(this,simplifyPdfText(input))};

const observer=new MutationObserver(records=>{
  for(const record of records)for(const node of record.addedNodes||[])if(node?.nodeType===1)cleanPreview(node);
});
function start(){cleanPreview(document);observer.observe(document.body,{childList:true,subtree:true})}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
window.EviaEvidenceSummary=Object.freeze({version:VERSION,simplifyPdfText,cleanPreview});
})();
