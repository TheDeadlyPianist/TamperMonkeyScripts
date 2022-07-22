// ==UserScript==
// @name         Auth Login Helper - URLs
// @namespace    http://github.com/
// @version      2.6.2
// @description  TIMESAVER
// @author       Duane Matthew Hipwell
// @match        */auth-login-stub/gg-sign-in*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_listValues
// @require      http://code.jquery.com/jquery-3.4.1.min.js
// ==/UserScript==

(function() {
    'use strict';

    var topZ = 200;

    var hoverVar;

    var isLocal = (location.hostname == "localhost" || location.hostname == "127.0.0.1" || location.hostname == "192.168.0.1")

    var urlBoxSelector = "#redirectionUrl";
    var newUrlLocation = "#redirectionUrl-hint"

    async function getStorageJson() {
        var allEntries = await GM_listValues();
        var dataObject = {};

        allEntries.forEach( dataName => {
            var dataEntry = GM_getValue(dataName, {});
            dataObject[dataName] = dataEntry;
        })

        //console.log(JSON.stringify(dataObject));
    }

    function correctUrlForEnv(input) {
        var returnValue = input;

        if(!isLocal) {
            var regex = /((http[s]{0,1}:\/\/){0,1}localhost(:\d{4}){0,1})/
            returnValue = input.replace(regex, "");
        }

        return returnValue;
    }


    async function performRedirectUrlDelete(redirectName) {
        var allRedirectUrls = Object.values(await GM_getValue("redirects", {}));

        var index = allRedirectUrls.map(function(element) { return element.redirect_name; }).indexOf(redirectName);
        if(index > -1) {
            allRedirectUrls.splice(index, 1);
            await GM_setValue("redirects", allRedirectUrls);
            location.reload();
        } else {
            window.alert("Could not find the redirect URL");
        }
    }

    async function performBaseUrlDelete(baseUrlName) {
        var allBaseUrls = Object.values(await GM_getValue("baseUrls", {}));

        var index = allBaseUrls.map(function(element) {return element.base_name;}).indexOf(baseUrlName);
        if(index > -1) {
            var allRelatedRedirects = Object.values(await GM_getValue("redirects", {})).filter((redirElement) => {
                if(redirElement.redirect_base == allBaseUrls[index].base_name) {
                    return true;
                } else {
                    return false;
                }
            }).forEach((elem => { performRedirectUrlDelete(elem.redirect_name); }));

            allBaseUrls.splice(index, 1);
            await GM_setValue("baseUrls", allBaseUrls);
            location.reload();
        } else {
            window.alert("Could not find Base Url");
        }
    }

    async function performGroupDelete(groupName) {
        var allGroups = Object.values(await GM_getValue("groups", {}));

        var index = allGroups.indexOf(groupName);
        if(index > -1) {
            var allRelatedBase = Object.values(await GM_getValue("baseUrls", {})).filter((baseElement) => {
                if(baseElement.base_group == allGroups[index]) {
                    return true;
                } else {
                    return false;
                }
            }).forEach((elem => { performBaseUrlDelete(elem.base_name); }));

            allGroups.splice(index, 1);
            await GM_setValue("groups", allGroups);
            location.reload();
        } else {
            window.alert("Could not find group");
        }
    }

    function handleGroupDelete(groupName) {
        var confirmed = window.confirm("You are attempting to delete " + groupName + ".\n\nThis will delete all child data associated with it.\n\nAre you sure?");
        if(confirmed) {
            performGroupDelete(groupName);
        }
    }

    function handleBaseUrlDelete(baseUrlName) {
        var confirmed = window.confirm("You are attempting to delete " + baseUrlName + ".\n\nThis will delete all child data associated with it.\n\nAre you sure?");
        if(confirmed) {
            performBaseUrlDelete(baseUrlName);
        }
    }

    function handleRedirectUrlDelete(redirectName) {
        var confirmed = window.confirm("You are attempting to delete the redirect URL " + redirectName + ".\n\nAre you sure?");
        if(confirmed) {
            performRedirectUrlDelete(redirectName);
        }
    }

    function nameAsIdString(input) {
        var idString = input.replace(/[^A-Za-z0-9\-]/ig, "");
        return idString;
    }

    function addGroupToggle(groupName) {
        $("#group_" + groupName + "_namePlate_name").click(function(){
            $(".loginHelperList").hide();
            $("#group_" + groupName + "_content").toggle();
        })
    }

    function createGroup(groupName, innerContent) {
        var idString = nameAsIdString(groupName);

        var contentId = 'group_' + idString + '_content';

        var deleteButton = $('<div class="group_deleteButton govuk-button govuk-button--warning"></div>');
        var deleteButtonInside = $('<div>+</div>');

        deleteButtonInside
            .css("font-size", "2em")
            .css("transform", "rotate(45deg)");

        $(deleteButton).append(deleteButtonInside);

        var groupContainer = $('<div class="group" id="group_' + idString + '"></div>');
        var namePlate = $('<div class="groupNamePlate" id="group_' + idString + '_namePlate"></div>');
        var plateText = $('<div id="group_' + idString + '_namePlate_name"><b>' + groupName + '</b></div>');
        var content = $('<div id="' + contentId + '"></div>');

        deleteButton
            .css("display", "inline-block")
            .css("height", "100%")
            .css("user-select", "none")
            .css("margin", "0")
            .css("padding", "0 0.5em")
            .css("box-sizing", "border-box")
            .click(function() {
            handleGroupDelete(groupName);
        });


        plateText
            .css("display", "inline-block")
            .css("width", "90%")
            .css("user-select", "none")
            .css("font-size", "2em");

        $(groupContainer).insertBefore(urlBoxSelector);
        $(groupContainer).append(namePlate);
        $(namePlate).append(plateText);
        $(namePlate).append(deleteButton);
        $(groupContainer).append(content);

        $('#group_' + idString)
            .css("margin", "1% 0")
            .css("z-index", "-1");

        $('#group_' + idString + '_namePlate').css("cursor", "pointer");
        $('#group_' + idString + '_namePlate').css("width", "100%");
        $('#group_' + idString + '_namePlate').css("height", "20%");
        $('#group_' + idString + '_namePlate').css("background-color", "green");
        $('#group_' + idString + '_namePlate').css("color", "white");
        $('#group_' + idString + '_namePlate').css("text-align", "center");
        $('#group_' + idString + '_namePlate').css("box-sizing", "border-box");
        $('#group_' + idString + '_namePlate').css("border", "3px solid black");
        $('#group_' + idString + '_namePlate').css("padding", "0.3em 0");

        $('#group_' + idString + '_content').css("width", "100%");
        $('#group_' + idString + '_content').css("background-color", "LightGreen");
        $('#group_' + idString + '_content').css("padding", "1em 1%");
        $('#group_' + idString + '_content').css("box-sizing", "border-box");
        $('#group_' + idString + '_content').css("border", "3px solid black");
        $('#group_' + idString + '_content').css("border-top", "0");

        addGroupToggle(idString);
    }

    $("<p>").insertBefore(urlBoxSelector);

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////// New URL Functions /////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    async function handleNewGroupSubmit(name) {
        var allGroups = Object.values(await GM_getValue("groups", {}));

        var valid = true;
        if(allGroups.indexOf(name) > -1) { valid = false };

        if(valid) {
            allGroups.push(name);
            await GM_setValue("groups", allGroups);
            location.reload();
        } else {
            window.alert("Duplicate name. This group already exist.");
        }
    }

    async function handleNewBaseSubmit(name, url, group) {
        var allBaseUrls = Object.values(await GM_getValue("baseUrls", {}));

        var newBaseUrl = {
            base_name: name,
            base_url: url,
            base_group: group
        }

        var valid = true;
        allBaseUrls.forEach(function (element) {
            if(element.base_name == name) {
                valid = false;
            }
        });

        if(group == "n/a") {
            window.alert("Base URLs must be assigned to a group.");
        }else if(valid) {
            allBaseUrls.push(newBaseUrl);
            GM_setValue("baseUrls", allBaseUrls);
            location.reload();
        } else {
            window.alert("A base URL with this name already exist. For technical reasons, no two base URLs may share a name.");
        }
    }

    async function handleNewRedirectSubmit(name, url, group, base) {
        var newRedirectUrl = {
            redirect_name: name,
            redirect_url: url,
            redirect_group: group,
            redirect_base: base
        }

        var allRedirects = Object.values(await GM_getValue("redirects", {}));

        var valid = true;
        allRedirects.forEach(function (element) {
            if(element.redirect_name == name && element.redirect_group == group && element.redirect_base == base) {
                valid = false;
            }
        });

        if(valid) {
            allRedirects.push(newRedirectUrl);
            await GM_setValue("redirects", allRedirects);
            location.reload();
        } else {
            window.alert("Redirect URL with this name already exist in this group, under this base URL.");
        }
    }

    async function getBaseUrlsForGroup(group) {
        if(group == "n/a") {
            return [];
        } else {
            var allBaseUrls = Object.values(await GM_getValue("baseUrls", {})).filter((element) => {
                var groupName = element.base_group

                if(groupName == group) {
                    return true;
                } else {
                    return false;
                }
            }).map(function(element) {
                return element.base_name;
            });
            return allBaseUrls;
        }
    };

    async function showNewBox(inputType) {
        var baseUrlPlaceholder = "";
        var urlPlaceholder = "";

        var newInputSubmit = $('<div class="govuk-button">Submit</div>').css("user-select", "none");

        switch(inputType) {
            case "base":
                baseUrlPlaceholder = "Enter a name for the base URL";
                newInputSubmit.click(function() {handleNewBaseSubmit(
                    $(newInputElement)[0].value,
                    $(newUrlBox)[0].value,
                    $(newGroupDropdown)[0].value
                )});
                break;
            case "group":
                baseUrlPlaceholder = "Enter a name for the new group";
                newInputSubmit.click(function() {handleNewGroupSubmit($(newInputElement)[0].value);});
                break;
            case "redirect":
                baseUrlPlaceholder = "Enter a name for the new redirect";
                urlPlaceholder = "Enter a new redirect URL";
                newInputSubmit.click(function() {handleNewRedirectSubmit(
                    $(newInputElement)[0].value,
                    $(newUrlBox)[0].value,
                    $(newGroupDropdown)[0].value,
                    $(newBaseUrlDropdown)[0].value
                )});
                break;
            default:
                break;
        }

        var existingGroups = await GM_getValue("groups", {});

        $('.newUrlInputContainer').remove();

        var newGroupText = "Group Name";
        var redirText = "Redirect URL Name";
        var baseText = "Base URL Name";
        var inputTitle = "";
        var urlInputTitle = "";

        if(inputType == "redirect") {
           inputTitle = redirText;
            urlInputTitle = "New Redirect URL";
        } else if(inputType == "base") {
            inputTitle = baseText;
            urlInputTitle = "New Base URL";
        } else {
            inputTitle = newGroupText;
        }

        var newInputContainer = $('<div class="newUrlInputContainer"></div>')
        .css("margin-top", "20px")
        .css("margin-bottom", "3em")
        .css("display", "flex")
        .css("flex-direction", "column");

        var submitAndCancelContainer = $('<div class="govuk-button-group"></div>');

        var newInputLabel = $('<label for"baseInput" class="govuk-label">' + inputTitle + "</label>").css("user-select", "none");
        var newInputElement = $('<input class="govuk-input" id="baseInput" placeholder="' + baseUrlPlaceholder + '"></input>');
        var newInputTextContainer = $('<div class="govuk-form-group"></div>').append(newInputLabel).append(newInputElement);


        var newGroupDropdownLabel = $('<label class="govuk-label" for="newUrlGroup">Select Intended Group</label>');
        var newGroupDropdown = $('<select name="urlGroup" id="newUrlGroup" class="govuk-select"><option value="n/a">No group</option></select>');
        var newGroupDropdownContainer = $('<div class="govuk-form-group"></div>').append(newGroupDropdownLabel).append(newGroupDropdown);

        var newBaseUrlDropdownLabel = $('<label class="govuk-label" for="newUrlGroup">Select Intended Base URL</label>');
        var newBaseUrlDropdown = $('<select name="urlBase" id="newUrlBase" class="govuk-select"><option value="n/a">No base URL</option></select>');
        var newBaseUrlContainer = $('<div class="govuk-form-group"></div>').append(newBaseUrlDropdownLabel).append(newBaseUrlDropdown);

        var newUrlLabel = $('<label for"newBaseUrlInput" class="govuk-label">' + urlInputTitle + '</label>').css("user-select", "none");
        var newUrlBox = $('<input id="newBaseUrlInput" class="govuk-input" placeholder="Enter a URL"></input>');
        var newUrlContainer = $('<div class="govuk-form-group"></div>').append(newUrlLabel).append(newUrlBox);

        var newInputCancel = $('<div class="govuk-button govuk-button--secondary">Cancel</div>').css("user-select", "none").click(function() {
            $(newInputContainer).remove();
        });

        Object.values(existingGroups).forEach(function(element) {
            var newOption = '<option value="'+element+'">'+element+'</option>';
            $(newGroupDropdown).append(newOption);
        });

        $(newGroupDropdown).change(function() {
            var groupName = $(this)[0].value;
            getBaseUrlsForGroup(groupName).then(baseUrls => {
                $(newBaseUrlDropdown).empty();

                baseUrls.forEach(function(element) {
                    $(newBaseUrlDropdown).append('<option value="' + element + '">' + element + '</option>');
                });
            });
        });

        $(newInputContainer).append(newInputTextContainer);
        if(inputType == "base" || inputType == "redirect") {
            $(newInputContainer).append(newUrlContainer);
        }
        if(inputType != "group") {
            $(newInputContainer).append('<br>').append(newGroupDropdownContainer);
        }
        if(inputType == "redirect") {
            $(newInputContainer).append(newBaseUrlContainer);
        }
        $(newInputContainer).append("<p></p>");
        $(newInputContainer).append(submitAndCancelContainer)
        $(submitAndCancelContainer).append(newInputSubmit)
        $(submitAndCancelContainer).append(newInputCancel);
        $(newInputContainer).insertAfter("#but_newRedir");
    }

    $('<div class="govuk-button" id="but_newRedir">New Redirect URL</div>').css("user-select", "none")
        .insertAfter(newUrlLocation)
        .click(function() {
        showNewBox("redirect");
    });

    $('<div class="govuk-button" id="but_newBase">New Base URL</div>').css("user-select", "none").css("margin-right", "10px")
        .insertAfter(newUrlLocation)
        .click(function() {
        showNewBox("base");
    });

    $('<div class="govuk-button" id="but_newGroup">New URL Group</div>').css("user-select", "none").css("margin-right", "10px")
        .insertAfter(newUrlLocation)
        .click(function() {
        showNewBox("group");
    });


    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////// Construct Selection Window ////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    async function constructGroups() {
        var groups = await GM_getValue("groups", {})

        Object.values(groups).forEach(function (element) {
            createGroup(element, {});
        });
    }

    async function constructBaseUrls() {
        var baseUrls = await GM_getValue("baseUrls", {});
        Object.values(baseUrls).forEach(function(element) {
            var name = element.base_name;
            var baseUrlContentId = "base_" + nameAsIdString(element.base_name) + "_content";
            var groupContentId = "#group_" + nameAsIdString(element.base_group) + "_content";

            var tooltipContainer = $('<span></span>')
            .css("position", "absolute")
            .css("display", "inline-block")
            .css("border-bottom", "1px dotted black")
            .css("text-align", "center")
            .css("width", "auto")
            .css("bottom", "105%")
            .css("left", "50%")
            .css("margin-left", "-25%")
            .css("background-color", "black")
            .css("padding", "5px 2px")
            .css("border-radius", "6px")
            .css("visibility", "hidden")
            .css("z-index", 1);

            var container = $('<div id="base_' + nameAsIdString(name) + '"></div>')
            .css("min-width", "15%")
            .css("margin", "0")
            .css("margin-bottom", "2%")
            .css("margin-right", "5px")
            .css("display", "inline-block")
            .css("position", "relative");

            var containerName = $('<div class="govuk-button">'+name+'</div>')
            .css("display", "inline-block")
            .css("margin-right", "0")
            .css("margin-bottom", "0")
            .css("height", "2em")
            .hover(
                function () {
                    hoverVar = setTimeout(function() {
                        $(tooltipContainer).css("visibility", "visible");
                    }, 1500)
                },
                function () {
                    clearTimeout(hoverVar);
                    $(tooltipContainer).css("visibility", "hidden");
                }
            )
            .click(function() {
                clearTimeout(hoverVar);
                $(tooltipContainer).css("visibility", "hidden");
                var isHidden = $(containerContent).is(":hidden");
                if(isHidden) {
                    $(".content_container").each(function() {
                        $(this).hide();
                    });
                }
                $(container).css("z-index", topZ)
                topZ++;
                $(containerContent).toggle();
            });

            var deleteButton = $('<div class="govuk-button govuk-button--warning"></div>')
            .append($('<div>+</div>').css("transform", "rotate(45deg)"))
            .css("display", "inline-block")
            .css("margin-bottom", "0")
            .css("box-sizing", "border-box")
            .css("height", "2em")
            .click(function() { handleBaseUrlDelete(name); });

            var seperator = $('<div></div>')
            .css("width", "100%")
            .css("height", "0.5vh")
            .css("background-color", "#5ba85c");

            var containerContent = $('<div id="' + baseUrlContentId + '" class="content_container"></div>')
            //.css("width", "-webkit-fill-available")
            .css("margin", "0 0.78947em 0 0")
            .css("position", "absolute")
            .css("background-color", "MediumSeaGreen")
            .css("display", "flex")
            .css("flex-direction", "column")
            .css("border", "#00501a 5px solid")
            .css("border-top", "0")
            .hide();

            $(tooltipContainer).append(element.base_url);

            $(containerName).append(tooltipContainer);

            $(container).append(containerName);
            $(container).append(deleteButton);
            $(container).append(containerContent);
            $(containerContent).append(seperator);

            $(groupContentId).append(container);
        });
    }

    async function constructRedirectUrls() {
        var allRedirects = await GM_getValue("redirects", {});

        Object.values(allRedirects).forEach(function(element) {
            var groupContentId = "#group_" + nameAsIdString(element.redirect_group) + "_content";
            var baseId = "#base_" + nameAsIdString(element.redirect_base);
            var baseContentId = "#base_" + nameAsIdString(element.redirect_base) + "_content";

            var contentContainerSearchKey = groupContentId + " > " + baseId + " > " + baseContentId;
            var contentContainer = $(contentContainerSearchKey)[0];

            var deleteButton = $('<div class="govuk-button govuk-button--warning"></div>')
            .append($('<div>+</div>').css("transform", "rotate(45deg)"))
            .css("display", "inline-block")
            .css("border-bottom", "1px solid black")
            .css("margin", "0")
            .css("box-sizing", "border-box")
            .css("height", "2em")
            .click(function () {
                handleRedirectUrlDelete(element.redirect_name);
            });

            var newListOptionName = $('<span class="govuk-button"> &bull; ' + element.redirect_name + '</span>')
            .css("display", "inline-block")
            .css("width", "-webkit-fill-available")
            .css("margin", "0")
            .css("border-bottom", "1px solid black")
            .css("height", "2em")
            .css("white-space", "nowrap")
            .css("box-sizing", "border-box").click(async function() {
                var baseUrls = await GM_getValue("baseUrls", {});
                var url = "no url found";
                Object.values(baseUrls).forEach(function (baseElement) {
                    if(baseElement.base_name == element.redirect_base) {
                        url = baseElement.base_url;
                    }
                });

                url = correctUrlForEnv(url + element.redirect_url);

                $("#redirectionUrl")[0].value = url;
                $(".content_container").each(function () { $(this).hide(); })
            });

            var newListOption = $('<div></div>')
            .css("width", "auto")
            .css("height", "auto")
            .css("display", "flex")
            .css("flex-direction", "row")
            .append(newListOptionName).append(deleteButton);

            $(contentContainer).append(newListOption);
        });
    }

    constructGroups();
    constructBaseUrls();
    constructRedirectUrls();

    getStorageJson();
})();
