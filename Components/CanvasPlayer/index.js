import template from "./template.js";

// we inform the browser that our new element will be called
// "canvas-player"
customElements.define('canvas-player', class CanvasPlayer extends HTMLElement {

    constructor() {
        super();

        // Adds a shadowRoot to our element and appends our template
        const root = this.attachShadow({mode: 'open'});
        root.appendChild(template.content.cloneNode(true));

        // Registers our onclick action to start the video
        const playButton = this.shadowRoot.querySelector("#play");
        playButton.addEventListener("click", () => {
            this.startVideo();
        })

        // Registers our onclick action to toggle the canvas
        const toggleCanvas = this.shadowRoot.querySelector("#toggle");
        toggleCanvas.addEventListener("click", () => {
            this.toggleCanvas();
        })

        // Adds a prototype to the Number object so we
        // can easily find values within the chroma tolerance
        Number.prototype.near = function(val, tolerance) {
            return this > val - tolerance && this < val + tolerance;
        }
    }

    // This function is called when the element is connected to the DOM
    connectedCallback() {
        const videoSrc = this.getAttribute("videoSrc");
        const bgSrc = this.getAttribute("bgSrc");

        // Gets our RGB colors from our element
        const chromaColor = this.getAttribute("chromaColor").split(",");
        this.r = +chromaColor[0];
        this.g = +chromaColor[1];
        this.b = +chromaColor[2];
        this.tolerance = +this.getAttribute("chromaTolerance");


        // Registers all of our canvases, canvas contexts and our image loader
        this.video = this.shadowRoot.querySelector("video");
        this.canvas = this.shadowRoot.querySelector("canvas");
        this.ctx = this.canvas.getContext("2d");
        this.videoCaptureCanvas = document.createElement("canvas");
        this.videoCaptureCtx = this.videoCaptureCanvas.getContext("2d");
        this.bgImg = document.createElement("img");

        // We are using the successful load our background image to
        // trigger the start of our canvas animation
        const self = this;
        this.bgImg.onload = () => {
            window.requestAnimationFrame(self.renderCanvas.bind(this))
        };

        // Once everything is ready, we give the video & img elements their
        // sources triggering the process
        this.video.src = videoSrc;
        this.bgImg.src = bgSrc;
    }

    startVideo() {
        this.shadowRoot.querySelector("#play").className = "hidden";
        this.video.play();
        this.videoPlaying = true;
    }

    toggleCanvas() {
        this.canvas.className === "hidden" ?
            this.canvas.className = "" :
            this.canvas.className = "hidden";
    }

    renderCanvas() {
        const {
            canvas,
            ctx,
            bgImg,
            video,
            videoCaptureCanvas,
            videoCaptureCtx
        } = this;

        // Setting the canvas's width & height has the added bonus of
        // wiping the previous content from the canvas
        canvas.width = video.clientWidth;
        canvas.height = video.clientHeight;

        // We draw our base image (the field of zebras) on to the canvas
        ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

        if(this.videoPlaying) {
            // We ask the canvas to give us the the byte array from the canvas
            // this data is stored as an array of integers, with every four
            // values representing a pixel (r, g, b, alpha)
            this.imgData = this.imgData || ctx.getImageData(0, 0, canvas.width, canvas.height);

            // Our video capture canvas is never shown. It is only used to drop
            // a frame of the video that we can then get the image data from
            videoCaptureCanvas.width = canvas.clientWidth;
            videoCaptureCanvas.height = canvas.clientHeight;
            videoCaptureCtx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const videoImgData = videoCaptureCtx.getImageData(0, 0, canvas.width, canvas.height);

            // We loop through the image video's image data pixel by pixel
            // (in increments of four) and whenever the red, green AND blue
            // values of the pixel are within the tolerance of our chroma
            // colors, we replace that pixel with the corresponding pixel
            // from the background image
            for(let i = 0; i < videoImgData.data.length; i += 4) {
                if(
                    videoImgData.data[i].near(this.r, this.tolerance) &&
                    videoImgData.data[i + 1].near(this.g, this.tolerance) &&
                    videoImgData.data[i + 2].near(this.b, this.tolerance)
                ) {
                    videoImgData.data[i] = this.imgData.data[i];
                    videoImgData.data[i+1] = this.imgData.data[i+1];
                    videoImgData.data[i+2] = this.imgData.data[i+2];
                };
            };

            // finally we put our newly created, chroma keyed image on to the
            // canvas
            ctx.putImageData(videoImgData, 0, 0);
        }

        // once all the above is complete, we start all over again
        window.requestAnimationFrame(this.renderCanvas.bind(this));
    }
});
