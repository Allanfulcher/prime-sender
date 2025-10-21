var close_img_src = chrome.runtime.getURL("logo/closeBtn.png");
var free_trial_src = chrome.runtime.getURL("logo/free-trial.png");
var advance_promo_src = chrome.runtime.getURL("logo/advance_promo.png");
var success_gif = chrome.runtime.getURL("logo/success.gif");
var recommend_tick = chrome.runtime.getURL("logo/recommend-tickmark.png");
var export_chat_contacts_img_src = chrome.runtime.getURL("logo/export-unsaved-contacts.png");
var export_img_src = chrome.runtime.getURL("logo/export.png");
var export_contacts_text_src = chrome.runtime.getURL("logo/export-contact.svg");
var email_icon_src = chrome.runtime.getURL("logo/email.png");
var error_icon_src = chrome.runtime.getURL("logo/error.png");
var help_icon_src = chrome.runtime.getURL("logo/help.png")
var read_icon_src = chrome.runtime.getURL("logo/read.png");
var wall_clock_white_icon = chrome.runtime.getURL("logo/wall-clock-white.png");
var smile_icon = chrome.runtime.getURL("logo/smile.png");
var logo_img = chrome.runtime.getURL("logo/logo-img.png");
var large_logo_img = chrome.runtime.getURL("logo/large.png");
var medium_logo_img = chrome.runtime.getURL("logo/medium.png");
var logo_text = chrome.runtime.getURL("logo/logo-text.png");
var logo_text_light = chrome.runtime.getURL("logo/logo-text-light.png");
var arrow_left = chrome.runtime.getURL("logo/arrow-left.png");
var arrow_right = chrome.runtime.getURL("logo/arrow-right.png");
var bulb_icon = chrome.runtime.getURL("logo/lightbulb.png");
var how_to_use1 = chrome.runtime.getURL("logo/how-to-use-1.gif");
var how_to_use2 = chrome.runtime.getURL("logo/how-to-use-2.gif");
var how_to_use3 = chrome.runtime.getURL("logo/how-to-use-3.gif");
var man_thinking = chrome.runtime.getURL("logo/man-thinking.png");
var cross_icon_src = chrome.runtime.getURL("logo/close-1.png");
var check_icon_src = chrome.runtime.getURL("logo/check-mark.png");
var eye_visible = chrome.runtime.getURL("logo/eye-visible.png");
var eye_hidden = chrome.runtime.getURL("logo/eye-hidden.png");
var pause_icon_src = chrome.runtime.getURL("logo/pause_logo.png");
var alarm_clock = chrome.runtime.getURL("logo/alarm_clock.png");
var yellow_star = chrome.runtime.getURL("logo/yellow_star.png");
var yellow_star2 = chrome.runtime.getURL("logo/yellow_star2.png");
var white_star = chrome.runtime.getURL("logo/white_star.png");
var multiple_users_icon = chrome.runtime.getURL("logo/multiple-users-white.png"); 
var multiple_users = chrome.runtime.getURL("logo/multiple-users-silhouette.png"); 
var delete_icon_src = chrome.runtime.getURL("logo/delete-icon.png");
var edit_icon_src = chrome.runtime.getURL("logo/edit_icon.png");   
var down_arrow_src = chrome.runtime.getURL("logo/down-arrow.png");
var download_icon = chrome.runtime.getURL("logo/download.png");
var drag_icon_src = chrome.runtime.getURL("logo/drag_icon.png");
var attachment_icon = chrome.runtime.getURL("logo/attach_symbol.png")
var confetti_gif = chrome.runtime.getURL("logo/confetti.gif")
var hourglass_gif = chrome.runtime.getURL("logo/hourglass.gif")
var new_img = chrome.runtime.getURL("logo/new.png");
var how_to_use1 = chrome.runtime.getURL("logo/how_to_use1.gif");
var renewPlan = chrome.runtime.getURL("logo/refresh.png");
var upgradePlan = chrome.runtime.getURL("logo/signal-status.png");
var upgradePlanBasic = chrome.runtime.getURL("logo/signal-basic.png");
var money_investment = chrome.runtime.getURL("logo/money-investment.png");
var stopwatch_brown = chrome.runtime.getURL("logo/stopwatch_brown.png");
var multiple_users_brown = chrome.runtime.getURL("logo/multiple_users_brown.png");
var mult_user = chrome.runtime.getURL("logo/mult_user.png");

let link = document.createElement('link');
link.rel = 'stylesheet';
link.href = "https://fonts.googleapis.com/css2?family=Palanquin+Dark:wght@400;500;700&family=PT+Sans+Caption&family=Reem+Kufi+Ink&display=swap";
document.head.appendChild(link);

let my_number = null, my_email = null, my_name = null, my_account_type = null;

let my_name_email_pushed = false, my_name_fetched = false, my_email_fetched = false, trial_popups_shown = false;

let logged_in_user = null, plan_type = 'Expired', last_plan_type = "Basic", plan_duration = "", mult_acc_numbers = [];

let expiry_date = null;

var rows = [], notifications_hash = {}, stop = false, pause= false, groupIdToName= {},contactIdToName={};

let isProfile = false;
let totalConvertedSize = 0; // Track total converted data

var messages = ['Hello! how can we help you?', 'Hello!', 'Thank you for using service!' ], reload_quick_reply_div = false,imageData;

var location_info = { name: 'international', name_code: "US", currency: "USD", default: true };

var cancelDelay, showReviewPopup = false;
const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000; // 3 days in milliseconds
const STORAGE_KEY = 'edit_button_first_seen_time';
const CLICKED_KEY = 'edit_button_clicked';
let isOldFlow = false;

var init_store_type = null, whatsapp_version = null, extension_version = chrome.runtime.getManifest().version;

// setting premium usage object in the local
let premiumUsageObject= {
    lastDate: new Date().getDate(),
    lastMonth: new Date().getMonth(),
    attachment: false,
    customisation: false, // feature where???
    groupContactExport: false,
    quickReplies: false,
    caption: false,
    stop: false,
    timeGap: false,
    batching: false
}


/*
 * Closes all open popups before showing a new one
 * returns True if popups were closed, false if no popups were open
 */
function closeAllPopups() {
    let closed = false;
    const popups = document.querySelectorAll('.prime_content_popup');
    if (popups.length > 0) {
        popups.forEach(popup => {
            if (popup.parentNode) {
                popup.parentNode.removeChild(popup);
                closed = true;
            }
            if (popup.classList.contains("edit_quick_reply_popup")) {
                removeAppBackdrop();
            }
        });
    }
    return closed;
}

if(isAdvanceFeatureAvailable() || isExpired()){
    premiumUsageObject= {...premiumUsageObject, multipleAttachment: false, schedule: false };
}

function setPremiumUsageObject(){
    chrome.storage.local.get(['premiumUsageObject'], function(result){
        if(result.premiumUsageObject!==undefined){
            const day= result.premiumUsageObject.lastDate;
            const presentDay= new Date().getDate();
            let diffInDays;
            if(presentDay>=day){
                diffInDays= presentDay-day;
            }
            else{
                diffInDays= (30-day)+presentDay;
            }
            if(diffInDays>=14){
                chrome.storage.local.set({'premiumUsageObject': premiumUsageObject});
            }
        }
        else{
            chrome.storage.local.set({'premiumUsageObject': premiumUsageObject});
        }
    })
}
setPremiumUsageObject();

// For injecting api js
(function addInject() {
    let jsPath = '/js/inject.js';
    let script_element = document.createElement('script');
    script_element.setAttribute('type', 'text/javascript');
    script_element.setAttribute('id', 'inject');
    script_element.src = chrome.runtime.getURL(jsPath);
    script_element.onload = function () {
        this.parentNode.removeChild(this);
    };
    document.head.appendChild(script_element);
})();

// InjectJS Message Listener 
window.addEventListener("message", injectMessageListner, false);

function injectMessageListner(event) {
    if (event.source != window || !event.data.type)
        return;

    let message_type = event.data.type;
    let message_payload = event.data.payload;

    // Handle error and success
    if (message_payload) {
        if (message_payload.error) {
            trackError(message_type, message_payload.error);
        } else if (message_type.includes('send')) {
            trackSuccess(message_type + "_success");
        }
    }

    // Handle message type
    switch (message_type) {
        case "get_init_store_type":
            init_store_type = localStorage.getItem('prime-sender::init_store_type');
            if (!init_store_type || init_store_type != message_payload) {
                init_store_type = message_payload;
                localStorage.setItem('prime-sender::init_store_type', init_store_type);
                trackSystemEvent("init_store_type", init_store_type);
                reload_my_number();
            }
            break;

        case "get_whatsapp_version":
            whatsapp_version = localStorage.getItem('prime-sender::whatsapp-version');
            if (!whatsapp_version || whatsapp_version != message_payload) {
                whatsapp_version = message_payload;
                localStorage.setItem('prime-sender::whatsapp-version', whatsapp_version);
                trackSystemEvent("whatsapp_version", whatsapp_version);
            }
            break;
        
        case "get_all_groups":
            setGroupDataToLocalStorage(message_payload);
            break;

        case "get_all_contacts":
            setContactDataToLocalStorage(message_payload);
            break;

        case "get_all_labels":
            setLabelDataToLocalStorage(message_payload)
            break;
        
        case "get_all_lists":
            setListDataToLocalStorage(message_payload)
            break;
        
        // Handle send_message responses
        case "send_message_to_number":
            resolveSendMessageToNumber(message_payload);
            break;
        case "send_message_to_number_new_error":
            rejectSendMessageToNumber(message_payload);
            break;
        
        case "send_message_to_group":
        case "send_message_to_group_error":
            resolveSendMessageToGroup(message_payload);
            break;

        // Handle send_attachments responses
        case "send_attachments_to_number":
        case "send_attachments_to_number_error":
            resolveSendAttachmentsToNumber(message_payload);
            break;
        
        case "send_attachments_to_group":
        case "send_attachments_to_grpup_error":
            resolveSendAttachmentsToGroup(message_payload);
            break;
        
        default:
            break;
    }
}

function download_group_contacts() {
    let conv_header = getDocumentElement('conversation_header');
    if (!conv_header) return;
    
    let conv_msg_div = getDocumentElement('conversation_message_div');
    if(!conv_msg_div || !conv_msg_div.dataset['id'].includes('@g.us')) return;
    let curr_chat_id = conv_msg_div.dataset['id'];

    let group_id = curr_chat_id.split('_')[1];
    let download_group_btn = document.createElement("div");

    let export_contacts_text = document.createElement("span");
    export_contacts_text.classList.add('export_contacts_text');
    let export_contacts_text_class = "";
    let groupTitleElement = getDocumentElement('conversation_title_div');
    let groupTitle = groupTitleElement.innerText;

    if(document.body.classList.contains('dark')){
        export_contacts_text_class = "export_gif_bright";
    }

    export_contacts_text.innerHTML =` <img class="export_gif ${export_contacts_text_class}" src=${export_contacts_text_src} />`;

    download_group_btn.id = "download_group_btn";
    download_group_btn.className = "CtaBtn shimmer"
    download_group_btn.innerHTML = `<img src=${export_img_src} />`;
    download_group_btn.appendChild(export_contacts_text);

    chrome.storage.local.get(['countOfExportUsed','lastDayExportUsed','groupDataForShimmer'], function(result) {
        let today = new Date().toDateString();
        let countOfExportUsed = result.countOfExportUsed || 0;
        let lastDayExportUsed = result.lastDayExportUsed || "";
        let groupDataForShimmer = result.groupDataForShimmer || [{}];

        if(today!==lastDayExportUsed){
            lastDayExportUsed = today;
            countOfExportUsed++;
            chrome.storage.local.set({'countOfExportUsed':countOfExportUsed,'lastDayExportUsed':lastDayExportUsed});
        }
        
        if(countOfExportUsed <= 5){
            let groupIndex = groupDataForShimmer.findIndex((group) => group.groupName === groupTitle);
            if (groupIndex !== -1) {
                if (groupDataForShimmer[groupIndex].lastShimmerDay !== today && groupDataForShimmer[groupIndex].shimmerCount <= 5) {
                    groupDataForShimmer[groupIndex].lastShimmerDay = today;
                    groupDataForShimmer[groupIndex].shimmerCount = groupDataForShimmer[groupIndex].shimmerCount + 1;
                    chrome.storage.local.set({'groupDataForShimmer': groupDataForShimmer})
                } else {
                    download_group_btn.classList.remove('shimmer');
                    export_contacts_text.innerHTML = `Export Contacts`;
                }
            }else{
                groupDataForShimmer.push({ groupName: groupTitle, lastShimmerDay: today, shimmerCount: 1 });
                chrome.storage.local.set({'groupDataForShimmer': groupDataForShimmer})
            }
            setTimeout(() => {
                download_group_btn.classList.remove('shimmer');
                export_contacts_text.innerHTML = `Export Contacts`;
            }, 5000);
        }else{
            download_group_btn.classList.remove('shimmer');
            export_contacts_text.innerHTML = `Export Contacts`;
        }
    });  

    conv_header.insertBefore(download_group_btn, conv_header.childNodes[2]);
    let groupTitleParent = groupTitleElement?.parentElement?.parentElement;
    if (groupTitleElement) {
        groupTitleParent.style.overflowX = 'hidden';
    }

    download_group_btn.addEventListener('click', function () {
        if(isPremiumFeatureAvailable()) {
            window.dispatchEvent(new CustomEvent("PRIMES::export-group", {
                detail: {
                    "groupId": group_id
                }
            }));
            trackButtonClick('download_group_contacts_premium');
        } else {
            premium_reminder('download_group_contacts', 'Premium');
        }
        // updating premium usage for group contact export
        chrome.storage.local.get(['premiumUsageObject'], function(result){
            if(result.premiumUsageObject!==undefined){
                let updatedPremiumUsageObject = {...result.premiumUsageObject, groupContactExport: true};
                chrome.storage.local.set({'premiumUsageObject': updatedPremiumUsageObject});
            }
        });

        trackButtonClick('download_group_contacts');
    });
} 

function profile_header_buttons() {
    const profile_header = getDocumentElement('profile_header');
    if (!profile_header) return;

    const profile_header_buttons_div = document.createElement('div');
    profile_header_buttons_div.id = 'profile_header_buttons_div';
    
    const profile_header_buttons_list = profile_header.children[0];
    profile_header_buttons_list.insertBefore(profile_header_buttons_div, profile_header_buttons_list.children[0]);

    // Profile Header Buttons
    add_profile_header_btn('prime_profile', 'Profile - Prime Sender', medium_logo_img, prime_profile_popup);
    add_profile_header_btn('blur_contacts', 'Blur chat, contact name and profile picture - Prime Sender', eye_hidden, generateBlurDropdown);
    add_profile_header_btn('download_unsaved_contacts', 'Export contacts - Prime Sender', export_chat_contacts_img_src, download_unsaved_contacts);

    // Handle other 
    const new_chat_btn = getDocumentElement('new_chat_btn');
    if (new_chat_btn && !new_chat_btn.classList.contains('CtaBtn')) {
        new_chat_btn.classList.add('CtaBtn');
    }
    const new_chat_parent = getDocumentElement('new_chat_parent');
    if(new_chat_parent){
        new_chat_btn.title = "";
        handleShowTooltip({
            query: DOCUMENT_ELEMENT_SELECTORS['new_chat_parent'][0],
            text: "New chat",
            bottom: "-30px",
        });
    }
}

function add_profile_header_btn(btn_id, btn_title, btn_image = null, on_click) {
    const profile_header_buttons_div = document.querySelector('#profile_header_buttons_div');
    if (!profile_header_buttons_div) return;

    const existing_btn = document.querySelector(`#${btn_id}`);
    if (existing_btn) return;

    const btn = document.createElement('div');
    btn.id = btn_id;
    btn.classList.add('profile_header_button');
    btn.innerHTML = `<img src=${btn_image} class='${btn_id}_icon CtaBtn' alt='${btn_id}'>`;
    btn.addEventListener('click', on_click);

    profile_header_buttons_div.appendChild(btn);
    handleShowTooltip({
        query: `#${btn_id}`,
        text: btn_title,
        bottom: "-30px",
    });
}

function download_unsaved_contacts() {
    const parentDiv = document.querySelector('#profile_header_buttons_div');
    if (!parentDiv) return;

    if(document.querySelector('#export_options')) {
        parentDiv.removeChild(document.querySelector('#export_options'));
        return;
    }

    let mainDiv = document.createElement("div")
    mainDiv.id = "export_options"
    mainDiv.innerHTML = `
    <div id="saved_contacts" class="export_option"><button class="contacts_btn"><img class="contacts_img" src="${download_icon}"></button> Download saved contacts</div>
    <div id="unsaved_contacts" class="export_option"><button class="contacts_btn"><img class="contacts_img" src="${download_icon}"></button> Download chat contacts</div>    
    `

    parentDiv.append(mainDiv)
    document.getElementById("saved_contacts").addEventListener("click",()=>{
        if (isAdvanceFeatureAvailable()) {
            window.dispatchEvent(new CustomEvent("PRIMES::export-saved-contacts", { detail: { type: "Advance" } }));
            trackButtonClick("download_saved_contacts_premium");
        } else {
            window.dispatchEvent(new CustomEvent("PRIMES::export-saved-contacts", { detail: { type: "Expired" } }));
        }
        chrome.storage.local.get(['premiumUsageObject'], (result) => {
            if (result.premiumUsageObject !== undefined) {
                let updatedPremiumUsageObject = {
                    ...result.premiumUsageObject,
                    downloadSavedContacts: true,
                };
                chrome.storage.local.set({ premiumUsageObject: updatedPremiumUsageObject });
            }
        });
        mainDiv.remove()
    })

    document.getElementById("unsaved_contacts").addEventListener("click",()=>{
        if (isAdvanceFeatureAvailable()) {
            window.dispatchEvent(new CustomEvent("PRIMES::export-unsaved-contacts", { detail: { type: "Advance" } }));
            trackButtonClick("download_unsaved_contacts_premium");
        } else {
            window.dispatchEvent(new CustomEvent("PRIMES::export-unsaved-contacts", { detail: { type: "Expired" } }));
        }
        chrome.storage.local.get(['premiumUsageObject'], (result) => {
            if (result.premiumUsageObject !== undefined) {
                let updatedPremiumUsageObject = {
                    ...result.premiumUsageObject,
                    downloadUnsavedContacts: true,
                };
                chrome.storage.local.set({ premiumUsageObject: updatedPremiumUsageObject });
            }
        });
        mainDiv.remove()
    })




    trackButtonClick("download_contacts");
}

async function showBuyPremiumButtons() {
    let pricing_data;
    if(last_plan_type == 'FreeTrial' || plan_type == 'FreeTrial')
      pricing_data = PRICING_DATA["free_trial_expired"];
    else if (last_plan_type == 'AdvancePromo' || plan_type == 'AdvancePromo')
        pricing_data = PRICING_DATA["advance_promo_expired"];
    else 
      pricing_data = PRICING_DATA['premium_expired'];
    if (!pricing_data) return '';

    let country_name = getCountryNameWithSpecificPricing();
    let result = await chrome.storage.local.get(['isMultipleAccount']);
    let isMultipleAccountAvailable = result.isMultipleAccount;
    let advancePrice = pricing_data.advance_price[country_name];
    let basicPrice = pricing_data.basic_price[country_name];
    let advanceConvertedPrice = await convertPriceToLocale(advancePrice.substring(1));
    let basicConvertedPrice = await convertPriceToLocale(basicPrice.substring(1));

    let pricing_link;
    if (RUNTIME_CONFIG.useOldPricingLinks) {
        pricing_link = `${RUNTIME_CONFIG.basePricingUrl}?country=${country_name}&lastPlan=${pricing_data.lastPlan}&currentPlan=`;
    } else {
        pricing_link = 'https://buy.stripe.com/';
    }

    if (plan_type == 'FreeTrial' || (plan_type == 'Expired' && last_plan_type == 'FreeTrial')) {
        return getFreeTrialButtonHtml();
    } else if (plan_type == 'AdvancePromo' || (plan_type == 'Expired' && last_plan_type == 'AdvancePromo')) {
        return getFreeTrialButtonHtml();
    } else if(plan_type == 'Expired'){
        if(last_plan_type == 'Basic'){
            let {basicButtonHtml, advanceButtonHtml} = await getBasicPremiumExpiredButton(basicPrice, basicConvertedPrice, advancePrice, advanceConvertedPrice, pricing_link);
            return basicButtonHtml + advanceButtonHtml;
        } else if(last_plan_type == 'Advance'){
            let advanceButtonHtml = await getAdvancePremiumExpiredButton(advancePrice, advanceConvertedPrice, pricing_link);
            return advanceButtonHtml;
        }
    } else {
        let annualButtonHtml = '';
        if (plan_duration === 'Monthly') {
            const pricing_page_link = 'https://buy.stripe.com/'+PRICING_PAGE_LINK[country_name].annually[plan_type.toLowerCase()];
            annualButtonHtml = `
                <div class="buy_annual_button_section">
                    <a href="${pricing_page_link}" target="_blank" class="buy-annual-popup-btn" buttonType="${plan_type.toLowerCase()}_annual">
                        <span class="annual_button_top_span"><img src="${yellow_star}" style="width:15px;"/>Save 40% with</span>
                        <span style="font-weight:bold;">${plan_type} Annual</span>
                    </a>
                </div>`;
        }
        
        let buttonHtml =
            `<div style="width:100%;display:flex;justify-content:center;align-items:center;flex-direction:column">
                ${annualButtonHtml}
                ${!isMultipleAccountAvailable 
                    ? `<div style="width:100%;display:flex;justify-content:center;align-items:center;">
                        ${RUNTIME_CONFIG.useOldPricingLinks 
                            ? `<a href="${RUNTIME_CONFIG.basePricingUrl}multiple-account" target="_blank" style="color:#009a88;font-size:12px;text-decoration:underline;display:flex;align-items:center;"><img src="${multiple_users}" class="multiple_users" alt="">Purchase for multiple users</a>` 
                            : `<span class="show_multiple_users" style="color:#009a88;font-size:12px;text-decoration:underline;display:flex;align-items:center;cursor:pointer;"><img src="${multiple_users}" class="multiple_users" alt="">Purchase for multiple users</span>`
                        }
                    </div>` 
                    : ''}
            </div>`;
        return buttonHtml;
    }   
}

async function prime_profile_popup() {
    closeAllPopups();
    
    const parentDiv = document.querySelector('#profile_header_buttons_div');
    const notificationWrapper = document.querySelector(".notification-wrapper");
    const side_panel = getDocumentElement('side_panel');
    if (!parentDiv) return;

    if(notificationWrapper){
        side_panel.style.marginTop = "0px"
        notificationWrapper.remove();
    }

    // No longer needed as closeAllPopups will handle this
    // if(document.querySelector('#prime_profile_popup')) {
    //     parentDiv.removeChild(document.querySelector('#prime_profile_popup'));
    //     return;
    // }

    const mainDiv = document.createElement("div");
    mainDiv.id = "prime_profile_popup";
    mainDiv.classList.add("prime_profile_main", "prime_content_popup");
    mainDiv.dir = "ltr";

    const topSection = document.createElement("div");
    topSection.classList.add("prime_profile_top");
    topSection.innerHTML = `
    <div class="prime_profile_cross" id="close_prime_profile_popup">
      <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M405 136.798L375.202 107 256 226.202 136.798 107 107 136.798 226.202 256 107 375.202 136.798 405 256 285.798 375.202 405 405 375.202 285.798 256z"></path></svg>
    </div>
    <div class="prime_profile_logo">
        <div class="prime_profile_img">
            <img src="${medium_logo_img}" alt="">
        </div>
         <div class="prime_profile_text">
             <img src="${logo_text_light}" alt="">
         </div>
    </div>`;

    const bodySection = document.createElement("div");
    bodySection.classList.add("prime_profile_body");

    let bodyHtml = await new Promise((resolve) => {
        chrome.storage.local.get(['my_number', 'plan_type', 'customer_name', 'customer_email'], async function (result) {
            let bodyHtml = '';
            const order = [
                { key: 'customer_name', label: 'Name' },
                { key: 'customer_email', label: 'Email' },
                { key: 'my_number', label: 'Number' },
                { key: 'plan_type', label: 'Plan Type' },
            ];

            for (const item of order) {
                let label = item.label;
                let value = result[item.key];
                if (item.key === 'my_number' && value) {
                    value = `+${value}`;
                }
                
                // const translatedLabel = await translate(item.label);
                if(value){
                    bodyHtml += `
                    <div class="prime_rows">
                        <p class="prime_col prime_col_end"><span>${label}</span> <span>:</span></p>
                        <span class="prime_col">${value}</span>
                    </div>`;
                }
            }

            resolve(bodyHtml);
        });
    });

    const buyPremiumHtml = await showBuyPremiumButtons();
    bodyHtml += `<div class="premium_feature_block" id="buy_premium_block" style="border:none;display:flex;justify-content:center;align-items:center;gap:10px;" dir="ltr">${buyPremiumHtml}</div>`;

    bodySection.innerHTML = bodyHtml;

    if(currentLanguage==="es"){
        mainDiv.style.top="35%";
    }

    mainDiv.append(topSection);
    mainDiv.append(bodySection);

    parentDiv.appendChild(mainDiv);

    let close_popup_btn = document.getElementById("close_prime_profile_popup");
    close_popup_btn.addEventListener("click", () => {
        parentDiv.removeChild(mainDiv);
    })
}

async function generateBlurDropdown() {
    const blurBtn = document.getElementById("blur_contacts");
    const parentDiv = document.querySelector('#profile_header_buttons_div');
    const { isBlurred } = await chrome.storage.local.get("isBlurred");

    if (isBlurred) {
        await chrome.storage.local.set({ isBlurred: false });
        await toggle_blur(true);
        return;
    }

    if (!parentDiv || !blurBtn) return;

    const existingDropdown = document.querySelector('#blur_dropdown');
    if (existingDropdown) {
        existingDropdown.remove();
        return;
    }

    const mainDiv = document.createElement("div");
    mainDiv.id = "blur_dropdown";
    mainDiv.classList.add("prime_profile_main", "blur_main");
    mainDiv.dir = "ltr";

    const topSection = document.createElement("div");
    topSection.classList.add("prime_profile_top");
    topSection.innerHTML = `
        <div class="prime_profile_cross" id="close_blur_dropdown">
            <svg stroke="currentColor" fill="currentColor" stroke-width="0" 
                viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                <path d="M405 136.798L375.202 107 256 226.202 136.798 107 
                         107 136.798 226.202 256 107 375.202 136.798 405 
                         256 285.798 375.202 405 405 375.202 285.798 256z"></path>
            </svg>
        </div>
        <div class="prime_profile_logo">
            <div class="prime_profile_img blur_img">
                <img src="${medium_logo_img}" alt="">
            </div>
            <h1>Blur Settings</h1>
        </div>`;

    const blurOptions = [
        { key: 'blur_chat_name', label: 'Chat Name' },
        { key: 'blur_profile_pic', label: 'Profile Picture' },
        { key: 'blur_chat_messages', label: 'Chat Messages' },
    ];

    const bodySection = document.createElement("div");
    bodySection.classList.add("prime_profile_body", "blur_body");

    const storedValues = await chrome.storage.local.get(blurOptions.map(opt => opt.key));

    let html = '';
    for (const item of blurOptions) {
        const checked = storedValues[item.key] ? 'checked' : '';
        html += `
            <div class="prime_rows blur_rows">
                <p class="prime_col prime_col_end blur_end">
                    <input type="checkbox" class="blur_checkbox" id="${item.key}" ${checked}>
                </p>
                <span class="prime_col">${item.label}</span>
            </div>`;
    }
    html += `<button class="blur_btn" id="blur_btn">Blur</button>`;
    bodySection.innerHTML = html;

    bodySection.querySelectorAll('.blur_checkbox').forEach((checkbox) => {
        checkbox.addEventListener('change', () => {
            chrome.storage.local.set({ [checkbox.id]: checkbox.checked });
        });
    });

    mainDiv.append(topSection, bodySection);
    parentDiv.appendChild(mainDiv);

    document.getElementById("blur_btn").addEventListener("click", async (e) => {
        e.stopPropagation();
        await chrome.storage.local.set({ isBlurred: true });
        await toggle_blur(true);
        mainDiv.remove()
    });

    document.getElementById("close_blur_dropdown").addEventListener("click", (e) => {
        e.stopPropagation();
        mainDiv.remove();
    });
}

async function toggle_blur(click_event) {
    try {
        const blurContactsBtn = document.getElementById('blur_contacts');
        const { isBlurred } = await chrome.storage.local.get("isBlurred");
        const blurKeys = ['blur_chat_name', 'blur_profile_pic', 'blur_chat_messages'];
        const blurSettings = await chrome.storage.local.get(blurKeys);
   
        const blurGroups = {
            blur_chat_name: [
                getDocumentElement('conversation_header_name_div'),
                ...getDocumentElement('left_side_contacts_name', true)
            ],
            blur_profile_pic: [...getDocumentElement('contact_profile_div', true),
                ...getDocumentElement("conversation_panel_profile",true)
            ],
            blur_chat_messages: [...getDocumentElement('conversation_message_div', true),
                ...getDocumentElement("left_side_contacts_message",true),
                ...getDocumentElement('conversation_non_message_div', true)
            ],

        };

        const alwaysBlur = [
            document.querySelector('#reply_div')
        ];

        for (const [key, elements] of Object.entries(blurGroups)) {
            if (blurSettings[key]) {
                elements.forEach(el => {
                    applyOrRemoveBlur(el, 'blur', isBlurred);
                });
            }
        }

        alwaysBlur.forEach(el => {
            applyOrRemoveBlur(el, 'blur', isBlurred);
        });

        if (click_event) {
            blurContactsBtn.classList.toggle('blurred', isBlurred);
            blurContactsBtn.innerHTML = `<img class='blur_icon' src=${isBlurred ? eye_visible : eye_hidden} alt='blur-info'>`;

            if (isBlurred) {
                trackButtonClick('blur_contacts');
            }
        }
    } catch (e) {
        console.error('Error :: toggle_blur :: ', e);
    }
}

function applyOrRemoveBlur(element, className, shouldApply) {
    try {
        if (!element) 
            return;

        if (shouldApply) {
            element.classList.add(className);
        } else {
            element.classList.remove(className);
        }
    } catch (error) {
        console.log(error);
    }
}

// When user clicks the edit button
function handleEditButtonClick() {
    chrome.storage.local.get([CLICKED_KEY], (result) => {
        const clicked = result[CLICKED_KEY];
        if(!clicked){
            chrome.storage.local.set({ [CLICKED_KEY]: true });
            removeTooltip()
        }else{
            return;
        }
    })

}

function setupTooltip() {
    handleShowTooltip({
        query: "#edit_quick_reply_btn",
        text: "Now you can add attachments to your quick replies!",
        top: "-50px",
        left: "0px"
    });
}

function checkEditButtonStatus() {
    chrome.storage.local.get([STORAGE_KEY, CLICKED_KEY,"content_visits"], (result) => {
        const firstSeenTime = result[STORAGE_KEY];
        const clicked = result[CLICKED_KEY];
        const content_visits = result.content_visits
        const now = Date.now();
        let htmlString = `<img src="${new_img}" class="newImg">Edit`
        const editBtn = document.querySelector("#edit_quick_reply_btn");
        const btnCotainer = document.querySelector("#quick_reply_buttons_container");

        if (clicked && editBtn && content_visits >= 0) {
            // Already clicked, do nothing
            return;
        }

        if (!firstSeenTime && editBtn && content_visits) {
            // First time visiting, store the timestamp
            chrome.storage.local.set({ [STORAGE_KEY]: now });
            editBtn.style.padding = 0
            editBtn.innerHTML = htmlString;
            btnCotainer.style.width = '120px !important';

            setupTooltip()
        } else {
            // Check if 3 days passed
            if ((now - firstSeenTime) >= THREE_DAYS_MS && editBtn && content_visits) {
                removeTooltip()
            } else if(editBtn && content_visits) {
                const timeLeft = THREE_DAYS_MS - (now - firstSeenTime);
                setupTooltip()
                editBtn.style.padding = 0
                editBtn.innerHTML = htmlString;
                btnCotainer.style.width = '120px !important';
            }
        }
    });
}

async function quick_reply_messages() {
    let reply_div = document.getElementById("quick_reply_div");
    if (reply_div) {
        reply_div.parentNode.removeChild(reply_div);
    }

    reply_div = document.createElement("div");
    reply_div.id = 'quick_reply_div';
    const res = await new Promise(resolve =>
        chrome.storage.local.get(["content_visits", "branding_inserted"], resolve)
    );

    const shouldShowBranding = !res.branding_inserted || !res.content_visits;

    if (shouldShowBranding) {
        chrome.storage.local.set({ branding_inserted: true });
    }

    const brandingHTML = shouldShowBranding ? `
        <div class="quick_replies_branding">    
            <span id="qrb_text_1" class="text">Quick Replies by</span>
            <img src="${medium_logo_img}" class="img" />
            <span id="qrb_text_2" class="text logo">Prime Sender</span>
        </div>` : "";

    const messagesHTML = messages.map(message => {
        let text = typeof message === "object" && message !== null
            ? message.title || message.message
            : message;

        let displayText = text.length > 47 ? text.substring(0, 47) + '...' : text;
        let background = message.color || 'var(--outgoing-background)';

        return `
            <button class="reply_click message_btn CtaBtn" style="background:${background}" value="${text}">
                ${message.title ? `<img src="${attachment_icon}" class="attachment_reply"/>` : ""}
                ${displayText}
            </button>`;
    }).join("");

    const buttonsHTML = `
        <div id="quick_reply_buttons_container" class="quick_reply_container">
            <button class="CtaBtn menu_btn" id="expand_quick_reply_btn" isExpand="false" style="display: none;">
                <img src="${down_arrow_src}" />
            </button>
            <button class="CtaBtn menu_btn" id="edit_quick_reply_btn">Edit</button>
        </div>`;

    reply_div.innerHTML = `
        ${brandingHTML}
        <div id="quick_reply_messages_container" class="quick_reply_container">
            ${messagesHTML}
        </div>
        ${buttonsHTML}`;

    reply_div.addEventListener('click', (event) => {
        let message = event.target.value;
        send_quick_reply_message(message);
    });


    let footer_div = getDocumentElement('footer_div');
    if (footer_div) {
        footer_div.style.paddingTop = '36px';
        footer_div.appendChild(reply_div);

        let conversation_panel = getDocumentElement('conversation_panel');
        if (conversation_panel) {
            conversation_panel.scrollBy(0, 33);
        }

        reload_quick_reply_div = false;
    } else {
        return;
    }  

    let edit_btn = document.getElementById("edit_quick_reply_btn");
    edit_btn.addEventListener('click', (e) => {
        e.stopPropagation();
        edit_quick_reply_popup();
        addAppBackdrop();

        handleEditButtonClick()
        trackButtonClick('smart_reply_edit');
    }); 

    let expand_quick_reply_btn = document.getElementById("expand_quick_reply_btn");
    expand_quick_reply_btn.addEventListener('click', (e) => {
        e.stopPropagation();

        let isExpand = e.target.getAttribute('isExpand') === "true";
        let footer_div = getDocumentElement('footer_div')
        let quick_reply_div = document.getElementById("quick_reply_div");
        let messages_container = document.getElementById("quick_reply_messages_container");
    
        if (footer_div && quick_reply_div && messages_container) {
            if (!isExpand) {
                messages_container.style.flexWrap = 'wrap';
                footer_div.style.paddingTop = `${quick_reply_div.offsetHeight}px`;
                expand_quick_reply_btn.style.rotate = '180deg';
                trackButtonClick('smart_reply_div_expanded');
            } else {
                messages_container.style.flexWrap = 'nowrap';
                footer_div.style.paddingTop = '36px';
                expand_quick_reply_btn.style.rotate = '0deg';
            }    

            e.target.setAttribute('isExpand', (!isExpand).toString());
            // TRACK GOOGLE ANALYTICS FOR THIS NEW BUTTON
        }
    });

    // Handle Quick Replies Container Overflowing
    function handleOverflowing() {
        setTimeout(() => {
            let container = document.getElementById("quick_reply_messages_container");
            let expand_btn = document.getElementById("expand_quick_reply_btn");
            let branding_text_1 = document.getElementById("qrb_text_1");
            let branding_text_2 = document.getElementById("qrb_text_2");

            if (expand_btn) {
                if (isOverflowing(container)) {
                    if(branding_text_1 && branding_text_2){
                        branding_text_1.style.display = "none";
                        branding_text_2.style.display = "none";
                    }
                    setTimeout(() => {
                        expand_btn.style.display = isOverflowing(container) ? "block" : "none";
                    }, 20);
                } else {
                    if(branding_text_1 && branding_text_2){
                        branding_text_1.style.display = "block";
                        branding_text_2.style.display = "block";
                    }
                    expand_btn.style.display = "none";
                }
            }
        }, 20);
    }

    handleOverflowing();
    window.addEventListener('resize', () => {
        handleOverflowing();
    });

    // updating premium usage for quick replies
    let quickReplyButton= document.getElementsByClassName('reply_click')[0];
    if(quickReplyButton){
        quickReplyButton.addEventListener('click', function (){
            chrome.storage.local.get(['premiumUsageObject'], function(result){
                if(result.premiumUsageObject!==undefined){
                    let updatedPremiumUsageObject = {...result.premiumUsageObject, quickReplies: true};
                    chrome.storage.local.set({'premiumUsageObject': updatedPremiumUsageObject});
                }
            });
        })
    }
}

function isOverflowing(element) {
    return element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth;
}

async function send_quick_reply_message(message) {
    if (!message || message.trim().length == 0) return;

    let message_input_box = getDocumentElement('input_message_div');
    if (!message_input_box) {
        trackError('input_div_not_found_quick_reply');
        return;
    } 

    trackButtonClick("smart_reply_sent");
    let result = messages.find(msg => typeof msg === "object" && msg.title === message);
    if (isPremiumFeatureAvailable()) {
        trackButtonClick("smart_reply_sent_premium");
        if (result) {
            let conv_header = getDocumentElement('conversation_header');
            if (!conv_header) return;

            let conv_msg_div = getDocumentElement('conversation_message_div');
            let curr_chat_id = conv_msg_div.dataset['id'];
            
            trackSystemEvent("smart_reply_sent_attachment");
            if (!conv_msg_div || !conv_msg_div.dataset['id'].includes('@g.us')) {
                let number_id = curr_chat_id.split('_')[1];
                window.dispatchEvent(new CustomEvent("PRIMES::send-attachments", {
                    detail: {
                        number: number_id,
                        attachments: result.blob,
                        name: result.name,
                        caption: result.caption,
                        quick: true
                    }
                }));
            } else {
                let group_id = curr_chat_id.split('_')[1];
                window.dispatchEvent(new CustomEvent("PRIMES::send-attachments-to-group", {
                    detail: {
                        groupId: group_id,
                        attachments: result.blob,
                        name: result.name,
                        caption: result.caption,
                        quick: true
                    }
                }));

            }
        } else {
            trackSystemEvent("smart_reply_sent_message");
            pasteMessage(message);
            await sendMessageToNumber();
        }
    } else {
        premium_reminder('smart_reply', 'Premium');
    }
}

function pasteMessage(text) {
    const dataTransfer = new DataTransfer();
    dataTransfer.setData("text", text);
    const event = new ClipboardEvent("paste", {
        clipboardData: dataTransfer,
        bubbles: true,
    });
    
    const inputMessageBox = getDocumentElement('input_message_div');
    if (inputMessageBox) {
        inputMessageBox.dispatchEvent(event);
    } else {
        trackError('input_div_not_found_paste_message');
    }
}

function filter_quick_reply_message(message) {
    return message
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .trim();
}

function refresh_quick_replies() {
    let messages_list = document.getElementById('quick_reply_messages_list');
    if (messages_list) {
        messages_list.innerHTML = messages.map((message, index) => {
            let message_bg_color = message.color || (document.body.classList.contains('dark') ? '#005c4b' : '#d9fdd3');
            return `
                <div class="message_row drag_handle" draggable="true" index="${index}">
                    <img class="CtaBtn drag_handle" src="${drag_icon_src}" title="Reorder"/>
                    <div class="message_div drag_handle" title="Send" style="background-color: ${message_bg_color}">${message.title || message.message || message}</div>
                    <input type="color" class="color-picker" index=${index} id="color${index}" value="${message_bg_color}" title="Change Background"/>
                    <img class="CtaBtn edit_message_btn" index="${index}" src="${edit_icon_src}" title="Edit"/>
                    <img class="CtaBtn delete_message_btn" index="${index}" src="${delete_icon_src}" title="Delete"/>
                </div>
            `;
        }).join("");        
    }

    chrome.storage.local.set({ messages: messages });
    chrome.storage.local.set({ totalConvertedSize: totalConvertedSize });
    reload_quick_reply_div = true;

    // Handle Drag and Drop Listenre
    let dragged_index = null;
    document.querySelectorAll('.message_row').forEach((row) => {
        row.addEventListener('dragstart', (e) => {
            let target_element = e.target;
            let target_row = target_element.closest('.message_row');
            
            if (target_element.classList.contains('drag_handle')) {
                dragged_index = parseInt(target_row.getAttribute('index'));
                target_row.style.opacity = '0.5';
            } else {
                e.preventDefault();
            }
        });

        row.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.target.closest('.message_row').classList.add('dragged');
        });

        row.addEventListener('dragleave', (e) => {
            e.target.closest('.message_row').classList.remove('dragged');
        });

        row.addEventListener('drop', (e) => {
            e.preventDefault();
            let target_element = e.target;
            let target_row = target_element.closest('.message_row');
            let dropped_index = parseInt(target_row.getAttribute('index'));
            
            if (dragged_index !== dropped_index) {
                let moved_item = messages.splice(dragged_index, 1)[0];
                messages.splice(dropped_index, 0, moved_item);
                refresh_quick_replies();
                trackButtonClick('smart_reply_reordered');
            }
        });

        row.addEventListener('dragend', (e) => {
            e.target.closest('.message_row').classList.remove('dragged');
            e.target.closest('.message_row').style.opacity = '1';
        });
    });
}

function getFileDetails(file) {
    return new Promise((resolve, reject) => {
        if (!file) {
            reject(new Error("No file provided"));
            return;
        }

        if (file.size > 10 * 1024 * 1024) { // 10MB limit per file
            resolve("More than 10MB file size is not allowed!");
            return;
        }

        const fr = new FileReader();
        fr.readAsDataURL(file);
        fr.onload = () => {
            const base64String = fr.result;
            totalConvertedSize += base64String.length; // Track encoded data size
            if (totalConvertedSize > 50 * 1024 * 1024) { // 50MB total limit
                resolve("Upload limit reached. You can only upload up to 50MB in total.");
                return;
            }
            resolve({ name: file.name, blob: JSON.stringify(base64String) });
        };
        fr.onerror = err => reject(err);
    });
}

    // Toggle UI elements based on image selection
function toggleUI(showImageOptions) {
    document.getElementById("add_quick_img_btn_container").style.display = showImageOptions ? "flex" : "none";
    document.getElementById("add_quick_reply_btn_container").style.display = showImageOptions ? "none" : "flex";
    document.getElementById("title_input").style.display = showImageOptions ? "block" : "none";
    document.getElementById("add_quick_img_btn").style.display = showImageOptions ? "none" : "block";

    const captionField = document.getElementById("add_quick_reply_textarea");
    captionField.placeholder = showImageOptions ? "Type your caption here" : "Type your quick reply here";
    captionField.classList.toggle("title_textarea", showImageOptions);
}

// Display selected image name
function displayImageName(imageName,classRed) {
    let existingPTag = document.getElementById("image_name");
    if (!existingPTag) {
        existingPTag = document.createElement("p");
        existingPTag.className = `image_name ${classRed}`;
        existingPTag.id = "image_name";
        document.getElementById("inputs_container").append(existingPTag);
    }
    existingPTag.setAttribute("title",imageName)
    existingPTag.innerText = imageName;
}

// Reset UI elements after saving
function resetUI() {
    toggleUI(false);
    document.getElementById("image_name")?.remove();
    document.getElementById("title_input").value = "";
    document.getElementById("add_quick_reply_textarea").value = "";
}

async function handleImageSelection(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Show and hide relevant UI elements
    toggleUI(true);

    try {
        imageData = await getFileDetails(file);
        if(typeof imageData !== 'string'){
            displayImageName(imageData.name,'');
        }else{
            resetUI()
            displayImageName(imageData,"error_class")
            setTimeout(() => {
                resetUI()
            }, 2000);
        }
    } catch (error) {
        resetUI()
        console.error(error.message);
    }
}
function handleAppClick(e) {
  e.stopImmediatePropagation(); // Stop all other handlers
  e.preventDefault();           // Prevent default behavior (if any)
}

function removeAppBackdrop() {
    let app = getDocumentElement('app_div');
    if (app) {
        app.classList.remove("edit_backdrop")
        // app.removeEventListener('click', handleAppClick, true);
    }
}

function addAppBackdrop() {
    let app = getDocumentElement('app_div');
    if (app) {
        app.classList.add("edit_backdrop")
        // app.addEventListener('click', handleAppClick, true);
    }
}

function edit_quick_reply_popup() {
    closeAllPopups();
    
    let edit_popup = document.getElementById('edit_quick_reply_popup');
    if (edit_popup) {
        document.body.removeChild(edit_popup);
    }

    edit_popup = document.createElement('div');
    edit_popup.id = 'edit_quick_reply_popup';
    edit_popup.className = 'edit_quick_reply_popup trial_popup prime_content_popup';
    edit_popup.style.width = 'min(600px, 95%)';
    edit_popup.style.maxHeight = 'min(600px, 85%)';
    edit_popup.innerHTML = `
        <div class="edit_quick_reply_content trial_content">
            <span class="CtaCloseBtn popup-close-btn" id="close_edit_quick_reply_popup"><img src="${close_img_src}" /></span>

            <div class="trial_big_title">Edit / Add Quick Replies</div>
            <div id="quick_reply_messages_list" class="messages_list"></div>
            
            <div class="input_container">
                <div id="inputs_container">
                    <input type="text" id="title_input" placeholder="Name tag your quick reply here" class="title_input_container" style="display:none;" >
                    <textarea id="add_quick_reply_textarea" type="text" placeholder="Type your quick reply here"></textarea>
                    <img src="${attachment_icon}" alt="Add Attachment" id="add_quick_img_btn" class="attachment_icon tool-icon shimmer">
                </div>
                <div id="add_quick_reply_btn_container" class="btn_container">
                    <button id="add_quick_reply_btn" class="CtaBtn text_btn">Add Template</button>
                    <input type="file" id="select-image" hidden>
                </div>
                <div id="edit_quick_reply_btn_container" class="btn_container" style="display: none;">
                    <button id="save_quick_reply_btn" class="CtaBtn text_btn">Save</button>
                    <button id="cancel_quick_reply_btn" class="CtaBtn text_btn">Cancel</button>
                </div>
                <div id="add_quick_img_btn_container" class="btn_container" style="display: none;">
                    <button id="save_quick_img_btn" class="CtaBtn text_btn">Save</button>
                    <button id="cancel_quick_img_btn" class="CtaBtn text_btn">Cancel</button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(edit_popup);
    refresh_quick_replies();
    const inputImage = document.getElementById("select-image");

    // On close button click
    document.getElementById('close_edit_quick_reply_popup').addEventListener('click', () => {
        document.body.removeChild(edit_popup);
        removeAppBackdrop();
    })

    // Handle Delete, Edit, Save and Send functions
    document.getElementById('quick_reply_messages_list').addEventListener('click', (event) => {
        event.stopPropagation();

        let targetElement = event.target;
        let targetClass = event.target.classList;
        let targetIndex = parseInt(event.target.getAttribute('index'));
        
        if (targetClass.contains('delete_message_btn')) {
            // Delete quick reply message
            const [deletedItem] = messages.splice(targetIndex, 1); // Remove the file
            if (deletedItem && deletedItem.blob) {
                const byteSize = Math.ceil((deletedItem.blob.length * 3) / 4);
                totalConvertedSize -= byteSize; // Deduct from total size
            }
            refresh_quick_replies();
            trackButtonClick('smart_reply_deleted');
        } else if (targetClass.contains('edit_message_btn')) {
            // Add textarea to edit message
            if (!isNaN(targetIndex)) {
                refresh_quick_replies();
                document.querySelectorAll('.message_row')[targetIndex].classList.add('disabled');
                if(typeof messages[targetIndex] === 'object'){
                    toggleUI(true)
                    displayImageName(messages[targetIndex].name,'')
                    document.getElementById("title_input").value = messages[targetIndex].title;
                    document.getElementById("add_quick_reply_textarea").value = messages[targetIndex].caption;
                    document.getElementById('add_quick_img_btn_container').setAttribute('index', targetIndex);   
                } else {
                    document.getElementById('add_quick_reply_textarea').value = messages[targetIndex];
                    document.getElementById('add_quick_reply_btn_container').style.display = 'none';   
                    document.getElementById('edit_quick_reply_btn_container').style.display = 'flex';   
                    document.getElementById('edit_quick_reply_btn_container').setAttribute('index', targetIndex);   
                }

            }
        } else if (targetClass.contains('message_div')) {
            // Close popup and Send quick reply message
            document.body.removeChild(edit_popup);
            removeAppBackdrop();

            send_quick_reply_message(targetElement.innerText);
        }else if(targetClass.contains('color-picker')){

            targetElement.addEventListener("change", (e) => {
                let newColor = e.target.value;
                if(typeof messages[targetIndex] === 'object'){
                    messages[targetIndex].color = newColor;
                }else{
                    messages[targetIndex] = { message : messages[targetIndex], color : newColor }
                }
                refresh_quick_replies();
            }, { once: true });
            

        }
    })

    // Add quick reply message
    document.getElementById('add_quick_reply_btn').addEventListener('click', (event) => {
        event.stopPropagation();

        let new_message = document.getElementById('add_quick_reply_textarea').value;
        new_message = filter_quick_reply_message(new_message);

        if(new_message) {
            messages.push(new_message);
            refresh_quick_replies();

            document.getElementById('add_quick_reply_textarea').value = '';
            trackButtonClick('smart_reply_added');
        }
    })

    document.getElementById("add_quick_img_btn").addEventListener("click", (event) => {
        event.stopPropagation();
        inputImage.click();
        inputImage.addEventListener("change", handleImageSelection, { once: true });
    });
    
    document.getElementById("save_quick_img_btn").addEventListener("click", () => {
        const inputContent = document.getElementById("title_input");
        const captionContent = document.getElementById("add_quick_reply_textarea");
        let target_index = document.getElementById('add_quick_img_btn_container').getAttribute('index'); 
    
        if (inputContent.value.trim()) {
            if(target_index){
                messages[target_index].title = filter_quick_reply_message(inputContent.value);
                messages[target_index].caption = filter_quick_reply_message(captionContent.value);
                document.getElementById('add_quick_img_btn_container').setAttribute('index', '');
            } else {
                imageData.title = filter_quick_reply_message(inputContent.value);
                imageData.caption = filter_quick_reply_message(captionContent.value);
                messages.push(imageData);
            }
    
            refresh_quick_replies();
            resetUI();
        } else {
            inputContent.focus();
        }
    });

    document.getElementById("cancel_quick_img_btn").addEventListener("click", () => {
        resetUI()
        inputImage.value = '';
        let target_index = document.getElementById('add_quick_img_btn_container').getAttribute('index');
        if(target_index){
            document.querySelectorAll('.message_row')[target_index].classList.remove('disabled');
            document.getElementById('add_quick_img_btn_container').setAttribute('index', '');
        }
    });
        
    // Save edited quick reply message
    document.getElementById('save_quick_reply_btn').addEventListener('click', (event) => {
        event.stopPropagation();
        
        let new_message = document.getElementById('add_quick_reply_textarea').value.trim();
        let target_index = document.getElementById('edit_quick_reply_btn_container').getAttribute('index');   
        new_message = filter_quick_reply_message(new_message);

        if(new_message && target_index) {
            messages[target_index] = new_message;
            refresh_quick_replies();

            document.getElementById('add_quick_reply_textarea').value = '';
            document.getElementById('add_quick_reply_btn_container').style.display = 'flex';   
            document.getElementById('edit_quick_reply_btn_container').style.display = 'none';   
            document.getElementById('edit_quick_reply_btn_container').setAttribute('index', '');   
            trackButtonClick('smart_reply_edited');
        }
    });

    // Cancel edit quick reply message
    document.getElementById('cancel_quick_reply_btn').addEventListener('click', (event) => {
        event.stopPropagation();
        refresh_quick_replies();
        
        document.getElementById('add_quick_reply_textarea').value = '';
        document.getElementById('add_quick_reply_btn_container').style.display = 'flex';   
        document.getElementById('edit_quick_reply_btn_container').style.display = 'none';   
        document.getElementById('edit_quick_reply_btn_container').setAttribute('index', '');   
    });

    trackButtonView('edit_smart_reply_popup');
}

async function reload_my_number() {
    my_number = null;
    if (!my_number) {
        try {
            var last_wid = window.localStorage.getItem("last-wid");
            var last_wid_md = window.localStorage.getItem("last-wid-md");
            if (last_wid_md)
                my_number = window.localStorage.getItem("last-wid-md").split("@")[0].substring(1).split(":")[0];
            else if (last_wid)
                my_number = window.localStorage.getItem("last-wid").split("@")[0].substring(1);

            if (my_number) {
                console.log("my_number from local storage:", my_number);
                chrome.storage.local.set({ my_number: my_number });
            }
        } catch (e) {
            trackError('my_number_error', e);
            console.log(e);
        }
    }

    if (!my_number) {
        let result = await chrome.storage.local.get('my_number');
        my_number = result.my_number || null;
        console.log("my_number from chrome storage:", my_number);
    }

    if (!my_number) {
        trackSystemEvent('no_number', 'track');
        try {
            trackSystemEvent('no_number_local_storage', window.localStorage);
        } catch (e) {
            console.log(e)
        }
    } else {
        fetch_plan_details();
        trackSystemEvent('my_number', my_number);
    }
}

function setGroupDataToLocalStorage(data) {
    let finalGroupData = data.map((group) => {
        return {
            ...group,
            objId: 'g' + group.id._serialized.replace(/\D+/g, ""),
        }
    })
    chrome.storage.local.set({ "allGroupData": finalGroupData });

    const groupData = data;
    groupData.forEach((group) => {
        const groupid = group.id._serialized;
        if (groupid && group.name)
            groupIdToName[groupid] = group.name;
    })
}

function setContactDataToLocalStorage(data) {
    let finalContactData = data.map((contact) => {
        return {
            ...contact,
            objId: 'c' + contact.id._serialized.replace(/\D+/g, ""),
        }
    })
    chrome.storage.local.set({ "allContactData": finalContactData });

    const contactData = data;
    contactData.forEach((contact) => {
        const contact_id = contact.id._serialized;
        if (contact_id && contact.name)
            contactIdToName[contact_id] = contact.name;
        if (contact.number && contact.number === my_number){
            my_name = contact.pushname;
            my_account_type = contact.isBusiness ? "Business" : "Normal";
            chrome.storage.local.set({"my_account_type" : my_account_type});
        }
    })
    my_name_fetched = true;
}

function setLabelDataToLocalStorage(data){
    chrome.storage.local.set({ "allLabelData" : data })
}

function setListDataToLocalStorage(data){
     let finalListData = data.map((list) => {
        return {
            ...list,
            objId: list.number ? 'c'+ list.number : 'g'+ list.id.replace(/\D+/g, ""),
        }
    })
    chrome.storage.local.set({ "allListData" : finalListData })
}

async function readFileAndSaveToLocalStorage(e, localStorageName) {
    let files = e.target.files;
    let renderedFiles = [];

    let fileReadPromises = Array.from(files).map((file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = function(event) {
                const base64Data = event.target.result;
                const fileData = {
                    name: file.name,
                    type: file.type,
                    data: base64Data
                };
                renderedFiles.push(fileData);
                resolve();
            };
            reader.readAsDataURL(file);
        });
    });
    await Promise.all(fileReadPromises);
    chrome.storage.local.set({ [localStorageName]: renderedFiles });
}

async function handleAddAttachment(prevAttachmentsLength) {
    let inputElement = document.createElement('input');
    inputElement.type = "file";
    inputElement.id = "new_input_element";
    inputElement.multiple = true;
    document.body.appendChild(inputElement);
    inputElement.click();

    inputElement.addEventListener("change", async function(e) {
        let selectedFiles = inputElement.files;
        let totalFilesCount = selectedFiles.length + prevAttachmentsLength;
        trackEvent('add_attachments', selectedFiles.length);

        if(totalFilesCount > 1 && !isAdvanceFeatureAvailable()) {
            premium_reminder('multiple_attachments', 'Advance');
            inputElement.remove();
            return;
        } else {
            trackEvent('add_attachments_premium', selectedFiles.length);
        }
        
        await readFileAndSaveToLocalStorage(e, "linuxInputAttachments")
        inputElement.remove();
    });
}

function handleAddCSVInput(){
    let inputElement = document.createElement('input');
    inputElement.type = "file";
    inputElement.id = "new_csv_input_element";
    inputElement.accept = ".xls,.xlsx,.ods,.csv";
    document.body.appendChild(inputElement);
    inputElement.click();

    inputElement.addEventListener("change", async function(e){
        await readFileAndSaveToLocalStorage(e, "linuxCSVAttachment")
        inputElement.remove();
    });
}

function init() {
    messageListner();
    fetchConfigData();

    window.onload = function() {
        if(window.location.host === 'web.whatsapp.com') {
            reload_my_number();

            chrome.storage.local.get(['messages'], function (result) {
               if(result.messages)
                   messages = result.messages;
            });
            
            setInterval(() => {
                const quick_reply_div = document.getElementById("quick_reply_div");
                if (!quick_reply_div || reload_quick_reply_div) {
                    quick_reply_messages();
                    checkEditButtonStatus();
                }

                const download_group_btn = document.getElementById("download_group_btn");
                if (!download_group_btn) {
                    download_group_contacts();
                }

                const translate_div = document.getElementById("translate_div");
                if(!translate_div) {
                    translate_messages();
                }
                
                const profile_header_buttons_div = document.getElementById('profile_header_buttons_div');
                if (!profile_header_buttons_div) {
                    profile_header_buttons();
                    displayNotification("Your <b>Prime Sender Free Trial</b> is running out! Send personalized messages to your customers, friends and acquaintances now!",7,"FreeTrial",10)
                }
                
                const main_panel = getDocumentElement('main_panel');
                const side_panel = getDocumentElement('side_panel');

                if (side_panel || main_panel) {
                    toggle_blur(null); 
                }

                if (!trial_popups_shown && side_panel) {
                    trial_popups_shown = true;
                    callIfNoOtherPopups(showHowToUsePopup);
                    show_trial_popups();
                }
                
                const contacts_panel = getDocumentElement('left_side_contacts_panel');
                if (!contacts_panel) {
                    detectBanText();
                }

                if (!my_name_email_pushed && my_email_fetched && my_name_fetched) {
                    fetch_plan_details();
                }
            }, 500);

            trackSystemEvent('whatsapp_visit', my_number);
        }
        const profileHeaderInterval = setInterval(() => {
            const profile_header = getDocumentElement('profile_header');
            if(profile_header) {
                clearInterval(profileHeaderInterval);
                handleScheduleCampaigns();
                if((plan_type == 'Expired' && last_plan_type == 'AdvancePromo')|| (plan_type == 'Expired' && last_plan_type == 'FreeTrial')){
                    check_p2p()
                }
            }
        }, 100);
    };

    chrome.runtime.sendMessage({}, function(response) {
        my_email = response.email;
        my_email_fetched = true;
        trackSystemEvent('logged_mail', my_email);
    });   
       
}
init();

function getCountryNameWithSpecificPricing() {
    let { name: country_name, name_code: country_code } = location_info;
    if (Object.keys(COUNTRY_WITH_SPECIFIC_PRICING).includes(country_code)) {
        country_name = COUNTRY_WITH_SPECIFIC_PRICING[country_code];
    } else {
        country_name = 'international';
    }
    return country_name;
}

function openEmailPopup(email_message) {
    let emailAddress = "primesenderextension@gmail.com";
    let subject = encodeURIComponent("Chat support for prime sender");
    let body = encodeURIComponent(email_message);
    let mailtoLink = "mailto:" + emailAddress + "?subject=" + subject + "&body=" + body;
    window.open(mailtoLink, "_blank");
}  

function messageListner() {
    chrome.runtime.onMessage.addListener(listner);
}

function getFromStorage(key) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get([key], (result) => {
        if (chrome.runtime.lastError) {
          return reject(chrome.runtime.lastError);
        }
        resolve(result[key]);
      });
    });
}
  
function setInStorage(key, value) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.set({ [key]: value }, () => {
        if (chrome.runtime.lastError) {
          return reject(chrome.runtime.lastError);
        }
        resolve();
      });
    });
}

async function weekly_successfull_campaigns_sent(reset = false) {
    let campaignsSent = (await getFromStorage("weekly_successfull_campaigns_sent")) ?? 0;
    if (!reset) {
      campaignsSent += 1;
      await setInStorage("weekly_successfull_campaigns_sent", campaignsSent);
    } else {
      campaignsSent = 0;
      await setInStorage("weekly_successfull_campaigns_sent", 0);
    }
    return campaignsSent;
}

function listner(request, sender, sendResponse){
    if(request.type === 'number_message'){
        messenger(request.numbers, request.message, request.time_gap, request.csv_data, request.customization, request.caption_customization, request.random_delay, request.batch_size, request.batch_gap,request.caption, request.send_attachment_first, request.type, request.startIndex, request.paused_report_rows, request.paused_sent_count);
        (async () => {
            let updated = await weekly_successfull_campaigns_sent(false);
        })();
    }
    else if(request.type === 'group_message'){
        messenger(request.groups, request.message, request.time_gap, request.csv_data, request.customization, request.caption_customization, request.random_delay, request.batch_size, request.batch_gap,request.caption, request.send_attachment_first, request.type, request.startIndex, request.paused_report_rows, request.paused_sent_count);
        (async () => {
            let updated = await weekly_successfull_campaigns_sent(false);
        })();
    }
    else if(request.type === 'list_message'){
        messenger(request.lists, request.message, request.time_gap, request.csv_data, request.customization, request.caption_customization, request.random_delay, request.batch_size, request.batch_gap,request.caption, request.send_attachment_first, request.type, request.startIndex, request.paused_report_rows, request.paused_sent_count);
        (async () => {
            let updated = await weekly_successfull_campaigns_sent(false);
        })();
    }
    else if(request.type === 'show_message_count_over_popup')
        messageCountOverPopup(request.sent_count, request.total_count)
    else if(request.type === 'schedule_message')
        handleScheduleCampaigns();
    else if(request.type === 'clear_schedule_timeout')
        clearTimeout(request.timeoutId);
    else if(request.type === 'help') 
        handle_help();
    else if(request.type === 'transfer_premium')
        help(request.message);
    else if(request.type === 'show_premium_popup')
        premium_reminder(request.feature, 'Premium');
    else if(request.type === 'show_advance_popup')
        premium_reminder(request.feature, 'Advance');
    else if(request.type === 'add_attachments')
        handleAddAttachment(request.attachments_length)
    else if(request.type === 'create_csv_input')
        handleAddCSVInput();
    else if(request.type === "reload_contacts"){
        window.dispatchEvent(new CustomEvent("PRIMES::get-all-contacts"));
    }
    else if(request.type === "reload_favorites"){
        window.dispatchEvent(new CustomEvent("PRIMES::get-all-lists"));
    }
    else if(request.type === 'reload_my_number') {
        reload_my_number();
    }
    else if(request.type === 'show_pricing_popup') {
        show_pricing_popup();
    }
    else if(request.type === 'show_basic_pricing_popup') {
        show_plan_pricing_popup("basic");
    }
    else if(request.type === 'show_advance_pricing_popup') {
        show_plan_pricing_popup("advance");
    }
    else if(request.type === 'show_multiple_users_popup') {
        show_pricing_for_multiple_accounts();
    }
    else if(request.type === 'chat_link')
        chat_link();
    else if(request.type==="unsaved_contacts_demo")
        unsavedContactsDemo()
    else if(request.type === 'request_chat_premium'){
        if(isAdvance())
            help(HELP_MESSAGES.REQUEST_CHAT_SUPPORT_ADVANCE);
        else
            help(HELP_MESSAGES.REQUEST_CHAT_SUPPORT_BASIC);
    }
    else if(request.type === 'request_zoom_premium'){
        if(isAdvance())
            help(HELP_MESSAGES.REQUEST_ZOOM_SUPPORT_ADVANCE);
        else
            help(HELP_MESSAGES.REQUEST_ZOOM_SUPPORT_BASIC);
    }
    else if(request.type === 'request_call_premium'){
        if(isAdvance())
            help(HELP_MESSAGES.REQUEST_CALL_SUPPORT_ADVANCE);
        else
            help(HELP_MESSAGES.REQUEST_CALL_SUPPORT_BASIC);
    }
    else if (request.type === 'unsubscribe')
        help(HELP_MESSAGES.UNSUBSCRIBE_PLAN);
    else if (request.type === 'learn_schedule')
        help(HELP_MESSAGES.LEARN_SCHEDULE);
    else if (request.type === 'buy_premium_popup')
        show_trial_popups();
    // else if (request.type === 'show_update_reminder_popup') 
    //     updateReminderPopup();
}

function sendChromeMessage(message) {
    chrome.runtime.sendMessage(message);
}

function help(message) {
    chrome.storage.local.get(['currentLanguage', 'customer_care_number'], async (res) => {
        let help_message = message.replace(/ /gm, " ")
        let language = res.currentLanguage || 'default';
        
        if(HELP_MESSAGE_LANGUAGE_CODES.includes(language)) {
            help_message = help_message.replace("Prime Sender", "◉☰☰◉");
            help_message = await translate(help_message);
            help_message = help_message.replace("◉☰☰◉", "Prime Sender").replace(/ /gm, " ");
        }
        await openNumber(res.customer_care_number, help_message);
        await sendMessage();
    });
}

function handle_help() {
    if(isPremium()) {
        if(isAdvance())
            help(HELP_MESSAGES.REQUEST_CHAT_SUPPORT_ADVANCE);
        else
            help(HELP_MESSAGES.REQUEST_CHAT_SUPPORT_BASIC);
    }
    else {
        if(my_number && my_number.startsWith(62))
            openEmailPopup(HELP_MESSAGES.NEED_HELP_NON_PREMIUM);
        else
            help(HELP_MESSAGES.NEED_HELP_NON_PREMIUM);
    }
}

document.body.addEventListener('click', function(event) {
    if (event.target.classList.contains('handle_help_btn')) {
        handle_help();
    }
});

chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && changes.popupOpenCount) {
      const oldVal = changes.popupOpenCount.oldValue || 0;
      const newVal = changes.popupOpenCount.newValue;
      const notificationWrapper = document.querySelector(".notification-wrapper");
      const side_panel = document.getElementById("side")
  
      if (newVal > oldVal) {
        if(notificationWrapper){
            side_panel.style.marginTop = "0px"
            notificationWrapper.remove()
        }
      }
    }
});
  
 async function unsavedContactsDemo() {
    let translatedExportUnsavedContactsObj =await fetchTranslations(exportUnsavedContactsObj);
    driver(translatedExportUnsavedContactsObj).drive();
}

function getTodayDate() {
    let today = new Date();
    let dd = String(today.getDate()).padStart(2, '0');
    let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    let yyyy = today.getFullYear();

    return yyyy + '-' + mm + '-' + dd;
}

async function delay(ms) {
    if (ms == 0) return;
    
    return new Promise(resolve => {
        cancelDelay = resolve;
        setTimeout(resolve, ms)
    });
}

async function sendMessage(){
    return new Promise(resolve => {
        setTimeout(() => {
            let send_message_btn = getDocumentElement('send_message_btn');
            if(send_message_btn) {
                send_message_btn.click();
                resolve(["Yes", ""]);
            } else {
                resolve(["No", "Issue with the number"]);
            }
        }, 500);
    });
}

function download_report(){
    let s = "data:text/csv;charset=utf-8," + rows.map(e => e.join(","))
        .join("\n");
    var o = encodeURI(s),
        l = document.createElement("a");
    l.setAttribute("href", o), l.setAttribute("download", "report.csv"), document.body.appendChild(l), l.click()
}; 

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

function getTrackContext() {
    return {
        init_store_type: init_store_type,
        whatsapp_version: whatsapp_version,
        extension_version: extension_version,
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
    let context = getTrackContext();

    // Filters null and undefined values
    let combinedData = { ...location, ...context, ...data };
    let eventData = Object.fromEntries(
        Object.entries(combinedData).filter(([key, value]) => value != null || value != undefined) 
    );
    GoogleAnalytics.trackEvent(event, { label, ...eventData });
}

function convertDate(date = null){
    if(!date)
        date = new Date();
    return date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate();
}

function dateDiff(date1, date2){
    if(date1 && date2)
        return Math.ceil((date2-date1)/(1000*24*3600));
}

function show_trial_popups(){
    chrome.storage.local.get(['is_advance_promo_activated', 'content_visits', 'plan_type', 'created_date', 'expiry_date', 'last_plan_type', 'subscribed_date', 'location_info'], function (result) {
        // Initialize Values
        plan_type = result.plan_type || 'Expired';
        last_plan_type = result.last_plan_type || "Basic";
        location_info = result.location_info || location_info;

        let today = new Date();
        let content_visits = result.content_visits || 0;
        let expiry_date = (result.expiry_date) ? new Date(result.expiry_date) : null;
        let created_date = (result.created_date) ? new Date(result.created_date) : null;
        let subscribed_date = (result.subscribed_date) ? new Date(result.subscribed_date) : null;
        let is_advance_promo_activated = result.is_advance_promo_activated || 'NO';

        // Calculate Values
        let date_diff = (expiry_date) ? dateDiff(today, expiry_date) : 7;
        
        // already did when plan_type is set
        // if(subscribed_date && expiry_date){
        //     let plan_days = Math.abs(dateDiff(expiry_date, subscribed_date));
        //     plan_duration = (plan_days > 31) ? (plan_days > 366)? "BiAnnually" :"Annually" : "Monthly";
        //     trackSystemEvent(`${plan_duration.toLowerCase()}_${plan_type.toLowerCase()}_user`);
        // }

        // Show Popups
        if (plan_type === 'FreeTrial') {
            if(content_visits === 0) {
                display_popup('free_trial_start', date_diff);
            }
            else if(date_diff <= 7) {
                display_popup('free_trial_reminder', date_diff);
            }
        }
        else if(plan_type === 'AdvancePromo') {
            if(is_advance_promo_activated === 'NO') {
                is_advance_promo_activated = 'YES';
                display_popup('advance_promo_start', date_diff);
            } else if(date_diff <= 5) {
                display_popup('advance_promo_reminder', date_diff);
            }
        } 
        else if(plan_type === 'Expired' && (date_diff <= 0) && my_number && (my_number != undefined)) {
            if((last_plan_type === 'Basic') || (last_plan_type === 'Advance')) {
                display_popup('premium_expired', date_diff);
            }
            else if(last_plan_type === 'FreeTrial') {
                display_popup('free_trial_expired');
            } 
            else if(last_plan_type === 'AdvancePromo') {
                display_popup('advance_promo_expired');
            }
        }
        else if((plan_type == 'Basic' || plan_type == 'Advance') && plan_duration == 'Monthly' && date_diff <= 5 && date_diff >= 0){
            buyAnnualPopup(date_diff);
        } 
        else if((plan_type == 'Basic' || plan_type == 'Advance') && (plan_duration == 'Annually'|| plan_duration == "BiAnnually") && date_diff <= 30 && date_diff >= 0){
            display_popup("annual_plan_reminder", date_diff);
        }
        
        // Set updated values
        chrome.storage.local.set({
            content_visits: content_visits+1,
            is_advance_promo_activated: is_advance_promo_activated,
        });

    });
}

function isExpired() {
    return (plan_type === 'Expired');
}

function isBasic() {
    return (plan_type === 'Basic');
}

function isAdvance() {
    return (plan_type === 'Advance');
}

function isPremium() {
    return (plan_type === 'Basic' || plan_type === 'Advance');
}

function isFreeTrial() {
    return (plan_type === 'FreeTrial'); 
}

function isAdvancePromo() {
    return (plan_type === 'AdvancePromo');
}

function isTrial() {
    return (plan_type === 'FreeTrial' || plan_type === 'AdvancePromo');
}

function isBasicFeatureAvailable() {
    return (isBasic() || isTrial());
}

function isAdvanceFeatureAvailable() {
    return (isAdvance() || isAdvancePromo());
}

function isPremiumFeatureAvailable() {
    return (isPremium() || isTrial());
}

function isSpecialCountryFreeTrial() {
    const SPECIAL_COUNTRIES = [
        { code: '51' }, // Peru
        { code: '52' }, // Mexico
        { code: '55' }, // Brazil
        { code: '966' }, // Saudi Arabia
        { code: '971' }, // UAE
    ];

    for (const country of SPECIAL_COUNTRIES) {
        if (my_number && my_number.startsWith(country.code)) {
            return true;
        }
    }
    return false;
}

function fetch_plan_details() {
    if (!my_number) 
        return;

    if (my_name_fetched && my_email_fetched) 
        my_name_email_pushed = true;
    
    fetch_data(my_number, my_email, my_name)
        .then(res => {
            handle_response(res);
        })
        .catch(err => {     
            trackError("fetch_plan_api_error", err);
            console.error("Error fetching number data:", err);
        });
}

async function fetch_data(number, email = '', name = '') {
    var url = `${AWS_API.PLAN_FETCH}?phone=${number}&email=${email}&name=${name}`;
    return new Promise(function (resolve, reject) {
        $.ajax({
            type: "GET",
            url: url,
            success: function (response) {
                resolve(response.body);
            },
            error: function (error) {
                reject(error);
            },
            dataType: "json",
            contentType: "application/json"
        });
    });
}

async function fetchMultipleAccountsNumber(customer_parent_email) {
    try {
        const url = `${AWS_API.GET_MULT_ACC_DATA}?operation=get-completed-transaction&email=${customer_parent_email}`;
        const response = await fetch(url);
        const { body } = await response.json();
        const data = JSON.parse(body)?.data;
        
        if (data?.numbers && data?.numbers?.length > 0) {
            mult_acc_numbers = data.numbers;
        }
    } catch (e) {
        trackError("get_mult_acc_data_api_error", error);
        console.error("Error fetching multiple account numbers:", e)
    }
}

function handle_response(data) {
    if(data) {
        console.log("PLAN DATA:", data);
        if (data.plan_type) {
            plan_type = data.plan_type;
            chrome.storage.local.set({plan_type: data.plan_type});
            trackSystemEvent(`${plan_type.toLowerCase()}_user`);
        }
        if (data.created_date)
            chrome.storage.local.set({created_date: data.created_date});
        if (data.expiry_date){
            expiry_date = data.expiry_date;
            chrome.storage.local.set({expiry_date: data.expiry_date});
        }
        if (data.last_plan_type){
            last_plan_type = data.last_plan_type;
            chrome.storage.local.set({last_plan_type: data.last_plan_type});
        }
        if (data.subscribed_date)
            chrome.storage.local.set({subscribed_date: data.subscribed_date});
        if (data.name)
            chrome.storage.local.set({customer_name: data.name});
        else
            chrome.storage.local.set({customer_name: null});
        if(data.email && data.email !== "NULL"){
            chrome.storage.local.set({customer_email: data.email});
            if(RUNTIME_CONFIG.displayInvoiceDownload){
                getDates(data.email)
            }
        } else {
            chrome.storage.local.set({customer_email: null});
        }
        if(data.parent_email && data.parent_email !== "NULL") {
            chrome.storage.local.set({customer_parent_email: data.parent_email});
            chrome.storage.local.set({isMultipleAccount: true});
            fetchMultipleAccountsNumber(data.parent_email);
        } else {
            chrome.storage.local.set({customer_parent_email: null});
            chrome.storage.local.set({isMultipleAccount: false});
        }
        if(data.customer_care_number != undefined && data.customer_care_number != null && data.customer_care_number != "")
            chrome.storage.local.set({customer_care_number: data.customer_care_number});
        else 
            chrome.storage.local.set({customer_care_number: "917058067789"});
        if(data.trial_days){
            chrome.storage.local.set({trial_days: data.trial_days});
            chrome.storage.local.get(['added_trial_days'],(res)=>{
                let added_trial_days = res.added_trial_days;
                if(added_trial_days!==undefined && !added_trial_days){
                    // add trial days to google analytics here
                    // trackSystemEvent('Extension Installation',data.trial_days);
                    chrome.storage.local.remove('added_trial_days');
                    chrome.runtime.sendMessage({
                        type: 'set_uninstall_url',
                        uninstall_url: RUNTIME_CONFIG.uninstallUrl,
                        trial_days: data.trial_days,
                        number: my_number + data.plan_type
                    });
                }
            });
        }
        if(data.p2p_segment){
            chrome.storage.local.set({p2p_segment: data.p2p_segment});
            console.log("p2p_segment",data.p2p_segment);
        }
        setPlanDuration(data.subscribed_date, data.expiry_date);
        trackSystemEvent('plan_details_fetched', 'fetched');
    } 
}

function getPlanDuration(days) {
    if (days > 366) return "BiAnnually";
    if (days > 31) return "Annually";
    return "Monthly";
}

function setPlanDuration(subscribed_date_str, expiry_date_str) {
    if (subscribed_date_str && expiry_date_str) {
        let subscribed_date = new Date(subscribed_date_str);
        let expiry_date = new Date(expiry_date_str);
        let plan_days = Math.abs(dateDiff(expiry_date, subscribed_date));

        plan_duration = getPlanDuration(plan_days);
        chrome.storage.local.set({ plan_duration: plan_duration });
        trackSystemEvent(`${plan_duration.toLowerCase()}_${plan_type.toLowerCase()}_user`);
    }
}

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

function getFreeTrialButtonHtml() {
    if (RUNTIME_CONFIG.useOldPricingLinks) {
        return `<a href="${RUNTIME_CONFIG.basePricingUrl}" target="_blank" class="popup-btn pricing-green-btn CtaBtn" style="font-weight:bold;">
                    Buy Premium
                </a>`;
    } else {
        return `<span class="popup-btn pricing-green-btn CtaBtn" id="show_pricing_popup" style="font-weight:bold;">
                    Buy Premium
                </span>`;
    }
}


async function getBasicPremiumExpiredButton(basicPrice, basicConvertedPrice, advancePrice, advanceConvertedPrice, pricing_link){
    let country_name = getCountryNameWithSpecificPricing();
    let basic_link, advance_link;
    if (RUNTIME_CONFIG.useOldPricingLinks){
        basic_link = pricing_link + "basic";
        advance_link = pricing_link + "advance";
    } else {
        basic_link = pricing_link + PRICING_PAGE_LINK[country_name][plan_duration.toLowerCase()].basic;
        advance_link = pricing_link + PRICING_PAGE_LINK[country_name][plan_duration.toLowerCase()].advance;
    }
    const basicButtonHtml = await basicButton(basic_link,basicPrice,basicConvertedPrice,false,!RUNTIME_CONFIG.useOldPricingLinks)
    const advanceButtonHtml = await advanceButton(advance_link,advancePrice,advanceConvertedPrice,"",false,!RUNTIME_CONFIG.useOldPricingLinks);

    return {basicButtonHtml, advanceButtonHtml};
}

async function getAdvancePremiumExpiredButton(advancePrice, advanceConvertedPrice, pricing_link){
    let country_name = getCountryNameWithSpecificPricing();
    let advance_link;
    if (RUNTIME_CONFIG.useOldPricingLinks){
        advance_link = pricing_link + "advance";
    } else {
        advance_link = pricing_link + PRICING_PAGE_LINK[country_name][plan_duration.toLowerCase()].advance;
    }
    const advanceButtonHtml = await advanceButton(advance_link,advancePrice,advanceConvertedPrice,"",false,!RUNTIME_CONFIG.useOldPricingLinks)
    return advanceButtonHtml
}

function getAnnualButtonHtml(){
    let country_name = getCountryNameWithSpecificPricing();
    let pricing_link;
    if (RUNTIME_CONFIG.useOldPricingLinks){
        pricing_link = `${RUNTIME_CONFIG.basePricingUrl}?country=${country_name}&lastPlan=${last_plan_type}&currentPlan=${plan_type}&hideMonthly=true`;
    } else {
        pricing_link = 'https://buy.stripe.com/' + PRICING_PAGE_LINK[country_name]["annually"][plan_type.toLowerCase()];
    }

    let annualButton = 
        `<a href="${pricing_link}" target="_blank" class="popup-btn pricing-green-btn CtaBtn" style="font-weight:bold;">
            Buy Annual 
        </a>`;
    return annualButton;
}

function displayNotification(message, daysAfterInstall, planType, gapBetweenDays) {
    if (!RUNTIME_CONFIG.displayNotification) {
        return;
    }

    const prime_icon = document.getElementById("prime_profile");
    const side_panel = getDocumentElement('side_panel')
    const currentDate = Date.now();  
    const htmlString = `
      <div class="notification-wrapper">
        <div class="notification">
          ${message}
        </div>
      </div>
    `;

    chrome.storage.local.get(["created_date","lastNotification", "deliveryReports"], (res) => {
        const msInDay = 24 * 60 * 60 * 1000;
      const daysSinceInstallation = Math.floor((currentDate - new Date(res.created_date)) / msInDay);
      const lastNotification = res.lastNotification || 0;
      const daysSinceLastNotification = (currentDate - lastNotification) / msInDay;
  
      let lastDeliveryDate = 0;
      if (Array.isArray(res.deliveryReports) && res.deliveryReports.length > 0) {
        const lastReport = res.deliveryReports[res.deliveryReports.length - 1];
        lastDeliveryDate = lastReport.date || 0;
      }
  
      const daysSinceLastDelivery = (currentDate - lastDeliveryDate) / msInDay;
      const shouldShowNotification =
        prime_icon &&
        daysSinceInstallation >= daysAfterInstall &&
        plan_type === planType &&
        (lastNotification === 0 || daysSinceLastNotification >= gapBetweenDays) &&
        (lastDeliveryDate === 0 || daysSinceLastDelivery >= 3); 

        if (shouldShowNotification) {
            side_panel.style.marginTop = "54px"
            side_panel.style.backgroundColor=  "var(--chatlist-panel-background)";
            prime_icon.innerHTML += htmlString;
            chrome.storage.local.set({ lastNotification: currentDate });
        }
  

    });
}

function getPricingLink(countryName, duration, both = true) {
    duration = duration.toLowerCase();
    const base = PRICING_PAGE_LINK[countryName]?.[duration];
    
    if (!base) {
        console.error(`Invalid country or duration: ${countryName}, ${duration}`);
        return
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


  
async function create_pricing_buttons_html(popup_name) {
    let pricing_data = PRICING_DATA[popup_name];
    if (!pricing_data) return '';
    if(popup_name === "advance_promo_expired"){
        pricing_data.lastPlan = "AdvancePromo"
    }
    let country_name = getCountryNameWithSpecificPricing();
    let advancePrice = pricing_data.advance_price[country_name];
    let basicPrice = pricing_data.basic_price[country_name];
    let advanceConvertedPrice = await convertPriceToLocale(advancePrice.substring(1));
    let basicConvertedPrice = await convertPriceToLocale(basicPrice.substring(1));

    let pricingLinks = getPricingLink(country_name, plan_duration ,plan_type === "Basic") || {};
    let annualBasicPricingLink = pricingLinks.basic || "";
    let annualAnnualPricingLink = pricingLinks.advance || "";

    let pricing_link, basic_link, advance_link;
    if (RUNTIME_CONFIG.useOldPricingLinks) {
        pricing_link = `${RUNTIME_CONFIG.basePricingUrl}?country=${country_name}&lastPlan=${pricing_data.lastPlan}&currentPlan=`;
        basic_link = pricing_link + "basic";
        advance_link = pricing_link + "advance";
    } else {
        pricing_link = 'https://buy.stripe.com/';
        basic_link = pricing_link + PRICING_PAGE_LINK[country_name][plan_duration.toLowerCase()].basic;
        advance_link = pricing_link + PRICING_PAGE_LINK[country_name][plan_duration.toLowerCase()].advance;
    }

    let multAccountButtonHtml = await multipleAccountButton();
    let basicButtonHtml = await basicButton(basic_link, basicPrice, basicConvertedPrice,false);
    let advanceButtonHtml = await advanceButton(advance_link, advancePrice, advanceConvertedPrice, popup_name,false);
    let showBasicButton = true, showAdvanceButton = false;
    let showMultAccountButton = false;

    if(last_plan_type == 'Advance') {
        showBasicButton = false;
        showAdvanceButton = true;
    }

    let popup_button_html = '';

    if(popup_name == "free_trial_reminder" || popup_name == "free_trial_expired"){
        popup_button_html = getFreeTrialButtonHtml();
        showBasicButton = false;
        showAdvanceButton = false;
    }

    if(popup_name == 'premium_expired' && last_plan_type == 'Basic'){
        let buttons = await getBasicPremiumExpiredButton(basicPrice, basicConvertedPrice, advancePrice, advanceConvertedPrice, pricing_link);
        basicButtonHtml = buttons.basicButtonHtml;
        advanceButtonHtml = buttons.advanceButtonHtml;
        showBasicButton = true;
        showAdvanceButton = true;
    }

    if(popup_name == 'premium_expired' && last_plan_type == 'Advance'){
        advanceButtonHtml = await getAdvancePremiumExpiredButton(advancePrice, advanceConvertedPrice, pricing_link);
        showBasicButton = false;
        showAdvanceButton = true;
    }

    if(popup_name == "buy_annual"){
        popup_button_html = getAnnualButtonHtml();
        showBasicButton = false;
        showAdvanceButton = false;
    }

    if(popup_name == "advance_promo_expired"){
        showAdvanceButton=true;
        basicButtonHtml = await basicButton(basic_link, basicPrice, basicConvertedPrice,false);
        advanceButtonHtml = await advanceButton(advance_link, advancePrice, advanceConvertedPrice, popup_name,false);
    }

    if(popup_name == 'annual_plan_reminder'){
        const { renewButton, upgradeButton } = annualExpired(plan_type,annualAnnualPricingLink,annualBasicPricingLink);
        if (plan_type === "Basic") {
            showBasicButton = true;
            showAdvanceButton = true;
            basicButtonHtml = renewButton;
            advanceButtonHtml = upgradeButton;
        } else {
            showBasicButton = false;
            showAdvanceButton = true;
            basicButtonHtml = "";
            advanceButtonHtml = renewButton;
        }
    }

    let pricing_buttons_html = `
    <div style="display:flex;flex-direction:column;gap:6px;margin-bottom:20px;align-items:center;justify-content:center;">
        <div class="pricing-buttons-container ${popup_name === "annual_plan_reminder" && "annualExpiredBtns"}" style="margin-bottom:0px;"> 
            ${showBasicButton ? basicButtonHtml : ""}
            ${showAdvanceButton ? advanceButtonHtml : ""}
            ${showMultAccountButton ? multAccountButtonHtml : ""}
            ${popup_button_html}
        </div>
        <div style="width:100%;${popup_name == 'annual_plan_reminder'?"display:none;":"display:flex;"}justify-content:center;align-items:center;flex-direction:column;color:#fff;">
            <span style="margin-bottom:5px">or</span>
            ${RUNTIME_CONFIG.useOldPricingLinks 
                ? `<a href="${RUNTIME_CONFIG.basePricingUrl}multiple-account" target="_blank" style="color:#fff;font-size:14px;text-decoration:underline;text-underline-offset:5px;display:flex;justify-content:center;align-items:center;gap:3px;font-weight: bold;"><img src="${multiple_users_icon}" style="width:18px;margin-top: 3px;"/>Buy multiple users upto 70% discount</a>` 
                : `<span style="color:#fff;font-size:14px;text-decoration:underline;text-underline-offset:5px;display:flex;justify-content:center;align-items:center;gap:3px;font-weight: bold;cursor:pointer;" class="show_multiple_users"><img src="${multiple_users_icon}" style="width:18px;margin-top: 3px;"/>Buy multiple users upto 70% discount</span>`
            }
        </div>
    </div>
    `;
    return pricing_buttons_html;
}

function create_features_list_html(popup_name) {
    let features_html = '';
    let show_advance_bracket = true;
    if(popup_name.includes('advance_promo')) {
        show_advance_bracket = false;
    }

    $.each(PREMIUM_FEATURES, function (i, feature) {
        features_html += `
            <div class="trial_feature" style="font-weight: bold;color: #fff;">
                <span class="check_icon"></span>${feature}
                ${show_advance_bracket ? '<span style="color:#009a88;margin-left: 5px;"> (Advance) </span>' : ''}
            </div>`;
    });
    $.each(TRIAL_FEATURES, function (i, feature) {
        features_html += `<div class="trial_feature" style="color: #fff;"><span class="check_icon"></span>${feature}</div>`;
    });
    return features_html;
}

function create_footer_html() {
    let footer_html = `
        <div class="popup-footer">
            <div class="popup-footer-container">
                <div class="logo-div">
                    <img class="logo-icon" src="${window['logo_img']}" alt="Logo"/>
                    <img class="logo-text" src="${window['logo_text']}" alt="Logo Text"/>
                </div>
            </div>
        </div>`;
    return footer_html;
}

async function create_popup_html(popup_name, date_diff) {
    const data = POPUP_DATA[popup_name];
    const common = POPUP_DATA.common;

    let title_text = (data.title) ? data.title.replace('{VAR_DATE_DIFF}', `<br /><span class="expire_date_number">${date_diff}</span>`).replace('{VAR_EXP_TEXT}', (date_diff > 0) ? `expires in ${date_diff} days` : 'have expired'): null;

    if (popup_name === "annual_plan_reminder" && date_diff <= 30 && date_diff > 15 && title_text) {
        title_text = title_text.replace(/<span class="expire_date_number">.*?<\/span>/,"a few");
    }

    const pricing_buttons_html = await create_pricing_buttons_html(popup_name);
    const features_html = create_features_list_html(popup_name);
    const footer_html = create_footer_html();

    const popup_html = `
        <div class="${popup_name}_content trial_content" style="background: ${data.background_color}">
            ${(data.close_button) ? `<span class="CtaCloseBtn popup-close-btn" style="padding:10px;" id="close_${popup_name}_popup"><img src=${close_img_src} /></span>` : ''}

            <div class="popup-header">
                ${data.heading ? 
                    `<div class="trial_big_title heading ${popup_name}_bold">
                        ${data.heading_icon ? `<img src=${window[data.heading_icon]} />` : ''}
                        <p>${await translate(data.heading)}<p>
                    </div>` 
                : ''}
                <div class="trial_big_title">
                    ${data.icon ? `<img src=${window[data.icon]} />` : ''}
                    ${title_text ? `<p>${await translate(title_text)}</p>` : ''}
                </div>
                ${data.description ? `<div class="trial_title">${await translate(data.description)}</div>` : ''}
            </div>

            <div class="popup-center"> 
                <div class="trial_features">${features_html}</div>
                ${data.note ? `<div class="trial_desc">${await translate(data.note)}</div>` : ''}
                ${pricing_buttons_html}
                ${data.action_button ? `<div id="${data.action_button.id}" class="popup-btn CtaBtn ${data.action_button.class}">${data.action_button.text}</div>` : ''}
                ${data.recommend_price ? `<div class="popup-message popup-recommendation-message"><img src="${recommend_tick}"> ${await translate(common.recommend_text)}</div>` : ''}
                ${data.discount_text ? `<div class="popup-message popup-discount-message">*${await translate(common.discount_text)}</div>` : ''}
                ${data.purchase_note ? `<div class="popup-message popup-purchase-note">${await translate(common.purchase_note)}</div>` : ''}  
            </div>

            ${footer_html}
        </div>
    `;
    return popup_html;
}

function show_pricing_for_multiple_accounts() {
    removeAppBackdrop();
    closeAllPopups();

    if (RUNTIME_CONFIG.useOldPricingLinks) {
        return;
    }

    let activePlan = 'advance';   // default
    let activeDuration = 'annually'; // default
    let numberOfAccounts = 2;     // default

    const buildPopupHTML = (plan, duration, accounts) => {
        const { finalPrice, slashPrice,currency,discountedPrice } = calculateMultipleAccountsPricing(plan, duration, accounts);

        return `
            <div class="header-multiple-accounts">
                <div class="header-multiple-accounts-title">
                    Need multiple accounts?
                </div>
                <div class="header-multiple-accounts-description">
                    <p>Purchase premium plan for multiple users for your organization at a <span class="text-royal">discounted rate upto 70%</span>  </p>
                </div>
                <div class="pricing-popup-close">&times;</div>
            </div>

            <div class="body-multiple-accounts">
                <div class="body-header">
                    <div class="left_line"></div>
                    <h3 class="pricing_calculator_title">Pricing Calculator</h3>
                    <div class="right_line"></div>
                </div>

                <div class="body-content">
                    <div class="plan-toggle">
                        <input type="radio" id="multiple_account_basic" name="plan" value="basic" ${plan === 'basic' ? 'checked' : ''}>
                        <label for="multiple_account_basic">Basic</label>
                        <input type="radio" id="multiple_account_advance" name="plan" value="advance" ${plan === 'advance' ? 'checked' : ''}>
                        <label for="multiple_account_advance">Advance</label>
                        <span class="slider"></span>
                    </div>

                    <div class="pricing-slider pricing_calculator_slider">
                        <div class="duration-slider">
                            <span class="slider-text ${duration === 'monthly' ? 'text-royal' : 'text-gray'}">Monthly</span>
                            <label class="switch-container multiple_account_popup_switch">
                                <input type="checkbox" id="duration-toggle" ${duration === 'annually' ? 'checked' : ''}/>
                                <span class="switch"></span>
                            </label>
                            <span class="slider-text ${duration === 'annually' ? 'text-royal' : 'text-gray'}">12 Months</span>
                        </div>
                    </div>

                    <div class="num_accounts_section">
                        <p class="num_accounts_title text-gray">Number of Accounts</p>
                        <input class="num_accounts_input" type="number" min="2" value="${accounts}" />
                    </div>
                    <div class="pricing-popup-price">
                        <span class="new-price"><span class="${currency === '₹' ? 'rupee' : ''} currency-symbol">${currency}</span>${duration === 'annually' ? Math.ceil(discountedPrice/accounts) : Math.ceil(finalPrice/accounts)}</span>
                        <span class="old-price"><span class="${currency === '₹' ? 'rupee' : ''} currency-symbol">${currency}</span>${slashPrice}</span>
                    </div>
                    <span class="user-month">/user/month</span>

                    <button class="multiple-accounts-buy background-royal">Buy</button>
                </div>
            </div>
        `;
    };

    const popup = $('<div>', { class: 'pricing-popup multiple-accounts-popup pricing_card prime_content_popup', id: 'multiple-accounts-popup' });
    popup.html(buildPopupHTML(activePlan, activeDuration, numberOfAccounts));
    $('body').append(popup);
    addAppBackdrop();

    $('body').on('click', '.pricing-popup-close', function () {
        $('#multiple-accounts-popup').remove();
        removeAppBackdrop();
    });
    
    $('body').one('click', '.multiple-accounts-buy', function () {
        $('#multiple-accounts-popup').remove();
        removeAppBackdrop();
        show_multiple_accounts_popup(activePlan, activeDuration, numberOfAccounts)
    });

    $('body').on('change', 'input[name="plan"]', function () {
        activePlan = $(this).val();
        $('#multiple-accounts-popup').html(buildPopupHTML(activePlan, activeDuration, numberOfAccounts));
    });

    $('body').on('change', '#duration-toggle', function () {
        activeDuration = this.checked ? 'annually' : 'monthly';
        $('#multiple-accounts-popup').html(buildPopupHTML(activePlan, activeDuration, numberOfAccounts));
    });

    $('body').on('input', '.num_accounts_input', function () {
        let val = parseInt($(this).val());
        numberOfAccounts = (isNaN(val) || val < 2) ? 2 : val;
        $('#multiple-accounts-popup').html(buildPopupHTML(activePlan, activeDuration, numberOfAccounts));
    });    
}


async function show_multiple_accounts_popup(activePlan, activeDuration, numberOfAccounts, edit = false) {
    removeAppBackdrop();
    closeAllPopups();

    if (RUNTIME_CONFIG.useOldPricingLinks) {
        return;
    }

    const durationMapTranslated = {
        'monthly': await translate('Monthly'),
        'annually': await translate('Annual')
    };
    const enterEmailText = await translate('Enter your email:');
    const enterEmailPlaceholder = await translate('Enter your email...');
    const enterNumbersText = await translate('Enter phone numbers');
    const infoText = await translate('Add the WhatsApp numbers with the country code on which the premium needs to be enabled');
    const enterNumbersPlaceholder = await translate('Enter phone number with country code, e.g. +919876543210');
    const buyText = await translate('Buy');
    const addMoreText = await translate('Add More');
    const autoRenewText = await translate('Enable auto renew');
    const subscribeText = await translate('Subscribe');

    const buildPopupHTML = (activeDuration, activePlan) => {
        return `
            <div class="header-wrapper">
                <div class="pricing-popup-header multiple-accounts-popup-header">
                    <span>${activePlan.charAt(0).toUpperCase() + activePlan.slice(1)} ${durationMapTranslated[activeDuration]}</span>
                    <div class="pricing-popup-close">&times;</div>
                </div>
            </div>
            <div class="pricing-popup-body multiple-accounts-popup-body">
                <div class="request-form">
                    <div class="request-email">   
                        <span>${enterEmailText}</span>
                        <input type="email" id="request-email" placeholder="${enterEmailPlaceholder}" />
                    </div>
                    <div class="info">
                        <span>${infoText}</span>
                    </div>
                    <div class="request-numbers">
                        <span>${enterNumbersText}</span>
                        <div id="numbers-list" class="numbers-list scrollable-list"></div>
                        <button type="button" id="add-more-btn" class="add-more-btn">${addMoreText}</button>
                    </div>
                    ${activeDuration === 'monthly' ? `
                        <div class="auto-renew-option">
                            <label>
                                <input type="checkbox" id="auto-renew-checkbox" />
                                ${autoRenewText}
                            </label>
                        </div>
                    ` : ''}
                    <button class="buy-now-btn" id="send-request-btn">${buyText}</button>
                </div>
            </div>
        `;
    };

    const popup = $('<div>', { class: 'pricing-popup multiple-accounts-popup prime_content_popup ', id: 'multiple-account-popup' });
    popup.html(buildPopupHTML(activeDuration, activePlan));
    $('body').append(popup);
    addAppBackdrop();

    let numbersArray = [];

    function saveState() {
        const email = $('#request-email').val().trim();
        const autoRenew = $('#auto-renew-checkbox').is(':checked');
        const state = { email, numbers: numbersArray, autoRenew };
        chrome.storage.local.set({ multipleAccountsData: state });
    }

    function restoreState(state) {
        if (!state) return;

        if (state.email) {
            $('#request-email').val(state.email);
        }

        $('#numbers-list').empty();
        numbersArray = [];

        if (state.numbers && state.numbers.length > 0) {
            state.numbers.forEach(num => addNumberField(num));
        } else {
            for (let i = 0; i < numberOfAccounts; i++) {
                addNumberField("");
            }
        }

        if (state.autoRenew) {
            $('#auto-renew-checkbox').prop('checked', true).trigger('change');
        }
    }

    function addNumberField(value) {
        const index = numbersArray.length;
        numbersArray.push(value);
        
        $('#numbers-list').append(`
            <div class="number-item" data-index="${index}">
                <input type="text" class="number-input" data-index="${index}"
                    placeholder="${enterNumbersPlaceholder}" ${value ? `value="${value}"` : ''} />
                <button class="remove-number" data-index="${index}">&times;</button>
            </div>
        `);
    }
    
    function syncNumbersArray() {
        numbersArray = [];
        $('.number-input').each(function () {
            numbersArray.push($(this).val().trim());
        });
        saveState();
    }
    
    if (edit) {
        chrome.storage.local.get(['multipleAccountsData'], (result) => {
            restoreState(result.multipleAccountsData);
        });
    } else {
        for (let i = 0; i < numberOfAccounts; i++) {
            addNumberField("");
        }
    }

    $('body').off('click', '#add-more-btn').on('click', '#add-more-btn', function () {
        addNumberField("");
        saveState();
    });

    $('body').off('input', '.number-input').on('input', '.number-input', function () {
        syncNumbersArray();
    });
    
    $('body').off('click', '.remove-number').on('click', '.remove-number', function () {
        const activeCount = $('.number-item').length;
        if (activeCount <= 2) {
            alert("At least 2 numbers are required.");
            return;
        }
        $(this).closest('.number-item').remove();
        syncNumbersArray();
    });

    $('body').off('input', '#request-email').on('input', '#request-email', function () {
        saveState();
    });

    $('body').off('change', '#auto-renew-checkbox').on('change', '#auto-renew-checkbox', function () {
        if ($(this).is(':checked')) {
            $('#send-request-btn').text(subscribeText);
        } else {
            $('#send-request-btn').text(buyText);
        }
        saveState();
    });

    $('body').off('click', '.pricing-popup-close').on('click', '.pricing-popup-close', function () {
        $('#multiple-account-popup').remove();
        removeAppBackdrop();
    });

    $('body').off('click', '#send-request-btn').on('click', '#send-request-btn', function () {
        const email = $('#request-email').val().trim();
        const numbers = numbersArray.filter(num => num && num !== "");
        const autoRenew = $('#auto-renew-checkbox').is(':checked');
        
        if (!email || numbers.length === 0) {
            alert('Please fill in all fields.');
            return;
        }

        const state = { email, numbers, autoRenew };
        chrome.storage.local.set({ multipleAccountsData: state }, () => {
            finalPopupForMultipleAccounts(email, numbers, activePlan, activeDuration, autoRenew);
        });

        $('#numbers-list').empty();
        numbersArray = [];
        $('#multiple-account-popup').remove();
        removeAppBackdrop();
    });
}

function sendRequestForMultipleAccounts(email, numbers, planType, duration, autoRenew) {
    const url = "https://3hfe043k3g.execute-api.ap-south-1.amazonaws.com/prod";
    const data = {
        email: email,
        numbers: numbers,
        plan_type: planType.charAt(0).toUpperCase() + planType.slice(1),
        plan_duration: duration,
        operation: "add-transaction-record",
        name: "Prime Sender " + planType.charAt(0).toUpperCase() + planType.slice(1) + " " + (duration === 'monthly' ? 'Monthly' : 'Annual'),
        description: planType.charAt(0).toUpperCase() + planType.slice(1) + " " + (duration === 'monthly' ? 'Monthly' : 'Annual') + " Plan for " + numbers.length + " users",
        country: "india",
        currency: "inr",
        autorenew: autoRenew
    };
    
    fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        let res = JSON.parse(data.body);
        console.log("Response:", res);
        if(res.statusCode === 200){
            window.open(`${res.data.stripe_checkout_url}`,"_blank")
            $('#final-multiple-account-popup').remove();
            removeAppBackdrop();
        }
    })
    .catch(error => {
        console.error(error);
    });
}

async function finalPopupForMultipleAccounts(email, numbers, planType, duration, autoRenew) {
    removeAppBackdrop();
    closeAllPopups();

    const durationMapTranslated = {
        'monthly': await translate('Monthly'),
        'annually': await translate('Annual')
    };

    const translatedLoader = await translate('Please wait, while we are processing your request ...')
    const translatedHeading = await translate('Please confirm your details')
    const translatedEmail = await translate('Email:')
    const translatedPhoneNumbers = await translate('Phone Numbers:')
    const translatedConfirmBtn = await translate('Confirm & Buy')
    const translatedEditBtn = await translate('Edit')

    const popupHTML = `
        <div class="header-wrapper">
            <div class="pricing-popup-header multiple-accounts-popup-header">
                <span>${planType.charAt(0).toUpperCase() + planType.slice(1)} ${durationMapTranslated[duration]}</span>
                <div class="pricing-popup-close">&times;</div>
            </div>
        </div>
        <div class="pricing-popup-body multiple-accounts-popup-body">
            <div class="confirmation-wrapper">
                <h3>${translatedHeading}</h3>
                
                <div class="confirm-item">
                    <strong>${translatedEmail}</strong> <span>${email}</span>
                </div>
                <div class="confirm-item">
                    <strong>${translatedPhoneNumbers}</strong> <span>${numbers.join(", ")}</span>
                </div>
            </div>
            <div class="confirmation-actions">
                <button class="confirm-btn" id="confirm-buy-btn">${translatedConfirmBtn}</button>
                <button class="edit-btn" id="edit-details-btn">${translatedEditBtn}</button>
            </div>
        </div>
    `;

    const popup = $('<div>', { 
        class: 'pricing-popup multiple-accounts-popup prime_content_popup', 
        id: 'final-multiple-account-popup' 
    });
    popup.html(popupHTML);
    $('body').append(popup);
    addAppBackdrop();

    $('body').off('click', '.pricing-popup-close').on('click', '.pricing-popup-close', function () {
        $('#final-multiple-account-popup').remove();
        removeAppBackdrop();
    });

    $('body').off('click', '#edit-details-btn').on('click', '#edit-details-btn', function () {
        $('#final-multiple-account-popup').remove();
        removeAppBackdrop();
        show_multiple_accounts_popup(planType, duration, numbers.length, true);
    });

    $('body').off('click', '#confirm-buy-btn').on('click', '#confirm-buy-btn', function () {
        $('.confirmation-wrapper').html(`
            <div class="loader">
                <p>${translatedLoader}</p>
                <div class="spinner">
                    <svg width="64" height="64" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <style>
                        .spinner_jCIR {
                            animation: spinner_B8Vq .9s linear infinite;
                            animation-delay: -.9s;
                            fill: #009a88;
                        }
                        .spinner_upm8 { animation-delay: -.8s; }
                        .spinner_2eL5 { animation-delay: -.7s; }
                        .spinner_Rp9l { animation-delay: -.6s; }
                        .spinner_dy3W { animation-delay: -.5s; }

                        @keyframes spinner_B8Vq {
                            0%, 66.66% { animation-timing-function: cubic-bezier(0.36,.61,.3,.98); y:6px; height:12px; }
                            33.33% { animation-timing-function: cubic-bezier(0.36,.61,.3,.98); y:1px; height:22px; }
                        }
                        </style>

                        <rect class="spinner_jCIR" x="1" y="6" width="2.8" height="12"/>
                        <rect class="spinner_jCIR spinner_upm8" x="5.8" y="6" width="2.8" height="12"/>
                        <rect class="spinner_jCIR spinner_2eL5" x="10.6" y="6" width="2.8" height="12"/>
                        <rect class="spinner_jCIR spinner_Rp9l" x="15.4" y="6" width="2.8" height="12"/>
                        <rect class="spinner_jCIR spinner_dy3W" x="20.2" y="6" width="2.8" height="12"/>
                    </svg>
                </div>
            </div>
        `);
        $('.confirmation-actions').remove();

        sendRequestForMultipleAccounts(email, numbers, planType, duration, autoRenew);
    });
}

function calculateMultipleAccountsPricing(planType, duration,numberOfAccounts) {
    if(numberOfAccounts < 2){
        return;
    }
    let country_name = getCountryNameWithSpecificPricing();
    let currentPrice = PRICING[country_name][duration][`${planType}_plan`];
    let price = currentPrice.final;
    let currency = PRICING[country_name].currency_symbol;
    let slashPrice =  duration =='annually' ? currentPrice.monthly_original : currentPrice.original;

    let discountPercentage;
    if (numberOfAccounts == 2) 
      discountPercentage = 0.20;
    else if (numberOfAccounts == 3) 
      discountPercentage = 0.30;
    else if (numberOfAccounts >= 4 && numberOfAccounts <= 9)
      discountPercentage = 0.40;
    else if (numberOfAccounts >= 10 && numberOfAccounts <= 25) 
      discountPercentage = 0.50;
    else if (numberOfAccounts > 25) 
      discountPercentage = 0.60;
    
    if(duration == 'annually')
      discountPercentage += 0.05;
    if(planType == 'advance')
      discountPercentage += 0.05;
      
    let discountedPrice = Math.ceil(Number(numberOfAccounts) * (Number(price) - Number(price) * Number(discountPercentage)));
    let finalPrice = discountedPrice;
    if (duration == 'annually') {
      finalPrice = discountedPrice;
      discountedPrice = Math.ceil(Number(finalPrice) / 12);
    }
    return {currency, discountedPrice, finalPrice ,slashPrice}

}

async function show_plan_pricing_popup(activePlan = 'basic') {
    const pricing_popup_trial_features = ['Export Group Contacts', "Translate Conversation", "Quick Replies", "Customizable Time Gap", "Random Time Gap", 'Chat Support', "Batching", "Caption", "Save Message Template", "Detailed Delivery report", "Stop Campaign", "Group Message"];
    const pricing_popup_premium_features = ["Schedule", 'Business Chat Link', 'Meet/Zoom Support', "Multiple Attachments", "Pause Campaign", "Export Unsaved Contacts"]
    removeAppBackdrop();
    closeAllPopups();
    
    if (RUNTIME_CONFIG.useOldPricingLinks){
        return;
    }

    const country_name = getCountryNameWithSpecificPricing();
    const pricingData = PRICING[country_name];
    const linkData = PRICING_PAGE_LINK[country_name];
    const currencySymbol = pricingData.currency_symbol || '';
    let activeDuration = 'annually'; 

    // Translation
    const subscribeText = await translate('Subscribe');
    const buyText = await translate('Buy');
    const monthlyText = await translate('Monthly');
    const annuallyText = await translate('Annually');

    const buildPopupHTML = (plan, duration) => {
        const planData = pricingData[duration][`${plan}_plan`];
        const stripeCode = linkData[duration][plan];
        const isMonthlyDuration = duration === 'monthly';
        const finalPrice = isMonthlyDuration ? planData.final : planData.monthly_final;
        const oldPrice = isMonthlyDuration ? planData.original : planData.monthly_original;

        return `
                <div class="pricing-popup-header">
                    <div class="pricing-popup-close">&times;</div>
                    <div class='pricing-popup-logo'>
                        <img src=${logo_img} style="width:100%" alt="logo" />
                        <img src=${logo_text} style="width:100%" alt="logo" />
                    </div>
                    <h1> <b><span>${plan}</span> Plan</b></h1>
                </div>
                <hr />
            <div class="pricing-popup-body multiple-accounts-popup-body">

         <div class="pricing-slider pricing_calculator_slider">
                        <div class="duration-slider">
                            <div class="slider_leftSide">
                                <span class="slider-text">Monthly
                                </span>
                                <span class="new-price"><span class="${currencySymbol === '₹' ? 'rupee' : ''} currency-symbol">${currencySymbol}</span>${pricingData['monthly'][`${plan}_plan`].final}</span>
                                <span class="user-month">/user/month</span>
                            </div>
                            <label class="switch-container plan_pricing_poup_switch">
                            <input type="checkbox" id="duration-toggle" ${duration === 'annually' ? 'checked' : ''}/>
                            <span class="switch"></span>
                            </label>
                            <div class="slider_rightSide">
                                <span class="slider-text">Annual
                                </span>
                                <span class="new-price"><span class="${currencySymbol === '₹' ? 'rupee' : ''} currency-symbol">${currencySymbol}</span>${pricingData['annually'][`${plan}_plan`].monthly_final}</span>
                                <span class="user-month">/user/month billed annually</span>
                            </div>
                        </div>
                </div>


                <div class="pricing-popup-btn">
                    <button>
                        <a id="buy-now-btn" href="https://buy.stripe.com/${stripeCode}" target="_blank" class="buy-now-btn">
                            ${duration === 'monthly' ? subscribeText : buyText}
                        </a>
                    </button>
                    <span class="font20 marginTop10" style="color:#000; margin: 0px">or</span>
                    <div id="expired-multiple-accounts-btn" class="multiple-accounts-btn" style="cursor:pointer"><img src="${mult_user}"/><span>Buy Multiple Accounts upto 70% discount</span></div>
                </div>


            </div>
            <div class="pricing-popup-bottom">
                <div class="pricing-popup-features">
                ${pricing_popup_premium_features.map((item, index) => `
                    <div class="feature-item" key="${index}">
                    <img 
                        class="${activePlan === "basic" ? "circle_cross" : "check"}_icon" 
                    />
                    ${item} <span class="text-bold">&nbsp;(Advance)</span>
                    </div>
                `).join('')}
                ${pricing_popup_trial_features.map((item, index) => `
                    <div class="feature-item" key="${index}">
                    <img 
                        class="check_icon"
                    />
                    ${item}
                    </div>
                `).join('')}
                </div>
                <div class="pricing-popup-footer">
                    <div class="pricing-popup-footer-icon"><span>i</span></div>
                    <div class="pricing-popup-footer-content" 
                        style="font-size: ${duration === 'monthly' && last_plan_type === 'freeTrial' ? '11px' : '12px'}">
                    <span class="footer-instruction">
                        ${duration === 'monthly' && last_plan_type === 'freeTrial' ? "Discount applicable for the first month" : ''}
                    </span>
                    ${
                        duration === 'monthly'
                        ? "By subscribing, you agree to auto-deductions every month according to your plan type which will extend your plan type by a month. By purchasing the premium plan, you agree to our <u>Terms of Service</u> and <u>Privacy Policy.</u>"
                        : "By purchasing the premium plan, you agree to our <u>Terms of Service</u> and <u>Privacy Policy</u>."
                    }
                    </div>
                </div>
            </div>
        `;
    };

    const popup = $('<div>', { 
        class: 'pricing-popup expired_popup prime_content_popup', 
        id: 'plan-pricing-popup',
    });
        
    popup.html(buildPopupHTML(activePlan, activeDuration));
    addAppBackdrop();
    $('body').append(popup);
    if(last_plan_type === 'Expired') {
        $(".expired_popup").addClass("expiredBg");
    }
    else{
        $(".expired_popup").removeClass("expiredBg");}

    // Close popup
    $('body').on('click', '.pricing-popup-close', function () {
        $('#plan-pricing-popup').remove();
        removeAppBackdrop();
    });

    $('body').on('click', '#expired-multiple-accounts-btn', function () {
        $('#plan-pricing-popup').remove();
        removeAppBackdrop();
        show_pricing_for_multiple_accounts();
    });

    $('body').on('change', '#duration-toggle', function () {
        activeDuration = this.checked ? 'annually' : 'monthly';
        $('#plan-pricing-popup').html(buildPopupHTML(activePlan, activeDuration));
        if(this.checked){      
            $(".expired_popup .slider_leftSide").removeClass("active")
            $(".expired_popup .slider_rightSide").removeClass("inactive")
        }
        else{
            $(".expired_popup .slider_leftSide").addClass("active")
            $(".expired_popup .slider_rightSide").addClass("inactive")
        }    
    });
}


async function show_pricing_popup() {
    removeAppBackdrop();
    closeAllPopups();
    if (RUNTIME_CONFIG.useOldPricingLinks){
        return;
    }

    const country_name = getCountryNameWithSpecificPricing();
    const pricingData = PRICING[country_name];
    const linkData = PRICING_PAGE_LINK[country_name];
    const currencySymbol = pricingData.currency_symbol || '';

    const durationMap = {
        'Monthly': 'monthly',
        '12 Months': 'annually',
        '24 Months': 'biannually'
    };

    const basicFeatures = [
        "All Free Features",'Translate Conversation',
        'Blur Conversations', 'No minimum time gap', 'Batching',
        'Quick Replies', 'Group Contacts Export', 'Stop Campaign'
    ];

    const advanceFeatures = [
        'All Basic Features', 'Multiple Attachments', 'Schedule',
        'Pause Campaign', 'Business Chat Link', 'Export Unsaved Contacts'
    ];

    // Translation
    const subscribeText = await translate('Subscribe');
    const buyText = await translate('Buy');
    const durationMapTranslated = {
        'Monthly': await translate('Monthly'),
        '12 Months': await translate('12 Months'),
        '24 Months': await translate('24 Months')
    };


    const createPlanHTML = (planName, planKey, durationKey) => {
        const plan = pricingData[durationMap[durationKey]][`${planKey}_plan`];
        const stripeCode = linkData[durationMap[durationKey]][planKey];
        const isMonthlyDuration = durationKey === 'Monthly';
        const finalPrice = isMonthlyDuration ? plan.final : plan.monthly_final;
        const oldPrice = isMonthlyDuration ? plan.original : plan.monthly_original;        
        const features = planKey === 'basic'
            ? basicFeatures
            : advanceFeatures;

        return `
            <div class="pricing-popup-${planKey}">
                <div class="pricing-popup-title">
                    <img src="${planKey === 'basic' ? upgradePlanBasic : upgradePlan}" alt="Logo"/>
                    <span>${planName}</span>
                </div>
                <div class="pricing-popup-price">
                    <span class="new-price"><span class="${currencySymbol === '₹' ? 'rupee' : ''} currency-symbol">${currencySymbol}</span>${finalPrice}</span>
                    <span class="old-price"><span class="${currencySymbol === '₹' ? 'rupee' : ''} currency-symbol">${currencySymbol}</span>${oldPrice}</span>
                </div>
                <span class="user-month" style="font-size:10px;color:#000">/user/month ${durationKey === "12 Months" ? "billed annually" : durationKey === "24 Months" ? "billed biannually" : ""}</span>
                <div class="pricing-popup-btn">
                    <a class="pricing-popup-btn-${planKey}" href="https://buy.stripe.com/${stripeCode}" target="_blank">
                        ${durationMap[durationKey] === 'monthly' 
                            ? `${subscribeText}` 
                            : `${buyText} ${planName}`
                        }
                    </a>
                </div>
                <div class="pricing-popup-features">
                    <ul>
                        ${features.map(f => 
                          `<div style="display: flex;justify-content: space-between;align-items: center;">
                            <li style="display: flex;align-items: center; justify-content:center; ${f === "All Basic Features" || f === "All Free Features" ? "font-weight: bold;" : ""}">
                              ${f} ${f === "All Basic Features" ? "" : `<div class="i-svg" id="${f}" style="display: flex;align-items: center;justify-content: center; margin-left:2px"><svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 512 512" class="feature_info_class" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M235.4 172.2c0-11.4 9.3-19.9 20.5-19.9 11.4 0 20.7 8.5 20.7 19.9s-9.3 20-20.7 20c-11.2 0-20.5-8.6-20.5-20zm1.4 35.7H275V352h-38.2V207.9z"></path><path d="M256 76c48.1 0 93.3 18.7 127.3 52.7S436 207.9 436 256s-18.7 93.3-52.7 127.3S304.1 436 256 436c-48.1 0-93.3-18.7-127.3-52.7S76 304.1 76 256s18.7-93.3 52.7-127.3S207.9 76 256 76m0-28C141.1 48 48 141.1 48 256s93.1 208 208 208 208-93.1 208-208S370.9 48 256 48z"></path></svg></div>`}
                            </li>
                          </div>`).join('')
                        }
                    </ul> 
                </div>
            </div>
        `;
    };


    const buildPopupHTML = (activeDuration) => {
        return `
            <div class="pricing_country_text">
                <p class="heading">
                    Pricing curated just for you
                    ${(location_info) ? `
                            <span class="country_block" style="display: flex; align-items: center; justify-content: center;">
                                <img 
                                    src="https://flagcdn.com/160x120/${location_info.name_code.toLowerCase()}.webp" 
                                    alt="flag"
                                    crossorigin="anonymous"
                                />
                                <span class="country_name">${location_info.name}</span>!
                            </span>` : `<span>!</span>`
                    }
                </p>
            </div>
            <div class="header-wrapper">
                <div class="pricing-popup-header">
                    ${Object.keys(durationMap).map(duration => `
                        <div class="pricing-popup-duration ${duration === activeDuration ? 'active' : ''}" data-duration="${duration}">
                            <span>${durationMapTranslated[duration]}</span>
                        </div>
                    `).join('')}
                    <div class="pricing-popup-close">&times;</div>
                </div>
            </div>
            <div class="pricing-popup-body">
                ${createPlanHTML('Basic', 'basic', activeDuration)}
                ${createPlanHTML('Advance', 'advance', activeDuration)}
            </div>
            <div class="footer-note">
                <p>By subscribing, you agree to auto-deductions every month according to your plan type which will extend your plan type by a month.</p>
                <span>By purchasing the premium plan, you agree to our Terms and Service and Privacy Policy.</span>
            </div>
        `;
    };

    const pricing_popup = $('<div>', { class: 'pricing-popup prime_content_popup', id: 'pricing-popup' });
    pricing_popup.html(buildPopupHTML('12 Months'));
    $('body').append(pricing_popup);
    addAppBackdrop();

    // Change duration
    $('body').on('click', '.pricing-popup-duration', function () {
        const selectedDuration = $(this).data('duration');
        $('.pricing-popup').html(buildPopupHTML(selectedDuration));
    });

    // Close popup
    $('body').on('click', '.pricing-popup-close', function () {
        $('#pricing-popup').remove();
        removeAppBackdrop();
    });

    const featuresDescription = {
                UnlimitedMessaging: {
                    description: 'Broadcast to multiple chats at once, effortlessly scaling your communication. No need for template approvals and extra fees.'
                },
                AllFreeFeatures: {
                    description: 'Unlimited Broadcasting, Attachment, Message Customization, Chat Support, Save Message Template, Detailed Delivery Report'
                },
                SendAttachments: {
                    description: 'You can attach and send images, documents, videos, etc. along with your message to users'
                },
                MessageCustomization: {
                    description: 'You can customize your message according to the customer with their name, email, order number, etc'
                },
                ChatSupport: {
                    description: 'You can click on \'Chat Support\' on the extension to get your queries resolved.'
                },
                Caption: {
                    description: 'Add a caption to your attachments'
                },
                SaveCampaignDetails: {
                    description: 'Get a detailed report of your campaigns to improve sales and utilize Prime Sender to the fullest'
                },
                SaveMessageTemplate: {
                    description: 'Use saved message template in a single click'
                },
                DetailedDeliveryReport: {
                    description: 'Get a detailed report of your campaigns to improve sales and utilize Prime Sender to the fullest'
                },
                TranslateConversation: {
                    description: 'Now you can translate your messages to any language with just a single click'
                },
                BlurConversations: {
                    description: 'Blur conversations to protect sensitive information.'
                },
                PrioritySupport: {
                    description: 'We provide priority support to our premium customers, to help them with their queries'
                },
                Nominimumtimegap: {
                    description: 'Save time and quickly send messages by reducing the time gap between messages.'
                },
                RandomTimeGap: {
                    description: 'Randomise the time gap between messages'
                },
                Batching: {
                    description: 'Send your messages in batches and add a time interval between the batches'
                },
                StopCampaign: {
                    description: 'Ability to stop messaging mid-campaign'
                },
                GroupContactsExport: {
                    description: 'Download unsaved contacts from groups'
                },
                QuickReplies: {
                    description: 'You can respond to your customers quickly, with pre-saved responses'
                },
                PauseCampaign: {
                    description: 'Ability to resume messaging mid-campaign'
                },
                MultipleAttachments: {
                    description: 'You can attach and send multiple images, documents, videos, etc. along with your message to users at once'
                },
                Schedule: {
                    description: 'You can schedule at what time to send your messages to users and your messages would be sent automatically at the set time'
                },
                BusinessChatLink: {
                    description: 'Generate a link to your WhatsApp number\'s chat and let customers directly connect with you'
                },
                ExportUnsavedChatContacts: {
                    description: 'Download unsaved chat contacts'
                },
                MeetZoomSupport: {
                    description: 'Support for meet and zoom integration'
                },
                ExportUnsavedContacts: {
                    description: 'Export unsaved contacts from chats'
                },
                GroupMessage: {
                    description: 'Send messages to groups'
                },
                CustomizableTimeGap: {
                    description: 'Customize the time gap between messages'
                }
        }     
    function createTooltip(targetEl, text) {
        const tip = document.createElement('div');
        tip.className = 'feature-tooltip';
        tip.textContent = text;

        targetEl.appendChild(tip);
        return tip;
    }

    setInterval(() => {
        document.querySelectorAll('.i-svg').forEach(div => {
            div.addEventListener('mouseenter', () => {
                const key = div.id.replace(/\s+/g, '');
                const feature = featuresDescription[key];
                // Remove any existing tooltip first (defensive)
                if (div._tooltipEl && div._tooltipEl.remove) div._tooltipEl.remove();
                div._tooltipEl = createTooltip(div, feature.description);
            });
            div.addEventListener('mouseleave', () => {
                // clear on hover out (optional)
                if (div._tooltipEl && div._tooltipEl.remove) {
                    div._tooltipEl.remove();
                    div._tooltipEl = null;
                }
            });
        });
    }, 100);
}

function show_loader_and_close_popup(popup_name, delay, next_popup = false) {
    $(`#close_${popup_name}_popup`).addClass('loading').html('');
    setTimeout(() => {
        $(`#${popup_name}_popup`).remove();

        if(next_popup) {
            success_popup(next_popup);
        }
    }, delay)
}

// Common function to display all plan "start/reminder/expired" popups
async function display_popup(popup_name, date_diff) {
    closeAllPopups();
    
    // Remove old_popup if it's exists - no longer needed as closeAllPopups handles it
    // const old_popup = $(`#${popup_name}_popup`);
    // if (old_popup) {
    //     $(`#${popup_name}_popup`).remove();
    // }

    // Create new popup element
    const popup_html = await create_popup_html(popup_name, date_diff);
    const new_popup = $('<div>').html(popup_html).attr({ class: `${popup_name}_popup trial_popup prime_content_popup`, id: `${popup_name}_popup` });
    $('body').append(new_popup);
    addAppBackdrop()

    // On close button click
    $(`#close_${popup_name}_popup`).on('click', function (event) {
        if(popup_name === 'advance_promo_start') {
            show_loader_and_close_popup(popup_name, 1000, 'advance_promo_activated');
            return;
        }

        $(`#${popup_name}_popup`).remove();
        removeAppBackdrop()
        trackCloseButtonClick(`${popup_name}_popup_close`);
    });

    $('.popup-btn').on('click', function (event) {
        let buttonType = $(this).attr('buttonType');
        if (buttonType && buttonType.length > 0) {
            trackButtonClick(`${popup_name}_popup_${buttonType}_button`)
        }
    });

    // Track Popup view event
    trackButtonView(`${popup_name}_popup`);
}

async function success_popup(success_popup_name) {
    closeAllPopups();
    
    // Get data for success popup
    const data = SUCCESS_POPUP_DATA[success_popup_name];
    const description = data.description.replace('Advance Premium', '<strong>Advance Premium</strong>');

    // Create new success popup
    const popup_html = `
        <div class="${success_popup_name}_content success_content" style="background: ${data.background_color}">
            ${data.close_button ? `<span class="CtaCloseBtn popup-close-btn" id="close_${success_popup_name}_popup"><img src=${close_img_src} /></span>` : ''}
            <div class="popup-header">
                <img class="${data.icon}" src=${window[data.icon]} />
            </div>
            <div class="popup-center">
                <p class="trial_big_title heading">${data.title}</p>
                <p class="trial_title">${description}</p>
                ${data.action_button ? `<div id="${data.action_button.id}" class="popup-btn CtaBtn ${data.action_button.class}" buttonType="okay">${data.action_button.text}</div>` : ''}
            </div>
        </div>
    `;

    const new_popup = $('<div>').html(popup_html).attr({ class: `${success_popup_name}_popup success_popup prime_content_popup`, id: `${success_popup_name}_popup` }).css('width', 'min(400px, 95%)');
    $('body').append(new_popup);
    addAppBackdrop()

    // On close button click
    $(`#close_${success_popup_name}_popup`).on('click', function (event) {
        $(`#${success_popup_name}_popup`).remove();
        removeAppBackdrop()
        trackCloseButtonClick(`${success_popup_name}_popup_close`);
    });

    $('.popup-btn').on('click', function (event) {
        let buttonType = $(this).attr('buttonType');
        if (buttonType && buttonType.length > 0) {
            trackButtonClick(`${success_popup_name}_popup_${buttonType}_button`)
        }
    });

    // Track Popup view event
    trackButtonView(`${success_popup_name}_popup`);
}

// Close Reminder Popup if user clicks outside of it
document.addEventListener('click', (event) => {
    if(document.querySelector('.trial_popup')) {
        let popup = document.querySelectorAll('.trial_popup')[0];
        const isBuyAnnualPopup= popup.classList.contains('buy_annual_popup');
        if(!popup.contains(event.target)) {
            document.body.removeChild(popup);
            removeAppBackdrop()
            if(isBuyAnnualPopup){
                chrome.storage.local.set({'lastShownAnnualPopup': formatToIsoDate(new Date())});
            }
        }
    }
    if(document.querySelector("#export_options")){
        let popup = document.querySelector("#export_options");
        let icon = document.querySelector(".download_unsaved_contacts_icon")
        if(!popup.contains(event.target) && event.target !== icon){
            popup.remove()
        }
    }
    if(document.querySelector("#blur_dropdown")){
        let popup = document.querySelector("#blur_dropdown");
        let icon = document.querySelector(".blur_contacts_icon")
        if(!popup.contains(event.target) && event.target !== icon){
            popup.remove()
        }
    }
    if(document.querySelector("#prime_profile_popup")){
        let popup = document.querySelector("#prime_profile_popup");
        let icon = document.querySelector(".prime_profile_icon");
        if(!popup.contains(event.target) && event.target !== icon){
            popup.remove()
        }
    }
    if(!document.querySelector("#edit_quick_reply_popup") && !document.querySelector('.trial_popup') && !document.querySelector("#pricing-popup") && !document.querySelector("#multiple-accounts-popup")&& !document.querySelector("#multiple-account-popup") && !document.querySelector("#plan-pricing-popup") && !document.querySelector("#final-multiple-account-popup")){
        removeAppBackdrop();
    }
    if(document.querySelector("#review_popup") && !document.querySelector("#review_popup").contains(event.target)){
        addAppBackdrop();
    }
    if(document.querySelector(".show_multiple_users") && document.querySelector(".show_multiple_users").contains(event.target)){
        show_pricing_for_multiple_accounts()
    }
    if(document.querySelector(".show-basic-popup") && document.querySelector(".show-basic-popup").contains(event.target)){
        show_plan_pricing_popup("basic")
    }
    if(document.querySelector(".show-advance-popup") && document.querySelector(".show-advance-popup").contains(event.target)){
        show_plan_pricing_popup("advance")
    }
    if(document.querySelector("#show_pricing_popup") && document.querySelector("#show_pricing_popup").contains(event.target)){
        show_pricing_popup()
    }
})

document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
        if (document.querySelector("#edit_quick_reply_popup")) {
            document.body.removeChild(document.querySelector("#edit_quick_reply_popup"));
            removeAppBackdrop();
        }
    }
});

async function multipleAccountButton() {
    let country_name = getCountryNameWithSpecificPricing();

    if (RUNTIME_CONFIG.useOldPricingLinks){
        return `<a href="${RUNTIME_CONFIG.basePricingUrl}multiple-account" target="_blank" class="popup-btn pricing-purple-btn CtaBtn">
        <span style="white-space:nowrap;">Buy multiple users<br/></span>
        <span style="white-space:nowrap; color: #fff; font-size: 14px; line-height: 16px;font-weight:bold;display:flex;"><span style="margin-right:3px;">@</span>
            ${country_name === 'india' ? '<span class="rupee">₹</span>' : ''}
            <span class="price_class">${MULT25ACCOUNTPRICE[country_name]}</span>/month
        </span>
        ${(country_name === 'international' && location_info?.currency != 'USD') ?
            `<span style="white-space:nowrap; color: #fff; font-size: 12px; line-height: 16px;font-weight:bold;"> 
        (~<span class="price_class">${await convertPriceToLocale(MULT25ACCOUNTPRICE[country_name].substring(1))}</span>/month)
        </span>` : ''
        }
    </a>`;
    } else {
        return `<span class="show_multiple_users" style="white-space:nowrap;">Buy multiple users<br/></span>
        <span style="white-space:nowrap; color: #fff; font-size: 14px; line-height: 16px;font-weight:bold;display:flex;"><span style="margin-right:3px;">@</span>
            ${country_name === 'india' ? '<span class="rupee">₹</span>' : ''}
            <span class="price_class">${MULT25ACCOUNTPRICE[country_name]}</span>/month
        </span>
        ${(country_name === 'international' && location_info?.currency != 'USD') ?     
            `<span style="white-space:nowrap; color: #fff; font-size: 12px; line-height: 16px;font-weight:bold;"> 
        (~<span class="price_class">${await convertPriceToLocale(MULT25ACCOUNTPRICE[country_name].substring(1))}</span>/month)
        </span>` : ''
        }`;
    }
}

// for basic button always take the user to the pricing page
async function basicButton(pricing_link = "", basicPrice = "", basicConvertedPrice = "", showPrice = true, convertToSpan = false) {
    let country_name = getCountryNameWithSpecificPricing();
    let converted_price = basicConvertedPrice;
    if (!basicConvertedPrice || basicConvertedPrice === "") {
        converted_price = await convertPriceToLocale(basicPrice.substring(1));
    }

    // Tag & attributes based on convertToSpan
    const tag = convertToSpan ? 'span' : 'a';
    const extraAttrs = convertToSpan 
        ? `class="popup-btn pricing-white-btn CtaBtn show-basic-popup" style="font-weight:bold;"`
        : `href="${pricing_link}" target="_blank" class="popup-btn pricing-white-btn CtaBtn" style="font-weight:bold;" buttonType="basic"`;

    return `<${tag} ${extraAttrs}>
        Buy Basic
        ${showPrice ? `<br/>
            <span style="white-space:nowrap; color: #009a88; font-size: 14px; line-height: 16px;font-weight:bold;display:flex;">
                <span style="margin-right:3px;">@</span> 
                ${country_name === 'india' ? '<span class="rupee">₹</span>' : ''}
                <span class="price_class">${basicPrice}</span>/month
            </span>
            ${(country_name === 'international' && location_info?.currency != 'USD') ?
                `<span style="white-space:nowrap; color: #009a88; font-size: 12px; line-height: 16px;font-weight:bold;">
                    (~<span class="price_class">${converted_price}</span>/month)
                </span>` : ''
            }` : ""}
    </${tag}>`;
}

// for advance button
// 1.) if it is a free trial popup then take the user to the pricing page
// 2.) else take the user to the pricing popup i.e. 
// for the premium_expired reminder popup and buy_premium_popop if the user is trying to use premium feature
function annualExpired(plan_type,annualAnnualPricingLink,annualBasicPricingLink) {
    const renewButton = `
        <a href="${plan_type === "Basic" ? annualBasicPricingLink : annualAnnualPricingLink}" target="_blank" class="popup-btn ${plan_type === "Basic"? "pricing-white-btn":"pricing-green-btn"} pricing-white-btn CtaBtn annualExpireBtn" style="font-weight:bold;" buttonType="Basic">
            <div class="shortHeading">
                <img src="${renewPlan}" class="annualExpired ${plan_type !== "Basic" && "greenToWhite"}"/><span class="expireTitle">Renew Current Plan</span>
            </div>
            
        </a>
    `;

    const upgradeButton = `
        <a href="${annualAnnualPricingLink}" target="_blank" class="popup-btn pricing-green-btn CtaBtn annualExpireBtn" style="font-weight:bold;" buttonType="advance">
            <div class="shortHeading">
                <img src="${upgradePlan}" class="annualExpired greenToWhite"/><span class="expireTitle">Upgrade to Advance</span> 
            </div>
        </a>
    `;

    return {
        renewButton,
        upgradeButton: plan_type === "Basic" ? upgradeButton : null
    };
}


async function advanceButton(pricing_link = "", advancePrice = "", advanceConvertedPrice = "", popup_name, showPrice = true, convertToSpan = false) {
    let country_name = getCountryNameWithSpecificPricing();
    let converted_price = advanceConvertedPrice;
    if (!advanceConvertedPrice || advanceConvertedPrice === "") {
        converted_price = await convertPriceToLocale(advancePrice.substring(1));
    }

    if (popup_name == 'free_trial_start' || popup_name == 'free_trial_reminder' || popup_name == 'free_trial_expired' || popup_name == 'advance_promo_activated' || popup_name == 'advance_promo_reminder') {
        btn = getFreeTrialButtonHtml();
        return btn;
    }

    // Tag & attributes based on convertToSpan
    const tag = convertToSpan ? 'span' : 'a';
    const extraAttrs = convertToSpan
        ? `class="popup-btn pricing-green-btn CtaBtn show-advance-popup" style="font-weight:bold;"`
        : `href="${pricing_link}" target="_blank" class="popup-btn pricing-green-btn CtaBtn" style="font-weight:bold;" buttonType="advance"`;

    return `<${tag} ${extraAttrs}>
        Buy Advance
        ${showPrice ? `<br/>
            <span style="white-space:nowrap; font-size: 14px; line-height: 16px;font-weight:bold;display:flex;">
                <span style="margin-right:3px;">@</span>
                ${country_name === 'india' ? '<span class="rupee">₹</span>' : ''}
                <span class="price_class">${advancePrice}</span>/month
            </span>
            ${(country_name === 'international' && location_info?.currency != 'USD') ?
                `<span style="white-space:nowrap; color: #009a88; font-size: 12px; line-height: 16px;font-weight:bold;"> 
                    (~<span class="price_class">${converted_price}</span>/month)
                </span>` : ''
            }` : ""}
    </${tag}>`;
}

function getPremiumReminderButton(req_plan_type){
    let country_name = getCountryNameWithSpecificPricing();
    let pricing_link;
    if (RUNTIME_CONFIG.useOldPricingLinks) {
        pricing_link = `${RUNTIME_CONFIG.basePricingUrl}?country=${country_name}&lastPlan=${last_plan_type}&currentPlan=`;
    } else {
        pricing_link = 'https://buy.stripe.com/';
    }

    let code = PRICING_PAGE_LINK[country_name][plan_duration.toLowerCase()];
    if(last_plan_type == 'FreeTrial' && req_plan_type == 'Basic'){
        if (RUNTIME_CONFIG.useOldPricingLinks) {
            pricing_link = RUNTIME_CONFIG.basePricingUrl;
        } else {
            show_pricing_popup();
        }
    } else if(req_plan_type == 'Advance'){
        pricing_link += RUNTIME_CONFIG.useOldPricingLinks ? "advance" : code.advance;
    } else {
        pricing_link += RUNTIME_CONFIG.useOldPricingLinks ? "basic" : code.basic;
    }
    return `<a href="${pricing_link}" target="_blank" class="popup-btn pricing-green-btn CtaBtn" buttonType="${req_plan_type.toLowerCase()}">
            Buy ${req_plan_type}
        </a>`;
}

async function premium_reminder(feature, req_plan_type, title = '') {
    closeAllPopups();
    
    if(!feature) feature = 'default';

    let body = document.querySelector('body');
    let popup = document.createElement('div');
    let modal_content = document.createElement('div');

    let popup_button = getPremiumReminderButton(req_plan_type);
    let reminder_title;
    if((plan_type == 'Expired' && last_plan_type == 'AdvancePromo')|| (plan_type == 'Expired' && last_plan_type == 'FreeTrial')){
        reminder_title = "Your Free trial for PREMIUM features has expired!";
    }
    else{
        reminder_title = title ? title : PREMIUM_REMINDER[feature].title
    }
    let reminder_description = `Please buy <<${req_plan_type} Plan>> ${PREMIUM_REMINDER[feature].description}`;


    popup.className = 'premium_reminder_popup trial_popup prime_content_popup';

    modal_content.className = 'premium_reminder_content trial_content';
    modal_content.innerHTML = `
        <span id="close_premium_reminder_popup">
            <img class="CtaCloseBtn premiumFeatureCloseBtn" src="${close_img_src}" alt="x">
        </span>
        <div class="premium_reminder_popup_title">
            <span class="oops_icon"></span>Oops!
        </div>
        <div class="reminder_title">
            ${await translate(reminder_title)}
        </div>
        <div class="reminder_description">
            ${await translate(reminder_description)}
        </div>
        <div style="display:flex;justify-content:center;gap:20px;width:100%;margin-bottom:20px;">
            ${popup_button}
        </div> 
        `;
    popup.appendChild(modal_content);
    body.appendChild(popup);
    addAppBackdrop()

    let closePopupBtn = document.getElementById("close_premium_reminder_popup");
    closePopupBtn.addEventListener("click", function () {
        body.removeChild(popup);
        removeAppBackdrop()
        trackCloseButtonClick('premium_feature_buy_popup_close');
    });
    
    $('.popup-btn').on('click', function (event) {
        let buttonType = $(this).attr('buttonType');
        if (buttonType && buttonType.length > 0) {
            trackButtonClick(`premium_feature_buy_popup_${buttonType}_button`)
        }
    });

    trackButtonView('premium_feature_buy_popup');
}

async function chat_link(){
    closeAllPopups();
    
    var chat_link_div = document.getElementsByClassName("chat_link_popup")[0];
    if(!chat_link_div) {
        let chat_link_title = await translate('Generate WhatsApp chat link for your number');
        let chat_link_desc = await translate('Enter the pre-set message that you would receive when your customer clicks on the link');

        let modal_content_html = `
        <span id="close_chat_link_popup" style="position: absolute;top: 6px;right: 6px;font-size: 20px;width:14px"><img  class="CtaCloseBtn premiumFeatureCloseBtn" src="${close_img_src}" style="width: 100%;" alt="x"></span>
        <div class="chat_link_title">${chat_link_title}</div>
        <div class="chat_link_desc">${chat_link_desc} (Optional)</div>
        <textarea style="width: 460px;height: 64px;padding: 8px;" type="text" id="add_chat_message"></textarea>
        <div id="generate_chat_link" class="popup-btn action-green-btn pricing-green-btn CtaBtn">Generate</div>
        `
        
        let modal_content = document.createElement('div');
        modal_content.className = 'chat_link_content trial_content';
        modal_content.innerHTML = modal_content_html;

        let popup = document.createElement('div');
        popup.className = 'chat_link_popup trial_popup prime_content_popup';
        popup.style.width = 'min(550px, 95%)';
        popup.appendChild(modal_content);

        var body = document.querySelector('body');
        body.appendChild(popup);
        addAppBackdrop();
        document.getElementById("close_chat_link_popup").addEventListener("click", function (event) {
            document.getElementsByClassName("chat_link_popup")[0].style.display = 'none';
            removeAppBackdrop();
            trackCloseButtonClick('business_chat_link_popup_close');
        });
        document.getElementById("generate_chat_link").addEventListener("click", function (event) {
            removeAppBackdrop();
            if(isAdvanceFeatureAvailable()) {
                var message = document.getElementById("add_chat_message").value;
                var text = "https://wa.me/"+my_number;
                if(message !== '') {
                    message = encodeURIComponent(message);
                    text += "?text="+message;
                }
                navigator.clipboard.writeText(text).then(function () {
                    alert("Chat link generated and copied: " + text);
                });
                document.getElementsByClassName("chat_link_popup")[0].style.display = 'none';
                trackButtonClick('generate_business_chat_link_premium');
            }
            else{
                document.getElementsByClassName("chat_link_popup")[0].style.display = 'none';
                premium_reminder('business_chat_link', 'Advance');
            }
            trackButtonClick('generate_business_chat_link');
        });
    }
    else
        chat_link_div.style.display = 'block';

    document.querySelector('.chat_link_title').innerText = await translate('Generate WhatsApp chat link for your number');
    document.querySelector('.chat_link_desc').innerText = await translate('Enter the pre-set message that you would receive when your customer clicks on the link (Optional)');
    trackButtonView('business_chat_link_popup');
}

async function review_popup(){
    if (!RUNTIME_CONFIG.displayReviewPopup || !showReviewPopup) {
        return;
    }
    closeAllPopups();

    // No longer needed as closeAllPopups will handle this
    // if(document.querySelector('#review_popup')) {
    //     body.removeChild(document.querySelector('#review_popup'));
    // }
    let review_desc = await translate("Just take a second to share your positive review :)");
    let modal_content_html = `
        <div class="rheader" alt="">
            <img class="smile_icon" src=`+smile_icon+`></img>
            <h2 id="review_popup_title">Enjoying Prime Sender?</h2>
        </div>
        <div class="rcenter">
            <div class="rtop" id="review_popup_desc">${review_desc}</div>
            <div class="rbottom">
                <div id="notNowBtn" class="popup-btn action-white-btn CtaBtn">Not Now</div>
                <div id="reviewBtn" class="popup-btn action-green-btn CtaBtn">
                    <a style="width: 100%; height: 100%; display: flex; justify-content: center; align-items: center; font-weight: bold;" href="${RUNTIME_CONFIG.reviewUrl}" target="_blank">Rate us 5 <span style="font-size: 14px; line-height: 0; margin-left: 3px;">★</span></a>
                </div>
            </div>
        </div>
        ${create_footer_html()}
    `
    
    let modal_content = document.createElement('div');
    modal_content.className = 'review_popup_content trial_content';
    modal_content.style.background = '#62d9c7';
    modal_content.innerHTML = modal_content_html;

    let popup = document.createElement('div');
    popup.className = 'review_popup prime_content_popup';
    popup.id = 'review_popup';
    popup.appendChild(modal_content);

    var body = document.querySelector('body');
    body.appendChild(popup);
    addAppBackdrop()

    document.querySelector("#notNowBtn").addEventListener("click",()=>{
        body.removeChild(popup);
        removeAppBackdrop()
        trackButtonClick('review_popup_not_now_button');
    })
    document.querySelector("#reviewBtn").addEventListener("click",()=>{
        body.removeChild(popup);
        removeAppBackdrop()
        localStorage.setItem("rvisited",1);
        chrome.storage.local.set({ rated_5_star: true });
        trackButtonClick('review_popup_review_button');
    })
    trackButtonView('review_popup');
}

// Invoice Feature
// formatting the date
// function formatDate(inputDate) {
//     const dateParts = inputDate.split('/');
//     const day = parseInt(dateParts[1]);
//     const month = parseInt(dateParts[0]) - 1;
//     const year = parseInt(dateParts[2]);
//     const formattedDate = new Date(year, month, day);
//     const options = { year: 'numeric', month: 'short', day: 'numeric' };
//     const formattedDateString = formattedDate.toLocaleDateString('en-US', options);
//     const splittedDate= formattedDateString.split(' ');
//     let returnDateString= `${splittedDate[0]}, ${splittedDate[2]}`
//     return returnDateString;
// }

// sorting dates in descending order
// function sortDatesDescending(dateArray) {
//     return dateArray.sort(function (a, b) {
//         const datePartsA = a.date.split('/').map(Number);
//         const datePartsB = b.date.split('/').map(Number);

//         const dateA = new Date(datePartsA[2], datePartsA[0] - 1, datePartsA[1]);
//         const dateB = new Date(datePartsB[2], datePartsB[0] - 1, datePartsB[1]);

//         return dateB - dateA;
//     });
// }

// call this function if you want to show a popup only if there are no other popup on the screen
function callIfNoOtherPopups(showPopupFun) {
    const checkPopupInterval = setInterval(() => {
        const trialPopup = document.querySelector('.trial_popup');
        const successPopup = document.querySelector('.success_popup');
        const howToUsePopup = document.querySelector('.how_to_use_popup');
        const buyAnnualPopup = document.querySelector("#buy_annual_popup");
        const sidebar = getDocumentElement('side_panel');
        
        if (!trialPopup && !successPopup && !buyAnnualPopup && !howToUsePopup && sidebar) {
            clearInterval(checkPopupInterval);
            showPopupFun();
        }
    }, 100);
}

// getting dates from the api and saving it in the local storage
const getDates = async (user_email) => {
  try {     
    let url = `${AWS_API.GET_INVOICE_DATES}?email=${user_email}&phone=${my_number}`;
    const res = await fetch(url);
    const data = await res.json();

    // ✅ Example response:
    // [{date: "September 8, 2025", id:"pi_3RxE2TSGarUwHS3u0eqRMja5"}]

    chrome.storage.local.set({ 'invoiceObject': data });
  } catch (error) {
    trackError("get_invoice_dates_api_error", error);
    console.error(error);
  }
};

const howToUseData= [
    {
        image: how_to_use1,
        content: "Click on the ‘Extensions’ icons at the top right of the chrome window",
        index: 1,
        hasPrev: false,
        hasNext: true,
    },
    {
        image: how_to_use2,
        content: "Pin the Prime sender extension icon by clicking on the pin button ",
        index: 2,
        hasPrev: true,
        hasNext: true,
    }, {
        image: how_to_use3,
        content: "Start using the extension by clicking on the Prime Sender extension icon",
        index: 3,
        hasPrev: true,
        hasNext: true,
    }
]

function changeNavigationColor(index){
    if(index==0){
        if(document.querySelector(".nav_line_1").classList.contains("active_line_class")){
            document.querySelector(".nav_line_1").classList.remove("active_line_class");
        }
        if(document.querySelector(".nav_num_2").classList.contains("active_num_class")){
            document.querySelector(".nav_num_2").classList.remove("active_num_class");
        }
        if(document.querySelector(".nav_line_2").classList.contains("active_line_class")){
            document.querySelector(".nav_line_2").classList.remove("active_line_class");
        }
        if(document.querySelector(".nav_num_3").classList.contains("active_num_class")){
            document.querySelector(".nav_num_3").classList.remove("active_num_class");
        }
    }
    if(index==1){
        if(!document.querySelector(".nav_line_1").classList.contains("active_line_class")){
            document.querySelector(".nav_line_1").classList.add("active_line_class");
        }
        if(!document.querySelector(".nav_num_2").classList.contains("active_num_class")){
            document.querySelector(".nav_num_2").classList.add("active_num_class");
        }
        if(document.querySelector(".nav_line_2").classList.contains("active_line_class")){
            document.querySelector(".nav_line_2").classList.remove("active_line_class");
        }
        if(document.querySelector(".nav_num_3").classList.contains("active_num_class")){
            document.querySelector(".nav_num_3").classList.remove("active_num_class");
        }
    }
    if(index==2){
        if(!document.querySelector(".nav_line_2").classList.contains("active_line_class")){
            document.querySelector(".nav_line_2").classList.add("active_line_class");
        }
        if(!document.querySelector(".nav_num_3").classList.contains("active_num_class")){
            document.querySelector(".nav_num_3").classList.add("active_num_class");
        }
    }
}

function howToUsePopup() {
    
    const parentDiv =document.createElement("div");
    parentDiv.className = "how_to_use_popup";

    const pointsHtml= howToUseData.map((d) => `
        <div class="how_to_use_text">
            <p class="ins_number">${d.index}</p>
            <p class="ins_text">${d.content}</p>
        </div>
    `).join("");

    const popupHtml= `
        <div class="how_to_use_container">
            <div class="how_to_use_header">
                <div class="how_to_use_title">
                    <img style="width: 50px; margin-right:10px;" src=${bulb_icon} alt="" />
                    <p>How to use</p>
                </div>
                <div class="how_to_use_logo">
                    <img class="how_to_use_logo_img" src="${logo_img}"/>
                    <img class="how_to_use_logo_text" src="${logo_text}"/>
                </div>
            </div>
            <div class="how_to_use_body">
                <div class="how_to_use_points" style="flex:1; display:flex; flex-direction:column; gap:20px;">
                    ${pointsHtml}
                </div>
                <div class="how_to_use_image" style="flex:1;">
                    <img src="${how_to_use1}" alt="how to use" />
                </div>
            </div>
            <div class="how_to_use_buttons">
                <div class="how_to_use_button navigation_close_button CtaBtn" style="padding:13px 30px;">
                    Close
                </div>
            </div>
        </div>
    `;

    parentDiv.innerHTML= popupHtml;
    document.body.appendChild(parentDiv);

    document.querySelector(".navigation_close_button").addEventListener("click",()=>{
        document.body.removeChild(parentDiv);
        chrome.storage.local.set({'showHowToUsePopup': false})
    })

    trackButtonView('how_to_use_popup');
}

function showHowToUsePopup() {
    chrome.storage.local.get(['showHowToUsePopup', 'no_of_visit'], (res) => {
        let visit_count = res.no_of_visit || 0;
        if (res.showHowToUsePopup == false) {
            return;
        }
        if (visit_count == 0) {
            chrome.storage.local.set({ "showHowToUsePopup": true })
        }
        howToUsePopup();
    })
}

// old buy annual popup
/*
async function buyAnnualPopup(){
    if(document.querySelector('#buy_annual_popup')) {
        body.removeChild(document.querySelector('#buy_annual_popup'));
    }

    let country_name = getCountryNameWithSpecificPricing();
    let countryPricing = PRICING[country_name];
    let priceToBeShown = plan_type == 'Advance' ? countryPricing.monthly.advance_plan.original : countryPricing.monthly.basic_plan.original;
    let currency_symbol = country_name == 'india' ? '' : countryPricing.currency_symbol;
    let basePrice = priceToBeShown * 2;
    if (mult_acc_numbers.length > 0) {
        basePrice *= mult_acc_numbers.length;
    }

    priceToBeShown = currency_symbol + basePrice;
    let exchangedPrice = await convertPriceToLocale(basePrice);


    const pricing_page_link = 'https://buy.stripe.com/'+PRICING_PAGE_LINK[country_name].annually[plan_type.toLowerCase()];

    const modal_content_html = `
        <div class="buy_annual_top_section">
            <span id="buy_annual_close_icon" class="CtaCloseBtn" style="position: absolute;top: 6px;right: 6px;font-size: 20px;width:14px"><img  class="CtaCloseBtn" src=${close_img_src} style="width: 100%;" alt="x"></span>
            <div class="buy_annual_heading">
                <div class="buy_annual_image">
                    <img src=${man_thinking} alt="img" />
                </div>
                <div class="buy_annual_heading_text">
                    <p class="buy_annual_first_line">
                        ${mult_acc_numbers.length > 0 ? "Your organization could save" : "You could save almost"} <span class="rupee">${country_name == 'india' ? '₹' : ''}</span>${priceToBeShown}!
                        ${(country_name === 'international' && location_info.currency != "USD") ? `<span class="converted_price_class">(~${exchangedPrice})</span>` : ""}</p>
                    <p class="buy_annual_second_line">Wondering how?</p>
                </div>
            </div>
            <div class="buy_annual_advice">
                <div class="buy_annual_advice_text">
                    <img  style="width:25px; height:25px;" src=${cross_icon_src} alt="" />
                    <p>You've been using the monthly plan which is overall <span style="font-weight:bold;">expensive!</span></p>
                </div>
                <div class="buy_annual_advice_text">
                    <img  style="width:25px; height:25px;" src=${check_icon_src} alt="" />
                    <p>Simply buy the <span style="font-weight:bold;">Annual Plan</span> and get <span style="font-weight:bold;">2 months FREE!</span></p>
                </div> 
            </div>
            <div class="buy_annual_recommendation"></div>
        </div>
        <div class="buy_annual_timer_strip">
            <div class="buy_annual_timer_container">
                <div class="buy_annual_timer_img">
                    <img src="${hourglass_gif}" class="hourGlass" alt="gif"/>
                </div>
                <div class="buy_annual_timer_counter">
                    <p>
                        Only <span class="buy_annual_counter" style="font-weight:bold;">4 days, 14 hrs, 57 sec </span> <span style="margin:2px;"></span> left <br /> to avail the offer
                    </p>
                </div>
            </div>
        </div>
        <div class="buy_annual_button_section">
            <a href=${pricing_page_link} target="_blank" class="buy-annual-popup-btn" buttonType="${plan_type.toLowerCase()}_annual">
                <span class="annual_button_top_span"><img src="${yellow_star}" style="width:15px;"/>Save 40% with</span>
                <span style="font-weight:bold;">${plan_type} Annual</span>
            </a>
        </div>
        ${create_footer_html()}
    `;

    let modal_content = document.createElement('div');
    modal_content.className = 'buy_annual_popup_content trial_content';
    modal_content.style.background = '#d3d3d3';
    modal_content.innerHTML = modal_content_html;

    let popup = document.createElement('div');
    popup.className = 'buy_annual_popup trial_popup';
    popup.id = 'buy_annual_popup'
    popup.appendChild(modal_content);

    let body = document.querySelector('body');
    body.appendChild(popup);
    addAppBackdrop()

    let close_popup_btn = document.getElementById("buy_annual_close_icon");
    close_popup_btn.addEventListener("click", () => {
        body.removeChild(popup);
        removeAppBackdrop()
        chrome.storage.local.set({'lastShownAnnualPopup': formatToIsoDate(new Date())});
        trackCloseButtonClick('buy_annual_popup_close');
    })
    $('.buy-annual-popup-btn').on('click', function (event) {
        let buttonType = $(this).attr('buttonType');
        if (buttonType && buttonType.length > 0) {
            trackButtonClick(`buy_annual_popup_${buttonType}_button`)
        }
    });

    changeCounterTime();
    handleAnnualPopupCounter();

    trackButtonView('buy_annual_popup');
}
*/

// New buyAnnualPopup 
async function buyAnnualPopup(days_left) {
    closeAllPopups();
    
    let country_name = getCountryNameWithSpecificPricing();
    let countryPricing = PRICING[country_name];
    let priceToBeShown = plan_type == 'Advance' ? countryPricing.monthly.advance_plan.original : countryPricing.monthly.basic_plan.original;
    let currency_symbol = country_name == 'india' ? '' : countryPricing.currency_symbol;
    let basePrice = priceToBeShown * 2;
    if (mult_acc_numbers.length > 0) {
        basePrice *= mult_acc_numbers.length;
    }
    priceToBeShown = currency_symbol + basePrice;
    
    const pricing_page_link = 'https://buy.stripe.com/'+PRICING_PAGE_LINK[country_name].annually[plan_type.toLowerCase()];

    const popup_html = `
        <div class="new_buy_annual_popup_content trial_content" style="background: linear-gradient(180deg, #FFBF00 0%, #ffffff 100%); display: flex; flex-direction: column; padding-top: 20px; ">
            <div class="popup-header">
                <div class="new_buy_annual_popup_heading">
                    <div class="new_buy_annual_popup_heading_text">
                        <div class="trial_big_title heading new_buy_annual_popup_bold" style="font-size: 21px; margin-bottom: 0px; white-space: nowrap; color: #4F2926;">
                            <p>Save <span class="rupee">${country_name == 'india' ? '₹' : ''}</span>${priceToBeShown} instantly - Upgrade to Annual<p>
                        </div>
                        <div class="trial_title" style="font-size: 14px; margin-bottom: 0px; text-align: center; color: #4F2926;">
                            <strong>Annual Plan is 40% cheaper</strong> than the monthly plan!
                        </div>
                    </div>
                </div>
            </div>

             <div class="popup-center" style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding-bottom: 20px; position: relative;">
                         <div class="new_buy_annual_popup_image" style="position: absolute; left: 0; bottom: 0;">
                             <img src="${money_investment}" alt="money investment" style="width: 120px; height: 120px; transform: scaleX(-1);" />
                         </div>
                        <div class="buy_annual_button_section">
                            <a href="${pricing_page_link}" target="_blank" class="buy-annual-popup-btn" buttonType="${plan_type.toLowerCase()}_annual">
                                <span class="annual_button_top_span"><img src="${white_star}" style="width:15px;"/>Upgrade & Save 40% with</span>
                                <span style="font-weight:bold;">${plan_type} Annual</span>
                            </a>
                        </div>
                        <div class="new_buy_annual_popup_info_lines" style="margin-top: 15px; display: flex; flex-direction: column; gap: 8px; padding-bottom: 20px;">
                            <div class="new_buy_annual_popup_days_left" style="font-size: 16px; color: #4F2926; text-align: center; margin-bottom: 0px; display: flex; align-items: center; justify-content: center; gap: 8px; font-weight: bold;">
                                <img src="${stopwatch_brown}" alt="stopwatch" style="width: 16px; height: 16px;" />
                                Only ${days_left} ${days_left > 1 ? 'days' : 'day'} left
                            </div>
                            <div class="new_buy_annual_popup_user_stats" style="font-size: 16px; color: #4F2926; text-align: center; display: flex; align-items: center; justify-content: center; gap: 8px; font-weight: bold;">
                                <img src="${multiple_users_brown}" alt="multiple users" style="width: 16px; height: 16px;" />
                                68% of users like you chose Annual
                            </div>
                        </div>
                    </div>
        </div>
    `;
    
    const new_popup = $('<div>').html(popup_html).attr({ class: 'new_buy_annual_popup_popup trial_popup prime_content_popup', id: 'buy_annual_popup' });
    $('body').append(new_popup);
    addAppBackdrop();

    $('#close_new_buy_annual_popup_popup').on('click', function (event) {
        $('#buy_annual_popup').remove();
        removeAppBackdrop();
        chrome.storage.local.set({'lastShownAnnualPopup': formatToIsoDate(new Date())});
        trackCloseButtonClick('buy_annual_popup_close');
    });

    $('.buy-annual-popup-btn').on('click', function (event) {
        let buttonType = $(this).attr('buttonType');
        if (buttonType && buttonType.length > 0) {
            trackButtonClick(`buy_annual_popup_${buttonType}_button`)
        }
    });
    
    trackButtonView('buy_annual_popup');
}

function changeCounterTime(getCounterInterval){
    const expiryDate = new Date(new Date(expiry_date).getTime() + 24 * 60 * 60 * 1000);
    const currentDate = new Date();

    let diff = expiryDate - currentDate;

    // If expiry date is in the past, set all to 0
    if (diff <= 0) {
        diff = 0;
        clearInterval(getCounterInterval);
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    let counterText = '';

    if (days > 0) {
        counterText += `${days} days, `;
    }
    counterText += `${Math.max(0, hours)} hrs, ${Math.max(0, minutes)} min, ${Math.max(0, seconds)} sec`;

    const buyAnnualCounter = document.querySelector('.buy_annual_counter');
    
    if (!buyAnnualCounter) {
        clearInterval(getCounterInterval);
        return;
    }
    
    buyAnnualCounter.innerText = counterText;
}

function handleAnnualPopupCounter() {
    const getCounterInterval = setInterval(() => {
        changeCounterTime(getCounterInterval);
    }, 1000);
}

function getMonthDifference(date1, date2) {
    const [month1, year1] = date1.split(', ');
    const [month2, year2] = date2.split(', ');

    return (parseInt(year2) - parseInt(year1)) * 12 +
        (getMonthIndex(month2) - getMonthIndex(month1));
}

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function getMonthIndex(month) {
    return monthNames.indexOf(month);
}

function formatToIsoDate(date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}-${month}-${day}`;
}

function dateDiffInDays(date1, date2) {
    if (!date1 || !date2)
        return NaN;

    const [year1, month1, day1] = date1.split('-').map(Number);
    const [year2, month2, day2] = date2.split('-').map(Number);
    const d1 = new Date(year1, month1 - 1, day1);
    const d2 = new Date(year2, month2 - 1, day2);
    const diffTime = Math.abs(d2 - d1);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

async function updateReminderPopup() {
    if(!SHOW_UPDATE_REMINDER_POPUP) return;
    
    // Remove existing popup if it exists
    if (document.querySelector('#update_reminder_popup')) {
        document.querySelector('body').removeChild(document.querySelector('#update_reminder_popup'));
    }

    let update_desc = await translate("You can either restart your Chrome to update or you can go to manage Chrome extension and update it.");
    
    let modal_content_html = `
           <div class="rheader">
            <h2 id="update_popup_title">New Version Available</h2>
        </div>
        <div class="rcenter">
            <div class="rtop" id="update_popup_desc">${update_desc}</div>
            <div class="rbottom">
                <a href="http://chrome://extensions/?id=klfaghfflijdgoljefdlofkoinndmpia" target="_blank">
                    <div id="okBtn" class="popup-btn action-green-btn CtaBtn">Update</div>
                </a>
            </div>
        </div>
        ${create_footer_html()}
    `;
    
    let modal_content = document.createElement('div');
    modal_content.className = 'update_reminder_popup_content trial_content';
    modal_content.style.background = '#62d9c7';
    modal_content.style.zIndex = '100';
    modal_content.style.width = '60%';
    modal_content.innerHTML = modal_content_html;
    modal_content.appendChild($($.parseHTML('<span id="close_update" style="position: absolute;top: 12px;right: 12px;font-size: 20px;width:14px"><img class="CtaCloseBtn" src="' + close_img_src + '" style="width: 100%;" alt="x"></span>'))[0]);

    let popup = document.createElement('div');
    popup.className = 'update_reminder_popup';
    popup.id = 'update_reminder_popup';
    popup.style.height= '100%';
    popup.style.display="flex"
    popup.appendChild(modal_content);

    document.querySelector('body').appendChild(popup);

    document.querySelector("#okBtn").addEventListener("click", () => {
        document.querySelector('body').removeChild(popup);
    });
    document.getElementById("close_update").addEventListener("click", function (event) {
        document.querySelector('body').removeChild(popup);

    });
    document.querySelector("#closePopupBtn").addEventListener("click", () => {
        document.querySelector('body').removeChild(popup);
    });
}

function getDocumentElement(key, selectAll = false) {
    try {
        if (DOCUMENT_ELEMENT_SELECTORS[key]) {
            for (const className of DOCUMENT_ELEMENT_SELECTORS[key]) {
                const element = (selectAll) ? document.querySelectorAll(className) : document.querySelector(className);
                if (element) {
                    return element;
                }
            }
        } else {
            console.log("Selector not exists:", key);
        }
    } catch (err) {
        console.log("Error while finding document element", err);
    }
    return null;
}

async function fetchConfigData() {
    try {
        const url = `${AWS_API.GET_CONFIG_DATA}?operation=get-all-config-data`
        const response = await fetch(url);
        const jsonData = await response.json();
        const allConfigData = jsonData.data;

        if (allConfigData && Array.isArray(allConfigData)) {
            const configMap = createConfigMap(allConfigData);
            loadConfigData(configMap);
            console.log(`%cConfig Data Loaded`, 'color: lightGreen; font-weight: bold; font-size: 14px;');

            chrome.storage.local.set({ 
                CONFIG_DATA: configMap,
                RUNTIME_CONFIG: RUNTIME_CONFIG 
            });
        } else {
            console.log("Config data not found. Api response:", jsonData);
        }
    } catch (err) {
        chrome.storage.local.set({ 
            RUNTIME_CONFIG: RUNTIME_CONFIG 
        });
        trackError("get_config_data_api_error", err);
        console.log("Error while fetching config data:", err);
    }
};

function createConfigMap(configArray) {
    const configMap = {};
    configArray.forEach(item => {
        if (item.name && item.data!==null) {
            configMap[item.name] = item.data;
        }
    });
    return configMap;
}

// Load AWS Config Data from API to Local Data (for content js)
function loadConfigData(configMap) {
    // Constant Arrays
    if (configMap.TRIAL_FEATURES)
        TRIAL_FEATURES = [...configMap.TRIAL_FEATURES];
    if (configMap.PREMIUM_FEATURES)
        PREMIUM_FEATURES = [...configMap.PREMIUM_FEATURES];

    // Safe Merge Objects
    if (configMap.GA_CONFIG)
        GA_CONFIG = safeMergeObject(GA_CONFIG, configMap.GA_CONFIG);
    if (configMap.PRICING_DATA)
        PRICING_DATA = safeMergeObject(PRICING_DATA, configMap.PRICING_DATA);
    if (configMap.DOCUMENT_ELEMENT_SELECTORS)
        DOCUMENT_ELEMENT_SELECTORS = safeMergeObject(DOCUMENT_ELEMENT_SELECTORS, configMap.DOCUMENT_ELEMENT_SELECTORS);
    if (configMap.MESSAGE_LIMIT) 
        MESSAGE_LIMIT = safeMergeObject(MESSAGE_LIMIT, configMap.MESSAGE_LIMIT);
    if (configMap.RUNTIME_CONFIG) {
        RUNTIME_CONFIG = safeMergeObject(RUNTIME_CONFIG, configMap.RUNTIME_CONFIG);
        if (RUNTIME_CONFIG.reloadInject) {
            chrome.storage.local.get(["location_info"],(result)=>{
                window.dispatchEvent(new CustomEvent("PRIMES::init", {
                    detail: { useOldMethod: RUNTIME_CONFIG.useOldInjectMethod, location_info : result.location_info }
                }));
            })
        }
    }
    if (configMap.PRICING) {
        PRICING = safeMergeObject(PRICING, configMap.PRICING);
    }
    if (configMap.PRICING_PAGE_LINK) {
        PRICING_PAGE_LINK = safeMergeObject(PRICING_PAGE_LINK, configMap.PRICING_PAGE_LINK);
    }
}

function safeMergeObject(target = {}, source = {}) {
    Object.keys(source).forEach(key => {
        target[key] = source[key];
    });
    return target;
}

var ban_text_detected = false;
function detectBanText() {
    if (ban_text_detected) 
        return;

    let banMessages = [
        "verify your phone number",
        "you will need to verify your phone number",
        "You have been logged out. To log back in, you will need to verify your phone number.", // English
        "आप लॉग आउट हो गए हैं। फिर से लॉग इन करने के लिए, आपको अपना फ़ोन नंबर सत्यापित करना होगा।", // Hindi
        "Você foi desconectado. Para fazer login novamente, será necessário verificar seu número de telefone.", // Brazilian Portuguese
        "Has cerrado sesión. Para volver a iniciar sesión, deberás verificar tu número de teléfono." // Spanish    
    ]

    for (const message of banMessages) {
        if (document.body.innerText.includes(message) || document.body.innerText.toLowerCase().includes(message.toLocaleLowerCase())) {
            trackSystemEvent('banned_text', banMessages);
            ban_text_detected = true;
        }
    }
}

async function messageCountOverPopup(sent_count, total_count) {
    let reminder_title = `You have ${(total_count - sent_count)} of daily ${total_count} messages remaining`;
    premium_reminder('unlimited_messages', 'Premium', reminder_title);
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

function handleShowTooltip(element){
    const parentElement = document.querySelector(element.query);
    if(parentElement){
        parentElement.addEventListener("mouseover", () => {
            showTooltip({
                elementParentClass: element.query,
                text: element.text,
                positionTop: element.top,
                positionLeft: element.left,
                positionRight: element.right,
                positionBottom: element.bottom,
            });
        });
        parentElement.addEventListener("mouseout", () => {
            removeTooltip();
        });
    }
}

async function get_email_domain(){
    const result = await new Promise((resolve) => {
    chrome.storage.local.get("customer_email", (res) => resolve(res));
  });

  let email = result.customer_email;
  return email;
}

async function s3() {
  const result = await new Promise((resolve) => {
    chrome.storage.local.get(["location_info"], (res) => resolve(res));
  });

  let customer_code = result.location_info.name_code;
  let target_location = new Set(['us', 'uk','sg','br']);
  let check = target_location.has(customer_code.toLowerCase());

  return check;
}


async function s5(){
    if (navigator.userAgentData) {
    const uaData = await navigator.userAgentData.getHighEntropyValues(["platform"]);
    return uaData.platform.toLowerCase().includes("mac");
  } else {
    // fallback
    return navigator.userAgent.toLowerCase().includes("mac");
  }
}

async function s6() {
  let campaignsSent = await weekly_successfull_campaigns_sent(true);
  let percent_campaignsSent = Math.min(campaignsSent / 25, 1);
  return percent_campaignsSent;
}

function localIsoDateString(d = new Date()) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }


async function p2p_scoring() {
    let is_premium_country = await s3();
    let is_premium_device = await s5();
    let weekly_usage = await s6();
    let email = await get_email_domain();

    let p2p_score = {
        phone: my_number,
        email: email,
        is_premium_country: is_premium_country,
        is_premium_device: is_premium_device,
        weekly_usage: weekly_usage
    };
    //pushing data
    console.log('p2p_score', p2p_score);
    let url = AWS_API.P2P_SCORING;
    let response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(p2p_score),
    });
    let data = await response.json();
    console.log('data', data);
}

async function check_p2p() {
  let last_updated_date;
  const today = new Date();
  const todayStr = localIsoDateString(today);

  if (today.getDay() !== 1) {
    return;
  } else {
    // Promisified helpers (only used internally)
    const getStorage = (key) =>
      new Promise((resolve) => {
        chrome.storage.local.get([key], (res) => resolve(res[key]));
      });

    const setStorage = (obj) =>
      new Promise((resolve) => {
        chrome.storage.local.set(obj, () => resolve());
      });


    // await the stored value, preserve your original defaulting behavior
    local_storage_value=await getStorage("p2p_rest_date")
    last_updated_date = (await getStorage("p2p_rest_date")) ?? todayStr;

    if (todayStr == last_updated_date && local_storage_value) {
      return;
    } else {
      // preserve your original write of last_updated_date to storage
      await setStorage({ p2p_rest_date: last_updated_date });
      p2p_scoring();
    }
  }
}