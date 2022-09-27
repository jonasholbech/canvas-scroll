import "./style.css";
import { images } from "./modules/helpers";
const canvas = document.querySelector("#demoCanvas");
const scroller = document.querySelector(".scroller");

const stage = new createjs.Stage("demoCanvas");
const container = new createjs.Container();
let bitmaps = [];
let unusedBitmaps = [];
window.container = container;
window.bitmaps = bitmaps;
function init() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  container.width = window.innerWidth;
  container.height = window.innerHeight;
  window.scrollTo(2000, 2000);
  stage.addChild(container);
  setupImages();
  window.addEventListener("scroll", handleScroll); //false?
  createjs.Ticker.framerate = 45;
  createjs.Ticker.addEventListener("tick", tick);
}
function tick(evt) {
  stage.update();
}

function setupImages() {
  let x = window.scrollX;
  let y = window.scrollY;
  images.forEach((img) => {
    const bitmap = new createjs.Bitmap(img);
    bitmap.x = x;
    bitmap.y = y;
    bitmap.width = 350;
    bitmap.height = 350;
    bitmap.sourceRect = new createjs.Rectangle(0, 0, 350, 350);
    x += 350;
    if (x > window.innerWidth + window.scrollX) {
      x = window.scrollX;
      y += 350;
    }
    if (y > window.scrollX + window.innerHeight) {
      unusedBitmaps.push(bitmap);
    } else {
      bitmaps.push(bitmap);
      container.addChild(bitmap);
    }
  });
}
function hitTest(coords, i) {
  if (bitmaps[i].y + bitmaps[i].height + container.y <= 0) {
    //remove top image
    container.removeChild(bitmaps[i]);
    const el = bitmaps.splice(i, 1)[0];
    unusedBitmaps.push(el);
    const newBitmap = unusedBitmaps.shift();
    newBitmap.y = coords.highestY + 350;
    newBitmap.x = el.x;
    bitmaps.push(newBitmap);
    container.addChild(newBitmap);
  }
  if (bitmaps[i].y + container.y > canvas.height + 350) {
    //remove bottom image
    container.removeChild(bitmaps[i]);
    const el = bitmaps.splice(i, 1)[0];
    unusedBitmaps.push(el);
    const newBitmap = unusedBitmaps.shift();
    newBitmap.y = coords.lowestY - 350;
    newBitmap.x = el.x;
    bitmaps.push(newBitmap);
    container.addChild(newBitmap);
  }
  return true;
}
function getCoords() {
  let lowestX = null;
  let lowestY = null;
  let highestX = null;
  let highestY = null;

  bitmaps.forEach((img) => {
    if (img.x < lowestX || lowestX === null) {
      lowestX = img.x;
    }
    if (img.y < lowestY || lowestY === null) {
      lowestY = img.y;
    }
    if (img.x > highestX || highestX === null) {
      highestX = img.x;
    }
    if (img.y > highestY || highestY === null) {
      highestY = img.y;
    }
  });
  return {
    lowestX,
    lowestY,
    highestX,
    highestY,
  };
}
function removeOffScreenBitmaps() {
  const coords = getCoords();
  for (let i = bitmaps.length - 1; i >= 0; i--) {
    hitTest(coords, i);
  }
}

function resetScroller() {
  //window.scrollTo(2000, 2000);
  /*  //expand down
  if (
    window.scrollY + window.innerHeight + 500 >
    Number(scroller.style.getPropertyValue("--height"))
  ) {
    scroller.style.setProperty(
      "--height",
      Number(scroller.style.getPropertyValue("--height")) * 2
    );
  } */
}
let idleID;
function handleScroll(e) {
  // Clear our timeout throughout the scroll
  window.clearTimeout(idleID);

  // Set a timeout to run after scrolling ends
  idleID = setTimeout(function () {
    // Run the callback
    resetScroller();
  }, 66);
  container.y = -window.scrollY;
  container.x = -window.scrollX;
  removeOffScreenBitmaps();
}
init();
