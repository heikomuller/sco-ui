/**
 * Show an error message. Returns Html element containing the error message.
 *
 * @param {string} message
 * @returns {String}
 */
function showErrorMessageHtml(message) {
    if (!message) {
        message = 'There was an error while loading content from the server.'
    }
    return '<div class="container-fluid">' +
            '<p class="error-message">' +
                '<i class="fa fa-exclamation-triangle" aria-hidden="true"></i>&nbsp;&nbsp;' +
                message +
            '</p>' +
        '</div>';
};

/**
 * Spinner shown when loading panel content. Returns Html element containing
 * the spinner.
 *
 * @returns {string}
 */
function showSpinnerHtml() {
    return '<div style="text-align: center;padding: 10px;">' +
            '<i class="fa fa-spinner fa-pulse fa-3x fa-fw"></i>' +
        '</div>';
};

/**
 * Shows button row with delete and close buttons.
 */
function showDefaultObjectButtonsHtml(deleteId, closeId, readOnly) {
    let html = '<div class="button-row">';
    if (!readOnly) {
        html += '<button class="btn btn-danger" id="' + deleteId + '">' +
                    '<i class="fa fa-trash" aria-hidden="true"></i> ' +
                    'Delete' +
                '</button>' +
                '&nbsp;&nbsp;&nbsp;';
    }
    html += '<button class="btn btn-default" id="' + closeId + '">' +
            '<i class="fa fa-times" aria-hidden="true"></i> ' +
            'Close' +
        '</button>' +
    '</div>';
    return html;
}

/**
 * Shows button row with delete and close buttons.
 */
function showDownloadableObjectButtonsHtml(deleteId, closeId, downloadUrl, readOnly) {
    let html = '<div class="button-row">';
    html += '<a type="button" href="' + downloadUrl + '" class="btn btn-success">' +
        '<i class="fa fa-download" aria-hidden="true"></i> ' +
        'Download' +
    '</a>' +
    '&nbsp;&nbsp;&nbsp;';
    if (!readOnly) {
        html += '<button class="btn btn-danger" id="' + deleteId + '">' +
                '<i class="fa fa-trash" aria-hidden="true"></i> ' +
                'Delete' +
            '</button>' +
            '&nbsp;&nbsp;&nbsp;'
    }
    html += '<button class="btn btn-default" id="' + closeId + '">' +
            '<i class="fa fa-times" aria-hidden="true"></i> ' +
            'Close' +
        '</button>' +
    '</div>';
    return html;
}
