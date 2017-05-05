/**
 * Visualization of post-processing analytics results for successful model
 * runs.
 *
 * Two types of visualizations are currently being supported:
 *
 * 1) Vega-Lite visualizations of data files that are attached with model runs
 * 2) Listings of images
 *
 */

var $VIS_VEGALITE = 'VEGALITE';


/**
 * Visualization widget for Vega-Lite specification. Contains a unique
 * identifier for this widget, a title (for display as section title), the
 * specification of the visualization, the Url of the resource that is
 * visualized, and the format descriptor for the resource.
 */
var VegaLiteWidget = function(id, title, specification, resource, mimeType) {
    /* Unique identifier : string */
    this.id = id;
    /* Section title : string */
    this.title = title;
    /* Visualization specification: Object */
    this.specification = specification;
    /* Resource Url : string */
    this.resource = resource;
    /* Resource format descriptor : string */
    if (mimeType === 'text/csv') {
        this.formatType = 'csv';
    } else if (mimeType === 'text/tab-separated-values') {
        this.formatType = 'tsv';
    } else {
        this.formatType = 'json';
    }
};

VegaLiteWidget.prototype = {
    constructor : VegaLiteWidget,
    html : function() {
        let html = '<div class="row"><div class="col-lg-12">';
        html += '<p class="attribute-label">' + this.title + '</p>';
        html += '<div id="' + this.id + '"></div>';
        html += '</div></div>';
        return html;
    },
    show : function() {
        var vlSpec = {};
        for (var attr in this.specification) {
            if (this.specification.hasOwnProperty(attr)) {
                vlSpec[attr] = this.specification[attr];
            }
        }
        vlSpec['data'] = {
            'url' : this.resource,
            'formatType' : this.formatType
        };
        var opt = {
            'mode': 'vega-lite',
            'actions' : {'export' : false, 'source': false, 'editor' : false}
        };
        var elementId = '#' + this.id;
        vega.embed(elementId, vlSpec, opt, function(error, result) {
            if (error) {
                $(elementId).html('<p class="error-message">There was an error displaying the chart</p>');
            }
         });
     }
};

/**
 * Get a list of visualization widgets for a given model run. The result will
 * contain one entry for each defined API widget that has an input requirement
 * which is satisfied by an attachment of the given model run.
 */
function getModelRunWidgets(api, modelRun) {
    let attachments = {};
    for (let i = 0; i < modelRun.attachments.length; i++) {
        let attachment = modelRun.attachments[i];
        attachments[attachment.id] = attachment;
    }
    let visWidgets = [];
    for (let i = 0; i < api.widgets.length; i++) {
        let widget = api.widgets[i];
        if (attachments[widget.resource]) {
            if (widget.engine === $VIS_VEGALITE) {
                visWidgets.push(
                    new VegaLiteWidget(
                        'vegalite' + visWidgets.length,
                        widget.title,
                        widget.specification,
                        getHATEOASReference(
                            'download',
                            attachments[widget.resource].links
                        ),
                        attachments[widget.resource].mimeType
                    )
                );
            }
        }
        let attachment = modelRun.attachments[i].id;
        if (api.widgets[attachment]) {
            for (let j = 0; j < api.widgets[attachment].length; j++) {
                let widget = api.widgets[attachment.id][j];
                html += '<div class="row"><div class="col-lg-12">';
                html += '<p class="attribute-label">';
                html += widget.title;
                html += '</p></div></div>';
            }
        }
    }
    return visWidgets;
};
