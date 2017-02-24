/**
 * Display default panel with given headline and content.
 */
var Panel = function(title, body, cols, fixed) {
    // Panel headline
    this.title = title;
    // Panel content
    this.body = body;
    // Number of columns to span. Set to 12 if argument is missing
    if (cols) {
        this.cols = cols;
    } else {
        this.cols = 12;
    }
    if (fixed) {
        this.fixed = fixed;
    } else {
        this.fixed = false;
    }
};

Panel.prototype = {
    constructor: Panel,
    html : function() {
        var cssClass =  'panel panel-default';
        if (this.fixed) {
            cssClass += ' panel-fixed';
        }
        return '<div class="col-lg-' + this.cols + '"><div class="' + cssClass + '">' +
                    '<div class="panel-heading">' + this.title + '</div>' +
                    '<div class="panel-body">' +
                        this.body +
                    '</div>' +
            '</div></div>';
    }
};

/**
 * Information panel.
 */
var InfoPanel = function(title, body, cols) {
    // Panel headline
    this.title = title;
    // Panel content
    this.body = body;
    // Number of columns to span. Set to 12 if argument is missing
    if (cols) {
        this.cols = cols;
    } else {
        this.cols = 12;
    }
};

InfoPanel.prototype = {
    constructor: InfoPanel,
    html : function() {
        return '<div class="col-lg-' + this.cols + '"><div class="panel panel-info">' +
                    '<div class="panel-heading">' + this.title + '</div>' +
                    '<div class="panel-body panel-info">' +
                        this.body +
                    '</div>' +
            '</div></div>';
    }
};
