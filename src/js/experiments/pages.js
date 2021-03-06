// Global variable containing the model that is currently being displayed
var model = null;

/**
 * Show content for experiments listing page.
 *
 * @param {API} api
 */
function showExperimentsPage(api, updateUrl) {
    sidebarSetActive($LI_EXPERIMENTS);
    showExperimentsHeadline(api);
    if (updateUrl) {
        setStateUrl([{key: 'experiments'}]);
    }
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
    // Reset the global model variable
    model = null;
    let modelsUrl = getHATEOASReference('models.list', api.data.links)
    $.ajax({
        url: modelsUrl,
        type: 'GET',
        contentType: 'application/json',
        success : function(data) {
            const models = data.items;
            /* COLUMN 1 */
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
            /* COLUMN 2 */
            var col2Html = '<p class="attribute-label">Model</p>';
            col2Html += '<div class="attribute-value">';
            col2Html += '<select class="form-control" id="cboModel">';
            for (var i = 0; i < models.length; i++) {
                var model = models[i];
                col2Html += '<option value="' + getHATEOASReference('self', model.links) + '">' + model.name + '</option>';
            }
            col2Html += '</select>';
            col2Html += '<p class="attribute-value" id="modelDescription"></p>';
            col2Html += '</div>';
            col2Html += '<p class="attribute-label">Parameter</p>';
            col2Html += '<div class="attribute-value" id="modelParameterSection"></div>';
            col2Html += '<div class="button-row pull-right">';
            col2Html += '<button class="btn btn-primary" id="btnSubmitRun">Submit</button>';
            col2Html += '&nbsp;&nbsp;&nbsp;';
            col2Html += '<button class="btn btn-default" id="btnRunCancel">Cancel</button>';
            col2Html += '</div>';
            html = '<div class="row"><div class="col-lg-4">' + col1Html + '</div>' +
                '<div class="col-lg-8">' + col2Html + '</div>';
            // Display content
            sidebarSetActive('');
            showModelRunHeadline('New ...', experiment, api);
            $('#' + $EL_CONTENT).html(new Panel('Run Predictive Model', html).html());
            // Assign onclick handler
            (function(experiment, api){
                $('#cboModel').change(function(){
                    showSelectedModelParameter(experiment, $('#cboModel').val());
                });
            })(experiment, models);
            (function(experiment, api) {
                $('#btnSubmitRun').click(function(event) {
                    event.preventDefault();
                    submitModelRun(experiment, api);
                });
            })(experiment, api);
            (function(experiment, api) {
                $('#btnRunCancel').click(function(event) {
                    event.preventDefault();
                    showExperiment(getHATEOASReference('self', experiment.links), api, true);
                });
            })(experiment, api);
            showSelectedModelParameter(experiment, getHATEOASReference('self', models[0].links));
        },
        error: function(xhr, status, error) {
            if (xhr.responseText) {
                var err = JSON.parse(xhr.responseText).message;
            } else {
                var err = 'There was an error creating the new run';
            }
            alert(err);
        }
    });
};

/**
 * Show information about a given experiment.
 *
 * @param {string} url
 * @param {API} api
 */
function showExperiment(url, api, updateUrl) {
    $('#' + $EL_CONTENT).html(showSpinnerHtml());
    $.ajax({
        url: url,
        type: 'GET',
        contentType: 'application/json',
        success: function(data) {
            if (updateUrl) {
                setStateUrl([{key: 'experiment', value: data.id}]);
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
                            showExperiment(url, api, false)
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
                            showExperiment(url, api, false)
                        }
                    )
                }
            );
            let readOnly = getBoolean('readOnly', data.properties);
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
            col1Html += showDefaultObjectButtonsHtml('deleteObj', 'closePanel', readOnly);
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
                showExperiment(url, api, false);
            });
            // Set onclick handler for elements
            name.onclick();
            description.onclick();
            if (data.fmri) {
                (function(data, api) {
                    $('#fMRIDelete').click(function(event) {
                        event.preventDefault();
                        var name = data.fmri.name;
                        var url = getHATEOASReference('delete', data.fmri.links);
                        var experimentUrl = getHATEOASReference('self', data.links);
                        deleteObject('functional data', name, url, function() {showExperiment(experimentUrl, api, false);});
                    });
                })(data, api);
            }
            (function(url, api) {
                $('#expSubjectRef').click(function(event) {
                    event.preventDefault();
                    showSubject(url, api, true);
                });
            })(getHATEOASReference('self', data.subject.links), api);
            (function(url, api) {
                $('#expImagesRef').click(function(event) {
                    event.preventDefault();
                    showImageGroup(url, api, true);
                });
            })(getHATEOASReference('self', data.images.links), api);
            if (!readOnly) {
                (function(name, url) {
                    $('#deleteObj').click(function(event) {
                        event.preventDefault();
                        deleteObject('experiment', name, url, function() {showExperimentsPage(api, true);});
                    });
                })(data.name, getHATEOASReference('delete', data.links), api);
            }
            (function(api) {
                $('#closePanel').click(function(event) {
                    event.preventDefault();
                    showExperimentsPage(api, true);
                });
            })(api);
            (function(experiment, api) {
                $('#createRunBtn').click(function(event) {
                    event.preventDefault();
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
function showModelRun(url, api, updateUrl) {
    $('#' + $EL_CONTENT).html(showSpinnerHtml());
    $.ajax({
        url: url,
        type: 'GET',
        contentType: 'application/json',
        success: function(data) {
            if (updateUrl) {
                setStateUrl([
                    {key: 'experiment', value: data.experiment.id},
                    {key: 'run', value: data.id}
                ]);
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
                            showModelRun(url, api, false)
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
                            showModelRun(url, api, false)
                        }
                    )
                }
            );
            let readOnly = getBoolean('readOnly', data.properties);
            let htmlCol1 = name.html();
            htmlCol1 += description.html();
            htmlCol1 += '<p class="attribute-label">State</p>';
            htmlCol1 += '<p class="attribute-value">' + data.state + '</p>';
            htmlCol1 += '<p class="attribute-label">Schedule</p>';
            htmlCol1 += '<table class="properties">';
            if (data.schedule.createdAt) {
                htmlCol1 += '<tr><td class="prop-name">Created</td><td class="prop-value">' + convertUTCDate2Local(data.schedule.createdAt) + '</td></tr>';
            }
            if (data.schedule.startedAt) {
                htmlCol1 += '<tr><td class="prop-name">Started</td><td class="prop-value">' + convertUTCDate2Local(data.schedule.startedAt) + '</td></tr>';
            }
            if (data.schedule.finishedAt) {
                htmlCol1 += '<tr><td class="prop-name">Finished</td><td class="prop-value">' + convertUTCDate2Local(data.schedule.finishedAt) + '</td></tr>';
            }
            htmlCol1 += '</table>';
            //html += '<p class="attribute-value"><a id="expSubjectRef" class="internal-link" href="#/">' + data.subject.name + '</a></p>';
            if (data.state === 'SUCCESS') {
                htmlCol1 += '<p class="attribute-label">Attachments</p>';
                if (data.attachments.length === 0) {
                    htmlCol1 += '<p class="attribute-value">None</p>';
                } else {
                    for (let i = 0; i < data.attachments.length; i++) {
                        const afile = data.attachments[i];
                        let alink = afile.id;
                        let aicon = 'file-o';
                        if (afile.mimeType === 'application/pdf') {
                            aicon = 'file-pdf-o';
                        } else if (afile.mimeType === 'text/csv') {
                            aicon = 'file-text-o'
                        }
                        const aUrl = getHATEOASReference('download', afile.links);
                        alink = '<a class="action-link" href="' + aUrl + '" target="_blank">' + alink + '</a>';
                        alink = '<span class="attachment-icon"><i class="fa fa-' + aicon + '"/></span>' + alink;
                        alink += ' (<span class="filesize">' + filesize(afile.filesize) + '</span>)';
                        htmlCol1 += '<p class="attachment">' + alink + '</p>';
                    }
                }
                htmlCol1 += showDownloadableObjectButtonsHtml(
                    'deleteObj',
                    'closePanel',
                    getHATEOASReference('download', data.links),
                    readOnly
                );
            } else {
                htmlCol1 += showDefaultObjectButtonsHtml('deleteObj', 'closePanel', readOnly);
            }
            const model = new PredictiveModel(data.model);
            let html = '';
            if (data.state === 'FAILED') {
                var content = '<p class="attribute-label">Errors</p><pre>';
                for (var i = 0; i < data.errors.length; i++) {
                    content += data.errors[i];
                }
                content += '</pre>';
                html = '<div class="row"><div class="col-lg-4">' + htmlCol1 + '</div>' +
                    '<div class="col-lg-8">' + content + '</div></div>';
            } else {
                /* COLUMN 2 */
                var htmlCol2 = '<p class="attribute-label">Model</p>';
                htmlCol2 += '<p class="attribute-value">' + model.name + '</p>';
                if (model.description) {
                    htmlCol2 += '<p class="attribute-value" id="modelDescription">';
                    htmlCol2 += model.description;
                    htmlCol2 += '</p>';
                }
                htmlCol2 += '<p class="attribute-label">Parameter</p>';
                htmlCol2 += '<table class="properties">';
                for (var i = 0; i < model.parameters.length; i++) {
                    var para = model.parameters[i];
                    htmlCol2 += '<tr>';
                    htmlCol2 += '<td class="op-name">' + para.htmlTitle('mrParaInfo' + i) + '</td>';
                    htmlCol2 += '<td class="op-value">' + para.htmlValue(data.arguments) + '</td>';
                    htmlCol2 += '</tr>';
                }
                htmlCol2 += '</table>';
                html = '<div class="row"><div class="col-lg-4">' + htmlCol1 + '</div>' +
                    '<div class="col-lg-8">' + htmlCol2 + '</div></div>';
            }
            /* Add model run analytics visualizations for successful model runs */
            if (data.state === 'SUCCESS') {
                var visWidgets = getModelRunWidgets(api, data);
                if (visWidgets.length > 0) {
                    html += '<div class="widgets">';
                    for (let i = 0; i < visWidgets.length; i++) {
                        html += visWidgets[i].html();
                    }
                    html += '</div>';
                }
            }
            var infoModal = new InfoModalForm('mrInfoModal');
            html += infoModal.html();
            // Display content
            sidebarSetActive('');
            showModelRunHeadline(data.name, data.experiment, api);
            $('#' + $EL_CONTENT).html(new Panel('Prediction', html).html());
            // Set onclick handlers
            name.onclick();
            description.onclick();
            if (!readOnly) {
                (function(name, url) {
                    $('#deleteObj').click(function(event) {
                        event.preventDefault();
                        deleteObject(
                            'prediction',
                            name,
                            url,
                            function() {
                                showExperiment(getHATEOASReference('self', data.experiment.links), api, true);
                            }
                        );
                    });
                })(data.name, getHATEOASReference('delete', data.links), api);
            }
            (function(url, api) {
                $('#closePanel').click(function(event) {
                    event.preventDefault();
                    showExperiment(url, api, true);
                });
            })(getHATEOASReference('self', data.experiment.links), api);
            for (var i = 0; i < model.parameters.length; i++) {
                var para = model.parameters[i];
                if (para.description !== '') {
                    (function(elementId, para, infoModal) {
                        $('#' + elementId).click(function(event) {
                            event.preventDefault();
                            infoModal.show(para.name, para.description);
                        });
                    })('mrParaInfo' + i, para, infoModal);
                }
            }
            /* Show visualizations for successfule model runs */
            if (data.state === 'SUCCESS') {
                for (let i = 0; i < visWidgets.length; i++) {
                    visWidgets[i].show();
                }
            }
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

function showSelectedModelParameter(experiment, modelUrl) {
    $('#modelParameterSection').html(showSpinnerHtml());
    $.ajax({
        url: modelUrl,
        type: 'GET',
        contentType: 'application/json',
        success: function(data) {
            model = new PredictiveModel(data);
            // Set model description (if present)
            if (model.description) {
                $('#modelDescription').html(model.description);
                $('#modelDescription').show();
            } else {
                $('#modelDescription').hide();
            }
            var html = '<table class="options-form">';
            for (let i = 0; i < model.parameters.length; i++) {
                var para = model.parameters[i];
                html += '<tr>';
                html += '<td class="op-name">' + para.htmlTitle('mpsOpInfo' + i) + '</td>';
                html += '<td class="op-ctrl">';
                html += para.htmlControl('mps' + para.id, []);
                html += '</td>';
                html += '</tr>';
            }
            html += '</table>';
            const infoModal = new InfoModalForm('mpsInfoModal');
            html += infoModal.html();
            $('#modelParameterSection').html(html);
            // Assign info button onclick handler
            for (let i = 0; i < model.parameters.length; i++) {
                let para = model.parameters[i];
                if (para.description !== '') {
                    (function(elementId, para, infoModal) {
                        $('#' + elementId).click(function(event) {
                            event.preventDefault();
                            infoModal.show(para.name, para.description);
                        });
                    })('mpsOpInfo' + i, para, infoModal);
                }
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

function submitModelRun(experiment, api) {
    let name = $('#txtRunName').val().trim();
    if (!name) {
        alert('Please provide a name for the new model run.');
        return false;
    }
    const config = {'name' : name};
    const description = $('#txtRunDescription').val().trim();
    if (description) {
        config['properties'] = [{'key':'description', 'value':description}];
    }
    if (!model) {
        alert('Please select a model to run.');
        return false;
    }
    config['model'] = model.id;
    config['arguments'] = [];
    for (var i = 0; i < model.parameters.length; i++) {
        var para = model.parameters[i];
        var value = para.controlValue('mps' + para.id);
        if (value !== '') {
            if (!para.isValid(value)) {
                alert('Invalid value for ' + para.name + ': \'' + value + '\' not of expected type \'' + para.type.name + '\'');
                return false;
            }
            config['arguments'].push({'name' : para.id, 'value' : value});
        }
    }
    $.ajax({
        url: getHATEOASReference('predictions.run', experiment.links),
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(config),
        success : function(data) {
            showExperiment(getHATEOASReference('self', experiment.links), api, true);
        },
        error: function(xhr, status, error) {
            if (xhr.responseText) {
                var err = JSON.parse(xhr.responseText).message;
            } else {
                var err = 'There was an error creating the new run';
            }
            alert(err);
        }
    });
}
