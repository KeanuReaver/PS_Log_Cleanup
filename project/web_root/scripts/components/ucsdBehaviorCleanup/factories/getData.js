'use strict';
define(require => {
    const module = require('components/ucsdBehaviorCleanup/module');
    const $j = require('jquery');

    module.factory('getData', ['$http', 'log_tlist', 'definition_tlist', ($http, log_tlist, definition_tlist) => {
        const cleanEmptyObj = arr => arr.filter(obj => Object.keys(obj).length !== 0);
        
        return {
            getAPIData: function(dataSource) {
                return $http(dataSource).then(function successCallback(response) {
                        return response.data;
                    },
                    function errorCallback(response) {
                        console.error('Status Code:', response.status);
                        //alert('API call failed. Check console log for further details: ' + response.data.message);
                        throw response;
                    });
            },
            getTList: function(path) {
                return $j.ajax({
                    'method': 'get',
                    'url': path,
                    'dataType': 'json',
                    success: response => {
                        return response;
                    },
                    error: error => {
                        console.error('Error pulling tlist json:', error);
                        throw error;
                    }
                });
            },
            getYearLogs: function() {
                return this.getTList(log_tlist)
                    .then(response => {
                        return cleanEmptyObj(response);
                    })
                    .catch(error => {
                        console.error('Error fetching period data:', error);
                        throw error;
                    });
            },
            getDefinitions: function() {
                return this.getTList(definition_tlist)
                    .then(response => {
                        return cleanEmptyObj(response);
                    })
                    .catch(error => {
                        console.error('Error getting definitions:', error);
                    });
            }
        };
    }]);
});