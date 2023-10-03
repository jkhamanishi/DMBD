$( document ).ready( function() {
    // On document load
    loadWall();
    enablePanAndZoom();
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
    const boxDetailsContainer = createAndAppendElement(boxContainer, "div", "box-details-container bg-primary");
    const boxImage = createImage();
    const boxDetails = createDetails();
    setModalTrigger()

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
    function setModalTrigger() {
        $(boxImage).on("openModal", () => {
            $("#modal-details").text(box.details.replace(/\n/gm, " "));
            const img = document.querySelector("#box-modal img");
            img.src = "data/images/box_previews/box (" + box.box_number + ").jpg";
            img.style.transform = (box.orientation != box.wall_orientation) ? "rotate(-90deg) scale(calc(3/4))" : "";
            new Promise( resolve => {
                img.onload = img.onerror = resolve;
            }).then( () => {
                $("#box-modal").modal('show');
                setMaxHeight();
                img.src = "data/images/boxes/box (" + box.box_number + ").jpg";
            });
            setLeftAndRightButtons();
        });
        function setMaxHeight() {
            const content = $("#box-modal .modal-content");
            content.css("--box-ratio", 4/3);
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
}

function createAndAppendElement(parent, tagName, classes) {
    const newElement = document.createElement(tagName);
    newElement.className = classes;
    parent.appendChild(newElement);
    return newElement
}