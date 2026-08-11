# 3D jewelry models

This folder holds the `.glb` files shown in the product page's "360° View" tab
(`src/components/storefront/jewelry-viewer`). There are **no real models
checked in yet** — every seeded product currently has `model3dUrl = null`,
so every product page falls back to the normal photo gallery. Nothing here
is faked as a finished product; the viewer only activates once you attach a
real file.

## Adding a model to a product

1. Drop the `.glb` file in the matching subfolder, e.g.
   `public/models/rings/diamond-solitaire.glb`.
2. In the admin panel, open that product (`/admin/products/[id]`) and set
   **"3D model URL"** to `/models/rings/diamond-solitaire.glb`.
3. Save. The product page will now show a "360° View" tab alongside "Photos".

You can also point the field at a fully-qualified URL (e.g. a file hosted on
Cloudinary or another CDN) instead of a local path — the viewer just needs
something it can `fetch()`.

## Naming meshes so materials swap correctly

The viewer re-colors your model at runtime to match the metal and gemstone
the shopper has selected (see `src/lib/jewelry-materials.ts`), rather than
needing a separate file per metal/gemstone combination. It finds the right
meshes by name (case-insensitive, substring match):

| Part                        | Name your mesh should contain      |
| ---------------------------- | ----------------------------------- |
| Metal (band, setting, chain) | `metal`, `band`, `setting`, `frame` |
| Gemstone                     | `gem`, `stone`, `diamond`, `crystal` |

For example, a ring model exported from Blender with meshes named
`Ring_Band_Metal` and `Center_Gemstone` will work out of the box. If your
modeling tool doesn't let you rename meshes easily, you can also pass custom
match lists via the `metalMeshMatches` / `gemstoneMeshMatches` props on
`<JewelryModel>` (`src/components/storefront/jewelry-viewer/model.tsx`).

Any mesh that doesn't match either list keeps whatever material it was
exported with — useful for enamel, fabric cord, or other parts that
shouldn't change color.

## Model guidelines

- **Format**: `.glb` (binary glTF) — self-contained, no separate texture files to lose track of.
- **Scale/orientation**: doesn't matter — the viewer auto-centers and auto-scales every model to a consistent size on load.
- **Polycount**: keep it lean for the web. A hero ring/pendant in the 20k–80k triangle range looks great and loads fast; you don't need millions of polys for something this small on screen.
- **Compression**: run models through [gltf-transform](https://gltf-transform.dev/) or Blender's glTF exporter with Draco compression enabled before dropping them here — it shrinks file size dramatically with no visible quality loss. `useGLTF` (drei) decodes Draco automatically.
- **Textures**: keep texture maps modest (1k is usually plenty for jewelry close-ups) and reuse one texture set across similar pieces where you can.

## Licensing

Only use models you've made yourself, commissioned, or have a commercial
license for. Free "jewelry" models found online (Sketchfab, etc.) are
frequently non-commercial-use-only or require attribution — check the
license on each one individually before shipping it on a store that sells
real product.
