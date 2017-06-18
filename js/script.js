var navbar = document.querySelector('nav.navbar');
var header = document.querySelector('header.header');
var sections = document.getElementsByTagName('section');
var navbarItems = document.getElementsByClassName('navbar-item');
var actualSection;
var scrollSpy = true;
var firstScrollAfterNavigation = false;

var cumulativeOffset = function(element) {
    var top = 0;
    do {
        top += element.offsetTop || 0;
        element = element.offsetParent;
    } while (element)
    return top;
};

var deleteActiveClass = function() {
    var activeSections = document.getElementsByClassName('navbar-item active');
    if (activeSections.length) {
        activeSections[0].classList.remove('active');
    }
}

var setElementAsActualSection = function(element) {
    actualSection = element;
    if (actualSection === header) {
        navbar.classList.remove('navbar-opaque');
    } else {
        navbar.classList.add('navbar-opaque');
    }
}

var getElementByNameAndScroll = function(name) {
    var element;
    if (name === '') {
        element = document.getElementsByClassName('header')[0];
    } else {
        element = document.getElementById(name);
    }
    scrollToElement(element, 2);
}

var getElementPosition = function(element) {
    var elementPosition = window.pageYOffset + element.getBoundingClientRect().top;
    elementPosition = elementPosition == 0 ? 0 : elementPosition - navbar.scrollHeight;
    // If element is close to page's bottom
    if (document.body.scrollHeight - elementPosition < window.innerHeight) {
        elementPosition = document.body.scrollHeight - window.innerHeight
    }
    return elementPosition;
}

// easeInOutCubic function (from https://gist.github.com/gre/1650294)
var easing = function(t) {
    return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
}

var scrollToElement = function(element, speed) {
    // Speed parameter: pixels per miliseconds

    // Initial position, final position and scroll
    var startPos = window.pageYOffset;
    var finalPos = getElementPosition(element);
    var scrollPixels = finalPos - startPos;
    if (scrollPixels === 0) return;

    // Total scroll duration (miliseconds, max 1000)
    var scrollTime = parseInt(Math.abs(scrollPixels) / speed);
    // scrollTime = scrollTime > 1000 ? 1000 : scrollTime;

    var startTime;

    setElementAsActualSection(element);
    scrollSpy = false;

    window.requestAnimationFrame(function step(timestamp) {
        startTime = startTime || timestamp;
        var elapsedTime = timestamp - startTime;
        var percent = easing(Math.min(elapsedTime / scrollTime, 1));
        window.scrollTo(0, startPos + scrollPixels * percent);
        if (elapsedTime <= scrollTime) {
            window.requestAnimationFrame(step);
        } else {
            scrollSpy = true;
            if (scrollPixels > 0) {
                firstScrollAfterNavigation = true;
            }
        }
    });
}

var changeMenuStyle = function() {
    if (!scrollSpy) return;
    if (!sections.length) return;
    if (firstScrollAfterNavigation) {
        firstScrollAfterNavigation = false;
        return;
    }

    if (window.pageYOffset < sections[0].cumulativeOffset) {
        if (actualSection !== header) {
            deleteActiveClass();
            document.querySelector("a[href='#']").parentNode.classList.add('active');
            setElementAsActualSection(header);
        }
    } else {
        for (var i = sections.length - 1; i >= 0; i--) {
            if (window.pageYOffset >= sections[i].cumulativeOffset) {
                if (actualSection !== sections[i]) {
                    deleteActiveClass();
                    document.querySelector("a[href$='" + sections[i].id + "']").parentNode.classList.add('active');
                    setElementAsActualSection(sections[i]);
                }
                i = 0;
            }
        }
    }
}

for (var i = 0; i < sections.length; i++) {
    sections[i].cumulativeOffset = cumulativeOffset(sections[i]) - navbar.scrollHeight;
}

for (var i = 0; i < navbarItems.length; i++) {
    navbarItems[i].addEventListener('click', function(event) {
        deleteActiveClass();
        this.classList.add('active');
        var sectionToGo = this.getElementsByTagName('a')[0].href.split('#');
        if (sectionToGo.length > 1) {
            event.preventDefault();
            var goTo = sectionToGo[sectionToGo.length - 1];
            getElementByNameAndScroll(goTo);
        }
    });
}

window.addEventListener('scroll', changeMenuStyle);

var acc = document.getElementsByClassName('accordion-item');
var activeAccordion;

for (var i = 0; i < acc.length; i++) {
    acc[i].onclick = function() {
        if (activeAccordion && activeAccordion !== this) {
            toggleAccordion(activeAccordion);
        }
        toggleAccordion(this);
    }
}

function toggleAccordion(element) {
    element.classList.toggle('active');
    element.nextElementSibling.classList.toggle('show');
    activeAccordion = element.classList.contains('active') ? element : null;
}

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

function sendNotification(data) {

    notificationData = formatNotification(data);
    if (!('Notification' in window)) {
        alert(notificationData.message + '\n' + notificationData.options.body);
    }
    else if (Notification.permission === 'granted') {
        var notification = new Notification(notificationData.message, notificationData.options);
    } else if (Notification.permission !== 'denied') {
        Notification.requestPermission(function(permission) {
            if (permission === 'granted') {
                var notification = new Notification(notificationData.message, notificationData.options);
            }
        });
    } 
}

function formatNotification(data) {
    return {
        message: 'Hola, ' + data.name,
        options: {
            body: 'He recibido tu mensaje y en breve te contestaré a ' + data.email
        }
    }
}
