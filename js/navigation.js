/*
    This script is used for panning and zooming the wall using either mouse or touchscreen.
*/

// Element to be dragged
const ELEMENT_ID = "wall";

// Parameters
const ALSO_DRAG_OUTSIDE = true;
const MAX_ZOOM = 5;
const MIN_ZOOM = 0.1;
const SCROLL_FACTOR = 1.05;

// Global variables
let element, parent;
let objLoc;  // object location
let currentZoom, lastZoom;
let isDragging = false;
let dragStart = { x: 0, y: 0 };
let initialPinchDistance = null;
let mouseMoved = false;
let hasZoomed = false;

// Execute this function after your desired element has been loaded and
// after the above variables have been declared
function enablePanAndZoom() {
    element = document.getElementById(ELEMENT_ID);
    parent = ALSO_DRAG_OUTSIDE ? element.parentElement : element;
    initializeStyles();
    addNavigationListeners();
}

function initializeStyles() {
    element.style.transformOrigin = "0px 0px";
    parent.style.overflow = "hidden";
    parent.style.cursor = "grab";
    resetTransform();
}
function addNavigationListeners() {
    parent.addEventListener('mousedown', handleMouse)
    parent.addEventListener('mousemove', handleMouse)
    window.addEventListener('mouseup', handleMouse)
    parent.addEventListener('touchstart', handleTouch)
    parent.addEventListener('touchmove', handleTouch)
    parent.addEventListener('touchend',  handleTouch)
    parent.addEventListener('wheel', handleScroll)
}

// Transforms the movable object element
function resetTransform(){
    currentZoom = 0.8;               // Set this as the initial zoom
    const initialX = (window.innerWidth)/2 - 69*44*currentZoom/2;
    const initialY = 0;
    objLoc = { x: initialX, y: initialY };  // Set this as the initial position
    lastZoom = currentZoom;
    setTransform();
}
function setTransform() {
    const translate = "translate(" + objLoc.x + "px, " + objLoc.y + "px) ";
    const scale = "scale(" + currentZoom + ")";
    element.style.transform = translate + scale;
}

// Gets the relevant location from a mouse or touch event
function getEventLocation(e) {
    if (e.touches) {
        if (e.touches.length == 1) {
            return {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY
            };
        } else {
            return [0,1].map((i) => { return {
                x: e.touches[i].clientX,
                y: e.touches[i].clientY
            }});
        }
    } else if (e.clientX && e.clientY) {
        return {
            x: e.clientX,
            y: e.clientY
        };
    }
}

// Hub for mouse events
function handleMouse(e) {
    e.preventDefault();
    switch (e.type) {
        case "mousedown":
            mouseMoved = false;
            hasZoomed = false;
            onPointerDown(e);
            break;
        case "mouseup":
            onPointerUp(e);
            break;
        case "mousemove":
            if (isDragging) {
                onPointerMove(e)
            };
    }
}

// Hub for touch events
function handleTouch(e) {
    e.preventDefault();
    switch (e.type) {
        case "touchstart":
            if (e.touches.length == 1) {
                mouseMoved = false;
                hasZoomed = false;
            }
        case "touchend":
            if (e.touches.length == 0) {
                onPointerUp(e);
            } else {
                onPointerDown(e);
            }
            break;
        case "touchmove":
            if (e.touches.length == 2) {
                isDragging = false;
                handlePinch(e);
            } else {
                onPointerMove(e)
            };
    }
}

//Hub for click events???? kinda???
function handleClick(e){
    e.target.dispatchEvent(new Event("openModal"));
}

// Drag functions
function onPointerDown(e) {
    parent.style.cursor = "grabbing";
    isDragging = true;
    const eLoc = getEventLocation(e);
    dragStart = {
        x: eLoc.x - objLoc.x,
        y: eLoc.y - objLoc.y
    };
}
function onPointerUp(e) {
    parent.style.cursor = "grab";
    isDragging = false;
    initialPinchDistance = null;
    if (!mouseMoved && !hasZoomed) { handleClick(e) };
    lastZoom = currentZoom;
}
function onPointerMove(e) {
    mouseMoved = true;
    parent.style.cursor = "grabbing";
    const eLoc = getEventLocation(e);
    objLoc.x = (eLoc.x - dragStart.x);
    objLoc.y = (eLoc.y - dragStart.y);
    setTransform();
}

// Zoom functions
function handleScroll(e){
    if (isDragging) return;
    e.preventDefault();
    const delta = e.wheelDelta ? e.wheelDelta : -e.deltaY;
    const zoomFactor = delta > 0 ? SCROLL_FACTOR : 1/SCROLL_FACTOR;
    setZoom(e, zoomFactor);
}
function handlePinch(e) {
    e.preventDefault();
    let touchLoc = getEventLocation(e);
    let currentDistance = euclideanDistance(touchLoc[0], touchLoc[1]);
    if (initialPinchDistance == null) {
        initialPinchDistance = currentDistance
    } else if (!isDragging) {
        const zoomFactor = (currentDistance/initialPinchDistance);
        setZoom(e, zoomFactor);
    }
}
function setZoom(e, zoomFactor) {
    hasZoomed = true;
    let eLoc = getEventLocation(e);
    if (e.touches) { eLoc = {
        x: (eLoc[0].x + eLoc[1].x)/2,
        y: (eLoc[0].y + eLoc[1].y)/2
    }};
    const xs = (eLoc.x - objLoc.x) / currentZoom;
    const ys = (eLoc.y - objLoc.y) / currentZoom;
    currentZoom = clamp((e.touches ? lastZoom : currentZoom)*zoomFactor, MIN_ZOOM, MAX_ZOOM);
    objLoc.x = eLoc.x - xs * currentZoom;
    objLoc.y = eLoc.y - ys * currentZoom;
    setTransform();
}

// Custom math functions
function clamp(number, min, max) {
    return Math.max(min, Math.min(number, max));
}
function euclideanDistance(a, b) {
    return Math.hypot(...Object.keys(a).map((k) => (b[k] - a[k])));
}