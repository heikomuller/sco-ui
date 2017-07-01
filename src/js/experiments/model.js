var PredictiveModel = function(data) {
    this.id = data.id;
    this.name = data.name;
    // Add model description if defined in object properties
    this.description = null;
    for (let prop of data.properties) {
        if (prop.key === 'description') {
            this.description = prop.value;
        }
    }
    this.parameters = [];
    for (let p = 0; p < data.parameters.length; p++) {
        this.parameters.push(new ParameterDef(data.parameters[p]));
    }
};

PredictiveModel.prototype = {
    constructor : PredictiveModel
}
