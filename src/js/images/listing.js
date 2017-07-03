$IMAGE_TABLE_DEF = [
    {
        'id' : 'name',
        'name' : 'Name',
        'onclick' : {
            'css' : 'internal-link',
            'handler' : function(item, api) {
                return showImageGroup(
                    getHATEOASReference('self', item.links),
                    api
                );
            }
        }
    },
    {
        'id' : 'size',
        'name' : 'Images'
    },
    {
        'id' : 'filename',
        'name' : 'File',
        'link' : {
            'css' : 'action-link',
            'factory' : function(item) {
                return getHATEOASReference('download', item.links);
            }
        }
    },
    {
        'id' : 'filesize',
        'name' : 'Size',
        'converter' : function(size) {
            return filesize(size);
        }
    },
    {
        'id' : 'timestamp',
        'name' : 'Created',
        'converter' : function(timestamp) {
            return convertUTCDate2Local(timestamp);
        }
    }
];

var ImageListing = function(elementId) {
    this.elementId = elementId;
};

ImageListing.prototype = {
    constructor: ImageListing,
    html : function () {
        return '<p class="attribute-label">Images<span class="nav-controls pull-right" id="' + this.elementId + 'Nav"></span></p>' +
        '<div class="image-listing" id="' + this.elementId + '"></div>';
    },
    show : function(url, modal) {
        listImages(this.elementId, url, modal);
    }
};

var ImageModal = function(elementId) {
    this.elementId = elementId;
};

ImageModal.prototype = {
    constructor: ImageModal,
    clear : function() {
        $('#' + this.elementId).html('');
    },
    html : function () {
        return '<div class="image-listing" id="' + this.elementId + '"></div>';
    },
    show : function(name, url) {
        var html = '<p class="attribute-label">' + name + '</p>';
        html += '<img src="' + url + '"  class="img-responsive">';
        $('#' + this.elementId).html(html);
    }
};

function getNavCtrl(id, url, icon) {
    var text = '<i class="fa ' + icon + '"></i>';
    if (url) {
        return '<a href="#/" class="nav-link" id="' + id + '">' + text + '</a>';
    } else {
        return text;
    }
};

function listImages(elementId, url, modal) {
    $('#' + elementId).html(showSpinnerHtml());
    $.ajax({
        url : url,
        type : 'GET',
        contentType : 'application/json',
        success : function(data) {
            // Set navigation controls
            var first = getHATEOASReference('first', data.links);
            var prev = getHATEOASReference('prev', data.links);
            var next = getHATEOASReference('next', data.links);
            var last = getHATEOASReference('last', data.links);
            var navHtml = '';
            navHtml += getNavCtrl(elementId + 'NavFirst', first, 'fa-fast-backward') + ' ';
            navHtml += getNavCtrl(elementId + 'NavPrev', prev, 'fa-chevron-left') + ' ';
            navHtml += (data.offset + 1) + ' - ' + Math.min((data.offset + data.limit), data.totalCount);
            navHtml += ' of ' + data.totalCount + ' ';
            navHtml += getNavCtrl(elementId + 'NavNext', next, 'fa-chevron-right') + ' ';
            navHtml += getNavCtrl(elementId + 'NavLast', last, 'fa-fast-forward');
            $('#' + elementId + 'Nav').html(navHtml);
            // Set onclick handler for navigation controls
            setNavClickHandler(elementId + 'NavFirst', first, elementId, modal, listImages);
            setNavClickHandler(elementId + 'NavPrev', prev, elementId, modal, listImages);
            setNavClickHandler(elementId + 'NavNext', next, elementId, modal, listImages);
            setNavClickHandler(elementId + 'NavLast', last, elementId, modal, listImages);
            // Set image list content
            var html = '<ul class="list-group">';
            var images = data.items;
            for (var i = 0; i < images.length; i++) {
                var img = images[i];
                let img_name = img.folder + img.name;
                if (img_name.startsWith('/')) {
                    img_name = img_name.substring(1);
                }
                html += '<a href="#" class="list-group-item" id="' + elementId + 'Img' + i + '">' +
                    '<i class="fa fa-picture-o" aria-hidden="true"></i>' +
                    '&nbsp;&nbsp;' + img_name + '</a>'
            }
            html += '</ul>';
            $('#' + elementId).html(html);
            // Set onclick handlers to display images
            for (var i = 0; i < images.length; i++) {
                var img = images[i];
                (function(elementId, imageIdx, filename, url, modal) {
                    $('#' + elementId + 'Img' + imageIdx).click(function(event) {
                        event.preventDefault();
                        modal.show(filename, url);
                    });
                })(elementId, i, img.name, getHATEOASReference('download', img.links), modal);
            }
        },
        error: function(xhr, status, error) {
            if (xhr.responseText) {
                var err = JSON.parse(xhr.responseText).message;
            }
            $('#' + elementId).html(showErrorMessageHtml(err));
        }

    });
};

function setNavClickHandler(elementId, url, targetElementId, modal, callbackFunc) {
    if (url) {
        (function(elementId, url, targetElementId, callbackFunc) {
            $('#' + elementId).click(function(event) {
                event.preventDefault();
                modal.clear();
                callbackFunc(targetElementId, url, modal);
            });
        })(elementId, url, targetElementId, callbackFunc);
    }
};
