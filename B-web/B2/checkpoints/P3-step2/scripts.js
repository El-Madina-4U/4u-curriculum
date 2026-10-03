// Hide bounce observer
const bounceObserver = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting) {
    console.log("BOUNCE TRIGGER IN VIEWPORT");
    document.querySelector("#bounce").style.opacity = 0;
  }
});
bounceObserver.observe(document.querySelector("#hideBounce"));

// Image observer

