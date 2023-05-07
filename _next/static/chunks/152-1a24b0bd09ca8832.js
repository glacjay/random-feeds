"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[152],{2253:function(n,t,e){e.d(t,{B1:function(){return M},K4:function(){return S},WX:function(){return k},YM:function(){return I},dQ:function(){return g},fv:function(){return p},jx:function(){return b},tW:function(){return _}});var r=e(1010),i=e(8564),u=e(2267),o=e(567),a=e(4932),l=e(1309),c=e(4586),s=e(414),d=e(7294),f=e(8767),m=e(906),v=e(3437),h=e(2070),g=(0,m.Z)("token"),_=(0,m.Z)("recentlyReadItems");function p(n){return(0,d.useMemo)(function(){return(0,m.Z)("randomItems:".concat(n))},[n])}function b(){var n=(0,l._)(g(),1)[0],t=(0,f.useQuery)("/reader/api/0/tag/list?output=json",{enabled:!!n,select:function(n){return n.tags.filter(function(n){return/\/label\//.test(n.id)})}});return(0,h.p)(t.error),(0,a._)((0,o._)({},t),{folders:t.data})}function y(){var n=(0,l._)(g(),1)[0],t=(0,f.useQuery)("/reader/api/0/unread-count?output=json",{enabled:!!n,select:function(n){return n.unreadcounts}});return(0,a._)((0,o._)({},t),{unreadCounts:t.data})}function k(n){var t,e,r,i=null===(t=n.id)||void 0===t?void 0:t.replace(/\d+/,"-"),u=y();return(0,a._)((0,o._)({},u),{unreadsCount:null===(e=null===(r=u.unreadCounts)||void 0===r?void 0:r.find(function(n){return n.id===i}))||void 0===e?void 0:e.count})}function S(n){var t,e=y().unreadCounts;return null===(t=null==e?void 0:e.find(function(t){return t.id===n}))||void 0===t?void 0:t.count}function M(n){var t,e,i,u=n.folderId,d=n.isReloading,m=(t=y().unreadCounts,((e=(0,l._)(g(),1)[0],i=(0,f.useQuery)("/reader/api/0/subscription/list?output=json",{enabled:!!e,select:function(n){return n.subscriptions.sort(function(n,t){return n.id.localeCompare(t.id)})}}),(0,a._)((0,o._)({},i),{allSubscriptions:i.data})).allSubscriptions||[]).filter(function(n){var e,r;return(null===(e=n.categories)||void 0===e?void 0:e.some(function(n){return n.id===u}))&&(null===(r=null==t?void 0:t.find(function(t){return t.id===n.id}))||void 0===r?void 0:r.count)>0})),h=y().unreadCounts,_=p(u),b=(0,l._)(_([]),2),k=b[0],S=b[1],M=(0,f.useQuery)(["randomItems",u,{localRandomItems:k}],(0,r._)(function(){var n,t,e,i,u,f,g,_,p,b,y,M;return(0,s.Jh)(this,function(I){switch(I.label){case 0:var C;if(k.length>7*Math.random())return[2,k];for(n=new Set(k.map(function(n){return n.feedId})),(t=m.filter(function(t){return(null==t?void 0:t.id)&&!n.has(t.id)})).length<7&&(t=m.filter(function(n){return null==n?void 0:n.id})),e=[],i=Math.log(1.7),u=0;e.length<7&&t.length>0;u=(u+1)%t.length)g=t[u],_=(Math.abs(Math.log(((null===(f=null==h?void 0:h.find(function(n){return n.id===g.id}))||void 0===f?void 0:f.count)||0)+1)/i-4)+1)/t.length,!e.includes(g)&&Math.random()<_&&(e.push(g),t.splice(u,1));return i=Math.log(t.length+1),[4,Promise.all(e.filter(function(n){return null==n?void 0:n.id}).map((C=(0,r._)(function(n){var t,e,u,d,f;return(0,s.Jh)(this,function(m){switch(m.label){case 0:var g;return e=Math.ceil(Math.log(null===(t=null==h?void 0:h.find(function(t){return t.id===n.id}))||void 0===t?void 0:t.count)/i)+1,[4,Promise.all(["o","n"].map((g=(0,r._)(function(t){return(0,s.Jh)(this,function(r){switch(r.label){case 0:return[4,v.Z.get("/reader/api/0/stream/items/ids",{output:"json",s:n.id,xt:"user/-/state/com.google/read",r:t,n:e})];case 1:return[2,r.sent().itemRefs]}})}),function(n){return g.apply(this,arguments)})))];case 1:return d=(u=l._.apply(void 0,[m.sent(),2]))[0],f=u[1],[2,(0,c._)(d).concat((0,c._)(f)).map(function(t){return(0,a._)((0,o._)({},t),{feedId:n.id})})]}})}),function(n){return C.apply(this,arguments)})))];case 1:for(p=I.sent().flat(),b=[],y=0;p.length>0&&"break"!==function(){var n=Math.floor(Math.random()*p.length),t=(0,l._)(p.splice(n,1),1)[0];if((d||!k.some(function(n){return n.id===t.id}))&&!b.some(function(n){return n.id===t.id})&&(b.push(t),(y+=1)>=7))return"break"}(););return S(M=(0,c._)(d?[]:k).concat((0,c._)(b)).filter(function(n,t,e){return e.findIndex(function(t){return t.id===n.id})===t})),[2,M]}})}),{enabled:(null==m?void 0:m.length)>0});return(0,a._)((0,o._)({},M),{randomItems:M.data})}function I(n){var t,e=(t=n.id,(0,d.useMemo)(function(){return(0,m.Z)("item:".concat(t))},[t])),r=(0,l._)(e(),2),i=r[0],u=r[1],c=!i&&!n.crawlTimeMsec,s=(0,f.useQuery)("/reader/api/0/stream/items/contents?output=json&i=".concat(n.id),{enabled:c,select:function(n){return n.items[0]}}),v=i||(n.crawlTimeMsec?n:(0,a._)((0,o._)({},s.data),{id:n.id}));if(!i&&v.crawlTimeMsec&&(u(v),localStorage.length>222))for(var h=7;h>=0;){var g=localStorage.key(Math.random()*localStorage.length);(null==g?void 0:g.startsWith("item:"))&&(console.log("xxx",{key:g}),localStorage.removeItem(g),h--)}return(0,a._)((0,o._)({},s),{item:v})}new(function(){function n(){(0,i._)(this,n)}return(0,u._)(n,[{key:"get",value:function(n){return localStorage.getItem(n)}},{key:"delete",value:function(n){localStorage.removeItem(n)}},{key:"set",value:function(n,t){localStorage.setItem(n,t)}}]),n}())},2070:function(n,t,e){e.d(t,{p:function(){return u}});var r=e(7294),i=e(9055);function u(n){var t,e=(t=(0,r.useRef)(),(0,r.useEffect)(function(){t.current=n},[n]),t.current);(0,r.useEffect)(function(){n&&!e&&(0,i.Am)(String(n))},[n,e])}},152:function(n,t,e){var r=e(1010),i=e(567),u=e(1309),o=e(4586),a=e(414),l=e(5893),c=e(8949),s=e(828),d=e(7294),f=e(8767),m=e(9055),v=e(2253),h=e(5791),g=e(3437);t.Z=(0,s.Pi)(function(n){var t,e,s=(0,f.useQueryClient)(),_=(0,h.Yh)(),p=n.folderId,b=n.item,y=n.router,k=(0,v.fv)(p),S=(0,u._)(k([]),2),M=S[0],I=S[1],C=(0,u._)((0,v.tW)([]),2),w=C[0],x=C[1],j=(0,d.useCallback)(function(){I(M.filter(function(n){return n.id!==b.id})),s.invalidateQueries("randomItems")},[I,M,s,b.id]),Q=(0,d.useCallback)(function(){(0,c.z)((0,r._)(function(){var n,t;return(0,a.Jh)(this,function(e){switch(e.label){case 0:return e.trys.push([0,2,3,4]),_.isSubmitting=!0,[4,g.Z.post("/reader/api/0/edit-tag?i=".concat(b.id),{a:"user/-/state/com.google/read"})];case 1:return e.sent(),x([b].concat((0,o._)(w)).slice(0,42)),j(),null==y||null===(n=y.back)||void 0===n||n.call(y),[3,4];case 2:return console.warn("ItemActions.markAsRead error:",t=e.sent()),(0,m.Am)("mark as read error: ".concat(t)),[3,4];case 3:return _.isSubmitting=!1,[7];case 4:return[2]}})}))},[_,b,w,x,j,y]);return(null==b?void 0:b.id)?(0,l.jsxs)(d.Fragment,{children:[(0,l.jsx)("button",{onClick:Q,disabled:_.isSubmitting,className:"button",style:(0,i._)({opacity:_.isSubmitting?.5:1},n.buttonStyle),children:"mark as read"}),(0,l.jsx)("a",{href:null==b?void 0:null===(t=b.canonical)||void 0===t?void 0:null===(e=t[0])||void 0===e?void 0:e.href,target:"_blank",rel:"noopener noreferrer",className:"button flex-row justify-center align-center",style:(0,i._)({opacity:_.isSubmitting?.5:1,textDecoration:"none"},n.buttonStyle),children:"original link"}),(0,l.jsx)("button",{onClick:function(){var n;j(),null==y||null===(n=y.back)||void 0===n||n.call(y)},disabled:_.isSubmitting,className:"button",style:(0,i._)({opacity:_.isSubmitting?.5:1},n.buttonStyle),children:"later"})]}):null})}}]);