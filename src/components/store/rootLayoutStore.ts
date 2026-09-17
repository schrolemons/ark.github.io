import {atom} from "nanostores";
import arknightsConfig from "../../../arknights.config.tsx";

export const viewIndex = atom<number>(0)

// 新增：控制 Footer 是否显示的状态
export const isFooterVisible = atom(false); 

// [新增] 用于锁定主页面滚动，当子页面（如Gallery详情）打开时设为 true
export const isScrollLocked = atom(false);

export function viewIndexSetNext() {
    const viewIndexNow = viewIndex.get()
    if (viewIndexNow < arknightsConfig.navbar.items.length - 1) location.hash = arknightsConfig.navbar.items[viewIndexNow + 1].href.split('#')[1]
}

export function viewIndexSetPrev() {
    const viewIndexNow = viewIndex.get()
    if (viewIndexNow > 0) location.hash = arknightsConfig.navbar.items[viewIndexNow - 1].href.split('#')[1]
}

export const isNavMenuOpen = atom<boolean>(false)
export const isOwnerInfoOpen = atom<boolean>(false)
export const isInitialized = atom(false)
export const readyToTouch = atom(false) // TODO: 和isInitialized合并
