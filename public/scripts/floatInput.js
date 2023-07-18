function floatLoad() {
    const floatFields = document.querySelectorAll('.float-field');
    floatFields.forEach((element) => {
        if (element.value) {
            element.classList.add('active');
        }
        element.addEventListener('focus', handleFocus);
        element.addEventListener('blur', handleBlur);
    });
}

function handleFocus(e) {
    const target = e.target;
    target.parentNode.classList.add('active');
    target.parentNode.classList.add('active-color');
}

function handleBlur(e) {
    const target = e.target;
    if (!target.value) {
        target.parentNode.classList.remove('active');
    }
    target.parentNode.classList.remove('active-color');
}

floatLoad();