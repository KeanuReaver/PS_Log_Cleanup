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
                    console.log($scope.issueBuckets);
                    closeLoading();
                });
        }
        
        $scope.initCarouselDragging = function() {
            const wrapper = document.querySelector('.carousel-wrapper');
            if (!wrapper) return;
        
            let isDown = false;
            let startX;
            let scrollLeft;
        
            // mousedown
            wrapper.addEventListener('mousedown', (e) => {
                isDown = true;
                wrapper.classList.add('dragging');
                startX = e.pageX - wrapper.offsetLeft;
                scrollLeft = wrapper.scrollLeft;
            });
        
            // mouseleave & mouseup
            ['mouseleave', 'mouseup'].forEach(event => {
                wrapper.addEventListener(event, () => {
                    isDown = false;
                    wrapper.classList.remove('dragging');
                });
            });
        
            // mousemove
            wrapper.addEventListener('mousemove', (e) => {
                if (!isDown) return;
                e.preventDefault();
                const x = e.pageX - wrapper.offsetLeft;
                const walk = (x - startX) * 1.5; // adjust scroll speed
                wrapper.scrollLeft = scrollLeft - walk;
            });
            
            wrapper.addEventListener('wheel', function (event) {
                if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
                    event.preventDefault();
                    wrapper.scrollBy({
                        left: event.deltaY,
                        behavior: 'smooth'
                    });
                }
            }, { passive: false });
        };

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
            getYearLogs()
                .then(() => {
                    setTimeout(() => {
                        $scope.initCarouselDragging();
                    }, 100);
                });
        });
    }]);
});