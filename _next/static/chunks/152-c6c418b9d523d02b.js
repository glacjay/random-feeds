"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[152],{2253:function(n,t,e){e.d(t,{B1:function(){return S},K4:function(){return M},WX:function(){return k},YM:function(){return w},dQ:function(){return g},fv:function(){return p},jx:function(){return b},tW:function(){return _}});var r=e(1010),i=e(8564),u=e(2267),o=e(567),l=e(4932),a=e(1309),c=e(4586),d=e(414),s=e(7294),f=e(8767),v=e(906),m=e(3437),h=e(2070),g=(0,v.Z)("token"),_=(0,v.Z)("recentlyReadItems");function p(n){return(0,s.useMemo)(function(){return(0,v.Z)("randomItems:".concat(n))},[n])}function b(){var n=(0,a._)(g(),1)[0],t=(0,f.useQuery)("/reader/api/0/tag/list?output=json",{enabled:!!n,select:function(n){return n.tags.filter(function(n){return/\/label\//.test(n.id)})}});return(0,h.p)(t.error),(0,l._)((0,o._)({},t),{folders:t.data})}function y(){var n=(0,a._)(g(),1)[0],t=(0,f.useQuery)("/reader/api/0/unread-count?output=json",{enabled:!!n,select:function(n){return n.unreadcounts}});return(0,l._)((0,o._)({},t),{unreadCounts:t.data})}function k(n){var t,e,r,i=null===(t=n.id)||void 0===t?void 0:t.replace(/\d+/,"-"),u=y();return(0,l._)((0,o._)({},u),{unreadsCount:null===(e=null===(r=u.unreadCounts)||void 0===r?void 0:r.find(function(n){return n.id===i}))||void 0===e?void 0:e.count})}function M(n){var t,e=y().unreadCounts;return null===(t=null==e?void 0:e.find(function(t){return t.id===n}))||void 0===t?void 0:t.count}function S(n){var t,e,i,u=n.folderId,s=n.isReloading,v=(t=y().unreadCounts,((e=(0,a._)(g(),1)[0],i=(0,f.useQuery)("/reader/api/0/subscription/list?output=json",{enabled:!!e,select:function(n){return n.subscriptions.sort(function(n,t){return n.id.localeCompare(t.id)})}}),(0,l._)((0,o._)({},i),{allSubscriptions:i.data})).allSubscriptions||[]).filter(function(n){var e,r;return(null===(e=n.categories)||void 0===e?void 0:e.some(function(n){return n.id===u}))&&(null===(r=null==t?void 0:t.find(function(t){return t.id===n.id}))||void 0===r?void 0:r.count)>0})),h=y().unreadCounts,_=p(u),b=(0,a._)(_([]),2),k=b[0],M=b[1],S=(0,f.useQuery)(["randomItems",u,{localRandomItems:k}],(0,r._)(function(){var n,t,e,i,u,f,g,_,p,b,y,S,w,C,x,j,Q,Z,R,E,N,A,J,W,P;return(0,d.Jh)(this,function(T){switch(T.label){case 0:var Y;if(k.length>2)return[2,k];for(n=new Set(k.map(function(n){return n.feedId})),(t=v.filter(function(t){return(null==t?void 0:t.id)&&!n.has(t.id)})).length<7&&(t=v.filter(function(n){return null==n?void 0:n.id})),e=[],i=0;e.length<7&&t.length>0;i=(i+1)%t.length)f=t[i],g=(Math.abs(Math.log(((null===(u=null==h?void 0:h.find(function(n){return n.id===f.id}))||void 0===u?void 0:u.count)||0)+1)/I(500,12)-4)+1)/t.length,!e.includes(f)&&Math.random()<g&&(e.push(f),t.splice(i,1));return[4,Promise.all(e.filter(function(n){return null==n?void 0:n.id}).map((Y=(0,r._)(function(n){var e,i,u,s,f;return(0,d.Jh)(this,function(v){switch(v.label){case 0:var g;return i=Math.ceil(Math.log(null===(e=null==h?void 0:h.find(function(t){return t.id===n.id}))||void 0===e?void 0:e.count)/Math.log(t.length+1))+1,[4,Promise.all(["o","n"].map((g=(0,r._)(function(t){return(0,d.Jh)(this,function(e){switch(e.label){case 0:return[4,m.Z.get("/reader/api/0/stream/items/ids",{output:"json",s:n.id,xt:"user/-/state/com.google/read",r:t,n:i})];case 1:return[2,e.sent().itemRefs]}})}),function(n){return g.apply(this,arguments)})))];case 1:return s=(u=a._.apply(void 0,[v.sent(),2]))[0],f=u[1],[2,(0,c._)(s).concat((0,c._)(f)).map(function(t){return(0,l._)((0,o._)({},t),{feedId:n.id})})]}})}),function(n){return Y.apply(this,arguments)})))];case 1:_=T.sent(),p=[],b=!0,y=!1,S=void 0;try{for(w=_[Symbol.iterator]();!(b=(C=w.next()).done);b=!0)for(Z=0,x=C.value,Q=(null===(j=null==h?void 0:h.find(function(n){var t;return n.id===(null==x?void 0:null===(t=x[0])||void 0===t?void 0:t.feedId)}))||void 0===j?void 0:j.count)||0;Z<Math.log(Q)/Math.log(I(450,2))&&x.length>0;Z+=1)if(R=Math.floor(Math.random()*x.length),E=(0,a._)(x.splice(R,1),1)[0],!p.some(function(n){return n.id===E.id})){p.push(E);break}}catch(n){y=!0,S=n}finally{try{b||null==w.return||w.return()}finally{if(y)throw S}}for(A=(N=(0,c._)(p)).length-1;A>0;A--)W=[N[J=Math.floor(Math.random()*(A+1))],N[A]],N[A]=W[0],N[J]=W[1];return M(P=(0,c._)(s?[]:(0,c._)(k)).concat((0,c._)(N)).filter(function(n,t,e){return e.findIndex(function(t){return t.id===n.id})===t})),[2,P]}})}),{enabled:(null==v?void 0:v.length)>0});return(0,l._)((0,o._)({},S),{randomItems:S.data})}function I(n,t){return Math.pow(Math.E,Math.log(n)/t)}function w(n){var t,e=(t=n.id,(0,s.useMemo)(function(){return(0,v.Z)("item:".concat(t))},[t])),r=(0,a._)(e(),2),i=r[0],u=r[1],c=!i&&!n.crawlTimeMsec,d=(0,f.useQuery)("/reader/api/0/stream/items/contents?output=json&i=".concat(n.id),{enabled:c,select:function(n){return n.items[0]}}),m=i||(n.crawlTimeMsec?n:(0,l._)((0,o._)({},d.data),{id:n.id}));if(!i&&m.crawlTimeMsec&&(u(m),localStorage.length>222))for(var h=7;h>=0;){var g=localStorage.key(Math.random()*localStorage.length);(null==g?void 0:g.startsWith("item:"))&&(console.log("xxx",{key:g}),localStorage.removeItem(g),h--)}return(0,l._)((0,o._)({},d),{item:m})}new(function(){function n(){(0,i._)(this,n)}return(0,u._)(n,[{key:"get",value:function(n){return localStorage.getItem(n)}},{key:"delete",value:function(n){localStorage.removeItem(n)}},{key:"set",value:function(n,t){localStorage.setItem(n,t)}}]),n}())},2070:function(n,t,e){e.d(t,{p:function(){return u}});var r=e(7294),i=e(9055);function u(n){var t,e=(t=(0,r.useRef)(),(0,r.useEffect)(function(){t.current=n},[n]),t.current);(0,r.useEffect)(function(){n&&!e&&(0,i.Am)(String(n))},[n,e])}},152:function(n,t,e){var r=e(1010),i=e(567),u=e(1309),o=e(4586),l=e(414),a=e(5893),c=e(8949),d=e(828),s=e(7294),f=e(8767),v=e(9055),m=e(2253),h=e(5791),g=e(3437);t.Z=(0,d.Pi)(function(n){var t,e,d=(0,f.useQueryClient)(),_=(0,h.Yh)(),p=n.folderId,b=n.item,y=n.router,k=(0,m.fv)(p),M=(0,u._)(k([]),2),S=M[0],I=M[1],w=(0,u._)((0,m.tW)([]),2),C=w[0],x=w[1],j=(0,s.useCallback)(function(){I(S.filter(function(n){return n.id!==b.id})),d.invalidateQueries("randomItems")},[I,S,d,b.id]),Q=(0,s.useCallback)(function(){(0,c.z)((0,r._)(function(){var n,t;return(0,l.Jh)(this,function(e){switch(e.label){case 0:return e.trys.push([0,2,3,4]),_.isSubmitting=!0,[4,g.Z.post("/reader/api/0/edit-tag?i=".concat(b.id),{a:"user/-/state/com.google/read"})];case 1:return e.sent(),x([b].concat((0,o._)(C)).slice(0,42)),j(),null==y||null===(n=y.back)||void 0===n||n.call(y),[3,4];case 2:return console.warn("ItemActions.markAsRead error:",t=e.sent()),(0,v.Am)("mark as read error: ".concat(t)),[3,4];case 3:return _.isSubmitting=!1,[7];case 4:return[2]}})}))},[_,b,C,x,j,y]);return(null==b?void 0:b.id)?(0,a.jsxs)(s.Fragment,{children:[(0,a.jsx)("button",{onClick:Q,disabled:_.isSubmitting,className:"button",style:(0,i._)({opacity:_.isSubmitting?.5:1},n.buttonStyle),children:"mark as read"}),(0,a.jsx)("a",{href:null==b?void 0:null===(t=b.canonical)||void 0===t?void 0:null===(e=t[0])||void 0===e?void 0:e.href,target:"_blank",rel:"noopener noreferrer",className:"button flex-row justify-center align-center",style:(0,i._)({opacity:_.isSubmitting?.5:1,textDecoration:"none"},n.buttonStyle),children:"original link"}),(0,a.jsx)("button",{onClick:function(){var n;j(),null==y||null===(n=y.back)||void 0===n||n.call(y)},disabled:_.isSubmitting,className:"button",style:(0,i._)({opacity:_.isSubmitting?.5:1},n.buttonStyle),children:"later"})]}):null})}}]);