/**
 * The Unlicense
 *
 * @author Shateq
 * @date Wednesday, 2022 October 26
 */
import {
  initParser,
  DOMParser,
  Element,
  HTMLDocument,
} from "https://deno.land/x/deno_dom@v0.1.35-alpha/deno-dom-wasm-noinit.ts";
import { assert } from "https://deno.land/std@0.157.0/testing/asserts.ts";

const out = "./out/";
const html = "./html/";
// CLEAN
if (Deno.args.includes("--clean")) {
  if (Deno.statSync(out).isDirectory) {
    Deno.removeSync(out, { recursive: true });
  }

  if (Deno.statSync(html).isDirectory) {
    Deno.removeSync(html, { recursive: true });
  }

  Deno.exit(0);
}

await initParser();

const klenczon = "https://www.klenczon.pl/texty/";
const document = await fetchDoc(new URL(klenczon));

const list = document.querySelectorAll(`a[href$=".html"]`);
assert(list);

for (let i = 0; i < list.length; i++) {
  const el = list[i] as Element;
  assert(el);

  const href = el.getAttribute("href");
  let name = el.textContent.replace(">", "");
  console.info(href);

  fetchDoc(new URL(klenczon + href))
    .then((d) => d.body)
    .then((t) => {
      let text;
      // HTML
      if (Deno.args.includes("--html")) {
        text = t.innerHTML;
        if (!name.endsWith(".html")) {
            name = name + ".html"
        }
        write(html, name, text);
        return true;
      } else {
        text = t.textContent.trimStart().trimEnd();
        write(out, name + ".txt", text);
      }
    });
}

async function write(dir: string, name: string, text: string) {
  await Deno.mkdir(dir, { recursive: true });
  Deno.writeTextFile(`${dir}${name}`, text);
}

async function fetchDoc(url: URL) {
  const req = await fetch(url).then((res) => res.text());
  return getDocument(req);
}

function getDocument(html: string): HTMLDocument {
  const document = new DOMParser().parseFromString(html, "text/html");
  assert(document);
  return document;
}
