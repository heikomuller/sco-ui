/**
 * Main content elements
 */

var $EL_CONTENT = 'main-content';
var $EL_PANEL = 'main-panel';
var $EL_TITLE = 'main-title';

var $EL_APIDOC = 'apiDocumentationLink';
var $EL_CONNECT_INFO = 'connectionInfo';

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
            // Set page title
            document.title = data.title;
            // Set API documentation link
            const apiRef = getHATEOASReference('self', data.links);
            const apiDocRef = getHATEOASReference('doc', data.links);
            $('#' + $EL_APIDOC).html('<a href="' + apiDocRef + '" target="_blank"><i class="fa fa-info fa-fw"></i> API Documentation</a>');
            // Set connection information
            const apiDocLink = '<a class="connect" href="' + apiDocRef + '"><i class="fa fa-book"/></a>';
            let connectInfo = '<a class="connect" href="' + apiRef + '">' + data.name + '</a>';
            connectInfo = '[ Connected to ' + connectInfo + ' ' + apiDocLink + ' ]';
            connectInfo = '<span class="connect">' + connectInfo + '</span>';
            $('#' + $EL_CONNECT_INFO).html(connectInfo);
            // Set onclick handlers for navigation items in sidebar and navbar
            var experimentsLinks = [$LI_EXPERIMENTS, $NAV_EXPERIMENTS];
            for (var i = 0; i < experimentsLinks.length; i++) {
                (function(elementId, api) {
                    $('#' + elementId).click(function(event) {
                        event.preventDefault();
                        showExperimentsPage(api, true);
                    });
                })(experimentsLinks[i], api);
            }
            var homeLinks = [$LI_HOME, $NAV_HOME];
            for (var i = 0; i < homeLinks.length; i++) {
                (function(elementId, api) {
                    $('#' + elementId).click(function(event) {
                        event.preventDefault();
                        showHomePage(api, true);
                    });
                })(homeLinks[i], api);
            }
            var imageLinks = [$LI_IMAGES, $NAV_IMAGES];
            for (var i = 0; i < imageLinks.length; i++) {
                (function(elementId, api) {
                    $('#' + elementId).click(function(event) {
                        event.preventDefault();
                        showImageGroupsPage(api, true);
                    });
                })(imageLinks[i], api);
            }
            var subjectLinks = [$LI_SUBJECTS, $NAV_SUBJECTS];
            for (var i = 0; i < subjectLinks.length; i++) {
                (function(elementId, api) {
                    $('#' + elementId).click(function(event) {
                        event.preventDefault();
                        showSubjectsPage(api, true);
                    });
                })(subjectLinks[i], api);
            }
            window.addEventListener('popstate', function(event) {
                setState(event.state, api, false);
            });
            // Parse search parameters of the Url to determine which content
            // to show
            const urlParams = new URLSearchParams(window.location.search);
            let resourceId = '';
            for (let key of urlParams.keys()) {
                resourceId += '#' + key.toLowerCase();
            }
            if (resourceId === '') {
                setState([], api, true);
            } else if (resourceId === '#subjects') {
                setState([{key: 'subjects'}], api, true);
            } else if (resourceId === '#subject') {
                setState([{key: 'subject', value: urlParams.get('subject')}], api, true);
            } else if (resourceId === '#images') {
                setState([{key: 'images'}], api, true);
            } else if (resourceId === '#imagegroup') {
                setState([{key: 'imagegroup', value: urlParams.get('imagegroup')}], api, true);
            } else if (resourceId === '#experiments') {
                setState([{key: 'experiments'}], api, true)
            } else if (resourceId === '#experiment') {
                setState([{key: 'experiment', value: urlParams.get('experiment')}], api, true);
            } else if ((resourceId === '#experiment#run') || (resourceId === '#run#experiment')) {
                setState([
                    {key: 'experiment', value: urlParams.get('experiment')},
                    {key: 'run', value: urlParams.get('run')}
                ], api, true);
            } else {
                showUnknownResource('The requested resource does not exist on our server.', api);
            }
        },
        error: function(xhr, status, error) {
            if (xhr.responseText) {
                var err = JSON.parse(xhr.responseText).message;
            }
            $('#' + $EL_CONTENT).html(showErrorMessageHtml(err));
        }
    });
};

function setState(state, api, updateStack) {
    if (state.length === 0) {
        showHomePage(api, updateStack);
    } else if (state.length === 1) {
        const key = state[0].key;
        if (key === 'subjects') {
            showSubjectsPage(api, updateStack);
        } else if (key === 'subject') {
            const url = getHATEOASReference('subjects.list', api.data.links)
                + '/' + state[0].value;
            showSubject(url, api, updateStack);
        } else if (key === 'images') {
            showImageGroupsPage(api, updateStack);
        } else if (key === 'imagegroup') {
            const url = getHATEOASReference('images.groups.list', api.data.links)
                + '/' + state[0].value;
            showImageGroup(url, api, updateStack);
        } else if (key === 'experiments') {
             showExperimentsPage(api, updateStack);
        } else if (key === 'experiment') {
            const url = getHATEOASReference('experiments.list', api.data.links)
                + '/' + state[0].value;
            showExperiment(url, api, updateStack);
        }
    } else if (state.length === 2) {
        const url = getHATEOASReference('experiments.list', api.data.links)
            + '/' + state[0].value
            + '/predictions/' + state[1].value;
        showModelRun(url, api, updateStack);
    }
}

/**
 * Set the search parameter too point to a particular resource.
 */
function setStateUrl(params) {
    const urlParams = new URLSearchParams('');
    for (var para of params) {
        const property = para.key;
        if (para.hasOwnProperty('value')) {
            urlParams.set(property, para.value);
        }  else {
            urlParams.set(property, '');
        }
    }
    const search = urlParams.toString();
    const location = window.location;
    let url = [location.protocol, '//', location.host, location.pathname].join('');
    const pos = url.indexOf('?');
    if (pos > 0) {
        url = srl.substring(0, pos);
    }
    if (search !== '') {
        url += '?' + search;
    }
    history.pushState(params, '', url);
}

/**
 * Show content for home screen. Uses the overview information in the API
 * description object to display the welcome panel.
 *
 * @param {API} api
 */
function showHomePage(api, updateUrl) {
    sidebarSetActive($LI_HOME);
    showHomeHeadline(api);
    if (updateUrl) {
        setStateUrl([]);
    }
    var html = '<div class="row"><div class="col-lg-12">';
    var overview = api.homePageContent;
    if (overview) {
        html += new InfoPanel(overview.title, overview.content).html();
    }
    html += '</div></div>';
    $('#' + $EL_CONTENT).html(html);
    return false;
};

/**
 * Show a message the the resource specified by a given set of Url search
 * parameters is unknown.
 *
 * @param {API} api
 */
function showUnknownResource(message, api) {
    sidebarSetActive('');
    showHomeHeadline(api);
    let html = '<div class="row"><div class="col-lg-12">';
    html += '<p class="error-message">' + message + '</p>';
    html += '</div></div>';
    $('#' + $EL_CONTENT).html(html);
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
    if (sidebar.style.width === "0px") {
        sidebar.style.width = "220px";
        document.getElementById($EL_PANEL).style.marginLeft = "220px";
    } else {
        sidebar.style.width = 0;
        document.getElementById($EL_PANEL).style.marginLeft = 0;
    }
};
