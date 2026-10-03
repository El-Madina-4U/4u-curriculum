// TIMELINE
const currentDate = new Date();

document.addEventListener("DOMContentLoaded", function () {
  const nodesContainer = document.getElementById("nodes");
  const addButton = document.getElementById("add-event-btn");
  const inputYear = document.getElementById("year-input");
  const inputEvent = document.getElementById("event-input");
  var historicalEvents = [];

  function loadEventsFromLocalStorage() {
    const storedEvents = localStorage.getItem("historicalEvents");
    if (storedEvents) {
      historicalEvents = JSON.parse(storedEvents);
      renderTimelineEvents();
    } else {
      // Initial events
        historicalEvents = [
          { year: 1977, event: "Wildcats formed" },
          { year: 1980, event: "Joined National League" },
          { year: 1996, event: "Won Championship trophy" },
          { year: currentDate.getFullYear(), event: "Now" },
        ];
        renderTimelineEvents();
    }
  } 

  // Function to put events on the timeline
  function renderTimelineEvents() {
    nodesContainer.innerHTML = "";
    const minYear = historicalEvents[0].year;
    const maxYear = historicalEvents[historicalEvents.length - 1].year;
    const totalYears = maxYear - minYear;

    historicalEvents.forEach((event) => {
      const node = document.createElement("div");
      node.classList.add("event");

      // Calculate the percentage width based on the time difference
      let percentageWidth = ((event.year - minYear) / totalYears) * 100;
      console.log(percentageWidth);
      node.style.left = percentageWidth + "%";
      node.innerHTML = `<span class="year">${event.year}</span><span class="event-description">${event.event}</span>`;
      nodesContainer.appendChild(node);
    });
  }

  // Function to add a new event
  function addNewEvent(year, event) {
    const newEvent = { year: parseInt(year), event: event };
    historicalEvents.push(newEvent);
    historicalEvents.sort((a, b) => a.year - b.year); // Sort events chronologically
    renderTimelineEvents();
    localStorage.setItem("historicalEvents", JSON.stringify(historicalEvents));

  }

  // Add initial events when the page loads
  loadEventsFromLocalStorage(); 

  // Mouse rollover
  nodesContainer.addEventListener("mouseover", function (event) {
    const targetNode = event.target.closest(".event");
    if (targetNode) {
      const description = targetNode.querySelector(".event-description");
      description.style.display = "block";
    }
  });

  nodesContainer.addEventListener("mouseout", function (event) {
    const targetNode = event.target.closest(".event");
    if (targetNode) {
      const description = targetNode.querySelector(".event-description");
      description.style.display = "none";
    }
  });

  // Add event listener for adding a new event
  addButton.addEventListener("click", function () {
    const yearInputValue = inputYear.value;
    const eventInputValue = inputEvent.value;

    if (yearInputValue && eventInputValue) {
      addNewEvent(yearInputValue, eventInputValue);
      inputYear.value = "";
      inputEvent.value = "";
    } else {
      alert("Please fill in both the year and event fields.");
    }
  });
});