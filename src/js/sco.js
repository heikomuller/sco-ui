/**
 * Main content elements
 */

var $EL_CONTENT = 'main-content';
var $EL_PANEL = 'main-panel';
var $EL_TITLE = 'main-title';

/**
 * Navbar elements
 */

var $NAV_EXPERIMENTS = 'nav-experiments';
var $NAV_HOME = 'nav-home';
var $NAV_IMAGES = 'nav-images';
var $NAV_SUBJECTS = 'nav-subjects';

/**
 * Sidebar elements
 */

var $EL_SIDEBAR = 'sidebar-collapse';
var $LI_EXPERIMENTS = 'li-experiments';
var $LI_HOME = 'li-home';
var $LI_IMAGES = 'li-images';
var $LI_SUBJECTS = 'li-subjects';
var $SIDEBAR_LINKS = [$LI_EXPERIMENTS, $LI_HOME, $LI_IMAGES, $LI_SUBJECTS];

/**
 * Initialize the SCO Web Client to use the given SCO Web API. Reads information
 * about API and shows home page.
 *
 * @param {string} url
 */
function initApp(url) {
    $('#' + $EL_CONTENT).html(showSpinnerHtml());
    $.ajax({
        url: url,
        type: 'GET',
        contentType: 'application/json',
        success: function(data) {
            var api = new API(data);
            // Set onclick handlers for navigation items in sidebar and navbar
            var experimentsLinks = [$LI_EXPERIMENTS, $NAV_EXPERIMENTS];
            for (var i = 0; i < experimentsLinks.length; i++) {
                (function(elementId, api) {
                    $('#' + elementId).click(function() {
                        showExperimentsPage(api);
                    });
                })(experimentsLinks[i], api);
            }
            var homeLinks = [$LI_HOME, $NAV_HOME];
            for (var i = 0; i < homeLinks.length; i++) {
                (function(elementId, api) {
                    $('#' + elementId).click(function() {
                        showHomePage(api);
                    });
                })(homeLinks[i], api);
            }
            var imageLinks = [$LI_IMAGES, $NAV_IMAGES];
            for (var i = 0; i < imageLinks.length; i++) {
                (function(elementId, api) {
                    $('#' + elementId).click(function() {
                        showImageGroupsPage(api);
                    });
                })(imageLinks[i], api);
            }
            var subjectLinks = [$LI_SUBJECTS, $NAV_SUBJECTS];
            for (var i = 0; i < subjectLinks.length; i++) {
                (function(elementId, api) {
                    $('#' + elementId).click(function() {
                        showSubjectsPage(api);
                    });
                })(subjectLinks[i], api);
            }
            // Sohow homepage content
            showHomePage(api);
        },
        error: function(xhr, status, error) {
            if (xhr.responseText) {
                var err = JSON.parse(xhr.responseText).message;
            }
            $('#' + $EL_CONTENT).html(showErrorMessageHtml(err));
        }
    });
};

/**
 * Show content for home screen. Uses the overview information in the API
 * description object to display the welcome panel.
 *
 * @param {API} api
 */
function showHomePage(api) {
    sidebarSetActive($LI_HOME);
    showHomeHeadline(api);
    var html = '<div class="row"><div class="col-lg-12">';
    var overview = api.descriptor('overview');
    if (overview) {
        html += new InfoPanel(overview.title, overview.text).html();
    }
    html += '</div></div>';
    html += '<div class="row"><div class="col-lg-12">';
    var subjects = api.descriptor('subjects');
    if (subjects) {
        html += new Panel(
            subjects.title + '<button type="button" class="btn btn-default pull-right" id="btn-subjects">Show</button>',
            subjects.text,
            4
        ).html();
    }
    var images = api.descriptor('images');
    if (images) {
        html += new Panel(
            images.title + '<button type="button" class="btn btn-default pull-right" id="btn-images">Show</button>',
            images.text,
            4
        ).html();
    }
    var experiments = api.descriptor('experiments');
    if (experiments) {
        html += new Panel(
            experiments.title + '<button type="button" class="btn btn-default pull-right" id="btn-experiments">Show</button>',
            experiments.text,
            4
        ).html();
    }
    html += '</div></div>';
    $('#' + $EL_CONTENT).html(html);
    // Set onclick handlers for buttons in info panels
    if (subjects) {
        (function(api) {
            $('#btn-subjects').click(function() {
                showSubjectsPage(api);
            });
        })(api);
    }
    if (images) {
        (function(api) {
            $('#btn-images').click(function() {
                showImageGroupsPage(api);
            });
        })(api);
    }
    if (experiments) {
        (function(api) {
            $('#btn-experiments').click(function() {
                showExperimentsPage(api);
            });
        })(api);
    }
    return false;
};

/**
 * Set the given element to active in the sidebar.
 */
function sidebarSetActive(elementId) {
    for (var i = 0; i < $SIDEBAR_LINKS.length; i++) {
        var el = $SIDEBAR_LINKS[i];
        if (elementId === el) {
            $('#' + el).addClass("active");
        } else {
            $('#' + el).removeClass("active");
        }
    }
};

/**
 * Toggle sidebar
 */
function toggleSidebar() {
    // Get sidebar element
    var sidebar = document.getElementById($EL_SIDEBAR);
    // Currently we simply determine whether the sidebar is visible based on
    // the width of the element.
    // TODO: This could be optimized.
    if (sidebar.style.width === "220px") {
        sidebar.style.width = 0;
        document.getElementById($EL_PANEL).style.marginLeft = 0;
    } else {
        sidebar.style.width = "220px";
        document.getElementById($EL_PANEL).style.marginLeft = "220px";
    }
};
