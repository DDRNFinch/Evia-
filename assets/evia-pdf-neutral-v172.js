(()=>{
"use strict";
const VERSION=172,nativeEncode=TextEncoder.prototype.encode;
if(window.__eviaPdfNeutralV172)return;window.__eviaPdfNeutralV172=true;
TextEncoder.prototype.encode=function(input){
  let text=String(input??"");
  if(text.includes("Made with Evia - Apprentice Assistant")||text.includes("0.99 0.98 0.94 rg")||text.includes("1 0.95 0.70 rg")){
    text=text
      .replaceAll("0.99 0.98 0.94 rg","0.975 0.975 0.975 rg")
      .replaceAll("1 0.95 0.70 rg","0.93 0.93 0.93 rg")
      .replaceAll("0.95 0.94 0.90 rg","0.94 0.94 0.94 rg")
      .replaceAll("0.90 0.88 0.80 RG","0.82 0.82 0.82 RG")
      .replaceAll("0.91 0.90 0.86 RG","0.86 0.86 0.86 RG")
  }
  return nativeEncode.call(this,text)
};
window.EviaPdfNeutral=Object.freeze({version:VERSION});
})();