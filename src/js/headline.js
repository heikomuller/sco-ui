var Headline = function(breadcrumbs) {
    this.breadcrumbs = breadcrumbs;
};

Headline.prototype = {
    constructor: Headline,
    show : function() {
        var html = '';
        for (var i = 0; i < this.breadcrumbs.length; i++) {
            var breadcrumb = this.breadcrumbs[i];
            if (i > 0) {
                html += '&nbsp;&nbsp;/&nbsp;&nbsp;';
            }
            if (breadcrumb.icon) {
                html += '<i class="fa ' + breadcrumb.icon + '"></i>&nbsp;&nbsp;';
            }
            if (breadcrumb.link) {
                html += '<a class="headline-link" href="#/" id="breadcrumb-' + i +'">' + breadcrumb.name + '</a>';
            } else {
                html += breadcrumb.name;
            }
        }
        $('#' + $EL_TITLE).html(html);
        // Set onclick handler
        for (var i = 0; i < this.breadcrumbs.length; i++) {
            var breadcrumb = this.breadcrumbs[i];
            if (breadcrumb.link) {
                (function(elementId, func) {
                    $('#' + elementId).click(function() {
                        func();
                    });
                })('breadcrumb-' + i, breadcrumb.link);
            }
        }
    }
};


function showExperimentsHeadline(api) {
    new Headline([
        {
            'name' : 'Home',
            'icon' : 'fa-home',
            'link' : function() {showHomePage(api);}
        },
        {
            'name' : 'Experiments',
            'icon' : 'fa-area-chart',
            'link' : function() {showExperimentsPage(api);}
        }
    ]).show();
};

function showExperimentHeadline(name, api) {
    new Headline([
        {
            'name' : 'Home',
            'icon' : 'fa-home',
            'link' : function() {showHomePage(api);}
        },
        {
            'name' : 'Experiments',
            'icon' : 'fa-area-chart',
            'link' : function() {showExperimentsPage(api);}
        },
        {
            'name' : name
        }
    ]).show();
};

function showHomeHeadline(api) {
    new Headline([{
        'name' : 'Home',
        'icon' : 'fa-home',
        'link' : function() {showHomePage(api);}
    }]).show();
};

function showImageGroupsHeadline(api) {
    new Headline([
        {
            'name' : 'Home',
            'icon' : 'fa-home',
            'link' : function() {showHomePage(api);}
        },
        {
            'name' : 'Images',
            'icon' : 'fa-group',
            'link' : function() {showImageGroupsPage(api);}
        }
    ]).show();
};

function showImageGroupHeadline(name, api) {
    new Headline([
        {
            'name' : 'Home',
            'icon' : 'fa-home',
            'link' : function() {showHomePage(api);}
        },
        {
            'name' : 'Images',
            'icon' : 'fa-group',
            'link' : function() {showImageGroupsPage(api);}
        },
        {
            'name' : name
        }
    ]).show();
};

function showModelRunHeadline(name, experiment, api) {
    new Headline([
        {
            'name' : 'Home',
            'icon' : 'fa-home',
            'link' : function() {showHomePage(api);}
        },
        {
            'name' : 'Experiments',
            'icon' : 'fa-area-chart',
            'link' : function() {showExperimentsPage(api);}
        },
        {
            'name' : experiment.name,
            'link' : function() {showExperiment(getHATEOASReference('self', experiment.links), api);}
        },
        {
            'name' : name
        }
    ]).show();
};



function showSubjectsHeadline(api) {
    new Headline([
        {
            'name' : 'Home',
            'icon' : 'fa-home',
            'link' : function() {showHomePage(api);}
        },
        {
            'name' : 'Subjects',
            'icon' : 'fa-group',
            'link' : function() {showSubjectsPage(api);}
        }
    ]).show();
};

function showSubjectHeadline(name, api) {
    new Headline([
        {
            'name' : 'Home',
            'icon' : 'fa-home',
            'link' : function() {showHomePage(api);}
        },
        {
            'name' : 'Subjects',
            'icon' : 'fa-group',
            'link' : function() {showSubjectsPage(api);}
        },
        {
            'name' : name
        }
    ]).show();
};
