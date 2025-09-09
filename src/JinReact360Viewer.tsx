import React, { Component } from "react";
import Hammer from 'react-hammerjs';
import Button from './components/Button'; // Assume Button is typed or add types if needed
import './style.css'; // Styles don't need types

interface Props {
    amount: number;
    imagePath: string;
    fileName: string; // e.g., "image-{index}.jpg"
    paddingIndex?: boolean;
    autoplay?: boolean;
    loop?: number;
    spinReverse?: boolean;
    boxShadow?: boolean;
    buttonClass?: 'dark' | 'light'; // Or string if more options
}

interface State {
    lastX: number;
    lastY: number;
    minScale: number;
    maxScale: number;
    scale: number;
    customOffset: number;
    currentScale: number;
    currentTopPosition: number;
    currentLeftPosition: number;
    selectMenuOption: number;
    currentImage: string | null;
    dragging: boolean;
    canvas: HTMLCanvasElement | null;
    ctx: CanvasRenderingContext2D | null;
    dragStart: { x: number; y: number } | null;
    currentCanvasImage: HTMLImageElement | null;
    isFullScreen: boolean;
    viewPortElementWidth: number | null;
    movementStart: number;
    movement: boolean;
    dragSpeed: number;
    speedFactor: number;
    activeImage: number;
    stopAtEdges: boolean;
    panmode: boolean;
    currentLoop: number;
    loopTimeoutId: number;
    playing: boolean;
    imagesLoaded: boolean;
}

declare global {
    interface CanvasRenderingContext2D {
        getTransform(): SVGMatrix;
        transformedPoint(x: number, y: number): { x: number; y: number };
    }
}

class JinReact360Viewer extends Component<Props, State> {
    private viewPercentageRef = React.createRef<HTMLDivElement>();
    private viewPortElementRef = React.createRef<HTMLDivElement>();
    private viewerContainerRef = React.createRef<HTMLDivElement>();
    private imageContainerRef = React.createRef<HTMLCanvasElement>();
    private canvas: HTMLCanvasElement | null = null;
    private ctx: CanvasRenderingContext2D | null = null;
    private isMobile: boolean = false;
    private imageData: string[] = [];
    private images: HTMLImageElement[] = [];
    private loadedImages: number = 0;
    private viewerPercentage: HTMLParagraphElement | null = null;
    private currentImage: string | null = null;
    private currentLeftPosition: number = 0;
    private currentTopPosition: number = 0;
    private currentCanvasImage: HTMLImageElement | null = null;
    private centerX: number = 0;
    private centerY: number = 0;
    private movementStart: number = 0;
    private movement: boolean = false;
    private speedFactor: number = 13;
    private activeImage: number = 1;
    private stopAtEdges: boolean = false;
    private dragging: boolean = false;
    private dragStart: { x: number; y: number } | null = null;
    private currentScale: number = 1;  // Add this if missing

    constructor(props: Props) {
        super(props);
        this.state = {
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
    }

    componentDidMount(): void {
        this.disableZoomin();
        this.viewerPercentage = this.viewPercentageRef.current;
        const viewPortElement = this.viewerContainerRef.current?.getElementsByClassName('v360-viewport-container')[0] as HTMLDivElement;
        if (viewPortElement) {
            this.viewPortElementRef.current = viewPortElement;
        }
        this.fetchData();
    }

    fetchData(): void {
        for (let i = 1; i <= this.props.amount; i++) {
            const imageIndex = this.props.paddingIndex ? this.lpad(i, "0", 2) : i.toString();
            const fileName = this.props.fileName.replace('{index}', imageIndex);
            const filePath = `${this.props.imagePath}/${fileName}`;
            this.imageData.push(filePath);
        }
        this.preloadImages();
    }

    lpad(str: number, padString: string, length: number): string {
        let s = str.toString();
        while (s.length < length) s = padString + s;
        return s;
    }

    preloadImages(): void {
        if (this.imageData.length) {
            try {
                this.imageData.forEach(src => this.addImage(src));
            } catch (error) {
                console.error(`Something went wrong while loading images: ${(error as Error).message}`);
            }
        } else {
            console.log('No Images Found');
        }
    }

    addImage(resultSrc: string): void {
        const image = new Image();
        image.src = resultSrc;
        image.onload = this.onImageLoad.bind(this);
        // image.onerror = this.onImageLoad.bind(this);
        this.images.push(image);
    }

    onImageLoad(event: Event): void {
        const percentage = Math.round(this.loadedImages / this.props.amount * 100);
        this.loadedImages += 1;
        this.updatePercentageInLoader(percentage);
        if (this.loadedImages === this.props.amount) {
            this.onAllImagesLoaded(event);
        } else if (this.loadedImages === 1) {
            console.log('load first image');
        }
    }

    updatePercentageInLoader(percentage: number): void {
        if (this.viewerPercentage) {
            this.viewerPercentage.innerHTML = percentage + '%';
        }
    }

    onAllImagesLoaded(e: Event): void {
        this.setState({ imagesLoaded: true });
        this.initData();
    }

    initData(): void {
        this.canvas = this.imageContainerRef.current;
        if (this.canvas) {
            this.ctx = this.canvas.getContext('2d');
        }
        this.attachEvents();
        this.checkMobile();
        this.loadInitialImage();
        this.setState({ playing: this.props.autoplay ?? false });
    }

    attachEvents(): void {
        const viewPortElement = this.viewPortElementRef.current;
        if (!viewPortElement) return;

        if (this.state.panmode) {
            this.bindPanModeEvents(viewPortElement);
        } else {
            this.bind360ModeEvents(viewPortElement);
        }
    }

    bindPanModeEvents(element: HTMLDivElement): void {
        element.removeEventListener('touchend', this.stopDragging as EventListener);
        element.removeEventListener('touchstart', this.startDragging as EventListener);
        element.removeEventListener('touchmove', this.doDragging as EventListener);
        element.removeEventListener('mouseup', this.stopMoving as EventListener);
        element.removeEventListener('mousedown', this.startMoving as EventListener);
        element.removeEventListener('mousemove', this.doMoving as EventListener);

        element.addEventListener('touchend', this.stopDragging as EventListener);
        element.addEventListener('touchstart', this.startDragging as EventListener);
        element.addEventListener('touchmove', this.doDragging as EventListener);
        element.addEventListener('mouseup', this.stopDragging as EventListener);
        element.addEventListener('mousedown', this.startDragging as EventListener);
        element.addEventListener('mousemove', this.doDragging as EventListener);
    }

    bind360ModeEvents(element: HTMLDivElement): void {
        element.removeEventListener('touchend', this.stopDragging as EventListener);
        element.removeEventListener('touchstart', this.startDragging as EventListener);
        element.removeEventListener('touchmove', this.doDragging as EventListener);
        element.removeEventListener('mouseup', this.stopDragging as EventListener);
        element.removeEventListener('mousedown', this.startDragging as EventListener);
        element.removeEventListener('mousemove', this.doDragging as EventListener);

        element.addEventListener('touchend', this.touchEnd as EventListener);
        element.addEventListener('touchstart', this.touchStart as EventListener);
        element.addEventListener('touchmove', this.touchMove as EventListener);
        element.addEventListener('mouseup', this.stopMoving as EventListener);
        element.addEventListener('mousedown', this.startMoving as EventListener);
        element.addEventListener('mousemove', this.doMoving as EventListener);
    }

    startDragging = (evt: MouseEvent | TouchEvent): void => {
        this.dragging = true;
        document.body.style.userSelect = 'none';  // Covers all modern browsers
        // document.body.style.mozUserSelect = document.body.style.webkitUserSelect = document.body.style.userSelect = 'none';
        this.setLastPositions(evt);
        if (this.ctx && this.state.lastX && this.state.lastY) {
            this.dragStart = this.ctx.transformedPoint(this.state.lastX, this.state.lastY);
        }
    };

    setLastPositions = (evt: MouseEvent | TouchEvent): void => {
        let offsetX: number, offsetY: number;
        if (this.isMobile && 'touches' in evt && evt.touches[0]) {
            offsetX = (evt.touches[0] as any).offsetX || (evt.touches[0].pageX - (this.canvas?.offsetLeft ?? 0));
            offsetY = (evt.touches[0] as any).offsetY || (evt.touches[0].pageY - (this.canvas?.offsetTop ?? 0));
        } else {
            offsetX = (evt as MouseEvent).offsetX || ((evt as MouseEvent).pageX - (this.canvas?.offsetLeft ?? 0));
            offsetY = (evt as MouseEvent).offsetY || ((evt as MouseEvent).pageY - (this.canvas?.offsetTop ?? 0));
        }
        this.setState({ lastX: offsetX, lastY: offsetY });
    };

    doDragging = (evt: MouseEvent | TouchEvent): void => {
        this.setLastPositions(evt);
        if (this.dragStart && this.ctx && this.state.lastX && this.state.lastY) {
            const pt = this.ctx.transformedPoint(this.state.lastX, this.state.lastY);
            this.ctx.translate(pt.x - this.dragStart.x, pt.y - this.dragStart.y);
            this.redraw();
        }
    };

    stopDragging = (evt: MouseEvent | TouchEvent): void => {
        this.dragging = false;
        this.dragStart = null;
    };

    checkMobile(): void {
        this.isMobile = !!('ontouchstart' in window);
    }

    loadInitialImage(): void {
        this.currentImage = this.imageData[0] ?? null;
        if (this.currentImage) {
            this.setImage();
        }
    }

    setImage(cached: boolean = false): void {
        this.currentLeftPosition = this.currentTopPosition = 0;

        if (!cached) {
            this.currentCanvasImage = new Image();
            (this.currentCanvasImage as any).crossOrigin = 'anonymous'; // TS doesn't like this; use // @ts-ignore if needed
            this.currentCanvasImage.src = this.currentImage ?? '';
            this.currentCanvasImage.onload = () => {
                const viewportElement = this.viewPortElementRef.current?.getBoundingClientRect();
                if (this.canvas && this.currentCanvasImage) {
                    this.canvas.width = this.state.isFullScreen ? (viewportElement?.width ?? 0) : this.currentCanvasImage.width;
                    this.canvas.height = this.state.isFullScreen ? (viewportElement?.height ?? 0) : this.currentCanvasImage.height;
                    this.trackTransforms(this.ctx!);
                    this.redraw();
                }
            };
            this.currentCanvasImage.onerror = () => console.log('cannot load this image');
        } else {
            this.currentCanvasImage = this.images[0] ?? null;
            const viewportElement = this.viewPortElementRef.current?.getBoundingClientRect();
            if (this.canvas && this.currentCanvasImage) {
                this.canvas.width = this.state.isFullScreen ? (viewportElement?.width ?? 0) : this.currentCanvasImage.width;
                this.canvas.height = this.state.isFullScreen ? (viewportElement?.height ?? 0) : this.currentCanvasImage.height;
                this.trackTransforms(this.ctx!);
                this.redraw();
            }
        }
    }

    redraw(): void {
        try {
            if (!this.ctx || !this.canvas || !this.currentCanvasImage) return;
            const p1 = this.ctx.transformedPoint(0, 0);
            const p2 = this.ctx.transformedPoint(this.canvas.width, this.canvas.height);
            const hRatio = this.canvas.width / this.currentCanvasImage.width;
            const vRatio = this.canvas.height / this.currentCanvasImage.height;
            const ratio = Math.min(hRatio, vRatio);
            const centerShift_x = (this.canvas.width - this.currentCanvasImage.width * ratio) / 2;
            const centerShift_y = (this.canvas.height - this.currentCanvasImage.height * ratio) / 2;
            this.ctx.clearRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);
            this.centerX = this.currentCanvasImage.width * ratio / 2;
            this.centerY = this.currentCanvasImage.height * ratio / 2;

            this.ctx.drawImage(
                this.currentCanvasImage,
                this.currentLeftPosition,
                this.currentTopPosition,
                this.currentCanvasImage.width,
                this.currentCanvasImage.height,
                centerShift_x,
                centerShift_y,
                this.currentCanvasImage.width * ratio,
                this.currentCanvasImage.height * ratio
            );
        } catch (e) {
            this.trackTransforms(this.ctx!);
        }
    }

    trackTransforms(ctx: CanvasRenderingContext2D): Promise<CanvasRenderingContext2D> {
        return new Promise(resolve => {
            const svg = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
            let xform = svg.createSVGMatrix();
            (ctx as any).getTransform = () => xform;

            const savedTransforms: SVGMatrix[] = [];
            const save = ctx.save;
            ctx.save = () => {
                savedTransforms.push(xform.translate(0, 0));
                return save.call(ctx);
            };
            const restore = ctx.restore;
            ctx.restore = () => {
                xform = savedTransforms.pop()!;
                return restore.call(ctx);
            };
            const scale = ctx.scale;
            ctx.scale = (sx: number, sy: number) => {
                xform = xform.scaleNonUniform(sx, sy);
                return scale.call(ctx, sx, sy);
            };
            const rotate = ctx.rotate;
            ctx.rotate = (radians: number) => {
                xform = xform.rotate(radians * 180 / Math.PI);
                return rotate.call(ctx, radians);
            };
            const translate = ctx.translate;
            ctx.translate = (dx: number, dy: number) => {
                xform = xform.translate(dx, dy);
                return translate.call(ctx, dx, dy);
            };
            const transform = ctx.transform;
            ctx.transform = (a: number, b: number, c: number, d: number, e: number, f: number) => {
                const m2 = svg.createSVGMatrix();
                m2.a = a; m2.b = b; m2.c = c; m2.d = d; m2.e = e; m2.f = f;
                xform = xform.multiply(m2);
                return transform.call(ctx, a, b, c, d, e, f);
            };
            // But to make it overload-safe, use this instead (TypeScript will infer the union)
            (ctx.transform as (
                a?: number,
                b?: number,
                c?: number,
                d?: number,
                e?: number,
                f?: number
            ) => void) = (a, b, c, d, e, f) => {
                // Handle 6-param case (common)
                if (typeof a === 'number' && typeof b === 'number' && typeof c === 'number' &&
                    typeof d === 'number' && typeof e === 'number' && typeof f === 'number') {
                    const m2 = svg.createSVGMatrix();
                    m2.a = a; m2.b = b; m2.c = c; m2.d = d; m2.e = e; m2.f = f;
                    xform = xform.multiply(m2);
                    return transform.call(ctx, a, b, c, d, e, f);
                }
                // Handle DOMMatrix case (rare; cast to any to bypass strict typing)
                // Note: This assumes transform is called with 1 arg; adjust if needed
                (transform as any).call(ctx, a);
                // For xform update in matrix case: Approximate by decomposing DOMMatrix to SVGMatrix
                // (Optional: If you need precise tracking, implement DOMMatrix to SVGMatrix conversion)
                // For simplicity, skip xform update here if matrix usage is unlikely in your app
            };
            const pt = svg.createSVGPoint();
            (ctx as any).transformedPoint = (x: number, y: number) => {
                pt.x = x; pt.y = y;
                return pt.matrixTransform(xform.inverse());
            };
            resolve(ctx);
        });
    }

    prev = (e: React.MouseEvent): void => {
        (this.props.spinReverse ? this.turnRight() : this.turnLeft());
    };

    next = (e: React.MouseEvent): void => {
        (this.props.spinReverse ? this.turnLeft() : this.turnRight());
    };

    resetPosition = (): void => {
        this.currentScale = 1;
        this.activeImage = 1;
        this.setImage(true);
    };

    turnLeft(): void {
        this.moveActiveIndexDown(1);
    }

    turnRight(): void {
        this.moveActiveIndexUp(1);
    }

    moveActiveIndexUp(itemsSkipped: number): void {
        if (this.stopAtEdges) {
            if (this.activeImage + itemsSkipped >= this.props.amount) {
                this.activeImage = this.props.amount;
            } else {
                this.activeImage += itemsSkipped;
            }
        } else {
            this.activeImage = (this.activeImage + itemsSkipped) % this.props.amount || this.props.amount;
        }
        this.update();
    }

    moveActiveIndexDown(itemsSkipped: number): void {
        if (this.stopAtEdges) {
            if (this.activeImage - itemsSkipped <= 1) {
                this.activeImage = 1;
            } else {
                this.activeImage -= itemsSkipped;
            }
        } else {
            if (this.activeImage - itemsSkipped < 1) {
                this.activeImage = this.props.amount + (this.activeImage - itemsSkipped);
            } else {
                this.activeImage -= itemsSkipped;
            }
        }
        this.update();
    }

    update(): void {
        const image = this.images[this.activeImage - 1];
        this.currentCanvasImage = image;
        this.redraw();
    }

    zoomImage = (evt: React.WheelEvent): void => {
        const offsetX = (evt as any).offsetX || (evt.pageX - (this.canvas?.offsetLeft ?? 0));
        const offsetY = (evt as any).offsetY || (evt.pageY - (this.canvas?.offsetTop ?? 0));
        this.setState({ lastX: offsetX, lastY: offsetY });

        const delta = (evt as any).wheelDelta ? (evt as any).wheelDelta / 40 : evt.deltaY ? -evt.deltaY : 0;
        if (delta) this.zoom(delta);
    };

    zoomIn = (evt: React.MouseEvent): void => {
        this.setState({ lastX: this.centerX, lastY: this.centerY });
        this.zoom(2);
    };

    zoomOut = (evt: React.MouseEvent): void => {
        this.setState({ lastX: this.centerX, lastY: this.centerY });
        this.zoom(-2);
    };

    zoom(clicks: number): void {
        const factor = Math.pow(1.01, clicks);
        if (factor > 1) {
            this.currentScale += factor;
        } else {
            if (this.currentScale - factor > 1) {
                this.currentScale -= factor;
            } else {
                this.currentScale = 1;
            }
        }

        if (this.currentScale > 1 && this.ctx && this.state.lastX && this.state.lastY) {
            const pt = this.ctx.transformedPoint(this.state.lastX, this.state.lastY);
            this.ctx.translate(pt.x, pt.y);
            this.ctx.scale(factor, factor);
            this.ctx.translate(-pt.x, -pt.y);
            this.redraw();
        }
    }

    disableZoomin(): void {
        document.addEventListener("gesturestart", (e: Event) => {
            (e as any).preventDefault();
            document.body.style.zoom = "0.99";
        });
        document.addEventListener("gesturechange", (e: Event) => {
            (e as any).preventDefault();
            document.body.style.zoom = "0.99";
        });
        document.addEventListener("gestureend", (e: Event) => {
            (e as any).preventDefault();
            document.body.style.zoom = "1";
        });
    }

    onMove = (pageX: number): void => {
        if (pageX - this.movementStart >= this.speedFactor) {
            const itemsSkippedRight = Math.floor((pageX - this.movementStart) / this.speedFactor) || 1;
            this.movementStart = pageX;
            if (this.props.spinReverse) {
                this.moveActiveIndexDown(itemsSkippedRight);
            } else {
                this.moveActiveIndexUp(itemsSkippedRight);
            }
            this.redraw();
        } else if (this.movementStart - pageX >= this.speedFactor) {
            const itemsSkippedLeft = Math.floor((this.movementStart - pageX) / this.speedFactor) || 1;
            this.movementStart = pageX;
            if (this.props.spinReverse) {
                this.moveActiveIndexUp(itemsSkippedLeft);
            } else {
                this.moveActiveIndexDown(itemsSkippedLeft);
            }
            this.redraw();
        }
    };

    startMoving = (evt: MouseEvent): void => {
        this.movement = true;
        this.movementStart = evt.pageX;
        if (this.viewPortElementRef.current) {
            this.viewPortElementRef.current.style.cursor = 'grabbing';
        }
    };

    doMoving = (evt: MouseEvent): void => {
        if (this.movement) {
            this.onMove(evt.clientX);
        }
    };

    stopMoving = (evt: MouseEvent): void => {
        this.movement = false;
        this.movementStart = 0;
        if (this.viewPortElementRef.current) {
            this.viewPortElementRef.current.style.cursor = 'grab';
        }
    };

    touchStart = (evt: TouchEvent): void => {
        if (evt.touches[0]) {
            this.movementStart = evt.touches[0].clientX;
        }
    };

    touchMove = (evt: TouchEvent): void => {
        if (evt.touches[0]) {
            this.onMove(evt.touches[0].clientX);
        }
    };

    touchEnd = (): void => {
        this.movementStart = 0;
    };

    play = (): void => {
        this.setState({
            loopTimeoutId: window.setInterval(() => this.loopImages(), 100)
        });
    };

    onSpin(): void {
        if (this.state.playing || this.state.loopTimeoutId) {
            this.stop();
        }
    }

    stop(): void {
        if (this.activeImage === 1) {
            this.setState({ currentLoop: 0 });
        }
        this.setState({ playing: false });
        window.clearTimeout(this.state.loopTimeoutId);
    }

    loopImages(): void {
        const loop = this.props.loop ?? 1;
        if (this.activeImage === 1) {
            if (this.state.currentLoop === loop) {
                this.stop();
            } else {
                this.setState(prevState => ({ currentLoop: prevState.currentLoop + 1 }));
                this.next(null as any); // Fix for event type
            }
        } else {
            this.next(null as any);
        }
    }

    togglePlay = (e: React.MouseEvent): void => {
        this.setState(prevState => ({ playing: !prevState.playing }));
    };

    togglePanMode = (e: React.MouseEvent): void => {
        this.setState(prevState => ({ panmode: !prevState.panmode }));
    };

    toggleFullScreen = (e: React.MouseEvent): void => {
        this.setState(prevState => ({ isFullScreen: !prevState.isFullScreen }));
    };

    componentDidUpdate(prevProps: Props, prevState: State): void {
        if (this.state.currentLeftPosition !== prevState.currentLeftPosition) {
            console.log('Left Position Changed');
        }

        if (this.state.panmode !== prevState.panmode) {
            this.attachEvents();
        }

        if (this.state.playing !== prevState.playing) {
            if (!this.state.playing) {
                this.stop();
            } else {
                this.play();
            }
        }

        if (this.state.isFullScreen !== prevState.isFullScreen) {
            const container = this.viewerContainerRef.current;
            if (container) {
                if (!this.state.isFullScreen) {
                    container.classList.remove('v360-main', 'v360-fullscreen');
                } else {
                    container.classList.add('v360-main', 'v360-fullscreen');
                }
            }
            this.setImage();
        }
    }

    handlePinch = (e: any): void => { // Hammer PinchEvent
        if (e.scale < this.currentScale) {
            this.zoomIn(null as any);
        } else if (e.scale > this.currentScale) {
            this.zoomOut(null as any);
        }
    };

    pinchOut = (): void => {
        this.currentScale = 1;
    };

    render(): React.ReactNode {
        return (
            <div>
                <div
                    className="v360-viewer-container"
                    ref={this.viewerContainerRef}
                    id="identifier"
                    onWheel={this.zoomImage}
                >
                    {!this.state.imagesLoaded ? (
                        <div className="v360-viewport">
                            <div className="v360-spinner-grow"></div>
                            <p ref={this.viewPercentageRef} className="v360-percentage-text"></p>
                        </div>
                    ) : null}

                    <Hammer
                        onPinchIn={this.handlePinch}
                        onPinchOut={this.handlePinch}
                        onPinchEnd={this.pinchOut}
                        options={{
                            recognizers: {
                                pinch: { enable: true }
                            }
                        }}
                    >
                        <div className="v360-viewport-container v360-viewport">
                            <canvas className="v360-image-container" ref={this.imageContainerRef}></canvas>
                            {this.props.boxShadow ? <div className="v360-product-box-shadow"></div> : null}
                        </div>
                    </Hammer>

                    <abbr title="Fullscreen Toggle">
                        <div className="v360-fullscreen-toggle text-center" onClick={this.toggleFullScreen}>
                            <div className={this.props.buttonClass === 'dark' ? 'v360-fullscreen-toggle-btn text-light' : 'v360-fullscreen-toggle-btn text-dark'}>
                                <i className={!this.state.isFullScreen ? 'fas fa-expand text-lg' : 'fas fa-compress text-lg'}></i>
                            </div>
                        </div>
                    </abbr>

                    <div id="v360-menu-btns" className={this.props.buttonClass ?? ''}>
                        <div className="v360-navigate-btns">
                            <Button clicked={this.togglePlay} icon={this.state.playing ? 'fa fa-pause' : 'fa fa-play'} />
                            <Button clicked={this.zoomIn} icon="fa fa-search-plus" />
                            <Button clicked={this.zoomOut} icon="fa fa-search-minus" />
                            {this.state.panmode ? (
                                <Button clicked={this.togglePanMode} text="360°" />
                            ) : (
                                <Button clicked={this.togglePanMode} icon="fa fa-hand-paper" />
                            )}
                            <Button clicked={this.prev} icon="fa fa-chevron-left" />
                            <Button clicked={this.next} icon="fa fa-chevron-right" />
                            <Button clicked={this.resetPosition} icon="fa fa-sync" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default JinReact360Viewer;