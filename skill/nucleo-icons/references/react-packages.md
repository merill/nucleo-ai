# React Package Guidance

This file distills the official guidance from [Nucleo React Packages](https://nucleoapp.com/react-packages).

## Package families

- `core`: premium per style and size. Free previews are `nucleo-core-essential-*`.
- `ui`: premium per style and size. Free previews are `nucleo-ui-essential-*`.
- `sharp`: premium `nucleo-sharp`. Free preview `nucleo-sharp-essential`.
- `pixel`: premium `nucleo-pixel`. Free preview `nucleo-pixel-essential`.
- `micro-bold`: premium `nucleo-micro-bold`. Free preview `nucleo-micro-bold-essential`.
- `glass`: free package `nucleo-glass`.
- `flags`: free package `nucleo-flags`.
- `arcade`: free package `nucleo-arcade`.
- `isometric`: free package `nucleo-isometric`.
- `social-media`: free package `nucleo-social-media`.
- `credit-cards`: free package `nucleo-credit-cards`.

## Install rules

- Premium families require `NUCLEO_LICENSE_KEY` before `npm install`.
- CI environments also need `NUCLEO_LICENSE_KEY` configured.
- Free preview and free family packages do not require the license key.

## Usage patterns

- Use the `size` prop or utility classes such as `className="size-8"`.
- Use text color or `currentColor`-style patterns for the primary color.
- For secondary color, target SVG nodes with `data-color="color-2"`.
- `core` outline icons support `strokeWidth` and `corners="round"`.
- `ui` outline icons support `strokeWidth`.
- `glass` icons use CSS custom properties for gradients and highlights, and should receive `uniqueId` when the same icon is rendered multiple times with different styles.
- Use `title` or `aria-label` for meaning-bearing icons, and `aria-hidden` for decorative ones.

## Agent rule

Prefer package imports only when the repo already uses the exact family package or the mapping is clear enough to be trustworthy. Otherwise, generate local TSX/SVG and explain the fallback.
