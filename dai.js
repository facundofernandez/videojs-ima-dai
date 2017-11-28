// Copyright 2013 Google Inc. All Rights Reserved.
// You may study, modify, and use this example for any purpose.
// Note that this example is provided "as is", WITHOUT WARRANTY
// of any kind either expressed or implied.

var player;

// This stream will be played if ad-enabled playback fails.
var BACKUP_STREAM =
    "http://storage.googleapis.com/testtopbox-public/video_content/bbb/" +
    "master.m3u8";

// Live stream asset key.
var TEST_ASSET_KEY = "sN_IYUG8STe1ZzhIIE_ksA";

// StreamManager which will be used to request ad-enabled streams.
var streamManager;
var content;
/**
 * Initializes the video player.
 */

function initPlayer() {

    player = videojs('my_video_1');

    player.on("ready", playerReady);

    let adClick = document.querySelector('.adClick');
    adClick.addEventListener('click',function (e) {
        console.log("click")
    })

}


function playerReady(){

    console.log("videojs Player");

    initIma();

    initStreamManager();

    requestLiveStream(TEST_ASSET_KEY, null);

    // Create button and quality levels if is not mobile
    if (!isMobile()) setQualityLevels();

    if (isMobile()) setEventMobile();

    // Create button socialMedia
    let socialMenu = createSocialElement([
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


function initIma(){

    var options = {
        id: 'my_video_1',
        //adTagUrl: getTag(config)
        adTagUrl: 'https://pubads.g.doubleclick.net/gampad/ads?sz=640x480&iu=/40327789/www.americatv.com.ar/Home/Home_preroll_Vast&impl=s&gdfp_req=1&env=vp&output=vast&unviewed_position_start=1&url=[referrer_url]&description_url=[description_url]&correlator=[timestamp]'
    };

    player.ima(options);
    google.ima.settings.setVpaidMode(google.ima.ImaSdkSettings.VpaidMode.INSECURE);

    player.ima.initializeAdDisplayContainer();
    player.ima.requestAds();

    player.on("adsready", function (e) {

        player.ima.addEventListener(google.ima.AdEvent.Type.ALL_ADS_COMPLETED, function (event) {
            // Inicia video al terminar ads
            player.play();

            setTimeout(function(){
                player.muted(false);

            },500)
        });

        player.ima.addEventListener(google.ima.AdEvent.Type.CLICK, function (event) {
            // Inicia video al terminar ads
            console.log(event)

        });


    });
}


function initStreamManager() {

    content = document.querySelector('video');

    streamManager = new google.ima.dai.api.StreamManager(content);
    //console.log(google.ima.dai.api.StreamEvent.Type);
    for (let event in google.ima.dai.api.StreamEvent.Type) {
        //console.log(google.ima.dai.api.StreamEvent.Type[event]);
        streamManager.addEventListener(google.ima.dai.api.StreamEvent.Type[event],
            onStreamEvent,
            false
        );
    }


    // Add metadata listener. Only used in LIVE streams.
    player.textTracks().on('addtrack', function(e){
        // find out if the new track is metadata
        var track = e.track;

        if (track.kind === 'metadata') {
            // a cuechange event fires when the player crosses over an ID3 tag
            track.on('cuechange', function() {
                let elemTrack = track.activeCues[0];

                if( typeof elemTrack !== "undefined" ){
                    //console.log(elemTrack,track);
                    streamManager.onTimedMetadata( {
                        duration: Infinity,
                        TXXX: elemTrack.value.data,


                    });
                }

            });
        }
    });
}

function requestLiveStream(assetKey, apiKey) {
    var streamRequest = new google.ima.dai.api.LiveStreamRequest();

    streamRequest.assetKey = assetKey;
    streamRequest.apiKey = apiKey || "";
    streamRequest.attemptPreroll = true;
    //console.log(streamRequest);
    streamManager.requestStream(streamRequest);
}

function onStreamEvent(e) {
    //console.log("streamEvent",e.type);
    let adClick = document.querySelector('.adClick');
    switch (e.type) {
        case google.ima.dai.api.StreamEvent.Type.LOADED:
            loadStream(e.getStreamData());
            //console.log(e.getStreamData());
            break;
        case google.ima.dai.api.StreamEvent.Type.ERROR:
            logText("Error loading stream, playing backup stream.");

            break;
        case google.ima.dai.api.StreamEvent.Type.AD_BREAK_STARTED:
            logText("Ad Break Started");

            adClick.style.display="block";

            break;
        case google.ima.dai.api.StreamEvent.Type.AD_BREAK_ENDED:
            logText("Ad Break Ended");

            adClick.style.display="none";

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

function logText(text) {
    console.log(text);
}



function setQualityLevels() {

    player.ready(function () {

        var qualityLevels = player.qualityLevels();

        var container = document.createElement('div');
        container.classList.add("quality-levels");

        var boton = document.createElement('button');
        boton.classList.add("vjs-icon-cog");

        var menu = document.createElement('ul');
        createQualityButtonAuto(menu);
        menu.classList.add("menu-quality");

        if (isMobile()) {
            boton.addEventListener('touchend', function () {
                menu.classList.toggle("show");
            });
        }

        qualityLevels.on('addqualitylevel', function (event) {
            //console.log(event)
            createQualityButton(event.qualityLevel, menu);
        });
        qualityLevels.on('change', function (event) {
        });

        container.appendChild(boton);
        container.appendChild(menu);

        document.querySelector('.vjs-control-bar').insertBefore(container, document.querySelector('.vjs-fullscreen-control'));

    });


}

function createQualityButton(qualityLevel, parent) {
    var button = document.createElement('li');
    button.innerHTML = qualityLevel.bitrate + "p";
    button.id = 'quality-level-' + qualityLevel.id;
    button.onclick = function () {

        var buttonAuto = document.querySelector('#quality-level-auto');
        buttonAuto.classList.remove('selected');

        var qualityLevels = player.qualityLevels();
        for (var i = 0; i < qualityLevels.length; i++) {
            var level = qualityLevels[i];
            var buttonQuality = document.getElementById('quality-level-' + level.id);
            buttonQuality.classList.remove('selected');
            level.enabled = false;
        }

        this.classList.add('selected');
        qualityLevel.enabled = true;

    };
    parent.appendChild(button);
}

function createQualityButtonAuto(parent) {
    var button = document.createElement('li');
    button.classList.add('selected');
    button.innerHTML = "Auto";
    button.id = "quality-level-auto";
    button.onclick = function () {
        var qualityLevels = player.qualityLevels();
        for (var i = 0; i < qualityLevels.length; i++) {
            var level = qualityLevels[i];
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

function isMobile() {
    var testExp = new RegExp('/Mobile|iP(hone|od|ad)|Android|BlackBerry|IEMobile|Kindle|NetFront|Silk-Accelerated|(hpw|web)OS|Fennec|Minimo|Opera M(obi|ini)|Blazer|Dolfin|Dolphin|Skyfire|Zune/');
    return testExp.test(navigator.userAgent) ? true : false;

}

function setLogsError() {

    var logsError = {
        ADS_UNDEFINED: "AdsLoader error: ads is null"
    };

    global.logsError = logsError

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

function setEventMobile() {

    player.bigPlayButton.on('touchend', _stopPropagation);
    player.controlBar.fullscreenToggle.on('touchend', _stopPropagation);
    player.controlBar.volumePanel.on('touchend', _stopPropagation);
    player.controlBar.playToggle.on('touchend', _stopPropagation);

    player.controlBar.volumePanel.show();
    player.controlBar.volumePanel.muteToggle.show();
    player.controlBar.volumePanel.volumeControl.show();

    player.on('touchend', function (e) {

        if (player.paused()) {
            player.play();
        } else {
            player.pause();
        }

    });

    function _stopPropagation(e) {
        e.stopPropagation();
    }

    function _preventDefault(e) {
        e.preventDefault();
    }
}

