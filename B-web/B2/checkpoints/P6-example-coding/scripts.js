// Observers
const slot1 = document.querySelector("#slot-1");
const slot1observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      slot1.classList.add("fade-in");
    }
}, {threshold: 0.5});
slot1observer.observe(slot1);

const slot2 = document.querySelector("#slot-2");
const slot2observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      slot2.classList.add("grow-in");
    }
}, {threshold: 0.5});
slot2observer.observe(slot2);

const slot3 = document.querySelector("#slot-3");
const slot3observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      slot3.classList.add("slide-left");
    }
}, {threshold: 0.5});
slot3observer.observe(slot3);