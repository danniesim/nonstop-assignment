/**
 * Created with JetBrains WebStorm.
 * User: danielsim
 * Date: 9/8/13
 * Time: 10:56 PM
 * To change this template use File | Settings | File Templates.
 */

function Ball(iCtx, iWidth, iHeight, iRadius) {
    this.width = iWidth;
    this.height = iHeight;
    this.ctx = iCtx;
    this.distance = 200;
    this.dist = 0;
    this.radius = iRadius;
    this.create();
}

function Point3D() {
    this.x = 0;
    this.y = 0;
    this.z = 0;
}

Ball.prototype.create = function() {
    this.point = [];
    this.color = "rgb(100,0,255)";

    console.log(this.radius);
    this.numberOfVertexes = 0;

    for(var direction = 1; direction >= -1; direction -= 2) {
        for(var beta = 0.17; beta < 1.445; beta += 0.34) {
            var radius = Math.cos(beta) * this.radius;
            var fixedY = Math.sin(beta) * this.radius * direction;

            for(var alpha = 0; alpha < 6.28; alpha += 0.34) {
                var p = this.point[this.numberOfVertexes] = new Point3D();

                p.x = Math.cos(alpha) * radius;
                p.y = fixedY;
                p.z = Math.sin(alpha) * radius;

                this.numberOfVertexes++;
            }
        }
    }
};

Ball.prototype.rotateX = function(point, radians) {
    var y = point.y;
    point.y = (y * Math.cos(radians)) + (point.z * Math.sin(radians) * -1.0);
    point.z = (y * Math.sin(radians)) + (point.z * Math.cos(radians));
};

Ball.prototype.rotateY = function(point, radians) {
    var x = point.x;
    point.x = (x * Math.cos(radians)) + (point.z * Math.sin(radians) * -1.0);
    point.z = (x * Math.sin(radians)) + (point.z * Math.cos(radians));
};

Ball.prototype.rotateZ = function(point, radians) {
    var x = point.x;
    point.x = (x * Math.cos(radians)) + (point.y * Math.sin(radians) * -1.0);
    point.y = (x * Math.sin(radians)) + (point.y * Math.cos(radians));
};

Ball.prototype.projection = function(xy, z, xyOffset, zOffset, distance) {
    return ((distance * xy) / (z - zOffset)) + xyOffset;
};

Ball.prototype.render = function (rotation) {
    var width = this.width;
    var height = this.height;
    var distance = this.distance;

    var x, y;

    var p = new Point3D();
    var sphere = this;
    var ctx = this.ctx;
    ctx.save();
    ctx.clearRect(0, 0, width, height);

    ctx.globalCompositeOperation = "lighter";

    for (var i = 0; i < sphere.numberOfVertexes; i++) {

        p.x = sphere.point[i].x;
        p.y = sphere.point[i].y;
        p.z = sphere.point[i].z;

        this.rotateY(p, rotation);
        this.rotateZ(p, -Math.PI / 2);

        x = this.projection(p.x, p.z, width / 2.0, 100.0, distance);
        y = this.projection(p.y, p.z, height / 2.0, 100.0, distance);

        if ((x >= 0) && (x < width)) {
            if ((y >= 0) && (y < height)) {
                this.drawPointLine(this.ctx, x, y, 2, "rgba(200,200,200,0.6)");
//                if(p.z < 0) {
                this.drawPoint(this.ctx, x, y, 2, "rgba(200,200,200,0.6)");
//                } else {
//                    this.drawPointWithGradient(this.ctx, x, y, 2, "rgb(0,200,0)", 0.8);
//                }
            }
        }
    }
    ctx.restore();
//
//    if(distance < 1000) {
//        distance += 10;
//    }
};

Ball.prototype.drawPointLine = function(ctx, x, y, size, color) {
    ctx.lineTo(x, y);
};

Ball.prototype.drawPoint = function(ctx, x, y, size, color) {
    ctx.save();
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.arc(x, y, size, 0, 2*Math.PI, true);
    ctx.fill();
    ctx.restore();
};

Ball.prototype.drawPointWithGradient = function(ctx, x, y, size, color, gradient) {
    var reflection;

    reflection = size / 4;

    ctx.save();
    ctx.translate(x, y);
    var radgrad = ctx.createRadialGradient(-reflection,-reflection,reflection,0,0,size);

    radgrad.addColorStop(0, '#FFFFFF');
    radgrad.addColorStop(gradient, color);
    radgrad.addColorStop(1, 'rgba(1,159,98,0)');

    ctx.fillStyle = radgrad;
    ctx.fillRect(-size,-size,size*2,size*2);
    ctx.restore();
};