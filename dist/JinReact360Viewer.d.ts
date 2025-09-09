import React, { Component } from "react";
import './style.css';
interface Props {
    amount: number;
    imagePath: string;
    fileName: string;
    paddingIndex?: boolean;
    autoplay?: boolean;
    loop?: number;
    spinReverse?: boolean;
    boxShadow?: boolean;
    buttonClass?: 'dark' | 'light';
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
    dragStart: {
        x: number;
        y: number;
    } | null;
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
        transformedPoint(x: number, y: number): {
            x: number;
            y: number;
        };
    }
}
declare class JinReact360Viewer extends Component<Props, State> {
    private viewPercentageRef;
    private viewPortElementRef;
    private viewerContainerRef;
    private imageContainerRef;
    private canvas;
    private ctx;
    private isMobile;
    private imageData;
    private images;
    private loadedImages;
    private viewerPercentage;
    private currentImage;
    private currentLeftPosition;
    private currentTopPosition;
    private currentCanvasImage;
    private centerX;
    private centerY;
    private movementStart;
    private movement;
    private speedFactor;
    private activeImage;
    private stopAtEdges;
    private dragging;
    private dragStart;
    private currentScale;
    constructor(props: Props);
    componentDidMount(): void;
    fetchData(): void;
    lpad(str: number, padString: string, length: number): string;
    preloadImages(): void;
    addImage(resultSrc: string): void;
    onImageLoad(event: Event): void;
    updatePercentageInLoader(percentage: number): void;
    onAllImagesLoaded(e: Event): void;
    initData(): void;
    attachEvents(): void;
    bindPanModeEvents(element: HTMLDivElement): void;
    bind360ModeEvents(element: HTMLDivElement): void;
    startDragging: (evt: MouseEvent | TouchEvent) => void;
    setLastPositions: (evt: MouseEvent | TouchEvent) => void;
    doDragging: (evt: MouseEvent | TouchEvent) => void;
    stopDragging: (evt: MouseEvent | TouchEvent) => void;
    checkMobile(): void;
    loadInitialImage(): void;
    setImage(cached?: boolean): void;
    redraw(): void;
    trackTransforms(ctx: CanvasRenderingContext2D): Promise<CanvasRenderingContext2D>;
    prev: (e: React.MouseEvent) => void;
    next: (e: React.MouseEvent) => void;
    resetPosition: () => void;
    turnLeft(): void;
    turnRight(): void;
    moveActiveIndexUp(itemsSkipped: number): void;
    moveActiveIndexDown(itemsSkipped: number): void;
    update(): void;
    zoomImage: (evt: React.WheelEvent) => void;
    zoomIn: (evt: React.MouseEvent) => void;
    zoomOut: (evt: React.MouseEvent) => void;
    zoom(clicks: number): void;
    disableZoomin(): void;
    onMove: (pageX: number) => void;
    startMoving: (evt: MouseEvent) => void;
    doMoving: (evt: MouseEvent) => void;
    stopMoving: (evt: MouseEvent) => void;
    touchStart: (evt: TouchEvent) => void;
    touchMove: (evt: TouchEvent) => void;
    touchEnd: () => void;
    play: () => void;
    onSpin(): void;
    stop(): void;
    loopImages(): void;
    togglePlay: (e: React.MouseEvent) => void;
    togglePanMode: (e: React.MouseEvent) => void;
    toggleFullScreen: (e: React.MouseEvent) => void;
    componentDidUpdate(prevProps: Props, prevState: State): void;
    handlePinch: (e: any) => void;
    pinchOut: () => void;
    render(): React.ReactNode;
}
export default JinReact360Viewer;
//# sourceMappingURL=JinReact360Viewer.d.ts.map