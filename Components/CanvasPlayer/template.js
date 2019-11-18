const template = document.createElement('template');

template.innerHTML = `
    <style>
        div {
            position: relative;
            width: 600px;
            height: 338px;
        }
        canvas, video {
            position: absolute;
            top: 0;
            left: 0;
            width: 600px;
            height: 338px;

        }
        canvas {
            z-index: 2;
            background-color: transparent;
        }
        video {
            z-index: 1;
        }
        #play {
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            z-index:3;
            width: 120px;
            height: 120px;
            border-radius: 50%;
            border: none;
            background: #5ca25c;
            color: white;
            font-size: 24px;
            cursor: pointer;
        }
        #toggle {
            position: absolute;
            right: 0;
            bottom: 0%;
            z-index: 3;
        }
        .hidden {
            display: none;
        }

    </style>
    <div>
        <video></video>
        <canvas></canvas>
        <button id="play">PLAY</button>
        <button id="toggle">Toggle Canvas</button>
    </div>
`;

export default template;
