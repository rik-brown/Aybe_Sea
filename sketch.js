/*
 * 2016.05.04 16:53 Added debug line which indicates heading of Color Vector
 * 2016.05.06 08:50 SpawnCol is 180 degrees offset from expected value
 *                  - added a 'rotate PI' which seems to help
 *                  - But WHY is it needed?
 */

var sketchContainer = "sketch";
var guiContainer = "sketch-gui";

var colony; // A colony object
var col; // PVector col needs to be declared to allow for random picker

var colonySize; // Max number of cells in the colony
var bkgColHSV;
var bkgColor; // Backgr0und colour
var cellFillColHSV;
var cellFillColorcellEndSize; // Cell fill colour
var cellFillAlpha;
var cellStrokeColHSV;
var cellStrokeColor; // Cell fill colour
var cellStrokeAlpha;
var cellStartSize; // Cell radius at spawn
var cellEndSize; // Cell radius at 'death by size limit'
var growth; // Growth rate for cell
var fertileStart; // Cell becomes fertile when size has shrunk to this % of startSize
var trails; // If false, background will refresh on every draw cycle
var veils; // If true, a transparent rect will be drawn on every draw cycle
var wraparound; // If true, cells leaving the canvas will wraparound, else rebound from walls
var spawning; // If false, cells will not be run
var moving; // If false, cells will not move
var perlin; // Gives non-linear movement
var growing; // If false, cells will not grow
var debugMain; // If true, debug functions for main draw() loop are enabled (using Print)
var debugCellText; // If true, debug functions for Cell class are enabled (using Text)
var debugCellPrintln; // If true, debug functions for Cell class are enabled (using Println)
var debugColony; // If true, debug functions for Colony class are enabled


function setup() {
  p = new parameters();
  gui = new dat.GUI();
  initGUI();
  
  createCanvas(windowWidth, windowHeight - 4);

  //frameRate(10); // Useful for debugging

  colorMode(HSB, 360, 100, 100, 100);
  smooth();
  ellipseMode(RADIUS);
  background(p.bkgColor);
  colony = new Colony(p.colonySize, p.cellStartSize);
}

function draw() {
  if (!p.trails || p.debugCellText) {background(p.bkgColor);}
  if (p.veils) {veil();} // Draws a near-transparent 'veil' in background colour over the  frame
  colony.run();
  if (colony.cells.length === 0 && keyIsPressed) {
    // Repopulate the colony if it suffers an extinction
    //screendump(); //WARNING! Need to stop after doing this once!
    //veil();                       // Draw a veil over the previous colony to gradually fade it into oblivion
      background(p.bkgColor); // For greyscale background
    populateColony();
  }
}

function populateColony() {
  colony = new Colony(p.colonySize, p.cellStartSize); //Could Colony receive a color-seed value (that is iterated through in a for- loop?) (or randomized?)
 // colony = new Colony(10, rStart); // Populate the colony with a single cell. Useful for debugging
}

function veil() {
  var transparency = 1; // 255 is fully opaque, 1 is virtually invisible
  noStroke();
  fill(hue(p.bkgColor), saturation(p.bkgColor), brightness(p.bkgColor), transparency);
  rect(-1, -1, width + 1, height + 1);
}

// We can add a creature manually if we so desire
function mousePressed() {
  var mousePos = createVector(mouseX, mouseY);
  if (mousePos.x < width) {
    if (p.debugMain) {print("xx " + String(mousePos));}
    if (p.debugMain) {print("yy " + String(p.cellFillColor));}
    if (p.debugMain) {print("zz " + String(p.cellStrokeColor));}
    //println("cellFillColor: " + p.cellFillColor + "   cellFillAlpha: " + p.cellFillAlpha);
    //println("cellStrokeColor: " + p.cellStrokeColor + "   cellStrokeAlpha: " + p.cellStrokeAlpha);
    colony.spawn(mousePos, p.cellFillColor, p.cellStrokeColor, p.cellStartSize);
  }
}

function mouseDragged() {
  var mousePos = createVector(mouseX, mouseY);
  if (mousePos.x < width) {
    if (p.debugMain) {print("xx " + String(mousePos));}
    if (p.debugMain) {print("yy " + String(p.cellFillColor));}
    if (p.debugMain) {print("zz " + String(p.cellStrokeColor));}
    //println("cellFillColor: " + p.cellFillColor + "   cellFillAlpha: " + p.cellFillAlpha);
    //println("cellStrokeColor: " + p.cellStrokeColor + "   cellStrokeAlpha: " + p.cellStrokeAlpha);
    colony.spawn(mousePos, p.cellFillColor, p.cellStrokeColor, p.cellStartSize);
  }
}

function screendump() {
  saveCanvas('test', 'png');
}

function keyTyped() {
  if (key === 'b') {
    var spawnPos = createVector(random(width), random(height));
    var testFillColor = [240, 100, 100];
    var testStrokeColor = [0, 0, 100];
    if (p.debugMain) {print(String(testFillColor));}
    colony.spawn(spawnPos, testFillColor, testStrokeColor, p.cellStartSize);
    //screendump();
  }
  
  if (key === 'g') {
    var spawnPos = createVector(random(width), random(height));
    var testFillColor = [120, 100, 100];
    var testStrokeColor = [0, 0, 100];
    if (p.debugMain) {print(String(testFillColor));}
    colony.spawn(spawnPos, testFillColor, testStrokeColor, p.cellStartSize);
    //screendump();
  }
  
  if (key === 'r') {
    var spawnPos = createVector(random(width), random(height));
    var testFillColor = [0, 100, 100];
    var testStrokeColor = [0, 0, 100];
    if (p.debugMain) {print(String(testFillColor));}
    colony.spawn(spawnPos, testFillColor, testStrokeColor, p.cellStartSize);
    //screendump();
  }
  
  if (key === 'c') {
    colony.cullAll();
  }
  
  if (key === 'd') {
    p.debugCellText = !p.debugCellText;
  }
  
}

var initGUI = function () {

// Add the GUI sections
	var f1 = gui.addFolder('Cells');
	  var controller = f1.add(p, 'colonySize', 2, 200).step(1).name('Colony start size');
	    controller.onChange(function(value) {
	      background(p.bkgColor);
	      colony.cullAll();
	      populateColony();
	    });
	  var controller = f1.add(p, 'cellStartSize', 10, 200).step(1).name('Cell start size');
	    controller.onChange(function(value) {
	      background(p.bkgColor);
	      colony.cullAll();
	      populateColony();
	    });
    var controller = f1.add(p, 'cellEndSize', 1, 50).step(1).name('Cell end size');
	    controller.onChange(function(value) {
	      background(p.bkgColor);
	      colony.cullAll();
	      populateColony();
	    });
	  f1.add(p, 'growth', 0, 1).step(0.01).name('Growth rate');
	  var controller = f1.add(p, 'fertileStart', 0.5, 0.9).step(0.01).name('Fertile radius%');
	    controller.onChange(function(value) {background(p.bkgColor);});
	var f2 = gui.addFolder('Environment');
	  var controller = f2.add(p, 'wraparound').name('Wraparound');
	    controller.onChange(function(value) {background(p.bkgColor);});
	  f2.add(p, 'trails').name('Trails');
	  f2.add(p, 'veils').name('Veils');
	var f3 = gui.addFolder('Background');
	  var controller = f3.addColor(p, 'bkgColHSV').name('Background Colour');
	    controller.onChange(function(value) {
	      p.bkgColor = [value.h, value.s*100, value.v*100];
	      background(p.bkgColor);
	    });
	var f4 = gui.addFolder("Cell Fill");
	  var controller = f4.addColor(p, 'cellFillColHSV').name('Cell Fill Colour');
	    controller.onChange(function(value) {
	      p.cellFillColor = [value.h, value.s*100, value.v*100];
	    });
	  var controller = f4.add(p, 'cellFillAlpha', 0, 100).name('Cell Fill Alpha');
	    controller.onChange(function(value) {populateColony();});
	var f5 = gui.addFolder("Cell Stroke");
	  var controller = f5.addColor(p, 'cellStrokeColHSV').name('Cell Stroke Colour');
	    controller.onChange(function(value) {
	      p.cellStrokeColor = [value.h, value.s*100, value.v*100];
	    });
	  var controller = f5.add(p, 'cellStrokeAlpha', 0, 100).name('Cell Stroke Alpha');
	    controller.onChange(function(value) {populateColony();});
  var f6 = gui.addFolder("Actions");
    f6.add(p, 'moving').name('Moving');
    f6.add(p, 'perlin').name('Perlin');
    f6.add(p, 'spawning').name('Spawning');
    f6.add(p, 'growing').name('Growing');
  var f7 = gui.addFolder("Debug");
    f7.add(p, 'debugMain').name('Debug:Main');
    f7.add(p, 'debugCellText').name('Debug:Cell(txt)');
    f7.add(p, 'debugCellPrintln').name('Debug:Cell(print)');
    f7.add(p, 'debugColony').name('Debug:Colony');

}


var parameters = function () {
  this.colonySize = 3; // Max number of cells in the colony
  this.bkgColHSV = { h: 0, s: 0, v: 1 };
  this.bkgColor = [0, 0, 100]; // Background colour
  this.cellFillColHSV = { h: 0, s: 1, v: 1 };
  this.cellFillColor = [0, 100, 100]; // Cell colour
  this.cellFillAlpha = 100;
  this.cellStrokeColHSV = { h: 180, s: 1, v: 1 };
  this.cellStrokeColor = [180, 100, 100]; // Cell colour
  this.cellStrokeAlpha = 0;
  this.cellStartSize = 150; // Cell radius at spawn
  this.cellEndSize = 2;
  this.growth = 0.08;
  this.fertileStart = 0.9; // Cell becomes fertile when size has shrunk to this % of startSize
  this.wraparound = true; // If true, cells leaving the canvas will wraparound, else rebound from walls
  this.trails = false;
  this.veils = false;
  this.moving = true;
  this.perlin = false;
  this.spawning = true;
  this.growing = true;
  this.debugMain = false; 
  this.debugCellText = false;
  this.debugCellPrintln = false;
  this.debugColony = false;
}



/* ------------------------------------------------------------------------------------------------------------- */

// Colony class

// CONSTRUCTOR: Create a 'Colony' object, initially populated with 'num' cells
function Colony(num, rStart_) { // Imports 'num' from Setup in main, the number of Cells in initial spawn 
  // Start with an array for all cells
  this.cells = [];

  // VARIABLES

  var colonyMin = 10;
  var colonyMax = 200;
  var colRand = random(-PI, PI);
  
  // Create initial population of cells  
  for (var i = 0; i < num; i++) {
    var pos = createVector(random(width), random(height)); // Initial position vector is random
    //var pos = createVector(width/2, height/2);           // Initial position vector is center of canvas
    var dna = new DNA(); // Get new DNA
    this.cells.push(new Cell(pos, p.cellFillColor, p.cellStrokeColor, dna, p.cellStartSize)); // Add new Cell with DNA
  }

  this.spawn = function(mousePos, cellFillColor_, cellStrokeColor_, cellStartSize_) {
    // Spawn a new cell (called by e.g. MousePressed in main, accepting mouse coords for start position)
    var dna = new DNA();
    var cellStartSize = cellStartSize_;
    var cellFillColor = cellFillColor_;
    var cellStrokeColor = cellStrokeColor_;
    if (p.debugCellPrintln) {
      println("01 About to spawn with hue(cellFillColor)= " + hue(cellFillColor));
      print("02 String(cellFillColor)= " + String(cellFillColor));
    }
    this.cells.push(new Cell(mousePos, cellFillColor, cellStrokeColor, dna, cellStartSize));
  };


  // Run the colony
  this.run = function() {

    if (p.debugColony) {this.debugTextColony(); }

    // Iterate backwards through the ArrayList because we are removing items
    for (var i = this.cells.length - 1; i >= 0; i--) {
      var c = this.cells[i]; // Get one cell at a time
      c.run(); // Run it (grow, move, check position vs boundaries etc.)

      // If cell has died, remove it from the array
      if (c.dead()) {
        this.cells.splice(i, 1);
      }

      // Iteration to check collision between current cell(i) and the rest
      if (this.cells.length <= colonyMax) { // Don't check for collisons if there are too many cells (wait until some die off)
        for (var others = i - 1; others >= 0; others--) { // Since main iteration (i) goes backwards, this one needs to too
          var other = this.cells[others]; // Get the other cells, one by one
          if (c.age > 20 && other.age > 20) {
            c.checkCollision(other);
          } // Don't check for collisions between newly-spawned cells
        }
      }
    }

    // If there are too many cells, remove some by 'culling' (not actually active now, functional code is commented out)
    if (this.cells.length > colonyMax) {
      this.cull(100);
    }
  };

  this.cull = function(div) { // To remove a proportion of the cells from (the oldest part of) the colony
    var cull = (this.cells.length / div);
    for (var i = cull; i >= 0; i--) { this.cells.splice(i,1); }
    //background(0);                    // Use this to clear the background on cull
    //fill(255, 1);                     // Use this to veil the background on cull
    //rect(-1, -1, width+1, height+1);
  };

  this.cullAll = function() { // To remove ALL cells from the colony 
    for (var i = this.cells.length; i >= 0; i--) {
      this.cells.splice(i, 1);
    }
  };

  this.debugTextColony = function() { // For debug only
    fill(0);
    rect(0,0,300,20);
    fill(360, 100);
    textSize(16);
    text("Nr. cells: " + this.cells.length + " MinLimit:" + colonyMin + " MaxLimit:" + colonyMax, 10, 20);
  };
}

/* ------------------------------------------------------------------------------------------------------------- */

// cell Class
function Cell(pos, cellFillColor_, cellStrokeColor_, dna_, rStart_) {

var fillColVector = createVector(); 
var strokeColVector = createVector(); 

  //  Objects
  
  this.dna = dna_;

  // DNA gene mapping (14 genes)
  // 0 = rMin
  // 1 = rMax
  // 2 = this.growth
  // 3 = step
  // 4 = vMax
  // 5 = fill_HR
  // 6 = fill_SG
  // 7 = fill_BB
  // 8 = fill_Alpha
  // 9 = stroke_HR
  // 10 = stroke_SG
  // 11 = stroke_BB
  // 12 = stroke_Alpha
  // 13 = flatness

  // BOOLEAN
  this.fertile = false; // A new cell always starts of infertile
  /* e.g
  * this.spiralling
  * this.transforming
  * this.coloring
  * this.colortwisting
  * this.perlin
  * this.stepped
  */

  // GROWTH & REPRODUCTION
  this.age = 0; // A new cell always starts with age = 0
  this.fertility = p.fertileStart; // For the time being, fertility threshold is global
  this.health = 300; // Number of frames     before DEATH
  this.collCount = 3; // Number of collisions before DEATH
  
  // SIZE AND SHAPE
  this.rStart = rStart_; // Starting radius, copied from constructor
  this.rMin = p.cellEndSize; // Minimum radius, for the time being a global
  //this.rMin = map(this.dna.genes[0], 0, 1, 1, this.rStart/3);
  this.rMaxMax = 10; // Maximum possible value for maximum radius 
  this.rMax = this.rMin + map(this.dna.genes[1], 0, 1, 3, this.rMaxMax); // Maximum radius
  this.r = this.rStart; // Initial value for radius
  this.flatness = map(this.dna.genes[13], 0, 1, 1, 1); // To make circles into ellipses
  this.growth = p.growth;
  //this.growth = map(this.dna.genes[2], 0, 1, 0.01, 0.3); // Rate at which radius grows
  //this.drawStep = this.r * 2 / this.velocity.mag(); // Used in subroutine in display() to draw ellipse at stepped interval
  this.drawStep = this.r*2; // Alternative calculation (original guess)

  // COMMON
  this.position = pos.copy(); //cell has position
  this.velocity = p5.Vector.random2D(); //cell has velocity

  // PERLIN
  this.vMax = map(this.dna.genes[4], 0, 1, 0, 4); //Maximum velocity when using movePerlin()
  this.xoff = random(1000); //Seed for noise
  this.yoff = random(1000); //Seed for noise
  this.step = map(this.dna.genes[3], 0, 1, 0.001, 0.006); //Step-size for noise

  // COLOUR

  // FILL COLOR
  this.cellFillColor = cellFillColor_;
  this.fillColVector = p5.Vector.fromAngle(radians(hue(this.cellFillColor)));
  this.fillColVector.mult(this.r);
  if (p.debugCellPrintln) {
    println("03 (in cell) this.cellFillColor= " + this.cellFillColor);
    println("04 (in cell) hue(this.cellFillColor)= " + hue(this.cellFillColor));
    println("05 radians(hue(this.cellFillColor)))= " + radians(hue(this.cellFillColor)));
    println("06 this.fillColVector= " + String(this.fillColVector));
  }
  
  //this.fill_Alpha = map(this.dna.genes[8], 0, 1, 0, 255);
  this.fill_Alpha = 10;

  //STROKE COLOR
  this.cellStrokeColor = cellStrokeColor_;
  this.strokeColVector = p5.Vector.fromAngle(radians(hue(this.cellStrokeColor)));

  //this.stroke_Alpha = map(this.dna.genes[12], 0, 1, 0, 255);
  this.stroke_Alpha = 10; // (previous values: 18, 45)

  // COLOUR (other stuff)
  this.strokeOffset = random(-PI, PI);

  // Variables for LINEAR MOVEMENT WITH COLLISIONS
  this.m = this.r * 0.1; // Mass (sort of)

  this.run = function() {
    this.live();
    if (p.moving) {
      if (p.perlin) {this.movePerlin();}
      else {this.moveLinear();}
    }
    //this.moveLinear();
    //this.moveLinearStepped();
    //this.movePerlinStepped();
    if (p.growing) {this.updateSize();}
    if (p.spawning) {this.updateFertility();}
    if (p.wraparound) {this.checkBoundaryWraparound();} else {this.checkBoundaryRebound();}
    this.display();
    if (p.debugCellText) {this.cellDebuggerText(); }
    if (p.debugCellPrintln) {this.cellDebuggerPrintln(); }
  };

  this.live = function() {
    this.age += 1;
    //this.health -= 1;
    this.drawStep--;
    //if (this.drawStep < 0) {this.drawStep = r*2; }
    if (this.drawStep < 0) {
      this.drawStep = this.r * 2 / this.velocity.mag();
    }
  };

  this.updateSize = function() {
    this.r -= this.growth; // Cell can only shrink for now
    //if (this.r >= this.rMax) { this.growth *= -1; } // Old idea to reverse growth when max size reached
  };

  this.updateFertility = function() {
    if (this.r < this.rStart * this.fertility) { this.fertile = true; } else {this.fertile = false; } // A cell is fertile if r is within limit (a % of rStart)
  };

  this.moveLinear = function() {
    // Simple linear movement at constant (initial) velocity
    this.position.add(this.velocity);
  };

  this.moveLinearStepped = function() {
    this.velocity.normalize(); // Convert to a unit-vector (magnitude = 1)
    //this.velocity.mult(this.r + this.r + this.growth); // Set the magnitude to a size which will place the two consecutive circles adjacent to one another.
    this.velocity.mult(this.r + this.r + p.growth); // Set the magnitude to a size which will place the two consecutive circles adjacent to one another.
    this.position.add(this.velocity);
  };

  this.movePerlin = function() {
    // Simple movement based on perlin noise
    var vx = map(noise(this.xoff), 0, 1, -this.vMax, this.vMax);
    var vy = map(noise(this.yoff), 0, 1, -this.vMax, this.vMax);
    var velocity = createVector(vx, vy);
    this.xoff += this.step;
    this.yoff += this.step;
    this.position.add(velocity);
  };

  this.movePerlinStepped = function() {
    // Experimental movement based on perlin noise
    var vx = map(noise(this.xoff), 0, 1, -this.vMax, this.vMax);
    var vy = map(noise(this.yoff), 0, 1, -this.vMax, this.vMax);
    var velocity = createVector(vx, vy); // The changing angle is already given. It is only the magnitude which needs to be adressed!
    this.xoff += this.step;
    this.yoff += this.step;
    velocity.normalize(); // Convert to a unit-vector (magnitude = 1)
    //velocity.mult(this.r + this.r + this.growth); // Set the magnitude to a size which will place the two consecutive circles adjacent to one another.
    velocity.mult(this.r + this.r + p.growth); // Set the magnitude to a size which will place the two consecutive circles adjacent to one another.
    this.position.add(velocity);
  };

  this.checkBoundaryRebound = function() {
    if (this.position.x > width - this.r) {
      this.position.x = width - this.r;
      this.velocity.x *= -1;
    } else if (this.position.x < this.r) {
      this.position.x = this.r;
      this.velocity.x *= -1;
    } else if (this.position.y > height - this.r) {
      this.position.y = height - this.r;
      this.velocity.y *= -1;
    } else if (this.position.y < this.r) {
      this.position.y = this.r;
      this.velocity.y *= -1;
    }
  };

  this.checkBoundaryWraparound = function() {
    if (this.position.x > width + this.r) {
      this.position.x = -this.r;
    } else if (this.position.x < -this.r) {
      this.position.x = width + this.r;
    } else if (this.position.y > height + this.r) {
      this.position.y = -this.r;
    } else if (this.position.y < -this.r) {
      this.position.y = height + this.r;
    }
  };

  // Death
  this.dead = function() {
    //if (this.collCount <= 0 || this.r < this.rMin || this.health <0) {return true; } 
    if (this.r < this.rMin) {return true;} // Only radius kills cell
    else if (this.position.x > width + this.r || this.position.x < -this.r || this.position.y > height + this.r || this.position.y < -this.r) {return true;} // Death if move beyond canvas boundary
    else {return false;
    }
  };

  // Copied from the original Evolution EcoSystem sketch
  // NOT IN USE
  // Called from 'run' in colony to determine if a cell will spontaneously (& asexually) reproduce
  // Note: instead of void, the method returns a 'Cell' object
  this.reproduce = function() {
    if (random(1) < 0.003) {
      // Child DNA is exact copy of single parent
      var childDNA = this.dna.copy();
      // DNA can mutate if a random number is less than 0.01
      childDNA.geneMutate(0.01);
      return new Cell(this.position, this.velocity, this.fill_Colour, childDNA, this.rStart); // this is a pretty cool trick!
    } else {
      return null; // If no child was spawned
    }
  };

  this.display = function() {

    //noStroke();
    //noFill();

    //stroke(p.cellStrokeColor, p.cellStrokeAlpha);
    stroke(hue(this.cellStrokeColor), saturation(this.cellStrokeColor), brightness(this.cellStrokeColor), p.cellStrokeAlpha);
    //fill(p.cellFillColor, p.cellFillAlpha);
    fill(hue(this.cellFillColor), saturation(this.cellFillColor), brightness(this.cellFillColor), p.cellFillAlpha);

    var angle = this.velocity.heading();
    push();
    translate(this.position.x, this.position.y);
    //rotate(angle);
    ellipse(0, 0, this.r, this.r * this.flatness);
    stroke(0);
    strokeWeight(3);
    line (0,0,this.fillColVector.x, this.fillColVector.y);
    if (this.fertile) {fill(0); ellipse(0, 0, p.cellEndSize, p.cellEndSize);} else {fill(255); ellipse(0, 0, p.cellEndSize, p.cellEndSize);}
    /*if (this.drawStep < 1) {
      fill(0, 80);
      //stroke(0);
      ellipse(0, 0, this.r, this.r*this.flatness);
    }*/
    pop();
  };

  this.checkCollision = function(other) {
    // Method receives a Cell object 'other' to get the required info about the collidee
    if (this.fertile) {
      // Collision is not checked for infertile cells to prevent young spawn from colliding with their parents.
      // Consider moving this test upstream to where the method is called from

      var distVect = p5.Vector.sub(other.position, this.position); // Static vector to get distance between the cell & other

      // calculate magnitude of the vector separating the balls
      var distMag = distVect.mag();

      if (distMag < (this.r + other.r)) { // Test to see if a collision has occurred : is distance < sum of cell radius + other cell radius?

        if (this.fertile && other.fertile) {this.conception(other, distVect); }// Spawn a new cell if both colliding cells are fertile

        // get angle of distVect
        var theta = distVect.heading();
        // precalculate trig values
        var sine = sin(theta);
        var cosine = cos(theta);

        // posTemp will hold rotated cell positions. You just need to worry about posTemp[1] position
        var posTemp = [new p5.Vector(), new p5.Vector()];

        // this ball's position is relative to the other so you can use the vector between them (distVect) as the reference point in the rotation expressions.
        // posTemp[0].position.x and posTemp[0].position.y will initialize automatically to 0.0, which is what you want since b[1] will rotate around b[0]
        posTemp[1].x = cosine * distVect.x + sine * distVect.y;
        posTemp[1].y = cosine * distVect.y - sine * distVect.x;

        // rotate Temporary velocities
        var vTemp = [new p5.Vector(), new p5.Vector()];

        vTemp[0].x = cosine * this.velocity.x + sine * this.velocity.y;
        vTemp[0].y = cosine * this.velocity.y - sine * this.velocity.x;
        vTemp[1].x = cosine * other.velocity.x + sine * other.velocity.y;
        vTemp[1].y = cosine * other.velocity.y - sine * other.velocity.x;

        /* Now that velocities are rotated, you can use 1D conservation of momentum equations to calculate the final velocity along the x-axis. */
        var vFinal = [new p5.Vector(), new p5.Vector()];

        // final rotated velocity for b[0]
        vFinal[0].x = ((this.m - other.m) * vTemp[0].x + 2 * other.m * vTemp[1].x) / (this.m + other.m);
        vFinal[0].y = vTemp[0].y;

        // final rotated velocity for b[0]
        vFinal[1].x = ((other.m - this.m) * vTemp[1].x + 2 * this.m * vTemp[0].x) / (this.m + other.m);
        vFinal[1].y = vTemp[1].y;

        // hack to avoid clumping
        posTemp[0].x += vFinal[0].x;
        posTemp[1].x += vFinal[1].x;

        /* Rotate ball positions and velocities back. Reverse signs in trig expressions to rotate in the opposite direction */
        // rotate balls
        var bFinal = [new p5.Vector(), new p5.Vector()];

        bFinal[0].x = cosine * posTemp[0].x - sine * posTemp[0].y;
        bFinal[0].y = cosine * posTemp[0].y + sine * posTemp[0].x;
        bFinal[1].x = cosine * posTemp[1].x - sine * posTemp[1].y;
        bFinal[1].y = cosine * posTemp[1].y + sine * posTemp[1].x;

        // update balls to screen position
        other.position.x = this.position.x + bFinal[1].x;
        other.position.y = this.position.y + bFinal[1].y;

        this.position.add(bFinal[0]);

        // update velocities
        this.velocity.x = cosine * vFinal[0].x - sine * vFinal[0].y;
        this.velocity.y = cosine * vFinal[0].y + sine * vFinal[0].x;
        other.velocity.x = cosine * vFinal[1].x - sine * vFinal[1].y;
        other.velocity.y = cosine * vFinal[1].y + sine * vFinal[1].x;
      }
    }
  };

  

  this.conception = function(other, distVect) {
    // Decrease collision counters. NOTE Only done on spawn, so is more like a 'spawn limit'
    this.collCount--;
    other.collCount--;

    // Calculate position for spawn based on PVector between cell & other (leaving 'distVect' unchanged, as it is needed later)
    this.spawnPos = distVect.copy(); // Create spawnPos as a copy of the (already available) distVect which points from parent cell to other
    this.spawnPos.normalize();
    this.spawnPos.mult(this.r); // The spawn position is located at parent cell's radius
    this.spawnPos.add(this.position);

    // Calculate velocity vector for spawn as being centered between parent cell & other
    this.spawnVel = this.velocity.copy(); // Create spawnVel as a copy of parent cell's velocity vector 
    this.spawnVel.add(other.velocity); // Add dad's velocity
    this.spawnVel.normalize(); // Normalize to leave just the direction and magnitude of 1 (will be multiplied later)

    // Calculate new colour for child
    if (p.debugCellPrintln) {print("spawncolor 1) this.fillColVector= " + String(this.fillColVector));}
    if (p.debugCellPrintln) {print("spawncolor 2) other.fillColVector= " + String(this.fillColVector));}
    this.childFillColVector = this.fillColVector.add(other.fillColVector);
    if (p.debugCellPrintln) {print("spawncolor 3) this.childFillColVector= " + String(this.childFillColVector));}
    this.childFillColVector.normalize();
    this.childFillColVector.rotate(PI);
    if (p.debugCellPrintln) {print("spawncolor 4) this.childFillColVector(normed)= " + String(this.childFillColVector));}
    if (p.debugCellPrintln) {print("spawncolor 4a) this.childFillColVector HEADING= " + this.childFillColVector.heading());}
    if (p.debugCellPrintln) {print("spawncolor 4b) this.childFillColVector HEADING DEGREES= " + degrees(this.childFillColVector.heading()));}
    this.childFillTemp = map(this.childFillColVector.heading(), -PI, PI, 0, 360);
    this.childFillColor =  [this.childFillTemp, 100, 100];
    //this.childFillColor =  [this.childFillTemp-180, 100, 100];

    //this.childFillColor = [degrees(this.childFillColVector.heading()), 100, 100];
    if (p.debugCellPrintln) {print("spawncolor 5) this.childFillColor= " + this.childFillColor);}

    // Calculate new stroke colour for child
    this.childStrokeColVector = this.strokeColVector.add(other.strokeColVector);
    this.childStrokeColVector.normalize();
    this.childStrokeColVector.rotate(PI);
    this.childStrokeTemp = map(this.childStrokeColVector.heading(), -PI, PI, 0, 360);
    this.childStrokeColor =  [this.childStrokeTemp, 100, 100];
    //this.childStrokeColor =  [this.childStrokeTemp-180, 100, 100];
    
    // Calculate rStart for child
    this.rStart = this.r;
    other.rStart = other.r;

    // Call spawn method (in Colony) with the new parameters for position, velocity and fill-colour)
    //colony.spawn(spawnPos.x, spawnPos.y, spawnVel.x, spawnVel.y, spawnCol.heading(), spawnCol.mag());
    if (p.spawning) {
      colony.spawn(this.spawnPos, this.childFillColor, this.childStrokeColor, this.rStart);}

    //Reset fertility counter
    //this.fertility = 0;
    //other.fertility = 0;
  }

  this.cellDebuggerText = function() {
    var rowHeight = 15;
    fill(255);
    textSize(rowHeight);
    //text("Your debug text HERE", this.position.x, this.position.y);
    // RADIUS
    //text("r:" + this.r, this.position.x, this.position.y);
    //text("rStart:" + this.rStart, this.position.x, this.position.y + rowHeight);
    //text("rEnd:" + p.cellEndSize, this.position.x, this.position.y + rowHeight*2);
    
    
    // COLOUR
    text("this.cellFillCol:" + this.cellFillColor, this.position.x, this.position.y + rowHeight*1);
    text("this.cellStrokeCol:" + this.cellStrokeColor, this.position.x, this.position.y + rowHeight*2);
    
    // GROWTH
    //text("growth:" + this.growth, this.position.x, this.position.y + rowHeight*3);
    //text("age:" + this.age, this.position.x, this.position.y + rowHeight*4);
    //text("fertility:" + this.fertility, this.position.x, this.position.y + rowHeight*3);
    //text("fertile:" + this.fertile, this.position.x, this.position.y + rowHeight*4);
    text("collCount:" + this.collCount, this.position.x, this.position.y + rowHeight*3);
    
    // MOVEMENT
    text("vel.x:" + this.velocity.x, this.position.x, this.position.y + rowHeight*4);
    text("vel.y:" + this.velocity.y, this.position.x, this.position.y + rowHeight*5);
    text("vel.heading(deg):" + degrees(this.velocity.heading()), this.position.x, this.position.y + rowHeight*6);
  };

  this.cellDebuggerPrintln = function() {
    //println("Cell debug in terminal ON")
    //println("cell.debugger/" + "position.x" + this.position.x + "position.y" + this.position.y);
    //println("cell.debugger/" + "radius" + this.r);
  };
}

/* ------------------------------------------------------------------------------------------------------------- */

// DNA class
// Copied from the original 'Nature of Code' example:
// Evolution EcoSystem
// Daniel Shiffman <http://www.shiffman.net>

// Class to describe DNA
// Has more features for two parent mating (not used in this example)

// Constructor (makes a random DNA)
function DNA(newgenes) {
  if (newgenes) {
    this.genes = newgenes;
  } else {
    // The genetic sequence
    // DNA is random floating point values between 0 and 1 (!!)
    this.genes = new Array(14);
    for (var i = 0; i < this.genes.length; i++) {
      this.genes[i] = random(0, 1);
    }
  }

  this.copy = function() {
    // should switch to fancy JS array copy
    var newgenes = [];
    for (var i = 0; i < this.genes.length; i++) {
      newgenes[i] = this.genes[i];
    }

    return new DNA(newgenes);
  };

  // Based on a mutation probability, picks a new random character in array spots
  this.mutate = function(m) {
    for (var i = 0; i < this.genes.length; i++) {
      if (random(1) < m) {
        this.genes[i] = random(0, 1);
      }
    }
  };
}