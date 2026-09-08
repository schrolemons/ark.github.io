import type { Root } from "mdast";

/**
 * 从 AST 节点中提取纯文本内容
 */
function getTextContent(node: any): string {
  if (!node) return "";
  if (node.type === "text") return node.value;
  if (node.children) {
    return node.children.map((c: any) => getTextContent(c)).join("");
  }
  return "";
}

/**
 * 识别 {%note info/primary/danger/warning%} ... {%endnote%} 并包裹为 styled div
 */
export function remarkNoteBlock() {
  return (tree: Root) => {
    const children = tree.children;
    const newChildren: typeof children = [];

    const NOTE_START = /^\{%\s*note\s+(info|primary|danger|warning)\s*%\}$/;
    const NOTE_END = /^\{%\s*endnote\s*%\}$/;

    let i = 0;
    while (i < children.length) {
      const node = children[i];

      if (node.type === "paragraph") {
        const text = getTextContent(node).trim();

        const match = text.match(NOTE_START);
        if (match) {
          const noteType = match[1];
          let j = i + 1;
          const innerNodes: typeof children = [];

          while (j < children.length) {
            const endNode = children[j];
            if (endNode.type === "paragraph") {
              const endText = getTextContent(endNode).trim();
              if (NOTE_END.test(endText)) break;
            }
            innerNodes.push(children[j]);
            j++;
          }

          if (j < children.length) {
            newChildren.push({
              type: "html",
              value: `<div class="note-block note-block--${noteType}">`,
            } as any);
            newChildren.push(...innerNodes);
            newChildren.push({
              type: "html",
              value: "</div>",
            } as any);
            i = j + 1;
            continue;
          }
        }
      }

      newChildren.push(node);
      i++;
    }

    tree.children = newChildren;
  };
}