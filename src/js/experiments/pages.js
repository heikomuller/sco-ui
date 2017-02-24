/**
 * Show content for experiments listing page.
 *
 * @param {API} api
 */
function showExperimentsPage(api) {
    sidebarSetActive($LI_EXPERIMENTS);
    showExperimentsHeadline(api);
    var html = '<div class="row"><div class="col-lg-12">';
    html += new Panel(
        'Experiments',
        '<div class="object-listing" id="experiment-listing"></div>',
        8,
        true
    ).html();
    var form = new CreateExperimentForm(api);
    html += new Panel(
        'New ...',
        '<p class="info">Create a new experiment. Each experiment has a name, ' +
        'subject, and image group associated with it. The detailed experiment ' +
        'description is optional. Functional data that has been collected for the ' +
        'experiment can be uploaded after the experiment has been created.</p>' +
        form.html(),
        4,
        true
    ).html();
    html += '</div></div>'
    $('#' + $EL_CONTENT).html(html);
    new ObjectListing(
        api.getExperimentsListAllUrl('runcount'),
        $EXPERIMENT_TABLE_DEF,
        api
    ).show('experiment-listing');
    form.show();
    return false;
};

function showCreateModelRunPage(experiment, api) {
    var col1Html = '<p class="attribute-label">Experiment</p>';
    col1Html += '<p class="attribute-value">' + experiment.name + '</p>';
    col1Html += '<p class="attribute-label">Name</p>';
    col1Html += '<div class="attribute-value">';
    col1Html += '<input id="txtRunName" type="text" class="form-control" placeholder="Name for Model Run">';
    col1Html += '</div>';
    col1Html += '<p class="attribute-label">Description</p>';
    col1Html += '<div class="attribute-value">';
    col1Html += '<input id="txtRunDescription" type="text" class="form-control" placeholder="Description for Model Run">';
    col1Html += '</div>';
    var col2Html = '<p class="attribute-label">Parameter</p>';
    col2Html += '<table class="options-form">';
    var parameter = [
        {'name' : 'gabor_orientations', 'default' : '8'},
        {'name' : 'max_eccentricity', 'default' : '12'},
        {'name' : 'normalized_pixels_per_degree', 'default' : ''}
    ];
    for (var i = 0; i < parameter.length; i++) {
        var para = parameter[i];
        col2Html += '<tr>';
        col2Html += '<td class="op-name">' + para.name + '</td>';
        col2Html += '<td class="op-ctrl">';
        col2Html += '<input id="' + para.name + '" type="text" class="form-control" placeholder="' + para.default + '">';
        col2Html += '</td>';
        col2Html += '</tr>';
    }
    col2Html += '</table>';
    col2Html += '<div class="button-row pull-right">';
    col2Html += '<button class="btn btn-primary" id="btnSubmitRun">Submit</button>';
    col2Html += '&nbsp;&nbsp;&nbsp;';
    col2Html += '<button class="btn btn-default" id="btnRunCancel">Cancel</button>';
    col2Html += '</div>';
    html = '<div class="row"><div class="col-lg-4">' + col1Html + '</div>' +
        '<div class="col-lg-4">' + col2Html + '</div>' +
        '<div class="col-lg-4">' +
        '</div>';
    // Display content
    sidebarSetActive('');
    showModelRunHeadline('New ...', experiment, api);
    $('#' + $EL_CONTENT).html(new Panel('Run Predictive Model', html).html());
    // Assign onclick handler
    (function(experiment, api) {
        $('#btnSubmitRun').click(function() {
            var name = $('#txtRunName').val().trim();
            if (!name) {
                alert('Please provide a new for the new model run.');
                return false;
            }
            var config = {'name' : name};
            var description = $('#txtRunDescription').val().trim();
            if (description) {
                config['properties'] = [{'key':'description', 'value':description}];
            }
            config['arguments'] = [];
            var parameter = ['gabor_orientations', 'max_eccentricity', 'normalized_pixels_per_degree'];
            for (var i = 0; i < parameter.length; i++) {
                var para = parameter[i];
                var val = $('#' + para).val().trim();
                if (val) {
                    config['arguments'].push({'name':para, 'value':val});
                }
            }
            $.ajax({
                url: getHATEOASReference('predictions.run', experiment.links),
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(config),
                success : function(data) {
                    showExperiment(getHATEOASReference('self', experiment.links), api);
                },
                error: function(xhr, status, error) {
                    if (xhr.responseText) {
                        var err = JSON.parse(xhr.responseText).message;
                    } else {
                        var err = 'There was an error deleting the ' + objtype;
                    }
                    alert(err);
                }
            });
        });
    })(experiment, api);
    (function(experiment, api) {
        $('#btnRunCancel').click(function() {
            showExperiment(getHATEOASReference('self', experiment.links), api);
        });
    })(experiment, api);
};

/**
 * Show information about a given experiment.
 *
 * @param {string} url
 * @param {API} api
 */
function showExperiment(url, api) {
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
                            showExperiment(url, api)
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
                            showExperiment(url, api)
                        }
                    )
                }
            );
            var col1Html = name.html();
            col1Html += description.html();
            col1Html += '<p class="attribute-label">Subject</p>';
            col1Html += '<p class="attribute-value"><a id="expSubjectRef" class="internal-link" href="#/">' + data.subject.name + '</a></p>';
            col1Html += '<p class="attribute-label">Images</p>';
            col1Html += '<p class="attribute-value"><a id="expImagesRef" class="internal-link" href="#/">' + data.images.name + '</a></p>';
            col1Html += '<p class="attribute-label">Functional Data</p>';
            if (data.fmri) {
                col1Html += '<p class="attribute-value">' + data.fmri.name + '</p>';
            }
            col1Html += '<div id="fMRIUploadPreview" style="display: none;">' +
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
                    '</div>' +
                '</div>' +
            '</div>';
            col1Html += '<div class="file-dropzone" id="fMriUploadForm"></div>';
            col1Html += '<div class="attribute-buttons">';
            if (data.fmri) {
                col1Html += '<a type="button" class="btn btn-xs btn-success" href="' + getHATEOASReference('download', data.fmri.links) + '"><i class="fa fa-download" aria-hidden="true"></i> Download</a>';
                col1Html += '&nbsp;&nbsp;&nbsp;';
                col1Html += '<button id="fMRIUploadFileSelect" class="btn btn-xs btn-warning fileinput-button"><i class="fa fa-upload" aria-hidden="true"></i> Replace</button>';
                col1Html += '&nbsp;&nbsp;&nbsp;';
                col1Html += '<button id="fMRIDelete" class="btn btn-xs btn-danger"><i class="fa fa-trash" aria-hidden="true"></i> Delete</button>';
            } else {
                col1Html += '<button id="fMRIUploadFileSelect" class="btn btn-xs btn-success fileinput-button"><i class="fa fa-upload" aria-hidden="true"></i> Upload</button>';
            }
            col1Html += '</div>';
            col1Html += showDefaultObjectButtonsHtml('deleteObj', 'closePanel');
            var col2Html = '<p class="attribute-label">Predictions</p>';
            col2Html += '<div class="object-listing" id="experimentRuns"></div>'
            col2Html += '<div class="button-row">';
            col2Html += '<button id="createRunBtn" class="btn btn-primary"><i class="fa fa-plus" aria-hidden="true"></i> New ...</button>';
            col2Html += '</div>';
            var html = '<div class="row"><div class="col-lg-4">' + col1Html + '</div>' +
                '<div class="col-lg-8">' + col2Html + '</div>';
            // Display content
            sidebarSetActive('');
            showExperimentHeadline(data.name, api);
            $('#' + $EL_CONTENT).html(new Panel('Experiment', html).html());
            new ObjectListing(
                getHATEOASReference('predictions.list', data.links) + '?limit=-1&properties=state',
                $EXPERIMENT_RUNS_TABLE_DEF,
                api
            ).show('experimentRuns');
            // fMRI upload form
            var dzone = new Dropzone('div#fMriUploadForm', {
                url: getHATEOASReference('fmri.upload', data.links),
                autoQueue: true,
	            maxFilesize: 1000,
                previewTemplate: document.getElementById('fMRIUploadPreview').innerHTML,
    		    clickable: '#fMRIUploadFileSelect'
    	  	});
            dzone.on('queuecomplete', function() {
                showExperiment(url, api);
            });
            // Set onclick handler for elements
            name.onclick();
            description.onclick();
            if (data.fmri) {
                (function(data, api) {
                    $('#fMRIDelete').click(function() {
                        var name = data.fmri.name;
                        var url = getHATEOASReference('delete', data.fmri.links);
                        var experimentUrl = getHATEOASReference('self', data.links);
                        deleteObject('functional data', name, url, function() {showExperiment(experimentUrl, api);});
                    });
                })(data, api);
            }
            (function(url, api) {
                $('#expSubjectRef').click(function() {
                    showSubject(url, api);
                });
            })(getHATEOASReference('self', data.subject.links), api);
            (function(url, api) {
                $('#expImagesRef').click(function() {
                    showImageGroup(url, api);
                });
            })(getHATEOASReference('self', data.images.links), api);
            (function(name, url) {
                $('#deleteObj').click(function() {
                    deleteObject('experiment', name, url, function() {showExperimentsPage(api);});
                });
            })(data.name, getHATEOASReference('delete', data.links), api);
            (function(api) {
                $('#closePanel').click(function() {
                    showExperimentsPage(api);
                });
            })(api);
            (function(experiment, api) {
                $('#createRunBtn').click(function() {
                    showCreateModelRunPage(experiment, api);
                });
            })(data, api);
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

/**
 * Show information about a given experiment.
 *
 * @param {string} url
 * @param {API} api
 */
function showModelRun(url, api) {
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
                            showModelRun(url, api)
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
                            showModelRun(url, api)
                        }
                    )
                }
            );
            var html = name.html();
            html += description.html();
            html += '<p class="attribute-label">State</p>';
            html += '<p class="attribute-value">' + data.state + '</p>';
            html += '<p class="attribute-label">Parameter</p>';
            html += '<table class="properties">';
            for (var i = 0; i < data.arguments.length; i++) {
                var arg = data.arguments[i];
                html += '<tr><td class="prop-name">' + arg.name + '</td><td class="prop-value">' + arg.value + '</td></tr>';
            }
            html += '</table>';
            html += '<p class="attribute-label">Schedule</p>';
            html += '<table class="properties">';
            if (data.schedule.createdAt) {
                html += '<tr><td class="prop-name">Created</td><td class="prop-value">' + new Date(data.schedule.createdAt).toLocaleString() + '</td></tr>';
            }
            if (data.schedule.startedAt) {
                html += '<tr><td class="prop-name">Started</td><td class="prop-value">' + new Date(data.schedule.startedAt).toLocaleString() + '</td></tr>';
            }
            if (data.schedule.finishedAt) {
                html += '<tr><td class="prop-name">Finished</td><td class="prop-value">' + new Date(data.schedule.finishedAt).toLocaleString() + '</td></tr>';
            }
            html += '</table>';
            //html += '<p class="attribute-value"><a id="expSubjectRef" class="internal-link" href="#/">' + data.subject.name + '</a></p>';
            if (data.state === 'SUCCESS') {
                html += showDownloadableObjectButtonsHtml('deleteObj', 'closePanel', getHATEOASReference('download', data.links));
            } else {
                html += showDefaultObjectButtonsHtml('deleteObj', 'closePanel');
            }
            var content = '';
            if (data.state === 'FAILED') {
                content = '<p class="attribute-label">Errors</p><pre>';
                for (var i = 0; i < data.errors.length; i++) {
                    content += data.errors[i];
                }
                content += '</pre>';
            }
            html = '<div class="row"><div class="col-lg-4">' + html + '</div>' +
                '<div class="col-lg-8">' + content + '</div>';
            // Display content
            sidebarSetActive('');
            showModelRunHeadline(data.name, data.experiment, api);
            $('#' + $EL_CONTENT).html(new Panel('Prediction', html).html());
            // Set onclick handlers
            name.onclick();
            description.onclick();
            (function(name, url) {
                $('#deleteObj').click(function() {
                    deleteObject(
                        'prediction',
                        name,
                        url,
                        function() {
                            showExperiment(getHATEOASReference('self', data.experiment.links), api);
                        }
                    );
                });
            })(data.name, getHATEOASReference('delete', data.links), api);
            (function(url, api) {
                $('#closePanel').click(function() {
                    showExperiment(url, api);
                });
            })(getHATEOASReference('self', data.experiment.links), api);
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
