'use strict';
define(require => {
    const module = require('components/ucsdBehaviorCleanup/module');
    const $j = require('jquery');

    module.controller('BehaviorCleanupCtrl', ['$scope', '$q', '$window', 'getData', 'baseUtil', 'fixUtil', function($scope, $q, $window, getData, baseUtil, fixUtil) {
        $scope.currentSchool; // init

        $scope.logDrawerOpen = false;
        $scope.processingChanges = false;

        $scope.yearLogs = [];
        $scope.issueBuckets = {};
        $scope.selectedIssue = {};
        $scope.currentLog = {};
        
        $scope.focusedIssue = null;
        $scope.focusedIssueKey = null;
        
        $scope.dynamicOrderBy = 'entry_date';
        $scope.reverseSort = false;
        
        $scope.issuesExist = false;
        
        $scope.setOrderByField = (field) => {
            if ($scope.dynamicOrderBy == field) {
                $scope.reverseSort = !$scope.reverseSort;
                $scope.sortByWaivers = false;
            } else {
                $scope.dynamicOrderBy = field;
                $scope.reversSort = false;
                $scope.sortByWaivers = false;
            }
        };

        function getYearLogs() {
            return getData.getYearLogs()
                .then(response => {
                    $scope.yearLogs = response.map(obj => {
                        obj.entry = obj.entry_array.join();
                        return obj;
                    });
                    console.log($scope.yearLogs);
                    return baseUtil.filterIssues($scope.yearLogs);
                    
                })
                .then(buckets => {
                    $scope.issueBuckets = buckets;
                    $scope.issuesExist = Object.values($scope.issueBuckets).reduce((sum, bucket) => {
                            return sum + bucket.logs.length;
                        }, 0) !== 0;
                    if ($scope.focusedIssueKey) {
                        $scope.focusedIssue = $scope.issueBuckets[$scope.focusedIssueKey] || null;
                    }
                    
                    $scope.$apply();
                })
                .catch(error => {
                    console.error('Failed to get logs for this year at this school:', error);
                })
                .then(() => {
                    closeLoading();
                });
        }

        $scope.runFix = function(key, issueObj) {
            loadingDialog('Running Fix');
            fixUtil.runFix(key, issueObj)
                .then(() => {
                    getYearLogs();
                })
                .catch(error => {
                    if (error !== 'User aborted') {
                        console.error(`Error while fixing ${key}:`, error);
                    } else {
                        console.log('Aborted Fix!');
                    }
                    
                    closeLoading();
                });
        };        

        $scope.openLogDrawer = function(log) {
            $scope.currentLog = angular.copy(log);
            $scope.logDrawerOpen = true;
        };

        $scope.displayDate = function(rawDate) {
            return rawDate.includes('T') ? rawDate.split('T')[0] : rawDate.split(' ')[0];
        };

        $scope.setFocusedIssue = function(key, issue) {
            $scope.focusedIssueKey = key;
            $scope.focusedIssue = issue;
        };
        
        $scope.scrollCarousel = function(direction) {
            const wrapper = document.querySelector('.carousel-wrapper');
            const scrollAmount = 160; // or whatever fits one tile's width nicely
        
            if (direction === 'left') {
                wrapper.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            } else if (direction === 'right') {
                wrapper.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            }
        };
        
        $scope.$watch('logDrawerOpen', function(newVal, oldVal) {
            if (newVal !== oldVal && !newVal) {
                getYearLogs();
            }
        });

        $j(() => {
            loadingDialog('Getting Logs');
            getYearLogs();
        });
    }]);
});