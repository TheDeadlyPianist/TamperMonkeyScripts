// ==UserScript==
// @name         Auth Login Helper - Credentials
// @namespace    https://github.com/
// @version      2.1.3
// @description  TIMESAVER
// @author       Duane Matthew Hipwell
// @match        */auth-login-stub/gg-sign-in*
// @updateURL    https://github.com/TheDeadlyPianist/TamperMonkeyScripts/blob/main/authLoginHelperCreds.user.js
// @downloadURL  https://github.com/TheDeadlyPianist/TamperMonkeyScripts/blob/main/authLoginHelperCreds.user.js
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_listValues
// @require      http://code.jquery.com/jquery-3.4.1.min.js
// ==/UserScript==

var inputCount = 0;

var newUserLocation = "#inputForm > div.govuk-warning-text"

var confidenceLevelSelector = "#confidenceLevel"
var affinityGroupSelector = "#affinityGroupSelect"
var ninoInputSelector = "#nino"

var firstEnrolmentKeySelector = "[name='enrolment[0].name']"
var firstIdentifierNameSelector = "#input-0-0-name"
var firstIdentifierValueSelector = "#input-0-0-value"

function nonBlank(input) {
    if((input == "") || (input == undefined)) {
        return false;
    } else {
        return true;
    }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////// Data Storage and Retrieval ////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
async function getValue(objectName) {
    return Object.values(await GM_getValue(objectName, {}));
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////// Delete Functions /////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function deleteUserGroup(userGroup) {
    var confirmed = window.confirm("You are about to delete the group: " + userGroup + "\n\n\This will delete all the users in the group.\nAre you sure?")
    if(confirmed) {
        getValue("userGroups").then(allGroups => {
            var index = allGroups.map(function(elem) { return elem.name; }).indexOf(userGroup);
            if(index > -1) {
                allGroups.splice(index, 1);

                GM_setValue("userGroups", allGroups);
                location.reload();
            }
        });
    }
}

async function deleteUser(userGroup, userName) {
    var confirmed = window.confirm("You are about to delete the following user: " + userName + "\n\n\nAre you sure?");
    if(confirmed) {
        getValue("userGroups").then(allGroups => {
            var index = allGroups.map(function(elem) { return elem.name; }).indexOf(userGroup);

            if(index > -1) {
                var userIndex = allGroups[index].users.map(function(elem) { return elem.userName }).indexOf(userName);
                if(userIndex > -1) {
                    allGroups[index].users.splice(userIndex, 1);

                    GM_setValue("userGroups", allGroups);
                    location.reload();
                } else {
                    window.alert("Could not find the user within the given group. Please refresh the page and try again.");
                }
            } else {
                window.alert("Could not find the user group that the user belongs to. Please refresh the page and try again.");
            }
        });
    }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////// New User Functions ////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function createUserGroup(input) {

    console.log("Input: " + input);
    if(input == undefined || input == "") {
        window.alert("Input is empty");
    } else {
        getValue("userGroups").then(allUserGroups => {
            var inGroup = false;

            allUserGroups.forEach(function(elem, index) {
                if(input == elem.name) inGroup = true;
            });

            if(inGroup) {
                window.alert("This user group already exist");
            } else {
                var userGroup = {
                    "name": input,
                    "users": [],
                    "agents": []
                }

                allUserGroups.push(userGroup);
                GM_setValue("userGroups", allUserGroups);
                location.reload();
            }
        });
    }
}

async function createNewUser(input) {
    getValue("userGroups").then(allUserGroups => {
        var foundUserGroup = allUserGroups.find(group => group.name == input.userGroup);

        if(foundUserGroup == undefined) {
            window.alert("Could not find USER GROUP. Please check it actually exist.");
            return;
        }

        var allUsers = foundUserGroup.users;
        var userExist = false;

        allUsers.forEach(user => {
            if(user.userName == input.userName) {
                userExist = true;
            }
        });

        if(userExist) {
            window.alert("A user with this name already exist");
            return;
        }

        allUserGroups.forEach(group => {
            if(group.name == input.userGroup) {
                group.users.push(input);
            }
        });
        GM_setValue("userGroups", allUserGroups);
        location.reload();
    });
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////// Form Creation ////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function placeInRow(items) {
    var newRow = $('<div class="displayRow"></div>')
    .css("display", "flex")
    .css("vertical-align", "text-bottom")
    .css("margin-top", "5px")
    .css("margin-bottom", "5px")
    .css("height", "3em")
    .css("width", "100%")
    .css("box-sizing", "border")
    .css("align-items", "center");

    items.forEach(function(elem) {
        $(newRow).append(elem);
    });

    return newRow;
}

function stackRows(items) {
    var newRow = $('<div class="displayRow"></div>')
    .css("vertical-align", "text-bottom")
    .css("margin-top", "5px")
    .css("margin-bottom", "5px")
    .css("height", "3em")
    .css("width", "100%")
    .css("box-sizing", "border");

    items.forEach(function(elem) {
        $(newRow).append(elem);
    });

    return newRow;
}

function generateNewUserButtons() {
    var creationArea = $('<div id="creation-area"><div>').insertBefore(newUserLocation);
    var buttonContainer = $('<div class="govuk-button-group" id="button-container"></div>').css("margin-bottom", "0");

    var createUserGroupButton = $('<div class="govuk-button" id="button_createUserGroup">Create User Group</div>').css("user-select", "none").css("margin-bottom", "0");
    var createUserButton = $('<div class="govuk-button" id="button_createUser">Create New User</div>').css("margin-bottom", "0");

    var inputArea = $('<div id="area_input"></div>').css("padding", "25px 10px 0px 10px").css("background-color", "#f0f0f0").hide();

    $(creationArea).css("padding-bottom", "20px").css("margin-bottom", "3em");

    $(creationArea).append(buttonContainer);
    $(creationArea).append(inputArea);
    $(buttonContainer).append(createUserGroupButton);
    $(buttonContainer).append(createUserButton);
}

function generateCreateGroupInput() {
    var inputArea = $("#area_input")[0];
    $(inputArea).show();

    var label = $('<label for="input_createUserGroup" class="govuk-label">Name of the new User Group</label>').css("user-select", "none");
    var inputField = $('<input class="govuk-input" id="input_createUserGroup" placeholder="Enter a new user group name">');
    var newGroupNameFormElement = $('<div class="govuk-form-group"></div>').append(label).append(inputField);

    var submitButton = $('<div class="govuk-button">Submit</div>').css("user-select", "none").click(function() {
        createUserGroup($(inputField)[0].value);
    });
    var cancelButton = $('<div class="govuk-button govuk-button--secondary">Cancel</div>')
    .css("user-select", "none")
    .css("border-left", "grey solid 1px")
    .css("border-top", "grey solid 1px")
    .css("border-right", "grey solid 1px")
    .click(function() {
        $(inputArea).empty().hide();
    });
    var submitAndCancelButtons = $('<div class="govuk-button-group"></div>').append(submitButton).append(cancelButton);

    $(inputArea).empty();
    $(inputArea).append(newGroupNameFormElement);
    $(inputArea).append('<p></p>');
    $(inputArea).append(submitAndCancelButtons);
}

function newEnrolmentRow(delegated) {
    var enrolmentKeyLabel = $('<label for="input_enrolmentKey_' + inputCount + '" class="enrolment_label label--inline">Enrolment Key</div>').css("width", "33%").css("user-select", "none");
    var identifierNameLabel = $('<label for="input_identifierName_' + inputCount + '" class="enrolment_label label--inline">Identifier Name</div>').css("width", "33%").css("user-select", "none");
    var identifierVlueLabel = $('<label for="input_identifierValue_' + inputCount + '" class="enrolment_label label--inline">Identifier Value</div>').css("width", "33%").css("user-select", "none");

    var allLabels;

    var enrolmentKeyInput = $('<div style="width: 33%;"><input id="input_enrolmentKey_' + inputCount + '" class="input_enrolmentKey" style="width: 80%;" placeholder="Enter an enrolment identifier"></div>').css("display", "inline-block");
    var identifierNameInput = $('<div style="width: 33%;"><input id="input_identifierName_' + inputCount + '" class="input_identifierName" style="width: 80%;" placeholder="Enter an identifier name"></div>').css("display", "inline-block");
    var identifierValueInput = $('<div style="width: 33%;"><input id="input_identifierValue_' + inputCount + '" class="input_identifierValue" style="width: 80%;" placeholder="Enter an identifier value"></div>').css("display", "inline-block");

    var authRuleLabel = $('<label for="input_authRule_' + inputCount + '" class="authRule_label label--inline">Delegated Auth Rule</div>').css("width", "33%").css("user-select", "none");
    var authRuleInput = $('<div style="width: 33%;"><input id="input_authRule_' + inputCount + '" class="input_authRule" style="width: 80%;" placeholder="Enter an auth rule value"></div>').css("display", "inline-block");

    var allInputs;

    if(delegated == true) {
        allLabels = $(placeInRow([enrolmentKeyLabel, identifierNameLabel, identifierVlueLabel, authRuleLabel])).css("margin-bottom", "0").css("height", "2em");
        allInputs = $(placeInRow([enrolmentKeyInput, identifierNameInput, identifierValueInput, authRuleInput])).css("margin-top", "0").css("top", "0");
    } else {
        allLabels = $(placeInRow([enrolmentKeyLabel, identifierNameLabel, identifierVlueLabel])).css("margin-bottom", "0").css("height", "2em");
        allInputs = $(placeInRow([enrolmentKeyInput, identifierNameInput, identifierValueInput])).css("margin-top", "0").css("top", "0");
    }

    var combinedObjects = $(stackRows([allLabels, allInputs])).css("height", "auto");

    inputCount ++;

    return combinedObjects;
}

function generateCreateUserInput() {

    getValue("userGroups").then(allGroups => {
        var userGroupLabel = $('<label for="input_userGroup" class="label--inline">User Group</label>').css("user-select", "none")
        var userGroupDropdown = $('<select id="input_userGroup"></select>').css("display", "inline-block");

        allGroups.forEach(function(elem) {
            $(userGroupDropdown).append('<option value="' + elem.name + '">' + elem.name + '</option>');
        });

        var agentWindow = $('<div class="agent_window"></div>').css("height", "auto");
        var individualWindow = $('<div class="individual_window"></div>').css("height", "auto");

        var affinityWindowHolder = $('<div class="affinity_window"></div>')
        .append(individualWindow);

        var inputArea = $("#area_input")[0];
        $(inputArea).show();

        var inputLabel = $('<label for="input_createUserGroup" class="label--inline">User Name:</label>').css("user-select", "none");
        var inputField = $('<input id="input_createUserGroup" placeholder="Enter a name for a new user">').css("margin-right", "15px").css("margin-left", "15px");

        var affinityLabel = $('<label for="input_affinityGroup" class="label--inline">Affinity Group: </div>').css("user-select", "none");
        var affinityInput = $('<select id="input_affinityGroup"></select>')
        .change(function() {
            var newValue = $(this).val();
            if(newValue == "agent") {
                $(affinityWindowHolder).empty();
                $(affinityWindowHolder).append(agentWindow);
            } else {
                $(affinityWindowHolder).empty();
                $(affinityWindowHolder).append(individualWindow);
            }
        })
        .css("display", "inline-block")
        .append('<option value="individual">Individual</option>')
        .append('<option value="agent">Agent</option>');

        var clLabel = $('<label for="input_confidence" class="label--inline">Confidence Level</label>').css("user-select", "none");
        var clDropdown = $('<select id="input_confidence"></select>')
        .css("display", "inline-block")
        .append('<option value="50">50</option>')
        .append('<option value="200">200</option>')
        .append('<option value="250">250</option>');

        var ninoLabel = $('<label for="input_nino" class="label--inline">User NINO</label>').css("user-select", "none");
        var ninoInput = $('<input id="input_nino" placeholder="Enter a NINO for the new user">');

        var enrolmentsContainer = $('<div id="enrolments_window"></div>');
        $(enrolmentsContainer).append(newEnrolmentRow());

        var agentEnrolmentsContainer = $('<div id="agent_enrolments_window"></div>');
        $(agentEnrolmentsContainer).append(newEnrolmentRow());

        var agentDelegatedEnrolmentsContainer = $('<div id="agent_delegated_enrolments_window"></div>');
        $(agentDelegatedEnrolmentsContainer).append(newEnrolmentRow(true));

        var enrolmentMinusButton = $('<button id="enrolment_minus" type="button" class="button minus-button"><span>-</span></button>').hide().click(function() {
            $(enrolmentsContainer).children().last().remove();
            var childrenCount = $(enrolmentsContainer).children().length;
            if(childrenCount <= 1) {
                $(this).hide();
            }
        });

        var agentEnrolmentMinusButton = $('<button id="agent_enrolment_minus" type="button" class="button minus-button"><span>-</span></button>').hide().click(function() {
            $(agentEnrolmentsContainer).children().last().remove();
            var childrenCount = $(agentEnrolmentsContainer).children().length;
            if(childrenCount <= 1) {
                $(this).hide();
            }
        });

        var delegatedEnrolmentMinusButton = $('<button id="delegated_minus" type="button" class="button minus-button"><span>-</span></button>').hide().click(function() {
            $(agentDelegatedEnrolmentsContainer).children().last().remove();
            var childrenCount = $(agentDelegatedEnrolmentsContainer).children().length;
            if(childrenCount <= 1) {
                $(this).hide();
            }
        });

        var enrolmentPlusButton = $('<button id="enrolment_plus" type="button" class="button plus-button"><span>+</span></button>').click(() => {
            $(enrolmentsContainer).append(newEnrolmentRow());
            $(enrolmentMinusButton).show();
        });

        var agentEnrolmentPlusButton = $('<button id="agent_enrolment_plus" type="button" class="button plus-button"><span>+</span></button>').click(() => {
            $(agentEnrolmentsContainer).append(newEnrolmentRow());
            $(agentEnrolmentMinusButton).show();
        });

        var delegatedEnrolmentPlusButton = $('<button id="delegated_plus" type="button" class="button plus-button"><span>+</span></button>').click(() => {
            $(agentDelegatedEnrolmentsContainer).append(newEnrolmentRow(true));
            $(delegatedEnrolmentMinusButton).show();
        });

        var submitButton = $('<div class="govuk-button">Submit</div>').css("user-select", "none").click(function() {
            var validInput = true;

            if($(affinityInput).val() == "individual") {
                var _raw_enrolments = $(enrolmentsContainer).children();
                var _individual_enrolments = [];

                $(_raw_enrolments).each(function() {
                    var _inputs = $(this).find("input");

                    var _key = $($(_inputs)[0]).val();
                    var _name = $($(_inputs)[1]).val();
                    var _value = $($(_inputs)[2]).val();

                    if(!(nonBlank($(inputField).val()) && nonBlank($(ninoInput).val()) && nonBlank(_key) && nonBlank(_name) && nonBlank(_value))) { validInput = false; }

                    _individual_enrolments.push({
                        key: _key,
                        name: _name,
                        value: _value
                    });
                })


                var enrolment = _individual_enrolments[0];

                var _key = enrolment.key;
                var _name = enrolment.name;
                var _value = enrolment.value;

                if(validInput) {
                    createNewUser({
                        userGroup: $(userGroupDropdown).val(),
                        userName: $(inputField).val(),
                        confidence: $(clDropdown).val(),
                        nino: $(ninoInput).val(),
                        affinity: "individual",
                        enrolment: {
                            key:_key,
                            identifierName: _name,
                            identifierValue: _value
                        },
                        enrolments: _individual_enrolments
                    })
                } else {
                    window.alert("One or more field is blank.");
                }
            } else {
                var _enrolments_raw = $(agentEnrolmentsContainer).children();
                var _delegatedEnrolments_raw = $(agentDelegatedEnrolmentsContainer).children();;

                var _enrolments = [];
                var _delegatedEnrolments = [];

                if(!nonBlank($(inputField).val())) { validInput = false; }

                $(_enrolments_raw).each(function() {
                    var _inputs = $(this).find("input");

                    var _key = $($(_inputs)[0]).val();
                    var _name = $($(_inputs)[1]).val();
                    var _value = $($(_inputs)[2]).val();

                    if(!(nonBlank(_key) && nonBlank(_name) && nonBlank(_value))) { validInput = false; }

                    _enrolments.push({
                        key: _key,
                        name: _name,
                        value: _value
                    });
                })

                var missingDelegateData = false;

                $(_delegatedEnrolments_raw).each(function() {
                    var _inputs = $(this).find("input");

                    var _key = $($(_inputs)[0]).val();
                    var _name = $($(_inputs)[1]).val();
                    var _value = $($(_inputs)[2]).val();
                    var _auth = $($(_inputs)[3]).val();

                    var dataExist = nonBlank(_key) || nonBlank(_name) || nonBlank(_value) || nonBlank(_auth);

                    if(dataExist) {
                        if(nonBlank(_key) && nonBlank(_name) && nonBlank(_value) && nonBlank(_auth)) {
                            _delegatedEnrolments.push({
                                key: _key,
                                name: _name,
                                value: _value,
                                auth: _auth
                            });
                        } else {
                            missingDelegateData = true;
                        }
                    }

                })

                if(validInput && !missingDelegateData) {
                    createNewUser({
                        userGroup: $(userGroupDropdown).val(),
                        userName: $(inputField).val(),
                        affinity: "agent",
                        enrolments: _enrolments,
                        delegated: _delegatedEnrolments
                    })
                } else if(missingDelegateData) {
                    window.alert("You have entered data for some delegated fields, but not all. Please remove entered data, or complete the enrolment.");
                } else {
                    window.alert("One or more field is blank.");
                }
            }
        });

        var cancelButton = $('<div class="govuk-button govuk-button--secondary">Cancel</div>')
        .css("border-left", "grey solid 1px")
        .css("border-top", "grey solid 1px")
        .css("border-right", "grey solid 1px")
        .css("user-select", "none").click(function() {
            $(inputArea).empty().hide();
        });

        var submitAndCancelButtons = $('<div class="govuk-button-group"></div>').append(submitButton).append(cancelButton);

        $(individualWindow)
            .append(placeInRow([clLabel, clDropdown]))
            .append(placeInRow([ninoLabel, ninoInput]))
            .append(enrolmentsContainer)
            .append(enrolmentPlusButton)
            .append(enrolmentMinusButton);

        $(agentWindow)
            .append('<h2>Agent Enrolments</h2>')
            .append(agentEnrolmentsContainer)
            .append(agentEnrolmentPlusButton)
            .append(agentEnrolmentMinusButton)
            .append('<h2>Delegated Agent Enrolments</h2>')
            .append(agentDelegatedEnrolmentsContainer)
            .append(delegatedEnrolmentPlusButton)
            .append(delegatedEnrolmentMinusButton);

        $(inputArea).empty();
        $(inputArea)
            .append(placeInRow([userGroupLabel, userGroupDropdown]))
            .append(placeInRow([inputLabel, inputField]))
            .append(placeInRow([affinityLabel, affinityInput]))
            .append(affinityWindowHolder)
            .append('<p></p>')
            .append(submitAndCancelButtons);
    });
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////// Selection Creation ////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function generateUserButton(input, group) {
    var buttonContainer = $('<div></div>')
    .css("height", "auto")
    .css("display", "flex")
    .css("flex-direction", "row");

    var newButton = $('<div class="govuk-button">' + input.userName + '</div>')
    .css("display", "inline-block")
    .css("width", "-webkit-fill-available")
    .css("height", "2em")
    .css("margin", "0")
    .css("border-bottom", "1px solid black")
    .css("box-sizing", "border-box")
    .css("user-select", "none")
    .css("white-space", "nowrap");

    var deleteButton = $('<div class="govuk-button govuk-button--warning"></div>')
    .css("user-select", "none")
    .css("display", "inline-block")
    .css("margin", "0")
    .css("box-sizing", "border-box")
    .css("height", "2em")

    $(newButton).click(function() { fillUser(input); })

    $(deleteButton).append($('<div>+</div>').css("transform", "rotate(45deg)"));
    $(deleteButton).click(function() {
        deleteUser(group, input.userName);
    });

    $(buttonContainer).append(newButton);
    $(buttonContainer).append(deleteButton);

    return buttonContainer;
}

function generateUserGroupButtons() {
    getValue("userGroups").then(userGroups => {
        var selectionField = $('<div id="area_userGroupSelect"></div>')
        .css("padding-bottom", "25px");

        userGroups.forEach(function(elem) {
            var fieldName = elem.name;
            var idPart = (fieldName).replace(/\s/, "_");

            var newButtonContainer = $('<div class="button_container" id="container_' + idPart + '"></div>')
            .css("min-width", "23%")
            .css("z-index", "1")
            .css("display", "inline-block")
            .css("position", "relative");

            var listId = "list_" + idPart
            var listContainer = $('<div class="list_container" id="' + listId + '"></div>')
            .css("position", "absolute")
            .css("background-color", "mediumseagreen")
            .css("margin", "0px 0.78947em 0px 0px")
            .css("border", "#00501a 5px solid")
            .css("border-top", "0")
            .hide();

            var divider = $('<div></div>').css("width", "100%").css("height", "0.5vh").css("background-color", "rgb(91, 168, 92);")
            $(listContainer).append(divider);

            var newButton = $('<div class="govuk-button" id="button_' + idPart + '">' + fieldName + '</div>')
            .css("user-select", "none")
            .css("margin-right", "0")
            .css("display", "inline-block")
            .css("height", "2em")
            .css("margin", "0")
            .css("box-sizing", "border-box");

            var deleteButton = $('<div class="govuk-button govuk-button--warning"></div>')
            .css("display", "inline-block")
            .css("user-select", "none")
            .css("height", "2em")
            .css("margin", "0")
            .css("box-sizing", "border-box");
            $(deleteButton).append($('<div>+</div>').css("transform", "rotate(45deg)"));

            var userButtons = elem.users.map(user => $(listContainer).append(generateUserButton(user, fieldName)));

            $(newButtonContainer).click(() => {
                var isHidden = $(listContainer).is(":hidden");
                if(isHidden) {
                    $(".list_container").each(function() {
                        $(this).hide();
                    });
                }
                $(listContainer).toggle();
            });

            $(deleteButton).click(() => {
                deleteUserGroup(fieldName);
            });

            $(newButtonContainer)
                .append(newButton)
                .append(deleteButton)
                .append(listContainer);
            $(selectionField).append(newButtonContainer);
        });

        $(selectionField).insertBefore("#inputForm > div.govuk-warning-text");
    });
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////// Field Population //////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function fillFirstRow(enrolmentKey, enrolmentIdentifier, enrolmentValue) {
    $(firstEnrolmentKeySelector).val(enrolmentKey);
    $(firstIdentifierNameSelector).val(enrolmentIdentifier);
    $(firstIdentifierValueSelector).val(enrolmentValue);
}

function fillNino(newValue) {
    $(ninoInputSelector).val(newValue);
}

function changeDropdown(selector, newValue) {
    console.log("Updating " + selector + " dropdown to " + newValue);

    $(selector).val(newValue).change();
}

function fillIndividual(input) {
    var nino = input.nino
    var confidenceLevel = input.confidence

    changeDropdown(confidenceLevelSelector, confidenceLevel);
    changeDropdown(affinityGroupSelector, "Individual");
    fillNino(nino);

    if(input.enrolments == null || input.enrolments.length == 1) {
        var enrolmentKey = input.enrolment.key
        var enrolmentIdentifier = input.enrolment.identifierName
        var enrolmentValue = input.enrolment.identifierValue

        console.log("Updating enrolment row 1 with the following data:\nKey: "+enrolmentKey+"\nName: "+enrolmentIdentifier+"\nValue: "+enrolmentValue);

        fillFirstRow(enrolmentKey, enrolmentIdentifier, enrolmentValue);
    } else {
        input.enrolments.forEach(function(_enrolment, index) {
            var _key = _enrolment.key;
            var _name = _enrolment.name;
            var _value = _enrolment.value;

            console.log("Updating enrolment row " + (index+1) + " with the following data:\nKey: "+_key+"\nName: "+_name+"\nValue: "+_value);

            if($("[name='enrolment["+ index +"].name']").length < 1) {
                document.getElementById("js-add-enrolment").click();
            }

            $("[name='enrolment["+ index +"].name']").val(_key);
            $("#input-" + index + "-0-name").val(_name);
            $("#input-" + index + "-0-value").val(_value);
        });
    }
}

function fillAgent(input) {
    $("#delegated-enrolments-fields").empty();
    changeDropdown(affinityGroupSelector, "Agent");

    var addEnrolmentButtonSelector = "#js-add-enrolment";
    var addDelegatedEnrolmentButtonSelector = "#js-add-delegated-enrolment";

    input.enrolments.forEach(function(_enrolment, index) {
        var _key = _enrolment.key;
        var _name = _enrolment.name;
        var _value = _enrolment.value;

        console.log("Updating enrolment row " + (index+1) + ", for agent, with the following data:\nKey: "+_key+"\nName: "+_name+"\nValue: "+_value);

        if($("[name='enrolment["+ index +"].name']").length < 1) {
            document.getElementById("js-add-enrolment").click();
        }

        $("[name='enrolment["+ index +"].name']").val(_key);
        $("#input-" + index + "-0-name").val(_name);
        $("#input-" + index + "-0-value").val(_value);
    });

    input.delegated.forEach(function(_enrolment, index) {
        var _key = _enrolment.key;
        var _name = _enrolment.name;
        var _value = _enrolment.value;
        var _auth = _enrolment.auth

        console.log("Updating delegated enrolment row " + (index+1) + " with the following data:\nKey: "+_key+"\nName: "+_name+"\nValue: "+_value+"\nAuth rule: "+_auth);

        $(addDelegatedEnrolmentButtonSelector).click();

        $("[name='delegatedEnrolment\\[" + index + "\\]\\.key']").val(_key);
        $("#input-delegated-" + index + "-0-name").val(_name);
        $("#input-delegated-" + index + "-0-value").val(_value);
        $("[name='delegatedEnrolment\\[" + index + "\\]\\.delegatedAuthRule']").val(_auth);
    })
}

function fillUser(input) {
    $($("#js-enrolments-table").find("input")).each(function() {
        $(this).val("");
    })

    var individual = input.affinity == "individual";

    if(individual) {
        fillIndividual(input);
    } else {
        fillAgent(input);
    }
}

(function() {
    'use strict';

    generateNewUserButtons();
    generateUserGroupButtons();

    $("#button_createUserGroup").click(generateCreateGroupInput);
    $("#button_createUser").click(generateCreateUserInput);
})();
