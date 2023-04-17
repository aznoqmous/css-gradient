import "../scss/style.scss"
import "./extensions"
import App from "./App"
document.addEventListener('DOMContentLoaded', ()=>{
    let app = new App()
   
    
   // conic
   app.fromCss(`
   background-image: conic-gradient(from 150deg at 50% 10%, #ffd100 0deg, #ffd100 60deg, transparent 60deg), linear-gradient(0deg, teal 0%, transparent 100%), conic-gradient(from -30deg at 50% 85%, orange 0deg, orange 60deg, transparent 60deg);
   background-size: 2rem 2rem,100% 1rem,2rem 2rem;
   background-position: 0% 0%,0% 0%,0% 0%;
   `)
   

})