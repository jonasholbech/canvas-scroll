import "./style.css";
import {
  images,
  IMAGE_WIDTH,
  IMAGE_HEIGHT,
  getGridStartingPoint,
  RESET_TRIGGER,
  RESET_SCROLL,
  FRAMERATE,
  RESET_TRIGGER_REPOSITION,
} from "./modules/helpers";
const canvas = document.querySelector("#demoCanvas");
//the .scroller is the actual overflowing element
const scroller = document.querySelector(".scroller");

const stage = new createjs.Stage("demoCanvas");
const container = new createjs.Container();
let bitmaps = [];
let unusedBitmaps = [];

//onMount
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
  window.addEventListener("resize", debounce);
}
let resetID;
function debounce() {
  window.clearTimeout(resetID);
  resetID = setTimeout(function () {
    console.log("resize ended");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    container.width = window.innerWidth;
    container.height = window.innerHeight;
    window.scrollBy(1, 0); //triger "re-render"
  }, 66);
}
//not implemented, but needed for something like vue
function unmount() {
  window.removeEventListener("resize", debounce);
  window.removeEventListener("scroll", handleScroll);
  createjs.Ticker.removeEventListener("tick", tick);
}
window.unmount = unmount;
function tick(evt) {
  stage.update();
}

//register all images, let addImages actually use them
function setupImages() {
  images.forEach((img) => {
    const bitmap = new createjs.Bitmap(img);
    //bitmap.sourceRect = new createjs.Rectangle(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);
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
  //reset at RESET_TRIGGER% scroll (default 0.6)
  //user scrolled far down
  if (
    window.scrollY / Number(scroller.style.getPropertyValue("--height")) >
    RESET_TRIGGER
  ) {
    scroller.style.setProperty(
      "--height",
      Number(scroller.style.getPropertyValue("--height")) * 2
    );
  }

  //user scrolled far right
  if (
    window.scrollX / Number(scroller.style.getPropertyValue("--width")) >
    RESET_TRIGGER
  ) {
    scroller.style.setProperty(
      "--width",
      Number(scroller.style.getPropertyValue("--width")) * 2
    );
  }
  //user scrolled far up
  if (window.scrollY < RESET_TRIGGER_REPOSITION) {
    const offset = window.scrollY % IMAGE_HEIGHT;
    window.scrollTo(RESET_SCROLL.x, RESET_SCROLL.y + offset);
    repositionImages();
  }
  //user scrolled far left
  if (window.scrollX < RESET_TRIGGER_REPOSITION) {
    const offset = window.scrollX % IMAGE_WIDTH;
    window.scrollTo(RESET_SCROLL.x + offset, RESET_SCROLL.y);
    repositionImages();
  }
}

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

//The user was force-scrolled, recalculate position of what was in view
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
  console.log("scroll");
  //when the user is idle, check if we need to increase the scrollarea or reposition the user
  window.clearTimeout(idleID);
  idleID = setTimeout(function () {
    resetScroller();
  }, 66);
  //keep conatiner in sync with user scroll
  container.y = -window.scrollY;
  container.x = -window.scrollX;
  removeOffScreenBitmaps();
  addImages();
}

//kick off everything
init();

//just for debug, so the elements can be accessed in the console

window.container = container;
window.bitmaps = bitmaps;
window.unusedBitmaps = unusedBitmaps;
window.debug = debug;
window.getGridStartingPoint = getGridStartingPoint;

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
