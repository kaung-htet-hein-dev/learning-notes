import type { LanguageFn } from "highlight.js";
import bashLanguage from "highlight.js/lib/languages/bash";
import groovyLanguage from "highlight.js/lib/languages/groovy";

// Extra highlight.js grammars for note code fences. Colors live in globals.css.

// ```tree: ASCII file trees (`|-- name   description`). Branch lines are muted,
// folders (trailing `/`) and files get their own colors, and text after two or
// more spaces reads as a comment.
const branch = /^[ |`-]*/;

export const tree: LanguageFn = () => ({
  name: "tree",
  contains: [
    {
      match: [branch, /[^\s|`-]\S*\/(?=\s|$)/],
      scope: { 1: "punctuation", 2: "title" },
    },
    {
      match: [branch, /[^\s|`-](?:\S| (?! ))*/],
      scope: { 1: "punctuation", 2: "string" },
    },
    { scope: "comment", begin: / {2,}(?=\S)/, end: /$/ },
  ],
});

// ```sh / ```bash: the stock grammar leaves commands and flags uncolored, so
// mark the command at the start of a line or after `&&`, `||`, `|`, `;`, and
// every `-f` / `--flag`.
export const bash: LanguageFn = (hljs) => {
  const base = bashLanguage(hljs);
  return {
    ...base,
    contains: [
      {
        match: [/^[ \t]*(?:[A-Za-z_][\w]*=\S*[ \t]+)*/, /[\w./-]+/],
        scope: { 1: "variable", 2: "title" },
      },
      {
        match: [/(?:&&|\|\||\||;)[ \t]*/, /[\w./-]+/],
        scope: { 1: "punctuation", 2: "title" },
      },
      { scope: "attr", match: /(?<=\s)--?[A-Za-z][\w-]*/ },
      ...(base.contains ?? []),
    ],
  };
};

// ```groovy (Gradle): color block and method names like `buildscript {` and
// `abi.set(`, which the stock grammar leaves plain.
export const groovy: LanguageFn = (hljs) => {
  const base = groovyLanguage(hljs);
  return {
    ...base,
    contains: [
      {
        scope: "title",
        match: /\b(?!(?:if|for|while|switch|catch|return)\b)[A-Za-z_]\w*(?=\s*[({])/,
      },
      ...(base.contains ?? []),
    ],
  };
};

// ```text and unlabeled fences (registered as `plaintext`, replacing the stock
// one): reports, logs, diagrams. Color `Label:` prefixes, numbers with units,
// and quoted strings only, so ASCII diagrams keep their shape.
export const text: LanguageFn = () => ({
  name: "text",
  aliases: ["text", "txt"],
  contains: [
    { scope: "attr", match: /^[ \t]*[A-Za-z][\w .()-]*:(?=\s)/ },
    {
      scope: "number",
      match: /\b\d+(?:\.\d+)?(?:\s?(?:%|[KMGT]?B|ms|s|x))?\b/,
    },
    { scope: "string", begin: /"/, end: /"/ },
    { scope: "comment", begin: /(?:^|\s)#\s/, end: /$/ },
  ],
});
