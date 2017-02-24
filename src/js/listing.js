var ObjectListing = function(url, columns, api) {
    this.url = url;
    this.columns = columns;
    this.api = api;
}

ObjectListing.prototype = {
    constructor : ObjectListing,
    show : function(elementId) {
        $('#' + elementId).html(showSpinnerHtml());
        var self = this;
        $.ajax({
            url : self.url,
            type: 'GET',
            contentType: 'application/json',
            success: function(data) {
                var html = '<table class="table table-hover" id="tab-objects"><thead><tr>';
                for (var i = 0; i < self.columns.length; i++) {
                    var col = self.columns[i];
                    html += '<th>' + col.name + '</th>';
                }
                html += '</tr></thead><tbody>';
                for (var i = 0; i < data.items.length; i++) {
                    var item = data.items[i];
                    var row = '';
                    for (var j = 0; j < self.columns.length; j++) {
                        var col = self.columns[j];
                        if (col.converter) {
                            var text = col.converter(item[col.id]);
                        } else {
                            var text = item[col.id];
                        }
                        if (col.link) {
                            var link = col.link;
                            if (link.factory) {
                                text = '<a href="' + link.factory(item) + '" class="' + link.css + '">' + text + '</a>';
                            }
                        } else if (col.onclick) {
                            var link = col.onclick;
                            text = '<a href="#/" class="' + link.css + '" id="' + col.id + '-' + i + '">' + text + '</a>';
                        }
                        row += '<td>' + text + '</td>';
                    }
                    html += '<tr>' + row + '</tr>';
                }
                html += '</tbody></table>';
                $('#' + elementId).html(html);
                // Set onclick handlers
                for (var i = 0; i < data.items.length; i++) {
                    var item = data.items[i];
                    for (var j = 0; j < self.columns.length; j++) {
                        var col = self.columns[j];
                        if (col.onclick) {
                            (function(col, item, api) {
                                $('#' + col.id + '-' + i).click(function() {
                                    col.onclick.handler(item, api);
                                });
                            })(col, item, self.api);
                        }
                    }
                }
                $('#tab-objects').DataTable({
                    'searching' : false,
                    'lengthChange' : false
                });
            },
            error: function(xhr, status, error) {
                if (xhr.responseText) {
                    var err = JSON.parse(xhr.responseText).message;
                }
                $('#' + elementId).html(showErrorMessageHtml(err));
            }
        });
    }
}
