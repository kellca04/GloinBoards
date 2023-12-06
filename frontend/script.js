const requestScriptPath = '/request.js'

var boards = null;
var selectedBoard = null;
var tables = null;


// Initialize list of all boards for current user
import(requestScriptPath)
  .then(module => {
    const apiRequests = module.default;
    const userEmail = "grunet01@luther.edu" //change later to use oauth

    apiRequests.getBoardsByEmail(userEmail)
      .then(allBoards => {
        boards = allBoards;
        setCurrentBoard(allBoards[0].id);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });

  })
  .catch(error => {
    console.error('Failed to load module:', error);
  });



function setCurrentBoard(boardId) {

  selectedBoard = boards.find(function (b) {
    return b.id == boardId;
  });

  updateAndRenderTables();

}


function updateAndRenderTables() {

  import(requestScriptPath)
    .then(module => {

      const apiRequests = module.default;

      if (selectedBoard != null) {
        apiRequests.getTablesByBoardId(selectedBoard.id)
          .then(allTables => {

            tables = allTables;
            renderBoard();

          })
          .catch(error => {
            console.error('Error fetching data:', error);
          });
      }

    })
    .catch(error => {
      console.error('Failed to load module:', error);
    });

}


function renderBoard() {
  
  $('.row').empty();

  for (table of tables) {

    var entriesHtml = '';

    for (entry of table.entries) {

      entriesHtml += `
        <li class="list-group-item">
          <div class="w-90" ondblclick="editItem(${entry.id}, this)">${entry.text}</div>
          <span class="delete-item" onclick="deleteItem(${entry.id})">X</span>
        </li>`

    }

    const newTableHtml = `
      <div class="col-md-4">
        <div class="card">
          <div class="card-header">
            <h2 contenteditable="true">${table.name}</h2>
          </div>
          <div class="card-body">
            <button class="btn btn-primary add">Add Element</button>
            <button class="btn btn-danger delete-table" onclick="removeTable(${table.id}, this)">Delete Table</button>
            <ul id="${table.id}" class="list-group">
              ${entriesHtml}
            </ul>
          </div>
        </div>
      </div>`;

    $('.row').append(newTableHtml);
    
    const newDrake = dragula([...document.getElementsByClassName('list-group')]);

    newDrake.on('drag', (el, source) => {
      el.classList.add('list-group-item', 'placeholder');
      if (el.innerText === '') {
        el.innerText = '';
      }
    });

    newDrake.on('dragend', (el) => {
      el.classList.remove('placeholder');
      if (el.innerText === '') {
        el.innerText = 'New Element...';
      }
    });

  }

}


function addTable(element) {

  import(requestScriptPath)
    .then(module => {

      const apiRequests = module.default;

      if (selectedBoard != null) {
        apiRequests.upsertTable(selectedBoard.id, "New Table")
          .then(_ => {

            updateAndRenderTables();

          })
          .catch(error => {
            console.error('Error adding table:', error);
          });
      }

    })
    .catch(error => {
      console.error('Failed to load module:', error);
    });

}


function removeTable(tableId, element) {

  import(requestScriptPath)
    .then(module => {

      const apiRequests = module.default;

      if (selectedBoard != null) {
        apiRequests.deleteTable(tableId)
          .then(_ => {

            $(element).parents('.col-md-4').remove();

          })
          .catch(error => {
            console.error('Error deleting table:', error);
          });
      }

    })
    .catch(error => {
      console.error('Failed to load module:', error);
    });

}



function editItem(entryId, element) {
  const listItem = $(element).eq(0);
  const originalText = listItem.text().trim();

  listItem.attr('contenteditable', 'true');
  listItem.focus();

  listItem.off('blur').on('blur', function () {
    const trimmedText = $(this).text().trim();

    if (trimmedText === 'X') {
      listItem.remove();
    } else if (trimmedText === originalText && originalText === 'New Element...') {
      listItem.text('New Element...');
    }
  });
}

$(document).ready(() => {

  const drake = dragula([document.getElementById('table1')]);

  drake.on('drag', (el, source) => {
    el.classList.add('list-group-item', 'placeholder');
    if (el.innerText === 'New Element...') {
      el.innerText = '';
    }
  });

  drake.on('dragend', (el) => {
    el.classList.remove('placeholder');
    if (el.innerText === '') {
      el.innerText = 'New Element...';
    }
  });

});
