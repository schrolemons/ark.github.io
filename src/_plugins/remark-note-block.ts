const NOTE_START_REGEX = /^\{%note\s+(info|primary|danger|warning)\s*%\}$/;
const NOTE_END_REGEX = /^\{%endnote\s*%\}$/;
const NOTE_START_INLINE_REGEX = /\{%note\s+(info|primary|danger|warning)\s*%\}/;
const NOTE_END_INLINE_REGEX = /\{%endnote\s*%\}/;

/**
 * Recursively walk the mdast tree, calling `fn` for each node.
 */
function walk(node: any, fn: (node: any, index: number | null, parent: any | null) => void) {
  fn(node, null, null);
  if (node.children) {
    node.children.forEach((child: any) => {
      walk(child, fn);
    });
  }
}

export function remarkNoteBlock(): (tree: any) => void {
  return (tree: any) => {
    // Pass 1: replace paragraphs that are entirely {%note X%} or {%endnote%}
    if (tree.children) {
      let i = 0;
      while (i < tree.children.length) {
        const node = tree.children[i];
        if (node.type === "paragraph") {
          const textContent = node.children
            ? node.children
                .filter((c: any) => c.type === "text")
                .map((c: any) => c.value)
                .join("")
                .trim()
            : "";

          const noteMatch = textContent.match(NOTE_START_REGEX);
          if (noteMatch) {
            tree.children.splice(i, 1, {
              type: "html",
              value: `<div class="note note-${noteMatch[1]}">`,
            });
            i++;
            continue;
          }

          if (NOTE_END_REGEX.test(textContent)) {
            tree.children.splice(i, 1, {
              type: "html",
              value: "</div>",
            });
            i++;
            continue;
          }
        }
        i++;
      }
    }

    // Pass 2: handle inline {%note X%} / {%endnote%} markers inside text nodes
    walk(tree, (node: any, _index: number | null, parent: any | null) => {
      if (node.type !== "text" || !parent || !Array.isArray(parent.children)) return;

      const idx = parent.children.indexOf(node);
      if (idx === -1) return;

      let value: string = node.value;
      const replacements: any[] = [];
      let lastIndex = 0;

      const combinedRegex = new RegExp(
        `(${NOTE_START_INLINE_REGEX.source}|${NOTE_END_INLINE_REGEX.source})`,
        "g"
      );

      let match: RegExpExecArray | null;
      while ((match = combinedRegex.exec(value)) !== null) {
        if (match.index > lastIndex) {
          replacements.push({
            type: "text",
            value: value.slice(lastIndex, match.index),
          });
        }

        const matched = match[0];
        const noteStartMatch = matched.match(NOTE_START_INLINE_REGEX);
        if (noteStartMatch) {
          replacements.push({
            type: "html",
            value: `<div class="note note-${noteStartMatch[1]}">`,
          });
        } else {
          replacements.push({
            type: "html",
            value: "</div>",
          });
        }

        lastIndex = match.index + matched.length;
      }

      if (replacements.length > 0) {
        if (lastIndex < value.length) {
          replacements.push({
            type: "text",
            value: value.slice(lastIndex),
          });
        }
        parent.children.splice(idx, 1, ...replacements);
      }
    });
  };
}