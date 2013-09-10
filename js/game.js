
function isMobile() {
    var rVal = false;

    if( navigator.userAgent.match(/Android/i)
        || navigator.userAgent.match(/webOS/i)
        || navigator.userAgent.match(/iPhone/i)
        || navigator.userAgent.match(/iPad/i)
        || navigator.userAgent.match(/iPod/i)
        || navigator.userAgent.match(/BlackBerry/i)
        || navigator.userAgent.match(/Windows Phone/i)
        ) {
        rVal = true;
    }

    return rVal;
}



function TheGame() {
    // ##TODONE## resolve this properly
    var iface = 'desktop';

    if (isMobile()) {
        iface = 'mobile';

        $('body').bind('touchmove', function (ev) {
            ev.preventDefault();
        });
    }

    var game = new Game(iface);

    game.updateContainer();
    // ##TODONE## needs resize handler
    $(window).resize(function() {
        game.updateContainer();
    });


    $('#main').canvasDragDrop({
        mouse: iface == 'desktop',
        onClick:function(x,y) { game.clickAt(x,y); },
        onStart:function(x,y) { game.dragStart(x,y); },
        onDrag:function(x,y) { game.drag(x,y) },
        onStop:function(x,y) { game.dragStop(x,y); },
        momentum : false,
        tolerance : iface == 'desktop' ? 5 : 1
    });

    game.update();
    game.start();
}

function smoothstep(a, b, t)
    /*
     **  Usage:
     **      smoothstep(a,b,t)
     **
     **  Arguments:
     **      a       upper bound, real
     **      b       lower bound, real
     **      t       value, real
     **
     **  Returns:
     **      0 when (t < a), 1 when (t >= b),
     **      a smooth transition from 0 to 1 otherwise,
     **      or (-1) on error (a == b)
     **
     **  GMLscripts.com
     */
{
    var p;
    if (t < a) return 0;
    if (t >= b) return 1;
    if (a == b) return -1;
    p = (t - a) / (b - a);
    return (p * p * (3 - 2 * p));
}

function Game(iIface) {
    this.iface = iIface;

    this.$toon = this.getElement('#toon');
    this.$main = this.getElement('#main');

    this.ctxToon = this.$toon[0].getContext('2d');
    this.ctx = this.$main[0].getContext('2d');

    this.imageObj = new Image();
    this.imageObj.src = "images/grass-tile.jpg";

    this.isRunning = true;
    this.dragOn = false;

    this.WORLD_PX = 1000;
    this.TOON_HALF_WIDTH = 100/2;
    this.HALF_PI = Math.PI/2;
    this.TRAVEL_SPEED = 0.01;
    this.interpPoint = {x: 512, y: 512, dist: 0, rad: -Math.PI/2};
    this.currentDist = 0;
    this.ball = new Ball(this.ctxToon, 100, 100, 20);
    this.currentPoint = 0;

    this.vpOffset = {x: 0, y: 0};
}

Game.prototype.updateContainer = function() {

    this.viewPortWidth = $(window).width(); //$('#container').width();
    this.viewPortHeight = $(window).height(); //$('#container').height();

    this.vpOffset.x = this.viewPortWidth/2;
    this.vpOffset.y = this.viewPortHeight/2;

    console.log({width: this.viewPortWidth, height: this.viewPortHeight});
    // Set canvas width and height attributes correctly to
    // match actual CSS pixel size
    this.$main.attr('width', this.viewPortWidth);
    this.$main.attr('height', this.viewPortHeight);
};

Game.prototype.clickAt = function (iX, iY) {
    this.animateToonEnd();

    var x = iX + this.interpPoint.x - this.vpOffset.x;
    var y = iY + this.interpPoint.y - this.vpOffset.y;

//    this.click = {x: x, y: y};
    this.dragpos = {x: x, y: y};

    console.log({x: iX, y: iY});

    this.arrDragPos = [];
    this.dragDist = 0;
    this.dragRad = 0;

    this.dragpos.x = this.interpPoint.x;
    this.dragpos.y = this.interpPoint.y;

    var dragObj = this.getDragPushObj(x, y);
    if (dragObj) {
        this.arrDragPos.push(dragObj);
    }

//    dragObj = this.getDragPushObj(this.interpPoint.x, this.interpPoint.y);
//    if (dragObj) {
//        this.arrDragPos.push(dragObj);
//    }

    console.log(this.arrDragPos);

    var thisPoint = this.arrDragPos[0];
    this.totalPointDist = thisPoint.dist;

    this.animateToon = true;
};

Game.prototype.dragStart = function (iX, iY) {
    var boundLeft = this.vpOffset.x - this.TOON_HALF_WIDTH;
    var boundRight = this.vpOffset.x + this.TOON_HALF_WIDTH;
    var boundTop = this.vpOffset.y - this.TOON_HALF_WIDTH;
    var boundBottom = this.vpOffset.y + this.TOON_HALF_WIDTH;

    var inX = (iX > boundLeft) && (iX < boundRight);
    var inY = (iY > boundTop) && (iY < boundBottom);
    if (inX && inY) {
        iX = this.vpOffset.x;
        iY = this.vpOffset.y;
        this.dragOn = true;
        x = iX + this.interpPoint.x - this.vpOffset.x;
        y = iY + this.interpPoint.y - this.vpOffset.y;

        this.dragpos = {x: x, y: y};

        this.arrDragPos = [];
        this.dragDist = 0;
        this.dragRad = 0;

        console.log({x: x, y: y});

        this.animateToonEnd();
    }
};

Game.prototype.getElement = function(id) {
    var $div = $('#container');

    return $div.find(id);
};

Game.prototype.getDragPushObj = function(x, y) {
    var lastX = this.dragpos.x;
    var lastY = this.dragpos.y;

    var diffX = x - lastX;
    var diffY = y - lastY;

    var dist = Math.sqrt(Math.pow(diffX, 2) + Math.pow(diffY, 2));

    var rVal = null;

    // Set number to more than 0 for filtering... untested...
    if (dist > 0) {
        this.dragRad = Math.atan2(diffY, diffX);

        this.dragpos = {x: x, y: y};
        this.dragDist += dist;

        rVal = {x:lastX, y:lastY, dist:dist, rad:this.dragRad};

    } else if (dist == 0) {
        // final drag point
        this.dragpos = {x: x, y: y};

        rVal = {x:lastX, y:lastY, dist:dist, rad:this.dragRad};
    }

    return rVal;
};

Game.prototype.drag = function(iX, iY) {
    if (this.dragOn == true) {
        x = iX + this.interpPoint.x - this.vpOffset.x;
        y = iY + this.interpPoint.y - this.vpOffset.y;

        var dragObj = this.getDragPushObj(x, y);
        if (dragObj) {
            this.arrDragPos.push(dragObj);
        }
        console.log({x: x, y: y});
    }
};

Game.prototype.dragStop = function(iX, iY) {
    if (this.dragOn == true) {
        // Quick hack for mobile touch stop - doesn't give proper x, y
        var x;
        var y;
        if (this.iface == 'mobile') {
            x = this.dragpos.x;
            y = this.dragpos.y;
        } else {
            x = iX + this.interpPoint.x - this.vpOffset.x;
            y = iY + this.interpPoint.y - this.vpOffset.y;
        }

        var dragObj = this.getDragPushObj(x, y);
        if (dragObj != null) {
            this.arrDragPos.push(dragObj);
        }
        console.log({x: x, y: y});
        console.log(this.arrDragPos);
        console.log(this.dragDist);

        this.dragpos = null;
        var thisPoint = this.arrDragPos[0];
        this.totalPointDist = thisPoint.dist;

        this.animateToon = true;
        this.dragOn = false;
    }

};

Game.prototype.start = function() {
    // main loop
    var self = this;
    this.frameNumber = 0;
    (function gameLoop() {
        var now = Date.now();
        self.deltaTime = now - self.lastUpdateTimeStamp;
        self.lastUpdateTimeStamp = now;
        if (self.isRunning == true) {
            self.update();
            self.draw();
            self.click = null;
            this.frameNumber++;
        }
        requestAnimFrame(gameLoop, self.canvas);
    })();
};

Game.prototype.interpolatePoint = function(iPoint, iDistance, iNextPoint) {
    var tX = Math.cos(iPoint.rad) * (iPoint.dist - iDistance);
    var tY = Math.sin(iPoint.rad) * (iPoint.dist - iDistance);

//    var tRad = iPoint.rad;

//    Failed attempt at interplolating angles... another time perhaps...
//    if (iPrevPoint != null) {
//        var tRatio = iDistance/iPrevPoint.dist;
//        console.log({iDistance: iDistance, iPointDist: iPoint.dist});
//
//        tRad =  ((iPoint.rad * (1 - tRatio)) + (iPrevPoint.rad * (tRatio))) / 2
//    }

    return {x: iPoint.x + tX, y: iPoint.y + tY, rad: iPoint.rad};
};

Game.prototype.animateToonEnd = function() {
    this.animateToon = false;
    this.ball.dist = this.currentDist;
    this.currentDist = 0;
    this.currentPoint = 0;
    this.totalPointDist = 0;
    this.currentStep = 0;
};

Game.prototype.update = function() {
    // update object and background positions here. One possible way
    // to implement background is by using oversized div with tileable
    // background that is under the canvas and is just translated
    // based on the location to create illusion of movement. Another
    // way is to simply draw it on canvas on every update.

    if (this.animateToon) {

        // Get the current path progression
        this.currentStep += this.TRAVEL_SPEED * (this.dragDist/1.5);

        // Apply easing
        var step = smoothstep(0, this.dragDist, this.currentStep);
        this.currentDist = step * this.dragDist;

        // Get the current point
        var thisPoint = this.arrDragPos[this.currentPoint];

        // Find next point in path based on distance travelled.
        var bEndArray = false;
        while ((this.currentDist > this.totalPointDist) && !bEndArray) {
            this.currentPoint++;
            if (this.currentPoint < this.arrDragPos.length) {
                thisPoint = this.arrDragPos[this.currentPoint];
                this.totalPointDist += thisPoint.dist;
            } else {
                bEndArray = true;
            }
        }

        // Interpolate to get current point
        if (this.currentPoint < this.arrDragPos.length && step < 1) {
            var distForThisPoint = this.totalPointDist - this.currentDist;
            var nextPoint = this.arrDragPos[this.currentPoint + 1];

            this.interpPoint = this.interpolatePoint(thisPoint, distForThisPoint, nextPoint);

        } else if (this.currentPoint == this.arrDragPos.length && step < 1) {
            // bah... shit happens... I'll find you someday li'bug
            console.log("pew!");
        } else {
            this.animateToonEnd();
        }

        //clip position
        if (this.interpPoint.x < 0) {
            this.interpPoint.x = 0;
        }
        if (this.interpPoint.x > this.WORLD_PX) {
            this.interpPoint.x = this.WORLD_PX;
        }

        if (this.interpPoint.y < 0) {
            this.interpPoint.y = 0;
        }
        if (this.interpPoint.y > this.WORLD_PX) {
            this.interpPoint.y = this.WORLD_PX;
        }
    }
};

Game.prototype.drawAnimate = function() {
    this.$toon.css({
        left: this.vpOffset.x - 50 + 'px', // re-center the ship
        top: this.vpOffset.y - 50 + 'px', // re-center the ship
        '-webkit-transform': 'rotate(' + (this.interpPoint.rad + this.HALF_PI) + 'rad)',
        transform: 'rotate(' + (this.interpPoint.rad + this.HALF_PI) + 'rad)'
    });

    var offsetX = -(this.interpPoint.x) + this.vpOffset.x;
    var offsetY = -(this.interpPoint.y) + this.vpOffset.y;

    this.ball.render((this.ball.dist + this.currentDist)/45, this.interpPoint.rad + this.HALF_PI);

    var TILE_WIDTH = 256;
    var NUM_TILES = this.WORLD_PX/TILE_WIDTH;

    this.ctx.clearRect(0,0, this.viewPortWidth, this.viewPortHeight);

    // Negligible savings if a more sophisticated tiling strategy is used. So KISS.
    // It seems for the browsers we want, they clip off-screen drawing anyways.
    var curX = 0;
    var curY = 0;
    for (var i = 0; i < NUM_TILES; i++) {
        curX = i * TILE_WIDTH;
        for (var j = 0; j < NUM_TILES; j++) {
            curY = j * TILE_WIDTH;
//            console.log(curX);
            this.ctx.drawImage(this.imageObj, offsetX + curX, offsetY + curY);
        }
    }
    this.ctx.strokeStyle = '#ff0000';
    this.ctx.lineWidth = 4;

    if (this.arrDragPos != null && this.arrDragPos.length > 0) {
        this.ctx.beginPath();
        var lX = this.arrDragPos[0].x - this.interpPoint.x + this.vpOffset.x
        var lY = this.arrDragPos[0].y - this.interpPoint.y + this.vpOffset.y
        this.ctx.moveTo(lX, lY);
        for (var i = 1; i < this.arrDragPos.length; i++) {
            lX = this.arrDragPos[i].x - this.interpPoint.x + this.vpOffset.x
            lY = this.arrDragPos[i].y - this.interpPoint.y + this.vpOffset.y
            this.ctx.lineTo(lX, lY);
//            this.ctx.beginPath();
//            this.ctx.moveTo(x, y);
        }
        this.ctx.stroke();
    }
};

Game.prototype.draw = function() {
    // draw here to canvas

    // some examples
//    if (this.click) {
//        this.ctx.fillStyle = 'black';
//        this.ctx.fillRect(this.click.x, this.click.y, 2, 2);
//    }
//    if (this.dragpos) {
//        this.ctx.fillStyle = 'red';
////        this.ctx.fillRect(this.dragpos.x, this.dragpos.y, 5, 5);
//    }

    if (this.animateToon || this.frameNumber == 0) {
        this.drawAnimate();
    }
};
