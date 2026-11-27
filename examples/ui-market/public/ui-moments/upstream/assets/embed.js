// 同源组件的嵌入协议：隐藏外壳，跟随画廊主题，暂停离屏动画。
(()=>{
  const params=new URLSearchParams(location.search);
  if(params.get('embed')!=='ui')return;
  const root=document.documentElement;root.dataset.embedded='true';
  root.dataset.theme=params.get('theme')==='light'?'light':'dark';
  if(params.get('paused')==='1')root.dataset.galleryActive='false';
  const hasStyle=params.has('style');
  if(hasStyle)root.dataset.uiStyle=params.get('style');
  addEventListener('message',event=>{
    if(event.source!==parent||event.origin!==location.origin||event.data?.type!=='ui-moments:embed')return;
    root.dataset.galleryActive=String(event.data.active===true);
    root.dataset.theme=event.data.theme==='light'?'light':'dark';
    if(hasStyle&&typeof event.data.style==='string')root.dataset.uiStyle=event.data.style;
  });
  if(params.get('surface')==='detail'){
    const nestedEscapes=new WeakSet();
    const overlays='dialog[open], [role="dialog"], [role="alertdialog"], [role="menu"], [role="listbox"], :is([popover]:popover-open)';
    addEventListener('keydown',event=>{
      if(event.key==='Escape'&&Array.from(document.querySelectorAll(overlays)).some(element=>
        element.getClientRects().length&&getComputedStyle(element).visibility==='visible')){
        nestedEscapes.add(event);
      }
    },true);
    addEventListener('keydown',event=>{
      if(event.key!=='Escape'||event.repeat||event.isComposing||nestedEscapes.has(event))return;
      setTimeout(()=>{
        if(!event.defaultPrevented)parent.postMessage({type:'ui-moments:dismiss-detail'},location.origin);
      },0);
    });
  }
})();
