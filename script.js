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

const SIZE = 72;

function createBox(box) {
    const wall = document.getElementById("wall");
    const boxContainer = createAndAppendElement(wall, "div", "box-container");
    boxContainer.id = "box-" + box.box_number;
    boxContainer.style.width = (box.wall_orientation == "portrait" ? SIZE : SIZE*(4/3)) + "px";
    const gridWidth = box.wall_orientation == "portrait" ? 6 : 8;
    boxContainer.style.gridColumn = box.column + " / span " + gridWidth;
    boxContainer.style.gridRow = - box.row;  // row 1 is at the bottom
    const boxImage = createAndAppendElement(boxContainer, "img", "box-image");
    boxImage.src = "../data/images/box_previews/box (" + box.box_number + ").jpg";
}

function createAndAppendElement(parent, tagName, classes) {
    const newElement = document.createElement(tagName);
    newElement.className = classes;
    parent.appendChild(newElement);
    return newElement
}