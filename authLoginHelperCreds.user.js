// ==UserScript==
// @name         Auth Login Helper - Credentials
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  TIMESAVER
// @author       Duane Matthew Hipwell
// @match        */auth-login-stub/gg-sign-in*
// @grant        none
// ==/UserScript==

var rowInForm = 0;
var d_rowInForm = 0;
var lastListClicked = "";

function generateBox(name, id) {
    $("<div class=\"button\" id="+id+" style=\"margin-bottom: 20px;\">" + name + "</div>").insertBefore(".alert");
}

function generateBoxHtml(name, id) {
    return "<div class=\"button\" id="+id+" style=\"margin:0;display:block;text-align:center;padding-top:9px;padding-bottom:9px;\">" + name + "</div>";
}

function addListToggleEvent(selector) {
    $(selector).click(function(){
      if(lastListClicked != selector) { $(".loginHelperList").hide(); }
      $(selector + "Items").toggle();
      lastListClicked = selector;
    })
}

function generateList(listName, listId, items) {
    $("<div id=\""+listId+"\" style=\"display: inline-block; margin-bottom: 20px; margin-right: 15px;\">").insertBefore(".alert");

    var namePlate = "<div class=\"button column-one-third\" id=\""+listId+"Name\" style=\"margin:0;\">"+listName+"</div>"
    var listItems = $("<div class=\"loginHelperList\" id=\""+listId+"Items\" style=\"display: none; width:25%; position:absolute; z-index:100\">"+"</div>");
    listItems.append("<div style=\"width:100%; height:2px; background-color: black;\"></div>")

    for(var i = 0; i < items.length; i ++) {
        listItems.append(items[i]);
        listItems.append("<div style=\"width:100%; height:2px; background-color: black;\"></div>")
    }

    $("#"+listId).append(namePlate);
    $("#"+listId).append(listItems);

    addListToggleEvent("#"+listId);
}

function enrolmentSelector() {
    return "input[name=\"enrolment[" + rowInForm + "].name\"]";
}

function identifierNameSelector() {
    return "input[name=\"enrolment[" + rowInForm + "].taxIdentifier[0].name\"]";
}

function identifierValueSelector() {
    return "input[name=\"enrolment[" + rowInForm + "].taxIdentifier[0].value\"]";
}

function delegatedEnrolmentSelector() {
    return "input[name=\"delegatedEnrolment[" + d_rowInForm + "].key\"]";
}

function delegatedIdentifierNameSelector() {
    return "input[name=\"delegatedEnrolment[" + d_rowInForm + "].taxIdentifier[0].name\"]";
}

function delegatedIdentifierValueSelector() {
    return "input[name=\"delegatedEnrolment[" + d_rowInForm + "].taxIdentifier[0].value\"]";
}

function delegatedAuthRoleSelector() {
    return "input[name=\"delegatedEnrolment[" + d_rowInForm + "].delegatedAuthRule\"]";
}

function fillBox(text, selector) {
    var box = $(selector);
    console.log(box);
    box.val(text);
}

function fillRow(enrolmentKey, identifierName, identifierValue) {
    fillBox(enrolmentKey, enrolmentSelector());
    fillBox(identifierName, identifierNameSelector());
    fillBox(identifierValue, identifierValueSelector());
    rowInForm = rowInForm+1;
}

function fillDelegatedRow(enrolmentKey, identifierName, identifierValue, authValue) {
    fillBox(enrolmentKey, delegatedEnrolmentSelector());
    fillBox(identifierName, delegatedIdentifierNameSelector());
    fillBox(identifierValue, delegatedIdentifierValueSelector());
    fillBox(authValue, delegatedAuthRoleSelector())
    $(delegatedIdentifierValueSelector()).select();
    document.execCommand('copy');
    d_rowInForm = d_rowInForm+1;
}

function changeAffinityGroup(newGroup) {
    var dropdownMenu = document.getElementById("affinityGroupSelect");
    var dropdownOptions = dropdownMenu.options;

    var optionSelect = -1;

    for(var i = 0; i < dropdownOptions.length; i++) {
        if(dropdownOptions[i].value == newGroup) {
            optionSelect = i;
        }
    }

    if(optionSelect != -1) {
        dropdownMenu[optionSelect].selected = true;
        dropdownMenu.dispatchEvent(new Event('change'));
        if(newGroup == "Agent") { document.getElementById("js-add-delegated-enrolment").click(); }
    }
}

function addFillEvent(selector, enrolmentKey, identifierName, identifierValue) {
    $(selector).click(function() {
        changeAffinityGroup("Individual");
        rowInForm = 0;
        fillRow(enrolmentKey, identifierName, identifierValue);
    });
}

function addAgentFillEvent(selector, enrolmentKey, identifierName, identifierValue, agentEnrolment) {
    $(selector).click(function() {
        changeAffinityGroup("Agent");
        rowInForm = 0;
        d_rowInForm = 0;
        fillRow(enrolmentKey, identifierName, identifierValue);
        fillDelegatedRow(agentEnrolment.enrolmentKey, agentEnrolment.identifierKey, agentEnrolment.identifierValue, agentEnrolment.authRole);
    });
}

(function() {
    'use strict';

    var agentEnrolment = {
        enrolmentKey: "HMRC-MTD-VAT",
        identifierKey: "VRN",
        identifierValue: "968501689",
        authRole: "mtd-vat-auth"
    }

    var agentEnrolmentVatGroupReg = {
        enrolmentKey: "HMRC-MTD-VAT",
        identifierKey: "VRN",
        identifierValue: "888913457",
        authRole: "mtd-vat-auth"
    }

    var agentEnrolmentVatGroupDereg = {
        enrolmentKey: "HMRC-MTD-VAT",
        identifierKey: "VRN",
        identifierValue: "888820271",
        authRole: "mtd-vat-auth"
    }

    var agentEnrolmentNoPartyType = {
        enrolmentKey: "HMRC-MTD-VAT",
        identifierKey: "VRN",
        identifierValue: "888843156",
        authRole: "mtd-vat-auth"
    }

    var agentEnrolmentIt = {
        enrolmentKey: "HMRC-MTD-IT",
        identifierKey: "MTDITID",
        identifierValue: "1234567890",
        authRole: "mtd-it-auth"
    }

    // =================== User Manual ===================
    // generateBox(boxName, boxId) -> This function creates the physical box on screen with the text from the boxName and the id from boxId.
    //
    // addFillEvent(boxId, enrolmentKey, identifierName, identifierValue) -> This will add the fill event and fill in the relevant boxes with the individual pieces of information.
    //
    // addAgentFillEvent(boxId, enrolmentKey, identifierName, identifierValue, agentEnrolment) -> This is similar to addFillEvent, except it will also go through the necessary steps to fill in
    //                                                                                            the relevent boxes.
    //
    // generateBoxHtml(boxName, boxId) -> This is similar to generateBox, except this doesn't physically create a box anywhere. This is to be used with the generateList function.
    //
    // generateList(listName, listId, listItems) -> Creates a dropdown list with several items. The list name is the text in listName. The list id is the text in listId.
    //                                              The list is then populated with the items from inside the listItems array. This is to be an array populated by generateBoxHtml functions.

    generateList("Non-Agent", "vat_naList", [
        generateBoxHtml("No Enrolments", "nane"),
        generateBoxHtml("Enrolments", "nae"),
        generateBoxHtml("Exempt from MTDfB", "naefmtdfb"),
        generateBoxHtml("Sole Trader", "nast"),
        generateBoxHtml("Pending Enrolment", "nape"),
        generateBoxHtml("No Party Type", "nanpt"),
        generateBoxHtml("Mising trader", "namt"),
        generateBoxHtml("Paper Preference", "pp"),
        generateBoxHtml("Digital Preference", "dp"),
        generateBoxHtml("No Pref and No Email", "npde"),
        generateBoxHtml("Charge Type Connoisseur", "ctc"),
        generateBoxHtml("Long Pay History", "lph")
    ]);

    generateList("Agent", "vat_aList", [
        generateBoxHtml("Enrolments", "ae"),
        generateBoxHtml("VAT Group Registered", "avgr"),
        generateBoxHtml("VAT Group Deregistered", "avgdr"),
        generateBoxHtml("Client No Party Type", "acnpt")
    ]);

    generateList("Non-Agent IT", "it_naList", [
        generateBoxHtml("Base", "it_nane")
    ]);

    generateList("Agent IT", "it_aList", [
        generateBoxHtml("Base", "it_ae")
    ]);

    addFillEvent("#nane", "HMRC-MTD-VAT", "VRN", "968501689");
    addFillEvent("#nae", "HMRC-MTD-VAT", "VRN", "999999999");
    addFillEvent("#naefmtdfb", "HMRC-MTD-VAT", "VRN", "888896225");
    addFillEvent("#nast", "HMRC-MTD-VAT", "VRN", "999943620");
    addFillEvent("#nape", "HMRC-MTD-VAT", "VRN", "444444444");
    addFillEvent("#nanpt", "HMRC-MTD-VAT", "VRN", "888843156");
    addFillEvent("#namt", "HMRC-MTD-VAT", "VRN", "624760049");
    addFillEvent("#pp", "HMRC-MTD-VAT", "VRN", "144143496");
    addFillEvent("#dp", "HMRC-MTD-VAT", "VRN", "888888888");
    addFillEvent("#npde", "HMRC-MTD-VAT", "VRN", "999943621");
    addFillEvent("#ctc", "HMRC-MTD-VAT", "VRN", "666666666");
    addFillEvent("#lph", "HMRC-MTD-VAT", "VRN", "999973804");

    addAgentFillEvent("#ae", "HMRC-AS-AGENT", "AgentReferenceNumber", "XARN1234567", agentEnrolment)
    addAgentFillEvent("#avgr", "HMRC-AS-AGENT", "AgentReferenceNumber", "XARN1234567", agentEnrolmentVatGroupReg)
    addAgentFillEvent("#avgdr", "HMRC-AS-AGENT", "AgentReferenceNumber", "XARN1234567", agentEnrolmentVatGroupDereg)
    addAgentFillEvent("#acnpt", "HMRC-AS-AGENT", "AgentReferenceNumber", "XARN1234567", agentEnrolmentNoPartyType)

    addFillEvent("#it_nane", "HMRC-MTD-IT", "MTDITID", "1234567890");

    addAgentFillEvent("#it_ae", "HMRC-AS-AGENT", "AgentReferenceNumber", "XARN1234567", agentEnrolmentIt)
})();
