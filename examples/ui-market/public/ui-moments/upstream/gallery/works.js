// UI Moments 的原创交互控件。
const originalCore = [
  {
    id: 'ink-switch',
    standalone: true,
    title: '墨滴开关',
    en: 'Ink Switch',
    type: 'Switch',
    summary: 'Ink spills from the thumb across the track, then draws back into the thumb when switched off.',
    summaryZh: '打开时，墨色从滑块铺满轨道。关闭时，墨色收回滑块。',
    tags: ['Switch', 'ink', 'bleed'],
    notes: ['The switch supports Space and Enter.', 'A circular clip-path spreads the ink while the thumb squashes and rebounds.'],
    notesZh: ['支持用空格键和 Enter 键切换。', '滑块压扁并回弹时，墨色通过圆形裁剪区域铺开。'],
  },
  {
    id: 'detent-dial',
    standalone: true,
    title: '刻度旋钮',
    en: 'Detent Dial',
    type: 'Dial',
    summary: 'Drag around the dial. The pointer snaps to the nearest tick, and the number flips as you cross each mark.',
    summaryZh: '沿着旋钮拖动，指针会吸附到最近的刻度。每经过一格，数字就翻动一次。',
    tags: ['Dial', 'slider', 'ticks', 'drag'],
    notes: ['The slider supports arrow keys, Page Up, Page Down, Home, and End.', 'Dragging across the bottom gap keeps the value at the endpoint.'],
    notesZh: ['支持方向键、Page Up、Page Down、Home 和 End。', '拖过底部空隙时，数值会停在端点。'],
  },
  {
    id: 'hold-confirm',
    title: '长按确认',
    en: 'Hold to Confirm',
    type: 'Button',
    summary: 'Hold to complete the action. The progress resets if you release early, and the label trembles just before completion.',
    summaryZh: '按住完成操作。提前松手会重置进度，即将完成时文字会轻轻颤动。',
    tags: ['Button', 'delete', 'hold', 'confirm'],
    notes: ['Works with a mouse, touch, and keyboard. With a keyboard, hold Space or Enter.', 'A quick tap prompts you to hold to delete.'],
    notesZh: ['支持鼠标、触屏和键盘。使用键盘时，按住空格键或 Enter 键。', '轻点一下会提示你长按删除。'],
  },
  {
    id: 'odometer-stepper',
    title: '滚轮步进器',
    en: 'Odometer Stepper',
    type: 'Stepper',
    summary: 'Digits roll in the direction of the change. Hold either step button to speed up, with a soft bump at each limit.',
    summaryZh: '数字沿着数值变化的方向滚动。长按加减按钮可以加快滚动，到达上下限时会轻轻回弹。',
    tags: ['Stepper', 'count', 'spinbutton', 'numbers'],
    notes: ['The spinbutton supports arrow keys, Page Up, Page Down, Home, and End.', 'The digits keep their direction when wrapping between 9 and 0.'],
    notesZh: ['支持方向键、Page Up、Page Down、Home 和 End。', '数字在 9 和 0 之间切换时，滚动方向保持一致。'],
  },
  {
    id: 'leaf-tabs',
    title: '翻页标签',
    en: 'Leaf Tabs',
    type: 'Tabs',
    summary: 'The selection flips like a page onto the new tab, and the bars grow to their new values in sequence.',
    summaryZh: '选中标记像翻书一样翻到新标签，柱形图依次长到新的数值。',
    tags: ['Tabs', 'page flip', 'charts'],
    notes: ['Standard tabs support arrow keys, Home, and End.', 'The fold follows the selected direction.'],
    notesZh: ['标签支持方向键、Home 和 End。', '折页动效会跟随切换方向。'],
  },
  {
    id: 'tide-progress',
    autoplay: true,
    title: '潮汐进度',
    en: 'Tide Progress',
    type: 'Progress',
    summary: 'A spring moves the water level toward the target. The percentage changes contrast where it crosses the waterline.',
    summaryZh: '水位像弹簧一样向目标回摆。百分比文字在水面上下以不同的颜色显示。',
    tags: ['Progress', 'liquid', 'canvas'],
    notes: ['Drawing pauses offscreen and when gallery motion is paused.', 'Reduced motion shows the result immediately.'],
    notesZh: ['移出视口或暂停图鉴动效时，会停止绘制。', '启用减少动态效果时，会直接显示结果。'],
  },
];

// 第二批原创：表单控件（inputs.html）与操作反馈（actions.html）。
const originalInputs = [
  ['stroke-checklist', '划线清单', 'Stroke Checklist', 'Checkbox', 'The checkmark draws itself and a line strikes through the task from left to right.', '勾选时，对勾逐笔画出，删除线从左向右划过任务。', ['Checkbox', 'to-do']],
  ['pebble-rating', '石子评分', 'Pebble Rating', 'Rating', 'Hover over five different pebbles to preview a rating. Select one and the pebbles bounce in sequence.', '把指针移到五颗不同的石子上可预览评分。选定后，石子依次弹跳。', ['Rating', 'radio']],
  ['notch-slider', '档位滑块', 'Notch Slider', 'Slider', 'Drag the thumb between XS and XL. It widens during the drag and lifts the active size label.', '在 XS 到 XL 之间拖动滑块。拖动时滑块变宽，当前档位的标签会抬起。', ['Slider', 'range', 'sizes']],
  ['strength-meter', '密码强度', 'Strength Meter', 'Input', 'Four segments fill and change color. The eye blinks when you toggle password visibility.', '四段强度条随密码强度填充并变色。切换密码可见性时，眼睛图标会眨一下。', ['password', 'Input', 'strength']],
  ['chip-input', '标签输入', 'Chip Input', 'Input', 'Press Enter to add a tag or Backspace to remove the last one. The field shakes on a duplicate.', '按 Enter 添加标签，按 Backspace 删除最后一个标签。输入重复标签时，输入框会抖动。', ['tags', 'Input']],
  ['plan-picker', '方案卡片', 'Plan Picker', 'Radio cards', 'The selection outline slides between cards and compresses slightly on arrival.', '选择另一张卡片时，边框会滑过去，到达后略微压缩。', ['radio', 'Card', 'pricing']],
].map(([id, title, en, type, summary, summaryZh, tags]) => ({id, title, en, type, summary, summaryZh, tags, page: 'inputs'}));

const originalActions = [
  ['copy-morph', '复制按钮', 'Copy Button', 'Button', 'The copy icon becomes a checkmark, and the label rolls up to show “Copied.”', '复制图标变成对勾，文字向上滚动，显示「已复制」。', ['copy', 'Button', 'clipboard']],
  ['like-burst', '点赞爆发', 'Like Burst', 'Button', 'A heart squashes and rebounds, sending out a ring and sparks as the count rolls.', '爱心先压扁再回弹，迸出一圈波纹和火花，计数随之滚动。', ['like', 'favorite', 'count']],
  ['paper-plane', '纸飞机发送', 'Paper Plane Send', 'Button', 'A paper plane pulls back before taking off. The label reads “Sent,” then the plane returns from the left.', '纸飞机先向后蓄力再飞走，文字显示「已发送」，随后纸飞机从左侧返回。', ['send', 'Button', 'paper plane']],
  ['download-ring', '下载进度环', 'Download Ring', 'Button', 'The button becomes a progress ring and then a checkmark. Press again during the download to cancel.', '按钮先变成进度环，完成后变成对勾。下载中再次按下可取消。', ['download', 'Progress', 'Button']],
  ['code-shake', '验证码输入', 'Code Shake', 'Input', 'A four-digit verification input advances automatically and supports paste. Wrong codes shake and clear, while the right code lights up each field.', '输入四位验证码时，焦点自动前进，也支持粘贴。输错会抖动并清空，输对时各格会亮起。', ['verification code', 'OTP', 'Input']],
  ['bell-toggle', '通知铃', 'Bell Toggle', 'Switch', 'The bell swings and its badge pops in. A slash crosses the bell when turned off.', '开启时铃铛摆动，角标弹出。关闭时，铃铛上会出现一道斜线。', ['Notification', 'Switch', 'bell']],
].map(([id, title, en, type, summary, summaryZh, tags]) => ({id, title, en, type, summary, summaryZh, tags, page: 'actions'}));

// 第三批原创：没有文字的图形交互（visual.html）。
const originalVisuals = [
  ['magnet-grid', '磁吸点阵', 'Magnet Grid', 'Pointer effect', 'Forty dots pull toward the pointer, growing and brightening as it nears. They spring back when it leaves.', '四十个点向指针靠拢。指针越近，点越大、越亮，移开后会弹回原位。', ['dot grid', 'pointer', 'magnetic']],
  ['jelly-pad', '果冻方块', 'Jelly Cube', 'Drag', 'Drag the cube to stretch it in the direction of motion. Release and it springs back to the center.', '拖动方块时，它会沿拖动方向拉伸。松手后，它会弹回中央。', ['jelly', 'drag', 'spring']],
  ['hue-orbit', '色轮', 'Hue Orbit', 'Color picker', 'Drag around the wheel to pick a hue. The selected dot grows and the center swatch changes color.', '沿色环拖动即可选色。选中的色点会放大，中心色块随之换色。', ['color', 'color picker', 'ring'], 'color'],
  ['merge-drops', '融合水滴', 'Merge Drops', 'Drag', 'Drag the small drop into the large one to merge them, then release to pull them apart and spring back.', '把小水滴拖向大水滴时，两滴会融合。松手后，它们会分开并弹回原位。', ['droplet', 'gooey', 'merge']],
  ['pull-cord', '拉绳灯', 'Pull Cord Lamp', 'Switch', 'Pull the cord to toggle the lamp. The cord springs back and the shade casts a warm beam.', '拉动绳子即可开关灯。绳子会弹回，灯罩亮起时会投下暖色光束。', ['Switch', 'lamp', 'pull cord'], 'color'],
  ['flip-coin', '抛硬币', 'Flip Coin', 'Button', 'The coin flips and lands on the sun or moon side. Its shadow scales with its height.', '硬币翻转后落在太阳面或月亮面，阴影大小随硬币高度变化。', ['coin', 'flip', 'random'], 'color'],
  ['ripple-pad', '涟漪画板', 'Ripple Pad', 'Pointer effect', 'Press to send out three ripples. Hold longer for a larger drop and wider ripples.', '按下会荡开三道涟漪。按得越久，水滴越大，涟漪也越宽。', ['ripple', 'hold', 'water']],
  ['bloom-toggle', '花朵开关', 'Bloom Toggle', 'Switch', 'Six petals open in sequence and light up the center. Press again to close the bloom.', '六片花瓣依次打开，花心亮起。再次按下即可收拢花瓣。', ['Switch', 'flower', 'petals']],
].map(([id, title, en, type, summary, summaryZh, tags, page = 'visual']) => ({
  id, title, en, type, summary, summaryZh, tags, page,
  ...(page === 'color' && {vivid: true}),
  ...(id === 'jelly-pad' && {standalone: true}),
}));

const originalGestures = [
  ['swipe-confirm', '滑动确认', 'Swipe to Confirm', 'Slider', 'Drag the thumb to the end to confirm. Release early and it springs back; a flashing arrow shows which way to go.', '把滑块拖到底即可确认。提前松手会弹回，闪动的箭头提示拖动方向。', ['swipe', 'confirm', 'drag'], true],
  ['pull-refresh', '下拉刷新', 'Pull to Refresh', 'List', 'Pull down to draw the progress ring. Release past the threshold to refresh and drop in a new row.', '下拉时会画出进度环。拉过阈值后松手即可刷新，列表会落入新的一行。', ['pull', 'refresh', 'List']],
  ['elastic-string', '弹弦', 'Elastic String', 'Drag', 'Pull the string from any point and watch its vibration gradually settle.', '从任意一点拉动弦线。松手后，振动会逐渐停下来。', ['string', 'spring', 'vibration']],
  ['domino-row', '多米诺', 'Domino Row', 'Button', 'Seven dominoes fall in sequence. Press again and they stand up in reverse order.', '七块多米诺骨牌依次倒下。再按一次，它们按相反顺序立起来。', ['domino', 'chain', 'stagger']],
  ['rocker-switch', '翘板开关', 'Rocker Switch', 'Switch', 'A wall-style rocker tilts in perspective, darkening the pressed side.', '墙壁式翘板开关会随按压翻转，按下的一侧变暗。', ['Switch', '3D', 'rocker']],
  ['scrub-wave', '波形拖动', 'Scrub Wave', 'Slider', 'Waveform bars fill as the playhead passes during playback or dragging.', '播放或拖动时，波形条会随着播放头经过而点亮。', ['audio', 'waveform', 'Progress']],
  ['snap-grid', '吸附网格', 'Snap Grid', 'Drag', 'Drag the tile and release to snap into the nearest cell. Arrow keys move it one cell at a time.', '拖动方块并松手，它会吸附到最近的格子。用方向键可以逐格移动。', ['grid', 'snap', 'drag']],
  ['radial-menu', '扇形菜单', 'Radial Menu', 'Menu', 'Press the plus to fan out four actions along an arc. The plus rotates into a close icon.', '按下加号，四个操作沿弧线展开。加号旋转成关闭图标。', ['Menu', 'arc', 'expand']],
  ['step-track', '步骤条', 'Step Track', 'Progress', 'The track extends and the next node bounces as you advance.', '前进时，轨道向前延伸，下一个节点随之弹起。', ['steps', 'Progress', 'onboarding']],
  ['breath-orb', '呼吸球', 'Breath Orb', 'Rhythm', 'The orb follows a four-second inhale and exhale, with an outer ring slightly behind. Press to pause.', '圆球以四秒一吸、四秒一呼的节奏起伏，外环略微滞后。按下可以暂停。', ['breathing', 'Rhythm', 'meditation'], true],
].map(([id, title, en, type, summary, summaryZh, tags, autoplay]) => ({id, title, en, type, summary, summaryZh, tags, page: 'gestures', autoplay}));

const originalControls = [
  ...originalCore.map(work => ({...work, page: 'index'})),
  ...originalVisuals,
  ...originalGestures,
  ...originalInputs,
  ...originalActions,
].map(({page, ...work}) => ({
  ...work,
  tags: [...work.tags, 'Original controls'],
  demo: `gallery/originals/${page}.html#${work.id}`,
  source: 'gallery/originals',
  live: true,
  original: true,
}));

window.WORKS = originalControls;
