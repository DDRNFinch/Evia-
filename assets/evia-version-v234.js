(()=>{
"use strict";
const VERSION=234;
const meta=document.querySelector('meta[name="evia-app-version"]');if(meta)meta.setAttribute("content","234");window.EviaAppVersion=234;
function load(src,key){if(document.querySelector(`script[data-${key}]`))return;const s=document.createElement("script");s.src=src;s.async=false;s.dataset[key]="1";document.head.appendChild(s)}
load("./assets/evia-review-snapshots-v234.js?v=234","eviaReviewSnapshotsV234");
load("./assets/evia-review-snapshot-hook-v234.js?v=234","eviaReviewSnapshotHookV234");
})();
