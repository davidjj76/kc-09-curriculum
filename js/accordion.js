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
