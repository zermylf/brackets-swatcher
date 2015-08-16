/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50, browser: true */
/*global $ */

//TODO Centering +/- Zoom on Pan Position

define(function(require, exports, module) {

    var canvas;
    var ctx;

    function trackTransforms(ctx){
        var svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
        var xform = svg.createSVGMatrix();
        ctx.getTransform = function(){ return xform; };
        
        var savedTransforms = [];
        var save = ctx.save;
        ctx.save = function(){
            savedTransforms.push(xform.translate(0,0));
            return save.call(ctx);
        };
        var restore = ctx.restore;
        ctx.restore = function(){
            xform = savedTransforms.pop();
            return restore.call(ctx);
        };

        var scale = ctx.scale;
        ctx.scale = function(sx,sy){
            xform = xform.scaleNonUniform(sx,sy);
            return scale.call(ctx,sx,sy);
        };
        var rotate = ctx.rotate;
        ctx.rotate = function(radians){
            xform = xform.rotate(radians*180/Math.PI);
            return rotate.call(ctx,radians);
        };
        var translate = ctx.translate;
        ctx.translate = function(dx,dy){
            xform = xform.translate(dx,dy);
            return translate.call(ctx,dx,dy);
        };
        var transform = ctx.transform;
        ctx.transform = function(a,b,c,d,e,f){
            var m2 = svg.createSVGMatrix();
            m2.a=a; m2.b=b; m2.c=c; m2.d=d; m2.e=e; m2.f=f;
            xform = xform.multiply(m2);
            return transform.call(ctx,a,b,c,d,e,f);
        };
        var setTransform = ctx.setTransform;
        ctx.setTransform = function(a,b,c,d,e,f){
            xform.a = a;
            xform.b = b;
            xform.c = c;
            xform.d = d;
            xform.e = e;
            xform.f = f;
            return setTransform.call(ctx,a,b,c,d,e,f);
        };
        var pt  = svg.createSVGPoint();
        ctx.transformedPoint = function(x,y){
            pt.x=x; pt.y=y;
            return pt.matrixTransform(xform.inverse());
        };
    }

    var ColorPicker = {

        scale: 1,
        debug: true,
        
        image: false,

        transform: null,

        point: {
            x: 0,
            y: 0
        },

        config: {
            scaleFactor: 1.1,
            maxOut: 0.3,
            maxIn: 5
        },

        init: function(blob) {
            canvas = document.getElementById('swatcher-cp-canvas');
            ctx = canvas.getContext('2d');
            trackTransforms(ctx);

            var c = document.getElementById('swatcher-cp-holder');
            canvas.width = c.clientWidth;
            canvas.height = 350;
            
            ColorPicker.point = {
                x: canvas.width/2,
                y: canvas.height/2
            };

            var img = new Image();
            img.src = URL.createObjectURL(blob);

            img.onload = function() {
                ColorPicker.image = img;
                ColorPicker.draw();
                ColorPicker.zoom('x');
            };
        },

        crosshair: function(x, y) {
            ColorPicker.draw();

            ColorPicker.coords.cross.x = x;
            ColorPicker.coords.cross.y = y;

            ctx.beginPath();
            ctx.strokeStyle = '#2893ef';
            ctx.setLineDash([5, 2]);

            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
            ctx.closePath();
        },

        draw: function() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.transformedPoint(canvas.width,canvas.height);

            ctx.drawImage(
                ColorPicker.image,
                0,
                0,
                ColorPicker.image.width,
                ColorPicker.image.height
            );
        },

        pick: function(x, y) {
            var imgData = ctx.getImageData(x, y, 1, 1).data;
            ColorPicker.crosshair(x, y);
            return imgData;
        },

        fitToScreen: function() {
        },

        panStart: function(x, y) {
            ColorPicker.transform = ctx.transformedPoint(x,y);            
        },

        panEnd: function(x, y) {
            ColorPicker.transform = null;
        },

        pan: function(x, y) {
            var p = ctx.transformedPoint(x,y);
            ctx.translate(p.x-ColorPicker.transform.x,p.y-ColorPicker.transform.y);
            ColorPicker.draw();
        },

        zoomWheel: function(event) {
            

            var delta = event.wheelDelta ? event.wheelDelta/40 : event.detail ? -event.detail : 0;
                                

            if (delta) {
                var pt = ctx.transformedPoint(ColorPicker.point.x, ColorPicker.point.y);
                ctx.translate(pt.x,pt.y);
                var factor = Math.pow(ColorPicker.config.scaleFactor, delta);
                ctx.scale(factor,factor);
                ctx.translate(-pt.x,-pt.y);
                ColorPicker.draw();
            }
        },

        zoom: function(arg) {
            switch (arg) {
                case '+':
                    break;
                case '-':                    
                    break;
                case 'x':
             
                    break;
            }
        }
    };

    return ColorPicker;
});
