// Global counter for unique seat IDs.
let seatIdCounter = 0;

// Attach event listeners to buttons.
document.getElementById('shuffleBtn').addEventListener('click', generateSeating);
document.getElementById('screenshotBtn').addEventListener('click', takeScreenshot);

// Show/hide custom layout options based on selection.
document.getElementById('layoutSelect').addEventListener('change', function() {
  const customOptions = document.getElementById('customOptions');
  if (this.value === 'custom') {
    customOptions.style.display = 'block';
  } else {
    customOptions.style.display = 'none';
  }
});

/**
 * Generates the seating layout based on the magister’s input.
 */
function generateSeating() {
  const seatingContainer = document.getElementById('seatingContainer');
  seatingContainer.innerHTML = ''; // Clear any previous seating.
  seatingContainer.style.justifyContent = 'center';
  
  // Get raw input and convert newlines to commas.
  const rawInput = document.getElementById('namesInput').value;
  const sanitizedInput = rawInput.replace(/[\r\n]+/g, ',');
  let names = sanitizedInput.split(',')
                .map(name => name.trim())
                .filter(name => name !== '');
  
  // Shuffle the names (socialis misce).
  names = shuffleArray(names);
  
  let nameIndex = 0;
  let totalSeats = 0;
  
  // Determine layout.
  const layout = document.getElementById('layoutSelect').value;
  
  if (layout === 'layout1') {
    // Layout 1: Two blocks (left and right), each 2 columns x 6 rows = 12 sedes each.
    seatingContainer.style.display = 'flex';
    seatingContainer.style.flexWrap = 'nowrap';
    
    const leftBlock = document.createElement('div');
    leftBlock.classList.add('seating-block');
    leftBlock.style.gridTemplateColumns = 'repeat(2, auto)';
    nameIndex = createGrid(leftBlock, 6, 2, names, 12, nameIndex);
    seatingContainer.appendChild(leftBlock);
    
    const rightBlock = document.createElement('div');
    rightBlock.classList.add('seating-block');
    rightBlock.style.gridTemplateColumns = 'repeat(2, auto)';
    nameIndex = createGrid(rightBlock, 6, 2, names, 12, nameIndex);
    seatingContainer.appendChild(rightBlock);
    
    totalSeats = 24;
    
  } else if (layout === 'layout2') {
    // Layout 2: Tres partes: Sinistra (2x3), Media (3x4), Dextra (2x3) = 6 + 12 + 6 = 24 sedes.
    seatingContainer.style.display = 'flex';
    seatingContainer.style.flexWrap = 'nowrap';
    
    const leftBlock = document.createElement('div');
    leftBlock.classList.add('seating-block');
    leftBlock.style.gridTemplateColumns = 'repeat(2, auto)';
    nameIndex = createGrid(leftBlock, 3, 2, names, 6, nameIndex);
    seatingContainer.appendChild(leftBlock);
    
    const centerBlock = document.createElement('div');
    centerBlock.classList.add('seating-block');
    centerBlock.style.gridTemplateColumns = 'repeat(3, auto)';
    nameIndex = createGrid(centerBlock, 4, 3, names, 12, nameIndex);
    seatingContainer.appendChild(centerBlock);
    
    const rightBlock = document.createElement('div');
    rightBlock.classList.add('seating-block');
    rightBlock.style.gridTemplateColumns = 'repeat(2, auto)';
    nameIndex = createGrid(rightBlock, 3, 2, names, 6, nameIndex);
    seatingContainer.appendChild(rightBlock);
    
    totalSeats = 24;
    
  } else if (layout === 'layout3') {
    // Layout 3: Tres columnas; each column has 8 sedes (8 + 8 + 8 = 24 sedes).
    seatingContainer.style.display = 'flex';
    seatingContainer.style.flexWrap = 'nowrap';
    for (let i = 0; i < 3; i++) {
      const colBlock = document.createElement('div');
      colBlock.classList.add('seating-block');
      colBlock.style.gridTemplateColumns = 'repeat(1, auto)';
      nameIndex = createGrid(colBlock, 8, 1, names, 8, nameIndex);
      seatingContainer.appendChild(colBlock);
    }
    totalSeats = 24;
    
  } else if (layout === 'custom') {
    // Custom layout: use teacher-specified rows and columns.
    const rows = parseInt(document.getElementById('customRows').value);
    const cols = parseInt(document.getElementById('customCols').value);
    totalSeats = rows * cols;
    seatingContainer.style.display = 'grid';
    seatingContainer.style.gridTemplateColumns = `repeat(${cols}, auto)`;
    seatingContainer.style.gridGap = '10px';
    nameIndex = createGrid(seatingContainer, rows, cols, names, totalSeats, nameIndex);
  }
  
  // If there are more nomina than sedes, show a warning.
  const warningMessage = document.getElementById('warningMessage');
  if (names.length > totalSeats) {
    warningMessage.textContent = `Monitio: Plus nomina (${names.length}) quam sedes (${totalSeats}).`;
  } else {
    warningMessage.textContent = '';
  }
}

/**
 * Creates a grid (or block) of sedes.
 * @param {HTMLElement} container - The element where sedes are placed.
 * @param {number} rows - Number of ordinibus.
 * @param {number} cols - Number of columnis.
 * @param {Array} names - Array of nomina.
 * @param {number} totalSeats - Total number of sedes to create.
 * @param {number} startIndex - Starting index for names.
 * @returns {number} The updated name index.
 */
function createGrid(container, rows, cols, names, totalSeats, startIndex) {
  container.style.display = 'grid';
  container.style.gridTemplateColumns = `repeat(${cols}, auto)`;
  container.style.gridGap = '10px';
  
  let nameIndex = startIndex;
  
  for (let i = 0; i < totalSeats; i++) {
    const seat = document.createElement('div');
    seat.classList.add('seat');
    seat.setAttribute('draggable', 'true');
    seat.id = 'seat-' + (seatIdCounter++);
    
    // Assign a name if available; otherwise, leave the sede empty.
    if (nameIndex < names.length) {
      seat.textContent = names[nameIndex];
      nameIndex++;
    } else {
      seat.textContent = '';
    }
    
    // Attach drag-and-drop events.
    seat.addEventListener('dragstart', dragStart);
    seat.addEventListener('dragover', dragOver);
    seat.addEventListener('drop', drop);
    
    container.appendChild(seat);
  }
  return nameIndex;
}

// -- Drag and Drop Functions --
let draggedSeatId = null;

function dragStart(e) {
  draggedSeatId = this.id;
  e.dataTransfer.effectAllowed = "move";
}

function dragOver(e) {
  e.preventDefault(); // Allow dropping.
  e.dataTransfer.dropEffect = "move";
}

function drop(e) {
  e.preventDefault();
  const sourceSeat = document.getElementById(draggedSeatId);
  // Swap the nomina (text) between seats.
  const temp = this.textContent;
  this.textContent = sourceSeat.textContent;
  sourceSeat.textContent = temp;
}

// -- Utility: Fisher-Yates Shuffle --
function shuffleArray(array) {
  let currentIndex = array.length, randomIndex;
  
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
}

// -- Screenshot functionality using html2canvas --
function takeScreenshot() {
  const seatingContainer = document.getElementById('seatingContainer');
  html2canvas(seatingContainer).then(canvas => {
    const link = document.createElement('a');
    link.download = 'sedes_arrangmentum.png';
    link.href = canvas.toDataURL();
    link.click();
  });
}
