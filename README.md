# Infinite Scroll, canvas

## Things to know

1. Most stuff can be configured in `modules/helpers.js`
2. The system works by having a huge element (`.scroller`) that expands when needed.
3. The size of the `.scroller` element is set directly in the HTML
4. I've set `user-scalable=0` in the html
5. In the HTML there's a link in head to the underlying framework (createjs) which unfortunately is not on NPM (WTF?). That is the only dependency
6. Since the images are not handled in CSS, sizing/cropping is done through the DatoCMS API `&w=200&h=200&fit=crop`. Image sizes whould match the settings in `modules/helpers.js`

## Known issues

1. on safari (ios) using `scrollTo` or `scrollBy` stops the users own scroll (inertia). So a few hacks were made to try to circumvent that.
2. On mobile (ios/chrome) the body can sometimes be seen (currently coloured `hotpink`). Chris had a solution somewhere.

## General setup

Initialy, and when the user scrolls, the system creates a "grid" of where to place the images. Images not in that grid are pushed to `unusedBitmaps`, used images are in `bitmaps`.

The system uses a `createjs.container` that is synced to `window.scrollX/Y`

## Demo

https://jonasholbech.github.io/canvas-scroll/
