(()=>{
"use strict";
const VERSION=201,Z=110000,STYLE_ID="evia-functional-skills-v196-foreground";
function ensureStyle(){if(document.getElementById(STYLE_ID))return;const style=document.createElement("style");style.id=STYLE_ID;style.textContent=`.evia-fs194-layer{z-index:${Z}!important}`;document.head.appendChild(style)}
function elevate(root=document){root.querySelectorAll?.(".evia-fs194-layer").forEach(layer=>layer.style.setProperty("z-index",String(Z),"important"));if(root.matches?.(".evia-fs194-layer"))root.style.setProperty("z-index",String(Z),"important")}
function start(){ensureStyle();elevate()}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
window.EviaFunctionalSkillsForeground=Object.freeze({version:VERSION,zIndex:Z,elevate});
})();
