// ==UserScript==
// @name         Auth Login Helper - Credentials
// @namespace    https://github.com/
// @version      3.0.2
// @description  TIMESAVER
// @author       Duane Matthew Hipwell
// @match        */auth-login-stub/gg-sign-in*
// @updateURL    https://github.com/TheDeadlyPianist/TamperMonkeyScripts/blob/main/authLoginHelperCreds.user.js
// @downloadURL  https://github.com/TheDeadlyPianist/TamperMonkeyScripts/blob/main/authLoginHelperCreds.user.js
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_listValues
// @grant        GM_info
// @grant        GM_addElement
// @require      http://code.jquery.com/jquery-3.4.1.min.js
// ==/UserScript==

var captureIconUrl = "https://cdn-icons-png.flaticon.com/512/685/685661.png"
var newProfileIconUrl = "https://www.seekpng.com/png/full/132-1328947_icon-new-folder-new-folder-icon-png.png"
var overwriteIconUrl = "https://cdn.icon-icons.com/icons2/2248/PNG/512/file_replace_icon_136634.png"
var heartIconUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Love_Heart_symbol.svg/512px-Love_Heart_symbol.svg.png"

var selectedUser;
var selectedUserGroup;

/////////////////////////////////////// Messages ///////////////////////////////////////////
var appVersion = GM_info.script.version;
var appTitle = "Auth Login Helper - Credentials v" + appVersion;

var captureFormData = "Capture form data"
var overwriteFormData = "Overwrite last selected user"

var saveUserHeader = "Save New User"
var newProfileText = "Create a new user group"
var userGroupLabel = "User Group"
var userLabel = "New User Name"
var userSaveButton = "Save new user"
/////////////////////////////////////// Field Selectors ////////////////////////////////////
var sel_credId = "#authorityId"
var sel_gatewayToken = "#gatewayToken"

var sel_credStrength = "#credentialStrength"
var sel_confidenceLevel = "#confidenceLevel"
var sel_affinityGroup = "#affinityGroupSelect"
var sel_usersName = "#usersName"
var sel_email = "#email"
var sel_role = "#credential-role-select"

var sel_accessToken = "#accessToken"
var sel_refreshToken = "#refreshToken"
var sel_oAuthToken = "#idToken"

var sel_scpProfileUrl = "#profile"
var sel_scpGroupProfileUrl = "#groupProfile"
var sel_scpEmailVerified = "#emailVerified"

var sel_nino = "#nino"
var sel_groupIdentifier = "#groupIdentifier"
var sel_agentId = "#agentId"
var sel_agentCode = "#agentCode"
var sel_agentFriendlyName = "#agentFriendlyName"
var sel_unreadMessageCount = "#unreadMessageCount"
var sel_sessionId = "#sessionId"
var sel_deviceId = "#deviceId"

var sel_enrolmentTable = "#js-enrolments-table"
var sel_addEnrolmentButton = "#js-add-enrolment"

var sel_delegatedEnrolmentsTable = "#js-delegated-enrolments-table"
var sel_addDelegatedEnrolmentButton = "#js-add-delegated-enrolment"

var sel_itmpGivenName = "#itmp\\.givenName"
var sel_itmpMiddleName = "#itmp\\.middleName"
var sel_itmpFamilyName = "#itmp\\.familyName"
var sel_itmpDOB = "#itmp\\.dateOfBirth"

var sel_addressLine1 = "#addressLine1"
var sel_addressLine2 = "#addressLine2"
var sel_addressLine3 = "#addressLine3"
var sel_addressLine4 = "#addressLine4"
var sel_addressLine5 = "#addressLine5"
var sel_addressPostCode = "#addressPostCode"
var sel_addressCountryName = "#addressCountryName"
var sel_addressCountryCode = "#addressCountryCode"

const optionalFields = [
    sel_credId, sel_gatewayToken, sel_usersName, sel_accessToken, sel_refreshToken, sel_oAuthToken, sel_scpProfileUrl, sel_scpGroupProfileUrl, sel_nino, sel_groupIdentifier,
    sel_agentId, sel_agentCode, sel_agentFriendlyName, sel_unreadMessageCount, sel_sessionId, sel_deviceId, sel_itmpGivenName, sel_itmpMiddleName, sel_itmpFamilyName, sel_itmpDOB,
    sel_addressLine1, sel_addressLine2, sel_addressLine3, sel_addressLine4, sel_addressLine5, sel_addressPostCode, sel_addressCountryName, sel_addressCountryCode
];
/////////////////////////////////////// Storage Constants //////////////////////////////////
var USER_GROUPS = "user_groups"
var USERS = "users"
var FAVOURITES = "favourites"

/////////////////////////////////////// Data Storage ///////////////////////////////////////
function getUsers() {
    return GM_getValue(USERS, []);
}

function saveUser(userData) {
    console.log("Attempting to save new User: " + userData.name);

    var users = getUsers();

    var exists = false;

    users.forEach(function (element) {
        if(element.name == userData.name && element.group == userData.group) {
            exists = true;
            window.alert("This user already exists inside this group.\nIf you are trying to overwrite this user, please use the overwrite option.");
            return;
        }
    })

    if(!exists) {
        users.push(userData);

        GM_setValue(USERS, users);
        $(".newUserScreen").remove();
    }
}

function deleteUser(userName, userGroup) {
    var users = getUsers();

    var index = -1;

    users.forEach(function (user, userIndex) {
        if(user.name == userName && user.group == userGroup) {
            index = userIndex;
        }
    });

    if(index > -1) {
        users.splice(index, 1);
        GM_setValue(USERS, users);
        removeFavourite(userName);
    }
}

function overwriteUser(userName, userGroup, newData) {
    var users = getUsers().map(user => {
        if(user.name == userName && user.group == userGroup) {
            user.data = newData;
            return user;
        } else {
            return user;
        }
    });

    GM_setValue(USERS, users);
    location.reload();
}

function getUserGroups() {
    return GM_getValue(USER_GROUPS, []);
}

function saveUserGroup(groupName) {
    console.log("Attempting to save new User Group: " + groupName);

    var groups = getUserGroups();

    if(groups.includes(groupName)) {
        window.alert("This group already exists");
    } else {
        groups.push(groupName);
    }

    GM_setValue(USER_GROUPS, groups.sort());
}

function deleteUserGroup(groupName) {
    var users = getUsers();

    var filteredUsers = users.filter(function (user) {
        return user.group != groupName
    });

    GM_setValue(USERS, filteredUsers);

    var userGroups = getUserGroups();

    var index = userGroups.indexOf(groupName);
    if(index > -1) {
        userGroups.splice(index, 1);
    }

    GM_setValue(USER_GROUPS, userGroups.sort());
}

function convertGroupNameToId(groupName) {
    return "group_row_" + groupName.replace(/\s/g, "X");
}

function getFavourites() {
    return GM_getValue(FAVOURITES, [])
}

function toggleFavourite(name, group) {
    var favourites = getFavourites();

    var index = -1;
    favourites.forEach((fav, favIndex) => {
        if(fav.name == name && fav.group == group) {
            index = favIndex;
        }
    });

    if(index > -1) {
        favourites.splice(index, 1);
    } else {
        favourites.push({
            name: name,
            group: group
        });
    }

    GM_setValue(FAVOURITES, favourites.sort());
}

function removeFavourite(name, group) {
    var favourites = getFavourites();

    var index = -1;

    favourites.forEach((fav, favIndex) => {
        if(fav.name == name && fav.group == group) {
            index = favIndex;
        }
    })

    if(index > -1) {
        favourites.splice(index, 1);
    }

    GM_setValue(FAVOURITES, favourites.sort());
}

/////////////////////////////////////// Data Capture ///////////////////////////////////////
// Helper Functions

function extractTextFieldData(selector) {
    var value = $(selector).val()
    //console.log("Extracting field data from selector: " + selector + "\nFound value: " + value)
    return value;
}

function selectorToField(selector) {
    return selector.substring(1);
}

function addFieldAndValueToObject(object, field, value) {
    if(value && value != "") {
        object[field] = value;
    }
}

function addFieldAndValueToObjectFromSelector(object, selector) {
    var value = extractTextFieldData(selector);

    if(value && value != "" && value != "N/A") {
        object[selectorToField(selector)] = value;
    }
}

// Object Construction

function captureCredentialsSection() {
    var credObject = {
        addField: function(selector) { addFieldAndValueToObjectFromSelector(this, selector); }
    }

    credObject.addField(sel_credId);
    credObject.addField(sel_gatewayToken);
    credObject.addField(sel_credStrength);
    credObject.addField(sel_confidenceLevel);
    credObject.addField(sel_affinityGroup);
    credObject.addField(sel_usersName);
    credObject.addField(sel_email);
    credObject.addField(sel_role);

    delete credObject.addField;

    return credObject;
}

function captureOAuthSection() {
    var oAuthObject = {
        addField: function(selector) { addFieldAndValueToObjectFromSelector(this, selector); }
    }

    oAuthObject.addField(sel_accessToken);
    oAuthObject.addField(sel_refreshToken);
    oAuthObject.addField(sel_oAuthToken);

    delete oAuthObject.addField;

    return oAuthObject;
}

function captureScpSection() {
    var scpObject = {
        addField: function(selector) { addFieldAndValueToObjectFromSelector(this, selector); }
    }

    scpObject.addField(sel_scpProfileUrl);
    scpObject.addField(sel_scpGroupProfileUrl);
    scpObject.addField(sel_scpEmailVerified);

    delete scpObject.addField;

    return scpObject;
}

function captureMiscSection() {
    var miscObject = {
        addField: function(selector) { addFieldAndValueToObjectFromSelector(this, selector); }
    }

    miscObject.addField(sel_nino);
    miscObject.addField(sel_groupIdentifier);
    miscObject.addField(sel_agentId);
    miscObject.addField(sel_agentCode);
    miscObject.addField(sel_agentFriendlyName);
    miscObject.addField(sel_unreadMessageCount);
    miscObject.addField(sel_sessionId);
    miscObject.addField(sel_deviceId);

    delete miscObject.addField;

    return miscObject;
}

function captureItmpSection() {
    var itmpObject = {
        addField: function(field, value) { addFieldAndValueToObject(this, field, value); }
    }

    itmpObject.addField("itmp.givenName", extractTextFieldData(sel_itmpGivenName));
    itmpObject.addField("itmp.middleName", extractTextFieldData(sel_itmpMiddleName));
    itmpObject.addField("itmp.familyName", extractTextFieldData(sel_itmpFamilyName));
    itmpObject.addField("itmp.dateOfBirth", extractTextFieldData(sel_itmpDOB));

    delete itmpObject.addField;

    return itmpObject;
}

function captureAddressSection() {
    var addressObject = {
        addField: function(selector) { addFieldAndValueToObjectFromSelector(this, selector); }
    }

    addressObject.addField(sel_addressLine1);
    addressObject.addField(sel_addressLine2);
    addressObject.addField(sel_addressLine3);
    addressObject.addField(sel_addressLine4);
    addressObject.addField(sel_addressLine5);
    addressObject.addField(sel_addressPostCode);
    addressObject.addField(sel_addressCountryName);
    addressObject.addField(sel_addressCountryCode);

    delete addressObject.addField;

    return addressObject;
}

function captureEnrolment(row, isDelegated) {
    var enrolmentObject = {
        enrolmentKey: "",
        identifiers: []
    }

    var columns = row.cells

    var enrolmentKey = columns[0].querySelector("input").value;

    if(enrolmentKey && enrolmentKey != "") {
        enrolmentObject.enrolmentKey = enrolmentKey;

        var identifierNamesHtml = columns[1].querySelectorAll("input");
        var identifierNames = []

        for(var i = 0; i < identifierNamesHtml.length; i++) {
            identifierNames.push(identifierNamesHtml[i].value);
        }

        var identifierValuesHtml = columns[2].querySelectorAll("input");
        var identifierValues = []

        for(var j = 0; j < identifierValuesHtml.length; j++) {
            identifierValues.push(identifierValuesHtml[j].value);
        }

        var identifiers = []

        for(var k = 0; k < identifierNames.length; k++) {
            if(identifierNames[k] && identifierNames[k] != "" && identifierValues[k] && identifierValues[k] != "") {
                var identifier = {
                    name: identifierNames[k],
                    identifierValue: identifierValues[k]
                }
                identifiers.push(identifier);
            }
        }

        enrolmentObject.identifiers = identifiers;

        var finalColumnSelector = "select";
        if(isDelegated) { finalColumnSelector = "input"; }

        var enrolmentStatus = columns[5].querySelector(finalColumnSelector).value;

        if(enrolmentStatus && enrolmentStatus != "") {
            if(isDelegated) {
                enrolmentObject.authRule = enrolmentStatus;
            } else {
                enrolmentObject.status = enrolmentStatus;
            }
        }

        return enrolmentObject;
    }
}

function captureEnrolments() {
    var rowsHtml = $("#js-enrolments-table > tbody").children();
    var enrolments = [];

    for(var i = 1; i < rowsHtml.length; i++) {
        var enrolment = captureEnrolment(rowsHtml[i], false);
        if(enrolment) {
            enrolments.push(enrolment);
        }
    }

    return enrolments;
}

function captureDelegatedEnrolments() {
    var rowsHtml = $("#js-delegated-enrolments-table > tbody");

    if(rowsHtml && rowsHtml.children().length > 1) {
        console.log("Found delegated enrolments fields.");
        var children = rowsHtml.children();
        var enrolments = []

        for(var i = 1; i < children.length; i++) {
            var delegatedEnrolment = captureEnrolment(children[i], true);
            enrolments.push(delegatedEnrolment);
        }

        return enrolments;
    } else {
        console.log("There are no delegated enrolments.");
    }
}

function captureForm() {
    var captureObject = {
        addField: function (field, value) { if(value && Object.keys(value).length != 0) { this[field] = value } }
    }

    captureObject.addField("creds", captureCredentialsSection())
    captureObject.addField("oAuth", captureOAuthSection())
    captureObject.addField("scp", captureScpSection())
    captureObject.addField("misc", captureMiscSection())
    captureObject.addField("itmp", captureItmpSection())
    captureObject.addField("address", captureAddressSection())

    var enrolments = captureEnrolments();

    if(enrolments && enrolments.length > 0) {
        captureObject.addField("enrolments", enrolments);
    }

    if(captureObject.creds.affinityGroupSelect == "Agent") {
        var delegatedEnrolments = captureDelegatedEnrolments();
        if(delegatedEnrolments && delegatedEnrolments.length > 0) {
            captureObject.addField("delegatedEnrolments", delegatedEnrolments);
        }
    }

    delete captureObject.addField;

    return captureObject;
}

/////////////////////////////////////// Data Population ////////////////////////////////////
function populateBasicData(data) {
    if(data) {
        $.each(data, (key, value) => {
            $("#" + key.replace(".", "\\.")).val(value);
        });
    }
}

function defaultDropDowns() {
    $(sel_credStrength).val("strong");
    $(sel_confidenceLevel).val("50");
    $(sel_affinityGroup).val("Individual");
    $(sel_role).val("User");
}

function clearEnrolment(row, isDelegated, rowIndex) {
    var columns = row.cells

    $(columns[0].querySelector("input")).val("");

    var identifierNamesHtml = columns[1].querySelectorAll("input");

    for(var i = 0; i < identifierNamesHtml.length; i++) {
        $(identifierNamesHtml[i]).val("");
    }

    var identifierValuesHtml = columns[2].querySelectorAll("input");

    for(var j = 0; j < identifierValuesHtml.length; j++) {
        $(identifierValuesHtml[j]).val("");
    }

    var identifierCount = identifierNamesHtml.length;

    while(identifierCount != 1) {
        removeTaxIdentifier(rowIndex);
        identifierCount--;
    }

    var finalColumnSelector = "select";
    if(isDelegated) { finalColumnSelector = "input"; }

    if(isDelegated) {
        $(columns[5].querySelector(finalColumnSelector)).val("");
    } else {
        $(columns[5].querySelector(finalColumnSelector)).val("Activated");
    }
}

function clearEnrolments() {
    var rowsHtml = $("#js-enrolments-table > tbody").children();

    for(var i = 1; i < rowsHtml.length; i++) {
        clearEnrolment(rowsHtml[i], false, i-1);
    }
}

function enterEnrolmentData(row, isDelegated, rowIndex, enrolmentData) {
    var columns = row.cells

    $(columns[0].querySelector("input")).val(enrolmentData.enrolmentKey);

    var identifierNamesHtml = columns[1].querySelectorAll("input");

    var identifierCount = identifierNamesHtml.length;

    while(identifierCount < enrolmentData.identifiers.length) {
        identifierCount++;
        if(isDelegated) {
            var id = "#add-delegated-ident-btn-" + rowIndex
            $(id).click();
        } else {
            addTaxIdentifier(rowIndex);
        }
    }

    identifierNamesHtml = columns[1].querySelectorAll("input");

    for(var i = 0; i < identifierNamesHtml.length; i++) {
        $(identifierNamesHtml[i]).val(enrolmentData.identifiers[i].name);
    }

    var identifierValuesHtml = columns[2].querySelectorAll("input");

    for(var j = 0; j < identifierValuesHtml.length; j++) {
        $(identifierValuesHtml[j]).val(enrolmentData.identifiers[j].identifierValue);
    }

    var finalColumnSelector = "select";
    if(isDelegated) { finalColumnSelector = "input"; }

    if(isDelegated) {
        $(columns[5].querySelector(finalColumnSelector)).val(enrolmentData.authRule);
    } else {
        $(columns[5].querySelector(finalColumnSelector)).val(enrolmentData.status);
    }
}

function enterEnrolmentsData(enrolmentsData) {
    if(enrolmentsData) {
        var rowsHtml = $("#js-enrolments-table > tbody").children();

        const enrolmentCount = enrolmentsData.length;
        var rowCount = rowsHtml.length - 1;

        while(rowCount < enrolmentCount) {
            rowCount++;
            addEnrolment();
        }

        rowsHtml = $("#js-enrolments-table > tbody").children();

        enrolmentsData.forEach((value, index) => {
            enterEnrolmentData(rowsHtml[index+1], false, index, value);
        });
    }
}

function enterDelegatedEnrolmentData(enrolmentsData) {
    if(enrolmentsData) {
        var rowsHtml = $("#js-delegated-enrolments-table > tbody").children();
        var rowsToRemove = rowsHtml.length - 1;

        while(rowsToRemove > 0) {
            rowsToRemove--;
            removeDelegatedEnrolment();
        }

        enrolmentsData.forEach(() => {
            addDelegatedEnrolment();
        })

        rowsHtml = $("#js-delegated-enrolments-table > tbody").children();

        enrolmentsData.forEach((value, index) => {
            enterEnrolmentData(rowsHtml[index+1], true, index, value);
        });
    }
}

function populateForm (user) {
    clearEnrolments();

    optionalFields.forEach((value) => {
        $(value).val("");
    })

    defaultDropDowns();

    console.log("Populating " + user.name);

    var userData = user.data;

    populateBasicData(userData.creds);

    showDelegatedEnrolmentIfAgentSelected();
    hideAssistantOptionIfIndividualSelected();

    populateBasicData(userData.oAuth);
    populateBasicData(userData.scp);
    populateBasicData(userData.misc);
    populateBasicData(userData.itmp);
    populateBasicData(userData.address);

    enterEnrolmentsData(userData.enrolments);
    if(userData.creds.affinityGroupSelect == "Agent") {
        enterDelegatedEnrolmentData(userData.delegatedEnrolments);
    }
}

/////////////////////////////////////// Frontend Code //////////////////////////////////////

function generateStyles() {
    var menuIconCss = `

.menu_icon {
  display: inline-block;
}

.bar1, .bar2, .bar3 {
  width: 35px;
  height: 5px;
  background-color: white;
  margin: 6px 0;
  transition: 0.5s;
}

.change .bar1 {
  -webkit-transform: rotate(-45deg) translate(-9px, 6px);
  transform: rotate(-45deg) translate(-9px, 6px);
}

.change .bar2 {opacity: 0;}

.change .bar3 {
  -webkit-transform: rotate(45deg) translate(-8px, -8px);
  transform: rotate(45deg) translate(-8px, -8px);
}`

    $('style').append(menuIconCss)
    $('style').append(`
        .sidebar {
            position: fixed;
            display: flex;
            width: 50%;
            height: 100%;
            background: white;
            box-sizing: border-box;
            border-right: 5px solid black;
            z-index: 1000;
            transform: translate(-90%, 0);
            -webkit-transform: translater(-90%, 0);
            flex-direction: column;
            user-select: none;
            transition-duration: 0.5s;
          }

          .shown {
            -webkit-transform: translater(0, 0);
            transform: translate(0, 0);
            transition-duration: 0.5s;
          }

          .sidebar_row {
            width: 100%;
            height: 7%;
            border-bottom: 2px solid black;
            display: flex;
            flex-direction: row;
            background-color: LightGreen;
            font-size: 1.5em;
          }

          .sidebar_header {
            background-color: Green;
            color: White;
            font-size: 1.8em;
          }

          .row_text {
            width: 90%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            font-weight: bold;
          }

          .icon_container {
            width: 10%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            transition-duration: 0.1s;
          }

          .capture_row:not(.unselectable):hover {
            background-color: LightSeaGreen;
            transition-duration: 0.2s;
          }

          .basic_icon {
            width: 60%;
            height: 60%;
            background-size: contain;
            background-repeat: no-repeat;
          }

          .heart_icon {
            opacity: 0.4;
          }

          .favourited {
            opacity: 1;
          }

          .users_root_container {
            height: 72%;
            width: 100%;
            display: flex;
            flex-direction: row;
          }

          .user_profiles_container {
            height: 100%;
            width: 90%;
            display: flex;
            flex-direction: column;
            border-right: 4px solid black;
          }

          .user_profiles_fav {
            height: 100%;
            width: 10%;
            display: flex;
            flex-direction: column;
          }

          .selectable {
            cursor: pointer;
          }

          .unselectable {
            cursor: default;
            background-color: grey;
          }

          .close {
            position: absolute;
            right: 32px;
            top: 32px;
            width: 32px;
            height: 32px;
            opacity: 0.7;
          }

          .close:hover {
            opacity: 1;
          }

          .close:before, .close:after {
            position: absolute;
            left: 15px;
            content: ' ';
            height: 33px;
            width: 2px;
            background-color: white;
          }

          .close:before {
            transform: rotate(45deg);
          }

          .close:after {
            transform: rotate(-45deg);
          }

          .newUserScreen {
            display: flex;
            flex-direction: column;
            width: 100%;
            height: 100%;
            position: fixed;
            z-index: 2000;
            background-color: rgba(0, 0, 0, 0.7);
            user-select: none;
          }

          .close_row {
            display: flex;
            flex-direction: row-reverse;
            width: 100%;
            height: 10%;
          }

          .new_user_entry_container {
            width: 100%;
            height: 60%;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
          }

          .new_user_entry_header {
            width: 80%;
            height: 20%;
            background-color: green;
            border: 4px solid black;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 2em;
          }

          .new_user_entry_body {
            width: 80%;
            height: 40%;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: LightGreen;
            border: 4px solid black;
            border-top: 0;
            flex-direction: column;
          }

          .user_group_row {
            width: 100%;
            height: 40%;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .user_group_select_label {
            font-size: 1.5em;
            padding-right: 1%;
          }

          .user_group_select {
            width: 50%;
            font-size: 1.5em;
            color: black;
          }

          .user_group_name_row {
            width: 100%;
            height: 40%;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: row;
          }

          .user_group_save_row {
            width: 100%;
            height: 20%;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: row;
          }

          .group_row {
            display: flex;
            align-items: center;
            flex-direction: row;
            width: 100%;
            height: 7%;
            border-top: 3px solid black;
          }

          .group_row_name {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100%;
            width: 90%;
            background-color: green;
            color: white;
            font-size: 2em;
            box-shadow: 0 2px 0 #55150b;
          }

          .group_row_cross {
            width: 10%;
            height: 100%;
            margin-bottom: 0;
          }

          .group_row_contents {
            display: flex;
            flex-direction: column;
          }

          .user_row {
            width: 100%;
            height: 3em;
            display: flex;
            flex-direction: row;
            background-color: LightGreen;
            border-top: 2px solid black;
          }

          .user_row_name {
            display: flex;
            align-items: center;
            height: 100%;
            width: 90%;
            border-bottom: 2px solid LightSeaGreen;
          }

          .user_row_name:hover {
            background-color: LightSeaGreen;
            transition-duration: 0.2s;
          }

          .user_row_name_text {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100%;
            width: 90%;
            font-size: 2em;
          }

          .rotate_45 {
            transform: rotate(45deg);
            font-size: 2em;
          }

          .favourite_tag {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 20%;
            width: 100%;
            border-bottom: 2px solid black;
            background-color: LightBlue;
          }

          .favourite_tag:hover {
            background-color: LightSeaGreen;
            transition-duration: 0.2s;
          }
    `)
}

function toggleMenu(element) {
  element.classList.toggle("change");
}

function displayNewUserScreen() {
    $('body').prepend(`
        <div class="newUserScreen">
            <div class="close_row">
                <div id="close" class="close selectable"/>
            </div>
            <div class="new_user_entry_container">
                <div class="new_user_entry_header">
                    <b>${saveUserHeader}</b>
                </div>
                <div class="new_user_entry_body">
                    <div class="user_group_row">
                        <div class="user_group_select_label"><b>${userGroupLabel}</b></div>
                        <select id="user_group_select" class="user_group_select"></select>
                    </div>
                    <div class="user_group_name_row">
                        <div class="user_group_select_label"><b>${userLabel}</b></div>
                        <input id="user_name_input" class="user_group_select">
                    </div>
                    <div class="user_group_save_row">
                        <button id="user_save" class="govuk-button govuk-button--start">
                          ${userSaveButton}
                          <svg class="govuk-button__start-icon" xmlns="http://www.w3.org/2000/svg" width="17.5" height="19" viewBox="0 0 33 40" aria-hidden="true" focusable="false">
                            <path fill="currentColor" d="M0 0h13l20 20-20 20H0l20-20z" />
                          </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `)

    var userGroups = getUserGroups();
    userGroups.forEach(function (group) {
        $("#user_group_select").append(`<option value="${group}">${group}</option>`);
    })

    $("#close").click(function () {
        $(".newUserScreen").remove();
    })

    $("#user_save").click(function () {
        var newUserName = $("#user_name_input").val();
        var selectedUserGroup = $("#user_group_select").val();

        if(selectedUserGroup == null || !selectedUserGroup || selectedUserGroup == "") {
            window.alert("No user group selected. This means no user group exists, or they failed to load. Please close the new user window and reperform the data capture.");
            return;
        }

        if(newUserName == null || !newUserName || newUserName == "") {
            window.alert("You must enter a name for the uesr you are trying to save.");
            return;
        }

        var data = captureForm();

        var userObject = {
            name: newUserName,
            group: selectedUserGroup,
            data: data
        }

        saveUser(userObject);
        location.reload();
    })
}

function selectUser(user) {
    populateForm(user);
    selectedUser = user.name;
    selectedUserGroup = user.group;
    $("#overwrite_row").removeClass("unselectable");
}

function generateFavouriteTag(user) {
    var displayedName = "";
    user.name.split(" ").forEach((value, index) => {
        if(index < 4) {
            displayedName += value[0];
        }
    });

    return $(`<div title="${user.group} :: ${user.name}" class="favourite_tag selectable">${displayedName}</div>`).click(() => {
        selectUser(user);
    });
}

function populateFavourites() {
    const sel_favs = "#user_profiles_fav"

    $(sel_favs).empty();

    const favourites = getFavourites();
    const users = getUsers();

    users.forEach((user) => {
        favourites.forEach(fav => {
            if(fav.name == user.name && fav.group == user.group) {
                var newTag = generateFavouriteTag(user);
                $(sel_favs).append(newTag);
            }
        })
    });
}

function renderUserGroups() {
    var html = $(`<div class="user_profiles_container"></div>`)

    var userGroups = getUserGroups();

    userGroups.forEach(function (group) {
        var groupContent = $(`<div id="${convertGroupNameToId(group)}_content" class="group_row_contents"></div>`)
        var groupHeader = $(`<div id="${convertGroupNameToId(group)}" class="group_row selectable"></div>`);

        var groupName = $(`<div class="group_row_name"><b>${group}</b></div>`).click(function () {
            $(groupContent).toggle();
        });
        var groupCross = $(`<div class="govuk-button govuk-button--warning group_row_cross"><div class="rotate_45">+</div></div>`)
        .click(function () {
            var confirm = window.confirm("Are you sure you want to delete the usergroup '" + group + "'\nThis will remove all users associated with this group.");

            if(confirm) {
                deleteUserGroup(group);
                location.reload();
            }
        })

        $(groupHeader).append(groupName).append(groupCross)
        $(groupContent).hide();

        html
            .append(groupHeader)
            .append(groupContent);
    });

    return html;
}

function renderUsers() {
    var users = getUsers();
    var favourites = getFavourites();

    users.forEach(function (user) {
        console.log("User: " + user.name);
        var name = user.name;
        var group = user.group;

        var groupSelector = "#" + convertGroupNameToId(group) + "_content"

        var groupElement = $(groupSelector)

        if(!groupElement) { return; }

        var userHeaderText = $(`<div class="user_row_name_text"><b>${name}</b></div>`).click(function() {
            selectUser(user);
        });

        var heartIcon = GM_addElement('img', {
            src: heartIconUrl,
            class: 'basic_icon heart_icon'
        })

        favourites.forEach(fav => {
            if(fav.name == name && fav.group == group) {
                $(heartIcon).addClass("favourited");
            }
        })

        var userNameHeartIcon = $(`<div class="icon_container" id="heart_icon_container"></div>`).append(heartIcon).click(function () {
            favourites = getFavourites();

            if(favourites.filter(fav => (fav.name == name && fav.group == group)).length > 0) {
                toggleFavourite(name, group);
                $(heartIcon).removeClass("favourited");

            } else {
                if(favourites.length < 5) {
                    if(name.split(" ").length > 4) {
                        window.alert("Names longer than 4 words will only have their first 4 characters displayed in the favourites bar.");
                    }
                    toggleFavourite(name, group);
                    $(heartIcon).addClass("favourited");
                } else {
                    window.alert("You can only add up to 5 favourites.");
                }
            }

            populateFavourites();
        });

        var userHeader = $(`<div class="user_row_name"></div>`).append(userHeaderText).append(userNameHeartIcon);

        var userCross = $(`<div class="govuk-button govuk-button--warning group_row_cross"><div class="rotate_45">+</div></div>`).click(function () {
            if(window.confirm("Are you sure you want to delete the user '" + user.name + "'?\nThis action cannot be undone.")) {
                deleteUser(user.name, user.group);
                location.reload();
            }
        })

        var userRow = $(`<div class="user_row selectable"></div>`).append(userHeader).append(userCross);

        $(groupSelector).append(userRow);
    })
}

function renderFavourites() {
    var html = $(`<div id="user_profiles_fav" class="user_profiles_fav"></div>`)

    return html;
}

function generateSidebar() {
    var rootSidebar = $(`<div class="sidebar" id="sidebar">
                        </div>`);

    //////////// Menu Icon Display

    var menuIcon = $(`
    <div class="icon_container selectable">
        <div class="menu_icon">
            <div class="bar1"></div>
            <div class="bar2"></div>
            <div class="bar3"></div>
        </div>
    </div>`).click(function() {
        toggleMenu(this);
        $("#sidebar").toggleClass("shown")
    });

    var menuRow = $(`
    <div class="sidebar_row sidebar_header">
      <div class="row_text">
        ${appTitle}
      </div>
    </div>
    `).append(menuIcon)

    //////////// Capture Form Data Display
    var captureIcon = `<div title="Capture Page Data" class="icon_container" id="capture_icon_container"></div>`

    var enoughGroupsForCapture = getUserGroups().length > 0;

    var captureRow = $(`
      <div class="sidebar_row selectable capture_row">
        <div class="row_text">
          ${captureFormData}
        </div>
        ${captureIcon}
      </div>
    `).click(function() {
        if(enoughGroupsForCapture) {
            displayNewUserScreen();
        }
    })

    if(!enoughGroupsForCapture) {
        $(captureRow).addClass("unselectable");
    }

    //////////// Overwrite Form Data Display
    var overwriteIcon = `<div title="Overwrite Last Selected User" class="icon_container" id="overwrite_icon_container"></div>`

    var overwriteRow = $(`
      <div id="overwrite_row" class="sidebar_row selectable capture_row unselectable">
        <div class="row_text">
          ${overwriteFormData}
        </div>
        ${overwriteIcon}
      </div>
    `).click(function() {
        if(selectedUser && selectedUserGroup && selectedUser != "" && selectedUserGroup != "") {
            var users = getUsers();
            var foundUser;

            users.forEach((user) => {
                if(user.name == selectedUser && user.group == selectedUserGroup) {
                    foundUser = user;
                }
            })

            if(foundUser && foundUser.name == selectedUser) {
                var data = captureForm();
                if(!data) return;

                overwriteUser(selectedUser, selectedUserGroup, data);
                window.alert(`User '${selectedUser}' from the group '${selectedUserGroup}' has been overwritten.`);
            }
        }
    })

    //////////// New Profile Display
    var newProfileIcon = `<div title="Create new User Group" class="icon_container" id="new_profile_icon_container"></div>`

    var newProfileRow = $(`
      <div class="sidebar_row selectable capture_row">
        <div class="row_text">
          ${newProfileText}
        </div>
        ${newProfileIcon}
      </div>
    `).click(function() {
        var newGroup = prompt("Enter a name for the new user group");
        if(newGroup == "") {
            window.alert("The group name cannot be empty");
        } else if(newGroup != null) {
            saveUserGroup(newGroup);
            location.reload();
        }
    })

    var userRootRow = $(`<div class="users_root_container">
    </div>`).append(renderUserGroups).append(renderFavourites);

    rootSidebar
        .append(menuRow)
        .append(captureRow)
        .append(overwriteRow)
        .append(newProfileRow)
        .append(userRootRow)

    $('body').prepend(rootSidebar)

    renderUsers();
}

function generateIcons() {
    GM_addElement(document.getElementById('new_profile_icon_container'), 'img', {
        src: newProfileIconUrl,
        class: 'basic_icon'
    })

    GM_addElement(document.getElementById('capture_icon_container'), 'img', {
        src: captureIconUrl,
        class: 'basic_icon'
    })

    GM_addElement(document.getElementById('overwrite_icon_container'), 'img', {
        src: overwriteIconUrl,
        class: 'basic_icon'
    })
}

(function() {
    'use strict';

    generateSidebar();
    populateFavourites();
    generateStyles();
    generateIcons();
})();
