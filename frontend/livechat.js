
    import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
    import { getDatabase, ref, set, remove, onChildAdded, onChildRemoved } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

    const firebaseConfig = {
        apiKey: "AIzaSyC8O19iH3etwcg16lZ85Uoi2YwbJ3P9IXc",
        authDomain: "cs330finallive.firebaseapp.com",
        projectId: "cs330finallive",
        storageBucket: "cs330finallive.appspot.com",
        messagingSenderId: "1064408443437",
        appId: "1:1064408443437:web:b69c8af6e49cbed6a066a4"
    };

    const app = initializeApp(firebaseConfig);
    const db = getDatabase(app);

    // variables
    var msgTxt = document.getElementById('msgTxt');
    var sender;

   
    var selectedBoard = { id: "yourDefaultBoardId" };

    if (sessionStorage.getItem('sender')) {
        sender = sessionStorage.getItem('sender');
    } else {
   
    }

    module.sendMsg = function sendMsg() {
        var msg = msgTxt.value;
        var timestamp = new Date().getTime();
        set(ref(db, "messages/" + timestamp), {
            msg: msg,
            sender: sender,
            boardId: selectedBoard.id 
        });

        msgTxt.value = "";
    };

    onChildAdded(ref(db, "messages"), (data) => {
        // Display messages only if boardId matches selectedBoard.id
        if (data.val().boardId === selectedBoard.id) {
            if (data.val().sender == sender) {
                messages.innerHTML += "<div style=justify-content:end class=outer id=" + data.key + "><div id=inner class=me>you : " + data.val().msg + "<button id=dltMsg onclick=module.dltMsg(" + data.key + ")>X</button></div></div>";
            } else {
                messages.innerHTML += "<div class=outer id=" + data.key + "><div id=inner class=notMe>" + data.val().sender + " : " + data.val().msg + "</div></div>";
            }
        }
    });

    module.dltMsg = function dltMsg(key) {
        remove(ref(db, "messages/" + key));
    };

    onChildRemoved(ref(db, "messages"), (data) => {
        var msgBox = document.getElementById(data.key);
        messages.removeChild(msgBox);
    });

