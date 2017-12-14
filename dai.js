var player;

function createPlaybackSession(config) {
    //console.log(config);

    var mPlayerRoot = "node_modules";

    appendMetaViewPort();

    appendCSS([
        mPlayerRoot + '/video.js/dist/video-js.css',
        mPlayerRoot + '/videojs-ima/src/videojs.ima.css',
        mPlayerRoot + '/videojs-contrib-ads/dist/videojs.ads.css',
        'css/vjs-skin-default.css',
        'css/dai.css',
        "css/videojs-quality-levels.css",
    ]);

    appendJS([

        mPlayerRoot + "/video.js/dist/video.js",
        mPlayerRoot + '/videojs-contrib-hls/dist/videojs-contrib-hls.min.js',

        "videojs-contrib-quality-levels.min.js",

        "//imasdk.googleapis.com/js/sdkloader/ima3.js",
        "//imasdk.googleapis.com/js/sdkloader/ima3_dai.js",

        mPlayerRoot + '/videojs-contrib-ads/dist/videojs.ads.js',
        mPlayerRoot + '/videojs-ima/src/videojs.ima.js'
    ], function () {
        initialize();
    }, function (e) {
        console.log("Error al cargar Js", e.target.src);
        initialize({
            "adBlock": true
        })
    });

    function initialize(options) {

        renderHTML();

        setOptionsVideoJs();

        player = videojs('content_video', {}, function () {
            playerReady(options)
        });

    }


}

function renderHTML() {
    var tagVideo = document.createElement("video");

    tagVideo.id = "content_video";
    tagVideo.classList.add("video-js", "vjs-skin-default");
    tagVideo.setAttribute("controls", "true");
    tagVideo.setAttribute("playsinline", "true");
    tagVideo.setAttribute("preload", "auto");
    tagVideo.setAttribute("width", "100%");
    tagVideo.setAttribute("height", "100%");

    document.getElementById('player-container').appendChild(tagVideo);
}

function setOptionsVideoJs() {

    // Para activar las calidades para navegadores que no soportan
    videojs.options.hls.overrideNative = true;
    videojs.options.html5.nativeVideoTracks = false;
    videojs.options.html5.nativeAudioTracks = false;

    /*
    videojs.options.controlBar = {
        fullscreenToggle: false
    };
    */
    if (getURLParams().autoplay === "true") {
        videojs.options.autoplay = true;
    }

    if (getURLParams().autohide === "false") {

        videojs.options.inactivityTimeout = 0;
    }

    if (getURLParams().playbutton === "false") {
        videojs.options.bigPlayButton = false;
    }
}

function getURLParams() {

    try {
        var urlParams = document.URL.split("?")[1].split("&");

        var json = {};
        for (var i = 0; i < urlParams.length; i++) {
            var elem = urlParams[i].split("=");
            var prop = elem[0];
            var opt = elem[1];
            json[prop] = opt;

        }
        return json;
    } catch (e) {
        return {};
    }

}

function insertInfoAdBlock() {

    var adBlockInfo = document.createElement("div");
    var adBlockInfo_text = document.createElement("span");
    var playerElem = document.querySelector("#content_video");

    var styleAdBlock = document.createElement("style");

    adBlockInfo.id = "videojs-adBlock";

    // Aplico estilos al contenedor de informacion
    styleAdBlock.innerText = "#videojs-adBlock{position:absolute;width:100%;height: 100%;background:#000000d4;}";
    styleAdBlock.innerText += "#videojs-adBlock {-webkit-touch-callout: none;-webkit-user-select: none;-khtml-user-select: none;-moz-user-select: none;-ms-user-select: none;user-select: none;}";
    styleAdBlock.innerText += "#videojs-adBlock span{padding:20px;background:black;top: 50%;font-size: 30px;display: block;position: relative;text-align: center;transform: translateY(-50%);}";

    // Texto a mostrar cuando detecta el adBLock
    adBlockInfo_text.innerHTML = "Adblock detected, please disable and restart the browser.";

    // Cancelo eventos de click
    adBlockInfo.onclick = function (e) {
        e.stopPropagation();
    };

    adBlockInfo.appendChild(adBlockInfo_text);
    playerElem.appendChild(styleAdBlock);
    playerElem.appendChild(adBlockInfo);
}

function playerReady(options) {

    if (options && options.adBlock) {

        // con ima Dai hay un problema , ya que utiliza servicios de google que estan blockeados.
        player.src({
            src: 'https://prepublish.f.qaotic.net/epa/ngrp:americatvlive-100056_all/Playlist.m3u8?tst2',
            //src: 'http://lsdlrhls-lh.akamaihd.net/i/laredHLS_1@59923/master.m3u8', // Radio
            type: 'application/x-mpegURL',
            useCueTags: true
        });

        playPlayer();

    } else {
        initIma();

        initImaDai();
    }
    // Create button and quality levels if is not mobile
    if (!isMobile()) {
        var qualityLevels = new QualityLevels();
        qualityLevels.init();
    }

    if (isMobile()) setEventMobile();

    // Create button socialMedia
    createSocialElement([
        {
            label: "facebook",
            class: "vjs-icon-facebook",
            handleClick: function () {
                console.log('click facebook');
                //window.open('http://www.facebook.com/sharer.php?u=http://www.guiarte.com/');
            }
        },
        {
            label: "twitter",
            class: "vjs-icon-twitter",
            handleClick: function () {
                console.log('click twitter');
                //window.open('http://www.facebook.com/sharer.php?u=http://www.guiarte.com/');
            }
        }
    ]);


}

function playPlayer() {
    var playPromise = player.play();

    if (playPromise !== undefined) {
        playPromise.then(_ => {
            // Automatic playback started!
            // Show playing UI.
        }).catch(error => {
            // Auto-play was prevented
            // Show paused UI.
        });
    }

}

function initIma() {

    var options = {
        id: 'content_video',
        autoPlayAdBreaks: false,
        disableCustomPlaybackForIOS10Plus: true,
        //adTagUrl: 'https://pubads.g.doubleclick.net/gampad/ads?sz=640x480&iu=/124319096/external/single_ad_samples&ciu_szs=300x250&impl=s&gdfp_req=1&env=vp&output=vast&unviewed_position_start=1&cust_params=deployment%3Ddevsite%26sample_ct%3Dskippablelinear&correlator='
        adTagUrl: 'https://pubads.g.doubleclick.net/gampad/ads?sz=640x480&iu=/40327789/www.americatv.com.ar/Home/Home_preroll_Vast&impl=s&gdfp_req=1&env=vp&output=vast&unviewed_position_start=1&url=[referrer_url]&description_url=[description_url]&correlator=[timestamp]'
    };

    player.ima(options);
    player.ima.initializeAdDisplayContainer();
    player.ima.requestAds();

    player.on("adsready", function (e) {

        //player.play();
        player.ima.playAdBreak();

        player.ima.addEventListener(google.ima.AdEvent.Type.LOADED, function (event) {
            // En chrome no me ponia volumen
            player.ima.adsManager.setVolume(1);
        });

        player.ima.addEventListener(google.ima.AdEvent.Type.STARTED, function (event) {
            // Chequea si el contenido del tag es un audio (a pedido de niko para americatv)
            //console.log(player.ima);

        });

        player.ima.addEventListener(google.ima.AdEvent.Type.ALL_ADS_COMPLETED, function (event) {
            //console.log(google.ima.AdEvent.Type.ALL_ADS_COMPLETED);
            // Inicia video al terminar ads
            //player.play();
            playPlayer();

        });

        //trackEventIma();

    });

    player.one("adserror", function (e) {

        var adError = e.data.AdError;

        console.log("Error", adError);

        if (adError.getErrorCode() === google.ima.AdError.ErrorCode.UNKNOWN_AD_RESPONSE) {

            playPlayer();

            // No se porque oculta el player cuando hay errores en movil
            if (isMobile()) {
                var p = document.querySelector('#content_video');
                p.style.display = "block"
            }

        } else if (adError.getErrorCode() === 901) {
            playPlayer();

        } else if (adError.getErrorCode() === google.ima.AdError.VAST_MEDIA_LOAD_TIMEOUT) {
            playPlayer();

        } else {
            playPlayer();
        }

        console.log("adsError:",
            "CODE: " + adError.getErrorCode(),
            "MESSAGE: " + adError.getMessage(),
            adError.getVastErrorCode(),
            adError.getType()
        );

    });

    function trackEventIma() {

        for (let event in google.ima.AdEvent.Type) {
            //console.log(event,google.ima.AdEvent.Type[event]);
            player.ima.addEventListener(google.ima.AdEvent.Type[event], function (e) {
                console.log('%c' + google.ima.AdEvent.Type[event], 'color: green');
                // Inicia video al terminar ads
            });
        }
    }

}

function initImaDai() {

    var imaDai = new ImaDai();

    imaDai.setAssetKey('sN_IYUG8STe1ZzhIIE_ksA');
    imaDai.initStreamManager();
    imaDai.requestLiveStream();
    imaDai.addContentAdClick();
}

function isMobile() {
    var testExp = new RegExp('/Mobile|iP(hone|od|ad)|Android|BlackBerry|IEMobile|Kindle|NetFront|Silk-Accelerated|(hpw|web)OS|Fennec|Minimo|Opera M(obi|ini)|Blazer|Dolfin|Dolphin|Skyfire|Zune/');
    return testExp.test(navigator.userAgent) ? true : false;

}

function setEventMobile() {
    console.log("is mobile");
    player.bigPlayButton.off('touchend');
    player.controlBar.fullscreenToggle.on('touchend', _stopPropagation);
    player.controlBar.volumePanel.on('touchend', _stopPropagation);
    player.controlBar.playToggle.on('touchend', _stopPropagation);

    player.controlBar.volumePanel.show();
    player.controlBar.volumePanel.muteToggle.show();
    player.controlBar.volumePanel.volumeControl.show();

    // Remove controls from the player on iPad to stop native controls from stealing
    // our click
    var contentPlayer = document.getElementById('content_video' + '_html5_api');
    if (contentPlayer.hasAttribute('controls')) contentPlayer.removeAttribute('controls');

    player.one('touchend', function (e) {
        console.log("first touch");

        player.ima.initializeAdDisplayContainer();
        player.ima.requestAds();
        player.ima.playAdBreak();

        //playPlayer();

        _preventDefault(e);

    });


    player.on('touchend', function (e) {

        if (player.paused()) {
            playPlayer();
        } else {
            player.pause();
        }

        _preventDefault(e);

    });


    function _stopPropagation(e) {
        e.stopPropagation();
    }

    function _preventDefault(e) {
        e.preventDefault();
    }
}

function appendJS(source, callback, errorhandler) {
    var c = 0;
    if (Array.isArray(source)) {

        _appendJS(source[c], next, _errorhandler);

        function next() {
            c++;

            if (c === source.length) {
                if (callback) callback();
            } else {
                _appendJS(source[c], next, _errorhandler);
            }

        }

        function _errorhandler(e) {
            if (errorhandler) errorhandler(e);
        }

    } else {
        _appendJS(source, callback, errorhandler)
    }
}

function appendCSS(source) {
    if (Array.isArray(source)) {
        for (var i in source) {
            var s = source[i];
            _appendCSS(s);
        }
    }
}

function _appendJS(source, callback, errorhandler) {
    var scpt = document.createElement("script");
    scpt.src = source;
    document.body.appendChild(scpt);
    scpt.onload = function () {
        if (callback) callback()
    };
    scpt.onerror = function (e) {
        if (errorhandler) errorhandler(e)
    }
}

function _appendCSS(source, callback) {
    var scpt = document.createElement("link");
    scpt.rel = "stylesheet";
    scpt.href = source;
    document.head.appendChild(scpt);
    scpt.onload = function () {
        if (callback) callback()
    };
}

function appendMetaViewPort() {
    var meta = document.createElement("meta");
    meta.name = "viewport";
    meta.content = "width=device-width, initial-scale=1.0";
    document.head.appendChild(meta);
}

function isTagAudio() {
    return player.ima.currentAd.getContentType().indexOf('audio') > -1;
}


function ImaDai() {

    var _this = this;

    this.ASSET_KEY = null;
    this.apiKey = null;
    this.content = null;
    this.streamManager = null;

    function setAssetKey(assetKey) {
        _this.ASSET_KEY = assetKey;
    }

    function initStreamManager() {

        _this.content = document.querySelector('video');

        _this.streamManager = new google.ima.dai.api.StreamManager(_this.content);

        for (let event in google.ima.dai.api.StreamEvent.Type) {

            _this.streamManager.addEventListener(google.ima.dai.api.StreamEvent.Type[event],
                _this.onStreamEvent,
                false
            );
        }


        // Add metadata listener. Only used in LIVE streams.
        player.textTracks().on('addtrack', function (e) {
            // find out if the new track is metadata
            var track = e.track;

            if (track.kind === 'metadata') {
                // a cuechange event fires when the player crosses over an ID3 tag
                track.on('cuechange', function () {
                    let elemTrack = track.activeCues[0];

                    if (typeof elemTrack !== "undefined" && typeof elemTrack.value.data !== "undefined") {

                        var metadata = {};

                        metadata[elemTrack.value.key] = elemTrack.value.data;
                        metadata["duration"] = Infinity;
                        //console.log(elemTrack,elemTrack.value,metadata);
                        _this.streamManager.onTimedMetadata(metadata);
                    }

                });
            }
        });
    }

    function requestLiveStream() {
        var streamRequest = new google.ima.dai.api.LiveStreamRequest();

        streamRequest.assetKey = _this.ASSET_KEY;
        streamRequest.apiKey = _this.apiKey || "";
        streamRequest.attemptPreroll = true;

        _this.streamManager.requestStream(streamRequest);
    }

    function onStreamEvent(e) {

        var adClick = document.querySelector('.adClick');
        switch (e.type) {

            case google.ima.dai.api.StreamEvent.Type.CUEPOINTS_CHANGED:
                var ad = e.getAd();
                //console.log(e.getStreamData(), ad);
                break;

            case google.ima.dai.api.StreamEvent.Type.STARTED:
                //logText("Ad Started");
                var ad = e.getAd();
                //console.log(e.getStreamData(), ad);

                /*
                console.log("ad:", ad);
                console.log("ad Id:", ad.getAdId());
                console.log("getAdPodInfo:", ad.getAdPodInfo());
                console.log("getAdSystem:", ad.getAdSystem());
                console.log("getAdvertiserName:", ad.getAdvertiserName());
                console.log("getApiFramework:", ad.getApiFramework());
                console.log("getCompanionAds:", ad.getCompanionAds());
                console.log("getCreativeAdId:", ad.getCreativeAdId());
                console.log("getDealId:", ad.getDealId());
                console.log("getDescription:", ad.getDescription());
                console.log("getCreativeId:", ad.getCreativeId());
                console.log("getDuration:", ad.getDuration());
                console.log("getTitle:", ad.getTitle());
                console.log("getVastMediaHeight:", ad.getVastMediaHeight());
                console.log("getVastMediaWidth:", ad.getVastMediaWidth());
                console.log("getWrapperAdIds:", ad.getWrapperAdIds());
                console.log("getWrapperAdSystems:", ad.getWrapperAdSystems());
                console.log("getWrapperCreativeIds:", ad.getWrapperCreativeIds());


                console.log("URL:", ad.g.g.u);
                */
                adClick.onclick = function () {
                    window.open(ad.g.g.u);
                };

                break;
            case google.ima.dai.api.StreamEvent.Type.LOADED:
                _this.loadStream(e.getStreamData());


                break;
            case google.ima.dai.api.StreamEvent.Type.ERROR:
                console.log("Error loading stream, playing backup stream.");

                break;
            case google.ima.dai.api.StreamEvent.Type.AD_BREAK_STARTED:
                //logText("Ad Break Started");
                adClick.style.display = "block";

                break;
            case google.ima.dai.api.StreamEvent.Type.AD_BREAK_ENDED:
                //logText("Ad Break Ended");

                adClick.style.display = "none";

                break;
            default:
                break;
        }
    }

    function loadStream(data) {
        var url = data["url"];

        player.src({
            src: url,
            type: 'application/x-mpegURL',
            useCueTags: true
        });
    }

    function addContentAdClick() {
        // Se crea div para trackear evento click en publicidad ima dai
        var player = document.getElementById('content_video');

        var divAdClick = document.createElement('div');
        divAdClick.classList.add('adClick');
        divAdClick.onclick = function () {
            console.log("click")
        };

        divAdClick.ontouchend = function () {
            console.log("click")
        };

        player.parentNode.insertBefore(divAdClick, player.nextSibling);

    }

    function trackEventImaDai() {

        for (let event in google.ima.dai.api.StreamEvent.Type) {
            //console.log(event,google.ima.AdEvent.Type[event]);
            _this.streamManager.addEventListener(google.ima.dai.api.StreamEvent.Type[event], function (e) {
                console.log('%c' + google.ima.dai.api.StreamEvent.Type[event], 'color: blue');
                // Inicia video al terminar ads
            });
        }
    }

    ImaDai.prototype.initStreamManager = initStreamManager;
    ImaDai.prototype.requestLiveStream = requestLiveStream;
    ImaDai.prototype.onStreamEvent = onStreamEvent;
    ImaDai.prototype.loadStream = loadStream;
    ImaDai.prototype.addContentAdClick = addContentAdClick;
    ImaDai.prototype.setAssetKey = setAssetKey;
    ImaDai.prototype.trackEventImaDai = trackEventImaDai;

}

function QualityLevels() {

    var _this = this;
    var qualityLevels = null;

    function init() {

        _this.qualityLevels = player.qualityLevels();

        var container = document.createElement('div');
        container.classList.add("quality-levels");

        var boton = document.createElement('button');
        boton.classList.add("vjs-icon-cog");

        var menu = document.createElement('ul');
        _this.createQualityButtonAuto(menu);
        menu.classList.add("menu-quality");

        if (isMobile()) {
            boton.addEventListener('touchend', function () {
                menu.classList.toggle("show");
            });
        }

        _this.qualityLevels.on('addqualitylevel', function (event) {
            _this.createQualityButton(event.qualityLevel, menu);
        });
        _this.qualityLevels.on('change', function (event) {
        });

        container.appendChild(boton);
        container.appendChild(menu);

        document.querySelector('.vjs-control-bar').insertBefore(container, document.querySelector('.vjs-fullscreen-control'));


    }

    function createQualityButton(qualityLevel, parent) {
        var button = document.createElement('li');
        button.innerHTML = _levelLabel(qualityLevel);
        button.id = 'quality-level-' + qualityLevel.id;
        button.onclick = function () {

            var buttonAuto = document.querySelector('#quality-level-auto');
            buttonAuto.classList.remove('selected');

            for (var i = 0; i < _this.qualityLevels.length; i++) {
                var level = _this.qualityLevels[i];
                var buttonQuality = document.getElementById('quality-level-' + level.id);
                buttonQuality.classList.remove('selected');
                level.enabled = false;
            }

            this.classList.add('selected');
            qualityLevel.enabled = true;

        };

        insertarHijo(parent, button, parent.children.length - 1)

        //parent.appendChild(button);

        function insertarHijo(padre, hijo, index) {

            if (padre.children[index].previousSibling === null) {
                padre.insertBefore(hijo, padre.children[index]);
            } else if (parseInt(padre.children[index].previousSibling.innerHTML) < parseInt(hijo.innerHTML)) {
                insertarHijo(padre, hijo, index - 1);
            } else {
                padre.insertBefore(hijo, padre.children[index]);
            }
        }

        function _levelLabel(level) {
            if (level.height) return level.height + "p";
            else if (level.width) return Math.round(level.width * 9 / 16) + "p";
            else if (level.bitrate) return (level.bitrate / 1000) + "kbps";
            else return 0;
        }
    }

    function createQualityButtonAuto(parent) {
        var button = document.createElement('li');
        button.classList.add('selected');
        button.innerHTML = "Auto";
        button.id = "quality-level-auto";
        button.onclick = function () {
            for (var i = 0; i < _this.qualityLevels.length; i++) {
                var level = _this.qualityLevels[i];
                var buttonQuality = document.getElementById('quality-level-' + level.id);
                buttonQuality.classList.remove('selected');
                level.enabled = true;
            }

            button.classList.add('selected');
        };
        //var first = parent.firstChild;
        //parent.insertBefore(button, first);
        parent.appendChild(button);
    }

    QualityLevels.prototype.init = init;
    QualityLevels.prototype.createQualityButton = createQualityButton;
    QualityLevels.prototype.createQualityButtonAuto = createQualityButtonAuto;

}

function createSocialElement(links) {

    //Creo componente botton
    let Component = videojs.getComponent('Component');
    let menuLinks = new Component(player);
    let CompButton = new Component(player);

    let button = CompButton.createEl('div', {
        className: "vjs-button-social"
    });
    button.addEventListener("click", function (e) {
        let el = document.getElementsByClassName("vjs-menu-social")[0];

        this.classList.toggle("open");
        el.classList.toggle("show");

        e.stopPropagation();
    });

    button.addEventListener("touchend", function (e) {
        e.stopPropagation();
    });

    let menu = menuLinks.createEl('div', {
        className: "vjs-menu-social"
    });

    menu.addEventListener("touchend", function (e) {
        e.stopPropagation();
    });

    for (let elem of links) {

        let item = new Component(player).createEl('span', {
            className: elem.class
        });

        item.addEventListener("click", elem.handleClick);

        menu.appendChild(item);
    }

    menuLinks.el_ = menu;

    CompButton.el_ = button;

    player.addChild(menuLinks);
    player.addChild(CompButton);

    return true

}