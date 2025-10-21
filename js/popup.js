var csv_data = [], csv_name = "", my_number = null, my_account_type = null, plan_duration = "Lifetime",  plan_type = 'Free', last_plan_type = 'Free', customer_email,customer_parent_email, popup_numbers = "", expiry_date, created_date;
let currentLanguage = 'default';
let allLanguageCodes = ALL_LANGUAGE_CODES;
let libphone = libphonenumber;
let country_info = "";
let allGroups = [],allContacts=[],allLabels=[],allLists = [], groups_selected = [],contacts_selected=[],labels_selected=[], lists_selected = [], messageToggleSwitchValue = "numbers", isMultipleAccount = false,multipleAccountShimmerShown = false, premiumTabRedDotDismissed = false,  otherNumbers = ['+911111111111', '+912222222222', "+913333333333", '+911111111111', '+912222222222', "+913333333333",'+911111111111', '+912222222222', "+913333333333", '+911111111111', '+912222222222', "+913333333333", '+911111111111', '+912222222222', "+913333333333", '+911111111111', '+912222222222', "+913333333333",'+911111111111', '+912222222222', "+913333333333", '+911111111111', '+912222222222', "+913333333333"], parentEmail = "", showAllMultNumbers = true;
let subscribed_date = null;
let attachment_obj = false, group_obj=false,customization_obj=false,isTourRunning=false;
let translatedSendObj,translatedGroupMsgObj,translatedCustomObj,translatedAttachments,translatedContactMsgObj;
let is_excel_uploaded = false;
let lastScrollPosition = 0,lastScrollPosition_contacts=0,selectedAll=false;
let autodownloadCampaignReport = false;
let handle_message_limit = false, sent_messages_count = 0, total_messages_count = 0;

// checking if mac or not
let isMac = navigator.platform.toLowerCase().includes("mac");
let isLinux = navigator.platform.toLowerCase().includes("linux");
let location_info = { name: 'international', name_code: "US", currency: "USD", default: true };
let numberToNameMap = new Map();
let p2p_segment = null;

// Exit full-screen mode in Mac
chrome.windows.getCurrent().then(window => {
    if (window.state === 'fullscreen' && isMac) {
        chrome.windows.update(window.id, { state: 'normal' });
    } 
});

$(function () {
    init();
});

async function convertPriceToLocale(price) {
    const exchangeRateAPI = "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json";
    const res = await fetch(exchangeRateAPI);
    const jsonData = await res.json();

    let { currency } = location_info;
   
    let formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        maximumFractionDigits: 0 
    });

    let exchangeRate = jsonData.usd[currency.toLowerCase()];
    let convertedPrice = formatter.format(Math.round(exchangeRate * 1.02 * parseFloat(price)));
    return convertedPrice;
}

async function multipleAccountButton() {
    return '';
}

async function basicButton() {
    return '';
}

async function advanceButton() {
    return '';
}

async function fetchTranslations(obj) {
    const translatedObj = JSON.parse(JSON.stringify(obj));
  
    for (const step of translatedObj.steps) {
      if (step.popover) {
        step.popover.title = await translate(step.popover.title);
        step.popover.description = await translate(step.popover.description);
      }
    }

    return translatedObj;
 }

 function handleMoreButtons() {
    const buttonContainer = $('#tours'); 
    const buttons = buttonContainer.find('.attachment-instructions-btn'); 
    const maxVisibleButtons = 3;

    if (buttons.length > maxVisibleButtons) {
        buttons.slice(maxVisibleButtons).hide();
        const moreButton = $('<button class="attachment-instructions-btn more-btn"><span class="attachment-instructions-text attachment-instructions CtaBtn">...more</span></button>');
        buttonContainer.append(moreButton);
        moreButton.on('click', function () {
            buttons.slice(maxVisibleButtons).addClass('active-class');  
            moreButton.remove();  
        });
    }
}

function handleAutoDownloadCampaignReport(){
    chrome.storage.local.get(['autodownloadCampaignReport'], function(res){
        if(res.autodownloadCampaignReport == undefined || res.autodownloadCampaignReport == null || res.autodownloadCampaignReport == true){
            autodownloadCampaignReport = true;
        }
        const autoDownloadReportInput = document.getElementById("auto_download_campaign_report");
        if(autodownloadCampaignReport){
            autoDownloadReportInput.checked = true;
        }
        chrome.storage.local.set({autodownloadCampaignReport: autodownloadCampaignReport});
        autoDownloadReportInput.addEventListener('change', function(){
            autodownloadCampaignReport = autoDownloadReportInput.checked;
            chrome.storage.local.set({autodownloadCampaignReport: autodownloadCampaignReport});
        });
    })
}

function setupImportExcelDropdown(suffix = '') {
    const importExcelDropdown = document.querySelector(`.import-excel-dropdown${suffix ? `[data-suffix="${suffix}"]` : ''}`);
    const importExcelButton = document.querySelector(`.import_excel_box${suffix ? `[data-suffix="${suffix}"]` : ''}`);
    const dropdownContent = document.querySelector(`.import-excel-dropdown-content${suffix ? `[data-suffix="${suffix}"]` : ''}`);
    const importFromDeviceOption = document.querySelector(`#import-from-device${suffix ? `-${suffix}` : ''}`);
    const importFileInput = document.querySelector(`#csv${suffix ? `-${suffix}` : ''}`);
    const importFromSheetsOption = document.querySelector(`.dropdown-item.google_sheets_box${suffix ? `[data-suffix="${suffix}"]` : ''}`);
    const googleSheetsContainer = document.querySelector(`#google-sheets-container${suffix ? `-${suffix}` : ''}`);
    


    if (!importExcelButton || !importExcelDropdown) return;

    importExcelButton.addEventListener('click', function (e) {
        e.stopPropagation();
        document.querySelectorAll('.dropdown.active').forEach(drop => {
            if (drop !== importExcelDropdown) drop.classList.remove('active');
        });
        document.querySelectorAll('.dropdown-container').forEach(container => {
            if (container !== dropdownContent) container.classList.add('hide');
        });
        importExcelDropdown.classList.toggle('active');
        if (dropdownContent) {
            dropdownContent.style.display = importExcelDropdown.classList.contains('active') ? 'block' : 'none';
        }
    });

    if (importFromDeviceOption && importFileInput) {
        importFromDeviceOption.addEventListener('click', function () {
            importFileInput.click();
            importExcelDropdown.classList.remove('active');
            if (dropdownContent) dropdownContent.style.display = 'none';
        });
    }

    if (importFromSheetsOption && googleSheetsContainer) {
        importFromSheetsOption.addEventListener('click', function () {
            toggleGoogleSheetsContainer(true,suffix);
            importExcelDropdown.classList.remove('active');
            if (dropdownContent) dropdownContent.style.display = 'none';
        });
    }

    document.addEventListener('click', function (e) {
        if (importExcelDropdown && !importExcelDropdown.contains(e.target)) {
            importExcelDropdown.classList.remove('active');
            if (dropdownContent) dropdownContent.style.display = 'none';
        }
    });
}

window.addEventListener('DOMContentLoaded', (event) => {
    handleMoreButtons()
    handleDeleteBin()
    handleShowTooltip();
    $(document).on('click', function(e) {

        if (!$(e.target).closest('#campaign-selector, #campaign_selector_groups').length) {
            $('#campaigns-container').addClass('hide');
            messageToggleSwitchValue === "numbers" ? $('#campaign-selector').removeClass('active') : $('#campaign_selector_groups').removeClass('active');
        }
        
        
        if (!$(e.target).closest('#template-selector').length) {
            $('#templates-container').addClass('hide');
            $('#template-selector').removeClass('active');
        }
    });
    getNextTour((nextTour,index) => {
        if (nextTour) {
          highlightTour(nextTour,index);
        }
    });
    setupImportExcelDropdown()
    setupTextareaToggleForExcelButton()

    var schedule_date= document.querySelector("#schedule_day");
    schedule_date.valueAsDate = new Date();
    let time = getCurrentTimein24HourFormat();
    chrome.storage.local.get('popupOpenCount', (result) => {
        const currentCount = result.popupOpenCount || 0;
        const newCount = currentCount + 1;
      
        chrome.storage.local.set({ popupOpenCount: newCount }, () => {
          console.log("Popup open count updated:", newCount);
        });
    });
      
    setTimeout(() => {
        document.querySelector("input#schedule_time").value = time;
    }, 100);
    document.querySelectorAll('input[name="message_type"]').forEach((radio) => {
        radio.addEventListener('change', () => {
            const selectedValue = document.querySelector('input[name="message_type"]:checked').value;
            toggleSendMessageToInput(selectedValue);
        });
    });
    handleAutoDownloadCampaignReport();
});

function showCustomizeContainer(){
    const message_box= document.querySelector(".message-box");
    const customize_container= document.querySelector(".customize_container");
    const attachment_instructions_container= document.querySelector(".message-box .attachment-instruction-secondary");
    if(message_box){
        message_box.style.marginBottom= "0px";
        message_box.style.borderRadius= "3px 3px 0px 0px";
    }
    if(attachment_instructions_container){
        attachment_instructions_container.hidden= "true"
    }
    if(customize_container){
        customize_container.style.display= "flex";
    }
}

function hideCustomizationContainer(){
    const message_box= document.querySelector(".message-box");
    const customize_container= document.querySelector(".customize_container");
    const caption_customize_container= document.querySelector(".caption_customize_container");
    const attachment_instructions_container= document.querySelector(".message-box .attachment-instruction-secondary");
    if(message_box){
        message_box.style.marginBottom= "10px";
        message_box.style.borderRadius= "3px";
    }
    if(attachment_instructions_container){
        attachment_instructions_container.hidden= false
    }
    if(customize_container){
        customize_container.style.display= "none";
    }
    if(caption_customize_container){
        caption_customize_container.style.display= "none";
    }
    showCaptionCustomizationContainer(false);
}

function populateCustomizeData() {
    let column_headers = csv_data[0] || ["Number","Profile Name"];
    const customize_section= document.querySelector(".customize_section");
    const caption_customize_section= document.querySelector(".caption_customize_section");
    if(customize_section){
        customize_section.innerHTML='';
        let customizeHtml=
        `
            <div class="customize_heading">Customizations: </div>
        `;
        column_headers.forEach((header, index)=>{
            customizeHtml+= `<div class="customize_box CtaBtn">${header}</div>`
        })

        customize_section.innerHTML= customizeHtml;
        const customizeBoxes= document.querySelectorAll(".customize_box");
        customizeBoxes.forEach((box, index)=>{
            box.addEventListener("click", (event)=>{
                var message = document.querySelector("textarea#message").value;
                message += " {{" + event.target.innerText + "}}";
                document.querySelector("textarea#message").value = message;
                chrome.storage.local.set({ popup_message: message });
            })
        })
    }
    if(caption_customize_section){
        caption_customize_section.innerHTML='';
        let customizeHtml=
        `
            <div class="customize_heading">Customizations: </div>
        `;
        column_headers.forEach((header, index)=>{
            customizeHtml+= `<div class="caption_customize_box CtaBtn">${header}</div>`
        })

        caption_customize_section.innerHTML= customizeHtml;
        const customizeBoxes= document.querySelectorAll(".caption_customize_box");
        customizeBoxes.forEach((box, index)=>{
            box.addEventListener("click", async(event)=>{
                let captionForIndividualAttachment = await new Promise((resolve) => {
                    chrome.storage.local.get(['captionForIndividualAttachment'], (res) => {
                        resolve(res.captionForIndividualAttachment|| []);
                    });
                });
                document.querySelectorAll(".caption-input").forEach((ele) => {
                    if(!ele.classList.contains("hide")){
                        var eleId=ele.id.substring(ele.id.search(/\d/))
                        ele.value+=" {{" + event.target.innerText + "}}";
                        captionForIndividualAttachment[eleId]=ele.value;
                        chrome.storage.local.set({ 'captionForIndividualAttachment': captionForIndividualAttachment })
                        return;
                    }
                })
            })
        })
    }
}

function showCaptionCustomizationContainer(showConatiner){
    const captionCustomizationContainer= document.querySelector(".caption_customize_container");
    if(captionCustomizationContainer){
        if(showConatiner)
            captionCustomizationContainer.style.display= "flex";
        else 
            captionCustomizationContainer.style.display= "none";
    }
}

async function toggleCaptionCustomizationInputDiv(){
    const captionCustomizationInputDiv = document.querySelector('.caption_customization_input_div');
    let internal_csv_data=await new Promise((resolve) => {
        chrome.storage.local.get(['csv_data'], (res) => {
            resolve(res.csv_data|| []);
        });
    });
    if (captionCustomizationInputDiv) {
        if(internal_csv_data.length>0)
             showCaptionCustomizationContainer(true);
        else
            showCaptionCustomizationContainer(false);
    }
}

function renderItems({ name, objId, serizalizeId, isFirst = false, type = 'group' }) {
    const displayBoxClass = '.groups_display_box';
    const displayBox = document.querySelector(displayBoxClass);
    let selectedArray = getSelectedArray(type);

    let htmlContent = displayBox.innerHTML;
    if (selectedArray.length <= 1 || isFirst) {
        htmlContent = ``;
    }

    htmlContent += `
        <span class="group_tag CtaBtn" id=${objId} data-id-field=${serizalizeId}>
            <span class="group">${name}</span>
            <img class="delete_group_tag" src="./logo/closeBtn.png" title="Remove ${type}">
        </span>`;

    displayBox.innerHTML = htmlContent;
}

function showItems(type = 'group') {
    const itemsContainer = document.querySelector('#groups_container');
    itemsContainer.innerHTML = '';

    const selectedArray = getSelectedArray(type);
    const allItems = getAllItems(type);

    const containerHtml = allItems
        .filter(item => !selectedArray.includes(item.id._serialized || item.id))
        .map(item => `
            <div class="dropdown-item" id="${item.objId || item.id}" data-id-field="${item.id._serialized || item.id}">
                ${item.name}
            </div>
        `).join('');

    itemsContainer.innerHTML = containerHtml;

    document.querySelector('.search_group_input').addEventListener('input', function () {
        const inputValue = this.value.toLowerCase();

        allItems.forEach(item => {
            const itemElement = document.querySelector(`#groups_container #${item.objId || item.id}`);
            if (!itemElement) return;

            const isMatch = item.name?.toLowerCase().includes(inputValue);
            const isSelected = selectedArray.includes(item.id._serialized || item.id);

            itemElement.classList.toggle('hide', !(isMatch && !isSelected));
        });
    });

    document.querySelectorAll("#groups_container .dropdown-item").forEach(listItem => {
        listItem.addEventListener('click', function () {
            const objId = this.id;
            const name = this.innerText;
            const serizalizeId = this.getAttribute('data-id-field');

            if (!selectedArray.includes(serizalizeId)) {
                selectedArray.push(serizalizeId);
                chrome.storage.local.set({ [getStorageKey(type)]: selectedArray });

                renderItems({ name, objId, serizalizeId, type });
                listItem.classList.add('hide');

                if (selectedArray.length === getAllItems(type).length) {
                    $('.message-box').removeClass('hide_visibility');
                }
                handleDeleteBin();
                showGroupsCampaignSelectorOrSave();
            }

        });
    });
}

async function handleSelectAll() {
    const listItems = document.querySelectorAll("#groups_container .dropdown-item");
    const listItemContainer = document.querySelector("#groups_container");
    let type = messageToggleSwitchValue;
    let selectedArray = getSelectedArray(type);
    let allItems = getAllItems(type);
    
    if (selectedArray.length === allItems.length && allItems.length) {
        let msg = await translate(`All ${type} are selected`);
        alert(msg);
        return;
    }
    
    if(!allItems.length){
        let msg = await translate(`There is no ${type} available`)
        alert(msg)
        return;
    }

    if (listItemContainer.classList.contains("hide")) {
        selectedArray = allItems.map(item => item.id._serialized || item.id);
        setSelectedArray(type, selectedArray);
        chrome.storage.local.set({ [getStorageKey(type)]: selectedArray });
    } else {
        const visibleItems = Array.from(listItems).filter(item => !item.classList.contains('hide'));
        let updatedSelectedArray = visibleItems.map(item => item.getAttribute('data-id-field'));
        
        selectedArray = [...new Set([...selectedArray, ...updatedSelectedArray])];
        setSelectedArray(type, selectedArray);
        chrome.storage.local.set({ [getStorageKey(type)]: selectedArray });

        listItemContainer.classList.add("hide");
        document.querySelector(".message-box").classList.remove("hide_visibility");
    }
    document.getElementById('select-all').checked = false;
    renderSelectedItems();
}


function getSelectedArray(type) {
    if (type === 'groups') {
        return groups_selected;
    } else if (type === 'contacts') {
        return contacts_selected;
    } else if (type === 'labels') {
        return labels_selected;
    } else if (type === 'lists') {
        return lists_selected;
    }
    return [];
}

function setSelectedArray(type, array) {
    if (type === 'groups') {
        groups_selected = array;
    } else if (type === 'contacts') {
        contacts_selected = array;
    } else if (type === 'labels') {
        labels_selected = array;
    } else if (type === 'lists') {
        lists_selected = array;
    }
}

function getAllItems(type) {
    if (type === 'groups') {
        return allGroups;
    } else if (type === 'contacts') {
        return allContacts;
    } else if (type === 'labels') {
        return allLabels;
    } else if (type === 'lists') {
        return allLists;
    }
    return [];
}

function getStorageKey(type) {
    if (type === 'groups') {
        return 'groups_selected';
    } else if (type === 'contacts') {
        return 'contacts_selected';
    } else if (type === 'labels') {
        return 'labels_selected';
    } else if (type === 'lists') {
        return 'lists_selected';
    }
    return '';
}

function initvars() {
    document.getElementById("time_gap_type").style.display = 'none';
    chrome.storage.local.get(['popup_message', 'show_advance_options', 'time_gap', 'time_gap_checked', 'time_gap_type', 'batch_checked', 'batch_size', 'batch_gap', 'file_name', 'csv_data', 'customization', 'schedule_time', 'my_number','my_account_type', 'plan_type', 'last_plan_type', 'plan_duration', 'customer_name','customer_email','customer_parent_email', 'premiumUsageObject', 'countOfDaysTranslateUsed', 'lastDaySinceTranslateUsed', 'attachmentShimmerLastShowed', 'countOfDaysAttachmentShimmerShown', 'pausedCampaign', 'allGroupData', 'allContactData','allLabelData','allListData','groups_selected', 'contacts_selected','labels_selected', 'lists_selected','send_messages_to', 'resumeCampaign', 'subscribed_date', 'linuxInputAttachments', 'linuxCSVAttachment', 'location_info', 'currentLanguage', 'pausedCampaignsList', 'expiry_date', 'created_date', 'rated_5_star', 'RUNTIME_CONFIG', 'isMultipleAccount', 'premiumTabRedDotDismissed', 'multipleAccountShimmerShown', 'p2p_segment'], function (result) {

        if (result.currentLanguage) {
            currentLanguage = result.currentLanguage;
        } 
        if(result.my_account_type){
            my_account_type = result.my_account_type;
        }
        if (result.popup_message !== undefined) {
            document.querySelector("textarea#message").value = result.popup_message;
        }
        if (result.schedule_time !== undefined) {
            document.querySelector("#schedule_time").value = result.schedule_time;
        }
        if(result.allGroupData){
            allGroups = result.allGroupData; 
        }
        if(result.allContactData){
            allContacts = result.allContactData;
            contactNumberToNameMap();
        }
        if(result.allLabelData){
            allLabels = result.allLabelData
        }
        if(result.allListData){
            allLists = result.allListData
        }
        if(result.subscribed_date) {
            subscribed_date = result.subscribed_date;
        }
        
        if(result.isMultipleAccount !== undefined) {
            isMultipleAccount = result.isMultipleAccount;
        }
        if(result.multipleAccountShimmerShown !== undefined) {
            multipleAccountShimmerShown = result.multipleAccountShimmerShown;
        }
        if(result.premiumTabRedDotDismissed !== undefined) {
            premiumTabRedDotDismissed = result.premiumTabRedDotDismissed;
        }
        if ((result.file_name !== undefined) && (result.file_name !== '')) {
            is_excel_uploaded = true;
            set_csv_styles(result.file_name);
            showCustomizeContainer();
            csv_data = result.csv_data;
            if (csv_data) {
                var column_headers = csv_data[0];
                // $('#customized_arr').empty();
                // $('#customized_arr').append($('<option disabled selected></option>').val('Select Option').html('Select Option'));
                // $.each(column_headers, function (i, p) {
                //     $('#customized_arr').append($('<option></option>').val(p).html(p));
                // });
                populateCustomizeData();
            }
        }
        if (result.my_number === undefined)
            my_number = null;
        else {
            my_number = result.my_number;
        }
        if (!my_number) {
            document.getElementById("add_number_popup").style.display = 'block';
            trackButtonView('add_number_popup');
            trackSystemEvent('no_number_popup', 'track');
        } else {
            trackSystemEvent('my_number_popup', my_number);
        }
        plan_type = 'Free';
        plan_duration = 'Lifetime';
        chrome.storage.local.set({ plan_type, plan_duration });
        if (result.created_date !== undefined) {
            created_date = result.created_date;
        }
        if(result.expiry_date !== undefined){
            expiry_date = result.expiry_date;
        }
        last_plan_type = 'Free';
        chrome.storage.local.set({ last_plan_type });
        if(result.location_info !== undefined) {
            location_info = result.location_info;
        }
        if(result.customer_email)
            customer_email = result.customer_email;
        if(result.customer_parent_email)
            customer_parent_email = result.customer_parent_email;
        // console.log(customer_email, customer_parent_email);
        loadScheduledCampaigns(result.scheduled_campaigns);
        scheduleExpiredPopup();
        if(result.p2p_segment) {
            p2p_segment = result.p2p_segment;
        }
        else{
            console.log("P2P Segment not found, defaulting to 'none'");
        }

        // Show rate us 5 star button
        if (result.RUNTIME_CONFIG?.displayReviewPopup && !result.rated_5_star && created_date && get_days_diff(new Date(), created_date) >= 180) {
            document.getElementById('rate-us').removeAttribute('hidden');
        }

        // Handle download template
        if (result.RUNTIME_CONFIG?.templateExcelUrl) {
            document.getElementById('download_template').href = result.RUNTIME_CONFIG.templateExcelUrl;
            document.getElementById('download_template_2').href = result.RUNTIME_CONFIG.templateExcelUrl;
        }

        if (isPremium()) {
            document.querySelector(".premium_feature_block").style.display = "flex";
            // RED DOT COMMENTED OUT
            // const showRedDot = (
            //   !premiumTabRedDotDismissed &&
            //   !isMultipleAccount &&
            //   subscribed_date &&
            //   get_days_diff(new Date(), subscribed_date) > 7
            // );

            // const redDotHTML = showRedDot ? '<span class="red-dot-superscript">●</span>' : '';
            const redDotHTML = ''; // Always empty - red dot disabled
            
            
            const premiumTab = document.getElementById('select_premium_container');
            const isMonthlyPlanWithGold = premiumTab && premiumTab.classList.contains('monthly-plan');
            
            if (result.customer_name) {
              const customer_first_name = result.customer_name.trim().split(' ')[0];
              
              if (isMonthlyPlanWithGold) {
                
                document.getElementById("user_info_text").innerHTML =
                   `<div class='premium_username' style="font-weight:700;word-break:break-word;">
                     ${customer_first_name}
                   </div>
                   <div style="font-weight:500;" class="premium_user_plan_type">
                     ${plan_type} Premium${redDotHTML}
                   </div>`;
              } else {
                
                document.getElementById("user_info_text").innerHTML =
                   `<div style="font-weight:500;" class="premium_user_plan_type">
                     ${customer_first_name} - ${plan_type} Premium${redDotHTML}
                   </div>`;
              }
            } else {
                document.getElementById("user_info_text").innerHTML = 
                 `<div style="font-weight:500;" class="premium_user_plan_type">
                    ${plan_type} Premium${redDotHTML}
                  </div>`;
            }
          
            const userImg = document.getElementById("add_business_img");
            userImg.src = "logo/user-1.png";
            userImg.style.width = '80%';
            userImg.style.height = '70%';
            document.getElementById("premium_support_block").style.display = 'block';
            document.getElementById("non_premium_header_text").style.display = 'none';
            document.getElementById("user_info_text").style.display = 'block';
          }
        else {
            document.getElementById("premium_support_block").style.display = 'none';
            document.getElementById("user_info_text").style.display = 'none';
            document.getElementById("non_premium_header_text").style.display = 'block';
            document.getElementById("non_premium_header_text").innerText = getNonPremiumHeaderText();
        }
        if(isAdvancePromo()) {
            document.querySelector(".what_is_advancepromo_block").style.display = 'block';
        } else {
            document.querySelector(".what_is_advancepromo_block").style.display = 'none';
        }
        if (isPremiumFeatureAvailable()) {
            if (result.time_gap_checked) {
                document.querySelector("#time_gap_checked").checked = result.time_gap_checked;
                document.getElementById("time_gap_type").style.display = 'flex';
                if (result.time_gap_type) {
                    document.querySelector("#" + result.time_gap_type).checked = true;
                }
                if(result.time_gap_type=="random")
                    disableNumberTimeGapInput("sec");
                else
                    disableNumberTimeGapInput("random");
            }
            if (result.time_gap) {
                var values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20];
                if (values.includes(parseInt(result.time_gap))) {
                    const index = values.indexOf(parseInt(result.time_gap));
                    document.querySelector("#slider_time_gap_sec").value = index;
                }
                else if (result.time_gap > 20) {
                    document.querySelector("#slider_time_gap_sec").value = values.length - 1;
                }
                else if (result.time_gap == 0) {
                    document.querySelector("#slider_time_gap_sec").value = 3;
                }
                document.querySelector("#time_gap_sec").value = result.time_gap;
            }
            if (result.batch_checked) {
                document.querySelector("#batch_checked").checked = result.batch_checked;
                document.getElementById("batch_info").style.display = 'grid';
            }
            if (result.batch_size) {
                var values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 25, 30, 35, 40, 45, 50];
                if (values.includes(parseInt(result.batch_size))) {
                    const index = values.indexOf(parseInt(result.batch_size));
                    document.querySelector("#slider_batch_size").value = index;
                }
                else if (result.batch_size > 50) {
                    document.querySelector("#slider_batch_size").value = values.length - 1;
                }
                else if (result.batch_gap == 0) {
                    document.querySelector("#slider_batch_size").value = values.length - 1;
                }
                document.querySelector("#batch_size").value = result.batch_size;
            }
            if (result.batch_gap) {
                var values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 25, 30, 35, 40, 45, 50];
                if (values.includes(parseInt(result.batch_gap))) {
                    const index = values.indexOf(parseInt(result.batch_gap));
                    document.querySelector("#slider_batch_gap").value = index;
                }
                else if (result.batch_gap > 50) {
                    document.querySelector("#slider_batch_gap").value = values.length - 1;
                }
                else if (result.batch_gap == 0) {
                    document.querySelector("#slider_batch_gap").value = 13;
                }
                document.querySelector("#batch_gap").value = result.batch_gap;
            }
        }
        else {
            if (result.time_gap_checked) {
                document.querySelector("#time_gap_checked").checked = result.time_gap_checked;
                document.getElementById("time_gap_type").style.display = 'flex';
            }
            document.querySelector("#sec").checked = true;
            disableNumberTimeGapInput("random");
            document.querySelector("#time_gap_sec").value = 30;
        }
        
        // Changing "live support" btn to "Email Support" btn for non-premium indonesian numbers
        if(result.my_number && result.my_number.startsWith(62) && !isPremium()){
            document.getElementById('live_support_text').hidden = true;
            document.getElementById('email_support_text').hidden = false;
        }
        if (result.groups_selected) {
            groups_selected = result.groups_selected;
        }
        if (result.contacts_selected) {
            contacts_selected = result.contacts_selected;
        }
        if(result.labels_selected){
            labels_selected = result.labels_selected
        }
        if(result.lists_selected){
            lists_selected = result.lists_selected
        }
        if(result.send_messages_to){
            const typeToSelector = {
                numbers: '#message_type_numbers',
                groups: "#message_type_groups",
                contacts: "#message_type_contact",
                labels: "#message_type_label",
                lists: "#message_type_list"
            };

            messageToggleSwitchValue = result.send_messages_to;

            if (typeToSelector[result.send_messages_to]) {
                document.querySelector(typeToSelector[result.send_messages_to])?.click();
            }

            if (result.popup_message !== undefined) {
                document.querySelector('#message').value= result.popup_message;
            }
        }

        // updating premium usage for time gap and batch gap
        if(result.premiumUsageObject!==undefined){
            let updatedPremiumUsageObject = {...result.premiumUsageObject };
            if (result.time_gap_checked) {
                updatedPremiumUsageObject= {...updatedPremiumUsageObject, timeGap: true};
            }
            if(result.batch_checked){
                updatedPremiumUsageObject= {...updatedPremiumUsageObject, batching: true};
            }
            chrome.storage.local.set({'premiumUsageObject': updatedPremiumUsageObject});
        }
        // Showing shimmer effect for translate feature - first 5 days
        let today = new Date().toDateString();
        let lastDay = result.lastDaySinceTranslateUsed || "";
        let countDays = result.countOfDaysTranslateUsed || 0;
        if(lastDay == today || countDays > 5) {
            $('#language-selector').removeClass('shimmer');
            $('#customization-in-box').removeClass('shimmer');
            $('#translate-icon').removeClass('shimmer');
        }
        else {
            chrome.storage.local.set({'countOfDaysTranslateUsed': countDays + 1});
            chrome.storage.local.set({'lastDaySinceTranslateUsed': today});
        }

        // Showing shimmer effect for attachment feature - first 3 days
        const lastDayWhenAttachmentShimmerShown = result.attachmentShimmerLastShowed || "";
        const countOfDaysAttachmentShimmerShown = result.countOfDaysAttachmentShimmerShown || 0;
        if(lastDayWhenAttachmentShimmerShown==today || countOfDaysAttachmentShimmerShown>3){
            // $('#add-attachments').removeClass('shimmer');
        } else {
            chrome.storage.local.set({'countOfDaysAttachmentShimmerShown': countOfDaysAttachmentShimmerShown + 1});
            chrome.storage.local.set({'attachmentShimmerLastShowed': today});
        }
        document.querySelector('#schedule_selector').addEventListener('click', async function(e){
            chrome.storage.local.get(['scheduled_campaigns'], function(res){
                const scheduledCampaigns = res.scheduled_campaigns || [];
                loadScheduledCampaigns(scheduledCampaigns);
                $('#schedule_container').toggleClass('hide');
                $('#schedule_selector').toggleClass('active');
            });
        })
        if(result.pausedCampaign && result.pausedCampaign.paused == true){
            let pausedCampaignsList = result.pausedCampaignsList;
            if(!pausedCampaignsList)
                pausedCampaignsList = [];
            let pausedCampaignData = result.pausedCampaign;
            pausedCampaignsList.push({
                ...pausedCampaignData,
                campaignDate: getTodayDate(),
            });
            result.pausedCampaignsList = pausedCampaignsList;
            result.pausedCampaign = null;
            chrome.storage.local.set({pausedCampaign: null});
            chrome.storage.local.set({pausedCampaignsList: pausedCampaignsList});
        }
        if(result.resumeCampaign && result.resumeCampaign.isCampaignRunning == true && result.pausedCampaign){
            result.pausedCampaign.index= result.resumeCampaign.index;
            let pausedCampaignsList = result.pausedCampaignsList;
            if(!pausedCampaignsList)
                pausedCampaignsList = [];
            let pausedCampaignData = result.pausedCampaign;
            pausedCampaignsList.push({
                ...pausedCampaignData,
                campaignDate: getTodayDate(),
            });
            result.pausedCampaignsList = pausedCampaignsList;
            chrome.storage.local.set({pausedCampaign: null});
            chrome.storage.local.set({pausedCampaignsList: pausedCampaignsList});
            chrome.storage.local.set({
                'resumeCampaign': {
                    'isCampaignRunning': false,
                    'index': 0,
                }
            });
        }
        document.querySelector('#paused_campaign_selector').addEventListener('click', async function(e){
            chrome.storage.local.get(['pausedCampaignsList'], function(res){
                const pausedCampaignsList = res.pausedCampaignsList || [];
                let newPausedCampaignsList = pausedCampaignsList.filter((campaign) => {
                    let pausedDate = campaign.campaignDate;
                    let todayDate = getTodayDate();
                    let dateDiff = dateDiffInDays(todayDate, pausedDate);
                    return dateDiff<=7;
                });
                loadPausedCampaigns(newPausedCampaignsList);
                $('#paused_campaign_container').toggleClass('hide');
                $('#paused_campaign_selector').toggleClass('active');
                chrome.storage.local.set({pausedCampaignsList: newPausedCampaignsList});
            });
        });
        if (result.linuxInputAttachments) {
            convertURLToFileAndFireChangeEvent('linuxInputAttachments', 'select-attachments', result.linuxInputAttachments);
        }
        if(result.linuxCSVAttachment){
            convertURLToFileAndFireChangeEvent('linuxCSVAttachment', 'csv', result.linuxCSVAttachment);
        }
    });
    setListOrLabel();
}

function getCountryNameWithSpecificPricing() {
    let { name: country_name, name_code: country_code } = location_info;
    if (Object.keys(COUNTRY_WITH_SPECIFIC_PRICING).includes(country_code)) {
        country_name = COUNTRY_WITH_SPECIFIC_PRICING[country_code];
    } else {
        country_name = 'international';
    }
    return country_name;   
}

function convertURLToFileAndFireChangeEvent(dataType, inputId, inputAttachments){
    const files = inputAttachments.map(fileData => {
        return dataURLtoFile(fileData.data, fileData.name, fileData.type);
    });

    const dataTransfer = new DataTransfer();

    files.forEach(file => {
        dataTransfer.items.add(file);
    });

    const inputElement = document.getElementById(inputId);
    inputElement.files = dataTransfer.files;

    const event = new Event('change', { bubbles: true });
    inputElement.dispatchEvent(event);

    chrome.storage.local.set({ [dataType]: null });
}

function dataURLtoFile(dataurl, filename, mimeType) {
    const arr = dataurl.split(',');
    const mime = mimeType || arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
}


function showMultipleAccountShimmer() {
    const buyPremiumBlock = document.querySelector('#buy_premium_block');
    
    if (buyPremiumBlock && !buyPremiumBlock.classList.contains('shimmer')) {
        buyPremiumBlock.classList.add('shimmer');
    }
    
    setTimeout(() => {
        if (buyPremiumBlock) {
            buyPremiumBlock.classList.remove('shimmer');
        }
    }, 10000);
}

function getNonPremiumHeaderText() {
    return 'Prime Sender – All Features Included';
}

function handlePausedCampaign(pausedCampaignData){
    if(!isAdvanceFeatureAvailable()) {
        chrome.storage.local.set({pausedCampaign: null});
        chrome.storage.local.set({pausedCampaignsList: null});
        chrome.storage.local.set({
            'resumeCampaign': {
                'isCampaignRunning': false,
                'index': 0,
            }
        });
        sendMessageToBackground({ type: 'show_advance_popup', feature: 'resume_campaign' });
        window.close();
        return;
    }
    const {numbers, message, time_gap, csv_data, customization, caption_customization, random_delay, batch_size, batch_gap, caption} = pausedCampaignData.campaignData;
    const campaign_type = pausedCampaignData.campaignData.campaign_type;
    const startIndex= pausedCampaignData.index;
    chrome.storage.local.set({'attachmentsData': pausedCampaignData.attachmentsData}, function(){
        let canSendCampaign = checkIfCanSendCampaign(numbers.length);
        if(!canSendCampaign){
            sendMessageToBackground({ type: 'show_message_count_over_popup', sent_count: sent_messages_count, total_count: total_messages_count });        
            window.close();
            return;
        }
        if(campaign_type == 'group_message')
            sendMessageToBackground({ type: 'group_message', groups: numbers, message: message, time_gap: time_gap, csv_data: csv_data, customization: customization, caption_customization: caption_customization, random_delay: random_delay, batch_size: batch_size, batch_gap: batch_gap,caption: caption, startIndex: startIndex, paused_report_rows: pausedCampaignData.report_rows, paused_sent_count: pausedCampaignData.sent_count, campaign_type: campaign_type  });
        else if(campaign_type == 'list_message'){
            sendMessageToBackground({ type: 'list_message', lists: numbers, message: message, time_gap: time_gap, csv_data: csv_data, customization: customization, caption_customization: caption_customization, random_delay: random_delay, batch_size: batch_size, batch_gap: batch_gap,caption: caption, startIndex: startIndex, paused_report_rows: pausedCampaignData.report_rows, paused_sent_count: pausedCampaignData.sent_count, campaign_type: campaign_type  });
        }
        else
            sendMessageToBackground({ type: 'number_message', numbers: numbers, message: message, time_gap: time_gap, csv_data: csv_data, customization: customization, caption_customization: caption_customization, random_delay: random_delay, batch_size: batch_size, batch_gap: batch_gap,caption: caption, startIndex: startIndex, paused_report_rows: pausedCampaignData.report_rows, paused_sent_count: pausedCampaignData.sent_count, campaign_type: campaign_type  });
        chrome.storage.local.set({pausedCampaign: null});
        window.close();
    });
    chrome.storage.local.set({ 'resumeCampaign': {
        'isCampaignRunning': false,
        'index': 0,
    }});
    trackButtonClick('popupjs_resume_campaign');
}

async function loadPausedCampaigns(pausedCampaigns){
    $('#paused_campaign_container').html('');

    if (pausedCampaigns && pausedCampaigns.length > 0) {
        for (let index = 0; index < pausedCampaigns.length; index++) {
            let campaignName = pausedCampaigns[index].campaign_name || "Campaign-" + Number(index+1);
            let campaignDate= formatScheduleDate(pausedCampaigns[index].campaignDate);
            $('#paused_campaign_container').append(`
                <div class="dropdown-item">
                    <p id="paused_campaign_${index}" class="campaign_name text">
                        <img src="./logo/excel_icon.png"/>
                        <span style="color: #009A88;">${campaignName}</span>
                        <span style="color: #5D6063;">${campaignDate}</span>
                    </p>
                    <img id="${index}" class="paused_campaign_resume_btn btn CtaBtn" src="./logo/resume_logo.png" style="margin-right:3px;"/>
                    <img id="${index}" class="paused_campaign_delete_btn btn CtaBtn" src="./logo/delete-icon.png" style="padding:4px 4px 4px 0;margin:0px;" />
                </div>`
            );
        }
    } else {
        $('#paused_campaign_container').append(`<div class="dropdown-item">${await translate("No paused campaigns")}</div>`);
    }

    $('.paused_campaign_resume_btn').click(function() {
        let index = $(this).attr('id');
        const newPausedCampaigns = pausedCampaigns.filter((campaign, i) => i != index);
        chrome.storage.local.set({pausedCampaignsList: newPausedCampaigns});
        handlePausedCampaign(pausedCampaigns[index]);
    });
    $('.paused_campaign_delete_btn').click(function () {
        let index = $(this).attr('id');
        const newPausedCampaigns = pausedCampaigns.filter((campaign, i) => i != index);
        chrome.storage.local.set({pausedCampaignsList: newPausedCampaigns}, function(res){
            loadPausedCampaigns(newPausedCampaigns);
        });
    });
}

function init() {
    checkVisit();
    initvars();
    setListOrLabel();
    getMessage();
    loadConfigData();
    sendMessageToBackground({ type: 'reload_contacts'});
    sendMessageToBackground({ type: 'reload_favorites'});
}

function setListOrLabel() {
    let favouriteOption = document.querySelector(".favourite_id")
    let labelOption = document.querySelector(".label_id")
    chrome.storage.local.get(["my_account_type"],(res)=>{
        my_account_type = res.my_account_type;
        if(my_account_type === "Normal"){
            favouriteOption.classList.remove("hide")
            labelOption.classList.add("hide")
        }else{
            labelOption.classList.remove("hide")
            favouriteOption.classList.add("hide")
        }
    })
}

function checkVisit() {
    chrome.storage.local.get(['no_of_visit'], function (res) {
        let visit_count = res.no_of_visit || 0;

        // Check if there is an open WhatsApp Web tab
        chrome.tabs.query({ url: "*://web.whatsapp.com/*" }, function (tabs) {
            if (tabs.length > 0) {
                // If WhatsApp Web tab is already open and is not active, activate it
                if(!tabs[0].active) {
                    chrome.tabs.update(tabs[0].id, { active: true });
                }
            } else {
                // Else open a new tab for WhatsApp Web
                chrome.tabs.create({ url: "https://web.whatsapp.com" });
            }
        });
        
        chrome.storage.local.set({no_of_visit: visit_count + 1});
        trackSystemEvent('extension_visit', visit_count);
    })
};

// Load AWS Config Data from Chrome Storage to Local Data (for popup js and ga-code js)
function loadConfigData() {
    chrome.storage.local.get(['CONFIG_DATA'], (res) => {
        let configData = res.CONFIG_DATA;
        if (configData) {
            if (configData.GA_CONFIG)
                GA_CONFIG = safeMergeObject(GA_CONFIG, configData.GA_CONFIG);
            if (configData.FAQS)
                FAQS = safeMergeObject(FAQS, configData.FAQS);
            if (configData.PRICING_PAGE_LINK)
                PRICING_PAGE_LINK = safeMergeObject(PRICING_PAGE_LINK, configData.PRICING_PAGE_LINK);
            if (configData.RUNTIME_CONFIG)
                RUNTIME_CONFIG = safeMergeObject(RUNTIME_CONFIG, configData.RUNTIME_CONFIG);
            if (configData.MESSAGE_LIMIT) {
                MESSAGE_LIMIT = safeMergeObject(MESSAGE_LIMIT, configData.MESSAGE_LIMIT);
                handleMessageLimit();
            }
        }
    })
}

function safeMergeObject(target = {}, source = {}) {
    Object.keys(source).forEach(key => {
        target[key] = source[key];
    });
    return target;
}

function getPricingLink(countryName, duration, both = true) {
    duration = duration.toLowerCase();
    const base = PRICING_PAGE_LINK[countryName]?.[duration];
    
    if (!base) {
        console.error(`Invalid country or duration: ${countryName}, ${duration}`);
        return {};
    }

    const result = {};

    if (both) {
        result.basic = `https://buy.stripe.com/${base["basic"]}`;
        result.advance = `https://buy.stripe.com/${base["advance"]}`;
    } else {
        result.advance = `https://buy.stripe.com/${base["advance"]}`;
    }

    return result;
}

function handleMessageLimit() {  
    if (!isExpired()) return;

    let today = formatToIsoDate(new Date());
    let planKey = `${last_plan_type}${plan_type}`;
    let daysSinceExpiry = dateDiffInDays(today, expiry_date);

    let activeConfig = getActiveMessageLimitConfig(planKey, daysSinceExpiry);
    if (activeConfig) {       
        chrome.storage.local.get(['MessageLimitData'], (res) => {
            // Reset Daily Limit Data
            let data = res.MessageLimitData;
            if (!data || !data.last_updated || data.last_updated < today || data.total_count != activeConfig.dailyLimit) {
                data = {
                    sent_count: 0,
                    total_count: activeConfig.dailyLimit,
                    last_updated: today
                }
            }
            
            chrome.storage.local.set({ 'MessageLimitData': data});

            // Update Global Variables
            handle_message_limit = true;
            sent_messages_count = data.sent_count;
            total_messages_count = data.total_count;

            // Update UI Values
            const messagesRemainingDiv = document.getElementById('messages_remaining_count_div');
            const messagesRemainingCount = document.getElementById('messages_remaining_count');
            if (messagesRemainingDiv && messagesRemainingCount) {
                messagesRemainingDiv.hidden = false;
                messagesRemainingCount.innerText = (total_messages_count - sent_messages_count)+"/"+(total_messages_count);
            }    
        });       
    }
}

function getActiveMessageLimitConfig(planKey, daysSinceExpiry) {
    const config = MESSAGE_LIMIT[planKey];
    if (!config || !config.isActive || !config.phases) return null;

    // Find the latest matching phase
    const applicablePhase = [...config.phases]
        .sort((a, b) => b.startAfterDays - a.startAfterDays) // Sort descending
        .find(phase => daysSinceExpiry >= phase.startAfterDays);

    return applicablePhase || null;
}

function checkIfCanSendCampaign(current_messages_count) {
    if (handle_message_limit) {
        return (sent_messages_count + current_messages_count <= total_messages_count);
    }
    return true;
}

function sendMessageToBackground(message) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, message);
    });
}

function show_error(error) {
    document.getElementById("error_message").style.display = 'block';
    document.getElementById("error_message").innerText = error;
}

function show_error_html(error_html) {
    document.getElementById("error_message").style.display = 'block';
    document.getElementById("error_message").innerHTML = error_html;

    const reloadBtn = document.getElementById("reload_whatsapp");
    if (reloadBtn) {
        reloadBtn.addEventListener('click', () => {
            // Reload the active tab
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs[0]?.id) {
                    toggleSendMessageToInput('numbers');
                    chrome.tabs.reload(tabs[0].id);
                    window.close();
                }
            });
        });
    }
}

function reset_error() {
    document.getElementById("error_message").innerText = '';
    document.getElementById("error_message").style.display = 'none';
}

async function sendMessageFunction() {
    try {
        let caption =await new Promise((resolve) => {
            chrome.storage.local.get(['captionForIndividualAttachment'], (res) => {
                resolve(res.captionForIndividualAttachment|| []);
            });
        });
        chrome.storage.local.set({ 'captionForIndividualAttachment': [] })
        document.querySelector(".captionTextAreas").innerHTML="";
        var messageSendingTo = messageToggleSwitchValue || 'numbers';
        var numbers_str = document.querySelector("textarea#numbers").value;
        var message = document.querySelector("textarea#message").value;
        var attachments_str = document.querySelector("#attachments-container").innerText;
        var customization = true;
        let caption_customization = true;
        var time_gap, random_delay = false, batch_size, batch_gap;
        let send_attachment_first = false;
        if ($("#time_gap_checked").is(":checked")) {
            if ($("#time_gap_type input[type='radio']:checked").val() === 'sec') {
                time_gap = parseInt(document.querySelector("#time_gap_sec").value);
            }
            if($("#time_gap_type input[type='radio']:checked").val() === 'random') {
                time_gap = 4; //Avg of random delay
                random_delay = true;
            }
        }
        else {
            if(!isPremiumFeatureAvailable()){
                time_gap = parseInt(30);
            }else{
                time_gap = parseInt(3);
            }
        }
        if ($("#batch_checked").is(":checked")) {
            if(!isPremiumFeatureAvailable()){
                sendMessageToBackground({ type: 'show_premium_popup', feature: 'batching' });
                window.close();
                return;
            }
            else {
                batch_size = document.querySelector("#batch_size").value;
                batch_gap = document.querySelector("#batch_gap").value;
                if (batch_gap)
                    batch_gap = parseInt(batch_gap);
                if (batch_size)
                    batch_size = parseInt(batch_size);
            }
        }
        if ($('#attachment-first-checkbox').is(":checked")) {
            send_attachment_first = true;
        }

        var numbers = getFilteredNumbers(numbers_str).split(",").map((num) => (country_info.dial_code + num));
        if (!numbers_str && messageSendingTo=='numbers') {
            show_error("Please enter numbers to send")
            return;
        }
        if(groups_selected.length == 0 && messageSendingTo=='groups') {
            show_error("Please select groups to send")
            return;
        }
        if(contacts_selected.length == 0 && messageSendingTo=='contacts') {
            show_error("Please select contacts to send")
            return;
        }
        if(labels_selected.length == 0 && messageSendingTo=='labels') {
            show_error("Please select labels to send")
            return;
        }
        if(message.trim().length == 0 && attachments_str.length == 0) {
            show_error("Please enter message or attachment");
            return;
        }
        chrome.storage.local.get(["daysSinceInstallation"], (res) => {
            let daysSinceInstallation = res.daysSinceInstallation;
            if(caption.length > 0 && daysSinceInstallation < 10){
                chrome.storage.local.set({ isCaptionUsed:true });
            }
        });

        let recipients, recipients_type, campaign_type;
        if (messageSendingTo === 'numbers') {
            recipients = numbers;
            recipients_type = 'numbers';
            campaign_type = 'number_message';
        } else if (messageSendingTo === 'groups') {
            recipients = groups_selected;
            recipients_type = 'groups';
            campaign_type = 'group_message';
        } else if (messageSendingTo === 'contacts') {
            recipients = contacts_selected.map(number => number.replace("@c.us", ""));
            recipients_type = 'numbers';
            campaign_type = 'number_message'; 
        } else if(messageSendingTo === "labels"){
            let labelsContacts = [];

            labels_selected.forEach(selectedLabel => {
                const label = allLabels.find(label => label.id === selectedLabel);
                if (label && label.contacts) {
                    labelsContacts.push(...label.contacts.map(contact => contact.replace("@c.us", "")));
                }
            });
            recipients = labelsContacts;
            recipients_type = 'numbers';
            campaign_type = 'number_message'; 
        } else if(messageSendingTo === "lists"){
            recipients = lists_selected.map(item => item.endsWith("@c.us") ? item.replace("@c.us", "") : item);
            recipients_type = 'lists',
            campaign_type = 'list_message'
        }

        let canSendCampaign = checkIfCanSendCampaign(recipients.length);
        if (!canSendCampaign) {
            sendMessageToBackground({ 
                type: 'show_message_count_over_popup', 
                sent_count: sent_messages_count, 
                total_count: total_messages_count 
            });
        } else {
            sendMessageToBackground({
                type: campaign_type,
                [recipients_type]: recipients,
                message,
                time_gap,
                csv_data,
                customization,
                caption_customization,
                random_delay,
                batch_size,
                batch_gap,
                caption,
                send_attachment_first
            });
            trackSuccess("send_button_success");
        }

        window.close();
        return;
    } catch (error) {
        console.error("Send Button Error:", error);
        trackError("send_button_error", error);
        show_error_html("Oops, seems like an internal error! <span class='CtaBtn' id='reload_whatsapp' style='font-weight: bold; cursor: pointer;'>Click here to refresh</span>");
    } 
}

async function messagePreparation() {
    reset_error();
    let attachments = await new Promise((resolve) => {
        chrome.storage.local.get(['attachmentsData'], (res) => {
            resolve(res.attachmentsData || []);
        });
    });

    if (attachments.length > 3) {
        const confirmOverlay = document.querySelector(".confirm-ovelay");
        confirmOverlay.style.display = "flex";
        const cancelButton = document.querySelector(".cancelAction");
        const okButton = document.querySelector(".doAction");
        cancelButton.addEventListener("click", () => {
            confirmOverlay.style.display = "none";
        })
        okButton.addEventListener("click", () => {
            confirmOverlay.style.display = "none";
            sendMessageFunction();
        })
    }
    else {
        sendMessageFunction();
    }
}

async function process_sheet(file, campaign = false) {  
    if (!file) return;
    let processed = false;
    !campaign && set_csv_styles(file.name);

    try {
        let parsedData;
        if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
            parsedData = await get_csv_sheet_data(file);
        } else {
            parsedData = await get_xlsx_sheet_data(file);
        }

        processed = process_sheet_data_and_validate(parsedData,campaign);
        if(campaign) return;
    } catch (error) {
        console.error('Error processing sheet:', error);
    }

    if (processed) {
        populateCustomizeData();
        showCustomizeContainer();
        showCaptionCustomizationContainer(true);
    } else {
        unset_csv_styles();
        customization_obj && driver(translatedCustomObj).destroy();
        customization_obj = false;
    }
}



function extractSheetId(url) {
    const regex = /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/;
    const match = url.match(regex);
    
    return match ? match[1] : null;
}

async function fetchGoogleSheetData(sheetsUrl, campaign = false) {
    const sheetId = extractSheetId(sheetsUrl);
    if (!sheetId) {
        throw new Error('invalid_url');
    }
    const exportUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
    
    try {

        showLoadingIndicator();
        const response = await fetch(exportUrl);
        
        if (!response.ok) {
            if (response.status === 403) {
                throw new Error('access_denied');
            } else if (response.status === 404) {
                throw new Error('not_found');
            } else {
                throw new Error('fetch_failed');
            }
        }

        let fileName = 'google-sheet.csv';
        const contentDisposition = response.headers.get('Content-Disposition');
        if (contentDisposition) {
            const fileNameMatch = contentDisposition.match(/filename="(.+?)"/i);
            if (fileNameMatch && fileNameMatch[1]) {
                fileName = fileNameMatch[1];
                if (!fileName.toLowerCase().endsWith('.csv')) {
                    fileName += '.csv';
                }
            }
        }
        
        const csvData = await response.text();
        const blob = new Blob([csvData], { type: 'text/csv' });
        const file = new File([blob], fileName, { type: 'text/csv' });
        await process_sheet(file,campaign);

        hideLoadingIndicator();
        toggleGoogleSheetsContainer(false,campaign && "campaign");
        trackButtonClick('fetch_google_sheets');
        return true;
    } catch (error) {
        console.error('Error processing Google Sheets:', error);
        
        // Check for CORS or fetch errors which indicate access problems
        if (error.toString().includes('Failed to fetch')) {
            error.message = 'access_denied';
        }
        
        hideLoadingIndicator();
        handleGoogleSheetsError(error, sheetsUrl);
        trackError('fetch_google_sheets_error', error.message);
        // Don't throw the error to prevent console errors
        // throw error;
        return false;
    }
}

function showLoadingIndicator() {
    hideLoadingIndicator();
    const container = document.getElementById('google-sheets-container');
    container.classList.add('loading-active');
    
    const loadingIndicator = document.createElement('div');
    loadingIndicator.id = 'sheets-loading';
    loadingIndicator.innerHTML = '<span>Fetching data...</span>';
    document.querySelector('#google-sheets-container').appendChild(loadingIndicator);
}

function hideLoadingIndicator() {
    const loadingIndicator = document.getElementById('sheets-loading');
    if (loadingIndicator) {
        loadingIndicator.remove();
    }
    const container = document.getElementById('google-sheets-container');
    container.classList.remove('loading-active');
}
function toggleGoogleSheetsContainer(show, suffix = '') {
    const containerId = `google-sheets-container${suffix ? `-${suffix}` : ''}`;
    const inputId = `google-sheets-url${suffix ? `-${suffix}` : ''}`;
    const container = document.getElementById(containerId);
    const sheetsButton = document.querySelector(`.google_sheets_box${suffix ? `[data-suffix="${suffix}"]` : ''}`);

    if (!container || !sheetsButton) return;

    if (show) {
        container.classList.add('active');
        container.style.display = 'flex';
        const input = document.getElementById(inputId);
        if (input) input.focus();
        sheetsButton.style.display = 'none';
    } else {
        container.classList.remove('active');
        setTimeout(() => {
            container.style.display = 'none';
        }, 300);
        sheetsButton.style.display = 'inline-flex';
    }
}

function handleGoogleSheetsError(error, sheetsUrl) {
    let userMessage = 'Error fetching Google Sheets data.';
    let showAccessInstructions = false;
    if (error.message === 'invalid_url') {
        userMessage = 'Invalid Google Sheets URL. Please check the URL and try again.';
    } else if (error.message === 'access_denied') {
        userMessage = 'Access to this Google Sheet is restricted.';
        showAccessInstructions = true;
    } else if (error.message === 'not_found') {
        userMessage = 'This Google Sheet could not be found. Please check the URL.';
    } else if (error.message === 'fetch_failed') {
        userMessage = 'Failed to fetch the Google Sheet. Please try again later.';
    }
    show_error(userMessage);
    if (showAccessInstructions) {
        showAccessInstructionsPopup(sheetsUrl);
    }
}

function showAccessInstructionsPopup(sheetsUrl) {
    const popup = document.createElement('div');
    popup.className = 'access-instructions-popup';
    popup.innerHTML = `
        <h3>Access Required</h3>
        <p>This Google Sheet requires download access. Please follow these steps:</p>
        <ol>
            <li>Open the Google Sheet in your browser</li>
            <li>Click on "Share" in the top right corner</li>
            <li>Click on "General access" and select "Anyone with the link"</li>
            <li>Make sure the permission is set to "Viewer" or higher</li>
            <li>Click "Done" to save the changes</li>
            <li>Try fetching the sheet again</li>
        </ol>
        <div style="display: flex; justify-content: flex-end; margin-top: 20px;">
            <button id="open-sheet-btn">Open Sheet</button>
            <button id="close-instructions-btn">Close</button>
        </div>
    `;
    document.body.appendChild(popup);
    document.getElementById('open-sheet-btn').addEventListener('click', () => {
        window.open(sheetsUrl, '_blank');
    });
    document.getElementById('close-instructions-btn').addEventListener('click', () => {
        document.body.removeChild(popup);
    });
}


function get_csv_sheet_data(csv_file) {
    return new Promise((resolve, reject) => {
        Papa.parse(csv_file, {
            complete: function (result) {
                try {
                    const worksheet = XLSX.utils.json_to_sheet(result.data);
                    const workbook = XLSX.utils.book_new();
                    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet 1');
                    const parsedData = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: true });
                    resolve(parsedData);
                } catch (error) {
                    reject(error);
                }
            },
            header: true,
            error: function (error) {
                reject(error);
            }
        });
    });
}

function get_xlsx_sheet_data(xlsx_file) {
    return new Promise(async (resolve, reject) => {
        try {
            var reader = new FileReader();
            reader.onload = e => {
                const workbook = XLSX.read(e.target.result, { type: 'binary' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const parsedData = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: true });
                resolve(parsedData);
            };
            reader.readAsBinaryString(xlsx_file);
        } catch (error) {
            reject(error);
        }
    })
}

function getParsePhoneNumber(number) {
    try {
        const phoneNumber = libphonenumber.parsePhoneNumber('+'+number);
        return phoneNumber.nationalNumber;
    } catch (error) {
        console.log(error);
        return number;
    }
}

function contactNumberToNameMap() {
    allContacts.forEach(contact => {
        const cleaned = String(contact.number).replace(/\D/g, "");
        const phoneNumber = getParsePhoneNumber(cleaned);
        numberToNameMap.set(phoneNumber, contact.name || contact.pushname || "");
    });
}

function process_sheet_data_and_validate(data, campaign) {
    let validated = false;
    if (data && data.length > 0) {
        let cleaned_csv_data = [data[0]];
        let invalid_csv_data = [[...data[0], 'Invalid Reason']];
        let column_headers = data[0];
        let uniqueRows = new Set();
        let invalid_cells = [];

        // Process rows
        for (let i = 1; i < data.length; i++) {
            const row = data[i];
            if (row[0]) {
                // Validate numeric value
                if (/[a-zA-Z]/.test(row[0])) {
                    invalid_csv_data.push([
                        ...row,
                        `Cell value: "${row[0]}" contains alphabetic characters, it must be numeric values.`
                    ]);
                    invalid_cells.push({
                        row: i + 1,
                        col: 1,
                        colLetter: getColumnLetter(0),
                        value: row[0]
                    });
                } else {
                    // Normalize the number intelligently
                    const cleaned = String(row[0]).replace(/\D/g, "");
                    const phoneNumber = getParsePhoneNumber(cleaned);
                    const last10 = cleaned.slice(-10);
                    // Serialize for deduplication
                    const dedupeRow = [cleaned, ...row.slice(1)];
                    const serializedRow = JSON.stringify(dedupeRow);

                    if (!uniqueRows.has(serializedRow)) {
                        uniqueRows.add(serializedRow);

                        let cleanedRow = [...row];

                        // If only one column, append profile name
                        if (column_headers.length === 1) {
                            const foundName = numberToNameMap.get(phoneNumber) || numberToNameMap.get(last10) || "Whatsapp User";
                            cleanedRow.push(foundName);
                        } 

                        cleaned_csv_data.push(cleanedRow);
                    }
                }
            }
        }

        // Generate comma-separated list of raw numbers (original input)
        let numbers = cleaned_csv_data.slice(1).map(r => r[0]).join(',');

        // Validate headers
        let isFirstRowValid = true;
        for (const element of column_headers) {
            if (!isNaN(Number(element)) && element.toString().length >= 10) {
                invalid_cells = [{
                    row: 1,
                    col: 1,
                    colLetter: getColumnLetter(0),
                    value: column_headers[0]
                }];
                isFirstRowValid = false;
                break;
            }
        }

        if (!isFirstRowValid) {
            showInvalidExcelPopup(
                cleaned_csv_data,
                invalid_csv_data,
                invalid_cells,
                "The first row appears to be missing headers."
            );
        } else if (invalid_cells.length > 0) {
            showInvalidExcelPopup(
                cleaned_csv_data,
                invalid_csv_data,
                invalid_cells,
                `${invalid_cells.length} cell${invalid_cells.length > 1 ? 's' : ''} in first column contain an invalid format.`
            );
        } else {
            if (campaign) {
                document.getElementById("campaign-numbers").value = numbers;
                document.querySelector('.import-excel-dropdown[data-suffix="campaign"]').style.display = "none";
            } else {
                if (column_headers.length === 1) {
                    column_headers.push("Profile Name");
                }

                validated = true;
                csv_data = cleaned_csv_data;
                chrome.storage.local.set({
                    csv_data: cleaned_csv_data,
                    popup_numbers: numbers
                });

                $('#invalid-excel-popup').addClass('hide');
                $('#numbers').val(numbers).click();
                replaceNumbers(numbers);
            }
        }
    }
    return validated;
}

function getColumnLetter(index) {
    let letters = '';
    while (index >= 0) {
        letters = String.fromCharCode((index % 26) + 65) + letters;
        index = Math.floor(index / 26) - 1;
    }
    return letters;
}

function showInvalidExcelPopup(cleaned_csv_data, invalid_csv_data, invalid_cells, invalid_reason) {
    const popup = document.getElementById('invalid-excel-popup');
    const reason = document.getElementById('invalid-excel-reason');
    const list = document.getElementById('invalid-cell-examples');
    const uploadButton = document.getElementById('remove-invalid-rows');
    const downloadButton = document.getElementById('download-invalid-rows');
    const uploadButtonActionText = document.getElementById('action-remove-invalid-rows')
    const downloadButtonActionText = document.getElementById('action-download-invalid-rows')

    reason.innerText = invalid_reason;
    list.innerHTML = '';

    const max_examples = 5;
    const remaining_cells = invalid_cells.length - max_examples;
    invalid_cells.slice(0, max_examples).forEach((cell, index) => {
        const li = document.createElement('li');
        li.className = 'reason';
        li.textContent = `Row ${cell.row}, Column ${cell.colLetter}: "${cell.value}"`;
        list.appendChild(li);

        if (index === max_examples - 1) {
            li.textContent = `...and ${remaining_cells} more invalid ${remaining_cells > 1 ? 'cells' : 'cell'}.`;
            list.appendChild(li);
        }
    });

    popup.classList.remove('hide');

    if (invalid_reason.toLowerCase().includes("missing headers")) {
        uploadButton.style.display = 'none';
        downloadButton.style.display = 'none';
        uploadButtonActionText.style.display = 'none';
        downloadButtonActionText.style.display = 'none';
    } else {
        uploadButton.style.display = 'inline-block';
        downloadButton.style.display = 'inline-block';
        uploadButtonActionText.style.display = 'inline-block';
        downloadButtonActionText.style.display = 'inline-block';
    }

    if(cleaned_csv_data.length === 1){
        uploadButton.style.display = 'none';
        uploadButtonActionText.style.display = 'none';
    }

    uploadButton.addEventListener('click', async () => {
        if (!cleaned_csv_data || cleaned_csv_data.length === 0) return;
    
        const cleanedFile = create_csv(cleaned_csv_data, csv_name);
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(cleanedFile);
    
        const fileInput = document.getElementById('csv');
        fileInput.files = dataTransfer.files;
        fileInput.dispatchEvent(new Event('change', { bubbles: true }));

        trackSystemEvent('remove_invalid_rows', 'remove_invalid_rows');
    });

    downloadButton.addEventListener('click', async () => {
        if (!invalid_csv_data || invalid_csv_data.length === 0) return;
    
        const invalidFile = create_csv(invalid_csv_data, 'Invalid Rows ' + csv_name);
        const url = URL.createObjectURL(invalidFile);
    
        const a = document.createElement('a');
        a.href = url;
        a.download = invalidFile.name;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        trackSystemEvent('download_invalid_rows', 'download_invalid_rows');
    });

    trackSystemEvent('invalid_excel', 'invalid_excel');
}

function create_csv(data, filename = "cleaned_data.csv") {
    const csvString = Papa.unparse(data);
    const blob = new Blob([csvString], { type: 'text/csv' });
    const file = new File([blob], filename, { type: 'text/csv' });
    return file;
}

function set_csv_styles(file_name) {
    if (file_name) {
        csv_name = file_name.substring(0, 15)
        if(file_name.length > 15) 
            file_name = csv_name + '...';
        
        $('#campaign-name').val(csv_name);
        $('#campaign-selector').css('display', 'none');
        $('#uploaded-csv').prop('hidden', false).text(file_name);
        $('#customization').prop('checked', true).trigger('change');
        $('#import_excel_text').css('display', 'none');
        is_excel_uploaded = true;
        chrome.storage.local.set({ file_name: csv_name });
    }
}

function unset_csv_styles() {
    $('#csv').val('');
    $('#campaign-name').val('');
    $('#campaign-selector').css('display', 'flex');
    $('#uploaded-csv').prop('hidden', true).text('');
    $('#customization').prop('checked', false).trigger('change');
    $('#import_excel_text').css('display', 'flex');
    is_excel_uploaded = false;
    chrome.storage.local.set({ csv_data: [], file_name: '' });
    csv_data=[];
}

function getMessage() {

    $('#sender').click(function () {
        if (isPremiumExpired()|| is_p2p_applicable()) {
          sendMessageToBackground({ type: 'show_premium_popup', feature: 'send_message' });
          window.close();
          return;
        } else {
            trackButtonClick('send_message_button_eligible');
        }

        messagePreparation();
        trackButtonClick('send_message_button');
    });
    $('#rate-us').click(function () {
        window.open(RUNTIME_CONFIG.reviewUrl);
        chrome.storage.local.set({ rated_5_star: true });
    })
    $('#help').click(function () {
        sendMessageToBackground({ type: 'help' });
        trackButtonClick('chat_support');
        window.close();
    });
    $('#how_to_use').click(function () {
        trackButtonClick('how_to_use_prime_sender');
        if (messageToggleSwitchValue !== "numbers") {
            document.querySelector("#message_type_numbers").click()
          }
        driver(translatedSendObj).drive()
        removeHighlightTour()
    });
    $('#request_chat_premium').click(function () {
        sendMessageToBackground({ type: 'request_chat_premium' });
        trackButtonClick('request_chat_premium');
    });
    // $('#request_zoom_premium').click(function () {
    //     if (isAdvanceFeatureAvailable()) {
    //         sendMessageToBackground({ type: 'request_zoom_premium' });
    //         trackButtonClick('request_zoom_premium');
    //     }
    //     else {
    //         sendMessageToBackground({ type: 'show_advance_popup', feature: 'zoom_call_support' });
    //     }
    //     window.close();
    // });
    // $('#request_call_premium').click(function () {
    //     sendMessageToBackground({ type: 'request_call_premium' });
    //     trackButtonClick('request_call_premium');
    // });
    $('#chat_link').click(function () {
        sendMessageToBackground({ type: 'chat_link' });
        window.close();
    });

    $('#select_premium_features').click(async function () {
        document.querySelector('.premium_features_parent_div').classList.add('black_background');
        const functionality = document.getElementById('popup_functionality');
        const premiumFeatures = document.getElementById('show_premium_features');
        if (functionality) functionality.style.display = 'none';
        if (premiumFeatures) premiumFeatures.style.display = 'block';

        const functionalityTab = document.getElementById('select_functionality_container');
        const premiumTab = document.getElementById('select_premium_container');
        if (functionalityTab) functionalityTab.classList.remove('active');
        if (premiumTab) premiumTab.classList.add('active');

        const addBusinessText = document.getElementById('add_business_text');
        const addBusinessImg = document.getElementById('add_business_img');
        const logoRight = document.getElementById('ps-logo-right');
        if (addBusinessText) addBusinessText.style.color = '#fff';
        if (addBusinessImg) addBusinessImg.src = 'logo/plus (1).png';
        if (logoRight) logoRight.src = 'logo/logo-text.png';

        const planDetails = document.getElementById('plan_details');
        if (planDetails) {
            planDetails.innerHTML = `<span style="font-weight: 700;">Free plan</span> available on : <span style="font-weight: 700;">+${my_number || ''}</span>`;
        }
        const customerEmailEl = document.getElementById('customer_email');
        if (customerEmailEl) {
            customerEmailEl.innerHTML = customer_email ? `Registered email : <span style="font-weight: 700;">${customer_email}</span>` : '';
        }
        const parentEmailEl = document.getElementById('customer_parent_email');
        if (parentEmailEl) {
            parentEmailEl.innerHTML = '';
        }

        showFaqsSection();
        await showFreePlanMessage();
    });
    $('#select_functionality').click(function () {
        document.querySelector('.premium_features_parent_div').classList.remove('black_background');
        document.getElementById("popup_functionality").style.display = 'block';
        document.getElementById("show_premium_features").style.display = 'none';
        
        document.getElementById("select_functionality_container").classList.add('active');
        document.getElementById("select_premium_container").classList.remove('active');

        document.getElementById("add_business_text").style.color = '#009A88';
        document.getElementById("add_business_img").src = 'logo/plus.png';
        document.getElementById("ps-logo-right").src= 'logo/logo-text-light.png';
        
        const userImg = document.getElementById("add_business_img");
        if (userImg) {
            userImg.src = "logo/plus.png";
            userImg.style.width = '90%';
            userImg.style.height = '90%';
        }
    });
    $('#back_to_functionality').click(function () {
        document.getElementById("popup_functionality").style.display = 'block';
        document.getElementById("show_premium_features").style.display = 'none';
        document.getElementById("select_functionality").style.background = '#62D9C7';
    });

    $("#csv").on("click", function(event){
        if(isLinux){
            sendMessageToBackground({type: "create_csv_input"})
            event.preventDefault();
            window.close();
        }
    })

    $("#csv").on("change", async function (e) {
        var file = document.getElementById("csv").files[0];
        process_sheet(file);
        trackButtonClick('csv_uploaded');
    });

    $("#csv-campaign").on("change", async function (e) {
        var file = document.getElementById("csv-campaign").files[0];
        process_sheet(file,true);
        trackButtonClick('csv_uploaded');
    });

    // check whether the time gap feature is enabled or not
    $("#time_gap_checked").on("change", function () {
        const checked = $(this).is(":checked");
        const $timeGapType = $("#time_gap_type");

        if (checked) {
            $timeGapType
                .css("display", "flex") 
                .hide()                      
                .slideDown(200);      
        } else {
            $timeGapType.slideUp(200, function () {
                $(this).css("display", "none");
            });
        }
        chrome.storage.local.set({ time_gap_checked: checked });
        // updating premium usage for time gap
        if(checked){
            chrome.storage.local.get(['premiumUsageObject'], function(result){
                if(result.premiumUsageObject!==undefined){
                    let updatedPremiumUsageObject = {...result.premiumUsageObject, timeGap: true};
                    chrome.storage.local.set({'premiumUsageObject': updatedPremiumUsageObject});
                }
            });
        }
    });
    $("#batch_checked").on("change", function () {
        const checked = $(this).is(":checked");

        const $batchInfo = $("#batch_info");
        if (checked) {
            $batchInfo
                .css("display", "grid")   
                .hide() 
                .slideDown(200, function () {
                    $(this).css("display", "grid");
                });
        } else {
            $batchInfo.slideUp(200, function () {
                $(this).css("display", "none");
            });
        }
        if(isPremiumFeatureAvailable())
            chrome.storage.local.set({ batch_checked: checked });

        // updating premium usage for batching
        let isBatchChecked = $("#batch_checked").is(":checked");
        if(isBatchChecked){
            chrome.storage.local.get(['premiumUsageObject'], function(result){
                if(result.premiumUsageObject!==undefined){
                    let updatedPremiumUsageObject = {...result.premiumUsageObject, batching: true};
                    chrome.storage.local.set({'premiumUsageObject': updatedPremiumUsageObject});
                }
            });
        }
    });
    // if the slider_time_gap values is changed assign its value to the time_gap_value
    $("#slider_time_gap_sec").on("change", function () {
        var sliderBtn = document.querySelector("#slider_time_gap_sec");
        var numberBtn = document.querySelector("#time_gap_sec");
        var values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20];
        numberBtn.value = values[sliderBtn.value];
        time_gap = numberBtn.value;
        if (isPremiumFeatureAvailable()) {
            chrome.storage.local.set({ time_gap: time_gap });
        }
        else {
            sendMessageToBackground({ type: 'show_premium_popup', feature: 'time_gap' });
            window.close();
        }
    })
    // take input from the input section and stores it in the local storage
    $("#time_gap_sec").on("change", function () {
        if (isPremiumFeatureAvailable()) {
            var time_gap = document.querySelector("#time_gap_sec").value;
            var values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20];
            if (values.includes(parseInt(time_gap))) {
                const index = values.indexOf(parseInt(time_gap));
                document.querySelector("#slider_time_gap_sec").value = index;
            }
            else if (time_gap > 20) {
                document.querySelector("#slider_time_gap_sec").value = values.length - 1;
            }
            else if (time_gap == 0) {
                document.querySelector("#slider_time_gap_sec").value = 3;
                document.querySelector("#time_gap_sec").value = 3;
                time_gap = 3;
            }
            chrome.storage.local.set({ time_gap: time_gap });
        }
        else {
            sendMessageToBackground({ type: 'show_premium_popup', feature: 'time_gap' });
            window.close();
        }
    })
    // check if the random feature is selected or not
    $("#random").on("change", function () {
        disableNumberTimeGapInput("sec");
        if (!isPremiumFeatureAvailable()) {
            sendMessageToBackground({ type: 'show_premium_popup', feature: 'time_gap' });
            window.close();
        }
        trackButtonClick('random_delay_changed');
    });
    $("#sec").on("change", function(){
        disableNumberTimeGapInput("random");
    });
    $("#slider_batch_size").on("change", function () {
        var values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 25, 30, 35, 40, 45, 50];
        const batchSize = document.querySelector("#batch_size");
        const sliderBatchSize = document.querySelector("#slider_batch_size");
        batchSize.value = values[sliderBatchSize.value];
        var batch_size = parseInt(document.querySelector("#batch_size").value);
        chrome.storage.local.set({ batch_size: batch_size });
        trackButtonClick('batch_size_changed');
    })
    $("#batch_size").on("change", function () {
        var batch_size = document.querySelector("#batch_size").value;
        var values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 25, 30, 35, 40, 45, 50];
        if (values.includes(parseInt(batch_size))) {
            const index = values.indexOf(parseInt(batch_size));
            document.querySelector("#slider_batch_size").value = index;
        }
        else if (batch_size > 50) {
            document.querySelector("#slider_batch_size").value = values.length - 1;
        }
        else if (batch_size == 0) {
            document.querySelector("#slider_batch_size").value = values.length - 1;
            document.querySelector("#slider_batch_size").value = 50;
            batch_size = 50;
        }
        chrome.storage.local.set({ batch_size: batch_size });
        trackButtonClick('batch_size_changed');
    });
    $("#slider_batch_gap").on("change", function () {
        var values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 25, 30, 35, 40, 45, 50];
        const batchGap = document.querySelector("#batch_gap");
        const sliderBatchGap = document.querySelector("#slider_batch_gap");
        batchGap.value = values[sliderBatchGap.value];
        var batch_gap = document.querySelector("#batch_gap").value;
        chrome.storage.local.set({ batch_gap: batch_gap });
        trackButtonClick('batch_gap_changed');
    })
    $("#batch_gap").on("change", function () {
        var batch_gap = document.querySelector("#batch_gap").value;
        var values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 25, 30, 35, 40, 45, 50];
        if (values.includes(parseInt(batch_gap))) {
            const index = values.indexOf(parseInt(batch_gap));
            document.querySelector("#slider_batch_gap").value = index;
        }
        else if (batch_gap > 50) {
            document.querySelector("#slider_batch_gap").value = values.length - 1;
        }
        else if (batch_gap == 0) {
            document.querySelector("#slider_batch_gap").value = 13;
            batch_gap = 30;
        }
        chrome.storage.local.set({ batch_gap: batch_gap });
        trackButtonClick('batch_gap_changed');
    });
    // this check whether input type is random or sec
    $("#time_gap_type input[type=radio]").on("change", function (e) {
        var value = e.target.value;
        chrome.storage.local.set({ time_gap_type: value });
    });
    $('#chat_link_info').click(function () {
        document.getElementById("chat_link_info_popup").style.display = 'block';
    });
    $('.help_popup_okay').click(function () {
        document.getElementById("help_popup").style.display = 'none';
        chrome.storage.local.get(["first_visit_attachment", "first_attachment_click_count"], (res) => {
            let first_attachment_click_count = res.first_attachment_click_count;
            if (first_attachment_click_count == 1) {
                if(isLinux){
                    sendMessageToBackground({type: "add_attachments"});
                    window.close();
                }
                else
                    $('#select-attachments').click();
                chrome.storage.local.set({ first_attachment_click_count: -1 })
            }
            let first_visit_attachment = res.first_visit_attachment;
            if (first_visit_attachment == true) {
                chrome.storage.local.set({ first_visit_attachment: false })
            }
        })
    });
    $('#chat_link_info_popup_okay').click(function () {
        document.getElementById("chat_link_info_popup").style.display = 'none';
    });
    $("#numbers").on("change", function (e) {
        var numbers = document.querySelector("textarea#numbers").value;
        chrome.storage.local.set({ popup_numbers: numbers });
        trackButtonClick('number_changed');
    });
    $("#message").on("change", function (e) {
        var message = document.querySelector("textarea#message").value;
        chrome.storage.local.set({ popup_message: message });
        trackButtonClick('message_changed');
    });
    $("#time_gap").on("change", function (e) {
        var time_gap = document.querySelector("#time_gap").value;
        trackButtonClick('time_gap_changed');
    });
    $("#customization").on("change", function (e) {
        var customization = document.querySelector("#customization").checked;
        chrome.storage.local.set({ customization: customization });
        trackButtonClick('customization_added');
        // updating premium usage for customization
        if(customization){
            chrome.storage.local.get(['premiumUsageObject'], function(result){
                if(result.premiumUsageObject!==undefined){
                    let updatedPremiumUsageObject = {...result.premiumUsageObject, customisation: true};
                    chrome.storage.local.set({'premiumUsageObject': updatedPremiumUsageObject});
                }
            });
        }
    });
    $("#customized_arr").on("change", function (e) {
        var val = document.querySelector("#customized_arr").value;
        var message = document.querySelector("textarea#message").value;
        message += " {{" + val + "}}";
        document.querySelector("textarea#message").value = message;
        chrome.storage.local.set({ popup_message: message });
    });
    $("#schedule_checkbox").on("change", function(e){
        const isChecked= e.target.checked;
        document.getElementById("schedule_message_div").hidden = !isChecked;
        document.getElementById("schedule").hidden = !isChecked;
        document.getElementById("sender").hidden   = isChecked;

        const $scheduleOptions = $("#schedule_day_div, #schedule_time_div");

        if (isChecked) {
            $scheduleOptions
                .css("display", "flex")   
                .hide()                      
                .slideDown(200);   
        } else {
         
            $scheduleOptions.slideUp(200, function(){
                $(this).css("display", "none");
            });
        }
    });
    $("#schedule_time").on("change", function (e) {
        var schedule_time = document.querySelector("#schedule_time").value;
        chrome.storage.local.set({ schedule_time: schedule_time });
    });
    $("#survey_click").click(function () {
        document.getElementById("survey").style.display = 'none';
        chrome.storage.local.set({ survey_click: true });
        trackButtonClick('survey_click');
        window.open("https://forms.gle/uWMMreyGvkGozURb9", "_blank");
    });
    $("#my_number_submit").click(function () {
        let { dialCode } = getCountryCodeSelectorValue('#country-code-input-3');
        var number = document.querySelector("#my_number").value;
        if (!(dialCode && number))
            return;
        my_number = ('' + dialCode + number).replace('+', '').replaceAll(' ', '');
        trackButtonClick('my_number_submit');
        document.getElementById("add_number_popup").style.display = 'none';
        document.getElementById("confirm_number_popup").style.display = 'block';
        document.getElementById("confirm_my_number").innerText = "+" + my_number;
    });
    $("#confirm_number_submit").click(function () {
        document.getElementById("confirm_number_popup").style.display = 'none';
        chrome.storage.local.set({ my_number: my_number });
        trackButtonClick('confirm_number_submit');
        sendMessageToBackground({ type: 'reload_my_number' });
        window.close();
    });
    $("#edit_number_submit").click(function () {
        document.getElementById("confirm_number_popup").style.display = 'none';
        document.getElementById("add_number_popup").style.display = 'block';
        trackButtonClick('edit_number_submit');
    });
    $("#unsubscribe").click(function () {
        sendMessageToBackground({ type: 'unsubscribe' });
        trackButtonClick('unsubscribe');
    });
    $("#buy_premium_popup").click(function () {
        trackButtonClick('buy_premium_popup');
        if (RUNTIME_CONFIG.useOldPricingLinks){
            window.open(RUNTIME_CONFIG.basePricingUrl, "_blank");
        } else {
            sendMessageToBackground({ type: 'show_pricing_popup' });
            window.close();
        }
    });
    $("#learn_schedule").click(function () {
        sendMessageToBackground({ type: 'learn_schedule' });
        trackButtonClick('learn_schedule');
    });
    $("#schedule").click(function () {
        trackButtonClick('schedule_button');
        if (isAdvanceFeatureAvailable()) {
            trackButtonClick('schedule_button_premium');
            reset_error();
            var messageSendingTo = messageToggleSwitchValue || 'numbers';
            var schedule_time = document.querySelector("#schedule_time").value;
            var schedule_date= document.querySelector("#schedule_day").value;
            var numbers_str = document.querySelector("textarea#numbers").value;
            var message = document.querySelector("textarea#message").value;
            var attachments_str = document.querySelector("#attachments-container").innerText;
            var customization = true;
            var time_gap, random_delay = false, batch_size, batch_gap;
            var send_attachment_first = false;
            if ($("#time_gap_checked").is(":checked")) {
                if ($("#time_gap_type input[type='radio']:checked").val() === 'sec') {
                    time_gap = parseInt(document.querySelector("#time_gap_sec").value);
                }
                if($("#time_gap_type input[type='radio']:checked").val() === 'random') {
                    time_gap = 4; //Avg of random delay
                    random_delay = true;
                }
            }
            else {
                if(!isPremiumFeatureAvailable()){
                    time_gap = parseInt(30);
                }else{
                    time_gap = parseInt(3);
                }
            }
            if (document.querySelector("#batch_checked").checked) {
                batch_size = document.querySelector("#batch_size").value;
                batch_gap = document.querySelector("#batch_gap").value;
                if (batch_size)
                    batch_size = parseInt(batch_size);
                if (batch_gap)
                    batch_gap = parseInt(batch_gap);
            }
            if ($('#attachment-first-checkbox').is(":checked")) {
                send_attachment_first = true;
            }

            var numbers = getFilteredNumbers(numbers_str).split(",").map((num) => (country_info.dial_code + num));
            if (!numbers_str && messageSendingTo == 'numbers') {
                show_error("Please enter numbers to send");
                return;
            }
            if (groups_selected.length == 0 && messageSendingTo == 'groups') {
                show_error("Please select groups to send")
                return;
            }
            if (contacts_selected.length == 0 && messageSendingTo == 'contacts') {
                show_error("Please select contacts to send")
                return;
            }
            if(message.trim().length == 0 && attachments_str.length == 0) {
                show_error("Please enter message or attachment");
                return;
            }
            if (!schedule_time) {
                show_error("Schedule time can't be blank");
                return;
            }

            chrome.storage.local.get(['scheduled_campaigns'], async function(res){
                let scheduledCampaigns = res.scheduled_campaigns || [];

                // prev_time is the time at which the previous campaign will end
                let prev_time= null;
                let prev_date= null;
                if(scheduledCampaigns && scheduledCampaigns.length>0){
                    prev_time= scheduledCampaigns[scheduledCampaigns.length-1].campaign_duration;
                    prev_date= scheduledCampaigns[scheduledCampaigns.length-1].end_date;
                }
                if(prev_time!=null && prev_date!=null && (convertToTimestamp(prev_date, prev_time)>=convertToTimestamp(schedule_date, schedule_time))){
                    let scheduleCampaignError= document.querySelector('#schedule_campaign_error');
                    const scheduleCampaignErrorTime= document.querySelector('#schedule_campaign_error_time');
                     scheduleCampaignError.hidden=false;
                    let time= convertTo12Hour(prev_time);
                    scheduleCampaignErrorTime.innerHTML= formatScheduleDate(prev_date) +" "+time+" ";
                    setTimeout(() => {
                        scheduleCampaignError.hidden=true;
                    }, 10000);
                    return;
                }
                if(scheduledCampaigns &&scheduledCampaigns.length >= 30){
                    const scheduleCampaignError2= document.querySelector('#schedule_campaign_error2');
                    scheduleCampaignError2.hidden=false;
                  setTimeout(() => {
                        scheduleCampaignError2.hidden=true;
                    }, 10000);
                    return;
                }else {
                    chrome.storage.local.get(['attachmentsData'], async function(res){
                        const attachmentsData= res.attachmentsData;
                        let campaign_name= 'Campaign-'+ (scheduledCampaigns.length+1);
                        let {time: campaign_duration, date: end_date}= addSecondsToScheduleTime(schedule_date, schedule_time, calculateCampaignDuration(time_gap, random_delay, batch_size, batch_gap, numbers));
                        let caption_customization= $("#caption_customization").is(":checked");
                        let caption= await new Promise((resolve) => {
                            chrome.storage.local.get(['captionForIndividualAttachment'], (res) => {
                                resolve(res.captionForIndividualAttachment|| []);
                            });
                        });

                        let recipients = [], recipients_type, campaign_type;
                        if (messageSendingTo === 'numbers') {
                            recipients = numbers;
                            recipients_type = 'numbers';
                            campaign_type = 'number_message';
                        } else if (messageSendingTo === 'groups') {
                            recipients = groups_selected;
                            recipients_type = 'groups';
                            campaign_type = 'group_message';
                        } else if (messageSendingTo === 'contacts') {
                            recipients = contacts_selected.map(number => number.replace("@c.us", ""));
                            recipients_type = 'numbers';
                            campaign_type = 'number_message'; 
                        }
                        else if(messageSendingTo === "labels"){
                            let labelsContacts = [];

                            labels_selected.forEach(selectedLabel => {
                                const label = allLabels.find(label => label.id === selectedLabel);
                                if (label && label.contacts) {
                                    labelsContacts.push(...label.contacts.map(contact => contact.replace("@c.us", "")));
                                }
                            });
                            recipients = labelsContacts;
                            recipients_type = 'numbers';
                            campaign_type = 'number_message'; 
                        } else if(messageSendingTo === "lists"){
                            recipients = lists_selected.map(item => item.endsWith("@c.us") ? item.replace("@c.us", "") : item);
                            recipients_type = 'lists',
                            campaign_type = 'list_message'
                        }
                        
                    
                        let canSendCampaign = checkIfCanSendCampaign(recipients.length);
                        if (!canSendCampaign) {
                            sendMessageToBackground({ type: 'show_message_count_over_popup', sent_count: sent_messages_count, total_count: total_messages_count });
                            window.close();
                            return;
                        }
                    
                        scheduledCampaigns.push({
                            type: campaign_type,
                            [recipients_type]: recipients,
                            message,
                            time_gap,
                            csv_data,
                            customization,
                            caption_customization,
                            random_delay,
                            batch_size,
                            batch_gap,
                            caption,
                            send_attachment_first,
                            campaign_name,
                            schedule_time,
                            schedule_date,
                            campaign_duration,
                            end_date,
                            attachmentsData
                        })
                        
                        scheduledCampaigns.sort((a, b) => convertToTimestamp(a.schedule_date, a.schedule_time) - convertToTimestamp(b.schedule_date, b.schedule_time));
                        chrome.storage.local.set({scheduled_campaigns: scheduledCampaigns});       
                        
                        sendMessageToBackground({ type: 'schedule_message' });
                        window.close();
                    });
                } 
            });
        }
        else {
            sendMessageToBackground({ type: 'show_advance_popup', feature: 'schedule' });
            window.close();
        }
        // updating premium usage for schedule
        chrome.storage.local.get(['premiumUsageObject'], function(result){
            if(result.premiumUsageObject!==undefined){
                let updatedPremiumUsageObject = {...result.premiumUsageObject, schedule: true};
                chrome.storage.local.set({'premiumUsageObject': updatedPremiumUsageObject});
            }
        });
    });
}

function addSecondsToScheduleTime(date, time, seconds) {
    let [hours, minutes] = time.split(':');
    let dateObj = new Date(date);
    dateObj.setHours(hours);
    dateObj.setMinutes(minutes);
    dateObj.setSeconds(dateObj.getSeconds() + seconds);
    hours = dateObj.getHours();
    minutes = dateObj.getMinutes();
    seconds = dateObj.getSeconds();
    hours = hours < 10 ? '0' + hours : hours;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    let year = dateObj.getFullYear();
    let month = dateObj.getMonth() + 1; // Months are 0-based in JavaScript
    let day = dateObj.getDate();
    month = month < 10 ? '0' + month : month;
    day = day < 10 ? '0' + day : day;
    return {date: `${year}-${month}-${day}`, time: `${hours}:${minutes}`};
}

function convertToTimestamp(date, time) {
    let dateTime = new Date(date + 'T' + time);
    return dateTime.getTime();
}

function timeToTimestamp(time) {
    let [hours, minutes] = time.split(':');
    return new Date().setHours(parseInt(hours), parseInt(minutes), 0, 0);
}

function convertTo12Hour(time) {
    let [hours, minutes] = time.split(':');
    let date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);

    let period = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    // minutes = minutes < 10 ? '0'+minutes : minutes;

    return `${hours}:${minutes} ${period}`;
}

function getTimeGap(index, batch_size, time_gap, random_delay, batch_gap) {
    if (index == 0)
        return 1;
    if (batch_size && (index % batch_size) == 0)
        return batch_gap;
    if (random_delay)
        return getRandomNumber(3, 10);
    return time_gap;
}

function getRandomNumber(min, max) {
    return Math.ceil(Math.random() * (max - min) + min);
}

function calculateCampaignDuration(time_gap, random_delay, batch_size, batch_gap, numbers) {
    let total_time = 0;
    for (let i = 0; i < numbers.length; i++) {
        let curr_time_gap = getTimeGap(i, batch_size, time_gap, random_delay, batch_gap);
        total_time += curr_time_gap;
    }

    // add 15 minutes to this total time
    total_time += (15 * 60);
    return total_time;
}

function formatScheduleDate(date){
    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year}`;
}

function hasDateTimePassed(date, time) {
    let dateTime = new Date(date + 'T' + time);
    dateTime.setMinutes(dateTime.getMinutes() + 2);

    let now = new Date();
    return now > dateTime;
}

async function scheduleExpiredPopup(){
    // showScheduleExpiredPopup();
    chrome.storage.local.get(['scheduled_campaigns'], function(res){
        let scheduledCampaigns = res.scheduled_campaigns || [];
        for(let i=0; i<scheduledCampaigns.length; i++){
            const date = scheduledCampaigns[i].schedule_date;
            const time = scheduledCampaigns[i].schedule_time;
            if(hasDateTimePassed(date, time)){
                showScheduleExpiredPopup(scheduledCampaigns[i], i);
                return;
            }

        }
    })
}

async function loadScheduledCampaigns(scheduledCampaigns){
    $('#schedule_container').html('');

    if (scheduledCampaigns && scheduledCampaigns.length > 0) {
        for (let index = 0; index < scheduledCampaigns.length; index++) {
            let campaignName = scheduledCampaigns[index].campaign_name || "Campaign-" + Number(index+1);
            let scheduleTime = scheduledCampaigns[index].schedule_time;
            let campaignDate = formatScheduleDate(scheduledCampaigns[index].schedule_date);
            $('#schedule_container').append(`
                <div class="dropdown-item">
                    <p id="${index}" class="campaign_name text">
                        <img src="./logo/excel_icon.png"/>
                        <span style="color: #009A88;">${campaignName}</span>
                        <span style="color: #5D6063;">${campaignDate} ${scheduleTime}</span>
                    </p>
                    <img id="${index}" class="campaign_delete_btn btn CtaBtn" src="./logo/delete-icon.png" />
                </div>`
            );
        }
    } else {
        $('#schedule_container').append(`<div class="dropdown-item">${await translate("No scheduled campaigns")}</div>`);
    }

    $('.campaign_delete_btn').click(function () {
        let index = $(this).attr('id');
        const timeoutId= scheduledCampaigns[index].timeOutId;
        if(timeoutId)
            sendMessageToBackground({ type: 'clear_schedule_timeout', timeoutId: timeoutId });
        const newScheduledCampaigns = scheduledCampaigns.filter((campaign, i) => i != index);
        chrome.storage.local.set({scheduled_campaigns: newScheduledCampaigns});
        loadScheduledCampaigns(newScheduledCampaigns);
    })
}
// Google Analytics
function getTrackLabel(){
    try {
        return [my_number, plan_type, plan_duration].join(' ').trim();
    } catch {
        return '';
    }
}

function getTrackLocation() {
    return location_info.default ? {} : { 
        city: location_info.city,
        region: location_info.region,
        country: location_info.country,
        dial_code: location_info.dial_code,
    }
}

function trackEvent(event, track) {
    trackGenericEvent(event, { type: 'event', track, natural_interaction: true });
}

function trackButtonClick(event) {
    trackGenericEvent(event, { type: 'clicked', natural_interaction: true });
}

function trackCloseButtonClick(event) {
    trackGenericEvent(event, { type: 'clicked' });
}

function trackButtonView(event) {
    trackGenericEvent(event, { type: 'viewed' });
}

function trackSystemEvent(event, track = '') {
    trackGenericEvent(event, { type: 'event', track });
}

function trackSuccess(event) {
    trackGenericEvent(event, { type: 'success' });
}

function trackError(event, error = '') {
    trackGenericEvent(event, { type: 'error', error: String(error) })
}

function trackGenericEvent(event, data) {
    let label = getTrackLabel();
    let location = getTrackLocation();

    // Filters null and undefined values
    let combinedData = { ...location, ...data };
    let eventData = Object.fromEntries(
        Object.entries(combinedData).filter(([key, value]) => value != null || value != undefined) 
    );
    GoogleAnalytics.trackEvent(event, { label, ...eventData });
}

function isExpired() {
    return false;
}

function isBasic() {
    return true;
}

function isAdvance() {
    return true;
}

function isPremium() {
    return true;
}

function isFreeTrial() {
    return false;
}

function isAdvancePromo() {
    return false;
}

function isTrial() {
    return false;
}

function isBasicFeatureAvailable() {
    return true;
}

function isAdvanceFeatureAvailable() {
    return true;
}

function isPremiumFeatureAvailable() {
    return true;
}

function isPremiumExpired() {
    return (isExpired() && (last_plan_type == 'Basic' || last_plan_type == 'Advance'));
}

function is_p2p_applicable(){
    if((plan_type == 'Expired' && last_plan_type == 'AdvancePromo')|| (plan_type == 'Expired' && last_plan_type == 'FreeTrial')){
        return RUNTIME_CONFIG.p2pApplicableSegments.includes(p2p_segment);
    }
    else return false;
}

function getFilteredNumbers(numbers_str) {
    let numbers = numbers_str.replace(/\n/g, ",").split(",");
    numbers = numbers.map(num => num.replace(/\D/g, ''));
    numbers = numbers.filter((num) =>  (num.length >= 5 && num.length <= 15));
    let filteredNumbers = numbers.join(',')
    return filteredNumbers;   
}

function getItemsName() {
    let itemsElements = document.querySelectorAll(".group");
    let itemsString = Array.from(itemsElements)
        .slice(0, -1)
        .map(item => item.innerHTML.trim()) 
        .join(", "); 
    return itemsString;
}

function getCampaigns(callback) {
    chrome.storage.local.get(['campaigns'], (res) => {
        let campaigns = res.campaigns || [];
        callback(campaigns);
    });
}

function saveCampaign(campName, campData, callback) {
    getCampaigns((campaigns) => {
        let isCampNameExists = campaigns.some(campaign => campaign.name === campName);

        if (isCampNameExists) {
            alert(`Campaign name "${campName}" already exists!`);
            callback(false);
        } else {
            campaigns.push({ name: campName, ...campData });
            chrome.storage.local.set({ campaigns }, () => callback(true)); 
        }
    });
}

function updateCampaign(index, campName, campData, callback) {
    getCampaigns((campaigns) => {
        if (campaigns[index]) {
            campaigns[index] = { name: campName, ...campData };
            chrome.storage.local.set({ campaigns }, () => callback(true)); 
        } else {
            alert("Invalid campaign index.");
            callback(false); 
        }
    });
}

function getDaySuffix(day) {
    if (day >= 11 && day <= 13) {
        return "th";
    }
    switch (day % 10) {
        case 1:
            return "st";
        case 2:
            return "nd";
        case 3:
            return "rd";
        default:
            return "th";
    }
}

function getReportDateFormat(date_ms, isDownloadName = false) {
    const today = new Date();
    const reportDate = new Date(date_ms);
    const diffDays = Math.round(Math.abs((today - reportDate) / (24 * 60 * 60 * 1000)));

    const reportDay = reportDate.getDate();
    const dayString = reportDay + getDaySuffix(reportDay);

    let reportTimeString = reportDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "numeric" });
    let reportDateString;

    if (isDownloadName || diffDays > 1) {
        reportDateString = `${dayString} ${reportDate.toLocaleDateString("en-US", { month: "short" })}`
    } else if (diffDays === 0) {
        reportDateString = "Today";
    } else if (diffDays === 1) {
        reportDateString = "Yesterday";
    }

    if(isDownloadName) {
        return `(Last Run at ${reportDateString} ${reportTimeString})`;
    }
    return `(Last Run: ${reportDateString} ${reportTimeString})`;
}

function serizalize_csv_rows(rows) {
    return "data:text/csv;charset=utf-8," + rows.map(row => {
        return row.map((col, index) => {
            if (index === 0 && /^\d+$/.test(col.trim())) {
                return `"${col}"`;
            }
            return `"${col.replace(/"/g, '""')}"`; 
        }).join(",");
    }).join("\n");
}

// Download CSV
function download_csv(data, filename) {
    const encodedUri = encodeURI(data);
    const link = $('<a>').attr({ href: encodedUri, download: filename }).appendTo('body');
    link[0].click();
    link.remove();
}

function getCustomNumberPlaceholder() {
    let defaulltPlaceholder = 'Enter numbers separated by comma or one below the other. Eg. ';
    let sampleNumber = $('#country-code-input').attr('placeholder').replace(/\D/g, '');
    if(sampleNumber === '') {
        sampleNumber = '+91 8123456789, +1 2015550123'
    } else if(sampleNumber.startsWith('0')) {
        sampleNumber = sampleNumber.substr(1);
    }

    let customPlaceholder='';
    if(sampleNumber != '+91 8123456789, +1 2015550123'){
        let startingDigits= sampleNumber.slice(0, -6);
        let lastSixDigits = sampleNumber.slice(-6);
        let reversedLastSixDigits = lastSixDigits.split('').reverse().join('');
        let sampleNumberTwo = startingDigits + reversedLastSixDigits;
        customPlaceholder = defaulltPlaceholder + sampleNumber + ', ' + sampleNumberTwo;
    }
    else 
        customPlaceholder = defaulltPlaceholder + sampleNumber;
    return customPlaceholder;
}

// Add Country Code Selector
function addCountryCodeSelector(elementId) {
    // Country Code Selector/Input
    const countrySelector = document.querySelector(elementId);
    const initialCountry = country_info.name_code;
    const preferredCountries = initialCountry === 'XX' ? [initialCountry] : ['XX', initialCountry];

    const intlTelInputConfig = {
        separateDialCode: true,
        autoHideDialCode: false,
        autoPlaceholder: 'off',
        initialCountry: initialCountry,
        preferredCountries: preferredCountries,
        autoPlaceholder: 'aggressive',
        utilsScript: 'library/intlTelInput.utils.js'
    };
    window.intlTelInput(countrySelector, intlTelInputConfig);
    
    if (elementId === '#country-code-input') {
        updateCountryInfo();
        countrySelector.addEventListener('countrychange', () => {
            updateCountryInfo();
            refreshNumbers();
        });
    }
}

function getCountryCodeSelectorValue(elementId) {
    const countrySelector = document.querySelector(elementId);
    const intlTelInputInstance = window.intlTelInputGlobals.getInstance(countrySelector);
    return intlTelInputInstance.getSelectedCountryData();
}

function updateCountryInfo() {
    const countrySelector = document.querySelector('#country-code-input');
    const intlTelInputInstance = window.intlTelInputGlobals.getInstance(countrySelector);
    let { name, iso2, dialCode } = intlTelInputInstance.getSelectedCountryData();
    if (dialCode === '00') dialCode = '';
    country_info = {
        name: name,
        name_code: iso2.toUpperCase(),
        dial_code: dialCode,
    };
    chrome.storage.local.set({ country_info: country_info });

    // Update Numbers Input Placeholder
    $('#numbers-input').attr('placeholder', getCustomNumberPlaceholder())
}

function refreshNumbers() {
    const numberTags = $('#numbers-display .number-tag .number');
    const numbers = [];
    numberTags.each(function () {
        let nationalNumber = $(this).text().trim();
        numbers.push(nationalNumber);
    });
    const numbers_str = numbers.join(', ');
    replaceNumbers(numbers_str);
}

function replaceNumbers(newNumbers) {
    // Delete all numbers
    $('#numbers-display').empty();
    $('#numbers-input').val('');

    // Add new numbers
    addNumberTags(newNumbers);
}

// Validate the Number and return National Number
function isValidNumber(number) {
    let { dial_code, name_code } = country_info;
    let default_invalid_reason = { isValid: false, nationalNumber: number, reason: 'INCORRECT COUNTRY CODE' };

    const checkNumber = (num) => {
        try {
            let parsedNumber = libphonenumber.parsePhoneNumber('+' + num);
            // console.log(num, parsedNumber, parsedNumber.isValid());
            if (parsedNumber && parsedNumber.isValid()) {
                if(name_code === 'XX') {
                    return { isValid: true, nationalNumber: num, reason: '' }
                }
                else if(name_code === parsedNumber.country) {
                    return { isValid: true, nationalNumber: parsedNumber.nationalNumber, reason: '' }
                } else {
                    return default_invalid_reason;
                }
            }
            return default_invalid_reason;
        } catch (error) {
            return { isValid: false, nationalNumber: num, reason: error.message };
        }
    };

    // check number with / without country code, then return valid response
    let response1 = checkNumber(number);
    let response2 = checkNumber(dial_code + number);

    if (response1.isValid) {
        return response1;
    } else if (response2.isValid) {
        return response2;
    } else {
        return default_invalid_reason;
    }
}

function toggleUploadExcelText(show){
    const isNumberTagPresent= document.querySelectorAll(".number-tag").length;
    const uploadExcelText = document.querySelector(".upload_excel_text");
    if(uploadExcelText && isNumberTagPresent && !show){
            uploadExcelText.style.display= "none";
    }
    else if(uploadExcelText && !isNumberTagPresent && show){
            uploadExcelText.style.display= "flex";
    }
}

// Adds number tags html from numbers string
function addNumberTags(numbers_str) {
    const numbers = getFilteredNumbers(numbers_str).split(',').map(s => s.trim()).filter(s => s);
    let numberTagsHtml = '';
    for (let number of numbers) {
        if (number) {
            let { isValid, nationalNumber, reason } = isValidNumber(number);
            numberTagsHtml += `
                <span class="number-tag CtaBtn ${isValid ? '' : 'invalid'}">
                    ${isValid ? '' : '<span class="invalid-reason" hidden="true">' + reason + '</span>'}
                    <span class="number" title="Edit Number">${nationalNumber}</span>
                    <img class="delete-number-tag" src="./logo/closeBtn.png" title="Remove Number">
                </span>`;
        }
    }

    $('#numbers-display').append(numberTagsHtml);
    updateNumbersAndDisplay();

    // removing upload excel text if number tag is present
    toggleUploadExcelText(false);
}

// Edit / Update Number Tag
function editNumberTag(tag) {
    const currentNumber = $(tag).text();
    const numberTag = $(tag).parent('.number-tag');

    // Add input inside number tag
    const numberTagWidth = $(tag).width() + 7 + 'px';
    const numberInput = $(`<input type="text" class="number-tag-input" maxlength="16" style="max-width:${numberTagWidth};">`);

    // Adding Input inside number tag and some style changes
    numberTag.html(numberInput);
    numberTag.addClass('active-input');
    numberTag.removeClass('CtaBtn');
    numberInput.val(currentNumber);
    numberInput.focus();

    // Handle edit
    numberInput.on('blur keydown keyup', function (event) {
        if (event.keyCode && ![13, 188].includes(event.keyCode)) return;
        let editedNumber = getFilteredNumbers($(this).val()).split(',')[0];

        if (editedNumber) {
            if(is_excel_uploaded){
              removeNumbers();
            }
            let { isValid, nationalNumber, reason } = isValidNumber(editedNumber);
            //change the edited context inside excel 
            for(let i=0;i<csv_data.length;i++){
                if(csv_data[i][0] && csv_data[i][0].toString().includes(currentNumber)){
                    csv_data[i][0]=parseInt(editedNumber);
                    break;
                }
            }
            chrome.storage.local.set({ csv_data: csv_data });
            numberTag.toggleClass('invalid', !isValid);
            numberTag.removeClass('active-input');
            numberTag.addClass('CtaBtn');

            numberTag.html(`
                ${isValid ? '' : '<span class="invalid-reason" hidden="true">' + reason + '</span>'}
                <span class="number" title="Edit Number">${nationalNumber}</span>
                <img class="delete-number-tag" src="./logo/closeBtn.png" title="Remove Number">
            `);
        } else {
            $(this).parent('.number-tag').remove();
        }
        updateNumbersAndDisplay();
    });
}

// Updates the real numbers input and numbers display
function updateNumbersAndDisplay() {
    // Update actual number input
    const numberTags = $('#numbers-display .number-tag .number');
    const numbers = [];
    numberTags.each(function () {
        let nationalNumber = $(this).text().trim();
        numbers.push(nationalNumber);
    });
    $('#numbers').val(numbers.join(', '));
    $('#numbers').trigger('change');

    // Update invalid number count
    let invalidCount = $('.number-tag.invalid').length;
    if(Number(invalidCount)>500)
        invalidCount= '500+'
    $('#invalid-numbers').css('display', invalidCount ? 'flex' : 'none');
    $('#invalid-count').text(invalidCount);

    // Show/Hide delete all numbers icon
    $('#delete-all-numbers').css('display', numbers.length ? 'block' : 'none');

    // Show/Hide Placeholder
    $('#numbers-input').attr('placeholder', numbers.length ? '' : getCustomNumberPlaceholder());
    
    // Scroll number display to bottom
    $('#numbers-display').animate({ scrollTop: $('#numbers-display')[0].scrollHeight }, 500);
}

// For attachment and Template

function removeNumbers() {
  unset_csv_styles();
  toggleUploadExcelText(true);
  hideCustomizationContainer();
}

function handleDeleteBin() {
    $('#delete-all').css('display', 
        getSelectedArray(messageToggleSwitchValue).length > 0 ? 'block' : 'none'
    );
}
// function handleTemplateSaveBtn(){
//     $('#campaign-save-icon-items ').css('display', 
//         messageToggleSwitchValue === 'groups' 
//         ? (groups_selected.length > 0 ? 'block' : 'none') 
//         : (contacts_selected.length > 0 ? 'block' : 'none')
//     );
// }

// function handleCampaignBox(){
//     $('#campaign-box-groups').css('display', 
//         messageToggleSwitchValue === 'groups' 
//         ? (groups_selected.length === 0 ? 'block' : 'none') 
//         : (contacts_selected.length === 0 ? 'block' : 'none')
//     );

// }

function showGroupsCampaignSelectorOrSave() {
    chrome.storage.local.get(['campaigns'], (res) => {
        let isCampaignPresent = false;
        const numbers = getItemsName();
        const campaigns = res.campaigns || [];
        let type = messageToggleSwitchValue;
        let filteredCampaigns = filterCampaignsByType(campaigns, type);
        let selectedArray = getSelectedArray(type);

        filteredCampaigns.forEach(campaign => {
            if (numbers === campaign[type]) {
                isCampaignPresent = true;
            }
        });

        if (isCampaignPresent || selectedArray.length === 0) {
            $('#campaign_selector_groups').removeClass('hide');
            $('#campaign-save-icon-items').addClass('hide');
        } else {
            $('#campaign_selector_groups').addClass('hide');
            $('#campaign-save-icon-items').removeClass('hide');
        }
    });
}

// Helper function to filter campaigns based on the messageToggleSwitchValue
function filterCampaignsByType(campaigns, type) {
    return campaigns.filter(campaign => campaign[type] && campaign[type].length > 0);
}

function setupTextareaToggleForExcelButton() {
    const textarea = document.querySelector('#campaign-numbers');
    const excelBtn = document.querySelector(".import-excel-dropdown[data-suffix='campaign']");
    if (!textarea || !excelBtn) return;

    let isHidden = false;

    textarea.addEventListener('input', () => {
        const isEmpty = textarea.value.trim() === "";

        if (isEmpty && isHidden) {
            excelBtn.style.display = 'inline-block';
            isHidden = false;
        } else if (!isEmpty && !isHidden) {
            excelBtn.style.display = 'none';
            isHidden = true;
        }
    });
}

$(document).ready(async function () {
    // show version of extension in popup from manifest file
    const manifest = chrome.runtime.getManifest();
    const version = manifest.version;
    document.getElementById('extension-version').textContent = version;

    // $('.google_sheets_box').on('click', function() {
    //     toggleGoogleSheetsContainer(true);
    // });
    
    $('#fetch-google-sheets').on('click', async function() {
        const sheetsUrl = $('#google-sheets-url').val().trim();
        if (!sheetsUrl) {
            show_error('Please enter a valid Google Sheets URL');
            return;
        }

        try {
            await fetchGoogleSheetData(sheetsUrl);
        } catch (error) {
            console.error(error)
        }
    });

    $("#fetch-google-sheets-campaign").on('click', async function() {
        const sheetsUrl = $('#google-sheets-url-campaign').val().trim();
        if (!sheetsUrl) {
            show_error('Please enter a valid Google Sheets URL');
            return;
        }

        try {
            await fetchGoogleSheetData(sheetsUrl, true);
        } catch (error) {
            console.error(error)
        }
    });
    
        $(document).on('click', function(event) {
            const container = $('#google-sheets-container');
            const trigger = $('.google_sheets_box');
            if (!container.is(event.target) && 
                container.has(event.target).length === 0 &&
                !trigger.is(event.target) && 
                trigger.has(event.target).length === 0) {
                toggleGoogleSheetsContainer(false);
            }
        });
    
    $('#google-sheets-url').on('keypress', function(event) {
            if (event.which === 13) {
                $('#fetch-google-sheets').click();
            }
    });

    $('#google-sheets-url-campaign').on('keypress', function(event) {
            if (event.which === 13) {
                $('#fetch-google-sheets-campaign').click();
            }
    });

    chrome.storage.local.get(['country_info', 'popup_numbers'], (res) => {
        // Get Country Info and add Country Code Selector
        country_info = res.country_info || { name: 'India', name_code: 'IN', dial_code: '91' };
        addCountryCodeSelector('#country-code-input');
        addCountryCodeSelector('#country-code-input-2');        
        addCountryCodeSelector('#country-code-input-3');

        // Get Popup Numbers and set it
        popup_numbers = res.popup_numbers || '';
        replaceNumbers(popup_numbers);
    });

    // Add new number tags
    $('#numbers-input').on('blur keydown keyup', function (event) {
        if (event.keyCode && ![13, 188].includes(event.keyCode)) return;
    
        let numbers_str = $(this).val().trim();
        $(this).val('');
        if (!numbers_str) return;
    
        const filteredNumbers = numbers_str.split(',').map(s => s.trim()).filter(s => s);
        if (filteredNumbers.length === 0) return;
    
        addNumberTags(filteredNumbers.join(','));
    });
    

    // Edit number tag
    $('#numbers-display').on('click', '.number', function () {
        const numberTag = $(this);
        editNumberTag(numberTag);
    });

    // Delete number tag
    $('#numbers-display').on('click', '.delete-number-tag', function () {
        $(this).parent('.number-tag').remove();
        let deleted_num=$(this).parent('.number-tag').children().text()
        for(let i=0;i<csv_data.length;i++){
            if(csv_data[i][0] && csv_data[i][0].toString().includes(deleted_num)){
                csv_data.splice(i,1);
                break;
            }
        }
        chrome.storage.local.set({ csv_data: csv_data });
        updateNumbersAndDisplay();
        
        // adding upload excel text if number tag is not present
        toggleUploadExcelText(true);
    });

    

    // Focus numbers-input if user clicks on blank space
    $('#numbers-display').on('click', function (e) {
        const ele = $(e.target);
        if (ele && !ele.is('.number, .delete-number-tag, .number-tag-input')) {
            $('#numbers-input').focus();
        }
    })

    // Delete all number tags
    $('#delete-all-numbers').on('click', async function () {
        let msg = await translate('Are you sure, you want to delete all numbers?');
        const __confirm = confirm(msg);
        if (__confirm) {
          replaceNumbers('');
          removeNumbers();
        }
    });
        
    $("#groups_container").on('scroll', function () {
        const dropdownContainer = document.getElementById('groups_container');
        let visibleElementsCount = $('#groups_container .dropdown-item:visible').length;
        const allItems = getAllItems(messageToggleSwitchValue);
        const selectedArray = getSelectedArray(messageToggleSwitchValue);
    
        if ((allItems.length - selectedArray.length) === visibleElementsCount) {
            if (messageToggleSwitchValue === "groups") {
                lastScrollPosition = dropdownContainer.scrollTop;
            } else if (messageToggleSwitchValue === "contacts") {
                lastScrollPosition_contacts = dropdownContainer.scrollTop;
            } else {
                lastScrollPosition_labels = dropdownContainer.scrollTop;
            }
        }
    });
    
    $('#delete-all').on('click', async function () {
        let msg = await translate(`Are you sure, you want to delete all ${messageToggleSwitchValue}?`);
        const __confirm = confirm(msg);
        if (__confirm) {
            setSelectedArray(messageToggleSwitchValue, []);
            chrome.storage.local.set({ [getStorageKey(messageToggleSwitchValue)]: [] });
            updateGroupBoxDisplay();
            showGroupsCampaignSelectorOrSave()
        }
    });
    


    $("#select_all_text").on('click', function () {
        document.getElementById('select-all').checked = true;
    })
    $('.select_all').on('click', function () {
        if(document.getElementById('select-all').checked){
            handleSelectAll()
            handleDeleteBin()
            showGroupsCampaignSelectorOrSave()
        }
    })

    // Show Invalid Numbers Popup
    $('#invalid-numbers').on('click', function () {
        const topPosition = Math.max(0, (window.innerHeight - 250) / 2 + window.pageYOffset) + 'px';
        $('.invalid-numbers-popup').css('top', topPosition);
        $('.invalid-numbers-popup-container').removeClass('hide');

        const invalidCount = $('.number-tag.invalid').length;
        $('#popup-invalid-count').text(invalidCount);
    });

    // Close Invalid Numbers Popup
    $('.invalid-numbers-popup-close-button').on('click', function () {
        $('.invalid-numbers-popup-container').addClass('hide');
    });

    function getIndexOfInvalidNumbers(){
        let index=[];
        $('.number-tag.invalid').each(function () {
            index.push($(this).index());
        });
        let new_data = csv_data.filter((item, i)=> !index.includes(i-1));
        csv_data= new_data;
        chrome.storage.local.set({ csv_data: new_data });
    }

    // Remove all invalid numbers from list
    $('#remove-all-invalid').on('click', function () {
        getIndexOfInvalidNumbers()
        $('.number-tag.invalid').remove();
        $('.invalid-numbers-popup-container').addClass('hide');
        updateNumbersAndDisplay();
    });

    // Download excel containing the invalid number and reason
    $('#download-all-invalid').on('click', function () {
        const rows = [['Invalid Number', 'Reason']];

        $('.number-tag.invalid').each(function () {
            const number = country_info.dial_code + $(this).find('.number').text();
            const reason = $(this).find('.invalid-reason').text();
            rows.push([number, reason]);
        });

        download_csv(serizalize_csv_rows(rows), 'Invalid Numbers');
        $('.invalid-numbers-popup-container').addClass('hide');
    });

    // $('#input-container').on('click', function () {

    // })

    function handleCaption(attLen,attachments,captionForIndividualAttachment,captionAreaHasValue){
        let a=captionForIndividualAttachment
        if($('#caption-checkbox').prop('checked')&& !document.querySelector(".captionCheckBoxDiv")){
            let captionCheckBoxDiv= document.createElement("div");
            captionCheckBoxDiv.className="captionCheckBoxDiv";
            document.querySelector("#caption-section").insertBefore(captionCheckBoxDiv,document.querySelector("#caption-section").children[0])
        }
        let captionHtml="",captionTextAreaHtml="";
        for(let i=0;i<attLen;i++){
            let file = attachments[i];
            let name = (file.name.length > 9) ? (file.name.trim().substring(0, 9) + "...") : (file.name.trim());

            captionHtml += `
                <div>
                    <input type="radio" id="radio${i}" name="attachment" class="attachmentNames" value="${name}" style="margin: 0px 5px; cursor: pointer" ${i == 0 ? 'checked' : ''}>
                    <label for="radio${i}" style="cursor: pointer">${name}</label>
                </div>
            `;

            captionTextAreaHtml += `
                <textarea type="text" id="caption-input${i}" class="caption-input ${i === 0 ? '' : 'hide'}" 
                        style="width: 434px; font-size: 12px; padding: 7px; resize: none" 
                        placeholder="Type your caption for the file: ${file.name.trim().length > 50 ? file.name.trim().substring(0, 50) + '...' : file.name.trim()}"
                ></textarea>
            `;
        }
        if(attLen==1) captionHtml= ``;
        $(".captionCheckBoxDiv").html(`${captionHtml}`)
        $(".captionTextAreas").html(`${captionTextAreaHtml}`)
        if(captionAreaHasValue){
            for(let i=0;i<attLen;i++){
                if(document.querySelector(`#caption-input${i}`)&&captionForIndividualAttachment[i])
                document.querySelector(`#caption-input${i}`).value=captionForIndividualAttachment[i]
            }
        }
        document.querySelectorAll(".attachmentNames").forEach((ele) => {
            ele.addEventListener("change",()=>{
            for(let i=0;i<attLen;i++){
                if(document.getElementById(`radio${i}`).checked){
                    document.querySelector(`#caption-input${i}`).classList.remove("hide")
                }
                else{
                    if(!document.getElementById(`radio${i}`).classList.contains("hide"))
                    document.querySelector(`#caption-input${i}`).classList.add("hide")
                }
            }
            })
        })
        document.querySelectorAll(".caption-input").forEach((ele) => {
            ele.addEventListener("input",async ()=>{
                var eleId=ele.id.substring(ele.id.search(/\d/))
                let captionForIndividualAttachment= await new Promise((resolve) => {
                    chrome.storage.local.get(['captionForIndividualAttachment'], (res) => {
                        resolve(res.captionForIndividualAttachment);
                    })
                });
                captionForIndividualAttachment[eleId]=ele.value;
                chrome.storage.local.set({ 'captionForIndividualAttachment': captionForIndividualAttachment })
            })
        })
    }

    async function showAttachments() {
        $('#attachments-container').html(`<span style="margin-right:10px">Fetching...</span>`);
        let attachments = await new Promise((resolve) => {
            chrome.storage.local.get(['attachmentsData'], (res) => {
                resolve(res.attachmentsData || []);
            });
        });
        let showAllAttachments = await new Promise((resolve) => {
            chrome.storage.local.get('showAllAttachments', (res) => {
                resolve(res.showAllAttachments || false);
            });
        });
        if (attachments.length > 0) {
            let attHtml = "", attLen = attachments.length;
            let containsMedia = true, addAttHtml = true;
            for (let i = 0; i < attLen; i++) {
                let file = attachments[i];
                let addComma=true;
                let name = file.name.trim();
            
                if(attLen-1==i){
                    addComma=false;
                }
                if (attLen <= 3) {
                    if (name.length > (24 / attLen)) {
                        name = name.slice(0, (24 / attLen)) + "...";
                    }
                } else if (i < 2) {
                    if (name.length > 8) {
                        name = name.slice(0, 8) + "...";
                    }
                } else if(!showAllAttachments){
                    addAttHtml = false;
                }
                if(showAllAttachments){
                    if(name.length > 7)
                    name = file.name.trim().slice(0, 7) + "...";
                    else
                    name=file.name.trim();
                }

                if (addAttHtml && addComma) {
                    attHtml += `<span class="attachment-name">${name}<img src="/logo/remove-attachments-icon.png" alt="Remove Icon" id="${i}"/>,</span>`;
                }else if(addAttHtml){
                    attHtml += `<span class="attachment-name">${name}<img src="/logo/remove-attachments-icon.png" alt="Remove Icon" id="${i}"/></span>`;
                }
            };

            if (attLen > 3 && !showAllAttachments) {
                attHtml += `<span class="show_more" style="margin-right: 5px;">and <span style="text-decoration:underline;">${attLen - 2} more</span></span>`
            }
            if (attLen > 3 && showAllAttachments) {
                attHtml += `<span class="show_less" style="margin-right: 5px;">... <span style='text-decoration:underline'>show less</span></span>`
            }
            $('#attachments-container').html(attHtml);
            if(showAllAttachments){
                // document.querySelector("#attachments-container").style.textDecoration="underline";
                if($('#message').val().length==0)
                document.querySelector("#attachments-container").style.maxWidth="250px";
                else
                document.querySelector("#attachments-container").style.maxWidth="333px";
            }
            else{
                document.querySelector("#attachments-container").style.textDecoration="none";
                document.querySelector("#attachments-container").style.maxWidth="270px";
            }
            document.querySelector("#message").addEventListener("input",()=>{
                if($('#message').val().length==0)
                document.querySelector("#attachments-container").style.maxWidth="250px";
                else
                document.querySelector("#attachments-container").style.maxWidth="333px";
            })
            document.querySelectorAll(".attachment-name img").forEach((element)=>{
                element.addEventListener("click",async(e)=>{
                    let captionForIndividualAttachment = await new Promise((resolve) => {
                        chrome.storage.local.get(['captionForIndividualAttachment'], (res) => {
                            resolve(res.captionForIndividualAttachment|| []);
                        });
                    });
                    attachments.splice(element.id,1)
                    captionForIndividualAttachment.splice(element.id,1)
                   if(attachments.length<=3){
                    chrome.storage.local.set({ 'showAllAttachments': false })
                   }
                   chrome.storage.local.set({ 'attachmentsData': attachments })
                   chrome.storage.local.set({ 'captionForIndividualAttachment': captionForIndividualAttachment })
                   showAttachments();
                })
            })
            if(document.querySelector(".show_more")){
                document.querySelector(".show_more").addEventListener("click",()=>{
                    chrome.storage.local.set({ 'showAllAttachments': true })
                    showAttachments();
                })
            }
            if(document.querySelector(".show_less")){
                document.querySelector(".show_less").addEventListener("click",()=>{
                    document.querySelector("#attachments-container").style.textDecoration="none";
                    chrome.storage.local.set({ 'showAllAttachments': false })
                    showAttachments();
                })
            }
            $('#add-attachments').removeClass('contrast-0');
            $('#attachment-first-checkbox-section').prop('hidden', $('#message').val().trim().length == 0 || $('#attachments-container').html().trim().length == 0);

            // For Caption
            if (containsMedia) {
                let captionForIndividualAttachment = await new Promise((resolve) => {
                    chrome.storage.local.get(['captionForIndividualAttachment'], (res) => {
                        resolve(res.captionForIndividualAttachment|| []);
                    });
                });
                $('#add-caption-container').prop('hidden', false);
                $('#add-caption-checkbox-section').prop('hidden', false);

                let captionAreaHasValue=false;
                for(let i=0;i<captionForIndividualAttachment.length;i++){
                    let text=captionForIndividualAttachment[i].replace(/\s/g, "")
                    if(text.length!=0){
                        $('#caption-checkbox').prop('checked', true);
                        captionAreaHasValue=true;
                        break;
                    }
                }
                toggleCaptionCustomizationInputDiv();
                $('#caption-section').prop('hidden', !$('#caption-checkbox').is(":checked"));
                // const captionInputElement=document.querySelector(".caption-input");
                handleCaption(attLen,attachments,captionForIndividualAttachment,captionAreaHasValue);
                document.querySelector("#caption-checkbox").addEventListener("change", () =>{
                    handleCaption(attLen,attachments,captionForIndividualAttachment,captionAreaHasValue);
                })
                chrome.storage.local.get(["daysSinceInstallation", "isTooltipClosed","isCaptionUsed","tooltip_popup_count"], (res) => {
                    let daysSinceInstallation = res.daysSinceInstallation;
                    if(res.daysSinceInstallation===undefined){
                        daysSinceInstallation = res.tooltip_popup_count || 1;
                    }
                    let isTooltipClosed = res.isTooltipClosed;
                    let isCaptionUsed = res.isCaptionUsed;
                    if ([11,14,17,20].includes(daysSinceInstallation) && !isTooltipClosed && !isCaptionUsed) {
                        $('.caption-tooltip').removeClass('hide');
                        $('.checkbox-section > .add-tooltip-overlay').removeClass('hide');
                    }
                })
            }
        } else {
            $('#attachments-container').html('');
            $('#add-attachments').addClass('contrast-0');
            $('#add-caption-container').prop('hidden', true);
            $('#add-caption-checkbox-section').prop('hidden', true);
            $('#attachment-first-checkbox-section').prop('hidden', true);
        }
    }
    showAttachments();

    function dataURItoBlob(file) {
        return new Promise((response, reject) => {
            const fr = new FileReader;
            fr.readAsDataURL(file);
            fr.onload = () => response(fr.result);
            fr.onerror = err => reject(err)
        })
    }

    async function validateAttachments(attachments) {
        let isValid = true;
        let alertMessage = null;

        if (!attachments || attachments.length === 0) {
            isValid = false;
        } else if (attachments.length > 7) {
            alertMessage = await translate('Maximum 7 files can be send at a time.');
            isValid = false;
        } else {
            let totalSize = 0;
            for (const file of attachments) {
                if (file.size) {
                    // Max size is 20 MB for file
                    if (file.size > 20e6) {
                        let fileSizeInMB = (file.size / 1000000).toFixed(2);
                        alertMessage = await translate(`${file.name} size (${fileSizeInMB} MB) is too large. Maximum size allowed per attachment is 20MB.`);
                        isValid = false;
                        break;
                    }
                    totalSize += file.size;
                } 
            }
    
            // Max size is 100 MB in total for all files
            if (isValid && totalSize > 100e6) {
                let totalSizeInMB = (totalSize / 1000000).toFixed(2);
                alertMessage = await translate(`The total size (${totalSizeInMB} MB) of all attachments exceeds the limit. Maximum allowed size is 100MB.`);
                isValid = false;
            }
        }

        if (alertMessage) {
            $('#select-attachments').val("");
            alert(alertMessage);
        }
        return isValid;
    }

    $('#select-attachments').change(async function () {
        const selectedFileList = $(this).get(0).files;
        let selectedFiles = Array.from(selectedFileList);
        trackEvent('add_attachments', selectedFiles.length);

        let totalFilesCount = selectedFiles.length + $('#attachments-container .attachment-name').length;
        if (totalFilesCount > 1 && !isAdvanceFeatureAvailable()) {
            sendMessageToBackground({ type: 'show_advance_popup', feature: 'multiple_attachments' });
            window.close();
            return;
        } else {
            trackEvent('add_attachments_premium', selectedFiles.length);
        }

        $('#attachments-container').html(`<span style="margin-right:10px">Fetching...</span>`);
        let attachmentsData = await new Promise((resolve) => {
            chrome.storage.local.get(['attachmentsData'], async (res) => {
                let attachmentsData = res.attachmentsData || [];
                let allAttachments = attachmentsData.concat(selectedFiles).map(file => ({ 'name': file?.name, 'size': file?.size }));
                let isValidAttachments = await validateAttachments(allAttachments);
                
                if (isValidAttachments) {
                    for (const file of selectedFiles) {
                        let blob = await dataURItoBlob(file)
                        attachmentsData.push({
                            'name': file.name,
                            'size': file.size,
                            'data': JSON.stringify(blob)
                        });
                    }
                }   
                
                resolve(attachmentsData);
            });
        });

        await chrome.storage.local.set({ 'attachmentsData': attachmentsData });
        await showAttachments();
        $(this).val("");
    });

    $('#add-attachments').click(function () {
        chrome.storage.local.get(["first_visit_attachment", "first_attachment_click_count"], (res) => {
            let first_attachment_click_count = res.first_attachment_click_count;
            if (first_attachment_click_count == 0) {
                chrome.storage.local.set({ first_attachment_click_count: 1 })
            }
            let first_visit_attachment = res.first_visit_attachment;
            if (first_visit_attachment == true) {
                $('.tooltip-container ').addClass('hide');
                $('#add-attachments').addClass('contrast-0');
                document.getElementById("help_popup").style.display = "block";
            } else {
                if(isLinux){
                    let attachments_length = $('#attachments-container .attachment-name').length;
                    sendMessageToBackground({ type: "add_attachments", attachments_length: attachments_length });
                    window.close();
                } else {
                    $('#select-attachments').click();
                }
            }
        })
    })

    $('#how_to_send_messages_to_groups').click(async function(){
        trackButtonClick('how_to_send_messages_to_groups');
        
        translatedGroupMsgObj=await fetchTranslations(groupMsgObj)
        if (messageToggleSwitchValue !== "groups") {
            document.querySelector("#message_type_groups").click()
        }
        driver(translatedGroupMsgObj).drive();
        removeHighlightTour();
    });

    $('#how_to_send_messages_to_contacts').click(async function(){
        trackButtonClick('how_to_send_messages_to_contacts');

        translatedContactMsgObj=await fetchTranslations(contactMsgObj)
        if (messageToggleSwitchValue !== "contacts") {
            document.querySelector("#message_type_contact").click()
        }
        driver(translatedContactMsgObj).drive();
        removeHighlightTour();
    });

    $('#how_to_send_customized_messages').click(async function() {
        trackButtonClick('how_to_send_customized_messages');
        
        translatedCustomObj = await fetchTranslations(customizationObj);
        translatedCustomObj.steps[1].popover.onNextClick = () => {
            document.querySelector(".import_excel_box").click();
            document.querySelector("#import-from-device").click();
            $("#csv").on("change", function (e) {
                driver(translatedCustomObj).moveNext();
            });
        };
        if (messageToggleSwitchValue !== "numbers") {
            document.querySelector("#message_type_numbers").click()
        }
        customization_obj = true;
        driver(translatedCustomObj).drive();
        removeHighlightTour()
    });

    $('#how_to_send_customized_messages_container').click(async function() {
        trackButtonClick('how_to_send_customized_messages');
        
        translatedCustomObj = await fetchTranslations(customizationObj);
        translatedCustomObj.steps = translatedCustomObj.steps.slice(2, 5);
        if (messageToggleSwitchValue !== "numbers") {
            document.querySelector("#message_type_numbers").click()
        }
        customization_obj = true;
        driver(translatedCustomObj).drive();
        removeHighlightTour()
    });
    
    async function showHowToSendAttachmentsTour() {
        trackButtonClick('how_to_send_attachments');
        $('.tooltip-popup-container').addClass('hide');

        translatedAttachments = await fetchTranslations(attachmentObj);
        translatedAttachments.steps[2].popover.onNextClick = () => {
            attachment_obj = true;
            const fileInput = document.querySelector("#select-attachments");
            fileInput.click();
            fileInput.addEventListener('change', () => {
                driver(translatedAttachments).moveNext();
            }, { once: true });
        };
        if (messageToggleSwitchValue !== "numbers") {
            document.querySelector("#message_type_numbers").click()
        }
        driver(translatedAttachments).drive();
        removeHighlightTour();
    }

    $('#how_to_send_attachments').click(async function() {
        await showHowToSendAttachmentsTour();
    });

    $('#how_to_send_attachments_2').click(async function() {
        await showHowToSendAttachmentsTour();
    });

    $('#how_to_export_unsaved_contacts').click(function(){
        trackButtonClick('how_to_export_unsaved_contacts');

        removeHighlightTour()
        sendMessageToBackground({type: "unsaved_contacts_demo"})
    })

    $('#caption-checkbox').change(function () {
        $('#caption-section').prop('hidden', !$(this).is(":checked"))
        const isChecked= $(this).is(":checked");
        toggleCaptionCustomizationInputDiv();
        // updating premium usage for caption
        let isCaptionChecked = $("#caption-checkbox").is(":checked");
        if(isCaptionChecked){
            chrome.storage.local.get(['premiumUsageObject'], function(result){
                if(result.premiumUsageObject!==undefined){
                    let updatedPremiumUsageObject = {...result.premiumUsageObject, caption: true};
                    chrome.storage.local.set({'premiumUsageObject': updatedPremiumUsageObject});
                }
            });
        }
        trackButtonClick('add_caption');
    })

    // tooltip popup code starts
    chrome.storage.local.get(["daysSinceInstallation", "lastTooltipOpenDate", "installDate","tooltip_popup_count"], (result) => {
        let daysSinceInstallation = result.daysSinceInstallation;
        if(result.daysSinceInstallation===undefined){
            daysSinceInstallation = result.tooltip_popup_count || 1;
        }
        const installDate = new Date(result.installDate).toDateString();
        const lastTooltipOpenDate = result.lastTooltipOpenDate ? new Date(result.lastTooltipOpenDate) : null;
        const today = new Date().toDateString();
        if (installDate && today !== installDate) {
            if (lastTooltipOpenDate == null || lastTooltipOpenDate.toDateString() !== today) {
                chrome.storage.local.set({ lastTooltipOpenDate: today });
                chrome.storage.local.set({ daysSinceInstallation: daysSinceInstallation + 1 });
                chrome.storage.local.set({ isTooltipClosed: false });
                if (daysSinceInstallation < 3) {
                    chrome.storage.local.set({ first_visit_attachment: true });
                }
            }
        }

        chrome.storage.local.get(["daysSinceInstallation", "isTooltipClosed"], (res) => {
            let daysSinceInstallation = res.daysSinceInstallation;
            let isTooltipClosed = res.isTooltipClosed;
            if ([1, 4, 7, 10].includes(daysSinceInstallation) && !isTooltipClosed) {
                $('.tooltip-popup-container').removeClass('hide');
                $('.add-tooltip-overlay').removeClass('hide');
            }
        })
    });

    $('.close-tooltip').on('click', () => {
        $('.tooltip-popup-container').addClass('hide');
        $('.caption-tooltip').addClass('hide');
        $('.add-tooltip-overlay').addClass('hide');
        chrome.storage.local.set({ lastTooltipOpenDate: new Date().toDateString() });
        chrome.storage.local.set({ isTooltipClosed: true });
    })

    // tooltip popup code ends

    // show overlay and help popup when ? is clicked
    // $(".attachment-instructions").click(function () {
    //     document.getElementById("help_popup").style.display = "block";
    // })

    // Message Template - Feature
    function showTemplateSelectorOrSave() {
        chrome.storage.local.get(['templates'], (res) => {
            let isTextPresent = false;
            const text = $('#message').val().trim();
            const templates = res.templates || [];
            templates.forEach(template => {
                if (text === template.message) {
                    isTextPresent = true;
                }
            })

            if (isTextPresent || text.length == 0) {
                $('#template-selector').removeClass('hide');
                $('#template-save-icon').addClass('hide');
                $('.tooltip-popup-content').removeClass('right-side');
            } else {
                $('#template-selector').addClass('hide');
                $('#template-save-icon').removeClass('hide');
                $('.tooltip-popup-content').addClass('right-side');
            }
        })
    }

    showTemplateSelectorOrSave();
    $('#message').on('input click', function () {
        showTemplateSelectorOrSave();

        $('#template-selector').removeClass('active');
        $('.tooltip-container ').addClass('hide');
        $('#templates-container').addClass('hide');
        $('#attachment-first-checkbox-section').prop('hidden', $('#message').val().trim().length == 0 || $('#attachments-container').html().trim().length == 0);
    })

    $('#message').on('keydown', function (event) {
        if (event.ctrlKey || event.metaKey) {
            if (event.shiftKey) {
                switch (event.key.toLowerCase()) {
                    case 'x': // Ctrl + Shift + X for Strikethrough
                        event.preventDefault();
                        wrapSelectedTextOfMessage('~');
                        break;
                    case 'i': // Ctrl + Shift + I for InlineCode
                        event.preventDefault();
                        wrapSelectedTextOfMessage('`');
                        break;
                }
            } else {
                switch (event.key.toLowerCase()) {
                    case 'b': // Ctrl + B for Bold
                        event.preventDefault();
                        wrapSelectedTextOfMessage('*');
                        break;
                    case 'i': // Ctrl + I for Italic
                        event.preventDefault();
                        wrapSelectedTextOfMessage('_');
                        break;
                }
            }
        }
    })

    function wrapSelectedTextOfMessage(ch) {
        const textarea = document.querySelector('#message');
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;

        if (start !== end) {
            const selectedText = text.substring(start, end);

            if (selectedText.startsWith(ch) && selectedText.endsWith(ch)) {
                const unwrappedText = selectedText.slice(ch.length, -(ch.length));
                textarea.value = text.substring(0, start) + unwrappedText + text.substring(end);
                textarea.setSelectionRange(start, start + unwrappedText.length);
            } else {
                const boldText = `${ch}${selectedText}${ch}`;
                textarea.value = text.substring(0, start) + boldText + text.substring(end);
                textarea.setSelectionRange(start, start + boldText.length);
            }
            textarea.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }

    $('#template-save-icon').click(function () {
        const topPosition = Math.max(0, (window.innerHeight - 250) / 2 + window.pageYOffset) + 'px';
        $('.template-save-popup').css('top', topPosition);
        $('.template-save-popup-container').removeClass("hide")
        $('#template-msg').val($('#message').val().trim());
        $('#template-name').val("").focus();
    });

    $('#save-template-form').submit(function (e) {
        e.preventDefault();
    
        const tempName = $('#template-name').val();
        const tempMessage = $('#template-msg').val();
        const editIndex = $('#edit-template-index').val();
    
        chrome.storage.local.get(['templates'], (res) => {
            let templates = res.templates || [];
            let isTempNameExists = false;
    
            if (editIndex === "") { 
                templates.forEach(template => {
                    if (template.name === tempName) {
                        isTempNameExists = true;
                    }
                });
    
                if (isTempNameExists) {
                    alert(`Template name "${tempName}" already exists!`);
                } else {
                    templates.push({ name: tempName, message: tempMessage });
                }
            } else { 
                const index = parseInt(editIndex);
                templates[index].name = tempName;
                templates[index].message = tempMessage;
            }
    
           
            chrome.storage.local.set({ templates: templates });
            $('.template-save-popup-container').addClass('hide');
            $('.template-container').addClass('hide');
            $('#template-save-icon').addClass('hide');
            $('#template-selector').removeClass('hide');
            $('.tooltip-popup-content').removeClass('right-side');
            $('#edit-template-index').val("");
    
            trackButtonClick('save_template_message');
        });
    });
    

    function editTemplate(index){
        chrome.storage.local.get(['templates'], async (res) => {
            let templates = res.templates;
            let message=templates[index].message
            let name=templates[index].name
            const topPosition = Math.max(0, (window.innerHeight - 250) / 2 + window.pageYOffset) + 'px';
            $('.template-save-popup').css('top', topPosition);
            $('.template-save-popup-container').removeClass("hide")
            $('#template-msg').val(message);
            $('#template-name').val(name).focus();
            $('#edit-template-index').val(index);
        })
    }

    function showTemplates() {
        $('#templates-container').html('');
        chrome.storage.local.get(['templates'], async (res) => {
            let templates = res.templates || [];
            if (templates.length > 0) {
                for (let index = templates.length - 1; index >= 0; index--) {
                    $('#templates-container').append(`
                    <div class="dropdown-item">
                    <p id="${index}" class="template-text text">${templates[index].name}</p>
                     <img id="${index}" class="template-edit btn" src="./logo/edit_icon.png" />
                    <img id="${index}" class="template-delete btn" src="./logo/template_delete.png" />
                    </div>`);
                }
            } else {
                $('#templates-container').append(`
                    <div class="dropdown-item">${await translate("Nothing to show!")}</div>
                    <div id="create_template_button" class="dropdown-item" style="justify-content:flex-start; gap:10px;font-size:13px;margin-top: 5px;">
                        <img src="./logo/floppy-disk.png" style="width:18px;"/>
                        <span>Add Template</span>
                    </div>
                `);
                $('#create_template_button').click(function () {
                    const topPosition = Math.max(0, (window.innerHeight - 250) / 2 + window.pageYOffset) + 'px';
                    $('.template-save-popup').css('top', topPosition);
                    $('.template-save-popup-container').removeClass("hide")
                    $('#template-msg').val($('#message').val().trim());
                    $('#template-name').val("").focus();
                });
            }

            $('.template-text').click(function () {
                let id = $(this).attr('id');
                let tempMsg = templates[id].message;
                $('#message').val(tempMsg)

                $('#templates-container').addClass('hide');
                $('#template-selector').removeClass('active');
            })

            $('.template-delete').click(async function () {
                let id = $(this).attr('id');
                let msg = await translate(`Are you sure, you want to remove template "TEMPLATE NAME" ?`);
                msg = msg.replace(/"(.*?)"/gi, `"${templates[id].name}"`);
                let __confirm = confirm(msg);
                if (__confirm) {
                    templates.splice(id, 1);
                    chrome.storage.local.set({ templates: templates });
                    showTemplates();
                }
            })
            
            $('.template-edit').click(async function () {
                let id = $(this).attr('id');
                editTemplate(id)
            })
        })
    }

    $('#template-selector').click(function (e) {
        showTemplates();
        trackButtonClick('select_template_message');

        $('.tooltip-container ').addClass('hide');
        $('#templates-container').toggleClass('hide');
        $('#template-selector').toggleClass('active');
    });

    $('.template-popup-close-button').click(function () {
        $('.template-save-popup-container').addClass('hide');
    })

    //Campaign Numbers - Feature
    function showCampaignSelectorOrSave() {
        chrome.storage.local.get(['campaigns'], (res) => {
            let isCampaignPresent = false;
            const numbers = getFilteredNumbers($('#numbers').val());
            const campaigns = res.campaigns || [];
            let filteredCampaigns = filterCampaignsByType(campaigns, messageToggleSwitchValue)

            filteredCampaigns.forEach(campaign => {
                if (numbers === campaign[messageToggleSwitchValue]) {
                    isCampaignPresent = true;
                }
            })

            if (isCampaignPresent || numbers.length == 0) {
                $('#campaign-selector').removeClass('hide');
                $('#campaign-save-icon').addClass('hide') 
            } else {
                $('#campaign-selector').addClass('hide');
                $('#campaign-save-icon').removeClass('hide');
            }
        })
    }

    showCampaignSelectorOrSave();
    showGroupsCampaignSelectorOrSave()

    $('#numbers').on('click change', function () {
        showCampaignSelectorOrSave();

        $('#campaign-selector').removeClass('active');
        $('#campaigns-container').addClass('hide');
    })
    function helper(campaign = false){
        const topPosition = Math.max(0, (window.innerHeight - 250) / 2 + window.pageYOffset) + 'px';
        let popupTitle = document.querySelector(".campaign-title")
        let popupBtn = document.querySelector(".campaign-btn")
        let textArea = document.querySelector('#campaign-numbers')
        let excelBtn = document.querySelector(".import-excel-dropdown[data-suffix='campaign']")
        
        if(messageToggleSwitchValue !== "numbers"){
            textArea.setAttribute("readonly",true)
            document.querySelector(".import-excel-dropdown[data-suffix='campaign']").style.display = "none";
        }
        else{
            textArea.removeAttribute("readonly")
            excelBtn.style.display = campaign ? "inline-block" : "none";
        }

        popupTitle.innerHTML=`Save ${String(messageToggleSwitchValue).charAt(0).toUpperCase() + String(messageToggleSwitchValue).slice(1)}`
        popupBtn.innerHTML=`Save ${String(messageToggleSwitchValue).charAt(0).toUpperCase() + String(messageToggleSwitchValue).slice(1)}`

        $('.campaign-save-popup').css('top', topPosition);
        $('.campaign-save-popup-container').removeClass("hide")
    }

    $('#campaign-save-icon').click(function () {
        let numbers = getFilteredNumbers($('#numbers').val());
        helper()
        $('#campaign-numbers').val(numbers);
        $('#campaign-name').val(csv_name).focus();
    });

    $('#campaign-save-icon-items').click(function () {
        let items = getItemsName()
        helper()
        $('#campaign-numbers').val(items);
        $('#campaign-name').val(csv_name).focus();
    });

    

    $('#save-campaign-form').submit(function (e) {
        e.preventDefault();
    
        const campName = $('#campaign-name').val();
        const editIndex = $('#edit-index').val();
        let campData = {};
    
        switch (messageToggleSwitchValue) {
            case "numbers":
                campData.numbers = getFilteredNumbers($('#campaign-numbers').val());
                break;
            case "groups":
                campData.groups = getItemsName();
                break;
            case "contacts":
                campData.contacts = getItemsName(); 
                break;
            default:
                alert("Invalid toggle value!");
                return;
        }
    
        if (editIndex === "") {
            saveCampaign(campName, campData, (success) => {
                if (success) finalizeCampaignSave();
            });
        } else {
            const index = parseInt(editIndex);
            updateCampaign(index, campName, campData, (success) => {
                if (success) finalizeCampaignSave();
            });
        }
    });
    
    function finalizeCampaignSave() {
        if(messageToggleSwitchValue === "numbers"){
            $('#campaign-selector').removeClass('hide');
            $('#campaigns-container').addClass('hide');
            $('#campaign-save-icon').addClass('hide');
        }  
        else {
            $('#campaign_selector_groups').removeClass('hide');
            $('#campaigns-container-groups').addClass('hide');
            $('#campaign-save-icon-items').addClass('hide');
        }

        $('.campaign-save-popup-container').addClass('hide');
        $('#edit-index').val("");
        trackButtonClick('save_campaign_numbers');
    }
    
    

    function editCampaignsNumber(index){
        chrome.storage.local.get(['campaigns'], async (res) => {
            let campaigns = res.campaigns;
            let numbers = campaigns[index][messageToggleSwitchValue]
            let name = campaigns[index].name
            helper()
            $('#campaign-numbers').val(numbers);
            $('#campaign-name').val(name).focus();
            $('#edit-index').val(index);
        })
    }

    function showCampaigns() {
        const containerMap = {
            numbers: '#campaigns-container',
            groups: '#campaigns-container-groups',
            contacts: '#campaigns-container-groups',
            labels: '#campaigns-container-groups',
            lists: '#campaigns-container-groups'
        };
    
        const containerSelector = containerMap[messageToggleSwitchValue] || '#campaigns-container';
        $(containerSelector).html('');
        chrome.storage.local.get(['campaigns'], async (res) => {
            let campaigns = res.campaigns || [];
            let filteredCampaigns = filterCampaignsByType(campaigns, messageToggleSwitchValue);
    
            if (filteredCampaigns.length > 0) {
                for (let index = filteredCampaigns.length - 1; index >= 0; index--) {
                    $(containerSelector).append(`
                        <div class="dropdown-item">
                            <p id="${index}" class="campaign-name text">${filteredCampaigns[index].name}</p>
                            <img id="${index}" class="campaign-edit btn ${messageToggleSwitchValue !== 'numbers' ? 'hide' : '' }" src="./logo/edit_icon.png" />
                            <img id="${index}" class="campaign-delete btn" src="./logo/template_delete.png" />
                        </div>`);
                }
            } else {
                $(containerSelector).append(`
                    <div class="dropdown-item">${await translate("Nothing to show!")}</div>
                    ${messageToggleSwitchValue==="numbers"?`<div id="create_campaign_button" class="dropdown-item" style="justify-content:flex-start; gap:10px;font-size:13px;margin-top: 5px;">
                        <img src="./logo/floppy-disk.png" style="width:18px;"/>
                        <span>Add Campaign</span>
                    </div>`:``}
                `);
                $('#create_campaign_button').click(function () {
                    if(messageToggleSwitchValue === "numbers"){
                        let numbers = getFilteredNumbers($('#numbers').val());
                        setupImportExcelDropdown('campaign');
                        helper(true)
                        $('#campaign-numbers').val(numbers);
                        $('#campaign-name').val(csv_name).focus();
                    }
                });
            }
    
            // Campaign selection click handler
            $('.campaign-name').click(function () {
                let id = $(this).attr('id');
                let campaignNumbers = filteredCampaigns[id][messageToggleSwitchValue];
                messageToggleSwitchValue === "numbers" ? replaceNumbers(campaignNumbers):renderSelectedItems(campaignNumbers);
    
                $(containerSelector).addClass('hide');
                messageToggleSwitchValue==="numbers" ? $('#campaign-selector').removeClass('active'):$('#campaign_selector_groups').removeClass('active');
            });
    
            // Campaign delete handler
            $('.campaign-delete').click(async function () {
                let id = $(this).attr('id');
                let msg = await translate(`Are you sure, you want to remove campaign "CAMPAIGN NAME"?`);
                msg = msg.replace(/"(.*?)"/gi, `"${filteredCampaigns[id].name}"`);
                let __confirm = confirm(msg);
                if (__confirm) {
                    campaigns = campaigns.filter(campaign => campaign !== filteredCampaigns[id]);
                    chrome.storage.local.set({ campaigns });
                    showCampaigns();
                }
            });
    
            // Campaign edit handler
            $('.campaign-edit').click(async function () {
                let id = $(this).attr('id');
                let originalId = campaigns.indexOf(filteredCampaigns[id]); 
                editCampaignsNumber(originalId);
            });
        });
    }
        
    $('#campaign-selector').click(function (e) {
        showCampaigns();
        trackButtonClick('select_campaign_numbers');

        $('#campaigns-container').toggleClass('hide');
        $('#campaign-selector').toggleClass('active');
    });

    $('#campaign_selector_groups').click(function (e) {
        showCampaigns();
        trackButtonClick('select_campaign_groups');

        $('#campaigns-container-groups').toggleClass('hide');
        $('#campaign_selector_groups').toggleClass('active');
    });

    $('.campaign-popup-close-button').click(function () {
        $('.campaign-save-popup-container').addClass('hide');
    })
    
    $('.invalid-excel-popup-close-button').click(function () {
        $('.invalid-excel-popup-container').addClass('hide');
        unset_csv_styles();
        hideCustomizationContainer();
        replaceNumbers('');
        toggleUploadExcelText(true);
    })
    
    $('.template-excel-button').click(function () {
        $('.invalid-excel-popup-container').addClass('hide');
        unset_csv_styles();
        hideCustomizationContainer();
        replaceNumbers('');
        toggleUploadExcelText(true);
    })
    
    //Delivery Reports Dropdown - Feature
    function showReports() {
        $('#reports-container').html('');
        chrome.storage.local.get(['deliveryReports'], async (res) => {
            let reports = res.deliveryReports || [];

            if (reports.length > 0) {
                for (let index = reports.length - 1; index >= 0; index--) {
                    let reportDate = getReportDateFormat(reports[index].date);
                    let reportName = reports[index].name || "Campaign " + (index+1);

                    $('#reports-container').append(`
                        <div class="dropdown-item">
                            <p id="${index}" class="report-name text">
                                <img src="./logo/excel_icon.png"/>
                                <span style="color: #009A88;">${reportName}</span>
                                <span style="color: #5D6063;">${reportDate}</span>
                            </p>
                            <img id="${index}" class="report-download btn CtaBtn" src="./logo/download_icon.png" />
                        </div>`
                    );
                }
            } else {
                $('#reports-container').append(`<div class="dropdown-item">${await translate("Nothing to show!")}</div>`);
            }

            $('.report-download').click(function () {
                let id = $(this).prop('id');
                let reportDownloadDate = getReportDateFormat(reports[id].date, true);
                let reportName = reports[id].name || "Campaign " + (+id+1);
                let reportDownloadName = `${reportName} ${reportDownloadDate}.csv`;
                
                download_csv(reports[id].data, reportDownloadName);
                trackButtonClick('download_delivery_report');
            })
        })
    }

    function displayNothing(state) {
        const itemsContainer = document.querySelector('#groups_container');

        let message;
        if (state === "none") {
            message = `No ${messageToggleSwitchValue === "lists" ? "favourites" : messageToggleSwitchValue} found`;
        } else if (state === "all") {
            message = `All ${messageToggleSwitchValue === "lists" ? "favourites" : messageToggleSwitchValue} selected`;
        }

        itemsContainer.innerHTML = `<div class="dropdown-item no-found">${message}</div>`;
        itemsContainer.classList.remove("hide");
    }

    $('#report-selector').click(function (e) {
        showReports();
        trackButtonClick('select_delivery_report');

        $('#reports-container').toggleClass('hide');
        $('#report-selector').toggleClass('active');
    })

    // Open groups/contacts selector if user clicks on blacnk space
    $('.groups_display_box').click(function (e) {
        e.stopPropagation();
        const ele = $(e.target);
        if (ele && !ele.is('.delete_group_tag')) {
            $('.search_group_input').click();
        }
    })
    
    $('.search_group_input').click(function () {
        const dataMap = {
            contacts: { all: allContacts, selected: contacts_selected },
            groups: { all: allGroups, selected: groups_selected },
            labels: { all: allLabels, selected: labels_selected },
            lists: { all: allLists, selected: lists_selected }
        };

        const current = dataMap[messageToggleSwitchValue];

        if (current) {
            $('.message-box').removeClass('hide_visibility');

            if (current.all.length === 0) {
                displayNothing("none");
                return;
            } else if (current.selected.length === current.all.length) {
                displayNothing("all");
                return;
            }

        }

        document.querySelector('.search_group_input').value = '';
        $('#select-all').prop('checked', false);
    
        showItems(messageToggleSwitchValue);
    
        $('#groups_container').removeClass('hide');
        const lastPosition = messageToggleSwitchValue === "groups" ? lastScrollPosition : lastScrollPosition_contacts;
        $('#groups_container').scrollTop(lastPosition);
    
        $('.message-box').addClass('hide_visibility');
    });

    // For closing dropdown container when user clicks outside of it
    document.addEventListener('click', function (event) {
        const dropdownContainers = document.querySelectorAll('.dropdown-container');
        const dropdownBoxes = document.querySelectorAll('.dropdown-box');
        const groupsSearchBar= document.querySelectorAll('.groups_searchbar');
        for (let i = 0; i < dropdownBoxes.length; i++) {
            if (!dropdownBoxes[i].contains(event.target) && !dropdownContainers[i].contains(event.target) && !groupsSearchBar[0].contains(event.target) && !event.target.classList.contains('dropdown-item') && !event.target.classList.contains('dropdown-container')) {
                dropdownContainers[i]?.classList.add('hide');
                dropdownBoxes[i]?.querySelector('.dropdown')?.classList.remove('active');
                $('.message-box').removeClass('hide_visibility');
                document.querySelector('.search_group_input').value='';
                $('#select-all').prop('checked', false);
            }
        }
        const showPricingPopup = document.getElementsByClassName('show_pricing_popup');
        const showMultipleUsersPopup = document.getElementsByClassName('show_multiple_users');
        const showBasicPopup = document.getElementsByClassName('show-basic-popup');
        const showAdvancePopup = document.getElementsByClassName('show-advance-popup');
        for (let i = 0; i < showPricingPopup.length; i++) {
            if (showPricingPopup[i].contains(event.target)) {
                if (RUNTIME_CONFIG.useOldPricingLinks){
                    window.open(RUNTIME_CONFIG.basePricingUrl, "_blank");
                } else {
                    sendMessageToBackground({ type: 'show_pricing_popup' });
                    window.close();
                }
            }
        }
        for (let i = 0; i < showMultipleUsersPopup.length; i++) {
            if (showMultipleUsersPopup[i].contains(event.target)) {
                if (RUNTIME_CONFIG.useOldPricingLinks){
                    window.open(RUNTIME_CONFIG.basePricingUrl + "multiple-account", "_blank");
                } else {
                    sendMessageToBackground({ type: 'show_multiple_users_popup' });
                    window.close();
                }
            }
        }
        for (let i = 0; i < showBasicPopup.length; i++) {
            if (showBasicPopup[i].contains(event.target)) {
                if (RUNTIME_CONFIG.useOldPricingLinks){
                    let country_name = getCountryNameWithSpecificPricing();
                    window.open(RUNTIME_CONFIG.basePricingUrl + `?country=${country_name}&lastPlan=lastPlan&currentPlan=basic`, "_blank");
                } else {
                    sendMessageToBackground({ type: 'show_basic_pricing_popup' });
                    window.close();
                }
            }
        }
        for (let i = 0; i < showAdvancePopup.length; i++) {
            if (showAdvancePopup[i].contains(event.target)) {
                if (RUNTIME_CONFIG.useOldPricingLinks){
                    let country_name = getCountryNameWithSpecificPricing();
                    window.open(RUNTIME_CONFIG.basePricingUrl + `?country=${country_name}&lastPlan=lastPlan&currentPlan=advance`, "_blank");
                } else {
                    sendMessageToBackground({ type: 'show_advance_pricing_popup' });
                    window.close();
                }
            }
        }
    });

    document.querySelector('.groups_display_box').addEventListener('click', function (event) {
        if (event.target && event.target.classList.contains('delete_group_tag')) {
            const deleteTag = event.target;
            const parentTag = deleteTag.closest('.group_tag');

            if (parentTag) {
                let objId = parentTag.id;
                let serializedId = parentTag.getAttribute('data-id-field');
                let type = messageToggleSwitchValue;

                let selectedArray = getSelectedArray(type);
                selectedArray = selectedArray.filter(item => item !== serializedId);
                setSelectedArray(type, selectedArray);

                chrome.storage.local.set({ [getStorageKey(type)]: selectedArray });
                handleDeleteBin();
                // handleTemplateSaveBtn()
                // handleCampaignBox()
                
                const itemElement = document.querySelector(`#groups_container #${objId}`);
                if (itemElement) itemElement.classList.remove('hide');

                parentTag.remove();

                const displayBox = document.querySelector('.groups_display_box');
                if (selectedArray.length === 0) {
                    displayBox.innerHTML = `<p style="color:gray;font-size:13px;margin:0px;">Select ${type} from the dropdown . . .</p>`;
                }
            }
        }
    });


    // Language Translate Feature
    setDefaultLanguageData();   // Initialize defaultTexts data
    populateLanguageOptions();  // Load the language optioins

    function setDefaultLanguageData() {
        let textElements = document.querySelectorAll('[data-translate-text]');
        let defaultTexts = Object.values(textElements).map(ele => ele.innerText);

        let placeholderElements = document.querySelectorAll('[data-translate-placeholder]');
        let defaultPlaceholders = Object.values(placeholderElements).map(ele => ele.placeholder);

        chrome.storage.local.set({
            'defaultLanguageData': {
                'texts': defaultTexts,
                'placeholders': defaultPlaceholders
            }
        });
    }

    function populateLanguageOptions() {
        let languageNames = new Intl.DisplayNames(['en'], { type: 'language' });
        let selectedLanguageCodes = navigator.languages.map(lang => lang.split('-')[0]);
        selectedLanguageCodes = selectedLanguageCodes.filter((value, index, self) => self.indexOf(value) === index);

        let languageSelector = document.getElementById('language-selector');
        languageSelector.innerHTML = '';
        languageSelector.appendChild(createOption('English (Default)', 'default'));

        chrome.storage.local.get(['currentLanguage'], (res) => {
            currentLanguage = res.currentLanguage || 'default';
            translateAll(currentLanguage);
            
            // Add selected language options
            selectedLanguageCodes.forEach((language) => {
                if (language === 'en') return;
                languageSelector.appendChild(createOption(languageNames.of(language), language, (language === currentLanguage)));
            });
            // Add a separator
            languageSelector.appendChild(createOption('-----------------------', '', false, true));
            // Add more language options
            allLanguageCodes.forEach((language) => {
                if (language === 'en' || selectedLanguageCodes.includes(language)) return;
                languageSelector.appendChild(createOption(languageNames.of(language), language, (language === currentLanguage)));
            });
        });
    }

    $('#language-selector').change(function () {
        currentLanguage = $(this).val();
        chrome.storage.local.set({ 'currentLanguage': currentLanguage });
        translateAll(currentLanguage);
        trackEvent('translate_language', currentLanguage);
        sendMessageToBackground({ type: 'translate_language', language: currentLanguage });
    })

    async function translateAll(targetLanguage) {
        let textElements = document.querySelectorAll('[data-translate-text]');
        let placeholderElements = document.querySelectorAll('[data-translate-placeholder]');
    
        chrome.storage.local.get(['defaultLanguageData', 'translatedCache'], async (res) => {
            let defaultTexts = res.defaultLanguageData.texts;
            let defaultPlaceholders = res.defaultLanguageData.placeholders;
            let cache = res.translatedCache || {};
    
            const textPromises = defaultTexts.map(async text => {
                if (cache[text] && cache[text][targetLanguage]) {
                    return cache[text][targetLanguage];
                } 

                const translatedText = await translateAPI(text);
                if (!cache[text]) cache[text] = {};
                cache[text][targetLanguage] = translatedText;
                return translatedText;
            });
    
            const placeholderPromises = defaultPlaceholders.map(async placeholder => {
                if (cache[placeholder] && cache[placeholder][targetLanguage]) {
                    return cache[placeholder][targetLanguage];
                } 

                const translatedPlaceholder = await translateAPI(placeholder);
                if (!cache[placeholder]) cache[placeholder] = {};
                cache[placeholder][targetLanguage] = translatedPlaceholder;
                return translatedPlaceholder;
            });
    
            const translatedTexts = await Promise.all(textPromises);
            const translatedPlaceholders = await Promise.all(placeholderPromises);
    
            textElements.forEach((ele, index) => ele.innerText = translatedTexts[index]);
            placeholderElements.forEach((ele, index) => ele.placeholder = translatedPlaceholders[index]);
    
            chrome.storage.local.set({ 'translatedCache': cache });
        });
    }
});

async function translate(text, sourceLanguage = 'en', targetLanguage = currentLanguage) {
    if (text === undefined || text === null || text.trim().length === 0)
        return "";
    
    // Check if the translation is already in cache
    return new Promise(resolve => {
        chrome.storage.local.get(['translatedCache'], async function(result) {
            const cache = result.translatedCache || {};

            if (cache[text] && cache[text][targetLanguage]) {
                resolve(cache[text][targetLanguage]);
            } else {
                const translatedText = await translateAPI(text, sourceLanguage, targetLanguage);

                if (!cache[text]) cache[text] = {};
                cache[text][targetLanguage] = translatedText;

                chrome.storage.local.set({ 'translatedCache': cache }, function() {
                    resolve(translatedText);
                });
            }
        });
    });
}

async function translateAPI(text, sourceLanguage = 'en', targetLanguage = currentLanguage) {
    let filter = (normalText) => normalText.replaceAll(/<<(.*?)>>/gi, '<span class="styled_text">$1</span>');

    if (text === undefined || text === null || text.trim().length === 0)
        return "";
    if (targetLanguage === 'default' || targetLanguage === sourceLanguage)
        return filter(text);

    const translateAPI = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLanguage}&tl=${targetLanguage}&dt=t&q=${encodeURI(text)}`;
    try {
        let response = await fetch(translateAPI);
        let data = await response.json();
        let translatedText = data[0].map(row => row[0]).join(' ');
        return filter(translatedText);
    } catch (e) {
        trackError("translate_api_error", e);
        trackError("translate_api_popupjs_error", e);
        return filter(text);
    }
}

function createOption(__text, __value, __selected = false, __disabled = false) {
    let option = document.createElement('option');
    option.text = __text;
    option.value = __value;
    option.selected = __selected;
    option.disabled = __disabled;
    return option;
}


function getFet(key) {
    let fet;
    if (key == 'groupContactExport')
        fet = 'Export Group Contacts'
    if (key == 'customisation')
        fet = 'Customization'
    if (key == 'batching')
        fet = 'Batching'
    if (key == 'timeGap')
        fet = 'Time Gap'
    if (key == 'stop')
        fet = 'Stop'
    if (key == 'quickReplies')
        fet = 'Quick Replies'
    if (key == 'schedule')
        fet = 'Schedule'
    if (key == 'multipleAttachment')
        fet = 'Multiple Attachment'
    if (key == 'attachment')
        fet = 'Attachment'
    if (key == 'caption')
        fet = 'Caption'
    return fet;
}

const convert_date = (date = null) => {
    if (!date)
        return null;
    return new Date(date);
}

const get_days_diff = (date1, date2) => {
    date1 = convert_date(date1);
    date2 = convert_date(date2);

    if (!date1 || !date2)
        return NaN;

    let days_diff = Math.floor((date1.getTime() - date2.getTime()) / (1000 * 3600 * 24))
    return days_diff;
}

// changing pie chart percentage
function changeInputPercentage() {
    const utilisationContainer = document.getElementById('premium_utilisation_container');
    if (utilisationContainer) {
        utilisationContainer.style.display = 'none';
    }
}

async function getMultipleAccountsData() {
    return;
}

function showMultipleAccountSection() {
    const multipleAccountBlock = document.querySelector('.mult_account_block');
    if (multipleAccountBlock) {
        multipleAccountBlock.classList.add('hide');
        multipleAccountBlock.innerHTML = '';
    }
}

function showFaqsSection() {
    const faqSection = document.querySelector('.premium_feature_faq');
    if(!faqSection) return;
    let faqHtml = "";
    FAQS.forEach((faq, index) => {
        faqHtml+=
            `
            <div class="premium_feature_block">
                <div class="faq_question_block">
                    <p class="faq_question">${index+1}) ${faq.question}</p>
                    <img src="logo/dropdown_icon.png" />
                </div>
                <p class="faq_answer">${faq.answer}</p>
            </div>
            `
    });

    faqSection.innerHTML = faqHtml;

    const allQuestions = document.querySelectorAll('.faq_question_block');
    if(allQuestions.length>0){
        allQuestions.forEach((question, _) => {
            question.addEventListener('click', function(){
                const answer = question.nextElementSibling;
                if(answer.style.display == 'block'){
                    answer.style.display = 'none';
                    question.children[1].style.transform = 'rotate(0deg)';
                } else {
                    answer.style.display = 'block';
                    question.children[1].style.transform = 'rotate(180deg)';
                }
            })
        });
    }


}

function getFreeTrialButtonHtml() {
    return '';
}

async function getBasicPremiumExpiredButton() {
    return '';
}


async function getInvoiceData() {
    return;
}
  
async function fetchInvoicePdf(id, isFirst = false) {
    try {
        const url = `${AWS_API.GET_INVOICE_DATES}?email=${customer_email}&phone=${my_number}&id=${id}`;
        const res = await fetch(url);

        if (!res.ok) throw new Error("Failed to fetch invoice");

        const blob = await res.blob();
        const pdfUrl = URL.createObjectURL(blob);

        document.getElementById('download_invoice_button').href = pdfUrl;

        if (isFirst) {
            chrome.storage.local.set({ firstInvoicePdf: pdfUrl });
        }
    } catch (err) {
        console.error("Error fetching invoice PDF:", err);
        document.getElementById('download_invoice_button').removeAttribute("href");
    }
}    

async function makeNewDesignResponse(res) {
    try {
        const response = await fetch('https://sheetdb.io/api/v1/wbzt6s0lud7bg', {
        method: "post",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify([
            {
                "Contact Number": my_number,
                "Yes/No": res,
                "Date/time": new Date().toLocaleString('en-in')
            }])
        });
        await response.json();
    } catch (error) {
        console.log("error from sheetdb api call",error)
    }
}

async function showNewDesignReviewButtons() {
    chrome.storage.local.get(['campaignNumber', 'newDesignLiked', 'newDesignSessions'], function(res){
        let campaignNumber= res.campaignNumber;
        let newDesignLiked= res.newDesignLiked;
        let newDesignSessions= res.newDesignSessions;
        if(res.newDesignLiked == undefined || res.newDesignLiked == null){
            chrome.storage.local.set({'newDesignLiked': false});
            newDesignLiked= false;
        }
        if(res.newDesignSessions == undefined || res.newDesignSessions == null){
            chrome.storage.local.set({'newDesignSessions': 0});
            newDesignSessions= 0;
        }
        const showReviewStrip= (campaignNumber && !newDesignLiked && newDesignSessions<10);
        if(showReviewStrip){
            const getReviewStripInterval= setInterval(() => {
                const reviewStrip= document.querySelector('.new_popup_question_strip');
                if(reviewStrip){
                    clearInterval(getReviewStripInterval);
                    reviewStrip.style.display="flex";
                    reviewStrip.hidden= false;
                    
                    const yesButton= document.querySelector('.question_yes_button');
                    const noButton= document.querySelector('.question_no_button');
        
                    yesButton.addEventListener('click', async ()=>{
                        await makeNewDesignResponse('Yes');
                        chrome.storage.local.set({'newDesignLiked': true});
                        document.body.removeChild(reviewStrip);
                    });
                    noButton.addEventListener('click', async ()=>{
                        await makeNewDesignResponse('No');
                        chrome.storage.local.set({'newDesignLiked': true});
                        document.body.removeChild(reviewStrip);
                    });
                    chrome.storage.local.set({'newDesignSessions': newDesignSessions+1});
                }
            }, 200);
        }
    })
}

showNewDesignReviewButtons();

function elementsToBeHighlighted() {
    const numbersBox = document.querySelector('.numbers-box');
    const messageBox = document.querySelector('.message-box');
    const numberBoxTitle = document.querySelector('.numbers-box .text_title');
    const messageBoxTitle = document.querySelector('.message-box .text_title');
    const actionsButtonContainer = document.querySelector('.action_buttons_div');
    const numbersBoxNavigationContainer = document.querySelectorAll('.numbers-box .navigation_container');
    const messageBoxNavigationContainer = document.querySelectorAll('.message-box .navigation_container');
    const buttonsBoxNavigationContainer = document.querySelectorAll('.action_buttons_div .navigation_container');
    const reportBox = document.querySelector('#report-box');
    const sendButton = document.getElementById('sender');
    const tooltipContainer = document.querySelector('.tooltip-popup-container');

    return [
        {
            element: numbersBox,
            element2: numberBoxTitle,
            child: numbersBoxNavigationContainer,
        },
        {
            element: messageBox,
            child: messageBoxNavigationContainer,
            element2: messageBoxTitle,
            element6: tooltipContainer,
        },
        {
            element: actionsButtonContainer,
            child: buttonsBoxNavigationContainer,
            element3: reportBox,
            element5: sendButton,
            // element6: tooltipContainer
        },
    ];
}

function highlightIndexedSection(index) {
    const elements = elementsToBeHighlighted();
    elements.forEach((element, i) => {
        if (index == i) {
            element.element.classList.add('focus_element');
            element.element2?.classList.add('title_focus');
            element.element3?.classList.add('reduce_opacity');
            element.element4?.classList.add('reduce_opacity');
            element.element5?.classList.add('focus_border');
            element.element6?.classList.add('display_none_class');
            element.child.forEach((child) => {
                child.hidden = false;
            });
        } else {
            element.element.classList.remove('focus_element');
            element.element2?.classList.remove('title_focus');
            element.element3?.classList.remove('reduce_opacity');
            element.element4?.classList.remove('reduce_opacity');
            element.element5?.classList.remove('focus_border');
            element.element6?.classList.remove('display_none_class');
            element.child.forEach((child) => {
                child.hidden = true;
            });
        }
    });
    const tooltipContainer = document.querySelector('.tooltip-popup-container');
    if (tooltipContainer) {
        if (index == 1 || index == 2) {
            tooltipContainer.classList.add('display_none_class');
        } else {
            tooltipContainer.classList.remove('display_none_class');
        }
    }
}

function scrollToSection(index) {
    let currentSection = null;
    if (index == 0) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (index == 1) {
        currentSection = document.querySelector('.message-box');
    } else {
        currentSection = document.querySelector('.action_buttons_div');
    }
    if (currentSection) currentSection.scrollIntoView({ behavior: 'smooth' });
}

function startNavigationTour() {
    let index = 0;
    const backgroundOverlay = document.querySelector('.background_overlay');
    if (backgroundOverlay) {
        backgroundOverlay.hidden = false;
        const navigationButtons = document.querySelector('.how_to_use_buttons');
        const prev_button = document.querySelector('.how_to_use_left');
        const next_button = document.querySelector('.how_to_use_right');
        if (navigationButtons) {
            navigationButtons.style.display = 'flex';
            navigationButtons.hidden = false;
            prev_button.style.display = 'none';
            prev_button.hidden = true;
        }
        scrollToSection(index);
        highlightIndexedSection(index);
        prev_button.addEventListener('click', () => {
            index--;
            index = Math.max(Number(index), 0);
            highlightIndexedSection(index);
            if (index == 0) {
                prev_button.hidden = true;
                prev_button.style.display = 'none';
            }
            next_button.innerHTML = '<span>Next</span><img src="logo/arrow-right.png" alt="left_arrow">';
            scrollToSection(index);
        });
        next_button.addEventListener('click', () => {
            index++;
            if (index > 2) {
                index = 0;
                backgroundOverlay.hidden = true;
                navigationButtons.hidden = true;
                navigationButtons.style.display = 'none';
                next_button.innerHTML = '<span>Next</span><img src="logo/arrow-right.png" alt="left_arrow">';
                highlightIndexedSection(3);
                scrollToSection(0);
                return;
            }
            highlightIndexedSection(index);
            if (index == 2) {
                next_button.innerHTML = '<span>Close</span>';
            }
            prev_button.hidden = false;
            prev_button.style.display = 'flex';
            scrollToSection(index);
        });
    }
}

function startNavigationTourOnFirstVisit() {
    const navigationInterval = setInterval(async() => {
        const numbersBox = document.querySelector('.numbers-box');
        translatedSendObj= await fetchTranslations(sendObj);
        if (numbersBox) {
            clearInterval(navigationInterval);
            chrome.storage.local.get(['no_of_visit'], function (res) {
                if (res.no_of_visit == 1) {
                    // startNavigationTour();
                    driver(translatedSendObj).drive()
                    removeHighlightTour()
                }
            });
        }
    }, 500);
}

startNavigationTourOnFirstVisit();

function getCurrentTimein24HourFormat() {
    let now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    hours = hours < 10 ? '0' + hours : hours;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${minutes}`;
}

function getCurrentDate() {
    let now = new Date();
    let year = now.getFullYear();
    let month = now.getMonth() + 1; // Months are 0-based in JavaScript
    let day = now.getDate();
    month = month < 10 ? '0' + month : month;
    day = day < 10 ? '0' + day : day;
    return `${year}-${month}-${day}`;
}

function showScheduleExpiredPopup(campaign, index) {
    const container = document.querySelector('.schedule_expired_popup_container');
    if(container){
        document.body.removeChild(container);
    }
    const schedulePopupContainer = document.createElement('div');
    schedulePopupContainer.className = 'schedule_expired_popup_container';
    schedulePopupContainer.innerHTML =
    `<div class="schedule_popup_title">
    <img src="logo/clock.png" alt="" />
    <p>Reminder: Scheduled campaign not sent</p>
    </div>
    <div class="schedule_popup_content">
    <p>Your campaign scheduled at <span class="schedule_date_time">${formatScheduleDate(campaign.schedule_date)} ${convertTo12Hour(campaign.schedule_time)}</span> <br /> is not send.</p>
    <div class="schedule_popup_buttons_container">
                <button id="send_schedule_btn" class="CtaBtn" style="background:#fff; color:#009a88; border:2px solid #009a88">Send now</button>
                <button id="reschedule_btn" class="CtaBtn" style="background:#009a88; color:#fff; border: 2px solid #fff">Reschedule</button>
                <button id="delete_schedule_btn" class="CtaBtn" style="color:red; border:2px solid red; background:#fff">Delete</button>
            </div>
        </div>
        <div class="popup-footer">
            <div class="popup-footer-container">
                <div class="logo-div">
                    <img class="logo-icon" src="logo/logo-img.png" alt="Logo"/>
                    <img class="logo-text" src="logo/logo-text.png" alt="Logo Text"/>
                </div>
                <div class="contact-div">
                    <p>Any questions?</p>
                    <a class="handle_help_btn CtaBtn">Contact Support</a>
                </div>
            </div>
        </div>
        `;

    document.body.appendChild(schedulePopupContainer);
    const backgroundOverlay = document.querySelector('.background_overlay');
    if(backgroundOverlay){
        backgroundOverlay.hidden = false;
    }
    
    const sendScheduleBtn = document.getElementById('send_schedule_btn');
    const rescheduleBtn = document.getElementById('reschedule_btn');    
    const deleteScheduleBtn = document.getElementById('delete_schedule_btn');

    sendScheduleBtn.addEventListener('click', () => {
        sendMessageToBackground(campaign);
        window.close();
    });

    rescheduleBtn.addEventListener('click', () => {
        chrome.storage.local.get(['scheduled_campaigns'], function(res){
            const scheduledCampaigns = res.scheduled_campaigns || [];
            scheduledCampaigns.splice(index, 1);
            chrome.storage.local.set({'scheduled_campaigns': scheduledCampaigns});   
            backgroundOverlay.hidden = true;
            document.body.removeChild(schedulePopupContainer);
            const schedule_checkbox= document.getElementById('schedule_checkbox');
            if(schedule_checkbox){
                schedule_checkbox.checked= true;
                document.getElementById("schedule").hidden=false;
                document.getElementById("sender").hidden=true;
                document.querySelector('#schedule_day_div').style.display= 'flex';
                document.querySelector('#schedule_time_div').style.display= 'flex';
            }         
        });
    });

    deleteScheduleBtn.addEventListener('click', () => {
        chrome.storage.local.get(['scheduled_campaigns'], function(res){
            const scheduledCampaigns = res.scheduled_campaigns || [];
            scheduledCampaigns.splice(index, 1);
            chrome.storage.local.set({'scheduled_campaigns': scheduledCampaigns});            
            backgroundOverlay.hidden = true;
            document.body.removeChild(schedulePopupContainer);
        });
    });
}

// async function renderSelectedItems(nameFiltersString = '') {
//     let isFirst = true;
//     const items = messageToggleSwitchValue === 'groups' ? allGroups : allContacts;

//     const BATCH_SIZE = 100;
//     let currentBatch = 0;

//     const displayBoxClass = '.groups_display_box';
//     const displayBox = document.querySelector(displayBoxClass);

//     let selectedArray = messageToggleSwitchValue === 'groups' ? groups_selected : contacts_selected;

//     if (nameFiltersString.trim() !== '') {
//         selectedArray = [];
//         displayBox.innerHTML = '';
//     } else if (selectedArray.length <= 1 || isFirst) {
//         displayBox.innerHTML = '';
//     }

//     const nameFilters = nameFiltersString.split(',').map(name => name.trim().toLowerCase());

//     const filteredItems = nameFilters.length > 0
//         ? items.filter(item => nameFilters.some(filter => item.name.toLowerCase() === filter))
//         : [];

//     filteredItems.forEach(item => {
//         if (!selectedArray.includes(item.id._serialized)) {
//             selectedArray.push(item.id._serialized);
//         }
//     });

//     messageToggleSwitchValue === "groups" ? groups_selected = selectedArray : contacts_selected = selectedArray

//     function renderBatch() {
//         const fragment = document.createDocumentFragment();

//         for (let i = currentBatch * BATCH_SIZE; i < Math.min(selectedArray.length, (currentBatch + 1) * BATCH_SIZE); i++) {
//             const itemId = selectedArray[i];
//             const item = items.find(item => item.id._serialized === itemId);

//             if (!item) continue;

//             const span = document.createElement('span');
//             span.className = 'group_tag CtaBtn';
//             span.id = item.objId;
//             span.setAttribute('data-id-field', item.id._serialized);

//             span.innerHTML = `
//                 <span class="group">${item.name}</span>
//                 <img class="delete_group_tag" src="./logo/closeBtn.png" title="Remove ${messageToggleSwitchValue === 'groups' ? 'Group' : 'Contact'}">
//             `;

//             fragment.appendChild(span);
//         }

//         displayBox.appendChild(fragment);
//         currentBatch++;

//         if (currentBatch * BATCH_SIZE < selectedArray.length) {
//             requestAnimationFrame(renderBatch);
//         }
//     }

//     requestAnimationFrame(renderBatch);

//     chrome.storage.local.set({
//         [messageToggleSwitchValue === 'groups' ? 'groups_selected' : 'contacts_selected']: selectedArray
//     });

//     if (nameFilters.length > 0) handleDeleteBin();
// }


// function updateGroupBoxDisplay() {
//     const boxLabel = document.querySelector("#box_label");
//     const template_btn = document.querySelector("#campaign-save-icon-items");
//     const displayBox = document.querySelector(".groups_display_box");
//     const search = document.querySelector(".search_group_input");
//     const boxName = document.querySelector(".selector-box-name");

//     boxLabel.innerHTML = `Select ${messageToggleSwitchValue} to message`;
//     template_btn.setAttribute("title",`Save ${String(messageToggleSwitchValue).charAt(0).toUpperCase() + String(messageToggleSwitchValue).slice(1)}`)
//     boxName.innerHTML=`Campaign ${String(messageToggleSwitchValue).charAt(0).toUpperCase() + String(messageToggleSwitchValue).slice(1)}`
//     search.placeholder = `Search ${messageToggleSwitchValue} by name`;
//     displayBox.innerHTML = `<p style="color:gray;font-size:13px;margin:0px;">Select ${messageToggleSwitchValue} from the dropdown . . .</p>`;

//     if ((messageToggleSwitchValue === "groups" && groups_selected.length > 0) || (messageToggleSwitchValue === "contacts" && contacts_selected.length > 0)) {
//        renderSelectedItems();
//     }
//     handleDeleteBin()
//     // handleTemplateSaveBtn()
//     // handleCampaignBox()
// }

async function renderSelectedItems(nameFiltersString = '') {
    let isFirst = true;
    const items = getAllItems(messageToggleSwitchValue);

    const BATCH_SIZE = 100;
    let currentBatch = 0;

    const displayBoxClass = '.groups_display_box';
    const displayBox = document.querySelector(displayBoxClass);

    let selectedArray = getSelectedArray(messageToggleSwitchValue);

    if (nameFiltersString.trim() !== '') {
        selectedArray = [];
        displayBox.innerHTML = '';
    } else if (selectedArray.length <= 1 || isFirst) {
        displayBox.innerHTML = '';
    }

    const nameFilters = nameFiltersString.split(',').map(name => name.trim().toLowerCase());

    const filteredItems = nameFilters.length > 0
        ? items.filter(item => nameFilters.some(filter => item.name.toLowerCase() === filter))
        : [];

    filteredItems.forEach(item => {
        if (!selectedArray.includes(item.id._serialized || item.id)) {
            selectedArray.push(item.id._serialized || item.id);
        }
    });

    setSelectedArray(messageToggleSwitchValue, selectedArray);

    function renderBatch() {
        const fragment = document.createDocumentFragment();

        for (let i = currentBatch * BATCH_SIZE; i < Math.min(selectedArray.length, (currentBatch + 1) * BATCH_SIZE); i++) {
            const itemId = selectedArray[i];
            const item = items.find(item => (item.id._serialized || item.id) === itemId);

            if (!item) continue;

            const span = document.createElement('span');
            span.className = 'group_tag CtaBtn';
            span.id = item.objId || item.id;
            span.setAttribute('data-id-field', item.id._serialized || item.id);

            span.innerHTML = `
                <span class="group">${item.name}</span>
                <img class="delete_group_tag" src="./logo/closeBtn.png" title="Remove ${messageToggleSwitchValue}">
            `;

            fragment.appendChild(span);
        }

        displayBox.appendChild(fragment);
        currentBatch++;

        if (currentBatch * BATCH_SIZE < selectedArray.length) {
            requestAnimationFrame(renderBatch);
        }
    }

    requestAnimationFrame(renderBatch);

    chrome.storage.local.set({ [getStorageKey(messageToggleSwitchValue)]: selectedArray });

    if (nameFilters.length > 0) handleDeleteBin();
}

function updateGroupBoxDisplay() {
    const boxLabel = document.querySelector("#box_label");
    const template_btn = document.querySelector("#campaign-save-icon-items");
    const displayBox = document.querySelector(".groups_display_box");
    const search = document.querySelector(".search_group_input");
    const boxName = document.querySelector(".selector-box-name");

    boxLabel.innerHTML = `Select ${messageToggleSwitchValue === "lists" ? "favourite" : messageToggleSwitchValue} to message`;
    template_btn.setAttribute("title", `Save ${capitalize(messageToggleSwitchValue === "lists" ? "favourite" : messageToggleSwitchValue)}`);
    boxName.innerHTML = `Saved ${capitalize(messageToggleSwitchValue === "lists" ? "favourite" : messageToggleSwitchValue)}`;
    search.placeholder = `Search ${messageToggleSwitchValue === "lists" ? "favourite" : messageToggleSwitchValue} by name`;
    displayBox.innerHTML = `<p style="color:gray;font-size:13px;margin:0px;">Select ${messageToggleSwitchValue === "lists" ? "favourite" : messageToggleSwitchValue} from the dropdown . . .</p>`;

    if (getSelectedArray(messageToggleSwitchValue).length > 0) {
        renderSelectedItems();
    }
    handleDeleteBin();
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function toggleSendMessageToInput(selectedValue) {
    messageToggleSwitchValue = selectedValue;

    chrome.storage.local.set({ 'send_messages_to': messageToggleSwitchValue });


    if (messageToggleSwitchValue === 'numbers') {
        document.querySelector('.numbers-box').style.display = 'revert';
        document.querySelector('.groups_box').style.display = 'none';
        if(csv_data && csv_data.length>0)
            document.querySelector('.customize_container').style.display = 'flex';
    } else {
        document.querySelector('.numbers-box').style.display = 'none';
        document.querySelector('.groups_box').style.display = 'flex';
        document.querySelector('.customize_container').style.display = 'none';
        updateGroupBoxDisplay();
    }
}

function getTodayDate() {
    let today = new Date();
    let dd = String(today.getDate()).padStart(2, '0');
    let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    let yyyy = today.getFullYear();

    return yyyy + '-' + mm + '-' + dd;
}

function dateDiffInDays(date1, date2) {
    const [year1, month1, day1] = date1.split('-').map(Number);
    const [year2, month2, day2] = date2.split('-').map(Number);
    const d1 = new Date(year1, month1 - 1, day1);
    const d2 = new Date(year2, month2 - 1, day2);
    const diffTime = Math.abs(d2 - d1);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function formatToIsoDate(date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}-${month}-${day}`;
}

function convertCSVtoExcel(csvFile) {
    return new Promise((resolve, reject) => {
        Papa.parse(csvFile, {
            complete: function (result) {
                try {
                    const worksheet = XLSX.utils.json_to_sheet(result.data);
                    const workbook = XLSX.utils.book_new();
                    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet 1');
                    const parsedData = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: true });
                    resolve(parsedData);
                } catch (error) {
                    reject(error);
                }
            },
            header: true,
            error: function (error) {
                reject(error);
            }
        });
    });
}

// disable number and slider timegap input when random delay enabled
function disableNumberTimeGapInput(type = "random") {
    const sliderTimeGapSec = document.querySelector("#slider_time_gap_sec");
    const numberTimeInput = document.querySelector("#time_gap_sec");
    const randomLabelText = document.querySelector("#random_label_text");
    const shouldDisable = (type == "sec") ? true : false;

    if (sliderTimeGapSec)
        sliderTimeGapSec.disabled = shouldDisable;
    if (numberTimeInput)
        numberTimeInput.disabled = shouldDisable;
    if (randomLabelText)
        randomLabelText.classList.toggle("text_color_gray", !shouldDisable);
}

const tours = [
    { id: "use" },
    { id: "attachments" },
    { id: "group" },
    { id: "contact" },
    { id: "customize" },
    { id: "unsaved" }
];

function isFiveDaysPassed(lastDate, currentDate) {
    const last = new Date(lastDate);
    const current = new Date(currentDate);
    const differenceInTime = current - last;
    const differenceInDays = differenceInTime / (1000 * 60 * 60 * 24);
    return differenceInDays >= 5;
}

function getNextTour(callback) {
    chrome.storage.local.get(["tourState"], (result) => {
      const tourState = result.tourState || {
        currentTourIndex: 0,
        lastShownDate: null,
      };
  
      const currentDate = new Date().toISOString().split("T")[0];
  
      if (!tourState.lastShownDate || isFiveDaysPassed(tourState.lastShownDate, currentDate)) {
        const currentTour = tours[tourState.currentTourIndex];
        tourState.currentTourIndex = (tourState.currentTourIndex + 1) % tours.length;
        tourState.lastShownDate = currentDate;
  
        chrome.storage.local.set({ tourState }, () => {
          callback(currentTour, tourState.currentTourIndex - 1);
        });
      } else {
        chrome.storage.local.set({ tourState }, () => {
          callback(null);
        });
      }
    });
}
    
function highlightTour(tour,index) {
    let classes = "advance_options_container";
    let toursChild = Array.from(document.getElementById("tours").children);
    isTourRunning=true;
    document.getElementsByClassName(classes)[0].classList.add("blur_section");
    index > 2 || index===-1 ? document.getElementsByClassName("more-btn")[0].click() : ""
    toursChild.forEach((tourChild) => {
    tourChild.classList.contains(tour.id)
        ? tourChild.classList.add("not_blur_child")
            : tourChild.classList.add("blur_section");
    });
}

function removeHighlightTour(){
    if(isTourRunning){
        let classes = "advance_options_container";
        let toursChild = Array.from(document.getElementById("tours").children);
        document.getElementsByClassName(classes)[0].classList.remove("blur_section");
        toursChild.forEach((tourChild) => {
            tourChild.classList.contains("not_blur_child")
                ? tourChild.classList.remove("not_blur_child")
                    : tourChild.classList.remove("blur_section");
        });
        isTourRunning=false;
    }
}

function showTooltip({elementParentClass, text, positionTop, positionBottom, positionLeft, positionRight}){
    const parentElement = document.querySelector(elementParentClass);
    const tooltip = document.createElement("div");
    tooltip.className = "tooltip_main_container";
    if(positionTop)
        tooltip.style.top = positionTop;
    if(positionBottom)
        tooltip.style.bottom = positionBottom ;
    if(positionLeft)
        tooltip.style.left = positionLeft;
    if(positionRight)
        tooltip.style.right = positionRight;
    tooltip.innerHTML = `
        <div>
            ${text}
        </div>
        <div class="tooltip_arrow"></div>
    `;
    parentElement.appendChild(tooltip);
}

function removeTooltip(){
    const tooltip = document.querySelector(".tooltip_main_container");
    if(tooltip){
        tooltip.remove();
    }
}

function handleShowTooltip(){
    const elements = [
        {
            query: ".attach_symbol",
            hoverElement: "#add-attachments",
            text: "Add attachment",
            bottom: "-30px",
        },
        {
            query: ".template-box",
            hoverElement: "#template-save-icon",
            text: "Save template",
            bottom: "-30px",
        },
        {
            query: ".campaign-box",
            hoverElement: "#campaign-save-icon",
            text: "Save numbers",
            bottom: "-30px",
        },
        {
            query: ".upload_excel_box",
            hoverElement: ".upload_excel_box",
            text: "upload excel",
            bottom: "-35px",
        },
        {
            query: "#download_template",
            hoverElement: "#download_template",
            text: "Download template excel",
            bottom: "-35px",
            left: "20px",
        },
    ];
    for (let element of elements) {
        const parentElement = document.querySelector(element.query);
        const hoverElement = document.querySelector(element.hoverElement);
        if(parentElement && hoverElement){
            hoverElement.addEventListener("mouseover", () => {
                showTooltip({
                    elementParentClass: element.query,
                    text: element.text,
                    positionTop: element.top,
                    positionLeft: element.left,
                    positionRight: element.right,
                    positionBottom: element.bottom,
                });
            });
            hoverElement.addEventListener("mouseout", () => {
                removeTooltip();
            });
        }
    }
}