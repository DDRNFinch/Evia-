(()=>{
"use strict";
const VERSION=121;
let observer=null,queued=false;
const canonical=new Map();
function shuffle(items){
  const out=[...items];
  for(let i=out.length-1;i>0;i--){
    let r=Math.random();
    if(globalThis.crypto?.getRandomValues){const a=new Uint32Array(1);crypto.getRandomValues(a);r=a[0]/4294967296}
    const j=Math.floor(r*(i+1));[out[i],out[j]]=[out[j],out[i]]
  }
  return out
}
async function reconcile(){
  queued=false;
  const box=document.querySelector(".evia-arp-layer .evia-arp-options");
  const prompt=document.querySelector(".evia-arp-layer .evia-arp-question")?.textContent?.trim();
  if(!box||!prompt||box.dataset.markingV121==="1")return;
  if(box.dataset.integrity!=="118"){queue(24);return}
  if(box.dataset.qualityV123!=="1"){queue(24);return}
  const buttons=[...box.querySelectorAll(":scope > [data-arp-answer]")];
  if(buttons.length!==4)return;
  try{
    const bank=await window.EviaArp?.currentBank?.();
    const question=bank?.questions?.find(q=>String(q.prompt||"").trim()===prompt);
    if(!question)return;
    let saved=canonical.get(question.id);
    if(!saved){
      const options=[];
      buttons.forEach((button,position)=>{
        const original=Number(button.dataset.arpAnswer);
        if(Number.isInteger(original)&&original>=0&&original<4)options[original]=button.textContent.trim();
        else options[position]=button.textContent.trim()
      });
      const originalCorrect=Number(question.correctIndex);
      saved={options:options.length===4?options:[...question.options],correctOriginal:originalCorrect};
      canonical.set(question.id,saved)
    }
    const order=shuffle(saved.options.map((text,original)=>({text,original})));
    const correct=order.findIndex(item=>item.original===saved.correctOriginal);
    question.options=order.map(item=>item.text);
    question.correctIndex=correct;
    buttons.forEach((button,index)=>{
      button.textContent=order[index].text;
      button.dataset.arpAnswer=String(index);
      button.classList.remove("is-correct","is-wrong");
      button.setAttribute("aria-label",`Option ${String.fromCharCode(65+index)}. ${order[index].text}`)
    });
    box.dataset.markingV121="1"
  }catch(error){console.error("Evia ARP marking reconciliation failed",error)}
}
function queue(delay=0){
  if(queued)return;queued=true;
  if(delay)setTimeout(()=>requestAnimationFrame(reconcile),delay);else requestAnimationFrame(reconcile)
}
function relevant(records){
  return records.some(record=>{
    const target=record.target instanceof Element?record.target:record.target?.parentElement;
    if(target?.closest?.(".evia-arp-layer"))return true;
    return [...record.addedNodes].some(node=>node.nodeType===1&&(node.matches?.(".evia-arp-layer,.evia-arp-options")||node.querySelector?.(".evia-arp-layer,.evia-arp-options")))
  })
}
function verifyAfterAnswer(event){
  const button=event.target.closest?.(".evia-arp-answer[data-arp-answer]");if(!button)return;
  setTimeout(()=>{
    const box=button.closest(".evia-arp-options");if(!box)return;
    const selected=Number(button.dataset.arpAnswer),buttons=[...box.querySelectorAll("[data-arp-answer]")];
    const prompt=document.querySelector(".evia-arp-layer .evia-arp-question")?.textContent?.trim();
    Promise.resolve(window.EviaArp?.currentBank?.()).then(bank=>{
      const q=bank?.questions?.find(item=>String(item.prompt||"").trim()===prompt);if(!q)return;
      buttons.forEach((b,index)=>{b.classList.toggle("is-correct",index===Number(q.correctIndex));if(index!==selected)b.classList.remove("is-wrong")});
      if(selected!==Number(q.correctIndex))button.classList.add("is-wrong");else button.classList.remove("is-wrong")
    }).catch(()=>{})
  },0)
}
function start(){
  queue(30);
  document.addEventListener("click",verifyAfterAnswer,true);
  if(observer)return;observer=new MutationObserver(records=>{if(relevant(records))queue(18)});observer.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:["data-integrity","data-quality-v123"]})
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
window.EviaArpMarking=Object.freeze({version:VERSION,refresh:()=>queue(0)});
})();