/**
 * Parameter definition for image group or model run.
 *
 * @param {obj} paraDef
 */
var ParameterDef = function(paraDef) {
    /**
     * Unique identifier for parameter
     */
    this.id = paraDef.id;
    /**
     * More readable parameter name
     */
    this.name = paraDef.name;
    /**
     * Text describing parameter role
     */
    this.description = paraDef.description;
    /**
     * Identifier for parameter type (int, float, dict, enum or array)
     */
    this.type = paraDef.type;
    /**
     * String representation for parameter default value
     */
    if (paraDef.default) {
        if (paraDef.type.name === 'dict') {
            this.defaultValue = '';
            for (key in paraDef.default) {
                if (this.defaultValue !== '') {
                    this.defaultValue += ', ';
                }
                this.defaultValue += key + ':' + paraDef.default[key];
            }
        } else {
            this.defaultValue = paraDef.default;
        }
    } else {
        this.defaultValue = '';
    }
};

ParameterDef.prototype = {
    constructor: ParameterDef,
    /**
     * Html showing control to edit parameter value.
     */
    /**
     * Get the value for a control (with given element idetifier) for this
     * parameter.
     */
    controlValue : function(elementId) {
        return $('#' + elementId).val().trim();
    },
    formatValue : function(value) {
        if (this.type.name == 'array') {
            var text = '';
            for (var i = 0; i < value.length; i++) {
                if (i > 0) {
                    text += ', ';
                }
                var val = value[i];
                if (val instanceof Array) {
                    text += '(' + val + ')';
                } else {
                    text += val;
                }
            }
            return text;
        } else if (this.type.name == 'dict') {
            var text = '';
            for (key in value) {
                if (text !== '') {
                    text += ', ';
                }
                text += key + ':' + value[key];
            }
            return text;
        } else {
            return value;
        }
    },
    htmlControl : function(elementId, values) {
        var value = '';
        for (var i = 0; i < values.length; i++) {
            var para = values[i];
            if (para.name === this.name) {
                value = this.formatValue(para.value);
                break;
            }
        }
        if (this.type.name === 'enum') {
            var html = '<select id="' + elementId + '" class="form-control">';
            for (var i = 0; i < this.type.values.length; i++) {
                var val = this.type.values[i];
                html += '<option value="' + val + '"';
                if (val === this.defaultValue) {
                    html += ' selected';
                }
                html += '>' + val + '</option>';
            }
            html += '</select>';
            return html;
        } else {
            return '<input id="' + elementId + '" type="text" class="form-control" ' +
                'placeholder="' + this.defaultValue + '" value="' + value + '">'
        }
    },
    /**
     * Html to display parameter name. If the parameter has a description, an
     * information icon link is displayed next to the parameter name. The link
     * has the given element identifier.
     */
    htmlTitle : function(elementId) {
        var html = this.name;
        if (this.description !== '') {
            html += '&nbsp;&nbsp;<a href="#/" class="info-link" id="' + elementId + '">';
            html += '<i class="fa fa-info-circle" aria-hidden="true"></i></a>';
        }
        return html;
    },
    /**
     * Return value for this parameter from list of parameter values. Result
     * is an empty string if parameter not in list.
     */
    htmlValue : function(values) {
        for (var i = 0; i < values.length; i++) {
            var para = values[i];
            if (para.name === this.name) {
                return this.formatValue(para.value);
            }
        }
        return '<span class="default-value">' + this.defaultValue + '</span>';
    },
    /**
     * Validate a given value (in string format) for a given parameter. Returns
     * true if the value can be converted in a value of the expected type.
     */
    isValid : function(value) {
        if (this.type.name === 'int') {
            return !isNaN(parseInt(value));
        } else if (this.type.name === 'float') {
            return !isNaN(parseFloat(value));
        } else if (this.type.name === 'array') {
            if ((value.startsWith('[')) && (value.endsWith(']'))) {
                return isArray(value.substring(1, value.length - 1).trim())
            } else {
                return isArray(value);
            }
        } else if (this.type.name === 'dict') {
            if ((value.startsWith('{')) && (value.endsWith(']'))) {
                return isDict(value.substring(1, value.length - 1).trim())
            } else {
                return isDict(value);
            }
        } else if (this.type.name === 'enum') {
            return (value !== '');
        } else {
            console.log(this.type);
            return false;
        }
    }
};

/**
 * Helper Functions
 */

/**
 * Returns true if the given string is a list of floats or a list of float pairs.
 */
function isArray(value) {
    if (value.startsWith('(')) {
        var tokens = value.split(",");
        if ((tokens.length < 4) || (tokens.length % 2 !== 0)) {
            return false;
        }
        var pos = 0;
        while (pos < tokens.length) {
            var val1 = tokens[pos].trim().substring(1).trim()
            if (isNaN(parseFloat(val1))) {
                return false;
            }
            var val2 = tokens[pos + 1].trim();
            val2 = val2.substring(0, val2.length - 1);
            if (isNaN(parseFloat(val2))) {
                return false;
            }
            pos += 2;
        }
    } else {
        var tokens = value.split(",");
        if (tokens.length < 2) {
            return false;
        }
        for (var i = 0; i < tokens.length; i++) {
            if (isNaN(parseFloat(tokens[i]))) {
                return false;
            }
        }
    }
    return true;
};

/**
 * Returns true if the given string is a dictionary of integer : float pairs.
 */
function isDict(value) {
    var tokens = value.split(",");
    for (var i = 0; i < tokens.length; i++) {
        var pair = tokens[i].split(':');
        if (pair.length != 2) {
            return false;
        }
        if (isNaN(parseInt(pair[0].trim()))) {
            return false;
        }
        if (isNaN(parseFloat(pair[1].trim()))) {
            return false;
        }
    }
    return true;
};
