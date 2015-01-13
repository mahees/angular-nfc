//cordova plugin add com.chariotsolutions.nfc.plugin
(function(angular) {
    'use strict';

    var app = angular.module('angular-nfc', []);

    app.constant('angularNfcConfig', {

    });

    app.factory('nfcService', function($rootScope, $q, $window) {

        var svc = {};

        var _nfc = $window.nfc, _ndef = $window.ndef;

        svc.removeTagDiscoveredListener = function() {
            var deferred = $q.defer();
            if (_nfc) {
                _nfc.removeTagDiscoveredListener(svc._cb, function(successRes) {
                    deferred.resolve(successRes);
                }, function(reason) {
                    deferred.reject(reason);
                });
            } else {
                return $q.when({});
            }
            return deferred.promise;
        };

        svc.addTagDiscoveredListener = function() {
            var deferred = $q.defer();
            svc._cb = function(nfcEvent) {
                deferred.notify(nfcEvent.tag);
            };
            if (_nfc) {
                _nfc.addTagDiscoveredListener(svc._cb, function() {
                    console.log("Listening for NDEF Tags.");
                }, function(reason) {
                    //TODO: log
                    deferred.reject(reason);
                });

            }
            return deferred.promise;
        };

        svc.write = function(message) {
            var deferred = $q.defer();

            //var message = [_ndef.textRecord("hello, world"), _ndef.uriRecord("http://yahoo.com")];

            _nfc.write(message, function(res) {
                deferred.resolve(res);
            }, function(reason) {
                deferred.reject(reason);
            });
            return deferred.promise;
        };

        svc.getTagId = function(tag) {
            return svc.bytesToHexString(tag.id);
        };

        svc.bytesToHexString = function(input) {
            return (_nfc) ? _nfc.bytesToHexString(input) : input;
        };

        svc.bytesToString = function(input) {
            return (_nfc) ? _nfc.bytesToString(input) : input;
        };

        svc.tnfToString = function(input) {

            function tnfToString(tnf) {
                var value = tnf;

                switch (tnf) {
                case _ndef.TNF_EMPTY:
                    value = "Empty";
                    break;
                case _ndef.TNF_WELL_KNOWN:
                    value = "Well Known";
                    break;
                case _ndef.TNF_MIME_MEDIA:
                    value = "Mime Media";
                    break;
                case _ndef.TNF_ABSOLUTE_URI:
                    value = "Absolute URI";
                    break;
                case _ndef.TNF_EXTERNAL_TYPE:
                    value = "External";
                    break;
                case _ndef.TNF_UNKNOWN:
                    value = "Unknown";
                    break;
                case _ndef.TNF_UNCHANGED:
                    value = "Unchanged";
                    break;
                case _ndef.TNF_RESERVED:
                    value = "Reserved";
                    break;
                }
                return value;
            };

            return (_ndef) ? tnfToString(input) : input;
        };

        svc.decodePayload = function(input) {

            function decodePayload(record) {

                var payload, recordType = _nfc.bytesToString(record.type);

                if (recordType === "T") {
                    payload = _ndef.textHelper.decodePayload(record.payload);

                } else if (recordType === "U") {
                    payload = _ndef.uriHelper.decodePayload(record.payload);

                } else {

                    // we don't know how to translate this type, try and print it out.
                    // your app should know how to process tags it receives

                    var printableData = record.payload.map(function(i) {
                        if (i <= 0x1F) {
                            return 0x2e;
                            // unprintable, replace with "."
                        } else {
                            return i;
                        }
                    });

                    payload = _nfc.bytesToString(printableData);
                }

                return payload;
            }

            return (_nfc) ? decodePayload(input) : input.payload;
        }

        return svc;
    });

    app.filter('bytesToHexString', function(nfcService) {
        return function(input) {
            return nfcService.bytesToHexString(input);
        }
    });

    app.filter('bytesToString', function(nfcService) {
        return function(input) {
            return nfcService.bytesToString(input);
        };
    });

    app.filter('tnfToString', function(nfcService) {
        return function(input) {
            return nfcService.tnfToString(input);
        };
    });

    app.filter('decodePayload', function(nfcService) {
        return function(input) {
            return nfcService.decodePayload(input);
        };
    });

})(angular);