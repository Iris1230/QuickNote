var MSG = {
    "app": "Leanote",
    "share": "Share",
    "noTag": "No Tags",
    "inputUsername": "input username",
    "inputEmail": "Email is required",
    "inputPassword": "Password is required",
    "inputPassword2": "Please input the new password again",
    "confirmPassword": "Password not matched",
    "history": "Histories",
    "editorTips": "Tips",
    "editorTipsInfo": "<h4>1. Short cuts</h4>ctrl+shift+c Toggle code<h4>2. shift+enter Get out of current block</h4> eg. <img src=\"/images/outofcode.png\" style=\"width: 90px\"/> in this situation you can use shift+enter to get out of current code block.",
    "all": "Newest",
    "trash": "Trash",
    "delete": "Delete",
    "unTitled": "UnTitled",
    "defaultShare": "Default sharing",
    "writingMode": "Writing Mode",
    "normalMode": "Normal Mode",
    "saving": "Saving",
    "saveSuccess": "Save success",
    "update": "Update",
    "close": "Close",
    "cancel": "Cancel",
    "send": "Send",
    "shareToFriends": "Share to friends",
    "publicAsBlog": "Public as blog",
    "cancelPublic": "Cancel public",
    "move": "Move",
    "copy": "Copy",
    "rename": "Rename",
    "exportPdf": "Export PDF",
    "addChildNotebook": "Add child notebook",
    "deleteAllShared": "Delete shared user",
    "deleteSharedNotebook": "Delete shared notebook",
    "copyToMyNotebook": "Copy to my notebook",
    "checkEmail": "Check email",
    "sendVerifiedEmail": "Send verification email",
    "defaulthhare": "Default",
    "friendEmail": "Friend email",
    "readOnly": "Read only",
    "writable": "Writable",
    "friendEmailMissing": "Friend email is required",
    "clickToChangePermission": "Click to change permission",
    "sendInviteEmailToYourFriend": "Send invite email to your friend",
    "friendNotExits": "Your friend hasn't %s's account, invite register link: %s",
    "emailBodyRequired": "Email body is required",
    "sendSuccess": "success",
    "inviteEmailBody": "Hi,I am %s, %s is awesome, come on!",
    "historiesNum": "We have saved at most <b>10</b> latest histories with each note",
    "noHistories": "No histories",
    "datetime": "Datetime",
    "restoreFromThisVersion": "Restore from this version",
    "confirmBackup": "Are you sure to restore from this version? We will backup the current note.",
    "createAccountSuccess": "Account create success",
    "createAccountFailed": "Account create failed",
    "updateUsernameSuccess": "Update username success",
    "usernameIsExisted": "Username is already exists",
    "noSpecialChars": "username cannot contains special chars",
    "minLength": "The length is at least %s",
    "errorEmail": "Please input the right email",
    "verifiedEmaiHasSent": "The verification email has been sent, please check your email.",
    "emailSendFailed": "Email send failed",
    "inputNewPassword": "The new password is required",
    "errorPassword": "The passowd's length is at least 6 and be sure as complex as possible",
    "updatePasswordSuccess": "Update password success",
    "Please save note firstly!": "Please save note firstly!",
    "Please sign in firstly!": "Please sign in firstly!",
    "Are you sure ?": "Are you sure ?",
    "Are you sure to install it ?": "Are you sure to install it ?",
    "Are you sure to delete": "Are you sure to delete",
    "Success": "Success",
    "Error": "Error",
    "File exists": "File exists",
    "Delete file": "Delete file",
    "No images": "No images",
    "Filename": "Filename",
    "Group Title": "Group Title",
    "Hyperlink": "Hyperlink",
    "Please provide the link URL and an optional title": "Please provide the link URL and an optional title",
    "optional title": "optional title",
    "Cancel": "Cancel",
    "Strong": "Strong",
    "strong text": "strong text",
    "Emphasis": "Emphasis",
    "emphasized text": "emphasized text",
    "Blockquote": "Blockquote",
    "Code Sample": "Code Sample",
    "enter code here": "enter code here",
    "Image": "Image",
    "Heading": "Heading",
    "Numbered List": "Numbered List",
    "Bulleted List": "Bulleted List",
    "List item": "List item",
    "Horizontal Rule": "Horizontal Rule",
    "Markdown syntax": "Markdown syntax",
    "Undo": "Undo",
    "Redo": "Redo",
    "enter image description here": "enter image description here",
    "enter link description here": "enter link description here",
    "Edit mode": "Edit mode",
    "Vim mode": "Vim mode",
    "Emacs mode": "Emacs mode",
    "Normal mode": "Normal mode",
    "Normal": "Normal",
    "Light": "Light",
    "Light editor": "Light editor",
    "Add Album": "Add Album",
    "Cannot delete default album": "Cannot delete default album",
    "Cannot rename default album": "Cannot rename default album",
    "Rename Album": "Rename Album",
    "Add Success!": "Add Success!",
    "Rename Success!": "Rename Success!",
    "Delete Success!": "Delete Success!",
    "Are you sure to delete this image ?": "Are you sure to delete this image ?",
    "click to remove this image": "click to remove this image",
    "error": "error",
    "Prev": "Prev",
    "Next": "Next",
    "ServerCrashes": "Sorry, error connecting to the server.",
    "DoubleShared": "Sorry, this note has already been shared to the same user",
    "ShareFail": "Sorry, sharing failed",
    "ShareSuccess": "Share successfully"
};

function getMsg(key, data) {
    var msg = MSG[key];
    if (msg) {
        if (data) {
            if (!isArray(data)) {
                data = [data];
            }
            for (var i = 0; i < data.length; ++i) {
                msg = msg.replace("%s", data[i]);
            }
        }
        return msg;
    }
    return key;
}