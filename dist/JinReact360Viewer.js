var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { Component } from "react";
import Hammer from 'react-hammerjs';
import Button from './components/Button'; // Assume Button is typed or add types if needed
import './style.css'; // Styles don't need types
var JinReact360Viewer = /** @class */ (function (_super) {
    __extends(JinReact360Viewer, _super);
    function JinReact360Viewer(props) {
        var _this = _super.call(this, props) || this;
        _this.viewPercentageRef = React.createRef();
        _this.viewPortElementRef = React.createRef();
        _this.viewerContainerRef = React.createRef();
        _this.imageContainerRef = React.createRef();
        _this.canvas = null;
        _this.ctx = null;
        _this.isMobile = false;
        _this.imageData = [];
        _this.images = [];
        _this.loadedImages = 0;
        _this.viewerPercentage = null;
        _this.currentImage = null;
        _this.currentLeftPosition = 0;
        _this.currentTopPosition = 0;
        _this.currentCanvasImage = null;
        _this.centerX = 0;
        _this.centerY = 0;
        _this.movementStart = 0;
        _this.movement = false;
        _this.speedFactor = 13;
        _this.activeImage = 1;
        _this.stopAtEdges = false;
        _this.dragging = false;
        _this.dragStart = null;
        _this.currentScale = 1; // Add this if missing
        _this.startDragging = function (evt) {
            _this.dragging = true;
            document.body.style.userSelect = 'none'; // Covers all modern browsers
            // document.body.style.mozUserSelect = document.body.style.webkitUserSelect = document.body.style.userSelect = 'none';
            _this.setLastPositions(evt);
            if (_this.ctx && _this.state.lastX && _this.state.lastY) {
                _this.dragStart = _this.ctx.transformedPoint(_this.state.lastX, _this.state.lastY);
            }
        };
        _this.setLastPositions = function (evt) {
            var _a, _b, _c, _d, _e, _f, _g, _h;
            var offsetX, offsetY;
            if (_this.isMobile && 'touches' in evt && evt.touches[0]) {
                offsetX = evt.touches[0].offsetX || (evt.touches[0].pageX - ((_b = (_a = _this.canvas) === null || _a === void 0 ? void 0 : _a.offsetLeft) !== null && _b !== void 0 ? _b : 0));
                offsetY = evt.touches[0].offsetY || (evt.touches[0].pageY - ((_d = (_c = _this.canvas) === null || _c === void 0 ? void 0 : _c.offsetTop) !== null && _d !== void 0 ? _d : 0));
            }
            else {
                offsetX = evt.offsetX || (evt.pageX - ((_f = (_e = _this.canvas) === null || _e === void 0 ? void 0 : _e.offsetLeft) !== null && _f !== void 0 ? _f : 0));
                offsetY = evt.offsetY || (evt.pageY - ((_h = (_g = _this.canvas) === null || _g === void 0 ? void 0 : _g.offsetTop) !== null && _h !== void 0 ? _h : 0));
            }
            _this.setState({ lastX: offsetX, lastY: offsetY });
        };
        _this.doDragging = function (evt) {
            _this.setLastPositions(evt);
            if (_this.dragStart && _this.ctx && _this.state.lastX && _this.state.lastY) {
                var pt = _this.ctx.transformedPoint(_this.state.lastX, _this.state.lastY);
                _this.ctx.translate(pt.x - _this.dragStart.x, pt.y - _this.dragStart.y);
                _this.redraw();
            }
        };
        _this.stopDragging = function (evt) {
            _this.dragging = false;
            _this.dragStart = null;
        };
        _this.prev = function (e) {
            (_this.props.spinReverse ? _this.turnRight() : _this.turnLeft());
        };
        _this.next = function (e) {
            (_this.props.spinReverse ? _this.turnLeft() : _this.turnRight());
        };
        _this.resetPosition = function () {
            _this.currentScale = 1;
            _this.activeImage = 1;
            _this.setImage(true);
        };
        _this.zoomImage = function (evt) {
            var _a, _b, _c, _d;
            var offsetX = evt.offsetX || (evt.pageX - ((_b = (_a = _this.canvas) === null || _a === void 0 ? void 0 : _a.offsetLeft) !== null && _b !== void 0 ? _b : 0));
            var offsetY = evt.offsetY || (evt.pageY - ((_d = (_c = _this.canvas) === null || _c === void 0 ? void 0 : _c.offsetTop) !== null && _d !== void 0 ? _d : 0));
            _this.setState({ lastX: offsetX, lastY: offsetY });
            var delta = evt.wheelDelta ? evt.wheelDelta / 40 : evt.deltaY ? -evt.deltaY : 0;
            if (delta)
                _this.zoom(delta);
        };
        _this.zoomIn = function (evt) {
            _this.setState({ lastX: _this.centerX, lastY: _this.centerY });
            _this.zoom(2);
        };
        _this.zoomOut = function (evt) {
            _this.setState({ lastX: _this.centerX, lastY: _this.centerY });
            _this.zoom(-2);
        };
        _this.onMove = function (pageX) {
            if (pageX - _this.movementStart >= _this.speedFactor) {
                var itemsSkippedRight = Math.floor((pageX - _this.movementStart) / _this.speedFactor) || 1;
                _this.movementStart = pageX;
                if (_this.props.spinReverse) {
                    _this.moveActiveIndexDown(itemsSkippedRight);
                }
                else {
                    _this.moveActiveIndexUp(itemsSkippedRight);
                }
                _this.redraw();
            }
            else if (_this.movementStart - pageX >= _this.speedFactor) {
                var itemsSkippedLeft = Math.floor((_this.movementStart - pageX) / _this.speedFactor) || 1;
                _this.movementStart = pageX;
                if (_this.props.spinReverse) {
                    _this.moveActiveIndexUp(itemsSkippedLeft);
                }
                else {
                    _this.moveActiveIndexDown(itemsSkippedLeft);
                }
                _this.redraw();
            }
        };
        _this.startMoving = function (evt) {
            _this.movement = true;
            _this.movementStart = evt.pageX;
            if (_this.viewPortElementRef.current) {
                _this.viewPortElementRef.current.style.cursor = 'grabbing';
            }
        };
        _this.doMoving = function (evt) {
            if (_this.movement) {
                _this.onMove(evt.clientX);
            }
        };
        _this.stopMoving = function (evt) {
            _this.movement = false;
            _this.movementStart = 0;
            if (_this.viewPortElementRef.current) {
                _this.viewPortElementRef.current.style.cursor = 'grab';
            }
        };
        _this.touchStart = function (evt) {
            if (evt.touches[0]) {
                _this.movementStart = evt.touches[0].clientX;
            }
        };
        _this.touchMove = function (evt) {
            if (evt.touches[0]) {
                _this.onMove(evt.touches[0].clientX);
            }
        };
        _this.touchEnd = function () {
            _this.movementStart = 0;
        };
        _this.play = function () {
            _this.setState({
                loopTimeoutId: window.setInterval(function () { return _this.loopImages(); }, 100)
            });
        };
        _this.togglePlay = function (e) {
            _this.setState(function (prevState) { return ({ playing: !prevState.playing }); });
        };
        _this.togglePanMode = function (e) {
            _this.setState(function (prevState) { return ({ panmode: !prevState.panmode }); });
        };
        _this.toggleFullScreen = function (e) {
            _this.setState(function (prevState) { return ({ isFullScreen: !prevState.isFullScreen }); });
        };
        _this.handlePinch = function (e) {
            if (e.scale < _this.currentScale) {
                _this.zoomIn(null);
            }
            else if (e.scale > _this.currentScale) {
                _this.zoomOut(null);
            }
        };
        _this.pinchOut = function () {
            _this.currentScale = 1;
        };
        _this.state = {
            lastX: 0,
            lastY: 0,
            minScale: 0.5,
            maxScale: 4,
            scale: 0.2,
            customOffset: 10,
            currentScale: 1,
            currentTopPosition: 0,
            currentLeftPosition: 0,
            selectMenuOption: 1,
            currentImage: null,
            dragging: false,
            canvas: null,
            ctx: null,
            dragStart: null,
            currentCanvasImage: null,
            isFullScreen: false,
            viewPortElementWidth: null,
            movementStart: 0,
            movement: false,
            dragSpeed: 150,
            speedFactor: 13,
            activeImage: 1,
            stopAtEdges: false,
            panmode: false,
            currentLoop: 0,
            loopTimeoutId: 0,
            playing: false,
            imagesLoaded: false
        };
        return _this;
    }
    JinReact360Viewer.prototype.componentDidMount = function () {
        var _a;
        this.disableZoomin();
        this.viewerPercentage = this.viewPercentageRef.current;
        var viewPortElement = (_a = this.viewerContainerRef.current) === null || _a === void 0 ? void 0 : _a.getElementsByClassName('v360-viewport-container')[0];
        if (viewPortElement) {
            this.viewPortElementRef.current = viewPortElement;
        }
        this.fetchData();
    };
    JinReact360Viewer.prototype.fetchData = function () {
        for (var i = 1; i <= this.props.amount; i++) {
            var imageIndex = this.props.paddingIndex ? this.lpad(i, "0", 2) : i.toString();
            var fileName = this.props.fileName.replace('{index}', imageIndex);
            var filePath = "".concat(this.props.imagePath, "/").concat(fileName);
            this.imageData.push(filePath);
        }
        this.preloadImages();
    };
    JinReact360Viewer.prototype.lpad = function (str, padString, length) {
        var s = str.toString();
        while (s.length < length)
            s = padString + s;
        return s;
    };
    JinReact360Viewer.prototype.preloadImages = function () {
        var _this = this;
        if (this.imageData.length) {
            try {
                this.imageData.forEach(function (src) { return _this.addImage(src); });
            }
            catch (error) {
                console.error("Something went wrong while loading images: ".concat(error.message));
            }
        }
        else {
            console.log('No Images Found');
        }
    };
    JinReact360Viewer.prototype.addImage = function (resultSrc) {
        var image = new Image();
        image.src = resultSrc;
        image.onload = this.onImageLoad.bind(this);
        // image.onerror = this.onImageLoad.bind(this);
        this.images.push(image);
    };
    JinReact360Viewer.prototype.onImageLoad = function (event) {
        var percentage = Math.round(this.loadedImages / this.props.amount * 100);
        this.loadedImages += 1;
        this.updatePercentageInLoader(percentage);
        if (this.loadedImages === this.props.amount) {
            this.onAllImagesLoaded(event);
        }
        else if (this.loadedImages === 1) {
            console.log('load first image');
        }
    };
    JinReact360Viewer.prototype.updatePercentageInLoader = function (percentage) {
        if (this.viewerPercentage) {
            this.viewerPercentage.innerHTML = percentage + '%';
        }
    };
    JinReact360Viewer.prototype.onAllImagesLoaded = function (e) {
        this.setState({ imagesLoaded: true });
        this.initData();
    };
    JinReact360Viewer.prototype.initData = function () {
        var _a;
        this.canvas = this.imageContainerRef.current;
        if (this.canvas) {
            this.ctx = this.canvas.getContext('2d');
        }
        this.attachEvents();
        this.checkMobile();
        this.loadInitialImage();
        this.setState({ playing: (_a = this.props.autoplay) !== null && _a !== void 0 ? _a : false });
    };
    JinReact360Viewer.prototype.attachEvents = function () {
        var viewPortElement = this.viewPortElementRef.current;
        if (!viewPortElement)
            return;
        if (this.state.panmode) {
            this.bindPanModeEvents(viewPortElement);
        }
        else {
            this.bind360ModeEvents(viewPortElement);
        }
    };
    JinReact360Viewer.prototype.bindPanModeEvents = function (element) {
        element.removeEventListener('touchend', this.stopDragging);
        element.removeEventListener('touchstart', this.startDragging);
        element.removeEventListener('touchmove', this.doDragging);
        element.removeEventListener('mouseup', this.stopMoving);
        element.removeEventListener('mousedown', this.startMoving);
        element.removeEventListener('mousemove', this.doMoving);
        element.addEventListener('touchend', this.stopDragging);
        element.addEventListener('touchstart', this.startDragging);
        element.addEventListener('touchmove', this.doDragging);
        element.addEventListener('mouseup', this.stopDragging);
        element.addEventListener('mousedown', this.startDragging);
        element.addEventListener('mousemove', this.doDragging);
    };
    JinReact360Viewer.prototype.bind360ModeEvents = function (element) {
        element.removeEventListener('touchend', this.stopDragging);
        element.removeEventListener('touchstart', this.startDragging);
        element.removeEventListener('touchmove', this.doDragging);
        element.removeEventListener('mouseup', this.stopDragging);
        element.removeEventListener('mousedown', this.startDragging);
        element.removeEventListener('mousemove', this.doDragging);
        element.addEventListener('touchend', this.touchEnd);
        element.addEventListener('touchstart', this.touchStart);
        element.addEventListener('touchmove', this.touchMove);
        element.addEventListener('mouseup', this.stopMoving);
        element.addEventListener('mousedown', this.startMoving);
        element.addEventListener('mousemove', this.doMoving);
    };
    JinReact360Viewer.prototype.checkMobile = function () {
        this.isMobile = !!('ontouchstart' in window);
    };
    JinReact360Viewer.prototype.loadInitialImage = function () {
        var _a;
        this.currentImage = (_a = this.imageData[0]) !== null && _a !== void 0 ? _a : null;
        if (this.currentImage) {
            this.setImage();
        }
    };
    JinReact360Viewer.prototype.setImage = function (cached) {
        var _this = this;
        var _a, _b, _c, _d, _e;
        if (cached === void 0) { cached = false; }
        this.currentLeftPosition = this.currentTopPosition = 0;
        if (!cached) {
            this.currentCanvasImage = new Image();
            this.currentCanvasImage.crossOrigin = 'anonymous'; // TS doesn't like this; use // @ts-ignore if needed
            this.currentCanvasImage.src = (_a = this.currentImage) !== null && _a !== void 0 ? _a : '';
            this.currentCanvasImage.onload = function () {
                var _a, _b, _c;
                var viewportElement = (_a = _this.viewPortElementRef.current) === null || _a === void 0 ? void 0 : _a.getBoundingClientRect();
                if (_this.canvas && _this.currentCanvasImage) {
                    _this.canvas.width = _this.state.isFullScreen ? ((_b = viewportElement === null || viewportElement === void 0 ? void 0 : viewportElement.width) !== null && _b !== void 0 ? _b : 0) : _this.currentCanvasImage.width;
                    _this.canvas.height = _this.state.isFullScreen ? ((_c = viewportElement === null || viewportElement === void 0 ? void 0 : viewportElement.height) !== null && _c !== void 0 ? _c : 0) : _this.currentCanvasImage.height;
                    _this.trackTransforms(_this.ctx);
                    _this.redraw();
                }
            };
            this.currentCanvasImage.onerror = function () { return console.log('cannot load this image'); };
        }
        else {
            this.currentCanvasImage = (_b = this.images[0]) !== null && _b !== void 0 ? _b : null;
            var viewportElement = (_c = this.viewPortElementRef.current) === null || _c === void 0 ? void 0 : _c.getBoundingClientRect();
            if (this.canvas && this.currentCanvasImage) {
                this.canvas.width = this.state.isFullScreen ? ((_d = viewportElement === null || viewportElement === void 0 ? void 0 : viewportElement.width) !== null && _d !== void 0 ? _d : 0) : this.currentCanvasImage.width;
                this.canvas.height = this.state.isFullScreen ? ((_e = viewportElement === null || viewportElement === void 0 ? void 0 : viewportElement.height) !== null && _e !== void 0 ? _e : 0) : this.currentCanvasImage.height;
                this.trackTransforms(this.ctx);
                this.redraw();
            }
        }
    };
    JinReact360Viewer.prototype.redraw = function () {
        try {
            if (!this.ctx || !this.canvas || !this.currentCanvasImage)
                return;
            var p1 = this.ctx.transformedPoint(0, 0);
            var p2 = this.ctx.transformedPoint(this.canvas.width, this.canvas.height);
            var hRatio = this.canvas.width / this.currentCanvasImage.width;
            var vRatio = this.canvas.height / this.currentCanvasImage.height;
            var ratio = Math.min(hRatio, vRatio);
            var centerShift_x = (this.canvas.width - this.currentCanvasImage.width * ratio) / 2;
            var centerShift_y = (this.canvas.height - this.currentCanvasImage.height * ratio) / 2;
            this.ctx.clearRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);
            this.centerX = this.currentCanvasImage.width * ratio / 2;
            this.centerY = this.currentCanvasImage.height * ratio / 2;
            this.ctx.drawImage(this.currentCanvasImage, this.currentLeftPosition, this.currentTopPosition, this.currentCanvasImage.width, this.currentCanvasImage.height, centerShift_x, centerShift_y, this.currentCanvasImage.width * ratio, this.currentCanvasImage.height * ratio);
        }
        catch (e) {
            this.trackTransforms(this.ctx);
        }
    };
    JinReact360Viewer.prototype.trackTransforms = function (ctx) {
        return new Promise(function (resolve) {
            var svg = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
            var xform = svg.createSVGMatrix();
            ctx.getTransform = function () { return xform; };
            var savedTransforms = [];
            var save = ctx.save;
            ctx.save = function () {
                savedTransforms.push(xform.translate(0, 0));
                return save.call(ctx);
            };
            var restore = ctx.restore;
            ctx.restore = function () {
                xform = savedTransforms.pop();
                return restore.call(ctx);
            };
            var scale = ctx.scale;
            ctx.scale = function (sx, sy) {
                xform = xform.scaleNonUniform(sx, sy);
                return scale.call(ctx, sx, sy);
            };
            var rotate = ctx.rotate;
            ctx.rotate = function (radians) {
                xform = xform.rotate(radians * 180 / Math.PI);
                return rotate.call(ctx, radians);
            };
            var translate = ctx.translate;
            ctx.translate = function (dx, dy) {
                xform = xform.translate(dx, dy);
                return translate.call(ctx, dx, dy);
            };
            var transform = ctx.transform;
            ctx.transform = function (a, b, c, d, e, f) {
                var m2 = svg.createSVGMatrix();
                m2.a = a;
                m2.b = b;
                m2.c = c;
                m2.d = d;
                m2.e = e;
                m2.f = f;
                xform = xform.multiply(m2);
                return transform.call(ctx, a, b, c, d, e, f);
            };
            // But to make it overload-safe, use this instead (TypeScript will infer the union)
            ctx.transform = function (a, b, c, d, e, f) {
                // Handle 6-param case (common)
                if (typeof a === 'number' && typeof b === 'number' && typeof c === 'number' &&
                    typeof d === 'number' && typeof e === 'number' && typeof f === 'number') {
                    var m2 = svg.createSVGMatrix();
                    m2.a = a;
                    m2.b = b;
                    m2.c = c;
                    m2.d = d;
                    m2.e = e;
                    m2.f = f;
                    xform = xform.multiply(m2);
                    return transform.call(ctx, a, b, c, d, e, f);
                }
                // Handle DOMMatrix case (rare; cast to any to bypass strict typing)
                // Note: This assumes transform is called with 1 arg; adjust if needed
                transform.call(ctx, a);
                // For xform update in matrix case: Approximate by decomposing DOMMatrix to SVGMatrix
                // (Optional: If you need precise tracking, implement DOMMatrix to SVGMatrix conversion)
                // For simplicity, skip xform update here if matrix usage is unlikely in your app
            };
            var pt = svg.createSVGPoint();
            ctx.transformedPoint = function (x, y) {
                pt.x = x;
                pt.y = y;
                return pt.matrixTransform(xform.inverse());
            };
            resolve(ctx);
        });
    };
    JinReact360Viewer.prototype.turnLeft = function () {
        this.moveActiveIndexDown(1);
    };
    JinReact360Viewer.prototype.turnRight = function () {
        this.moveActiveIndexUp(1);
    };
    JinReact360Viewer.prototype.moveActiveIndexUp = function (itemsSkipped) {
        if (this.stopAtEdges) {
            if (this.activeImage + itemsSkipped >= this.props.amount) {
                this.activeImage = this.props.amount;
            }
            else {
                this.activeImage += itemsSkipped;
            }
        }
        else {
            this.activeImage = (this.activeImage + itemsSkipped) % this.props.amount || this.props.amount;
        }
        this.update();
    };
    JinReact360Viewer.prototype.moveActiveIndexDown = function (itemsSkipped) {
        if (this.stopAtEdges) {
            if (this.activeImage - itemsSkipped <= 1) {
                this.activeImage = 1;
            }
            else {
                this.activeImage -= itemsSkipped;
            }
        }
        else {
            if (this.activeImage - itemsSkipped < 1) {
                this.activeImage = this.props.amount + (this.activeImage - itemsSkipped);
            }
            else {
                this.activeImage -= itemsSkipped;
            }
        }
        this.update();
    };
    JinReact360Viewer.prototype.update = function () {
        var image = this.images[this.activeImage - 1];
        this.currentCanvasImage = image;
        this.redraw();
    };
    JinReact360Viewer.prototype.zoom = function (clicks) {
        var factor = Math.pow(1.01, clicks);
        if (factor > 1) {
            this.currentScale += factor;
        }
        else {
            if (this.currentScale - factor > 1) {
                this.currentScale -= factor;
            }
            else {
                this.currentScale = 1;
            }
        }
        if (this.currentScale > 1 && this.ctx && this.state.lastX && this.state.lastY) {
            var pt = this.ctx.transformedPoint(this.state.lastX, this.state.lastY);
            this.ctx.translate(pt.x, pt.y);
            this.ctx.scale(factor, factor);
            this.ctx.translate(-pt.x, -pt.y);
            this.redraw();
        }
    };
    JinReact360Viewer.prototype.disableZoomin = function () {
        document.addEventListener("gesturestart", function (e) {
            e.preventDefault();
            document.body.style.zoom = "0.99";
        });
        document.addEventListener("gesturechange", function (e) {
            e.preventDefault();
            document.body.style.zoom = "0.99";
        });
        document.addEventListener("gestureend", function (e) {
            e.preventDefault();
            document.body.style.zoom = "1";
        });
    };
    JinReact360Viewer.prototype.onSpin = function () {
        if (this.state.playing || this.state.loopTimeoutId) {
            this.stop();
        }
    };
    JinReact360Viewer.prototype.stop = function () {
        if (this.activeImage === 1) {
            this.setState({ currentLoop: 0 });
        }
        this.setState({ playing: false });
        window.clearTimeout(this.state.loopTimeoutId);
    };
    JinReact360Viewer.prototype.loopImages = function () {
        var _a;
        var loop = (_a = this.props.loop) !== null && _a !== void 0 ? _a : 1;
        if (this.activeImage === 1) {
            if (this.state.currentLoop === loop) {
                this.stop();
            }
            else {
                this.setState(function (prevState) { return ({ currentLoop: prevState.currentLoop + 1 }); });
                this.next(null); // Fix for event type
            }
        }
        else {
            this.next(null);
        }
    };
    JinReact360Viewer.prototype.componentDidUpdate = function (prevProps, prevState) {
        if (this.state.currentLeftPosition !== prevState.currentLeftPosition) {
            console.log('Left Position Changed');
        }
        if (this.state.panmode !== prevState.panmode) {
            this.attachEvents();
        }
        if (this.state.playing !== prevState.playing) {
            if (!this.state.playing) {
                this.stop();
            }
            else {
                this.play();
            }
        }
        if (this.state.isFullScreen !== prevState.isFullScreen) {
            var container = this.viewerContainerRef.current;
            if (container) {
                if (!this.state.isFullScreen) {
                    container.classList.remove('v360-main', 'v360-fullscreen');
                }
                else {
                    container.classList.add('v360-main', 'v360-fullscreen');
                }
            }
            this.setImage();
        }
    };
    JinReact360Viewer.prototype.render = function () {
        var _a;
        return (_jsx("div", { children: _jsxs("div", { className: "v360-viewer-container", ref: this.viewerContainerRef, id: "identifier", onWheel: this.zoomImage, children: [!this.state.imagesLoaded ? (_jsxs("div", { className: "v360-viewport", children: [_jsx("div", { className: "v360-spinner-grow" }), _jsx("p", { ref: this.viewPercentageRef, className: "v360-percentage-text" })] })) : null, _jsx(Hammer, { onPinchIn: this.handlePinch, onPinchOut: this.handlePinch, onPinchEnd: this.pinchOut, options: {
                            recognizers: {
                                pinch: { enable: true }
                            }
                        }, children: _jsxs("div", { className: "v360-viewport-container v360-viewport", children: [_jsx("canvas", { className: "v360-image-container", ref: this.imageContainerRef }), this.props.boxShadow ? _jsx("div", { className: "v360-product-box-shadow" }) : null] }) }), _jsx("abbr", { title: "Fullscreen Toggle", children: _jsx("div", { className: "v360-fullscreen-toggle text-center", onClick: this.toggleFullScreen, children: _jsx("div", { className: this.props.buttonClass === 'dark' ? 'v360-fullscreen-toggle-btn text-light' : 'v360-fullscreen-toggle-btn text-dark', children: _jsx("i", { className: !this.state.isFullScreen ? 'fas fa-expand text-lg' : 'fas fa-compress text-lg' }) }) }) }), _jsx("div", { id: "v360-menu-btns", className: (_a = this.props.buttonClass) !== null && _a !== void 0 ? _a : '', children: _jsxs("div", { className: "v360-navigate-btns", children: [_jsx(Button, { clicked: this.togglePlay, icon: this.state.playing ? 'fa fa-pause' : 'fa fa-play' }), _jsx(Button, { clicked: this.zoomIn, icon: "fa fa-search-plus" }), _jsx(Button, { clicked: this.zoomOut, icon: "fa fa-search-minus" }), this.state.panmode ? (_jsx(Button, { clicked: this.togglePanMode, text: "360\u00B0" })) : (_jsx(Button, { clicked: this.togglePanMode, icon: "fa fa-hand-paper" })), _jsx(Button, { clicked: this.prev, icon: "fa fa-chevron-left" }), _jsx(Button, { clicked: this.next, icon: "fa fa-chevron-right" }), _jsx(Button, { clicked: this.resetPosition, icon: "fa fa-sync" })] }) })] }) }));
    };
    return JinReact360Viewer;
}(Component));
export default JinReact360Viewer;
