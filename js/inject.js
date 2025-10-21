// ======= CORE INJECT JS CODE STARTS =======
const isWhatsappLoaded = () => (document.querySelector('#pane-side') ? true : false);

const isWebpackLoaded = () => ('function' === typeof webpackJsonp || window.webpackChunkwhatsapp_web_client || window.require);

const sleep = (ms) => new Promise(res => setTimeout(res, ms));

// Custom console funtions
console.logSuccess = (message) => console.log(`%c${message}`, 'color: lightGreen; font-weight: bold; font-size: 14px;');
console.logError = (message) => console.log(`%c${message}`, 'color: red; font-weight: bold;');
console.logWarn = (message) => console.log(`%c${message}`, 'color: orange; font-weight: bold;');

// Init Store Object Function
const initStore = function (useOldMethod = true) {
    if (useOldMethod) {
        return initStoreOld();
    } else {
        return initStoreNew();
    }
}

const initStoreOld = function () {
    const inject = function () {
        return (
            (inject.mID = Math.random().toString(36).substring(7)),
            (inject.mObj = {}),
            (window.webpackChunkbuild || window.webpackChunkwhatsapp_web_client).push([
                [inject.mID],
                {},
                function (i) {
                    Object.keys(i.m).forEach(function (n) {
                        inject.mObj[n] = i(n);
                    });
                },
            ]),
            {
                modules: inject.mObj,
                constructors: inject.cArr,
                findModule: function (i) {
                    let obj = [];
                    return (
                        Object.keys(inject.mObj).forEach(function (a) {
                            let element = inject.mObj[a];
                            if (void 0 !== element)
                                if ("string" == typeof i) {
                                    if ("object" == typeof element.default)
                                        for (let e in element.default) e == i && obj.push(element);
                                    for (let e in element) e == i && obj.push(element);
                                } else {
                                    if ("function" != typeof i)
                                        throw new TypeError(
                                            "findModule can only find via string and function, " +
                                            typeof i +
                                            " was passed"
                                        );
                                    i(element) && obj.push(element);
                                }
                        }),
                        obj
                    );
                },
                get: function (i) {
                    return inject.mObj[i];
                },
            }
        );
    };

    return new Promise((resolve, reject) => {
        try {
            if (window.require && window.importDefault) {
                // Create store by importing whatsapp collection
                const e = (e) => window.require(e);
                const i = (e) => window.importDefault(e);

                window.Store = {
                    Chat: e("WAWebChatCollection")?.ChatCollection,
                    Contact: e("WAWebContactCollection")?.ContactCollection,
                    Label:e("WAWebLabelCollection").LabelCollection,
                    Msg: e("WAWebMsgCollection")?.MsgCollection,
                    MsgKey: i("WAWebMsgKey"),
                    BusinessProfile: e("WAWebBusinessProfileCollection")?.BusinessProfileCollection,
                    GroupMetadata: i("WAWebGroupMetadataCollection"),
                    TextMsgChatAction: e("WAWebSendTextMsgChatAction"),
                    MediaCollection: i("WAWebAttachMediaCollection"),
                    UserConstructor: i("WAWebWid"),
                    EnumTypes: e("WAWebWamEnumMediaPickerOriginType"),
                    MediaPrep: e("WAWebMediaPrep"),
                    OpaqueData: window.importNamespace("WAWebMediaOpaqueData"),
                    MsgType: e("WAWebMsgType")?.MSG_TYPE
                };

                if (window.Store) {
                    window.Store.InitType = "old_method_1";
                }
            } else {
                // Create store using inject function
                let mR = inject();
                window.Store = Object.assign({}, mR.findModule(e => e.default && e.default.Chat)[0]?.default || {});
                window.Store.MediaCollection = mR.findModule(e => e.default && e.default.prototype?.processAttachments)[0]?.default;
                window.Store.UserConstructor = mR.findModule(e => e.default && e.default.prototype?.isServer && e.default.prototype?.isUser)[0]?.default;
                window.Store.TextMsgChatAction = mR.findModule("sendTextMsgToChat")[0];
                window.Store.WidFactory = mR.findModule("createWid")[0];
                window.Store.Cmd = mR.findModule("Cmd")[0]?.Cmd;
                window.Store.ChatState = mR.findModule("sendChatStateComposing")[0];
                window.Store.ContactMethods = mR.findModule("getUserid")[0];
                window.Store.ChatHelper = mR.findModule("findChat")[0];
                window.Store.EnumTypes = mR.findModule("MEDIA_PICKER_ORIGIN_TYPE")[0];
                window.Store.MenuClasses = mR.findModule(e => e?.default?.menu && e?.default?.item ? e.default : null)[0]?.default;

                if (window.Store) {
                    window.Store.InitType = "old_method_2";
                }
            }

            // Extend Store functionality
            if (window.Store?.Chat?.modelClass?.prototype) {
                window.Store.Chat.modelClass.prototype.sendMessage = function (e) {
                    window.Store.TextMsgChatAction.sendTextMsgToChat(this, ...arguments);
                };
            }

            if (window.Store?.Chat && !window.Store.Chat._find) {
                window.Store.Chat._findAndParse = window.Store.BusinessProfile?._findAndParse;
                window.Store.Chat._find = window.Store.BusinessProfile?._find;
            }

            resolve();
        } catch (error) {
            reject("InjectJS :: initStoreOld :: Error :: " + error);
        }
    });
}

const initStoreNew = function () {
    let neededObjects = [
        { id: "MediaCollection", module: "WAWebAttachMediaCollection", conditions: (module) => (module.default && module.default.prototype && (module.default.prototype.processFiles !== undefined || module.default.prototype.processAttachments !== undefined)) ? module.default : null },
        { id: "Archive", module: "WAWebSetArchiveChatAction", conditions: (module) => (module.setArchive) ? module : null },
        { id: "Block", module: "WAWebBlockContactUtils", conditions: (module) => (module.blockContact && module.unblockContact) ? module : null },
        { id: "ChatUtil", module: "WAWebSendClearChatAction", conditions: (module) => (module.sendClear) ? module : null },
        { id: "GroupInvite", module: "WAWebGroupInviteJob", conditions: (module) => (module.queryGroupInviteCode) ? module : null },
        { id: "Wap", module: "WAWebCreateGroupAction", conditions: (module) => (module.createGroup) ? module : null },
        { id: "State", module: "WAWebSocketModel", conditions: (module) => (module.STATE && module.STREAM) ? module : null },
        { id: "_Presence", module: "WAWebContactPresenceBridge", conditions: (module) => (module.setPresenceAvailable && module.setPresenceUnavailable) ? module : null },
        { id: "WapDelete", module: "WAWebChatDeleteBridge", conditions: (module) => (module.sendConversationDelete && module.sendConversationDelete.length == 2) ? module : null },
        { id: "WapQuery", module: "WAWebQueryExistsJob", conditions: (module) => (module.queryExist) ? module : ((module.default && module.default.queryExist) ? module.default : null) },
        { id: "UserConstructor", module: "WAWebWid", conditions: (module) => (module.default && module.default.prototype && module.default.prototype.isServer && module.default.prototype.isUser) ? module.default : null },
        { id: "SendTextMsgToChat", module: "WAWebSendTextMsgChatAction", resolver: (module) => module.sendTextMsgToChat },
        { id: "ReadSeen", module: "WAWebUpdateUnreadChatAction", conditions: (module) => (module.sendSeen) ? module : null },
        { id: "sendDelete", module: "WAWebDeleteChatAction", conditions: (module) => (module.sendDelete) ? module.sendDelete : null },
        { id: "addAndSendMsgToChat", module: "WAWebSendMsgChatAction", conditions: (module) => (module.addAndSendMsgToChat) ? module.addAndSendMsgToChat : null },
        { id: "Catalog", module: "WAWebCatalogCollection", conditions: (module) => (module.Catalog) ? module.Catalog : null },
        { id: "MsgKey", module: "WAWebMsgKey", conditions: (module) => (module.default && module.default.toString && module.default.toString().includes('MsgKey error: obj is null/undefined')) ? module.default : null },
        { id: "Parser", module: "WAWebE2EProtoUtils", conditions: (module) => (module.convertToTextWithoutSpecialEmojis) ? module.default : null },
        { id: "Builders", module: "WAWebProtobufsE2E.pb", conditions: (module) => (module.TemplateMessage && module.HydratedFourRowTemplate) ? module : null },
        { id: "Me", module: "WAWebUserPrefsMeUser", conditions: (module) => (module.PLATFORMS && module.Conn) ? module.default : null },
        { id: "MyStatus", module: "WAWebContactStatusBridge", conditions: (module) => (module.getStatus && module.setMyStatus) ? module : null },
        { id: "ChatStates", module: "WAWebChatStateBridge", conditions: (module) => (module.sendChatStatePaused && module.sendChatStateRecording && module.sendChatStateComposing) ? module : null },
        { id: "GroupActions", module: "WAWebExitGroupAction", conditions: (module) => (module.sendExitGroup && module.localExitGroup) ? module : null },
        { id: "Participants", module: "WAWebGroupsParticipantsApi", conditions: (module) => (module.addParticipants && module.removeParticipants && module.promoteParticipants && module.demoteParticipants) ? module : null },
        { id: "WidFactory", module: "WAWebWidFactory", conditions: (module) => (module.isWidlike && module.createWid && module.createWidFromWidLike) ? module : null },
        { id: "Sticker", module: "WAWebStickerPackCollection", resolver: m => m.StickerPackCollection, conditions: (module) => (module.default && module.default.Sticker) ? module.default.Sticker : null },
        { id: "UploadUtils", module: "WAWebUploadManager", conditions: (module) => (module.default && module.default.encryptAndUpload) ? module.default : null }
    ];

    return new Promise((resolve, reject) => {
        try {
            const e = (m) => require("__debug").modulesMap[m] || false;

            const shouldRequire = m => {
                const a = e(m);
                if (!a) return false;
                return a.dependencies != null && a.depPosition >= a.dependencies.length
            };

            neededObjects.map((needObj) => {
                const m = needObj.module;
                if (!m) return;
                if (!e(m)) return;
                if (shouldRequire(m)) {
                    let neededModule = require(m)
                    needObj.foundedModule = neededModule;
                }
            });

            window.Store = {
                ...{ ...require("WAWebCollections") },
                ...(window.Store || {})
            }

            neededObjects.forEach((needObj) => {
                if (needObj.foundedModule) {
                    window.Store[needObj.id] = needObj.resolver ? needObj.resolver(needObj.foundedModule) : needObj.foundedModule;
                }
            });

            if (window.Store.Chat) {
                window.Store.Chat.modelClass.prototype.sendMessage = function (e) {
                    window.Store.SendTextMsgToChat(this, ...arguments);
                }
            }

            if (window.Store) {
                window.Store.InitType = "new_method";
            }

            resolve();
        } catch (error) {
            reject("InjectJS :: initStoreNew :: Error :: " + error);
        }
    });
}

// Init PRIMES Object function
const initPrimes = function () {
    // Initalize PRIMES object
    window.PRIMES = { lastRead: {} };

    // Send media attachment
    window.PRIMES.sendAttachment = function (mediaBlob, chatid, caption, waitTillSend) {
        return new Promise(async (resolve, reject) => {
          try {
            if (!mediaBlob) throw new Error('mediaBlob is required');
      
            const chat = Store.Chat.get(chatid);
            if (!chat) throw new Error(`Chat not found for id: ${chatid}`);
      
            const detectMsgType = (blob) => {
              const type = (blob.type || '').toLowerCase();
              if (type.startsWith('image/')) return Store.MsgType.IMAGE;
              if (type.startsWith('video/')) return Store.MsgType.VIDEO;
              if (type.startsWith('audio/')) return Store.MsgType.AUDIO;    
              return Store.MsgType.DOCUMENT;
            };
      
            const baseType = detectMsgType(mediaBlob);
      
            const media = {
                mediaBlob,
                type: baseType,
                mimetype: mediaBlob.type,
                size: mediaBlob.size,
                filename: mediaBlob.name,
                file: mediaBlob,
            };
              
            const mediaPrep = new Store.MediaPrep.MediaPrep(baseType, Promise.resolve(media));
      
            await mediaPrep.waitForPrep();
      
            const sendOpts = { type: baseType };
            if (/\S/.test(caption)) {
              sendOpts.caption = caption;
              sendOpts.isCaptionByUser = true;
            }
      
            await mediaPrep.sendToChat(chat, sendOpts);
      
            if (waitTillSend) {
              const start = Date.now();
              (function check() {
                const sent = document.querySelectorAll('.message-out');
                const last = sent[sent.length - 1];
                if (last) return resolve();
                if (Date.now() - start > 3000) return resolve();
                setTimeout(check, 250);
              })();
            } else {
              resolve();
            }
          } catch (err) {
            reject(err);
          }
        });
    };

    window.PRIMES._isContact = function (obj, isSaved, checkBusiness = true) {
        if (obj) {
            return obj.id?.server === 'c.us'
                && (!checkBusiness || obj.isBusiness !== true)
                && obj.isAddressBookContact === isSaved;
        }
        return false;
    };
    
    window.PRIMES._serializeContact = function (obj) {
        if (obj) {
            return {
                id: obj.id || obj._x_id,
                server: obj.id?.server,
                number: obj.id?.user,
                name: obj.name || obj.pushname || obj.formattedTitle || 'Unkown',
                pushname: obj.pushname || null
            }
        }
        return {};
    }

    // Get unsaved contacts
    window.PRIMES.getMyUnsavedContacts = function () {
        return window.Store.Contact
            .filter(contact => window.PRIMES._isContact(contact, 0))
            .map(contact => window.PRIMES._serializeContact(contact));
    }

    // Get all contacts
    window.PRIMES.getAllContacts = function () {
        return window.Store.Contact
            .filter(contact => window.PRIMES._isContact(contact, 1))
            .map(contact => window.PRIMES._serializeContact(contact));
    }

    window.PRIMES.getFavoriteContacts = function () {
        return window.Store.Contact.filter(contact => window.PRIMES._isContact(contact, 1) && contact.isFavorite).map(contact => window.PRIMES._serializeContact(contact));
    }

    // Get all saved contacts including business
    window.PRIMES.getAllSavedContacts = function () {
        return window.Store.Contact
            .filter(contact => window.PRIMES._isContact(contact, 1,false))
            .map(contact => window.PRIMES._serializeContact(contact));
    }

    window.PRIMES._isNumberExist =  async function (number) {
        if(window.Store.QueryExist && !useOldMethod){
            let numberObj = await window.Store.QueryExist.queryPhoneExists(number)
            return numberObj ? true : false
        }
        else{
            return true;
        }
    }

    // to get the recent chats based on contact or group
    window.PRIMES.getRecentChats = function () {
        return window.Store.Chat
            .filter(chat => chat && window.PRIMES._isContact(chat.contact, 1))
            .map(chat => window.PRIMES._serializeContact(chat.contact));
    }

    window.PRIMES._isGroup = function (obj) {
        if (obj) {
            return obj.id?.server === 'g.us' || obj.groupMetadata;
        }
        return false;
    }

    window.PRIMES._serializeGroup = function (obj) {
        if (obj) {
            return {
                id: obj.id,
                name: obj.name || obj.formattedTitle || 'Unkown',
                attributes: obj.attributes,
                groupMetadata: obj.groupMetadata
            }
        }
        return {};
    }

    // Get all groups
    window.PRIMES.getAllGroups = function () {
        return window.Store.Chat
            .filter(chat => window.PRIMES._isGroup(chat))
            .map(chat => window.PRIMES._serializeGroup(chat));
    };

    window.PRIMES.getFavoriteGroups =function (){
        return window.Store.Chat.filter(chat => window.PRIMES._isGroup(chat) && chat.isFavorite).map(chat => window.PRIMES._serializeGroup(chat));
    }

    // Get group by id
    window.PRIMES.getGroupById = function (group_id) {
        return window.PRIMES.getAllGroups().find(group => group.id._serialized === group_id);
    }

    // Get group contacts
    window.PRIMES.getGroupContacts = function (group_id, callback) {
        const group = window.PRIMES.getGroupById(group_id);
        if (!group || !group.groupMetadata) return { participants: [], pastParticipants: [] };

        const { participants = [], pastParticipants = [], groupType } = group.groupMetadata;
        const _isGroup = groupType === "DEFAULT" || groupType === "LINKED_SUBGROUP";

        if (_isGroup) {
            return {
                participants: participants.map(p => window.PRIMES._serializeGroupContact(p.contact)),
                pastParticipants: pastParticipants.map(p => window.PRIMES._serializeGroupContact(p.contact))
            };
        }

        return {
            participants: participants.map(p => window.PRIMES._serializeGroupContact(p.contact)),
            pastParticipants: pastParticipants.map(p => window.PRIMES._serializeGroupContact(p.contact))
        };
    };

    window.PRIMES._isLabel = function (obj) {
        if (obj) {
            return obj.__x_id && obj.__x_name && obj.labelItemCollection?._models;
        }
        return false;
    };

    window.PRIMES._serializeLabel = function (obj) {
        if (obj) {
            let contacts = [];
            if (obj.labelItemCollection._models) {
                contacts = obj.labelItemCollection._models
                    .filter(item => item.__x_parentType === "Chat")
                    .map(item => item.__x_parentId)
            }

            return {
                id: obj.__x_id,
                name: obj.__x_name,
                color: obj.color || "Unknown",
                contacts: contacts
            };
        }
        return {};
    };
    
    window.PRIMES.getAllLabels = function () {
        let storeLabel = window.Store?.Label;
        let models = storeLabel?.models || storeLabel?._models;
    
        if (!models || !models.length) return [];
    
        return models
            .filter(label => window.PRIMES._isLabel(label))
            .map(label => window.PRIMES._serializeLabel(label));
    };

     // Helper for group contact serialization
    window.PRIMES._serializeGroupContact = function(contact = {}) {
        const number = contact.__x_phoneNumber?.user || contact.phoneNumber?.user || ( contact.__x_id.server === "c.us" && contact.__x_id.user) || "Unavailable";
        const name = contact.name || contact.__x_pushname || "Unknown";
        return { name, number };
    }

    // Get group name
    window.PRIMES.getGroupName = function (group_id) {
        let group = window.PRIMES.getGroupById(group_id);
        return group ? group.name : 'Group';
    }

    // Get chat (group or contact) by id
    window.PRIMES.getChat = function (id, done) {
        id = typeof id == "string" ? id : id._serialized;
        const found = window.Store.Chat.get(id);
        found.sendMessage = (found.sendMessage) ? found.sendMessage : function () { return window.Store.sendMessage.apply(this, arguments); };
        if (done !== undefined) done(found);
        return found;
    }

    // Send a message
    window.PRIMES.sendMessage = function (id, message) {
        return new Promise((resolve, reject) => {
            try {
                var chat = PRIMES.getChat(id);
                if (chat !== undefined) {
                    chat.sendMessage(message);
                    resolve();
                } else {
                    reject("chat or group not found");
                }
            } catch (err) {
                reject(err);
            }
        });
    };

    // Convert base64 string data to File
    window.PRIMES.base64toFile = function (data, fileName) {
        let arr = data.split(",");
        let mime = arr[0].match(/:(.*?);/)[1];
        let bstr = atob(arr[1]);
        let n = bstr.length;
        let u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], fileName, { type: mime });
    }
}

// InitMain :: Load Store and PRIMES
var initStoreInterval = null;
var initStoreRetryCount = 0;
var useOldMethod = true;

const initMain = function () {
    initStoreRetryCount = 0;
    let initStoreInterval = setInterval(() => {
        if (isWhatsappLoaded() && isWebpackLoaded()) {

            initStore(useOldMethod)
                .then(() => {
                    initPrimes();

                    // Check store and primes loaded or not
                    if (window.Store && window.PRIMES) {
                        clearInterval(initStoreInterval);
                        handleInitMainSuccess();
                    } else {
                        initStoreRetryCount++;
                        handleInitMainError();
                    }
                })
                .catch((e) => {
                    initStoreRetryCount++;
                    handleInitMainError();
                })

        } else {
            handleInitMainError();
        }

        if (!useOldMethod && initStoreRetryCount == 5) {
            reloadInitMain(true);
        }
    }, 1000);
}

const reloadInitMain = function (method) {
    clearInterval(initStoreInterval);
    sessionStorage.removeItem('inject_session');
    
    setTimeout(() => {
        console.logWarn(`InjectJS :: reloadInitMain :: useOldMethod = ${method}`);
        useOldMethod = method;
        initMain();
    }, 2000)
}

const handleInitMainSuccess = function () {
    const isInjectExecuted = sessionStorage.getItem('inject_session');
    if (isInjectExecuted) {
        console.logSuccess("InjectJS :: initMain - Already executed in this session. Skipping...");
        return;
    } else {
        sessionStorage.setItem('inject_session', 'executed');
    }
    
    if (isWhatsappLoaded() && window.Store && window.PRIMES) {
        console.logSuccess(`InjectJS :: initMain - Success :: useOldMethod = ${useOldMethod}`);
        console.logSuccess(`InjectJS :: Init Store Type  :: ${getInitStoreType()}`);
        console.logSuccess(`InjectJS :: Whatsapp Version :: ${getWhatsappVersion()}`);

        getAllLists();
        getAllGroups();
        getAllContacts();
        getAllLabels();
    }
}

const handleInitMainError = function (error = null) {
    let objName = null;
    if (!isWhatsappLoaded())
        objName = 'Whatsapp';
    else if (!isWebpackLoaded())
        objName = 'Webpack';
    else if (!window.Store)
        objName = 'Store';
    else if (!window.PRIMES)
        objName = 'PRIMES';

    if (error) {
        console.logError(`InjectJS :: initMain - Error :: useOldMethod = ${useOldMethod}`);
        console.error(error);
    } else if (objName) {
        console.logError(`InjectJS :: initMain - Error :: ${objName} is not loaded! :: useOldMethod = ${useOldMethod}`);
    } else {
        console.logError(`InjectJS :: initMain - Unkown Error :: useOldMethod = ${useOldMethod}`);
    }
}

// ======= CORE INJECT JS CODE ENDS HERE =======

//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\

// ======= PRIME SENDER CODE STARTS =====

// Event Listeners and Prime Sender Functions
window.addEventListener('PRIMES::init', function (e) {
    reloadInitMain(e.detail.useOldMethod);
});

window.addEventListener('PRIMES::send-attachments', async function (e) {
    const attachments = e.detail.attachments;
    const caption = e.detail.caption;
    const number = e.detail.number;
    const waitTillSend = e.detail.waitTillSend;
    const fileName = e.detail.name;
    const quick = e.detail.quick;
    const chatId = number + '@c.us';

    try {
       if(quick){
            const fileData = await JSON.parse(attachments);
            const fileBlob = await window.PRIMES.base64toFile(fileData, fileName);
            await window.PRIMES.sendAttachment(fileBlob, number, caption, false);
       } else {
            const sendPromises = attachments.map(async (file, index) => {
                const fileData = await JSON.parse(file.data);
                const fileBlob = await window.PRIMES.base64toFile(fileData, file.name);
                await window.PRIMES.sendAttachment(fileBlob, chatId, caption[index], waitTillSend);
            });
            await Promise.all(sendPromises);
            window.postMessage({
                type: "send_attachments_to_number",
                payload: {
                    chat_id: chatId,
                    is_attachments_sent: "YES",
                    comments: ""
                }
            }, "*");
       }

    } catch (error) {
        console.error(error);
        window.postMessage({
            type: "send_attachments_to_number_error",
            payload: {
                chat_id: chatId,
                error: error,
                is_attachments_sent: "NO",
                comments: "Error while sending the attachments to number"
            }
        }, "*");
    }
});


window.addEventListener("PRIMES::send-message", async function (e) {
    const number = e.detail.number;
    const message = e.detail.message;
    const chatId = number + '@c.us';

    try {
        await window.PRIMES.sendMessage(chatId, message);
        window.postMessage({
            type: "send_message_to_number",
            payload: {
                chat_id: chatId,
                is_message_sent: "YES",
                comments: ""
            }
        }, "*");
    } catch (error) {
        console.error(error);
        window.postMessage({
            type: "send_message_to_number_new_error",
            payload: {
                chat_id: chatId,
                error: error,
                is_message_sent: "NO",
                comments: "Error while sending the message to number"
            }
        }, "*");
    }
});

window.addEventListener('PRIMES::send-message-to-group', async function (e) {
    const groupId = e.detail.group_id;
    const message = e.detail.message;
    const groupIdObj = { "_serialized": e.detail.group_id };

    try {
        await window.PRIMES.sendMessage(groupIdObj, message);
        window.postMessage({
            type: "send_message_to_group",
            payload: {
                group_id: groupId,
                is_message_sent: "YES",
                comments: ""
            }
        }, "*");
    } catch (error) {
        console.error(error);
        window.postMessage({
            type: "send_message_to_group_error",
            payload: {
                chat_id: groupId,
                error: error,
                is_message_sent: "NO",
                comments: "Error while sending the message to group"
            }
        }, "*");
    }
});

window.addEventListener('PRIMES::send-attachments-to-group', async function (e) {
    const attachments = e.detail.attachments;
    const caption = e.detail.caption;
    const groupId = e.detail.groupId;
    const waitTillSend = e.detail.waitTillSend;
    const fileName = e.detail.name;
    const quick = e.detail.quick;

    try {
        if(quick){
            const fileData = await JSON.parse(attachments);
            const fileBlob = await window.PRIMES.base64toFile(fileData, fileName);
            await window.PRIMES.sendAttachment(fileBlob, groupId, caption, false);
        }else{
            const sendPromises = attachments.map(async (file, index) => {
                const fileData = await JSON.parse(file.data);
                const fileBlob = await window.PRIMES.base64toFile(fileData, file.name);
                await window.PRIMES.sendAttachment(fileBlob, groupId, caption[index], waitTillSend);
            });
    
            await Promise.all(sendPromises);
            window.postMessage({
                type: "send_attachments_to_group",
                payload: {
                    group_id: groupId,
                    is_attachments_sent: "YES",
                    comments: ""
                }
            }, "*");
        }
    } catch (error) {
        console.error(error);
        window.postMessage({
            type: "send_attachments_to_group_error",
            payload: {
                group_id: groupId,
                error: error,
                is_attachments_sent: "NO",
                comments: "Error while sending the attachments to group"
            }
        }, "*");
    }
});

window.addEventListener('PRIMES::export-group', function (e) {
    const groupId = e.detail.groupId;

    try {
        let groupName = PRIMES.getGroupName(groupId);
        let contacts = PRIMES.getGroupContacts(groupId);
        let rows = [];

        contacts.participants.forEach(contact => {
            rows.push([contact.number, contact.name]);
        })
        rows.push([""]),
        rows.push(["Past Participants"]),

        contacts.pastParticipants.forEach(contact =>
            rows.push([contact.number,contact.name])
        )

        // rows.sort();
        rows.unshift(['Number', 'Name'])

        let csvContent = "data:text/csv;charset=utf-8," + rows.map(row => row.join(",")).join("\n");
        let data = encodeURI(csvContent);
        let link = document.createElement("a");

        link.setAttribute("href", data);
        link.setAttribute("download", groupName + ".csv");
        document.body.appendChild(link);
        link.click()
        document.body.removeChild(link);
    } catch (error) {
        window.postMessage({ type: "export_group_error", payload: { group_id: groupId, error: error } }, "*");
    }
});

window.addEventListener('PRIMES::export-unsaved-contacts', function (e) {
    let type = e.detail.type;

    try {
        let rows = [];
        let contacts = PRIMES.getMyUnsavedContacts();

        let numContacts = (type == 'Advance') ? contacts.length : 10;
        for (let i = 0; i < numContacts; i++) {
            if (contacts[i].number) {
                let correctNumber = "+" + contacts[i].number;
                let whatsappName = contacts[i].name;
                rows.push([correctNumber, whatsappName]);
            }
        }

        rows.unshift(['Numbers', 'Name']);
        if (type == 'Expired') {
            for (let i = 0; i < 3; i++)
                rows.push([]);
            rows.push(["",'To download all contacts please buy Advance Premium']);
        }

        let csvContent = rows.map(row => row.join(",")).join("\n");
        let blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

        let link = document.createElement("a");
        link.setAttribute("href", URL.createObjectURL(blob));
        link.setAttribute("download", "Advanced_All_Unsaved_Chats_Export.csv");

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        window.postMessage({ type: "export_unsaved_contacts_error", payload: { type: type, error: error } }, "*");
    }
});

window.addEventListener('PRIMES::export-saved-contacts', async function (e) {
    let type = e.detail.type;
    try {
        let contacts = PRIMES.getAllSavedContacts();
        let numContacts = (type === 'Advance') ? contacts.length : 10;
        const maxRowsPerFile = 5000;  // configurable max rows per file (including header)
        
        let rows = [];
        let fileIndex = 1;
        rows.push(['Numbers', 'Name']);

        for (let i = 0; i < numContacts; i++) {
            if (contacts[i].number) {
                let correctNumber = "+" + contacts[i].number;
                let whatsappName = contacts[i].name;
                rows.push([correctNumber, whatsappName]);
            }

            // When rows exceed limit, export current file and reset rows array
            // +1 to account for header already included
            if (rows.length === maxRowsPerFile + 1 || i === numContacts - 1) {
                
                if (type == 'Expired' && fileIndex === 1) {
                    for (let k = 0; k < 3; k++) rows.push([]);
                    rows.push(['', 'To download all contacts please buy Advance Premium']);
                }

                let csvContent = rows.map(row => row.join(",")).join("\n");
                let blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

                let link = document.createElement("a");

                let fileName = parseInt(numContacts/maxRowsPerFile) > 0 ?`Advanced_All_Saved_Chats_Export_Part${fileIndex}.csv` : "Advanced_All_Saved_Chats_Export.csv";
                
                link.setAttribute("href", URL.createObjectURL(blob));
                link.setAttribute("download", fileName);

                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                // Reset rows for next file with the header
                rows = [];
                rows.push(['Numbers', 'Name']);
                fileIndex++;
                // Small delay so browser can handle file creation properly
                await new Promise(resolve => setTimeout(resolve, 50));
            }
        }
    } catch (error) {
        window.postMessage({ type: "export_saved_contacts_error", payload: { type: type, error: error } }, "*");
    }
});

const getAllGroups = function () {
    try {
        if (!window.PRIMES) {
            console.warn("PRIMES not fully loaded");
        }

        let groups = window.PRIMES.getAllGroups();

        let allGroups = groups.map(group => ({
            id: group.id,
            name: group.name,
        }));

        window.postMessage({ type: "get_all_groups", payload: allGroups }, "*");
        return allGroups;
    } catch (error) {
        window.postMessage({ type: "get_all_groups_error", payload: { error: error } }, "*");
        return [];
    }
}

window.addEventListener('PRIMES::get-all-groups', getAllGroups);

const getAllContacts = function () {
    try {
        if (!window.PRIMES) {
            console.warn("PRIMES not fully loaded");
        }

        let recentContacts = window.PRIMES.getRecentChats();
        let contacts = window.PRIMES.getAllContacts();

        const recentContactIds = new Set(recentContacts.map(contact => contact.id._serialized));
        const remainingContacts = contacts.filter(contact => !recentContactIds.has(contact.id._serialized));
        remainingContacts.sort((a, b) => {
            const nameA = a.name || "";
            const nameB = b.name || "";
            return nameA.localeCompare(nameB);
        });

        const uniqueContactIds = new Set();
        const combinedContacts = [...recentContacts, ...remainingContacts].filter(contact => {
            if (uniqueContactIds.has(contact.id._serialized)) {
                return false;
            }
            uniqueContactIds.add(contact.id._serialized);
            return true;
        });
        
        window.postMessage({ type: "get_all_contacts", payload: combinedContacts }, "*");
        return combinedContacts;
    } catch (error) {
        window.postMessage({ type: "get_all_contacts_error", payload: { error: error } }, "*");
        return [];
    }
}

window.addEventListener('PRIMES::get-all-contacts', getAllContacts);

const getAllLabels = function () {
    try {
        if (!window.PRIMES) {
            console.warn("PRIMES not fully loaded");
        }

        let allLabels = window.PRIMES.getAllLabels();

        window.postMessage({ type: "get_all_labels", payload: allLabels }, "*");
        return allLabels;
    } catch (error) {
        window.postMessage({ type: "get_all_labels_error", payload: { error: error } }, "*");
        return [];
    }
};

window.addEventListener('PRIMES::get-all-labels', getAllLabels);

const getAllLists = function () {
    try {
        if (!window.PRIMES) {
            console.warn("PRIMES not fully loaded");
        }

        const favoriteContacts = window.PRIMES.getFavoriteContacts();

        const favoriteGroups = window.PRIMES.getFavoriteGroups().map(group => ({
            id: group.id,
            name: group.name,
        }));

        const allLists = [...favoriteContacts, ...favoriteGroups];

        try {
            const serializableLists = JSON.parse(JSON.stringify(allLists));
            window.postMessage({ type: "get_all_lists", payload: serializableLists }, "*");
        } catch (postMessageError) {
            console.error("Failed to postMessage:", postMessageError);
            window.postMessage({
                type: "get_all_lists_error",
                payload: { error: postMessageError.message }
            }, "*");
        }

        return allLists;

    } catch (error) {
        window.postMessage({ type: "get_all_lists_error", payload: { error: error.message } }, "*");
        return [];
    }
};

window.addEventListener('PRIMES::get-all-lists', getAllLists);

const getInitStoreType = function () {
    let InitType = window?.Store?.InitType;
    window.postMessage({ type: "get_init_store_type", payload: InitType }, "*");
    return InitType;
}

const getWhatsappVersion = function () {
    let whatsappVersion = (window?.Debug?.VERSION ? window.Debug.VERSION : 'Not Found');
    window.postMessage({ type: "get_whatsapp_version", payload: whatsappVersion }, "*");
    return whatsappVersion;
}

// Start Init Main
reloadInitMain(true);