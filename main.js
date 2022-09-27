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
  /* container.regX = Math.floor(window.innerWidth / 2);
  container.regY = Math.floor(window.innerHeight / 2); */

  stage.addChild(container);
  setupImages();
  window.addEventListener("scroll", handleScroll); //false?
  createjs.Ticker.framerate = 45;
  createjs.Ticker.addEventListener("tick", tick);
  window.scrollTo(2000, 2000);
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
/* function hitTest(i) {
  if (
    Math.sqrt(
      window.innerWidth * window.innerWidth +
        window.innerHeight * window.innerHeight
    ) <
    getDistance(bitmaps[i], {
      x: window.scrollX + window.innerWidth,
      y: window.scrollY + window.innerHeight,
    })
  ) {
    container.removeChild(bitmaps[i]);
    const el = bitmaps.splice(i, 1)[0];

    unusedBitmaps.push(el);
  }
} */

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
/* function removeOffScreenBitmaps() {
  //TODO: samme logik som vet at tilføje? lav et grid rundt om og se hvad der er langt nok væk?
  for (let i = bitmaps.length - 1; i >= 0; i--) {
    hitTest(i);
  }
} */

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
  /* const newBitmap = unusedBitmaps.shift();
  newBitmap.y = 2000;
  newBitmap.x = 2000;
  bitmaps.push(newBitmap);
  container.addChild(newBitmap); */
  /* let x = getGridStartingPoint("x");
  let y = getGridStartingPoint("y");
  let usedPositions = bitmaps.map((bm) => ({
    x: Math.floor(bm.x),
    y: Math.floor(bm.y),
  }));

  let vacantPositions = [];

  for (
    let tx = 0;
    tx < x + window.innerWidth + IMAGE_WIDTH * 2;
    tx += IMAGE_WIDTH
  ) {
    for (
      let ty = 0;
      ty < y + window.innerHeight + IMAGE_HEIGHT * 2;
      ty += IMAGE_HEIGHT
    ) {
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
  }); */
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

function debug() {
  console.log({ unusedBitmaps });
  console.log({ bitmaps });
  console.log(container.x, container.y);
  console.log(window.scrollX, window.scrollY);
  console.log(getGridStartingPoint("x"), getGridStartingPoint("y"));
}
window.debug = debug;
window.getGridStartingPoint = getGridStartingPoint;
