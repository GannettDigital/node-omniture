var util = require("util"),
		Client = require("./client");

var Report = function(username, sharedSecret, environment, options){
	this.defaultWaitTime = 5;
	this.waitTime = (options && options.waitTime) ? options.waitTime : this.defaultWaitTime
	this.init.apply(this,arguments);
}
util.inherits(Report, Client);

var p = Report.prototype;

/* We need a little bit different functionality for the Report request
 * We need to poll Omniture to see if our report has been generated and then
 * get the full report.
 * We"re going to use the call back from Client.request to poll set off the polling
 */
p.clientRequest = Client.prototype.request;
p.request = function(method, parameters, callback){
	var self = this;
	this.clientRequest(method, parameters, function(err, data){
		if(err){ callback(new Error(err.message)); }
		self.getQueuedReport(data.reportID, callback);
	});
}
p.getQueuedReport = function(reportId, callback){
	this.logger("info","Getting Queued Report");
	var self = this, // alias "this" for anonymous functions
			reportData = {"reportID": reportId};
	
	// we"re checking the status of the report
	this.sendRequest("Report.Get", reportData, function(err,data){
		if(err){
			callback(err, data);
		}else{
			var json = JSON.parse(data);
		
			// if the status is done or ready, then we can finally make the call
			// to get the actual data we want
			callback(null, json);
		}
	});
}

p.getReport = function(reportId, callback){
	var reportData = {"reportID" : reportId};
	this.logger("info","Getting Report: "+ reportId);
	// make request for data
	this.sendRequest("Report.GetReport", reportData, callback);
}

module.exports = Report;