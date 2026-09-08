import {defineConfig} from 'astro/config';
import react from "@astrojs/react";
import remarkBreaks from "remark-breaks";
import {remarkNoteBlock} from "./src/_plugins/remark-note-block";

import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
    markdown: {
        remarkPlugins: [remarkBreaks, remarkNoteBlock],
        shikiConfig: {
            theme: "one-dark-pro",
        },
    },

    integrations: [react(), tailwind({applyBaseStyles: false})],
    
    // 添加以下配置以支持 GitHub Pages 部署
    // 将 'astro-arknights' 替换为你的仓库名称
    base: '',
    
    // 配置 Sass 使用现代 API
    vite: {
        css: {
            preprocessorOptions: {
                scss: {
                    api: "modern"
                }
            }
        }
    }
});