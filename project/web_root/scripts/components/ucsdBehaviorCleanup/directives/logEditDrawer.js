'use strict';
define(require => {
    const module = require('components/ucsdBehaviorCleanup/module');
    const $j = require('jquery');

    module.directive('logEditDrawer', function() {
        return {
            restrict: 'EA',
            scope: {
                currentLog: '=',
                logDrawerOpen: '=',
                currentSchool: '='
            },
            templateUrl: '/scripts/components/ucsdBehaviorCleanup/views/logEditDrawer.html',
            controller: ['$scope', '$q', 'getData', 'baseUtil', 'writeData', 'log_ext_path', 'def_ext_path', 'state_log_path',
                    function($scope, $q, getData, baseUtil, writeData, log_ext_path, def_ext_path, state_log_path) {
                let allDefinitions = [];

                $scope.filteredDefinitions = [];
                $scope.combinedActions = [];
                $scope.behIncNumRan = false;

                // 2) compute it whenever currentLog changes
                function updateCombinedActions() {
                    const csv = $scope.currentLog.teacher_actions2 || '';
                    // split on comma, trim, drop empties
                    const staticArr = csv
                        .split(',')
                        .map(s => s.trim())
                        .filter(s => s.length);
            
                    let extras = [];
                    try {
                        const obj = JSON.parse($scope.currentLog.teacher_action_extras || '{}');
                        extras = Object.keys(obj);
                    } catch (e) {
                        extras = [];
                    }
            
                    // merge & dedupe
                    const all = staticArr.concat(extras);
                    const unique = [];
                    all.forEach(item => {
                        if (unique.indexOf(item) === -1) unique.push(item);
                    });
            
                    $scope.combinedActions = unique;
                }
                
                function clearBehIncNumClasses() {
                    $j('#iaIncGenConfirm').addClass('hidden');
        			$j('#iaIncCopyConfirm').addClass('hidden');
        			$j('#iaIncPrevAlert').addClass('hidden');
        			$j('#iaGenIncNum').removeClass('disabled');
        			$j('#iaGenIncNum').css('pointer-events', 'auto');
        			$j('#iaGenIncNum').removeAttr('style');
                }
            
                // 3) watch the two fields
                $scope.$watchGroup([
                    'currentLog.teacher_actions2',
                    'currentLog.teacher_action_extras'
                ], updateCombinedActions);
                
                $scope.motivationList = [
                    { value: 1, label: '1 - Avoid Adult' },
                    { value: 2, label: '2 - Avoid Peers' },
                    { value: 3, label: '3 - Avoid Tasks/Activities' },
                    { value: 4, label: '4 - Obtain Adult Attention' },
                    { value: 5, label: '5 - Obtain Items/Activities' },
                    { value: 6, label: '6 - Obtain Peer Attention' },
                    { value: 7, label: '7 - Unknown Motivation' },
                    { value: 8, label: '8 - Other Motivation' }
                ];
                
                (function() {
                    getData.getDefinitions()
                        .then(response => {
                            allDefinitions = response || [];
                        })
                        .catch(error => {
                            console.error(error);
                        });
                })();                   

                function subtypeToLevel(subtype) {
                    switch (subtype) {
                        case 'Minor':   return 1;
                        case 'Major':   return 2;
                        case 'Serious': return 3;
                        default:        return null;
                    }
                }           

                function recomputeFilteredDefinitions() {
                    const schoolId = String($scope.currentSchool || '').trim();
                    const subtype  = $scope.currentLog ? $scope.currentLog.subtype : null;
                    const level    = subtypeToLevel(subtype);

                    if (!Array.isArray(allDefinitions)) {
                        $scope.filteredDefinitions = [];
                        return;
                    }

                    if (level === null) {
                        $scope.filteredDefinitions = allDefinitions;

                        return;
                    }

                    const filtered = allDefinitions.filter(item => {
                        if (parseInt(item.incident_level, 10) !== level) {
                            return false;
                        }
                        const schoolsCSV = String(item.incident_schoolid || '');
                        const tokens = schoolsCSV.split(',')
                                                 .map(x => x.trim());
                        return tokens.includes(schoolId);
                    });

                    $scope.filteredDefinitions = filtered;

                    if ($scope.currentLog &&
                        $scope.currentLog.discipline_incidenttype
                    ) {
                        const sel = String($scope.currentLog.discipline_incidenttype);
                        const stillThere = filtered.some(d => String(d.incident_code) === sel);
                        if (!stillThere) {
                            $scope.currentLog.discipline_incidenttype = null;
                        }
                    }
                }

                $scope.closeDrawerNoSave = function() {
                    $scope.logDrawerOpen = false;
                    $scope.behIncNumRan = false;
                    $scope.currentLog = {};
                    clearBehIncNumClasses();
                };
                
                $scope.checkvalues = function() {
                    console.log($scope.currentLog);
                };
                
                $scope.copySubAndInf = function() {
                    if ($scope.currentLog.subtype) {
                        $scope.currentLog.major_or_minor = 
                            ($scope.currentLog.subtype === 'Minor' ? '2' : '1');

                        if ($scope.editLogEntryForm && $scope.editLogEntryForm.major_or_minor) {
                            $scope.editLogEntryForm.major_or_minor.$setDirty();
                        }
                    }

                    if ($scope.currentLog.discipline_incidenttype) {
                        $scope.currentLog.problem_behavior = 
                            baseUtil.incidentTypeAssoc[$scope.currentLog.discipline_incidenttype] || '';

                        if ($scope.editLogEntryForm && $scope.editLogEntryForm.problem_behavior) {
                            $scope.editLogEntryForm.problem_behavior.$setDirty();
                        }
                    }
                };
                
                $scope.copyMotivation = function() {
                    $scope.currentLog.motivation = 
                        (baseUtil.moArray.indexOf($scope.currentLog.log_motivation) + 1) || '0';
                
                    if ($scope.editLogEntryForm && $scope.editLogEntryForm.motivation) {
                        $scope.editLogEntryForm.motivation.$setDirty();
                    }
                };
                
                $scope.copyLocation = function() {
                    $scope.currentLog.incident_location = 
                        (baseUtil.locationMap[$scope.currentLog.location] || '0').toString();
                
                    if ($scope.editLogEntryForm && $scope.editLogEntryForm.incident_location) {
                        $scope.editLogEntryForm.incident_location.$setDirty();
                    }
                };
                
                $scope.copyActionTaken = function() {
                    $scope.currentLog.action_taken = ($scope.currentLog.consequence || '0').toString();
                
                    if ($scope.editLogEntryForm && $scope.editLogEntryForm.action_taken) {
                        $scope.editLogEntryForm.action_taken.$setDirty();
                    }
                };
                
                $scope.submitLogChanges = function() {
                    console.log('This Ran');
                    const dcid = $scope.currentLog.dcid;
                    if (!dcid) {
                        alert('Cannot submit: missing log ID.');
                        return;
                    }
                
                    const form = $scope.editLogEntryForm;

                    const logPayload = {};
                    [
                        'entry_date',
                        'entry_time',
                        'subtype',
                        'student_number',
                        'discipline_incidenttype',
                        'discipline_incidentdate',
                        'discipline_weaponrelatedflag',
                        'discipline_weapontype',
                        'discipline_moneylossvalue',
                        'consequence'
                    ].forEach(fieldName => {
                        if (form[fieldName] && form[fieldName].$dirty) {
                            let rawValue = $scope.currentLog[fieldName];
                    
                            logPayload[fieldName] = typeof rawValue === 'string'
                                ? rawValue
                                : String(rawValue);
                        }
                    });

                    const extPayload = {};
                    [
                        'staff_victim',
                        'suspensionletter'
                    ].forEach(fieldName => {
                        if (form[fieldName] && form[fieldName].$dirty) {
                            const rawValue = $scope.currentLog[fieldName];
                            extPayload[fieldName] = (typeof rawValue === 'string')
                                ? rawValue
                                : String(rawValue);
                        }
                    });

                    const defExtPayload = {};
                    [
                        'log_motivation',
                        'location',
                        'comments' 
                    ].forEach(fieldName => {
                        if (form[fieldName] && form[fieldName].$dirty) {
                            if (fieldName === 'location') {
                                const rawValue = $scope.currentLog.location;
                                defExtPayload['incident_location'] = (typeof rawValue === 'string')
                                    ? rawValue
                                    : String(rawValue);
                            } else {
                                const rawValue = $scope.currentLog[fieldName];
                                defExtPayload[fieldName] = (typeof rawValue === 'string')
                                    ? rawValue
                                    : String(rawValue);
                            }
                        }
                    });
                
                    const statePayload = {};
                    [
                        'major_or_minor',
                        'problem_behavior',
                        'incident_time',
                        'action_taken',
                        'restrained_or_seclusion',
                        'duration_assigned',
                        'date_of_removal',
                        'motivation',
                        'behavior_incident_number'
                    ].forEach(fieldName => {
                        if (form[fieldName] && form[fieldName].$dirty) {
                            const rawValue = $scope.currentLog[fieldName];
                            statePayload[fieldName] = (typeof rawValue === 'string')
                                ? rawValue
                                : String(rawValue);
                        }
                    });
                
                    const promises = [];

                    if (Object.keys(logPayload).length) {
                        promises.push(
                            writeData.writeToLog(logPayload, dcid)
                        );
                        
                    }

                    if (Object.keys(extPayload).length) {
                        extPayload.logdcid = dcid;
                
                        if ($scope.currentLog.noUCSDRecord === '1') {
                            promises.push(
                                writeData.writeToTable(extPayload, log_ext_path, null)
                            );
                        } else {
                            delete extPayload.logdcid;
                            promises.push(
                                writeData.writeToTable(extPayload, log_ext_path, dcid)
                            );
                        }
                    }

                    if (Object.keys(defExtPayload).length) {
                        defExtPayload.logdcid = dcid;
                
                        if ($scope.currentLog.noDefRecord === '1') {
                            promises.push(
                                writeData.writeToTable(defExtPayload, def_ext_path, null)
                            );
                        } else {
                            delete defExtPayload.logdcid;
                            promises.push(
                                writeData.writeToTable(defExtPayload, def_ext_path, dcid)
                            );
                        }
                    }

                    if (Object.keys(statePayload).length) {
                        statePayload.logdcid = dcid;
                
                        if ($scope.currentLog.noStateRecord === '1') {
                            promises.push(
                                writeData.writeToTable(statePayload, state_log_path, null)
                            );
                        } else {
                            delete statePayload.logdcid;
                            promises.push(
                                writeData.writeToTable(statePayload, state_log_path, dcid)
                            );
                        }
                    }

                    if (promises.length === 0) {
                        alert('No fields were changed.');
                        return;
                    }

                    $q.all(promises)
                        .then(results => {
                            console.log('All updates succeeded:', results);
                            $scope.logDrawerOpen = false;
                            $scope.behIncNumRan = false;
                            $scope.currentLog = {};
                            clearBehIncNumClasses();
                        })
                        .catch(err => {
                            console.error('One or more updates failed:', err);
                            alert('Some updates failed. Check console.');
                        });
                };
                
                $scope.setBehIncNumberDirty = function() {
                    $scope.editLogEntryForm.behavior_incident_number.$setDirty();
                };

                $scope.$watch('currentLog.subtype', function(newVal, oldVal) {
                    if (newVal !== oldVal) {
                        recomputeFilteredDefinitions();
                    }
                });
                
                $scope.$watch('currentLog.discipline_incidenttype', function(newVal, oldVal) {
                    if (!!newVal && newVal !== oldVal) {
                        $scope.currentLog.subject = $scope.filteredDefinitions.find(obj => obj.incident_code === newVal).incident_name.substring(0, 39);
                    }
                });

                $scope.$watch('currentLog', function(newVal, oldVal) {
                    if (newVal !== oldVal) {
                        recomputeFilteredDefinitions();
                    }
                }, true);
                
                $scope.$watch('logDrawerOpen', function(isOpen, wasOpen) {
                    if (!isOpen && wasOpen && $scope.editLogEntryForm) {
                        // When drawer just closed
                        $scope.editLogEntryForm.$setPristine();
                        $scope.editLogEntryForm.$setUntouched();
                    }
                
                    if (isOpen && !wasOpen) {
                        // When drawer just opened
                        $scope.editLogEntryForm.$setPristine();
                        $scope.editLogEntryForm.$setUntouched();
                
                        // Scroll to top of drawer content
                        setTimeout(() => {
                            const drawerContent = document.querySelector('.cc-drawer-content');
                            if (drawerContent) drawerContent.scrollTop = 0;
                        }, 0); // Delay until next digest/render cycle
                    }
                });
                
                (function syncInputWithModel() {
                    const input = document.getElementById('BehaviorIncNum');
                    if (!input) return;
                
                    let lastVal = input.value;
                
                    setInterval(() => {
                        const currentVal = input.value;
                        if (currentVal !== lastVal) {
                            lastVal = currentVal;
                
                            // Only apply to model if it's truly changed
                            $scope.$applyAsync(() => {
                                $scope.currentLog.behavior_incident_number = currentVal;
                                if ($scope.editLogEntryForm?.behavior_incident_number) {
                                    $scope.editLogEntryForm.behavior_incident_number.$setDirty();
                                }
                            });
                        }
                    }, 200); // Adjust interval as needed
                })();
            }]
        };
    });
});