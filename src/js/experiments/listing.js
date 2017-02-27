$EXPERIMENT_TABLE_DEF = [
    {
        'id' : 'name',
        'name' : 'Name',
        'onclick' : {
            'css' : 'internal-link',
            'handler' : function(item, api) {
                return showExperiment(
                    getHATEOASReference('self', item.links),
                    api
                );
            }
        }
    },
    {
        'id' : 'runcount',
        'name' : 'Predictions'
    },
    {
        'id' : 'timestamp',
        'name' : 'Created',
        'converter' : function(timestamp) {
            return convertUTCDate2Local(timestamp);
        }
    }
];

$EXPERIMENT_RUNS_TABLE_DEF = [
    {
        'id' : 'name',
        'name' : 'Name',
        'onclick' : {
            'css' : 'internal-link',
            'handler' : function(item, api) {
                return showModelRun(
                    getHATEOASReference('self', item.links),
                    api
                );
            }
        }
    },
    {
        'id' : 'state',
        'name' : 'State',
        'converter': function(state) {
            if (state === 'IDLE') {
                return '<span class="text-warning"><i class="fa fa-pause" aria-hidden="true"></i> ' + state + '</span>';
            } else if (state === 'RUNNING') {
                return '<span class="text-primary"><i class="fa fa-circle-o-notch fa-spin" aria-hidden="true"></i> ' + state + '</span>';
            } else if (state === 'FAILED') {
                return '<span class="text-danger"><i class="fa fa-exclamation-triangle" aria-hidden="true"></i> ' + state + '</span>';
            } else if (state === 'SUCCESS') {
                return '<span class="text-success"><i class="fa fa-check" aria-hidden="true"></i> ' + state + '</span>';
            } else {
                return state;
            }
        }
    },
    {
        'id' : 'timestamp',
        'name' : 'Created',
        'converter' : function(timestamp) {
            return convertUTCDate2Local(timestamp);
        }
    }
];
