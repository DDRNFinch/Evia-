(()=>{
"use strict";
const nativeToBlob=HTMLCanvasElement.prototype.toBlob;
if(typeof nativeToBlob!=="function"||window.__eviaPhotoFastV140)return;
window.__eviaPhotoFastV140=true;
HTMLCanvasElement.prototype.toBlob=function(callback,type,quality){
  try{
    const photoCapture=document.querySelector(".evia-stage-overlay-v132.evia-photo-mode-v137");
    const isJpeg=!type||String(type).toLowerCase()==="image/jpeg";
    const longest=Math.max(Number(this.width)||0,Number(this.height)||0);
    if(!photoCapture||!isJpeg||longest<=1280)return nativeToBlob.call(this,callback,type,quality);
    const scale=1280/longest,w=Math.max(1,Math.round(this.width*scale)),h=Math.max(1,Math.round(this.height*scale));
    const fast=document.createElement("canvas");fast.width=w;fast.height=h;
    const ctx=fast.getContext("2d",{alpha:false,desynchronized:true});
    if(!ctx)return nativeToBlob.call(this,callback,type,quality);
    ctx.drawImage(this,0,0,this.width,this.height,0,0,w,h);
    return nativeToBlob.call(fast,callback,"image/jpeg",Math.min(.82,Number.isFinite(Number(quality))?Number(quality):.82));
  }catch(error){
    console.debug("Evia fast photo encode fallback",error);
    return nativeToBlob.call(this,callback,type,quality)
  }
};
window.EviaPhotoFastV140=Object.freeze({version:140,maxLongEdge:1280});
})();
