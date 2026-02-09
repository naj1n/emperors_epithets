# 帝号猜猜乐

一个关于中国历史帝王**庙号**和**谥号**的互动答题游戏。通过填空的方式猜测帝王称号，同时欣赏教科书画像与影视剧形象的火焰切换动画。

## 预览

| 首页 | 结果页 |
|:---:|:---:|
| ![首页](imgs/首页.png) | ![结果](imgs/结果.jpg) |

## 特性

- **庙号 + 谥号混合出题** — 每道题明确标注"猜庙号"或"猜谥号"，帮助区分两者
- **50+ 精选题目** — 覆盖秦汉至清朝，包含大量易混淆、反直觉的教育性题目
- **填空式答题** — "明 \_\_\_ 宗"的直观形式，比纯选择题更有趣
- **动态题量** — 每局 12~17 题，根据实时正确率智能调整
- **教科书 ↔ 影视剧图片切换** — 每道题先展示历史画像，1.5 秒后火焰裂开动画切换为影视剧形象，点击可随时切换
- **完整答题回顾** — 结束后逐题回顾，显示正确答案与完整称号

## 技术栈

- **React 19** + **TypeScript**
- **Vite** 构建
- **Tailwind CSS**（CDN）
- 纯静态题库，无需 API Key，无需后端

## 本地运行

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

打开 http://localhost:3000 即可。

## 项目结构

```
├── App.tsx                  # 主应用（游戏逻辑 + UI）
├── types.ts                 # TypeScript 类型定义
├── data/
│   └── questions.ts         # 静态题库（50+ 道题）
├── services/
│   └── geminiService.ts     # 题目加载服务（从题库随机抽取）
├── components/
│   ├── EmperorImage.tsx     # 帝王图片组件（双图 + 火焰切换）
│   ├── Button.tsx           # 按钮组件
│   └── LoadingSpinner.tsx   # 加载动画
├── public/images/
│   ├── emperors/            # 教科书版画像（45 张）
│   └── now/                 # 影视剧版形象（45 张）
└── index.html               # 入口 HTML + CSS 动画
```

## 更新题库

编辑 `data/questions.ts`，每道题格式：

```typescript
{
  emperorName: "朱祁镇",
  dynasty: "明朝",
  questionType: "庙号",           // "庙号" 或 "谥号"
  templatePrefix: "明",           // 填空前缀
  templateSuffix: "宗",           // 填空后缀
  correctTitle: "英宗",           // 完整称号（结果页展示）
  correctAnswer: "英",            // 填空答案
  options: ["英", "代", "宪", "武"],
  hint: "土木堡之变被俘...",
  description: "两次登基的传奇皇帝...",
  image: "zhuqizhen.webp",       // 教科书图 → public/images/emperors/
  dramaImage: "朱祁镇.webp",     // 影视剧图 → public/images/now/
}
```

## 评级体系

| 正确率 | 评级 |
|--------|------|
| 100%   | 夯   |
| 80%+   | 顶级 |
| 60%+   | 人上人 |
| 40%+   | NPC  |
| <40%   | 拉完了 |

## 部署

项目已配置 GitHub Actions 自动部署到 GitHub Pages。推送到 `main` 分支即自动构建部署。

需要先在仓库 Settings → Pages 中将 Source 设为 **GitHub Actions**。

## License

MIT
