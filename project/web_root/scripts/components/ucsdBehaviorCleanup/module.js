'use strict';
define([
    'angular',
    'components/shared/index',
    'components/angular_libraries/ucsdDirectivesModule',
    'components/angular_libraries/ucsdBetterAnimations'
], function(angular) {
    return angular.module('logCleanupModule', [
            'powerSchoolModule',
            'ucsdDirectives',
            'ngAnimate'
        ])
        .constant('log_tlist', '/admin/queries/pullSchoolLogEntries.json')
        .constant('definition_tlist', '/admin/queries/getDefinitions.json')
        
        .constant('definition_path', '/ws/schema/table/u_ucsd_beh_definitions')
        .constant('log_ext_path', '/ws/schema/table/u_ucsd_log_extensions')
        .constant('def_ext_path', '/ws/schema/table/u_def_ext_log')
        .constant('state_log_path', '/ws/schema/table/s_ia_log_x');
});