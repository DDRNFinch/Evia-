(()=>{
"use strict";
const VERSION=229;
const meta=document.querySelector('meta[name="evia-app-version"]');if(meta)meta.setAttribute("content","229");window.EviaAppVersion=229;
if(!document.querySelector('link[data-evia-pulse-faces-v229]')){const link=document.createElement("link");link.rel="stylesheet";link.href="./assets/evia-pulse-faces-v229.css?v=229";link.dataset.eviaPulseFacesV229="1";document.head.appendChild(link)}
})();
