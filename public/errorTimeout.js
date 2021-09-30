document.addEventListener('DOMContentLoaded', function() {
    let errorElem = document.querySelector('.errorMessages')
    if(errorElem!==""){
        setTimeout(()=>{
            errorElem.innerHTML ='' 
        },3000)
    }
});