const requestScriptPath = './request.js'

var boards = null;
var selectedBoard = null;
var tables = null;


initialize()


function initialize() {
  import(requestScriptPath)
    .then(module => {
      const apiRequests = module.default;
      const userEmail = sessionStorage.getItem('userEmail')

      apiRequests.getBoardsByEmail(userEmail)
        .then(allBoards => {

          let menu = document.querySelector('#selectBoard')
          menu.innerHTML = ""

          if (allBoards.error) { 
            allBoards = [];
            menu.hidden = true;
          } else {
            menu.hidden = false;
          }

          boards = allBoards;

          const lastBoardId = localStorage.getItem('currentBoard');
          var useLastBoard = false;

          allBoards.map( (b, i) => {
              let opt = document.createElement("option");
              opt.value = b.id;
              opt.innerHTML = b.name;

              if (b.id === lastBoardId) {
                useLastBoard = true;
                opt.selected = true;
              }

              menu.append(opt);
          });

          if (allBoards.length > 0) {
            setCurrentBoard(useLastBoard ? lastBoardId : allBoards[0].id);
          }

        })
        .catch(error => {
          console.error('Error fetching data:', error);
        });

    })
    .catch(error => {
      console.error('Failed to load module:', error);
    });
}


function setCurrentBoard(boardId) {

  localStorage.setItem('currentBoard', boardId); 

  selectedBoard = boards.find(function (b) {
    return b.id == boardId;
  });

  updateAndRenderTables();

}


function addUserToCurrentBoard(email) {

  import(requestScriptPath)
    .then(module => {

      const apiRequests = module.default;

      if (selectedBoard != null) {
        apiRequests.addUserEmail(selectedBoard.id, email)
          .catch(error => {
            console.error('Error fetching data:', error);
          });
      }

    })
    .catch(error => {
      console.error('Failed to load module:', error);
    });

}


function addBoardWithCurrentEmail(name) {

  import(requestScriptPath)
    .then(module => {

      const apiRequests = module.default;

      apiRequests.upsertBoard(name)
        .then(_ => {
          initialize()
        })
        .catch(error => {
          console.error('Error adding board:', error);
        });

    })
    .catch(error => {
      console.error('Failed to load module:', error);
    });

}


function updateAndRenderTables() {

  import(requestScriptPath)
    .then(module => {

      const apiRequests = module.default;

      if (selectedBoard != null) {
        apiRequests.getTablesByBoardId(selectedBoard.id)
          .then(allTables => {

            allTables.sort((a,b) => a.id - b.id);
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

    var sortedEntries = []

    for (id of table.order) {
      for (entry of table.entries) {
        if (entry.id === id) {
          sortedEntries.push(entry);
        }
      }
    }

    for (entry of sortedEntries) {

      entriesHtml += `
        <li class="list-group-item p-3" id="entry-${entry.id}">
          <div 
            class="w-90 p-2" 
            ondblclick="editEntry(${entry.id}, this)" 
            spellcheck="false">
            ${entry.text}
          </div>
          <span 
            class="delete-item p-1" 
            onclick="removeEntry(${entry.id}, this)">
            X
          </span>
        </li>`
  
    }
  }

  const newTableHtml = `
    <div class="col-md-4">
      <div class="card position-relative">
        <button 
          class="w-auto btn btn-sm btn-primary position-absolute m-1"
          id="table-${table.id}-rm"
          onclick="removeTable(${table.id}, this)"
        >
          <i class="bi bi-trash"></i>
        </button>
        <div class="card-header d-flex justify-content-center">
          <h4 
            id="table-${table.id}-hdr"
            ondblclick="editTable(${table.id}, this)" 
            class="w-75">
            ${table.name}
          </h4>
        </div>
        <div class="card-body">
          <ul id="table-${table.id}" class="list-group">
            ${entriesHtml}
          </ul>
          <button 
            id="table-${table.id}-add"
            class="btn btn-success add w-100 m-0 py-3 text-align-center" 
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
  });

  newDrake.on('dragend', (el) => {
    el.classList.remove('placeholder');

    element = $(el)

    element_id = element.attr('id');
    entry_id = element_id.split("-")[1];

    table_element_id = $(element).parent().attr('id');
    table_id = table_element_id.split("-")[1];

    const parent = el.parentNode
    const position = Array.prototype.indexOf.call(parent.children, el);
    
    moveEntry(entry_id, table_id, position);

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
          <li class="list-group-item p-3" id="entry-${unspecified_id}">
            <div 
              class="w-90 p-2" 
              id="entry-${unspecified_id}-edit"
              spellcheck="false">
              New Task
            </div>
            <span 
              class="delete-item p-1" 
              id="entry-${unspecified_id}-rm">
              X
            </span>
          </li>
        `)

        apiRequests.upsertEntry("New Task", table_id)
          .then(new_entry => {

            entry_element = $(`#entry-${unspecified_id}`);
            entry_element.attr("id", `entry-${new_entry.id}`);

            edit_entry = $(`#entry-${unspecified_id}-edit`);
            edit_entry.attr("id", "");
            edit_entry.attr("ondblclick", `editEntry(${new_entry.id}, this)`)

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


function moveEntry(entryId, tableId, position) {

  import(requestScriptPath)
        .then(module => {

          const apiRequests = module.default;

          apiRequests.moveEntryToTable(entryId, tableId, position)
            .catch(error => {
              console.error('Error moving entry:', error);
            });

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
        <button class="btn btn-success btn-lg w-100 h-100 mb-0 mx-0" onclick="addTable()">
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

        apiRequests.upsertTable("New Table", selectedBoard.id)
          .then(new_table => {

            new_ul = $(`#table-${unspecified_id}`);
            new_ul.attr("id", `table-${new_table.id}`);

            delete_button = $(`#table-${unspecified_id}-rm`);
            delete_button.attr("id", `table-${new_table.id}-rm`);
            delete_button.attr("onclick", `removeTable(${new_table.id}, this)`);

            table_header = $(`#table-${unspecified_id}-hdr`);
            table_header.attr("id", `table-${new_table.id}-hdr`);
            table_header.attr("ondblclick", `editTable(${new_table.id}, this)`)

            add_button = $(`#table-${unspecified_id}-add`);
            add_button.attr("id", `table-${new_table.id}-add`);
            add_button.attr("onclick", `addEntry(${new_table.id}, this)`);

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


function editEntry(entryId, element) {
  const listItem = $(element);
  const originalText = listItem.text();

  listItem.attr('contenteditable', 'true');
  listItem.focus();

  listItem.off('blur').on('blur', function () {

    const parent = listItem.parent();
    const newText = listItem.text();

    listItem.attr('contenteditable', 'false');

    if (parent.find("div").length == 0 || !newText) {

      removeEntry(entryId, listItem);

    } else if (newText !== originalText){

      import(requestScriptPath)
        .then(module => {

          const apiRequests = module.default;

          if (selectedBoard != null) {
            apiRequests.upsertEntry(newText, null, entryId)
              .catch(error => {
                console.error('Error updating entry:', error);
              });
          }

        })
        .catch(error => {
          console.error('Failed to load module:', error);
        });

    }

  });

}

function editTable(tableId, element) {

  const tableHeading = $(element);
  const originalText = tableHeading.text();

  tableHeading.attr('contenteditable', 'true');
  tableHeading.focus();

  tableHeading.off('blur').on('blur', function () {

    const newText = tableHeading.text();

    tableHeading.attr('contenteditable', 'false');

    if (!newText) {

      removeTable(tableId, tableHeading.parents('.card'))

    } else if (newText !== originalText) {

      import(requestScriptPath)
        .then(module => {

          const apiRequests = module.default;

          if (selectedBoard != null) {
            apiRequests.upsertTable(newText, null, tableId)
              .catch(error => {
                console.error('Error updating table:', error);
              });
          }

        })
        .catch(error => {
          console.error('Failed to load module:', error);
        });

    }

  });

}
