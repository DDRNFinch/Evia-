(()=>{
"use strict";
const VERSION=240;
const meta=document.querySelector('meta[name="evia-app-version"]');
if(meta)meta.setAttribute("content",String(VERSION));
window.EviaAppVersion=240;
})();
