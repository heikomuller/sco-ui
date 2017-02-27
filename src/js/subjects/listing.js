$SUBJECT_TABLE_DEF = [
    {
        'id' : 'name',
        'name' : 'Name',
        'onclick' : {
            'css' : 'internal-link',
            'handler' : function(item, api) {
                return showSubject(
                    getHATEOASReference('self', item.links),
                    api
                );
            }
        }
    },
    {
        'id' : 'filename',
        'name' : 'File',
        'link' : {
            'css' : 'action-link',
            'factory' : function(item) {
                return getHATEOASReference('download', item.links);
            }
        }
    },
    {
        'id' : 'filesize',
        'name' : 'Size',
        'converter' : function(size) {
            return filesize(size);
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
