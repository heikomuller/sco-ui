/**
 * Show content for subjects listing page.
 *
 * @param {API} api
 */
function showSubjectsPage(api, updateUrl) {
    sidebarSetActive($LI_SUBJECTS);
    showSubjectsHeadline(api);
    if (updateUrl) {
        setStateUrl([{key: 'subjects'}]);
    }
    var html = '<div class="row"><div class="col-lg-12">';
    html += new Panel(
        'Brain Anatomy MRI Data',
        '<div class="object-listing" id="subject-listing"></div>',
        8,
        true
    ).html();
    var uploadForm = new FileUploadForm('uploadSubjects');
    html += new Panel(
        'Upload',
        '<p class="upload-form">' +
        	'Upload brain anatomy MRI data. Currently, we expect a ' +
            '<a class="text-link" href="https://wikis.nyu.edu/display/winawerlab/Freesurfer+autosegmentation">freesurfer</a> ' +
            'anatomy directory (in .tar, .tgz, or .tar.gz format).</p>' +
            uploadForm.html(),
        4,
        true
    ).html();
    html += '</div></div>';
    $('#' + $EL_CONTENT).html(html);
    uploadForm.show(api.getUploadSubjectUrl(), api, showSubjectsPage);
    new ObjectListing(
        api.getSubjectsListAllUrl('filename,filesize'),
        $SUBJECT_TABLE_DEF,
        api
    ).show('subject-listing');
    return false;
};

/**
 * Show information about a given subject.
 *
 * @param {string} url
 * @param {API} api
 */
function showSubject(url, api, updateUrl) {
    $('#' + $EL_CONTENT).html(showSpinnerHtml());
    $.ajax({
        url: url,
        type: 'GET',
        contentType: 'application/json',
        success: function(data) {
            if (updateUrl) {
                setStateUrl([{key: 'subject', value: data.id}]);
            }
            // Build content Html
            var name = new EditableAttribute(
                'objName',
                'Name',
                data.name,
                function(value) {
                    upsertProperty(
                        getHATEOASReference('properties', data.links),
                        'name',
                        value,
                        function() {
                            showSubject(url, api, false)
                        }
                    )
                }
            )
            var description = new EditableAttribute(
                'objDesc',
                'Description',
                getProperty('description', data.properties),
                function(value) {
                    upsertProperty(
                        getHATEOASReference('properties', data.links),
                        'description',
                        value,
                        function() {
                            showSubject(url, api, false)
                        }
                    )
                }
            );
            let readOnly = getBoolean('readOnly', data.properties);
            var html = name.html();
            html += description.html();
            html += showDownloadableObjectButtonsHtml(
                'deleteObj',
                'closePanel',
                getHATEOASReference('download', data.links),
                readOnly
            );
            html = '<div class="row"><div class="col-lg-4">' + html + '</div><div class="col-lg-8"></div>';
            // Display content
            sidebarSetActive('');
            showSubjectHeadline(data.name, api);
            $('#' + $EL_CONTENT).html(new Panel('Subject', html).html());
            // Set onclick handler for elements
            name.onclick();
            description.onclick();
            if (!readOnly) {
                (function(name, url) {
                    $('#deleteObj').click(function(event) {
                        event.preventDefault();
                        deleteObject('subject', name, url, function() {showSubjectsPage(api, true);});
                    });
                })(data.name, getHATEOASReference('delete', data.links), api);
            }
            (function(api) {
                $('#closePanel').click(function(event) {
                    event.preventDefault();
                    showSubjectsPage(api, true);
                });
            })(api);
        },
        error: function(xhr, status, error) {
            if (xhr.responseText) {
                var err = JSON.parse(xhr.responseText).message;
            }
            $('#' + $EL_CONTENT).html(showErrorMessageHtml(err));
        }
    });
    return false;
};
