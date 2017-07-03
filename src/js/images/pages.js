/**
 * Show content for images listing page.
 *
 * @param {API} api
 */
function showImageGroupsPage(api) {
    sidebarSetActive($LI_IMAGES);
    showImageGroupsHeadline(api);
    var html = '<div class="row"><div class="col-lg-12">';
    html += new Panel(
        'Image Groups',
        '<div class="object-listing" id="image-listing"></div>',
        8,
        true
    ).html();
    var uploadForm = new FileUploadForm('uploadImages');
    html += new Panel(
        'Upload',
        '<p class="upload-form">' +
        	'Upload archives of image files (in .tar, .tgz, or .tar.gz format). ' +
            'Currently our models operate on static gray scale images. We support ' +
            '.jpg, .gif, and .png image formats.</p>' +
            uploadForm.html(),
        4,
        true
    ).html();
    html += '</div></div>';
    $('#' + $EL_CONTENT).html(html);
    uploadForm.show(api.getUploadImagesUrl(), api, showImageGroupsPage);
    new ObjectListing(
        api.getImagesListAllUrl('filename,filesize,size'),
        $IMAGE_TABLE_DEF,
        api
    ).show('image-listing');
    return false;
};

/**
 * Show information about a given image group.
 *
 * @param {string} url
 * @param {API} api
 */
function showImageGroup(url, api) {
    $('#' + $EL_CONTENT).html(showSpinnerHtml());
    $.ajax({
        url: url,
        type: 'GET',
        contentType: 'application/json',
        success: function(data) {
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
                            showImageGroup(url, api)
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
                            showImageGroup(url, api)
                        }
                    )
                }
            );
            var infoModal = new InfoModalForm('imgparaInfoModal');
            var options = new OptionsForm(
                'objOp',
                'Options',
                data.options,
                api.imageGroupParameters,
                infoModal,
                function(values) {
                    upsertOptions(
                        getHATEOASReference('options', data.links),
                        values,
                        function() {
                            showImageGroup(url, api)
                        }
                    )
                }
            );
            var listing = new ImageListing('imgListing');
            var imagePopup = new ImageModal('imgModal');
            var html = name.html();
            html += description.html();
            html += options.html();
            html += infoModal.html();
            html += showDownloadableObjectButtonsHtml('deleteObj', 'closePanel', getHATEOASReference('download', data.links));
            html = '<div class="row">' +
                '<div class="col-lg-4">' + html + '</div>' +
                '<div class="col-lg-4">' + listing.html() + '</div>' +
                '<div class="col-lg-4">' + imagePopup.html() + '</div>' +
                '</div>';
            // Display content
            sidebarSetActive('');
            showImageGroupHeadline(data.name, api);
            $('#' + $EL_CONTENT).html(new Panel('Image Group', html).html());
            // Set onclick handler for elements
            name.onclick();
            description.onclick();
            options.onclick();
            (function(name, url) {
                $('#deleteObj').click(function(event) {
                    event.preventDefault();
                    deleteObject('image group', name, url, function() {showImageGroupsPage(api);});
                });
            })(data.name, getHATEOASReference('delete', data.links), api);
            (function(api) {
                $('#closePanel').click(function(event) {
                    event.preventDefault();
                    showImageGroupsPage(api);
                });
            })(api);
            // Show image listing
            listing.show(getHATEOASReference('self', data.images.links), imagePopup);
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
