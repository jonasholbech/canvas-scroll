# Infinite Scroll, canvas

## Things to know

1. Most stuff can be configured in `modules/helpers.js`
2. The system works by having a huge element (`.scroller`) that expands when needed.
3. The size of the `.scroller` element is set directly in the HTML
4. I've set `user-scalable=0` in the html
5. In the HTML there's a link in head to the underlying framework (createjs) which unfortunately is not on NPM (WTF?). That is the only dependency
