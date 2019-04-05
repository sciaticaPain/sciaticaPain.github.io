// ==UserScript==
// @name         Krunker Bitch Local
// @namespace    -
// @version      1.0
// @description  The Painful Modification
// @author       mrPain / Sammy «Z»#7383
// @match        *://krunker.io/*
// @include      /^(https?:\/\/)?(www\.)?(.+)krunker\.io(|\/|\/\?(server|party)=.+)$/
// @grant        GM_xmlhttpRequest
// @require      msgpack.js
// @require      jquery.js
// @require      jqueryui.js
// @require      jquery-confirm.js
// @run-at       document-start
// ==/UserScript==

if (window.location.hostname === 'krunker.io') {
    var pending;
    var krSocket;
    var current = 0;
    var current2 = 0;
    var current10 = 0;
    var msgpack5 = msgpack;

    console.log(window.WebSocket);
    window.WebSocket.prototype.oldSend = WebSocket.prototype.send;
    window.WebSocket.prototype.send = function(m) {
        if (!krSocket) addListener(this);
        let msgRaw = Array.from(new Uint8Array(m)).slice(2);
        let data = msgpack5.decode(msgRaw);
        let finalData = data;
        //console.log(finalData);
        //if (finalData[0] == "hc") {
        //console.log(finalData);
        //}
        //else
        this.oldSend(m);
    }

    var dist3 = (p1, p2) => {
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dz = p1.z - p2.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz)
    }

    window.stop();
    document.innerHTML = ``;
    unsafeWindow.zip = "";
    unsafeWindow.zipExt = "";

    GM_xmlhttpRequest({
        method: "GET",
        url: 'https://sciaticapain.github.io/scripts/base.js',
        onload: jsresp => {
            let code = jsresp.responseText
            GM_xmlhttpRequest({
                method: "GET",
                url: document.location.origin,
                onload: inRes => {
                    console.log(code);
                    let dbody = inRes.responseText;
                    let newBody = dbody.replace(/<script src="js\/game\.\w+?(?=\.)\.js\?build=.+"><\/script>/g, `<script type="text/javascript" src="https://sciaticapain.github.io/scripts/base.js"></script>`);
                    newBody = newBody.replace(/libs\/zip-ext\.js\?build=.+?(?=")/g, `https://sciaticapain.github.io/scripts/zip_ext.js`);
                    newBody = newBody.replace(/libs\/zip\.js\?build=.+?(?=")/g, `https://sciaticapain.github.io/scripts/zip.js`);
                    newBody = newBody.replace("jsdelivr", "xyzsource");
                    newBody = newBody.replace("SCRIPT", "BLEEP");
                    document.open();
                    document.write(newBody);
                    document.close();
                }
            });
        }
    });

    var socialWS = new WebSocket(`wss://krunker_social.krunker.io/ws`);
    socialWS.binaryType = "arraybuffer";
    socialWS.onopen = (open) => {
        console.log("Opened!");
    }

    socialWS.onclose = (close) => {
        console.log("Closed!");
    }

    socialWS.onmessage = (msg) => {
        //console.log(msg);
        let msgRaw = new Uint8Array(msg.data).slice(2);
        //console.log(msgRaw);
        msg = msgpack5.decode(Array.from(msgRaw));
        let playerData = msg[1][2];
        let playerObj = unsafeWindow.players.list.filter(x => x.name == playerData.player_name)[0];
        playerObj.kdval = Math.round(playerData.player_kills / playerData.player_deaths * 100) / 100;
        if (!playerObj.kdval) playerObj.kdval = "N/A"
    }

    var past = new Date().getTime();

    unsafeWindow.Ze2 = unsafeWindow.Ze = (t, e, i) => {
        for (chatList.innerHTML += i ? "<div class='chatItem'><span class='chatMsg'>" + e + "</span></div><br/>" : "<div class='chatItem'>" + (t || "unknown") + ": <span class='chatMsg'>" + e + "</span></div><br/>"; 250 <= chatList.scrollHeight;) chatList.removeChild(chatList.childNodes[0])
    }

    unsafeWindow.mdlsettingsmain = {
        bhop: false,
        autoaim: 1,
        info: true
    };
    unsafeWindow.mdlsettings = {
        screenaim: false
    };

    function handleMessage(m) {}

    function sleep(milliseconds) {
        var start = new Date().getTime();
        for (var i = 0; i < 1e7; i++) {
            if ((new Date().getTime() - start) > milliseconds) {
                break;
            }
        }
    }

    unsafeWindow.mnxrecoil = (me, inputs) => {
        if (!unsafeWindow.players) return;

        me = unsafeWindow.players.list.filter(x => x.isYou)[0];

        for (let player of unsafeWindow.players.list) {
            if (unsafeWindow.mdlsettingsmain.info) {
                if (!player.kdval) {
                    //console.log("Setting kdval!");
                    let data = msgpack5.encode(["r", ["profile", player.name, null, null]]);
                    data = Array.from(data);
                    data.unshift(0, 7);
                    data = new Uint8Array(data);
                    socialWS.send(data);
                }
            } else player.kdval = "";
        }

        if (me.weapon.ammo && me.ammos[me.weaponIndex] === 0) {
            //console.log(inputs);
            if (inputs && /* inval */ inputs[9] === 0) inputs[9] = 1; //Simulate click
        }

        for (let playerInfo of playerInfos.children) {
            if (!unsafeWindow.mdlsettingsmain.info) continue;
            let pname = playerInfo.querySelectorAll(".pInfoH")[0];
            if (!pname) continue;
            let pid = parseInt(playerInfo.id.replace("pInfo", ""));
            let playerObj = unsafeWindow.players.list.filter(x => x.sid == pid)[0];
            pname.innerHTML = `${playerObj.name} (${Math.round(dist3(playerObj, me))/10} mm)<h4 style="color: white; text-align: center; margin-top: 20px; margin-bottom: 0px;">[${playerObj.weapon.name}]</h4>`;
        }

        if (unsafeWindow.mdlsettingsmain.bhop) unsafeWindow.control.keys[32] = unsafeWindow.control.keys[32] ? !unsafeWindow.control.keys[32] : 1
        let nplayers = unsafeWindow.players.list.filter(x => x.inView).filter(x => !x.isYou).filter(x => (!x.team || (x.team !== me.team))).filter(x => x.active).filter(x => unsafeWindow.mdlsettings.screenaim ? unsafeWindow.camhook.containsPoint(x) : true).sort((a, b) => dist3(me, a) - dist3(me, b));
        let closest = nplayers[0];

        if (closest) {
            if (unsafeWindow.control.mouseDownR = unsafeWindow.mdlsettingsmain.autoaim % 3 === 1) {
                if (me.aimVal === 0) {
                    unsafeWindow.control.camLookAt(closest.x, closest.y + 11 - 1.5 - 2.5 * closest.crouchVal - me.recoilAnimY * 0.3 * 25, closest.z);
                    if (unsafeWindow.control.mouseDownL === 0) unsafeWindow.control.mouseDownL = 1;
                }
            } else if (unsafeWindow.control.mouseDownR = unsafeWindow.mdlsettingsmain.autoaim % 3 === 2) {
                if (me.aimVal === 0) {
                    unsafeWindow.control.camLookAt(closest.x, closest.y + 11 - 1.5 - 2.5 * closest.crouchVal - me.recoilAnimY * 0.3 * 25, closest.z);
                }
            }
        } else {
            unsafeWindow.control.camLookAt(null);
            unsafeWindow.control.aimTarget = null;
            unsafeWindow.control.target = null;
        }
    }

    function addListener(socket) {
        unsafeWindow.socket = socket;
        krSocket = socket;

        unsafeWindow.Ze2("mrPain", `<span style="color:#FF0000">Welcome to Krunker!</span> <br>
                                    <span style="color:#FF7F00">'F1'</span><em> Aim Helper Type</em> <br>
                                    <span style="color:#FFFF00">'F2'</span><em> Bhop Toggle</em> <br>
                                    <span style="color:#00FF00">'F3'</span><em> Player Info Toggle</em> <br>`);
        krSocket.addEventListener("message", (m) => {
            handleMessage(m);
        });
    }

    setTimeout(() => {
        pending = true;
    }, 10000);
}