//Get elements
const incDecButton = document.getElementById("incDecButton");
const unitOptions = document.getElementById("units");
const numConvert = document.getElementById("numConversions");
const numConvertDisplay = document.getElementById("numConversionsDisplay");
const outDisplay = document.getElementById("outputDisplay");
const valueIn = document.getElementById("numberin");
const unitIn = document.getElementById("unitin");

var inc = true;
var unitSizes = new Map();
var unitTypes = new Map();
var typeUnits = new Map();
var formalNames = new Map();
var plural = new Map();

//console.log(incDecButton);

//Events
incDecButton.addEventListener("click", () => {
	inc = !inc;
	if (inc) {
		incDecButton.innerText = "increase";
	} else {
		incDecButton.innerText = "decrease";
	}
	//console.log(inc);
	updateResult();
});

function updateResult() {
	numConvertDisplay.innerText = parseInt(numConvert.value) + 1;
	if (unitSizes.has(unitIn.value)) {
		unitIn.classList.remove("error")
		var route = findIncDecRoutes(unitIn.value, parseFloat(valueIn.value), inc, numConvert.value);

		outDisplay.innerHTML = "";
		for (var i = 0; i < route.length; i++) {
			var unit = document.createElement("p");
			unit.classList.add("result");
			unit.innerHTML = 
				route[i][0] + " " + 
				((route[i][0] == 1) ? route[i][1] : plural.get(route[i][1])) + " (<span class=\"" + 
				((route[i][2] >= 0) ? "positive" : "negative") + "\">" +
				((route[i][2] >= 0) ? "+" : "") + route[i][2] + "%</span>)";

			outDisplay.appendChild(unit);

			if ((i + 1) < route.length) {
				var arrowDiv = document.createElement("div");
				arrowDiv.classList.add("centered");

				var arrow = document.createElement("img");
				arrow.src = "imgs/arrow.png";
				arrow.width = 30;
				arrow.classList.add("unitArrow");
				arrowDiv.appendChild(arrow);
				outDisplay.appendChild(arrowDiv);
			}
			//console.log(route[i]);
		}
	} else {
		unitIn.classList.add("error")
	}
}

numConvert.addEventListener("input", updateResult);
valueIn.addEventListener("input", () => {
	if (valueIn.value != "") {
		updateResult();
	}
});
unitIn.addEventListener("input", updateResult);

function convert(a, b, init) {
	var sa = unitSizes.get(a);
	var sb = unitSizes.get(b);
	return init * sa/sb;
}

function utility(x) {
	if (x == 0) {
		return 0;
	}
	return Math.round(x)/x;
}

function findIncDecRoutes(init, initValue, inc, length) {
	var initialType = unitTypes.get(init);
	var validConversions = typeUnits.get(initialType);

	var currUnit = formalNames.get(init);
	var currValue = initValue;
	var unitHistory = [[currValue, currUnit, '0.00']];

	//if (initValue == 0) {
	//	return [[currValue, currUnit, '0.00'], [currValue, currUnit, '0.00']];
	//}
	for (var i = 0; i < length; i++) {
		var bestConversion = "";
		if (inc) {
			var bestMult = -1;
		} else {
			var bestMult = 1000000000;
		}
		for (var j = 0; j < validConversions.length; j++) {
			if (validConversions[j] == currUnit) {
				continue;
			}
			var newUtility = utility(convert(currUnit, validConversions[j], currValue));
			if (((newUtility > bestMult) == inc) && (newUtility > 0)) {
				bestConversion = validConversions[j];
				bestMult = newUtility;
			}
			//console.log(validConversions[j]);
		}

		if (bestConversion == "") {
			if (validConversions[0] != currUnit) {
				bestConversion = validConversions[0];
				var bestMult = 0;
			} else {
				bestConversion = validConversions[1];
				var bestMult = 0;
			}
		}

		var newValue = Math.round(convert(currUnit, bestConversion, currValue));
		var newUnit = bestConversion;
		var foundUnit = false;
		for (var j = 0; j < unitHistory.length; j++) {
			if (unitHistory[j][0] != newValue) {
				continue;
			}
			if (unitHistory[j][1] != newUnit) {
				continue;
			}
			foundUnit = true;
			break;
		}
		if (foundUnit) {
			break;
		}
		currValue = newValue;
		currUnit = newUnit;
		unitHistory.push([currValue, currUnit, (0.01*Math.round(10000*(bestMult-1))).toFixed(2)]);
		//console.log(currValue, currUnit);
	}
	bestMult = utility(convert(currUnit, init, currValue));
	currValue = Math.round(convert(currUnit, init, currValue));
	currUnit = formalNames.get(init);
	unitHistory.push([currValue, currUnit, (0.01*Math.round(10000*(bestMult-1))).toFixed(2)]);

	finalOut = [];
	for (var i = 0; i < unitHistory.length; i++) {
		finalOut.push(unitHistory[i]);
		if ((unitHistory[i][0] == unitHistory[unitHistory.length - 1][0]) && 
			(unitHistory[i][1] == unitHistory[unitHistory.length - 1][1])) {
			break;
		}
	}

	if (finalOut.length == 1) {
		finalOut.push([initValue, currUnit, '0.00']);
	}

	return finalOut;
}

/*
fetch("configs/units.yaml")
	.then(response => response.text())
	.then(text => {
		const units = jsyaml.loadAll(text);
		console.log(units);
	});
*/

var text = `---
internalNameSingular: "meter"
internalNamePlural: "meters"
SIconversion: 1
unitType: "length"

abbreviations:
  - "meter"
  - "meters"
  - "m"

---
internalNameSingular: "kilometer"
internalNamePlural: "kilometers"
SIconversion: 1000
unitType: "length"

abbreviations:
  - "kilometer"
  - "kilometers"
  - "km"

---
internalNameSingular: "centimeter"
internalNamePlural: "centimeters"
SIconversion: 0.01
unitType: "length"

abbreviations:
  - "centimeter"
  - "centimeters"
  - "cm"

---
internalNameSingular: "foot"
internalNamePlural: "feet"
SIconversion: 0.3048
unitType: "length"

abbreviations:
  - "foot"
  - "feet"
  - "ft"

---
internalNameSingular: "fathom"
internalNamePlural: "fathoms"
SIconversion: 1.8288
unitType: "length"

abbreviations:
  - "fathom"
  - "fathoms"
  - "ftm"

---
internalNameSingular: "inch"
internalNamePlural: "inches"
SIconversion: 0.0254
unitType: "length"

abbreviations:
  - "inch"
  - "inches"
  - "in"

---
internalNameSingular: "thou"
internalNamePlural: "thou"
SIconversion: 0.0000254
unitType: "length"

abbreviations:
  - "mil"
  - "mils"
  - "thou"

---
internalNameSingular: "yard"
internalNamePlural: "yards"
SIconversion: 0.9144
unitType: "length"

abbreviations:
  - "yard"
  - "yards"
  - "yd"

---
internalNameSingular: "mile"
internalNamePlural: "miles"
SIconversion: 1609.344
unitType: "length"

abbreviations:
  - "mile"
  - "miles"
  - "mi"

---
internalNameSingular: "kilogram"
internalNamePlural: "kilograms"
SIconversion: 1
unitType: "mass"

abbreviations:
  - "kilogram"
  - "kilograms"
  - "kg"`;

const units = jsyaml.loadAll(text);
//console.log(units);

for (var i = 0; i < units.length; i++) {
	if (typeUnits.has(units[i].unitType)) {
		typeUnits.get(units[i].unitType).push(units[i].internalNameSingular);
	} else {
		typeUnits.set(units[i].unitType, [units[i].internalNameSingular]);
	}

 	for (var j = 0; j < units[i].abbreviations.length; j++) {
 		var option = document.createElement('option');
 		option.value = units[i].abbreviations[j];
 		unitOptions.appendChild(option);

 		unitSizes.set(units[i].abbreviations[j], units[i].SIconversion);
 		unitTypes.set(units[i].abbreviations[j], units[i].unitType);
 		formalNames.set(units[i].abbreviations[j], units[i].internalNameSingular);
 		plural.set(units[i].abbreviations[j], units[i].internalNamePlural);
 	}
}

console.log(typeUnits);

updateResult();