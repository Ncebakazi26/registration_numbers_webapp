document.addEventListener('DOMContentLoaded', function() {
    let errorElem = document.querySelector('.errorMessages')
    let elem = document.querySelector('.messages')
    if(elem!==""){
        setTimeout(() => {
            elem.innerHTML = ""
        },3000);
    }
    if(errorElem!==""){
        setTimeout(()=>{
            errorElem.innerHTML ='' 
        },3000);
    }
});