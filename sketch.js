/*
Project started: Feb-7-2021
working state: Feb-21-2021

⬣⬡ hexagons are the bestagons ⬡⬣

    Hexagon is split into six triangles numbered clockwise

      ___________           B_____a̲_____C
     /\         /\           \         /
    /  \   3   /  \           \   0   /
   /    \     /    \        c  \     / b
  /  4   \   /   2  \           \   /
 /        \ /        \           \ /
(----------•----------)           A
 \        / \        /
  \  5   /   \   1  /
   \    /     \    /
    \  /   0   \  /
     \/_________\/

  The original dream was to use servo motors mounted on arms but I've given up on that
  now I'm gonna attach a wire perimeter to a series of rails. Each rail will have a peg 
  that connects the wire to a belt hidden inside the rail which is driven by a servo motor
  or stepper idk the difference I really have no idea what I'm doing

*/
function betterRandom(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function Hexagon() {
  //this.sideLength = 300;  // Starting side length in px
  if (windowHeight < windowWidth) {
    this.sideLength = windowHeight / 3;
  } else {
    this.sideLength = windowWidth / 3; //forgot mobile gremlins exist
  }

  this.animStage = 0;
  //Animations(stages): unisonVertexInOut (expToMax, conMaxToMin, expMinTo120)

  this.hexTri = []; // triangles are stored in this list as objects
  for (var i = 0; i < 6; i++) { // this initializes the objects and gives them their default values
    this.hexTri[i] = {
      A: 60,
      B: 60,
      C: 60, // angle 'C' is the same vertex that will contain the motor
      a: this.sideLength, // side  'a' is the only one that will be drawn
      b: (this.a / sin(this.A)) * this.B, //they both just equal sideLength but I just wanted to future proof for something that never came
      c: (this.a / sin(this.A)) * this.C,

      nB: this.B, // new sides and angles for offset
      nC: this.C,
      nb: this.b,
      nc: this.c
    }
  }

  // I was planning on having different 'types' of animations each having its own little bundle of vars but that ended up being a dead end
  this.UVIO = { // all info needed for unisonVertexInOut
    maxRate: 1, // Entered once | rate = random(lowerMaxRate,maxRate)
    lowerMaxRate: 0.6, // Entered once
    minRate: 0.1, // should be left as 0.1  its so that the speed never reaches 0

    rate: 0, // to be solved in this.unisonVertexInOut

    maxAngle: 180, // to be modified
    minAngle: 60, // to be modified

    groupSpinMode: 0, // used in switch case to set spin animation
    stagSpinMode: 0, // same thing for stagger

    groupSpin: 0, // group spin controls the angle of the base hexagon. This rotation is independent from stagger spin allowing some neat interactions in rotation
    stagSpin: 120 / hexCount, // stagger spin rotates this hexagon and every hexagon above it. All hexagons are the same amount and direction
  }


  this.unisonVertexInOut = function() {
    /* unisonVertexInOut anim
       ↖____↙         ↘____↗
       /    \         /    \
      /      \       /      \
    →(        )→   ←(        )←
      \      /       \      /
       \____/         \____/
      ↙      ↖       ↗     ↘
    120 to maxAngle to minAngle to 120
    */

    cAngle = (this.hexTri[0].B + this.hexTri[1].C); // current angle of (this.hexTri[0].B + this.hexTri[1].C)
    cMidAngle = ((this.UVIO.minAngle + this.UVIO.maxAngle) / 2); // current angle in the middle of minAngle and maxAngle

    if ((cAngle >= 0) && (cAngle <= 240)) {
      stroke(color('#77BA99')); // green
      // var normalColor = color('#77BA99');
      // normalColor.setAlpha(255)
      // stroke(color(normalColor)); // green

    } else if (((cAngle < 0) && (cAngle >= -120)) || ((cAngle > 240) && (cAngle <= 360))) {
      stroke(color('#D33F49')); // red ish
      // var intersectColor = color('#D33F49');
      // intersectColor.setAlpha(120)
      // stroke(intersectColor); // red ish
    } else {
      print("UNEXPECTED cAngle: ", cAngle);
    }

    if (this.UVIO.maxAngle <= 120) {
      print("INPUT ERROR maxAngle cannot equal or be below 120!");
      print("maxAngle: ", this.UVIO.maxAngle);
      this.UVIO.maxAngle = 121;
    }
    if (this.UVIO.minAngle >= 120) {
      print("INPUT ERROR minAngle cannot equal or be above 120!");
      print("minAngle: ", this.UVIO.minAngle);
      this.UVIO.minAngle = 119;
    }


    if (cAngle <= cMidAngle) { // decides which equation to use depending on what side of the center we're on
      this.UVIO.rate = ((Math.atan((cAngle - this.UVIO.minAngle) / 20) / (PI / 2)) * (this.UVIO.maxRate - this.UVIO.minRate)) + this.UVIO.minRate;
    } else if (cMidAngle < cAngle) {
      this.UVIO.rate = ((-1 * Math.atan((cAngle - this.UVIO.maxAngle) / 20) / (PI / 2)) * (this.UVIO.maxRate - this.UVIO.minRate)) + this.UVIO.minRate;
    }

    if (this.animStage == 1) {
      this.UVIO.rate *= -1; // makes rate negative , unlike the code above it where -1 * the math gives us the inverse of the equation or something idk dude
    }

    if (keyIsDown(UP_ARROW)) { // stops everything and print current data
      this.UVIO.rate = 0;
      print("cAngle: ", cAngle)
      print("stagSpin: ", hex.UVIO.stagSpin);
      print("")
    }
    if (keyIsDown(LEFT_ARROW)) {
      this.UVIO.stagSpin -= 0.5;
    }
    if (keyIsDown(RIGHT_ARROW)) {
      this.UVIO.stagSpin += 0.5;
    }

    switch (this.UVIO.groupSpinMode) {
      case 0:
        break; // does nothing

      case 1:
        this.UVIO.groupSpin += this.UVIO.rate; //rotates the hexagon proportional to rate
        // rotate(this.UVIO.groupSpin);
        break;

      case 2:
        this.UVIO.groupSpin -= this.UVIO.rate;
        // rotate(this.UVIO.groupSpin);
        break;
    }

    switch (this.UVIO.stagSpinMode) {
      case 0:
        break; // nada

      case 1:
        this.UVIO.stagSpin += (this.UVIO.rate);
        break;

      case 2:
        this.UVIO.stagSpin += (this.UVIO.rate) / 2;
        break;

      case 3:
        this.UVIO.stagSpin -= (this.UVIO.rate);
        break;

      case 4:
        this.UVIO.stagSpin += (this.UVIO.rate) / 2;
        break;
    }

    if ((this.UVIO.groupSpin >= 360) || (this.UVIO.groupSpin <= -360)) {
      this.UVIO.groupSpin = 0;
    }
    if ((this.UVIO.stagSpin >= 360) || (this.UVIO.stagSpin <= -360)) {
      this.UVIO.stagSpin = 0;
    }

    for (i = 0; i < 3; i++) {
      this.hexTri[i * 2].B += this.UVIO.rate; // changes angle B and C together so that angle sum of A + B + C remains == 180
      this.hexTri[i * 2].C -= this.UVIO.rate;
      this.hexTri[i * 2].b = (this.hexTri[i * 2].a / sin(this.hexTri[i * 2].A)) * sin(this.hexTri[i * 2].B); // using law of sines solve for b and c
      this.hexTri[i * 2].c = (this.hexTri[i * 2].a / sin(this.hexTri[i * 2].A)) * sin(this.hexTri[i * 2].C); // note in this animation angle A and side a are constant

      this.hexTri[(i * 2) + 1].B -= this.UVIO.rate; // same thing for the second triangle in the pair
      this.hexTri[(i * 2) + 1].C += this.UVIO.rate; // except the angle changes are the inverse
      this.hexTri[(i * 2) + 1].b = (this.hexTri[(i * 2) + 1].a / sin(this.hexTri[(i * 2) + 1].A)) * sin(this.hexTri[(i * 2) + 1].B);
      this.hexTri[(i * 2) + 1].c = (this.hexTri[(i * 2) + 1].a / sin(this.hexTri[(i * 2) + 1].A)) * sin(this.hexTri[(i * 2) + 1].C);
      // This feels like a messy way of doing this maybe check back later to optimize
    }

    if ((this.animStage == 0) && ((cAngle) >= this.UVIO.maxAngle)) { // once maxAngle is reached move to stage 1

      //this.UVIO.minAngle = betterRandom(-120, 119); // for no intersect use (0, 119)
      //this.UVIO.minAngle = betterRandom(0, 119);
      this.UVIO.rate = betterRandom(this.UVIO.lowerMaxRate, this.UVIO.maxRate);
      this.animStage = 1;
      this.UVIO.groupSpinMode = betterRandom(0, 2);
      this.UVIO.stagSpinMode = betterRandom(0, 4);

      print("HIT MAX ANGLE: ", this.UVIO.maxAngle);
      print("approach minAngle: ", this.UVIO.minAngle);

      switch (betterRandom(0, 1)) { // I felt like intercepts and concave hexagons were happening to often, this offsets that
        case 0:
          this.UVIO.minAngle = betterRandom(-110, 59); // fancy hexagon with concave and maybe intercept
          break;
        case 1:
          this.UVIO.minAngle = betterRandom(60, 119); // regular hexagon no intercepts or concave
          print("no intercept or concave");
          break;
      }

      print("rate: ", this.UVIO.rate);
      print("");

    } else if ((this.animStage == 1) && ((cAngle) <= this.UVIO.minAngle)) { // once minAngle is reached move to stage 2

      //this.UVIO.maxAngle = betterRandom(121, 360); // for no intersect use (121, 240)
      //this.UVIO.maxAngle = betterRandom(121, 240); 
      this.UVIO.rate = betterRandom(this.UVIO.lowerMaxRate, this.UVIO.maxRate);
      this.animStage = 2;
      this.UVIO.groupSpinMode = betterRandom(0, 2);
      this.UVIO.stagSpinMode = betterRandom(0, 4);

      print("HIT MIN ANGLE: ", this.UVIO.minAngle);
      print("approach maxAngle: ", this.UVIO.maxAngle);

      switch (betterRandom(0, 1)) {
        case 0:
          this.UVIO.maxAngle = betterRandom(181, 350);
          break;
        case 1:
          this.UVIO.maxAngle = betterRandom(121, 180);
          print("no intercept or concave");
          break;
      }
      
      print("rate: ", this.UVIO.rate);
      print("");

    } else if ((this.animStage == 2) && ((cAngle) >= 120)) { // once the angle is returned to the original 120 set -
      this.animStage = 0; // current anim to next in list and set stage to 0

      print("RETURNED TO 120");
      print("");
    }
  }

  this.drawHexByTriangles = function() { // use for rendering hex by drawing each individual triangle | best for debugging
    push();
    noFill();
    strokeWeight(3);

    var originOffSet = (railOffSet / sin(60));
    var lineOffSet = (sin(30) * (railOffSet / sin(60)));

    //circle(0,0, 2);

    for (i = 0; i < 6; i++) {
      // translate(originOffSet, 0); // prevents collisions while also destroying my sanity I wasted so much time trying to fix those gaps (in versions 0.3.3 and older)

      rotate(this.hexTri[i].A) // rotate canvas by angle A
      //line(0, 0, this.hexTri[i].c, 0); // draws first line c
      translate(this.hexTri[i].c, 0); // moves canvas origin to the tip of line c

      //circle(0, 0, 5);
      rotate(180 - this.hexTri[i].B); // rotate canvas by (180 - angle B) we do this to get the outer angle
      line(0, 0, this.hexTri[i].a, 0); // draws line a
      translate(this.hexTri[i].a, 0); // moves to the tip of line a
      //circle(0, 0, 5);

      rotate(180 - this.hexTri[i].C); // same thing with angle C and sides b
      //line(0, 0, this.hexTri[i].b, 0);
      translate(this.hexTri[i].b, 0);

      // rotate(60); // all this moves us back to the original origin
      // translate(-originOffSet, 0);
      // rotate(-60);
    }
    pop();
  }

}


var hex; // soon to be holder of the hexagon object, god upon polygons all hail the bestagon im so sleep deprived
var railOffSet = 10; // never got this to work but also too scared to delete
var hexCount = 3; // declares how many bestagons to draw
function setup() {
  frameRate(120);
  hex = new Hexagon();
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);
}

function draw() {
  push();
  background(color('#262730')); // dark mode
  //background(color('#EFF0D1')); // light mode
  stroke(color('#77BA99'));

  translate(windowWidth / 2, windowHeight / 2); // moves origin to the center of the canvas
  hex.unisonVertexInOut();

  rotate(hex.UVIO.groupSpin);
  for (var i = 0; i < hexCount; i++) { //draws hexCount amount of hexagons and evenly spaces them out
    hex.drawHexByTriangles();
    rotate(hex.UVIO.stagSpin);
    //print("stagSpin: ", hex.UVIO.stagSpin);
  }
  pop();
}
