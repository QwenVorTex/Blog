# TorQuen Blog

这是我的个人博客仓库。

目前这套博客用 [Astro](https://astro.build) 构建，静态输出，文章写在 Markdown 里，样式基本都是原生 CSS。

## 当前介绍

- 文章页补了更完整的 SEO 信息、RSS 和结构化数据
- 追番和游戏页面现在使用脚本静态抓取数据。
- 桌面端有一套自定义光标，风格跟站点一致
- 文章支持标签、草稿、更新时间、相关文章

## 开发

```bash
npm install
npm run dev
```

构建和预览：

```bash
npm run build
npm run preview
```

## 内容放在哪里

文章都在 `src/content/posts/`。

写新文章时直接新建一个 `.md` 或 `.mdx` 文件就行，文件名就是最终路由的 slug。

Frontmatter 目前支持这些字段：

```md
---
title: "文章标题"
description: "一句话摘要"
pubDate: 2026-04-07
updatedDate: 2026-04-07 # 可选
heroColor: "yellow" # yellow | red | blue | black
tags: ["博客", "前端"]
featured: false
keywords: ["Astro", "Blog"]
ogImage: "/og-default.svg"
canonical: "https://example.com/your-post" # 可选
draft: false
---
```

## 现在的目录

```text
src/
├── components/
│   ├── BrutalistCursor.astro
│   ├── Button.astro
│   ├── Footer.astro
│   ├── Header.astro
│   ├── PostCard.astro
│   ├── ScrollEngine.astro
│   ├── SortControls.astro
│   └── Tag.astro
├── config/
│   └── site.ts
├── content/
│   └── posts/
├── data/
│   └── media.ts
├── layouts/
│   ├── BaseLayout.astro
│   └── PostLayout.astro
├── lib/
│   ├── media.ts
│   └── posts.ts
├── pages/
│   ├── index.astro
│   ├── archive.astro
│   ├── about.astro
│   ├── anime.astro
│   ├── games.astro
│   ├── 404.astro
│   ├── rss.xml.ts
│   └── posts/[slug].astro
├── scripts/
│   ├── scroll-engine.ts
│   └── scroll-reveal.ts
└── styles/
    ├── animations.css
    ├── brutalist.css
    ├── global.css
    ├── typography.css
    └── variables.css
```

## 站点信息改哪里

博客标题、描述、导航、社交链接这些都集中在：

`src/config/site.ts`

如果只是想换 GitHub、Bilibili、首页标题或者默认文案，改这个文件就够了。

## 关于动效

因为喜欢漫画的打击感。

所以站里很多地方都用了 `steps()`，包括：

- 页面入场
- 卡片和按钮的悬停
- 首页 Hero 的色块
- 自定义光标的迟滞跟随

## 备注

这个仓库还会继续进化，希望以后能够更加美丽。

## License

MIT
