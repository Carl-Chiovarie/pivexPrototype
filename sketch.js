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

  The original dream was to use servo motors mounted on arms but I gave up on that dream
  now I'm gonna attach a wire perimeter to a series of rails. Each rail will have a peg 
  that connects the wire to a belt hidden inside the rail which is driven by a servo motor
  or stepper idk the difference I really have no idea what I'm doing

*/

function betterRandom(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function decBetterRandom(min, max, precision) {
  min *= precision;
  max *= precision;
  return (Math.floor(Math.random() * (max - min + 1)) + min) / precision;
}

function Hexagon() {
  this.lawOfSines = function (input, angleOrSide, knownAngle, knownSide) {
    adjAngle = 0; // adjusted angle

    if (angleOrSide == "input angle") {
      side =
        (knownSide / Math.sin(knownAngle * (Math.PI / 180))) *
        Math.sin(input * (Math.PI / 180));
      return side;
    } else if (angleOrSide == "input side") {// This might* not work
      angle = 0;
      checkAngle = input * (Math.sin(knownAngle * (Math.PI / 180)) / knownSide);

      if (checkAngle < -1 || 1 < checkAngle) {
        x = Math.floor(checkAngle);
        return Math.asin((checkAngle - x) * (Math.PI / 180)) + x * 90;
      } else {
        return Math.asin(checkAngle * (Math.PI / 180));
      }
    } else {
      print("ERROR invalid input for lawOfSines");
    }
  };

  this.lawOfCosines = function (
    firstSide,
    angle_or_angleSide,
    secondSide,
    SAS_Or_SSS
  ) {
    if (SAS_Or_SSS == "SAS") {
      angle = angle_or_angleSide;
      returnSide = Math.sqrt(
        Math.pow(firstSide, 2) +
          Math.pow(secondSide, 2) -
          2 * firstSide * secondSide * Math.cos(angle * (Math.PI / 180))
      );
      return returnSide;
    } else if (SAS_Or_SSS == "SSS") {
      angleSide = angle_or_angleSide;
      checkAngle =
        -Math.pow(angleSide, 2) / (2 * firstSide * secondSide) +
        firstSide / (2 * secondSide) +
        secondSide / (2 * firstSide);
      returnAngle = 0;

      if (checkAngle < -1 || 1 < checkAngle) {
        x = Math.floor(checkAngle);
        returnAngle = acos(checkAngle - x) - x * 90;
      } else {
        returnAngle = acos(checkAngle);
      }

      if (angleSide < 0) { // If the original angleSide input was negative then squaring it would make it positive, so we need to correct it and make the output negative
        returnAngle *= -1;
      }
      return returnAngle;
    } else {
      print("ERROR invalid input for lawOfCosines");
    }
  };

  this.sideLength = 0;
  if (windowHeight < windowWidth) {
    this.sideLength = windowHeight / 3;
  } else {
    this.sideLength = windowWidth / 3; //forgot mobile gremlins exist
  }

  this.railLen = this.sideLength / sin(60); // length of supporting rail
  print("sideLength: ", this.sideLength);
  print("railLen: ", this.railLen);

  this.animStage = 0;
  // Animations(stages): unisonVertexInOut (expand from 120 To Max, condense from Max To Min, expand from Min To 120)
  // why 120? I honestly don't remember and I'm not gonna bother to figure out why

  this.hexTri = []; // triangles are stored in this list as objects
  this.hexTri[0] = {
    // this initializes the objects and gives them their default values
    A: 60,
    B: 60, //120
    C: 60, //0
    a: this.sideLength, // side  'a' is the only one that will be drawn
    b: this.lawOfSines(this.B, "input angle", this.A, this.a), //they both just equal sideLength but I just wanted to future proof for something that never came
    c: this.lawOfSines(this.B, "input angle", this.A, this.a),

    nc: this.c - lineOffSet,
    nb: this.b + lineOffSet,
    na: this.lawOfCosines(this.nc, this.A, this.nb, "SAS"),
    nB: this.lawOfCosines(this.na, this.nb, this.nc, "SSS"),
    nC: 120 - this.B,
  };
  this.hexTri[1] = {
    A: 60,
    B: 60, //0
    C: 60, //120
    a: this.sideLength,
    b: this.lawOfSines(this.B, "input angle", this.A, this.a),
    c: this.lawOfSines(this.B, "input angle", this.A, this.a),

    nc: this.c - lineOffSet,
    nb: this.b + lineOffSet,
    na: this.lawOfCosines(this.nc, this.A, this.nb, "SAS"),
    nB: this.lawOfCosines(this.na, this.nb, this.nc, "SSS"),
    nC: 120 - this.B,
  };

  // I was planning on having different 'types' of animations each having its own little bundle of vars but that ended up being a dead end
  this.UVIO = {
    // all info needed for unisonVertexInOut
    upperMaxRate: 1.6, // Entered once | rate = random(lowerMaxRate,maxRate)
    lowerMaxRate: 0.9, // Entered once
    minRate: 0.1, // should be left as 0.1  its so that the speed never reaches 0

    easeIn: 20, // adjusts smoothens of graph check Desmos graph "Pivex rate math" for visual example

    maxRate: 1, // max rate is calculated for this approach
    rate: 0,    // rate the speed derived from minRate and maxRate for this frame

    maxAngle: 180, // to be modified
    minAngle: 60,  // to be modified

    groupSpinMode: 0, // used in switch case to set spin animation
    stagSpinMode: 0,  // same thing but for stagger

    groupSpin: 0, // group spin controls the angle of the base hexagon. This rotation is independent from stagger spin allowing some neat interactions in rotation
    //stagSpin: 120 / hexCount, // stagger spin rotates this hexagon and every hexagon above it. All hexagons are the same amount and direction
    stagSpin: 120 / hexCount //60 //40
  };

  this.unisonVertexInOut = function () {
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

    cAngle = this.hexTri[0].B + this.hexTri[1].C; // current angle of (this.hexTri[0].B + this.hexTri[1].C). This is the first completed angle of the hexagon
    cMidAngle = (this.UVIO.minAngle + this.UVIO.maxAngle) / 2; // current angle in the middle of minAngle and maxAngle

    if (cAngle >= 0 && cAngle <= 240) {
      // stroke(color('#77BA99')); // green
    } else if (
      (cAngle < 0 && cAngle >= -120) ||
      (cAngle > 240 && cAngle <= 360)
    ) {
      //stroke(color('#D33F49')); // red ish
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

    if (cAngle <= cMidAngle) {
      // decides which equation to use depending on what side of the center we're on
      this.UVIO.rate =
        (Math.atan((cAngle - this.UVIO.minAngle) / this.UVIO.easeIn) /
          (Math.PI / 2)) *
          (this.UVIO.maxRate - this.UVIO.minRate) +
        this.UVIO.minRate;
    } else if (cMidAngle < cAngle) {
      this.UVIO.rate =
        ((-1 * Math.atan((cAngle - this.UVIO.maxAngle) / this.UVIO.easeIn)) /
          (Math.PI / 2)) *
          (this.UVIO.maxRate - this.UVIO.minRate) +
        this.UVIO.minRate;
    }

    if (this.animStage == 1) {
      this.UVIO.rate *= -1; // makes rate negative , unlike the code above it where -1 * the math gives us the inverse of the equation or something idk dude
    }

    //##################################################
    // this.UVIO.rate = 0 // use this for debugging
    //##################################################

    if (keyIsDown(UP_ARROW)) {
      // stops everything and prints* current data    the actual printing is done in another function at the very bottom
      this.UVIO.rate = 0;
    }

    switch (this.UVIO.groupSpinMode) {
      case 0:
        break; // does nothing

      case 1:
        this.UVIO.groupSpin += this.UVIO.rate;
        break;

      case 2:
        this.UVIO.groupSpin -= this.UVIO.rate; // rotates the base hexagon proportional to rate
        break;

      case 3: // I have it do nothing twice since better random chooses the last option unproportionately less I think*
        break;
    }
    switch (this.UVIO.stagSpinMode) {
      case 0:
        break; // nada

      case 1:
        this.UVIO.stagSpin -= this.UVIO.rate;
        break;

      case 2:
        this.UVIO.stagSpin += this.UVIO.rate / 2;
        break;

      case 3:
        this.UVIO.stagSpin -= this.UVIO.rate;
        break;

      case 4:
        this.UVIO.stagSpin += this.UVIO.rate / 2;
        break;

      case 5:
        break;
    }

    if (this.UVIO.groupSpin >= 360 || this.UVIO.groupSpin <= -360) {
      this.UVIO.groupSpin = 0;
      print("##################################")
      print("groupSpin past +-360!")
      print("")
    }
    if (this.UVIO.stagSpin >= 120 || this.UVIO.stagSpin <= -120) {
      this.UVIO.stagSpin = 0;
      print("##################################")
      print("stagSpin past +-120!")
      print("")
    }

    // solves triangles in pairs
    this.hexTri[0].B += this.UVIO.rate; // changes angle B and C together so that angle sum of B + C remains == 120
    this.hexTri[0].C -= this.UVIO.rate;
    this.hexTri[0].b = this.lawOfSines( 
      this.hexTri[0].B,
      "input angle",
      this.hexTri[0].A,
      this.hexTri[0].a
    ); 
    this.hexTri[0].c = this.lawOfSines(
      this.hexTri[0].C,
      "input angle",
      this.hexTri[0].A,
      this.hexTri[0].a
    ); 
    // use law of sines to solve for sides  b and c
    // note for the standard non offset hex angle A and side a are constant so we can use law of sines

    // all n values are used to solve for the offset hexagon
    this.hexTri[0].nc = this.hexTri[0].c - lineOffSet; // solve for new side c and side b by adding line offset
    this.hexTri[0].nb = this.hexTri[0].b + lineOffSet;
    this.hexTri[0].na = this.lawOfCosines( // must use law of cosines since side 'a' no longer relates to sides na and nb
      this.hexTri[0].nc,
      this.hexTri[0].A,
      this.hexTri[0].nb,
      "SAS"
    ); // use law of cosines to solve for new side a
    this.hexTri[0].nB = this.lawOfCosines( // use all sides in law of cosines to solve for new angle B. Not using all side leads to two possible solutions. See Notion doc for example
      this.hexTri[0].na,
      this.hexTri[0].nb,
      this.hexTri[0].nc,
      "SSS"
    );
    this.hexTri[0].nC = 120 - this.hexTri[0].nB; // instead of calling lawOfCosines twice which is pretty expensive we can subtract 120 from nB for the same solution

    // Second triangle
    this.hexTri[1].B -= this.UVIO.rate; // same thing for the second triangle in the pair
    this.hexTri[1].C += this.UVIO.rate; // except the angle changes are the inverse
    this.hexTri[1].b = this.lawOfSines(
      this.hexTri[1].B,
      "input angle",
      this.hexTri[1].A,
      this.hexTri[1].a
    ); 
    this.hexTri[1].c = this.lawOfSines(
      this.hexTri[1].C,
      "input angle",
      this.hexTri[1].A,
      this.hexTri[1].a
    ); // using law of sines solve for sides b and c

    this.hexTri[1].nc = this.hexTri[1].c - lineOffSet; // same math as before. I could have written some clever function for this but at this point I'm just too jaded
    this.hexTri[1].nb = this.hexTri[1].b + lineOffSet;
    this.hexTri[1].na = this.lawOfCosines(
      this.hexTri[1].nc,
      this.hexTri[1].A,
      this.hexTri[1].nb,
      "SAS"
    );
    this.hexTri[1].nB = this.lawOfCosines(
      this.hexTri[1].na,
      this.hexTri[1].nb,
      this.hexTri[1].nc,
      "SSS"
    );
    this.hexTri[1].nC = 120 - this.hexTri[1].nB;
    // useful note max na is just a + railOffSet and min na is just a - railOffSet

    if (this.animStage == 0 && cAngle >= this.UVIO.maxAngle) {
      // once maxAngle is reached move to stage 1
      this.UVIO.maxRate = decBetterRandom(
        this.UVIO.lowerMaxRate,
        this.UVIO.upperMaxRate,
        100
      );
      this.animStage = 1;
      this.UVIO.groupSpinMode = betterRandom(0, 3);
      this.UVIO.stagSpinMode = betterRandom(0, 5);

      print("HIT MAX ANGLE: ", this.UVIO.maxAngle);
      switch (
        betterRandom(0, 2) // I felt like intercepts / concave hexagons were happening too often, this offsets that
      ) {
        case 0:
          this.UVIO.minAngle = betterRandom(60, 119); // regular hexagon no intercepts or concave
          print("no intercept or concave");
          break;
        case 1:
          this.UVIO.minAngle = betterRandom(60, 119);
          print("no intercept or concave");
          break;
        case 2:
          this.UVIO.minAngle = betterRandom(-110, 59); // we don't allow -120 since that would be a double intercept
          break;
      }
      print("approach minAngle: ", this.UVIO.minAngle);
      print("maxRate: ", this.UVIO.maxRate);
      print("groupSpin: ", this.UVIO.groupSpin);
      print("stagSpin: ", this.UVIO.stagSpin);
      print("");
    } else if (this.animStage == 1 && cAngle <= this.UVIO.minAngle) {
      // once minAngle is reached move to stage 2
      this.UVIO.maxRate = decBetterRandom(
        this.UVIO.lowerMaxRate,
        this.UVIO.upperMaxRate,
        100
      );
      this.animStage = 2;
      this.UVIO.groupSpinMode = betterRandom(0, 3);
      this.UVIO.stagSpinMode = betterRandom(0, 5);

      print("HIT MIN ANGLE: ", this.UVIO.minAngle);
      switch (
        betterRandom(0, 2) // I felt like intercepts / concave hexagons were happening too often, this offsets that
      ) {
        case 0:
          this.UVIO.maxAngle = betterRandom(121, 180); //default 60 degree difference
          print("no intercept or concave");
          break;
        case 1:
          this.UVIO.maxAngle = betterRandom(121, 180);
          print("no intercept or concave");
          break;
        case 2:
          this.UVIO.maxAngle = betterRandom(181, 350); // we don't allow 360 since that would be a double intercept
          break;
      }
      print("approach maxAngle: ", this.UVIO.maxAngle);
      print("maxRate: ", this.UVIO.maxRate);
      print("groupSpin: ", this.UVIO.groupSpin)
      print("stagSpin: ", this.UVIO.stagSpin);
      print("");
    } else if (this.animStage == 2 && cAngle >= 120) {
      // once the angle is returned to the original 120 set -
      this.animStage = 0; // current anim to next in list and set stage to 0

      // print("RETURNED TO 120");
      // print("");
    }
  };

  this.drawHexByTriangles = function () {
    // use for rendering hex by drawing each individual triangle | best for debugging
    push();
    // code for drawing rails
    for (i = 0; i < 0; i++) {
      currentTri = i % 2;
      translate(originOffSet, 0); // prevents collisions while also destroying my sanity I wasted so much time trying to fix those gaps (in versions 0.3.3 and older)
      rotate(this.hexTri[currentTri].A); // rotate canvas by angle A

      strokeWeight(5);
      stroke(color("#262730"));
      line(-this.railLen - originOffSet, 0, this.railLen, 0); // max length of rail adjusted for offset

      strokeWeight(2);
      stroke(color("GREY"));
      line(-this.railLen - originOffSet, 0, this.railLen, 0); // max length of rail adjusted for offset

      translate(this.hexTri[currentTri].c, 0); // moves canvas origin to the tip of line c
      rotate(180 - this.hexTri[currentTri].B); // rotate canvas by (180 - angle B) we do this to get the outer angle
      translate(this.hexTri[currentTri].a, 0); // moves to the tip of line a
      rotate(180 - this.hexTri[currentTri].C); // same thing with angle C and sides b
      translate(this.hexTri[currentTri].b, 0);

      rotate(60); // all this moves us back to the original origin
      translate(-originOffSet, 0);
      rotate(-60);
    }
    pop();

    // code for drawing offset hexagon
    push();
    for (i = 0; i < 6; i++) {
      currentTri = i % 2;
      translate(originOffSet, 0);
      rotate(this.hexTri[currentTri].A); // rotate canvas by angle A

      // strokeWeight(3);
      // stroke(color("#262730"));
      // line(-this.railLen - originOffSet, 0, this.railLen, 0);  // max length of rail adjusted for offset
      // strokeWeight(1);
      // stroke(color("#3b3c44"));
      // line(-this.railLen - originOffSet, 0, this.railLen, 0);  // max length of rail adjusted for offset

      strokeWeight(3);
      stroke(color("GREY"));
      // line(0, 0, this.hexTri[currentTri].nc, 0);
      translate(this.hexTri[currentTri].nc, 0);
      rotate(180 - this.hexTri[currentTri].nB);

      // stroke(color("#77BA99"));
      // fill(color("#77BA99"));
      // circle(0, 0, 5);

      strokeWeight(5);
      stroke(color("#5f947a"));
      line(0, 0, this.hexTri[currentTri].na, 0);
      strokeWeight(2);
      stroke(color("#77BA99"));
      line(0, 0, this.hexTri[currentTri].na, 0);

      // circle(0, 0, 5);

      translate(this.hexTri[currentTri].na, 0);
      rotate(180 - this.hexTri[currentTri].nC);
      // rotate(180 - this.hexTri[currentTri].C);

      strokeWeight(3);
      stroke(color("GREY"));
      // line(0, 0, this.hexTri[currentTri].nb, 0);
      translate(this.hexTri[currentTri].nb, 0);

      rotate(60); // all this moves us back to the original origin
      translate(-originOffSet, 0);
      rotate(-60);
      
    }
    pop();

    // code for drawing hexagon with no gap closing code
    push();
    for (i = 0; i < 0; i++) {
      translate(originOffSet, 0); // prevents collisions while also destroying my sanity I wasted so much time trying to fix those gaps (in versions 0.3.3 and older)
      currentTri = i % 2;

      rotate(this.hexTri[currentTri].A); // rotate canvas by angle A

      strokeWeight(5);
      stroke(color("#262730"));
      line(-this.railLen - originOffSet, 0, this.railLen, 0); // max length of rail adjusted for offset

      strokeWeight(2);
      stroke(color("GREY"));
      line(-this.railLen - originOffSet, 0, this.railLen, 0); // max length of rail adjusted for offset

      strokeWeight(2);
      stroke(color("GREY"));
      // line(0, 0, this.hexTri[currentTri].c, 0); // draws first line c
      translate(this.hexTri[currentTri].c, 0); // moves canvas origin to the tip of line c

      strokeWeight(3);
      stroke(color("#77BA99"));
      // circle(0, 0, 5);
      rotate(180 - this.hexTri[currentTri].B); // rotate canvas by (180 - angle B) we do this to get the outer angle

      line(0, 0, this.hexTri[currentTri].a, 0); // draws line a
      translate(this.hexTri[currentTri].a, 0); // moves to the tip of line a

      // circle(0, 0, 7);

      strokeWeight(2);
      stroke(color("GREY"));
      rotate(180 - this.hexTri[currentTri].C); // same thing with angle C and sides b

      // line(0, 0, this.hexTri[currentTri].b, 0);
      translate(this.hexTri[currentTri].b, 0);

      rotate(60); // all this moves us back to the original origin
      translate(-originOffSet, 0);
      rotate(-60);
    }
    pop();
  };
}

var hex; // soon to be holder of the hexagon object, god upon all polygons all hail the bestagon im so sleep deprived
var hexCount = 3; // declares how many bestagons to draw
// sideLength is declared in the Hexagon object. By default it scales with the screen size but it can be over written
var railOffSet = 0; // 24mm
var originOffSet;
var lineOffSet;

function setup() {
  angleMode(DEGREES);
  frameRate(60);
  createCanvas(windowWidth, windowHeight);

  hex = new Hexagon();
  originOffSet = railOffSet / Math.sin(60 * (Math.PI / 180));
  lineOffSet =
    Math.sin(30 * (Math.PI / 180)) *
    (railOffSet / Math.sin(60 * (Math.PI / 180)));

  print("railOffSet: ", railOffSet);
  print("originOffSet: ", originOffSet);
  print("lineOffSet: ", lineOffSet);
  print("");
  // hex.unisonVertexInOut(); // when rate is set to zero and draw is disabled use this. I just used this for bug testing specific angles
}

function draw() {
  background(color("#262730")); // dark mode
  // background(color('#EFF0D1')); // light mode

  translate(windowWidth / 2, windowHeight / 2); // moves origin to the center of the canvas
  hex.unisonVertexInOut();

  // rotate(30); // moves hex onto its side
  rotate(hex.UVIO.groupSpin);
  for (var i = 0; i < hexCount; i++) {
    //draws hexCount amount of hexagons and evenly staggers them stagSpin apart
    hex.drawHexByTriangles();
    rotate(hex.UVIO.stagSpin);
  }
}

function keyPressed() {
  if (keyCode === UP_ARROW) {
    // hex.UVIO.rate = 0; // doesn't work here* since hex.unisonVertexInOut() has already done all the math with rate and changing it doesn't matter anymore
    print("a perimeter: ", (hex.hexTri[0].a + hex.hexTri[1].a) * 3);
    print("na perimeter: ", (hex.hexTri[0].na + hex.hexTri[1].na) * 3);

    print("");

    print("hex.tri[0]");
    print("cAngle: ", cAngle);
    print("stagSpin: ", hex.UVIO.stagSpin);
    print("A: ", hex.hexTri[0].A);
    print("B: ", hex.hexTri[0].B);
    print("C: ", hex.hexTri[0].C);
    print("nA: ", hex.hexTri[0].nA);
    print("nB: ", hex.hexTri[0].nB);
    print("nC: ", hex.hexTri[0].nC);
    print("a: ", hex.hexTri[0].a);
    print("b: ", hex.hexTri[0].b);
    print("c: ", hex.hexTri[0].c);
    print("na: ", hex.hexTri[0].na);
    print("nb: ", hex.hexTri[0].nb);
    print("nc: ", hex.hexTri[0].nc);

    print("A + B + C: ", hex.hexTri[0].A + hex.hexTri[0].B + hex.hexTri[0].C);
    print(
      "A + nB + nC: ",
      hex.hexTri[0].A + hex.hexTri[0].nB + hex.hexTri[0].nC
    );

    print("");

    print("hex.tri[1]");
    print("cAngle: ", cAngle);
    print("stagSpin: ", hex.UVIO.stagSpin);
    print("A: ", hex.hexTri[1].A);
    print("B: ", hex.hexTri[1].B);
    print("C: ", hex.hexTri[1].C);
    print("nA: ", hex.hexTri[1].nA);
    print("nB: ", hex.hexTri[1].nB);
    print("nC: ", hex.hexTri[1].nC);
    print("a: ", hex.hexTri[1].a);
    print("b: ", hex.hexTri[1].b);
    print("c: ", hex.hexTri[1].c);
    print("na: ", hex.hexTri[1].na);
    print("nb: ", hex.hexTri[1].nb);
    print("nc: ", hex.hexTri[1].nc);

    print("A + B + C: ", hex.hexTri[1].A + hex.hexTri[1].B + hex.hexTri[1].C);
    print(
      "A + nB + nC: ",
      hex.hexTri[1].A + hex.hexTri[1].nB + hex.hexTri[1].nC
    );

    print("");
  }
}
