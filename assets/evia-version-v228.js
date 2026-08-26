(()=>{
"use strict";
const VERSION=228;
const meta=document.querySelector('meta[name="evia-app-version"]');if(meta)meta.setAttribute("content","228");window.EviaAppVersion=228;
if(!document.querySelector('link[data-evia-pulse-faces-v228]')){const link=document.createElement("link");link.rel="stylesheet";link.href="./assets/evia-pulse-faces-v228.css?v=228";link.dataset.eviaPulseFacesV228="1";document.head.appendChild(link)}
})();
