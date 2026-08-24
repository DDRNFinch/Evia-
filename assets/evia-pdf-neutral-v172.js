(()=>{
"use strict";
const VERSION=173,nativeEncode=TextEncoder.prototype.encode;
if(window.__eviaPdfNeutralV173)return;window.__eviaPdfNeutralV173=true;
TextEncoder.prototype.encode=function(input){
  let text=String(input??"");
  if(text.includes("Made with Evia - Apprentice Assistant")||text.includes("0.99 0.98 0.94 rg")||text.includes("1 0.95 0.70 rg")){
    text=text
      .replaceAll("0.99 0.98 0.94 rg","0.975 0.975 0.975 rg")
      .replaceAll("1 0.95 0.70 rg","0.93 0.93 0.93 rg")
      .replaceAll("0.95 0.94 0.90 rg","0.94 0.94 0.94 rg")
      .replaceAll("0.90 0.88 0.80 RG","0.82 0.82 0.82 RG")
      .replaceAll("0.91 0.90 0.86 RG","0.86 0.86 0.86 RG");
    if(text.includes("(Evidence prompt) Tj")&&text.includes("(Prompt timestamps) Tj")){
      text=text.replace(/BT \/F2 [^\n]*\(Evidence prompt\) Tj ET\nBT \/F1 [\s\S]*? ET\n(?=BT \/F2 [^\n]*\(Prompt timestamps\) Tj ET\n)/g,"")
    }
  }
  return nativeEncode.call(this,text)
};
window.EviaPdfNeutral=Object.freeze({version:VERSION,promptDedupe:true});
})();