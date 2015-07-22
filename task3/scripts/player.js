(function () {
    var file;
    var arrayBuffer;
    var audioBuffer;
    var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    var source;
    var audiostart, audiostop, playedtime, isPlaying = false;
    var drawVisual;
    var analyser = audioCtx.createAnalyser();
    function dragAndDropInit() {
        $(".audio_player").draggable();
    }
    function openFile() {
        var inputFileElement = $(".inputFile")[0];
        inputFileElement.onchange = function () {
            if (isPlaying) {
                source.stop(0);
            }
            window.cancelAnimationFrame(drawVisual);
            file = inputFileElement.files[0];
            loadAndReadFile();
        }
    }
    function connect() {
        source.connect(analyser);
        analyser.connect(audioCtx.destination);
    }
    function checkFileFormat(filename) {
        var supported = ['mp3', 'wav', 'ogg'];
        var dotInd = filename.lastIndexOf('.');
        var ext = filename.substring(dotInd + 1);
        if (supported.indexOf(ext) > -1) {
            return true;
        }
        return false;
    }
    function showTitleAndArtist() {
        var dv = new jDataView(arrayBuffer);
        // "TAG" starts at byte -128 from EOF.
        // See http://en.wikipedia.org/wiki/ID3
        if (dv.getString(3, dv.byteLength - 128) == 'TAG') {
            var title = dv.getString(30, dv.tell());
            var artist = dv.getString(30, dv.tell());
            $('#titleAndArtistDiv').html('Artist: ' + artist + '<br /> Title: ' + title);
        } else {
            $('#titleAndArtistDiv').html('');
        }
    }
    function loadAndReadFile() {
        var fileReader = new FileReader();
        fileReader.readAsArrayBuffer(file);
        fileReader.onloadend = function () {
            arrayBuffer = fileReader.result;
            source = audioCtx.createBufferSource();
            audioCtx.decodeAudioData(arrayBuffer, function (decodedData) {
                audioBuffer = decodedData;
                source.buffer = decodedData;

                connect();

                source.loop = true;
                if (checkFileFormat(file.name)) {
                    showTitleAndArtist();

                    $("#filename").text(file.name);

                    source.start(0);
                    audiostart = audioCtx.currentTime;
                    isPlaying = true;
                    playedtime = 0.0;

                    visualize();
                    equalize();
                } else {
                    alert("This file format is not supported.");
                }
            });
            $("#play").click(function () {
                if (!isPlaying) {
                    audiostart = audioCtx.currentTime;
                    source = audioCtx.createBufferSource();
                    source.buffer = audioBuffer;
                    connect();
                    source.loop = true;
                    source.start(audioCtx.currentTime - 1, playedtime);
                    isPlaying = true;
                    equalize();
                    visualize();
                }
            });
            $("#stop").click(function () {
                if (isPlaying) {
                    audiostop = audioCtx.currentTime;
                    playedtime += audiostop - audiostart;
                    window.cancelAnimationFrame(drawVisual);
                    source.stop(0);
                    isPlaying = false;
                }
            });
        }
    }
    function initVisualizer() {
        for (var i = 0; i < 32; i++) {
            var span = $('<span/>').appendTo('#visualizer');
            span.css({ verticalAlign: 'top', display: 'inline-block', width: '5px', height: '64px', background: '#363636', borderBottom: '2px solid red' });
        }
    }
    function visualize() {
        analyser.fftSize = 64;
        var bufferLength = analyser.fftSize;
        var dataArray = new Uint8Array(bufferLength);
        clearRect();
        var span = $("#visualizer span");

        function draw() {
            drawVisual = requestAnimationFrame(draw);

            analyser.getByteFrequencyData(dataArray);

            for (var i = 0; i < bufferLength; i++) {
                $(span[i]).css("height", (64 - dataArray[i] / 4) + "px");
            }
        }

        draw();
    }
    function clearRect() {
        $("#visualizer span").each(function () { $(this).css("height", "64px"); });
    }
    function equalize() {
        var filters = createFilters();

        source.connect(filters[0]); // источник цепляем к первому фильтру             
        filters[filters.length - 1].connect(audioCtx.destination); // а последний фильтр - к выходу

        setEqualizerEffects(filters);
    };
    function setEqualizerEffects(filters) {
        $('input[type=radio][name=eqmode]').change(function () {
            var effectsArr;
            if (this.value == 'classic') {
                effectsArr = [3.5, 2.5, 0.6, 1.1, -1.2, -1.1, 0.0, 0.7, 1.7, 2.2];
            } else if (this.value == 'jazz') {
                effectsArr = [3.5, 2.5, 0.6, 1.1, -1.2, -1.1, 0.0, 0.7, 1.7, 2.2];
            } else if (this.value == 'pop') {
                effectsArr = [-1.0, 1.0, 2.0, 2.3, 1.4, -0.8, -1.1, -1.2, -0.7, -0.8];
            } else if (this.value == 'rock') {
                effectsArr = [3.0, 1.5, -3.0, -4.0, -1.2, 1.1, 3.5, 4.5, 4.0, 3.5];
            } else {
                effectsArr = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0];
            }
            for (var i = 0; i < 10; i++) {
                filters[i].gain.value = effectsArr[i];
            }
        });
    }
    function createFilters() {
        var frequencies = [60, 170, 310, 600, 1000, 3000, 6000, 12000, 14000, 16000],
          filters = frequencies.map(createFilter);

        filters.reduce(function (prev, curr) {
            prev.connect(curr);
            return curr;
        });

        return filters;
    }
    function createFilter(frequency) {
        var filter = audioCtx.createBiquadFilter();

        filter.type = 'peaking'; // тип фильтра
        filter.frequency.value = frequency; // частота
        filter.Q.value = 1; // Q-factor
        filter.gain.value = 0;

        return filter;
    }
    $(function () {
        dragAndDropInit();
        initVisualizer();
        openFile();
    });
}());