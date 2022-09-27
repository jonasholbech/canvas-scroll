import "./style.css";
import {
  images,
  getDistance,
  IMAGE_WIDTH,
  IMAGE_HEIGHT,
  getGridStartingPoint,
} from "./modules/helpers";
const canvas = document.querySelector("#demoCanvas");
const scroller = document.querySelector(".scroller");

const stage = new createjs.Stage("demoCanvas");
const container = new createjs.Container();
let bitmaps = [];
let unusedBitmaps = [];
window.container = container;
window.bitmaps = bitmaps;
window.unusedBitmaps = unusedBitmaps;
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
  let x = getGridStartingPoint("x");
  let y = getGridStartingPoint("y");

  images.forEach((img) => {
    const bitmap = new createjs.Bitmap(img);
    bitmap.x = x;
    bitmap.y = y;
    bitmap.width = IMAGE_WIDTH;
    bitmap.height = IMAGE_HEIGHT;
    bitmap.sourceRect = new createjs.Rectangle(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);
    x += IMAGE_WIDTH;
    if (x > window.innerWidth + window.scrollX + IMAGE_WIDTH) {
      x = window.scrollX;
      y += IMAGE_HEIGHT;
    }
    if (y > window.scrollX + window.innerHeight + IMAGE_HEIGHT) {
      unusedBitmaps.push(bitmap);
    } else {
      bitmaps.push(bitmap);
      container.addChild(bitmap);
    }
  });
}
function hitTest(i) {
  if (
    Math.sqrt(
      window.innerWidth * window.innerWidth +
        window.innerHeight * window.innerHeight
    ) <
    getDistance(bitmaps[i], {
      x: window.scrollX,
      y: window.scrollY,
    })
  ) {
    container.removeChild(bitmaps[i]);
    const el = bitmaps.splice(i, 1)[0];
    unusedBitmaps.push(el);
  }
}

function removeOffScreenBitmaps() {
  for (let i = bitmaps.length - 1; i >= 0; i--) {
    hitTest(i);
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
function addImages() {
  let x = getGridStartingPoint("x");
  let y = getGridStartingPoint("y");
  let origX = x;
  let origY = y;

  let usedPositions = bitmaps.map((bm) => ({
    x: Math.floor(bm.x),
    y: Math.floor(bm.y),
  }));

  let vacantPositions = [];

  for (
    let tx = origX;
    tx < origX + window.innerWidth + IMAGE_WIDTH;
    tx += IMAGE_WIDTH
  ) {
    for (
      let ty = origY;
      ty < origY + window.innerHeight + IMAGE_HEIGHT;
      ty += IMAGE_HEIGHT
    ) {
      if (!usedPositions.find((pos) => pos.x === tx && pos.y === ty)) {
        console.log(tx, ty, "is empty");
        vacantPositions.push({ x: tx, y: ty });
      }
    }
  }
  vacantPositions.forEach((pos) => {
    const newBitmap = unusedBitmaps.shift();
    newBitmap.y = pos.y;
    newBitmap.x = pos.x;
    bitmaps.push(newBitmap);
    container.addChild(newBitmap);
  });
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
  addImages();
}
init();
