'use strict';
define(require => {
    const module = require('components/ucsdBehaviorCleanup/module');
    
    module.factory('writeData', ['getData', '$psq', (getData, $psq) => {
        function writeToTable(path, method, args, parameters = '', orderby = '') {
            let params = orderby !== '' ? `?pagesize=0&order=${orderby}` : '?pagesize=0';
            if (parameters && Object.keys(parameters).length > 0) {
                const urlParams = new URLSearchParams(parameters);
                params += '&' + urlParams.toString();
            }

            const requestData = {
                "method": method,
                "url": path + params,
                "headers": {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                }
            }

            if (args && Object.keys(args).length > 0) {
                requestData["data"] = JSON.stringify(args);
            }
            return getData.getAPIData(requestData);
        }

        function payLoad(args, address, id = null) {
            const tablename = address.match(/\/table\/([^/]+)/)[1],
                path = `${address}${id ? `/${id}` : ''}`,
                method = id ? 'PUT' : 'POST',
                payload = {
                    'tables': {
                        [tablename]: args
                    }
                };

            return writeToTable(path, method, payload);
        }

        return {
            writeToTable: function(args, path, id = null) {
                return payLoad(args, path, id);
            },
            writeToLog: function(args, dcid) {
                console.log(args);
                return new Promise((resolve, reject) => {
                    $psq('log').update(parseInt(dcid), args, function(retID) {
                        console.log(retID);
                        if (retID !== 0) {
                            resolve(retID);
                        } else {
                            reject(new Error(`Failed to update log with dcid ${dcid}`));
                        }
                    });
                });
            }
        };
    }]);
});