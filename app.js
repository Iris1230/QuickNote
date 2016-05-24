var port = Number(process.env.PORT || 3000);
var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var expressMongoDb = require("express-mongo-db");

var app = express();

var mkdirp = require('mkdirp');

// root address of cloud disk
var root_dir = "/root/QuickNote/cloud/";

var portMark = new Array();
var basePort = 8080;
var portTable = {};

function findPort(){
	for(var i=0; i<500; i++){
		if(portMark[i] != 1){
			portMark[i] = 1;
			return basePort+i;
		}
	}
	return -1;
}

// make "node app.js" work on local machine, this use node's static file fetching
app.use('/', express.static ('./public'));
//general middleware
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json()); // get information from html forms
// app.use(cookieParser()); // read cookies (needed for auth)


var server = http.createServer(app);
server.listen(3000, function(){
  console.log('-----> SERVER STARTED ON PORT:', port, '<-----');
  console.log('-----> PROCESS PID:', process.pid, '<-----');
});


app.use(expressMongoDb('mongodb://localhost:27017/NoteTakingApp'));
console.log("db starts");

app.use('/updateAll', bodyParser.text());
app.use('/register', bodyParser.text());
app.use('/logIn', bodyParser.text());
app.use('/logOut', bodyParser.text());
app.use('/checkExistence', bodyParser.text());
app.use('/share/addShareNotebook', bodyParser.text());
app.use('/share/addShareNote', bodyParser.text());
app.use('/share/addGroupShareNotebook', bodyParser.text());
app.use('/share/addGroupShareNote', bodyParser.text());

//app.use('/share/listShareNotes', bodyParser.text());
//app.use(bodyParser.json());

console.log("server starts");

app.use(function(req, res, next) {
	console.log("run");
	res.header('Access-Control-Allow-Origin', '*'); 
	res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE');
//    res.header( 'Content-Type' ,'application/x-www-form-urlencoded; charset=UTF-8');
	//res.header('Access-Control-Allow-Headers', 'X-Requested_With'); 
	// console.log(req);
	next();
});



app.post("/updateAll", function(req, res) {
	// res.header('Access-Control-Allow-Origin', '*'); // implementation of CORS
	console.log("updateAll activated");

	var parsedData = JSON.parse(req.body);
	var UserId = parsedData.UserInfo.UserId;
    console.log("The UserId is: " + parsedData.UserInfo.UserId);

	//req.db.collection('allAppData').insert(parsedData, function(err, data) {
	//	if(err) console.log(err);
	//	else {
	//		console.log("data saved to db");
	//	}
	//});

	var query = {"UserInfo.UserId": UserId};
	req.db.collection('allAppData').update(query, parsedData, {upsert: true}, function(err, data) {
		if(err) {
            console.log(err);
            res.end('{"msg": "Synchronized failed", "status": "fail"}');
        }
		else {
			console.log("data updated to db");
            res.end('{"msg": "Synchronized successfully", "status": "success"}');
		}
	});
});

app.post("/register", function(req, res) {
	// res.header('Access-Control-Allow-Origin', '*'); // implementation of CORS
	console.log("register activated");
	console.log("Body is: " + req.body);
	var parsedData = JSON.parse(req.body);

	//req.db.collection('allAppData').insert(parsedData, function(err, data) {
	//	if(err) console.log(err);
	//	else {
	//		console.log("data saved to db");
	//	}
	//});

	var findQuery = {"Email": parsedData.Email};
	req.db.collection('registeredUsers').findOne(findQuery, function(err, data) {
		if(err) {
			console.log(err);
			res.end('{"msg": "DB error", "status": "fail"}');
		}
		else {
			if(data) { // if existent
				res.end('{"msg": "Email has already been registered", "status": "fail"}');
			}
			else { // if not existent
				req.db.collection('registeredUsers').insert(parsedData, function(err, data) {
						if(err) {
							console.log(err);
							res.end('{"msg": "DB error", "status": "fail"}');
						}	
						else {
							console.log("data inserted to db");
							res.end('{"msg": "Reistered successfully", "status": "success"}');
							mkdirp(root_dir+parsedData.Email, function(msg) { 
								console.log("path created");
							});
						}
					});
				}
		}
	});
});

app.post("/logIn", function(req, res) {
	// res.header('Access-Control-Allow-Origin', '*'); // implementation of CORS
	console.log("logIn activated");
//    console.log("Body is: " + req.body);
	var parsedData = JSON.parse(req.body);


	var findQuery = {"Email": parsedData.Email};
	req.db.collection('registeredUsers').findOne(findQuery, function(err, data) {
		if(err) {
			console.log(err);
			res.end('{"msg": "DB error", "status": "fail"}');
		}
		else {
			if(data) { // if existent
				console.log("email found");
				var findQuery2 = {"Email": parsedData.Email, "Password": parsedData.Password};
				req.db.collection('registeredUsers').findOne(findQuery2, function(err, data) {
					if(data) { // if existent
						console.log("log in successfully");
						// res.end('{"msg": "Log in successfully", "status": "success"}');
						res.json(JSON.stringify(data));
                        
                        
                        
                        var exec = require('child_process').exec;
                        var port = findPort();
                        var path = root_dir+parsedData.Email;
                        console.log("Port open: "+port);
                        var result = exec("node --harmony fileManager/lib/index.js -p "+port+" -d "+path, function(error, stdout, stderr) {
                            if (error !== null) {
                                console.log('exec error: ', error);
                            }
                            else {
                                portTable[parsedData.UserId] = port;
                            }
                        });
                        if(result) {
                            portTable[parsedData.UserId] = {
                                Port: port,
                                PId: result.pid
                            };
                        }
					}
					else {
						console.log("wrong password");
						res.end('{"msg": "wrong password", "status": "fail"}');
					}
				});
			}
			else { // if not existent
				console.log("not found email");
				res.end('{"msg": "wrong email", "status": "fail"}');
			}
		}
	});
});


app.post("/logOut", function(req, res) {
    console.log("logOut activated");

	var parsedData = JSON.parse(req.body);
    var thisPortInfo = portTable[parsedData.UserId];   
    console.log(thisPortInfo);
    if(thisPortInfo) {
        var port = thisPortInfo.port;
        var pid = thisPortInfo.pid;
        if(port && pid) {
            var result = exec("kill " + pid, function(error, stdout, stderr) {
                if (error !== null) {
                    console.log('exec error: ', error);
                }
                else {
                    console.log("process " + pid + "is killed");
                }
            });
        }
    }
});

app.post("/checkExistence", function(req, res) {
    console.log("/checkExistance activated");
	var parsedData = JSON.parse(req.body);
    var email = parsedData.Email;

    var query = {"UserInfo.Email": email};
    req.db.collection("allAppData").findOne(query, function(err, item) {
        if(err) {
            console.log("err is: " + err);
            res.end('{"msg": "DB error", "status": "fail"}');
        }
        else {
            if(item) { // 找到了该账户
                res.end('{"msg": "Email found", "status": "success"}');
            }
            else {
                res.end('{"msg": "Email not found", "status": "fail"}');
            }
        }
    });
});
                                        

app.post("/share/addShareNotebook", function(req, res) {
    console.log("/share/addShareNotebook activated");
    console.log("Body is: " + req.body);
	var parsedData = JSON.parse(req.body);
    var senderUserId = parsedData.SenderUserId;
    var Email = parsedData.Email;
    var NotebookId = parsedData.NotebookId;
    var Perm = parsedData.Perm;
    
    var query = {"UserInfo.UserId": senderUserId};
    req.db.collection("allAppData").findOne(query, function(err, item) {
		if(err) {
            console.log("err is: " + err);
            res.end('{"msg": "DB error", "status": "fail"}');
        }
        else {
            if(item) {
                console.log("Found sender");
                var notebooks = item.notebooks;
                var targetNotebook;
                var senderUserInfo = item.UserInfo;
                console.log("sender userId is " + senderUserInfo.UserId);
//                var shareNotebooks = item.shareNotebooks;

                var isFound = !1;
                for(var i in notebooks) {
//                    console.log(i);
                    var curNotebook = notebooks[i];
                    if(curNotebook.NotebookId == NotebookId) {
                        console.log("Found notebook");
                        targetNotebook = curNotebook;
                        isFound = !0;
                        break;
                    }
                }
                
                if(!isFound) { // 没找到
                    console.log("Not found");
                    res.end('{"msg": "Not found notebook", "status": "fail"}');
                }
                else { // 找到了要分享的notebook
                    // 找receiver
                    var query = {"UserInfo.Email": Email};
                    req.db.collection("allAppData").findOne(query, function(err, item) {
                        if(err) {
                            console.log("err is: " + err);
                            res.end('{"msg": "Sorry, please try again in a minute", "status": "fail"}');
                        }
                        else {
                            if(item) { // 找到了receiver
                                console.log("Found receiver");
                                
                                var targetUserInfo = item.UserInfo;  
                                var shareNotebooks = item.shareNotebooks;
                                var ToUserId = targetUserInfo.UserId;
                                console.log("receiver id is " + targetUserInfo.UserId);
                                // 更新目标ShareUserInfos
                                var anotherUserInfo = {};

                                anotherUserInfo.UserId = senderUserInfo.UserId;
                                anotherUserInfo.Email = senderUserInfo.Email;
                                anotherUserInfo.Verified = senderUserInfo.Verified;
                                anotherUserInfo.Username = senderUserInfo.Username;
                                anotherUserInfo.CreatedTime = senderUserInfo.CreatedTime;
                                anotherUserInfo.Logo = senderUserInfo.Logo;
                                anotherUserInfo.Theme = senderUserInfo.Theme;
                                anotherUserInfo.FromUserId = senderUserInfo.FromUserId;
                                anotherUserInfo.NoteCnt = senderUserInfo.NoteCnt;
                                anotherUserInfo.Usn = senderUserInfo.Usn;
                                console.log("anotherUserInfo email is " + anotherUserInfo.Email);
                                // 更新receiver的sharedUserInfos
                                var query = {"UserInfo.UserId": ToUserId};
                                req.db.collection('allAppData').update(query, {$addToSet:{"sharedUserInfos": anotherUserInfo}}, {upsert: true}, function(err, data) {
                                    if(err) {
                                        console.log(err);
                                        res.end('{"msg": "DB error", "status": "fail"}');
                                    }
                                    else {
                                        console.log("successfully update ShareUserInfos");
                                        
                                        // check whether this notebook has been shared before
                                        var thisSenderShareNotebooks = shareNotebooks[senderUserId];
                                        for(var i in thisSenderShareNotebooks) {
                                            var curShareNotebook = thisSenderShareNotebooks[i];
                                            if(curShareNotebook.NotebookId == targetNotebook.NotebookId) {
                                                console.log("This notebook has already been shared before");
                                                res.end('{"msg": "Sorry, this notebook has already been shared before", "status": "fail"}');
                                            }
                                        }

                                        // 更新receiver的ShareNotebooks
                                        var anotherNotebook = {};
                                        anotherNotebook.ParentNotebookId = targetNotebook.ParentNotebookId;
                                        anotherNotebook.Title = targetNotebook.Title;
                                        anotherNotebook.UrlTitle = targetNotebook.UrlTitle;
                                        anotherNotebook.NumberNotes = targetNotebook.NumberNotes;
                                        anotherNotebook.IsBlog = targetNotebook.IsBlog;
                                        anotherNotebook.UpdatedTime = targetNotebook.UpdatedTime;
                                        anotherNotebook.Usn = targetNotebook.Usn;
                                        anotherNotebook.IsDeleted = targetNotebook.IsDeleted;
                                        anotherNotebook.ShareNotebookId = "";
                                        anotherNotebook.ToUserId = ToUserId;
                                        anotherNotebook.ToGroupId = ""; 
                                        anotherNotebook.ToGroup = {};
                                        anotherNotebook.Perm = Perm;
                                        anotherNotebook.Subs = targetNotebook.Subs;
                                        anotherNotebook.Seq = targetNotebook.Seq;
                                        anotherNotebook.NotebookId = targetNotebook.NotebookId;
                                        anotherNotebook.IsDefault = targetNotebook.IsDefault;

                                        if(shareNotebooks.hasOwnProperty(senderUserId)) { // 如果receiver已经有过sender的share记录
                                            shareNotebooks[senderUserId].push(anotherNotebook);
                                        }
                                        else {
                                            console.log("new sender")
                                            shareNotebooks[senderUserId] = [];
                                            shareNotebooks[senderUserId].push(anotherNotebook);
                                        }
                                        var query = {"UserInfo.UserId": ToUserId};
                                        req.db.collection('allAppData').update(query, {$set:{"shareNotebooks": shareNotebooks}}, {upsert: true}, function(err, data) {
                                            if(err) {
                                                console.log(err);
                                                res.end('{"msg": "DB error", "status": "fail"}');
                                            }
                                            else {
                                                console.log("successfully update ShareNotebooks");
                                                res.end('{"msg": "Updated scuccessfully", "status": "success"}');
                                            }
                                        });
                                    }
                                });
                            }
                            else {
                                console.log("Receiver not found");
                                res.end('{"msg": "Account does not exist, please try again", "status": "fail"}');
                            }
                        }
                    });
                }
            }
            else {
                console.log("Note found sender");
                res.end('{"msg": "Sorry, please restart and try again", "status": "fail"}');
            }
        }
    });
});


app.post("/share/addShareNote", function(req, res) {
    console.log("/share/addShareNote activated");
    console.log("Body is: " + req.body);
	var parsedData = JSON.parse(req.body);
    var senderUserId = parsedData.SenderUserId;
    var Email = parsedData.Email;
    var NoteId = parsedData.NotebookId;
    var Perm = parsedData.Perm;
    
    var query = {"UserInfo.UserId": senderUserId};
    req.db.collection("allAppData").findOne(query, function(err, item) {
		if(err) {
            console.log("err is: " + err);
            res.end('{"msg": "DB error", "status": "fail"}');
        }
        else {
            if(item) {
                console.log("Found sender");
                var notebooks = item.notebooks;
                var targetNotebook;
                var senderUserInfo = item.UserInfo;
                console.log("sender userId is " + senderUserInfo.UserId);
//                var shareNotebooks = item.shareNotebooks;

               
                var query = {"UserInfo.Email": Email};
                req.db.collection("allAppData").findOne(query, function(err, item) {
                    if(err) {
                        console.log("err is: " + err);
                        res.end('{"msg": "Sorry, please try again in a minute", "status": "fail"}');
                    }
                    else {
                        if(item) { // 找到了receiver
                            console.log("Found receiver");

                            var targetUserInfo = item.UserInfo;  
                            var shareNotebooks = item.shareNotebooks;
                            var ToUserId = targetUserInfo.UserId;
                            console.log("receiver id is " + targetUserInfo.UserId);

                            // 更新目标ShareUserInfos
                            var anotherUserInfo = {};
                            anotherUserInfo.UserId = senderUserInfo.UserId;
                            anotherUserInfo.Email = senderUserInfo.Email;
                            anotherUserInfo.Verified = senderUserInfo.Verified;
                            anotherUserInfo.Username = senderUserInfo.Username;
                            anotherUserInfo.CreatedTime = senderUserInfo.CreatedTime;
                            anotherUserInfo.Logo = senderUserInfo.Logo;
                            anotherUserInfo.Theme = senderUserInfo.Theme;
                            anotherUserInfo.FromUserId = senderUserInfo.FromUserId;
                            anotherUserInfo.NoteCnt = senderUserInfo.NoteCnt;
                            anotherUserInfo.Usn = senderUserInfo.Usn;
                            console.log("anotherUserInfo email is " + anotherUserInfo.Email);

                            // 更新receiver的sharedUserInfos
                            var query = {"UserInfo.UserId": ToUserId};
                            req.db.collection('allAppData').update(query, {$addToSet:{"sharedUserInfos": anotherUserInfo}}, {upsert: true}, function(err, data) {
                                if(err) {
                                    console.log(err);
                                    res.end('{"msg": "Sorry, please try again in a minute", "status": "fail"}');
                                }
                                else {
                                    console.log("successfully update ShareUserInfos");
                                    res.end('{"msg": "success", "status": "success", "ToUserId":' + '"' + ToUserId + '"' + '}');
//                                    res.json(JSON.stringify(receiverUserId));
                                }
                            });
                        }
                        else {
                            console.log("Note found receiver");
                            res.end('{"msg": "Account does not exist, please try again", "status": "fail"}');
                        }
                    }
                    });
                }
                else {
                    console.log("Note found sender");
                    res.end('{"msg": "Sorry, please restart and try again", "status": "fail"}');
                }
        }
    });
});


app.post("/share/addGroupShareNote", function(req, res) {
    console.log("/share/addGroupShareNote activated");
    console.log("Body is: " + req.body);
    var parsedData = JSON.parse(req.body);
    var senderUserId = parsedData.SenderUserId;
    var groupId = parsedData.GroupId;
    var perm = parsedData.Perm;
    
    var query = {"UserInfo.UserId": senderUserId};
    req.db.collection("allAppData").findOne(query, function(err, item) {
        if(err) {
            console.log("err is: " + err);
            res.end('{"msg": "Sorry, please try again in a minute", "status": "fail"}');
        }
        else {
            if(item) {
                console.log("Found sender");
                var notebooks = item.notebooks;
                var targetNotebook;
                var senderUserInfo = item.UserInfo;
                console.log("sender userId is " + senderUserInfo.UserId);

                // look for group
                var usersShareTo = 0;
                var group = item.group;
//                console.log("group is " + group[0].GroupId);
                var ToUserIds = [];
                for(var i in group) {
                    console.log("current groupid is " + group[i].GroupId);
                    if(group[i].GroupId == groupId) {
                        usersShareTo = group[i].Members;
                        break;
                    }
                }
                if(usersShareTo) {
                    var count = 0;
                    for(var i in usersShareTo) {
                        var email = usersShareTo[i].Email;
                        var query = {"UserInfo.Email": email};
                        req.db.collection("allAppData").findOne(query, function(err, item) {
                            if(err) {
                                console.log("err is: " + err);
                                res.end('{"msg": "DB error", "status": "fail"}');
                            }
                            else {
                                if(item) { // 找到了receiver
                                    console.log("Found one receiver");

                                    var targetUserInfo = item.UserInfo;  
                                    var shareNotebooks = item.shareNotebooks;
                                    var ToUserId = targetUserInfo.UserId;
                                    console.log("receiver id is " + targetUserInfo.UserId);
                                    // 更新目标ShareUserInfos
                                    var anotherUserInfo = {};

                                    anotherUserInfo.UserId = senderUserInfo.UserId;
                                    anotherUserInfo.Email = senderUserInfo.Email;
                                    anotherUserInfo.Verified = senderUserInfo.Verified;
                                    anotherUserInfo.Username = senderUserInfo.Username;
                                    anotherUserInfo.CreatedTime = senderUserInfo.CreatedTime;
                                    anotherUserInfo.Logo = senderUserInfo.Logo;
                                    anotherUserInfo.Theme = senderUserInfo.Theme;
                                    anotherUserInfo.FromUserId = senderUserInfo.FromUserId;
                                    anotherUserInfo.NoteCnt = senderUserInfo.NoteCnt;
                                    anotherUserInfo.Usn = senderUserInfo.Usn;
                                    console.log("anotherUserInfo email is " + anotherUserInfo.Email);

                                    // 更新receiver的sharedUserInfos
                                    var query = {"UserInfo.UserId": ToUserId};
                                    req.db.collection('allAppData').update(query, {$addToSet:{"sharedUserInfos": anotherUserInfo}}, {upsert: true}, function(err, data) {
                                        if(err) {
                                            console.log(err);
                                            res.end('{"msg": "DB error", "status": "fail"}');
                                            return;
                                        }
                                        else {
                                            console.log("successfully update ShareUserInfos");
//                                            res.end('{"msg": "success", "status": "success", "ToUserId":' + '"' + ToUserId + '"' + '}');
                                            ToUserIds.push(ToUserId);
                                            
                                            count++;
                                            if(count == (usersShareTo.length)) {
                                                res.end('{"msg": "success", "status": "success", "ToUserIds":' + JSON.stringify(ToUserIds) + '}');
                                            }
                                        }
                                    });
                                }
                                else {
                                    console.log("Not found receiver");
//                                    res.end('{"msg": "receiver not found", "status": "fail"}');
                                }
                            }
                        });

                    }
                }
                else {
                    console.log("Group not found");
                    res.end('{"msg": "Group not found", "status": "fail"}');
                }
            }
            else {
                console.log("Sender not found");
                res.end('{"msg": "Sender not found", "status": "fail"}');
            }
        }
    });
});
                                            

app.post("/share/addGroupShareNotebook", function(req, res) {
    console.log("/share/addGroupShareNotebook activated");
    console.log("Body is: " + req.body);
	var parsedData = JSON.parse(req.body);
    var senderUserId = parsedData.SenderUserId;
//    var email = parsedData.Email;
    var notebookId = parsedData.NotebookId;
    var perm = parsedData.Perm;
    var groupId = parsedData.GroupId;
    
    var query = {"UserInfo.UserId": senderUserId};
    req.db.collection("allAppData").findOne(query, function(err, item) {
		if(err) {
            console.log("err is: " + err);
            res.end('{"msg": "DB error", "status": "fail"}');
        }
        else {
            if(item) {
                console.log("Found sender");
                var notebooks = item.notebooks;
                var targetNotebook = 0;
                var senderUserInfo = item.UserInfo;

                for(var i in notebooks) {
                    var curNotebook = notebooks[i];
                    if(curNotebook.NotebookId == notebookId) {
                        console.log("Found notebook");
                        targetNotebook = curNotebook;
                        break;
                    }
                }
                
                if(!targetNotebook) { // 没找到notebook
                    console.log("Notebook not found");
                    res.end('{"msg": "Not found notebook", "status": "fail"}');
                }
                else { // 找到了要分享的notebook
                    // look for group
                    var usersShareTo = 0;
                    var group = item.group;
                    console.log("group id is " + groupId);
                    console.log("this group id is " + group[0].GroupId);
                    for(var i in group) {
                        if(group[i].GroupId == groupId) {
                            usersShareTo = group[i].Members;
                            break;
                        }
                    }
                    if(usersShareTo) { // 找到了group
                        for(var i in usersShareTo) {
                            var email = usersShareTo[i].Email;
                            var query = {"UserInfo.Email": email};
                            req.db.collection("allAppData").findOne(query, function(err, item) {
                                if(err) {
                                    console.log("err is: " + err);
                                    res.end('{"msg": "DB error", "status": "fail"}');
                                }
                                else {
                                    if(item) { // 找到了一个receiver
                                        console.log("Found one receiver");

                                        var targetUserInfo = item.UserInfo;  
                                        var shareNotebooks = item.shareNotebooks;
                                        var ToUserId = targetUserInfo.UserId;
                                        console.log("receiver id is " + targetUserInfo.UserId);
                                        // 更新目标ShareUserInfos
                                        var anotherUserInfo = {};

                                        anotherUserInfo.UserId = senderUserInfo.UserId;
                                        anotherUserInfo.Email = senderUserInfo.Email;
                                        anotherUserInfo.Verified = senderUserInfo.Verified;
                                        anotherUserInfo.Username = senderUserInfo.Username;
                                        anotherUserInfo.CreatedTime = senderUserInfo.CreatedTime;
                                        anotherUserInfo.Logo = senderUserInfo.Logo;
                                        anotherUserInfo.Theme = senderUserInfo.Theme;
                                        anotherUserInfo.FromUserId = senderUserInfo.FromUserId;
                                        anotherUserInfo.NoteCnt = senderUserInfo.NoteCnt;
                                        anotherUserInfo.Usn = senderUserInfo.Usn;
                                        console.log("anotherUserInfo email is " + anotherUserInfo.Email);
                                        
                                        // 更新receiver的sharedUserInfos
                                        var query = {"UserInfo.UserId": ToUserId};
                                        req.db.collection('allAppData').update(query, {$addToSet:{"sharedUserInfos": anotherUserInfo}}, {upsert: true}, function(err, data) {
                                            if(err) {
                                                console.log(err);
                                                res.end('{"msg": "DB error", "status": "fail"}');
                                            }
                                            else {
                                                console.log("successfully update ShareUserInfos");

                                                // 更新receiver的ShareNotebooks
                                                var anotherNotebook = {};
                                                anotherNotebook.ParentNotebookId = targetNotebook.ParentNotebookId;
                                                anotherNotebook.Title = targetNotebook.Title;
                                                anotherNotebook.UrlTitle = targetNotebook.UrlTitle;
                                                anotherNotebook.NumberNotes = targetNotebook.NumberNotes;
                                                anotherNotebook.IsBlog = targetNotebook.IsBlog;
                                                anotherNotebook.UpdatedTime = targetNotebook.UpdatedTime;
                                                anotherNotebook.Usn = targetNotebook.Usn;
                                                anotherNotebook.IsDeleted = targetNotebook.IsDeleted;
                                                anotherNotebook.ShareNotebookId = "";
                                                anotherNotebook.ToUserId = ToUserId;
                                                anotherNotebook.ToGroupId = ""; 
                                                anotherNotebook.ToGroup = {};
                                                anotherNotebook.Perm = perm;
                                                anotherNotebook.Subs = targetNotebook.Subs;
                                                anotherNotebook.Seq = targetNotebook.Seq;
                                                anotherNotebook.NotebookId = targetNotebook.NotebookId;
                                                anotherNotebook.IsDefault = targetNotebook.IsDefault;

                                                if(shareNotebooks.hasOwnProperty(senderUserId)) { // 如果receiver已经有过sender的share记录
                                                    shareNotebooks[senderUserId].push(anotherNotebook);
                                                }
                                                else {
                                                    console.log("new sender")
                                                    shareNotebooks[senderUserId] = [];
                                                    shareNotebooks[senderUserId].push(anotherNotebook);
                                                }
                                                var query = {"UserInfo.UserId": ToUserId};
                                                req.db.collection('allAppData').update(query, {$set:{"shareNotebooks": shareNotebooks}}, {upsert: true}, function(err, data) { // 更新shareNotebooks
                                                    if(err) {
                                                        console.log(err);
                                                        res.end('{"msg": "DB error", "status": "fail"}');
                                                    }
                                                    else {
                                                        console.log("successfully update ShareNotebooks");
                                                        res.end('{"msg": "Updated scuccessfully", "status": "success"}');
                                                    }
                                                });
                                            }
                                        });
                                    }
                                    else {
                                        console.log("Not found receiver");
                                        res.end('{"msg": "receiver not found", "status": "fail"}');
                                    }
                                }
                            });
                        }
                    }
                    else {
                        console.log("Not found group");
                        res.end('{"msg": "group not found", "status": "fail"}');
                    }
                }
            }
            else {
                console.log("Sender not found");
                res.end('{"msg": "sender not found", "status": "fail"}');
            }
        }
    });
});

app.get("/share/listShareNotes", function(req, res) {
    console.log("/share/listShareNotes activated");
//    var parsedData = JSON.parse(req.body);
//	var UserId = parsedData.userId;
//    var NotebookId = parsedData.notebookId;
    var UserId = req.query.UserId;
    var NotebookId =  req.query.NotebookId;
    var CurUserId = req.query.CurUserId; // 被share的user的id
    // 分享的是一个整个笔记本
    console.log("UserId is " + UserId);
    console.log("NotebookId is " + NotebookId);
    if(NotebookId && UserId) {
    	var query = {"UserInfo.UserId": UserId};
    	req.db.collection("allAppData").findOne(query, function(err, item) {
		if(err) console.log("err is: " + err);
		else {
			if(item) {
				console.log("Found User");
                var allNotes = [];
                if(NotebookId == "share0") { // if it is in default sharing notebook
                    console.log("this is single notes sharing")
                    var shareNotebookDefault = item.shareNotebookDefault;
                    
                    var thisShareNotes = shareNotebookDefault[CurUserId];
                    if(thisShareNotes != undefined) {
                        var notes = item.notes;
                        for(var i in thisShareNotes) {
                            var curNoteId = thisShareNotes[i].NoteId;
                            for(var j in notes) {
                                if(curNoteId == notes[j].NoteId) {
                                    allNotes.push(notes[j]);
                                }
                            }
                        }
                        res.json(JSON.stringify(allNotes));
                    }
                    else { // 不存在share给当前用户的笔记
                        console.log("Not found any note");
				        res.end('{"msg": "Not found any note", "status": "success"}');
                    }
                }
                else {     
                    var notebooks = item.notebooks;
                    var isFound = !1;
                    for(var i in notebooks) {
    //                    console.log(i);
                        var curNotebook = notebooks[i];
                        if(curNotebook.NotebookId == NotebookId) {
                            console.log("Found notebook");
                            isFound = !0;
                            break;
                        }
                    }
                    if(!isFound) {
                        console.log("Not found notebook")
                        res.end('{"msg": "Not found notebook", "status": "fail"}');
                    }
                    else {
                        var notes = item.notes;
                        for(var i in notes) {
                            var curNote = notes[i];
                            if(curNote.NotebookId == NotebookId) {
                                allNotes.push(curNote);
                            }
                        }
                    }
                    res.json(JSON.stringify(allNotes));
                }
    //                    res.end('{"msg": "found notebook", "status": "success"}');
			}
			else {
				console.log("Not found user");
				res.end('{"msg": "Not found user", "status": "fail"}');
			}
		}
	});
    }
    else {
        res.end('{"msg": "wrong input", "status": "fail"}');
    }
});
   


app.get("/getAll", function(req, res) {
	// res.header('Access-Control-Allow-Origin', '*'); // implementation of CORS
	console.log("get activated");
	// console.log(req);
	var UserId = req.query.UserId;
    console.log("UserId is: " + UserId);
	var query = {"UserInfo.UserId": UserId};
	req.db.collection("allAppData").findOne(query, function(err, item) {
		if(err) console.log("err is: " + err);
		else {
			if(item) {
				console.log("Found data");
				res.json(JSON.stringify(item));
			}
			else {
				console.log("Not found data");
				res.end('{"msg": "Not found data", "status": "fail"}');
			}
		}
		
	});
	
	//var cursor = req.db.collection("allAppData").find(query);
	//cursor.each(function(err, doc) {
	//	if(err) console.log("err is: " + err);
	//	else {
	//		console.log(doc.UserInfo.UserId);
	//		break;
	//	}
	//});
	//res.json(JSON.stringify(cursor[0]));
});

app.listen(8000);
