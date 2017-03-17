/**
 * Generate and display a file upload form using Dropzone.js
 *
 * @param {string} elementId
 */
var FileUploadForm = function(elementId) {
    /**
     * Prefix for form element id's
     */
    this.elementId = elementId;
};

FileUploadForm.prototype = {
    constructor: FileUploadForm,
    actionButtons : function(elementId) {
        return '<div class="button-row" id="' + elementId + '">' +
            '<button class="btn btn-success fileinput-button">' +
                '<i class="fa fa-plus"></i> ' +
                '<span>Add files...</span>' +
            '</button>&nbsp;&nbsp;&nbsp;' +
            '<button class="btn btn-warning" id="' + elementId + 'Cancel">' +
                '<i class="fa fa-ban"></i> ' +
                '<span>Clear all</span>' +
            '</button>' +
        '</div>';
    },
    html : function() {
        return this.previewTemplate(this.elementId + 'Template') +
            '<div class="file-dropzone" id="' + this.elementId + '"></div>' +
            this.actionButtons(this.elementId + 'Actions');
    },
    /**
     * Get preview template Html for upload form. The template will have the
     * given identifier.
     */
    previewTemplate : function(elementId) {
        return '<div id="' + elementId + '" style="display: none;">' +
            '<div class="table table-striped" class="files" id="previews">' +
                '<div id="template" class="file-row">' +
                    '<div><span class="preview"><img data-dz-thumbnail /></span></div>' +
        		    '<div>' +
        		        '<p class="name" data-dz-name></p>' +
        		        '<strong class="error text-danger" data-dz-errormessage></strong>' +
        		    '</div>' +
        		    '<div>' +
        		        '<p class="size" data-dz-size></p>' +
        				'<div class="progress progress-striped active" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">' +
        		              '<div class="progress-bar progress-bar-success" style="width:0%;" data-dz-uploadprogress></div>' +
        		        '</div>' +
        		    '</div>' +
        		    '<div>' +
                        '<button class="btn btn-primary start">' +
                            '<i class="fa fa-upload"></i> ' +
                            '<span>Start</span>' +
                        '</button>&nbsp;&nbsp;&nbsp;' +
                        '<button data-dz-remove class="btn btn-danger delete">' +
                            '<i class="fa fa-trash"></i> ' +
                            '<span>Delete</span>' +
                        '</button>' +
                    '</div>' +
                '</div>' +
            '</div>' +
        '</div>';
    },
    show : function(url, api, completeCallback) {
        var dzone = new Dropzone('div#' + this.elementId, {
            url: url,
            autoQueue: false,
    		maxFilesize: 1000,
    		thumbnailWidth: 80,
    	    thumbnailHeight: 80,
    		previewTemplate: document.getElementById(this.elementId + 'Template').innerHTML,
    		clickable: '#' + this.elementId + 'Actions .fileinput-button', // Define the element that should be used as click trigger to select files.
    	  	accept: function(file, done) {
	  			if ((!file.name.endsWith('.tar')) && (!file.name.endsWith('.tgz')) && (!file.name.endsWith('.tar.gz'))) {
	                done("Invalid file format.");
				} else {
	                done();
                }
    	  	}
        });
        dzone.on("addedfile", function(file) {
            file.previewElement.querySelector(".start").onclick = function() { dzone.enqueueFile(file); };
        });
        dzone.on('queuecomplete', function() {
            completeCallback(api);
        });
        (function(elementId, dzone) {
            $('#' + elementId).click(function() {
                dzone.removeAllFiles(true);
            });
        })(this.elementId + 'ActionsCancel', dzone);
    }
};

/**
 * An editable attribute.
 */
var EditableAttribute = function(elementId, title, value, update) {
    this.elementId = elementId;
    this.title = title;
    this.value = value;
    /**
     * Update value function. Takes care of update and page refresh.
     */
    this.update = update;
}

EditableAttribute.prototype = {
    constructor: EditableAttribute,
    html : function() {
        var html = '<p class="attribute-label">' + this.title;
        // Edit icon
        html += ' <a href="#/" class="action-link" id="' + this.elementId + 'Edit">' +
            '<i class="fa fa-pencil-square-o" aria-hidden="true"></i>' +
            '</a>';
        html += '</p><div class="attribute-value" id="' + this.elementId + '">' +
            '<p class="attribute-value">';
        if (this.value === '') {
            html += '&nbsp;';
        } else {
            html += this.value;
        }
        html += '</p></div>';
        return html;
    },
    /**
     * Assign Show edit form function to on click event of edit icon.
     */
    onclick : function() {
        var html = '<div class="attribute-form">';
        html += '<input id="' + this.elementId + 'Text" type="text" class="form-control" value="' + this.value + '">';
        html += showButtonRowHtml(this.elementId);
        (function(attr, html) {
            $('#' + attr.elementId + 'Edit').click(function() {
                $('#' + attr.elementId).html(html);
                // Set onclick handler for save button
                (function(attr) {
                    $('#' + attr.elementId + 'BtnSave').click(function() {
                        var value =  $('#' + attr.elementId + 'Text').val().trim();
                        attr.update(value);
                    });
                })(attr);
                // Set onclick handler for close button
                (function(attr) {
                    $('#' + attr.elementId + 'BtnClose').click(function() {
                        var html = '<p class="attribute-value">';
                        if (attr.value === '') {
                            html += '&nbsp;';
                        } else {
                            html += attr.value;
                        }
                        html += '</p>';
                        $('#' + attr.elementId).html(html);
                    });
                })(attr);
            });
        })(this, html);
    }
};

var InfoModalForm = function(elementId) {
    this.elementId = elementId;
};

InfoModalForm.prototype = {
    constructor : InfoModalForm,
    html : function() {
        return '<div class="modal fade" tabindex="-1" id="' + this.elementId + '" role="dialog">' +
          '<div class="modal-dialog modal-lg" role="document">' +
            '<div class="modal-content">' +
              '<div class="modal-header header-info">' +
                '<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
                '<h4 class="modal-title info-title" id="' + this.elementId + 'Title"></h4>' +
              '</div>' +
              '<div class="modal-body" id="' + this.elementId + 'Body">' +
              '</div>' +
              '<div class="modal-footer">' +
                '<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>';
    },
    show : function(title, content) {
        $('#' + this.elementId + 'Title').html(title);
        $('#' + this.elementId + 'Body').html('<pre>' + content + '</pre>');
        $('#' + this.elementId).modal('show');
    }
};

var OptionsForm = function(elementId, title, values, def, infoModal, update) {
    this.elementId = elementId;
    this.title = title,
    this.values = values;
    this.def = def;
    this.infoModal = infoModal;
    this.update = update;
};

OptionsForm.prototype = {
    constructor : OptionsForm,
    assignInfoButtonsOnClickHandler : function(elementId) {
        for (var i = 0; i < this.def.length; i++) {
            var op = this.def[i];
            if (op.description !== '') {
                (function(elementId, op, infoModal) {
                    $('#' + elementId).click(function() {
                        infoModal.show(op.name, op.description);
                    });
                })(elementId + i, op, this.infoModal);
            }
        }
    },
    html : function () {
        var html = '<p class="attribute-label">' + this.title;
        // Edit icon
        html += ' <a href="#/" class="action-link" id="' + this.elementId + 'Edit">' +
            '<i class="fa fa-pencil-square-o" aria-hidden="true"></i>' +
            '</a>';
        html += '</p><div class="attribute-value" id="' + this.elementId + '">';
        html += this.table();
        html += '</div>';
        return html;
    },
    onclick : function() {
        var html = '<table class="options-form">';
        for (var i = 0; i < this.def.length; i++) {
            var op = this.def[i];
            html += '<tr>';
            html += '<td class="op-name">' + op.htmlTitle(this.elementId + 'OpEditInfo' + i) + '</td>';
            html += '<td class="op-ctrl">';
            html += op.htmlControl(this.elementId + op.id, this.values);
            html += '</td>';
            html += '</tr>';
        }
        html += '</table>';
        html += showButtonRowHtml(this.elementId);
        (function(form, html) {
            $('#' + form.elementId + 'Edit').click(function() {
                $('#' + form.elementId).html(html);
                // Set onclick handler for save button
                (function(form) {
                    $('#' + form.elementId + 'BtnSave').click(function() {
                        var values =  [];
                        for (var i = 0; i < form.def.length; i++) {
                            var op = form.def[i];
                            var ctrlId = form.elementId + op.id;
                            var value = op.controlValue(ctrlId);
                            if (value !== '') {
                                if (!op.isValid(value)) {
                                    alert('Invalid value for ' + op.name + ': \'' + value + '\' not of expected type \'' + op.type.name + '\'');
                                    return false;
                                }
                                values.push({'name' : op.id, 'value' : value});
                            }
                        }
                        form.update(values);
                    });
                })(form);
                form.assignInfoButtonsOnClickHandler(form.elementId + 'OpEditInfo');
                // Set onclick handler for close button
                (function(form) {
                    $('#' + form.elementId + 'BtnClose').click(function() {
                        $('#' + form.elementId).html(form.table());
                        form.assignInfoButtonsOnClickHandler(form.elementId + 'OpInfo');
                    });
                })(form);
            });
        })(this, html);
        this.assignInfoButtonsOnClickHandler(this.elementId + 'OpInfo');
    },
    table : function() {
        var html = '<table class="options">';
        for (var i = 0; i < this.def.length; i++) {
            var op = this.def[i];
            html += '<tr>';
            html += '<td class="op-name">' + op.htmlTitle(this.elementId + 'OpInfo' + i) + '</td>';
            html += '<td class="op-value">' + op.htmlValue(this.values) + '</td>';
            html += '</tr>';
        }
        html += '</table>';
        return html;
    }
};


function showButtonRowHtml(elementId) {
    var html = '<div class="button-row">';
    html += '<button class="btn btn-primary" id="' + elementId + 'BtnSave">Save</button>';
    html += '&nbsp;&nbsp;&nbsp;';
    html += '<button class="btn btn-default" id="' + elementId + 'BtnClose">Close</button>';
    html += '</div>';
    return html;
};
