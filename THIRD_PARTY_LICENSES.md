# Third-party licenses

`npm run check` reads the license of every installed package (root, hub, starter template, every demo, nested
dependencies included) and every font file, and fails on anything not listed here. Full license texts ship inside each
package in `node_modules/<name>/LICENSE*` and next to each font file.

## Accepted without review (permissive)

MIT, ISC, BSD-2-Clause, BSD-3-Clause, Apache-2.0, 0BSD, BlueOak-1.0.0, CC0-1.0, Unlicense, Python-2.0.

- **CC-BY-4.0**: only `caniuse-lite` (browser support data used by the build tooling, not shipped in the pages).

## Read and accepted by hand

| Package | License | Why it is fine here |
|---|---|---|
| `@shopify/polaris`, `@shopify/polaris-icons`, `@shopify/polaris-tokens` | MIT text plus a clause: the rights "may only be exercised to develop and distribute applications that integrate or interoperate with Shopify software or services" | Every prototype here designs screens of Joy, an app embedded in the Shopify admin. The stand-alone-app restriction in the same clause does not apply to embedded apps. |

## Fonts (SIL Open Font License 1.1)

| Font | Files | License text |
|---|---|---|
| Inter | `hub/public/fonts/inter-var.woff2`, `templates/demo/src/fonts/inter-var.woff2` | `OFL.txt` beside each |
| Be Vietnam Pro | `hub/public/fonts/be-vietnam-pro-*.woff2` | `hub/public/fonts/BeVietnamPro-OFL.txt` |

General Sans (ITF Free Font License) was removed on 26/10/2026: that license forbids publishing the font file in a public repository.

## Images

- Product photos and logo of the fictional shop Pomelo Park: generated for Joy demos (ChatGPT image generation, 09/2026).
- Hub card images: screenshots of the prototypes or of the Joy screen they change, with sample data only. Every committed image is OCR-scanned by `npm run check`.
- Joy marks in `hub/public/brand/`: Joy's own brand, owned by Avada.
- No stock or third-party images.
