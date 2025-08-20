'use strict';
define(require => {
    const module = require('components/ucsdBehaviorCleanup/module');
    
    module.factory('baseUtil', [() => {
        const locationMap = {
            'CLA': '5',
            'LUC': '4',
            'HAL': '9',
            'AUD': '16',
            'RES': '1',
            'GYM': '8',
            'EAC': '18',
            'EMC': '18',
            'MEC': '10',
            'PLA': '15',
            'ECE': '16',
            'BUS': '2',
            'BUZ': '3',
            'OFC': '12',
            'GSP': '6',
            'OFF': '13',
            'PAL': '14',
            'LOR': '11',
            'OTH': '20'
        };
        const moArray = ['AVA', 'AVP', 'AVT', 'OAA', 'OIA', 'OPA', 'UMO', 'OMO'];

        const incidentTypeAssoc = {
            'EL-AIL': '1', 'EL-AIL2': '1', 'EL-AIL3': '1', 'EL-AIL4': '1', 'MH-AIL': '1', 'MH-AIL2': '1', 'MH-AIL3': '1', 'MH-AIL4': '1',
            'EL-ALC': '2', 'EL-ALC2': '2', 'EL-ALC3': '2', 'MH-ALC': '2', 'MH-ALC2': '2', 'MH-ALC3': '2',
            'EL-ARS': '3', 'MH-ARS': '3',
            'MH-COT': '4', 'MH-COT2': '4', 'MH-COT3': '4', 'EL-COT': '4', 'EL=COT2': '4',
            'EL-BUL': '5', 'MH-BUL': '5',
            'EL-FIR': '6', 'EL-FIR2': '6', 'MH-FIR': '6', 'MH-FIR2': '6', 'MH-FIR3': '6',
            'EL-DEF': '7', 'EL-DEF2': '7', 'EL-DEF3': '7', 'MH-DEF': '7', 'MH-DEF2': '7', 'MH-DEF3': '7',
            'EL-DIS': '9', 'EL-DIS2': '9', 'EL-DIS3': '9', 'MH-DIS': '9', 'MH-DIS2': '9', 'MH-DIS3': '9',
            'EL-DCV': '10', 'MH-DCV': '10',
            'EL-DRG': '11', 'EL-DRG2': '11', 'EL-DRG3': '11', 'MH-DRG': '11', 'MH-DRG2': '11', 'MH-DRG3': '11',
            'EL-FRG': '12', 'EL-FRG2': '12', 'MH-FRG': '12',
            'EL-GAF': '13', 'MH-GAF': '13',
            'EL-HRS': '14', 'MH-HRS': '14',
            'EL-IAF': '15', 'EL-IAF2': '15', 'MH-IAF': '15', 'MH-IAF2': '15',
            'EL-ILO': '16', 'EL-ILO2': '16', 'EL-ILO3': '16', 
            'EL-LCH': '17', 'EL-LCH2': '17', 'EL-LCH3': '17', 'MH-LCH': '17', 'MH-LCH2': '17', 'MH-LCH3': '17',
            'EL-PAI': '18', 'MH-PAI': '18',
            'EL-PAI2': '19', 'MH-PAI2': '19',
            'EL-PAW': '20', 'EL-PAW2': '20', 'EL-PAW3': '20', 'MH-PAW': '20', 'MH-PAW2': '20', 'MH-PAW3': '20',
            'EL-PFI': '21', 'MH-PFI': '21',
            'EL-PFI2': '22', 'MH-PFI2': '22',
            'EL-PFW': '23', 'MH-PFW': '23',
            'EL-PDA': '24', 'EL-PDA2': '24', 'EL-PDA3': '24', 'MH-PDA': "24",
            'MH-ILO': '25', 'MH-ILO2': '25', 'MH-ILO3': '25',
            'MH-TAR': '27',
            'EL-TVI': '28', 'EL-TVI2': '28', 'EL-TVI3': '28', 'EL-TVI4': '28', 'MH-TVI': '28', 'MH-TVI2': '28', 'MH-TVI3': '28', 'MH-TVI4': '28',
            'EL-THF': '29', 'EL-THF2': '29', 'EL-THF3': '29', 'EL-THF4': '29', 'MH-THF': '29', 'MH-THF2': '29', 'MH-THF3': '29',
            'EL-TOB': '30', 'EL-TOB2': '30', 'EL-TOB3': '30', 'MH-TOB': '30', 'MH-TOB2': '30', 'MH-TOB3': '30',
            'EL-WEP': '32', 'EL-WEP2': '32', 'EL-WEP3': '32', 'MH-WEP': '32', 'MH-WEP2': '32', 'MH-WEP3': '32',
            'EL-OTH': '33', 'EL-OTH2': '33', 'MH-OTH': '33', 'MH-OTH2': '33'
        }

        function getFreshBuckets() {
            return {
                all_logs: {
                    name: 'All Logs This Year for This School',
                    description: 'All logs this year regardless of whether they have discrepencies or not.',
                    fix: false,
                    logs: [],
                    color: 'green-tile'
                },
                marked_sus: { name: "Marked Suspension", description: "The log entry checkbox that marks a log for the suspension letter generation is left checked. This can cause some issues later on. Run this fix to uncheck all of them for the current year.", fix: true, logs: [], color: 'red-tile', warn_comment: 'Are you sure you wish to uncheck all suspension letter checkboxes for this year?' },
                fix_number: { name: "Log Student Number Copy", description: "Log records are associated to students by studentid, but they also can contain other student information. While it's not really an issue if log records don't contain additional student data, it's easy to fix with a button click. This is more of a data-keeping function.", fix: true, logs: [], color: 'yellow-tile', warn_comment: 'Fix Student Number?' },
                missing_sub: { name: "Missing Subtype", description: "This is likely due to a log being transformed from a communication log into a discipline log and not filled out. Converting log types causes the log to save immediately bypassing all formatting validations. These will need to be fixed manually as the issue is simply that a log was made and left blank.", fix: false, logs: [], color: 'red-tile' },
                missing_incident_type: { name: "Missing Incident Type", description: "This can happen for several reason, such as changing the subtype without updating the incident type. These will need to be manually fixed as there's no way to know what the intended incident type was supposed to be.", fix: false, logs: [], color: 'red-tile' },
                missing_cons: { name: "Missing Action Taken", description: "This issue is due to the most stringent action taken not being filled out. For Major and Serious log entries, this also likely means the state action isn't filled out.", fix: false, logs: [], color: 'red-tile' },
                missing_loc: { name: "Missing Location", description: "Location was never filled out. For Major and Serious, this also likely means the state location isn't filled out.", fix: false, logs: [], color: 'red-tile' },
                state_action_copy: { name: "State Action Mismatch", description: "State Action doesn't match the most stringent action or is blank.", fix: true, logs: [], color: 'red-tile', warn_comment: 'Copy Urbandale Action Taken to State Action Taken?' },
                state_incident_copy: { name: "State Incident Mismatch", description: "State incident doesn't match the chosen infraction type or is blank.", fix: true, logs: [], color: 'red-tile', warn_comment: 'Copy Urbandale Infraction Type to State Infraction Type?' },
                state_loc_copy: { name: "State Location Mismatch", description: "The state location doesn't match the chosen location or is blank.", fix: true, logs: [], color: 'red-tile', warn_comment: 'Copy Urbandale Location to State Location?' },
                state_mo_copy: { name: "Motivation Code Mismatch", description: "The state motivation doesn't match the chosen motivation or is blank", fix: true, logs: [], color: 'red-tile', warn_comment: 'Copy Urbandale Motive to State Motive?' },
                state_dur_assign: { name: "State duration not assigned", description: "The log is some sort of suspension or expulsion, but the duration isn't filled out in the state portion.", fix: false, logs: [], color: 'red-tile' },
                missing_inc_time: {
                    name: 'Missing Incident Time',
                    warn_comment: 'Are you sure you wish to copy entry time to infraction time?',
                    description: 'The infraction time is missing. If this is the case, and especially if the log is from months past, the only easy solution is to copy the entry time to the infraction time. Otherwise, if you know when the infraction took place, it would be preferable to fill it out manually.',
                    fix: true,
                    logs: [],
                    color: 'red-tile'
                },
                copy_urbandale_from_state_action: {
                    name: 'Missing Urbandale Action Taken',
                    warn_comment: 'Copy state action taken to Urbandale action taken?',
                    description: 'The state action taken is filled out, but the Urbandale action taken is not. Can be copied over via fix function.',
                    fix: true,
                    logs: [],
                    color: 'red-tile'
                },
                parent_contacted: {
                    name: 'Parent Contacted Not Copied',
                    warn_comment: 'Set all selected to "Parent Contacted"?',
                    description: 'Most stringent action is not selected but only "Parent Contacted" is selected in staff actions. This function will simply set all of them to "Parent Contacted" as the most stringent action.',
                    fix: true,
                    logs: [],
                    color: 'red-tile'
                },
                missing_beh_inc_num: {
                    name: 'Behavior Incident Number Missing',
                    warn_comment: '',
                    description: 'All major and serious discipline log entries should have a generated state behavior incident number. These logs are missing this.',
                    fix: false,
                    logs: [],
                    color: 'red-tile'
                }
            };
        }

        function addToBucket(buckets, bucketName, log) {
            if (buckets[bucketName]) {
                buckets[bucketName].logs.push(log);
            }
        }

        return {
            filterIssues: function (yearLogs) {
                // Reset all logs
                const issueBuckets = getFreshBuckets();

                for (const log of yearLogs) {
                    addToBucket(issueBuckets, 'all_logs', log); // Adds to all_logs bucket no matter what
                    
                    // log is checked against all of the following discrepencies:
                    if (log.suspensionletter == '1') addToBucket(issueBuckets, 'marked_sus', log);

                    if (!log.student_number || log.student_number == '0') addToBucket(issueBuckets, 'fix_number', log);

                    if (!log.subtype) addToBucket(issueBuckets, 'missing_sub', log);

                    if (!log.discipline_incidenttype) addToBucket(issueBuckets, 'missing_incident_type', log);

                    if (!log.consequence) addToBucket(issueBuckets, 'missing_cons', log);

                    if (!log.location) addToBucket(issueBuckets, 'missing_loc', log);
                    
                    if (!log.incident_time) addToBucket(issueBuckets, 'missing_inc_time', log);
                    
                    if (!log.consequence && log.action_taken) addToBucket(issueBuckets, 'copy_urbandale_from_state_action', log);
                    
                    if (
                        !log.consequence 
                        && log.teacher_actions2 === 'Parent Contacted' 
                        && ( log.teacher_action_extras === '{}' || log.teacher_action_extras === '' )
                    ) addToBucket(issueBuckets, 'parent_contacted', log);
                    
                    // Only checks if log is NOT Minor rather than only if log is Major or Serious since subtype can be null
                    if (!!log.subtype && log.subtype !== 'Minor') {
                        if (log.consequence && log.consequence != log.action_taken) addToBucket(issueBuckets, 'state_action_copy', log);
                        
                        if (!log.behavior_incident_number) addToBucket(issueBuckets, 'missing_beh_inc_num', log);

                        if (
                            ( log.discipline_incidenttype && incidentTypeAssoc[log.discipline_incidenttype] != log.problem_behavior )
                            || (log.subtype && !log.major_or_minor )
                        ) addToBucket(issueBuckets, 'state_incident_copy', log);

                        if (
                            log.location 
                            && locationMap[log.location.trim()] != log.incident_location
                        ) addToBucket(issueBuckets, 'state_loc_copy', log);

                        if (
                            !!log.log_motivation 
                            && moArray.indexOf(log.log_motivation) !== -1 
                            && (moArray.indexOf(log.log_motivation) + 1) !== parseInt(log.motivation)
                        ) addToBucket(issueBuckets, 'state_mo_copy', log);

                        if (
                            log.action_taken 
                            && Number(log.action_taken) <= 4
                            && ( !log.duration_assigned || log.duration_assigned == '0' )
                        ) addToBucket(issueBuckets, 'state_dur_assign', log);
                    }
                }

                return issueBuckets;
            },
            locationMap,
            moArray,
            incidentTypeAssoc
        };
    }]);
});