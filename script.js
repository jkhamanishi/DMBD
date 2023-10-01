$( document ).ready( function() {
    // On document load
    loadWall();
});

function loadWall() {
    fetch('data/DMBD_DATA.csv')
    .then(response => response.text())
    .then(csv_data => csvToObject(csv_data))
    .then(box_data => {
        console.log(box_data[0])
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
};

// Box pixel size in portrait orientation
const BOX_WIDTH = 72;
const BOX_HEIGHT = BOX_WIDTH*(4/3);

function createBox(box) {
    box.details = "Box #"+box.box_number+": "+box.name+" ("+box.year+")";
    const wall = document.getElementById("wall");
    const boxContainer = createAndAppendElement(wall, "div", "box-container");
    boxContainer.id = "box-" + box.box_number;
    const boxDetailsContainer = createAndAppendElement(boxContainer, "div", "box-details-container bg-primary");
    const boxImage = createAndAppendElement(boxDetailsContainer, "img", "box-image");
    boxImage.src = "data/images/box_previews/box (" + box.box_number + ").jpg";
    if (box.wall_orientation == "portrait") {
        boxContainer.style.width = BOX_WIDTH + "px";
        boxContainer.style.height = BOX_HEIGHT + "px";
        boxContainer.style.gridColumn = box.column + " / span 6";
        boxImage.width = BOX_WIDTH;
        boxImage.height = BOX_HEIGHT;
    } else if (box.wall_orientation == "landscape") {
        boxContainer.style.width = BOX_HEIGHT + "px";
        boxContainer.style.height = BOX_WIDTH + "px";
        boxContainer.style.gridColumn = box.column + " / span 8";
        boxImage.width = BOX_HEIGHT;
        boxImage.height = BOX_WIDTH;
    } else {
        throw new Error("Box " + box.box_number + " has an wall invalid orientation: " + box.wall_orientation);
    }
    boxContainer.style.gridRow = - box.row;  // row 1 is at the bottom

    const boxDetails = document.createElement("p");
    boxDetails.className = "box-details text-light mb-0";
    boxDetails.innerText = box.details;
    $(boxContainer).hover(function() {
        boxDetailsContainer.appendChild(boxDetails);
    }, function() {
        boxDetailsContainer.removeChild(boxDetails);
    });

}

function createAndAppendElement(parent, tagName, classes) {
    const newElement = document.createElement(tagName);
    newElement.className = classes;
    parent.appendChild(newElement);
    return newElement
}