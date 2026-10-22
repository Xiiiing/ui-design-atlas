import {lazy} from 'react';
export const demos={
 'magicui-border-beam':lazy(()=>import('./demos/magicui/border-beam')),
 'magicui-shimmer-button':lazy(()=>import('./demos/magicui/shimmer-button')),
 'magicui-ripple-button':lazy(()=>import('./demos/magicui/ripple-button')),
 'magicui-marquee':lazy(()=>import('./demos/magicui/marquee')),
 'magicui-number-ticker':lazy(()=>import('./demos/magicui/number-ticker')),
 'magicui-magic-card':lazy(()=>import('./demos/magicui/magic-card')),
 'magicui-dock':lazy(()=>import('./demos/magicui/dock')),
 'magicui-blur-fade':lazy(()=>import('./demos/magicui/blur-fade')),
 'magicui-animated-list':lazy(()=>import('./demos/magicui/animated-list')),
 'magicui-text-animate':lazy(()=>import('./demos/magicui/text-animate')),
 'magicui-particles':lazy(()=>import('./demos/magicui/particles')),
 'magicui-bento-grid':lazy(()=>import('./demos/magicui/bento-grid')),
};
