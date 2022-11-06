const settings = require("../settings.json");
const scriptEndpoint = settings.scriptConfig.endpoint;

document.onreadystatechange = function () {
	if (document.readyState !== "complete") {
		document.querySelector("body").style.visibility = "hidden";
		document.querySelector("#loader").style.visibility = "visible";
	} else {
		document.querySelector("#loader").style.display = "none";
		document.querySelector("body").style.visibility = "visible";
	}
};

var id = 1;

var date = new Date();
date.setHours(0, 0, 0, 0);
var nextDate = new Date();
var newNextDate;
var minDob = new Date();
var maxDob = new Date();
nextDate.setDate(new Date().getDate() + 1);
minDob.setFullYear(new Date().getFullYear() - 65);
maxDob.setFullYear(new Date().getFullYear() - 10);
var temp = new Date();
temp.setFullYear(new Date().getFullYear() + 1);

function dateString(dateObj) {
	var year = dateObj.getFullYear();
	var month = ("0" + (dateObj.getMonth() + 1)).slice(-2);
	var day = ("0" + dateObj.getDate()).slice(-2);
	var minDate = year + "-" + month + "-" + day;
	return minDate;
}

document.addEventListener("DOMContentLoaded", function () {
	var modal = document.getElementById("myModal");

	var span = document.getElementsByClassName("close")[0];
	span.onclick = function () {
		modal.style.display = "none";
	};

	var myForm = document.getElementById("guest-form");
	document.getElementById("fname").addEventListener("change", () => {
		document.getElementById("declaration-name").innerHTML =
			document.getElementById("fname").value + ", ";
	});
	document.getElementById("arrival-date").setAttribute("min", dateString(date));
	document
		.getElementById("departure-date")
		.setAttribute("min", dateString(nextDate));
	document
		.getElementById("arrival-date")
		.addEventListener("change", changeEventHandler);

	document
		.getElementById("primary-dob")
		.setAttribute("min", dateString(minDob));

	document
		.getElementById("primary-dob")
		.setAttribute("max", dateString(maxDob));

	document
		.getElementById("radio-indian")
		.addEventListener("change", setNationalityAsIndian);
	document
		.getElementById("radio-other")
		.addEventListener("change", setNationalityAsOther);

	document.getElementById("receipt-file").addEventListener("change", () => {
		document.getElementById("receipt-file-name").innerHTML =
			"<i class='far fa-check-circle'></i> <b>" +
			document.getElementById("receipt-file").files[0].name +
			"</b> has been uploaded successfully";
	});

	document.getElementById("declaration").addEventListener("change", () => {
		if (document.getElementById("declaration").checked) {
			document.getElementById("submit-form-button").disabled = false;
		} else {
			document.getElementById("submit-form-button").disabled = true;
		}
	});

	document.getElementById("proceed").addEventListener("click", submitForm);

	myForm.onsubmit = async (e) => {
		e.preventDefault();
		document.getElementById("warnings").innerHTML = "";
		if (errorField) {
			errorField.classList.remove("errorInput");
		}
		if (validateFormData()) {
			document.getElementById("modal-name").innerHTML =
				document.getElementById("fname").value;
			document.getElementById("modal-contact").innerHTML =
				"+91-" + document.getElementById("tel").value;
			document.getElementById("modal-email").innerHTML =
				document.getElementById("email").value;
			document.getElementById("modal-dob").innerHTML =
				document.getElementById("primary-dob").value;
			if (document.getElementById("radio-indian").checked) {
				document.getElementById("modal-nationality").innerHTML = "Indian";
				document.getElementById("id-key").innerHTML = "Aadhaar/PAN Number: ";
				document.getElementById("modal-id").innerHTML =
					document.getElementById("ap-number").value;
			} else {
				document.getElementById("modal-nationality").innerHTML =
					document.getElementById("nationality-input").value;
				document.getElementById("id-key").innerHTML = "Passport Number: ";
				document.getElementById("modal-id").innerHTML =
					document.getElementById("passport-number").value;
			}
			document.getElementById("modal-checkin").innerHTML =
				document.getElementById("arrival-date").value;
			document.getElementById("modal-checkout").innerHTML =
				document.getElementById("departure-date").value;
			document.getElementById("modal-amount").innerHTML =
				"&#8377;" + document.getElementById("amount").value;
			document.getElementById("modal-guests").innerHTML = id;
			modal.style.display = "block";
		}
	};
});

function sendWarning(msg) {
	document.getElementById("warnings").innerHTML +=
		'<i class="fas fa-exclamation-triangle"></i> ' + msg;
	window.scrollBy(0, 200);
}

var errorField;

function validateWithRegEx(field, regEx, msg) {
	if (!regEx.test(field.value)) {
		errorField = field;
		field.classList.add("errorInput");
		sendWarning(msg);
		return false;
	} else {
		return true;
	}
}

function validateFormData() {
	return (
		validateWithRegEx(
			document.getElementById("fname"),
			/^((\b[a-zA-Z]{2,40}\b)\s*){2,}$/g,
			"Please Enter a valid Full Name"
		) &&
		validateWithRegEx(
			document.getElementById("tel"),
			/^[6-9][0-9]{9}$/,
			"Please Enter a valid Contact Number"
		) &&
		validateWithRegEx(
			document.getElementById("email"),
			/^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
			"Please Enter a valid E-mail ID"
		) &&
		validateWithRegEx(
			document.getElementById("primary-dob"),
			/^(19|20)\d\d([- /.])(0[1-9]|1[012])\2(0[1-9]|[12][0-9]|3[01])$/,
			"Please Select a Valid Date"
		) &&
		verifyDate(
			document.getElementById("primary-dob"),
			minDob,
			maxDob,
			"Guests' age should be between 10 to 65 years"
		) &&
		(document.getElementById("radio-other").checked ||
		document.getElementById("radio-indian").checked
			? true
			: nationalityRadioUnselected()) &&
		(document.getElementById("radio-other").checked
			? validateOtherNationalityFields()
			: true) &&
		(document.getElementById("radio-indian").checked
			? validateIndianNationalityFields()
			: true) &&
		validateWithRegEx(
			document.getElementById("arrival-date"),
			/^(19|20)\d\d([- /.])(0[1-9]|1[012])\2(0[1-9]|[12][0-9]|3[01])$/,
			"Please Select a Valid Check-In Date"
		) &&
		verifyDate(
			document.getElementById("arrival-date"),
			date,
			temp,
			"Please Select a Valid Check-In Date"
		) &&
		validateWithRegEx(
			document.getElementById("departure-date"),
			/^(19|20)\d\d([- /.])(0[1-9]|1[012])\2(0[1-9]|[12][0-9]|3[01])$/,
			"Please Select a Valid Check-Out Date"
		) &&
		verifyDate(
			document.getElementById("departure-date"),
			newNextDate ? newNextDate : nextDate,
			temp,
			"Please Select a Valid Check-Out Date"
		) &&
		validateWithRegEx(
			document.getElementById("amount"),
			/^[1-9]{1}[0-9]{0,4}$/g,
			"Please Enter a Valid Amount"
		) &&
		receiptFileValidation() &&
		validateWithRegEx(
			document.getElementById("traveling-from-textarea"),
			/^[A-Za-z0-9'\.\-\s\,\/\\]+$/g,
			"Please Enter a Valid Origin Address"
		) &&
		validateWithRegEx(
			document.getElementById("traveling-from-pincode"),
			/^[1-9]{1}[0-9]{5}$/g,
			"Please Enter a Valid Pincode"
		) &&
		validateAdditionalGuests()
	);
}

function validateAdditionalGuests() {
	if (id == 1) return true;
	else {
		for (let i = 2; i <= id; i++) {
			if (
				!validateWithRegEx(
					document.getElementById(`guest-${i}-name`),
					/^((\b[a-zA-Z]{2,40}\b)\s*){1,}$/g,
					"Please Enter a Valid Name"
				)
			) {
				return false;
			}
			if (
				!validateWithRegEx(
					document.getElementById(`guest-${i}-dob`),
					/^(19|20)\d\d([- /.])(0[1-9]|1[012])\2(0[1-9]|[12][0-9]|3[01])$/,
					"Please Select a Valid Date"
				)
			) {
				return false;
			}
			if (
				!verifyDate(
					document.getElementById(`guest-${i}-dob`),
					minDob,
					maxDob,
					"Guests' age should be between 10 to 65 years"
				)
			) {
				return false;
			}
			if (
				!validateWithRegEx(
					document.getElementById(`guest-${i}-from`),
					/^[A-Za-z0-9'\.\-\s\,\/\\]+$/g,
					"Please Enter a Valid Origin Location"
				)
			) {
				return false;
			}
		}
		return true;
	}
}

function receiptFileValidation() {
	if (document.getElementById("receipt-file").files.length == 0) {
		sendWarning("Please upload Payment receipt");
		return false;
	} else if (document.getElementById("receipt-file").files.length > 1) {
		sendWarning("Please upload only one file of Payment receipt");
		return false;
	} else return true;
}

function validateOtherNationalityFields() {
	if (
		!validateWithRegEx(
			document.getElementById("nationality-input"),
			/^((\b[a-zA-Z]{2,40}\b)\s*){1,}$/g,
			"Please Enter a valid Nationality"
		)
	)
		return false;
	else if (
		!validateWithRegEx(
			document.getElementById("passport-number"),
			/^[a-zA-Z0-9]+$/g,
			"Please Enter a valid Passport Number"
		)
	)
		return false;
	else if (document.getElementById("id-image").files.length == 0) {
		sendWarning("Please upload Image of Passport Front Page");
		return false;
	} else if (document.getElementById("id-image").files.length > 1) {
		sendWarning("Please upload only one image of Passport Front Page");
		return false;
	} else return true;
}

function validateIndianNationalityFields() {
	if (
		!validateWithRegEx(
			document.getElementById("ap-number"),
			/^[a-zA-Z0-9]{10,12}$/g,
			"Please Enter a valid Aadhaar/PAN Number"
		)
	)
		return false;
	else if (document.getElementById("id-image").files.length == 0) {
		sendWarning("Please upload Image of the Aadhaar/PAN Card");
		return false;
	} else if (document.getElementById("id-image").files.length > 1) {
		sendWarning("Please upload only one image of Aadhaar/PAN Card");
		return false;
	} else return true;
}

function verifyDate(obj, min, max, msg) {
	var objDate = new Date(
		obj.value.substring(0, 4),
		obj.value.substring(5, 7) - 1,
		obj.value.substring(8, 10)
	);
	if (objDate >= min && objDate <= max) {
		return true;
	} else {
		errorField = obj;
		obj.classList.add("errorInput");
		sendWarning(msg);
		return false;
	}
}

function nationalityRadioUnselected() {
	sendWarning("Please select Nationality");
	return false;
}

function changeEventHandler() {
	var arr = document.getElementById("arrival-date").value;
	var arrDateObj = new Date(
		arr.substring(0, 4),
		arr.substring(5, 7) - 1,
		arr.substring(8, 10)
	);
	var dep = document.getElementById("departure-date").value;
	var depDateObj = new Date(
		dep.substring(0, 4),
		dep.substring(5, 7) - 1,
		dep.substring(8, 10)
	);
	newNextDate = new Date(arrDateObj);
	newNextDate.setDate(newNextDate.getDate() + 1);
	if (arrDateObj >= depDateObj) {
		document.getElementById("departure-date").value = "";
	}
	document
		.getElementById("departure-date")
		.setAttribute("min", dateString(newNextDate));
}

async function setNationalityAsOther() {
	if (document.getElementById("radio-other").checked) {
		document.getElementById("nationality-inputs").innerHTML =
			'<label for="nationality-input">Nationality </label><input type="text" id="nationality-input"/><br /><label for="passport-number">Passport Number </label><input type="text" id="passport-number" name="Passport Number"/><br />' +
			'<label for="id-image">Please Upload Image of Passport front page </label>' +
			'<label class="custom-file-upload"><input type="file" id="id-image" accept="image/*"/><i class="fa fa-cloud-upload"></i> Click Here to Upload Image </label>' +
			'<span id="id-file-name" class="file-name"></span><br />';
	}
	document.getElementById("nationality-inputs").classList.add("add-to-dom");
	await sleep(800);
	document.getElementById("nationality-inputs").classList.remove("add-to-dom");
	document.getElementById("id-image").addEventListener("change", () => {
		document.getElementById("id-file-name").innerHTML =
			"<i class='far fa-check-circle'></i> <b>" +
			document.getElementById("id-image").files[0].name +
			"</b> has been uploaded successfully";
	});
}

async function setNationalityAsIndian() {
	if (document.getElementById("radio-indian").checked) {
		document.getElementById("nationality-inputs").innerHTML =
			'<label for="ap-number">Aadhaar/PAN Number </label>' +
			'<input type="text" id="ap-number" name="Aadhar/PAN Number" minlength="10" maxlength="12"/><br />' +
			'<label for="id-image">Please Upload Image of the document mentioned above</label>' +
			'<label class="custom-file-upload"><input type="file" id="id-image" accept="image/*"/><i class="fa fa-cloud-upload"></i> Click Here to Upload Image </label>' +
			'<span id="id-file-name" class="file-name"></span><br />';
	}
	document.getElementById("nationality-inputs").classList.add("add-to-dom");
	await sleep(800);
	document.getElementById("nationality-inputs").classList.remove("add-to-dom");
	document.getElementById("id-image").addEventListener("change", () => {
		document.getElementById("id-file-name").innerHTML =
			"<i class='far fa-check-circle'></i> <b>" +
			document.getElementById("id-image").files[0].name +
			"</b> has been uploaded successfully";
	});
}

function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

async function removeGuest() {
	if (id >= 2) {
		document.getElementById("guest" + id).classList.add("remove-from-dom");
		await sleep(800);
		document.getElementById("guest" + id).remove();
		id -= 1;

		document
			.getElementById("add-guest-button")
			.classList.add("slide-button-up");
		document
			.getElementById("remove-guest-button")
			.classList.add("slide-button-up");
		window.scrollBy(0, -266);
		await sleep(1000);
		document
			.getElementById("add-guest-button")
			.classList.remove("slide-button-up");
		document
			.getElementById("remove-guest-button")
			.classList.remove("slide-button-up");

		if (id == 1) {
			document
				.getElementById("remove-guest-button")
				.classList.add("element-disappear");
			await sleep(295);
			document.getElementById("remove-guest-button").innerHTML = "";
			document
				.getElementById("remove-guest-button")
				.classList.remove("element-disappear");
		}
		if (id == 14) {
			document.getElementById("add-guest-button").innerHTML =
				'<button type="button" class="guest-buttons" onclick="addGuest()"><i class="fas fa-user-plus"></i> Add Guest</button><br />';
		}
	}
}

async function addGuest() {
	if (id <= 14) {
		id += 1;

		var node = document.createElement("div");
		node.setAttribute("id", "guest" + id);
		node.setAttribute("class", "additional-guest");

		var nameTextNode = document.createTextNode(`Name of Guest ${id}`);
		var nameInputNode = document.createElement("input");
		nameInputNode.setAttribute("type", "text");
		nameInputNode.setAttribute("id", "guest-" + id + "-name");

		node.appendChild(nameTextNode);
		node.appendChild(nameInputNode);

		var ageTextNode = document.createTextNode("Guest Date of Birth");
		var ageInputNode = document.createElement("input");
		ageInputNode.setAttribute("type", "date");
		ageInputNode.setAttribute("min", dateString(minDob));
		ageInputNode.setAttribute("max", dateString(maxDob));
		ageInputNode.setAttribute("id", "guest-" + id + "-dob");
		ageInputNode.setAttribute("onkeydown", "return false");

		node.appendChild(ageTextNode);
		node.appendChild(ageInputNode);

		var locationTextNode = document.createTextNode("Traveling From ");
		var locationInputNode = document.createElement("input");
		locationInputNode.setAttribute("type", "text");
		locationInputNode.setAttribute("id", "guest-" + id + "-from");

		node.appendChild(locationTextNode);
		node.appendChild(locationInputNode);

		document.getElementById("add-guest").appendChild(node);
		if (id != 15) {
			document.getElementById("guest" + id).innerHTML += "<hr />";
		}

		document
			.getElementById("add-guest-button")
			.classList.add("slide-button-down");
		document
			.getElementById("remove-guest-button")
			.classList.add("slide-button-down");
		window.scrollBy(0, 266);
		await sleep(1000);
		document
			.getElementById("add-guest-button")
			.classList.remove("slide-button-down");
		document
			.getElementById("remove-guest-button")
			.classList.remove("slide-button-down");

		if (id == 2) {
			document.getElementById("remove-guest-button").innerHTML =
				'<button type="button" class="guest-buttons" onclick="removeGuest()"><i class="fas fa-user-minus"></i> Remove Guest</button><br />';
		}
		if (id == 15) {
			document
				.getElementById("add-guest-button")
				.classList.add("element-disappear");
			await sleep(295);
			document.getElementById("add-guest-button").innerHTML = "";
			document
				.getElementById("add-guest-button")
				.classList.remove("element-disappear");
		}
	}
}

function readFileAsync(file) {
	return new Promise((resolve, reject) => {
		let reader = new FileReader();
		reader.onload = () => {
			resolve(reader.result);
		};
		reader.onerror = reject;
		reader.readAsDataURL(file);
	});
}

async function submitFormTest() {
	document.getElementById("modal-proceed").innerHTML =
		'<div class="stage" style="align-self: center; margin: 10px auto;"><div class="dot-pulse"></div></div>';
	await sleep(5000);
	document.getElementById("myModal").style.display = "none";
	document.getElementById("guest-form-div").innerHTML =
		'<div class="success-div" style="margin: 20px auto" ><svg style="align-self:center;" viewBox="0 0 26 26" xmlns="http://www.w3.org/2000/svg">' +
		'<g stroke="currentColor" stroke-width="2" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round">' +
		'<path class="circle" d="M13 1C6.372583 1 1 6.372583 1 13s5.372583 12 12 12 12-5.372583 12-12S19.627417 1 13 1z"/>' +
		'<path class="tick" d="M6.5 13.5L10 17 l8.808621-8.308621"/>' +
		"</g>" +
		"</svg><h2 style='text-align: center; font-weight: 200; margin-bottom: 0px'>Thank You!</h2> <h2 style='text-align: center; font-weight: 200; margin-top: 0px; font-size: 20px;'>Your Response has been successfully recorded!</h2><a style='align-self: center' href='http://ashirwadbungalowpanchgani.com/'><button style='width: 180px; margin-bottom: 0; font-size: 16px;' class='submit-button'>Visit Ashirwad Bungalow Website</button></a></div>";
}

async function submitForm() {
	var myForm = document.getElementById("guest-form");
	var formData = new FormData(myForm);
	document
		.getElementById("submit-form-button")
		.setAttribute("disabled", "true");
	var idFile = document.getElementById("id-image").files[0];
	var receiptFile = document.getElementById("receipt-file").files[0];
	formData.append("idFileName", document.getElementById("fname").value);
	formData.append("receiptFileName", document.getElementById("fname").value);
	let idContent = await readFileAsync(idFile);
	let receiptContent = await readFileAsync(receiptFile);
	formData.append("idFileContent", idContent);
	formData.append("receiptFileContent", receiptContent);
	if (document.getElementById("radio-indian").checked) {
		formData.append("Nationality", "Indian");
	} else if (document.getElementById("radio-other").checked) {
		formData.append(
			"Nationality",
			document.getElementById("nationality-input").value
		);
	}
	formData.append(
		"Traveling From",
		document.getElementById("traveling-from-textarea").value +
			"\n" +
			document.getElementById("traveling-from-pincode").value
	);
	formData.append("Total Guests", id);
	for (i = 2; i <= id; i++) {
		formData.append(
			"Guest " + i,
			document.getElementById("guest-" + i + "-name").value +
				"\n" +
				document.getElementById("guest-" + i + "-dob").value +
				"\n" +
				document.getElementById("guest-" + i + "-from").value
		);
	}
	document.getElementById("modal-proceed").innerHTML =
		'<div class="stage" style="align-self: center; margin: 10px auto;"><div class="dot-pulse"></div></div>';
	let response = await fetch(scriptEndpoint, {
		method: "POST",
		body: formData,
	});
	let result = await response.json();
	document.getElementById("myModal").style.display = "none";
	if (result.result == "success") {
		document.getElementById("guest-form-div").innerHTML =
			'<div class="success-div" style="margin: 20px auto" ><svg style="align-self:center;" viewBox="0 0 26 26" xmlns="http://www.w3.org/2000/svg">' +
			'<g stroke="currentColor" stroke-width="2" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round">' +
			'<path class="circle" d="M13 1C6.372583 1 1 6.372583 1 13s5.372583 12 12 12 12-5.372583 12-12S19.627417 1 13 1z"/>' +
			'<path class="tick" d="M6.5 13.5L10 17 l8.808621-8.308621"/>' +
			"</g>" +
			"</svg><h2 style='text-align: center; font-weight: 200; margin-bottom: 0px'>Thank You!</h2> <h2 style='text-align: center; font-weight: 200; margin-top: 0px; font-size: 20px;'>Your Response has been successfully recorded!</h2><a style='align-self: center' href='http://ashirwadbungalowpanchgani.com/' target='_blank'><button style='width: 180px; margin-bottom: 0; font-size: 16px;' class='submit-button visit-ashirwad'>Visit Ashirwad Bungalow Website</button></a></div>";
	} else {
		window.alert(
			"There was an error submitting your response, please try again. If the issue still persists, please contact the owner"
		);
	}
}
