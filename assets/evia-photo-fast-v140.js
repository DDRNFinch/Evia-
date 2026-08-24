(()=>{
"use strict";
const VERSION=172,nativeToBlob=HTMLCanvasElement.prototype.toBlob;
if(typeof nativeToBlob!=="function"||window.__eviaPhotoFastV172)return;
window.__eviaPhotoFastV172=true;
HTMLCanvasElement.prototype.toBlob=function(callback,type,quality){
  try{
    const photoCapture=document.querySelector(".evia-stage-overlay-v132.evia-photo-mode-v137"),isJpeg=!type||String(type).toLowerCase()==="image/jpeg";
    if(!photoCapture||!isJpeg)return nativeToBlob.call(this,callback,type,quality);
    const source=this,longest=Math.max(Number(source.width)||0,Number(source.height)||0),target=Math.min(1024,longest||1024),scale=longest>target?target/longest:1,w=Math.max(1,Math.round(source.width*scale)),h=Math.max(1,Math.round(source.height*scale)),q=Math.min(.82,Number.isFinite(Number(quality))?Number(quality):.82);
    if(typeof OffscreenCanvas==="function"&&typeof createImageBitmap==="function"){
      createImageBitmap(source).then(bitmap=>{const off=new OffscreenCanvas(w,h),ctx=off.getContext("2d",{alpha:false,desynchronized:true});if(!ctx)throw Error("ctx");ctx.drawImage(bitmap,0,0,source.width,source.height,0,0,w,h);bitmap.close?.();return off.convertToBlob({type:"image/jpeg",quality:q})}).then(blob=>callback(blob)).catch(error=>{console.debug("Evia offscreen photo fallback",error);nativeToBlob.call(source,callback,"image/jpeg",q)});return
    }
    if(scale<1){const fast=document.createElement("canvas");fast.width=w;fast.height=h;const ctx=fast.getContext("2d",{alpha:false,desynchronized:true});if(ctx){ctx.drawImage(source,0,0,source.width,source.height,0,0,w,h);return nativeToBlob.call(fast,callback,"image/jpeg",q)}}
    return nativeToBlob.call(source,callback,"image/jpeg",q)
  }catch(error){console.debug("Evia fast photo encode fallback",error);return nativeToBlob.call(this,callback,type,quality)}
};
window.EviaPhotoFastV140=Object.freeze({version:VERSION,maxLongEdge:1024,offscreen:true});
})();