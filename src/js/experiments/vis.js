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
var VegaLiteWidget = function(id, title, specification) {
    /* Unique identifier : string */
    this.id = id;
    /* Section title : string */
    this.title = title;
    /* Visualization specification: Object */
    this.specification = specification;
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
        var opt = {
            'mode': 'vega-lite',
            'actions' : {'export' : false, 'source': false, 'editor' : false}
        };
        var elementId = '#' + this.id;
        vega.embed(elementId, this.specification, opt, function(error, result) {
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
    const visWidgets = [];
    for (let i = 0; i < modelRun.widgets.length; i++) {
        const widget = modelRun.widgets[i];
        if (widget.engine === $VIS_VEGALITE) {
            visWidgets.push(
                new VegaLiteWidget(
                    'vegalite' + visWidgets.length,
                    widget.title,
                    widget.specification
                )
            );
        }
    }
    return visWidgets;
};
