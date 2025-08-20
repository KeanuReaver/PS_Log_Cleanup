'use strict';
define(require => {
    const module = require('components/ucsdBehaviorCleanup/module');

    module.factory('fixUtil', ['writeData', '$q', '$window', 'log_ext_path', 'state_log_path', 'baseUtil',
            function(writeData, $q, $window, log_ext_path, state_log_path, baseUtil) {

        const fixFunctions = {
            marked_sus(log) {
                return writeData.writeToTable(
                    { suspensionletter: '0' },
                    log_ext_path,
                    log.dcid
                );
            },
        
            fix_number(log) {
                return writeData.writeToLog(
                    { student_number: String(log.students_student_number || 0) },
                    log.dcid
                );
            },
        
            state_action_copy(log) {
                const payload = {
                    action_taken: String(log.consequence != null ? log.consequence : 0),
                    logdcid: String(log.dcid)
                };
        
                if (log.noStateRecord === '1') {
                    // create new row in s_ia_log_x
                    return writeData.writeToTable(
                        payload,
                        state_log_path,
                        null
                    );
                } else {
                    // update existing State row
                    // (server side will pick up logdcid from the URL, or you could also pass it in payload again)
                    return writeData.writeToTable(
                        { action_taken: String(log.consequence != null ? log.consequence : 0) },
                        state_log_path,
                        log.dcid
                    );
                }
            },
        
            state_incident_copy(log) {
                // problem_behavior = mapped from discipline_incidenttype
                const mapped = baseUtil.incidentTypeAssoc[log.discipline_incidenttype];
                const payload = {
                    major_or_minor: String(log.subtype === 'Minor' ? '2' : '1'),
                    problem_behavior: String(mapped != null ? mapped : 0),
                    logdcid: String(log.dcid)
                };
        
                if (log.noStateRecord === '1') {
                    return writeData.writeToTable(
                        payload,
                        state_log_path,
                        null
                    )
                        .then(response => {
                            console.log(response);
                        });
                } else {
                    return writeData.writeToTable(
                        { problem_behavior: String(mapped != null ? mapped : 0), major_or_minor: String(log.subtype === 'Minor' ? '2' : '1') },
                        state_log_path,
                        log.dcid
                    )
                        .then(response => {
                            console.log(response);
                        });
                }
            },
        
            state_loc_copy(log) {
                // incident_location = mapped from locationMap
                const mapped = baseUtil.locationMap[log.location];
                const payload = {
                    incident_location: String(mapped != null ? mapped : 0),
                    logdcid: String(log.dcid)
                };
                
                if (log.noStateRecord === '1') {
                    console.log('This Ran Location Fix');
                    return writeData.writeToTable(
                            payload,
                            state_log_path,
                            null
                        )
                        .then(response => {
                            console.log(response);
                        })
                        .catch(error => {
                            console.error('Failed to POST write location:', error);
                        });
                } else {
                    console.log('This Ran Location Fix');
                    return writeData.writeToTable(
                            { incident_location: String(mapped != null ? mapped : 0) },
                            state_log_path,
                            log.dcid
                        )
                        .then(response => {
                            console.log(response);
                        })
                        .catch(error => {
                            console.error('Failed to Put write location:', error);
                        });
                }
            },
        
            state_mo_copy(log) {
                // motivation = index+1 of moArray
                const idx = baseUtil.moArray.indexOf(log.log_motivation);
                const computed = idx >= 0 ? String(idx + 1) : '0';
                const payload = {
                    motivation: computed,
                    logdcid: String(log.dcid)
                };
        
                if (log.noStateRecord === '1') {
                    return writeData.writeToTable(
                            payload,
                            state_log_path,
                            null
                        )
                        .catch(error => {
                            console.error('failed POST write motive:', error);
                        });
                } else {
                    return writeData.writeToTable(
                            { motivation: computed },
                            state_log_path,
                            log.dcid
                        )
                        .catch(error => {
                            console.error('Failed PUT write motive:', error);
                        });
                }
            },
            
            missing_inc_time(log) {
                if (log.entry_time === null || isNaN(log.entry_time)) return '';
                let hours = Math.floor(log.entry_time / 3600);
                let minutes = Math.floor((log.entry_time % 3600) / 60);
                const ampm = (hours >= 12) ? 'PM' : 'AM';
                hours = (hours % 12);
                if (hours === 0) hours = 12;
                
                const stringTime = (
                        String(hours).padStart(2, '0') +
                        ':' +
                        String(minutes).padStart(2, '0') +
                        ' ' +
                        ampm
                    );
                    
                const payload = {
                    incident_time: stringTime,
                    logdcid: String(log.dcid)
                }
                
                if (log.noStateRecord === '1') {
                    return writeData.writeToTable(
                            payload,
                            state_log_path,
                            null
                        )
                        .catch(error => {
                            console.error('Failed to POST incident_time:', error);
                        });
                } else {
                    return writeData.writeToTable(
                            { incident_time: stringTime },
                            state_log_path,
                            log.dcid
                        )
                        .catch(error => {
                            console.error('Failed PUT write incident_time:', error);
                        });
                }
            },
            
            copy_urbandale_from_state_action(log) {
                return writeData.writeToLog(
                    { consequence: String(log.action_taken !== null ? log.action_taken : 0) },
                    log.dcid
                );
            },
            
            parent_contacted(log) {
                return writeData.writeToLog(
                    { consequence: '13' },
                    log.dcid
                );
            }
        };
        
        function actuallyFix(key, issueObj) {
            const promises = issueObj.logs.map(log => fixFunctions[key](log));

            return $q.all(promises)
                .then(() => {
                    console.log(`All fixes completed for ${key}`);
                    return true;
                })
                .catch(error => {
                    console.error(`Failed to fix some logs for ${key}:`, error);
                    return $q.reject(error);
                });
        }

        function runFix(key, issueObj) {
            if (!issueObj.fix) {
                $window.alert('No automated fix available');
                return $q.reject('No fix defined');
            }
            
            const confirmation = $window.confirm(issueObj.warn_comment);
            
            if (confirmation) {
                return actuallyFix(key, issueObj);
            } else {
                $window.alert('Aborted Fix!');
                return $q.reject('User aborted');
            }
        }

        return {
            runFix,
            fixFunctions
        };
    }]);
});