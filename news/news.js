(function(){
  var CATS=["Technology", "Online visibility", "Funding", "Business operations", "Regulatory"];
  var MAX=5;
  var MONTHS=["January","February","March","April","May","June","July","August","September","October","November","December"];
  function fmt(d){var m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(d||"");if(!m)return d||"";var mi=parseInt(m[2],10)-1;if(mi<0||mi>11)return d;return MONTHS[mi]+" "+parseInt(m[3],10)+", "+m[1];}
  function el(t,c,x){var e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e;}
  function okUrl(u){return typeof u==="string"&&/^https?:\/\//i.test(u);}
  function valid(s){
    if(!s||typeof s!=="object")return false;
    var req=["headline","category","published","summary","whyItMatters","nextStep","sourceUrl","lastVerified"];
    for(var i=0;i<req.length;i++){if(typeof s[req[i]]!=="string"||!s[req[i]].trim())return false;}
    return CATS.indexOf(s.category)>-1&&okUrl(s.sourceUrl);
  }
  function clean(list){return (Array.isArray(list)?list:[]).filter(function(s){var v=valid(s);if(!v&&window.console)console.warn("News story skipped: missing or invalid fields",s&&(s.id||s.headline));return v;});}
  function sortNew(list){return list.slice().sort(function(a,b){return a.published<b.published?1:a.published>b.published?-1:0;});}
  function key(s){return s.sourceUrl.replace(/\/+$/,"").toLowerCase();}
  function box(h,t){var b=el("div","box");b.appendChild(el("h3",null,h));b.appendChild(el("p",null,t));return b;}
  function card(s,opts){
    opts=opts||{};
    var a=el("article","story");
    var top=el("div","top");
    var c=el("a","cat",s.category);c.href="/news/archive/?category="+encodeURIComponent(s.category);c.title="Browse all "+s.category+" stories";top.appendChild(c);
    var d=el("span","date","Published "+fmt(s.published));
    if(opts.featured)d.appendChild(el("span","pill","Featured now"));
    top.appendChild(d);a.appendChild(top);
    a.appendChild(el("h2",null,s.headline));
    a.appendChild(el("p","sum",s.summary));
    var pair=el("div","pair");pair.appendChild(box("Why it matters to owners",s.whyItMatters));pair.appendChild(box("A practical next step",s.nextStep));a.appendChild(pair);
    var f=el("div","foot");
    var l=el("a",null,"Read the original"+(s.sourceName?": "+s.sourceName:""));l.href=s.sourceUrl;l.target="_blank";l.rel="noopener noreferrer";
    l.appendChild(el("span","vh"," (opens in a new tab)"));
    f.appendChild(l);
    f.appendChild(el("span",null,"Last verified: "+fmt(s.lastVerified)));
    a.appendChild(f);return a;
  }
  function emptyBox(title,text,archiveLink){
    var d=el("div","empty");
    d.appendChild(el("h2",null,title));
    d.appendChild(el("p",null,text));
    var acts=el("div","acts");
    if(archiveLink){var a0=el("a","btn","Browse all news");a0.href="/news/archive/";acts.appendChild(a0);}
    var a1=el("a","btn ghost","Browse the guides");a1.href="/learn/";acts.appendChild(a1);
    var a2=el("a","btn ghost","See resources");a2.href="/resources/";acts.appendChild(a2);
    d.appendChild(acts);return d;
  }
  function getJSON(url){return fetch(url,{cache:"no-cache"}).then(function(r){if(!r.ok)throw new Error(r.status);return r.json();});}
  window.TFINews={CATS:CATS,MAX:MAX,fmt:fmt,el:el,valid:valid,clean:clean,sortNew:sortNew,key:key,card:card,emptyBox:emptyBox,getJSON:getJSON};
})();
