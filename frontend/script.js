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

    addTableElement(table);

  }

  generateAddTableButton();

}


function addTableElement(table) {

  var entriesHtml = '';

  if (table.entries) {

    for (entry of table.entries) {

      entriesHtml += `
        <li class="list-group-item">
          <div class="w-90" ondblclick="editItem(${entry.id}, this)">${entry.text}</div>
          <span class="delete-item" onclick="deleteItem(${entry.id})">X</span>
        </li>`
  
    }
  }

  const newTableHtml = `
    <div class="col-md-4">
      <div class="card position-relative">
        <button 
          class="w-auto btn btn-sm btn-primary position-absolute m-2"
          id="${table.id}-rm"
          onclick="removeTable(${table.id}, this)"
        >
          <i class="bi bi-trash"></i>
        </button>
        <div class="card-header">
          <h4 contenteditable="true">${table.name}</h4>
        </div>
        <div class="card-body">
          <ul id="${table.id}" class="list-group">
            ${entriesHtml}
          </ul>
          <button class="btn btn-primary add w-100 text-align-center">
            <h5 class="my-auto">
              <i class="mt-1 bi bi-plus-circle"></i>
            </h5>
          </button>
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

  generateAddTableButton();

}


function generateAddTableButton() {

  if ($("#addTable").length > 0) {
    $("#addTable").remove();
  }

  addTableButton = `
    <div class="col-md-4" id="addTable">
      <div class="card position-relative" id="addTableCard">
        <button class="btn btn-primary btn-lg w-100 h-100 mb-0" onclick="addTable()">
          <h2 class="my-auto">
            <i class="bi bi-plus-circle"></i>
          <h2>
        </button>
      </div>
    </div>`

  $(".row").append(addTableButton);
  
  console.log("Add button generated");
}


function addTable(element) {

  import(requestScriptPath)
    .then(module => {

      const apiRequests = module.default;

      if (selectedBoard != null) {

        unspecified_id = "UNSPECIFIED-" + Math.floor(Math.random() * 1000).toString();

        addTableElement({
          "id": unspecified_id,
          "name": "New Table",
          "entries": null,
        })

        apiRequests.upsertTable(selectedBoard.id, "New Table")
          .then(new_table => {

            new_ul = $(`#${unspecified_id}`);
            new_ul.attr("id", new_table.id);

            delete_button = $(`#${unspecified_id}-rm`);
            delete_button.attr("id", new_table.id);
            delete_button.attr("onclick", `removeTable(${new_table.id}, this)`)

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
