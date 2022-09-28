import "./style.css";
import {
  images,
  IMAGE_WIDTH,
  IMAGE_HEIGHT,
  getGridStartingPoint,
  RESET_TRIGGER,
  RESET_SCROLL,
  FRAMERATE,
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

  stage.addChild(container);
  setupImages();
  window.addEventListener("scroll", handleScroll);
  createjs.Ticker.framerate = FRAMERATE;
  createjs.Ticker.addEventListener("tick", tick);

  window.scrollTo(RESET_SCROLL.x, RESET_SCROLL.y);
}
function tick(evt) {
  stage.update();
}

function setupImages() {
  images.forEach((img) => {
    const bitmap = new createjs.Bitmap(img);
    bitmap.width = IMAGE_WIDTH;
    bitmap.height = IMAGE_HEIGHT;
    bitmap.sourceRect = new createjs.Rectangle(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);
    unusedBitmaps.push(bitmap);
  });
}

function removeOffScreenBitmaps() {
  let x = getGridStartingPoint("x");
  let y = getGridStartingPoint("y");

  let allowedPositions = [];

  const xEnd = x + window.innerWidth + IMAGE_WIDTH;
  const yEnd = y + window.innerHeight + IMAGE_HEIGHT;
  for (let tx = x; tx < xEnd; tx += IMAGE_WIDTH) {
    for (let ty = y; ty < yEnd; ty += IMAGE_HEIGHT) {
      allowedPositions.push({ x: tx, y: ty });
    }
  }

  for (let i = bitmaps.length - 1; i >= 0; i--) {
    if (
      !allowedPositions.find(
        (pos) => pos.x === bitmaps[i].x && pos.y === bitmaps[i].y
      )
    ) {
      container.removeChild(bitmaps[i]);
      const el = bitmaps.splice(i, 1)[0];

      unusedBitmaps.push(el);
    }
  }
}

function resetScroller() {
  //add space bottom
  //reset at 60% scroll
  if (
    window.scrollY / Number(scroller.style.getPropertyValue("--height")) >
    RESET_TRIGGER
  ) {
    scroller.style.setProperty(
      "--height",
      Number(scroller.style.getPropertyValue("--height")) * 2
    );
  }

  if (
    window.scrollX / Number(scroller.style.getPropertyValue("--width")) >
    RESET_TRIGGER
  ) {
    scroller.style.setProperty(
      "--width",
      Number(scroller.style.getPropertyValue("--width")) * 2
    );
  }
  //scroll up
  if (window.scrollY < 2000) {
    const offset = window.scrollY % IMAGE_HEIGHT;
    window.scrollTo(RESET_SCROLL.x, RESET_SCROLL.y + offset);
    repositionImages();
  }
  //scroll left
  if (window.scrollX < 2000) {
    const offset = window.scrollX % IMAGE_WIDTH;
    window.scrollTo(RESET_SCROLL.x + offset, RESET_SCROLL.y);
    repositionImages();
  }
}
//TODO: start med større .scroller, sæt start coords til høj, høj, så vi minimerer chancen for left, up issues
function addImages() {
  let x = getGridStartingPoint("x");
  let y = getGridStartingPoint("y");
  let usedPositions = bitmaps.map((bm) => ({
    x: Math.floor(bm.x),
    y: Math.floor(bm.y),
  }));

  let vacantPositions = [];

  const xEnd = x + window.innerWidth + IMAGE_WIDTH;
  const yEnd = y + window.innerHeight + IMAGE_HEIGHT;
  for (let tx = x; tx < xEnd; tx += IMAGE_WIDTH) {
    for (let ty = y; ty < yEnd; ty += IMAGE_HEIGHT) {
      if (!usedPositions.find((pos) => pos.x === tx && pos.y === ty)) {
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
function repositionImages() {
  let x = getGridStartingPoint("x");
  let y = getGridStartingPoint("y");
  let vacantPositions = [];
  bitmaps.sort((imgA, imgB) => imgA.x - imgB.x || imgA.y - imgB.y);
  const xEnd = x + window.innerWidth + IMAGE_WIDTH;
  const yEnd = y + window.innerHeight + IMAGE_HEIGHT;
  for (let tx = x; tx < xEnd; tx += IMAGE_WIDTH) {
    for (let ty = y; ty < yEnd; ty += IMAGE_HEIGHT) {
      vacantPositions.push({ x: tx, y: ty });
    }
  }
  for (let i = 0; i < bitmaps.length; i++) {
    bitmaps[i].y = vacantPositions[i].y;
    bitmaps[i].x = vacantPositions[i].x;
  }
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

  /* if (keepCurrentBitmaps) {
    repositionImages();
    //keepCurrentBitmaps=false;
    console.log("keep current");
  } else { */
  removeOffScreenBitmaps();
  addImages();
  /* } */
}
init();

function debug() {
  console.log({ unusedBitmaps });
  console.log({ bitmaps });
  console.log("container", container.x, container.y);
  console.log("scrollX/Y", window.scrollX, window.scrollY);
  console.log(
    "gridStartingPoint",
    getGridStartingPoint("x"),
    getGridStartingPoint("y")
  );
}
window.debug = debug;
window.getGridStartingPoint = getGridStartingPoint;
