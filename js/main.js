// On document load
$( document ).ready( function() {
    loadWall();
    enablePanAndZoom();
    enableBoxSearchCallbacks();
    showControls();
    enableFilters();
});

function loadWall() {
    fetch('data/DMBD_DATA.csv')
    .then(response => response.text())
    .then(csv => csvToObject(csv))
    .then(box_data => {
        for (box of box_data) {
            createBox(box);
        }
    });
}
function csvToObject(csv, delimiter=',') {
    const titles = csv.slice(0, csv.search(/(\r\n|\n|\r)/gm)).split(delimiter);
    return csv.slice(csv.indexOf('\n') + 1).replace(/\r/gm, "").trimEnd().split('\n').map(line => {
        const values = line.split(delimiter);
        return obj = titles.reduce( (obj, title, index) => {
            obj[title] = values[index];
            return obj;
        }, {} );
    });
}

// Box pixel size in portrait orientation
const BOX_WIDTH = 69;  // nice
const BOX_HEIGHT = BOX_WIDTH*(4/3);

function createBox(box) {
    box.details = "Box #"+box.box_number+":\n"+box.name+(box.year ? "\n("+box.year+")" : "");
    const boxContainer = createContainer();
    const boxDetailsContainer = createAndAppendElement(boxContainer, "div", "box-details-container");
    const boxImage = createImage();
    const boxDetails = createDetails();
    $(boxImage).on("openModal", configureModal)
    addToSearchList();

    function createContainer() {
        const wall = document.getElementById("wall");
        const container = createAndAppendElement(wall, "div", "box-container year-"+box.year);
        container.id = "box-" + box.box_number;
        container.style.gridRow = - box.row;  // row 1 is at the bottom
        switch (box.wall_orientation) {
            case "portrait":
                container.style.width = BOX_WIDTH + "px";
                container.style.height = BOX_HEIGHT + "px";
                container.style.gridColumn = box.column + " / span 6";
                break;
            case "landscape":
                container.style.width = BOX_HEIGHT + "px";
                container.style.height = BOX_WIDTH + "px";
                container.style.gridColumn = box.column + " / span 8";
                break;
            default:
                throw new Error("Box "+box.box_number+" has an invalid wall orientation: "+box.wall_orientation);
        }
        return container;
    }
    function createImage() {
        const img = createAndAppendElement(boxDetailsContainer, "img", "box-image");
        img.style.backgroundColor = randomPastelColorGenerator();
        img.src = "data/images/box_previews/box (" + box.box_number + ").jpg";
        switch (box.wall_orientation) {
            case "portrait":
                img.width = BOX_WIDTH;
                img.height = BOX_HEIGHT;
                break;
            case "landscape":
                img.width = BOX_HEIGHT;
                img.height = BOX_WIDTH;
                break;
            default:
                throw new Error("Box "+box.box_number+" has an invalid wall orientation: "+box.wall_orientation);
        }
        return img;
    }
    function createDetails() {
        const details = document.createElement("div");
        details.className = "box-details text-white mb-0";
        details.innerText = box.details;
        $(boxImage).on("mouseenter", () => {
            boxDetailsContainer.appendChild(details);
            boxDetailsContainer.classList.add("hover");
        }).on("mouseleave", () => {
            boxDetailsContainer.removeChild(details);
            boxDetailsContainer.classList.remove("hover");
        });
    }
    function configureModal() {
        $("#box-modal .modal-content").attr("displayBox", box.box_number);
        $("#modal-details").text(box.details.replace(/\n/gm, " "));
        turnOffSearch();
        const img = document.querySelector("#box-modal img");
        img.src = "data/images/box_previews/box (" + box.box_number + ").jpg";
        new Promise( resolve => {
            img.onload = img.onerror = resolve;
        }).then( () => {
            img.className = (box.orientation != box.wall_orientation) ? "rotated" : "";
            $("#box-modal").modal('show');
            setMaxHeight();
            img.src = "data/images/boxes/box (" + box.box_number + ").jpg";
        });
        setLeftAndRightButtons();

        function setMaxHeight() {
            const content = $("#box-modal .modal-content");
            content.css("--header-height", $("#box-modal header").outerHeight() + "px");
            content.css("--footer-height", $("#box-modal footer").outerHeight() + "px");
        }
        function setLeftAndRightButtons() {
            ["left", "up", "down", "right"].forEach( (direction) => {
                const directionButton = $("#"+direction);
                directionButton.off();
                if (box[direction]) {
                    directionButton.removeClass("d-none");
                    directionButton.on("click", () => {
                        $("#box-"+box[direction]+" img").trigger("openModal");
                    });
                } else {
                    directionButton.addClass("d-none");
                }
            });
        }
    }
    function addToSearchList() {
        const list = document.getElementById("box-list");
        const option = createAndAppendElement(list, "option");
        option.value = box.details.replace(/\n/gm, " ");
    }
}

// Display descriptions for controls
function showControls() {
    window.addEventListener('mousemove', function showMouseControls() {
        document.getElementById("mouse-controls-description").style.display = "block";
        document.getElementById("touch-controls-description").style.display = "none";
    });
    window.addEventListener('touchstart', function showTouchControls() {
        document.getElementById("mouse-controls-description").style.display = "none";
        document.getElementById("touch-controls-description").style.display = "block";
    });
}

// Search for a box
function openSearchBox() {
    turnOffSearch();
    turnOnSearch();
    if(!$("#box-modal .modal-content").attr("displayBox")){
        $("#box-1 img").trigger("openModal");
    } else {
        $("#box-modal").modal('show');
    }
}
function enableBoxSearchCallbacks() {
    $('#box-modal').on('shown.bs.modal', () => {
        const searchBox = $("#box-search");
        if (!searchBox.hasClass("d-none")) {
            searchBox.focus();
        }
    });
    $("#search-button").on("click", openSearchBox);
    $("#modal-details").on("click", turnOnSearch);
    $("#modal-search-button").on("click", turnOnSearch);
    $("#box-search").change(() => {
        const search = $("#box-search").val();
        if (Array.from(document.querySelectorAll("#box-list > option")).map(o => o.value).includes(search)) {
            const boxNumber = search.match(/(\d+)/g)[0];
            $("#box-"+boxNumber+" img").trigger("openModal");
        }
    })
}
function turnOnSearch() {
    const searchBox = $("#box-search");
    searchBox.removeClass("d-none");
    searchBox.focus();
    $("#modal-details").addClass("d-none");
}
function turnOffSearch() {
    const searchBox = $("#box-search");
    searchBox.val("");
    searchBox.addClass("d-none");
    $("#modal-details").removeClass("d-none");
}

// Year filters
function enableFilters() {
    $("#filter-radio input").on('change', function() {
        $('#filter-dropdown').val(this.value);
        setFilter(this.value);
    })
    $('#filter-dropdown').on('change', function() {
      $('#filter-radio input[value="' + this.value + '"]').prop('checked', true);
      setFilter(this.value);
    });
    function setFilter(filter) {
        $(".box-container img").removeClass("filtered");
        $(".box-container:not("+filter+") img").addClass("filtered");
    }
}


function createAndAppendElement(parent, tagName, classes="") {
    const newElement = document.createElement(tagName);
    newElement.className = classes;
    parent.appendChild(newElement);
    return newElement
}

function randomPastelColorGenerator(){
  const rand = (min, max) => min + (max - min) * Math.random();
  const h = rand(0, 360),
        s = rand(30, 100),
        l = rand(75, 90);
  return `hsl(${h}, ${s}%, ${l}%)`
}