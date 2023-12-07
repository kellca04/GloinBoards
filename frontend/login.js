import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
    import { getAuth, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
  
  
    const firebaseConfig = {
      apiKey: "AIzaSyDzwc1I7BPqfSsfe_f-0an3DPFM-WnEW9s",
      authDomain: "login-4fc5a.firebaseapp.com",
      projectId: "login-4fc5a",
      storageBucket: "login-4fc5a.appspot.com",
      messagingSenderId: "695918260296",
      appId: "1:695918260296:web:364c4d62d946f051b2a87d"
    };
  
    
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    auth.languageCode ='en'
    const provider = new GoogleAuthProvider();
    const googleLogin =document.getElementById("google-login-btn");
    googleLogin.addEventListener('click', function(){
        signInWithPopup(auth, provider)
        .then((result) => { 
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const user = result.user;
            
            const displayNameParts = user.displayName.split(' ');
            const firstName = displayNameParts.length > 0 ? displayNameParts[0] : '';
    
            console.log(user);
            window.sessionStorage.setItem('sender', firstName); 
            window.location.href = "/index.html";
    
        }).catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
        });  
    });
    
