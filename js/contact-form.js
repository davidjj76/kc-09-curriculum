var form = document.getElementById('contact-form');
var nameInput = document.getElementById('form-name');
var emailInput = document.getElementById('form-email');
var phoneInput = document.getElementById('form-phone');
var messageInput = document.getElementById('form-message');
var knownInputs = document.getElementsByName('form-known');
var otherHiddenMessage = document.getElementById('known-other').parentNode.lastElementChild;

var otherInput = document.createElement('input');
otherInput.setAttribute('id', 'form-other');
otherInput.setAttribute('type', 'text');
otherInput.setAttribute('name', 'other');
otherInput.setAttribute('placeholder', 'Cómo me has conocido');
otherInput.setAttribute('required', '');
otherInput.style.marginTop = '20px';

for (var i = 0; i < knownInputs.length; i++) {
    knownInputs[i].addEventListener('click', function(event) {
        if (this.value == 'other') {
            this.parentNode.insertBefore(otherInput, otherHiddenMessage);
            otherInput.focus();
        } else {
            if (document.getElementById('form-other')) {
                this.parentNode.removeChild(otherInput);
            }
        }
    });
}

form.addEventListener('submit', function(event) {
    event.preventDefault();
    if (!validateInput(nameInput)) {
        nameInput.focus();
        return false;
    }
    if (!validateInput(emailInput)) {
        emailInput.focus();
        return false;
    }
    if (!validateInput(phoneInput)) {
        phoneInput.focus();
        return false;
    }
    if (!validateInput(messageInput)) {
        messageInput.focus();
        return false;
    }
    if (document.getElementById(otherInput.id)) {
		if (!validateInput(otherInput)) {
		    otherInput.focus();
		    return false;
		}
    } else {
        if (!validateInput(knownInputs[knownInputs.length - 1])) {
            return false;
        }
    }
    sendNotification({
        name: form.elements["form-name"].value,
        email: form.elements["form-email"].value,
    });
    if (document.getElementById(otherInput.id)) {
        otherInput.parentNode.removeChild(otherInput);
    }
    form.reset();
});

function validateInput(elementInput) {
    var errorMessage = document.querySelector('#' + elementInput.id + ' ~ span');
    if (elementInput === messageInput) {
        return validateMessageInput(elementInput, errorMessage);
    } else {
        if (!elementInput.checkValidity()) {
            errorMessage.classList.add('error-message');
            return false;
        } else {
            errorMessage.classList.remove('error-message');
            return true;
        }
    }
}

function validateMessageInput(messageInput, errorMessage) {
    var error = false;
    var message = messageInput.value;
    console.log(message);
    if (message == '') {
        errorMessage.textContent = 'Por favor, introduce un mensaje';
        error = true;
    }
    if (countWords(message) > 150) {
        errorMessage.textContent = 'Por favor, el mensaje no puede exceder de 150 palabras';
        error = true;
    }
    if (error) {
        errorMessage.classList.add('error-message');
    } else {
        errorMessage.classList.remove('error-message');
    }
    return !error;
}

function countWords(text) {
    // Excluir espacio en blanco inicial y final
    text = text.replace(/(^\s*)|(\s*$)/gi, '');
    // Convertir dos espacios consecutivos en uno
    text = text.replace(/[ ]{2,}/gi, ' ');
    // Excluir espacio al inicio de nueva linea
    text = text.replace(/\n /, '\n');
    // Devolver el numero de palabras
    return text.split(' ').length;
}
