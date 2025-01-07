let font;
let letterGroups = [];
let svgGroups = [];
let currentGroups = [];
let targetGroups = [];
let isHovering = false;
let letters = "C^vI tY".split(""); // Default text
let noiseOffset = 0;

const svgPath = "M18.5 11C18.5 3 13.5858 7.35786 13 1.5C17.491 4.81946 20.9999 8 25 10C29 12 39.5 5.5 39.5 5.5C39.5 5.5 30.8066 13.5 33.8066 13C36.8066 12.5 40.8066 21.5 40.8066 21.5C39 18.0038 28.1863 14.791 27 17C23.6918 21.783 32.8362 25.4225 35.3066 30L33.8066 41.5C33.118 27.5 25.3665 24.3834 19.5 22.5C12.4184 27.4494 10.5 30 8.30656 41.5C3.49999 31 15.2645 27.2176 15.5 19.5L0.306641 22.5C0.306641 22.5 18.5 19 18.5 11Z";

let fontlink = 'Favorit-Light.otf'; // Default font

// Function to handle font file upload
function handleFontUpload(event) {
  const file = event.target.files[0];
  
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      fontlink = e.target.result; // Assign the file data to fontlink
      new p5(sketch1);  // Restart the sketch with the new font
    };
    reader.readAsDataURL(file); // Read the font file as a Data URL
  }
}

// Add event listener for font upload
document.getElementById('fontUploader').addEventListener('change', handleFontUpload);

// Function to handle text input change
function handleTextChange(event) {
  letters = event.target.value.split(""); // Update the letters array with the new text
  new p5(sketch1); // Restart the sketch with the new text
}

// Add event listener for text input
document.getElementById('textInput').addEventListener('input', handleTextChange);

// Function to parse SVG path into points
function parseSVGPath(pathData, numPoints = 100) {
  let tempDiv = document.createElement('div');
  tempDiv.innerHTML = `<svg><path d="${pathData}"/></svg>`;
  let path = tempDiv.querySelector('path');
  let points = [];
  
  let length = path.getTotalLength();
  
  for (let i = 0; i < numPoints; i++) {
    let point = path.getPointAtLength(i * length / numPoints);
    points.push({
      x: point.x,
      y: point.y
    });
  }
  
  return points;
}

// Function for first canvas
function sketch1(p) {
    p.preload = function () {
      p.loadFont(fontlink, (loadedFont) => {
        font = loadedFont;
      });
    };
  
    p.setup = function () {
      p.createCanvas(p.windowWidth, p.windowHeight);
      let xOffset = p.windowWidth / 2 - font.textBounds(letters.join(""), 0, 0, 220).w / 2;
      let yOffset = p.windowHeight / 2 + 50; // Center vertically
  
      letterGroups = []; // Reset letterGroups
      svgGroups = []; // Reset svgGroups
      currentGroups = []; // Reset currentGroups
      targetGroups = []; // Reset targetGroups
  
      for (let letter of letters) {
        if (letter === " ") {
          xOffset += 40;
          continue;
        }
  
        let points = font.textToPoints(letter, xOffset, yOffset, 200, {
          sampleFactor: 0.5,
          simplifyThreshold: 0,
        });
  
        let letterWidth = font.textBounds(letter, xOffset, yOffset, 250).w;
        xOffset += letterWidth + 10;
  
        if (points.length > 0) {
          letterGroups.push(points);
  
          let svgPoints = parseSVGPath(svgPath, points.length);
  
          let scaleFactor = 8;
          let svgOffsetX = p.windowWidth / 2 - 180; // Center SVG horizontally
          let svgOffsetY = p.windowHeight / 2 - 230; // Position SVG above text
  
          let svgScaled = svgPoints.map((pt) => ({
            x: pt.x * scaleFactor + svgOffsetX,
            y: pt.y * scaleFactor + svgOffsetY,
          }));
  
          svgGroups.push(svgScaled);
  
          currentGroups.push(points.map((pt) => ({ x: pt.x, y: pt.y })));
          targetGroups.push(points.map((pt) => ({ x: pt.x, y: pt.y })));
        }
      }
    };
  
    p.draw = function () {
      p.clear();
  
      const bounds1 = p.windowWidth * 2/8;
      const bounds2 = p.windowWidth * 6/8;
      const bounds3 = p.windowHeight * 3/8;
      const bounds4 = p.windowHeight * 5/8;
  
      if (p.mouseX >= bounds1 && p.mouseX <= bounds2 && p.mouseY >= bounds3 && p.mouseY <= bounds4) {
        if (!isHovering) {
          isHovering = true;
          targetGroups = svgGroups;
        }
      } else {
        if (isHovering) {
          isHovering = false;
          targetGroups = letterGroups;
        }
      }
  
      for (let g = 0; g < currentGroups.length; g++) {
        for (let i = 0; i < currentGroups[g].length; i++) {
          currentGroups[g][i].x = p.lerp(currentGroups[g][i].x, targetGroups[g][i].x, 0.1);
          currentGroups[g][i].y = p.lerp(currentGroups[g][i].y, targetGroups[g][i].y, 0.1);
  
          let noiseVal = p.noise(currentGroups[g][i].x * 0.1, currentGroups[g][i].y * 0.1, noiseOffset);
          currentGroups[g][i].x += p.map(noiseVal, 0, 1, -1, 1);
          currentGroups[g][i].y += p.map(noiseVal, 0, 1, -1, 1);
        }
  
        p.fill(0);
        p.noStroke();
        p.beginShape();
        for (let pos of currentGroups[g]) {
          p.vertex(pos.x, pos.y);
        }
        p.endShape(p.CLOSE);
      }
  
      noiseOffset += 0.01;
    };
}
