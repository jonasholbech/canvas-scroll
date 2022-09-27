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
  stage.addChild(container);
  setupImages();
  window.addEventListener("scroll", handleScroll);
  createjs.Ticker.framerate = 45;
  createjs.Ticker.addEventListener("tick", tick);
}
function tick(evt) {
  stage.update();
}
//window.scrollBy(600, 600);
function setupImages() {
  let x = 0;
  let y = 0;
  //TODO: scrollX til at starte med?
  images.forEach((img) => {
    const bitmap = new createjs.Bitmap(img);
    bitmap.x = x;
    bitmap.y = y;
    bitmap.width = 350;
    bitmap.height = 350;
    bitmap.sourceRect = new createjs.Rectangle(0, 0, 350, 350);
    x += 350;
    if (x > window.innerWidth) {
      x = 0;
      y += 350;
    }
    if (y > window.innerHeight + 1000) {
      unusedBitmaps.push(bitmap);
    } else {
      bitmaps.push(bitmap);
      container.addChild(bitmap);
    }
  });
}
function hitTest(coords, i) {
  if (bitmaps[i].y + bitmaps[i].height + container.y < -350) {
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
  //remove children not seen

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
/* function addRowBelow() {
  const bitmap = unusedBitmaps.pop();
  console.log(bitmap);
  bitmap.x = 0;
  bitmap.y = 1050;
  bitmaps.push(bitmap);
  stage.addChild(bitmap);
  console.log("adding");
} */

function handleScroll() {
  container.y = -window.scrollY;
  container.x = -window.scrollX;
  removeOffScreenBitmaps();
  const coords = getCoords();

  /* if ((coords, container.y + container.height + 350 - coords.highestY < 400)) {
    const bitmap = unusedBitmaps.pop();
    bitmap.x = 0;
    bitmap.y = coords.highestY + 350;
    bitmaps.push(bitmap);
    stage.addChild(bitmap);
    console.log("adding");
  } */

  /*if (container.x < -200) {
    bitmaps[0].x = 1450;
  } */
}
init();
