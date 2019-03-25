(function() {
    function g(b) {
        function c(e, c) {
            if (a.data) e();
            else {
                var d = new XMLHttpRequest;
                d.addEventListener("load", function() {
                    a.size || (a.size = Number(d.getResponseHeader("Content-Length")));
                    a.data = new Uint8Array(d.response);
                    e()
                }, !1);
                d.addEventListener("error", c, !1);
                d.open("GET", b);
                d.responseType = "arraybuffer";
                d.send()
            }
        }
        var a = this;
        a.size = 0;
        a.init = function(e, c) {
            var d = new XMLHttpRequest;
            d.addEventListener("load", function() {
                a.size = Number(d.getResponseHeader("Content-Length"));
                e()
            }, !1);
            d.addEventListener("error",
                c, !1);
            d.open("HEAD", b);
            d.send()
        };
        a.readUint8Array = function(e, b, d, g) {
            c(function() {
                d(new Uint8Array(a.data.subarray(e, e + b)))
            }, g)
        }
    }

    function h(b) {
        function c(e, a, d, c) {
            var f = new XMLHttpRequest;
            f.open("GET", b);
            f.responseType = "arraybuffer";
            f.setRequestHeader("Range", "bytes=" + e + "-" + (e + a - 1));
            f.addEventListener("load", function() {
                d(f.response)
            }, !1);
            f.addEventListener("error", c, !1);
            f.send()
        }
        var a = this;
        a.size = 0;
        a.init = function(e, c) {
            var d = new XMLHttpRequest;
            d.addEventListener("load", function() {
                a.size = Number(d.getResponseHeader("Content-Length"));
                "bytes" == d.getResponseHeader("Accept-Ranges") ? e() : c("HTTP Range not supported.")
            }, !1);
            d.addEventListener("error", c, !1);
            d.open("HEAD", b);
            d.send()
        };
        a.readUint8Array = function(a, b, d, g) {
            c(a, b, function(a) {
                d(new Uint8Array(a))
            }, g)
        }
    }

    function k(b) {
        var c = this;
        c.size = 0;
        c.init = function(a, e) {
            c.size = b.byteLength;
            a()
        };
        c.readUint8Array = function(a, c, f, d) {
            f(new Uint8Array(b.slice(a, a + c)))
        }
    }

    function l() {
        var b;
        this.init = function(c, a) {
            b = new Uint8Array;
            c()
        };
        this.writeUint8Array = function(c, a, e) {
            e = new Uint8Array(b.length +
                c.length);
            e.set(b);
            e.set(c, b.length);
            b = e;
            a()
        };
        this.getData = function(c) {
            c(b.buffer)
        }
    }

    function m(b, c) {
        var a;
        this.init = function(c, f) {
            b.createWriter(function(b) {
                a = b;
                c()
            }, f)
        };
        this.writeUint8Array = function(b, f, d) {
            b = new Blob([r ? b : b.buffer], {
                type: c
            });
            a.onwrite = function() {
                a.onwrite = null;
                f()
            };
            a.onerror = d;
            a.write(b)
        };
        this.getData = function(a) {
            b.file(a)
        }
    }
    var n = zip.Reader,
        q = zip.Writer;
    try {
        var r = 0 === (new Blob([new DataView(new ArrayBuffer(0))])).size
    } catch (b) {}
    g.prototype = new n;
    g.prototype.constructor = g;
    h.prototype =
        new n;
    h.prototype.constructor = h;
    k.prototype = new n;
    k.prototype.constructor = k;
    l.prototype = new q;
    l.prototype.constructor = l;
    window.kiH = function(b) {
        try {
            [...document.getElementsByTagName("script")].filter(e => e.innerHTML.length === -1).length && b.send("hc")
        } catch (c) {}
    };
    m.prototype = new q;
    m.prototype.constructor = m;
    zip.FileWriter = m;
    zip.HttpReader = g;
    zip.HttpRangeReader = h;
    zip.ArrayBufferReader = k;
    zip.ArrayBufferWriter = l;
    if (zip.fs) {
        var p = zip.fs.ZipDirectoryEntry;
        p.prototype.addHttpContent = function(b, c, a) {
            c = {
                data: c,
                Reader: a ? h : g
            };
            if (this.directory) b = new zip.fs.ZipFileEntry(this.fs, b, c, this);
            else throw "Parent entry is not a directory.";
            return b
        };
        p.prototype.importHttpContent = function(b, c, a, e) {
            this.importZip(c ? new h(b) : new g(b), a, e)
        };
        zip.fs.FS.prototype.importHttpContent = function(b, c, a, e) {
            this.entries = [];
            this.root = new p(this);
            this.root.importHttpContent(b, c, a, e)
        }
    }
})();