/**
 * SCO Web API Handle. Contains information about API resources that are
 * returned by the API's overview request.
 */
var API = function(data) {
    // API overview request response
    this.data = data;
};

API.prototype = {
    constructor: API,
    /**
     * Get API resource descriptor with given identifier.
     */
    descriptor : function(id) {
        for (var i = 0; i < this.data.descriptors.length; i++) {
            var desc = this.data.descriptors[i];
            if (desc.id === id) {
                return desc;
            }
        }
    },
    getCreateExperimentUrl : function() {
        return getHATEOASReference('experiments.create', this.data.links);
    },
    /**
     * Get Url for server request to list all image groups. Include the list of
     * properties in the result (if given).
     */
    getExperimentsListAllUrl : function(properties) {
        var ref = getHATEOASReference('experiments.list', this.data.links);
        if (ref) {
            if (properties) {
                return ref + '?limit=-1&properties=' + properties;
            } else {
                return ref + '?limit=-1';
            }
        }
    },
    /**
     * Get Url for server request to list all image groups. Include the list of
     * properties in the result (if given).
     */
    getImagesListAllUrl : function(properties) {
        var ref = getHATEOASReference('images.groups.list', this.data.links);
        if (ref) {
            if (properties) {
                return ref + '?limit=-1&properties=' + properties;
            } else {
                return ref + '?limit=-1';
            }
        }
    },
    /**
     * Get Url for server request to list all subject. Include the list of
     * properties in the result (if given).
     */
    getSubjectsListAllUrl : function(properties) {
        var ref = getHATEOASReference('subjects.list', this.data.links);
        if (ref) {
            if (properties) {
                return ref + '?limit=-1&properties=' + properties;
            } else {
                return ref + '?limit=-1';
            }
        }
    },
    /**
     * Url for POST requests to upload image group files.
     */
    getUploadImagesUrl : function() {
        return getHATEOASReference('images.upload', this.data.links);
    },
    /**
     * Url for POST requests to upload subject files.
     */
    getUploadSubjectUrl : function() {
        return getHATEOASReference('subjects.upload', this.data.links);
    }
};

/**
 * Convert timestamps in UTC time (as returned by he server) into local time.
 */
function convertUTCDate2Local(timestamp) {
    var offset = new Date().getTimezoneOffset();
    var utc_date = new Date(timestamp)
    utc_date.setMinutes(utc_date.getMinutes() - offset);
    return utc_date.toLocaleString();
};

/**
 * Generic function to delete an object. Calls the given callback function on
 * success to reload page content.
 */
function deleteObject(objtype, name, url, reload) {
    if (confirm('Do you really want to delete the ' + objtype + ' ' + name)) {
        $.ajax({
            url: url,
            type: 'DELETE',
            success: function() {
                reload();
            },
            error: function(xhr, status, error) {
                if (xhr.responseText) {
                    var err = JSON.parse(xhr.responseText).message;
                } else {
                    var err = 'There was an error deleting the ' + objtype;
                }
                alert(err);
            }
        });
    }
}

/**
 * Get reference with given rel from HATEOAS reference list.
 *
 * @param {string} id
 * @param {list} links
 * @returns {string}
 */
function getHATEOASReference(id, links) {
    for (var i = 0; i < links.length; i++) {
        var ref = links[i];
        if (ref.rel === id) {
            return ref.href;
        }
    }
};

/**
 * Get reference with given rel from HATEOAS reference list.
 *
 * @param {string} name
 * @param {list} options
 * @returns {string}
 */
function getOption(name, options) {
    for (var i = 0; i < options.length; i++) {
        var op = options[i];
        if (op.name === name) {
            return op.value;
        }
    }
    return '';
};

/**
 * Get reference with given rel from HATEOAS reference list.
 *
 * @param {string} name
 * @param {list} links
 * @returns {string}
 */
function getProperty(key, properties) {
    for (var i = 0; i < properties.length; i++) {
        var prop = properties[i];
        if (prop.key === key) {
            return prop.value;
        }
    }
    return '';
};


/**
 * Upsert object options and refresh page content on success. Refresh is done
 * by calling a given refresh function.
 */
function upsertOptions(url, options, refreshPage) {
    $.ajax({
        url: url,
        type:'POST',
        contentType: 'application/json',
        data : JSON.stringify({'options' : options}),
        success: function(data) {
            refreshPage()
        },
        error: function(xhr, status, error) {
            if (xhr.responseText) {
                var err = JSON.parse(xhr.responseText).message;
            } else {
                var err = 'There was an error deleting the ' + objtype;
            }
            alert(err);
        }
    });
};

/**
 * Upsert object property and refresh page content on success. Refresh is done
 * by calling a given refresh function.
 */
function upsertProperty(url, key, value, refreshPage) {
    var prop = {'key': key}
    if (value) {
        prop['value'] = value
    }
    $.ajax({
        url: url,
        type:'POST',
        contentType: 'application/json',
        data : JSON.stringify({'properties' : [ prop ]}),
        success: function(data) {
            refreshPage()
        },
        error: function(xhr, status, error) {
            if (xhr.responseText) {
                var err = JSON.parse(xhr.responseText).message;
            } else {
                var err = 'There was an error deleting the ' + objtype;
            }
            alert(err);
        }
    });
};
