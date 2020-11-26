// ==UserScript==
// @name         Auth Login Helper - URLs
// @namespace    http://github.com/
// @version      1.1
// @description  TIMESAVER
// @author       Duane Matthew Hipwell
// @match        */auth-login-stub/gg-sign-in*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    var isLocal = (location.hostname == "localhost" || location.hostname == "127.0.0.1" || location.hostname == "192.168.0.1")

    var serviceMapping = new Map();

    var urlBoxSelector = "input[name=\"redirectionUrl\"]";

    var urlVatVcStandardBase = "/vat-through-software";
    var urlItsassStandardBase = "/income-through-software/return";
    var urlPitsassStandardBase = "/income-through-software/return/personal-income";

    var lastListClickedUrl = "";

    var htmlObject = '';

    function addFillEvent(serviceName, id) {
        $("#" + id).click(function() {
            var serviceObject = serviceMapping.get(serviceName);

            var fillUrl;

            if(isLocal) {
                fillUrl = "http://localhost:" + serviceObject.port;
            } else {
                fillUrl = "";
            }

            fillUrl = fillUrl + serviceObject.url;

            $(urlBoxSelector).val(fillUrl);
        });
    }

    function addFillEventListItem(serviceName, id) {
        $("#"+id).click(function() {
            var serviceObject = serviceMapping.get(serviceName);
            var extensionValue = id.split("_")[1];
            var urlExtension = serviceObject[extensionValue];

            var fillUrl;
            if(isLocal) {
                fillUrl = "http://localhost:" + serviceObject.port;
            } else {
                fillUrl = "";
            }
            fillUrl = fillUrl + serviceObject.url + urlExtension;

            $(urlBoxSelector).val(fillUrl);
        })
    }

    function addListToggleEvent(selector) {
        $(selector).click(function(){
            if(lastListClickedUrl != selector) { $(".loginHelperList").hide(); }
            $(selector + "Items").toggle();
            lastListClickedUrl = selector;
        })
    }

    function addGroupToggle(groupName) {
        $("#group_" + groupName + "_namePlate").click(function(){
            $(".loginHelperList").hide();
            $("#group_" + groupName + "_content").toggle();
        })
    }

    function generateBoxHtml(serviceName, id) {
        return {
            htmlType: "box",
            html: '<div class="button" id="' + id + '" style="margin:0;display:block;text-align:center;padding-top:9px;padding-bottom:9px;">' + serviceName + '</div>',
            id: id,
            serviceName: serviceName
        };
    }

    function generateListHtml(listName, listId, items) {
        var returnHtml = '';
        var returnBoxes = [];

        returnHtml += '<div id="' + listId + '" style="display: inline-block; margin-bottom: 20px; margin-right: 15px;">';
        returnHtml += '<div class="button column-one-third" id="' + listId + 'Name" style="margin:0;">' + listName + '</div>'
        returnHtml += '<div class="loginHelperList" id="' + listId + 'Items" style="display: none; width:25%; position:absolute; z-index:100">'
        returnHtml += '<div style="width:100%; height:2px; background-color: black;">';

        for(var i = 0; i < items.length; i ++) {
            returnHtml += items[i].html;
            returnHtml += '<div style="width:100%; height:2px; background-color: black;"></div>';
            returnBoxes.push(items[i].id);
        }

        returnHtml += '</div></div></div>'

        return {
            htmlType: "list",
            html: returnHtml,
            id: listId,
            serviceName: listName,
            boxes: returnBoxes
        };
    }

    function generateList(listName, listId, items) {
        $("<div id=\""+listId+"\" style=\"display: inline-block; margin-bottom: 20px; margin-right: 15px;\">").insertBefore(urlBoxSelector);

        var namePlate = "<div class=\"button column-one-third\" id=\""+listId+"Name\" style=\"margin:0;\">"+listName+"</div>"
        var listItems = $("<div class=\"loginHelperList\" id=\""+listId+"Items\" style=\"display: none; width:25%; position:absolute; z-index:100\">"+"</div>");
        listItems.append("<div style=\"width:100%; height:2px; background-color: black;\"></div>")

        for(var i = 0; i < items.length; i ++) {
            listItems.append(items[i].html);
            listItems.append("<div style=\"width:100%; height:2px; background-color: black;\"></div>");
        }

        $("#"+listId).append(namePlate);
        $("#"+listId).append(listItems);

        for(var j = 0; j < items.length; j++) {
            addFillEventListItem(listName, items[j].id);
        }

        addListToggleEvent("#"+listId);
    }

    function generateBox(name, id) {
        $("<div class=\"button\" id="+id+" style=\"margin-bottom: 20px;\">" + name + "</div>").insertBefore(urlBoxSelector);
        addFillEvent(name, id);
    }

    function createGroup(groupName, innerContent) {

        var contentId = 'group_' + groupName + '_content';

        $('<div class="group" id="group_' + groupName + '"><div class="groupNamePlate" id="group_' + groupName + '_namePlate"><b>' + groupName + '</b></div><div id="' + contentId + '"></div></div>').insertBefore(urlBoxSelector);
        $('#group_' + groupName).css("margin", "1% 0");

        $('#group_' + groupName + '_namePlate').css("cursor", "pointer");
        $('#group_' + groupName + '_namePlate').css("width", "100%");
        $('#group_' + groupName + '_namePlate').css("height", "20%");
        $('#group_' + groupName + '_namePlate').css("background-color", "green");
        $('#group_' + groupName + '_namePlate').css("color", "white");
        $('#group_' + groupName + '_namePlate').css("text-align", "center");
        $('#group_' + groupName + '_namePlate').css("box-sizing", "border-box");
        $('#group_' + groupName + '_namePlate').css("border", "3px solid black");
        $('#group_' + groupName + '_namePlate').css("padding", "0.3em 0");

        $('#group_' + groupName + '_content').css("width", "100%");
        $('#group_' + groupName + '_content').css("background-color", "LightGreen");
        $('#group_' + groupName + '_content').css("padding", "1em 1%");
        $('#group_' + groupName + '_content').css("box-sizing", "border-box");
        $('#group_' + groupName + '_content').css("border", "3px solid black");
        $('#group_' + groupName + '_content').css("border-top", "0");

        console.log(innerContent);

        for(var p = 0; p < innerContent.length; p++) {
            var currentContent = innerContent[p];
            $("#" + contentId).append(currentContent.html);

            if(currentContent.htmlType == "list") {
                addListToggleEvent("#" + currentContent.id);

                var boxes = currentContent.boxes;
                for(var a = 0; a < boxes.length; a++) {
                    addFillEventListItem(currentContent.serviceName, boxes[a]);
                }
            } else if(currentContent.htmlType == "box") {
                $("#" + currentContent.id).removeAttr('style');
                $("#" + currentContent.id).css("display", "inline-block");
                $("#" + currentContent.id).css("margin-bottom", "20px");
                $("#" + currentContent.id).css("margin-right", "15px");
                addFillEvent(currentContent.serviceName, currentContent.id);
            }
        }

        addGroupToggle(groupName);
    }

    $("<p>").insertBefore(urlBoxSelector);

    //VAT VC service mappings
    serviceMapping.set("vat-summary-frontend", {url: urlVatVcStandardBase, port: 9152, overview: "/vat-overview"});
    serviceMapping.set("vat-agent-client-lookup-frontend", {url: urlVatVcStandardBase + "/representative/client-vat-number", port: 9149});
    serviceMapping.set("vat-opt-out", {url: urlVatVcStandardBase + "/account/opt-out", port: 9166});
    serviceMapping.set("vat-correspondence-frontend", {url: urlVatVcStandardBase + "/account/correspondence", port: 9148,
                                                       root: "/", redirect: "/contact-preference-redirect",
                                                       changeEmailStart: "/change-email-address",
                                                       changeEmailSuccess: "/email-address-confirmation",
                                                       paperToDigitalaStart: "/contact-preference-email",
                                                       featureSwitch: "/test-only/feature-switch"});
    serviceMapping.set("vat-return-period-frontend", {
        url: urlVatVcStandardBase + "/account/returns",
        port: 9167,
        changeVatReturnDate: "/change-vat-return-dates"
    });
    serviceMapping.set("manage-vat-subscription-frontend", {
        url: urlVatVcStandardBase + "/account",
        port: 9167,
        changeBusinessAddress: "/change-business-address"
    });

    //ITSA Submission service mappings
    serviceMapping.set("income-tax-submission-frontend", {
        url: urlItsassStandardBase, port: 9302,
        start: "/2020/start",
        overview: "/2020/view",
        setMtditid: "/test-only/2020/agent-access/",
        setPriorSubmission: "/test-only/2020/prior-submission",
        additionalParameters: "/test-only/2020/additional-parameters",
        additionalParametersNino: "/test-only/2020/additional-parameters?NINO=AA123456A"
    });
    serviceMapping.set("personal-income-tax-submission-frontend", {
        url: urlPitsassStandardBase, port: 9308,
        ukdividends: "2020/dividends/uk-dividends",
        otherdividends: "2020/dividends/other-dividends",
        dividendscya: "2020/dividends/check-your-answers",
        interestcya: "2020/interest/check-your-answers"
    });

    var vatSummaryFrontendList = generateListHtml("vat-summary-frontend", "vsf_list", [
        generateBoxHtml("overview", "vsf_overview")
    ]);

    var vatCorrespondenceFrontend = generateListHtml("vat-correspondence-frontend", "vcf_list", [
        generateBoxHtml("root", "vcf_root"),
        generateBoxHtml("redirect", "vcf_redirect"),
        generateBoxHtml("change email journey start", "vcf_changeEmailStart"),
        generateBoxHtml("change email journey success", "vcf_changeEmailSuccess"),
        generateBoxHtml("paper to digital start", "vcf_paperToDigitalaStart"),
        generateBoxHtml("feature switches", "vcf_featureSwitch")
    ]);

    var vatAgentClientLookupFrontend = generateBoxHtml("vat-agent-client-lookup-frontend", "url_vaclf");
    var vatOptOut = generateBoxHtml("vat-opt-out", "url_voo");

    var vatReturnPeriodFrontend = generateListHtml("vat-return-period-frontend", "vrp_list", [
        generateBoxHtml("change vat return date", "vrp_changeVatReturnDate")
    ]);

    var manageVarSubscriptionFrontend = generateListHtml("manage-vat-subscription-frontend", "mvs_list", [
        generateBoxHtml("change vat return date", "mvs_changeBusinessAddress")
    ]);

    createGroup("VATVC", [
        vatSummaryFrontendList,
        vatAgentClientLookupFrontend,
        vatOptOut,
        vatCorrespondenceFrontend,
        vatReturnPeriodFrontend,
        manageVarSubscriptionFrontend
    ]);

    var incomeTaxSubmissionFrontend = generateListHtml("income-tax-submission-frontend", "its_list", [
        generateBoxHtml("start page", "its_start"),
        generateBoxHtml("overview page", "its_overview"),
        generateBoxHtml("set mtditid in sessions", "its_setMtditid"),
        generateBoxHtml("set prior submission values", "its_setPriorSubmission"),
        generateBoxHtml("set additional values", "its_additionalParameters"),
        generateBoxHtml("set additional values - NINO Prefill", "its_additionalParametersNino")
    ]);

    var personalIncomeTaxSubmissionFrontend = generateListHtml("personal-income-tax-submission-frontend", "pits_list", [
        generateBoxHtml("uk dividends page", "pits_ukdividends"),
        generateBoxHtml("other dividends page", "pits_otherdividends"),
        generateBoxHtml("dividends check your answers", "pits_dividendscya"),
        generateBoxHtml("interest check your answers", "pits_interestcya")
    ]);

    createGroup("ITSA", [
        incomeTaxSubmissionFrontend,
        personalIncomeTaxSubmissionFrontend
    ]);

})();
