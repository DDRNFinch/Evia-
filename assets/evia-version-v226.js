(()=>{
"use strict";
const VERSION=226;
const meta=document.querySelector('meta[name="evia-app-version"]');if(meta)meta.setAttribute("content","226");window.EviaAppVersion=226;
if(!document.querySelector('link[data-evia-pulse-v226]')){const link=document.createElement("link");link.rel="stylesheet";link.href="./assets/evia-pulse-v226.css?v=226";link.dataset.eviaPulseV226="1";document.head.appendChild(link)}
if(!document.querySelector('script[data-evia-pulse-v226]')){const script=document.createElement("script");script.src="./assets/evia-pulse-v226.js?v=226";script.dataset.eviaPulseV226="1";script.async=false;document.head.appendChild(script)}
})();
