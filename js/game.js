
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

function updateContainer() {
    var width = $("#main").width();
    var height = $("#main").height();

    // Set canvas width and height attributes correctly to
    // match actual CSS pixel size
    $('#main').attr('width', width);
    $('#main').attr('height', height);
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

    updateContainer();
    // ##TODONE## needs resize handler
    $(window).resize(function() {
        updateContainer();
    });

    var game = new Game(iface);

    $('#main').canvasDragDrop({
        mouse: iface == 'desktop',
        onClick:function(x,y) { game.clickAt(x,y); },
        onStart:function(x,y) { game.dragStart(x,y);},
        onDrag:function(x,y) { game.drag(x,y)},
        onStop:function(x,y) { game.dragStop(x,y);  },
        momentum : false,
        tolerance : iface == 'desktop' ? 5 : 1
    });

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
    this.canvas = $('#main')[0];
    this.ctx = this.canvas.getContext('2d');
    this.isRunning = true;

    this.HALF_PI = Math.PI/2;
    this.TRAVEL_SPEED = 0.01;
    this.interpPoint = {x: 100, y: 100, dist:0, rad: -Math.PI/2};

    this.animateToonEnd();

}

Game.prototype.clickAt = function(x, y) {
    this.click = {x: x, y: y};
}

Game.prototype.dragStart = function(x, y) {
    this.ctx.strokeStyle = '#ff0000';
    this.ctx.lineWidth = 4;
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
    this.dragpos = {x: x, y: y};

    this.arrDragPos = [];
    this.dragDist = 0;
    this.dragRad = 0;

    console.log({x: x, y: y});

    this.animateToonEnd();
}

Game.prototype.getToon = function() {
    var $div = $('#container')

    return $div.find('#toon');
}

Game.prototype.getDragPushObj = function(x, y) {
    var lastX = this.dragpos.x;
    var lastY = this.dragpos.y;

    var diffX = x - lastX;
    var diffY = y - lastY;

    var dist = Math.sqrt(Math.pow(diffX, 2) + Math.pow(diffY, 2));

    var rVal = null;
    if (dist > 0) {

        this.dragRad = Math.atan2(diffY, diffX);

        this.dragpos = {x: x, y: y};
        this.dragDist += dist;

        rVal = {x: lastX, y: lastY, dist:dist, rad: this.dragRad};


    } else if (dist == 0) {
        // final drag point
        this.dragpos = {x: x, y: y};

        rVal = {x: lastX, y: lastY, dist:dist, rad: this.dragRad};
    }




    return rVal;
}

Game.prototype.drag = function(x, y) {
    this.ctx.lineTo(x, y);

    this.ctx.stroke();
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);

    var dragObj = this.getDragPushObj(x, y);
    if (dragObj) {
        this.arrDragPos.push(dragObj);
    }
    console.log({x: x, y: y});


}

Game.prototype.dragStop = function(x, y) {
//    this.ctx.lineTo(x, y);
//    this.ctx.stroke();
//
    if (this.iface == 'mobile') {
        x = this.dragpos.x;
        y = this.dragpos.y;
    }

    var dragObj = this.getDragPushObj(x, y);
    if (dragObj) {
        console.log("got it in!")
        this.arrDragPos.push(dragObj);
    }
    console.log({x: x, y: y});
    console.log(this.arrDragPos);
    console.log(this.dragDist);

    this.dragpos = null;
    this.animateToon = true;

}

Game.prototype.start = function() {
    // main loop
    var self = this;
    (function gameLoop() {
        var now = Date.now();
        self.deltaTime = now - self.lastUpdateTimeStamp;
        self.lastUpdateTimeStamp = now;
        if (self.isRunning == true) {
            self.update();
            self.draw();
            self.click = null;
        }
        requestAnimFrame(gameLoop, self.canvas);
    })();
}

Game.prototype.interpolatePoint = function(iPoint, iDistance, iPrevPoint) {
    var tX = Math.cos(iPoint.rad) * -iDistance;
    var tY = Math.sin(iPoint.rad) * -iDistance;

    var tRad = iPoint.rad;
//    Failed attempt at interplolating angles... another time perhaps...
//    if (iPrevPoint != null) {
//        var tRatio = iDistance/iPrevPoint.dist;
//        console.log({iDistance: iDistance, iPointDist: iPoint.dist});
//
//        tRad =  ((iPoint.rad * (1 - tRatio)) + (iPrevPoint.rad * (tRatio))) / 2
//    }

    return {x: tX + iPoint.x, y: tY + iPoint.y, rad: tRad};
}

Game.prototype.animateToonEnd = function() {
    this.animateToon = false;
    this.currentDist = 0;
    this.currentPoint = 0;
    this.totalPointDist = 0;
    this.currentStep = 0;
}

Game.prototype.update = function() {
    // update object and background positions here. One possible way
    // to implement background is by using oversized div with tileable
    // background that is under the canvas and is just translated
    // based on the location to create illusion of movement. Another
    // way is to simply draw it on canvas on every update.

    if (this.animateToon) {


        this.currentStep += this.TRAVEL_SPEED * (this.dragDist/1.5);

        var step = smoothstep(0, this.dragDist, this.currentStep);


        this.currentDist = step * this.dragDist;

        var thisPoint = this.arrDragPos[this.currentPoint];

        if (this.currentDist > this.totalPointDist) {
            this.totalPointDist += thisPoint.dist;
            this.currentPoint++;

            if (this.currentPoint < this.arrDragPos.length) {
                thisPoint = this.arrDragPos[this.currentPoint];
            }

        }

//        console.log("step: " + step);
        if (this.currentPoint < this.arrDragPos.length) {

            var distForThisPoint = this.totalPointDist - this.currentDist;

            var nextPoint = this.arrDragPos[this.currentPoint - 1];

            this.interpPoint = this.interpolatePoint(thisPoint, distForThisPoint, nextPoint);

        } else if (this.currentPoint == this.arrDragPos.length && step < 1) {
            console.log("pew!");
        } else {
            this.animateToonEnd();
        }
    }
}

Game.prototype.draw = function() {
    // draw here to canvas

    // some examples
    if (this.click) {
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(this.click.x, this.click.y, 2, 2);
    }
    if (this.dragpos) {
        this.ctx.fillStyle = 'red';
//        this.ctx.fillRect(this.dragpos.x, this.dragpos.y, 5, 5);
    }

    var $toon = this.getToon();

    $toon.css({
        left: this.interpPoint.x - 20 + 'px', // re-center the ship
        top: this.interpPoint.y - 40 + 'px', // re-center the ship
        '-webkit-transform': 'rotate(' + (this.interpPoint.rad + this.HALF_PI) + 'rad)',
        transform: 'rotate(' + (this.interpPoint.rad + this.HALF_PI) + 'rad)'
    });


}
