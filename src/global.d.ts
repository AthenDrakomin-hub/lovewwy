// CSS Modules 类型声明
declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

// 普通 CSS 文件类型声明
declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}