// ==UserScript==
// @name        Krunker Funker
// @namespace    -
// @version      1.0
// @description  Aimbot, Unlimited Ammo, ESP, Wall Hack, Unlimited Ammo...
// @author       mrPain / Sam-DevZ
// @match        *://krunker.io/*
// @include      /^(https?:\/\/)?(www\.)?(.+)krunker\.io(|\/|\/\?(server|party)=.+)$/
// @grant        GM_xmlhttpRequest
// @require https://greasyfork.org/scripts/368273-msgpack/code/msgpack.js?version=598723
// @require http://code.jquery.com/jquery-3.3.1.min.js
// @require https://code.jquery.com/ui/1.12.0/jquery-ui.min.js
// @require https://cdnjs.cloudflare.com/ajax/libs/jquery-confirm/3.3.0/jquery-confirm.min.js
// @run-at       document-start
// ==/UserScript==

if (window.location.href.includes("krunker"))
{
/* 
INTERNALS RECEIVING
    0 =
    1 = users, [userid, x, y, z, angle_x, angle_y, ?, ?, ?], len=9
    6 = kill data, [ ["Kill Type", Points, ...], ? (type=some_binary), ?(type=some_binary)], len=2
    7 = leaderboard, [?, user, position, score, ?(always=0), ?], len=6

INTERNALS SENDING
    "etr" = [[zero-indexed position of wep on menu,0,[-1,-1],-1,-1,2,0]]]
*/
    var krSocket;
    var msgpack5 = msgpack;
    var START_ATTACK = msgpack5.encode(["i", [[1142, 16, "f", -1, 1, 0, 0, 0, 0, 0, 16, "f", -1, "f"]]]);
    var END_ATTACK = [146, 161, 105, 145, 158, 205, 5, 53, 18, 161, 102, 255, 161, 102, 15, 161, 102, 255, 0, 0, 0, 0, 0, 0];

    var current = 0;
    var current2 = 0;
    var current10 = 0;
    var pending;

    console.log(window.WebSocket)
    window.WebSocket.prototype.oldSend = WebSocket.prototype.send;
    window.WebSocket.prototype.send = function (m)
    {
        while (!krSocket) { addListener(this); }
   
        if (Math.random() > 2)
        {
            let realAttack = msgpack5.decode(START_ATTACK);
            realAttack[1][0][0] = current;
            realAttack[1][0][1] = current2;
            realAttack[1][0][10] = current10;
            console.error(`Sending ${JSON.stringify(realAttack)}`);
            this.oldSend(msgpack5.encode(realAttack));
            pending = false;
        }
        else
        {
            this.oldSend(m);
        }
    }

    var dist3 = (p1, p2) => {
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dz = p1.z - p2.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz)
    }

    window.stop();
    document.innerHTML = ``;

    GM_xmlhttpRequest({
        method: "GET",
        url: `https://sciaticapain.github.io/scripts/base.js`,
        onload: jsresp => {
            let code = jsresp.responseText
            GM_xmlhttpRequest({
                method: "GET",
                url: document.location.origin,
                onload: inRes => {
                    let dbody = inRes.responseText;
                    console.log(code);
                    newBody = dbody.replace(/<script src="js\/game\.js\?build=.+"><\/script>/g, `<script type="text/plain" src="js/game.js?build=fL02f"></script>`);
                    newBody += `<script type="text/javascript">${code.toString()}</script>`;
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
        msg = msgpack5.decode(Array.from( msgRaw ));
        let playerData = msg[1][2];
        let playerObj = unsafeWindow.players.filter(x=>x.name == playerData.player_name)[0];
        playerObj.kdval = Math.round(playerData.player_kills / playerData.player_deaths*100)/100;
        if (!playerObj.kdval) playerObj.kdval = "N/A"
    }

    function handleMessage(m) { }
    var past = new Date().getTime();
    unsafeWindow.mdlsettingsmain = {bhop: false, autoaim: 1, info: true};
    unsafeWindow.mdlsettings = {screenaim: false};

    unsafeWindow.mnxrecoil = (me, inputs) => {
        for (let player of unsafeWindow.players)
        {
            if (unsafeWindow.mdlsettingsmain.info)
            {
                if (!player.kdval)
                {
                    //console.log("Setting kdval!");
                    let data = msgpack5.encode(["r",["profile",player.name,null,null]]);
                    data = Array.from(data);
                    data.unshift(0, 7);
                    data = new Uint8Array(data);
                    socialWS.send(data);
                }
            }
            else
            {
                player.kdval = "";
            }
        }

        if (me.weapon.ammo && me.ammos[me.weaponIndex] === 0)
        {
            //console.log(inputs);
            if (inputs && /* inval */ inputs[9] === 0)
            {
                inputs[9] = 1; //Simulate click
            }
        }

        for (let playerInfo of playerInfos.children)
        {
            if (!unsafeWindow.mdlsettingsmain.info) continue;
            let pname = playerInfo.querySelectorAll(".pInfoH")[0];
            if (pname)
            {
                let pid = parseInt(playerInfo.id.replace("pInfo", ""));
                let playerObj = unsafeWindow.players.filter(x=>x.sid == pid)[0];
                pname.innerHTML = `${playerObj.name} (${Math.round(dist3(playerObj, me)) / 10} mm)<h4 style="color: white; text-align: center; margin-top: 20px; margin-bottom: 0px;">[${playerObj.weapon.name}]</h4>`;
            }
        }

        //window.idleTimer = 0;
        //let arr = new Uint8Array(m.data);
        //let full = msgpack5.decode(arr);
        //console.log(full[0]);

        if (unsafeWindow.mdlsettingsmain.bhop)
        {
            unsafeWindow.control.keys[32] = unsafeWindow.control.keys[32] ? !unsafeWindow.control.keys[32] : 1
        }

        let nplayers = unsafeWindow.players.filter(x=>x.inView).filter(x=>!x.isYou).filter(x=> (!x.team || (x.team !== me.team))).filter(x=>x.active).filter(x=>unsafeWindow.mdlsettings.screenaim ? unsafeWindow.camhook.containsPoint(x) : true ).sort( (a,b) => dist3(me, a) - dist3(me, b) );
        let closest = nplayers[0];

        if (closest)
        {
            //console.log(closest);
            //console.log(me.aimVal);v
            if (!unsafeWindow.mdlsettingsmain.autoaim % 3) return;
            //console.error("ZOOMING IN ON TARGET");
            // console.log('aimval' + me.aimVal);

            switch (unsafeWindow.mdlsettingsmain.autoaim % 3)
            {
                case 1: unsafeWindow.control.camLookAt(closest.x, closest.y + 11 - 1.5 - 2.5 * closest.crouchVal - me.recoilAnimY * 0.3 * 25, closest.z);
                    if (unsafeWindow.control.mouseDownR != 1) unsafeWindow.control.mouseDownR = 1;
                    else if (me.aimVal < 0.2)
                    {
                        //console.log(unsafeWindow.control.mouseDownL);
                        if (unsafeWindow.control.mouseDownL === 0)
                        {
                            unsafeWindow.control.mouseDownL = 1;
                            //console.log('shoooting');
                        }
                        else
                        {
                            unsafeWindow.control.mouseDownL = 0;
                        }
                    }
                    break;
                case 2: unsafeWindow.control.camLookAt(closest.x, closest.y + 11 - 1.5 - 2.5 * closest.crouchVal - me.recoilAnimY * 0.3 * 25, closest.z);
                    if (unsafeWindow.control.mouseDownR != 1) unsafeWindow.control.mouseDownR = 1;
                    break;
                default:
                    break;
            }
        }
        else
        {
            unsafeWindow.control.camLookAt(null);
            unsafeWindow.control.aimTarget = null;
            unsafeWindow.control.target = null;
            if (unsafeWindow.mdlsettingsmain.autoaim % 3 == 1)
            {
                unsafeWindow.control.mouseDownL = 0;
                if (unsafeWindow.control.mouseDownR != 0) unsafeWindow.control.mouseDownR = 0;
            } 
        }
    }

    function addListener(socket)
    {
        unsafeWindow.socket = socket;
        krSocket = socket;
        $('#aHolder').css({opacity: 0, cursor: "default", marginTop: 5000, position: "absolute"});
        unsafeWindow.Ze("ScriptSource", `Welcome to Krunker! Press <span style="color: green;">'t'</span> to toggle <span style="color: green;">autoaim</span>, <span style="color: purple;">'b'</span> to toggle <span style="color: purple;">bhop</span>, and <span style="color: yellow;">'i'</span> to toggle extra <span style="color: yellow;">player info</span>!`);
        krSocket.addEventListener("message", (m) => {
            handleMessage(m);
        });
    }

    setTimeout( () => {
        pending = true;
    }, 5000);

}
