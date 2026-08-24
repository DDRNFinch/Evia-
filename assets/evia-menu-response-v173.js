(()=>{
"use strict";
const VERSION=173,nativeAnimate=Element.prototype.animate;
if(typeof nativeAnimate!=="function"||window.__eviaMenuResponseV173)return;
window.__eviaMenuResponseV173=true;
Element.prototype.animate=function(keyframes,options){
  let opts=options;
  if(this?.classList?.contains("self-panel")&&options&&typeof options==="object"){
    const duration=Number(options.duration);
    if(duration===85)opts={...options,duration:1};
    else if(duration===145)opts={...options,duration:90}
  }
  return nativeAnimate.call(this,keyframes,opts)
};
window.EviaMenuResponse=Object.freeze({version:VERSION});
})();
