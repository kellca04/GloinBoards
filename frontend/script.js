const requestScriptPath = './request.js'

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
        <li class="list-group-item" id="entry-${entry.id}">
          <div class="w-90" ondblclick="editItem(${entry.id}, this)">${entry.text}</div>
          <span class="delete-item" onclick="removeEntry(${entry.id}, this)">X</span>
        </li>`
  
    }
  }

  const newTableHtml = `
    <div class="col-md-4">
      <div class="card position-relative">
        <button 
          class="w-auto btn btn-sm btn-primary position-absolute m-2"
          id="table-${table.id}-rm"
          onclick="removeTable(${table.id}, this)"
        >
          <i class="bi bi-trash"></i>
        </button>
        <div class="card-header">
          <h4 contenteditable="true">${table.name}</h4>
        </div>
        <div class="card-body">
          <ul id="table-${table.id}" class="list-group">
            ${entriesHtml}
          </ul>
          <button 
            id="table-${table.id}-add"
            class="btn btn-primary add w-100 text-align-center" 
            onclick="addEntry(${table.id}, this)"
          >
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


function addEntry(table_id, table_element) {

  import(requestScriptPath)
    .then(module => {

      const apiRequests = module.default;

      if (selectedBoard != null) {

        unspecified_id = "UNSPECIFIED-ENTRY-" + Math.floor(Math.random() * 1000).toString();

        const table = $(`#table-${table_id}`)
        table.append(`
          <li class="list-group-item" id="entry-${unspecified_id}">
            <div 
              class="w-90" 
              id="entry-${unspecified_id}-edit">
              New Task
            </div>
            <span 
              class="delete-item" 
              id="entry-${unspecified_id}-rm">
              X
            </span>
          </li>
        `)

        apiRequests.upsertEntry(table_id, "New Task")
          .then(new_entry => {

            entry_element = $(`#entry-${unspecified_id}`);
            entry_element.attr("id", `entry-${new_entry.id}`);

            edit_entry = $(`#entry-${unspecified_id}-edit`);
            edit_entry.attr("id", "");
            edit_entry.attr("ondblclick", `editItem(${new_entry.id}, this)`)

            rm_entry = $(`#entry-${unspecified_id}-rm`);
            rm_entry.attr("id", "");
            rm_entry.attr("onclick", `removeEntry(${new_entry.id}, this)`)

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
  
}


function addTable() {

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

            new_ul = $(`#table-${unspecified_id}`);
            new_ul.attr("id", `table-${new_table.id}`);

            delete_button = $(`#table-${unspecified_id}-rm`);
            delete_button.attr("id", `table-${new_table.id}-rm`);
            delete_button.attr("onclick", `removeTable(${new_table.id}, this)`)

            add_button = $(`#table-${unspecified_id}-add`);
            add_button.attr("id", `table-${new_table.id}-add`);
            add_button.attr("onclick", `addEntry(${new_table.id}, this)`)

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

      $(element).parents('.col-md-4').remove();

      if (selectedBoard != null) {
        apiRequests.deleteTable(tableId)
          .catch(error => {
            console.error('Error deleting table:', error);
          });
      }

    })
    .catch(error => {
      console.error('Failed to load module:', error);
    });

}


function removeEntry(entryId, element) {

  import(requestScriptPath)
    .then(module => {

      const apiRequests = module.default;

      $(element).parents('.list-group-item').remove();

      if (selectedBoard != null) {
        apiRequests.deleteEntry(entryId)
          .catch(error => {
            console.error('Error deleting entry:', error);
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
