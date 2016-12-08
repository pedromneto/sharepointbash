module PMN.SharePoint {
    export enum Verb {
        GET = <any>"GET",
        POST = <any>"POST"
    }
    export type Options = "hello" | "world";
    class BatchElement {
        private _tipo: Verb;
        private _url: string;
        private _callBack;
        static MakeElement(url: string, tipo: Verb, callback) {
            return new BatchElement(url, tipo, callback);
        }

        private constructor(url: string, tipo: Verb, callback) {
            this._tipo = tipo;
            this._url = url;
            this._callBack = callback;
        }

        get Tipo() {
            return this._tipo;
        }
        get Url() {
            return this._url;
        }
        CallFunction(data) {
            if (typeof this._callBack === "function") {
                this._callBack.call(this, data);
            }
        }
    export class Batch {
        private UrlRequests: BatchElement[];
        constructor() {
            this.UrlRequests = [];
        }

        private NewGuid() {

            function S4() {
                return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
            }

            var guid = (S4() + S4() + "-" + S4() + "-4" + S4().substr(0, 3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();
            return guid;
        }

        private GetBatchBody(batchId: string) {
            var batchContent = [];
            for (var i = 0; i < this.UrlRequests.length; i++) {

                batchContent.push("--" + batchId);
                batchContent.push("Content-Type: application/http")
                batchContent.push("Content-Transfer-Encoding: binary");
                batchContent.push("");
                batchContent.push(this.UrlRequests[i].Tipo.toString() + " " + this.UrlRequests[i].Url + " HTTP/1.1");
                batchContent.push("Accept: application/json;odata=verbose");
                batchContent.push("");
            }
            batchContent.push("--" + batchId + "--");
            var bathBody = batchContent.join("\n");
            return bathBody;
        }

        MakeRequests() {

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
            }
            request.addEventListener("error", function (err) {
                console.log(err);
            });

        }

        AddRequest(url: string, tipo: Verb, callback) {
            this.UrlRequests.push(BatchElement.MakeElement(url, tipo, callback));
        }
        ShowRequests() {
            var numElements = this.UrlRequests.length;
            for (var i = 0; i < numElements; i++) {
                console.log(this.UrlRequests[i].Tipo.toString() + ": " + this.UrlRequests[i].Url);
            }
        }
    }
}

var b = new PMN.SharePoint.Batch();

b.AddRequest(_spPageContextInfo.webAbsoluteUrl + "/_api/web/lists?$select=title", PMN.SharePoint.Verb.GET, function (data) {
    data.d;
});
b.AddRequest(_spPageContextInfo.webAbsoluteUrl + "/_api/web/AllProperties", PMN.SharePoint.Verb.GET, function (data) {
    data.d;
});
b.MakeRequests();

