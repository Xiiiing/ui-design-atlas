/** @type {Record<string,[string,string]>} */
export const categories = {
  buttons: ["按钮", "Buttons"],
  text: ["文字", "Text"],
  backgrounds: ["背景", "Backgrounds"],
  cards: ["卡片", "Cards"],
  navigation: ["导航", "Navigation"],
  forms: ["表单", "Forms"],
  data: ["数据展示", "Data"],
  loading: ["加载", "Loading"],
  feedback: ["反馈", "Feedback"],
  layout: ["布局", "Layout"],
};
/** @type {Record<string,[string,string]>} */
export const interactions = {
  hover: ["悬停", "Hover"],
  click: ["点击", "Click"],
  scroll: ["滚动", "Scroll"],
  auto: ["自动播放", "Autoplay"],
  input: ["输入", "Input"],
};
/** @param {import("./atlas/types").Resource} resource @returns {{name:string;value:string;label:string}[]} */
export function resourceTags(resource, lang = "zh-CN") {
  const index = lang === "en" ? 1 : 0;
  // Prefer the distinguishing action over generic click/autoplay metadata.
  const interaction = ["input", "hover", "scroll", "click", "auto"].find((x) =>
    resource.interactions.includes(x),
  );
  return [
    {
      name: "category",
      value: resource.category,
      label: categories[resource.category]?.[index],
    },
    interaction && {
      name: "interaction",
      value: interaction,
      label: interactions[interaction][index],
    },
    { name: "style", value: resource.styleId, label: resource.style?.[lang] },
  ].filter((tag) => tag?.label);
}
