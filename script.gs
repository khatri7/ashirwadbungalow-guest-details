var sheetName = "Sheet1";
var scriptProp = PropertiesService.getScriptProperties();

function intialSetup() {
	var activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
	scriptProp.setProperty("key", activeSpreadsheet.getId());
}

function doPost(e) {
	var idData = e.parameter.idFileContent;
	var idName = e.parameter.idFileName;
	var receiptData = e.parameter.receiptFileContent;
	var receiptName = e.parameter.receiptFileName;
	var lock = LockService.getScriptLock();
	lock.tryLock(10000);
	try {
		var idUrl = saveToDrive(idData, idName, "insert folder Id here");
		var receiptUrl = saveToDrive(
			receiptData,
			receiptName,
			"insert folder Id here"
		);
		recordData(e, idUrl, receiptUrl);
		return ContentService.createTextOutput(
			JSON.stringify({
				result: "success",
				data: JSON.stringify({ id: idUrl, receipt: receiptUrl }),
			})
		).setMimeType(ContentService.MimeType.JSON);
	} catch (e) {
		return ContentService.createTextOutput(
			JSON.stringify({ result: "error", error: e })
		).setMimeType(ContentService.MimeType.JSON);
	} finally {
		lock.releaseLock();
	}
}

function recordData(e, idUrl, receiptUrl) {
	try {
		var doc = SpreadsheetApp.openById(scriptProp.getProperty("key"));
		var sheet = doc.getSheetByName(sheetName);

		var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
		var nextRow = sheet.getLastRow() + 1;

		var row = [new Date()];
		for (var i = 1; i < headers.length; i++) {
			if (headers[i].length > 0 && headers[i] == "ID Image") {
				row.push(idUrl);
			} else if (headers[i].length > 0 && headers[i] == "Receipt") {
				row.push(receiptUrl);
			} else if (headers[i].length > 0) {
				row.push(e.parameter[headers[i]]);
			}
		}
		sheet.getRange(nextRow, 1, 1, row.length).setValues([row]);
	} catch (error) {
		Logger.log(error);
	} finally {
		return;
	}
}

function saveToDrive(data, filename, folderId) {
	var folder = DriveApp.getFolderById(folderId);
	var contentType = data.substring(5, data.indexOf(";")),
		bytes = Utilities.base64Decode(data.substr(data.indexOf("base64,") + 7)),
		blob = Utilities.newBlob(bytes, contentType, filename);
	var file = folder.createFile(blob);
	var fileUrl = file.getUrl();
	return fileUrl;
}
