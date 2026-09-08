---
title: Gallery管理指南
---
本文档将指导您如何找到、修改和管理 Gallery 组件，以便更方便地使用 AI 来生成和管理多个 gallery 组件。

## 1. 找到 Gallery 组件

Gallery 组件位于以下路径：

```
src/pages/_views/components/GalleryDetails.tsx
```

这是一个独立的 React 组件，用于展示画廊详情。

## 2. 修改 Gallery 数据

Gallery 组件使用硬编码的模拟数据 `galleryData`。要修改画廊内容，您需要修改这个数组：

### 2.1 找到数据定义

在 `GalleryDetails.tsx` 文件中，数据定义在第64-105行：

```typescript
// --- 模拟数据 ---
const galleryData = [
  {
    id: "01",
    year: "2026",
    title: "DST",
    subtitle: "#01#",
    src: "/images/04-media/gallery/2-1.png",
    desc: "VILLAGE OF THE PAST",
  },
  // 更多数据项...
];
```

### 2.2 数据结构

每个 gallery 项包含以下属性：

- `id`: 唯一标识符，用于区分不同的图片
- `year`: 年份，显示在时间轴上
- `title`: 主标题，显示在底部
- `subtitle`: 副标题，显示在主标题下方
- `src`: 图片路径，相对于 public 目录
- `desc`: 描述，目前未在 UI 中使用，但可用于扩展功能

## 3. 管理多个 Gallery 组件

如果您需要创建多个不同的 Gallery 组件，可以通过以下方法：

### 3.1 创建新的 Gallery 组件

1. 复制 `GalleryDetails.tsx` 文件，重命名为新的组件名称，如 `CustomGallery.tsx`
2. 修改新组件中的 `galleryData` 数组，填入新的图片数据
3. 在需要使用的页面中导入并使用新组件

### 3.2 动态 Gallery 组件

为了更灵活地管理多个 gallery，您可以修改组件使其接受外部数据：

```typescript
interface GalleryProps {
  onBack?: () => void;
  data?: typeof galleryData; // 接受外部数据
  defaultIndex?: number; // 默认选中索引
}

export default function ArknightsGallery({ 
  onBack, 
  data = galleryData, // 使用传入的数据或默认数据
  defaultIndex = 0 
}: GalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(defaultIndex);
  const activeItem = data[currentIndex];
  
  // 其余代码保持不变...
}
```

## 4. 使用 AI 生成 Gallery 内容

您可以使用 AI 来生成 Gallery 内容，具体步骤如下：

### 4.1 生成图片

1. 使用 AI 图像生成工具（如 DALL-E、Midjourney 等）生成符合主题的图片
2. 将生成的图片保存到 `public/images/04-media/gallery/` 目录

### 4.2 生成数据

使用 AI 生成工具（如 ChatGPT）生成 gallery 数据数组。例如：

```typescript
// 提示词示例：
// 为明日方舟主题的画廊生成10个数据项，每个项包含id、year、title、subtitle、src和desc字段
// src字段使用"/images/04-media/gallery/"前缀，图片文件名使用数字编号
// 主题包括罗德岛、龙门、切尔诺伯格等明日方舟中的地点

const galleryData = [
  {
    id: "01",
    year: "2026",
    title: "罗德岛",
    subtitle: "#罗德岛基地#",
    src: "/images/04-media/gallery/01.png",
    desc: "RHODES ISLAND",
  },
  // 更多数据项...
];
```

### 4.3 批量管理

为了更高效地管理多个 gallery，您可以：

1. 创建一个数据管理文件，如 `src/data/galleries.ts`，集中管理所有 gallery 数据
2. 在该文件中定义多个 gallery 数据数组
3. 在需要使用的地方导入并使用这些数据

```typescript
// src/data/galleries.ts
export const rhodesIslandGallery = [
  // 罗德岛相关图片数据
];

export const lungmenGallery = [
  // 龙门相关图片数据
];

export const ChernobogGallery = [
  // 切尔诺伯格相关图片数据
];
```

## 5. 扩展功能

您可以通过以下方式扩展 Gallery 组件的功能：

### 5.1 添加图片分类

在 `galleryData` 中添加 `category` 字段，然后在组件中添加分类筛选功能。

### 5.2 添加图片描述

利用现有的 `desc` 字段，在 UI 中显示图片描述。

### 5.3 添加图片切换动画

可以使用 framer-motion 库添加更丰富的图片切换动画。

### 5.4 添加图片下载功能

添加下载按钮，允许用户下载当前查看的图片。

## 6. 最佳实践

1. **图片命名规范**：使用清晰的命名规则，如 `category_01.png`
2. **数据管理**：集中管理 gallery 数据，便于维护和更新
3. **响应式设计**：确保 Gallery 组件在不同设备上都能正常显示
4. **性能优化**：对于大量图片，考虑使用懒加载技术
5. **AI 集成**：利用 AI 工具批量生成图片和数据，提高效率

## 7. 示例：创建新的 Gallery 组件

以下是创建新 Gallery 组件的完整示例：

1. 创建 `src/pages/_views/components/CustomGallery.tsx` 文件
2. 复制 `GalleryDetails.tsx` 的内容
3. 修改 `galleryData` 数组为新的内容
4. 在需要使用的页面中导入并使用

```typescript
// // 在 Media.tsx 中使用新的 Gallery 组件
// import CustomGallery from "./components/CustomGallery.tsx";
//
// // 在 handleDetailClick 函数中添加新的逻辑
// const handleDetailClick = () => {
//   if (currentCat === "gallery") {
//     setShowGallery(true);
//     isScrollLocked.set(true);
//   } else if (currentCat === "custom") {
//     setShowCustomGallery(true);
//     isScrollLocked.set(true);
//   }
//   // 其他逻辑...
// };
//
// // 在 JSX 中添加新的 Gallery 组件
// <div className="w-full h-[50%] relative">
//   {showGallery && <GalleryDetails onBack={handleBackFromGallery} />}
//   {showCustomGallery && <CustomGallery onBack={handleBackFromCustomGallery} />}
// </div>
```

通过以上方法，您可以轻松创建和管理多个 Gallery 组件，利用 AI 工具提高内容生成效率。