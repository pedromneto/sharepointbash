var PMN;
(function (PMN) {
    var SharePoint;
    (function (SharePoint) {
        var Verb;
        (function (Verb) {
            Verb[Verb["GET"] = "GET"] = "GET";
            Verb[Verb["POST"] = "POST"] = "POST";
        })(Verb = SharePoint.Verb || (SharePoint.Verb = {}));
        var BatchElement = (function () {
            function BatchElement(url, tipo, callback) {
                this._tipo = tipo;
                this._url = url;
                this._callBack = callback;
            }
            BatchElement.MakeElement = function (url, tipo, callback) {
                return new BatchElement(url, tipo, callback);
            };
            Object.defineProperty(BatchElement.prototype, "Tipo", {
                get: function () {
                    return this._tipo;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(BatchElement.prototype, "Url", {
                get: function () {
                    return this._url;
                },
                enumerable: true,
                configurable: true
            });
            BatchElement.prototype.CallFunction = function (data) {
                if (typeof this._callBack === "function") {
                    this._callBack.call(this, data);
                }
            };
            return BatchElement;
        }());
        var Batch = (function () {
            function Batch() {
                this.UrlRequests = [];
            }
            Batch.prototype.NewGuid = function () {
                function S4() {
                    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
                }
                var guid = (S4() + S4() + "-" + S4() + "-4" + S4().substr(0, 3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();
                return guid;
            };
            Batch.prototype.GetBatchBody = function (batchId) {
                var batchContent = [];
                for (var i = 0; i < this.UrlRequests.length; i++) {
                    batchContent.push("--" + batchId);
                    batchContent.push("Content-Type: application/http");
                    batchContent.push("Content-Transfer-Encoding: binary");
                    batchContent.push("");
                    batchContent.push(this.UrlRequests[i].Tipo.toString() + " " + this.UrlRequests[i].Url + " HTTP/1.1");
                    batchContent.push("Accept: application/json;odata=verbose");
                    batchContent.push("");
                }
                batchContent.push("--" + batchId + "--");
                var bathBody = batchContent.join("\n");
                return bathBody;
            };
            Batch.prototype.MakeRequests = function () {
                var endPointUrl = _spPageContextInfo.webAbsoluteUrl + "/_api/$batch";
                var batchId = "batch_" + this.NewGuid();
                var self = this;
                var batchBody = this.GetBatchBody(batchId);
                var formDigest = document.getElementById("__REQUESTDIGEST").value;
                var request = new XMLHttpRequest();
                request.open(Verb.POST.toString(), endPointUrl, true);
                request.setRequestHeader("X-RequestDigest", formDigest);
                request.setRequestHeader("Content-Type", "multipart/mixed; boundary=" + batchId);
                request.setRequestHeader("Accept", "application/json;odata=verbose");
                request.send(batchBody);
                request.onreadystatechange = function () {
                    if (request.readyState == request.DONE && request.status === 200) {
                        var response = request.responseText.split("--batchresponse");
                        for (var i = 1; i < response.length; i++) {
                            var result = response[i].split("\n")[7];
                            if (result !== undefined) {
                                var r = JSON.parse(result);
                                var obj = self.UrlRequests[i - 1];
                                obj.CallFunction(r);
                            }
                        }
                    }
                };
                request.addEventListener("error", function (err) {
                    console.log(err);
                });
            };
            Batch.prototype.AddRequest = function (url, tipo, callback) {
                this.UrlRequests.push(BatchElement.MakeElement(url, tipo, callback));
            };
            Batch.prototype.ShowRequests = function () {
                var numElements = this.UrlRequests.length;
                for (var i = 0; i < numElements; i++) {
                    console.log(this.UrlRequests[i].Tipo.toString() + ": " + this.UrlRequests[i].Url);
                }
            };
            return Batch;
        }());
        SharePoint.Batch = Batch;
    })(SharePoint = PMN.SharePoint || (PMN.SharePoint = {}));
})(PMN || (PMN = {}));
var b = new PMN.SharePoint.Batch();
b.AddRequest(_spPageContextInfo.webAbsoluteUrl + "/_api/web/lists?$select=title", PMN.SharePoint.Verb.GET, function (data) {
    data.d;
});
b.AddRequest(_spPageContextInfo.webAbsoluteUrl + "/_api/web/AllProperties", PMN.SharePoint.Verb.GET, function (data) {
    data.d;
});
b.MakeRequests();
