import type {APIContext} from "astro"
import {getCollection} from "astro:content"
import type {BreakingNewsItemProps} from "../../_types/RootPageViews.ts"

/**
 * 该静态文件端点被 ../_views/01-Information.tsx BreakingNewsList 调用
 * The static file endpoint is called by ../_views/01-Information.tsx BreakingNewsList
 *
 * 参考：https://docs.astro.build/zh-cn/guides/endpoints/
 * See: https://docs.astro.build/en/guides/endpoints/
 */
export async function GET({params, request}: APIContext) {
    // TODO:
    const base = import.meta.env.BASE_URL
    const allworld = await getCollection("world");

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.getFullYear() + " // " + (date.getMonth() + 1) + " / " + date.getDate();
    };

    const getItemsByCategory = (category: string) => {
        return allworld
            .filter(item => item.data.category === category)
            .sort((a, b) => {
                const titleA = (a.data.title ?? a.id).toLowerCase();
                const titleB = (b.data.title ?? b.id).toLowerCase();
                return titleA.localeCompare(titleB);
            })
            .slice(0, 3)
            .map((item) => ({
                title: item.data.title ?? item.id,
                date: formatDate(item.data.updated ?? item.data.date),
                href: base + "world/" + item.slug,
                category: item.data.category ?? "未分类"
            })) as BreakingNewsItemProps[];
    };

    const getCountByCategory = (category: string) =>
        allworld.filter(item => item.data.category === category).length;

    return new Response(JSON.stringify([

        {id: "world_view", name: "世界观", totalCount: getCountByCategory("世界观"), list: getItemsByCategory("世界观")},
        {id: "events", name: "事件", totalCount: getCountByCategory("事件"), list: getItemsByCategory("事件")},
        {id: "short_stories", name: "微故事", totalCount: getCountByCategory("微故事"), list: getItemsByCategory("微故事")},
    ]));
}
