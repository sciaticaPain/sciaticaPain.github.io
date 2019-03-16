// ==UserScript==
// @name        Krunker Bitch
// @namespace    -
// @version      1.0
// @description  The Painful Modification
// @author       mrPain / Sammy «Z»#7383
// @match        *://krunker.io/*
// @include      /^(https?:\/\/)?(www\.)?(.+)krunker\.io(|\/|\/\?(server|party)=.+)$/
// @grant        GM_xmlhttpRequest
// @require https://greasyfork.org/scripts/368273-msgpack/code/msgpack.js?version=598723
// @require http://code.jquery.com/jquery-3.3.1.min.js
// @require https://code.jquery.com/ui/1.12.0/jquery-ui.min.js
// @require https://cdnjs.cloudflare.com/ajax/libs/jquery-confirm/3.3.0/jquery-confirm.min.js
// @run-at       document-start
// ==/UserScript==

var msgpack5 = msgpack;
var krSocket;
var current = 0;
var current2 = 0;
var current10 = 0;
var pending;
var START_ATTACK =  msgpack5.encode(["i",[[1142,16,"f",-1,1,0,0,0,0,0,16,"f",-1,"f"]]]);
var END_ATTACK = [146, 161, 105, 145, 158, 205, 5, 53, 18, 161, 102, 255, 161, 102, 15, 161, 102, 255, 0, 0, 0, 0, 0, 0];
console.log(window.WebSocket)
window.WebSocket.prototype.oldSend = WebSocket.prototype.send;
window.WebSocket.prototype.send = function(m)
{
    if (!krSocket) addListener(this);
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

    else this.oldSend(m);
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
            method: "GET" ,
            url: document.location.origin,
            onload: inRes => {
                let dbody = inRes.responseText;
                console.log(code);
                let newBody = dbody.replace(/<script src="js\/game\.js\?build=.+"><\/script>/g, `<script type="text/plain" src="js/game.js?build=fL02f"></script>`);
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
    let msgRaw = new Uint8Array(msg.data).slice(2);
    msg = msgpack5.decode(Array.from( msgRaw ));
    let playerData = msg[1][2];
    let playerObj = unsafeWindow.players.filter(x=>x.name == playerData.player_name)[0];
    playerObj.kdval = Math.round(playerData.player_kills / playerData.player_deaths*100)/100;
    if (!playerObj.kdval) playerObj.kdval = "N/A"
}

var past = new Date().getTime();

unsafeWindow.Ze2 = (t, e, i) => {
    for (chatList.innerHTML += i ? "<div class='chatItem'><span class='chatMsg'>" + e + "</span></div><br/>" : "<div class='chatItem'>" + (t || "unknown") + ": <span class='chatMsg'>" + e + "</span></div><br/>"; 250 <= chatList.scrollHeight;) chatList.removeChild(chatList.childNodes[0])
}

unsafeWindow.mdlsettingsmain = {bhop: false, autoaim: 1, info: true};
unsafeWindow.mdlsettings = {screenaim: false};

function handleMessage(m){}

unsafeWindow.mnxrecoil = (me, inputs) => {

    for (let player of unsafeWindow.players)
    {
        if (unsafeWindow.mdlsettingsmain.info)
        {
            if (!player.kdval)
            {
                let data = msgpack5.encode(["r",["profile",player.name,null,null]]);
                data = Array.from(data);
                data.unshift(0, 7);
                data = new Uint8Array(data);
                socialWS.send(data);
            }
        }

        else player.kdval = "";
    }

    if (me.weapon.ammo && me.ammos[me.weaponIndex] === 0)
    {
        if (inputs && /* inval */ inputs[9] === 0) inputs[9] = 1; //Simulate click
    }

    for (let playerInfo of playerInfos.children)
    {
        if (!unsafeWindow.mdlsettingsmain.info) continue;
        let pname = playerInfo.querySelectorAll(".pInfoH")[0];
        if (!pname) continue;
        let pid = parseInt(playerInfo.id.replace("pInfo", ""));
        let playerObj = unsafeWindow.players.filter(x=>x.sid == pid)[0];
        pname.innerHTML = `${playerObj.name} (${Math.round(dist3(playerObj, me))/10} mm)<h4 style="color: white; text-align: center; margin-top: 20px; margin-bottom: 0px;">[${playerObj.weapon.name}]</h4>`;
    }

    if (unsafeWindow.mdlsettingsmain.bhop) unsafeWindow.control.keys[32] = unsafeWindow.control.keys[32] ? !unsafeWindow.control.keys[32] : 1
    let nplayers = unsafeWindow.players.filter(x=>x.inView).filter(x=>!x.isYou).filter(x=> (!x.team || (x.team !== me.team))).filter(x=>x.active).filter(x=>unsafeWindow.mdlsettings.screenaim ? unsafeWindow.camhook.containsPoint(x) : true ).sort( (a,b) => dist3(me, a) - dist3(me, b) );
    let closest = nplayers[0];

    if (closest)
    {
        switch (unsafeWindow.mdlsettingsmain.autoaim%3)
        {
            case 0: return;
            case 1: unsafeWindow.control.camLookAt(closest.x, closest.y + 11 - 1.5 - 2.5 * closest.crouchVal - me.recoilAnimY * 0.3 * 25, closest.z); unsafeWindow.control.mouseDownR = 1;
                if (me.aimVal < 0.2)
                {
                    if (unsafeWindow.control.mouseDownL === 0)
                    {
                        unsafeWindow.control.mouseDownL = 1;
                    } else unsafeWindow.control.mouseDownL = 0;
                }
                break;

            case 2: unsafeWindow.control.camLookAt(closest.x, closest.y + 11 - 1.5 - 2.5 * closest.crouchVal - me.recoilAnimY * 0.3 * 25, closest.z); unsafeWindow.control.mouseDownR = 1;
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
        unsafeWindow.control.mouseDownL = 0;
        unsafeWindow.control.mouseDownR = 0;
    }
}

    function addListener(socket)
    {
        unsafeWindow.socket = socket;
        krSocket = socket;
        $('#aHolder').css({opacity: 0, cursor: "default", marginTop: 5000, position: "absolute"});
        unsafeWindow.Ze2("ScriptSource", `Welcome to Krunker! Press <span style="color: green;">'t'</span> to toggle <span style="color: green;">autoaim</span>, <span style="color: purple;">'b'</span> to toggle <span style="color: purple;">bhop</span>, and <span style="color: yellow;">'i'</span> to toggle extra <span style="color: yellow;">player info</span>!`);
        krSocket.addEventListener("message", (m) => {
            handleMessage(m);
        });
    }

    setTimeout( () => {
        pending = true;
    }, 5000);




