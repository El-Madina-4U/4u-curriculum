let openHam = document.querySelector('#openHam');
let closeHam = document.querySelector('#closeHam');
let navigationItems = document.querySelector('.nav-items');

const burgerEvent = (navigation, close, open) => {
    if (navigation == "none"){
        navigationItems.style.removeProperty("display");
    } else {
        navigationItems.style.display = navigation;
    }
    closeHam.style.display = close;
    openHam.style.display = open;
}

openHam.addEventListener('click', () => burgerEvent("flex", "block", "none"));
closeHam.addEventListener('click', () => burgerEvent("none", "none", "block"));