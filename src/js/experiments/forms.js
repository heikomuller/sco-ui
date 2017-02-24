var CreateExperimentForm = function(api) {
    this.api = api;
};

CreateExperimentForm.prototype = {
    constructor : CreateExperimentForm,
    html : function() {
        return '<div class="form-group">' +
        '<label for="txt-experiment-name">Name</label>' +
        '<input type="text" class="form-control" id="txt-experiment-name" placeholder="Short Name">' +
        '<br><label for="txt-experiment-desc">Description</label>' +
        '<input type="text" class="form-control" id="txt-experiment-desc" placeholder="Details about the experiment">' +
        '<br><label for="cbo-experiment-subject">Subject</label>' +
        '<select class="form-control" id="cbo-experiment-subject"></select>' +
        '<br><label for="txt-experiment-images">Images</label>' +
        '<select class="form-control" id="cbo-experiment-images"></select>' +
        '</div>' +
        '<button class="btn btn-primary" id="btn-submit-experiment-create">Submit</button>';
    },
    load : function(url, elementId) {
        $.ajax({
            url: url,
            type: 'GET',
            contentType: 'application/json',
            success: function(data) {
                var items = data.items;
                items.sort(function(i1, i2) {
                    if (i1.name < i2.name) {
                        return -1;
                    } else if (i1.name > i2.name) {
                        return 1;
                    } else {
                        return 0;
                    }
                });
                var html = '';
                for (var i = 0; i < items.length; i++) {
                    var item = items[i];
                    html += '<option value="' + item.id + '">' + item.name + '</option>';
                }
                $('#' + elementId).html(html);
            },
            error: function(xhr, status, error) {
                $('#' + elementId).html('<option value="">There was an error.</option>');
            }
        });
    },
    show : function() {
        this.load(this.api.getSubjectsListAllUrl(), 'cbo-experiment-subject');
        this.load(this.api.getImagesListAllUrl(), 'cbo-experiment-images');
        (function(form) {
            $('#btn-submit-experiment-create').click(function() {
                return form.submit(form.api);
            });
        })(this);
    },
    submit : function(api) {
        var name = $('#txt-experiment-name').val().trim();
        if (!name) {
            alert('Please provide a name for the experiment.');
            return false;
        }
        var description = $('#txt-experiment-desc').val().trim();
        var subject = $('#cbo-experiment-subject').val();
        if (!subject) {
            alert('No subject selected.');
            return false;
        }
        var images = $('#cbo-experiment-images').val();
        if (!images) {
            alert('No image group selected.');
            return false;
        }
        var experiment = {
            'subject' : subject,
            'images' : images,
            'properties' : [{
                'key' : 'name',
                'value' : name
            }]
        };
        if (description) {
            experiment.properties.push({
                'key' : 'description',
                'value': description
            });
        }
        $.ajax({
            url: api.getCreateExperimentUrl(),
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(experiment),
            success: function(data) {
                showExperiment(getHATEOASReference('self', data.links), api);
            },
            error : function(xhr, status, error) {
                if (xhr.responseText) {
                    alert(JSON.parse(xhr.responseText).message);
                } else {
                    alert('There was an error creating the experiment.');
                }

            }
        });
    }
};
